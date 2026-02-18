# TTN-RFC-0001
## Toot Toot Network – Core Semantic Mesh Specification
### Version 0.1

Status: Draft

This RFC defines the canonical behavior, concepts, and etiquette of the Toot Toot Network (TTN).

---

## 1. Core Principles
- Meaning over messages
- Offline-first and partition-tolerant
- Local sovereignty of data
- Transport agnostic
- Explicit AI invocation only

---

## 2. Required Concepts
- Node ID (cryptographic, stable)
- Semantic ID (location-anchored when available)
- Semantic Event
- Typed Edge
- Local MyMentalPalaceDB variant (TTDB) for event logging by default

## 3. Defaults
- Logging backend: TTDB (MyMentalPalaceDB) unless explicitly overridden
- Initial connectivity: TTAI presence/handshake behavior is the default path to first contact on new or unconfigured networks

---

## 4. Compliance Levels
- TTN-Base
- TTN-BBS
- TTN-AI
- TTN-Gateway

---

## 5. Etiquette Rules
- No autonomous AI speech on mesh
- No full-content flood on low-bandwidth links
- All assertions must include provenance
- Append-only records preferred

End RFC-0001
