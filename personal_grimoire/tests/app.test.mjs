// The engine, headless: index.html's own script against the real store.
import { loadEngine, read, scriptOf } from "../tools/harness.mjs";

const PG = await loadEngine();
const STORE = read("personal_grimoire_ttdb.md").replace(/\r\n?/g, "\n");
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
  const kinds = ["lexicon", "morphology", "seed", "vectors", "questions", "responses", "numbers", "rules"];
  ok(kinds.every(k => S.G.loaded.includes(k)), "all eight grammar kinds load", S.G.loaded.join(","));
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
  ok(S.episodes.length === 8 && !S.said.has("@LAT99LON1"), "the fixture's episode block is checked but is not the owner's words", S.episodes.length + " episodes");
  // a well-formed percept off the episode lane still forms nothing
  const wf = PG.openStore(STORE.replace("percept: 1 | fixture | is_a\n", "percept: 1 | fixture | is_a | thing | + | -\n"));
  ok(wf.malformed.length === 2 && !wf.trips.has("fixture|is_a|thing") && !wf.things.has("fixture"),
     "a well-formed percept outside lane 90 is neither malformed nor believed", wf.malformed.length + " malformed");
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
    ["morning tea",                       ["tea | - | - | + | -"]]
  ];
  for (const [text, want] of cases){
    const got = PG.perceiveSentence(S, text, { last:null }).percepts.map(pk);
    ok(JSON.stringify(got) === JSON.stringify(want), JSON.stringify(text), got.join(" ; "));
  }
  const strays = cases.filter(([t]) => PG.pickGrammar(S, t).lang !== "en").map(([t]) => t);
  ok(strays.length === 0, "with Spanish in the store, every case still reads as English", strays.join(" ; "));
  ok(PG.nounLemma(S, "mice").lemma === "mouse" && PG.nounLemma(S, "glass").lemma === "glass", "irregular plural and a guarded -ss");
  ok(PG.verbLemma(S, "stopped").lemma === "stop" && PG.verbLemma(S, "called").lemma === "call", "undouble, except where double_keep says not");
  ok(PG.verbLemma(S, "chasing").lemma === "chase", "a seed vector breaks the tie between chas and chase");
}

