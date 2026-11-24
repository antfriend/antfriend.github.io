# TTG-RFC-0006: Constructions — Shapes That Carry Meaning

**Version:** 0.5
**Status:** Draft — implemented in the personal_grimoire reference runtime
**RFC Number:** 0006
**Project:** toot-toot-engineering
**Component:** Toot Toot Grammar (TTG)
**Depends on:** TTG-RFC-0001, TTG-RFC-0002, TTG-RFC-0003, TTG-RFC-0005
**Author:** antfriend
**Created:** 2026-11-24

---

## 1. Abstract

Until now a reading's meaning came only from its words. Each verb related the things on
either side of it (TTG-RFC-0005 §3), so *Pixel sneezed the napkin off the table* said that
Pixel sneezed the napkin, and that the napkin was off the table. Nothing in the store could
say that the pattern *X V Y off Z* means Y went off Z, whatever the verb.

A **construction** is a shape paired with the percepts a clause of that shape says. It is
written in the grammar, in the owner's own segment marks, as a ninth grammar kind:

```ttdb-grammar
kind: constructions
construction: [X] {V} [Y] off [Z] => V X Y, go_off Y Z | caused motion
```

A clause whose words fit the shape is read by the construction instead of the chain. The
reply names the construction, the episode's shape line is written as usual, and when a new
construction changes how an old sentence reads, re-reading reports it, as it reports any
grammar change (TTG-RFC-0005 §5.1). This is the construction-grammar idea that a pattern
can carry meaning of its own, kept to what this store can do safely: no word in the
runtime, no meaning without the owner's words, and nothing believed that a re-reading
cannot show.

Constructions form a network by default inheritance (§8): a construction may name parents,
and then says all they say, overriding them where it says otherwise itself; where its parents
disagree and it does not say, that part is held, never believed. A construction with no shape
is abstract: never matched, it says what its descendants share.

---

## 2. The Constructions Record

A `ttdb-grammar` block of `kind: constructions` holds any number of `construction:` lines:

```
construction: <shape> => [<atom>[, <atom>…]] | <label> [| is_a <parent label>]…
```

- **The shape** is a sequence of elements separated by spaces, or nothing at all, which makes
  the construction **abstract** (§8.6):
  - a **nounish name**, a capitalised name inside the lexicon's `nounish_marks` (`[X]`);
  - a **verbish name**, a capitalised name inside its `verbish_marks` (`{V}`), which may be
    **tied** to the verbs it binds: `{V=knock}` binds only a verb whose head lemma is *knock*,
    and `{V=knock,push}` either (§3, step 2);
  - a **word**, anything else, matched as itself (lowercased, as tokens are).
- **An atom** is `vector subject object`, as a rule's atom is (TTG-RFC-0003 §3.1). A nounish
  name stands for the head lemma of the phrase it matched; a verbish name for the verb's
  head lemma. Anything else names a term or vector outright, and `-` as the object is no
  object. A vector named outright that wears the `negation_prefix` role (`not_go_off`) states
  a denial: the percept is the vector without the prefix, denied (§3, step 4).
- **The label** is the construction's name. Replies quote it (§4).
- **The parents**, optional, are parts after the label, one per parent: the `class_of`
  role's value (`is_a` in the reference store, so the runtime holds no word for it), then the
  label of another construction in the same language (§8). A construction with at least one
  parent may have no atoms of its own: it is what its parents are, together.

A name occurs at most once in a shape. Constructions are tried most specific first: a
construction before every one of its ancestors (§8), and otherwise the one with the most
words of its own, a tie counting as one. Constructions equal on both go in the order they
are written.

---

## 3. Matching

A construction is matched against **one clause** after the clause's tokens are labelled
nounish or verbish (TTG-RFC-0005 §2) and before the chain is walked (§3 there).
Punctuation is not matched.

1. **Cover.** The shape covers the whole clause. A nounish name takes one or more
   consecutive nounish tokens, a verbish name one or more consecutive verbish tokens, and a
   word one token equal to it, however that token was labelled. *Off*, which the English
   lexicon does not list, is labelled verbish; *into*, a preposition, nounish. Either way it
   matches the word.
