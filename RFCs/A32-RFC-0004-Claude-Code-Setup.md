# A32-RFC-0004

## Claude Code Project Setup for Agent 32

### Version 1.0

Status: Stable

This RFC defines how to structure an Agent 32 project for development with
Claude Code, including the CLAUDE.md file, project layout, PlatformIO
configuration, and integration with the Toot Toot Engineering workflow.

---

## 1. Purpose

Claude Code reads CLAUDE.md (or AGENTS.md) at the start of every session.
For Agent 32 projects this file must onboard the agent into the constraints
of embedded development, the TTDB file format, and the sense-reason-act
architecture. This RFC provides a reference CLAUDE.md and the surrounding
project scaffolding.

---

## 2. Project Directory Layout

```
my-agent32-project/
├── CLAUDE.md                  # Claude Code onboarding (see Section 3)
├── AGENTS.md                  # TTE agent guidance (from toot-toot-engineering)
├── WORKFLOW.md                # TTE workflow
├── PLAN.md                    # TTE plan
├── CHECKLIST.md               # TTE checklist
├── LOG.md                     # TTE log
├── RELEASES.md                # TTE releases
├── TTE_PROMPT.md              # TTE prompt (project-specific goals)
├── WHAT.md                    # TTE what-is-this
├── platformio.ini             # PlatformIO build config
├── data/
│   └── ttdb.md                # The TTDB file (uploaded to LittleFS)
├── src/
│   └── main.cpp               # Arduino sketch entry point
├── lib/
│   ├── TTDB/                  # TTDB parser library (A32-RFC-0002)
│   │   ├── TTDB.h
│   │   ├── TTDB.cpp
│   │   ├── TTDBParser.h
│   │   ├── TTDBParser.cpp
│   │   ├── TTDBCursor.h
│   │   ├── TTDBCursor.cpp
│   │   ├── TTDBLibrarian.h
│   │   └── TTDBLibrarian.cpp
│   └── Agent32/               # Agent loop library (A32-RFC-0003)
│       ├── Agent32.h
│       └── Agent32.cpp
├── RFCs/                      # Project-specific RFCs
│   └── ...
└── deliverables/              # TTE output directory
```

---

## 3. Reference CLAUDE.md

The following is a reference CLAUDE.md for Agent 32 projects. It is
intentionally concise per best practices — CLAUDE.md should contain only
universally applicable instructions.

```markdown
# CLAUDE.md — Agent 32 Project

## What This Is

This is an Agent 32 project: an autonomous ESP32 device that reasons using
a TTDB (MyMentalPalaceDB) file, not a cloud LLM. The TTDB file in `data/`
is the device's entire knowledge base.

## Architecture

Three layers, all in Arduino C++:
- **TTDB Layer** (`lib/TTDB/`): Parses and queries the `.md` TTDB file.
- **Agent Layer** (`lib/Agent32/`): Sense-reason-act loop.
- **Hardware Layer**: GPIO, I2C, SPI via Arduino abstractions.

The agent loop: read sensors → quantize to TTDB coordinates → find nearest
node → follow typed edges → execute actions. No inference. No cloud calls.

## Constraints

- Target: ESP32-S3 via PlatformIO + Arduino framework.
- RAM is limited. Never load the full TTDB into memory. Use streaming
  reads with a file-offset index (see A32-RFC-0002).
- Feed the watchdog in long loops: call `yield()` every ~100 iterations.
- Use LittleFS (not SPIFFS) for flash filesystem.
- Prefer `int16_t` for TTDB coordinates, `uint32_t` for timestamps.
- Keep string allocations small and bounded. Prefer `char[]` over `String`
  for anything that persists across cycles.

## TTDB File Format

See `RFCs/TTDB-RFC-0001-File-Format.md` and `data/ttdb.md`. Key points:
- Records start with `@LATxLONy | created:<int> | updated:<int> | relates:<edges>`.
- The `mmpdb` YAML block defines db metadata, umwelt, and cursor policy.
- Typed edges in `relates:` drive all reasoning.
- The file is Markdown. Do not convert it to binary.

## Build and Upload

```bash
pio run                    # compile
pio run --target upload    # flash firmware
pio run --target uploadfs  # upload data/ttdb.md to LittleFS
pio device monitor         # serial monitor
```

## Workflow

This project uses Toot Toot Engineering. Run WORKFLOW.md for the full
cycle. Deliverables go in `deliverables/`.
```

---