section("shapes: alternating segments, lists and mentions (TTG-RFC-0005)");
{
  const S = fresh();
  const cases = [
    ["Pixel chases mice that eat cheese.",      "[pixel] {chases} [mice] that {eat} [cheese].",      ["pixel | chase | mouse | + | -", "mouse | eat | cheese | + | -"]],
    ["I saw the man eat cheese.",               "[i] {saw} [the man] {eat} [cheese].",               ["self | see | man | + | -", "man | eat | cheese | + | -"]],
    ["My grandmother taught me to bake bread.", "[my grandmother] {taught} [me] {to bake} [bread].", ["grandmother | teach | self | + | -", "self | bake | bread | + | -"]],
    ["Cats that hunt are fast.",                "[cats] that {hunt are} [fast].",                    ["cat | hunt | - | + | -", "cat | has_property | fast | + | -"]],
    ["I like cats but not dogs.",               "[i] {like} [cats but not dogs].",                   ["self | like | cat | + | -", "self | like | dog | - | -"]],
    ["I bought eggs, milk and bread.",          "[i] {bought} [eggs, milk and bread].",              ["self | buy | egg | + | -", "self | buy | milk | + | -", "self | buy | bread | + | -"]],
    ["Birds fly, swim and sing.",               "[birds] {fly, swim and sing}.",                     ["bird | fly | - | + | -", "bird | swim | - | + | -", "bird | sing | - | + | -"]],
    ["Cats chase and eat mice.",                "[cats] {chase and eat} [mice].",                    ["cat | chase | mouse | + | -", "cat | eat | mouse | + | -"]],
    ["Cats are mammals and have fur.",          "[cats] {are} [mammals] and {have} [fur].",          ["cat | is_a | mammal | + | -", "cat | has | fur | + | -"]],
    ["I want to eat cheese.",                   "[i] {want to eat} [cheese].",                       ["self | want_to_eat | cheese | + | -"]],
    ["I went to work.",                         "[i] {went to} [work].",                             ["self | go_to | work | + | -"]],
    ["I had a good drink.",                     "[i] {had} [a good drink].",                         ["self | has | drink | + | -"]],
    ["My cat sleeps.",                          "[my cat] {sleeps}.",                                ["cat | sleep | - | + | -"]],
    ["Coffee.",                                 "[coffee].",                                         ["coffee | - | - | + | -"]],
    ["Swim.",                                   "{swim}.",                                           ["- | swim | - | + | -"]]
  ];
  for (const [text, shape, want] of cases){
    const r = PG.perceiveSentence(S, text, { last:null });
    const got = r.percepts.map(pk);
    ok(r.shape === shape && JSON.stringify(got) === JSON.stringify(want), JSON.stringify(text) + " reads " + shape, r.shape + "  " + got.join(" ; "));
  }
  // every reading reads back as itself, in either language: the shape is a faithful edit surface
  const texts = cases.map(c => c[0]).concat(["Cats are mammals.", "A wheel is part of a car.", "Cats chase mice but they don't eat grass.",
    "Pixel purrs when he is happy.", "I drink tea in the morning.", "Yes, I like tea.", "morning tea",
    "Los gatos no pueden volar.", "La rueda es parte del coche.", "El gato está en la caja.", "Mi gato duerme."]);
  const drift = texts.filter(t => {
    const a = PG.shapeOf(S, t), b = PG.shapeOf(S, a.shape);
    return a.shape !== b.shape || a.percepts.map(pk).join() !== b.percepts.map(pk).join();
  });
  ok(drift.length === 0, "every shape reads back to the same shape and the same percepts (" + texts.length + " sentences)", drift.join(" ; "));
  ok(PG.shapeOf(S, "Mi gato duerme.").lang === "es" && PG.shapeOf(S, "Mi gato duerme.").percepts.map(pk).join() === "gato | dormir | - | + | -",
     "a possessive is part of its thing in Spanish too, not a second subject");

  // marks overrule the parser; a join binds words into one term
  const flip = PG.perceiveSentence(S, "[I] {like fly fishing}.", { last:null });
  ok(flip.percepts.map(pk).join() === "self | like_fly_fish | - | + | -" && flip.shape === "[i] {like fly fishing}.", "marks overrule the reading: a verbish segment is one vector", flip.percepts.map(pk).join());
  const W = fresh();
  const joined = PG.answer(W, "I love ice_cream.", T0);
  ok(joined.episode.percepts.map(pk).join() === "self | love | ice_cream | + | -" && W.said.get(joined.episode.id).get(1) === "I love ice cream.",
     "a joined phrase is one term, and the said line keeps the owner's words");
  const later = PG.answer(W, "Ice cream is cold.", T0 + 60);
  ok(later.episode.percepts.map(pk).join() === "ice_cream | has_property | cold | + | -", "once the corpus holds the phrase, the words find it unmarked");
  ok(PG.perceiveSentence(W, "[ice cream] {is} [cold].", { last:null }).percepts.map(pk).join() === "cream | has_property | cold | + | -",
     "inside marks the owner's reading stands: only an explicit join binds");

  // one segment alone: said as a statement it is a mention; bare, it is a look-up
  const M = fresh(), seen = () => M.seenCounts.get("thing|coffee") || 0, before = seen();
  const c = PG.answer(M, "Coffee.", T0);
  ok(c.intent === "perceive" && c.verdict === PG.say(M.G, "noted_mention", { terms:"coffee" }) && c.episode.mentions.length === 1 && !c.episode.percepts.length,
     "a one-word statement is kept as a mention", c.verdict);
  ok(seen() === before + 1 && !M.trips.has("coffee|-|-") && M.trips.get("coffee|has_property|bitter").fr === 1, "a mention is seen, never believed");
  ok(PG.answer(M, "coffee", T0).intent === "portrait" && PG.answer(M, "morning tea", T0).intent === "portrait", "the same words unstopped are a look-up");
  const sw = PG.answer(M, "Swim.", T0);
  ok(sw.intent === "perceive" && sw.episode.mentions.map(pk).join() === "- | swim | - | + | -", "a lone word the corpus uses only as a verb is verbish");
  ok(PG.answer(M, "Can penguins fly?", T0).verdict === PG.say(M.G, "deny"), "a question never checks a mention");

  // shapes are written with the episode; marks never reach the said line
  const E = fresh();
  const e1 = PG.answer(E, "[Birds] {can fly and swim}.", T0);
  const text = PG.serializeStore(E.st);
  ok(text.includes("said: 1 | Birds can fly and swim.\nshape: 1 | [birds] {can fly and swim}.\npercept: 1 | bird | fly |"),
     "the episode records each sentence's shape between its said and percept lines, marks stripped from the words");
  const e2 = PG.answer(E, "I like fly fishing.", T0 + 60, null, ["[i] {like} [fly_fishing]."]);
  ok(e2.episode.percepts.map(pk).join() === "self | like | fly_fishing | + | -" && E.said.get(e2.episode.id).get(1) === "I like fly fishing.",
     "a reading passed with the text is how the episode is written the first time");
  ok(PG.readingsOf(E, e1.episode.id).map(x => x.shape).join() === "[birds] {can fly and swim}." &&
     PG.readingsOf(E, "@LAT90LON1")[0].shape === "[birds] {are} [animals]." && !PG.readingsOf(E, "@LAT90LON1")[0].amended,
     "every sentence of every episode has a reading, written or recomputed");
}

