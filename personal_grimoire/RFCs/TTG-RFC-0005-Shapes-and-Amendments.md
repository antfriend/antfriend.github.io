# TTG-RFC-0005: Shapes — Alternating Segments, Lists, Mentions and Amendments

**Version:** 0.6
**Status:** Draft
**RFC Number:** 0005
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0001, TTG-RFC-0002, TTG-RFC-0003, TTDB-RFC-0001, TTDB-RFC-0004
**Author:** antfriend
**Created:** 2026-09-21

---

## 1. Abstract

TTG-RFC-0002 read a clause as one pattern, subject–verb–object, over single terms. This RFC
generalises it: a clause is **any alternating run of nounish and verbish segments** — `N`,
`V`, `N V`, `V N`, `N V N`, `N V N V N`, … — where a segment is a whole phrase or a list, and
each verbish segment relates the nounish segments either side of it. *Subject–verb–object is
still a shape; it is one of many.*

The result of reading a sentence is its **shape**, written into the episode beside the words
in the owner's own notation. Because every labelling of words into segments is a valid
shape, the owner can overrule any reading: mark a span nounish or verbish, set it aside, or
bind words into one term, before a sentence is written or after. A correction to a sentence already
said is an **amendment**: kept beside the episode, never in it.

A sentence of one segment is allowed. Said as a statement it is a **mention**: the term is
recorded and counted, and nothing is believed about it. An unknown lone word is nounish.

Clauses open inside the chain. A relative clause, with its antecedent as subject or as object,
closes at the next verb, which returns to the thing the clause was about — unless that verb is
bare and goes on with the relative's own chain. Not everything a sentence says is asserted:
what a list joined by *or* says, the clause a stance verb such as *doubt* or a stance noun
such as *idea* takes, a clause reported after a thing, and both readings of a sentence the
grammar can read two ways, are **held** — written with polarity `?`, or `?-` for a held
denial, seen and searched, never believed (§3). A hedge the
owner meant as fact is set aside, and what it held is said (§4). When the grammar changes,
the sentences it now reads differently are reported, never rewritten, and the owner may take
the grammar's new reading as an amendment that names the grammar (§5.1).

---

## 2. Segments

Every token of a sentence receives one label:

| Label | Meaning |
|---|---|
| `N` | nounish: part of a nounish segment |
| `V` | verbish: part of a verbish segment |
| `L` | a link that ends a clause: punctuation other than `list_sep`, a `subord` word, a `filler` word, or a `conj` whose both sides are clauses (TTG-RFC-0002 §2) |
| `C` | a `conj` between a nounish segment and a verbish one: a new clause that **inherits the subject** (*cats chase mice and eat cheese*) |
| `R` | a `relative` word between a nounish segment and a verbish one (*mice that eat cheese*), or between a nounish segment and a phrase with a verb later in the clause (*the dog that the cat chased*): a link that opens a relative clause (§3). A word that is both `relative` and `subord` (*que*) is `R` there and `L` anywhere else. A relative word that is also a `det` opens the second kind only before a phrase starter, a `self` or an `anaphor` word, or a bare word with a verb straight after it when a thing comes before the relative word: *the dog that cats chase* opens one, *gave the dog that bone* and *Pixel and that cat* keep their determiner. A `relative` and `subord` word does the same (*el perro que gatos persiguen*), and after a `prep` that follows a `stance_noun` opens only this second kind (*la idea de que los gatos ladran*) |
| `A` | an **aside**: words inside the lexicon's `aside_marks`, left out of the reading altogether (§4) |

Within each clause, tokens are labelled left to right. The six predicate rules of
TTG-RFC-0002 §3 decide where a verbish segment **begins**, now applied at every position
rather than once per clause:

1. an `aux` or `modal` token begins one, and carries through a following `cop`, `hav` or
   content word;
2. a `cop` token begins one: a following progressive is its verb; else a declared `phrase:`
   after optional `det`/`quant` words, or a `prep`, joins it (*is part of*, *is in*);
3. a `hav` token begins one: a following participle or irregular form is its verb;
4. a content word whose verb lemma is a VECTOR term or a seed, once a nounish segment has
   begun, not straight after a phrase starter or `prep`;
