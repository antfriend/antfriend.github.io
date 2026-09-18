/* index-ttdb.js — single-globe ribbon view over index_ttdb.md.
   Replaces the multi-globe browser (still available as index_OG.html).
   Draft: the record cards are generated SVG placeholders, not final art. */

const DB_PATH = "index_ttdb.md";

/* The ribbon: lat = AMP * sin((lon - lonStart) * FREQ), lon in [-150, 150].
   Record coordinates in index_ttdb.md sit exactly on this curve. */
const RIBBON = { amp: 34, freq: 1.2, lonStart: -150, lonEnd: 150 };

const IDLE_MS = 10000;   // no interaction before the tour takes over
const STEP_MS = 5500;    // dwell on each record while touring
const EASE_TOUR = 0.045; // slow drift when the tour is driving
const EASE_PICK = 0.14;  // snappier when a person picked the card
const EASE_COAST = 0.07; // let go of a drag and glide the nearest card home

/* Card size grows exponentially with depth: scale = MIN * (MAX/MIN)^facing,
   where facing is 0 at the limb and 1 dead centre. A card only reads large
   once the globe has turned it to face the panel centre. */
const CARD_SCALE_MIN = 0.44;
const CARD_SCALE_MAX = 2.35;

const THEMES = {
  banjo: { accent: "#f2c14d", glyph: "strings" },
  games: { accent: "#7cc7ff", glyph: "grid" },
  global_models: { accent: "#8fe6d2", glyph: "orbits" },
  personal_grammar: { accent: "#c9a2ff", glyph: "brackets" },
  RFCs: { accent: "#ff9f7c", glyph: "sheets" },
  OG: { accent: "#a6d96a", glyph: "cluster" },
};
const FALLBACK_THEME = { accent: "#9cb2bf", glyph: "orbits" };

const els = {
  stage: document.getElementById("globeStage"),
  canvas: document.getElementById("globe"),
  cardLayer: document.getElementById("cardLayer"),
  hudTitle: document.getElementById("hudTitle"),
  hudSub: document.getElementById("hudSub"),
  tourFlag: document.getElementById("tourFlag"),
  record: document.getElementById("recordView"),
  rail: document.getElementById("topicRail"),
  status: document.getElementById("status"),
  tourToggle: document.getElementById("tourToggle"),
};

const ctx = els.canvas.getContext("2d");

const state = {
  meta: {},
  records: [],
  byId: new Map(),
  activeId: null,
  width: 1,
  height: 1,
  rotLat: 0,
  rotLon: 0,
  targetLat: 0,
  targetLon: 0,
  ease: EASE_PICK,
  dragging: false,
  dragX: 0,
  dragY: 0,
  dragMoved: false,
  touring: false,
  idleTimer: 0,
  stepTimer: 0,
  nodes: new Map(), // record id -> card element
};

/* ------------------------------------------------------------ parsing */

function parseTtdb(text) {
  const meta = {};
  const dbName = text.match(/^db_name:\s*"?([^"\n]+)"?/m);
  if (dbName) meta.dbName = dbName[1].trim();

  const records = [];
  const chunks = text.split(/^---\s*$/m);

  chunks.forEach((chunk) => {
    const lines = chunk.split(/\r?\n/);
    let headerIdx = -1;
    let header = null;

    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(/^@LAT(-?\d+)LON(-?\d+)\s*(\|.*)?$/i);
      if (m) {
        headerIdx = i;
        header = m;
        break;
      }
    }
    if (!header) return;

    const lat = Number(header[1]);
    const lon = Number(header[2]);
    const id = "LAT" + lat + "LON" + lon;
    const attrs = (header[3] || "").split("|").map((s) => s.trim()).filter(Boolean);

    const edges = [];
    let opens = "";
    attrs.forEach((attr) => {
      if (!/^relates:/i.test(attr)) return;
      attr.replace(/^relates:/i, "").split(",").forEach((pair) => {
        const parts = pair.split(">").map((s) => (s || "").trim());
        const type = parts[0];
        const target = parts[1];
        if (!type || !target) return;
        if (type === "opens") opens = target;
        else edges.push({ type: type, target: target.replace(/^@/, "") });
      });
    });

    const body = lines.slice(headerIdx + 1);
    let title = "";
    let subtitle = "";
    const rest = [];
    body.forEach((line) => {
      if (!title && /^##\s+/.test(line)) { title = line.replace(/^##\s+/, "").trim(); return; }
      if (title && !subtitle && /^###\s+/.test(line)) { subtitle = line.replace(/^###\s+/, "").trim(); return; }
      rest.push(line);
    });

    if (!title) return; // skip special/config records in this draft view
    records.push({
      id: id,
      lat: lat,
      lon: lon,
      title: title,
      subtitle: subtitle,
      edges: edges,
      opens: opens,
      body: rest.join("\n").trim(),
    });
  });

  return { meta: meta, records: records };
}

