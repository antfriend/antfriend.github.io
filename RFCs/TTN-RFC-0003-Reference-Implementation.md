# TTN-RFC-0003: Reference Implementation Checklist

**Version:** 1.0
**Status:** Stable
**RFC Number:** 0003
**Project:** toot-toot-engineering
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0001 (Core Mesh Specification), TTN-RFC-0002 (Typed Edges)
**Author:** antfriend
**Created:** 2026-04-10

---

## Minimal Viable Node
- Generate Node ID
- Maintain Node Registry
- Emit presence events
- Store Semantic Events locally in TTDB by default
- Use TTAI join/welcome behavior for initial connectivity by default
- Support compact mesh grammar

---

## Windows Node
- Full Toot-Toot Database implementation
- MQTT gateway
- monitor.html
- Optional local AI librarian

---

## ESP32 Node
- Compact DB
- Sensor events
- Web or serial UI
- Store-and-forward buffers

---

## Meshtastic Node
- Grammar-only semantics
- Presence beacons
- BBS headers
- @AI invocation forwarding

---

## Demo Milestone
- 3 heterogeneous nodes
- BBS thread propagation
- AI summary on request
- Graph rendered in monitor.html