5. under the same position rule, a content word straight before a phrase starter, or wearing
   `participle_ending`;
6. with no structural word in the clause at all, the middle of exactly three content words.

A verbish segment then **continues** through a `prep` that opens a noun phrase (the phrasal
verb, *live in houses*) and through an `infinitive` marker before a verb (*want to eat*). An
infinitive marker also *begins* one after a nounish segment (*taught me to bake*). The verb
after the marker must be followed by a thing, or be a verb the owner already uses, so *went
to work* stays `go_to | work`. In an object relative a `prep` with nothing after it — the
clause's end, or a verb — joins the verb too, and its thing is the gap: *the house that I
live in is big* is `[the house] that [i] {live in is} [big]`. An `object_mark` word never
joins a verb that is not a `motion` verb: *Pixel persigue a los ratones* is `[pixel]
{persigue} [a los ratones]`, *Pixel va a la tienda* is `[pixel] {va a} [la tienda]`.

**The alternation is the constraint.** A content word straight after a verbish segment is
nounish, however verb-like it is (*like fly fishing*). A second verbish segment in one clause
needs a cue — a `relative` word before it, a `conj`, a noun phrase after it, or a `stance`
verb before it (*I think cats bark*) — so *I had a good drink* is `[i] {had} [a good drink]`,
not a drink that does something.

A `stance` verb that opens its clause is verbish when a phrase starter, a `self` or
`anaphor` word, or a `subord` or `relative` word follows it: *Suppose it rains*, *Creo que…*.
Otherwise it is read like any other word, so *Hope is good* is about hope.

After the verb of a relative with a subject of its own, a verb straight after it begins the
next predicate: *the dog that the cat chased ran away* is `[the dog] that [the cat] {chased
ran} [away]`, and its two predicates are split at the second verb (§3). So does a `cop` or
`hav` after the relative's own `hav` or `cop` when no verb follows it: *the cheese that Pixel
has is old* splits `{has is}` at *is*, and *has been eating* stays one predicate.

After a relative's own verb, when the relative hangs on a thing before the clause's own verb
and the relative's verb is not one the corpus has with an object, a content word that is a
verb begins the clause's verb — unless another verb follows before the clause ends, a list
goes on or a new clause is joined: *cats that hunt eat mice* is `[cats] that {hunt eat}
[mice]`, while *birds that sing love songs are happy* keeps `[love songs]` a thing and *people
that like fly fishing are patient* keeps *fly* in it. The segment is split at the second verb
as an object relative's is (§3).

A content word the lexicon does not list that ends in a morphology `adverb_ending`, straight
after a thing and straight before a verb, is an `adverb` — unless the corpus knows it as a
term, `adverb_guard` lists it, or the owner marked it nounish: *the dog that the cat quickly
chased ran away* is `[the dog] that [the cat] {quickly chased ran} [away]`; *Pixel's family
eats fish* keeps *family*.

Where the morphology declares `self_ending` (a grammar that drops its subjects), a finite verb
may open its clause unless a verb follows it at once: *No como carne* is `{no como} [carne]`,
and *Como es tarde* leaves *como* to be read otherwise.

A `conj` or `list_sep` between two verbish segments makes one verbish **list** (*fly, swim
and sing*); between nounish ones, one nounish list (*cats, dogs and ferrets*). `neg` and
`adverb` words belong to the verb beside them, else to the thing after them.

Two segments of one kind side by side are one segment. So **any labelling is a valid
shape**, which is what lets the owner relabel freely (§4).

A sentence whose only content word the corpus knows as a VECTOR and not as a THING is
verbish; any other lone word is nounish.

---

## 3. Reading a Shape

A clause is a sequence of segments `S0 S1 … Sk`. Each verbish segment `Si` reads its
neighbours:

- **subject**: the members of `S(i−1)` if it is nounish; for the first verbish segment of a
  `C` clause, the subject inherited; otherwise **unstated**, written `-`;
- **object**: the members of `S(i+1)` if it is nounish; otherwise none, written `-`.

So `N1 V1 N2 V2 N3` is the chain `(N1 V1 N2)` and `(N2 V2 N3)`: *I saw the man eat cheese*
is `self see man` and `man eat cheese`. This is TTDB-RFC-0006's before→after transition read
literally, one link per verb.

