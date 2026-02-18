# TTDB-RFC-0004
## Event ID Assignment and Collision Handling
### Version 0.2

Status: Draft

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

---

## 4. Preservation
- Once assigned, an ID MUST NOT change for the same record.
- If the umwelt changes materially, implementations SHOULD create a new record
  and link to the previous one using a typed edge (e.g., `revises@<old_id>`),
  rather than mutating the original ID.

End TTDB-RFC-0004
