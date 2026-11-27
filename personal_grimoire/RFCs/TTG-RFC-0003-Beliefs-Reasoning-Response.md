# TTG-RFC-0003: Beliefs, Vector Reasoning and Grounded Response

**Version:** 1.17
**Status:** Stable — implemented in the personal_grimoire reference runtime
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

- a saying changed by a later one in the present tense is not counted (TTG-RFC-0004 §3.7);
- per episode, `plus` = the largest weight of its `+` percepts, `minus` = the largest weight of
  its `-` percepts, where weight is `weight_partial` for quantifier `~` and 1 otherwise;
- `for` = Σ plus, `against` = Σ minus, over episodes;
- polarity = `+` if for > against, `-` if against > for, `?` otherwise;
- `conf` = round(255 × (max(for, against) + `prior_for`) ÷ (for + against + `prior_for` +
  `prior_against`));
- **decided** ⇔ polarity ≠ `?` and conf > `belief_conf_threshold`.

This is TTDB-RFC-0007's replay made deterministic: counting replaces random walks, the count
is atemporal as §3.2 there requires, and the formation threshold is the same. A contested
belief is kept, never resolved by recency; the owner's own tense is not recency, and a
change it says is read (TTG-RFC-0004 §3.7). Order enters only through `exclusive` vectors, which
retire facts without touching consolidation (TTG-RFC-0004 §3).

Beliefs are derived. A conforming implementation MUST be able to recompute every belief line
from the episodes and SHOULD ship a tool that reports drift. A store too small to keep every
episode MAY instead follow §2.1.

### 2.1 Bounded Stores (Profile)

A store with fixed storage that must never refuse a write cannot keep every episode. Under
this profile it MAY evict its oldest episodes after **folding** them. Each folded episode's
contribution to the sums above (its `plus` and `minus` per triple) moves into a **carried
tally** kept beside the lane. §2 is a sum over episodes of a per-episode quantity, so a fold is
a move, not an approximation: beliefs computed from the retained episodes plus the carried
tallies equal beliefs computed from every episode, in any order.

1. **Recomputation** holds over the retained episodes plus the carried tallies, and the drift
   tool SHOULD check exactly that.
2. **Commit.** A fold MUST be committed with the horizon it reaches (the last episode it holds)
   before any episode behind that horizon is removed. A store interrupted between the two then
   recounts nothing twice and drops nothing.
3. **Provenance is what is lost.** A belief whose sayings have all been folded cannot quote a
   sentence. Its ground is **carried**: printed under `label_carried`, with the number of
   episodes the tally holds and the horizon, and never under `label_said`, which would quote a
   sentence the store no longer has. A belief with both retained and folded sayings quotes the
   retained ones and names the carried count.
4. **What reads the order.** Supersession (TTG-RFC-0004 §3) and the shape of the sayings (§4)
   read the order of sayings, which a tally does not keep. A bounded store that implements
   either SHOULD carry what it reads (for supersession, the latest saying of each candidate;
   for the shape, the runs so far and the run in progress). A store with one author has a
   total order, so either carry is exact.
5. **Declaration.** A store under this profile SHOULD say so where its grammar is documented,
   with its bound.

The robot_team ESP32 fleet runs this profile (TTG-RFC-0004 §4.9). Its native tests reproduce
the belief lines byte for byte with the episodes reordered, and again after the oldest are
evicted with a fold. On hardware, beliefs recomputed on a laptop from a node's pulled store
match the node's own, nine of nine, byte for byte. It has no reply layer, so it emits no
carried ground yet, and it implements neither item 4 reader.

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
`cazar X Y => chase X Y`; and the vectors constructions write for one motion to the vector a
plain verb says, across languages: the reference store's `go_off X Y => leave X Y` and
`salir_de X Y => leave X Y` make *What left the table?* find what was sneezed off it, and
*Did the vaso leave the mesa?* answerable from *Pixel tiró el vaso de la mesa*.

---

## 4. Purchase, Intent and Reply