**Members.** A nounish segment is read with the noun phrases of TTG-RFC-0002 §3. Before the
first verbish segment every non-prepositional phrase is a member (a subject list); after it,
the leading run of phrases is (an object list), and a segment that opens with a `prep`
phrase has none — except an `object_mark` phrase straight after a verbish segment, which is
the verb's object like any other (*a los ratones* is `ratón`). Prepositional phrases are **adjuncts**: each is a `comention` of the
segment's first member, or of the subject if it has none. A member's head is its last word,
or its first where the lexicon declares `head: first`; a `premod` word opens a phrase like a
determiner and is never its head (*dos gatos* is `gato`). Its term is the head's noun lemma,
and it keeps its own quantifier and its own `neg` (*I like cats but not dogs* is `self like
cat +` and `self like dog -`).

**Predicates.** A verbish segment is a list of items split at `conj` and `list_sep`; every
item takes the segment's subject and object. An item is a sequence of predicates, split
where an `aux`, `modal`, `cop` or `hav` follows a verb (*cats that hunt are fast* is `cat hunt
-` and `cat has_property fast`), and, in a relative's own verbish segment or an object
relative's, where a content word follows one (*hunt eat*); `neg` and `adverb` words between
the two go with the second (*cats that hunt never eat mice* denies the eating). Only the last
predicate takes the object. A predicate's
vector is, in order:

1. a declared `phrase:` after a `cop` (and optional `det`/`quant`) → its vector;
2. `cop` + `prep` → the prep;
3. `cop` alone → `class_of` or `property` per object, as in TTG-RFC-0002 §4;
4. `hav` alone → the `possession` role; `hav` before a `cop` is read from the `cop` (*has been
   happy* is a property, *has been sleeping* is `sleep`);
5. otherwise its content words, as verb lemmas, and its particles (`prep`, `infinitive`) after
   the first, joined by `phrasal_join`: `sleep_in`, `move_to`, `want_to_eat`. `aux`, `modal`,
   `neg` and `adverb` words never name a vector.

Polarity is `-` when the predicate, the subject member or the object member carries a `neg`,
or the subject a `quant_none`; the quantifier is the subject member's. A held percept keeps
that polarity behind its `?` (below).

**Clauses inside the chain.** Reading left to right keeps a stack of open clauses: the
sentence's own, and any relative or stance clause opened inside it. Each remembers its last
nounish segment, which is the next verb's subject, and its last verb.

- A **relative** opens at an `R` link. Straight before a verbish segment, its verb takes the
  antecedent as subject (*mice that eat cheese*). Before a nounish segment, that segment is
  its subject, and its verb's first predicate, if it has no object of its own, takes the
  antecedent as object (the **gap**) — a verb or possession, never a copula: *the dog that the
  cat chased ran away* is `cat chase dog`. In that verbish segment a content word straight
  after a content word begins a new predicate.
- **Where the gap is filled.** A verb takes the gap for possession, or for a vector the
  corpus already has with an object (*I like the dog that the cat chased*, once *cats chase
  mice* is said). The gap is **sure** before the clause's own first verb — the antecedent is
  a subject, and only an object relative can follow it — when a finite verb is still to
  come for the clause the relative hangs in (*I think the man that the cat chased is fast*),
  and after any verb that is not a stance verb, which cannot hear a clause (*I like the dog
  that the cat bit* is `cat bite dog`). Where it is sure, any other verb takes the gap too,
  unless it is **lone**: the grammar lists it `intransitive`, or the corpus has its vector
  only without an object (*the rule that cats bark is old* holds `cat bark`; *the day that
  the cat ran was hot* is not `cat run day` once *Pixel runs* is said). A verb ending on a preposition with nothing after it takes the gap as
  that preposition's thing (*I like the house that I live in* is `self live_in house`),
  unless the relative hangs on a stance verb's first thing, where it may be the clause the
  stance hears (*I told the man that the cat came in* holds `cat come_in`). A verb whose own
  object follows the preposition joined to it gives the preposition up when its stem would
  take the gap, and that object becomes an adjunct of the antecedent: *the cat that I saw in
  the garden sleeps* is `self see cat` and `cat with garden`.
