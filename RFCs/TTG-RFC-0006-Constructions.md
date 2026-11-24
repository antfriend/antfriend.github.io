# TTG-RFC-0006: Constructions — Shapes That Carry Meaning

**Version:** 0.1
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

---

## 2. The Constructions Record

A `ttdb-grammar` block of `kind: constructions` holds any number of `construction:` lines:

```
construction: <shape> => <atom>[, <atom>…] | <label>
```

- **The shape** is a sequence of elements separated by spaces:
  - a **nounish name**, a capitalised name inside the lexicon's `nounish_marks` (`[X]`);
  - a **verbish name**, a capitalised name inside its `verbish_marks` (`{V}`);
  - a **word**, anything else, matched as itself (lowercased, as tokens are).
- **An atom** is `vector subject object`, as a rule's atom is (TTG-RFC-0003 §3.1). A nounish
  name stands for the head lemma of the phrase it matched; a verbish name for the verb's
  head lemma. Anything else names a term or vector outright, and `-` as the object is no
  object.
- **The label** is the construction's name. Replies quote it (§4).

A name occurs at most once in a shape. Constructions are tried most specific first: the
one with the most words of its own. Ties go to the order the constructions are written.

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
   kind is a verb (not the copula, *have* or a phrase). A span that does not read is not a
   match, and other spans are tried.
3. **Replace.** The first construction that matches supplies the clause's percepts, one per
   atom, in place of the chain's. Its subjects are the clause's subjects for what follows
   (the next clause's inherited subject, and the anaphor context).
4. **Carry.** A denied verb (*didn't knock*) denies every atom. A subject quantified *none*, or
   a subject or object phrase that is denied, denies the atoms it is in. The quantifier of an atom's
   subject is its phrase's. A past verb marks every atom past (the tense line). A clause
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
`read_by`, with the slot `{label}`. The episode's lines are written as for any sentence:
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
| `shape` | no `=>`; a shape with no name; a name that is not capitalised or occurs twice; a mark left inside a word; an atom that is not three items; `-` as an atom's vector or subject |
| `length` | the shape has more elements than the `numbers` key `construction_max_words` |
| `protected` | an atom's vector is the comention or episode edge |
| `unsafe` | an atom uses a name its shape does not bind, or binds as the other kind: a verbish name as a subject or object, a nounish one as a vector |

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

## 8. Grammar Keys

| Kind | Key | Value |
|---|---|---|
| `constructions` | `construction` | `<shape> => <atoms> | <label>`, any number |
| `numbers` | `construction_max_words` | the most elements a shape may have |
| `responses` | `read_by` | the note naming the construction that read a tell; slot `{label}` |

---

## 9. Compatibility

A store that declares no `constructions` record reads, consolidates and answers exactly as
before. The added phrasal vectors in place questions can add answers that a store already
holds, and never remove one. An episode written before a construction was declared keeps
its percepts until the owner takes a re-reading.

---

## 10. Open Questions

1. **Inheritance.** An optional `is_a <label>` on a construction line would let
   constructions form the default-inheritance network that construction grammar
   describes, run through the specificity logic the reasoner already uses for beliefs.
2. **Part of a clause.** A shape must cover its whole clause. Matching a span inside a
   relative clause or a stance's clause (*I think Pixel knocked the cup off the shelf*,
   read now by its words) needs the walk to hand spans to the matcher.
3. **Spanish.** *de* is both "off" and "of", so *estornudó la servilleta de la mesa* cannot
   be read by a shape on *de* alone. A construction may need a condition on its verb.
4. **Questions by construction.** A question could be read by a construction too (*What
   did Pixel sneeze off the table?*). For now, questions are read by the question forms.

---

## 11. Changelog

| Date | Change |
|---|---|
| 2026-11-24 | 0.1: initial draft, from the personal_grimoire PLAN.md phase 6. §2–7 implemented by the personal_grimoire reference runtime (antfriend.github.io `ea1bc58`) and checked by its tests. |

*License: CC0*
