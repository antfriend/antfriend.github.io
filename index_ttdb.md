# Index TTDB

The front-door deck for Toot Toot Engineering. Eight records, one per
top-level topic, laid out on a sine-wave ribbon that wraps the globe once and
a fifth (`lat = 34 · sin((lon + 150) · 1.2°)`, `lon ∈ [-150, 150]`), then closes
back on itself along the equator. Most records are placeholder cards: draft
copy, a generated SVG face, and one link out to the topic it stands for. A
topic that already has a picture of its own wears it instead: banjo shows the
banjo card from its own deck, ICU2 the still from the fight its deck opens on,
and github the avatar the account is kept under.

```mmpdb
db_id: ttdb:tte:index:v1
db_name: "Index"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:tte:index:visitor:v1
  role: front_door
  perspective: "A visitor arriving with no prior context, deciding where to go."
  scope: "One record per top-level directory of antfriend.github.io. No content, only doorways."
  constraints:
    - "One record per topic directory."
    - "Every record's body is a single toot frame pointing at its topic."
    - "Card art is a generated placeholder unless the topic supplies a poster."
  globe:
    frame: "ribbon"
    origin: "banjo at (0, -150); the ribbon runs west to east."
    mapping: "lat = 34 * sin((lon + 150) * 1.2deg), sampled every 60deg of lon, plus half-steps at lon -120 for ICU2 and lon 120 for github."
    note: "A single closed circuit: eight cards forward along the sine, one dashed return arc along the equator. The two newest records were inserted at half-steps rather than respacing the ribbon, so every other record kept its coordinate and its id."
cursor_policy:
  max_preview_chars: 260
  max_nodes: 12
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "next/prev walk the ribbon. The tour follows next> when the visitor goes quiet."
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "STATUS"
  max_reply_chars: 260
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT0LON-150
preview:
  @LAT0LON-150: "Thirteen cards, one globe, no rules worth defending. Start here because it is the least serious door."
```

---

@LAT0LON-150 | created:1789689600 | updated:1789689600 | relates:next>@LAT20LON-120,prev>@LAT0LON150,opens>banjo/banjo.html

## banjo

### thirteen cards, one globe, no rules worth defending

![banjo](banjo/banjo.html)

---

@LAT20LON-120 | created:1789776000 | updated:1789776000 | relates:prev>@LAT0LON-150,next>@LAT32LON-90,sibling_of>@LAT0LON-150,opens>ICU2/index.html

## ICU2

### six fights on the same globe, read from the channel

![ICU2](ICU2/index.html)

---

@LAT32LON-90 | created:1789689660 | updated:1789689660 | relates:prev>@LAT20LON-120,next>@LAT20LON-30,opens>games/index.html

## games

### storied, played from a feelings database

![games](games/index.html)

---

@LAT20LON-30 | created:1789689720 | updated:1789689720 | relates:prev>@LAT32LON-90,next>@LAT-20LON30,opens>global_models/index.html

## global_models

### one shared memory, many agents reading it

![global_models](global_models/index.html)

---

@LAT-20LON30 | created:1789689780 | updated:1789970400 | relates:prev>@LAT20LON-30,next>@LAT-32LON90,corollary_of>@LAT20LON-30,opens>personal_grimoire/index.html

## personal_grimoire

### one grimoire, one corpus, no words in the runtime

![personal_grimoire](personal_grimoire/index.html)

---

@LAT-32LON90 | created:1789689840 | updated:1790035200 | relates:prev>@LAT-20LON30,next>@LAT-20LON120,specifies>@LAT0LON-150,opens>RFCs/index.html

## RFCs

### the file format, written down so it can be argued with

```
╭──────────────────────────────────────────────────────╮
│  R F C   C O R P U S                                 │
│  33 documents · 6 series · 1 bundle · 1 globe        │
╰──────────────────────────────────────────────────────╯

  lane    series  subject          lon → 1 . . . . . 11
  lat 10  TTDB    the file format  ████████···
  lat 20  TTN     the mesh         ███████████
  lat 30  TTCP    the reader       ███········
  lat 40  A32     the $5 device    █████······
  lat 50  ARC     the game agent   █··········
  lat 60  TTG     the grammar      █████······
  lat 98  —       spec vs. metal   ▒▒▒▒▒······

  █ compressed   ░ pending   ▒ belief, no source RFC
```

Two doors per row: the **number** opens the compressed record on the RFC
globe, the **title** opens the full RFC, rendered in the RFC reader. A
quarter-megabyte of specification, folded into one TTDB file and expanded
back on demand.

**TTDB** · `lat 10` · the file format — records, cursor, edges, weight

- [`0001`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon1) [File Format and Sections](RFCs/index.html?rfc=TTDB-RFC-0001-File-Format.md)
- [`0002`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon2) [Cursor Semantics](RFCs/index.html?rfc=TTDB-RFC-0002-Cursor-Semantics.md)
- [`0003`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon3) [Typed Edge Semantics](RFCs/index.html?rfc=TTDB-RFC-0003-Typed-Edges.md)
- [`0004`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon4) [Event ID and Collision](RFCs/index.html?rfc=TTDB-RFC-0004-Event-ID-and-Collision.md)
- [`0005`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon5) [Epistemic Weight (TBEW)](RFCs/index.html?rfc=TTDB-RFC-0005-Epistemic-Weight.md)
- [`0006`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon6) [Experiential Perception as Synthetic Model](RFCs/index.html?rfc=TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md)
- [`0007`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon7) [Locus Point and Dream Cycle](RFCs/index.html?rfc=TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md)
- [`0008`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat10lon8) [Narrative Metamorphosis](RFCs/index.html?rfc=TTDB-RFC-0008-Narrative-Metamorphosis.md)