**Purchase.** A content word (not an `about` word) finds purchase when its noun lemma or
surface form is a THING or a term a rule concludes about, or its verb lemma is a VECTOR, or
a VECTOR begins with its verb lemma plus `phrasal_join`. Words without purchase are listed in `no_purchase`.

**Intent**, for single-sentence input (multi-sentence input is always *perceive*). Where the store
declares acts, an input every sentence of which is an act is the `act` intent instead, and is done,
not answered (TTG-RFC-0007 §4.3):

| First matching shape | Intent |
|---|---|
| `wh_reason` + yes/no shape | verify |
| `wh` + `cop` + (a stranded `prep` last → objects along it: *What is a wheel part of?*, *Where is Pixel from?*) / (`wh_place` → objects along the place vector) / (`prep` → subjects) / noun phrases → describe | as stated; a stranded preposition is tried before the place vector, so *Where is Pixel from?* never asks where Pixel is |
| `wh` + `aux`/`modal` + subject + verb | objects; with `wh_place`, the phrasal, bare and place vectors |
| `wh_place` + verb + subject, under `question_order: verb_subject` | objects of the subject along the phrasal, bare and place vectors, the verb moved behind the subject |
| `wh` + a verb in the speaker's own form (TTG-RFC-0005 §3, dropped subjects) and no thing after it | objects of the speaker; with `wh_place`, along the place vectors |
| `wh` + verb + a thing that agrees with the verb in number (`plural_verb_ending`) and no preposition opens (the `object_mark` among them) | objects of that thing; a thing a preposition opens is never the subject, so *¿Qué salió de la mesa?* asks for the subject of `salir_de mesa` |
| `wh` + `aux`/`modal` + subject + `pro_verb` [+ `pro_verb_object`] + thing, or under `question_order: verb_subject` `wh` + `pro_verb` + subject [+ `pro_verb_object`] + thing | the vectors relating the subject to the thing (`vectorsOf`): *What did Pixel do to the napkin?*, *¿Qué hizo Pixel al vaso?* (TTG-RFC-0006 §7.4) |
| the same with no thing | every vector the subject is the subject of, but its structural roles, prepositions' vectors and phrases' vectors: *What did Pixel do?*, *¿Qué hizo Pixel?*; with or without a thing, then what the subject inherits from its kinds, by §3's specificity (TTG-RFC-0006 §7.4) |
| `prep` + `wh` + `cop` + subject | objects along the preposition, the copula behind the subject: *From where is Pixel?*, *¿De dónde es Pingu?*; where that finds nothing and two phrases or more follow the copula, the last is the subject and the rest the predicate: *¿De qué es parte la rueda?* is *la rueda es parte de ?* |
| `prep` + `wh` + any other `wh` shape above | that shape's question with the preposition moved to the end of the statement and the slot its thing: a construction's where one reads it (*¿De dónde tiró Pixel el vaso?*, TTG-RFC-0006 §7.2), otherwise objects (*¿En qué duerme Pixel?*) |
| `wh` + anything else | subjects |
| `aux`/`modal`/`cop`/`hav` first, with a percept after moving it behind the subject | verify |
| under `question_order: verb_subject`, a verb first and a subject after it, ending in `question_mark` | verify, the verb moved behind the subject |
| an `about` word first | describe the following noun phrases |
| a predicate yielding percepts | verify if it ends with `question_mark` (checking no mention), else perceive — unless the input is one segment alone (TTG-RFC-0005 §3), which is perceived only as the next row says |
| one segment, ending in a `sentence_end` that is not `question_mark` | perceive: a mention (TTG-RFC-0005 §3) |
| no predicate, content words ≤ `describe_max_words`, some with purchase | describe |
| otherwise | search |

**A verb's phrasal vectors.** A place question's vectors are, in order: the verb with the
place's preposition, the bare verb, every vector the store names that is the verb joined to a
particle by `phrasal_join`, and the place vector. So *Where did the napkin go?* reaches
`napkin | go_off | table`, which a construction wrote (TTG-RFC-0006 §7). This adds answers the
store already holds and removes none.

