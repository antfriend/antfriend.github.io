# RFC Index — Personal Grimoire

The subset of the [toot-toot-engineering](https://antfriend.github.io) RFC corpus this
project depends on, copied so the folder is self-contained, plus the five drafts it adds.
Read them in this order.

## What this project adds — Toot Toot Grammar (TTG)

| RFC | Title | What it defines |
|---|---|---|
| [TTG-RFC-0001](TTG-RFC-0001-Grammar-in-the-Store.md) | Grammar in the Store | The `ttdb-grammar` and `ttdb-sphere` blocks, the eight grammar kinds, and the **runtime contract**: no natural-language word or reply phrase in the interpreter. |
| [TTG-RFC-0002](TTG-RFC-0002-Semantic-Percepts.md) | Semantic Percepts, Episodes and Terms | Reading, nounish/verbish classification, the percept line, episode and term records, placement on the grammar sphere, and byte-stable write-back. |
| [TTG-RFC-0003](TTG-RFC-0003-Beliefs-Reasoning-Response.md) | Beliefs, Vector Reasoning and Grounded Response | Consolidation (the rule of succession over episodes), vector algebra, Datalog-style rules over vectors (§3.1), inference with specificity, purchase, intents, and the kinds of ground. |
| [TTG-RFC-0004](TTG-RFC-0004-Time-and-the-Fleet.md) | Time — the Order of Sayings, Supersession, and a Fleet's Shared Clock | The order of sayings, `exclusive` vectors whose later sayings retire earlier ones, the `superseded` ground; and, proposed, how a fleet of agents orders sayings on a shared pulse. |
| [TTG-RFC-0005](TTG-RFC-0005-Shapes-and-Amendments.md) | Shapes — Alternating Segments, Lists, Mentions and Amendments | A clause as any alternating run of nounish and verbish segments, each verb relating its neighbours; lists as one segment; relative clauses that close; one-word mentions; held sayings — what *or* joins, a stance verb or noun takes or a relative word reports, never believed, keeping their polarity; bare verbs that go on with a relative's chain; the shape notation the owner overrules a reading with; amendments kept beside the episode, and re-readings that report a grammar change without writing until the owner takes one. |

The store compresses these into nine blueprint records up the prime meridian; each carries
a `src:` line naming the section it expands to (TTN-RFC-0004 applied to the spec itself).
The ninth, the runtime's surface, expands to TTG-RFC-0001 §10.

## The format — what a store *is*

| RFC | Title | Why it is here |
|---|---|---|
| [TTDB-RFC-0001](TTDB-RFC-0001-File-Format.md) | File Format and Sections | Three zones, the record header, and §5 *preserve unknown content* — which the writer's byte-stable rule implements. |
| [TTDB-RFC-0002](TTDB-RFC-0002-Cursor-Semantics.md) | Cursor Semantics | `last_query`, `last_answer`, `answer_records`: a Q/A store finally uses all of them. |
| [TTDB-RFC-0003](TTDB-RFC-0003-Typed-Edges.md) | Typed Edge Semantics | Edge types are free tokens, so the owner's own verbs can be them. `contradicts` vs `opposes` (§7) is why a contested belief draws no edge at all. |
| [TTDB-RFC-0004](TTDB-RFC-0004-Event-ID-and-Collision.md) | Event ID and Collision | Immutable IDs and `southeast_step`, used for term placement. |
| [TTDB-RFC-0005](TTDB-RFC-0005-Epistemic-Weight.md) | Toot-Bit Epistemic Weight | `conf` / `rev` / `sal` / `touched` and EPS — which decides what the librarian asks the owner about. |
| [TTDB-RFC-0006](TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md) | Experiential Perception as Synthetic Model | *The edge is the datum.* A verb is a vector. TTG-RFC-0002 §4 states where percepts diverge from before/after pairs. |
| [TTDB-RFC-0007](TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md) | Locus Point and Dream Cycle | Episodic → semantic consolidation and the 128 formation threshold, made deterministic for text. |

## The viewer — what rendering a store *means*

| RFC | Title | Why it is here |
|---|---|---|
| [TTCP-RFC-0001](TTCP-RFC-0001-Record-Rendering.md) | Record Rendering | Unknown fences are skipped (so the grammar blocks are invisible to generic viewers), §8 the special record, §11 weights display, §12 dead edges. |
| [TTCP-RFC-0002](TTCP-RFC-0002-Globe-and-Navigation.md) | Globe and Navigation | The sphere: projection, drag, tap selection, rotation to the selected record. |
| [TTCP-RFC-0003](TTCP-RFC-0003-Link-System-and-Addressability.md) | Link System and Addressability | Record tokens (`lat10lon0`) used for in-store links, and §6 search over the term list. |
| [TTN-RFC-0004](TTN-RFC-0004-Semantic-Compression.md) | Semantic Compression | The `src:` convention by which every blueprint record names its deterministic expansion. |

## The fleet — agents that share a clock

| RFC | Title | Why it is here |
|---|---|---|
| [TTN-RFC-0010](TTN-RFC-0010-Fleet-Pulse.md) | Fleet Pulse — Self-Synchronizing Heartbeat and the Band Time-Base | The chart, conductor election, drift-paced beacons and `scene_id`, adopted unchanged by TTG-RFC-0004 §4 as a fleet's time-base. |

## Referenced but not copied

- **TTN-RFC-0007, TTN-RFC-0008, TTN-RFC-0009** *(Reliable Delivery, Time-Sync, TTDB Push-Back)* — the
  delivery, clock-offset and belief-distribution machinery TTG-RFC-0004 §4 leans on. Upstream.
- **TTDB-RFC-0010** *(Stigmergic Fields, Lane Discipline and Record Identity)* — the corpus
  lane allocation (90 timeline, 98 belief, 99 fixture) that this store uses directly, and that
  global_models could not. Upstream.
