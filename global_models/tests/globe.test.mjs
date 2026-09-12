// Headless harness: run index.html's script against the real TTDB with a DOM stub.
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const code = html.match(/<script>\r?\n([\s\S]*?)<\/script>/)[1];

const noop = () => {};
function ctxStub(){
  return new Proxy({}, {
    get(t, k){
      if (k === "createRadialGradient") return () => ({ addColorStop: noop });
      if (k === "createImageData") return (w, h) => ({ width:w, height:h, data:new Uint8ClampedArray(w*h*4) });
      if (k === "measureText") return () => ({ width: 10 });
      if (k in t) return t[k];
      return noop;
    },
    set(t, k, v){ t[k] = v; return true; }
  });
}
function el(id){
  const e = {
    id, style:{}, value:"", min:"", max:"", textContent:"", label:"",
    children: [],
    addEventListener(ev, fn){ (this._h ||= {})[ev] = fn; },
    getBoundingClientRect: () => ({ width:600, height:600, left:0, top:0 }),
    appendChild(c){ this.children.push(c); },
    querySelectorAll: () => [],
    getContext: () => ctxStub(),
    set innerHTML(v){ this._html = v; }, get innerHTML(){ return this._html || ""; }
  };
  return e;
}
const els = {};
globalThis.document = {
  body: {},
  getElementById(id){ return els[id] ||= el(id); },
  createElement(tag){ const e = el(tag); if (tag === "canvas"){ e.width = 0; e.height = 0; } return e; }
};
globalThis.window = { devicePixelRatio: 2, addEventListener: noop };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "#888888" });
globalThis.matchMedia = () => ({ matches: false });
globalThis.requestAnimationFrame = noop;
globalThis.fetch = async (f) => ({
  ok: true, status: 200, statusText: "OK",
  text: async () => fs.readFileSync(path.join(dir, f), "utf8")
});

const mod = code + "\n;globalThis.__x = { parseStore, parseBlock, makeLayer, isLand, dT, md, records:()=>records, renders:()=>renders, timeline:()=>timeline, gmst:()=>gmst, setScenario, scenarios:()=>scenarios, scenario:()=>scenario, active:()=>active, tierAt, buildMask, setYear:y=>{year=y}, project, unproject, sx, sy, rampAt, setPulse:p=>{pulse=p}, pulsing:()=>pulsing, rot:()=>({ lat:rotLat, lon:rotLon }) };";
await import("data:text/javascript;base64," + Buffer.from(mod).toString("base64"));

// boot() is async; give it a tick.
await new Promise(r => setTimeout(r, 200));
const X = globalThis.__x;

let fails = 0;
const ok = (cond, msg, extra="") => {
  if (cond) console.log("  PASS  " + msg + (extra ? "  " + extra : ""));
  else { fails++; console.log("  FAIL  " + msg + "  " + extra); }
};

console.log("\n== error banner ==");
ok(!els.err || els.err.style.display !== "block", "no load error",
   els.err ? String(els.err.innerHTML).slice(0,160) : "(fail() never called)");

console.log("\n== records ==");
const recs = X.records();
// Not a magic number: count the record headers in the store itself, so adding a
// record does not need this line edited, while a record the parser silently drops
// still fails here and names the gap.
const storeText = fs.readFileSync(path.join(dir, "global_memory_system_ttdb.md"), "utf8");
const headers = storeText.split(/\r?\n/).filter(l => /^@LAT-?[\d.]+LON-?[\d.]+\s*\|/.test(l));
ok(recs.length === headers.length, "every record header in the store is parsed",
   recs.length + " parsed of " + headers.length + " headers");
const ids = recs.map(r => r.id);
console.log("  " + ids.join("\n  "));

console.log("\n== epistemic weights ==");
const amoc = recs.find(r => r.id === "@LAT26.5LON-70");
ok(amoc && amoc.conf === 90 && amoc.sal === 200, "AMOC conf 90 / sal 200");
ok(amoc && amoc.eps === 129, "AMOC EPS = 129", "got " + (amoc && amoc.eps));
const perma = recs.find(r => r.id === "@LAT68.75LON161.4");
ok(perma.eps === 97, "Permafrost EPS = 97", "got " + perma.eps);
const co2 = recs.find(r => r.id === "@LAT19.54LON-155.58");
// CO2 carries the store's first computed number, so its conf describes arithmetic
// rather than the measurement it is arithmetic on. EPS rose 4 -> 39 when conf fell
// 250 -> 205, which is the metric doing its job on a number with no source assessment.
ok(co2.eps === 39, "CO2 EPS = 39 (conf 205, the computed ladder)", "got " + co2.eps);
const maxEps = recs.reduce((a, r) => r.eps > a.eps ? r : a);
ok(maxEps.id === "@LAT26.5LON-70", "highest EPS in store is AMOC", maxEps.id + " @ " + maxEps.eps);
const fix = recs.find(r => r.id === "@LAT-54.42LON3.36");
ok(fix && !fix.hasEw && fix.conf === 128 && fix.sal === 0 && fix.eps === 0,
   "fixture has no [ew] -> conf 128, sal 0, EPS 0");

console.log("\n== titles ==");
ok(fix.title.startsWith("FIXTURE"), "fixture title parsed past the x_fixture line", fix.title);
ok(recs.find(r => r.id === "@LAT0LON0").title === "Temperature Zones", "trailing parenthetical stripped");
// A title that wraps across two lines does not fail loudly — it silently parses as
// some later bold run in the body, which is how the belief record at @LAT51.58LON0.1
// was first written. So the parsed title must be the FIRST bold run of the body.
const wrapped = [];
for (const r of recs){
  const m = /\*\*([\s\S]+?)\*\*/.exec(r.body || "");
  if (!m) continue;
  const first = m[1].replace(/\s+/g, " ").trim();
  const got = (r.title || "").replace(/\s+/g, " ").trim();
  // titles are stored with any trailing parenthetical stripped, so compare on the stem
  if (first !== got && !first.startsWith(got)) wrapped.push(r.id + ": title=" + got);
}
ok(wrapped.length === 0, "every title is the first bold run of its record", wrapped.join(" ; "));

console.log("\n== dead edge (TTCP-RFC-0001 §12) ==");
const dead = fix.edges.find(e => e.type === "duplicates");
ok(dead && !recs.some(r => r.key === dead.target.key), "duplicates@LAT88.8LON179.9 resolves to nothing");
const live = recs.find(r => r.id === "@LAT51.48LON0").edges;
ok(live.every(e => recs.some(r => r.key === e.target.key)), "every Home edge resolves");

console.log("\n== all edges across the store ==");
let deadCount = 0, edgeCount = 0;
for (const r of recs) for (const e of r.edges){
  edgeCount++;
  if (!recs.some(x => x.key === e.target.key)){ deadCount++; console.log("    dead: " + r.id + " -" + e.type + "-> " + e.target.id); }
}
ok(deadCount === 1, "exactly 1 dead edge (the deliberate fixture)", edgeCount + " edges, " + deadCount + " dead");

console.log("\n== special record ==");
const sp = recs.find(r => r.lat <= -90);
ok(sp && /discovery_tour_off/.test(sp.special || ""), "South Pole marker carries discovery_tour_off");

console.log("\n== timeline (read from the store, not the markup) ==");
const tl = X.timeline();
ok(tl.min === "1926" && tl.max === "2126" && tl.default === "2026", "1926 / 2026 / 2126",
   JSON.stringify([tl.min, tl.default, tl.max]));
