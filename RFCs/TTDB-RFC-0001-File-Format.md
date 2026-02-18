# TTDB-RFC-0001
## My Mental Palace DB File Format and Sections
### Version 0.2

Status: Draft

This RFC defines the canonical on-disk format for MyMentalPalaceDB files.

---

## 1. File Structure and Container
A valid TTDB file MAY use either Markdown or LaTeX as the container format.

When using Markdown, a valid TTDB file MUST contain, in order:
1) A title line beginning with `#`.
2) A fenced `mmpdb` block with database properties.
3) A fenced `cursor` block with selection state.
4) One or more record sections separated by `---`.

When using LaTeX, a valid TTDB file MUST contain the same logical sections
as above, expressed as LaTeX environments or comment blocks. The environment
names and exact syntax are implementation-defined, but MUST be deterministic.

Unknown sections MAY appear and MUST be ignored by strict parsers.

---

## 2. `mmpdb` Block Schema
The `mmpdb` fenced block MUST be valid YAML with these keys:
- `db_id` (string, required)
- `db_name` (string, required)
- `coord_increment` (object, required)
  - `lat` (integer, required)
  - `lon` (integer, required)
- `collision_policy` (string, required)
- `timestamp_kind` (string, required)
- `umwelt` (object, required)
  - `umwelt_id` (string, required)
  - `role` (string, required)
  - `perspective` (string, required)
  - `scope` (string, required)
  - `constraints` (list of strings, optional)
  - `globe` (object, required)
    - `frame` (string, required)
    - `origin` (string, required)
    - `mapping` (string, required)
    - `note` (string, optional)
- `cursor_policy` (object, required)
  - `max_preview_chars` (integer, required)
  - `max_nodes` (integer, required)
- `typed_edges` (object, required)
  - `enabled` (boolean, required)
  - `syntax` (string, required)
  - `note` (string, optional)
- `librarian` (object, optional)
  - `enabled` (boolean, required if present)
  - `primitive_queries` (list of strings, required if present)
  - `max_reply_chars` (integer, optional)
  - `invocation_prefix` (string, optional)

Parsers MUST treat unknown keys as extensions.

---

## 3. Record Section Format
Each record section MUST begin with a header line:

```
@LATxLONy | created:<int> | updated:<int> | relates:<edge_list>
```

Rules:
- `@LATxLONy` is a stable record ID.
- `created` and `updated` are integers in the `timestamp_kind` domain.
- `relates` is a comma-separated list of typed edges using the configured syntax.
- Records MAY include any markdown content after the header line.
- Records MAY include one or more embedded TTDB node graphs. These graphs are
  rendering hints and do not alter the canonical edge list in the header.

---

## 4. Umwelt and Globe Semantics
- Each TTDB instance represents a single umwelt: a subjective worldview of an
  AI librarian.
- All semantic edges in the file are interpreted within this umwelt; there is
  no implied global or objective frame beyond what the umwelt asserts.
- The TTDB "globe" uses `@LATxLONy` coordinates as a knowledge map. The lat/lon
  positions MUST encode what the umwelt knows (or believes) about nodes on the
  TTN and the wider world.
- The `umwelt.globe` mapping describes how external observations are projected
  into this knowledge map. Implementations SHOULD document any projection or
  quantization in `umwelt.globe.mapping`.

---

## 5. Compatibility
- Implementations MUST preserve unknown content when updating the file.
- Implementations SHOULD use stable ordering when re-serializing.

End TTDB-RFC-0001
