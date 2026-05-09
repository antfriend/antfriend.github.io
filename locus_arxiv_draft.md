# arXiv Preprint Draft — Locus: Synthetic Perceptual Modeling

**File:** `locus_arxiv_draft.md`  
**Parent plan:** `locus_publication_plan.md`  
**Target:** arXiv cs.ET (primary), cs.AI + cs.IR (cross-list)  
**Format note:** Draft is in Markdown. Convert to LaTeX (`article` class) before arXiv submission.  
**Date:** 2026-05-09  
**Status:** First draft — review all claims before submission

---

## Title

**Locus: Synthetic Perceptual Modeling**

*An Offline-First Embedded Knowledge Agent Framework Using Geographic Coordinate Addressing*

---

## Authors

Daniel Ray  
Independent researcher  
`antfriend@gmail.com`  
GitHub: `github.com/antfriend`

---

## Abstract

> **Target:** 150–200 words. This is the version to submit to arXiv. Every sentence must stand alone — reviewers decide in 30 seconds.

We present **Locus**, a framework for *synthetic perceptual modeling* — representing experiential knowledge as a typed graph of perceptual transitions, each anchored to a perceiving agent's subjective worldview (umwelt). Locus introduces **@LATxLON** geographic coordinate addressing: an authority-free scheme in which every knowledge node is identified by a deterministic latitude/longitude pair requiring no registry, no network connectivity, and no external authority. Knowledge is stored as **toot-bits** organized in **TTDB** (MyMentalPalaceDB), a flat Markdown or LaTeX knowledge graph traversable without a database engine. The framework's foundational epistemic primitive is the **@PERCEPT paired node**: a before/after transition record that encodes what a perceptual shift was like for a specific agent, not merely that it occurred. Records carry optional **Toot-Bit Epistemic Weight** (TBEW) blocks — confidence, revision count, salience, and recency — from which a derived Epistemic Priority Score (EPS) identifies high-uncertainty, high-salience nodes as primary attention targets, providing a lightweight symbolic approximation of free-energy minimization. The Locus specification suite spans 20 RFCs across four suites: TTDB (knowledge graph format, cursor semantics, typed edges, epistemic weight, experiential perception), TTN (semantic mesh network with trust, compression, and LoRa framing), TTCP (web publishing and interactive 3D globe visualization), and A32 (ESP32 autonomous device framework). Agents on ESP32-class hardware execute deterministic sense-reason-act loops from local TTDB storage — no cloud inference required. We provide a 21-node affective knowledge graph grounded in hippocampal-prefrontal emotional embedding research, a six-node medical knowledge graph integrating UMLS Concept Unique Identifiers, and a complete open-source reference implementation. All specifications and firmware are publicly available.

---

## 1 — Introduction

Knowledge agents deployed at the edge face a fundamental tension: the richer the knowledge representation, the heavier the runtime dependency. Existing approaches either require cloud inference (introducing latency, connectivity dependency, and data sovereignty concerns) or strip semantics down to lookup tables (sacrificing expressiveness). We resolve this tension by separating the *knowledge format* from the *reasoning engine* and grounding both in a novel addressing scheme that requires no central authority.

Locus further addresses a deeper representational gap: propositional knowledge graphs record *that* a transition occurred but not *what the transition was like* for a specific perceiving agent. The **@PERCEPT paired node** (TTDB-RFC-0006) fills this gap — every perceptual event is represented as a before/after node pair encoding the agent-bound phenomenological trace of a state transition. The unit of perceptual knowledge is the *edge* between states, not the isolated node. This grounds Locus in biosemiotics (von Uexküll's umwelt), active inference (Friston's free-energy principle), and neurophenomenology (Varela), distinguishing it from statistical or latent-space approaches: every inference step is inspectable and auditable.

The **@LATxLON** scheme assigns every knowledge record a coordinate-pair identifier derived from its position on a conceptual globe defined per-umwelt. Unlike URI schemes, which require an authority registry, or UUID schemes, which are opaque to humans, @LATxLON identifiers are deterministic, mnemonic, human-readable, and valid with zero network connectivity. A record at `@LAT30LON-20` is unambiguously located on its umwelt's globe — traversable, linkable, and reproducible from the specification alone.

