// Feed words into a store from the command line, through the page's own engine.
//
//   node tools/feed.mjs notes.md other.txt          each file is one episode
//   node tools/feed.mjs --lines tools/seed_corpus.txt   each line is one typed episode
//   node tools/feed.mjs --store my_ttdb.md --out new_ttdb.md --now 1789257600 file.txt
//
// Without --out the store is rewritten in place.
import fs from "node:fs";
import path from "node:path";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

const { flags, rest } = args();
if (!rest.length){ console.error("usage: node tools/feed.mjs [--lines] [--store FILE] [--out FILE] [--now UNIX] FILE..."); process.exit(2); }
const PG = await loadEngine();
const storePath = path.resolve(root, flags.store || STORE);
const S = PG.openStore(read(storePath));
let now = flags.now ? +flags.now : Math.floor(Date.now() / 1000);

for (const f of rest){
  const text = read(path.resolve(f));
  if (flags.lines){
    for (const line of text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"))){
      const r = PG.answer(S, line, now);
      console.log("> " + line + "\n" + PG.replyText(S, r).split("\n").map(l => "  " + l).join("\n"));
      now += 60;
    }
  } else {
    const r = PG.ingestFile(S, path.basename(f), text, now);
    console.log(r ? r.msg : "(nothing to read in " + f + ")");
    now += 60;
  }
}
const out = path.resolve(root, flags.out || storePath);
fs.writeFileSync(out, PG.serializeStore(S.st));
console.log("wrote " + path.relative(root, out));
