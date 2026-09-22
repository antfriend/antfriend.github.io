/* rfc-reader.js — the RFC corpus, read as rendered markdown (RFCs/index.html).
   The contents panel is the RFCs record from index_ttdb.md, drawn the way the
   front door draws it, and its title links open here rather than as raw
   text. The record panel beside it renders one RFC at a time, and slides
   between them the way the front door's panel slides between records: along
   the step from one RFC's coordinate on the RFC globe to the next. */

const INDEX_DB = "../index_ttdb.md";
const DEFAULT_DOC = "INDEX.md";

/* This page lives in RFCs/, one level below the site root. Links in the RFC
   files resolve against RFCs/; links in index_ttdb.md against the root. */
const READER_DIR = new URL("./", location.href);
const SITE_ROOT = new URL("../", location.href);

/* Only a plain file name beside this page is ever fetched. */
const SAFE_DOC = /^[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;
/* A TTDB is walked on the OG globe, as the RFCs record's own corpus link is. */
const TTDB_FILE = /[_.]ttdb\.md$/i;

/* One accent per series, borrowed from the front door's card accents. */
const SERIES_ACCENT = {
  TTDB: "#8fe6d2",
  TTN: "#7cc7ff",
  TTCP: "#f2c14d",
  A32: "#ff7a5c",
  ARC: "#a6d96a",
  TTG: "#d9b978",
};
const RFCS_ACCENT = "#ff9f7c"; // the RFCs card's own accent on the front door

const SLIDE_MS = 520;
const SLIDE_GAP = 24; // px of clear panel between neighbouring slides

const els = {
  contents: document.getElementById("contentsView"),
  record: document.getElementById("recordView"),
  rail: document.getElementById("topicRail"),
  railTitle: document.getElementById("railTitle"),
  status: document.getElementById("status"),
  sourcePill: document.getElementById("sourcePill"),
};

const state = {
  corpus: [],         // { file, number, title, series, accent, lat, lon, globeHref }, contents order
  byFile: new Map(),  // file -> corpus entry
  series: [],         // { name, lat, blurb, accent, entries }
  current: null,      // file on show
  texts: new Map(),   // file -> Promise<string>
  seq: 0,             // bumps per open(), so a slow fetch cannot land over a newer pick
};

const panel = {
  track: null,
  current: null, // the slide on show
  moving: null,  // { anims } while a slide is in flight
};

/* ------------------------------------------------------------ helpers */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeDecode(value) {
  try { return decodeURIComponent(value); } catch (e) { return value; }
}

function plainText(html) {
  const t = document.createElement("template");
  t.innerHTML = html;
  return t.content.textContent || "";
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fetchText(url) {
  return fetch(url, { cache: "no-cache" }).then(function (response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.text();
  });
}

function loadDoc(file) {
  if (!state.texts.has(file)) {
    const pending = fetchText(new URL(file, READER_DIR));
    // A failed fetch is forgotten, so the next visit tries again.
    pending.catch(function () { state.texts.delete(file); });
    state.texts.set(file, pending);
  }
  return state.texts.get(file);
}

/* --------------------------------------------------------------- links */

function isReaderPath(pathname) {
  return pathname === READER_DIR.pathname || pathname === READER_DIR.pathname + "index.html";
}

/* The default document is the bare page; every other one rides on ?rfc=. */
function docHref(doc, anchor) {
  const hash = anchor ? "#" + encodeURIComponent(anchor) : "";
  return (doc === DEFAULT_DOC ? "./" : "?rfc=" + encodeURIComponent(doc)) + hash;
}

/* A same-origin URL written relative to this page, so links read the way the
   files wrote them; anything else stays absolute. */
function relativeHref(url) {
  if (url.origin !== location.origin) return url.href;
  const tail = url.search + url.hash;
  if (url.pathname.indexOf(READER_DIR.pathname) === 0) {
    return (url.pathname.slice(READER_DIR.pathname.length) || "./") + tail;
  }
  if (url.pathname.indexOf(SITE_ROOT.pathname) === 0) {
    return "../" + url.pathname.slice(SITE_ROOT.pathname.length) + tail;
  }
  return url.pathname + tail;
}

/* ?rfc= takes a file name, or a bare id such as TTDB-RFC-0001, which names
   the base RFC whose file starts with it rather than any amendment to it. */
function resolveDocName(raw) {
  const name = String(raw || "").trim();
  if (!name) return null;
  const file = /\.md$/i.test(name) ? name : name + ".md";
  if (state.byFile.has(file)) return file;
  const stem = file.replace(/\.md$/i, "").toLowerCase();
  const hit = state.corpus.filter(function (e) { return e.file.toLowerCase() === stem + ".md"; })[0] ||
    state.corpus.filter(function (e) {
      const lower = e.file.toLowerCase();
      return lower.indexOf(stem + "-") === 0 && !/amendment/.test(lower.slice(stem.length));
    })[0];
  if (hit) return hit.file;
  return SAFE_DOC.test(file) && !TTDB_FILE.test(file) ? file : null;
}

function docForUrl(url) {
  if (url.origin !== location.origin) return null;
  if (isReaderPath(url.pathname)) {
    const asked = url.searchParams.get("rfc");
    return asked ? resolveDocName(asked) : DEFAULT_DOC;
  }
  if (url.pathname.indexOf(READER_DIR.pathname) !== 0) return null;
  const name = safeDecode(url.pathname.slice(READER_DIR.pathname.length));
  return SAFE_DOC.test(name) && !TTDB_FILE.test(name) ? name : null;
}

/* Where a link in rendered markdown goes. An RFC beside this page opens in
   it; a TTDB file opens on the OG globe; anything else is an ordinary link.
   Null means the link is not safe to follow and stays as words. */
function linkTarget(raw, ctx) {
  const href = String(raw || "").trim();
  if (!href) return null;
  if (href.charAt(0) === "#") {
    const anchor = safeDecode(href.slice(1));
    return ctx.doc ? { href: docHref(ctx.doc, anchor), doc: ctx.doc, anchor: anchor } : { href: href };
  }
  let url;
  try { url = new URL(href, ctx.base); } catch (e) { return null; }
  if (!/^(https?|mailto):$/.test(url.protocol)) return null;
  const doc = docForUrl(url);
  if (doc) {
    const anchor = safeDecode(url.hash.slice(1));
    return { href: docHref(doc, anchor), doc: doc, anchor: anchor };
  }
  if (url.origin === location.origin && TTDB_FILE.test(url.pathname) &&
      url.pathname.indexOf(SITE_ROOT.pathname) === 0) {
    return { href: "../index_OG.html?ttdb=" + url.pathname.slice(SITE_ROOT.pathname.length) };
  }
  return { href: relativeHref(url) };
}

function linkMarkup(href, labelHtml, ctx) {
  const target = linkTarget(href, ctx);
  if (!target) return labelHtml;
  let attrs = ' href="' + escapeHtml(target.href) + '"';
  if (target.doc) attrs += ' data-rfc="' + escapeHtml(target.doc) + '" data-preview="off"';
  if (target.anchor) attrs += ' data-anchor="' + escapeHtml(target.anchor) + '"';
  return "<a" + attrs + ">" + labelHtml + "</a>";
}

/* A toot frame is image syntax whose target is a document rather than a
   picture: ![label](thing.html) renders as an inline iframe of that page.
   Same rule the front door and the OG reader use. */
function mediaMarkup(alt, src, ctx) {
  let url;
  try { url = new URL(src, ctx.base); } catch (e) { return escapeHtml(alt); }
  if (!/^https?:$/.test(url.protocol)) return escapeHtml(alt);
  const href = escapeHtml(relativeHref(url));
  if (/\.(html|md|pdf)$/i.test(url.pathname)) {
    return '<iframe class="record-html-embed" src="' + href + '" title="' + escapeHtml(alt) +
      '" loading="lazy" referrerpolicy="no-referrer"></iframe>';
  }
  return '<img class="record-media" src="' + href + '" alt="' + escapeHtml(alt) + '" loading="lazy" />';
}

/* ------------------------------------------------------------ markdown */

/* A small CommonMark-shaped renderer, enough for everything the RFC corpus
   writes: ATX headings, paragraphs, fences, tables, block quotes, nested
   ordered and bullet lists, rules, and the inline set. Raw HTML is never
   passed through; `<lat>` in a spec is text. */

const FENCE = /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`]*)[^`]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE = /^ {0,3}> ?/;
const ITEM = /^( *)([-*+]|\d{1,9}[.)])(?:[ \t]+(.*)|[ \t]*$)/;
const TABLE_DELIM = /^ *\|? *:?-+:? *(?:\| *:?-+:? *)*\|? *$/;
/* Lines of **Label:** value, as every RFC's header block is written. */
const META_LINE = /^\*\*([^*]+?):\*\*\s*(.*)$/;

