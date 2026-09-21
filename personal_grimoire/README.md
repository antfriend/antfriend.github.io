# Personal Grimoire

A one-page web app: **a corpus of your own words that answers in them.** You type sentences,
or feed in whole `.md` and `.txt` files, and the page breaks them into *percepts* — nounish
**things** and verbish **vectors** — forms beliefs about the things, reasons along the
vectors, and answers questions the way a primitive Q/A system or an LLM chat would. The
difference is that it can only ever say four kinds of thing: **what you said**, **what
follows from what you said** (with the chain shown), **that you have said both**, and **what
no longer holds** (with what you said since).

Static files, no build step, no dependencies. One TTDB file is the foundation, the
blueprint and the data; one HTML page runs it.

This folder is the corollary of [global_models](../global_models/) — the same corpus
discipline pointed inward instead of at the Earth. See [Corollaries](#corollaries).

---

## Run it

```bash
python -m http.server        # then open http://localhost:8000/
```

Opened straight from `file://`, the page cannot fetch its store and says so — and offers an
**Open a TTDB store…** button instead, so it still works with no server at all.

The page keeps your store in the browser (`localStorage`) after every change. **Download
store** gives you the whole file back, corpus included; **Open store…** loads any store;
**Reset to seed** throws your copy away; **Start empty** keeps the grammar and deletes every
episode and term, which is how you make the corpus your own.

---

## What is in here

| File | What it is |
|---|---|
| [index.html](index.html) | The app: a TTDB parser and round-trip writer, a rule interpreter, a consolidator, a reasoner, a small sphere. **No words of any language.** |
| [personal_grimoire_ttdb.md](personal_grimoire_ttdb.md) | The store. The blueprint, an English grammar and a Spanish one, every reply phrase, every constant, and the corpus. |
| [RFCs/](RFCs/) | The specs, five of them new. Start at [RFCs/INDEX.md](RFCs/INDEX.md). |
| [tests/](tests/) | Two Node scripts and a Spanish grammar fixture. No dependencies, no test runner. |
| [tools/](tools/) | Command-line access to the same engine: ask, feed, re-consolidate. |

---

## Tests

```bash
node tests/app.test.mjs      # the engine, headless, against the real store
node tests/docs.test.mjs     # the docs against the store and the engine
```

Both load `index.html`'s real script — the page only boots its UI when a DOM exists — so
they exercise the shipping code. Between them they check that the store round-trips byte for
byte and that a sync with nothing new rewrites nothing; that every stored belief recomputes
from its episodes; fifteen parses, from *Cats are mammals* to *Cats chase mice but they don't
eat grass*; fourteen questions and their verdicts; that the penguin answer names *bird* as the
ancestor it overrules and quotes the owner's own sentence; that a new statement lands at
`@LAT90LON9`, that its terms land in the right hemispheres beside the terms that introduced
them, and that the tail of the file survives the write; that saying the opposite of a belief
is reported at once and leaves the belief contested rather than overwritten; that *Start
empty* keeps exactly the kit, and that the fixture it keeps is never searchable as your words;
that a later place retires an earlier one in the order things were said, whatever clock the
host passed in, while a later denial of the same place stays a contradiction; and that the
store's description of the runtime's surface names exactly what the runtime exports. They
check the shapes too: fifteen readings, from *Pixel chases mice that eat cheese* to *Swim.*;
that every reading, in either language, reads back as itself; that marks overrule the parser
and a join makes one term; that *Coffee.* is a mention and *coffee* a look-up; that a
relative clause closes at the next verb, that a phrase's head sits where each language puts
it, and that what *or* joins or a stance verb takes is held — seen, never believed, never a
contradiction; and that an amendment stands in for a sentence without touching its episode,
and is withdrawn by reading the sentence back the episode's way.

And they check the claim the whole design rests on, three ways:

1. **Delete the grammar records** and the runtime sees only word order — *Cats are mammals*
   comes out as `cats | are | mammals`, with no copula, no plural and no class — and the
   librarian has no words at all.
2. **Swap in another language.** [tests/fixtures/es_ttdb.md](tests/fixtures/es_ttdb.md) is a
   small Spanish grammar on the same runtime. *Los gatos son mamíferos. Los gatos cazan
   ratones. Yo no como queso.* parses to `gato | es_un | mamífero`, `gato | cazar | ratón`,
   `yo | comer | queso | -`, and *¿Los gatos cazan ratones?* is answered *Sí.* The seed
   store goes further and keeps both: every English parse case still reads as English beside
   its Spanish grammar, and merging the two into one lexicon instead is shown to break three.
3. **Grep for leaks.** None of the 400-odd words the grammar lists appears as a string literal
   in `index.html`, no reply phrase is copied into it, and every number the store declares is
   named in it.

The first version of that third check failed on five words, and three of them were real:
`on` was a CSS class, `change` a DOM event name, and a comment quoted `ok`. Two were the
grammar colliding with the file format — `kind` and `said` are block keys as well as English
words — and block keys are schema, so the check exempts them by name. It caught three more
while shapes were built, all real: `none` as the name of a predicate with no vector, and
`am` and `keep` as a class and an action name in the reading controls.

`node tests/*.test.mjs` exits non-zero on failure.

`node tools/babi.mjs <task file>` runs a bAbI task (Weston et al., 2015; data not included)
through the same engine, with any adaptation as declared lines of grammar data, a
letter-permuted copy of grammar and data, and a control. The outcomes are unchanged, question
for question, since the parser learned shapes. Task 1, *single supporting fact*:
100% of 1,000 answers right with exactly the gold sentences quoted, from four lines of data;
54.9% with the `exclusive` flag removed. Task 15, *basic deduction*: 100% from one line. The
permuted runs match question by question. Results are in [paper/](paper/).

---

## The one design decision

### The file is the grammar

`index.html` knows how to split text, look a token up in a class, strip a suffix, walk a
typed edge and fill a `{slot}`. It does not know that *the* is a determiner, that *mice* is
the plural of *mouse*, that *is a* is transitive, or how to say *yes*. All of that is in the
store, south of the origin on the prime meridian:

| Record | Kind | Holds |
|---|---|---|
| `@LAT-10LON0` | `lexicon` | closed-class words, contractions, sentence punctuation |
| `@LAT-20LON0` | `morphology` | irregular forms, plural and verb suffix rules |
| `@LAT-30LON0` | `seed` | common verbs, a head start for finding predicates |
| `@LAT-40LON0` | `vectors` | structural roles, vector algebra, naming phrases |
| `@LAT-50LON0` | `questions` | the words that open each kind of question |
| `@LAT-60LON0` | `responses` | every phrase the librarian can say |
| `@LAT-70LON0` | `numbers` | every constant |
| `@LAT-80LON0` | `rules` | what follows from what, beyond the vector flags |

Spanish has the same records on the antimeridian, `@LAT-10LON180` to `@LAT-60LON180`, each
marked `lang: es`. It borrows the numbers and the vector algebra and supplies everything else.

That is *the file IS the model, the runtime is a generic interpreter* from global_models,
taken as literally for language as global_models took it for climate — and falsifiable the
same way. The runtime refers to grammar only by schema keys (`cop`, `class_of`,
`label_said`), the way global_models' app refers to `shift_deg_per_c` and never to 2.0.

### Corollaries

| global_models | personal_grimoire |
|---|---|
| The Earth as its instruments know it | A person as their words know them |
| `index.html` holds no climate number | `index.html` holds no word |
| A rendering is a pure function plus a `ttdb-render` block | A rule is a function kind plus a `ttdb-grammar` block |
| A measurement and a model output are never printed alike | **What you said and what follows from it are never printed alike** |
| A computed value declares its method and what re-runs it | A belief is derived and `node tools/consolidate.mjs` re-derives it |
| An undated collapse is drawn as its two ends, and no mean | A contradiction is quoted as both sayings, and no verdict |
| A planned layer names its blocker instead of being drawn | A word with no purchase is named instead of guessed |
| EPS decides the roadmap | EPS decides what the librarian asks you about |
| Latitude is real, so lanes need a `lane:` field | The sphere is a knowledge map, so lanes are latitudes again |
| Beliefs sit beside their subjects | Beliefs sit *inside* their subjects, as `belief:` lines |
| Bouvet Island holds the fixture | `@LAT99LON1` holds the fixture — with three malformed percepts |
| The South Pole switches discovery off | The South Pole declares a kind no viewer knows, so discovery stays on |

---

## The grammar sphere

The origin `@LAT0LON0` is **you** — the record your *I*, *me* and *my* resolve to. The prime
meridian is **the grammar**: nine blueprint records north of you, eight grammar records
south. **Things sit east, vectors west**, because the rule that decides which side a word
falls on belongs on the line between the sides. The antimeridian is the other line between
them, and holds **a second language**.

### Two languages

Each sentence is read by whichever grammar recognises more of its words, and a question is
answered in its own language. The languages share their structural vectors, so *es un* and
*is a* are one edge:

```
> ¿Es Pixel un animal?
Probablemente — se sigue de lo que dijiste.
  [inferido, no dicho] pixel es un cat → cat es un mammal → mammal es un animal
    — “Pixel is a cat.” “Cats are mammals.” “Mammals are animals.”
```

Content words are not translated: `gato` and `cat` are two terms until you say *Un gato es un
cat.* After that, anything said about cats in English is inherited by `gato` in Spanish.
What doesn't cross yet is at [`@LAT98LON7`](#roadmap).

A new term sits **beside the term that first gave it meaning**: *Pixel is a cat* puts
`pixel` a degree or two from `cat`, so the sphere clusters by meaning in the order meaning
arrived. With no partner a term hashes into its hemisphere. IDs never move (TTDB-RFC-0004).

Latitude 90 is the timeline — every episode, verbatim, `lon` = its ordinal. Latitude 91 holds
your corrections to how an episode was read, at the episode's own longitude. Latitude 98 holds
beliefs about the design, 99 the fixture, −90 the special record.

---

## The pipeline

Each stage is one blueprint record in the store and one section of an RFC.

1. **Read** — one input, one episode. Files are cleaned structurally; every sentence is kept.
2. **Classify** — function word or content word; noun and verb lemmas; then **segments**: a
   clause is any alternating run of nounish and verbish segments, each a phrase or a list, and
   six rules decide where a verbish one begins. *A candidate lemma the corpus already knows
   wins*, so the grammar gets better at exactly the words you use.
3. **Percept** — `sentence | subject | vector | object | polarity | quantifier`, one per verb,
   relating the segments either side of it. *Cats chase mice* is `cat | chase | mouse | + | -`;
   *I saw the man eat cheese* is two. Your verbs become the store's edge types. A one-word
   statement is a mention; what *or* joins or *I doubt* takes is held, polarity `?`; and every
   sentence's shape is written beside it.
4. **Terms** — a THING or VECTOR record per lemma, placed on the sphere.
5. **Consolidate** — per triple, count **episodes, not sentences**, for and against;
   conf = Laplace's rule of succession. One saying reads 170; *I like coffee* followed by *I
   do not like coffee* reads 128 and is **contested**.
6. **Reason** — said, then transitive, then inverse and symmetric, then rules, then inherited
   from the nearest `is_a` ancestor. Specificity is the only defeasible rule. Along an
   `exclusive` vector, a later object retires an earlier one.
7. **Answer** — find purchase, pick the intent from the shape of the input, and build the
   reply out of grounds.
8. **Write back** — only what changed; everything else byte for byte.

A ninth record, `@LAT85LON0`, is not a stage. It names the runtime's surface — where the
engine is, the calls, the store and reply objects, the page's conventions — so the engine can
be lifted into another app from the store alone.

---

## What it can answer

The seed store carries eight demo episodes from [tools/seed_corpus.txt](tools/seed_corpus.txt):
a small bestiary, a cat called Pixel, and one change of mind about coffee.

| You type | Intent | The librarian says |
|---|---|---|
| *Does Pixel chase mice?* | verify | Probably — it follows from what you said. |
| *Is Pixel an animal?* | verify | Probably — it follows from what you said. |
| *Can penguins fly?* | verify | No. |
| *Do I like coffee?* | verify | Your words disagree, and neither is chosen. |
| *Is a whale a fish?* | verify | Your words don't reach that yet. |
| *What eats cheese?* | subjectsOf | … eat cheese |
| *Where does Pixel sleep?* | objectsOf | pixel sleep_in … |
| *Tell me about penguins.* | portrait | What your words hold about penguin. |
| *Are penguins flightless?* | verify | Probably — it follows from what you said. |
| *¿Es Pixel un animal?* | verify | Probablemente — se sigue de lo que dijiste. |

*Does Pixel chase mice?* is answered with the chain `pixel —is a→ cat ⟹ cat —chase→ mouse`
and both sentences it rests on, labelled **inferred, not said**. *Can penguins fly?* quotes
*Penguins do not fly.* and adds that *penguin is an exception — bird would suggest
otherwise*. *Is a whale a fish?* ends *No purchase: whale, fish.*

Nobody said penguins are flightless. *Are penguins flightless?* is answered by a rule in
`@LAT-80LON0`, `not_fly X -, is_a X bird => has_property X flightless`, which joins *Penguins
do not fly.* to *A penguin is a bird.* and names itself in the chain.

### What no longer holds

`in` is declared `exclusive` in the grammar: a thing is in one place at a time. So order
matters along it, and only along it:

```
> Pixel moved to the kitchen.
Noted 1 percept from 1 sentence.
  …
This replaces something you said before.
> Is Pixel in the sun?
No longer — you said something since.
  [no longer] pixel sleep_in sun → pixel is in sun (sleeping somewhere is being there)
    — “Pixel sleeps in the sun.”
  since [inferred, not said] pixel move_to kitchen → pixel is in kitchen (moving somewhere puts you there)
    — “Pixel moved to the kitchen.”
```

*Later* is the order of the file — the episode, then the sentence — never a clock, so a
store needs none. The retired saying stays in its belief line and is still quoted; *I do not
like coffee* still contests *I like coffee*, because the flag compares places, not yes and no.
How several devices hearing one person could share that order is proposed in
[TTG-RFC-0004](RFCs/TTG-RFC-0004-Time-and-the-Fleet.md) §4, on the fleet pulse of
[TTN-RFC-0010](RFCs/TTN-RFC-0010-Fleet-Pulse.md).

Every answer lights the records it touched on the sphere, opens the first one, and writes
`last_query`, `last_answer` and `answer_records` into the store's cursor.

### How it read you

Under every tell, and under every sentence in an episode's panel, the page shows the sentence's
**shape**: nounish segments boxed as things, verbish ones dashed as vectors, the words between
them bare. The same shape is written into the episode, in the lexicon's marks:

```
said: 1 | Pixel chases mice that eat cheese.
shape: 1 | [pixel] {chases} [mice] that {eat} [cheese].
percept: 1 | pixel | chase | mouse | + | -
percept: 1 | mouse | eat | cheese | + | -
```

Any reading can be overruled. Tap a word, shift-tap to take in more, then mark the span a
*thing*, a *vector*, or *one term*. *I like fly fishing* reads `self | like | fishing`; make
*fly fishing* one term and it reads `self | like | fly_fishing`. Do it in the preview, before
you send, and the episode is written that way. Do it under a reply and press *keep this
reading*, and it becomes an **amendment**: a record at `@LAT91LON<n>` beside the episode
`@LAT90LON<n>`, holding the shape that stands and what it reads as. The episode is never
touched, the corrected saying still counts and quotes as the saying it was, and reading the
sentence back the episode's way withdraws the amendment.

You can also type the marks, or join words yourself. *Fruit flies like bananas.* reads
`[fruit] {flies} [like bananas]` — `fruit | fly | banana`, the famous wrong reading.
`[Fruit flies] {like} [bananas].` fixes the segments (`fly | like | banana`), and
`[Fruit_flies] {like} [bananas].` makes the insect one term (`fruit_fly | like | banana`). Once
the corpus holds a joined term, the words find it unmarked.

A sentence of one word is allowed. *Coffee.*, said as a statement, is kept as a **mention**:
the term is counted and searchable, and nothing is believed about it. Typed bare, *coffee* is
still a look-up.

Not everything you say is something you assert. *I doubt cats like fish.* reads
`[i] {doubt} [cats] {like} [fish]`: `self | doubt | -` is said, and `cat | like | fish | ?`
is **held** — written, counted and searchable, never believed, and never a contradiction of
*Cats like fish*. What *or* joins is held the same way (*Pixel is a cat or a dog*), and the
reply names what it held. A relative clause closes at the next verb, so *Cats that chase mice
are fast* is `cat | has_property | fast`, not a claim about mice. Which word of a phrase is
its head is the lexicon's to say: last in English, first in Spanish, so *el gato negro* is a
`gato`.

---

## Make your own

This file is meant to be forked, and there are four depths to fork it at.

1. **Your own corpus.** Press *Start empty*, then talk to it. Or run
   `node tools/feed.mjs notes.md journal.txt` against an emptied store. Download the store now
   and then; it is the only copy that leaves the browser.
2. **Your own language.** Rewrite the seven records south of the origin and leave
   `index.html` alone. [tests/fixtures/es_ttdb.md](tests/fixtures/es_ttdb.md) is a working
   minimal example — about sixty lines of grammar. Or keep English and add yours beside it,
   as the six Spanish records do: give each one `lang:`, supply `label:` lines instead of
   vector algebra, and you can ask in either language.
3. **Your own runtime.** The first eight blueprint records up the meridian are the whole
   contract, compressed: block formats, the percept line, placement, the conf formula, the
   inference order, the intent table, the write rules. The four TTG RFCs are their expansion,
   and the `mmpdb` constraints say what a runtime may and may not contain.
4. **This runtime, inside another app.** Point the app's developer, or its development agent,
   at the ninth, `@LAT85LON0`: `openStore`, `answer`, render the grounds by kind, persist
   `serializeStore(S.st)`. The first embedding by someone else found what that record now
   covers — function names, the store object, the boot gate, the `data-*` convention — had
   to come from this page and this README instead. `docs.test.mjs` now holds the record to
   the runtime's real exports.

---

## Roadmap

The order is EPS over the design beliefs in lane 98, as it was over the layers in
global_models.

| Record | Belief | conf | sal | EPS |
|---|---|---|---|---|
| `@LAT98LON5` | What the parser cannot see | 70 | 190 | **138** |
| `@LAT98LON8` | Order, not clocks: a fleet shares a tempo | 90 | 180 | **116** |
| `@LAT98LON4` | The lemmatizer is a guess the corpus corrects | 120 | 210 | **111** |
| `@LAT98LON7` | Two languages, one sphere | 100 | 140 | **85** |
| `@LAT98LON9` | A reading is a guess the owner can overrule | 150 | 160 | 66 |
| `@LAT98LON3` | Said outranks inferred; a contradiction is kept | 190 | 200 | 51 |
| `@LAT98LON1` | A verb is a vector, and the edge is the datum | 200 | 180 | 39 |
| `@LAT98LON6` | Mentions are not evidence | 215 | 150 | 24 |
| `@LAT98LON2` | Lanes are latitudes again | 230 | 60 | 6 |

**First, the parser's blind spots** — nesting deeper than a relative clause, attributive
adjectives, tense and modality, the scope of *not* over *or*. Every sentence passes through
them and they are the least settled thing here, though you can now correct any reading they
get wrong, and what the parser cannot tell is asserted is held rather than believed. The test for any fix is the one in `@LAT98LON5`: if it needs English in
`index.html`, it is the wrong fix. Each is a rule kind the grammar could declare.

**Second, the lemmatizer.** It is right about the words you use and wrong about the first use
of anything irregular, and a wrong first lemma becomes the term later uses are matched
against. Every merged surface form is visible on the term record's `forms:` line.

**Third, the second language.** Spanish brings blind spots English never showed: dropped
subjects (*No como carne*), verb-first questions (*¿Dónde duerme Pixel?*), and adjectives
that agree in number (*son negros*). Verbs link across languages only one rule at a time
(`cazar X Y => chase X Y`).

**Then, time across devices** — `@LAT98LON8`, second on the list before a line of it runs. One
store orders what you said by its file. Several agents hearing you (a phone, a Pi, a badge)
share no file and disagree about the time. The proposal is a band's: share a tempo, stamp each
saying with how far your clock can be trusted, and call two sayings contested when their
bounds overlap.

**And the readings you correct** — `@LAT98LON9`. A correction lives beside the episode, never
in it, and never counts twice. But a term you bind once is found everywhere after, silently at
parse time; the `forms:` line is the only place it shows.

**Not on the list: a recency rule for contradictions.** *I like coffee* on Monday and *I do not
like coffee* on Friday is a change of mind, and the store cannot tell it from a contradiction.
A recency window would be one line in the numbers record and a large claim about you. The
`exclusive` flag is not that: it is a claim about a relation, and it never settles yes against
no.

---

## Known limits

- **Chains are nearly flat.** A clause reads as alternating segments, each verb relating its
  neighbours; a relative clause closes at the next verb, but a stance inside a relative (*the
  man that says cats bark is tall*) holds the main clause too, and an object relative (*the
  dog that the cat chased*) is not read as one. Questions that invert word order beyond the
  declared forms fall back to search. Where it reads you wrongly,
  [correct the reading](#how-it-read-you).
- **Modifiers are dropped.** *Black cats* is *cats*, unless you make *black cats* one term.
- **Held is all-or-nothing.** *Pixel is a cat or a dog* holds both, which is safe but says
  less than you did; *not a cat or a dog* is held rather than denied; and *I think cats bark*
  meant as fact has to be said again plainly.
- **A file is one episode**, however long. One long document cannot outvote two typed remarks.
  That is a claim about what feeding a file in means — *here is something I read* — and it is
  written down at `@LAT98LON6`.
- **Replies quote rather than generate.** Articles and agreement are whatever your sentences
  had; a chain prints as triples.
- **`localStorage` is small.** Browsers allow a few megabytes. The page tells you if a save is
  refused; download the store before feeding it a library.

---

## Conformance

The store is a conformant TTDB (TTDB-RFC-0001) and exercises the failure paths on purpose:

- `@LAT99LON1` carries a **dead edge**, an **unknown header field** and **no `[ew]` block**,
  and an episode block holding **three malformed percept lines**, which the consolidator skips,
  counts and reports (the page's status bar says *3 malformed skipped*). Its `said:` line is
  not your words: only episode blocks at lat 90 are, so it is never quoted, searched or
  counted — including after *Start empty*, which keeps it. An earlier version did search it,
  and a code review of someone else's embedding caught that before this suite did.
- `@LAT-90LON0` is the South Pole special record, declaring a `kind` no viewer knows.
- The page implements TTCP-RFC-0001 §11 (weights shown with EPS) and §12 (edges as
  navigation, dead edges visibly dead), TTCP-RFC-0002 §2 and §5–6 for the sphere, and
  TTCP-RFC-0003 §2.2 record tokens and §6 search over the term list.

Not implemented: the guided tour, scene playback, side globes, URL sync (the page reads
`?ask=` to run a question on load and `?seed` to ignore the local copy, and nothing else).

---

## Credit and licence

Specs and format: [toot-toot-engineering](https://antfriend.github.io) by antfriend. The
demo sentences are invented. Licence: [LICENSE](LICENSE).
