# A32-RFC-0003

## Agent Loop and Hardware Abstraction

### Version 1.0

Status: Stable

This RFC defines the Agent Loop (sense-reason-act cycle) and the Hardware
Abstraction Layer for Agent 32 applications running on ESP32 with Arduino.

---

## 1. Agent Loop Overview

The Agent Loop is a periodic cycle that reads sensor state, consults the
TTDB to determine what to do, and executes actions. It runs in `loop()`
or as a FreeRTOS task.

```
  ┌──────────┐
  │  SENSE   │  Read all registered sensors into a state snapshot.
  └────┬─────┘
       │
  ┌────▼─────┐
  │  REASON  │  Match state against TTDB nodes and edges.
  └────┬─────┘  Navigate cursor. Select action edges.
       │
  ┌────▼─────┐
  │   ACT    │  Execute action edges via registered actuators.
  └────┬─────┘
       │
  ┌────▼─────┐
  │  WAIT    │  Delay until next cycle (configurable interval).
  └──────────┘
```

The loop interval SHOULD be configurable and defaults to 1000 ms.
Implementations MAY support adaptive intervals based on TTDB cursor policy.

---

## 2. Sense Phase

### 2.1 Sensor Registry

Sensors are registered at startup with a name, a read function, and a
coordinate mapping that ties the sensor's output to the TTDB globe:

```cpp
typedef float (*SensorReadFn)();

struct A32Sensor {
    const char* name;        // human-readable label
    SensorReadFn read;       // returns a float reading
    int16_t map_lat;         // TTDB lat axis this sensor maps to
    int16_t map_lon;         // TTDB lon axis this sensor maps to
    float range_min;         // expected min value
    float range_max;         // expected max value
};
```

Registration example:

```cpp
float readTemperature() {
    return dht.readTemperature();
}

A32Sensor tempSensor = {
    .name = "ambient_temp",
    .read = readTemperature,
    .map_lat = 10,
    .map_lon = 0,
    .range_min = -20.0,
    .range_max = 60.0
};

agent.registerSensor(&tempSensor);
```

### 2.2 State Snapshot

Each sense phase produces a `StateSnapshot` — a fixed-size array of
sensor readings with timestamps:

```cpp
struct SensorReading {
    const char* name;
    float value;
    uint32_t timestamp;  // millis() at read time
};

struct StateSnapshot {
    SensorReading readings[A32_MAX_SENSORS];
    uint8_t count;
    uint32_t cycle_id;
};
```

`A32_MAX_SENSORS` defaults to 16 and is a compile-time constant.

---

## 3. Reason Phase

The reason phase maps the state snapshot to TTDB navigation decisions.
This is where Agent 32 differs from cloud-LLM agents: reasoning is
deterministic graph traversal, not generative inference.

### 3.1 Coordinate Mapping

Sensor readings are quantized into TTDB coordinates using the
`coord_increment` from the `mmpdb` block:

```cpp
int16_t quantize(float value, float range_min, float range_max,
                 int16_t coord_min, int16_t coord_max, int16_t increment) {
    float normalized = (value - range_min) / (range_max - range_min);
    int16_t coord = coord_min + (int16_t)(normalized * (coord_max - coord_min));
    // Snap to nearest increment
    coord = ((coord + increment / 2) / increment) * increment;
    return coord;
}
```

### 3.2 Node Matching

After quantizing sensor readings to coordinates, the agent finds the
nearest TTDB record:

1. Compute a target coordinate from the state snapshot.
2. Query the TTDB index for the nearest node (Euclidean distance on
   the lat/lon grid).
3. If the nearest node is within the `coord_increment` threshold,
   the cursor moves to that node.
4. If no node is within threshold, the cursor stays and the agent
   applies the `no_match_policy` for the current cycle. The default
   behavior is to hold position and re-evaluate next cycle.

Note: `collision_policy` (TTDB-RFC-0004 §3) governs ID assignment
when creating a new record would duplicate an existing ID. It is
distinct from the runtime matching behavior described here.

### 3.3 Edge Selection

Once the cursor is at a node, the agent reads the node's typed edges
to determine actions:

```cpp
// Pseudo-code for edge-based reasoning
TTDBEdge edges[A32_MAX_EDGES];
uint8_t n = db.edgesAt(cursor.lat, cursor.lon, edges, A32_MAX_EDGES);

for (uint8_t i = 0; i < n; i++) {
    if (strcmp(edges[i].type, "triggers") == 0) {
        agent.enqueueAction(edges[i]);
    }
    if (strcmp(edges[i].type, "navigates_to") == 0) {
        cursor.moveTo(edges[i].target_lat, edges[i].target_lon);
    }
}
```

