// The engine, headless: index.html's own script against the real store.
import { loadEngine, read, scriptOf } from "../tools/harness.mjs";

const PG = await loadEngine();
const STORE = read("personal_grammar_ttdb.md").replace(/\r\n?/g, "\n");
const fresh = () => PG.openStore(STORE);
const T0 = 1789400000;

let fails = 0;
const ok = (cond, msg, extra = "") => {
  if (cond) console.log("  PASS  " + msg + (extra ? "  " + extra : ""));
  else { fails++; console.log("  FAIL  " + msg + "  " + extra); }
};
const section = s => console.log("\n== " + s + " ==");
const pk = p => [p.s, p.v, p.o, p.pol, p.q].join(" | ");

section("the store parses and round-trips");
{
  const S = fresh();
  const headers = STORE.split("\n").filter(l => /^@LAT-?[\d.]+LON-?[\d.]+\s*\|/.test(l));
  const recs = PG.records(S.st);
  ok(recs.length === headers.length, "every record header in the store is parsed", recs.length + " of " + headers.length);
  ok(PG.serializeStore(S.st) === STORE, "parse then write reproduces the file byte for byte");
  PG.syncTerms(S, T0, new Set());
  ok(PG.serializeStore(S.st) === STORE, "a sync with nothing new rewrites nothing");
  const kinds = ["lexicon", "morphology", "seed", "vectors", "questions", "responses", "numbers"];
  ok(kinds.every(k => S.G.loaded.includes(k)), "all seven grammar kinds load", S.G.loaded.join(","));
  ok(!STORE.includes("@@"), "no doubled @ in any edge");
}

section("fixture, special record, lanes");
{
  const S = fresh(), recs = PG.records(S.st);
  const fx = recs.find(r => r.id === "@LAT99LON1");
  ok(fx && !fx.hasEw && fx.conf === 128 && fx.sal === 0 && fx.eps === 0, "fixture has no [ew]: conf 128, sal 0, EPS 0");
  ok(fx.fields.some(([k, v]) => k === "x_fixture" && v === "preserve-me-verbatim"), "unknown header field parsed and kept");
  const dead = fx.edges.find(e => e.type === "duplicates");
  ok(dead && !recs.some(r => r.key === dead.target.key), "duplicates@LAT88.8LON179.9 resolves to nothing");
  ok(S.malformed.length === 3 && S.malformed.every(m => m.id === "@LAT99LON1"), "three malformed percepts skipped, all in the fixture", String(S.malformed.length));
  let deadCount = 0;
  for (const r of recs) for (const e of r.edges) if (!e.target || !recs.some(x => x.key === e.target.key)) deadCount++;
  ok(deadCount === 1, "exactly one dead edge in the store (the fixture's)", String(deadCount));
  const sp = recs.find(r => r.lat <= -90);
  ok(sp && /kind:\s*private_corpus/.test(sp.special || ""), "South Pole special record declares private_corpus");
  const beliefs = recs.filter(r => r.lat === 98);
  const top = beliefs.reduce((a, r) => r.eps > a.eps ? r : a);
  ok(top.id === "@LAT98LON5" && top.eps === 138, "highest design EPS is the parser's blind spots", top.id + " " + top.eps);
  const eps = recs.filter(r => r.lat === 90);
  ok(eps.length === 8 && eps.every((r, i) => r.lon === i + 1), "eight demo episodes at lat 90, lon = ordinal");
  const terms = [...S.things.values(), ...S.vectors.values()];
  ok(terms.every(t => t.cls === "vector" ? t.chunk.rec.lon < 0 : t.chunk.rec.lon > 0 || t.lemma === S.G.sphere.self_lemma),
     "things east, vectors west, the speaker at the origin");
  ok(S.things.get("self").chunk.rec.id === "@LAT0LON0", "self is the Home record");
}

section("consolidated beliefs match their percepts (no drift)");
{
  const S = fresh();
  let drift = [];
  for (const t of [...S.things.values(), ...S.vectors.values()]){
    const stored = PG.parseBlock(t.chunk.rec.term);
    const now = PG.termState(S, t);
    const lines = [].concat(stored.belief || []).map(l => "belief: " + l);
    if (lines.join("\n") !== now.lines.join("\n")) drift.push(t.lemma + " beliefs");
    if (+stored.seen !== now.seen) drift.push(t.lemma + " seen " + stored.seen + "≠" + now.seen);
    if (t.chunk.rec.conf !== now.conf) drift.push(t.lemma + " conf");
  }
  ok(drift.length === 0, "every stored belief line, seen count and conf recomputes", drift.join("; "));
  const cof = S.trips.get("self|like|coffee");
  ok(cof && cof.pol === "?" && cof.conf === 128 && !cof.decided, "the coffee change of mind is contested at conf 128");
  ok(!S.things.get("self").chunk.rec.edges.some(e => e.type.endsWith("like")), "a contested belief draws no edge");
  const pen = S.trips.get("penguin|fly|-");
  ok(pen && pen.pol === "-" && pen.conf === 170, "one saying reads conf 170, negative");
  ok(S.things.get("penguin").chunk.rec.edges.some(e => e.type === "not_fly"), "a negative belief edge takes the negation prefix");
}

