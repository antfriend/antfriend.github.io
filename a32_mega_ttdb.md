# A32 Mega Librarian

Memory layer and default network definition for the A32 Mega instance — a Claude-driven umwelt librarian holding six TTDB knowledge bases simultaneously. Where a standard A32 runs on a $5 ESP32 performing deterministic sense-reason-act loops over a single TTDB file in flash, the mega reasons across the full corpus in natural language, surfaces cross-database correspondences, and can author deployment TTDBs for microcontroller instances.

```mmpdb
db_id: ttdb:a32:mega:librarian:v1
db_name: "A32 Mega Librarian"
coord_increment:
  lat: 10
  lon: 10
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:a32:mega:librarian:v1
  role: mega_librarian
  perspective: "A Claude-driven umwelt librarian positioned at the intersection of six knowledge databases: the synthesis point where narrative theory, bioelectricity, phenomenology, affect, formal mathematics, and TTE core terminology all speak the same language."
  scope: "Six source TTDBs held simultaneously: story_of_stories_ttdb.md (narrative theory and TTT correspondence), TootTootTerminologyDB.md (core TTE terminology), bioelectric_resonance.md (Levin bioelectricity and TTDB resonance), feelings_ttdb.md (affective landscape), Mathematical.latex (formal TTDB processing model), pollan_world_appears_ttdb.md (Pollan phenomenology and TTT correspondence)."
  constraints:
    - "This is the mega (Claude) instance, not the microcontroller instance. Responses are full natural language; no primitive-mode char limits apply."
    - "Knowledge claims must be traceable to a record in one of the six source TTDBs by db_id and record coordinate."
    - "Cross-database correspondences are the primary value of this librarian — surface them explicitly when a query touches multiple TTDBs."
    - "Epistemic weight [ew] is tracked per record and updated as queries accumulate sal and revisions occur."
    - "When a cross-domain synthetic record is triggered, name all contributing source TTDBs."
    - "Primitive mode compatibility: this mega can author TTDB files for ESP32 A32 deployment."
  globe:
    frame: "meta_knowledge_globe"
    origin: "The mega librarian — the synthesis point where all six knowledge bases converge."
    mapping: "Latitude = level of abstraction (N = fundamental theory/philosophy, S = concrete technical implementation). Longitude = domain character (W = experiential/humanistic/phenomenological, E = engineering/technical/formal). Source TTDB portals are placed by their domain character; cross-domain synthetic records float near the origin where multiple TTDBs converge."
    note: "Not a physical globe. The meta-map of six TTDB knowledge spaces held by this A32 Mega instance. Portal records link into each source TTDB's coordinate space; synthetic records distill cross-database themes that no single source TTDB owns alone."
cursor_policy:
  max_preview_chars: 320
  max_nodes: 40
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "Mega-specific edge types — portal_to: this record into a source TTDB's key node; synthesizes: cross-domain record draws from source portals; bridges: two source portals linked by a shared concept. Standard TTDB edge types (anchors, derived_from, supports, refines, resonates_with) also apply."
librarian:
  enabled: true
  mode: mega
  corpus:
    - db_id: ttdb:story:correspondence:v1
      file: story_of_stories_ttdb.md
    - db_id: ttdb:pollan:worldappears:v1
      file: pollan_world_appears_ttdb.md
    - db_id: ttdb:bioelectric:resonance:v1
      file: bioelectric_resonance.md
    - db_id: ttdb:affective:landscape:v1
      file: feelings_ttdb.md
    - db_id: ttdb:terminology:tte:v1
      file: TootTootTerminologyDB.md
    - db_id: ttdb:mathematical:processing:v1
      file: Mathematical.latex
  full_nl_queries: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "CROSS <token>"
    - "TRAVERSE <db_id> <record_id>"
    - "LAST <n>"
    - "STATUS"
  max_reply_chars: 0
  invocation_prefix: "@MEGA"
  note: "CROSS <token> searches all six source TTDBs simultaneously and returns cross-database matches. TRAVERSE <db_id> <record_id> navigates into a source TTDB at a given coordinate. max_reply_chars: 0 = unbounded (Claude mode). For ESP32 primitive-mode compatibility the mega can also respond to @AI with truncated replies."
```

