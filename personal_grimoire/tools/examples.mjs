// The example stores beside the seed: each is the seed's grammar with the corpus emptied and then
// its own sayings told, one episode each, so a reader who opens one (index.html?store=examples/…)
// asks and gets an answer at once. The sample questions are what the tests ask of each and what
// the release page's "try it" links ask.
//
//   node tools/examples.mjs            rebuild every example in examples/
//   node tools/examples.mjs --check    exit 1 if a rebuild would change any (the tests do this too)
//
// Rebuild after changing the seed's grammar: an example carries a copy of it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEngine, read, root, args, STORE } from "./harness.mjs";

export const NOW = 1797206400;   // 2026-12-13, the day phase 8 began; each saying an hour after the last
export const STEP = 3600;

// q: the question; terms: the answer's terms, in order; verdict: the reply key of its verdict;
// says: a reply key whose note it carries
export const EXAMPLES = [
  {
    file: "constructions_ttdb.md",
    title: "Constructions",
    sayings: [
      "Pixel sneezed the napkin off the table.",
      "Pixel knocked the cup off the shelf onto the floor.",
      "The dog pushed the ball from the bed.",
      "I took the day off.",
    ],
    ask: [
      { q: "Where did the napkin go?", terms: "table" },
      { q: "What did Pixel sneeze off the table?", terms: "napkin" },
      { q: "Where did the cup go?", terms: "shelf floor" },
      { q: "What did Pixel do?", terms: "sneeze knock" },
      { q: "Did I rest the day?", verdict: "affirm" },
      { q: "What left the bed?", terms: "ball" },
      { q: "Did the napkin leave the table?", verdict: "affirm_inferred" },
    ],
  },
  {
    file: "clauses_ttdb.md",
    title: "Part of a clause",
    sayings: [
      "I doubt cats like fish.",
      "I think Pixel knocked the cup off the shelf.",
      "The dog that the cat bit ran.",
      "When Pixel knocked the vase off the table, the dog barked.",
      "Pixel pushed the ball off the bed in the kitchen.",
    ],
    ask: [
      { q: "What do I doubt?", says: "asked_holds" },
      { q: "Do cats like fish?", verdict: "unknown" },
      { q: "Did Pixel knock the cup off the shelf?", verdict: "unknown", says: "asked_held" },
      { q: "Did the dog run?", verdict: "affirm" },
      { q: "Did the cat bite the dog?", verdict: "affirm" },
      { q: "Did the dog bark?", verdict: "affirm" },
      { q: "Where did the vase go?", terms: "table" },
      { q: "Where did the ball go?", terms: "bed" },
    ],
  },
  {
    file: "trajectories_ttdb.md",
    title: "Belief trajectories",
    sayings: [
      "I like tea.", "I like tea.", "I like tea.", "I don't like tea.", "I don't like tea.", "I don't like tea.",
      "I like milk.", "I don't like milk.", "I like milk.", "I don't like milk.", "I like milk.",
      "I like jam.", "I like jam.", "I like jam.", "I don't like jam.",
      "I liked cake.", "I don't like cake.", "I don't like cake.",
    ],
    ask: [
      { q: "Do I like tea?", verdict: "contest", says: "trajectory_crossing" },
      { q: "Do I like milk?", verdict: "affirm", says: "trajectory_alternation" },
      { q: "Do I like jam?", verdict: "affirm" },
      { q: "Do I like cake?", verdict: "deny", says: "changed_tense" },
    ],
  },
  {
    file: "dos_lenguas_ttdb.md",
    title: "Two languages, one motion",
    sayings: [
      "Pixel tiró el vaso de la mesa.",
      "Pixel sneezed the napkin off the table.",
      "Pixel pushed the cup from the shelf.",
    ],
    ask: [
      { q: "¿De dónde tiró Pixel el vaso?", terms: "mesa" },
      { q: "¿Qué salió de la mesa?", terms: "vaso" },
      { q: "Did the vaso leave the mesa?", verdict: "affirm_inferred" },
      { q: "What left the table?", terms: "napkin" },
      { q: "What left the shelf?", terms: "cup" },
    ],
  },
];

/* The example's store text, built from the seed's text by the engine itself. */
export function build(PG, seed, ex){
  const S = PG.openStore(seed);
  let t = NOW;
  PG.startEmpty(S, t);
  for (const s of ex.sayings) PG.answer(S, s, t += STEP);
  return PG.serializeStore(S.st);
}

/* What a sample question gets, and whether it is what the example says it gets. */
export function check(PG, S, a, now){
  const r = PG.answer(S, a.q, now), G = S.G, why = [];
  const terms = r.items.map(i => i.term).join(" ");
  if (a.terms !== undefined && terms !== a.terms) why.push("terms " + JSON.stringify(terms));
  if (a.verdict && r.verdict !== PG.say(G, a.verdict)) why.push("verdict " + JSON.stringify(r.verdict));
  if (a.says){
    const head = PG.say(G, a.says, {}).split("{")[0].slice(0, 12);
    if (!r.notes.some(n => n.startsWith(head))) why.push("no " + a.says + " note");
  }
  return { r, ok: !why.length, why };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  const { flags } = args();
  const PG = await loadEngine(), seed = read(STORE), dir = path.join(root, "examples");
  fs.mkdirSync(dir, { recursive: true });
  let stale = 0;
  for (const ex of EXAMPLES){
    const file = path.join(dir, ex.file), text = build(PG, seed, ex);
    const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (flags.check){ if (old !== text){ stale++; console.log("stale  examples/" + ex.file); } continue; }
    if (old !== text) fs.writeFileSync(file, text);
    console.log((old === text ? "same   " : "wrote  ") + "examples/" + ex.file);
    const S = PG.openStore(text);
    let t = NOW + STEP * (ex.sayings.length + 1);
    for (const a of ex.ask){
      const c = check(PG, S, a, t += STEP);
      console.log("  " + (c.ok ? "ok  " : "FAIL") + "  " + a.q + (c.ok ? "" : "   " + c.why.join("; ")));
      if (flags.verbose || !c.ok) console.log(PG.replyText(S, c.r).split("\n").map(l => "        " + l).join("\n"));
    }
  }
  if (flags.check) process.exit(stale ? 1 : 0);
}