- **A reported clause.** An object relative whose gap no verb takes was never one: after a
  verb's object the relative word began a clause reported to that thing, and every percept
  in it is held: *I emailed the man that the cat sleeps* is `self email man +` and `cat sleep
  ?`; *I emailed the man that the cat chased the mouse* holds `cat chase mouse`. After a
  stance verb's first thing this is the same rule, not a second one: the stance keeps its
  thing, and the clause is a relative when its verb takes the gap (*I told the man that the
  cat chased* is `cat chase man`) and reported when it is lone (*I told the man that the cat
  sleeps* holds `cat sleep`). A verb that is neither — one the corpus has not met, and the
  grammar does not list — could be either, and both readings are held: *I told the man that
  the cat bit* holds `cat bite -` and `cat bite man`. Once the owner says the verb with a
  thing, a re-reading (§5.1) offers the relative. After a **stance noun** — a `stance_noun`, whose clause says
  what the noun holds — it is always reported: *the idea that cats bark is silly* holds `cat
  bark` and says `idea has_property silly`.
- A **relative closes** when a verb arrives after its own verb — the next predicate or the
  next verbish segment — unless that verb is bare and goes on (below). Every relative it
  holds closes with it, back to the clause the outermost one hangs in, and that verb takes
  that clause's last nounish segment — the antecedent: *cats that chase mice are fast* is
  `cat chase mouse` and `cat has_property fast`; *cats that chase mice that eat cheese are
  fast* is about cats; *cats that chase mice eat cheese* is `cat eat cheese`.
- **A bare verb goes on.** A verb in the form its lemma is written in (*eat*, *comer*), or
  wearing a `progressive_ending` with nothing before it, is **bare**: not finite. A bare verb
  after a relative's own verb stays in the relative — its subject is the relative's last
  thing, or the gap when the verb before it took the gap — while the clause the relative
  hangs in is still waiting for its verb and a finite verb is still to come outside any
  later relative: *the man that saw the cat eat cheese is tall* is `man see cat`, `cat eat
  cheese` and `man has_property tall`; *the cat that I saw eat cheese is fat* is about the
  cat. It stays, too, when the bare form cannot be finite for the thing it would close back
  to: the morphology's `bare_finite` lists the subjects a bare form is finite for (`plural`,
  `self`; `-` for none, as in Spanish, whose bare form is the infinitive), so *the man that
  saw the cat eat cheese.* is the cat eating, and *the men that saw the cats eat cheese.* is
  the men. Where the morphology declares `bare_ending`, a bare form also wears one, so a
  finite form the lemmatiser misses (*cazaron*) is not taken for bare. When the bare form
  agrees with the thing it would close back to, the relative's verb is a chain verb, and no
  finite verb is to come, the sentence reads either way — *the men that saw the cats eat
  cheese.* is the men eating, or the cats seen eating — and **both are held**: `man eat cheese
  ?` and `cat eat cheese ?`, beside the said `man see cat`. If both readings give the verb the
  same subject (*the cats that I saw eat cheese.*), there is nothing to hold. Where that
  clause already has its verb, the bare verb stays only after a **chain**
  verb, one that takes a thing and then a bare verb the thing does (*see*, *make*, *let*):
  *I like the man that saw the cat eat cheese* is `cat eat cheese`, while *I saw the cat
  that chased the mouse run away* is `cat run away`.
- A **stance clause** opens when a verb arrives straight after a stance verb's first thing,
  or when a relative closes back onto that thing (below).

**Two readings.** A verb straight after a relative's own verb (above) that the corpus also
knows as a thing may instead begin the relative's object: *birds that sing love songs*, once
*love* is a thing, says `bird sing -` — true on either reading — and holds `bird love song ?`.
What both readings of a sentence share is said; what only one of them says is held.

**Dropped subjects.** In a grammar that declares `self_ending` or `self_form`, a predicate
with no subject whose verb is in the speaker's own form — ending in a `self_ending`, and not
its lemma, or listed in `self_form` — has the speaker as its subject: *No como carne* is
`self comer carne -`, *Vi al gato* `self ver gato`, *Tengo dos gatos* `self has gato`. Any
other subjectless predicate is still a mention.

