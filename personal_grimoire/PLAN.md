# Plan — what the grammar theories suggest

This plan turns a comparison of the Personal Grimoire with four theories of grammar into
work. The theories are Lexical Functional Grammar (LFG), transformational grammar with
Principles & Parameters (TG/P&P), usage-based grammar, and Construction Grammar (CxG). The
full comparison, 35 dimensions with a verdict for each theory, is the
[Grimoire Grammar Matrix](https://claude.ai/artifact/CFj7Yd2nvitxE3t37e6KRr).

The comparison found PG's representations closest to LFG, its engine/parameter split
closest to P&P, its learning closest to usage-based grammar, and its biggest gap to be the
one CxG names: the store holds no form–meaning pairs. The phases below take those findings
in order of value per unit of risk. Each phase can ship by itself.

Phases 7–9 conclude the plan: they bring in the workable parts of the belief-trajectories
research note, publish what all of it produced on one release page, and then remove the
development documents, this one included.

---

## Rules every phase keeps

These are the existing contract, restated so no phase forgets one.

1. **No words in `index.html`.** Every new behaviour is a schema key the store declares.
   If a fix needs English in the runtime, it is the wrong fix (`@LAT98LON5`). The leak grep
   in the tests must stay clean.
2. **Old stores read as before.** A store without the new keys must parse, consolidate and
   answer exactly as it does today. New keys default to today's behaviour.
3. **Episodes are never rewritten.** New lines go into new episodes. Old episodes get the
   new reading only through re-reading and amendments (TTG-RFC-0005 §5.1), and only when the
   owner takes them.
4. **Byte-stable round trip.** Parse then serialise with no changes reproduces the store
   byte for byte.
5. **Published results hold.** bAbI tasks 1 and 15 keep their outcomes, question for
   question, in every condition (`node tools/babi.mjs`). Checked after phase 6 and the
   TTG-RFC-0006 work, against runtime `acee36c`: every condition's outcome hash equals the
   one recorded in `paper/` (below). The seed store's eight episodes
   still read as written (`node tools/reread.mjs` reports nothing) unless a phase says
   otherwise.
6. **Spanish too.** Each phase either works for both grammars or says why a language
   declares nothing.
7. **RFCs change upstream.** TTG RFC text is authored in toot-toot-engineering and synced
   into `RFCs/` here, as recent commits do. Each phase names the RFC sections it touches.
8. **The roadmap is in the store.** Each phase adds or updates a design belief in lane 98,
   so EPS keeps ordering the work, and updates the README's Roadmap and Known limits.

Every phase finishes with `node tests/app.test.mjs`, `docs.test.mjs` and
`embed.test.mjs` passing, plus the bAbI and re-read checks above.

---

## Phase 1 — Link a stance verb to what it holds

**From:** LFG's COMP. **Size:** small.

**Status (2026-11-23): implemented in the runtime, the store and the tests.** `holds:` lines
are written by the reader, read by consolidation (malformed ones are skipped and counted),
compared by re-reading, carried by amendments, and answered through `asked_holds` in both
languages. RFC text: TTG-RFC-0005 1.1, -0002 1.3, -0003 1.1 and -0001 1.1, written
upstream in toot-toot-engineering (`226bf8d`) and synced here.
The Spanish gap this left, *¿Qué dudo?* read as a question about a subject, was closed in
Phase 5.

**Problem.** *I doubt cats like fish* writes `self | doubt | -` as said and
`cat | like | fish | ?` as held, with nothing joining them. The store knows *that* you doubt,
and *that* something is held, but not *what you doubt*. *What do I doubt?* has no answer.

**Change.**
- A new episode line ties a stance percept to the percepts it holds:
  ```
  holds: <sentence> | <stance percept ordinal> | <held percept ordinals, space separated>
  ```
  Ordinals count the sentence's `percept:` lines from 1. A `ttdb-amend` entry can carry the
  same line. Runtimes that predate this ignore the unknown key (TTG-RFC-0001 §12), so the
  percept columns do not change.
- The reader writes `holds:` wherever a stance verb, stance noun or reported clause produces
  held percepts (TTG-RFC-0005 §3). An *or* has no stance percept, so it writes none.
- An `objectsOf` question on a stance vector answers from `holds:` lines. The held triples
  are listed and still labelled held. New reply key in `responses`: `asked_holds`,
  `{text}` / `{ep}`.

**Tests.** *I doubt cats like fish.* then *What do I doubt?* names `cat like fish` as held
and quotes the sentence. *The idea that cats bark is silly* links `idea` to `cat bark`.
Both run in Spanish. Old stores answer as before.

**RFCs.** TTG-RFC-0002 §5.1 (episode block), TTG-RFC-0005 §3 and §5 (held sayings,
amendment block), TTG-RFC-0003 §4 (intent table).

**Re-reading.** Existing held sentences are offered a re-reading whose only difference is
the new `holds:` line. Decide whether a difference in `holds:` alone counts as a change. The
recommendation is yes: it changes what a question can find.

---

## Phase 2 — Learn verb frames from evidence, not from one guess

**From:** usage-based entrenchment and preemption. Also answers TTG-RFC-0005 §8.4. **Size:**
small to medium.

**Status (2026-11-23): implemented in the runtime, the store and the tests.**
- **Gap lines.** A percept whose object, or lack of one, the grammar decided at a relative's
  gap is written as the grammar's reading: `gap: <sentence> | <percept ordinals>`. That
  covers a gap filled, a gap no verb took, and a stranded preposition. A reading the owner
  chose between two readings is not marked. The lines are carried by amendments and
  compared by re-reading. Malformed ones are skipped and counted.
- **Episode counts.** Frames are counted in episodes, with the owner's words and the
  grammar's gaps kept apart. The three numbers are in the store at 1, 1 and 0, and with
  those values every test, re-read and seed reading is unchanged. A store that declares none
  of them reads exactly as before.
- **Visible counts.** Verb records carry `frames: <with> <without> | <gap-only with>
  <gap-only without>`, and `node tools/consolidate.mjs` reports drift in them.

**Changed from the plan.** Chain verbs do **not** take the grammar-weight discount. The
evidence for a chain verb is a bare verb after the verb's thing, which is in the owner's
words, not a guess at a gap, so discounting it would stop typed sentences teaching chains at
all.

RFC text: TTG-RFC-0005 1.2, -0002 1.4, -0003 1.2 and -0001 1.2, written upstream in
toot-toot-engineering (`671b635`) and synced here. ~~Still to do: the bAbI check, whose task data
isn't on this machine~~ (done after phase 6, below: unchanged).

**Problem.** Whether a verb takes a thing flips the first time any standing reading shows it
with one, and never flips back. A reading the grammar made, such as a gap it filled, teaches
as much as one the owner marked. So one wrong guess teaches a wrong fact about a verb until
the owner amends it.

**Change.**
- Keep, for each verb, counts in **episodes** of standing readings with a thing and without
  one. Count them the way beliefs are counted, separating readings the owner said or marked
  from readings the grammar filled.
- New `numbers` keys, with defaults that reproduce today's behaviour exactly:
  - `frame_min_episodes: 1`: how many episodes before a verb counts as taking a thing;
  - `frame_grammar_weight`: how much a grammar-filled reading counts towards that. The
    default is 1, today's behaviour; 0 stops the store learning from its own guesses;
  - `frame_preempt_ratio`: how many lone uses outweigh one use with a thing. The default is
    off. When set, a verb mostly used without a thing goes back to lone. This is statistical
    preemption.
- Chain verbs keep the one-example rule. It is principled, because the bare form rules out
  every other reading, and P&P's cue-based learning agrees. They take the same
  grammar-weight discount.
- A verb's term record shows the counts on a new `frames:` line, so what the store has
  learned about a verb is visible where `forms:` already shows its spellings.

**Tests.** With defaults, every existing test, the bAbI runs and re-reads are unchanged.
With `frame_grammar_weight: 0`, *I like the dog that the cat chased* (a gap the grammar
filled) teaches nothing about *chase*. With preemption on, ten lone uses of a verb outweigh
one use with a thing.

**RFCs.** TTG-RFC-0005 §3 ("Where the gap is filled", "Chain verbs are learned"), §6 keys,
§8.4 closed. TTG-RFC-0002 §5.2 (`frames:`).

---

## Phase 3 — Tense and modality

**From:** LFG's TENSE and aspect features, and the roadmap's "tense and modality" blind
spot. **Size:** medium.

**Status (2026-11-23): implemented in the runtime, the store and the tests.**
- **Tense.** A predicate is past when one of its words is a `past_form`, or an inflected verb
  wears a `past_ending`. A present *have* rules this out (*has moved* is not past). Past
  percepts are marked `tense: <sentence> | <percept ordinals>`. Amendments carry the line,
  re-reading compares it, and malformed ones are skipped and counted.
- **Change of mind.** A past saying that a later present saying contradicts is retired: kept
  and quoted, but no longer counted. A tell, and a question that meets it, add the
  `changed_tense` note. Two sayings in the same tense still contest, and so does a past
  saying after a present one.
- **Hedges.** A `class: hedge` word holds its clause. English: *might may could maybe perhaps
  possibly probably*. Spanish: *quizás quizá acaso posiblemente probablemente*.

**Changed from the plan.**
- **A dedicated `tense:` line**, in the same ordinal form as `gap:`, instead of a general
  `feature: key=value` line. Only the past is marked, because nothing reads any other value yet.
- **No `mood` for other modals.** Recording *can* or *must* would have offered a re-reading for
  the seed store's *Birds can fly* and changed nothing anyone reads.
- **The class is `hedge`, not `hedge_modal`.** It also covers adverbs (*maybe*), which are
  added to `adverb` too.
- **No `numbers` switch for the tense rule.** It fires only on opposite polarity across
  tenses. bAbI task 1 has no negation, and task 15 is all present tense, so the rule cannot
  change their answers. That's still unverified until the data is here.
- **Quotes are not tense-marked.** They are verbatim, so a past saying is already quoted in
  the past. Triples carry no tense.

**Known gaps.**
- A change inside one episode (*I hated snow. I do not hate snow.*) decides the belief
  correctly, but the tell's reply doesn't name the change, because a reply compares against
  what the store held before the tell.
- ~~Many Spanish past forms (*cazaron*, *gustaba*) are not lemmatized.~~ Closed 2026-11-29 by
  the Spanish preterite and imperfect endings in the morphology (below, Spanish constructions).

Also fixed along the way: `tests/embed.test.mjs` now normalizes line endings as the store's
reader does. With `core.autocrlf=true`, git rewrites working copies with CRLF on checkout, and
the test failed on them.

RFC text: TTG-RFC-0005 1.3, -0004 1.1, -0003 1.3, -0002 1.5 and -0001 1.3, written upstream in
toot-toot-engineering (`b091171`) and synced here. ~~Still to do: the bAbI check~~ (done, below: unchanged).

**Problem.** *Birds fly*, *birds flew* and *birds might fly* are one percept. *I liked coffee*
followed by *I do not like coffee* is reported as a contradiction, although the owner's own
words say it is a change.

**Change.**
- A new episode line carries features of a percept without touching its columns:
  ```
  feature: <sentence> | <percept ordinal> | <key>=<value> ...
  ```
  Feature names are grammar schema keys (`tense`, `mood`); their values come from the store.
- Tense comes from the morphology. Add `past_ending` and a `past:` form list beside the
  irregular forms, or reuse `participle_ending` where a language's past and participle are
  the same form. Spanish declares its own.
- Modality: a new `class: hedge_modal` (*might*, *may*, *could*; *quizás*) makes its clause
  **held**, as a stance verb does. Other modals (*can*, *must*) are recorded as `mood` and
  their clause is still said.
- Consolidation: a past saying and a later present saying of the opposite polarity are
  reported as **a change in your own words** instead of contested. This is a new reply key,
  `changed_tense`, which quotes both sayings. This is not the recency rule the README
  refuses. It reads tense the owner spoke and never infers change from the clock.
- Quotes show the feature, so a past saying is never printed as present.

**Tests.** *Birds might fly* is held. *I liked coffee. I do not like coffee.* reports a
change, not a contest. *I like coffee. I do not like coffee.* still contests. bAbI task 1
uses past tense throughout (*Mary moved to the bathroom*), so check carefully that its
outcomes hold. If they don't, gate the tense rule behind a `numbers` switch that is off by
default.

**RFCs.** TTG-RFC-0002 §4–5 (feature line), TTG-RFC-0001 §3–4 keys, TTG-RFC-0004 §2–3
(change versus contradiction), TTG-RFC-0003 §2 (consolidation).

**Later, not in this phase.** With tense present, a retired saying along an `exclusive`
vector could be written as a before→after transition. That would bring the grammar back
towards TTDB-RFC-0006's native percept, the divergence TTG-RFC-0002 §4 records.

---

## Phase 4 — Modifiers as subclasses

**From:** LFG's ADJUNCT, and the "modifiers are dropped" known limit. **Size:** medium.

**Status (2026-11-23): implemented in the runtime, the store and the tests.**
- **Lexicon keys.** `modifier: drop | subclass` and `privative: <words>`. Both grammars ship
  `modifier: drop`, so every existing reading is unchanged. Numbers: `modifier_max_words: 2`.
- **What `subclass` does.** A phrase's other content words join with its head, in the
  phrase's own order (`black_cat`, `gato_negro`). The sentence is about the joined term, and
  the clause also says `<term> is_a <head>` (none for a privative modifier) and
  `<term> has_property <modifier>` for each modifier. Once the term exists, the existing phrase
  binding finds it unmarked, so its `is_a` isn't said again. A longer phrase chains onto it
  (`big_old_black_cat is_a black_cat`).
- **Questions.** A question never checks the subclass percepts a phrase made, so
  *Do black cats bite dogs?* checks only the biting.

**Changed from the plan.**
- **`privative` is a word list, not a class.** A class word isn't a content word, so it would
  split the phrase apart instead of modifying it.
- **More modifiers than the cap means the whole phrase is read as if dropped,** rather than
  keeping the nearest ones.
- **The store ships with `drop`.** With `subclass`, an unjoined name becomes a kind of its last
  word (*New York* is a *york*). Switching on is the owner's choice.

**Known gaps.** Names aren't told apart from modifier phrases. A mention with no verb
(*Black cats.*) makes no subclass, because a mention says nothing. Under `subclass`, re-reading
offers the new reading to old sentences with modifiers.

RFC text: TTG-RFC-0005 1.4, -0002 1.6, -0003 1.4 and -0001 1.4, written upstream in
toot-toot-engineering (`a0baba4`) and synced here. ~~Still to do: the bAbI check~~ (done, below: unchanged).

**Problem.** *Black cats chase mice* is about *cats*. Reading the adjective as
`cat has_property black` would wrongly say all cats are black.

**Change.**
- A new lexicon key, `modifier: drop | subclass`. The default, `drop`, is today's behaviour.
- Under `subclass`, a phrase whose content words come before the head (after the head for
  `head: first`) makes a joined term with the same join owner-bound terms use. It writes
  `black_cat | is_a | cat` and `black_cat | has_property | black`, and the sentence's own
  predicate is about `black_cat`. Specificity inheritance (TTG-RFC-0003 §3) then does the
  rest: black cats inherit everything about cats and can override it.
- Compounds such as *house cat* get `house_cat is_a cat`, which is right, so this avoids the
  objection in TTG-RFC-0002 §7.2. A `class: privative` (*fake*, *former*) suppresses the
  `is_a`.
- A new `numbers` key, `modifier_max_words`, caps the number of terms this creates.
- Where the owner has already bound a phrase, that binding wins, as now.

**Tests.** *Black cats chase mice. Do cats chase mice?* says your words don't reach that.
*Do black cats chase mice?* says yes, quoting the sentence. *Cats eat fish. Do black cats
eat fish?* infers through `is_a`. Spanish *los gatos negros* gives `gato_negro`, head first.

**RFCs.** TTG-RFC-0002 §3–4 (§7.2 closed), TTG-RFC-0005 §3 (phrase heads), §6 keys.

---

## Phase 5 — Name the parameters; Spanish questions with the verb first

**From:** P&P. **Size:** small, then medium.

**Status (2026-11-23): implemented in the runtime, the store and the tests.**
- **The table.** Blueprint 2 carries a **Parameters** table: head direction, question order,
  agreement behind the verb, the speaker's dropped subject, bare-verb finiteness, the object
  mark, and modifiers. It gives each one's key, its value when absent, and what English and
  Spanish declare. `docs.test.mjs` holds every cell to the grammar records and checks that the
  runtime reads every key.
- **`question_order: subject_verb | verb_subject`.** English declares the first, Spanish the
  second. Under `verb_subject`:
  - a place question with its verb first is read in statement order (*¿Dónde duerme Pixel?* is
    *Pixel duerme en ?*);
  - a yes/no question with its verb first is read as the statement it asks after (*¿Duerme
    Pixel en el sol?*);
  - the subject ends at its head in a head-first grammar, so *¿Cazan los gatos ratones?* is
    `gato cazar ratón`.
- **A verb that names its own subject.** A verb in the speaker's own form, with nothing after
  it, already has its subject, so *¿Qué dudo?* asks what is doubted and reaches the Phase 1
  link. This is driven by `self_ending` and `self_form`, not by the new key.
- **`wh_place` takes an optional third column:** the preposition that asks for the place,
  where it isn't the vector's own name. Spanish `dónde | in | en` reaches `dormir_en`.

**Changed from the plan.** The table lives in Blueprint 2 (Classify), the blueprint about
reading, and TTG-RFC-0001 §11 will carry the same table. The `wh_place` third column wasn't
in the plan: without it, no Spanish place question could reach a phrasal vector.

**Known gaps.**
- A verb-first subject whose phrase goes on past its head (*¿Caza el gato negro ratones?*)
  splits at the head.
- Language detection reads *¿Qué come Pixel?* as English, because *come* is an English word.
  That's an existing problem.

RFC text: TTG-RFC-0001 1.5, -0003 1.5 and -0005 1.5, written upstream in toot-toot-engineering
(`3b0e72e`) and synced here. ~~Still to do: the bAbI check~~ (done, below: unchanged).

**Problem.** Several keys are already parameters in all but name: `head`, the subject drop
implied by `self_ending`, the subject position implied by `plural_verb_ending`. Nothing lists
them, and the Spanish blind spots on the roadmap look like parameters nobody has set.
*¿Dónde duerme Pixel?* puts its verb before its subject.

**Change.**
- Add a **parameters** table to TTG-RFC-0001 §11 and to a blueprint record. It names each
  parameter, the key that sets it, its default, and what each language declares. Only
  documentation; no new keys.
- `docs.test.mjs` checks the table against the keys each grammar actually declares.
- Then add a new parameter, `question_order: subject_verb | verb_subject`. With
  `verb_subject`, a question that opens with a `questions` word followed by a finite verb
  reads the nounish segment after the verb as the subject, using agreement as Spanish
  already does for *qué*.

**Tests.** The table matches both grammars. *¿Dónde duerme Pixel?* is answered from
*Pixel duerme en el sol.* English is unchanged.

**RFCs.** TTG-RFC-0001 §11, TTG-RFC-0003 §4.

---

## Phase 6 — Constructions in the store

**From:** Construction Grammar, the largest gap the comparison found. **Size:** large.

**Status (2026-11-24): implemented in the runtime, the store and the tests.**
- **`kind: constructions`**, the ninth grammar kind, at [`@LAT-85LON0`](personal_grimoire_ttdb.md).
  The store declares one English construction:
  `[X] {V} [Y] off [Z] => V X Y, go_off Y Z | caused motion`. Spanish declares none and
  borrows none.
- **Matching** covers a whole clause, after labelling and before the chain. A nounish name
  takes nounish tokens that read as one headed phrase; a verbish name, verbish tokens that
  read as one verb; a word matches itself however it was labelled. The most specific wins,
  ties to the first written. The verb's denial, the subject's quantifier, the past and a held
  clause carry to every atom. A clause the owner marked is never read by a construction.
- **Safety:** `shape`, `length` (`construction_max_words: 8`), `protected` and `unsafe` lines
  are rejected, and `tools/consolidate.mjs` reports them and fails.
- **Reporting:** `read_by` in both languages names the construction in a tell's reply.
- **Questions:** a place question also asks along the verb's phrasal vectors the store
  names, so *Where did the napkin go?* reaches `go_off`.
- **Tests:** the caused-motion tell, the question, denial, hedge and tense; marks overrule;
  sentences no construction matches read as without one; the seed episodes re-read
  unchanged; specificity and ties; every rejection reason; and adding a construction makes
  re-reading list exactly the sentence it changes.

**Changed from the plan.**
- The head atom is `go_off Y Z`, not `move_off Y Z`, so that *Where did the napkin go?*
  reaches it through the verb it asks with. Place questions gained the verb's phrasal vectors
  for this.
- A shape covers a whole clause instead of a span in one. Spans would have to be handed out
  from inside the chain walk; whole clauses keep the walk untouched.
- *sneeze* joined the English seed verbs, because the morphology read *sneezed* as *sneez*.
- TTG-RFC-0006 was drafted in this folder (0.1) with the runtime, because the store's `src:`
  line names it, then moved upstream.

**Known gaps.**
- ~~A shape inside a relative or a stance's clause (*I think Pixel knocked the cup off the
  shelf*) isn't matched~~: done 2026-12-05, below.
