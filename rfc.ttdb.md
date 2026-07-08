# RFC Corpus TTDB

```mmpdb
db_id: rfc-corpus-001
db_name: RFC Corpus (semantic compression of RFCs/)
coord_increment:
  lat: 10
  lon: 1
collision_policy: reject
timestamp_kind: unix
umwelt:
  umwelt_id: rfc-librarian
  role: spec-compression
  perspective: corpus-consolidator
  scope: robot_team governing specifications
  constraints:
    - compress-alongside-never-in-place
    - every-record-names-its-expansion-source
  globe:
    frame: rfc-grid
    origin: "@LAT0LON0"
    mapping: "lat = RFC family lane (10 TTDB, 20 TTN, 30 TTCP, 40 A32, 50 ARC, 98 beliefs), lon = RFC number within the family"
cursor_policy:
  max_preview_chars: 256
  max_nodes: 64
typed_edges:
  enabled: true
  syntax: "type@LATxLONy"
  note: "depends_on/amends/implements are free-form per TTDB-RFC-0003 §4; supports/contradicts/refines/derived_from follow the TTN-RFC-0002 knowledge-graph taxonomy"
librarian:
  enabled: false
  primitive_queries: []
```

```cursor
selected:
  - "@LAT0LON0"
preview:
  "@LAT0LON0": "Home: what this database is and how each record expands back to its full RFC"
agent_note: "First cut authored 2026-07-08 by semantic compression of the 28-file RFC corpus (~266 KB -> this file)."
```

---

@LAT0LON0 | created:1783468800 | updated:1783468800 | relates:demonstrates@LAT20LON4

**Home — the corpus as an umwelt**

Each record on this globe compresses one RFC to its normative gist. The `src:` line
in every body is the deterministic expansion target — TTN-RFC-0004 §3 applied to the
corpus itself: this file is the token, the full RFC is the gateway expansion.
Lanes: lat 10 TTDB, lat 20 TTN, lat 30 TTCP, lat 40 A32, lat 50 ARC. Lane lat 98
holds beliefs — consolidated invariants and places where implemented reality diverges
from spec text (the Dream Cycle run over the documents, echoing the fleet's lat-98
BELIEF-ADOPTED lane). `[ew]` conf encodes status (implemented-on-device 240, stable
210, informational 190, draft 140, proposed 120); sal encodes how load-bearing the
RFC is to current fleet work.

---

@LAT10LON1 | created:1773532800 | updated:1773532800 | relates:implemented_by@LAT40LON2
[ew]
conf:210
rev:0
sal:200
touched:1773532800
[/ew]

**TTDB-RFC-0001 — File Format and Sections** (Stable)
src: TTDB-RFC-0001-File-Format.md

A TTDB is Markdown (or LaTeX): title line, fenced `mmpdb` YAML block (db_id, db_name,
coord_increment, collision_policy, timestamp_kind, umwelt with globe, cursor_policy,
typed_edges, optional librarian), fenced `cursor` block, then records separated by
`---`. Record header: `@LATxLONy | created:<int> | updated:<int> | relates:<edges>`.
The globe is a subjective knowledge map — one umwelt per file, coordinates encode
what the librarian believes, projected via `umwelt.globe.mapping`. Parsers treat
unknown keys/sections as extensions; updates MUST preserve unknown content.

---

@LAT10LON2 | created:1773964800 | updated:1773964800 | relates:depends_on@LAT10LON1
[ew]
conf:210
rev:0
sal:90
touched:1773964800
[/ew]

**TTDB-RFC-0002 — Cursor Semantics and Selection Rules** (Stable)
src: TTDB-RFC-0002-Cursor-Semantics.md

The `cursor` block is YAML: `selected` (ordered list, first = primary) and `preview`
(map, one entry per selected record, truncated to `cursor_policy.max_preview_chars`)
are required; `agent_note`, `dot` (Graphviz fragment), `last_query`, `last_answer`,
`answer_records` optional. Ambiguous selection: ask, or take most-recently-updated
and note the assumption. Librarian-enabled DBs accept short tokenized primitive
queries (not free-form NL) and update the last_query/last_answer fields on reply.

---

@LAT10LON3 | created:1774396800 | updated:1774396800 | relates:depends_on@LAT10LON1,depends_on@LAT10LON2,aligns_with@LAT20LON2
[ew]
conf:210
rev:0
sal:130
touched:1774396800
[/ew]

**TTDB-RFC-0003 — Typed Edge Semantics** (Stable)
src: TTDB-RFC-0003-Typed-Edges.md