section("parsing: nounish, verbish, percepts");
{
  const S = fresh();
  const cases = [
    ["Cats are mammals.",                 ["cat | is_a | mammal | + | -"]],
    ["Tea is warm.",                      ["tea | has_property | warm | + | -"]],
    ["A penguin is a bird.",              ["penguin | is_a | bird | + | *"]],
    ["Penguins do not fly.",              ["penguin | fly | - | - | -"]],
    ["Birds can fly and swim.",           ["bird | fly | - | + | -", "bird | swim | - | + | -"]],
    ["Cats and dogs eat meat.",           ["cat | eat | meat | + | -", "dog | eat | meat | + | -"]],
    ["Pixel sleeps in the sun.",          ["pixel | sleep_in | sun | + | -"]],
    ["I drink tea in the morning.",       ["self | drink | tea | + | -", "tea | with | morning | + | -"]],
    ["Some birds are black.",             ["bird | has_property | black | + | ~"]],
    ["No cats bark.",                     ["cat | bark | - | - | *"]],
    ["A wheel is part of a car.",         ["wheel | part_of | car | + | *"]],
    ["Cats chase mice but they don't eat grass.", ["cat | chase | mouse | + | -", "cat | eat | grass | - | -"]],
    ["The children were running.",        ["child | run | - | + | -"]],
    ["Pixel purrs when he is happy.",     ["pixel | purr | - | + | -", "pixel | has_property | happy | + | -"]],
    ["morning tea",                       []]
  ];
  for (const [text, want] of cases){
    const got = PG.perceiveSentence(S, text, { last:null }).percepts.map(pk);
    ok(JSON.stringify(got) === JSON.stringify(want), JSON.stringify(text), got.join(" ; "));
  }
  ok(PG.nounLemma(S, "mice").lemma === "mouse" && PG.nounLemma(S, "glass").lemma === "glass", "irregular plural and a guarded -ss");
  ok(PG.verbLemma(S, "stopped").lemma === "stop" && PG.verbLemma(S, "called").lemma === "call", "undouble, except where double_keep says not");
  ok(PG.verbLemma(S, "chasing").lemma === "chase", "a seed vector breaks the tie between chas and chase");
}

section("reasoning: said, inferred, contested, unknown");
{
  const S = fresh();
  const cases = [
    ["Does Pixel chase mice?",   "verify", "affirm_inferred"],
    ["Is Pixel an animal?",      "verify", "affirm_inferred"],
    ["Does Pixel have fur?",     "verify", "affirm_inferred"],
    ["Can penguins fly?",        "verify", "deny"],
    ["Do birds fly?",            "verify", "affirm"],
    ["Do I like coffee?",        "verify", "contest"],
    ["Is a whale a fish?",       "verify", "unknown"],
    ["What eats cheese?",        "subjectsOf", null],
    ["What do cats chase?",      "objectsOf", null],
    ["Where does Pixel sleep?",  "objectsOf", null],
    ["Tell me about penguins.",  "portrait", null],
    ["Who am I?",                "portrait", null],
    ["morning tea",              "portrait", null],
    ["feathers and cheese and sunshine", "search", null]
  ];
  for (const [q, intent, verdictKey] of cases){
    const r = PG.answer(S, q, T0);
    const vOk = verdictKey == null || r.verdict === PG.say(S.G, verdictKey);
    ok(r.intent === intent && vOk, JSON.stringify(q) + " -> " + intent + (verdictKey ? " / " + verdictKey : ""),
       r.intent + " / " + r.verdict);
  }
  const pen = PG.answer(S, "Can penguins fly?", T0);
  ok(pen.notes.some(n => n === PG.say(S.G, "exception", { term:"penguin", via:"bird" })), "the penguin answer names bird as the overruled ancestor");
  ok(pen.items[0].kind === "direct" && pen.items[0].quotes[0].text === "Penguins do not fly.", "and quotes the owner's own sentence");
  const pix = PG.verify(S, "pixel", "is_a", "animal");
  ok(pix.inferred && pix.grounds[0].path.map(e => e.o).join(">") === "cat>mammal>animal", "Pixel -> cat -> mammal -> animal", pix.grounds[0].path.map(e => e.o).join(">"));
  ok(pix.conf === Math.round(255 * Math.pow(170 / 255, 3) * Math.pow(0.85, 2)), "inferred conf = product of links x decay per extra hop", String(pix.conf));
  const eats = PG.answer(S, "What eats cheese?", T0);
  ok(eats.items.length === 1 && eats.items[0].term === "mouse" && eats.items[0].kind === "direct", "mouse eats cheese, said");
  const flies = PG.subjectsOf(S, "fly", "-");
  ok(flies.find(x => x.term === "bird").verdict === "Y" && flies.find(x => x.term === "penguin").verdict === "N", "what flies: bird yes, penguin no");
  const whale = PG.answer(S, "Is a whale a fish?", T0);
  ok(whale.notes.includes(PG.say(S.G, "no_purchase", { words:"whale, fish" })), "words with no purchase are named, not guessed");
  const place = PG.interpret(S, "Where does Pixel sleep?");
  ok(place.s === "pixel" && place.vs.includes("sleep_in"), "a where question tries the phrasal vector", JSON.stringify(place.vs));
  const withs = PG.portrait(S, "tea").withs.map(w => w[0]);
  ok(withs.includes("morning") && !S.trips.has("tea|with|morning"), "a comention is searchable and never a belief");
}