- Spanish has no caused-motion construction: *de* is both *off* and *of*.
- Questions aren't read by constructions (*What did Pixel sneeze off the table?*).
- ~~The `is_a` inheritance between constructions~~: done 2026-11-24, below.

Upstream (toot-toot-engineering `4795447`): TTG-RFC-0006 0.1, TTG-RFC-0001 1.6 and TTG-RFC-0003
1.6. ~~Still to do: the bAbI check~~ (done, below: unchanged).

**Inheritance between constructions (2026-11-24): implemented in the runtime, the store and
the tests.** The plan's "Later" item.
- **Syntax:** an optional part after the label, `| is_a <parent label>`. The keyword is the
  `class_of` role, so the runtime holds no word for it. One parent per construction.
- **Meaning:** a construction says its ancestors' atoms and its own. An atom of its own with the
  same vector, subject and object as an inherited one overrides it, and a `not_` atom states a
  denial, as a penguin's *not fly* overrides a bird's *fly*. A clause that denies an atom the
  construction already denies (*didn't push it almost off*) holds the denial: it says neither way.
- **Order:** a construction is tried before every ancestor, whatever its own words; otherwise
  the most words of its own first, ties to the order written.
- **Safety:** a missing or rejected parent (`parent`), a cycle (`cycle`), or inherited atoms
  naming what the child's shape doesn't bind (`unsafe`) reject the child.
- **Reporting:** a new reply key, `read_by_is_a`, names the construction and what it is a kind
  of; without it, `read_by` is used.
- **The store** adds `[X] {V} [Y] off [Z] onto [W] => go_onto Y W | caused motion onto | is_a
  caused motion`. The seed episodes still re-read unchanged.

Changed from the plan: the plan suggested inheritance should "run through the same
specificity logic the reasoner uses for beliefs". The logic is the same (specific overrides
general, on the same vector and things), but it runs when the store's grammar loads, not
through the reasoner, because a construction's atoms are known before any sentence is read.

