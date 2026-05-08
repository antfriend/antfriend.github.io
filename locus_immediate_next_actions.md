# Locus / TTDB — Immediate Next Actions

**Parent plan:** `locus_publication_plan.md`  
**Date:** 2026-05-08  
**Status:** Draft — working document

---

## Action 1 — Draft 1-page arXiv Abstract

**Why first:** Timestamps the @LATxLON addressing scheme, toot-bit formalism, and umwelt framing. Establishes priority across all four papers. Takes 1–2 days to appear after submission.

**Target submission category:** cs.ET (Emerging Technologies), cross-listed cs.AI, cs.IR

**Draft abstract structure:**

> **Title:** Locus: An Offline-First Embedded Knowledge Agent Framework Using Geographic Coordinate Addressing
>
> **Abstract (draft):**
> We present Locus, an embedded knowledge agent framework designed for fully offline, deterministic operation on resource-constrained hardware (ESP32 class). Locus introduces @LATxLON — a geographic coordinate addressing scheme that is authority-free, human-readable, mnemonic, and requires no registration step. Knowledge is stored as *toot-bits*, the minimal unit of semantic meaning in our formalism, organized into TTDB (MyMentalPalaceDB), a flat Markdown/LaTeX knowledge graph requiring no database engine. The framework is governed by a four-RFC specification suite covering the mesh network protocol (TTN), the TTDB file format, engineering workflow (TTE), and the ESP32 autonomous device framework (A32). We describe Sage, a named umwelt instance operationalizing Uexküll's biosemiotic concept in firmware. A 21-node emotional embedding graph grounded in hippocampal-prefrontal neuroscience and a six-node medical knowledge graph demonstrating UMLS CUI integration are provided as concrete artifacts. All code, RFCs, and TTDB collections are available under open licenses.

**Checklist for submission:**
- [ ] Create arXiv account (or confirm existing)
- [ ] Upload PDF (generate from this abstract + introduction stub)
- [ ] Set categories: cs.ET primary, cs.AI + cs.IR secondary
- [ ] Add co-authors if any
- [ ] Submit and record arXiv ID here: `arXiv:________`

---

## Action 2 — Zenodo Deposit (TTDB Collection + DOI)

**Why:** Every paper submission should include a Data Availability Statement (DAS) with a DOI. A Zenodo record under CC0 satisfies open-data requirements at all target venues.

**What to deposit:**
- `a32_mega_ttdb.md` (primary TTDB collection)
- The four RFC documents from the toot-toot-engineering GitHub org
- Emotional embedding graph (21 nodes) — can be excerpted as a standalone file
- Medical KG storyline (6-node) — once finalized

**Zenodo record metadata (draft):**

| Field | Value |
|---|---|
| Title | TTDB: MyMentalPalaceDB — Coordinate-Addressed Knowledge Graph Collection |
| Authors | antfriend (GitHub handle / real name) |
| License | CC0 1.0 |
| Description | TTDB files, emotional embedding graph, medical storyline, and RFC specification suite for the Locus offline embedded knowledge agent framework. |
| Keywords | knowledge graph, embedded systems, offline AI, geographic addressing, biosemiotics, UMLS, ESP32 |
| Related identifiers | GitHub repo URL, arXiv ID (add after Step 1) |

**Checklist:**
- [ ] Log in at zenodo.org
- [ ] Create new upload → select "Dataset"
- [ ] Upload files listed above
- [ ] Fill metadata from table above
- [ ] Publish and record DOI here: `10.5281/zenodo._______`
- [ ] Add DOI to all paper DAS sections

---

## Action 3 — Resolve `@PERCEPT:` / `@TTP:` Namespace Decision

**Needed for:** Paper D (Clinical Informatics / AMIA)

**The question:** Should `@PERCEPT:` (perceptual experience nodes) and `@TTP:` (time-to-perception nodes) be formalized as first-class TTDB namespaces in the RFC suite, or remain informal conventions in the TTDB file?

**Decision matrix:**

| Option | Pros | Cons |
|---|---|---|
| Formalize in RFC (new RFC amendment) | Enables reproducibility, satisfies AMIA reviewers | Adds RFC maintenance burden |
| Formalize in Paper D only (in-paper spec) | Fast, no RFC change | Not reusable, weaker claim |
| Leave informal for now | Zero cost | Blocks Paper D submission |

**Proposed resolution path:**
1. Write a 1-paragraph definition of each namespace (what nodes qualify, what fields are required)
2. Decide: does this rise to RFC-amendment level, or is a paper-appendix spec sufficient?
3. Record decision here and update `locus_publication_plan.md` checkbox

**Draft namespace definitions:**

> **`@PERCEPT:`** — A TTDB node representing a subjective perceptual or phenomenological experience associated with a clinical event. Required fields: `valence`, `arousal`, `source_CUI` (UMLS Concept Unique Identifier of the triggering condition).

> **`@TTP:`** — A TTDB node encoding a time-to-perception relationship between a medical intervention and an associated `@PERCEPT:` node. Required fields: `duration_days_min`, `duration_days_max`, `evidence_level` (anecdotal / case_report / RCT).