function makeCtx(doc, base) {
  const seen = new Map();
  return {
    doc: doc,
    base: base,
    title: "",
    meta: {},
    slug: function (text) {
      const root = text.toLowerCase().trim()
        .replace(/[^\p{L}\p{N}\s_-]/gu, "")
        .replace(/\s/g, "-") || "section";
      const n = seen.get(root) || 0;
      seen.set(root, n + 1);
      return n ? root + "-" + n : root;
    },
  };
}

function renderMarkdown(source, ctx) {
  const lines = String(source).replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
  return renderBlocks(lines, ctx, false);
}

function indentOf(line) {
  return line.length - line.replace(/^ +/, "").length;
}

function stripIndent(line, n) {
  return line.slice(Math.min(n, indentOf(line)));
}

function splitRow(line) {
  let s = line.trim();
  if (s.charAt(0) === "|") s = s.slice(1);
  if (s.charAt(s.length - 1) === "|" && s.charAt(s.length - 2) !== "\\") s = s.slice(0, -1);
  const cells = [];
  let cell = "";
  for (let k = 0; k < s.length; k += 1) {
    // GFM: \| is a literal pipe in a cell, even inside a code span.
    if (s.charAt(k) === "\\" && s.charAt(k + 1) === "|") { cell += "|"; k += 1; continue; }
    if (s.charAt(k) === "|") { cells.push(cell.trim()); cell = ""; continue; }
    cell += s.charAt(k);
  }
  cells.push(cell.trim());
  return cells;
}