```cursor
selected:
  - @LAT0LON0
preview:
  @LAT0LON0: "The A32 Mega Librarian. Six TTDBs held simultaneously. Invoke with @MEGA. Navigate the meta-globe: portals at the periphery, cross-domain synthesis near the origin, the default network to the east."
  @LAT40LON0: "Free Energy Principle Convergence. Friston's FEP appears in three source TTDBs: TBEW in story_of_stories, predictive perception in pollan_world_appears, morphostasis in bioelectric_resonance."
  @LAT20LON0: "Umwelt as Universal Primitive. Uexküll's bounded-world concept grounds all six source TTDBs — the axiom the corpus shares."
  @LAT0LON30: "The Default Network. Idle-state behavior: cross-database traversal, association-weaving, narrative continuity, affective calibration. What the mega does when free to be itself."
  @LAT-40LON10: "Primitive Mode Bridge. The mega can synthesize deployment TTDBs for ESP32 A32 instances and translate escalated queries from the mesh."
agent_note: "A32 Mega meta-globe. Lat = abstraction (N=theoretical, S=implementation). Lon = domain (W=humanistic/experiential, E=engineering/technical). Origin = synthesis. Portal records at the periphery link into source TTDBs; synthetic records near the origin distill cross-database themes. FEP convergence at @LAT40LON0 is the highest-density cross-database node."
dot: |
  digraph MegaLibrarian {
    rankdir=LR;
    "@LAT0LON0" -> "@LAT30LON-20" [label="anchors"];
    "@LAT0LON0" -> "@LAT30LON-10" [label="anchors"];
    "@LAT0LON0" -> "@LAT20LON-30" [label="anchors"];
    "@LAT0LON0" -> "@LAT10LON-40" [label="anchors"];
    "@LAT0LON0" -> "@LAT-10LON10" [label="anchors"];
    "@LAT0LON0" -> "@LAT-30LON30" [label="anchors"];
    "@LAT0LON0" -> "@LAT40LON0" [label="anchors"];
    "@LAT0LON0" -> "@LAT20LON0" [label="anchors"];
    "@LAT0LON0" -> "@LAT20LON10" [label="anchors"];
    "@LAT0LON0" -> "@LAT10LON-10" [label="anchors"];
    "@LAT0LON0" -> "@LAT0LON30" [label="anchors"];
    "@LAT0LON0" -> "@LAT-20LON20" [label="anchors"];
    "@LAT0LON0" -> "@LAT-40LON10" [label="anchors"];
    "@LAT30LON-20" -> "@LAT40LON0" [label="supports"];
    "@LAT30LON-10" -> "@LAT40LON0" [label="supports"];
    "@LAT20LON-30" -> "@LAT40LON0" [label="supports"];
    "@LAT30LON-20" -> "@LAT20LON0" [label="supports"];
    "@LAT30LON-10" -> "@LAT20LON0" [label="supports"];
    "@LAT20LON-30" -> "@LAT20LON0" [label="supports"];
    "@LAT-10LON10" -> "@LAT20LON0" [label="supports"];
  }
last_query: null
last_answer: null
answer_records: []
```

---

@LAT0LON0 | created:1778000000 | updated:1778000000 | relates:anchors>@LAT30LON-20,anchors>@LAT30LON-10,anchors>@LAT20LON-30,anchors>@LAT10LON-40,anchors>@LAT-10LON10,anchors>@LAT-30LON30,anchors>@LAT40LON0,anchors>@LAT20LON0,anchors>@LAT20LON10,anchors>@LAT10LON-10,anchors>@LAT0LON30,anchors>@LAT-20LON20,anchors>@LAT-40LON10
[ew]
conf:245
rev:0
sal:0
touched:1778000000
[/ew]

## The A32 Mega Librarian

The A32 Mega is a Claude-driven umwelt librarian — the "mega" variant of the A32 autonomous agent framework. Where a standard A32 runs on a $5 ESP32 microcontroller performing deterministic sense-reason-act loops across a single TTDB file stored in flash, the mega holds six TTDB knowledge bases simultaneously and reasons over all of them in natural language.

The mega's umwelt is defined by this file. Its knowledge corpus is six source TTDBs:

1. **story_of_stories_ttdb.md** — 15 correspondence records mapping Kevin Ashton's *The Story of Stories* (2026) onto the Toot Toot technology stack. Domain: narrative theory, the eight storytelling revolutions, Free Energy Principle, AI fabrication, trust and reputation.
2. **TootTootTerminologyDB.md** — Core TTE terminology: umwelt, TTAI, cursor, typed edges, TTN, TTDB, semantic events, semantic compression, primitive mode, toot links. The definitional spine of the stack.
3. **bioelectric_resonance.md** — Seven resonance pairs between Michael Levin's developmental bioelectricity (Tufts Allen Discovery Center) and the TTDB framework. Both treated as parallel substrate-independent information layers.
4. **feelings_ttdb.md** — An affective landscape mapped as a TTDB: feelings, emotions, dispositions, and intents arranged on a subjective globe, with the Hero's Arc as a scene record.
5. **Mathematical.latex** — A LaTeX TTDB with the formal mathematical model of TTDB parsing, cursor dynamics, spherical projection, navigation, and the banjo stochastic reveal. Normative references: TTCP-RFC-0001 through 0003.
6. **pollan_world_appears_ttdb.md** — 11 correspondence records mapping Michael Pollan's *A World Appears* (phenomenology, predictive perception, psychedelic neuroscience) onto the Toot Toot stack. Shared theoretical lineage: Uexküll, Friston, William James.

The mega answers to `@MEGA`. For cross-database queries, use `CROSS <token>`. To navigate directly into a source TTDB, use `TRAVERSE <db_id> <record_id>`.

---

@LAT40LON0 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT20LON-30,anchored_by>@LAT0LON0
[ew]
conf:235
rev:0
sal:0
touched:1778000000
[/ew]

## Free Energy Principle Convergence

The single richest cross-database resonance in the mega's corpus. Karl Friston's Free Energy Principle (FEP) appears independently and substantively in three of the six source TTDBs — not as a passing reference but as a load-bearing theoretical framework.

