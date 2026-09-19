# GitHub TTDB

Six repositories from [github.com/antfriend](https://github.com/antfriend), the
six most recently pushed, laid out on the same sine-wave ribbon the front door
uses (`lat = 34 · sin((lon + 150) · 1.2°)`, `lon ∈ [-150, 150]`), then closed
back along the equator. The ribbon runs newest push to oldest: the card at
`(0, -150)` was touched today, the one at `(0, 150)` back in June.

Each record is one repository. GitHub refuses to be framed — it serves
`frame-ancestors 'none'` — so a record here cannot hold a live repo page the way
the ICU2 deck holds a player. It holds the repository's own OpenGraph card
instead, a language census counted in bytes of code, and the facts that were
true when this file was written.

```mmpdb
db_id: ttdb:tte:github:v1
db_name: "GitHub"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
source:
  profile: "https://github.com/antfriend"
  api: "https://api.github.com/users/antfriend/repos?sort=pushed"
  harvested: 1789776000
  method: "the six most recently pushed public repositories, forks included"
  note: "59 public repos in total. The first three are also the three pinned on the profile; GitHub allows six pins and only three are set."
umwelt:
  umwelt_id: umwelt:tte:github:visitor:v1
  role: shelf
  perspective: "Someone who has found the profile and wants to know what is actually being worked on."
  scope: "One record per repository. Metadata and a language census, not source code."
  constraints:
    - "One record per repository."
    - "Every record carries the repository's own OpenGraph card as its image."
    - "Counts are a snapshot: they were true at the harvest timestamp and will drift."
  globe:
    frame: "ribbon"
    origin: "the most recently pushed repo at (0, -150); the ribbon runs west to east."
    mapping: "lat = 34 * sin((lon + 150) * 1.2deg), sampled every 60deg of lon."
    note: "A single closed circuit: six repos forward along the sine, one dashed return arc along the equator."
cursor_policy:
  max_preview_chars: 260
  max_nodes: 12
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "next/prev walk the ribbon from newest push to oldest. built_on>, runs>, spec_for> and publishes> cross between the spec repo and the things built against it."
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "STATUS"
  max_reply_chars: 260
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT0LON-150
preview:
  @LAT0LON-150: "my joyful place — the repo behind this very page, and the only one of the six carrying a star."
```

---

@LAT0LON-150 | created:1472782109 | updated:1789859076 | relates:prev>@LAT0LON150,next>@LAT32LON-90,publishes>@LAT20LON-30,opens>https://github.com/antfriend/antfriend.github.io

## antfriend.github.io

### the site you are reading, and everything under it

![antfriend.github.io](https://opengraph.githubassets.com/1/antfriend/antfriend.github.io)

```
  JavaScript █████████············· 449.9 KB  42.2%
  HTML       ███████··············· 334.5 KB  31.4%
  Python     ████·················· 201.3 KB  18.9%
  CSS        █·····················  51.0 KB   4.8%
  TeX        █·····················  28.5 KB   2.7%
```

This repo is this page. The front door, the RFC corpus and the ICU2 fight
deck are all directories in it. Pinned on the profile, and the only one of
the six carrying a star.

`JavaScript` · no licence file · 587.5 MB · 1 star · last push 2026-09-19 · not a fork

- [Repository](https://github.com/antfriend/antfriend.github.io) · [README](https://github.com/antfriend/antfriend.github.io/blob/master/README.md) · [Commits](https://github.com/antfriend/antfriend.github.io/commits/master)

---

@LAT32LON-90 | created:1781796944 | updated:1788125928 | relates:prev>@LAT0LON-150,next>@LAT20LON-30,runs>@LAT20LON-30,opens>https://github.com/antfriend/robot_team

## robot_team

### a team of ESP32 robots that turned into a band

![robot_team](https://opengraph.githubassets.com/1/antfriend/robot_team)

```
  C++        ███████████████·······   1.4 MB  70.3%
  Python     ██████················ 544.2 KB  27.2%
  HTML       ······················  17.2 KB   0.9%
  C          ······················   9.7 KB   0.5%
  PowerShell ······················   9.1 KB   0.5%
  Makefile   ······················   9.1 KB   0.5%
```

A fleet of autonomous ESP32 nodes — a UNIHIKER K10, Heltec V4s, a LilyGo
T-Deck — reasoning from an on-flash TTDB, trading HMAC-signed 250-byte toots
over ESP-NOW, holding a shared musical pulse, with no cloud LLM on any
device. The standing hypothesis is that the fleet can infer its own physical
arrangement from the overlap of what its nodes perceive. Pinned.

`C++` · MIT · 2.3 MB · 0 stars · last push 2026-08-30 · not a fork

- [Repository](https://github.com/antfriend/robot_team) · [README](https://github.com/antfriend/robot_team/blob/main/README.md) · [Commits](https://github.com/antfriend/robot_team/commits/main)

---

@LAT20LON-30 | created:1768395670 | updated:1785681943 | relates:prev>@LAT32LON-90,next>@LAT-20LON30,spec_for>@LAT32LON-90,opens>https://github.com/antfriend/toot-toot-engineering

## toot-toot-engineering

### the spec and the corpus, written down to be argued with

![toot-toot-engineering](https://opengraph.githubassets.com/1/antfriend/toot-toot-engineering)

```
  Python ██████████████████████  99.3 KB 100.0%
```

The universal agent memory and learning system: free energy principle, the
Umwelt as subjective data, experiential perception as synthetic modelling.
The language bar reads 100% Python because the counter only sees code — most
of the 18 MB here is Markdown, and the spec files are the point. Pinned.

`Python` · MIT · 18.0 MB · 0 stars · last push 2026-08-02 · not a fork

- [Repository](https://github.com/antfriend/toot-toot-engineering) · [README](https://github.com/antfriend/toot-toot-engineering/blob/main/README.md) · [Commits](https://github.com/antfriend/toot-toot-engineering/commits/main)

---

@LAT-20LON30 | created:1782161552 | updated:1785353455 | relates:prev>@LAT20LON-30,next>@LAT-32LON90,opens>https://github.com/antfriend/Anubis

## Anubis

### a fork: open hardware RC controller, the daughterboard

![Anubis](https://opengraph.githubassets.com/1/antfriend/Anubis)

```
  C          ██████████████········   1.9 MB  64.8%
  C++        ██████················ 762.7 KB  25.3%
  Python     ██···················· 231.7 KB   7.7%
  PowerShell ······················  44.2 KB   1.5%
  JavaScript ······················  16.6 KB   0.6%
  OpenSCAD   ······················   5.7 KB   0.2%
```

The one fork in this deck, taken from **BoomBoxRobotics/Anubis**. A compact
open-hardware support board for a DIY ESP32-S3 transmitter: it sits under a
Hosyond 2.8 inch display board and turns the bare parts into a controller.
CC0, so the hardware is as free as the firmware.

`C` · CC0-1.0 · 615.2 MB · 0 stars · last push 2026-07-29 · fork of `BoomBoxRobotics/Anubis`

- [Repository](https://github.com/antfriend/Anubis) · [README](https://github.com/antfriend/Anubis/blob/main/README.md) · [Commits](https://github.com/antfriend/Anubis/commits/main)

---

@LAT-32LON90 | created:1782769420 | updated:1783169526 | relates:prev>@LAT-20LON30,next>@LAT0LON150,built_on>@LAT20LON-30,opens>https://github.com/antfriend/storied

## storied

### story based games, the first one boxed and printable

![storied](https://opengraph.githubassets.com/1/antfriend/storied)

```
  Python     ███████████████······· 214.8 KB  66.5%
  JavaScript ██████················  88.0 KB  27.2%
  CSS        █·····················  14.8 KB   4.6%
  HTML       ······················   5.6 KB   1.7%
```

Story based games grounded in the Locus framework. The first is **Pulse**,
boxed the old way: a deck PDF, a rules PDF, the print-and-play sources and a
tokens directory. Five days of pushes, then quiet.

`Python` · MIT · 39.2 MB · 0 stars · last push 2026-07-04 · not a fork

- [Repository](https://github.com/antfriend/storied) · [README](https://github.com/antfriend/storied/blob/main/README.md) · [Commits](https://github.com/antfriend/storied/commits/main)

---

@LAT0LON150 | created:1778617374 | updated:1782253327 | relates:prev>@LAT-32LON90,next>@LAT0LON-150,built_on>@LAT20LON-30,opens>https://github.com/antfriend/companion_arc

## companion_arc

### one solver, pointed at ARC Prize

![companion_arc](https://opengraph.githubassets.com/1/antfriend/companion_arc)

```
  Python           ██████████████████████   4.2 MB  99.9%
  Jupyter Notebook ······················   2.8 KB   0.1%
```

The LOCUS competition agent for [ARC-AGI-3](https://arcprize.org). Almost
entirely Python and barely any notebook, which is the shape of a thing meant
to be run rather than demonstrated. The theory paper and the live session
logs both live back on the first card in this deck.

`Python` · MIT · 4.4 MB · 0 stars · last push 2026-06-23 · not a fork

- [Repository](https://github.com/antfriend/companion_arc) · [README](https://github.com/antfriend/companion_arc/blob/main/README.md) · [Commits](https://github.com/antfriend/companion_arc/commits/main)
---
