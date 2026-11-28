@LAT96LON0 | created:1797206400 | updated:1797206400 | type:scene | relates:depends_on@LAT96LON1,depends_on@LAT96LON2,depends_on@LAT96LON3,depends_on@LAT96LON4,depends_on@LAT96LON5
[ew]
conf:150
rev:0
sal:96
touched:1797206400
[/ew]

**Scene — five scenes, one walk**
src: RFCs/TTG-RFC-0007-Acts-and-Scenes.md §5–§8

Start here. Press **play the scene** and this walk takes you through the five scenes beside
it, one after another, on this one page. Each part opens on its scene's own record, so the
panel tells you what that part shows while the globe goes where its steps send it. Press
**next** to turn a slide. Three of the steps run by themselves, flying the globe from one
record to the next. One step writes a sentence into this store, and the page asks you before
it does. Any hand on the globe stops the walk.

The store holds thirteen sayings about birds, Pixel, coffee and the weather. One thread runs
through all five parts: *Can an ostrich fly?* Your words say birds can fly and an ostrich is
a bird, so the store infers that an ostrich can fly. That is a reasonable reading of what you
said, and it is wrong.

1. [Slides that follow your words](lat96lon1): every question is asked again each time a
   slide is shown.
2. [Going over your doubts](lat96lon2): steps that take their records from the store, so the
   scene has a different length each time.
3. [A write that asks first](lat96lon3): the walk corrects the ostrich, with your consent, and
   the new episode records which scene told it.
4. [Una escena en español](lat96lon4): Spanish acts, which Spanish never borrows from English.
5. [Pinned to an older grammar](lat96lon5): a scene the grammar has moved on from.

The walk keeps a log. Play it twice and its panel names the slide that changed between the
two playings, *ostrich: affirm_inferred → deny*, because of what part three wrote the first
time.

```ttdb-scene
advance: hand
log: true

step: one     | do: select | target: @LAT96LON1
step: fly     | ask: Can penguins fly?    | expect: deny
step: ostrich | ask: Can an ostrich fly?
step: why     | say: Light up that.
step: two     | do: select | target: @LAT96LON2
step: doubts  | each: contested  | do: select | max: 3 | advance: hold | hold_ms: 2200
step: moved   | each: superseded | do: select | max: 3 | advance: hold | hold_ms: 2200
step: weight  | each: eps_top    | do: select | max: 3 | advance: hold | hold_ms: 1600
step: three   | do: select | target: @LAT96LON3
step: fix     | tell: Ostriches do not fly.
step: again   | ask: Can an ostrich fly?    | expect: deny
step: source  | say: Light up that.
step: four    | do: select | target: @LAT96LON4
step: gato    | say: Muestra a Pixel.
step: animal  | ask: ¿Es Pixel un animal?
step: luz     | say: Ilumina eso.
step: five    | do: select | target: @LAT96LON5
step: home    | say: Show me.
```

---

@LAT96LON1 | created:1797206400 | updated:1797206400 | type:scene | relates:refines@LAT96LON0
[ew]
conf:150
rev:0
sal:96
touched:1797206400
[/ew]

**Scene — slides that follow your words**
src: RFCs/TTG-RFC-0007-Acts-and-Scenes.md §5.3, §8.4

A bird lesson in five slides that you turn yourself. None of its answers is written in the
scene. Each slide is a question asked of your words when it is shown, so the lesson changes
when your words do.

Today *Can penguins fly?* is a no that you said. *Can an ostrich fly?* is a yes the store
infers, and the next slide lights the records that inference came from. After the ostrich is
corrected ([part three](lat96lon3) does it, or type *Ostriches do not fly.* yourself), the
same question answers no. The scene then takes its other branch: it skips the lit-up
inference and shows the ostrich instead.

The scene keeps a log. Play it, correct the ostrich, then play it again: this panel names the
slide that changed and what it changed from and to. Each playing is a record on lat 97 that
holds the episode it was played after and the sayings behind each slide.

```ttdb-scene
advance: hand
log: true

step: penguin | say: Show the penguin.
step: fly     | ask: Can penguins fly?    | expect: deny
step: ostrich | ask: Can an ostrich fly?  | on_deny: fixed
step: wrong   | say: Light up that.       | next: home
step: fixed   | say: Show the ostrich.
step: home    | say: Show me.
```

---

@LAT96LON2 | created:1797206400 | updated:1797206400 | type:scene | relates:refines@LAT96LON0
[ew]
conf:150
rev:0
sal:96
touched:1797206400
[/ew]

**Scene — going over your doubts**
src: RFCs/TTG-RFC-0007-Acts-and-Scenes.md §5.4

A weekly review that plays itself. Press play and leave it: each step holds for a moment and
then moves on, and the globe flies to every record it names.

Three of its steps are generators: they take their records from the store when the scene
starts.

