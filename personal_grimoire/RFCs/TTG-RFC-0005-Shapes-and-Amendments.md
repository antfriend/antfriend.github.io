# TTG-RFC-0005: Shapes — Alternating Segments, Lists, Mentions and Amendments

**Version:** 0.2
**Status:** Draft
**RFC Number:** 0005
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0001, TTG-RFC-0002, TTG-RFC-0003, TTDB-RFC-0001, TTDB-RFC-0004
**Author:** antfriend
**Created:** 2026-09-21

---

## 1. Abstract

TTG-RFC-0002 read a clause as one pattern, subject–verb–object, over single terms. This RFC
generalises it: a clause is **any alternating run of nounish and verbish segments** — `N`,
`V`, `N V`, `V N`, `N V N`, `N V N V N`, … — where a segment is a whole phrase or a list, and
each verbish segment relates the nounish segments either side of it. *Subject–verb–object is
still a shape; it is one of many.*

The result of reading a sentence is its **shape**, written into the episode beside the words
in the owner's own notation. Because every labelling of words into segments is a valid
shape, the owner can overrule any reading: mark a span nounish or verbish, or bind words
into one term, before a sentence is written or after. A correction to a sentence already
said is an **amendment**: kept beside the episode, never in it.

A sentence of one segment is allowed. Said as a statement it is a **mention**: the term is
recorded and counted, and nothing is believed about it. An unknown lone word is nounish.

Not everything a sentence says is asserted. A relative clause closes at the next verb, which
returns to the thing the clause was about. What a list joined by *or* says, and the clause a
stance verb such as *doubt* takes, is **held**: written with polarity `?`, seen and searched,
never believed (§3).

---

## 2. Segments

Every token of a sentence receives one label:

| Label | Meaning |
|---|---|
| `N` | nounish: part of a nounish segment |
| `V` | verbish: part of a verbish segment |
| `L` | a link that ends a clause: punctuation other than `list_sep`, a `subord` word, a `filler` word, or a `conj` whose both sides are clauses (TTG-RFC-0002 §2) |
| `C` | a `conj` between a nounish segment and a verbish one: a new clause that **inherits the subject** (*cats chase mice and eat cheese*) |
| `R` | a `relative` word between a nounish segment and a verbish one: a link the chain passes through (*mice that eat cheese*). A word that is both `relative` and `subord` (*que*) is `R` there and `L` anywhere else |

Within each clause, tokens are labelled left to right. The six predicate rules of
TTG-RFC-0002 §3 decide where a verbish segment **begins**, now applied at every position
rather than once per clause:

1. an `aux` or `modal` token begins one, and carries through a following `cop`, `hav` or
   content word;
2. a `cop` token begins one: a following progressive is its verb; else a declared `phrase:`
   after optional `det`/`quant` words, or a `prep`, joins it (*is part of*, *is in*);
3. a `hav` token begins one: a following participle or irregular form is its verb;
4. a content word whose verb lemma is a VECTOR term or a seed, once a nounish segment has
   begun, not straight after a phrase starter or `prep`;
5. under the same position rule, a content word straight before a phrase starter, or wearing
   `participle_ending`;
6. with no structural word in the clause at all, the middle of exactly three content words.

A verbish segment then **continues** through a `prep` that opens a noun phrase (the phrasal
verb, *live in houses*) and through an `infinitive` marker before a verb (*want to eat*). An
infinitive marker also *begins* one after a nounish segment (*taught me to bake*). The verb
after the marker must be followed by a thing, or be a verb the owner already uses, so *went
to work* stays `go_to | work`.

**The alternation is the constraint.** A content word straight after a verbish segment is
nounish, however verb-like it is (*like fly fishing*). A second verbish segment in one clause
needs a cue — a `relative` word before it, a `conj`, a noun phrase after it, or a `stance`
verb before it (*I think cats bark*) — so *I had a good drink* is `[i] {had} [a good drink]`,
not a drink that does something.