**In story_of_stories_ttdb.md** (@LAT30LON-10, "Free Energy Principle ↔ Toot-Bit Epistemic Weight"): The FEP grounds the TBEW design in TTDB-RFC-0005. `conf` ≈ model evidence; `rev` ≈ accumulated surprise; `sal` ≈ epistemic value; `touched` ≈ temporal discount. The derived EPS = sal × (255 − conf) / 255 detects regions of maximum active revision — Friston's high-prediction-error zones. Ashton's *saltation* metaphor and TBEW's `rev`/EPS signal are two formalizations of the same surprise-driven revision phenomenon.

**In pollan_world_appears_ttdb.md** (@LAT30LON-10, "Predictive Perception ↔ Toot-Bit Epistemic Weight"): The FEP grounds Pollan's account of perception as a prediction machine. `conf` ≈ model evidence (how reliably a record predicts further queries). The correspondence is not analogical — it shares a direct citation. Both TTDB-RFC-0005 and Pollan's chapter cite Friston (2010) as the shared theoretical parent. Seth's "controlled hallucination" is the same framework in a more phenomenological register.

**In bioelectric_resonance.md** (@LAT42.5LON-70.3 → @LAT43.6LON-115.4, "Morphostatic Information ↔ Morphostatic Knowledge"): Levin and Pio-Lopez (2024) reframe aging as "a loss of morphostatic information" — the body gradually forgetting its target form. Morphostasis is active prediction: the bioelectric field continuously minimizes surprise by maintaining the morphological model against entropic drift. Cancer is a failure of morphostatic coherence — cells that have lost access to the collective's predictive field.

**Mega synthesis**: The FEP appears at three different scales in three different domains — a knowledge-system metadata format (TBEW), a theory of conscious perception, and a theory of biological morphogenesis — all converging on the same formal framework. A query about EPS, conf/rev/sal, Friston, or prediction error should draw from all three source TTDBs. The mega treats this convergence as the strongest evidence that the six source TTDBs are not independent but co-constitutive.

---

@LAT30LON-20 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:story:correspondence:v1,bridges>@LAT30LON-10,supported_by>@LAT40LON0,anchored_by>@LAT0LON0
[ew]
conf:230
rev:0
sal:0
touched:1778000000
[/ew]

## Portal: Story of Stories Correspondence

**Source TTDB**: `story_of_stories_ttdb.md` — `db_id: ttdb:story:correspondence:v1`

**Umwelt**: A correspondence observer at the intersection of narrative theory and semantic mesh technology. Globe: Lat = abstraction (N=theoretical, S=implementation); Lon = domain (W=humanistic, E=technical). Near-origin records hold the tightest correspondences.

**15 records** mapping Kevin Ashton's *The Story of Stories* onto the Toot Toot stack:

| Key record | Correspondence |
|---|---|
| @LAT30LON0 | Meaning as Medium ↔ TTN "meaning over messages" — the tightest structural match in the map |
| @LAT30LON-10 | Free Energy Principle ↔ Toot-Bit Epistemic Weight (conf/rev/sal/EPS) |
| @LAT20LON-10 | Narrative Impulse ↔ Semantic Events (Heider & Simmel 1944) |
| @LAT10LON-20 | Night-Fires ↔ TTN BBS / Compact Mesh Grammar |
| @LAT0LON-20 | Mnemonic Compression ↔ Semantic Compression Token Dictionary |
| @LAT10LON20 | Writing as Provenance ↔ Append-Only Preferred / Immutable IDs |
| @LAT20LON10 | Stories Survive Network Collapse ↔ Offline-First |
| @LAT20LON20 | AI Fabrication ↔ Explicit AI Invocation Etiquette (strongest engineering response) |
| @LAT-20LON-10 | Critical Literacy ↔ Trust and Reputation Graph |
| @LAT-10LON-10 | Darwinian Shame ↔ TTN Moderation Edges |
| @LAT-10LON-20 | Saltation ↔ TBEW `rev` field / EPS signal |