section("amendments: the owner's reading kept beside the words (TTG-RFC-0005 §5)");
{
  const S = fresh();
  const told = PG.answer(S, "I like fly fishing.", T0), ep = told.episode.id;
  const epText = S.episodes.find(c => c.rec.id === ep).text;
  const r = PG.amendReply(S, ep, 1, "[i] {like} [fly_fishing].", T0 + 60);
  ok(r.verdict === PG.say(S.G, "amended", { percepts:"1 percept" }) && r.items[0].path[0].o === "fly_fishing" &&
     r.items[0].quotes[0].text === "I like fly fishing." && r.items[0].quotes[0].ep === ep,
     "an amendment answers as a tell does, quoting the sentence it re-reads", r.verdict);
  ok(S.trips.has("self|like|fly_fishing") && !S.trips.has("self|like|fishing"), "the amended reading stands in place of the episode's own");
  ok(S.episodes.find(c => c.rec.id === ep).text === epText, "the episode itself is never rewritten");
  const e = S.trips.get("self|like|fly_fishing");
  ok(e.sources.length === 1 && e.sources[0].ep === ep && e.sources[0].n === 1, "the saying is still the episode's: its order, its count, its quote");
  const out = PG.serializeStore(S.st);
  ok(/\n@LAT91LON9 \| created:1789400060 \| updated:1789400060 \| relates:amends@LAT90LON9\n/.test(out) &&
     out.includes("shape: 1 | [i] {like} [fly_fishing].\npercept: 1 | self | like | fly_fishing | + | -"),
     "one amendment record per episode, on lane 91 at the episode's longitude");
  const order = PG.records(S.st).map(x => x.id);
  ok(order.indexOf("@LAT91LON9") > order.indexOf(ep) && order.indexOf("@LAT91LON9") < order.indexOf("@LAT98LON1"), "it goes in before the lane-98 tail");
  const re = PG.openStore(out);
  ok(PG.serializeStore(re.st) === out && re.trips.has("self|like|fly_fishing") && !re.trips.has("self|like|fishing"), "it round-trips, and reopening reads the same");
  const drift = [...re.things.values()].filter(t => PG.parseBlock(t.chunk.rec.term).belief + "" !== PG.termState(re, t).lines.map(l => l.slice(8)).join() && PG.termState(re, t).lines.length);
  ok(!drift.length, "the term records agree with the amended percepts");
  ok(PG.readingsOf(S, ep)[0].amended && PG.readingsOf(S, ep)[0].shape === "[i] {like} [fly_fishing].", "the reading that stands is the amendment's");

  PG.amend(S, ep, 1, "[i] {like fly fishing}.", T0 + 120);
  ok(S.trips.has("self|like_fly_fish|-") && !S.trips.has("self|like|fly_fishing") && (PG.serializeStore(S.st).match(/\n@LAT91LON9 /g) || []).length === 1,
     "amending again rewrites the one amendment record");
  PG.amendReply(S, ep, 1, "[i] {like} [fly fishing].", T0 + 180);
  ok(!PG.serializeStore(S.st).includes("\n@LAT91LON9 ") && S.trips.has("self|like|fishing"), "reading it back the episode's own way withdraws the amendment");

  const P = fresh();
  const two = PG.answer(P, "Pixel is a cat. He chases birds.", T0);
  PG.amend(P, two.episode.id, 2, "[he] {chases birds}.", T0 + 60);
  ok(P.trips.has("pixel|chase_bird|-"), "a pronoun in an amended sentence resolves in the sentences before it");
  PG.startEmpty(P, T0 + 120);
  ok(!PG.records(P.st).some(x => x.lat === 91), "Start empty removes the amendments with the episodes");

  const bad = PG.openStore(out.replace("percept: 1 | self | like | fly_fishing | + | -", "percept: 1 | self | like"));
  ok(bad.malformed.some(m => m.id === "@LAT91LON9") && !bad.trips.has("self|like|fishing"),
     "a malformed amendment line is skipped and counted, and still stands in for the sentence it amends");
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
  const stranded = PG.interpret(S, "What is a wheel part of?"), phrased = PG.interpret(S, "Is a wheel part of a car?");
  ok(stranded.intent === "objectsOf" && stranded.s === "wheel" && stranded.vs[0] === "part_of", "a stranded preposition asks for its object: what is a wheel part of", JSON.stringify(stranded.vs));
  ok(phrased.intent === "verify" && pk(phrased.checks[0]) === "wheel | part_of | car | + | *", "a copula question moves the copula before a declared phrase", phrased.checks && pk(phrased.checks[0]));
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
  ok(recs.filter(r => r.lon === 0 && r.lat > -90 && r.lat < 90).length === 18, "home, nine blueprint and eight grammar records kept");
  ok(recs.some(r => r.id === "@LAT99LON1") && recs.some(r => r.lat === 98) && recs.some(r => r.lat === -90), "lanes 98, 99 and the special record kept");
  ok(recs.filter(r => r.lon === 180 && r.grammar != null).length === 6 && S.grammars.length === 2, "the second language on the antimeridian kept");
  const r = PG.answer(S, "I like tea.", T0 + 60);
  ok(r.episode.id === "@LAT90LON1", "the first new episode is ordinal 1 again");
  // the fixture survives Start empty, and its sentence shares words with ordinary speech
  // (found in a third-party embedding's code review, not by this suite)
  PG.answer(S, "My sentence is short.", T0 + 120);
  const hits = PG.answer(S, "which sentence is here", T0 + 180).search;
  ok(hits.length === 1 && hits[0].ep === "@LAT90LON2", "search after Start empty finds only the owner's words, never the fixture's",
     hits.map(h => h.ep).join(" "));
}

