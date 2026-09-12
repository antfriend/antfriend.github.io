// Cross-check the docs against the store, using the APP'S OWN parser for the store.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(dir, f), "utf8");

/* --- load index.html's script with a DOM stub (same trick as harness.mjs) --- */
const app = read("index.html");
const code = app.match(/<script>\r?\n([\s\S]*?)<\/script>/)[1];
const noop = () => {};
const ctxStub = () => new Proxy({}, { get:(t,k)=> k==="createRadialGradient" ? ()=>({addColorStop:noop})
  : k==="createImageData" ? (w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)})
  : k==="measureText" ? () => ({ width: 10 })
  : (k in t ? t[k] : noop), set:(t,k,v)=>{t[k]=v;return true;} });
const el = () => ({ style:{}, value:"", min:"", max:"", textContent:"", label:"", children:[],
  addEventListener:noop, getBoundingClientRect:()=>({width:600,height:600,left:0,top:0}),
  appendChild(c){this.children.push(c);}, querySelectorAll:()=>[], getContext:ctxStub,
  set innerHTML(v){this._h=v;}, get innerHTML(){return this._h||"";} });
const els = {};
globalThis.document = { body:{}, getElementById:id=>els[id]||=el(), createElement:()=>el() };
globalThis.window = { devicePixelRatio:1, addEventListener:noop };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "#888888" });
globalThis.matchMedia = () => ({ matches:false });
globalThis.requestAnimationFrame = noop;
globalThis.fetch = async f => ({ ok:true, text: async () => read(f) });
await import("data:text/javascript;base64," + Buffer.from(
  code + "\n;globalThis.__x={records:()=>records,renders:()=>renders,parseBlock};").toString("base64"));
await new Promise(r => setTimeout(r, 200));
const X = globalThis.__x;

let fails = 0;
const ok = (c, m, x="") => { console.log((c?"  PASS  ":"  FAIL  ") + m + (x?"  "+x:"")); if(!c) fails++; };

const readme = read("README.md"), research = read("RESEARCH.md"),
      store  = read("global_memory_system_ttdb.md"), index = read("RFCs/INDEX.md");

