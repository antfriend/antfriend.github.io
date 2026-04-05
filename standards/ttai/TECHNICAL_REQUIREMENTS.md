# TTAI Technical Requirements
### Version 0.1 — Status: Draft

This document defines the technical dependencies required to implement a conformant TTAI instance. TTAI is an mmpdb librarian that binds to an active TTDB umwelt and is invoked explicitly via the `@AI` prefix (or a configured `invocation_prefix`). It does not speak autonomously.

Sources: TTDB-RFC-0001–0004, TTN-RFC-0001–0006, `TTAI_SPEC.md`, `BEHAVIOR_SPEC.md`, `TTE_Agent_Umwelt_v1.yaml`.

---

## 1. TTDB Parser and Serializer

TTAI operates entirely on TTDB files. A conformant parser is a hard dependency.

### 1.1 Container formats
- **Markdown** — primary container. Must parse fenced code blocks by language tag (`mmpdb`, `cursor`), record sections delimited by `---`, and record header lines.
- **LaTeX** — alternative container. Same logical sections expressed as LaTeX environments or comment blocks. Exact syntax is implementation-defined but must be deterministic.

### 1.2 Block parsers
- **YAML parser** — required for the `mmpdb` and `cursor` fenced blocks.
- **Record header parser** — must extract the four fields from `@LATxLONy | created:<int> | updated:<int> | relates:<edge_list>`.
- **Record body parser** — Markdown (or LaTeX) content following the header line, rendered for display or passed as context to the AI model.

### 1.3 Serializer constraints (TTDB-RFC-0001 §5)
- Must preserve unknown keys and content on write-back.
- Must use stable, deterministic ordering when re-serializing.
- Must not silently drop or modify records outside the scope of an edit.

---

## 2. Record ID System

### 2.1 Coordinate assignment (TTDB-RFC-0004 §2)
- IDs use the form `@LATxLONy` where LAT and LON are integers derived from `coord_increment` step sizes.
- Assignment must be deterministic given the same inputs.
- When location is available, coordinates are derived from location.
- When location is unavailable, coordinates may be derived from a stable hash.

### 2.2 Globe projection
- Coordinates are positions on the librarian's knowledge map (`umwelt.globe`), not necessarily physical geolocation.
- Any external coordinate must be projected through `umwelt.globe.mapping` before assignment.

### 2.3 Collision resolution
- Default policy: `southeast_step` — increment both lat and lon by the configured step and retry until unique.
- Collision policy is read from `mmpdb.collision_policy`.

### 2.4 ID immutability
- Once assigned, a record ID must not change.
- Material umwelt changes require a new record linked to the old one via a typed edge (e.g., `revises@<old_id>`).

---

## 3. Typed Edge Engine

### 3.1 Parser
- Default syntax: `<type>@<TARGET_ID>` (declared in `mmpdb.typed_edges.syntax`).
- Must parse the comma-separated `relates:` field in each record header.
- Must support multiple edges of the same type; duplicates should be deduplicated on render.

### 3.2 Directionality
- All edges are directional from the record to the target.
- Reverse edges must not be inferred unless explicitly present.

### 3.3 Graph traversal
- Required for discovery (expanding the known record set from a starting node), cursor navigation, and rendering.
- Cross-umwelt references use qualified targets: `db:<db_id>` or `umwelt:<umwelt_id>`.

### 3.4 Umwelt binding
- All edges express the librarian's subjective assertions within its umwelt.
- Implementations must not treat edges as globally authoritative.

### 3.5 Recommended edge taxonomy
Implementations should align with the TTN edge taxonomy (TTN-RFC-0002) where applicable:
- Knowledge graph: `supports`, `contradicts`, `refines`, `duplicates`, `derived_from`
- Moderation/trust: `trusted_by`, `muted_by`, `blocked_by`, `flagged_as_spam`
- AI semantics: `asks_ai`, `ai_summarizes`, `ai_flags`, `ai_responds_to`, `ai_refuses`, `ai_confidence_low`

---

## 4. Cursor State Machine

The cursor block is the primary interface between TTAI and the TTDB file. It must be read and written on every interaction.

### 4.1 Fields managed by TTAI
| Field | Type | Requirement |
|---|---|---|
| `selected` | ordered list of record IDs | first element is the primary selection |
| `preview` | map of ID → truncated text | must include all selected records; truncated to `cursor_policy.max_preview_chars` |
| `agent_note` | string | optional; librarian's working note |
| `dot` | Graphviz dot fragment | should include selected nodes when possible |
| `last_query` | string | the most recent primitive query |
| `last_answer` | string | the librarian's answer to `last_query` |
| `answer_records` | list of record IDs | records cited in the answer |

### 4.2 Ambiguity resolution (TTDB-RFC-0002 §2)
When a requested selection matches more than one record, TTAI must either:
- Ask the user for clarification, or
- Select the most recently updated matching record and note the assumption in `agent_note`.

