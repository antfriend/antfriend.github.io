# TTG-RFC-0002: Semantic Percepts, Episodes and Terms

**Version:** 0.1
**Status:** Draft
**RFC Number:** 0002
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0001, TTDB-RFC-0001, TTDB-RFC-0003, TTDB-RFC-0004, TTDB-RFC-0005, TTDB-RFC-0006
**Author:** antfriend
**Created:** 2026-09-13

---

## 1. Abstract

This RFC defines how text becomes stored meaning in a TTG store: how input is read into
sentences and tokens, how tokens are classified as **nounish** (THING) or **verbish**
(VECTOR), how a clause becomes a **percept**, how percepts are kept in append-only
**episode** records, how every lemma becomes a **term** record placed on the grammar sphere,
and how a runtime writes the store back without disturbing anything it does not manage.

It applies TTDB-RFC-0006 to language. A verb is a directed relation between two things, so
the owner's verbs become the store's edge types, and the edge is the datum.

---

## 2. Reading

- Input is either one typed line or one whole file; either is **one episode**.
- A file containing a line that is exactly an opening `mmpdb` fence is a store, and MUST NOT
  be read as words.
- File cleaning (structural only): fenced code, inline code, images, HTML tags and URLs are
  removed; a link keeps its label; heading marks, list markers, emphasis and table pipes are
  removed; headings, list items and table rows each end a sentence.
- Sentences end at a `sentence_end` character followed by whitespace or end of text, and at
  blank lines. Line wraps inside a paragraph join with a space.
- Tokens are lowercase runs of letters and digits with inner apostrophes, plus the
  `list_sep`, `clause_break` and `sentence_end` characters. `whole` replacements apply, then
  `contraction` splits.
- Clauses split at `clause_break` characters and `subord` words. A `conj` word splits a
  clause only when the left side has a predicate and the right side both starts with a
  subject and has a predicate.

---

## 3. Classification

A token in any lexicon class is a function word; otherwise it is a content word with a noun
lemma and a verb lemma (TTG-RFC-0001 §4).

A noun phrase is an optional `det`/`poss`/`quant_*` run followed by content words; its head
is the last content word. A `prep` token makes the following noun phrase a prepositional
phrase. A `self` token is a one-word noun phrase whose head is `self_lemma`; an `anaphor`
token is one whose head is the most recent non-self subject head in the episode (else the
most recent object head), and which is dropped when there is none.

The predicate is the first of:

1. a content word after an `aux`/`modal` token, skipping `neg`/`adverb` (a `cop` or `hav`
   token there defers to rules 2–3);
2. a `cop` token: a following content word whose verb rule ending is `progressive_ending` is
   the verb, otherwise the clause is a **copula**;
3. a `hav` token: a following participle or irregular form is the verb, otherwise the clause
   is **possession**;
4. a content word, after a noun phrase has begun and not directly after a phrase starter or
   `prep`, whose verb lemma is a VECTOR term or a seed;
5. under the same position rule, a content word directly followed by a phrase starter, or
   whose verb rule ending is `participle_ending`;
6. exactly three content words and no function words: the middle one.

Two bare content words are never a clause.

TTG-RFC-0005 §2 applies these rules at every position, not once per clause: a clause is any
alternating run of nounish and verbish segments, and each rule decides where a verbish
segment begins.

---

## 4. Percepts

```
percept: <sentence> | <subject> | <vector> | <object or -> | <+ or -> | <*, ~ or ->
```

- **Subjects** are the heads of the non-prepositional noun phrases before the predicate.
  A clause whose subject is a coordinated verb (*fly and swim*) inherits the subjects.
- **Verb clause**: vector = verb lemma. If a `prep` directly follows the verb and heads the
  first noun phrase, vector = verb lemma + `phrasal_join` + prep. Objects are the leading
  run of noun phrases after the predicate. No object → `-`.
- **Possession**: vector = the `possession` role.
- **Copula**: a `phrase` at the start of the complement (after determiners) names the
  vector; else a `prep` names it; else each complement noun phrase is a **class** (`class_of`)
  when it has a determiner or quantifier, when its plural rule changed it, or when its head is
  already the subject of a belief — and a **property** (`property`) otherwise.
- **Polarity** `-` when a `neg` token or a `quant_none` phrase is in the clause.
- **Quantifier** `~` for `quant_some`; `*` for `quant_all`, `quant_none` or `generic_det`.
- **Comentions**: prepositional phrases after the object (or before the predicate) pair with
  the object (or subject) head; a sentence with no percept pairs adjacent heads. At most
  `with_max_pairs` per sentence, as `comention`-role percepts with polarity `+`.
- Identical percepts within a sentence are written once.

TTG-RFC-0005 §3 reads longer shapes as a chain — each verbish segment relates the nounish
segments either side of it — and defines **mentions**: a percept whose subject or vector is
`-`, counted and searchable, never believed.

**Divergence from TTDB-RFC-0006, stated.** The pair is subject→object, not before→after, and
an intransitive percept has no second endpoint. It is kept (object `-`), and its belief edge
points at the vector's own record. Every percept carries its agent context: the owner is the
umwelt and the episode names the source.

