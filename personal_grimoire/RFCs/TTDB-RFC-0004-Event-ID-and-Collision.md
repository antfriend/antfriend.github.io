# TTDB-RFC-0004: Event ID Assignment and Collision Handling

**Version:** 1.1
**Status:** Stable
**RFC Number:** 0004
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0003 (Typed Edges)
**Author:** antfriend
**Created:** 2026-03-30

This RFC defines record ID assignment and collision resolution for TTDB.

---

## 1. ID Format
Record IDs use the form:

```
@LATxLONy
```

Where `LAT` and `LON` are integer coordinates based on the configured
`coord_increment` step sizes.

---

## 2. Deterministic Assignment
- The assignment function MUST be deterministic given the same inputs.
- When location is available, coordinates SHOULD be derived from location.
- When location is unavailable, coordinates MAY be derived from a stable hash.

**Scope of the guarantee.** "The same inputs" include the set of IDs already present in
the file, because §3's collision policy consults it. Two files with different histories
can therefore assign different IDs to the same record, and two devices that never
exchange records are **not** guaranteed to agree on an address. Only the *candidate*
ID (before collision resolution) is a pure function of the record. Record identity
across reclamation and across nodes is defined by TTDB-RFC-0010 §4, which keeps the
coordinate as the address and scopes identity to `(node_id, lane, sid)`; no RFC in this
corpus currently promises that two devices give one observation the same identity.

---

## 2.1 Globe as Knowledge Map
- Record IDs are positions on the TTDB "globe," which represents the librarian's
  knowledge map as defined by `mmpdb.umwelt.globe`.
- Implementations MUST treat lat/lon as coordinates in this subjective map,
  not necessarily a physical geolocation.
- If an external coordinate is used, it MUST be projected through the
  `umwelt.globe.mapping` function or note before assignment.

---

## 3. Collision Policy
The configured `collision_policy` defines resolution behavior.
The `southeast_step` policy means:
- If the candidate ID already exists, increment both lat and lon by the
  configured step and retry until unique.

This definition is **normative** for every RFC that names `southeast_step`.

⚠ **The name is historical and misdescribes the direction.** Incrementing both lat
and lon moves the ID to higher latitude and higher longitude, which on a map drawn
with latitude increasing northward (TTCP-RFC-0002, and `feelings_ttdb.md`, where
north is positive valence) is a step to the **north-east**: `@LAT40LON0` resolves to
`@LAT41LON1`. The token is kept unchanged because it appears in the `mmpdb` block of
existing files; implementations MUST follow the rule above and MUST NOT infer a
direction from the name.

---

## 4. Preservation
- Once assigned, an ID MUST NOT change for the same record.
- If the umwelt changes materially, implementations SHOULD create a new record
  and link to the previous one using a typed edge (e.g., `revises@<old_id>`),
  rather than mutating the original ID.

---

## 5. Changelog
- **1.1** (2026-11-23) — §2: stated that determinism holds only given the same
  existing IDs, so addresses are not guaranteed to agree across devices; pointed
  identity to TTDB-RFC-0010 §4. §3: declared the `southeast_step` definition
  normative corpus-wide (TTG-RFC-0002 §6 previously defined it differently) and
  noted that it steps north-east. No change to assignment behaviour.
- **1.0** — Initial.

End TTDB-RFC-0004
