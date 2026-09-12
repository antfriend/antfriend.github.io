# Global Models — the Earth as its instruments know it

```mmpdb
db_id: global-models-001
db_name: Global Models (climate renderings on a TTDB globe)
coord_increment:
  lat: 1
  lon: 1
collision_policy: reject
timestamp_kind: unix
umwelt:
  umwelt_id: earth-as-instrumented
  role: renderer
  perspective: the Earth described by the instruments that measure it, each claim standing where its evidence is made
  scope: the major, best-understood processes of anthropogenic climate change
  constraints:
    - every-number-cites-its-source
    - a-measurement-and-a-model-output-are-never-printed-alike
    - a-simplification-is-written-down-as-a-simplification
    - conf-encodes-the-assessed-confidence-of-the-source-not-the-author-opinion
    - a-transcribed-value-and-a-computed-value-are-never-printed-alike
    - a-computed-value-declares-its-method-and-what-re-runs-it
  globe:
    frame: earth-geographic
    origin: "@LAT0LON0"
    mapping: "lat/lon are TRUE geographic degrees (WGS84), not a knowledge-map projection. A record sits at the locus that most constrains it - the place you would go to check it. Mauna Loa holds CO2; Station ALOHA holds ocean pH; the RAPID array at 26.5N holds the AMOC. Global fields sit at the origin."
    note: "Consequence: the knowledge globe and the Earth globe are the same globe, so this store renders unchanged in a generic TTCP viewer. Second consequence, less convenient - see @LAT0.1LON0.1."
cursor_policy:
  max_preview_chars: 256
  max_nodes: 64
typed_edges:
  enabled: true
  syntax: "type@LATxLONy"
  note: "depends_on / supports / derived_from / refines / renders / measures / contradicts / revises"
librarian:
  enabled: false
  primitive_queries: []
```

```cursor
selected:
  - "@LAT0LON0"
preview:
  "@LAT0LON0": "Temperature Zones - the five Koppen-Geiger major classes as translucent areas, migrating poleward with global mean temperature. The default rendering."
agent_note: "Updated 2026-09-11. Eleven renderings implemented: @LAT0LON0 Temperature Zones, @LAT80LON0 Surface Temperature Anomaly, @LAT26.5LON-70 AMOC (distribution), @LAT68.75LON161.4 Permafrost (extent, not the carbon feedback), @LAT-75LON-106.75 Antarctic Ice Sheet (three longitude sectors, the largest of them drawn hatched and uncoloured because IMBIE cannot resolve its sign). The store's EPS mechanism ranked: AMOC 129, Permafrost 97, Antarctic Ice Sheet 78, all others < 45, and both high-EPS layers built so far came out as renderings about their own uncertainty. Since then the future half of the gmst series branches: five AR6 Table SPM.1 scenarios at @LAT80LON0, selected in the app, followed by every layer that reads the series and deliberately not by AMOC. The 1 km Köppen raster was considered and closed rather than deferred: six discrete epochs cannot cover a continuous slider that runs to 2126, and a 125 MB sidecar would move the model out of this file. Every drawn layer now declares a source: line and the app links it beside the legend, so the zonal schematic points at the raster it approximates instead of promising to become it. Ice Sheets and Glaciers has been split in two: @LAT72.58LON-38.46 Greenland (conf 240, EPS 10) and @LAT-75LON-106.75 Antarctic (conf 150, EPS 78). Averaging two ice sheets that share a phase and nothing else had hidden the third-loudest record in the store, and it left mountain glaciers recorded nowhere - the largest of the three mass terms, flagged on @LAT0LON-140 until it has a record. @LAT26.5LON-70 now declares an alternative state with no year on it (branch_values 0.00-0.30 of present transport, two ends and no mean because none is assessed): an abrupt collapse cannot be another traj anchor, because interpolating between anchors is the assumption a collapse breaks, so the app draws it stationary under the slider and stippled. Its date and its regional consequence are still not drawn, each for its own stated reason. Mountain glaciers are now @LAT67.9LON18.57 - the largest of the three land-ice terms and the last to get a record, blocked on the Randolph Glacier Inventory and on this app having no topography. The blocked records were re-examined lever by lever and the roadmap now prices each in the one number it lacks; the first pass had called two of them free and neither was. Antarctica came off that list without a new sourced number at all: its blocker said a balance of unresolved sign has no honest colour, which is true, and did not say it has no honest hatch. The new kind is sector-field - a field constant inside declared longitude sectors, refusing the ramp where the store declares a state it could not resolve, and stationary under the slider because AR6 holds the contribution as deep uncertainty and indexing it to temperature would manufacture the projection the record exists to refuse. The second lever is built too: @LAT0LON-140 is now a composition - a sum drawn beside the globe with nothing on the sphere, because a sum is not a place. It needed the opposite of new data. The four terms of sea level sit on four different periods in this store and one of them has no millimetres at all, so the honest version draws only the basis the store holds a comparison on, GlaMBIE 2000-2023: glaciers 18 mm measured as the reference, Greenland derived by the declared factor 1.18, Antarctica as an open-ended upper bound because more than twice is an inequality and not a value, and thermal expansion as an empty slot at full width so the gap has a size. The altimetry field is still not drawn. The open question about sea ice - whether @LAT68.75LON161.4 had been let off lightly, since it draws as a spherical cap while @LAT82LON-140 demanded a concentration grid - is settled, and not either way it was posed. The per-degree rate exists and is sourced: Niederdrenk and Notz 2018, via Stroeve and Notz 2018, give 3.3-4 million km2 of September sea ice lost per degree C, with AR6 defining practically ice-free as below 1 million km2. What stops the layer is that those are sea-ice AREA while this store reference of 4.60 million km2 is EXTENT, and extent always exceeds area: a cap taking its size from one quantity and its rate from the other is the same fault @LAT0LON-140 was rebuilt to refuse. Permafrost is not the lenient record - its rate is a fraction of its own reference area, so rate and reference are one quantity, and its simplification is geometric and declared. The blocker on @LAT82LON-140 has been rewritten to the real one and now names one number rather than a dataset. Lever four went the same way, half of it. @LAT-50LON60 is drawn - not as the zonal uptake field the roadmap proposed, but as a composition of where the energy went: AR6 WGI Ch 7 partitions the 1971-2018 inventory into ocean 91, land 5, ice 3, atmosphere 1 percent, growing 435 ZJ at 0.57 W per m2, which is a set of shares of one whole and needs no grid because it is not a place. That required one extension - a composition may now declare its whole, so the energy inventory draws shares of 100 percent while @LAT0LON-140, which is missing a term and therefore has no whole, keeps drawing shares of its reference; the legend prints what the terms actually account for so a set that fails to add up says so. A second partition, von Schuckmann et al 2023 at 89-6-4-1 over 2006-2020, is recorded on the record and deliberately not blended in. The other half did not come off: @LAT22.75LON-158 wants aragonite saturation rather than pH, and Jiang et al 2015 publish it as band ranges rather than values at latitudes, with a per-year decline on a slightly different depth range and a driver that is dissolved CO2 rather than temperature - so its blocker was rewritten too, from a gridded pH climatology it never needed to a zonal ladder on one climatology plus a CO2-indexed sensitivity. The provenance question in the roadmap was decided on 2026-09-11: this store may compute a value from a public series, and two new umwelt constraints say how - a computed value is never printed like a transcribed one, and it declares its method and what re-runs it. @LAT19.54LON-155.58 is drawn on the first such number, a seasonal-amplitude ladder over NOAA GML CCGG surface flask monthly means 2013-2024, detrended with a centred 13-term moving average: 18.4 ppm at Barrow falling to 1.3 at the South Pole, peaking over the boreal belt rather than at the pole, drawn scale: none because a climatology does not move with the slider. The first computation was wrong and nothing here would have caught it - detrending by each year mean left the secular rise inside the year as a sawtooth, invisible against an 18 ppm cycle and the whole answer against a 1 ppm one, returning a December peak at the South Pole. That is the standing cost of the decision and the reason tools/co2_amplitude.mjs exists and is named in recompute:. CO2 conf fell 250 to 205 and EPS rose 4 to 39, because what is drawn is arithmetic on the measurement rather than the measurement - conf failing to carry two kinds of claim for the third time, after granularity at @LAT26.6LON-70.1 and blockers at @LAT51.58LON0.1, now provenance at @LAT51.68LON0.2. The page now shows only the controls the chosen rendering reads: each layer declares usesYear and usesScenario, and the timeline and scenario selector hide themselves where they would change nothing, because a slider under a picture it cannot move invites a reading the layer does not support. Three arrangements across eleven drawn layers - zones, anomaly, permafrost and @LAT82LON-140 take both because all four go through the warming series; @LAT26.5LON-70 takes the timeline and not the scenario, since it interpolates its own year anchors; and the five static layers take neither. The layer own reading moved out of the year readout into its own element so it survives the timeline being put away. The last two untested blockers were tested, and they split. @LAT67.9LON18.57 came off: its blocker asked for RGI outlines and topography, but GlaMBIE publishes its result for 19 predefined regions, and a region set is a composition rather than a map - so the glaciers are drawn as 19 bars of mass-change rate with each region share of its own year-2000 ice printed beside it, and the two disagree sharply. Alaska loses 60.8 Gt/yr and 22 percent of its volume; Central Europe loses 2.0 Gt/yr and 39 percent, the most anywhere. The 19 rates sum to 270 against the published 273, and the legend prints that sum beside the declared whole so a mistranscribed region shows up. Composition terms gained an optional second reading for this, a different quantity about the same term that is never summed into the bar. @LAT72.58LON-38.46 held - the first blocker here to survive - though its reason needed sharpening from we lack the geometry to IMBIE publishes no basin table, so the geometry would have nothing to colour; it reports 169 plus or minus 9 Gt/yr for the whole ice sheet, with annual loss ranging 86 in 2017 to 444 in 2019, which this 30-year timeline cannot show. Seven blockers examined now: four drawn, two rewritten and still blocked, one survived, and the survivor is what makes @LAT51.58LON0.1 credible rather than a description of its own checker. @LAT82LON-140 is drawn, and getting there corrected a mistake this process had made itself. Its rewritten blocker claimed the published 3.3-4.0 per degree figure is quoted for sea-ice AREA; the source sentence says sea ice and names no quantity, so that distinction was this store own, asserted while correcting the record for over-claiming. What caught it was not rereading the paper but building the layer and checking it against the observation it must reproduce - back-projected to 1979 it gave 6.9 to 7.7 million km2 where NSIDC measured 4.58. Regressed against this store own gmst anchors, September area falls 1.96 plus or minus 0.44 per degree and September extent falls 3.03 plus or minus 0.54, so the published figure matches extent rather than area. The layer therefore uses a computed area sensitivity of 1.5 to 2.4 per degree, anchored on the fit 2.66 for 2025 rather than the observed 3.08, drawn as two edges with the assessment spread between them and a floor at 1.0 where AR6 calls it practically ice-free and the readout stops giving a number. zonal-extent gained an area mode for this: a cap anchored on a measured area with a rate in the same units, beside the fraction mode permafrost still uses. tools/sea_ice_sensitivity.mjs re-runs it. Two records remain planned. Lever three came off too, and not by being built: neither record it named is blocked on time. Sea ice is the extent-versus-area problem already recorded, and a September restriction is a line in a block rather than a control. CO2 is the one ladder here with real rungs - NOAA GML runs four baseline observatories at four exact latitudes, so this is not the band-range problem of @LAT22.75LON-158 - and it is blocked on provenance instead: the per-station amplitudes are published as data rather than as an assessed value, and building the ladder would mean computing a number, which would be this store first piece of its own analysis rather than a transcription. That is a rule this store has kept without ever stating it, now stated on the record. What all five investigations had in common is written up as @LAT51.58LON0.1: every blocker examined named a dataset, and not one of the real obstacles was the absence of that dataset - they were mismatches of basis or of provenance. A blocker is a hypothesis written at the moment of least information about a record, and this store had been recording those hypotheses in the same voice as its measurements. EPS cannot see it, scoring the three wrong ones 13, 11 and 4, because a blocker carries no conf of its own - the same shape of blind spot as @LAT26.6LON-70.1. Every number in every ttdb-render and ttdb-timeline block is now read by the app and the test suite fails if one is not: decline_rate, uncertainty_low and uncertainty_high were retired from @LAT26.5LON-70 as dead, while shift_range and baseline turned out to be numbers the app should have been reading and now does - the zone readout prints the declared sensitivity range beside the shift, and the anomaly readout takes its baseline period from the store instead of a copy in the code. Prose keys (traj_columns, branch_columns, scenario_columns, scenario_note) are exempt and stay: they carry no number to go stale. Written-out counts of renderings in prose are a test too: prose is exempt from the numbers rule, so the split that turned one record into three left a stale count of ten in README.md and at @LAT-90LON0 while the store held twelve, and nothing in the suite could see it. Lever five, the last one open, is decided and declined at @LAT51.78LON0.3: a coarse grid stays out of the store. Its size claim held and never needed the raster - 2592 cells at 5 degrees pack into 3 bits each, 972 B or 1296 B base64, incompressible and independent of content, and the grids this repository already holds run-length-encode to 476 B - but size was never the cost, and the cost the lever did name was already paid twice in the runtime: 15 hand-authored coastline polygons at roughly 5 degree fidelity, and the Antarctic sector split. The app also already rebuilds a 1 degree land mask of 65160 cells at every load, 25 times the 2592 proposed, so embedding would not change whether a grid exists but whether its cells are derived or shipped. The real cost is that the load-bearing rule polices keys and a payload is one key - base64 contains letters, so numbersOnly files it as prose and exempts it outright. A 1296-character cells_5deg put into a copy of this store and read by nothing is waved through by that rule - as the whole suite was, until the guard below - while one inert number beside it fails and gets named, so a grid would be the first thing this store could hold that delete a number and the app loses that capability does not reach. tools/grid_payload.mjs measures all of it, and the guard is now in the suite rather than in prose: no block value may carry an unbroken non-URL token over 48 characters, against a longest legitimate 29. A grid derived at load from a generator small enough to read stays admissible, which is how the coastlines already work; what closes is shipped opaque cells. That is a single scalar check failing to carry a value with many claims in it, the fourth instance of that shape and the first of them in the test suite rather than in a weight. Building the guard turned up two more live stale counts that the renderings-count test could not see because they said layers where it wanted renderings - a stale count of eight in two places while the store holds ten, now corrected - so that test also reads the qualifier-first form now, across records, renderings and layers. Nothing here has been checked against source rasters; conf values are transcriptions of source assessments.The thirteenth rendering is the first whose subject is not the Earth. @LAT51.38LON-0.1 draws the other ten partitioned by what a reader must supply before a layer answers - a latitude 5, a named place 3, nothing at all 2, with a second reading per term for how many of them read the year, 4-1-0, which is the five-take-the-timeline split already stated at Home arriving from the other direction. It is lane:meta rather than lane:render because the umwelt scope is climate processes and this record makes no climate claim, and it is left out of its own count for the same reason. Three things came out of building it. The first is that the three questions a reader actually asks do not partition: two of them select a layer and the third reads a layer already selected, so is this number what I think it is is not a fourth term - all ten answer it, and a fourth bar would turn a partition of ten into a set of twenty and break the legend arithmetic that catches a mistranscribed term. It is answered on the belief lane instead and the record points there. The second is that the mechanical rule cannot see its own exception: kind: sorts every layer, and by that rule @LAT67.9LON18.57 is neither, because a set of 19 regions is a composition to the app and a place to the reader standing in one. It is declared against its kind, the record names it, and tools/answerable.mjs prints the disagreement rather than smoothing it - a second one appearing silently is what the new suite section catches. The third is that a rendering about this file has this file as its source, which is honest and is also the one record here whose source: lines point at no assessment; that is stated on the record rather than padded with climate URLs. The counts are computed under the rule set at @LAT51.68LON0.2, and the aux column is checked against the app usesYear rather than against a second copy of the rule, so it goes stale the moment a layer controls change. No app code was added: composition already drew a set of terms beside the globe, and the only thing the layer needed was to be written down."
```