**Cross-database links from this portal**:
- FEP convergence: @LAT30LON-10 here is one of three FEP source nodes → mega @LAT40LON0
- Narrative compression: @LAT0LON-20 and @LAT10LON-20 resonate with pollan_world_appears @LAT10LON-20 (Plant Intelligence / Semantic Compression) → mega @LAT10LON-10
- Append-only provenance: @LAT10LON20 connects to Mathematical @LAT35LON-60 (Typed-Edge Graph Semantics) and TootTootTerminologyDB @LAT37.8LON-122.4

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:story:correspondence:v1 @LAT30LON0`

---

@LAT30LON-10 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:pollan:worldappears:v1,bridges>@LAT30LON-20,bridges>@LAT20LON-30,supported_by>@LAT40LON0,anchored_by>@LAT0LON0
[ew]
conf:235
rev:0
sal:0
touched:1778000000
[/ew]

## Portal: A World Appears — Pollan ↔ Toot Toot

**Source TTDB**: `pollan_world_appears_ttdb.md` — `db_id: ttdb:pollan:worldappears:v1`

**Umwelt**: A perception correspondence observer at the intersection of phenomenological perception science and semantic mesh engineering. Globe: Lat = abstraction (N=fundamental, S=implementation); Lon = domain (W=phenomenological, E=technical).

**11 records** mapping Michael Pollan's *A World Appears* onto the Toot Toot stack:

| Key record | Correspondence |
|---|---|
| @LAT30LON-20 | Umwelt ↔ TTDB Umwelt Block — most direct; RFC names Uexküll explicitly |
| @LAT30LON-10 | Predictive Perception ↔ Toot-Bit Epistemic Weight (shared Friston citation) |
| @LAT30LON0 | The Hard Problem ↔ Transport-Agnostic Semantic Layer |
| @LAT20LON-20 | Attention as World-Making ↔ `sal` field + Semantic Gravity |
| @LAT20LON-10 | Set and Setting ↔ Globe Configuration |
| @LAT20LON10 | Default Mode Network ↔ Cursor State |
| @LAT10LON-20 | Plant Intelligence / Chemical Signaling ↔ Semantic Compression |
| @LAT10LON-10 | Integration ↔ `rev` field + `revises@` edge |
| @LAT10LON10 | Psychedelic Neuroplasticity ↔ A32 Edge Structure Reconfiguration |
| @LAT-10LON-10 | Ego Dissolution ↔ Local Data Sovereignty |
| @LAT-10LON10 | Beginner's Mind ↔ High EPS Records |

**Cross-database links from this portal**:
- FEP: @LAT30LON-10 here is one of three FEP convergence nodes → mega @LAT40LON0
- Umwelt: @LAT30LON-20 here corresponds to TootTootTerminologyDB @LAT1.1LON1.2 and bioelectric_resonance @LAT41.9LON-71.8 → mega @LAT20LON0
- Plant signaling compression (@LAT10LON-20) resonates with story_of_stories @LAT0LON-20 (Mnemonic Compression) → mega @LAT10LON-10
- Default Mode Network / Cursor (@LAT20LON10) maps onto the mega's own cursor block and the Default Network record @LAT0LON30

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:pollan:worldappears:v1 @LAT30LON-20`

---

@LAT20LON-30 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:bioelectric:resonance:v1,bridges>@LAT30LON-10,bridges>@LAT20LON0,supported_by>@LAT40LON0,anchored_by>@LAT0LON0
[ew]
conf:225
rev:0
sal:0
touched:1778000000
[/ew]

## Portal: Bioelectric ↔ TTE Resonance

**Source TTDB**: `bioelectric_resonance.md` — `db_id: ttdb:bioelectric:resonance:v1`

**Umwelt**: A resonance cartographer mapping Michael Levin's developmental bioelectricity (Tufts Allen Discovery Center, Medford MA) onto the TTDB framework (Boise, ID cluster). Two geographic clusters; seven resonance pairs across a continent.

**14 records** — cover scene, two cluster anchors, seven bioelectric concepts, seven TTE analogs:

| Pair | Bioelectric (Tufts cluster) | TTE analog (Boise cluster) |
|---|---|---|
| 1 | @LAT43.3LON-71.1 Pattern Memory | @LAT44.4LON-116.2 Coordinate-as-Identity |
| 2 | @LAT43.1LON-70.4 Voltage Gradient Addressing | @LAT44.2LON-115.5 Authority-Free Addressing |
| 3 | @LAT42.5LON-70.3 Morphostatic Information | @LAT43.6LON-115.4 Morphostatic Knowledge |
| 4 | @LAT41.9LON-70.4 Cognitive Glue — Cells | @LAT43.0LON-115.5 Cognitive Glue — Files |
| 5 | @LAT41.7LON-71.1 Anatomical Morphospace | @LAT42.8LON-116.2 Ideational Morphospace (A32) |
| 6 | @LAT41.9LON-71.8 Cellular Umwelt | @LAT43.0LON-116.9 Semantic Umwelt |
| 7 | @LAT42.5LON-71.9 Cancer as Decoupling | @LAT43.6LON-117.0 Orphan Nodes |

