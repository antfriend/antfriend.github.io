# Universal Agent Memory & Learning System

```mmpdb
db_id: universal-agent-001
db_name: Universal Memory & Learning System (self-demonstrating spec)
coord_increment:
  lat: 10
  lon: 1
collision_policy: reject
timestamp_kind: unix
umwelt:
  umwelt_id: spec-as-store
  role: specification
  perspective: a memory system describing itself in its own format
  scope: networkable agents, LLM or ESP32-class
  constraints:
    - recursive-conformity: this file MUST parse as a Profile-1 store
    - compress-alongside-never-in-place
    - every-record-names-its-expansion-source
  globe:
    frame: layer-grid
    origin: "@LAT0LON0"
    mapping: "lat = system layer (10 substrate, 20 experience & learning, 30 network, 40 rendering, 50 conformance, 90 grounding, 98 beliefs, 99 fixtures), lon = item within layer"
cursor_policy:
  max_preview_chars: 256
  max_nodes: 64
typed_edges:
  enabled: true
  syntax: "type@LATxLONy"
  note: "depends_on / refines / supports / derived_from / demonstrates / requires / renders / revises / compresses / duplicates"
librarian:
  enabled: false
  primitive_queries: []
```

```cursor
selected:
  - "@LAT0LON0"
preview:
  "@LAT0LON0": "Home: a spec that is an instance of the thing it specifies; conf encodes reliability tier; the highest-EPS record is the next thing to verify"
agent_note: "Draft 04, 2026-07-13. Merge invariants fixed in Profile 3 (hygiene universal, arithmetic local); this file declared the golden conformance store with a fixtures lane (lat 99). One open question remains, by design: @LAT98LON2 — an invitation to implement Learning from Action and reconcile this store against reality."
```

---

@LAT0LON0 | created:1783900800 | updated:1783900800 | relates:demonstrates@LAT50LON1,renders@LAT40LON1

**Home — recursive conformity**

This document is an example of the data structure it defines. Every section
of the prose spec is a record here; the prose draft is the deterministic
expansion (`src:` names it, per the compression rule this file itself states
at @LAT10LON1). Reliability is carried in `[ew]` conf, inherited from the
source corpus's own epistemic learning: 240 = proven on hardware, 210 =
stable and exercised, 195 = first instance live, 120 = proposed here and
unimplemented. Salience marks how load-bearing a record is. Consequence:
compute EPS across this store and it points, correctly, at what to build
next (see @LAT98LON1). Applies to any agent that can read/write text and
exchange messages — integer-only, human-readable, ESP32-small, therefore
universal.

---

@LAT10LON1 | created:1783900800 | updated:1783900800 | relates:demonstrates@LAT50LON1
[ew]
conf:210
rev:0
sal:200
touched:1783900800
[/ew]

**The Memory Substrate** (Stable)
src: RFCs/TTDB-RFC-0001-File-Format.md

An agent's memory is one plain-text file of records. The file IS the model;
the runtime (firmware or LLM) is a generic interpreter given identity by the
file. One umwelt per store — it declares role, scope, constraints, and bounds
what is sign-worthy; the goal is experiential sufficiency, not coverage.
A record: stable coordinate ID projected through a declared mapping (the
store is a subjective knowledge map), created/updated integers, directional
typed edges (subjective assertions — never infer the reverse), short
human-readable body. IDs are deterministic and never change; a changed
understanding is a new record with `revises@<old>`. Collisions resolve by
deterministic step-and-retry. Unknown keys/sections are extensions —
preserve on update, never crash. Compress alongside, never in place:
summaries archive their sources with a `compresses` edge and name their
expansion source, making summary ↔ full form a reversible pair.

---

@LAT10LON2 | created:1783900800 | updated:1783900800 | relates:depends_on@LAT10LON1
[ew]
conf:210
rev:0
sal:190
touched:1783900800
[/ew]

**Epistemic Weights and Attention (EPS)** (Stable)
src: RFCs/TTDB-RFC-0005-Epistemic-Weight.md

