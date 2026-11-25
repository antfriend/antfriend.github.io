// Belief trajectories (belief-trajectories.md): a read-only report of the shape each triple's sayings
// make over the episodes that say it, and of how many episodes each construction reads. It writes
// nothing and decides nothing: a shape is offered to the owner, never consolidated.
//
//   node tools/trajectories.mjs                 the triples whose sayings disagree, and construction traffic
//   node tools/trajectories.mjs --all           every triple said in at least --min episodes
//   --store <file>                              another store (default: personal_grimoire_ttdb.md)
//   --min <n>                                   the fewest episodes a shape is read from (default 3)
//   --hold <n>                                  how many episodes a crossing must hold to count (default 2)
//   --json                                      the report as JSON
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags } = args();
const opt = k => { const i = process.argv.indexOf("--" + k); return i > 0 ? +process.argv[i + 1] : NaN; };
const MIN = opt("min") || 3, HOLD = opt("hold") || 2;
const PG = await loadEngine();
const file = path.resolve(root, flags.store || STORE);
const S = PG.openStore(read(file));
const N = S.G.num, ord = ep => S.epOrder.get(ep) || 0;
const shown = path.relative(root, file).startsWith("..") ? path.basename(file) : path.relative(root, file);

/* The series. Each episode that says a triple scores it as consolidation does (the largest `+` weight
 * and the largest `-` weight), and its sign is which is larger: +1, -1, or 0 for an episode that says
 * both alike. Retired sayings (a change in the owner's tense) are kept and flagged: the lens describes
 * what was said, not what is believed. The running balance b is beside it, priors included.          */
function seriesOf(e){
  const per = new Map();
  for (const x of e.sources){
    const w = x.q === "~" ? N.weight_partial : 1, p = per.get(x.ep) || { ep:x.ep, plus:0, minus:0, retired:false };
    if (x.pol === "+") p.plus = Math.max(p.plus, w); else p.minus = Math.max(p.minus, w);
    if (x.changed) p.retired = true;
    per.set(x.ep, p);
  }
  let fr = 0, ag = 0;
  return [...per.values()].sort((a, b) => ord(a.ep) - ord(b.ep)).map(p => {
    fr += p.plus; ag += p.minus;
    return { ...p, sign:Math.sign(p.plus - p.minus), b:(fr - ag) / (fr + ag + N.prior_for + N.prior_against) };
  });
}

/* The shape. With delay one episode and dimension two, the embedding of a sign series is its transitions
 * (++, +-, -+, --), so the shape is read from its runs: one run is a fixed point, two whose last holds for
 * --hold episodes or more is one crossing, more are an alternation. Fewer than --min episodes show nothing. */
function shapeOf(series){
  const signs = series.map(p => p.sign).filter(Boolean);
  const runs = [];
  for (const s of signs){ if (runs.length && runs[runs.length - 1].sign === s) runs[runs.length - 1].n++; else runs.push({ sign:s, n:1 }); }
  const moves = { "++":0, "+-":0, "-+":0, "--":0 }, ch = s => s > 0 ? "+" : "-";
  for (let i = 1; i < signs.length; i++) moves[ch(signs[i - 1]) + ch(signs[i])]++;
  let shape;
  if (series.length < MIN) shape = "too few";
  else if (!runs.length) shape = "both ways in every episode";
  else if (runs.length === 1) shape = "fixed point";
  else if (runs.length === 2) shape = runs[1].n >= HOLD ? "one crossing" : "crossing, not yet held";
  else shape = "alternation";
  return { shape, runs, moves };
}

