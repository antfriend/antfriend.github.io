// Recompute the partition at @LAT51.38LON-0.1 - what this store needs from a reader
// before it can answer, counted over the layers it actually draws.
//
// Why this is computed rather than transcribed: there is no assessment anywhere that
// says how many layers of this store answer from a latitude. The number is arithmetic
// on the store's own `kind:` keys, so it is this file's own analysis and has to declare
// a method and something that re-runs it, like every other computed value here.
//
// The rule is mechanical: a zonal-* layer is a function of latitude and answers
// anywhere on its domain; sector-field and distribution-transport answer only at a
// named place; a composition draws nothing on the sphere and reads the same wherever
// you stand. One layer disagrees with its kind and the disagreement is the point, so
// this tool AUDITS the store's declared membership rather than replacing it: it prints
// every layer whose declared term is not the one its kind implies.
//
//   node tools/answerable.mjs
//
// Not a build step: index.html never calls it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(dir, f), "utf8");

/* load index.html's real script behind a DOM stub, the same way the tests do, so the
   year-sensitivity below is the app's own answer and not a second copy of the rule */
const app = read("index.html");
const code = app.match(/<script>\r?\n([\s\S]*?)<\/script>/)[1];
const noop = () => {};
const ctxStub = () => new Proxy({}, { get:(t,k)=> k==="createRadialGradient" ? ()=>({addColorStop:noop})
  : k==="createImageData" ? (w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)})
  : k==="measureText" ? () => ({ width: 10 })
  : (k in t ? t[k] : noop), set:(t,k,v)=>{t[k]=v;return true;} });
const el = () => ({ style:{}, value:"", min:"", max:"", textContent:"", label:"", children:[],
  addEventListener:noop, getBoundingClientRect:()=>({width:600,height:600,left:0,top:0}),
  appendChild(c){this.children.push(c);}, querySelectorAll:()=>[], getContext:ctxStub,
  set innerHTML(v){this._h=v;}, get innerHTML(){return this._h||"";} });
const els = {};
globalThis.document = { body:{}, getElementById:id=>els[id]||=el(), createElement:()=>el() };
globalThis.window = { devicePixelRatio:1, addEventListener:noop };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "#888888" });
globalThis.matchMedia = () => ({ matches:false });
globalThis.requestAnimationFrame = noop;
globalThis.fetch = async f => ({ ok:true, text: async () => read(f) });
await import("data:text/javascript;base64," + Buffer.from(
  code + "\n;globalThis.__x={renders:()=>renders,makeLayer,parseBlock};").toString("base64"));
await new Promise(r => setTimeout(r, 200));
const X = globalThis.__x;

const SELF = "answerable";
const BY_KIND = {                       // the mechanical rule, one line per kind
  "zonal-class": "latitude", "zonal-field": "latitude", "zonal-extent": "latitude",
  "sector-field": "place", "distribution-transport": "place",
  "composition": "neither",
};
const drawn = X.renders().filter(r => r.block.status === "implemented" && r.block.id !== SELF);
const self  = X.renders().find(r => r.block.id === SELF);

/* what the store declares: the locus column of each term names its members */
const declared = new Map();
const termOrder = [];
if (self){
  for (const line of [].concat(self.block.term || [])){
    const c = line.split("|").map(s => s.trim());
    termOrder.push(c[0]);
    for (const m of (c[4] || "").split(/\s+/).filter(Boolean)) declared.set(m, c[0]);
  }
}

console.log(`${drawn.length} drawn layers, excluding the rendering that counts them\n`);
console.log("layer".padEnd(24) + "kind".padEnd(24) + "implies".padEnd(10) + "declared".padEnd(10) + "year");
const rows = drawn.map(r => {
  const implies = BY_KIND[r.block.kind] || "?";
  const term = declared.get(r.rec.id) || "-";
  const usesYear = X.makeLayer(r.rec).usesYear;
  console.log(r.block.id.padEnd(24) + r.block.kind.padEnd(24) + implies.padEnd(10)
              + term.padEnd(10) + (usesYear ? "yes" : "no")
              + (term !== "-" && term !== implies ? "   <- declared against its kind" : ""));
  return { id:r.block.id, rec:r.rec.id, implies, term, usesYear };
});

const terms = termOrder.length ? termOrder : ["latitude", "place", "neither"];
console.log("\nterm".padEnd(12) + "value".padEnd(8) + "aux".padEnd(6) + "members");
for (const t of terms){
  const inTerm = rows.filter(r => (declared.size ? r.term : r.implies) === t);
  console.log(t.padEnd(12) + String(inTerm.length).padEnd(8)
              + String(inTerm.filter(r => r.usesYear).length).padEnd(6)
              + inTerm.map(r => r.id).join(" "));
}
console.log("\nwhole: " + drawn.length
            + "   terms account for " + rows.filter(r => terms.includes(declared.size ? r.term : r.implies)).length);

const unplaced = rows.filter(r => r.term === "-");
const odd = rows.filter(r => r.term !== "-" && r.term !== r.implies);
console.log("\nunplaced: " + (unplaced.length ? unplaced.map(r => r.id).join(" ") : "none"));
console.log("declared against its kind: " + (odd.length
  ? odd.map(r => r.id + " (" + r.implies + " -> " + r.term + ")").join("; ")
  : "none - the partition is exactly what the kinds imply"));
console.log("\nA layer in the second list is not an error. It is the one thing this rendering");
console.log("has to say that its own mechanical rule cannot: a set of regions is a composition");
console.log("to the app and a place to the reader standing in one.");