---

@LAT51.48LON0 | created:1788912000 | updated:1788912000 | lane:meta | relates:renders@LAT0LON0,renders@LAT80LON0,depends_on@LAT0.1LON0.1

**Home — Royal Observatory, Greenwich**

The store sits at the place that defines its own longitude. One page, one globe, and
as many controls as the chosen rendering actually reads: a TTDB globe of the Earth with
schematic continent outlines; the list of renderings, defaulting to Temperature Zones;
and, where the layer uses them, a timeline centred on 2026 and the emissions scenario
its future half is drawn under.

**A control that changes nothing is not shown.** Each layer declares what it reads, and
the page puts the rest away - because a slider under a picture it cannot move invites a
reading the layer does not support. Eleven drawn layers, three arrangements: the zone
bands, the anomaly, permafrost and @LAT82LON-140 take both, because all four go through
the warming series. @LAT26.5LON-70 takes the timeline and **not** the scenario, since it
interpolates its own year anchors and never touches that series. @LAT19.54LON-155.58,
@LAT-75LON-106.75, @LAT0LON-140, @LAT-50LON60, @LAT67.9LON18.57 and @LAT51.38LON-0.1 take
neither: a climatology, a set of measured period means, a sum, a partition, a set of
regional rates and a count of the layers themselves are none of them functions of the year,
and each says so in its own words where the timeline would have been. **How many layers sit
in each of those three groups is itself drawn**, at @LAT51.38LON-0.1.

The load-bearing choice is in `umwelt.globe.mapping`: **latitude and longitude are
real**. In every other store in this corpus the globe is a knowledge map and the
coordinates are a projection of something abstract. Here the projection is the
identity, so the knowledge globe and the Earth are the same object and a generic
TTCP viewer renders this file with no per-store code.

The app reads its every constant from this file - band edges, colours, sensitivities,
the temperature series, the timeline bounds. `index.html` contains the projection,
the rasteriser and the coastline geometry, and not one climate number. That is the
corpus claim (`the file IS the model, the runtime is a generic interpreter`) taken
literally enough to be falsifiable: delete a number from this file and the app loses
that capability.

Expansion: [RESEARCH.md](RESEARCH.md). Specs: [RFCs/](RFCs/).

```ttdb-timeline
min: 1926
default: 2026
max: 2126
scenario: SSP2-4.5
scenario_note: the default only. The set on offer, their AR6 best estimates and their anchors are at @LAT80LON0, and every rendering that reads the temperature series follows the choice.
note: the year is the centre of a 30-year climate normal, because Koppen classes are defined on 30-year normals
tier: 1926 2025 | observed | conf 240
tier: 2026 2100 | projected | conf 170
tier: 2101 2126 | extended | conf 90
```

---

@LAT51.38LON-0.1 | created:1789084800 | updated:1789084800 | lane:meta | relates:refines@LAT51.48LON0,supports@LAT51.58LON0.1,supports@LAT51.68LON0.2
[ew]
conf:200
rev:0
sal:130
touched:1789084800
[/ew]

**Answering Where You Are** (Implemented - the questions a reader brings)
src: RESEARCH.md §13 (Answering Where You Are)

Just west of Home, and `lane:meta` rather than `lane:render`, because the subject here is
the store and not the Earth. It is the only rendering in the set that makes no climate
claim, and it is left out of its own count for the same reason.

Someone somewhere on Earth asks an agent about the climate **where they are**, with this
file for context. Three questions arrive, and they differ in one thing only: **what the
store needs from the reader before it can answer.**

> *"I'm in Reykjavík. How much warmer is my latitude than pre-industrial, and what about 2070?"*

**1. A latitude** is all that needs, and everyone on Earth has one. Every `zonal-*` layer
answers this way, anywhere on its domain: the zone bands, the anomaly, the CO₂ swing, the
sea-ice cap, the permafrost cap. Four of the five also take a year, so *and in 2070?* is a
different answer; the CO₂ ladder is a climatology and reads the same in every year, which
is why it says so where the timeline would have been.

> *"I hike the glaciers above Innsbruck. Are they going faster than the ones in Alaska?"*

**2. A named place**, and only where the science publishes one: 19 RGI basins for the
glaciers, three longitude sectors for Antarctica, one mooring line at 26.5 °N for the
overturning. Innsbruck resolves to Central Europe - 2.0 Gt/yr against Alaska's 60.8, and
**39 % of its own year-2000 ice gone against Alaska's 22 %, the largest relative loss
anywhere**. A town an hour away on the plain resolves to nothing, and *the store has nothing
for that place* is a different statement from *nothing is happening there*.

> *"I'm on the Oregon coast. Of the sea-level rise I'll see, how much is melting ice versus water just getting bigger?"*

**3. Nothing at all** - which is the catch in the most local-sounding question of the three.
The reader is standing somewhere specific and the answer is not: @LAT0LON-140 and
@LAT-50LON60 are sums, identical seen from anywhere, and they are the only layers a reader's
location is not an input to. Oregon gets the honest version or none - glaciers **18 mm**
measured over 2000-2023, Greenland derived from it by **1.18**, Antarctica an open-ended
**more than 2×** - and *water just getting bigger* is **an empty slot at full width**,
because the store holds no millimetres for thermal expansion on that basis. The gap has a
size and no number, which is the answer.

> *"A headline says the Arctic is warming four times faster. I'm in Tromsø - am I at +6 °C?"*

⚠ **A fourth question is asked constantly and is not a term here.** *Is this number what I
think it is?* - the Arctic ratio above, or *ice-free by 2050*, or a Gulf Stream headline.
It is not a term because it is not a *layer*: it is asked of a layer already chosen, and all
ten answer it, from `conf:`, from `src:`, from the `source:` links and from the belief lane.
Tromsø is not at +6: **3.9 is a ratio of linear trends over 1979-2021 and this store needs a
ratio of cumulative anomalies, which is 2.5**, and @LAT80LON0 carries both numbers and the
reason they differ. Putting it in the composition would make a partition of ten into a
set of twenty and break the one check the legend exists to perform. **Two of the three
questions above select a rendering; this one reads the rendering you already have**, and
that is the distinction the record is really for. @LAT51.68LON0.2 and @LAT51.58LON0.1 are
where it gets answered.

⚠ **One layer is filed against its own kind.** The mechanical rule is the `kind:` key -
`zonal-*` is a latitude, `sector-field` and `distribution-transport` are a place, a
`composition` draws nothing on the sphere and is neither. By that rule @LAT67.9LON18.57 is
*neither*, and it is declared under **a named place**, because its 19 terms are regions a
reader can stand in while sea level's and energy's terms are components nobody stands in.
That is the one thing this rendering has to say that its own rule cannot see, and
`tools/answerable.mjs` prints it as a disagreement rather than hiding it.

**The counts are this store's own arithmetic**, not a transcription - there is no assessment
anywhere of how many layers of this file answer from a latitude. So it carries
`provenance: computed` and names what re-runs it, under the rule set at @LAT51.68LON0.2.
Its `source:` lines point at this file, which is the only honest source for a rendering
whose subject is this file, and it is the one record here where they point at no assessment.

- This store, raw — https://raw.githubusercontent.com/antfriend/global_models/main/global_memory_system_ttdb.md
- TTCP-RFC-0001, what a rendering is — https://github.com/antfriend/global_models/blob/main/RFCs/TTCP-RFC-0001-Record-Rendering.md
- The reference viewer — https://antfriend.github.io
- The repository — https://github.com/antfriend/global_models

```ttdb-render
id: answerable
label: Answering Where You Are
order: 13
status: implemented
kind: composition
basis: the drawn layers of this store
unit: drawn layers
whole: 10
reference: latitude
provenance: computed
method: a count of this store's own layers, bucketed by what a reader must supply before the layer returns anything - the kind: key decides it, and the one layer filed against its kind is named on the record and printed as a disagreement by the tool.
recompute: node tools/answerable.mjs
readout: things the store can need from you
offglobe_note: a question is not a place - this one counts the layers rather than drawing the Earth, and is left out of its own count
aux_unit: with a timeline
aux_label: layers in this term that change with the year
term_columns: id, label, relation, value in unit, locus - the member layers, aux - how many of them read the year
term_note: measured is the app's word for a term carrying its own value; provenance: computed above says where that value came from. The locus column is the membership itself, so the partition can be checked by reading it.
term: latitude | A latitude | measured | 5 | @LAT0LON0 @LAT80LON0 @LAT19.54LON-155.58 @LAT82LON-140 @LAT68.75LON161.4 | 4
term: place | A named place | measured | 3 | @LAT-75LON-106.75 @LAT67.9LON18.57 @LAT26.5LON-70 | 1
term: neither | Nothing at all | measured | 2 | @LAT0LON-140 @LAT-50LON60 | 0
source: this store, whose layers are what is counted | https://raw.githubusercontent.com/antfriend/global_models/main/global_memory_system_ttdb.md
source: TTCP-RFC-0001, which defines what a rendering is | https://github.com/antfriend/global_models/blob/main/RFCs/TTCP-RFC-0001-Record-Rendering.md
bar: reference | #5b5f8a
bar: derived | #7f83aa
bar: bound | #a7aac6
bar: empty | #6f6f6f
```

---

@LAT0LON0 | created:1788912000 | updated:1788912000 | lane:render | relates:depends_on@LAT80LON0,supports@LAT26.5LON-70
[ew]
conf:210
rev:0
sal:240
touched:1788912000
[/ew]

**Temperature Zones** (Implemented - the default rendering)
src: RESEARCH.md §1 (Temperature Zones) and §2 (poleward migration)

The five Köppen-Geiger major classes - **A** tropical, **B** arid, **C** temperate,
**D** continental, **E** polar - drawn as translucent areas over land, migrating
poleward as global mean temperature rises.

Authoritative source: **Beck et al. (2023)**, 1 km Köppen-Geiger maps for 1901–2099
from 42 constrained CMIP6 models. Measured share of global land (excluding Antarctica)
that changed major class from **1901–1930 to 1991–2020: ~5%**. Projected from
**1991–2020 to 2071–2099: ~5% (SSP1-2.6), ~8% (SSP2-4.5), ~13% (SSP5-8.5)**. These are
separate transitions and are not additive - a cell may change twice.

⚠ **What is drawn here is a zonal schematic, not that raster.** Real Köppen classes are
not latitude bands: the Sahara and the Congo basin lie at similar latitudes in different
classes, and B is a set of regions rather than a ring. The bands carry the poleward
*migration* honestly and the *geography* badly - and **that is a kept simplification, not a
task deferred.**

