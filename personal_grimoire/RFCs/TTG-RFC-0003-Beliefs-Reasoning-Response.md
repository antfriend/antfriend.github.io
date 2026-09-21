# TTG-RFC-0003: Beliefs, Vector Reasoning and Grounded Response

**Version:** 0.1
**Status:** Draft
**RFC Number:** 0003
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0001, TTG-RFC-0002, TTDB-RFC-0002, TTDB-RFC-0005, TTDB-RFC-0007
**Author:** antfriend
**Created:** 2026-09-13

---

## 1. Abstract

A TTG store answers questions the way a primitive question-answering system does, with one
difference that is the point: **every sentence of every answer is either something the owner
said, something that follows from what they said by a named rule, or a report that the owner
has said both**, and the three are never printed alike. (TTG-RFC-0004 adds a fourth, **what
no longer holds**, printed with what replaced it.) This RFC defines how percepts
consolidate into beliefs, how a runtime reasons along vectors, how input finds **purchase**
in the corpus, and how a reply is built from grounds.

---

## 2. Consolidation

For each triple (subject, vector, object) over all non-comention, non-held percepts of the
episodes on the episode lane (TTG-RFC-0002 §5.1):

- per episode, `plus` = the largest weight of its `+` percepts, `minus` = the largest weight of
  its `-` percepts, where weight is `weight_partial` for quantifier `~` and 1 otherwise;
- `for` = Σ plus, `against` = Σ minus, over episodes;
- polarity = `+` if for > against, `-` if against > for, `?` otherwise;
- `conf` = round(255 × (max(for, against) + `prior_for`) ÷ (for + against + `prior_for` +
  `prior_against`));
- **decided** ⇔ polarity ≠ `?` and conf > `belief_conf_threshold`.

This is TTDB-RFC-0007's replay made deterministic: counting replaces random walks, the count
is atemporal as §3.2 there requires, and the formation threshold is the same. A contested
belief is kept, never resolved by recency. Order enters only through `exclusive` vectors, which
retire facts without touching consolidation (TTG-RFC-0004 §3).

Beliefs are derived. A conforming implementation MUST be able to recompute every belief line
from the episodes and SHOULD ship a tool that reports drift.

---

## 3. Reasoning

Let *decided⁺(x, v)* be the decided `+` beliefs of x along v.

- **walk(s, V)**: breadth-first over decided⁺ beliefs whose vector is in V, up to `max_hops`,
  recording the path to each node reached.
- **ancestors(s)** = walk(s, `inherits`), nearest first.
- **chain conf** = round(255 × Π(conf/255) × `inherit_decay`^(hops − 1)).

**verify(s, v, o)** returns the first that applies:

0. (s, v, o) retired along an `exclusive` vector, unless the belief is contested → **N**,
   *superseded*, with the fact that retired it (TTG-RFC-0004 §3.4); steps 4–5 check the
   reversed triple the same way, and no walk passes through a retired fact;