section("writing: episodes, placement, contradiction, asked");
{
  const S = fresh();
  const r = PG.answer(S, "Pixel does not chase mice.", T0);
  ok(r.intent === "perceive" && r.episode.id === "@LAT90LON9", "a statement writes episode @LAT90LON9", r.episode && r.episode.id);
  ok(r.episode.conflicts.length === 0, "disagreeing with an inference is not a contradiction of anything said");
  const v = PG.verify(S, "pixel", "chase", "mouse");
  ok(v.verdict === "N" && !v.inferred && v.exception && v.exception.via === "cat", "said now outranks the inherited cat belief");
  const pixel = S.things.get("pixel").chunk.rec;
  ok(pixel.rev === 2 && pixel.touched === T0 && pixel.updated === T0, "pixel rev 1 -> 2, touched and updated advance", pixel.rev + " " + pixel.touched);

  const r2 = PG.answer(S, "Ferrets hunt rabbits. I like tea.", T0 + 60);
  const ferret = S.things.get("ferret").chunk.rec, rabbit = S.things.get("rabbit").chunk.rec, hunt = S.vectors.get("hunt").chunk.rec;
  ok(ferret.lon > 0 && rabbit.lon > 0 && hunt.lon < 0, "new things land east, the new vector west");
  ok(Math.abs(rabbit.lat - ferret.lat) <= 3 + 1e-9 && Math.abs(rabbit.lon - ferret.lon) <= 3 + 1e-9, "rabbit sits beside ferret, the term that introduced it");
  const keys = PG.records(S.st).map(x => x.key);
  ok(new Set(keys).size === keys.length, "no two records share an ID");
  const order = PG.records(S.st).map(x => x.id);
  ok(order.indexOf("@LAT90LON10") < order.indexOf("@LAT98LON1"), "new records go in before the lane-98 tail");
  const out = PG.serializeStore(S.st);
  ok(out.includes("x_fixture:preserve-me-verbatim") && out.includes(STORE.slice(STORE.indexOf("\n@LAT98LON1 |"))), "the tail survives the write byte for byte");
  const reread = PG.openStore(out);
  ok(PG.serializeStore(reread.st) === out, "the written store round-trips too");

  const r3 = PG.answer(S, "Tea is not warm.", T0 + 120);
  ok(r3.episode.conflicts.length === 1 && r3.notes.includes(PG.say(S.G, "contradicts")), "saying the opposite of a belief is reported at once");
  ok(S.trips.get("tea|has_property|warm").pol === "?", "and leaves the belief contested, not overwritten");

  const before = S.things.get("penguin").asked;
  PG.answer(S, "Tell me about penguins.", T0 + 180);
  ok(S.things.get("penguin").asked === before + 1, "a question that finds purchase increments asked");
  const cur = /last_query: "([^"]*)"/.exec(PG.serializeStore(S.st));
  ok(cur && cur[1] === "Tell me about penguins.", "the cursor records last_query (TTDB-RFC-0002)");

  const f = PG.ingestFile(S, "notes.md", "# Garden\n\nThe garden has roses. Roses are flowers.\n\n- Bees visit roses\n\n```js\nconst tea = 1;\n```\n", T0 + 240);
  ok(f && f.ep.sentences === 4 && S.trips.has("bee|visit|rose") && !S.things.has("const"), "a markdown file is one episode; code fences are dropped", f && String(f.ep.sentences));
}

