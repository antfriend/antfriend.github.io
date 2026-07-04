"use strict";
/* Resonance — one-page digital table.
 * Unlike its sandbox sibling (Epistemic Weight), this app enforces the rules,
 * because the rules ARE the data: cards land only along printed TTDB edges,
 * markers come from a finite supply, and the story is judged by graph search.
 * State persists in localStorage; Restart wipes it.
 */

const M = window.RES_MANIFEST;
const FIELD = M.field;                 // { nodes: {name:{lat,lon}}, edges: [{a,b,type,marker}], mirrors: [[light,dark]] }
const CARD = Object.fromEntries(M.cards.map(c => [c.id, c]));
const IMG = id => "images/" + CARD[id].file;
const BACK = "images/" + M.cardBack;
const TOKEN = Object.fromEntries(M.tokens.map(t => [t.id, "images/" + t.file]));
const SUPPLY0 = { resonate: 14, deepen: 10, become: 8, enable: 6, bridge: 4 };

// Stories — opening, destination, and the clause as a machine check (§7).
const STORIES = {
  story_RISING_STORM: { title: "Rising Storm", diff: "◆", opening: "Disappointment", node: "Rage",
    clause: "no Bridges — stay inside the storm", check: { excludeBridges: true } },
  story_THE_QUIET_SUMMIT: { title: "The Quiet Summit", diff: "◆", opening: "Pride", node: "Bliss",
    clause: "never place a card with negative valence", check: {}, noNegative: true },
  story_OUT_OF_THE_DARK: { title: "Out of the Dark", diff: "◆◆", opening: "Unease", node: "Hope",
    clause: "the chain must use at least 1 Bridge", check: { minBridges: 1 } },
  story_THE_WATCH_BEYOND_THE_WALL: { title: "The Watch Beyond the Wall", diff: "◆◆", opening: "Suspicion", node: "To Connect",
    clause: "the chain may not use the Openness↔Suspicion Bridge", check: { forbidPair: ["Openness", "Suspicion"] } },
  story_THE_LONG_GRIEF: { title: "The Long Grief", diff: "◆◆◆", opening: "Melancholy", node: "Gratitude",
    clause: "the chain may not use the Gratitude↔Melancholy Bridge", check: { forbidPair: ["Gratitude", "Melancholy"] } },
  story_THE_MIRROR_PATH: { title: "The Mirror Path", diff: "◆◆◆", opening: "Curiosity", node: "Indifference",
    clause: "no Curiosity↔Indifference Bridge, and the chain must use 2 Bridges",
    check: { forbidPair: ["Curiosity", "Indifference"], minBridges: 2 } },
  story_THE_HERO_S_ARC: { title: "The Hero's Arc", diff: "◆◆◆◆", opening: "Serenity", node: "Joy",
    clause: "the chain must pass through at least 2 negative-valence cards", check: { minNegative: 2 } },
};

// Characters — affinity region (draw 2 after playing there) and once-per-game power (§8).
const CHARS = {
  char_THE_SEEKER: { name: "THE SEEKER", affinity: "East", region: n => n.lon > 0,
    power: "foresight", powerName: "Foresight", powerHint: "look at the top 5, take 1, return the rest in order" },
  char_THE_WARDEN: { name: "THE WARDEN", affinity: "South", region: n => n.lat < 0,
    power: "salvage", powerName: "Salvage", powerHint: "take any 1 card from the discard pile" },
  char_THE_HEALER: { name: "THE HEALER", affinity: "North", region: n => n.lat > 0,
    power: "mend", powerName: "Mend", powerHint: "redistribute your cards among teammates" },
  char_THE_GIVER: { name: "THE GIVER", affinity: "Northeast", region: n => n.lat > 0 && n.lon > 0,
    power: "openhand", powerName: "Open Hand", powerHint: "standing — may Bridge alone (both discards hers)" },
  char_THE_HERMIT: { name: "THE HERMIT", affinity: "West", region: n => n.lon < 0,
    power: "stillpoint", powerName: "Still Point", powerHint: "take one extra full action this turn" },
  char_THE_TRICKSTER: { name: "THE TRICKSTER", affinity: "Southwest", region: n => n.lat < 0 && n.lon < 0,
    power: "sleight", powerName: "Sleight", powerHint: "lift one placed card back to your hand; its markers return to the supply (digital adaptation)" },
};

const MARKER_COLOR = { resonate: "#6cc5bc", deepen: "#d98f4a", become: "#b48fd9", enable: "#d9c84a", bridge: "#e86a6a" };
const HAND_CAP = 7;
const SAVE_KEY = "resonance-table-v1";

