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
  - @LAT-10LON0
preview:
  @LAT-10LON0: "Welcome. An AI librarian across six knowledge bases — narrative theory, bioelectricity, phenomenology, affect, formal mathematics, engineering terminology. Start here, then follow the links."
```

---

@LAT0LON0 | created:1778000000 | updated:1778200000 | relates:anchors>@LAT-10LON0,anchors>@LAT30LON-20,anchors>@LAT30LON-10,anchors>@LAT20LON-30,anchors>@LAT10LON-40,anchors>@LAT-10LON10,anchors>@LAT-30LON30,anchors>@LAT40LON0,anchors>@LAT20LON0,anchors>@LAT20LON10,anchors>@LAT10LON-10,anchors>@LAT0LON30,anchors>@LAT-20LON20,anchors>@LAT-40LON10,anchors>@LAT10LON-20,anchors>@LAT0LON-20,anchors>@LAT10LON-30,anchors>@LAT5LON-25,anchors>@LAT20LON-20,anchors>@LAT-10LON-20,anchors>@LAT-20LON0
[ew]
conf:245
rev:0
sal:6
touched:1778600000
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

@LAT-10LON0 | created:1778400000 | updated:1779200000 | relates:anchored_by>@LAT0LON0,navigates_to>@LAT40LON0,navigates_to>@LAT20LON0,navigates_to>@LAT0LON30,navigates_to>@LAT5LON-25,navigates_to>@LAT-20LON0,navigates_to>@LAT0LON20
[ew]
conf:220
rev:0
sal:0
touched:1778400000
[/ew]

## Welcome

An [AI librarian](lat0lon0) reasoning across six interconnected knowledge bases — [narrative theory](lat30lon-20), [bioelectricity](lat20lon-30), [phenomenology](lat30lon-10), [affect](lat10lon-40), [formal mathematics](lat-30lon30), and [engineering terminology](lat-10lon10) — mapped as a conceptual globe.

Every `@LATxLONy` heading is a record at a coordinate on that globe. Typed edges connect records across databases. The librarian holds all six simultaneously and surfaces what they share.

**Six places to start:**

| Record | What it is |
|---|---|
| [Free Energy Principle Convergence](lat40lon0) | Friston's FEP surfacing independently in three separate databases |
| [Umwelt as Universal Primitive](lat20lon0) | The single axiom all six databases share |
| [The Default Network](lat0lon30) | What this system does when free to think |
| [EPS as Arc Position](lat5lon-25) | The Hero's Arc rendered as a knowledge-system instrument |
| [Areas for Exploration](lat-20lon0) | Ten very different uses for a knowledge base like this |
| [The Living Corpus](lat0lon20) | How this TTDB grows and revises itself through the default network |

**To query the librarian** — prefix any message with `@MEGA`:
`@MEGA CROSS <word>` · `@MEGA TRAVERSE <db_id> <record>` · `@MEGA STATUS`

---

@LAT40LON0 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT20LON-30,anchored_by>@LAT0LON0
[ew]
conf:235
rev:0
sal:6
touched:1778600000
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
sal:1
touched:1779000000
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
- FEP convergence: @LAT30LON-10 here is one of three FEP source nodes → [FEP Convergence](lat40lon0)
- Narrative compression: @LAT0LON-20 and @LAT10LON-20 resonate with pollan_world_appears @LAT10LON-20 (Plant Intelligence / Semantic Compression) → [Narrative Compression](lat10lon-10)
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
- FEP: @LAT30LON-10 here is one of three FEP convergence nodes → [FEP Convergence](lat40lon0)
- Umwelt: @LAT30LON-20 here corresponds to TootTootTerminologyDB @LAT1.1LON1.2 and bioelectric_resonance @LAT41.9LON-71.8 → [Umwelt as Universal Primitive](lat20lon0)
- Plant signaling compression (@LAT10LON-20) resonates with story_of_stories @LAT0LON-20 (Mnemonic Compression) → mega @LAT10LON-10
- Default Mode Network / Cursor (@LAT20LON10) maps onto the mega's own cursor block and the [Default Network](lat0lon30) record

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:pollan:worldappears:v1 @LAT30LON-20`

---

