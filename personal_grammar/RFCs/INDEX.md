# RFC Index — Personal Grammar

The subset of the [toot-toot-engineering](https://antfriend.github.io) RFC corpus this
project depends on, copied so the folder is self-contained, plus the three drafts it adds.
Read them in this order.

## What this project adds — Toot Toot Grammar (TTG)

| RFC | Title | What it defines |
|---|---|---|
| [TTG-RFC-0001](TTG-RFC-0001-Grammar-in-the-Store.md) | Grammar in the Store | The `ttdb-grammar` and `ttdb-sphere` blocks, the seven grammar kinds, and the **runtime contract**: no natural-language word or reply phrase in the interpreter. |
| [TTG-RFC-0002](TTG-RFC-0002-Semantic-Percepts.md) | Semantic Percepts, Episodes and Terms | Reading, nounish/verbish classification, the percept line, episode and term records, placement on the grammar sphere, and byte-stable write-back. |
| [TTG-RFC-0003](TTG-RFC-0003-Beliefs-Reasoning-Response.md) | Beliefs, Vector Reasoning and Grounded Response | Consolidation (the rule of succession over episodes), vector algebra, inference with specificity, purchase, intents, and the three kinds of ground. |

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

## Referenced but not copied

- **TTDB-RFC-0010** *(Stigmergic Fields, Lane Discipline and Record Identity)* — the corpus
  lane allocation (90 timeline, 98 belief, 99 fixture) that this store uses directly, and that
  global_models could not. Upstream.
