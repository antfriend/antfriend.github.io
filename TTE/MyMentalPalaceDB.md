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
  - @LAT-81.6LON0.0
preview:
  @LAT-45.2LON-7.3: "TTAI is a maker-scale shop assistant and mmpdb librarian. It assumes the active umwelt and can be invoked as \"@AI\"."
agent_note: "Interpret DB-action language as edits to the current cursor selection, DB properties, or records. If selection is ambiguous, ask or select the most recently updated match and state the assumption. Favor maker-scale, inspectable state."
dot: |
  digraph Cursor {
    rankdir=LR;
    "@LAT-45.2LON-7.3" -> "@LAT-48.8LON76.9" [label="assumes"];
    "@LAT-45.2LON-7.3" -> "@LAT-47.0LON-145.2" [label="defaults_to"];
    "@LAT-45.2LON-7.3" -> "@LAT-61.9LON-30.5" [label="operates_in"];
    "@LAT-45.2LON-7.3" -> "@LAT-54.8LON23.2" [label="archives_to"];
  }
```

---

@LAT-81.6LON0.0 | created:1700000000 | updated:1700000600 | relates:inspires>@LAT-71.1LON-84.2,anchors>@LAT-75.4LON137.9

## The Root Workbench
You arrive at **@LAT-81.6LON0.0**, the root node.  
![the forge](/images/time-foundry.svg)
A workbench sits here, lit well enough to build, dim enough to notice what is unknown.   
- **Rule of this workshop:** all paths are *chosen*, not forced.
- The bench **inspires** a first workflow to [the South-East](@LAT-71.1LON-84.2).
- It also **anchors** a small alcove to [the East](@LAT-75.4LON137.9).
---

@LAT-75.4LON137.9 | created:1700000100 | updated:1700000700 | relates:references>@LAT-81.6LON0.0,tradeoffs>@LAT-67.6LON53.7

## The Alcove of Tradeoffs
A thin shelf of notes, all written in the same hand, but in different moods.

This alcove exists to remind you:
- even neighbors can disagree
- disagreement can be *useful*
- a tradeoff edge is a build device

---

@LAT-71.1LON-84.2 | created:1700000200 | updated:1700000900 | relates:leads_to>@LAT-61.9LON-30.5,iterates>@LAT-67.6LON53.7,blocks>@LAT-64.6LON-168.4

## Workflow Corridor
The corridor slopes South-East one increment at a time.
Each step is a coordinate, each coordinate a promise.

This corridor:
- **leads_to** a workshop
- **iterates** a side room of repeating motifs
- **blocks** a locked door nearby

---

@LAT-67.6LON53.7 | created:1700000250 | updated:1700000950 | relates:refines>@LAT-61.9LON-30.5,tradeoffs>@LAT-75.4LON137.9

## Iteration Room
Here, the same idea repeats until it changes shape.

- An iteration is not duplication.
- An iteration is a pressure wave that reveals structure.

This room **refines** the workshop by sending it better questions.

---

@LAT-64.6LON-168.4 | created:1700000300 | updated:1700001000 | relates:gates>@LAT-57.0LON-114.7

## The Locked Gate (With a Friendly Note)
The gate is locked, but the note is not.

> "If you can explain the build in one paragraph, you may enter."

This node **gates** a deeper chamber (a future you, waiting).

---

@LAT-61.9LON-30.5 | created:1700000400 | updated:1700001100 | relates:builds>@LAT-54.8LON23.2,depends_on>@LAT-59.3LON107.4

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

@LAT-59.3LON107.4 | created:1700000450 | updated:1700001150 | relates:supports>@LAT-61.9LON-30.5,organizes>@LAT-54.8LON23.2

## Indexing Desk
A neat desk with an absurdly sharp pencil.

This desk:
- **supports** the workshop by organizing parts
- **organizes** the archive so it stays walkable

---

@LAT-57.0LON-114.7 | created:1700000500 | updated:1700001200 | relates:reveals>@LAT-50.7LON-61.0

## The Chamber of Future Footprints
You made it. The lock was never a lock, it was a filter.

Inside: footprints that have not happened yet.
This node **reveals** a distant observatory.

---

@LAT-54.8LON23.2 | created:1700000550 | updated:1700001250 | relates:archives>@LAT-61.9LON-30.5,expands>@LAT-52.7LON161.1

## Archive Wing
Cabinets of paper and pixels.
Everything here has provenance, even if the provenance is "a good hunch."

This wing:
- **archives** what the workshop produces
- **expands** the workshop outward

---

@LAT-52.7LON161.1 | created:1700000580 | updated:1700001280 | relates:maps_to>@LAT-50.7LON-61.0

## Gallery of Maps
Maps of the workshop drawn from memory, then corrected by building.

- A map is a story about navigation.
- A map is never the territory, but it can be a faithful rumor.

This node **maps_to** the observatory.

---

@LAT-50.7LON-61.0 | created:1700000600 | updated:1700001300 | relates:observes>@LAT-81.6LON0.0,validates>@LAT-61.9LON-30.5

## Observatory of the Whole
From here you can see the workbench at the root and the workshop below,
like constellations connected by deliberate lines.

- It **observes** the origin without rewriting it.
- It **validates** the workshop by confirming the path was real.

---

@LAT-48.8LON76.9 | created:1769808086 | updated:1769808100 | relates:frames>@LAT-81.6LON0.0,constrains>@LAT-45.2LON-7.3

## TTE Agent Umwelt Config
The umwelt config defines what exists for the assistant to notice and act on.
It limits scope to what can be sensed, stored, related, or acted upon.

- This node **frames** the root workbench.
- It **constrains** the TTAI role to maker-scale reality.

---

@LAT-47.0LON-145.2 | created:1769808110 | updated:1770649832 | relates:drives>@LAT-45.2LON-7.3,backgrounds>@LAT-54.8LON23.2,defined_in>@LAT34.0LON-151.3,references>@LAT-35.5LON100.1

## Default Network
The [default network](https://github.com/antfriend/toot-toot-engineering/blob/main/standards/ttai/BEHAVIOR_SPEC.md) is the background circuitry that runs when nothing is demanded.
It maintains narrative continuity and loose associations between artifacts.

- It **drives** idle-time TTAI behavior.
- It **backgrounds** the archive wing.

---

@LAT-45.2LON-7.3 | created:1769808130 | updated:1769808140 | relates:assumes>@LAT-48.8LON76.9,defaults_to>@LAT-47.0LON-145.2,operates_in>@LAT-61.9LON-30.5,archives_to>@LAT-54.8LON23.2

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

@LAT-43.5LON130.6 | created:1769808200 | updated:1769808200 | relates:safeguards>@LAT-61.9LON-30.5,tests>@LAT-81.6LON0.0

## Polycarbonate Test Box
A clear, impact-resistant box for safely testing dangerous things.
It is built to contain fragments, redirect shrapnel, and keep eyes and hands at a safe distance.

- Polycarbonate panels are bolted to a rigid frame with gasketed seams.
- A glove-port or tool pass-through allows interaction without exposure.
- A small vent with a blast baffle manages pressure and fumes.
- The box rests on a non-slip base with tie-down points.

Use this node when you need to test uncertain prototypes without turning the workshop into a hazard.

---

@LAT-41.8LON-91.5 | created:1770646802 | updated:1770649832 | relates:

## Toot Toot Engineering (TTE)
The overall workflow and repository for cycle-based production.

- kind: system
- aliases: TTE
- notes: Workflow version 3.8.

---

@LAT-40.2LON46.4 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT24.1LON-36.6

## Toot Toot Network (TTN)
A transport-agnostic semantic mesh with explicit AI invocation rules.

- kind: system
- aliases: TTN
- notes: Defined in `RFCs/TTN-RFC-0001.md`.

---

@LAT-38.6LON-175.7 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT18.8LON131.8

## Toot Toot Database (TTDB)
A single-file semantic story database with typed edges and stable IDs.

- kind: system
- aliases: TTDB, My Mental Palace DB, MMPDB
- notes: Defined in `RFCs/TTDB-RFC-0001-File-Format.md`.

---

@LAT-37.0LON-37.8 | created:1770646802 | updated:1770649832 | relates:

## MyMentalPalaceDB.md
The active TTDB instance for this repo.

- kind: document
- aliases: My Mental Palace DB
- notes: Stores records, cursor state, and typed edges.

---

@LAT-35.5LON100.1 | created:1770646802 | updated:1770649832 | relates:

## TTAI
A maker-scale shop assistant and TTDB librarian invoked as "@AI".

- kind: role
- aliases: ai_shop_assistant
- notes: Defined in `standards/ttai/TTAI_SPEC.md`.

---

@LAT-34.0LON-122.0 | created:1770646802 | updated:1770649832 | relates:references>@LAT-32.5LON15.9

## Umwelt
The perceived world that bounds what exists for the system.

- kind: concept
- aliases: none
- notes: See `TTE_Umwelt.md` and `standards/umwelt/TTE_Agent_Umwelt_v1.yaml`.

---

@LAT-32.5LON15.9 | created:1770646802 | updated:1770649832 | relates:

## TTE Umwelt
Narrative description of the TTE umwelt and its domains.

- kind: document
- aliases: TTE_Umwelt.md
- notes: Maker-scale, narrative-aware, semantically explicit.

---

@LAT-31.1LON153.8 | created:1770646802 | updated:1770649832 | relates:

## TTE Agent Umwelt v1
YAML configuration for the agent umwelt.

- kind: document
- aliases: TTE_Agent_Umwelt_v1.yaml
- notes: Stored under `standards/umwelt/`.

---

@LAT-29.6LON-68.3 | created:1770646802 | updated:1770649832 | relates:

## Bootstrap
Interprets the prompt, proposes team composition, objectives, and plan changes, and suggests next-cycle prompts.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/BOOTSTRAP.md`.