/* --------------------------------------------------- tiny md renderer */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_m, label, href) {
    const local = href.match(/^lat(-?\d+)lon(-?\d+)$/i);
    if (local) {
      const id = "LAT" + Number(local[1]) + "LON" + Number(local[2]);
      return '<a href="#' + id + '" data-goto="' + id + '">' + label + "</a>";
    }
    return '<a href="' + href + '">' + label + "</a>";
  });
  return out;
}

function renderMarkdown(source) {
  return source
    .split(/\n{2,}/)
    .map(function (block) {
      const lines = block.split(/\n/).filter(function (l) { return l.trim(); });
      if (!lines.length) return "";
      if (lines.every(function (l) { return /^[-*]\s+/.test(l); })) {
        const items = lines
          .map(function (l) { return "<li>" + renderInline(l.replace(/^[-*]\s+/, "")) + "</li>"; })
          .join("");
        return "<ul>" + items + "</ul>";
      }
      return "<p>" + renderInline(lines.join(" ")) + "</p>";
    })
    .join("");
}

/* ------------------------------------------------- placeholder SVG art */

let svgUid = 0;

function glyphMarkup(kind, accent) {
  function stroke(d, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + accent +
      '" stroke-width="2" stroke-linecap="round" ' + (extra || "") + "/>";
  }
  switch (kind) {
    case "strings":
      return stroke("M35 36 L35 92") + stroke("M47 32 L47 96") + stroke("M59 29 L59 99") +
        stroke("M71 32 L71 96") + stroke("M83 36 L83 92") +
        '<circle cx="59" cy="64" r="27" fill="none" stroke="' + accent + '" stroke-width="2" opacity="0.55"/>';
    case "grid":
      return '<rect x="33" y="38" width="52" height="52" rx="8" fill="none" stroke="' + accent + '" stroke-width="2"/>' +
        '<circle cx="47" cy="52" r="4.5" fill="' + accent + '"/><circle cx="71" cy="52" r="4.5" fill="' + accent + '"/>' +
        '<circle cx="59" cy="64" r="4.5" fill="' + accent + '"/>' +
        '<circle cx="47" cy="76" r="4.5" fill="' + accent + '"/><circle cx="71" cy="76" r="4.5" fill="' + accent + '"/>';
    case "orbits":
      return '<circle cx="59" cy="64" r="26" fill="none" stroke="' + accent + '" stroke-width="2"/>' +
        '<ellipse cx="59" cy="64" rx="26" ry="10" fill="none" stroke="' + accent + '" stroke-width="1.5" opacity="0.7"/>' +
        '<ellipse cx="59" cy="64" rx="10" ry="26" fill="none" stroke="' + accent + '" stroke-width="1.5" opacity="0.7"/>' +
        '<circle cx="59" cy="38" r="3.5" fill="' + accent + '"/><circle cx="85" cy="64" r="3.5" fill="' + accent + '"/>';
    case "brackets":
      return stroke("M48 36 C34 36 34 58 30 64 C34 70 34 92 48 92") +
        stroke("M70 36 C84 36 84 58 88 64 C84 70 84 92 70 92") +
        '<circle cx="59" cy="64" r="5" fill="' + accent + '"/>';
    case "sheets":
      return '<rect x="30" y="34" width="46" height="58" rx="5" fill="none" stroke="' + accent + '" stroke-width="2" opacity="0.5"/>' +
        '<rect x="41" y="43" width="46" height="58" rx="5" fill="none" stroke="' + accent + '" stroke-width="2"/>' +
        stroke("M50 59 L78 59") + stroke("M50 69 L78 69") + stroke("M50 79 L69 79");
    case "cluster":
    default:
      return '<circle cx="59" cy="64" r="11" fill="none" stroke="' + accent + '" stroke-width="2"/>' +
        '<circle cx="34" cy="46" r="7" fill="none" stroke="' + accent + '" stroke-width="1.8" opacity="0.8"/>' +
        '<circle cx="85" cy="46" r="7" fill="none" stroke="' + accent + '" stroke-width="1.8" opacity="0.8"/>' +
        '<circle cx="34" cy="84" r="7" fill="none" stroke="' + accent + '" stroke-width="1.8" opacity="0.8"/>' +
        '<circle cx="85" cy="84" r="7" fill="none" stroke="' + accent + '" stroke-width="1.8" opacity="0.8"/>' +
        stroke("M41 51 L51 58", 'opacity="0.6"') + stroke("M78 51 L68 58", 'opacity="0.6"') +
        stroke("M41 79 L51 70", 'opacity="0.6"') + stroke("M78 79 L68 70", 'opacity="0.6"');
  }
}