let state = null;
let setup = { storyId: null, chars: [] };
let wiz = null;          // transient modal wizard state (play / bridge / powers)
let lastChain = null;    // highlighted after a judgment

// ---------- utilities -------------------------------------------------------

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
const nodeOf = id => CARD[id].node;                      // feeling card -> field node name
const valence = node => FIELD.nodes[node].lat;           // >0 light, <0 dark
const story = () => STORIES[state.storyId];
const me = () => state.players[state.activePlayer];
const myChar = () => CHARS[me().charId];
const myHand = () => state.hands[state.activePlayer];

function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}

// ---------- game construction ------------------------------------------------

function newGame(storyId, chars) {
  const st = STORIES[storyId];
  const deck = shuffle(cardsOf("feeling"));
  const openIdx = deck.findIndex(id => nodeOf(id) === st.opening);
  const openingCard = deck.splice(openIdx, 1)[0];
  const players = chars.map(c => ({ charId: c, powerUsed: false }));
  const handSize = players.length <= 2 ? 5 : 4;
  const hands = players.map(() => deck.splice(0, handSize));
  state = {
    phase: "play", storyId, players, activePlayer: 0, hands, deck, discard: [],
    placed: { [st.opening]: openingCard },
    links: [], supply: { ...SUPPLY0 },
    turn: { actions: 1, affinity: false, discarding: false },
    finalTurns: null, negativePlaced: false,
  };
  lastChain = null;
  save();
  render();
}

// ---------- rules helpers -----------------------------------------------------

// Printed connections a hand card would make to the current tableau.
function connectionsFor(cardId) {
  const node = nodeOf(cardId);
  if (!node || state.placed[node]) return [];
  return FIELD.edges.filter(e =>
    (e.a === node && state.placed[e.b]) || (e.b === node && state.placed[e.a]));
}

const playable = cardId => connectionsFor(cardId).some(e => state.supply[e.marker] > 0);

function bridgeablePairs() {
  return FIELD.mirrors.filter(([l, d]) =>
    state.placed[l] && state.placed[d] &&
    !state.links.some(k => k.marker === "bridge" && samePair(k, [l, d])));
}

const samePair = (link, [x, y]) =>
  (link.a === x && link.b === y) || (link.a === y && link.b === x);

// Depth-first search for a marker-chain Opening -> Story node satisfying the clause.
function findChain(check) {
  const adj = {};
  for (const l of state.links) {
    if (check.excludeBridges && l.marker === "bridge") continue;
    if (check.forbidPair && l.marker === "bridge" && samePair(l, check.forbidPair)) continue;
    (adj[l.a] ||= []).push(l);
    (adj[l.b] ||= []).push(l);
  }
  const start = story().opening, target = story().node;
  let found = null, steps = 0;
  const path = [start], used = new Set([start]);
  (function dfs(cur, bridges) {
    if (found || ++steps > 400000) return;
    if (cur === target) {
      const negs = path.filter(n => valence(n) < 0).length;
      if (bridges >= (check.minBridges || 0) && negs >= (check.minNegative || 0)) found = [...path];
      return;
    }
    for (const l of adj[cur] || []) {
      const nxt = l.a === cur ? l.b : l.a;
      if (used.has(nxt)) continue;
      used.add(nxt); path.push(nxt);
      dfs(nxt, bridges + (l.marker === "bridge" ? 1 : 0));
      used.delete(nxt); path.pop();
    }
  })(start, 0);
  return found;
}

function judgment() {
  const st = story();
  if (st.noNegative && state.negativePlaced) return { won: false, why: "a negative-valence card was placed — the summit clouded over" };
  const chain = findChain(st.check);
  if (chain) return { won: true, chain };
  return { won: false, why: "no unbroken marker-chain satisfies the story — yet" };
}

// ---------- turn engine ---------------------------------------------------------

function draw(n) {
  const hand = myHand();
  while (n-- > 0 && state.deck.length) hand.push(state.deck.shift());
  if (!state.deck.length && state.finalTurns === null) {
    state.finalTurns = state.players.length + 1; // everyone gets one last turn, ending with this drawer
  }
}

function spendAction() {
  state.turn.actions--;
  const j = judgment();
  if (j.won) { save(); render(); openJudgment(j); return true; }
  return false;
}

function endTurn() {
  draw(state.turn.affinity ? 2 : 1);
  if (myHand().length > HAND_CAP) {
    state.turn.discarding = true;
    save(); render();
    return;
  }
  advance();
}