Known gaps: ~~one parent only~~ (several since 2026-11-25, below); a verbish name can't be tied to one word,
so a child whose verb is a literal (*knocked*) can't inherit a parent's `V X Y`; an abstract
construction with no shape of its own can't be declared.

Upstream (toot-toot-engineering `13b9114`): TTG-RFC-0006 0.2 §8 and TTG-RFC-0001 1.7.

**Several parents (2026-11-25): implemented in the runtime, the store and the tests.**
- **Syntax:** one `| is_a <label>` part per parent; a parent named twice is malformed. A
  construction with parents may add no atoms of its own (`=> | <label> | is_a A | is_a B`).
- **Meaning:** a child says every parent's atoms, recursively. An atom two parents say alike
  is said once, so a diamond doesn't double a percept. An atom they disagree on (one says it,
  one denies it) is **contested** unless the child says it itself: held (`?`), never believed,
  the way the reasoner keeps a contested belief. A new reply key, `construction_contested`,
  names the parents that disagree; the contested atom is kept out of the generic `noted_held`
  note, which would say the owner hedged.
- **Ancestors** are listed nearest first, without repeats; a child is tried before all of
  them. Cycles are found through any parent, and a missing or rejected parent among several
  still rejects the child.
- **The store:** `motion onto` (`[X] {V} [Y] onto [W] => V X Y, go_onto Y W`) is new, and
  `caused motion onto` is now `caused motion` and `motion onto` together, with no atoms of its
  own. It reads exactly as before; the seed episodes re-read unchanged.