**Stance.** A seed record may list `stance:` verbs: those whose complement is a clause the
speaker does not assert (*think*, *doubt*, *hope*, *say*, *email*), and `stance_noun:`
nouns, whose clause is held the same way (*the idea that…*, above). When a verb arrives straight after
a stance verb's first thing — or a relative on that thing closes and returns to it — the
stance verb takes the clause, not the thing: its own percept has no object, and every percept
inside the clause it opens is held, including a relative on its subject. *I doubt cats like
fish* is `self doubt - +` and `cat like fish ?`; *I think the cat that chased the mouse is
fast* holds both. The stance clause closes with the relative it sits in: *the man that says
cats bark is tall* is `man say - +`, `cat bark ?` and `man has_property tall +`. A clause
that ends on a stance verb holds the clause after it when a `subord` word joins them: *I
wonder if cats bark*. A stance verb with only a thing after it is an ordinary verb (*I believe
you*, *I believe the man that fixed the car*).

**Alternatives.** A list joined by an `alt` word (*or*) says one of its members, not each.
Every percept whose subject list, object list or verb list contains one is held, and so is
every percept of the clauses either side of an `alt` word that joins clauses: *Pixel is a cat
or a dog* is `pixel is_a cat ?` and `pixel is_a dog ?`. Subjects carry this into a clause
that inherits them.

**A denied alternative is neither.** When the predicate carries a `neg` and the alternative
is in its object or verb list, each member is denied, not held: *Pixel is not a cat or a dog*
is `pixel is_a cat -` and `pixel is_a dog -`; *birds do not fly or swim* denies both, the
`neg` of the first verb covering the list. An alternative of subjects stays held, and negated
it is a held denial (*cats or dogs do not bark* holds `cat bark ?-`).

**Held.** A percept with polarity `?` or `?-` is **held**: said, and not asserted. `?-` is a
held denial: *I doubt cats don't bark* holds `cat bark ?-`, and a reply names it with the
negation prefix. A runtime that knows only `?` skips `?-` as malformed, so neither is ever
believed by mistake. Like a mention it
names terms, creates them if new, counts toward `seen` and is searchable; it never
consolidates into a belief, never contradicts one, and a reply names it apart from the
grounds (`noted_held`). A question still checks it: *Is Pixel a cat or a dog?* asks after
both.

**Mentions.** A percept whose subject or vector is `-` is a **mention**:

```
percept: 1 | coffee | - | - | + | -         Coffee.
percept: 1 | - | swim | - | + | -           Swim.
percept: 1 | - | feed | cat | + | -         Feed the cat.
```

A mention counts toward `seen` for the terms it names, creates them if new, and is
searchable; it never consolidates into a belief, and a question never checks one. A sentence
that forms no percept and no comention, and names exactly one thing, is a mention of that
thing. This extends TTG-RFC-0002 §5.1: `-` is a well-formed subject or vector.

---

## 4. The Owner's Reading

**Shape notation.** A shape is the sentence's tokens (lowercased, contractions expanded, as
tokenised) with each nounish segment inside the lexicon's `nounish_marks`, each verbish one
inside its `verbish_marks` and each aside inside its `aside_marks`; links stand bare:

```
[cats] {chase} [mice] but [they] {do not eat} [grass].
[pixel] {chases} [mice] that {eat} [cheese].
[birds] {fly, swim and sing}.
(i think) [cats] {bark}.
```

The marks are declared per language, two characters each, open then close; they do not nest.
A store that declares no nounish and verbish marks writes no shapes. The reference store uses
`[ ]` and `{ }` — angle brackets would be stripped from fed files as HTML (TTG-RFC-0002 §2) —
and `( )` for asides.

**Marks in input.** Marks typed into the input force the tokens between them nounish or
verbish; the parser labels everything else. Nounish and verbish marks never reach the
`said:` line.

**Asides.** Words inside `aside_marks` are left out of the reading: the segments around them
are labelled and read as if they were not there, and they form no percept. This is how the
owner says a hedge was meant as fact: *I think cats bark* holds `cat bark`; `(i think) [cats]
{bark}.` says it. Because the reference store's aside marks are parentheses, a parenthesis the
owner types is an aside too (*Pixel (my old cat) purrs*), and, being ordinary punctuation, it
stays in the `said:` line.

