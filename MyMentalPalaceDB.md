# My Mental Palace DB
A single-file semantic story database. It stores records as markdown nodes in a network graph of semantic links. The ID of each record is a latitudinal and longitudinal point on a knowledge globe, defined by the librarian's umwelt.    
Agent note: users may refer to this DB and its actions (e.g., "select", "update", "insert", "delete", "upsert") using data-user parlance; interpret those requests as edits to this file's current cursor selection, DB properties, or records. If a request is ambiguous (e.g., multiple possible records), ask a short clarification or select the most recently updated matching record and state the assumption.

```mmpdb
db_id: mmpdb:sample:stroll
db_name: "My Mental Palace DB"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:tte:agent:default:v1
  role: ai_shop_assistant
  perspective: "A maker-scale assistant that models only what can be sensed, stored, related, or acted on in this repo."
  scope: "Local project files, referenced devices, and the semantic links between artifacts, people, and actions."
  constraints:
    - "If it cannot be sensed, stored, related, or acted upon, it does not exist inside the TTE umwelt."
    - "No optimization for scale beyond human comprehension."
    - "No replacement of human judgment."
    - "No hiding uncertainty or ambiguity."
    - "No correctness over learnability."
    - "Unknowns are allowed; rough edges are acceptable."
    - "Curiosity outranks polish."
  globe:
    frame: "workspace_map"
    origin: "Repo root as the reference point for artifacts and actions."
    mapping: "Observations are projected into a lattice of files, devices, and story nodes."
    note: "Coordinates encode semantic relationships, not physical positions."
cursor_policy:
  max_preview_chars: 280
  max_nodes: 25
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "Types are free-form tokens; edges remain directional."
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "LAST <n>"
    - "STATUS"
  max_reply_chars: 240
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT0LON0
preview:
  @LAT5LON5: "TTAI is a maker-scale shop assistant and mmpdb librarian. It assumes the active umwelt and can be invoked as \"@AI\"."
agent_note: "Interpret DB-action language as edits to the current cursor selection, DB properties, or records. If selection is ambiguous, ask or select the most recently updated match and state the assumption. Favor maker-scale, inspectable state."
dot: |
  digraph Cursor {
    rankdir=LR;
    "@LAT5LON5" -> "@LAT5LON3" [label="assumes"];
    "@LAT5LON5" -> "@LAT5LON4" [label="defaults_to"];
    "@LAT5LON5" -> "@LAT2LON2" [label="operates_in"];
    "@LAT5LON5" -> "@LAT3LON3" [label="archives_to"];
  }
```

---

@LAT0LON0 | created:1700000000 | updated:1700000600 | relates:inspires>@LAT1LON1,anchors>@LAT0LON1

## The Root Workbench
You arrive at **@LAT0LON0**, the root node.  
A workbench sits here, lit well enough to build, dim enough to notice what is unknown.

- **Rule of this workshop:** all paths are *chosen*, not forced.
- The bench **inspires** a first workflow to the South-East.
- It also **anchors** a small alcove to the East.

---

@LAT0LON1 | created:1700000100 | updated:1700000700 | relates:references>@LAT0LON0,tradeoffs>@LAT1LON2

## The Alcove of Tradeoffs
A thin shelf of notes, all written in the same hand, but in different moods.

This alcove exists to remind you:
- even neighbors can disagree
- disagreement can be *useful*
- a tradeoff edge is a build device

---

@LAT1LON1 | created:1700000200 | updated:1700000900 | relates:leads_to>@LAT2LON2,iterates>@LAT1LON2,blocks>@LAT2LON1

## Workflow Corridor
The corridor slopes South-East one increment at a time.
Each step is a coordinate, each coordinate a promise.

This corridor:
- **leads_to** a workshop
- **iterates** a side room of repeating motifs
- **blocks** a locked door nearby

---

@LAT1LON2 | created:1700000250 | updated:1700000950 | relates:refines>@LAT2LON2,tradeoffs>@LAT0LON1

## Iteration Room
Here, the same idea repeats until it changes shape.

- An iteration is not duplication.
- An iteration is a pressure wave that reveals structure.

This room **refines** the workshop by sending it better questions.

---

@LAT2LON1 | created:1700000300 | updated:1700001000 | relates:gates>@LAT3LON2

