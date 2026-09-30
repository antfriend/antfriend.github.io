# TTN-RFC-0002: Typed Edge Taxonomy

**Version:** 1.1
**Status:** Stable
**RFC Number:** 0002
**Project:** toot-toot-engineering
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0001 (Core Mesh Specification), TTDB-RFC-0003 (Typed Edges)
**Author:** antfriend
**Created:** 2026-04-05

---

## Identity / Topology
- knows
- seen_near
- routes_via
- connected_over

## Conversation / BBS
- board_contains
- thread_root
- replies_to
- mentions
- moderates
- supersedes

## AI Semantics
- asks_ai
- ai_summarizes
- ai_flags
- ai_responds_to
- ai_refuses
- ai_confidence_low

## Sensors / Actions
- reports_sensor
- alerts
- commands
- acknowledges
- escalates

## Knowledge Graph
- supports
- contradicts
- refines
- duplicates
- derived_from

## Semantic Polarity
- opposes

Distinct from `contradicts` in Knowledge Graph. `contradicts` is *epistemic* —
two claims that cannot both hold. `opposes` is *semantic* — two concepts at
opposite ends of one dimension, both of which may be perfectly true. Symmetric;
see TTDB-RFC-0003 §7.

## Moderation / Trust
- trusted_by
- muted_by
- blocked_by
- flagged_as_spam
- quarantined

---

## Changelog
- **1.1** — Added §Semantic Polarity (`opposes`), so the taxonomy lists the type
  `TTDB-RFC-0003` §7 defines. Additive; every 1.0-conformant store remains valid.
- **1.0** — Initial.

*Sync note (2026-09-30) — resolved: **v1.1 is correct, and the upstream v1.0 is a
regression, not a decision.** Investigated because a first reading reached the opposite
conclusion twice.*

Three checkouts held three byte counts — 1140 here, 845 in `toot-toot-engineering`, 900
in `antfriend.github.io` — and **neither obvious heuristic gave the right direction.**

- *Size* is not a direction: the two smaller copies are 1.0 and **identical in
  content**; their 55-byte gap is CRLF (`core.autocrlf`).
- *Superset* is not a direction either, which is what made this worth digging into:
  `git log -S` shows the §Semantic Polarity block was added in **both** repos on
  2026-08-01 (here `dc42f40`, upstream `ecac881`) and then vanished upstream on
  2026-09-22 — so this copy looked like it was behind a retraction.

**It is not a retraction. It is a stale-baseline regression, and it happened twice in
45 seconds.** Upstream, `24cea1d "TTG Grammar"` (11:01:35) added the five TTG RFCs and
**also rewrote `RFCs/rfc.ttdb.md`, silently reverting that file's TTN-RFC-0002 record
from "seven groups" back to "six groups"** — the corpus was regenerated from a base
predating `ecac881`. Then `796f633` (11:02:20) edited this RFC down to 1.0, making the
regression self-consistent and therefore invisible. Both commits carry default
web-edit messages and state no rationale.

**Everything the feature actually rests on survived both commits untouched**, which is
what rules out an editorial de-listing:

| artifact | upstream state |
|---|---|
| `TTDB-RFC-0003` §7, which *defines* `opposes` | **v1.1, present** |
| `feelings_ttdb.md` — the canonical store | **22 `opposes` edges**, across 11 antonym pairs |
| `research/valence/` — the active research line that motivated it | **17 references** |

And the edges are **in production**: `feelings.ttdb.md` is flashed to both handhelds, so
`opposes` is live on hardware. A taxonomy that omits a type its own canonical store uses
22 times is precisely the inconsistency §7's rationale names — *polarity encoded
positionally is "invisible to a consumer traversing the edge list, which is what
implementations actually read."*

**Action:** 1.1 stands here and is pushed to both other checkouts, with the upstream
corpus record repaired to "seven groups". The website's 1.0 is simply **stale** — its
last commit touching the file is 2026-05-09, months before the section existed — so it
is a plain fast-forward, not a conflict.

⚠ The one thing that would overturn this is an explicit statement from the author that
`opposes` should not be a TTN-layer edge type. Nothing in either repo says so; if that
was the intent, it belongs in §7 and in `feelings_ttdb.md`, not in a silent revert.


End TTN-RFC-0002
