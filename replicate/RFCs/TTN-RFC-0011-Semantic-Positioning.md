# TTN-RFC-0011: Semantic Positioning — Deriving Node Location from Umwelt Overlap

**Version:** 0.1
**Status:** Experimental — under on-device validation. The evidence and verification layers are live (`firmware/libraries/LinkPercept` SP0 RSSI histograms → `@LAT97`; the T-Deck GPS verifier with DGPS lock; flip-resolution + scale-guard firing = proof leg 1 mechanics). The central hypothesis (`Ω` ↓ distance, and that semantic overlap beats RSSI-only) is **not yet confirmed** — the 2026-07-10 GPS run returned a partial negative on the RSSI leg (§9 field note), and §8.1 spacetime entanglement remains the blocking open problem. Embedding, odometry, and the ablation falsifier are open (PLAN.md Act II).
**RFC Number:** 0011
**Project:** robot_team
**Component:** Toot Toot Network (TTN)
**Depends on:** TTDB-RFC-0001 (`@LATxLONy` addressing), TTDB-RFC-0005 (TBEW — `conf`/`sal` weights), TTDB-RFC-0006 (paired-percept primary datum, umwelt frame), TTDB-RFC-0007 (Locus Point + Dream Cycle — the offline phase), TTN-RFC-0008 (Fleet Time-Sync — clock base for temporal gating and RSSI logs)
**Companion:** `ttn-semantic-positioning.md` (the adopted PRIMARY HYPOTHESIS — proof legs, percept schemas, phased build plan; this RFC is its formal/normative half)
**Author:** toot-toot-engineering
**Created:** 2026-07-12
**License:** CC0-1.0

> **On numbering.** This RFC was drafted as a provisional `0009`; that number
> (and `0010`) were already taken by TTDB Push-Back and Fleet Pulse, so it is
> assigned the next free TTN number, **0011**, at merge. Its cross-references have
> been reconciled to this corpus: the Dream Cycle is **TTDB-RFC-0007** here (not
> `0002`), and the paired-`@PERCEPT` primary datum + umwelt frame are
> **TTDB-RFC-0006**.

---

## Abstract

Locus addresses every node with a coordinate, `@LATxLONy`. This RFC advances the
converse proposition: that the coordinate is not merely *assigned* to a node but
is in principle *recoverable from* it. If two nodes perceive overlapping
fragments of the world, they are probably near each other. Umwelt overlap is
therefore a proxy for spatial proximity, and the network's physical layout can be
reconstructed from its semantic content alone.

This document states the Semantic Positioning Hypothesis (SPH) formally, derives
its consequences, specifies the overlap measure and the embedding procedure that
turns it into coordinates, and — critically — states the two conditions under
which the hypothesis fails. It closes with a normative procedure for validating
SPH empirically on the V4-A/B/C deployment using LoRa RSSI as an independent
physical reference.

Semantic Positioning is what makes `@LATxLONy` authority-free in a strong sense.
It is not merely that no registry issues the coordinate; it is that the
coordinate need not be issued at all.

The engineering counterpart of this RFC — the concrete percept schemas, the
phased Phase 0–6 build, and the three falsifiable proof legs (verified /
actuated / rendered) — lives in `ttn-semantic-positioning.md`. This document is
the formal, normative half; that document is the operative build plan.

---

## 1. Motivation

The `@LATxLONy` addressing scheme (TTDB-RFC-0001) was adopted because it is
substrate-independent and requires no naming authority. But a coordinate assigned
by a human, or read from a GPS module, is still an *external* fact bolted onto
the graph. It can be lost. It can be wrong. It is unavailable in a canyon, a
basement, or a mycelial substrate under three metres of soil.

If position can instead be *derived* from the graph — from what the node has
perceived, and who else perceived it — then position becomes an intrinsic
property of the umwelt rather than an annotation upon it. The node knows where it
is because of what it has seen. This is the same move von Uexküll makes when he
declines to describe the tick's world in the observer's coordinates and describes
it instead in the tick's own perceptual terms.

The practical stakes are concrete: a TTN node with no GPS fix, no map, and no
uplink should still be able to answer *where am I, relative to my neighbours?*

---

## 2. Terminology

