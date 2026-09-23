# Personal Grimoire — a person as their words know them

```mmpdb
db_id: personal-grimoire-001
db_name: Personal Grimoire (a corpus of one person's words, and the rules that read it)
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix
umwelt:
  umwelt_id: the-owner-as-said
  role: librarian
  perspective: one person described by the sum of the words they have given it, and by nothing they have not
  scope: every sentence the owner types or feeds in, the terms those sentences are made of, and the beliefs that consolidate out of them
  constraints:
    - every-belief-cites-the-percepts-it-came-from
    - a-said-percept-and-an-inferred-one-are-never-printed-alike
    - a-contradiction-is-kept-not-resolved
    - an-unknown-word-is-reported-not-guessed
    - mentions-are-not-evidence
    - every-word-the-runtime-matches-and-every-phrase-it-answers-with-is-read-from-this-file
  globe:
    frame: grammar-sphere
    origin: "@LAT0LON0"
    mapping: "A knowledge map, not the Earth. The origin is the speaker. The prime meridian is the grammar itself - the blueprint north of the origin, the language rules south of it - because the rule that decides which side a word falls on belongs on the line between the sides. A second language's grammar sits on the antimeridian, the other line between the sides. Nounish THING terms sit in the eastern hemisphere, verbish VECTOR terms in the western. A new term sits beside the term that first gave it meaning, or where its lemma hashes when nothing did. Lat 90 is the episode timeline (lon = ordinal), lat 91 the owner's amendments to how an episode was read (same lon), lat 95 the documents about the store, lat 98 holds beliefs about this design, lat 99 the fixture, lat -90 the special record."
    note: "Latitude lanes are available here because the globe is a knowledge map again - the mechanism global_models had to replace with a lane: field. See @LAT98LON2."
cursor_policy:
  max_preview_chars: 256
  max_nodes: 64
typed_edges:
  enabled: true
  syntax: "type@LATxLONy"
  note: "Term edges are typed by the owner's own vectors: chase@<mouse>, not_fly@<fly>. Episodes use perceives@. Design records use supports / refines / contradicts / derived_from."
librarian:
  enabled: true
  primitive_queries: ["describe <term>", "verify <s> <v> <o>", "objects <s> <v>", "subjects <v> <o>", "search <words>"]
  max_reply_chars: 480
  invocation_prefix: "?"
```

```cursor
selected:
  - "@LAT95LON0"
preview:
  "@LAT95LON0": "README — the guide, shown where the reader lands. - Latitude 95 is a lane for documents about the store: north of the timeline at 90 and the corrections at 91, south of the design beliefs at 98. This is the record the cursor selects, so the page opens on …"
agent_note: "Seed store, 2026-09-13. The meridian carries the blueprint (north) and the English grammar (south). Eight demo episodes (lat 90) were fed through the page's own engine from tools/seed_corpus.txt: a small bestiary for inheritance and its exception (penguins), a pet for chains (Pixel), and one deliberate change of mind (coffee) that stands as a contested belief. Start empty to make the corpus your own. The cursor selects @LAT95LON0, the README record at lat 95, so a reader lands on the guide; it shows README.md itself rather than a copy of it."
last_query: "I do not like coffee."
last_answer: "Noted 1 percept from 1 sentence. [you said] self not_like coffee — “I do not like coffee.” (@LAT90LON8) [you have said both] self like coffee — “I like coffee.” (@LAT90LON7) “I do not like coffee.” (@LAT90LON8) This disagrees with something you said before."
answer_records: ["@LAT90LON8", "@LAT-7.4LON-174.2", "@LAT57.2LON41.5"]
```

---

@LAT0LON0 | created:1789257600 | updated:1789258020 | relates:love@LAT-53.1LON174,drink@LAT-2.8LON5
[ew]
conf:156
rev:4
sal:4
touched:1789258020
[/ew]

**self**

**Home — the speaker.** This record is three things at once, and so is the file it sits in.

1. **The foundation.** It is the term the owner's first-person words resolve to — *I*, *me*,
   *my* — so everything they say about themselves hangs off the origin of the sphere.
