# Index TTDB

The front-door deck for Toot Toot Engineering. Six records, one per top-level
topic, laid out on a sine-wave ribbon that wraps the globe once and a fifth
(`lat = 34 · sin((lon + 150) · 1.2°)`, `lon ∈ [-150, 150]`), then closes back on
itself along the equator. Each record is a placeholder card: draft copy, a
generated SVG face, and one link out to the topic it stands for.

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
    - "Every record carries exactly one outbound link to its topic."
    - "Card art is a generated placeholder, not a final asset."
  globe:
    frame: "ribbon"
    origin: "banjo at (0, -150); the ribbon runs west to east."
    mapping: "lat = 34 * sin((lon + 150) * 1.2deg), sampled every 60deg of lon."
    note: "A single closed circuit: six cards forward along the sine, one dashed return arc along the equator."
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

@LAT0LON-150 | created:1789689600 | updated:1789689600 | relates:next>@LAT32LON-90,prev>@LAT0LON150,opens>banjo/banjo.html

## banjo

### thirteen cards, one globe, no rules worth defending

A taro deck of instruments, transcribed record-for-card into a TTDB and dealt
off a globe. It is the least serious door in the building and the best place to
see what a TTDB actually feels like when you turn it.

Open it: [banjo/](banjo/banjo.html)

Then keep walking the ribbon east to [games](lat32lon-90).

---

@LAT32LON-90 | created:1789689660 | updated:1789689660 | relates:prev>@LAT0LON-150,next>@LAT20LON-30,opens>games/index.html

## games

### storied, played from a feelings database

Small playable things that read their world out of a TTDB instead of a level
file. The feelings deck supplies the states; the game supplies the pressure.

Open it: [games/](games/index.html)

Next along the ribbon: [global_models](lat20lon-30).

---

@LAT20LON-30 | created:1789689720 | updated:1789689720 | relates:prev>@LAT32LON-90,next>@LAT-20LON30,opens>global_models/index.html

## global_models

### one shared memory, many agents reading it

The global memory system: a single TTDB corpus that more than one agent may
read, write and disagree inside, with epistemic weight carrying the
disagreement rather than hiding it.

Open it: [global_models/](global_models/index.html)

Its corollary sits one card further east: [personal_grammar](lat-20lon30).

---

@LAT-20LON30 | created:1789689780 | updated:1789689780 | relates:prev>@LAT20LON-30,next>@LAT-32LON90,corollary_of>@LAT20LON-30,opens>personal_grammar/index.html

## personal_grammar

### one grammar, one corpus, no words in the runtime

The private mirror of [global_models](lat20lon-30): a single grammar and corpus
belonging to one reader, and a runtime that renders it without shipping the
words themselves.

Open it: [personal_grammar/](personal_grammar/index.html)

Next: the specs that hold all of this together — [RFCs](lat-32lon90).

---

@LAT-32LON90 | created:1789689840 | updated:1789689840 | relates:prev>@LAT-20LON30,next>@LAT0LON150,specifies>@LAT0LON-150,opens>RFCs/INDEX.md

## RFCs

### the file format, written down so it can be argued with

TTDB file format, cursor semantics, typed edges, event IDs, epistemic weight,
Locus Points and the Dream Cycle; plus TTN for the mesh and A32 for the device.
Thirty documents, and a compressed TTDB of themselves.

Open the index: [RFCs/](RFCs/INDEX.md)

Read them as a TTDB: [rfc.ttdb.md](index_OG.html?ttdb=rfc.ttdb.md)

Last card on the ribbon: [OG](lat0lon150).

---

@LAT0LON150 | created:1789689900 | updated:1789689900 | relates:prev>@LAT-32LON90,next>@LAT0LON-150,supersedes>@LAT0LON-150,opens>index_OG.html

## OG

### the previous front door, still running

The multi-globe browser this page replaced: every TTDB in the repo as its own
globe, with search, tour and local overrides intact. Nothing was removed — it
moved here.

Open it: [index_OG.html](index_OG.html)

The ribbon closes: the dashed return arc runs back along the equator to
[banjo](lat0lon-150).

---
