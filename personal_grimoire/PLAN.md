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
Known gap: *¿Qué dudo?* is read as a question about a subject, so in Spanish the link is
written but this form of question doesn't reach it yet. That belongs to Phase 5.

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

Still to do: the RFC text upstream (TTG-RFC-0005 §3 and §6 to §8, TTG-RFC-0002 §5, TTG-RFC-0003
§5), and the bAbI check, whose task data isn't on this machine.

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