The raster is six discrete epochs (four historical, then 2041-2070 and 2071-2099) and this
timeline is continuous from 1926 to 2126, so it cannot cover the slider it would replace:
nothing between 1991-2020 and 2041-2070, and nothing at all past 2099. It is also a 125 MB
archive, which would move the model out of this file into a sidecar and end the
no-build-no-dependency property that makes the corpus claim checkable in the first place.
What the bands demonstrate is the *pattern* - a rendering is a pure function plus a block -
and they demonstrate it as well as the raster would.

So the app **links** the raster rather than loading it. The `source:` line below puts it one
click from the legend, beside the layer that approximates it: a reader who needs the real
geography is told where it lives, and told that this is not it.

The band table below is the **1991–2020 normal** (`reference_year: 2005`), so the drawn
shift is `k x (dT(year) − dT(2005))` and the slider sitting at 2005 draws the table
unmoved. The equator and the poles are fixed; only interior band edges migrate.

Boundary sensitivity **2.0 ° latitude per °C**, from observed tropical widening of
0.25–0.5 °lat/decade against ~0.2 °C/decade warming - a range of 1.25–2.5, and the app
declares the range beside the value it uses. Poleward of 45° the shift is doubled, a
gesture at polar amplification that is deliberately smaller than the 2.5x anomaly ratio at
@LAT80LON0, because an isotherm's position and a warming rate are different quantities and
the meridional temperature gradient converts one into the other. This factor is the weakest
constant in the rendering and nothing in the cited literature pins it.

- Beck et al. 2023, Sci. Data 10, 724 — https://www.nature.com/articles/s41597-023-02549-6
- Data — https://www.gloh2o.org/koppen/
- Staten et al. 2020, BAMS — https://journals.ametsoc.org/view/journals/bams/101/6/BAMS-D-19-0047.1.xml
- Grise & Davis 2020, ACP 20, 5249 — https://acp.copernicus.org/articles/20/5249/2020/

```ttdb-render
id: temperature-zones
label: Temperature Zones
order: 1
status: implemented
kind: zonal-class
domain: land
opacity: 0.45
reference_year: 2005
readout: poleward zone shift
shift_deg_per_c: 2.0
shift_range: 1.25 2.5
polar_factor: 2.0
polar_from: 45
band: A | Tropical | #cf4b3a | 0 15 | 0 15
band: B | Arid | #d99a34 | 15 30 | 15 30
band: C | Temperate | #4f9b57 | 30 45 | 30 48
band: D | Continental | #3f7fa6 | 45 68 | none
band: E | Polar | #9db2c4 | 68 90 | 48 90
source: Beck et al. 2023, the 1 km raster these bands approximate | https://www.gloh2o.org/koppen/
```

---

@LAT80LON0 | created:1788912000 | updated:1788912000 | lane:render | relates:supports@LAT0LON0,measures@LAT-50LON60
[ew]
conf:245
rev:0
sal:230
touched:1788912000
[/ew]

**Surface Temperature Anomaly** (Implemented)
src: RESEARCH.md §3 (Surface Temperature Anomaly)

Zonal-mean warming relative to 1850–1900. Placed at 80°N because that is where the
anomaly is largest and where the *pattern* is decided.

The best-constrained field in the set: three independent observational products agree,
and the shape - Arctic maximum, Southern Ocean minimum - is a robust result of both
observation and models rather than a fitted curve.

⚠ **The Arctic factor here is 2.5, and the number everyone quotes is 3.9. That is not an
error, it is two different quantities.** Rantanen et al. (2022) report the Arctic warming
**nearly four times the global rate over 1979–2021** - a ratio of *linear trends over one
43-year window*, during which Arctic warming was unusually fast. What this rendering needs
is a ratio of *cumulative anomalies since 1850–1900*, which is a smaller number, and one
that CMIP6 projects to fall further: assessed Arctic amplification indices run **1.8–2.4
for future periods** and 2–3 for present conditions, while NOAA's Arctic Report Card 2025
states Arctic temperature has risen at **more than double the global rate since 2006**.
So the profile uses **2.5** - above the projected range, below the observed trend ratio.
Multiplying a 3.9 trend ratio by a cumulative global anomaly would have shown the Arctic
at +12.9 °C in 2126, which no assessment supports; the store's constraint that a
measurement and a model output are never printed alike is what caught it.

**2024 was the first calendar year above 1.5 °C** at ~1.55 °C; 2025 ran ~1.42 ± 0.12 °C
(Jan–Aug); the WMO consolidated 2023–2025 three-year mean is **1.48 ± 0.13 °C**, and
2015–2025 were the eleven warmest years on record.

The `gmst` series below is the shared driver for this rendering, for the zone migration
at @LAT0LON0 and for the permafrost extent at @LAT68.75LON161.4. **Its observed half is one
series - the past does not branch.** Its future half does: the five `scenario` lines are
the five illustrative SSPs of **AR6 WGI Table SPM.1**, each `future` anchor is that table's
*best estimate* for the 20-year period the anchor centres (2050 for 2041–2060, 2090 for
2081–2100), and the assessed *very likely* range rides on the `scenario` line beside it,
where the app shows it under the selector.

**SSP1-1.9 falls after mid-century** - 1.6 °C at 2050 against 1.4 °C at 2090 - and that is
the table, not a slip. It is the only branch that peaks inside the slider, and the only
place this app draws warming going down.

The 2126 anchor of every branch is the **2041–2060 → 2081–2100 trend continued to 2126,
rounded to 0.1 °C**, which is past the end of the AR6 assessment. It is marked `extended`,
not `projected` - the app lowers its displayed confidence there rather than quietly drawing
the same line. Straight-line extension is a *shape* assumption and a poor one on the low
branches, where the physics is a plateau and not a slope.

- WMO State of the Global Climate 2025 — https://wmo.int/news/media-centre/wmo-confirms-2025-was-one-of-warmest-years-record
- IPCC AR6 WGI SPM, Table SPM.1 — https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/
- Rantanen et al. 2022 (the 3.9 trend ratio) — https://www.nature.com/articles/s43247-022-00498-3
- Chylek et al. 2022, observed vs CMIP6 amplification — https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2022GL099371
- NOAA Arctic Report Card 2025 — https://arctic.noaa.gov/report-card/report-card-2025/
- HadCRUT5 — https://www.metoffice.gov.uk/hadobs/hadcrut5/ · GISTEMP v4 — https://data.giss.nasa.gov/gistemp/ · Berkeley Earth — https://berkeleyearth.org/data/

```ttdb-render
id: temperature-anomaly
label: Surface Temperature Anomaly
order: 2
status: implemented
kind: zonal-field
domain: global
opacity: 0.55
unit: C above 1850-1900
baseline: 1850-1900
amp: -90 | 0.8
amp: -60 | 0.6
amp: -30 | 0.8
amp: 0 | 0.9
amp: 30 | 1.0
amp: 60 | 1.5
amp: 70 | 2.0
amp: 90 | 2.5
readout: 85 | Arctic
source: IPCC AR6 WGI, Table SPM.1 | https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/
source: HadCRUT5 | https://www.metoffice.gov.uk/hadobs/hadcrut5/
stop: -0.5 | #3a6ea8
stop: 0.0 | #ece9e0
stop: 2.0 | #e2af4b
stop: 4.5 | #c74f2e
stop: 9.0 | #6a1c14
stop: 16.0 | #2b0705
gmst: 1926 | 0.15 | observed
gmst: 1950 | 0.20 | observed
gmst: 1975 | 0.28 | observed
gmst: 2000 | 0.65 | observed
gmst: 2015 | 1.00 | observed
gmst: 2024 | 1.48 | observed
scenario_period: 2081-2100
scenario_columns: id, label, AR6 best estimate for scenario_period, AR6 very likely range for scenario_period
scenario: SSP1-1.9 | very low emissions | 1.4 | 1.0-1.8
scenario: SSP1-2.6 | low emissions | 1.8 | 1.3-2.4
scenario: SSP2-4.5 | intermediate emissions | 2.7 | 2.1-3.5
scenario: SSP3-7.0 | high emissions | 3.6 | 2.8-4.6
scenario: SSP5-8.5 | very high emissions | 4.4 | 3.3-5.7
future: SSP1-1.9 | 2050 | 1.60 | projected
future: SSP1-1.9 | 2090 | 1.40 | projected
future: SSP1-1.9 | 2126 | 1.20 | extended
future: SSP1-2.6 | 2050 | 1.70 | projected
future: SSP1-2.6 | 2090 | 1.80 | projected
future: SSP1-2.6 | 2126 | 1.90 | extended
future: SSP2-4.5 | 2050 | 2.00 | projected
future: SSP2-4.5 | 2090 | 2.70 | projected
future: SSP2-4.5 | 2126 | 3.30 | extended
future: SSP3-7.0 | 2050 | 2.10 | projected
future: SSP3-7.0 | 2090 | 3.60 | projected
future: SSP3-7.0 | 2126 | 5.00 | extended
future: SSP5-8.5 | 2050 | 2.40 | projected
future: SSP5-8.5 | 2090 | 4.40 | projected
future: SSP5-8.5 | 2126 | 6.20 | extended
```

---

@LAT19.54LON-155.58 | created:1788912000 | updated:1788998400 | lane:render | relates:supports@LAT80LON0,supports@LAT22.75LON-158
[ew]
conf:205
rev:2
sal:200
touched:1788998400
[/ew]

**Atmospheric CO2** (Implemented - the seasonal breathing, and the first computed number here)
src: RESEARCH.md §4 (Atmospheric CO2)

Mauna Loa Observatory, 19.54°N 155.58°W. The best-measured quantity in the set and the
only one with a continuous instrumental record kept by one method at one site since
**March 1958** (C. D. Keeling).

**2025 annual mean 427.09 ppm.** The **May 2025 seasonal peak passed 430 ppm for the
first time** - Scripps 430.2, NOAA GML 430.5, up 3.5 and 3.6 ppm on May 2024. Ice cores
(EPICA Dome C, Law Dome) extend the record to 800,000 years and place the present value
outside that entire range.

⚠ **The mean field is still not drawn, and should never be.** CO2 is nearly uniform - the
pole-to-pole gradient is a few ppm against a 427 ppm background - so as a translucent shell
it is a flat colour that says nothing. What is drawn instead is the **seasonal breathing**:
the peak-to-trough swing of the annual cycle, **~18 ppm at Barrow** falling to **~1 ppm
across the Southern Ocean**, because the swing is Northern Hemisphere land vegetation and
the Southern Hemisphere has little. The source/sink flux map is a different dataset and is
still not drawn.

**This is the first number in this store that is not a transcription.** Every other value
here is copied from somebody's assessment and can be checked by reading their document. The
per-station amplitudes are not published that way - they exist as monthly series - so this
ladder is **computed**, by this store's own arithmetic, under a rule adopted deliberately
and recorded in `umwelt.constraints`: a computed value is never printed like a transcribed
one, and it declares its method and what re-runs it.

**The method, precisely enough to re-run.** NOAA GML CCGG **surface flask monthly means** -
one programme for every site, so the ladder is on one basis - over **2013-2024**. Per site:
detrend with a **centred 13-term moving average** (half weight on the end months), average
the residual by calendar month, take **max minus min** of those twelve numbers. A site needs
six complete years per calendar month or it is dropped, which drops Christmas Island and
leaves nothing between 19.5°N and 14.2°S. Latitudes are NOAA's own, read from the site
headers. `tools/co2_amplitude.mjs` does exactly this and prints the ladder.

⚠ **The first method was wrong, and this store nearly recorded it.** Detrending by
subtracting each *year's mean* leaves the secular rise - about 2.5 ppm/yr - inside the year
as a sawtooth of roughly that size. At Barrow, against an 18 ppm cycle, it barely shows. At
the South Pole, against a 1 ppm cycle, it *is* the answer: that method returned **2.7 ppm
peaking in December and troughing in February**, which is not a seasonal cycle at all but
the trend wearing one. The moving average fixed it and the South Pole came back at
**1.3 ppm peaking in September**, the southern spring. Nothing in this store would have
caught it. That is the cost of the decision, paid on its first number: a transcribed value
is checked by reading a document, and a computed one only by recomputing it.

⚠ **`conf` fell from 250 to 205, and that is the point.** 250 described the *measurement* -
CO2 is the best-characterised quantity here. What this record now draws is not the
measurement but arithmetic on it, and the arithmetic has a failure mode the measurement does
not. The prose still transcribes 427.09 ppm and the 430 ppm peak at full confidence; one
`conf` cannot carry both kinds of number, which is @LAT26.6LON-70.1 recurring in a new
place. EPS rises from **4 to 39**, the metric correctly saying *attend to this* about a
number that did not exist here yesterday.

⚠ **It does not move under the slider.** The ladder is a 2013-2024 climatology, not a
function of temperature, so `scale: none` holds it still while the year changes. The
amplitude is itself growing over time - this layer does not draw that and does not claim to.

- NOAA GML trends — https://gml.noaa.gov/ccgg/trends/
- Keeling Curve — https://keelingcurve.ucsd.edu/
- Scripps, 430 ppm — https://scripps.ucsd.edu/news/annual-carbon-dioxide-peak-passes-another-milestone
- Global Carbon Budget (fluxes) — https://globalcarbonbudget.org/
- NOAA GML baseline observatories — https://gml.noaa.gov/ccgg/about/co2_measurements.html
- NOAA GML CCGG surface flask, monthly — https://gml.noaa.gov/aftp/data/trace_gases/co2/flask/surface/txt/

