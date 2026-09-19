# ICU2 TTDB

The combat record of **ICU2**, a Idaho Robot Combat League (IRCL) antweight,
and of **ICU** before it. Six records, one per fight, laid out on the same
sine-wave ribbon the front door uses
(`lat = 34 · sin((lon + 150) · 1.2°)`, `lon ∈ [-150, 150]`), then closed back
along the equator. The ribbon runs newest to oldest: the card at `(0, -150)`
is the most recent fight on the channel's Videos tab, and the walk east goes
back through two seasons to the first arena-camera match.

Every record is one match. Its body is a toot frame holding the YouTube
player, so the fight plays inside the record rather than beside it. Card art
is the video's own thumbnail — no placeholders in this deck.

```mmpdb
db_id: ttdb:tte:icu2:v1
db_name: "ICU2"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
source:
  channel: "https://www.youtube.com/@antfriend/videos"
  channel_id: UCHUjNpsRjye59GbY1tdgBBg
  harvested: 1758240000
  method: "channel Atom feed + oEmbed, newest six of the Videos tab"
  note: "Shorts live on a separate tab and are out of scope for this deck."
umwelt:
  umwelt_id: umwelt:tte:icu2:pilot:v1
  role: fight_log
  perspective: "The driver, replaying the last six matches in order."
  scope: "One record per published match video. No build logs, no parts lists."
  constraints:
    - "One record per video."
    - "Every record's body is a toot frame holding that video's player."
    - "Coordinates are ribbon positions, not arena positions."
  globe:
    frame: "ribbon"
    origin: "the newest fight at (0, -150); the ribbon runs west to east, newest to oldest."
    mapping: "lat = 34 * sin((lon + 150) * 1.2deg), sampled every 60deg of lon."
    note: "A single closed circuit: six fights forward along the sine, one dashed return arc along the equator."
cursor_policy:
  max_preview_chars: 260
  max_nodes: 12
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "next/prev walk the ribbon backward in time. same_event> ties the two fights of one tournament day; succeeds> crosses from ICU to ICU2."
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
  @LAT0LON-150: "Spring Bot Breaker 2026. The most recent match on the channel, and the newest card on the ribbon."
```

---

@LAT0LON-150 | created:1774740341 | updated:1774740341 | relates:next>@LAT32LON-90,prev>@LAT0LON150,same_event>@LAT32LON-90,opens>https://www.youtube.com/watch?v=fNIpPwDtRdI

## Dread vs ICU2

### Spring Bot Breaker 2026 — the newest match on the channel

![Dread vs ICU2](https://www.youtube.com/embed/fNIpPwDtRdI)

Idaho Robot Combat League (IRCL), Spring Bot Breaker 2026. Published
2026-03-28. The later of two matches posted that night — see
[Brawndo vs ICU2](lat32lon-90) for the other.

---

@LAT32LON-90 | created:1774735261 | updated:1774735261 | relates:prev>@LAT0LON-150,next>@LAT20LON-30,same_event>@LAT0LON-150,opens>https://www.youtube.com/watch?v=4pwa4fanebo

## Brawndo vs ICU2

### Spring Bot Breaker 2026 — it's got what bots crave

![Brawndo the thirst mutilator vs ICU2](https://www.youtube.com/embed/4pwa4fanebo)

Full title: **Brawndo the thirst mutilator vs ICU2**. Idaho Robot Combat
League (IRCL), Spring Bot Breaker. Published 2026-03-28, about ninety minutes
before [Dread vs ICU2](lat0lon-150).

---

@LAT20LON-30 | created:1743367788 | updated:1743367788 | relates:prev>@LAT32LON-90,next>@LAT-20LON30,same_event>@LAT-20LON30,opens>https://www.youtube.com/watch?v=4E-GoIVSqRU

## ICU2 vs Benny

### Spring Bot Breaker 2025 — "OMG!"

![ICU2 vs Benny at IRCL SBB](https://www.youtube.com/embed/4E-GoIVSqRU)

IRCL Spring Bot Breaker, one year earlier. The whole description the driver
left on it was `OMG!`. The other half of that day is
[ICU2 vs TENACITY](lat-20lon30).

---

@LAT-20LON30 | created:1743366963 | updated:1743366963 | relates:prev>@LAT20LON-30,next>@LAT-32LON90,same_event>@LAT20LON-30,succeeds>@LAT-32LON90,opens>https://www.youtube.com/watch?v=aI-1Mblat-A

## ICU2 vs TENACITY

### Spring Bot Breaker 2025 — "it was epic"

![ICU2 vs TENACITY at SBB](https://www.youtube.com/embed/aI-1Mblat-A)

The earliest ICU2 match on the ribbon, published 2025-03-30, about fourteen
minutes before [ICU2 vs Benny](lat20lon-30). Everything east of here is the
previous robot: [ICU vs Jumbo](lat-32lon90) and
[ICU vs Broombox](lat0lon150).

---

@LAT-32LON90 | created:1721573043 | updated:1721573043 | relates:prev>@LAT-20LON30,next>@LAT0LON150,same_event>@LAT0LON150,precedes>@LAT-20LON30,opens>https://www.youtube.com/watch?v=jZzbHTkNy04

## ICU vs Jumbo

### Gem State 2024 — shot from inside the robot

![ICU battles Jumbo, as seen from robot's perspective](https://www.youtube.com/embed/jZzbHTkNy04)

Full title: **ICU battles Jumbo, as seen from robot's perspective**. Tagged
`#gemstate7-20-2024plantsandants`, IRCL. The first generation, ICU, carrying
the camera that gives this deck its name.

---

@LAT0LON150 | created:1721572476 | updated:1721572476 | relates:prev>@LAT-32LON90,next>@LAT0LON-150,same_event>@LAT-32LON90,opens>https://www.youtube.com/watch?v=hocOO_a416U

## ICU vs Broombox

### Gem State 2024 — the arena from the floor

![Robot combatant, ICU's view from inside the arena, battling Broombox](https://www.youtube.com/embed/hocOO_a416U)

Full title: **Robot combatant, ICU's view from inside the arena, battling
Broombox**. Tagged `#gemstate7-20-2024plantsandants`, IRCL. The oldest fight
on the ribbon; `next` closes the circuit back to
[Dread vs ICU2](lat0lon-150) along the dashed equator arc.

---
