// Price lever 5 in README.md: "embed a coarse grid inside the store".
//
// Why this is measured rather than asserted: the lever claims a 5° global grid is
// "2 592 cells, which run-length-encoded and base64'd inside a fenced block is
// single-digit kilobytes". That is a number about an encoding, written before anyone
// encoded anything - the same kind of claim @LAT51.58LON0.1 says to distrust until
// something has been attempted against it. So this encodes the grids the repository
// ALREADY has and reports what they actually cost.
//
// Nothing here invents a climate value. The two grids measured are the land/ocean mask
// rasterised from the coastline geometry in index.html, and the zonal class model
// rasterised from the band table at @LAT0LON0. Both are already in the repository. The
// Köppen raster the lever would really carry is not downloaded and not guessed at - see
// the bound at the end, which needs no data at all.
//
//   node tools/grid_payload.mjs
//
// Not a build step: index.html never calls it.
import fs from "node:fs";

const base = import.meta.url + "/../..";
const code  = fs.readFileSync(new URL("index.html", base), "utf8");
const store = fs.readFileSync(new URL("global_memory_system_ttdb.md", base), "utf8");

// ---- the geometry the app already carries, read out of the app ----------------
const lit = (name, re) => {
  const m = re.exec(code);
  if (!m) throw new Error("cannot find " + name + " in index.html");
  return new Function("return " + m[1])();
};
const LAND = lit("LAND", /const LAND = (\[[\s\S]*?\n\]);/);
const ANT  = lit("ANT",  /const ANT = (\[[\s\S]*?\]\]);/);

// the app's own tests, so the mask measured here is the mask the app draws
function inPoly(poly, x, y){
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function antEdge(lon){
  for (let i = 1; i < ANT.length; i++) if (lon <= ANT[i][0]){
    const a = ANT[i - 1], b = ANT[i], t = (lon - a[0]) / (b[0] - a[0]);
    return a[1] + t * (b[1] - a[1]);
  }
  return -72;
}
const isLand = (lat, lon) => {
  if (lat < antEdge(lon)) return true;
  for (const p of LAND)
    if (inPoly(p, lon, lat) || inPoly(p, lon + 360, lat) || inPoly(p, lon - 360, lat)) return true;
  return false;
};

// ---- the zonal class model the store already declares -------------------------
const bands = [...store.matchAll(/^band: *(\S+) *\| *[^|]+\| *[^|]+\| *([^|]+)\| *(.+)$/gm)]
  .map(m => ({ code: m[1], n: m[2].trim(), s: m[3].trim() }));
const classAt = lat => {
  const a = Math.abs(lat), side = lat >= 0 ? "n" : "s";
  for (let i = 0; i < bands.length; i++){
    const r = bands[i][side];
    if (r === "none") continue;
    const [lo, hi] = r.split(/\s+/).map(Number);
    if (a >= lo && a < hi) return i + 1;
  }
  return bands.length;                         // the polar band closes at 90
};

// ---- rasterise at a given cell size ------------------------------------------
function grid(step, value){
  const nlon = Math.round(360 / step), nlat = Math.round(180 / step), cells = [];
  for (let j = 0; j < nlat; j++)
    for (let i = 0; i < nlon; i++)
      cells.push(value(-90 + (j + 0.5) * step, -180 + (i + 0.5) * step));
  return { cells, nlon, nlat };
}
// transpose, so a latitude-banded field can be measured in the order that suits it
const byColumn = g => {
  const out = [];
  for (let i = 0; i < g.nlon; i++) for (let j = 0; j < g.nlat; j++) out.push(g.cells[j * g.nlon + i]);
  return out;
};
// runs as (value, count) byte pairs, counts capped at 255
function rle(cells){
  const runs = [];
  let v = cells[0], n = 0;
  for (const c of cells){
    if (c === v && n < 255){ n++; continue; }
    runs.push([v, n]); v = c; n = 1;
  }
  runs.push([v, n]);
  return runs;
}
const b64 = bytes => Math.ceil(bytes / 3) * 4;
const report = (name, cells) => {
  const runs = rle(cells), raw = runs.length * 2, syms = new Set(cells).size;
  console.log(`  ${name.padEnd(34)} ${String(cells.length).padStart(5)} cells  ${syms} symbols  ` +
              `${String(runs.length).padStart(5)} runs  ${String(raw).padStart(5)} B  -> ${String(b64(raw)).padStart(5)} B base64`);
  return b64(raw);
};

console.log(`geometry read from index.html: ${LAND.length} polygons, ` +
            `${LAND.reduce((s, p) => s + p.length, 0)} vertices, plus a ${ANT.length}-vertex Antarctic edge`);
console.log(`band table read from the store: ${bands.map(b => b.code).join("")}\n`);

console.log("== what a 5° grid of the repository's own content actually encodes to ==");
const g5 = grid(5, (lat, lon) => (isLand(lat, lon) ? 1 : 0));
const landB64 = report("land/ocean mask, row-major", g5.cells);
report("land/ocean mask, column-major", byColumn(g5));
const z5 = grid(5, (lat, lon) => (isLand(lat, lon) ? classAt(lat) : 0));
const zoneRow = report("zonal class over land, row-major", z5.cells);
const zoneCol = report("zonal class over land, column-major", byColumn(z5));

console.log("\n== the bound that needs no data at all ==");
const CELLS = 72 * 36, BITS = 3;               // 5 Köppen classes + ocean fits in 3 bits
const packed = Math.ceil(CELLS * BITS / 8);
console.log(`  ${CELLS} cells x ${BITS} bits packed = ${packed} B -> ${b64(packed)} B base64, incompressible.`);
console.log(`  So the lever's "single-digit kilobytes" holds for ANY 5° six-symbol grid,`);
console.log(`  whatever its content. The size claim never needed the raster to settle it.`);

console.log("\n== but the measurements above are a floor, not an estimate ==");
console.log(`  Both grids measured are latitude-banded or nearly so, so their runs lie along`);
console.log(`  rows: the zonal field costs ${zoneRow} B row-major against ${zoneCol} B column-major,`);
console.log(`  a ${(zoneCol / zoneRow).toFixed(1)}x spread from re-ordering the very same cells. A real Köppen grid`);
console.log(`  varies with longitude - the Sahara and the Congo sit at similar latitudes in`);
console.log(`  different classes - so it has neither field's structure and lands near the bound.`);

console.log("\n== the comparison the lever did not make ==");
const app = 181 * 360;
console.log(`  index.html already builds a land mask at 1°: ${app} cells, ${(app / CELLS).toFixed(0)}x the ${CELLS}`);
console.log(`  the lever proposes - derived at load from ${LAND.length} polygons and ${LAND.reduce((s, p) => s + p.length, 0)} vertices.`);
console.log(`  The app is already grid-based inside. What the lever changes is not whether a`);
console.log(`  grid exists but whether its cells are SHIPPED or DERIVED, and a polygon list`);
console.log(`  can be read by eye while ${CELLS} base64'd cells cannot.`);
