# Locus / TTDB / Sage — Scientific Publication Plan

**Project:** Toot Toot Engineering — TTDB · Agent 32 · Locus Framework  
**GitHub org:** `toot-toot-engineering` / `antfriend.github.io`  
**Status:** Pre-submission planning  
**Date:** 2026-05-08

---

## Overview

This document is a working action plan for publishing scientific articles about the Locus framework, covering TTDB (MyMentalPalaceDB), Agent 32, Sage, and the associated RFC specification suite. The project spans embedded systems, knowledge representation, biosemiotics, and clinical informatics — enabling a multi-paper strategy, each targeting a distinct research community.

---

## Paper Portfolio (Recommended Split)

### Paper A — Systems Architecture
**Title (working):** *Locus: An Offline-First Embedded Knowledge Agent Framework Using Geographic Coordinate Addressing*  
**Angle:** RFC-specified architecture, Agent 32 hardware loop, TTDB storage model, deterministic offline operation  
**Primary venue:** IEEE Embedded Systems Letters or ACM TECS  
**Secondary venue:** tinyML Summit (workshop/talk track)  
**Key contributions:**
- @LATxLON authority-free addressing as a novel namespace scheme
- Four-RFC formal specification enabling reproducibility and community extension
- Offline-deterministic agent loop with no cloud LLM dependency
- Flat Markdown/LaTeX storage with zero external dependencies

**Anticipated reviewer question:** "Why not standard URIs/IRIs?"  
**Prepared answer:** URI schemes require an authority registry; @LATxLON is deterministic, human-readable, mnemonic, and works fully offline with no registration step.

---

### Paper B — Knowledge Representation
**Title (working):** *TTDB: A Coordinate-Addressed Knowledge Graph for Embedded and Offline Semantic Systems*  
**Angle:** Knowledge graph structure, toot-bit as minimal unit of meaning, addressing scheme theory, queryable node types  
**Primary venue:** Semantic Web Journal (IOS Press, open access)  
**Secondary venue:** K-CAP or EKAW conference  
**Key contributions:**
- Toot-bit formalism as the minimal semantic sign
- Geographic coordinate metaphor as authority-free knowledge addressing
- Flat-file graph with Markdown/LaTeX nodes — no database engine required
- Comparison to RDF/OWL: deliberate tradeoffs for embedded/offline contexts

---

### Paper C — Biosemiotic Framing
**Title (working):** *The Computational Umwelt: Biosemiotic Architecture for Autonomous Embedded Agents*  
**Angle:** Uexküll's umwelt concept operationalized as a device's subjective worldview; toot-bit as semiotic sign; Sage as umwelt instance  
**Primary venue:** *Biosemiotics* (Springer)  
**Secondary venue:** *Cognitive Systems Research* (Elsevier)  
**Key contributions:**
- First implementation of umwelt theory in embedded systems firmware
- Toot-bit maps to Uexküll's sign vehicle / meaning carrier
- Emotional embedding graph (21 nodes, valence/arousal axes) grounded in Ma & Kragel 2025 hippocampal-prefrontal research
- Sage as a named umwelt instance with a navigable knowledge coordinate space

**Note:** Seek a biosemiotics domain expert as co-author or acknowledged reviewer before submission to *Biosemiotics*.

---

### Paper D — Clinical Informatics Application
**Title (working):** *A Six-Node TTDB Storyline for Medical Knowledge Representation Using UMLS CUI Addressing*  
**Angle:** symptom → condition → molecule → medicine → perceptual experience → outcome graph; UMLS CUI integration; offline clinical decision support  
**Primary venue:** AMIA Annual Symposium  
**Secondary venue:** Journal of Biomedical Informatics  
**Key contributions:**
- Reusable TTDB storyline template for medical knowledge graphs
- UMLS CUI as a grounding layer for TTDB node identity
- `@PERCEPT:` / `@TTP:` namespace design (formalize before submission)
- Outcome nodes with queryable evidence payloads (resolve open design question first)
- Offline-first architecture suitable for low-resource clinical settings

**Open design questions to resolve before submission:**
- [ ] Formalize `@PERCEPT:` and `@TTP:` namespace — yes/no decision
- [ ] Decide whether outcome nodes carry queryable evidence payloads and specify schema

---

## Submission Sequence