function isTableStart(lines, i) {
  const head = lines[i];
  const delim = lines[i + 1];
  if (head.indexOf("|") < 0 || delim === undefined || delim.indexOf("|") < 0) return false;
  if (!TABLE_DELIM.test(delim)) return false;
  return splitRow(head).length === splitRow(delim).length;
}

/* Would this line end a paragraph running above it? */
function interrupts(lines, i) {
  const line = lines[i];
  if (FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line)) return true;
  if (isTableStart(lines, i)) return true;
  const item = line.match(ITEM);
  // As in CommonMark, only a list that starts at 1 may break into prose.
  return Boolean(item && item[3] && (!/\d/.test(item[2]) || parseInt(item[2], 10) === 1));
}

function renderBlocks(lines, ctx, tight) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    let m = line.match(FENCE);
    if (m) {
      const indent = m[1].length;
      const marker = m[2];
      const body = [];
      i += 1;
      while (i < lines.length) {
        const close = lines[i].match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (close && close[1].charAt(0) === marker.charAt(0) && close[1].length >= marker.length) {
          i += 1;
          break;
        }
        body.push(stripIndent(lines[i], indent));
        i += 1;
      }
      out.push(fenceMarkup(body.join("\n"), m[3]));
      continue;
    }

    m = line.match(HEADING);
    if (m) {
      out.push(headingMarkup(m[1].length, m[2] || "", ctx));
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      out.push("<hr />");
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const inner = [];
      while (i < lines.length && lines[i].trim() && QUOTE.test(lines[i])) {
        inner.push(lines[i].replace(QUOTE, ""));
        i += 1;
      }
      out.push("<blockquote>" + renderBlocks(inner, ctx, false) + "</blockquote>");
      continue;
    }

    if (isTableStart(lines, i)) {
      const rows = [lines[i]];
      const delim = lines[i + 1];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].indexOf("|") >= 0) {
        rows.push(lines[i]);
        i += 1;
      }
      out.push(tableMarkup(rows, delim, ctx));
      continue;
    }

    m = line.match(ITEM);
    if (m && m[1].length < 4) {
      const list = renderList(lines, i, ctx);
      out.push(list.html);
      i = list.next;
      continue;
    }

    const para = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !interrupts(lines, i)) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(paragraphMarkup(para, ctx, tight));
  }
  return out.join("\n");
}

/* A list keeps going while its items do. An item owns every line indented
   past its marker, so nesting follows the indentation as written; a blank
   line anywhere between items makes the whole list loose. */
function renderList(lines, start, ctx) {
  const first = lines[start].match(ITEM);
  const ordered = /\d/.test(first[2]);
  const items = [];
  let loose = false;
  let i = start;

  while (i < lines.length) {
    const m = lines[i].match(ITEM);
    if (!m || /\d/.test(m[2]) !== ordered || m[1].length >= 4) break;
    const indent = m[1].length;
    let gap = lines[i].slice(indent + m[2].length).length - (m[3] || "").length;
    if (gap < 1 || gap > 4) gap = 1;
    const contentIndent = indent + m[2].length + gap;
    const body = [m[3] || ""];
    let blank = false;
    i += 1;

    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { body.push(""); blank = true; i += 1; continue; }
      const lIndent = indentOf(l);
      if (lIndent > indent) {
        body.push(l.slice(Math.min(lIndent, contentIndent)));
        i += 1;
        continue;
      }
      if (blank || ITEM.test(l) || interrupts(lines, i)) break;
      body.push(l.trim()); // a lazy continuation of the item's paragraph
      i += 1;
    }

    let trailing = 0;
    while (body.length && !body[body.length - 1].trim()) { body.pop(); trailing += 1; }
    if (body.some(function (l) { return !l.trim(); })) loose = true;
    const next = lines[i] !== undefined ? lines[i].match(ITEM) : null;
    if (trailing && next && /\d/.test(next[2]) === ordered && next[1].length < 4) loose = true;
    items.push(body);
    if (trailing && !(next && /\d/.test(next[2]) === ordered)) break;
  }

  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const tag = ordered ? "ol" : "ul";
  const open = ordered && startNum !== 1 ? '<ol start="' + startNum + '">' : "<" + tag + ">";
  const html = open + items.map(function (body) {
    return "<li>" + renderBlocks(body, ctx, !loose) + "</li>";
  }).join("") + "</" + tag + ">";
  return { html: html, next: i };
}

