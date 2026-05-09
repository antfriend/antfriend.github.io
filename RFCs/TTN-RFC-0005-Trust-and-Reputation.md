# TTN-RFC-0005: Trust, Reputation, and Social Gravity

**Version:** 1.0
**Status:** Stable
**RFC Number:** 0005
**Project:** toot-toot-engineering
**Component:** Toot Toot Network (TTN)
**Depends on:** TTN-RFC-0001 (Core Mesh Specification), TTN-RFC-0002 (Typed Edges)
**Author:** antfriend
**Created:** 2026-04-14

This RFC defines decentralized trust modeling for TTN.

---

## 1. Trust Model
Trust is local, subjective, and non-global.

---

## 2. Trust Signals
- Seen frequency
- Edge corroboration
- Signature validity
- Behavior history

---

## 3. Reputation Gravity
Nodes with more trusted edges exert higher semantic gravity,
making their events more likely to propagate.

---

## 4. Moderation
Edges:
- trusted_by
- muted_by
- blocked_by
- rehabilitated_by