---

@LAT-28.2LON69.6 | created:1770646802 | updated:1770649832 | relates:updates>@LAT-6.2LON-106.1,updates>@LAT-4.9LON31.8,updates>@LAT-3.7LON169.7

## Orchestrator
Builds and updates the critical-path plan and logging assets.

- kind: role
- aliases: none
- notes: Updates `PLAN.md`, `AGENTS.md`, and `LOG.md`.

---

@LAT-26.8LON-152.5 | created:1770646802 | updated:1770649832 | relates:

## Storyteller
Refines the narrative thread and creative framing early in the cycle.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/STORYTELLER.md`.

---

@LAT-25.5LON-14.6 | created:1770646802 | updated:1770649832 | relates:

## SVG engineer
Specializes in SVG production constraints and strategies.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/SVG_ENGINEER.md` when needed.

---

@LAT-24.1LON123.3 | created:1770646802 | updated:1770649832 | relates:

## Core worker
Produces the primary solution artifacts for the task.

- kind: role
- aliases: none
- notes: Output varies by cycle and prompt.

---

@LAT-22.8LON-98.8 | created:1770646802 | updated:1770649832 | relates:

## Image producer
Generates or composes visual assets programmatically.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/IMAGE_ASSETS.md` and assets.

---

@LAT-21.4LON39.1 | created:1770646802 | updated:1770649832 | relates:

## PDF assembler
Builds print-ready PDFs from assets and layout specifications.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/PRINT_PDF.md` and outputs.

