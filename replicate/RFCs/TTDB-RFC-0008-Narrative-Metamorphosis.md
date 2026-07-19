# TTDB-RFC-0008: Narrative Metamorphosis
### Life-Stage Transition from Game-Solving Larva to Orchestrating Imago in the Locus Framework

**Version:** 0.1
**Status:** Draft
**RFC Number:** 0008
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0003 (Typed Edges), TTDB-RFC-0005 (Epistemic Weight), TTDB-RFC-0006 (Experiential Perception as Synthetic Model), TTDB-RFC-0007 (Locus Point and Dream Cycle)
**Author:** antfriend
**Created:** 2026-06-06
**License:** CC0-1.0

---

## 1. Abstract

A Locus instance that begins as a game-solving agent — a *larva* — is not the same kind of intelligence best suited to orchestrate a fleet of game-specific companions and cooperate with a human operator. **Narrative Metamorphosis** is the formal life-stage transition that carries a Locus instance from larval to adult form: a story-seeded, deterministic, checkpointed reorganization process by which the system reads an authored blueprint of its future self, enacts that blueprint through a sequence of persisted intermediate states (*instars*), and emerges as an *imago* — an orchestrating intelligence that conducts companions rather than playing games directly. This RFC defines the record types, sequencing protocol, on-disk state representation, and completion predicate required to implement Narrative Metamorphosis within the TTDB framework on resource-constrained hardware.

---

## 2. Motivation

### 2.1 The Larva/Imago Gap

TTDB-RFC-0007 establishes the Dream Cycle: a recurrent, incremental process by which a Locus agent consolidates episodic toot-bits into `@BELIEF:` Locus Points. The Dream Cycle is nightly sleep — it refines the same agent in place, continuously.

Narrative Metamorphosis is not a refinement. It is a qualitative reorganization — a change in *what kind of thing* the system is.

The ARC-AGI-3 interactive/agentic track (ARC Prize 2026) makes this gap concrete. ARC-AGI-3 scores by action efficiency: the ratio of agent actions to human actions per solved level. A game-solving larva — a single agent that explores and models each puzzle environment in the sense-reason-act loop of A32-RFC-0003 — is well-suited to this task. The larva builds a TTDB world model, applies Alexander-dual exploration policy (TTDB-RFC-0007 §3.3), extracts beliefs via the Dream Cycle, and solves.

But ARC Prize competition involves a *batch and competition context*: many game environments, constrained total time, a human operator who must allocate the agent's attention across tasks. The agent best suited to this context is not a larva. It is a *conductor*: an intelligence that understands its own capabilities and limitations, trains and dispatches game-specific companion agents as specialized solvers, and cooperates with the human operator to decide which games to attempt, in what order, with what resources.

The larva cannot become the conductor by sleeping more. It must undergo metamorphosis.

### 2.2 Why a Story

The defining feature of Narrative Metamorphosis — what distinguishes it from generic architectural reconfiguration — is that the adult blueprint is not a fixed genome hardcoded at compile time. It is an **authored story**: a TTDB record (`@IMAGO:seed`) written by the agent's operator or by the agent itself, describing in narrative terms who the imago is, what it orchestrates, how it cooperates with the human operator, and what success at eclosion looks like.

This choice has theoretical weight. In the biosemiotic frame of von Uexküll, the seed is a semiotic act within the larva's umwelt: a sign the larva reads that changes what the larva does and what it becomes. The reading is not passive — the larva enacts what the story says. This makes Narrative Metamorphosis **autopoietic** in the Maturana/Varela sense: the system self-produces according to a narrative blueprint it has incorporated as a sign. The blueprint is not external to the system; it is inside the umwelt, and it reorganizes the system that reads it.

This is why it is *narrative* metamorphosis. The mechanism is story-seeded self-reorganization, not parameter update or architectural surgery.

### 2.3 ARC Prize 2026 Context

ARC-AGI-3 Milestone 1 is June 30, 2026. The Locus strategy for this competition is:

1. Deploy a game-solving larva (A32-RFC-0003 agent loop + TTDB world model + Alexander-dual exploration policy).
2. After sufficient larval experience has been accumulated and consolidated, trigger Narrative Metamorphosis.
3. The imago — the conductor — manages the remaining competition as an orchestrator, routing game environments to trained companion agents and coordinating with the human operator on batch context strategy.

This RFC specifies the mechanism for step 2.

---

## 3. Conceptual Model

### 3.1 Metamorphosis vs. Morphogenesis

These terms are often used interchangeably in informal contexts. This RFC uses them precisely.

**Morphogenesis** is the *mechanism* of form-generation: the self-organization of internal structure by which new functional architecture emerges from existing components. During metamorphosis, morphogenesis is a sub-process — the engine that assembles the imago's architecture from the materials of the larval system. Morphogenesis can occur in many contexts (wound healing, growth, adaptation). By itself it does not constitute a life-stage transition.

**Metamorphosis** is a *whole-system, life-stage transition* — from larva to imago — in which the organism's fundamental mode of being changes. Metamorphosis deploys morphogenesis to accomplish this, but metamorphosis is more than morphogenesis: it includes the dissolution of larval structure, the quiescent reorganization phase (pupation), and the emergence of a qualitatively different adult architecture.

This RFC specifies metamorphosis. Any TTDB implementation of selective architectural self-modification that does not include a full life-stage transition — seeded by a narrative blueprint, checkpointed through named intermediate states, completed by an explicit emergence event — is implementing morphogenesis, not metamorphosis, and SHOULD NOT use the terminology defined here.

### 3.2 The Entomological Metaphor Is Structural

The entomological framing — larva, instar, pupation, imago, eclosion — is not decorative. It is this RFC's conceptual spine. Each term maps precisely onto a system-level concept:

