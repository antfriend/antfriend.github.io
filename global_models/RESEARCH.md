# Preliminary research — candidate renderings

Seed material for `global_models`. This is the **expansion**; the compressed form is
[global_memory_system_ttdb.md](global_memory_system_ttdb.md), where each record's `src:`
line names the section below that expands it (TTN-RFC-0004, "compress alongside, never
in place").

Nothing here is original research. Every number is quoted from a named source with a
link, and every number that is a *model output* rather than a *measurement* says so.
Where the app simplifies a source, the simplification is written down as a simplification
— see [§12 Known simplifications](#12-known-simplifications).

**Selection rule.** Thirteen candidate renderings, ordered by how well understood the
underlying process is. The ordering is not editorial: it is the `conf` field of each
record in the store, and the app displays it. Eleven are implemented; two are recorded
with their data and sources and are not yet drawn. Which one to build next is not a
matter of taste either — it is the highest `EPS = sal × (255 − conf) / 255`, and that is
currently **AMOC (§11)**, at EPS ≈ 129, roughly triple the next candidate.

---

## 1. Temperature Zones — Köppen-Geiger major classes *(implemented, default)*

The five major Köppen-Geiger classes: **A** tropical, **B** arid, **C** temperate,
**D** continental, **E** polar. Defined on 30-year climate normals of monthly mean
temperature and precipitation, so a "year" on the timeline means *the 30-year normal
centred on that year*, not a single year's weather.

**Authoritative data.** Beck et al. (2023), *High-resolution (1 km) Köppen-Geiger maps
for 1901–2099 based on constrained CMIP6 projections*, Scientific Data 10, 724. Historical
epochs 1901–1930, 1931–1960, 1961–1990, 1991–2020 from observation-based climatologies;
future epochs 2041–2070 and 2071–2099 from 42 CMIP6 models retained out of 67 for
plausible CO2-induced warming rates, across seven SSPs.

**Headline numbers, quoted:**

| Transition | Share of global land (ex-Antarctica) changing major class |
|---|---|
| 1901–1930 -> 1991–2020 | ~ 5 % *(observed)* |
| 1991–2020 -> 2071–2099, SSP1-2.6 | ~ 5 % |
| 1991–2020 -> 2071–2099, SSP2-4.5 | ~ 8 % |
| 1991–2020 -> 2071–2099, SSP5-8.5 | ~ 13 % |

⚠ These are not additive. A grid cell may change class twice, so "5 % + 8 %" is not the
1901–1930 -> 2071–2099 figure. The app quotes each transition separately and never sums
them.

**Data:** <https://www.gloh2o.org/koppen/> · **Paper:** <https://www.nature.com/articles/s41597-023-02549-6>
· **V1 (2018):** <https://www.nature.com/articles/sdata2018214>

**Why it is the default.** It is the only candidate whose native output is already a
*map of areas* rather than a time series or a global scalar — a translucent-area
rendering is the form the data comes in, not a form imposed on it.

---

## 2. Poleward migration — what moves the boundaries

The app shifts zone boundaries poleward as a function of global warming. Two cited
constraints set the sensitivity:

- **Tropical widening.** After correcting the metrics and reanalysis artefacts that
  produced the early 0.25–3° lat/decade spread, the observed rate is **0.25–0.5° latitude
  per decade**; annual-mean Hadley-cell edge estimates run 0.1–0.5° lat/decade.
  Staten et al. (2020), *Tropical Widening: From Global Variations to Regional Impacts*,
  BAMS 101(6). <https://journals.ametsoc.org/view/journals/bams/101/6/BAMS-D-19-0047.1.xml>
  · Grise & Davis (2020), ACP 20, 5249. <https://acp.copernicus.org/articles/20/5249/2020/>
- **Recent warming rate** ~ 0.2 °C/decade.

Dividing gives **1.25–2.5 ° latitude per °C**. The store uses **2.0 °lat/°C** and declares
the range alongside it, so the assumption is visible rather than buried.

**Polar amplification.** The high-latitude boundaries move further than the tropical ones
because high latitudes warm faster (see §3 for the amplification profile and the ratio
trap). The store applies a factor of 2.0 poleward of 45°, deliberately *below* the 2.5
anomaly ratio, because a zone boundary is set by an isotherm's *position* and the local
warming *rate* only converts into a position through the meridional temperature gradient.
**Nothing in the cited literature pins this factor.** It is the weakest constant in the
default rendering, it is flagged as such in the store, and it is the first thing to replace
when the Köppen raster goes in — at which point it disappears entirely, because the raster
carries the real boundaries.

**Global mean surface temperature anchors** (°C above 1850–1900), interpolated linearly
between:

| Year | dT | Tier | Source |
|---|---|---|---|
| 1926 | 0.15 | observed | HadCRUT5 / GISTEMP v4 / Berkeley Earth |
| 1950 | 0.20 | observed | " |
| 1975 | 0.28 | observed | " |
| 2000 | 0.65 | observed | " |
| 2015 | 1.00 | observed | " |
| 2024 | 1.48 | observed | WMO 2023–2025 consolidated 3-yr mean, ± 0.13 |

That half is one series: **the past does not branch**. The future half does, and the
selector picks the branch. All five are the illustrative SSPs of AR6 WGI Table SPM.1,
quoted as best estimates for the 20-year period each anchor centres, with that table's
*very likely* range in brackets:

| Scenario | 2050 (2041–2060) | 2090 (2081–2100) | 2126 **extended** |
|---|---|---|---|
| SSP1-1.9 very low | 1.6 (1.2–2.0) | 1.4 (1.0–1.8) | 1.2 |
| SSP1-2.6 low | 1.7 (1.3–2.2) | 1.8 (1.3–2.4) | 1.9 |
| SSP2-4.5 intermediate *(default)* | 2.0 (1.6–2.5) | 2.7 (2.1–3.5) | 3.3 |
| SSP3-7.0 high | 2.1 (1.7–2.6) | 3.6 (2.8–4.6) | 5.0 |
| SSP5-8.5 very high | 2.4 (1.9–3.0) | 4.4 (3.3–5.7) | 6.2 |

°C above 1850–1900. Every 2126 value is that branch's own 2050->2090 rate continued and
rounded to 0.1 °C, and **none of them is assessed**. **SSP1-1.9 falls after mid-century** —
1.6 at 2050 against 1.4 at 2090 — which is the table and not a slip; it is the only branch
that peaks inside the slider.

Single years for context: **2024 ~ 1.55 °C**, the first calendar year above 1.5 °C;
**2025 ~ 1.42 ± 0.12 °C** (Jan–Aug); 2015–2025 were the eleven warmest on record.
WMO *State of the Global Climate 2025*: <https://wmo.int/news/media-centre/wmo-confirms-2025-was-one-of-warmest-years-record>
· AR6 SPM: <https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/>

**What follows the selector.** Every layer that reads this series follows the choice: the
zone boundaries of §1 migrate less under SSP1-2.6, the permafrost boundary of §10 retreats
further under SSP5-8.5. **AMOC does not follow it, deliberately.** AR6 assesses that decline
as *very likely under all SSP scenarios*, so a curve that moved with the selector would
assert a scenario-dependence the assessment does not carry.

---

## 3. Surface Temperature Anomaly *(implemented)*

Zonal-mean warming relative to 1850–1900. Well constrained, three independent
observational products agree, and the *pattern* — Arctic maximum, Southern Ocean minimum —
is a robust model and observation result rather than a fitted curve.

Zonal amplification factors used — the ratio of the zonal-mean anomaly to the global-mean
anomaly, **both measured from 1850–1900**:

| Latitude | −90 | −60 | −30 | 0 | 30 | 60 | 70 | 90 |
|---|---|---|---|---|---|---|---|---|
| x global | 0.8 | 0.6 | 0.8 | 0.9 | 1.0 | 1.5 | 2.0 | 2.5 |

### Why the Arctic factor is 2.5 and not the 3.9 everyone quotes

These are two different quantities and conflating them was the one substantive error caught
while building this seed.

- **3.9 is a ratio of linear trends over 1979–2021** (Rantanen et al. 2022) — a single
  43-year window during which Arctic warming was unusually fast. Some analyses of recent
  decades reach ~5.
- **What this rendering multiplies is a cumulative anomaly since 1850–1900**, which needs a
  ratio of anomalies over that whole period. That is a smaller number.
- **CMIP6 puts the amplification index at 1.8–2.4 for future periods** and 2–3 for present
  conditions (Chylek et al. 2022), and NOAA's Arctic Report Card 2025 states Arctic
  temperature has risen **more than double the global rate since 2006**.

So the profile uses **2.5**, above the projected range and below the observed trend ratio.
The arithmetic that exposed the mistake: 3.9 × the 2126 global anomaly of 3.3 °C would have
drawn the Arctic at **+12.9 °C**, which no assessment supports, and it pinned the colour
ramp from about 2040 onward so the layer stopped changing. A rendering that saturates is a
useful alarm — it means a constant is being asked to do work it was not measured for.

**Sources:** HadCRUT5 <https://www.metoffice.gov.uk/hadobs/hadcrut5/> · NASA GISTEMP v4
<https://data.giss.nasa.gov/gistemp/> · Berkeley Earth <https://berkeleyearth.org/data/>
· NOAA NCEI <https://www.ncei.noaa.gov/access/monitoring/global-temperature-anomalies/>
· Rantanen et al. 2022 <https://www.nature.com/articles/s43247-022-00498-3>
· Chylek et al. 2022 <https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2022GL099371>
· NOAA Arctic Report Card 2025 <https://arctic.noaa.gov/report-card/report-card-2025/>

---

## 4. Atmospheric CO2 *(implemented - the seasonal breathing, computed)*

The best-measured quantity in the whole set, and the only one with a continuous
instrumental record kept by one method at one site since 1958.

- **2025 annual mean: 427.09 ppm.** <https://www.co2.earth/annual-co2>
- **May 2025 seasonal peak exceeded 430 ppm for the first time** — Scripps 430.2 ppm,
  NOAA GML 430.5 ppm, up 3.5 / 3.6 ppm on May 2024.
  <https://scripps.ucsd.edu/news/annual-carbon-dioxide-peak-passes-another-milestone>
- Record begins March 1958 (C. D. Keeling). NOAA GML trends:
  <https://gml.noaa.gov/ccgg/trends/> · Keeling Curve: <https://keelingcurve.ucsd.edu/>
- Pre-instrumental context from ice cores to 800 kyr: EPICA Dome C, Law Dome.
  <https://www.ncei.noaa.gov/products/paleoclimatology/ice-core>

**Rendering problem, and what was done about it:** CO2 is nearly uniform — the pole-to-pole
gradient is a few ppm against a 427 ppm background. Drawn as a translucent area it is a flat
shell and says nothing, and that stays true. What is drawn instead is the **seasonal
breathing**, the Northern Hemisphere biosphere inhaling each summer. The **flux map** —
sources and sinks — is a different dataset (Global Carbon Budget,
<https://globalcarbonbudget.org/>) and is still not drawn.

**The seasonal amplitude ladder — this store's first computed number.** Every other value
here is transcribed from an assessment. The per-station amplitudes are published only as
monthly series, so this ladder is computed by the store's own arithmetic, under a rule
adopted deliberately and written into `umwelt.constraints`.

- **Method:** NOAA GML CCGG surface flask monthly means — one programme for every site, so
  the ladder is on one basis — over **2013–2024**. Per site: detrend with a **centred
  13-term moving average**, average the residual by calendar month, take **max − min**.
  Six complete years per calendar month required, or the site is dropped.
  Re-run: `node tools/co2_amplitude.mjs`.
- **Result (ppm peak-to-trough):** ALT 82.5 °N **16.8** · BRW 71.3 °N **18.4** ·
  MHD 53.3 °N **15.3** · AZR 38.8 °N **11.5** · MLO 19.5 °N **7.0** · SMO 14.2 °S **1.4** ·
  CGO 40.7 °S **1.1** · PSA 64.8 °S **1.8** · SPO 90 °S **1.3**. Christmas Island was
  dropped (one qualifying year), leaving nothing between 19.5 °N and 14.2 °S.
- **Cross-check:** MLO ≈ 7 ppm against the ~6 ppm usually quoted, Barrow 18.4 inside the
  15–20 ppm usually quoted, South Pole ~1 ppm. The amplitude peaks over the **boreal belt**,
  not at the pole — BRW exceeds ALT — which is where the vegetation is.
- ⚠ **The first method was wrong.** Detrending by each year's mean leaves the ~2.5 ppm/yr
  secular rise inside the year as a sawtooth. Against Barrow's 18 ppm cycle it barely shows;
  against the South Pole's 1 ppm cycle it *was* the answer — 2.7 ppm peaking in December,
  the trend wearing a seasonal cycle. The moving average fixed it. Nothing in this
  repository would have caught it, which is the standing cost of admitting computed values.
- ⚠ `conf` fell **250 → 205** and EPS rose **4 → 39**: 250 described the measurement, and
  what is drawn is arithmetic on the measurement.

---

## 5. Sea Level Rise *(implemented - as a composition of its parts, not as a map)*

- 1993 rate ~ **2.1 mm/yr**; 2023 rate ~ **4.5 mm/yr** — the rate has roughly doubled in
  three decades. Total **+111 mm** over 1993–2023 satellite altimetry.
  <https://sealevel.nasa.gov/news/280/rate-of-sea-level-rise-doubled-over-30-years-new-study-shows/>
  · Hamlington et al. (2024), Comms. Earth & Environment
  <https://www.nature.com/articles/s43247-024-01761-5>
- Roughly two-thirds of recent rise is added water from melting ice; the rest is thermal
  expansion.
- **AR6 projection to 2100:** 0.28–0.55 m (SSP1-1.9) to 0.63–1.01 m (SSP5-8.5) relative to
  1995–2014. Interactive tool: <https://sealevel.nasa.gov/ipcc-ar6-sea-level-projection-tool>
  · AR6 WGI Ch. 9: <https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/>
- NOAA overview: <https://www.climate.gov/news-features/understanding-climate/climate-change-global-sea-level>

**Rendering note.** Sea level is *not* uniform — regional rates differ by a factor of
several. A globe rendering must show the altimetry field, not a single number; a
coastal-inundation rendering additionally needs elevation data (e.g. CoastalDEM,
Copernicus DEM) that the schematic outlines in this app cannot support.

---

## 6. Arctic Sea Ice *(implemented — on area, with a computed sensitivity)*

- September minimum trend **1979–2025: −12.1 % per decade** relative to the 1981–2010
  average (NSIDC, on *extent*).
- **September 2025: area 3.08, extent 4.75 million km²** (NSIDC Sea Ice Index monthly),
  and a **daily minimum extent of 4.60** on 10 September. Three different quantities.
- NSIDC notes **no significant trend in the September minimum over 2007–2025**, while every
  year after 2006 sits below every year before it — a step, then a plateau. Not drawn: one
  linear rate cannot show that shape.
- ⚠ **The published per-°C figure does not say which quantity it means.** Verbatim, via
  Stroeve & Notz (2018): *"3.3–4 million km2 of September Arctic sea ice are lost per °C of
  annual mean global warming"* (Niederdrenk & Notz 2018). **"Sea ice"** — not area, not
  extent. An earlier version of the store's record asserted it was area. It is not stated.
- **Regressed against this store's own gmst anchors, 1979–2025:** September **area** falls
  **1.96 ± 0.44** million km² per °C; September **extent** falls **3.03 ± 0.54**. The
  published 3.3–4.0 overlaps the *extent* range and misses *area* entirely.
- **So the sensitivity is computed**, on the quantity the layer draws: **1.5–2.4 million km²
  per °C** (95 % interval), with the anchor being the regression's **fitted** 2025 area
  **2.66** rather than the observed 3.08. Re-run: `node tools/sea_ice_sensitivity.mjs`.
- ⚠ **The check that mattered.** Built on the published figure and an area anchor, the layer
  back-projected 1979 at **6.9–7.7** million km² against a measured **4.58**. Rebuilt on the
  computed area rate it gives **4.4–5.4**, which contains it. A layer that cannot reproduce
  the observation it is fitted to is wrong, whatever its source says.
- AR6 defines *practically ice-free* as area **below 1 million km²** — *likely* at least once
  before 2050 under all five illustrative scenarios. Below that the layer prints the store's
  words instead of a number.

NSIDC 2025 analysis: <https://nsidc.org/sea-ice-today/analyses/2025-arctic-sea-ice-minimum-squeezes-ten-lowest-minimums>
· Sea Ice Index: <https://nsidc.org/data/g02135> · September monthly data:
<https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v4.0.csv>
· Stroeve & Notz 2018, ERL 13 103001: <https://iopscience.iop.org/article/10.1088/1748-9326/aade56>
· Area vs extent, NSIDC: <https://nsidc.org/learn/ask-scientist/what-difference-between-sea-ice-area-and-extent>
· IPCC AR6 WGI Ch. 9: <https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/>

---

## 7. Ocean Heat and Earth Energy Imbalance *(implemented — as the partition, not as a field)*

- **The global energy inventory, AR6 WGI Ch. 7, 1971–2018:** **ocean 91 %**, **land 5 %**,
  **ice sheets and glaciers 3 %**, **atmosphere 1 %**. The inventory grew by
  **435 [325 to 545] ZJ**, a heating rate of **0.57 [0.43 to 0.72] W m⁻²**. This is the set
  the layer draws — four shares of one whole, on one basis, summing to all of it.
- **A second partition, deliberately not blended in:** von Schuckmann et al. (2023) give
  **ocean ~89 %, land ~6 %, cryosphere ~4 %, atmosphere ~1 %** over **2006–2020**, with the
  imbalance **0.76 ± 0.2 W m⁻²** (2006–2020) against **0.48 ± 0.1 W m⁻²** (1971–2020).
  Different period and different assessment; averaging them would give a partition belonging
  to neither.
- The WMO *State of the Global Climate 2025* names **Earth energy imbalance** as a key
  indicator for the first time and reports it at a **record high in 2025**.
- ⚠ **The field is still not drawn.** A 0–2000 m ocean heat grid is a map, and the
  top-of-atmosphere imbalance is not a surface field at all. What is drawn is *where the
  energy went*, which needs no grid because it is not a place.
- Ocean heat content 0–2000 m: NOAA NCEI <https://www.ncei.noaa.gov/access/global-ocean-heat-content/>
  · Cheng et al. annual updates <https://link.springer.com/article/10.1007/s00376-025-4541-3>
- WMO: <https://wmo.int/news/media-centre/wmo-confirms-2025-was-one-of-warmest-years-record>
- IPCC AR6 WGI Ch. 7: <https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/>
  · von Schuckmann et al. 2023, ESSD: <https://essd.copernicus.org/articles/15/1675/2023/>

**Why it belongs in the set:** it is the closest thing to the *cause* term. Surface
temperature is what the imbalance has done so far; the imbalance is what is still owed.

---

## 8. Ocean Acidification *(planned)*

- Mean surface ocean pH has fallen **~ 0.10–0.11 units** since pre-industrial, roughly
  8.2 -> 8.1 on the total scale — a **~ 30 % increase in hydrogen-ion concentration**,
  because pH is logarithmic.
- Driven by the same CO2 as §4, through carbonate chemistry, which is why it is nearly as
  well understood: it is a laboratory-verifiable reaction, not an emergent model result.
- Time series: HOT/Station ALOHA (22.75 °N, 158 °W) <https://hahana.soest.hawaii.edu/hot/>
  · BATS (31.7 °N, 64.2 °W) <https://bats.bios.asu.edu/>
- NOAA: <https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification>
  · Observational synthesis: <https://tos.org/oceanography/article/acidification-of-the-global-surface-ocean-what-we-have-learned-from-observations>
- **The zonal quantity is aragonite saturation, not pH.** pH is close to uniform with
  latitude; **Ω_arag** is not. Jiang et al. (2015): surface Ω_arag in the open ocean is
  **always supersaturated, 1.1–4.2**, **above 2.0 between 40 °N and 40 °S** (2.0–4.2),
  falling **below 1.5 in polar areas**. The threshold **Ω = 1** is a real edge that pH does
  not have — and it is the rendering this record wants.
- Decline: **−0.40 ± 0.37 % yr⁻¹** (0.10 ± 0.09 in Ω) from the 1989–1998 decade to the
  1998–2010 decade, for waters shallower than 100 m.
- ⚠ **Not on a drawable basis.** The gradient is published as *band ranges*, not values at
  latitudes, and a `zonal-field` needs the latter — inventing the intermediate anchors is the
  one thing this store does not do. The decline is *per year*, on a slightly different depth
  range, and Ω tracks dissolved CO2 rather than temperature, so it cannot ride the slider.
  Unblocking needs a zonal ladder on one climatology plus a sensitivity indexed to CO2 or to
  the scenario — not a grid. See `@LAT22.75LON-158`.
- Jiang et al. 2015, Global Biogeochem. Cycles:
  <https://agupubs.onlinelibrary.wiley.com/doi/10.1002/2015gb005198>

---

## 9. Land Ice *(three records — two drawn, one blocked)*

Until 2026-09-09 this was one section and one store record, *Ice Sheets and Glaciers*. It is
now three. The two ice sheets are different physics measured to different confidence and one
`conf` could not carry both; the glaciers were a word in that title with no number under it,
and they turn out to be the largest of the three. Splitting the ice sheets is what made the
third gap visible, and §9.3 is what closed it.

### 9.1 Greenland Ice Sheet *(planned — the one blocker here that survived testing)*

⚠ **Tested by attempting the drawing, and it held — for a sharper reason than it gave.**
The blocker said *needs per-basin mass-balance geometry*. The conclusion is right, but the
binding constraint is not geometry: **IMBIE resolves Greenland as one ice sheet.** IMBIE-3
(Otosaka et al. 2023) reports **169 ± 9 Gt/yr over 1992–2020** for the whole of it, publishes
no drainage-basin table, and does not quantify the surface-melt / discharge split either —
only three input–output datasets overlap, and they differ by a median of **28.5 Gt/yr**.
So the basins could be drawn tomorrow and there would be nothing to colour them with.

That closes both routes the neighbours took: §9.2 is drawn in sectors because IMBIE
*publishes* three of them, and §9.3 as 19 regions because GlaMBIE publishes 19.
**Greenland has no published region set, and a rendering cannot invent one.**

⚠ **What is published instead is variability.** Inside that 169 ± 9 Gt/yr mean, IMBIE-3
records annual loss from **86 Gt/yr in 2017 to 444 Gt/yr in 2019** — a factor of five, two
years apart. Recorded, not drawn: this timeline steps in 30-year normals and cannot show a
two-year swing without claiming a resolution it does not have.

- IMBIE-3, Otosaka et al. 2023, ESSD: <https://essd.copernicus.org/articles/15/1597/2023/>
  · IMBIE drainage basins: <https://imbie.org/imbie-3/drainage-basins/>

| Period | Mean mass balance | Contribution to sea level |
|---|---|---|
| 1972–2025 | −107 Gt/yr | +16.0 mm |
| 2002–2025 (GRACE/GRACE-FO) | ~ −264 Gt/yr | — |
| Sep 2024 – Aug 2025 | −129 ± 50 Gt | — |

The first two rows differ because the periods differ, not because the sources disagree —
the loss is concentrated in the satellite era. The 2025 balance was ~9 % below the recent
~152 Gt/yr average, buffered by high spring and summer precipitation despite record spring
and summer temperatures: a good illustration of why one year is not a trend.

Store `conf:240`, `sal:170`, EPS 10. Mass loss is *virtually certain*; altimetry,
gravimetry and the input–output method reconcile within their stated errors; and the
balance is dominated by surface melt, which is measured where it happens.

### 9.2 Antarctic Ice Sheet

| Sector | Period | Mean mass balance |
|---|---|---|
| Antarctica, all | 1979–2024 | −105 Gt/yr, +13.5 mm sea level |
| Antarctica, all | 2002–2025 (GRACE/GRACE-FO) | ~ −135 Gt/yr |
| West Antarctica | 1992–1997 → 2012–2017 | −53 ± 29 → −159 ± 26 Gt/yr |
| Antarctic Peninsula | 1992–2017 | ~ −20 Gt/yr |
| East Antarctica | 1992–2017 | **+5 ± 46 Gt/yr** |

IMBIE (Shepherd et al. 2018) could not resolve the **sign** of the East Antarctic balance:
the spread among surface-mass-balance and glacial-isostatic-adjustment models exceeds the
signal there, and East Antarctica holds most of the ice. The loss that *is* measured is
almost entirely West Antarctica and the Peninsula — tripling across twenty-five years, and
driven by grounding-line retreat and lost ice-shelf buttressing rather than by surface melt.

AR6 carries the Antarctic contribution as **deep uncertainty**. Marine ice sheet
instability, and marine ice cliff instability on *limited evidence and low agreement*, are
assessed in a separate low-confidence projection rather than folded into the likely range;
on their account a rise approaching 2 m by 2100 and 5 m by 2150 under SSP5-8.5 "cannot be
ruled out".

Store `conf:150`, `sal:190`, **EPS 78** — third in the store, behind AMOC and permafrost,
ahead of every other layer now drawn. Merged with Greenland the pair read `conf:225`, EPS 20.
Nothing about the ice changed when they were separated.

Copernicus ice-sheet indicators: <https://climate.copernicus.eu/climate-indicators/ice-sheets>
· NOAA Arctic Report Card 2025: <https://arctic.noaa.gov/report-card/report-card-2025/greenland-ice-sheet-2025/>
· IMBIE: <https://imbie.org/> · Shepherd et al. 2018, Nature: <https://www.nature.com/articles/s41586-018-0179-y>
· IMBIE-3, Otosaka et al. 2023 (1992–2020): <https://essd.copernicus.org/articles/15/1597/2023/>
· GRACE-FO: <https://grace.jpl.nasa.gov/> · Glacier mass balance, WGMS: <https://wgms.ch/>

### 9.3 Mountain Glaciers *(implemented — the 19 published regions, not a map)*

**Drawn as a composition of GlaMBIE's 19 RGI regions, 2000–2023.** The bars are the
mass-change rate; the figure beside each is the share of that region's year-2000 ice now
gone — a different quantity about the same region, never summed into the bar. The regions
are the unit the science is published in, so no outlines and no topography are needed.
A map of glaciers still is not drawn, and the RGI outlines are still not loaded.

| Region | Gt/yr | % of its ice gone | | Region | Gt/yr | % |
|---|---|---|---|---|---|---|
| Alaska | 60.8 | 22 | | Iceland | 8.3 | 20 |
| Greenland periphery | 35.1 | 11 | | South Asia east | 7.3 | 16 |
| Arctic Canada north | 30.5 | 8 | | South Asia west | 5.4 | 9 |
| Southern Andes | 26.5 | 10 | | Central Europe | 2.0 | **39** |
| Arctic Canada south | 23.1 | 12 | | Scandinavia | 1.7 | 11 |
| Antarctic & subantarctic | 16.9 | **3** | | North Asia | 1.3 | 23 |
| Russian Arctic | 16.1 | 7 | | Low latitudes | 0.8 | 20 |
| Svalbard & Jan Mayen | 13.7 | 8 | | New Zealand | 0.8 | 29 |
| Central Asia | 10.4 | 8 | | Caucasus & Middle East | 0.7 | 35 |
| Western Canada & USA | 9.0 | 23 | | | | |

- **The two columns disagree, and that is the rendering.** Alaska loses the most ice
  anywhere — 30× Central Europe's rate — and has lost 22 % of its volume. Central Europe has
  lost **39 %**, more than any region on Earth. *The places losing the most ice are not the
  places losing their ice.*
- **The parts check against the whole.** The 19 rates sum to **≈ 270 Gt/yr** against the
  paper's global **273 ± 16 Gt/yr**; the app prints that sum beside the declared whole rather
  than asserting it, so a mistranscribed region shows up as a total that stops matching.
- ⚠ **Two published numbers for the smallest region.** The abstract gives the range as
  **2 %–39 %**; Table 1 gives the Antarctic and subantarctic islands as **3 %**. Table 1 is
  what is drawn, because Table 1 is what is being drawn.
- Global totals: **−6 542 ± 387 Gt**, **18 ± 1 mm** of sea level, **−273 ± 16 Gt/yr**, about
  **5 %** of global glacier volume.
- GlaMBIE, Nature 2025 (Table 1): <https://www.nature.com/articles/s41586-024-08545-z>
  · GlaMBIE data, WGMS: <https://wgms.ch/data_glambie/>

Everything land-ice that is not the two ice sheets: about 200,000 bodies, and between them
the largest of the three terms.

| Quantity | Period | Value |
|---|---|---|
| Mass lost | 2000–2023 | 6 542 Gt |
| Sea-level contribution | 2000–2023 | 18 mm, at 0.75 mm/yr |
| Mean rate | 2000–2023 | 273 Gt/yr, **+36 %** from 2000–2011 to 2012–2023 |
| Mean rate, independent | 2000–2019 | 267 ± 16 Gt/yr — 21 ± 3 % of observed sea-level rise |
| Ice gone since 2000 | 2000–2023 | ~5 % globally; 2 % (Antarctic and Subantarctic islands) to 39 % (Central Europe) |

GlaMBIE puts glacier loss about **18 % above Greenland's and more than twice Antarctica's**,
which makes glaciers the largest cryosphere contribution to sea level and the second largest
contribution of any kind, after the thermal expansion of the ocean. Store `conf:235`,
`sal:180`, EPS 14 — the estimate is a community reconciliation of 233 regional estimates
from ~450 contributors across 35 teams, spanning glaciological measurement, DEM
differencing, altimetry and gravimetry. What it does not even out is region: some are
sampled far better than others.

**Projections are indexed to temperature, not to a scenario.** Rounce et al. (2023): 26 ± 6 %
of 2015 mass lost at +1.5 °C, 41 ± 11 % at +4 °C, and 49 ± 9 % to 83 ± 7 % of glaciers gone
*by number* — the count falls much faster than the mass, because the small ones go first. At
the +2.7 °C of the COP26 pledges, 115 ± 40 mm of sea level. Since those are functions of
global mean temperature, this layer could follow the scenario selector exactly as the zone
bands do; time is not what blocks it. **Topography is.** A glacier is a shape on a mountain,
and this app's world is a coastline and a latitude — drawing it needs the Randolph Glacier
Inventory, which is a dataset the store cannot hold.

The locus is Storglaciären in Tarfala, northern Sweden, which holds nothing like the most
ice: it holds the longest unbroken mass-balance series on Earth, measured every year since
1946, and it is where the method was invented.

GlaMBIE, Nature 2025: <https://www.nature.com/articles/s41586-024-08545-z>
· Hugonnet et al. 2021, Nature: <https://www.nature.com/articles/s41586-021-03436-z>
· Rounce et al. 2023, Science: <https://www.science.org/doi/10.1126/science.abo1324>
· WGMS: <https://wgms.ch/> · Randolph Glacier Inventory: <https://www.glims.org/RGI/>
· Tarfala Research Station: <https://www.su.se/english/divisions/tarfala-research-station/research/our-research-at-tarfala>
---

## 10. Permafrost *(implemented — extent only)*

- Underlies up to **21 million km²** of Northern Hemisphere land.
- Northern permafrost soils hold roughly **twice the carbon of the atmosphere** and three
  times that of land plants.
- AR6: near-surface (top 3 m) permafrost volume falls by **~ 25 % per 1 °C** of global
  warming; **high confidence** that warming releases permafrost carbon, **low confidence in
  the timing and size** of that release.

**What the layer draws.** The 25 % per °C is a *volume* loss, and the rendering spends it as
*area*: permafrost occupies the spherical cap poleward of 66.5 °N, and the boundary moves
north until the remaining cap is the remaining fraction — 66.5 ° at the 2005 reference
epoch, ~69 ° at 2026, ~76 ° at 2126 under SSP2-4.5. Real permafrost is patchy (continuous,
discontinuous, sporadic, isolated), reaches far south of 66.5 ° in central Siberia and
nowhere near it in Scandinavia, and volume is not area; the 4 ° fade at the boundary is
about the honest width of the line. The rate is assessed near present-day warming, so the
app clamps the remaining fraction at zero rather than claiming linearity past it — which
the top branch reaches inside the slider. **The carbon feedback is not drawn at all.**

<https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/> · Schuur et al.,
Annu. Rev. Environ. Resour. <https://www.annualreviews.org/doi/10.1146/annurev-environ-012220-011847>
· NSIDC frozen ground <https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost>
· NOAA Arctic Report Card 2025 <https://arctic.noaa.gov/report-card/report-card-2025/>

---

## 11. AMOC — the highest-EPS record *(implemented, with an undated collapse)*

The Atlantic Meridional Overturning Circulation. IPCC AR6 WGI Chapter 9:

- The AMOC is **very likely to decline over the 21st century under all SSP scenarios** —
  high confidence in the qualitative direction, from process understanding.
- **Low confidence in the magnitude** of the decline.
- **Only medium confidence** that the decline will *not* involve an abrupt collapse before
  2100. A collapse is unlikely but cannot be ruled out with high confidence.
- Confidence in 20th-century reconstructed and modelled AMOC change is **low**, which is
  what propagates into the low confidence in projections.

<https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/> · RAPID array at 26.5 °N:
<https://rapid.ac.uk/> · Model-fidelity critique: Kilbourne et al. (2022), Phil. Trans. R. Soc. A
<https://royalsocietypublishing.org/rsta/article/381/2262/20220193/41326/Can-we-trust-projections-of-AMOC-weakening-based>

**If none of that is familiar, start here instead:** *Atlantic meridional overturning
circulation*, Wikipedia — <https://en.wikipedia.org/wiki/Atlantic_meridional_overturning_circulation>.
It is the one tertiary link in this brief, it is here as an orientation for a general reader,
and **no number in this section or in the store comes from it**.

**This is why the store carries epistemic weights.** AMOC is the most consequential item
in the set and the least settled: `sal` 200, `conf` 90, so
`EPS = 200 x (255 − 90) / 255 ~ 129` — about triple the next record. A store that ranked
renderings by how good they look would put this last. Ranked by EPS it comes first, which
is the whole argument of TTDB-RFC-0005 in one example.

**What the layer draws.** A distribution, not a state: three numbers per anchor — low, mean
and high, as fractions of present transport — coloured by the mean while the record keeps
the spread that *low confidence in the magnitude* refers to. It does not branch with the
emissions scenario, because the assessment does not.

### The collapse, drawn without a date

Interpolating between anchors is a claim that the quantity moves smoothly from one to the
next, which is precisely the assumption an abrupt collapse breaks. So the collapse is not a
sixth anchor. The block declares **one state with no year on it** (`branch_values`), and the
app draws it as such: switched on, the stipple at 26.5 °N is the same at every position of
the slider, so it cannot be read as the value for the year on screen. A slider moving under
a stationary stipple is the shape of the assessment — *it cannot be ruled out; nothing says
when*.

**And no estimate on it either.** A `traj` line is three columns with a mean in the middle;
`branch_values` is two, because AR6 assesses no collapsed value and a mean here would be
invented. The band is drawn as a slow sweep between the two ends of the range and never
rests on a number; the period of the sweep is arbitrary and means nothing, and under
`prefers-reduced-motion` the lattice carries both ends at once with no motion at all.

**The two ends: 0.00 and 0.30 of present transport.** This is the span of the collapse
experiments and **not an assessed range** — AR6 assesses no collapsed value, because it does
not assess this collapse as more than an outcome it cannot rule out. The ends are a total
shutdown, and the residual ~5 Sv that eddies sustain in a strongly-eddying ocean-only model
against a present ~17 Sv. For contrast, the *low* bound of the smooth decline is 0.48 at
2126: a fast decline, and not this.

van Westen, Kliphuis & Dijkstra (2024), the first tipping event in CESM, Science Advances:
<https://www.science.org/doi/10.1126/sciadv.adk1189> · van Westen & Dijkstra (2025), the
collapsed state in a strongly-eddying ocean-only model, Geophys. Res. Lett.:
<https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024GL114532>

**What is still not drawn is the consequence** — see [§12.6](#12-known-simplifications).

---

## 12. Known simplifications

Written down because an unstated simplification is a false claim.

1. **Continent outlines are schematic**, hand-authored at roughly 5° fidelity — tens to a
   few hundred km of error, adequate for orientation and for nothing else. Hudson Bay,
   the Baltic, the Black and Caspian Seas and most inland water are drawn as land. Omitted:
   most of the Caribbean, the Philippines, Sri Lanka, Tasmania, most Arctic archipelagos.
   For anything requiring real coastlines, load Natural Earth
   (<https://www.naturalearthdata.com/>) and delete the hand-authored set.
2. **The temperature-zone layer is a zonal schematic, not the Köppen raster.** Real Köppen
   classes are not latitude bands — the Sahara and the Congo basin sit at similar latitudes
   in different classes, and the arid B class is a set of regions, not a ring. The app draws
   bands; Beck et al. draw the truth. **This is kept, not deferred.** The raster is six
   discrete epochs and cannot cover a slider that runs continuously to 2126, and its 125 MB
   archive would move the model out of the store; the app links it under the legend instead
   of loading it. See README, *Closed, not deferred*.
3. **The Southern Hemisphere has no D (continental) class in the model**, which is correct
   and not a bug: there is almost no land at the latitudes where D forms.
4. **Years after 2100 are outside the AR6 assessment** and are a straight-line continuation
   of each branch's own 2050->2090 rate. Straight-line extension is a *shape* assumption and
   a poor one on the low branches, where the physics is a plateau rather than a slope. The
   app labels the whole range `extended` and lowers the displayed confidence.
5. **Five scenarios, and only the middle of each.** The selector carries the AR6 best
   estimate per SSP; the assessed *very likely* range is recorded and printed beside the
   selector, but nothing draws it. The globe shows one line out of a distribution in every
   layer except AMOC, which is the one layer built to show the distribution instead.
6. **An AMOC collapse is drawn as a transport and not as a consequence.** What makes a
   collapse matter is that it cools north-west Europe while the globe warms — the
   `contradicts` edge between the AMOC record and the zone layer, in physical form. Drawing
   that needs a regional temperature field, and the hosed-model estimates of it vary by
   model and by how hard the model is pushed. The layer draws the overturning; the record
   carries the consequence in words.
7. **Interpolation between anchors is linear** in every series here — and where it would be
   flatly wrong, it is refused rather than smoothed: the AMOC collapse is declared as a
   state with no year (§11) instead of as another anchor. Elsewhere real trajectories are
   not linear; over the anchor spacing used the error is small compared to the spread
   between scenarios, but it is an error.
8. **A coarse grid would fix items 1 and 2, and was declined** — `@LAT51.78LON0.3`. Not on
   size: 2 592 cells at 5° pack into 3 bits each, 972 B or 1 296 B base64, incompressible
   and independent of content, and `node tools/grid_payload.mjs` measures the two grids this
   repository already holds at 476 B each. Nor on the cost the roadmap named, which was
   already paid twice in the runtime — item 1 *is* a hand-authored ~5° payload, and the app
   rebuilds a 1° land mask of 65 160 cells at every load, 25× the 2 592 proposed. It was
   declined because the check that keeps *the file IS the model* falsifiable polices **keys**,
   and a payload is one key: a 1 296-character `cells_5deg:` read by nothing is waved through
   by that rule, while one inert number beside it fails and is named. A companion rule in the
   suite now catches the payload; the older rule still cannot see it. A grid **derived at load from a
   generator small enough to read** — which is what item 1 already is — stays admissible.
   What closes is shipped opaque cells, not gridded rendering.

---

## 13. Answering Where You Are *(implemented — the questions a reader brings)*

Every other section here expands a claim about the Earth. This one expands a claim about
the file, which is why its record is `lane:meta` and why it is left out of its own count.

**The problem.** Someone anywhere on Earth hands this file to an agent and asks about the
climate *where they are*. What comes back divides by one thing only — **what the store needs
from them before it can answer** — and that division is a partition of the drawn layers, so
it can be counted and drawn.

| The question a reader asks | What the store needs | Layers | Of those, take a year |
|---|---|---|---|
| *What does my latitude get, and when?* | a latitude | 5 | 4 |
| *Which region am I in, and how does it compare?* | a named place | 3 | 1 |
| *What is happening to the planet?* | nothing | 2 | 0 |

**A latitude** is what every `zonal-*` layer needs, and everyone has one: §1 zone bands,
§3 the anomaly, §4 the CO₂ swing, §6 the sea-ice cap, §10 the permafrost cap. Four of the
five also take a year; §4 is a climatology and reads the same in every year.

**A named place** is stricter, because the answer exists only where the science publishes a
region: §9.3's 19 GlaMBIE basins, §9.2's three Antarctic longitude sectors, §11's mooring
line at 26.5 °N. Innsbruck resolves to Central Europe — 2.0 Gt/yr, and **39 % of its
year-2000 ice gone, the largest relative loss of any region on Earth**. A town on the plain
a hundred km away resolves to nothing, and *the store has nothing for that place* is a
different statement from *nothing is happening there*.

**Nothing at all** is what §5 and §7 need. A sum is the same seen from anywhere.

### The fourth question, and why it is not a term

*Is this number what I think it is?* — asked by a reader who has met **3.9×** for the
Arctic, or *ice-free by 2050*, or a Gulf Stream headline. It is asked more often than any
of the three above and it is deliberately **not** a fourth bar.

The reason is structural. The three questions above *select a layer*; this one *reads a
layer already selected*, and all ten answer it — from `conf:`, from `src:`, from the
`source:` links, and from the five records on the belief lane. A fourth term would turn a
partition of ten into a set of twenty and break the arithmetic check the composition
legend exists to perform, which is the check that catches a mistranscribed term.

So it is answered elsewhere, and the answers are already written: **3.9 is a ratio of
linear trends over 1979–2021 and the layer needs a ratio of cumulative anomalies, which is
2.5** ([§3](#3-surface-temperature-anomaly-implemented)); **"ice-free" is AR6's defined
threshold of below 1 million km², not a description**, and the published per-degree rate
turned out to match *extent* where the layer draws *area*
([§6](#6-arctic-sea-ice-implemented--on-area-with-a-computed-sensitivity)); **the collapse
carries no date because nothing assessed supports a distribution over when**
([§11](#11-amoc--the-highest-eps-record-implemented-with-an-undated-collapse)).

### The one layer filed against its kind

The classification is mechanical — it reads the `kind:` key and nothing else. `zonal-*` is
a latitude; `sector-field` and `distribution-transport` are a place; a `composition` draws
nothing on the sphere and is neither.

By that rule **§9.3 Mountain Glaciers is *neither***, and it is declared under **a named
place**. Its 19 terms are regions a reader can stand in, where §5's and §7's terms are
components nobody stands in. A set of regions is a composition to the app and a place to
the reader — and that is exactly the distinction this section exists to draw, so it is
declared against the rule rather than bending the rule to fit.

`node tools/answerable.mjs` re-derives the three counts, audits the store's declared
membership against the mechanical rule, and prints that disagreement by name. It is not a
build step; the app never calls it.

### Provenance

There is no assessment anywhere of how many layers of this file answer from a latitude.
The counts are this store's own arithmetic over its own keys, so the record carries
`provenance: computed` and names what re-runs it, under the rule set when §4 was computed.
Its `source:` lines point at this file — the only honest source for a rendering whose
subject is this file, and the one record here whose sources are not assessments.

---

## 14. Sources

Every link above, collected — all primary or institutional, except the one at the end that
says otherwise:

- IPCC AR6 WGI SPM — <https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/>
- IPCC AR6 WGI Ch. 9 (Ocean, Cryosphere, Sea Level) — <https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/>
- WMO State of the Global Climate 2025 — <https://wmo.int/news/media-centre/wmo-confirms-2025-was-one-of-warmest-years-record>
- Beck et al. 2023, Köppen-Geiger 1 km 1901–2099 — <https://www.nature.com/articles/s41597-023-02549-6> · data <https://www.gloh2o.org/koppen/>
- Rantanen et al. 2022, Arctic amplification — <https://www.nature.com/articles/s43247-022-00498-3>
- Staten et al. 2020, tropical widening — <https://journals.ametsoc.org/view/journals/bams/101/6/BAMS-D-19-0047.1.xml>
- Grise & Davis 2020, Hadley cell in CMIP6 — <https://acp.copernicus.org/articles/20/5249/2020/>
- NOAA GML CO2 trends — <https://gml.noaa.gov/ccgg/trends/> · Keeling Curve — <https://keelingcurve.ucsd.edu/>
- Scripps, 430 ppm milestone — <https://scripps.ucsd.edu/news/annual-carbon-dioxide-peak-passes-another-milestone>
- NASA Sea Level Change Portal — <https://sealevel.nasa.gov/> · AR6 projection tool — <https://sealevel.nasa.gov/ipcc-ar6-sea-level-projection-tool>
- Hamlington et al. 2024, doubled SLR rate — <https://www.nature.com/articles/s43247-024-01761-5>
- NSIDC Sea Ice Today — <https://nsidc.org/sea-ice-today/analyses/2025-arctic-sea-ice-minimum-squeezes-ten-lowest-minimums>
- NOAA NCEI ocean heat content — <https://www.ncei.noaa.gov/access/global-ocean-heat-content/>
- NOAA ocean acidification — <https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification>
- Copernicus ice-sheet indicators — <https://climate.copernicus.eu/climate-indicators/ice-sheets> · IMBIE — <https://imbie.org/>
- Shepherd et al. 2018, Antarctic mass balance 1992–2017, Nature — <https://www.nature.com/articles/s41586-018-0179-y>
- IMBIE-3, Otosaka et al. 2023, Greenland and Antarctica 1992–2020, ESSD — <https://essd.copernicus.org/articles/15/1597/2023/>
- NOAA Arctic Report Card 2025 — <https://arctic.noaa.gov/report-card/report-card-2025/greenland-ice-sheet-2025/>
- WGMS glacier mass balance — <https://wgms.ch/> · Randolph Glacier Inventory — <https://www.glims.org/RGI/>
- GlaMBIE, community estimate of glacier mass change 2000–2023, Nature 2025 — <https://www.nature.com/articles/s41586-024-08545-z>
- Hugonnet et al. 2021, accelerated glacier mass loss, Nature — <https://www.nature.com/articles/s41586-021-03436-z>
- Rounce et al. 2023, glacier change in the 21st century, Science — <https://www.science.org/doi/10.1126/science.abo1324>
- Tarfala Research Station, Storglaciären mass balance since 1946 — <https://www.su.se/english/divisions/tarfala-research-station/research/our-research-at-tarfala>
- HadCRUT5 — <https://www.metoffice.gov.uk/hadobs/hadcrut5/> · GISTEMP v4 — <https://data.giss.nasa.gov/gistemp/> · Berkeley Earth — <https://berkeleyearth.org/data/>
- Global Carbon Budget — <https://globalcarbonbudget.org/>
- Natural Earth (real coastlines) — <https://www.naturalearthdata.com/>
- **Tertiary, for orientation only, cited by nothing:** AMOC, Wikipedia — <https://en.wikipedia.org/wiki/Atlantic_meridional_overturning_circulation>