**TTN** · `lat 20` · the mesh — packets, delivery, time, belief

- [`0001`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon1) [Core Semantic Mesh](RFCs/index.html?rfc=TTN-RFC-0001.md)
- [`0002`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon2) [Typed Edge Taxonomy](RFCs/index.html?rfc=TTN-RFC-0002-Typed-Edges.md)
- [`0003`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon3) [Reference Implementation](RFCs/index.html?rfc=TTN-RFC-0003-Reference-Implementation.md)
- [`0004`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon4) [Semantic Compression](RFCs/index.html?rfc=TTN-RFC-0004-Semantic-Compression.md)
- [`0005`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon5) [Trust and Reputation](RFCs/index.html?rfc=TTN-RFC-0005-Trust-and-Reputation.md)
- [`0006`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon6) [LoRa Packet Framing](RFCs/index.html?rfc=TTN-RFC-0006-LoRa-Packet-Framing.md)
- [`0007`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon7) [Reliable Delivery](RFCs/index.html?rfc=TTN-RFC-0007-Reliable-Delivery.md)
- [`0008`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon8) [Fleet Time-Sync](RFCs/index.html?rfc=TTN-RFC-0008-Time-Sync.md)
- [`0009`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon9) [TTDB Push-Back](RFCs/index.html?rfc=TTN-RFC-0009-TTDB-Push-Back.md)
- [`0010`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon10) [Fleet Pulse](RFCs/index.html?rfc=TTN-RFC-0010-Fleet-Pulse.md)
- [`0011`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat20lon11) [Semantic Positioning](RFCs/index.html?rfc=TTN-RFC-0011-Semantic-Positioning.md)

**TTCP** · `lat 30` · the reader — how a TTDB becomes a page

- [`0001`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat30lon1) [Record Rendering](RFCs/index.html?rfc=TTCP-RFC-0001-Record-Rendering.md)
- [`0002`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat30lon2) [Globe and Navigation](RFCs/index.html?rfc=TTCP-RFC-0002-Globe-and-Navigation.md)
- [`0003`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat30lon3) [Link System and Addressability](RFCs/index.html?rfc=TTCP-RFC-0003-Link-System-and-Addressability.md)

**A32** · `lat 40` · the device — graph reasoning on a $5 microcontroller

- [`0001`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat40lon1) [Architecture Overview](RFCs/index.html?rfc=A32-RFC-0001-Architecture.md)
- [`0002`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat40lon2) [TTDB Storage and Parsing](RFCs/index.html?rfc=A32-RFC-0002-TTDB-Storage.md)
- [`0003`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat40lon3) [Agent Loop and Hardware Abstraction](RFCs/index.html?rfc=A32-RFC-0003-Agent-Loop.md)
- [`0004`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat40lon4) [Claude Code Project Setup](RFCs/index.html?rfc=A32-RFC-0004-Claude-Code-Setup.md)
- [`0002-A`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat40lon5) [TBEW Parser Extension](RFCs/index.html?rfc=A32-RFC-0002-Amendment-A-TBEW.md)

**ARC** · `lat 50` · the agent — one solver for ARC Prize 2026

- [`0001`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat50lon1) [Dynamics Solver Architecture](RFCs/index.html?rfc=ARC-RFC-0001-Dynamics-Solver-Architecture.md)

**TTG** · `lat 60` · the grammar — your own words as a store that answers

- [`0001`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat60lon1) [Grammar in the Store](RFCs/index.html?rfc=TTG-RFC-0001-Grammar-in-the-Store.md)
- [`0002`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat60lon2) [Semantic Percepts, Episodes and Terms](RFCs/index.html?rfc=TTG-RFC-0002-Semantic-Percepts.md)
- [`0003`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat60lon3) [Beliefs, Vector Reasoning and Grounded Response](RFCs/index.html?rfc=TTG-RFC-0003-Beliefs-Reasoning-Response.md)
- [`0004`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat60lon4) [Time and the Fleet](RFCs/index.html?rfc=TTG-RFC-0004-Time-and-the-Fleet.md)
- [`0005`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat60lon5) [Shapes and Amendments](RFCs/index.html?rfc=TTG-RFC-0005-Shapes-and-Amendments.md)

Lane `lat 98` carries five consolidated beliefs — the places where the metal
disagrees with the spec — starting at
[`98·0`](index_OG.html?ttdb=rfc.ttdb.md&toot=lat98lon0). Walk the whole compressed corpus in
[rfc.ttdb.md](index_OG.html?ttdb=rfc.ttdb.md), or open the [RFC index](RFCs/index.html) in the reader.

---

@LAT-20LON120 | created:1789776000 | updated:1789776000 | relates:prev>@LAT-32LON90,next>@LAT0LON150,sibling_of>@LAT20LON-120,opens>github/index.html

## github

### six repositories, where the rest of this is kept

![github](github/index.html)

---

@LAT0LON150 | created:1789689900 | updated:1789689900 | relates:prev>@LAT-20LON120,next>@LAT0LON-150,supersedes>@LAT0LON-150,opens>index_OG.html

## OG

### the previous front door, still running

![OG](index_OG.html)

---