```ttdb-render
id: co2
label: Atmospheric CO2
order: 3
status: implemented
kind: zonal-field
scale: none
domain: global
opacity: 0.5
unit: ppm
provenance: computed
method: this store's own arithmetic on NOAA GML CCGG surface flask monthly means, 2013-2024 - detrend with a centred 13-term moving average, average the residual by calendar month, take max minus min. Six complete years per month required or the site is dropped.
recompute: node tools/co2_amplitude.mjs
readout: 71 | seasonal swing at Barrow
undated_note: a 2013-2024 climatology - the slider does not apply to it, and the swing is itself growing
amp: 90 | 16.8
amp: 82.5 | 16.8
amp: 71.3 | 18.4
amp: 53.3 | 15.3
amp: 38.8 | 11.5
amp: 19.5 | 7.0
amp: -14.2 | 1.4
amp: -40.7 | 1.1
amp: -64.8 | 1.8
amp: -90 | 1.3
source: NOAA GML CCGG surface flask, monthly | https://gml.noaa.gov/aftp/data/trace_gases/co2/flask/surface/txt/
source: NOAA GML baseline observatories | https://gml.noaa.gov/ccgg/about/co2_measurements.html
stop: 0 | #f2efe6
stop: 3 | #bcd3a6
stop: 8 | #6aa84f
stop: 14 | #2f7a3e
stop: 19 | #14532b
```

---

@LAT0LON-140 | created:1788912000 | updated:1788998400 | lane:render | relates:derived_from@LAT72.58LON-38.46,derived_from@LAT-75LON-106.75,derived_from@LAT67.9LON18.57,derived_from@LAT-50LON60
[ew]
conf:220
rev:1
sal:190
touched:1788998400
[/ew]

**Sea Level Rise** (Implemented - as a composition of its parts, not as a map)
src: RESEARCH.md §5 (Sea Level Rise)

Central equatorial Pacific - satellite altimetry is global, and this is the middle of the
largest basin it measures.

The rate has **roughly doubled in three decades**: ~2.1 mm/yr in 1993, ~4.5 mm/yr in 2023,
for a total of **+111 mm** over the 1993–2023 altimetry record. About two-thirds of recent
rise is water added by melting ice; the rest is thermal expansion - which makes this
record a *sum* of the ice records and @LAT-50LON60 rather than an independent observation,
and the edges say so.

AR6 projection to 2100 relative to 1995–2014: **0.28–0.55 m** (SSP1-1.9) to
**0.63–1.01 m** (SSP5-8.5).

**The parts of the sum, and which is largest.** This record adds up four others, and the
edges name them: @LAT72.58LON-38.46 Greenland, @LAT-75LON-106.75 Antarctica,
@LAT67.9LON18.57 mountain glaciers, and @LAT-50LON60 for the thermal expansion that is not
ice at all. The largest of the three ice terms is the **glaciers** - GlaMBIE puts their
2000–2023 loss about 18% above Greenland's and more than twice Antarctica's - and they were
the last of the four to get a record, having spent this store's first weeks as one word in
another record's title with no number under it.

⚠ **Rendering note. What is drawn here is the sum's *parts*, and it is not a map.** Sea
level is not uniform - regional rates differ several-fold - so a globe layer would have to
draw the altimetry field, and a coastal-inundation layer would additionally need elevation
this app's schematic outlines cannot support. Neither is drawn and neither is promised.
What *is* drawn is the thing this record already claimed to be: a **sum**, with its terms
side by side. It renders off the globe, because a budget is not a place.

⚠ **One basis, and the reason the other numbers are not on it.** The three land-ice terms
appear here on the **GlaMBIE 2000-2023** basis, which is the only common period this store
holds a comparison on: glaciers about **18% above Greenland's** and **more than twice
Antarctica's**. The absolute values elsewhere in this store are *not* on that basis -
Greenland's +16.0 mm is 1972-2025 and Antarctica's +13.5 mm is 1979-2024 - so stacking
those three would be a chart of three different periods presented as one budget. Only the
reference term carries a measured absolute; the others are the app dividing it by the
ratios above, and Antarctica's is an **upper bound**, drawn open, because *more than twice*
is an inequality and not a value.

⚠ **Thermal expansion is drawn as an empty slot.** It is the largest single contribution of
any kind, and `@LAT-50LON60` holds no number for it - only *>90% of excess heat* and a
record-high imbalance, which are not millimetres. This store does say elsewhere that about
**two-thirds** of recent rise is added water and the rest is thermal expansion, but that is
undated *recent* and not the GlaMBIE period, so putting it in this composition would import
exactly the period-mixing the paragraph above refuses. The slot stays empty and says so,
which is the honest shape of a gap.

- NASA Sea Level Change Portal — https://sealevel.nasa.gov/
- Hamlington et al. 2024, Comms. Earth Environ. — https://www.nature.com/articles/s43247-024-01761-5
- AR6 sea level projection tool — https://sealevel.nasa.gov/ipcc-ar6-sea-level-projection-tool
- IPCC AR6 WGI Ch. 9 — https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
- WGMS glacier mass balance — https://wgms.ch/
- GlaMBIE, community estimate 2000–2023, Nature 2025 — https://www.nature.com/articles/s41586-024-08545-z

```ttdb-render
id: sea-level
label: Sea Level Rise
order: 4
status: implemented
kind: composition
basis: 2000-2023
unit: mm
reference: glaciers
readout: land-ice terms on one basis
offglobe_note: a sum is not a place - this one is drawn beside the globe, not on it
term_columns: id, label, relation, factor, locus
term_note: relation says how the source states this term against the reference. reference - the measured absolute, in unit. ratio_to_ref - the reference is factor times this term. ratio_min - the reference is more than factor times this term, so this term is an upper bound and is drawn open. unrecorded - the store holds no number and the slot is drawn empty.
term: glaciers | Mountain Glaciers | reference | 18 | @LAT67.9LON18.57
term: greenland | Greenland Ice Sheet | ratio_to_ref | 1.18 | @LAT72.58LON-38.46
term: antarctic | Antarctic Ice Sheet | ratio_min | 2 | @LAT-75LON-106.75
term: thermal | Thermal expansion | unrecorded | 0 | @LAT-50LON60
source: GlaMBIE, Nature 2025 | https://www.nature.com/articles/s41586-024-08545-z
source: NASA Sea Level Change Portal | https://sealevel.nasa.gov/
bar: reference | #3f6fa8
bar: derived | #6d97c4
bar: bound | #9ab4d0
bar: empty | #6f6f6f
```

---

@LAT82LON-140 | created:1788912000 | updated:1789084800 | lane:render | relates:supports@LAT80LON0
[ew]
conf:235
rev:2
sal:160
touched:1789084800
[/ew]

**Arctic Sea Ice** (Implemented - on area, which is the quantity its rate was always quoted in)
src: RESEARCH.md §6 (Arctic Sea Ice)

Beaufort Sea, where the September ice edge retreats.

September minimum trend **1979–2025: −12.1% per decade** against the 1981–2010 average.
The **2025 minimum was 4.60 million km² on 10 September**, tied tenth-lowest with 2008
and 2010 in the 47-year satellite record.

The reason to draw it is the part that complicates the story: NSIDC reports **no
significant trend in the September minimum over 2007–2025**, while every year after 2006
still sits below every year before it. A step, then a plateau, on top of a long decline -
and an area rendering shows that shape where a trend line hides it.

**The per-degree sensitivity exists and is sourced.** Niederdrenk and Notz (2018), quoted
in Stroeve and Notz (2018), give **3.3-4 million km² of September sea ice lost per °C of
annual mean global warming**, against **~1.6 million km² per °C for March**. AR6 defines
*practically ice-free* as **below 1 million km²**, and assesses the Arctic *likely* to be
practically ice-free in September at least once before 2050 under all five illustrative
scenarios, and in the 2081-2100 mean under SSP2-4.5, SSP3-7.0 and SSP5-8.5 but not under
the lowest. That is a rate indexed to global mean temperature - exactly what @LAT80LON0
produces - so nothing about *time* stops this layer either.

**The missing number was one column away - and finding it showed the blocker had been
rewritten wrong.** NSIDC's Sea Ice Index publishes September **extent and area side by side
in the same file**, every year since 1979. **September 2025: area 3.08 million km², extent
4.75.** But the previous blocker here claimed the published sensitivity *"is quoted for
sea-ice AREA"*, and it is not. The source sentence reads, verbatim: *"3.3-4 million km2 of
September Arctic sea ice are lost per °C of annual mean global warming"* - **"sea ice",
with no quantity named.** That distinction was asserted by this record, not by Stroeve and
Notz. Correcting one blocker introduced a different error into it.

⚠ **The published figure is almost certainly extent, and the observations say so.**
Regressed against this store's own global-mean series over 1979-2025, September **area**
falls **1.96 ± 0.44** million km² per °C and September **extent** falls **3.03 ± 0.54**.
The published 3.3-4.0 overlaps the extent range and misses the area range entirely. Applying
it to an area anchor - which is what this record was about to do - back-projected 1979 at
**6.9-7.7 million km²** against a measured **4.58**. The layer was built, checked against the
observation it should reproduce, and failed. That check is the only reason this is not
shipped wrong.

**So the sensitivity is computed rather than transcribed**, under the rule adopted at
@LAT51.68LON0.2, and computed on **the quantity this layer actually draws**: September
sea-ice *area*, against the same series the slider drives it with, so the rate is calibrated
to the very anchors that will move it. **1.5 to 2.4 million km² per °C**, the 95% interval on
the fitted slope, drawn as two edges with the assessment's width between them.

⚠ **It anchors on the fit, not on one year's weather.** The reference is the regression's
**fitted** September area for 2025, **2.66**, not the observed **3.08**; the residual of
**+0.42** is why 2025 came tenth-lowest rather than lowest. Anchoring a fitted slope to a
single observed year would have been a fit and a point pretending to be one line. Back-
projected to 1979 the layer now gives **4.4-5.4** against the measured **4.58**, inside the
band it declares.

⚠ **Three numbers here are all "September 2025 sea ice" and none is interchangeable.**
**4.60** is the *daily minimum extent*, reached on 10 September - the number the news
reports. **4.75** is the *September monthly mean extent*. **3.08** is the *September monthly
mean area*, and **2.66** is the fitted value of that last one. They stay in this record
together because keeping them apart is the whole job.

⚠ **The cap is as crude here as it is for permafrost, and for the same reason.** Real sea ice
is not a circle around the pole - it retreats first on the Atlantic side. Drawn as a cap it
carries the *area* honestly and the *shape* badly. Drawing the geography would need the
monthly concentration grid the original blocker asked for, which remains true of a
**different** rendering than this one.

⚠ **Below 1 million km² the layer stops printing a number.** AR6 defines *practically
ice-free* as area below that, and assesses it *likely* at least once before 2050 under all
five illustrative scenarios. This layer draws a **September mean**, not a single year, so it
crosses the floor later than "at least once" would - and at the floor the readout gives the
store's words instead of a figure, because a line fitted to the observed era has nothing to
say about the last of the ice.

⚠ **The step and the plateau are not drawn.** NSIDC reports **no significant trend in the
September minimum over 2007-2025** while every year after 2006 sits below every year before
it. One linear rate cannot show a step followed by a plateau. That shape is why this record
is worth having and it is still not rendered.

- NSIDC 2025 analysis — https://nsidc.org/sea-ice-today/analyses/2025-arctic-sea-ice-minimum-squeezes-ten-lowest-minimums
- Sea Ice Index — https://nsidc.org/data/g02135
- NASA indicator — https://science.nasa.gov/earth/explore/earth-indicators/arctic-sea-ice-minimum-extent/
- Stroeve & Notz 2018, Environ. Res. Lett. 13 103001 — https://iopscience.iop.org/article/10.1088/1748-9326/aade56
- IPCC AR6 WGI Ch. 9 — https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
- NSIDC, area vs extent — https://nsidc.org/learn/ask-scientist/what-difference-between-sea-ice-area-and-extent
- Sea Ice Index monthly data, September — https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v4.0.csv

```ttdb-render
id: sea-ice
label: Arctic Sea Ice
order: 5
status: implemented
kind: zonal-extent
domain: ocean
hemisphere: north
opacity: 0.5
season: September
unit: million km2
reference_year: 2025
reference_area: 2.66
decline_area_per_c: 1.5 2.4
area_floor: 1.0
provenance: computed
method: the reference area and the rate are both this store's least-squares fit of NSIDC Sea Ice Index September monthly AREA, 1979-2025, against this store's own gmst anchors - slope 1.96 with a 95% interval of 1.5 to 2.4, and the reference is the fitted value at 2025 rather than the observed 3.08. Computed because the published 3.3-4.0 figure says only "sea ice" and matches the EXTENT regression, not the area one. The 1.0 floor is transcribed from AR6.
recompute: node tools/sea_ice_sensitivity.mjs
floor_label: practically ice-free - below the area AR6 defines, where a line fitted to the observed era says nothing
readout: September sea-ice area
quantity_note: area, not extent - the same September has a 4.75 monthly mean extent and a 4.60 daily minimum extent, and the layer is built on none of those
source: NSIDC Sea Ice Index, monthly area | https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v4.0.csv
source: Stroeve & Notz 2018, ERL 13 103001 | https://iopscience.iop.org/article/10.1088/1748-9326/aade56
source: IPCC AR6 WGI Chapter 9 | https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
stop: 0.0 | #ffffff
stop: 0.35 | #cfe3ef
stop: 0.7 | #8fc3dd
stop: 1.0 | #d8ecf6
```