**A subject behind its verb.** Where a verb comes before its subject, the subject is the first
noun phrase after it that is not prepositional; in a grammar whose phrases are headed first
(`head: first`) it ends at its head, so what follows is the object: *¿Cazan los gatos ratones?*
is `gato cazar ratón`. Agreement tells a subject from an object behind the verb, as the third
`wh` row says: *¿qué cazan los gatos?* asks for the object (*gatos* agrees with *cazan*), *¿qué
caza ratones?* for the subject (*ratones* does not agree with *caza*), and an `object_mark`
word rules a thing out as the subject. A grammar that declares no `plural_verb_ending` never
reads a subject behind its verb that way. These rows are the `question_order` parameter
(TTG-RFC-0001 §11.6); under `subject_verb` the second and last rows do not apply.

Question shapes are parsed by the clause parser itself, with a slot token standing for the
asked-about thing and the moved cue word restored behind the subject.

**Questions a construction reads.** Where the grammar declares constructions (TTG-RFC-0006), a
wh-question is first matched against them in statement order, one nounish name left for what
is asked, and is answered by what answers every atom that names it; a yes/no question a
construction reads holds only if every atom does (TTG-RFC-0006 §7). A question no construction
covers is read by the rows above.

**Reply.** A verdict (`affirm`, `deny`, `affirm_inferred`, `deny_inferred`, `contest`,
`unknown`, `deny_superseded`, `noted`, `noted_nothing`, `noted_mention`, `amended`, `nothing_found`) or a head, then grounds, each rendered
by kind:

| Kind | Label | Shows |
|---|---|---|
| direct | `label_said` | the triple and the owner's sentence(s), with episode and sentence number |
| inference | `label_inferred` | the whole chain, and one sentence per link — never a single quote standing in for the conclusion |
| conflict | `label_contested` | one `+` sentence and one `-` sentence, no verdict |
| superseded | `label_superseded` | the retired fact, then `superseded_by` and the ground that retired it (TTG-RFC-0004 §3.4) |
| carried | `label_carried` | in a bounded store (§2.1), a belief whose sayings were folded: the triple, the number of episodes carried and the horizon, no quote |
| done | `label_done` | an act the input did (TTG-RFC-0007 §8.3): the sentence, never a ground for anything |

A reply carries `key`, the reply key its verdict is said by, beside the phrase, so a scene's step can
branch on it (TTG-RFC-0007 §5.2).

then notes: `exception`, `contradicts` (when a new percept opposes a decided belief),
`supersedes` (when a new episode retires a fact), `noted_held` and `noted_readings` (what a
tell held, and the readings of a sentence it read two ways), `asked_held` and
`asked_readings` (each held saying a question meets when its grounds do not answer it — never
a ground, and the verdict stands; TTG-RFC-0005 §3), `asked_holds` (for an objects question
whose subject and vector are a stance percept's, what each of its holds lines links, with the
saying — never a ground, and `nothing_found` is not given when one is named; TTG-RFC-0005 §3),
`changed_tense` (a change in the owner's tense, in place of `contradicts` on a tell, and with a
question's grounds; TTG-RFC-0004 §3.7), `trajectory_crossing` and `trajectory_alternation` (the
shape a yes/no question's triple's sayings make, below),
`no_purchase`, and `suggest` for the purchased THING with the highest EPS at or above
`suggest_eps_min`. Search results are ranked by Σ log(1 + N/df) over matched lemmas across
all `said` lines.

**The shape of the sayings.** Where the grammar declares `trajectory_min_episodes` above 0, a
verify answer names the shape each checked triple's sayings make, as a note beside the grounds —
never a ground, and the verdict and grounds are those a store declaring no such number gives:

1. **The series.** Each episode that says the triple, in lane order, scores it as §2 does — the
   largest `+` weight and the largest `-` weight among its percepts of the triple, a partial
   saying at `weight_partial` — and its **sign** is which is larger, 0 where they are alike. A
   saying a change in tense retired (TTG-RFC-0004 §3.7) is in the series, since the shape is of
   what was said, not of what is believed.
