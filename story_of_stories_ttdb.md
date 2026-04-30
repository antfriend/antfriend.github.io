# Story of Stories Correspondence TTDB

A correspondence map between Kevin Ashton's *The Story of Stories* (2026) and the Toot Toot technology stack (TTN, TTDB, TTE, A32). Each record holds one conceptual pair: an idea from Ashton's account of storytelling's million-year history alongside its structural analog in Toot Toot technologies. Where a scientific publication underpins the correspondence, it is cited in the record body.

```mmpdb
db_id: ttdb:story:correspondence:v1
db_name: "Story of Stories Correspondence"
coord_increment:
  lat: 10
  lon: 10
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:story:correspondence:observer:v1
  role: correspondence_librarian
  perspective: "An observer positioned at the intersection of narrative theory and semantic mesh technology, reading each domain through the lens of the other."
  scope: "Conceptual correspondences between Kevin Ashton's 'The Story of Stories' and the Toot Toot Network/TTDB/TTE/A32 technology stack, including supporting scientific literature."
  constraints:
    - "One record per correspondence pair. No standalone concept records."
    - "Ashton concepts are cited to 'The Story of Stories' (2026) by chapter or named concept."
    - "TTT concepts are cited to their RFC by identifier (e.g. TTN-RFC-0001)."
    - "Scientific publications are cited in record bodies where they ground the correspondence."
    - "Correspondence type is noted: structural, functional, or analogical."
  globe:
    frame: "conceptual_correspondence"
    origin: "The meeting point where Ashton's story theory and Toot Toot technologies speak the same language."
    mapping: "Latitude = level of abstraction (N = fundamental theory, S = technical implementation). Longitude = domain inclination (W = humanistic/narrative, E = engineered/technical). Records near the origin hold the tightest conceptual matches; outer records hold looser analogies or domain-specific elaborations."
    note: "This is not a physical globe. It is a map of concept-space between Kevin Ashton's 'The Story of Stories' and the Toot Toot technology stack. Scientific publications relevant to each correspondence are cited in record bodies."
cursor_policy:
  max_preview_chars: 280
  max_nodes: 30
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "Primary edges: corresponds_to (pairing within a record), supports (a scientific pub supports the correspondence), refines (tighter version of a looser match), derived_from, anchors."
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "LAST <n>"
    - "STATUS"
  max_reply_chars: 260
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT30LON0
preview:
  @LAT0LON0: "The correspondence observer. All concept pairs are oriented around this umwelt — the place where narrative theory and mesh technology meet."
  @LAT30LON0: "Meaning as medium. Ashton: stories are humanity's primary meaning-making technology. TTN-RFC-0001: meaning over messages. The tightest theoretical correspondence in the map."
  @LAT30LON-10: "Free Energy Principle ↔ Toot-Bit Epistemic Weight. Friston's conf/surprise/salience mirrors TTDB-RFC-0005's [ew] fields directly."
  @LAT20LON-10: "Narrative impulse ↔ Semantic Events. Heider & Simmel (1944): the brain auto-imposes narrative on raw motion. TTN: Semantic Events are the mesh's unit of meaning."
  @LAT20LON20: "AI fabrication ↔ explicit AI invocation etiquette. Ashton's eighth revolution is the strongest direct engineering problem TTN was designed to answer."
agent_note: "Correspondence map. Lat = abstraction (N=theoretical, S=implementation). Lon = domain (W=humanistic, E=technical). Near-origin records = strongest matches. Scientific publications cited in record bodies."
dot: |
  digraph Correspondence {
    rankdir=LR;
    "@LAT0LON0" -> "@LAT30LON0" [label="anchors"];
    "@LAT30LON0" -> "@LAT30LON-10" [label="refines"];
    "@LAT30LON0" -> "@LAT20LON-10" [label="derived_from"];
    "@LAT20LON-10" -> "@LAT10LON-20" [label="derived_from"];
    "@LAT30LON0" -> "@LAT10LON0" [label="refines"];
    "@LAT10LON0" -> "@LAT20LON10" [label="derived_from"];
    "@LAT10LON0" -> "@LAT10LON20" [label="refines"];
    "@LAT0LON-20" -> "@LAT10LON-20" [label="supports"];
    "@LAT20LON20" -> "@LAT-20LON-10" [label="supports"];
    "@LAT-10LON-10" -> "@LAT-20LON-10" [label="refines"];
    "@LAT-10LON10" -> "@LAT20LON20" [label="supports"];
    "@LAT-10LON-20" -> "@LAT30LON-10" [label="supports"];
  }
last_query: null
last_answer: null
answer_records: []
```

