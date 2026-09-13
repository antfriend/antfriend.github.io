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
blocks, the seven grammar kinds, and the runtime contract that makes the claim *the file IS
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

Class keys the runtime interprets: `det`, `poss`, `quant_all`, `quant_some`, `quant_none`,
`self`, `anaphor`, `prep`, `conj`, `subord`, `aux`, `cop`, `hav`, `modal`, `neg`, `wh`,
`adverb`, `filler`. A token in no class is a **content word**.

---

## 4. `kind: morphology`

| Key | Form | Meaning |
|---|---|---|
| `noun_irregular`, `verb_irregular` | `<forms> \| <lemma>` | Checked first. |
| `noun_keep` | words | Never reduced. |
| `plural`, `verb` | `<ending> \| <replacement> \| <alternatives>` | Suffix rules, first match wins. `-` is empty; `~` undoubles the final consonant. |
| `plural_guard`, `verb_guard` | endings | A word ending in one of these is not reduced by that rule set. |
| `progressive_ending`, `participle_ending` | ending | Which verb-rule endings mark a progressive or a participle. |
| `double_keep` | letters | Final doubles that `~` leaves alone. |
| `min_stem` | integer | Shortest stem a rule may leave. |

Candidate choice (normative order): a candidate that is already a term in the store; then a
candidate in `seed`; then, for `~`, the undoubled stem if the stem really ends in a double
outside `double_keep`; then the first candidate.

---

## 5. `kind: seed`

`seed: <verb lemmas>` — repeated as needed. A head start for predicate detection only.
A word the owner has used as a verb is recognised as a VECTOR term regardless of this list.

---

## 6. `kind: vectors`

| Key | Form | Meaning |
|---|---|---|
| `role` | `<role> \| <vector name or token>` | Binds a structural role to a name. |
| `vector` | `<name> \| <flags> \| <inverse or -> \| <label>` | Algebra and display label. |
| `inherits` | vector names | Vectors along which beliefs flow downward. |
| `phrase` | `<words> \| <vector>` | A multi-word complement that names a vector. |

Roles: `class_of`, `property`, `possession`, `comention`, `episode_edge`, `negation_prefix`,
`phrasal_join`. Flags: `transitive`, `symmetric`, `weak`. A vector not declared here has no
algebra. `weak` vectors are never walked and never consolidate.

---

## 7. `kind: questions`

`wh_thing` (words asking for a thing), `wh_place` (`<words> | <vector>`), `wh_reason`,
`about` (words that request a description), `describe_max_words` (integer). The shapes these
words fill are defined in TTG-RFC-0003 §4.

---

## 8. `kind: responses`

`<key>: <phrase with {slots}>`, and `unit_<noun>: <singular> | <plural>`. Keys the runtime
emits: `label_said`, `label_inferred`, `label_contested`, `affirm`, `deny`, `affirm_inferred`,
`deny_inferred`, `contest`, `unknown`, `exception`, `no_purchase`, `noted`, `noted_nothing`,
`contradicts`, `describe_head`, `describe_empty`, `points_here`, `mentioned_with`,
`objects_head`, `subjects_head`, `nothing_found`, `search_head`, `suggest`, `ingested`,
`episode_title`, `source_typed`, `store_opened`; units `percept`, `sentence`, `term`.

---

## 9. `kind: numbers` and `ttdb-sphere`

`numbers`: `prior_for`, `prior_against`, `weight_partial`, `belief_conf_threshold`,
`inherit_decay`, `max_hops`, `answer_max_items`, `search_max_items`, `suggest_eps_min`,
`with_max_pairs`, `said_max_chars`.

`ttdb-sphere` (on the Home record): `thing_lon`, `vector_lon`, `term_lat` (each `lo hi`),
`adjacent` (`lo hi` degrees), `step`, `episode_lane`, `self_lemma`.

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

## 11. Compatibility

Both fence tags are unknown to TTCP-RFC-0001 and are silently skipped by generic viewers
(§3). Unknown keys inside a block MUST be ignored. Several records MAY carry blocks of the
same kind; their entries merge in file order.

---

## 12. Open Questions

1. **Word order.** Only subject–verb–object is interpretable. An `order:` key would let a
   store declare SOV or VSO; the clause parser would need a second shape, not new words.
2. **Multiple languages in one store.** `lang:` is recorded but unused. A store holding two
   grammars would need a per-episode language and per-term language.
3. **Grammar revision.** Episodes are perceived under the grammar of their day. Whether a
   grammar change should re-perceive old episodes, and how that is recorded, is open.

---

## 13. Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Initial draft, from the personal_grammar reference implementation |
| 2026-09-13 | §10 Embedding Surface added, after a third-party embedding reported which facts it had to take from the page and README instead of the store. §10–12 renumbered to §11–13. |

*License: CC0*
