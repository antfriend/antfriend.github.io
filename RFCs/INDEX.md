# RFC Index

This index lists RFCs included in the TTE 1.0 bundle.

## TTN (Toot Toot Network)
- [TTN-RFC-0001.md](TTN-RFC-0001.md): Core Semantic Mesh Specification
- [TTN-RFC-0002-Typed-Edges.md](TTN-RFC-0002-Typed-Edges.md): Typed Edge Taxonomy
- [TTN-RFC-0003-Reference-Implementation.md](TTN-RFC-0003-Reference-Implementation.md): Reference Implementation Checklist
- [TTN-RFC-0004-Semantic-Compression.md](TTN-RFC-0004-Semantic-Compression.md): Semantic Compression and Token Dictionary
- [TTN-RFC-0005-Trust-and-Reputation.md](TTN-RFC-0005-Trust-and-Reputation.md): Trust and Reputation Signals
- [TTN-RFC-0006-LoRa-Packet-Framing.md](TTN-RFC-0006-LoRa-Packet-Framing.md): Minimal LoRa Packet Framing

## TTDB (Toot-Toot Database)
- [TTDB-RFC-0001-File-Format.md](TTDB-RFC-0001-File-Format.md): File Format and Sections
- [TTDB-RFC-0002-Cursor-Semantics.md](TTDB-RFC-0002-Cursor-Semantics.md): Cursor Semantics and Selection Rules
- [TTDB-RFC-0003-Typed-Edges.md](TTDB-RFC-0003-Typed-Edges.md): Typed Edge Semantics
- [TTDB-RFC-0004-Event-ID-and-Collision.md](TTDB-RFC-0004-Event-ID-and-Collision.md): Event ID Assignment and Collision Handling
- [TTDB-RFC-0005-Epistemic-Weight.md](TTDB-RFC-0005-Epistemic-Weight.md): Toot-Bit Epistemic Weight (TBEW) — optional [ew] block for confidence, revision, salience, and recency metadata
- [TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md](TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md): Experiential Perception as Synthetic Model (Locus framework foundation)

## TTE (Toot Toot Engineering)
- TTE-RFC-0001-Workflow-and-Roles.md: Workflow and Roles
- TTE-RFC-0002-Plan-Log-and-Checklist.md: Plan, Log, and Checklist Requirements
- TTE-RFC-0003-Definition-of-Done-and-Release.md: Definition of Done and Release Packaging

## TTCP (Toot Toot Content Publishing)
- [TTCP-RFC-0001-Record-Rendering.md](TTCP-RFC-0001-Record-Rendering.md): File Ingestion, Record Parsing, and HTML Rendering
- [TTCP-RFC-0002-Globe-and-Navigation.md](TTCP-RFC-0002-Globe-and-Navigation.md): Knowledge Globe, Cursor Selection, Discovery, Tour, and Scene Playback
- [TTCP-RFC-0003-Link-System-and-Addressability.md](TTCP-RFC-0003-Link-System-and-Addressability.md): Toot URI Scheme, URL Synchronization, and Search

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
5. Tell Claude Code to run WORKFLOW.md.
