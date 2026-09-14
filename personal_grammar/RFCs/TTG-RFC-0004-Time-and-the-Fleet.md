# TTG-RFC-0004: Time — the Order of Sayings, Supersession, and a Fleet's Shared Clock

**Version:** 0.1
**Status:** Draft — §2–3 implemented in the reference runtime; §4 proposed, not implemented
**RFC Number:** 0004
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0003 (Beliefs, Vector Reasoning and Grounded Response), TTN-RFC-0010 (Fleet Pulse), TTDB-RFC-0007 (Dream Cycle); for §4 also TTN-RFC-0007 (Reliable Delivery), TTN-RFC-0008 (Time-Sync), TTN-RFC-0009 (TTDB Push-Back), TTDB-RFC-0004 (Event ID)
**Author:** antfriend
**Created:** 2026-09-14

---

## 1. Abstract

Consolidation is atemporal (TTG-RFC-0003 §2): saying a thing on Monday and its opposite on
Friday is a contradiction, not a change of mind. That is still true. This RFC adds time in one
declared place. A vector the grammar marks **exclusive** holds one object at a time, so a later
saying along it **retires** an earlier one: *Mary moved to the garden* retires *Mary is in the
kitchen*, and the answer shows both.

Deciding what came later needs an order. A single store already has one, because episodes are
only ever appended (§2). A fleet of agents, each with its own store, has no such order. §4
proposes getting one the way a band keeps time in TTN-RFC-0010. The agents share the tempo, stamp
each saying with how much they trust their own clock, and order only what those stamps can show.

---

## 2. The Order of Sayings

A saying is sentence *n* of an episode on the episode lane (TTG-RFC-0002 §5.1). Its place in
the order is the pair **(the episode's position among the lane's episodes in file order, n)**,
compared lexicographically. Saying A is *later* than saying B when its pair is greater.

- Episodes are appended in the order they are made and never moved (TTG-RFC-0002 §6), so file
  order is the order they were said in. A single store needs no clock.
- A conforming runtime **MUST NOT** order sayings by `at:`, `created` or any time the host
  passed in. Those record when, not in what order. The reference test suite passes a
  *decreasing* `now` and checks that the later saying still wins.
- Only §3 reads this order. Consolidation, conf and polarity do not change.

---

## 3. Exclusive Vectors and Supersession

### 3.1 The flag

`exclusive` is a vector flag (TTG-RFC-0001 §6): **a subject holds one object along the vector
at a time.** The reference store declares it on `in`. It is a claim about the relation, written
where the reader of the grammar can see it. It is not a claim about the owner. Like every flag it
belongs to the first language's algebra and is borrowed by every later one (TTG-RFC-0001 §11).

### 3.2 When a fact holds

Derivation (TTG-RFC-0003 §3.1) gives every fact a time *t*, meaning when it last came to hold:

- a base fact: the latest saying of its belief with the belief's polarity;
- a transitive fact: the later of its two premises;
- a symmetric or inverse fact: its premise's time;
- a rule conclusion: the latest of its body facts.

When a fact already held is derived again with a greater *t*, it takes that *t* and that
proof, which is its latest reason. On a tie it keeps the proof it has, which is the shortest.
Each fact's *t* only grows and ranges over finitely many sayings, so the least fixpoint is still
reached.

### 3.3 Supersession

For each exclusive vector *v* and subject *s*, the **candidates** are the positive facts
(*s*, *v*, *o*) with an object that are either a decided `+` belief or a rule conclusion. Facts
reached only by the algebra (transitive, symmetric, inverse) are not candidates. Such facts are
recomputed along the chain at answer time instead.

A candidate *f* is **retired by** a candidate *g* when all of these hold:

1. *g* is later than *f*;
2. neither object lies along *v* from the other. Once the store has *the kitchen is in the
   house*, being in the kitchen and being in the house are compatible, and neither retires the
   other.

When several candidates retire *f*, the latest of them is recorded as its retirer.

Retirement is recomputed on every consolidation, in memory, and **never written**. A retired
belief's `belief:` line is unchanged: retiring is not forgetting. A retired rule conclusion is
not held. A later rule conclusion may retire an earlier saying, since *Mary moved to the garden*
retires *Mary is in the kitchen*. It never replaces the owner's saying of the *same* triple,
because said still outranks derived.

### 3.4 Answers