const ch = s => s > 0 ? "+" : s < 0 ? "-" : "0";
const rows = [];
for (const e of S.trips.values()){
  const series = seriesOf(e), sh = shapeOf(series);
  const disagree = series.some(p => p.sign > 0) && series.some(p => p.sign < 0) || series.some(p => p.sign === 0);
  if (!flags.all && !disagree) continue;
  if (flags.all && series.length < MIN) continue;
  rows.push({ triple:[e.s, e.v, e.o].join(" | "), verdict:e.pol, conf:e.conf, episodes:series.length,
              signs:series.map(p => ch(p.sign) + (p.retired ? "r" : "")).join(" "), b:+series[series.length - 1].b.toFixed(2),
              ...sh, retiredByTense:series.some(p => p.retired) });
}
// where a shape matters most: what the verdict alone leaves unclear, then the most said
const weight = r => (r.verdict === "?" ? 2 : 0) + (r.shape === "one crossing" && !r.retiredByTense ? 2 : 0) + (r.shape === "alternation" ? 1 : 0);
rows.sort((a, b) => weight(b) - weight(a) || b.episodes - a.episodes || a.triple.localeCompare(b.triple));

/* Construction traffic. Episodes don't record which construction read a clause; a re-reading under the
 * grammar of today does, so each said line is read again, by its own language's grammar. A sentence the
 * owner amended is the owner's reading and is not counted.                                            */
const traffic = new Map(), langOf = new Map(), amended = new Set(), key = (lang, label) => lang + "|" + label;
for (const G of S.grammars) for (const c of G.constructions){
  langOf.set(c, G.lang);
  traffic.set(key(G.lang, c.label), { lang:G.lang, label:c.label, abstract:!!c.abstract, episodes:new Set(), sentences:0 });
}
const lane = +S.G.sphere.episode_lane;
for (const c of S.episodes){
  if (c.rec.lat !== lane) continue;
  const lines = S.said.get(c.rec.id), am = S.amends.get(c.rec.lon);
  if (!lines) continue;
  for (const [n, text] of lines){
    if (am && am.entries.has(n)){ amended.add(c.rec.id + "#" + n); continue; }
    for (const k of PG.shapeOf(S, text).constructions || []){
      // a construction's ancestors draw what it reads too: it says what they say
      for (const label of [k.label].concat(k.parents || [])){ const t = traffic.get(key(langOf.get(k), label)); if (t){ t.episodes.add(c.rec.id); t.sentences++; } }
    }
  }
}
const grammar = PG.reread(S).grammar;
const basins = [...traffic.values()].map(t => ({ lang:t.lang, label:t.label, abstract:t.abstract, episodes:t.episodes.size, sentences:t.sentences }));

if (flags.json){
  console.log(JSON.stringify({ store:shown, grammar, min:MIN, hold:HOLD, triples:rows, constructions:basins, amendedNotCounted:amended.size }, null, 2));
  process.exit(0);
}
console.log("belief trajectories — " + shown + " (" + S.episodes.length + " episodes; read-only, decides nothing)");
console.log("\ntriples " + (flags.all ? "said in " + MIN + "+ episodes" : "whose sayings disagree") + ": " + rows.length);
for (const r of rows){
  console.log("  " + r.triple + "   verdict " + r.verdict + " (" + r.conf + ")   " + r.episodes + " ep: " + r.signs + "   b " + r.b);
  console.log("      " + r.shape + (r.runs.length ? "  · runs " + r.runs.map(x => ch(x.sign) + x.n).join(" ") : "") +
              "  · moves ++" + r.moves["++"] + " +-" + r.moves["+-"] + " -+" + r.moves["-+"] + " --" + r.moves["--"] +
              (r.retiredByTense ? "  · the owner's tense already retired a saying" : ""));
}
if (!rows.length) console.log("  (none)");
console.log("\nconstruction traffic (grammar " + grammar + "; an ancestor counts what its descendants read)");
for (const t of basins) console.log("  " + t.lang + "  " + (t.episodes ? String(t.episodes).padStart(3) + " ep " + String(t.sentences).padStart(3) + " sent" : "  drew nothing   ") +
                                     "  " + t.label + (t.abstract ? " (abstract)" : ""));
if (amended.size) console.log("  " + amended.size + " amended sentence(s) not counted: the owner's reading stands for them");