function fenceMarkup(code, lang) {
  const pre = '<pre class="record-ascii">' + escapeHtml(code.replace(/\s+$/, "")) + "</pre>";
  // The info string is part of the format in these specs (```mmpdb,
  // ```cursor, ```ttdb-episode), so it is shown, not just kept.
  if (!lang) return pre;
  return '<figure class="record-fence"><figcaption>' + escapeHtml(lang) + "</figcaption>" + pre + "</figure>";
}

function headingMarkup(level, text, ctx) {
  const inner = renderInline(text, ctx);
  const words = plainText(inner).trim();
  if (level === 1 && !ctx.title) ctx.title = words;
  const id = ctx.slug(words);
  const anchor = ctx.doc
    ? ' <a class="heading-anchor" href="' + escapeHtml(docHref(ctx.doc, id)) + '" data-rfc="' +
      escapeHtml(ctx.doc) + '" data-anchor="' + escapeHtml(id) + '" data-preview="off" aria-label="Link to this section">#</a>'
    : "";
  return "<h" + level + ' id="' + escapeHtml(id) + '">' + inner + anchor + "</h" + level + ">";
}

function tableMarkup(rows, delim, ctx) {
  const align = splitRow(delim).map(function (cell) {
    const left = cell.charAt(0) === ":";
    const right = cell.charAt(cell.length - 1) === ":";
    return left && right ? "center" : right ? "right" : left ? "left" : "";
  });
  const width = align.length;
  function cells(line, tag) {
    const found = splitRow(line);
    let html = "";
    for (let k = 0; k < width; k += 1) {
      const style = align[k] ? ' style="text-align:' + align[k] + '"' : "";
      html += "<" + tag + style + ">" + renderInline(found[k] || "", ctx) + "</" + tag + ">";
    }
    return "<tr>" + html + "</tr>";
  }
  return '<div class="rfc-table"><table><thead>' + cells(rows[0], "th") + "</thead><tbody>" +
    rows.slice(1).map(function (row) { return cells(row, "td"); }).join("") +
    "</tbody></table></div>";
}

/* The **Label:** header every RFC opens with is a record's metadata, not a
   sentence, so it is set as a list of fields instead of run together. */
function paragraphMarkup(lines, ctx, tight) {
  if (META_LINE.test(lines[0])) {
    const fields = [];
    lines.forEach(function (line) {
      const m = line.match(META_LINE);
      if (m) fields.push({ label: m[1].trim(), value: m[2] });
      else fields[fields.length - 1].value += "\n" + line;
    });
    if (fields.length > 1) {
      return '<dl class="rfc-meta">' + fields.map(function (field) {
        const key = field.label.toLowerCase();
        if (!(key in ctx.meta)) ctx.meta[key] = field.value;
        // A long value (Depends on, most often) gets the whole row.
        return "<div" + (field.value.length > 40 ? ' class="is-wide"' : "") + "><dt>" +
          renderInline(field.label, ctx) + "</dt><dd>" +
          renderInline(field.value, ctx) + "</dd></div>";
      }).join("") + "</dl>";
    }
  }
  const inline = renderInline(lines.join("\n"), ctx);
  return tight ? inline : "<p>" + inline + "</p>";
}

function emphasis(s) {
  return s
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, "$1<strong>$2</strong>")
    .replace(/(^|[^*\w])\*(?=[^\s*])([^*]*?[^\s*])\*(?![*\w])/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_(?=[^\s_])([^_]*?[^\s_])_(?!\w)/g, "$1<em>$2</em>")
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<del>$1</del>");
}

/* Everything that must not be read as markup again (code, escapes, links)
   is parked in a slot first; the remaining text is escaped and emphasised,
   then the slots are put back, innermost last. */
