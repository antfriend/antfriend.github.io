// The docs against the store, using the engine's own parser and reasoner.
import fs from "node:fs";
import path from "node:path";
import { loadEngine, read, root } from "../tools/harness.mjs";

const PG = await loadEngine();
const store = read("personal_grimoire_ttdb.md"), readme = read("README.md"), index = read("RFCs/INDEX.md");
const app = read("index.html");

let fails = 0;
const ok = (c, m, x = "") => { console.log((c ? "  PASS  " : "  FAIL  ") + m + (x ? "  " + x : "")); if (!c) fails++; };

console.log("\n== relative links resolve ==");
const rfcs = fs.readdirSync(path.join(root, "RFCs")).filter(f => f.endsWith(".md"));
for (const [src, txt, base] of [["README.md", readme, root], ["RFCs/INDEX.md", index, path.join(root, "RFCs")], ["store", store, root],
                                ...rfcs.filter(f => f.startsWith("TTG-")).map(f => ["RFCs/" + f, read("RFCs/" + f), path.join(root, "RFCs")])]){
  // upstream RFCs are verbatim copies whose example links point into the upstream corpus; only this project's own are checked
  const seen = new Set(); let m;
  const re = /\]\((?!https?:|mailto:)([^)#\s]+)(?:#[^)]*)?\)/g;
  while ((m = re.exec(txt))){
    const t = m[1];
    if (seen.has(t) || /^lat-?[\d.]+lon-?[\d.]+$/i.test(t) || t.startsWith("?")) continue;
    seen.add(t);
    // a link into the root RFC reader: the reader and the RFC it asks for must both be there,
    // by file name or by the bare id the reader resolves against the corpus
    const q = t.indexOf("?");
    if (q >= 0){
      const at = path.join(base, t.slice(0, q)), ask = new URLSearchParams(t.slice(q + 1)).get("rfc");
      const here = fs.existsSync(at), stem = String(ask || "").replace(/\.md$/i, "");
      const dir = here && fs.statSync(at).isDirectory() ? at : path.dirname(at);
      ok(here && (!ask || fs.readdirSync(dir).some(f => f === stem + ".md" || f.indexOf(stem + "-") === 0)),
         src + " -> " + t);
      continue;
    }
    ok(fs.existsSync(path.join(base, t)), src + " -> " + t);
  }
}
{ const chrome = app.slice(0, app.indexOf("<script>")); const seen = new Set(); let m;
  const re = /href="(?!https?:|data:|#)([^"#]+)(?:#[^"]*)?"/g;  // a data: URI is not a relative link
  while ((m = re.exec(chrome))){ if (seen.has(m[1])) continue; seen.add(m[1]); ok(fs.existsSync(path.join(root, m[1])), "index.html -> " + m[1]); } }

console.log("\n== README anchors resolve ==");
const slug = h => h.toLowerCase().replace(/[^\w\sÀ-ɏ-]/g, "").replace(/\s/g, "-");
const anchors = new Set(readme.split(/\r?\n/).filter(l => /^#{1,6}\s/.test(l)).map(l => slug(l.replace(/^#{1,6}\s+/, ""))));
for (const m of readme.matchAll(/\]\(#([^)]+)\)/g)) ok(anchors.has(m[1]), "README -> #" + m[1]);

console.log("\n== toot links and src: lines in the store and the README ==");
const S = PG.openStore(store);
const recs = PG.records(S.st);
for (const m of new Set([...(store + "\n" + readme).matchAll(/\]\((lat-?[\d.]+lon-?[\d.]+)\)/gi)].map(x => x[1]))){
  const t = /^lat(-?[\d.]+)lon(-?[\d.]+)$/i.exec(m);
  ok(recs.some(r => r.lat === +t[1] && r.lon === +t[2]), "toot link " + m + " names a record");
}
for (const m of store.matchAll(/^src: (RFCs\/[^\s]+) §(\d+)/gm)){
  const file = path.join(root, m[1]);
  const exists = fs.existsSync(file);
  ok(exists && new RegExp("^## " + m[2] + "\\. ", "m").test(fs.readFileSync(file, "utf8")), "src: " + m[1] + " §" + m[2] + " exists");
}
ok(recs.filter(r => r.lon === 0 && r.lat > 0 && r.lat < 90).length === 9, "nine blueprint records north of the origin");
ok(recs.filter(r => r.lon === 0 && r.lat < 0 && r.lat > -90 && r.grammar != null).length === 8, "eight grammar records south of it");
ok(rfcs.filter(f => f.startsWith("TTG-")).every(f => index.includes(f)) && rfcs.every(f => f === "INDEX.md" || index.includes(f)),
   "RFCs/INDEX.md lists every RFC in the folder");

console.log("\n== the runtime's surface record matches the runtime (TTG-RFC-0001 §10) ==");
{
  const surf = recs.find(r => r.id === "@LAT85LON0");
  const body = surf ? surf.body : "";
  const exported = Object.keys(PG);
  const named = new Set([...body.matchAll(/`([A-Za-z]\w*)(?:\(|`)/g)].map(m => m[1]));
  const unlisted = exported.filter(k => !named.has(k));
  ok(surf && unlisted.length === 0, "every name PG exports is listed in Blueprint 9", unlisted.join(", "));
  const script = app.slice(app.indexOf("<script>"));
  const cut = script.indexOf("The page. Everything below touches the DOM");
  const engine = script.slice(0, cut), page = script.slice(cut);
  const called = [...new Set([...body.matchAll(/`(?:PG\.)?([a-z]\w*)\(/g)].map(m => m[1]))];
  const phantom = called.filter(k => !exported.includes(k) && !new RegExp("\\nfunction " + k + "\\(").test(page));
  ok(called.length >= 10 && phantom.length === 0, "every call Blueprint 9 names is on PG, or is a page function (" + called.length + " named)", phantom.join(", "));
  ok(engine.length > 1000 && body.includes("The page. Everything below touches the DOM"), "the engine/page divider Blueprint 9 quotes is in the script");
  ok(!/\b(Date|localStorage|fetch|document|window)\b/.test(engine.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")),
     "above the divider: no clock, no storage, no network, no DOM");
  ok(script.includes('typeof document !== "undefined" && document.getElementById("app")') && body.includes("`#app`"), "the boot gate Blueprint 9 describes is the one in the page");
  for (const m of body.matchAll(/`#(\w+)(?:\[([^\]`]+)\])?`/g)){
    const el = new RegExp('id="' + m[1] + '"[^>]*>').exec(app);
    const attrs = (m[2] || "").split("|").map(a => a.trim()).filter(a => a.startsWith("data-") && !a.includes("<"));
    ok(el && attrs.every(a => el[0].includes(a + "=")), "chrome element #" + m[1] + (attrs.length ? " carries " + attrs.join(", ") : " exists"));
  }
  // an attribute Blueprint 9 names on its own, not on a chrome element: the ones the
  // page writes onto markup it generates, which is the only place a host would look
  for (const m of new Set([...body.matchAll(/`(data-[A-Za-z-]+)`/g)].map(x => x[1])))
    ok(app.includes(m + '="'), "the page writes the attribute Blueprint 9 names: " + m);
  const lsKey = /LS_KEY = "([^"]+)"/.exec(app);
  ok(lsKey && body.includes("`" + lsKey[1] + "`"), "the localStorage key Blueprint 9 names is the page's", lsKey && lsKey[1]);
}

console.log("\n== README 'What it can answer' matches the engine ==");
const rows = [...readme.matchAll(/^\| \*(.+?)\* \| (\w+) \| (.+?) \|$/gm)];
ok(rows.length === 10, "10 rows, one answered by a rule and one in Spanish", String(rows.length));
for (const [, q, intent, says] of rows){
  const s = PG.openStore(store);
  const r = PG.answer(s, q, 1789400000);
  const shown = r.verdict || r.head || (r.portraits[0] && r.portraits[0].head) || "";
  ok(r.intent === intent && shown === says, q, r.intent + " / " + shown);
}
{
  const s = PG.openStore(store);
  const r = PG.answer(s, "Does Pixel chase mice?", 1789400000);
  ok(/pixel —is a→ cat ⟹ cat —chase→ mouse/.test(readme) && r.items[0].path.map(e => e.s + ">" + e.v + ">" + e.o).join(" ") === "pixel>is_a>cat cat>chase>mouse",
     "the Pixel chain in the README is the chain the engine walks");
  const w = PG.answer(PG.openStore(store), "Is a whale a fish?", 1789400000);
  const flat = readme.replace(/\s+/g, " ");
  ok(flat.includes("*" + w.notes[0] + "*"), "the whale no-purchase note is quoted exactly", w.notes[0]);
  const moved = PG.openStore(store);
  const told = PG.answer(moved, "Pixel moved to the kitchen.", 1789400000), sun = PG.answer(moved, "Is Pixel in the sun?", 1789400000);
  // the README wraps the plain reply: episode IDs dropped, each quote and the later ground on their own lines
  const plain = PG.replyText(moved, sun).replace(/ \(@LAT[\d.-]+LON[\d.-]+\)/g, "").replace(/ — “/g, "\n    — “").replace(/ (since \[)/, "\n  $1");
  const doc = readme.replace(/\r\n?/g, "\n");
  ok(doc.includes(told.verdict + "\n  …\n" + told.notes[0] + "\n") && doc.includes(plain),
     "the 'What no longer holds' example is what the engine says", JSON.stringify(plain));
  const p = PG.answer(PG.openStore(store), "Can penguins fly?", 1789400000);
  ok(flat.includes("*" + p.notes[0].replace(/\.$/, "") + "*"), "the penguin exception is quoted exactly", p.notes[0]);
  // 'How it read you': every reading the README quotes is the engine's
  const reads = [["Pixel chases mice that eat cheese.", "[pixel] {chases} [mice] that {eat} [cheese]."],
                 ["Fruit flies like bananas.", "[fruit] {flies} [like bananas]."],
                 ["I doubt cats like fish.", "[i] {doubt} [cats] {like} [fish]."],
                 ["(I think) cats bark.", "(i think) [cats] {bark}."]];
  const says = [["Fruit flies like bananas.", "fruit | fly | banana"], ["[Fruit flies] {like} [bananas].", "fly | like | banana"],
                ["[Fruit_flies] {like} [bananas].", "fruit_fly | like | banana"], ["I like fly fishing.", "self | like | fishing"],
                ["[i] {like} [fly_fishing].", "self | like | fly_fishing"]];
  const trip = t => PG.shapeOf(PG.openStore(store), t).percepts.map(x => [x.s, x.v, x.o].join(" | ")).join();
  const wrongShape = reads.filter(([t, sh]) => PG.shapeOf(PG.openStore(store), t).shape !== sh || !flat.includes(sh.replace(/\.$/, "")));
  const wrongSay = says.filter(([t, want]) => trip(t) !== want || !flat.includes("`" + want + "`"));
  ok(!wrongShape.length && !wrongSay.length, "the shapes and readings 'How it read you' quotes are the engine's",
     wrongShape.concat(wrongSay).map(x => x[0]).join(" ; "));
  // one percept of several, quoted with its polarity where it is held
  const among = [["I doubt cats like fish.", "self | doubt | -"], ["I doubt cats like fish.", "cat | like | fish | ?"],
                 ["Cats that chase mice are fast.", "cat | has_property | fast"], ["El gato negro duerme.", "gato"],
                 ["(I think) cats bark.", "cat | bark | - | +"], ["The dog that the cat chased ran away.", "cat | chase | dog"]];
  const wrongAmong = among.filter(([t, want]) => !flat.includes("`" + want + "`") ||
    !PG.shapeOf(PG.openStore(store), t).percepts.some(x => (x.s + " | " + x.v + " | " + x.o + " | " + x.pol).startsWith(want)));
  ok(!wrongAmong.length, "the held, relative and head examples it quotes are percepts the engine forms", wrongAmong.map(x => x[1]).join(" ; "));
}

console.log("\n== README roadmap matches the lane-98 weights ==");
const rm = [...readme.matchAll(/^\| \[?`(@LAT98LON\d+)`(?:\]\(lat[^)]+\))? \| .+? \| (\d+) \| (\d+) \| \*{0,2}(\d+)\*{0,2} \|$/gm)];
const lane = recs.filter(r => r.lat === 98);
ok(rm.length === lane.length, "one roadmap row per design belief", rm.length + " of " + lane.length);
let prev = Infinity;
for (const [, id, conf, sal, eps] of rm){
  const r = lane.find(x => x.id === id);
  ok(r && r.conf === +conf && r.sal === +sal && r.eps === +eps, id + " conf/sal/EPS " + conf + "/" + sal + "/" + eps, r ? r.conf + "/" + r.sal + "/" + r.eps : "missing");
  ok(+eps <= prev, id + " is in EPS order"); prev = +eps;
}

console.log("\n== counts in prose ==");
const eps = recs.filter(r => r.lat === 90).length;
ok(/eight demo episodes/.test(readme) && eps === 8, "README says eight demo episodes; the store has " + eps);
ok(S.malformed.length === 3 && readme.includes("*3 malformed skipped*"), "README quotes the malformed count the status bar shows");
const appTest = read("tests/app.test.mjs");
const parseCases = (appTest.match(/section\("parsing[\s\S]*?const cases = \[([\s\S]*?)\n  \];/) || [])[1] || "";
const qCases = (appTest.match(/section\("reasoning[\s\S]*?const cases = \[([\s\S]*?)\n  \];/) || [])[1] || "";
const count = s => (s.match(/^\s*\["/gm) || []).length;
ok(readme.includes("fifteen parses") && count(parseCases) === 15, "README's 'fifteen parses' matches the suite", String(count(parseCases)));
ok(readme.includes("fourteen questions") && count(qCases) === 14, "README's 'fourteen questions' matches the suite", String(count(qCases)));
{
  // the bilingual belief quotes what merging the two lexicons would break; re-run it over every parse case
  const texts = [...parseCases.matchAll(/^\s*\["([^"]+)"/gm)].map(m => m[1]);
  const pk = p => [p.s, p.v, p.o, p.pol, p.q].join(" | ");
  const apart = PG.openStore(store), merged = PG.openStore(store.replace(/kind: lexicon\r?\nlang: es\r?\n/, "kind: lexicon\n"));
  const broke = texts.filter(t => PG.perceiveSentence(apart, t, { last:null }).percepts.map(pk).join() !== PG.perceiveSentence(merged, t, { last:null }).percepts.map(pk).join());
  const belief = recs.find(r => r.id === "@LAT98LON7");
  ok(belief && belief.body.replace(/\s+/g, " ").includes("break " + broke.length + " of the fifteen English parse cases"),
     "@LAT98LON7 quotes how many of the fifteen parses a merged lexicon breaks", broke.length + ": " + broke.join(" ; "));
}

console.log("\n" + (fails ? fails + " FAILED" : "all passed"));
process.exit(fails ? 1 : 0);
