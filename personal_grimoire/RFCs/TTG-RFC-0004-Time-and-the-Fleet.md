# TTG-RFC-0004: Time — the Order of Sayings, Supersession, and a Fleet's Shared Clock

**Version:** 1.3
**Status:** Stable for §2–3, implemented in the personal_grimoire reference runtime; §4 draft, implemented on hardware by the robot_team fleet (§4.9), not by the reference runtime
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
  polarities. Only the owner's tense does (§3.7).
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

### 3.7 A change in the owner's tense

The owner's words can say that a thing changed: *I liked tea*, then *I do not like tea*. That
is not recency, which would be a claim about the owner; it is the owner's own tense, a claim
of the language (TTG-RFC-0005 §3, tense).

- A saying of a triple in the past is **changed** when a later saying of the same triple, in
  the order of §2, is not past and has the opposite polarity.
- A changed saying is kept and quoted, and does not count in consolidation (TTG-RFC-0003 §2).
  So *I liked tea*, then *I do not like tea*, is a decided `-`, not a contest.
- Two sayings in the same tense that disagree still contest, and so does a past saying after a
  present one: only the present changes the past.
- **perceive:** when a new saying disagrees only with sayings it changes, the reply adds the note
  `changed_tense` (the changed saying, `{then}` and `{ep}`, and the one that changed it, `{now}`
  and `{ep_now}`) in place of `contradicts`. **verify:** a question about a triple with a changed
  saying adds the same note.

This compares polarities, unlike §3.3, and only across tenses. It does not retire a fact along
an exclusive vector, and supersession does not read tense: *Pixel moved to the kitchen*
retires *Pixel sleeps in the sun* whatever tenses they are in.

---

## 4. A Fleet of Agents (draft)

*This section is the design §2–3 were built to accept: only the meaning of "later" changes.
The reference runtime does not implement it. A fleet of six ESP32 boards does, and its test
plan (§4.8) passed on that hardware; §4.9 reports how, and where the fleet had to depart from
this text.*

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

**A stamp names its frame.** A pulse time is measured from a chart's downbeat, and an agent
that started its own chart and later yields to another one jumps to that chart's clock. A bound
models drift since the last beacon, not a change of reference, so it cannot cover that jump. A
stamp therefore SHOULD name the chart lineage it was taken in, and two stamps compare only when
they name the same one:

```
at: 9662720 ±21 frame:20500
```

The frame is the downbeat epoch the lineage was founded with, not `(conductor, era)`: `era`
moves on a scene change and on a takeover, neither of which moves the clock. A stamp with no
frame orders nothing outside its own agent, like a stamp with no bound. The unit is the host's;
the fleet of §4.9 stamps in milliseconds.

### 4.4 Order across agents

Saying A is **before** saying B when any of these holds:

1. they come from the same agent, and §2 says so;
2. B's episode reaches A's through `follows@` edges. When an agent writes an episode, it adds
   `follows@<id>` for the latest episode it holds from each other agent: a vector clock written
   as typed edges (TTDB-RFC-0003). If B was said already knowing A, B is later, whatever the
   clocks say. Because record ordinals collide across agents (§4.7), an episode MAY instead
   carry its agent's own counter and the counters it has seen, inside its block:

   ```
   seq: 697
   follows: 0x00000011:630 0x00000012:541 0x00000100:732
   ```

   which names the same vector clock by `(agent, seq)` rather than by record ID;
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

An episode with no bound, or no frame, is left out of **every** agent's bar view, its own
author's included. Its author could place it (it knows its own file order), and no other agent
could; if the author counted it, two agents holding the same episodes would answer differently
as of bar N, which is the failure the bar exists to rule out. Such an episode still counts in
its author's live view.

### 4.6 Scene = grammar

A percept is only as good as the grammar that read it (TTG-RFC-0001 §13, open question 3).
`scene_id` carries the low 16 bits of a hash of the store's grammar records. It detects a split;
it does not identify a grammar.

- **A grammar change is a chart revision:** `era` + 1 and an immediate beacon (TTN-RFC-0010
  §4.1).
- **A fleet split across scenes is a convergence failure, not a cosmetic one.** A fleet check
  measures and reports it, as `fleet.py band` does for a band.
- **Where the hash rides is not the requirement; detecting the split is.** TTN-RFC-0010 v2
  already gives `scene_id` a meaning, the band's position in a multi-part song, and a fleet that
  plays one cannot also spend it on the grammar. Such a fleet carries the hash beside the chart
  instead, and every agent records, per bar, which peers it heard under a different hash (§4.9).
  A split then shows within one bar without a chart revision.