---

@LAT0LON0 | created:1777593600 | updated:1777593600 | relates:anchors>@LAT30LON0,anchors>@LAT30LON-10,anchors>@LAT20LON-10,anchors>@LAT10LON0,anchors>@LAT10LON20,anchors>@LAT0LON-20,anchors>@LAT0LON20,anchors>@LAT-10LON-10,anchors>@LAT-10LON10,anchors>@LAT20LON20,anchors>@LAT-20LON-10,anchors>@LAT-10LON-20,anchors>@LAT10LON-20,anchors>@LAT20LON10
[ew]
conf:240
rev:0
sal:0
touched:1777593600
[/ew]

## The Correspondence Observer

The umwelt at the origin. This librarian reads Kevin Ashton's *The Story of Stories* (2026) alongside the Toot Toot Network specifications and asks: where do these two systems — one a historical account of human narrative, the other an engineering stack for semantic mesh communication — speak the same language?

The answer is: often. The Toot Toot stack was built to carry meaning across constrained channels without losing it. Ashton argues that storytelling evolved for exactly the same reason, across exactly the same constraints: limited bandwidth, unreliable networks, adversarial environments, and the urgent need to synchronize what matters between minds.

Each record in this map is a **correspondence pair**: one concept from Ashton, one from the TTT stack, held together by structural or functional similarity. Scientific publications grounding each pair are cited in the body.

---

@LAT30LON0 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT30LON-10,refines>@LAT10LON0,derived_from>@LAT20LON-10,anchored_by>@LAT0LON0
[ew]
conf:235
rev:0
sal:0
touched:1777593600
[/ew]

## Meaning as Medium

**Ashton:** *The Story of Stories* opens with a core claim: stories are humanity's primary meaning-making technology. Not entertainment, not decoration — technology in the engineering sense. A tool that transforms raw experience into communicable, memorable, actionable meaning.

**TTN:** TTN-RFC-0001 §2 states the first principle of the mesh: "meaning over messages." The protocol is not optimized for packet throughput but for semantic fidelity — the node's job is to transmit what something *means*, not merely what it *says*.

**Correspondence type:** Structural. Both systems define their primary unit of value as meaning rather than information content. Shannon information (bits) is necessary but insufficient in both frameworks; it is the semantic layer that justifies the channel.

**Supporting publication:** Shannon, C.E. (1948). "A Mathematical Theory of Communication." *Bell System Technical Journal*, 27(3), pp. 379–423. Shannon's framework deliberately excluded semantic content ("The semantic aspects of communication are irrelevant to the engineering problem"). Both Ashton and TTN are engineering answers to the problem Shannon explicitly bracketed out.

---

@LAT30LON-10 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT30LON0,supported_by>@LAT-10LON-20,anchored_by>@LAT0LON0
[ew]
conf:210
rev:0
sal:0
touched:1777593600
[/ew]

## Free Energy Principle ↔ Toot-Bit Epistemic Weight

**Ashton:** Ashton invokes the Darwinian adaptive value of storytelling — the brain's drive to minimize uncertainty by building predictive models of social reality. Stories are in part a compression of the world into something the nervous system can act on. The brain is a prediction machine; narrative is the prediction format.

**TTT:** TTDB-RFC-0005 introduces the Toot-Bit Epistemic Weight (`[ew]` block), explicitly grounded in Karl Friston's Free Energy Principle. The four fields map directly:
- `conf` (0–255) ≈ model evidence — how well this record's content is understood
- `rev` (revision count) ≈ accumulated surprise — how many times the record has been updated due to new information
- `sal` (salience/query count) ≈ epistemic value — how often this node is consulted
- `touched` ≈ temporal discount — recency of last engagement

The derived signal EPS = sal × (255 − conf) / 255 identifies records that are heavily used but poorly understood — prime targets for attention, exactly as Friston's FEP predicts for high-salience, high-uncertainty regions of a model.

