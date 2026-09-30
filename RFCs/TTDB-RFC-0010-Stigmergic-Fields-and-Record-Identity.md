# TTDB-RFC-0010: Stigmergic Fields, Lane Discipline, and Stable Record Identity

**Version:** 0.2
**Status:** Draft. §4 (record identity) is **DECIDED, implemented, and running on
hardware: `@LAT91` is the first lane to write a `sid`, hardware-verified 2026-08-09**
(stage 2, §7.2 — same ids across two boots and two lane rewrites, recomputed on the
laptop from the key alone). **§5–§6 are no longer hypothetical: `@LAT101` — the SOCIAL
field — is the fleet's first FIELD lane, built and hardware-verified on both handhelds
the same day** (stage 3, §7.2). The lane register (§3) is a classification of what
exists and is normative on adoption.
**Changes in 0.2 (2026-08-09):** §4.2 rewritten around a measurement over the 78 archived
TTDBs (§4.2.5) that **falsified v0.1's proposed hash input**; identity split into EVENT and
KEY kinds (§4.2.1) with a per-lane register (§4.2.7); uniqueness scoped to `(node_id, lane)`
rather than the corpus (§4.2.3); and v0.1's *"perturb the discriminator and retry"*
**withdrawn** as self-defeating (§4.2.4).
**RFC Number:** 0010
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0003 (Typed Edges),
TTDB-RFC-0004 (Event ID and Collision), TTDB-RFC-0005 (TBEW)
**Relates to:** TTN-RFC-0011 (Semantic Positioning), TTDB-RFC-0007 (Dream Cycle)
**Companion design document:** `stigmergy.md` (the exploratory half; this is the
normative half — the same pairing `ttn-semantic-positioning.md` has with TTN-RFC-0011)
**Author:** antfriend
**Created:** 2026-08-07

This RFC defines two memory disciplines for a TTDB — **append-only evidence** and
**decaying fields** — requires every lane to declare which one it is, and specifies the
record identity that makes reclamation safe.

---

## 1. Motivation

A TTDB lane today is implicitly *append-only evidence with a cap*: records accumulate,
the lane fills, the node stops perceiving, and an operator empties the whole lane. The
emptying is honest — TTDB-RFC-0004 §4 forbids reusing an id for a different record, so a
boundary record is written to say the ordinals were re-pointed — but it is **bounded**: on
the reference fleet the boundary lane itself reached 28 of 32 on 2026-08-07, with no prune
path of its own. At that cap the node can no longer clear its percept lanes at all.

Stigmergy (Grassé 1959) supplies the alternative discipline. A trace that persists in a
shared medium, is **reinforced** when re-observed and **decays** when not, needs no
operator and no boundary: the space of a trace nobody is reinforcing returns by itself.
Decay is not housekeeping — it is the computation, because it is what turns an
accumulating log into a gradient a reader can evaluate locally.

Both disciplines are legitimate. Mixing them silently is not: a decaying medium **rewrites
history by design**, which is the one thing this corpus's provenance machinery exists to
prevent. Hence the requirement that every lane declare its class.

### 1.1 Why this is corpus-wide and not a per-node feature

A record does not stay on the node that wrote it. It is pulled by `TTDB_REQ`/`TTDB_DATA`,
pushed as a belief by `TTDB_PUT` (TTN-RFC-0009), consolidated into the laptop's master
copy, and re-read months later by a parser that has no idea which sketch emitted it.

So the class of a record MUST be determinable **from the file**, by a reader that knows
only this RFC. A discipline that lives in one sketch's comments is not a discipline; it is
a habit, and the reader who has to guess will guess that a faded trace is an absent one.

---

## 2. Record classes (normative)

Every record belongs to exactly one class.

**EVIDENCE** — an observation. Append-only. MUST NOT be reclaimed in place. MAY be the
target of any edge. MAY be pruned wholesale, and such a prune MUST leave a PROVENANCE
boundary (§7.4).

**FIELD** — a trace. MAY be reclaimed in place under §5. MUST NOT be the target of a
`derived_from`-class edge (§6.2). MUST NOT be the source of a measured constant (§6.1).

**PROVENANCE** — an account of the store itself: what it once held, which timeline it was
on, what a boundary replaced. Append-only, and MUST NOT be reclaimed under §5 by any
mechanism, including its own.

> **Fail-safe rule.** A reader that cannot determine a record's class MUST treat it as
> EVIDENCE. Guessing FIELD would license discarding an observation; guessing EVIDENCE only
> licenses keeping a trace too long.

Class is declared per lane in `mmpdb` (§7.1), not per record: a lane whose records disagree
about their own mutability cannot be reasoned about at all.

---

## 3. The lane register (normative on adoption)

The reference fleet's complete lane allocation, classified. `cap` is the firmware constant
that bounds the lane today; `prune` is the operation that can empty it.

