// The docs against the store, using the engine's own parser and reasoner.
import fs from "node:fs";
import path from "node:path";
import { loadEngine, read, root } from "../tools/harness.mjs";

const PG = await loadEngine();
const store = read("personal_grammar_ttdb.md"), readme = read("README.md"), index = read("RFCs/INDEX.md");
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
    ok(fs.existsSync(path.join(base, t)), src + " -> " + t);
  }
}
{ const chrome = app.slice(0, app.indexOf("<script>")); const seen = new Set(); let m;
  const re = /href="(?!https?:|#)([^"#]+)(?:#[^"]*)?"/g;
  while ((m = re.exec(chrome))){ if (seen.has(m[1])) continue; seen.add(m[1]); ok(fs.existsSync(path.join(root, m[1])), "index.html -> " + m[1]); } }

console.log("\n== README anchors resolve ==");
const slug = h => h.toLowerCase().replace(/[^\w\sÀ-ɏ-]/g, "").replace(/\s/g, "-");
const anchors = new Set(readme.split(/\r?\n/).filter(l => /^#{1,6}\s/.test(l)).map(l => slug(l.replace(/^#{1,6}\s+/, ""))));
for (const m of readme.matchAll(/\]\(#([^)]+)\)/g)) ok(anchors.has(m[1]), "README -> #" + m[1]);

console.log("\n== toot links and src: lines in the store ==");
const S = PG.openStore(store);
const recs = PG.records(S.st);
for (const m of new Set([...store.matchAll(/\]\((lat-?[\d.]+lon-?[\d.]+)\)/gi)].map(x => x[1]))){
  const t = /^lat(-?[\d.]+)lon(-?[\d.]+)$/i.exec(m);
  ok(recs.some(r => r.lat === +t[1] && r.lon === +t[2]), "toot link " + m + " names a record");
}
for (const m of store.matchAll(/^src: (RFCs\/[^\s]+) §(\d+)/gm)){
  const file = path.join(root, m[1]);
  const exists = fs.existsSync(file);
  ok(exists && new RegExp("^## " + m[2] + "\\. ", "m").test(fs.readFileSync(file, "utf8")), "src: " + m[1] + " §" + m[2] + " exists");
}
ok(recs.filter(r => r.lon === 0 && r.lat > 0 && r.lat < 90).length === 8, "eight blueprint records north of the origin");
ok(recs.filter(r => r.lon === 0 && r.lat < 0 && r.lat > -90 && r.grammar != null).length === 7, "seven grammar records south of it");
ok(rfcs.filter(f => f.startsWith("TTG-")).every(f => index.includes(f)) && rfcs.every(f => f === "INDEX.md" || index.includes(f)),
   "RFCs/INDEX.md lists every RFC in the folder");

console.log("\n== README 'What it can answer' matches the engine ==");
const rows = [...readme.matchAll(/^\| \*(.+?)\* \| (\w+) \| (.+?) \|$/gm)];
ok(rows.length === 8, "8 rows", String(rows.length));
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
  const p = PG.answer(PG.openStore(store), "Can penguins fly?", 1789400000);
  ok(flat.includes("*" + p.notes[0].replace(/\.$/, "") + "*"), "the penguin exception is quoted exactly", p.notes[0]);
}

console.log("\n== README roadmap matches the lane-98 weights ==");
const rm = [...readme.matchAll(/^\| `(@LAT98LON\d+)` \| .+? \| (\d+) \| (\d+) \| \*{0,2}(\d+)\*{0,2} \|$/gm)];
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

console.log("\n" + (fails ? fails + " FAILED" : "all passed"));
process.exit(fails ? 1 : 0);
