# TTN-RFC-0004: Semantic Compression and Token Dictionary

**Version:** 1.0
**Status:** Stable
**RFC Number:** 0004
**Project:** toot-toot-engineering
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0001 (Core Mesh Specification), TTN-RFC-0002 (Typed Edges)
**Author:** antfriend
**Created:** 2026-04-12

This RFC defines how rich semantic events are compressed into ultra-low-bandwidth tokens suitable for Meshtastic and other constrained transports.

---

## 1. Design Goals
- Minimize airtime
- Preserve intent and priority
- Allow deterministic expansion off-mesh
- Avoid ambiguity

---

## 2. Token Classes

### 2.1 Core Tokens
| Token | Meaning |
|-----|--------|
| P | Presence |
| S? | Status request |
| OK | Acknowledgement |
| ERR | Error / failure |
| SOS | Emergency |

### 2.2 Sensor Tokens
| Token | Expansion |
|-----|----------|
| T:x | Temperature reading |
| H:x | Humidity |
| B:x | Battery level |

---

## 3. Expansion Rules
Gateways MUST expand tokens into full Semantic Events.
Tokens MUST be context-free.

---

## 4. Priority Encoding
Emergency tokens preempt all other traffic.
