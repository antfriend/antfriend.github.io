// The smallest DOM the page will run against, so a test can be a host: the
// engine is a classic script, so its top-level declarations become globals, and
// nothing boots unless an #app element exists. No dependencies, like the rest of
// the suite — this is a stub, not a browser, and it records what was drawn
// rather than drawing it.
import fs from "node:fs";
import { read } from "../tools/harness.mjs";

export const drawn = { strokes: [], fills: [], texts: [] };

class El {
  constructor(tag, attrs = {}){
    this.tagName = (tag || "div").toUpperCase();
    this.children = []; this.parentNode = null; this.isConnected = true;
    this.dataset = {}; this.style = {}; this.className = ""; this.textContent = "";
    this.innerHTML = ""; this.hidden = false; this.value = ""; this.attrs = {};
    this.listeners = {}; this.scrollTop = 0; this.scrollHeight = 0;
    this.clientWidth = 340; this.clientHeight = 340; this.width = 340; this.height = 340;
    this.classList = { add(){}, remove(){}, toggle(){}, contains(){ return false; } };
    for (const [k, v] of Object.entries(attrs)){
      this.attrs[k] = v;
      if (k === "id") this.id = v;
      else if (k.startsWith("data-")) this.dataset[k.slice(5).replace(/-(\w)/g, (m, c) => c.toUpperCase())] = v;
    }
  }
  addEventListener(t, fn){ (this.listeners[t] = this.listeners[t] || []).push(fn); }
  set onchange(fn){ this.addEventListener("change", fn); }
  set onclick(fn){ this.addEventListener("click", fn); }
  fire(t, ev = {}){ for (const fn of this.listeners[t] || []) fn({ preventDefault(){}, ...ev }); }
  appendChild(c){ c.parentNode = this; this.children.push(c); return c; }
  remove(){ this.isConnected = false; }
  setAttribute(k, v){ this.attrs[k] = v; }
  getAttribute(k){ return this.attrs[k]; }
  closest(){ return null; }
  querySelector(){ return null; }
  querySelectorAll(){ return []; }
  getBoundingClientRect(){ return { left:0, top:0, width:340, height:340 }; }
  setPointerCapture(){} releasePointerCapture(){} focus(){} requestSubmit(){ this.fire("submit"); }
  getContext(){ return CTX; }
}

const CTX = {
  strokeStyle:"", fillStyle:"", lineWidth:1, globalAlpha:1, font:"", textAlign:"",
  lineJoin:"", lineCap:"", lineDashOffset:0,
  beginPath(){}, moveTo(){}, lineTo(){}, arc(){}, clearRect(){}, setLineDash(){}, closePath(){},
  save(){}, restore(){}, translate(){}, rotate(){}, scale(){}, rect(){}, clip(){}, fillRect(){}, strokeRect(){},
  quadraticCurveTo(){}, bezierCurveTo(){},
  createRadialGradient(){ return { addColorStop(){} }; },
  createLinearGradient(){ return { addColorStop(){} }; },
  measureText(t){ return { width: String(t).length * 6 }; },
  stroke(){ drawn.strokes.push(this.strokeStyle); },
  fill(){ drawn.fills.push(this.fillStyle); },
  strokeText(t){ drawn.texts.push(String(t)); },
  fillText(){},
};

/* The page's own markup is the element set: a host that omits an id is `missing`. */
export function makeDom({ missing = [], html = read("index.html"), app = false } = {}){
  const gone = new Set(missing), ids = new Map();
  for (const m of html.matchAll(/<(\w+)([^>]*\sid="(\w+)"[^>]*)>/g)){
    const attrs = {};
    for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    ids.set(m[3], new El(m[1], attrs));
  }
  const vars = {};
  for (const m of (html.match(/:root\{[\s\S]*?\}/) || [""])[0].matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) vars[m[1]] = m[2].trim();
  const doc = {
    listeners: {},
    body: new El("body"),
    getElementById: id => (gone.has(id) || (id === "app" && !app)) ? null : (ids.get(id) || null),
    createElement: t => new El(t),
    addEventListener(t, fn){ (this.listeners[t] = this.listeners[t] || []).push(fn); },
    fire(t, ev){ for (const fn of this.listeners[t] || []) fn({ preventDefault(){}, ...ev }); },
  };
  // the globals a host page would have; returned rather than installed, so each
  // call can be run in a context of its own and the engine loaded more than once
  const globals = {
    document: doc,
    window: { addEventListener(){}, devicePixelRatio: 1 },
    getComputedStyle: () => ({ getPropertyValue: v => vars[v] || "#000" }),
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: fn => setTimeout(() => fn(Date.now()), 0),
    localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
    location: { search: "?seed" },
    confirm: () => true,
    fetch: async () => ({ ok:false, status:404, statusText:"no host fetch in the suite" }),
    setTimeout, clearTimeout, setInterval, clearInterval, console, URLSearchParams, URL, Blob, TextEncoder,
  };
  return { doc, globals, el: id => ids.get(id), html, drawn };
}