function cardSvg(record, index) {
  const theme = THEMES[record.title] || FALLBACK_THEME;
  svgUid += 1;
  const uid = "c" + svgUid;
  const label = record.title;
  const fontSize = Math.min(13, Math.max(7.5, 150 / Math.max(6, label.length)));
  const pips = state.records
    .map(function (_r, i) {
      const cx = 59 - (state.records.length - 1) * 5 + i * 10;
      return '<circle cx="' + cx.toFixed(1) + '" cy="162" r="' + (i === index ? 3.2 : 2) +
        '" fill="' + theme.accent + '" opacity="' + (i === index ? 1 : 0.35) + '"/>';
    })
    .join("");

  return '<svg viewBox="0 0 118 178" role="img" aria-label="' + escapeHtml(label) + ' placeholder card">' +
    "<defs>" +
    '<linearGradient id="bg' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#16262c"/><stop offset="1" stop-color="#060c10"/></linearGradient>' +
    '<pattern id="hatch' + uid + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
    '<line x1="0" y1="0" x2="0" y2="7" stroke="' + theme.accent + '" stroke-opacity="0.11" stroke-width="1.4"/></pattern>' +
    "</defs>" +
    '<rect x="1.5" y="1.5" width="115" height="175" rx="9" fill="url(#bg' + uid + ')"/>' +
    '<rect x="1.5" y="1.5" width="115" height="175" rx="9" fill="url(#hatch' + uid + ')"/>' +
    '<rect x="1.5" y="1.5" width="115" height="175" rx="9" fill="none" stroke="' + theme.accent + '" stroke-opacity="0.78" stroke-width="1.6"/>' +
    '<rect x="8" y="8" width="102" height="162" rx="6" fill="none" stroke="' + theme.accent + '" stroke-opacity="0.26" stroke-dasharray="5 5"/>' +
    '<text x="59" y="24" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="7.5" ' +
    'fill="' + theme.accent + '" fill-opacity="0.72" letter-spacing="1.2">' + record.lat + " / " + record.lon + "</text>" +
    glyphMarkup(theme.glyph, theme.accent) +
    '<text x="59" y="128" text-anchor="middle" font-family="Trebuchet MS, Segoe UI, sans-serif" font-size="' +
    fontSize.toFixed(1) + '" font-weight="700" fill="#eef7f2" letter-spacing="0.4">' + escapeHtml(label) + "</text>" +
    '<text x="59" y="145" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="6.5" ' +
    'fill="#eef7f2" fill-opacity="0.42" letter-spacing="1.6">PLACEHOLDER</text>' +
    pips +
    "</svg>";
}