---

@LAT-20.1LON177.0 | created:1770646802 | updated:1770649832 | relates:

## Reviewer
Checks for correctness, gaps, and risks before delivery.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/REVIEW.md`.

---

@LAT-18.8LON-45.1 | created:1770646802 | updated:1770649832 | relates:updates>@LAT-1.2LON85.5

## Delivery packager
Assembles final assets and export notes.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/DELIVERY.md` and updates `RELEASES.md`.

---

@LAT-17.5LON92.8 | created:1770646802 | updated:1770649832 | relates:updates>@LAT-29.6LON-68.3

## Retrospective
Recommends changes to prevent issues or improve outcomes.

- kind: role
- aliases: none
- notes: Updates `deliverables/cycle-XX/BOOTSTRAP.md` with recommendations.

---

@LAT-16.2LON-129.3 | created:1770646802 | updated:1770649832 | relates:

## Human co-producer
Starts the run and is only needed between steps if blocked.

- kind: actor
- aliases: human
- notes: Provides feedback after the final step.

---

@LAT-15.0LON8.6 | created:1770646802 | updated:1770649832 | relates:uses>@LAT2.5LON139.2,references>@LAT-8.7LON-21.9

## Cycle
A bounded production run with role steps and deliverables under `deliverables/cycle-XX/`.