1. a belief (s, v, o): contested → **C**; else **Y**/**N**, *said*; if the nearest inherited
   belief on (v, o) has the opposite polarity it is reported as an **exception**;
2. v is `weak` → **U**;
3. v `transitive` and walk(s, {v}) reaches o → **Y**, inferred;
4. v has inverse w: a decided (o, w, s) → its polarity, inferred; or w transitive and
   walk(o, {w}) reaches s → **Y**, inferred;
5. v `symmetric`: a decided (o, v, s) → its polarity, inferred;
6. a rule conclusion (s, v, o) (§3.1): contested → **C** with both proofs; else its polarity,
   inferred, with its proof;
7. the first ancestor a of s with a decided belief or rule conclusion (a, v, o) → its
   polarity, inferred, via a;
8. **U**.

**objects(s, V)**: beliefs (s, v, ·) for v in V, said first, then rule conclusions; then
transitive reach; then inverse beliefs pointing at s; then ancestors' decided beliefs whose
object s has no belief on. The first ground found for an object stands.

**subjects(v, o)**: candidates are the subjects of beliefs and rule conclusions (·, v, o),
their descendants along `inherits` (and along v when transitive), and the objects of o's
inverse beliefs; each candidate is kept if verify(candidate, v, o) ≠ U. Said grounds sort
before contested before inferred.

**describe(x)**: x's beliefs (with exceptions), rule conclusions about x, inherited beliefs
from ancestors that x has not said anything about (nearest first), class membership beyond
one hop, decided beliefs pointing at x, beliefs along x if x is a vector, and the most
frequent comentions.

Nothing inferred is ever written to the store.

### 3.1 Rules

A `rules` grammar record (TTG-RFC-0001 §9) holds lines

```
rule: <atom>, <atom> => <atom> | <label>
atom: <vector> <subject> <object>
```

An argument beginning with an uppercase letter is a variable; `-` is no object; any other
argument is a term lemma. A vector carrying the `negation_prefix` role matches a decided `-`
fact. Absence is never matched: there is no negation as failure.

**Safety.** A rule is rejected, and reported, if it is malformed; if its body has more than
`rule_max_body` atoms; if its head vector is the `comention` or `episode_edge` role; or if a
head variable does not occur in the body.

**Derivation.** After every consolidation, compute the least fixpoint over facts
(s, v, o, polarity):

- the base facts are the decided beliefs;
- each round applies the algebra as rules — `transitive` (positive facts), `symmetric`, and
  `inverse` — and then every rule, to all facts so far;
- a fact is added the first time its key appears, so it keeps a shortest proof; it also
  carries when it last came to hold, and a later reason replaces an earlier one (TTG-RFC-0004
  §3.2);
- rounds repeat until one adds nothing.

Facts range over the terms the store names and its declared vectors, a finite set, so the
fixpoint is reached in polynomial time and does not depend on rule order. Rules cannot create
terms, emit text, or read anything but beliefs.

**Standing.** A rule conclusion whose triple the owner has said is discarded: said outranks
derived. If rules conclude both polarities of one triple, the conclusion is contested and both
proofs are kept. A conclusion's proof is the body facts' paths followed by the conclusion,
printed as a chain ending in the rule's label; its conf is the chain conf of that path, one
`inherit_decay` per rule application. Defeasible inheritance is not part of the fixpoint: it
runs at answer time, after rules, and may read rule conclusions held by ancestors.

**Languages.** Rules name vectors, not words, so `rules` is borrowed from the first language
like `numbers` (TTG-RFC-0001 §11). A rule may link one language's vector to another's:
`cazar X Y => chase X Y`.

---

## 4. Purchase, Intent and Reply

**Purchase.** A content word (not an `about` word) finds purchase when its noun lemma or
surface form is a THING or a term a rule concludes about, or its verb lemma is a VECTOR, or
a VECTOR begins with its verb lemma plus `phrasal_join`. Words without purchase are listed in `no_purchase`.

**Intent**, for single-sentence input (multi-sentence input is always *perceive*):

| First matching shape | Intent |
|---|---|
| `wh_reason` + yes/no shape | verify |
| `wh` + `cop` + (`wh_place` → objects along the place vector) / (`prep` → subjects) / noun phrases → describe | as stated |
| `wh` + `aux`/`modal` + subject + verb | objects; with `wh_place`, the phrasal, bare and place vectors |
| `wh` + anything else | subjects |
| `aux`/`modal`/`cop`/`hav` first, with a percept after moving it behind the subject | verify |
| an `about` word first | describe the following noun phrases |
| a predicate yielding percepts | verify if it ends with `question_mark` (checking no mention), else perceive — unless the input is one segment alone (TTG-RFC-0005 §3), which is perceived only as the next row says |
| one segment, ending in a `sentence_end` that is not `question_mark` | perceive: a mention (TTG-RFC-0005 §3) |
| no predicate, content words ≤ `describe_max_words`, some with purchase | describe |
| otherwise | search |

Question shapes are parsed by the clause parser itself, with a slot token standing for the
asked-about thing and the moved cue word restored behind the subject.

**Reply.** A verdict (`affirm`, `deny`, `affirm_inferred`, `deny_inferred`, `contest`,
`unknown`, `deny_superseded`, `noted`, `noted_nothing`, `noted_mention`, `amended`, `nothing_found`) or a head, then grounds, each rendered
by kind:

| Kind | Label | Shows |
|---|---|---|
| direct | `label_said` | the triple and the owner's sentence(s), with episode and sentence number |
| inference | `label_inferred` | the whole chain, and one sentence per link — never a single quote standing in for the conclusion |
| conflict | `label_contested` | one `+` sentence and one `-` sentence, no verdict |
| superseded | `label_superseded` | the retired fact, then `superseded_by` and the ground that retired it (TTG-RFC-0004 §3.4) |

then notes: `exception`, `contradicts` (when a new percept opposes a decided belief),
`supersedes` (when a new episode retires a fact),
`no_purchase`, and `suggest` for the purchased THING with the highest EPS at or above
`suggest_eps_min`. Search results are ranked by Σ log(1 + N/df) over matched lemmas across
all `said` lines.

**Side effects.** A non-perceive answer increments `asked` on every purchased term (an
`[ew]`-weight write in TTDB-RFC-0005's sense: `rev` does not change). Every answer rewrites the
cursor block (TTG-RFC-0002 §6).

---

## 5. Constants

All constants named here are keys of the `numbers` kind (TTG-RFC-0001 §9). The reference
values are `prior_for 1`, `prior_against 1`, `weight_partial 0.5`,
`belief_conf_threshold 128`, `inherit_decay 0.85`, `max_hops 4`, `answer_max_items 6`,
`search_max_items 5`, `suggest_eps_min 40`, `with_max_pairs 3`, `said_max_chars 400`,
`rule_max_body 3`.

---

## 6. Open Questions

1. **Change of mind vs contradiction.** Consolidation cannot tell them apart. A recency
   window would be a claim about the owner; a `revises` percept marker (*I used to…*) would
   be a claim about the language. The `exclusive` flag (TTG-RFC-0004) is a third kind, a claim
   about a relation, and settles only changes of object, never of polarity.
2. **Defaults beyond specificity.** Only the nearest ancestor overrides. Multiple
   inheritance with conflicting ancestors at equal distance currently resolves by walk order.
3. **Answer realisation.** Replies quote rather than generate. A realisation layer — slot
   templates per vector in the replies record — would read better and would also be the first
   place a runtime could say something the owner never said.

---

## 7. Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Initial draft |
| 2026-09-14 | §3.1 Rules: Datalog-style rules over vectors, derived to a fixpoint after each consolidation; verify, objects, subjects and describe read their conclusions. |
| 2026-09-14 | Supersession from TTG-RFC-0004: verify step 0, facts carry when they came to hold, the `superseded` ground; inference grounds quote each step at its latest saying. |
| 2026-09-21 | §4: a lone segment said as a statement is perceived as a mention; a question never checks a mention; `noted_mention` and `amended` verdicts (TTG-RFC-0005). |
| 2026-09-21 | §2: held percepts (polarity `?`, TTG-RFC-0005 0.2) count for neither side; a tell names them in a `noted_held` note. |

*License: CC0*
