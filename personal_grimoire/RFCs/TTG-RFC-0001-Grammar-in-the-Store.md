# TTG-RFC-0001: Grammar in the Store

**Version:** 1.12
**Status:** Stable — implemented in the personal_grimoire reference runtime
**RFC Number:** 0001
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTDB-RFC-0001 (File Format), TTCP-RFC-0001 (Record Rendering)
**Author:** antfriend
**Created:** 2026-09-13

---

## 1. Abstract

A TTG store is a TTDB file that carries, alongside its data, the complete grammar needed to
read that data: the closed-class words of a language, its morphology, a seed list of verbs,
the algebra of the relations it reasons along, its question forms, every phrase its
librarian may say, and every constant its consolidator uses. A TTG runtime is a **generic
interpreter** of those blocks. This RFC defines the `ttdb-grammar` and `ttdb-sphere` fenced
blocks, the nine grammar kinds, and the runtime contract that makes the claim *the file IS
the grammar* testable.

---

## 2. The Runtime Contract

A conforming runtime:

1. **MUST NOT** contain any word of any natural language as data it matches input against —
   no function words, no affixes, no verb or noun lists, no relation names.
2. **MUST NOT** contain any phrase it emits as a reply. Where a reply key is absent from the
   store, the runtime emits the empty string, never a default of its own.
3. **MUST** refer to grammar only through schema keys: class keys (`det`, `cop`), role keys
   (`class_of`, `comention`), reply keys (`affirm`, `label_said`), number keys.
4. **MUST** read every constant from the `numbers` kind and the `ttdb-sphere` block; a number
   the store declares and the runtime never reads is a conformance failure.
5. **SHOULD** be tested by substitution: with the grammar records removed the runtime sees only
   word order; with another language's grammar records it reads that language.

Page chrome — button labels, error banners — is outside this contract, and a runtime SHOULD
keep such text in markup rather than in the interpreter.

---

## 3. `kind: lexicon`

| Key | Form | Meaning |
|---|---|---|
| `class` | `<class> \| <words>` | Membership. A word may be in several classes. |
| `whole` | `<token> \| <replacement words>` | Replaces a token outright before classification. |
| `contraction` | `<suffix> \| <replacement words>` | Splits a suffix off a token; the stem is kept. |
| `sentence_end`, `clause_break` | characters | Which punctuation ends a sentence or a clause. |
| `question_mark` | character | Marks a question. |
| `list_sep` | character | Survives tokenisation to separate coordinated noun phrases. |
| `generic_det` | words | Determiners that make a noun phrase generic (quantifier `*`). |
| `nounish_marks`, `verbish_marks` | two characters | The owner's brackets for a nounish and a verbish segment, open then close (TTG-RFC-0005 §4). |
| `head` | `last` or `first` | Which word of a phrase is its head; `last` when absent (TTG-RFC-0005 §3). |
| `question_order` | `subject_verb` or `verb_subject` | Where a question's verb stands: behind its subject, or before it; `subject_verb` when absent (TTG-RFC-0003 §4). |
| `modifier` | `drop` or `subclass` | What a phrase's other content words do: dropped, or a subclass of its head; `drop` when absent (TTG-RFC-0005 §3). |
| `privative` | words | Modifiers that make no subclass `class_of` (TTG-RFC-0005 §3). |
| `aside_marks` | two characters | The owner's brackets for words left out of a reading, open then close (TTG-RFC-0005 §4). |
| `object_mark` | words | Prepositions that mark a verb's thing rather than a place (Spanish *a*), except after a `motion` verb (TTG-RFC-0005 §2–§3). |
| `pro_verb` | words | The words a question puts in a verb's place (*do*, *hacer*): *What did Pixel do to the napkin?* asks for the verb (TTG-RFC-0003 §4, TTG-RFC-0006 §7.4). |
| `pro_verb_object` | words | The prepositions that mark the pro-verb's thing (*to*, *a*), dropped so the thing is its object. |

Class keys the runtime interprets: `det`, `poss`, `quant_all`, `quant_some`, `quant_none`,
`self`, `anaphor`, `prep`, `conj`, `subord`, `aux`, `cop`, `hav`, `modal`, `neg`, `wh`,
`adverb`, `filler`, `relative`, `infinitive`, `alt`, `premod` (the last four, TTG-RFC-0005 §2–§3). A token in no class is a **content word**.

---

## 4. `kind: morphology`