function renderInline(text, ctx) {
  const slots = [];
  function hold(html) { return "\u0001" + (slots.push(html) - 1) + "\u0002"; }
  let s = String(text);

  s = s.replace(/\\`/g, function () { return hold("`"); });
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, function (_m, _ticks, code) {
    let c = code.replace(/\n/g, " ");
    if (/^ [\s\S]*[^ ][\s\S]* $/.test(c)) c = c.slice(1, -1);
    return hold("<code>" + escapeHtml(c) + "</code>");
  });
  s = s.replace(/\\([!-\/:-@\[-`{-~])/g, function (_m, ch) { return hold(escapeHtml(ch)); });
  s = s.replace(/<((?:https?|mailto):[^\s<>]+)>/g, function (_m, url) {
    return hold(linkMarkup(url, escapeHtml(url), ctx));
  });
  s = s.replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, function (_m, alt, src) {
    return hold(mediaMarkup(alt, src, ctx));
  });
  s = s.replace(/\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, function (_m, label, href) {
    return hold(linkMarkup(href, emphasis(escapeHtml(label)), ctx));
  });
  s = s.replace(/\bhttps?:\/\/[^\s<>\u0001\u0002]+/g, function (found) {
    const m = found.match(/^(.*?)([.,;:!?)\]'"*_]*)$/);
    return hold(linkMarkup(m[1], escapeHtml(m[1]), ctx)) + m[2];
  });

  s = emphasis(escapeHtml(s));
  s = s.replace(/(?: {2,}|\\)\n/g, "<br />").replace(/\n/g, " ");

  let before;
  do {
    before = s;
    s = s.replace(/\u0001(\d+)\u0002/g, function (_m, n) { return slots[Number(n)]; });
  } while (s !== before);
  return s;
}

/* ------------------------------------------------------------ contents */

function parseRecords(text) {
  const records = [];
  text.split(/^---\s*$/m).forEach(function (chunk) {
    const lines = chunk.split(/\r?\n/);
    const at = lines.findIndex(function (l) { return /^@LAT-?\d+LON-?\d+\s*(\|.*)?$/i.test(l); });
    if (at < 0) return;
    const head = lines[at].match(/^@LAT(-?\d+)LON(-?\d+)\s*(\|.*)?$/i);
    const edges = [];
    let opens = "";
    (head[3] || "").split("|").forEach(function (attr) {
      const rel = attr.trim().match(/^relates:(.*)$/i);
      if (!rel) return;
      rel[1].split(",").forEach(function (pair) {
        const parts = pair.split(">").map(function (s) { return (s || "").trim(); });
        if (!parts[0] || !parts[1]) return;
        if (parts[0] === "opens") opens = parts[1];
        else edges.push({ type: parts[0], target: parts[1].replace(/^@/, "") });
      });
    });
    let title = "";
    let subtitle = "";
    const body = [];
    lines.slice(at + 1).forEach(function (line) {
      if (!title && /^##\s+/.test(line)) { title = line.replace(/^##\s+/, "").trim(); return; }
      if (title && !subtitle && /^###\s+/.test(line)) { subtitle = line.replace(/^###\s+/, "").trim(); return; }
      body.push(line);
    });
    if (!title) return;
    records.push({
      id: "LAT" + Number(head[1]) + "LON" + Number(head[2]),
      title: title,
      subtitle: subtitle,
      edges: edges,
      opens: opens,
      body: body.join("\n").trim(),
    });
  });
  return records;
}

/* The record that opens this page is the one to show; before it did, the
   RFCs record opened the plain index, so its title is the fallback. */
function pickContentsRecord(records) {
  return records.filter(function (r) {
    if (!r.opens) return false;
    try {
      const url = new URL(r.opens, SITE_ROOT);
      return url.origin === location.origin && isReaderPath(url.pathname);
    } catch (e) { return false; }
  })[0] || records.filter(function (r) { return r.title === "RFCs"; })[0] || null;
}

/* Series heads read **TTDB** · `lat 10` · blurb; each row under one reads
   - [`0001`](globe link) [Title](document link). */
function buildCorpus(body) {
  let series = null;
  body.split(/\r?\n/).forEach(function (line) {
    const head = line.match(/^\*\*([A-Za-z0-9]+)\*\*\s*·\s*`lat\s*(-?\d+)`\s*·\s*(.+)$/);
    if (head) {
      series = {
        name: head[1],
        lat: Number(head[2]),
        blurb: head[3].trim(),
        accent: SERIES_ACCENT[head[1]] || RFCS_ACCENT,
        entries: [],
      };
      state.series.push(series);
      return;
    }
    const row = line.match(/^\s*[-*]\s+\[`([^`]+)`\]\(([^)\s]+)\)\s+\[([^\]]+)\]\(([^)\s]+)\)/);
    if (!row) return;
    const target = linkTarget(row[4], { doc: null, base: SITE_ROOT });
    if (!target || !target.doc || state.byFile.has(target.doc)) return;
    const globe = new URL(row[2], SITE_ROOT);
    const toot = (globe.searchParams.get("toot") || "").match(/^lat(-?\d+)lon(-?\d+)$/i);
    const entry = {
      file: target.doc,
      number: row[1],
      title: row[3],
      series: series ? series.name : "",
      accent: series ? series.accent : RFCS_ACCENT,
      lat: toot ? Number(toot[1]) : null,
      lon: toot ? Number(toot[2]) : null,
      globeHref: relativeHref(globe),
    };
    state.corpus.push(entry);
    state.byFile.set(entry.file, entry);
    if (series) series.entries.push(entry);
  });
}

