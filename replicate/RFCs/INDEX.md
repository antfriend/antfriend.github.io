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
- [TTDB-RFC-0003-Typed-Edges.md](TTDB-RFC-0003-Typed-Edges.md): Typed Edge Semantics
- [TTDB-RFC-0004-Event-ID-and-Collision.md](TTDB-RFC-0004-Event-ID-and-Collision.md): Event ID Assignment and Collision Handling
- [TTDB-RFC-0005-Epistemic-Weight.md](TTDB-RFC-0005-Epistemic-Weight.md): Toot-Bit Epistemic Weight (TBEW) — optional [ew] block for confidence, revision, salience, and recency metadata
- [TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md](TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md): Experiential Perception as Synthetic Model (Locus framework foundation)
- [TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md](TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md): Locus Point and Dream Cycle — episodic-to-semantic memory consolidation via two-phase offline graph traversal; `@BELIEF:` namespace; graph compression; multi-agent belief propagation
- [TTDB-RFC-0008-Narrative-Metamorphosis.md](TTDB-RFC-0008-Narrative-Metamorphosis.md): Narrative Metamorphosis — story-seeded life-stage transition from game-solving larva to orchestrating imago; `@IMAGO:seed` and `@META:state` namespaces; instar sequencing; eclosion predicate; ARC Prize 2026 worked example

## TTN (Toot Toot Network)
- [TTN-RFC-0001.md](TTN-RFC-0001.md): Core Semantic Mesh Specification
- [TTN-RFC-0002-Typed-Edges.md](TTN-RFC-0002-Typed-Edges.md): Typed Edge Taxonomy
- [TTN-RFC-0003-Reference-Implementation.md](TTN-RFC-0003-Reference-Implementation.md): Reference Implementation Checklist
- [TTN-RFC-0004-Semantic-Compression.md](TTN-RFC-0004-Semantic-Compression.md): Semantic Compression and Token Dictionary
- [TTN-RFC-0005-Trust-and-Reputation.md](TTN-RFC-0005-Trust-and-Reputation.md): Trust and Reputation Signals
- [TTN-RFC-0006-LoRa-Packet-Framing.md](TTN-RFC-0006-LoRa-Packet-Framing.md): Minimal LoRa Packet Framing
- [TTN-RFC-0007-Reliable-Delivery.md](TTN-RFC-0007-Reliable-Delivery.md): Reliable Delivery — `want_ack`/ACK semantics, timeout+backoff retransmission, the dedup-vs-ACK re-ACK rule, and chunk reassembly (Implemented ✅ on-device 2026-06-22; PLAN.md Phase 2)
- [TTN-RFC-0008-Time-Sync.md](TTN-RFC-0008-Time-Sync.md): Fleet Time-Sync — `TIME_SYNC`/`TIME_REQ`/`TIME_RESP` toots, clock-offset adoption, append-only TTDB sync log (`lat 99` lane), and NTP-lite skew verification (Implemented ✅ on-device 2026-06-22; PLAN.md Phase 2.5; builds on TTN-RFC-0007)
- [TTN-RFC-0009-TTDB-Push-Back.md](TTN-RFC-0009-TTDB-Push-Back.md): TTDB Push-Back / Belief Distribution — `TTDB_PUT` offset-addressed belief stream, CRC-32 whole-object integrity, `belief_id` exactly-once adoption, append-only `BELIEF-ADOPTED` log (`lat 98` lane); the propagation half of the Dream Cycle (Implemented ✅ on-device 2026-06-24; PLAN.md Phase 6; builds on TTN-RFC-0007 + TTDB-RFC-0007)
- [TTN-RFC-0010-Fleet-Pulse.md](TTN-RFC-0010-Fleet-Pulse.md): Fleet Pulse — self-synchronizing ~1 Hz heartbeat and the **band time-base**: `PULSE` (type 13) chart beacon, peer-seeded pulse clock (`gPulseOffsetMs`), first-up-conducts / lowest-id-keeps election with `era` handoff, drift-paced beacons (zero per-beat traffic), ±50 ms as musical **swing**, and a `Part`/instrument split for parts & melodies. K10 toots + RGB; **V4s get an LED pulse**. (Implemented ✅ end-to-end on-device 2026-06-26 → 2026-07-06, incl. parts/melodies and the 120 BPM duet; sibling of Phase 2.5; builds on TTN-RFC-0008)
- [TTN-RFC-0011-Semantic-Positioning.md](TTN-RFC-0011-Semantic-Positioning.md): Semantic Positioning — the formal/normative half of the **primary hypothesis** (`ttn-semantic-positioning.md`): position is *recoverable from* umwelt overlap, not merely *assigned*. States the SPH, the confidence-weighted overlap measure `Ω(i,j)` (over TBEW `conf`/`sal`), the MDS/spring-relaxation embedding (shape for free; one anchor fixes it to Earth), Semantic Odometry, the two failure modes (spacetime entanglement §8.1 — the blocking open problem; modal incommensurability §8.2), and a zero-cost RSSI-vs-`Ω` validation procedure for the V4-A/B/C spine. (Draft; SP0 evidence layer `LinkPercept` live on-device; PLAN.md Act II; builds on TTDB-RFC-0006/-0007 + TTN-RFC-0008)

## TTCP (Toot Toot Content Publishing)
- [TTCP-RFC-0001-Record-Rendering.md](TTCP-RFC-0001-Record-Rendering.md): File Ingestion, Record Parsing, and HTML Rendering
- [TTCP-RFC-0002-Globe-and-Navigation.md](TTCP-RFC-0002-Globe-and-Navigation.md): Knowledge Globe, Cursor Selection, Discovery, Tour, and Scene Playback
- [TTCP-RFC-0003-Link-System-and-Addressability.md](TTCP-RFC-0003-Link-System-and-Addressability.md): Toot URI Scheme, URL Synchronization, and Search

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

