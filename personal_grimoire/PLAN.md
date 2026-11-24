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
   question, in every condition (`node tools/babi.mjs`). The seed store's eight episodes
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
toot-toot-engineering (`671b635`) and synced here. Still to do: the bAbI check, whose task data
isn't on this machine.

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
- Many Spanish past forms (*cazaron*, *gustaba*) are not lemmatized. This is an existing gap,
  unchanged by Phase 3. Where the verb is recognized, its past is marked.

Also fixed along the way: `tests/embed.test.mjs` now normalizes line endings as the store's
reader does. With `core.autocrlf=true`, git rewrites working copies with CRLF on checkout, and
the test failed on them.

RFC text: TTG-RFC-0005 1.3, -0004 1.1, -0003 1.3, -0002 1.5 and -0001 1.3, written upstream in
toot-toot-engineering (`b091171`) and synced here. Still to do: the bAbI check.

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
toot-toot-engineering (`a0baba4`) and synced here. Still to do: the bAbI check.

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
(`3b0e72e`) and synced here. Still to do: the bAbI check.

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
- A shape inside a relative or a stance's clause (*I think Pixel knocked the cup off the
  shelf*) isn't matched.
- Spanish has no caused-motion construction: *de* is both *off* and *of*.
- Questions aren't read by constructions (*What did Pixel sneeze off the table?*).
- ~~The `is_a` inheritance between constructions~~: done 2026-11-24, below.

Upstream (toot-toot-engineering `4795447`): TTG-RFC-0006 0.1, TTG-RFC-0001 1.6 and TTG-RFC-0003
1.6. Still to do: the bAbI check.

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

Known gap: a verbish name still can't be tied to one word.

Upstream (toot-toot-engineering `ec23b56`): TTG-RFC-0006 0.4.

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