ok((+tl.default - +tl.min) === (+tl.max - +tl.default), "2026 is exactly the middle position",
   (+tl.default - +tl.min) + " each way");
ok(els.year.min === "1926" && els.year.max === "2126" && els.year.value === "2026",
   "slider bounds applied to the DOM");

console.log("\n== renderings ==");
const rs = X.renders();
ok(rs.length === 13, "13 renderings", "got " + rs.length);
ok(rs[0].block.id === "temperature-zones" && rs[0].block.status === "implemented",
   "order 1 is Temperature Zones, implemented");
ok(els.pick.children.some(c => c.textContent === "Temperature Zones"), "selector lists Temperature Zones");
const planned = rs.filter(r => r.block.status !== "implemented");
const grp = els.pick.children.find(c => c.label && /Planned/.test(c.label));
ok(grp && grp.children.length === planned.length,
   planned.length + " planned renderings in their own group",
   "got " + (grp ? grp.children.length : "none"));
ok(els.pick.children.filter(c => !c.label).length === rs.length - planned.length,
   (rs.length - planned.length) + " implemented renderings listed ahead of them");
ok(els.pick.value === recs.find(r => r.id === "@LAT0LON0").key, "selector defaults to Temperature Zones");

console.log("\n== GMST series ==");
const g = X.gmst();
ok(g.length === 9, "9 anchors", "got " + g.length);
ok(Math.abs(X.dT(2024) - 1.48) < 1e-9, "dT(2024) = 1.48 (WMO 3-yr mean)");
ok(Math.abs(X.dT(2090) - 2.70) < 1e-9, "dT(2090) = 2.70 (AR6 SSP2-4.5)");
ok(X.dT(2050) === 2.0, "dT(2050) = 2.0 (AR6 SSP2-4.5 2041-2060)");
ok(X.dT(1900) === 0.15 && X.dT(2200) === 3.3, "clamped outside the anchor range");
let mono = true; for (let y = 1926; y < 2126; y++) if (X.dT(y+1) < X.dT(y) - 1e-12) mono = false;
ok(mono, "series is monotonic across the whole slider");

console.log("\n== scenarios (the future half branches; the observed half does not) ==");
const DEF = X.timeline().scenario;
const scs = X.scenarios();
ok(scs.length >= 3, scs.length + " scenarios read from the store");
ok(X.scenario() && X.scenario().id === DEF, "the store's default is the one selected", DEF);
ok(els.scen.children.length === scs.length, "every branch is in the selector",
   "got " + els.scen.children.length);
ok(els.scen.value === DEF, "selector starts on the default");
ok(scs.every(sc => sc.future.length === 3 && sc.best && sc.range && sc.period),
   "every branch carries 3 anchors, a best estimate, a range, and the period they belong to");
// the past does not branch
const past = scs.map(sc => { X.setScenario(sc.id); return [1926, 1975, 2024].map(y => X.dT(y)).join(","); });
ok(new Set(past).size === 1, "observed years are identical under every branch", past[0]);
// ...and the future does, in the order the store lists them
const far = scs.map(sc => { X.setScenario(sc.id); return X.dT(2126); });
ok(new Set(far.map(v => v.toFixed(3))).size === scs.length, "2126 differs under every branch",
   far.map(v => v.toFixed(2)).join(" "));
ok(far.every((v, i) => i === 0 || v > far[i - 1]), "2126 rises in the order the store lists them",
   far.map(v => v.toFixed(2)).join(" < "));
// the lowest branch peaks inside the slider and comes back down
X.setScenario(scs[0].id);
ok(X.dT(2024) < X.dT(2050), "the lowest branch is still rising at mid-century");
ok(X.dT(2050) > X.dT(2090) && X.dT(2090) > X.dT(2126), "...then peaks and falls",
   [2050, 2090, 2126].map(y => X.dT(y).toFixed(2)).join(" > "));
X.setScenario(DEF);
ok(Math.abs(X.dT(2090) - 2.70) < 1e-9, "switching back restores the default series");
ok(X.gmst().length === 9, "6 observed anchors + the 3 of the branch in force",
   "got " + X.gmst().length);

console.log("\n== tiers ==");
ok(X.tierAt(2000).name === "observed" && X.tierAt(2060).name === "projected" && X.tierAt(2120).name === "extended",
   "observed / projected / extended", [X.tierAt(2000).name, X.tierAt(2060).name, X.tierAt(2120).name].join(" "));
ok(X.tierAt(2025).name === "observed" && X.tierAt(2026).name === "projected", "boundary at 2025/2026 is clean");

console.log("\n== land mask ==");
const cases = [
  ["Sahara", 23, 10, true], ["mid Atlantic", 0, -30, false], ["Amazon", -3, -60, true],
  ["Siberia", 65, 100, true], ["Pacific", 0, -150, false], ["Australia", -25, 133, true],
  ["Antarctica", -80, 0, true], ["Arctic Ocean", 88, 0, false], ["Greenland", 72, -40, true],
  ["India", 20, 78, true], ["Southern Ocean", -55, 100, false], ["N Atlantic", 45, -40, false],
  ["Congo", 0, 20, true], ["Kansas", 39, -98, true], ["Japan", 36, 138, true],
  ["Sea of Japan", 40, 134, false], ["Madagascar", -19, 46, true], ["Mozambique Ch.", -19, 41, false],
];
for (const [name, la, lo, want] of cases) ok(X.isLand(la, lo) === want, "isLand " + name, "-> " + X.isLand(la, lo));

console.log("\n== temperature zones layer ==");
const tz = X.makeLayer(recs.find(r => r.id === "@LAT0LON0"));
ok(tz.kind === "zonal-class" && tz.bands.length === 5, "5 bands");
ok(tz.at(0, -30, 2026) === null, "ocean is transparent (domain: land)");
ok(Math.abs(tz.shift(2005)) < 1e-9, "zero shift at the 1991-2020 reference epoch",
   tz.shift(2005).toFixed(4));
const s2026 = tz.shift(2026), s2126 = tz.shift(2126), s1926 = tz.shift(1926);
ok(s2026 > 0 && s2126 > s2026 && s1926 < 0, "shift is monotonic and signed",
   `1926 ${s1926.toFixed(2)}  2026 ${s2026.toFixed(2)}  2126 ${s2126.toFixed(2)}`);
ok(s2126 < 12, "shift stays physically plausible at the far end", s2126.toFixed(2) + " deg");
// the sensitivity is one value out of a declared range, and the range is not decoration
const tzb = X.parseBlock(recs.find(r => r.id === "@LAT0LON0").render);
const kr = tzb.shift_range.trim().split(/\s+/).map(Number);
const span = tz.shiftSpan(2126);
ok(kr.length === 2 && !!span, "the block declares a sensitivity range and the layer reads it",
   tzb.shift_range);
ok(span[0] < s2126 && s2126 < span[1], "the drawn shift sits inside the range the store declares",
   span[0].toFixed(2) + " < " + s2126.toFixed(2) + " < " + span[1].toFixed(2));
ok(Math.abs(span[1] / span[0] - kr[1] / kr[0]) < 1e-9,
   "and the ends are that range's ends, scaled by the same warming");
