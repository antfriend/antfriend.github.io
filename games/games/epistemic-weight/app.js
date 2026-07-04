"use strict";
/* Epistemic Weight — one-page digital table.
 * Sandbox philosophy: the app tracks positions, tokens, and decks;
 * the players enforce the rules (reference cards are one click away).
 * State persists in localStorage; Restart wipes it.
 */

const M = window.EW_MANIFEST;
const CARD = Object.fromEntries(M.cards.map(c => [c.id, c]));
const IMG = id => "images/" + CARD[id].file;
const BACK = "images/" + M.cardBack;
const TOKEN = Object.fromEntries(M.tokens.map(t => [t.id, "images/" + t.file]));

const RINGS = ["weighing", "held", "fading"]; // innermost → outermost; past fading = forgotten

// Story-deck recipes and needs — mirrors the Print & Play manifest §2.
const SCENARIOS = {
  scenario_THE_LONG_ROAD:      { title: "The Long Road",      diff: "◆",    c: 5, r: 3, x: 2, need: "none — learn the loop" },
  scenario_THE_BRIDGE_AT_DUSK: { title: "The Bridge at Dusk", diff: "◆◆",   c: 4, r: 4, x: 2, need: "carry at least one Regard about every character" },
  scenario_THE_TRIAL:          { title: "The Trial",          diff: "◆◆",   c: 3, r: 5, x: 2, need: "at least one Core Belief carries a Scar" },
  scenario_THE_UNRAVELING:     { title: "The Unraveling",     diff: "◆◆◆",  c: 2, r: 6, x: 2, need: "at least two Turnings — two scarred Cores" },
  scenario_WHAT_THE_FIRE_LEFT: { title: "What the Fire Left", diff: "◆◆◆◆", c: 3, r: 4, x: 3, need: "every carried belief bears at least one Scar" },
};

const SAVE_KEY = "epistemic-weight-table-v1";
let state = null;                                // live game, persisted
let setup = { scenarioId: null, chars: [] };     // pre-game picks, not persisted

// ---------- utilities ----------------------------------------------------

const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, ch =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cardsOf = type => M.cards.filter(c => c.type === type).map(c => c.id);
const charName = id => id.replace(/^(char|core)_/, "").replace(/_/g, " ");
const isRegard = id => CARD[id].type.startsWith("regard");

function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}

// ---------- game construction --------------------------------------------

function beliefEntry(over) {
  return Object.assign(
    { ring: "held", conviction: 2, suns: 0, eclipses: 0, breath: 0, scars: 0, owner: null, boundTo: null },
    over);
}

function newGame(scenarioId, chars) {
  const sc = SCENARIOS[scenarioId];
  const players = chars.map(c => ({ charId: c, name: charName(c) }));

  const beliefDeck = shuffle([...cardsOf("regard"), ...cardsOf("regard-blank"), ...cardsOf("tenet")]);
  const hands = players.map(() => beliefDeck.splice(0, 3));

  // Story deck per the scenario recipe; Climax shuffled into the bottom three.
  const picks = shuffle([
    ...shuffle(cardsOf("story-corroboration")).slice(0, sc.c),
    ...shuffle(cardsOf("story-rupture")).slice(0, sc.r),
    ...shuffle(cardsOf("story-crossroads")).slice(0, sc.x),
  ]);
  picks.splice(picks.length - Math.floor(Math.random() * 3), 0, "story_climax");

  const board = {};
  players.forEach((p, i) => {
    board["core_" + p.charId.slice(5)] = beliefEntry({ ring: "weighing", conviction: 4, owner: i });
  });

  state = {
    phase: "play", scenarioId, chapter: 0, players, activePlayer: 0, hands,
    beliefDeck, storyDeck: picks, storyDiscard: [], board, spotlight: null, forgotten: [],
  };
  save();
  render();
}

// ---------- game actions --------------------------------------------------

function dawn() {
  if (!state.storyDeck.length) {
    openTestament(); // the story is told — time to read the creed
    return;
  }
  state.chapter++;
  const id = state.storyDeck.shift();
  state.storyDiscard.push(id);
  save();
  render();
  openStory(id);
}

