# TTN-RFC-0010: Fleet Pulse — Self-Synchronizing Heartbeat and the Band Time-Base

**Version:** 1.0
**Status:** Implemented — end-to-end on-device verified 2026-06-26 (3-node ensemble ±10.4 ms) through 2026-07-06 (parts/melodies, 120 BPM duet)
**RFC Number:** 0010
**Project:** robot_team
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0008 (Time-Sync — clock-offset model, reused), TTN-RFC-0001 (Core Semantic Mesh), `toot_network_architecture.md` §3 (toot frame), `hardware_specs.md` (board GPIO)
**Author:** antfriend
**Created:** 2026-06-26

This RFC specifies a **fleet pulse**: a shared ~1 Hz heartbeat that every node fires
on, in tight phase, *without* a per-beat message on the wire. The **first node up
starts the pulse**; nodes that join **fall into sync**; and the band stays together by
**holding a shared tempo and only glancing at the conductor as often as drift
requires** — not by chattering every beat. The K10 plays its toot and pulses its LEDs;
the V4s pulse their onboard LED and flash an OLED beat indicator.

This is deliberately designed as the **time-base for a small band of musicians.** The
pulse is the click track; the ±50 ms tolerance is not slop but **swing** — the band's
expressive micro-timing envelope. The next progression (out of scope here, but this
RFC is built to carry it) is individual **parts and melodies** on purpose-built
instrument hardware. The architecture therefore separates three concerns cleanly:
the **time-base** (this RFC), the **chart** (which beats a node plays), and the
**instrument** (what a beat sounds/looks like).

It is a new project capability, not in `PLAN.md` yet — a sibling of Phase 2.5
time-sync. It reuses that RFC's clock-offset machinery wholesale.

---

## 1. Principle: musicians don't message every beat — they keep time

A naive "pulse" broadcasts a beat toot every second and everyone blinks on receipt.
That spends one frame per beat per node and couples the band's tightness to the
radio's per-frame jitter. Real musicians do the opposite: they **agree on a tempo**,
each keeps that tempo internally, and they only **look up at the conductor
occasionally** to trim the drift between them. We do exactly that.

- **The beat is computed, not received.** Every node derives its beat grid from a
  shared clock (§2). Between corrections, **zero** pulse traffic crosses the wire.
- **Correction is paced to drift, not to tempo.** A node's clock drifts from the
  conductor's by a bounded rate (§5). We re-sync only as often as that drift threatens
  the swing budget — empirically about **once or twice a minute**, independent of how
  fast the band is playing. That is the "as much traffic as needed and no more."
- **Tightness is a property of the shared clock, not the last packet.** A dropped
  correction beacon costs a little accumulated drift, recovered by the next one — never
  a missed beat.

> Design slogan: **share the tempo, glance at the conductor.** The wire carries the
> *chart*, never the *click*.

---

## 2. The band time-base (a pulse clock, peer-seeded)

The pulse rides the same clock-offset model as TTN-RFC-0008 §1, but with its **own
offset register** so the band is fully autonomous — it does **not** require the laptop
to have run `sync`. The first node to start playing *is* the time source.

```
gPulseOffsetMs : int64_t            // band-epoch ms minus local millis() at adoption
pulseNow()    := (int64_t)millis() + gPulseOffsetMs
```

`gPulseOffsetMs` is independent of TTN-RFC-0008's `gClockOffsetMs` (laptop wall clock).
Keeping them separate is deliberate: the band's groove must survive whether or not the
laptop is present, and a laptop wall-clock re-sync must not yank the downbeat. (A
future bandleader mode MAY seed the pulse clock from the laptop epoch; see §9.)

The **chart** that defines the grid is four numbers, carried in the beacon (§4):

```
downbeat_epoch  u64   band-epoch ms of beat 0 (bar 1, beat 1)
beat_period_ms  u16   the tempo (e.g. 500 = 120 BPM; default DEFAULT_BEAT_MS)
meter_beats     u8    beats per bar (e.g. 4)
era / conductor see §3 (who owns the chart, and which revision)
```

Given the chart, every node computes the grid with no further communication:

```
ticks      := pulseNow() - downbeat_epoch          // ms since beat 0 (>=0 once playing)
beat_count := floor(ticks / beat_period_ms)         // monotonic beat number
beat_in_bar:= beat_count mod meter_beats            // 0..meter_beats-1 (0 = downbeat)
phase_ms   := ticks - beat_count * beat_period_ms   // 0..beat_period_ms-1 into the beat
```

