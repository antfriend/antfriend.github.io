// Replay every episode, recompute every belief, and report where the store's
// term records have drifted from the percepts they claim to consolidate.
// Beliefs are derived data; this is what re-derives them (Blueprint 5).
//
//   node tools/consolidate.mjs              report only; exit 1 on drift
//   node tools/consolidate.mjs --write      rewrite drifted term records in place
import fs from "node:fs";
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags } = args();
const PG = await loadEngine();
const file = path.resolve(root, flags.store || STORE);
const S = PG.openStore(read(file));

const drift = [];
for (const t of [...S.things.values(), ...S.vectors.values()]){
  const stored = PG.parseBlock(t.chunk.rec.term);
  const now = PG.termState(S, t);
  const lines = [].concat(stored.belief || []).map(l => "belief: " + l);
  if (lines.join("\n") !== now.lines.join("\n")) drift.push(t.lemma + ": belief lines");
  if (+stored.seen !== now.seen) drift.push(t.lemma + ": seen " + stored.seen + " -> " + now.seen);
  if (t.chunk.rec.conf !== now.conf) drift.push(t.lemma + ": conf " + t.chunk.rec.conf + " -> " + now.conf);
}
const beliefs = [...S.trips.values()];
console.log(S.episodes.length + " episodes, " + beliefs.reduce((m, e) => m + e.sources.length, 0) + " percepts, " +
  beliefs.length + " beliefs (" + beliefs.filter(e => e.decided).length + " decided, " +
  beliefs.filter(e => e.pol === "?").length + " contested)");
for (const m of S.malformed) console.log("  skipped malformed percept in " + m.id + ": " + m.line);
console.log(S.G.rules.length + " rules, " + S.derived.size + " conclusions held in memory, " +
  S.superseded.size + " facts retired along exclusive vectors");
for (const e of S.G.ruleErrors) console.log("  rejected rule (" + e.why + "): " + e.line);
if (S.G.ruleErrors.length) process.exitCode = 1;
if (!drift.length){ console.log("no drift"); process.exit(process.exitCode || 0); }
for (const d of drift) console.log("  drift  " + d);
if (flags.write){
  PG.syncTerms(S, Math.floor(Date.now() / 1000), new Set());
  fs.writeFileSync(file, PG.serializeStore(S.st));
  console.log("rewrote " + path.relative(root, file));
  process.exit(0);
}
process.exit(1);