function dusk() {
  if (!confirm("Dusk: clear every Breath; each belief without a Breath slides outward one ring. Proceed?")) return;
  for (const id of Object.keys(state.board)) {
    const b = state.board[id];
    if (b.breath) { b.breath = 0; continue; }
    const i = RINGS.indexOf(b.ring);
    if (i < RINGS.length - 1) b.ring = RINGS[i + 1];
    else if (!id.startsWith("core_")) forget(id);   // Cores linger in Fading; forget them by hand if you must
  }
  save();
  render();
}

function forget(id) {
  delete state.board[id];
  state.forgotten.push(id);
  if (state.spotlight === id) state.spotlight = null;
}

function remember(id) {
  state.forgotten = state.forgotten.filter(x => x !== id);
  let boundTo = null;
  if (isRegard(id)) boundTo = prompt("Remembered — who is this belief about now?") || null;
  state.board[id] = beliefEntry({ ring: "fading", conviction: 1, boundTo });
}

function voice(id) {
  const hand = state.hands[state.activePlayer];
  const at = hand.indexOf(id);
  if (at === -1) return;
  let boundTo = null;
  if (isRegard(id)) {
    boundTo = prompt("Bind the blank — who is this belief about?\n(" +
      state.players.map(p => p.name).join(", ") + ")") || null;
  }
  hand.splice(at, 1);
  state.board[id] = beliefEntry({ ring: "held", conviction: 2, breath: 1, owner: state.activePlayer, boundTo });
  save();
  closeModal();
  render();
}

// ---------- the Testament ---------------------------------------------------
// Shadow partners sit on adjacent ids: regard_01⇄02 … 07⇄08 (the first 8),
// tenet_01⇄02 … 11⇄12 (every tenet) — mirrors EW_REGARDS / EW_TENETS.

function shadowOf(id) {
  const m = id.match(/^(regard|tenet)_(\d\d)$/);
  if (!m) return null;
  const n = +m[2];
  if (m[1] === "regard" && n > 8) return null;
  return `${m[1]}_${String(n % 2 ? n + 1 : n - 1).padStart(2, "0")}`;
}

const boundKey = b => (b.boundTo || "").trim().toLowerCase();

function computeTestament() {
  const carried = Object.keys(state.board)
    .filter(id => state.board[id].ring === "weighing" || state.board[id].ring === "held");
  const rows = carried.map(id => {
    const b = state.board[id];
    if (b.scars >= 3) return { id, verdict: "OPEN QUESTION", cls: "open", pts: 0 };
    const sh = shadowOf(id);
    const shadowCarried = sh && carried.includes(sh) &&
      (!isRegard(id) || (boundKey(b) && boundKey(b) === boundKey(state.board[sh])));
    if (shadowCarried) return { id, verdict: "SHADOW PAIR — BROKEN", cls: "broken", pts: -2 * b.conviction };
    if (b.suns >= b.eclipses) return { id, verdict: "HELD TRUE", cls: "true", pts: b.conviction };
    return { id, verdict: "BROKEN", cls: "broken", pts: -2 * b.conviction };
  });
  const total = rows.reduce((t, r) => t + r.pts, 0);
  return { rows, total, threshold: 8 + 3 * state.players.length };
}

let needMet = false; // the scenario's Need is the players' call — toggled in the modal