A node **fires a beat** the moment `beat_count` increments (i.e. `phase_ms` wraps past
0), offset by its part's swing (§6). No node ever waits for a packet to play.

---

## 3. Conductor: first up starts it and keeps it; id breaks ties

Exactly one node at a time is the **conductor** — the owner of the chart and the
time-base origin. Election is leaderless-simple and self-healing. The guiding rule is
**whoever counts the band in keeps conducting**: a node that adopts an existing chart
becomes a follower and does *not* stage a coup just because it has a lower id (that is
the "joiner falls into sync" behavior). Node id only **breaks ties** — between two
nodes that cold-start at the same time, and to order who grabs the baton after the
conductor is lost.

1. **Cold start (first up).** On boot a node listens for `PULSE` for
   `LISTEN_WINDOW_MS` (default 3000, > one resync period would be wasteful; 3 s is a
   few missed beacons' worth). Hearing none, it **becomes conductor**: it seeds
   `gPulseOffsetMs = 0` (its own `millis()` is the band epoch), sets
   `downbeat_epoch = pulseNow()` rounded up to the next beat boundary,
   `beat_period_ms = DEFAULT_BEAT_MS`, `era = 1`, `conductor_id = kNodeId`, and starts
   emitting beacons (§4) and playing.

2. **Joining (falls into sync).** A node that hears a `PULSE` during its listen window
   (or any time later) **adopts the chart**: it sets
   `gPulseOffsetMs = beacon.conductor_epoch − recv_millis` (the same instant-of-receipt
   rule as TTN-RFC-0008 §3, so the residual is just the one-way delivery delay), copies
   `downbeat_epoch / beat_period_ms / meter_beats / era / conductor_id`, and begins
   playing on the next computed beat. It does **not** become conductor.

3. **Tie-break (two cold-start simultaneously).** Both may briefly self-appoint. The
   adoption rule (§4.1) converges them: a beacon is adopted if it is *better* than the
   node's current chart, ordered by **(higher `era`, then lower `conductor_id`)**. A
   self-appointed conductor that hears a better beacon yields conductorship and adopts.
   So two co-starting nodes settle on the **lower id**. Note this resolves *competing
   conductors only*; a node that already follows a chart does not re-challenge with its
   id (see the rule above) — that is intentional, so a late-booting low-id node joins
   the beat instead of yanking it.

4. **Conductor loss / handoff.** A non-conductor that hears no `PULSE` for
   `CONDUCTOR_TIMEOUT_MS` (default 4 × `resync_period`, see §5) re-enters the
   cold-start listen window and may take over. The new conductor **increments `era`**
   and keeps the *same* `downbeat_epoch` and `beat_period_ms` it last held, so the band
   does not lurch — the beat continues, only the timekeeper changed. The higher `era`
   makes every node prefer the new conductor; a returning old conductor with a lower
   `era` yields immediately (no flapping).

> The conductor is a *timekeeper*, not a master the others obey beat-by-beat. Losing it
> degrades gracefully to free-running on the last chart, drifting only at the §5 rate
> until a new conductor's first beacon re-tightens the band.

---

## 4. The `PULSE` toot (one type, sent rarely)

A single new type extends `toot::Type` (value **13**, the next free slot after
`TTDB_PUT = 12`), and its mirror in `companion.py`. There is **no** per-beat toot —
`PULSE` is only the chart/correction beacon.

| Type | Value | Direction | Purpose |
|---|---|---|---|
| `PULSE` | 13 | conductor → fleet (broadcast) | announce/maintain the chart + band time-base |

### 4.1 `PULSE` payload (30 B, v2)

```
 off  field            bytes  notes
   0  conductor_id     4      u32 LE — who owns this chart
   4  era              4      u32 LE — chart revision; higher wins (§3.3)
   8  conductor_epoch  8      u64 LE — pulseNow() sampled the instant the beacon is built
  16  downbeat_epoch   8      u64 LE — band-epoch ms of beat 0
  24  beat_period_ms   2      u16 LE — tempo
  26  meter_beats      1      u8     — beats per bar
  27  flags            1      u8     — bit0 LAPTOP_TIMEBASE (pulse clock == laptop epoch)
  28  scene_id         2      u16 LE — (v2) the band's position in a multi-part song
```

(30 B total — well within the 208-byte payload limit. v1 was 28 B, ending at `flags`.)

**`scene_id` — the chart says WHAT to play, not only how fast.** A multi-part song
needs the band to agree on its place in the piece, and that agreement belongs on the
chart rather than in a message of its own, because it then inherits the chart's two
properties for free: it propagates on the same rare drift-paced beacon (§5 — no
per-scene chatter), and it **survives conductor handoff**, since a takeover keeps the
chart and only bumps the era (§3.3). Kill the node that is counting and the band keeps
its place in the song. Only the conductor may author a scene; a follower that receives
a scene command declines it and adopts the next beacon instead, so the band cannot fork.
A scene change bumps the era (it is a chart revision) and triggers an immediate beacon,
so the band turns the page together rather than drifting apart for a resync period.

**Version compatibility is two-way**, because a fleet is flashed one node at a time.
A receiver MUST accept a 28-byte v1 payload and read `scene_id` as 0; a v1 receiver
ignores the 2-byte tail, since its length check is `>= 28`. So a half-reflashed band
still shares one time-base — it simply has no shared scene until the conductor is on v2.

**Sent broadcast, NOT `want_ack`.** This is the load-bearing traffic decision: a
`PULSE` is periodic and idempotent, so a lost one is simply superseded by the next —
adding ACK/retransmit (TTN-RFC-0007) would spend frames against the very goal of §1.
The conductor self-paces (§5); reliability comes from repetition over time, not
per-frame ACK. Dedup is the normal radio `(src,seq)` guard with a fresh `seq` per
beacon, so no legitimate beacon is ever dropped as a replay.

**Adoption test (run on every received `PULSE`):** adopt iff
`(era, −conductor_id)` is strictly greater than the node's current chart's, **or**
the beacon is from the node's *current* conductor (a routine correction — re-seat
`gPulseOffsetMs` and refresh `downbeat_epoch`). Adoption re-seats the pulse clock at
receipt instant (§3.2). Heavier work is nil — there is no flash write here, unlike
TTN-RFC-0008 — so adoption MAY run in the receive callback; **playing the resulting
beat (tone/LED) is deferred to `loop()`** per the Phase 1b discipline (the K10's
`playTone` blocks and must never run in the WiFi recv callback).