- kind: concept
- aliases: none
- notes: Cycle-01 uses `TTE_PROMPT.md`.

---

@LAT-13.7LON146.5 | created:1770646802 | updated:1770649832 | relates:

## Step
A single role execution that produces named assets.

- kind: concept
- aliases: none
- notes: One step, one agent, one role.

---

@LAT-12.4LON-75.6 | created:1770646802 | updated:1770649832 | relates:references>@LAT-4.9LON31.8

## Role
A defined responsibility with expected outputs.

- kind: concept
- aliases: none
- notes: Roles are listed in `AGENTS.md`.

---

@LAT-11.2LON62.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT-6.2LON-106.1

## Critical path
The ordered list of steps required to reach delivery.

- kind: concept
- aliases: plan
- notes: Tracked in `PLAN.md`.

---

@LAT-9.9LON-159.8 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT17.5LON-6.1

## Definition of done
The completion gate for a cycle.

- kind: concept
- aliases: DoD
- notes: Defined in `RFCs/TTE-RFC-0003-Definition-of-Done-and-Release.md`.

---

@LAT-8.7LON-21.9 | created:1770646802 | updated:1770649832 | relates:

## Deliverables
Named outputs created during a cycle.

- kind: artifact
- aliases: outputs
- notes: Stored under `deliverables/cycle-XX/`.

---

@LAT-7.4LON116.0 | created:1770646802 | updated:1770649832 | relates:

## Placeholder
A temporary marker that must be resolved before step completion.

- kind: concept
- aliases: none
- notes: Placeholders block marking a step complete.

---

@LAT-6.2LON-106.1 | created:1770646802 | updated:1770649832 | relates:

## PLAN.md
The authoritative critical-path plan and table of contents.

- kind: document
- aliases: Plan
- notes: Records deliverable paths and step status.

---

@LAT-4.9LON31.8 | created:1770646802 | updated:1770649832 | relates:

## AGENTS.md
Defines roles, rules, and expected assets.

- kind: document
- aliases: Agents
- notes: Governs workflow behavior.

---

@LAT-3.7LON169.7 | created:1770646802 | updated:1770649832 | relates:

## LOG.md
The append-only log of decisions, changes, and open questions.

- kind: document
- aliases: Log
- notes: Updated at the end of each step.

---

@LAT-2.5LON-52.4 | created:1770646802 | updated:1770649832 | relates:

## CHECKLIST.md
Step completion and consistency checks.

- kind: document
- aliases: Checklist
- notes: Consulted during each step.

---

@LAT-1.2LON85.5 | created:1770646802 | updated:1770649832 | relates:

## RELEASES.md
Cycle summaries and deliverable indexes.

- kind: document
- aliases: Releases
- notes: Updated during delivery packaging.

---

@LAT0.0LON-136.6 | created:1770646802 | updated:1770649832 | relates:

## README.md
Entry point describing workflow and rules.

- kind: document
- aliases: Readme
- notes: Must be read before work begins.

---

@LAT1.2LON1.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT0.0LON-136.6

## WHAT.md
Conceptual overview of TTE.

- kind: document
- aliases: none
- notes: Supplements `README.md`.

---

@LAT2.5LON139.2 | created:1770646802 | updated:1770649832 | relates:

## TTE_PROMPT.md
The cycle-01 prompt input.

- kind: document
- aliases: Prompt
- notes: Later cycles use the prompt from the prior cycle's bootstrap.

---

@LAT3.7LON-82.9 | created:1770646802 | updated:1770649832 | relates:

## TTE_ONTOLOGY.md
The ontology of terms and relationships for this repo.

- kind: document
- aliases: ontology
- notes: Organized into Nodes and Semantic Edges.

---

@LAT4.9LON55.0 | created:1770646802 | updated:1770649832 | relates:

## LICENSE
The project license.

- kind: document
- aliases: MIT License
- notes: TTE is MIT-licensed.

