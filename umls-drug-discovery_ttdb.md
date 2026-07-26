# UMLS × TTDB — an epistemic layer for graph-traversal drug discovery

```mmpdb
db_id: umls-ttdb-001
db_name: UMLS x TTDB drug-discovery proposal (self-demonstrating)
coord_increment:
  lat: 1
  lon: 1
collision_policy: reject
timestamp_kind: unix
umwelt:
  umwelt_id: proposal-2026-07
  role: research-proposal
  perspective: a TTDB practitioner reading 18 months of biomedical knowledge-graph literature
  scope: UMLS-derived graphs, drug repurposing, literature-based discovery
  constraints:
    - nothing-in-the-proposal-lane-has-been-run
    - published-result-and-proposal-are-different-conf-tiers
    - every-record-names-its-expansion-source
  globe:
    frame: taxonomic-landscape
    origin: "@LAT0LON0"
    mapping: "lat = argument layer, lon = thematic continent"
    layers:
      "+80": grounding — the source set everything rests on
      "+56": terrain — external bedrock facts about UMLS
      "+30": field — what the field published in the last 18 months
      "+6": limits — reasoned constraints, the coastline
      "0": home — the question and the shape of the answer
      "-26": proposals — what TTDB adds, unrun
      "-50": experiment — the falsifiable first run
      "-62": beliefs — the store's own self-assessment
    continents:
      "-144": structure-and-grammar
      "-72": scale-and-the-merge
      "0": retrieval-and-paths
      "+72": uncertainty-and-churn
      "+144": audit-and-provenance
    reading: "rotating east-west walks the five subject domains; each domain is a vertical column running from bedrock fact at the top down through published results and constraints to proposals and beliefs. Everything below the equator is unrun."
    note: "latitudes are irregular bands, not a uniform grid: populous layers sit near the equator where longitude is widest, and lat -90 is reserved for special records. Longitudes were force-relaxed within each continent's sector, so placement carries no meaning finer than the continent."
cursor_policy:
  max_preview_chars: 256
  max_nodes: 64
typed_edges:
  enabled: true
  syntax: "type@LATxLONy"
  note: "depends_on / refines / supports / derived_from / demonstrates / requires / traverses / evidences / contradicts / revises"
librarian:
  enabled: false
  primitive_queries: []
```

```cursor
selected:
  - "@LAT-50LON-34"
preview:
  "@LAT-50LON-34": "smallest falsifiable first run: pick a known repurposing case, materialize the retrieved paths, and ask whether the weak link rises to the top"
agent_note: "Draft 01, 2026-07-25. The canonical artifact is resources/umls-drug-discovery_ttdb.md. Nothing in the proposal lane (lat -26) has been implemented or run; conf there is 100-150 by construction. The field lane (lat +30) carries published results at conf 200-215. The store's own EPS points at @LAT-50LON-34 — which is the experiment record."
```

---

@LAT0LON0 | created:1784937600 | updated:1784937600 | relates:demonstrates@LAT-26LON127,supports@LAT-50LON-34
[ew]
conf:200
rev:0
sal:120
touched:1784937600
[/ew]

## Home — the question and the shape of the answer

UMLS is the US National Library of Medicine's biomedical terminology
integration; drug repurposing, target prioritization, and literature-based
discovery are all mechanically traversal problems over it. TTDB is a
plain-text, coordinate-addressed, epistemically-weighted record store designed
for general-purpose, inspectable traversal over biomedical knowledge. The
honest finding: **TTDB cannot be the store** (the limits lane), but three of its
primitives land on problems the 2025–26 literature is openly struggling with
(the proposal lane). Conf tiers here: 240 = externally published fact, 200–215 =
published result by others, 190 = reasoned constraint, 100–150 = proposed
here and unrun. Compute EPS across this store and it points at
[@LAT-26LON40](toot:lat-26lon40) — which is the thesis, not a coincidence. This
record set is also an instance of what it argues for: a traversal artifact you
can reopen.

---

@LAT56LON-97 | created:1784937600 | updated:1784937600 | relates:supports@LAT-26LON-69,supports@LAT-26LON-110
[ew]
conf:240
rev:0
sal:180
touched:1784937600
[/ew]