- **A grammar with no grammar records still has a hash.** An agent whose percepts come from a
  compiled mapping (sensor windows rendered into episodes) has its grammar in its build, and two
  builds can differ. It SHOULD hash that grammar by behaviour: render a fixed probe through the
  mapping and the consolidator, and hash the bytes. Any change to either changes the hash, with
  nothing to bump by hand.

### 4.7 Where the analogy stops

- **Delivery.** A lost beacon is harmless because the next one replaces it. A lost episode is
  not. Beacons stay broadcast and unacknowledged; episodes need TTN-RFC-0007 delivery or
  TTN-RFC-0009 push-back.
- **Identity.** Two agents will both append the same episode-lane ordinal. TTDB-RFC-0004 moves
  the collision, so across a fleet order MUST come from stamps and edges, never from longitude.
- **Whose words.** An episode from another owner's agent is not this owner's words
  (TTG-RFC-0002 §5.1). Time stamps expose this question but do not answer it; `source:` is where
  an answer would start. The fleet of §4.9 keeps another agent's episode verbatim on a lane of
  its own, marked `held: <agent>`, so it is never read as the holder's testimony; only a bar view
  consolidates held episodes with the holder's own.
- **The observer belongs in the percept.** A percept that leaves its observer implicit in who
  wrote the episode (*peer B is link-stable*, written by A) is sound in one store, where the
  author is always the owner. Consolidated across agents, the sayings of every observer about B
  become one belief about B that no agent holds, and *A hears B but B does not hear A* cannot be
  said at all. A fleet view SHOULD consolidate only percepts that name their observer
  (`A | hears | B`). The fleet of §4.9 has done so since 2026-11-26.
- **Changing a percept's form.** Episodes are never rewritten (TTG-RFC-0002 §5.1), so a store
  that changes how a percept is written will hold both forms for as long as its oldest episode
  lives. It SHOULD read an old line in the new form, as it reads it, using what the record
  already says: the fleet of §4.9 rewrites `B | link_stable | <radio>` to
  `A | link_stable_<radio> | B` with A the record's author (the agent, for its own lane; the
  `held:` agent, for a copy). That adds nothing the record did not say, and a store's beliefs
  recompute to the same tallies under the new keys. A line whose author is unknown is left as it
  is. The change is a grammar change, and §4.6 reports it until every agent reads alike.
- **Humanize** (TTN-RFC-0010 §6) has no counterpart. Nobody wants jitter added to their memories.

### 4.8 Test plan

1. Merge two fixture stores with non-overlapping stamps: the later place retires the earlier.
2. Overlapping stamps: contested, both quoted.
3. Overlapping stamps plus a `follows@` edge: the edge decides.
4. Two agents holding the same episodes give identical answers as of bar N.
5. A fleet with two grammar hashes reports the split.

Items 1–4 pass as native tests of the fleet's portable core, and items 4 and 5 also pass on
six boards with no host attached (§4.9).

### 4.9 Implementation report: a six-board fleet (informative)

The robot_team fleet implements this section on six ESP32-S3 boards (three Heltec V4, a
UNIHIKER K10, a LilyGo T-Deck and an M5Stack Cardputer ADV), in its `Semantic` library
(`FleetTime`, `EpisodeOrder`, `EpisodeDelivery`). Its episodes are sensor windows (which peers a
board heard, over which radio), not prose, read by a compiled mapping rather than grammar records.

**What it does.**

- **Chart:** TTN-RFC-0010 unchanged; the per-node offset lives in memory only.
- **Stamps:** `at: <pulse ms> ±<bound ms> frame:<downbeat epoch>` (§4.3), the bound from
  `DRIFT_PPM` 50 and a 20 ms delivery allowance. Bounds observed on hardware are tens of ms.
- **Order:** `seq:` and `follows: <agent>:<seq>…` in the block (§4.4 rule 2), not record IDs.
- **Delivery:** pull, not push. An agent announces its vector clock, and peers ask for what they
  lack and keep each copy verbatim on a lane of their own, marked `held:` (§4.7).
- **Bar:** 10 minutes (`bar_ms` 600 000). Each board computes its bar view 5 minutes after the
  bar line, consolidates it (TTG-RFC-0003 §2) and writes a bar record with a digest over the
  resulting belief lines.
- **Grammar:** hashed by behaviour and carried beside the chart, not in `scene_id`, which the
  fleet's songs already use (§4.6).