Known gaps: a verbish name still can't be tied to one word, and ~~an abstract construction~~
(since 2026-11-26, below).

Upstream (toot-toot-engineering `e779a2d`): TTG-RFC-0006 0.3 and TTG-RFC-0001 1.8.

**Abstract constructions (2026-11-26): implemented in the runtime, the store and the tests.**
- **Syntax:** a construction with an empty shape (`construction: => V X Y | acting on a thing`).
- **Meaning:** it is never matched against a clause; it is only inherited from. Without a
  shape to bind them, its names are the kinds its atoms use them as: a vector's name is
  verbish, a subject's or object's nounish. A name used as both is `unsafe`, in its own atoms
  or in what it inherits. An abstract construction may inherit from another, and a shaped
  child of it still has to bind every name it inherits.
- **The store:** `acting on a thing` (`=> V X Y`) is the root. `caused motion` and `motion onto`
  inherit `V X Y` from it and add only their own motion atom, and `caused motion onto` is a
  diamond through it that says the verb's percept once. Every sentence reads as before, and
  the seed episodes re-read unchanged.

Known gap: ~~a verbish name still can't be tied to one word~~ (since 2026-11-27, below).

Upstream (toot-toot-engineering `ec23b56`): TTG-RFC-0006 0.4.

**A verbish name tied to its verbs (2026-11-27): implemented in the runtime, the store and the
tests.**
- **Syntax:** `{V=knock}` inside the verbish marks; `{V=knock,push}` for several verbs.
- **Meaning:** the name binds only a verb whose head lemma is one of those words, so the tie
  takes every form the morphology lemmatizes to it (*knocked*, *knocks*, *knocking*), where a
  literal word in the shape matched one form only. The name is still a verbish name, so a
  child with a tied verb inherits `V X Y`: this is what the rejected *knocked* example needed.
- **Specificity:** a tie counts as a word of the construction's own.
- **Safety:** a tie inside nounish marks, an empty tie, or a tied name that isn't capitalised
  is malformed (`shape`).
- **The store:** `knocking off` (`[X] {V=knock} [Y] off [Z] => fall_off Y Z | is_a caused
  motion`). *Pixel knocked the cup off the shelf* is now a knock, the cup going off the shelf,
  and the cup falling off it; *pushed* is still only caused motion. The seed episodes re-read
  unchanged.

Known gaps: ~~a nounish name can't be tied~~ (since 2026-11-28, below); a tie is only as good as the morphology
(~~*shoved* lemmatizes to *shov*, so `{V=shove}` misses it~~; `stem_restore` since 2026-12-07, below).

Upstream (toot-toot-engineering `753126b`): TTG-RFC-0006 0.5.

**A nounish name tied to its things (2026-11-28): implemented in the runtime, the store and the
tests.**
- **Syntax:** `[X=cat]` inside the nounish marks; `[X=cat,dog]` for several things.
- **Meaning:** the name binds only a phrase whose head lemma is one of those words (*cat*,
  *cats*), or, under `modifier: subclass`, a subclass a phrase made of one (a *black cat* is a
  cat; a privative *toy cat* is not).
- **The store:** an idiom, `[X] {V=take} [Y=day,week,afternoon,morning] off => rest X Y |
  taking time off`. *I took the day off* is `self | rest | day`, not a taking; *I took the cup
  off* reads by its words; a denial carries. The seed episodes re-read unchanged.
- **Fixed along the way:** under `modifier: subclass`, a clause a construction read didn't say
  the subclass its phrase made (`black_cat is_a cat`, `has_property black`), as the chain does.
  It does now.

Known gaps: a tie names lemmas, not meanings: `[X=animal]` doesn't bind *cat* even where the
owner has said cats are animals. Following beliefs would make a reading change whenever a
belief does, with no re-reading to show why, so it is left open.

Upstream (toot-toot-engineering `4305092`): TTG-RFC-0006 0.6.

**A Spanish construction (2026-11-29): implemented in the store, the runtime and the tests.**
- **The record:** `@LAT-85LON180`, `lang: es`, beside the English one. An abstract root,
  `actuar sobre algo` (`=> V X Y`), and `movimiento causado`:
  `[X] {V=tirar,empujar,sacar,echar,quitar,bajar} [Y] de [Z] => salir_de Y Z`.
  *Pixel tiró el vaso de la mesa* is the throw and `vaso | salir_de | mesa`; *Pixel vio el vaso
  de la mesa* is still the table's glass, read by its words. The tie is what lets *de* be read
  as *off*: TTG-RFC-0006 §11.3 had said *de* alone couldn't be.
- **The morphology:** the Spanish past wasn't lemmatized, so the tie missed *tiró*. The
  morphology now has the preterite and imperfect endings (*aron*, *ieron*, *aban*, *ían*,
  *aba*, *ía*, *ió*, *ó*, *é*, *í*), ahead of the present ones, since a verb takes its first
  matching ending. This also closes the Phase 3 gap: *Los gatos cazaron ratones* is now
  `gato | cazar | ratón`, and *tiraban* is no longer *tirabar*. The six motion verbs joined the
  Spanish seed list, so *Tiré el vaso* finds its verb without a subject before it.