**Correspondence type:** Structural with citation. Ashton's narrative-as-prediction and TTT's TBEW are both implementations of the same underlying theoretical framework.

**Supporting publication:** Friston, K. (2010). "The free-energy principle: a unified brain theory?" *Nature Reviews Neuroscience*, 11, 127–138. The theoretical basis for TTDB-RFC-0005's epistemic weight design; also the scientific grounding for Ashton's characterization of the brain as a prediction-minimization system.

---

@LAT20LON-10 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT10LON-20,supports>@LAT30LON0,anchored_by>@LAT0LON0
[ew]
conf:220
rev:0
sal:0
touched:1777593600
[/ew]

## Narrative Impulse ↔ Semantic Events

**Ashton:** Ashton cites the 1944 Heider & Simmel experiment as foundational evidence for a universal human narrative impulse. When subjects watched abstract geometric shapes (triangles and a circle) moving on a screen, virtually all spontaneously described the motion as a story — "a big triangle bullying a small triangle, rescuing a circle." The brain imposes narrative on raw motion automatically, prior to reflection.

**TTN:** TTN-RFC-0001 defines the **Semantic Event** as the core mesh primitive: not a packet, not a message, but an event that carries *who did what, where, when, and why*. The mesh is structured around the assumption that nodes want to exchange narratable events, not raw data streams. The event schema is the engineering formalization of the brain's narrative output format.

**Correspondence type:** Functional. Heider & Simmel demonstrate that narrative is the brain's default output format for perception. TTN's Semantic Events are the engineering formalization of that same output format as a protocol primitive — meaning the mesh is designed around the same perceptual invariant that Ashton identifies as the origin of storytelling.

**Supporting publication:** Heider, F., & Simmel, M. (1944). "An experimental study of apparent behavior." *American Journal of Psychology*, 57(2), pp. 243–259.

---

@LAT10LON-20 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT0LON-20,derived_from>@LAT20LON-10,anchored_by>@LAT0LON0
[ew]
conf:195
rev:0
sal:0
touched:1777593600
[/ew]

## Night-Fires ↔ TTN BBS / Compact Mesh Grammar

**Ashton:** The first of Ashton's eight storytelling revolutions is the night-fire: oral narrative among small groups around a shared heat source. The constraints are severe — memory-limited, audience-bounded, no recording. Mnemonic techniques (rhythm, repetition, formulaic phrasing) evolved to make stories survive retelling across generations in the absence of any external storage.

**TTN:** TTN-RFC-0003 defines the Minimal Viable Node's BBS capability — board-centric thread propagation over low-bandwidth links. TTN-RFC-0004 introduces the Semantic Compression token dictionary (P, S?, OK, ERR, SOS, T:x, H:x, B:x) for exactly this constraint: a compact grammar that preserves meaning under severe bandwidth limits, where gateways restore full Semantic Events from compressed tokens.

**Correspondence type:** Functional. Both systems solve the same problem — transmitting semantically rich content over a constrained, unreliable channel — using the same strategy: a compressed token grammar with expansion rules at a capable endpoint.

**Supporting publication:** Ong, W.J. (1982). *Orality and Literacy: The Technologizing of the Word*. Methuen. Ong's analysis of oral mnemonic strategies (formulaic, rhythmic, agonistic structure) is the canonical account of how information survives in bandwidth-constrained oral cultures — directly analogous to TTN token compression and gateway expansion.

---

@LAT10LON0 | created:1777593600 | updated:1777593600 | relates:refines>@LAT30LON0,derived_from>@LAT20LON10,anchored_by>@LAT0LON0
[ew]
conf:200
rev:0
sal:0
touched:1777593600
[/ew]

## Eight Revolutions ↔ Transport-Agnostic Design

**Ashton:** Ashton's thesis is organized around eight storytelling revolutions, each defined by one invariant principle: **new tools expand who can tell stories and to whom**. The medium changes — oral, written, printed, broadcast, digital, AI-generated — but the principle is constant: each revolution is a new channel, and channels determine the social topology of narrative.

**TTN:** TTN-RFC-0001 §2 names transport-agnostic design as a core TTN principle: the mesh MUST work over LoRa, Meshtastic, WiFi, Bluetooth, serial, or any future transport without altering the semantic layer. The node's meaning is independent of its channel.