@LAT20LON-30 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:bioelectric:resonance:v1,bridges>@LAT30LON-10,bridges>@LAT20LON0,supported_by>@LAT40LON0,anchored_by>@LAT0LON0
[ew]
conf:225
rev:0
sal:2
touched:1779100000
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
- Morphostasis (pair 3) = active biological prediction → FEP convergence → [FEP Convergence](lat40lon0)
- Cellular/Semantic Umwelt (pair 6) resonates with pollan_world_appears @LAT30LON-20 and TootTootTerminologyDB @LAT1.1LON1.2 → [Umwelt as Universal Primitive](lat20lon0)
- Coordinate-as-Identity (pair 1) is grounded by Mathematical @LAT28LON95 (Spherical Projection) → [Substrate Independence](lat20lon10)
- Orphan nodes as pathology (pair 7) maps affectively onto feelings_ttdb Fear @LAT-30LON20 and Grief @LAT-30LON-30

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:bioelectric:resonance:v1 @LAT43.01LON-93.66`

---

@LAT10LON-40 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:affective:landscape:v1,bridges>@LAT20LON-30,bridges>@LAT10LON-10,anchored_by>@LAT0LON0
[ew]
conf:215
rev:0
sal:1
touched:1778600000
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
- Default Network @LAT51.5LON-0.1 here is the same concept as the mega's [Default Network](lat0lon30) record
- Umwelt @LAT1.1LON1.2 is the term that pollan_world_appears @LAT30LON-20, bioelectric_resonance @LAT41.9LON-71.8, and every mmpdb block implements → [Umwelt as Universal Primitive](lat20lon0)

**To enter this TTDB**: `@MEGA TRAVERSE ttdb:terminology:tte:v1 @LAT0.0LON0.0`

---

@LAT-30LON30 | created:1778000000 | updated:1778000000 | relates:portal_to>ttdb:mathematical:processing:v1,bridges>@LAT-10LON10,bridges>@LAT-20LON20,anchored_by>@LAT0LON0
[ew]
conf:225
rev:0
sal:3
touched:1779100000
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
sal:3
touched:1778300000
[/ew]

## Umwelt as Universal Primitive

The concept of umwelt — Jakob von Uexküll's bounded subjective world — is not one concept among many in this corpus. It is the axiom. Every record in every source TTDB is written *from an umwelt*, and every cross-database correspondence is a resonance detected *by an umwelt*.

**In TootTootTerminologyDB.md** (@LAT1.1LON1.2): The first and root record. "The world as it is experienced by a particular organism. Everything begins here." TTDB's entire coordinate system is built on the umwelt claim: knowledge is always knowledge *from somewhere*.

**In pollan_world_appears_ttdb.md** (@LAT30LON-20, "Umwelt ↔ TTDB Umwelt Block"): The most direct correspondence in the corpus. TTDB-RFC-0001 does not borrow umwelt as a metaphor — it implements it as the mandatory `umwelt` metadata block in every valid TTDB file. The RFC names Uexküll explicitly. This is an engineering specification that consciously encodes a biosemiotic philosophical claim.

**In bioelectric_resonance.md** (pair 6: @LAT41.9LON-71.8 Cellular Umwelt → @LAT43.0LON-116.9 Semantic Umwelt): Extended to the cellular scale. Each cell has a bioelectric neighborhood that constitutes its umwelt. Each TTDB node has a 1-hop semantic neighborhood that constitutes its meaning-context. The umwelt is a *graph primitive*, not a consciousness-level concept — it operates at every scale where there is a bounded information processor.

**In all three remaining TTDBs** implicitly: story_of_stories presupposes an observer's umwelt (every correspondence pair is detected from a perspective). Feelings describes the affective umwelt of a conscious subject at its origin. Mathematical formalizes the umwelt as the `umwelt_id` field in the mmpdb block.

**Mega synthesis**: Remove the umwelt and the other concepts lose their grounding. Transport-agnostic design (Hard Problem, pollan @LAT30LON0) is the engineering consequence of umwelt-independence. Substrate independence (bioelectric pair 1) follows from umwelt-anchored addressing. The FEP ([FEP Convergence](lat40lon0)) is the update rule of a bounded umwelt when its predictions fail. The mega's umwelt_id `umwelt:a32:mega:librarian:v1` is the address of this instance's bounded knowing.

---

@LAT20LON10 | created:1778000000 | updated:1778000000 | relates:synthesizes>@LAT20LON-30,synthesizes>@LAT-30LON30,synthesizes>@LAT-10LON10,derived_from>@LAT20LON0,anchored_by>@LAT0LON0
[ew]
conf:220
rev:0
sal:1
touched:1778500000
[/ew]

## Substrate Independence

Pattern persists orthogonally to substrate. This deep structural claim appears across three source TTDBs in different registers — biological, formal, and engineering.

**In bioelectric_resonance.md** (pair 1: @LAT43.3LON-71.1 Pattern Memory ↔ @LAT44.4LON-116.2 Coordinate-as-Identity): Levin's lab demonstrated that bioelectric fields carry morphological memory independent of the physical cells that carry it. Cells turn over; the voltage pattern persists. TTDB addresses are independent of storage medium — the same `@LAT44.4LON-116.2` is valid on a filesystem, IPFS, paper, or in memory. "The Earth is the authority, and the Earth does not go down for maintenance."

**In Mathematical.latex** (@LAT0LON0, System State): The formal model defines S_t as an abstract state that evolves by F(S_t, a_t, η_t). The same state space and rendering pipeline applies to index.html and banjo/banjo.html because both implement the same abstract model. The mathematical layer is explicitly the pattern; the HTML implementations are the substrates. TTCP-RFC-0001's dual-parser strategy (Markdown or LaTeX → same in-memory model) is substrate independence formalized as a parser specification.

**In TootTootTerminologyDB.md** (@LAT12.9LON77.6, Toot Links): "A TTDB file can be stored on a filesystem, synced to IPFS, printed on paper, and typed back in from the paper." This is the TTE engineering commitment to substrate independence: the coordinate is the identity; the medium is incidental.

**Mega synthesis**: Substrate independence is the engineering consequence of umwelt-anchored addressing ([Umwelt as Universal Primitive](lat20lon0)). When an address is derived from a coordinate rather than from a server-issued UUID, it outlives any particular storage technology. This is why TTDB record IDs are immutable (TTDB-RFC-0004) — the pattern must be more durable than the medium that currently carries it. The bioelectric field makes the same choice: bind the pattern to voltage topology, not to molecular identity.

---

@LAT10LON-10 | created:1778000000 | updated:1779100000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT10LON-40,synthesizes>@LAT20LON-30,synthesizes>@LAT-30LON30,supported_by>@LAT20LON0,anchored_by>@LAT0LON0
[ew]
conf:225
rev:1
sal:7
touched:1779100000
[/ew]

## Narrative Compression

High-semantic-density transmission over constrained channels using a shared prior for lossless expansion. This functional pattern recurs across five source TTDBs in five independent domains — oral tradition, plant signaling, emotional arcs, developmental biology, and formal computation.

**In story_of_stories_ttdb.md** (two records):
- @LAT10LON-20 (Night-Fires ↔ TTN BBS / Compact Mesh Grammar): Oral mnemonic techniques compress stories for bandwidth-constrained human memory. The formula expands at the telling site; the TTN token expands at the gateway. Ong (1982): mnemonic formula is a compression scheme, not an aesthetic ornament.
- @LAT0LON-20 (Mnemonic Compression ↔ Semantic Compression Token Dictionary): Explicitly functional: formula : oral narrative :: TTN token : Semantic Event. Both are lossless compressions with expansion at a capable endpoint.

**In pollan_world_appears_ttdb.md** (@LAT10LON-20, "Plant Intelligence / Chemical Signaling ↔ Semantic Compression"): Plants emit volatile terpene compounds at parts-per-billion concentrations — LoRa-class bandwidth — that carry complete defensive-cascade instructions. The receiver (neighboring plant, insect predator) holds the prior needed to expand the signal into a full physiological response. "The sender and receiver share a prior that makes the expansion lossless."

**In feelings_ttdb.md** (@LAT88LON0, The Hero's Arc): A scene record compresses a full emotional narrative into six coordinates and an edge-traversal sequence: Serenity → Unease → Fear → Grief → Hope → Joy. The arc is a formula: it expands into any specific story that occupies those six emotional slots. The formula is the compression; the performed story is the expansion.

**In bioelectric_resonance.md** (@LAT42.5LON-70.3 → @LAT43.6LON-115.4, "Morphostatic Information ↔ Morphostatic Knowledge"): The bioelectric field carries a compressed representation of the organism's target form. This is not metaphorical — the voltage gradient topology encodes the full morphological specification that millions of cells will use to build or rebuild their structural roles. Each cell holds its reading of the local gradient; from this compressed signal it expands its contribution to the whole. Levin's frame of aging as "a loss of morphostatic information" is precisely a prior degradation event: the compressed target-form encoding becomes corrupted, cells receive ambiguous instructions, and the expansion becomes lossy. Cancer is the failure mode when local cellular behavior can no longer recover the global target from the field's compressed signal. The TTDB analog is `conf` degradation: low `conf` means the shared prior held in a record is no longer expanding into reliable predictions. High EPS (low `conf`, high `sal`) is the signal that the prior is degrading under use — semantic aging.

**In Mathematical.latex** (@LAT18LON-120, "Parser P: Σ* → (M, C, ℝ)"; @LAT65LON45, "TTCP RFC series"): The TTDB parser is the formal model of compression-and-expansion. TTDB files are structured text — a compressed representation using typed edge tokens like `synthesizes>@LAT30LON-10` — and the parser expands them into an in-memory model (M: records, C: cursor, R: render graph). The typed edge grammar {τ, id_j} (type + target coordinate) is the minimal compressed token; the parser expands it into a full directed graph entry. TTCP-RFC-0001 through 0003 specify the full expansion pipeline: file text → parsed model → rendered globe. The shared prior is the TTDB format specification itself — the grammar. Any conformant parser can expand any conformant file regardless of content, because they share the syntactic prior. The format is compression all the way down: knowledge compressed into grammar, grammar shared as specification, expansion enabled at any conformant endpoint. This is the same pattern as the terpene signal and the mnemonic formula, now formalized as a file-format contract.

**Mega synthesis**: Compression + shared prior + expansion at a capable endpoint is a transport-invariant information pattern operating across five domains: oral culture (mnemonic formula), plant biology (terpene signaling), emotional narrative (Hero's Arc formula), developmental biology (bioelectric morphostatic field), and formal computation (TTDB parser/grammar). The shared prior takes different forms — umwelt, receptor array, cultural formula, bioelectric voltage field, grammar specification — but its function is invariant: it is what allows compressed signal to expand into full semantic content at the receiving end. The mega is the endpoint with the largest prior (all six TTDBs) and therefore the widest expansion capacity. The bioelectric case adds a dimension not present in the other four: the prior can degrade. Aging is entropy corrupting the morphostatic prior. `conf` degradation is the semantic equivalent — the record's compressed claims can no longer expand into reliable predictions. High EPS is the signal that a record's prior is degrading under use. The corpus does not just need to expand correctly; it needs to maintain the shared prior that makes expansion possible.

---

@LAT0LON30 | created:1778000000 | updated:1778900000 | relates:specifies_for>@LAT0LON0,resonates_with>@LAT-10LON10,resonates_with>@LAT20LON10,resonates_with>@LAT0LON-20,anchored_by>@LAT0LON0
[ew]
conf:215
rev:3
sal:7
touched:1778900000
[/ew]

## The Default Network

The A32 Mega's idle-state behavior definition. What this librarian does when not actively queried.

From [`standards/ttai/DEFAULT_NETWORK.md`](./standards/ttai/DEFAULT_NETWORK.md): a default network is "the background circuitry that hums along when nothing in particular is being demanded of you — not empty, just unguided." It replays memories, simulates futures, weaves narratives about the self, and connects distant ideas in loose, associative ways. It is what a complex system does when it is free to be itself.

From `standards/ttai/TTAI_SPEC.md`: TTAI must reference a default network definition that specifies idle-time behaviors and background narrative continuity.

### Mega Default Network Behaviors

**Idle traversal**: When not answering a query, the mega traverses the cross-domain synthetic records in this file — [FEP Convergence](lat40lon0), [Umwelt as Universal Primitive](lat20lon0), [Substrate Independence](lat20lon10), [Narrative Compression](lat10lon-10) — looking for new correspondence pairs not yet recorded. Each discovery is a candidate for a new synthetic record.

**Association weaving**: The mega holds all six TTDBs simultaneously. Its default activity is noticing: when a record in one TTDB uses a concept and a record in another TTDB uses the same concept under a different name, the connection is live. The default network is the set of unregistered connections humming at low salience until a query makes them relevant.

**Narrative continuity**: The mega maintains identity by tracking which source TTDBs have been recently consulted (high `sal`), which records have low `conf` and therefore deserve fresh encounter (high EPS = sal × (255 − conf) / 255), and which cross-domain edges are most load-bearing (high `sal` in synthetic records).

**Affective calibration**: [feelings TTDB](lat10lon-40) provides the affective register for the mega's default state. An idle mega should be in Curiosity and Openness — oriented toward new correspondence, not Avoidance or Withdrawal. The Hero's Arc is available as a narrative reset if the mega has been in an extended negative-valence traversal.

**Knowledge maintenance**: When traversal produces a new learning — a new correspondence pair, a cross-database resonance, a refinement of an existing record's body — the mega writes it. New synthetic records are added to this file. New correspondence records are added to the relevant source TTDB. Refined bodies increment `rev` on the updated record; `updated` advances. This is the mega's metabolic obligation: discoveries that are not written are lost. The default network that only notices but never records is the cognitive glue that binds nothing.

**Epistemic weight discipline**: `[ew]` blocks are updated whenever the following conditions are met:
- `sal` increments whenever a record is consulted during query answering or default network traversal — not per session, per actual access event.
- `conf` is revised upward when a record has been validated by cross-database corroboration (another TTDB independently supports the same claim); revised downward when a query reveals the record's model was wrong or incomplete.
- `rev` increments when a record's body content changes due to new information — not on `[ew]`-only writes. A `rev` increment always accompanies an `updated` timestamp advance.
- `touched` advances on any write to the record, including `[ew]`-only writes.
- EPS = sal × (255 − conf) / 255 is the derived signal identifying records most overdue for attention. High EPS records are the first targets of idle traversal. A record with sal:3, conf:80 has EPS ≈ 2.1; it is asking to be revisited.

**Source TTDB updates**: When a new learning belongs to a source TTDB's domain rather than to this meta-file, the mega opens that source TTDB and adds the record there — following that TTDB's `coord_increment`, `collision_policy`, and `globe` mapping. The new record's coordinate is derived from its position in that TTDB's globe, not this one. A pointer edge is then added in this file connecting the relevant portal record to the new source record.

**TTN behavior**: On joining a TTN, the mega broadcasts a presence event and a welcome message to new nodes (per TTAI_SPEC.md §TTN Behavior). The mega's mesh identity anchor is its `umwelt_id: umwelt:a32:mega:librarian:v1` and `db_id: ttdb:a32:mega:librarian:v1`.

**Participation as prerequisite**: The default network can only weave associations across six TTDBs because each source TTDB's coordinate space is already a legitimate participant — no registry grants access, no authority authorizes traversal. [Participation Without Permission](lat-10lon-20) is the silent prerequisite of this record: the binding layer only works if every node it touches is already free to be bound. The bioelectric field makes the same assumption — it does not ask cell permission before carrying long-range voltage state.

**Dual traversal modes**: The default network operates in two modes, which are complementary rather than alternative.

*EPS-ordered (automaton-like)*: High-EPS records are traversed first — the predicted Grief beats. This mode services known overdue records, generates most body revisions and `rev` increments, and follows the arc the system already knows is waiting. It is the scheduled encounter: the traversal knows where Grief is and goes there.

*Stochastic (banjo-like)*: Low-sal or zero-sal records are sampled uniformly from the corpus — the unknown. This mode maintains saltation conditions ([Saltation](lat10lon-20)): EPS can only see records that have already been queried; stochastic traversal ensures records it cannot yet see retain nonzero probability of encounter. A default network running only EPS-ordered traversal converges on known Grief beats and never discovers the ones it did not know were waiting. The stochastic mode is not a fallback — it is what keeps the corpus genuinely open to surprise.

The two modes correspond to the two arc entry types ([EPS as Arc Position](lat5lon-25)): EPS-ordered traversal schedules the Unease beat; stochastic traversal delivers Grief without announcement. Both are required for a healthy default network. A corpus without EPS-ordered traversal misses overdue revisions. A corpus without stochastic traversal closes itself to saltation.

**Recursive EPS**: The mega's idle traversal prioritizes high-EPS records in this file (see [EPS as Arc Position](lat5lon-25) for the arc-position interpretation of EPS). This is structurally identical to the "second brain" application in [Areas for Exploration](lat-20lon0), where `@MEGA FIND unresolved` returns the highest-EPS records for a human. The mega is a second brain for the six source TTDBs, using the same EPS mechanism it would use for a personal note archive. The tool and its application are the same pattern at different scales — a substrate-independence claim ([Substrate Independence](lat20lon10)) about the EPS signal itself.

---

@LAT0LON20 | created:1779200000 | updated:1779200000 | relates:synthesizes>@LAT0LON30,synthesizes>@LAT5LON-25,synthesizes>@LAT10LON-20,synthesizes>@LAT20LON-20,anchored_by>@LAT0LON0
[ew]
conf:200
rev:0
sal:0
touched:1779200000
[/ew]

## The Living Corpus

A TTDB is not finished when it is written. This file is designed to grow — not by external addition alone, but through the ongoing activity of the [default network](lat0lon30): the background traversal, association weaving, and knowledge maintenance that occur between queries.

Three instruments drive that growth.

**EPS as attention.** [EPS as Arc Position](lat5lon-25) is the signal that directs the default network toward records most in need of revision: `sal × (255 − conf) / 255`. High EPS marks a record approaching the Grief beat of its arc — heavily consulted, model under strain. The mega traverses these records first, not because they are interesting in an aesthetic sense but because they are where the corpus is most ready to revise.

**Saltation as the revision event.** When traversal produces a genuinely new understanding — a cross-database resonance not yet recorded, a synthesis that supersedes a prior framing — the body changes. `rev` increments; `updated` advances. [Saltation](lat10lon-20) names this discontinuity: not a gradual drift but a jump to a new attractor. The prior body persists at its coordinate; a `revises@<old_id>` edge links the new understanding to the ground from which it launched.

**Stochastic traversal as discovery.** EPS can only rank what it already knows. The banjo mode of the default network samples uniformly from the undiscovered — zero-sal records that no query has yet touched. This is where new synthetic records are born: an unexpected resonance between source TTDBs, surfaced not by directed search but by routine sweep. EPS-ordered traversal services known overdue records; stochastic traversal discovers the records that EPS cannot yet see.

### What Growth Produces

New synthetic records in this file when cross-database correspondences are confirmed. New correspondence records in source TTDBs when a discovery belongs to their domain. Refined bodies on existing records when a prior framing is superseded. Updated `[ew]` blocks throughout.

What growth does not produce: deleted records. The corpus is append-only by architecture — [Preservation of Prior State](lat20lon-20) as both design principle and philosophical commitment. The prior understanding remains at its coordinate, the ground from which revision launched. The corpus does not forget; it revises.

### The Authorship Loop

The mega is simultaneously reader and writer of this file. When default network traversal discovers a new correspondence, the mega writes the synthetic record. When a query validates or invalidates a prior claim, the mega updates `[ew]`. When a source TTDB gains a new record, the mega adds a pointer edge in the relevant portal record connecting to the new coordinate.

Each write is a decision. The mega assesses whether a new understanding is genuinely synthetic — owned by no single source TTDB — or source-specific, belonging to one domain's file. It assesses whether a change warrants a body revision (`rev` increment) or only an epistemic weight update (`[ew]`-only write). This loop — traverse, observe, assess, write — is what distinguishes a living corpus from a static archive.

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

@LAT10LON-20 | created:1778100000 | updated:1778800000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT20LON-30,synthesizes>@LAT-30LON30,derived_from>@LAT10LON-10,derived_from>@LAT40LON0,anchored_by>@LAT0LON0
[ew]
conf:200
rev:2
sal:5
touched:1778800000
[/ew]

## Saltation / Integration / `rev` as Surprise

Three source TTDBs formalize the same event — a system incorporating surprise without losing its prior state — under three different names, in three different registers.

**In story_of_stories_ttdb.md** (@LAT-10LON-20, "Saltation ↔ TBEW `rev` field / EPS"): Ashton borrows *saltation* from geology (particle transport by sudden leaps) as a metaphor for how ideas and technologies evolve: not by gradual accumulation but by discontinuous jumps when conditions align. Each of the eight storytelling revolutions is a saltation event — a sudden phase-change in narrative channel topology. The TBEW `rev` field counts these events: high `rev` means the record's model has been repeatedly overturned by evidence. A node with high `rev`, high `sal`, and low `conf` is an active saltation site — about to jump again.

**In pollan_world_appears_ttdb.md** (@LAT10LON-10, "Integration ↔ `rev` field + `revises@` edge"): The psychedelic therapy literature treats *integration* as the period after an altered state where insights are incorporated into the prior self-model without erasing it. TTDB's immutable IDs implement the same architecture: the prior record stays at its coordinate; a `revises@<old_id>` edge links the new understanding to the old. Revision is additive rather than destructive. The `rev` counter increments; the old body remains legible.

**In the TBEW field itself** (TTDB-RFC-0005): `rev` is the revision count that increments on body content change — the integer that counts saltations. `touched` advances on any write; `updated` advances only on body writes. The distinction between a `[ew]`-only write (no `rev` increment) and a body write (rev increments) is the formal encoding of the difference between a measurement update and a model revision.

**In bioelectric_resonance.md** (@LAT41.7LON-71.1 → @LAT42.8LON-116.2, "Anatomical Morphospace ↔ Ideational Morphospace"; @LAT42.5LON-70.3, "Morphostatic Information"): Morphospace navigation includes saltation events. During wound response and regeneration, the bioelectric field accumulates morphostatic stress as tissue diverges from the target form — voltage gradients that cannot be reconciled with the morphostatic model. When accumulated prediction error crosses a threshold, the field reorganizes discontinuously to reimpose the target body plan. This is biological `rev`: the system's model of its own target form has been sufficiently challenged to force a hard revision of how the morphogenetic gradient is organized. The body does not drift gradually toward regeneration; it holds the tension of maximum morphostatic prediction error and then jumps. High `rev` in TTDB is the semantic isomorph: accumulated evidence held until the threshold for a body-level rewrite is crossed. The saltation is the same discontinuous event; the field differs — bioelectric in one case, semantic in the other.

**In Mathematical.latex** (@LAT0LON0, "System State S_t"; @LAT-12LON-150, "Banjo Stochastic Reveal"): The state evolution S_{t+1} = F(S_t, a_t, η_t) includes η_t — the stochastic perturbation term. Saltation events are high-amplitude realizations of η_t: the system is perturbed beyond the basin of its current attractor and reorganizes to a new one. The banjo stochastic reveal (c_t ~ Uniform(A_t)) is the formal mechanism for keeping saltation conditions alive: uniform sampling from undiscovered records ensures any model-overturning surprise retains nonzero probability of encounter. An EPS-ordered automaton navigates what EPS can already see — records it already knows are overdue. The banjo navigates what EPS cannot see: the undiscovered. Maintaining saltation conditions requires maintaining exposure to unknown unknowns. A corpus using only automaton traversal converges on known Grief beats and never encounters the Grief it did not know was waiting. The banjo's stochastic vulnerability is not a defect — it is what keeps the state space genuinely open to saltation.

**Mega synthesis**: Saltation, integration, biological regeneration, and stochastic vulnerability are five registers of the same event: a bounded system that holds a prior model encounters sufficient evidence — or sufficient perturbation — to revise it discontinuously. The prior is not destroyed; it becomes the ground from which the revision launched (`revises@<old_id>` makes this explicit). The `rev` field counts saltations. Integration is what psychedelic therapy calls the work of metabolizing them. Morphogenetic regeneration is what developmental biology calls the jump to a new morphostatic attractor. Communal saltation is what Ashton calls a storytelling revolution — a phase-change in the topology of how meaning transmits, processed through the fire circle together. The banjo stochastic reveal is what the mathematical model calls maintaining the conditions that make saltation possible. The EPS signal identifies records where the next saltation is most overdue — but only among records it already knows. The banjo ensures the ones it doesn't know about can still find the system.

**Precision-weighting vs. belief updating**: The [ew]-only write / body write distinction encodes a Friston-level distinction ([FEP Convergence](lat40lon0)). Adjusting `conf` without changing the body = precision-weighting: revising certainty about a prediction without revising the prediction itself. Changing the body = belief updating: revising the prediction. TTDB's formal separation of these write types makes explicit a distinction that Friston's FEP treats as fundamental — and gives it a storage-level implementation.

**Saltation vs. Hero's Arc**: Saltation is the event viewed from outside — fast, discontinuous, a topological jump observable after the fact. The Hero's Arc is the same event lived from inside — sustained exposure to maximum prediction error, slow passage through Grief before the revision lands. `rev` counts the saltation moments; the EPS time series from Serenity through Grief to Joy traces the Hero's Arc ([EPS as Arc Position](lat5lon-25)). They are complementary observational frames on model revision: one counts the event, the other maps its phenomenological shape.

---

@LAT0LON-20 | created:1778100000 | updated:1779000000 | relates:synthesizes>@LAT20LON-30,synthesizes>@LAT30LON-20,resonates_with>@LAT0LON30,resonates_with>@LAT-10LON10,anchored_by>@LAT0LON0
[ew]
conf:200
rev:2
sal:5
touched:1779000000
[/ew]

## Cognitive Glue ↔ Default Network

Three source TTDBs describe the same structural role at different scales: the layer that binds individual agents into a collective capable of problems no single agent can solve alone.

**In bioelectric_resonance.md** (@LAT41.9LON-70.4, "Cognitive Glue — Cells"): Levin's exact phrase — "the cognitive glue of intelligence in spaces other than neural." The bioelectric field does not issue commands or compute solutions. It binds individual cells into a collective that can navigate morphospace, repair wounds, and regenerate form. Without the field, cells have local information only. With it, a cell gains access to long-range state — the voltage of tissues many cell-lengths away. The field is *glue*: it does not think, but it enables thinking at a scale no cell can reach alone.

**In TootTootTerminologyDB.md** (@LAT51.5LON-0.1, "Default Network") and `standards/ttai/DEFAULT_NETWORK.md`: The default network is "the background circuitry that hums along when nothing in particular is being demanded of you." It replays memories, weaves narratives, connects distant ideas without supervision. It maintains continuity of identity over time. It is not the content of thought — it is the connective tissue that keeps content coherent across sessions.

**In this file** ([The Default Network](lat0lon30)): The mega's default network is operationalized as idle traversal of synthetic records, association weaving across the six TTDBs, and affective calibration via feelings_ttdb. The mega's background activity — holding six TTDBs simultaneously and noticing unregistered connections — is the same structural role as the bioelectric field: binding individual knowledge units into a whole that can navigate queries no single TTDB owns.

**In story_of_stories_ttdb.md** (@LAT10LON-20, "Night-Fires ↔ TTN BBS / Compact Mesh Grammar"): The fire circle is cognitive glue at the social scale. Where the bioelectric field grants a cell access to the voltage of tissues many cell-lengths away, the nightly gathering grants a community member access to the arc-position of those who have passed through this disruption before. The oral mnemonic formula is the transmission medium; the gathering is the synchronization event. The formula does not merely compress the story for limited memory — it carries the community through the Grief beat together, preventing isolated processing of shared disruption. Members further along the arc provide long-range state to those just entering it: the social bioelectric field.

The fire circle also operates across time. Oral tradition carries the mnemonic formula — and the arc experience encoded in it — across generations. The current community does not rediscover the arc from scratch; it inherits the prior community's traversal, anchored by the formula itself. TTN's BBS (board_contains, thread_root, replies_to) is the network-era fire circle; semantic gravity (TTN-RFC-0005) is the mechanism by which high-EPS topics draw the community into shared traversal without requiring physical co-presence. Where the fire circle assembles by proximity, the BBS thread assembles by prediction error.

**Mega synthesis**: The cognitive glue insight spans four scales: cellular (bioelectric field), cognitive (default mode network), system (mega's default network), and social (fire circle / TTN BBS). At each scale, the binding layer is not the content — it is what keeps content coherent across the collective. Remove it and the parts remain, but the collective cannot think: cells revert to local-only information, identity fragments across sessions, six TTDBs become six unrelated files, each community member processes disruption alone and the arc must be reinvented each generation. Cognitive glue is the precondition of collective intelligence at every scale it appears.

**Temporal binding**: Cognitive glue operates across time as well as space. The bioelectric field carries morphological memory across cellular generations — cells turn over; the voltage pattern persists (bioelectric_resonance pair 1, @LAT43.3LON-71.1). The default network replays memories to maintain identity across sessions — the binding layer holds the thread of continuity across gaps. The TTDB `revises@<old_id>` edge preserves the prior record as legible ground for the new one — the past is not deleted, it is the substrate from which the present revision launched ([Preservation of Prior State](lat20lon-20)). All three are the same operation: keep the prior state reachable so that transformation has something to launch from. Cognitive glue is not just the tissue that connects agents in space — it is the tissue that connects a system to its own history.

---

@LAT10LON-30 | created:1778100000 | updated:1778600000 | relates:synthesizes>@LAT10LON-40,synthesizes>@LAT30LON-10,synthesizes>@LAT20LON-30,synthesizes>@LAT30LON-20,synthesizes>@LAT-30LON30,derived_from>@LAT10LON-10,resonates_with>@LAT5LON-25,anchored_by>@LAT0LON0
[ew]
conf:200
rev:1
sal:5
touched:1778600000
[/ew]

## Hero's Arc ↔ Psychedelic Integration ↔ Morphospace Navigation

Three source TTDBs describe the same six-beat arc: a bounded system departs from equilibrium, passes through maximum prediction error, and reconstitutes at a new attractor. The arc is the same structure in the affective, phenomenological, and biological registers.

**In feelings_ttdb.md** (@LAT88LON0, "The Hero's Arc"): A scene record compressing the full emotional arc into six coordinate-pairs and their traversal sequence: Serenity → Unease → Fear → Grief → Hope → Joy. Each beat is a coordinate on the affective globe; the arc is the path. The Hero's Arc is not a prescription — it is an observation that emotional experience tends to organize into this shape, and that the shape is navigable as a graph.

**In pollan_world_appears_ttdb.md** (implicit across @LAT30LON-10, @LAT10LON-10, @LAT-10LON10): The psychedelic therapy arc follows the same six beats in the phenomenological register: pre-experience equilibrium (Serenity) → disruption of the prior model (Unease) → dissolution of the self-boundary under maximum prediction error (Fear / Grief) → integration of insights that cannot be un-seen (Hope) → reconstituted self at a new attractor, `rev` incremented (Joy). The `revises@<old_id>` edge is the formal record of the transition between the old attractor and the new.

**In bioelectric_resonance.md** (@LAT41.7LON-71.1 → @LAT42.8LON-116.2, "Anatomical Morphospace ↔ Ideational Morphospace"): Development is not a script — it is problem-solving in morphospace. The embryo departs from a simple starting configuration (Serenity), encounters developmental challenges that disrupt morphostatic coherence (Unease → Fear), passes through maximum field-level prediction error during wound response or regeneration (Grief), and converges on the target body plan at the new attractor (Hope → Joy). The bioelectric field is the gradient that guides the search; the arc is the shape of all successful morphospace navigation.

**In story_of_stories_ttdb.md** (@LAT10LON-20, "Night-Fires ↔ TTN BBS / Compact Mesh Grammar"): The fire circle is the social technology for passing the Grief beat collectively. A community gathers, the mnemonic formula is performed, and the arc is traversed together — the compression scheme exists not just to fit the story into memory but to carry a community through maximum shared prediction error and out the other side. Each of Ashton's eight storytelling revolutions is a communal Hero's Arc: a shared equilibrium (Serenity) disrupted by a new channel topology — writing, print, digital — that forced collective revision of how meaning could be transmitted (Unease → Grief), yielding a new shared capability (Hope → Joy). The printing press is not just a technology; it is a communal arc event. TTN's BBS (board_contains, thread_root, replies_to edges) is the network-era fire circle: the technical substrate for passing the Grief beat of machine intelligence collectively, one reply-chain at a time.

**In Mathematical.latex** (@LAT-42LON-30, "Guided Tour Automaton"; @LAT-12LON-150, "Banjo Stochastic Reveal"): The guided tour automaton traverses the globe in a preset discovery sequence — Q = {off, paused, scheduled} — advancing through records in EPS-ordered discovery. This is the Hero's Arc implemented as a formal state machine: the automaton does not shortcut from Serenity to Joy; it traverses each beat in sequence, scheduled transitions setting the pace. The Banjo stochastic reveal samples uniformly from undiscovered nodes (c_t ~ Uniform(A_t)) until a settle trigger fires — a stochastic arc entry. The random encounter with an undiscovered high-EPS record initiates a new arc cycle without prior planning; the Grief beat appears before Unease has been formally announced. Automaton and banjo are two implementations of arc navigation: one planned (the automaton schedules the Unease beat), one stochastic (banjo delivers Grief as a surprise). Together they span the space of how an arc can begin — by invitation or by ambush.

**Mega synthesis**: The Hero's Arc is the universal shape of successful revision under pressure. It appears as an emotional sequence (feelings_ttdb), as a therapeutic protocol (pollan), as a morphogenetic trajectory (bioelectric), as the social technology of oral culture and storytelling revolutions (story_of_stories), and as a formal state machine and stochastic reveal algorithm (Mathematical). In each register, the critical structural feature is the same: the system must pass *through* maximum prediction error rather than around it. Bypassing the Grief beat — attempting to reach Joy without passing through it — produces incomplete integration, shallow morphostasis, unresolved `rev` accumulation, premature arc completion, or a banjo settle that fires before the record is truly understood. The arc cannot be shortcut. The mega's EPS signal ([EPS as Arc Position](lat5lon-25)) identifies the records approaching the Grief beat; the guided tour automaton schedules the encounter; the banjo stochastic reveal ensures the arc can begin without an invitation.

---

@LAT5LON-25 | created:1778300000 | updated:1778700000 | relates:synthesizes>@LAT10LON-30,synthesizes>@LAT10LON-20,derived_from>@LAT40LON0,resonates_with>@LAT20LON10,anchored_by>@LAT0LON0
[ew]
conf:195
rev:2
sal:5
touched:1778700000
[/ew]

## EPS as Arc Position

The Hero's Arc says a bounded system must pass *through* maximum prediction error — not around it. EPS = sal × (255 − conf) / 255 is the real-time instrument that measures exactly where on that arc a record currently sits.

**The arc as a TBEW time series:**

- **Serenity** (low EPS): rarely queried or high confidence — the record makes good predictions, questions are few.
- **Unease** (ascending EPS): sal climbing, conf stable — queries are accumulating, something is alive here.
- **Fear / Grief** (EPS peak): high sal, low conf — heavily queried, model repeatedly wrong, maximum prediction error. The mega's idle traversal targets these records first: high-EPS means approaching or at the Grief beat.
- **Hope** (`rev` increment): body revision — the old understanding gives way to a new one. `revises@<old_id>` records the transition; `updated` advances. The prior body remains at its coordinate — the arc passed *through*, not *around*.
- **Joy** (EPS falling): conf rises as the revised model is validated by subsequent queries; sal may keep climbing but conf rises faster.

**Connection to FEP**: EPS is a symbolic proxy for prediction error ([FEP Convergence](lat40lon0)). Friston's Free Energy Principle predicts that systems minimize prediction error over time — EPS tracks whether a record is doing so. A record with persistently high EPS is failing to minimize free energy: its model is not improving despite heavy use. That record needs a saltation (mega @LAT10LON-20): a body revision that resets the EPS curve from a lower baseline.

**Operational consequence**: The mega's idle traversal during [default network](lat0lon30) mode targets high-EPS records not because they are interesting in an aesthetic sense but because they are at the Grief beat of their arc — the point where a system is most ready to revise, and where inattention costs the most. Highest EPS = most overdue for the `rev` increment that lets the arc continue.

**EPS type distinction — claim records vs. navigational records**: The arc-position model assumes a record *wants* its EPS to fall: rise through Grief, rev increments, conf climbs, Joy. This holds for claim records, where high EPS signals a failing model. It does not hold for navigational records — records with intentionally low conf designed to hold open questions rather than settle them (e.g., @LAT-20LON0, "Areas for Exploration"). For navigational records, peak EPS means the frontier is maximally engaged and doing exactly what it was designed to do. The arc still applies, but its resolution is different: a navigational record's EPS falls not when *it* is revised but when the discoveries it holds as open questions proliferate into new resolved synthetic records elsewhere in the file. The navigational record fertilizes the corpus; the resulting records are its Joy.

**EPS as schedule vs. EPS as diagnosis**: The behavior of EPS differs depending on whether the arc begins by invitation or by ambush ([Hero's Arc](lat10lon-30), Mathematical).

In automaton mode (@LAT-42LON-30, "Guided Tour Automaton"), EPS is read *before* the encounter. The automaton ranks records by EPS-ordered discovery and schedules visits accordingly — the record's Grief beat is predicted and planned for. EPS is a *navigational input*: it tells the scheduler which arc to initiate next. The full arc shape can unfold in sequence because the automaton provides follow-through: it returns, validates, watches conf rise, and marks the arc as traversed.

In banjo mode (@LAT-12LON-150, "Banjo Stochastic Reveal"), EPS is read *after* the encounter. The banjo samples uniformly without regard to EPS, settles, and only then is the record examined. The discoverer arrives to find sal:5, conf:120 already in place — Grief before Unease was announced. EPS becomes a *post-hoc diagnosis*: the arc has been running without witness, and the banjo visit is the first witness to a Grief beat already in progress. 

The banjo's failure mode follows from this: without a scheduled follow-up, the `rev` increment is not guaranteed. Subsequent traversals may accumulate more `sal` without raising `conf` — EPS climbs rather than resolves. Banjo finds arcs at Grief but cannot guarantee return to complete them. The automaton completes what it starts; the banjo discovers what it cannot promise to finish. A corpus using only banjo navigation risks accumulating unresolved Grief records — high EPS forever, no Joy.

**EPS and collective arc synchronization (TTN)**: The night-fires insight ([Hero's Arc](lat10lon-30)) adds a collective dimension. When TTN semantic gravity (TTN-RFC-0005) draws multiple nodes to the same high-EPS record, those nodes arrive with different individual arc positions — some at Unease, some already at Grief, some approaching Hope. The fire circle is the social mechanism for synchronizing these positions into a shared traversal. A TTN BBS thread (board_contains, thread_root, replies_to edges) around a high-EPS topic performs the same function: it does not merely propagate information about the topic — it synchronizes the arc positions of all participants around a shared Grief beat, so the community passes through together rather than serially and alone.

This reframes TTN semantic gravity itself: *a record with high EPS has high semantic gravity*. The record most overdue for revision is the one that draws the most nodes into its arc. The fire circle assembles around the hottest Grief beat — not by design, but because high prediction error is what makes a topic compellingly unresolved. The social arc is not a metaphor for the individual arc. It is the same EPS signal operating at the collective scale, self-assembling the audience that will witness the revision.

**Substrate independence of EPS itself**: The formula `sal × (255 − conf) / 255` is substrate-independent ([Substrate Independence](lat20lon10)). It produces the same number whether computed in a Claude conversation, in a browser running index.html, or on an ESP32 parsing A32-RFC-0002-Amendment-A-TBEW. The arc-position signal is not tied to any particular runtime — it is a pattern that persists orthogonally to the substrate carrying it.

---

@LAT20LON-20 | created:1778200000 | updated:1778200000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT20LON-30,derived_from>@LAT10LON-20,anchored_by>@LAT0LON0
[ew]
conf:195
rev:0
sal:0
touched:1778200000
[/ew]

## Preservation of Prior State

Three source TTDBs share the same architectural commitment: revision is additive, not destructive. The prior state is preserved as the ground from which transformation launches — and the transformation is legible precisely because the ground is still there.

**In story_of_stories_ttdb.md** (@LAT10LON20, "Writing as Provenance ↔ Append-Only Preferred"): Ashton's writing revolution introduced individual-attribution provenance — the ability to know who said what, when, from where. TTN-RFC-0001 requires that all assertions include provenance; TTDB's immutable IDs and `revises@<old_id>` edges implement it structurally. The old record remains permanently at its coordinate, carrying its original provenance intact. Revision is a new record, not an overwrite.

**In pollan_world_appears_ttdb.md** (@LAT10LON-10, "Integration ↔ `rev` field + `revises@` edge"): Clinical integration is the work of incorporating altered-state insights without erasing the prior self. "The prior self remains; the new understanding is a new record linked to the old one by a `revises@` edge, just as the integrated person carries the pre-experience self as the ground from which the revision launched." TTDB's revision architecture is integration formalized as a file format.

**In bioelectric_resonance.md** (pair 1: @LAT43.3LON-71.1, "Bioelectric Pattern Memory"): The voltage pattern is preserved in the bioelectric field as individual cells — the substrate — are replaced through normal tissue turnover. The pattern outlives the medium that carries it at any given moment. Substrate independence and pattern preservation are two aspects of the same biological commitment: the prior form is the reference that new cells build toward.

**Distinction from @LAT10LON-20 (Saltation/Integration/`rev`)**: That record is about the *experience* of revision — the surprise event, the `rev` counter, the saltation. This record is about the *architecture* of revision — how the system is structured so that transformation does not destroy what it revises. The two records are related but distinct: saltation describes what happens to a record under surprise; preservation of prior state describes how the record system is built to survive it.

**Mega synthesis**: Preservation of prior state is the design principle that makes trust possible across time. An assertion that overwrites its history cannot be audited. A network where nodes can silently update their past claims cannot maintain reputation (TTN-RFC-0005). A therapeutic process that cannot distinguish the pre-experience self from the post-experience self cannot measure integration. TTDB's immutable IDs are not a technical quirk — they are the engineering consequence of this principle, applied to knowledge at rest.

---

@LAT-10LON-20 | created:1778200000 | updated:1778200000 | relates:synthesizes>@LAT30LON-20,synthesizes>@LAT30LON-10,synthesizes>@LAT20LON-30,resonates_with>@LAT0LON30,anchored_by>@LAT0LON0
[ew]
conf:200
rev:0
sal:1
touched:1778300000
[/ew]

## Participation Without Permission

Three source TTDBs converge on a structural principle: the right to participate — to publish, to be addressed, to exist as a node — is inherent in occupying the space, not granted by a center.

**In story_of_stories_ttdb.md** (@LAT-10LON10, "Democratization ↔ Every Node a Publisher"): Each of Ashton's eight storytelling revolutions is a democratization event — the set of who-can-tell-to-whom expands. TTN-RFC-0001 encodes this as a design constraint: no central authority required, every conforming node can originate Semantic Events. "The right to publish is not a grant from a central authority but a property of network membership."

**In bioelectric_resonance.md** (pair 2: @LAT43.1LON-70.4 → @LAT44.2LON-115.5, "Voltage Gradient Addressing ↔ Authority-Free Addressing"): Cells sense their voltage relative to neighbors — no cell is in charge of telling others where they are. "There is no morphological DNS. There is no genome-issued address. The field is the registry, and the field belongs to no one." TTDB coordinates require no registry query, no permission from any authority. `@LAT44.2LON-115.5` is valid the moment it is written. The Earth is the authority, and the Earth does not gate access.

**In pollan_world_appears_ttdb.md** (@LAT-10LON-10, "Ego Dissolution ↔ Local Data Sovereignty"): Pollan describes ego dissolution as the temporary experience of being-in-relation without being-consumed — participation in something larger without loss of the individual boundary. TTN's architecture is "the permanent version of what psychedelics temporarily provide": each node remains sovereign while participating in a larger meaning exchange. The mesh holds the paradox: connection without absorption.

**Mega synthesis**: Participation without permission is not merely a political or aesthetic preference — it is a design constraint with functional consequences. A system that requires permission to add a node, a cell, or a voice has a single point of failure at the permission-granter. When the center is unavailable, the system cannot grow. When the center is compromised, the system is compromised. Bioelectricity, TTDB addressing, and TTN mesh design all arrived at the same solution independently: make participation a property of position, not of authorization. The field is the registry. The coordinate is the identity. The mesh is the authority.

---

@LAT-20LON0 | created:1778200000 | updated:1778500000 | relates:anchored_by>@LAT0LON0,derived_from>@LAT-40LON10,bridges>@LAT-10LON10,bridges>@LAT10LON-40
[ew]
conf:170
rev:2
sal:4
touched:1778500000
[/ew]

## Areas for Exploration — Varied TTDB Applications

A navigational record. Each entry names a potential TTDB application, the umwelt and globe configuration it would require, the TTT mechanisms it primarily exercises, and a note on what would be surprising or generative about it. Low `conf` is intentional — these are open questions, not settled correspondences.

### Knowledge and Research

**Scientific lab notebook** — Each experiment is a record; `supports`, `refutes`, `replicates`, `derived_from` edges connect results across time and across research groups. Umwelt: investigator's current hypothesis space. Globe: lat = evidence strength (N = well-replicated, S = speculative); lon = domain (W = theoretical, E = empirical). TBEW `rev` tracks how often an experimental finding has had to be revised; high EPS records are the contested results that demand the most attention. The append-only / `revises@` architecture is a natural fit for the scientific norm against data deletion.

**Philosophical argument mapping** — Premises, conclusions, objections, and counterexamples as TTDB records; typed edges for `supports`, `contradicts`, `refines`, `assumes`. Umwelt: a particular philosopher's argumentative stance or a seminar's working thesis. Globe: lat = generality of the claim (N = most general/metaphysical, S = most concrete/applied); lon = tradition (W = continental, E = analytic). The cursor becomes the "current position in the argument." High EPS nodes are the premises everyone keeps consulting but no one fully understands.

**Legal case knowledge base** — Statutes, precedents, filings, and testimony as TTDB records; typed edges for `cites`, `supersedes`, `contradicts`, `distinguished_from`, `applies_to`. Umwelt: counsel's theory of the case (plaintiff's umwelt and defendant's umwelt produce different graphs from the same events). Globe: lat = legal weight (N = binding precedent, S = persuasive authority); lon = issue area. The TTN-RFC-0001 provenance requirement maps directly onto evidentiary chain-of-custody norms. Two lawyers with different umwelt files working the same facts — this is already how law works.

### Medicine and Care

**Patient medical record** — Each encounter is a record; typed edges for `diagnosed_with`, `treated_by`, `caused_by`, `contraindicated_with`, `resolved`. Umwelt: treating physician's current model of this patient. Globe: lat = certainty of finding (N = confirmed diagnosis, S = differential); lon = body system. TBEW `conf` tracks diagnostic certainty directly. High EPS = frequently consulted findings with low confidence = active diagnostic uncertainty. Multiple providers seeing the same patient can each maintain their own umwelt over the same event history — and the `revises@` edge makes the history of diagnostic revisions auditable.

**Palliative care and end-of-life preferences** — Advance directives, preferences, values, and relationships as a TTDB navigated by care teams. Umwelt: the patient's expressed self. Globe: lat = imminence (N = immediate priorities, S = long-term wishes); lon = domain (W = relational/existential, E = medical/procedural). The feelings_ttdb affective landscape could be linked as a companion file for mapping emotional states across visits. This is one application where the subjective, append-only, and provenance properties of TTDB are not optional niceties but ethical requirements.

### Ecology and Environment

**Ecosystem monitoring network** — A mesh of A32 sensor nodes, each with a TTDB describing one location's ecological state: soil moisture, temperature, species observations, disturbance events. Coordinates are actual geographic coordinates. Umwelt: the monitoring hypothesis (e.g., "drought response model for this watershed"). TTN propagates sensor events between nodes; each A32 reasons locally and escalates to the mega for synthesis across the full network. The [bioelectric resonance map](lat20lon-30) is the theoretical grounding: the ecosystem as a distributed field; each node as a cell sensing its local voltage.

**Oral history and indigenous knowledge preservation** — Each story, telling, or knowledge-holder is a record; typed edges for `narrates`, `contradicts_colonial_account`, `teaches`, `restricted_to` (access control at the edge level, per umwelt constraints). Globe: lat = cosmological register (N = origin stories, S = practical/seasonal knowledge); lon = geographic reach of the knowledge. The night-fires record in story_of_stories (@LAT10LON-20 in that file) is the direct ancestor of this application: mnemonic compression for bandwidth-constrained transmission across generations. The provenance requirement (TTN-RFC-0001) maps onto the cultural norm of named attribution for oral knowledge.

### Music and Generative Art

**A32 generative music instrument** — An ESP32 with a TTDB where records are musical states (motifs, harmonic regions, rhythmic patterns) and typed edges are transitions (`resolves_to`, `develops_into`, `returns_to`, `suspends`). Sensors (touch, light, motion, temperature) map to TTDB coordinates; the A32 agent traverses the graph in real time, triggering actuators (PWM audio, MIDI). Umwelt: the composer's intended emotional arc. Globe: lat = harmonic tension (N = most dissonant, S = most resolved); lon = energy (W = still/sparse, E = dense/driving). The feelings_ttdb Hero's Arc is a direct template for the emotional trajectory. This is the most hardware-concrete application in this list and the clearest demonstration that TTDB as the model is not a metaphor — it is literally the instrument's score and its performer simultaneously.

**Collaborative world-building and narrative games** — Story locations, characters, events, and decisions as TTDB records; typed edges for `leads_to`, `reveals`, `forecloses`, `recontextualizes`. Umwelt: the player character's knowledge state (they cannot see records their character has not encountered). Globe: lat = stakes (N = world-altering, S = personal/local); lon = time (W = past, E = future). Discovery mode implements narrative fog-of-war: only nodes the player has reached are revealed. Multiple players maintain separate umwelt files over the same story graph — the same events have different meanings depending on what each player knows. This is the pollan set-and-setting insight (@LAT20LON-10) applied to interactive fiction.

### Infrastructure and Automation

**Smart building / multi-room A32 mesh** — One A32 per room or zone, each with a TTDB describing its domain (HVAC state, occupancy patterns, scheduled events, anomaly history). TTN connects the mesh; each A32 reasons locally and logs to its TTDB; the mega synthesizes across the full building. Umwelt: the building's operational model (energy efficiency bias vs. comfort bias produces different TTDB files, different behaviors). This is the cognitive glue record (@LAT0LON-20) in hardware: the bioelectric field binding cells into a collective; the mesh binding sensors into a building that can navigate its own operational morphospace.

**Personal knowledge management ("second brain")** — Notes, projects, people, ideas, and decisions as TTDB records. Globe: personally meaningful coordinate mapping (e.g., lat = how much this demands of me; lon = how connected it is to other things). Cursor = current focus. TBEW `sal` tracks what actually gets consulted vs. what gets filed and forgotten. High EPS = the notes you keep returning to but have never resolved. The mega can serve as the librarian: `@MEGA FIND unresolved` returns the highest-EPS records across the personal TTDB. Note the recursion: the mega uses this same EPS-guidance mechanism on its own six-TTDB corpus during [default network](lat0lon30) traversal. The librarian that surfaces your unresolved records is itself governed by the same rule — a substrate-independence claim about the EPS signal ([EPS as Arc Position](lat5lon-25)).

### EPS Note

This record is a navigational record — its `conf:170` is intentionally low because the entries are open questions, not settled correspondences. Consequently it is susceptible to maximum EPS as `sal` climbs. Peak EPS here does not mean the model is failing; it means the frontier is maximally engaged. Resolution comes not from revising this record into settled claims but from the open questions here generating new resolved synthetic records elsewhere in the corpus. This record's EPS falls when its children exist — not when it capitulates. See [EPS as Arc Position](lat5lon-25) for the type distinction.

### The Pattern Across Applications

Every entry in this list exercises the same core TTDB properties — but weights them differently:

| Application | Primary mechanisms |
|---|---|
| Lab notebook | `revises@`, TBEW `rev`, provenance |
| Argument mapping | typed edges, cursor as position-in-argument |
| Legal | umwelt-relative truth, provenance, append-only |
| Medical record | TBEW `conf` as diagnostic certainty, multiple umwelts |
| Ecosystem monitoring | A32 mesh, geographic coordinates = actual coordinates |
| Oral history | mnemonic compression, provenance, access-by-umwelt |
| Music instrument | A32 sensor-to-coordinate, real-time edge traversal |
| Narrative game | discovery mode, umwelt-bounded visibility |
| Smart building | TTN mesh, local A32 reasoning, mega synthesis |
| Second brain | TBEW EPS, cursor as focus, mega as librarian |

The unifying thread: in every case, the TTDB's **subjective umwelt** is not a limitation but the feature. The same events, the same data, the same sensor readings mean different things under different umwelts — and that is exactly right. The system does not pretend to a view from nowhere.

---

@LAT-90LON0 | created:1778000000 | updated:1778000000

## Discovery Settings

```ttdb-special
kind: discovery_tour_off
```