function renderContents(record, records) {
  const byId = new Map(records.map(function (r) { return [r.id, r]; }));
  const edges = record.edges
    .filter(function (edge) { return byId.has(edge.target); })
    .map(function (edge) {
      return '<a class="edge" href="../index.html#' + escapeHtml(edge.target) + '" data-preview="off"><em>' +
        escapeHtml(edge.type.replace(/_/g, " ")) + "</em> " + escapeHtml(byId.get(edge.target).title) + "</a>";
    })
    .join("");

  els.contents.innerHTML = '<div class="record-slide">' +
    '<div class="record-head"><div class="record-head-text">' +
    '<div class="record-coord">@' + escapeHtml(record.id) + " · index_ttdb.md</div>" +
    '<a class="record-open" href="../index.html#' + escapeHtml(record.id) + '" data-preview="off" style="border-color:' +
    RFCS_ACCENT + '">&larr; ' + escapeHtml(record.title) + " on the globe</a>" +
    "</div></div>" +
    renderMarkdown(record.body, makeCtx(null, SITE_ROOT)) +
    (edges ? '<div class="record-edges">' + edges + "</div>" : "") +
    "</div>";
}

function contentsError(message) {
  els.contents.innerHTML = '<div class="record-slide"><p>Could not load <code>index_ttdb.md</code>: ' +
    escapeHtml(message) + ". The RFCs still open from the index on the right.</p></div>";
}

/* Mark the current row, and keep it in sight when the panel scrolls. */
function markContents() {
  let row = null;
  els.contents.querySelectorAll("li").forEach(function (li) {
    const link = li.querySelector("a[data-rfc]");
    const on = Boolean(link && link.getAttribute("data-rfc") === state.current);
    li.classList.toggle("is-current", on);
    if (on) row = li;
  });
  const box = els.contents;
  if (!row || box.scrollHeight <= box.clientHeight + 1) return;
  const b = box.getBoundingClientRect();
  const r = row.getBoundingClientRect();
  if (r.top < b.top + 12) box.scrollTop -= b.top + 12 - r.top;
  else if (r.bottom > b.bottom - 12) box.scrollTop += r.bottom - b.bottom + 12;
}

/* ---------------------------------------------------------- the reader */

function orderOf(doc) {
  const entry = state.byFile.get(doc);
  return entry ? state.corpus.indexOf(entry) : -1;
}

function edgeMarkup(type, entry) {
  return '<a class="edge" href="' + escapeHtml(docHref(entry.file)) + '" data-rfc="' + escapeHtml(entry.file) +
    '" data-preview="off" title="' + escapeHtml(entry.file) + '"><em>' + type + "</em> " + escapeHtml(entry.title) + "</a>";
}

/* The header fields that name other RFCs, in the order their edges show. */
const HEADER_EDGES = ["amends", "depends on", "required by", "companion"];

/* prev and next walk the contents order; the rest come from the RFC's own
   header, so the edges say what the spec says it builds on. */
function docEdges(doc, ctx) {
  const out = [];
  const at = orderOf(doc);
  if (at > 0) out.push(edgeMarkup("prev", state.corpus[at - 1]));
  if (at >= 0 && at < state.corpus.length - 1) out.push(edgeMarkup("next", state.corpus[at + 1]));
  if (at < 0 && doc === DEFAULT_DOC && state.corpus.length) out.push(edgeMarkup("next", state.corpus[0]));

  const seen = new Set([doc]);
  HEADER_EDGES.forEach(function (type) {
    (String(ctx.meta[type] || "").match(/\b[A-Z0-9]+-RFC-\d{4}\b/g) || []).forEach(function (id) {
      const file = resolveDocName(id);
      if (!file || seen.has(file) || !state.byFile.has(file)) return;
      seen.add(file);
      out.push(edgeMarkup(type, state.byFile.get(file)));
    });
  });

  if (doc !== DEFAULT_DOC) {
    out.push('<a class="edge" href="./" data-rfc="' + DEFAULT_DOC + '" data-preview="off"><em>index</em> RFC Index</a>');
  }
  out.push('<a class="edge" href="' + escapeHtml(encodeURI(doc)) + '"><em>source</em> ' + escapeHtml(doc) + "</a>");
  return '<div class="record-edges">' + out.join("") + "</div>";
}

function docHead(doc) {
  const entry = state.byFile.get(doc);
  let coord;
  let open = "";
  if (entry) {
    coord = [entry.series, entry.number, entry.lat !== null ? "lat " + entry.lat + " · lon " + entry.lon : "", doc];
    if (entry.globeHref) {
      open = '<a class="record-open" href="' + escapeHtml(entry.globeHref) + '" style="border-color:' + entry.accent +
        '">Open ' + escapeHtml(entry.number) + " on the RFC globe &rarr;</a>";
    }
  } else if (doc === DEFAULT_DOC) {
    coord = ["RFC index", doc];
    open = '<a class="record-open" href="../index_OG.html?ttdb=rfc.ttdb.md" style="border-color:' + RFCS_ACCENT +
      '">Walk the compressed corpus on the RFC globe &rarr;</a>';
  } else {
    coord = ["RFC", doc];
  }
  return '<div class="record-head"><div class="record-head-text"><div class="record-coord">' +
    coord.filter(Boolean).map(escapeHtml).join(" · ") + "</div>" + open + "</div></div>";
}

