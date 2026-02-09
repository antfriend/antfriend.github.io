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
![the forge](/images/time-foundry.svg)
A workbench sits here, lit well enough to build, dim enough to notice what is unknown.   
- **Rule of this workshop:** all paths are *chosen*, not forced.
- The bench **inspires** a first workflow to [the South-East](@LAT1LON1).
- It also **anchors** a small alcove to [the East](@LAT0LON1).
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

@LAT5LON4 | created:1769808110 | updated:1770649832 | relates:drives>@LAT5LON5,backgrounds>@LAT3LON3,defined_in>@LAT30LON4,references>@LAT10LON10

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

---

@LAT0LON50 | created:1770646802 | updated:1770649832 | relates:

## Toot Toot Engineering (TTE)
The overall workflow and repository for cycle-based production.

- kind: system
- aliases: TTE
- notes: Workflow version 3.8.

---

@LAT2LON50 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON25

## Toot Toot Network (TTN)
A transport-agnostic semantic mesh with explicit AI invocation rules.

- kind: system
- aliases: TTN
- notes: Defined in `RFCs/TTN-RFC-0001.md`.

---

@LAT0LON52 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON13

## Toot Toot Database (TTDB)
A single-file semantic story database with typed edges and stable IDs.

- kind: system
- aliases: TTDB, My Mental Palace DB, MMPDB
- notes: Defined in `RFCs/TTDB-RFC-0001-File-Format.md`.

---

@LAT30LON7 | created:1770646802 | updated:1770649832 | relates:

## MyMentalPalaceDB.md
The active TTDB instance for this repo.

- kind: document
- aliases: My Mental Palace DB
- notes: Stores records, cursor state, and typed edges.

---

@LAT10LON10 | created:1770646802 | updated:1770649832 | relates:

## TTAI
A maker-scale shop assistant and TTDB librarian invoked as "@AI".

- kind: role
- aliases: ai_shop_assistant
- notes: Defined in `standards/ttai/TTAI_SPEC.md`.

---

@LAT20LON24 | created:1770646802 | updated:1770649832 | relates:references>@LAT30LON18

## Umwelt
The perceived world that bounds what exists for the system.

- kind: concept
- aliases: none
- notes: See `TTE_Umwelt.md` and `standards/umwelt/TTE_Agent_Umwelt_v1.yaml`.

---

@LAT30LON18 | created:1770646802 | updated:1770649832 | relates:

## TTE Umwelt
Narrative description of the TTE umwelt and its domains.

- kind: document
- aliases: TTE_Umwelt.md
- notes: Maker-scale, narrative-aware, semantically explicit.

---

@LAT30LON17 | created:1770646802 | updated:1770649832 | relates:

## TTE Agent Umwelt v1
YAML configuration for the agent umwelt.

- kind: document
- aliases: TTE_Agent_Umwelt_v1.yaml
- notes: Stored under `standards/umwelt/`.

---

@LAT10LON0 | created:1770646802 | updated:1770649832 | relates:

## Bootstrap
Interprets the prompt, proposes team composition, objectives, and plan changes, and suggests next-cycle prompts.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/BOOTSTRAP.md`.

---

@LAT10LON4 | created:1770646802 | updated:1770649832 | relates:updates>@LAT30LON8,updates>@LAT30LON0,updates>@LAT30LON6

## Orchestrator
Builds and updates the critical-path plan and logging assets.

- kind: role
- aliases: none
- notes: Updates `PLAN.md`, `AGENTS.md`, and `LOG.md`.

---

@LAT10LON9 | created:1770646802 | updated:1770649832 | relates:

## Storyteller
Refines the narrative thread and creative framing early in the cycle.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/STORYTELLER.md`.

---

@LAT10LON8 | created:1770646802 | updated:1770649832 | relates:

## SVG engineer
Specializes in SVG production constraints and strategies.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/SVG_ENGINEER.md` when needed.

---

@LAT10LON1 | created:1770646802 | updated:1770649832 | relates:

## Core worker
Produces the primary solution artifacts for the task.

- kind: role
- aliases: none
- notes: Output varies by cycle and prompt.

---

@LAT10LON3 | created:1770646802 | updated:1770649832 | relates:

## Image producer
Generates or composes visual assets programmatically.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/IMAGE_ASSETS.md` and assets.