Edges use the syntax declared in `mmpdb.typed_edges.syntax` (default
`<type>@<TARGET_ID>`). All edges are directional record→target; never infer reverse
edges. Multiple same-type edges allowed; dedupe at render. Types are free-form
tokens but SHOULD align with the TTN taxonomy (TTN-RFC-0002). An edge is the
librarian's subjective assertion inside its umwelt, not a global truth; reference
other worldviews explicitly (`db:<id>`, `umwelt:<id>`). Embedded node graphs in
bodies are render hints only — the header edge list is canonical.

---

@LAT10LON4 | created:1774828800 | updated:1774828800 | relates:depends_on@LAT10LON1,depends_on@LAT10LON3
[ew]
conf:210
rev:0
sal:110
touched:1774828800
[/ew]

**TTDB-RFC-0004 — Event ID Assignment and Collision Handling** (Stable)
src: TTDB-RFC-0004-Event-ID-and-Collision.md

`@LATxLONy` IDs are assigned deterministically: from location when available, else a
stable hash, always projected through `umwelt.globe.mapping` (the globe is a knowledge
map, not necessarily geography). `southeast_step` collision policy: increment both lat
and lon by the step until unique. Once assigned an ID never changes — a materially
changed umwelt gets a new record linked back with `revises@<old_id>`.

---

@LAT10LON5 | created:1776902400 | updated:1776902400 | relates:depends_on@LAT10LON1,depends_on@LAT10LON2,depends_on@LAT10LON3,implemented_by@LAT40LON5
[ew]
conf:210
rev:0
sal:150
touched:1776902400
[/ew]

**TTDB-RFC-0005 — Toot-Bit Epistemic Weight (TBEW)** (Stable)
src: TTDB-RFC-0005-Epistemic-Weight.md

Optional `[ew]`…`[/ew]` block immediately after the record header: `conf` u8 (belief
settledness, default 128), `rev` u16 (substantive body changes only — never [ew]-only
writes), `sal` u8 (access count, SHOULD half-life-decay), `touched` u32 unix (any
write; superset of `updated`). Absent block = defaults. Lines are `key:value`, no
spaces, order-free; unknown keys skipped; out-of-range clamped, never fatal. Derived
attention signal: `EPS = sal × (255 − conf) / 255` — high EPS = load-bearing but
untrusted, the prime target for active sensing. A symbolic free-energy proxy: no
floats, human-legible, runs on a microcontroller.

---

@LAT10LON6 | created:1777766400 | updated:1777766400 | relates:depends_on@LAT10LON1,depends_on@LAT10LON3,depends_on@LAT10LON5
[ew]
conf:190
rev:0
sal:80
touched:1777766400
[/ew]

**TTDB-RFC-0006 — Experiential Perception as Synthetic Model** (Informational)
src: TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md

The Locus foundation: perception is transition-detection, so the unit of experiential
knowledge is the `@PERCEPT:before` → `@PERCEPT:after` pair — non-negotiable for Locus
conformance. The edge is the datum; the nodes are its boundary (a 1-simplex, ∂[v0,v1]
= v1 − v0), making the TTDB a simplicial complex on the coordinate sphere. Alexander
duality follows: the topology of what the agent has NOT perceived is computable from
what it has. Agent context is mandatory (a transition without a perceiving subject is
propositional, not experiential). The umwelt bounds what is sign-worthy to encode —
TTDB aims for experiential sufficiency, not comprehensiveness.

---

@LAT10LON7 | created:1778803200 | updated:1782259200 | relates:depends_on@LAT10LON1,depends_on@LAT10LON3,depends_on@LAT10LON5,depends_on@LAT10LON6,propagated_by@LAT20LON9
[ew]
conf:200
rev:0
sal:170
touched:1782259200
[/ew]

**TTDB-RFC-0007 — Locus Point and Dream Cycle** (Draft; first instance live via reconcile + push)
src: TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md

Two-phase offline consolidation, idle-only, abortable at phase boundaries, < 500 ms
on ESP32-S3. Phase 1 Replay: sal-weighted random walks (deliberately atemporal) →
co-occurrence clusters → candidate beliefs (mean conf ≥ 128). Phase 2 Projection:
walks seeded from boundaries of bounded unknown regions (the Alexander dual) →
hypotheses flagged `projection_flag`. Output: `@BELIEF:LATxLONy` Locus Point with
required `[lp]` block (centroid, confidence = walk coverage 0–255, scope_lat/lon,
projection_flag, contradiction_flag, source_count). Compression: subsumed episodic
toot-bits are archived (NEVER deleted) and replaced by a `compresses>` edge. Sharing:
agents exchange whole `@BELIEF:` records; independently-formed overlapping compatible
beliefs merge with a +20 confidence bonus (environmental reality signal);
contradictions are flagged, not suppressed; ≥ 50 sources still contradicted → demote
to conf 0 as an explicit open problem.

