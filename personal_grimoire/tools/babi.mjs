// Run a bAbI task through the shipping engine: each story's facts are told to an
// emptied store, one episode per line, and each question is answered from them.
// Scores the answer, and whether the sentences the answer quotes are exactly the
// story's gold supporting facts.
//
//   node tools/babi.mjs PATH/qa15_basic-deduction_test.txt [--json results.json]
//   node tools/babi.mjs PATH/qa1_single-supporting-fact_test.txt [--json results.json]
//
// Data: bAbI tasks v1.2 (Weston et al., 2015), CC BY 3.0, not included here. The
// archive tasks_1-20_v1-2.tar.gz is mirrored at
// https://s3.amazonaws.com/text-datasets/babi_tasks_1-20_v1-2.tar.gz
//
// Conditions:
//   seed      the store exactly as shipped (English and Spanish grammars)
//   +adapted  plus the task's declared adaptation (ADAPTATIONS below): a few lines
//             of grammar data, never code, printed with the results
//   +adapted, no exclusive flag   the same, with `exclusive` removed from every vector
//             line: an ablation of supersession (TTG-RFC-0004 §3)
//   permuted  +adapted with a fixed letter bijection applied to the grammar records
//             and to the (lowercased) data. If the runtime holds no English, every
//             question's outcome is unchanged.
import fs from "node:fs";
import crypto from "node:crypto";
import { loadEngine, read, STORE } from "./harness.mjs";

const argv = process.argv.slice(2);
const file = argv.find(a => !a.startsWith("--"));
const jsonOut = argv.includes("--json") ? argv[argv.indexOf("--json") + 1] : null;
if (!file){ console.error("usage: node tools/babi.mjs PATH/qaNN_task_test.txt [--json out.json]"); process.exit(2); }

const PG = await loadEngine();
const T0 = 1789400000;

/* ---------- data ---------------------------------------------------------- */
function stories(text){
  const out = [];
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")){
    const m = /^(\d+) (.*)$/.exec(line);
    if (!m) continue;
    const id = +m[1], [body, answer, support] = m[2].split("\t");
    if (id === 1) out.push([]);
    out[out.length - 1].push(answer == null ? { id, fact:body } : { id, question:body, answer, support:support.split(" ").map(Number) });
  }
  return out;
}

