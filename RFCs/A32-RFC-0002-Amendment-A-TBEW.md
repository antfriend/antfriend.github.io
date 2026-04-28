# A32-RFC-0002 Amendment A: TBEW Parser Extension
### C++ Storage and Parsing Update for Toot-Bit Epistemic Weight Fields

**Version:** 1.0
**Status:** Stable
**Amends:** A32-RFC-0002 (TTDB Storage and Parsing on ESP32)
**Required by:** TTDB-RFC-0005 (Toot-Bit Epistemic Weight)
**Project:** toot-toot-engineering
**Component:** Agent 32 / TTDB (ESP32 + Arduino)
**Author:** antfriend
**Created:** 2026-04-23

---

## 1. Scope

This amendment extends A32-RFC-0002 with the minimum C++ changes required to support the optional `[ew]` (epistemic weight) block defined in TTDB-RFC-0005. It does not alter any existing parsing rules. All prior-conformant TTDB files remain valid without modification.

The **format specification** for the `[ew]` block — field definitions, semantics, parsing grammar, and validation rules — is defined in TTDB-RFC-0005 §3–4. This document covers the A32-specific implementation: data structures, parser state machine extension, field parse helpers, and the writer.

Sections of A32-RFC-0002 not mentioned here are unchanged.

---

## 2. Entry Structure on A32

A32 uses a simplified record header format relative to the full TTDB-RFC-0001 pipe-delimited form. The coordinate ID is followed by a short human-readable slug on the same line, with metadata carried in the `[ew]` block rather than in the header.

**Form A — No epistemic weight (backward compatible):**
```
@LAT48xLON-116  habitat-temperature
Ambient sensor reading: 12.4C. Last stable reading from node cluster B.
```

**Form B — With epistemic weight block:**
```
@LAT48xLON-116  habitat-temperature
[ew]
conf:180
rev:3
sal:12
touched:1745400000
[/ew]
Ambient sensor reading: 12.4C. Last stable reading from node cluster B.
```

Both forms are valid. The `[ew]` block is optional. When absent, parsers apply the defaults defined in TTDB-RFC-0005 §4.1.

---

## 3. Parser State Machine Extension

Insert the following states into the A32-RFC-0002 line-by-line parser, between the `COORD_READ` and `BODY` states:

```
States (additions only):
  EW_OPEN   — saw "[ew]" line immediately after coord ID line
  EW_FIELD  — inside [ew] block, reading field lines
  EW_CLOSE  — saw "[/ew]", transitioning to BODY

Transitions:
  COORD_READ  + line == "[ew]"     → EW_OPEN
  COORD_READ  + line != "[ew]"     → BODY  (existing behavior)
  EW_OPEN     + any line           → EW_FIELD (parse first field or skip)
  EW_FIELD    + line == "[/ew]"    → EW_CLOSE
  EW_FIELD    + matches key:value  → parse field, stay EW_FIELD
  EW_FIELD    + no match           → skip line, stay EW_FIELD
  EW_CLOSE    + any line           → BODY
```

A parser encountering `[ew]` on a line that is NOT immediately after a coordinate ID line MUST treat it as body text.

---

## 4. C++ Struct Extensions

Add the following to the TTDB layer. These extend (not replace) the structs defined in A32-RFC-0002.

### 4.1 TootBitEW Struct

```cpp
struct TootBitEW {
    uint8_t  conf    = 128;
    uint16_t rev     = 0;
    uint8_t  sal     = 0;
    uint32_t touched = 0;

    // Derived — not stored
    uint8_t eps() const {
        return (uint16_t)sal * (255 - conf) / 255;
    }
};

struct TootBit {
    String    coord_id;   // e.g. "@LAT48xLON-116"
    String    slug;
    String    body;
    TootBitEW ew;         // defaults applied if block absent
};
```

### 4.2 Field Parse Helper

```cpp
bool parseEWField(const String& line, TootBitEW& ew) {
    int colon = line.indexOf(':');
    if (colon < 1) return false;

    String key = line.substring(0, colon);
    long   val = line.substring(colon + 1).toInt();

    if (key == "conf")    { ew.conf    = (uint8_t)  constrain(val, 0, 255);          return true; }
    if (key == "rev")     { ew.rev     = (uint16_t) constrain(val, 0, 65535);        return true; }
    if (key == "sal")     { ew.sal     = (uint8_t)  constrain(val, 0, 255);          return true; }
    if (key == "touched") { ew.touched = (uint32_t) constrain(val, 0L, 4294967295L); return true; }

    return false;  // unknown key — caller silently ignores
}
```