| Lane | Content | Class | Cap | Prune path |
|---|---|---|---|---|
| `lat < 90` | Node/place records: identity, `**POSITION**` beliefs, the globe | EVIDENCE | — | none (revised by Dream Cycle, never dropped) |
| `@LAT90` | Timeline changes: `STREAM-ORIGIN`/`ADOPTED`/`RECONCILED`/`ANCHORED`, `REMAP` | **PROVENANCE** | 16 | `--lane 90` (`pruneTimeline`) |
| `@LAT91` | `LINK-STABLE` beliefs, one per `(peer, proto)`, with `[ew]` | EVIDENCE | — | none |
| `@LAT92` | `OUTCOME` tallies — the testimony `@LAT91` is folded from | EVIDENCE | 24 | `--lane 92` (`pruneOutcomes`) |
| `@LAT93` | `TRANSITION` pairs (`before`/`after` motion halves) | EVIDENCE | — | none |
| `@LAT94` | Acoustic windows + loudest-transient timestamps | EVIDENCE | 48 | `--lane 94`/`0` |
| `@LAT95` | Motion windows, change-triggered with run-length | EVIDENCE | 48 | `--lane 95`/`0` |
| `@LAT96` | Entity (WiFi BSSID) windows — the Jaccard baseline | EVIDENCE | 48 | `--lane 96`/`0` |
| `@LAT97` | Link windows, per-peer RSSI histograms | EVIDENCE | 48 | `--lane 97`/`0` |
| `@LAT98` | `BELIEF-ADOPTED` attestations (TTN-RFC-0009) | **PROVENANCE** | — | none — guard refuses |
| `@LAT99` | Time-sync log (TTN-RFC-0008) | **PROVENANCE** | — | none — guard refuses |
| `@LAT100` | `LANE-PRUNED` boundaries (lane generations) | **PROVENANCE** | 32 | **none, and this is the binding constraint** |
| `@LAT101` | SOCIAL field: one `**PEER**` co-presence trace per peer (stage 3, 2026-08-09) | **FIELD** | 8 (`SOCIAL_MAX_PEERS`) | **none, by design — §5.3 reclaims in RAM; `lanegen::prune` already refuses ≥98** |
| `@LAT102+` | *unallocated* (`@LAT102` is reserved by `default-network.md` §3 for ATTRIBUTED testimony) | — | — | — |

Three consequences worth stating plainly:

1. **`@LAT101` is the fleet's first and only FIELD lane** (stage 3, 2026-08-09 — the
   register above was all evidence and provenance before it). Everything in §5 is in use
   there and nowhere else.
2. **The first FIELD lane had to be a new lane at `@LAT101` or above** — and it was. It
   MUST NOT have been an existing lane converted in place: the archived records in
   `master/` were written under EVIDENCE rules and reclassifying a lane retroactively
   reclassifies them too.
   ⚠ `@LAT89` and below is unavailable regardless — `isNodeRecord()` bounds navigation to
   `lat > -90 && lat < 90`, so a lane there renders as *a place on the globe*.
3. **`@LAT100` is provenance about provenance, and it has no prune path by design.** Its
   cap is therefore a lifetime budget, not a working set. Any proposal that consumes it
   faster is a proposal to shorten the fleet's life. A `@LAT101` reclamation spends
   **none of it** — under KEY naming there is nothing to re-point (§5.3).

---

## 4. Identity: names that survive reclamation

### 4.1 The rule the corpus already had

TTDB-RFC-0004 is unambiguous on both halves of this:

- §2: *"When location is unavailable, coordinates MAY be derived from a stable hash."*
- §4: *"Once assigned, an ID MUST NOT change for the same record."*

The percept lanes take neither option. They name a record by **its ordinal position in its
lane** (`lane_n` → `@LAT97LON3`), so emptying a lane reassigns every name in it to a
different record. `@LAT100` was introduced to make that legible — *a prune writes down the
boundary it creates* — and it works, but it is a **workaround for declining a mechanism
TTDB-RFC-0004 already sanctioned.** Stable-hash naming is not a new invention here; it is
the option the percept lanes did not take.

### 4.2 Stable ids (normative) — **DECIDED 2026-08-09, by measurement**

A record in a lane that MAY be reclaimed (any FIELD lane, and any EVIDENCE lane whose
implementation chooses §7.3 over boundaries) MUST carry a stable id:

```
@LAT97LON3 | sid:a1b2c3d4 | created:… | updated:… | relates:…
```

- `sid` is 8 lowercase hex digits: **FNV-1a, 32-bit**, over the canonical preimage in
  §4.2.2. It MUST be computable on-node in integer arithmetic, and MUST NOT include the
  record's ordinal.
- **The coordinate remains the address; `sid` is the identity.** Keeping `@LATxLONy` means
  TTCP-RFC-0002 navigation, `isNodeRecord()`, the globes, and every existing index keep
  working unchanged. Replacing the coordinate with a hash would be a larger and worse
  change.
- A reader holding nothing but the file MUST be able to **recompute and verify** a `sid`.
  This is the property everything else here is in service of, and §4.2.4 exists to protect
  it.

#### 4.2.1 Two identity kinds (normative)

Every lane MUST declare its identity kind. This axis is **independent of §2's memory
class** — no lane's class predicts its identity kind, and conflating them breaks a
different thing in each direction.

**EVENT** — an observation. It happened once, at an instant, and its content never
changes afterwards. Its identity includes the timestamp **and a digest of the record
body**.

**KEY** — a standing row about a subject, revised or reinforced over time. Its identity is
the subject's **natural key** and MUST include neither the timestamp nor the body, because
both change while TTDB-RFC-0004 §4 requires the id not to.