---

@LAT10LON5 | created:1770646802 | updated:1770649832 | relates:

## PDF assembler
Builds print-ready PDFs from assets and layout specifications.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/PRINT_PDF.md` and outputs.

---

@LAT10LON7 | created:1770646802 | updated:1770649832 | relates:

## Reviewer
Checks for correctness, gaps, and risks before delivery.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/REVIEW.md`.

---

@LAT10LON2 | created:1770646802 | updated:1770649832 | relates:updates>@LAT30LON10

## Delivery packager
Assembles final assets and export notes.

- kind: role
- aliases: none
- notes: Produces `deliverables/cycle-XX/DELIVERY.md` and updates `RELEASES.md`.

---

@LAT10LON6 | created:1770646802 | updated:1770649832 | relates:updates>@LAT10LON0

## Retrospective
Recommends changes to prevent issues or improve outcomes.

- kind: role
- aliases: none
- notes: Updates `deliverables/cycle-XX/BOOTSTRAP.md` with recommendations.

---

@LAT60LON0 | created:1770646802 | updated:1770649832 | relates:

## Human co-producer
Starts the run and is only needed between steps if blocked.

- kind: actor
- aliases: human
- notes: Provides feedback after the final step.

---

@LAT20LON4 | created:1770646802 | updated:1770649832 | relates:uses>@LAT30LON23,references>@LAT50LON0

## Cycle
A bounded production run with role steps and deliverables under `deliverables/cycle-XX/`.

- kind: concept
- aliases: none
- notes: Cycle-01 uses `TTE_PROMPT.md`.

---

@LAT20LON18 | created:1770646802 | updated:1770649832 | relates:

## Step
A single role execution that produces named assets.

- kind: concept
- aliases: none
- notes: One step, one agent, one role.

---

@LAT20LON15 | created:1770646802 | updated:1770649832 | relates:references>@LAT30LON0

## Role
A defined responsibility with expected outputs.

- kind: concept
- aliases: none
- notes: Roles are listed in `AGENTS.md`.

---

@LAT20LON1 | created:1770646802 | updated:1770649832 | relates:references>@LAT30LON8

## Critical path
The ordered list of steps required to reach delivery.

- kind: concept
- aliases: plan
- notes: Tracked in `PLAN.md`.

---

@LAT20LON5 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON21

## Definition of done
The completion gate for a cycle.

- kind: concept
- aliases: DoD
- notes: Defined in `RFCs/TTE-RFC-0003-Definition-of-Done-and-Release.md`.

---

@LAT50LON0 | created:1770646802 | updated:1770649832 | relates:

## Deliverables
Named outputs created during a cycle.

- kind: artifact
- aliases: outputs
- notes: Stored under `deliverables/cycle-XX/`.

---

@LAT20LON12 | created:1770646802 | updated:1770649832 | relates:

## Placeholder
A temporary marker that must be resolved before step completion.

- kind: concept
- aliases: none
- notes: Placeholders block marking a step complete.

---

@LAT30LON8 | created:1770646802 | updated:1770649832 | relates:

## PLAN.md
The authoritative critical-path plan and table of contents.

- kind: document
- aliases: Plan
- notes: Records deliverable paths and step status.

---

@LAT30LON0 | created:1770646802 | updated:1770649832 | relates:

## AGENTS.md
Defines roles, rules, and expected assets.

- kind: document
- aliases: Agents
- notes: Governs workflow behavior.

---

@LAT30LON6 | created:1770646802 | updated:1770649832 | relates:

## LOG.md
The append-only log of decisions, changes, and open questions.

- kind: document
- aliases: Log
- notes: Updated at the end of each step.

---

@LAT30LON3 | created:1770646802 | updated:1770649832 | relates:

## CHECKLIST.md
Step completion and consistency checks.

- kind: document
- aliases: Checklist
- notes: Consulted during each step.

---

@LAT30LON10 | created:1770646802 | updated:1770649832 | relates:

## RELEASES.md
Cycle summaries and deliverable indexes.

- kind: document
- aliases: Releases
- notes: Updated during delivery packaging.