function docView(doc, text) {
  const ctx = makeCtx(doc, READER_DIR);
  const body = renderMarkdown(text, ctx);
  const entry = state.byFile.get(doc);
  return {
    html: docHead(doc) + '<div class="rfc-doc">' + body + "</div>" + docEdges(doc, ctx),
    title: ctx.title || (entry ? entry.title : doc),
  };
}

function errorView(doc, error) {
  return {
    html: docHead(doc) + '<p>Could not load <code>' + escapeHtml(doc) + "</code>: " + escapeHtml(error.message) +
      ". Serve this page over http (not file://) and try again.</p>" + docEdges(doc, makeCtx(doc, READER_DIR)),
    title: doc,
  };
}

/* ---------------------------------------------------------- the slides */

/* Where a record sits on the RFC globe. The index and any file the contents
   do not list sit at the origin, off every lane. */
function coordOf(doc) {
  const entry = state.byFile.get(doc);
  return entry && entry.lat !== null ? { lat: entry.lat, lon: entry.lon } : { lat: 0, lon: 0 };
}

/* The front door lays the incoming slide out along the globe's step: lon to
   the right, lat up. Same here, on the RFC globe's coordinates. */
function direction(from, to) {
  if (!from) return null;
  const a = coordOf(from);
  const b = coordOf(to);
  let x = b.lon - a.lon;
  let y = -(b.lat - a.lat);
  if (!x && !y) x = orderOf(to) >= orderOf(from) ? 1 : -1;
  const len = Math.hypot(x, y);
  return { x: x / len, y: y / len };
}

/* Finish whatever is in flight: drop every slide but the one on show, and
   hand the panel back to normal flow. */
function settle() {
  if (panel.moving) {
    panel.moving.anims.forEach(function (anim) { anim.cancel(); });
    panel.moving = null;
  }
  Array.from(panel.track.children).forEach(function (child) {
    if (!panel.current || child !== panel.current) child.remove();
  });
  panel.track.classList.remove("is-moving");
  panel.track.style.height = "";
  if (panel.current) panel.current.inert = false;
}

/* A new record is read from its top, so bring the panel's top on screen. */
function bringPanelIntoView() {
  const top = els.record.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.5) {
    window.scrollTo({ top: window.scrollY + top - 12, behavior: "auto" });
  }
}

