# TTG-RFC-0007: Acts and Scenes — Words That Do, and Sequences the Owner Can Run

**Version:** 0.1
**Status:** Draft — proposed; not yet implemented in the reference runtime
**RFC Number:** 0007
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0001, TTG-RFC-0002, TTG-RFC-0003, TTG-RFC-0005, TTCP-RFC-0002 (§10), A32-RFC-0003 (§4)
**Informative:** TTG-RFC-0004 (§2, §4), TTG-RFC-0006, TTCP-RFC-0003, TTN-RFC-0005, TTN-RFC-0009, TTN-RFC-0010
**Author:** antfriend
**Created:** 2026-11-27

---

## 1. Abstract

Every sentence a TTG store has read so far is a **saying**: something the owner claims, holds,
mentions or denies, and is answered from. Nothing in a store can yet say *show me Pixel* and have
the processor do it, and a scene record (TTCP-RFC-0002 §10) can only walk from record to record.

This RFC adds three things, one per layer:

1. An **actuator** is a capability the host implements in code and names by a schema key —
   `select`, `ask`, `buzzer` — with a declared side-effect class. The store holds the actuator
   *contract* in a `ttdb-actuators` block; the host's registry is the authority. The word is
   A32-RFC-0003 §4's, so a browser and an ESP32 share one vocabulary.
2. An **act** binds words of a language to an actuator, in a tenth grammar kind, `acts`.
   *Show* and *muestra* both call `select`. An act is a *performative*: saying it does it. An
   act is **never a percept**: it writes no belief, contests none, and is printed as *done*,
   never as *said* or *inferred*.
3. A **scene** gains `step:` lines: an ordered sequence of acts, each written as a sentence in
   the owner's language (`say:`), as a question (`ask:`), or in a canonical, language-free form
   (`do:`). A step may wait for the reader instead of a clock, so a scene is also a slideshow;
   it may branch on a reply's verdict, so it is also a lesson; and an `ask:` step is answered
   from the corpus each time it is shown, so its slides grow with the owner's words.

The engine compiles a scene into a **plan**, a pure function of the store; the host runs the
plan, because only the host has a clock. Provenance is kept at five depths (§8): who wrote a
step, which grammar read it, which episodes ground each slide, what changed between two runs,
and which store a step reached into. What the TTG series already holds is kept: no word in the
runtime (TTG-RFC-0001 §2), old stores read as before, episodes are never rewritten, and what is
done is never printed like what was said.

---

## 2. Terms

| Term | Meaning |
|---|---|
| **actuator** | A host capability, named by a schema key, with typed parameters and a side-effect class (§3). |
| **act** | A grammar line binding words of one language to an actuator (§4). |
| **step** | One line of a scene: one act, with how long it holds and where it goes next (§5). |
| **scene** | A record with `type: scene` and a `ttdb-scene` block (TTCP-RFC-0002 §10), now with steps. |
| **plan** | A scene compiled against the store: its actuator calls, their classes, their branches, and a hash (§6). |
| **run** | One playing of a plan, optionally written down as a run record (§8.4). |
| **act context** | Where a sentence may be read as an act: a `say:` step, or the composer (§4.3). |

**On the word *scene*.** In this RFC *scene* always means the TTCP-RFC-0002 §10 record.
TTN-RFC-0010 §4.1 uses `scene_id` for a band's place in a multi-part song, and TTG-RFC-0004 §4.6
is headed *Scene = grammar* for the hash that detects a grammar split. The three are related —
a song part is a sequence a fleet plays together — but they are not the same field (§10.4;
open question 4).

---

## 3. Actuators

### 3.1 The contract block

The store declares the actuators its acts and scenes may name, in a `ttdb-actuators` fenced
block on a blueprint record (in the reference store, beside the runtime-surface record):

```ttdb-actuators
actuator: select    | target: record   | class: view
actuator: highlight | records: records | class: view
actuator: hold      | ms: int          | class: view
actuator: play      | audio: path      | class: view
actuator: ask       | text: sentence   | class: query
actuator: reread    | episode: record? | class: query
actuator: tell      | text: sentence   | class: write
actuator: buzzer    | value: float     | class: device
```

```
actuator: <key> [| <param>: <type>]… | class: <class>
```

- **The key** is a schema key, lowercase `[a-z0-9_]`. It is never a word the runtime matches
  input against, so it is exempt from the leak test, as block keys are (TTG-RFC-0001 §2).