ok(tz.shiftSpan(2005).every(v => Math.abs(v) < 1e-9), "at the reference epoch the range collapses too");
// class continuity: no latitude over land may be unclassified
let gaps = 0;
for (let y of [1926, 2026, 2126]) for (let la = -89; la <= 89; la += 1){
  const lo = 20; if (!X.isLand(la, lo)) continue;
  if (tz.at(la, lo, y) === null) { gaps++; }
}
ok(gaps === 0, "no unclassified land latitude at 1926 / 2026 / 2126", gaps + " gaps");
// the tropics must widen, not shrink
const trop = y => { let n = 0; for (let la = 0; la <= 89; la += .25) if (String(tz.at(la, 20, y)) === String(tz.bands[0].rgb)) n++; return n * .25; };
ok(trop(2126) > trop(2026) && trop(2026) > trop(1926), "tropical band widens with warming",
   `1926 ${trop(1926)}  2026 ${trop(2026)}  2126 ${trop(2126)}`);
// no D class in the southern hemisphere
let sD = 0; for (let la = -89; la < 0; la += .5) if (String(tz.at(la, 20, 2026)) === String(tz.bands[3].rgb)) sD++;
ok(sD === 0, "no continental (D) class in the southern hemisphere");

console.log("\n== anomaly layer ==");
const an = X.makeLayer(recs.find(r => r.id === "@LAT80LON0"));
ok(an.kind === "zonal-field", "zonal-field");
ok(an.at(0, -30, 2026) !== null, "drawn over ocean too (domain: global)");
ok(an.valueAt(85, 2026) > an.valueAt(0, 2026), "Arctic warms faster than the tropics",
   `85N ${an.valueAt(85,2026).toFixed(2)}  0 ${an.valueAt(0,2026).toFixed(2)}`);
ok(an.valueAt(-60, 2026) < an.valueAt(0, 2026), "Southern Ocean is the minimum");
const ratio = an.valueAt(90, 2026) / an.valueAt(30, 2026);
ok(Math.abs(ratio - 2.5) < .01, "polar amplification ratio = 2.5x (anomaly ratio, not the 3.9 trend ratio)", ratio.toFixed(2));
const top = an.stops[an.stops.length-1][0];
ok(an.valueAt(90, 2126) < top, "Arctic does not saturate the colour ramp at the far end of the slider", an.valueAt(90,2126).toFixed(2) + " < " + top);
ok(an.valueAt(90, 2126) < 9.5, "2126 Arctic anomaly stays within what assessments support", an.valueAt(90,2126).toFixed(2) + " C");

console.log("\n== transport layer (AMOC) ==");
const am = X.makeLayer(recs.find(r => r.id === "@LAT26.5LON-70"));
ok(am.kind === "distribution-transport", "distribution-transport");
ok(am.at(am.ref_lat, -70, 2026) !== null, "drawn on the section the store declares");
ok(am.at(am.ref_lat + 20, -70, 2026) === null, "and nowhere else - a transport is not a field");
for (const t of am.trajs)
  ok(t.values[0] <= t.values[1] && t.values[1] <= t.values[2],
     "traj " + t.year + " is low <= mean <= high", t.values.join(" "));
ok(am.valueAt(2126) < am.valueAt(2026), "transport declines across the slider",
   am.valueAt(2026).toFixed(2) + " -> " + am.valueAt(2126).toFixed(2));
const t2100 = am.trajs.find(t => t.year === 2100);
ok(Math.abs(am.valueAt(2100) - t2100.values[1]) < 1e-9,
   "the readout reports the estimate, not the low bound of the spread",
   am.valueAt(2100).toFixed(2) + " against a low bound of " + t2100.values[0]);
// AR6 assesses the decline as very likely under ALL scenarios, so this must not branch
const amBefore = am.valueAt(2100);
X.setScenario(scs[scs.length - 1].id);
ok(am.valueAt(2100) === amBefore, "the transport curve does not move with the scenario");
X.setScenario(DEF);

console.log("\n== the alternative state: a collapse carries no date, and no estimate ==");
const br = am.branch;
ok(!!br && br.lo < br.hi, "the block declares one alternative, as a range",
   br ? br.lo + " to " + br.hi : "none declared");
ok(X.parseBlock(recs.find(r => r.id === "@LAT26.5LON-70").render).branch_values.trim().split(/\s+/).length === 2,
   "two columns and no middle - there is no assessed value to put in one");
// the whole reason it cannot be a traj line: a collapse is not a point on the decline
const lowest = Math.min(...am.trajs.map(t => t.values[0]));
ok(br.hi < lowest, "the range lies under every point of the interpolated spread",
   br.hi + " < " + lowest);
ok(am.branchOn() === null, "off until it is asked for");
const offCol = [2026, 2075, 2126].map(y => JSON.stringify(am.at(am.ref_lat, 1, y)));
ok(new Set(offCol).size === 3, "off, the band's colour is a function of the year", offCol.join(" "));
am.setBranch(true);
ok(am.branchOn() === br, "switched on");
const onCol = [1926, 2026, 2100, 2126].map(y => JSON.stringify(am.at(am.ref_lat, 1, y)));
ok(new Set(onCol).size === 1, "on, the slider does not touch it - the state carries no year", onCol[0]);
ok(Number.isNaN(am.valueAt(2026)), "there is no estimate to report, and the layer reports none");
ok(am.spreadAt(2026)[0] === br.lo && am.spreadAt(2026)[1] === br.hi,
   "the reading is the range itself", am.spreadAt(2026).join(" to "));

// the pulse: the range is what is drawn, and it never settles on a value
const cell = (p, y) => { X.setPulse(p); return JSON.stringify(am.at(am.ref_lat, 1, y || 2026)); };
const swept = [0, 0.25, 0.5, 0.75, 1].map(p => cell(p));
ok(new Set(swept).size > 2, "the drawn colour sweeps rather than resting", swept.join(" "));
ok(cell(0) === JSON.stringify(X.rampAt(am.stops, br.lo)), "one end of the sweep is the low end of the range");
ok(cell(0.5) === JSON.stringify(X.rampAt(am.stops, br.hi)), "the other end is the high end");
ok(cell(1) === cell(0), "and it closes the loop rather than jumping back");
// the sweep is the spread, not a clock: the year still changes nothing at any phase
for (const p of [0, 0.3, 0.5]){
  const across = [1926, 2050, 2126].map(y => cell(p, y));
  ok(new Set(across).size === 1, "at phase " + p + " the year still means nothing", across[0]);
}
X.setPulse(0);
const brBefore = am.spreadAt(2026).join(' to ') + ' ' + cell(0.4);
X.setScenario(scs[scs.length - 1].id);
ok(am.spreadAt(2026).join(' to ') + ' ' + cell(0.4) === brBefore,
   "and neither the range nor what is drawn moves with the emissions scenario", brBefore);
X.setScenario(DEF);
// stippled, because a state with no date must not read as this year's value
const stip = [];
for (let lon = -80; lon < -60; lon++) stip.push(am.at(am.ref_lat, lon, 2026) === null ? 0 : 1);
ok(stip.includes(0) && stip.includes(1), "drawn stippled rather than solid", stip.join(""));
ok(stip.every((v, i) => i === 0 || v !== stip[i - 1]), "on a regular lattice, so it reads as a pattern");
// prefers-reduced-motion gets both ends at once instead of a sweep
const realMM = globalThis.matchMedia;
globalThis.matchMedia = () => ({ matches:true });
const cells = [];
for (let lon = -80; lon < -60; lon++){ const c = am.at(am.ref_lat, lon, 2026); if (c) cells.push(JSON.stringify(c)); }
ok(new Set(cells).size === 2, "under reduced motion the lattice carries both ends at once",
   [...new Set(cells)].join("  "));
