# TTDB-RFC-0007: Locus Point and Dream Cycle
### Consolidation and Belief Formation: Episodic-to-Semantic Memory Transfer in TTDB

**Version:** 0.2
**Status:** Draft
**RFC Number:** 0007
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0003 (Typed Edges), TTDB-RFC-0005 (Epistemic Weight), TTDB-RFC-0006 (Experiential Perception as Synthetic Model)
**Author:** antfriend
**Created:** 2026-05-15

---

## 1. Abstract

TTDB accumulates episodic toot-bits: specific, time-stamped, coordinate-bound percepts. Agents acting in the world need more than episodes — they need **beliefs**: stable regularities that hold across many observations and can be acted on without re-traversing the full episodic record. This RFC defines the **Dream Cycle**, a two-phase offline consolidation process that extracts beliefs from episodic toot-bits, and the **Locus Point**, a new TTDB node type that encodes the resulting beliefs as first-class graph citizens. Together they provide a path from episodic to semantic memory without retraining, without external inference infrastructure, and within the compute envelope of an ESP32-S3.

---

## 2. Motivation

### 2.1 The Episodic/Semantic Gap

TTDB-RFC-0006 establishes the `@PERCEPT:before` / `@PERCEPT:after` pair as the foundational unit of the Locus framework. A well-populated TTDB is a dense graph of such pairs: specific transitions, at specific coordinates, at specific times. This is episodic memory.

Episodic memory is necessary but not sufficient for action. An agent reasoning purely episodically must re-traverse its full observational record to answer questions that beliefs could answer in a single lookup: *Is this region of the knowledge space reliably navigable?* *What do I expect to find at coordinates I have not yet visited?* *Which beliefs are stable enough to act on without further sensing?*

The gap between episodic toot-bits and actionable beliefs is currently unbridged in the TTDB specification. This RFC closes that gap.

### 2.2 Biological Inspiration

The Dream Cycle is **inspired by** sleep-dependent memory consolidation. It is not a model of it, and the evidence behind the two phases it borrows from differs in strength:

