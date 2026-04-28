# Agent 32 — RFC Index

Agent 32 is a framework for building autonomous ESP32 devices using
MyMentalPalaceDB (TTDB) as an onboard, static knowledge base. No cloud
LLMs. No neural inference. Just deterministic graph-based reasoning on
a $5 microcontroller.

## RFCs

| RFC | Title | Status | Summary |
|-----|-------|--------|---------|
| A32-RFC-0001 | Architecture Overview | Draft | System layers, design principles, hardware requirements, umwelt mapping |
| A32-RFC-0002 | TTDB Storage and Parsing | Draft | LittleFS/SD storage, streaming parser, index structure, librarian queries |
| A32-RFC-0003 | Agent Loop and Hardware Abstraction | Draft | Sense-reason-act cycle, sensor/actuator registries, edge-based reasoning |
| A32-RFC-0004 | Claude Code Project Setup | Draft | Project layout, CLAUDE.md reference, PlatformIO config, TTE integration |
| A32-RFC-0002-Amendment-A-TBEW | TBEW Parser Extension | Draft | C++ structs, state machine extension, field parse helpers, writer for [ew] blocks |

## Dependencies

These RFCs build on:

- **TTDB-RFC-0001** (File Format) from toot-toot-engineering — defines the
  on-disk TTDB format that Agent 32 reads.

## Getting Started

1. Clone a new repo using the TTE template.
2. Copy these RFCs into the `RFCs/` directory.
3. Create your TTDB file in `data/ttdb.md`.
4. Set up `CLAUDE.md` per A32-RFC-0004 Section 3.
5. Tell Claude Code to run WORKFLOW.md.

## License

MIT — same as toot-toot-engineering.