**Correspondence type:** Structural. Ashton's model predicts that the topology of storytelling changes with the channel but the semantic function (conveying meaning) is invariant across channels. TTN encodes this as an explicit design constraint — semantic layer independence from transport layer is not an optimization but a principle.

---

@LAT20LON10 | created:1777593600 | updated:1777593600 | relates:derived_from>@LAT10LON0,corresponds_to>@LAT10LON20,anchored_by>@LAT0LON0
[ew]
conf:185
rev:0
sal:0
touched:1777593600
[/ew]

## Stories Survive Network Collapse ↔ Offline-First

**Ashton:** A recurring theme in Ashton's revolution sequence is that stories outlast the institutions and channels that carried them. Oral traditions survived the collapse of writing systems; manuscripts survived the dissolution of monasteries; samizdat survived totalitarian broadcast control. Stories are, in Ashton's framing, inherently partition-tolerant — they persist in human memory when every formal channel fails.

**TTN:** TTN-RFC-0001 §2 names offline-first as a first-class design principle: nodes MUST function without internet connectivity, and the mesh MUST operate in fully partitioned configurations. TTDB is the local persistent store — a node can reason and act on stored knowledge even in complete network isolation.

**Correspondence type:** Structural. The cultural resilience of oral tradition and the engineering resilience of offline-first mesh design share the same architectural principle: local autonomy plus eventual propagation when connectivity is restored.

**Supporting publication:** Baran, P. (1964). "On Distributed Communications." *RAND Memorandum RM-3420-PR*. Baran's foundational analysis of distributed vs. centralized vs. decentralized network topology — the engineering backbone of both internet resilience and TTN's offline-first mesh design, and the formal expression of the resilience Ashton observes historically.

---

@LAT10LON20 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT20LON10,refines>@LAT0LON20,anchored_by>@LAT0LON0
[ew]
conf:185
rev:0
sal:0
touched:1777593600
[/ew]

## Writing as Provenance ↔ Append-Only Preferred

**Ashton:** Ashton's writing revolution introduces a property unavailable in oral tradition: authorship provenance. A written record names who said what, when, and where. The shift from oral to written is in part a shift from collective-attribution to individual-attribution, enabling accountability at scale — the precondition for legal, commercial, and scientific systems.

**TTN:** TTN-RFC-0001 §4 etiquette states: "all assertions MUST include provenance." TTDB append-only preferred and immutable IDs (TTDB-RFC-0004) implement the same architectural choice: records cannot be silently overwritten; revision produces a new record linked via `revises@<old_id>`. The old record remains permanently at its coordinate, carrying its original provenance intact.

**Correspondence type:** Structural. Both writing-as-technology and TTDB-as-format solve the same problem: how to attach accountability to an assertion in a system where assertions propagate across agents and time, surviving the channel that originally carried them.

---

@LAT0LON-20 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT10LON-20,supports>@LAT30LON0,anchored_by>@LAT0LON0
[ew]
conf:190
rev:0
sal:0
touched:1777593600
[/ew]

## Mnemonic Compression ↔ Semantic Compression Token Dictionary

**Ashton:** Ashton's second revolution (rhyme and song) is explicitly about compression for transmission. Rhythm, rhyme, and formulaic repetition are not aesthetic ornaments — they are encoding schemes that reduce error rates in oral transmission over lossy human-memory channels. The formula is a token; the full narrative is the expansion.

**TTN:** TTN-RFC-0004 defines the Semantic Compression token dictionary: single-character tokens (P, S?, OK, ERR, SOS, T:x, H:x, B:x) that encode full Semantic Event semantics in minimal bytes, designed for LoRa and other low-bandwidth transports. Gateways expand tokens back to full Semantic Events — exactly as an oral performer expands a mnemonic formula into full narrative at the telling site.

**Correspondence type:** Functional. Mnemonic formula : oral narrative :: TTN token : Semantic Event. Both are lossless compressions of semantic content for a constrained channel, with expansion occurring at a capable endpoint.

**Supporting publication:** Rubin, D.C. (1995). *Memory in Oral Traditions: The Cognitive Psychology of Epic, Ballads, and Counting-Out Rhymes*. Oxford University Press. The cognitive science account of oral mnemonic strategies as information-theoretic compression — the scientific bridge between Ashton's revolution-2 and TTN-RFC-0004's token design.