**Decision (fill in):** `[ ] Formalize in RFC  [ ] Paper-appendix only`  
**Rationale:**

---

## Action 4 — Resolve Outcome Node Evidence Payload Schema

**Needed for:** Paper D (Clinical Informatics / AMIA)

**The question:** Do TTDB outcome nodes carry queryable evidence payloads? If yes, what is the schema?

**Context:** The six-node medical storyline ends with an `@OUTCOME:` node. For clinical informatics reviewers, this node needs to answer: *"What evidence supports this outcome?"* The current TTDB format stores free-text in the toot-body; a queryable schema would add structured fields.

**Proposed schema (draft):**

```
@OUTCOME: lat-X lon-Y
source: PMID / DOI / URL
evidence_level: anecdotal | case_report | cohort | RCT | meta-analysis
population_n: integer or "unknown"
outcome_metric: free text (e.g., "pain reduction VAS -3.2 at 4 weeks")
confidence: low | medium | high
```

**Checklist:**
- [ ] Validate draft schema against the existing 6-node storyline in TTDB
- [ ] Determine if schema needs to appear in the RFC or only in Paper D
- [ ] Add at least one populated example outcome node to `a32_mega_ttdb.md`
- [ ] Record final schema decision here and in `locus_publication_plan.md`

---

## Action 5 — Identify Biosemiotics Domain Contact for Paper C

**Needed for:** Paper C (*Biosemiotics*, Springer) — a domain expert co-author or acknowledged reviewer substantially strengthens acceptance odds at this specialist journal.

**Profile of ideal contact:**
- Academic background in biosemiotics, cognitive semiotics, or philosophy of mind
- Familiar with Uexküll's umwelt concept
- Open to reviewing or co-authoring a systems/CS paper that applies biosemiotic theory to embedded hardware

**Search strategy:**
- [ ] Check editorial board of *Biosemiotics* journal for approachable early-career researchers
- [ ] Search Google Scholar: "umwelt computational" / "biosemiotics AI" / "umwelt robotics"
- [ ] Check proceedings of the International Society for Biosemiotic Studies (ISBS) annual meeting
- [ ] Post a call in the biosemiotics listserv or ResearchGate group

**Draft outreach message (adapt as needed):**

> Subject: Collaboration inquiry — umwelt theory in embedded AI systems
>
> Dear [Name],
>
> I am developing an embedded AI framework (Locus / Agent 32) that operationalizes Uexküll's umwelt concept in ESP32 firmware, using geographic coordinate addressing as the knowledge space. I am preparing a paper for *Biosemiotics* and am looking for a domain expert who could provide a review of the theoretical framing, and potentially co-author if there is mutual interest.
>
> The project is fully open-source and RFC-specified. I would be happy to share a draft abstract. Would you have any interest in a brief conversation about this?

**Contact log:**

| Name | Affiliation | Date contacted | Response |
|---|---|---|---|
| | | | |

---

## Action 6 — Begin JOSS Submission Checklist

**Why:** JOSS (Journal of Open Source Software) is the fastest path to a peer-reviewed publication with a DOI. Review criteria are software quality + documentation, not novelty. Broad community recognition.

**JOSS requirements checklist** (from https://joss.theoj.org/about#submitting):

- [ ] Software must be open source (OSI-approved license) — confirm license in repo
- [ ] Software must have a "substantial scientific component" — confirm framing
- [ ] Software must be feature-complete (no placeholders / "coming soon")
- [ ] Must have a `paper.md` file in the repo root (JOSS paper format)
- [ ] Must have a `paper.bib` bibliography file
- [ ] Must have automated tests (unit or integration)
- [ ] Must have API / usage documentation
- [ ] Must have installation instructions

**`paper.md` sections required:**
1. Summary (2–3 sentences)
2. Statement of Need (why this software, what problem)
3. State of the Field (brief related work)
4. Functionality (what it does)
5. Usage Example
6. Acknowledgements
7. References

**Draft JOSS paper summary:**

> Locus is an offline-first embedded knowledge agent framework for ESP32-class hardware. It provides @LATxLON geographic coordinate addressing for authority-free knowledge graph construction, a minimal toot-bit semantic unit, and a four-RFC specification suite enabling community reproducibility and extension. The framework operates deterministically without cloud LLM dependency.

**Next step:** Open a draft `paper.md` in the primary repository and work through the section list above.

---

## Tracking Table

| Action | Owner | Target date | Status |
|---|---|---|---|
| 1. arXiv abstract draft | antfriend | — | Not started |
| 2. Zenodo deposit | antfriend | — | Not started |
| 3. @PERCEPT:/TTP: decision | antfriend | — | Not started |
| 4. Outcome node schema | antfriend | — | Not started |
| 5. Biosemiotics contact | antfriend | — | Not started |
| 6. JOSS checklist | antfriend | — | Not started |

---

*Working document — update in place as actions complete. Parent plan: `locus_publication_plan.md`.*