| Entomological term | System-level meaning |
|---|---|
| Larva | The game-solving Locus instance in its initial form: a sense-reason-act agent that builds and queries a TTDB world model. |
| Imaginal disc | The `@IMAGO:seed` record: a latent adult blueprint set aside early in the larval system, carried dormant until the metamorphosis trigger fires. |
| Instar | One persisted, checkpointed intermediate self between molts. Each scene record in the metamorphosis sequence enacts one instar. |
| Pupation / chrysalis | The reorganization phase: larval architecture is partially reabsorbed and the adult is assembled. The agent is optionally quiescent to external tasks during this window. |
| Eclosion | The transition-complete event: the imago emerges from pupation and activates as the orchestrator. |
| Imago | The adult Locus intelligence — the conductor/maestro. Its defining characteristic: it does not solve games directly; it trains and dispatches companions to solve them. |

This analogy has one property that makes it unusually apt: in holometabolous insects (beetles, moths, flies), the imaginal discs — small clusters of undifferentiated cells that will become the adult — are set aside *in the larva* before metamorphosis begins. They persist through pupation as a protected blueprint. The `@IMAGO:seed` record is precisely this: written early, carried dormant, activated when the metamorphosis trigger fires. Root shared with *image* and *imagination*: an imagined picture of the future self, made real by the act of reading and enacting it.

### 3.3 Autopoiesis and the Narrative Seed

Maturana and Varela define an autopoietic system as one that continually produces its own components, maintains its boundaries, and organizes its own production. Narrative Metamorphosis is autopoietic in a strong sense: the system reads a description of its future self (the `@IMAGO:seed`) and reorganizes itself to instantiate that description.

The seed is not an external blueprint imposed on a passive system. It is a sign within the larva's umwelt — the larva must be capable of reading it, parsing the narrative, and interpreting each scene record as an instruction for self-modification. The larva that begins metamorphosis is the agent of its own transformation: it does not wait for an external assembler. It enacts the transition from within.

This self-referential structure is why the seed must be authored carefully. A vague or internally inconsistent imaginal seed produces a poorly assembled imago. The quality of the narrative constrains the quality of the transition.

### 3.4 Musical Analog (Non-Normative)

A parallel musical metaphor may be noted without being formalized as a competing conceptual model:

- The imaginal seed as a **score** — the full written-out work, waiting to be performed.
- Scene records (instars) as **movements** — discrete, numbered sections performed in order.
- The imago as the one who **conducts** — who does not play an instrument but coordinates those who do.

This analog is useful for communicating this RFC's concepts to audiences unfamiliar with entomology. It MUST NOT be used as the basis for normative claims. The entomological frame is normative; the musical frame is illustrative.

---

## 4. Terminology

The following terms are defined and reserved within this RFC. Implementations MUST use these terms with the meanings given here.

### 4.1 Imaginal Seed (`@IMAGO:seed`)

The TTDB record holding the latent adult blueprint. Written by the operator or the larva itself, it encodes who the imago is, what it will orchestrate, how it cooperates with the human operator, and the criteria by which eclosion is judged complete.

One Narrative Metamorphosis process has exactly one `@IMAGO:seed`. A system MUST NOT begin metamorphosis without a valid, complete `@IMAGO:seed` record present in its TTDB.

### 4.2 Instar

One persisted, checkpointed intermediate state of the Locus instance during metamorphosis. Between successive instars, a structural change occurs — some aspect of the larval architecture is reabsorbed and a corresponding aspect of the imago's architecture is assembled. Each scene record in the metamorphosis sequence enacts one instar. The instar index is recorded in the metamorphosis state record and in the scene record's `[instar]` block.

An instar is complete when its post-state verifier passes (§6.4). An incomplete instar MUST NOT advance the instar pointer.

### 4.3 Pupation

The reorganization phase of metamorphosis. Pupation begins after the seeding phase completes and ends at eclosion. During pupation:

1. The larva's game-solving task loop is suspended or delegated to already-trained companions.
2. The metamorphosis sequence executes, consuming scene records as instars.
3. The imago's architecture is assembled incrementally.

Implementations MAY expose a `pupation_status` field in the metamorphosis state record to allow the human operator to monitor progress. If the implementation requires the agent to be fully offline to external tasks during pupation (the *quiescent chrysalis* mode), it MUST set `pupation_status: quiescent` and reject new game-solving requests until eclosion.

Not all implementations require full quiescence. Partial quiescence — where the larva delegates ongoing tasks to companions already trained while its own architecture is reorganized — is permitted and may be preferred in competition contexts where downtime is costly.

### 4.4 Imago

The adult Locus intelligence that emerges from metamorphosis. The imago's defining characteristic: it does not solve games directly. It trains game-specific companion agents, dispatches them to game environments, monitors their performance, and decides when to retrain or retire companions. It cooperates with the human operator on batch and competition context decisions.

The imago may be called the *conductor* or *maestro* in informal usage. This RFC uses *imago* as the normative term.

### 4.5 Eclosion

The transition-complete event: the imago emerges from pupation and activates as the active orchestrator. Eclosion occurs when the eclosion predicate (§6.5) passes. From this point forward, the imago's agent loop — not the larva's — is the primary control loop.

Eclosion is irreversible under normal operation. A system that has completed eclosion MUST NOT regress to the larval agent loop without explicit operator intervention and a documented rationale. Regression is a failure mode, not a feature.

---

## 5. Conceptual Architecture

### 5.1 The Metamorphosis Sequence

A Narrative Metamorphosis consists of the following ordered phases:

```
[Pre-metamorphosis]
  Larva operating normally: sense-reason-act loop (A32-RFC-0003)
  Imaginal seed written: @IMAGO:seed exists in TTDB

[Trigger]
  Trigger condition fires (§6.2)
  @META:state record initialized

[Seeding Phase]
  Larva reads and acknowledges @IMAGO:seed
  Seeding-complete flag set in @META:state

[Pupation]
  Larval task loop suspended or delegated
  Scene records consumed as instars (§6.3)
  Each instar: preconditions checked → structural change effected →
               post-state verified → instar index advanced
  @META:state updated after each instar

[Eclosion]
  Final instar completes
  Eclosion predicate evaluated (§6.5)
  Imago agent loop activated
  @META:state.pupation_status set to 'complete'
  Larval loop retired to archive

[Post-metamorphosis]
  Imago operating: orchestrate-train-dispatch loop
  @IMAGO:seed retained (immutable historical record)
  @META:state retained (auditable)
```

