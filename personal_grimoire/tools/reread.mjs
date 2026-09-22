// Read every sentence the store holds again, under the grammar it holds now, and
// report each one that now reads differently from the reading its episode wrote.
// Nothing is written unless you say so: a new reading stands only when the owner
// amends with it (TTG-RFC-0005 §5.1). Run it after changing a grammar record, or
// the runtime.
//
//   node tools/reread.mjs                 report; exit 1 if a new reading awaits the owner
//   node tools/reread.mjs --json          the report as JSON
//   node tools/reread.mjs --store FILE    another store
//   node tools/reread.mjs --accept HASH   take every new reading under that grammar hash, as
//                                         amendments that name it, except where the owner has
//                                         already amended the sentence; [--now UNIX]. In episode
//                                         order, each is read again just before it is taken, in the
//                                         context the sentences before it now stand as, so one that
//                                         reads differently only because of an earlier take is taken too
import fs from "node:fs";
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags } = args();
const PG = await loadEngine();
const file = path.resolve(root, flags.store || STORE);
const S = PG.openStore(read(file));
const r = PG.reread(S);

if (flags.accept){
  if (flags.accept !== r.grammar){
    console.error("the store's grammar is " + r.grammar + ", not " + flags.accept + ": re-read and look again before accepting");
    process.exit(2);
  }
  const now = flags.now ? +flags.now : Math.floor(Date.now() / 1000);
  const offered = new Set(r.changed.map(c => c.episode + "#" + c.n));
  const t = PG.takeRereads(S, r.grammar, now), taken = t.took.length;
  for (const c of t.kept) console.log("  kept the owner's reading  " + c.episode + " #" + c.n + "  " + c.text);
  for (const c of t.took) console.log("  took  " + c.episode + " #" + c.n + "  " + c.reads +
    (offered.has(c.episode + "#" + c.n) ? "" : "  (it read differently once an earlier one was taken)"));
  fs.writeFileSync(file, PG.serializeStore(S.st));
  console.log("took " + taken + " reading" + (taken === 1 ? "" : "s") + " under grammar " + r.grammar + "; wrote " + path.relative(root, file));
  process.exit(0);
}

if (flags.json) console.log(JSON.stringify(r, null, 2));
else {
  console.log("grammar " + r.grammar + ": " + r.sentences + " sentences, " + r.changed.length + " read differently");
  for (const c of r.changed){
    console.log("\n" + c.episode + " #" + c.n + (c.accepted ? "  (accepted)" : c.amended ? "  (amended by the owner)" : "") + "  " + c.text);
    console.log("  wrote  " + (c.shape === null ? "(no shape line)" : c.shape));
    for (const l of c.was) console.log("         " + l);
    console.log("  reads  " + c.reads);
    for (const l of c.now) console.log("         " + l);
  }
}
// a sentence the owner has amended, with this reading or another, is decided
process.exit(r.changed.some(c => !c.amended) ? 1 : 0);