---

@LAT30LON9 | created:1770646802 | updated:1770649832 | relates:

## README.md
Entry point describing workflow and rules.

- kind: document
- aliases: Readme
- notes: Must be read before work begins.

---

@LAT30LON31 | created:1770646802 | updated:1770649832 | relates:references>@LAT30LON9

## WHAT.md
Conceptual overview of TTE.

- kind: document
- aliases: none
- notes: Supplements `README.md`.

---

@LAT30LON23 | created:1770646802 | updated:1770649832 | relates:

## TTE_PROMPT.md
The cycle-01 prompt input.

- kind: document
- aliases: Prompt
- notes: Later cycles use the prompt from the prior cycle's bootstrap.

---

@LAT30LON22 | created:1770646802 | updated:1770649832 | relates:

## TTE_ONTOLOGY.md
The ontology of terms and relationships for this repo.

- kind: document
- aliases: ontology
- notes: Organized into Nodes and Semantic Edges.

---

@LAT30LON5 | created:1770646802 | updated:1770649832 | relates:

## LICENSE
The project license.

- kind: document
- aliases: MIT License
- notes: TTE is MIT-licensed.

---

@LAT30LON32 | created:1770646802 | updated:1770649832 | relates:

## requirements.txt
Python dependencies list.

- kind: document
- aliases: none
- notes: Includes `openai`.

---

@LAT30LON1 | created:1770646802 | updated:1770649832 | relates:

## Activate_bat_run_tte.bat
Windows batch helper for running TTE.

- kind: document
- aliases: none
- notes: Starts the agent workflow on Windows.

---

@LAT40LON0 | created:1770646802 | updated:1770649832 | relates:references>@LAT20LON11

## tte_agent.py
The main TTE agent loop and tool bridge.

- kind: file
- aliases: none
- notes: Uses OpenAI Responses API and local tools.

---

@LAT40LON1 | created:1770646802 | updated:1770649832 | relates:

## tte_monitor.py
The Tkinter UI that monitors PLAN, LOG, and TTDB.

- kind: file
- aliases: TTE Monitor
- notes: Renders a DB graph and markdown views.

---

@LAT30LON11 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50,references>@LAT0LON52

## RFCs index
The index of RFCs in this repo.

- kind: document
- aliases: RFCs/INDEX.md
- notes: Links to TTN, TTDB, and TTE RFCs.

---

@LAT30LON24 | created:1770646802 | updated:1770649832 | relates:

## TTN RFC manifest
Hash manifest for TTN RFC bundle.

- kind: document
- aliases: RFCs/TTN-RFC-MANIFEST.md
- notes: Records SHA256 for RFCs.

---

@LAT30LON19 | created:1770646802 | updated:1770649832 | relates:

## TTE-RFC-0001
Workflow and role definitions for TTE.

- kind: document
- aliases: Workflow and Roles RFC
- notes: `RFCs/TTE-RFC-0001-Workflow-and-Roles.md`.

---

@LAT30LON20 | created:1770646802 | updated:1770649832 | relates:

## TTE-RFC-0002
PLAN, LOG, and checklist requirements.

- kind: document
- aliases: Plan and Log RFC
- notes: `RFCs/TTE-RFC-0002-Plan-Log-and-Checklist.md`.

---

@LAT30LON21 | created:1770646802 | updated:1770649832 | relates:

## TTE-RFC-0003
Definition of done and release packaging rules.

- kind: document
- aliases: Definition of Done RFC
- notes: `RFCs/TTE-RFC-0003-Definition-of-Done-and-Release.md`.

---

@LAT30LON13 | created:1770646802 | updated:1770649832 | relates:references>@LAT0LON52

## TTDB-RFC-0001
TTDB file format and record structure.

- kind: document
- aliases: File Format RFC
- notes: `RFCs/TTDB-RFC-0001-File-Format.md`.

---

@LAT30LON14 | created:1770646802 | updated:1770649832 | relates:references>@LAT20LON2,references>@LAT0LON52

## TTDB-RFC-0002
Cursor semantics for TTDB.

- kind: document
- aliases: Cursor Semantics RFC
- notes: `RFCs/TTDB-RFC-0002-Cursor-Semantics.md`.