section("start empty keeps the kit");
{
  const S = fresh();
  PG.startEmpty(S, T0);
  const recs = PG.records(S.st);
  ok(!recs.some(r => r.lat === 90), "no episodes left");
  ok(S.things.size === 1 && S.things.has("self") && S.vectors.size === 0, "only the speaker remains as a term");
  ok(recs.filter(r => r.lon === 0 && r.lat > -90 && r.lat < 90).length === 16, "home, eight blueprint and seven grammar records kept");
  ok(recs.some(r => r.id === "@LAT99LON1") && recs.some(r => r.lat === 98) && recs.some(r => r.lat === -90), "lanes 98, 99 and the special record kept");
  const r = PG.answer(S, "I like tea.", T0 + 60);
  ok(r.episode.id === "@LAT90LON1", "the first new episode is ordinal 1 again");
}

section("the file IS the grammar");
{
  // 1. Delete the grammar and the runtime has nothing to parse with or say.
  const S = fresh();
  S.st.chunks = S.st.chunks.filter(c => !(c.rec && c.rec.grammar != null));
  const bare = PG.openStore(PG.serializeStore(S.st));
  const blind = PG.perceiveSentence(bare, "Cats are mammals.", { last:null }).percepts.map(pk);
  ok(JSON.stringify(blind) === JSON.stringify(["cats | are | mammals | + | -"]),
     "without the grammar records the runtime sees only word order: no copula, no plural, no class", blind.join(" ; "));
  const reply = PG.answer(bare, "Does Pixel chase mice?", T0);
  ok(reply.verdict === "" && reply.notes.every(n => n === ""), "and the librarian has no words of its own", JSON.stringify(reply.verdict));

  // 2. Swap in another language's grammar and the same runtime reads it.
  const es = PG.openStore(read("tests/fixtures/es_ttdb.md"));
  const a = PG.answer(es, "Los gatos son mamíferos. Los gatos cazan ratones. Yo no como queso.", T0);
  const got = a.episode.percepts.map(pk);
  const want = ["gato | es_un | mamífero | + | -", "gato | cazar | ratón | + | -", "yo | comer | queso | - | -"];
  ok(JSON.stringify(got) === JSON.stringify(want), "a Spanish grammar store parses Spanish", got.join(" ; "));
  const b = PG.answer(es, "¿Los gatos cazan ratones?", T0 + 60);
  ok(b.verdict === "Sí.", "and answers in Spanish", b.verdict);

  // 3. No word the grammar lists appears as a string literal in the runtime.
  const code = scriptOf();
  const G = fresh().G;
  // block keys are schema, like a column name: the check is about the words, not the keys that hold them
  const SCHEMA = new Set(["kind", "class", "lemma", "forms", "seen", "asked", "belief", "source", "at", "said", "percept"]);
  const vocab = new Set([...G.classes.keys(), ...G.whole.keys(), ...G.nounIrr.keys(), ...G.nounIrr.values(),
    ...G.verbIrr.keys(), ...G.verbIrr.values(), ...G.seed, ...G.vectors.keys(), ...G.phrases.flatMap(p => p[0]),
    ...G.whThing, ...G.whPlace.keys(), ...G.about].filter(w => w.length >= 2 && !SCHEMA.has(w)));
  const leaks = [...vocab].filter(w => new RegExp("[\"'`]" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\"'`]").test(code));
  ok(leaks.length === 0, "no lexicon, morphology, seed or vector word is a string literal in index.html (" + vocab.size + " checked)", leaks.join(", "));
  const phrases = Object.values(G.say).filter(p => p.length >= 6 && !code.includes(p));
  ok(phrases.length === Object.values(G.say).filter(p => p.length >= 6).length, "no reply phrase is copied into index.html");

  // 4. Every number the store declares is read by the runtime.
  const numbers = Object.keys(G.num).concat(Object.keys(G.sphere));
  const unread = numbers.filter(k => !code.includes(k));
  ok(unread.length === 0, "every key in the numbers and sphere blocks is named in index.html", unread.join(", "));
}

console.log("\n" + (fails ? fails + " FAILED" : "all passed"));
process.exit(fails ? 1 : 0);