2. **The runs.** Consecutive episodes of one sign are a run; a 0 episode is in the series but in
   no run.
3. **The shape.** With fewer than `trajectory_min_episodes` episodes in the series, or no run,
   there is none. One run is a *fixed point*. Two runs, the second of at least `trajectory_hold`
   episodes (1 where the grammar declares none), are *one crossing*; shorter, a crossing *not yet
   held*. Three runs or more are an *alternation*.
4. **The note.** One crossing is named by `trajectory_crossing`, with `{before}` and `{after}` the
   two runs' lengths in the `episode` unit; an alternation by `trajectory_alternation`, with
   `{episodes}` the series' length in that unit and `{turns}` the number of runs less one. A fixed
   point, a crossing not yet held and too few episodes are not named. Where a saying of the
   triple is changed by the owner's tense, `changed_tense` already names the change and this note
   is not given.

So *I like tea* in three episodes, then *I don't like tea* in three, is still `contest`, with a
note that the sayings turned once; *I like milk* and *I don't like milk* in turn, five times, is
`affirm`, with a note that they go back and forth. The note is a description, not a recency
rule (§6.1): it never retires a saying. Appendix A gives the background.

**Side effects.** A non-perceive answer increments `asked` on every purchased term (an
`[ew]`-weight write in TTDB-RFC-0005's sense: `rev` does not change). Every answer rewrites the
cursor block (TTG-RFC-0002 §6).

---

## 5. Constants

All constants named here are keys of the `numbers` kind (TTG-RFC-0001 §9). The reference
values are `prior_for 1`, `prior_against 1`, `weight_partial 0.5`,
`belief_conf_threshold 128`, `inherit_decay 0.85`, `max_hops 4`, `answer_max_items 6`,
`search_max_items 5`, `suggest_eps_min 40`, `with_max_pairs 3`, `said_max_chars 400`,
`rule_max_body 3`, and, for the shape of the sayings (§4), `trajectory_min_episodes 3` and
`trajectory_hold 2`, and, for what a verb takes (TTG-RFC-0005 §3, verb frames),
`frame_min_episodes 1`, `frame_grammar_weight 1`, `frame_preempt_ratio 0`, and, for
modifiers (TTG-RFC-0005 §3), `modifier_max_words 2`, and, for constructions
(TTG-RFC-0006 §6), `construction_max_words 8`.

---

## 6. Open Questions

1. **Change of mind vs contradiction.** Consolidation cannot tell them apart unless the
   owner's tense does (TTG-RFC-0004 §3.7). A recency
   window would be a claim about the owner; a `revises` percept marker (*I used to…*) would
   be a claim about the language. The `exclusive` flag (TTG-RFC-0004) is a third kind, a claim
   about a relation, and settles only changes of object, never of polarity. The shape of the
   sayings (§4) shows the owner a change of mind said without a change of tense, and leaves the
   verdict where §2 puts it.
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
| 2026-09-22 | §4: a question its grounds cannot answer names the held sayings it meets, and a sentence's two readings together (`asked_held`, `asked_readings`, `noted_readings`; TTG-RFC-0005 0.7). |
| 2026-09-22 | 1.0: stable. Implemented in full by the personal_grimoire reference runtime and checked by its tests; the open questions stand as open. |
| 2026-11-23 | 1.1: §4, the `asked_holds` note: an objects question after a stance names what the stance holds (TTG-RFC-0005 1.1 §3). Implemented by the personal_grimoire reference runtime (antfriend.github.io `7071c80`). |
| 2026-11-23 | 1.2: §5, the reference values of the three frame numbers (TTG-RFC-0005 1.2 §3). |
| 2026-11-23 | 1.3: §2, a saying changed by a later present one does not count; §4, the `changed_tense` note; §6.1 narrowed (TTG-RFC-0004 1.1 §3.7). Implemented by the personal_grimoire reference runtime (antfriend.github.io `64dcfc5`). |
| 2026-11-23 | 1.4: §5, the reference value of `modifier_max_words` (TTG-RFC-0005 1.4 §3). |
| 2026-11-23 | 1.5: §4, the intent rows for a verb before its subject under `question_order: verb_subject` (place questions, yes/no questions), a verb in the speaker's own form, and agreement behind the verb — the last read by the reference runtime since TTG-RFC-0005 0.5, and stated here for the first time; a subject behind its verb ends at its head in a head-first grammar. Implemented by the personal_grimoire reference runtime (antfriend.github.io `bf261e8`). |
| 2026-11-24 | 1.6: §4, a place question also asks along the verb's phrasal vectors; §5, the reference value of `construction_max_words` (TTG-RFC-0006). Implemented by the personal_grimoire reference runtime (antfriend.github.io `ea1bc58`). |
| 2026-11-24 | 1.7: §4, questions a construction reads, defined in TTG-RFC-0006 0.8 §7. Implemented by the personal_grimoire reference runtime (antfriend.github.io `fa87584`). |
| 2026-11-24 | 1.8: §4, the intent row for a question whose verb is the pro-verb, answered by the vectors relating its subject and thing (TTG-RFC-0006 0.9 §7.4). Implemented by the personal_grimoire reference runtime (antfriend.github.io `f7352e6`). |
| 2026-11-24 | 1.9: §4, the intent row for a pro-verb question with no thing (TTG-RFC-0006 0.10 §7.4). Implemented by the personal_grimoire reference runtime (antfriend.github.io `1aaa412`). |
| 2026-11-24 | 1.10: §4, a pro-verb question also answers what the subject inherits (TTG-RFC-0006 0.11 §7.4). Implemented by the personal_grimoire reference runtime (antfriend.github.io `3743744`). |
| 2026-11-24 | 1.11: §4, a question with a preposition before its wh-word, the preposition moved to the end of the statement (TTG-RFC-0006 0.12 §7.2). Implemented by the personal_grimoire reference runtime (antfriend.github.io `f06e4f7`). |
| 2026-11-25 | 1.12: §4, a question with the copula and a preposition — stranded (*Where is Pixel from?*), tried before the place vector, or fronted (*¿De dónde es Pingu?*) — asks along the preposition. Implemented by the personal_grimoire reference runtime (antfriend.github.io `0b52632`). |
| 2026-11-25 | 1.13: §4, the `wh` + verb row says what §4's prose already did — a thing a preposition opens is never a subject behind its verb (*¿Qué salió de la mesa?*); the reference runtime had ruled out only the object mark. §3.1, rules that link the vectors constructions write for one motion (`go_off`, `salir_de` ⇒ `leave`). Implemented by the personal_grimoire reference runtime (antfriend.github.io `34e03cc`). |
| 2026-11-25 | 1.14: §4, a fronted preposition with the copula whose predicate's noun stands before the subject (*¿De qué es parte la rueda?*): the last phrase is the subject. Implemented by the personal_grimoire reference runtime (antfriend.github.io `1ce3dec`). |
| 2026-11-25 | 1.15: §4, **the shape of the sayings** — a verify answer names one crossing or an alternation in a triple's per-episode signs, as a note beside the grounds that never changes the verdict (`trajectory_crossing`, `trajectory_alternation`); §5, `trajectory_min_episodes 3` and `trajectory_hold 2`; §6.1 narrowed; Appendix A, trajectories (informative). Implemented by the personal_grimoire reference runtime (antfriend.github.io `e2e02bf`), from its PLAN.md phase 7 and its research note on belief trajectories. |
| 2026-11-27 | 1.17: §4, the `act` intent and the *done* kind, and a reply's `key` (TTG-RFC-0007 §4.3, §8.3). Implemented by the personal_grimoire reference runtime (antfriend.github.io `23b5202`). |
| 2026-11-25 | 1.16: §2.1, **bounded stores**, a profile: a store that cannot keep every episode MAY evict the oldest after folding their per-triple sums into a carried tally, committed with its horizon before anything is removed; recomputation holds over retained episodes plus tallies; a belief whose sayings were all folded is grounded as **carried** (`label_carried`, a fifth ground kind in §4), never as said; supersession and the shape of the sayings must carry what they read. Appendix A, open questions 1 and 2 updated for a fleet that implements TTG-RFC-0004 §4. Pushed upstream from the robot_team ESP32 fleet, which runs the profile (ACT-III C2d there); the reference runtime keeps every episode and is unaffected. |

---

## Appendix A. Trajectories (Informative)

**Where it comes from.** K. R. Haylett reads meaning as a basin of attraction in a nonlinear
dynamical system, and uses Takens' delay embedding to rebuild an attractor's geometry from one
scalar series, while granting that the step is only approximate for sparse, quantized text [1, 2].
A grimoire already keeps such a series for every triple: its sayings, in lane order, never
rewritten (TTG-RFC-0004 §2). §4's shape of the sayings is what that lens yields here, cut to what
the store can say without a claim about the owner.

**What a verdict cannot show.** §2 sums. A settled belief, a contest of equals and a change of
mind said without a change of tense can end at the same confidence: three *likes* and three
*don't likes* are a contest at 128 whether they alternate or fall in two runs. The shapes tell
them apart — a fixed point is a settled belief, an alternation a real disagreement, one crossing
then held a change of mind — and §4 offers the last two to the owner without deciding either.

**Why the sign, not a running balance.** A running balance `(for − against) / (for + against +
prior_for + prior_against)` over the episodes so far crosses zero only once the contrary sayings
outnumber the earlier ones, so three and three end at 0, which looks like a contest and not like
one crossing. The per-episode sign shows the crossing where it happens, at the fourth episode.

**The embedding.** With a delay of one episode and dimension 2, the embedding of a sign series is
its set of transitions (`++`, `+-`, `-+`, `--`), which its runs already say; a higher dimension
adds nothing to a ±1 series. This borrows the picture of an embedding, not the theorem: Takens'
theorem assumes a smooth deterministic system and a generic observable, and its finite-data
guarantees need long, low-noise series [2, 3]. A triple's series is short, discrete and driven by
one person.

**What it keeps.** It writes nothing and decides nothing: only the owner's words or an amendment
change a belief. Its wording is reply keys and its thresholds numbers, so the runtime holds no
word (TTG-RFC-0001 §2). Salience decay acts on terms, not on the series, so forgetting is never
read as a change of mind. Construction traffic, the second series the same lens reads, is in
TTG-RFC-0005 §5.1.

**Still open.**
1. **Episodes or time?** The series counts episodes. A delay that counts lane gaps, so that a
   crossing a year apart reads differently from one an hour apart, belongs with the stamps of
   TTG-RFC-0004 §4. The reference runtime does not implement those. The robot_team fleet does
   (TTG-RFC-0004 §4.9), on ten-minute bars, so there a delay could count bars.
2. **In a fleet** the order of sayings is partial (TTG-RFC-0004 §4), so the series is a partial
   order. It can be read per agent, where the order is total, until stamps order across agents.
   A bounded store must carry the series' state through a fold (§2.1, item 4).
3. **Ranking.** A report could put first the triples whose shape the verdict hides most. Ranking
   by EPS (TTDB-RFC-0005) would need a triple's salience, and the store keeps salience per term.

**References.**

1. K. R. Haylett, "Geofinitism: Language as a Nonlinear Dynamical System — Attractors, Basins,
   and the Geometry of Understanding," Substack, Jan. 2026.
   <https://kevinhaylett.substack.com/p/geofinitism-language-as-a-nonlinear>
2. F. Takens, "Detecting strange attractors in turbulence," in *Dynamical Systems and
   Turbulence, Warwick 1980*, Lecture Notes in Mathematics 898, Springer, 1981, pp. 366–381.
3. T. Sauer, J. A. Yorke, M. Casdagli, "Embedology," *J. Stat. Phys.* 65 (1991) 579–616.

*License: CC0*