### 4.2 On-join fast-lock (event-driven, not just periodic)

To avoid a joiner waiting up to a full resync period to hear its first beacon, the
conductor emits an **extra** `PULSE` promptly when it sees a node arrive — i.e. on
receiving a `HELLO` (type 1) or any toot from a `src_node_id` it has not heard this
session. This bounds join-to-lock to ~one round trip while keeping steady-state
traffic at the §5 rate. (A node may also emit one `HELLO` on boot to trigger this.)

---

## 5. Traffic pacing — derived from drift, not from tempo

The conductor emits a steady-state `PULSE` every `resync_period`. We choose it from
the worst-case relative clock drift so that **involuntary** phase error stays inside a
reserved slice of the swing budget, leaving the rest of the budget for *intentional*
musical timing (§6).

```
swing_budget_ms   := 50        // the ±tolerance; the band's whole timing envelope
drift_reserve_ms  := 15        // slice reserved for clock drift (rest is musical swing)
DRIFT_PPM         := 50        // design worst-case relative drift, two ESP32 crystals
                               // (~±10–40 ppm each; 50 ppm relative is conservative)

resync_period_max := drift_reserve_ms / DRIFT_PPM
                  =  0.015 s / 50e-6  =  300 s  (5 minutes)
```

So a beacon **at least every 5 minutes** keeps involuntary drift under 15 ms. The
default `RESYNC_PERIOD_MS = 30000` (30 s) gives a ~6× safety margin (worst-case ~1.5 ms
of accumulated drift between corrections) at a cost of **one toot per 30 s** — at
120 BPM that is **one frame per ~60 beats**. The band is tight; the wire is nearly idle.

**Optional adaptive pacing (refinement, not required for v1):** a node can measure its
own observed drift against successive beacons (compare predicted vs. adopted
`gPulseOffsetMs`); the conductor MAY lengthen `resync_period` when the band is
measured tight and shorten it under thermal stress. v1 ships the fixed 30 s and the
on-join fast-lock (§4.2); the math above is the ceiling that keeps it honest.

> Net traffic model: **rare periodic** (≤ once / `RESYNC_PERIOD_MS`) **+ on-join**.
> Zero per beat. This is the explicit answer to "use only as much network traffic as
> needed to keep the band tight."

---

## 6. Swing — the ~50 ms is feel, not error

The ±50 ms tolerance is the band's **expressive timing envelope**, partitioned:

```
| reserved for clock drift (§5)  | musical swing range                     |
|<------ drift_reserve_ms ------->|<----- swing_budget_ms − drift_reserve --->|
        (involuntary, ~15 ms)              (intentional, ~±35 ms)
```