Edge types are domain-specific and defined per TTDB. TTDB-RFC-0003 §4
requires that implementations SHOULD align with the TTN typed edge taxonomy
(TTN-RFC-0002) where applicable. The following are A32-specific extensions;
project TTDB files MAY also use TTN-RFC-0002 taxonomy edges alongside them.

| Edge Type       | Semantics                                      | Closest TTN-RFC-0002 analogue |
|-----------------|------------------------------------------------|-------------------------------|
| `triggers`      | Activate an actuator or output                 | `commands`                    |
| `navigates_to`  | Move cursor to another node                    | *(A32-specific)*              |
| `inhibits`      | Suppress an action that would otherwise fire   | *(A32-specific)*              |
| `requires`      | Gate: only proceed if target node is satisfied | *(A32-specific)*              |
| `logs`          | Record an observation (see Section 5)          | `reports_sensor`              |

---

## 4. Act Phase

### 4.1 Actuator Registry

Actuators mirror the sensor registry:

```cpp
typedef void (*ActuatorExecFn)(float value);

struct A32Actuator {
    const char* name;
    ActuatorExecFn exec;
};
```

Registration example:

```cpp
void setRelay(float value) {
    digitalWrite(RELAY_PIN, value > 0.5 ? HIGH : LOW);
}

A32Actuator relay = {
    .name = "main_relay",
    .exec = setRelay
};

agent.registerActuator(&relay);
```

### 4.2 Action Queue

The reason phase enqueues actions. The act phase drains the queue:

```cpp
struct A32Action {
    const char* actuator_name;
    float value;
    uint8_t priority;  // 0 = highest
};
```

Actions are sorted by priority. Conflicting actions on the same actuator
use the highest-priority entry. The queue is cleared after each cycle.

---

## 5. Observation Logging

Agent 32 devices MAY log observations for later retrieval. Logs are
append-only and stored separately from the TTDB file.

Per TTN-RFC-0001 §5, all assertions MUST include provenance. Log entries
MUST therefore include the `db_id` and `umwelt_id` from the `mmpdb` block
so that records can be attributed to a specific device and worldview:

```cpp
// Append to /log.csv on LittleFS or SD
// Format: timestamp_ms, db_id, umwelt_id, event, value
void agent_log(const char* db_id, const char* umwelt_id,
               const char* event, float value) {
    File f = LittleFS.open("/log.csv", "a");
    f.printf("%lu,%s,%s,%s,%.2f\n", millis(), db_id, umwelt_id, event, value);
    f.close();
}
```

The TTDB file itself is NOT modified at runtime. Logs are a side channel.

If the TTDB defines `logs` edges, the agent automatically logs when those
edges are traversed.

---

## 6. Timing and Task Model

### 6.1 Simple Mode (Single Core)

For simple applications, the agent loop runs in Arduino's `loop()`:

```cpp
void loop() {
    agent.sense();
    agent.reason();
    agent.act();
    delay(agent.intervalMs());
}
```

### 6.2 FreeRTOS Mode (Dual Core)

For applications requiring concurrent I/O (e.g., BLE + agent loop), use
FreeRTOS tasks. The agent loop runs on Core 1; comms run on Core 0:

```cpp
void agentTask(void* param) {
    Agent32* agent = (Agent32*)param;
    for (;;) {
        agent->sense();
        agent->reason();
        agent->act();
        vTaskDelay(pdMS_TO_TICKS(agent->intervalMs()));
    }
}

void setup() {
    // ... init ...
    xTaskCreatePinnedToCore(agentTask, "agent", 8192, &agent, 1, NULL, 1);
}
```

### 6.3 Watchdog

Implementations MUST feed the task watchdog in each cycle. The Arduino
ESP32 core enables the watchdog by default. Long TTDB reads SHOULD
yield periodically:

```cpp
// Inside a long sequential scan
if (line_count % 100 == 0) {
    yield();  // feed watchdog
}
```

---

## 7. Minimal Sketch Template

```cpp
#include <TTDB.h>
#include <Agent32.h>

TTDB db;
Agent32 agent(&db);

// --- Sensors ---
float readPIR() { return digitalRead(13); }
A32Sensor pir = {"motion", readPIR, 0, 0, 0.0, 1.0};

// --- Actuators ---
void setBuzzer(float v) { digitalWrite(19, v > 0.5 ? HIGH : LOW); }
A32Actuator buzzer = {"buzzer", setBuzzer};

void setup() {
    Serial.begin(115200);
    pinMode(13, INPUT);
    pinMode(19, OUTPUT);

    LittleFS.begin(true);
    db.begin("/ttdb.md");

    agent.registerSensor(&pir);
    agent.registerActuator(&buzzer);
    agent.setInterval(500);

    Serial.printf("Agent 32: %s online\n", db.name());
}

void loop() {
    agent.sense();
    agent.reason();
    agent.act();
    delay(agent.intervalMs());
}
```

---

End A32-RFC-0003
