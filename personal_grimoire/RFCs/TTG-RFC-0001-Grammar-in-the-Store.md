# TTG-RFC-0001: Grammar in the Store

**Version:** 0.1
**Status:** Draft
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
blocks, the eight grammar kinds, and the runtime contract that makes the claim *the file IS
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
| `aside_marks` | two characters | The owner's brackets for words left out of a reading, open then close (TTG-RFC-0005 §4). |

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
| `min_stem` | integer | Shortest stem a rule may leave. |

Candidate choice (normative order): a candidate that is already a term in the store; then a
candidate in `seed`; then, for `~`, the undoubled stem if the stem really ends in a double
outside `double_keep`; then the first candidate.

---

## 5. `kind: seed`

`seed: <verb lemmas>` — repeated as needed. A head start for predicate detection only.
A word the owner has used as a verb is recognised as a VECTOR term regardless of this list.

`stance: <verb lemmas>` — seeds whose complement clause the speaker does not assert
(*think*, *doubt*, *say*); what such a verb takes is held (TTG-RFC-0005 §3).

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

`wh_thing` (words asking for a thing), `wh_place` (`<words> | <vector>`), `wh_reason`,
`about` (words that request a description), `describe_max_words` (integer). The shapes these
words fill are defined in TTG-RFC-0003 §4.

---

## 8. `kind: responses`

`<key>: <phrase with {slots}>`, and `unit_<noun>: <singular> | <plural>`. Keys the runtime
emits: `label_said`, `label_inferred`, `label_contested`, `label_superseded`, `superseded_by`,
`affirm`, `deny`, `affirm_inferred`, `deny_inferred`, `deny_superseded`, `contest`, `unknown`,
`exception`, `no_purchase`, `noted`, `noted_nothing`, `noted_mention`, `noted_held`, `amended`, `amend_title`, `contradicts`, `supersedes`, `describe_head`, `describe_empty`, `points_here`, `mentioned_with`,
`objects_head`, `subjects_head`, `nothing_found`, `search_head`, `suggest`, `ingested`,
`episode_title`, `source_typed`, `store_opened`; units `percept`, `sentence`, `term`.

---

## 9. `kind: numbers` and `ttdb-sphere`

`numbers`: `prior_for`, `prior_against`, `weight_partial`, `belief_conf_threshold`,
`inherit_decay`, `max_hops`, `answer_max_items`, `search_max_items`, `suggest_eps_min`,
`with_max_pairs`, `said_max_chars`, `rule_max_body`, `phrase_max_words`.

`kind: rules` holds `rule:` lines; its syntax, safety conditions and derivation are defined in
TTG-RFC-0003 §3.1.

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
3. **Grammar revision.** Episodes are perceived under the grammar of their day. An amendment
   (TTG-RFC-0005 §5) is how a re-reading is recorded; whether a grammar change should write
   one for every sentence it reads differently is open.

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

*License: CC0*
