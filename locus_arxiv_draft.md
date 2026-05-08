# arXiv Preprint Draft — Locus Framework

**File:** `mnemon_arxiv_draft.md`  
**Parent plan:** `locus_publication_plan.md`  
**Target:** arXiv cs.ET (primary), cs.AI + cs.IR (cross-list)  
**Format note:** Draft is in Markdown. Convert to LaTeX (`article` class) before arXiv submission.  
**Date:** 2026-05-08  
**Status:** First draft — review all claims before submission

---

## Title

**Locus: An Offline-First Embedded Knowledge Agent Framework Using Geographic Coordinate Addressing**

---

## Authors

Daniel Ray  
Independent researcher  
`antfriend@gmail.com`  
GitHub: `github.com/antfriend`

---

## Abstract

> **Target:** 150–200 words. This is the version to submit to arXiv. Every sentence must stand alone — reviewers decide in 30 seconds.

We present **Locus**, an offline-first embedded knowledge agent framework for resource-constrained microcontrollers (ESP32-class) and up. Locus introduces **@LATxLON** geographic coordinate addressing — an authority-free scheme in which every knowledge node is identified by a deterministic latitude/longitude pair requiring no registry, no network round-trip, and no external authority. Knowledge is stored as **toot-bits**, the minimal unit of semantic meaning, organized in **TTDB** (MyMentalPalaceDB): a flat Markdown or LaTeX knowledge graph traversable with no database engine. Each TTDB instance is bound to an **umwelt** — a formally specified subjective worldview that gives a device its identity and reasoning perspective. The framework is governed by a multi-RFC specification suite covering the mesh network protocol (TTN), the TTDB file format including cursor semantics, typed edges, and epistemic weight tracking (TBEW), engineering workflow (TTE), and the ESP32 autonomous device framework (A32). Agents operate via deterministic sense-reason-act loops over TTDB graph traversal — no cloud LLM inference required. We provide a 21-node affective knowledge graph grounded in hippocampal-prefrontal emotional embedding research, a six-node medical knowledge graph integrating UMLS Concept Unique Identifiers, and a complete open-source reference implementation. All specifications, artifacts, and firmware are publicly available.

---

## 1 — Introduction

Knowledge agents deployed at the edge face a fundamental tension: the richer the knowledge representation, the heavier the runtime dependency. Existing approaches either require cloud inference (introducing latency, connectivity dependency, and data sovereignty concerns) or strip semantics down to lookup tables (sacrificing expressiveness). We resolve this tension by separating the *knowledge format* from the *reasoning engine* and grounding both in a novel addressing scheme that requires no central authority.

The **@LATxLON** scheme assigns every knowledge record a coordinate-pair identifier derived from its position on a conceptual globe defined per-umwelt. Unlike URI schemes, which require an authority registry, or UUID schemes, which are opaque to humans, @LATxLON identifiers are deterministic, mnemonic, human-readable, and valid with zero network connectivity. A record at `@LAT30LON-20` is unambiguously located on its umwelt's globe — traversable, linkable, and reproducible from the specification alone.

**TTDB** (MyMentalPalaceDB) stores knowledge as plain Markdown or LaTeX, parsed with a two-pass indexed reader requiring approximately 12 bytes per record in RAM. **Agent 32 (A32)** runs this parser on ESP32-S3 hardware with 8MB flash and 2MB PSRAM, executing a 1-second sense-reason-act cycle entirely from local storage. The **Locus** framework unifies these components under a formal multi-RFC specification suite, enabling reproducibility, community extension, and cross-device interoperability without cloud infrastructure.

---

## 2 — Key Contributions

1. **@LATxLON addressing** — An authority-free, deterministic, human-readable namespace for knowledge nodes. Functions offline with no registration step. Scales from single-device to mesh-networked deployments.

2. **TTDB file format** — A flat Markdown/LaTeX knowledge graph specification with formal cursor semantics (TTDB-RFC-0002), typed directional edges (TTDB-RFC-0003), and toot-bit epistemic weight tracking (TBEW, TTDB-RFC-0005). No database engine required; parseable on a $5 microcontroller.

3. **Toot-Bit Epistemic Weight (TBEW)** — A per-record metadata block tracking confidence (`conf`, 0–255), revision count (`rev`), salience/query count (`sal`), and last-touch timestamp (`touched`). Derived signal EPS = sal × (255 − conf) / 255 identifies records that are heavily used but poorly understood — the primary attention targets for knowledge refinement.

4. **Umwelt formalism** — Operationalization of Uexküll's biosemiotic umwelt concept as a firmware-level device identity. Two physically identical ESP32 devices loaded with different TTDB files exhibit different behaviors, different reasoning paths, and different knowledge perspectives — they inhabit different umwelten.