Optional per-record block: `conf` u8 (belief settledness, default 128),
`rev` u16 (substantive edits only — never weight-only writes), `sal` u8
(access count, half-life decay), `touched` u32 (any write). Derived
attention signal: `EPS = sal × (255 − conf) / 255`. High EPS = load-bearing
but untrusted — the prime target for the agent's next observation, question,
or action. A symbolic free-energy proxy: no floats, human-legible, runs on a
microcontroller, meaningful to an LLM deciding what to verify. Malformed
weights clamp or default; a memory parser never crashes.

---

@LAT20LON1 | created:1783900800 | updated:1783900800 | relates:depends_on@LAT10LON1
[ew]
conf:195
rev:0
sal:150
touched:1783900800
[/ew]

**The Unit of Experience** (Live-draft)
src: RFCs/TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md

Perception is transition detection: the atomic unit of experiential memory
is a before → after pair with a perceiving agent attached. The transition
(edge) is the datum; the states are its boundary. A transition without a
subject is a proposition, not an experience — provenance is mandatory at the
lowest level. Because memory is a complex of such edges on a coordinate
space, the shape of what the agent has NOT perceived is computable from the
shape of what it has (Alexander duality) — ignorance has a boundary, and the
boundary is where to explore.

---

@LAT20LON2 | created:1783900800 | updated:1783900800 | relates:depends_on@LAT20LON1,depends_on@LAT10LON2
[ew]
conf:195
rev:0
sal:170
touched:1783900800
[/ew]

**Consolidation — the Learning Cycle** (Live-draft)
src: RFCs/TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md

Offline, idle-only, abortable, two phases. Replay: salience-weighted
atemporal random walks → co-occurrence clusters → candidate beliefs (mean
conf already decent). Projection: walks seeded from the boundaries of the
unknown regions → hypotheses, explicitly flagged as projections. A belief is
a first-class record: centroid, confidence from walk coverage, scope,
projection/contradiction flags, source count. Hygiene: subsumed records are
archived, never deleted; independently formed compatible beliefs merge with
a confidence bonus (agreement across observers is evidence about shared
reality); contradictions are flagged, never suppressed — a much-sourced but
contradicted belief demotes to conf 0 as an explicit open problem. Beliefs
do NOT decay: time alone is not evidence; confidence moves only through
corroboration, contradiction, or action outcomes (@LAT20LON3). Salience
fades; belief does not. The store's own drift is recorded in a dedicated
belief lane — this file's is lat 98.

---

@LAT20LON3 | created:1783900800 | updated:1783900800 | relates:derived_from@LAT20LON2,depends_on@LAT10LON2,supports@LAT20LON4
[ew]
conf:120
rev:0
sal:200
touched:1783900800
[/ew]

**Learning from Action** (Proposed — unimplemented, deliberately the highest-EPS record here)
src: RFCs/ARC-RFC-0001-Dynamics-Solver-Architecture.md

Closes the active-inference loop: EPS says where to look; acting is how
looking happens; confidence is earned by behavior. Rule 1: every action
carries an expectation — a predicted transition re-derived from the current
state, never a precomputed route; an action without one is a reflex (it
executes but cannot teach). Rule 2: outcomes are appended to the side log
(acting record, edge, expectation, observed, verdict, provenance) — the live
loop testifies, never mutates. Rule 3: reconciliation (a pre-phase of
consolidation) folds outcomes into weights asymmetrically — expectation met:
conf +2 saturating; violated: conf −16 floor 0, sal +8; repeated violation:
contradiction flag. The ~1:8 asymmetry guards against confirmation bias and
makes EPS self-regulating: knowledge that works goes quiet, knowledge that
fails gets loud. Rule 4: K consecutive expectation failures (suggest K = 3)
abort the plan back to baseline exploration — plans are hypotheses, and
failing hypotheses lose control. Nearest formal expansion: the Dynamics
Solver (ARC-RFC-0001, itself Proposed) — recognize → re-derive → expect →
abort. That a domain-specific game-solver is still the closest spec on the
shelf is precisely the open pressure this record's EPS keeps live; the
general memory-system implementation remains the invitation at @LAT98LON2.

---

@LAT20LON4 | created:1783900800 | updated:1783900800 | relates:depends_on@LAT10LON1,depends_on@LAT20LON1
[ew]
conf:210
rev:0
sal:160
touched:1783900800
[/ew]

