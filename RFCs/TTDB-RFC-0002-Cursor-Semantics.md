# TTDB-RFC-0002
## Cursor Semantics and Selection Rules
### Version 0.2

Status: Draft

This RFC defines the `cursor` block schema and its deterministic update rules.

---

## 1. `cursor` Block Schema
The `cursor` fenced block MUST be valid YAML with these keys:
- `selected` (list of record IDs, required)
- `preview` (map of record ID to short text, required)
- `agent_note` (string, optional)
- `dot` (string, optional)
- `last_query` (string, optional)
- `last_answer` (string, optional)
- `answer_records` (list of record IDs, optional)

When the TTDB container is LaTeX, the same logical fields MUST be present
within a deterministic LaTeX environment or comment block.

---

## 2. Selection Rules
- `selected` is an ordered list. The first element is the primary selection.
- If a requested selection is ambiguous, the implementation MUST either:
  - ask for clarification, or
  - select the most recently updated matching record and note the assumption.

---

## 3. Preview Rules
- `preview` entries MUST be truncated to `cursor_policy.max_preview_chars`.
- `preview` MUST contain entries for all `selected` records.

---

## 4. Dot Graph
- If `dot` is present, it MUST be a valid Graphviz dot fragment.
- `dot` SHOULD include the `selected` node(s) when possible.

---

## 5. Primitive Query Support
- If the `mmpdb.librarian.enabled` flag is true, implementations SHOULD accept
  primitive queries suitable for constrained devices (e.g., ESP32).
- Primitive queries MUST be short, tokenized strings; implementations SHOULD
  avoid free-form natural language requirements.
- When a primitive query is answered, implementations SHOULD update
  `last_query`, `last_answer`, and `answer_records` to reflect the response.
- Implementations MAY map primitive query verbs to cursor selection changes
  (e.g., selecting the most relevant record and refreshing `preview`).

End TTDB-RFC-0002