```
Step 1:  arXiv preprint (cs.ET + cs.AI + cs.IR)       ← establish priority NOW
Step 2:  Zenodo dataset deposit → get DOI              ← strengthens all submissions
Step 3:  JOSS submission (software paper)              ← broadest recognition, fastest ROI
Step 4:  Paper A → IEEE Embedded Systems Letters
Step 5:  Paper B → Semantic Web Journal
Step 6:  Paper C → Biosemiotics (Springer)
Step 7:  Paper D → AMIA (after resolving open design questions)
```

---

## Venue Quick Reference

| Venue | Type | Paper | Notes |
|---|---|---|---|
| arXiv cs.ET/cs.AI | Preprint | All | Free, immediate, establishes priority |
| JOSS | Open-access journal | Software | Peer review = code quality + docs, not novelty |
| Zenodo | Dataset/DOI | All | CC0, use for TTDB collection |
| IEEE Embedded Systems Letters | Journal | A | Short-form, fast turnaround |
| ACM TECS | Journal | A | Longer form, higher impact |
| tinyML Summit | Conference | A | Practitioner community, good fit for Agent 32 |
| Semantic Web Journal | Journal | B | IOS Press, open access, CC-BY |
| K-CAP | Conference | B | ACM, biennial |
| EKAW | Conference | B | Knowledge engineering focus |
| Biosemiotics (Springer) | Journal | C | Core umwelt audience |
| Cognitive Systems Research | Journal | C | Broader cognitive science audience |
| AMIA Annual Symposium | Conference | D | Clinical informatics, UMLS community |
| Journal of Biomedical Informatics | Journal | D | Longer-form clinical KG paper |

---

## Cross-Cutting Tips

1. **arXiv first, always.** Timestamp protects the @LATxLON scheme, toot-bit formalism, and umwelt framing from being scooped. Takes 1–2 days.

2. **RFC format is a strength.** In systems/networking venues, explicitly frame: *"We provide four formal RFCs covering X, Y, Z, W — this enables reproducibility and community fork/extend workflows."* Most academic prototypes have no formal spec.

3. **Zenodo DOI = Data Availability Statement.** Every submission should include a DAS pointing to the Zenodo-deposited TTDB collection. This satisfies open-data requirements and adds credibility.

4. **Addressing scheme novelty is the hook.** Every abstract should foreground @LATxLON as the novel primary contribution. It is the thread connecting all papers.

5. **Seek one domain expert co-author per specialized paper.** A biosemiotician for Paper C, a clinical informaticist for Paper D. Even a single domain validator as acknowledged reviewer helps with Paper C at Springer.

6. **The emotional embedding graph is a standalone dataset contribution.** 21 emotion nodes organized by valence/arousal axes, grounded in Ma & Kragel 2025 (*Nature Communications*). Consider a brief data paper or Zenodo record specifically for this.

7. **tinyML / maker community engagement.** Before or alongside formal publication, post to Hackaday, tinyML community forums, and the ESP32 dev community. Community adoption generates citations and co-contributors.

---

## Assets Inventory

| Asset | Status | Location |
|---|---|---|
| RFC Suite (4 RFCs) | Exists | toot-toot-engineering GitHub org |
| TTDB mega file (a32_mega_ttdb.md) | Exists | antfriend.github.io |
| Emotional embedding graph (21 nodes) | Exists | TTDB |
| Medical KG storyline (6-node) | Exists / in progress | TTDB |
| Sage umwelt instance | Exists | lat-10lon0 node |
| Zenodo deposit | Planned | CC0 |
| arXiv preprint | Not yet submitted | — |
| JOSS submission | Not yet started | — |

---

## Immediate Next Actions

- [ ] Draft 1-page arXiv abstract covering the addressing scheme + toot-bit + offline architecture
- [ ] Finalize Zenodo metadata and submit TTDB collection for DOI
- [ ] Resolve `@PERCEPT:`/`@TTP:` namespace decision (needed for Paper D)
- [ ] Resolve outcome node evidence payload schema (needed for Paper D)
- [ ] Identify one biosemiotics domain contact for Paper C review
- [ ] Begin JOSS submission checklist: https://joss.theoj.org/about#submitting

---

*Generated 2026-05-08. Use with Claude Code for drafting, RFC cross-referencing, and submission prep.*