| Key | Form | Meaning |
|---|---|---|
| `noun_irregular`, `verb_irregular` | `<forms> \| <lemma>` | Checked first. |
| `noun_keep` | words | Never reduced. |
| `plural`, `verb` | `<ending> \| <replacement> \| <alternatives>` | Suffix rules, first match wins. `-` is empty; `~` undoubles the final consonant. |
| `plural_guard`, `verb_guard` | endings | A word ending in one of these is not reduced by that rule set. |
| `progressive_ending`, `participle_ending` | endings | Which verb-rule endings mark a progressive or a participle. |
| `double_keep` | letters | Final doubles that `~` leaves alone. |
| `stem_restore` | `<what a stem takes back> \| <endings>`, any number | Stem endings no lemma ends bare on (English `e \| v c dg u az ez iz oz uz`): a stem with one takes back what its rule offers (*shoved* is *shove*). |
| `min_stem` | integer | Shortest stem a rule may leave. |
| `bare_ending` | endings | Endings a bare verb form wears (Spanish *ar er ir*); absent, a bare form is its lemma (TTG-RFC-0005 §3). |
| `bare_finite` | `plural`, `self`, or `-` | The subjects a bare form is also finite for (English *cats eat*, *I eat*); `-` for none; absent, any (TTG-RFC-0005 §3). |
| `adverb_ending`, `adverb_guard` | endings; words | An unlisted word with the ending, between a thing and its verb, is an adverb; the guard lists words that only look like one (TTG-RFC-0005 §2). |
| `self_ending`, `self_form` | endings; words | The speaker's own verb forms, in a language that drops subjects; a subjectless predicate in one has the speaker as subject (TTG-RFC-0005 §3). |
| `plural_verb_ending` | ending | The ending a verb wears for a plural subject (Spanish *n*), by which a question tells a subject behind its verb (TTG-RFC-0003 §4); absent, a subject never stands behind its verb. |
| `past_ending`, `past_form` | endings; words | What makes a predicate past: an ending on an inflected verb, or a word among its own (TTG-RFC-0005 §3). |

Candidate choice (normative order): a candidate that is already a term in the store; then a
candidate in `seed`; then, for `~`, the undoubled stem if the stem really ends in a double
outside `double_keep`; then, where the stem ends in one of a `stem_restore` line's endings
and the rule offers the stem with that line's addition as a candidate, that candidate; then
the first candidate. So an unknown *shoved* is *shove*, while *walked* stays *walk* and *hopped*
is *hop*.

---

## 5. `kind: seed`

`seed: <verb lemmas>` — repeated as needed. A head start for predicate detection only.
A word the owner has used as a verb is recognised as a VECTOR term regardless of this list.

`stance: <verb lemmas>` — seeds whose complement clause the speaker does not assert
(*think*, *doubt*, *say*); what such a verb takes is held (TTG-RFC-0005 §3).

`chain: <verb lemmas>` — seeds that take a thing and then a bare verb that thing does (*see*,
*make*, *let*: *saw the cat eat*); inside a relative, a bare verb after one goes on with the
relative (TTG-RFC-0005 §3). A head start: the owner's own sentences add to it.

`stance_noun: <noun lemmas>` — nouns whose clause is held, as a stance verb's is (*the idea
that cats bark*). Not seeds (TTG-RFC-0005 §3).

`motion: <verb lemmas>` — seeds that go somewhere; after one, an `object_mark` word is a
preposition of place (*va a Madrid*), after any other it marks the verb's thing
(TTG-RFC-0005 §2).

`intransitive: <verb lemmas>` — seeds that take no thing, so a relative's gap is never their
object (*the rule that cats bark*); the corpus can say the same of any verb, and outranks the
list (TTG-RFC-0005 §3).

---

## 6. `kind: vectors`

| Key | Form | Meaning |
|---|---|---|
| `role` | `<role> \| <vector name or token>` | Binds a structural role to a name. |
| `vector` | `<name> \| <flags> \| <inverse or -> \| <label>` | Algebra and display label. |
| `inherits` | vector names | Vectors along which beliefs flow downward. |
| `phrase` | `<words> \| <vector>` | A multi-word complement that names a vector. |
| `label` | `<vector> \| <label>` | Renames a declared vector for display; how a later language names the first's (§11). |

