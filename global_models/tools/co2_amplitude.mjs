// Recompute the CO2 seasonal-amplitude ladder at @LAT19.54LON-155.58 from source.
//
// This is the only number in the store that is NOT a transcription of somebody's
// assessment, so it is the only one that cannot be checked by reading a document.
// This script is how it is checked instead: run it and compare with the `amp:` rows.
// It is not a build step - index.html never calls it and the app does not need it.
//
//   node tools/co2_amplitude.mjs
//
// Source: NOAA GML CCGG surface flask, monthly means, one programme for every site
// so the ladder is on one basis. Station latitudes come from NOAA's own headers.
const BASE = "https://gml.noaa.gov/aftp/data/trace_gases/co2/flask/surface/txt";
const SITES = ["alt", "brw", "mhd", "azr", "mlo", "chr", "smo", "cgo", "psa", "spo"];
const Y0 = 2013, Y1 = 2024;     // the 13-term average consumes 6 months at each end
const MIN_YEARS = 6;            // per calendar month, else the site is dropped

const get = async u => { const r = await fetch(u); if (!r.ok) throw new Error(u + " -> " + r.status); return r.text(); };

// Subtracting each YEAR'S MEAN is not enough: the secular rise (~2.5 ppm/yr) stays
// inside the year as a sawtooth of about that size, which swamps a 1 ppm seasonal
// cycle and fakes a December peak. Detrend with a centred 13-term moving average
// (half weight at each end) so the trend is removed rather than redistributed.
function climatology(text){
  const rows = text.split(/\r?\n/).filter(l => l && !l.startsWith("#"))
    .map(l => l.trim().split(/\s+/))
    .map(c => ({ t: +c[1] * 12 + (+c[2] - 1), y: +c[1], m: +c[2], v: +c[3] }))
    .filter(r => Number.isFinite(r.v) && r.v > 0);
  const by = new Map(rows.map(r => [r.t, r.v]));
  const acc = Array.from({ length: 12 }, () => []);
  for (const r of rows){
    if (r.y < Y0 || r.y > Y1) continue;
    let sum = 0, ok = true;
    for (let k = -6; k <= 6 && ok; k++){
      const v = by.get(r.t + k);
      if (v === undefined) ok = false; else sum += (k === -6 || k === 6) ? v / 2 : v;
    }
    if (ok) acc[r.m - 1].push(r.v - sum / 12);
  }
  return acc;
}

const rungs = [];
for (const s of SITES){
  const hdr = await get(`${BASE}/co2_${s}_surface-flask_1_ccgg_event.txt`.replace(/$/, ""))
    .then(t => t.slice(0, 4000));
  const lat = +/^# site_latitude *: *(-?[\d.]+)/m.exec(hdr)[1];
  const acc = climatology(await get(`${BASE}/co2_${s}_surface-flask_1_ccgg_month.txt`));
  const n = Math.min(...acc.map(a => a.length));
  if (n < MIN_YEARS){ console.log(`${s.toUpperCase().padEnd(4)} lat ${lat.toFixed(1).padStart(6)}  dropped (${n} yr)`); continue; }
  const clim = acc.map(a => a.reduce((t, x) => t + x, 0) / a.length);
  const amp = Math.max(...clim) - Math.min(...clim);
  const peak = clim.indexOf(Math.max(...clim)) + 1, trough = clim.indexOf(Math.min(...clim)) + 1;
  console.log(`${s.toUpperCase().padEnd(4)} lat ${lat.toFixed(1).padStart(6)}  n ${String(n).padStart(2)}  amp ${amp.toFixed(2).padStart(6)} ppm  peak ${String(peak).padStart(2)}  trough ${String(trough).padStart(2)}`);
  rungs.push([lat, amp]);
}
console.log("\nladder for the store (amp: latitude | ppm):");
for (const [lat, amp] of rungs.sort((a, b) => b[0] - a[0]))
  console.log(`amp: ${lat.toFixed(1)} | ${amp.toFixed(1)}`);