**TTDB** (MyMentalPalaceDB) stores knowledge as plain Markdown or LaTeX, parsed with a two-pass indexed reader requiring approximately 12 bytes per record in RAM. **Agent 32 (A32)** runs this parser on ESP32-S3 hardware with 8MB flash and 2MB PSRAM, executing a 1-second sense-reason-act cycle entirely from local storage. **TTCP** (Toot-Toot Content Publishing) provides a complementary web-facing layer: an interactive 3D globe renderer that makes the same TTDB knowledge graph explorable by humans via a browser, with a discovery system, guided tour, and `toot:` URI scheme for cross-database linking. The **Locus** framework unifies these components under a formal 20-RFC specification suite, enabling reproducibility, community extension, and cross-device interoperability without cloud infrastructure.

---

## 2 — Key Contributions

1. **Synthetic perceptual model (@PERCEPT paired nodes)** — TTDB-RFC-0006 defines the `@PERCEPT:before` / `@PERCEPT:after` paired node as the fundamental unit of perceptual knowledge. The unit of representation is the *transition* (edge between states), not the isolated node. Agent context is mandatory: every percept is bound to a specific perceiving agent, making the knowledge graph phenomenologically thick and auditable. Distinguishes Locus from propositional and latent-space approaches.

2. **@LATxLON addressing** — An authority-free, deterministic, human-readable namespace for knowledge nodes. Functions offline with no registration step. Scales from single-device to mesh-networked deployments.

3. **TTDB file format** — A flat Markdown/LaTeX knowledge graph specification with formal cursor semantics (TTDB-RFC-0002), typed directional edges (TTDB-RFC-0003), event ID assignment with collision handling (TTDB-RFC-0004), and toot-bit epistemic weight tracking (TBEW, TTDB-RFC-0005). No database engine required; parseable on a $5 microcontroller.

4. **Toot-Bit Epistemic Weight (TBEW)** — A per-record metadata block tracking confidence (`conf`, 0–255), revision count (`rev`), salience/query count (`sal`), and last-touch timestamp (`touched`). Derived signal EPS = sal × (255 − conf) / 255 identifies records that are heavily used but poorly understood — the primary attention targets for knowledge refinement. Provides a lightweight symbolic approximation of the free-energy principle without floating-point arithmetic.

5. **Umwelt formalism** — Operationalization of von Uexküll's biosemiotic umwelt concept as a firmware-level device identity. Two physically identical ESP32 devices loaded with different TTDB files exhibit different behaviors, different reasoning paths, and different knowledge perspectives — they inhabit different umwelten.

6. **TTCP web publishing suite** — Three RFCs (TTCP-RFC-0001 through -0003) specify how TTDB knowledge graphs are rendered and explored in a browser: a record rendering pipeline (Markdown/LaTeX/KaTeX, epistemic weight display, media handling), an interactive 3D globe (discovery system, guided tour, scene playback, multi-database navigation), and a `toot:` URI scheme for cross-database addressability. The same TTDB file that runs on an ESP32 is explorable as a web application with no conversion step.

7. **20-RFC specification suite** — Formal specifications across four suites: TTN×6 (semantic mesh network protocol with typed edges, trust/reputation, semantic compression, and LoRa framing), TTDB×6 (file format, cursor, typed edges, event IDs, epistemic weight, experiential perception), TTCP×3 (record rendering, globe visualization, link system), and A32×4+1 amendment (ESP32 firmware architecture, TTDB streaming parser, agent loop, Claude Code project setup, TBEW parser extension). Enables reproducibility and community fork/extend workflows.

8. **Affective knowledge graph** — A 21-node TTDB instance mapping feelings, emotions, dispositions, and intents on a valence/arousal coordinate space. Grounded in Ma & Kragel (2026) map-like representations of emotion knowledge in hippocampal-prefrontal systems (*Nature Communications*, 17, 1518). Deployable to ESP32 as a standalone affective reasoning module.