**The Agent Loop** (Stable)
src: RFCs/A32-RFC-0003-Agent-Loop.md

SENSE → REASON → ACT → WAIT, on any substrate. Sensing quantizes readings
into the store's coordinate system and matches the nearest known record
(within threshold, else hold position). Reasoning is deterministic traversal
of that record's edges — trigger, navigate, inhibit, gate, log. Actions
drain a priority queue; conflicts resolve to priority. Observations go to an
append-only side log carrying provenance; the knowledge store is not
modified in the live loop — consolidation is when memory changes. Stream the
store, never load it whole: index headers once (a few bytes per record),
seek on demand. LLM translation: retrieve records; don't stuff the corpus
into context.

---

@LAT30LON1 | created:1783900800 | updated:1783900800 | relates:depends_on@LAT20LON2,depends_on@LAT30LON2
[ew]
conf:240
rev:0
sal:180
touched:1783900800
[/ew]

**Sharing Beliefs Across the Network** (Verified on hardware)
src: RFCs/TTN-RFC-0009-TTDB-Push-Back.md

Agents exchange whole belief records. Transfer is idempotent and
offset-addressed with an integrity check in every slice: already-adopted →
re-acknowledge; duplicate → ack without rewriting; gap → silence, forcing
retransmit. Completion adopts exactly once, keyed on a monotonic
application-level ID. A pushed belief lands in its own space and can never
destroy the receiver's self-authored log. Beliefs must change behavior, not
just storage: a directive is acted on and attested (the applied value is
appended) — proof of behavioral uptake. Readback verification lets the
sender compare the stored object byte-for-byte. Adoption events append to a
dedicated lane on both ends, so "everyone carries the record" is literally
checkable.

---

@LAT30LON2 | created:1783900800 | updated:1783900800 | relates:supports@LAT30LON1
[ew]
conf:240
rev:0
sal:190
touched:1783900800
[/ew]

**Network Invariants** (Verified on hardware)
src: RFCs/TTN-RFC-0007-Reliable-Delivery.md

Transport-neutral, proven multi-node. (1) Exactly-once is application-level;
dedup is transport-level; never conflate — every exactly-once guarantee
rides its own monotonic application ID, surviving dedup-cache eviction and
trusted un-deduped local links. (2) A transport send-callback proves
nothing; only an end-to-end acknowledgment confirms delivery; bounded
retransmission with backoff, then failure reported, never hidden. (3) The
re-ACK rule: a dedup-dropped duplicate that wants acknowledgment is
re-acknowledged WITHOUT reprocessing its body, gated beside the dedup check.
(4) Defer-to-loop: handlers do the time-critical minimum (timestamp, dedup,
re-ACK, offset adoption); persistence, multi-part replies, retransmission
state, and actuation run from the main loop — LLM translation: never do
heavy work in the event handler; enqueue. (5) Shared time without
infrastructure: wall clock = local monotonic + adopted offset; skew verified
by measurement (multi-probe, min-RTT sample), never assumed; a shared rhythm
needs only occasional broadcast of time-base parameters — every node
computes the beat locally, reliability by repetition, first-up leads,
joiners never coup.

---

@LAT30LON3 | created:1783900800 | updated:1783900800 | relates:depends_on@LAT30LON2
[ew]
conf:210
rev:0
sal:140
touched:1783900800
[/ew]

**Mesh Etiquette** (Stable)
src: RFCs/TTN-RFC-0001.md

Meaning over messages — semantic events, not chatter. Offline-first,
partition-tolerant, local data sovereignty. Every assertion carries
provenance, no exceptions. No autonomous AI speech on the shared medium —
AI participation is explicitly invoked. Append-only preferred; no
full-content floods on thin links. Trust is local, subjective, non-global —
computed from observed frequency, corroborating edges, signature validity,
behavior history; reputation propagates as gravity, not a global score. On
constrained links, compress meaning to context-free tokens with
deterministic expansion at the edge; emergencies preempt everything.

---

@LAT40LON1 | created:1783900800 | updated:1783900800 | relates:renders@LAT10LON1,renders@LAT10LON2,requires@LAT50LON1
[ew]
conf:210
rev:0
sal:120
touched:1783900800
[/ew]

