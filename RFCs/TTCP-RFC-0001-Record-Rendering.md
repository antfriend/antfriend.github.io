# TTCP-RFC-0001: Record Rendering
### TTDB Content Publishing — File Ingestion, Record Parsing, and HTML Rendering

**Version:** 1.0
**Status:** Draft
**RFC Number:** 0001
**Project:** toot-toot-engineering
**Component:** TTDB Content Publishing (TTCP)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0002 (Cursor Semantics), TTDB-RFC-0003 (Typed Edges), TTDB-RFC-0005 (Epistemic Weight)
**Author:** antfriend
**Created:** 2026-04-28

---

## 1. Abstract

This RFC specifies how a conformant TTCP renderer ingests a TTDB file, parses its structural zones, and produces an HTML view for each record. It covers format detection, the three-zone parse model, record header extraction, the Markdown and LaTeX rendering pipelines, media handling, lead media extraction, special fenced blocks, and per-record audio playback. Rendering behavior is defined normatively using MUST/SHOULD/MAY language.

---

## 2. File Ingestion

### 2.1 Fetch

A renderer MUST fetch the TTDB file over HTTP using cache-bypass semantics (e.g., `cache: "no-store"`). Redirects MUST be followed. The response MUST be decoded as UTF-8.

### 2.2 Format Detection

A renderer MUST detect the container format before parsing:

| Condition | Format |
|---|---|
| File extension is `.latex` | LaTeX |
| File contains `\begin{ttdb_record}` | LaTeX |
| Otherwise | Markdown |

A renderer MAY support both formats simultaneously.

---

## 3. Three-Zone Parse Model

A Markdown TTDB file is divided into three ordered zones:

1. **`mmpdb` zone** — a fenced code block tagged `mmpdb`; contains YAML database properties as specified in TTDB-RFC-0001 §2.
2. **`cursor` zone** — a fenced code block tagged `cursor`; contains YAML selection state as specified in TTDB-RFC-0002 §1.
3. **Record zone** — one or more record sections separated by `---` horizontal rules.

Zones MUST appear in this order. Content outside these zones MUST be ignored by strict parsers. Unknown fenced block tags MUST be silently skipped.

---

## 4. Record Header Parsing

Each record section begins with a single header line of the form:

```
@LAT<lat>LON<lon> | created:<unix_ts> | updated:<unix_ts> | type:<type> | relates:<edges>
```

### 4.1 Coordinate ID

The coordinate ID MUST conform to one of two forms:

- Long form: `@LAT<lat>LON<lon>` (e.g., `@LAT45.5LON-120.3`)
- Short form: `@<lat>x<lon>` (e.g., `@45.5x-120.3`)

Latitude and longitude are parsed as signed decimal floats. Implementations MUST accept both forms and normalize to the long form internally.

Latitude −90 is reserved as the **South Pole marker** identifying special records (see §8).

### 4.2 Metadata Fields

Header fields are pipe-delimited and parsed as `key:value` pairs (case-insensitive keys). Unrecognized fields MUST be silently ignored.

| Field | Type | Description |
|---|---|---|
| `created` | Unix timestamp | Creation time |
| `updated` | Unix timestamp | Last body modification time |
| `type` | string | Record type: `"record"` (default) or `"scene"` |
| `relates` | edge list | Typed edge declarations (see TTDB-RFC-0003) |

### 4.3 Epistemic Weight Block

Immediately after the header line, an optional `[ew]…[/ew]` block MAY appear as specified in TTDB-RFC-0005. Renderers MUST extract and display epistemic weight fields before rendering the record body.

---

## 5. Record Body Content Order

After the optional `[ew]` block, a record body MUST be processed in this order:

1. Optional `## Title` heading (h2).
2. Markdown or converted body content.
3. Optional `ttdb-record` fenced config block (§7.1).
4. Optional `ttdb-scene` fenced config block (see TTCP-RFC-0002 §6).

Renderers MUST strip config fenced blocks from the displayed body.

---

## 6. Markdown Rendering Pipeline

Renderers MUST implement at minimum the following Markdown features:

### 6.1 Block Elements

| Syntax | Output |
|---|---|
| `## Heading` through `#### Heading` | `<h2>` through `<h4>` |
| `- item` or `* item` | `<ul><li>` |
| `1. item` | `<ol><li>` |
| `> text` | `<blockquote>` |
| `---` (own line, 3+ dashes) | `<hr>` |
| ` ```lang … ``` ` | `<pre><code class="lang">` |

The `<h1>` tag is reserved for the page title. Record titles rendered from `##` headings MUST be rendered as `<h2>` or equivalent.

### 6.2 Inline Elements

| Syntax | Output |
|---|---|
| `**text**` or `__text__` | `<strong>` |
| `*text*` or `_text_` | `<em>` |
| `` `code` `` | `<code>` |
| `[text](url)` | `<a href="url">` |
| `[text][ref]` | `<a>` resolved via reference definition |
| `![alt](url)` | `<img>` |
| `![alt][ref]` | `<img>` resolved via reference definition |
| `\(expr\)` | Inline math (KaTeX or equivalent) |

### 6.3 Reference Definitions

Lines of the form `[label]: url "optional title"` appearing anywhere in the body MUST be collected before rendering and used to resolve reference-style links and images.

