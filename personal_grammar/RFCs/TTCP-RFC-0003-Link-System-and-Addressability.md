# TTCP-RFC-0003: Link System and Addressability
### TTDB Content Publishing — Toot URI Scheme, URL Synchronization, and Search

**Version:** 1.0
**Status:** Draft
**RFC Number:** 0003
**Project:** toot-toot-engineering
**Component:** TTDB Content Publishing (TTCP)
**Depends on:** TTCP-RFC-0001 (Record Rendering), TTCP-RFC-0002 (Globe and Navigation)
**Author:** antfriend
**Created:** 2026-04-28

---

## 1. Abstract

This RFC defines how TTDB records are addressed and navigated as hyperlinks. It specifies the `toot:` URI scheme, the four supported link target formats, cross-database navigation, browser URL synchronization, and full-text search over discovered records. Together these mechanisms make every TTDB record a first-class addressable document reachable from any hyperlink context.

---

## 2. Toot URI Scheme

### 2.1 Scheme Definition

The `toot:` URI scheme identifies a specific record within a specific TTDB database. It is the canonical interoperable form for sharing record links across documents, emails, and external systems.

**Syntax:**

```
toot://<db_alias>/<record_token>
toot:<record_token>
```

- `<db_alias>` — the database file path or a recognized alias (basename without extension, path stem). When omitted, the active database is assumed.
- `<record_token>` — the lowercase, hyphen-normalized coordinate token (see §2.2).

**Examples:**

```
toot://TootTootTerminologyDB/lat1.1lon1.2
toot://feelings_ttdb/lat-34.6lon-58.4
toot:lat40.7lon-74.0
```

### 2.2 Record Token Format

The record token is derived from the coordinate ID by lowercasing all characters:

| Coordinate ID | Token |
|---|---|
| `@LAT45.5LON-120.3` | `lat45.5lon-120.3` |
| `@LAT-34.6LON-58.4` | `lat-34.6lon-58.4` |
| `@LAT0.0LON0.0` | `lat0.0lon0.0` |

Tokens are case-insensitive on input; renderers MUST normalize to lowercase on parse.

### 2.3 DB Alias Resolution

A DB alias resolves to a concrete file path via the following priority:

1. Exact match against the candidate database list (full path)
2. Basename match (filename without extension)
3. Case-insensitive prefix match

If no match is found, the link MUST be treated as unresolvable and rendered as a non-interactive grayed-out element. A renderer MUST NOT navigate to an unrecognized path.

---

## 3. Supported Link Target Formats

TTDB link targets appear in Markdown link syntax: `[text](target)`. Renderers MUST support the following four target forms:

### 3.1 Toot URI (preferred)

```
toot://db_alias/lat45lon-120
toot:lat45lon-120
```

Parsed per §2. This is the preferred interoperable form and the one renderers SHOULD generate when constructing links.

### 3.2 Legacy Format

```
@LAT45LON-120
@LAT45LON-120 db_alias
```

The `@` prefix followed by the long-form coordinate ID, with an optional space-separated DB alias. Supported for backward compatibility. Renderers MUST accept this form.

### 3.3 Path Format

```
/lat45lon-120?ttdb=db_alias
```

A URL-path form with the record token as the path segment and `ttdb` as a query parameter. This form is used in standard HTML `<a>` elements when the renderer shares an origin with the TTDB viewer.

### 3.4 Viewer URL Form

```
https://origin/?toot=lat45lon-120&ttdb=db_alias
```

A fully-qualified URL including the viewer origin and query parameters. Renderers MUST accept `toot` and `record` as synonymous query parameter names, and `ttdb` and `db` as synonymous database parameter names.

---

## 4. URL Synchronization

### 4.1 On Record Selection

Whenever the active record changes, the renderer MUST update the browser URL using `history.replaceState` (no new history entry). The URL MUST encode both the active database and the selected record:

```
?ttdb=<db_path>&toot=<record_token>
```

If the active database is the default (first candidate), the `ttdb` parameter MAY be omitted.

### 4.2 On Initial Load

On page load, the renderer MUST read `ttdb` (or `db`) and `toot` (or `record`) query parameters. If present, they MUST override the cursor block's `selected` field and load the specified database and record. If the parameters reference an unresolvable target, the renderer MUST fall back to the cursor-specified or first-record default.

---

## 5. Link Resolution and Navigation

### 5.1 Link Resolution

Before rendering a link as interactive, the renderer MUST verify the target is resolvable:

- **Same-DB link:** The target record ID MUST exist in `state.records`.
- **Cross-DB link:** The DB alias MUST resolve to a supported database path per §2.3.

Unresolvable links MUST be rendered as non-interactive (e.g., grayed out, `cursor: not-allowed`). They MUST NOT be rendered as standard `<a>` elements with `href`.

### 5.2 Navigation Behavior

When an interactive link is activated:

- **Same-DB link:** Call `selectRecord(recordId)` per TTCP-RFC-0002 §6.2.
- **Cross-DB link:** Initiate a database switch per TTCP-RFC-0002 §11.3, then select the preferred record on load.

Activation MUST be triggered by a single click or tap. Renderers MUST NOT require double-click for link navigation.

---

## 6. Search

### 6.1 Search Index

On each database load, the renderer MUST build a per-record search index. Each index entry MUST contain the concatenated, lowercased text of the record's title, header line, and body content. The index MUST include only records that have been discovered (TTCP-RFC-0002 §7).

### 6.2 Filtering

When a search term is present, the renderer MUST filter the displayed record list to entries whose index text contains the term as a case-insensitive substring. Filtering MUST be applied with a debounce of no more than 150ms after the last keystroke.

If the currently selected record is excluded by the filter, the renderer MUST auto-select the first matching record.

### 6.3 Search Metadata Display

The renderer MUST display the current search state as a human-readable summary, e.g.:

```
X matches within Y discovered of Z total
```

When no search term is active, the renderer MUST display the count of discovered and total records.

### 6.4 Tour Suppression

The guided tour (TTCP-RFC-0002 §8) MUST pause while a search input is focused and MUST resume when the input is blurred or cleared.

---

## 7. Cross-Document Toot Links in Published Markdown

When TTDB content is published as static Markdown (e.g., in documentation or other TTDB files), `toot:` URIs MUST be preserved verbatim. A renderer consuming that Markdown MUST resolve them as specified in §2. Non-TTCP renderers (e.g., GitHub Markdown) MUST treat them as opaque URIs; this is acceptable behavior.

---

## 8. Relationship to Existing RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0002 | Cursor block `selected` field is overridden by URL params on load |
| TTCP-RFC-0001 | Record rendering is triggered on navigation |
| TTCP-RFC-0002 | `selectRecord()` and DB switch are invoked on link activation |

---

## 9. Open Questions

1. **`toot:` scheme registration:** Should `toot:` be registered with IANA as a custom URI scheme? What would the protocol handler look like on desktop OS platforms?
2. **History entries:** Should cross-DB navigations push a new history entry (enabling the Back button) while same-DB record selections use `replaceState`?
3. **Search across databases:** Should the search system be capable of querying undiscovered records in other candidate databases, or remain strictly scoped to discovered records in the active database?
4. **Link validation at write time:** Should a TTDB authoring tool validate that all `relates:` edge targets and `toot:` links resolve before saving?

---

## 10. Changelog

| Date | Change |
|---|---|
| 2026-04-28 | Initial draft |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0*