Roles: `class_of`, `property`, `possession`, `comention`, `episode_edge`, `negation_prefix`,
`phrasal_join`, `amend_edge`. `phrasal_join` also binds words into one term (TTG-RFC-0005 §4). Flags: `transitive`, `symmetric`, `weak`, `exclusive`. A vector not declared
here has no algebra. `weak` vectors are never walked and never consolidate. Along an
`exclusive` vector a subject holds one object at a time, and a later saying retires an earlier
one (TTG-RFC-0004 §3).

---

## 7. `kind: questions`

`wh_thing` (words asking for a thing), `wh_place` (`<words> | <vector> [| <preposition>]`: the
place vector, and the preposition that asks for it where that is not the vector's own name —
Spanish `dónde | in | en`), `wh_reason`,
`about` (words that request a description), `describe_max_words` (integer). The shapes these
words fill are defined in TTG-RFC-0003 §4.

---

## 8. `kind: responses`

`<key>: <phrase with {slots}>`, and `unit_<noun>: <singular> | <plural>`. Keys the runtime
emits: `label_said`, `label_inferred`, `label_contested`, `label_superseded`, `label_carried` (a bounded store only, TTG-RFC-0003 §2.1), `superseded_by`,
`affirm`, `deny`, `affirm_inferred`, `deny_inferred`, `deny_superseded`, `contest`, `unknown`,
`exception`, `no_purchase`, `noted`, `noted_nothing`, `noted_mention`, `noted_held`, `noted_readings`,
`reading_pair`, `asked_held`, `asked_readings`, `asked_holds`, `changed_tense`, `trajectory_crossing`, `trajectory_alternation`, `read_by`, `read_by_is_a`, `construction_contested`, `vectors_head`, `amended`, `amend_title`, `contradicts`, `supersedes`, `describe_head`, `describe_empty`, `points_here`, `mentioned_with`,
`objects_head`, `subjects_head`, `nothing_found`, `search_head`, `suggest`, `ingested`,
`episode_title`, `source_typed`, `store_opened`; units `percept`, `sentence`, `term`, `episode`.

---

## 9. `kind: numbers` and `ttdb-sphere`

`numbers`: `prior_for`, `prior_against`, `weight_partial`, `belief_conf_threshold`,
`inherit_decay`, `max_hops`, `answer_max_items`, `search_max_items`, `suggest_eps_min`,
`with_max_pairs`, `said_max_chars`, `rule_max_body`, `phrase_max_words`, `frame_min_episodes`,
`frame_grammar_weight`, `frame_preempt_ratio`, `modifier_max_words`, `construction_max_words`,
`trajectory_min_episodes`, `trajectory_hold`.

`kind: rules` holds `rule:` lines; its syntax, safety conditions and derivation are defined in
TTG-RFC-0003 §3.1.

`kind: constructions` holds `construction:` lines, each a shape in the lexicon's marks paired
with the percepts a clause of that shape says; their syntax, matching and safety conditions are
defined in TTG-RFC-0006. A store that declares none reads as if the kind did not exist.

`ttdb-sphere` (on the Home record): `thing_lon`, `vector_lon`, `term_lat` (each `lo hi`),
`adjacent` (`lo hi` degrees), `step`, `episode_lane`, `amend_lane`, `self_lemma`.

---

## 10. Embedding Surface

A runtime that is meant to be embedded **SHOULD** describe its own surface inside the store, as
a blueprint record, so that a developer — or a development agent — given only the store can
host the runtime without reading its source. The reference store does this at `@LAT85LON0`.
That record MUST name:

1. **Where the engine is** and how to obtain it without starting a user interface, including
   any condition that gates start-up;
2. **The lifecycle calls** — open a store, answer an input, ingest a file, serialise the
   store, empty the corpus — with what each returns and what each mutates;
3. **The store object and the reply**, to the depth a host needs to render grounds by kind;
4. **Every convention the page relies on** that a host could break: how chrome text is kept out
   of the interpreter, how records are addressed from markup, where the store is persisted, and
   what the page reads from its URL.

The runtime **MUST** take time as an argument rather than read a clock, and **MUST NOT** perform
storage or network access inside the engine; persistence belongs to the host. A test **SHOULD**
check that every public name the surface record lists exists in the runtime and that every
public name the runtime exports is listed.

The surface record describes an implementation, not the grammar: it is exempt from §2's
substitution test, and a store for another language keeps it unchanged.

---

## 11. Several Languages

A store MAY hold grammars for several languages.

1. **Membership.** A grammar record's language is its `lang:` value. A record with no `lang:`
   belongs to the first language declared in file order.