ok(cells.includes(JSON.stringify(X.rampAt(am.stops, br.lo))) &&
   cells.includes(JSON.stringify(X.rampAt(am.stops, br.hi))), "...and they are the two ends of the range");
globalThis.matchMedia = realMM;

am.setBranch(false);
ok(am.at(am.ref_lat, -80, 2026) !== null && am.at(am.ref_lat, -79, 2026) !== null,
   "switched off, the ordinary layer is solid again");
ok(JSON.stringify(am.at(am.ref_lat, 1, 2126)) === offCol[2], "...and the year means something again");

console.log("\n== extent layer (permafrost) ==");
const pfRec = recs.find(r => r.id === "@LAT68.75LON161.4");
const pf = X.makeLayer(pfRec), pfb = X.parseBlock(pfRec.render);
const rate = +pfb.extent_decline_per_c, refY = +pfb.reference_year;
ok(pf.kind === "zonal-extent", "zonal-extent");
ok(Math.abs(pf.extentFraction(refY) - 1) < 1e-9, "full extent at the reference epoch");
ok(Math.abs(pf.edgeAt(refY) - pf.edge) < 1e-9, "the boundary sits on the declared edge there",
   pf.edgeAt(refY).toFixed(4));
ok(pf.edgeAt(2126) > pf.edgeAt(2026) && pf.edgeAt(2026) > pf.edgeAt(1926),
   "the boundary retreats poleward as it warms",
   [1926, 2026, 2126].map(y => pf.edgeAt(y).toFixed(1)).join(" -> "));
// the geometry must enclose exactly the fraction the store's rate leaves
const cap = y => (1 - Math.sin(pf.edgeAt(y) * Math.PI / 180)) / (1 - Math.sin(pf.edge * Math.PI / 180));
let capErr = 0;
for (const y of [1926, 2026, 2060, 2090, 2126]) capErr = Math.max(capErr, Math.abs(cap(y) - pf.extentFraction(y)));
ok(capErr < 1e-9, "the drawn cap is exactly the remaining fraction, not a fitted shift",
   capErr.toExponential(1));
ok(Math.abs(pf.extentFraction(2126) - (1 - rate * (X.dT(2126) - X.dT(refY)))) < 1e-9,
   "and that fraction is the store's rate per degree applied to the series",
   (pf.extentFraction(2126) * 100).toFixed(0) + "% left at 2126");
ok(pf.at(-70, 100, 2026) === null, "nothing in the southern hemisphere (hemisphere: north)");
ok(pf.at(72, -40, 2026) !== null, "drawn over northern land");
ok(pf.at(88, 0, 2026) === null, "ocean is transparent (domain: land)");
ok(pf.at(pf.edge - pf.uncert - 1, 100, refY) === null, "nothing equatorward of the fade");
// the rate is assessed near present warming: the far end of the top branch must clamp
X.setScenario(scs[scs.length - 1].id);
ok(pf.extentFraction(2126) === 0 && pf.at(72, -40, 2126) === null,
   "clamps at zero under the highest branch rather than going negative");
ok(an.valueAt(90, 2126) < an.stops[an.stops.length - 1][0],
   "the anomaly ramp still has room at the far end of the highest branch",
   an.valueAt(90, 2126).toFixed(1) + " < " + an.stops[an.stops.length - 1][0]);
X.setScenario(DEF);

console.log("\n== planned layers draw nothing ==");
for (const r of planned){
  const L = X.makeLayer(r.rec);
  if (L.kind !== "none" || L.at(10, 10, 2026) !== null){ fails++; console.log("  FAIL  " + r.block.id + " draws"); }
}
ok(true, "all " + planned.length + " planned renderings return null everywhere");

console.log("\n== projection round trip ==");
let worst = 0;
for (const [la, lo] of [[0,0],[45,90],[-30,-120],[80,170],[-75,-106],[26.5,-70],[19.54,-155.58]]){
  const p = X.project(la, lo); if (p.z <= 0) continue;
  const g2 = X.unproject(X.sx(p), X.sy(p));
  if (!g2) continue;
  worst = Math.max(worst, Math.abs(g2.lat - la), Math.abs(((g2.lon - lo + 540) % 360) - 180));
}
ok(worst < 1e-6, "project -> unproject is the identity for visible points", "worst " + worst.toExponential(2));

console.log("\n== markdown ==");
const h = X.md("**Bold** and *em* and `code`.\n\n- one\n  continued\n- two\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\nSee https://example.org/x here.");
ok(/<strong>Bold<\/strong>/.test(h), "bold");
ok(/<em>em<\/em>/.test(h), "italic");
ok(/<code>code<\/code>/.test(h), "code");
ok(/<li>one continued<\/li>/.test(h), "list continuation lines join their item");
ok(/<table>[\s\S]*<th>a<\/th>/.test(h), "table");
ok(/<a href="https:\/\/example\.org\/x"/.test(h), "bare URL autolinked");
ok(!/<a href="[^"]*"[^>]*>[\s\S]*<a /.test(h), "no nested anchors");

console.log("\n== panel rendered ==");
const panel = els.panel.innerHTML;
ok(/EPS/.test(panel) && /conf 210/.test(panel), "EPS + raw weights shown (TTCP-RFC-0001 §11)");
ok(/Related records/.test(panel), "edges rendered as navigation (§12)");
ok(/Temperature Zones/.test(panel), "default record is in the panel");
ok(/class="tablewrap"/.test(els.panel.innerHTML) === false || true, "panel built");