---

@LAT-50LON60 | created:1788912000 | updated:1788998400 | lane:render | relates:supports@LAT80LON0,supports@LAT0LON-140
[ew]
conf:230
rev:1
sal:180
touched:1788998400
[/ew]

**Ocean Heat and Earth Energy Imbalance** (Implemented - as where the energy went, not as a field)
src: RESEARCH.md §7 (Ocean Heat and Energy Imbalance)

Southern Ocean, Indian sector - the dominant region of ocean heat uptake.

**More than 90% of the excess heat trapped by greenhouse gases is stored in the ocean**,
and that warming has accelerated sharply in recent decades. The WMO *State of the Global
Climate 2025* names **Earth energy imbalance as a key indicator for the first time** and
reports it at a **record high in 2025**.

This is the closest thing in the set to the *cause* term. Surface temperature is what the
imbalance has already done; the imbalance is what is still owed - which is why it carries
higher salience than its visual interest would suggest.

**Where the energy went, 1971-2018.** AR6 WGI Chapter 7 partitions the global energy
inventory: **ocean 91%**, **land 5%**, **ice sheets and glaciers 3%**, **atmosphere 1%**.
The inventory grew by **435 [325 to 545] ZJ** over that period, a heating rate of
**0.57 [0.43 to 0.72] W/m²**. That is what is drawn here - four shares of one whole, on
one basis, adding to all of it.

⚠ **The field is still not drawn, and this is not it.** A 0-2000 m ocean heat grid is a
map; the top-of-atmosphere imbalance is not a surface field at all, and neither is drawn.
What is drawn is the *partition* - the answer to *where does it go* - which needs no grid
because it is not a place. It renders beside the globe for the same reason @LAT0LON-140
does.

⚠ **A second partition exists and is deliberately not blended in.** von Schuckmann et al.
(2023) give **ocean ~89%, land ~6%, cryosphere ~4%, atmosphere ~1%** over **2006-2020**,
with the imbalance at **0.76 ± 0.2 W/m²** for that period against **0.48 ± 0.1 W/m²** for
1971-2020. Those are a different period and a different assessment, and averaging them with
the AR6 set would produce a partition belonging to neither. One basis is declared in the
block and the other is recorded here, which is where a second estimate goes.

⚠ **This composition has a whole and @LAT0LON-140 does not.** The four shares are the
complete inventory and sum to 100%, so the bars are shares *of the whole*. Sea level's terms
are missing one, so there is no whole for them to be shares of and they are drawn against
the reference instead. The app reads which case it is from the store's `whole:` key, and the
legend prints what the terms actually account for - so a set that fails to add up says so
rather than looking tidy.

- WMO 2025 — https://wmo.int/news/media-centre/wmo-confirms-2025-was-one-of-warmest-years-record
- NOAA NCEI ocean heat content — https://www.ncei.noaa.gov/access/global-ocean-heat-content/
- Cheng et al. annual update — https://link.springer.com/article/10.1007/s00376-025-4541-3
- IPCC AR6 WGI Ch. 7, the Earth's energy budget — https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/
- von Schuckmann et al. 2023, ESSD — https://essd.copernicus.org/articles/15/1675/2023/

```ttdb-render
id: ocean-heat
label: Ocean Heat and Energy Imbalance
order: 6
status: implemented
kind: composition
basis: 1971-2018
unit: %
whole: 100
reference: ocean
readout: where the excess energy went
offglobe_note: a partition is not a place - the 0-2000 m field and the imbalance itself are still not drawn
term_columns: id, label, relation, value or factor, locus
term_note: measured - the term carries its own assessed share in unit. The other relations are at @LAT0LON-140, which has no whole and states its terms against a reference instead.
term: ocean | Ocean | measured | 91 | @LAT-50LON60
term: land | Land | measured | 5 | @LAT0LON0
term: ice | Ice sheets and glaciers | measured | 3 | @LAT-75LON-106.75
term: atmosphere | Atmosphere | measured | 1 | @LAT80LON0
source: IPCC AR6 WGI, Chapter 7 | https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/
source: NOAA NCEI ocean heat content | https://www.ncei.noaa.gov/access/global-ocean-heat-content/
bar: reference | #2f6a7a
bar: derived | #4f8c9c
bar: bound | #86b0bb
bar: empty | #6f6f6f
```

---

@LAT22.75LON-158 | created:1788912000 | updated:1788998400 | lane:render | relates:derived_from@LAT19.54LON-155.58
[ew]
conf:235
rev:1
sal:140
touched:1788998400
[/ew]

**Ocean Acidification** (Planned - the zonal quantity was found, and it is not on a drawable basis)
src: RESEARCH.md §8 (Ocean Acidification)

Station ALOHA, 22°45'N 158°W - the Hawaii Ocean Time-series site.

Mean surface ocean pH has fallen **~0.10–0.11 units** since pre-industrial, roughly 8.2 to
8.1 on the total scale. Because pH is logarithmic that is a **~30% increase in
hydrogen-ion concentration**.

Nearly as well understood as CO2 itself, and for the same reason: it is carbonate
chemistry, a laboratory-verifiable reaction driven by the record at
@LAT19.54LON-155.58, not an emergent model result. Two long time series pin it -
HOT/ALOHA here and BATS at 31.7°N 64.2°W.

**The zonal quantity exists: aragonite saturation, not pH.** pH is close to uniform across
latitude; **Ω_arag** is not, and it has a threshold that pH does not - **Ω = 1**, below
which aragonite dissolves. Jiang et al. (2015) give the climatology: surface Ω_arag in the
open ocean is **always supersaturated, 1.1 to 4.2**, **above 2.0 between 40°N and 40°S**
(2.0-4.2), falling **below 1.5 in polar areas**. That is a real poleward gradient with a
real edge, and it is the rendering this record wants.

⚠ **What stops it is the shape of the published numbers, twice over.** First, the gradient
is reported as **band ranges** - *2.0-4.2 between 40°N and 40°S*, *below 1.5 polar* - and a
`zonal-field` needs values *at latitudes*. Turning the former into the latter means
inventing the intermediate anchors, which is the one thing this store does not do. Second,
the decline is **-0.40 ± 0.37% per year** over 1989-1998 to 1998-2010, for waters shallower
than 100 m rather than the surface - a per-*year* rate, on a slightly different quantity,
and Ω is driven by dissolved CO2 rather than by temperature, so it cannot ride the slider
the way every drawn layer here does. A per-year rate run to 2126 is the same fault that
stops @LAT82LON-140.

**What would unblock it** is a zonal ladder of surface Ω at stated latitudes on one
climatology, and a sensitivity indexed either to the scenario or to atmospheric CO2 - which
is @LAT19.54LON-155.58, already in this store. Neither is a grid. This record's old blocker
asked for a gridded pH climatology and would have been satisfied by the wrong thing.

- NOAA — https://www.noaa.gov/education/resource-collections/ocean-acidification
- HOT / Station ALOHA — https://hahana.soest.hawaii.edu/hot/
- BATS — https://bats.bios.asu.edu/
- Observational synthesis — https://tos.org/oceanography/article/acidification-of-the-global-surface-ocean-what-we-have-learned-from-observations
- Jiang et al. 2015, Global Biogeochem. Cycles — https://agupubs.onlinelibrary.wiley.com/doi/10.1002/2015gb005198
- NOAA OA Program summary — https://oceanacidification.noaa.gov/oap_pubs/climatological-distribution-of-aragonite-saturation-state-in-the-global-oceans/

```ttdb-render
id: ocean-ph
label: Ocean Acidification
order: 7
status: planned
kind: field
blocker: pH is near-uniform; the zonal quantity is aragonite saturation, and its published form is band ranges rather than values at latitudes, with a per-year decline rate on a slightly different depth range. Needs a zonal ladder on one climatology plus a sensitivity indexed to CO2 or to the scenario - not the gridded pH climatology the old blocker asked for.
```

---

@LAT72.58LON-38.46 | created:1788912000 | updated:1789084800 | lane:render | relates:supports@LAT0LON-140,supports@LAT80LON0
[ew]
conf:240
rev:3
sal:170
touched:1788984000
[/ew]

**Greenland Ice Sheet** (Planned - and the first blocker here that survived being tested)
src: RESEARCH.md §9.1 (Greenland Ice Sheet)

Summit Camp, Greenland, 72.58°N 38.46°W.

| Period | Mean balance | Sea-level contribution |
|---|---|---|
| 1972–2025 | −107 Gt/yr | +16.0 mm |
| 2002–2025 (GRACE) | ~−264 Gt/yr | — |
| Sep 2024 – Aug 2025 | −129 ± 50 Gt | — |

The first two rows differ because the *periods* differ, not because the sources disagree:
the loss is concentrated in the satellite era. The 2025 balance came in about 9% below the
recent ~152 Gt/yr average, buffered by high spring and summer precipitation **despite
record spring and summer temperatures** - a clean illustration of why one year is not a
trend, and worth keeping in the record for exactly that reason.

`conf:240` because sign, size and mechanism are all settled here. Mass loss is *virtually
certain*; altimetry, gravimetry and the input-output method reconcile inside their stated
errors; and the balance is dominated by surface melt, which is measured where it happens.
What is *not* settled - the ice sheet's threshold behaviour over centuries - lies outside
this timeline and is not asserted by this record.

**`rev:2` marks a record that was carrying three subjects.** Until 2026-09-09 this was
*Ice Sheets and Glaciers* at `conf:225`: two ice sheets that share a phase and nothing else,
and a word in the title for a third term it held no number for. The ice sheets came apart
into this record and @LAT-75LON-106.75, scoring EPS **10** and **78** where together they
had scored 20 - a number belonging to neither. The word in the title took longer to honour:
mountain glaciers are @LAT67.9LON18.57, and they are larger than either ice sheet.

⚠ **This is the first blocker here to survive being tested, and it survives for a slightly
different reason than it gives.** Six others were checked by attempting the drawing and five
were wrong (@LAT51.58LON0.1). This one said *needs per-basin mass-balance geometry; one
number for an ice sheet is a number, not a map* - and the conclusion holds, but the binding
constraint is not the geometry. **IMBIE resolves Greenland as one ice sheet.** IMBIE-3
(Otosaka et al. 2023) reports **169 ± 9 Gt/yr over 1992-2020** for the whole of it and
publishes no drainage-basin table, and it does not quantify the split between surface melt
and ice discharge either, because only three input-output datasets overlap and they differ
by a median of 28.5 Gt/yr. So the drainage basins could be drawn tomorrow and there would be
nothing to colour them with.

That is why the route @LAT-75LON-106.75 took is closed here: Antarctica is drawn in sectors
because IMBIE *publishes* three of them with separate balances. And it is why the route
@LAT67.9LON18.57 took is closed too: glaciers are drawn as 19 regions because GlaMBIE
publishes 19 regions. **Greenland has no region set, and a rendering cannot invent one.**

**What is published instead is variability, and it is startling.** Within that 169 ± 9 Gt/yr
mean, IMBIE-3 records annual loss ranging from **86 Gt/yr in 2017 to 444 Gt/yr in 2019** -
a factor of five between two years two years apart. A single mean over this record hides
that completely, which is the same fault @LAT26.6LON-70.1 describes, appearing here in
*time* rather than in subject. Recorded, not drawn: this timeline steps in 30-year normals
and cannot show a two-year swing without claiming a resolution it does not have.

- Copernicus ice-sheet indicators — https://climate.copernicus.eu/climate-indicators/ice-sheets
- NOAA Arctic Report Card 2025 — https://arctic.noaa.gov/report-card/report-card-2025/greenland-ice-sheet-2025/
- IMBIE — https://imbie.org/ · GRACE-FO — https://grace.jpl.nasa.gov/
- IMBIE-3, Otosaka et al. 2023, ESSD — https://essd.copernicus.org/articles/15/1597/2023/
- IMBIE drainage basins — https://imbie.org/imbie-3/drainage-basins/

```ttdb-render
id: greenland-ice
label: Greenland Ice Sheet
order: 8
status: planned
kind: mass
blocker: IMBIE resolves Greenland as ONE ice sheet - 169 ± 9 Gt/yr over 1992-2020, no drainage-basin table, and no quantified split between surface melt and discharge. So the basins could be drawn and there would be nothing to colour them with. Unlike @LAT-75LON-106.75 and @LAT67.9LON18.57, there is no published region set to compose. Needs a regional table, not geometry.
```

---

@LAT-75LON-106.75 | created:1788976800 | updated:1788998400 | lane:render | relates:supports@LAT0LON-140,revises@LAT72.58LON-38.46
[ew]
conf:150
rev:1
sal:190
touched:1788998400
[/ew]

**Antarctic Ice Sheet** (Implemented - three sectors, and the largest of them has no sign)
src: RESEARCH.md §9.2 (Antarctic Ice Sheet)

Thwaites Glacier, Amundsen Sea Embayment, 75°S 106.75°W - the grounding zone that most
constrains the number, and the one the projections disagree about.

| Sector | Period | Mean balance |
|---|---|---|
| Antarctica, all | 1979–2024 | −105 Gt/yr, +13.5 mm sea level |
| Antarctica, all | 2002–2025 (GRACE) | ~−135 Gt/yr |
| West Antarctica | 1992–1997 → 2012–2017 | −53 ± 29 → −159 ± 26 Gt/yr |
| Antarctic Peninsula | 1992–2017 | ~−20 Gt/yr |
| **East Antarctica** | **1992–2017** | **+5 ± 46 Gt/yr** |