/* -------------------------------------------------------- projection */

function rad(deg) { return (deg * Math.PI) / 180; }

function ribbonLat(lon) {
  return RIBBON.amp * Math.sin(rad((lon - RIBBON.lonStart) * RIBBON.freq));
}

function project(lat, lon) {
  const la = rad(lat);
  const lo = rad(lon);
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);

  const cy = Math.cos(state.rotLon);
  const sy = Math.sin(state.rotLon);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;

  const cx = Math.cos(state.rotLat);
  const sx = Math.sin(state.rotLat);
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;

  return [x1, y1, z2];
}

function orientationFor(record) {
  const la = rad(record.lat);
  const lo = rad(record.lon);
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  return { lon: -Math.atan2(x, z), lat: Math.atan2(y, Math.hypot(x, z)) };
}

function geometry() {
  const radius = Math.max(40, Math.min(state.width, state.height) * 0.4);
  return { radius: radius, cx: state.width * 0.5, cy: state.height * 0.5 };
}

function angleDelta(target, current) {
  let d = (target - current) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/* ---------------------------------------------------------- rendering */

function resize() {
  const rect = els.stage.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  state.width = Math.max(1, rect.width);
  state.height = Math.max(1, rect.height);
  els.canvas.width = Math.round(state.width * dpr);
  els.canvas.height = Math.round(state.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function ribbonPoints(fromLon, toLon, latFn, step) {
  const pts = [];
  const s = step || 2;
  const dir = toLon >= fromLon ? 1 : -1;
  for (let lon = fromLon; dir > 0 ? lon <= toLon : lon >= toLon; lon += s * dir) {
    pts.push(project(latFn(lon), lon));
  }
  return pts;
}

function strokeDepthPath(points, cx, cy, radius, front) {
  ctx.beginPath();
  let drawing = false;
  points.forEach(function (p) {
    const visible = front ? p[2] >= 0 : p[2] < 0;
    if (!visible) { drawing = false; return; }
    const px = cx + p[0] * radius;
    const py = cy - p[1] * radius;
    if (!drawing) { ctx.moveTo(px, py); drawing = true; } else { ctx.lineTo(px, py); }
  });
  ctx.stroke();
}

function drawGraticule(cx, cy, radius) {
  ctx.strokeStyle = "rgba(143, 230, 210, 0.16)";
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 4) pts.push(project(lat, lon));
    strokeDepthPath(pts, cx, cy, radius, true);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4) pts.push(project(lat, lon));
    strokeDepthPath(pts, cx, cy, radius, true);
  }
}

function drawRibbon(cx, cy, radius, front) {
  const forward = ribbonPoints(RIBBON.lonStart, RIBBON.lonEnd, ribbonLat);
  ctx.setLineDash([]);
  ctx.lineWidth = front ? 2.4 : 1.4;
  ctx.strokeStyle = front ? "rgba(143, 230, 210, 0.78)" : "rgba(143, 230, 210, 0.2)";
  strokeDepthPath(forward, cx, cy, radius, front);

  // Closing arc: OG back to banjo, around the far side along the equator.
  const ret = ribbonPoints(RIBBON.lonEnd, RIBBON.lonStart + 360, function () { return 0; });
  ctx.setLineDash([5, 6]);
  ctx.lineWidth = front ? 1.6 : 1.1;
  ctx.strokeStyle = front ? "rgba(242, 193, 77, 0.55)" : "rgba(242, 193, 77, 0.16)";
  strokeDepthPath(ret, cx, cy, radius, front);
  ctx.setLineDash([]);
}