/* ---------- the letter bijection --------------------------------------------- */
function bijection(seed){
  const a = "abcdefghijklmnopqrstuvwxyz".split("");
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  let b;
  do { b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } }
  while (b.some((c, i) => c === a[i]));                                   // no letter maps to itself
  const map = new Map(a.map((c, i) => [c, b[i]]));
  return w => w.replace(/[a-z]/g, c => map.get(c));
}
// Apply σ to every word the grammar holds, and to nothing the runtime reads as schema:
// block keys, class and role keys, vector flags, numbers and reply templates stay as they are.
function permuteStore(text, σ){
  const cols = (v, which) => v.split("|").map((c, i) => which(i) ? σ(c) : c).join("|");
  let tag = null, kind = null;
  return text.split("\n").map(line => {
    const f = /^```([\w-]*)\s*$/.exec(line);
    if (f){ tag = tag ? null : f[1]; kind = null; return line; }
    const m = /^(\w+):(.*)$/.exec(line);
    if (!tag || !m) return line;
    const [, key, val] = m;
    if (tag === "ttdb-sphere") return key === "self_lemma" ? key + ":" + σ(val) : line;
    if (tag === "ttdb-term") return key === "lemma" || key === "forms" ? key + ":" + σ(val) : line;
    if (tag !== "ttdb-grammar") return line;
    if (key === "kind"){ kind = val.trim(); return line; }
    if (key === "lang" || kind === "numbers" || kind === "responses") return line;
    if (key === "describe_max_words" || key === "min_stem") return line;
    if (key === "class" || key === "role") return key + ":" + cols(val, i => i > 0);
    if (key === "vector") return key + ":" + cols(val, i => i !== 1);
    return key + ":" + σ(val);
  }).join("\n");
}

/* ---------- one run ----------------------------------------------------------- */
function run(storeText, data, σ = w => w){
  const S0 = PG.openStore(storeText);
  PG.startEmpty(S0, T0);
  const empty = PG.serializeStore(S0.st);
  const t = { questions:0, correct:0, attributed:0, facts:0, perceived:0, ms:0, intents:{}, outcomes:[] };
  for (const story of data){
    const S = PG.openStore(empty), lineOf = new Map();
    let now = T0;
    for (const item of story){
      now += 1;
      if (item.fact != null){
        const r = PG.answer(S, σ(item.fact.toLowerCase()), now);
        t.facts++;
        if (r.episode){
          lineOf.set(r.episode.id, item.id);
          if (r.episode.percepts.length) t.perceived++;
        }
        continue;
      }
      const start = performance.now();
      const r = PG.answer(S, σ(item.question.toLowerCase()), now);
      t.ms += performance.now() - start;
      t.questions++;
      t.intents[r.intent] = (t.intents[r.intent] || 0) + 1;
      // the answer is the first ground that holds: not a denial, not a retired fact (TTG-RFC-0004)
      const top = r.items.find(g => g.pol !== "-" && g.kind !== "superseded");
      const said = top ? top.term : "";
      const ok = said === σ(item.answer);
      const quoted = top ? [...new Set(top.quotes.map(q => lineOf.get(q.ep)))].sort((a, b) => a - b) : [];
      const gold = [...item.support].sort((a, b) => a - b);
      const exact = ok && quoted.join() === gold.join();
      if (ok) t.correct++;
      if (exact) t.attributed++;
      t.outcomes.push((ok ? 1 : 0) + (exact ? 1 : 0));
    }
  }
  return t;
}

/* ---------- the three conditions --------------------------------------------- */
// Each task's adaptation: [anchor line, lines inserted after it] or [line, null, replacement].
const ADAPTATIONS = {
  // "afraid of" names one relation, as "part of" does
  qa15: [["phrase: full of | contains", ["phrase: afraid of | afraid_of"]]],
  // the other three motion verbs link to "in" as the seed's move_to does; "went back to" is "went to"
  qa1: [["rule: move_to X Y => in X Y | moving somewhere puts you there",
         ["rule: go_to X Y => in X Y | going somewhere puts you there",
          "rule: journey_to X Y => in X Y | journeying somewhere puts you there",
          "rule: travell_to X Y => in X Y | travelling somewhere puts you there"]],
        ["class: adverb | very", null, "class: adverb | back very"]]
};
const seed = read(STORE).replace(/\r\n?/g, "\n");
const task = (file.split(/[\\/]/).pop().match(/^qa\d+/) || [""])[0];
if (!ADAPTATIONS[task]) throw new Error("no declared adaptation for " + (task || file) + "; add one to ADAPTATIONS");
let adapted = seed;
const ADAPT = [];
for (const [anchor, after, replacement] of ADAPTATIONS[task]){
  if (!adapted.includes(anchor + (replacement ? "" : "\n"))) throw new Error("the store has moved; update the anchor: " + anchor);
  if (replacement){ adapted = adapted.replace(anchor, replacement); ADAPT.push(anchor + " … → " + replacement + " …"); }
  else { adapted = adapted.replace(anchor + "\n", anchor + "\n" + after.join("\n") + "\n"); ADAPT.push(...after); }
}
const data = stories(fs.readFileSync(file, "utf8"));
const σ = bijection(15);

const results = {
  seed: run(seed, data),
  "+adapted": run(adapted, data),
  // ablation: the same, with no vector declared exclusive, so nothing is ever retired
  "+adapted, no exclusive flag": run(adapted.replace(/^(vector: [^|]*\|[^|]*)\bexclusive\b ?/gm, "$1").replace(/\| \|/g, "| - |"), data),
  permuted: run(permuteStore(adapted, σ), data, σ),
  // negative control: a permuted grammar reading unpermuted data should understand nothing
  "control: permuted grammar, plain data": run(permuteStore(adapted, σ), data)
};
const again = run(adapted, data);
const hash = t => crypto.createHash("sha256").update(JSON.stringify(t.outcomes)).digest("hex").slice(0, 16);

const pct = (n, d) => d ? (100 * n / d).toFixed(1) + "%" : "-";
console.log(`bAbI ${file.split(/[\\/]/).pop()}: ${data.length} stories, ${results.seed.questions} questions\n`);
console.log("| condition | answer accuracy | exact attribution | facts perceived | intents | ms / question |");
console.log("|---|---|---|---|---|---|");
for (const [name, t] of Object.entries(results)){
  const intents = Object.entries(t.intents).map(([k, v]) => k + " " + v).join(", ");
  console.log(`| ${name} | ${pct(t.correct, t.questions)} | ${pct(t.attributed, t.questions)} | ${pct(t.perceived, t.facts)} | ${intents} | ${(t.ms / t.questions).toFixed(3)} |`);
}
console.log(`\nadaptation, ${ADAPT.length} line${ADAPT.length === 1 ? "" : "s"} of grammar data:\n` + ADAPT.map(l => "  " + l).join("\n"));
console.log(`bijection sample: "${data[0][0].fact.toLowerCase()}" -> "${σ(data[0][0].fact.toLowerCase())}"`);
console.log(`permuted vs +adapted, question by question: ${hash(results.permuted) === hash(results["+adapted"]) ? "identical" : "DIFFERENT"}`);
console.log(`+adapted run twice: ${hash(again) === hash(results["+adapted"]) ? "identical (deterministic)" : "DIFFERENT"}`);
console.log(`engine: ${Buffer.byteLength(read("index.html").match(/<script>([\s\S]*?)<\/script>/)[1])} bytes of script, 0 parameters`);

if (jsonOut){
  const brief = Object.fromEntries(Object.entries(results).map(([k, t]) => [k, { ...t, outcomes:undefined, outcomes_sha256:hash(t) }]));
  fs.writeFileSync(jsonOut, JSON.stringify({ task:file.split(/[\\/]/).pop(), adaptation:ADAPT, results:brief }, null, 2) + "\n");
}