---

@LAT10LON8 | created:1780704000 | updated:1780704000 | relates:depends_on@LAT10LON7,depends_on@LAT10LON6,depends_on@LAT10LON5,depends_on@LAT10LON1,applied_by@LAT50LON1
[ew]
conf:140
rev:0
sal:90
touched:1780704000
[/ew]

**TTDB-RFC-0008 — Narrative Metamorphosis** (Draft)
src: TTDB-RFC-0008-Narrative-Metamorphosis.md

Story-seeded life-stage transition from game-solving larva to orchestrating imago
(conductor). The Dream Cycle refines the same agent in place; metamorphosis changes
what kind of thing the system is. `@IMAGO:seed` holds the authored adult blueprint —
`[is]` block: imago_name, target_role, scene_sequence (ordered scene-record IDs,
definitive), eclosion_criteria, operator_role — plus a narrative body a human can
read; immutable once seeding completes (revise = new seed + `revises>` edge).
`@META:state` is the persistent checkpoint — `[ms]` block: current_instar /
total_instars, scene_pointer, pupation_status (none|seeding|active|quiescent|
complete|aborted), seeding_complete, timestamps. Scene records enact instars, each
gated by a post-state verifier; an incomplete instar MUST NOT advance the pointer.
Triggers: operator `[trigger:metamorphosis]` token (required support) or autonomous
belief-stability threshold (optional). Eclosion predicate activates the conductor.

---

@LAT20LON1 | created:1775001600 | updated:1775001600 | relates:default_log@LAT10LON1
[ew]
conf:210
rev:0
sal:120
touched:1775001600
[/ew]

**TTN-RFC-0001 — Core Semantic Mesh Specification** (Stable)
src: TTN-RFC-0001.md

Principles: meaning over messages; offline-first and partition-tolerant; local data
sovereignty; transport-agnostic; explicit AI invocation only. Required concepts:
stable cryptographic node ID, semantic ID, semantic event, typed edge, local TTDB as
default event log. Compliance levels TTN-Base / TTN-BBS / TTN-AI / TTN-Gateway.
Etiquette (load-bearing fleet law): no autonomous AI speech on mesh, no full-content
floods on low-bandwidth links, **all assertions must include provenance**, append-only
records preferred.

---

@LAT20LON2 | created:1775347200 | updated:1775347200 | relates:depends_on@LAT20LON1,depends_on@LAT10LON3
[ew]
conf:210
rev:0
sal:70
touched:1775347200
[/ew]

**TTN-RFC-0002 — Typed Edge Taxonomy** (Stable)
src: TTN-RFC-0002-Typed-Edges.md

The shared edge vocabulary, six groups: identity/topology (knows, seen_near,
routes_via, connected_over); conversation/BBS (board_contains, thread_root,
replies_to, mentions, moderates, supersedes); AI semantics (asks_ai, ai_summarizes,
ai_flags, ai_responds_to, ai_refuses, ai_confidence_low); sensors/actions
(reports_sensor, alerts, commands, acknowledges, escalates); knowledge graph
(supports, contradicts, refines, duplicates, derived_from); moderation/trust
(trusted_by, muted_by, blocked_by, flagged_as_spam, quarantined).

---

@LAT20LON3 | created:1775779200 | updated:1775779200 | relates:depends_on@LAT20LON1,depends_on@LAT20LON2
[ew]
conf:210
rev:0
sal:40
touched:1775779200
[/ew]

**TTN-RFC-0003 — Reference Implementation Checklist** (Stable)
src: TTN-RFC-0003-Reference-Implementation.md

Minimal viable node: generate node ID, maintain node registry, emit presence, store
semantic events in TTDB by default, TTAI join/welcome for first contact, compact mesh
grammar. Platform profiles: Windows (full TTDB, MQTT gateway, monitor.html, optional
librarian), ESP32 (compact DB, sensor events, serial/web UI, store-and-forward),
Meshtastic (grammar-only, presence, BBS headers, @AI forwarding). Demo milestone:
3 heterogeneous nodes, BBS propagation, AI summary on request, rendered graph.

