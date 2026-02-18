# TTN-RFC-0004
## Semantic Compression and On-Mesh Token Dictionary
### Version 0.1

Status: Draft

This RFC defines how rich semantic events are compressed into ultra-low-bandwidth
tokens suitable for Meshtastic and other constrained transports.

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