- **Slow-wave replay is well supported.** In rodents, hippocampal place-cell ensembles active during waking reactivate during slow-wave sleep (Wilson & McNaughton 1994), and do so as time-compressed, ordered sequences (Lee & Wilson 2002).
- **The REM account is a hypothesis.** The proposal that REM sleep recombines consolidated material to produce novel associations is a model put forward for explicit testing (Lewis, Knoblich & Poe 2018), not an established finding.
- **Episodic traces are kept.** In complementary learning systems theory the hippocampus retains episodic traces while the neocortex slowly integrates across episodes (McClelland, McNaughton & O'Reilly 1995). §6.2 follows this: subsumed episodes are archived, never deleted.

**What this RFC borrows and what it does not.** It borrows the division of labour: an offline phase that re-visits recent episodes to extract what recurs across them, and a second phase that proposes hypotheses beyond what was observed. It does **not** reproduce replay's defining property, its sequential order — Phase 1's random walks discard order (§3.2) — and it makes no claim about neural mechanism. Any error in the analogy is ours.

### 2.3 Relationship to TTDB-RFC-0005 (Epistemic Weight)

TBEW fields (`conf`, `rev`, `sal`, `touched`) provide per-entry epistemic metadata. They identify which entries are well-settled, uncertain, or frequently accessed. The Dream Cycle consumes these signals: `sal` weights the random walk; `conf` thresholds belief formation; high-`rev` entries are candidates for contradiction detection. The Locus Point and TBEW are complementary — TBEW annotates individual toot-bits; the Locus Point aggregates across them.

---

## 3. The Dream Cycle

The Dream Cycle is a two-phase offline process. It MUST run only when the agent is in an **idle state**: no new percepts are being written and no active queries are pending. Implementations MUST NOT run the Dream Cycle during the sense-reason-act loop.

### 3.1 Trigger Conditions

An agent SHOULD enter the Dream Cycle when any of the following conditions is met:

| Condition | Parameter |
|---|---|
| No new toot-bit written for *T* seconds | `dream_idle_threshold_s` (default: 300) |
| Accumulated toot-bits since last cycle exceeds *N* | `dream_batch_size` (default: 50) |
| Compute budget token is available (scheduled tick) | Implementation-defined |

Implementations MAY expose these parameters in the `mmpdb` block under a `dream_cycle` key (see §3.4).

### 3.2 Phase 1 — Replay (Slow-Wave Analog)

**Purpose:** Extract structural regularities from the episodic record by identifying nodes and regions that co-occur across many independent traversals of the graph.

**Algorithm:**

1. Select the set of episodic toot-bits written since the last Dream Cycle (or a bounded sample of *M* most-recently-touched entries if the full set exceeds `dream_replay_max`).
2. Run *N* random walks of length *L* through the TTDB graph. Each walk begins at a randomly selected node from the selected set.
3. Walk steps are weighted: the probability of traversing an edge is proportional to the target node's `sal` value (TBEW §3.1). Nodes with no `[ew]` block are assigned `sal = 1`.
4. Walk steps MUST NOT be weighted by `created` or `updated` timestamp. This is a narrow rule about step weights, **not** a claim that replay is atemporal: recency enters twice, through the start set (step 1, recent or recently touched records) and through `sal`, which TTDB-RFC-0005 §3.2 decays periodically. What appears frequently across walks is therefore frequent *in the structure reachable from recent activity*. An implementation that needs recency-neutral replay MUST draw the start set uniformly from all episodic records and weight steps uniformly (`sal` treated as 1); the counting consolidation of TTG-RFC-0003 §2 is the recency-neutral reference.
5. Record node co-occurrence: for each pair of nodes (A, B) that appear in the same walk, increment `cooccurrence[A][B]`.
6. After all walks complete, extract dense subgraphs from the co-occurrence matrix. A subgraph qualifies as a **candidate belief** when:
   - It contains at least `min_cluster_size` nodes (default: 3).
   - Its minimum pairwise co-occurrence count exceeds `min_cooccurrence` (default: *N* / 4).
   - Its constituent nodes have mean `conf` ≥ `belief_conf_threshold` (default: 128). ⚠ 128 is also the TBEW default for an *unassessed* entry (TTDB-RFC-0005 §3.2), so this criterion admits clusters of entirely unassessed nodes; it filters out contested nodes, not unsupported ones.
   - Its coverage exceeds the null baseline of §5.2.1.

Candidate beliefs are not yet written to the TTDB. They proceed to the belief formation step in §5.

**Default parameters:**

| Parameter | Default | Notes |
|---|---|---|
| `dream_replay_walks` (*N*) | 100 | More walks = more robust extraction, more compute |
| `dream_replay_walk_length` (*L*) | 20 | Longer walks surface distant relationships |
| `dream_replay_max` (*M*) | 500 | Bounds memory for the candidate set |
| `min_cluster_size` | 3 | Minimum nodes for a candidate belief |
| `min_cooccurrence` | 25 | N/4 at default N=100 |
| `belief_conf_threshold` | 128 | TBEW `conf` midpoint |
| `belief_excess_threshold` | 32 | Minimum coverage above the shuffled-graph null (§5.2.1) |

### 3.3 Phase 2 — Projection (REM Analog)

**Purpose:** Generate predictive belief candidates about unobserved coordinate regions by walking along the boundary between the agent's known complex and its complement.

**Algorithm:**

1. Compute a discrete approximation of the Alexander dual of the current TTDB complex *K* (the set of all `@PERCEPT:` and standard coordinate nodes, treated as a simplicial complex on the `@LATxLONy` coordinate sphere *S²*; see TTDB-RFC-0006 §5.3).
2. Identify connected components of the complement *S² \ K*: coordinate regions that contain no TTDB nodes but are bounded (enclosed) by known nodes. Unbounded complement regions (open frontier) are excluded from this phase — they require active sensing, not projection.
3. For each bounded complement component, identify its **boundary nodes**: known nodes whose coordinate neighborhoods are adjacent to the unknown region.
4. Run a second set of *P* walks of length *Q* seeded from boundary nodes, stepping preferentially toward nodes that are high-`conf` and high-`sal` — the agent's most reliable beliefs about what the boundary looks like from the known side.
5. Each projection walk generates a **predictive belief candidate**: a hypothesis that the unknown region enclosed by the boundary has structure compatible with the beliefs observed at the boundary.

Predictive belief candidates are distinguishable from replay candidates by a `projection_flag` set to `true` (see §5.1). They are hypotheses, not confirmed beliefs, and MUST be treated as such by downstream consumers.

**Default parameters:**

| Parameter | Default |
|---|---|
| `dream_projection_walks` (*P*) | 50 |
| `dream_projection_walk_length` (*Q*) | 10 |

### 3.4 `mmpdb` Block Extension

Implementations MAY expose Dream Cycle parameters in the `mmpdb` YAML block:

```yaml
dream_cycle:
  enabled: true
  idle_threshold_s: 300
  batch_size: 50
  replay_walks: 100
  replay_walk_length: 20
  replay_max: 500
  projection_walks: 50
  projection_walk_length: 10
  belief_conf_threshold: 128
  belief_excess_threshold: 32
  min_cluster_size: 3
  min_cooccurrence: 25
```

Unknown keys within `dream_cycle` MUST be silently ignored (forward compatibility).

---

## 4. Compute Budget

The Dream Cycle MUST be abortable at any phase boundary without corrupting TTDB state. No Locus Point is written until a candidate passes the full formation criteria in §5; partial runs produce no output.

Estimated cost on ESP32-S3 with PSRAM (100 walks × length 20, 500-node graph):

| Phase | Operations | Estimated time |
|---|---|---|
| Replay (100 walks × 20 steps) | 2,000 edge traversals | < 50 ms |
| Co-occurrence matrix build | O(N × L²) = 40,000 ops | < 100 ms |
| Cluster extraction | O(nodes²) worst case | < 200 ms at 500 nodes |
| Alexander dual approximation | O(nodes + edges) | < 50 ms |
| Projection walks | 500 edge traversals | < 25 ms |
| Null baseline (§5.2.1): one degree-preserving shuffle + repeat replay and co-occurrence | ~2× the replay and matrix rows | < 150 ms |
| **Total** | | **< 650 ms** (< 500 ms without the null baseline, which §5.2.1 now requires before any Locus Point is written) |

Implementations on severely memory-constrained devices (no PSRAM) SHOULD reduce `dream_replay_max` to 100 and `dream_replay_walks` to 20 to maintain the < 500 ms budget.

---

## 5. The Locus Point

A **Locus Point** is the output of a successful Dream Cycle phase. It is a new TTDB node type — a stable attractor in coordinate knowledge space, encoding a belief extracted from or projected from episodic toot-bits. The name follows the method of loci: the most important locations in a memory palace are those the agent returns to most reliably.

### 5.1 Record Format

A Locus Point is written as a standard TTDB record with a modified coordinate ID prefix and a required `[lp]` block.

**Header line:**

```
@BELIEF:LAT<lat>LON<lon> | created:<unix_ts> | updated:<unix_ts> | relates:<edges>
```

The `@BELIEF:` prefix distinguishes Locus Points from episodic `@PERCEPT:` nodes and standard `@LATxLONy` records. The lat/lon coordinates are the **centroid** of the cluster of episodic nodes that generated this belief, computed as in §5.2.

Parsers that do not implement this RFC MUST silently ignore records whose coordinate ID begins with `@BELIEF:` (per TTDB-RFC-0001 §3: "unknown sections MAY appear and MUST be ignored by strict parsers").

**`[lp]` block** (required, immediately after the header line):

```
[lp]
centroid:LAT<lat>LON<lon>
confidence:<uint8>
scope_lat:<degrees>
scope_lon:<degrees>
projection_flag:<bool>
contradiction_flag:<bool>
source_count:<uint16>
[/lp]
```

### 5.2 Field Definitions

#### `centroid`
The coordinate center of mass of the episodic cluster that generated this Locus Point. Expressed as `LAT<lat>LON<lon>` using the same precision as the originating TTDB coordinate space. MUST match the lat/lon in the header line.

Latitude does not wrap: the centroid latitude is the arithmetic mean. **Longitude wraps modulo 360**, so a plain mean is wrong for a cluster that straddles ±180 (the mean of 170 and −170 is 0, the far side of the globe). Implementations MUST compute the centroid longitude as a wrap-aware mean, which needs only integer arithmetic:

```
lon0     = lon of the first node in the cluster
d_i      = wrap(lon_i − lon0)          // wrap(x) maps x into [−180, 180)
centroid = wrap(lon0 + mean(d_i))
```

`scope_lon` is computed from the same offsets `d_i`. This equals the arithmetic mean for any cluster spanning less than 180° of longitude that does not cross ±180 — every cluster in a file whose coordinates are small integer labels — so it changes no result there. A cluster spanning 180° or more has no meaningful centroid and MUST NOT form a Locus Point.

#### `confidence` (uint8, 0–255)
The proportion of Phase 1 replay walks that contained this cluster, scaled to 0–255. A Locus Point with `confidence` = 255 appeared in every walk.

⚠ **This is walk coverage, not evidence.** Coverage depends on the number and length of walks and on how densely the graph is linked: on a small, densely linked graph with the default 20-step walks almost every pair of nodes co-occurs, so almost any cluster clears the threshold. It measures graph structure at least as much as observational support. It is therefore **not** comparable to the TBEW `conf` field, and coverage figures from two different graphs are not comparable to each other (this bears on §6.1 and §7.3). The counting consolidation of TTG-RFC-0003 §2, which scores a belief by evidence for and against with priors, is the evidence-based alternative.

Formation threshold: a candidate MUST reach `confidence` ≥ `belief_conf_threshold` (default 128) **and** pass the null-baseline test of §5.2.1 before a Locus Point is written.

#### 5.2.1 Null baseline (normative)

Raw coverage MUST NOT be used on its own. For each Dream Cycle the implementation MUST also run Phase 1, with the same start set, *N* and *L*, on a **degree-preserving shuffle** of the graph: the same nodes, each with the same number of links, with endpoints rewired at random (repeated edge swaps). A candidate's **excess coverage** is its coverage on the real graph minus the coverage of the same node set on the shuffle. A candidate qualifies only if its excess coverage is at least `belief_excess_threshold` (default: 32, about 12.5 % of walks). Implementations MAY average several shuffles. Where the shuffle is too costly for the device, the cycle MUST NOT write Locus Points; it MAY still record candidates for inspection.

The shuffle removes the part of coverage that link counts alone explain. It does not show that a belief is true; §5.2.2 is the test for that.

#### 5.2.2 Falsifier: held-out prediction (proposed; not yet run)

The claim this RFC must earn is that a Locus Point is a belief, i.e. that it says something about records not used to form it. The test, **DC-1**, is to be pre-registered (protocol and constants committed before any archive is read) before it is run:

1. Split a store's episodic records by time: form Locus Points from the earlier part only.
2. For each Locus Point, take the held-out later records that fall inside its `scope`.
3. **PASS** if Locus Points predict the held-out records' edge types and states better than the degree-preserving shuffle baseline of §5.2.1, by a margin fixed at pre-registration. **FALSIFIED** if they do not. **INCONCLUSIVE** if too few held-out records fall inside any scope to decide.

Until DC-1 passes, `confidence` is an index of structural prominence, and §6 (compression) and §7.3 (the intersection bonus) rest on an untested assumption.

#### `scope_lat`, `scope_lon` (decimal degrees)
The coordinate extent (half-width) of the cluster in the latitude and longitude dimensions respectively. The Locus Point's coverage area is the rectangle:

```
[centroid_lat ± scope_lat] × [centroid_lon ± scope_lon]
```

#### `projection_flag` (bool: `true` / `false`)
`true` if this Locus Point was generated by Phase 2 (Projection). It is a **hypothesis** about an unobserved region, not a confirmed belief. Downstream consumers MUST NOT treat a `projection_flag: true` Locus Point as equivalent to an observed belief. Default: `false`.

#### `contradiction_flag` (bool: `true` / `false`)
`true` if any replay walk found conflicting evidence within this cluster's scope — i.e., if two toot-bits within the scope assert incompatible states. This flag does not suppress the Locus Point; it surfaces the contradiction for the agent's inspection and future resolution. Default: `false`.

#### `source_count` (uint16)
The number of episodic toot-bits subsumed by or contributing to this Locus Point. Used for compression bookkeeping (§6) and as a signal of how much observational evidence backs the belief.

### 5.3 Example

```
@BELIEF:LAT48LON-116 | created:1747300000 | updated:1747300000 | relates:generalizes>@LAT48LON-116
[lp]
centroid:LAT48LON-116
confidence:204
scope_lat:2
scope_lon:3
projection_flag:false
contradiction_flag:false
source_count:17
[/lp]
## Stable temperature gradient — northern boundary cluster

Seventeen episodic readings across this region consistently show a 2–4°C drop
moving north across the lat 47–49 band. Reliable enough to use as a prior for
sensor placement decisions.
```

### 5.4 Namespace: `@BELIEF:`

The `@BELIEF:` prefix is a reserved namespace within the Locus framework. The full addressable form is:

```
@BELIEF:LAT<lat>LON<lon>
```

This namespace is queryable by the Librarian (TTDB-RFC-0001 §2, `librarian.primitive_queries`) as a distinct record class, separate from `@PERCEPT:` episodic nodes and standard coordinate records. In multi-device deployments, Locus Points are addressable and shareable using this canonical form.

---

## 6. Graph Compression

As Locus Points accumulate, episodic toot-bits they subsume MAY be compressed to keep the active TTDB graph tractable — particularly important on ESP32 devices where the index lives in PSRAM.

### 6.1 Eligibility Criteria

An episodic toot-bit is eligible for compression when all of the following hold:

1. Its coordinate centroid falls within the `scope` of a Locus Point with `confidence` ≥ 200 (approximately 80% walk coverage) that passed the null baseline of §5.2.1. Because coverage is not evidence (§5.2), this criterion is provisional until DC-1 (§5.2.2) passes; archiving is reversible (§6.2), which is why it is tolerable meanwhile.
2. The Locus Point's `contradiction_flag` is `false`.
3. The Locus Point's `projection_flag` is `false` (confirmed beliefs only; hypotheses do not justify compression).
4. The toot-bit's TBEW `conf` ≤ the Locus Point's `confidence` (the belief is at least as well-supported as the individual episode).

### 6.2 Compression Action

Eligible toot-bits MUST NOT be deleted. They MUST be:

1. **Archived** to a designated cold storage path (implementation-defined; e.g., `/ttdb_archive.md` on LittleFS or a separate SD partition).
2. **Replaced** in the active TTDB by a single `relates` edge from the Locus Point: `compresses>@<original_coord>`.

The archive MUST be a valid TTDB file (per TTDB-RFC-0001) so that archived entries remain parseable and recoverable. Implementations MUST NOT compress without a readable archive path available.

### 6.3 Memory Impact

At 12 bytes per index entry (A32-RFC-0002 §2.1), compressing 100 toot-bits into a single Locus Point recovers ~1.2 KB of index RAM. On a 520 KB RAM device with no PSRAM (ESP32-WROOM), aggressive compression is a prerequisite for running large-graph TTDB instances.

---

## 7. Multi-Agent Belief Propagation

### 7.1 Motivation

Sharing raw episodic toot-bits between agents over ESP-NOW is bandwidth-expensive: each toot-bit is a full TTDB record. Locus Points are orders of magnitude more compact: a single `[lp]` block encodes the distillation of dozens of episodes. For multi-agent deployments, Locus Points are the natural unit of inter-agent knowledge transfer.

### 7.2 Sharing Protocol

Agents in ESP-NOW range SHOULD share Locus Points by transmitting the full `@BELIEF:` record (header + `[lp]` block + any body text). The receiving agent MUST:

1. Check whether a Locus Point with overlapping `scope` already exists in its TTDB.
2. If no overlap: write the received Locus Point with `source_count` preserved and `confidence` retained from the sender.
3. If overlap exists: apply the **intersection confirmation rule** (§7.3).

### 7.3 Intersection Confirmation

When two agents independently form Locus Points with:
- Overlapping `scope` (the coverage rectangles intersect), AND
- Compatible beliefs (no `contradiction_flag` on either), AND
- Both `projection_flag: false`,

this is evidence that the belief is not an artifact of one agent's traversal history. Its strength is limited: the two `confidence` values are coverages of different graphs and are not directly comparable (§5.2), so the bonus below is a heuristic pending DC-1 (§5.2.2). The receiving agent SHOULD merge the two Locus Points by:

- Setting `confidence` to `min(a.confidence, b.confidence) + 20` (capped at 255) — intersection is a confidence bonus.
- Setting `source_count` to `a.source_count + b.source_count`.
- Retaining the tighter (smaller) `scope` of the two.

If the two Locus Points conflict (`contradiction_flag` on either, or incompatible body claims), the receiving agent MUST set `contradiction_flag: true` on the merged record and MUST NOT apply the confidence bonus.

### 7.4 Collaborative Frontier Identification

The dual of the intersection of two agents' known complexes — what neither agent has observed but both agents' beliefs predict — is the most efficient frontier for collaborative exploration. Formally: if *K₁* and *K₂* are the known complexes of two agents, the bounded components of *S² \ (K₁ ∪ K₂)* that are adjacent to both agents' high-confidence Locus Points are priority exploration targets. Agents SHOULD communicate this dual frontier as a list of `@BELIEF:` coordinate targets rather than raw percepts.

---

## 8. Contradiction Handling and Belief Revision

### 8.1 Detection

Contradictions within a Locus Point's scope are detected during Phase 1 (Replay) when two toot-bits within the scope assert mutually exclusive states on the same typed edge. The contradiction detection algorithm is implementation-defined; at minimum, implementations MUST detect direct semantic negation within the same edge type.

When a contradiction is detected, the Locus Point is still written but with `contradiction_flag: true`. It is not suppressed. A belief that is internally contradicted is still a belief — it is a belief that the agent knows it cannot yet fully trust.

### 8.2 Resolution

Contradiction resolution is triggered when:
- A new toot-bit falls within the scope of a `contradiction_flag: true` Locus Point, AND
- The new toot-bit provides evidence sufficient to resolve the conflict (implementation-defined).

On resolution:
1. Clear `contradiction_flag`.
2. Increment `confidence` by 10 (capped at 255) — successful resolution strengthens the belief.
3. Advance `updated` to the current timestamp.
4. The resolving toot-bit MUST NOT be immediately eligible for compression — it should remain in the episodic record as the resolution witness for at least one full Dream Cycle.

### 8.3 Permanent Contradiction

If a Locus Point reaches `source_count` ≥ 50 with `contradiction_flag: true` still set, it MUST be demoted: `confidence` is set to 0, the record is retained, and a `relates:unresolved>` edge is written pointing to the highest-`rev` toot-bit within its scope. Demoted Locus Points are not eligible for compression use. They serve as explicit markers of open problems in the agent's world model.

---

## 9. Relationship to Existing RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0001 (File Format) | Locus Points extend the record format with the `@BELIEF:` coordinate prefix and the `[lp]` block. Backward compatible: prior parsers ignore unknown prefixes. The `dream_cycle` key extends the `mmpdb` block. |
| TTDB-RFC-0003 (Typed Edges) | Locus Points participate in typed edges: `compresses>`, `generalizes>`, `unresolved>`, and any domain edges. The `relates:` header field applies to Locus Points identically to standard records. |
| TTDB-RFC-0005 (Epistemic Weight) | The `[ew]` block MAY be added to Locus Points; `confidence` in `[lp]` (walk coverage, §5.2) and `conf` in `[ew]` (per-entry epistemic confidence) are distinct quantities on different scales. Implementations MUST NOT copy one into the other. The EPS formula in TBEW §3.3 applies to Locus Points. |
| TTDB-RFC-0006 (Experiential Perception) | The Dream Cycle is the operational implementation of the episodic→semantic gap identified in RFC-0006. The 1-simplex / Alexander duality framing in RFC-0006 §5.3 provides the mathematical foundation for Phase 2 (Projection). |
| A32-RFC-0002 (TTDB Storage on ESP32) | Graph compression (§6) directly targets the 12-byte index entry cost defined in A32-RFC-0002 §2.1 and §6. The `dream_cycle` compute budget (§4) is sized for ESP32-S3 with PSRAM. |
| A32-RFC-0003 (Agent Loop) | The Dream Cycle runs in a new **CONSOLIDATE** phase inserted between ACT and the next SENSE. Implementations SHOULD add a `consolidate()` hook to the agent loop that triggers the Dream Cycle when idle conditions are met. |

---

## 10. Open Questions

1. **Persistent homology (Phase 3):** The current approach uses discrete random walks for belief extraction. A principled Phase 3 would compute persistent homology over the TTDB complex — identifying topological features (connected components, loops) that persist across filtrations. This would surface beliefs that are topologically stable, not just statistically frequent. Deferred pending a reference implementation.

2. **`scope` shape:** The current spec uses a rectangular lat/lon bounding box. For spatially irregular clusters, a convex hull or a minimum bounding circle may be more appropriate. This affects the overlap test in §7.3.

3. **Walk weighting beyond `sal`:** Phase 1 weights walks by TBEW `sal`. Should `conf` also influence step probability (preferring well-settled paths) or inversely (preferring high-uncertainty regions to resolve them)? Both are defensible; the choice changes what beliefs get extracted.

4. **`@BELIEF:` vs `@LOCUS:`:** Should the namespace prefix be `@LOCUS:` for consistency with the framework name, or `@BELIEF:` for semantic clarity? This RFC uses `@BELIEF:` but does not close the question.

5. **Cold storage format:** This RFC specifies that archived toot-bits MUST be stored in a valid TTDB file but does not specify the archive's `mmpdb` schema or how the archive is linked from the main TTDB. A follow-on RFC or amendment SHOULD specify the archival file format.

6. **Belief propagation across trust boundaries:** §7 assumes agents in ESP-NOW range are trusted. For deployments where agents may have adversarial or unreliable peers, Locus Point sharing should be gated by a trust score (see TTN-RFC-0005). The interaction between trust, confidence bonuses, and `contradiction_flag` is unspecified here.

7. **ARC-AGI-3 integration:** The Locus Point's `@BELIEF:` namespace and the Phase 2 projection algorithm are designed to be directly applicable as a world-model layer in ARC-AGI-3 action-observation loops. A separate implementation note or A32-adjacent RFC will address the Kaggle submission harness.

---

## 11. References

- Wilson, M. A. & McNaughton, B. L. (1994). Reactivation of hippocampal ensemble memories during sleep. *Science* 265, 676–679.
- Lee, A. K. & Wilson, M. A. (2002). Memory of sequential experience in the hippocampus during slow wave sleep. *Neuron* 36, 1183–1194.
- Lewis, P. A., Knoblich, G. & Poe, G. (2018). How memory replay in sleep boosts creative problem-solving. *Trends in Cognitive Sciences* 22, 491–503.
- McClelland, J. L., McNaughton, B. L. & O'Reilly, R. C. (1995). Why there are complementary learning systems in the hippocampus and neocortex. *Psychological Review* 102, 419–457.
- TTG-RFC-0003 §2: counting consolidation, the evidence-based and recency-neutral counterpart of Phase 1.

---

## 12. Changelog

| Date | Change |
|---|---|
| 2026-05-15 | Initial draft |
| 2026-11-23 | **v0.2**, from an external review. §2.2 rewritten as "inspired by": slow-wave replay well supported, the REM account a hypothesis, episodic traces kept (as §6.2 already required), sequence order not reproduced; "direct functional analog" withdrawn. §3.2 step 4: the claim that replay is "deliberately atemporal" withdrawn (recency enters through the start set and `sal` decay); recency-neutral variant defined. §3.2 step 6: noted that the `conf` criterion admits unassessed nodes; added the null-baseline criterion. §5.2: wrap-aware centroid longitude; `confidence` restated as walk coverage, not comparable to TBEW `conf`; §5.2.1 degree-preserving null baseline (normative) and `belief_excess_threshold`; §5.2.2 held-out falsifier DC-1 (proposed, not run). §6.1 and §7.3 marked provisional on DC-1. §9: `[lp]` and `[ew]` confidences MUST NOT be synchronized. References added. |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0*
