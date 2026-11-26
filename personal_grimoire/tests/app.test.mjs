// The engine, headless: index.html's own script against the real store.
import { loadEngine, read, scriptOf } from "../tools/harness.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { EXAMPLES, build, check, NOW, STEP } from "../tools/examples.mjs";

const PG = await loadEngine();
const STORE = read("personal_grimoire_ttdb.md").replace(/\r\n?/g, "\n");
const fresh = () => PG.openStore(STORE);
const T0 = 1789400000;
// written without escapes so the suite can be edited by the same tools that edit the store
const NL = String.fromCharCode(10), FENCE = "```";

let fails = 0, passes = 0;
const ok = (cond, msg, extra = "") => {
  if (cond){ passes++; console.log("  PASS  " + msg + (extra ? "  " + extra : "")); }
  else { fails++; console.log("  FAIL  " + msg + "  " + extra); }
};
const section = s => console.log("\n== " + s + " ==");
// a percept that belongs to one reading of two carries its letter (TTG-RFC-0005 §3)
const pk = p => [p.s, p.v, p.o, p.pol, p.q].concat(p.reading ? [p.reading] : []).join(" | ");

section("the store parses and round-trips");
{
  const S = fresh();
  const headers = STORE.split("\n").filter(l => /^@LAT-?[\d.]+LON-?[\d.]+\s*\|/.test(l));
  const recs = PG.records(S.st);
  ok(recs.length === headers.length, "every record header in the store is parsed", recs.length + " of " + headers.length);
  ok(PG.serializeStore(S.st) === STORE, "parse then write reproduces the file byte for byte");
  PG.syncTerms(S, T0, new Set());
  ok(PG.serializeStore(S.st) === STORE, "a sync with nothing new rewrites nothing");
  const kinds = ["lexicon", "morphology", "seed", "vectors", "questions", "responses", "numbers", "rules", "constructions"];
  ok(kinds.every(k => S.G.loaded.includes(k)), "all nine grammar kinds load", S.G.loaded.join(","));
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

section("weights: the score, what it is a share of, and the half-life (TTDB-RFC-0005)");
{
  const S = fresh(), recs = PG.records(S.st);
  const terms = [...S.things.values(), ...S.vectors.values()];
  const tr = terms.map(t => t.chunk.rec);
  ok(tr.every(r => r.eps === Math.round(r.epsRaw)), "the printed EPS is the unrounded one rounded, as §3.3 defines it");
  const rounded = new Set(tr.map(r => r.eps)), exact = new Set(tr.map(r => r.epsRaw.toFixed(6)));
  ok(exact.size > rounded.size, "and the unrounded one separates terms the rounding puts at one number",
     exact.size + " unrounded vs " + rounded.size + " rounded");
  // a record is a share of its own population's top, never of the RFC's 255
  const mapTop = PG.epsTop(S), laneTop = PG.epsTop(S, { lat:98 });
  const laneMax = recs.filter(r => Math.abs(r.lat) >= 90).reduce((m, r) => Math.max(m, r.epsRaw), 0);
  const mapMax = recs.filter(r => Math.abs(r.lat) < 90).reduce((m, r) => Math.max(m, r.epsRaw), 0);
  ok(mapTop === mapMax && laneTop === laneMax, "the map and the lanes are scaled apart",
     mapTop.toFixed(2) + " vs " + laneTop.toFixed(2));
  ok(laneTop > mapTop * 10, "hand-written lane weights run an order of magnitude over derived ones");
  // salience halves every sal_half_life episodes a term goes unmentioned (§3.2)
  const half = +S.G.sphere.sal_half_life;
  ok(half > 0, "the store declares a salience half-life", String(half));
  const raw = t => Math.min(255, (S.seenCounts.get(t.cls + "|" + t.lemma) || 0) + t.asked);
  const drifted = terms.filter(t => {
    const age = S.episodes.length - (S.lastSeen.get(t.cls + "|" + t.lemma) || 0);
    return t.chunk.rec.sal !== raw(t) >> Math.floor(age / half);
  });
  ok(!drifted.length, "every stored sal is that term's count, halved once per half-life since it was last said",
     drifted.map(t => t.lemma).join(", "));
  const fresh1 = S.things.get("coffee"), stale = S.things.get("bird");
  ok(raw(fresh1) < raw(stale) && fresh1.chunk.rec.sal > stale.chunk.rec.sal,
     "a term said less often but more recently outweighs one said more often long ago",
     "coffee " + fresh1.chunk.rec.sal + " of " + raw(fresh1) + ", bird " + stale.chunk.rec.sal + " of " + raw(stale));
  // and a store that declares no half-life does not decay at all
  const flat = PG.openStore(STORE.split(NL + "sal_half_life: " + half).join(""));
  const fb = flat.things.get("bird");
  ok(flat.G.sphere.sal_half_life == null && PG.termState(flat, fb).sal === (flat.seenCounts.get("thing|bird") || 0) + fb.asked,
     "with no half-life declared, salience is the plain count again", String(PG.termState(flat, fb).sal));
}

section("a scene is a walk over the map (TTCP-RFC-0002 §10)");
{
  const S = fresh(), recs = PG.records(S.st);
  const byKey = new Map(recs.map(r => [r.key, r]));
  const scenes = PG.scenesOf(S.st);
  ok(scenes.length === 1 && scenes[0].id === "@LAT96LON0", "one scene record, on the tail lane beside the README",
     scenes.map(r => r.id).join());
  ok(scenes[0].fields.some(([k, v]) => k === "type" && v === "scene"), "declared by type: scene in its header (§10.1)");
  const sc = PG.sceneOf(scenes[0]);
  ok(sc && sc.edges.length === 7 && sc.loop === false && sc.start.id === "@LAT-53.1LON174",
     "seven legs, no loop, starting on pixel", sc ? sc.edges.length + " legs from " + sc.start.id : "unparsed");
  ok(sc.edges.every(e => e.hold > 0 && byKey.has(e.from.key) && byKey.has(e.to.key)),
     "every leg holds for a time and both its stops exist");
  // a leg is a relation the store holds, walked with the arrow or against it
  const held = (a, b) => byKey.get(a).edges.some(e => e.target && e.target.key === b);
  const real = sc.edges.filter(e => held(e.from.key, e.to.key) || held(e.to.key, e.from.key));
  ok(real.length === 6 && sc.edges[6].name === "return_home",
     "six legs are edges some record carries; the seventh is the return home", real.length + " of 7");
  const neg = S.G.roles.negation_prefix;
  ok(sc.edges.some(e => byKey.get(e.from.key).edges.some(x => x.target && x.target.key === e.to.key && x.type.indexOf(neg) === 0)),
     "one leg walks a negative belief, which is what reaches the far hemisphere");
  // §10.3.4: from each stop, take the next leg that starts where you stand
  let at = sc.start.key, i = -1;
  const stops = [byKey.get(at).title];
  for (;;){
    let j = i + 1;
    while (j < sc.edges.length && sc.edges[j].from.key !== at) j++;
    if (j >= sc.edges.length) break;
    i = j; at = sc.edges[j].to.key; stops.push(byKey.get(at).title);
  }
  ok(i === sc.edges.length - 1, "walked by §10.3.4 the scene takes every leg: it is a path, not a set",
     (i + 1) + " of " + sc.edges.length);
  ok(stops.join(" ") === "pixel cat mammal animal bird penguin fly self", "and it ends on the speaker", stops.join(" "));
  ok(PG.sceneOf(recs.find(r => r.id === "@LAT0LON0")) === null, "a record with no scene block has no scene");
  ok(PG.sceneOf(PG.parseRecord(["@LAT1LON1 | created:1", "", FENCE + "ttdb-scene", "loop: true", FENCE, ""].join(NL))) === null,
     "and a scene block with no legs is no scene either");
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

section("said but not asserted: relatives, stance, alternatives, asides (TTG-RFC-0005 §3–§4)");
{
  const S = fresh();
  const cases = [
    ["Cats that chase mice are fast.",               "[cats] that {chase} [mice] {are} [fast].",                     ["cat | chase | mouse | + | -", "cat | has_property | fast | + | -"]],
    ["Cats that chase mice that eat cheese are fast.", "[cats] that {chase} [mice] that {eat} [cheese] {are} [fast].", ["cat | chase | mouse | + | -", "mouse | eat | cheese | + | -", "cat | has_property | fast | + | -"]],
    ["Pixel is a cat or a dog.",                     "[pixel] {is} [a cat or a dog].",                               ["pixel | is_a | cat | ? | -", "pixel | is_a | dog | ? | -"]],
    ["Birds fly or swim.",                           "[birds] {fly or swim}.",                                       ["bird | fly | - | ? | -", "bird | swim | - | ? | -"]],
    ["Pixel sleeps or Pixel eats.",                  "[pixel] {sleeps} or [pixel] {eats}.",                          ["pixel | sleep | - | ? | -", "pixel | eat | - | ? | -"]],
    ["I doubt cats like fish.",                      "[i] {doubt} [cats] {like} [fish].",                            ["self | doubt | - | + | -", "cat | like | fish | ? | -"]],
    ["I think that cats bark.",                      "[i] {think} [that cats] {bark}.",                              ["self | think | - | + | -", "cat | bark | - | ? | -"]],
    ["I wonder if cats bark.",                       "[i] {wonder} if [cats] {bark}.",                               ["self | wonder | - | + | -", "cat | bark | - | ? | -"]],
    ["I don't think Pixel is fast.",                 "[i] {do not think} [pixel] {is} [fast].",                      ["self | think | - | - | -", "pixel | has_property | fast | ? | -"]],
    ["I believe you.",                               "[i] {believe} [you].",                                         ["self | believe | you | + | -"]],
    ["Hope is good.",                                "[hope] {is} [good].",                                          ["hope | has_property | good | + | -"]],
    ["Los gatos que cazan ratones son rápidos.",     "[los gatos] que {cazan} [ratones] {son} [rápidos].",           ["gato | cazar | ratón | + | -", "gato | is_a | rápido | + | -"]],
    ["Creo que los gatos ladran.",                   "{creo} que [los gatos] {ladran}.",                             ["self | creer | - | + | -", "gato | ladrar | - | ? | -"]],
    ["El gato negro duerme.",                        "[el gato negro] {duerme}.",                                    ["gato | dormir | - | + | -"]],
    ["Tengo dos gatos.",                             "{tengo} [dos gatos].",                                         ["self | has | gato | + | -"]],
    // a stance inside a relative: the stance's clause is held, and the relative still closes
    ["The man that says cats bark is tall.",         "[the man] that {says} [cats] {bark is} [tall].",               ["man | say | - | + | -", "cat | bark | - | ? | -", "man | has_property | tall | + | -"]],
    ["The man that says cats like fish is tall.",    "[the man] that {says} [cats] {like} [fish] {is} [tall].",      ["man | say | - | + | -", "cat | like | fish | ? | -", "man | has_property | tall | + | -"]],
    // a relative inside a stance's clause is held with it; without a clause after it, the stance keeps its thing
    ["I think the cat that chased the mouse is fast.", "[i] {think} [the cat] that {chased} [the mouse] {is} [fast].", ["self | think | - | + | -", "cat | chase | mouse | ? | -", "cat | has_property | fast | ? | -"]],
    ["I believe the man that fixed the car.",        "[i] {believe} [the man] that {fixed} [the car].",              ["self | believe | man | + | -", "man | fix | car | + | -"]],
    // object relatives: the relative's verb takes the thing before the relative word as its object —
    // before the sentence's own verb, and after it for a verb the corpus uses with an object
    ["The dog that the cat chased ran away.",        "[the dog] that [the cat] {chased ran} [away].",                ["cat | chase | dog | + | -", "dog | run | away | + | -"]],
    ["I like the dog that the cat chased.",          "[i] {like} [the dog] that [the cat] {chased}.",                ["self | like | dog | + | -", "cat | chase | dog | + | -"]],
    ["I emailed the man that the cat chased.",       "[i] {emailed} [the man] that [the cat] {chased}.",             ["self | email | man | + | -", "cat | chase | man | + | -"]],
    // …and one whose gap no verb takes was never a relative: it reports a clause, which is held
    ["I emailed the man that the cat sleeps.",       "[i] {emailed} [the man] that [the cat] {sleeps}.",             ["self | email | man | + | -", "cat | sleep | - | ? | -"]],
    ["I emailed the man that the cat chased the mouse.", "[i] {emailed} [the man] that [the cat] {chased} [the mouse].", ["self | email | man | + | -", "cat | chase | mouse | ? | -"]],
    // a verb whose own thing follows a preposition gives it up for the gap; a stranded one joins the verb
    ["The cat that I saw in the garden sleeps.",     "[the cat] that [i] {saw in} [the garden] {sleeps}.",          ["self | see | cat | + | -", "cat | sleep | - | + | -", "cat | with | garden | + | -"]],
    ["The house that I live in is big.",             "[the house] that [i] {live in is} [big].",                     ["self | live_in | house | + | -", "house | has_property | big | + | -"]],
    // a relative word that is also a determiner, before a bare thing and a verb: an object relative
    ["The dog that cats chase is fast.",             "[the dog] that [cats] {chase is} [fast].",                     ["cat | chase | dog | + | -", "dog | has_property | fast | + | -"]],
    ["The cheese that Pixel has is old.",            "[the cheese] that [pixel] {has is} [old].",                    ["pixel | has | cheese | + | -", "cheese | has_property | old | + | -"]],
    ["Pixel and that cat sleep.",                    "[pixel and that cat] {sleep}.",                                ["pixel | sleep | - | + | -", "cat | sleep | - | + | -"]],
    ["El perro que gatos persiguen es rápido.",      "[el perro] que [gatos] {persiguen es} [rápido].",              ["gato | perseguir | perro | + | -", "perro | has_property | rápido | + | -"]],
    // a bare verb goes on with a relative's chain while a finite verb is still to come, or after a chain verb
    ["The man that saw the cat eat cheese is tall.", "[the man] that {saw} [the cat] {eat} [cheese] {is} [tall].",  ["man | see | cat | + | -", "cat | eat | cheese | + | -", "man | has_property | tall | + | -"]],
    ["I like the man that saw the cat eat cheese.",  "[i] {like} [the man] that {saw} [the cat] {eat} [cheese].",    ["self | like | man | + | -", "man | see | cat | + | -", "cat | eat | cheese | + | -"]],
    ["The cat that I saw eat cheese is fat.",        "[the cat] that [i] {saw eat} [cheese] {is} [fat].",            ["self | see | cat | + | -", "cat | eat | cheese | + | -", "cat | has_property | fat | + | -"]],
    ["I saw the cat that chased the mouse run away.", "[i] {saw} [the cat] that {chased} [the mouse] {run} [away].", ["self | see | cat | + | -", "cat | chase | mouse | + | -", "cat | run | away | + | -"]],
    ["Cats that chase mice eat cheese.",             "[cats] that {chase} [mice] {eat} [cheese].",                   ["cat | chase | mouse | + | -", "cat | eat | cheese | + | -"]],
    ["Pixel has been happy.",                        "[pixel] {has been} [happy].",                                  ["pixel | has_property | happy | + | -"]],
    // a verb straight after a relative's own is the clause's, unless another verb is to come
    ["Cats that hunt eat mice.",                     "[cats] that {hunt eat} [mice].",                               ["cat | hunt | - | + | -", "cat | eat | mouse | + | -"]],
    ["Cats that hunt often eat mice.",               "[cats] that {hunt often eat} [mice].",                         ["cat | hunt | - | + | -", "cat | eat | mouse | + | -"]],
    ["Dogs that bark bite.",                         "[dogs] that {bark bite}.",                                     ["dog | bark | - | + | -", "dog | bite | - | + | -"]],
    ["Birds that sing love songs are happy.",        "[birds] that {sing} [love songs] {are} [happy].",              ["bird | sing | song | + | -", "bird | has_property | happy | + | -"]],
    ["Los gatos que cazan comen ratones.",           "[los gatos] que {cazan comen} [ratones].",                     ["gato | cazar | - | + | -", "gato | comer | ratón | + | -"]],
    // a stance noun's clause is held, and closes like a relative
    ["The idea that cats bark is silly.",            "[the idea] that [cats] {bark is} [silly].",                    ["cat | bark | - | ? | -", "idea | has_property | silly | + | -"]],
    ["La idea de que los gatos ladran es tonta.",    "[la idea de] que [los gatos] {ladran es} [tonta].",            ["gato | ladrar | - | ? | -", "idea | has_property | tonta | + | -"]],
    // a bare form that cannot be finite for the antecedent stays in the relative; one that can, closes it
    ["The man that saw the cat eat cheese.",         "[the man] that {saw} [the cat] {eat} [cheese].",               ["man | see | cat | + | -", "cat | eat | cheese | + | -"]],
    // …and where both readings are grammatical, both are held: who eats is not said
    ["The men that saw the cats eat cheese.",        "[the men] that {saw} [the cats] {eat} [cheese].",              ["man | see | cat | + | -", "cat | eat | cheese | ? | - | a", "man | eat | cheese | ? | - | b"]],
    ["The cats that I saw eat cheese.",              "[the cats] that [i] {saw eat} [cheese].",                      ["self | see | cat | + | -", "cat | eat | cheese | + | -"]],
    ["El hombre que vio al gato comer queso.",       "[el hombre] que {vio} [a el gato] {comer} [queso].",           ["hombre | ver | gato | + | -", "gato | comer | queso | + | -"]],
    // a stranded preposition's thing is the gap, unless a stance verb's thing may be hearing a clause
    ["I like the house that I live in.",             "[i] {like} [the house] that [i] {live in}.",                   ["self | like | house | + | -", "self | live_in | house | + | -"]],
    ["I know the man that I talked to.",             "[i] {know} [the man] that [i] {talked to}.",                   ["self | know | man | + | -", "self | talk_to | man | + | -"]],
    ["I told the man that the cat came in.",         "[i] {told} [the man] that [the cat] {came in}.",               ["self | tell | man | + | -", "cat | come_in | - | ? | -"]],
    // a verb that takes no thing never takes the gap; after a verb that cannot hear a clause, any other one does;
    // after a stance verb's thing, a verb that might is read both ways, and both are held
    ["The rule that cats bark is old.",              "[the rule] that [cats] {bark is} [old].",                      ["cat | bark | - | ? | -", "rule | has_property | old | + | -"]],
    ["I like the dog that the cat bit.",             "[i] {like} [the dog] that [the cat] {bit}.",                   ["self | like | dog | + | -", "cat | bite | dog | + | -"]],
    ["I told the man that the cat bit.",             "[i] {told} [the man] that [the cat] {bit}.",                   ["self | tell | man | + | -", "cat | bite | - | ? | - | a", "cat | bite | man | ? | - | b"]],
    // an unlisted word with an adverb ending, between a thing and its verb, is the verb's; a guarded one is not
    ["The dog that the cat quickly chased ran away.", "[the dog] that [the cat] {quickly chased ran} [away].",       ["cat | chase | dog | + | -", "dog | run | away | + | -"]],
    ["Pixel's family eats fish.",                    "[pixel family] {eats} [fish].",                                ["family | eat | fish | + | -"]],
    ["El gato rápidamente persigue al ratón.",       "[el gato] {rápidamente persigue} [a el ratón].",               ["gato | perseguir | ratón | + | -"]],
    // where the grammar drops subjects, the speaker's own verb form says who
    ["Vi al gato.",                                  "{vi} [a el gato].",                                            ["self | ver | gato | + | -"]],
    ["No como carne.",                               "{no como} [carne].",                                           ["self | comer | carne | - | -"]],
    ["Como queso y bebo vino.",                      "{como} [queso] y {bebo} [vino].",                              ["self | comer | queso | + | -", "self | beber | vino | + | -"]],
    // after a stance verb's thing, a clause whose verb takes the gap is a relative, and a finite verb to come makes it sure
    ["I told the man that the cat chased.",          "[i] {told} [the man] that [the cat] {chased}.",                ["self | tell | man | + | -", "cat | chase | man | + | -"]],
    ["I think the man that the cat chased is fast.", "[i] {think} [the man] that [the cat] {chased is} [fast].",     ["self | think | - | + | -", "cat | chase | man | ? | -", "man | has_property | fast | ? | -"]],
    // an object mark is not a preposition, except after a verb that goes somewhere
    ["Pixel persigue a los ratones.",                "[pixel] {persigue} [a los ratones].",                          ["pixel | perseguir | ratón | + | -"]],
    ["Pixel va a la tienda.",                        "[pixel] {va a} [la tienda].",                                  ["pixel | ir_a | tienda | + | -"]],
    ["I told the man that the cat sleeps.",          "[i] {told} [the man] that [the cat] {sleeps}.",                ["self | tell | man | + | -", "cat | sleep | - | ? | -"]],
    ["I gave the dog that bone.",                    "[i] {gave} [the dog that bone].",                              ["self | give | dog | + | -", "self | give | bone | + | -"]],
    ["El perro que el gato persigue es negro.",      "[el perro] que [el gato] {persigue es} [negro].",              ["gato | perseguir | perro | + | -", "perro | has_property | negro | + | -"]],
    // not over or: neither; an alternative of subjects stays held
    ["Pixel is not a cat or a dog.",                 "[pixel] {is not} [a cat or a dog].",                           ["pixel | is_a | cat | - | -", "pixel | is_a | dog | - | -"]],
    ["Birds do not fly or swim.",                    "[birds] {do not fly or swim}.",                                ["bird | fly | - | - | -", "bird | swim | - | - | -"]],
    ["Cats or dogs do not bark.",                    "[cats or dogs] {do not bark}.",                                ["cat | bark | - | ?- | -", "dog | bark | - | ?- | -"]],
    // held keeps its own polarity
    ["I doubt cats don't bark.",                     "[i] {doubt} [cats] {do not bark}.",                            ["self | doubt | - | + | -", "cat | bark | - | ?- | -"]],
    // an aside is left out of the reading: a hedge the owner meant as fact
    ["(I think) cats bark.",                         "(i think) [cats] {bark}.",                                     ["cat | bark | - | + | -"]],
    ["Pixel (my cat) sleeps.",                       "[pixel] (my cat) {sleeps}.",                                   ["pixel | sleep | - | + | -"]]
  ];
  for (const [text, shape, want] of cases){
    const r = PG.shapeOf(S, text), got = r.percepts.map(pk);
    ok(r.shape === shape && JSON.stringify(got) === JSON.stringify(want), JSON.stringify(text) + " reads " + shape, r.shape + "  " + got.join(" ; "));
  }
  const drift = cases.map(c => c[0]).filter(t => {
    const a = PG.shapeOf(S, t), b = PG.shapeOf(S, a.shape);
    return a.shape !== b.shape || a.percepts.map(pk).join() !== b.percepts.map(pk).join();
  });
  ok(drift.length === 0, "each of these shapes reads back to itself", drift.join(" ; "));
  ok(S.grammars.find(G => G.lang === "es").headFirst && !S.G.headFirst, "the head's position is the grammar's: first in Spanish, last in English");

  // a held saying is written, seen and searchable, and never believed or contradicting
  const H = fresh(), fish = () => H.seenCounts.get("thing|fish") || 0, before = fish();
  PG.answer(H, "Cats like fish.", T0);
  const d = PG.answer(H, "I doubt cats like fish.", T0 + 60);
  ok(d.episode.percepts.map(pk).join() === "self | doubt | - | + | -" && d.episode.held.map(pk).join() === "cat | like | fish | ? | -",
     "the stance is the owner's, the clause it takes is held");
  ok(PG.serializeStore(H.st).includes("percept: 1 | cat | like | fish | ? | -") && H.malformed.length === 3, "a held percept is written with ? and is well formed");
  ok(fish() === before + 2 && H.trips.get("cat|like|fish").fr === 1 && H.trips.get("cat|like|fish").sources.length === 1,
     "it is seen, and counts neither for nor against");
  ok(!d.notes.includes(PG.say(H.G, "contradicts")) && d.notes.includes(PG.say(H.G, "noted_held", { triples:"cat like fish" })),
     "it never contradicts what was said, and the reply names it as held", d.notes.join(" | "));
  ok(d.verdict === PG.say(H.G, "noted", { percepts:"2 percepts", sentences:"1 sentence" }), "the verdict counts it", d.verdict);
  const q = PG.answer(H, "Is Pixel a cat or a dog?", T0 + 120);
  ok(q.intent === "verify", "a question still asks after each alternative");
  const hn = PG.answer(H, "I doubt cats don't like fish.", T0 + 180), neg = PG.say(H.G, "noted_held", { triples:"cat " + H.G.roles.negation_prefix + "like fish" });
  ok(PG.serializeStore(H.st).includes("percept: 1 | cat | like | fish | ?- | -") && H.malformed.length === 3 && H.trips.get("cat|like|fish").fr === 1 &&
     !hn.notes.includes(PG.say(H.G, "contradicts")) && hn.notes.includes(neg), "a held denial is written ?-, well formed, named as a denial, and contradicts nothing", hn.notes.join(" | "));

  // a stance is linked to what it holds (TTG-RFC-0002 §5.1, the holds line): what do I doubt?
  {
  const K = fresh(), lines = () => PG.serializeStore(K.st).split(NL);
  const dk = PG.answer(K, "I doubt cats like fish.", T0);
  const block = id => { const i = lines().findIndex(l => l.startsWith(id + " |")); return lines().slice(i, lines().indexOf("---", i)); };
  ok(block(dk.episode.id).includes("holds: 1 | 1 | 2"), "the stance percept is written as holding the clause it takes", block(dk.episode.id).join(" / "));
  const wk = PG.answer(K, "What do I doubt?", T0 + 60);
  const linkNote = PG.say(K.G, "asked_holds", { s:"self", v:"doubt", triples:"cat like fish", text:"I doubt cats like fish.", ep:dk.episode.id });
  ok(wk.notes.includes(linkNote) && wk.verdict !== PG.say(K.G, "nothing_found") && !wk.items.length,
     "a question after the stance names what it holds, as a note and never as a ground", wk.notes.join(" | "));
  ok(K.trips.get("cat|like|fish") === undefined, "and what it holds is still never believed");
  const wo = PG.answer(K, "I wonder if dogs bark.", T0 + 120), id = PG.answer(K, "The idea that cats bark is silly.", T0 + 180);
  const nest = PG.answer(K, "I think you doubt cats bark.", T0 + 240), alt = PG.answer(K, "Pixel is a cat or a dog.", T0 + 300);
  ok(block(wo.episode.id).includes("holds: 1 | 1 | 2"), "a clause after a stance verb and a subord word is held by that verb");
  ok(block(id.episode.id).includes("holds: 1 | 2 | 1"), "a stance noun's clause is held by the percept the noun is the subject of");
  ok(block(nest.episode.id).includes("holds: 1 | 1 | 2") && block(nest.episode.id).includes("holds: 1 | 2 | 3"),
     "a stance inside a stance: each holds its own clause");
  ok(!block(alt.episode.id).some(l => l.startsWith("holds:")), "what an or joins is held by no stance, and no holds line is written");
  ok(K.malformed.length === 3 && PG.reread(K).changed.length === 0, "holds lines are well formed, and the sentences read back as written");
  const es = PG.answer(K, "Dudo que los gatos ladran.", T0 + 360);
  ok(block(es.episode.id).includes("holds: 1 | 1 | 2"), "Spanish links a stance to its clause the same way");
  // a holds line that points at a percept that is not held is malformed: skipped, counted, and links nothing
  const bad = PG.openStore(PG.serializeStore(K.st).replace("? | -" + NL + "holds: 1 | 1 | 2", "? | -" + NL + "holds: 1 | 1 | 1"));
  ok(bad.malformed.length === 4 && bad.holds.length === K.holds.length - 1, "a malformed holds line is skipped and counted", bad.malformed.length + "");
  // a store written before holds lines is offered them by a re-reading, and taking it writes them in an amendment
  const old = PG.openStore(PG.serializeStore(K.st).split(NL).filter(l => !l.startsWith("holds:")).join(NL));
  const rr = PG.reread(old), mine = rr.changed.find(x => x.episode === dk.episode.id);
  ok(old.holds.length === 0 && mine && mine.now.join() === mine.was.join() && mine.holds.join() === "1 | 1 | 2",
     "an episode with no holds line is offered one by a re-reading, with its percepts unchanged", rr.changed.length + "");
  PG.takeRereads(old, rr.grammar, T0 + 420);
  const wk2 = PG.answer(old, "What do I doubt?", T0 + 480);
  ok(wk2.notes.includes(linkNote) && PG.reread(old).changed.every(x => x.accepted), "taking it links the stance, and every re-reading is accepted");
  // reading the sentence back the episode's own way withdraws an amendment, holds line included
  const am = PG.amend(K, dk.episode.id, 1, "[I] {doubt} [cats] {like} [fish].", T0 + 540);
  ok(am && K.amends.size === 0, "an amendment that reads as the episode does, holds and all, is withdrawn");
  }

  // what a verb takes is counted in episodes, apart for the owner's words and the grammar's gaps (TTG-RFC-0005 §3, verb frames)
  {
    const many = (o, k) => o[k] == null ? [] : [].concat(o[k]);
    const withNum = (k, v) => PG.openStore(STORE.replace(new RegExp("^" + k + ": .*$", "m"), k + ": " + v));
    const told = S => PG.shapeOf(S, "I told the man that the cat bit.").percepts.map(pk).join(" ; ");
    const said = "self | tell | man | + | - ; cat | bite | man | + | -", two = "self | tell | man | + | - ; cat | bite | - | ? | - | a ; cat | bite | man | ? | - | b";
    const feed = (S, says) => { let t = T0; for (const s of says) PG.answer(S, s, t += 60); return S; };
    const D = feed(fresh(), ["I like the dog that the cat bit."]);
    const ep = D.episodes[D.episodes.length - 1], blk = PG.parseBlock(ep.rec.episode);
    ok(many(blk, "gap").join() === "1 | 2", "a gap the grammar filled is written as its reading, by ordinal", many(blk, "gap").join());
    ok(PG.parseBlock(D.vectors.get("bite").chunk.rec.term).frames === "1 0 | 1 0", "the verb's record shows its frames: one episode with a thing, read at a gap");
    ok(told(D) === said, "with the declared numbers, a gap the grammar filled teaches as before", told(D));
    ok(told(feed(withNum("frame_grammar_weight", 0), ["I like the dog that the cat bit."])) === two,
       "at frame_grammar_weight 0 the grammar's own gap teaches nothing, and the sentence keeps both readings");
    ok(told(feed(withNum("frame_grammar_weight", 0), ["Dogs bite cats."])) === said, "while the owner's own words still teach it");
    ok(told(feed(withNum("frame_min_episodes", 2), ["Dogs bite cats."])) === two &&
       told(feed(withNum("frame_min_episodes", 2), ["Dogs bite cats.", "Snakes bite mice."])) === said,
       "frame_min_episodes counts episodes: one is not enough at 2, two are");
    ok(told(feed(fresh(), ["Dogs bite cats.", "Dogs bite.", "Cats bite."])) === said, "with frame_preempt_ratio 0 nothing preempts a thing");
    ok(told(feed(withNum("frame_preempt_ratio", 2), ["Dogs bite cats.", "Dogs bite.", "Cats bite."])) === "self | tell | man | + | - ; cat | bite | - | ? | -" &&
       told(feed(withNum("frame_preempt_ratio", 2), ["Dogs bite cats.", "Dogs bite."])) === said,
       "at frame_preempt_ratio 2, twice as many episodes without a thing make the verb lone, and fewer do not");
    const E = feed(fresh(), ["I emailed the man that the cat sleeps.", "The house that I live in is old."]);
    const gl = E.episodes.slice(-2).map(c => many(PG.parseBlock(c.rec.episode), "gap").join());
    ok(gl.join(" ; ") === "1 | 2 ; 1 | 1", "a gap no verb took, and a stranded preposition's, are the grammar's readings too", gl.join(" ; "));
    ok(D.malformed.length === 3 && PG.reread(D).changed.length === 0, "gap lines are well formed, and the sentences read back as written");
    const bad = PG.openStore(PG.serializeStore(D.st).replace("dog | + | -" + NL + "gap: 1 | 2", "dog | + | -" + NL + "gap: 1 | 3"));
    ok(bad.malformed.length === 4 && bad.usage.get("bite").frames.join() === "1,0,0,0", "a gap line past the sentence's percepts is malformed, and marks nothing");
    const old = PG.openStore(PG.serializeStore(D.st).split(NL).filter(l => !l.startsWith("gap:")).join(NL));
    const rr = PG.reread(old);
    ok(rr.changed.length === 1 && rr.changed[0].gap === "1 | 2" && rr.changed[0].now.join() === rr.changed[0].was.join(),
       "an episode with no gap line is offered one by a re-reading, with its percepts unchanged");
    PG.takeRereads(old, rr.grammar, T0 + 600);
    ok(PG.reread(old).changed.every(x => x.accepted) && old.usage.get("bite").frames.join() === "1,0,1,0", "taking it marks the gap");
    const seed = fresh();
    ok([...seed.vectors.values()].every(t => (PG.parseBlock(t.chunk.rec.term).frames || null) === (seed.usage.has(t.lemma) ? PG.termState(seed, t).block.split(NL).find(l => l.startsWith("frames: ")).slice(8) : null)),
       "every verb record in the seed store carries the frames its episodes give it");
  }

  // tense and hedges (TTG-RFC-0005 §3): a change in the owner's words is not a contradiction
  {
    const many = (o, k) => o[k] == null ? [] : [].concat(o[k]);
    const lastBlock = S => PG.parseBlock(S.episodes[S.episodes.length - 1].rec.episode);
    const X = fresh();
    let t = T0;
    PG.answer(X, "I liked tea.", t += 60);
    ok(many(lastBlock(X), "tense").join() === "1 | 1", "a percept said in the past is marked by a tense line");
    const now = PG.answer(X, "I do not like tea.", t += 60);
    const change = PG.say(X.G, "changed_tense", { then:"I liked tea.", ep:X.episodes[X.episodes.length - 2].rec.id, now:"I do not like tea.", ep_now:now.episode.id });
    ok(now.notes.includes(change) && !now.notes.includes(PG.say(X.G, "contradicts")), "the past, then its opposite in the present, is named as a change, not a contradiction", now.notes.join(" | "));
    const tea = X.trips.get("self|like|tea");
    ok(tea.pol === "-" && tea.decided && tea.sources.length === 2 && tea.fr === 0, "the present saying decides the belief; the past one is kept, and no longer counts");
    const q = PG.answer(X, "Do I like tea?", t += 60);
    ok(q.verdict === PG.say(X.G, "deny") && q.notes.includes(change), "a question answers from the present saying and names the change", q.verdict);
    PG.answer(X, "I liked jazz.", t += 60);
    const jazz = PG.answer(X, "I did not like jazz.", t += 60);
    ok(jazz.notes.includes(PG.say(X.G, "contradicts")) && X.trips.get("self|like|jazz").pol === "?", "two sayings in the past that disagree still contest");
    PG.answer(X, "I like rain.", t += 60);
    const rain = PG.answer(X, "I did not like rain.", t += 60);
    ok(rain.notes.includes(PG.say(X.G, "contradicts")) && X.trips.get("self|like|rain").pol === "?", "and so does a past saying after a present one: only the present retires the past");
    PG.answer(X, "I have moved to Spain.", t += 60);
    ok(!many(lastBlock(X), "tense").length, "the present perfect is not the past");
    PG.answer(X, "Pixel was sleeping.", t += 60);
    ok(many(lastBlock(X), "tense").join() === "1 | 1", "a past form of be makes its predicate past");
    const may = PG.answer(X, "Maybe cats bark.", t += 60), might = PG.answer(X, "I might like opera.", t += 60);
    ok(may.episode.held.map(pk).join() === "cat | bark | - | ? | -" && might.episode.held.map(pk).join() === "self | like | opera | ? | -" && !X.trips.has("self|like|opera"),
       "a hedge holds its clause: said, never believed");
    const aside = PG.answer(X, "(Maybe) cats purr.", t += 60);
    ok(aside.episode.percepts.map(pk).join() === "cat | purr | - | + | -", "and set aside, the hedge leaves a plain saying", aside.episode.percepts.map(pk).join());
    const es = PG.answer(X, "Me gustaba el té.", t += 60);
    ok(many(lastBlock(X), "tense").join() === "1 | 1" && es.lang === "es", "Spanish marks its past the same way");
    ok(X.malformed.length === 3, "tense lines are well formed");
    const bad = PG.openStore(PG.serializeStore(X.st).replace("I liked tea." + NL, "I liked tea." + NL).replace(/(self \| like \| tea \| \+ \| -\ntense: )1 \| 1/, "$11 | 9"));
    ok(bad.malformed.length === 4 && bad.trips.get("self|like|tea").pol === "?", "a tense line past the sentence's percepts is malformed, and marks nothing");
    const old = PG.openStore(PG.serializeStore(X.st).split(NL).filter(l => !l.startsWith("tense:")).join(NL));
    const rr = PG.reread(old);
    ok(old.trips.get("self|like|tea").pol === "?" && rr.changed.length >= 4 && rr.changed.every(x => x.tense && !x.tenseWas && x.now.join() === x.was.join()),
       "an episode with no tense line reads as before, and a re-reading offers the line with its percepts unchanged", rr.changed.length + "");
    PG.takeRereads(old, rr.grammar, t += 60);
    ok(old.trips.get("self|like|tea").pol === "-" && PG.reread(old).changed.every(x => x.accepted), "taking it lets the change be read as one");
    ok(PG.reread(fresh()).changed.length === 0, "the seed store says nothing in the past, and reads back as written");
  }

  // modifiers (TTG-RFC-0005 §3): dropped, as the store ships, or a subclass of the phrase's head
  {
    const SUBCLASS = STORE.replace(/^modifier: drop$/gm, "modifier: subclass");
    const told = (S, text) => PG.answer(S, text, T0 + 60 * (S.episodes.length + 1));
    const D = fresh();
    ok(told(D, "Black cats bite dogs.").episode.all.map(pk).join(" ; ") === "cat | bite | dog | + | -", "with modifier: drop, black cats are cats, as before");
    const M = PG.openStore(SUBCLASS);
    const b = told(M, "Black cats bite dogs.");
    ok(b.episode.all.map(pk).join(" ; ") === "black_cat | bite | dog | + | - ; black_cat | is_a | cat | + | - ; black_cat | has_property | black | + | -",
       "with modifier: subclass, the phrase is a subclass of its head, which the sentence is about", b.episode.all.map(pk).join(" ; "));
    ok(told(M, "Do cats bite dogs?").verdict === PG.say(M.G, "unknown"), "what black cats do, cats are not said to do");
    const bb = told(M, "Do black cats bite dogs?");
    ok(bb.verdict === PG.say(M.G, "affirm") && bb.items.length === 1, "a question about the subclass is answered by what was said of it, and checks only that", bb.verdict);
    ok(told(M, "Do black cats chase mice?").verdict === PG.say(M.G, "affirm_inferred"), "and inherits what was said of its head: cats chase mice");
    ok(told(M, "Black cats sleep.").episode.all.map(pk).join(" ; ") === "black_cat | sleep | - | + | -", "once the subclass is a term, the phrase finds it, and its is_a is not said again");
    const big = told(M, "The big old black cat sleeps.").episode.all.map(pk);
    ok(big.includes("big_old_black_cat | is_a | black_cat | + | -"), "a longer phrase is a subclass of the term its words already name", big.join(" ; "));
    const fake = told(M, "A fake gun is a toy.").episode.all.map(pk);
    ok(!fake.some(p => p.startsWith("fake_gun | is_a | gun")) && fake.includes("fake_gun | has_property | fake | + | -"), "a privative modifier makes no is_a: a fake gun is not a gun");
    const es = told(M, "Los gatos negros duermen.").episode.all.map(pk);
    ok(es.join(" ; ") === "gato_negro | dormir | - | + | - ; gato_negro | es_un | gato | + | - ; gato_negro | has_property | negro | + | -" ||
       es.includes("gato_negro | is_a | gato | + | -"), "Spanish joins the phrase head first: el gato negro is a gato_negro", es.join(" ; "));
    const capped = PG.openStore(SUBCLASS.replace(/^modifier_max_words: .*$/m, "modifier_max_words: 1"));
    ok(told(capped, "The big black dog sleeps.").episode.all.map(pk).join(" ; ") === "dog | sleep | - | + | -", "more modifiers than modifier_max_words: the phrase reads as before");
    ok(PG.reread(PG.openStore(SUBCLASS)).changed.length === 0 && M.malformed.length === 3, "the seed store has no modifiers, and reads back as written either way");
  }

  // questions whose verb stands before its subject, and a verb that names its own subject (TTG-RFC-0005 §3)
  {
    const Q = fresh();
    let t = T0;
    for (const s of ["Pixel duerme en el sol.", "Los gatos cazan ratones.", "Dudo que los gatos ladran.", "Los perros viven en casas."]) PG.answer(Q, s, t += 60);
    const ask = q => PG.answer(Q, q, t += 60), terms = r => r.items.map(i => i.term).join(" ");
    const donde = ask("¿Dónde duerme Pixel?");
    ok(donde.intent === "objectsOf" && terms(donde).split(" ").includes("sol"), "¿Dónde duerme Pixel? asks where, and is answered from Pixel duerme en el sol", terms(donde));
    ok(terms(ask("¿Dónde viven los perros?")) === "casa", "a plural subject behind its verb, too");
    const dudo = ask("¿Qué dudo?");
    ok(dudo.intent === "objectsOf" && dudo.notes.some(n => n.includes("gato ladrar")), "a verb in the speaker's own form already has its subject: ¿Qué dudo? meets what the stance holds", dudo.notes.join(" | "));
    ok(ask("¿Duerme Pixel en el sol?").verdict === "Sí.", "a yes/no question with its verb first reads as the statement it asks after");
    ok(ask("¿Cazan los gatos ratones?").verdict === "Sí.", "and its subject ends at its head, so what follows is the object");
    ok(ask("¿Qué cazan los gatos?").intent === "objectsOf" && ask("¿Qué caza ratones?").intent === "subjectsOf", "agreement still tells the object question from the subject one");
    ok(ask("Where does Pixel sleep?").items.map(i => i.term).includes("sun") && ask("Does Pixel sleep in the sun?").verdict === PG.say(Q.G, "affirm"),
       "English, question_order: subject_verb, reads as before");
    const flat = PG.openStore(STORE.replace(/^question_order: verb_subject$/m, "question_order: subject_verb"));
    PG.answer(flat, "Pixel duerme en el sol.", T0);
    ok(PG.answer(flat, "¿Duerme Pixel en el sol?", T0 + 60).verdict !== "Sí.", "without verb_subject, a verb-first question is not read that way");
  }

  // which verbs a relative's bare verb may follow is the store's word list, not the runtime's
  const noChain = PG.openStore(STORE.replace(/^chain: .*\n/gm, ""));
  ok(PG.shapeOf(noChain, "I like the man that saw the cat eat cheese.").percepts.map(pk).includes("man | eat | cheese | + | -"),
     "without the chain line, the bare verb closes the relative, as before");
  // re-reading: a grammar change is reported sentence by sentence, under its hash, and nothing is written
  const RR = fresh();
  const told = PG.answer(RR, "I like the man that saw the cat eat cheese.", T0);
  ok(PG.reread(RR).changed.length === 0 && PG.reread(RR).sentences === 21, "under the grammar it was written in, every sentence reads as written");
  const edited = PG.openStore(PG.serializeStore(RR.st).replace(/^chain: .*\n/gm, "")), text0 = PG.serializeStore(edited.st);
  const rr = PG.reread(edited);
  ok(rr.changed.length === 1 && rr.changed[0].episode === told.episode.id && rr.changed[0].n === 1 && !rr.changed[0].amended &&
     rr.changed[0].now.includes("1 | man | eat | cheese | + | -") && rr.changed[0].was.includes("1 | cat | eat | cheese | + | -"),
     "after a grammar edit, the one sentence it reads differently is reported with both readings", JSON.stringify(rr.changed.map(c => c.now)));
  ok(rr.grammar !== PG.reread(RR).grammar && /^[0-9a-f]{16}$/.test(rr.grammar), "each report names the grammar that read it", rr.grammar);
  ok(PG.serializeStore(edited.st) === text0, "a re-reading writes nothing");
  const unshaped = PG.openStore(PG.serializeStore(RR.st).replace(/^shape: .*\n/gm, ""));
  ok(PG.reread(unshaped).changed.length === 0, "an episode written before shapes is compared by its percepts alone");
  ok(PG.reread(edited, told.episode.id).changed.length === 1 && PG.reread(edited, "@LAT90LON1").changed.length === 0 && PG.reread(edited, "@LAT1LON1").sentences === 0,
     "a re-reading can be asked of one episode");

  // accepting a re-reading: an amendment that names the grammar it took the reading from
  ok(PG.amend(edited, told.episode.id, 1, rr.changed[0].reads, T0 + 60, "0123456789abcdef") === null, "a reading offered under another grammar is refused");
  const took = PG.amendReply(edited, told.episode.id, 1, rr.changed[0].reads, T0 + 60, rr.grammar);
  const back = PG.openStore(PG.serializeStore(edited.st));
  ok(took && PG.serializeStore(edited.st).includes("grammar: 1 | " + rr.grammar) && PG.readingsOf(back, told.episode.id)[0].grammar === rr.grammar,
     "the amendment carries a grammar line, and it reads back", rr.grammar);
  ok(back.trips.get("man|eat|cheese") && !back.trips.has("cat|eat|cheese") && PG.reread(back).changed[0].accepted && PG.reread(back).changed[0].amended,
     "the accepted reading stands in for the sentence, and the report says it was accepted");
  const own = PG.amend(back, told.episode.id, 1, "[i] {like} [the man] (that saw the cat eat cheese).", T0 + 120);
  ok(own && !PG.serializeStore(back.st).includes("grammar: 1 |") && !PG.reread(back).changed[0].accepted,
     "a reading the owner marks is the owner's own: no grammar line");

  // the gap is refused to a verb the owner's words never give a thing
  const G0 = fresh();
  ok(PG.shapeOf(G0, "The day that the cat ran was hot.").percepts.map(pk)[0] === "cat | run | day | + | -", "an unused verb before the sentence's own takes the gap");
  PG.answer(G0, "Pixel runs.", T0);
  ok(PG.shapeOf(G0, "The day that the cat ran was hot.").percepts.map(pk).join(" ; ") === "cat | run | - | ? | - ; day | has_property | hot | + | -",
     "once the owner has said it without a thing, it does not, and the clause is held");
  // a word straight after a relative's own verb that the owner also uses as a thing: what both readings share is said
  const L0 = fresh();
  ok(PG.shapeOf(L0, "Birds that sing love songs.").percepts.map(pk).join(" ; ") === "bird | sing | - | + | - ; bird | love | song | + | -", "unknown as a thing, the word is the clause's verb");
  PG.answer(L0, "Love is blind.", T0);
  ok(PG.shapeOf(L0, "Birds that sing love songs.").percepts.map(pk).join(" ; ") === "bird | sing | - | + | - ; bird | sing | song | ? | - | b ; bird | love | song | ? | - | a",
     "once the owner has used it as a thing, the singing is said, and each reading of the rest is held, named");
  ok(PG.shapeOf(L0, "Cats that hunt eat mice.").percepts.map(pk).join(" ; ") === "cat | hunt | - | + | - ; cat | eat | mouse | + | -", "a word that is only a verb is still the clause's");
  // the corpus changes readings too, and re-reading finds them: a verb the owner now gives a thing takes the gap
  const C0 = fresh(), bit = PG.answer(C0, "I told the man that the cat bit.", T0);
  PG.answer(C0, "Dogs bite postmen.", T0 + 60);
  const rc = PG.reread(C0, bit.episode.id).changed[0];
  ok(rc && rc.now.includes("1 | cat | bite | man | + | -") && rc.was.includes("1 | cat | bite | man | ? | - | b"),
     "once the owner has said the verb with a thing, re-reading offers the relative", rc ? rc.now.join(" ; ") : "");

  // what a verb takes is learned from every saying that stands, held as well as said, but not from one reading of two
  const B0 = fresh(), rule = () => PG.shapeOf(B0, "The rule that dogs bite is old.").percepts.map(pk).join(" ; ");
  ok(rule() === "dog | bite | rule | + | - ; rule | has_property | old | + | -", "a verb the owner has never used takes the gap where it is sure");
  PG.answer(B0, "I told the man that the cat bit.", T0);
  ok(!B0.usage.has("bite") && rule() === "dog | bite | rule | + | - ; rule | has_property | old | + | -", "a sentence read two ways teaches nothing about the verb");
  PG.answer(B0, "I doubt dogs bite.", T0 + 60);
  ok(B0.usage.get("bite").lone === 1 && rule() === "dog | bite | - | ? | - ; rule | has_property | old | + | -",
     "a held saying without a thing teaches that the verb takes none, so the clause is held", rule());
  // a chain verb the owner's own words show: its thing, then a bare verb that cannot be finite for that thing
  const K0 = fresh(), chains = S => S.chainSaid.get("en") || new Set(), spy = () => PG.shapeOf(K0, "I like the man that spied the cat eat cheese.").percepts.map(pk);
  PG.answer(K0, "I spied the cats eat fish.", T0);
  const liked = PG.answer(K0, "I like the man that spied the cat eat cheese.", T0 + 60).episode.id;
  ok(spy().includes("man | eat | cheese | + | -") && !chains(K0).has("spy"), "a saying whose bare verb could be finite for its thing (the cats eat) teaches nothing");
  PG.answer(K0, "The man that spied the cat eat cheese is tall.", T0 + 90);
  ok(!chains(K0).has("spy"), "nor does a relative's own chain, which the grammar reads by the chain it already knows");
  PG.answer(K0, "I spied the cat eat fish.", T0 + 120);
  ok(chains(K0).has("spy") && spy().includes("cat | eat | cheese | + | -") && !spy().includes("man | eat | cheese | + | -"),
     "one whose bare verb cannot be (the cat eat) makes the verb a chain verb, and a relative's bare verb stays with its thing", spy().join(" ; "));
  const kr = PG.reread(K0, liked).changed[0];
  ok(chains(PG.openStore(PG.serializeStore(K0.st))).has("spy") && kr && kr.was.includes("1 | man | eat | cheese | + | -") && kr.now.includes("1 | cat | eat | cheese | + | -"),
     "what is learned is read from the episodes again on opening, and re-reading offers what it changes");

  // the two readings of one saying are named, a and b, and the owner may say which was meant
  const W0 = fresh();
  PG.startEmpty(W0, T0);
  const men = PG.answer(W0, "The men that saw the cats eat cheese.", T0), pair = PG.say(W0.G, "reading_pair", { a:"cat eat cheese", b:"man eat cheese" });
  ok(PG.serializeStore(W0.st).includes("percept: 1 | cat | eat | cheese | ? | - | a\npercept: 1 | man | eat | cheese | ? | - | b") && W0.malformed.length === 3,
     "each reading's percepts carry its letter, and are well formed");
  ok(men.notes.includes(PG.say(W0.G, "noted_readings", { readings:pair })) && !men.notes.includes(PG.say(W0.G, "noted_held", { triples:"cat eat cheese; man eat cheese" })),
     "the reply names them as two readings of one saying, not as a choice or a stance", men.notes.join(" | "));
  const asked = PG.say(W0.G, "asked_readings", { text:"The men that saw the cats eat cheese.", ep:men.episode.id, readings:pair });
  const q1 = PG.answer(W0, "Do men eat cheese?", T0 + 60), q2 = PG.answer(W0, "What eats cheese?", T0 + 90);
  ok(q1.verdict === PG.say(W0.G, "unknown") && q1.notes.includes(asked) && q2.notes.filter(n => n === asked).length === 1,
     "a question sees one saying with two readings, believes neither, and names the saying once", q1.notes.join(" | "));
  const doubt = PG.answer(W0, "I doubt dogs bark.", T0 + 100).episode.id, q3 = PG.answer(W0, "Do dogs bark?", T0 + 110);
  ok(q3.verdict === PG.say(W0.G, "unknown") && q3.notes.includes(PG.say(W0.G, "asked_held", { text:"I doubt dogs bark.", ep:doubt })),
     "and any other held saying it meets is named as said, not as fact", q3.notes.join(" | "));
  ok(PG.shapeOf(W0, "The men that saw the cats eat cheese.", "a").percepts.map(pk).join(" ; ") === "man | see | cat | + | - ; cat | eat | cheese | + | -" &&
     PG.shapeOf(W0, "I told the man that the cat bit.", "b").percepts.map(pk).join(" ; ") === "self | tell | man | + | - ; cat | bite | man | + | -" &&
     PG.shapeOf(W0, "I told the man that the cat bit.", "a").percepts.map(pk).join(" ; ") === "self | tell | man | + | - ; cat | bite | - | ? | -",
     "a chosen reading is read alone, as the grammar would read it: said, or held for reasons of its own");
  const picked = PG.amendReply(W0, men.episode.id, 1, "[the men] that {saw} [the cats] {eat} [cheese].", T0 + 120, null, "b");
  const W1 = PG.openStore(PG.serializeStore(W0.st));
  ok(picked && PG.serializeStore(W0.st).includes("shape: 1 | [the men] that {saw} [the cats] {eat} [cheese].\nreading: 1 | b\npercept: 1 | man | see | cat | + | -\npercept: 1 | man | eat | cheese | + | -") &&
     PG.readingsOf(W1, men.episode.id)[0].reading === "b" && PG.verify(W1, "man", "eat", "cheese").verdict === "Y" && !W1.trips.has("cat|eat|cheese"),
     "the owner says which was meant: an amendment with a reading line, and that reading is said");
  ok(PG.reread(W1, men.episode.id).changed.every(c => c.amended && c.accepted), "re-read, the owner's choice is kept, so nothing is offered");

  // a re-reading's context is the sentences before it as they stand; taking them all re-reads each after the ones before it
  const IC = fresh(), ic = PG.answer(IC, "The ice cream melted. It was sweet.", T0).episode.id;
  PG.answer(IC, "I like ice_cream.", T0 + 60);
  const r1 = PG.reread(IC, ic);
  ok(r1.changed.map(c => c.n).join() === "1" && r1.changed[0].now.join() === "1 | ice_cream | melt | - | + | -",
     "while the first sentence stands as written, the second reads as written: only the first is offered", JSON.stringify(r1.changed.map(c => c.now)));
  ok(PG.takeRereads(IC, "0123456789abcdef", T0 + 90) === null, "taking them under another grammar's hash is refused");
  const tk = PG.takeRereads(IC, r1.grammar, T0 + 120);
  ok(tk.took.map(c => c.now.join()).join(" ; ") === "1 | ice_cream | melt | - | + | - ; 2 | ice_cream | has_property | sweet | + | -" && !PG.reread(IC).changed.some(c => !c.accepted),
     "taking them all reads each again after the ones before it: the pronoun follows the reading just taken", tk.took.map(c => c.now.join()).join(" ; "));
  const IC2 = fresh(), ic2 = PG.answer(IC2, "The ice cream melted. It was sweet.", T0).episode.id;
  PG.answer(IC2, "I like ice_cream.", T0 + 60);
  PG.amend(IC2, ic2, 1, "(the ice cream) {melted}.", T0 + 90);
  const o2 = PG.reread(IC2, ic2).changed.find(c => c.n === 2), w2 = o2 && PG.amend(IC2, ic2, 2, o2.reads, T0 + 120, PG.reread(IC2).grammar);
  ok(o2 && w2 && w2.all.map(p => "2 | " + pk(p)).join() === o2.now.join() && o2.now.join() === "2 | - | has_property | sweet | + | -",
     "after the owner's own reading of the sentence before it, what is offered is what taking it writes", o2 ? o2.now.join() : "");
  const tk2 = PG.takeRereads(IC2, PG.reread(IC2).grammar, T0 + 150);
  ok(tk2 && tk2.took.length === 0 && tk2.kept.map(c => c.n).join() === "1,2", "taking them all keeps what the owner has ruled on");

  // a hedge meant as fact: mark it an aside, and what it held is said
  const U = fresh(), bark = () => (U.trips.get("cat|bark|-") || { fr:0 }).fr;
  const hedge = PG.answer(U, "I think cats bark.", T0), b0 = bark();
  ok(hedge.episode.held.map(pk).join() === "cat | bark | - | ? | -", "said plainly, a stance's clause is held");
  const un = PG.amendReply(U, hedge.episode.id, 1, "(i think) [cats] {bark}.", T0 + 60);
  ok(un && bark() === b0 + 1 && !un.episode.held.length && un.items[0].quotes[0].text === "I think cats bark.",
     "amended with the stance as an aside, the clause is believed, quoted as the owner said it");
  const typed = PG.answer(U, "Pixel (my old cat) purrs.", T0 + 120);
  ok(U.said.get(typed.episode.id).get(1) === "Pixel (my old cat) purrs." &&
     PG.serializeStore(U.st).includes("shape: 1 | [pixel] (my old cat) {purrs}."), "typed parentheses are an aside, and stay in the said line");
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

section("a collision steps north-east (TTDB-RFC-0004 §3, TTG-RFC-0002 §6)");
{
  // Block a term's first-choice spot with a record of our own, then place the term again.
  const block = (S, id) => PG.openStore(PG.serializeStore(S.st) + NL + "---" + NL + NL + id + " | created:" + T0 + " | updated:" + T0 + NL + NL + "blocker" + NL);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const S = fresh(), sp = S.G.sphere, step = +sp.step;
  const [latLo, latHi] = sp.term_lat.split(/\s+/).map(Number);
  const first = PG.placeTerm(S, "zorblat", "thing");
  const S2 = block(S, first.id);
  ok(PG.records(S2.st).some(r => r.id === first.id), "the blocking record is in the store", first.id);
  const moved = PG.placeTerm(S2, "zorblat", "thing");
  ok(near(moved.lat, first.lat + step) && near(moved.lon, first.lon + step),
     "a taken ID moves one step up in latitude and one up in longitude", first.id + " -> " + moved.id);
  // at the top of the band, latitude wraps to the bottom rather than leaving it
  let lemma = null, top = null;
  for (let i = 0; i < 200000 && !top; i++){
    const p = PG.placeTerm(S, "w" + i, "thing");
    if (near(p.lat, latHi)) { lemma = "w" + i; top = p; }
  }
  ok(!!top, "some lemma's first choice sits at the top of term_lat", lemma);
  if (top){
    const w = PG.placeTerm(block(S, top.id), lemma, "thing");
    ok(near(w.lat, latLo) && near(w.lon, top.lon + step), "and stepping past term_lat's top wraps to its bottom", top.id + " -> " + w.id);
  }
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
  ok(recs.filter(r => r.lon === 0 && r.lat > -90 && r.lat < 90).length === 19, "home, nine blueprint and nine grammar records kept");
  ok(recs.some(r => r.id === "@LAT99LON1") && recs.some(r => r.lat === 98) && recs.some(r => r.lat === -90), "lanes 98, 99 and the special record kept");
  ok(recs.filter(r => r.lon === 180 && r.grammar != null).length === 7 && S.grammars.length === 2, "the second language on the antimeridian kept");
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
  ok(S.G.rules.length === 6 && S.G.ruleErrors.length === 0 && S.grammars[1].rules.length === 6, "six seed rules load, none rejected, and the Spanish grammar borrows them");

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
  ok(cyc.G.rules.length === 10 && cyc.derived.size > 0 && cyc.derived.size <= bound, "rules written to cycle still reach a fixpoint within the bound", cyc.derived.size + " ≤ " + bound);

  const bad = overlay(["rule: chase X Y => eat X Z | unsafe", "rule: chase X Y, chase Y Z, chase Z W, chase W V => chase X V | long",
                       "rule: chase X Y => with X Y | protected", "rule: chase X Y | no arrow"]);
  ok(bad.G.rules.length === 6 && bad.G.ruleErrors.map(e => e.why).join() === "unsafe,length,protected,shape", "unsafe, over-long, protected and malformed rules are rejected and reported",
     bad.G.ruleErrors.map(e => e.why).join());
}

section("constructions: a shape that says what its words do not (TTG-RFC-0006)");
{
  const LINE = "construction: [X] {V} [Y] off [Z] => go_off Y Z | caused motion | is_a acting on a thing" + NL;
  ok(STORE.includes(LINE), "the seed store declares the caused-motion construction");
  const BARE = STORE.replace(LINE, "");
  const keys = ps => ps.map(pk).join(" / ");
  const S = fresh();
  ok(S.G.constructions.length === 7 && S.G.constructionErrors.length === 0 && S.grammars[1].constructions.length === 2 &&
     !S.grammars[1].constructions.some(c => S.G.constructions.some(e => e.label === c.label)),
     "seven English constructions load, none rejected, and Spanish has its own two, borrowing none: constructions hold words");

  const told = PG.answer(S, "Pixel sneezed the napkin off the table.", T0 + 60);
  const ps = told.episode.all;
  ok(ps.some(p => pk(p) === "pixel | sneeze | napkin | + | -") && ps.some(p => pk(p) === "napkin | go_off | table | + | -") && ps.length === 2,
     "Pixel sneezed the napkin off the table says the sneeze and the napkin going off the table, and nothing else", keys(ps));
  ok(told.notes.some(n => n.includes("caused motion")), "the reply names the construction that read it", told.notes.join(" | "));
  const where = PG.answer(S, "Where did the napkin go?", T0 + 120);
  ok(where.items.map(i => i.term).includes("table"), "Where did the napkin go? answers from it", where.items.map(i => i.term).join(" "));
  ok(PG.answer(S, "Did Pixel sneeze the napkin?", T0 + 180).verdict === PG.say(S.G, "affirm"), "and the verb's own percept is believed as any is");

  const read = (st, s) => PG.shapeOf(PG.openStore(st), s);
  const neg = read(STORE, "The cats didn't knock the cups off the shelf.").percepts;
  ok(neg.length === 3 && neg.some(p => p.v === "go_off") && neg.every(p => p.pol === "-"),
     "the verb's denial carries to every atom", keys(neg));
  ok(read(STORE, "Maybe Pixel sneezed the napkin off the table.").percepts.every(p => p.pol === "?"), "a hedged clause holds what the construction says");
  const T1 = fresh(), past = PG.answer(T1, "Pixel sneezed the napkin off the table.", T0 + 60).episode;
  ok(/^tense: 1 \| 1 2$/m.test(PG.records(T1.st).find(r => r.id === past.id).episode), "a past verb marks every atom past");
  const marked = read(STORE, "[Pixel] {sneezed} [the napkin off the table].");
  ok(!marked.percepts.some(p => p.v === "go_off") && !marked.constructions.length, "the owner's marks overrule a construction, as they do the chain", keys(marked.percepts));
  ok(read(STORE, "The napkin that Pixel sneezed off the table is wet.").percepts.some(p => p.v === "go_off" && p.s === "napkin" && p.o === "table"),
     "a shape that is only part of its clause, a relative, reads it (TTG-RFC-0006 §3)");

  // a sentence no construction matches reads exactly as it did without any
  const plain = ["Cats chase mice.", "Pixel sleeps in the sun.", "I doubt that cats like fish.", "The dog that the cat bit ran.", "Birds that sing love songs fly.",
                 "Pixel pushed the napkin into the bowl.", "Los gatos cazan ratones.", "Pixel sneezed."];
  ok(plain.every(s => keys(read(STORE, s).percepts) === keys(read(BARE, s).percepts)), "a sentence matching no construction reads as it does without one");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same with the construction as without it");

  // the most specific shape wins; ties go to the one written first
  const more = STORE.replace(LINE, LINE + "construction: [X] knocked [Y] off [Z] => knock X Y, fall_off Y Z | knocked off" + NL +
                                    "construction: [X] {V} [Y] off [Z] => V X Y, leave Y Z | written second" + NL);
  ok(read(more, "Pixel knocked the cup off the shelf.").percepts.some(p => p.v === "fall_off") && read(more, "Pixel sneezed the napkin off the table.").percepts.some(p => p.v === "go_off"),
     "a shape with more words of its own wins, and of two alike the first written does");

  // safety, as for rules: each rejected and reported
  const bad = PG.openStore(STORE.replace(LINE, LINE + ["construction: [X] {V} [Y] off [Z] => V X W | unsafe", "construction: [X] {V} [Y] => X Y Y | wrong kind",
    "construction: [X] {V} [Y] a b c d e f => V X Y | long", "construction: [X] {V} [Y] off [Z] => with Y Z | protected", "construction: [X] {V} [Y] off [Z] | no arrow",
    "construction: off the => go_off X Y | no names"].join(NL) + NL));
  ok(bad.G.constructions.length === 7 && bad.G.constructionErrors.map(e => e.why).join() === "unsafe,unsafe,length,protected,shape,shape",
     "unsafe, over-long, protected and malformed constructions are rejected and reported", bad.G.constructionErrors.map(e => e.why).join());

  // adding a construction makes old sentences read differently: re-reading lists exactly those
  const S0 = PG.openStore(BARE);
  PG.answer(S0, "Pixel sneezed the napkin off the table.", T0 + 60);
  PG.answer(S0, "Pixel sleeps on the sofa.", T0 + 120);
  ok(PG.reread(S0).changed.length === 0, "without the construction, nothing to re-read");
  const S1 = PG.openStore(PG.serializeStore(S0.st).replace("kind: constructions" + NL, "kind: constructions" + NL + LINE));
  const ch = PG.reread(S1).changed;
  ok(ch.length === 1 && ch[0].text.startsWith("Pixel sneezed") && ch[0].now.some(l => l.includes("go_off")), "with it, re-read lists exactly the sentence that changed",
     ch.map(c => c.text).join(" / "));
}

section("constructions inherit: the specific says what the general does, and overrides it (TTG-RFC-0006 §8)");
{
  const LINE = "construction: [X] {V} [Y] off [Z] => go_off Y Z | caused motion | is_a acting on a thing" + NL;
  const CHILD = "construction: [X] {V} [Y] off [Z] onto [W] => | caused motion onto | is_a caused motion | is_a motion onto" + NL;
  ok(STORE.includes(CHILD), "the seed store declares a construction that inherits from caused motion and motion onto");
  const S = fresh(), cs = S.G.constructions, child = cs.find(c => c.label === "caused motion onto");
  ok(child && child.parents.join() === "caused motion,motion onto,acting on a thing" && ["caused motion", "motion onto"].every(l => cs.indexOf(child) < cs.findIndex(c => c.label === l)),
     "the child knows its ancestors and is tried before them", child && child.parents.join());
  const told = PG.answer(S, "Pixel knocked the cup off the shelf onto the floor.", T0 + 60);
  ok(told.episode.all.map(pk).join(" / ") === "pixel | knock | cup | + | - / cup | go_off | shelf | + | - / cup | go_onto | floor | + | -",
     "it says what its parent says, then its own", told.episode.all.map(pk).join(" / "));
  ok(told.notes.some(n => n.includes("caused motion onto, a kind of caused motion, motion onto")), "the reply names it and what it is a kind of", told.notes.join(" | "));
  ok(PG.answer(S, "Where did the cup go?", T0 + 120).items.map(i => i.term).join(" ") === "shelf floor", "and Where did the cup go? finds both places");
  ok(!PG.shapeOf(PG.openStore(STORE), "Pixel knocked the cup off the shelf.").percepts.some(p => p.v === "go_onto"), "a clause only the parent covers is the parent's");

  const read = (lines, s) => PG.shapeOf(PG.openStore(STORE.replace(LINE, LINE + lines.join(NL) + NL)), s);
  // its own atom about the same vector and things overrides the inherited one: a not_ atom denies it
  const almost = read(["construction: [X] {V} [Y] almost off [Z] => not_go_off Y Z | almost off | is_a caused motion"], "Pixel pushed the cup almost off the shelf.").percepts;
  ok(almost.map(pk).join(" / ") === "pixel | push | cup | + | - / cup | go_off | shelf | - | -", "an atom of the child's own overrides its parent's: almost off is not off", almost.map(pk).join(" / "));
  const denied = read(["construction: [X] {V} [Y] almost off [Z] => not_go_off Y Z | almost off | is_a caused motion"], "Pixel didn't push the cup almost off the shelf.").percepts;
  ok(denied.find(p => p.v === "go_off").pol === "?-" && denied.find(p => p.v === "push").pol === "-", "a clause that denies a denial says neither way: the denial is held, the verb denied");
  // a grandchild says all three
  const twice = PG.openStore(STORE.replace(CHILD, CHILD + "construction: [X] {V} [Y] off [Z] onto [W] twice => again Y W | twice | is_a caused motion onto" + NL));
  const tw = twice.G.constructions.find(c => c.label === "twice");
  ok(tw && tw.parents.join(", ") === "caused motion onto, caused motion, motion onto, acting on a thing" && PG.shapeOf(twice, "Pixel knocked the cup off the shelf onto the floor twice.").percepts.length === 4,
     "inheritance goes up the chain: a grandchild says all its ancestors do");
  // a child is tried before its parent even with fewer words of its own
  const few = PG.openStore(STORE.replace(LINE, "construction: [X] {V} [Y] [Z] => V X Y | bare | is_a two off" + NL + LINE + "construction: [X] {V} [Y] off off [Z] => V X Y | two off" + NL));
  const fl = few.G.constructions.map(c => c.label);
  ok(fl.indexOf("bare") >= 0 && fl.indexOf("bare") < fl.indexOf("two off"), "a construction comes before its ancestors whatever its own words", fl.join(", "));
  // rejected, each with its reason
  const bad = PG.openStore(STORE.replace(LINE, LINE + [
    "construction: [X] {V} [Y] up [Z] => go_up Y Z | up | is_a nowhere",
    "construction: [X] {V} [Y] in [Z] => go_in Y Z | in a | is_a in b",
    "construction: [X] {V} [Y] at [Z] => go_at Y Z | in b | is_a in a",
    "construction: [X] {V} [Y] by [Z] => go_by Y Z | under up | is_a up",
    "construction: [X] knocked [Y] off [Z] => fall_off Y Z | knocking off | is_a caused motion",
    "construction: [X] {V} [Y] over [Z] => go_over Y Z | over | not a parent"].join(NL) + NL));
  ok(bad.G.constructionErrors.map(e => e.why).join() === "parent,cycle,cycle,parent,unsafe,shape",
     "a missing parent, a cycle, a rejected parent, inherited names the shape doesn't bind, and a stray part are rejected", bad.G.constructionErrors.map(e => e.why).join());
  ok(bad.G.constructions.length === 7, "and the rest still load");
}

section("constructions with several parents: what they share is said once, what they dispute is held (TTG-RFC-0006 §8)");
{
  const LINE = "construction: [X] {V} [Y] off [Z] => go_off Y Z | caused motion | is_a acting on a thing" + NL;
  const S = fresh();
  const told = PG.answer(S, "Pixel knocked the cup off the shelf onto the floor.", T0 + 60);
  ok(told.episode.all.filter(p => p.v === "knock").length === 1 && told.episode.all.length === 3,
     "a child of two parents that both say the verb's own percept says it once", told.episode.all.map(pk).join(" / "));
  ok(PG.shapeOf(PG.openStore(STORE), "Pixel pushed the cup onto the table.").percepts.map(pk).join(" / ") === "pixel | push | cup | + | - / cup | go_onto | table | + | -",
     "each parent still reads the clauses it alone covers");

  const PARENTS = ["construction: [X] {V} [Y] past [Z] => V X Y, go_past Y Z | passing",
                   "construction: [X] {V} [Y] short of [Z] => V X Y, not_go_past Y Z | stopping short"];
  const open = lines => PG.openStore(STORE.replace(LINE, LINE + PARENTS.concat(lines).join(NL) + NL));
  const dispute = open(["construction: [X] {V} [Y] nearly past [Z] => | nearly past | is_a passing | is_a stopping short"]);
  const np = dispute.G.constructions.find(c => c.label === "nearly past");
  const ps = PG.shapeOf(dispute, "Pixel pushed the cup nearly past the bowl.").percepts;
  ok(np && np.contested && ps.map(pk).join(" / ") === "pixel | push | cup | + | - / cup | go_past | bowl | ? | -",
     "where parents disagree and the child does not say, the atom is held: said neither way", ps.map(pk).join(" / "));
  const r = PG.answer(dispute, "Pixel pushed the cup nearly past the bowl.", T0 + 60);
  ok(r.notes.some(n => n.includes("passing, stopping short disagree") && n.includes("nearly past")) && !r.notes.some(n => n.includes(PG.say(dispute.G, "noted_held").split("{")[0])),
     "and the reply says which parents disagree, not that the owner said it as a choice", r.notes.join(" | "));
  const settled = open(["construction: [X] {V} [Y] nearly past [Z] => not_go_past Y Z | nearly past | is_a passing | is_a stopping short"]);
  ok(PG.shapeOf(settled, "Pixel pushed the cup nearly past the bowl.").percepts.find(p => p.v === "go_past").pol === "-" && !settled.G.constructions.find(c => c.label === "nearly past").contested,
     "a child that says the disputed atom itself settles it");

  const bad = open(["construction: [X] {V} [Y] near [Z] => | twice named | is_a passing | is_a passing",
                    "construction: [X] {V} [Y] by [Z] => | half there | is_a passing | is_a nowhere",
                    "construction: [X] {V} [Y] from [Z] => go_from Y Z | loop a | is_a passing | is_a loop b",
                    "construction: [X] {V} [Y] to [Z] => go_to Y Z | loop b | is_a loop a",
                    "construction: [X] {V} [Y] at [Z] => | nothing | "]);
  ok(bad.G.constructionErrors.map(e => e.why).join() === "shape,parent,cycle,cycle,shape",
     "a parent named twice, one parent missing of two, a cycle through a second parent, and an empty construction with no parent are rejected", bad.G.constructionErrors.map(e => e.why).join());
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes still read the same");
}

section("abstract constructions: no shape, never matched, only inherited (TTG-RFC-0006 §8)");
{
  const ROOT = "construction: => V X Y | acting on a thing" + NL;
  ok(STORE.includes(ROOT), "the seed store declares an abstract construction at the root of its motions");
  const S = fresh(), root = S.G.constructions.find(c => c.label === "acting on a thing");
  ok(root && root.abstract && S.G.constructions.filter(c => c.abstract).length === 1, "it loads, and is the only abstract one");
  ok(PG.shapeOf(PG.openStore(STORE), "Pixel chased the dog.").percepts.map(pk).join(" / ") === PG.shapeOf(PG.openStore(STORE.replace(ROOT, "")), "Pixel chased the dog.").percepts.map(pk).join(" / ") &&
     !PG.shapeOf(PG.openStore(STORE), "Pixel chased the dog.").constructions.length, "it is never matched: X V Y reads by its words, as without it");
  const sneeze = PG.shapeOf(PG.openStore(STORE), "Pixel sneezed the napkin off the table.");
  ok(sneeze.percepts.map(pk).join(" / ") === "pixel | sneeze | napkin | + | - / napkin | go_off | table | + | -" && sneeze.constructions[0].parents.join() === "acting on a thing",
     "a child takes the verb's own percept from it, then its own", sneeze.percepts.map(pk).join(" / "));
  const onto = PG.shapeOf(PG.openStore(STORE), "Pixel knocked the cup off the shelf onto the floor.").percepts;
  ok(onto.filter(p => p.v === "knock").length === 1 && onto.length === 3, "and a diamond through it says that percept once");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");

  const open = lines => PG.openStore(STORE.replace(ROOT, ROOT + lines.join(NL) + NL));
  // an abstract child of an abstract parent: its names are the kinds all its atoms use them as
  const deep = open(["construction: => go Y Z | going somewhere | is_a acting on a thing",
                     "construction: [X] {V} [Y] toward [Z] => | heading | is_a going somewhere"]);
  ok(deep.G.constructions.find(c => c.label === "going somewhere").abstract &&
     PG.shapeOf(deep, "Pixel pushed the cup toward the door.").percepts.map(pk).join(" / ") === "pixel | push | cup | + | - / cup | go | door | + | -",
     "abstract constructions inherit from each other, and a shaped child of both says them all");
  const bad = open(["construction: => X V Y | mixed",                            // X is a vector here and nothing else: fine as kinds go
                    "construction: => V X Y, go V Y | both ways",               // V as a vector and as a subject
                    "construction: => go X Y | half | is_a acting on a thing, ",
                    "construction: => go Y Z | as thing | is_a acting on a thing",
                    "construction: => | empty",
                    "construction: [Q] {V} [Y] => | needs X | is_a acting on a thing"]);
  ok(bad.G.constructionErrors.map(e => e.why).join() === "unsafe,parent,shape,unsafe",
     "a name used as two kinds, an undeclared parent, an empty abstract construction, and a shaped child not binding an inherited name are rejected", bad.G.constructionErrors.map(e => e.why).join());
}

section("a verbish name tied to its verbs, by lemma (TTG-RFC-0006 §2)");
{
  const TIED = "construction: [X] {V=knock} [Y] off [Z] => fall_off Y Z | knocking off | is_a caused motion" + NL;
  ok(STORE.includes(TIED), "the seed store ties knocking off to the verb knock");
  const st = PG.openStore(STORE), read = s => PG.shapeOf(st, s);
  const keys = r => r.percepts.map(pk).join(" / ");
  const knocked = read("Pixel knocked the cup off the shelf.");
  ok(keys(knocked) === "pixel | knock | cup | + | - / cup | go_off | shelf | + | - / cup | fall_off | shelf | + | -" && knocked.constructions[0].label === "knocking off",
     "a tied verb inherits V X Y, so the child of a literal verb can: a knock, the cup going off, and falling off", keys(knocked));
  ok(["Pixel knocks the cup off the shelf.", "The cats are knocking the cups off the shelf."].every(s => read(s).percepts.some(p => p.v === "fall_off")),
     "the tie is by lemma: knocks and knocking are knock too");
  const pushed = read("Pixel pushed the cup off the shelf.");
  ok(!pushed.percepts.some(p => p.v === "fall_off") && pushed.constructions[0].label === "caused motion", "another verb is not tied, and its parent reads it", keys(pushed));
  ok(st.G.constructions.findIndex(c => c.label === "knocking off") < st.G.constructions.findIndex(c => c.label === "caused motion") &&
     st.G.constructions.find(c => c.label === "knocking off").own === 2, "the tie counts as a word of its own");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");

  const open = lines => PG.openStore(STORE.replace(TIED, TIED + lines.join(NL) + NL));
  const two = open(["construction: [X] {V=push,pull} [Y] over [Z] => go_over Y Z | pushing over"]);
  ok(["Pixel pushed the cup over the edge.", "Pixel pulled the cup over the edge."].every(s => PG.shapeOf(two, s).percepts.some(p => p.v === "go_over")) &&
     !PG.shapeOf(two, "Pixel kicked the cup over the edge.").percepts.some(p => p.v === "go_over"), "a tie may name several verbs, and binds only those");
  const bad = open(["construction: [X] {V=} [Y] up [Z] => go_up Y Z | an empty tie",
                    "construction: [X] {v=knock} [Y] up [Z] => go_up Y Z | a lowercase name"]);
  ok(bad.G.constructionErrors.map(e => e.why).join() === "shape,shape", "an empty tie and an uncapitalised tied name are malformed",
     bad.G.constructionErrors.map(e => e.why).join());
}

section("a nounish name tied to its things, by lemma (TTG-RFC-0006 §2)");
{
  const IDIOM = "construction: [X] {V=take} [Y=day,week,afternoon,morning] off => rest X Y | taking time off" + NL;
  ok(STORE.includes(IDIOM), "the seed store declares an idiom with a tied verb and a tied thing");
  const st = PG.openStore(STORE), read = s => PG.shapeOf(st, s), keys = r => r.percepts.map(pk).join(" / ");
  const day = read("I took the day off.");
  ok(keys(day) === "self | rest | day | + | -" && day.constructions[0].label === "taking time off", "I took the day off is a rest, not a taking", keys(day));
  ok(keys(read("Pixel took two weeks off.")) === "pixel | rest | week | + | -", "the tie is by lemma: weeks is week");
  ok(!read("I took the cup off.").constructions.length, "a thing the tie does not name reads by its words", keys(read("I took the cup off.")));
  ok(keys(read("I didn't take the afternoon off.")) === "self | rest | afternoon | - | -", "and a denied idiom is denied");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");

  // with modifier: subclass, a subclass a phrase made is its head's thing; a privative one is not
  const CM = "construction: [X] {V} [Y] off [Z] => go_off Y Z | caused motion | is_a acting on a thing" + NL;
  const sub = PG.openStore(STORE.replace(/^modifier: drop$/m, "modifier: subclass").replace(CM, CM + "construction: [X=cat] {V} [Y] off [Z] => tip_off X Y | a cat tipping | is_a caused motion" + NL));
  const black = PG.shapeOf(sub, "The black cat pushed the cup off the shelf.");
  ok(black.constructions[0] && black.constructions[0].label === "a cat tipping" && black.percepts.some(p => p.s === "black_cat" && p.v === "tip_off"),
     "under modifier: subclass a black cat is a cat to a tie", keys(black));
  const toy = PG.shapeOf(sub, "The toy cat pushed the cup off the shelf.");
  ok(toy.constructions[0] && toy.constructions[0].label === "caused motion", "and a toy cat is not", keys(toy));
  ok(black.percepts.some(p => pk(p) === "black_cat | is_a | cat | + | -") && black.percepts.some(p => pk(p) === "black_cat | has_property | black | + | -") &&
     !toy.percepts.some(p => p.s === "toy_cat" && p.v === "is_a"), "and a clause a construction read says the subclass its phrase made, as the chain does");
  ok(PG.shapeOf(sub, "The dog pushed the cup off the shelf.").constructions[0].label === "caused motion", "another thing falls to the parent");
}

section("a Spanish construction: de is off only after a verb that moves a thing (TTG-RFC-0006 §5)");
{
  const st = PG.openStore(STORE), read = s => PG.shapeOf(st, s), keys = r => r.percepts.map(pk).join(" / ");
  const es = st.grammars.find(G => G.lang === "es");
  ok(es.constructions.map(c => c.label).join() === "movimiento causado,actuar sobre algo" && es.constructions[1].abstract,
     "Spanish declares caused motion and its own abstract root");
  const tiro = read("Pixel tiró el vaso de la mesa.");
  ok(tiro.lang === "es" && keys(tiro) === "pixel | tirar | vaso | + | - / vaso | salir_de | mesa | + | -" && tiro.constructions[0].parents.join() === "actuar sobre algo",
     "Pixel tiró el vaso de la mesa is a throw, and the glass leaving the table", keys(tiro));
  ok(keys(read("Pixel vio el vaso de la mesa.")) === "pixel | ver | vaso | + | - / vaso | with | mesa | + | -", "after vio, de is of: the table's glass, read by its words");
  ok(read("Pixel empujó el vaso del estante.").percepts.some(p => p.v === "salir_de" && p.o === "estante"), "del is de el, so the shape still matches");
  ok(keys(read("Tiré el vaso de la mesa.")) === "self | tirar | vaso | + | - / vaso | salir_de | mesa | + | -", "the speaker's own form needs no subject");
  ok(read("Pixel no tiró el vaso de la mesa.").percepts.every(p => p.pol === "-"), "a denial carries");
  ok(!read("Tiró el vaso de la mesa.").constructions.length, "but a dropped subject that is not the speaker's is no one's, and the shape does not read it");
  const told = PG.answer(st, "Pixel tiró el vaso de la mesa.", T0 + 60);
  ok(told.notes.some(n => n.includes("movimiento causado, una clase de actuar sobre algo")), "the reply is in Spanish and names it", told.notes.join(" | "));
  ok(!PG.shapeOf(st, "Pixel knocked the cup off the shelf.").constructions.some(c => es.constructions.includes(c)), "and English sentences never meet a Spanish construction");
  // the Spanish past, which the tie depends on
  ok(["tiró", "tiraron", "tiraba", "tiraban", "tiré"].every(w => PG.shapeOf(st, "Los gatos " + w + " los vasos.").percepts.some(p => p.v === "tirar")) &&
     keys(read("Los gatos cazaron ratones.")) === "gato | cazar | ratón | + | -", "the morphology reads the Spanish past: tiró, tiraron, tiraba, cazaron");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("questions a construction reads: the gap is what is asked, every atom narrows it (TTG-RFC-0006 §7)");
{
  const S = fresh();
  let t = T0;
  for (const s of ["Pixel sneezed the napkin off the table.", "Pixel sneezed the cap.", "The dog dropped the bone off the table.",
                   "Pixel knocked the cup off the shelf.", "Pixel tiró el vaso de la mesa.", "Pixel tiró la pelota."]) PG.answer(S, s, t += 60);
  const ask = q => PG.answer(S, q, t += 60), terms = r => r.items.map(i => i.term).join(" ");
  const q1 = PG.interpret(S, "What did Pixel sneeze off the table?");
  ok(q1.construction && q1.construction.label === "caused motion" && q1.also.length === 1, "What did Pixel sneeze off the table? is read by caused motion, with the slot where its shape has nothing");
  ok(terms(ask("What did Pixel sneeze off the table?")) === "napkin",
     "and is answered by what answers every atom: sneezed by Pixel and gone off the table, so not the cap, nor the dog's bone", terms(ask("What did Pixel sneeze off the table?")));
  ok(terms(ask("What sneezed the napkin off the table?")) === "pixel", "a subject question: the gap is the shape's first name");
  ok(terms(ask("What did Pixel knock off the shelf?")) === "cup" && PG.interpret(S, "What did Pixel knock off the shelf?").also.length === 2,
     "a tied child's question checks all three of its atoms");
  ok(terms(ask("What went off the table?")) === "napkin bone", "a plain verb with off reaches the construction's vector too, now off is a preposition");
  ok(terms(ask("What did Pixel sneeze?")) === "napkin cap" && !PG.interpret(S, "What did Pixel sneeze?").also, "a question no construction covers is read as before");
  ok(ask("Did Pixel sneeze the napkin off the table?").verdict === PG.say(S.G, "affirm") && ask("Did Pixel sneeze the cap off the table?").verdict !== PG.say(S.G, "affirm"),
     "a yes/no question is the construction's statement: every atom is checked");
  ok(terms(ask("¿Qué tiró Pixel de la mesa?")) === "vaso" && terms(ask("¿Qué tiró Pixel?")) === "vaso pelota",
     "in Spanish too: ¿Qué tiró Pixel de la mesa? is the glass, not the ball");
  // without constructions, the same question is read the old way: no joint query
  const bare = PG.openStore(STORE.replace(/^construction: .*\n/gm, ""));
  ok(!PG.interpret(bare, "What did Pixel sneeze off the table?").also, "with no constructions declared, questions read as they did");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("a question gap at the verb: the pro-verb stands in the verb's place (TTG-RFC-0006 §7)");
{
  const S = fresh();
  let t = T0;
  for (const s of ["Pixel sneezed the napkin off the table.", "Pixel chewed the napkin.", "Pixel knocked the cup off the shelf.", "Pixel licked the cup.",
                   "Pixel tiró el vaso de la mesa.", "Pixel mordió el vaso."]) PG.answer(S, s, t += 60);
  const ask = q => PG.answer(S, q, t += 60), terms = r => r.items.map(i => i.term).join(" ");
  ok(S.G.proVerb.has("do") && S.G.proVerbObject.has("to") && S.grammars[1].proVerb.has("hacer"), "each lexicon declares its pro-verb and the preposition that marks its thing");
  const plain = ask("What did Pixel do to the napkin?");
  ok(plain.intent === "vectorsOf" && terms(plain) === "sneeze chew" && plain.head === PG.say(S.G, "vectors_head", { s:"pixel", o:"napkin" }),
     "What did Pixel do to the napkin? asks for every verb relating them", terms(plain));
  ok(plain.items.every(i => i.cls === "vector"), "and its answers are vectors");
  const cx = PG.interpret(S, "What did Pixel do to the napkin off the table?");
  ok(cx.construction && cx.construction.label === "caused motion" && cx.checks.length === 1, "inside a construction's shape, the pro-verb is the gap at its verb, and the other atom a condition");
  ok(terms(ask("What did Pixel do to the napkin off the table?")) === "sneeze", "and the verb answering is the one said with that condition: the sneeze that sent the napkin off, not the chewing");
  ok(terms(ask("What did Pixel do to the cup off the shelf?")) === "knock", "a tied child does not narrow a question its untied parent reads");
  ok(terms(ask("What did Pixel do to the napkin off the shelf?")) === "", "and a condition that does not hold leaves nothing");
  ok(terms(ask("¿Qué hizo Pixel al vaso?")) === "tirar morder" && terms(ask("¿Qué hizo Pixel al vaso de la mesa?")) === "tirar",
     "in Spanish, with hacer: where only a tied shape reads it, the answer is among the tie's verbs");
  ok(terms(ask("What did Pixel sneeze off the table?")) === "napkin" && terms(ask("What do cats chase?")) === "mouse",
     "a question whose verb is its own is not a pro-verb's, even after a moved did");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("a verb gap with no thing: everything the subject does (TTG-RFC-0006 §7.4)");
{
  const S = fresh();
  let t = T0;
  for (const s of ["Pixel sneezed the napkin off the table.", "Pixel chewed the napkin.", "Pixel is black.", "Pixel is in the garden.",
                   "Pixel tiró el vaso de la mesa."]) PG.answer(S, s, t += 60);
  // each answer's doing is the last link of its ground: the saying itself, or the end of an is_a chain
  const ask = q => PG.answer(S, q, t += 60), said = r => r.items.map(i => i.path[i.path.length - 1].v + " " + i.path[i.path.length - 1].o);
  const did = ask("What did Pixel do?");
  ok(did.intent === "vectorsOf" && ["sneeze napkin", "chew napkin", "sleep_in sun"].every(x => said(did).includes(x)),
     "What did Pixel do? lists what Pixel does, to anything", said(did).join(", "));
  ok(!said(did).some(x => /^(is_a|has_property|in) /.test(x)), "but not what Pixel is, nor where: those are relations, not doings");
  ok(did.head === PG.say(S.G, "vectors_head", { s:"pixel", o:"" }), "headed with no thing");
  ok(said(ask("What did Pixel do to the napkin?")).join(", ") === "sneeze napkin, chew napkin", "and with a thing it still narrows to that thing");
  ok(said(ask("What do cats do?")).includes("chase mouse"), "a kind's doings are asked the same way");
  ok(said(ask("¿Qué hizo Pixel?")).includes("tirar vaso"), "and in Spanish");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("a verb gap inherits: what the subject does by being a kind of something (TTG-RFC-0006 §7.4)");
{
  const S = fresh();
  let t = T0;
  for (const s of ["Pixel chewed the napkin.", "Pingu is a penguin.", "Tweety is a bird."]) PG.answer(S, s, t += 60);
  const ask = q => PG.answer(S, q, t += 60), last = i => i.path[i.path.length - 1];
  const doing = r => r.items.map(i => last(i).v + " " + last(i).o);
  const pixel = ask("What did Pixel do?");
  const chase = pixel.items.find(i => last(i).v === "chase");
  ok(chase && chase.kind === "inference" && chase.via === "cat" && chase.path[0].v === "is_a",
     "Pixel is a cat and cats chase mice, so Pixel does: an inference through is_a, not a saying", doing(pixel).join(", "));
  ok(doing(pixel).includes("chew napkin") && pixel.items.findIndex(i => last(i).v === "chew") < pixel.items.indexOf(chase), "what Pixel itself did comes first");
  ok(doing(ask("What does Pixel do to mice?")).join() === "chase mouse", "with a thing, inheritance narrows to it too");
  ok(doing(ask("What does Pingu do?")).join() === "swim -", "a nearer denial blocks what is farther: Pingu swims, as penguins do, and does not fly, as birds do", doing(ask("What does Pingu do?")).join());
  ok(doing(ask("What does Tweety do?")).includes("fly -"), "while a bird that is no penguin flies");
  PG.answer(S, "Pixel doesn't chase mice.", t += 60);
  ok(!doing(ask("What does Pixel do?")).includes("chase mouse"), "and what the subject says of itself, either way, is its own: a Pixel that does not chase mice does not inherit it");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("a preposition before the wh-word: carried to the end of the statement, its thing is the gap (TTG-RFC-0006 §7)");
{
  const S = fresh();
  let t = T0;
  for (const s of ["Pixel tiró el vaso de la mesa.", "Pixel tiró la pelota.", "Pixel sneezed the napkin off the table.",
                   "The dog dropped the bone off the chair.", "Pixel duerme en la cama."]) PG.answer(S, s, t += 60);
  const ask = q => PG.answer(S, q, t += 60), terms = r => r.items.map(i => i.term).join(" ");
  const de = ask("¿De dónde tiró Pixel el vaso?");
  ok(terms(de) === "mesa" && de.intent === "objectsOf", "¿De dónde tiró Pixel el vaso? is Pixel tiró el vaso de ?, which movimiento causado reads: the table", terms(de));
  ok(terms(ask("¿De qué tiró Pixel el vaso?")) === "mesa", "whatever the wh-word: de qué asks the same");
  ok(!ask("¿De dónde tiró Pixel la pelota?").items.length, "the ball left nothing, so nothing answers");
  ok(terms(ask("Off what did Pixel sneeze the napkin?")) === "table" && terms(ask("Off what did the dog drop the bone?")) === "chair",
     "in English too, after the moved auxiliary: off what did Pixel sneeze the napkin");
  ok(!ask("Off what did Pixel sneeze the bone?").items.length, "and every atom still holds: Pixel never sneezed the bone");
  ok(terms(ask("¿En qué duerme Pixel?")) === "cama", "with no construction, the preposition is read as the statement's words are: Pixel duerme en ?");
  ok(terms(ask("¿Dónde duerme Pixel?")).split(" ").includes("cama"), "and a place question with no preposition is read as before");
  // with the copula: the preposition, stranded or fronted, is where the question asks, never the place vector
  for (const s of ["Pixel is from Madrid.", "Pingu es de Chile.", "A wheel is part of a car."]) PG.answer(S, s, t += 60);
  ok(terms(ask("Where is Pixel from?")) === "madrid", "Where is Pixel from? is Pixel is from ?, not where Pixel is", terms(ask("Where is Pixel from?")));
  ok(terms(ask("From where is Pixel?")) === "madrid" && terms(ask("¿De dónde es Pingu?")) === "chile", "and so is the preposition fronted, in English and Spanish");
  ok(terms(ask("Of what is a wheel part?")) === "car" && terms(ask("What is a wheel part of?")) === "car", "whatever the wh-word");
  ok(terms(ask("Where is Pixel?")).split(" ").includes("sun"), "a place question with no preposition still asks along the place vector");
  PG.answer(S, "La rueda es parte de un coche.", t += 60);
  ok(terms(ask("¿De qué es parte la rueda?")) === "coche", "and where the predicate's noun stands before the subject, the last phrase is the subject: la rueda es parte de ?");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("part of a clause: a stance's clause and a relative, handed to the matcher (TTG-RFC-0006 §3)");
{
  const st = fresh(), read = s => PG.shapeOf(st, s), keys = r => r.percepts.map(p => [p.s, p.v, p.o, p.pol].join(" ")).join(" / ");
  const think = read("I think Pixel knocked the cup off the shelf.");
  ok(keys(think) === "self think - + / pixel knock cup ? / cup go_off shelf ? / cup fall_off shelf ?" && think.constructions[0].label === "knocking off",
     "I think Pixel knocked the cup off the shelf: the stance is said, and what knocking off says after it is held", keys(think));
  ok(keys(read("I think that Pixel knocked the cup off the shelf.")) === keys(think), "with that or without it");
  ok(keys(read("I don't think Pixel pushed the cup off the shelf.")) === "self think - - / pixel push cup ? / cup go_off shelf ?", "a denied stance still holds what it takes");
  ok(keys(read("I think the cat is black.")) === "self think - + / cat has_property black ?" && !read("I think the cat is black.").constructions.length,
     "a stance's clause no shape covers is read by its words, as before");
  const S = fresh();
  let t = T0;
  const told = PG.answer(S, "I think Pixel knocked the cup off the shelf.", t += 60);
  const ep = PG.records(S.st).find(r => r.episode && r.episode.includes("I think Pixel knocked")).episode;
  ok(/^holds: 1 \| 1 \| 2 3 4$/m.test(ep), "the holds line names every atom the stance holds", ep);
  ok(told.notes.some(n => n.includes("knocking off")), "and the reply names the construction");
  const rel = read("The cat that knocked the cup off the shelf is black.");
  ok(keys(rel) === "cat knock cup + / cup go_off shelf + / cup fall_off shelf + / cat has_property black +",
     "a subject relative: its antecedent is the shape's subject, and the clause around it is read without it", keys(rel));
  ok(keys(read("I saw the cat that knocked the cup off the shelf.")).endsWith("self see cat +"), "a relative at the end of its clause too");
  ok(keys(read("The cup that Pixel knocked off the shelf broke.")) === "pixel knock cup + / cup go_off shelf + / cup fall_off shelf + / cup break - +",
     "an object relative: its antecedent stands after the relative's verb", keys(read("The cup that Pixel knocked off the shelf broke.")));
  ok(keys(read("El gato que tiró el vaso de la mesa es negro.")) === "gato tirar vaso + / vaso salir_de mesa + / gato has_property negro +", "in Spanish too");
  ok(keys(read("The cat that I saw is black.")) === "self see cat + / cat has_property black +", "and a relative no shape covers is read by its words");
  // a relative inside a stance's clause: both spans at once, everything after the stance held by it
  const both = read("I think the cat that knocked the cup off the shelf is black.");
  ok(keys(both) === "self think - + / cat knock cup ? / cup go_off shelf ? / cup fall_off shelf ? / cat has_property black ?" && both.constructions[0].label === "knocking off",
     "a relative inside a stance's clause: the construction reads the relative, and the stance holds it and the clause around it", keys(both));
  ok(keys(read("I doubt the cup that Pixel knocked off the shelf broke.")) === "self doubt - + / pixel knock cup ? / cup go_off shelf ? / cup fall_off shelf ? / cup break - ?", "an object relative too");
  ok(keys(read("Creo que el gato que tiró el vaso de la mesa es negro.")) === "self creer - + / gato tirar vaso ? / vaso salir_de mesa ? / gato has_property negro ?", "and in Spanish, after que");
  ok(keys(read("I think the cat that I saw is black.")) === "self think - + / self see cat ? / cat has_property black ?", "a relative no shape covers, inside a stance's clause, reads as before");
  const S2 = fresh();
  PG.answer(S2, "I think the cat that knocked the cup off the shelf is black.", T0 + 60);
  ok(/^holds: 1 \| 1 \| 2 3 4 5$/m.test(PG.records(S2.st).find(r => r.episode && r.episode.includes("I think the cat that")).episode), "the holds line names all four");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("an adverbial clause, and phrases after a shape (TTG-RFC-0002 §2, TTG-RFC-0006 §3)");
{
  const S = fresh(), read = x => PG.shapeOf(S, x), keys = r => r.percepts.map(p => [p.s, p.v, p.o, p.pol].join(" ")).join(" / ");
  // a clause a subord word opens ends at the list separator where a clause of its own follows
  ok(keys(read("When Pixel slept, the dog barked.")) === "pixel sleep - + / dog bark - +", "When Pixel slept, the dog barked: two clauses, not Pixel sleeping a barked", keys(read("When Pixel slept, the dog barked.")));
  const when = read("When Pixel knocked the cup off the shelf, the dog barked.");
  ok(keys(when) === "pixel knock cup + / cup go_off shelf + / cup fall_off shelf + / dog bark - +" && when.constructions[0].label === "knocking off",
     "so a construction reads the fronted clause, and the main clause, which no subord word opens, is read by its words", keys(when));
  ok(keys(read("Cuando Pixel tiró el vaso de la mesa, el perro ladró.")) === "pixel tirar vaso + / vaso salir_de mesa + / perro ladrar - +", "in Spanish too");
  ok(keys(read("When Pixel chased mice, cats and dogs, the bird sang.")) === "pixel chase mouse + / pixel chase cat + / pixel chase dog + / bird sing - +",
     "the last such separator closes it, so a list before it stays a list");
  ok(keys(read("I like cats, dogs and birds.")) === "self like cat + / self like dog + / self like bird +", "and a list with no subord word before it is a list");
  // phrases after a shape
  const kitchen = read("Pixel knocked the cup off the shelf in the kitchen.");
  ok(keys(kitchen) === "pixel knock cup + / cup go_off shelf + / cup fall_off shelf + / cup with kitchen +" && kitchen.constructions[0].label === "knocking off",
     "a prepositional phrase after what a shape covers: the construction reads up to it, and the phrase is mentioned as the walk mentions it", keys(kitchen));
  ok(keys(read("Pixel tiró el vaso de la mesa en la cocina.")) === "pixel tirar vaso + / vaso salir_de mesa + / vaso with cocina +", "in Spanish too");
  ok(keys(read("Pixel chased the mouse in the kitchen.")) === "pixel chase mouse + / mouse with kitchen +", "and a clause no shape covers reads as before");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("moving from: from is a motion only after a verb that moves a thing (TTG-RFC-0006 §8.3)");
{
  const S = fresh(), read = x => PG.shapeOf(S, x), keys = r => r.percepts.map(p => [p.s, p.v, p.o, p.pol].join(" ")).join(" / ");
  ok(keys(read("Pixel pushed the cup from the shelf.")) === "pixel push cup + / cup leave shelf +" && read("Pixel pushed the cup from the shelf.").constructions[0].label === "moving from",
     "Pixel pushed the cup from the shelf: the push, and the cup leaving the shelf");
  ok(!read("I bought milk from the shop.").constructions.length && !read("I bought milk from the shop.").percepts.some(p => p.v === "leave"),
     "while a verb that moves nothing is read by its words: buying milk from the shop is not the milk leaving it");
  let t = T0;
  for (const s of ["Pixel pushed the cup from the shelf.", "The dog dropped the bone from the chair.", "Pixel knocked the cup off the shelf."]) PG.answer(S, s, t += 60);
  const ask = q => PG.answer(S, q, t += 60), terms = r => r.items.map(i => i.term).join(" ");
  ok(terms(ask("From where did Pixel push the cup?")) === "shelf" && terms(ask("What did Pixel push from the shelf?")) === "cup",
     "so From where did Pixel push the cup? has its answer, and so has what Pixel pushed from it");
  ok(terms(ask("What left the shelf?")) === "cup" && terms(ask("What left the chair?")) === "bone", "and leave is the vector a plain verb asks with");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("one motion, two languages: go_off and salir_de are leave, by rule (TTG-RFC-0003 §3.1)");
{
  const S = fresh();
  let t = T0;
  for (const x of ["Pixel sneezed the napkin off the table.", "Pixel tiró el vaso de la mesa.", "Pixel pushed the cup from the shelf."]) PG.answer(S, x, t += 60);
  const ask = q => PG.answer(S, q, t += 60), terms = r => r.items.map(i => i.term).join(" ");
  const left = ask("What left the table?");
  ok(terms(left) === "napkin" && left.items[0].kind === "inference", "the napkin went off the table, so it left it: inferred, not said", terms(left));
  const vaso = ask("Did the vaso leave the mesa?");
  ok(vaso.verdict === PG.say(S.G, "affirm_inferred") && PG.replyText(S, vaso).includes("salir de is leave"), "and what Spanish says left, English asks after, through the rule's label", PG.replyText(S, vaso));
  ok(terms(ask("What left the shelf?")) === "cup" && ask("What left the shelf?").items[0].kind === "direct", "a moving from is said as leave, no rule needed");
  ok(terms(ask("¿Qué salió de la mesa?")) === "vaso", "and a Spanish verb with its preposition after it asks for its subject: ¿Qué salió de la mesa? is the glass");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
}

section("morphology: a stem no lemma ends bare on takes back its e (TTG-RFC-0001 §4)");
{
  const S = fresh(), en = S.grammars.find(G => G.lang === "en");
  const lemma = w => PG.withGrammar(S, en, () => PG.verbLemma(S, w).lemma);
  const pairs = { shoved:"shove", shoving:"shove", judged:"judge", danced:"dance", argued:"argue", queued:"queue", gazed:"gaze", dozed:"doze" };
  ok(Object.entries(pairs).every(([w, l]) => lemma(w) === l), "an unknown verb whose stem ends on v, c, dg, u or one z after a vowel is the stem with e",
     Object.keys(pairs).map(w => w + ">" + lemma(w)).join(" "));
  const kept = { walked:"walk", looked:"look", hopped:"hop", buzzed:"buzz", fixed:"fix", cooled:"cool" };
  ok(Object.entries(kept).every(([w, l]) => lemma(w) === l), "and every other stem reads as before", Object.keys(kept).map(w => w + ">" + lemma(w)).join(" "));
  ok(PG.shapeOf(S, "Pixel shoved the cup.").percepts.some(p => p.v === "shove"), "so Pixel shoved the cup is a shove");
  const bare = PG.openStore(STORE.replace(/^stem_restore: .*\n/m, ""));
  ok(PG.withGrammar(bare, bare.grammars.find(G => G.lang === "en"), () => PG.verbLemma(bare, "shoved").lemma) === "shov", "the stems are the store's to declare: without the key, the bare stem");
  ok(PG.reread(fresh()).changed.length === 0, "the seed episodes read the same");
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

  // A question whose subject stands behind its verb (TTG-RFC-0002 §3). English puts an
  // auxiliary in the way and so never has to choose; Spanish has none, and the two
  // questions differ only in the thing behind the verb — the object mark rules it out as
  // the subject, and otherwise the verb agrees with it or it is not the subject.
  const route = t => { const G = PG.pickGrammar(S, t); return PG.withGrammar(S, G, () => PG.interpret(S, t)); };
  const asks = [
    ["what do cats chase?",          "objectsOf",  "cat"],
    ["what chases mice?",            "subjectsOf", "chase"],
    ["¿qué cazan los gatos?",        "objectsOf",  "gato"],      // agrees: los gatos is the subject
    ["¿qué comen los ratones?",      "objectsOf",  "ratón"],
    ["¿qué come el gato?",           "objectsOf",  "gato"],
    ["¿qué caza ratones?",           "subjectsOf", "cazar"],     // does not agree: ratones cannot be it
    ["¿qué persigue a los ratones?", "subjectsOf", "perseguir"]  // marked an object, so the slot is the subject
  ];
  for (const [text, intent, key] of asks){
    const r = route(text);
    ok(r.intent === intent && (r.intent === "objectsOf" ? r.s : r.v) === key,
       JSON.stringify(text) + " asks for " + (intent === "objectsOf" ? "objects" : "subjects"),
       r.intent + " " + (r.s || r.v || ""));
  }
  // and a grammar that declares no plural verb ending keeps the slot in front, as before
  const flat = PG.openStore(STORE.split(NL + "plural_verb_ending: n").join(""));
  const fr = PG.withGrammar(flat, PG.pickGrammar(flat, "¿qué cazan los gatos?"),
                            () => PG.interpret(flat, "¿qué cazan los gatos?"));
  ok(fr.intent === "subjectsOf", "with no plural verb ending declared, the slot leads as it always did", fr.intent);

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

section("belief trajectories: the shape a triple's sayings make, read-only (TTG-RFC-0003 §4 and Appendix A)");
{
  const S = fresh();
  let t = T0;
  for (const x of ["I like tea.", "I like tea.", "I like tea.", "I don't like tea.", "I don't like tea.", "I don't like tea.",
                   "I like milk.", "I don't like milk.", "I like milk.", "I don't like milk.", "I like milk.",
                   "I like jam.", "I like jam.", "I like jam.", "I don't like jam.",
                   "I liked cake.", "I don't like cake.", "I don't like cake.", "Dogs bark.", "Dogs bark.", "Dogs bark.",
                   "Pixel sneezed the napkin off the table.", "Pixel knocked the cup off the shelf.", "Pixel tiró el vaso de la mesa."]) PG.answer(S, x, t += 3600);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pg-traj-")), file = path.join(dir, "store.md"), text = PG.serializeStore(S.st);
  fs.writeFileSync(file, text);
  const run = (...a) => JSON.parse(execFileSync(process.execPath, ["tools/trajectories.mjs", "--store", file, "--json", ...a], { encoding:"utf8" }));
  const r = run(), row = k => r.triples.find(x => x.triple === "self | like | " + k) || {};
  ok(row("tea").shape === "one crossing" && row("tea").verdict === "?" && row("tea").signs === "+ + + - - -",
     "three likes then three don't-likes: the verdict is a contest, and the lens shows one crossing", JSON.stringify(row("tea")));
  ok(r.triples[0].triple === "self | like | tea", "and ranks it first: a contest whose sayings fall in two runs");
  ok(row("milk").shape === "alternation" && row("milk").runs.length === 5, "back and forth is an alternation");
  ok(row("jam").shape === "crossing, not yet held", "one late contrary saying has crossed, too recently to say");
  ok(row("cake").retiredByTense && row("cake").signs.startsWith("+r"), "a saying the owner's tense retired is kept in the series, flagged");
  ok(row("coffee").shape === "too few", "fewer than three episodes show nothing");
  ok(!r.triples.some(x => x.triple === "dog | bark | -"), "a triple whose sayings agree is not listed by default");
  ok(run("--all").triples.find(x => x.triple === "dog | bark | -").shape === "fixed point", "and with --all it is a fixed point");
  ok(run("--min", "2").triples.find(x => x.triple === "self | like | coffee").shape === "crossing, not yet held", "--min lowers the episodes a shape needs");
  const basin = l => r.constructions.find(c => c.label === l) || {};
  ok(basin("knocking off").episodes === 1 && basin("caused motion").episodes === 2 && basin("acting on a thing").episodes === 2 && basin("movimiento causado").episodes === 1,
     "construction traffic is re-derived by re-reading: an ancestor counts what its descendants read", JSON.stringify(r.constructions));
  ok(basin("taking time off").episodes === 0, "and a construction that draws nothing is listed with nothing");
  ok(fs.readFileSync(file, "utf8") === text, "the report writes nothing");
  // the series is the engine's: the report and the reply read the same runs
  const tea = [...S.trips.values()].find(e => e.s === "self" && e.v === "like" && e.o === "tea");
  ok(JSON.stringify(PG.trajectoryOf(S, tea, 3, 2).runs) === JSON.stringify(row("tea").runs) && PG.trajectoryOf(S, tea, 3, 2).shape === PG.TRAJ.CROSSING,
     "the tool's runs are the engine's trajectoryOf");
  // the note beside the grounds (TTG-RFC-0003 §4): named where the verdict can't show the shape, and nowhere else
  const ask = q => PG.answer(S, q, t += 60), cross = PG.say(S.G, "trajectory_crossing").split("{")[0], alt = PG.say(S.G, "trajectory_alternation").split("{")[0];
  const teaR = ask("Do I like tea?");
  ok(teaR.verdict === PG.say(S.G, "contest") && teaR.notes.some(n => n.startsWith(cross) && n.includes("3 episodes")),
     "Do I like tea? is still a contest, and the note says it turned once: three episodes one way, three the other", teaR.notes.join(" | "));
  ok(ask("Do I like milk?").notes.some(n => n.startsWith(alt)), "milk goes back and forth, and the note says so");
  const quiet = ["Do I like jam?", "Do dogs bark?", "Do I like coffee?"].map(ask);
  ok(quiet.every(r => !r.notes.some(n => n.startsWith(cross) || n.startsWith(alt))), "no note for a crossing not yet held, a fixed point, or too few episodes");
  const cake = ask("Do I like cake?");
  ok(cake.notes.length === 1 && cake.notes[0].startsWith(PG.say(S.G, "changed_tense").split("{")[0]),
     "where the owner's tense already named the change, its note stands alone");
  // with the numbers absent the replies are what they were, and with them present only a note is added
  const bare = PG.openStore(text.replace(/^trajectory_min_episodes: .*\n/m, ""));
  let t2 = t;
  for (const q of ["Do I like tea?", "Do I like milk?", "Do I like jam?", "Do dogs bark?"]){
    const a = PG.answer(bare, q, t2 += 60), b = PG.answer(PG.openStore(text), q, t2);
    ok(a.verdict === b.verdict && JSON.stringify(a.items) === JSON.stringify(b.items) && !a.notes.some(n => n.startsWith(cross) || n.startsWith(alt)),
       "without trajectory_min_episodes, " + q + " has the same verdict and grounds, and no note");
  }
  // Spanish has its own wording
  const es = fresh();
  let t3 = T0;
  for (const x of ["Pixel caza ratones.", "Pixel caza ratones.", "Pixel caza ratones.", "Pixel no caza ratones.", "Pixel no caza ratones.", "Pixel no caza ratones."]) PG.answer(es, x, t3 += 3600);
  const esG = es.grammars.find(G => G.lang === "es");
  ok(PG.answer(es, "¿Caza Pixel ratones?", t3 += 60).notes.some(n => n.startsWith(PG.say(esG, "trajectory_crossing").split("{")[0])), "and Spanish says it in Spanish");
  // construction traffic, with the re-reading
  const rt = PG.reread(PG.openStore(text)).traffic, tr = l => rt.find(x => x.label === l) || {};
  ok(tr("knocking off").sentences === 1 && tr("caused motion").sentences === 2 && tr("acting on a thing").sentences === 2 && tr("movimiento causado").sentences === 1 && tr("taking time off").sentences === 0,
     "the re-reading counts what each construction reads now, an ancestor what its descendants read", JSON.stringify(rt));
  fs.rmSync(dir, { recursive:true, force:true });
}

section("the slow-verb meter: how fast what is said of a term changes, read-only (TTG-RFC-0003 §4, pace; @LAT98LON10)");
{
  const S = fresh();
  let t = T0;
  PG.startEmpty(S, t);
  for (const x of ["A stone is hard.", "A stone is heavy.", "A stone is hard.",
                   "Pixel is in the garden.", "Pixel is in the kitchen.", "Pixel is in the hall.", "Pixel is in the garden.",
                   "A computer was a person.", "A computer was a person.", "A computer is not a person.", "A computer is a machine.",
                   "The kitchen is in the house.", "Rex is in the house.", "Rex is in the kitchen.", "Rex is in the house.",
                   "A whale is big."]) PG.answer(S, x, t += 3600);
  const m = l => PG.paceOf(S, l), head = k => PG.say(S.G, k).split("{")[0];
  ok(m("stone").band === PG.PACE.STILL && m("stone").episodes === 3 && m("stone").changes === 0, "three episodes and nothing turned: still", JSON.stringify(m("stone")));
  ok(m("pixel").band === PG.PACE.FAST && m("pixel").moves === 3 && m("pixel").turns === 0 && m("pixel").pace === 0.75,
     "garden, kitchen, hall, garden along an exclusive vector: three moves in four episodes, fast", JSON.stringify(m("pixel")));
  ok(m("computer").band === PG.PACE.SLOW && m("computer").turns === 1 && m("computer").moves === 0 && m("computer").episodes === 4,
     "was a person, is not a person: one turn in four episodes, slow, a turn the owner's tense retired counted too", JSON.stringify(m("computer")));
  ok(m("computer").triples.length === 1 && m("computer").triples[0].o === "person" && m("computer").triples[0].turns === 1, "and names the triple that turned");
  ok(m("rex").moves === 0 && m("rex").band === PG.PACE.STILL, "the kitchen is in the house, so house to kitchen and back is no move (as supersession allows)", JSON.stringify(m("rex")));
  ok(m("whale").band === PG.PACE.FEW && PG.paceText(S, "whale") === "", "under pace_min_episodes there is nothing to read");
  // the note beside the portrait's grounds, in the store's words
  const ask = q => PG.answer(S, q, t += 60);
  ok(ask("Tell me about the stone.").notes.some(n => n.startsWith(head("pace_still")) && n.includes("3 episodes")), "Tell me about the stone. names it still");
  ok(ask("Tell me about the computer.").notes.some(n => n.startsWith(head("pace_slow")) && n.includes("1 time")), "the computer, slow");
  ok(ask("Tell me about Pixel.").notes.some(n => n.startsWith(head("pace_fast")) && n.includes("3 times in 4 episodes")), "and Pixel, fast");
  ok(!ask("Tell me about the whale.").notes.some(n => ["pace_still", "pace_slow", "pace_fast"].some(k => n.startsWith(head(k)))), "and the whale, nothing");
  ok(!ask("Is Pixel in the hall?").notes.some(n => n.startsWith(head("pace_fast"))), "a yes/no question carries no pace: it is a portrait's note");
  // read-only, and absent numbers are the old behaviour
  const text = PG.serializeStore(S.st);
  for (const l of ["stone", "pixel", "computer"]) PG.paceOf(S, l);
  ok(PG.serializeStore(S.st) === text, "reading a pace writes nothing");
  const bare = PG.openStore(text.replace(/^pace_min_episodes: .*\n/m, "")), full = PG.openStore(text);
  for (const q of ["Tell me about Pixel.", "Tell me about the stone."]){
    const a = PG.answer(bare, q, t += 60), b = PG.answer(full, q, t);
    ok(JSON.stringify(a.portraits.map(p => p.direct)) === JSON.stringify(b.portraits.map(p => p.direct)) &&
       a.notes.length === b.notes.length - 1 && !a.notes.some(n => n.startsWith(head("pace_fast")) || n.startsWith(head("pace_still"))),
       "without pace_min_episodes, " + q + " has the same grounds and one note fewer");
  }
  ok(PG.paceOf(bare, "pixel").band === PG.PACE.FEW, "and no term has a pace");
  // the report is the engine's
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pg-pace-")), file = path.join(dir, "store.md");
  fs.writeFileSync(file, text);
  const rep = JSON.parse(execFileSync(process.execPath, ["tools/pace.mjs", "--store", file, "--json"], { encoding:"utf8" }));
  const row = l => rep.terms.find(r => r.term === l) || {};
  ok(row("pixel").band === "fast" && row("pixel").pace === 0.75 && row("stone").band === "still" && !row("whale").term && rep.terms[0].term === "pixel",
     "node tools/pace.mjs reads what the engine reads, fastest first, and leaves out the terms too new to read", JSON.stringify(rep.terms.slice(0, 3)));
  ok(fs.readFileSync(file, "utf8") === text, "and writes nothing");
  fs.rmSync(dir, { recursive:true, force:true });
  // Spanish has its own wording
  const es = fresh();
  let t3 = T0;
  PG.startEmpty(es, t3);
  for (const x of ["Pixel caza ratones.", "Pixel caza ratones.", "Pixel no caza ratones.", "Pixel no caza ratones."]) PG.answer(es, x, t3 += 3600);
  const esG = es.grammars.find(G => G.lang === "es");
  ok(PG.answer(es, "Háblame de Pixel.", t3 += 60).notes.some(n => n.startsWith(PG.say(esG, "pace_slow").split("{")[0])), "and Spanish says it in Spanish");
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
  // Block and header keys are schema, like a column name: the check is about the words, not
  // the keys that hold them. Several collide with English on purpose — `at` is a preposition,
  // `said` a verb form, `type` the head of the phrasal vector *a type of* — and a key the file
  // format names (TTDB-RFC-0001 §5) is a key wherever the language also happens to use it.
  const SCHEMA = new Set(["kind", "class", "lemma", "forms", "seen", "asked", "belief", "source", "at", "said", "percept", "lang", "label", "type"]);
  const vocab = new Set(Gs.flatMap(G => [...G.classes.keys(), ...G.whole.keys(), ...G.nounIrr.keys(), ...G.nounIrr.values(),
    ...G.verbIrr.keys(), ...G.verbIrr.values(), ...G.seed, ...G.stanceNoun, ...G.vectors.keys(), ...G.phrases.flatMap(p => p[0]),
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

section("the example stores and the release page (examples/, release.html)");
{
  // line ends as a checkout may leave them do not matter: both sides read with LF
  const SEED = STORE;
  for (const ex of EXAMPLES){
    const file = "examples/" + ex.file, text = read(file).replace(/\r\n?/g, "\n"), S = PG.openStore(text);
    const headers = text.split(/\r?\n/).filter(l => /^@LAT-?[\d.]+LON-?[\d.]+\s*\|/.test(l)).length;
    // the seed's fixture record (lat 99) is malformed on purpose, and an example keeps it
    ok(PG.records(S.st).length === headers && S.malformed.every(m => /^@LAT99LON/.test(m.id)) && PG.serializeStore(S.st) === text,
       file + " parses, every record, nothing malformed outside the fixture, and round-trips byte for byte");
    ok(build(PG, SEED, ex) === text, "and equals a fresh build from the seed's grammar and its sayings (node tools/examples.mjs)");
    ok(S.episodes.length === ex.sayings.length && PG.reread(S).changed.length === 0, "its " + ex.sayings.length + " episodes re-read unchanged");
    let t = NOW + STEP * (ex.sayings.length + 1);
    for (const a of ex.ask){ const c = check(PG, S, a, t += STEP); ok(c.ok, "  " + a.q, c.why.join("; ")); }
  }
  // ?store= opens a file in the examples folder and nothing else
  ok(PG.examplePath("examples/clauses_ttdb.md") === "examples/clauses_ttdb.md", "?store= takes an example by its path");
  const refused = ["../personal_grimoire_ttdb.md", "examples/../personal_grimoire_ttdb.md", "/examples/clauses_ttdb.md",
    "https://example.org/examples/clauses_ttdb.md", "//example.org/examples/clauses_ttdb.md", "examples/sub/clauses_ttdb.md",
    "examples/clauses.md", "examples/Clauses_ttdb.md", "examples/clauses_ttdb.md?x", "personal_grimoire_ttdb.md", "", null];
  ok(refused.every(p => PG.examplePath(p) === null), "and refuses any other path, host or name", refused.filter(p => PG.examplePath(p) !== null).join(" "));
  // every try-it link opens an example that exists, with a question the test above asks of it
  const page = read("release.html");
  const links = [...page.matchAll(/href="index\.html\?([^"]+)"/g)].map(m => new URLSearchParams(m[1].replace(/&amp;/g, "&")));
  ok(links.length >= 12, "the release page has try-it links", links.length);
  const bad = links.filter(u => {
    const ex = EXAMPLES.find(e => "examples/" + e.file === u.get("store"));
    return !ex || !PG.examplePath(u.get("store")) || !ex.ask.some(a => a.q === u.get("ask"));
  });
  ok(!bad.length, "every one names an example store and a question this suite asks of it", bad.map(u => u.toString()).join(" "));
  ok(EXAMPLES.every(e => links.some(u => u.get("store") === "examples/" + e.file)), "and every example store is linked from the page");
  // the page's bAbI table is what paper/ records
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const task of [1, 15]){
    const res = JSON.parse(read("paper/babi_qa" + task + "_results.json")).results;
    for (const [cond, v] of Object.entries(res)){
      const row = page.match(new RegExp('<tr data-task="' + task + '" data-cond="' + esc(cond) + '">(.*?)</tr>'));
      const pct = n => (100 * n / v.questions).toFixed(1) + "%";
      ok(!!row && row[1].includes(">" + pct(v.correct) + "<") && row[1].includes(">" + pct(v.attributed) + "<") && row[1].includes(v.outcomes_sha256),
         "the page's bAbI task " + task + " row '" + cond + "' is paper/'s: " + pct(v.correct) + ", " + v.outcomes_sha256);
    }
  }
  // every citation has its reference, and every reference is cited
  const cited = new Set([...page.matchAll(/href="#(ref-[a-z]+)"/g)].map(m => m[1]));
  const listed = new Set([...page.matchAll(/<li id="(ref-[a-z]+)"/g)].map(m => m[1]));
  ok([...cited].every(r => listed.has(r)) && [...listed].every(r => cited.has(r)), "every citation on the page has a reference entry, and every entry is cited",
     [...cited].filter(r => !listed.has(r)).concat([...listed].filter(r => !cited.has(r))).join(" "));
}

// the release page gives each suite's count at release; the suite never falls below it
{
  const n = +((read("release.html").match(/<b id="count-app">(\d+)<\/b>/) || [])[1] || 0);
  ok(n > 0 && passes + 1 >= n, "this suite still has at least the " + n + " checks the release page gives", passes + 1);
}

console.log("\n" + (fails ? fails + " FAILED" : "all passed"));
process.exit(fails ? 1 : 0);