- **verify(s, v, o):** a contested belief still answers **C** first. Next, if (s, v, o) is
  retired, the answer is **N** with verdict `deny_superseded` and one ground of kind
  `superseded`. The inverse and symmetric steps check whether the reversed triple is retired in
  the same way.
- **Walks** (transitive reach, `inherits`, subject descent) never pass through a retired fact.
- **objects(s, V):** what still holds is listed first. Retired objects follow.
  **subjects(v, o):** retired subjects are ranked last. **describe(x):** a retired belief of x
  is printed as `superseded` instead of `said`.
- **perceive:** when a new episode retires something, the reply adds the note `supersedes` and
  one `superseded` ground per newly retired fact.

A fourth kind of ground joins TTG-RFC-0003 §4's three:

| Kind | Label | Shows |
|---|---|---|
| superseded | `label_superseded` | the retired fact at its latest saying, then `superseded_by` and the ground that retired it, printed under that ground's own label (`label_said` or `label_inferred`) |

Inference grounds, superseded grounds and the retiring ground quote each step of their path at
its **latest** saying, which is the reason it holds now or last held. Direct grounds keep
quoting the earliest sayings. New reply keys: `label_superseded`, `superseded_by`,
`deny_superseded`, `supersedes`.

### 3.5 What does not change

- **The same triple, opposite polarity.** *Kim is in the garden* followed by *Kim is not in the
  garden* is still **C**, contested. Supersession compares objects; it never compares
  polarities.
- **Vectors not declared exclusive.** *I like coffee* followed by *I do not like coffee* is still
  contested (TTG-RFC-0003 §6, open question 1), and *Pixel chases mice* does not retire
  *Pixel chases birds*.
- **Verbs.** Only vectors are exclusive. Several verbs retire one another only if rules lead
  them into one exclusive vector: `move_to X Y => in X Y`, and likewise for `go_to`.

### 3.6 Evidence

bAbI task 1, *single supporting fact* (Weston et al., 2015; 200 stories, 1,000 questions),
through `tools/babi.mjs`. The adaptation is four lines of grammar data: three rules linking
`go_to`, `journey_to` and `travell_to` to `in` as the seed does for `move_to`, and *back* added
to the adverbs.

| Condition | Answer accuracy | Exact attribution |
|---|---|---|
| store as shipped | 19.4% | 18.2% |
| + four lines of grammar data | **100.0%** | **100.0%** |
| the same, `exclusive` removed | 54.9% | 54.9% |
| letter-permuted grammar and data | 100.0%, identical question by question | 100.0% |
| permuted grammar, plain data (control) | 0.0% | 0.0% |

Exact attribution means the quoted sentences are exactly the task's gold supporting facts.
Task 15 (basic deduction) scores 100% with or without the flag. Results:
`paper/babi_qa1_results.json`, `paper/babi_qa15_results.json`.

---

## 4. A Fleet of Agents (proposed)

*Not implemented. This section is the design §2–3 were built to accept: only the meaning of
"later" changes.*

### 4.1 The problem

§2's order holds within one store. When several agents' episodes meet (a phone, a Raspberry Pi,
an ESP32 badge, each hearing the same owner) there is no shared file order. Their clocks also
disagree: an ESP32 has no real-time clock (TTN-RFC-0008 §1), and a host's wall clock is only as
good as its last network time sync. The `at:` stamp each episode carries today is whatever clock
its host had.

### 4.2 The chart

The fleet adopts [TTN-RFC-0010](TTN-RFC-0010-Fleet-Pulse.md) unchanged as its time-base:

- **Election:** first up conducts, `(era, −conductor_id)` decides, and a handoff keeps the
  downbeat (§3 there).
- **Beacons:** rare, and paced to drift (§5 there), plus on-join (§4.2 there). Nothing is sent
  per episode to keep time.
- **Per-node offset:** kept in memory, never in a file (§2 and §4.1 there). A copied store carries the
  chart but not the offset: a file is a stale beacon.

Each store holds the chart (`conductor`, `era`, `downbeat`, `beat_ms`, `meter`, `scene`) in a
`ttdb-pulse` block on a record outside the grammar and episode lanes. The engine stays
clock-free (TTG-RFC-0001 §10): the host keeps the pulse clock and hands the engine stamps.

### 4.3 Stamps with a bound

An episode's `at:` becomes a pulse time and an error bound:

