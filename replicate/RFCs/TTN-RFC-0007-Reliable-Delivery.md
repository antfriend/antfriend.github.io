# TTN-RFC-0007: Reliable Delivery — ACK, Retransmission, and Chunk Reassembly

**Version:** 1.0
**Status:** Implemented — on-device verified 2026-06-22 (PLAN.md Phase 2)
**RFC Number:** 0007
**Project:** robot_team
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0001 (Core Semantic Mesh), `toot_network_architecture.md` §3 (toot frame)
**Author:** antfriend
**Created:** 2026-06-22

This RFC specifies the **reliability layer** for the toot transport: how a sender
obtains end-to-end confirmation that a toot was delivered, how it retransmits when
confirmation is missing, and how a logical toot larger than one ESP-NOW packet is
chunked and reassembled. It pins the semantics of fields the frame already
reserves — `flags bit0 want_ack`, message type `ACK`, and `chunk_idx/chunk_total`
(`toot_network_architecture.md` §3) — so firmware and `companion.py` implement them
identically. It is the prerequisite for any toot that must not be silently lost
(e.g. a `TIME_SYNC` command, TTN-RFC-0008).

---

## 1. Scope and non-goals

In scope: per-toot acknowledgement, timeout-driven retransmission with backoff,
and reassembly of a single logical toot split across `chunk_total` packets.

Out of scope: ordering across distinct `toot_seq` values (toots are independent),
congestion control, and the TTDB **stream** reliability path. The TTDB stream
(`TtdbShare`, TTDB-RFC / `TtdbShare.h`) is **offset-addressed and idempotent** by
design — each `TTDB_DATA` slice carries its own `file_offset`, so loss is repaired
by re-requesting the missing byte range, not by per-slice ACK. This RFC governs
**atomic** toots (CMD, BELIEF, TIME_SYNC, …), not the byte-range stream.

---

## 2. Delivery model

Two independent signals exist; do not conflate them:

1. **Link delivery** — the ESP-NOW per-packet TX-complete callback
   (`toot_network_architecture.md` §3, "Delivery feedback"). It says the radio
   handed the frame to *a* peer; over broadcast it does **not** prove the intended
   node received or accepted it. It is used only to **pace** bursts (see the K10
   `onEspNowSend` gate) — never as proof of delivery.
2. **End-to-end ACK** — an `ACK` toot from the receiving node, emitted only after
   the toot passed HMAC verification and was accepted. This is the authoritative
   delivery confirmation and the only signal that retransmission keys on.

A sender requests an ACK by setting `FLAG_WANT_ACK` (`flags` bit 0). A toot without
`FLAG_WANT_ACK` is fire-and-forget; the receiver MUST NOT ACK it.

---

## 3. The ACK toot

An `ACK` (type 5) confirms a specific `(src, seq, chunk)`. Because the toot header's
`src_node_id`/`toot_seq` identify the *acknowledging* node's own frame, the
reference to the acked toot travels in the **payload**:

```
 offset  field          bytes   notes
 ------  ------------   ------   ----------------------------------------------
   0     ack_src        4        src_node_id of the toot being acknowledged
   4     ack_seq        4        toot_seq of the toot being acknowledged
   8     ack_chunk      1        chunk_idx acknowledged (0 if unchunked)
   9     status         1        0 = ACCEPTED · 1 = REASSEMBLY_PENDING (chunk
                                 stored, awaiting siblings) · 2 = DROPPED_NO_RESRC
```

`payload_len` = 10. The ACK is itself HMAC-signed like any toot. The ACK's header
`src_node_id` is the receiver; `(ack_src, ack_seq)` echo the original sender's key.

A sender matches an inbound ACK against its outstanding table on
`(ack_src == my_node_id, ack_seq, ack_chunk)`. A `status` of `REASSEMBLY_PENDING`
counts as delivery of *that chunk* (stop retransmitting it) but signals the logical
toot is not yet whole.

---

## 4. Retransmission

A sender of a `want_ack` toot records an **outstanding entry** per
`(seq, chunk_idx)` and drives this state machine from `loop()` (never from a recv
or TX callback — scheduling retransmits in a callback starves the WiFi task, the
same hazard that forced "serve replies from `loop()`" in Phase 1b):

- **Timeout** `RTO`: start at a per-transport base and back off ×2 each retry.
  - ESP-NOW, one hop: `RTO0 = 150 ms`.
  - Through the V4-A bridge (laptop ↔ USB ↔ V4-A ↔ air ↔ K10 and the ACK back):
    `RTO0 = 500 ms` — the round trip crosses USB framing plus two air hops.
- **Max attempts** `N = 4` (1 original + 3 retransmits). On exhaustion the toot is
  declared **undelivered** and surfaced to the caller (`companion.py verify` reports
  it; firmware increments a counter). Failure is reported, never hidden.
- **Retransmits reuse the original `(src, seq, chunk_idx)`** unchanged. They MUST
  NOT be re-keyed: the receiver's radio dedup (`§5`) depends on the key being stable
  so a duplicate is recognized as a duplicate.