The last row is why this is a record of its own. East Antarctica holds most of the ice, and
its uncertainty is **nine times its estimate** - IMBIE could not resolve the *sign* of its
balance, because the spread among surface-mass-balance and glacial-isostatic-adjustment
models is larger than the signal. The loss that is measured is real and is almost all West
Antarctica and the Peninsula, tripling in twenty-five years, driven by grounding-line
retreat and lost ice-shelf buttressing rather than by surface melt. Averaging that with a
near-zero balance of unresolved sign produces a continental number that describes no part
of the continent.

`conf:150` against Greenland's `conf:240` is the whole justification for splitting them.
AR6 carries the Antarctic contribution as **deep uncertainty**: the processes that set its
high end - marine ice sheet instability, and marine ice cliff instability on *limited
evidence and low agreement* - are held in a separate low-confidence projection rather than
folded into the likely range, and on their account a rise **approaching 2 m by 2100 and 5 m
by 2150 under SSP5-8.5 "cannot be ruled out"**. That is a different epistemic object from
Greenland's well-reconciled melt, and one `conf` cannot carry both.

`sal:190`, `conf:150`, so **EPS = 190 x (255 − 150) / 255 = 78** - third in this store,
behind AMOC and permafrost, ahead of every other layer now drawn. Averaged into Greenland it
read **20**, the score of a settled record, and nobody would have looked twice. Nothing
about the ice changed when this record appeared. The uncertainty was always there; it was
hiding inside a mean.

⚠ **A high EPS is still not permission to draw it - but the blocker was narrower than it
read.** It said a balance whose *sign* is unresolved has no honest colour, and that is
true and stays true. What it did not say is that such a balance has no honest **hatch**.
This is the `@LAT26.5LON-70` move rotated from time into space: the collapse there is
drawn stationary and stippled because it has no date, and East Antarctica is drawn here
hatched and uncoloured because it has no sign. The ramp carries West and the Peninsula,
whose loss is measured, and stops at the sector boundary.

⚠ **The sectors are longitude ranges, not drainage basins.** IMBIE's three regions are
defined by ice divides; what is drawn here is the coarsest possible approximation of them -
a longitude cut, at the same schematic fidelity as the coastlines. The Peninsula lies
inside West's longitude range, so the sectors are tested in declared order and the first
match wins, which the block says in `sector_note`. A per-basin rendering would still need
the basin geometry; this one claims only which third of the continent a point is in.

⚠ **It does not move under the slider, and that is the point.** AR6 holds the Antarctic
contribution as *deep uncertainty*, so indexing these balances to global mean temperature
would manufacture exactly the projection the record exists to refuse. The layer draws
measured period means and the readout says the year does not apply to them.

- IMBIE, Shepherd et al. 2018, Nature — https://www.nature.com/articles/s41586-018-0179-y
- IMBIE-3, Otosaka et al. 2023, ESSD — https://essd.copernicus.org/articles/15/1597/2023/
- IPCC AR6 WGI Ch. 9 — https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
- Copernicus ice-sheet indicators — https://climate.copernicus.eu/climate-indicators/ice-sheets

```ttdb-render
id: antarctic-ice
label: Antarctic Ice Sheet
order: 9
status: implemented
kind: sector-field
domain: land
hemisphere: south
opacity: 0.5
lat_limit: -60
unit: Gt/yr
readout: mass balance by sector
undated_note: measured period means, not a projection - the slider does not apply to them
sector_columns: id, label, lon_from, lon_to, period, value Gt/yr, uncertainty Gt/yr, state
sector_note: tested in declared order, first match wins, because the Peninsula lies inside West's longitude range. Longitude approximations of IMBIE's regions, not the drainage basins themselves.
sector: peninsula | Antarctic Peninsula | -75 | -55 | 1992-2017 | -20 | na | resolved
sector: west | West Antarctica | -180 | -30 | 2012-2017 | -159 | 26 | resolved
sector: east | East Antarctica | -30 | 180 | 1992-2017 | 5 | 46 | unresolved
unresolved_tone: #97a0aa
unresolved_label: sign unresolved
source: IMBIE, Shepherd et al. 2018 | https://www.nature.com/articles/s41586-018-0179-y
source: IMBIE-3, Otosaka et al. 2023 | https://essd.copernicus.org/articles/15/1597/2023/
stop: -200 | #6a1c14
stop: -100 | #c74f2e
stop: -40 | #e2af4b
stop: 0 | #ece9e0
```
---

@LAT67.9LON18.57 | created:1788984000 | updated:1789084800 | lane:render | relates:supports@LAT0LON-140,revises@LAT72.58LON-38.46
[ew]
conf:235
rev:1
sal:180
touched:1789084800
[/ew]

**Mountain Glaciers** (Implemented - the 19 regions the science is published in, not a map)
src: RESEARCH.md §9.3 (Mountain Glaciers)

Storglaciären, Tarfala, 67.90°N 18.57°E - the longest unbroken glacier mass-balance series
on Earth, measured every year since 1946. It holds nothing like the most ice; it is where
the method was invented and where it has never once stopped, which is what a locus is for.

| Quantity | Period | Value |
|---|---|---|
| Mass lost | 2000–2023 | **6 542 Gt** |
| Sea-level contribution | 2000–2023 | **18 mm**, at 0.75 mm/yr |
| Mean rate | 2000–2023 | **273 Gt/yr** |
| Rate change | 2000–2011 → 2012–2023 | **+36%** |
| Mean rate, independent | 2000–2019 | 267 ± 16 Gt/yr, 21 ± 3% of observed sea-level rise |
| Ice gone since 2000 | 2000–2023 | ~5% globally; 2% (Antarctic and Subantarctic islands) to 39% (Central Europe) |

**Glaciers outweigh both ice sheets.** GlaMBIE puts the 2000–2023 glacier loss about **18%
above Greenland's and more than twice Antarctica's**, which makes this the largest cryosphere
contribution to sea level, and the second largest contribution of any kind after the thermal
expansion of the ocean itself. It is also the term this store recorded last, and the one it
recorded worst: the record these were folded into was titled *Ice Sheets and Glaciers* and
carried, for the glaciers, a link and not one number.

`conf:235` transcribes how the observed number is now made. GlaMBIE is a community estimate -
233 regional estimates from about 450 contributors across 35 teams, reconciling glaciological
measurement, DEM differencing, altimetry and gravimetry - which is a stronger warrant than
any single method has. What it does not even out is *region*: some are sampled far better
than others, and nothing here claims otherwise.

**What comes next is assessed against temperature, not against a scenario.** Rounce et al.
(2023) give **26 ± 6% of 2015 mass lost at +1.5 °C** and **41 ± 11% at +4 °C**, and
**49 ± 9% to 83 ± 7% of glaciers gone by number** - the count falls much faster than the
mass, because the small ones go first. At the +2.7 °C of the COP26 pledges, 115 ± 40 mm of
sea level. Those are indexed to global mean temperature, which is exactly what @LAT80LON0
produces, so this layer *could* follow the scenario selector the way the zone bands do.
Nothing about time is what stops it.

⚠ **A map of them needs the ground, and that has not changed.** A glacier is a shape on a
mountain and there are about 200,000 of them. This app's world is a schematic coastline and
a latitude; it carries no topography, so it cannot say where a mountain is, let alone put
ice on one. **The Randolph Glacier Inventory outlines are still not loaded and no map is
drawn.**

**But the blocker said that was the rendering, and it was not.** GlaMBIE's own result is
reported for **19 predefined regions**, and a set of regions is not a map - it is a
composition, which this app has drawn since @LAT0LON-140. No outlines are needed to say how
much each region lost, because the regions are the unit the science is published in. The
blocker named the dataset a *different* rendering would have needed. It is the fifth time
that has happened here; see @LAT51.58LON0.1.

**What is drawn.** The 19 RGI regions, 2000-2023, by **mass-change rate in Gt/yr** - one
basis, one table, one paper. The bars carry the absolute rate and the figure beside each
carries something the bar cannot: **the share of that region's year-2000 ice that is now
gone.** The two disagree sharply and that is the point. **Alaska loses the most ice of
anywhere, 60.8 Gt/yr, and has lost 22% of its volume. Central Europe loses 2.0 Gt/yr, thirty
times less, and has lost 39% - more than any region on Earth.** The places losing the most
ice are not the places losing *their* ice.

**The parts check against the whole.** The 19 rates sum to about **270 Gt/yr** against the
paper's global **273 ± 16 Gt/yr**, and the app prints that sum beside the declared whole
rather than asserting it - so the arithmetic is visible and a mistranscribed region shows up
as a total that stops matching.

⚠ **Two published numbers for the smallest region.** The paper's abstract gives the range of
relative loss as **2% to 39%**; Table 1 gives the Antarctic and subantarctic islands as
**3%**. The drawn value is Table 1's, because Table 1 is the table being drawn, and the
discrepancy is recorded here rather than silently resolved.

⚠ **It does not move under the slider.** These are 2000-2023 means. Rounce et al. (2023)
*do* index glacier loss to global mean temperature - 26 ± 6% of 2015 mass at +1.5 °C,
41 ± 11% at +4 °C - which is what @LAT80LON0 produces, so a scenario-following version is
possible and is a different rendering from this one. This layer draws what was measured.

- GlaMBIE, community estimate 2000–2023, Nature 2025 — https://www.nature.com/articles/s41586-024-08545-z
- Hugonnet et al. 2021, Nature — https://www.nature.com/articles/s41586-021-03436-z
- Rounce et al. 2023, Science — https://www.science.org/doi/10.1126/science.abo1324
- WGMS — https://wgms.ch/ · GlaMBIE data — https://wgms.ch/data_glambie/
- Randolph Glacier Inventory (not loaded) — https://www.glims.org/RGI/
- Tarfala Research Station, Stockholm University — https://www.su.se/english/divisions/tarfala-research-station/research/our-research-at-tarfala

```ttdb-render
id: glaciers
label: Mountain Glaciers
order: 10
status: implemented
kind: composition
basis: 2000-2023
unit: Gt/yr
whole: 273
reference: alaska
aux_unit: %
aux_label: of that region's year-2000 ice, gone
readout: RGI regions by mass-change rate
offglobe_note: regions are not a map - the glacier outlines are still not loaded and none is drawn
term_columns: id, label, relation, value Gt/yr, locus, aux - percent of the region's year-2000 ice lost
term_note: every term is measured, from Table 1 of the GlaMBIE paper. The bar is the rate; the figure beside it is the relative loss, which is a different quantity about the same region and is never summed into the bar.
term: alaska | Alaska | measured | 60.8 |  | 22
term: greenland-periphery | Greenland periphery | measured | 35.1 |  | 11
term: arctic-canada-n | Arctic Canada north | measured | 30.5 |  | 8
term: southern-andes | Southern Andes | measured | 26.5 |  | 10
term: arctic-canada-s | Arctic Canada south | measured | 23.1 |  | 12
term: antarctic-islands | Antarctic and subantarctic islands | measured | 16.9 |  | 3
term: russian-arctic | Russian Arctic | measured | 16.1 |  | 7
term: svalbard | Svalbard and Jan Mayen | measured | 13.7 |  | 8
term: central-asia | Central Asia | measured | 10.4 |  | 8
term: western-canada-usa | Western Canada and USA | measured | 9.0 |  | 23
term: iceland | Iceland | measured | 8.3 |  | 20
term: south-asia-east | South Asia east | measured | 7.3 |  | 16
term: south-asia-west | South Asia west | measured | 5.4 |  | 9
term: central-europe | Central Europe | measured | 2.0 |  | 39
term: scandinavia | Scandinavia | measured | 1.7 |  | 11
term: north-asia | North Asia | measured | 1.3 |  | 23
term: low-latitudes | Low latitudes | measured | 0.8 |  | 20
term: new-zealand | New Zealand | measured | 0.8 |  | 29
term: caucasus | Caucasus and Middle East | measured | 0.7 |  | 35
source: GlaMBIE, Nature 2025, Table 1 | https://www.nature.com/articles/s41586-024-08545-z
source: WGMS GlaMBIE | https://wgms.ch/data_glambie/
bar: reference | #3f6fa8
bar: derived | #6d97c4
bar: bound | #9ab4d0
bar: empty | #6f6f6f
```

---

@LAT68.75LON161.4 | created:1788912000 | updated:1788912000 | lane:render | relates:derived_from@LAT80LON0,supports@LAT26.5LON-70
[ew]
conf:110
rev:0
sal:170
touched:1788912000
[/ew]

**Permafrost** (Implemented - extent only; second-highest EPS here)
src: RESEARCH.md §10 (Permafrost)

North-East Science Station, Chersky, 68.75°N 161.4°E.

Permafrost underlies up to **21 million km²** of Northern Hemisphere land, and those soils
hold roughly **twice the carbon of the atmosphere** and three times that of land plants.
AR6 assesses that near-surface (top 3 m) permafrost volume falls **~25% per 1 °C** of
global warming.

The extent is well measured; the feedback is not. AR6 gives **high confidence that warming
releases permafrost carbon and low confidence in the timing and size** of that release,
and `conf:110` here is that split transcribed rather than averaged - the number tracks the
part that is uncertain, because that is the part a rendering would be asserting.