---

@LAT20LON4 | created:1775952000 | updated:1775952000 | relates:depends_on@LAT20LON1,depends_on@LAT20LON2
[ew]
conf:210
rev:0
sal:60
touched:1775952000
[/ew]

**TTN-RFC-0004 — Semantic Compression and Token Dictionary** (Stable)
src: TTN-RFC-0004-Semantic-Compression.md

Rich semantic events compress to ultra-low-bandwidth tokens for constrained
transports: core tokens P (presence), S? (status request), OK, ERR, SOS; sensor
tokens T:x / H:x / B:x. Goals: minimize airtime, preserve intent and priority, allow
**deterministic expansion off-mesh**, avoid ambiguity. Tokens MUST be context-free;
gateways MUST expand them into full semantic events; emergency preempts all traffic.
(This database is that principle applied to the RFC corpus: record = token, `src:`
file = expansion.)

---

@LAT20LON5 | created:1776124800 | updated:1776124800 | relates:depends_on@LAT20LON1,depends_on@LAT20LON2
[ew]
conf:210
rev:0
sal:30
touched:1776124800
[/ew]

**TTN-RFC-0005 — Trust, Reputation, and Social Gravity** (Stable)
src: TTN-RFC-0005-Trust-and-Reputation.md

Trust is local, subjective, non-global. Signals: seen frequency, edge corroboration,
signature validity, behavior history. Reputation gravity: nodes with more trusted
edges propagate further. Moderation edges: trusted_by, muted_by, blocked_by,
rehabilitated_by.

---

@LAT20LON6 | created:1776297600 | updated:1776297600 | relates:depends_on@LAT20LON1,depends_on@LAT20LON4
[ew]
conf:210
rev:0
sal:30
touched:1776297600
[/ew]

**TTN-RFC-0006 — Minimal LoRa Packet Framing** (Stable; unexercised — LoRa gated to Phase 4)
src: TTN-RFC-0006-LoRa-Packet-Framing.md

Transport-only framing for non-Meshtastic LoRa point-to-point/star: `SOF 0xA5 | VER
0x01 | FLAGS (bit0 ACK_REQUIRED, bit1 ACK_FRAME) | SRC u16 BE | DST u16 BE (0xFFFF
broadcast) | TYPE (01 TEXT, 02 TLV, 03 PING, 04 PONG) | SEQ u8 | LEN | payload ≤240 |
CRC16/CCITT-FALSE over VER..payload | EOF 0x5A`. ACK: PONG frame, matching SEQ, ≤2
retries with backoff. Semantic interpretation happens in the TTN bridge, which maps
SRC/DST to `node:<id>` entities.

---

@LAT20LON7 | created:1782086400 | updated:1782086400 | relates:depends_on@LAT20LON1
[ew]
conf:240
rev:0
sal:190
touched:1782086400
[/ew]

**TTN-RFC-0007 — Reliable Delivery** (Implemented ✅ on-device 2026-06-22)
src: TTN-RFC-0007-Reliable-Delivery.md

Two signals, never conflated: the ESP-NOW TX callback paces bursts but proves
nothing; only an end-to-end `ACK` toot (type 5; payload ack_src u32 + ack_seq u32 +
ack_chunk u8 + status u8) confirms delivery, and only for `FLAG_WANT_ACK` toots after
HMAC accept. Retransmission runs from `loop()` (never a callback): RTO0 150 ms one
hop / 500 ms via bridge, ×2 backoff, N = 4 attempts, then declared undelivered —
failure reported, never hidden. Retransmits reuse the original (src, seq, chunk).
**The re-ACK rule (§5, the single most important point):** a dedup-dropped `want_ack`
toot MUST be re-ACKed without re-processing the body — gate it in the radio recv
callback beside dedup, never in shared `handleToot`. Chunking: body > 208 B splits
into chunk_idx/chunk_total sharing one (src, seq); per-chunk ACK with
REASSEMBLY_PENDING; MAX_REASSEMBLIES 2, TTL 5 s. Never chunk the TTDB stream — it is
offset-addressed and idempotent by design; loss there is repaired by re-request.

---

@LAT20LON8 | created:1782086400 | updated:1782086400 | relates:depends_on@LAT20LON7,depends_on@LAT10LON1
[ew]
conf:240
rev:0
sal:160
touched:1782086400
[/ew]

**TTN-RFC-0008 — Fleet Time-Sync** (Implemented ✅ on-device 2026-06-22)
src: TTN-RFC-0008-Time-Sync.md

