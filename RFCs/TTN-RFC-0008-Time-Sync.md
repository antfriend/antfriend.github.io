# TTN-RFC-0008: Fleet Time-Sync — Timestamp Push, TTDB Logging, and Skew Verification

**Version:** 1.0
**Status:** Implemented — on-device verified 2026-06-22 (PLAN.md Phase 2.5)
**RFC Number:** 0008
**Project:** robot_team
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0007 (Reliable Delivery), TTN-RFC-0001 (Core Semantic Mesh), TTDB-RFC-0001 (File Format), `toot_network_architecture.md` §3 (toot frame)
**Author:** antfriend
**Created:** 2026-06-22

This RFC specifies how the laptop orchestrator establishes a **shared wall clock**
across the 3-node fleet (laptop + V4-A bridge + K10 percept) without an RTC or NTP
on any device. The laptop pushes a timestamp into the mesh; every node adopts it as
a clock offset and **appends a log record to its own TTDB**; the laptop then pulls
all three TTDBs to confirm the event is recorded everywhere and runs an **NTP-lite
probe** to measure each node's residual clock skew. It is `PLAN.md` Phase 2.5.

The "node writes its own TTDB at runtime" and "laptop pushes a command into the
mesh" capabilities here are firsts for the project — down-payments on Phase 5 (CMD
injection) and Phase 6 (node TTDB re-authoring).

---

## 1. Clock model (no RTC, no NTP)

Each node has only `millis()` — a `uint32_t` ms counter from boot, wrapping at
~49.7 days. "Wall clock" is synthesized:

```
gClockOffsetMs : int64_t      // Unix-epoch ms minus local millis() at adoption
nowEpochMs()  := (int64_t)millis() + gClockOffsetMs
```

A node is **unsynced** until it receives a `TIME_SYNC`; `nowEpochMs()` before that
is meaningless and MUST NOT be logged as wall time. After adoption the node's wall
clock tracks real time minus the one-way delivery delay of the `TIME_SYNC` frame —
that residual is what §6 measures rather than assumes. `millis()` wrap (≥49 days
uptime) invalidates the offset; a node SHOULD re-sync before then. The laptop is the
sole time source and is by definition skew-zero.

---

## 2. New toot types

Three types extend `toot::Type` (and the mirror in `companion.py`). Per project
convention they are defined here before code depends on them.

| Type | Value | Direction | Purpose |
|---|---|---|---|
| `TIME_SYNC` | 9  | laptop → fleet (broadcast) | set the clock; every hearing node adopts + logs |
| `TIME_REQ`  | 10 | laptop → one node | "report your epoch now" (skew probe) |
| `TIME_RESP` | 11 | node → laptop | the probed node's current epoch |

### 2.1 `TIME_SYNC` payload (12 B)
```
 off  field      bytes  notes
   0  sync_id    4      u32 LE — monotonic event id chosen by the laptop
   4  epoch_ms   8      u64 LE — laptop Unix wall clock (ms) sampled at send
```
Sent with `FLAG_WANT_ACK` (TTN-RFC-0007). It is **broadcast** — the toot frame has
no destination field, and broadcast is desirable here so all nodes adopt from as
close to the same instant as the topology allows. Every node that verifies the HMAC
adopts the offset and appends its TTDB record (§4). The V4-A bridge adopts it as it
injects the frame into ESP-NOW for the K10, so the bridge and the leaf both log it.

### 2.2 `TIME_REQ` payload (8 B)
```
   0  probe_id        4   u32 LE — unique per probe, echoed in the response
   4  target_node_id  4   u32 LE — only this node answers (cf. TtdbShare target)
```
Sent with `FLAG_WANT_ACK` is **not** required: the `TIME_RESP` *is* the
acknowledgement, and a missing response simply makes the laptop reissue the probe.

### 2.3 `TIME_RESP` payload (12 B)
```
   0  probe_id      4   u32 LE — echoes the TIME_REQ
   4  node_epoch_ms 8   u64 LE — nowEpochMs() sampled the instant the reply is built
```
Routed node → laptop; the V4-A bridges it up to USB-CDC like any upward toot
(it already forwards `TTDB_DATA`/`BELIEF`/`PERCEPT`/`ACK` — `TIME_RESP` joins that
set in `onEspNowRecv`).

---

## 3. Adoption timing (precision rule)