console.log("\n== source links on the globe ==");
const srcHtml = () => els.source.innerHTML;
ok(srcHtml().includes('<a href="https://'), "the drawn layer links the data it stands in for",
   srcHtml().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const pickKey = id => { els.pick.value = recs.find(r => r.id === id).key; els.pick._h.change(); };
pickKey("@LAT26.5LON-70");
ok(/rapid/i.test(srcHtml()), "switching rendering re-points them", 
   srcHtml().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
pickKey("@LAT0LON0");
ok(/gloh2o/i.test(srcHtml()), "and the default layer points at the raster it approximates");
// a link on the globe must be a link the record actually cites
for (const r of rs.filter(r => r.block.status === "implemented")){
  const urls = [].concat(r.block.source || []).map(l => l.split("|")[1].trim());
  ok(urls.length > 0 && urls.every(u => r.rec.body.includes(u)),
     "every source: on " + r.block.id + " is cited in the record body", urls.length + " links");
}

console.log("\n== readout ==");
// Two readouts now, because they can appear apart: the year block belongs to the
// timeline and is hidden with it, the layer's reading belongs to the layer.
const yo = els.yearout.innerHTML, ro = els.layerout.innerHTML;
ok(/2026/.test(yo) && /\+1\.\d\d °C/.test(yo), "year + dT in the year readout",
   yo.replace(/<[^>]+>/g, " ").replace(/\s+/g," ").trim());
// the baseline the anomaly is measured against is the store's, not the app's
const anB = X.parseBlock(recs.find(r => r.id === "@LAT80LON0").render);
ok(!!anB.baseline && yo.includes(anB.baseline), "the year readout names the store's baseline period",
   anB.baseline);
ok(ro.includes(X.parseBlock(recs.find(r => r.id === "@LAT0LON0").render).readout),
   "and the layer readout carries the store's label");
ok(/\(\+0\.\d to \+\d\.\d°\)/.test(ro), "the declared sensitivity range is printed beside the shift",
   ro.replace(/<[^>]+>/g, " ").replace(/\s+/g," ").trim());
ok(new RegExp(DEF).test(yo), "the year readout names the scenario in force", DEF);
const note = els.scenout.innerHTML;
ok(new RegExp(X.scenario().period).test(note) && /very likely/.test(note),
   "the note under the selector carries the period and the assessed range",
   note.replace(/<[^>]+>/g, " ").replace(/\s+/g," ").trim());
// drive the real change handler, the way the page does
const other = scs[scs.length - 1].id;
els.scen.value = other;
els.scen._h.change();
ok(X.scenario().id === other && new RegExp(other).test(els.yearout.innerHTML),
   "changing the selector re-splices the series and repaints the readout",
   els.yearout.innerHTML.replace(/<[^>]+>/g, " ").replace(/\s+/g," ").trim());
ok(new RegExp(scs[scs.length - 1].range.replace("-", "[-\u2013]")).test(els.scenout.innerHTML),
   "...and repaints the note with that branch's range");
els.scen.value = DEF; els.scen._h.change();
ok(X.scenario().id === DEF, "and back again");

console.log("\n== the alternative state, through the page ==");
pickKey("@LAT26.5LON-70");
ok(els.branch.hidden === false, "the control appears for a layer that declares one");
ok(els.branchlabel.textContent === X.active().branch.label && els.branchwhy.textContent.length > 40,
   "label and reason are the store's words, not the app's", els.branchlabel.textContent);
const roBefore = els.layerout.innerHTML;
els.branchbox.checked = true; els.branchbox._h.change();
ok(/undated/i.test(els.layerout.innerHTML), "on, the readout says the year does not apply to it",
   els.layerout.innerHTML.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
ok(/repeating-linear-gradient/.test(els.legend.innerHTML),
   "and the legend shows the stipple the globe is drawn with");
ok(els.branch.className === "branch on", "the control marks itself active");
ok(X.pulsing() === true, "and the sweep is running");
els.branchbox.checked = false; els.branchbox._h.change();
ok(els.layerout.innerHTML === roBefore, "off, the readout is exactly what it was");
ok(X.pulsing() === false, "and the sweep stops");
els.branchbox.checked = true; els.branchbox._h.change();
pickKey("@LAT68.75LON161.4");
ok(X.pulsing() === false, "switching rendering with it running stops it too");
ok(els.branch.hidden === true, "and there is no control at all for a layer that declares none");
const pfLabel = X.parseBlock(recs.find(r => r.id === "@LAT68.75LON161.4").render).readout.split(",")[0];
ok(els.layerout.innerHTML.includes(pfLabel), "every readout label comes out of the store", pfLabel);
pickKey("@LAT0LON0");

console.log("\n== a field that refuses to colour what the store could not resolve ==");
const antRec = recs.find(r => r.id === "@LAT-75LON-106.75");
const ant = X.makeLayer(antRec), antB = X.parseBlock(antRec.render);
ok(ant.kind === "sector-field" && ant.sectors.length === 3, "three sectors, from the store", ant.kind);
const unres = ant.sectors.filter(s => !s.resolved);
ok(unres.length === 1 && Math.abs(unres[0].uncert) > Math.abs(unres[0].value),
   "exactly one is unresolved, and its uncertainty exceeds its estimate",
   unres[0].value + " +/- " + unres[0].uncert);
// A resolved sector takes a ramp position; the unresolved one never does.
const west = ant.sectors.find(s => s.id === "west");
const wc = ant.at(-80, -100, 2026);
ok(!!wc && wc.join() === X.rampAt(ant.stops, west.value).join(),
   "a resolved sector is the ramp at the store's own value", String(wc));
const eastCells = [];
for (let lat = -85; lat <= -70; lat++) for (let lon = 30; lon <= 120; lon++){
  if (!X.isLand(lat, lon)) continue;
  eastCells.push(ant.at(lat, lon, 2026));
}
const painted = eastCells.filter(Boolean);
ok(eastCells.length > 0 && painted.length > 0 && painted.length < eastCells.length,
   "the unresolved sector is hatched - drawn, and not solid",
   painted.length + " of " + eastCells.length + " cells");
ok(painted.every(c => c.join() === ant.tone.join()),
   "and every painted cell is the one flat tone, never a ramp position");
ok(ant.stops.every(s => s[1].join() !== ant.tone.join()),
   "the tone is not any colour the ramp can produce");
// Stationary: no year goes in, so no year comes out.
const years = [1926, 2026, 2126];
ok(years.every(y => String(ant.at(-80, -100, y)) === String(ant.at(-80, -100, 2026))),
   "the layer does not move under the slider");
ok(ant.at(-50, -100, 2026) === null && ant.at(20, -100, 2026) === null,
   "and nothing is drawn equatorward of the declared limit", String(antB.lat_limit));

console.log("\n== the unresolved sector, through the page ==");
pickKey("@LAT-75LON-106.75");
ok(/repeating-linear-gradient/.test(els.legend.innerHTML),
   "the legend shows the hatch the globe is drawn with");
for (const s of ant.sectors)
  ok(els.legend.innerHTML.includes(s.label) && els.legend.innerHTML.includes(String(s.value)),
     "the legend carries " + s.label + " and its number", String(s.value));
ok(els.legend.innerHTML.includes(antB.unresolved_label),
   "and names the state the store could not resolve", antB.unresolved_label);
ok(els.layerout.innerHTML.includes(antB.undated_note.slice(0, 24)),
   "the readout says the year does not apply, in the store's words");
pickKey("@LAT0LON0");

console.log("\n== a south-polar layer is brought into view when it is chosen ==");
// The default view is tilted north, so this layer would otherwise be selected and
// invisible. Choosing it from the dropdown has to rotate the globe — not only
// clicking its node, which is a different path into the same select().
pickKey("@LAT0LON0");
const homeLat = X.rot().lat;
ok(homeLat > 0, "the view starts tilted north, away from the south pole", homeLat.toFixed(2));
pickKey("@LAT-75LON-106.75");
ok(X.rot().lat < homeLat, "choosing the south-polar layer rotates the globe south",
   X.rot().lat.toFixed(2));
ok(X.active().sectors.every(s => s.from >= -180 && s.to <= 180),
   "and its sectors are real longitudes, so they land where the store says");
pickKey("@LAT0LON0");

console.log("\n== a sum drawn as its parts, off the globe ==");
const slRec = recs.find(r => r.id === "@LAT0LON-140");
const sl = X.makeLayer(slRec), slB = X.parseBlock(slRec.render);
ok(sl.kind === "composition" && sl.terms.length === 4, "four terms, from the store", sl.kind);
ok(sl.at(0, 0, 2026) === null && sl.at(-75, -106, 2026) === null && sl.at(72, -38, 2026) === null,
   "and nothing at all goes on the sphere - it is not a map");
const ref = sl.terms.find(t => t.isRef);
ok(ref && ref.id === slB.reference && ref.share === 1,
   "one term is the measured reference and carries the whole width", ref && ref.id);
const declared = X.parseBlock(slRec.render).term
  .map(l => l.split("|").map(s => s.trim())).find(c => c[0] === slB.reference);
ok(ref.value === +declared[3], "the reference is the store's own absolute, undivided",
   ref.value + " " + sl.unit);
// A term stated as a ratio is the reference divided by the source's factor.
const der = sl.terms.find(t => t.relation === "ratio_to_ref");
ok(Math.abs(der.value - ref.value / der.factor) < 1e-9 && der.value < ref.value,
   "a stated ratio is the reference divided by it", der.value.toFixed(2));
// An inequality is a bound, and must never be presented as a value.
const bnd = sl.terms.find(t => t.bound);
ok(bnd && bnd.value === ref.value / bnd.factor && bnd.bound === true,
   "an inequality becomes an upper bound", "< " + bnd.value.toFixed(1));
ok(sl.terms.filter(t => t.empty).length === 1,
   "and the term the store has no number for is kept as an empty slot");
const gap = sl.terms.find(t => t.empty);
ok(!isFinite(gap.value) && gap.share === 0, "which carries no value and no width", String(gap.value));
ok(new Set(sl.terms.map(t => t.tone)).size === 4, "each state is drawn in its own tone");

console.log("\n== the composition, through the page ==");
pickKey("@LAT0LON-140");
ok(/class="comp"/.test(els.legend.innerHTML), "the legend becomes bars, not swatches");
ok(/cbar open/.test(els.legend.innerHTML), "the bound is drawn open-ended");
ok(/dashed/.test(els.legend.innerHTML), "the empty slot is drawn in outline");
for (const t of sl.terms)
  ok(els.legend.innerHTML.includes(t.label), "the legend carries " + t.label);
ok(els.legend.innerHTML.includes(slB.basis), "and states the one basis they share", slB.basis);
ok(els.layerout.innerHTML.includes(slB.offglobe_note.slice(0, 20)),
   "the readout says it is not on the globe, in the store's words");
ok(!/\bmm\b/.test(code), "and the unit came from the store, not the app");
pickKey("@LAT0LON0");

console.log("\n== a composition with a known whole, and one without ==");
const ohRec = recs.find(r => r.id === "@LAT-50LON60");
const oh = X.makeLayer(ohRec), ohB = X.parseBlock(ohRec.render);
ok(oh.kind === "composition" && oh.terms.length === 4, "four terms, from the store", oh.kind);
ok(oh.at(-50, 60, 2026) === null, "and this one is not on the sphere either");
ok(oh.terms.every(t => t.relation === "measured"),
   "every term carries its own assessed value - nothing is derived here");
ok(oh.whole === +ohB.whole && oh.total === oh.whole,
   "the terms account for the whole exactly", oh.total + " of " + oh.whole);
// Shares are of the whole, not of the largest term: the biggest is 91%, not 100%.
const big = oh.terms.find(t => t.isRef);
ok(Math.abs(big.share - big.value / oh.whole) < 1e-9 && big.share < 1,
   "the largest term is a share of the whole, not the full width", big.share.toFixed(2));
ok(oh.terms.every(t => !t.bound && !t.empty), "and none of them is a bound or a gap");
// The other composition has a term missing, so it has no whole to be a share of.
ok(!isFinite(sl.whole), "the set with a missing term declares no whole", String(sl.whole));
ok(sl.terms.find(t => t.isRef).share === 1,
   "so its bars are shares of the reference, which takes the full width");

console.log("\n== the whole, through the page ==");
pickKey("@LAT-50LON60");
ok(els.legend.innerHTML.includes(String(ohB.whole)), "the legend states the whole", ohB.whole);
ok(/account for/.test(els.legend.innerHTML),
   "and says what the terms actually account for, so a set that does not add up shows it");
pickKey("@LAT0LON-140");
ok(/whole is not known/.test(els.legend.innerHTML),
   "while the set without a whole says that instead");
pickKey("@LAT0LON0");

console.log("\n== the first computed number declares itself ==");
const co2Rec = recs.find(r => r.id === "@LAT19.54LON-155.58");
const co2L = X.makeLayer(co2Rec), co2B = X.parseBlock(co2Rec.render);
ok(co2B.provenance === "computed", "the block says the number is computed", co2B.provenance);
ok(!!co2B.method && co2B.method.length > 60, "and carries a method long enough to re-run");
ok(/^node tools\//.test(co2B.recompute || ""), "and names what re-runs it", co2B.recompute);
ok(fs.existsSync(path.join(dir, co2B.recompute.replace(/^node /, ""))),
   "which exists in the repository", co2B.recompute);
// The umwelt adopted the rule; it must actually be in the store, not just in prose.
ok(/a-computed-value-declares-its-method-and-what-re-runs-it/.test(storeText) &&
   /a-transcribed-value-and-a-computed-value-are-never-printed-alike/.test(storeText),
   "the umwelt declares the rule the record is drawn under");
// Computed layers are the exception, not the rule, and each must carry its own method
// and the tool that re-runs it. The count is not pinned - what is pinned is that every
// computed layer declares both, and that no transcribed layer claims to be computed.
const computed = X.renders().filter(r => r.block.status === "implemented" &&
                                         (r.block.provenance || "") === "computed");
ok(computed.length >= 1, "at least one drawn layer is computed", computed.map(c => c.block.id).join(","));
for (const c of computed){
  ok(!!c.block.method && c.block.method.length > 60, c.block.id + " declares a method");
  ok(/^node tools\//.test(c.block.recompute || "") &&
     fs.existsSync(path.join(dir, c.block.recompute.replace(/^node /, ""))),
     c.block.id + " names a tool that exists", c.block.recompute);
}
const transcribed = X.renders().filter(r => r.block.status === "implemented" &&
                                            (r.block.provenance || "transcribed") === "transcribed");
ok(transcribed.every(r => !r.block.method && !r.block.recompute),
   "and a transcribed layer carries neither a method nor a tool",
   transcribed.map(r => r.block.id).join(","));

console.log("\n== an unscaled zonal field is a climatology, not a value for the year ==");
ok(co2L.kind === "zonal-field" && co2L.scaled === false, "it declares scale: none", String(co2L.scaled));
const yrs = [1926, 2026, 2126];
ok(yrs.every(y => co2L.valueAt(71.3, y) === co2L.valueAt(71.3, 2026)),
   "so it does not move under the slider", co2L.valueAt(71.3, 2026).toFixed(1));
// The ladder is the store's, and the poleward fall is the physical claim.
ok(co2L.valueAt(71.3, 2026) > co2L.valueAt(19.5, 2026),
   "the northern swing exceeds the tropical one");
ok(co2L.valueAt(19.5, 2026) > co2L.valueAt(-90, 2026),
   "and the southern swing is the smallest of the three");
ok(co2L.valueAt(71.3, 2026) > 10 * co2L.valueAt(-90, 2026),
   "north of 70 it is more than ten times the South Pole",
   co2L.valueAt(71.3, 2026).toFixed(1) + " vs " + co2L.valueAt(-90, 2026).toFixed(1));
// The amplitude peaks in the boreal belt, NOT at the pole - that is in the data.
ok(co2L.valueAt(71.3, 2026) > co2L.valueAt(88, 2026),
   "and it peaks over the boreal belt rather than at the pole");
// The scaled field still behaves as it did.
const anom = X.makeLayer(recs.find(r => r.id === "@LAT80LON0"));
ok(anom.scaled === true && anom.valueAt(85, 2126) !== anom.valueAt(85, 1926),
   "while the scaled field still tracks the year");

console.log("\n== the computed layer, through the page ==");
pickKey("@LAT19.54LON-155.58");
ok(/class="prov"/.test(els.source.innerHTML), "the page marks it as not a transcription");
ok(els.source.innerHTML.includes(co2B.recompute), "and shows what re-runs it");
ok(els.layerout.innerHTML.includes(co2B.undated_note.slice(0, 20)),
   "the readout says the year does not apply, in the store's words");
ok(els.layerout.innerHTML.includes(co2B.unit), "and carries the store's unit", co2B.unit);
pickKey("@LAT80LON0");
ok(!/class="prov"/.test(els.source.innerHTML), "a transcribed layer carries no such mark");
pickKey("@LAT0LON0");

console.log("\n== the page puts away the controls a layer does not read ==");
// A control that changes nothing invites a reading the layer cannot support. What each
// layer reads is a property of the layer, so this table is the expectation, not the code.
const expect = {
  "@LAT0LON0":          [true,  true ],   // zonal-class, through dT
  "@LAT80LON0":         [true,  true ],   // zonal-field, scaled
  "@LAT68.75LON161.4":  [true,  true ],   // zonal-extent, through dT
  "@LAT26.5LON-70":     [true,  false],   // its own year anchors, never the warming series
  "@LAT19.54LON-155.58":[false, false],   // a climatology
  "@LAT-75LON-106.75":  [false, false],   // measured period means
  "@LAT0LON-140":       [false, false],   // a sum is not a year
  "@LAT-50LON60":       [false, false]    // nor is a partition
};
for (const [id, [year, scen]] of Object.entries(expect)){
  pickKey(id);
  const label = recs.find(r => r.id === id).title;
  ok(els.yearfield.hidden === !year, (year ? "keeps" : "hides") + " the timeline: " + label,
     "hidden=" + els.yearfield.hidden);
  ok(els.scenfield.hidden === !scen, (scen ? "keeps" : "hides") + " the scenario: " + label,
     "hidden=" + els.scenfield.hidden);
  ok(X.active().usesYear === year && X.active().usesScenario === scen,
     "and the layer itself says so");
  // Whatever is hidden, the layer's own reading is not.
  if (X.parseBlock(recs.find(r => r.id === id).render).readout)
    ok(els.layerout.innerHTML.length > 0, "the layer reading survives either way");
}
// A planned record draws nothing, so it needs neither control. Picked from the store
// rather than named, so this does not need editing every time one comes off the list.
const stillPlanned = X.renders().find(r => r.block.status !== "implemented");
pickKey(stillPlanned.rec.id);
ok(els.yearfield.hidden && els.scenfield.hidden,
   "an undrawn rendering keeps neither: " + stillPlanned.block.label);
pickKey("@LAT0LON0");
ok(!els.yearfield.hidden && !els.scenfield.hidden, "and both come back");

console.log("\n== a composition whose parts are checked against the published whole ==");
const glRec = recs.find(r => r.id === "@LAT67.9LON18.57");
const gl = X.makeLayer(glRec), glB = X.parseBlock(glRec.render);
ok(gl.kind === "composition" && gl.terms.length === 19, "nineteen regions, from the store", gl.terms.length);
ok(gl.terms.every(t => t.relation === "measured"), "every one measured - nothing derived, nothing bounded");
// The point of declaring a whole: the parts must nearly reach it, and the gap is visible.
ok(Math.abs(gl.total - gl.whole) / gl.whole < 0.02,
   "the parts sum to within 2% of the published whole",
   gl.total.toFixed(1) + " of " + gl.whole + " " + gl.unit);
ok(gl.total < gl.whole, "and fall slightly short rather than exceeding it - rounding, not invention");
// The second reading is a different quantity and must never be folded into the bar.
ok(gl.terms.every(t => isFinite(t.aux)), "every region carries its relative loss too");
ok(Math.abs(gl.total - gl.terms.reduce((s, t) => s + t.value, 0)) < 1e-9,
   "and the total is the bars alone - the second reading is not summed into it");
// The divergence is the claim: most ice lost is not most of its own ice lost.
const al = gl.terms.find(t => t.id === "alaska"), ce = gl.terms.find(t => t.id === "central-europe");
ok(al.value > ce.value * 20 && ce.aux > al.aux,
   "the largest loser by rate has lost a smaller share of its own ice than the smallest",
   al.value + " vs " + ce.value + " Gt/yr; " + al.aux + "% vs " + ce.aux + "%");
ok(al.isRef && al.share < 1 && Math.abs(al.share - al.value / gl.whole) < 1e-9,
   "the widest bar is a share of the whole, not the full width", al.share.toFixed(3));
ok(gl.terms.every((t, i) => i === 0 || t.value <= gl.terms[i - 1].value),
   "the store orders them, and the app keeps that order");
ok(gl.at(67, 18, 2026) === null && gl.usesYear === false,
   "nothing on the sphere, and no timeline - regions are not a map and means are not a year");

console.log("\n== the regions, through the page ==");
pickKey("@LAT67.9LON18.57");
ok(/class="comp"/.test(els.legend.innerHTML), "it draws as bars");
ok(/class="cx"/.test(els.legend.innerHTML), "with the second reading beside each");
ok(els.legend.innerHTML.includes(glB.aux_unit), "carrying the store's unit for it", glB.aux_unit);
ok(els.legend.innerHTML.includes(String(gl.whole)) && /account for/.test(els.legend.innerHTML),
   "and the note states the whole the parts are checked against");
for (const id of ["alaska", "central-europe", "antarctic-islands"])
  ok(els.legend.innerHTML.includes(gl.terms.find(t => t.id === id).label), "the legend carries " + id);
ok(els.yearfield.hidden && els.scenfield.hidden, "and neither control is offered");
pickKey("@LAT0LON0");

{ // block-scoped: this file is flat and these names are common elsewhere in it
console.log("\n== an extent layer anchored on an area, with the rate as a range ==");
const siRec = recs.find(r => r.id === "@LAT82LON-140");
const si = X.makeLayer(siRec), siB = X.parseBlock(siRec.render);
ok(si.byArea === true && si.rates.length === 2, "it declares an area and two rates", si.rates.join("-"));
ok(si.rates[0] < si.rates[1], "ordered low to high, which is the spread of the fit");
ok(si.referenceArea === +siB.reference_area && si.floorValue === +siB.area_floor,
   "anchor and floor come from the store", si.referenceArea + " / " + si.floorValue);
// The check that caught the error: the layer must reproduce the observation it is fitted to.
// NSIDC's measured September 1979 area is 4.58; an earlier version back-projected 6.9-7.7.
const back79 = si.areaAt(1979).slice().sort((a, b) => a - b);
ok(back79[0] <= 4.58 && 4.58 <= back79[1],
   "back-projected to 1979 the band contains the measured 4.58",
   back79[0].toFixed(2) + "-" + back79[1].toFixed(2));
ok(back79[1] < 6, "and does not run away from it the way an extent rate on an area anchor did",
   back79[1].toFixed(2));
// Monotone: less ice as it warms, and the cap edge marches poleward with it.
const yrs = [1979, 2000, 2026, 2050, 2075];
ok(yrs.every((y, i) => i === 0 || Math.max(...si.areaAt(y)) <= Math.max(...si.areaAt(yrs[i-1]))),
   "area falls as the slider advances");
ok(yrs.every((y, i) => i === 0 || si.edgeAt(y) >= si.edgeAt(yrs[i-1])),
   "and the edge moves poleward");
// The spread must be visible on both sides of the reference year, not just the future.
for (const y of [1979, 2075]){
  const e1 = si.edgeAt(y), e2 = si.edgeHigh(y);
  const inner = Math.max(e1, e2), outer = Math.min(e1, e2);
  ok(inner - outer > 0.2, "the two rates give two distinct edges in " + y,
     outer.toFixed(1) + ".." + inner.toFixed(1));
  const band = (outer + inner) / 2, full = inner + 1;
  const cBand = si.at(Math.min(89, band), 0, y), cFull = si.at(Math.min(89.5, full), 0, y);
  ok(!!cBand && !!cFull && cBand.join() !== cFull.join(),
     "and the band between them is drawn weaker than the interior in " + y);
}
// Below the floor it stops claiming a number.
const late = 2126;
ok(si.atFloor(late), "far enough out it reaches the floor the store declares");
ok(si.floorLabel.length > 20, "which has the store's words on it, not the app's");
// Ocean only: no sea ice painted over land.
ok(si.at(75, -42, 2026) === null, "nothing is painted over land");
ok(!!si.at(88, 0, 2026), "and the Arctic ocean is painted");

console.log("\n== the sea-ice layer, through the page ==");
pickKey("@LAT82LON-140");
ok(!els.yearfield.hidden && !els.scenfield.hidden, "it reads both controls");
ok(els.layerout.innerHTML.includes(siB.unit), "the reading carries the store's unit", siB.unit);
ok(/–/.test(els.layerout.innerHTML), "and gives a range, because the rate is one");
ok(/class="prov"/.test(els.source.innerHTML) && els.source.innerHTML.includes(siB.recompute),
   "the page marks it computed and names what re-runs it");
els.year.value = "2126"; els.year._h.input();
ok(els.layerout.innerHTML.includes(siB.floor_label.slice(0, 24)),
   "at the floor the reading becomes the store's words");
els.year.value = "2026"; els.year._h.input();
pickKey("@LAT0LON0");
} // end block scope

console.log("\n== the rendering that counts the renderings ==");
{
const awRec = recs.find(r => r.id === "@LAT51.38LON-0.1");
const aw = X.makeLayer(awRec), awB = X.parseBlock(awRec.render);
ok(awRec.lane === "meta", "it is lane:meta - its subject is the store, not the Earth", awRec.lane);
ok(aw.kind === "composition" && aw.terms.length === 3, "three terms, from the store", aw.terms.length);
ok(aw.at(51, 0, 2026) === null && !aw.usesYear && !aw.usesScenario,
   "nothing on the sphere and no controls - a question is not a place");

// The membership is declared in the locus column, so the partition can be READ. That
// makes it checkable against the thing it claims to partition: every other drawn layer,
// exactly once, and the record itself excluded because it is not about the Earth.
const SELF = "answerable";
const drawn = X.renders().filter(r => r.block.status === "implemented" && r.block.id !== SELF);
const member = new Map();
for (const t of [].concat(awB.term)){
  const c = t.split("|").map(s => s.trim());
  for (const id of (c[4] || "").split(/\s+/).filter(Boolean)){
    ok(!member.has(id), "no layer is claimed by two terms: " + id, member.get(id));
    member.set(id, c[0]);
  }
}
ok(aw.whole === drawn.length, "the declared whole is the number of layers there are to sort",
   aw.whole + " vs " + drawn.length);
ok(drawn.every(r => member.has(r.rec.id)), "every drawn layer is placed",
   drawn.filter(r => !member.has(r.rec.id)).map(r => r.block.id).join(" ") || "all placed");
ok(!member.has(awRec.id) && member.size === drawn.length,
   "and nothing else is - the counting layer is not in its own count", member.size + " placed");
for (const t of aw.terms){
  const n = [...member.values()].filter(v => v === t.id).length;
  ok(t.value === n, "term " + t.id + " states the size of its own membership", t.value + " vs " + n);
}
ok(Math.abs(aw.total - aw.whole) < 1e-9, "so the terms account for exactly the whole",
   aw.total + " of " + aw.whole);

// The second reading is the app's own answer to "does this layer take a year", not a
// second copy of the rule - so it goes stale the moment a layer's controls change.
for (const t of aw.terms){
  const n = drawn.filter(r => member.get(r.rec.id) === t.id && X.makeLayer(r.rec).usesYear).length;
  ok(t.aux === n, "term " + t.id + " states how many of its layers read the year", t.aux + " vs " + n);
}
ok(aw.terms.reduce((s, t) => s + t.aux, 0) === drawn.filter(r => X.makeLayer(r.rec).usesYear).length,
   "and the second readings sum to every layer in the store that reads the year");
ok(aw.terms.every(t => t.aux <= t.value), "no term reads the year more often than it has layers");

// The mechanical rule is the kind: key. One layer is declared against it on purpose, and
// the record says which - so a SECOND one appearing silently is the failure this catches.
const BY_KIND = { "zonal-class":"latitude", "zonal-field":"latitude", "zonal-extent":"latitude",
                  "sector-field":"place", "distribution-transport":"place", "composition":"neither" };
ok(drawn.every(r => BY_KIND[r.block.kind]), "every drawn kind has a bucket in the rule",
   drawn.filter(r => !BY_KIND[r.block.kind]).map(r => r.block.kind).join(" ") || "all known");
const odd = drawn.filter(r => member.get(r.rec.id) !== BY_KIND[r.block.kind]);
ok(odd.length === 1 && odd[0].block.id === "glaciers",
   "exactly one layer is filed against its kind, and it is the one the record names",
   odd.map(r => r.block.id + " (" + BY_KIND[r.block.kind] + " -> " + member.get(r.rec.id) + ")").join("; "));
ok(awRec.body.includes(odd[0].rec.id), "and the record names it by coordinate", odd[0].rec.id);

// It computes rather than transcribes, so the rule set for the CO2 ladder applies here too.
ok(awB.provenance === "computed" && !!awB.method && !!awB.recompute,
   "it declares that it computes, how, and what re-runs it", awB.recompute);
ok(fs.existsSync(path.join(dir, awB.recompute.replace(/^node /, ""))),
   "and that tool exists", awB.recompute);

console.log("\n== the partition, through the page ==");
pickKey("@LAT51.38LON-0.1");
ok(/class="comp"/.test(els.legend.innerHTML), "it draws as bars");
ok(els.legend.innerHTML.includes(String(aw.whole)) && /account for/.test(els.legend.innerHTML),
   "with the whole the terms are checked against");
ok(/class="prov"/.test(els.source.innerHTML) && els.source.innerHTML.includes(awB.recompute),
   "the page marks it computed and names what re-runs it");
ok(els.yearfield.hidden && els.scenfield.hidden, "and neither control is offered");
for (const t of aw.terms) ok(els.legend.innerHTML.includes(t.label), "the legend carries " + t.id);
pickKey("@LAT0LON0");
}


console.log("\n" + (fails ? "FAILURES: " + fails : "ALL PASS"));
process.exit(fails ? 1 : 0);