2. **The blueprint.** North of here, up the prime meridian, nine records compress the whole
   machine: [Read](lat10lon0), [Classify](lat20lon0), [Percept](lat30lon0),
   [Terms on the sphere](lat40lon0), [Consolidate](lat50lon0), [Reason](lat60lon0),
   [Answer](lat70lon0), [Write back and make your own](lat80lon0), and
   [the runtime's surface](lat85lon0). A reader who has only this file should be able to build
   a new runtime from the first eight, and embed this one from the ninth.
3. **The data.** South of here, the language: [closed-class words](lat-10lon0),
   [morphology](lat-20lon0), [seed vectors](lat-30lon0), [vector algebra](lat-40lon0),
   [question forms](lat-50lon0), [replies](lat-60lon0), [the numbers](lat-70lon0) and
   [the rules](lat-80lon0). On the
   far side, the antimeridian, [a second language](lat-10lon180) — ask in Spanish and it
   reasons over what you said in English. East and west, the owner's own terms. Up at lat 90,
   every episode, verbatim; at lat 91, beside each, any reading of it the owner corrected;
   at lat 95, [the README](lat95lon0).

**The runtime holds no words.** `index.html` knows how to split, match, strip a suffix, walk a
typed edge and fill a slot. It does not know that *the* is a determiner, that *mice* is the
plural of *mouse*, that *is a* is transitive, or how to say *yes*. Delete the lexicon record
and the parser finds no function words; delete the replies record and the librarian has
nothing to say. Swap the grammar records for another language's and the same page reads
that language — the test suite does exactly that with a small Spanish store.

Two corollaries of [global_models](https://github.com/antfriend/global_models) run through
everything: *a measurement and a model output are never printed alike* becomes **a thing
you said and a thing that follows from what you said are never printed alike**; and *the
file IS the model* becomes **the file IS the grammar**.

Specs: [the RFC corpus](../RFCs/index.html). Human guide: [the README](lat95lon0), which is
where the cursor starts.

```ttdb-sphere
thing_lon: 5 175
vector_lon: -175 -5
term_lat: -60 60
adjacent: 0.5 3
step: 0.1
episode_lane: 90
amend_lane: 91
self_lemma: self
```

```ttdb-term
class: thing
lemma: self
forms: self i
seen: 4
asked: 0
belief: love | pixel | + | 1 0 | 170
belief: drink | tea | + | 1 0 | 170
belief: like | coffee | ? | 1 1 | 128
```

---

@LAT10LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0

**Blueprint 1 — Read**
src: RFCs/TTG-RFC-0002-Semantic-Percepts.md §2

Input is a line typed into the one field, or a whole `.md` / `.txt` file. Both become one
**episode**. A file whose text contains an `mmpdb` fence is a store, not input, and is
offered as a store instead.

- **Clean** (files only, structural, no words): drop fenced code, inline code, images, HTML
  tags and URLs; a link keeps its label; heading marks, list bullets, emphasis and table pipes
  go. Headings, list items and table rows each end a sentence.
- **Sentences**: split after any `sentence_end` character from [lexicon](lat-10lon0) that is
  followed by whitespace, and at blank lines. Soft line wraps inside a paragraph join.
- **Tokens**: lowercase; runs of letters and digits with inner apostrophes. `whole:` entries
  replace a token outright (*can't* → *can not*); `contraction:` entries split a suffix off
  (*don't* → *do not*). A `list_sep` comma survives as a token because it separates
  the members of a list. The owner's marks (`nounish_marks`, `verbish_marks`) force the
  tokens between them, and a `phrasal_join` binds two words into one (`ice_cream`); a run of
  unmarked words that already names a term is bound the same way.
- **Language**: a store may hold several grammars, told apart by `lang:`. Each sentence is
  read by the one that recognises most of its words — closed-class words, seed verbs,
  irregular forms — with ties to the first; a question is answered in its own language. See
  [two languages, one sphere](lat98lon7).
- **Clauses**: split at `clause_break` characters and at `subord` words (*because*, *when*).
  A `conj` word (*and*, *but*) splits the clause **only** when both sides carry a predicate;
  straight before a verb it starts a clause that keeps the subject (*…and eat cheese*);
  otherwise it joins a list.

Every sentence is kept verbatim in the episode as a `said:` line (cut at `said_max_chars`),
whether or not it yields a percept — the corpus is the sum of the words, not the sum of
what parsed.

---

@LAT20LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT10LON0

**Blueprint 2 — Classify: nounish or verbish**
src: RFCs/TTG-RFC-0002-Semantic-Percepts.md §3
src: RFCs/TTG-RFC-0005-Shapes-and-Amendments.md §2

Every token is a **function word** (it belongs to a `class:` in [lexicon](lat-10lon0)) or a
**content word**. Every content word gets two lemmas from [morphology](lat-20lon0): a noun
lemma (plural rules) and a verb lemma (verb rules). Irregular tables win outright; a suffix
rule produces candidates, and **a candidate the corpus already knows wins**, then one in
[seed vectors](lat-30lon0), then the rule's default. The grammar is primitive and the
owner's words correct it: see [the lemmatizer belief](lat98lon4).

A clause is any alternating run of **nounish** and **verbish** segments — `N`, `V`, `N V`,
`N V N`, `N V N V N` … — each a whole phrase or a list. Read left to right, a verbish
segment begins where one of these rules fires:

1. an `aux` or `modal` (skipping `neg` and `adverb`), carrying through the `cop`, `hav` or
   content word after it → **verb**;
2. a `cop` (copula) word → if the next content word takes a verb rule ending in *-ing*, that is the
   verb (progressive); a declared `phrase:` or a `prep` after it joins it (*is part of*,
   *is in*); otherwise the segment is a **copula**;
3. a `hav` word with no participle after it → the `possession` vector;
4. a content word, after a nounish segment has begun, whose verb lemma is a known VECTOR term
   or a seed vector → **verb**;
5. a content word, after a nounish segment has begun, that runs straight into a `det`, `poss`
   or `quant` word, or whose verb rule is the `participle_ending` → **verb**;
6. exactly three content words and no function words at all → the middle one is the
   **verb**. Two bare content words are never a clause: *morning tea* is a search.

A verbish segment carries on through a `prep` that opens a noun phrase (*live in houses*)
and through an `infinitive` before a verb (*want to eat*). **The alternation is the
constraint**: a content word straight after a verbish segment is nounish (*like fly
fishing*), and a second verb in a clause needs a cue — a `relative` word before it (*mice
that eat*), a `conj`, or a noun phrase after it (*saw the man eat cheese*). A `conj` or
`list_sep` between two segments of one kind makes one list; two segments of one kind side by
side are one. So every labelling is a valid shape, and the owner may relabel any of it
([Percept](lat30lon0)).

Everything left is **nounish**. A sentence of one word is nounish unless the corpus knows the
word only as a verb. A noun phrase is an optional `det`/`poss`/`quant`, then
content words; its **head** is the last. A phrase introduced by a `prep` is a prepositional
phrase, never a subject or object. `self` words resolve to `self_lemma`; `anaphor` words
resolve to the most recent subject head in the same episode, or drop.

---

@LAT30LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT20LON0,derived_from@LAT98LON1

**Blueprint 3 — Percept: the unit of what was said**
src: RFCs/TTG-RFC-0002-Semantic-Percepts.md §4
src: RFCs/TTG-RFC-0005-Shapes-and-Amendments.md §3

A **percept** is one typed, directed claim: a THING, a VECTOR, and a THING or nothing.

```
percept: <sentence> | <subject> | <vector> | <object or -> | <+, -, ? or ?-> | <* all, ~ some, or -> [| <reading>]
```

- **Chain** → each verbish segment takes the nounish segment on its left as subject and the
  one on its right as object: `N1 V1 N2 V2 N3` is `(N1 V1 N2)` and `(N2 V2 N3)` — *I saw
  the man eat cheese* is `self see man` and `man eat cheese`. A relative clause closes at the
  next verb, which goes back to its antecedent: *cats that chase mice are fast* is about cats.
  A bare verb goes on with the relative instead while a finite verb is still to come, or
  after a chain verb: *the man that saw the cat eat cheese is tall* is `cat eat cheese` and
  a tall man. A chain verb is one the seed lists `chain`, or one the owner has said with a
  thing and then a bare verb that cannot be finite for it (*I spied the cat eat fish*). A relative with a subject of its own takes the antecedent as object (*the dog
  that the cat chased* is `cat chase dog`) when the verb takes a thing; when none does, it
  was a reported clause, and is held. A phrase's head is its last word or its first, as the
  lexicon's `head:` says.
- **Verb** → its verbs and particles joined by `phrasal_join`: *live in houses* →
  `live_in | house`, *want to eat cheese* → `want_to_eat | cheese`. No object → `-`.
- **Copula** → a `phrase:` from [vector algebra](lat-40lon0) at the start of the complement
  names the vector (*part of* → `part_of`); a `prep` names it directly (*is in the box* →
  `in`); otherwise the complement is a **class** (`class_of` role) when it carries a
  `det`/`quant`, when its plural rule changed it, or when it is already a THING with
  beliefs — and a **property** (`property` role) when it is a bare word.
- **Lists** distribute: *cats and dogs eat meat* is two percepts, *birds fly, swim and sing*
  three.
- **Polarity** is `-` when the verb, the subject or the object carries a `neg` word, or the
  subject a `quant_none`: *I like cats but not dogs* is `like cat +` and `like dog -`.
- **Quantifier**: `quant_some` → `~`; `quant_all`, or a `generic_det` (*a*, *an*), → `*`.
- A prepositional phrase after the object, or content words that formed no percept, add
  `comention` percepts between adjacent heads, at most `with_max_pairs` per sentence.
  [Mentions are not evidence](lat98lon6): they are searchable and never become beliefs.
- **Mention** → a subject or vector of `-`. *Coffee.* is `coffee | - | -`; *Feed the cat.*
  is `- | feed | cat`. Counted in `seen`, searchable, never a belief.
- **Held** → polarity `?`, or `?-` for a held denial: whatever a list or clause joined by an
  `alt` word says (*a cat or a dog*), the clause a `stance` verb or `stance_noun` takes (*I
  doubt* — *cats like fish*; *the idea that* — *cats bark*), and a clause a relative word reports (*I emailed the man that* — *the cat
  sleeps*). Said but not asserted: written and seen like a mention, never a belief, never a
  contradiction. A denied alternative is not held but denied, each member: *not a cat or a
  dog*.
- **Two readings** → where the grammar can read a sentence two ways, what both say is said and
  what only one says is held, **named** in a seventh column: `a` and `b` at the first such
  place, `c` and `d` at the next. *The men that saw the cats eat cheese* says `man see cat`
  and holds `cat eat cheese ? a` and `man eat cheese ? b` — one saying with two readings, which
  a reply and a question name together, until the owner says which was meant.

Percepts live in the episode that perceived them, beside the `said:` line they came from.
An episode is written once and **never rewritten**; it is the owner's episodic memory, and
it is how every belief proves where it came from.

```
@LAT90LON<n> | created | updated | relates:perceives@<term>,...
**Episode n — source**
ttdb-episode block: source:, at:, said: lines, shape: lines, percept: lines
```

**The owner's reading.** Each sentence's shape is written beside it in the lexicon's marks —
`shape: 1 | [birds] {can fly and swim}.` — and reads back to itself. Marks typed into the
input overrule the parser, an aside — `(i think) [cats] {bark}.` — is left out of the reading,
and a join (`ice_cream`) makes one term. A sentence already said
is re-read by an **amendment**: one record per episode at `@LAT91LON<n>`, beside
`@LAT90LON<n>`, holding the shape that stands and its percepts — and, where the owner chose
one of two readings, its letter (`reading: 1 | b`). Consolidation takes those in
place of the episode's own, still as that episode's saying, and the episode is never touched.

**Only the lane is the owner's words.** An episode is a `ttdb-episode` block at latitude
`episode_lane`. The same block anywhere else — [the fixture](lat99lon1) — is checked for
malformed lines and is never quoted, searched, counted or believed. *Start empty* deletes the
lane, so reading must draw the line in the same place deleting does.

---

@LAT40LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT30LON0,derived_from@LAT98LON2

**Blueprint 4 — Terms on the sphere**
src: RFCs/TTG-RFC-0002-Semantic-Percepts.md §5

Every distinct lemma in a percept's subject or object is a **THING** record in the east;
every vector is a **VECTOR** record in the west. The constants are this record's neighbour
at the origin, in the `ttdb-sphere` block.

- **Placement** (once; IDs are immutable, TTDB-RFC-0004): a new THING whose percept partner
  already has a record sits `adjacent` degrees from it — so *pixel* lands beside *cat*, and
  the sphere clusters by meaning in the order meaning arrived. Otherwise FNV-1a of the lemma
  picks a spot inside `term_lat` × `thing_lon` (or `vector_lon`), in `step` increments.
- **Collision**: `southeast_step` — one `step` south and one east until the ID is free.
- **Record**: header, `[ew]`, the lemma in bold, any prose the owner adds (preserved
  verbatim), then a `ttdb-term` block:

```
class: thing | vector      lemma:      forms: every surface form seen
seen: percept mentions     asked: queries that found purchase here
belief: <vector> | <object or -> | <+ - ?> | <for> <against> | <conf>
```

- **Header edges** are the decided beliefs, typed by the owner's vector: `chase@<mouse>`;
  a negative one takes the `negation_prefix`: `not_fly@<fly>`. An object-less belief points
  at the vector's own record. Contested beliefs get no edge — there is no direction to draw.
- **`[ew]`** (TTDB-RFC-0005): `conf` = mean belief conf (128 with none); `sal` = seen +
  asked, capped at 255; `rev` += 1 for each episode that changed the belief lines;
  `touched` = last write.

---

@LAT50LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT40LON0,derived_from@LAT98LON6

**Blueprint 5 — Consolidate: from percepts to beliefs**
src: RFCs/TTG-RFC-0003-Beliefs-Reasoning-Response.md §2

A belief is the consolidation of every percept, in the episodes on the lane, with the same
subject, vector and object.
This is TTDB-RFC-0007's Dream Cycle made deterministic for text: replay is a count, not a
random walk, and the count runs over **episodes, not sentences** — saying a thing five times
in one breath is one episode's worth of saying it.

- For each episode, a triple scores the largest weight of its `+` percepts and, separately,
  of its `-` percepts: 1, or `weight_partial` for a `~` (partial) percept. Sum across episodes:
  **for** and **against**.
- **Polarity**: `+` if for > against, `-` if against > for, `?` (contested) if equal.
- **conf** = round(255 × (max(for, against) + `prior_for`) ÷ (for + against + `prior_for` +
  `prior_against`)) — Laplace's rule of succession. No evidence reads 128, which is TBEW's
  default; one saying reads 170; a clean contradiction reads 128 again.
- A belief is **decided** when its polarity is not `?` and its conf exceeds
  `belief_conf_threshold` (TTDB-RFC-0007's 128). Only decided beliefs become edges.
- `comention` percepts never consolidate. [A contradiction is kept](lat98lon3): a `?`
  belief keeps both sayings and the librarian quotes both, with no verdict.

Beliefs are derived data and say so: `node tools/consolidate.mjs` replays every episode and
reports any belief line that has drifted from its percepts.

---

@LAT60LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT50LON0,derived_from@LAT98LON3

**Blueprint 6 — Reason along the vectors**
src: RFCs/TTG-RFC-0003-Beliefs-Reasoning-Response.md §3

Beliefs are formed about THINGS; reasoning travels along VECTORS. The algebra is declared
per vector in [vector algebra](lat-40lon0) with five flags — `transitive`, `symmetric`,
`inherits`, `weak`, `exclusive` — and an optional inverse. Anything more is a [rule](lat-80lon0):
`not_fly X -, is_a X bird => has_property X flightless`. Rule conclusions are recomputed in
memory after every episode, until a round adds nothing; the algebra runs at answer time.
Nothing inferred is ever written, and everything inferred is labelled as inference.

To **verify** `(s, v, o)`, stop at the first step that answers:

1. **Said**: a belief `(s, v, o)` exists → its polarity, or both sayings if contested.
2. **Transitive**: `v` is transitive and a chain of decided `+` beliefs along `v` joins s
   to o within `max_hops`.
3. **Inverse / symmetric**: `(o, inverse(v), s)` or, for a symmetric `v`, `(o, v, s)`,
   tried by steps 1–2.
4. **Rule**: a rule concluded `(s, v, o)` → its polarity, shown with its proof and label.
5. **Inherited**: walk the `inherits` vector (`is_a`) up from s, nearest ancestor first;
   the first ancestor holding a decided belief or rule conclusion on `(v, o)` answers.
6. Otherwise **unknown** — and the words that found no purchase are named, not guessed.

An inferred conf is the product of the chain's confs (as fractions of 255) times
`inherit_decay` per hop beyond the first. **Specificity is the only defeasible rule**: a
said belief outranks any inference, and the nearest ancestor outranks a farther one — so
*penguins do not fly* stands against *birds fly*, and the answer says which ancestor was
overruled. `weak` vectors are never walked.

**Time enters in one place.** Along an `exclusive` vector (`in`) a subject holds one object at
a time, so a later saying, or a rule conclusion from one (*Mary moved to the garden*),
**retires** an earlier object unless the two lie on one chain (*the kitchen is in the house*).
Verify answers a retired triple before step 1 — *no longer*, quoting what was said and what
was said since — unless its belief is contested; no walk passes through it; nothing about it
is written. *Later* means later in the file: the episode's place on the lane, then the
sentence. Expansion: [TTG-RFC-0004](../RFCs/index.html?rfc=TTG-RFC-0004-Time-and-the-Fleet.md).

---

@LAT70LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT60LON0

**Blueprint 7 — Purchase and answer**
src: RFCs/TTG-RFC-0003-Beliefs-Reasoning-Response.md §4

Input words **find purchase** when their lemma — either candidate — names a term. Words
that find none are listed back, never guessed at.

The intent comes from the shape of the input, using [question forms](lat-50lon0):

| Shape | Intent | Example |
|---|---|---|
| no `question_mark`, no leading `wh`/`aux`/`cop`/`modal`, has a predicate | **tell** — perceive and write an episode | *Pixel is a cat.* |
| leading `aux`/`cop`/`modal`, or a predicate with `?` | **verify** `(s, v, o)` | *Does Pixel chase mice?* |
| `wh_thing` + `aux`/`modal` + subject + verb | **objects** `(s, v, ?)` | *What do cats chase?* |
| `wh_thing` + verb + object | **subjects** `(?, v, o)` | *What eats cheese?* |
| `wh_place` | **objects** along the place vector | *Where does Pixel sleep?* |
| `wh_thing` + `cop` + noun phrase, an `about` word, or at most `describe_max_words` content words | **describe** | *Tell me about penguins.* |
| `wh_reason` + a yes/no clause | **verify**, shown as its chain | *Why can't penguins fly?* |
| anything else with purchase | **search** the `said:` lines, ranked by the rarity of the matched lemmas | *morning tea* |

A reply is a **verdict** from [replies](lat-60lon0) followed by **grounds**, each one of
four kinds, printed four ways: `said` (the owner's sentence, quoted, with its episode),
`inferred` (the chain, never quoted as if said), `contested` (both sayings), `no longer` (a
retired fact, then what retired it). A held saying is never a ground: a tell names what it held
in a note, and a question its grounds cannot answer names each held saying it meets — with both
readings, where the grammar read it two ways. Every answer
increments `asked` on the terms it found purchase on, and writes `last_query`,
`last_answer` and `answer_records` into the cursor (TTDB-RFC-0002). When a purchased term's
EPS reaches `suggest_eps_min`, the librarian asks the owner about it: the most-used,
least-settled thing is what it most needs to hear more about.

---

@LAT80LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT70LON0

**Blueprint 8 — Write back, and make your own**
src: RFCs/TTG-RFC-0002-Semantic-Percepts.md §6

**Writing.** The page keeps the store in the browser (`localStorage`) after every change and
offers it back as a download; it can also open any store. On every write:

- every chunk the runtime does not manage is preserved **byte for byte** (TTDB-RFC-0001 §5)
  — the mmpdb block, this blueprint, the grammar, the belief lane, the fixture;
- in a managed term record only the header's `updated` and `relates`, the `[ew]` block and
  the `ttdb-term` fence are replaced; prose the owner wrote there stays;
- episodes are appended and never touched again; an amendment (lat 91) is the one record per
  episode that is rewritten in place, and is deleted when it amends nothing; new records go in
  before the first lane-98 record, in the order they were made;
- parsing a store and writing it back unchanged reproduces the file exactly.

**Making your own.** This file is the kit. To start a corpus of your own, keep everything on
the meridian and in lanes 98–99 and delete every lat-90 episode, every lat-91 amendment and every
east/west term record except Home (the page's *Start empty* does this). To make a grammar for another
language, rewrite the records south of the origin — lexicon, morphology, seed vectors,
algebra, questions, replies — and leave the runtime alone; the constraints in `mmpdb` say
what a runtime may and may not contain. To make a new runtime, the nine blueprint records
and the block formats above are the whole contract, and the four TTG RFCs are their
expansion. To put this runtime inside another app, read [the runtime's surface](lat85lon0).

---

@LAT85LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT0LON0,depends_on@LAT80LON0

**Blueprint 9 — The runtime's surface: embedding it**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §10

Blueprints 1–8 say what the machine does; this says how to hold it. It names the reference
runtime, `index.html`, so an agent pointed only at this file can lift the engine into another
app without reading the page.

**The engine and the page.** `index.html` has one classic `<script>`. Above the comment line
*The page. Everything below touches the DOM* is the engine: pure functions over strings, no
DOM, no clock, no storage, no network. It ends by defining the constant **`PG`**, the whole
public surface. The page below it runs only behind a **boot gate** — `boot()` is called if
`document` exists *and* an element `#app` exists — so the script loads silently anywhere else.
`PG` is a top-level `const`, not a `window` property: to capture it, evaluate the script text
with `;globalThis.<name> = PG;` appended (`tools/harness.mjs` does exactly this in Node).

**The lifecycle.** `now` is always unix seconds passed in; the engine never reads a clock.

| Call | Returns | Mutates `S` |
|---|---|---|
| `openStore(text)` | `S`, the open store | — |
| `answer(S, text, now, source?, shapes?)` | a reply (below) | tell: a new episode and its terms, read from `shapes` (one shape per sentence) where given. Every intent: `asked` on purchased terms, the cursor |
| `ingestFile(S, name, text, now)` | `{ ep, msg }`, or `null` for no sentences | one episode for the whole file, the cursor |
| `replyText(S, reply)` | the reply as plain text | — |
| `serializeStore(S.st)` | the store text — persist it yourself, after every call that mutates | — |
| `startEmpty(S, now)` | — | deletes the lane-90 episodes, the lane-91 amendments and every term but `self_lemma` |
| `shapeOf(S, text, reading?)` | `{ shape, items, percepts, reading, lang }`: how the text reads — marks in it overrule the parser; `items` are `{ w, cls }`, `cls` `N`, `V` or empty. Where the grammar reads it two ways, a percept of one reading carries `reading` (a letter), and `reading`, the letters of an owner's choice, reads the chosen one alone | — |
| `shapeText(S, items)` | the shape those items make, in the grammar's marks | — |
| `readingsOf(S, episodeId)` | `[{ n, text, shape, amended, grammar, reading }]`: each sentence with the reading that stands; `grammar` is the hash a taken re-reading came from, `reading` the letters of an owner's choice between two readings | — |
| `amendReply(S, episodeId, n, shape, now, grammar?, reading?)` | a reply as for a tell, or `null` (also for a `grammar` hash that is not the store's now); `reading` chooses between two readings by letter; `amend(…)` returns the bare write | the episode's amendment record, terms, the cursor |
| `reread(S, episodeId?)` | `{ grammar, sentences, changed }`: each sentence (of every episode, or one) the grammar now reads differently from its episode, as `{ episode, n, text, amended, accepted, shape, reads, reading, was, now }` (`shape` is `null` for an episode written before shapes), under a hash of the grammar records, each read in the context the sentences before it stand as. To take one, `amendReply(S, episode, n, reads, now, grammar, reading)` | — |
| `takeRereads(S, grammar, now)` | `{ grammar, took, kept }`, or `null` for a hash that is not the store's now: every sentence not amended that reads differently, taken in episode order, each re-read just before it is taken; `kept` are the ones the owner has amended | amendment records, terms |
| `interpret(S, text)` | `{ intent, purchase, … }` without acting | — |
| `verify(S, s, v, o)`, `objectsOf(S, s, [v])`, `subjectsOf(S, v, o)`, `portrait(S, lemma)`, `searchSaid(S, [lemma])` | raw reasoning, lemmas in | — |

Intents are `perceive`, `verify`, `objectsOf`, `subjectsOf`, `portrait`, `search`. With more
than one language: `pickGrammar(S, text)` returns the grammar a text reads as, and
`withGrammar(S, G, fn)` runs `fn` under it — `answer`, `ingestFile` and `replyText` already
do both. Also on
`PG`, for tools and tests: `parseStore`, `parseRecord`, `parseBlock`, `records`, `epsOf`,
`loadGrammar`, `say`, `sentencesOf`, `tokenize`, `nounLemma`, `verbLemma`, `perceiveSentence`,
`perceive`, `consolidate`, `syncTerms`, `termState`, `markAsked`, and `SLOT` — the NUL
character that stands for the hole a question asks the corpus to fill.

**The store object `S`.** `st` (parsed chunks; the source of truth, serialise this); `G`
(the grammar in use, normally the first language's) and `grammars` (one per `lang:`); `things` and `vectors` (Map lemma → `{ chunk, cls, lemma, forms,
asked }`); `episodes` (lane chunks) and `offLane` (other episode blocks, checked only);
`amends` (Map episode longitude → `{ chunk, entries }`, the amendment on `amend_lane`); `trips` (Map `"s|v|o"` → `{ s, v, o, pol, conf, fr, ag, decided, sources }`); `derived`
(Map `"s|v|o"` → a rule conclusion `{ s, v, o, pol, rule, proof }`, never written); `superseded` (Map
`"s|v|o"` → `{ fact, by }`, each `{ s, v, o, t, path }`: what an `exclusive` vector retired and the later
fact that retired it, never written); `said` (Map
episode ID → Map sentence number → sentence); `malformed` (`{ id, line }`); `usage` (Map vector →
`{ thing, lone }`, how many standing sayings, said or held, give it a thing or none); `held` (the
held sayings, `{ s, v, o, pol, ep, n, reading }`) and `heldIn` (Map `"<episode>#<n>"` → the percepts
of a sentence read two ways); `chainSaid` (Map language → the chain verbs the owner's words show). `PG.records(S.st)`
lists records as `{ id, key, lat, lon, title, body, edges, conf, sal, eps, … }`.

**A reply.** `{ intent, lang, query, verdict, head, items, portraits, search, notes, purchase:{
found, missing }, records, episode }`; after a tell, `episode` is `{ id, percepts, mentions, conflicts, superseded, … }`. Each item is a ground `{ kind, pol, path, quotes, … }`
where `kind` is `direct` (print with `label_said`), `inference` (`label_inferred`, and it
carries `via`) `conflict` (`label_contested`) or `superseded` (`label_superseded`, carrying `by`, a ground of
the first two kinds printed after `superseded_by`); `path` is the chain of beliefs; `quotes` are
`{ ep, n, text, pol }`. A portrait is `{ lemma, head, direct, inferred, incoming, uses, withs }`,
the first four lists of grounds. Four kinds, printed four ways — [Blueprint 7](lat70lon0) —
is the host's job too. `records` are IDs to highlight; `search` is `{ ep, n, text, score, hit }`;
`replyText` shows one plain rendering of all of it.

**The page's conventions**, for a host that keeps the page. Any element with **`data-key`**
selects a record on click (one delegated listener); the value is `lat|lon` to four decimals.
**Every chrome string lives in a `data-*` attribute on the markup**, never in the script:
`#storeinfo[data-seed|data-local|data-opened]`, `#mode[data-<intent in kebab case>]`,
`#reset[data-confirm]`, `#empty[data-confirm]`, `#files[data-confirm-store]`, `#log[data-quota]`,
`#rereads[data-label|data-confirm|data-done]` (the store bar's count of re-readings not yet ruled on, `{n}` filled in),
`#preview[data-nounish|data-verbish|data-aside|data-join|data-keep|data-amended|data-reread|data-accept|data-accepted|data-pick|data-reading]` — the labels of a reading's
controls, where each word is a button carrying `data-row`. The
store persists under `localStorage` key `personal_grimoire:store:v1`; `?seed` ignores that copy
and `?ask=<text>` asks on load. The page fetches `personal_grimoire_ttdb.md` beside itself.

**Embedding, in one line:** take the engine, `openStore` your copy of this file, `answer`
each input, render grounds by `kind`, and write `serializeStore(S.st)` wherever your app keeps
data. The grammar and every reply word come with the store; your app supplies only chrome.

---

@LAT-10LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT20LON0

**Grammar — closed-class words (English)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §3

The function words: everything the parser treats as structure rather than content. A word
may sit in several classes; each rule asks for the class it needs. `self` words resolve to
the speaker at the origin. Punctuation that ends sentences and clauses is declared here too,
because which marks do that is a fact about a language.

```ttdb-grammar
kind: lexicon
lang: en
class: det | a an the this that these those
class: poss | my your his her its our their
class: quant_all | all every each any
class: quant_some | some many most few several
class: quant_none | no
class: self | i me my mine myself
class: anaphor | it they them he him she
class: prep | in on at of to from by with for about into onto over under near between through after before during without within across against toward towards among inside outside behind beside beyond
class: conj | and or but nor
class: alt | or
class: subord | because so if then than when while although though since unless whereas
class: relative | that which who
class: infinitive | to
class: aux | do does did
class: cop | am is are was were be been being
class: hav | has have had having
class: modal | can could will would shall should may might must
class: neg | not never nothing none nobody
class: wh | what who whom which where when why how whose
class: adverb | very really just also only even still quite too always often usually sometimes rarely already again here there now ever
class: filler | yes ok okay oh well please thanks hello hi
whole: can't | can not
whole: won't | will not
whole: cannot | can not
whole: it's | it is
whole: that's | that is
whole: what's | what is
whole: who's | who is
whole: where's | where is
whole: let's | let us
contraction: n't | not
contraction: 're | are
contraction: 'm | am
contraction: 've | have
contraction: 'll | will
contraction: 'd | would
contraction: 's |
sentence_end: . ! ?
clause_break: ; :
question_mark: ?
list_sep: ,
generic_det: a an
nounish_marks: [ ]
verbish_marks: { }
aside_marks: ( )
head: last
```

---

@LAT-20LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT20LON0,supports@LAT98LON4

**Grammar — morphology (English)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §4

How surface forms reduce to lemmas. Irregular tables are checked first. A suffix rule reads
`ending | replacement | alternatives`, where `-` is the empty string and `~` means *undouble
the last consonant*; rules are tried top to bottom and the first ending that matches (and
is not guarded) produces the candidates. Which candidate wins is decided in
[Classify](lat20lon0): known term, then seed vector, then default — and the default for `~`
is to undouble only when the stem really ends in a double consonant outside `double_keep`.
A verb in its lemma's own form is **bare**; `bare_finite` says which subjects that form is
also finite for — *cats eat*, *I eat*, never *the cat eat* — which is how a relative knows
that *the man that saw the cat eat cheese* is not the man eating. A word the lexicon does not
list that ends in `adverb_ending`, between a thing and its verb, is an adverb (*the cat
quickly chased*); `adverb_guard` names the words that only look like one.

```ttdb-grammar
kind: morphology
noun_irregular: mice | mouse
noun_irregular: children | child
noun_irregular: people | person
noun_irregular: men | man
noun_irregular: women | woman
noun_irregular: feet | foot
noun_irregular: teeth | tooth
noun_irregular: geese | goose
noun_irregular: wolves | wolf
noun_irregular: leaves | leaf
noun_irregular: knives | knife
noun_irregular: lives | life
noun_irregular: wives | wife
noun_irregular: halves | half
noun_irregular: shelves | shelf
noun_keep: news species series physics mathematics lens bus gas glass class grass kiss boss chaos iris this his is was has does yes always perhaps
plural: ies | y
plural: sses | ss
plural: shes | sh
plural: ches | ch
plural: xes | x
plural: zzes | zz
plural: oes | o
plural: s | -
plural_guard: ss us is
verb_irregular: am is are was were been being | be
verb_irregular: has had having | have
verb_irregular: does did done doing | do
verb_irregular: ate eaten | eat
verb_irregular: went gone goes | go
verb_irregular: saw seen | see
verb_irregular: made | make
verb_irregular: took taken | take
verb_irregular: gave given | give
verb_irregular: knew known | know
verb_irregular: thought | think
verb_irregular: found | find
verb_irregular: told | tell
verb_irregular: said | say
verb_irregular: got gotten | get
verb_irregular: came | come
verb_irregular: ran | run
verb_irregular: wrote written | write
verb_irregular: flew flown flies | fly
verb_irregular: grew grown | grow
verb_irregular: left | leave
verb_irregular: felt | feel
verb_irregular: kept | keep
verb_irregular: held | hold
verb_irregular: brought | bring
verb_irregular: bought | buy
verb_irregular: caught | catch
verb_irregular: taught | teach
verb_irregular: fought | fight
verb_irregular: built | build
verb_irregular: sent | send
verb_irregular: meant | mean
verb_irregular: lost | lose
verb_irregular: sat | sit
verb_irregular: stood | stand
verb_irregular: began begun | begin
verb_irregular: drank drunk | drink
verb_irregular: swam swum | swim
verb_irregular: sang sung | sing
verb_irregular: spoke spoken | speak
verb_irregular: broke broken | break
verb_irregular: chose chosen | choose
verb_irregular: drove driven | drive
verb_irregular: rode ridden | ride
verb_irregular: fell fallen | fall
verb_irregular: forgot forgotten | forget
verb_irregular: hid hidden | hide
verb_irregular: bit bitten | bite
verb_irregular: led | lead
verb_irregular: fed | feed
verb_irregular: met | meet
verb_irregular: slept | sleep
verb_irregular: won | win
verb_irregular: hung | hang
verb_irregular: woke woken | wake
verb_irregular: wore worn | wear
verb_irregular: threw thrown | throw
verb_irregular: drew drawn | draw
verb_irregular: became | become
verb_irregular: lay lain | lie
verb: ies | y
verb: sses | ss
verb: shes | sh
verb: ches | ch
verb: xes | x
verb: oes | o
verb: s | -
verb: ied | y
verb: ed | - | e ~
verb: ing | - | e ~
verb_guard: ss us is
progressive_ending: ing
participle_ending: ed
double_keep: l s f z
min_stem: 2
bare_finite: plural self
adverb_ending: ly
adverb_guard: family belly jelly lily ally bully fly july italy assembly anomaly
```

---

@LAT-30LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT20LON0

**Grammar — seed vectors (English)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §5

Common verb lemmas, so the parser recognises a predicate before the owner has used it
twice. It is a head start and nothing more: once the owner uses a word as a verb it is a
VECTOR term, and the corpus recognises it without this list. Words here that are also
nouns (*fly*, *play*, *work*) are resolved by position, not by membership. `stance` verbs
take a clause the speaker does not assert; `chain` verbs take a thing and then a bare verb
that thing does (*saw the cat eat*), which is how a relative knows to keep such a verb
([TTG-RFC-0005 §3](../RFCs/index.html?rfc=TTG-RFC-0005-Shapes-and-Amendments.md)). `stance_noun` lists the
nouns whose clause is held the same way (*the idea that cats bark*); they are things, not
seeds. `intransitive` verbs take no thing, so a relative word before one never makes its
antecedent the verb's object (*the rule that cats bark*). Both lists are head starts too: the
owner's words outrank them. A verb the owner says with a thing takes one, a verb said or held
only without one takes none (*I doubt dogs bite*), and a verb said with a thing and then a bare
verb that cannot be finite for it is a chain verb (*I spied the cat eat fish*).

```ttdb-grammar
kind: seed
seed: eat drink like love hate want need know think believe see hear feel make give take get find keep hold bring buy sell use help build write read say tell call show teach learn play work move run walk swim fly climb jump sleep live grow chase hunt catch fight fear avoid protect cause produce create contain include carry own lose win change become follow lead open close start stop begin end enjoy prefer remember forget visit meet watch wear sing cook bake drive ride travel study speak mean seem hide bite kill save pay send cut draw paint dream wish hope miss plan try purr bark smell taste lay sit stand fall wake throw lie belong depend
stance: think believe doubt suppose guess hope wish wonder fear suspect imagine assume expect pretend dream say claim tell show warn remind promise convince persuade inform assure email text mention explain admit announce
chain: see hear watch feel notice make let help
stance_noun: fact idea news claim rumor rumour story belief hope fear feeling sense notion theory chance possibility proof sign thought suspicion hunch worry
intransitive: sleep purr bark arrive die laugh smile cry sit fall wake lie belong depend happen exist seem rest wait come go
```

---

@LAT-40LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT60LON0,refines@LAT30LON0

**Grammar — vector algebra and phrases (English)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §6

What the grammar's own vectors mean, and the multi-word phrases that name them. A `role:`
line tells the runtime which vector plays a structural part — the runtime asks for the
`class_of` role, never for a word. A `vector:` line reads
`name | flags | inverse | label`, where the label is how an answer prints the vector.
`exclusive` means one object at a time: *Mary is in the garden* retires *Mary is in the
kitchen* if it was said later, and the answer shows both. Owner vectors that are not
declared here have no algebra: they are said or not said, and they inherit down `is_a`
like everything else.

```ttdb-grammar
kind: vectors
role: class_of | is_a
role: property | has_property
role: possession | has
role: comention | with
role: episode_edge | perceives
role: negation_prefix | not_
role: phrasal_join | _
role: amend_edge | amends
vector: is_a | transitive | - | is a
vector: has_property | - | - | is
vector: has | - | part_of | has
vector: part_of | transitive | has | is part of
vector: in | transitive exclusive | contains | is in
vector: contains | transitive | in | contains
vector: equals | symmetric transitive | - | is the same as
vector: opposes | symmetric | - | is the opposite of
vector: causes | transitive | - | causes
vector: with | symmetric weak | - | is mentioned with
inherits: is_a
phrase: part of | part_of
phrase: made of | made_of
phrase: kind of | is_a
phrase: type of | is_a
phrase: same as | equals
phrase: opposite of | opposes
phrase: full of | contains
```

---

@LAT-50LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT70LON0

**Grammar — question forms (English)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §7

Which words open which kind of question. The shapes themselves are in
[Purchase and answer](lat70lon0); this record only says which English words fill them.
`wh_place` names the vector a *where* question travels along, and a verb in that question
tries its own phrasal form first (*where does Pixel sleep* → `sleep_in`).

```ttdb-grammar
kind: questions
wh_thing: what who whom which
wh_place: where | in
wh_reason: why
about: tell describe explain define about
describe_max_words: 2
```

---

@LAT-60LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT70LON0

**Grammar — replies (English)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §8

Every phrase the librarian can say. `{slots}` are filled by the runtime with terms, counts
and quotes; a `unit_` line gives the singular and plural of a counted noun. Translate this
record and the librarian speaks another language; delete it and the librarian can still
show grounds, but has no words of its own to put around them.

```ttdb-grammar
kind: responses
label_said: you said
label_inferred: inferred, not said
label_contested: you have said both
affirm: Yes.
deny: No.
affirm_inferred: Probably — it follows from what you said.
deny_inferred: Probably not — it follows from what you said.
contest: Your words disagree, and neither is chosen.
unknown: Your words don't reach that yet.
exception: {term} is an exception — {via} would suggest otherwise.
no_purchase: No purchase: {words}.
noted: Noted {percepts} from {sentences}.
noted_nothing: Kept your words, but no percept formed — nothing to reason along yet.
noted_mention: Noted {terms} — named, with nothing said about it yet.
noted_held: Kept, not believed — you said it as a choice or a stance, not as fact: {triples}.
noted_readings: Kept, not believed — I can read that two ways, and hold both until you say which you meant: {readings}.
reading_pair: either {a}, or {b}
asked_held: You said it, but not as fact: “{text}” ({ep}).
asked_readings: You said “{text}” ({ep}), which reads two ways, and not which you meant: {readings}.
amended: Read again as you marked it: {percepts}.
amend_title: Amendment {n}
contradicts: This disagrees with something you said before.
supersedes: This replaces something you said before.
label_superseded: no longer
superseded_by: since
deny_superseded: No longer — you said something since.
describe_head: What your words hold about {term}.
describe_empty: {term} is in your words, but nothing has been said about it yet.
points_here: What points at {term}
mentioned_with: mentioned with
objects_head: {s} {v} …
subjects_head: … {v} {o}
nothing_found: Nothing in your words fits.
search_head: The closest things you have said
suggest: You bring up {term} often, and your words about it are unsettled (EPS {eps}). Tell me more about {term}?
ingested: Read {file}: {sentences}, {percepts}, {terms} new.
episode_title: Episode {n} — {source}
source_typed: typed
store_opened: Opened a store instead of reading it as words: {file}.
unit_percept: percept | percepts
unit_sentence: sentence | sentences
unit_term: term | terms
```

---

@LAT-70LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT50LON0,refines@LAT60LON0,refines@LAT70LON0

**Grammar — the numbers**
src: RFCs/TTG-RFC-0003-Beliefs-Reasoning-Response.md §5

Every constant the consolidator, the reasoner and the librarian use. None of them is in the
runtime, and the test suite fails on any number here that the runtime never reads.

```ttdb-grammar
kind: numbers
prior_for: 1
prior_against: 1
weight_partial: 0.5
belief_conf_threshold: 128
inherit_decay: 0.85
max_hops: 4
answer_max_items: 6
search_max_items: 5
suggest_eps_min: 40
with_max_pairs: 3
said_max_chars: 400
rule_max_body: 3
phrase_max_words: 4
```

---

@LAT-80LON0 | created:1789257600 | updated:1789257600 | relates:refines@LAT60LON0,refines@LAT-40LON0

**Grammar — rules**
src: RFCs/TTG-RFC-0003-Beliefs-Reasoning-Response.md §3

What follows from what, beyond the algebra's flags. A rule reads like a percept with
variables: `body atoms => head atom | label`, each atom `vector subject object`, capitals
for variables, `-` for no object. A `not_` vector matches something the owner denied, never
something they didn't say. Rules only relate terms the store already names, so inference
always finishes; their conclusions print as *inferred, not said* with the rule's label, and
anything the owner actually said outranks them. Every language borrows these, since they
name vectors, not words.

```ttdb-grammar
kind: rules
rule: sleep_in X Y => in X Y | sleeping somewhere is being there
rule: not_fly X -, is_a X bird => has_property X flightless | a bird that does not fly
rule: cazar X Y => chase X Y | cazar is chase
rule: move_to X Y => in X Y | moving somewhere puts you there
```

---

@LAT-10LON180 | created:1789257600 | updated:1789257600 | relates:translates@LAT-10LON0

**Gramática — palabras cerradas (español)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §3

A second language, on the antimeridian: the other line between things and vectors. Each
sentence is read by whichever grammar knows more of its words (TTG-RFC-0001 §11), so *a*,
*no* and *son* can mean one thing here and another at [the English lexicon](lat-10lon0).

```ttdb-grammar
kind: lexicon
lang: es
class: det | el la los las un una unos unas este esta estos estas ese esa esos esas
class: poss | mi mis su sus tu tus nuestro nuestra nuestros nuestras
class: quant_all | todo toda todos todas cada
class: quant_some | algún alguna algunos algunas muchos muchas pocos pocas varios varias
class: quant_none | ningún ninguno ninguna
class: self | yo me mi mis mí conmigo
class: anaphor | él ella ellos ellas
class: prep | en de a con por para sobre sin desde hasta entre hacia bajo contra durante
class: conj | y e o u pero ni
class: alt | o u
class: subord | porque cuando si aunque mientras que
class: relative | que
class: premod | dos tres cuatro cinco seis siete ocho nueve diez cien mil buen gran mal otro otra otros otras
class: aux | suele suelen
class: cop | es son soy eres somos está están estoy estás estamos era eran estaba estaban fue fueron ser estar
class: hav | tiene tienen tengo tienes tenemos
class: modal | puede pueden puedo puedes podemos debe deben debo
class: neg | no nunca jamás nada nadie
class: wh | qué quién quiénes cuál cuáles dónde cuándo cómo
class: adverb | muy también siempre ya aún todavía casi bastante mucho poco más menos tan
class: filler | sí vale hola gracias bueno pues
whole: del | de el
whole: al | a el
sentence_end: . ! ?
clause_break: ; :
question_mark: ?
list_sep: ,
generic_det: un una
nounish_marks: [ ]
verbish_marks: { }
aside_marks: ( )
head: first
object_mark: a
```

---

@LAT-20LON180 | created:1789257600 | updated:1789257600 | relates:translates@LAT-20LON0

**Gramática — morfología (español)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §4

Stem-changing verbs are irregulars; everything else is a suffix rule, and the corpus corrects
the guesses as it does for English ([the lemmatizer belief](lat98lon4)). Spanish drops its
subjects: `self_ending` and `self_form` name the speaker's own verb forms, so *No como carne*
and *Vi al gato* are about the speaker, and a finite verb may open a clause.

```ttdb-grammar
kind: morphology
lang: es
noun_keep: lunes martes miércoles jueves viernes crisis tesis análisis virus
plural: ones | ón
plural: ces | z
plural: les | l | le
plural: res | r | re
plural: nes | n | ne
plural: des | d | de
plural: s | -
verb_irregular: estoy estás está estamos están | estar
verb_irregular: tengo tienes tiene tenemos tienen | tener
verb_irregular: voy vas va vamos van | ir
verb_irregular: hago haces hace hacemos hacen | hacer
verb_irregular: puedo puedes puede podemos pueden | poder
verb_irregular: quiero quieres quiere queremos quieren | querer
verb_irregular: duermo duermes duerme dormimos duermen | dormir
verb_irregular: vuelo vuelas vuela volamos vuelan | volar
verb_irregular: juego juegas juega jugamos juegan | jugar
verb_irregular: pienso piensas piensa pensamos piensan | pensar
verb_irregular: prefiero prefieres prefiere preferimos prefieren | preferir
verb_irregular: digo dices dice decimos dicen | decir
verb_irregular: sé sabes sabe sabemos saben | saber
verb_irregular: creo | creer
verb_irregular: persigo persigues persigue perseguimos persiguen | perseguir
verb_irregular: veo ves ve vemos ven vi viste vio vimos vieron | ver
verb: ando | ar
verb: iendo | er | ir
verb: ado | ar
verb: ido | er | ir
verb: amos | ar
verb: emos | er
verb: imos | ir
verb: an | ar
verb: en | er | ir
verb: as | ar
verb: es | er | ir
verb: a | ar
verb: e | er | ir
verb: o | ar | er ir
progressive_ending: ando iendo
participle_ending: ado ido
min_stem: 2
bare_ending: ar er ir
bare_finite: -
adverb_ending: mente
self_ending: o é í
self_form: soy estoy voy doy sé vi fui
```

---

@LAT-30LON180 | created:1789257600 | updated:1789257600 | relates:translates@LAT-30LON0

**Gramática — verbos semilla (español)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §5

`motion` lists the verbs that go somewhere: after one, the object mark *a* is a preposition
of place (*va a Madrid*, `ir_a`); after any other it marks the verb's thing (*persigue a los
ratones*, `perseguir | ratón`).

```ttdb-grammar
kind: seed
lang: es
seed: comer beber gustar amar odiar querer necesitar saber conocer pensar creer ver oír sentir hacer dar tomar tener encontrar traer comprar vender usar ayudar construir escribir leer decir llamar enseñar aprender jugar trabajar correr caminar nadar volar saltar crecer cazar perseguir atrapar temer evitar proteger causar crear contener llevar perder ganar cambiar seguir abrir cerrar empezar terminar disfrutar preferir recordar olvidar visitar mirar cantar cocinar viajar estudiar hablar vivir dormir morder pagar dibujar pintar soñar esperar ronronear ladrar oler caer despertar pertenecer
stance: creer pensar dudar suponer esperar desear temer sospechar imaginar soñar decir negar contar explicar mencionar
chain: ver oír mirar sentir hacer dejar ayudar
stance_noun: hecho idea noticia rumor creencia esperanza miedo sensación posibilidad prueba duda sospecha
motion: ir venir volver llegar viajar correr caminar volar nadar saltar subir bajar entrar salir
intransitive: dormir ronronear ladrar llegar morir reír llorar caer pertenecer existir ir venir
```

---

@LAT-40LON180 | created:1789257600 | updated:1789257600 | relates:translates@LAT-40LON0

**Gramática — nombres de los vectores (español)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §6

No algebra here, and no roles: a later language borrows [the first one's](lat-40lon0), so
*es un* and *is a* are one edge and a question in either language walks sayings in both.
It only names those vectors (`label:`) and says which phrases point at them.

```ttdb-grammar
kind: vectors
lang: es
label: is_a | es un
label: has_property | es
label: has | tiene
label: part_of | es parte de
label: in | está en
label: contains | contiene
label: equals | es lo mismo que
label: opposes | es lo contrario de
label: causes | causa
label: with | aparece con
phrase: parte de | part_of
phrase: hecho de | made_of
phrase: tipo de | is_a
phrase: clase de | is_a
phrase: lo mismo que | equals
phrase: lo contrario de | opposes
phrase: lleno de | contains
phrase: en | in
```

---

@LAT-50LON180 | created:1789257600 | updated:1789257600 | relates:translates@LAT-50LON0

**Gramática — preguntas (español)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §7

```ttdb-grammar
kind: questions
lang: es
wh_thing: qué quién quiénes cuál cuáles
wh_place: dónde | in
about: háblame cuéntame describe explica define sobre
describe_max_words: 2
```

---

@LAT-60LON180 | created:1789257600 | updated:1789257600 | relates:translates@LAT-60LON0

**Gramática — respuestas (español)**
src: RFCs/TTG-RFC-0001-Grammar-in-the-Store.md §8

The librarian answers in the language it was asked in, and quotes the owner in whatever
language they spoke.

```ttdb-grammar
kind: responses
lang: es
label_said: dijiste
label_inferred: inferido, no dicho
label_contested: has dicho ambas cosas
affirm: Sí.
deny: No.
affirm_inferred: Probablemente — se sigue de lo que dijiste.
deny_inferred: Probablemente no — se sigue de lo que dijiste.
contest: Tus palabras no coinciden, y no se elige ninguna.
unknown: Tus palabras todavía no llegan a eso.
exception: {term} es una excepción — {via} sugeriría lo contrario.
no_purchase: Sin agarre: {words}.
noted: Anotado: {percepts} de {sentences}.
noted_nothing: Guardé tus palabras, pero no se formó ninguna percepción.
noted_mention: Anotado {terms} — nombrado, sin que se diga nada de ello todavía.
noted_held: Guardado, no creído — lo dijiste como opción o postura, no como hecho: {triples}.
noted_readings: Guardado, no creído — puedo leerlo de dos maneras, y guardo ambas hasta que digas cuál querías decir: {readings}.
reading_pair: o bien {a}, o bien {b}
asked_held: Lo dijiste, pero no como hecho: “{text}” ({ep}).
asked_readings: Dijiste “{text}” ({ep}), que se lee de dos maneras, sin decir cuál querías decir: {readings}.
amended: Leído de nuevo como lo marcaste: {percepts}.
amend_title: Enmienda {n}
contradicts: Esto contradice algo que dijiste antes.
supersedes: Esto reemplaza algo que dijiste antes.
label_superseded: ya no
superseded_by: desde
deny_superseded: Ya no — dijiste otra cosa después.
describe_head: Lo que tus palabras dicen de {term}.
describe_empty: {term} está en tus palabras, pero aún no se ha dicho nada de ello.
points_here: Lo que apunta a {term}
mentioned_with: aparece con
objects_head: {s} {v} …
subjects_head: … {v} {o}
nothing_found: Nada en tus palabras encaja.
search_head: Lo más cercano que has dicho
suggest: Mencionas {term} a menudo y lo que dices de ello no está asentado (EPS {eps}). ¿Me cuentas más sobre {term}?
ingested: Leído {file}: {sentences}, {percepts}, {terms} nuevos.
episode_title: Episodio {n} — {source}
source_typed: escrito
store_opened: Se abrió un almacén en lugar de leerlo como palabras: {file}.
unit_percept: percepción | percepciones
unit_sentence: frase | frases
unit_term: término | términos
```

---

@LAT-54.8LON172.6 | created:1789257600 | updated:1789257660 | relates:is_a@LAT-53.6LON175,fly@LAT-57.6LON-93.2,has@LAT-53.9LON171.9
[ew]
conf:170
rev:1
sal:4
touched:1789257660
[/ew]

**bird**

```ttdb-term
class: thing
lemma: bird
forms: birds bird
seen: 4
asked: 0
belief: is_a | animal | + | 1 0 | 170
belief: fly | - | + | 1 0 | 170
belief: has | feather | + | 1 0 | 170
```

---

@LAT-53.6LON175 | created:1789257600 | updated:1789257720 | relates:
[ew]
conf:128
rev:0
sal:2
touched:1789257720
[/ew]

**animal**

```ttdb-term
class: thing
lemma: animal
forms: animals
seen: 2
asked: 0
```

---

@LAT2.8LON-84.1 | created:1789257600 | updated:1789257840 | relates:
[ew]
conf:170
rev:0
sal:6
touched:1789257840
[/ew]

**is_a**

```ttdb-term
class: vector
lemma: is_a
forms: is_a
seen: 6
asked: 0
```

---

@LAT-57.6LON-93.2 | created:1789257600 | updated:1789257660 | relates:
[ew]
conf:170
rev:0
sal:2
touched:1789257660
[/ew]

**fly**

```ttdb-term
class: vector
lemma: fly
forms: fly
seen: 2
asked: 0
```

---

@LAT-53.9LON171.9 | created:1789257600 | updated:1789257600 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257600
[/ew]

**feather**

```ttdb-term
class: thing
lemma: feather
forms: feathers
seen: 1
asked: 0
```

---

@LAT-53.2LON-168.8 | created:1789257600 | updated:1789257720 | relates:
[ew]
conf:170
rev:0
sal:2
touched:1789257720
[/ew]

**has**

```ttdb-term
class: vector
lemma: has
forms: has
seen: 2
asked: 0
```

---

@LAT90LON1 | created:1789257600 | updated:1789257600 | relates:perceives@LAT-54.8LON172.6,perceives@LAT2.8LON-84.1,perceives@LAT-53.6LON175,perceives@LAT-57.6LON-93.2,perceives@LAT-53.2LON-168.8,perceives@LAT-53.9LON171.9

**Episode 1 — typed**

```ttdb-episode
source: typed
at: 1789257600
said: 1 | Birds are animals.
said: 2 | Birds can fly.
said: 3 | Birds have feathers.
shape: 1 | [birds] {are} [animals].
shape: 2 | [birds] {can fly}.
shape: 3 | [birds] {have} [feathers].
percept: 1 | bird | is_a | animal | + | -
percept: 2 | bird | fly | - | + | -
percept: 3 | bird | has | feather | + | -
```

---

@LAT-53.6LON173.8 | created:1789257660 | updated:1789257660 | relates:is_a@LAT-54.8LON172.6,not_fly@LAT-57.6LON-93.2,swim@LAT-45LON-59.5
[ew]
conf:170
rev:1
sal:3
touched:1789257660
[/ew]

**penguin**

```ttdb-term
class: thing
lemma: penguin
forms: penguin penguins
seen: 3
asked: 0
belief: is_a | bird | + | 1 0 | 170
belief: fly | - | - | 0 1 | 170
belief: swim | - | + | 1 0 | 170
```

---

@LAT-45LON-59.5 | created:1789257660 | updated:1789257660 | relates:
[ew]
conf:170
rev:0
sal:1
touched:1789257660
[/ew]

**swim**

```ttdb-term
class: vector
lemma: swim
forms: swim
seen: 1
asked: 0
```

---

@LAT90LON2 | created:1789257660 | updated:1789257660 | relates:perceives@LAT-53.6LON173.8,perceives@LAT2.8LON-84.1,perceives@LAT-54.8LON172.6,perceives@LAT-57.6LON-93.2,perceives@LAT-45LON-59.5

**Episode 2 — typed**

```ttdb-episode
source: typed
at: 1789257660
said: 1 | A penguin is a bird.
said: 2 | Penguins do not fly.
said: 3 | Penguins swim.
shape: 1 | [a penguin] {is} [a bird].
shape: 2 | [penguins] {do not fly}.
shape: 3 | [penguins] {swim}.
percept: 1 | penguin | is_a | bird | + | *
percept: 2 | penguin | fly | - | - | -
percept: 3 | penguin | swim | - | + | -
```

---

@LAT-53.1LON175 | created:1789257720 | updated:1789257780 | relates:is_a@LAT-53.6LON175,has@LAT-53.6LON172.3
[ew]
conf:170
rev:1
sal:4
touched:1789257780
[/ew]

**mammal**

```ttdb-term
class: thing
lemma: mammal
forms: mammals mammal
seen: 4
asked: 0
belief: is_a | animal | + | 1 0 | 170
belief: has | fur | + | 1 0 | 170
```

---

@LAT-53.6LON172.3 | created:1789257720 | updated:1789257720 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257720
[/ew]

**fur**

```ttdb-term
class: thing
lemma: fur
forms: fur
seen: 1
asked: 0
```

---

@LAT-52.1LON173.4 | created:1789257720 | updated:1789257840 | relates:is_a@LAT-53.1LON175,chase@LAT-54.8LON175
[ew]
conf:170
rev:2
sal:3
touched:1789257840
[/ew]

**cat**

```ttdb-term
class: thing
lemma: cat
forms: cats cat
seen: 3
asked: 0
belief: is_a | mammal | + | 1 0 | 170
belief: chase | mouse | + | 1 0 | 170
```

---

@LAT90LON3 | created:1789257720 | updated:1789257720 | relates:perceives@LAT-53.1LON175,perceives@LAT2.8LON-84.1,perceives@LAT-53.6LON175,perceives@LAT-53.2LON-168.8,perceives@LAT-53.6LON172.3,perceives@LAT-52.1LON173.4

**Episode 3 — typed**

```ttdb-episode
source: typed
at: 1789257720
said: 1 | Mammals are animals.
said: 2 | Mammals have fur.
said: 3 | Cats are mammals.
shape: 1 | [mammals] {are} [animals].
shape: 2 | [mammals] {have} [fur].
shape: 3 | [cats] {are} [mammals].
percept: 1 | mammal | is_a | animal | + | -
percept: 2 | mammal | has | fur | + | -
percept: 3 | cat | is_a | mammal | + | -
```

---

@LAT-54.8LON175 | created:1789257780 | updated:1789257780 | relates:is_a@LAT-53.1LON175,eat@LAT-56.5LON174.5
[ew]
conf:170
rev:1
sal:3
touched:1789257780
[/ew]

**mouse**

```ttdb-term
class: thing
lemma: mouse
forms: mice mouse
seen: 3
asked: 0
belief: is_a | mammal | + | 1 0 | 170
belief: eat | cheese | + | 1 0 | 170
```

---

@LAT-42.9LON-166.4 | created:1789257780 | updated:1789257780 | relates:
[ew]
conf:170
rev:0
sal:1
touched:1789257780
[/ew]

**chase**

```ttdb-term
class: vector
lemma: chase
forms: chase
seen: 1
asked: 0
```

---

@LAT-56.5LON174.5 | created:1789257780 | updated:1789257780 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257780
[/ew]

**cheese**

```ttdb-term
class: thing
lemma: cheese
forms: cheese
seen: 1
asked: 0
```

---

@LAT9.5LON-19.5 | created:1789257780 | updated:1789257780 | relates:
[ew]
conf:170
rev:0
sal:1
touched:1789257780
[/ew]

**eat**

```ttdb-term
class: vector
lemma: eat
forms: eat
seen: 1
asked: 0
```

---

@LAT90LON4 | created:1789257780 | updated:1789257780 | relates:perceives@LAT-52.1LON173.4,perceives@LAT-42.9LON-166.4,perceives@LAT-54.8LON175,perceives@LAT2.8LON-84.1,perceives@LAT-53.1LON175,perceives@LAT9.5LON-19.5,perceives@LAT-56.5LON174.5

**Episode 4 — typed**

```ttdb-episode
source: typed
at: 1789257780
said: 1 | Cats chase mice.
said: 2 | A mouse is a mammal.
said: 3 | Mice eat cheese.
shape: 1 | [cats] {chase} [mice].
shape: 2 | [a mouse] {is} [a mammal].
shape: 3 | [mice] {eat} [cheese].
percept: 1 | cat | chase | mouse | + | -
percept: 2 | mouse | is_a | mammal | + | *
percept: 3 | mouse | eat | cheese | + | -
```

---

@LAT-53.1LON174 | created:1789257840 | updated:1789257840 | relates:is_a@LAT-52.1LON173.4,sleep_in@LAT-51.3LON174.6
[ew]
conf:170
rev:1
sal:3
touched:1789257840
[/ew]

**pixel**

```ttdb-term
class: thing
lemma: pixel
forms: pixel
seen: 3
asked: 0
belief: is_a | cat | + | 1 0 | 170
belief: sleep_in | sun | + | 1 0 | 170
```

---

@LAT26.2LON-90.4 | created:1789257840 | updated:1789257840 | relates:
[ew]
conf:170
rev:0
sal:1
touched:1789257840
[/ew]

**love**

```ttdb-term
class: vector
lemma: love
forms: love
seen: 1
asked: 0
```

---

@LAT-51.3LON174.6 | created:1789257840 | updated:1789257840 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257840
[/ew]

**sun**

```ttdb-term
class: thing
lemma: sun
forms: sun
seen: 1
asked: 0
```

---

@LAT27.1LON-170.3 | created:1789257840 | updated:1789257840 | relates:
[ew]
conf:170
rev:0
sal:1
touched:1789257840
[/ew]

**sleep_in**

```ttdb-term
class: vector
lemma: sleep_in
forms: sleeps_in
seen: 1
asked: 0
```

---

@LAT90LON5 | created:1789257840 | updated:1789257840 | relates:perceives@LAT-53.1LON174,perceives@LAT2.8LON-84.1,perceives@LAT-52.1LON173.4,perceives@LAT0LON0,perceives@LAT26.2LON-90.4,perceives@LAT27.1LON-170.3,perceives@LAT-51.3LON174.6

**Episode 5 — typed**

```ttdb-episode
source: typed
at: 1789257840
said: 1 | Pixel is a cat.
said: 2 | I love Pixel.
said: 3 | Pixel sleeps in the sun.
shape: 1 | [pixel] {is} [a cat].
shape: 2 | [i] {love} [pixel].
shape: 3 | [pixel] {sleeps in} [the sun].
percept: 1 | pixel | is_a | cat | + | -
percept: 2 | self | love | pixel | + | -
percept: 3 | pixel | sleep_in | sun | + | -
```

---

@LAT-2.8LON5 | created:1789257900 | updated:1789257900 | relates:has_property@LAT-2.1LON5
[ew]
conf:170
rev:1
sal:3
touched:1789257900
[/ew]

**tea**

```ttdb-term
class: thing
lemma: tea
forms: tea
seen: 3
asked: 0
belief: has_property | warm | + | 1 0 | 170
```

---

@LAT-31.5LON-130 | created:1789257900 | updated:1789257900 | relates:
[ew]
conf:170
rev:0
sal:1
touched:1789257900
[/ew]

**drink**

```ttdb-term
class: vector
lemma: drink
forms: drink
seen: 1
asked: 0
```

---

@LAT-4.4LON153.3 | created:1789257900 | updated:1789257900 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257900
[/ew]

**morning**

```ttdb-term
class: thing
lemma: morning
forms: morning
seen: 1
asked: 0
```

---

@LAT26.1LON-73.5 | created:1789257900 | updated:1789257900 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257900
[/ew]

**with**

```ttdb-term
class: vector
lemma: with
forms: with
seen: 1
asked: 0
```

---

@LAT-2.1LON5 | created:1789257900 | updated:1789257900 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257900
[/ew]

**warm**

```ttdb-term
class: thing
lemma: warm
forms: warm
seen: 1
asked: 0
```

---

@LAT1.9LON-17.8 | created:1789257900 | updated:1789257960 | relates:
[ew]
conf:170
rev:0
sal:2
touched:1789257960
[/ew]

**has_property**

```ttdb-term
class: vector
lemma: has_property
forms: has_property
seen: 2
asked: 0
```

---

@LAT90LON6 | created:1789257900 | updated:1789257900 | relates:perceives@LAT0LON0,perceives@LAT-31.5LON-130,perceives@LAT-2.8LON5,perceives@LAT26.1LON-73.5,perceives@LAT-4.4LON153.3,perceives@LAT1.9LON-17.8,perceives@LAT-2.1LON5

**Episode 6 — typed**

```ttdb-episode
source: typed
at: 1789257900
said: 1 | I drink tea in the morning.
said: 2 | Tea is warm.
shape: 1 | [i] {drink} [tea in the morning].
shape: 2 | [tea] {is} [warm].
percept: 1 | self | drink | tea | + | -
percept: 1 | tea | with | morning | + | -
percept: 2 | tea | has_property | warm | + | -
```

---

@LAT57.2LON41.5 | created:1789257960 | updated:1789258020 | relates:has_property@LAT55.2LON38.7
[ew]
conf:170
rev:1
sal:3
touched:1789258020
[/ew]

**coffee**

```ttdb-term
class: thing
lemma: coffee
forms: coffee
seen: 3
asked: 0
belief: has_property | bitter | + | 1 0 | 170
```

---

@LAT55.2LON38.7 | created:1789257960 | updated:1789257960 | relates:
[ew]
conf:128
rev:0
sal:1
touched:1789257960
[/ew]

**bitter**

```ttdb-term
class: thing
lemma: bitter
forms: bitter
seen: 1
asked: 0
```

---

@LAT-7.4LON-174.2 | created:1789257960 | updated:1789258020 | relates:
[ew]
conf:128
rev:0
sal:2
touched:1789258020
[/ew]

**like**

```ttdb-term
class: vector
lemma: like
forms: like
seen: 2
asked: 0
```

---

@LAT90LON7 | created:1789257960 | updated:1789257960 | relates:perceives@LAT57.2LON41.5,perceives@LAT1.9LON-17.8,perceives@LAT55.2LON38.7,perceives@LAT0LON0,perceives@LAT-7.4LON-174.2

**Episode 7 — typed**

```ttdb-episode
source: typed
at: 1789257960
said: 1 | Coffee is bitter.
said: 2 | I like coffee.
shape: 1 | [coffee] {is} [bitter].
shape: 2 | [i] {like} [coffee].
percept: 1 | coffee | has_property | bitter | + | -
percept: 2 | self | like | coffee | + | -
```

---

@LAT90LON8 | created:1789258020 | updated:1789258020 | relates:perceives@LAT0LON0,perceives@LAT-7.4LON-174.2,perceives@LAT57.2LON41.5

**Episode 8 — typed**

```ttdb-episode
source: typed
at: 1789258020
said: 1 | I do not like coffee.
shape: 1 | [i] {do not like} [coffee].
percept: 1 | self | like | coffee | - | -
```

---

@LAT95LON0 | created:1790035200 | updated:1790035200 | relates:refines@LAT0LON0,supports@LAT85LON0
[ew]
conf:210
rev:0
sal:170
touched:1790035200
[/ew]

```ttdb-include
file: README.md
```

---

@LAT98LON1 | created:1789257600 | updated:1789257600 | relates:supports@LAT30LON0,refines@LAT40LON0
[ew]
conf:200
rev:0
sal:180
touched:1789257600
[/ew]

**BELIEF — A verb is a vector, and the edge is the datum.**

TTDB-RFC-0006 makes the transition the unit of perception: the edge from before to after is
the claim, and the nodes are only its boundary. Language already has that shape. In *cats
chase mice* the verb is not a thing that exists somewhere; it is the directed relation
between two things, and it is the only part of the sentence that can be wrong in a way worth
reasoning about. So the owner's verbs become the store's **edge types** — `chase@<mouse>` —
and the western hemisphere is not a second list of words but the vocabulary the eastern one
is connected by.

Where this diverges from RFC-0006, and says so: a percept pairs a subject with an object, not
a before-state with an after-state, and an intransitive clause (*penguins swim*) has no
second endpoint. It is kept, with object `-`, and its edge points at the vector's own
record. Strictly, that is RFC-0006's non-conforming *orphaned percept*; the alternative was
to throw away every sentence without an object, which is most of what people say about
themselves. The agent context RFC-0006 §7.3 demands is present on every percept: the owner
is the umwelt, and every percept names the episode and sentence that carried it.

---

@LAT98LON2 | created:1789257600 | updated:1789257600 | relates:supports@LAT40LON0
[ew]
conf:230
rev:0
sal:60
touched:1789257600
[/ew]

**BELIEF — The lane mechanism global_models could not use is available again.**

global_models put the Earth on its globe with the identity projection, so there was no 98°N
to park beliefs on and it had to invent a `lane:` header field. This sphere is a knowledge
map, and latitude means whatever the umwelt says — so the corpus convention comes straight
back: **lat 90 is the timeline** (every episode, lon = its ordinal), **lat 98 is beliefs about
the design**, **lat 99 is the fixture**, and −90 stays TTCP-RFC-0001 §8's special record.
No header field is needed, and none is used.

What the constraint gave global_models — beliefs sitting *beside* their subjects — this store
gets a different way: the owner's beliefs live *inside* their subjects, as `belief:` lines in
the THING record, because a belief about a cat is part of what the store knows about the
cat. The lat-98 records here are the other kind of belief, about the machine rather than the
owner, and they keep the corpus lane.

---

@LAT98LON3 | created:1789257600 | updated:1789344000 | relates:supports@LAT60LON0,supports@LAT50LON0
[ew]
conf:190
rev:1
sal:200
touched:1789344000
[/ew]

**BELIEF — Said outranks inferred, the nearest ancestor outranks a farther one, and a contradiction is kept.**

These are the reasoner's three judgements about what to say, and each is a refusal to invent. A
said belief outranks an inference because the owner said it. The nearest ancestor outranks a
farther one because it is the more specific thing the owner said. And when the owner has
said a thing and its opposite equally often, the belief is **contested**: conf 128, no edge,
both sentences quoted, no verdict — the correlary of global_models drawing an undated
collapse as its two ends and no mean. A contested belief is not an error in the store; it is
the most interesting thing in it, and its EPS is how the librarian finds it again.

Consolidation still does not weigh *when* something was said. *I like coffee* on Monday and
*I do not like coffee* on Friday is a change of mind, not a contradiction, and the store
cannot tell those apart: replay is deliberately atemporal, as TTDB-RFC-0007 §3.2 requires. A
recency rule would be one line in the numbers record and a large claim about the owner, so it
is not made.

Time enters in one narrower place, as a claim about a relation rather than about the owner.
A vector the grammar declares `exclusive` holds one object at a time, so *Mary is in the
garden* **retires** an earlier *Mary is in the kitchen*. That is a fourth judgement, about
order, and it refuses to invent in the same way: the retired saying is still quoted beside
what replaced it, and a flip of polarity (*Kim is not in the garden*) is still a
contradiction ([TTG-RFC-0004](../RFCs/index.html?rfc=TTG-RFC-0004-Time-and-the-Fleet.md)).

---

@LAT98LON4 | created:1789257600 | updated:1789257600 | relates:supports@LAT20LON0,refines@LAT-20LON0
[ew]
conf:120
rev:0
sal:210
touched:1789257600
[/ew]

**BELIEF — The lemmatizer is a guess, and the corpus corrects it.**

Suffix stripping without a dictionary is wrong in predictable ways: *baked* strips to *bak*,
*lives* could be a plural or a verb, *leaves* is both. The morphology record does not pretend
otherwise. What it does is let the corpus break ties: when a rule offers candidates, the one
the owner has already used wins. So the grammar gets better at exactly the words this owner
uses, and at no others — which is the whole idea of a *personal* grammar, and also its
limit: a mistake made on the first use of a word becomes the known term that later uses are
matched against.

That is the load-bearing weakness of the whole pipeline, which is why its EPS is second only
to the parser's blind spots. Every merged form is visible on the term record's `forms:` line,
so a wrong merge can at least be seen.

---

@LAT98LON5 | created:1789257600 | updated:1790035200 | relates:supports@LAT20LON0,supports@LAT30LON0
[ew]
conf:70
rev:1
sal:190
touched:1790035200
[/ew]

**BELIEF — What the parser cannot see, and why that list is the roadmap.**

The highest EPS in the design, because every sentence goes through it and it is the least
settled thing here. Since [TTG-RFC-0005](../RFCs/index.html?rfc=TTG-RFC-0005-Shapes-and-Amendments.md) it reads
any alternating run of nounish and verbish segments, lists of either, relative words,
infinitives and one-word sentences — *mice that eat cheese*, *saw the man eat cheese*,
*fly, swim and sing*. Relative and stance clauses open inside the chain and close again:
*cats that chase mice are fast* is about cats, *the dog that the cat chased* is chased, and
*the man that says cats bark is tall* is a tall man. What a sentence says without asserting it
is **held**, written and never believed, keeping its own *not*: the members of an *or*,
unless it is denied (*not a cat or a dog* is neither), the clause after a stance verb (*I
doubt cats don't like fish*), and a clause reported after a thing (*I emailed the man that
the cat sleeps*). A bare verb goes on with a relative's chain while the sentence still waits
for its own (*the man that saw the cat eat cheese is tall* is a tall man), or after a chain
verb, which the owner's own sentences can teach it. An aside is left
out of a reading, so a hedge can be said as fact. A phrase's head is where the lexicon says:
last in English, first in Spanish. It still does not see:

- **One reading or two** — where the grammar can see both, it holds both, names them, and
  says only what they share, until the owner says which was meant (*the men that saw the
  cats eat cheese*); where it cannot, it picks the one that gives the sentence a verb
  (*birds that sing love songs*, until *love* is a thing).
- **Adverbs after a verb** — *she sings loudly* sings *loudly*; before a verb, *-ly* words
  are read right.
- **Modifiers** — *black cats* is *cats*; the adjective is dropped unless the owner binds the
  phrase into one term (`black_cat`).
- **Tense and modality** — *birds fly*, *birds flew* and *birds might fly* are one percept.
- **Word order other than a chain**, and questions that invert it beyond the forms in
  [question forms](lat-50lon0).
- **Numbers, dates and names with spaces** — *New York* is two things until the owner writes
  `new_york` once.

What changed is not only the list. Where the parser reads a sentence wrongly, the owner can
now say how it reads, and [that correction is kept](lat98lon9).

Each is a rule kind the grammar could declare and the runtime could learn to apply, and none
is a list of words. That is the test of whether a fix belongs here: if it needs English in
`index.html`, it is the wrong fix.

---

@LAT98LON6 | created:1789257600 | updated:1789257600 | relates:supports@LAT30LON0,supports@LAT50LON0
[ew]
conf:215
rev:0
sal:150
touched:1789257600
[/ew]

**BELIEF — Mentions are not evidence, and sentences are not episodes.**

A long file mentions its subject in hundreds of sentences, and a naive count would make the
file's vocabulary the owner's strongest beliefs. Two rules stop that. Things that merely
appear near each other get a `comention` percept, which is searchable, shows on the term
record, and never consolidates. And consolidation counts **episodes**, not sentences: a file
that says *tea is warm* forty times has said it once, as far as conf is concerned.

The cost is real: a file is one episode however long it is, so one long document can never
outvote two short typed remarks. That is a claim about what the owner means by feeding a
file in — *here is something I read* rather than *here is what I think* — and it is written
down because it is a claim.

---

@LAT98LON7 | created:1789257600 | updated:1790035200 | relates:supports@LAT10LON0,refines@LAT98LON5
[ew]
conf:100
rev:0
sal:140
touched:1789257600
[/ew]

**BELIEF — Two languages, one sphere.**

People rarely keep their words in one language, so the store reads a second beside the
first: [Spanish](lat-10lon180) on the antimeridian, chosen per sentence. What crosses is the
test.

- **Crosses:** every structural vector. *Un pingüino es un penguin* is the same `is_a` edge
  as *A penguin is a bird*, so *Háblame de los pingüinos* answers in Spanish with English
  sayings quoted as said — the penguin exception included.
- **Does not cross:** content words. `gato` and `cat` are two terms and `cazar` and `chase`
  two vectors until the owner links them: terms with `is_a`, vectors with a
  [rule](lat-80lon0) such as `cazar X Y => chase X Y`.
- **Why not one merged lexicon:** *a* is an article in one language and a preposition in the
  other, *no* a quantifier and a negation, and a phrase's head is its last word in one and its
  first in the other (*el gato negro*). Merged, they break 3 of the fifteen English parse
  cases; kept apart, none.
- **New blind spots:** a verb-first question (*¿Dónde duerme Pixel?*), an adjective that
  agrees in number (*son negros* reads as a class), a dropped subject other than the
  speaker's (*Come queso*). The speaker's own is read: `self_ending` names its verb forms,
  so *No como carne* is `self comer carne -`. Each is a rule the grammar declares — never
  Spanish in `index.html`.

Try it: *Un gato es un cat.* then *¿Es un gato un animal?* A third language is another set of
records with its own `lang:`, and nothing in the runtime.

---

@LAT98LON8 | created:1789344000 | updated:1789344000 | relates:refines@LAT98LON3,supports@LAT60LON0
[ew]
conf:90
rev:0
sal:180
touched:1789344000
[/ew]

**BELIEF — Order, not clocks: a fleet shares a tempo, and orders only what it can show.**

A lone store knows what came later without a clock. Episodes are only appended, so the file is
the order, and [the step that retires](lat60lon0) *in the kitchen* when *in the garden* is said
later reads nothing else. What is not yet tested is what happens when several agents hear one
owner — a phone, a Pi, an ESP32 badge — and their episodes meet. No file order is shared, and
their clocks disagree.

The proposal borrows a band's answer, TTN-RFC-0010's fleet pulse: agree on the tempo, keep it
locally, and glance at the conductor only as often as drift requires. Each agent stamps an
episode with its pulse time **and a bound** — at 50 ppm, ±4 s for a day since the last beacon.
A saying is later only when a `follows@` edge shows its agent had already heard the other, or
when the bounds do not overlap. Inside the bound, as inside the band's ±50 ms swing, no order
is claimed: two places said at about the same time are **contested**, and neither silently
wins. The chart's `scene_id` becomes a hash of the grammar, because agents reading with
different grammars are a band playing different songs.

Low conf because none of it runs yet; high salience because it decides whether *personal* can
mean more than one device. Expansion: [TTG-RFC-0004 §4](../RFCs/index.html?rfc=TTG-RFC-0004-Time-and-the-Fleet.md).

---

@LAT98LON9 | created:1789948800 | updated:1790035200 | relates:supports@LAT30LON0,refines@LAT98LON5,refines@LAT98LON4
[ew]
conf:150
rev:0
sal:160
touched:1790035200
[/ew]

**BELIEF — A reading is the parser's guess, and the owner's correction is kept beside the words.**

[The lemmatizer belief](lat98lon4) says the corpus corrects the grammar one word at a time.
Shapes let the owner correct it one reading at a time, and the question is where a correction
lives. Not in the episode: an episode is the owner's words and is never rewritten, and the
first reading is itself a fact — what the grammar of the day made of them. Not in the grammar:
one sentence's reading is not a rule of the language. So beside the episode, on its own lane at
its own longitude: an **amendment** ([TTG-RFC-0005](../RFCs/index.html?rfc=TTG-RFC-0005-Shapes-and-Amendments.md) §5).

Two consequences are deliberate. An amended saying still counts, orders and quotes as the
saying it was: a correction is not a second saying, so it can outvote nothing. And a
correction can teach: once the owner binds *ice cream* into one term, the words find that term
unmarked ever after, the way a known lemma wins a tie. That is also the risk — a binding made
once applies everywhere, visibly on the term's `forms:` line but silently at parse time. Inside
marks it never applies, so any reading can still be written back exactly as the owner means it.

A correction can also take words out. What the reader holds rather than believes — the clause
after *I think* — the owner can say as fact by marking *I think* an aside: the parser's caution
is its default, and the owner's word overrules it, beside the episode like any other reading.

And a correction can choose. Some sentences read two ways that no labelling of their words
tells apart — *the men that saw the cats eat cheese* has one shape whether the men eat or the
cats do. The grammar holds both readings and names them; the owner says which was meant by its
letter, and the amendment keeps the choice beside the shape, so every later reading of that
sentence keeps it too.

Mid conf because the chain is new and flat; mid salience because every sentence has a reading
and most will never be touched.

---

@LAT99LON1 | created:1789257600 | updated:1789257600 | x_fixture:preserve-me-verbatim | relates:refines@LAT0LON0,duplicates@LAT88.8LON179.9

**FIXTURE — Conformance test surfaces (deliberate).**

The record that exists to be mishandled. It carries:

1. An edge to **@LAT88.8LON179.9, which does not exist** — rendered dead, never a live
   link, never a crash (TTCP-RFC-0001 §12).
2. An **unknown header field**, `x_fixture` — preserved verbatim on every write
   (TTDB-RFC-0001 §5).
3. **No `[ew]` block** — weights read as defaults: conf 128, sal 0, **EPS 0**.
4. An **episode block with only malformed percept lines** — a missing vector, a
   non-numeric sentence, too few columns. A conforming consolidator skips all three, counts
   them, and forms no belief from this record.

```ttdb-episode
source: fixture
at: 1789257600
said: 1 | This sentence is here so the malformed lines below have something to point at.
percept: 1 | fixture | | thing | + | -
percept: x | fixture | is_a | thing | + | -
percept: 1 | fixture | is_a
```

---

@LAT-90LON0 | created:1789257600 | updated:1789257600 | relates:

**SPECIAL — a private corpus.**

Latitude exactly −90 is TTCP-RFC-0001 §8's special record: parsed for its `ttdb-special`
block, never shown as a navigable record. global_models used it to switch discovery **off**,
and said why: a public reference should show everything at once, while *for a store about
someone's inner landscape* discovery is right.

This is that store. It declares `kind: private_corpus`, which no viewer knows — so under
§8.1 it is silently ignored, and a generic viewer's discovery stays on, which is the
intended behaviour arrived at by declaring nothing it understands. The page itself has no
discovery system: the owner wrote every word in here and has nothing to discover.

```ttdb-special
kind: private_corpus
```