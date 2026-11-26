// The slow-verb meter (TTG-RFC-0003 §4, pace; @LAT98LON10): a read-only report of how fast what the
// owner says of each term changes, per episode that says anything of it. A change is a turn (a triple
// switching sign between episodes) or a move (along an exclusive vector, a later saying at another
// object). It writes nothing and decides nothing.
//
//   node tools/pace.mjs                         every term read at all, fastest first
//   node tools/pace.mjs --all                   and the terms too new to read (fewer than pace_min_episodes)
//   --store <file>                              another store (default: personal_grimoire_ttdb.md)
//   --json                                      the report as JSON
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags } = args();
const PG = await loadEngine();
const file = path.resolve(root, flags.store || STORE);
const S = PG.openStore(read(file));
const shown = path.relative(root, file).startsWith("..") ? path.basename(file) : path.relative(root, file);
const NAME = { [PG.PACE.FEW]:"too few", [PG.PACE.STILL]:"still", [PG.PACE.SLOW]:"slow", [PG.PACE.FAST]:"fast" };

const lemmas = [...new Set([...S.things.keys(), ...S.vectors.keys()])];
const rows = lemmas.map(l => PG.paceOf(S, l)).filter(m => m.episodes && (flags.all || m.band !== PG.PACE.FEW))
  .sort((a, b) => b.pace - a.pace || b.episodes - a.episodes || a.lemma.localeCompare(b.lemma))
  .map(m => ({ term:m.lemma, band:NAME[m.band], pace:+m.pace.toFixed(3), changes:m.changes, turns:m.turns, moves:m.moves,
               episodes:m.episodes, turned:m.triples.map(t => [t.s, t.v, t.o].join(" | ") + " ×" + t.turns) }));

if (flags.json){
  console.log(JSON.stringify({ store:shown, min:S.G.num.pace_min_episodes ?? null, fast:S.G.num.pace_fast ?? null, terms:rows }, null, 2));
  process.exit(0);
}
console.log("slow-verb meter — " + shown + " (" + S.episodes.length + " episodes; read-only, decides nothing)");
if (!(S.G.num.pace_min_episodes > 0)) console.log("  the store declares no pace_min_episodes, so no term has a pace in a reply");
console.log("  pace = changes per episode; fast at " + (S.G.num.pace_fast ?? "-") + ", read from " + (S.G.num.pace_min_episodes ?? "-") + " episodes\n");
for (const r of rows){
  console.log("  " + r.band.padEnd(8) + r.pace.toFixed(2).padStart(5) + "   " + r.term.padEnd(18) + r.changes + " in " + r.episodes + " ep" +
              (r.changes ? "   (" + r.turns + " turn" + (r.turns === 1 ? "" : "s") + ", " + r.moves + " move" + (r.moves === 1 ? "" : "s") + ")" : ""));
  for (const t of r.turned) console.log("            turned: " + t);
}
if (!rows.length) console.log("  (none)");
