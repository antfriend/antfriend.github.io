# antfriend.github.io

Home of **Toot Toot Engineering** — the TTDB, TTAI(offline knowledge graph autonomy on a $5 ESP32 microcontroller), and the autonomy OS stack.

## What is this?

This repo is the source for the Toot Toot Engineering website, which hosts an interactive browser-based viewer for **TTDB** (MyMentalPalaceDB) files. This site is an implementation of the toot technology it describes. For example, the link-based transition dynamics are described here  

### Core systems

**TTDB — MyMentalPalaceDB**
An offline-first semantic graph file format. Records are location-anchored nodes connected by typed edges, stored in plain Markdown or LaTeX. Designed to be navigable by both humans and AI agents. Specs: [`RFCs/TTDB-RFC-000*`](RFCs/)

**TTAI — Autonomy OS**
AI reasoning layer built on TTDB. The AI librarian (umwelt) operates within a subjective worldview defined per-database — explicit invocation only, no autonomous speech. Part of the broader autonomy OS concept.

**TTN — Toot Toot Network**
Offline-first semantic mesh network. Transport-agnostic, partition-tolerant, LoRa-capable. TTDB is the default log format for mesh nodes. Specs: [`RFCs/TTN-RFC-000*`](RFCs/)

**TTE — Toot Toot Engineering Workflow**
Internal engineering workflow (roles, plan/log/checklist, definition of done). Specs: [`RFCs/TTE-RFC-000*`](RFCs/)

## Repo layout

```
index.html              Main TTDB viewer (single-page app)
RFCs/                   RFC specifications for TTDB, TTAI, TTN, and TTE
TTE/                    TTE workflow tools and supplementary pages
  TTDB.html             Standalone TTDB viewer
  graph-view.html       Graph visualization tool
js/                     Viewer scripts (eyeball graph, audio, LaTeX, link preview)
css/                    Stylesheets
*.md / *.latex          Example TTDB databases (terminology, journals, banjo, etc.)
py/                     Python utilities (local server, TTDB navigator, LaTeX export)
service.py              Local dev server (see below)
```

## Running locally

```bash
python service.py
```

Opens `index.html` on `http://127.0.0.1:8000` by default. Options:

```
--host HOST    Interface to bind (default: 127.0.0.1)
--port PORT    Port (default: 8000)
--no-open      Don't open the browser automatically
```

## Loading a TTDB file

Append a `?ttdb=` query parameter to load any `.md` or `.latex` file from the repo:

```
http://127.0.0.1:8000/?ttdb=MyMentalPalaceDB.md
http://127.0.0.1:8000/?ttdb=feelings_ttdb.md
```

Without a parameter, the viewer falls back through a list of candidate databases defined in `index.html`.

## RFCs

All specifications live under [`RFCs/`](RFCs/) with a full index at [`RFCs/INDEX.md`](RFCs/INDEX.md). Current status: Draft v0.1–0.2.

| Series | Covers |
|--------|--------|
| TTN-RFC-0001–0006 | Semantic mesh, typed edges, LoRa framing, trust/reputation |
| TTDB-RFC-0001–0004 | File format, cursor semantics, typed edges, event IDs |
| TTE-RFC-0001–0003 | Engineering workflow, roles, definition of done |