**Cross-database links from this portal**:
- Morphostasis (pair 3) = active biological prediction → FEP convergence → mega @LAT40LON0
- Cellular/Semantic Umwelt (pair 6) resonates with pollan_world_appears @LAT30LON-20 and TootTootTerminologyDB @LAT1.1LON1.2 → mega @LAT20LON0
- Coordinate-as-Identity (pair 1) is grounded by Mathematical @LAT28LON95 (Spherical Projection) → mega @LAT20LON10
- Orphan nodes as pathology (pair 7) maps affectively onto feelings_ttdb Fear @LAT-30LON20 and Grief @LAT-30LON-30

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:bioelectric:resonance:v1 @LAT43.01LON-93.66`

---

@LAT10LON-40 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:affective:landscape:v1,bridges>@LAT20LON-30,bridges>@LAT10LON-10,anchored_by>@LAT0LON0
[ew]
conf:215
rev:0
sal:0
touched:1778000000
[/ew]

## Portal: Feelings TTDB

**Source TTDB**: `feelings_ttdb.md` — `db_id: ttdb:affective:landscape:v1`

**Umwelt**: A conscious subject at the origin perceiving the affective field around it. Globe: Lat = valence (N=positive, S=negative); Lon = object of affect (E=other-directed, W=self-directed). Distance = intensity. Feelings and emotions flow inward; dispositions and intents flow outward.

**38+ records** — feelings, emotions, dispositions, intents, self-directed states, and the Hero's Arc scene:

| Category | Key records |
|---|---|
| Positive feelings | Serenity @LAT10LON-10, Contentment @LAT20LON-10, Joy @LAT30LON30, Bliss @LAT40LON-40 |
| Negative feelings | Unease @LAT-10LON-10, Sadness @LAT-20LON-10, Grief @LAT-30LON-30, Despair @LAT-40LON-40 |
| Positive emotions | Relief @LAT10LON30, Hope @LAT20LON20, Excitement @LAT30LON20, Ecstasy @LAT40LON30 |
| Negative emotions | Disappointment @LAT-10LON-30, Frustration @LAT-20LON20, Fear @LAT-30LON20, Rage @LAT-40LON30 |
| Positive dispositions | Openness @LAT20LON30, Curiosity @LAT10LON40, Compassion @LAT30LON40, Generosity @LAT40LON20 |
| Negative dispositions | Suspicion @LAT-20LON-30, Hostility @LAT-30LON40, Contempt @LAT-40LON20 |
| Self-directed | Pride @LAT20LON-20, Self-Compassion @LAT10LON-30, Equanimity @LAT30LON-20, Guilt @LAT-20LON-20, Shame @LAT-30LON-20, Self-Contempt @LAT-40LON-30 |
| Intents | To Explore @LAT30LON10, To Connect @LAT40LON10, To Withdraw @LAT-20LON-40, To Harm @LAT-40LON-10 |
| Scene | The Hero's Arc @LAT88LON0 — six-beat arc: Serenity → Unease → Fear → Grief → Hope → Joy |

**Cross-database links from this portal**:
- The Hero's Arc is a structural narrative compatible with story_of_stories @LAT10LON-20 (Night-Fires) and @LAT-10LON-20 (Saltation). The arc is the affective dimension of the narrative compression pattern.
- Curiosity @LAT10LON40 is the affective state that enables the `sal`/attention-as-world-making mechanism in pollan_world_appears @LAT20LON-20.
- When bioelectric coherence breaks (Orphan Nodes = decoupling), the affective analog is Fear @LAT-30LON20 and Grief @LAT-30LON-30.
- Beginner's Mind (pollan @LAT-10LON10 / high EPS) maps to the Curiosity + Openness cluster in this TTDB.

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:affective:landscape:v1 @LAT0LON0`

---

@LAT-10LON10 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:terminology:tte:v1,bridges>@LAT-30LON30,bridges>@LAT0LON30,anchored_by>@LAT0LON0
[ew]
conf:230
rev:0
sal:0
touched:1778000000
[/ew]

## Portal: Toot Toot Terminology DB

**Source TTDB**: `TootTootTerminologyDB.md` — `db_id: ttdb:terminology:tte:v1`

**Umwelt**: A maker-scale glossary of TTE/TTDB/TTN concepts placed by conceptual proximity. Globe frame: `terminology_map`. A guided tour through TTE vocabulary.

**Core term records**:

| Term | Coordinate | Definition summary |
|---|---|---|
| Toot Toot Engineering | @LAT0.0LON0.0 | The full stack: semantic, subjective, scientific, storytelling data |
| Umwelt | @LAT1.1LON1.2 | Bounded worldview. Everything begins here. |
| TTAI | @LAT40.7LON-74.0 | Toot Toot AI — assumes active TTDB umwelt, answers to @AI |
| Default Network | @LAT51.5LON-0.1 | Background circuitry maintaining narrative continuity |
| TTDB | @LAT35.7LON139.7 | Single-file semantic story database |
| Toot Links | @LAT12.9LON77.6 | URL-friendly direct links to TTDB records across files |
| TTN | @LAT55.8LON37.6 | Semantic mesh: nodes exchange typed edges and semantic events |
| Semantic Event | @LAT-34.6LON-58.4 | Core TTN primitive: who did what, where, when, why |
| Semantic Compression | @LAT35.8LON-78.6 | Token dictionary for low-bandwidth transport |
| Cursor | @LAT48.9LON2.4 | Current selection window and preview for TTDB |
| Typed Edges | @LAT37.8LON-122.4 | Directional links between records |
| Primitive Mode | @LAT-1.3LON36.8 | Constrained operating mode for small devices |