A `stance` verb that opens its clause is verbish when a phrase starter, a `self` or
`anaphor` word, or a `subord` or `relative` word follows it: *Suppose it rains*, *Creo que…*.
Otherwise it is read like any other word, so *Hope is good* is about hope.

A `conj` or `list_sep` between two verbish segments makes one verbish **list** (*fly, swim
and sing*); between nounish ones, one nounish list (*cats, dogs and ferrets*). `neg` and
`adverb` words belong to the verb beside them, else to the thing after them.

Two segments of one kind side by side are one segment. So **any labelling is a valid
shape**, which is what lets the owner relabel freely (§4).

A sentence whose only content word the corpus knows as a VECTOR and not as a THING is
verbish; any other lone word is nounish.

---

## 3. Reading a Shape

A clause is a sequence of segments `S0 S1 … Sk`. Each verbish segment `Si` reads its
neighbours:

- **subject**: the members of `S(i−1)` if it is nounish; for the first verbish segment of a
  `C` clause, the subject inherited; otherwise **unstated**, written `-`;
- **object**: the members of `S(i+1)` if it is nounish; otherwise none, written `-`.

So `N1 V1 N2 V2 N3` is the chain `(N1 V1 N2)` and `(N2 V2 N3)`: *I saw the man eat cheese*
is `self see man` and `man eat cheese`. This is TTDB-RFC-0006's before→after transition read
literally, one link per verb.

**Members.** A nounish segment is read with the noun phrases of TTG-RFC-0002 §3. Before the
first verbish segment every non-prepositional phrase is a member (a subject list); after it,
the leading run of phrases is (an object list), and a segment that opens with a `prep`
phrase has none. Prepositional phrases are **adjuncts**: each is a `comention` of the
segment's first member, or of the subject if it has none. A member's head is its last word,
or its first where the lexicon declares `head: first`; a `premod` word opens a phrase like a
determiner and is never its head (*dos gatos* is `gato`). Its term is the head's noun lemma,
and it keeps its own quantifier and its own `neg` (*I like cats but not dogs* is `self like
cat +` and `self like dog -`).

**Predicates.** A verbish segment is a list of items split at `conj` and `list_sep`; every
item takes the segment's subject and object. An item is a sequence of predicates, split
where an `aux`, `modal`, `cop` or `hav` follows a verb (*cats that hunt are fast* is `cat hunt
-` and `cat has_property fast`); only the last predicate takes the object. A predicate's
vector is, in order:

1. a declared `phrase:` after a `cop` (and optional `det`/`quant`) → its vector;
2. `cop` + `prep` → the prep;
3. `cop` alone → `class_of` or `property` per object, as in TTG-RFC-0002 §4;
4. `hav` alone → the `possession` role;
5. otherwise its content words, as verb lemmas, and its particles (`prep`, `infinitive`) after
   the first, joined by `phrasal_join`: `sleep_in`, `move_to`, `want_to_eat`. `aux`, `modal`,
   `neg` and `adverb` words never name a vector.

Polarity is `-` when the predicate, the subject member or the object member carries a `neg`,
or the subject a `quant_none`; the quantifier is the subject member's.

**Relative clauses close.** A verbish segment reached through an `R` link takes the
antecedent as subject, as above. The next verbish segment after that clause's object is the
antecedent's again, not the object's: *cats that chase mice are fast* is `cat chase mouse`
and `cat has_property fast`. Nested relatives close together, back to the outermost
antecedent (*cats that chase mice that eat cheese are fast*).

**Stance.** A seed record may list `stance:` verbs: those whose complement is a clause the
speaker does not assert (*think*, *doubt*, *hope*, *say*). When a stance verb's segment is
followed by a nounish segment and then a verbish one, the stance verb takes the clause, not
the thing: its own percept has no object, and every percept of the segments after it is
held. *I doubt cats like fish* is `self doubt - +` and `cat like fish ?`. A clause that ends
on a stance verb holds the clause after it when a `subord` word joins them: *I wonder if cats
bark*. A stance verb with only a thing after it is an ordinary verb (*I believe you*).

