// Ask the store a question from the command line. Read-only: nothing is written
// back, so asking here does not change `asked` counts the way the page does.
//
//   node tools/ask.mjs "Does Pixel chase mice?"
//   node tools/ask.mjs --store my_ttdb.md "tell me about penguins"
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags, rest } = args();
if (!rest.length){ console.error('usage: node tools/ask.mjs [--store FILE] "question"'); process.exit(2); }
const PG = await loadEngine();
const S = PG.openStore(read(path.resolve(root, flags.store || STORE)));
for (const q of rest){
  const r = PG.answer(S, q, Math.floor(Date.now() / 1000));
  if (rest.length > 1) console.log("> " + q);
  console.log(PG.replyText(S, r));
  if (flags.debug) console.log(JSON.stringify(PG.interpret(S, q), (k, v) => k === "toks" ? undefined : v));
}