- **Parameter types:** `record` (one record ID, §4.2), `records` (a list, or the reference
  `answer`, §5.3), `sentence` (text read under a grammar), `int`, `float`, `path`. A trailing
  `?` marks a parameter optional.
- **The class**, in increasing order of consequence:

| Class | May | Reference examples |
|---|---|---|
| `view` | change what is shown; nothing in the store | `select`, `highlight`, `hold`, `play` |
| `query` | read the store and print a reply; write only the cursor (TTDB-RFC-0002) | `ask`, `reread` |
| `write` | add to the store: an episode, an amendment | `tell` |
| `device` | act outside the page and the file | a relay, a servo, a buzzer |

### 3.2 The host is the authority

A host reports the actuators it implements, each with its class. Where the host and the store
disagree on a class, **the higher class is the actuator's**, and the disagreement is reported
(`class`, §7). A store can therefore never make a write look like a view.

An actuator the store declares and the host lacks is **missing**, not an error. A step that
names it is shown as text naming what it lacks (`act_blocked`, §9) and the run goes on to the
next step — the TTG form of *a planned layer names its blocker instead of being drawn*. A host
SHOULD list its missing actuators where it lists a scene's steps.

### 3.3 Reference actuators

A conforming TTG host SHOULD implement `select`, `highlight`, `hold` and `ask`:

| Key | Does |
|---|---|
| `select` | makes the record the cursor's selection and shows it, as a tapped link does (TTCP-RFC-0003 §5.2) |
| `highlight` | lights records on the map, as an answer's records are lit (TTG-RFC-0003 §4) |
| `hold` | waits; a step's own `hold_ms` is the usual way, and this is for a pause between two calls of one generated step |
| `play` | plays an audio file for the step, as a record's `audio_path` plays (TTCP-RFC-0001 §7.1) |
| `ask` | answers its text as the composer would, under §4.3's rule that an `ask` never tells |
| `reread` | reports re-readings (TTG-RFC-0005 §5.1), of one episode or all; writes nothing |
| `tell` | perceives its text as a new episode, with §8.3's provenance |

A device host maps a `device` actuator's key to its registry: on A32, the key is the
`A32Actuator.name` and the parameter `value` is the float its `exec` takes (A32-RFC-0003 §4.1).

---

## 4. Acts

### 4.1 The `acts` grammar kind

```ttdb-grammar
kind: acts
act: show | select
act: go to | select
act: light up | highlight
act: read again | reread
act: tell | tell
ref: it | answer
ref: that | answer
```

```ttdb-grammar
kind: acts
lang: es
act: muestra | select
act: ve a | select
act: cuenta | tell
ref: eso | answer
```

```
act: <words> | <actuator key>
ref: <words> | answer
ref: <words> | self
```

- **Words** are one or more tokens, matched as §4.2 says. A token that lemmatises as a verb
  (TTG-RFC-0001 §4) is matched by its lemma, so *shows* and *showing* match *show*; other tokens
  match as themselves, lowercased.
- **The actuator** must be one the contract block declares, or the line is rejected
  (`actuator`, §7).
- **A `ref:` line** names words that stand for something the runtime holds rather than a term:
  `answer`, the records the last reply lit, or `self`, the `self_lemma` record (TTG-RFC-0001 §9).
  Pronouns the lexicon already reads as the speaker need no `ref:` line.

Acts hold words, so, like constructions (TTG-RFC-0001 §11.2), **they are never borrowed**: a
language that declares no `acts` record has no acts, and a `say:` step read under it is rejected
(`language`, §7). Two languages MAY bind the same actuator, which is the point.

### 4.2 Reading an act

The chain does not read imperatives. In the reference runtime at the time of this draft,
*Show Pixel.* reads as one nounish segment (`[show pixel]`, a mention of `pixel`), *Go to the
kitchen.* makes `go` a thing, and *Muestra a Pixel.* is chosen as English. An act is therefore
**matched before the chain, at the head of the sentence**, the way a construction's words are
matched (TTG-RFC-0006 §3), and only in act context:

1. **Language.** In act context, a language whose act words match the sentence's head is
   chosen; where several match, TTG-RFC-0001 §11.4 chooses among them; where none does, the
   sentence is not an act.
2. **Head.** The longest act whose words match the sentence's first tokens wins; a tie goes to
   the act written first.
