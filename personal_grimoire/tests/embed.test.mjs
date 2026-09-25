// The page as a host sees it. Blueprint 9 says a host may keep the page or take
// only the engine; this suite is the second case. The script is run as a classic
// script, the way a host vendors it, so its top-level declarations become
// globals — and the boot gate stays shut, so only what the host calls runs.
//
// The rule under test: the page dereferences no element without finding it
// first. Every chrome id is the host's to offer or leave out, and leaving one
// out must cost that surface and nothing else.
import vm from "node:vm";
import { read, scriptOf } from "../tools/harness.mjs";
import { makeDom } from "./dom.mjs";

const STORE = read("personal_grimoire_ttdb.md").replace(/\r\n?/g, "\n");
const APP = read("index.html");

let fails = 0;
const ok = (cond, msg, extra = "") => {
  if (cond) console.log("  PASS  " + msg + (extra ? "  " + extra : ""));
  else { fails++; console.log("  FAIL  " + msg + "  " + extra); }
};
const section = s => console.log("\n== " + s + " ==");

/* Every id the page code names, so a new one cannot be added without this
   suite deciding whether a host must supply it. */
const ID_USE = () => /(?:\$|dset)\("(\w+)"\)/g;   // both ways the page names an element
const ALL_IDS = [...new Set([...APP.matchAll(ID_USE())].map(m => m[1]))].sort();
/* The ones only boot() reaches: a host wiring its own page never calls it. */
const page = APP.slice(APP.indexOf("The page. Everything below touches the DOM"));
const bootBody = page.slice(page.indexOf("\nfunction boot()"));
const BOOT_ONLY = ALL_IDS.filter(id => {
  const outside = [...page.replace(bootBody, "").matchAll(ID_USE())].filter(m => m[1] === id).length;
  return outside === 0;
});

/* Run the engine the way a host does — a classic script in a context of its own,
   so its top-level declarations are that context global's and a second host
   starts clean — then call what a host calls. */
function host(missing, before){
  const dom = makeDom({ missing });
  const ctx = vm.createContext(dom.globals);
  vm.runInContext(scriptOf(APP), ctx);
  const g = dom.globals, thrown = [];
  if (before) before(g, dom);
  const step = (name, fn) => { try { fn(); } catch (e){ thrown.push(name + ": " + e.message); } };
  step("load", () => g.load(STORE, "seed"));
  step("after", () => g.after());
  step("select a term", () => g.select(g.idKey(-52.1, 173.4), false));
  step("select a record holding a scene", () => g.select(g.idKey(96, 0), false));
  step("select an episode", () => g.select(g.idKey(90, 1), false));
  step("renderTerms", () => g.renderTerms());
  step("preview", () => { const q = dom.el("q"); if (q) q.value = "Cats chase mice."; g.preview(); });
  step("draw", () => g.draw());
  step("send a question", () => g.send("Does Pixel chase mice?"));
  step("send a statement", () => g.send("Mice eat cheese."));
  return { g, dom, thrown };
}
section("the engine runs as a host runs it");
{
  const { g, dom, thrown } = host([]);
  ok(typeof g.load === "function" && typeof g.recordHtml === "function",
     "run as a classic script, the page's functions are globals a host can call and replace");
  ok(dom.el("panel").children.length > 0, "and with every element present the host's page renders");
  ok(!thrown.length, "nothing throws with the page's own markup", thrown.join(" ; "));
}

section("a host may leave any chrome out (TTG-RFC-0001 §10)");
{
  // the whole surface at once: a host that supplies only the store and a panel
  const chrome = ALL_IDS.filter(id => id !== "panel");
  const { thrown } = host(chrome);
  ok(!thrown.length, "with every chrome id but #panel absent, nothing throws", thrown.join(" ; "));
}
{
  const { thrown, dom } = host(ALL_IDS);
  ok(!thrown.length, "with no elements at all, nothing throws", thrown.join(" ; "));
  ok(!dom.el("panel").children.length, "and nothing was drawn into the page it does not have");
}
for (const id of ["rereads", "storeinfo", "nudge", "scene", "sphere", "termlist", "log", "preview", "mode", "filtermeta"]){
  const { thrown } = host([id]);
  ok(!thrown.length, "a host without #" + id + " still runs", thrown.join(" ; "));
}

section("what a host replaces (TTG-RFC-0001 §10)");
{
  // Every top-level function is a binding the engine's own callers resolve, so a host
  // can replace one and the page calls the host's. This is how a host decorates records.
  const seen = [];
  const { dom } = host([], g => {
    const upstream = g.recordHtml;
    g.recordHtml = rec => { seen.push(rec.id); return "<i>host</i>" + upstream(rec); };
  });
  ok(seen.length > 0, "a host's recordHtml is what the engine's own render paths call", seen.join(" "));
  const track = dom.el("panel").children[0];
  ok(track && track.children.some(s => s.innerHTML.startsWith("<i>host</i>")),
     "and what it returns is what lands in the record window");
}
{
  // An include is fetched from beside the page, which is not where every host keeps it.
  const run = url => {
    const asked = [];
    host([], g => {
      g.fetch = async u => { asked.push(u); return { ok:false, status:404, statusText:"x" }; };
      if (url !== undefined) g.includeUrl = url;
    });
    return asked;
  };
  ok(run().includes("README.md"), "by default an include is asked for beside the page");
  ok(run(f => "/static/pg/" + f).includes("/static/pg/README.md"),
     "a host that keeps it elsewhere says so through includeUrl");
  ok(run(() => "").length === 0, "and a host that serves no include files makes no request at all");
}

section("every id is accounted for");
{
  ok(BOOT_ONLY.length > 0, "some ids only boot() reaches", BOOT_ONLY.map(i => "#" + i).join(" "));
  // The claim Blueprint 9 makes to an embedder, checked against the code rather than trusted.
  const surface = read("personal_grimoire_ttdb.md").match(/@LAT85LON0[\s\S]*?\n---\n/)[0];
  const named = id => surface.includes("`#" + id + "`") || surface.includes("`#" + id + "[");
  const undocumented = ALL_IDS.filter(id => !BOOT_ONLY.includes(id) && !named(id));
  ok(!undocumented.length, "every id a host can reach is named in Blueprint 9",
     undocumented.map(i => "#" + i).join(" "));
}

console.log(fails ? "\n" + fails + " FAILED" : "\nall passed");
process.exit(fails ? 1 : 0);