**Binding.** Two words joined by `phrasal_join` (`ice_cream`) are one token, and so one term.
A run of up to `phrase_max_words` unmarked content words that already names a term — a THING
whose lemma contains the join, or a VECTOR — is bound the same way, so once the owner has
bound *ice cream* the words find it unmarked. Inside marks the owner's reading stands and
only an explicit join binds; that is what makes a shape read back to itself. In a `said:`
line a join between two words is written as a space.

**Round trip.** Reading a sentence's shape as input MUST reproduce the same shape and the
same percepts. A runtime SHOULD test this over its parse cases.

**Before a sentence is written**, the owner may relabel its shape: a host passes one shape
per sentence with the text, the percepts come from those shapes, and the episode records
them. **After**, a relabelled shape is an amendment (§5).

**Episode records.** An episode written under this RFC carries one line per sentence that
has a shape, between its `said:` and `percept:` lines:

```
said: 1 | Birds can fly and swim.
shape: 1 | [birds] {can fly and swim}.
percept: 1 | bird | fly | - | + | -
percept: 1 | bird | swim | - | + | -
```

An episode written before it has none; its shapes are recomputed from the words when needed.

---

## 5. Amendments

An episode is never rewritten (TTG-RFC-0002 §5.1). A correction to how one of its sentences
was read is an **amendment**:

```
@LAT<amend_lane>LON<episode ordinal> | created | updated | relates:<amend_edge>@<episode>

**<amend_title>**

```ttdb-amend
shape: <n> | <shape>
grammar: <n> | <grammar hash>                  only when the owner took the grammar's reading
percept: <n> | <subject> | <vector> | <object or -> | <+, -, ? or ?-> | <quantifier>
```
```

- **One record per episode**, on `amend_lane` at the episode's longitude, so `@LAT91LON7`
  amends `@LAT90LON7`. It holds, for each sentence it amends, the shape that stands and the
  percepts that shape reads as. It is managed: amending again rewrites it in place and
  advances `updated`. Reading a sentence back the episode's own way removes its entry; an
  amendment with no entries is deleted.
- **Consolidation** takes an amended sentence's percepts from the amendment instead of the
  episode, attributed to the episode and sentence they amend. Counting (episodes, not
  sentences), order (TTG-RFC-0004 §2) and quotes are therefore the saying's own. A malformed
  amendment line is skipped and counted like an episode's, and still stands in for the
  sentence it amends.
- **Context.** The sentence is re-read after the sentences before it in the episode, each as
  it now reads, so its pronouns resolve as they did.
- **Start empty** deletes the amend lane with the episode lane.
- New terms an amendment names are placed as a tell's are. Terms it no longer names keep
  their records, with the lower `seen` the replay gives them.

An amendment answers as a tell does: the `amended` verdict, then the grounds its percepts
form, then anything it disagrees with or retires.

### 5.1 Re-reading

Episodes are read under the grammar of their day, and grammars, runtimes and corpora
change — a verb the owner comes to use with a thing, a phrase the owner binds. A
**re-reading** reads every sentence of every episode again from its words — each after the
sentences before it, so its pronouns resolve — under the grammar and corpus the store holds
now, and
reports each sentence whose shape or percepts differ from what its episode wrote: the
episode, the sentence, both readings, whether the owner has amended it, and a hash of the
grammar records it was read under.

A re-reading **writes nothing**. An amendment is the owner's word about a reading; a
grammar's changed opinion is not, and writing it would print the grammar's reading as the
owner's. A re-read sentence stands only when the owner amends with it (§5), so a report under
one grammar hash is how a grammar revision (TTG-RFC-0001 §13.3) is audited before anyone
accepts it.

**Taking a re-reading.** When the owner takes the grammar's reading unchanged, the amendment
entry carries a `grammar:` line naming the hash it was offered under, so what the owner took
from a grammar is never printed as what the owner marked. A runtime MUST refuse the hash if
it is not the store's grammar now — the report is stale. A reading the owner marks, even one
that started from the grammar's, carries no `grammar:` line. A report names each sentence's
standing ruling: `amended` when the owner has one, `accepted` when it is this very reading.