3. **Targets.** The tokens after the act's words are read by that language's lexicon as one or
   more nounish phrases: split at its list separators and conjunctions, with determiners and the
   `object_mark` stripped, each phrase's head taken where the `head` parameter puts it
   (TTG-RFC-0001 §11.6) and lemmatised as a noun. Each head resolves, in order, to a `ref:`
   reference, to the speaker (a pronoun the lexicon reads as the speaker), or to the term record
   of that lemma. A head that resolves to nothing is reported (`act_no_target`, §9) and the act
   is blocked, as a question with no purchase is answered with none (TTG-RFC-0003 §4).
4. **Arguments.** A `record` parameter takes exactly one target; more is rejected (`shape`). A
   `records` parameter takes any number. A `sentence` parameter takes the rest of the sentence
   after the act's words, verbatim, read as its own input.

What an act's words cannot carry — a duration, a value for a device — the step carries in its
own fields (§5.2; open question 2). An act sentence is never a percept, and reading one writes
nothing.

### 4.3 Acts in the composer

A store with an `acts` record lets the composer take acts too, under rules that keep a saying
from ever being lost to an act:

- **All or nothing.** An input every sentence of which reads as an act is the `act` intent: the
  host shows the plan those sentences make (§6), and MAY perform its `view` and `query` calls at
  once. An input that mixes acts and sayings is read as sayings only, exactly as without this
  RFC, with a note naming the acts not performed (`act_not_done`; open question 5).
- **A sentence with a subject is never an act.** *I show Pixel to friends* is a saying, because
  an act matches only at a sentence's head. That rules out a dropped subject in the speaker's own
  form too, which the grammar reads from the verb (TTG-RFC-0001 §11.6): *Muestro a Pixel* is a
  saying, because *muestro* is not an act word.
- **An `ask` never tells.** An `ask` call whose text reads as a statement (the `perceive`
  intent, TTG-RFC-0003 §4) is rejected (`unsafe`, §7). A question a scene asks writes only the
  cursor, as a typed question does.
- **Writes need consent** (§6.3), in the composer as in a scene.

---

## 5. Scenes With Steps

### 5.1 The block

TTCP-RFC-0002 §10's `ttdb-scene` block is extended with scene-level keys and `step:` lines. The
reference store's scene, *how an inference travels*, written as steps:

```ttdb-scene
loop: false
advance: hold
grammar: 3fa9

step: pixel   | say: Show Pixel.               | hold_ms: 4200
step: chain   | ask: Is Pixel an animal?        | hold_ms: 6000 | expect: affirm_inferred
step: why     | do: highlight | records: answer | hold_ms: 6000
step: penguin | say: Show the penguin.          | hold_ms: 4200
step: fly     | ask: Can penguins fly?          | hold_ms: 7000 | on_unknown: home
step: home    | do: select | target: @LAT0LON0  | hold_ms: 5000
```

Scene-level keys, each optional:

| Key | Value | Absent |
|---|---|---|
| `loop` | `true` or `false` (TTCP-RFC-0002 §10.2) | `false` |
| `advance` | `hold`: each step waits its `hold_ms`; `hand`: each step waits for the reader's *next*; `beat`: §10.4 | `hold` |
| `grammar` | the grammar hash the scene was last read under (§8.2) | unpinned |
| `log` | `true`: write a run record for each run (§8.4) | `false` |
| `lang` | the language `say:` and `ask:` steps are read under, overruling §4.2 step 1 | chosen per step |
| `audio_path` | TTCP-RFC-0002 §10.2 | — |

### 5.2 A step

```
step: <name> | <action> [| <field>: <value>]…
```

- **The name** is unique within the scene, `[a-z0-9_]`. Branches, expectations, run records and
  drift reports refer to a step by it, so renaming a step breaks its history.
- **The action** is exactly one of:
  - `say: <sentence>` — an act sentence, read as §4.2 says;
  - `ask: <question>` — the `ask` actuator with the question as its text, written apart because
    a question is not an imperative in any language;
  - `tell: <sentence>` — the `tell` actuator, class `write`;
  - `do: <actuator key>`, with that actuator's parameters as fields (`| target: @LAT0LON0`) —
    the canonical form, which no grammar reads;
  - `each: <source>` — a generator (§5.4).
- **Fields:**