function openTestament() {
  const sc = SCENARIOS[state.scenarioId];
  const { rows, total, threshold } = computeTestament();
  const win = total >= threshold && needMet;
  const list = rows.map(r => {
    const b = state.board[r.id];
    return `
    <div class="t-row">
      <img src="${IMG(r.id)}" alt="">
      <span class="t-verdict ${r.cls}">${r.verdict}</span>
      <span class="t-detail">${TOK_LINE(b)}</span>
      <span class="t-pts ${r.pts < 0 ? "broken" : r.pts ? "true" : "open"}">${r.pts > 0 ? "+" : ""}${r.pts}</span>
    </div>`;
  }).join("") || `<p class="hint">Nothing is carried — the Testament is silence.</p>`;
  openModal(`
    <div class="controls testament">
      <div class="crow"><b>THE TESTAMENT</b>
        <span class="stat">Weighing + Held are carried · read each aloud, in character, then judge</span></div>
      ${list}
      <div class="crow t-total">
        <span>Total <b class="${total >= threshold ? "true" : "broken"}">${total}</b> / needs ${threshold}
          (8 + 3 × ${state.players.length} players)</span>
      </div>
      <div class="crow">
        <button data-action="testament-need">${needMet ? "☑" : "☐"} The Need is met: <i>${esc(sc.need)}</i></button>
      </div>
      <div class="crow t-banner ${win ? "win" : "lose"}">
        ${win ? "THE PARTY ARRIVES TRUE — the creed holds." :
          "THE PARTY FALLS SHORT — still believing what the story disproved."}
      </div>
      <div class="crow"><span class="hint">Run the final Dusk before scoring. Fading is left on the road; Forgotten is gone.</span>
        <button data-action="close">close</button></div>
    </div>`);
}

const TOK_LINE = b =>
  `Conviction ${b.conviction} · ☀${b.suns} vs 🌑${b.eclipses}${b.scars ? ` · ⚡${b.scars}` : ""}${b.boundTo ? ` · about ${esc(b.boundTo)}` : ""}`;

function moveRing(id, dir) {
  const b = state.board[id];
  const i = RINGS.indexOf(b.ring) + dir;
  if (i < 0) return;
  if (i >= RINGS.length) {
    if (confirm("Slide past Fading — this belief is FORGOTTEN (face-down pile, tokens lost). Proceed?")) {
      forget(id); save(); closeModal(); render();
    }
    return;
  }
  b.ring = RINGS[i];
  save(); render(); openBoard(id);
}

function bump(id, key, delta, max) {
  const b = state.board[id];
  b[key] = Math.max(0, Math.min(max, b[key] + delta));
  save(); render(); openBoard(id);
}

// ---------- rendering: setup ----------------------------------------------

function renderSetup() {
  const scen = cardsOf("scenario").map(id => `
    <div class="pick ${setup.scenarioId === id ? "picked" : ""}" data-action="pick-scenario" data-id="${id}">
      <img src="${IMG(id)}" alt="${esc(SCENARIOS[id].title)}">
    </div>`).join("");

  const chars = cardsOf("character").map(id => {
    const n = setup.chars.indexOf(id);
    return `
    <div class="pick ${n >= 0 ? "picked" : ""}" data-action="pick-char" data-id="${id}">
      <img src="${IMG(id)}" alt="${esc(charName(id))}">
      ${n >= 0 ? `<span class="order">${n + 1}</span>` : ""}
    </div>`;
  }).join("");

  const sc = SCENARIOS[setup.scenarioId];
  const ready = setup.scenarioId && setup.chars.length >= 2;

  $("#app").innerHTML = `
    <div class="topbar"><span class="brand">EPISTEMIC WEIGHT</span><span class="sub">set the table</span></div>
    <section class="setup">
      <h2>1 · Choose the scenario</h2>
      <div class="pick-row">${scen}</div>
      ${sc ? `<p class="hint">${sc.diff} — story deck ${sc.c} Corroboration / ${sc.r} Rupture / ${sc.x} Crossroads + the Climax.
        <b>The Need:</b> ${esc(sc.need)}</p>` : ""}
      <h2>2 · Choose 2–5 characters, in seating order</h2>
      <div class="pick-row">${chars}</div>
      <p class="hint">Each Core Belief starts in the Weighing ring with 4 Conviction. Everyone is dealt 3 belief cards.</p>
      <button class="big" data-action="begin" ${ready ? "" : "disabled"}>Begin — Chapter One awaits</button>
    </section>`;
}

// ---------- rendering: play -----------------------------------------------

function chip(src, n, cls) {
  return n ? `<span class="chip ${cls || ""}"><img src="${src}" alt="">×${n}</span>` : "";
}

