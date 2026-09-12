// Recompute the September sea-ice sensitivity at @LAT82LON-140 from source.
//
// Why this is computed rather than transcribed: the published figure - "3.3-4 million
// km2 of September Arctic sea ice are lost per °C of annual mean global warming"
// (Niederdrenk & Notz 2018, quoted in Stroeve & Notz 2018) - says "sea ice" and does
// not say whether it means AREA or EXTENT. Those are different quantities and this
// layer has to pick one. So the sensitivity is regressed here, on the quantity the
// layer actually draws, against the same global-mean series the slider drives it with.
//
//   node tools/sea_ice_sensitivity.mjs
//
// Not a build step: index.html never calls it.
const CSV = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v4.0.csv";
const STORE = "global_memory_system_ttdb.md";
import fs from "node:fs";

// the store's own gmst anchors, so the rate is calibrated against the series that drives it
const store = fs.readFileSync(new URL(STORE, import.meta.url + "/../.."), "utf8");
const anchors = [...store.matchAll(/^gmst: *(\d+) *\| *([\d.]+) *\|/gm)].map(m => [+m[1], +m[2]]);
const dT = y => {
  if (y <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (y >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i++) if (y <= anchors[i][0]){
    const a = anchors[i - 1], b = anchors[i];
    return a[1] + (y - a[0]) / (b[0] - a[0]) * (b[1] - a[1]);
  }
  return last[1];
};

function regress(pairs){
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  for (const [x, y] of pairs){ sxy += (x - mx) * (y - my); sxx += (x - mx) * (x - mx); }
  const b = sxy / sxx, a = my - b * mx;
  let sse = 0; for (const [x, y] of pairs){ const e = y - (a + b * x); sse += e * e; }
  const se = Math.sqrt(sse / (n - 2) / sxx);
  return { slope: b, intercept: a, se, n };
}

const text = await (await fetch(CSV)).text();
const rows = text.split(/\r?\n/).slice(1).map(l => l.split(",").map(s => s.trim()))
  .filter(c => c.length >= 6 && +c[0] > 0)
  .map(c => ({ y:+c[0], extent:+c[4], area:+c[5] }))
  .filter(r => isFinite(r.area) && isFinite(r.extent));

console.log(`NSIDC Sea Ice Index, September monthly means, ${rows[0].y}-${rows[rows.length-1].y}, n=${rows.length}`);
console.log(`anchors from the store: ${anchors.length}, dT(${rows[0].y})=${dT(rows[0].y).toFixed(2)} dT(${rows[rows.length-1].y})=${dT(rows[rows.length-1].y).toFixed(2)}\n`);
for (const q of ["area", "extent"]){
  const r = regress(rows.map(x => [dT(x.y), x[q]]));
  console.log(`${q.padEnd(7)} sensitivity ${r.slope.toFixed(2)} ± ${(1.96*r.se).toFixed(2)} million km2 per °C (95%)`);
  console.log(`        range to declare: ${Math.abs(r.slope + 1.96*r.se).toFixed(1)} ${Math.abs(r.slope - 1.96*r.se).toFixed(1)}`);
}
const last = rows[rows.length - 1];
const ra = regress(rows.map(x => [dT(x.y), x.area]));
const fitted = ra.intercept + ra.slope * dT(last.y);
console.log(`\nreference_year: ${last.y}`);
console.log(`  observed September area  ${last.area.toFixed(2)}  (its extent was ${last.extent.toFixed(2)})`);
console.log(`  fitted area at that year ${fitted.toFixed(2)}  <- reference_area: the layer is the fit,`);
console.log(`     so it anchors on the fit rather than on one year's weather.`);
console.log(`  residual ${(last.area - fitted).toFixed(2)}`);
console.log(`\npublished figure for comparison: 3.3-4.0, which the source calls "sea ice" without`);
console.log(`saying which quantity. It overlaps the EXTENT range above and not the AREA range.`);