A host SHOULD offer the grammar's reading beside the one that stands, with the percepts it
would form — a reading can change what a sentence says without changing its shape (*I like
the man that saw the cat eat cheese*: who eats is the chain's decision, not the segments').
Taking every re-reading under one hash at once SHOULD skip sentences the owner has amended.
The reference runtime exposes `reread(S, episode?)`, the optional `grammar` argument of
`amend` and `amendReply`, an episode panel that offers each re-reading, a store-bar control
that counts the re-readings the owner has not ruled on and takes them all after asking, and
`tools/reread.mjs --accept <hash>`; the reference store's eight demo episodes read today
exactly as written.

---

## 6. Grammar Keys

| Kind | Key | Meaning |
|---|---|---|
| `lexicon` | `class: relative` | Words that link a nounish segment to the verbish one after it. |
| `lexicon` | `class: infinitive` | A marker that carries a verb on or begins one (*to*). |
| `lexicon` | `nounish_marks`, `verbish_marks` | Two characters each: open, close. |
| `lexicon` | `aside_marks` | Two characters: open, close. What they enclose is left out of the reading (§4). |
| `lexicon` | `class: alt` | Words that join alternatives (*or*); what they join is held. |
| `lexicon` | `class: premod` | Words that open a phrase and are never its head, for a head-first language (*dos*, *buen*). |
| `lexicon` | `head` | `last` (the default) or `first`: which word of a phrase is its head. |
| `seed` | `stance` | Verb lemmas whose clause is held; each is also a seed. |
| `seed` | `chain` | Verb lemmas that take a thing and then a bare verb that thing does (*see*, *make*, *let*); a relative's bare verb after one stays in the relative (§3). Each is also a seed. |
| `seed` | `stance_noun` | Noun lemmas whose clause is held, as a stance verb's is (*idea*, *news*, *hecho*). Not seeds. |
| `seed` | `motion` | Verb lemmas that go somewhere; after one, an `object_mark` word is a preposition (*ir*, *volar*). Each is also a seed. |
| `seed` | `intransitive` | Verb lemmas that take no thing: never a relative's gap (*sleep*, *bark*, *dormir*). Each is also a seed. |
| `morphology` | `adverb_ending`, `adverb_guard` | An ending that makes an unlisted word between a thing and its verb an adverb (*ly*, *mente*), and the words it does not (*family*). |
| `morphology` | `self_ending`, `self_form` | The speaker's own verb endings and forms, in a grammar that drops subjects (*o é í*; *soy vi*). Their presence lets a finite verb open a clause. |
| `lexicon` | `object_mark` | Words that mark a verb's thing rather than a place (Spanish *a*). |
| `morphology` | `bare_finite` | The subjects a bare form is finite for: `plural`, `self`, or `-` for none. Absent: any. |
| `morphology` | `bare_ending` | Endings a bare form wears (*ar er ir*). Absent: a bare form is its lemma. |
| `vectors` | `role: amend_edge` | The header edge type from an amendment to its episode. |
| `numbers` | `phrase_max_words` | Longest run of words bound to a known term. |
| `ttdb-sphere` | `amend_lane` | The latitude amendments sit on. |
| `responses` | `noted_mention`, `amended`, `amend_title` | A mention's verdict, an amendment's verdict, an amendment's title. |
| `responses` | `noted_held` | A note naming what a tell held, `{triples}`. |

A later language may declare its own marks, classes, `head`, `stance`, `chain` and `motion`
and `intransitive` verbs, `stance_noun` nouns, `object_mark`, and the bare, adverb and self
keys; it borrows
the role, the number and the lane like the rest (TTG-RFC-0001 §11). Merging two lexicons
merges their `head` too, which is one more reason they are kept apart.

---

## 7. Compatibility