function drawSphere(cx, cy, radius) {
  const grad = ctx.createRadialGradient(
    cx - radius * 0.35, cy - radius * 0.4, radius * 0.1,
    cx, cy, radius
  );
  grad.addColorStop(0, "rgba(34, 66, 62, 0.94)");
  grad.addColorStop(0.62, "rgba(14, 30, 30, 0.95)");
  grad.addColorStop(1, "rgba(5, 11, 12, 0.97)");
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(143, 230, 210, 0.3)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawNodes(cx, cy, radius) {
  state.records.forEach(function (record) {
    const p = project(record.lat, record.lon);
    if (p[2] < -0.1) return;
    const px = cx + p[0] * radius;
    const py = cy - p[1] * radius;
    const active = record.id === state.activeId;
    const theme = THEMES[record.title] || FALLBACK_THEME;
    ctx.globalAlpha = Math.max(0.25, Math.min(1, (p[2] + 0.2) / 0.6));
    ctx.beginPath();
    ctx.arc(px, py, active ? 5.5 : 3.2, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent;
    ctx.fill();
    if (active) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

function placeCards(cx, cy, radius) {
  const ring = radius * 1.04;
  state.records.forEach(function (record) {
    const node = state.nodes.get(record.id);
    if (!node) return;
    const p = project(record.lat, record.lon);
    const px = cx + p[0] * ring;
    const py = cy - p[1] * ring;

    // Cards stay upright; only their size reports where they are.
    const facing = Math.max(0, p[2]);
    const scale = CARD_SCALE_MIN * Math.pow(CARD_SCALE_MAX / CARD_SCALE_MIN, facing);
    const alpha = Math.max(0, Math.min(1, (p[2] + 0.32) / 0.5));

    node.style.setProperty("--x", px.toFixed(1) + "px");
    node.style.setProperty("--y", py.toFixed(1) + "px");
    node.style.setProperty("--scale", scale.toFixed(3));
    node.style.opacity = alpha.toFixed(3);
    node.style.zIndex = String(Math.round(100 + p[2] * 80));
    node.classList.toggle("is-back", alpha < 0.05);
    node.hidden = alpha < 0.02;
  });
}

function render() {
  const g = geometry();
  ctx.clearRect(0, 0, state.width, state.height);
  drawRibbon(g.cx, g.cy, g.radius, false);
  drawSphere(g.cx, g.cy, g.radius);
  drawGraticule(g.cx, g.cy, g.radius);
  drawRibbon(g.cx, g.cy, g.radius, true);
  drawNodes(g.cx, g.cy, g.radius);
  placeCards(g.cx, g.cy, g.radius);
}

function frame() {
  const dLat = angleDelta(state.targetLat, state.rotLat);
  const dLon = angleDelta(state.targetLon, state.rotLon);
  if (!state.dragging && (Math.abs(dLat) > 0.0005 || Math.abs(dLon) > 0.0005)) {
    state.rotLat += dLat * state.ease;
    state.rotLon += dLon * state.ease;
  }
  render();
  requestAnimationFrame(frame);
}

/* -------------------------------------------------------- record view */

function renderRecord(record) {
  const theme = THEMES[record.title] || FALLBACK_THEME;
  const index = state.records.indexOf(record);
  const edges = record.edges
    .filter(function (edge) { return state.byId.has(edge.target); })
    .map(function (edge) {
      const target = state.byId.get(edge.target);
      return '<a class="edge" href="#' + target.id + '" data-goto="' + target.id + '"><em>' +
        escapeHtml(edge.type.replace(/_/g, " ")) + "</em> " + escapeHtml(target.title) + "</a>";
    })
    .join("");

  els.record.innerHTML =
    '<div class="record-head">' +
    '<div class="record-card-art">' + cardSvg(record, index) + "</div>" +
    '<div class="record-head-text">' +
    '<div class="record-coord">@' + record.id + " &middot; card " + (index + 1) + " of " + state.records.length + "</div>" +
    "<h2>" + escapeHtml(record.title) + "</h2>" +
    (record.subtitle ? "<h3>" + escapeHtml(record.subtitle) + "</h3>" : "") +
    (record.opens
      ? '<a class="record-open" href="' + record.opens + '" style="border-color:' + theme.accent +
        '">Open ' + escapeHtml(record.title) + " &rarr;</a>"
      : "") +
    "</div></div>" +
    renderMarkdown(record.body) +
    (edges ? '<div class="record-edges">' + edges + "</div>" : "");
}

function renderRail() {
  els.rail.innerHTML = state.records
    .map(function (record) {
      const theme = THEMES[record.title] || FALLBACK_THEME;
      const active = record.id === state.activeId ? " active" : "";
      const out = record.opens ? '<span class="out">' + escapeHtml(record.opens) + "</span>" : "";
      return '<li><button type="button" class="topic' + active + '" data-goto="' + record.id +
        '" style="--dot:' + theme.accent + '"><span class="dot"></span>' +
        escapeHtml(record.title) + out + "</button></li>";
    })
    .join("");
}

function select(id, options) {
  const opts = options || {};
  const record = state.byId.get(id);
  if (!record) return;
  state.activeId = id;
  state.ease = opts.ease || (opts.fromTour ? EASE_TOUR : EASE_PICK);

  const orient = orientationFor(record);
  state.targetLat = orient.lat;
  state.targetLon = orient.lon;

  els.hudTitle.textContent = record.title;
  els.hudSub.innerHTML = "<span>" + escapeHtml(record.subtitle || record.id) + "</span>";

  state.nodes.forEach(function (node, nodeId) {
    node.classList.toggle("is-active", nodeId === id);
  });
  renderRecord(record);
  renderRail();

  if (els.status) {
    els.status.textContent = (state.meta.dbName || "Index") + " — " + record.title + " (@" + record.id + ")";
  }
}

function stepId(id, type, offset) {
  const record = state.byId.get(id);
  if (!record) return state.records.length ? state.records[0].id : null;
  const edge = record.edges.filter(function (e) {
    return e.type === type && state.byId.has(e.target);
  })[0];
  if (edge) return edge.target;
  const idx = state.records.indexOf(record);
  const n = state.records.length;
  return state.records[(idx + offset + n) % n].id;
}

/* The centre of the stage is the point facing the viewer, so the record with
   the largest z under the current rotation is the one nearest to landing. */
function nearestRecordId() {
  let best = null;
  let bestZ = -Infinity;
  state.records.forEach(function (record) {
    const z = project(record.lat, record.lon)[2];
    if (z > bestZ) { bestZ = z; best = record.id; }
  });
  return best;
}

function nextId(id) { return stepId(id, "next", 1); }
function prevId(id) { return stepId(id, "prev", -1); }

/* -------------------------------------------------------------- tour */

function tourEnabled() {
  return !els.tourToggle || els.tourToggle.checked;
}

function stopTour() {
  if (state.touring) {
    state.touring = false;
    els.tourFlag.classList.remove("is-on");
  }
  clearTimeout(state.stepTimer);
}

function tourStep() {
  if (!state.touring) return;
  select(nextId(state.activeId), { fromTour: true });
  state.stepTimer = setTimeout(tourStep, STEP_MS);
}

function startTour() {
  if (state.touring || !tourEnabled() || !state.records.length) return;
  state.touring = true;
  els.tourFlag.classList.add("is-on");
  tourStep();
}

function noteInteraction() {
  stopTour();
  clearTimeout(state.idleTimer);
  if (!tourEnabled()) return;
  state.idleTimer = setTimeout(startTour, IDLE_MS);
}

/* ------------------------------------------------------- interaction */

function bindGlobeDrag() {
  const canvas = els.canvas;

  canvas.addEventListener("pointerdown", function (event) {
    state.dragging = true;
    state.dragMoved = false;
    state.dragX = event.clientX;
    state.dragY = event.clientY;
    canvas.classList.add("is-dragging");
    // Capture keeps the drag alive past the stage edge; it throws for a
    // pointer the browser does not consider active, which is not fatal here.
    try { canvas.setPointerCapture(event.pointerId); } catch (e) { /* no capture */ }
  });

  canvas.addEventListener("pointermove", function (event) {
    if (!state.dragging) return;
    const dx = event.clientX - state.dragX;
    const dy = event.clientY - state.dragY;
    if (Math.abs(dx) + Math.abs(dy) > 1) state.dragMoved = true;
    state.dragX = event.clientX;
    state.dragY = event.clientY;
    const limit = Math.PI / 2 - 0.08;
    state.rotLon += dx * 0.006;
    // Inverted Y: dragging down tips the globe's near face downward.
    state.rotLat = Math.max(-limit, Math.min(limit, state.rotLat + dy * 0.006));
    state.targetLon = state.rotLon;
    state.targetLat = state.rotLat;
  });

  function end(event) {
    if (!state.dragging) return;
    state.dragging = false;
    canvas.classList.remove("is-dragging");
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (!state.dragMoved) return;
    state.dragMoved = false;
    select(nearestRecordId(), { ease: EASE_COAST });
  }
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
}

function bindDelegatedNav() {
  document.addEventListener("click", function (event) {
    const trigger = event.target.closest ? event.target.closest("[data-goto]") : null;
    if (!trigger) return;
    event.preventDefault();
    select(trigger.getAttribute("data-goto"));
  });
}

function bindIdleWatch() {
  ["pointerdown", "wheel", "keydown", "touchstart", "scroll"].forEach(function (type) {
    window.addEventListener(type, noteInteraction, { passive: true });
  });
  if (els.tourToggle) {
    els.tourToggle.addEventListener("change", function () {
      if (!tourEnabled()) stopTour();
      noteInteraction();
    });
  }
  document.addEventListener("keydown", function (event) {
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "ArrowRight") select(nextId(state.activeId));
    if (event.key === "ArrowLeft") select(prevId(state.activeId));
  });
}

/* --------------------------------------------------------------- boot */

function buildCards() {
  els.cardLayer.innerHTML = "";
  state.nodes.clear();
  state.records.forEach(function (record, index) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "ribbon-card";
    node.setAttribute("data-goto", record.id);
    node.setAttribute("aria-label", record.title + " — " + (record.subtitle || record.id));
    node.innerHTML = cardSvg(record, index);
    els.cardLayer.appendChild(node);
    state.nodes.set(record.id, node);
  });
}

async function boot() {
  let text;
  try {
    const response = await fetch(DB_PATH, { cache: "no-cache" });
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    text = await response.text();
  } catch (error) {
    els.status.textContent = "Could not load " + DB_PATH + ": " + error.message;
    els.record.innerHTML = "<p>Could not load <code>" + DB_PATH +
      "</code>. Serve this page over http (not file://) and try again.</p>";
    return;
  }

  const parsed = parseTtdb(text);
  state.meta = parsed.meta;
  state.records = parsed.records;
  state.records.forEach(function (record) { state.byId.set(record.id, record); });

  if (!state.records.length) {
    els.status.textContent = DB_PATH + " parsed, but no records were found.";
    return;
  }

  buildCards();
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(els.stage);
  window.addEventListener("resize", resize);

  bindGlobeDrag();
  bindDelegatedNav();
  bindIdleWatch();

  const fromHash = location.hash.replace(/^#/, "");
  select(state.byId.has(fromHash) ? fromHash : state.records[0].id);

  // Snap straight to the opening card, then hand pacing back to the easing.
  state.rotLat = state.targetLat;
  state.rotLon = state.targetLon;

  requestAnimationFrame(frame);
  state.idleTimer = setTimeout(startTour, IDLE_MS);
}

boot();
