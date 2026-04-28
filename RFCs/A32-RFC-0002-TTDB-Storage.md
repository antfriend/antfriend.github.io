# A32-RFC-0002

## TTDB Storage and Parsing on ESP32

### Version 1.0

Status: Stable

This RFC defines how TTDB files (per TTDB-RFC-0001) are stored, loaded, and
queried on ESP32 hardware within the Arduino framework.

---

## 1. Storage Backends

### 1.1 LittleFS (Default)

LittleFS is the default filesystem for TTDB storage on flash. SPIFFS is
deprecated in the Arduino ESP32 core and SHOULD NOT be used for new projects.

```cpp
#include <LittleFS.h>

bool ttdb_mount() {
    if (!LittleFS.begin(true)) {  // true = format on first use
        Serial.println("LittleFS mount failed");
        return false;
    }
    return true;
}
```

TTDB files SHOULD be placed in the LittleFS data partition. For PlatformIO
projects, the file goes in `data/` and is uploaded with:

```
pio run --target uploadfs
```

### 1.2 SD Card (Large Files)

For TTDB files exceeding 512 KB, use an SD card via SPI:

```cpp
#include <SD.h>
#include <SPI.h>

#define SD_CS_PIN 5  // Chip select — adjust per board

bool ttdb_mount_sd() {
    if (!SD.begin(SD_CS_PIN)) {
        Serial.println("SD mount failed");
        return false;
    }
    return true;
}
```

### 1.3 File Naming

The TTDB file MUST be named with a `.md` extension when using Markdown
format, or `.tex` when using LaTeX format.

The default path is `/ttdb.md` (LittleFS) or `/ttdb.md` (SD root).
Implementations MAY support a config file or compile-time constant to
override the path.

---

## 2. Parsing Strategy

ESP32 devices cannot load an entire TTDB file into RAM. The parser uses a
streaming, line-by-line approach.

### 2.1 Two-Pass Architecture

**Pass 1 — Index Build (boot time):**

Scan the file and build an in-memory index of:
- The `mmpdb` block byte offset and length.
- The `cursor` block byte offset and length.
- Each record header (`@LATxLONy`) with its byte offset.

This index is a flat array of structs stored in PSRAM if available:

```cpp
struct TTDBRecordIndex {
    int16_t lat;
    int16_t lon;
    uint32_t file_offset;   // byte offset of the record header line
    uint32_t created;
    uint32_t updated;
};
```

**Pass 2 — On-Demand Read (runtime):**

When the agent loop needs a record's content or edges, seek to the
`file_offset` and read until the next `---` delimiter or EOF.

### 2.2 Header Block Parsing

The `mmpdb` YAML block is small (typically under 1 KB). It MAY be loaded
entirely into a buffer and parsed with a lightweight YAML subset parser.

Full YAML parsing is NOT required. The implementation MUST support:
- String values (quoted or unquoted).
- Integer values.
- Boolean values (`true`/`false`).
- Nested objects (one level of indentation).
- Lists of strings (using `- item` syntax).

Implementations SHOULD use a purpose-built minimal parser rather than a
full YAML library to conserve flash and RAM.

### 2.3 Record Header Parsing

Record headers follow the format defined in TTDB-RFC-0001 Section 3. The
`@LATxLONy` ID format and coordinate semantics (including globe-as-knowledge-map
projection) are defined in TTDB-RFC-0004 §1–2.1:

```
@LAT12LON34 | created:1719000000 | updated:1719100000 | relates:edge1,edge2
```

The parser MUST extract:
- Coordinates (lat, lon) as integers.
- Timestamps as unsigned 32-bit integers.
- The edge list as a comma-separated string (further parsing deferred).

```cpp
struct TTDBRecordHeader {
    int16_t lat;
    int16_t lon;
    uint32_t created;
    uint32_t updated;
    char relates[256];  // raw edge string, parsed on demand
};

bool ttdb_parse_record_header(const char* line, TTDBRecordHeader* out);
```

---

## 3. Cursor State

The cursor (per TTDB-RFC-0002) tracks the agent's current
position in the knowledge graph. On ESP32, the cursor state is held in RAM:

```cpp
struct TTDBCursor {
    int16_t lat;
    int16_t lon;
    uint8_t preview_buf[256];  // bounded by max_preview_chars
    uint16_t node_count;       // bounded by max_nodes
};
```

The cursor state from the TTDB file is the initial position at boot.
Runtime cursor movement does NOT write back to the TTDB file unless
explicitly requested (e.g., on graceful shutdown).

---

## 4. Librarian Queries

When `librarian.enabled` is `true` in the `mmpdb` block, the device
supports primitive queries against the TTDB. The set of supported queries
is defined by `librarian.primitive_queries`.

Each primitive query is a string key. The implementation maps these to
functions:

```cpp
typedef String (*TTDBQueryFn)(const char* arg);

struct TTDBQueryEntry {
    const char* name;
    TTDBQueryFn handler;
};

// Example primitive queries
String query_nearest(const char* arg);    // find nearest node to coords
String query_edges_from(const char* arg); // list edges from a node
String query_content(const char* arg);    // return record body text

TTDBQueryEntry librarian_queries[] = {
    {"nearest",    query_nearest},
    {"edges_from", query_edges_from},
    {"content",    query_content},
    {nullptr,      nullptr}
};
```

Query responses are bounded by `librarian.max_reply_chars`.

---

## 5. Edge Parsing

Typed edges use the syntax and directionality rules defined in TTDB-RFC-0003.
The syntax token is declared in `mmpdb.typed_edges.syntax`. The parser MUST
support the configured syntax for splitting edge strings into structured data:

```cpp
struct TTDBEdge {
    char type[32];       // edge type label
    int16_t target_lat;
    int16_t target_lon;
    char qualifier[64];  // optional qualifier
};

uint8_t ttdb_parse_edges(const char* relates_str, TTDBEdge* out, uint8_t max_edges);
```

Implementations SHOULD cache parsed edges for the current cursor node to
avoid repeated string parsing.

---

## 6. Memory Budget

Target memory usage for the TTDB layer on ESP32-S3 with PSRAM:

| Component           | RAM Budget  | Notes                          |
|---------------------|-------------|--------------------------------|
| Record index        | 12 bytes/record | Scales with TTDB size     |
| mmpdb header cache  | 1 KB        | Parsed once at boot            |
| Cursor state        | 512 bytes   | Fixed                          |
| Read buffer         | 1 KB        | For streaming record reads     |
| Edge parse cache    | 512 bytes   | Current node only              |
| **Total overhead**  | **~3 KB + index** | Index in PSRAM if available |

A TTDB with 1,000 records requires approximately 12 KB for the index.
With PSRAM, this scales to tens of thousands of records.

Without PSRAM (e.g., ESP32-WROOM), the index SHOULD be limited to
`max_nodes` from the cursor policy, and records outside the active
neighborhood are accessed via sequential scan.

---

## 7. Arduino Library Interface

The TTDB layer SHOULD be packaged as an Arduino library named `TTDB`:

```
libraries/
  TTDB/
    src/
      TTDB.h
      TTDB.cpp
      TTDBParser.h
      TTDBParser.cpp
      TTDBCursor.h
      TTDBCursor.cpp
      TTDBLibrarian.h
      TTDBLibrarian.cpp
    examples/
      BasicLoad/
        BasicLoad.ino
```

Minimal usage:

```cpp
#include <TTDB.h>

TTDB db;

void setup() {
    Serial.begin(115200);
    LittleFS.begin(true);

    if (!db.begin("/ttdb.md")) {
        Serial.println("TTDB load failed");
        return;
    }

    Serial.printf("Loaded: %s (%d records)\n",
                  db.name(), db.recordCount());
    Serial.printf("Umwelt: %s\n", db.umweltRole());
}

void loop() {
    TTDBRecord rec;
    if (db.cursorRead(&rec)) {
        Serial.printf("At @LAT%dLON%d: %s\n",
                      rec.lat, rec.lon, rec.preview);
    }
    delay(1000);
}
```

---

End A32-RFC-0002
