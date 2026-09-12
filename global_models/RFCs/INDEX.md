# RFC Index — Global Models

The subset of the [toot-toot-engineering](https://antfriend.github.io) RFC corpus that
this project actually depends on. Copied here so the repository is self-contained; the
full corpus lives upstream.

Read them in this order.

## The format — what a store *is*

| RFC | Title | Why it is here |
|---|---|---|
| [TTDB-RFC-0001](TTDB-RFC-0001-File-Format.md) | File Format and Sections | The three-zone model (`mmpdb` / `cursor` / records), the record header, and §5's rule that **unknown content must be preserved** — which `lane:` depends on. |
| [TTDB-RFC-0002](TTDB-RFC-0002-Cursor-Semantics.md) | Cursor Semantics | The `cursor` block that decides which record is selected on load. |
| [TTDB-RFC-0003](TTDB-RFC-0003-Typed-Edges.md) | Typed Edge Semantics | Edges are **directional and subjective** — never infer the reverse. §7 separates the epistemic `contradicts` from the semantic `opposes`; this store uses `contradicts` in its strict sense at `@LAT26.5LON-70`. |
| [TTDB-RFC-0004](TTDB-RFC-0004-Event-ID-and-Collision.md) | Event ID and Collision | Why `collision_policy: reject` is safe when two records sit a tenth of a degree apart. |
| [TTDB-RFC-0005](TTDB-RFC-0005-Epistemic-Weight.md) | Toot-Bit Epistemic Weight (TBEW) | `conf` / `rev` / `sal` / `touched` and **`EPS = sal × (255 − conf) / 255`**. This is the RFC that decides the roadmap. |

## The viewer — what rendering a store *means*

| RFC | Title | Why it is here |
|---|---|---|
| [TTCP-RFC-0001](TTCP-RFC-0001-Record-Rendering.md) | Record Rendering | Ingestion, header parsing, the Markdown pipeline. **§11: epistemic weights MUST display.** **§12: edges render as navigation, dead links visibly dead.** §8: the South Pole marker, which is why −90 could not be borrowed as a meta lane. |
| [TTCP-RFC-0002](TTCP-RFC-0002-Globe-and-Navigation.md) | Globe and Navigation | §2 the projection, §3 node states and the eyeball, §5 drag/zoom/tap, §6 cursor selection and rotation animation, §12 the graticule. The app implements these. |
| [TTCP-RFC-0003](TTCP-RFC-0003-Link-System-and-Addressability.md) | Link System and Addressability | Toot URIs, URL sync, search. **Not implemented** — listed so the gap is deliberate rather than forgotten. |

## Referenced but not copied

- **TTDB-RFC-0010** *(Stigmergic Fields, Lane Discipline and Record Identity)* — §3 registers
  the corpus lane allocation by latitude. This store cannot use it, which is the finding at
  `@LAT0.1LON0.1`. Upstream.
- **TTN-RFC-0004** *(Semantic Compression)* — the `src:` convention by which each record in
  the store names [RESEARCH.md](../RESEARCH.md) as its deterministic expansion. Upstream.

## What this project adds

Two fenced block types, both unknown to the corpus and therefore silently skipped by a
conformant viewer (TTCP-RFC-0001 §3), and one header extension:

| Extension | Where | What it carries |
|---|---|---|
| ` ```ttdb-render ` | each rendering record | The layer's kind, status, colours, band edges, sensitivities, data series and, on the record that owns the shared temperature series, the scenario branches its future half can take. This is what makes the store the model rather than a description of one. |
| ` ```ttdb-timeline ` | the home record | Slider bounds, default year, which scenario starts selected, and the observed / projected / extended confidence tiers. |
| `lane:` | record header | `meta` / `render` / `belief` / `fixture` / `special`. Replaces latitude lanes, which a geographic globe cannot spare. |

None of these are proposed as RFC amendments. They are local conventions in a store whose
umwelt happens to be the Earth, and the extension rules already cover them.