> ⚠ **Body-in on a KEY lane forks a belief's identity on every revision**, so every
> citation to it dangles the moment Rule 3 folds one more outcome — and a FIELD trace
> would get a new name on every reinforcement, which is the opposite of what §5 needs.
> **Body-out on an EVENT lane is the 8.1 % measured in §4.2.5.**

#### 4.2.2 Canonical preimage (normative)

Fixed-width lowercase hex, `|`-separated, built without `printf`: no format-string
portability question, no locale, no endianness, and cheap on a node.

```
EVENT : hex8(node_id) | hex4(lane) | hex8(stream) | hex16(t_ms) | hex8(body_digest)
KEY   : hex8(node_id) | hex4(lane) | <natural key bytes, verbatim>
```

- `body_digest` is FNV-1a over **every byte after the record's header line**. Excluding the
  header is what makes this non-circular (the `sid` lives *in* the header) and is also how
  §4.2's "MUST NOT include the ordinal" is satisfied — the ordinal appears nowhere else.
- `lane` is written as the two's-complement `hex4` of its `int16`, so a negative lane is
  still deterministic.
- The natural key MUST be canonically rendered by the lane's owner and MUST be **streamed**
  into the hash, never staged through a fixed buffer: silently truncating a long key merges
  two subjects into one identity, which is the failure this section exists to prevent.

**Reference implementation:** `firmware/libraries/TTDB/src/Sid.{h,cpp}` (portable, no
Arduino dependency) with `tests/test_sid.cpp`. ⚠ The same eight vectors are computed by
`scripts/sid_probe.py --vectors` and asserted on **both** sides. A divergence between a
node's arithmetic and the laptop's is silent and total — every citation would resolve
`stale` against a perfectly good record — so it is pinned in two languages deliberately.

#### 4.2.3 Uniqueness domain (normative)

**A `sid` is unique within `(node_id, lane)`. It is NOT corpus-unique and MUST NOT be
treated as such.** Measured birthday risk at 32 bits: `2.6e-7` at a lane's 48-record cap,
`7.6e-6` at a node's 256-record file budget, `5.2e-3` over the present 6 672-record
archive, and **`0.69` at 100 000 records**. The consolidated corpus grows without bound,
so the right response is to **scope the claim, not widen the hash** — and the scope is
free, because a citation already carries the coordinate.

⚠ Any cross-node index MUST key on `(node_id, lane, sid)`.