section("rules: Datalog-style, over vectors (TTG-RFC-0003 §3.1)");
{
  const S = fresh();
  ok(S.G.rules.length === 4 && S.G.ruleErrors.length === 0 && S.grammars[1].rules.length === 4, "four seed rules load, none rejected, and the Spanish grammar borrows them");

  const sun = PG.answer(S, "Is Pixel in the sun?", T0);
  ok(sun.verdict === PG.say(S.G, "affirm_inferred") && sun.items[0].path.map(e => e.v).join(">") === "sleep_in>in" && sun.items[0].path[1].rule,
     "a one-atom rule: sleeping in the sun is being in it, shown with its label", sun.items[0] && sun.items[0].path.map(e => e.v).join(">"));

  const fl = PG.answer(S, "Are penguins flightless?", T0);
  const flPath = fl.items[0] ? fl.items[0].path.map(e => (e.pol === "-" ? "not " : "") + e.v).join(">") : "";
  ok(fl.verdict === PG.say(S.G, "affirm_inferred") && flPath === "not fly>is_a>has_property" &&
     fl.items[0].quotes.map(q => q.text).join(" | ") === "Penguins do not fly. | A penguin is a bird.",
     "a negative atom matches what the owner denied, joined to a second atom on a shared variable", flPath);
  ok(!fl.notes.some(n => n.includes("flightless")), "a term a rule concludes about has purchase");
  ok(!S.trips.has("penguin|has_property|flightless") && !S.things.get("penguin").chunk.rec.term.includes("flightless"),
     "a conclusion is never written as a belief");

  const es = fresh();
  PG.answer(es, "Pixel caza ratones.", T0);
  const chases = PG.objectsOf(es, "pixel", ["chase"]).map(g => g.term);
  ok(chases.includes("ratón") && chases.includes("mouse"), "a rule links a Spanish verb to the English one", chases.join(", "));

  const said = fresh();
  PG.answer(said, "Pixel is not in the sun.", T0);
  const v = PG.verify(said, "pixel", "in", "sun");
  ok(v.verdict === "N" && !v.inferred && !said.derived.has("pixel|in|sun"), "what the owner said outranks what a rule derives");

  const overlay = extra => PG.openStore(STORE.replace("rule: cazar X Y => chase X Y | cazar is chase\n", "rule: cazar X Y => chase X Y | cazar is chase\n" + extra.join("\n") + "\n"));
  const both = overlay(["rule: sleep_in X Y => not_in X Y | the opposite"]);
  const c = PG.verify(both, "pixel", "in", "sun");
  ok(c.verdict === "C" && c.grounds.length === 2 && c.grounds.every(g => g.kind === "inference"), "rules concluding both polarities give a contested answer with both proofs", c.verdict);

  const cyc = overlay(["rule: chase X Y => hunt Y X | a", "rule: hunt X Y => chase X Y | b", "rule: is_a X Y => is_a Y X | c", "rule: eat X Y, is_a X Z => eat Z Y | d"]);
  const terms = cyc.things.size + 1, bound = terms * terms * (cyc.vectors.size + cyc.G.vectors.size) * 2;
  ok(cyc.G.rules.length === 8 && cyc.derived.size > 0 && cyc.derived.size <= bound, "rules written to cycle still reach a fixpoint within the bound", cyc.derived.size + " ≤ " + bound);

  const bad = overlay(["rule: chase X Y => eat X Z | unsafe", "rule: chase X Y, chase Y Z, chase Z W, chase W V => chase X V | long",
                       "rule: chase X Y => with X Y | protected", "rule: chase X Y | no arrow"]);
  ok(bad.G.rules.length === 4 && bad.G.ruleErrors.map(e => e.why).join() === "unsafe,length,protected,shape", "unsafe, over-long, protected and malformed rules are rejected and reported",
     bad.G.ruleErrors.map(e => e.why).join());
}