## 4. PlatformIO Configuration

Reference `platformio.ini` for ESP32-S3:

```ini
[env:esp32s3]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
monitor_speed = 115200
board_build.filesystem = littlefs
board_build.partitions = default_16MB.csv
lib_deps =
build_flags =
    -D A32_MAX_SENSORS=16
    -D A32_MAX_ACTUATORS=16
    -D A32_MAX_EDGES=32
    -D A32_AGENT_INTERVAL_MS=1000
```

For ESP32-WROOM (4 MB flash, no PSRAM):

```ini
[env:esp32wroom]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
board_build.filesystem = littlefs
board_build.partitions = default.csv
build_flags =
    -D A32_MAX_SENSORS=8
    -D A32_MAX_ACTUATORS=8
    -D A32_MAX_EDGES=16
    -D A32_AGENT_INTERVAL_MS=2000
    -D A32_NO_PSRAM
```

---

## 5. Claude Code Workflow Integration

### 5.1 Starting a Session

When beginning work on an Agent 32 project in Claude Code:

1. Claude reads CLAUDE.md automatically.
2. If the task involves TTDB changes, Claude SHOULD read `data/ttdb.md`
   to understand the current knowledge base.
3. If the task involves firmware changes, Claude SHOULD read the relevant
   files in `lib/TTDB/` or `lib/Agent32/`.

### 5.2 Common Tasks

**Adding a new sensor:**
1. Add the hardware read function in `src/main.cpp`.
2. Create an `A32Sensor` struct with coordinate mapping.
3. Register with `agent.registerSensor()`.
4. If the sensor maps to a new region of the TTDB, add corresponding
   records to `data/ttdb.md`.

**Adding a new behavior:**
1. Add records and typed edges to `data/ttdb.md`.
2. If a new edge type is needed, document it in the project RFCs.
3. If the edge type requires a new actuator, add it to `src/main.cpp`.

**Debugging the agent loop:**
1. Enable serial logging in the agent: `agent.setLogLevel(A32_LOG_DEBUG)`.
2. Monitor with `pio device monitor`.
3. The log shows each cycle's state snapshot, matched node, and selected
   actions.

### 5.3 TTE Cycle Integration

The TTE workflow drives development. The governing RFCs are TTE-RFC-0001
(workflow and roles), TTE-RFC-0002 (PLAN.md, LOG.md, and CHECKLIST.md
requirements), and TTE-RFC-0003 (Definition of Done and release packaging).

A typical cycle:

1. Edit `TTE_PROMPT.md` with the next goal (e.g., "Add temperature-based
   fan control using TTDB edges").
2. Run WORKFLOW.md. Claude Code executes the plan.
3. Firmware changes land in `src/` and `lib/`.
4. TTDB changes land in `data/ttdb.md`.
5. Deliverables (docs, test results) go to `deliverables/`.
6. Update LOG.md and CHECKLIST.md per TTE convention.

---

## 6. Testing Guidance

### 6.1 Desktop Simulation

The TTDB parser and agent loop logic can be tested on desktop (no ESP32
required) by compiling with a native platform in PlatformIO:

```ini
[env:native]
platform = native
build_flags =
    -D A32_NATIVE_TEST
    -D A32_MAX_SENSORS=16
```

Mock sensor/actuator functions return fixed values. The TTDB file is read
from the local filesystem. This enables rapid iteration in Claude Code
without hardware in the loop.

### 6.2 On-Device Testing

For hardware testing, use serial assertions:

```cpp
void test_ttdb_load() {
    assert(db.begin("/ttdb.md"));
    assert(db.recordCount() > 0);
    Serial.println("PASS: ttdb_load");
}
```

Run tests in `setup()` before entering the agent loop, gated by a
compile flag:

```cpp
#ifdef A32_RUN_TESTS
    test_ttdb_load();
    test_sensor_read();
    test_edge_parse();
    Serial.println("All tests passed");
    while (true) { delay(1000); }  // halt after tests
#endif
```

---

## 7. Versioning

Agent 32 projects version two artifacts independently:

- **Firmware version**: Semantic versioning in `platformio.ini` build flags.
- **TTDB version**: The `mmpdb.db_id` and file-level metadata in the TTDB
  header. TTDB versions follow TTE release conventions (RELEASES.md).

Firmware and TTDB are decoupled. A firmware update does not require a new
TTDB, and vice versa, as long as both conform to the same A32-RFC versions.

---

End A32-RFC-0004