---

## 5. Records

### 5.1 Episode

```
@LAT<episode_lane>LON<ordinal> | created:<t> | updated:<t> | relates:<episode_edge>@<term>,...

**<episode_title>**

```ttdb-episode
source: <file name, or source_typed>
at: <t>
said: <n> | <sentence, cut at said_max_chars>
shape: <n> | <the sentence's shape, TTG-RFC-0005 §4>
percept: ...
```
```

Every sentence gets a `said` line whether or not it yields a percept, and, when the grammar
declares marks, a `shape` line. The ordinal is one more
than the largest existing longitude in the lane. An episode MUST NOT be modified after it is
written. A consumer MUST skip, count and report malformed percept lines: fewer than six
columns, a non-integer sentence, an empty subject, vector or object, or a polarity other than
`+`/`-`. A subject or vector of `-` is well-formed: it is a mention (TTG-RFC-0005 §3). A
correction to how a sentence was read is an amendment, kept beside the episode on
`amend_lane` (TTG-RFC-0005 §5).

**Only the lane is the owner's words.** An episode is a `ttdb-episode` block on a record whose
latitude is `episode_lane`. A block of the same tag anywhere else — a conformance fixture, a
quoted example — MUST still be checked for malformed lines, and MUST NOT contribute `said`
lines to quotes or search, percepts to beliefs, mentions to `seen`, or itself to an episode
count. Removing the lane (*Start empty*) and reading it MUST agree on what an episode is.

### 5.2 Term

```
@LAT<lat>LON<lon> | created | updated | relates:<belief edges>
[ew] conf rev sal touched [/ew]

**<lemma>**

<owner prose, preserved>

```ttdb-term
class: thing | vector
lemma: <lemma>
forms: <surface forms, space separated, in order first seen>
seen: <percept mentions>
asked: <queries that found purchase>
belief: <vector> | <object or -> | <+ - ?> | <for> <against> | <conf>
```
```

Belief lines appear on THING records only, in order of first percept. Header edges are the
decided beliefs: `<negation_prefix if -><vector>@<object record>`, or `@<vector record>` when
the object is `-`. `[ew]`: `conf` = rounded mean conf of the record's beliefs (for a vector,
of beliefs along it), 128 with none; `sal` = min(255, seen + asked); `rev` += 1 when the
belief lines change; `touched` = time of the last rewrite. `updated` advances when the block
changes other than `asked`.

---

## 6. Placement and Writing

**Placement** happens once. For a new THING whose partner in a non-comention percept already
has a record: offset latitude and longitude from the partner by a magnitude in `adjacent`
(chosen by FNV-1a of `lemma~` and `lemma~~`, in `step` increments, sign from bit 20), clamped
to `term_lat` and `thing_lon`. Otherwise: latitude from FNV-1a(`lemma`) and longitude from
FNV-1a(`lemma#`), each modulo the number of `step` positions in its band. VECTOR terms always
hash, inside `vector_lon`. Collisions: `southeast_step` (latitude −step, longitude +step,
wrapping inside the bands). Coordinates are written with as many decimals as `step` has.

**Writing.**

1. A chunk is the text between `---` rules. Chunks without a term or episode block are never
   rewritten.
2. A term chunk is rewritten only when its block, edges, `asked`, conf or sal would change,
   or it was touched by the current episode. Only the header's `updated` and `relates`, the
   `[ew]` block and the `ttdb-term` fence change; `relates` is written last in the header.
3. New chunks are inserted before the first chunk whose latitude is ≥ 98 or ≤ −90, in
   creation order: new terms first, then the episode.
4. The cursor block's `selected`, `preview`, `last_query`, `last_answer` (cut at
   `max_reply_chars`) and `answer_records` are rewritten after every answer; `agent_note` is
   kept verbatim.
5. Line endings are normalised to LF on read. Parsing a store and serialising it with no
   changes MUST reproduce it byte for byte.

---

## 7. Open Questions

1. **Re-perception.** When the grammar improves, old episodes still hold the percepts of the
   old grammar. The amendment (TTG-RFC-0005 §5) is the record a re-reading writes, with its
   `amend_edge` to the episode; a grammar hash per amendment would make a grammar-driven
   re-reading auditable.
2. **Modifiers.** Attributive adjectives are dropped. Emitting them as `property` percepts
   would be cheap and wrong for compounds (*house cat*).
3. **Placement drift.** Adjacency clusters terms by the order meaning arrived, which is not
   the order it would settle into. A Dream Cycle projection (TTDB-RFC-0007 §3.3) could
   propose moves as `revises` records without breaking ID immutability.

---

## 8. Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Initial draft |
| 2026-09-13 | §5.1: only episode blocks on `episode_lane` are the owner's words. The reference runtime had quoted the fixture's sentence in search; found by a third-party embedding's review. |
| 2026-09-21 | §3–§4 generalised by TTG-RFC-0005 (shapes); §5.1 gains the `shape:` line, mentions and amendments; §7.1 answered by amendments. |

*License: CC0*
