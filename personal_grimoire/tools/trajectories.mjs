// Belief trajectories (TTG-RFC-0003 §4 and Appendix A): a read-only report of the shape each triple's sayings
// make over the episodes that say it, and of how many episodes each construction reads. It writes
// nothing and decides nothing: a shape is offered to the owner, never consolidated.
//
//   node tools/trajectories.mjs                 the triples whose sayings disagree, and construction traffic
//   node tools/trajectories.mjs --all           every triple said in at least --min episodes
//   --store <file>                              another store (default: personal_grimoire_ttdb.md)
//   --min <n>                                   the fewest episodes a shape is read from (default: the store's
//                                               trajectory_min_episodes, else 3)
//   --hold <n>                                  how many episodes a crossing must hold (default: trajectory_hold, else 2)
//   --json                                      the report as JSON
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags } = args();
const opt = k => { const i = process.argv.indexOf("--" + k); return i > 0 ? +process.argv[i + 1] : NaN; };
const PG = await loadEngine();
const file = path.resolve(root, flags.store || STORE);
const S = PG.openStore(read(file));
// the store's own numbers, as the reply uses them; a flag overrides them, and a store that declares none reads 3 and 2
const MIN = opt("min") || S.G.num.trajectory_min_episodes || 3, HOLD = opt("hold") || S.G.num.trajectory_hold || 2;
const shown = path.relative(root, file).startsWith("..") ? path.basename(file) : path.relative(root, file);

/* The series and its shape are the engine's own (trajectoryOf, TTG-RFC-0003 §4), so this report and the
 * reply's note can't disagree. With delay one episode and dimension two, the embedding of a sign series
 * is its transitions (++, +-, -+, --), printed beside the runs.                                        */
const NAME = { [PG.TRAJ.FEW]:"too few", [PG.TRAJ.FIXED]:"fixed point", [PG.TRAJ.CROSSING]:"one crossing",
               [PG.TRAJ.UNHELD]:"crossing, not yet held", [PG.TRAJ.ALTERNATION]:"alternation", [PG.TRAJ.BOTH]:"both ways in every episode" };
const ch = s => s > 0 ? "+" : s < 0 ? "-" : "0";
const rows = [];
for (const e of S.trips.values()){
  const t = PG.trajectoryOf(S, e, MIN, HOLD), series = t.series;
  const disagree = series.some(p => p.sign > 0) && series.some(p => p.sign < 0) || series.some(p => p.sign === 0);
  if (!flags.all && !disagree) continue;
  if (flags.all && series.length < MIN) continue;
  const signs = series.map(p => p.sign).filter(Boolean), moves = { "++":0, "+-":0, "-+":0, "--":0 };
  for (let i = 1; i < signs.length; i++) moves[ch(signs[i - 1]) + ch(signs[i])]++;
  rows.push({ triple:[e.s, e.v, e.o].join(" | "), verdict:e.pol, conf:e.conf, episodes:series.length,
              signs:series.map(p => ch(p.sign) + (p.retired ? "r" : "")).join(" "), b:+series[series.length - 1].b.toFixed(2),
              shape:NAME[t.shape], runs:t.runs, moves, retiredByTense:t.retired });
}
// where a shape matters most: what the verdict alone leaves unclear, then the most said
const weight = r => (r.verdict === "?" ? 2 : 0) + (r.shape === "one crossing" && !r.retiredByTense ? 2 : 0) + (r.shape === "alternation" ? 1 : 0);
rows.sort((a, b) => weight(b) - weight(a) || b.episodes - a.episodes || a.triple.localeCompare(b.triple));

/* Construction traffic comes with the re-reading (TTG-RFC-0005 §5.1): every said line read again under
 * today's grammar, in its own language and in the context of the sentences before it.                  */
const rr = PG.reread(S), grammar = rr.grammar;
const basins = rr.traffic.map(t => ({ lang:t.lang, label:t.label, abstract:t.abstract, episodes:t.episodes, sentences:t.sentences }));

if (flags.json){
  console.log(JSON.stringify({ store:shown, grammar, min:MIN, hold:HOLD, triples:rows, constructions:basins }, null, 2));
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