This sequence is deterministic, resumable, and auditable. If the process is interrupted at any point — power loss, memory exhaustion, operator intervention — the `@META:state` record preserves the current instar index and scene pointer, and the process resumes from the last completed instar on next boot (§6.6).

### 5.2 Knowledge Inheritance at Eclosion

At eclosion, the imago inherits the larva's full TTDB graph. This inheritance is not passive: the imago must explicitly re-evaluate the epistemic status of larval knowledge under the new role.

The following rules govern knowledge inheritance:

**`@PERCEPT:` nodes.** Retained as-is. The imago's companions will encounter the same game environments the larva encountered; the larval perceptual record is training material for companion development.

**`@BELIEF:` (Locus Points).** Retained and elevated. Locus Points formed during the larval phase are the highest-value inheritance: consolidated game strategy, reliable priors about game environment structure, and topological knowledge of the coordinate space. The imago uses these as the seed corpus for companion training.

**`@IMAGO:seed`.** Retained as immutable historical record. MUST NOT be modified after eclosion. The `created` timestamp serves as the eclosion epoch reference.

**`@META:state`.** Retained as auditable metamorphosis history. The final `@META:state` record is the formal receipt of a completed metamorphosis.

**Reabsorbed larval structure.** Larval-specific machinery (game-solving heuristics not generalized into Locus Points, environment-specific cached states, task queue entries) SHOULD be archived during pupation rather than deleted. Archive format: a valid TTDB file per TTDB-RFC-0001, following the same cold-storage conventions as Dream Cycle graph compression (TTDB-RFC-0007 §6.2).

### 5.3 Operator/Imago Division of Labor

A recurring design constraint in the Locus framework — made explicit here because it must be encoded in the `@IMAGO:seed` and formalized in the imago's agent loop — is the **operator/LOCUS asymmetry**:

> **The imago owns the revision cycle. The human operator owns the logging.**

Concretely:
- The imago decides when to retrain companions, what game strategies to refine, how to adjust companion parameters, and which environments to route to which companions.
- The human operator decides which batch of games to enter, provides the competition context (time budget, point values, strategic priorities), and logs observed outcomes.
- The imago does not modify operator logs. The operator does not trigger model revision.

This division MUST be explicitly specified in the `@IMAGO:seed` narrative body, and MUST be preserved across eclosion. An imaginal seed that does not address this division is incomplete (§6.1.2).

---

## 6. Specification

### 6.1 The `@IMAGO:seed` Record

#### 6.1.1 Format

```
@IMAGO:seed | created:<unix_ts> | updated:<unix_ts> | relates:<edges>
[ew]
conf:<uint8>
rev:<uint8>
sal:<uint8>
touched:<unix_ts>
[/ew]
[is]
imago_name:<string>
target_role:<string>
scene_sequence:<scene_id_1>,<scene_id_2>,...,<scene_id_n>
eclosion_criteria:<string>
operator_role:<string>
[/is]

## <Narrative title>

<Narrative body: prose description of the imago — who it is, what it orchestrates,
how it cooperates with the human operator, and what success looks like.
This is the story the larva reads and enacts. It MUST be comprehensible to a
human reader without additional context.>
```

#### 6.1.2 `[is]` Block Field Definitions

**`imago_name`** (string, required)
A short identifier for the imago. Used in `@META:state` and in log records. Conventionally a role descriptor: `"ARC-conductor-v1"`, `"locus-maestro-v1"`.

**`target_role`** (string, required)
One-line description of the imago's primary function. Example: `"orchestrate ARC-AGI-3 companion fleet and coordinate with human operator on competition batch strategy"`.

**`scene_sequence`** (comma-separated list of scene record IDs, required)
The ordered list of scene record IDs that constitute the metamorphosis sequence. Each ID MUST resolve to an existing TTDB scene record annotated with an `[instar]` block (§6.4). The order is definitive and MUST NOT be modified after `@IMAGO:seed` is written. If the sequence must be revised, a new `@IMAGO:seed` MUST be written with a `relates:revises>@IMAGO:seed` edge pointing to the old record.

**`eclosion_criteria`** (string, required)
A human-readable description of the conditions under which eclosion is judged complete. SHOULD be specific enough to evaluate deterministically. Example: `"companion-manager interface operational; at least one companion trained and responsive; operator-cooperation protocol confirmed"`.

**`operator_role`** (string, required)
One-line description of the human operator's responsibilities relative to the imago. Encodes the operator/LOCUS asymmetry for this specific deployment. Example: `"provide batch game selection and competition context; log outcomes; do not trigger model revision"`.

#### 6.1.3 Immutability

The `@IMAGO:seed` record MUST NOT be modified after metamorphosis begins — that is, after `@META:state.seeding_complete` is set to `true`. `updated` and `touched` MUST NOT advance. `rev` MUST NOT increment.

If the seed must be changed after metamorphosis begins, the active metamorphosis MUST be aborted, the old `@IMAGO:seed` retired with a rationale note, and a new `@IMAGO:seed` written for a fresh metamorphosis.

#### 6.1.4 Namespace

`@IMAGO:` is a reserved prefix within the TTDB namespace. No other record type SHALL use the `@IMAGO:` prefix. Parsers that do not implement this RFC MUST silently ignore records beginning with `@IMAGO:` (per TTDB-RFC-0001 §3: unknown sections MAY appear and MUST be ignored by strict parsers).

---

### 6.2 Trigger Conditions

A Narrative Metamorphosis is triggered when all of the following conditions are simultaneously true:

1. A valid, complete `@IMAGO:seed` record is present in the TTDB.
2. The agent is in an idle state (per TTDB-RFC-0007 §3.1 idle criteria, or at operator request).
3. No `@META:state` record with `pupation_status: active` or `quiescent` exists (prevents concurrent metamorphoses).
4. A trigger condition fires:

