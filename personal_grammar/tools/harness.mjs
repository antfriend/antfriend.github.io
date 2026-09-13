// Loads index.html's own script into Node, so tools and tests run the shipping
// engine rather than a copy of it. The script only boots its UI when a DOM exists.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const read = f => fs.readFileSync(path.isAbsolute(f) ? f : path.join(root, f), "utf8");
export const STORE = "personal_grammar_ttdb.md";

export function scriptOf(html = read("index.html")){
  return html.match(/<script>\r?\n([\s\S]*?)<\/script>/)[1];
}

export async function loadEngine(){
  const key = "__pg_" + Math.random().toString(36).slice(2);
  const src = scriptOf() + "\n;globalThis." + key + " = PG;";
  await import("data:text/javascript;base64," + Buffer.from(src).toString("base64"));
  return globalThis[key];
}

export function args(argv = process.argv.slice(2)){
  const flags = {}, rest = [];
  for (let i = 0; i < argv.length; i++){
    const a = argv[i];
    if (a.startsWith("--")){
      const k = a.slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith("--") && ["store", "now", "out"].includes(k)) flags[k] = argv[++i];
      else flags[k] = true;
    } else rest.push(a);
  }
  return { flags, rest };
}