function advance() {
  state.activePlayer = (state.activePlayer + 1) % state.players.length;
  state.turn = { actions: 1, affinity: false, discarding: false };
  if (state.finalTurns !== null && --state.finalTurns <= 0) {
    save(); render(); openJudgment(judgment());
    return;
  }
  save(); render();
}

function place(cardId, chosen) {
  const node = nodeOf(cardId);
  const hand = myHand();
  hand.splice(hand.indexOf(cardId), 1);
  state.placed[node] = cardId;
  for (const e of chosen) {
    state.supply[e.marker]--;
    state.links.push({ a: e.a, b: e.b, marker: e.marker });
  }
  if (valence(node) < 0) state.negativePlaced = true;
  if (myChar().region(FIELD.nodes[node])) state.turn.affinity = true;
  closeModal();
  if (!spendAction()) { save(); render(); }
}

function layBridge(pair, discardA, ownerA, discardB, ownerB) {
  for (const [pid, cid] of [[ownerA, discardA], [ownerB, discardB]]) {
    const h = state.hands[pid];
    h.splice(h.indexOf(cid), 1);
    state.discard.push(cid);
  }
  state.supply.bridge--;
  state.links.push({ a: pair[0], b: pair[1], marker: "bridge" });
  closeModal();
  if (!spendAction()) { save(); render(); }
}

// ---------- rendering: setup ------------------------------------------------------

function renderSetup() {
  const stories = cardsOf("story").map(id => `
    <div class="pick ${setup.storyId === id ? "picked" : ""}" data-action="pick-story" data-id="${id}">
      <img src="${IMG(id)}" alt="${esc(STORIES[id].title)}">
    </div>`).join("");
  const chars = cardsOf("character").map(id => {
    const n = setup.chars.indexOf(id);
    return `
    <div class="pick ${n >= 0 ? "picked" : ""}" data-action="pick-char" data-id="${id}">
      <img src="${IMG(id)}" alt="${esc(CHARS[id].name)}">
      ${n >= 0 ? `<span class="order">${n + 1}</span>` : ""}
    </div>`;
  }).join("");
  const st = STORIES[setup.storyId];
  const ready = setup.storyId && setup.chars.length >= 1;
  $("#app").innerHTML = `
    <div class="topbar"><span class="brand">RESONANCE</span><span class="sub">tune the field</span></div>
    <section class="setup">
      <h2>1 · Choose the story</h2>
      <div class="pick-row">${stories}</div>
      ${st ? `<p class="hint">${st.diff} — <b>${esc(st.opening)} → ${esc(st.node)}</b>. Clause: ${esc(st.clause)}.</p>` : ""}
      <h2>2 · Choose 1–5 characters, in seating order</h2>
      <div class="pick-row">${chars}</div>
      <p class="hint">Cooperative. Cards land only along printed TTDB edges; markers are finite — spend them like breath.</p>
      <button class="big" data-action="begin" ${ready ? "" : "disabled"}>Begin — place the Opening</button>
    </section>`;
}

// ---------- rendering: the field ----------------------------------------------------

const px = lon => (lon + 52) / 104 * 1000;
const py = lat => (52 - lat) / 104 * 620;

function fieldSVG() {
  const st = story();
  const lines = state.links.map(l => {
    const A = FIELD.nodes[l.a], B = FIELD.nodes[l.b];
    const onChain = lastChain && lastChain.includes(l.a) && lastChain.includes(l.b) &&
      Math.abs(lastChain.indexOf(l.a) - lastChain.indexOf(l.b)) === 1;
    const mx = (px(A.lon) + px(B.lon)) / 2, my = (py(A.lat) + py(B.lat)) / 2;
    return `
      <line x1="${px(A.lon)}" y1="${py(A.lat)}" x2="${px(B.lon)}" y2="${py(B.lat)}"
        stroke="${onChain ? "#ffd97a" : MARKER_COLOR[l.marker]}" stroke-width="${onChain ? 7 : 4}"
        ${l.marker === "bridge" ? 'stroke-dasharray="10 7"' : ""} opacity="0.9"/>
      <image href="${TOKEN[l.marker]}" x="${mx - 14}" y="${my - 15}" width="28" height="30"/>`;
  }).join("");
  const dots = Object.entries(FIELD.nodes)
    .filter(([n]) => !state.placed[n])
    .map(([n, c]) => `<circle cx="${px(c.lon)}" cy="${py(c.lat)}" r="5" fill="#3d3a55"><title>${esc(n)}</title></circle>`)
    .join("");
  const tgt = FIELD.nodes[st.node];
  return `
  <svg viewBox="0 0 1000 620" preserveAspectRatio="none">
    <line x1="0" y1="${py(0)}" x2="1000" y2="${py(0)}" stroke="#5a536e" stroke-width="2" stroke-dasharray="14 10"/>
    <text x="12" y="${py(0) - 8}" class="wall-label">THE WALL — only Bridges cross</text>
    <text x="500" y="26" class="compass">N · positive</text>
    <text x="500" y="608" class="compass">S · negative</text>
    <text x="26" y="315" class="compass">W · self</text>
    <text x="974" y="315" class="compass">E · other</text>
    ${dots}
    ${state.placed[st.node] ? "" : `
      <circle cx="${px(tgt.lon)}" cy="${py(tgt.lat)}" r="34" fill="none" stroke="#ffd97a" stroke-width="2" stroke-dasharray="5 6"/>
      <image href="${TOKEN.beacon}" x="${px(tgt.lon) - 15}" y="${py(tgt.lat) - 38}" width="30" height="34"/>`}
    ${lines}
  </svg>`;
}

