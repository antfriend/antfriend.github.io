# RFC Index — Personal Grimoire

The subset of the [toot-toot-engineering](https://antfriend.github.io) RFC corpus this
project depends on, copied so the folder is self-contained, plus the five TTG RFCs it adds.
The TTG RFCs are stable (TTG-RFC-0004 §4 is still a proposal); they are written upstream and
synced here, and every copy in this folder matches its upstream version. Read them in this order.

## What this project adds — Toot Toot Grammar (TTG)

| RFC | Version | Title | What it defines |
|---|---|---|---|
| [TTG-RFC-0001](TTG-RFC-0001-Grammar-in-the-Store.md) | 1.5 | Grammar in the Store | The `ttdb-grammar` and `ttdb-sphere` blocks, the eight grammar kinds and their keys, the embedding surface, several languages in one store, the **parameters** a second language sets (§11.6), and the **runtime contract**: no natural-language word or reply phrase in the interpreter. |
| [TTG-RFC-0002](TTG-RFC-0002-Semantic-Percepts.md) | 1.6 | Semantic Percepts, Episodes and Terms | Reading, nounish/verbish classification, the percept line, episode and term records — with the `holds:`, `gap:` and `tense:` lines beside an episode's percepts and a verb's `frames:` line — placement on the grammar sphere (`southeast_step`), and byte-stable write-back. |
| [TTG-RFC-0003](TTG-RFC-0003-Beliefs-Reasoning-Response.md) | 1.5 | Beliefs, Vector Reasoning and Grounded Response | Consolidation (the rule of succession over episodes, a saying the owner's tense changed left uncounted), vector algebra, Datalog-style rules over vectors (§3.1), inference with specificity, purchase, intents — including questions whose verb comes before its subject — the kinds of ground, and the notes a reply adds. |
| [TTG-RFC-0004](TTG-RFC-0004-Time-and-the-Fleet.md) | 1.1 | Time — the Order of Sayings, Supersession, and a Fleet's Shared Clock | The order of sayings, `exclusive` vectors whose later sayings retire earlier ones, the `superseded` ground, a change in the owner's own tense told from a contradiction (§3.7); and, proposed, how a fleet of agents orders sayings on a shared pulse. |
| [TTG-RFC-0005](TTG-RFC-0005-Shapes-and-Amendments.md) | 1.5 | Shapes — Alternating Segments, Lists, Mentions and Amendments | A clause as any alternating run of nounish and verbish segments, each verb relating its neighbours; lists as one segment; relative clauses that close; one-word mentions; held sayings — what *or* joins, a stance verb or noun takes, a relative word reports, a hedge word holds, or a sentence the grammar reads two ways says, never believed, keeping their polarity — and each stance linked to what it holds; the two readings of one sentence named, so a question sees one saying and the owner can choose; bare verbs that go on with a relative's chain, and chain verbs learned from the owner's words; what a verb takes, counted in episodes with the grammar's guesses at a gap apart; the past marked; modifiers as subclasses of a phrase's head, off by default; the shape notation the owner overrules a reading with; amendments kept beside the episode, and re-readings that report a grammar change without writing until the owner takes one, in order, each in the context the sentences before it stand as. |

The store compresses these into nine blueprint records up the prime meridian; each carries
a `src:` line naming the section it expands to (TTN-RFC-0004 applied to the spec itself).
The ninth, the runtime's surface, expands to TTG-RFC-0001 §10, and Blueprint 2 carries the
parameters table of TTG-RFC-0001 §11.6, which the test suite holds to the grammars.

## The format — what a store *is*

| RFC | Version | Title | Why it is here |
|---|---|---|---|
| [TTDB-RFC-0001](TTDB-RFC-0001-File-Format.md) | 1.0 | File Format and Sections | Three zones, the record header, and §5 *preserve unknown content* — which the writer's byte-stable rule implements. |
| [TTDB-RFC-0002](TTDB-RFC-0002-Cursor-Semantics.md) | 1.0 | Cursor Semantics | `last_query`, `last_answer`, `answer_records`: a Q/A store finally uses all of them. |
| [TTDB-RFC-0003](TTDB-RFC-0003-Typed-Edges.md) | 1.2 | Typed Edge Semantics | Edge types are free tokens, so the owner's own verbs can be them. `contradicts` vs `opposes` (§7) is why a contested belief draws no edge at all. |
| [TTDB-RFC-0004](TTDB-RFC-0004-Event-ID-and-Collision.md) | 1.1 | Event ID and Collision | Immutable IDs and `southeast_step` (§3, latitude +step, longitude +step), used for term placement. |
| [TTDB-RFC-0005](TTDB-RFC-0005-Epistemic-Weight.md) | 1.1 | Toot-Bit Epistemic Weight | `conf` / `rev` / `sal` / `touched` and EPS — which decides what the librarian asks the owner about. |
| [TTDB-RFC-0006](TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md) | 1.0 | Experiential Perception as Synthetic Model | *The edge is the datum.* A verb is a vector. TTG-RFC-0002 §4 states where percepts diverge from before/after pairs. |
| [TTDB-RFC-0007](TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md) | 0.2 | Locus Point and Dream Cycle | Episodic → semantic consolidation and the 128 formation threshold, made deterministic for text. |

## The viewer — what rendering a store *means*

| RFC | Version | Title | Why it is here |
|---|---|---|---|
| [TTCP-RFC-0001](TTCP-RFC-0001-Record-Rendering.md) | 1.0 | Record Rendering | Unknown fences are skipped (so the grammar blocks are invisible to generic viewers), §8 the special record, §11 weights display, §12 dead edges. |
| [TTCP-RFC-0002](TTCP-RFC-0002-Globe-and-Navigation.md) | 1.0 | Globe and Navigation | The sphere: projection, drag, tap selection, rotation to the selected record. |
| [TTCP-RFC-0003](TTCP-RFC-0003-Link-System-and-Addressability.md) | 1.0 | Link System and Addressability | Record tokens (`lat10lon0`) used for in-store links, and §6 search over the term list. |
| [TTN-RFC-0004](TTN-RFC-0004-Semantic-Compression.md) | 1.0 | Semantic Compression | The `src:` convention by which every blueprint record names its deterministic expansion. |

## The fleet — agents that share a clock

| RFC | Version | Title | Why it is here |
|---|---|---|---|
| [TTN-RFC-0010](TTN-RFC-0010-Fleet-Pulse.md) | 1.0 | Fleet Pulse — Self-Synchronizing Heartbeat and the Band Time-Base | The chart, conductor election, drift-paced beacons and `scene_id`, adopted unchanged by TTG-RFC-0004 §4 as a fleet's time-base. |

## Referenced but not copied

- **TTN-RFC-0007, TTN-RFC-0008, TTN-RFC-0009** *(Reliable Delivery, Time-Sync, TTDB Push-Back)* — the
  delivery, clock-offset and belief-distribution machinery TTG-RFC-0004 §4 leans on. Upstream.
- **TTDB-RFC-0010** *(Stigmergic Fields, Lane Discipline and Record Identity)* — the corpus
  lane allocation (90 timeline, 98 belief, 99 fixture) that this store uses directly, and that
  global_models could not. Upstream.