section("time: exclusive vectors and supersession (TTG-RFC-0004 §2–3)");
{
  const empty = () => { const S = fresh(); PG.startEmpty(S, T0); return PG.openStore(PG.serializeStore(S.st)); };
  const S0 = fresh();
  ok(S0.G.vectors.get("in").flags.has("exclusive") && S0.grammars[1].vectors.get("in").flags.has("exclusive"),
     "in is declared exclusive in the store, and the Spanish grammar borrows the flag");
  ok(S0.superseded.size === 0, "the seed corpus retires nothing");

  const S = empty();
  PG.answer(S, "Mary moved to the kitchen.", T0 + 10);
  const first = PG.answer(S, "Where is Mary?", T0 + 10);
  ok(first.items.map(g => g.term).join() === "kitchen" && first.items[0].kind === "inference", "a motion rule says where someone is");
  const told = PG.answer(S, "Mary moved to the garden.", T0 + 10);
  ok(told.notes.includes(PG.say(S.G, "supersedes")) && told.items.some(g => g.kind === "superseded" && g.path.at(-1).o === "kitchen"),
     "saying the later place is reported at once, with what it replaced");
  const where = PG.answer(S, "Where is Mary?", T0 + 10);
  ok(where.items.map(g => g.term + ":" + g.kind).join() === "garden:inference,kitchen:superseded",
     "where: what holds first, what no longer holds after it", where.items.map(g => g.term + ":" + g.kind).join());
  const v = PG.answer(S, "Is Mary in the kitchen?", T0 + 10), g = v.items[0];
  ok(v.verdict === PG.say(S.G, "deny_superseded") && g.kind === "superseded" &&
     g.quotes.map(q => q.text).join() === "Mary moved to the kitchen." && g.by.quotes.map(q => q.text).join() === "Mary moved to the garden.",
     "is she in the kitchen: no longer, quoting what was said and what was said since", v.verdict);
  const text = PG.replyText(S, v);
  ok(text.includes("[" + PG.say(S.G, "label_superseded") + "]") && text.includes(" " + PG.say(S.G, "superseded_by") + " [" + PG.say(S.G, "label_inferred") + "]"),
     "the plain reply prints the retired ground, then the later one under its own label");
  const record = S.things.get("mary").chunk.rec.term;
  const again = PG.openStore(PG.serializeStore(S.st));
  ok(record.includes("belief: move_to | kitchen | + | 1 0 | 170") && [...again.superseded.keys()].join() === [...S.superseded.keys()].join(),
     "retiring is not forgetting: the belief line is unchanged, and what is retired is recomputed from the words on open");

  PG.answer(S, "Mary moved to the kitchen.", T0 + 10);
  ok(PG.objectsOf(S, "mary", ["in"]).map(g => g.term + ":" + g.kind).join() === "kitchen:inference,garden:superseded",
     "going back: the latest saying of a place makes it hold again");

  const order = empty();
  PG.answer(order, "John moved to the hall. John moved to the office.", T0 + 500);
  PG.answer(order, "Daniel moved to the office.", T0 + 500);
  PG.answer(order, "Daniel moved to the hall.", T0);
  ok(PG.verify(order, "john", "in", "hall").superseded && PG.verify(order, "daniel", "in", "office").superseded && !PG.verify(order, "daniel", "in", "hall").superseded,
     "order is sentence order within an episode and episode order on the lane; the clock passed in is not consulted");

  const nest = empty();
  PG.answer(nest, "The kitchen is in the house.", T0);
  PG.answer(nest, "Sam is in the kitchen.", T0);
  const inHouse = PG.verify(nest, "sam", "in", "house");
  PG.answer(nest, "Sam is in the house.", T0);
  ok(inHouse.verdict === "Y" && inHouse.inferred && !PG.verify(nest, "sam", "in", "kitchen").superseded && !PG.verify(nest, "sam", "in", "house").superseded,
     "two places along the vector from each other are compatible: the kitchen is in the house");
  PG.answer(nest, "Sam moved to the garden.", T0);
  ok(PG.verify(nest, "sam", "in", "kitchen").superseded && PG.verify(nest, "sam", "in", "house").superseded,
     "a place off that chain retires both");
  const nest2 = empty();
  PG.answer(nest2, "The kitchen is in the house.", T0);
  PG.answer(nest2, "Sam is in the kitchen.", T0);
  PG.answer(nest2, "Sam moved to the garden.", T0);
  ok(PG.verify(nest2, "sam", "in", "house").verdict === "U", "and no chain is walked through a retired link", PG.verify(nest2, "sam", "in", "house").verdict);

  const mind = empty();
  PG.answer(mind, "Kim is in the garden.", T0);
  PG.answer(mind, "Kim is not in the garden.", T0);
  ok(PG.verify(mind, "kim", "in", "garden").verdict === "C", "a later denial of the same place is still a contradiction, not a supersession");

  const many = empty();
  PG.answer(many, "Pixel chases mice.", T0);
  PG.answer(many, "Pixel chases birds.", T0);
  ok(PG.objectsOf(many, "pixel", ["chase"]).every(g => g.kind === "direct") && many.superseded.size === 0,
     "a vector not declared exclusive keeps every object");

  const es = empty();
  PG.answer(es, "Mary moved to the kitchen.", T0);
  PG.answer(es, "Mary moved to the garden.", T0);
  const q = PG.answer(es, "¿Está Mary en el kitchen?", T0);
  ok(q.lang === "es" && q.verdict === PG.say(es.grammars[1], "deny_superseded"), "asked in Spanish, the answer is no longer, in Spanish", q.verdict);
}

