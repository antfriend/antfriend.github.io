# Journals TTDB
A TTDB transcription index for every image under `journals/`, with one record per image and a cleaned OCR text rendering.

```mmpdb
db_id: ttdb:journals:images:v1
db_name: "Journals"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:journals:ocr:reader:v1
  role: journal_librarian
  perspective: "A per-image transcription map for the journals image set."
  scope: "All files in journals/ with best-effort OCR text rendering."
  constraints:
    - "One record per image file."
    - "Keep transcript rendering simple and readable."
cursor_policy:
  max_preview_chars: 240
  max_nodes: 80
typed_edges:
  enabled: false
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "LAST <n>"
    - "STATUS"
  max_reply_chars: 240
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT86LON55
preview:
  @LAT86LON55: "Scene: Fishbowl Mechanistic Zoom Loop"
```

---

@LAT86LON55 | created:1772201003 | updated:1772201003 | type:scene | relates:starts_at>@LAT88LON81,plays>@LAT84LON29

## Scene: Fishbowl Mechanistic Zoom Loop

Play this scene to run a two-node zoom cycle with Fishbowl audio.

```ttdb-scene
audio_path: sounds/fishbowl.wav
start_node: @LAT88LON81
loop: true
edge: next | from:@LAT88LON81 | to:@LAT84LON29 | hold_ms:65000 | duration_ms:1500 | travel_px:340
edge: return_home | from:@LAT84LON29 | to:@LAT88LON81 | hold_ms:65000 | duration_ms:1500 | travel_px:340 | dir_x:-1 | dir_y:0
```

Sequence:
- At each node, a 60-second center zoom runs with a floating Hook panel, then Text one sentence at a time.
- Text clears at 1:00 and the zoomed image remains alone until 1:05.
- The scene transitions to the other node and loops.

---

@LAT88LON81 | created:1772201002 | updated:1772201002

## Fishbowl
![Fishbowl](journals/eye/fishbowl_scene.html)

[Image source](journals/eye/Fishbowl.png)

### Hook
A reflective note on mirrored identity, where perspective shapes meaning and the world each mind perceives.

### Text
This is a bit like looking in a fishbowl and seeing a fish looking back at you with your own expression, reflecting your inner experience in the other world before you, as experienced by another being.

The world is round.

Facts are things which can be true or false, mathematically.
The proof depends on semantics.
Semantics, the meaning, depends on the point of view, which direction are you coming from?
Facts depend on "[Umwelt](#umwelt-84)", the perceived world that bounds what exists for you, the perceptive system.

---

@LAT84LON29 | created:1772201002 | updated:1772201002

## Mechanistic
![Mechanistic](journals/eye/mechanistic_scene.html)

[Image source](journals/eye/Mechanistic.png)

### Hook
A cartographic meditation on thought, where meaning is a path-finding act and perspective is the compass that determines what is reachable.

### Text
Parse the summary meaning as a sparse matrix.

Meaning cuts through a landscape of perils and false paths.

Perspective.
[Semantic compass](#umwelt-84).
Intent or purpose.
Perspective.

---

@LAT80LON-23 | created:1772201002 | updated:1772201002

## Timex3
![Timex3](journals/eye/Timex3.png)

### Hook
A compact visual grammar of time, showing how one idea can be mapped as a line, a frame, or a cycle.

### Text
Time times three, the ways lines show it.

1) The timeline:
start -> stop.

2) The time box, or time frame.

