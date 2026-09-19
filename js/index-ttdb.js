/* index-ttdb.js — single-globe ribbon view over index_ttdb.md.
   Replaces the multi-globe browser (still available as index_OG.html).
   Draft: most record cards are generated SVG placeholders, not final art. A
   topic that already has a picture of its own declares a `poster` instead,
   and that card wears the picture — same frame, same type, real face. */

const DB_PATH = "index_ttdb.md";

/* The ribbon: lat = AMP * sin((lon - lonStart) * FREQ), lon in [-150, 150].
   Record coordinates in index_ttdb.md sit exactly on this curve. */
const RIBBON = { amp: 34, freq: 1.2, lonStart: -150, lonEnd: 150 };

const IDLE_MS = 60000;   // no interaction before the tour takes over
const STEP_MS = 5500;    // dwell on each record while touring
const EASE_TOUR = 0.045; // slow drift when the tour is driving
const EASE_PICK = 0.14;  // snappier when a person picked the card
const EASE_COAST = 0.07; // let go of a drag and glide the nearest card home
const OPEN_GRACE_MS = 450; // a card just made current ignores clicks this long

/* Card size grows exponentially with depth: scale = MIN * (MAX/MIN)^facing,
   where facing is 0 at the limb and 1 dead centre. A card only reads large
   once the globe has turned it to face the panel centre. */
const CARD_SCALE_MIN = 0.44;
const CARD_SCALE_MAX = 2.35;