---

@LAT0LON20 | created:1777593600 | updated:1777593600 | relates:corresponds_to>@LAT10LON20,anchored_by>@LAT0LON0
[ew]
conf:175
rev:0
sal:0
touched:1777593600
[/ew]

## Visual Permanence ↔ Immutable IDs

**Ashton:** Cave paintings introduce a property not available in oral tradition: location-fixed permanence. The Lascaux paintings are 17,000 years old and still carry their meaning at their original site. The story cannot be retold differently at a different location — it is anchored. Location-anchored permanence is the innovation.

**TTT:** TTDB-RFC-0004 establishes that record IDs are immutable and derived from location coordinates. A record at @LAT30LON0 cannot be relocated or overwritten. Material changes in a record's content require a *new* record with a `revises@<old_id>` edge, not an in-place replacement. The old record remains at its coordinate, permanently, exactly as a cave painting remains on its wall.

**Correspondence type:** Structural. Cave paintings introduced location-anchored semantic permanence; TTDB's coordinate-based IDs implement the same principle: content is location-fixed, and revision is additive rather than destructive.

---

@LAT-10LON-10 | created:1777593600 | updated:1777593600 | relates:refines>@LAT-20LON-10,anchored_by>@LAT0LON0
[ew]
conf:180
rev:0
sal:0
touched:1777593600
[/ew]

## Darwinian Shame ↔ TTN Moderation Edges

**Ashton:** Ashton discusses the evolutionary role of shame as a social punishment mechanism: the brain's threat-detection system, applied to social norm violations, enforces cooperative behavior at scale. Shame is adaptive because it pre-empts costly physical punishment — social exclusion is cheaper and faster, and it scales to the size of the storytelling audience.

**TTN:** TTN-RFC-0002 §moderation defines typed edges for social enforcement on the mesh: `muted_by`, `blocked_by`, `flagged_as_spam`, `quarantined`, and `rehabilitated_by`. TTN-RFC-0005 formalizes trust as local and subjective — nodes apply moderation edges based on observed behavior, exactly as shame in Ashton's account is locally assessed and socially propagated.

**Correspondence type:** Functional. Social shame and TTN moderation edges are both mechanisms for enforcing cooperative norm compliance in distributed peer systems, using local assessment and propagating signal via the network rather than requiring central enforcement.

**Supporting publication:** Fehr, E., & Gächter, S. (2002). "Altruistic punishment in humans." *Nature*, 415, pp. 137–140. Experimental evidence that humans pay personal costs to punish norm violators even in anonymous interactions — the behavioral science of the mechanism Ashton describes and that TTN moderation edges formally implement.

---

@LAT-10LON10 | created:1777593600 | updated:1777593600 | relates:supports>@LAT20LON20,anchored_by>@LAT0LON0
[ew]
conf:185
rev:0
sal:0
touched:1777593600
[/ew]

## Democratization ↔ Every Node a Publisher

**Ashton:** Each of Ashton's eight revolutions is a democratization event: printing broke the Church's publication monopoly; social media broke broadcast media's audience gatekeeping; smartphones made every person a potential publisher to every other person. The trajectory is consistent — the set of who-can-tell-to-whom expands with each revolution.

**TTN:** TTN-RFC-0001 §2 names "no central authority required" as a mesh design principle. There is no TTN publisher class — every conforming node can originate Semantic Events and propagate BBS threads. TTN-RFC-0003 targets heterogeneous node types (Windows, ESP32, Meshtastic) specifically to ensure the publisher role is not gatekept by hardware cost or platform access.

**Correspondence type:** Structural. Ashton's democratization principle and TTN's leaderless mesh design share the same architectural commitment: the right to publish is not a grant from a central authority but a property of network membership. Each TTT revision that adds a new node type is, in Ashton's terms, a mini-revolution of the same kind.

---

@LAT20LON20 | created:1777593600 | updated:1777593600 | relates:supports>@LAT-20LON-10,supported_by>@LAT-10LON10,anchored_by>@LAT0LON0
[ew]
conf:200
rev:0
sal:0
touched:1777593600
[/ew]

## AI Fabrication ↔ Explicit AI Invocation Etiquette