function boardThumb(id) {
  const b = state.board[id];
  const tilt = Math.min(b.scars, 3) * 8;
  return `
  <div class="thumb ${state.spotlight === id ? "lit" : ""}" data-action="open-board" data-id="${id}"
       style="transform: rotate(${tilt}deg)">
    <img class="face" src="${IMG(id)}" alt="">
    <span class="conv" title="Conviction">${b.conviction}</span>
    ${b.breath ? `<img class="breath" src="${TOKEN.breath}" title="Spoken this chapter" alt="breath">` : ""}
    ${state.spotlight === id ? `<img class="spot" src="${TOKEN.spotlight}" title="Spotlight" alt="spotlight">` : ""}
    <span class="chips">
      ${chip(TOKEN.sun, b.suns)}${chip(TOKEN.eclipse, b.eclipses)}
      ${b.scars >= 3 ? `<span class="chip openq">OPEN ?</span>` : b.scars ? `<span class="chip scar">⚡${b.scars}</span>` : ""}
    </span>
    ${b.boundTo ? `<span class="bound">${esc(b.boundTo)}</span>` : ""}
  </div>`;
}

function zone(ring) {
  const ids = Object.keys(state.board).filter(id => state.board[id].ring === ring);
  return `<div class="zone">${ids.map(boardThumb).join("") || `<span class="empty">·</span>`}</div>`;
}