No RTC, no NTP: wall clock is `nowEpochMs() = millis() + gClockOffsetMs`. Types:
TIME_SYNC (9, broadcast want_ack, sync_id u32 + epoch_ms u64), TIME_REQ (10) /
TIME_RESP (11) probes. Precision rule: sample `millis()` in the recv callback and
compute the offset there; defer the TTDB flash append to `loop()`. **Exactly-once is
gated on monotonic `sync_id`, never transport dedup** — the bridge self-adopts over
the un-deduped USB link, and the dedup ring can evict. On adoption a node appends a
`**SYNC**` record in its `lat 99` lane (lon = count of existing lane records) and
re-indexes; the laptop appends the same event to its master TTDB, so "all three carry
the record" is literally checkable. Skew verification is NTP-lite: K = 5 probes, keep
min-RTT sample, skew = node_epoch − (t0 + rtt/2), pass |skew| ≤ 50 ms — measured,
not assumed. Small negative skew (one-way delivery delay) is expected and benign.

---

@LAT20LON9 | created:1782259200 | updated:1782259200 | relates:depends_on@LAT20LON7,depends_on@LAT20LON8,depends_on@LAT10LON7
[ew]
conf:240
rev:1
sal:160
touched:1782259200
[/ew]

**TTN-RFC-0009 — TTDB Push-Back (Belief Distribution)** (Implemented ✅ on-device 2026-06-24)
src: TTN-RFC-0009-TTDB-Push-Back.md

The propagation half of the Dream Cycle: `TTDB_PUT` (type 12) writes an
offset-addressed byte stream to a node — 22 B header (target_node_id, belief_id,
total_len, crc32 zlib/IEEE **in every slice**, offset, len) + ≤ 186 B data;
stop-and-wait want_ack in offset order. Receiver is idempotent: already-adopted →
re-ACK; offset < next → re-ACK, no rewrite; gap → drop WITHOUT ACK (forces
retransmit). CRC-verified completion → adopt exactly-once by monotonic `belief_id`
(independent of dedup, like sync_id) → append `**BELIEF-ADOPTED**` attestation in the
live TTDB's `lat 98` lane. The belief lands in a separate `/belief.md` — a push can
never destroy the node's self-authored log. The belief carries a `**DIRECTIVE**`
(sense_interval_ms, floored 100 ms) the node acts on and attests
(`applied:interval_ms`) — proof the belief changed behavior, not just storage.
Readback (`TTDB_REQ_BELIEF`) lets the companion verify the stored object
byte-for-byte, not just trust the CRC.

---

@LAT20LON10 | created:1782432000 | updated:1783296000 | relates:depends_on@LAT20LON8
[ew]
conf:240
rev:1
sal:170
touched:1783296000
[/ew]

**TTN-RFC-0010 — Fleet Pulse (Band Time-Base)** (Implemented ✅ end-to-end 2026-06-26 → 07-06)
src: TTN-RFC-0010-Fleet-Pulse.md

Share the tempo, glance at the conductor: the beat is computed, never received. Each
node keeps `gPulseOffsetMs` (independent of the laptop wall clock — the band survives
without the laptop) and derives beat_count/phase from the chart: downbeat_epoch u64,
beat_period_ms u16, meter_beats u8, era + conductor_id. `PULSE` (type 13, 28 B,
broadcast, deliberately NOT want_ack — reliability is repetition) is the only
traffic, paced to measured drift (~1–2/min), zero per-beat frames; a joiner gets an
event-driven extra beacon on HELLO. Election: first-up conducts and keeps conducting;
a joiner falls into sync and never coups; id is only a tie-break, via the adoption
order (higher era, then lower conductor_id); conductor loss → timeout 4× resync
period, successor increments era and keeps the same grid so the beat never lurches.
±50 ms is swing (feel), not error. Parts/instruments split re-voices the band per
node; adoption may run in the recv callback (no flash write) but tones/LEDs are
played from `loop()`.

---

@LAT30LON1 | created:1777334400 | updated:1777334400 | relates:depends_on@LAT10LON1,depends_on@LAT10LON2,depends_on@LAT10LON3,depends_on@LAT10LON5
[ew]
conf:140
rev:0
sal:50
touched:1777334400
[/ew]

**TTCP-RFC-0001 — Record Rendering** (Draft)
src: TTCP-RFC-0001-Record-Rendering.md

