# TTCP-RFC-0002: Globe Visualization and Navigation
### TTDB Content Publishing — Knowledge Globe, Cursor Selection, Discovery, Tour, and Scene Playback

**Version:** 1.0
**Status:** Draft
**RFC Number:** 0002
**Project:** toot-toot-engineering
**Component:** TTDB Content Publishing (TTCP)
**Depends on:** TTCP-RFC-0001 (Record Rendering), TTDB-RFC-0002 (Cursor Semantics), TTDB-RFC-0003 (Typed Edges)
**Author:** antfriend
**Created:** 2026-04-28

---

## 1. Abstract

This RFC specifies the interactive knowledge globe that is the primary spatial index for a TTDB Content Publishing view. It defines the 3D projection model, node and edge rendering states, globe interaction (drag, zoom, tap), cursor-driven record selection, the discovery system, the guided tour, scene record playback, and multi-database navigation via side globes. Together these mechanisms allow a reader to explore a TTDB knowledge graph as a navigable spatial environment.

---

## 2. Globe Projection Model

### 2.1 Coordinate Mapping

Each record's `@LAT<lat>LON<lon>` coordinate MUST be mapped to a point on a unit sphere using the standard spherical-to-Cartesian conversion:

```
x = cos(lat_rad) × sin(lon_rad)
y = sin(lat_rad)
z = cos(lat_rad) × cos(lon_rad)
```

The globe is oriented with north at the top and the prime meridian facing the viewer at rest.

### 2.2 Rotation State

The renderer MUST maintain a globe rotation state as two angles: `rotLat` and `rotLon`. These are applied via rotation matrices before projection to screen space. Implementations MUST also maintain `targetLat` and `targetLon` for smooth animation (§3.4).

### 2.3 Zoom

The renderer MUST support a zoom factor in the range [0.7, 350]. Default zoom MUST be 1.2. Zoom MUST be applied as a linear scale to the projected screen radius of the globe.

### 2.4 Front-Face Culling

Only nodes and edges with projected `z > 0` (facing the camera) MUST be rendered. Back-facing nodes and edges SHOULD be rendered as small muted indicators to convey globe depth.

---

## 3. Node Rendering

### 3.1 Node States

Each record maps to a node with one of three visual states:

| State | Condition | Appearance |
|---|---|---|
| Undiscovered | Record not yet visited | Small gray circle |
| Discovered | Record has been visited | Colored circle; color determined by §4.3 |
| Selected | Record is the active cursor selection | Eyeball rendering (§3.2) |

Back-facing nodes (z ≤ 0) MUST be rendered smaller and more muted than front-facing equivalents regardless of discovery state.

Labels (record title or ID) MUST be shown for discovered and selected nodes. Undiscovered nodes MUST NOT display labels.

### 3.2 Eyeball Rendering

The selected node MUST be rendered as a stylized eyeball composed of:

1. **Sclera** — white outer circle
2. **Iris** — colored inner circle using the node's discovery color
3. **Pupil** — black circle at the iris center
4. **Shine** — small white highlight

The iris MUST be offset toward the center of the globe projection to simulate the eye looking inward. The eyeball size SHOULD scale proportionally with zoom level.

### 3.3 Discovery Color Assignment

Each discovered record MUST be assigned a deterministic color using a hash of its record ID. The color MUST be expressed in HSL with:

- Hue: `hash % 360`
- Saturation: 62–84%
- Lightness: 48–64%

The same record ID MUST always produce the same color. Undiscovered nodes MUST use a neutral gray (e.g., `#6a6f78`).

---

## 4. Edge Rendering

Typed edges declared in the `relates:` header field (TTDB-RFC-0003) MUST be rendered as lines between the projected positions of source and target nodes, subject to front-face culling.

Edge rendering MUST apply these states:

| Condition | Color | Width |
|---|---|---|
| Connected to the selected node | Bright blue (e.g., `#7cc7ff`) | 2px |
| All other front-facing edges | Dark gray (e.g., `#2a3a4d`) | 1px |

Edges where either endpoint is back-facing (z ≤ 0) MUST NOT be rendered.

---

## 5. Globe Interaction

### 5.1 Drag

Drag gestures (mouse or single-touch) MUST rotate the globe by mapping horizontal drag delta to `rotLon` and vertical drag delta to `rotLat`. Latitude MUST be clamped to ±(π/2 − 0.05) radians. Implementations SHOULD support a user-configurable invert-Y setting persisted in local storage.