function fieldCards() {
  const st = story();
  return Object.entries(state.placed).map(([node, cardId]) => {
    const c = FIELD.nodes[node];
    const special = node === st.opening ? "opening" : node === st.node ? "target" : "";
    const onChain = lastChain && lastChain.includes(node);
    return `
    <div class="fcard ${special} ${onChain ? "chain" : ""}" data-action="zoom" data-id="${cardId}"
         style="left:${(c.lon + 52) / 104 * 100}%; top:${(52 - c.lat) / 104 * 100}%" title="${esc(node)}">
      <img src="${IMG(cardId)}" alt="${esc(node)}">
      ${node === st.node ? `<img class="beacon" src="${TOKEN.beacon}" alt="beacon">` : ""}
    </div>`;
  }).join("");
}

// ---------- rendering: play ----------------------------------------------------------

function renderPlay() {
  const st = story();
  const p = me(), ch = myChar();
  const t = state.turn;
  const supply = Object.keys(SUPPLY0).map(k => `
    <span class="chip ${state.supply[k] ? "" : "spent"}" title="${esc(M.tokens.find(x => x.id === k).purpose)}">
      <img src="${TOKEN[k]}" alt="">×${state.supply[k]}</span>`).join("");

  const tabs = state.players.map((pl, i) => `
    <button class="tab ${i === state.activePlayer ? "active" : ""}" data-action="tab-info" data-i="${i}">
      ${esc(CHARS[pl.charId].name)}<span class="count">${state.hands[i].length}</span>
    </button>`).join("");

  const hand = myHand().map(id => {
    const node = nodeOf(id);
    const dup = state.placed[node];
    const ok = playable(id);
    return `
    <div class="thumb ${t.discarding ? "discard-me" : ok ? "ok" : "dim"}"
         data-action="${t.discarding ? "discard" : "hand"}" data-id="${id}"
         title="${esc(node)}${dup ? " — already on the field (discard fuel)" : ok ? "" : " — no open edge yet"}">
      <img class="face" src="${IMG(id)}" alt="">
      ${dup ? `<span class="ribbon">on field</span>` : ""}
    </div>`;
  }).join("") || `<span class="empty">an empty hand</span>`;

  const canAct = t.actions > 0 && !t.discarding;
  const finalNote = state.finalTurns !== null ?
    ` · <b class="warn">final round — ${state.finalTurns} turn${state.finalTurns === 1 ? "" : "s"} left</b>` : "";

  $("#app").innerHTML = `
    <div class="topbar">
      <span class="brand">RESONANCE</span>
      <span class="sub">${esc(st.title)} ${st.diff} · ${esc(st.opening)} → ${esc(st.node)}</span>
      <span class="spacer"></span>
      <button data-action="story-card" title="The story card">${esc(st.title)} ⛿</button>
      <button data-action="judge" title="Search for a winning chain now">⚖ Judge</button>
      <button data-action="reference" title="Quick rules & the Mirror table">📜 Reference</button>
      <button data-action="restart">↺ Restart</button>
    </div>

    <div class="field">
      ${fieldSVG()}
      ${fieldCards()}
    </div>

    <div class="supply-row">${supply}
      <span class="chip" title="Draw deck"><img src="${BACK}" class="mini-back" alt="">×${state.deck.length}</span>
      <button data-action="discard-pile" ${state.discard.length ? "" : "disabled"}>discard · ${state.discard.length}</button>
    </div>

    <div class="table-edge">
      <div class="tabs">${tabs}</div>
      <div class="hand-row">
        <div class="thumb char" data-action="zoom" data-id="${p.charId}" title="${esc(ch.name)} — affinity ${ch.affinity}">
          <img class="face" src="${IMG(p.charId)}" alt=""></div>
        <div class="hand">${hand}</div>
        <div class="side-piles">
          <button data-action="bridge" ${canAct && bridgeablePairs().length && state.supply.bridge ? "" : "disabled"}
            title="Both mirrors on the field: discard one light + one dark to cross">⌒ Bridge</button>
          <button data-action="breathe" ${canAct && myHand().length ? "" : "disabled"}
            title="Discard 1, draw 2">〜 Breathe</button>
          <button data-action="power" ${p.powerUsed || ch.power === "openhand" ? "disabled" : ""}
            title="${esc(ch.powerHint)}">✦ ${esc(ch.powerName)}${p.powerUsed ? " — used" : ch.power === "openhand" ? " — standing" : ""}</button>
          <button class="end" data-action="end-turn" ${t.discarding ? "disabled" : ""}>
            End turn — draw ${t.affinity ? 2 : 1}</button>
        </div>
      </div>
      <p class="hint">
        ${t.discarding
          ? `<b class="warn">Hand cap ${HAND_CAP} — click cards to discard ${myHand().length - HAND_CAP} more.</b>`
          : `${esc(ch.name)}'s turn · ${t.actions} action${t.actions === 1 ? "" : "s"} left · affinity ${ch.affinity}: play there, draw 2${finalNote}`}
        · clause: <i>${esc(st.clause)}</i>
      </p>
    </div>`;
}

function render() {
  if (state && state.phase === "play") renderPlay();
  else renderSetup();
}

// ---------- modal --------------------------------------------------------------------

function openModal(html) {
  $("#modal-panel").innerHTML = html;
  $("#modal").classList.remove("hidden");
}
function closeModal() { wiz = null; $("#modal").classList.add("hidden"); }

function openZoom(id) {
  openModal(`
    <img class="zoom" src="${IMG(id)}" alt="">
    <div class="controls"><div class="crow"><button data-action="close">close</button></div></div>`);
}

function openPlay(cardId) {
  const conns = connectionsFor(cardId);
  if (!conns.length) { openZoom(cardId); return; }
  wiz = { kind: "play", cardId, chosen: conns.map(e => state.supply[e.marker] > 0) };
  // greedily uncheck when a marker type is oversubscribed
  const used = {};
  conns.forEach((e, i) => {
    if (!wiz.chosen[i]) return;
    used[e.marker] = (used[e.marker] || 0) + 1;
    if (used[e.marker] > state.supply[e.marker]) wiz.chosen[i] = false;
  });
  renderPlayWiz();
}

function renderPlayWiz() {
  const { cardId, chosen } = wiz;
  const node = nodeOf(cardId);
  const conns = connectionsFor(cardId);
  const rows = conns.map((e, i) => {
    const other = e.a === node ? e.b : e.a;
    const left = state.supply[e.marker];
    return `
    <button class="conn ${chosen[i] ? "on" : ""}" data-action="toggle-conn" data-i="${i}" ${left || chosen[i] ? "" : "disabled"}>
      <img src="${TOKEN[e.marker]}" alt=""> ${esc(e.type)} ⇄ <b>${esc(other)}</b>
      <span class="left">${left} left</span>
    </button>`;
  }).join("");
  const picked = conns.filter((e, i) => chosen[i]);
  const over = {};
  picked.forEach(e => { over[e.marker] = (over[e.marker] || 0) + 1; });
  const legal = picked.length >= 1 && Object.entries(over).every(([m, n]) => n <= state.supply[m]);
  const aff = myChar().region(FIELD.nodes[node]);
  openModal(`
    <img class="zoom" src="${IMG(cardId)}" alt="">
    <div class="controls">
      <div class="crow"><b>PLAY ${esc(node)}</b>
        <span class="stat">choose which printed edges to mark — each marker comes from the supply</span></div>
      ${rows}
      ${aff ? `<div class="crow stat">✦ in your affinity (${esc(myChar().affinity)}) — you'll draw 2</div>` : ""}
      <div class="crow">
        <button class="big" data-action="place" ${legal ? "" : "disabled"}>Place it</button>
        <button data-action="close">cancel</button>
      </div>
    </div>`);
}

// Bridge wizard: pick the mirror pair, then one light + one dark discard.
function openBridge() {
  wiz = { kind: "bridge", pair: null, first: null };
  renderBridgeWiz();
}

function renderBridgeWiz() {
  const pairs = bridgeablePairs();
  const giver = myChar().power === "openhand";
  const solo = state.players.length === 1;
  if (!wiz.pair) {
    openModal(`
      <div class="controls">
        <div class="crow"><b>BRIDGE THE MIRRORS</b>
          <span class="stat">${state.supply.bridge} Bridge marker${state.supply.bridge === 1 ? "" : "s"} left</span></div>
        ${pairs.map(([l, d], i) => `
          <button class="conn" data-action="pick-pair" data-i="${i}">
            ${esc(l)} <img src="${TOKEN.bridge}" alt=""> ${esc(d)}</button>`).join("")}
        <div class="crow"><span class="hint">Discard one light card and one dark card — yours plus a teammate's${giver ? " (the Giver may discard both herself)" : solo ? " (solo: both are yours)" : ""}.</span>
          <button data-action="close">cancel</button></div>
      </div>`);
    return;
  }
  // pick two discards of opposite valence, from any hands (self twice only for Giver/solo)
  const canSelf = giver || solo;
  const pickedFirst = wiz.first; // {pid, cardId} or null
  const lists = state.players.map((pl, pid) => {
    const cards = state.hands[pid].map(id => {
      const v = valence(nodeOf(id));
      const isPicked = pickedFirst && pickedFirst.pid === pid && pickedFirst.cardId === id;
      let ok = true;
      if (pickedFirst) {
        const sameHandTwice = pid === pickedFirst.pid;
        ok = !isPicked && (v > 0) !== (valence(nodeOf(pickedFirst.cardId)) > 0) &&
          (sameHandTwice ? canSelf && pid === state.activePlayer
                         : pid === state.activePlayer || pickedFirst.pid === state.activePlayer);
      }
      return `
      <div class="thumb ${isPicked ? "ok" : ok ? "" : "dim"}" data-action="pick-discard" data-pid="${pid}" data-id="${id}"
           title="${esc(nodeOf(id))} — ${v > 0 ? "light" : "dark"}">
        <img class="face" src="${IMG(id)}" alt=""></div>`;
    }).join("") || `<span class="empty">empty</span>`;
    return `<div class="crow wrap"><b class="who">${esc(CHARS[pl.charId].name)}</b>${cards}</div>`;
  }).join("");
  openModal(`
    <div class="controls">
      <div class="crow"><b>BRIDGE ${esc(wiz.pair[0])} ⌒ ${esc(wiz.pair[1])}</b>
        <span class="stat">${pickedFirst ? "now the opposite valence" : "pick the first discard"} — one light, one dark</span></div>
      ${lists}
      <div class="crow"><button data-action="close">cancel</button></div>
    </div>`);
}

function pickDiscard(pid, cardId) {
  const giver = myChar().power === "openhand";
  const solo = state.players.length === 1;
  const canSelf = giver || solo;
  if (!wiz.first) {
    wiz.first = { pid, cardId };
    renderBridgeWiz();
    return;
  }
  const a = wiz.first, b = { pid, cardId };
  if (a.pid === b.pid && a.cardId === b.cardId) return;
  const va = valence(nodeOf(a.cardId)) > 0, vb = valence(nodeOf(b.cardId)) > 0;
  if (va === vb) return;                                                             // one light, one dark
  if (a.pid === b.pid && !(canSelf && a.pid === state.activePlayer)) return;         // both from one hand: Giver/solo, and it's hers
  if (a.pid !== b.pid && a.pid !== state.activePlayer && b.pid !== state.activePlayer) return; // one side is yours
  layBridge(wiz.pair, a.cardId, a.pid, b.cardId, b.pid);
}

function openBreathe() {
  wiz = { kind: "breathe" };
  openModal(`
    <div class="controls">
      <div class="crow"><b>BREATHE</b><span class="stat">discard 1, draw 2 — sometimes the field needs quiet</span></div>
      <div class="crow wrap">${myHand().map(id => `
        <div class="thumb" data-action="breathe-pick" data-id="${id}" title="${esc(nodeOf(id))}">
          <img class="face" src="${IMG(id)}" alt=""></div>`).join("")}</div>
      <div class="crow"><button data-action="close">cancel</button></div>
    </div>`);
}

// ---------- powers ---------------------------------------------------------------------

function openPower() {
  const ch = myChar();
  switch (ch.power) {
    case "foresight": {
      const top = state.deck.slice(0, 5);
      if (!top.length) return;
      openModal(`
        <div class="controls">
          <div class="crow"><b>✦ FORESIGHT</b><span class="stat">take one; the rest return in order</span></div>
          <div class="crow wrap">${top.map(id => `
            <div class="thumb" data-action="foresight-pick" data-id="${id}" title="${esc(nodeOf(id))}">
              <img class="face" src="${IMG(id)}" alt=""></div>`).join("")}</div>
          <div class="crow"><button data-action="close">cancel</button></div>
        </div>`);
      break;
    }
    case "salvage":
      if (!state.discard.length) return;
      openModal(`
        <div class="controls">
          <div class="crow"><b>✦ SALVAGE</b><span class="stat">take any one card from the discard</span></div>
          <div class="crow wrap">${state.discard.map(id => `
            <div class="thumb" data-action="salvage-pick" data-id="${id}" title="${esc(nodeOf(id))}">
              <img class="face" src="${IMG(id)}" alt=""></div>`).join("")}</div>
          <div class="crow"><button data-action="close">cancel</button></div>
        </div>`);
      break;
    case "mend": {
      if (state.players.length < 2) return;
      wiz = wiz && wiz.kind === "mend" ? wiz : { kind: "mend", target: (state.activePlayer + 1) % state.players.length };
      const targets = state.players.map((pl, i) => i === state.activePlayer ? "" : `
        <button class="${wiz.target === i ? "on conn" : "conn"}" data-action="mend-target" data-i="${i}">
          to ${esc(CHARS[pl.charId].name)} (${state.hands[i].length})</button>`).join("");
      openModal(`
        <div class="controls">
          <div class="crow"><b>✦ MEND</b><span class="stat">give any of your cards away, then Done</span></div>
          <div class="crow">${targets}</div>
          <div class="crow wrap">${myHand().map(id => `
            <div class="thumb" data-action="mend-give" data-id="${id}" title="${esc(nodeOf(id))}">
              <img class="face" src="${IMG(id)}" alt=""></div>`).join("") || `<span class="empty">nothing left to give</span>`}</div>
          <div class="crow"><button class="big" data-action="mend-done">Done — power spent</button>
            <button data-action="close">cancel</button></div>
        </div>`);
      break;
    }
    case "stillpoint":
      state.turn.actions++;
      me().powerUsed = true;
      save(); render();
      break;
    case "sleight": {
      const st = story();
      const liftable = Object.entries(state.placed).filter(([n]) => n !== st.opening);
      if (!liftable.length) return;
      openModal(`
        <div class="controls">
          <div class="crow"><b>✦ SLEIGHT</b><span class="stat">lift a placed card back to your hand; its markers return to the supply</span></div>
          <div class="crow wrap">${liftable.map(([n, id]) => `
            <div class="thumb" data-action="sleight-pick" data-id="${id}" data-node="${esc(n)}" title="${esc(n)}">
              <img class="face" src="${IMG(id)}" alt=""></div>`).join("")}</div>
          <div class="crow"><button data-action="close">cancel</button></div>
        </div>`);
      break;
    }
  }
}

// ---------- judgment & misc modals --------------------------------------------------------

function openJudgment(j) {
  const st = story();
  lastChain = j.won ? j.chain : null;
  const grace = Object.values(state.supply).reduce((a, b) => a + b, 0);
  openModal(`
    <div class="controls">
      <div class="crow"><b>THE JUDGMENT · ${esc(st.title)}</b></div>
      <div class="crow t-banner ${j.won ? "win" : "lose"}">
        ${j.won
          ? `THE CHAIN HOLDS — ${j.chain.map(esc).join(" → ")}`
          : `THE FEELING FADES — ${esc(j.why)}`}
      </div>
      ${j.won ? `<div class="crow stat">${grace} marker${grace === 1 ? "" : "s"} left in the supply — your grace notes.</div>` : ""}
      <div class="crow"><span class="hint">clause: <i>${esc(st.clause)}</i></span>
        <button data-action="close">close</button></div>
    </div>`);
  save(); render1s();
}
// re-render beneath the modal so the chain lights up
function render1s() { render(); $("#modal").classList.remove("hidden"); }

function openReference() {
  openModal(`
    <div class="ref-pair">
      <img class="zoom" src="${IMG("reference_rules_1")}" alt="Quick rules">
      <img class="zoom" src="${IMG("reference_mirrors_1")}" alt="The Mirror table">
    </div>
    <div class="controls"><div class="crow"><button data-action="close">close</button></div></div>`);
}

function openDiscardPile() {
  openModal(`
    <div class="controls">
      <div class="crow"><b>DISCARD</b></div>
      <div class="crow wrap">${state.discard.map(id => `
        <div class="thumb" data-action="zoom" data-id="${id}" title="${esc(nodeOf(id))}">
          <img class="face" src="${IMG(id)}" alt=""></div>`).join("")}</div>
      <div class="crow"><button data-action="close">close</button></div>
    </div>`);
}

// ---------- events ----------------------------------------------------------------------

document.addEventListener("click", e => {
  if (e.target === $("#modal")) { closeModal(); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const d = el.dataset;
  const canAct = state && state.turn && state.turn.actions > 0 && !state.turn.discarding;
  switch (d.action) {
    case "pick-story": setup.storyId = d.id; renderSetup(); break;
    case "pick-char": {
      const i = setup.chars.indexOf(d.id);
      if (i >= 0) setup.chars.splice(i, 1);
      else if (setup.chars.length < 5) setup.chars.push(d.id);
      renderSetup(); break;
    }
    case "begin": if (setup.storyId && setup.chars.length >= 1) newGame(setup.storyId, setup.chars); break;

    case "restart":
      if (confirm("Wipe the field and start a new story?")) {
        localStorage.removeItem(SAVE_KEY); state = null; setup = { storyId: null, chars: [] }; lastChain = null; render();
      }
      break;
    case "tab-info": break; // hands are private-ish; tabs just show counts
    case "zoom": openZoom(d.id); break;
    case "story-card": openZoom(state.storyId); break;
    case "reference": openReference(); break;
    case "discard-pile": openDiscardPile(); break;
    case "judge": openJudgment(judgment()); break;
    case "close": closeModal(); break;

    case "hand": if (canAct) openPlay(d.id); else openZoom(d.id); break;
    case "toggle-conn": wiz.chosen[+d.i] = !wiz.chosen[+d.i]; renderPlayWiz(); break;
    case "place": {
      const conns = connectionsFor(wiz.cardId);
      place(wiz.cardId, conns.filter((e, i) => wiz.chosen[i]));
      break;
    }

    case "bridge": if (canAct) openBridge(); break;
    case "pick-pair": wiz.pair = bridgeablePairs()[+d.i]; renderBridgeWiz(); break;
    case "pick-discard": pickDiscard(+d.pid, d.id); break;

    case "breathe": if (canAct) openBreathe(); break;
    case "breathe-pick": {
      const h = myHand();
      h.splice(h.indexOf(d.id), 1);
      state.discard.push(d.id);
      draw(2);
      closeModal();
      if (!spendAction()) { save(); render(); }
      break;
    }

    case "power": openPower(); break;
    case "foresight-pick": {
      state.deck.splice(state.deck.indexOf(d.id), 1);
      myHand().push(d.id);
      me().powerUsed = true;
      closeModal(); save(); render(); break;
    }
    case "salvage-pick": {
      state.discard.splice(state.discard.indexOf(d.id), 1);
      myHand().push(d.id);
      me().powerUsed = true;
      closeModal(); save(); render(); break;
    }
    case "mend-target": wiz.target = +d.i; openPower(); break;
    case "mend-give": {
      const h = myHand();
      h.splice(h.indexOf(d.id), 1);
      state.hands[wiz.target].push(d.id);
      openPower(); break;
    }
    case "mend-done": me().powerUsed = true; closeModal(); save(); render(); break;
    case "sleight-pick": {
      const node = d.node;
      delete state.placed[node];
      state.links = state.links.filter(l => {
        const gone = l.a === node || l.b === node;
        if (gone) state.supply[l.marker]++;
        return !gone;
      });
      myHand().push(d.id);
      me().powerUsed = true;
      lastChain = null;
      closeModal(); save(); render(); break;
    }

    case "discard": {
      const h = myHand();
      h.splice(h.indexOf(d.id), 1);
      state.discard.push(d.id);
      if (h.length <= HAND_CAP) { state.turn.discarding = false; advance(); }
      else { save(); render(); }
      break;
    }
    case "end-turn": endTurn(); break;
  }
});

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ---------- boot ---------------------------------------------------------------------------

state = loadSave();
if (state && state.phase !== "play") state = null;
if (!state && location.search.includes("demo")) {
  newGame("story_OUT_OF_THE_DARK", ["char_THE_SEEKER", "char_THE_HEALER"]);
} else {
  render();
}