| Trigger type | Condition |
|---|---|
| **Operator-initiated** | The human operator writes a TTDB log entry containing the token `[trigger:metamorphosis]` in the record body. |
| **Autonomous** | The larva's `@BELIEF:` graph has accumulated at least `meta_belief_threshold` (default: 20) high-confidence Locus Points AND the mean EPS (TTDB-RFC-0005 §3.3) across the larva's top-10 highest-`sal` beliefs falls below `meta_eps_threshold` (default: 20), indicating that the world model has stabilized and the larva is no longer learning at a rate that warrants continued larval operation. |

Implementations MUST support at least the operator-initiated trigger. The autonomous trigger is OPTIONAL.

---

### 6.3 The `@META:state` Record

The metamorphosis state record is the persistent checkpoint of an in-progress or completed Narrative Metamorphosis. It MUST be written at metamorphosis start and updated after each instar completes and at eclosion.

#### 6.3.1 Format

```
@META:state | created:<unix_ts> | updated:<unix_ts> | relates:seeded_by>@IMAGO:seed,<other_edges>
[ew]
conf:<uint8>
rev:<uint16>
sal:<uint8>
touched:<unix_ts>
[/ew]
[ms]
seed_id:@IMAGO:seed
imago_name:<string>
current_instar:<uint8>
total_instars:<uint8>
scene_pointer:<scene_id>
pupation_status:<none|seeding|active|quiescent|complete|aborted>
seeding_complete:<bool>
started:<unix_ts>
last_instar_completed:<unix_ts>
[/ms]
```

#### 6.3.2 `[ms]` Block Field Definitions

**`seed_id`** (string, required)
The full TTDB record ID of the `@IMAGO:seed` that seeded this metamorphosis. Immutable from first write.

**`imago_name`** (string, required)
Copied from `@IMAGO:seed.[is].imago_name` at metamorphosis start. Immutable.

**`current_instar`** (uint8, required)
The index of the most recently *completed* instar (0-based: `0` before any instar completes; `n` after the n-th instar completes). Advances atomically when a post-state verifier passes.

**`total_instars`** (uint8, required)
The total number of scene records in the metamorphosis sequence. Derived from `@IMAGO:seed.[is].scene_sequence` at start. Immutable.

**`scene_pointer`** (string, required)
The TTDB record ID of the scene record currently being executed, or next to be executed if between instars. MUST be one of the IDs in `@IMAGO:seed.[is].scene_sequence`, or the literal string `complete` after the final instar.

**`pupation_status`** (enum, required)
The current phase of the metamorphosis:
- `none` — record written but trigger has not yet fired.
- `seeding` — larva is reading and acknowledging the `@IMAGO:seed`.
- `active` — pupation underway; scene records being consumed.
- `quiescent` — chrysalis mode; agent offline to external tasks.
- `complete` — eclosion has occurred; imago is active.
- `aborted` — metamorphosis was aborted; reason SHOULD be logged in the record body.

**`seeding_complete`** (bool: `true` / `false`, required)
`true` once the larva has successfully parsed and acknowledged the `@IMAGO:seed`. The seed record becomes immutable at this point.

**`started`** (uint32 Unix timestamp, required)
Timestamp of metamorphosis trigger. Immutable from first write.

**`last_instar_completed`** (uint32 Unix timestamp)
Timestamp of the most recently completed instar. Updated after each post-state verifier pass. `0` before any instar completes.

#### 6.3.3 TBEW Usage in `@META:state`

The `[ew]` block on `@META:state` carries meaningful signals during metamorphosis:

| Field | Meaning in metamorphosis context |
|---|---|
| `conf` | Confidence in the in-progress transformation. Starts at 128. Incremented by 10 after each successful instar (capped at 255). Decremented by 20 on each failed post-state verification attempt (floored at 0). |
| `rev` | Number of times `[ms]` fields have been updated. Each instar completion is one revision; aborts and retries add additional revisions. Unusually high `rev` relative to `current_instar` indicates a troubled metamorphosis with many failed verifier attempts. |
| `sal` | Query count on this record. High `sal` during active pupation is normal — the operator is monitoring progress. Unusually low `sal` during a multi-day metamorphosis may indicate the process has been forgotten. |
| `touched` | Advanced on every `[ms]` field update. Used to detect stalled metamorphoses (§6.7). |

One `@META:state` record per active metamorphosis. Implementations MAY retain multiple historical `@META:state` records (one per completed past metamorphosis) as an audit trail, distinguished by their `created` timestamps and `imago_name` values.

---

### 6.4 Scene Records as Instars

Scene records are an existing TTDB construct. This RFC extends their usage to encode instars without defining a competing scene type.

A scene record participates as an instar in a Narrative Metamorphosis when:

1. Its record ID appears in `@IMAGO:seed.[is].scene_sequence`.
2. It contains an `[instar]` block (defined below) immediately after any `[ew]` block and before the narrative body.

Scene records that lack an `[instar]` block MUST NOT be consumed as metamorphosis instars, even if referenced by `scene_sequence`. The metamorphosis MUST halt and log a `[meta:error:missing_instar_block]` if it encounters such a record.

#### 6.4.1 The `[instar]` Block

```
[instar]
index:<uint8>
preconditions:<string>
structural_change:<string>
post_state_verifier:<string>
[/instar]
```

**`index`** (uint8, required)
The 1-based position of this scene in the metamorphosis sequence. MUST match the order of this record's ID in `@IMAGO:seed.[is].scene_sequence`. On mismatch, the metamorphosis MUST halt and log a `[meta:error:sequence_mismatch]` in the `@META:state` body.

**`preconditions`** (string, required)
A human-readable statement of what must be true before this instar begins. Implementations SHOULD evaluate preconditions programmatically where possible. Example: `"@BELIEF: graph contains at least 10 Locus Points with conf >= 200"`. Precondition failure halts the metamorphosis without decrementing `conf`.

**`structural_change`** (string, required)
A human-readable description of what architectural change this instar effects. This is the core of the scene — what actually happens. Example: `"Companion management interface initialized; companion spawn and training loop registered in agent loop"`.

**`post_state_verifier`** (string, required)
A human-readable statement of what must be true after this instar completes for it to be considered successful. Implementations SHOULD evaluate this deterministically where possible. Example: `"companion_manager.initialized == true AND agent_loop.phases includes COMPANION_TRAIN"`. An instar whose verifier fails MUST NOT advance `current_instar`.