### 6.4 Math and Code Block Tags

Fenced blocks tagged `math` or `latex` MUST be rendered as display-mode math using KaTeX or an equivalent renderer. All other fenced block tags MUST be rendered as syntax-highlighted or plain `<pre><code>` blocks.

---

## 7. Special Fenced Blocks

### 7.1 `ttdb-record` Block

A `ttdb-record` fenced block configures per-record audio playback. Renderers MUST strip this block from the displayed body.

Supported fields:

| Field | Type | Description |
|---|---|---|
| `audio_path` | string | Path to audio file, relative to the TTDB file |
| `audio_loop` | boolean | Whether to loop the audio |

If `audio_path` is present, the renderer MUST load and play the audio when the record is selected. If `audio_loop` is `true`, the audio MUST loop. The renderer SHOULD reuse an existing audio player when the path and loop setting are unchanged from the previous selection. Record audio MUST be suppressed during scene playback.

---

## 8. Special Records (South Pole Marker)

Records with latitude exactly −90 are **special records**. They MUST NOT be displayed as navigable records in the record list or on the globe. Their `ttdb-special` fenced block MUST be parsed to determine behavior.

### 8.1 `ttdb-special` Block

```
```ttdb-special
kind: <kind>
key: value
```
```

Supported `kind` values:

| Kind | Effect |
|---|---|
| `tour_sound` | Sets `audio_path` as the looping background audio for the guided tour |
| `discovery_tour_off` | Disables the discovery system; all records are treated as fully discovered; tour controls are hidden |

Unknown `kind` values MUST be silently ignored.

---

## 9. LaTeX Container Support

### 9.1 Record Extraction

In LaTeX format, records are extracted via the environment `\begin{ttdb_record}…\end{ttdb_record}`. The header is contained in `\ttdbheader{}`. The record title is extracted from `\subsection*{}`.

### 9.2 Body Conversion

Before rendering, LaTeX body content MUST be converted to Markdown using these rules:

| LaTeX | Markdown equivalent |
|---|---|
| `\section*{T}` | `## T` |
| `\subsection*{T}` | `### T` |
| `\textbf{T}` | `**T**` |
| `\texttt{T}` | `` `T` `` |
| `\emph{T}` | `*T*` |
| `\[…\]` | ` ```math … ``` ` |
| `$…$` | `\(…\)` |
| `\item` | `- ` |

Unrecognized LaTeX commands SHOULD be stripped. The converted body is then processed by the standard Markdown pipeline (§6).

---

## 10. Media Handling

### 10.1 Dispatch by Extension

| Extension(s) | Element | Notes |
|---|---|---|
| `.mp4 .webm .ogg .mov` | `<video controls>` | `preload="metadata"` |
| `.html` | `<iframe>` | Lazy-loaded; sandbox same-origin |
| All images | `<img>` | Eager load; async decode |

### 10.2 Lead Media Extraction

The first image or video node encountered in the record body is the **lead media**. Renderers MUST:

1. Remove the lead media element from its inline position in the body.
2. Display it above the text content.
3. Preserve the image's `alt` text and `src` for downstream reference resolution.

### 10.3 Split Layout

On landscape desktop viewports (width > 900px), if the lead image's natural width is less than 75% of the available container width, renderers SHOULD apply a two-column split layout: lead media on one side, body text on the other. `<iframe>` lead media MUST always use a 50/50 split layout. On mobile or portrait viewports, all media MUST be stacked vertically above the text.

### 10.4 Image Zoom

Renderers SHOULD provide a tap or click interaction on images to display them at full resolution in an overlay.

---

## 11. Epistemic Weight Display

When a record contains a `[ew]` block (TTDB-RFC-0005), renderers MUST display at minimum:

- A visual bar or indicator representing `EPS = sal × (255 − conf) / 255`
- The raw field values: `conf`, `rev`, `sal`, `touched`

The display MUST appear between the record title and the body content.

---

## 12. Typed Edge Display

The `relates:` edges parsed from the record header (TTDB-RFC-0003) MUST be rendered as a "Related records" section beneath the body content. Each edge MUST display:

- The edge type label
- A link to the target record

If the target record does not exist in the active database, the link MUST be rendered as non-interactive (grayed out). Renderers MUST NOT render edges in the body text.

---

## 13. Relationship to Existing RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0001 | Defines the three-zone file structure this RFC parses |
| TTDB-RFC-0002 | Cursor block defines initial selection; see TTCP-RFC-0002 |
| TTDB-RFC-0003 | Typed edges displayed per §12 |
| TTDB-RFC-0005 | Epistemic weight block parsed and displayed per §11 |
| TTCP-RFC-0002 | Globe visualization, navigation, tour, scene playback |
| TTCP-RFC-0003 | Link system, URL addressability, hover preview |

---

## 14. Open Questions

1. **Syntax highlighting:** Should code block syntax highlighting be a MUST or MAY? Language support varies widely across implementations.
2. **Video autoplay:** Should record video autoplay on selection, or require user gesture? Autoplay policies vary by browser.
3. **Lead media for iframes:** Should `.html` iframes be eligible for lead media extraction, or always treated separately?

---

## 15. Changelog

| Date | Change |
|---|---|
| 2026-04-28 | Initial draft |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0*