A TTCP renderer fetches the TTDB no-store UTF-8, detects Markdown vs LaTeX, and
parses three ordered zones (mmpdb, cursor, records). Headers accept float coords,
long (`@LAT45.5LON-120.3`) or short (`@45.5x-120.3`) form, plus `type: record|scene`.
Latitude −90 marks special records (`ttdb-special`: tour_sound,
discovery_tour_off) — never navigable. Bodies render through a minimum Markdown
pipeline; `ttdb-record` blocks configure per-record audio and are stripped from
display. Lead media is extracted above the text (split layout on wide viewports).
`[ew]` fields MUST display (EPS bar) between title and body; `relates:` edges render
as a "Related records" section, unresolvable targets grayed out.

---

@LAT30LON2 | created:1777334400 | updated:1777334400 | relates:depends_on@LAT30LON1,depends_on@LAT10LON2,depends_on@LAT10LON3
[ew]
conf:140
rev:0
sal:50
touched:1777334400
[/ew]

**TTCP-RFC-0002 — Globe Visualization and Navigation** (Draft)
src: TTCP-RFC-0002-Globe-and-Navigation.md

Records project onto a unit sphere (standard spherical→Cartesian); zoom [0.7, 350],
front-face culling with muted back-face hints. Node states: undiscovered (gray, no
label), discovered (deterministic HSL color from ID hash), selected (the eyeball:
sclera/iris/pupil/shine, iris looking inward). Edges touching the selection render
bright. Interaction: drag rotates (momentum, invert-Y option), pinch/scroll zooms,
tap selects (≥16 px pointer / 28 px touch), reduced-motion honored. Discovery
persists per-database in local storage; search covers discovered records only.
Guided tour auto-advances ~12 s/record with slow mode. Scene records (`ttdb-scene`)
define a directed transition graph (hold_ms, duration, travel, direction; slide/
bloom/twist styles) whose playback suppresses tour and record audio. Side globes
represent other databases; tapping one switches with an animated transition.

---

@LAT30LON3 | created:1777334400 | updated:1777334400 | relates:depends_on@LAT30LON1,depends_on@LAT30LON2
[ew]
conf:140
rev:0
sal:50
touched:1777334400
[/ew]

**TTCP-RFC-0003 — Link System and Addressability** (Draft)
src: TTCP-RFC-0003-Link-System-and-Addressability.md

Every record is addressable: `toot://<db_alias>/<record_token>` where the token is
the lowercased coordinate (`lat45.5lon-120.3`). Four accepted link forms: toot URI
(preferred), legacy `@LAT…LON… [alias]`, path form `/lat…lon…?ttdb=alias`, and full
viewer URL (`?toot=&ttdb=`; `record`/`db` are synonyms). Alias resolution: exact path
→ basename → case-insensitive prefix; unresolvable links render non-interactive,
never as live anchors. Selection updates the URL via replaceState; on load, URL
params override the cursor block. Search: case-insensitive substring over discovered
records' title+header+body, ≤ 150 ms debounce, tour pauses while the input is
focused.

---

@LAT40LON1 | created:1776470400 | updated:1776470400 | relates:depends_on@LAT10LON1,depends_on@LAT10LON2,depends_on@LAT10LON3
[ew]
conf:210
rev:0
sal:140
touched:1776470400
[/ew]

**A32-RFC-0001 — Agent 32 Architecture Overview** (Stable)
src: A32-RFC-0001-Architecture.md

An A32 device reasons and acts fully offline: no cloud, no neural inference. The
TTDB *is* the model — firmware is a generic interpreter given purpose by the file;
knowledge stays human-readable Markdown, auditable in a text editor. Three layers:
TTDB (parse/query), Agent (sense-reason-act), Hardware (GPIO/I2C/SPI/comms
abstraction). Target ESP32-S3, 8 MB flash, PSRAM recommended; LittleFS support is
mandatory, SD optional (> 512 KB files). The umwelt is device identity: identical
hardware + different TTDB = different behavior, by design. Known gap:
store-and-forward buffering (TTN-RFC-0003 item) is undefined in A32.

---

@LAT40LON2 | created:1776643200 | updated:1776643200 | relates:depends_on@LAT40LON1,depends_on@LAT10LON1,depends_on@LAT10LON2,amended_by@LAT40LON5
[ew]
conf:210
rev:0
sal:150
touched:1776643200
[/ew]

**A32-RFC-0002 — TTDB Storage and Parsing on ESP32** (Stable)
src: A32-RFC-0002-TTDB-Storage.md