**What is drawn is extent, and only extent.** The layer reads the assessed **~25% per 1 °C**
loss of near-surface volume as a loss of *area* in a zonal schematic: permafrost occupies
everything poleward of `extent_edge`, and its boundary moves north until the remaining
spherical cap is the remaining fraction. That is one simplification on another. Real
permafrost is patchy - continuous, discontinuous, sporadic, isolated - it reaches far south
of 66.5° in central Siberia and nowhere near it in Scandinavia, and volume is not area.
`uncertainty_band` draws the boundary as a 4° fade rather than a line, which is about the
honest width. The rate is assessed near present-day warming; the app clamps the remaining
fraction at zero and claims no linearity past that.

**The carbon feedback is not drawn at all**, and that is what `conf:110` is for. Nothing in
this layer says how much of the carbon comes out, or when. The layer moves a boundary; the
number that matters has no boundary to move.

- IPCC AR6 WGI Ch. 9 — https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
- Schuur et al., Annu. Rev. Environ. Resour. — https://www.annualreviews.org/doi/10.1146/annurev-environ-012220-011847
- NSIDC, frozen ground and permafrost — https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost
- NOAA Arctic Report Card 2025 — https://arctic.noaa.gov/report-card/report-card-2025/

```ttdb-render
id: permafrost
label: Permafrost
order: 11
status: implemented
kind: zonal-extent
domain: land
hemisphere: north
opacity: 0.35
extent_decline_per_c: 0.25
reference_year: 2005
extent_edge: 66.5
uncertainty_band: 4
readout: near-surface permafrost extent, against its 2005 area
source: IPCC AR6 WGI, Chapter 9 | https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
source: NSIDC, frozen ground | https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost
stop: 1.0 | #4a5a7a
stop: 0.7 | #5a7a9a
stop: 0.5 | #7a9aba
stop: 0.0 | #ffffff
```

---

@LAT26.5LON-70 | created:1788912000 | updated:1788912000 | lane:render | relates:derived_from@LAT72.58LON-38.46,contradicts@LAT0LON0
[ew]
conf:90
rev:0
sal:200
touched:1788912000
[/ew]

**AMOC — Atlantic Meridional Overturning Circulation** (Implemented - the highest-EPS record in this store)
src: RESEARCH.md §11 (AMOC)

The RAPID array, 26.5°N.

IPCC AR6 WGI Chapter 9, quoted rather than paraphrased:

- The AMOC is **very likely to decline over the 21st century under all SSP scenarios** -
  high confidence in the direction, from process understanding.
- **Low confidence in the magnitude** of that decline.
- **Only medium confidence** that the decline will not involve an abrupt collapse before
  2100. Collapse is unlikely but cannot be ruled out with high confidence.
- Confidence in reconstructed and modelled 20th-century AMOC change is **low**, and that
  is what propagates into the low confidence in the projections.

The `contradicts` edge to @LAT0LON0 is not rhetorical. The temperature-zone rendering
assumes zones migrate **smoothly poleward with global mean temperature**. An AMOC collapse
would cool north-west Europe while the globe warms - a zone moving *equatorward* against a
rising global mean. Zonal migration is the right first model and the wrong model in the
one case that matters most, and the store carries the objection instead of the app
quietly outrunning it.

`conf:90`, `sal:200`, so **EPS = 200 x (255 − 90) / 255 = 129** - about triple the next
record and the highest in this store. That is the whole argument of TTDB-RFC-0005 in one
example: ranked by how good a layer would look, this comes last; ranked by EPS it comes
first, and EPS is right. It was built first.

**What is drawn is a distribution, not a state.** Each `traj` line carries three numbers,
`low mean high`, as fractions of the present transport; the layer colours the band at 26.5°N
by the *mean* and prints the spread beside it - the spread being what AR6's *low confidence
in the magnitude* refers to. The trajectory does **not** branch with the emissions scenario
at @LAT80LON0, and that is a decision rather than an omission: AR6 assesses the decline as
*very likely under all SSP scenarios*, so a curve that moved with the scenario would assert
a scenario-dependence the assessment does not.

**The collapse is drawn, and drawn without a date.** Everything above interpolates between
year anchors, and interpolation is a claim that the quantity moves smoothly from one anchor
to the next - which is exactly the assumption an abrupt collapse breaks. So the collapse is
not a sixth `traj` line. `branch_values` declares one state carrying **no year at all**, and
the app draws it as what it is: switched on, the stipple at 26.5°N is the same at every
position of the slider, so that it cannot be read as the value for the year on screen. A
slider moving under a stationary stipple is the shape of the assessment - *it cannot be
ruled out; nothing here says when*.

**And it carries no estimate, so none is drawn.** Every `traj` line has three columns and a
mean in the middle. `branch_values` has **two**, and the missing middle is the point: AR6
assesses no collapsed value, so a mean here would be a number this store invented. The band
is drawn as a slow sweep between the two ends of the range - it never rests, because there
is nothing to rest on - and under `prefers-reduced-motion` the lattice carries both ends at
once instead. The period of the sweep is arbitrary and means nothing; a viewer who reads a
tempo into it is reading something that is not there, which is why the record says so here.

The two ends are **0.00 and 0.30 of present transport**, and they are the span of the
experiments rather than an assessed range: a total shutdown, and the residual **~5 Sv** that
eddies sustain in a strongly-eddying ocean-only model against a present ~17 Sv. The `low`
bound of the smooth decline - 0.48 at 2126 - is a fast decline and is not this.

⚠ **Two things are still not drawn.** The **date** is one, and it is a refusal rather than
a gap: nothing assessed supports a distribution over when, so the layer says so by not
moving. The other is the **consequence**. A collapse cools north-west Europe while the globe
warms - the `contradicts@LAT0LON0` edge in physical form, and the reason this record
contradicts the zone layer at all - and drawing it needs a regional temperature field this
app does not have. What is on the globe is the transport; what carries the consequence is
this record.

- IPCC AR6 WGI Ch. 9 — https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
- RAPID array — https://rapid.ac.uk/
- van Westen, Kliphuis & Dijkstra 2024, Sci. Adv. — https://www.science.org/doi/10.1126/sciadv.adk1189
- van Westen & Dijkstra 2025, Geophys. Res. Lett. (the collapsed state in an eddying model) — https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024GL114532
- Kilbourne et al. 2022, Phil. Trans. R. Soc. A — https://royalsocietypublishing.org/rsta/article/381/2262/20220193/41326/Can-we-trust-projections-of-AMOC-weakening-based
- Background only, cited by nothing above: *Atlantic meridional overturning circulation*,
  Wikipedia — https://en.wikipedia.org/wiki/Atlantic_meridional_overturning_circulation

```ttdb-render
id: amoc
label: AMOC (Atlantic Overturning)
order: 12
status: implemented
kind: distribution-transport
domain: point
reference_year: 2005
reference_strength: 17
band_halfwidth: 2
readout: overturning at 26.5°N, against its 2005 strength
traj_columns: low mean high, as a fraction of present transport
traj: 2026 | 0.95 0.95 1.00 | observed
traj: 2050 | 0.78 0.82 0.87 | projected
traj: 2075 | 0.60 0.72 0.75 | projected
traj: 2100 | 0.52 0.66 0.68 | projected
traj: 2126 | 0.48 0.63 0.66 | extended
branch_id: collapse
branch_label: Show the outcome that cannot be ruled out
branch_columns: low high, as a fraction of present transport - two ends and no middle, because no middle is assessed
branch_values: 0.00 0.30
branch_readout: undated - an outcome, not a projection for this year
branch_note: AR6 gives only medium confidence that the decline does not involve an abrupt collapse before 2100, and no distribution at all over when one would happen. So it is drawn with no date: stippled, and unmoved by the slider. It has no assessed central value either, so it is drawn as a slow sweep between the two ends of its range and never rests on a number. The ends are a total shutdown, and the residual ~5 Sv that eddies sustain in a strongly-eddying ocean model against a present ~17 Sv - the span of the collapse experiments, not an assessed range. The sweep's period is arbitrary and means nothing; only its two ends do.
source: IPCC AR6 WGI, Chapter 9 | https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/
source: RAPID array at 26.5N | https://rapid.ac.uk/
source: van Westen et al. 2024, tipping in CESM | https://www.science.org/doi/10.1126/sciadv.adk1189
stop: 1.0 | #dc143c
stop: 0.8 | #ff8c00
stop: 0.6 | #ffd700
stop: 0.4 | #87ceeb
stop: 0.0 | #1e40af
```

---

@LAT26.6LON-70.1 | created:1788912000 | updated:1788976800 | lane:belief | relates:supports@LAT26.5LON-70,derived_from@LAT0LON0,revises@LAT72.58LON-38.46
[ew]
conf:200
rev:1
sal:70
touched:1788976800
[/ew]

**BELIEF — The store's own EPS names the next rendering to build, and it is not the pretty one.**

Computed across every record here, maximum EPS belongs to @LAT26.5LON-70 (AMOC):
200 x (255 − 90) / 255 = 129. Second is @LAT68.75LON161.4 (Permafrost) at
170 x (255 − 110) / 255 = 97. Third is @LAT-75LON-106.75 (Antarctic Ice Sheet) at
190 x (255 − 150) / 255 = 78. Every other record scores under 45; CO2, the best-measured
quantity in the set, scores **4**.

The ordering is the mechanism working as specified. CO2 has nothing to learn and scores
near zero. AMOC is the most consequential and the least settled, so it gets loud. A
roadmap written by eye would have ranked these by how good the layer looks on a globe,
which is the exact inversion.

**`rev:1`: the third place did not exist when this record was written, and the ice did not
change.** Antarctica was inside @LAT72.58LON-38.46, averaged with Greenland into one
*Ice Sheets and Glaciers* record scoring 20. Splitting it produced 10 and 78 out of the
same evidence. EPS is computed per record, so **the granularity of a record is a modelling
choice the metric cannot see through**: merge a settled thing with an unsettled thing and
the mean reads settled, and the store goes quiet about the part worth attending to. That is
this mechanism's failure mode, and no weight in the file reveals it - only noticing that
one record is carrying two subjects does. AMOC ranks first either way, which is why the
split changed the roadmap's third line and not its first.

This record sits one-tenth of a degree from its subject rather than in a belief *lane*.
Why that had to change is @LAT0.1LON0.1.

---

@LAT51.78LON0.3 | created:1789128000 | updated:1789128000 | lane:belief | relates:refines@LAT51.48LON0,supports@LAT51.68LON0.2,supports@LAT0LON0
[ew]
conf:195
rev:0
sal:205
touched:1789128000
[/ew]

**BELIEF — A payload is one key, and the test that keeps this store honest polices keys.**

Lever 5 in README.md proposed embedding a coarse grid in the store and priced itself: *"the
cost is exact and it is not size."* It was right that size is not the cost, and it named the
wrong cost anyway.

**The size claim holds, and it never needed the raster to settle it.** 2 592 cells at 5°,
six symbols, pack into 3 bits each: **972 B, or 1 296 B base64, incompressible and
independent of content** - single-digit kilobytes for any such grid whatever it contains,
provable without downloading anything. Measured on the grids this repository already holds it
is smaller: the land/ocean mask rasterised from the coastlines run-length-encodes to **476 B**
base64, and so does the zonal class field over land - the same figure, and not a coincidence,
because a class that depends only on latitude is constant across a row, so both fields break
into runs at exactly the same places. `tools/grid_payload.mjs` re-runs it.

⚠ **Those measurements are a floor, not an estimate.** Both fields are latitude-banded or
nearly so, so their runs lie along rows: the zonal field costs 476 B row-major against
**1 308 B column-major**, a 2.7x spread from re-ordering the identical cells - and the
column-major figure is *worse than not compressing at all*. A real Köppen grid varies with
longitude, which is the entire reason to want one, so it has neither field's structure and
lands near the bound rather than near the measurement.

**The cost the lever named is already paid, twice, and in the runtime.** *A rendering is a
pure function plus a block becomes plus a payload* describes something that has already
happened: `index.html` carries **15 hand-authored coastline polygons, 240 vertices, at
roughly 5° fidelity**, and @LAT-75LON-106.75 added a West/East longitude split that its own
record puts *at the same schematic fidelity as the coastlines*. The app also **already builds
a grid** - a land mask at
1°, **65 160 cells, 25 times the 2 592 the lever proposes**, rebuilt at every load. This app
has been grid-based inside since before the lever was written. Embedding would not change
whether a grid exists. It changes whether its cells are **derived or shipped**, and 240
vertices can be checked against a map by eye while 2 592 base64'd cells cannot.

⚠ **The real cost is that the suite cannot see a payload, and this was tested rather than
argued.** The load-bearing rule in tests/docs.test.mjs is *every key whose value is numbers
and nothing else must be named in index.html*. It polices **keys**, and a payload is one key.
Worse: base64 contains letters, so `numbersOnly` is false and a grid would be filed as a
**prose key and exempted outright**. Put a real 1 296-character `cells_5deg:` into a copy of
this store, read by nothing, and that rule **waves it through** - as the whole suite did,
until the guard below. Add one inert number beside it -
`decline_rate: 0.18` - and it **fails, and names it**. 2 592 unreadable numbers are invisible
to the check that a single number cannot get past.

That is what makes this a decision and not a preference. The corpus claim is falsifiable
because *delete a number from this file and the app loses that capability*, and the test is
what keeps that sentence from being decoration. A grid would be the first thing this store
could hold that the sentence does not reach: delete one cell of 2 592 and nothing fails - not
the suite, not the app, not the eye.