```
at: 1789257600 ±4
```

The host computes the bound as delivery delay plus `DRIFT_PPM` × the time since it last adopted
a beacon (TTN-RFC-0010 §5):

| Agent | Bound at 50 ppm |
|---|---|
| meets the fleet once a day | ±4.3 s |
| meets the fleet once a week | ±30 s |
| wall-clock mode (`flags` bit 0), host synced by NTP | assumed from configuration, not measured |

A stamp with no bound orders nothing outside its own agent.

### 4.4 Order across agents

Saying A is **before** saying B when any of these holds:

1. they come from the same agent, and §2 says so;
2. B's episode reaches A's through `follows@` edges. When an agent writes an episode, it adds
   `follows@<id>` for the latest episode it holds from each other agent: a vector clock written
   as typed edges (TTDB-RFC-0003). If B was said already knowing A, B is later, whatever the
   clocks say;
3. the stamps' ranges do not overlap: A's `at` + bound < B's `at` − bound.

Otherwise A and B are **concurrent**. This order is partial, so §3.2's "latest" becomes "the
maximal facts". §3.3 changes in one way: two incompatible candidates that are concurrent do not
retire each other. The answer is **contested**, and both are quoted. This is TTN-RFC-0010's
swing envelope applied to belief: inside the tolerance, no order is claimed.

### 4.5 The bar

The meter gets a job. A bar (for example, an hour) is the fleet's Dream Cycle (TTDB-RFC-0007). At
each bar line an agent fixes its view **as of bar N** over the episodes whose stamp range ends
before that line. Two agents that hold the same episodes and read them under the same grammar
then give identical answers as of bar N, without coordinating. Answers on each device stay live.

### 4.6 Scene = grammar

A percept is only as good as the grammar that read it (TTG-RFC-0001 §13, open question 3).
`scene_id` carries the low 16 bits of a hash of the store's grammar records. It detects a split;
it does not identify a grammar.

- **A grammar change is a chart revision:** `era` + 1 and an immediate beacon (TTN-RFC-0010
  §4.1).
- **A fleet split across scenes is a convergence failure, not a cosmetic one.** A fleet check
  measures and reports it, as `companion.py band` does for a band.

### 4.7 Where the analogy stops

- **Delivery.** A lost beacon is harmless because the next one replaces it. A lost episode is
  not. Beacons stay broadcast and unacknowledged; episodes need TTN-RFC-0007 delivery or
  TTN-RFC-0009 push-back.
- **Identity.** Two agents will both append `@LAT90LON9`. TTDB-RFC-0004 moves the collision, so
  across a fleet order MUST come from stamps and edges, never from longitude.
- **Whose words.** An episode from another owner's agent is not this owner's words
  (TTG-RFC-0002 §5.1). Time stamps expose this question but do not answer it; `source:` is where
  an answer would start.
- **Humanize** (TTN-RFC-0010 §6) has no counterpart. Nobody wants jitter added to their memories.

### 4.8 Test plan, when implemented

1. Merge two fixture stores with non-overlapping stamps: the later place retires the earlier.
2. Overlapping stamps: contested, both quoted.
3. Overlapping stamps plus a `follows@` edge: the edge decides.
4. Two agents holding the same episodes give identical answers as of bar N.
5. A fleet with two grammar hashes reports the split.

---

## 5. Open Questions

1. **Uneven inertia.** A rule conclusion drawn while its premise held stays held after that
   premise is retired, unless it is retired itself. Answer-time walks do not persist that way.
   The frame problem is being decided by where a fact was computed.
2. **Exclusivity across vectors** exists only through rules into a shared vector. A said
   `contains` does not retire an `in`, because algebra-only facts are not candidates.
3. **Tense.** *Mary was in the kitchen* and *Mary is in the kitchen* are one percept (the
   parser's blind spots, `@LAT98LON5`). A question about the past (*Where was Mary before the
   garden?*, bAbI task 3) needs retired facts to be queried as history.
4. **Wording.** "No longer", "since" and "at about the same time" are phrases of the replies
   record, but §4's concurrent case has no reply key yet.

---

## 6. Changelog

| Date | Change |
|---|---|
| 2026-09-14 | Initial draft. §2–3 implemented: the order of sayings, `exclusive`, supersession, the `superseded` ground. §4 proposed from TTN-RFC-0010. |

*License: CC0*