---

## 5. Primitive Query Interface

Required for constrained-device deployments (ESP32, Meshtastic).

### 5.1 Query format
- Queries must be short, tokenized strings — not free-form natural language.
- The primitive verb set must be declared in `mmpdb.librarian.primitive_queries`.
- Minimum required verbs: `select`, `find`, `edges`, `last`, `status`, `note`.

### 5.2 Response constraints
- Reply length must not exceed `mmpdb.librarian.max_reply_chars`.
- Responses should update `last_query`, `last_answer`, and `answer_records` in the cursor block.
- Primitive queries may map directly to cursor selection changes and preview refresh.

---

## 6. Invocation Gate

TTAI must not speak autonomously. All output is triggered by explicit invocation.

### 6.1 Invocation detection
- TTAI only activates when the configured `mmpdb.librarian.invocation_prefix` is matched (default: `@AI`).
- Any message without the prefix must be ignored.

### 6.2 Provenance (TTN-RFC-0001 §5)
- All assertions produced by TTAI must include provenance (source record ID, query, timestamp).
- Assertions without provenance are non-conformant.

### 6.3 Idle-time behavior (BEHAVIOR_SPEC.md)
When idle for a configured period, TTAI may enter default network mode:
- Maintain narrative continuity and associative linking.
- Prefer annotations or drafts; avoid disruptive edits.
- No autonomous mesh speech even in idle mode.

---

## 7. Graphviz Dot Generation

Required for the `cursor.dot` field.

- Must emit a valid Graphviz `dot` fragment.
- Fragment should include the selected node(s) and their immediate neighbors.
- Fragment is a render hint only; it is non-authoritative with respect to the canonical edge list.

---

## 8. Umwelt Context Loader

TTAI's worldview is defined by the `mmpdb.umwelt` block. The implementation must load and apply it at startup.

### 8.1 Required fields from the umwelt block
- `umwelt_id`, `role`, `perspective`, `scope`, `constraints`
- `globe.frame`, `globe.origin`, `globe.mapping`

### 8.2 Reference umwelt
The default TTE agent umwelt is defined in `standards/umwelt/TTE_Agent_Umwelt_v1.yaml`. Key constraints from that config:
- Only model what can be sensed, stored, related, or acted on in the repo.
- Prefer reversible actions and inspectable state.
- Explicit uncertainty; no hiding of ambiguity.
- Curiosity over polish; rough edges are acceptable.

---

## 9. Cryptographic Identity (TTN-AI compliance level)

Required only when the TTAI instance participates in a TTN mesh.

- **Node ID** — stable, cryptographic (e.g., Ed25519 keypair).
- **Signature generation** — sign outbound assertions for provenance.
- **Signature verification** — verify inbound assertions from other nodes.

---

## 10. TTN Transport Adapter (mesh deployment)

Required for TTN-AI compliance. Not required for standalone local use.

| Capability | Required for |
|---|---|
| Presence event emission | TTN-Base |
| Join broadcast and welcome messages | TTN-AI (per TTAI_SPEC.md) |
| MQTT gateway | Windows node |
| Store-and-forward buffer | ESP32 node |
| `@AI` invocation forwarding | Meshtastic node |
| LoRa packet framing (TTN-RFC-0006) | Non-Meshtastic LoRa hardware |

LoRa frame structure (TTN-RFC-0006): `SOF(0xA5) VER(0x01) FLAGS SRC_ID DST_ID TYPE SEQ LEN PAYLOAD CRC16 EOF(0x5A)`. CRC-16/CCITT-FALSE over VER through end of PAYLOAD. Broadcast DST: `0xFFFF`. ACK retry: up to 2× with exponential backoff (1 s, 3 s).

---

## 11. AI Inference Backend

TTAI defines the interface contract, not the model. Any backend that can accept the umwelt context and cursor state as a prompt and return a conformant reply is valid.

Requirements on the backend:
- Must accept the umwelt YAML as a system-level context binding.
- Must respect `max_reply_chars` in its output budget.
- Must not generate output outside of an explicit invocation.
- For primitive mode: must operate within the reduced verb set and short message constraints suitable for ESP32/Arduino-class systems.

---

## Summary — Required vs. Optional

| Component | Standalone local | TTN mesh |
|---|---|---|
| TTDB parser / serializer | Required | Required |
| Record ID system | Required | Required |
| Typed edge engine | Required | Required |
| Cursor state machine | Required | Required |
| Primitive query interface | Optional | Required (ESP32/Meshtastic) |
| Invocation gate | Required | Required |
| Graphviz dot generation | Required | Required |
| Umwelt context loader | Required | Required |
| Cryptographic identity | Not required | Required (TTN-AI) |
| TTN transport adapter | Not required | Required |
| AI inference backend | Required | Required |
