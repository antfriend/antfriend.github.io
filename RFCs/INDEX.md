# RFC Index

This index lists RFCs included in the TTE 1.0 bundle.

**Compressed form:** [rfc.ttdb.md](rfc.ttdb.md) is the semantic compression of this
corpus — a conformant TTDB with one record per RFC (normative gist + `depends_on`
edge graph + `[ew]` status weights) and a `lat 98` belief lane recording where
implemented reality diverges from spec text. Each record's `src:` line is its
deterministic expansion target (TTN-RFC-0004 applied to the corpus itself).


## TTDB (Toot-Toot Database)
- [TTDB-RFC-0001-File-Format.md](TTDB-RFC-0001-File-Format.md): File Format and Sections
- [TTDB-RFC-0002-Cursor-Semantics.md](TTDB-RFC-0002-Cursor-Semantics.md): Cursor Semantics and Selection Rules
- [TTDB-RFC-0003-Typed-Edges.md](TTDB-RFC-0003-Typed-Edges.md): Typed Edge Semantics — v1.1 adds symmetric edge types, written on both records, and `opposes` (semantic polarity, never read as `contradicts`); v1.2: `contradicts` is written once by the record raising the conflict and read as symmetric by conflict consumers
- [TTDB-RFC-0004-Event-ID-and-Collision.md](TTDB-RFC-0004-Event-ID-and-Collision.md): Event ID Assignment and Collision Handling — v1.1: determinism holds only given the same existing IDs (no cross-device address guarantee; identity is TTDB-RFC-0010 §4); `southeast_step` (increment both, i.e. a north-east step) normative corpus-wide
- [TTDB-RFC-0005-Epistemic-Weight.md](TTDB-RFC-0005-Epistemic-Weight.md): Toot-Bit Epistemic Weight (TBEW) — optional [ew] block for confidence, revision, salience, and recency metadata; v1.1 withdraws the free-energy-approximation claim (EPS is a usage × doubt heuristic)
- [TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md](TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md): Experiential Perception as Synthetic Model (Locus framework foundation); extended into affective space by the [feelings_ttdb.md](../feelings_ttdb.md) store
- [TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md](TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md): Locus Point and Dream Cycle — episodic-to-semantic memory consolidation via two-phase offline graph traversal; `@BELIEF:` namespace; graph compression; multi-agent belief propagation. v0.2: "inspired by" sleep consolidation, not a direct analog; replay not atemporal; `confidence` is walk coverage, gated by a degree-preserving shuffled-graph null; wrap-aware centroid; held-out falsifier DC-1 proposed, not run
- [TTDB-RFC-0008-Narrative-Metamorphosis.md](TTDB-RFC-0008-Narrative-Metamorphosis.md): Narrative Metamorphosis — story-seeded life-stage transition from game-solving larva to orchestrating imago; `@IMAGO:seed` and `@META:state` namespaces; instar sequencing; eclosion predicate; ARC Prize 2026 worked example
- [TTDB-RFC-0009-Counter-Story-and-Narrative-Morphospace.md](TTDB-RFC-0009-Counter-Story-and-Narrative-Morphospace.md): Counter-Story and Narrative Morphospace — generalizes TTDB-RFC-0008's scene-as-instar to the claim that pattern (morphospace) targets are stored as traversal order and the ending is the stopping condition; and that a **counter-story** from a genuinely divergent umwelt changes the *topology* of a store's ignorance while a corroborating account only changes its *volume*. Defines the residual high-EPS set `R(S,θ)`, the Jaccard-distance metric contract (the instrument that must not be a dashboard), the paired narrative/assertional construction, and the heterogeneity gate. (Proposed; nothing run on hardware)
- [TTDB-RFC-0010-Stigmergic-Fields-and-Record-Identity.md](TTDB-RFC-0010-Stigmergic-Fields-and-Record-Identity.md): Stigmergic Fields, Lane Discipline, and Stable Record Identity — defines the three memory disciplines a TTDB may hold (**EVIDENCE** append-only, **FIELD** decaying-and-reinforced, **PROVENANCE** never reclaimed) and requires every lane to declare which it is, with EVIDENCE as the fail-safe default. Fences decay away from anything that must not silently rewrite itself (§6: no measured constant from a field, no `derived_from` into one, and the acceptance test that the system stays correct with the field **empty**). Retires ordinal record names via TTDB-RFC-0004 §2's stable hash — `sid:<8 hex>` as identity with the coordinate kept as address. Decay is evaluated on read and never written. §8.1 states the falsifier for a lane with no prune path. (Authored in the `robot_team` checkout; stages 1–3 implemented and hardware-verified there)
- [TTDB-RFC-0011-Precision-Weighting-and-the-Ignition-Filter.md](TTDB-RFC-0011-Precision-Weighting-and-the-Ignition-Filter.md): Precision Weighting and the Ignition Filter — adds signal precision `prec` (π) to `[ew]` beside belief precision `conf`; integer Kalman-style gain `K = 255·π/(π+conf)` replaces fixed confidence steps (a contradiction below `k_revise` flags the belief contested without rewriting it); precision-weighted error `ε = pe·π/255` ignites into a capacity-`W` decaying workspace. Allocates `@LAT108` PRECISION (EVIDENCE, KEY, folded in Replay) and `@LAT109` WORKSPACE (FIELD, KEY). Fleet profile: broadcast gate, trust-capped received precision, `EPS × π` look selection as the smallest closure of `@LAT20LON3`; grimoire profile is read-only. Attention and valence move what is *noticed*, never what is *believed*. Named for and inspired by Dehaene's global neuronal workspace "ignition"; aims to synthesize it experimentally (PW-6). (Proposed; stage-2 replays PW-1, PW-2 and PW-4 passed as pre-registered, PW-3 falsified the broadcast gate as specified; PW-1b, re-deriving `pe_span`, INCONCLUSIVE and answers open question 6 for acoustic only; stage 1 readers implemented in `robot_team`; stage 3 (`@LAT108` on the Cardputer, observed not used) passed on its third run under a gate tool corrected after the run, §8.5)