**Alternatives.** A list joined by an `alt` word (*or*) says one of its members, not each.
Every percept whose subject list, object list or verb list contains one is held, and so is
every percept of the clauses either side of an `alt` word that joins clauses: *Pixel is a cat
or a dog* is `pixel is_a cat ?` and `pixel is_a dog ?`. Subjects carry this into a clause
that inherits them.

**Held.** A percept with polarity `?` is **held**: said, and not asserted. Like a mention it
names terms, creates them if new, counts toward `seen` and is searchable; it never
consolidates into a belief, never contradicts one, and a reply names it apart from the
grounds (`noted_held`). A question still checks it: *Is Pixel a cat or a dog?* asks after
both.

**Mentions.** A percept whose subject or vector is `-` is a **mention**:

```
percept: 1 | coffee | - | - | + | -         Coffee.
percept: 1 | - | swim | - | + | -           Swim.
percept: 1 | - | feed | cat | + | -         Feed the cat.
```

A mention counts toward `seen` for the terms it names, creates them if new, and is
searchable; it never consolidates into a belief, and a question never checks one. A sentence
that forms no percept and no comention, and names exactly one thing, is a mention of that
thing. This extends TTG-RFC-0002 §5.1: `-` is a well-formed subject or vector.

---

## 4. The Owner's Reading

**Shape notation.** A shape is the sentence's tokens (lowercased, contractions expanded, as
tokenised) with each nounish segment inside the lexicon's `nounish_marks` and each verbish
one inside its `verbish_marks`; links stand bare:

```
[cats] {chase} [mice] but [they] {do not eat} [grass].
[pixel] {chases} [mice] that {eat} [cheese].
[birds] {fly, swim and sing}.
```

The marks are declared per language, two characters each, open then close. A store that
declares none writes no shapes. The reference store uses `[ ]` and `{ }`: angle brackets
would be stripped from fed files as HTML (TTG-RFC-0002 §2).

**Marks in input.** Marks typed into the input force the tokens between them nounish or
verbish; the parser labels everything else. Marks never reach the `said:` line.

**Binding.** Two words joined by `phrasal_join` (`ice_cream`) are one token, and so one term.
A run of up to `phrase_max_words` unmarked content words that already names a term — a THING
whose lemma contains the join, or a VECTOR — is bound the same way, so once the owner has
bound *ice cream* the words find it unmarked. Inside marks the owner's reading stands and
only an explicit join binds; that is what makes a shape read back to itself. In a `said:`
line a join between two words is written as a space.

**Round trip.** Reading a sentence's shape as input MUST reproduce the same shape and the
same percepts. A runtime SHOULD test this over its parse cases.

**Before a sentence is written**, the owner may relabel its shape: a host passes one shape
per sentence with the text, the percepts come from those shapes, and the episode records
them. **After**, a relabelled shape is an amendment (§5).

**Episode records.** An episode written under this RFC carries one line per sentence that
has a shape, between its `said:` and `percept:` lines:

```
said: 1 | Birds can fly and swim.
shape: 1 | [birds] {can fly and swim}.
percept: 1 | bird | fly | - | + | -
percept: 1 | bird | swim | - | + | -
```

An episode written before it has none; its shapes are recomputed from the words when needed.

---

## 5. Amendments

An episode is never rewritten (TTG-RFC-0002 §5.1). A correction to how one of its sentences
was read is an **amendment**:

```
@LAT<amend_lane>LON<episode ordinal> | created | updated | relates:<amend_edge>@<episode>

**<amend_title>**

```ttdb-amend
shape: <n> | <shape>
percept: <n> | <subject> | <vector> | <object or -> | <+, - or ?> | <quantifier>
```
```

- **One record per episode**, on `amend_lane` at the episode's longitude, so `@LAT91LON7`
  amends `@LAT90LON7`. It holds, for each sentence it amends, the shape that stands and the
  percepts that shape reads as. It is managed: amending again rewrites it in place and
  advances `updated`. Reading a sentence back the episode's own way removes its entry; an
  amendment with no entries is deleted.