| Term | Definition |
|---|---|
| **Umwelt** | The perceptual-operational world of a single node; formally, the set of `@PERCEPT` records it holds. |
| **Umgebung** | The physical surroundings, observer-described. Distinct from *Umwelt*. |
| **Funktionskreis** | The sensor/actuator loop of a node; its modality. Two nodes are *commensurable* iff their Funktionskreise overlap. |
| **Overlap** | `Ω(i,j)` — a confidence-weighted measure of shared percept content between nodes *i* and *j*. See §4. |
| **Anchor** | A node whose absolute `@LATxLONy` is known by external means (GPS, survey, human assignment). |
| **Semantic Odometry** | Estimation of node motion from the time-derivative of its overlap profile. See §7. |
| **Stress** | Residual error of the 2-D embedding of the overlap matrix; a measure of how *spatial* the semantic relationships actually are. |
| **SPH** | The Semantic Positioning Hypothesis, §3. |

---

## 3. The Semantic Positioning Hypothesis

> **SPH.** For nodes *i*, *j* with commensurable Funktionskreise, the umwelt
> overlap `Ω(i,j)` is a monotonically decreasing function of the physical
> distance `d(i,j)` between them.

Two nodes standing in the same clearing hear the same rain, register the same
temperature step, and see the same LoRa neighbours. Two nodes a valley apart do
not. Overlap is not a measurement of distance; it is a *consequence* of shared
Umgebung, and shared Umgebung is what proximity means.

SPH is a hypothesis, not an axiom. §8 states what breaks it and §9 states how to
test it.

---

## 4. The Overlap Measure

### 4.1 Normative form

Implementations MUST compute overlap as a confidence-weighted Jaccard-style
coefficient over shared percept content:

```
           Σ  min(conf_i(p), conf_j(p)) · max(sal_i(p), sal_j(p))
        p ∈ P_i ∩ P_j
Ω(i,j) = ─────────────────────────────────────────────────────────
           Σ  max(conf_i(p), conf_j(p)) · max(sal_i(p), sal_j(p))
        p ∈ P_i ∪ P_j
```

where `P_i` is the set of `@PERCEPT` records held by node *i*, and `conf` and
`sal` are the TBEW epistemic weight fields defined in TTDB-RFC-0005.

`Ω ∈ [0, 1]`. `Ω(i,i) = 1`. `Ω` is symmetric.

### 4.2 Rationale for the weighting

Confidence weighting is not decoration. A percept that *both* nodes hold with
high `conf` is strong positional evidence; a low-`conf` coincidence is weak
evidence and must not be allowed to drag the embedding. Salience weighting
ensures that a shared rare event counts for more than a shared commonplace.

**Corollary 4.2.1 (Precision bound).** Positional precision is bounded above by
percept confidence. A node whose umwelt is uniformly low-`conf` cannot be
precisely located, no matter how many neighbours it has. Epistemic uncertainty
propagates directly into spatial uncertainty. This is not a defect of the method;
it is the method being honest. (In the engineering model this bound surfaces as
`dist_sigma_m` on `@BELIEF:PROXIMITY` and `sigma_m` on `@BELIEF:POSITION`; see
`ttn-semantic-positioning.md` §2.1.)

### 4.3 Percept identity

Two percepts are "shared" iff they resolve to the same `@LATxLONy` semantic
address. Note the recursion: percept addresses are themselves Locus coordinates.
Semantic Positioning therefore locates *nodes* in physical space using the
already-established positions of *concepts* in semantic space. Implementations
MUST NOT conflate the two coordinate spaces; §10 flags the unified-space question
as open.

---

## 5. Positioning Procedures

### 5.1 Semantic trilateration (anchored, local)

Where three or more anchors are in range, an unpositioned node MAY estimate its
coordinate by trilateration: invert the monotone `Ω → d` relation for each anchor
and solve for the intersection. This is GPS with the physics swapped out —
overlap coefficient replaces time-of-flight; peers replace satellites.

Implementations performing trilateration MUST propagate the `conf`-derived
precision bound (§4.2.1) into the resulting coordinate's own `conf` field. A
derived position is a belief, and beliefs carry weights.

### 5.2 Embedding (global)