---

## 5. Writer Extension

When serializing a `TootBit`, omit the `[ew]` block entirely when all fields are at default values. This keeps newly-created entries human-readable until the agent loop first touches them.

```cpp
void writeTootBit(Stream& out, const TootBit& tb) {
    out.println(tb.coord_id + "  " + tb.slug);

    bool hasEW = (tb.ew.conf != 128 || tb.ew.rev != 0 ||
                  tb.ew.sal  != 0   || tb.ew.touched != 0);

    if (hasEW) {
        out.println("[ew]");
        out.println("conf:"    + String(tb.ew.conf));
        out.println("rev:"     + String(tb.ew.rev));
        out.println("sal:"     + String(tb.ew.sal));
        out.println("touched:" + String(tb.ew.touched));
        out.println("[/ew]");
    }

    out.println(tb.body);
    out.println();  // entry separator (existing convention)
}
```

---

## 6. File-Level Considerations

### 6.1 Entry Identity

The `[ew]` block does not affect entry identity. Entries are still uniquely identified by their `@LATnxLONn` coordinate ID. Two entries with the same coordinate ID but different `[ew]` contents are a malformed file (duplicate ID — existing A32-RFC-0002 rule applies).

### 6.2 File Size Impact

Each `[ew]` block adds approximately 60–80 bytes per entry. On a 4MB SPIFFS partition with a typical database of 200 entries, total overhead is under 16KB, within established budget constraints.

### 6.3 Write Ordering

When updating only `[ew]` fields (no body change), implementations SHOULD perform an in-place line replacement rather than a full file rewrite where the filesystem supports it. Where in-place update is not available (e.g., basic SPIFFS), a full entry rewrite is acceptable.

Implementations MUST NOT increment `rev` when only `[ew]` fields change. `rev` tracks body content changes exclusively (see TTDB-RFC-0005 §3.2).

---

## 7. Validation

A file is malformed with respect to this amendment if any of the following are true. Parsers SHOULD log a warning and MAY skip the affected entry:

1. A `[ew]` open tag appears on a line that is not immediately after a coordinate ID line.
2. A `[/ew]` close tag appears without a preceding `[ew]` open tag in the same entry.
3. An `[ew]` block is not closed before the next coordinate ID line or end of file.
4. A field value is non-numeric (e.g. `conf:high`). Clamp or default; do not crash.

These are warnings, not fatal errors. A robust embedded parser must not halt on a malformed field in an otherwise valid file.

---

## 8. Example: Full TTDB File Fragment

```
@LAT43xLON-116  boise-elevation
[ew]
conf:210
rev:1
sal:44
touched:1745380000
[/ew]
Elevation: 874m. Stable geographic fact. High confidence.

@LAT43xLON-116  air-quality-index
[ew]
conf:60
rev:18
sal:91
touched:1745399800
[/ew]
AQI: 87 (Moderate). Wildfire smoke influence probable. Frequently revised
during fire season. High salience due to outdoor routing decisions.
EPS: 91*(255-60)/255 = 69.5 → high priority for next sensor check.

@LAT43xLON-116  nearest-meshtastic-peer
Peer node: PINE-7. Last heard: unknown. No EW block — entry created this
cycle, agent has not yet assessed reliability.
```

---

## 9. Changelog

| Date | Change |
|---|---|
| 2026-04-23 | Amendment A: Initial draft, adds [ew] block parsing and C++ implementation |

---

## 10. Relationship Summary

```
TTDB-RFC-0001 (File Format)
    └── TTDB-RFC-0005 (Toot-Bit Epistemic Weight) ← authoritative format spec
            └── A32-RFC-0002 (TTDB Storage and Parsing on ESP32)
                    └── Amendment A (this document) ← C++ implementation
                            └── Feeds A32-RFC-0003 (Agent Loop) EPS prioritization
```

---

*This amendment is part of the toot-toot-engineering open-source project.*
*License: CC0*