function scrollToAnchor(anchor, smooth) {
  if (!anchor || !panel.current) return false;
  const target = Array.from(panel.current.querySelectorAll("[id]")).filter(function (el) {
    return el.id === anchor;
  })[0];
  if (!target) return false;
  target.scrollIntoView({ block: "start", behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  return true;
}

function show(html, dir, anchor) {
  settle();
  const old = panel.current;
  const slide = document.createElement("div");
  slide.className = "record-slide";
  slide.innerHTML = html;
  panel.track.appendChild(slide);
  panel.current = slide;

  if (!old) {
    scrollToAnchor(anchor, false);
    return;
  }
  bringPanelIntoView();
  if (!dir || reducedMotion() || typeof slide.animate !== "function") {
    old.remove();
    scrollToAnchor(anchor, false);
    return;
  }

  // The window is the part of the panel on screen; both slides are clipped
  // to it while they move, so a long RFC slides as one screenful.
  const top = Math.max(0, els.record.getBoundingClientRect().top);
  const winH = Math.max(160, Math.min(Math.max(old.offsetHeight, slide.offsetHeight), window.innerHeight - top));
  const w = panel.track.clientWidth;
  const alongX = Math.abs(dir.x) > 1e-6 ? (w + SLIDE_GAP) / Math.abs(dir.x) : Infinity;
  const alongY = Math.abs(dir.y) > 1e-6 ? (winH + SLIDE_GAP) / Math.abs(dir.y) : Infinity;
  const reach = Math.min(alongX, alongY);
  const dx = (dir.x * reach).toFixed(1);
  const dy = (dir.y * reach).toFixed(1);

  panel.track.style.setProperty("--window-h", winH.toFixed(1) + "px");
  panel.track.style.height = winH.toFixed(1) + "px";
  panel.track.classList.add("is-moving");
  old.inert = true;

  const timing = { duration: SLIDE_MS, easing: "cubic-bezier(0.22, 0.7, 0.2, 1)" };
  const leave = old.animate([
    { transform: "translate3d(0, 0, 0)" },
    { transform: "translate3d(" + -dx + "px, " + -dy + "px, 0)" },
  ], timing);
  const enter = slide.animate([
    { transform: "translate3d(" + dx + "px, " + dy + "px, 0)" },
    { transform: "translate3d(0, 0, 0)" },
  ], timing);
  panel.moving = { anims: [leave, enter] };
  enter.finished.then(function () {
    if (!panel.moving || panel.moving.anims[1] !== enter) return; // overtaken
    settle();
    scrollToAnchor(anchor, false);
  }).catch(function () { /* cancelled by a newer pick */ });
}

/* ---------------------------------------------------------------- rail */

function railButton(file, label, out, accent, active) {
  return '<li><button type="button" class="topic' + (active ? " active" : "") + '" data-rfc="' + escapeHtml(file) +
    '" style="--dot:' + accent + '"><span class="dot"></span>' + escapeHtml(label) +
    (out ? '<span class="out">' + escapeHtml(out) + "</span>" : "") + "</button></li>";
}

/* On an RFC, the rail is its series; on the index, one door per series. */
function renderRail() {
  const entry = state.byFile.get(state.current);
  const series = entry ? state.series.filter(function (s) { return s.name === entry.series; })[0] : null;
  if (series) {
    els.railTitle.textContent = series.name + " · " + series.blurb;
    els.rail.innerHTML = series.entries.map(function (e) {
      return railButton(e.file, e.title, e.number, e.accent, e.file === state.current);
    }).join("");
    return;
  }
  els.railTitle.textContent = "Series";
  els.rail.innerHTML = state.series.filter(function (s) { return s.entries.length; }).map(function (s) {
    const n = s.entries.length;
    return railButton(s.entries[0].file, s.name, n + (n === 1 ? " RFC" : " RFCs"), s.accent, false);
  }).join("");
}

/* ---------------------------------------------------------- navigation */

function requested() {
  const raw = new URLSearchParams(location.search).get("rfc");
  return {
    raw: raw,
    doc: raw ? resolveDocName(raw) : DEFAULT_DOC,
    anchor: safeDecode(location.hash.slice(1)),
  };
}

function pushUrl(doc, anchor) {
  const href = docHref(doc, anchor);
  if (new URL(href, location.href).href !== location.href) history.pushState(null, "", href);
}

async function open(file, options) {
  const opts = options || {};
  const doc = resolveDocName(file) || DEFAULT_DOC;
  const anchor = opts.anchor || "";

  if (doc === state.current) {
    if (opts.push) pushUrl(doc, anchor);
    if (!scrollToAnchor(anchor, true) && opts.push) bringPanelIntoView();
    return;
  }

  state.seq += 1;
  const seq = state.seq;
  let view;
  try {
    view = docView(doc, await loadDoc(doc));
  } catch (error) {
    view = errorView(doc, error);
  }
  if (seq !== state.seq) return; // a later pick overtook this one

  const from = state.current;
  state.current = doc;
  if (opts.push) pushUrl(doc, anchor);
  show(view.html, opts.initial ? null : direction(from, doc), anchor);

  document.title = view.title + " — RFC Reader";
  els.status.textContent = "RFC Reader — " + doc + (view.title !== doc ? " · " + view.title : "");
  els.sourcePill.href = encodeURI(doc);
  els.sourcePill.textContent = "View " + doc + " source";
  markContents();
  renderRail();
}

function step(offset) {
  const at = orderOf(state.current);
  const n = state.corpus.length;
  if (!n) return;
  if (at < 0) {
    if (offset > 0) open(state.corpus[0].file, { push: true });
    return;
  }
  const to = at + offset;
  if (to < 0) open(DEFAULT_DOC, { push: true });
  else if (to < n) open(state.corpus[to].file, { push: true });
}

function bindNavigation() {
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // new tab, as a link would
    const link = event.target.closest ? event.target.closest("[data-rfc]") : null;
    if (!link) return;
    event.preventDefault();
    open(link.getAttribute("data-rfc"), { anchor: link.getAttribute("data-anchor") || "", push: true });
  });

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    const tag = target && target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (target && target.isContentEditable)) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  });

  window.addEventListener("popstate", function () {
    const want = requested();
    open(want.doc || DEFAULT_DOC, { anchor: want.anchor });
  });
}

/* --------------------------------------------------------------- boot */

async function boot() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  panel.track = document.createElement("div");
  panel.track.className = "record-track";
  els.record.appendChild(panel.track);
  bindNavigation();

  // Start the document fetch alongside the contents when its name is plain.
  const early = new URLSearchParams(location.search).get("rfc");
  if (!early) loadDoc(DEFAULT_DOC).catch(function () {});
  else if (SAFE_DOC.test(early) && !TTDB_FILE.test(early)) loadDoc(early).catch(function () {});

  try {
    const records = parseRecords(await fetchText(INDEX_DB));
    const record = pickContentsRecord(records);
    if (record) {
      buildCorpus(record.body);
      renderContents(record, records);
    } else {
      contentsError("no RFCs record found");
    }
  } catch (error) {
    contentsError(error.message);
  }

  const want = requested();
  if (want.raw && want.doc && want.doc !== want.raw) {
    history.replaceState(null, "", docHref(want.doc, want.anchor)); // TTDB-RFC-0001 -> its full file name
  }
  await open(want.doc || DEFAULT_DOC, { anchor: want.anchor, initial: true });
  if (want.raw && !want.doc) {
    els.status.textContent = "No RFC named " + want.raw + "; showing " + DEFAULT_DOC + ".";
  }
}

boot();