## TTN (Toot Toot Network)
- [TTN-RFC-0001.md](TTN-RFC-0001.md): Core Semantic Mesh Specification
- [TTN-RFC-0002-Typed-Edges.md](TTN-RFC-0002-Typed-Edges.md): Typed Edge Taxonomy — **v1.1** adds a seventh group, semantic polarity (`opposes`), the type `TTDB-RFC-0003` §7 defines and `feelings_ttdb.md` uses 22 times
- [TTN-RFC-0003-Reference-Implementation.md](TTN-RFC-0003-Reference-Implementation.md): Reference Implementation Checklist
- [TTN-RFC-0004-Semantic-Compression.md](TTN-RFC-0004-Semantic-Compression.md): Semantic Compression and Token Dictionary
- [TTN-RFC-0005-Trust-and-Reputation.md](TTN-RFC-0005-Trust-and-Reputation.md): Trust and Reputation Signals
- [TTN-RFC-0006-LoRa-Packet-Framing.md](TTN-RFC-0006-LoRa-Packet-Framing.md): Minimal LoRa Packet Framing
- [TTN-RFC-0007-Reliable-Delivery.md](TTN-RFC-0007-Reliable-Delivery.md): Reliable Delivery — `want_ack`/ACK semantics, timeout+backoff retransmission, the dedup-vs-ACK re-ACK rule, and chunk reassembly (Implemented ✅ on-device 2026-06-22; PLAN.md Phase 2)
- [TTN-RFC-0008-Time-Sync.md](TTN-RFC-0008-Time-Sync.md): Fleet Time-Sync — `TIME_SYNC`/`TIME_REQ`/`TIME_RESP` toots, clock-offset adoption, append-only TTDB sync log (`lat 99` lane), and NTP-lite skew verification (Implemented ✅ on-device 2026-06-22; PLAN.md Phase 2.5; builds on TTN-RFC-0007)
- [TTN-RFC-0009-TTDB-Push-Back.md](TTN-RFC-0009-TTDB-Push-Back.md): TTDB Push-Back / Belief Distribution — `TTDB_PUT` offset-addressed belief stream, CRC-32 whole-object integrity, `belief_id` exactly-once adoption, append-only `BELIEF-ADOPTED` log (`lat 98` lane); the propagation half of the Dream Cycle (Implemented ✅ on-device 2026-06-24; PLAN.md Phase 6; builds on TTN-RFC-0007 + TTDB-RFC-0007)
- [TTN-RFC-0010-Fleet-Pulse.md](TTN-RFC-0010-Fleet-Pulse.md): Fleet Pulse — self-synchronizing ~1 Hz heartbeat and the **band time-base**: `PULSE` (type 13) chart beacon (v2, 30 B: `scene_id`, the band's place in a multi-part song, carried on the chart so it survives conductor handoff; v1 28-byte payloads still accepted), peer-seeded pulse clock (`gPulseOffsetMs`), first-up-conducts / lowest-id-keeps election with `era` handoff, drift-paced beacons (zero per-beat traffic), ±50 ms as musical **swing**, and a `Part`/instrument split for parts & melodies. K10 toots + RGB; **V4s get an LED pulse**. (Implemented ✅ end-to-end on-device 2026-06-26 → 2026-07-06, incl. parts/melodies and the 120 BPM duet; sibling of Phase 2.5; builds on TTN-RFC-0008)
- [TTN-RFC-0011-Semantic-Positioning.md](TTN-RFC-0011-Semantic-Positioning.md): Semantic Positioning — the formal/normative half of the **primary hypothesis** (`ttn-semantic-positioning.md`): position is *recoverable from* umwelt overlap, not merely *assigned*. States the SPH, the confidence-weighted overlap measure `Ω(i,j)` (over TBEW `conf`/`sal`), the MDS/spring-relaxation embedding (shape for free; one anchor fixes it to Earth), Semantic Odometry, the two failure modes (spacetime entanglement §8.1 — the blocking open problem; modal incommensurability §8.2), and a zero-cost RSSI-vs-`Ω` validation procedure for the V4-A/B/C spine. (Draft; SP0 evidence layer `LinkPercept` live on-device; PLAN.md Act II; builds on TTDB-RFC-0006/-0007 + TTN-RFC-0008)

## TTCP (Toot Toot Content Publishing)
- [TTCP-RFC-0001-Record-Rendering.md](TTCP-RFC-0001-Record-Rendering.md): File Ingestion, Record Parsing, and HTML Rendering
- [TTCP-RFC-0002-Globe-and-Navigation.md](TTCP-RFC-0002-Globe-and-Navigation.md): Knowledge Globe, Cursor Selection, Discovery, Tour, and Scene Playback
- [TTCP-RFC-0003-Link-System-and-Addressability.md](TTCP-RFC-0003-Link-System-and-Addressability.md): Toot URI Scheme, URL Synchronization, and Search

## TTG (Toot Toot Grammar)

A person's own words as a question-answering store, where the file is the grammar: every
grammar rule, word list and reply phrase lives in one TTDB, and the runtime that reads it
holds no natural-language word. 1.0, stable; the reference runtime is
[personal_grimoire](../personal_grimoire/index.html), whose tests check these RFCs against it.

- [TTG-RFC-0001-Grammar-in-the-Store.md](TTG-RFC-0001-Grammar-in-the-Store.md): Grammar in the Store (1.1: `asked_holds` among the reply keys; 1.2: the frame numbers; 1.3: past forms and endings; 1.4: `modifier` and `privative`; 1.5: the parameters, named; 1.6: constructions, the ninth kind; 1.7: `read_by_is_a`; 1.8: `construction_contested`; 1.9: the pro-verb; 1.10: `stem_restore`) — the `ttdb-grammar` and `ttdb-sphere` blocks, the nine grammar kinds, the embedding surface, several languages in one store, and the **runtime contract**: no natural-language word or reply phrase in the interpreter
- [TTG-RFC-0002-Semantic-Percepts.md](TTG-RFC-0002-Semantic-Percepts.md): Semantic Percepts, Episodes and Terms (1.1: collisions use TTDB-RFC-0004's `southeast_step`; 1.2: the reference runtime conforms; 1.3: the `holds:` line; 1.4: the `gap:` line and a verb's `frames:`; 1.5: the `tense:` line; 1.6: §7.2 narrowed) — the percept line (subject, vector, object, polarity, quantifier), episode and term records, placement on the grammar sphere, byte-stable write-back
- [TTG-RFC-0003-Beliefs-Reasoning-Response.md](TTG-RFC-0003-Beliefs-Reasoning-Response.md): Beliefs, Vector Reasoning and Grounded Response (1.1: a question after a stance names what it holds; 1.2: the frame numbers' values; 1.3: a change in tense is not counted; 1.4: `modifier_max_words`; 1.5: questions with the verb first; 1.6: place questions along a verb's phrasal vectors; 1.7: questions a construction reads; 1.8: questions about the verb; 1.9: what a subject does; 1.10: and what it inherits; 1.11: a preposition before the wh-word) — consolidation over episodes, vector algebra, Datalog-style rules, inference with specificity, and replies whose grounds are said, inferred, contested or superseded, never printed alike
- [TTG-RFC-0004-Time-and-the-Fleet.md](TTG-RFC-0004-Time-and-the-Fleet.md): Time — (1.1: a change in the owner's tense, §3.7) the order of sayings without a clock, `exclusive` vectors whose later sayings retire earlier ones, the `superseded` ground (§2–3 stable); and, proposed, how a fleet orders sayings on a shared pulse (§4, builds on TTN-RFC-0010)
- [TTG-RFC-0005-Shapes-and-Amendments.md](TTG-RFC-0005-Shapes-and-Amendments.md): Shapes and Amendments — a clause as any alternating run of nounish and verbish segments; relative and stance clauses; held sayings, never believed, including both readings of a sentence the grammar reads two ways, named so the owner can choose; a stance linked to what it holds (1.1); what a verb takes counted in episodes, the grammar's guesses at a gap apart (1.2); hedges held, and the past marked (1.3); modifiers as subclasses of a phrase's head, off by default (1.4); a question whose verb names its own subject (1.5); the shape notation the owner overrules a reading with; amendments kept beside the episode, and re-readings that report a grammar change without writing until the owner takes them
- [TTG-RFC-0006-Constructions.md](TTG-RFC-0006-Constructions.md): Constructions — Shapes That Carry Meaning (0.14, draft) — the ninth grammar kind: a shape in the owner's marks paired with the percepts a clause of that shape says (*X V Y off Z*: Y goes off Z); matched on a whole clause, most specific first, the owner's marks overruling it; named in the reply; each language its own; rejected when unsafe, as rules are; a network by default inheritance, each construction saying what its ancestors say and overriding it (0.2), from several parents, what they dispute held (0.3); abstract constructions, never matched, only inherited (0.4); a verbish name tied to its verbs by lemma (0.5), and a nounish one to its things, so an idiom can mean what its words don't (0.6); a Spanish construction, *de* read as *off* after a verb that moves a thing (0.7); questions read by constructions, every atom answered (0.8), and a gap at the verb (0.9), with or without a thing (0.10), and what it inherits (0.11); a preposition before the wh-word (0.12); part of a clause, a stance's clause or a relative (0.13), and a relative inside a stance's clause (0.14)

## ARC (ARC-AGI-3 Competition Agent)

The companion-arc agent for the ARC Prize 2026 ARC-AGI-3 competition. A general
count-based explorer (the additive floor) with an optional recognition-gated,
abortable per-instance solver layer over it.

| RFC | Title | Status | Summary |
|-----|-------|--------|---------|
| [ARC-RFC-0001-Dynamics-Solver-Architecture.md](ARC-RFC-0001-Dynamics-Solver-Architecture.md) | Dynamics Solver Architecture | Proposed | Additive, recognition-gated, abortable solver layer over the explorer; `Dynamic` protocol (recognize/re-derive/expect); supervisor with explorer-floor fallback; de-risk test plan |

## A32 (ESP32 Autonomous Device Framework)

Agent 32 is a framework for building autonomous ESP32 devices using the Toot-Toot Database (TTDB) as an onboard, static knowledge base. No cloud LLMs. No neural inference. Just deterministic graph-based reasoning on a $5 microcontroller.

### A32 RFCs

| RFC | Title | Status | Summary |
|-----|-------|--------|---------|
| [A32-RFC-0001-Architecture.md](A32-RFC-0001-Architecture.md) | Architecture Overview | Stable | System layers, design principles, hardware requirements, umwelt mapping |
| [A32-RFC-0002-TTDB-Storage.md](A32-RFC-0002-TTDB-Storage.md) | TTDB Storage and Parsing | Stable | LittleFS/SD storage, streaming parser, index structure, librarian queries |
| [A32-RFC-0003-Agent-Loop.md](A32-RFC-0003-Agent-Loop.md) | Agent Loop and Hardware Abstraction | Stable | Sense-reason-act cycle, sensor/actuator registries, edge-based reasoning |
| [A32-RFC-0004-Claude-Code-Setup.md](A32-RFC-0004-Claude-Code-Setup.md) | Claude Code Project Setup | Stable | Project layout, CLAUDE.md reference, PlatformIO config, TTE integration |
| [A32-RFC-0002-Amendment-A-TBEW.md](A32-RFC-0002-Amendment-A-TBEW.md) | TBEW Parser Extension | Stable | C++ structs, state machine extension, field parse helpers, writer for [ew] blocks |

### A32 Dependencies

These RFCs build on:

- **TTDB-RFC-0001** (File Format)
- **TTDB-RFC-0002** (Cursor Semantics)
- **TTDB-RFC-0003** (Typed Edges)
- **TTDB-RFC-0005** (Epistemic Weight)

### A32 Getting Started

1. Clone a new repo using the TTE template.
2. Copy these RFCs into the `RFCs/` directory.
3. Create your TTDB file in `data/ttdb.md`.
4. Set up `CLAUDE.md` per A32-RFC-0004 Section 3.