The general case is a manifold-recovery problem, and it is the recommended
procedure.

The overlap matrix `Ω` is a similarity matrix. Convert it to a dissimilarity
matrix and embed it in two dimensions by classical multidimensional scaling, or,
on constrained hardware, by iterative force-directed relaxation (attractive force
∝ Ω, repulsive force ∝ 1/d). The resulting 2-D embedding **is** the network map.
(The reference implementation uses weighted spring relaxation / stress
majorization, ~40 lines of fixed-point C, warm-started from the previous
embedding — `ttn-semantic-positioning.md` §3 Phase 2.)

**Corollary 5.2.1 (Redundancy of the coordinate).** If position is derivable from
the graph, then `@LATxLONy` is recoverable when the literal coordinate field is
lost — a truncated Markdown file, a corrupted LittleFS block, a hand-copied node.
The graph is self-locating. This is a strong robustness property of the flat-file
storage model and SHOULD be exploited in recovery tooling.

### 5.3 Gauge freedom

**Corollary 5.3.1 (One anchor suffices; zero does not).** MDS recovers position
only up to rotation, translation, and reflection. Semantic Positioning therefore
yields the *shape* of the network for free, but fixing absolute `@LATxLONy`
requires at least one anchor.

Consequences, which SHOULD be surfaced in implementations:

- A mesh in a GPS-dead canyon still obtains a complete relative map. Every
  question of the form *which node is between which* is answerable.
- One node with a single GPS fix pins the entire mesh to the Earth.
- The reflection ambiguity is real and cannot be resolved by overlap alone. Two
  anchors, or one anchor plus one known bearing, resolve it. In the robot_team
  deployment the **roaming T-Deck GPS is effectively many anchors over time** and
  breaks the flip statistically (`ttn-semantic-positioning.md` §3 Phase 2).

### 5.4 Stress as a diagnostic

**Corollary 5.4.1.** Embedding stress is a free instrument. If the 2-D fit has
high residual stress, the semantic relationships are *not* purely spatial —
something else is contaminating the overlap. Implementations SHOULD compute and
expose stress alongside every derived coordinate. It is the network's own answer
to *how spatial am I, really?*, and it is the tripwire for the failure modes in
§8.

---

## 6. Relationship to the Dream Cycle (TTDB-RFC-0007)

**Corollary 6.1 (Consolidation sharpens localization).** If position is read out
of the graph, then any operation that improves the graph improves the position.
The Dream Cycle prunes spurious edges and strengthens high-`conf` ones; it
therefore *directly reduces positional uncertainty*.

An un-dreamed node is more spatially uncertain than a consolidated one. Sleep
improves the map.

Implementations SHOULD re-run the embedding as a Projection-phase step of the
Dream Cycle rather than continuously. Positioning is consolidation work, not
sense-loop work, and belongs in the offline phase. The durable outputs —
`@BELIEF:PROXIMITY` (per pair) and `@BELIEF:POSITION` (per node) — are ordinary
Locus Point beliefs (TTDB-RFC-0007) and propagate over the mesh by TTDB
Push-Back (TTN-RFC-0009) like any other belief.

---

## 7. Semantic Odometry

**Corollary 7.1.** For a mobile node — Agent 32 in the field — the rate of change
of overlap with fixed neighbours is a velocity proxy:

```
v̂(i) ∝ ‖ dΩ(i, ·) / dt ‖
```

Semantic Positioning implies Semantic *Odometry*: dead reckoning from the
derivative of the overlap profile. A node that is losing overlap with the eastern
relay and gaining it with the western one is moving west, and it can say so
without an accelerometer.

This is Draft-quality and untested. It is recorded here because it follows
directly from SPH and because the instrumentation cost is zero — the overlap
profile is already being computed.

---

## 8. Failure Modes

SPH is a proxy relation, and proxies have domains of validity. Two conditions
break it. Both are load-bearing for current TTE work and both MUST be documented
in any implementation.

### 8.1 Spacetime entanglement

`@PERCEPT:before` / `@PERCEPT:after` pairs are the primary datum (TTDB-RFC-0006).
Pairs are *temporal* objects. Consequently, events close in **time** generate
overlap just as events close in **space** do.