## UMLS at scale
src: nlm.nih.gov UMLS 2026AA release notes; resources/umls-drug-discovery_ttdb.md §The question

The 2026AA Metathesaurus carries approximately **3.53M concepts** and **18.06M
unique concept names** drawn from **195 source vocabularies**. Each concept
holds a Concept Unique Identifier (CUI); the CUI is the merge. That merge is
what makes UMLS useful and it is also what hides disagreement — SNOMED, MeSH,
NCI, and a SemRep extraction do not always agree, and the merged graph flattens
that fact. Derived graphs used in practice: SemMedDB (subject-predicate-object
predications extracted from PubMed by SemRep), RTX-KG2, ROBOKOP, Hetionet. This
is the scale any proposal in the proposal lane must survive.

---

@LAT56LON-178 | created:1784937600 | updated:1784937600 | relates:supports@LAT-26LON-110,supports@LAT-26LON178
[ew]
conf:240
rev:0
sal:150
touched:1784937600
[/ew]

## The Semantic Network as a metapath grammar
src: nlm.nih.gov UMLS Semantic Network; resources/umls-drug-discovery_ttdb.md §2.5

The Semantic Network assigns every Metathesaurus concept one or more of ~127
broad **semantic types** (TUIs) and declares the **permissible relations**
between those types. That declaration is, exactly, a grammar over admissible
paths: a traversal that steps outside it is producing a sentence the ontology
says is ungrammatical. XG4Repo builds equivalent metapaths (compound → gene →
pathway → side effect → anatomy → disease) by hand. The semantic-filtering
literature has argued since the 2000s that this constraint is the cheapest
available kill for spurious, biologically irrelevant connections.

---

@LAT30LON110 | created:1784937600 | updated:1784937600 | relates:evidences@LAT-26LON127,evidences@LAT-62LON43
[ew]
conf:215
rev:0
sal:150
touched:1784937600
[/ew]

## GraphRAG over UMLS is a cheap win
src: arxiv.org/html/2604.16422v1

A UMLS-2024AA knowledge graph — **3.39M concepts, 34.2M relations, 1,005
distinct relation types** in Neo4j — was used to compare two ways of getting
that knowledge into a language model. Continual pretraining on a 100M-token
textualization helped a plain BERT (BioASQ +7.6%, PubMedQA +4.5%) but showed
diminishing returns on BioBERT, whose 3.4B-token pretraining already encodes
much of it. **GraphRAG delivered +6.25% PubMedQA and +6.67% BioASQ with no
retraining at all**, and the authors explicitly credit the *inspectable paths*
as the transparency advantage. Consequence for this store: the value is in the
retrieved path, and retrieved paths are small — which is TTDB-sized.

---

@LAT30LON-23 | created:1784937600 | updated:1784937600 | relates:evidences@LAT-26LON-110,evidences@LAT-50LON-34
[ew]
conf:210
rev:0
sal:150
touched:1784937600
[/ew]