Each node's **part** (§7) carries two timing knobs, both bounded so the worst-case sum
`|drift| + |swing_offset| + |humanize|` ≤ `swing_budget_ms`:

- **`swing_offset_ms` (deterministic feel):** a fixed micro-timing per part — *lay back*
  the backbeat (+ms, relaxed) or *push* it (−ms, urgent). Applied as a phase shift to
  that part's beat: a hit lands at `beat boundary + swing_offset_ms`.
- **`humanize_ms` (breath):** a small bounded per-hit pseudo-random jitter (uniform in
  `±humanize_ms`) so the band breathes instead of sounding like a metronome. Seeded
  per node so parts don't jitter in lockstep.

A part with `swing_offset_ms = 0, humanize_ms = 0` is a hard metronome — valid, just
unmusical. The point of the tolerance is that the *clock* must hold the band to within
the envelope so that the *music* has room to move inside it.

---

## 7. The chart: parts and instruments (the band)

The pulse is the time-base; a **part** is what a node plays on the grid; an
**instrument** is how a beat is rendered. Separating these is what makes "develop
individual parts and melodies on purpose-built hardware" an additive change rather than
a rewrite.

```c
struct Part {
  uint8_t  beat_mask;     // bit b set => play on beat_in_bar == b (e.g. 0b0001 = downbeat)
  int8_t   swing_ms;      // §6 deterministic feel, signed
  uint8_t  humanize_ms;   // §6 breath, bounded jitter
  void   (*hit)(uint8_t beat_in_bar, uint8_t velocity);  // the instrument
};
```

A node fires `part.hit(beat_in_bar, velocity)` from `loop()` when its grid (§2) crosses
a beat whose bit is set in `beat_mask`, at `boundary + swing_ms + humanize()`. `velocity`
is reserved for dynamics (downbeat louder, etc.) and is a constant in v1.

### 7.1 v1 band — a real groove on the three nodes on hand

| Node | Role in band | `beat_mask` (4/4) | Instrument (`hit`) |
|---|---|---|---|
| **V4-A** (head/bridge) | timekeeper — "hi-hat" | `1111` (every beat) | onboard LED blink + OLED beat dot |
| **K10-1** (leaf) | lead — the toot | `0001` (downbeat) | `music.playTone` toot + RGB LED flash |
| **V4-B** (mid/relay) | backbeat — "snare" | `0101` (beats 2 & 4) | onboard LED blink + OLED beat dot |

This yields an audible/visible 4/4 groove: V4-A ticks every beat, the K10 sounds the
downbeat, V4-B hits the backbeat. Parts are **data**, so re-voicing the band (or adding
the V4-C edge, or a purpose-built instrument node) is a table edit, not new protocol.

### 7.2 Instrument notes per board

- **K10 (lead):** the toot reuses the existing deferred-beep path
  (`k10_percept.ino` `gBeepPending`/`gBeepFreq`/`gBeepBeat`) — `playTone` blocks and is
  scheduled from `loop()`, never the recv callback. Keep the downbeat blip short
  (≤ ~80 ms) so it cannot smear the next beat. LED reuses `k10.rgb->write(-1, color)`;
  a beat flashes a color, cleared on the next `loop()` pass, and a `set-led` CMD
  override (TTN-RFC-0009 path) still wins over the pulse flash when engaged.
- **V4-A / V4-B (LED pulse — new):** drive the **onboard white LED** (Heltec V4 is
  pin-compatible with V3; the white LED is GPIO35 — **confirm against the V4 pinmap
  before committing**, consistent with `hardware_specs.md`'s own pin caveat). The LED
  pulses ON at the hit and OFF after a short `LED_PULSE_MS` (~60 ms) timed from
  `loop()` via `millis()`, never `delay()` (the V4 must keep serving ESP-NOW). The
  **OLED** (confirmed SSD1306, SDA 17 / SCL 18 / RST 21) gains a beat indicator —
  e.g. a filled box on the hit beat plus the live tempo/era — added to the existing
  status page. If GPIO35 cannot be confirmed, the OLED beat dot is the guaranteed
  fallback so the V4 still shows the pulse.

---

## 8. `companion.py` — observe and measure the band (no per-beat role)

The laptop is **not** in the beat loop; the band keeps itself. The companion's job is
to *watch* and *verify tightness*, reusing the TTN-RFC-0008 §6 probe shape.

```
python companion.py band --port COM6 [--nodes v4a_bridge,v4b_relay,k10_1] [--bound-ms 50]
```

1. **Read each node's chart + phase.** Extend the STATUS `PERCEPT` (TTN-RFC-0007 era
   telemetry, `CMD_GET_STATUS`) with the node's `era`, `conductor_id`,
   `beat_period_ms`, `scene_id`, and current `phase_ms` (or `last_downbeat_epoch`). One
   status request per node — not per beat. The tail is appended after the 15-byte STATUS
   base and grows additively (43 B v1, 45 B with `scene_id`), so a plain STATUS reader
   still parses the prefix and a node on older firmware simply reports scene 0.