Raw `Ω` therefore measures proximity in umwelt-*spacetime*, not in space. `Ω` is a
4-D proximity of which `@LATxLONy` is only the spatial projection. Two nodes that
both registered a thunderclap share a percept because they were near each other
*and* because they were listening at the same moment; the measure does not
distinguish these.

**Normative requirement.** Implementations MUST temporally gate the overlap sum —
counting a percept as shared only when the paired records fall within a bounded
window `Δt` — or MUST declare that their derived coordinates are spacetime
coordinates and not spatial ones. Silently conflating the two is non-conforming.
The gate depends on the fleet clock base of TTN-RFC-0008; `Δt` cannot be tighter
than the fleet's verified sync skew (≤ 50 ms).

This is the deepest open problem in this RFC. §10.1 refers.

### 8.2 Modal incommensurability

A mycelium bioelectric node and a thermal node placed side by side may share
approximately zero percepts.

In von Uexküll's terms: SPH measures *Umgebung* (shared surroundings) using
*Merkwelt* (perceptual overlap) as its proxy, and the proxy holds only where the
nodes share a comparable *Funktionskreis*. Across modalities, low overlap means
"different senses," not "far away" — **and the two are indistinguishable from the
overlap measure alone.**

**Normative requirement.** Every node MUST declare its Funktionskreis (its sensor
modality set) in its TTDB header. Implementations MUST NOT compute `Ω` across
nodes with disjoint Funktionskreise, and MUST instead treat such pairs as
*unconstrained* in the embedding rather than as *distant*. Treating an
incommensurable pair as distant is the principal way to corrupt a Semantic
Positioning map, and it will show up as elevated stress (§5.4).

This is the formal caveat on the heterogeneous-sensor line of work, and it is why
a mixed-modality mesh needs at least one node bridging each modality pair to stay
connected in the embedding.

---

## 9. Validation Procedure (Normative for V4 Deployment)

SPH is falsifiable on the existing hardware at zero marginal cost. LoRa RSSI is an
independent, physical proximity signal already logged by every V4 node.

**Procedure.**

1. Over the V4-A (bridge/head), V4-B (solar relay), V4-C (off-grid tail)
   topology, log for each node pair: RSSI (physical) and `Ω` (semantic), on the
   same schedule.
2. Compute the rank correlation between `Ω` and RSSI across all pairs.
3. SPH predicts a strong positive correlation.

**The disagreements are the finding.** Where `Ω` and RSSI diverge, exactly one of
the following holds, and the deployment log should be sufficient to say which:

| Divergence | Interpretation |
|---|---|
| Low RSSI, high `Ω` | Physical obstruction, or a multi-hop relay path (V4-B) attenuating a link between nodes that are genuinely co-located. RSSI is wrong; SPH is right. |
| High RSSI, low `Ω` | Modal incommensurability (§8.2) — nearby nodes that cannot perceive the same world. SPH's proxy has failed, correctly and informatively. |
| Both low, both high | SPH holds. |

Implementations SHOULD retain the RSSI/`Ω` divergence table as a first-class
diagnostic artifact. It is a map of where the network's semantics and its physics
come apart, which is a more interesting object than either alone.

> **Field note (2026-07-10).** An early GPS-verified run found RSSI proximity
> over-ranging 2–7× and decorrelating from true distance outdoors, and
> through-house RSSI calibration did not transfer to open air. That is the "RSSI
> is wrong; SPH is right" row of the table observed in the wild, and it is why
> this RFC treats RSSI as *one* evidence tier, not the ranging ground truth —
> the ablation in `ttn-semantic-positioning.md` §4.3 is the falsifier that keeps
> the semantic layer honest.

---

## 10. Open Questions

**10.1 — Can space and time be separated in `Ω`?** §8.1 proposes temporal gating
as a mitigation, but a gate is a hyperparameter, and a principled decomposition of
umwelt-spacetime proximity into orthogonal spatial and temporal components is not
yet in hand. This is the blocking issue for promoting this RFC beyond Draft.