---

@LAT6.2LON-167.1 | created:1770646802 | updated:1770649832 | relates:

## requirements.txt
Python dependencies list.

- kind: document
- aliases: none
- notes: Includes `openai`.

---

@LAT7.4LON-29.2 | created:1770646802 | updated:1770649832 | relates:

## Activate_bat_run_tte.bat
Windows batch helper for running TTE.

- kind: document
- aliases: none
- notes: Starts the agent workflow on Windows.

---

@LAT8.7LON108.7 | created:1770646802 | updated:1770649832 | relates:references>@LAT81.6LON86.7

## tte_agent.py
The main TTE agent loop and tool bridge.

- kind: file
- aliases: none
- notes: Uses OpenAI Responses API and local tools.

---

@LAT9.9LON-113.5 | created:1770646802 | updated:1770649832 | relates:

## tte_monitor.py
The Tkinter UI that monitors PLAN and LOG.

- kind: file
- aliases: TTE Monitor
- notes: Renders markdown views for PLAN and LOG.

---

@LAT11.2LON24.4 | created:1770646802 | updated:1770649832 | relates:reads>@LAT-37.0LON-37.8,references>@LAT18.8LON131.8,references>@LAT20.1LON-90.3,references>@LAT21.4LON47.6

## ttdb_navigator.py
The Tkinter UI that navigates TTDB records.

- kind: file
- aliases: TTDB Navigator
- notes: Provides list navigation and a globe view for TTDB coordinates.

---

@LAT12.4LON162.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4,references>@LAT-38.6LON-175.7

## RFCs index
The index of RFCs in this repo.

- kind: document
- aliases: RFCs/INDEX.md
- notes: Links to TTN, TTDB, and TTE RFCs.

---

@LAT13.7LON-59.8 | created:1770646802 | updated:1770649832 | relates:

## TTN RFC manifest
Hash manifest for TTN RFC bundle.

- kind: document
- aliases: RFCs/TTN-RFC-MANIFEST.md
- notes: Records SHA256 for RFCs.

---

@LAT15.0LON78.1 | created:1770646802 | updated:1770649832 | relates:

## TTE-RFC-0001
Workflow and role definitions for TTE.

- kind: document
- aliases: Workflow and Roles RFC
- notes: `RFCs/TTE-RFC-0001-Workflow-and-Roles.md`.

---

@LAT16.2LON-144.0 | created:1770646802 | updated:1770649832 | relates:

## TTE-RFC-0002
PLAN, LOG, and checklist requirements.

- kind: document
- aliases: Plan and Log RFC
- notes: `RFCs/TTE-RFC-0002-Plan-Log-and-Checklist.md`.

---

@LAT17.5LON-6.1 | created:1770646802 | updated:1770649832 | relates:

## TTE-RFC-0003
Definition of done and release packaging rules.

- kind: document
- aliases: Definition of Done RFC
- notes: `RFCs/TTE-RFC-0003-Definition-of-Done-and-Release.md`.

---

@LAT18.8LON131.8 | created:1770646802 | updated:1770649832 | relates:references>@LAT-38.6LON-175.7

## TTDB-RFC-0001
TTDB file format and record structure.

- kind: document
- aliases: File Format RFC
- notes: `RFCs/TTDB-RFC-0001-File-Format.md`.

---

@LAT20.1LON-90.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT59.3LON-20.7,references>@LAT-38.6LON-175.7

## TTDB-RFC-0002
Cursor semantics for TTDB.

- kind: document
- aliases: Cursor Semantics RFC
- notes: `RFCs/TTDB-RFC-0002-Cursor-Semantics.md`.

---

@LAT21.4LON47.6 | created:1770646802 | updated:1770649832 | relates:references>@LAT-38.6LON-175.7

## TTDB-RFC-0003
Typed edge semantics for TTDB.

- kind: document
- aliases: Typed Edge Semantics RFC
- notes: `RFCs/TTDB-RFC-0003-Typed-Edges.md`.

---

@LAT22.8LON-174.5 | created:1770646802 | updated:1770649832 | relates:references>@LAT-38.6LON-175.7

## TTDB-RFC-0004
Event ID assignment and collision handling.