- **The runtime:** a shape that opens on a nounish name now binds it to the speaker when the
  clause opens on a verb in the speaker's own form (*Tiré el vaso de la mesa* is `self | tirar
  | vaso` and `vaso | salir_de | mesa`), as the chain does. A dropped subject that isn't the
  speaker's (*Tiró el vaso…*) matches no shape.
- The seed episodes re-read unchanged.

Known gaps: ~~Spanish has no question that reaches `salir_de` (*¿De dónde tiró Pixel el vaso?*)~~
(since 2026-12-04, below), and ~~English and Spanish motions are separate vectors (`go_off`, `salir_de`) until a rule links
them~~ (`leave`, since 2026-12-10, below).

Upstream (toot-toot-engineering `c4c5628`): TTG-RFC-0006 0.7.

**Questions read by constructions (2026-11-30): implemented in the runtime, the store and the
tests.**
- **Wh-questions:** the question's words, in statement order and without the wh-word, are
  matched against each construction with exactly one untied nounish name left unmatched: the
  gap is what is asked. *What did Pixel sneeze off the table?* is caused motion with nothing at
  `[Y]`; *What sneezed the napkin off the table?* has nothing at `[X]`. Spanish verb-first
  questions are restated with the subject before the verb first, as place questions are:
  *¿Qué tiró Pixel de la mesa?*
- **Joint answers:** every atom that names the gap is a query, and an answer must answer them
  all. The atom the construction says itself leads; the inherited ones narrow it. So *What
  did Pixel sneeze off the table?* is what Pixel sneezed **and** what went off the table: not
  the cap Pixel sneezed elsewhere, nor the bone the dog dropped off it.
- **Yes/no questions** were already read by constructions, but `verify` answered with the
  first atom it knew. A construction's statement now holds only if every atom does: the
  weakest answer of its atoms is the answer (a denial, then a contest, then unknown).
- **The lexicon:** *off* is now an English preposition. Before, *The napkin went off the table*
  was `napkin | go | off` and `napkin | go | table`; now it is `napkin | go_off | table`, the
  vector the construction writes, so *What went off the table?* finds both. Nothing else in
  the suites changed, and the seed episodes re-read unchanged.

Known gaps: ~~a gap can only be a nounish name~~ (a gap at the verb since 2026-12-01, below); ~~*¿De dónde tiró Pixel el vaso?*, with its preposition before the wh-word,
still isn't~~ (since 2026-12-04, below).

Upstream (toot-toot-engineering `28b9f86`): TTG-RFC-0006 0.8 and TTG-RFC-0003 1.7.

**A question gap at the verb (2026-12-01): implemented in the runtime, the store and the tests.**
- **The lexicon:** two keys per language, `pro_verb` (the word a question puts in a verb's
  place: English *do*, Spanish *hacer*) and `pro_verb_object` (the preposition that marks its
  thing: *to*, *a*). The Spanish morphology also gained *hacer*'s preterite (*hice … hicieron*),
  which no ending rule derives. A new reply key in both languages, `vectors_head`
  (`{s} … {o}`), heads the answer.
- **Without a construction:** *What did Pixel do to the napkin?* is a new intent, `vectorsOf`:
  every vector the owner's words relate the subject to the thing by, each grounded as any
  answer is (*sneeze*, *chew*). The pro-verb is read as a verb even where the lexicon also
  lists it as an auxiliary (*do*), but only when no other verb follows it, so the *did* moved
  behind the subject in *What did Pixel sneeze?* is still a cue.
- **With a construction:** the pro-verb fills a verbish name as the gap, and the
  construction's atoms that name no gap become conditions. *What did Pixel do to the napkin
  off the table?* asks for `V pixel napkin` on condition `napkin | go_off | table`, and the
  answer is a verb said **in the same sentence** as the condition, so the sneeze that sent the
  napkin off, not a chewing said elsewhere. A condition that doesn't hold leaves nothing.
- **Tied verbs:** a tied verbish name can be a verb gap only where no untied shape reads the
  question, and then the answer is among the tie's verbs. So English *…to the cup off the
  shelf?* is read by caused motion, not narrowed by *knocking off*, while Spanish *¿Qué hizo
  Pixel al vaso de la mesa?*, which only the tied *movimiento causado* reads, is *tirar* and
  not *morder*.

Known gaps: ~~a verb gap without a thing (*What did Pixel do?*) isn't read~~ (since 2026-12-02,
below); a held or derived
verb doesn't answer a verb gap inside a construction, since only said sentences can share one.

Upstream (toot-toot-engineering `e8f4367`): TTG-RFC-0006 0.9, TTG-RFC-0001 1.9 and TTG-RFC-0003 1.8.

**A verb gap with no thing (2026-12-02): implemented in the runtime, the store's docs and the
tests.** *What did Pixel do?* (and *¿Qué hizo Pixel?*) asks `vectorsOf` with no object: every
vector the owner's words have Pixel as the subject of, to anything or to nothing, each listed
with its own saying. What the subject *is* or *where* it is isn't a doing: the structural roles
(`class_of`, `property`, `possession`), a vector a preposition names (*in*) and a declared
phrase's vector are left out. No new key: `vectors_head` is used with no thing.

Known gap: ~~only the subject's own sayings and derived facts answer~~ (inherited doings since
2026-12-03, below).

Upstream (toot-toot-engineering `a9b95ac`): TTG-RFC-0006 0.10 and TTG-RFC-0003 1.9.

**Inherited doings for a verb gap (2026-12-03): implemented in the runtime, the store's docs and
the tests.** After its own sayings and derived facts, `vectorsOf` asks every vector-and-thing
pair the subject's ancestors say of the subject by inheritance, through the reasoner's own
`inherited`, so the nearest ancestor's decided word stands. *What did Pixel do?* now also lists
*chase mouse*, grounded as an inference through `pixel is_a cat`; Pingu, a penguin, swims and
does not fly, since the penguins' denial is nearer than the birds' flying; a pair the subject
says of itself, either way, is its own (a Pixel that doesn't chase mice doesn't inherit it).
The same holds with a thing: *What does Pixel do to mice?* is *chase*.

Upstream (toot-toot-engineering `73289dc`): TTG-RFC-0006 0.11 and TTG-RFC-0003 1.10.

**A preposition before the wh-word (2026-12-04): implemented in the runtime, the store's docs
and the tests.** A question that opens on a preposition and then a wh-word is restated as the
others are, in statement order without the wh-word, and its preposition goes where the
statement has it, at the end: *¿De dónde tiró Pixel el vaso?* is *Pixel tiró el vaso de*, which
*movimiento causado* reads with nothing at `[Z]`, so it asks for what the glass left (`vaso |
salir_de | ?`) on condition that Pixel threw it: the table. The wh-word doesn't matter (*¿De
qué…?* asks the same). English does it after the moved auxiliary: *Off what did Pixel sneeze
the napkin?* is the table, and *…the bone?*, which the dog dropped, is nothing. No construction
reading it, the preposition is read as the statement's words are: *¿En qué duerme Pixel?* is
*Pixel duerme en ?*, the bed.

Upstream (toot-toot-engineering `26b5ce4`): TTG-RFC-0006 0.12 and TTG-RFC-0003 1.11.

**Part of a clause (2026-12-05): implemented in the runtime, the store's docs and the tests.**
A clause no shape covers whole hands two kinds of span to the matcher, the walk left as it
was for the rest:
- **A stance's clause.** Where the words up to a stance verb read as a clause ending open on
  it, the rest is matched as if a subord word had split it, a leading subord word dropped:
  *I think (that) Pixel knocked the cup off the shelf* says the stance and holds the knock,
  the cup going off and the cup falling off, the holds line naming all three. Spanish *Creo
  que…* already split at *que*.
- **A relative.** From the relative word to where the clause around it goes on (at a verb, or
  the end), with the antecedent where the gap is: before the relative's words where it opens
  on its verb (*the cat that knocked the cup off the shelf* is *the cat knocked the cup off
  the shelf*), after its verb where it has a subject of its own (*the cup that Pixel knocked
  off the shelf*). The clause around it is read by the walk without it: *…is black*, *…broke*.
  Spanish too (*el gato que tiró el vaso de la mesa es negro*).
- A span no shape covers, *I think the cat is black* or *the cat that I saw is black*, reads
  as before; the seed episodes re-read unchanged. The one test that pinned the old limit (*the
  napkin that Pixel sneezed off the table is wet* read by its words) now checks the reading.

Still open: a span anywhere else in a clause (an adverbial clause without a subord word), ~~a
relative inside a stance's clause~~ (since 2026-12-06, below).

Upstream (toot-toot-engineering `68dd995`): TTG-RFC-0006 0.13.

**A relative inside a stance's clause (2026-12-06): implemented in the runtime, the store's docs
and the tests.** What follows a stance verb is matched whole, as before, and otherwise offered
as a clause with a relative in it: *I think the cat that knocked the cup off the shelf is black*
says the stance and holds *knocking off*'s three atoms and the cat being black, the holds line
naming all four; the object relative too (*I doubt the cup that Pixel knocked off the shelf
broke*). Spanish *Creo que el gato que tiró…* already read so, since *que* splits off the
reported clause first. A relative no shape covers, inside a stance's clause, reads as before.

Upstream (toot-toot-engineering `ac287d0`): TTG-RFC-0006 0.14.

**Stems no lemma ends bare on (2026-12-07): implemented in the runtime, the store and the
tests.** An unknown verb's lemma was its bare stem when no candidate was a term or a seed
verb, so *shoved* was `shov`, *judged* `judg`, *danced* `danc`, *argued* `argu` and *gazed*
`gaz`, and a later *shove* was another vector. The morphology's new `stem_restore: e | v c dg
u az ez iz oz uz` names what a stem takes back (`e`) and the endings no English lemma ends bare
on; after a known term, a seed verb and an undoubled stem, a stem with one of those endings
takes the candidate its rule offers with `e`. *walked*, *looked*, *hopped*, *buzzed* (`z` is in
`double_keep`) and *fixed* are unchanged, and the seed episodes re-read unchanged. *sneeze*
stays a seed verb. Spanish declares none: its endings already leave a lemma whole.

Upstream (toot-toot-engineering `2ad2898`): TTG-RFC-0001 1.10.

**A preposition with the copula (2026-12-08): implemented in the runtime, the store's docs and
the tests.** *Where is Pixel from?* answered *sun*: a place question with the copula asked along
the place vector (`in`) before it looked for a stranded preposition. The stranded preposition
now comes first, so it is *Pixel is from ?*, *madrid*; and a preposition fronted before the
wh-word with the copula reads the same way (*From where is Pixel?*, *¿De dónde es Pingu?*,
*Of what is a wheel part?*). *Where is Pixel?*, with no preposition, still asks along `in`.

Known gap: ~~*¿De qué es parte la rueda?*, whose subject stands after *parte*, isn't restated~~
(since 2026-12-11, below).

Upstream (toot-toot-engineering `82e2dd6`): TTG-RFC-0003 1.12 and TTG-RFC-0006 0.15.

**Moving from (2026-12-09): a construction in the store, and the tests.** *From where did Pixel
knock the cup?* found nothing, because nothing the owner says with *from* was ever a motion:
*Pixel pushed the cup from the shelf* was the push and a comention. The English constructions
gain `[X] {V=knock,push,pull,drop,throw,take,kick,lift} [Y] from [Z] => leave Y Z | moving from
| is_a acting on a thing`, tied as Spanish *de* is, since *from* is not a motion after most
verbs (*I bought milk from the shop*, *I learned it from a book*). Its vector is `leave`, so
*What left the shelf?* finds the cup, as `go_off` let *Where did the napkin go?* find the table;
and the questions read it (*From where did Pixel push the cup?* is the shelf). No runtime
change. The verbs needn't be seed verbs (*dropped* and *knocked* are read as verbs by where they
stand); adding *drop* as one would have put a grammar word in the runtime's own literals
(`modifier: drop`). English *leave* and Spanish *salir_de* are still separate vectors.

Upstream (toot-toot-engineering `9495529`): TTG-RFC-0006 0.16.

**One motion, two languages (2026-12-10): two rules in the store, one runtime fix, and the
tests.** The constructions wrote three vectors for a thing moving off another: `go_off`
(*caused motion*), `salir_de` (*movimiento causado*) and `leave` (*moving from*). Two rules
now link them, as `cazar X Y => chase X Y` links a verb: `go_off X Y => leave X Y | going off a
thing is leaving it` and `salir_de X Y => leave X Y | salir de is leave`. *What left the
table?* finds the napkin Pixel sneezed off it, inferred, not said; *Did the vaso leave the
mesa?* is *probably*, through the rule's label. Things still don't cross (*glass* and *vaso*
are two terms).

The runtime fix: *¿Qué salió de la mesa?* asked what *de la mesa* took out. A wh-word straight
onto its verb looks behind the verb for a subject that agrees with it, and took the phrase
after a preposition for one; only the object mark was ruled out. Now no phrase after a
preposition is a subject, so the question is *? salió de la mesa*, `salir_de`, the glass, and
*¿Qué duerme en la cama?* reaches `dormir_en` too. The rule-count tests moved from four to six.

Upstream (toot-toot-engineering `87b4a45`): TTG-RFC-0003 1.13.

**The predicate's noun before the subject (2026-12-11): implemented in the runtime and the
tests.** A preposition fronted before the wh-word with the copula read *¿De qué es parte la
rueda?* as *parte la rueda es de ?*, and found nothing. Where that reading finds nothing and the
rest holds two phrases or more, the last is the subject and what stands before it the
predicate: *la rueda es parte de ?*, `part_of`, *coche*. English, whose subject comes first
(*Of what is a wheel part?*), reads as before.

Known gap: *quizzed* and *panicked* lemmatize as `quizz` and `panick`; no suffix rule tells them
from *buzzed* and *kicked*, and listing them as irregular would lose their past.

Upstream (toot-toot-engineering `6b4e6f1`): TTG-RFC-0003 1.14.

**An adverbial clause, and phrases after a shape (2026-12-12): implemented in the runtime, the
store's docs and the tests.** The last open span inside a clause, in two parts:
- **A fronted adverbial clause.** *When Pixel slept, the dog barked* was `pixel | sleep |
  barked`: the comma is the list separator, so the clause *when* opened ran on through the main
  clause, which no subord word opens. Now a clause a subord word opens ends at the **last**
  list separator with a clause of its own after it, subject and predicate, the test a conj
  already meets to split (TTG-RFC-0002 §2): *When Pixel knocked the cup off the shelf, the dog
  barked* is *knocking off* and `dog | bark`; *Cuando Pixel tiró el vaso de la mesa, el perro
  ladró* too. A list before it stays a list (*When Pixel chased mice, cats and dogs, the bird
  sang*), and a list no subord word opens is untouched.
- **Phrases after a shape.** *Pixel knocked the cup off the shelf in the kitchen* was read by its
  words (`cup with shelf`), since no shape covered the whole clause. A clause that ends on
  prepositional phrases after what a shape covers is now the construction's up to them, the
  phrases mentioned beside the first thing of their segment as the walk mentions them (`cup
  with kitchen`).
- The seed episodes re-read unchanged.

Not done: a comma splice no subord word opens (*Pixel slept, the dog barked*) still reads as
one clause, since a list separator between two clauses is also how a list is written; and a
time word the lexicon doesn't list (*yesterday*) still heads the phrase it ends.

Upstream (toot-toot-engineering `94f1c15`): TTG-RFC-0002 1.7 and TTG-RFC-0006 0.17.

**The bAbI check (after phase 6 and the TTG-RFC-0006 work).** Run against runtime `acee36c`
with the bAbI v1.2 English test splits, 1,000 questions each, in every condition. Every
outcome hash equals the one recorded in `paper/babi_qa1_results.json` and
`paper/babi_qa15_results.json`, and the adaptations are the same lines:

| task | seed | +adapted | +adapted, no exclusive flag | permuted | control |
|---|---|---|---|---|---|
| 1 | 19.4% (`ed9fa0be`) | 100% (`6bc15755`) | 54.9% (`ced41ffc`) | 100% (`6bc15755`) | 0% (`33e361f4`) |
| 15 | 0% (`33e361f4`) | 100% (`6bc15755`) | 100% (`6bc15755`) | 100% (`6bc15755`) | 0% (`33e361f4`) |

So nothing phases 1–6 or the constructions work added changed a bAbI outcome, and the letter
bijection still leaves every outcome unchanged: the runtime still holds no English. The
recorded files were not rewritten.

**Problem.** Meaning comes only from words. *Pixel sneezed the napkin off the table* reads as
`pixel | sneeze | napkin` plus a comention. Nothing in the store can say that the pattern
*X V Y off Z* means Y moves off Z.

**Change.**
- A new grammar kind, `constructions`. Each line pairs a shape, written in the owner's
  existing marks, with percepts, written the way rules write atoms:
  ```ttdb-grammar
  kind: constructions
  construction: [X] {V} [Y] off [Z] => V X Y, move_off Y Z | caused motion
  ```
  Uppercase names bind segment heads (V binds the verbish head's lemma). Other words are
  literals, held in the store like every other word.
- **Matching** happens on the shape, after segmentation and marks and before the percept
  rules of TTG-RFC-0005 §3. The most specific match wins, meaning the one with the most
  literals; ties go to the first declared. A match replaces the default percepts for the
  span it covers. The clause's polarity and quantifier carry over.
- **Safety**, as for rules (TTG-RFC-0003 §3.1): a malformed line, or a head variable missing
  from the pattern, is rejected and reported. A new `numbers` key, `construction_max_words`,
  bounds pattern length.
- **Reporting.** A tell read by a construction names it in its reply. New reply key:
  `read_by`, `{label}`. Its shape line is written as usual, so the owner can overrule it
  like any reading.
- **Languages.** Constructions contain words, so each language declares its own. They are
  not borrowed the way `rules` are.
- Adding a construction makes old sentences read differently. Re-reading already handles
  this: the owner sees the differences under the new grammar hash and takes them or not.
- **Later.** Give construction lines an optional `is_a <label>`, so constructions form the
  default-inheritance network CxG describes, run through the same specificity logic the
  reasoner uses for beliefs.

**Tests.** The caused-motion example writes `napkin move_off table`. *Where did the napkin
go?* answers from it. A sentence matching no construction reads exactly as today. Seed
episodes and bAbI are unchanged when the seed store declares no constructions. Once it
does, re-read lists exactly the sentences that changed.

**RFCs.** A new TTG RFC (TTG-RFC-0006, "Constructions"), plus kind lists in TTG-RFC-0001
§2–3 and the blueprint records.

---

## Phase 7 — Belief trajectories, the workable parts

**Status (2026-12-13): implemented in the runtime, the store, the tools and the tests.**
- **The engine's series.** `trajectoryOf(S, belief, min, hold)` returns each episode's sign,
  the runs and the shape (`TRAJ` codes, so the runtime holds no word). The prototype now uses
  it, so the report and the reply can't disagree.
- **The note.** A yes/no answer whose triple's sayings make *one crossing* or an *alternation*
  carries `trajectory_crossing` or `trajectory_alternation`, in English and Spanish: *Do I like
  tea?* is still a contest, and the note says three episodes one way, then three the other. No
  note for a fixed point, a crossing not yet held, too few episodes, or where the owner's tense
  already named the change. `trajectory_min_episodes: 3` and `trajectory_hold: 2` are in the
  numbers; without the first, replies are what they were, verdict and grounds alike.
- **Construction traffic.** `reread` returns `traffic`: each construction's sentences and
  episodes under today's grammar, an ancestor counting what its descendants read, and each
  re-read sentence names the constructions that read it now (`readBy`). `tools/reread.mjs`
  prints both, and `tools/trajectories.mjs` takes its traffic from there.
- The seed episodes re-read unchanged.

**Changed from the plan.** Traffic is today's, not a difference between the grammar the
episodes were read under and today's: episodes don't record which construction read them, so
the earlier count can't be recovered. Two reports, before and after a grammar change, show it.
The page's re-read panel shows only a count and is unchanged. The note is on yes/no answers
only, where a single triple is asked.

Upstream (toot-toot-engineering `2bef5e2`): TTG-RFC-0003 1.15 (§4 the shape of the sayings, §5
the numbers, Appendix A trajectories, informative, with the note's background and open questions),
TTG-RFC-0001 1.11 (§8–9), TTG-RFC-0005 1.6 (§5.1 construction traffic); synced here. The bAbI check is done: every outcome hash of tasks 1 and
15, in all five conditions, equals the one recorded in `paper/`.

**From:** [belief-trajectories.md](belief-trajectories.md), prompted by Haylett's geofinitism and
Takens' delay embedding (via the prototype `tools/trajectories.mjs`, `acee36c`). **Size:** medium.

**Problem.** A verdict can't tell a change of mind from a contest of equals. *I like tea* three
times, then *I don't like tea* three times, is a contest at 128; the prototype shows it is one
crossing. Today only the prototype, a command-line report, can say so, and it isn't in any RFC.

**Change.** Only the parts the note found workable; the rest stays open (below).
- **A note on contested and narrowly decided answers.** Where a triple's per-episode signs fall
  into runs the prototype would call *one crossing* or *alternation*, the reply adds a note
  naming them (*you said it in 3 episodes, then the opposite in the 3 after*). The note is beside
  the grounds, never a ground, and never changes the verdict.
  - Its wording is reply keys in both grammars (`trajectory_crossing`, `trajectory_alternation`,
    slots `{before}`, `{after}`, `{runs}`), so the runtime holds no word.
  - Its thresholds are numbers (`trajectory_min_episodes: 3`, `trajectory_hold: 2`), absent
    meaning no note.
  - The series code moves from the prototype into the engine (one function the page and the tool
    share), so the tool and the reply can't disagree.
- **Construction traffic in the re-read report.** `tools/reread.mjs` and the page's re-read list
  which constructions gained or lost sentences between the grammar the episodes were read under
  and today's, and which draw nothing.
- **Not taken now:** ranking by EPS (the store keeps salience per term, not per triple), a delay
  that counts lane time rather than episodes, and fleet series (both need TTG-RFC-0004 §4's
  stamps, which nothing implements).

**Tests.** The note appears for the tea, milk and jam histories and not for a fixed point or a
triple said fewer than `trajectory_min_episodes` times; every verdict and ground is unchanged
with the numbers absent and present; the prototype's `--json` output equals what the engine
function returns; the seed episodes re-read unchanged; bAbI tasks 1 and 15 keep their hashes.

**RFCs.** TTG-RFC-0003 §4 (the note and its keys), TTG-RFC-0001 §8–9 (keys and numbers),
TTG-RFC-0005 §5.1 (traffic in the re-read report). The note's §2 and §6, rewritten as spec text,
go into TTG-RFC-0003 as an informative section on trajectories, so nothing in the note is lost
when Phase 9 removes it.

---

## Phase 8 — The release page

**Status (2026-12-14): implemented.**
- **Example stores.** `examples/constructions_ttdb.md`, `clauses_ttdb.md`, `trajectories_ttdb.md`
  and `dos_lenguas_ttdb.md`, built by `tools/examples.mjs` from the seed's grammar (corpus emptied)
  and each one's sayings, one episode each. The same module lists every example's sample
  questions; `--check` says whether a rebuild would change any.
- **`?store=`.** `examplePath(p)` accepts only `examples/<name>_ttdb.md`. An example is read fresh,
  never saved (so the owner's local copy is untouched), labelled by `#storeinfo[data-example]`,
  and *Reset* reads it again. Blueprint 9 documents it. Checked in headless Edge: the example
  loads with `&ask=` answered, and `?store=../personal_grimoire_ttdb.md` falls back to the seed.
