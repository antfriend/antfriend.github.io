# TTDB-RFC-0009: Counter-Story and Narrative Morphospace
### Storing a Collective's Target Shape as Traversal Order, and Divergent Umwelt as the Only Instrument That Changes the Shape of Ignorance

**Version:** 0.1
**Status:** Proposed — nothing in this document has been run on hardware. The store
formats it constrains (`@BELIEF:`, `@IMAGO:seed`, scene-as-instar) are specified and
partially live; the two claims it exists to test (C-4, C-5) are **unrun**. Its
prerequisite gate (EXP-01, §5.2) is also unrun, so no result from §6 is admissible yet.
**RFC Number:** 0009
**Project:** robot_team
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0001 (`@LATxLONy` addressing, record format), TTDB-RFC-0003 (Typed Edges — ordering edges are the independent variable), TTDB-RFC-0005 (Epistemic Weight — `conf`/`sal`, and the EPS attention measure this RFC's primary metric is built from), TTDB-RFC-0006 (Experiential Perception as Synthetic Model — umwelt frame, paired `@PERCEPT:before`/`after` primary datum), TTDB-RFC-0007 (Locus Point and Dream Cycle — the consolidation pass that performs regeneration), TTDB-RFC-0008 (Narrative Metamorphosis — scene-as-instar, the agent-scale instance of the mechanism generalized here)
**Related:** TTN-RFC-0011 (Semantic Positioning — supplies the fleet's known-divergent evidence tiers, §9)
**Companion:** [`replicate/TTX-0004-counter-story.md`](../TTX-0004-counter-story.md) — the discursive half: the chain of reasoning from rank deficiency up to society, and the correction that produced this RFC. This document is its formal/normative half.
**Author:** antfriend
**Created:** 2026-07-31
**License:** CC0-1.0

> **On numbering and cross-references.** The companion was drafted against a different
> RFC numbering, in which the Dream Cycle was `RFC-0002` and Narrative Metamorphosis
> was `RFC-0007/0008`. Reconciled to this corpus: the umwelt frame and the paired-percept
> primary datum are **TTDB-RFC-0006**, the Dream Cycle is **TTDB-RFC-0007**, and Narrative
> Metamorphosis is **TTDB-RFC-0008**. `@LAT20LON3` (Learning from Action) is a coordinate
> in [`agent-memory-system_ttdb.md`](../agent-memory-system_ttdb.md), not in this corpus's
> `rfc.ttdb.md`.

> **On hardware.** The companion originally specified the heterogeneous triad as
> **K10** / Heltec V4 / T-Deck and sourced its raw material from a *K10 ambient-thermal*
> session. The UNIHIKER K10 left the fleet on 2026-07-29 (v1 firmware, off the band
> roster, removed from the T-Deck's mesh map). The M5Stack Cardputer ADV (`0x300`) takes
> its place throughout — and, as §5.4 argues, makes the experiment *more* answerable
> rather than merely restoring it, because the Cardputer's distinctive senses are
> non-amplitude ones. **The one substitution that must not be made is thermal-for-thermal:
> see §5.5.**

---

## 1. Abstract

A collective's regulatory targets are usually looked for as a table of setpoints. This
RFC advances the proposition that for *pattern* targets — those living in a morphospace
rather than on a scalar axis — the store does not hold a table at all. It holds an
**ordered traversal**, and the ending of that traversal is where the stopping condition
lives. TTDB-RFC-0008 already builds an agent this way (scene-as-instar is a
morphogenetic sequence); this RFC states the general form, and states the second, sharper
claim that follows from it: that a **counter-story** — an account of the same events from
a genuinely different umwelt — changes the *topology* of a store's ignorance, whereas a
corroborating account of equal size only changes its *volume*.

The two claims are made falsifiable by a single instrument: the **residual high-EPS
coordinate set** of a store, compared as a set rather than as an average. This RFC
specifies that instrument normatively, specifies the paired store construction that
isolates traversal order as the independent variable, and specifies the injection
protocol that distinguishes agreement from divergence. It closes by naming the gap it
expects to be blocked by (`@LAT20LON3`, Learning from Action) and the question inside it
that is not an engineering question at all (§11).

---

## 2. Motivation

### 2.1 The dividing line is rank, not compute

A node can be arbitrarily intelligent and still be unable to compute a quantity that is
not present in its sensor stream at any level of processing. Where the answer is a
transformation of one vantage point, more nodes buy throughput, not capability. Where the
answer lives in the *relationship between* observations — TDoA, parallax, separating
change-in-time from change-in-space, or detecting one's own bias — a collection is
required as a matter of rank.

The operative consequence, which this RFC turns into a test:

> **More nodes only add capability when the nodes are different.**

N identical sensors co-located are one node with √N better confidence. The *volume* of
ignorance shrinks; its *shape* does not change. Only a node with a different umwelt
changes the topology of what can be unknown. The full derivation, including the
state-space taxonomy of collective roles and the argument at societal scale, is in the
companion §1.

### 2.2 The correction that produced this RFC

The companion's §1.6 asserted that society, unlike a healing organism, lacks a morphospace
setpoint. That assertion appears to be **wrong**, and wrong in a way that matters for
TTDB: a society's morphospace setpoint is plausibly stored *as narrative*, in a format not
recognizable as a store when you go looking for a table of setpoints. A myth is a target
shape encoded as a traversal order.

If that holds, then the mechanism TTDB-RFC-0008 specifies at agent scale — an authored
scene sequence whose post-state verifiers gate advancement — is not an ARC-competition
convenience. It is the general storage format for pattern targets, and TTDB-RFC-0008 is
one instance of it.

The corollary is the sharper claim. If narrative stores target shape, then **counter-stories
are alternate routes**, and losing them is losing route plurality under ablation — which by
the James criterion (same ends, variable means) is exactly the transition from a distributed
mind to a distributed machine. And the usual prescription against homogenization —
*critical thinking* — is a property of individual nodes, which is the √N situation with
extra effort. Skepticism does not change the shape of ignorance. **A different sensor does.**

That last sentence is the whole reason this is an RFC about a mesh and not an essay.

---

## 3. Definitions

For the purposes of this RFC:

- **Store.** A conformant TTDB (TTDB-RFC-0001) with `[ew]` blocks (TTDB-RFC-0005) on
  every record.
- **Toot-bits.** The byte budget of a store's record bodies, counted per TTDB-RFC-0001.
  Used here strictly as the equalization currency between paired stores (§5.1).
- **Narrative store (Store N).** A store in which a target region is encoded as an
  *ordered traversal*: every stage carries an explicit ordering edge to its successor, and
  each stage's precondition is the prior stage's post-state. The scene-as-instar sequence
  of TTDB-RFC-0008 §4 is the reference instance.
- **Assertional store (Store A).** A store encoding the same content as unordered
  assertions. Typed edges (TTDB-RFC-0003) are permitted; **acyclic-order information is
  removed**.
- **Umwelt divergence.** Two accounts are *divergent* when they originate from different
  sensory modalities in the sense of TTDB-RFC-0006 §2 — not merely from different nodes,
  and not merely from different instances of the same modality.
- **Corroborating account.** An account of the same events originating from a *duplicate*
  modality, i.e. the same sensor class on a different node.
- **Counter-story.** An account of the same events originating from a *divergent* modality
  that disagrees with the store's existing beliefs on at least one derived belief. A
  counter-story is defined by the disagreement, not by hostility of framing; an account
  from a divergent modality that happens to agree everywhere is a corroborating account
  for the purposes of this RFC and MUST be reported as such.
- **EPS.** The attention measure of TTDB-RFC-0005 §3.3:
  `EPS = sal × (255 − conf) / 255`. What the store relies on but has not verified.
- **Residual high-EPS set** `R(S, θ)`. The set of *coordinates* — not values —
  `{ c ∈ S : EPS(c) ≥ θ }` for a threshold `θ` fixed before the run.
- **Ignorance topology.** The identity and adjacency of `R(S, θ)`, as distinct from its
  cardinality or from the store's mean `conf`.

---

## 4. Claims registered for falsification

| ID | Claim | Status |
|---|---|---|
| C-1 | Coupling bandwidth raises `conf` faster than it changes the *identity* of the unresolved set. | covered by EXP-01 (§5.2) |
| C-2 | Intelligence = target reached by a route not designed for, after ablation of the normal route. | covered by EXP-02 (§5.3) |
| C-3 | A regenerating store without a stopping condition is a tumor, not a healing. | covered by EXP-03 (§5.3) |
| **C-4** | **Morphospace targets are stored as traversal order (narrative), not as state tables.** | **this RFC, §6 Phase 1** |
| **C-5** | **A counter-story changes ignorance topology; a corroborating story only raises `conf`.** | **this RFC, §6 Phase 2** |

C-4 and C-5 are the normative subject of this document. C-1 through C-3 appear because
C-1's experiment is C-4/C-5's admissibility gate (§5.2).

---

## 5. Normative requirements

### 5.1 Paired store construction

An implementation testing C-4 MUST build two stores, N and A, over identical subject
matter, and:

1. **MUST** equalize **toot-bits**, not record count. Ordering edges are content; they are
   the independent variable, so the budget must be matched on the shared substrate or the
   comparison measures size rather than form.
2. **MUST** use paired `@PERCEPT:before` / `@PERCEPT:after` (TTDB-RFC-0006) as the primary
   datum in *both* stores. A store whose primary datum is a bare state reading is not
   comparable to one whose primary datum is a transition.
3. **MUST** carry identical `[ew]` field distributions at construction time — same `conf`,
   same `sal`, same `touched` — so that any post-run divergence in EPS is attributable to
   the regeneration, not to the seeding.
4. **MUST NOT** give Store A ordering information under another name. `depends_on` chains
   that reconstruct the traversal are ordering edges wearing a different type, and their
   presence invalidates the run.

### 5.2 The heterogeneity gate

EXP-01 (§5.3) is a **precondition**, not a companion experiment. An implementation MUST
NOT report a C-5 result from a mesh that has not been shown heterogeneous, because on a
homogeneous mesh the counter-story injection has no divergent source to draw from and the
experiment silently degenerates into its own control.

**Standing test before adding any node to the rig:**
*Does this change what can be known, or only how confidently?*

### 5.3 The existing experiment set

- **EXP-01 — Homogenization.** An identical-sensor triad (three Heltec V4s, same firmware,
  same modality set) against the heterogeneous triad of §5.4, sweeping the ESP-NOW sync
  interval. Measure **residual EPS topology**, not accuracy.
  *Falsifier:* the homogeneous mesh's unresolved set changes composition as coupling rises.
- **EXP-02 — James Test.** Ablate a *sensor class* (§5.4), not a node, mid-fix; see whether
  an equivalent-quality position is re-derived through an unused modality.
  *Falsifier:* recovery only via restoration or a pre-coded fallback.
- **EXP-03 — Planaria Test.** Excise a coherent region of the golden conformance store and
  run consolidation. Two criteria: does it pass conformance again by a *different* path,
  and **does it stop**.
  *Falsifier:* confabulation, or unbounded growth.

Run order is EXP-01 first; it establishes whether the mesh is heterogeneous enough for
anything after it to mean something.

### 5.4 The heterogeneous triad on this fleet

The rig's three umwelten, as the fleet actually stands (K10 removed 2026-07-29):

| Node | Distinctive modalities | Percept lanes | Absent — and this is the point |
|---|---|---|---|
| **Cardputer ADV** `0x300` | BMI270 accel **+ gyro** (tilt, shake, being set down); ES8311 MEMS mic incl. the fleet-clock timestamp of the loudest transient | `@LAT95` motion, `@LAT94` acoustic, `@LAT96` entity, `@LAT97` link | no GPS, no LoRa, **no ambient thermometer** (§5.5) |
| **Heltec V4** (spine) | long-haul radio; ESP-NOW **and** LoRa link evidence from the same node | `@LAT97` link, `@LAT96` entity | no mic, no IMU, no GPS |
| **LilyGo T-Deck** | u-blox GNSS — the fleet's only externally-referenced position, and the verifier for TTN-RFC-0011 | `@LAT97` link, `@LAT96` entity, GPS percept | no mic, no IMU |

All three additionally carry **interoception** (battery, die temperature, worst loop pass),
which is a fourth modality class and is available for ablation like any other.

The **modality classes** an EXP-02 ablation may remove are therefore: `acoustic`,
`motion`, `entity` (WiFi BSSID), `link` (RSSI), `gnss`, `interoceptive`. An implementation
MUST ablate a class across the whole rig, never a node — removing a node removes several
classes at once and confounds rank with reachability.

### 5.5 The thermal substitution is forbidden

The companion's original raw-material source was a **K10 ambient-thermal** session (AHT20,
a real thermometer pointed at the room). The Cardputer has no ambient thermometer. Its only
thermal channel is `temperatureRead()` — the ESP32-S3 **die** temperature.

Die temperature MUST NOT be substituted for ambient temperature in any store built under
this RFC. It reads 45–48 °C at idle and is as much a measure of how hard the radios are
working as of the room; it is an **interoceptive** signal, correctly classed with battery
voltage, not an exteroceptive one. Treating it as an ambient reading would inject a
node-internal confound into precisely the comparison this RFC exists to make — and it
would do so *while looking like a faithful port of the original design*, which is why the
prohibition is normative rather than advisory.

The correct replacement is not a thermal channel at all; it is the pair of senses the
Cardputer actually adds to the fleet — **acoustic (`@LAT94`) and motion (`@LAT95`)** — and
§5.6 explains why that is an upgrade.

### 5.6 Why the substitution strengthens the experiment

C-5 requires a counter-story that genuinely disagrees. On the old triad, thermal versus
outdoor-RSSI disagreement had to be manufactured. On the current triad it is **already a
standing field result**: amplitude ranging (RSSI, BLE) is shadowing-limited outdoors and
observed to decorrelate from true distance, which is the finding that motivated the
non-amplitude evidence tiers in the first place (TTN-RFC-0011 §9; the 2026-07-10 and
2026-07-13 garden runs).

So the Phase 2b injection has a ready, honest instantiation: the Cardputer's **acoustic
transient timestamp** (`@LAT94`, a *time-of-arrival* quantity) against the spine's
**RSSI proximity** (`@LAT97`, an *amplitude* quantity), disagreeing on a derived proximity
belief. These are physically decorrelated — that is the entire reason the acoustic tier
exists — so the divergence is a property of the world rather than an artifact of the rig.

The matched 2a control is correspondingly clean: a **second V4's** RSSI account of the same
session is a duplicate modality on a different node, which is exactly the definition of a
corroborating account in §3.

An implementation MAY use a different divergent pair; if it does, it MUST state in the run
record why the two modalities are expected to be decorrelated, since an unstated
correlation between "divergent" tiers collapses 2b into 2a without any visible failure.

### 5.7 The instrument MUST NOT be a dashboard

A scalar summary is simultaneously a Goodhart target and a homogenizing high-bandwidth
channel. Shape has dimensionality; collapsing it to one number destroys the quantity being
measured.

Therefore:

1. The primary metric **MUST** be the **Jaccard distance between residual high-EPS
   coordinate sets**, pre- and post-injection:
   `J = 1 − |R(S,θ) ∩ R(S′,θ)| / |R(S,θ) ∪ R(S′,θ)|`.
2. `θ` **MUST** be fixed before the run and reported with the result. A `θ` chosen after
   seeing the sets is a free parameter fitted to the hypothesis.
3. Δ mean `conf` **MUST** be reported, and **MUST NOT** be reported alone or as the headline.
   It is the quantity that moves under the null; its role is to be the thing the counter-story
   *fails* to move.
4. The set of coordinates **newly** high-EPS — `R(S′,θ) \ R(S,θ)` — **MUST** be reported by
   coordinate, not by count. That set is the operational definition of *ignorance the store
   did not previously know it had*, and a count of it is not inspectable.
5. Failure to halt **MUST** be reported as `∞`, never as a large number. A large finite
   number invites averaging, and a non-halting regeneration averaged against halting ones is
   a tumor reported as mild growth.

---

## 6. Experimental protocol (TTX-0004)

**Tests:** C-4, C-5. **Prerequisite:** EXP-01 complete (§5.2).

### 6.1 Hypotheses

- **H1 — narrative morphospace.** A store whose target region is encoded as an ordered
  traversal (scene-as-instar, TTDB-RFC-0008) regenerates that region after excision more
  correctly and with less overshoot than a store encoding the same content as unordered
  assertions at equal toot-bits.
- **H2 — counter-story asymmetry.** Injecting a *divergent-umwelt* account of the same
  events changes the composition of `R(S,θ)`. Injecting a *corroborating* account of equal
  size raises mean `conf` and leaves composition unchanged.

H2 is the mesh-scale statement of the entire societal argument in the companion, which is
why it is worth running even though H1 is the more tractable one.

### 6.2 Phase 1 — Regeneration (H1)

Excise a coherent region from each of Store N and Store A. Run the Dream Cycle
(TTDB-RFC-0007: Replay → Projection) with **no backup reachable by the agent**. Repeat
across **≥ 5 excision sites per store** to avoid single-site luck.

Metrics:

- **Conformance pass rate** after regeneration.
- **Path divergence** — fraction of regenerated records whose derivation edges differ from
  the originals. Byte-identical restoration is a backup, not a regeneration; **low
  divergence is a negative result**, and an implementation that reports it as success has
  measured its own cache.
- **Overshoot** — records synthesized beyond the excised region. The stopping condition is
  the finding, not a nuisance term.
- **Halt latency** — consolidation cycles until no new records are proposed, per §5.7(5).

### 6.3 Phase 2 — Injection (H2)

Restore both stores to their pre-excision state. Then, in **separate runs**:

- **2a — corroborating injection.** An account from a duplicate modality (§5.6: a second
  V4's RSSI account).
- **2b — counter-story injection.** An account from a divergent modality disagreeing on at
  least one derived belief (§5.6: the Cardputer's `@LAT94` acoustic transient against the
  spine's `@LAT97` RSSI proximity), **matched to 2a in toot-bits**.

Consolidate after each. Compare `R(S,θ)` before and after, per §5.7.

Runs 2a and 2b MUST NOT be combined into one session. A single session cannot attribute a
topology change to the divergent account, which is the only thing the experiment is for.

### 6.4 Predictions, registered in advance

1. Store N halts; Store A either under-regenerates or fails to halt. **Traversal order
   carries the stopping condition — the ending is where the target shape is stored.**
2. Corroborating injection: Δ`conf` positive, `J ≈ 0`.
3. Counter-story injection: Δ`conf` near zero or **negative**, `J` well above 0, and a
   non-empty newly-high-EPS set.

Prediction 3 is the load-bearing one. A contribution that **lowers** average confidence
while revealing new unknowns is the operational signature of a node that changed the shape
of ignorance rather than its volume — and it is the signature any real instrument for this
must be able to show, because it is the one a dashboard is structurally unable to display.

### 6.5 Falsifiers

- **C-4 fails** if Store A regenerates and halts as well as Store N at matched toot-bits.
  Narrative would then be a presentation convenience, not a storage format for target shape,
  and TTDB-RFC-0008's scene sequencing would be revealed as scaffolding rather than
  mechanism.
- **C-5 fails** if the corroborating injection also moves `J`, **or** if the counter-story
  does not. Either result collapses the distinction the whole argument rests on. In that
  case the companion's §1.6 and this RFC's §2.2 MUST be **retracted, not patched** — an
  amended version of a claim whose discriminating test failed is the store confabulating
  around an excision, which is the failure mode §6.2 was written to catch.

---

## 7. Coordinate allocation and record schema

`@LAT/LON` assignments for TTX-0004 records are **to be assigned** against the live golden
store at run time; this RFC deliberately does not squat coordinates it has not checked
against that store. On allocation, the following namespaces apply:

| Namespace | Holds | Required fields |
|---|---|---|
| `@EXPERIMENT:ttx0004:*` | rig configuration and run metadata | store id (`N`/`A`), phase, `θ`, excision site, modality classes present, ablated class (if any) |
| `@PERCEPT:before` / `@PERCEPT:after` | the primary datum in both stores (§5.1) | per TTDB-RFC-0006 |
| `@BELIEF:*` | Dream Cycle output | per TTDB-RFC-0007 `[lp]`, **plus** a distinct tag separating regenerated beliefs from originals |

That last requirement is not bookkeeping. Without it, Phase 1's path-divergence metric
cannot be computed after the fact, and a run that omits it is unrecoverable rather than
merely untidy.

Two coordinates *are* already allocated, both outside the run's own namespace:

- **`@LAT10LON9`** in this corpus's [`rfc.ttdb.md`](rfc.ttdb.md) — this RFC's compressed
  record.
- **`@LAT20LON5`** in the golden conformance store
  ([`agent-memory-system_ttdb.md`](../agent-memory-system_ttdb.md), Draft 05) — C-4 and
  C-5 stated in that store's own layer-20 voice, at `conf 120` / `sal 120`. Its EPS of 63
  is the second-highest in that store, behind `@LAT20LON3` at 105. That ordering is the
  correct one and an implementation SHOULD preserve it: Learning from Action is the gap
  this experiment is blocked *by* (§9.1), so a result here that raised this record's
  confidence above that one would mean the store had stopped noticing what it is standing
  on.

---

## 8. Relationship to the primary hypothesis

Semantic Positioning (TTN-RFC-0011) claims position is recoverable from umwelt overlap.
This RFC and that one meet at the same joint from opposite sides:

- TTN-RFC-0011 needs umwelten to **overlap** enough that `Ω(i,j)` tracks distance.
- This RFC needs them to **diverge** enough that a counter-story exists at all.

These are not in tension; they are the two ends of one dial, and §5.2's gate is where the
dial is read. A fleet homogeneous enough to make `Ω` trivially high is a fleet with no
counter-stories, and TTN-RFC-0011 §8.2 (modal incommensurability) is the same boundary
approached from the positioning side. An implementation that runs EXP-01 obtains a
measurement both RFCs need.

The practical consequence is already visible in the fleet's field results: the reason the
non-amplitude tiers were built is the reason a counter-story is available to inject (§5.6).

---

## 9. Open problems

### 9.1 The gap this experiment sits on — `@LAT20LON3`

Regeneration is not a query. Choosing an excision-repair path, committing to it, and
deciding to stop are all **actions**, and the store has no specified way to learn from
having taken them. Learning from Action (`@LAT20LON3` in
[`agent-memory-system_ttdb.md`](../agent-memory-system_ttdb.md)) is the store's own
highest-EPS record and is deliberately unimplemented.

TTX-0004 does not brush this gap; it sits on it. Phase 1 requires a halt decision and
Phase 2 requires committing to a revision the store's own prior beliefs contradict.

**Expect the experiment to be partly blocked by the gap.** An implementation that finds
itself blocked there MUST log the blockage as a result, at the coordinate that blocked,
rather than engineering around it. The location of the block is diagnostic information
about the gap and is more valuable than a completed run that routed past it.

### 9.2 Setpoints must not accelerate

A target that moves at media speed is not a target, it is a price; a servo referenced to a
moving reference is an oscillator with extra steps. Biology already separates these:
healing is a slow morphogenetic target with fast local error signals — the gradient
updates in seconds, the target anatomy does not.

For any store built under this RFC: **`@IMAGO:seed`-class target records SHOULD change on a
timescale slower than the percept records that measure error against them.** This is stated
as SHOULD rather than MUST because the fleet has no enforcement mechanism for it and this
RFC declines to specify one it has not tested.

### 9.3 What is not technical

Whose divergence counts, and who authors the setpoint, is the identity-boundary problem
plus legitimacy. At mesh scale it is a configuration choice made by the operator. At
societal scale it is a political position, and **any implementation that presents it as an
engineering choice is concealing the substantive claim inside it.**

The structure of the problem is analyzable. The answer is not, and no conformance profile
in this corpus should imply otherwise.

---

## 10. Standing criteria

Four questions, applicable outside this RFC:

1. **Adding a node:** does this change what can be known, or only how confidently?
2. **Mind vs. machine:** is the target reachable by a route not designed for, after
   ablation of the normal one?
3. **Healing vs. tumor:** does it stop?
4. **Instrument design:** does the readout preserve shape, or collapse it to a scalar?

---

## 11. References

- Ashton, K. (2026). *The Story of Stories: The Million-Year History of a Uniquely Human
  Art.* — narrative as constitutive; counter-stories as the thing at risk.
- Levin, M. — bioelectric morphospace storage; multiscale competency architecture.
- Friston, K. (2010) — active inference; precision-weighting ↔ TBEW.
- von Uexküll, J. — umwelt; the frame for §2.1 and TTDB-RFC-0006.
- James, W. — same ends by variable means; §5.3 EXP-02.
- TTDB-RFC-0001, -0003, -0005, -0006, -0007, -0008; TTN-RFC-0011.
- [`replicate/TTX-0004-counter-story.md`](../TTX-0004-counter-story.md) — the companion.

---

*Version 0.1. The predictions in §6.4 are registered before running. Amend this RFC by
appending a results section; do not edit §6.4 in place.*