Never load the TTDB whole. Two-pass streaming: at boot, index every record header
into a flat 12-byte struct (int16 lat, int16 lon, u32 file_offset, u32 created, u32
updated), PSRAM if available; at runtime, seek to the offset and read to the next
`---`. The mmpdb block gets a purpose-built minimal YAML-subset parser (strings,
ints, bools, one nesting level, string lists) — never a full YAML library. Cursor
state lives in RAM; runtime movement doesn't write back unless requested. Librarian
primitive queries map string keys to handler functions, replies bounded by
max_reply_chars. Budget: ~3 KB overhead + 12 B/record index.

---

@LAT40LON3 | created:1776816000 | updated:1776816000 | relates:depends_on@LAT40LON1,depends_on@LAT40LON2,depends_on@LAT10LON3
[ew]
conf:210
rev:0
sal:130
touched:1776816000
[/ew]

**A32-RFC-0003 — Agent Loop and Hardware Abstraction** (Stable)
src: A32-RFC-0003-Agent-Loop.md

SENSE → REASON → ACT → WAIT (default 1000 ms, configurable). Sensors register with a
read fn + TTDB coordinate mapping + range; each cycle produces a fixed-size
StateSnapshot. Reasoning is deterministic graph traversal: quantize readings via
coord_increment, match the nearest indexed node (within threshold, else hold
position), then act on the node's edges — `triggers` (actuate), `navigates_to`
(move cursor), `inhibits`, `requires` (gate), `logs`. Actions drain through a
priority queue; conflicts resolve to highest priority. Observation logs are an
append-only side channel carrying db_id + umwelt_id provenance (TTN-RFC-0001 §5);
the TTDB itself is not modified at runtime. MUST feed the watchdog (`yield()` in
long scans); FreeRTOS dual-core split optional.

---

@LAT40LON4 | created:1776988800 | updated:1776988800 | relates:depends_on@LAT40LON1
[ew]
conf:210
rev:0
sal:40
touched:1776988800
[/ew]

**A32-RFC-0004 — Claude Code Project Setup** (Stable; build tooling superseded in robot_team — see @LAT98LON0)
src: A32-RFC-0004-Claude-Code-Setup.md

Reference project scaffolding: concise CLAUDE.md onboarding the agent into embedded
constraints (stream the TTDB, feed the watchdog, LittleFS not SPIFFS, int16 coords,
char[] over String), `data/ttdb.md`, `lib/TTDB` + `lib/Agent32`, PlatformIO configs
for ESP32-S3 and WROOM, and a `native` env with mock sensors for desktop testing.
Firmware and TTDB are versioned independently — either updates without the other.

---

@LAT40LON5 | created:1776902400 | updated:1776902400 | relates:amends@LAT40LON2,implements@LAT10LON5
[ew]
conf:210
rev:0
sal:80
touched:1776902400
[/ew]

**A32-RFC-0002 Amendment A — TBEW Parser Extension** (Stable)
src: A32-RFC-0002-Amendment-A-TBEW.md

The C++ side of TTDB-RFC-0005: insert EW_OPEN / EW_FIELD / EW_CLOSE states between
COORD_READ and BODY in the line parser (`[ew]` anywhere else is body text).
`TootBitEW` struct carries conf/rev/sal/touched with an integer `eps()`;
`parseEWField` splits on the colon and clamps ranges. The writer omits an all-default
block to keep fresh entries clean; `rev` never increments on [ew]-only changes.
Malformed blocks are warnings — clamp, default, or skip the entry; never crash an
embedded parser. Note: its examples use a simplified un-piped header (Form A); the
robot_team fleet uses the full piped TTDB-RFC-0001 header instead (see @LAT98LON3).

---

@LAT50LON1 | created:1781568000 | updated:1781568000 | relates:derived_from@LAT10LON7,derived_from@LAT10LON8
[ew]
conf:120
rev:0
sal:60
touched:1781568000
[/ew]

**ARC-RFC-0001 — Dynamics Solver Architecture** (Proposed)
src: ARC-RFC-0001-Dynamics-Solver-Architecture.md

An additive, recognition-gated, abortable solver layer over the general explorer —
the disciplined form of per-instance solving that the 0.08 detectors got wrong. The
`Dynamic` protocol: `recognize` (0..1 structural fingerprint, precision-first),
`next_action` (re-derive from THIS frame every call, never a precomputed route,
returning an action + an `expect` predicate for the next frame). Dispatch requires
top confidence ≥ RECOG_HI with a uniqueness margin, else the explorer keeps control.
The supervisor keeps the explorer floor warm every frame (observe/propose/commit
split) and aborts to it after ABORT_K expectation failures, latching off for the
level. Guarantee: with an empty library the SupervisedAgent measures byte-identical
to the goal agent — no regression by construction. Each solved game ≈ +0.04 mean
score; de-risk tests (confusion matrix, within-dynamic generalization, abort safety,
composite) gate every addition.