> `companion.py` already chooses a fresh `toot_seq` *per pull invocation* (so a
> non-reset bridge target doesn't dedup-drop a second pull). That is unchanged: the
> fresh seq is picked once per logical request; the retransmits of that request all
> share it.

---

## 5. Interaction with radio-only dedup (the gotcha)

Dedup is **radio-only** (companion.md §6 decision, 2026-06-20): the ESP-NOW/LoRa
recv path drops a duplicate `(src, seq)` *before* `handleToot`; the trusted USB-CDC
link is not deduped. Retransmission deliberately re-sends the same key, so every
retransmit that actually arrived is a dedup hit on the receiver. Therefore:

- **A dedup-dropped toot that carried `FLAG_WANT_ACK` MUST be re-ACKed.** The
  original ACK was evidently lost (or slower than `RTO`), so the sender retried; if
  the receiver stays silent the retransmits exhaust and a *delivered* toot is
  falsely reported undelivered. On a dedup hit with `want_ack` set the receiver
  re-emits the ACK **without re-processing the body** (re-processing would, e.g.,
  append a second TTDB record). The duplicate frame **self-identifies** — it still
  carries its own `(src, seq, chunk_idx)` — so for an **unchunked** toot the existing
  `DedupSet` (the "seen" memory) is sufficient: regenerate a fresh `ACCEPTED` ACK
  directly from the duplicate's header, no separate ring needed. A **chunked** toot's
  re-ACK MUST instead reflect the reassembly table's current status for that chunk
  (`REASSEMBLY_PENDING` until the set is whole), so chunked reassembly carries the
  recently-acked state. Either way the body is applied exactly once; the ACK is
  idempotent and repeatable.
- Gate this in the radio recv callback alongside the existing dedup check — never in
  the shared `handleToot` dispatch (which the un-deduped USB link also reaches).
- Over USB-CDC there is no dedup and no loss; the node still emits one ACK per
  received `want_ack` toot, and the sender's retransmit timer simply never fires.

This re-ACK rule is the single most important correctness point in this RFC.

---

## 6. Chunking and reassembly

A logical toot whose body exceeds `MAX_BODY` (208 B) is split into
`chunk_total` packets, `chunk_idx` 0…`chunk_total−1`, sharing one `(src, seq)`.
Each chunk is an independently HMAC-signed, independently `want_ack`/ACK'd frame.

- **Reassembly key:** `(src_node_id, toot_seq)`. The receiver allocates a buffer on
  the first-seen chunk of a key, places each chunk's body at
  `chunk_idx × MAX_BODY`, and completes when all `chunk_total` slots are filled.
- **Per-chunk ACK:** each arriving chunk is ACKed individually
  (`status = REASSEMBLY_PENDING` until the set is whole, `ACCEPTED` on the chunk
  that completes it). This lets the sender retransmit only the missing chunks.
- **Bounds (RAM is tight):** at most `MAX_REASSEMBLIES = 2` concurrent keys; a
  partial set is evicted after `REASSEMBLY_TTL = 5 s` with no new chunk, emitting
  `status = DROPPED_NO_RESRC` for any further chunk of an evicted key so the sender
  fails fast rather than retransmitting into a void.
- **Dedup applies per chunk:** a duplicate `(src, seq, chunk_idx)` is dropped but
  re-ACKed per §5.

Chunking and the offset-addressed TTDB stream are distinct mechanisms (see §1):
`chunk_idx/total` carries one atomic toot across packets; `TtdbShare` carries a file
across `file_offset`-addressed slices. Do not chunk a TTDB stream.

---

## 7. Parameters (normative defaults)

| Constant | Value | Where |
|---|---|---|
| `FLAG_WANT_ACK` | `1 << 0` | already in `Toot.h` |
| `RTO0` (ESP-NOW 1 hop) | 150 ms | sender |
| `RTO0` (via V4-A bridge) | 500 ms | sender (`companion.py`) |
| backoff | ×2 per retry | sender |
| `N` max attempts | 4 | sender |
| recently-acked ring | ≥ 32 entries | receiver |
| `MAX_REASSEMBLIES` | 2 | receiver |
| `REASSEMBLY_TTL` | 5 s | receiver |

A sender MAY tune `RTO0`/`N` upward for a long LoRa path (Phase 4); the receiver
constants are fixed by RAM budget.

---

## 8. Test plan (Definition of Done for PLAN.md Phase 2)

1. **Happy path:** a `want_ack` CMD toot laptop → K10 (via bridge) is ACKed once;
   the sender's outstanding entry clears on the first attempt.
2. **Induced ACK loss:** drop the first ACK in the bridge (test hook); confirm the
   sender retransmits, the K10 **dedup-drops the body but re-ACKs** (§5), the record
   is written **exactly once**, and the sender clears on the retried ACK.
3. **Induced toot loss:** drop the first toot; confirm retransmit delivers it within
   `N` attempts and the ACK clears the sender.
4. **Exhaustion:** drop all copies; confirm the sender declares undelivered after
   `N` attempts and reports it (no silent success).
5. **Chunking:** send a >208 B BELIEF toot (3 chunks) under 1-in-3 induced loss;
   confirm per-chunk ACK, retransmit of only the lost chunk, and byte-exact
   reassembly. Cross-check the native test (`tests/`) for the chunk-placement math.

Done when tests 1–5 pass against the K10 + V4-A on hand, matching the PLAN.md
Phase 2 "Done when."

---

## 9. Relationship to other RFCs

- **TTN-RFC-0001** §5 already states "Append-only records preferred" and "all
  assertions must include provenance"; reliable delivery is what lets an append-only
  log on a remote node be trusted to actually contain what the sender sent.
- **TTN-RFC-0008** (Time-Sync, forthcoming) is the first consumer: `TIME_SYNC` is
  sent `want_ack` so the laptop knows each node adopted the epoch before it runs the
  NTP-lite skew probe.
- The radio-only-dedup decision (companion.md §6) is load-bearing here; §5 is the
  rule that makes retransmission and dedup coexist.