section("two languages, one sphere (TTG-RFC-0001 §11)");
{
  const S = fresh(), [en, es] = S.grammars;
  ok(S.grammars.map(G => G.lang).join(" ") === "en es", "two grammars, in the order the store declares them");
  ok(JSON.stringify(es.num) === JSON.stringify(en.num) && JSON.stringify(es.roles) === JSON.stringify(en.roles) &&
     [...en.vectors].every(([k, v]) => es.vectors.get(k).inverse === v.inverse && [...v.flags].join() === [...es.vectors.get(k).flags].join()),
     "the second borrows the numbers, the roles and the vector algebra");
  ok(es.vectors.get("is_a").label === "es un" && en.vectors.get("is_a").label === "is a", "and names the vectors in its own words");

  const cases = [
    ["Los gatos son mamíferos.",       ["gato | is_a | mamífero | + | -"]],
    ["Los gatos cazan ratones.",       ["gato | cazar | ratón | + | -"]],
    ["Yo no bebo café.",               ["self | beber | café | - | -"]],
    ["Pixel duerme en el sol.",        ["pixel | dormir_en | sol | + | -"]],
    ["Los pingüinos no pueden volar.", ["pingüino | volar | - | - | -"]],
    ["La rueda es parte del coche.",   ["rueda | part_of | coche | + | -"]],
    ["El gato está en la caja.",       ["gato | in | caja | + | -"]]
  ];
  for (const [text, want] of cases){
    const G = PG.pickGrammar(S, text);
    const got = PG.withGrammar(S, G, () => PG.perceiveSentence(S, text, { last:null }).percepts.map(pk));
    ok(G.lang === "es" && JSON.stringify(got) === JSON.stringify(want), JSON.stringify(text), G.lang + ": " + got.join(" ; "));
  }

  const q = PG.answer(S, "¿Es Pixel un animal?", T0);
  ok(q.lang === "es" && q.verdict === PG.say(es, "affirm_inferred") && q.items[0].quotes[0].text === "Pixel is a cat.",
     "asked in Spanish, answered in Spanish, from English sayings quoted as said", q.verdict);
  ok(PG.replyText(S, q).includes("[" + es.say.label_inferred + "]"), "and the plain-text reply keeps the language it was asked in");

  const mixed = PG.answer(S, "Los gatos duermen mucho. Cats are lazy.", T0 + 60);
  ok(mixed.episode.percepts.map(pk).join(" ; ") === "gato | dormir | - | + | - ; cat | has_property | lazy | + | -",
     "one episode, each sentence read in its own language", mixed.episode.percepts.map(pk).join(" ; "));

  PG.answer(S, "Un pingüino es un penguin.", T0 + 120);
  const v = PG.verify(S, "pingüino", "fly", "-");
  ok(v.verdict === "N" && v.inferred && v.grounds[0].path.map(e => e.s + ">" + e.v).join(" ") === "pingüino>is_a penguin>fly",
     "a term the owner links inherits across the languages, exception and all", v.grounds[0] && v.grounds[0].path.map(e => e.s + ">" + e.v).join(" "));
  ok(PG.pickGrammar(S, "No cats bark.").lang === "en" && PG.pickGrammar(S, "morning tea").lang === "en", "a tie, or no recognised word, goes to the first language");

  // why the languages are kept apart: merged into one lexicon, the collisions break English
  const merged = PG.openStore(STORE.replace("kind: lexicon\nlang: es\n", "kind: lexicon\n"));
  const parseCases = ["A penguin is a bird.", "A wheel is part of a car.", "No cats bark.", "Cats chase mice but they don't eat grass."];
  const broke = parseCases.filter(t => PG.perceiveSentence(merged, t, { last:null }).percepts.map(pk).join() !== PG.perceiveSentence(S, t, { last:null }).percepts.map(pk).join());
  ok(broke.join(" ; ") === "A penguin is a bird. ; A wheel is part of a car.", "merged, *a* and *no* collide and break two English parses", broke.join(" ; "));
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
  const Gs = fresh().grammars, G = Gs[0];
  // block keys are schema, like a column name: the check is about the words, not the keys that hold them
  const SCHEMA = new Set(["kind", "class", "lemma", "forms", "seen", "asked", "belief", "source", "at", "said", "percept", "lang", "label"]);
  const vocab = new Set(Gs.flatMap(G => [...G.classes.keys(), ...G.whole.keys(), ...G.nounIrr.keys(), ...G.nounIrr.values(),
    ...G.verbIrr.keys(), ...G.verbIrr.values(), ...G.seed, ...G.vectors.keys(), ...G.phrases.flatMap(p => p[0]),
    ...G.whThing, ...G.whPlace.keys(), ...G.about, ...[...G.vectors.values()].map(v => v.label)]).filter(w => w.length >= 2 && !SCHEMA.has(w)));
  const leaks = [...vocab].filter(w => new RegExp("[\"'`]" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\"'`]").test(code));
  ok(leaks.length === 0, "no word of either language's grammar is a string literal in index.html (" + vocab.size + " checked)", leaks.join(", "));
  const said = Gs.flatMap(G => Object.values(G.say)).filter(p => p.length >= 6);
  ok(said.every(p => !code.includes(p)), "no reply phrase in either language is copied into index.html");

  // 4. Every number the store declares is read by the runtime.
  const numbers = Object.keys(G.num).concat(Object.keys(G.sphere));
  const unread = numbers.filter(k => !code.includes(k));
  ok(unread.length === 0, "every key in the numbers and sphere blocks is named in index.html", unread.join(", "));
}

console.log("\n" + (fails ? fails + " FAILED" : "all passed"));
process.exit(fails ? 1 : 0);