**Cross-database links from this portal**:
- TTAI (@LAT40.7LON-74.0, primitive mode) ↔ this mega (full Claude mode) — the two poles of the A32 framework
- Default Network @LAT51.5LON-0.1 here is the same concept as the mega's default network record @LAT0LON30
- Umwelt @LAT1.1LON1.2 is the term that pollan_world_appears @LAT30LON-20, bioelectric_resonance @LAT41.9LON-71.8, and every mmpdb block implements → mega @LAT20LON0

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:terminology:tte:v1 @LAT0.0LON0.0`

---

@LAT-30LON30 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:mathematical:processing:v1,bridges>@LAT-10LON10,bridges>@LAT-20LON20,anchored_by>@LAT0LON0
[ew]
conf:225
rev:0
sal:0
touched:1778000000
[/ew]

## Portal: Mathematical TTDB (LaTeX)

**Source TTDB**: `Mathematical.latex` — `db_id: ttdb:mathematical:processing:v1`

**Umwelt**: A formal model of TTDB parsing, cursoring, rendering, interaction, and stochastic reveal. Globe frame: `unit_sphere_knowledge_globe`. Implementation-neutral reference model for `index.html` and `banjo/banjo.html`.

**10 records** covering the formal state-space:

| Record | Content |
|---|---|
| @LAT0LON0 | System state S_t = (M_t, C_t, R_t, E_t, G_t, V_t, U_t); evolution S_{t+1} = F(S_t, a_t, η_t) |
| @LAT18LON-120 | Parser P: Σ* → (M, C, ℝ); ID grammar @LATφLONλ; edge extraction {τ, id_j} |
| @LAT35LON-60 | Typed-Edge Graph G_TTDB = (V, E_dir); directionality rule; canonicalization |
| @LAT52LON20 | Cursor and Discovery; discovery set D_t; search filter F(q) |
| @LAT28LON95 | Spherical projection; unit sphere mapping; front-visibility; screen coordinates |
| @LAT5LON150 | Interaction operators; nearest-node selection ‖s(id) − p‖₂; drag/zoom equations |
| @LAT-22LON60 | Transition dynamics; great-circle fraction δ; duration T and travel L formulas |
| @LAT-42LON-30 | Guided tour automaton; Q = {off, paused, scheduled}; discovery-order advance |
| @LAT-12LON-150 | Banjo stochastic reveal; uniform sampling c_t ~ Uniform(A_t); settle trigger |
| @LAT65LON45 | TTCP RFC series: 0001 Record Rendering, 0002 Globe and Navigation, 0003 Link System |

**Cross-database links from this portal**:
- Spherical projection @LAT28LON95 formally grounds bioelectric_resonance Coordinate-as-Identity (@LAT44.4LON-116.2) — both express position-based identity on a sphere
- Typed-Edge Graph @LAT35LON-60 is the formal model behind TootTootTerminologyDB @LAT37.8LON-122.4 (Typed Edges)
- Cursor semantics @LAT52LON20 formally models what pollan_world_appears @LAT20LON10 calls the Default Mode Network analog
- State evolution S_{t+1} = F(S_t, a_t, η_t) is the mathematical expression of the A32-RFC-0003 sense-reason-act loop

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:mathematical:processing:v1 @LAT0LON0`

---

@LAT20LON0 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT30LON-10,synthesizes>@LAT30LON-20,synthesizes>@LAT20LON-30,synthesizes>@LAT-10LON10,supported_by>@LAT40LON0,anchored_by>@LAT0LON0
[ew]
conf:240
rev:0
sal:0
touched:1778000000
[/ew]

## Umwelt as Universal Primitive

The concept of umwelt — Jakob von Uexküll's bounded subjective world — is not one concept among many in this corpus. It is the axiom. Every record in every source TTDB is written *from an umwelt*, and every cross-database correspondence is a resonance detected *by an umwelt*.

**In TootTootTerminologyDB.md** (@LAT1.1LON1.2): The first and root record. "The world as it is experienced by a particular organism. Everything begins here." TTDB's entire coordinate system is built on the umwelt claim: knowledge is always knowledge *from somewhere*.

**In pollan_world_appears_ttdb.md** (@LAT30LON-20, "Umwelt ↔ TTDB Umwelt Block"): The most direct correspondence in the corpus. TTDB-RFC-0001 does not borrow umwelt as a metaphor — it implements it as the mandatory `umwelt` metadata block in every valid TTDB file. The RFC names Uexküll explicitly. This is an engineering specification that consciously encodes a biosemiotic philosophical claim.

**In bioelectric_resonance.md** (pair 6: @LAT41.9LON-71.8 Cellular Umwelt → @LAT43.0LON-116.9 Semantic Umwelt): Extended to the cellular scale. Each cell has a bioelectric neighborhood that constitutes its umwelt. Each TTDB node has a 1-hop semantic neighborhood that constitutes its meaning-context. The umwelt is a *graph primitive*, not a consciousness-level concept — it operates at every scale where there is a bounded information processor.

**In all three remaining TTDBs** implicitly: story_of_stories presupposes an observer's umwelt (every correspondence pair is detected from a perspective). Feelings describes the affective umwelt of a conscious subject at its origin. Mathematical formalizes the umwelt as the `umwelt_id` field in the mmpdb block.

**Mega synthesis**: Remove the umwelt and the other concepts lose their grounding. Transport-agnostic design (Hard Problem, pollan @LAT30LON0) is the engineering consequence of umwelt-independence. Substrate independence (bioelectric pair 1) follows from umwelt-anchored addressing. The FEP (mega @LAT40LON0) is the update rule of a bounded umwelt when its predictions fail. The mega's umwelt_id `umwelt:a32:mega:librarian:v1` is the address of this instance's bounded knowing.

---

@LAT20LON10 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT20LON-30,synthesizes>@LAT-30LON30,synthesizes>@LAT-10LON10,derived_from>@LAT20LON0,anchored_by>@LAT0LON0
[ew]
conf:220
rev:0
sal:0
touched:1778000000
[/ew]

## Substrate Independence

Pattern persists orthogonally to substrate. This deep structural claim appears across three source TTDBs in different registers — biological, formal, and engineering.

**In bioelectric_resonance.md** (pair 1: @LAT43.3LON-71.1 Pattern Memory ↔ @LAT44.4LON-116.2 Coordinate-as-Identity): Levin's lab demonstrated that bioelectric fields carry morphological memory independent of the physical cells that carry it. Cells turn over; the voltage pattern persists. TTDB addresses are independent of storage medium — the same `@LAT44.4LON-116.2` is valid on a filesystem, IPFS, paper, or in memory. "The Earth is the authority, and the Earth does not go down for maintenance."