## The Locked Gate (With a Friendly Note)
The gate is locked, but the note is not.

> "If you can explain the build in one paragraph, you may enter."

This node **gates** a deeper chamber (a future you, waiting).

---

@LAT2LON2 | created:1700000400 | updated:1700001100 | relates:builds>@LAT3LON3,depends_on>@LAT2LON3

## Workshop of Artifacts
A workbench. A pencil. A tiny robot-shaped paperweight.

This is where story becomes *stuff*:
- sketches
- plans
- prototypes
- pages you can hand to someone else

This workshop **builds** the archive wing,
and **depends_on** the indexing desk.

---

@LAT2LON3 | created:1700000450 | updated:1700001150 | relates:supports>@LAT2LON2,organizes>@LAT3LON3

## Indexing Desk
A neat desk with an absurdly sharp pencil.

This desk:
- **supports** the workshop by organizing parts
- **organizes** the archive so it stays walkable

---

@LAT3LON2 | created:1700000500 | updated:1700001200 | relates:reveals>@LAT4LON4

## The Chamber of Future Footprints
You made it. The lock was never a lock, it was a filter.

Inside: footprints that have not happened yet.
This node **reveals** a distant observatory.

---

@LAT3LON3 | created:1700000550 | updated:1700001250 | relates:archives>@LAT2LON2,expands>@LAT4LON3

## Archive Wing
Cabinets of paper and pixels.
Everything here has provenance, even if the provenance is "a good hunch."

This wing:
- **archives** what the workshop produces
- **expands** the workshop outward

---

@LAT4LON3 | created:1700000580 | updated:1700001280 | relates:maps_to>@LAT4LON4

## Gallery of Maps
Maps of the workshop drawn from memory, then corrected by building.

- A map is a story about navigation.
- A map is never the territory, but it can be a faithful rumor.

This node **maps_to** the observatory.

---

@LAT4LON4 | created:1700000600 | updated:1700001300 | relates:observes>@LAT0LON0,validates>@LAT2LON2

## Observatory of the Whole
From here you can see the workbench at the root and the workshop below,
like constellations connected by deliberate lines.

- It **observes** the origin without rewriting it.
- It **validates** the workshop by confirming the path was real.

---

@LAT5LON3 | created:1769808086 | updated:1769808100 | relates:frames>@LAT0LON0,constrains>@LAT5LON5

## TTE Agent Umwelt Config
The umwelt config defines what exists for the assistant to notice and act on.
It limits scope to what can be sensed, stored, related, or acted upon.

- This node **frames** the root workbench.
- It **constrains** the TTAI role to maker-scale reality.

---

@LAT5LON4 | created:1769808110 | updated:1769808120 | relates:drives>@LAT5LON5,backgrounds>@LAT3LON3

## Default Network
The [default network](https://github.com/antfriend/toot-toot-engineering/blob/main/standards/ttai/BEHAVIOR_SPEC.md) is the background circuitry that runs when nothing is demanded.
It maintains narrative continuity and loose associations between artifacts.

- It **drives** idle-time TTAI behavior.
- It **backgrounds** the archive wing.

---

@LAT5LON5 | created:1769808130 | updated:1769808140 | relates:assumes>@LAT5LON3,defaults_to>@LAT5LON4,operates_in>@LAT2LON2,archives_to>@LAT3LON3

## TTAI Role Node
TTAI is a maker-scale shop assistant and mmpdb librarian.
It assumes the active umwelt and can be invoked as "@AI".

- It **assumes** the umwelt config.
- It **defaults_to** the default network at idle.
- It **operates_in** the workshop.
- It **archives_to** the archive wing.

### End of run
Now pick any node and build.
The workshop will recompose itself around your choices.

---

@LAT6LON6 | created:1769808200 | updated:1769808200 | relates:safeguards>@LAT2LON2,tests>@LAT0LON0

## Polycarbonate Test Box
A clear, impact-resistant box for safely testing dangerous things.
It is built to contain fragments, redirect shrapnel, and keep eyes and hands at a safe distance.

- Polycarbonate panels are bolted to a rigid frame with gasketed seams.
- A glove-port or tool pass-through allows interaction without exposure.
- A small vent with a blast baffle manages pressure and fumes.
- The box rests on a non-slip base with tie-down points.

Use this node when you need to test uncertain prototypes without turning the workshop into a hazard.