2. **Read.** A nounish name's tokens MUST read as exactly one noun phrase that has a head
   and no preposition. A verbish name's tokens MUST read as exactly one predicate whose
   kind is a verb (not the copula, *have* or a phrase); a tied verbish name's verb MUST have
   one of its tie's words as its head lemma. The tie is by lemma, not by form, so it takes
   every form the morphology reads as that verb — `{V=knock}` binds *knocked*, *knocks* and
   *knocking* — where a word in the shape matches one form only; and it is only as good as
   the morphology (a verb the morphology lemmatizes wrongly misses its tie). A span that does
   not read is not a match, and other spans are tried.
3. **Replace.** The first construction that matches supplies the clause's percepts, one per
   atom, in place of the chain's. Its subjects are the clause's subjects for what follows
   (the next clause's inherited subject, and the anaphor context).
4. **Carry.** A denied verb (*didn't knock*) denies every atom. A subject quantified *none*, or
   a subject or object phrase that is denied, denies the atoms it is in. The quantifier of an atom's
   subject is its phrase's. An atom the construction states as a denial (§2) is denied; a
   clause that denies it again (*Pixel didn't push the cup almost off the shelf*) says
   neither way, so the denial is held (`?-`), never believed. A past verb marks every atom
   past (the tense line). A clause
   that is held (after *or*, reported after a stance verb, or containing a hedge word)
   holds every atom, and a reported clause links its atoms to the stance that holds it
   (the holds line).
5. **The owner's marks overrule.** A clause containing any token the owner marked is the
   owner's reading, and no construction reads it.

A clause that no construction matches is read exactly as it would be without any. A shape
that is only part of its clause (*the napkin that Pixel sneezed off the table*, where the
relative word is not in the shape) does not match.

---

## 4. Reporting and the Owner's Reading

A tell that a construction read names it in its reply, under the `responses` key
`read_by`, with the slot `{label}`. A construction that has ancestors is named under
`read_by_is_a`, with `{label}` and `{parents}` (its ancestors, nearest first, joined by
commas); a store without that key uses `read_by`. A construction with a contested atom (§8)
adds a note under `construction_contested`, with the same slots, and its contested atoms are
not also named as held sayings (`noted_held`), which would say the owner hedged them. The episode's lines are written as for any sentence:
the shape line in the owner's marks, the percepts, and the holds, gap and tense lines. So
the owner sees which construction read the sentence, and can overrule it by amending the
sentence with marks of their own (§3, step 5).

Adding, changing or removing a construction changes the grammar hash. Re-reading
(TTG-RFC-0005 §5.1) lists exactly the sentences whose reading changed, and the owner takes
those changes or not. A store whose grammar declares no constructions reads exactly as it
did before this RFC.

---

## 5. Languages

Constructions contain words, so each language declares its own. A later language never
borrows the first language's constructions, as it borrows its rules and numbers
(TTG-RFC-0001 §11). The reference store declares the English caused-motion construction
and no Spanish one.

---

## 6. Safety

As with rules (TTG-RFC-0003 §3.1), a construction line is kept only if it is safe. A
rejected line is reported with its reason (the reference runtime's consolidation tool
lists each one and fails):

| Reason | When |
|---|---|
| `shape` | no `=>`; no label; no atoms and no parent; a shape with words but no name; a name that is not capitalised or occurs twice; a mark left inside a word; an atom that is not three items; `-` as an atom's vector or subject; the negation prefix on a verbish name; a tie on a nounish name, or a tie with no word in it; a part after the label that is not the `class_of` role and a label; a parent named twice |
| `length` | the shape has more elements than the `numbers` key `construction_max_words` |
| `protected` | an atom's vector is the comention or episode edge |
| `unsafe` | an atom uses a name its shape does not bind, or binds as the other kind: a verbish name as a subject or object, a nounish one as a vector — its own atoms, or those it inherits (§8); for an abstract construction, which has no shape, a name its atoms use both as a vector and as a subject or object (§8.6) |
| `parent` | one of its parents is not a construction of the same language, or was itself rejected |
| `cycle` | following parents from it, through any of them, comes back to it |

A construction only writes percepts about the terms its clause names and the vectors its
line names. It adds no reasoning: what follows from its percepts follows by the rules and
the vector algebra, as for any percept.

---

## 7. Questions

A construction reads tells, not questions. A place question asks along the verb with
the place's preposition, the bare verb and the place vector (TTG-RFC-0003 §4). It also
asks along every **phrasal vector** of the verb that the store already names: the verb
joined to a particle by `phrasal_join`. So *Where did the napkin go?* reaches
`napkin | go_off | table`, and *Where does Pixel sleep?* reaches `sleep_on`, where the
owner's words have it, as well as `sleep_in`.

---

## 8. Inheritance

Constructions form a network of default inheritance, as construction grammar describes, and
the network is resolved by the specificity the reasoner uses for beliefs (TTG-RFC-0003 §3):
the specific overrides the general.

1. **What a child says.** A construction that names parents says everything they say,
   including what they inherit, in the order its parents are named, and its own atoms after
   them. An atom of its own with the same vector, subject and object as an inherited one
   replaces it, with its own polarity, as *penguins don't fly* replaces *birds fly*. Atoms with
   other vectors are added, not replaced.
2. **Several parents.** An atom that two parents say alike, with the same vector, subject,
   object and polarity, is said once, so a child of two parents that share an ancestor (a
   diamond) does not double a percept. An atom they disagree on — one says it, another denies
   it — is **contested**, unless the child says that atom itself: it is held (`?`), never
   believed, as the reasoner keeps a contested belief (TTG-RFC-0003 §2), and the reply names
   the parents that disagree (§4). A contested atom stays contested in every descendant that
   does not settle it.
3. **Names.** An inherited atom's names are the child's names: a child's shape MUST bind every
   name its inherited atoms use, as the same kind, or the child is rejected (`unsafe`). The
   usual child extends its parent's shape, as the reference store's does:

   ```ttdb-grammar
   construction: => V X Y | acting on a thing
   construction: [X] {V} [Y] off [Z] => go_off Y Z | caused motion | is_a acting on a thing
   construction: [X] {V} [Y] onto [W] => go_onto Y W | motion onto | is_a acting on a thing
   construction: [X] {V} [Y] off [Z] onto [W] => | caused motion onto | is_a caused motion | is_a motion onto
   ```

   *Pixel sneezed the napkin off the table* says `pixel | sneeze | napkin`, from *acting on a
   thing*, and `napkin | go_off | table`, its own. *Pixel knocked the cup off the shelf onto
   the floor* says `pixel | knock | cup` (once, though it comes through both parents), `cup | go_off | shelf` and `cup | go_onto | floor`; *Where
   did the cup go?* finds both places. A child may also deny what its parent says: with `[X] {V} [Y] almost off [Z] =>
   not_go_off Y Z | almost off | is_a caused motion`, *Pixel pushed the cup almost off the
   shelf* says the push and denies that the cup went off. And a child may be tied to one verb
   (§2): the reference store's `[X] {V=knock} [Y] off [Z] => fall_off Y Z | knocking off |
   is_a caused motion` reads *Pixel knocked the cup off the shelf* as the knock, the cup going
   off and the cup falling off, while *pushed* is caused motion alone.
4. **Order.** A construction is tried before every one of its ancestors, whatever their
   words, so that wherever both match, the specific one reads the clause. The parent still
   reads every clause the child does not match.
5. **Resolution.** Inheritance is resolved when the grammar loads, not as sentences are read:
   a construction's whole meaning is fixed before any clause is matched, and a rejected
   ancestor rejects every descendant (`parent`). Its ancestors are listed nearest first,
   parents in the order named, without repeats.
6. **Abstract constructions.** A construction whose shape is empty (`=> V X Y | acting on a
   thing`) is abstract. It is never matched against a clause, so it reads nothing itself; it
   says what its descendants share, written once. Without a shape to bind them, its names are
   the kinds its atoms use them as: a name in an atom's vector place is verbish, one in a
   subject or object place nounish, and a name used both ways, in its own atoms or in what it
   inherits, rejects it (`unsafe`). An abstract construction may inherit, including from
   another abstract one, and may have no atoms of its own if it has a parent. A child with a
   shape binds every name it inherits from it, as from any parent (item 3).

---

## 9. Grammar Keys

| Kind | Key | Value |
|---|---|---|
| `constructions` | `construction` | `<shape> => [<atoms>] | <label> [| is_a <parent>]…`, any number |
| `numbers` | `construction_max_words` | the most elements a shape may have |
| `responses` | `read_by` | the note naming the construction that read a tell; slot `{label}` |
| `responses` | `read_by_is_a` | the same, for a construction with ancestors; slots `{label}`, `{parents}` |
| `responses` | `construction_contested` | the note that its parents disagree on part of it; slots `{label}`, `{parents}` |

---

## 10. Compatibility

A store that declares no `constructions` record reads, consolidates and answers exactly as
before. The added phrasal vectors in place questions can add answers that a store already
holds, and never remove one. An episode written before a construction was declared keeps
its percepts until the owner takes a re-reading.

---

## 11. Open Questions

1. **Inheritance.** *Answered:* in 0.2 (§8), several parents in 0.3, abstract constructions in
   0.4 (§8.6), and in 0.5 a verbish name tied to its verbs (§2), so a child whose verb is one
   word inherits its parent's `V X Y`. A nounish name cannot yet be tied (`[X=cat]`).
2. **Part of a clause.** A shape must cover its whole clause. Matching a span inside a
   relative clause or a stance's clause (*I think Pixel knocked the cup off the shelf*,
   read now by its words) needs the walk to hand spans to the matcher.
3. **Spanish.** *de* is both "off" and "of", so *estornudó la servilleta de la mesa* cannot
   be read by a shape on *de* alone. A tie (0.5) gives one a condition on its verb —
   `[X] {V=estornudar} [Y] de [Z]` — but the reference store declares no Spanish construction
   yet.
4. **Questions by construction.** A question could be read by a construction too (*What
   did Pixel sneeze off the table?*). For now, questions are read by the question forms.

---

## 12. Changelog

| Date | Change |
|---|---|
| 2026-11-24 | 0.1: initial draft, from the personal_grimoire PLAN.md phase 6. §2–7 implemented by the personal_grimoire reference runtime (antfriend.github.io `ea1bc58`) and checked by its tests. |
| 2026-11-24 | 0.2: §8, inheritance — a construction names a parent, says what its ancestors say, overrides an inherited atom on the same vector, subject and object, and is tried before its ancestors; `not_` atoms state denials, and a clause denying one holds it (§3); `parent` and `cycle` rejections (§6); `read_by_is_a` (§4, §9). §8–11 renumbered §9–12; open question 1 answered. Implemented by the personal_grimoire reference runtime (antfriend.github.io `8a1d9e2`). |
| 2026-11-25 | 0.3: several parents — one `is_a` part each, and no atoms of a construction's own needed (§2); what parents say alike is said once, and what they dispute is contested, held unless the child says it (§8.2); `construction_contested` (§4, §9); the `shape`, `parent` and `cycle` rejections widened (§6); §8 renumbered; open question 1 narrowed. Implemented by the personal_grimoire reference runtime (antfriend.github.io `fd6ef4a`). |
| 2026-11-26 | 0.4: abstract constructions — an empty shape is never matched, only inherited from, its names the kinds its atoms use them as (§2, §8.6); `unsafe` covers a name an abstract construction uses as two kinds (§6); the §8.3 example now has an abstract root; open question 1 narrowed. Implemented by the personal_grimoire reference runtime (antfriend.github.io `5777b04`). |
| 2026-11-27 | 0.5: a verbish name tied to its verbs by lemma, `{V=knock}` or `{V=knock,push}` (§2, §3 step 2), counted as a word of the construction's own; malformed ties (§6); the §8.3 example gains *knocking off*; open questions 1 and 3 narrowed. Implemented by the personal_grimoire reference runtime (antfriend.github.io `4951a16`). |

*License: CC0*