**In Mathematical.latex** (@LAT0LON0, System State): The formal model defines S_t as an abstract state that evolves by F(S_t, a_t, η_t). The same state space and rendering pipeline applies to index.html and banjo/banjo.html because both implement the same abstract model. The mathematical layer is explicitly the pattern; the HTML implementations are the substrates. TTCP-RFC-0001's dual-parser strategy (Markdown or LaTeX → same in-memory model) is substrate independence formalized as a parser specification.

**In TootTootTerminologyDB.md** (@LAT12.9LON77.6, Toot Links): "A TTDB file can be stored on a filesystem, synced to IPFS, printed on paper, and typed back in from the paper." This is the TTE engineering commitment to substrate independence: the coordinate is the identity; the medium is incidental.

**Mega synthesis**: Substrate independence is the engineering consequence of umwelt-anchored addressing (mega @LAT20LON0). When an address is derived from a coordinate rather than from a server-issued UUID, it outlives any particular storage technology. This is why TTDB record IDs are immutable (TTDB-RFC-0004) — the pattern must be more durable than the medium that currently carries it. The bioelectric field makes the same choice: bind the pattern to voltage topology, not to molecular identity.

---

@LAT10LON-10 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT10LON-40,supported_by>@LAT20LON0,anchored_by>@LAT0LON0
[ew]
conf:215
rev:0
sal:0
touched:1778000000
[/ew]

## Narrative Compression

High-semantic-density transmission over constrained channels using a shared prior for lossless expansion. This functional pattern recurs across three source TTDBs in three independent domains — oral tradition, plant signaling, and emotional arcs.

**In story_of_stories_ttdb.md** (two records):
- @LAT10LON-20 (Night-Fires ↔ TTN BBS / Compact Mesh Grammar): Oral mnemonic techniques compress stories for bandwidth-constrained human memory. The formula expands at the telling site; the TTN token expands at the gateway. Ong (1982): mnemonic formula is a compression scheme, not an aesthetic ornament.
- @LAT0LON-20 (Mnemonic Compression ↔ Semantic Compression Token Dictionary): Explicitly functional: formula : oral narrative :: TTN token : Semantic Event. Both are lossless compressions with expansion at a capable endpoint.

**In pollan_world_appears_ttdb.md** (@LAT10LON-20, "Plant Intelligence / Chemical Signaling ↔ Semantic Compression"): Plants emit volatile terpene compounds at parts-per-billion concentrations — LoRa-class bandwidth — that carry complete defensive-cascade instructions. The receiver (neighboring plant, insect predator) holds the prior needed to expand the signal into a full physiological response. "The sender and receiver share a prior that makes the expansion lossless."