⚠ **On `stream:0x00000000` — a node with no stream — EVENT identity degrades to "unique
within a boot",** because that timestamp is bare local `millis()` and restarts. This is the
same limitation CLAUDE.md already records for that value ("comparable with nothing but that
node's own records"); it turns out not to be comparable with itself across a reboot either.
Two records on such a node with identical bodies at the same restarted instant are
genuinely indistinguishable, and §4.2.4 says what to do about it.

#### 4.2.4 Collision: refuse, do NOT perturb (normative — **this reverses v0.1**)

Version 0.1 of this RFC said to *"perturb the discriminator and retry, bounded"*. **That is
withdrawn.** It is self-defeating: a perturbed `sid` is not recomputable from the record, so
a reader could no longer distinguish "perturbed on write" from "the lane was pruned under
this citation" — destroying §4.2's verification property, which is the entire thing being
bought. At `2.6e-7` per lane, refusing is affordable.

- **EVENT:** two records agreeing on node, lane, stream, `t_ms` **and** body digest are the
  same observation written twice. Implementations MUST **duplicate-suppress and count**,
  never overwrite and never perturb. Measured rate in the archive: **2 in 6 683 (0.03 %)**,
  both on `synced:0` records with byte-identical bodies — i.e. every occurrence was a real
  duplicate, not a hash failure.
- **KEY:** a collision means two different natural keys hashed to one id. That is a
  lane-design error, not a runtime event. Implementations MUST refuse the write and report
  it **loudly**; the fix is the lane's key, not a retry.

#### 4.2.5 The measurement this decision rests on

`scripts/sid_probe.py`, run over all 78 archived TTDBs in `master/` (6 683 records in lanes
≥ 90) on 2026-08-09. §8's falsifier 3 required the hash input to be measured rather than
re-guessed; it was, and **v0.1's proposed input failed**.

| Lane | records | `(lane, stream, t_ms)` | **+ body digest** |
|---|---|---|---|
| `@LAT90` | 274 | 0 (0.0 %) | 0 |
| `@LAT91` | 131 | **109 (83.2 %)** | 0 |
| `@LAT92` | 544 | 15 (2.8 %) | 0 |
| `@LAT93` | 25 | 0 (0.0 %) | 0 |
| `@LAT94` | 1157 | 50 (4.3 %) | 0 |
| `@LAT95` | 954 | 49 (5.1 %) | 2 (0.2 %) |
| `@LAT96` | 1412 | **142 (10.1 %)** | 0 |
| `@LAT97` | 1920 | 88 (4.6 %) | 0 |
| `@LAT99` | 67 | 0 (0.0 %) | 0 |
| `@LAT100` | 199 | **85 (42.7 %)** | 0 |
| **TOTAL** | **6683** | **538 (8.1 %)** | **2 (0.03 %)** |

These are **input** collisions — two different records with the same name — not hash
collisions. No width fixes them. The distribution is fully explained, and each cluster
argues for a different part of the decision:

- **`@LAT91` at 83.2 %** — `LINK-STABLE`, one belief per `(peer, proto)`, several written
  in one fold pass and *revised* thereafter. Its identity is a key, not a moment. A further
  **62 records in the archive carry no `t_ms` at all** (28 `LINK-STABLE`, 25
  `BELIEF-ADOPTED`, 9 `BELIEF-PUSH`), so for those lanes KEY identity is not a preference —
  there is no timestamp to hash.
- **`@LAT100` at 42.7 %** — one prune of lanes 94–97 writes four boundary markers at one
  instant. Identity is `(generation, lane)`.
- **`@LAT94/95/96/97/92`** — *every* collision is on `synced:0` or `stream:0x00000000`,
  i.e. §4.2.3's restarted clock.
- **`@LAT90/93/99` at 0.0 %** — already uniquely named by time; they need only the digest
  for integrity, not for uniqueness.

Hash quality was measured separately: **0 true 32-bit collisions in 6 672 distinct ids**,
and 9 cases of the same record appearing in two archived pulls receiving the **same** `sid`
— the stability across a re-pull that makes citations resolvable at all.

#### 4.2.6 Adoption cost: one literal per builder

Every record builder in the reference fleet renders its header **first** and its body
after, into one fixed buffer, so a body digest cannot be known when the header is written.
The resolution is not to restructure eleven builders. A builder renders the literal
placeholder `sid:00000000` in its header and calls `sid::stampEvent()` / `sid::stampKey()`,
which locates the header line, digests everything after it, and **patches the eight hex
characters in place**.

⚠ The patch is bounded to the **header line** deliberately: a body may legitimately contain
the text `sid:` — a boundary record quoting a pruned record's id is the obvious case — and
patching that instead would corrupt provenance while appearing to work. This is the same
needle-collision family as `prev_stream:` inside `stream:` and `**COVERED-SPAN**` inside
`**COVERED**`, and it is the fourth member; it is tested for rather than commented about.

So stage 2 costs each builder **one added literal and one call**, and no extra buffer —
which matters on a node whose largest record builder already holds 2 624 bytes.

#### 4.2.7 Identity-kind register (normative on adoption)

| Lane | Memory class (§2) | **Identity kind** | Natural key (KEY lanes only) |
|---|---|---|---|
| `@LAT90` | PROVENANCE | EVENT | — |
| `@LAT91` | EVIDENCE | **KEY** | `peer:0x%08lx\|proto:%s` |
| `@LAT92` | EVIDENCE | EVENT | — |
| `@LAT93` | EVIDENCE | EVENT | — |
| `@LAT94`–`@LAT97` | EVIDENCE | EVENT | — |
| `@LAT98` | PROVENANCE | **KEY** | `src:0x%08lx\|target:@LAT%dLON%d` |
| `@LAT99` | PROVENANCE | EVENT | — |
| `@LAT100` | PROVENANCE | **KEY** | `gen:%u\|lane:%u` |
| `@LAT101` SOCIAL | FIELD | **KEY** | `node:0x%08lx` — FULL width; every 1-byte squeeze of this fleet's ids collides (stage 3, 2026-08-09) |
| future FIELD lanes | FIELD | **KEY** | the field's own key (a trace must survive reinforcement) |
| `-1` `@BELIEF:POSITION` | EVIDENCE | **KEY** | `node:0x%08lx` — laptop-authored |
| `-2` `@BELIEF:PROXIMITY` | EVIDENCE | **KEY** | `pair:0x%08lx\|0x%08lx\|proto:%s`, ids **sorted ascending** |

⚠ **The last two rows are LAPTOP-AUTHORED and live in no numbered node lane** (added
2026-08-11 for `ttn-semantic-positioning.md` Draft 0.3 §2.4, which requires them to be
KEY because SP4 revises a position belief continuously). §4.2.3 scopes uniqueness to
`(node_id, lane)`, so they need both: the author is `ORCHESTRATOR_ID` (`0x00000001`) and
the lane is **negative** — a namespace provably disjoint from every node lane, all of
which are `>= 0`. This is not a special case bolted on: §4.2.2 already renders `lane` as
the two's-complement `hex4` of an `int16` *"so a negative lane is still deterministic"*.

⚠ **`@BELIEF:PROXIMITY`'s pair MUST be sorted by node id before hashing.** Proximity is
symmetric, so `(a,b)` and `(b,a)` are one subject; without the sort a change in the
consolidator's iteration order silently renames every pair belief in the file. `proto` is
part of the key on `@LAT91`'s precedent — an espnow and a BLE belief about the same pair
are two standing rows, not one.

⚠ **A subject whose id is unknown gets NO sid, never a guessed one** (§4.2.4's
refuse-don't-perturb, applied to authoring): the property being bought is that a reader
holding only the file can recompute the id, and an id derived from a name the reader
cannot map is not recomputable.

Note that **every FIELD lane is necessarily KEY**: §5.2 reinforcement updates a trace in
place, and a trace whose name changed when it was reinforced would be a new trace.

### 4.3 Citations (normative)

TTDB-RFC-0003 §1 requires edges to use the syntax declared in `mmpdb.typed_edges.syntax` —
a **per-file declaration**, so this is an extension of an existing hook, not a format
break. A file using stable ids declares:

```yaml
typed_edges:
  enabled: true
  syntax: "type@LATxLONy[#sid]"
```

- A citation MAY carry `#sid`: `derived_from@LAT97LON3#a1b2c3d4`.
- ⚠ **A `#sid` that does not match the record now at that coordinate MUST resolve as
  `stale`, never as the record found there.** This is the whole point: the failure
  `@LAT100` exists to make detectable becomes detectable *per citation, by a reader holding
  nothing but the file*, with no boundary record and no lane-generation arithmetic.
- ⚠ **Both forms are permanently live.** A bare `type@LATxLONy` MUST remain valid and MUST
  be resolved under the existing `@LAT100` generation discipline. The corpus contains
  archived records that will never have a `sid`; a reader that requires one folds every
  pre-adoption lane silently. *This is the same rule that keeps `synced:` parsing beside
  `stream:`/`wall:`, for the same reason.*

---

## 5. Decay and reinforcement (normative, FIELD lanes only)

A FIELD record carries a strength and the terms needed to age it:

```
**TRACE** sid:a1b2c3d4 … strength:180 half_life_ms:600000 reinforced:9 last_ms:8260961
  stream:0xe334a7e1 wall:0
```

1. **Decay MUST be evaluated on read and MUST NOT be written.** The stored pair is
   `(strength, last_ms)`; the effective value is computed when the record is read. A
   design that re-writes decayed strengths would append to flash on a timer — the flash
   write is 60–220 ms on the reference hardware and the wear is unbounded. **Only
   reinforcement writes.**
2. **Reinforcement** updates `strength`, `reinforced`, and `last_ms` in one appended
   record; `reinforced` is the run-length count and MUST state what it folded, exactly as
   the `**RUN**`/`**COVERED**` forms do.
3. **Reclamation:** when a FIELD lane is full, the record with the lowest *decayed*
   strength is replaced. Ties resolve to the oldest `last_ms`. A reclamation MUST NOT write
   a `@LAT100` boundary — under §4.2 naming there is nothing to re-point, and spending the
   boundary budget per reclamation would be strictly worse than the treadmill it replaces.
4. ⚠ **The stream clock is a ratchet.** A stream's clock is elapsed-since-its-own-origin
   and adopts the fastest crystal it hears, which is correct for ordering and recency and
   **wrong for measuring a duration**. A half-life is a duration. Therefore: a node MUST
   compute decay from a *local* `millis()` delta (as `MotionPercept`'s `dt_ms` does) and
   MUST use the stream stamp only to decide whether a peer's trace is comparable at all. A
   trace stamped `stream:0x00000000`, or with a stream this node cannot relate to its own,
   has **unknown age** and MUST NOT be treated as fully decayed.
5. Deposits arriving over the radio MUST be queued from the receive callback and merged
   only from the service path — the rule `TimeStreamNode` follows because `mono()`'s wrap
   accounting cannot survive a torn write.

---

## 6. What MUST NOT be a field

### 6.1 No measured constant may come from a FIELD lane
A threshold, baseline, or published distribution MUST be derived only from EVIDENCE.
A field removes its own data according to a rule correlated with the quantity being
measured, so a distribution over it is not a sample. The reference fleet's baseline
procedure makes this concrete: its gates require one stream id, `t_ms` monotonic, an
independent stillness witness on the same timeline, and ≥30 pairs surviving a cadence
filter. Gates 2 and 4 are unprovable over a medium that evaporates.

### 6.2 No `derived_from` edge may target a FIELD record
An edge must resolve to a record that exists. This is the rule run-length already
established for offsets (`acting:@LAT95LON7+3` may name a folded window; `derived_from`
stays a plain resolvable citation) and it applies with more force to a trace that is
designed to disappear.

### 6.3 A field MUST be an optimisation, never the store of record
**Acceptance test:** the system MUST still be correct with the field **empty**. A node
that has just booted has no traces and MUST behave correctly, if less efficiently. If
emptying a FIELD lane changes an answer rather than a latency, that lane is holding
evidence and is misclassified.

### 6.4 A faded trace MUST render as faded, never as absent
The rendering rule *if a view can show less than all of a record, it must say so on
screen* applies to strength as well as length. A UI that draws only "trail present /
absent" turns "nobody has reinforced this for an hour" into "there is no trail," which is
a different claim.

---

## 7. Adoption

### 7.1 Declaration
A file using this RFC declares its lane classes in `mmpdb`:

```yaml
lane_classes:
  evidence: [0, 91, 92, 93, 94, 95, 96, 97]
  provenance: [90, 98, 99, 100]
  field: [101]
```
Absent declaration, every lane is EVIDENCE (§2 fail-safe).

### 7.2 Staging — each stage is independently abandonable
- ✅ **Stage 0 — classify.** Publish the §3 register. No code, no risk. *Done 2026-08-07.*
- ✅ **Stage 0b — decide the identity (§4).** Measured, decided, and implemented as a
  portable library with cross-language vectors. **Nothing writes a `sid`**, so every
  existing file is untouched and this stage is abandonable by deleting two files.
  *Done 2026-08-09.*
- ✅ **Stage 1 — readers accept `#sid` and ignore it when absent.** *Done 2026-08-09.* Both
  readers: `TtdbParse.{h,cpp}` (`ttdbHeaderSid`, `ttdbResolveCitation`, `TtdbEdge.target_sid`)
  and `companion.py` (`CITATION_RE` gains an optional group, `header_sid`, and
  `stale_citations` resolves by sid in preference to the boundary arithmetic). Tests:
  `tests/test_citation.cpp` (33 checks) and `tests/test_citation_py.py` (15) — both sides,
  because a citation is resolved on whichever one happens to be holding the file.
  ✅ **Regression evidence for "every existing file stays byte-valid": `stale_citations`
  over all 78 archived TTDBs produces a byte-identical result — same SHA-256, same 620
  findings — before and after.** Writers are unchanged, so that is the claim in full.
  🔬 **What the stage bought, concretely.** The pre-existing staleness check needs the
  `@LAT100` lane, the citing record's timestamp, and both being on the same stream — and it
  answers **`unknown`** whenever they are not, which every pre-2026-08-03 record is. A sid
  comparison has no such failure mode: it is decided by the file, per citation, with **no
  boundary record consulted and no `@LAT100` budget spent**. The verdict now carries
  `by: "sid" | "boundary"` so a reader can tell which mechanism answered.
  ⚠ **Three traps this stage walked into, all in the same family.** (1) `stale_citations`
  returned early when there were no `@LAT100` markers — correct while a boundary was the
  only evidence, and wrong the moment a sid can answer without one; it would have made the
  sid path unreachable on exactly the files it helps most. (2) The report printed
  `gen … ended at LON…` unconditionally, which for a sid verdict renders `gen None` — the
  better mechanism looking like a bug in the worse one. (3) `HEADER_SID_RE` must be anchored
  on a delimiter: a word boundary matches *inside* a future `prev_sid:`, which is the
  `prev_stream:` trap for the third time in this corpus.
  ⚠ **"Unverifiable" is a third verdict and must never render as either of the others.** A
  sid-less citation, a sid-less target, or a target in another node's file all report
  **nothing** — not `fresh`, not `stale`. Reporting the archive as broken on adoption day
  would be worse than saying nothing about it.
- ✅ **Stage 2 — one lane writes `sid:`.** *Software done 2026-08-09; HARDWARE-VERIFIED
  the same day.* `@LAT91` LINK-STABLE is the fleet's first lane to carry a stable id, chosen
  first for the two reasons the measurement gave: it is a **KEY-identity** lane (its 83.2 %
  collision rate is what proved identity needs two kinds), and it is the cheapest lane to
  be wrong in — 11 records against no cap. `Reconciler::buildBelief` renders
  `sid:00000000` and calls `sid::stampKey`; `Reconciler::beliefKey` is public so a reader
  can recompute the id rather than trust it. Cost: **Cardputer +764 B flash**, T-Deck
  unchanged, the three 94 %-full V4s **byte-identical**.
  🔬 **§4.2.6's promise held exactly: one literal and one call, no second buffer.** The
  belief record grew 13 bytes inside a 2624 B builder buffer that needed no change.
  ⚠ **The two properties pinned in `tests/test_perceptlearn.cpp` are the ones that make it
  an identity rather than a checksum**: the id **survives a revision** (new conf, new rev,
  new stamp, new `LON` — same name) and **ignores the ordinal**. Get either wrong and every
  citation into this lane silently re-points on the next Dream Cycle, which is the failure
  `@LAT100` exists to make visible.
  🐛 **The first cross-component test immediately found a real defect, and it is the exact
  failure a stable id exists to prevent: the writer wrote an id the reader could not read
  back.** `ttdbHeaderSid` assumed its buffer began at the header line, but every record
  this fleet renders begins `\n---\n\n@LAT…` — so `strchr(line, '\n')` found the newline at
  index 0 and reported "no sid" for a record that carried one. **Both sides were internally
  consistent and individually tested; only a test spanning the two could see it.** Any
  implementation of this RFC MUST test writer and reader against each other, not merely
  each against itself.
  ✅ **Hardware, 2026-08-09 (Cardputer, the only node that can author this lane).** The
  planned "same sid across two Dream Cycles" was unobservable on a quiet bench — run-length
  on `@LAT92` means a still node accrues no new outcomes, so every in-session cycle takes
  the `conf steady` skip path and reprints nothing. The check that IS observable is
  stronger: **across reboots**, where the first dream always takes the changing path (fresh
  fold, full lane rewrite, new stamps, `rev` reset). Two boots produced the same three ids
  — `ab8f77ba` · `ca9b482d` · `2b4da8c8` — for the same `(peer, proto)` keys while the
  TTDB moved 101384 → 101095 B under the rewrite, and the **laptop then recomputed all
  three from `(node, lane, key)` alone** (`sid_probe.sid_key`), digit for digit, never
  having seen the records. That last step is the property this section exists for: a
  reader *verifies* a record's name, it does not trust it.
- ✅ **Stage 3 — the first FIELD lane at `@LAT101`: the SOCIAL field.** *Software done
  2026-08-09, natively tested (153 checks); HARDWARE-VERIFIED the same day on both
  handhelds — see the hardware block at the end of this entry.* One `**PEER**` record per known peer —
  capability masks plus a co-presence trace reinforced by the beacons the node already
  hears. The live medium is the `Social` table in RAM; the lane is its **durable shadow**,
  rewritten only on material change (new peer, capability change, reclaim) behind a 60 s
  minimum gap, plus a 30 min heartbeat that fires only if something was reinforced — so
  §5.1's *only reinforcement writes* holds on flash too, and a node alone in a field
  writes nothing, forever.
  🎯 **The stage-3 falsifier (§8.1) is pre-committed in the lane's structure:** there is
  no prune path — `lanegen::prune` refuses ≥ 98 unchanged, reclamation happens in RAM
  under §5.3 (lowest decayed, ties to oldest) and spends zero `@LAT100`. If operating
  this lane ever requires adding a `--lane 101` clear op, this RFC is abandoned.
  📎 Three design decisions stage 3 recorded:
  (1) **No new wire bytes** — deposits are receptions of the HELLO blocks stage 1 of the
  default network already ships; co-presence is *hearing you*, which is local. (2) **The
  natural key is `node:0x%08lx`**, full width, closing default-network.md §7's question.
  (3) **A reloaded trace is always unknown-age** (§5.4): setup() runs before the stream
  listen window, so reload clamps to `SOCIAL_COPRE_UNKNOWN_AGE` and marks the trace
  (rendered `~`), FADED until actually heard — never trusted fresh, never zeroed. A
  same-stream ageing path was deliberately NOT built, because on these boards it could
  never run — a mechanism that cannot run is the mistake the stage-1 staleness response
  almost was.
  ⚠ **§5.3's reclaim itself is expected to read ZERO on this fleet** (≤5 peers against 8
  slots): like the staleness counter, it is an instrument whose interesting reading is
  zero, and the native suite is where the mechanism is exercised. UNKNOWN capabilities
  survive a reboot as UNKNOWN — a reload must not collapse "never told us" into "absent",
  which is the same rule the live table already enforced, now across a power cycle.
  Cost vs HEAD: Cardputer **+4100 B flash / +592 B RAM** (42 %), T-Deck **+4776 B /
  +608 B** (41 %); the three 94 %-full V4s: **zero content bytes changed** (verified by
  byte-diff — the only differing bytes are the image's two embedded hash fields).
  ✅ **Hardware, 2026-08-09, both handhelds — and the run found two real defects, one of
  them structural and older than this RFC.**
  *What passed:* the Cardputer persisted 4 traces, a T-Deck capability change triggered a
  second rewrite minutes later in the same boot with the **ordinals shuffled and every
  sid identical**, and the T-Deck's own trace entered at **`27cc5401` — the
  exact id the laptop had computed from `(0x300, 101, "node:0x00000200")` before the
  record existed** (a pre-registered prediction, not a post-hoc check). The T-Deck's five
  ids were likewise all recomputed digit-for-digit — ten for ten across two nodes, and
  the SAME subject carries DIFFERENT ids under different observers, which is §4.2.3's
  per-`(node, lane)` scoping demonstrated rather than asserted. After a hard reset, both
  handhelds printed `field: 5 peer trace(s) reloaded … clamped … FADED until heard`, the
  boot fleet table rendered every trace `co:…~` and FADED **before any beacon arrived**,
  UNKNOWN capabilities survived the reboot as UNKNOWN, no boot-storm rewrite occurred —
  and `poseCeiling()` reported `<=translation` from reloaded knowledge alone: the fleet's
  sense of its own shape now survives a power cycle.
  🐛 *Defect 1 (mine, hours old):* sharing one buffer through a `char* rec` alias and
  then measuring `sizeof(rec)` — sizeof(POINTER), 4 — so every builder call refused and
  the first persist wrote nothing. Caught by the `field persisted: 0 trace(s)` line,
  which existed because a lane that silently does nothing is this corpus's least
  favourite failure mode.
  🐛 *Defect 2 (structural, pre-existing):* **the Cardputer's file was legitimately AT
  `TTDB_MAX_RECORDS` (256 — its lane caps sum there), and `appendRecord` past the cap
  wrote the bytes, failed to index them, and returned TRUE.** The records were invisible
  to every reader and the next Dream-Cycle lane rewrite — which copies indexed spans
  only — destroyed them. Silent partial success upstream of every lane this RFC
  classifies. Fixed three ways: `TTDB_MAX_RECORDS` 256 → **288** (+512 B .bss per open
  file; the field lane's 8 slots plus margin — NOT to be raised for any lane that grows
  with uptime), `appendRecord` now counts the block's headers and **refuses before
  writing a byte**, and `persistField` pre-checks the index budget and defers with one
  plain sentence instead of five cryptic failures.
- **Stage 4 — retire that lane's prune.** For `@LAT101` this is pre-satisfied — it was
  BORN without one (see stage 3). The stage stays open for the day a FIELD lane replaces
  an existing pruned lane's function, where "retire" means an operation actually removed.

### 7.3 Cost
Per citation `#sid` is +9 bytes; per record `sid:` is +13. At the reference fleet's 48
records/lane that is ~600 B/lane against a 256-record file budget — cheap in flash, and
**not** cheap in the app partition on a node already at 94% (~74.5 KB free): the three
spine nodes need `huge_app` before they carry any of this. The two handhelds (41%, 40%)
have room.

⚠ **The costing above missed the in-memory index, where the price is 3× worse.** A reader
holds `TtdbRecord records_[TTDB_MAX_RECORDS]` = 256 entries per open file, and the
reference Cardputer holds **three** open files (mesh globe, RFC corpus, feelings
landscape). Adding a `sid` field to that struct takes it 16 → 24 bytes with padding:
**+2 KB per file, +6 KB on a node whose `maxalloc` reads 7–8 KB** and whose memory ceiling
is still unexplained. So:

> **A `sid` MUST NOT be added to a reader's record index.** It is parsed on demand from the
> header line the caller already holds. Only the *edge* struct carries one, because edges
> are parsed into short stack arrays, never into a 256-element index.

Measured cost of stage 1 with that rule applied: **Cardputer +152 B flash / +16 B RAM,
T-Deck +156 B / +0**, and the three 94 %-full spine nodes **byte-identical** — they never
call the edge parser, so they pay nothing at all. Without the rule it would have been
+6 KB of `.bss` on the tightest node in the fleet, for a feature it does not use.

### 7.4 What adoption does NOT change
- A **wholesale** prune of an EVIDENCE lane still writes a `@LAT100` boundary. Stable ids
  make *reclamation* boundary-free; they do not license silent deletion.
- `@LAT98`/`@LAT99` remain unreachable by any prune. The guard is not widened.
- Archived artefacts MUST keep parsing unchanged (§4.3).
- ⚠ No stage may be applied to a node **during a measurement run.** Flashing a filesystem
  image wipes the lanes, and a firmware change mid-run breaks the contiguity the gates test.

---

## 8. Falsifier

Stated before implementation, per the practice this fleet applies to its own measurements:

1. If stage 3 does **not** eliminate the target lane's prune operation, abandon the RFC —
   the treadmill was not the cost that mattered.
2. If a field's decayed choice agrees with the equivalent append-only tally's choice in
   every observed case, the field bought risk and no capability. Report that and stop.
3. ✅ **FIRED, 2026-08-09 — and the RFC was corrected rather than abandoned.** *"If `sid`
   collisions require more than a bounded retry at 48 records/lane, §4.2's hash input is
   wrong and must be measured, not re-guessed."* It was measured (§4.2.5): v0.1's proposed
   input produced **538 input collisions in 6 683 archived records (8.1 %)**, which no
   retry could have absorbed. §4.2 now carries the measured input, and the bounded retry
   this falsifier assumed has itself been withdrawn as self-defeating (§4.2.4).
   ⚠ Worth recording as method, not just as result: the falsifier was written before the
   mechanism, and the thing it caught was **not** the thing it was pointed at. It was aimed
   at hash quality (which turned out to be fine — 0 true collisions in 6 672 ids) and it
   caught a *design* error in what was being hashed. A falsifier stated in advance found a
   fault its author had not imagined; that is the argument for stating them in advance.

---

## 9. Open questions

- ~~The `sid` hash function and discriminator are unspecified pending a measured collision
  rate.~~ ✅ **CLOSED 2026-08-09 — see §4.2.** FNV-1a 32-bit; the input is the canonical
  preimage of §4.2.2 (which adds a **body digest** the first candidate lacked, and splits
  identity into EVENT and KEY kinds the first candidate did not distinguish); the
  discriminator is **withdrawn** in favour of refuse-and-count (§4.2.4). Reference
  implementation and cross-language vectors exist; **no lane writes a `sid` yet** — that
  is stage 2 and is deliberately separate.
- 🆕 **Opened by that decision: `@LAT98`'s natural key is the least certain row in the
  §4.2.7 register.** `BELIEF-ADOPTED` is an attestation about *someone else's* belief, so
  the key proposed there (`src|target`) assumes one attestation per source per target —
  plausible, and unverified, because all 25 archived `BELIEF-ADOPTED` records carry no
  `t_ms` and the lane has never been near a cap. If a source can legitimately re-attest a
  changed belief about the same target, that key is wrong and the lane is EVENT after all.
  Decide it against a real re-attestation, not by inspection.
- Whether a FIELD lane should be shared over the air as deposits (HELLO carries 21 of 250
  bytes today, and an un-reflashed node contributing 0 bytes is already a non-participant
  rather than a parse error) or held per-node and merged only on pull. `stigmergy.md` §4.A
  argues the former for transport trails; this RFC does not decide it. 📎 *Narrowed by
  stage 3 (2026-08-09): the SOCIAL field chose **per-node, merged only on pull** — its
  deposits are receptions of blocks HELLO already carries, so sharing them again would be
  a second copy that can disagree with the first. The question stays open only for a
  field whose deposits are not already on the air.*
- Whether `@LAT100`'s cap should rise. It should not rise as a *response to pressure* —
  the pressure is the signal that the naming is wrong.

End TTDB-RFC-0010