| Field | Value | Default |
|---|---|---|
| `hold_ms` | how long the step holds once it is done | 1400 (TTCP-RFC-0002 §10.2) |
| `advance` | overrides the scene's, for this step | the scene's |
| `expect` | the verdict an `ask` step should reply with | none |
| `on_<verdict>` | the step to go to when an `ask` replies with that verdict | the next line |
| `next` | the step to go to after this one, whatever happened | the next line |
| `duration_ms`, `travel_px`, `dir_x`, `dir_y` | the transition (TTCP-RFC-0002 §9, §10.2) | derived |
| `beats` | with `advance: beat`, how many beats the step holds | 1 |
| `priority` | for a `device` call, the A32 action priority (A32-RFC-0003 §4.2) | 0 |
| `max` | for a generator, the most steps it makes | `scene_each_max` |

A verdict is one of TTG-RFC-0003 §4's reply keys (`affirm`, `deny`, `affirm_inferred`,
`deny_inferred`, `contest`, `unknown`, `deny_superseded`, `nothing_found`), so a branch is written
in schema keys and holds no word.

### 5.3 Order

**Steps run in line order**, and `next` and `on_<verdict>` are the only ways to leave it. That
answers TTCP-RFC-0002 §14's open question 2 for steps: the order is total and written, never
recovered by matching `from` nodes.

A block holds `edge:` lines or `step:` lines, not both (`mixed`, §7). An edge-only block plays
exactly as TTCP-RFC-0002 §10.3 says, and a runtime MAY implement it as steps: a first step
selecting `start_node`, then each edge as `do: select | target: <to>` holding the edge's
`hold_ms`. A host that plays both kinds through one player therefore plays old scenes unchanged.

`answer`, in a `records` parameter or as a `ref:`, means the records the last `ask` of this run
lit, or none.

### 5.4 Generated steps

A step whose action is `each: <source>` stands for one step per item of the source, in the
source's order, each doing its `do:` on that item:

```
step: doubts | each: contested | do: select | hold_ms: 5000 | max: 5
```

| Source | Items, in order |
|---|---|
| `contested` | the subjects of contested beliefs, highest EPS first (TTG-RFC-0003 §2) |
| `eps_top` | records by `epsRaw`, highest first (TTDB-RFC-0005) |
| `superseded` | facts an `exclusive` vector retired, latest retirement first (TTG-RFC-0004 §3) |
| `answer` | the records the last `ask` of this run lit |
| `episodes` | the episodes, in lane order |

The items are fixed when the plan is made (§6), except `answer`'s, which are fixed when the step
is reached. A generated step's name is the step's name and the item's ordinal (`doubts.3`).
*Walk me through my contradictions* is one line.

---

## 6. The Plan

### 6.1 Compiling

A runtime compiles a scene into a plan with a **pure function of the store**, reading no clock
— the split TTCP scenes already have, where parsing is the engine's and walking is the page's.
A plan is a list of calls, each

```
{ step, actuator, args, class, hold, advance, branches, source }
```

where `source` is the step's own line, verbatim, and `args` are resolved: record IDs, sentences,
numbers. A plan also carries:

- **its class**, the highest class among its calls;
- **its blockers**, the calls whose actuator is missing (§3.2) or whose target is unresolved
  (§4.2);
- **its hash**, a hash of its calls in canonical form, computed as the runtime computes the
  grammar hash (TTG-RFC-0005 §5.1). Two plans with one hash do the same thing.

The reference runtime SHOULD expose `actsOf(S, lang?)`, `actuatorsOf(S)` and `planOf(S, rec)` on
`PG`, as it exposes `sceneOf` today (TTG-RFC-0001 §10).

### 6.2 Running

The host runs a plan one call at a time. An `ask` call is answered by the engine against the
store as it stands when the step is reached, so a branch depends on the corpus at run time while
the plan stays pure. **Any hand on the globe, any other record chosen and any question asked
stops the run** (TTCP-RFC-0002 §10.3, as the reference page does today), except the reader's
*next* under `advance: hand`. A run also stops after `scene_max_visits` visits to one step, so a
branch cannot loop forever; a plan longer than `scene_max_steps` calls is rejected (`length`).

### 6.3 Consent

Before the first call of class `write` or `device`, the host MUST ask the owner, once per run,
naming the class and the steps of that class (`scene_consent`). A refusal stops the run before
that call; the calls before it have already been shown. A `view` or `query` plan needs no
consent: every call in it is safe to repeat.

---

## 7. Safety