console.log("\n== relative file links resolve ==");
for (const [src, txt, base] of [["README.md",readme,dir],["RESEARCH.md",research,dir],
                                ["RFCs/INDEX.md",index,path.join(dir,"RFCs")],["store",store,dir]]){
  const seen = new Set(); let m; const re = /\]\((?!https?:)([^)#]+)(?:#[^)]*)?\)/g;
  while ((m = re.exec(txt))){ const t = m[1]; if (seen.has(t)) continue; seen.add(t);
    ok(fs.existsSync(path.join(base, t)), src + " -> " + t); }
}
{ // href="..." in the page chrome only (skip the JS string templates)
  const chrome = app.slice(0, app.indexOf("<script>"));
  const seen = new Set(); let m; const re = /href="(?!https?:|#)([^"#]+)(?:#[^"]*)?"/g;
  while ((m = re.exec(chrome))){ if (seen.has(m[1])) continue; seen.add(m[1]);
    ok(fs.existsSync(path.join(dir, m[1])), "index.html -> " + m[1]); }
}

console.log("\n== markdown anchors resolve ==");
// github-slugger: lowercase, strip punctuation/symbols, spaces -> hyphens (no trim)
const slug = h => h.toLowerCase().replace(/[^\w\s\u00c0-\u024f-]/g,"").replace(/\s/g,"-");
const anchorsOf = t => new Set(t.split(/\r?\n/).filter(l=>/^#{1,6}\s/.test(l))
  .map(l => slug(l.replace(/^#{1,6}\s+/,""))));
const A = { "RESEARCH.md":anchorsOf(research), "README.md":anchorsOf(readme), "INDEX.md":anchorsOf(index) };
for (const [src, txt] of [["README.md",readme],["RESEARCH.md",research],["RFCs/INDEX.md",index]]){
  let m; const re = /\]\((?!https?:)([^)#]*)#([^)]+)\)/g;
  while ((m = re.exec(txt))){
    const set = A[path.basename(m[1] || src)]; if (!set) continue;
    ok(set.has(m[2]), src + " -> " + (m[1]||"") + "#" + m[2],
       set.has(m[2]) ? "" : "have: " + [...set].join(" | "));
  }
}
{ const chrome = app.slice(0, app.indexOf("<script>")); let m;
  const re = /href="(?!https?:)([^"#]+)#([^"]+)"/g;
  while ((m = re.exec(chrome))){
    const set = A[path.basename(m[1])]; if (!set) continue;
    ok(set.has(m[2]), "index.html -> " + m[1] + "#" + m[2]); } }

console.log("\n== README table matches the store (parsed by the app) ==");
const recs = X.records(), rends = X.renders();
const epsOf = r => Math.round(r.sal*(255-r.conf)/255);
const rows = [...readme.matchAll(/^\| *(\d+) *\| *\*{0,2}(.+?)\*{0,2} *(?:\*\(default\)\* *)?\| *(implemented|planned) *\| *(\d+) *\| *(\d+) *\| *\*{0,2}(\d+)\*{0,2} *\|/gm)];
ok(rows.length === 13, "13 rows", "got " + rows.length);
for (const [, n, label, status, conf, sal, eps] of rows){
  const r = rends.find(x => x.order === +n);
  ok(!!r, "row " + n + " (" + label.trim() + ") has a rendering at order " + n);
  if (!r) continue;
  ok(r.block.status === status, "row " + n + " status " + status, r.block.status);
  ok(r.rec.conf === +conf && r.rec.sal === +sal, "row " + n + " conf/sal " + conf + "/" + sal,
     r.rec.conf + "/" + r.rec.sal);
  ok(epsOf(r.rec) === +eps, "row " + n + " EPS " + eps, String(epsOf(r.rec)));
}
const top = recs.reduce((a,r)=>epsOf(r)>epsOf(a)?r:a);
ok(top.id === "@LAT26.5LON-70" && epsOf(top) === 129, "store max EPS = AMOC 129", top.id+" "+epsOf(top));
ok(/AMOC.*\(EPS 129\)/s.test(readme) && /Permafrost.*\(EPS 97\)/s.test(readme),
   "roadmap quotes the same EPS values");

console.log("\n== README scenario table matches the store ==");
const tempRec = X.records().find(r => r.id === "@LAT80LON0");
const tb = X.parseBlock(tempRec.render);
const lines = k => tb[k] == null ? [] : [].concat(tb[k]).map(l => l.split("|").map(x => x.trim()));
const scen = lines("scenario"), fut = lines("future");
const norm = t => t.replace(/[\u2013\u2014]/g, "-");
ok(scen.length >= 3, scen.length + " scenarios in the store");
ok(!!tb.scenario_period, "the store names the period its best estimates belong to", tb.scenario_period);
const srows = [...readme.matchAll(/^\| *(SSP[\d.-]+) [^|]*\| *([\d.]+) *\| *\*\*([\d.]+)\*\* *\| *([\d.\u2013-]+) *\| *([\d.]+) *\|/gm)];
ok(srows.length === scen.length, "README lists every scenario the store declares",
   "got " + srows.length + " of " + scen.length);
for (const [, id, mid, best, range, ext] of srows){
  const sc = scen.find(c => c[0] === id);
  ok(!!sc, "store declares " + id);
  if (!sc) continue;
  ok(+sc[2] === +best, id + " best estimate " + best, sc[2]);
  ok(norm(sc[3]) === norm(range), id + " very likely range " + range, sc[3]);
  const a = fut.filter(c => c[0] === id), at = y => { const r = a.find(c => +c[1] === y); return r ? +r[2] : NaN; };
  ok(a.length === 3, id + " carries 3 anchors", String(a.length));
  ok(at(2050) === +mid, id + " mid-century anchor " + mid, String(at(2050)));
  ok(at(2090) === +best, id + " end-century anchor is the best estimate", String(at(2090)));
  ok(at(2126) === +ext, id + " extended anchor " + ext, String(at(2126)));
}
// every extended anchor must be the continuation the docs say it is
for (const sc of scen){
  const a = fut.filter(c => c[0] === sc[0]), at = y => +a.find(c => +c[1] === y)[2];
  const proj = at(2090) + (at(2090) - at(2050)) / 40 * 36;
  ok(Math.abs(at(2126) - proj) <= 0.05 + 1e-9,
     sc[0] + " 2126 is the mid- to end-century trend continued, to 0.1 C",
     at(2126) + " vs " + proj.toFixed(3));
}
ok(fut.every(c => scen.some(x => x[0] === c[0])), "no anchor belongs to a scenario that is not declared");

console.log("\n== every rendering record is sourced ==");
ok(rends.length === 13, "13 rendering records", "got " + rends.length);
for (const r of rends){
  const n = (r.rec.body.match(/https?:\/\//g) || []).length;
  ok(n >= 3, "sources on " + r.rec.id + " (" + r.block.label + ")", n + " links");
  ok(/^src: RESEARCH\.md/m.test(r.rec.body), "src: pointer on " + r.rec.id);
  ok(r.block.status === "implemented" || !!r.block.blocker, "planned record states a blocker: " + r.block.id);
  if (r.block.status !== "implemented") continue;
  const srcs = [].concat(r.block.source || []).map(l => l.split("|").map(x => x.trim()));
  ok(srcs.length >= 1, "drawn layer declares its source data: " + r.block.id,
     srcs.map(c => c[0]).join(" | "));
  ok(srcs.every(c => /^https:\/\//.test(c[1] || "")), "...each with a URL the app can link");
}

console.log("\n== the app holds no climate content ==");
// Values, and the vocabulary of the layers themselves — including store keys named after
// a subject, which is how `permafrost_edge` sat in the app for four commits.
const leaks = ["427","430.5","1.48","12.1","0.11","21 million","SSP","Köppen","Koppen","ppm",
               "tropical","Arctic","AMOC","permafrost","overturning","collapse","glacier","ice sheet",
               // "poleward" and "polar" are geometry — a direction on a sphere — and the
               // app may use them. "zone shift" is a layer's label, and it may not.
               "1850","zone shift"]
  .filter(n => code.includes(n));
ok(leaks.length === 0, "no climate value or term in index.html's script", leaks.join(", "));

console.log("\n== every number in the store is load-bearing ==");
// "The file IS the model" is falsifiable only while nothing in the store is inert: delete
// a number and the app should lose something. So every key in a block the app interprets
// whose value is numbers and nothing else must be named somewhere in index.html. Prose
// keys are exempt — they document the format for a reader or another viewer and carry no
// number to go stale. The mmpdb and cursor blocks are exempt too: they are addressed to
// any conformant TTDB viewer, not to this app.
const declared = new Map();
for (const [, kind, body] of store.matchAll(/```(ttdb-[a-z]+)\n([\s\S]*?)```/g)){
  const id = /^id:\s*(\S+)/m.exec(body) ? /^id:\s*(\S+)/m.exec(body)[1] : kind;
  for (const line of body.split("\n")){
    const m = /^([a-z_]+):\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    if (!declared.has(m[1])) declared.set(m[1], []);
    declared.get(m[1]).push({ id, value: m[2] });
  }
}
const numbersOnly = v => /\d/.test(v) && !/[A-Za-z]/.test(v);
const inert = [...declared].filter(([k, uses]) => uses.some(u => numbersOnly(u.value)) && !code.includes(k));
ok(inert.length === 0, "no number-bearing key in the store is inert",
   inert.map(([k, uses]) => k + " (" + uses[0].id + ": " + uses[0].value + ")").join("; "));
for (const k of ["shift_range", "baseline"])
  ok(declared.has(k) && code.includes(k), k + " is declared and read", [...declared.get(k)][0].value);
ok([...declared].filter(([, uses]) => !uses.some(u => numbersOnly(u.value))).some(([k]) => !code.includes(k)),
   "prose keys are still allowed to go unread - the rule is about numbers, not about words");

// ...but the rule above polices KEYS, and a payload is one key. @LAT51.78LON0.3 has the
// demonstration: a 1296-character base64 grid enters as a single key, contains letters so
// numbersOnly() calls it prose, and passes this suite unread, while ONE inert number beside
// it fails and gets named. So the grid decision is enforced here rather than argued in prose.
// The longest legitimate non-URL token in the store is 29 chars (tools/sea_ice_sensitivity.mjs);
// a 5° six-symbol grid is 1296 even packed. Anything between is not a number a reader can check.
// This scan reads keys as [a-z0-9_]+ rather than the [a-z_]+ used above, on purpose: a
// payload would plausibly be named cells_5deg, and a key with a digit in it is invisible to
// the rule above. No key in the store has one today, so that gap is latent rather than live -
// but the guard against payloads should not share it.
// Every line in the block is scanned, not only the `key: value` ones, because the obvious
// way to carry a payload past a per-key rule is to wrap it across continuation lines.
// Residual and worth stating plainly: a payload wrapped NARROWER than TOKEN_MAX would still
// get through. There is no honest way to close that with a token-length rule, and the point
// of this guard is to make embedding a grid a deliberate act rather than an unnoticed one.
const TOKEN_MAX = 48;
const fat = [];
for (const [, kind, body] of store.matchAll(/```(ttdb-[a-z]+)\n([\s\S]*?)```/g)){
  const idm = /^id:\s*(\S+)/m.exec(body);
  const id = idm ? idm[1] : kind;
  for (const line of body.split("\n")){
    const m = /^([a-z0-9_]+):\s*(.*)$/.exec(line.trim());
    const where = m ? m[1] : "unkeyed line";
    for (const tok of (m ? m[2] : line.trim()).split(/\s+/))
      if (tok.length > TOKEN_MAX && !/^https?:/.test(tok))
        fat.push(where + " (" + id + ", " + tok.length + " chars)");
  }
}
ok(fat.length === 0, "no block value carries a payload-length token - a payload is one key and this rule sees keys",
   fat.join("; "));

console.log("\n== the undated state is declared, sourced and documented ==");
const amRec = recs.find(r => r.id === "@LAT26.5LON-70"), amB = X.parseBlock(amRec.render);
ok(!!amB.branch_id && !!amB.branch_values && !!amB.branch_label && !!amB.branch_note,
   "the store declares the alternative, names it and says why", amB.branch_id);
const bv = amB.branch_values.split(/\s+/).map(Number);
// two columns, where every traj line has three: the missing middle is the claim
ok(bv.length === 2 && bv[0] < bv[1], "it is a range, and it has no middle for an estimate to hide in",
   amB.branch_values);
const trajCols = [].concat(amB.traj)[0].split("|")[1].trim().split(/\s+/).length;
ok(trajCols === 3 && bv.length === 2, "a traj line carries an estimate; this does not", trajCols + " vs " + bv.length);
const trajLow = Math.min(...[].concat(amB.traj).map(l => +l.split("|")[1].trim().split(/\s+/)[0]));
ok(bv[1] < trajLow, "and it sits below the whole interpolated spread, so it is not a fast decline",
   bv[1] + " < " + trajLow);
for (const [name, txt] of [["README", readme], ["RESEARCH", research]])
  ok(txt.includes(bv[0].toFixed(2)) && txt.includes(bv[1].toFixed(2)),
     name + " quotes both ends of the state the store declares", bv[0].toFixed(2) + " and " + bv[1].toFixed(2));
ok(/medium confidence/.test(amB.branch_note), "the note carries the assessment it rests on");

console.log("\n== corrected constant is consistent everywhere ==");
ok(/amp: 90 \| 2\.5/.test(store), "store amp(90) = 2.5");
ok(!/amp: \d+ \| 3\.9/.test(store), "no 3.9 amplification left in the store");
ok(/1\.8–2\.4/.test(readme) && /1\.8–2\.4/.test(research) && /1\.8–2\.4/.test(store),
   "the CMIP6 range is stated in README, RESEARCH and the store");

console.log("\n== written-out counts of renderings match the store ==");
// Prose is exempt from the numbers rule above, so a count in a sentence is the one number
// here that can go stale unwatched - and it did: splitting one record into three took the
// store from ten renderings to twelve while two sentences went on saying ten.
const WORD = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8,
               nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14 };
const nImpl = rends.filter(r => r.block.status === "implemented").length;
const nPlan = rends.filter(r => r.block.status === "planned").length;
const EXPECT = { "":rends.length, implemented:nImpl, drawn:nImpl, planned:nPlan };
ok(rends.length === nImpl + nPlan, "every rendering is implemented or planned",
   rends.length + " vs " + nImpl + "+" + nPlan);
for (const [src, txt] of [["README.md",readme],["RESEARCH.md",research],["store",store],["index.html",app]]){
  // \s+ not " +", so a count that wraps across a line is caught too, and the
  // qualifier may read "N renderings are implemented" as well as "N renderings implemented".
  let m; const re = /\b([A-Za-z]+|\d+)\s+(?:candidate\s+)?renderings\b(?:\s+(?:are\s+)?(implemented|drawn|planned))?/g;
  while ((m = re.exec(txt))){
    const w = m[1].toLowerCase();
    const n = Object.hasOwn(WORD, w) ? WORD[w] : /^\d+$/.test(w) ? +w : null;
    if (n === null) continue;              // "climate renderings", "the list of renderings"
    const want = EXPECT[(m[2] || "").toLowerCase()];
    ok(n === want, src + ': "' + m[0] + '"', n === want ? "" : "store says " + want);
  }
}
// The same count also gets written without the noun next to it - "Five are implemented;
// seven are recorded" - and that elliptical form went stale twice while the form above
// was green, so it is checked too.
const ELLIPSIS = { implemented:nImpl, drawn:nImpl, planned:nPlan, recorded:nPlan };
for (const [src, txt] of [["README.md",readme],["RESEARCH.md",research],["store",store]]){
  let m; const re = /\b([A-Za-z]+)\s+are\s+(implemented|drawn|planned|recorded)\b/g;
  while ((m = re.exec(txt))){
    const w = m[1].toLowerCase();
    if (!Object.hasOwn(WORD, w)) continue;        // "they are implemented", "records are drawn"
    const want = ELLIPSIS[m[2]];
    ok(WORD[w] === want, src + ': "' + m[0] + '"', WORD[w] === want ? "" : "store says " + want);
  }
}
// And it gets written a third way, with the qualifier in FRONT of a synonym for the noun -
// "the six `planned` records". That form hid a live stale count from both loops above while
// they were green: the roadmap went on saying six after the count had fallen to two, because
// it said "records" where the regex wanted "renderings". A synonym should not be a hiding
// place, so the qualifier-first form is checked against the same two numbers.
// Known brittleness, since a failure here may be a false alarm: qualifier-FIRST more often
// introduces a SUBSET than a total - "four drawn layers take both" is about four of the ten,
// not a claim that ten is four. Phrase such a sentence without the noun ("all four go through
// the warming series") rather than loosening this, and keep a real stale count catchable.
for (const [src, txt] of [["README.md",readme],["RESEARCH.md",research],["store",store]]){
  let m; const re = /\b([A-Za-z]+|\d+)\s+`?(implemented|drawn|planned|recorded)`?\s+(?:records|renderings|layers)\b/g;
  while ((m = re.exec(txt))){
    const w = m[1].toLowerCase();
    const n = Object.hasOwn(WORD, w) ? WORD[w] : /^\d+$/.test(w) ? +w : null;
    if (n === null) continue;                     // "the `planned` records", "those drawn layers"
    const want = ELLIPSIS[m[2]];
    ok(n === want, src + ': "' + m[0] + '"', n === want ? "" : "store says " + want);
  }
}

console.log("\n== line endings ==");
// Every text file, not a hand-kept list: the point is that a clean clone on any platform
// gets LF, and only .gitattributes can promise that.
const TEXT = /\.(md|html|mjs|js|json|txt|ya?ml|css)$/i;
const walk = d => fs.readdirSync(d, { withFileTypes:true }).flatMap(e =>
  e.name === ".git" || e.name === "node_modules" ? []
  : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const textFiles = walk(dir).filter(f => TEXT.test(f) || !path.basename(f).slice(1).includes("."));
const crlf = textFiles.filter(f => fs.readFileSync(f).includes("\r\n"));
ok(crlf.length === 0, "LF only, across all " + textFiles.length + " text files",
   crlf.map(f => path.relative(dir, f).replace(/\\/g, "/")).join(" "));
ok(/^\*\s+text=auto\s+eol=lf\s*$/m.test(read(".gitattributes")),
   ".gitattributes pins the working tree to LF (eol=lf), not just the repository");
console.log("\n== the computed ladder and the tool that re-runs it agree ==");
// The values themselves can only be checked by recomputing them, which needs the
// network and is what `recompute:` is for. What CAN be checked offline is that the
// tool and the store still describe the SAME computation - the realistic drift.
const co2Block = X.renders().find(r => r.block.id === "co2").block;
const tool = read(co2Block.recompute.replace(/^node /, ""));
const method = co2Block.method;
for (const [what, re] of [["the period", /2013/], ["the period end", /2024/],
                          ["the 13-term average", /13[- ]term/],
                          ["the six-year minimum", /[Ss]ix complete years|MIN_YEARS = 6/]])
  ok(re.test(method) && (re.test(tool) || /2013|2024|13|6/.test(tool)),
     "method and tool agree on " + what);
ok(/Y0 = 2013, Y1 = 2024/.test(tool), "the tool pins the period the method states");
ok(/MIN_YEARS = 6/.test(tool), "and the per-month minimum the method states");
ok(/not a build step/.test(tool), "the tool says plainly that it is not a build step");
ok(!read("index.html").includes("co2_amplitude"), "and the app never calls it");
// Every rung must be a latitude on the globe, ordered, and span both poles.
const rungs = [].concat(co2Block.amp).map(l => l.split("|").map(s => +s.trim()));
ok(rungs.every(([lat]) => lat >= -90 && lat <= 90), "every rung is a real latitude");
ok(rungs.every(([lat, v]) => v > 0), "and carries a positive swing");
const lats = rungs.map(r => r[0]);
ok(lats[0] === 90 && lats[lats.length - 1] === -90, "the ladder spans pole to pole",
   lats[0] + " to " + lats[lats.length - 1]);
ok(lats.every((v, i) => i === 0 || v < lats[i - 1]), "and is ordered", lats.join(" "));

console.log("\n== the measured grid figures and the docs still agree ==");
// The CO2 tool needs the network, so only its METHOD can be checked offline. grid_payload.mjs
// needs nothing but the repository, so its numbers can be re-derived right here - and they
// have to be, because the figures at @LAT51.78LON0.3 and in README/RESEARCH are prose, which
// this suite has already been taught goes stale unwatched. Change the coastlines and the
// 476 B is wrong in three files with nothing to catch it. Now something does.
const { execFileSync } = await import("node:child_process");
const gp = execFileSync(process.execPath, [path.join(dir, "tools", "grid_payload.mjs")],
                        { cwd: dir, encoding: "utf8" });
// the docs write long numbers with a thin space ("2 592 cells"), so compare on digits alone
const flat = t => t.replace(/(\d)[\s ](\d{3})(?!\d)/g, "$1$2");
const grab = re => { const m = re.exec(gp); return m ? m[1] : null; };
const figures = {
  "polygons":        grab(/(\d+) polygons/),
  "vertices":        grab(/(\d+) vertices/),
  "zonal row-major": grab(/zonal class over land, row-major.*?-> *(\d+) B base64/s),
  "zonal col-major": grab(/zonal class over land, column-major.*?-> *(\d+) B base64/s),
  "packed bound":    grab(/= (\d+) B ->/),
  "packed base64":   grab(/= \d+ B -> (\d+) B base64/),
  "the 1° mask":     grab(/land mask at 1°: (\d+) cells/),
};
const flatStore = flat(store), flatReadme = flat(readme);
for (const [what, v] of Object.entries(figures)) ok(v !== null, "the tool still reports " + what, String(v));
// Each figure is anchored to the CLAIM it appears in, not searched for loosely: a bare
// `includes("15")` passes on almost any prose, so deleting a coastline polygon would have
// slipped through it. Anchored, the same edit fails and names the number that moved.
const claims = [
  ["polygon count",        /(\d+) hand-authored coastline polygons/, figures["polygons"]],
  ["vertex count",         /coastline polygons, (\d+) vertices/,     figures["vertices"]],
  ["run-length encoding",  /run-length-encodes to \*\*(\d+) B\*\*/,  figures["zonal row-major"]],
  ["column-major cost",    /\*\*(\d+) B column-major\*\*/,           figures["zonal col-major"]],
  ["packed bound",         /\*\*(\d+) B, or \d+ B base64/,           figures["packed bound"]],
  ["bound in base64",     /\*\*\d+ B, or (\d+) B base64/,           figures["packed base64"]],
  ["1° mask",              /(\d+) cells, 25 times the \d+/,          figures["the 1° mask"]],
];
for (const [what, re, measured] of claims){
  const m = re.exec(flatStore);
  ok(!!m && m[1] === measured, "@LAT51.78LON0.3 states the measured " + what,
     m ? (m[1] === measured ? m[1] : m[1] + " stated, " + measured + " measured") : "claim not found");
}
for (const [what, re, measured] of [["the measured figure", /RLEs to \*\*(\d+) B\*\*/, figures["zonal row-major"]],
                                    ["the bound", /\*\*\d+ B, or (\d+) B base64/, figures["packed base64"]]]){
  const m = re.exec(flatReadme);
  ok(!!m && m[1] === measured, "and README states " + what,
     m ? (m[1] === measured ? m[1] : m[1] + " stated, " + measured + " measured") : "claim not found");
}

console.log("\n== every tool is a tool, and none of them is a build step ==");
// The two checks above were written for the CO2 tool and are really a rule about all of
// them: no-build-no-dependency is the property that makes "the file IS the model" checkable,
// so a tool that the app called would quietly end it. Stated over the directory, it also
// covers tools that compute nothing - grid_payload.mjs measures an encoding rather than a
// value, so no `recompute:` line names it and nothing else here would have.
const toolFiles = fs.readdirSync(path.join(dir, "tools")).filter(f => f.endsWith(".mjs")).sort();
ok(toolFiles.length > 0, "tools/ has tools in it", toolFiles.join(" "));
for (const f of toolFiles){
  const src = read(path.join("tools", f));
  ok(/not a build step/i.test(src), "tools/" + f + " says plainly that it is not a build step");
  ok(!app.includes(f.replace(/\.mjs$/, "")), "and the app never calls tools/" + f);
}

console.log("\n== the argument against a fourth term is arithmetic, and prose goes stale ==");
// @LAT51.38LON-0.1 rejects a fourth term by counting: a partition of N becomes a set of
// N + N, because the fourth question is asked of every layer. Both numbers are written
// out in words in three files, and this suite has twice learned that a written-out count
// is the one number nothing watches. It got this wrong once already - eighteen for twenty.
const awB = X.parseBlock(recs.find(r => r.id === "@LAT51.38LON-0.1").render);
const nDrawn = rends.filter(r => r.block.status === "implemented" && r.block.id !== "answerable").length;
ok(+awB.whole === nDrawn, "the declared whole is the layers it partitions", awB.whole + " vs " + nDrawn);
const W2 = { ...WORD, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20 };
let seen = 0;
for (const [src, txt] of [["store", store], ["README.md", readme], ["RESEARCH.md", research]]){
  const m = /partition of ([a-z]+) into a set of ([a-z]+)/.exec(txt);
  ok(!!m, src + " states the argument", m ? m[0] : "not found");
  if (!m) continue;
  seen++;
  ok(W2[m[1]] === nDrawn, src + ': "partition of ' + m[1] + '"', "store draws " + nDrawn);
  ok(W2[m[2]] === nDrawn * 2, src + ': "a set of ' + m[2] + '"', "should be " + (nDrawn * 2));
}
ok(seen === 3, "all three files carry it", seen + " of 3");

console.log("\n" + (fails ? "FAILURES: " + fails : "ALL PASS"));
process.exit(fails ? 1 : 0);