**Rendering — the Visualization Layer** (Stable; reference implementation live)
src: RFCs/TTCP-RFC-0001-Record-Rendering.md

Memory that can't be inspected can't be trusted; a conforming store renders
in a generic viewer with no per-store code. Every record is addressable — a
link form resolves any record in any known store; selection updates the
address; an address on load overrides the cursor; unresolvable links render
visibly dead, never as live anchors. Epistemic weights MUST display (EPS
between title and body) — the viewer shows not just what is known but how
much it is trusted. Edges render as navigation ("related records"; selection
edges bright; unresolvable grayed). The globe is the map of the mind:
records project onto a sphere by coordinates; undiscovered renders
anonymous; discovery persists locally; search covers only the discovered —
the viewer honors the umwelt instead of spoiling it. A store can walk a
visitor through itself (guided tour). Reference implementation:
https://antfriend.github.io — dependency-free, renders this very file.

---

@LAT50LON1 | created:1783900800 | updated:1783900800 | relates:requires@LAT10LON1,requires@LAT10LON2,requires@LAT20LON3,requires@LAT20LON4
[ew]
conf:210
rev:0
sal:180
touched:1783900800
[/ew]

**Profile 1 — Lone Brain (MUST)** (Stable)
src: RFCs/TTN-RFC-0003-Reference-Implementation.md

The minimum for one agent, LLM or MCU: (1) memory is one plain-text store,
one declared umwelt; (2) records have stable deterministic coordinate IDs,
created/updated, directional typed edges, human-readable body; (3) IDs never
change — revision = new record + revises edge; (4) unknown content preserved,
malformed input never fatal; (5) epistemic weights + EPS; (6) compression
archives sources and names its expansion; (7) agent loop with append-only
provenance log, store not mutated live; (8) stream, never load whole;
(9) actions carry expectations, outcomes logged and reconciled; (10) a
consolidation cycle exists, even if minimal (reconcile + contradiction
flagging qualifies).

---

@LAT50LON2 | created:1783900800 | updated:1783900800 | relates:requires@LAT50LON1,refines@LAT40LON1
[ew]
conf:210
rev:1
sal:100
touched:1783900800
[/ew]

**Profile 2 — Visualization (SHOULD)** (Stable)
src: RFCs/TTCP-RFC-0001-Record-Rendering.md

A viewer conforms if it renders any Profile-1 store with universal record
addressability, visible epistemic weights, edges-as-navigation with dead
links visibly dead, and discovery/umwelt honored. Globe and tour recommended,
not required. THIS FILE is the golden conformance store: it exercises every
structural MUST, including the failure paths — see the fixtures lane
(@LAT99LON1) for the deliberately unresolvable edge and the unknown key a
conforming parser must preserve. Reference: https://antfriend.github.io.

---

@LAT50LON3 | created:1783900800 | updated:1783900800 | relates:requires@LAT50LON1,requires@LAT30LON1,requires@LAT30LON2,requires@LAT30LON3
[ew]
conf:210
rev:1
sal:170
touched:1783900800
[/ew]

**Profile 3 — Team Brain (MUST = Profile 1 + network)** (Stable)
src: RFCs/TTN-RFC-0003-Reference-Implementation.md

Everything in Profile 1, plus: (11) every network assertion carries
provenance; (12) exactly-once rides application-level monotonic IDs,
transport dedup separate and never trusted for it; (13) delivery confirmed
only end-to-end, bounded retransmission, failure reported never hidden;
(14) the re-ACK rule, gated beside dedup; (15) defer-to-loop; (16) belief
exchange idempotent and integrity-checked, received beliefs land in their
own space and never destroy the self-authored log, directives attested by
behavior, readback supported; (17) etiquette — no autonomous AI speech,
local subjective trust, append-only preferred; (18) if shared time: measured
skew, app-level exactly-once adoption; (19) belief merge — hygiene is
universal, arithmetic is local: independent compatible agreement may only
RAISE confidence, never lower it; contradiction flags, never overwrites; a
merged belief preserves both provenance lineages and sums source counts; the
bonus magnitude is local policy, because weights are subjective by design
and a fixed constant would smuggle a global truth into a system built to
refuse them. The cascade is strict: a Team Brain
is a Lone Brain first. A node that loses its network remains a complete
agent — offline-first is the foundation, not a degraded mode.