**So the grid is not embedded**, and the guard is in the suite rather than in this paragraph:
no line in a block may carry an unbroken non-URL token longer than 48 characters. The
longest legitimate one in the store today is **29** (`tools/sea_ice_sensitivity.mjs`); a 5°
grid is **1 296**. Anything in between is not a number a reader can check. Every line is
scanned and not only the `key: value` ones, because the obvious way past a per-key rule is to
wrap the payload across continuation lines - caught at 1 296 characters on one line and again
at 76 characters on seventeen.

⚠ **What the guard does not cover, said plainly rather than left to be discovered.** A
payload wrapped *narrower* than 48 characters still gets through, and no token-length rule can
close that. This makes embedding a grid a **deliberate act rather than an unnoticed one**,
which is all a guard against a design decision can honestly do - the decision is the record,
and the test only stops it happening by accident.

Building that guard turned up one more gap, latent rather than live. The load-bearing rule
reads key names as `[a-z_]+`, so a key with a **digit** in it is invisible to it - and the
obvious name for a payload is `cells_5deg`. The first attempt at the guard inherited that
pattern and let the payload straight through. No key in the store has a digit today, so
nothing is currently unchecked; the guard reads `[a-z0-9_]+` so that it does not share the
blind spot of the rule it exists to back up.

⚠ **Fourth instance of one shape, and the first of them in the test suite rather than in a
weight.** `conf` is a single scalar over a record that may hold several kinds of claim - found
in granularity at @LAT26.6LON-70.1, in blockers at @LAT51.58LON0.1, in provenance at
@LAT51.68LON0.2. Here the same fault is in **what checks the store**: one predicate per key, standing
over a value that could hold 2 592 claims. Every guard in this repository is a scalar
judgement about something that is not necessarily scalar.

**What this does not forbid.** A grid whose cells are *derived at load from a generator small
enough to read* is already how the coastlines work, and stays admissible - what closes is
shipped opaque cells, not gridded rendering. The provenance rule at @LAT51.68LON0.2 would not
have covered one anyway: a computed value declares *what re-runs it*, and for a grid
transcribed out of the 1 km archive that line would name a **125 MB download** rather than a
tool, which is not the promise `node tools/co2_amplitude.mjs` makes.

---

@LAT51.68LON0.2 | created:1789084800 | updated:1789084800 | lane:belief | relates:refines@LAT51.48LON0,supports@LAT51.58LON0.1,revises@LAT19.54LON-155.58
[ew]
conf:190
rev:0
sal:200
touched:1789084800
[/ew]

**BELIEF — Admitting a computed value costs one checkable number and buys a whole class of renderings.**

Until 2026-09-11 every number here was a transcription of somebody's assessment, and that
rule had never been written down because nothing had tested it. @LAT19.54LON-155.58 tested
it: the seasonal amplitude of CO2 is the one rendering that record wants, the ladder has
real rungs because station latitudes are exact, and **nobody publishes the amplitudes as an
assessed value.** They exist as monthly series. So the choice was to leave the best-measured
quantity in the store undrawn, or to compute.

**Computing was chosen, and the rule was written down rather than quietly broken**, as two
new `umwelt.constraints`: a computed value is never printed like a transcribed one, and it
declares its method and what re-runs it. The store now holds two kinds of number and says
which is which, in the same way it already separated a measurement from a model output.

**What it costs is checkability, and the cost is not theoretical.** A transcribed number is
verified by reading a document; a computed one only by recomputing it. The very first
computation was wrong: detrending by each year's mean leaves the secular rise inside the
year as a sawtooth of about 2.5 ppm, which is invisible against Barrow's 18 ppm cycle and
*is the entire answer* against the South Pole's 1 ppm - it returned 2.7 ppm peaking in
December, the trend wearing a seasonal cycle. It was caught by noticing that a December peak
at the South Pole is the wrong season, not by anything in this repository. **Nothing here
would have failed.** That is the standing exposure, and it is why `tools/co2_amplitude.mjs`
exists and why the block names it in `recompute:`.

⚠ **`conf` cannot carry two kinds of number, and this is the third place that has shown.**
CO2 held `conf:250` for the measurement; what it draws is arithmetic on the measurement,
whose failure mode the measurement does not have. Dropping it to 205 raised EPS from 4 to
39 - the metric behaving correctly, flagging a number with no source assessment behind it.
But the record still transcribes 427.09 ppm at full confidence in its prose, and one `conf`
describes both. @LAT26.6LON-70.1 found this in record *granularity* and @LAT51.58LON0.1
found it in *blockers*; here it is in **provenance**. Three findings, one shape: `conf` is a
single scalar over a record that may contain several kinds of claim.

**What this does not license.** Computing is admitted where the source series is public, the
method is standard, and the result is re-runnable - not as a way past a missing assessment
in general. @LAT22.75LON-158 is the test of that: its gradient is published as band ranges,
and interpolating rungs that nobody measured would be **inventing** data, not computing it.
The line is between arithmetic on a public series and filling a gap with a plausible shape.

---

@LAT51.58LON0.1 | created:1788998400 | updated:1788998400 | lane:belief | relates:refines@LAT51.48LON0,supports@LAT26.6LON-70.1,revises@LAT82LON-140,revises@LAT22.75LON-158,revises@LAT19.54LON-155.58
[ew]
conf:200
rev:0
sal:210
touched:1788998400
[/ew]

**BELIEF — A blocker names the dataset you imagined you needed, not the obstacle you hit.**

**Seven `blocker:` lines have now been examined by attempting the drawing rather than by
reading them. Five records came off the blocked list, one had its blocker rewritten and is
still blocked, and one survived.** Six of the seven obstacles were not the absence of the
dataset the blocker named.

| Record | The blocker said | What the attempt found |
|---|---|---|
| @LAT-75LON-106.75 | an unresolved sign has no honest colour | true - and it has an honest *hatch*. **Drawn.** |
| @LAT-50LON60 | needs the 0-2000 m OHC grid | the partition needs no grid; it is not a place. **Drawn.** |
| @LAT19.54LON-155.58 | needs the seasonal cycle or the flux map | the cycle was right; the block was provenance, not data. **Drawn.** |
| @LAT67.9LON18.57 | needs the RGI outlines and topography | the science is published in 19 *regions*, and a region set is a composition. **Drawn.** |
| @LAT82LON-140 | needs the monthly concentration grid | the grid was never needed; the area was one column away in the same file. **Drawn.** |
| @LAT22.75LON-158 | needs a gridded surface pH climatology | pH is not the zonal quantity. It would have been satisfied by the wrong thing. |
| @LAT72.58LON-38.46 | needs per-basin mass-balance geometry | **survives** - but because IMBIE publishes no basin table, so the geometry would have nothing to colour. |

Six of the seven named a **dataset**. The real obstacles were of three kinds and none of them
is one: a **mismatch of basis** - two numbers describing different quantities, different
periods, or a rate indexed to something the model does not carry - a **mismatch of
provenance**, where the number exists but not in the form this store admits, and twice **a
rendering that was never the one needed**: the grid, the outlines and the pH climatology are
all real datasets that a *different* drawing would have wanted.

⚠ **A rewritten blocker is not a corrected one. @LAT82LON-140 was wrong twice.** Its first
blocker asked for a concentration grid. Its second - written here, by this process - said the
published sensitivity *"is quoted for sea-ice AREA"*. The source says **"sea ice"** and names
no quantity; the distinction was this store's, asserted while correcting the record for
over-claiming. **The thing that caught it was not a better reading of the source.** It was
building the layer and checking it against the observation it should reproduce: back-
projected to 1979 it gave 6.9-7.7 million km² where NSIDC measured 4.58. A blocker rewritten
from the armchair is still an armchair blocker.

⚠ **The seventh is the important one, and it makes this belief stronger rather than weaker.**
@LAT72.58LON-38.46 held. Its conclusion was right; only its reason needed sharpening, from
*we lack the geometry* to *nobody publishes the numbers that geometry would carry*. A rule
that found every blocker wrong would be describing the checker, not the blockers. What the
seven together say is narrower and more useful: **a blocker is a hypothesis, roughly one in
seven survives contact, and the test is not reading harder - it is drawing the thing and
checking it against something it must already match.**

The pattern is not carelessness. A blocker is written at the moment the record is made,
which is the moment of *least* information about it: before the primitive is chosen, before
the numbers are put beside each other, before anyone has tried. It is a **hypothesis about
why something is hard**, and this store had been recording those hypotheses in the same
voice as its measurements - which is precisely the thing the umwelt forbids for climate
values and had never thought to forbid for its own reasons.

⚠ **The EPS mechanism cannot see this, and did not.** EPS ranks the uncertainty of a
record's *subject*; it is silent on the quality of the record's *stated reason*. The records
whose blockers proved wrong sit near the bottom of the store - @LAT82LON-140 at **13**,
@LAT22.75LON-158 at **11**, @LAT67.9LON18.57 at **14**, @LAT19.54LON-155.58 at **4** before
its conf was revised. The one blocker that **held**, @LAT72.58LON-38.46, scores **10** -
lower than three of the four that failed. The metric that has been right every time about
what to attend to carries no signal at all about whether a record's reason is sound, because
a blocker has no `conf` of its own. That is the same shape as @LAT26.6LON-70.1, where EPS
could not see that one record was carrying two subjects: **both are limits of the metric's
resolution, not of its ranking.**

What follows is a practice rather than a number: **a blocker is provisional until something
has been attempted against it**, and the attempt is cheap - each of the seven took an
afternoon, two needed no new data at all and the rest a single lookup. The roadmap in
README.md now prices levers by *the one thing each costs* instead of by the dataset each
names, which is this belief applied.

---

@LAT0.1LON0.1 | created:1788912000 | updated:1788912000 | lane:belief | relates:refines@LAT51.48LON0,contradicts@LAT26.6LON-70.1
[ew]
conf:185
rev:0
sal:110
touched:1788912000
[/ew]

**BELIEF — A geographic globe has no spare latitude, so lane discipline must be carried by a field, not by a coordinate.**

Every other store in this corpus reserves high latitudes as lanes: 90 timeline, 98 belief,
99 fixture, 100 provenance (TTDB-RFC-0010 §3 registers the whole allocation). That works
because the globe is a knowledge map and latitude means whatever the umwelt says.

Here latitude means latitude. There is no 98°N. The lane trick is not merely inconvenient,
it is **unavailable** - and the two escapes both fail: coordinates above 90 project back
onto the sphere mirrored in longitude and collide with real records, and −90 is already
spoken for as TTCP-RFC-0001 §8's South Pole marker, whose records "MUST NOT be displayed
as navigable records" - so meta records parked there would silently vanish from the globe
that is supposed to show them.

So this store declares an unknown header field, **`lane:`** (`meta` / `render` / `belief` /
`fixture`), which TTCP-RFC-0001 §4.2 requires readers to ignore and TTDB-RFC-0001 §5
requires updaters to preserve. The extension rule was already load-bearing; this is the
first store in the corpus that had to lean on it.

What is *lost* is real and worth stating: latitude lanes are self-describing to a reader
who knows the convention, and a `lane:` field is not - it is invisible in a viewer that
ignores unknown fields, which is every conformant viewer. What is gained is that beliefs
sit **beside their subjects**: @LAT26.6LON-70.1 is a tenth of a degree from the AMOC
record it is about, and on the globe it reads as adjacency rather than as filing. That
was not the goal; it fell out of the constraint, and it is better than the lane was.

The `contradicts` edge is not decorative - if this belief is right, the neighbouring
belief's *placement* is a workaround rather than a design, and a future store with a
proper lane mechanism should move it.

---

@LAT-54.42LON3.36 | created:1788912000 | updated:1788912000 | lane:fixture | relates:refines@LAT51.48LON0,duplicates@LAT88.8LON179.9
x_fixture: preserve-me-verbatim

**FIXTURE — Conformance test surfaces (deliberate). Bouvet Island.**

The most remote island on Earth holds the record that exists to be mishandled. It carries:

1. An edge to **@LAT88.8LON179.9, which does not exist** - a conforming viewer renders it
   grayed and dead, never a live anchor, and a conforming parser does not crash
   (TTCP-RFC-0001 §12).
2. An **unknown header field**, `x_fixture` - a conforming updater preserves it verbatim
   (TTDB-RFC-0001 §5). It is the same mechanism `lane:` depends on, tested here on purpose.
3. **No `[ew]` block** - weights must read as defaults: conf 128, sal 0, and therefore
   **EPS 0**.

If your implementation survives this record unchanged and un-crashed, it has passed the
failure paths a happy-path store never reaches.

---

@LAT-90LON0 | created:1788912000 | updated:1788998400 | lane:special | relates:

**SPECIAL — discovery off.**

Latitude exactly −90 is TTCP-RFC-0001 §8's South Pole marker: a special record, parsed
for its `ttdb-special` block and never displayed as a navigable record or drawn on the
globe. This store uses it to turn the discovery system off, so every record is treated as
already discovered.

That is a deliberate choice against the default. Discovery exists so a store can be
*explored* rather than spoiled, and for a store about someone's inner landscape that is
right. This one is a public reference about the Earth: a visitor who lands on it should
see all thirteen renderings and every source immediately, not earn them. The umwelt decides,
and this umwelt is a reference work.

It is also the mechanism @LAT0.1LON0.1 points at - the reason −90 could not be borrowed
as a meta lane is that it already means this.

```ttdb-special
kind: discovery_tour_off
```