2. **Borrowing.** A later language supplies whole kinds. A kind it does not supply is taken
   from the first language. `numbers` and `rules` are always the first language's.
   `constructions` are never borrowed: they hold words, so a language that declares none has
   none (TTG-RFC-0006 §5).
3. **One algebra.** A later language MUST NOT change roles, vector flags, inverses or
   `inherits`; the runtime takes all of them from the first language. A later language's
   `vectors` record contributes only `phrase:` lines and `label: <vector> | <label>` lines.
   Every language therefore reasons along the same edges, and a question in one walks
   sayings in another.
4. **Choice.** Each sentence is perceived under the grammar that recognises the most of its
   tokens — a token counts when it is in one of that grammar's classes, is an irregular form,
   or lemmatises to a seed verb. A tie, or no recognised token, goes to the first language.
   A whole input chooses the same way for its intent and its reply, so a question is answered
   in its own language while every quote stays in the language it was said in.
5. **Terms are not translated.** A lemma is a term whatever language produced it. Two words
   for one thing are two terms until the owner relates them.
6. **Parameters.** Most of what a second language changes is a handful of switches, each a
   key its grammar declares; the runtime holds the principle and the store sets the
   parameter. A key left out takes the value under *absent*.

   | Parameter | Key | Absent | Reference English | Reference Spanish |
   |---|---|---|---|---|
   | Which word heads a phrase | `head` (§3) | `last` | `last` | `first` |
   | Where a question's verb stands | `question_order` (§3) | `subject_verb` | `subject_verb` | `verb_subject` |
   | A subject told behind its verb by agreement | `plural_verb_ending` (§4) | — | — | `n` |
   | The speaker's own subject dropped | `self_ending`, `self_form` (§4) | — | — | `o é í`; `soy estoy voy …` |
   | The subjects a bare verb is finite for | `bare_finite` (§4) | any | `plural self` | `-` |
   | A word that marks a verb's object | `object_mark` (§3) | — | — | `a` |
   | What a phrase's modifiers do | `modifier` (§3) | `drop` | `drop` | `drop` |

   A store SHOULD carry this table where its grammar is documented, and a conforming test
   suite SHOULD hold every cell to the grammar records; the reference store carries it in its
   Blueprint 2.

Merging two languages into one lexicon is not equivalent: a word that is closed-class in both
with different classes (*a*, *no* across English and Spanish) changes how sentences in both
languages parse.

---

## 12. Compatibility

Both fence tags are unknown to TTCP-RFC-0001 and are silently skipped by generic viewers
(§3). Unknown keys inside a block MUST be ignored. Within one language, several records MAY
carry blocks of the same kind: their entries merge in file order, rule lists append, and a
scalar (`min_stem`, `question_mark`, `describe_max_words`) is the last record's.

---

## 13. Open Questions

1. **Word order.** Only subject–verb–object is interpretable. An `order:` key would let a
   store declare SOV or VSO; the clause parser would need a second shape, not new words.
   Spanish verb-first questions (*¿Dónde duerme Pixel?*) are the first case in the store.
2. **Linking words across languages.** A rule links vectors (`cazar X Y => chase X Y`,
   TTG-RFC-0003 §3.1) and `is_a` links terms, one direction and one pair at a time. A store-wide
   translation table would need its own kind.
3. **Grammar revision.** Episodes are perceived under the grammar of their day. A re-reading
   (TTG-RFC-0005 §5.1) reports every sentence a changed grammar reads differently, under a
   hash of the grammar records, and writes nothing: an amendment is the owner's, so a new
   reading stands only when the owner takes it, and an amendment that takes one names the
   grammar it came from. Whether a grammar should carry a version beside its hash, so a
   report can say which change moved which sentence, is open.

---