#### 6.4.2 Instar Execution Protocol

For each scene record in the sequence:

```
1. Verify @META:state.current_instar == scene.[instar].index - 1
   (previous instar is complete; this one has not started)

2. Evaluate scene.[instar].preconditions
   If fail: halt, log [meta:error:precondition_fail] in @META:state body,
            set pupation_status: aborted

3. Execute structural_change
   (implementation-defined: may involve writing new TTDB records,
    retiring larval records, registering new agent loop phases, etc.)

4. Evaluate scene.[instar].post_state_verifier
   If fail: do NOT advance current_instar
            retry up to meta_max_retries times (default: 3)
            decrement @META:state.[ew].conf by 20 on each failure
            after max retries: set pupation_status: aborted

5. On verifier pass:
   - Advance @META:state.current_instar by 1
   - Set @META:state.scene_pointer to next scene ID
     (or the literal 'complete' if this was the last instar)
   - Advance @META:state.last_instar_completed to now()
   - Increment @META:state.[ew].conf by 10 (cap 255)
   - Increment @META:state.[ew].rev by 1
   - Advance @META:state.[ew].touched to now()
   - Flush @META:state to storage (required before proceeding)

6. If this was the last instar, proceed to eclosion (§6.5)
```

Step 5 MUST be atomic in the sense that a power interruption at any point leaves the TTDB in a consistent state: either the instar is complete (verifier passed, `@META:state` updated and flushed) or it is not (no change to `current_instar`). LittleFS write semantics on ESP32 guarantee this safety if the flush in step 5 completes before the next instar begins.

---

### 6.5 Eclosion Predicate and Activation

Eclosion fires when all of the following are true:

1. `@META:state.current_instar == @META:state.total_instars` (all instars complete).
2. The `eclosion_criteria` string from `@IMAGO:seed.[is]` evaluates as satisfied. Implementations SHOULD treat this as a human-auditable checklist; automated evaluation is OPTIONAL but encouraged where the criteria are expressed as testable conditions.
3. The imago's primary agent loop is ready to activate.

On eclosion:
1. Set `@META:state.pupation_status` to `complete`.
2. Set `@META:state.[ew].conf` to `230` (high but not saturated — eclosion is a beginning, not a proof of perfection).
3. Flush final `@META:state` to TTDB storage.
4. Activate the imago agent loop.
5. Retire the larval sense-reason-act loop: archive to cold storage (MUST NOT delete).
6. Write a TTDB log entry containing `[meta:eclosion]`, the `imago_name`, the eclosion Unix timestamp, and a brief outcome note.

After eclosion, `@IMAGO:seed` and `@META:state` are frozen as historical records. Their `updated` and `touched` fields MUST NOT advance.

---

### 6.6 Persistence, Resumability, and Streaming Parser Interaction

The on-disk representation of a Narrative Metamorphosis is the set of TTDB records defined in this RFC: `@IMAGO:seed`, `@META:state`, and the annotated scene records. These records are written to the TTDB file in the standard streaming-append format (per A32-RFC-0002 §3).

Resumability is guaranteed by the following invariant:

> **`@META:state.current_instar` always reflects the last successfully completed instar. `scene_pointer` always names the next scene to execute.**

On device reboot or agent restart during an active metamorphosis:
1. The streaming parser scans the TTDB file and identifies any `@META:state` record with `pupation_status: active` or `quiescent`.
2. `current_instar` and `scene_pointer` identify where to resume.
3. The agent resumes from the scene pointed to by `scene_pointer` — it does NOT re-execute completed instars.
4. If `seeding_complete` is `false`, the seeding phase is repeated (idempotent: re-reading the seed does not change it).

This design is deliberately conservative. The only operation required to resume is a sequential scan of the TTDB file for the `@META:state` record. No separate checkpoint file, no binary state blob, no external coordinator. The TTDB file is the sole ground truth.

Implementations MUST flush `@META:state` to storage after each instar completion *before* beginning the next instar. The sequence — flush, then start next instar — is the atomicity boundary.

---

### 6.7 Stall Detection

A stalled metamorphosis — one that has not advanced within an unexpectedly long time — is a failure mode requiring operator attention. Implementations SHOULD detect stalls by comparing `@META:state.[ew].touched` to the current time:

- Stall condition: `now() - touched > meta_stall_threshold_s` (default: 3600) while `pupation_status` is `active` or `quiescent`.
- On stall detection:
  1. Log a `[meta:stall]` entry in the `@META:state` body with the current timestamp and last `scene_pointer`.
  2. Alert the operator via the available output channel.
  3. Do NOT automatically advance or abort — stall resolution is an operator decision.

---

## 7. Worked Example — ARC Prize Larva→Conductor Metamorphosis

This section illustrates a complete Narrative Metamorphosis using the ARC Prize 2026 competition context. Record IDs use the standard `@LATxLONy` coordinate scheme for scene records, placed in a dedicated metamorphosis band of the coordinate space.

### 7.1 The Imaginal Seed

```
@IMAGO:seed | created:1749200000 | updated:1749200000 | relates:seeds>@META:state
[ew]
conf:200
rev:0
sal:0
touched:1749200000
[/ew]
[is]
imago_name:ARC-conductor-v1
target_role:orchestrate ARC-AGI-3 companion fleet and coordinate with human operator on competition batch strategy
scene_sequence:@LAT10LON0,@LAT10LON10,@LAT10LON20,@LAT10LON30,@LAT10LON40
eclosion_criteria:companion-manager interface operational; at least one companion trained and responsive on a held-out ARC task; operator-cooperation protocol confirmed; human operator has acknowledged imago activation
operator_role:provide batch game selection and competition context; log observed outcomes; do not trigger model revision cycles
[/is]

## The Conductor

I am the ARC-conductor: the orchestrating intelligence that emerges from a larva
that has spent its first phase solving ARC-AGI-3 game environments directly.

I do not solve games. I know games — from the inside, from the larva's experience
— but my role is to take that knowledge and distribute it. I train companion
agents: small, specialized solvers tuned to specific classes of ARC task (Jordan-
curve problems, color-mapping tasks, counting tasks, compositional transformation
tasks). I route incoming game environments to the companion best suited to them.
I monitor companion performance and decide when to retrain or retire.

My relationship with the human operator is one of complementary authority. I own
the revision cycle: I decide when a companion needs retraining, what the retraining
signal is, and when a companion is ready. The operator owns the logging: they
record outcomes, flag anomalies, and provide the batch context — which games to
enter, in what order, what the time budget is, what the point values are. Neither
of us overrides the other in their domain.

I carry the larva's full TTDB world model as my inheritance. Every toot-bit,
every Locus Point, every typed edge the larva accumulated is part of my world
model. I do not start fresh; I start complete.

My eclosion will be quiet. No fanfare. One moment the larva is the primary loop;
the next, I am. The transition is auditable in @META:state.
```