---

@LAT30LON15 | created:1770646802 | updated:1770649832 | relates:references>@LAT0LON52

## TTDB-RFC-0003
Typed edge semantics for TTDB.

- kind: document
- aliases: Typed Edge Semantics RFC
- notes: `RFCs/TTDB-RFC-0003-Typed-Edges.md`.

---

@LAT30LON16 | created:1770646802 | updated:1770649832 | relates:references>@LAT0LON52

## TTDB-RFC-0004
Event ID assignment and collision handling.

- kind: document
- aliases: Event ID RFC
- notes: `RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md`.

---

@LAT30LON25 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50

## TTN-RFC-0001
TTN core semantic mesh specification.

- kind: document
- aliases: Core TTN RFC
- notes: `RFCs/TTN-RFC-0001.md`.

---

@LAT30LON26 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50

## TTN-RFC-0002
TTN typed edge taxonomy.

- kind: document
- aliases: TTN Typed Edges RFC
- notes: `RFCs/TTN-RFC-0002-Typed-Edges.md`.

---

@LAT30LON27 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50

## TTN-RFC-0003
Reference implementation checklist for TTN nodes.

- kind: document
- aliases: Reference Implementation RFC
- notes: `RFCs/TTN-RFC-0003-Reference-Implementation.md`.

---

@LAT30LON28 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50

## TTN-RFC-0004
Semantic compression and token dictionary for constrained links.

- kind: document
- aliases: Semantic Compression RFC
- notes: `RFCs/TTN-RFC-0004-Semantic-Compression.md`.

---

@LAT30LON29 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50

## TTN-RFC-0005
Trust, reputation, and moderation modeling.

- kind: document
- aliases: Trust and Reputation RFC
- notes: `RFCs/TTN-RFC-0005-Trust-and-Reputation.md`.

---

@LAT30LON30 | created:1770646802 | updated:1770649832 | relates:references>@LAT2LON50

## TTN-RFC-0006
Minimal LoRa packet framing for non-Meshtastic nodes.

- kind: document
- aliases: LoRa Framing RFC
- notes: `RFCs/TTN-RFC-0006-LoRa-Packet-Framing.md`.

---

@LAT30LON12 | created:1770646802 | updated:1770649832 | relates:references>@LAT10LON10

## TTAI_SPEC.md
Core identity and behavior requirements for TTAI.

- kind: document
- aliases: TTAI Spec
- notes: Stored under `standards/ttai/`.

---

@LAT30LON4 | created:1770646802 | updated:1770649832 | relates:references>@LAT10LON10

## DEFAULT_NETWORK.md
Narrative default network definition for TTAI.

- kind: document
- aliases: Default Network Spec
- notes: Stored under `standards/ttai/`.

---

@LAT30LON2 | created:1770646802 | updated:1770649832 | relates:references>@LAT10LON10

## BEHAVIOR_SPEC.md
TTAI idle-time and TTN join/leave behavior.

- kind: document
- aliases: Behavior Spec
- notes: Stored under `standards/ttai/`.

---

@LAT20LON9 | created:1770646802 | updated:1770649832 | relates:required_by>@LAT30LON25,references>@LAT2LON50

## Node ID
Stable cryptographic identifier for a TTN node.

- kind: concept
- aliases: node_id
- notes: Required by `RFCs/TTN-RFC-0001.md`.

---

@LAT20LON17 | created:1770646802 | updated:1770649832 | relates:required_by>@LAT30LON25,references>@LAT2LON50

## Semantic ID
Location-anchored identifier for semantic events.

- kind: concept
- aliases: semantic_id
- notes: Required by `RFCs/TTN-RFC-0001.md`.

---

@LAT20LON16 | created:1770646802 | updated:1770649832 | relates:references>@LAT0LON52

## Semantic Event
A structured event in TTN with provenance and typed edges.

- kind: concept
- aliases: none
- notes: Stored in TTDB by default.

---

@LAT20LON23 | created:1770646802 | updated:1770649832 | relates:

## Typed edge
A directional link with a type token between records.

- kind: concept
- aliases: typed edge
- notes: Syntax `type>@TARGET_ID`.