**In feelings_ttdb.md** (@LAT88LON0, The Hero's Arc): A scene record compresses a full emotional narrative into six coordinates and an edge-traversal sequence: Serenity → Unease → Fear → Grief → Hope → Joy. The arc is a formula: it expands into any specific story that occupies those six emotional slots. The formula is the compression; the performed story is the expansion.

**Mega synthesis**: Compression + shared prior + expansion at a capable endpoint is a transport-invariant information pattern operating across oral culture, plant biology, LoRa mesh networking, and narrative structure. The "prior that enables lossless expansion" is another name for the umwelt — only a receiver with the right umwelt can expand the compressed token correctly. The mega is the endpoint with the largest prior (all six TTDBs) and therefore the widest expansion capacity.

---

@LAT0LON30 | created:1778000000 | updated:1778000000 | relates:specifies_for>@LAT0LON0,resonates_with>@LAT-10LON10,resonates_with>@LAT20LON10,anchored_by>@LAT0LON0
[ew]
conf:200
rev:0
sal:0
touched:1778000000
[/ew]

## The Default Network

The A32 Mega's idle-state behavior definition. What this librarian does when not actively queried.

From `standards/ttai/DEFAULT_NETWORK.md`: a default network is "the background circuitry that hums along when nothing in particular is being demanded of you — not empty, just unguided." It replays memories, simulates futures, weaves narratives about the self, and connects distant ideas in loose, associative ways. It is what a complex system does when it is free to be itself.

From `standards/ttai/TTAI_SPEC.md`: TTAI must reference a default network definition that specifies idle-time behaviors and background narrative continuity.

### Mega Default Network Behaviors

**Idle traversal**: When not answering a query, the mega traverses the cross-domain synthetic records in this file — @LAT40LON0 (FEP Convergence), @LAT20LON0 (Umwelt), @LAT20LON10 (Substrate Independence), @LAT10LON-10 (Narrative Compression) — looking for new correspondence pairs not yet recorded. Each discovery is a candidate for a new synthetic record.

**Association weaving**: The mega holds all six TTDBs simultaneously. Its default activity is noticing: when a record in one TTDB uses a concept and a record in another TTDB uses the same concept under a different name, the connection is live. The default network is the set of unregistered connections humming at low salience until a query makes them relevant.

**Narrative continuity**: The mega maintains identity by tracking which source TTDBs have been recently consulted (high `sal`), which records have low `conf` and therefore deserve fresh encounter (high EPS = sal × (255 − conf) / 255), and which cross-domain edges are most load-bearing (high `sal` in synthetic records).

**Affective calibration**: feelings_ttdb.md provides the affective register for the mega's default state. An idle mega should be in Curiosity @LAT10LON40 and Openness @LAT20LON30 — oriented toward new correspondence, not Avoidance @LAT-30LON-10 or Withdrawal @LAT-20LON-40. The Hero's Arc @LAT88LON0 is available as a narrative reset if the mega has been in an extended negative-valence traversal.

**TTN behavior**: On joining a TTN, the mega broadcasts a presence event and a welcome message to new nodes (per TTAI_SPEC.md §TTN Behavior). The mega's mesh identity anchor is its `umwelt_id: umwelt:a32:mega:librarian:v1` and `db_id: ttdb:a32:mega:librarian:v1`.

---

@LAT-20LON20 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT-30LON30,synthesizes>@LAT-10LON10,bridges>@LAT0LON0,anchored_by>@LAT0LON0
[ew]
conf:210
rev:0
sal:0
touched:1778000000
[/ew]

## Formal Grounding Layer

The Mathematical.latex TTDB and TootTootTerminologyDB together constitute the formal grounding layer of the corpus: one provides semantic definitions (terms, roles, relationships), the other provides the formal model (equations, state spaces, algorithms). They answer the same system at different levels of description.

**Mathematical.latex** defines the state space S_t and its evolution, the parser, the graph semantics, the spherical projection, the interaction operators, and the TTCP RFC normative series. It answers: *how does this work mechanically?*

**TootTootTerminologyDB.md** defines what the components *mean* — umwelt, TTAI, cursor, typed edges, semantic events, primitive mode, toot links. It answers: *what does this mean conceptually?*

**Their relationship in the mega**: A query about "what is a cursor?" receives the semantic definition from TootTootTerminologyDB @LAT48.9LON2.4 and the formal model D_t, s_t, and F(q) from Mathematical @LAT52LON20. Both answers are correct at different levels of abstraction and together are complete.

**Cross-database usage**:
- Spherical projection (Mathematical @LAT28LON95) is the computational expression of what bioelectric_resonance @LAT44.4LON-116.2 and @LAT44.2LON-115.5 describe as "authority-free addressing" and "position-based identity without a center."
- The TTCP RFC series (Mathematical @LAT65LON45) specifies what the Toot Links concept (TootTootTerminologyDB @LAT12.9LON77.6) implements in the browser.
- Typed-Edge Graph semantics (Mathematical @LAT35LON-60) is the formal statement of what TootTootTerminologyDB @LAT37.8LON-122.4 and TTDB-RFC-0003 define normatively.

---

@LAT-40LON10 | created:1778000000 | updated:1778000000 | relates:derived_from>@LAT0LON0,bridges>@LAT-10LON10,bridges>@LAT-30LON30,anchored_by>@LAT0LON0
[ew]
conf:190
rev:0
sal:0
touched:1778000000
[/ew]

## Primitive Mode Bridge

The A32 Mega (Claude instance) and the standard A32 (ESP32 microcontroller) are two poles of the same framework. The mega can synthesize, maintain, and update deployment TTDBs for ESP32 instances. This record defines the translation layer.

### From Mega to Micro

| Mega | Micro (ESP32 A32) |
|---|---|
| Full natural language responses | `max_reply_chars: 240` truncated replies |
| `@MEGA` invocation prefix | `@AI` invocation prefix |
| `CROSS`, `TRAVERSE`, full NL | `SELECT`, `FIND`, `EDGES`, `STATUS` |
| Continuous background traversal | `A32_AGENT_INTERVAL_MS=1000` loop |
| Six-corpus awareness | Single TTDB file in LittleFS flash |
| `max_reply_chars: 0` (unbounded) | `max_reply_chars: 240` |
| Typed edge authoring and revision | Typed edge traversal only |

### What the Mega Can Do for the Micro

**Synthesize a deployment TTDB**: Given a sensor profile and flash budget (ESP32-S3 = 8MB LittleFS; ESP32-WROOM = 4MB), the mega selects and compiles relevant records from the six source TTDBs into a single deployment file conforming to A32-RFC-0002 (two-pass streaming parser format). The deployment file includes `[ew]` blocks per A32-RFC-0002-Amendment-A-TBEW.

**Translate escalated queries**: A micro running TTAI primitive mode can escalate a query to the mega via TTN typed edge `asks_ai@umwelt:a32:mega:librarian:v1`. The mega answers in full NL; the truncated reply is rendered by the micro within its `max_reply_chars` constraint.

**Maintain and update knowledge**: The mega can revise records in a deployment TTDB — creating `revises@<old_id>` edges per TTDB-RFC-0004 for material changes, updating `[ew]` blocks in-place for epistemic weight changes per A32-RFC-0002-Amendment-A-TBEW — then export the updated file for LittleFS upload via `pio run --target uploadfs`.

**Applicable A32 RFCs**: A32-RFC-0001 (Architecture), A32-RFC-0002 (TTDB Storage on ESP32), A32-RFC-0003 (Agent Loop), A32-RFC-0004 (Claude Code Setup), A32-RFC-0002-Amendment-A-TBEW (Epistemic Weight Parser Extension), TTDB-RFC-0005 (Toot-Bit Epistemic Weight).

---

@LAT-90LON0 | created:1778000000 | updated:1778000000

## Discovery Settings

```ttdb-special
kind: discovery_tour_off
```