A store without the keys of §6 reads as before, except that the percept rules of §3 apply to
every clause. A runtime that predates this RFC MUST ignore `shape:` lines in episodes (unknown
block keys, TTG-RFC-0001 §12) and the `ttdb-amend` fence (TTCP-RFC-0001 §3), and will read a
mention as a belief about the term `-` and a held percept as malformed; stores carrying
mentions, held percepts or amendments need a runtime that implements this RFC. A runtime
implementing 0.3 or earlier skips a `?-` percept as malformed, which never believes it, and
one implementing 0.4 or earlier ignores an amendment's `grammar:` line. The
published bAbI outcomes (tasks 1 and 15, every condition) are unchanged under the reference
runtime.

---

## 8. Open Questions

1. **After the verb, an adverb or a name.** Only an *-ly* word between a thing and its verb is
   read as an adverb; after a verb it may be one (*sings loudly*) or a name (*met Emily*), so
   *she sings loudly* still makes *loudly* the thing sung.
2. **Subjects the grammar drops, other than the speaker.** Spanish verb forms name their
   person; only the speaker's are read (`self_ending`, `self_form`). *Come queso* has a
   subject — someone else's — that the store could only guess.
3. **A word the corpus has never met as a thing**, straight after a relative's verb, is the
   clause's verb: *birds that sing love songs.* believes the birds love songs until the
   owner has used *love* as a thing.
4. **The chain list and the intransitive list are English and Spanish words the grammar
   declares by hand.** A store could learn both from the owner's own sentences, as it learns
   which verbs take a thing; how many sayings make a verb a chain verb is open.
5. **Every held ambiguity is a pair of held percepts.** Nothing links the two readings of
   *the men that saw the cats eat cheese* to each other: a question sees two held sayings,
   not one saying with two readings.
6. **A reading's context is the sentences before it.** A re-reading carries pronouns forward
   as the sentences now read, so taking one reading can change what the next one reads as;
   the tool and the page take them in episode order and do not re-read between them.

---

## 9. Changelog

| Date | Change |
|---|---|
| 2026-09-21 | Initial draft, from the personal_grimoire reference implementation |
| 2026-09-21 | 0.2: relative clauses close at the next verb; `stance` verbs and `alt` lists hold what they introduce (polarity `?`); `head` and `premod` put a phrase's head where the language does; a `relative` word outranks `subord` in relative position. Open questions 1–4 of 0.1 answered or narrowed. |
| 2026-09-21 | 0.3: a stack of open clauses — object relatives (*the dog that the cat chased*), a stance clause inside a relative, a relative inside a stance clause; a denied alternative is a denial of each; `aside_marks` let the owner leave words out of a reading, so a hedge can be said as fact; after a stance verb's thing a relative word opens a reported clause, and clause-taking verbs join the reference stance list. 0.2's open questions answered; new ones listed. |
| 2026-09-22 | 0.4: a bare verb goes on with a relative's chain while a finite verb is still to come, or after a `chain` verb; an object relative whose gap no verb takes reports a held clause; a particle verb gives up its preposition for the gap, and a stranded preposition joins the verb; a determiner-relative before a bare thing and a verb opens an object relative; a held percept keeps its polarity (`?-`); `hav` before `cop` reads from the `cop`; §5.1 re-reading reports what a grammar now reads differently and writes nothing. 0.3's open questions answered; new ones listed. |
| 2026-09-22 | 0.5: a verb straight after a subject relative's own verb begins the clause's; `stance_noun` clauses are reported; `bare_finite` and `bare_ending` let agreement keep a bare verb in its relative; a stranded preposition takes the gap except after a stance verb's thing, where one rule now decides relative or report and a finite verb to come makes the gap sure; `object_mark` and `motion` read Spanish personal *a*; an amendment's `grammar:` line records a re-reading the owner took, offered in the page and by `--accept`. 0.4's open questions answered; new ones listed. |
| 2026-09-22 | 0.6: where the grammar can see two readings, both are held and what they share is said (a chain verb's bare verb that agrees; a thing-word straight after a relative's verb; a verb after a stance verb's thing that is neither known nor `intransitive`); `intransitive` verbs never take the gap, and after a verb that cannot hear a clause the gap is sure; `adverb_ending` and `adverb_guard`; `self_ending` and `self_form` read Spanish dropped subjects as the speaker; re-readings follow the corpus too, and the page takes them all from the store bar. 0.5's open questions answered; new ones listed. |

*License: CC0*