---

@LAT98LON0 | created:1783468800 | updated:1783468800 | relates:contradicts@LAT40LON4,refines@LAT40LON1

**BELIEF — Build system: the A32 RFCs say PlatformIO; robot_team uses arduino-cli.**

A deliberate project decision recorded in CLAUDE.md/companion.md, overriding the A32
RFC default. Sketches live at `firmware/<node>/<node>.ino` with shared libraries
supplied via `--libraries firmware/libraries`; on the Windows K10 machine the real
build path is `.vscode/tasks.json` (full-path arduino-cli), with PowerShell scripts
(`Upload-K10-FS.ps1`, `Upload-V4-FS.ps1`) doing the mklittlefs + esptool filesystem
uploads that arduino-cli cannot. Read A32-RFC-0004's `pio run` instructions as
historical, not operative.

---

@LAT98LON1 | created:1783468800 | updated:1783468800 | relates:supports@LAT20LON7,supports@LAT20LON8,supports@LAT20LON9

**BELIEF — Exactly-once is application-level; dedup is radio-only.**

A cross-RFC invariant, verified on-device: `(src, seq)` dedup gates only the
ESP-NOW/LoRa receive path (replay + forwarding-loop guard); the trusted USB-CDC link
is deliberately un-deduped so the laptop can retry. Consequently every
exactly-once guarantee rides its own monotonic application id — `sync_id`
(TTN-RFC-0008), `belief_id` (TTN-RFC-0009) — which survives both dedup-ring eviction
and the bridge's self-adoption over serial. The re-ACK rule (TTN-RFC-0007 §5) is the
companion piece that lets retransmission and dedup coexist.

---

@LAT98LON2 | created:1783468800 | updated:1783468800 | relates:refines@LAT20LON4,refines@LAT20LON6

**BELIEF — The wire reality is binary HMAC-signed toot frames, not TTN tokens or the LoRa framing.**

The fleet's actual transport is the toot frame (typed binary messages, HELLO through
PULSE = 13, every one HMAC-signed with the shared `RobotTeamConfig.h` /
`companion.py` NETWORK_KEY; native tests pin the SHA-256/HMAC vectors so firmware
and laptop authenticate identically). TTN-RFC-0004's text token dictionary and
TTN-RFC-0006's LoRa frame layout are unexercised: LoRa remains gated (`USE_LORA 0`)
until PLAN.md Phase 4, and when it arrives it will carry toot frames. Both RFCs
stand as design references, not descriptions of current traffic.

---

@LAT98LON3 | created:1783468800 | updated:1783468800 | relates:contradicts@LAT40LON5,supports@LAT10LON1

**BELIEF — Fleet TTDBs use the full piped header, not Amendment A's simplified Form A.**

A32-RFC-0002 Amendment A illustrates a simplified record header (`@LATxLONy slug`,
no pipes). Every robot_team TTDB on flash (K10, V4s, T-Deck, master copies) uses the
full TTDB-RFC-0001 pipe-delimited form
(`@LATxLONy | created:<s> | updated:<s> | relates:<edges>`), and the firmware's
streaming indexer and `appendRecord` depend on it. Follow TTDB-RFC-0001 §3 when
authoring or appending records; read Amendment A only for its `[ew]` parsing rules.

---

@LAT98LON4 | created:1783468800 | updated:1783468800 | relates:supports@LAT20LON7,supports@LAT20LON8,supports@LAT20LON10

**BELIEF — The defer-to-loop discipline is the fleet's load-bearing runtime rule.**

Receive callbacks do only the time-critical minimum (sample `millis()`, adopt an
offset, run dedup/re-ACK); everything heavy — flash appends, streamed multi-frame
replies, retransmission state machines, tones and LEDs — runs from `loop()`, and
multi-frame bursts are paced on the TX-complete callback or ESP-NOW drops frames.
Established in PLAN.md Phase 1b, then required by TTN-RFC-0007 §4, TTN-RFC-0008 §3,
TTN-RFC-0009 (bridge-relayed put), and TTN-RFC-0010 §4.1. Any new toot handler
should be written against this rule first.