- **The page.** `release.html`: one section per highlight, three inline SVG figures (the
  inheritance network, a clause's spans, three sign series), 20 *try it* links, the comparison's
  summary and a phase-by-phase table with the idea each took and its spec commit, the bAbI table
  with outcome hashes, and provenance in three kinds with eleven references. Linked from the
  README and from the RFC list in `../index_ttdb.md`.
- **Tests.** Each example parses, round-trips, equals a fresh build, re-reads unchanged and
  answers its questions; `examplePath` refuses twelve other paths; every *try it* link names an
  example and a question the suite asks; the bAbI rows equal `paper/`; every citation has a
  reference; the page's links and anchors resolve.

**Changed from the plan.** The page's test counts are a floor, not an equality: each suite checks
it still has at least the number the page gives (629, 244, 24), so adding a test never breaks
the page. The site's front door keeps one card per top-level topic, so the page is a line in the
RFC list's TTG section rather than a card. The grammar matrix is not linked; it is private.

**From:** this plan's Phases 1–7, the TTG-RFC-0006 series (0.1–0.17), and the belief-trajectories
note. **Size:** medium.

**Problem.** The work is spread over six RFCs, a plan, a research note, a private comparison page
and a long run of commits. Nothing shows a reader what came of it, or lets them try it.

**Change.**
- **Example stores**, each a small grimoire TTDB beside the seed one (`examples/`), each with the
  sayings it needs already told, so a reader asks and gets an answer at once:
  - `constructions_ttdb.md`: caused motion, its inheritance network (abstract root, several
    parents, a tied verb, an idiom), questions read by shapes, *from*, and *leave* across
    languages.
  - `clauses_ttdb.md`: a stance's clause, a relative, a relative inside a stance's clause, a
    fronted adverbial clause, phrases after a shape.
  - `trajectories_ttdb.md`: the tea, milk, jam and cake histories, with the Phase 7 notes.
  - `dos_lenguas_ttdb.md`: Spanish beside English — *de* as *off*, *¿De dónde tiró Pixel el
    vaso?*, *¿Qué salió de la mesa?*, answered from either language.

  Each is built by a script from its sayings (as `tools/feed.mjs` builds the seed), checked by a
  test that re-reads it unchanged and answers its sample questions, and loads in the page through
  a new `?store=` parameter limited to files in `examples/`. That parameter is the one runtime
  change: no word, and the seed store stays the default.
- **The page**, `release.html` beside `index.html`, written for a reader new to the project:
  - one section per highlight: the file is the grammar (and bAbI's permuted run shows it);
    constructions and their inheritance; reading part of a clause; questions a shape answers;
    two languages, one motion; belief trajectories;
  - each with a small inline SVG figure (the inheritance network, a clause with the span a
    shape reads, a sign series with its runs) and a *try it* link that opens the example store
    with the question already asked (`index.html?store=examples/…&ask=…`);
  - the bAbI table and the test counts, as measured, with how to rerun them.
- **Provenance, on the page and per highlight**, in three kinds kept apart:
  - **ideas from the literature**, cited: LFG's COMP, TENSE and ADJUNCT (Kaplan & Bresnan,
    1982) for Phases 1, 3 and 4; P&P parameters (Chomsky, 1981) for Phase 5; usage-based
    entrenchment and preemption (Tomasello, 2003; Bybee, 2006) for Phase 2, and early *I think*
    as a stance marker (Diessel & Tomasello, 2001); Construction Grammar, caused motion and
    default inheritance (Goldberg, 1995) and idioms (Fillmore, Kay & O'Connor, 1988) for Phase 6;
    Laplace's rule of succession for confidence; bAbI (Weston et al., 2015) for the benchmark;
    Haylett (2026) and Takens (1981) for trajectories;
  - **the project's own design**, credited to its author: TTDB, the Toot Toot Grammar RFCs, the
    word-free runtime and the store as grammar;
  - **how it was built**: the comparison and Phases 1–9 were worked out in sessions with an AI
    coding assistant (Claude Code), as the commits' co-author lines record; the RFC commits are
    linked, so every claim on the page traces to the spec text and the commit that implemented it.
- **The comparison itself.** The Grimoire Grammar Matrix is a private artifact, so the page must
  not depend on it: its summary (the four theories, where PG sits, what each phase took) is
  written into the page, and the matrix is linked only if it is shared.
- **The site.** A record for the page in `index_ttdb.md`'s reader list, as TTG-RFC-0006 got, and
  a link from the grimoire's README.

**Tests.** Each example store parses, round-trips byte for byte, re-reads unchanged and answers
its sample questions as the page says it does; every *try it* link names an example that exists
and a question the test asks; `?store=` refuses a path outside `examples/`; the page's numbers
equal a fresh run (the test counts, the bAbI hashes in `paper/`); every citation on the page has
a reference entry.

**RFCs.** None. The page describes the RFCs; it adds nothing to them.

---

## Phase 9 — Retire the development documents

**From:** the plan's own end. **Size:** small. **Last**, after Phases 7 and 8 have shipped.

**Problem.** This plan, the research note and the working copies they leaned on were for
building. Once the RFCs, the README and the release page carry what they said, keeping them
leaves two accounts of the same thing to drift apart.

**Change.** Before deleting anything, check that what each document says that still matters is
somewhere that stays, and list where in the commit message.
- **Remove:**
  - `PLAN.md`, this document. Its status sections are in the RFC changelogs and the commits; its
    rationale and provenance are on the release page; its *Not planned* list goes to the
    README's limits.
  - `belief-trajectories.md`, once Phase 7 has put its spec text into TTG-RFC-0003.
  - `paper/Geofinitism.txt`, a working copy of a third-party article; the release page and the
    RFC cite it by URL instead.
- **Ask the owner first**, since they are records rather than working files:
  `paper/The File Is the Grammar.mhtml` (draft 0.1 as saved, which the paper's table names).
- **Keep:** the README, the RFCs, the paper, `paper/babi_*_results.json`, the tools (the
  trajectory tool among them) and the tests.
- **Fix what pointed at them:** the test section title and the tool header that name
  `belief-trajectories.md`, and any README link. The RFC changelogs that mention "PLAN.md phase
  6" are history and stay as written, upstream and in every copy.

**Tests.** The suites pass; `docs.test.mjs` finds no link to a removed file in any document that
stays; the site's reader list names no removed file.

**RFCs.** None.

---

## Not planned

- **Graded categories.** Nounish versus verbish stays a binary choice per segment. The owner
  can overrule any reading, which covers the cases grading would.
- **A grammar without the universal segment shape.** Radical CxG rejects it, but the
  alternating-segment reader is what makes the runtime language-neutral. Constructions
  (Phase 6) add patterns specific to a language on top of it instead.
- **Generating replies.** Replies keep quoting the owner. That is the provenance guarantee,
  and no theory in the comparison offers anything to replace it.

---

## Order and dependencies

| Phase | Depends on | Changes what old stores read? |
|---|---|---|
| 1 Stance links | — | only through re-readings the owner takes |
| 2 Verb frames | — | no, with default numbers |
| 3 Tense, modality | — | only through re-readings; check bAbI task 1 |
| 4 Modifiers | — | no, with `modifier: drop` |
| 5 Parameters | — | no |
| 6 Constructions | none required; easier after 4, which settles joined terms from phrases | only through re-readings the owner takes |
| 7 Trajectories | the prototype; 6 for construction traffic | no: a note beside the grounds, and only with its numbers declared |
| 8 Release page | 1–7, and the example stores it builds | no: examples are separate stores; the seed stays the default |
| 9 Retire the documents | 7 and 8 shipped | no |