const THEMES = {
  // The banjo deck's own banjo card, face 01 of banjo_taro. It is already a
  // card, so it needs no badge; glyph stays as the face if the poster goes.
  banjo: {
    accent: "#f2c14d",
    glyph: "strings",
    poster: "banjo/banjo_taro_01.png",
    tag: "TARO DECK",
  },
  // The ICU2 deck opens on Dread vs ICU2, so the door wears that fight's
  // still. Thumbnails are stable per video id; this one is fNIpPwDtRdI.
  ICU2: {
    accent: "#ff7a5c",
    poster: "https://i.ytimg.com/vi/fNIpPwDtRdI/hqdefault.jpg",
    badge: "play",
    tag: "SIX FIGHTS",
  },
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
  selectedAt: 0, // when activeId last changed, ms
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

/* A toot frame is image syntax whose target is a document rather than a
   picture: ![label](thing.html) renders as an inline iframe of that page.
   Same rule the OG reader uses, so a record reads the same in either. */
function isFrameSource(src) {
  return /\.(html|md|pdf)(?:[?#].*)?$/i.test(src.trim());
}

/* Both arguments must already be HTML-escaped. */
function mediaMarkup(alt, src) {
  if (isFrameSource(src)) {
    return '<iframe class="record-html-embed" src="' + src + '" title="' + alt +
      '" loading="lazy" referrerpolicy="no-referrer"></iframe>';
  }
  return '<img class="record-media" src="' + src + '" alt="' + alt + '" loading="lazy" />';
}

function renderInline(text) {
  let out = escapeHtml(text);
  // Frames before links, or the link rule would eat the ![...](...) tail.
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_m, alt, src) {
    return mediaMarkup(alt, src);
  });
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

/* Fenced blocks are lifted out before the blank-line split, so ASCII art keeps
   its own line breaks — and any blank lines inside it — instead of being
   reflowed into a paragraph. A sentinel holds the slot until the end. */
function renderMarkdown(source) {
  const fences = [];
  const staged = source.replace(/```[A-Za-z0-9_-]*\r?\n([\s\S]*?)```/g, function (_m, code) {
    fences.push('<pre class="record-ascii">' + escapeHtml(code.replace(/\s+$/, "")) + "</pre>");
    return "\n\n{{fence:" + (fences.length - 1) + "}}\n\n";
  });

  return staged
    .split(/\n{2,}/)
    .map(function (block) {
      const fence = block.trim().match(/^\{\{fence:(\d+)\}\}$/);
      if (fence) return fences[Number(fence[1])];
      const lines = block.split(/\n/).filter(function (l) { return l.trim(); });
      if (!lines.length) return "";
      // A block that is nothing but a frame stands on its own, unwrapped.
      const sole = block.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (sole) return mediaMarkup(escapeHtml(sole[1]), escapeHtml(sole[2]));
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

/* The two card faces. A placeholder face is the hatch plus the topic's
   glyph; a poster face is a picture bled to the card edge under a veil that
   darkens the top and bottom strips, so the coordinate and the title keep
   their contrast whatever the picture happens to be. Everything outside the
   face — frame, coordinate, title, tag, pips — is the same either way. */
function faceMarkup(theme, uid) {
  if (theme.poster) {
    return '<g clip-path="url(#clip' + uid + ')">' +
      '<image href="' + escapeHtml(theme.poster) + '" x="1.5" y="1.5" width="115" height="175" ' +
      'preserveAspectRatio="xMidYMid slice"/>' +
      '<rect x="1.5" y="1.5" width="115" height="175" fill="url(#veil' + uid + ')"/>' +
      "</g>" +
      // Only a video still needs to say so; a picture that is already a card
      // is left alone to be one.
      (theme.badge === "play"
        ? '<circle cx="59" cy="64" r="16" fill="#03080a" fill-opacity="0.46" stroke="' + theme.accent +
          '" stroke-opacity="0.9" stroke-width="1.6"/>' +
          '<path d="M54 55 L70 64 L54 73 Z" fill="' + theme.accent + '"/>'
        : "");
  }
  return '<rect x="1.5" y="1.5" width="115" height="175" rx="9" fill="url(#hatch' + uid + ')"/>' +
    '<rect x="8" y="8" width="102" height="162" rx="6" fill="none" stroke="' + theme.accent +
    '" stroke-opacity="0.26" stroke-dasharray="5 5"/>' +
    glyphMarkup(theme.glyph, theme.accent);
}

function cardSvg(record, index) {
  const theme = THEMES[record.title] || FALLBACK_THEME;
  svgUid += 1;
  const uid = "c" + svgUid;
  const label = record.title;
  const fontSize = Math.min(13, Math.max(7.5, 150 / Math.max(6, label.length)));
  const tag = theme.tag || "PLACEHOLDER";
  const pips = state.records
    .map(function (_r, i) {
      const cx = 59 - (state.records.length - 1) * 5 + i * 10;
      return '<circle cx="' + cx.toFixed(1) + '" cy="162" r="' + (i === index ? 3.2 : 2) +
        '" fill="' + theme.accent + '" opacity="' + (i === index ? 1 : 0.35) + '"/>';
    })
    .join("");

  return '<svg viewBox="0 0 118 178" role="img" aria-label="' + escapeHtml(label) +
    (theme.poster ? " card" : " placeholder card") + '">' +
    "<defs>" +
    '<linearGradient id="bg' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#16262c"/><stop offset="1" stop-color="#060c10"/></linearGradient>' +
    '<pattern id="hatch' + uid + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
    '<line x1="0" y1="0" x2="0" y2="7" stroke="' + theme.accent + '" stroke-opacity="0.11" stroke-width="1.4"/></pattern>' +
    (theme.poster
      ? '<clipPath id="clip' + uid + '"><rect x="1.5" y="1.5" width="115" height="175" rx="9"/></clipPath>' +
        '<linearGradient id="veil' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#03080a" stop-opacity="0.82"/>' +
        '<stop offset="0.22" stop-color="#03080a" stop-opacity="0"/>' +
        '<stop offset="0.5" stop-color="#03080a" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#03080a" stop-opacity="0.94"/></linearGradient>'
      : "") +
    "</defs>" +
    '<rect x="1.5" y="1.5" width="115" height="175" rx="9" fill="url(#bg' + uid + ')"/>' +
    faceMarkup(theme, uid) +
    '<rect x="1.5" y="1.5" width="115" height="175" rx="9" fill="none" stroke="' + theme.accent + '" stroke-opacity="0.78" stroke-width="1.6"/>' +
    '<text x="59" y="24" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="7.5" ' +
    'fill="' + theme.accent + '" fill-opacity="0.72" letter-spacing="1.2">' + record.lat + " / " + record.lon + "</text>" +
    '<text x="59" y="128" text-anchor="middle" font-family="Trebuchet MS, Segoe UI, sans-serif" font-size="' +
    fontSize.toFixed(1) + '" font-weight="700" fill="#eef7f2" letter-spacing="0.4">' + escapeHtml(label) + "</text>" +
    '<text x="59" y="145" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="6.5" ' +
    'fill="#eef7f2" fill-opacity="' + (theme.poster ? "0.62" : "0.42") + '" letter-spacing="1.6">' +
    escapeHtml(tag) + "</text>" +
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
  // Sized off the width so the globe almost spans the panel; the height term
  // only bites if the stage is ever squatter than its 5/4 aspect ratio.
  const radius = Math.max(40, Math.min(state.width * 0.46, state.height * 0.62));
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
  let settled = false;
  if (!state.dragging) {
    if (Math.abs(dLat) > 0.0005 || Math.abs(dLon) > 0.0005) {
      state.rotLat += dLat * state.ease;
      state.rotLon += dLon * state.ease;
    } else {
      // Land exactly, so the record panel lands with the globe.
      state.rotLat += dLat;
      state.rotLon += dLon;
      settled = true;
    }
  }
  render();
  updatePanel(settled);
  requestAnimationFrame(frame);
}

/* ----------------------------------------------------- record slides */

/* The record panel is a window onto a sheet of record slides, and the globe
   drives the sheet, not a clock. Each move to another record is a leg: it
   starts wherever the globe points and ends facing the target record. The
   target's slide is laid just outside the window along the leg's angle, the
   (lon, lat) step from start to target with lon to the right and lat up.
   Each frame, the sheet shifts by exactly the fraction of that rotation the
   globe has completed. The current record leaves on one side as the new one
   comes in from the other, in step with the globe. A drag is a chain of
   legs toward whichever record the globe is being turned to. */

const SLIDE_GAP = 24;       // px of clear panel between neighbouring slides
const DRAG_TAKEOVER = 0.12; // lead a rival record needs to take over a drag leg
const LEG_MIN = rad(0.5);   // a leg shorter than this has no direction
const DRAG_LEG_MIN = rad(10); // a drag never heads for the record it is already on

const panel = {
  track: null,
  slides: new Map(), // record id -> { el, x, y }: slide offset at the leg's start, px
  target: null,      // record id sliding in; null while nothing is
  from: null,        // globe rotation { lat, lon } where the leg began
  leg: null,         // rotation step { lat, lon } from `from` to the target
  startH: 0,         // track height when the leg began
  t: 0,              // fraction of the leg's rotation completed
};

function globeRotation() {
  return { lat: state.rotLat, lon: state.rotLon };
}

function legTo(id) {
  const o = orientationFor(state.byId.get(id));
  return { lat: o.lat - panel.from.lat, lon: angleDelta(o.lon, panel.from.lon) };
}

/* How far the globe has turned along a leg: 0 at its start, 1 on arrival.
   The globe eases lat and lon by the same factor every frame, so an eased
   leg is a straight line in rotation space and this fraction is exact. Lon
   is unwrapped about the leg's midpoint, so a half-turn leg (banjo to
   personal_grammar) cannot flip sign as it crosses the far side. */
function legProgress(leg) {
  const len2 = leg.lat * leg.lat + leg.lon * leg.lon;
  if (len2 < LEG_MIN * LEG_MIN) return null;
  const mid = panel.from.lon + leg.lon / 2;
  const lon = leg.lon / 2 + angleDelta(state.rotLon, mid);
  const lat = state.rotLat - panel.from.lat;
  return (lat * leg.lat + lon * leg.lon) / len2;
}

function makeSlide(id) {
  const el = document.createElement("div");
  el.className = "record-slide";
  el.innerHTML = recordMarkup(state.byId.get(id));
  panel.track.appendChild(el);
  const slide = { el: el, x: 0, y: 0 };
  panel.slides.set(id, slide);
  return slide;
}

function dropSlide(id) {
  const slide = panel.slides.get(id);
  if (!slide) return;
  slide.el.remove();
  panel.slides.delete(id);
}

function isMoving() {
  return panel.track.classList.contains("is-moving");
}

/* Only the selected record takes clicks and focus while slides are moving. */
function markActiveSlide() {
  const moving = isMoving();
  panel.slides.forEach(function (slide, id) {
    const inert = moving && id !== state.activeId;
    if (slide.el.inert !== inert) slide.el.inert = inert;
  });
}

/* Settle on one slide, back in normal flow and sizing the panel itself. */
function restOn(id) {
  Array.from(panel.slides.keys()).forEach(function (key) {
    if (key !== id) dropSlide(key);
  });
  const slide = panel.slides.get(id) || makeSlide(id);
  slide.x = 0;
  slide.y = 0;
  slide.el.style.transform = "";
  panel.track.classList.remove("is-moving");
  panel.track.style.height = "";
  panel.target = null;
  panel.leg = null;
  panel.t = 0;
  // A centred slide stands for the globe facing its record, so the next leg
  // is measured from the record itself, not from wherever the globe drifted.
  const o = orientationFor(state.byId.get(id));
  panel.from = { lat: o.lat, lon: o.lon };
  markActiveSlide();
}

/* Freeze the leg where it stands: fold its progress into every slide's
   offset, so the next leg starts from exactly what is on screen. */
function bake(t) {
  const target = panel.slides.get(panel.target);
  if (target) {
    const sx = target.x * t;
    const sy = target.y * t;
    panel.startH += (target.el.offsetHeight - panel.startH) * t;
    panel.slides.forEach(function (slide) {
      slide.x -= sx;
      slide.y -= sy;
    });
  }
  panel.target = null;
  panel.leg = null;
  panel.t = 0;
}

/* Slides wholly outside the window will not be seen again on this leg. */
function pruneHidden(keepId) {
  const w = panel.track.clientWidth;
  const h = panel.startH;
  Array.from(panel.slides.keys()).forEach(function (id) {
    if (id === keepId) return;
    const s = panel.slides.get(id);
    const showing = s.x < w - 0.5 && s.x + w > 0.5 && s.y < h - 0.5 && s.y + s.el.offsetHeight > 0.5;
    if (!showing) dropSlide(id);
  });
}

/* How far along (ux, uy) a new slide of height newH must sit to clear the
   window and every other slide on the sheet. Two boxes are clear once they
   separate along either axis; the slide has to clear all of them. */
function clearance(ux, uy, newH, newId) {
  const w = panel.track.clientWidth + SLIDE_GAP;
  const boxes = [{ x: 0, y: 0, h: panel.startH }];
  panel.slides.forEach(function (s, id) {
    if (id !== newId) boxes.push({ x: s.x, y: s.y, h: s.el.offsetHeight });
  });
  let reach = 0;
  boxes.forEach(function (b) {
    const alongX = Math.abs(ux) > 1e-6 ? (w + Math.sign(ux) * b.x) / Math.abs(ux) : Infinity;
    let alongY = Infinity;
    if (uy > 1e-6) alongY = (b.y + b.h + SLIDE_GAP) / uy;
    else if (uy < -1e-6) alongY = (newH + SLIDE_GAP - b.y) / -uy;
    reach = Math.max(reach, Math.min(alongX, alongY));
  });
  return reach;
}

function beginLeg(id) {
  if (!panel.track) return;
  if (!panel.slides.size) { restOn(id); return; }
  if (panel.target === id) return; // already on its way in
  const resting = panel.slides.get(id);
  if (!panel.target && panel.slides.size === 1 && resting && !resting.x && !resting.y) return;

  if (panel.target) {
    // Retarget mid-leg: freeze what is on screen and measure on from here.
    bake(panel.t);
    panel.from = globeRotation();
  } else {
    // The sheet already stands for the globe at panel.from: the record it
    // rests on, or the start of a leg a drag backed out of.
    panel.startH = panel.track.offsetHeight;
  }
  const leg = legTo(id);
  const len = Math.hypot(leg.lat, leg.lon);
  if (len < LEG_MIN) { restOn(id); return; } // the globe is already there

  panel.track.style.height = panel.startH.toFixed(1) + "px";
  panel.track.classList.add("is-moving");
  pruneHidden(id);

  if (!panel.slides.has(id)) {
    // Screen x follows view lon (= -rotLon), screen y runs against lat.
    const ux = -leg.lon / len;
    const uy = -leg.lat / len;
    const slide = makeSlide(id);
    const reach = clearance(ux, uy, slide.el.offsetHeight, id);
    slide.x = ux * reach;
    slide.y = uy * reach;
  }
  panel.target = id;
  panel.leg = leg;
  panel.t = 0;
  layoutSlides();
}

function layoutSlides() {
  const target = panel.target ? panel.slides.get(panel.target) : null;
  const t = target ? panel.t : 0;
  const endH = target ? target.el.offsetHeight : panel.startH; // read before writing
  const sx = target ? target.x * t : 0;
  const sy = target ? target.y * t : 0;
  panel.slides.forEach(function (slide) {
    slide.el.style.transform =
      "translate3d(" + (slide.x - sx).toFixed(2) + "px, " + (slide.y - sy).toFixed(2) + "px, 0)";
  });
  panel.track.style.height = (panel.startH + (endH - panel.startH) * t).toFixed(1) + "px";
  markActiveSlide();
}

/* While a hand holds the globe there is no destination, so the panel follows
   the record the globe is being turned toward: the one with the most
   progress from where the leg began. Passing it rests on it and starts a
   fresh leg; backing out past the start lets it go; a rival has to lead by a
   clear margin before it takes over, and the takeover freezes the sheet
   where it stands so nothing jumps. */
function steerDrag() {
  if (!panel.from) panel.from = globeRotation();
  let best = null;
  let bestT = 0;
  state.records.forEach(function (record) {
    const leg = legTo(record.id);
    if (Math.hypot(leg.lat, leg.lon) < DRAG_LEG_MIN) return;
    const t = legProgress(leg);
    if (t > bestT) { best = record.id; bestT = t; }
  });

  if (panel.target) {
    const t = legProgress(panel.leg);
    if (t === null) return;
    if (t >= 1) {
      restOn(panel.target);
    } else if (t <= 0) {
      panel.t = 0;
      panel.target = null;
      panel.leg = null;
    } else if (best !== panel.target && bestT > t + DRAG_TAKEOVER) {
      bake(t);
      panel.from = globeRotation();
    }
    return;
  }
  // A clear lead first, so a one-pixel nudge does not load a record's frame.
  if (best && bestT > 0.01) beginLeg(best);
}

function updatePanel(settled) {
  if (!panel.track) return;
  if (state.dragging) steerDrag();
  if (!panel.target) {
    if (isMoving()) layoutSlides();
    return;
  }
  const progress = legProgress(panel.leg);
  const t = progress === null ? 1 : Math.max(0, Math.min(1, progress));
  if (!state.dragging && (settled || t > 0.9995)) {
    restOn(panel.target);
    return;
  }
  panel.t = t;
  layoutSlides();
}

/* -------------------------------------------------------- record view */

function recordMarkup(record) {
  const theme = THEMES[record.title] || FALLBACK_THEME;
  const edges = record.edges
    .filter(function (edge) { return state.byId.has(edge.target); })
    .map(function (edge) {
      const target = state.byId.get(edge.target);
      return '<a class="edge" href="#' + target.id + '" data-goto="' + target.id + '"><em>' +
        escapeHtml(edge.type.replace(/_/g, " ")) + "</em> " + escapeHtml(target.title) + "</a>";
    })
    .join("");

  return '<div class="record-head">' +
    '<div class="record-head-text">' +
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
  if (id !== state.activeId) state.selectedAt = performance.now();
  state.activeId = id;
  state.ease = opts.ease || (opts.fromTour ? EASE_TOUR : EASE_PICK);

  const orient = orientationFor(record);
  state.targetLat = orient.lat;
  state.targetLon = orient.lon;

  els.hudTitle.textContent = record.title;
  els.hudSub.innerHTML = "<span>" + escapeHtml(record.subtitle || record.id) + "</span>";

  state.nodes.forEach(function (node, nodeId) {
    node.classList.toggle("is-active", nodeId === id);
    labelCard(node, state.byId.get(nodeId), nodeId === id);
  });
  beginLeg(id);
  markActiveSlide();
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
    if (!state.dragMoved) {
      // A press can still nudge the rotation by a pixel and overwrite the
      // target; point the globe (and any leg in flight) home again.
      select(state.activeId, { ease: state.ease });
      return;
    }
    state.dragMoved = false;
    select(nearestRecordId(), { ease: EASE_COAST });
  }
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
}

/* The current card is a door: one click on it goes through to the page its
   record opens, and a modified click opens that page in a new tab, as a link
   would. The grace period keeps the second half of a double-click, whose
   first half just made the card current, from walking straight through. */
function openCurrentCard(id, event) {
  const record = state.byId.get(id);
  if (!record || !record.opens || id !== state.activeId) return false;
  if (performance.now() - state.selectedAt < OPEN_GRACE_MS) return true;
  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    window.open(record.opens, "_blank", "noopener");
  } else {
    location.href = record.opens;
  }
  return true;
}

function labelCard(node, record, current) {
  if (current && record.opens) {
    node.setAttribute("aria-label", "Open " + record.title + " (" + record.opens + ")");
    node.title = "Open " + record.opens;
  } else {
    node.setAttribute("aria-label", record.title + " — " + (record.subtitle || record.id));
    node.removeAttribute("title");
  }
}

function bindDelegatedNav() {
  document.addEventListener("click", function (event) {
    const trigger = event.target.closest ? event.target.closest("[data-goto]") : null;
    if (!trigger) return;
    event.preventDefault();
    const id = trigger.getAttribute("data-goto");
    if (trigger.classList.contains("ribbon-card") && openCurrentCard(id, event)) return;
    select(id);
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
    labelCard(node, record, false);
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
  panel.track = document.createElement("div");
  panel.track.className = "record-track";
  els.record.innerHTML = "";
  els.record.appendChild(panel.track);
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
