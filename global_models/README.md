# Global Models

A one-page web app: **a TTDB globe of the Earth**, a list of climate renderings, and — for
the renderings that actually read them — a timeline centred on 2026 and an emissions
scenario. Static files, no build step, no dependencies — drop it on
[antfriend.github.io](https://antfriend.github.io) and it runs.

This folder is **seed material for a new repository**, not a finished product. Eleven
renderings are implemented; two more are researched, sourced, and recorded but not drawn.
What to build next is not a matter of taste — see [Roadmap](#roadmap).

---

## Run it

```bash
python -m http.server        # then open http://localhost:8000/
```

A plain double-click on `index.html` will **not** work: the page fetches the TTDB store,
and `file://` blocks that. The page says so if it happens.

---

## What is in here

| File | What it is |
|---|---|
| [index.html](index.html) | The app. Projection, rasteriser, coastlines, a small Markdown renderer. **No climate numbers.** |
| [global_memory_system_ttdb.md](global_memory_system_ttdb.md) | The TTDB store. Every climate number, every source, every rendering's parameters. |
| [RESEARCH.md](RESEARCH.md) | The expanded research brief the store compresses. Thirteen candidate renderings, all sources, and the known simplifications. |
| [RFCs/](RFCs/) | The specs the format and the viewer conform to. Start at [RFCs/INDEX.md](RFCs/INDEX.md). |
| [tests/](tests/) | Two Node scripts. No dependencies, no test runner. |

---

## Tests

```bash
node tests/globe.test.mjs     # the app, headless
node tests/docs.test.mjs      # the docs against the store
```

Both load `index.html`'s real script behind a small DOM stub, so they exercise the shipping
code rather than a copy of it. Between them they check that the store parses, that EPS is
computed correctly and that AMOC is the maximum, that the fixture's dead edge stays dead and
its missing `[ew]` reads as defaults, that the timeline is symmetric about 2026, that the
land mask puts eighteen named places on the right side of the coastline, that the zone bands
leave no unclassified latitude at either end of the slider, that projection and unprojection
are inverses, that every link and anchor in the docs resolves, that the README's EPS and
scenario tables match the store, and that **no climate value or term appears in
`index.html`** — which is the one claim the whole design rests on.

That last check was weaker than the claim it stood for, and building the collapse layer
exposed it: the app was reading a store key named `permafrost_edge`, printing the words
*AMOC strength* and *permafrost extent* into its own readout, and naming AMOC in a comment.
Four leaks, none of them caught, because the list of forbidden terms did not include the
vocabulary of the layers themselves. The key is now `extent_edge`, both readout labels are
`readout:` lines in the store, and the list has the layer vocabulary in it — so the check
now fails if any of that comes back.

The scenario mechanism gets its own checks, because it is the easiest thing here to get
quietly wrong: that the observed years are *identical* under all five branches, that 2126
differs under all five and rises in the order the store lists them, that the lowest branch
peaks mid-century and falls, that the highest branch still lands inside the colour ramp at
the far end of the slider, that the permafrost boundary encloses exactly the fraction of
the cap the store's rate says survives, and that the AMOC curve does **not** move when the
scenario does.

The undated collapse gets its own checks too, since "draws the range and no estimate" is
easy to implement as "draws the midpoint": that the declared state is two numbers and not
three, and sits below *every* point of the interpolated spread, so it cannot be mistaken for
a fast decline; that the layer reports **no** value while it is on, and reports the range
instead; that the sweep's ends are exactly the two declared ends and it closes its loop
rather than jumping; that at *every* phase of the sweep the year still changes nothing, so
the motion cannot be read as time; that under `prefers-reduced-motion` the lattice carries
both ends at once and nothing moves; that it is stippled rather than solid, and moves with
neither the slider nor the emissions scenario; and that the control, its wording and the
sweep itself appear only for a layer whose block declares one, and stop when it does not.

One check runs the other way round, over the store rather than the app: every key in a block
whose value is numbers and nothing else must appear somewhere in `index.html`. It is the
only test here that can fail because something was *left in*, and it is what keeps *the file
IS the model* honest — a number the app never reads is a number that can drift out of true
with nothing to catch it.

⚠ **That check polices keys, and a payload is one key** — so it has a companion, because on
its own it does not reach the one thing that would defeat it. A 2 592-cell grid enters the
store as a single key, and since base64 carries letters it is filed as *prose* and exempted
outright: put one in and that rule waves it through, as the whole suite did until this
companion existed, while one inert number beside it fails and gets named. The companion rule is a length limit — no line in a block may carry an unbroken non-URL
token over 48 characters, against a longest legitimate 29, scanning continuation lines too
since wrapping is the obvious way past a per-key rule — and it is the enforcement of the
grid decision at `@LAT51.78LON0.3` rather than a paragraph promising it. Its first version
inherited the older rule's `[a-z_]+` key pattern and let a key called `cells_5deg` through on
the strength of the digit in its name; it reads `[a-z0-9_]+` now.

The count of renderings written out in prose is checked too, in three forms, because prose is
exempt from the numbers rule and a count in a sentence is the one number here that can go
stale unwatched. The third form was added after the first two went green over a live error:
they matched on the noun *renderings*, and two sentences that put the drawn count at **eight**
while the store held ten were invisible to both, because they said *layers* instead. A synonym
should not be a hiding place — and this paragraph has to describe that bug without restating
the phrase, or the new rule catches the description.

`node tests/*.test.mjs` exits non-zero on failure, so it drops straight into CI.

---

## The one design decision

In every other store in the [toot-toot-engineering](https://github.com/antfriend/toot-toot-engineering)
corpus, a TTDB globe is a *knowledge map*: `@LAT…LON…` coordinates project some abstract
space onto a sphere. Here **latitude and longitude are real**. The projection is the
identity, so the knowledge globe and the Earth are the same object, and a record sits at
the place that most constrains it:

- Atmospheric CO₂ at **Mauna Loa**, 19.54 °N 155.58 °W
- Ocean acidification at **Station ALOHA**, 22.75 °N 158 °W
- AMOC at the **RAPID array**, 26.5 °N
- The store's home record at the **Royal Observatory, Greenwich** — the place that defines
  its own longitude

Two consequences fall out, one convenient and one not:

1. The file renders unchanged in a generic TTCP viewer — the
   [reference viewer](https://antfriend.github.io) will load it with no per-store code.
2. **There is no 98° N.** The corpus normally reserves high latitudes as lanes (90
   timeline, 98 belief, 99 fixture; TTDB-RFC-0010 §3). That mechanism is *unavailable*
   here, and −90 is already spoken for as TTCP-RFC-0001 §8's South Pole marker. So the
   store declares a `lane:` header field instead — an extension that conformant readers
   must ignore and conformant updaters must preserve. What fell out of the constraint is
   better than the lane was: **beliefs now sit beside their subjects**, a tenth of a degree
   from the record they are about. Written up at `@LAT0.1LON0.1`.

### The file is the model

`index.html` contains the orthographic projection, a per-pixel rasteriser, hand-authored
coastlines and a Markdown renderer. It contains no band edges, no colours, no
sensitivities, no temperature series, no scenario set, and no timeline bounds. All of that is read from the
store at load, the emissions scenarios included. That is the corpus claim — *the file IS the
model, the runtime is a generic interpreter* — taken literally enough to be falsifiable:
delete a number from the store and the app loses that capability. Delete a `scenario:` line
and it drops out of the selector; delete `branch_values` from the AMOC block and the collapse
control goes with it. That is checked rather than asserted: the suite fails on any
number-bearing key in a block that `index.html` never names, so a number cannot quietly stop
meaning anything.

A rendering is a pure function `(lat, lon, year) -> [r,g,b] | null` plus a
` ```ttdb-render ` block. Adding one is adding those two things. Each drawn layer also
declares `source:` lines naming the dataset it stands in for, which the app renders under
the legend — the app supplies the anchor tag and the store supplies the name and the URL.

---

## The timeline

**1926 — 2026 — 2126.** A century each way, so 2026 is exactly the middle position. The
slider's year means *the centre of a 30-year climate normal*, because Köppen classes are
defined on 30-year normals, not on single years.

The app labels each year with the confidence it deserves, and lowers the displayed
confidence with it:

| Range | Tier | Basis |
|---|---|---|
| 1926–2025 | `observed` | HadCRUT5 / GISTEMP v4 / Berkeley Earth; WMO consolidated means |
| 2026–2100 | `projected` | IPCC AR6 WGI Table SPM.1, best estimate for the selected scenario |
| 2101–2126 | `extended` | That scenario's 2041–2060 → 2081–2100 trend continued — **outside the AR6 assessment** |

### The scenario selector

The observed half of the series is one series — **the past does not branch**. The future
half does, and the second selector picks the branch. The five are the illustrative SSPs of
AR6 WGI Table SPM.1, quoted as best estimates for the 20-year period each anchor centres,
in °C above 1850–1900:

| Scenario | 2041–2060 | 2081–2100 | *very likely* 2081–2100 | 2126 `extended` |
|---|---|---|---|---|
| SSP1-1.9 very low | 1.6 | **1.4** | 1.0–1.8 | 1.2 |
| SSP1-2.6 low | 1.7 | **1.8** | 1.3–2.4 | 1.9 |
| SSP2-4.5 intermediate *(default)* | 2.0 | **2.7** | 2.1–3.5 | 3.3 |
| SSP3-7.0 high | 2.1 | **3.6** | 2.8–4.6 | 5.0 |
| SSP5-8.5 very high | 2.4 | **4.4** | 3.3–5.7 | 6.2 |

**SSP1-1.9 falls after mid-century** — 1.6 °C at 2050 against 1.4 °C at 2090 — and that is
the table, not a slip. It is the one branch that peaks inside the slider, and the one place
this app draws warming going down.

The last column is each branch's own 2041–2060 → 2081–2100 trend continued to 2126 and
rounded to 0.1 °C. Straight-line extension is a *shape* assumption and a poor one on the low
branches, where the physics is a plateau rather than a slope; the app marks the whole range
`extended` and lowers the displayed confidence rather than drawing it like the rest.

Every layer that reads the temperature series follows the choice — the zone bands migrate
less under SSP1-2.6, the permafrost boundary retreats further under SSP5-8.5. **AMOC does
not follow it, on purpose.** AR6 assesses the decline as *very likely under all SSP
scenarios*, so a curve that moved with the selector would assert a scenario-dependence the
assessment does not.

---

## The renderings

Ordered as the selector orders them. `conf` and `sal` are the store's epistemic weights
(TTDB-RFC-0005); `EPS = sal × (255 − conf) / 255` is the attention signal — **high EPS means
load-bearing but unsettled**.

| # | Rendering | Status | conf | sal | EPS | Locus |
|---|---|---|---|---|---|---|
| 1 | **Temperature Zones** *(default)* | implemented | 210 | 240 | 42 | 0 °N 0 °E |
| 2 | Surface Temperature Anomaly | implemented | 245 | 230 | 9 | 80 °N |
| 3 | Atmospheric CO₂ | implemented | 205 | 200 | 39 | Mauna Loa |
| 4 | Sea Level Rise | implemented | 220 | 190 | 26 | Central Pacific |
| 5 | Arctic Sea Ice | implemented | 235 | 160 | 13 | Beaufort Sea |
| 6 | Ocean Heat & Energy Imbalance | implemented | 230 | 180 | 18 | Southern Ocean |
| 7 | Ocean Acidification | planned | 235 | 140 | 11 | Station ALOHA |
| 8 | Greenland Ice Sheet | planned | 240 | 170 | 10 | Summit, Greenland |
| 9 | **Antarctic Ice Sheet** | implemented | 150 | 190 | **78** | Thwaites Glacier |
| 10 | Mountain Glaciers | implemented | 235 | 180 | 14 | Storglaciären, Tarfala |
| 11 | Permafrost | implemented | 110 | 170 | **97** | Chersky, Siberia |
| 12 | **AMOC** | implemented | 90 | 200 | **129** | RAPID array, 26.5 °N |
| 13 | Answering Where You Are | implemented | 200 | 130 | 28 | Greenwich, just west |

"Planned" means *the data and its sources are recorded in the store and the layer is not
drawn*. Each planned record states the specific blocker — usually that the honest rendering
needs a gridded field the app does not have, which is a design fact rather than a to-do.

**Row 13 is the odd one.** It is `lane:meta`, not `lane:render`, because its subject is this
store rather than the Earth, and it is the only layer here that makes no climate claim. It
draws the other ten partitioned by **what a reader has to supply before the store can answer**
— a latitude (5), a named place (3), or nothing at all (2) — and it is left out of its own
count. See [Answering where you are](#answering-where-you-are).

### The collapse, drawn without a date

Every series here interpolates between year anchors, and interpolation is a claim that the
quantity moves smoothly from one anchor to the next — which is exactly the assumption an
abrupt collapse breaks. So the AMOC collapse is **not another anchor**. The block declares
one state carrying no year at all, and the app draws it as such: switch it on and the
stipple at 26.5 °N is the same at every position of the slider, so that it cannot be read as
the value for the year on screen. **Moving the slider under a stationary stipple is the
shape of the assessment** — AR6 gives only *medium confidence* that the decline does not
involve an abrupt collapse before 2100, and no distribution at all over when.

It carries no estimate either, and none is drawn. Every `traj` line has three columns with a
mean in the middle; `branch_values` has **two**, and the missing middle is the point — AR6
assesses no collapsed value, so a mean here would be a number this store made up. What is
drawn instead is a **slow sweep between the two ends of the range**, which never rests,
because there is nothing to rest on. The period is arbitrary, identical for every layer, and
means nothing; only the two ends do. Under `prefers-reduced-motion` nothing moves and the
lattice carries both ends at once, which says the same thing without the motion.

The two ends are **0.00 and 0.30 of present transport**: a total shutdown, and the residual
~5 Sv that eddies sustain in a strongly-eddying ocean-only model against a present ~17 Sv.
That is the span of the collapse experiments and **not an assessed range**. The *low* bound
of the smooth decline — 0.48 at 2126 — is a fast decline and is not this.

Two things about a collapse are still not drawn, and each for its own reason. The **date**
is a refusal rather than a gap: nothing assessed supports a distribution over when, so the
layer says so by not moving. The **consequence** — north-west Europe cooling while the globe
warms, which is the `contradicts` edge between this record and the zone layer in physical
form — needs a regional temperature field the app does not have, so the record carries it in
words and the globe carries the transport.

The mechanism is general. Any layer whose block declares `branch_id`, `branch_label`,
`branch_values` and `branch_note` gets the control, with every word of it read from the
store; layers that declare none never show one.

*If the circulation itself is new to you,
[Wikipedia's article](https://en.wikipedia.org/wiki/Atlantic_meridional_overturning_circulation)
is the orientation this page assumes. It is tertiary and nothing here is sourced from it —
every number comes from [RESEARCH.md §11](RESEARCH.md#11-amoc--the-highest-eps-record-implemented-with-an-undated-collapse)
and the assessments it cites.*

### Answering where you are

Most people who open this file will not ask about the store. They will ask about the
climate **where they live** — and what can be said back divides cleanly by *what the store
needs from them first*. Rendering 13 draws that division over the other ten layers.

| The question | What it needs | Layers | Of those, answer *"and in 2070?"* |
|---|---|---|---|
| *"I am in Reykjavík — how much warmer is my latitude?"* | a latitude | 5 | 4 |
| *"Are the glaciers above Innsbruck going faster than Alaska’s?"* | a named place | 3 | 1 |
| *"Of the sea-level rise I will see, how much is melting ice?"* | nothing | 2 | 0 |

**A latitude** is all the zonal layers need, and everyone on Earth has one: the zone bands,
the anomaly, the CO₂ swing, and the two polar caps. **A named place** is stricter — the
answer exists only where the science publishes a region, so Innsbruck resolves to one of
GlaMBIE's 19 basins (Central Europe, 2.0 Gt/yr, and 39 % of its year-2000 ice gone — the
largest relative loss anywhere) while a town a hundred km away on the plain resolves to
nothing. **Nothing at all** is what the two partitions need, because a sum is the same seen
from everywhere.

A fourth question gets asked more than any of them — *is this number what I think it is?*,
from a reader who has met **3.9×** for the Arctic or *ice-free by 2050* — and it is
deliberately **not** a term in that composition. It is not about a layer you have to find;
it is about the layer you already have, and all ten answer it. Making it a fourth bar would
turn a partition of ten into a set of twenty and break the one arithmetic check the
composition legend exists to perform. It is answered on the belief lane instead: the Arctic
factor is a *cumulative-anomaly ratio* and 3.9 is a *trend ratio*
([§3](RESEARCH.md#3-surface-temperature-anomaly-implemented)), and "ice-free" is AR6's defined
threshold of below 1 million km² rather than a description
([§6](RESEARCH.md#6-arctic-sea-ice-implemented--on-area-with-a-computed-sensitivity)).

The counts are the store's own arithmetic over its own `kind:` keys, so the layer carries
`provenance: computed` and `node tools/answerable.mjs` re-runs it. One layer is filed
against its kind: **Mountain Glaciers** is a `composition` to the app and a *place* to the
reader standing in one of its 19 regions, and the tool prints that disagreement rather than
smoothing it away.

---

## Roadmap

The order is not editorial. It is EPS, and EPS got it right. **AMOC** (EPS 129) and
**Permafrost** (EPS 97) were built first, in that order, ahead of every prettier layer,
because the store said to — and both turned out to be renderings *about* their own
uncertainty, which is what a high EPS was predicting. The scenario selector followed.
Neither AMOC record nor permafrost record claims more than its `conf` allows: one draws a
spread and an undated state, the other draws extent and refuses to draw the feedback.

**Splitting Ice Sheets** was the first item on this list and is done, and it rewrote the
table above. One record called *Ice Sheets and Glaciers* averaged two ice sheets that share a phase and
nothing else: Greenland, whose mass loss three independent methods reconcile, and
Antarctica, where IMBIE cannot resolve the **sign** of the East Antarctic balance and AR6
holds the whole contribution as *deep uncertainty*. Separated, they score `conf` 240 and
150, EPS **10** and **78**. Together they had scored 20 — the number of a settled record,
belonging to neither of them.

So the store now ranks AMOC 129, Permafrost 97, **Antarctic Ice Sheet 78**, and everything
else under 45. Nothing about the ice changed. EPS is computed per record, which makes the
granularity of a record a modelling choice the metric cannot see through: merge a settled
thing with an unsettled thing and the mean reads settled. That failure mode is not visible
in any weight in the file — only in noticing that one record is carrying two subjects.
Written up at `@LAT26.6LON-70.1`, which now carries this repository's first `rev:1`.

**Giving the AMOC layer something to say about collapse** was the second item and is done.
It could not be another anchor on the trajectory, because interpolating between anchors is
the assumption a collapse breaks — so it is declared as a state with no year, and drawn as
one: stationary under the slider, and stippled. [The collapse, drawn without a
date](#the-collapse-drawn-without-a-date) has the rest, including the two things about a
collapse that are still not drawn and why each is not drawn.

**Recording mountain glaciers** was the third item and is done. They are
`@LAT67.9LON18.57`, at Storglaciären in Tarfala — nothing like the most ice, but the longest
unbroken mass-balance series on Earth, measured every year since 1946. The numbers are worth
the wait: GlaMBIE reconciles 233 regional estimates into **6 542 Gt lost over 2000–2023, 18
mm of sea level**, a rate **36 % higher** in the second half of that period than the first,
and a total about **18 % above Greenland's and more than twice Antarctica's**. The term this
store recorded last is the largest of the three, and for its first weeks here it was one
word in another record's title with no number under it. That is what a gap looks like from
the inside: not an error anyone could point at, just a heading that sounded complete.

**Retiring the numbers nothing reads** was the fourth item and is done, and it did not go
the way it was written. An audit of every key in every block the app interprets found seven
that `index.html` never mentions. Three were dead and are gone — `decline_rate`,
`uncertainty_low` and `uncertainty_high` on the AMOC block, left behind when the `traj` rows
replaced them.

The other four were not dead, and two of them were the app's fault rather than the store's:

- `shift_range: 1.25 2.5` — the zone record has always said *the app declares the range
  beside the value it uses*, and the app did not. The sensitivity 2.0 °lat/°C is one value
  out of an observed range, and the layer drew the value while hiding the range. The readout
  now prints both: **poleward zone shift +1.5° (+0.9 to +1.9°)**. The number was not inert;
  the promise was unkept.
- `baseline: 1850-1900` — the store declared the baseline and the app printed its own copy
  of it, hardcoded. Now it prints the store's.
- `traj_columns`, `branch_columns`, `scenario_columns`, `scenario_note` — prose, addressed
  to a reader or another viewer. They carry no number that can go stale, and they stay.

So the rule is *numbers*, not keys, and it is now [a test](tests/docs.test.mjs) rather than
a paragraph: any key in a `ttdb-render` or `ttdb-timeline` block whose value is numbers and
nothing else must be named somewhere in `index.html`, or the suite fails and names it. Put
`decline_rate` back and it does.

What is left:

**The `planned` records were never as many problems as they were records.** Every primitive
that puts anything on the sphere — `zonal-class`, `zonal-field`, `zonal-extent`, and now
`sector-field` — is a function of **latitude, or of a longitude sector**. The two that are
not, `distribution-transport` and `composition`, are not maps at all. The blockers that were
left then said the same thing in different words: *the honest picture varies continuously with
longitude too.* So what follows is not a queue of records. It is a short list of levers, each
priced in the one thing it costs.

The price matters, because the first pass at this list claimed two of these were free and
neither was. **All five levers are now resolved: four closed by building something, and the
fifth closed by deciding it.** What remains open is one half of lever 4 — Ocean Acidification
— and it does need numbers the store does not have. The two levers that needed no new data
are instructive in opposite directions: one needed *refusing* to draw numbers already there,
because they were not on the same period as each other, and the last needed no number at all,
only a decision about what this store is allowed to contain.

**1. Draw Antarctica's unresolved sign — done.** The blocker said a balance whose sign is
unresolved *has no honest colour*. That was true, and it stays true; what it did not say is
that such a balance has no honest **hatch**. This is the `@LAT26.5LON-70` move rotated from
time into space: the collapse is drawn stationary and stippled because it has no date, and
East Antarctica is now drawn hatched and uncoloured because it has no sign — **+5 ± 46 Gt/yr**,
an uncertainty nine times its estimate, shown in the legend so the reader can see the spread
that swallowed the sign. West Antarctica (**−159 ± 26 Gt/yr**, 2012–2017) and the Peninsula
(**~−20 Gt/yr**) carry the ramp, because their loss is measured.

The new kind is `sector-field`: a field constant inside declared longitude sectors, which
refuses the ramp entirely wherever the store declares a state it could not resolve. It needed
**no new sourced number** — every value was already in the record — and the only new thing is
a West/East longitude split, which is *geometry, not climate data*, hand-authored at the
fidelity the coastlines already use. Two disclosures came with it, both on the record: the
sectors are longitude cuts approximating IMBIE's regions and **not** its drainage basins, and
the layer is **stationary under the slider**, because AR6 holds the Antarctic contribution as
*deep uncertainty* and indexing these balances to global mean temperature would manufacture
exactly the projection the record exists to refuse.

It was the highest-EPS record in the store that was not drawn. It is drawn now, and it is
drawn as a rendering about what is not known — which is the third time a high EPS has
predicted that and been right.

**2. Render off the globe — done, as a `composition`.** "Drawn" meant "drawn on the globe,"
and that definition was blocking more records than any dataset was. Sea Level said of itself
that it is *"a sum of the ice records and @LAT-50LON60"* and carried `derived_from` edges to
all four. A sum is not a place, so this one renders beside the globe and puts **nothing** on
the sphere — `at()` returns null everywhere, on purpose.

What made it honest was refusing the obvious version. The four absolute values in this store
are on **four different periods** — Greenland's +16.0 mm is 1972–2025, Antarctica's +13.5 mm
is 1979–2024, the glaciers' 18 mm is 2000–2023 — and `@LAT-50LON60` has no millimetres at
all. Stacking those would have been three periods and a gap, presented as a budget. So the
composition is drawn on the **one basis the store holds a comparison on**, GlaMBIE 2000–2023:

- **Mountain Glaciers — 18 mm, measured.** The reference, and the only absolute on the bar.
- **Greenland — 15.3 mm, derived.** The source says glaciers ran *18% above* it, so the store
  carries the factor **1.18** and the app does the division. The store holds no derived value.
- **Antarctica — < 9.0 mm, a bound.** The source says glaciers ran *more than twice* it, which
  is an inequality and not a value, so the bar frays out at the end instead of stopping on a
  number.
- **Thermal expansion — an empty slot.** The largest single contribution of any kind, and the
  store has no number for it. It is drawn at full width in outline, so the gap has a size.

The store does say elsewhere that about **two-thirds** of recent rise is added water and the
rest is thermal expansion, and that is deliberately *not* used here: it is undated "recent"
rather than the GlaMBIE period, and importing it would be exactly the period-mixing the rest
of this entry refuses. **The altimetry field is still not drawn and is still not promised** —
what came off the blocked list is the sum, not the map.

**3. Add the second time axis — CO₂ is drawn, and not by adding an axis.** This entry proposed
a month or season control. Neither record needed one.

**Sea ice** is blocked on *extent versus area*, settled two entries below — a September
restriction is a line in a block, not a control.

**CO₂ is drawn.** Its ladder had real rungs all along: NOAA GML's flask network sits at
**exact** latitudes, so unlike aragonite this was never band ranges. What blocked it was
something the repository had never had to name — **provenance**. The amplitudes are published
only as monthly series, so drawing them meant *computing* a number, and every number here had
been a transcription of somebody's assessment.

**That rule is now written down rather than quietly broken.** Two new `umwelt.constraints`: a
computed value is never printed like a transcribed one, and it declares its method and what
re-runs it. The layer carries `provenance: computed`, the method in full, and
`recompute: node tools/co2_amplitude.mjs` — which the page displays, and which the suite
checks exists and has not drifted from the method text.

The ladder, peak-to-trough ppm, NOAA CCGG surface flask, 2013–2024, one programme throughout:
**18.4 at Barrow (71.3°N)** falling to **1.3 at the South Pole** — and *peaking over the
boreal belt rather than at the pole*, since Barrow exceeds Alert. It is drawn `scale: none`,
held still under the slider, because a climatology is not a function of the year.

⚠ **The first computation was wrong, and nothing here would have caught it.** Detrending by
each year's mean leaves the ~2.5 ppm/yr rise inside the year as a sawtooth. Invisible against
Barrow's 18 ppm cycle; *the entire answer* against the South Pole's 1 ppm — it returned
2.7 ppm peaking in December, the trend wearing a seasonal cycle. A centred 13-term moving
average fixed it and the South Pole came back at 1.3 ppm peaking in September, the southern
spring. It was caught by noticing the season was wrong, not by a test. **That is the standing
cost of the decision**, and it is why the tool exists. Written up at `@LAT51.68LON0.2`.

`conf` fell **250 → 205** and EPS rose **4 → 39**: 250 described the *measurement*, and what
is drawn is arithmetic on it. Which is `conf` failing to carry two kinds of claim in one
record for the third time — after granularity and blockers, now provenance.


**4. Render the aspect that is zonal — half done, and not the half that was planned.** This
entry proposed a zonal ladder for each of two records. One of them turned out not to want a
ladder at all, and the other cannot have one.

**Ocean Heat / EEI is done — as a `composition`, not a zonal field.** The entry had it as
zonal heat uptake, on the grounds that the record sites itself in the Southern Ocean as *"the
dominant region of ocean heat uptake."* Looking for that ladder turned up something better and
already on one basis: AR6 WGI Ch. 7 partitions the global energy inventory over **1971–2018**
into **ocean 91 %, land 5 %, ice sheets and glaciers 3 %, atmosphere 1 %** — a growth of
**435 [325–545] ZJ** at **0.57 [0.43–0.72] W m⁻²**. That is not a field, it is a set of shares
of one whole, and the primitive for it already existed. *Where does the energy go* is the
question that record has always been asking, and it needs no grid, because it is not a place.

It did need one extension: **a composition may now declare its `whole`.** The energy inventory
knows its whole — the four shares are complete and sum to 100 % — so its bars are shares *of
the whole*. Sea level's terms are missing one, so there is no whole for them to be shares of
and they stay shares of the reference. The legend prints what the terms actually account for,
so a set that fails to add up says so instead of looking tidy. A second partition exists
(von Schuckmann et al. 2023: 89/6/4/1 over 2006–2020) and is recorded on the record but
deliberately **not** blended into the AR6 set.

**Ocean Acidification is not done, and its blocker was wrong too.** The zonal quantity is
real and it is aragonite saturation, not pH: Jiang et al. (2015) give surface Ω_arag
**1.1–4.2**, **above 2.0 between 40 °N and 40 °S**, **below 1.5 polar**, with a threshold at
**Ω = 1** that pH does not have. It fails on the *shape* of the published numbers, twice: the
gradient comes as **band ranges** rather than values at latitudes, and a `zonal-field` needs
the latter — inventing the intermediate anchors is the one thing this store does not do. And
the decline is **−0.40 ± 0.37 % per year** for waters shallower than 100 m, which is a
per-year rate on a slightly different quantity, and Ω tracks dissolved CO2 rather than
temperature, so it cannot ride the slider. The old blocker asked for a gridded pH climatology
and would have been satisfied by the wrong thing; the new one names a zonal ladder on one
climatology plus a sensitivity indexed to CO2 or the scenario.

**5. Embed a coarse grid inside the store — decided, and declined.** The only lever that
touches the corpus claim, so it got argued rather than smuggled, and it is now
`@LAT51.78LON0.3`. It said *the cost is exact and it is not size*. It was right that size is
not the cost, and it named the wrong cost anyway.

**Its size claim holds, and never needed the raster to settle it.** 2 592 cells at 5°, six
symbols, pack into 3 bits each: **972 B, or 1 296 B base64, incompressible and independent of
content.** Single-digit kilobytes for any such grid whatever it contains, provable without
downloading anything. Measured on the grids this repository already has, it is smaller — the
land/ocean mask rasterised from the coastlines RLEs to **476 B**, and so does the zonal class
field. `node tools/grid_payload.mjs` re-runs it. Those are a **floor, not an estimate**: both
fields are latitude-banded, so the zonal field costs 476 B row-major against **1 308 B
column-major** — a 2.7× spread from re-ordering identical cells, the column-major figure
*worse than not compressing at all*. A real Köppen grid varies with longitude, which is the
whole reason to want it.

**The cost it named is already paid, twice, in the runtime.** `index.html` carries **15
hand-authored coastline polygons, 240 vertices, at roughly 5° fidelity**, and the Antarctic
sector split is geometry hand-authored the same way. The app also already builds a land mask
at **1°, 65 160 cells — 25× the 2 592 the lever proposed** — at every load. This app has been
grid-based inside since before the lever was written. What embedding changes is not whether a
grid exists but whether its cells are **derived or shipped**, and 240 vertices can be checked
against a map by eye while 2 592 base64'd cells cannot.

⚠ **The real cost is that the suite cannot see a payload, and this was tested rather than
argued.** The load-bearing rule polices **keys**, and a payload is one key — and since base64
contains letters, `numbersOnly` files it as *prose* and exempts it outright. A real
1 296-character `cells_5deg:` put into a copy of the store, read by nothing, **passes the
suite**; one inert number beside it — `decline_rate: 0.18` — **fails and gets named.** 2 592
unreadable numbers are invisible to the check a single number cannot get past. A grid would be
the first thing this store could hold that *delete a number and the app loses that capability*
does not reach.

So the grid stays out, and [the guard is in the suite](tests/docs.test.mjs) rather than in
this paragraph: no block value may carry an unbroken non-URL token over **48** characters —
the longest legitimate one today is **29**. What is *not* forbidden is a grid **derived at
load from a generator small enough to read**, which is exactly how the coastlines already
work. What closes is shipped opaque cells, not gridded rendering.

**Settled, and drawn — but the first fix was wrong too.** The question was whether permafrost
had been let off lightly, shipping as a spherical cap while sea ice's blocker demanded a
monthly concentration grid. It had not been: permafrost's rate is a *fraction of its own
reference area*, so its rate and reference are the same quantity.

Sea ice's blocker was then rewritten to say the published sensitivity *"is quoted for
sea-ice AREA"* while the store's reference was extent. **That was also wrong.** The source
sentence reads, verbatim, *"3.3–4 million km2 of September Arctic sea ice are lost per °C of
annual mean global warming"* — **"sea ice"**, naming no quantity. The distinction was this
repository's, asserted while correcting the record for over-claiming.

What caught it was not rereading the paper. It was **building the layer and checking it
against the observation it must reproduce**: back-projected to 1979 it gave **6.9–7.7 million
km²** where NSIDC measured **4.58**.

So the layer is drawn on a **computed** sensitivity instead, under the provenance rule —
regressed on the quantity the layer actually draws, against the same series the slider drives
it with. September **area** falls **1.96 ± 0.44** million km² per °C, declared as the 95 %
range **1.5–2.4** and drawn as two edges with the spread between them. September *extent*
falls **3.03 ± 0.54**, which is what the published 3.3–4.0 overlaps — good evidence the
published figure means extent. The anchor is the fit's **2.66** for 2025, not the observed
3.08, because anchoring a fitted slope to one year's weather is a fit and a point pretending
to be a line. Rebuilt, 1979 comes out **4.4–5.4**, containing the measurement.

NSIDC publishes extent and area side by side in the same file, so the "one number" the
rewritten blocker asked for was one column away the whole time. Below **1 million km²** —
AR6's *practically ice-free* — the readout stops giving a number at all. What is still not
drawn is the **shape**: the cap is a circle round the pole and real ice retreats from the
Atlantic side first, and the step-then-plateau since 2007 is invisible to any single rate.

### What all of this turned out to be about

Seven `blocker:` lines have been examined by *attempting the drawing* rather than reading
them. **Five records came off the blocked list, one had its blocker rewritten and is still
blocked, and one survived.** Six of the seven obstacles were not the absence of the dataset
the blocker named.

| Record | The blocker said | What the attempt found |
|---|---|---|
| Antarctic Ice Sheet | an unresolved sign has no honest colour | true — and it has an honest *hatch*. **Drawn.** |
| Ocean Heat / EEI | needs the 0–2000 m OHC grid | the partition needs no grid; it is not a place. **Drawn.** |
| Atmospheric CO₂ | needs the seasonal cycle or the flux map | the cycle was right; the block was provenance, not data. **Drawn.** |
| Mountain Glaciers | needs the RGI outlines and topography | the science is published in **19 regions**, and a region set is a composition, not a map. **Drawn.** |
| *(sea ice, second time)* | *its rewritten blocker said the rate is quoted for area* | the source says **"sea ice"** and names no quantity. Caught by a failed observation check, not by rereading. |
| Arctic Sea Ice | needs the monthly concentration grid | the grid was never needed; the area was one column away in the same file. **Drawn.** |
| Ocean Acidification | needs a gridded surface pH climatology | pH is not the zonal quantity — it would have been satisfied by the wrong thing. |
| Greenland Ice Sheet | needs per-basin mass-balance geometry | **survives** — but because IMBIE publishes no basin table, so the geometry would have nothing to colour. |

Six named a **dataset**. The real obstacles were of three kinds, and none is one: a
**mismatch of basis** — different quantities, different periods, or a rate indexed to
something the model does not carry; a **mismatch of provenance**, where the number exists but
not in the form this store admits; and twice, **a rendering that was never the one needed** —
the grid, the outlines and the pH climatology are all real datasets that a *different*
drawing would have wanted.

That is not carelessness. A blocker gets written when the record is made, the moment of
*least* information about it: before the primitive is chosen, before the numbers are put side
by side, before anyone has tried. It is a hypothesis, and this repository had been recording
hypotheses in the same voice as its measurements — the exact thing the umwelt forbids for
climate values and never thought to forbid for its own reasons.

**The one that held matters most.** Greenland's conclusion was right; only its reason needed
sharpening. A rule that found every blocker wrong would be describing the checker rather than
the blockers. What the seven say together is narrower and more useful: *a blocker is a
hypothesis, and roughly one in seven survives contact.*

**EPS could not see any of it.** It ranks the uncertainty of a record's *subject* and says
nothing about the quality of its *stated reason*. The four wrong blockers score 13, 11, 14
and 4; the one that held scores **10**, lower than three of them. Same shape as the
granularity blind spot at `@LAT26.6LON-70.1`. Written up at **`@LAT51.58LON0.1`**, which is
why the levers above are priced by *the one thing each costs* rather than by the dataset each
names.

**CO₂ stays blocked even after all of this**, and should. A near-uniform field drawn as a
translucent shell says nothing, and *a high EPS is not permission to draw it* is the rule that
makes every other record here worth trusting.

### Closed, not deferred

**Loading the 1 km Köppen raster** (Beck et al. 2023) was on this list and has been taken
off it, because it turned out not to be a task:

- The raster is **six discrete epochs** — four historical, then 2041–2070 and 2071–2099.
  This timeline is continuous from 1926 to 2126. There is nothing between 1991–2020 and
  2041–2070 and nothing at all past 2099, so the raster cannot cover the slider it would
  replace without changing what the slider means.
- It ships as a **single 125 MB archive**. Any usable subset lives in a sidecar file, which
  moves the model out of the store and ends the no-build, no-dependency property that makes
  *the file IS the model* checkable rather than merely claimed.
- What the bands demonstrate is the **pattern** — a rendering is a pure function plus a
  ` ```ttdb-render ` block — and they demonstrate it as well as the raster would. The
  accuracy the raster buys is real, and it is not what this repository is for.

So the app **links** it instead. Every drawn layer declares `source:` lines and the app
renders them under the legend, so the zonal schematic points at the raster it approximates
rather than promising to become it. The ⚠ on the record stayed and got longer: a
simplification you have decided to keep needs a louder disclosure than one you are about to
fix.

---

## Accuracy

Every number in the store is quoted from a named source with a link, and every number that
is a model output rather than a measurement says so. The simplifications are written down
as simplifications — the full list is
[RESEARCH.md §12](RESEARCH.md#12-known-simplifications). The three that matter most:

- **The continent outlines are schematic**, hand-authored at roughly 5° fidelity. Hudson
  Bay, the Baltic, the Black, Caspian and Adriatic seas render as land. Use
  [Natural Earth](https://www.naturalearthdata.com/) if you need real coastlines.
- **The temperature-zone layer is a zonal schematic, not the Köppen raster.** Real Köppen
  classes are not latitude bands — the Sahara and the Congo sit at similar latitudes in
  different classes. The bands carry the *migration* honestly and the *geography* badly.
  This is a kept simplification rather than a to-do — see
  [Closed, not deferred](#closed-not-deferred) — and the app links the raster under the
  legend, so the gap between what is drawn and what is true is one click wide.
- **Polar amplification is 2.5, not the 3.9 you have read.** Those are different
  quantities: 3.9 is a ratio of *linear trends over 1979–2021*, and what this app needs is
  a ratio of *cumulative anomalies since 1850–1900*, which CMIP6 puts at 1.8–2.4 for future
  periods. Using 3.9 drew the 2126 Arctic at +12.9 °C, which no assessment supports.
  [The full explanation](RESEARCH.md#why-the-arctic-factor-is-25-and-not-the-39-everyone-quotes)
  is in the research brief, because a corrected error is worth more than a clean one. The
  objection is to the *factor*, not to any particular total: 2.5 on the SSP5-8.5 branch
  reaches +15.5 °C at 2126, which is the `extended` end of the highest scenario and is
  labelled as such rather than drawn as the default.

The store's own `conf` values are transcriptions of each source's assessed confidence,
which is a weaker thing than independent verification. **Nothing here has been checked
against the source rasters**, which is why no record exceeds `conf 250`.

---

## Conformance

The store is a conformant TTDB (TTDB-RFC-0001) and exercises the failure paths on purpose:

- `@LAT-54.42LON3.36` (Bouvet Island) carries a **dead edge**, an **unknown header field**,
  and **no `[ew]` block** — a conforming viewer greys the edge, preserves the field, and
  reads weights as defaults for EPS 0.
- `@LAT-90LON0` is a **South Pole special record** declaring `discovery_tour_off`, so every
  record shows immediately. This app implements no discovery system, which is the same
  behaviour; the declaration is there for other viewers.
- The app implements TTCP-RFC-0001 §11 (epistemic weights displayed between title and body)
  and §12 (edges as navigation, dead links visibly dead), and TTCP-RFC-0002 §§2–6 for
  projection, drag, zoom, tap selection and rotation animation.

Not implemented: the guided tour (§8), scene playback (§10), side globes (§11), search and
URL sync (TTCP-RFC-0003).

---

## Credit and licence

Specs and format: [toot-toot-engineering](https://antfriend.github.io) by antfriend.
Climate data belongs to the institutions cited in [RESEARCH.md](RESEARCH.md) — IPCC, WMO,
NOAA, NASA, NSIDC, Copernicus, the Met Office, Scripps, and the authors of the papers
linked there. Nothing here is original research.