- **Percepts:** since 2026-11-26, `<observer> | link_stable_<radio> | <peer>`, one vector per
  radio, the observer named (§4.7). Older lines are read in that form by their author (§4.7,
  *changing a percept's form*).

**Results.**

| Item | Where | Result |
|---|---|---|
| 1–3 | native tests | pass |
| 4 | six boards on their own power supplies, no host attached, about 3 h (2026-10-06) | the same episode set and the same belief digest on all six boards in all 16 scored bars; each board held 10 of 10 episodes from each of the five authoring boards per bar |
| 5 | six boards, one built with a perturbed hash (2026-10-06) | within the first bar every other board recorded the odd one as a split and it recorded all five; after it was reflashed, every board recorded no split from the next bar on |
| §4.7, the observer | six boards reflashed one at a time to name the observer (2026-11-26) | each board still on the old build recorded the reflashed ones as a split until it was reflashed itself, item 5 on a real grammar change; the one scoring board's nine beliefs at boot were byte-identical to those a laptop recomputed from its store before the flash, now under the new keys; every board then received its new-form episodes over the air |

**Where the fleet departs from this text**, each written back above:

- a stamp names its frame (§4.3);
- an unbounded episode is in no bar view, its author's included (§4.5);
- the vector clock is carried as `(agent, seq)` (§4.4);
- the grammar hash rides beside the chart, and a grammar with no records is hashed by behaviour
  (§4.6).

**What it does not do yet.**

- Supersession across agents (§4.4's maximal facts) is in the portable core and its tests, but
  the fleet declares no `exclusive` vector, so nothing is retired on hardware.
- Only one board scores link windows, so every edge it has formed has one observer. The form
  now keeps a second observer's sayings apart, but no run has had a second.
- Item 4 has not been rerun on six boards since the change of form.
- It runs TTG-RFC-0003 §2 counting under a bounded-store profile (TTG-RFC-0003 §2.1).

---

## 5. Open Questions

1. **Uneven inertia.** A rule conclusion drawn while its premise held stays held after that
   premise is retired, unless it is retired itself. Answer-time walks do not persist that way.
   The frame problem is being decided by where a fact was computed.
2. **Exclusivity across vectors** exists only through rules into a shared vector. A said
   `contains` does not retire an `in`, because algebra-only facts are not candidates.
3. **Tense.** Since 1.1 *Mary was in the kitchen* is marked past (TTG-RFC-0005 §3), and a past
   saying a present one contradicts is changed (§3.7). A question about the past (*Where was
   Mary before the garden?*, bAbI task 3) still needs retired facts to be queried as history,
   and a change inside one episode decides the belief without the tell naming it.
4. **Wording.** "No longer", "since" and "at about the same time" are phrases of the replies
   record, but §4's concurrent case has no reply key yet.
5. **Founders.** Two chart lineages founded independently can mint the same downbeat epoch
   (§4.3), for instance two agents powered together and isolated. Their frames then match while
   their clocks differ by about their boot skew, which the bound does not cover. A founder id on
   the beacon would separate them.

---

## 6. Changelog

| Date | Change |
|---|---|
| 2026-09-14 | Initial draft. §2–3 implemented: the order of sayings, `exclusive`, supersession, the `superseded` ground. §4 proposed from TTN-RFC-0010. |
| 2026-09-22 | 1.0: §2–3 stable, as implemented by the reference runtime and checked by its tests; §4 remains a proposal. |
| 2026-11-23 | 1.1: §3.7, a change in the owner's tense: a past saying that a later present one contradicts is changed — kept, quoted, uncounted — and named by `changed_tense`; two sayings in one tense still contest. §3.5 notes the exception; §5.3 narrowed. §2–3 remain stable. Implemented by the personal_grimoire reference runtime (antfriend.github.io `64dcfc5`). |
| 2026-11-25 | 1.2: §4 is implemented on hardware by the robot_team fleet, and the status says so; §4.8's items 1–5 pass there. New §4.9, the implementation report. Written back from it: a stamp names its chart frame (§4.3); the vector clock MAY be carried as `seq:`/`follows: <agent>:<seq>` (§4.4); an unbounded episode is in no bar view, its author's included (§4.5); the grammar hash need not ride in `scene_id`, which TTN-RFC-0010 v2 already uses, and a grammar with no records is hashed by behaviour (§4.6); the observer belongs in the percept (§4.7); §5.5, founders. §4.6 now cites `fleet.py band` (was `companion.py`), and §4.7 no longer names a lane the fleet stopped writing. §2–3 unchanged. |
| 2026-11-26 | 1.3: the fleet of §4.9 names the observer in its link percepts, on all six boards (§4.7, §4.9). New in §4.7, *changing a percept's form*: a store that changes how a percept is written SHOULD read its old lines in the new form by the record's author, never rewrite them. §4.9 gains the percept form, a result row for the change (each old board recorded the new ones as a split until reflashed; beliefs recomputed byte for byte under the new keys) and two open items: one observer so far, and item 4 not rerun since. Correction to 1.2: its §4.7 and §4.9 said the fleet's bar views agreed on a belief merged across observers. In that run only one board scored link windows, so there was nothing to merge; the defect was in the form, not in the result. §2–3 unchanged. |

*License: CC0*