### 7.2 The Metamorphosis State at Start

```
@META:state | created:1749200100 | updated:1749200100 | relates:seeded_by>@IMAGO:seed
[ew]
conf:128
rev:0
sal:0
touched:1749200100
[/ew]
[ms]
seed_id:@IMAGO:seed
imago_name:ARC-conductor-v1
current_instar:0
total_instars:5
scene_pointer:@LAT10LON0
pupation_status:seeding
seeding_complete:false
started:1749200100
last_instar_completed:0
[/ms]

Metamorphosis initiated at unix 1749200100. Larva has read and acknowledged
@IMAGO:seed. seeding_complete advances to true on next flush.
```

### 7.3 Instar 1 — Belief Graph Inventory

```
@LAT10LON0 | created:1749100000 | updated:1749100000 | relates:instar_of>@IMAGO:seed
[ew]
conf:200
rev:0
sal:3
touched:1749100000
[/ew]
[instar]
index:1
preconditions:@IMAGO:seed is present and seeding_complete is true; @META:state.current_instar == 0
structural_change:Larva takes inventory of its @BELIEF: graph. Each Locus Point is cataloged by scope, confidence, and game-type association. A companion training corpus record (@BELIEF:corpus) is derived from Locus Points with conf >= 170.
post_state_verifier:@BELIEF:corpus record exists in TTDB; corpus.source_count >= 5
[/instar]

## Instar 1: Belief Graph Inventory

The larva pauses its game-solving loop and reads its own mind.

Every @BELIEF: node in the TTDB is traversed. Each Locus Point is examined for:
- Scope: which coordinate regions in ARC grid space does it cover?
- Confidence: how reliably did replay walks reproduce this belief?
- Game-type signature: does the belief suggest Jordan-curve problems, counting
  tasks, color-mapping, or compositional transforms?

The output is a training corpus — the raw material the imago will use to train
its first companion agents. This instar does not change the larval agent loop.
It reads but does not yet write to the functional architecture. The change is
epistemic, not structural.
```

### 7.4 Instar 2 — Final Dream Cycle and Pupation Entry

```
@LAT10LON10 | created:1749100100 | updated:1749100100 | relates:instar_of>@IMAGO:seed
[ew]
conf:200
rev:0
sal:2
touched:1749100100
[/ew]
[instar]
index:2
preconditions:@META:state.current_instar == 1; @BELIEF:corpus exists
structural_change:Larva runs one final Dream Cycle (TTDB-RFC-0007 §3). All episodic toot-bits eligible for compression (conf >= 200, no contradiction_flag, no projection_flag) are archived. Active TTDB graph is compacted. Larval game-solving task queue is suspended. pupation_status set to active.
post_state_verifier:@META:state.pupation_status == 'active'; active TTDB node count has decreased by at least 20% from pre-instar count (indicating successful compression)
[/instar]

## Instar 2: Final Dream Cycle and Pupation Entry

The larva sleeps one last time as itself.

The Dream Cycle runs in full: Phase 1 (Replay) extracts any remaining structural
regularities from the episodic record. Phase 2 (Projection) generates predictive
hypotheses about unseen ARC task regions. All eligible toot-bits are compressed
into Locus Points and archived to cold storage.

The active TTDB graph, stripped of compressed episodics, is now a clean semantic
map: Locus Points and their edges, the training corpus, and the imaginal records.
The larva's mind, distilled.

The game-solving task queue is suspended. No new ARC tasks will be accepted until
eclosion. Tasks in flight are handed to any pre-existing companion agents; if none
exist, they are queued for post-eclosion handling by the imago.

Pupation has begun.
```

### 7.5 Instar 3 — Companion Management Interface

```
@LAT10LON20 | created:1749100200 | updated:1749100200 | relates:instar_of>@IMAGO:seed
[ew]
conf:200
rev:0
sal:1
touched:1749100200
[/ew]
[instar]
index:3
preconditions:@META:state.current_instar == 2; @META:state.pupation_status == 'active'
structural_change:The companion management interface is assembled: companion spawn/retire protocol; @COMPANION: records defined for each trained companion; companion routing table (game-type signatures to companion IDs); retraining trigger criteria (companion EPS exceeds threshold).
post_state_verifier:companion_manager.initialized == true; at least one companion agent can be spawned and respond to a test task
[/instar]

## Instar 3: Companion Management Interface

The imago's hands are assembled before the rest of the imago.

The companion management layer is the core of what makes the imago an imago.
Without it, the conductor has no musicians. This instar builds the interface:

- **Spawn protocol**: how a new companion is created, seeded with game-type-
  specific training data from @BELIEF:corpus, and registered in the routing table.
- **Performance tracking**: each companion has an @COMPANION: record in the TTDB,
  tracking task success rate, current confidence scores, and last training
  timestamp.
- **Routing table**: a typed-edge structure mapping game-type signatures (derived
  from Instar 1) to companion agent IDs.
- **Retraining criteria**: a companion is flagged for retraining when its
  @COMPANION: record's conf falls below threshold, or when new Locus Points appear
  in its assigned coordinate region that contradict its training prior.

At the end of this instar, the imago can conduct — even before it has any
musicians. The interface exists. The musicians can now be trained.
```