3) The [time cycle](#waves-159):
repeating circle, which repeats itself again and again and again.

---

@LAT76LON-75 | created:1772201002 | updated:1772201002

## Prints Sleestack
![Prints Sleestack](journals/prints/prints_sleestack.png)

### Text
Its a sleestack.

---

@LAT72LON-127 | created:1772201002 | updated:1772201002

## Projects Horn Grill
![Projects Horn Grill](journals/projects/projects_horn_grill.png)

_No clear OCR text detected._

---

@LAT68LON-179 | created:1772201002 | updated:1772201002

## Spatula
![Spatula](journals/robots/Spatula.png)

I ❤ U GUYS

---

@LAT64LON129 | created:1772201002 | updated:1772201002

## Sbt 1
![Sbt 1](journals/sbt/sbt_1.png)

The fabric of Meaning
is a weave of two
elemental forms of
existence: ①the things or
[nouns](#vectors-6) and ②the [verbs](#waves-155) or
actions and relationships
which connect the things.

noun "I" → verb "can run" → home. circles. the machine.

this is the [Semantic Bit](#sbt-17)

The semantic bit
ascribes meaning through
adding a [dimension of time](#timex3).

---

@LAT60LON77 | created:1772201002 | updated:1772201002

## Sbt 17
![Sbt 17](journals/sbt/sbt_17.png)

A semantic bit is an element of
symbolic logic, "→".
It can be mathematically
represented as a [vector](#vectors-32),
a transitional edge in
3 dimensional space.

going from here → to → here

And it can represent the meaning of
molecular actions at a microcosmic
scale as well as the significance
of celestial events at the scale of
the cosmos, as well as the
meaning of my life, in summary,
by the events which have shaped it.

---

@LAT56LON25 | created:1772201002 | updated:1772201002

## Sbt 19
![Sbt 19](journals/sbt/sbt_19.png)

It turns out we can represent
everything in our experience.
A Vector encoded. Contents original.

like a schematic represents
a specific flow
of electrons.
LED

Thing '[relates to](#waves-155)' Another Thing
Noun   verb   Noun
[Concept Vector Concept](#sbt-17)

this is part of that
this is one of those
this leads to that
this came from that

---

@LAT52LON-27 | created:1772201002 | updated:1772201002

## Sbt 23
![Sbt 23](journals/sbt/sbt_23.png)

The story of my life
so far
is a [constellation](#waves-159)
of events
over time at [different scales](#waves-107).

actual size — micro scope size — atomic scale

Born here → looked at stars here → want here
telescopic / macro / cosmos
molecules / cells

---

@LAT48LON-79 | created:1772201002 | updated:1772201002

## Sbt 5
![Sbt 5](journals/sbt/sbt_5.png)

"Something is coming."
It means
what it means
because something
is happening.

At the essence of meaning
is the [progress of time](#timex3).

What is at stake from
this moment
to the next
is the exchange
of potentials,
the [semantic bits](#sbt-1).

It means what it means
to me.

---

@LAT44LON-131 | created:1772201002 | updated:1772201002

## Umwelt 75
![Umwelt 75](journals/umwelt/umwelt_75.png)

I am a tesseract.
A four dimensional
container of learning
am I.

3D Space
over time = [4D](#timex3)
aka [#stories](#sbt-23) — one sea time

8-13-23 4:44 p

---

@LAT40LON177 | created:1772201002 | updated:1772201002

## Umwelt 83
![Umwelt 83](journals/umwelt/umwelt_83.png)

[information transmission](#vectors-12)

emitter
waves
receiver
perceptron

[words](#waves-154)

---

@LAT36LON125 | created:1772201002 | updated:1772201002

## Umwelt 84
![Umwelt 84](journals/umwelt/umwelt_84.png)

Meaning and understanding
are a paradox.
Nothing means anything
without understanding.
(as I under/over stand it)

[Semantics](#sbt-1), the (study of meaning),
is like [quantum entanglement](#vectors-16)...
I don’t understand it.
Because it cannot be understood,
only inferred,
logically,
from a certain [perspective](#fishbowl).

The concept of "understanding"
cannot be understood...
except from one’s own perspective.

perspective

---

@LAT32LON73 | created:1772201002 | updated:1772201002

## Vectors 1
![Vectors 1](journals/vectors/vectors_1.png)

[Euclidean Space Vectors](#vectors-32)

frequency harmonics
sonic textures
sensoring the
cosmic buzz

---

@LAT28LON21 | created:1772201002 | updated:1772201002

## Vectors 10
![Vectors 10](journals/vectors/vectors_10.png)

[attention](#vectors-2) has
a tension
in it

---

@LAT24LON-31 | created:1772201002 | updated:1772201002

## Vectors 12
![Vectors 12](journals/vectors/vectors_12.png)

We are, and we experience
the paradox of [particle/wave](#vectors-2)
duality. We are solid matter
made of particles, a person,
a thing, a noun.

We experience waves of
[photonic energy](#vectors-16) as colors.

We experience waves of
sononic energy as tones, music,
and words.

What our sights and sounds
mean to us depends on
our individual perspective
in space and time.

We are all travelers of
space and time in the
[galactic gyre](#waves-159).

---

@LAT20LON-83 | created:1772201002 | updated:1772201002

## Vectors 16
![Vectors 16](journals/vectors/vectors_16.png)

From billions of years ago
in a galaxy no longer there

Starlight touches my eye
in a weird,
spooky action at a distance,
[quantum entanglement](#vectors-84)
occurs.
Light is a wave with frequency
and amplitude.
Light is also a particle,
like a hailstone, when it strikes
the “surface” of a molecule
a bit of energy is released
and a chain reaction
lights a pattern of recognition
upon the surface, the [cerebral cortex](#waves-8)
of my brain reads “starlight”.

---

@LAT16LON-135 | created:1772201002 | updated:1772201002

## Vectors 18
![Vectors 18](journals/vectors/vectors_18.png)

"I don't get to decide
what I [remember](#vectors-78) and
what I don't.
All I get to
decide
is what to decide
about
what I remember."

---

@LAT12LON173 | created:1772201002 | updated:1772201002

## Vectors 2
![Vectors 2](journals/vectors/vectors_2.png)

conscious experience
is a [wave, not a particle](#vectors-9),
a process, not a thing.

our story → attentional frame → continued

hypothetically...
The process of experience
can be described in the
mathematical terms
of a quantum wave function,
entanglement,
and a [Fourier transform](#vectors-32)
at the frequency of
[attentional blink](#vectors-10).

spacial events over time

---

@LAT8LON121 | created:1772201002 | updated:1772201002

## Vectors 21
![Vectors 21](journals/vectors/vectors_21.png)

(intuitive hypothetical)
Conscious Experience
is the experience
of proceeding through
time from a certain
[perspective](#fishbowl) in space.
The [sensory data](#umwelt-83) of
the environment is
integrated
into a disposition, a way
of being given the
organism's context and
history
and objective
or need
being
doing

---

@LAT4LON69 | created:1772201002 | updated:1772201002

## Vectors 31
![Vectors 31](journals/vectors/vectors_31.png)

Motive is where a person
is coming from.

motivating

Our motivation determines
where we are going
and where we are.

the idea of Passion
the noun: Motive is a thing
being motivated is verb-ing
the experience of passion

"Where [Fourier](#vectors-32) art thou?"

---

@LAT0LON17 | created:1772201002 | updated:1772201002

## Vectors 32
![Vectors 32](journals/vectors/vectors_32.png)

A [vector](#sbt-17) is how any thing
means
something.

Vectors connect us
like the Force, but non-fiction

Vectors connect our ideas
from a Euclidean space
through a [Fourier transform](#vectors-31) function()
to our [brains](#vectors-78)

---

@LAT-4LON-35 | created:1772201002 | updated:1772201002

## Vectors 38
![Vectors 38](journals/vectors/vectors_38.png)

As humans, we like to imagine
that we are different from
animals.

It is as if when we
look at the same tree
we see something
different.

It is the same tree, but
we each have our own
[perceptions](#umwelt-84) and understanding of it.

Different, but maybe not
so different after all.

---

@LAT-8LON-87 | created:1772201002 | updated:1772201002

## Vectors 42
![Vectors 42](journals/vectors/vectors_42.png)

diagramming_my_algorithm(){
(I'm [waves and particles](#vectors-12)
in time
to my space)

PLL
Phase locked
loop

on my soul solstice
I Am
dancinging the dance of life
tidal bulge

---

@LAT-12LON-139 | created:1772201002 | updated:1772201002

## Vectors 51
![Vectors 51](journals/vectors/vectors_51.png)

I AM NOT A [thing](#vectors-9)
I AM A [process](#vectors-2),
a verb,
a "be"-ing.

I AM PROCESSING:
① DATA
② LOVE STORIES
I do things with other beings.
③ AIR
I make stuff
④ and food!
coffee, alimentary canal

---

@LAT-16LON169 | created:1772201002 | updated:1772201002

## Vectors 6
![Vectors 6](journals/vectors/vectors_6.png)

“A kitten purrs.”
“I like cats.”
“I like cats and dogs.”

6 patterns of
symbolic logic
where “O” can be
any [Thing](#sbt-1) and “_”
can be any [Edge](#sbt-17),
connection, feeling, [verb](#waves-155)
or relationship.

---

@LAT-20LON117 | created:1772201002 | updated:1772201002

## Vectors 78
![Vectors 78](journals/vectors/vectors_78.png)

The [brain](#waves-8) is a storage framework.
It stores symbols.
The [nodes and edges](#sbt-19) that comprise
experiences of color and sound
and touch and smell, symbolically
represented in neurons and
dendrites.

A memorable moment
is what the mind took away,
or surmised, in the electro-chemical
symbolic representations of the
brain.

The things and relationships
are followed, like reading
a path through
the nodes and edges of
memory.

---

@LAT-24LON65 | created:1772201002 | updated:1772201002

## Vectors 84
![Vectors 84](journals/vectors/vectors_84.png)

[Experience is a feeling](#vectors-9).
That is the feeling of
[quantum entanglement](#waves-15)
with my observable universe.

A bit of energy is transferred
instantly from the star,
to my eye, as I observe it.

The energy is either positive (+)
or negative (-).

No matter how far or
ancient the star, if
two or more of us observe
it in the same instant, then
it will have the same polarity,
positive or negative.
Transferred across a vast
space, from an ancient time.

---

@LAT-28LON13 | created:1772201002 | updated:1772201002

## Vectors 9
![Vectors 9](journals/vectors/vectors_9.png)

Consciousness is not
a thing, like a ghost,
it is a [process](#vectors-2),
like a song
or a wave,
a [feeling](#vectors-84).

---

@LAT-32LON-39 | created:1772201002 | updated:1772201002

## Waves 107
![Waves 107](journals/waves/waves_107.png)

Know your graphs. Know your parts.
Align your molecules.

[Story of my life so far...](#sbt-23)
triggering a biological response as
water is flushed from the cells
around the eyeballs.

I went places and had experiences.
Now I'm here.

longitude / latitude / metasphere
All the metadata in scope for this perspective.

All possible human feelings that have ever been
felt in the history of Earth, and
the present feelings of each person on
Earth right now can be represented.

Everything on Earth has been felt,
experienced, happened.
3600 DOF of intent for n days
(story of my life... so far)

Each one is a unique story,
beginning in a birth somewhere,
a unique combination of perspectives,
then the disintegration of that unique community of cells.

---

@LAT-36LON-91 | created:1772201002 | updated:1772201002

## Waves 113
![Waves 113](journals/waves/waves_113.png)

Theoretical Factual
accounting for [semantic facts](#sbt-1)

A -because→ B
FuncY()
FuncX()
a signature phrase
binding space(Y) and time(X)
(wave function)
in a carrier wave of
meta information
predictive analytics

seeking signal harmony or resonance or resolution

The true story of
what events happened,
our treatment of others
over time, carries the
[meaning of our experience](#sbt-5).
And is our predictor of
future performance.

---

@LAT-40LON-143 | created:1772201002 | updated:1772201002

## Waves 149
![Waves 149](journals/waves/waves_149.png)

Recognise and represent

schema          function
wavestate       resonance
plot            story
idea/concept    verb/intent
object          [vector](#vectors-32)

Beat — arrow of time
ocean of waves and the dawn of everything
confliction
Dance
[wheel of time](#waves-159)

---

@LAT-44LON165 | created:1772201002 | updated:1772201002

## Waves 15
![Waves 15](journals/waves/waves_15.png)

I'm collecting data.

From my perspective
I am a perspective in this moment in time
here on Earth.

I look at a star.
A point on the map in my mind lights up.
Bioluminescent neurons connect, via photonic energy,
the quantum realm, wierdly entangling the star and I.

I'm collecting data on the universe, the world around me,
and my own breath.

The data record persists as wierd [entanglements](#vectors-84).
I am a [quantum computer](#vectors-42).

I look up at the stars and I see them,
from my perspective.
This act of observation wierdly entangles us
through space and time.

I observed it. I'm collecting data.

My [memory](#vectors-78) is persisted objectively in the [quantum entanglement](#vectors-84)
made when I observe a star, or a letter in a shoebox,
the eyes of another.
The story of my life so far is written on the Earth
and in the starlight I've observed.

The profound coincidences that seemed impossible
now seem plausible.

In light of the Cosmic Bell Experiments,
where ancient light, billions of years old,
wierdly entangled with observation points on Earth.

looking at a star through a straw or maybe a telescope
In 2022 bioluminescent neurons were discovered in our brains.
Our brains light up.
Light is a wave and energy, and a quantum particle.

---

@LAT-48LON113 | created:1772201002 | updated:1772201002

## Waves 151
![Waves 151](journals/waves/waves_151.png)

The objective is not
what I'm doing, it's where I'm
going. See what I'm doing
there?
Not “just a feeling” it is “more than a feeling.”
“[Feelings](#waves-154)” are not just another thing. They are
not a thing at all. They connect everything.

---

@LAT-52LON61 | created:1772201002 | updated:1772201002

## Waves 152
![Waves 152](journals/waves/waves_152.png)

Consciousness is a container
for my [intention](#vectors-31), which is a container for
my [attention](#vectors-10).
A place to hold on to
what I mean to do.

processing sensory info
into motivational
actuation.

I'm bound to
go where
I'm thinking.
A song
in a jar.

---

@LAT-56LON9 | created:1772201002 | updated:1772201002

## Waves 154
![Waves 154](journals/waves/waves_154.png)

[Harmony and resonance](#waves-113)

In our relationships
Our activities
Our plans
Our music

"[Semantics](#waves-155)," what things
mean in communication
between people and
or AI,
is in the verbs,
in how they connect
the things,
the nouns.

---

@LAT-60LON-43 | created:1772201002 | updated:1772201002

## Waves 155
![Waves 155](journals/waves/waves_155.png)

The Log From the Sea of Cortez
subject object standing wave

“The meeting of two personalities is like
the contact of two chemical substances —
both are transformed.”

Verbs: function, movement, feeling, relationship, vector, predicate

the context is a special kind of verb phrase, like
“Once upon a time”

Natural Language Understanding

---

Vectoring
“[Verbing](#sbt-1)” is a theoretical model,
is a principle of division for language ontologies.

Objectively, as a process, language is divided into
[noun phrases and verb phrases](#vectors-6).
The subject, predicate, object logical
arrangement of RDF syntax and English
are convergent with this model.
Theoretically this models our cognition,
symbolically our own.
How we formulate meaning in intention.
Phrase segments describe
story progression. These are the [vectors or verbs](#sbt-17).
Verbs are recognised from a taxonomy of
synonyms and a dictionary of regular
encoding, morphological.
Content encoding — life bullets and line
breaks are interpreted as verbs.

Applications:
① Natural Language Understanding
② Topic Summarization

---

@LAT-64LON-95 | created:1772201002 | updated:1772201002

## Waves 159
![Waves 159](journals/waves/waves_159.png)

Semantic Wheel

My [story](#sbt-23) is a
[standing wave](#vectors-9).
The ripple on
the cosmic pond
tracing the one drop
that's me.

my time on earth

The water of my body,
before it was me,
circulated in the
ancient oceans of
Earth.

Winter / Spring / Summer / Fall
N / E / S / W
sunset / sunrise
horizon → time → height
story arc V1, V2, V3

My story is told in my intentions, what I do,
and where I go with the people and beings
of this time and space.

---

@LAT-68LON-147 | created:1772201002 | updated:1772201002

## Waves 8
![Waves 8](journals/waves/waves_8.png)

Origami                Human
Miura Fold             The [Cerebral Cortex](#vectors-78),
                       the surface, is
                       similarly deeply
                       folded to create greater
                       surface area in
                       the same space.

Many mammals have smooth brains and correspondingly
smaller cerebral cortexes.
As a human, the surface area is grown, the brain is
fully around 25; maybe.

Now, learning new things consists of appending,
updating, repairing, replacing, and adding
what I know.

My cerebral cortex is like a map of everything
I know... so far.
It is limited by the specifications
of the hardware, but it isn't read-only;
you can rewrite anything in your mind.

[NLP](#waves-155) Neural Linguistic Programming and the more
developed and more truly established CBT
Cognitive Behavioral Therapy — those are
strategies for reprogramming your brain with your mind.

---

@LAT-72LON161 | created:1772201002 | updated:1772201002

## Waves 88
![Waves 88](journals/waves/waves_88.png)

Story of A1, mother to B2 and C3, two children.

"Story of A1, mother to two children B2 and C3"

At the heart of [Semantics](#sbt-1) is the [relation](#waves-154).

vanishing point

"actual time"

Chronologically Sequenced.
A relatively objective theory/panorama.
All the data graphs that mean anything,
by my perspective.
0=0...2023

---