---

## 3 — System Overview

*(Expand to full section in final paper; this is the abstract-level summary for the 1-page preprint.)*

The Locus stack has four tiers:

**Storage tier (TTDB):** A flat text file (Markdown or LaTeX) containing a YAML `mmpdb` header, a `cursor` block, and record sections separated by `---`. Each record is identified by `@LATxLONy`, carries a typed edge list (`relates:`), an optional `[ew]` epistemic weight block, and a free-text body in Markdown or LaTeX. Perceptual knowledge is encoded as `@PERCEPT:before` / `@PERCEPT:after` paired nodes — mandatory, agent-bound, never orphaned.

**Agent tier (A32):** Firmware for ESP32-class hardware. At boot, the two-pass parser builds an in-memory index (12 bytes/record). The agent loop reads sensor inputs, quantizes them to TTDB coordinates, finds the nearest record in the index, follows typed edges (`triggers`, `navigates_to`, `inhibits`, `requires`, `logs`), and drives actuators. Loop interval: 1 second default. Memory budget: ~3 KB overhead + 12 bytes/record.

**Network tier (TTN):** An optional LoRa mesh network layer for multi-device deployments. Nodes communicate via semantic events rather than raw messages. A32 devices using LoRa implement TTN-RFC-0006 packet framing (SOF/VER/FLAGS/SRC/DST/TYPE/SEQ/LEN/PAYLOAD/CRC16/EOF). Semantic compression tokens (`P`, `S?`, `OK`, `T:x`, etc.) are gateway-expanded to full semantic events. Trust and reputation are modeled locally via signed edge corroboration (TTN-RFC-0005); no global ledger required.

**Publishing tier (TTCP):** A browser-based layer that renders any TTDB file as an interactive 3D knowledge globe. Each record is a node on the sphere at its `@LATxLONy` coordinates; typed edges are drawn as arcs. A discovery system tracks visited records per database; a guided tour auto-advances through discovered nodes. The `toot:` URI scheme (TTCP-RFC-0003) provides cross-database deep linking. No server required — TTCP implementations run as static web applications reading TTDB files directly.

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
- Ma, Y. & Kragel, P.A. (2026). Map-like representations of emotion knowledge in hippocampal-prefrontal systems. *Nature Communications*, 17, 1518. https://doi.org/10.1038/s41467-025-68240-z
- Friston, K. (2010). The free-energy principle: a unified brain theory? *Nature Reviews Neuroscience*, 11(2), 127–138.
- Varela, F.J., Thompson, E., & Rosch, E. (1991). *The Embodied Mind: Cognitive Science and Human Experience*. MIT Press.
- Peirce, C.S. (1903). Pragmatism as the logic of abduction. Lecture VII, *Harvard Lectures on Pragmatism*. In *Collected Papers*, vol. 5.
- Bodenreider, O. (2004). The Unified Medical Language System (UMLS): integrating biomedical terminology. *Nucleic Acids Research*, 32(suppl_1), D267–D270.

---

## Submission Checklist

- [x] Verify Ma & Kragel citation — Ma & Kragel (2026), *Nature Communications* 17:1518, doi:10.1038/s41467-025-68240-z
- [x] Confirm RFC count — 20 RFCs: TTN×6, TTDB×6, TTCP×3, A32×4 + Amendment-A (TBEW parser)
- [x] Author metadata — Daniel Ray, antfriend@gmail.com, github.com/antfriend
- [ ] Add Zenodo DOI after deposit (Action 2)
- [ ] Add arXiv ID to all cross-references once submitted
- [x] Convert to LaTeX — see `locus_arxiv.tex`
- [ ] Compile PDF and verify formatting
- [ ] Set arXiv category: cs.ET primary; cross-list cs.AI, cs.IR
- [ ] Submit and record arXiv ID in `locus_immediate_next_actions.md` Action 1

---

*Draft updated 2026-05-09 from full RFC review (20 RFCs). Parent: `locus_publication_plan.md`. Actions: `locus_immediate_next_actions.md`.*