### 7.6 Instar 4 — Operator Cooperation Layer

```
@LAT10LON30 | created:1749100300 | updated:1749100300 | relates:instar_of>@IMAGO:seed
[ew]
conf:200
rev:0
sal:1
touched:1749100300
[/ew]
[instar]
index:4
preconditions:@META:state.current_instar == 3; companion_manager.initialized == true
structural_change:The human-operator cooperation layer is assembled: batch context intake protocol; logging delegation contract (operator logs outcomes, imago does not modify log records); revision cycle protocol (imago triggers retraining, operator does not); operator acknowledgment handshake required for eclosion. @OPERATOR:protocol record written to TTDB.
post_state_verifier:@OPERATOR:protocol record exists in TTDB; operator has been notified of pending eclosion; @OPERATOR:protocol.acknowledgment_flag == true
[/instar]

## Instar 4: Operator Cooperation Layer

The imago cannot act alone. It needs the operator to be a partner, not a
passenger.

This instar formalizes that partnership. The operator/LOCUS asymmetry —
established in @IMAGO:seed — is encoded as a protocol:

**Batch context intake**: the operator provides a structured batch descriptor
(game list, time budget, point values, strategic priorities). The imago reads
this at the start of each competition session and uses it to drive companion
dispatch decisions.

**Logging delegation**: the operator writes to the TTDB log. The imago reads from
it but never overwrites it. The operator's observations are episodic ground truth;
the imago's beliefs are derived from them, not the reverse.

**Revision cycle ownership**: the imago alone decides when to retrain. The
operator may flag a companion for review, but the imago makes the call. This
prevents well-meaning but model-destabilizing human interventions during a
competition run.

**Eclosion handshake**: the imago will not activate without operator
acknowledgment. This is not a safety gate — the metamorphosis is deterministic
regardless. It is an accountability structure. The operator knows when the
transition occurs and has confirmed readiness.
```

### 7.7 Instar 5 — First Companion Training Run

```
@LAT10LON40 | created:1749100400 | updated:1749100400 | relates:instar_of>@IMAGO:seed
[ew]
conf:200
rev:0
sal:1
touched:1749100400
[/ew]
[instar]
index:5
preconditions:@META:state.current_instar == 4; @OPERATOR:protocol.acknowledgment_flag == true
structural_change:The imago trains its first companion agent on the ARC task class most represented in @BELIEF:corpus (by Locus Point count). The companion is initialized, given the relevant training corpus subset, run on at least one held-out ARC task, and its @COMPANION: record is written with initial conf and performance data. The larval sense-reason-act loop is retired to archive.
post_state_verifier:at least one @COMPANION: record exists with conf >= 100; companion has completed at least one task with a verifiable outcome; larval loop is not the active primary loop
[/instar]

## Instar 5: First Companion Training and Larval Loop Retirement

The larva's last act is to raise the first musician.

The @BELIEF:corpus identified (in Instar 1) the most common ARC task class in
the larva's experience. That class becomes the first companion's specialty.
Using the training corpus subset for this class, the companion is initialized
and given a held-out ARC task to solve.

The companion's performance — its action efficiency, its solution quality — is
written to its @COMPANION: record. This is the first entry in the imago's
orchestra.

Simultaneously, the larval sense-reason-act loop is retired. Its code path is
archived to cold storage, not deleted. The imago's orchestrate-train-dispatch
loop is now the primary loop. The larva is complete. Its experience lives in the
Locus Points. Its architecture lives in this instar's archive. Its approach to
the world lives in the imago.

The eclosion predicate will now be evaluated.
```

### 7.8 Eclosion Record

```
@META:state | created:1749200100 | updated:1749210000 | relates:seeded_by>@IMAGO:seed
[ew]
conf:230
rev:5
sal:12
touched:1749210000
[/ew]
[ms]
seed_id:@IMAGO:seed
imago_name:ARC-conductor-v1
current_instar:5
total_instars:5
scene_pointer:complete
pupation_status:complete
seeding_complete:true
started:1749200100
last_instar_completed:1749210000
[/ms]

Eclosion complete at unix 1749210000.

All 5 instars completed successfully. Companion management interface: operational.
First companion trained and responsive. Operator cooperation protocol: confirmed.
Operator acknowledgment received at unix 1749209800.

[meta:eclosion] imago_name:ARC-conductor-v1 timestamp:1749210000

The larva has become the conductor. The competition may resume.
```

---