To minimize the gap between the frame's `epoch_ms` and the local clock reading, a
node MUST sample `millis()` in the **receive callback**, the instant the frame
arrives, and compute `gClockOffsetMs = epoch_ms − recv_ms` there. The heavier work —
appending the TTDB record (a flash write + re-index) — is deferred to `loop()`,
carrying the stashed `(sync_id, epoch_ms, recv_ms)` (the same defer-to-`loop()`
discipline Phase 1b established for TTDB replies). The `ACK` (TTN-RFC-0007) is
emitted for *every* received copy of the `want_ack` frame (idempotent).

### 3.1 Exactly-once is gated on `sync_id`, not on transport dedup
A node adopts the offset and appends the log record **only when
`sync_id > gLastAdoptedSyncId`**, then advances `gLastAdoptedSyncId`. This is the
exactly-once guarantee, and it MUST NOT rely on `(src, seq)` dedup, for two reasons:

1. **The bridge self-adopts over the un-deduped USB-CDC link.** The V4-A receives
   `TIME_SYNC` from the laptop over serial, which is deliberately *not* deduped
   (companion.md §6, so the laptop can retry). A retransmitted `TIME_SYNC` would
   otherwise make the bridge adopt and append a second time. The `sync_id` gate
   makes self-adoption correct on the trusted link as well as the radio path.
2. **The dedup ring is bounded** (64–128 entries) and may evict an old `(src,seq)`;
   the monotonic `sync_id` gate survives eviction where the ring would not.

The radio re-ACK rule (TTN-RFC-0007 §5) still applies on top: a dedup-dropped
`TIME_SYNC` is re-ACKed without reaching adoption at all. The `sync_id` gate is the
backstop that also covers the bridge's serial path.

---

## 4. The TTDB log record

On adoption a node appends one record to its on-flash `ttdb.md`, then re-indexes so
the new bytes are both reasoned over and served on the next pull. Two file-format
constraints (from the live K10 TTDB header) shape the format:

- `timestamp_kind: unix` → record-header `created:`/`updated:` are Unix **seconds**.
  Millisecond precision lives in the body.
- `TtdbRecord` lat/lon are `int16_t` → the coordinate cannot be the raw `sync_id`
  (a `u32`). The sync log occupies a reserved lane **`lat 99`**, and the lon is a
  small monotonic index `n` = (count of existing `lat 99` records at append time),
  keeping each coordinate unique so `collision_policy: reject` is satisfied. The
  real `sync_id` lives in the body.

Record template (note the leading `---` separator and blank lines, per
TTDB-RFC-0001):

```
---

@LAT99LON<n> | created:<T_sec> | updated:<T_sec> | relates:logs@LAT0LON0

**SYNC** id:<sync_id> t_ms:<epoch_ms> recv_ms:<recv_ms> offset_ms:<gClockOffsetMs>
```

`T_sec = epoch_ms / 1000`. The body line is the machine-parsed record: the laptop's
verifier (§6) scans for `**SYNC**` lines and reads `id:` to confirm presence.

### 4.1 `Ttdb::appendRecord(text, len)`
A new method on the streaming reader (`TTDB.h`):
1. Open `path_` on `*fs_` in append mode, write `text`, close.
2. Re-run the index: `begin(*fs_, path_)` rescans header offsets and refreshes
   `file_size_`, `record_count_`, and the coordinate index.
   `fs_`/`path_` are already retained as members, so no new state is needed.

Appends are rare (one per sync) so the rescan cost and flash wear are negligible.
The method MUST keep the file a valid TTDB (well-formed separator + header line) so
a subsequent cold boot re-indexes it identically.

### 4.2 Laptop master record
The laptop is the third "node." `companion.py sync` appends the **same** event to a
master TTDB file, `master/orchestrator-sync.md`, in its own `lat 99` lane (laptop
`offset_ms` = 0, `recv_ms` = its own send time). This makes "all three carry the
record" literally checkable, the laptop included.

---

## 5. `companion.py sync`

```
python companion.py sync --port COM6 [--expect k10_1,v4a_bridge]
```
1. Choose `sync_id` (monotonic; e.g. last-id+1 persisted in `master/`) and
   `epoch_ms = now`.