---

@LAT20LON21 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON25,references>@LAT2LON50

## TTN compliance level
Capability tier for a TTN node.

- kind: concept
- aliases: TTN-Base, TTN-BBS, TTN-AI, TTN-Gateway
- notes: Defined in `RFCs/TTN-RFC-0001.md`.

---

@LAT20LON13 | created:1770646802 | updated:1770649832 | relates:

## Presence event
A semantic event announcing a node on the network.

- kind: concept
- aliases: presence
- notes: Required for minimal viable nodes.

---

@LAT20LON8 | created:1770646802 | updated:1770649832 | relates:references>@LAT30LON27,references>@LAT2LON50

## Mesh grammar
Compact, transport-friendly representation of TTN semantics.

- kind: concept
- aliases: compact mesh grammar
- notes: Referenced in `RFCs/TTN-RFC-0003-Reference-Implementation.md`.

---

@LAT20LON22 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON28,references>@LAT2LON50

## Token dictionary
The on-mesh token set for semantic compression.

- kind: concept
- aliases: compression tokens
- notes: Defined in `RFCs/TTN-RFC-0004-Semantic-Compression.md`.

---

@LAT20LON7 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON30,references>@LAT2LON50

## LoRa frame
Minimal packet framing for non-Meshtastic TTN nodes.

- kind: concept
- aliases: LoRa packet framing
- notes: Defined in `RFCs/TTN-RFC-0006-LoRa-Packet-Framing.md`.

---

@LAT20LON19 | created:1770646802 | updated:1770649832 | relates:references>@LAT20LON20

## TTDB record
A single TTDB node block with ID, metadata, and body.

- kind: concept
- aliases: record
- notes: Header begins with `@LATxLONy`.

---

@LAT20LON20 | created:1770646802 | updated:1770649832 | relates:

## TTDB record ID
A lat/lon coordinate on the knowledge globe.

- kind: concept
- aliases: @LATxLONy
- notes: Deterministic and collision-resolved.

---

@LAT20LON6 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON16,references>@LAT0LON52

## Knowledge globe
The subjective coordinate map for TTDB IDs.

- kind: concept
- aliases: globe
- notes: Defined in `RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md`.

---

@LAT20LON2 | created:1770646802 | updated:1770649832 | relates:references>@LAT0LON52

## Cursor
The active selection window for TTDB records.

- kind: concept
- aliases: cursor
- notes: Defined in `RFCs/TTDB-RFC-0002-Cursor-Semantics.md`.

---

@LAT20LON3 | created:1770646802 | updated:1770649832 | relates:references>@LAT30LON7

## Cursor policy
Limits for TTDB preview and node list sizes.

- kind: concept
- aliases: none
- notes: See `MyMentalPalaceDB.md` `cursor_policy`.

---

@LAT20LON0 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON16,references>@LAT0LON52

## Collision policy
TTDB rule for resolving ID collisions.

- kind: concept
- aliases: southeast_step
- notes: Defined in `RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md`.

---

@LAT20LON14 | created:1770646802 | updated:1770649832 | relates:defined_in>@LAT30LON2,references>@LAT10LON10

## Primitive mode
Reduced umwelt and verb set for constrained devices.

- kind: concept
- aliases: none
- notes: Defined in `standards/ttai/BEHAVIOR_SPEC.md`.

---

@LAT50LON1 | created:1770646802 | updated:1770649832 | relates:implemented_in>@LAT40LON1

## Monitor UI
The Tkinter application for viewing plan, log, and DB.

- kind: artifact
- aliases: TTE Monitor
- notes: Implemented in `tte_monitor.py`.

---

@LAT20LON10 | created:1770646802 | updated:1770649832 | relates:references>@LAT40LON0

## OpenAI API key
Environment variable required to run the agent.

- kind: concept
- aliases: OPENAI_API_KEY
- notes: Read by `tte_agent.py`.

---

@LAT20LON11 | created:1770646802 | updated:1770649832 | relates:used_in>@LAT40LON0

## OpenAI Responses API
The model execution interface used by the agent.

- kind: concept
- aliases: responses.create
- notes: Used in `tte_agent.py`.