After a drag gesture ends, implementations SHOULD continue rotation with a decaying momentum proportional to the final drag velocity.

### 5.2 Pinch and Scroll Zoom

Pinch gestures and scroll wheel events MUST adjust the zoom factor. Each discrete scroll step SHOULD multiply the zoom by approximately 1.12. Zoom MUST be clamped to [0.7, 350].

### 5.3 Tap and Click Selection

A single tap or click within the hit radius of a node MUST select that record (§6). The tap detection threshold MUST be at least 16px for pointer devices and 28px for touch devices.

Tapping outside all node hit radii MUST have no selection effect.

### 5.4 Reduced Motion

If the user agent reports `prefers-reduced-motion: reduce`, all globe spin animations and record transition animations MUST be skipped. Selection changes MUST be applied instantly.

---

## 6. Cursor and Record Selection

### 6.1 Initial Selection

On load, the renderer MUST read the `cursor` block (TTDB-RFC-0002) and select the first entry in the `selected` list. If no cursor block is present or `selected` is empty, the renderer MUST select the first record in file order.

URL parameters (see TTCP-RFC-0003 §3) MUST override cursor-block selection when present.

### 6.2 Selecting a Record

When a record is selected (via tap, list click, tour advance, or link navigation), the renderer MUST:

1. Mark the record as discovered (§7.1) if not already.
2. Render the record's HTML content in the record view (TTCP-RFC-0001).
3. Animate the globe rotation toward the record's coordinates (§6.3).
4. Update the browser URL (TTCP-RFC-0003 §3).
5. Play record audio if configured (TTCP-RFC-0001 §7.1).

### 6.3 Globe Rotation Animation

On selection, the renderer MUST animate `rotLat` and `rotLon` from their current values to the target coordinates of the selected record. The animation SHOULD use a proportional interpolation (e.g., 15% of remaining delta per frame) with a stop threshold of 0.002 radians.

---

## 7. Discovery System

### 7.1 Discovery State

A renderer MUST track which records the user has visited. This state MUST be persisted in local storage, keyed by database path. The first record selected on any session MUST be automatically marked as discovered.

### 7.2 Forget Discoveries

A renderer MUST provide a user-accessible action to reset the discovery state for the current database, returning all records to the undiscovered state.

### 7.3 Interaction with Search

Search results (TTCP-RFC-0003 §4) MUST be restricted to discovered records only. Undiscovered records are not findable via search.

---

## 8. Guided Tour

### 8.1 Tour Behavior

When the guided tour is enabled, the renderer MUST automatically advance through discovered records on a timer. The default interval MUST be approximately 12 seconds per record.

Implementations MUST support a slow-pace mode that multiplies the interval by approximately 1.7× and transition durations by approximately 2.5×.

### 8.2 Tour Audio

If a `tour_sound` special record is present (TTCP-RFC-0001 §8.1), the renderer MUST play its `audio_path` as a looping background track during tour playback. Tour audio MUST be suppressed when the selected record has its own `ttdb-record` audio or when scene playback is active.

### 8.3 Tour Controls

The renderer MUST provide:

- A toggle to enable/disable the guided tour, persisted in local storage.
- A keyboard shortcut (Space) to pause and resume tour advancement.
- A slow-pace toggle.

Tour controls MUST be hidden when a `discovery_tour_off` special record is present.

### 8.4 Tour Suppression

The tour MUST pause when a search input is focused. It MUST resume when the search input is blurred.

---

## 9. Record Transition Animation

### 9.1 Transition Parameters

When advancing from one record to another (tour, scene, or direct selection), the renderer SHOULD animate the outgoing record leaving and the incoming record entering. Transition parameters are derived from the great-circle distance between source and target coordinates:

| Parameter | Range | Scaling |
|---|---|---|
| Duration | 160–1560ms | Proportional to distance |
| Travel distance | 72–372px | Proportional to distance |
| Direction | Unit vector | Great-circle bearing |

### 9.2 Named Transition Styles

| Style | Description |
|---|---|
| `slide` | Default. Linear translate in the bearing direction |
| `bloom` | Scale 0.72→1, rotate −12°→0°, opacity 0.12→1 |
| `twist` | Scale 1.22→1, rotate 14°→0°, translate opposite bearing |