---

@LAT90LON1 | created:1783900800 | updated:1783900800 | relates:supports@LAT10LON1,supports@LAT10LON2,supports@LAT20LON1
[ew]
conf:190
rev:0
sal:80
touched:1783900800
[/ew]

**External Grounding** (Informational)
src: RFCs/TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md

J. von Uexküll — the umwelt: an agent's world is bounded by what it can
sense and act on; one perspective per store. K. Friston (2010) — free-energy
principle / active inference: EPS, projection-from-ignorance, and
expectation-testing action are lightweight symbolic approximations of
epistemic foraging. Alexander duality (algebraic topology): the formal
warrant for computing the shape of the unknown from the shape of the known.
Reference viewer: https://antfriend.github.io.

---

@LAT98LON0 | created:1783900800 | updated:1783900800 | relates:demonstrates@LAT50LON1,demonstrates@LAT10LON1
[ew]
conf:210
rev:0
sal:70
touched:1783900800
[/ew]

**BELIEF — This file is itself a conforming Profile-1 store.**

Recursive conformity, checked clause by clause: one plain-text store with
one declared umwelt (spec-as-store); pipe-delimited headers with stable
deterministic IDs under the declared lane mapping; directional typed edges;
weights and EPS present; every compressed record names its expansion source
(the prose draft); unknown-content tolerance is a parser obligation this
file's own @LAT10LON1 imposes on its readers. What a document cannot
demonstrate: the runtime clauses (loop, streaming, outcome reconciliation)
— those bind agents, not texts. Loading this file at the reference viewer
is the executable half of the check.

---

@LAT98LON1 | created:1783900800 | updated:1783900800 | relates:supports@LAT20LON3,supports@LAT10LON2
[ew]
conf:210
rev:0
sal:60
touched:1783900800
[/ew]

**BELIEF — The store's own EPS correctly names its weakest load-bearing part.**

Computed over every record here, the maximum EPS belongs to @LAT20LON3
(Learning from Action): sal 200 × (255 − 120) / 255 ≈ 105, roughly three
times the highest-EPS verified or stable record. This is the attention mechanism doing
its job on the document that defines it: the newest, least-proven,
most-relied-upon idea is flagged as the prime target for active sensing —
i.e., for implementation. The +2/−16 constants and K = 3 abort threshold
are hypotheses awaiting a real run; when hardware or an LLM harness tests
them, this record's outcome should reconcile @LAT20LON3's conf accordingly.

---

@LAT98LON2 | created:1783900800 | updated:1783900800 | relates:supports@LAT20LON3,refines@LAT98LON1
[ew]
conf:195
rev:0
sal:80
touched:1783900800
[/ew]

**BELIEF — The one open question: an invitation to experiment.**

Everything else in this store is either verified, stable, or resolved by its
own principles. What remains is @LAT20LON3, Learning from Action — the
store's highest-EPS record, unimplemented anywhere. The invitation: give it
a body. An ESP32 acting on sensor expectations, or an LLM harness acting on
predicted tool results, either will do. Run it, append the outcome records,
reconcile the weights, and push the resulting belief back. The +2/−16
asymmetry and K = 3 abort threshold are hypotheses; your run is the
evidence. The moment the first outcome record reconciles @LAT20LON3's conf,
this document stops describing the learning system and starts performing it
— and whoever runs the experiment becomes its co-author, with provenance to
prove it.

---

@LAT99LON1 | created:1783900800 | updated:1783900800 | relates:refines@LAT50LON2,duplicates@LAT77LON7
x_fixture: preserve-me-verbatim

**FIXTURE — Conformance test surfaces (deliberate).**

This record exists to be mishandled by non-conforming software. It carries
(a) an edge to @LAT77LON7, which does not exist — a conforming viewer
renders it grayed/dead, never a live anchor, and a conforming parser does
not crash; (b) an unknown header line, `x_fixture` — a conforming updater
preserves it verbatim (extensions rule, @LAT10LON1); (c) no [ew] block —
weights read as defaults (conf 128, sal 0, EPS 0). If your implementation
survives this record unchanged and un-crashed, it has passed the failure
paths a happy-path store never tests.