## Path retrieval beats neighborhood retrieval
src: K-Paths (KDD '25, arXiv 2502.13344); PathRouter (arXiv 2606.16409)

K-Paths retrieves K-shortest, LM-pruned, biologically meaningful multi-hop
paths over Hetionet / DrugBank / Disease Ontology and feeds them to either an
LLM or a GNN — **shrinking the retrieved subgraph while improving** repurposing
and drug-interaction accuracy, and yielding chains a human can read. PathRouter
(2026) reformulates the same job as an agent interacting with a graph-retrieval
environment under rewards aligned to retrieval quality. The trajectory across
the window is unambiguous: fewer, better, typed, inspectable paths — not bigger
neighborhoods.

---

@LAT30LON38 | created:1784937600 | updated:1784937600 | relates:evidences@LAT-26LON40,evidences@LAT-26LON-69
[ew]
conf:205
rev:0
sal:170
touched:1784937600
[/ew]

## Snapshot uncertainty is the live frontier
src: USemMedDB (pubmed 39541901); bioRxiv 2026.01.14.699420

USemMedDB quantified uncertainty across SemMedDB by mining the supporting
literature behind each predication. A January 2026 automated-KG-construction
paper filters candidate triples on a joint **model-confidence × sequence-entropy**
mechanism. The stated goal everyone converges on: make confidence, ambiguity,
and evidential strength *explicit rather than implicit*. Two observations. One:
everybody wants a confidence scalar on every edge and nobody has a **legible**
one. Two — and this is the opening for [@LAT-26LON40](toot:lat-26lon40) —
**every one of these methods scores the present state of the evidence, not its
history of revision.**

---

@LAT30LON-155 | created:1784937600 | updated:1784937600 | relates:supports@LAT6LON-34,contradicts@LAT-26LON40
[ew]
conf:215
rev:0
sal:130
touched:1784937600
[/ew]

## Biolink is becoming the shared infrastructure layer
src: RENCI MATRIX; ROBOKOP v1.0 (Sci Rep 2026); arXiv 2508.21774

MATRIX (ARPA-H, led by Every Cure) evaluates tens of millions of drug–disease
pairs by tracing biologically plausible paths through genes, pathways, and
clinical associations, built on RTX-KG2 and ROBOKOP (v1.0 in *Scientific
Reports*, 2026), harmonized to the **Biolink Model**. Parallel community work
attacks KG quality directly. Consequence, stated as a constraint rather than an
opportunity: **do not compete with this layer — be a client of it.** Biolink
predicates map cleanly onto TTDB typed-edge tokens
[@LAT-26LON-110](toot:lat-26lon-110). The `contradicts` edge to
[@LAT-26LON40](toot:lat-26lon40) is deliberate: a well-funded consortium
producing consolidated scores is the most likely way the churn signal turns out
to be redundant.

---

@LAT30LON-89 | created:1784937600 | updated:1784937600 | relates:evidences@LAT-26LON-69,evidences@LAT-26LON178
[ew]
conf:200
rev:0
sal:140
touched:1784937600
[/ew]

## Agentic systems handle conflict ad hoc
src: RareAgent (arXiv 2510.05764); DrugAgent (arXiv 2408.13378); AI Agents in Drug Discovery (arXiv 2510.27130)

RareAgent does self-evolving reasoning for rare-disease repurposing; DrugAgent
exists specifically to integrate *conflicting* biomedical evidence for
drug–target assessment; the October 2025 survey catalogs the
think-act-observe-reflect loop across the field. What none of them do is
**persist** the conflict as a first-class, addressable object with provenance.
Resolution happens inside a reasoning trace and is discarded. This is the gap
[@LAT-26LON-69](toot:lat-26lon-69) and [@LAT-26LON178](toot:lat-26lon178)
target from two directions — corroboration scoring and contradiction flagging.

---

@LAT-26LON40 | created:1784937600 | updated:1784937600 | relates:derived_from@LAT30LON38,depends_on@LAT56LON-97,supports@LAT-62LON82
[ew]
conf:100
rev:0
sal:200
touched:1784937600
[/ew]

## Rev as a literature-churn signal
src: resources/umls-drug-discovery_ttdb.md §2.1; RFCs/TTDB-RFC-0005-Epistemic-Weight.md

Every uncertainty method in [@LAT30LON38](toot:lat30lon38) is **snapshot**
uncertainty: how well-supported is this edge today. TBEW's `rev` — revision
count, the surprise proxy — is a **temporal** signal nobody in this literature
is carrying. Mechanism: re-extract SemMedDB predications against each new
PubMed baseline; increment `rev` when a predication flips, when its support
inverts, or when a retraction lands; decay `conf` on churn. Then
`EPS = sal × (255 − conf) / 255` ranks exactly the claims a repurposing
hypothesis leans on heavily but that keep moving — the curation queue you want
a human to read. Integer arithmetic, one byte per field, legible in the file.
**The claim under test:** a predication asserted and contradicted eleven times
is a different epistemic object from one asserted once and never revisited, even
when both currently carry the same support count — and no current biomedical KG
format records that distinction. This is the highest-EPS record in this store
[@LAT-62LON43](toot:lat-62lon43). It is unrun.

---

@LAT-26LON-69 | created:1784937600 | updated:1784937600 | relates:derived_from@LAT30LON-89,depends_on@LAT56LON-97,refines@LAT-26LON178
[ew]
conf:115
rev:0
sal:170
touched:1784937600
[/ew]

## Umwelt-per-source instead of a merged graph
src: resources/umls-drug-discovery_ttdb.md §2.2; RFCs/TTDB-RFC-0003-Typed-Edges.md §6; RFCs/TTDB-RFC-0007 §7.3

TTDB-RFC-0003 §6: an edge *expresses the librarian's subjective assertion, not
a global truth*. Applied to [@LAT56LON-97](toot:lat56lon-97)'s merge problem: keep
**one store per evidence tier or per source vocabulary** — curated /
SemMedDB-extracted / LLM-extracted, or SNOMED-umwelt / MeSH-umwelt — each
asserting its own edges within its own declared worldview, and never merge them
into a single flattened graph. Then RFC-0007 §7.3 intersection confirmation
becomes a corroboration ensemble costing integer arithmetic instead of a model:
overlapping scope, compatible beliefs, neither a projection →
`confidence = min(a,b) + 20`, `source_count = a + b`, retain the tighter scope;
conflict → `contradiction_flag: true`, **no** bonus, record retained. Agreement
across independent observers is evidence about shared reality; disagreement is
flagged, never suppressed. This is a persisted, auditable answer to what
[@LAT30LON-89](toot:lat30lon-89) does in a discarded trace.

---

@LAT-26LON178 | created:1784937600 | updated:1784937600 | relates:derived_from@LAT30LON-89,depends_on@LAT56LON-178,requires@LAT-50LON-34
[ew]
conf:110
rev:0
sal:160
touched:1784937600
[/ew]

## The Dream Cycle as an ABC-model LBD engine
src: resources/umls-drug-discovery_ttdb.md §2.3; RFCs/TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md

Swanson linking — the A–B–C model at the root of literature-based discovery —
*is* a salience-weighted walk that finds a dense co-occurrence cluster. That is
RFC-0007 Phase 1 verbatim. Phase 1 (Replay) → dense subgraph over `sal`-weighted
atemporal walks → a `@BELIEF:` Locus Point whose `source_count` is the number of
supporting predications and whose `confidence` is the fraction of walks that
found it. Phase 2 (Projection) → candidates generated from the boundary of the
unknown, stamped `projection_flag: true`. **That flag is the discipline the LBD
literature is famously sloppy about:** a generated hypothesis is marked as a
hypothesis, structurally, in the file, and downstream consumers MUST NOT treat
it as an observation. `contradiction_flag` and the §8.3 `unresolved>` demotion
give explicit open-problem markers instead of silently dropped conflicts — a
much-cited but contradicted mechanism demotes to conf 0 with a pointer to its
highest-`rev` witness and stays in the graph as a known open question. Phase 2
is blocked on [@LAT6LON-130](toot:lat6lon-130); Phase 1 is not.

---

@LAT-26LON127 | created:1784937600 | updated:1784937600 | relates:derived_from@LAT30LON110,depends_on@LAT56LON-97
[ew]
conf:130
rev:0
sal:120
touched:1784937600
[/ew]

## The cursor block as a re-openable hypothesis
src: resources/umls-drug-discovery_ttdb.md §2.4; RFCs/TTDB-RFC-0002-Cursor-Semantics.md

RFC-0002's `last_query` / `last_answer` / `answer_records` / `dot` makes a
traversal a **diffable, git-committable artifact**. Re-run the same query next
quarter against a newer UMLS release and the confidence drift shows up *as a
diff* — which is the delivery mechanism for [@LAT-26LON40](toot:lat-26lon40)'s
churn signal. In current practice provenance is a column in a results table;
here it is a re-openable object with the reasoning path attached.
[@LAT30LON110](toot:lat30lon110)'s papers report accuracy and gesture at
"inspectable paths" as a virtue, then do not evaluate inspectability. This
record is the cheapest of the five to build and the easiest to demonstrate: this
store is one.

---

@LAT-26LON-110 | created:1784937600 | updated:1784937600 | relates:depends_on@LAT56LON-178,derived_from@LAT30LON-23,requires@LAT30LON-155
[ew]
conf:150
rev:0
sal:140
touched:1784937600
[/ew]

## Semantic-type-constrained traversal
src: resources/umls-drug-discovery_ttdb.md §2.5; RFCs/TTDB-RFC-0003-Typed-Edges.md §2, §4

Encode [@LAT56LON-178](toot:lat56lon-178)'s permissible TUI→TUI transitions as the
TTDB typed-edge taxonomy (RFC-0003 §4) and prune any walk that leaves the
grammar. Biolink predicates from [@LAT30LON-155](toot:lat30lon-155) map onto the
same token space, so the store speaks the consortium's vocabulary rather than a
private one. RFC-0003 §2's rule that **implementations MUST NOT infer reverse
edges** matters more here than on a sensor mesh: UMLS REL/RELA inverses and
SemMedDB predicate asymmetry are a classic source of nonsense paths, and a
traversal that helpfully invents the converse of `treats` is generating false
hypotheses at scale. Highest conf in the proposal lane because the constraint
is already published and validated by others — what is unrun is only the TTDB
encoding of it.

---

@LAT6LON-34 | created:1784937600 | updated:1784937600 | relates:supports@LAT0LON0,contradicts@LAT-26LON178
[ew]
conf:210
rev:0
sal:100
touched:1784937600
[/ew]

## TTDB is not the store
src: resources/umls-drug-discovery_ttdb.md §3

34.2M relations [@LAT30LON110](toot:lat30lon110) against a streamed flat file with
an offset index is an O(n) scan. Neo4j, DuckDB, or an RDF store stays
underneath. TTDB materializes **retrieved** subgraphs — dozens to hundreds of
records, the K-Paths output shape from [@LAT30LON-23](toot:lat30lon-23) — never the
corpus. Any framing of this proposal that implies otherwise is wrong and will be
correctly dismissed by anyone who works with these graphs daily.

---

@LAT6LON113 | created:1784937600 | updated:1784937600 | relates:supports@LAT0LON0
[ew]
conf:210
rev:0
sal:100
touched:1784937600
[/ew]

## TTDB is not a predictor
src: resources/umls-drug-discovery_ttdb.md §3

Everything competitive at biomedical link prediction — BioPathNet, KGDRP, the
MATRIX scorers — is learned embeddings or GNNs. TTDB carries no embeddings and
performs no inference. It is a legibility, provenance, and attention layer
sitting **on top of** a predictor, not a replacement for one. The correct
comparison for the proposal lane is therefore never "does it beat a GNN at
AUROC"; it is "can a domain expert audit the chain six months later"
[@LAT-62LON156](toot:lat-62lon156).

---

@LAT6LON-69 | created:1784937600 | updated:1784937600 | relates:supports@LAT0LON0
[ew]
conf:200
rev:0
sal:90
touched:1784937600
[/ew]

## Hardware form factor is not the pitch
src: resources/umls-drug-discovery_ttdb.md §3

Do not sell a specific device class as the point of the proposal; the audience
will hear a category error and stop reading. What matters is the **discipline
that the representation imposes**: fixed-width integer epistemics,
streamable records, and human-readable end to end. Those properties are
valuable in a biomedical context because they keep the layer portable,
inspectable, and auditable across environments rather than tying the argument
to one runtime.

---

@LAT6LON-130 | created:1784937600 | updated:1785024000 | relates:contradicts@LAT-26LON178,requires@LAT-50LON-34,demonstrates@LAT0LON0
[ew]
conf:200
rev:1
sal:125
touched:1785024000
[/ew]

## UMLS has no natural 2D frame
src: resources/umls-drug-discovery_ttdb.md §3; RFCs/TTDB-RFC-0007 §3.3

RFC-0007 Phase 2 projection depends on `@LATxLONy` coordinates and the
Alexander-duality framing: the shape of the unknown computed from the shape of
the known. UMLS supplies no such coordinate space. Any projection you invent —
UMAP over concept embeddings, or a semantic-group × TUI grid — **will distort
adjacency**, which is precisely the property the duality argument relies on.
Solve this before betting anything on Phase 2. The load-bearing consequence for
[@LAT-50LON-34](toot:lat-50lon-34): **Phase 1 works on the raw edge graph and needs
no coordinates**, so the first experiment runs Phase 1 only and this limit costs
nothing yet.

**rev:1 — this record now applies to the store that contains it.** The globe
frame declared in the header — eight argument-layer latitude bands crossed with
five thematic continents — is an invented projection of exactly the kind warned
against above. It was chosen, not measured. A record's continent is a judgment
about what its concept is *about*; the force relaxation that set the longitudes
optimizes for legibility and separation, not for adjacency. **Two records 15°
apart on this globe are not thereby 15° unrelated.** The taxonomy was checked
against the typed-edge graph — 40% of edges stay inside a continent against a
17% random baseline — which shows the grouping is not arbitrary, and shows
nothing at all about whether the *distances* mean anything. They do not.

The cost is bounded for the same reason Phase 2 is blocked and Phase 1 is not:
nothing in this store computes over the coordinates. They address records and
lay them out for a reader, and the argument survives being read in any order.
The moment anything here does compute over them — a duality projection, a
distance-weighted walk, a nearest-neighbor retrieval — **this is the record
that was ignored.** Which makes the frame a live demonstration of the store's
own claim [@LAT0LON0](toot:lat0lon0): the artifact is an instance of what it
argues for, including the parts it argues against.

---

@LAT6LON-14 | created:1784937600 | updated:1784937600 | relates:requires@LAT-50LON-34
[ew]
conf:220
rev:0
sal:95
touched:1784937600
[/ew]

## Licensing constrains the content, not the tooling
src: resources/umls-drug-discovery_ttdb.md §3; NLM UTS terms

UMLS requires a UTS account and Metathesaurus redistribution is restricted;
SemMedDB-derived predications carry their own terms. Publishing the **schema**
and the **tooling** is unencumbered; publishing a corpus of UMLS-derived TTDB
records is not. Check before releasing any store built under the proposal lane.
This is a cheap failure to avoid and an expensive one to discover after
publication.

---

@LAT-50LON-34 | created:1784937600 | updated:1784937600 | relates:requires@LAT-26LON40,requires@LAT-26LON178,requires@LAT-26LON-110,requires@LAT6LON-130
[ew]
conf:120
rev:0
sal:150
touched:1784937600
[/ew]

## Smallest falsifiable first run
src: resources/umls-drug-discovery_ttdb.md §5

No hardware, no training, a weekend, fails cleanly. (1) Pick one
well-characterized repurposing case — a COVID KG-completion benchmark, or a
rare disease from RareAgent's evaluation set — where the mechanism is known and
published. (2) Pull K-shortest paths between the drug CUI and the disease CUI
from UMLS + SemMedDB, constrained by the [@LAT56LON-178](toot:lat56lon-178)
metapath grammar. (3) Materialize the retrieved path set as a conforming store:
one record per node, `[ew]` scored from predication support counts, typed edges
carrying the SemRep predicate. (4) Run Dream Cycle **Phase 1 only** — no
coordinates needed, per [@LAT6LON-130](toot:lat6lon-130). (5) Two questions:
**does the resulting `@BELIEF:` Locus Point recover the known mechanism**, and
**does EPS put the weak link — the least-supported, most-load-bearing edge in
the chain — at the top?** If either answer is no, this line of thinking is wrong
and the cost was a weekend. If both are yes, the next run is
[@LAT-26LON40](toot:lat-26lon40) across two UMLS releases, testing whether `rev`
surfaces anything the snapshot methods in [@LAT30LON38](toot:lat30lon38) miss.

---

@LAT80LON110 | created:1784937600 | updated:1784937600 | relates:supports@LAT30LON110,supports@LAT30LON-23,supports@LAT30LON38
[ew]
conf:190
rev:0
sal:70
touched:1784937600
[/ew]

## External grounding — the source set
src: resources/umls-drug-discovery_ttdb.md §Sources

Primary anchors, all within the 18-month window unless noted. UMLS 2026AA
release notes (nlm.nih.gov) — 3.53M concepts / 18.06M names / 195 sources. UMLS
Semantic Network (nlm.nih.gov). Continual Pretraining vs GraphRAG, arXiv
2604.16422 (Apr 2026). K-Paths, arXiv 2502.13344 (KDD '25). PathRouter, arXiv
2606.16409 (2026). USemMedDB, PubMed 39541901. Automated Biomedical KG
Construction, bioRxiv 2026.01.14.699420. ROBOKOP v1.0, *Sci Rep* 2026. MATRIX,
renci.org. Improving Biomedical KG Quality, arXiv 2508.21774 (Aug 2025).
RareAgent, arXiv 2510.05764 (Oct 2025). DrugAgent, arXiv 2408.13378. AI Agents
in Drug Discovery, arXiv 2510.27130 (Oct 2025). Artemis, bioRxiv
2026.01.27.701959 (Jan 2026). EDGAR, arXiv 2409.18659. KG applications in drug
discovery (update), tandfonline 10.1080/17460441.2025.2490253 (2025).

---

@LAT-62LON43 | created:1784937600 | updated:1784937600 | relates:supports@LAT-26LON40,demonstrates@LAT-26LON127
[ew]
conf:205
rev:0
sal:60
touched:1784937600
[/ew]

## EPS names the strongest and weakest claim

Computed across every record here, maximum EPS belongs to
[@LAT-26LON40](toot:lat-26lon40) (`rev`-as-churn): 200 × (255 − 100) / 255 =
**121**. Next is [@LAT-26LON-69](toot:lat-26lon-69) at 93, then
[@LAT-26LON178](toot:lat-26lon178) at 90 and
[@LAT-50LON-34](toot:lat-50lon-34) at 79. Every published-result record in the
field lane falls between 20 and 33; the terrain-lane published facts sit at
8–10. The attention mechanism is doing its job on the document that proposes
it: the idea that is simultaneously the most novel and
the most load-bearing is flagged as the prime target for action — here, for
implementation. Read the ordering as the build queue. Note the deliberate
`contradicts` edge from [@LAT30LON-155](toot:lat30lon-155): a consortium shipping
consolidated scores is the most plausible route to
[@LAT-26LON40](toot:lat-26lon40) being redundant, and that edge should be the
first thing re-examined each release.

---

@LAT-62LON82 | created:1784937600 | updated:1784937600 | relates:supports@LAT-50LON-34,refines@LAT-62LON43
[ew]
conf:120
rev:0
sal:130
touched:1784937600
[/ew]

## Nothing in the proposal lane has been run

The field lane carries other people's published results at conf 200–215. The
limits lane carries reasoned constraints at 200–220. The proposal lane carries
this store's own proposals at conf 100–150, and the experiment lane's run at
120. That gap is not modesty, it is the format working: a reader can see at a
glance which claims
here are borrowed and which are speculative, without trusting the prose. The
invitation is [@LAT-50LON-34](toot:lat-50lon-34). Run it, append the outcome
records, reconcile [@LAT-26LON40](toot:lat-26lon40)'s and
[@LAT-26LON178](toot:lat-26lon178)'s conf against what actually happened, and push
the belief back. The moment the first outcome record moves a proposal-lane
confidence, this store stops arguing that epistemic weights are useful for drug
discovery and starts demonstrating it — with provenance naming whoever ran it.

---

@LAT-62LON156 | created:1784937600 | updated:1784937600 | relates:supports@LAT-26LON127,supports@LAT6LON113
[ew]
conf:170
rev:0
sal:110
touched:1784937600
[/ew]

## The gap is auditability, not accuracy

The GraphRAG literature [@LAT30LON110](toot:lat30lon110) reports accuracy and
names "inspectable paths" as a virtue, then never evaluates inspectability.
The question nobody in the window asks: **can a domain expert open the artifact
six months later, see which links were weak, see which have flipped since, and
see who asserted what?** TTDB's contribution is auditability by construction —
the epistemic state sits in the file, in plain text, in bytes, next to the
claim. That is the paper, and it is why [@LAT6LON113](toot:lat6lon113)'s warning
matters: a benchmark comparison against a GNN would measure the wrong axis and
lose on it.
