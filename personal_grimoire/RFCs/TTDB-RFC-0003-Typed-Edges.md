# TTDB-RFC-0003: Typed Edge Semantics

**Version:** 1.1
**Status:** Stable
**RFC Number:** 0003
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0002 (Cursor Semantics)
**Author:** antfriend
**Created:** 2026-03-25

This RFC defines typed edge syntax and behavior in TTDB records.

---

## 1. Syntax
Typed edges MUST use the syntax declared in `mmpdb.typed_edges.syntax`.
The default syntax is:

```
<type>@<TARGET_ID>
```

---

## 2. Directionality
- All edges are directional from the record to the target.
- Implementations MUST NOT infer reverse edges unless explicitly present.

---

## 3. Multiplicity
- A record MAY include multiple edges of the same type.
- Duplicate edges SHOULD be deduplicated during rendering.

---

## 4. Taxonomy
TTDB edge types are free-form tokens, but TTDB implementations SHOULD
align with the TTN typed edge taxonomy where applicable.

---

## 5. Embedded Node Graphs
Records MAY include embedded TTDB node graphs that visualize a subgraph
local to the record. These graphs are non-authoritative render hints and
MUST NOT change the canonical edge list declared in the record header.

---

## 6. Umwelt Binding
- Typed edges are interpreted within the `mmpdb.umwelt` of the file.
- An edge expresses the librarian's subjective assertion, not a global truth.
- When referencing other worldviews, implementations SHOULD use explicit
  targets (e.g., `db:<db_id>` or `umwelt:<umwelt_id>`) to avoid ambiguity.

---

## 7. Symmetric Types and `opposes`

### 7.1 Symmetry
A type MAY be declared **symmetric**, meaning `A type B` and `B type A` assert
the same thing. Symmetry is a property of the type, not of any record.

Section 2 still governs: implementations MUST NOT infer the reverse edge. An
author asserting a symmetric relation MUST therefore write it on **both**
records. This keeps every existing parser correct without modification — a
symmetric type is a convention about meaning, not an exception to traversal.

Readers MAY rely on a symmetric type being sign-consistent in both directions;
a file that declares one direction only is well-formed but incomplete, and
SHOULD be reported by validators rather than silently repaired.

### 7.2 `opposes`
`opposes` is symmetric and asserts **semantic polarity**: its two endpoints sit
at opposite ends of a single dimension.

It MUST NOT be conflated with `contradicts`:

| | `contradicts` | `opposes` |
|---|---|---|
| Kind | Epistemic | Semantic |
| Asserts | These two claims cannot both hold | These two concepts are antonyms |
| Truth of endpoints | At most one is true | Both may be true simultaneously |
| Example | A belief vs. the spec text it diverges from | *Serenity* vs. *Unease* |

*Joy* and *Grief* stand in `opposes`; asserting both exist is not a
contradiction, and a store containing both is not thereby inconsistent. A
consumer computing epistemic conflict MUST ignore `opposes`; a consumer
computing semantic structure MUST NOT read `contradicts` as polarity.

### 7.3 Rationale
Stores may encode polarity positionally — for example a coordinate mapping in
which latitude carries valence. Position is not available to a consumer reading
the edge list, which is what implementations in this corpus actually traverse.
Without a polarity type such a store cannot state its most basic relation, and
its opposed pairs appear unrelated.

---

## 8. Changelog
- **1.1** — Added §7: symmetric types, and the `opposes` type for semantic
  polarity. No change to §§1–6; all 1.0-conformant files remain valid.
- **1.0** — Initial.

End TTDB-RFC-0003