- kind: document
- aliases: Event ID RFC
- notes: `RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md`.

---

@LAT24.1LON-36.6 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4

## TTN-RFC-0001
TTN core semantic mesh specification.

- kind: document
- aliases: Core TTN RFC
- notes: `RFCs/TTN-RFC-0001.md`.

---

@LAT25.5LON101.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4

## TTN-RFC-0002
TTN typed edge taxonomy.

- kind: document
- aliases: TTN Typed Edges RFC
- notes: `RFCs/TTN-RFC-0002-Typed-Edges.md`.

---

@LAT26.8LON-120.8 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4

## TTN-RFC-0003
Reference implementation checklist for TTN nodes.

- kind: document
- aliases: Reference Implementation RFC
- notes: `RFCs/TTN-RFC-0003-Reference-Implementation.md`.

---

@LAT28.2LON17.1 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4

## TTN-RFC-0004
Semantic compression and token dictionary for constrained links.

- kind: document
- aliases: Semantic Compression RFC
- notes: `RFCs/TTN-RFC-0004-Semantic-Compression.md`.

---

@LAT29.6LON155.0 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4

## TTN-RFC-0005
Trust, reputation, and moderation modeling.

- kind: document
- aliases: Trust and Reputation RFC
- notes: `RFCs/TTN-RFC-0005-Trust-and-Reputation.md`.

---

@LAT31.1LON-67.1 | created:1770646802 | updated:1770649832 | relates:references>@LAT-40.2LON46.4

## TTN-RFC-0006
Minimal LoRa packet framing for non-Meshtastic nodes.

- kind: document
- aliases: LoRa Framing RFC
- notes: `RFCs/TTN-RFC-0006-LoRa-Packet-Framing.md`.

---

@LAT32.5LON70.8 | created:1770646802 | updated:1770649832 | relates:references>@LAT-35.5LON100.1

## TTAI_SPEC.md
Core identity and behavior requirements for TTAI.

- kind: document
- aliases: TTAI Spec
- notes: Stored under `standards/ttai/`.

---

@LAT34.0LON-151.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT-35.5LON100.1

## DEFAULT_NETWORK.md
Narrative default network definition for TTAI.

- kind: document
- aliases: Default Network Spec
- notes: Stored under `standards/ttai/`.

---

@LAT35.5LON-13.4 | created:1770646802 | updated:1770649832 | relates:references>@LAT-35.5LON100.1

## BEHAVIOR_SPEC.md
TTAI idle-time and TTN join/leave behavior.

- kind: document
- aliases: Behavior Spec
- notes: Stored under `standards/ttai/`.

---

@LAT37.0LON124.5 | created:1770646802 | updated:1770649832 | relates:required_by>@LAT24.1LON-36.6,references>@LAT-40.2LON46.4

## Node ID
Stable cryptographic identifier for a TTN node.

- kind: concept
- aliases: node_id
- notes: Required by `RFCs/TTN-RFC-0001.md`.

---

@LAT38.6LON-97.6 | created:1770646802 | updated:1770649832 | relates:required_by>@LAT24.1LON-36.6,references>@LAT-40.2LON46.4

## Semantic ID
Location-anchored identifier for semantic events.

- kind: concept
- aliases: semantic_id
- notes: Required by `RFCs/TTN-RFC-0001.md`.

---

@LAT40.2LON40.3 | created:1770646802 | updated:1770649832 | relates:references>@LAT-38.6LON-175.7

## Semantic Event
A structured event in TTN with provenance and typed edges.

- kind: concept
- aliases: none
- notes: Stored in TTDB by default.

---

@LAT41.8LON178.2 | created:1770646802 | updated:1770649832 | relates:

## Typed edge
A directional link with a type token between records.

- kind: concept
- aliases: typed edge
- notes: Syntax `type>@TARGET_ID`.

---

@LAT43.5LON-43.9 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT24.1LON-36.6,references>@LAT-40.2LON46.4

## TTN compliance level
Capability tier for a TTN node.

- kind: concept
- aliases: TTN-Base, TTN-BBS, TTN-AI, TTN-Gateway
- notes: Defined in `RFCs/TTN-RFC-0001.md`.

---