- `each: contested` visits everything your words disagree about. Here that is you (you said
  you like coffee, then that you don't) and Pixel (who does and doesn't like milk).
- `each: superseded` visits everything your words have moved on from: the cloud was in the
  sky and is now in the server, and Pixel was in the garden and is now in the kitchen.
- `each: eps_top` visits the terms that weigh most in your words right now.

So the scene has no fixed length. Settle a doubt by saying it again and that stop drops out;
contradict yourself and a new stop appears. `max` sets how many stops a generator can add.

```ttdb-scene
advance: hold

step: start  | say: Show me.                                   | hold_ms: 1800
step: doubts | each: contested  | do: select | max: 5          | hold_ms: 2400
step: moved  | each: superseded | do: select | max: 3          | hold_ms: 2400
step: weight | each: eps_top    | do: select | max: 3          | hold_ms: 1800
step: home   | say: Show me.                                   | hold_ms: 1200
```

---

@LAT96LON3 | created:1797206400 | updated:1797206400 | type:scene | relates:refines@LAT96LON0
[ew]
conf:150
rev:0
sal:96
touched:1797206400
[/ew]

**Scene — a write that asks first**
src: RFCs/TTG-RFC-0007-Acts-and-Scenes.md §6.3, §7, §8.3

This scene corrects the ostrich. It asks the question, lights the inference that answered it,
and then reaches a `tell:` step. That step writes a sentence into your words, so the page asks
first. Whether a step asks is set by the actuator it calls, here `tell`, which is a write. The
scene's author cannot change that, so a scene someone else wrote cannot write into your store
without asking you.

If you say yes, *Ostriches do not fly.* becomes an episode like any other, with one difference
in its block: `source:` names this scene, this step and this playing, and a `told_by` edge
leads back here. The next slide asks the same question and gets a no you said. Its sources now
include the new episode, and you can open it from the reply to see which scene told it.

If you say no, the walk stops at that step and nothing is written.

```ttdb-scene
advance: hand
log: true

step: before | ask: Can an ostrich fly?
step: why    | say: Light up that.
step: fix    | tell: Ostriches do not fly.
step: after  | ask: Can an ostrich fly?    | expect: deny
step: source | say: Light up that.
```

---

@LAT96LON4 | created:1797206400 | updated:1797206400 | type:scene | relates:refines@LAT96LON0
[ew]
conf:150
rev:0
sal:96
touched:1797206400
[/ew]

**Scene — una escena en español**
src: RFCs/TTG-RFC-0007-Acts-and-Scenes.md §4.1, §4.2

The same kind of lesson, written in Spanish. *Muestra*, *ilumina* and *muéstrame* are
Spanish's own act words in its acts record, not translations of the English ones. A language
can borrow some kinds of grammar from the first language, but it never borrows acts, just as
it never borrows constructions.

This scene says `lang: es`, so its steps are read with the Spanish grammar only. Its fifth
line is in English, *Show Pixel.*, and the Spanish grammar has no act for it. The step is
rejected, and the page shows the rejection instead of guessing at it. An act in the wrong
language does nothing, rather than doing something you didn't ask for.

The question is asked in Spanish of sayings made in English. *Pixel* and *animal* are
spelled the same in both languages, so the question reaches the same terms, and the answer
is the same inferred yes, with the same records behind it.

```ttdb-scene
advance: hand
lang: es

step: gato   | say: Muestra a Pixel.
step: animal | ask: ¿Es Pixel un animal?   | expect: affirm_inferred
step: luz    | say: Ilumina eso.
step: casa   | say: Muéstrame a mí.
step: show   | say: Show Pixel.
```

---

@LAT96LON5 | created:1797206400 | updated:1797206400 | type:scene | relates:refines@LAT96LON0
[ew]
conf:150
rev:0
sal:96
touched:1797206400
[/ew]

**Scene — pinned to an older grammar**
src: RFCs/TTG-RFC-0007-Acts-and-Scenes.md §8.2

A scene is made of sentences, and the grammar is what reads them, so a change to the grammar
can change what a saved scene does without anyone editing it. To prevent that, a scene can be
pinned. Its `grammar:` line is the hash of the grammar it was written under.

This one is pinned to `6892e5d7933fff1c`, the hash of the seed's grammar before it had acts. That
grammar would have read *Light up that.* as a mention instead of an act. The store's grammar
is different now, so this panel says the pin is stale and lists the steps the current
grammar reads differently from the pinned one, and a re-reading of the store names this
scene too. The scene still plays, with that
note at the start.

Pinning it again records that you accept the current reading. It is an edit to this scene,
and its revision goes up by one. In an example store the edit lasts only until you reload. In
your own store it is kept.

```ttdb-scene
advance: hand
grammar: 6892e5d7933fff1c

step: ostrich | ask: Can an ostrich fly?
step: why     | say: Light up that.
step: home    | say: Show me.
```

---