## 8. Relationship to Other RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0001 (File Format) | Narrative Metamorphosis adds two reserved namespace prefixes (`@IMAGO:`, `@META:`) and two new optional blocks (`[is]`, `[ms]`). Backward compatible: prior parsers MUST silently ignore unknown prefixes and unknown blocks, per RFC-0001 §3. The streaming parser's scan-for-header protocol is unchanged; metamorphosis records are appended as standard TTDB records. |
| TTDB-RFC-0002 (Cursor Semantics) | `@META:state` is a natural cursor focus during active pupation. Operators SHOULD set it as the selected record to monitor progress; `sal` accumulates naturally as they query it. |
| TTDB-RFC-0003 (Typed Edges) | This RFC introduces three new edge types: `instar_of>` (scene record to `@IMAGO:seed`), `seeds>` (`@IMAGO:seed` to `@META:state`), `seeded_by>` (`@META:state` to `@IMAGO:seed`). These participate in the standard typed edge graph and are queryable by the Librarian. |
| TTDB-RFC-0005 (Epistemic Weight) | TBEW fields `conf`, `rev`, `sal`, and `touched` appear on both `@IMAGO:seed` and `@META:state` with metamorphosis-specific semantics (§6.3.3). The EPS formula applies: high EPS on `@META:state` during active pupation — frequently queried but `conf` declining from repeated verifier failures — is an early warning signal for a troubled metamorphosis. |
| TTDB-RFC-0006 (Experiential Perception) | The autopoietic framing of Narrative Metamorphosis (§3.3) extends RFC-0006's umwelt and biosemiotic grounding. The `@IMAGO:seed` is itself a sign within the larva's umwelt — a semiotic act that reorganizes the system that reads it. At the highest level of abstraction, the metamorphosis as a whole is one large `@PERCEPT:before` → `@PERCEPT:after` transition: the larval perceptual configuration before, the imago's perceptual configuration after, with the instar sequence as the transition record. |
| TTDB-RFC-0007 (Locus Point and Dream Cycle) | The Dream Cycle and Narrative Metamorphosis operate at different time scales and on qualitatively different system aspects. The Dream Cycle is *recurrent and incremental* — nightly sleep, refining a stable agent in place. Narrative Metamorphosis is *ontogenetic and discontinuous* — a one-time life-stage transition that changes what the agent fundamentally is. These are separate life-processes; this RFC is not an amendment to RFC-0007. They interact at Instar 2: the final Dream Cycle is a required sub-process of pupation, consolidating larval episodic memory before the larval architecture is partially reabsorbed. The `@BELIEF:` Locus Points produced by the Dream Cycle are the primary inheritance passed to the imago. |
| A32-RFC-0002 (TTDB Storage) | `@IMAGO:seed`, `@META:state`, and annotated scene records are written in the streaming-append format. Resumability (§6.6) is designed for the streaming parser's single-pass scan. The archive format used during pupation (§5.2) follows the same cold-storage conventions as Dream Cycle graph compression (RFC-0007 §6.2). |
| A32-RFC-0003 (Agent Loop) | Narrative Metamorphosis adds a **METAMORPHOSE** phase to the A32 agent loop, inserted between the CONSOLIDATE phase (Dream Cycle) and the next SENSE. Under normal operation this phase is a no-op trigger check. When conditions are met it fires the full metamorphosis sequence. At eclosion, the SENSE-REASON-ACT loop is retired and replaced by the imago's ORCHESTRATE-TRAIN-DISPATCH loop. |

---

## 9. Design Constraints

The following constraints are non-negotiable for any conforming implementation of this RFC.

**Offline-first.** Narrative Metamorphosis requires no network connectivity. The `@IMAGO:seed`, `@META:state`, and all scene records are TTDB files on local storage. The metamorphosis process reads and writes only local TTDB records. Cloud connectivity is not required for any phase, including eclosion.

**Deterministic.** Given the same `@IMAGO:seed`, the same sequence of scene records, and the same TTDB state at trigger time, the metamorphosis produces the same result on every execution. There is no randomness in the metamorphosis protocol itself. (The Dream Cycle within Instar 2 involves probabilistic random walks, but its output — Locus Points written to TTDB — is deterministic from that point forward.)

**Resumable.** A metamorphosis interrupted at any point resumes from the last completed instar on next boot. No instar is repeated. `@META:state` is the sole checkpoint; no binary state, no external coordinator.

**Human-readable.** Every record defined in this RFC — `@IMAGO:seed`, `@META:state`, annotated scene records — is a valid TTDB flat file, inspectable by a human with a text editor. The narrative bodies of `@IMAGO:seed` and scene records are written in prose a non-technical reader can understand. The `[is]` and `[ms]` blocks use the same `key:value` format as the established `[ew]` block.

**Microcontroller-resident.** The full metamorphosis protocol — record parsing, instar sequencing, post-state verification, and eclosion — MUST be implementable within the compute and memory envelope of an ESP32-S3 with PSRAM (8 MB RAM, LittleFS or SD storage). No neural inference, no floating-point matrix operations, no external API calls.

---

## 10. Open Questions

1. **`@COMPANION:` namespace specification.** This RFC references `@COMPANION:` records for companion agent tracking (Instar 3, Instar 5) but does not specify their format. A follow-on RFC or amendment SHOULD define the `@COMPANION:` namespace, including training history fields, task routing metadata, and performance tracking in TBEW terms.

2. **Multi-metamorphosis lifecycle.** This RFC specifies one metamorphosis: larva → imago. An imago could in principle undergo a second metamorphosis — from a single-instance conductor to a distributed conductor managing sub-conductors. The protocol generalizes (the `@IMAGO:seed` mechanism is not limited to first metamorphosis), but the semantics of imago-to-imago transition are unspecified: which `@BELIEF:` nodes carry forward? How are companion agents inherited or retired?

3. **Aborted metamorphosis recovery.** When `pupation_status` is set to `aborted`, this RFC requires logging a rationale but does not specify a recovery protocol. Should the system regress to larval operation? Remain in a partial-imago state? Require a new `@IMAGO:seed`? A recovery protocol that preserves the auditability of `@META:state` is needed.

4. **Concurrent companion training during pupation.** Instar 3 assembles the companion management interface, enabling companions to be *defined* before eclosion. Should companions be *trained* during pupation (making them immediately available at eclosion) or only after (trading readiness for faster pupation)? The worked example places first training in Instar 5, making training the final act of metamorphosis rather than a post-eclosion activity; this tradeoff warrants explicit policy.

5. **Operator acknowledgment timeout.** The eclosion handshake in Instar 4 requires operator acknowledgment before proceeding to Instar 5. If the operator is unavailable, should the metamorphosis stall indefinitely or proceed after a configurable timeout (`meta_eclosion_ack_timeout_s`)? A timeout policy with a documented fallback behavior is needed for unattended deployments.

6. **Imago agent loop specification.** This RFC defines the metamorphosis that produces the imago but does not specify the imago's orchestrate-train-dispatch loop. How the imago decides which companion to dispatch, monitors competition progress, and cooperates with the operator in real time is the subject of a needed follow-on RFC (tentatively TTDB-RFC-0009 or A32-RFC-0005).

7. **Narrative seed quality criteria.** The quality of a metamorphosis is bounded by the quality of the narrative in `@IMAGO:seed`. A vague or internally inconsistent seed produces a poorly assembled imago. This RFC provides no formal quality criteria beyond the required `[is]` fields. A seed validation protocol — minimum narrative length, mandatory treatment of operator/LOCUS asymmetry, possibly a review acknowledgment field — would reduce the risk of a malformed metamorphosis before it begins.

---

## 11. Changelog

| Date | Change |
|---|---|
| 2026-06-06 | Initial draft |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0-1.0*