- **Consolidation** takes an amended sentence's percepts from the amendment instead of the
  episode, attributed to the episode and sentence they amend. Counting (episodes, not
  sentences), order (TTG-RFC-0004 §2) and quotes are therefore the saying's own. A malformed
  amendment line is skipped and counted like an episode's, and still stands in for the
  sentence it amends.
- **Context.** The sentence is re-read after the sentences before it in the episode, each as
  it now reads, so its pronouns resolve as they did.
- **Start empty** deletes the amend lane with the episode lane.
- New terms an amendment names are placed as a tell's are. Terms it no longer names keep
  their records, with the lower `seen` the replay gives them.

An amendment answers as a tell does: the `amended` verdict, then the grounds its percepts
form, then anything it disagrees with or retires.

---

## 6. Grammar Keys

| Kind | Key | Meaning |
|---|---|---|
| `lexicon` | `class: relative` | Words that link a nounish segment to the verbish one after it. |
| `lexicon` | `class: infinitive` | A marker that carries a verb on or begins one (*to*). |
| `lexicon` | `nounish_marks`, `verbish_marks` | Two characters each: open, close. |
| `lexicon` | `class: alt` | Words that join alternatives (*or*); what they join is held. |
| `lexicon` | `class: premod` | Words that open a phrase and are never its head, for a head-first language (*dos*, *buen*). |
| `lexicon` | `head` | `last` (the default) or `first`: which word of a phrase is its head. |
| `seed` | `stance` | Verb lemmas whose clause is held; each is also a seed. |
| `vectors` | `role: amend_edge` | The header edge type from an amendment to its episode. |
| `numbers` | `phrase_max_words` | Longest run of words bound to a known term. |
| `ttdb-sphere` | `amend_lane` | The latitude amendments sit on. |
| `responses` | `noted_mention`, `amended`, `amend_title` | A mention's verdict, an amendment's verdict, an amendment's title. |
| `responses` | `noted_held` | A note naming what a tell held, `{triples}`. |

A later language may declare its own marks, classes, `head` and `stance` verbs; it borrows
the role, the number and the lane like the rest (TTG-RFC-0001 §11). Merging two lexicons
merges their `head` too, which is one more reason they are kept apart.

---

## 7. Compatibility

A store without the keys of §6 reads as before, except that the percept rules of §3 apply to
every clause. A runtime that predates this RFC MUST ignore `shape:` lines in episodes (unknown
block keys, TTG-RFC-0001 §12) and the `ttdb-amend` fence (TTCP-RFC-0001 §3), and will read a
mention as a belief about the term `-` and a held percept as malformed; stores carrying
mentions, held percepts or amendments need a runtime that implements this RFC. The published bAbI outcomes (tasks 1 and 15, every condition)
are unchanged under the reference runtime.

---

## 8. Open Questions

1. **Deeper nesting.** A stance verb inside a relative clause (*the man that says cats bark is
   tall*) holds the main clause with it, and an object relative (*the dog that the cat
   chased*) is not read as a relative at all. Both want a segment inside a segment; the
   notation has room for it.
2. **Scope.** *Pixel is not a cat or a dog* denies both, and is only held. Negation over an
   alternative, and a stance over a negation, need a scope the flat percept does not carry.
3. **Unholding.** The owner can relabel segments but cannot yet say that a held clause was
   meant as fact (*I think cats bark*, said as a hedge). A mark for it, or a held entry an
   amendment may flip, would do.
4. **Re-reading the corpus.** A grammar change could write an amendment for every sentence
   whose shape it changes, with a grammar hash per amendment, making grammar revision
   (TTG-RFC-0001 §13.3) auditable.

---

## 9. Changelog

| Date | Change |
|---|---|
| 2026-09-21 | Initial draft, from the personal_grimoire reference implementation |
| 2026-09-21 | 0.2: relative clauses close at the next verb; `stance` verbs and `alt` lists hold what they introduce (polarity `?`); `head` and `premod` put a phrase's head where the language does; a `relative` word outranks `subord` in relative position. Open questions 1–4 of 0.1 answered or narrowed. |

*License: CC0*