function renderPlay() {
  const sc = SCENARIOS[state.scenarioId];
  const current = state.storyDiscard[state.storyDiscard.length - 1];
  const p = state.players[state.activePlayer];

  const tabs = state.players.map((pl, i) => `
    <button class="tab ${i === state.activePlayer ? "active" : ""}" data-action="tab" data-i="${i}">
      ${esc(pl.name)}<span class="count">${state.hands[i].length}</span>
    </button>`).join("");

  const hand = state.hands[state.activePlayer].map(id => `
    <div class="thumb" data-action="open-hand" data-id="${id}"><img class="face" src="${IMG(id)}" alt=""></div>`
  ).join("") || `<span class="empty">an empty hand</span>`;

  $("#app").innerHTML = `
    <div class="topbar">
      <span class="brand">EPISTEMIC WEIGHT</span>
      <span class="sub">${esc(sc.title)} ${sc.diff} · ${state.chapter ? "Chapter " + state.chapter : "before the first Dawn"}</span>
      <span class="spacer"></span>
      <button data-action="dawn" title="Advance the chapter and draw a Story card">🌅 Dawn</button>
      <button data-action="dusk" title="Clear Breath; unspoken beliefs fade outward">🌘 Dusk</button>
      <button data-action="testament" title="Score the carried beliefs">⚖ Testament</button>
      <button data-action="reference" title="The Chapter / Rites & Testament">📜 Reference</button>
      <button data-action="restart" title="Wipe the table and start over">↺ Restart</button>
    </div>

    <div class="ring fading"><span class="ring-label">FADING</span>${zone("fading")}
      <div class="ring held"><span class="ring-label">HELD</span>${zone("held")}
        <div class="ring weighing"><span class="ring-label">WEIGHING</span>${zone("weighing")}
          <div class="story-center">
            <span class="ring-label gold">⊙ THE STORY</span>
            <div class="story-piles">
              <div class="thumb deck" data-action="dawn" title="Draw the next Story card (Dawn)">
                <img class="face" src="${BACK}" alt="story deck"><span class="count">${state.storyDeck.length}</span>
              </div>
              ${current ? `<div class="thumb" data-action="open-story" data-id="${current}" title="This chapter's Story card">
                <img class="face" src="${IMG(current)}" alt=""></div>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table-edge">
      <div class="tabs">${tabs}</div>
      <div class="hand-row">
        <div class="thumb char" data-action="open-static" data-id="${p.charId}" title="Your character">
          <img class="face" src="${IMG(p.charId)}" alt=""></div>
        <div class="hand">${hand}</div>
        <div class="side-piles">
          <button data-action="draw-belief" ${state.beliefDeck.length ? "" : "disabled"}
            title="Draw a belief card to ${esc(p.name)}'s hand">Draw belief · ${state.beliefDeck.length}</button>
          <button data-action="open-forgotten" title="The face-down pile off the board">
            Forgotten · ${state.forgotten.length}</button>
        </div>
      </div>
      <p class="hint"><b>The Need:</b> ${esc(sc.need)} · click any card to zoom &amp; act · Scars tilt the card, 3 = Open Question</p>
    </div>`;
}

function render() {
  if (state && state.phase === "play") renderPlay();
  else renderSetup();
}

// ---------- modal ----------------------------------------------------------

function openModal(html) {
  $("#modal-panel").innerHTML = html;
  $("#modal").classList.remove("hidden");
}
function closeModal() { $("#modal").classList.add("hidden"); }

function openBoard(id) {
  const b = state.board[id];
  if (!b) return;
  const owner = b.owner === null ? "" : ` · ${esc(state.players[b.owner].name)}'s`;
  openModal(`
    <img class="zoom" src="${IMG(id)}" alt="" style="transform: rotate(${Math.min(b.scars, 3) * 8}deg)">
    <div class="controls">
      <div class="crow"><b>${b.ring.toUpperCase()}</b>${owner}${b.boundTo ? ` · about <b>${esc(b.boundTo)}</b>` : ""}</div>
      <div class="crow">
        <button data-action="bump" data-id="${id}" data-k="conviction" data-d="-1">−</button>
        <span class="stat">Conviction ${b.conviction}</span>
        <button data-action="bump" data-id="${id}" data-k="conviction" data-d="1">+</button>
      </div>
      <div class="crow">
        <button data-action="bump" data-id="${id}" data-k="suns" data-d="-1">−</button>
        <span class="stat"><img src="${TOKEN.sun}" alt=""> Sun ${b.suns}</span>
        <button data-action="bump" data-id="${id}" data-k="suns" data-d="1">+</button>
        <button data-action="bump" data-id="${id}" data-k="eclipses" data-d="-1">−</button>
        <span class="stat"><img src="${TOKEN.eclipse}" alt=""> Eclipse ${b.eclipses}</span>
        <button data-action="bump" data-id="${id}" data-k="eclipses" data-d="1">+</button>
      </div>
      <div class="crow">
        <button data-action="breath" data-id="${id}">${b.breath ? "Clear Breath" : "Lay Breath (Spoken)"}</button>
        <button data-action="spot" data-id="${id}">${state.spotlight === id ? "Remove Spotlight" : "Spotlight here"}</button>
        <button data-action="bump" data-id="${id}" data-k="scars" data-d="1">+ Scar (Revise)</button>
        ${b.scars ? `<button data-action="bump" data-id="${id}" data-k="scars" data-d="-1">− Scar</button>` : ""}
      </div>
      <div class="crow">
        <button data-action="ring" data-id="${id}" data-d="-1" ${b.ring === "weighing" ? "disabled" : ""}>⟵ inward</button>
        <button data-action="ring" data-id="${id}" data-d="1">outward ⟶${b.ring === "fading" ? " (forget)" : ""}</button>
        ${isRegard(id) ? `<button data-action="bind" data-id="${id}">Re-bind ____</button>` : ""}
        <button data-action="close">close</button>
      </div>
    </div>`);
}

function openHand(id) {
  openModal(`
    <img class="zoom" src="${IMG(id)}" alt="">
    <div class="controls"><div class="crow">
      <button class="big" data-action="voice" data-id="${id}">
        VOICE — “I believe…” · enters Held with 2 Conviction + a Breath</button>
      <button data-action="close">close</button>
    </div></div>`);
}

function openStory(id) {
  const t = CARD[id].type;
  const note = {
    "story-corroboration": "Lay a SUN on the Spotlight belief.",
    "story-rupture": "Lay an ECLIPSE — the owner's first action must answer: REVISE or DOUBLE DOWN.",
    "story-crossroads": "The party chooses A or B, together, aloud — then apply it to the board.",
    "story-climax": "THE TESTAMENT — last chapter. See the Rites reference for scoring.",
  }[t];
  openModal(`
    <img class="zoom" src="${IMG(id)}" alt="">
    <div class="controls"><div class="crow"><span class="stat">${esc(note)}</span>
      <button data-action="close">close</button></div></div>`);
}