**10.2 — Are the two coordinate spaces one space?** §4.3 keeps semantic
`@LATxLONy` (concept addresses) and physical `@LATxLONy` (node addresses)
strictly separate. They are written in the same notation. Is that a pun or a
claim? A unified coordinate space in which concepts and nodes are co-embedded is
attractive and possibly incoherent.

**10.3 — Does the network converge?** Nodes derive positions from neighbours who
are themselves deriving positions from neighbours. Under what conditions does
distributed, iterative Semantic Positioning converge rather than drift, and does
the Dream Cycle's periodicity (§6) provide the necessary synchronization barrier?

**10.4 — Active inference.** The Locus preprint (TTDB-RFC-0006/-0007) engages the
epistemic side of the free energy principle but not the action side. Semantic
Positioning suggests an entry point: a node that *moves to reduce positional
uncertainty* — seeking overlap with anchors — is performing epistemic foraging in
the strict Fristonian sense. Semantic Odometry (§7) is the sensor this would need.

**10.5 — Minimum anchor count in practice.** §5.3 establishes that one anchor
suffices in principle to fix translation and rotation, with reflection unresolved.
What is the practical anchor density required for a stable map under realistic
overlap noise?

---

## 11. Relationship to Other RFCs

- **TTDB-RFC-0001 (File Format)** — supplies `@LATxLONy` and the record header
  this RFC's beliefs are written into. This RFC inverts 0001's addressing
  relation: 0001 *assigns* coordinates, 0011 *derives* them.
- **TTDB-RFC-0006 (Experiential Perception as Synthetic Model)** — supplies the
  umwelt frame and the paired `@PERCEPT:before`/`@PERCEPT:after` primary datum
  that §8.1's spacetime entanglement is a direct consequence of.
- **TTDB-RFC-0007 (Locus Point and Dream Cycle)** — supplies the offline phase in
  which embedding should run and the `@BELIEF:` namespace the derived positions
  live in; §6 establishes that consolidation reduces positional uncertainty.
- **TTDB-RFC-0005 (TBEW)** — supplies `conf` and `sal`, the weighting functions
  in §4 and the source of the precision bound in §4.2.1.
- **TTDB-RFC-0008 (Narrative Metamorphosis)** — an eclosing node re-bases its
  knowledge graph, and therefore its umwelt, and therefore its derived position.
  Whether an imago wakes up somewhere *else* is not addressed here and is
  genuinely unclear.
- **TTN-RFC-0008 (Fleet Time-Sync)** — supplies the shared clock the temporal
  gate of §8.1 needs; the gate `Δt` is bounded below by that RFC's ±50 ms skew.
- **TTN-RFC-0009 (TTDB Push-Back)** — the channel by which `@BELIEF:PROXIMITY` /
  `@BELIEF:POSITION` records propagate across the mesh.
- **TTN hardware series (TTN-RFC-0006/0007/0010)** — supplies the V4-A/B/C
  topology and the RSSI log that make §9 executable.
- **`ttn-semantic-positioning.md` (engineering companion)** — the operative build
  plan: the three proof legs (verified / actuated / rendered), the percept and
  belief schemas, the Phase 0–6 roadmap (instrumentation → pairwise distance →
  embedding/anchoring → environmental TDoA → address loop → transport auto-switch
  → TTCP render), and the ablation falsifier. This RFC is that document's formal
  half; that document is this one's implementation.
- **`firmware/libraries/LinkPercept` (SP0 reference implementation)** — the live
  on-device evidence layer: per-peer RSSI histograms distilled to `@LAT97` TTDB
  records, i.e. the §4 overlap evidence being gathered on real hardware today.

---

## 12. Design Constraints

Consistent with the Locus corpus, any conforming implementation MUST be:

- **Offline.** No positioning service, no reference station, no uplink.
- **Deterministic.** Given the same overlap matrix and the same anchor set, the
  same coordinates. Force-directed relaxation MUST use a fixed seed and a fixed
  iteration count.
- **Human-readable.** Overlap matrices and derived coordinates are TTDB records in
  flat Markdown like everything else.
- **ESP32-resident.** For meshes below ~32 nodes, iterative relaxation in fixed
  point is tractable on-device. Above that, the embedding is a Dream Cycle task
  and MAY be deferred to a bridge node.

---

*End TTN-RFC-0011*
