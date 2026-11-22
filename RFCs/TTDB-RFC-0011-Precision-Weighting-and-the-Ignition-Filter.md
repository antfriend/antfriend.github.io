# TTDB-RFC-0011: Precision Weighting and the Ignition Filter
### Signal Precision, Gain-Scaled Belief Update, and a Decaying Workspace — the "Consciousness Filter" for TTDB Agents and the Personal Grimoire

**Version:** 0.1.8
**Status:** Proposed — the stage-2 offline replays PW-1, PW-2 and PW-4 have been run and passed
as pre-registered (§8.1, §8.2). PW-3 has been run and **falsified the broadcast gate as
specified in §6.3** (§8.3). PW-1b, a re-run of PW-1 with `pe_span` re-derived for open
question 6, is **INCONCLUSIVE** as pre-registered and answers that question for acoustic only
(§8.4). Stage 1 (readers) is implemented in `robot_team` with no behaviour change; PW-5, PW-6
and the firmware stages 3–7 have not been run.
The arithmetic (§3–§4) is integer-only and testable offline before any firmware changes
(§9, stage 2). The two lanes it allocates (`@LAT108`, `@LAT109`) are **unwritten**.
**RFC Number:** 0011
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0003 (Typed Edges), TTDB-RFC-0005 (TBEW — `conf`, `sal`, EPS),
TTDB-RFC-0006 (Experiential Perception — the `@PERCEPT:before`/`after` pair is where
prediction error lives), TTDB-RFC-0007 (Dream Cycle — where precision is folded),
TTDB-RFC-0010 (lane classes, KEY identity, FIELD decay rules)
**Relates to:** TTN-RFC-0005 (Trust — caps a peer's claimed precision), TTN-RFC-0011
(Semantic Positioning — §4.2.1's precision bound), TTDB-RFC-0009 (heterogeneity gate — when
precisions may be summed), TTG-RFC-0003 (grimoire beliefs — read-only profile), A32-RFC-0003
(Agent Loop — the update rule replaces fixed `CONF_INCREMENT`/`CONF_DECREMENT`)
**Author:** antfriend (drafted with Claude)
**Created:** 2026-11-22
**License:** CC0-1.0

This RFC adds a second precision to TTDB — the precision of the *signal*, alongside the
existing precision of the *belief* — and defines the filter that decides which prediction
errors update a belief hard, which update it softly, and which few cross into a small,
decaying workspace that the agent, the mesh, or the owner actually attends to.

---

## 1. Abstract

TBEW (TTDB-RFC-0005) gives every record one precision-like quantity, `conf`: how settled the
belief is. Active inference needs two. The **prior precision** says how much the agent trusts
what it already believes; the **likelihood precision** says how much it trusts the channel
now reporting. Their ratio is the gain: reliable evidence against a shaky belief should
rewrite it, and noisy evidence against a settled belief should barely move it. With only
`conf`, TBEW's reference loop (§3.4 there) applies the same fixed increment whichever channel
spoke. That is the gap.

This RFC defines:

1. `prec` — an optional `[ew]` field: likelihood precision of the channel or source that
   produced a record (uint8, default 128). Forward-compatible by TTDB-RFC-0005 §4.1.
2. **Gain-scaled update** — an integer Kalman-style gain `K = 255·π / (π + conf)` that
   replaces fixed confidence steps, including the rule that a contradiction with `K` below
   `k_revise` marks a belief contested **without rewriting its body**.
3. **Precision-weighted prediction error** `ε = pe·π / 255`, and **ignition**: an error that
   clears `θ_ign` enters a bounded workspace of `W` items.
4. Two lanes: `@LAT108` **PRECISION** (EVIDENCE, KEY) — learned `π` per `(node, channel)`,
   folded from residuals during the Dream Cycle; and `@LAT109` **WORKSPACE** (FIELD, KEY) —
   decaying `**AWARE**` traces, the "what is on my mind" set.
5. Three profiles: **A32/fleet** (update rule, broadcast gate, saccade policy),
   **TTN** (received precision capped by local trust), and **grimoire** (read-only: the
   filter selects what to surface and never touches consolidation).

The name **Ignition Filter** credits Stanislas Dehaene's global neuronal workspace, the
work that inspired this RFC (§2.4). "Consciousness filter" is an informal nickname (§2.3).
Nothing here claims that a TTDB agent is conscious. The claim is narrower and testable: that a precision-gated, capacity-
limited, decaying selection over prediction errors improves belief stability and mesh
bandwidth at no cost to answer correctness (§8).

---

## 2. Motivation

### 2.1 One precision is not enough

EPS (`sal × (255 − conf) / 255`) ranks records by *how much the agent leans on a belief it
does not trust*. That is prospective and epistemic: where to look next. It is silent about
the thing that just arrived. A thermistor glitch and a careful human correction currently hit
a belief with the same `CONF_DECREMENT`. The fleet has already met the consequence: TTN-RFC-0011
§4.2.1 had to bolt a precision bound onto positioning because nothing upstream carried one.

### 2.2 The sign trap

EPS rises as `conf` falls. Precision weighting rises as `π` rises. Treat them as the same
quantity and the system attends hardest to its noisiest channel. They are different
quantities with opposite roles, and §3.5 shows they compose rather than compete:
`EPS × π` is expected precision-weighted information gain — EPS says *where* the uncertainty
is, `π` says *whether this channel can resolve it*.

### 2.3 Why "filter"

Three traditions use the word, and this RFC implements only the third:

- **Transmission/filter theory** (James, Bergson, Huxley's "reducing valve"): the brain
  narrows a wider awareness. Metaphysical; not implementable; cited for lineage only.
- **The attention bottleneck** (Broadbent; Baars's global workspace; Dehaene and Changeux's
  global neuronal workspace and its "ignition"): a small, capacity-limited set wins broadcast
  to the rest of the system. §5 borrows the *shape* — threshold, capacity, hysteresis,
  decay — and §2.4 says where it comes from.
- **Precision weighting** (Friston; Feldman & Friston 2010, attention as precision): what
  crosses the bottleneck is what carries high precision-weighted prediction error. §3 is
  this, in integers.

### 2.4 Inspiration and credit: Dehaene's ignition

The name and the central mechanism of this RFC come from **Stanislas Dehaene**'s work, with
Jean-Pierre Changeux, Lionel Naccache, Claire Sergent and colleagues, on the **global
neuronal workspace**. Dehaene, Kerszberg and Changeux (1998) modelled a workspace of
long-range neurons that a representation must enter to be available to the whole system.
The later experimental work (Sergent & Dehaene 2004; Dehaene et al. 2006; Dehaene &
Changeux 2011; Dehaene 2014; Mashour et al. 2020) found the signature this RFC is named
for: **ignition**, a sudden, self-sustaining, all-or-none transition. A stimulus that
crosses it is amplified and broadcast; one that falls short stays local and fades.

Dehaene et al. (2006) gave a testable taxonomy of three states. It maps onto this RFC's
quantities directly, and that mapping is the design:

| Dehaene et al. (2006) | Condition there | Here |
|---|---|---|
| **Subliminal** | bottom-up strength too weak for large-scale reverberation | `ε` below `θ_ign`: updates its belief (§3.4) and is logged, never broadcast |
| **Preconscious** | strong enough, but top-down attention absent or the workspace occupied | `ε ≥ θ_ign`, but `a` is low or `W` is full of stronger traces: eligible, not admitted |
| **Conscious access** | strong and attended: ignition and global broadcast | admitted to `@LAT109`, broadcast as SALIENT (§6.3), steering the next look (§6.5) |

Two more correspondences carry over. Dehaene's taxonomy separates *vigilance* from *access*,
and so does this RFC: the Dream Cycle (§6.6) lowers vigilance (sensory `π = 0`), while `θ_ign`
and `W` govern access. And Dehaene's preconscious buffer can be erased before the workspace
frees up, just as an eligible error here is lost once it decays below `θ_off` before a slot
opens.

**What this RFC borrows and what it does not.** It borrows the functional architecture:
threshold, nonlinearity, capacity, sustained hold, global broadcast. It makes no claim about
neural dynamics, the P3b, or phenomenal experience. Nothing here is endorsed by, or speaks
for, Dehaene or his collaborators. Any error in the analogy is ours.

**The aim: synthesize an Ignition Filter experimentally.** This RFC wants more than a
metaphor. It asks whether the *signatures* Dehaene's group measured in people can be
produced, and measured, in a synthetic system built from integers on a $5 microcontroller
and a plain-text graph. PW-6 (§8) states the test: if the filter ignites, admission to the
workspace should be bimodal and all-or-none as input strength rises smoothly, not graded,
which is what Sergent & Dehaene (2004) found in the attentional blink. A filter that only
sorts is a priority queue. One that ignites is the thing this RFC is named after.

### 2.5 Why now

Three open items in the corpus resolve against one mechanism:

| Open item | Where | What this RFC supplies |
|---|---|---|
| ACT phase is a comment ("prefers actions predicted by high-conf entries") | TTDB-RFC-0005 §3.4; `@LAT20LON3` Learning from Action in the golden store | §6.4: choose the look that maximizes `EPS × π` |
| "Collective EPS: should surprise be shared across nodes?" | TTDB-RFC-0005 §7 Q5 | §6.3: share `ε`, not EPS, and only above `θ_tx` |
| N identical sensors = one sensor with √N confidence | TTX-0004 / TTN-RFC-0011 | §3.6: inverse-variance fusion, *gated by heterogeneity* — the √N is an upper bound, not a gift |

---

## 3. Arithmetic (normative)

All quantities are unsigned integers on the 0–255 TBEW scale unless stated. Intermediate
products MUST be computed in at least 32 bits. Division is truncating.

### 3.1 The `prec` field (written π)

```
@LAT95LON12 | created:1795000000 | updated:1795000000 | relates:observed_by@LAT0LON3
[ew]
conf:96
rev:0
sal:4
touched:1795000000
prec:210
[/ew]
Motion window: 3 transients, run 4.
```

The field is `prec` in files and `π` in formulas, the standard symbol for precision in the
active-inference literature. It is not called `pi` because that collides with 3.14159 for
every reader and shadows `math.pi` in code.

- `prec` — likelihood precision of the channel that produced this record, **at the time it was
  written** (a snapshot; the live value is the channel's `@LAT108` belief, §4).
- Default when absent: `128` (unassessed), matching `conf`'s creation default.
- `prec:0` means *ignore*: the record is kept as evidence and never moves a belief or ignites.
  A held saying in the grimoire (TTG-RFC-0005 §3) is the paradigm case.
- Readers that predate this RFC already ignore it (TTDB-RFC-0005 §4.1). No format break.

### 3.2 Prediction error `pe`

`pe` is how wrong the prediction was, on 0–255. Each channel declares how it computes `pe`;
three forms cover the corpus:

| Form | `pe` | Used by |
|---|---|---|
| **Scalar** | `min(255, |observed − predicted| × 255 / pe_span)`, `pe_span` declared per channel | thermal, acoustic level, RSSI |
| **Set** | Jaccard distance × 255 between predicted and observed sets | entity (BSSID) windows `@LAT96`, the TTX-0004 residual metric |
| **Symbolic** | contradiction: `conf` of the contradicted belief; corroboration: `0`; novel (no prior): `pe_novel` (reference `64`), with the prior's `conf` treated as `0` so `K = 255` | typed-edge assertions, grimoire percepts |

⚠ **Symbolic `pe` is the prior's confidence, not a constant.** Contradicting a belief held at
`conf:40` is a small surprise; contradicting one held at `conf:240` is a large one. A fixed
`pe:255` for every contradiction makes the filter unable to tell a correction from a
coin-flip, which is the defect §2.1 exists to remove.

⚠ **Novelty is not maximal surprise.** A first saying about a new subject is adopted at full
gain (there is nothing to protect) but enters at a modest `pe_novel`, below `θ_ign` at
reference values. Otherwise every new fact ignites and the workspace becomes a feed of
whatever was said last.

In Locus terms (TTDB-RFC-0006 §5.2) `pe` is a property of the **edge** of a
`@PERCEPT:before`/`after` pair: `before` holds the prediction, `after` the observation, and
the delta is the error. An implementation that computes `pe` from an `after` record alone is
not computing a prediction error.

### 3.3 Gain

```
K = (π + conf == 0) ? 128 : (255 × π) / (π + conf)
```

`K` is the fraction (×255) of the error the belief should absorb. `π ≫ conf` → `K → 255`;
`π ≪ conf` → `K → 0`.

### 3.4 Gain-scaled update (replaces fixed steps)

For a record `b` and an incoming observation with `pe`, `π`:

**Corroboration** (`pe < pe_agree`):
```
b.conf += ((255 − b.conf) × π) / 510        // half-rate approach to 255
```

**Contradiction** (`pe ≥ pe_agree`):
```
if K ≥ k_revise:                            // evidence outranks belief
    b.body    = observed
    b.rev     = min(b.rev + 1, 65535)
    b.conf    = π / 2                       // new belief starts at half its founding precision
    b.updated = b.touched = now
else:                                       // belief outranks evidence
    b.conf   -= (b.conf × K) / 255
    b.contradiction_flag = true             // TTDB-RFC-0007 §5.2; body and rev unchanged
    b.touched = now
```

`sal` increments on access exactly as TTDB-RFC-0005 specifies; this RFC does not change it.

⚠ **`rev` remains TBEW's surprise proxy and now means something sharper**: it counts
contradictions that *won*. A belief with low `rev` and a set contradiction flag is one the
agent keeps being told is wrong by sources it does not trust — an abductive trigger in
TTDB-RFC-0005 §2.2's sense, and a candidate for §6.4's active sensing.

### 3.5 Precision-weighted error and expected gain

```
ε = (pe × π) / 255          // retrospective: what just happened that matters
G = (EPS × π) / 255         // prospective: what a look through this channel would buy
```

`ε` drives ignition (§5) and the broadcast gate (§6.3). `G` drives action selection (§6.4).
Neither is stored; both are computed on demand, as EPS is.

### 3.6 Fusion across channels

When `n` channels report on one subject in the same window, the fused precision is

```
π_fused = min(255, Σ πᵢ)       only if the channels pass the heterogeneity gate
π_fused = max(πᵢ)              otherwise
```

and the fused `pe` is the π-weighted mean of the `peᵢ`.

⚠ **Summing precisions assumes independent errors.** Identical sensors in a shared umwelt
fail together: same glare, same RF shadow, same mis-mapped coordinate. TTX-0004's
"√N confidence" is the *independent-error* limit. Summation is licensed by TTDB-RFC-0009
§5.2's standing test — *does this channel change what can be known, or only how
confidently?* — applied per pair: channels of the **same modality class on nodes not shown
heterogeneous by EXP-01** (TTDB-RFC-0009 §5.3) MUST be fused with `max`; channels of
different modality classes, or same-class channels on a mesh EXP-01 has passed, MAY be
summed. A pair that fails contributes the precision of one sensor, not two. This is the same claim TTDB-RFC-0009 makes about
counter-stories, stated for scalars: corroboration from the same umwelt adds volume, not
precision.

---

## 4. Learning `π` — the PRECISION lane `@LAT108`

### 4.1 Class and identity

| Lane | Class (TTDB-RFC-0010 §2) | Identity kind | Natural key |
|---|---|---|---|
| `@LAT108` PRECISION | **EVIDENCE** | **KEY** | `node:0x%08lx\|chan:%s` |

`π` is a measured quantity that sets a gain, so TTDB-RFC-0010 §6.1 forbids deriving it from a
FIELD lane. It is folded from evidence — percept windows `@LAT94`–`@LAT97` and their
`@PERCEPT` pairs — by exactly the pattern `@LAT91` LINK-STABLE uses over `@LAT92` OUTCOME.

### 4.2 Record

```
@LAT108LON2 | created:1795000000 | updated:1795086400 | relates:derived_from@LAT95LON7#a1b2c3d4
[ew]
conf:170
rev:3
sal:22
touched:1795086400
[/ew]
**PRECISION** sid:5e0c19aa node:0xe334a7e1 chan:motion prec:188 var:1904 n:312 prec_scale:8192
  stream:0xe334a7e1 wall:1795086400
```

`var` is the running residual variance on the 0–255 `pe` scale squared; `n` is the count of
residuals folded; `prec_scale` is the channel's declared variance at which `π = 127`.

### 4.3 Fold (Dream Cycle, Phase 1)

For each residual `r` (`pe` of a `@PERCEPT` pair on that channel):

```
var += ((r × r) − var) >> prec_alpha         // EWMA, prec_alpha default 4
prec = (255 × prec_scale) / (prec_scale + var)
```

- The fold MUST run in Replay (TTDB-RFC-0007 §3.2), never in Projection: a precision learned
  from imagined residuals is a precision about the imagination.
- A node MAY keep the same EWMA live in RAM between cycles. The `@LAT108` record is the
  durable shadow, rewritten only when `π` moves by more than `prec_write_delta` — TTDB-RFC-0010
  §5.1's *only reinforcement writes*, applied to evidence.
- A freshly booted node uses its last `@LAT108` record, else `128`.
- `conf` on the PRECISION record follows `n`: a precision folded from 6 residuals is itself
  imprecise. Reference: `conf = min(240, 16 × log2(1 + n))`.

---

## 5. Ignition and the WORKSPACE lane `@LAT109`

### 5.1 Ignition

An error **ignites** when

```
ε × a / 64 ≥ θ_ign                          // a = attention gain, §5.4; 64 = unity
```

and the workspace admits it (§5.3). An ignited item stays until its decayed strength falls
below `θ_off < θ_ign` (hysteresis — without it an item at the threshold flickers in and out
every cycle, and each flicker is a write).

### 5.2 Class, identity, record

| Lane | Class | Identity kind | Natural key |
|---|---|---|---|
| `@LAT109` WORKSPACE | **FIELD** | **KEY** | `target:%s` — the ignited record's `sid`, else its coordinate |

```
@LAT109LON0 | created:1795001000 | updated:1795001060 | relates:attends@LAT95LON12#9f2e0b71
**AWARE** sid:c4d1e802 target:9f2e0b71 strength:201 half_life_ms:120000 reinforced:3
  last_ms:8260961 eps:201 prec:210 pe:245 stream:0xe334a7e1 wall:0
```

Every TTDB-RFC-0010 §5 rule applies without exception: decay evaluated on read and never
written; reinforcement (re-ignition) the only write; reclamation of the lowest decayed
strength, ties to oldest; local `millis()` deltas for half-life; unknown age is not full
decay. `attends` is a reference edge, not `derived_from` (§6.2 there): a workspace trace
points at evidence, evidence never points at it.

### 5.3 Capacity

The workspace holds at most `W` traces (reference `7`). An igniting error with `ε` above the
weakest decayed trace reclaims it; otherwise it does not enter. `W` is the bottleneck that
makes this a filter rather than a sort.

### 5.4 Top-down attention

An explicit query, an operator's selection, or the owner dwelling on an item in the grimoire
view MAY raise the attention gain `a` for that item's channel or subject, bounded by
`a_max` (reference `128`, i.e. 2×), decaying back to `64` with `a_half_life_ms`.

⚠ **Attention gain applies to ignition only. It MUST NOT enter §3.4.** In Friston's account
attention raises precision and therefore the update; here that would mean *looking at a
belief harder makes the agent believe the evidence about it more*. That is a confirmation
loop with a UI. The agent may notice more of what it attends to; it must not learn more from
it.

### 5.5 Valence

The valence field (`VALENCE_FIELD.md`) MAY shift `θ_ign` for items in its support, by at
most `±valence_theta_max` (reference `32`).

⚠ **Valence MUST NOT modulate `π`, `K`, or `conf`.** Mood-set gain closes a loop: a node in a
negative region turns its own errors up, which drives the region more negative. The
frustration index already measures that kind of instability in the graph; this RFC must not
manufacture it in the update rule. Shifting the threshold changes *what is noticed*, never
*what is believed* — the same line §5.4 draws for attention.

### 5.6 Acceptance test (TTDB-RFC-0010 §6.3, restated)

**The system MUST give the same answers with `@LAT109` empty.** The workspace decides what is
rendered, what is broadcast first, and where the next look goes. It never decides what is
believed. A node that has just booted has an empty workspace and MUST behave correctly —
noticing later, not concluding differently. If emptying the workspace changes a belief, a
belief update is reading the workspace and is non-conforming.

---

## 6. Fleet profile (A32 + TTN)

### 6.1 Agent loop

The A32-RFC-0003 loop gains no phase. In **Reason**, §3.4 replaces the fixed
`CONF_INCREMENT`/`CONF_DECREMENT`; `ε` is computed for each matched record; ignition runs
over the resulting `ε` set. In **Act**, §6.4 chooses among looks. Cost per percept: three
multiplies, two divides, one compare.

### 6.2 Logging is not filtered

⚠ **Every percept is logged to its evidence lane regardless of `ε`.** The filter governs
belief gain, broadcast, and attention — never whether evidence is kept. A filter that drops
low-`ε` evidence makes its own `π` unlearnable (§4.3 needs the boring residuals too) and
turns every later baseline into a sample of what the node found interesting.

### 6.3 Broadcast gate

⚠ **Falsified as specified by PW-3 (§8.3):** the gate saves airtime but leaves receivers' beliefs
stale on entity and link channels. Do not implement this section until a refresh mechanism is
specified and replayed.

A node transmits a percept-derived toot only when `ε ≥ θ_tx` (reference `θ_tx = θ_ign`), or
when a peer requests it. Proposed carrier: a **SALIENT** toot, type `15` *(provisional; `14` is `EPISODE` in `robot_team` —
confirm against the type registry before allocation)*, payload 12 B:

| Field | Bytes | |
|---|---|---|
| `target_sid` | 4 | the evidence record, per TTDB-RFC-0010 §4 |
| `chan` | 1 | channel index from the sender's `@LAT108` table |
| `pe` | 1 | |
| `prec` | 1 | sender's claimed precision |
| `eps` | 1 | |
| `stream_ms` | 4 | sender's stream stamp, for comparability only (TTDB-RFC-0010 §5.4) |

Not `want_ack`: a missed SALIENT means the receiver notices later, by its own sensing or a
`TTDB_REQ`. Reliability belongs to belief distribution (TTN-RFC-0009), not attention.

### 6.4 Received precision is capped by trust

```
π_received = min(π_claimed, π_trust(src))
```

`π_trust` is this node's local, subjective precision for that peer, per TTN-RFC-0005 §1
(*trust is local, subjective, and non-global*). A peer MUST NOT be able to raise its own
influence by claiming high `π`. In this frame TTN-RFC-0005 §3's "reputation gravity" is
precision: a trusted node's errors are larger *to this node* because this node weights them
more.

### 6.5 Action: where to look

Given candidate looks `L` — an eye's pointing, a stepper position, a scan of one channel — the
agent chooses

```
argmax over l ∈ L of  G(l) = Σ over records r that l would observe of (EPS(r) × π_chan(l)) / 255
```

with ties to the cheaper actuation. The look is wrapped as a `@PERCEPT:before` (prediction for
the target region) / `@PERCEPT:after` (observation) pair, so every action produces exactly the
residual §4.3 folds. **This is the loop TTDB-RFC-0005 §3.4 leaves as a comment, and it is the
smallest closure of `@LAT20LON3`** — it does not plan; it picks the single most informative
look and learns from the delta.

**Reference instance — the dual-camera rig.** Two independently pointable eyes over a
shared scene. Each eye is a channel with its own `π`. Per cycle each eye takes the
`argmax G` look independently; when both choose overlapping regions and pass the
heterogeneity gate, the pair is fused under §3.6 (stereo). An eye whose `π` collapses — glare,
defocus, a failing analog link — stops being chosen for the regions it cannot resolve,
without any rule naming the failure.

### 6.6 Dream Cycle

During a Dream Cycle the node is not sensing: effective sensory `π` is `0`, nothing ignites
from sensors, and the workspace decays untouched. Replay folds `@LAT108` (§4.3). The
workspace is not consolidated — it is a trace, and TTDB-RFC-0010 §6.2 forbids deriving
beliefs from it.

---

## 7. Grimoire profile (TTG) — read-only

The personal grimoire's beliefs are recomputed from the owner's episodes by counting
(TTG-RFC-0003 §2), contested beliefs are kept rather than resolved, and the runtime holds no
natural-language word (TTG-RFC-0001). The filter respects all three by **not updating
anything**:

1. §3.4 does not apply. Consolidation is unchanged; `conf` is TTG-RFC-0003's.
2. Candidates for ignition are the notes the reply already computes: `contradicts`
   (a new percept opposing a decided belief) and `supersedes` (TTG-RFC-0004 §3).
   `pe` = the opposed belief's `conf` (§3.2 symbolic form). `π` = `prec_owner` for the owner's
   own sayings, `prec_relayed` for attributed testimony (`@LAT102`, when it exists), `0` for held
   sayings.
3. Ignited items are written to the store's `@LAT109` and rendered as a **workspace view**
   — the few things the owner's own words currently disagree with themselves about — capped
   at `W`, with faded items shown faded (TTDB-RFC-0010 §6.4).
4. Dwelling on an item raises its `a` (§5.4). It changes what stays in view, not what the
   grimoire believes.
5. All constants live in the store's `numbers` kind (TTG-RFC-0001 §9). The view's labels are
   reply phrases in the store, not strings in the runtime.

The existing `suggest` note (highest EPS ≥ `suggest_eps_min`) is the prospective half and is
unchanged: *suggest* is what to ask about next; the workspace is what just went wrong.

---

## 8. Falsifiers and experiments

Each is runnable before the next stage spends anything.

| ID | Claim | Procedure | Falsified if |
|---|---|---|---|
| **PW-1** | Learned `π` separates channels, and stays put within a channel | **Pre-registered protocol (v0.1.2).** Fold §4.3 over the archived TTDBs (`robot_team/master/`; the RFC assumed 78) with `PI_SCALE = 8192` for every channel and `pe_span` fixed from physical ranges (firmware constants, never read from the archive). Series = `(node, channel)`, restarted at each stream change; ≥ 30 residuals; run-length windows computed both expanded and unexpanded. Checks: **Separation** — range of per-channel median `π` across nodes (pass > 32, falsified ≤ 16); **Stability** — chronological split-half, share of series with \|π₁ − π₂\| ≤ 24 (pass ≥ 70 %, falsified < 50 %); **Robustness** — channel rank order by median `π` identical at `PI_SCALE` 4096, 8192, 16384 | Separation ≤ 16, or Stability < 50 %. Anything between pass and falsified is inconclusive; thresholds are not changed after the data is seen |
| **PW-2** | Gain protects settled beliefs | Replay with a synthetic high-variance channel injected; compare `rev` on high-`conf` records, fixed-step vs §3.4 | §3.4 flips bodies at least as often as fixed steps |
| **PW-3** | The broadcast gate saves airtime without losing beliefs | Replay archived percepts through §6.3; consolidate on the laptop both ways | Belief disagreement with ungated consolidation exceeds 5 % of records, or airtime falls by less than 30 % |
| **PW-4** | Empty workspace changes no answer | §5.6, on every replay above | Any belief differs |
| **PW-5** | Heterogeneity gates fusion | Fuse identical-umwelt pairs vs gate-passing pairs; compare predicted `1/π_fused` with measured residual variance | Identical-umwelt sums are *not* overconfident — then §3.6's gate is unnecessary, not wrong; downgrade it to SHOULD |
| **PW-6** | The filter *ignites* rather than sorts (§2.4) | Sweep input strength smoothly (synthetic `pe` ramp on one channel, `π` fixed, `W` partly full of competing traces); record each item's peak workspace strength and whether it reached broadcast | Peak strength is unimodal and tracks input linearly, with no gap at threshold and no hold past the input. That is a graded sort, not ignition: rename the mechanism and drop the claim in §2.4 |

PW-1 and PW-4 cost nothing but laptop time. PW-6 needs only the §5 code and a synthetic ramp,
so it can run on the laptop before stage 6. ⚠ PW-3's thresholds are pre-committed here so they
cannot be tuned after the run.

### 8.1 PW-1 result (2026-11-22)

**PW-1: PASS as pre-registered** — separation 123 (pass > 32), stability 75.0 % (pass ≥ 70 %),
robustness PASS. Run by `robot_team/tools/pw1/pw1_fold.py` (branch `pw1-replay`; constants
committed in `055364d` before any archive read; full tables in `tools/pw1/PW1-REPORT.md`).
Scope: all 187 `master/**/*.md` (the "78" above is stale), deduplicated on
`(node, lane, stream, t_ms, body)`; 4 417 distinct records in `@LAT94`–`@LAT97`. `pe_span`:
acoustic 32 767, motion 16 000 mg (BMI270 ±8 g datasheet default; the firmware sets no range),
link 100 dB; `PI_SCALE = 8192`.

| Check | Result |
|---|---|
| Separation | per-channel median `π`: acoustic 255, motion 255, link 250, entity 132 → range 123 |
| Stability | 12 of 16 series within 24 between chronological halves = 75.0 % |
| Robustness | same rank order at `PI_SCALE` 4096 / 8192 / 16384 |

⚠ **What the pass does and does not show.** The separation is one channel (entity) against
three that saturate near 255; acoustic, motion and link are not distinguishable from each
other, and their rank order rests on a name tie-break. The rule is met as written and no
threshold was changed, but the evidence supports "entity needs a lower gain than the rest",
not yet "every channel earns its own gain". With runs not expanded the same data gives
**INCONCLUSIVE** (stability 66.7 %); the expanded run is the verdict because skipping the
zeros biases `π` low on change-triggered channels. `cardputer/entity` and `v4a/entity` drift
(EWMA and mean `π` differ by more than 24).

Consequence: stage 2 proceeds (PW-2, PW-4). Whether acoustic and motion saturate because they
are quiet or because `pe_span` is too wide for `rms_mean` / `dev_mean_mg` is an open question
(§11); it is a constant, not a threshold, and must be settled before stage 3.

Divergences from the RFCs found on the way (candidate `lat 98` beliefs): records carry no node
id and pre-October records carry no `stream`; `@LAT97` also holds `BELIEF-PUSH` records.

### 8.2 PW-2 and PW-4 results (2026-11-22)

Run by `robot_team/tools/pw2/pw2_replay.py`. The protocol and constants were committed
(`e3835e3`) before any replay code existed; the code, tests and report are `cc4159b`
(`tools/pw2/PW2-PW4-REPORT.md`). Same archive scope and dedup as §8.1. Fixed-step baseline:
`+2` / `−16` from `PerceptLearn.h:386-390` (TTDB-RFC-0005 leaves them symbolic), baseline
`conf` 128. Reference values from §9.1.

**PW-2: PASS as pre-registered.** One scalar belief per series (acoustic, motion, link; entity
excluded). At window 60 a deterministic noisy twin (noise up to 0.6 of span) starts reporting
on each belief. Over the 41 beliefs with `conf ≥ 192` at window 60 under both rules, bodies
rewritten afterwards: fixed-step **8 217**, §3.4 **139** (pass ≤ 4 108, falsified ≥ 8 217).

⚠ **What it does and does not show.**
- The cohort is 37 link, 2 acoustic and 2 motion beliefs: the result is mostly about link.
- It is protection, not immunity: §3.4 still rewrote 139 bodies under noise, absorbing a
  median of 12 contradictions before revising (range 1–91).
- A fixed-step rule rewrites on every contradiction by construction, so its large count was
  expected; the informative numbers are the 139 and the next point.
- Without injection §3.4 revised 102 of 132 persistent genuine steps within 20 windows against
  117 for fixed-step: it follows real change somewhat less often. §3.4 cannot revise on a single
  contradiction when `conf ≥ 152` (`K ≥ k_revise` needs `π ≥ 1.68·conf`); this is by design but
  is the cost side of the protection.

**PW-4: PASS as pre-registered.** Four replays (fixed and §3.4 rules, with and without
injection) were each run with the workspace disabled and enabled (1 446 ignitions in total);
all four final belief stores were byte-identical. A canary variant whose update path reads the
workspace (attended targets learn at doubled `π`, the confirmation loop §5.4 forbids) did
produce a different store, so the test can fail. ⚠ This exercises the reference implementation:
it shows the specified rule is independent of workspace state, not that firmware code will be.

Consequence: stage 2 is complete for PW-1, PW-2 and PW-4. PW-3 was also run (§8.3) and falsified
the gate as specified; PW-5 (fusion) and PW-6 (ignition signature) remain, and no firmware
stage has been started.

### 8.3 PW-3 result (2026-11-22)

**PW-3: FALSIFIED as pre-registered** — belief disagreement **38.1 %** (falsified above 5 %),
airtime fall **97.9 %** (falsified below 30 %), 63 beliefs. The airtime criterion is met by a
wide margin; the disagreement criterion decides the verdict.

Run by `robot_team/tools/pw3/pw3_replay.py`. Protocol and constants committed (`f3eab94`) before
any code; code, tests and report at `e90c453` / `fa688fd`, wording at `40fb5ed`
(`tools/pw3/PW3-REPORT.md`). Same archive scope and dedup as §8.1 (4 417 distinct records).
Design, chosen before the run: the unit is a logged record; each series (link per peer) holds a
§3.4 state belief at the sender (fed every record, `θ_tx = 96`) and at two receivers, one fed
every record and one fed only transmitted records; the gated arm pays a 53-byte SALIENT frame on
top of the percept toot (33 B header, ≤ 208 B body per frame, 8 B HMAC); the first record of
a series is always sent. Disagreement is a gated receiver with no belief, or whose final body
differs from the ungated one by `pe ≥ pe_agree`.

| Channel | Beliefs | Disagree | Airtime fall |
|---|---|---|---|
| acoustic | 2 | 0 | 99.7 % |
| motion | 2 | 0 | 99.7 % |
| link | 53 | 18 (34.0 %) | 98.3 % |
| entity | 6 | 6 (100 %) | 96.9 % |
| all | 63 | 24 (38.1 %) | 97.9 % |

The gate sends 62 of 4 417 records (1.4 %).

⚠ **Why, and what this does not show.**
- On entity and link, each window-to-window change stays under `θ_tx` while the cumulative change
  does not. A receiver that hears only the rare surprises holds a body that was right when sent
  and is stale at the end. Acoustic and motion, which are smooth, agree throughout.
- A descriptive sweep (not used for the verdict) over `θ_tx` ∈ {64, 96, 128} gives disagreement
  30.2 %, 38.1 %, 52.4 % and airtime fall 89.5 %, 97.9 %, 99.1 %: no threshold in that range
  meets the 5 % criterion with this gate and metric.
- §6.3 specifies no heartbeat and no peer request, so the replay models neither. A periodic
  refresh is a different mechanism and would be a new pre-registered experiment, not a re-run
  or a retune of this one.
- Disagreement is judged on final bodies, so a receiver stale mid-run but caught up at the end
  counts as agreeing; airtime is bytes on air, a proxy for LoRa time; the §6.4 trust cap is
  not modelled.

Consequence: §6.3 as written MUST NOT be built. Stage 5 (§9.2) is blocked until a refresh
mechanism is specified and passes its own pre-registered replay; stages 3 and 4 do not depend
on the gate and are unaffected.

### 8.4 PW-1b result: open question 6 (2026-11-22)

**PW-1b: INCONCLUSIVE as pre-registered.** Separation 119 (pass > 32), stability 68.8 %
(pass ≥ 70 %, falsified < 50 %), robustness PASS. Runs not expanded: also INCONCLUSIVE
(stability 53.3 %).

PW-1b re-runs PW-1 with only `pe_span` changed, to settle §11 Q6. It is its own result,
and §8.1 stands. Run by `robot_team/tools/pw1b/pw1b_run.py`, which imports
`tools/pw1/pw1_fold.py` unmodified. The rule, constants and predictions were committed
(`6fda802`) before any PW-1b code existed, the code at `799a07c`, and the report at
`3b79a24` (`tools/pw1b/PW1B-REPORT.md`). Same archive scope and dedup as §8.1.

**The rule.** `pe_span` is the smallest firmware constant at which the firmware treats the
logged quantity as having changed state, unless that constant was derived from archive
records; otherwise it is the full domain the firmware clamps the quantity to. A
full-scale span (§8.1's choice) makes saturation true by construction for a quiet channel,
so it could not answer Q6.

| Channel | §8.1 span | PW-1b span | Source | §8.1 median `π` | PW-1b median `π` | Q6 (saturated iff ≥ 247) |
|---|---|---|---|---|---|---|
| acoustic | 32 767 | 900 | `ACOUSTICPERCEPT_TRANSIENT_FLOOR` | 255 | **241** | not saturated: the §8.1 span was too wide |
| motion | 16 000 mg | 60 mg | `MOTIONPERCEPT_MOVING_MG` | 255 | **251** | saturated: quiet at its declared scale |
| link | 100 dB | 90 dB | LinkPercept clamp [−100, −10] | 250 | **249** | saturated: quiet at its declared scale |
| entity | Jaccard | unchanged | — | 132 | 132 | — |

⚠ **What it does and does not show.**
- **The verdict turns on one series.** Stability fell from 12 of 16 to 11 of 16 because
  `v4a/link`'s split-half gap went from 23 to 28 against a tolerance of 24. A single boundary
  case moved, and the entity channel, which carries the separation, is unchanged.
- **The link channel's own scale could not be used.** `PERCEPTLEARN_RSSI_BAND 6` (the
  met/violated band) is the p90 of consecutive-window |Δ `rssi_med`| measured on
  `master/preflash-2026-08-02`, which is PW-1's link residual on this archive. Using it
  would have put the data's own spread in the denominator. Link therefore fell back to its
  clamp domain, which is barely narrower than §8.1's 100 dB, so the run says little about
  link.
- **The acoustic answer rests on the Cardputer alone.** `cardputer/acoustic` folds to 227
  (flagged DRIFT: mean-`π` 188), while `k10/acoustic` stays at 255 on 90 residuals. The
  channel median, 241, is their average.
- **The predictions were written before the run** (motion and link stay saturated, no
  prediction for acoustic), and both held. Firmware comments had already shown still motion
  windows at `dev_mean_mg` 8–9; that prior knowledge is disclosed in the protocol.
- **Still no pair of acoustic, motion and link is distinguishable** (largest gap 10). "Entity
  needs a lower gain than the rest" remains the strongest reading; "every channel earns its
  own gain" is still not shown.

Consequence: stage 3 uses PW-1b's spans (acoustic 900, motion 60 mg, link 90 dB), as
registered whatever the verdict. Q6 is answered for acoustic. Motion and link are quiet at
the scale their firmware acts on, and a lower `PI_SCALE` (not re-derived here) is the
remaining lever if their gains must differ.

Candidate divergences (`lat 98`): the channel's firmware acceptance band (`RSSI_BAND`) and the
`pe_span` that would suit it are the same measured quantity, so a span rule that excludes
archive-derived constants cannot use a channel's best-calibrated constant. The K10's ear
reads as noiseless at any span tried.

---

## 9. Adoption

### 9.1 Declaration

```yaml
lane_classes:
  evidence: [0, 91, 92, 93, 94, 95, 96, 97, 103, 108]   # 105, 106: no class declared; EVIDENCE by default
  provenance: [90, 98, 99, 100, 104]
  field: [101, 109]
precision:
  enabled: true
  prec_default: 128
  prec_alpha: 4
  k_revise: 160
  pe_agree: 48
  pe_novel: 64
  theta_ign: 96
  theta_off: 64
  theta_tx: 96
  workspace_w: 7
  workspace_half_life_ms: 120000
  a_max: 128
  valence_theta_max: 32
  prec_write_delta: 8
```

Absent `precision`, a reader MUST behave as TTDB-RFC-0005 alone.

### 9.2 Staging — each stage independently abandonable

- **Stage 0 — publish.** This document. Lanes reserved, nothing written.
- **Stage 1 — readers.** Free: `prec` is already ignored by TTDB-RFC-0005 §4.1. Add `prec` to
  `TtdbParse` and `companion.py` field tables and test writer against reader (TTDB-RFC-0010
  §7.2's lesson: test the pair, not each side).
- **Stage 2 — offline replay.** PW-1, PW-2, PW-4 over the archive. No firmware. **Stop here
  if PW-1 fails.**
- **Stage 3 — one PRECISION lane.** `@LAT108` on the Cardputer, folded in the Dream Cycle.
  §3.4 still disabled; `π` observed, not used.
- **Stage 4 — gain on.** §3.4 on one node. PW-2 on hardware.
- **Stage 5 — broadcast gate.** §6.3–6.4 across the V4 spine. PW-3 on air. **Blocked:** PW-3
  falsified §6.3 as specified (§8.3); needs a refresh mechanism and its own replay first.
- **Stage 6 — workspace + views.** `@LAT109` on-device; grimoire workspace view.
- **Stage 7 — looks.** §6.5 on the dual-camera rig.

---

## 10. Relationship to existing RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0005 | Adds `prec` to `[ew]`; reinterprets `conf` as prior precision without changing it; replaces §3.4's fixed steps with §3.4 here; answers §7 Q5 (share `ε`, not EPS) |
| TTDB-RFC-0006 | `pe` is a property of the `before`/`after` edge; §6.5 makes every look such a pair |
| TTDB-RFC-0007 | `@LAT108` is folded in Replay only; Projection never touches `π`; `contradiction_flag` set by sub-threshold contradictions |
| TTDB-RFC-0009 | Its heterogeneity gate licenses precision summation (§3.6) |
| TTDB-RFC-0010 | Allocates `@LAT108` (EVIDENCE, KEY) and `@LAT109` (FIELD, KEY); every §5–§6 rule applied |
| TTN-RFC-0005 | Trust caps received precision (§6.4) |
| TTN-RFC-0011 | §4.2.1's precision bound becomes a special case: positional `conf` inherits fused `π` |
| TTG-RFC-0003 | Grimoire profile is read-only; consolidation untouched |
| A32-RFC-0003 | Reason phase uses §3.4; Act phase uses §6.5 |

---

## 11. Open questions

1. **Per-subject vs per-channel `π`.** A camera is precise about edges and poor about colour
   under sodium light. `π` keyed by `(node, chan)` cannot say that; `(node, chan, region)`
   multiplies records. Is a small region code in the key worth the lane space?
2. **Owner precision.** Is `prec_owner` one constant, or should the grimoire learn it per vector
   from how often the owner's own sayings are later superseded? That is a measurement about the
   owner, and TTG-RFC-0003 §6 Q1 already declines to make one.
3. **Noticed but not believed.** Under §3.2 a contradiction of a settled belief has high `ε`
   (it ignites) and low `K` (it does not revise). That is the intended reading — the agent
   notices what it declines to believe — but a source that repeats the same low-`π`
   contradiction will hold a workspace slot indefinitely. Should re-ignition by the *same*
   source on the *same* target decay, the way TBEW salience does?
4. **Workspace across the mesh.** Should a fleet have a shared workspace — the `W` items the
   whole band attends to — and if so is it elected like the Fleet Pulse conductor or emergent
   like the SOCIAL field?
5. **Hysteresis vs half-life.** Two mechanisms keep an item in view. One may be redundant.
6. **Saturated channels (from PW-1, §8.1; partly answered by PW-1b, §8.4).** Acoustic, motion and link all fold to `π` ≈ 250–255. Are they quiet, or is `pe_span` too wide for `rms_mean` / `dev_mean_mg` (and `PI_SCALE` too large for them)? ~~Settle by re-deriving `pe_span` from observed residual ranges~~ (corrected in 0.1.8: a span taken from observed residuals would be tuning against the data). PW-1b re-derived `pe_span` from firmware state-change constants, pre-registered: acoustic is no longer saturated (241), while motion (251) and link (249) are quiet at the scale their firmware acts on. Open: whether `PI_SCALE`, not re-derived, should differ per channel.
7. **A refresh for the broadcast gate (from PW-3, §8.3).** What keeps a gated receiver's belief from going stale: a heartbeat every `N` windows, a drift-triggered resend when cumulative `pe` against the last transmitted value exceeds `θ_tx`, or a receiver pull? Each costs airtime that the 97.9 % saving can afford; the question is which keeps disagreement under 5 %. It needs its own pre-registered replay.

---

## 12. References

- Bergson, H. (1896). *Matter and Memory.* — filter lineage (§2.3).
- Broadbent, D. (1958). *Perception and Communication.*
- Baars, B. J. (1988). *A Cognitive Theory of Consciousness.* Cambridge University Press. — the global workspace.
- Dehaene, S., Kerszberg, M., Changeux, J.-P. (1998). *A neuronal model of a global workspace in effortful cognitive tasks.* PNAS 95(24), 14529–14534.
- Sergent, C., Dehaene, S. (2004). *Is consciousness a gradual phenomenon? Evidence for an all-or-none bifurcation during the attentional blink.* Psychological Science 15(11). — the signature PW-6 tests.
- Dehaene, S., Changeux, J.-P., Naccache, L., Sackur, J., Sergent, C. (2006). *Conscious, preconscious, and subliminal processing: a testable taxonomy.* Trends in Cognitive Sciences 10(5), 204–211. doi:10.1016/j.tics.2006.03.007 — the §2.4 mapping.
- Dehaene, S., Changeux, J.-P. (2011). *Experimental and theoretical approaches to conscious processing.* Neuron 70(2), 200–227. — ignition.
- Dehaene, S. (2014). *Consciousness and the Brain: Deciphering How the Brain Codes Our Thoughts.* Viking.
- Mashour, G. A., Roelfsema, P., Changeux, J.-P., Dehaene, S. (2020). *Conscious processing and the global neuronal workspace hypothesis.* Neuron 105(5), 776–798.
- Feldman, H., Friston, K. (2010). *Attention, uncertainty, and free-energy.* Frontiers in Human Neuroscience 4:215.
- Friston, K. (2010). *The free-energy principle: a unified brain theory?* Nature Reviews Neuroscience 11.
- Huxley, A. (1954). *The Doors of Perception.* — the "reducing valve" (§2.3).
- James, W. (1898). *Human Immortality.* — transmission theory.
- Kalman, R. E. (1960). *A new approach to linear filtering and prediction problems.*
- TTDB-RFC-0005, -0006, -0007, -0009, -0010; TTN-RFC-0005, -0011; TTG-RFC-0003; A32-RFC-0003.

---

## 13. Changelog

| Date | Change |
|---|---|
| 2026-11-22 | 0.1 — initial proposal |
| 2026-11-22 | 0.1.1 — field renamed `pi` → `prec` (constants `prec_*`); §2.4 credits Dehaene's global neuronal workspace as the inspiration and states the aim of synthesizing an Ignition Filter experimentally; Dehaene et al. (2006) taxonomy mapped; PW-6 ignition-signature falsifier added; references expanded |
| 2026-11-22 | 0.1.2 — PW-1 pre-registered (constants fixed from physical ranges; split-half stability added); lanes moved to `@LAT108`/`@LAT109` and SALIENT to toot type `15` (`@LAT103`–`@LAT106` and type `14` were already in use in `robot_team`) |
| 2026-11-22 | 0.1.3 — PW-1 result written back (§8.1): PASS as pre-registered, separation carried by the entity channel alone; unexpanded runs INCONCLUSIVE |
| 2026-11-22 | 0.1.4 — Status, INDEX and `rfc.ttdb.md` entries corrected: PW-1 has been run (§8.1); nothing else has |
| 2026-11-22 | 0.1.5 — PW-2 and PW-4 results written back (§8.2): both PASS as pre-registered; cohort mostly link, protection not immunity |
| 2026-11-22 | 0.1.6 — wording: "kill" replaced by "falsified" in §8 (thresholds and results unchanged) |
| 2026-11-22 | 0.1.7 — PW-3 result written back (§8.3): FALSIFIED as pre-registered (disagreement 38.1 %, airtime fall 97.9 %); §6.3 flagged, stage 5 blocked, open question 7 added |
| 2026-11-22 | 0.1.8 — PW-1b result written back (§8.4): INCONCLUSIVE as pre-registered (stability 68.8 %, one series across the tolerance); open question 6 answered for acoustic (241) and confirmed saturated for motion (251) and link (249); Q6's "from observed residual ranges" corrected; §9.1 `lane_classes` corrected to this fleet (`@LAT104` PROVENANCE, not FIELD; `@LAT108`/`@LAT109` added); Status notes stage 1 readers implemented |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0*