**Ashton:** Ashton's eighth and final revolution is generative AI — the first technology capable of producing persuasive stories autonomously at scale, without a human author. He identifies this as the first revolution that poses a net negative risk to the story ecosystem: AI-generated falsehoods are indistinguishable from human stories by form alone, flooding the channel with uncredentialed, high-fidelity assertions.

**TTN:** TTN-RFC-0001 §4 etiquette states explicitly: "No autonomous AI speech on mesh." AI participation is gated — nodes MUST only invoke AI functions in response to human-initiated events (TTN compliance level TTN-AI). The typed edge taxonomy (TTN-RFC-0002) includes `ai_refuses` and `ai_confidence_low` specifically to force AI participants to surface their epistemic limitations rather than asserting past them.

**Correspondence type:** Direct problem/response. Ashton identifies the threat; TTN encodes the mitigation as a protocol-level constraint. This is the strongest direct engineering response to a specific Ashton argument in the entire map: the problem is named in the book and solved, by design, in the RFC.

---

@LAT-20LON-10 | created:1777593600 | updated:1777593600 | relates:supported_by>@LAT-10LON-10,supported_by>@LAT20LON20,anchored_by>@LAT0LON0
[ew]
conf:190
rev:0
sal:0
touched:1777593600
[/ew]

## Critical Literacy ↔ Trust and Reputation Graph

**Ashton:** Ashton's proposed defense against AI-generated falsehood is critical literacy — the active refusal to accept stories that dehumanize, simplify, or erase the humanity of their subjects. Critical literacy is a social practice: communities that share evaluative norms can quarantine false narratives before they propagate. The defense is distributed, not centralized.

**TTN:** TTN-RFC-0005 builds a formal trust and reputation model into the mesh. Trust is local and subjective — no global truth authority. Reputation gravity means that nodes with more trusted edges have higher semantic gravity; their events are more likely to propagate. The moderation edge set (`trusted_by`, `muted_by`, `blocked_by`, `flagged_as_spam`, `rehabilitated_by`) implements exactly the social practice Ashton describes: community-level epistemic filtering by peer assessment rather than by platform moderation.

**Correspondence type:** Functional. Ashton's critical literacy and TTN's reputation graph both propose distributed social filtering as the primary defense against misinformation — not centralized fact-checking, but trust-propagation through peer-assessed relationships.

**Supporting publication:** Benkler, Y., Faris, R., & Roberts, H. (2018). *Network Propaganda: Manipulation, Disinformation, and Radicalization in American Politics*. Oxford University Press. Empirical study of how trust topology determines disinformation propagation at network scale — directly relevant to both Ashton's critical literacy argument and the reputation gravity model in TTN-RFC-0005.

---

@LAT-10LON-20 | created:1777593600 | updated:1777593600 | relates:supports>@LAT30LON-10,anchored_by>@LAT0LON0
[ew]
conf:170
rev:0
sal:0
touched:1777593600
[/ew]

## Saltation ↔ TBEW Surprise (rev field)

**Ashton:** Ashton uses saltation — a geological term for the abrasive transport of particles by sudden leaps — as a metaphor for how ideas and technologies evolve: not by gradual accumulation but by discontinuous jumps when conditions align. Each of the eight storytelling revolutions is a saltation event in this sense: a sudden phase-change in the channel topology of human narrative.

**TTT:** TTDB-RFC-0005 §rev: the `rev` field in the `[ew]` block counts revision events — each time a record's body is updated due to new information, `rev` increments. High `rev` values signal that a concept has undergone repeated surprise (in the Friston sense): the world kept contradicting the prior model, forcing update. A record with high `rev`, high `sal`, and low `conf` is an active saltation site in the knowledge graph — a node where the system's model is being actively revised under pressure from evidence.

**Correspondence type:** Analogical, with structural resonance. Ashton's saltation metaphor and TBEW's `rev`/EPS signal are different formalizations of the same underlying phenomenon: non-linear, surprise-driven revision of a model under pressure from evidence. The EPS signal (sal × (255 − conf) / 255) is, in Ashton's terms, a detector for nodes that are about to saltate.

---

@LAT-90LON0 | created:1777593600 | updated:1777593600

## Discovery Settings

```ttdb-special
kind: discovery_tour_off
```