2. **Compute inter-node skew like `verify`.** With min-RTT compensation, compare each
   node's reported beat phase to the conductor's at a common instant; report a table
   `node | conductor_id | era | scene | beat_period | phase_skew_ms`. **Pass = every
   node's phase within `--bound-ms` (default 50) of the conductor**, i.e. inside the
   swing envelope, **and one shared chart** — a single conductor *and* a single scene.
   A band split across scenes is playing different parts of the song, which is a real
   convergence failure, not a cosmetic one.
3. **Optional `band --watch`** prints the table live (like `monitor`), so a human can
   see the band lock as nodes join and re-tighten after a conductor handoff.

This makes "the ~50 ms tightness" a *measured* claim, the same discipline TTN-RFC-0008
used for clock skew — not a "looks synced" assertion.

---

## 9. Relationship to other RFCs & future progression

- **TTN-RFC-0008 (Time-Sync)** is the parent: this RFC reuses its clock-offset model
  and instant-of-receipt adoption rule, but with an independent `gPulseOffsetMs` so the
  band is autonomous of the laptop wall clock. A future **bandleader** mode MAY set
  `flags.LAPTOP_TIMEBASE` so the conductor seeds the pulse clock from the laptop epoch
  (e.g. to sync the band to an external recording), but that is opt-in.
- **TTN-RFC-0007 (Reliable Delivery)** is deliberately **not** used for `PULSE` (§4.1):
  periodic idempotent beacons are made reliable by repetition, not ACK, to honor the
  minimal-traffic goal. (CMD-driven tempo changes, if added, would be `want_ack`.)
- **Toot frame** (`toot_network_architecture.md` §3) and `(src,seq)` radio-only dedup
  (companion.md §6) are unchanged; `PULSE` is broadcast, non-forwarded (it carries no
  RELAY semantics and V4-B's `USE_RELAY_FORWARD` stays off), so no forwarding loop.
- **Future — parts, melodies, purpose-built instruments.** The `Part`/`hit` split (§7)
  is the seam: a melody is a per-beat *note table* feeding a tone instrument; a
  purpose-built node registers its own `hit`. None of that touches the time-base or the
  beacon — the chart grows, the protocol does not. This RFC is the floor the band
  stands on.

---

## 10. Test plan (Definition of Done)

1. **First-up starts it.** Power one node alone; after `LISTEN_WINDOW_MS` it conducts
   and plays its part on a steady grid (observe its LED/OLED/toot at the default tempo).
2. **Join falls into sync.** Power a second node; within ~one round trip
   (§4.2 on-join beacon) it locks to the chart and plays its part in phase. `band`
   reports `phase_skew_ms` within ±50 of the conductor.
3. **Three-node groove.** With V4-A + K10 + V4-B up, observe the 4/4 voicing (§7.1) and
   confirm `band` shows all three inside the envelope.
4. **Tight with near-zero traffic.** Count `PULSE` frames over 2 minutes: expect
   ~`120000/RESYNC_PERIOD_MS` (≈4 at 30 s) plus on-join beacons — **not** ~240 (one per
   beat). The band stays inside ±50 ms across that window with no per-beat toot.
5. **Conductor handoff.** Power off the conductor; after `CONDUCTOR_TIMEOUT_MS` the
   lowest-id survivor takes over with `era+1`, the beat continues without a lurch, and
   `band` shows the new `conductor_id`/`era` with the band still inside the envelope.
6. **Swing is real, not slop.** With `humanize_ms`/`swing_ms` set, confirm hits move
   *within* the envelope (measured spread > 0) while `band` still passes the ±50 bound —
   proving the tolerance is expressive headroom, not uncorrected error.

Done when 1–6 pass on the K10 + V4-A + V4-B on hand. Then update `companion.md` §2
(fleet status), §6 (next action), and `PLAN.md` (add the pulse milestone), and add the
LED-pulse note for the V4s to `CLAUDE.md` if GPIO35 needed confirming.