## 14. Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Initial draft, from the personal_grimoire reference implementation |
| 2026-09-13 | §10 Embedding Surface added, after a third-party embedding reported which facts it had to take from the page and README instead of the store. §10–12 renumbered to §11–13. |
| 2026-09-13 | §11 Several Languages added; the reference store carries Spanish beside English. `label:` in §6; progressive and participle endings become lists in §4; rule lists append (§12). Former open question 2 answered; §11–13 renumbered to §12–14. |
| 2026-09-14 | `kind: rules` (defined in TTG-RFC-0003 §3.1) and `rule_max_body` in §9; rules are shared like numbers (§11); open question 2 narrowed. |
| 2026-09-14 | The `exclusive` flag in §6 and four reply keys in §8, for supersession (TTG-RFC-0004 §3). |
| 2026-09-21 | For shapes and amendments (TTG-RFC-0005): the `relative` and `infinitive` classes and the two mark keys in §3, the `amend_edge` role in §6, three reply keys in §8, `phrase_max_words` and `amend_lane` in §9. |
| 2026-09-21 | For held sayings and head position (TTG-RFC-0005 0.2): the `alt` and `premod` classes and the `head` key in §3, `stance` in §5, `noted_held` in §8. |
| 2026-09-21 | `aside_marks` in §3 (TTG-RFC-0005 0.3). |
| 2026-09-22 | `chain` in §5 (TTG-RFC-0005 0.4); open question 3 narrowed by re-reading. |
| 2026-09-22 | `object_mark` in §3, `bare_ending` and `bare_finite` in §4, `stance_noun` and `motion` in §5 (TTG-RFC-0005 0.5); open question 3 narrowed again. |
| 2026-09-22 | `adverb_ending`, `adverb_guard`, `self_ending` and `self_form` in §4, `intransitive` in §5 (TTG-RFC-0005 0.6). |
| 2026-09-22 | §5: `chain` and `intransitive` are head starts the owner's words outrank; four reply keys in §8 for readings and held sayings (TTG-RFC-0005 0.7). |
| 2026-09-22 | 1.0: stable. Implemented in full by the personal_grimoire reference runtime and checked by its tests; the open questions stand as open. |
| 2026-11-23 | 1.1: `asked_holds` joins the keys the runtime emits (TTG-RFC-0005 1.1 §3). No other change. |
| 2026-11-23 | 1.2: the three frame numbers join `kind: numbers` in §9 (TTG-RFC-0005 1.2 §3). No other change. |
| 2026-11-23 | 1.3: `past_ending` and `past_form` in §4, and `changed_tense` among the reply keys (TTG-RFC-0005 1.3 §3, TTG-RFC-0004 1.1 §3.7). No other change. |
| 2026-11-23 | 1.4: `modifier` and `privative` in §3, `modifier_max_words` in §9 (TTG-RFC-0005 1.4 §3). No other change. |
| 2026-11-23 | 1.5: §11.6, the parameters table; `question_order` in §3 and `plural_verb_ending` in §4 (the latter read by the reference runtime since TTG-RFC-0005 0.5, and listed here for the first time); `wh_place`'s optional preposition in §7. Implemented by the personal_grimoire reference runtime (antfriend.github.io `bf261e8`), from its PLAN.md phase 5. |
| 2026-11-24 | 1.6: the ninth grammar kind, `constructions` (TTG-RFC-0006), in §1 and §9; `construction_max_words` in §9; `read_by` among the reply keys in §8; constructions are never borrowed (§11.2). Implemented by the personal_grimoire reference runtime (antfriend.github.io `ea1bc58`), from its PLAN.md phase 6. |
| 2026-11-24 | 1.7: `read_by_is_a` joins the reply keys in §8 (TTG-RFC-0006 0.2 §4). No other change. Implemented by the personal_grimoire reference runtime (antfriend.github.io `8a1d9e2`). |
| 2026-11-24 | 1.8: `construction_contested` joins the reply keys in §8 (TTG-RFC-0006 0.3 §4). No other change. Implemented by the personal_grimoire reference runtime (antfriend.github.io `fd6ef4a`). |
| 2026-11-24 | 1.9: `pro_verb` and `pro_verb_object` in §3, `vectors_head` among the reply keys in §8 (TTG-RFC-0006 0.9 §7.4). No other change. Implemented by the personal_grimoire reference runtime (antfriend.github.io `f7352e6`). |
| 2026-11-25 | 1.10: `stem_restore` in §4, the stem endings no lemma ends bare on, and its place in the candidate order: after the undoubled stem, before the first candidate. Implemented by the personal_grimoire reference runtime (antfriend.github.io `56e14c0`). |
| 2026-11-25 | 1.11: `trajectory_crossing`, `trajectory_alternation` and the `episode` unit in §8; `trajectory_min_episodes` and `trajectory_hold` in §9 — the shape of the sayings (TTG-RFC-0003 1.15 §4). A store that declares no `trajectory_min_episodes` replies as before. Implemented by the personal_grimoire reference runtime (antfriend.github.io `e2e02bf`). |
| 2026-11-25 | 1.12: `label_carried` among the reply keys in §8, emitted only by a bounded store (TTG-RFC-0003 1.16 §2.1). No other change. |

*License: CC0*