Transition style MAY be specified explicitly in a scene edge (§10). When not specified, `slide` MUST be used.

---

## 10. Scene Records and Playback

### 10.1 Scene Record Type

A record with `type: scene` in the header is a **scene record**. It MUST contain a `ttdb-scene` fenced block defining a directed transition graph.

### 10.2 `ttdb-scene` Block Schema

```
```ttdb-scene
audio_path: <path>      # optional; looping audio for scene playback
start_node: @LAT…LON…  # optional; first node; defaults to first edge source
loop: true              # optional; restart from start_node after last edge

edge: <name> | from: @… | to: @… | hold_ms: <int> | duration_ms: <int> | travel_px: <int> | dir_x: <float> | dir_y: <float>
```
```

Each `edge:` line defines one transition step. Fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | required | Transition name |
| `from` | record ID | required | Source record |
| `to` | record ID | required | Destination record |
| `hold_ms` | integer | 1400 | Pause at source before transition |
| `duration_ms` | integer | derived | Transition animation duration |
| `travel_px` | integer | derived | Slide travel distance |
| `dir_x` | float | derived | Horizontal direction component |
| `dir_y` | float | derived | Vertical direction component |

### 10.3 Scene Playback Rules

When a scene record is selected and playback is started, the renderer MUST:

1. Disable the guided tour for the duration of playback.
2. Suppress record audio.
3. Navigate to `start_node` (or the first edge's `from` node) and wait `hold_ms`.
4. Execute each edge in sequence: animate the transition to the `to` node, wait `hold_ms` at the destination, then advance to the next edge whose `from` matches the current node.
5. If `loop: true` and an outgoing edge exists from the final node, restart from `start_node`.
6. If no outgoing edge is found, playback MUST stop and the tour MUST resume.

If `audio_path` is present, the scene's audio MUST play looping for the duration of playback and stop when playback ends.

### 10.4 Scene Controls

The renderer MUST provide user-accessible controls to start and stop scene playback when a scene record is selected. A status indicator SHOULD show the current playback state.

---

## 11. Multi-Database Navigation (Side Globes)

### 11.1 Available Databases

The renderer maintains a list of candidate database paths. The active database occupies the main globe. Other candidates MUST be represented as smaller **side globes** positioned to the left and right of the main globe.

### 11.2 Side Globe Rendering

Side globes MUST display:

- A scaled-down sphere representation
- A badge label derived from the database name or path
- A depth-based fade effect to indicate relative distance

Side globes MUST be rendered in priority order, with closer or more relevant databases appearing nearer to the main globe.

### 11.3 Database Switching

Tapping or clicking a side globe MUST initiate a database switch:

1. Animate the side globes off-screen using a cubic ease (220–760ms proportional to distance).
2. Fetch and parse the new database file (TTCP-RFC-0001 §2).
3. Apply the preferred record selection if arriving from a cross-DB link (TTCP-RFC-0003 §2).
4. Reset the discovery session for the new database (§7.1 discovery is per-database).

---

## 12. Graticule

The renderer SHOULD render a latitude/longitude grid (graticule) on the globe surface to provide spatial orientation. Recommended intervals: 30° for latitude bands, 6° for longitude subdivisions. The graticule MUST be rendered behind nodes and edges and SHOULD use a low-contrast color to avoid obscuring content.

---

## 13. Relationship to Existing RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0002 | Cursor block provides initial selection on load |
| TTDB-RFC-0003 | Typed edges rendered as globe lines (§4) |
| TTDB-RFC-0005 | Epistemic weight MAY influence cursor prioritization |
| TTCP-RFC-0001 | Record HTML rendering invoked on selection |
| TTCP-RFC-0003 | URL sync and link navigation trigger selection changes |

---

## 14. Open Questions

1. **Tour interval configuration:** Should `max_nodes` or another `cursor_policy` field govern tour pacing, or is a fixed interval appropriate?
2. **Scene edge ordering:** Should edges be matched by `from` node only (non-deterministic if multiple edges share a source), or must the `name` field impose a total order?
3. **Side globe discovery:** Should the discovery state of a side-globe database be visible (e.g., number of discovered records as a badge) before switching?
4. **Collaborative selection:** In a multi-agent deployment, should the cursor block synchronize across clients in real time?

---

## 15. Changelog

| Date | Change |
|---|---|
| 2026-04-28 | Initial draft |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0*
