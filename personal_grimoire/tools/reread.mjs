// Read every sentence the store holds again, under the grammar it holds now, and
// report each one that now reads differently from the reading its episode wrote.
// Nothing is written: a new reading stands only when the owner amends with it
// (TTG-RFC-0005 §5.1). Run it after changing a grammar record, or the runtime.
//
//   node tools/reread.mjs                 report; exit 1 if any sentence reads differently
//   node tools/reread.mjs --json          the report as JSON
//   node tools/reread.mjs --store FILE    another store
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags } = args();
const PG = await loadEngine();
const S = PG.openStore(read(path.resolve(root, flags.store || STORE)));
const r = PG.reread(S);

if (flags.json) console.log(JSON.stringify(r, null, 2));
else {
  console.log("grammar " + r.grammar + ": " + r.sentences + " sentences, " + r.changed.length + " read differently");
  for (const c of r.changed){
    console.log("\n" + c.episode + " #" + c.n + (c.amended ? "  (amended by the owner)" : "") + "  " + c.text);
    console.log("  wrote  " + (c.shape === null ? "(no shape line)" : c.shape));
    for (const l of c.was) console.log("         " + l);
    console.log("  reads  " + c.reads);
    for (const l of c.now) console.log("         " + l);
  }
}
process.exit(r.changed.length ? 1 : 0);