5. **Multi-RFC specification suite** — Formal specifications covering TTN (semantic mesh network protocol with trust, compression, and LoRa framing), TTDB (file format, cursor, typed edges, event IDs, TBEW, experiential perception), TTE (engineering workflow), and A32 (ESP32 firmware architecture, TTDB parsing, agent loop, hardware abstraction, Claude Code project setup). Enables reproducibility and community fork/extend workflows.

6. **Affective knowledge graph** — A 21-node TTDB instance mapping feelings, emotions, dispositions, and intents on a valence/arousal coordinate space. Grounded in Ma & Kragel (2025) hippocampal-prefrontal emotional embedding research (*Nature Communications*). Deployable to ESP32 as a standalone affective reasoning module.

7. **Medical knowledge graph** — A six-node TTDB storyline template for clinical knowledge representation: symptom → condition → molecule → medicine → perceptual experience → outcome. Integrates UMLS Concept Unique Identifiers as a grounding layer for node identity. Designed for offline-first clinical decision support in low-resource settings.

---

## 3 — System Overview

*(Expand to full section in final paper; this is the abstract-level summary for the 1-page preprint.)*

The Locus stack has three tiers:

**Storage tier (TTDB):** A flat text file (Markdown or LaTeX) containing a YAML `mmpdb` header, a `cursor` block, and record sections separated by `---`. Each record is identified by `@LATxLONy`, carries a typed edge list (`relates:`), an optional `[ew]` epistemic weight block, and a free-text body in Markdown or LaTeX.

**Agent tier (A32):** Firmware for ESP32-class hardware. At boot, the two-pass parser builds an in-memory index (12 bytes/record). The agent loop reads sensor inputs, quantizes them to TTDB coordinates, finds the nearest record in the index, follows typed edges (`triggers`, `navigates_to`, `inhibits`, `requires`, `logs`), and drives actuators. Loop interval: 1 second default. Memory budget: ~3KB overhead + 12 bytes/record.

**Network tier (TTN):** An optional LoRa mesh network layer for multi-device deployments. Nodes communicate via semantic events rather than raw messages. A32 devices using LoRa implement TTN-RFC-0006 packet framing (SOF/VER/FLAGS/SRC/DST/TYPE/SEQ/LEN/PAYLOAD/CRC16/EOF). Semantic compression tokens (`P`, `S?`, `OK`, `T:x`, etc.) are gateway-expanded to full semantic events.

---

## 4 — Related Work

*(Placeholder — expand before submission)*

- **Knowledge graphs on embedded hardware:** Prior work (e.g., RDF-Turtle on Raspberry Pi-class devices) requires a SPARQL engine. TTDB achieves comparable expressiveness with a 3KB parser suitable for bare-metal ESP32.
- **Authority-free naming:** IPFS content addressing is hash-based and opaque. DIDs require a resolver. @LATxLON is position-based, human-readable, and resolver-free.
- **Umwelt in robotics:** Several papers apply umwelt metaphors to robotic sensor modeling; none formalize it as a firmware-level identity specification with a flat-file knowledge graph.
- **Offline AI agents:** TinyML frameworks (TensorFlow Lite Micro, Edge Impulse) use neural inference. Locus uses symbolic graph traversal — no training data, no model weights, fully inspectable.

---

## 5 — Availability

All specifications, reference firmware, and TTDB collections are available under open licenses at:

- GitHub organization: `github.com/toot-toot-engineering` (RFCs)
- GitHub pages: `antfriend.github.io` (TTDB collections, mega librarian)
- Zenodo: [DOI to be added after deposit — see Action 2 in `locus_immediate_next_actions.md`]

---

## References

- Uexküll, J. von (1909). *Umwelt und Innenwelt der Tiere*. Gustav Fischer.
- Ma, Y. & Kragel, P.A. (2025). Hippocampal-prefrontal emotional embedding. *Nature Communications*. [Verify full citation before submission]
- Friston, K. (2010). The free-energy principle: a unified brain theory? *Nature Reviews Neuroscience*, 11(2), 127–138.
- Bodenreider, O. (2004). The Unified Medical Language System (UMLS): integrating biomedical terminology. *Nucleic Acids Research*, 32(suppl_1), D267–D270.

---

## Submission Checklist

- [ ] Verify Ma & Kragel 2025 full citation (journal, volume, pages, DOI)
- [ ] Confirm RFC count — currently stated as "multi-RFC suite"; consider citing specific RFC numbers
- [ ] Replace "[Your name]" with real author metadata
- [ ] Add Zenodo DOI after deposit (Action 2)
- [ ] Add arXiv ID to all cross-references once submitted
- [ ] Convert to LaTeX `article` class for arXiv upload
- [ ] Generate PDF and verify formatting
- [ ] Set arXiv category: cs.ET primary; cross-list cs.AI, cs.IR
- [ ] Submit and record arXiv ID in `locus_immediate_next_actions.md` Action 1

---

*Draft generated 2026-05-08. Parent: `locus_publication_plan.md`. Actions: `locus_immediate_next_actions.md`.*