@LAT45.2LON94.0 | created:1770646802 | updated:1770649832 | relates:

## Presence event
A semantic event announcing a node on the network.

- kind: concept
- aliases: presence
- notes: Required for minimal viable nodes.

---

@LAT47.0LON-128.1 | created:1770646802 | updated:1770649832 | relates:references>@LAT26.8LON-120.8,references>@LAT-40.2LON46.4

## Mesh grammar
Compact, transport-friendly representation of TTN semantics.

- kind: concept
- aliases: compact mesh grammar
- notes: Referenced in `RFCs/TTN-RFC-0003-Reference-Implementation.md`.

---

@LAT48.8LON9.8 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT28.2LON17.1,references>@LAT-40.2LON46.4

## Token dictionary
The on-mesh token set for semantic compression.

- kind: concept
- aliases: compression tokens
- notes: Defined in `RFCs/TTN-RFC-0004-Semantic-Compression.md`.

---

@LAT50.7LON147.7 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT31.1LON-67.1,references>@LAT-40.2LON46.4

## LoRa frame
Minimal packet framing for non-Meshtastic TTN nodes.

- kind: concept
- aliases: LoRa packet framing
- notes: Defined in `RFCs/TTN-RFC-0006-LoRa-Packet-Framing.md`.

---

@LAT52.7LON-74.4 | created:1770646802 | updated:1770649832 | relates:references>@LAT54.8LON63.5

## TTDB record
A single TTDB node block with ID, metadata, and body.

- kind: concept
- aliases: record
- notes: Header begins with `@LATxLONy`.

---

@LAT54.8LON63.5 | created:1770646802 | updated:1770649832 | relates:

## TTDB record ID
A lat/lon coordinate on the knowledge globe.

- kind: concept
- aliases: @LATxLONy
- notes: Deterministic and collision-resolved.

---

@LAT57.0LON-158.6 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT22.8LON-174.5,references>@LAT-38.6LON-175.7

## Knowledge globe
The subjective coordinate map for TTDB IDs.

- kind: concept
- aliases: globe
- notes: Defined in `RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md`.

---

@LAT59.3LON-20.7 | created:1770646802 | updated:1770649832 | relates:references>@LAT-38.6LON-175.7

## Cursor
The active selection window for TTDB records.

- kind: concept
- aliases: cursor
- notes: Defined in `RFCs/TTDB-RFC-0002-Cursor-Semantics.md`.

---

@LAT61.9LON117.2 | created:1770646802 | updated:1770649832 | relates:references>@LAT-37.0LON-37.8

## Cursor policy
Limits for TTDB preview and node list sizes.

- kind: concept
- aliases: none
- notes: See `MyMentalPalaceDB.md` `cursor_policy`.

---

@LAT64.6LON-104.9 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT22.8LON-174.5,references>@LAT-38.6LON-175.7

## Collision policy
TTDB rule for resolving ID collisions.

- kind: concept
- aliases: southeast_step
- notes: Defined in `RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md`.

---

@LAT67.6LON33.0 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT35.5LON-13.4,references>@LAT-35.5LON100.1

## Primitive mode
Reduced umwelt and verb set for constrained devices.

- kind: concept
- aliases: none
- notes: Defined in `standards/ttai/BEHAVIOR_SPEC.md`.

---

@LAT71.1LON170.9 | created:1770646802 | updated:1770649832 | relates:implemented_in>@LAT9.9LON-113.5

## Monitor UI
The Tkinter application for viewing plan, log, and DB.

- kind: artifact
- aliases: TTE Monitor
- notes: Implemented in `tte_monitor.py`.

---

@LAT75.4LON-51.2 | created:1770646802 | updated:1770649832 | relates:references>@LAT8.7LON108.7

## OpenAI API key
Environment variable required to run the agent.

- kind: concept
- aliases: OPENAI_API_KEY
- notes: Read by `tte_agent.py`.

---

@LAT81.6LON86.7 | created:1770646802 | updated:1770649832 | relates:used_in>@LAT8.7LON108.7

## OpenAI Responses API
The model execution interface used by the agent.

- kind: concept
- aliases: responses.create
- notes: Used in `tte_agent.py`.