function openStatic(id) {
  openModal(`
    <img class="zoom" src="${IMG(id)}" alt="">
    <div class="controls"><div class="crow"><button data-action="close">close</button></div></div>`);
}

function openForgotten() {
  const thumbs = state.forgotten.map(id => `
    <div class="thumb" data-action="remember" data-id="${id}" title="Remember: return to Fading with 1 Conviction">
      <img class="face" src="${IMG(id)}" alt=""></div>`).join("")
    || `<span class="empty">nothing is forgotten — yet</span>`;
  openModal(`
    <div class="controls">
      <div class="crow"><b>FORGOTTEN</b><span class="stat">click a card to Remember it (Fading, 1 Conviction)</span></div>
      <div class="crow wrap">${thumbs}</div>
      <div class="crow"><button data-action="close">close</button></div>
    </div>`);
}

function openReference() {
  openModal(`
    <div class="ref-pair">
      <img class="zoom" src="${IMG("reference_chapter_1")}" alt="The Chapter">
      <img class="zoom" src="${IMG("reference_rites_1")}" alt="Rites & The Testament">
    </div>
    <div class="controls"><div class="crow"><button data-action="close">close</button></div></div>`);
}

// ---------- events ----------------------------------------------------------

document.addEventListener("click", e => {
  if (e.target === $("#modal")) { closeModal(); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const d = el.dataset;
  switch (d.action) {
    case "pick-scenario": setup.scenarioId = d.id; renderSetup(); break;
    case "pick-char": {
      const i = setup.chars.indexOf(d.id);
      if (i >= 0) setup.chars.splice(i, 1);
      else if (setup.chars.length < 5) setup.chars.push(d.id);
      renderSetup(); break;
    }
    case "begin": if (setup.scenarioId && setup.chars.length >= 2) newGame(setup.scenarioId, setup.chars); break;

    case "dawn": dawn(); break;
    case "dusk": dusk(); break;
    case "restart":
      if (confirm("Wipe the table and set up a new game?")) {
        localStorage.removeItem(SAVE_KEY); state = null; setup = { scenarioId: null, chars: [] }; render();
      }
      break;
    case "tab": state.activePlayer = +d.i; save(); render(); break;
    case "draw-belief": {
      const id = state.beliefDeck.shift();
      if (id) { state.hands[state.activePlayer].push(id); save(); render(); }
      break;
    }

    case "open-board": openBoard(d.id); break;
    case "open-hand": openHand(d.id); break;
    case "open-story": openStory(d.id); break;
    case "open-static": openStatic(d.id); break;
    case "open-forgotten": openForgotten(); break;
    case "reference": openReference(); break;
    case "testament": needMet = false; openTestament(); break;
    case "testament-need": needMet = !needMet; openTestament(); break;
    case "close": closeModal(); break;

    case "voice": voice(d.id); break;
    case "bump": bump(d.id, d.k, +d.d, d.k === "conviction" ? 5 : 99); break;
    case "ring": moveRing(d.id, +d.d); break;
    case "breath": {
      const b = state.board[d.id]; b.breath = b.breath ? 0 : 1;
      save(); render(); openBoard(d.id); break;
    }
    case "spot":
      state.spotlight = state.spotlight === d.id ? null : d.id;
      save(); render(); openBoard(d.id); break;
    case "bind": {
      const to = prompt("Bind the blank — who is this belief about?");
      if (to !== null) { state.board[d.id].boundTo = to || null; save(); render(); openBoard(d.id); }
      break;
    }
    case "remember": remember(d.id); save(); closeModal(); render(); break;
  }
});

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ---------- boot -------------------------------------------------------------

state = loadSave();
if (state && state.phase !== "play") state = null;
if (!state && location.search.includes("demo")) {
  // ?demo — jump straight to a live table (useful for previewing the layout)
  newGame("scenario_THE_LONG_ROAD", ["char_THE_SEEKER", "char_THE_WARDEN", "char_THE_TRICKSTER"]);
} else {
  render();
}