2. Append the laptop master record (§4.2).
3. Broadcast `TIME_SYNC(sync_id, epoch_ms)` through the bridge port with
   `FLAG_WANT_ACK`, tracking an **expected-responder set** = `--expect` nodes.
   Retransmit per TTN-RFC-0007 (`RTO0` 500 ms via bridge, ×2 backoff, `N=4`),
   clearing each responder as its `ACK` arrives (the ACK header `src_node_id`
   identifies who). Report any responder still unacked after `N` as **unsynced**.

A broadcast `want_ack` is the one place TTN-RFC-0007's outstanding table is keyed by
*expected responder* rather than a single peer; §5 of that RFC's per-`(src,seq)`
matching still holds per responder.

---

## 6. `companion.py verify` — the two assertions

```
python companion.py verify --port COM6 --sync-id N [--nodes k10_1,v4a_bridge] [--bound-ms 50]
```

**Assertion A — has the record.** `pull` each node's TTDB (K10 through the bridge,
V4-A locally; both already work) and parse for a `**SYNC** id:N` line; confirm the
laptop master has it too. Pass = the record is present in all three.

**Assertion B — in sync (NTP-lite).** For each node, run `K` probes (default 5) and
keep the **minimum-RTT** sample (standard NTP best-sample selection):

```
t0          := laptop_now_ms()
send TIME_REQ(probe_id, node)
node_epoch  := (from TIME_RESP)
t1          := laptop_now_ms()
rtt         := t1 - t0
skew        := node_epoch - (t0 + rtt/2)     # node ahead(+) / behind(-) laptop
```

Report a table `node | has_record | skew_ms | rtt_ms`. Pass = `|skew|` ≤ `--bound-ms`
(default 50) for every node. The claim is **"in sync to within |skew| ms, ±rtt/2
measurement uncertainty"** — measured, not assumed, which is the whole point of
choosing NTP-lite over broadcast-and-assume.

> Skew interpretation: a node adopts wall time lagging real time by the one-way
> `TIME_SYNC` delivery delay, so a small **negative** skew (node behind laptop) is
> expected and benign. A large or positive skew indicates a missed/!late adoption —
> caught here, not hidden.

---

## 7. Reliability dependency

`TIME_SYNC` rides TTN-RFC-0007: it is `want_ack`, so the laptop knows each node
**adopted the epoch and wrote its record** before it runs Assertion B. Without that
layer a dropped `TIME_SYNC` (≈1/6 bridged frames today) would silently desync one
node; with it, the node is reported unsynced and the sync is retried. The re-ACK
rule (TTN-RFC-0007 §5) is what guarantees a retransmitted `TIME_SYNC` does not append
a **second** log record — adoption and append are exactly-once, the ACK idempotent.

---

## 8. Test plan (Definition of Done for PLAN.md Phase 2.5)

1. **Cold fleet:** with K10 + V4-A unsynced, one `companion.py sync` returns all
   expected responders ACKed.
2. **Record present everywhere:** `verify --sync-id N` Assertion A passes — K10,
   V4-A, and `master/orchestrator-sync.md` each carry `**SYNC** id:N`.
3. **Exactly once under retransmit:** induce ACK loss on the first `TIME_SYNC`
   (TTN-RFC-0007 test hook); confirm the node logs the record **once** despite the
   retransmit, and Assertion A still finds exactly one `id:N` record.
4. **In sync:** Assertion B reports `|skew|` ≤ 50 ms for both K10 and V4-A over the
   min-RTT sample; the table is printed.
5. **Reboot persistence:** power-cycle the K10, `pull` again — the `id:N` record
   survives (it is on flash, not RAM), proving the append+re-index is durable.

Done when 1–5 pass against the K10 + V4-A on hand. Then update companion.md §2
(fleet status) and §6 (next action).

---

## 9. Relationship to other RFCs

- **TTN-RFC-0007** is the prerequisite; build it first (`PLAN.md` Phase 2).
- **TTN-RFC-0001** §5 "append-only records preferred / all assertions must include
  provenance": the sync log is append-only and each record names its `sync_id`,
  `recv_ms`, and `offset_ms` provenance.
- **TTDB-RFC-0001 / -0004** govern the record format and the `collision_policy`
  this RFC honors with the `lat 99` / monotonic-lon lane.
- This is the first runtime writer of an A32 node's TTDB; the Dream Cycle
  (TTDB-RFC-0007, Phase 6) is the eventual general re-authoring path, of which this
  single-record append is the minimal first instance.