As with rules (TTG-RFC-0003 §3.1) and constructions (TTG-RFC-0006 §6), a line that is not safe is
rejected and reported with its reason, and the reference runtime's consolidation tool lists each
one and fails:

| Reason | When |
|---|---|
| `shape` | an `act:`, `ref:`, `actuator:` or `step:` line missing its parts; a step with no action or two; a field that is neither a parameter of the step's actuator nor a §5.2 field; a `record` parameter given more than one target |
| `actuator` | an act or `do:` naming an actuator the contract block does not declare |
| `class` | the host's class for an actuator is higher than the store's (reported; the host's stands, §3.2) |
| `name` | a step name used twice, or a `next` or `on_<verdict>` naming no step |
| `mixed` | a block with both `edge:` and `step:` lines |
| `language` | a `say:` step read under a language that declares no `acts` |
| `unsafe` | a `say:` that does not read as an act; an `ask` call whose text reads as a statement; a `write` or `device` call in a scene the store did not author, with no trust that admits it (§10.5) |
| `length` | a plan longer than `scene_max_steps` calls once its generators expand |

A missing actuator is not a rejection. It is a blocker, and it is shown (§3.2).

---

## 8. Provenance

### 8.1 Who wrote a step

A scene is a record, so its header's `created` and `updated` and its weight block's `rev`
(TTDB-RFC-0005) say when it changed, and its `relates:` edges say what it rests on. A scene
SHOULD carry a `depends_on@` edge to each record a step names by ID.

### 8.2 Which grammar read it

A `say:` or `ask:` step is only as good as the grammar that reads it. A scene MAY pin the hash it
was written under (`grammar:`). Where the store's grammar hash differs, the host MUST show,
before the run, each step whose plan the current grammar changes, with both plans
(`scene_stale`); it MAY then play, under the grammar the store holds now. A re-reading
(TTG-RFC-0005 §5.1) reports the same steps beside the sentences it reports, and **writes
nothing**; the owner takes them by updating the pin, which is an edit to the scene (its `rev`
+ 1). A scene stores its sentences, never their compiled plan, so scenes and episodes keep one
rule: the words are kept, and the reading is the grammar's until the owner takes it.

### 8.3 What grounds a slide

An `ask` step prints its reply exactly as the composer does: each ground by its kind — said,
inferred, contested or superseded — with its quotes (TTG-RFC-0003 §4). A scene cannot print a
reply any other way. Each done act is a fifth kind, **done** (`label_done`), and is never a
ground for anything.

A `tell` step's episode is the owner's, written with the owner's consent (§6.3), and says where
it came from. Its `source:` line (TTG-RFC-0002 §5.1) is

```
source: <scene record ID> | step: <step name> [| run: <run record ID>]
```

and its record carries an edge of the `act_edge` role to the scene. Words a scene told are always
traceable to the scene, the step and the run, and never pass as typed.

### 8.4 What changed between runs

A scene with `log: true` writes a **run record** for each run, on the lane the `ttdb-sphere` key
`run_lane` names (`97` in the reference store); with no `run_lane`, nothing is written. Its
longitude is one more than the largest in the lane, as an episode's is:

````
@LAT<run_lane>LON<ordinal> | created:<t> | updated:<t> | relates:<run_edge>@<scene>

```ttdb-run
scene: @LAT96LON0
rev: 2
plan: 9c1e
grammar: 3fa9
after: @LAT90LON8
consent: view
step: chain | ask | affirm_inferred | @LAT90LON2#1 @LAT90LON3#1 @LAT90LON4#1
step: why | highlight | done | -
step: fly | ask | deny | @LAT90LON6#2
stopped: end
```
````

- `after` is the last episode in the lane when the run began. **Order, not a clock**
  (TTG-RFC-0004 §2): two runs are compared by what they were played after, never by their
  `created` times.
- Each `step:` line gives the step's name, its actuator, its outcome (`done` for an act, the
  reply's verdict key for an `ask`, `blocked` for a blocker) and the quotes that grounded it, as
  `<episode>#<sentence>`, or `-`.
- `consent` is the highest class the owner allowed; `stopped` is `end`, `hand`, `refused`
  (§6.3) or `visits` (§6.2).

A run record is not an episode and not an amendment. It MUST NOT contribute quotes, percepts,
mentions, counts or weight, just as a `ttdb-episode` block off the episode lane does not
(TTG-RFC-0002 §5.1).

**Drift.** Two run records of one scene give a **drift report**: each step whose outcome or
grounds differ, with the episodes after the earlier run's `after` that ground the later reply
(`drift_head`). Where the two runs' `grammar` differ too, the report says so, which separates
what the owner's words changed from what the grammar changed — the first is the corpus, the
second a re-reading (§8.2). A drift report writes nothing. It is the slow-verb meter's question
asked of a scene: which slides moved, and which words moved them.

### 8.5 Where a step reached

A `target` or `records` parameter MAY name a record in another store, by a toot URI or the viewer
form `?ttdb=<file>&toot=<record>` (TTCP-RFC-0003 §2, §3.4). Only `view` actuators reach another
store (§10.5). A run record writes such a target as given, with the other store's `db_id`
(TTDB-RFC-0001) beside it and, if it is a TTG store, its grammar hash.

---

## 9. Grammar Keys

| Kind | Key | Value |
|---|---|---|
| `acts` | `act` | `<words> \| <actuator key>`, any number |
| `acts` | `ref` | `<words> \| answer` or `<words> \| self`, any number |
| `numbers` | `scene_max_steps` | the most calls a plan may have |
| `numbers` | `scene_max_visits` | the most times one step may run in one run |
| `numbers` | `scene_each_max` | the most steps one generator may make |
| `responses` | `label_done` | the label of a done act |
| `responses` | `act_blocked` | a step whose actuator is missing; slot `{actuator}` |
| `responses` | `act_no_target` | an act whose target resolves to nothing; slot `{words}` |
| `responses` | `act_not_done` | the acts a mixed input did not perform; slot `{acts}` |
| `responses` | `scene_consent` | the question before a write or device call; slots `{class}`, `{steps}` |
| `responses` | `scene_stale` | the grammar has changed since the pin; slots `{hash}`, `{steps}` |
| `responses` | `scene_expect` | an `ask` that replied otherwise than expected; slots `{step}`, `{expected}`, `{got}` |
| `responses` | `drift_head` | the head of a drift report; slots `{scene}`, `{steps}` |
| `vectors` | `role: act_edge` | the edge from a told episode to its scene |
| `vectors` | `role: run_edge` | the edge from a run record to its scene |
| `ttdb-sphere` | `run_lane` | the latitude run records sit on |
| fence | `ttdb-actuators` | the actuator contract (§3.1) |
| fence | `ttdb-run` | a run record (§8.4) |

Host chrome — *play the scene*, *next*, the step counter — stays in markup, as TTG-RFC-0001 §2
says of all chrome.

---

## 10. Domains (Informative)

The three layers are the same everywhere; only the actuators change.

### 10.1 A personal store

Guided readings of one's own beliefs; lessons that branch on what the owner's words reach
(`on_unknown`); *walk me through my contradictions* (`each: contested`); a slideshow
(`advance: hand`) whose `ask:` slides are recomputed from the corpus each time it is shown. A step
with `expect:` is a test, so a scene of expectations is executable documentation: a test suite
can run a store's scenes and fail on `scene_expect`, and the questions a store's tests ask can
live in the store.

### 10.2 Content globes

A TTCP site's scene is a view-only plan: `select` steps with TTCP-RFC-0002 §9's transitions, and
`play` for audio. A view-only plan of `do:` steps needs no grammar, so a TTCP viewer that is not
a TTG runtime MAY play `do:` steps and show `say:` and `ask:` steps as their text.

### 10.3 Model globes

A store whose records are layers of a model (global_models) declares actuators of its own — a
layer, an epoch — and steps through them; its `say:` steps need only that store's `acts` record.

### 10.4 Devices and fleets

On A32, a plan compiles to the action queue: each `device` call enqueues one `A32Action` of its
actuator, value and priority on the cycle its step is reached (A32-RFC-0003 §4.2), and the
bounded-store profile (TTG-RFC-0003 §2.1) sets the three scene numbers small.

A fleet plays one plan together with `advance: beat`: each step holds `beats` beats of the
TTN-RFC-0010 pulse, so every agent changes step on the same downbeat without messaging. As
TTN-RFC-0010 §4.1 already says of a scene, **only the conductor authors one**; a follower that
receives a plan from anywhere else declines it. The plan hash rides beside the chart, as the
grammar hash does where `scene_id` is spent on a song (TTG-RFC-0004 §4.6), and an agent playing
another hash is a split, reported. An `ask` step on a fleet is answered *as of bar N*
(TTG-RFC-0004 §4.5), so every agent shows the same slide.

### 10.5 Scenes from elsewhere

A scene plays against the store that holds it. A scene the store did not author — a record merged
from another agent's store (TTN-RFC-0009) or opened from another file — plays its `view` and
`query` calls only, unless the host's trust in its origin (TTN-RFC-0005) admits more; with no
trust signal, a `write` or `device` call is blocked, never asked. A step that targets another
store reaches it with `view` actuators only, and never writes there.

---

## 11. Relationship to Other RFCs

| RFC | Relationship |
|---|---|
| TTG-RFC-0001 | `acts` is a tenth grammar kind, never borrowed (§11.2); the runtime contract holds (§2) |
| TTG-RFC-0002 | an act is never a percept; a told episode's `source:` names its scene (§5.1) |
| TTG-RFC-0003 | an `ask` step's reply and grounds; the `act` intent; verdict keys as branch keys |
| TTG-RFC-0004 | runs ordered by `after`, never a clock (§2); fleet plans on the pulse (§4) |
| TTG-RFC-0005 | a re-reading reports scene steps a grammar change moves (§5.1) |
| TTG-RFC-0006 | acts are matched at a sentence's head before the chain, as constructions match a clause |
| TTCP-RFC-0002 | `ttdb-scene` gains `step:` lines; edge scenes play unchanged; §14 open question 2 answered for steps |
| TTCP-RFC-0003 | cross-store targets |
| A32-RFC-0003 | *actuator* and its registry; device calls are queued actions |
| TTN-RFC-0005 | trust admits a foreign scene's write and device calls |
| TTN-RFC-0010 | `advance: beat`; only the conductor authors a fleet's scene |

On implementation, TTG-RFC-0001 gains the kind and its keys, TTG-RFC-0003 the `act` intent and the
*done* kind, TTG-RFC-0005 §5.1 the scene steps in a re-reading, and TTCP-RFC-0002 §10 the step
lines, each by a changelog entry naming the runtime commit.

---

## 12. Compatibility

A store that declares no `acts` record and no `ttdb-actuators` block reads, consolidates and
answers exactly as before: no sentence is an act, and the composer has no `act` intent. A scene
with only `edge:` lines plays exactly as TTCP-RFC-0002 §10.3 says. A store that declares acts
changes one thing for its owner: an input every sentence of which is an act is no longer an
episode (§4.3), which is what declaring acts asks for. Generic viewers skip `ttdb-actuators` and
`ttdb-run` blocks as unknown fences (TTCP-RFC-0001 §3).

---

## 13. Open Questions

1. **Acts by meaning.** An act matches its words at a sentence's head. Polite and indirect forms
   (*Could you show me Pixel?*, *Let's look at Pixel*) stay sayings or questions until a
   construction (TTG-RFC-0006) can name an act as what its shape says. Whether a construction's
   atoms may name an actuator, which would let a shape do rather than say, is open.
2. **Parameters in words.** *Wait four seconds* needs number words in a grammar, and the TTG
   series has none. Until it does, durations and values live in step fields.
3. **Keeping a slide.** A drift report says which slides moved. Whether a scene should be able to
   keep a slide — show the reply of a named run as such — is open; a kept slide would have to
   print as *as of run N*, never as a live answer.
4. **Scene and song.** TTN-RFC-0010's `scene_id` is a band's place in a song, and a fleet playing
   a plan is at a place in a sequence. Whether `scene_id` should carry the step a fleet is on, so
   a joining agent finds the slide from the beacon alone, is open; it would need the plan hash to
   ride beside it.
5. **Acts in a mixed input.** §4.3 reads a mixed input as sayings only. Offering the act as one
   of two named readings (TTG-RFC-0005 §3) would let the owner choose, but it would also make an
   act a reading of an episode, which this draft keeps apart.

---

## 14. Changelog

| Date | Change |
|---|---|
| 2026-11-27 | 0.1: initial draft. Actuators and their contract (§3); the `acts` kind, matched at a sentence's head before the chain (§4); scenes with steps, branches and generators (§5); plans, runs and consent (§6); safety (§7); provenance at five depths, with run records and drift (§8); keys (§9); domains (§10). Not yet implemented. §4.2's account of how imperatives read today is from the reference runtime at antfriend.github.io `7a53a97`. |

*License: CC0*
