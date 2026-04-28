# TTDB-RFC-0005: Toot-Bit Epistemic Weight (TBEW)
### Lightweight Free-Energy-Adjacent Surprise and Salience Metadata for TTDB Entries

**Version:** 1.0
**Status:** Stable
**RFC Number:** 0005
**Project:** toot-toot-engineering
**Component:** TTDB (MyMentalPalaceDB)
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0002 (Cursor Semantics), TTDB-RFC-0003 (Typed Edges)
**Author:** antfriend
**Created:** 2026-04-23

---

## 1. Abstract

This RFC proposes the addition of a small, optional **epistemic weight header block** to TTDB toot-bit entries. The block encodes four lightweight scalar fields — `confidence`, `revision_count`, `salience`, and `last_touched` — that together provide a symbolic approximation of variational free energy as formalized in the Free Energy Principle (FEP, Friston 2006–present). No floating-point matrix math is required. The fields are human-readable, flat-file-compatible, and parseable within the constraints established by TTDB-RFC-0001. The result is a knowledge graph that carries an intrinsic signal about which beliefs are well-settled, which are uncertain, and which are worth attending to next — a rudimentary but formally grounded epistemic prioritization mechanism applicable to any TTDB implementation, from cloud-connected assistants to embedded microcontrollers.

---

## 2. Motivation and Theoretical Grounding

### 2.1 The Gap This Fills

The Free Energy Principle states that adaptive agents minimize surprise — the divergence between their internal model's predictions and incoming sensory data. In practice, this requires a generative model that tracks, for each belief, something like: *how often has this belief been wrong?* and *how much does attending to this belief reduce uncertainty?*

Current TTDB entries are epistemically flat: a toot-bit about an ambient temperature reading carries the same structural weight as a toot-bit about a core architectural invariant. Any agent using TTDB has no native signal for prioritizing which entries to query, update, or distrust.

This RFC introduces that signal — not as a probabilistic inference engine but as a **symbolic proxy** for the key quantities free energy tracks:

| FEP Concept | TTDB Proxy Field |
|---|---|
| Surprise (prediction error) | `revision_count` + `confidence` |
| Epistemic value (information gain) | `salience` |
| Model evidence (belief stability) | `confidence` |
| Recency / temporal discount | `last_touched` |

### 2.2 Theoretical Lineage

This proposal sits at the intersection of three converging research traditions:

**Biosemiotics (von Uexküll):** The umwelt is not a uniform map — some signs are more salient to an organism than others. A predator's footprint and the texture of bark are not epistemically equal to a deer. TTDB should reflect this.

**Active Inference (Friston / Markov blankets):** <q>The goal of the agent is to restrict itself to its preferred set of states while minimizing the ambiguity of its internal model.</q> Maximizing epistemic value — attending to high-uncertainty, high-salience entries — is how an agent makes its model more accurate over time. Epistemic weight fields make this tractable without Bayesian matrix operations.

**Neurophenomenology (Varela):** First-person data must *constrain* the model — not merely fill it. An entry that has been revised many times is not yet a settled belief; it is an open constraint. The agent should treat it differently from an entry that has been stable for 500 cycles.

**Peirce (Abduction):** The toot-bit is a sign. Signs that repeatedly fail to resolve inquiry (high `revision_count`, low `confidence`) are invitations to inquiry — abductive triggers. The agent should actively seek new observations to resolve them.

---

## 3. Specification

### 3.1 The Epistemic Weight Header Block

Each TTDB entry MAY include an optional `[ew]` (epistemic weight) block, inserted immediately after the record header line and before the entry body. The block is delimited by `[ew]` and `[/ew]` tags.

**Syntax (standard TTDB format per TTDB-RFC-0001):**

```
@LAT48xLON-116 | created:1745300000 | updated:1745400000 | relates:reports_sensor>@LAT48xLON-120
[ew]
conf:180
rev:3
sal:12
touched:1745400000
[/ew]
Ambient sensor reading: 12.4C. Last stable reading from node cluster B.
```

The `[ew]` block MUST appear immediately after the record header line. A `[ew]` tag on any other line MUST be treated as body text.

### 3.2 Field Definitions

#### `conf` — Confidence (uint8, 0–255)

A measure of how settled this belief is. Higher values indicate the agent considers this entry well-modeled and unlikely to require revision. Lower values flag the entry as uncertain or contested.

- **0:** Completely unverified / placeholder entry
- **1–85:** Low confidence — entry has been revised frequently or was asserted without corroboration
- **86–170:** Moderate confidence — entry is reasonably stable but has seen some revision
- **171–255:** High confidence — entry has been stable across many cycles

**Default on creation:** `128` (neutral / unassessed)
**Encoding:** Plain integer string, range 0–255. One byte equivalent.

---

#### `rev` — Revision Count (uint16, 0–65535)

The number of times this entry's body has been substantively modified by an agent or external write. This is the primary **surprise proxy**: an entry revised many times has repeatedly generated prediction error. The agent should treat high-`rev` entries as poorly-modeled aspects of its umwelt.

- **Increment rule:** Increment on any write that changes entry body content by more than a trivial threshold (implementation-defined; suggested: any change beyond whitespace/punctuation).
- **`rev` is NOT incremented when only `[ew]` fields change.**
- **Saturation:** Clamp at 65535. An entry that saturates is a persistent open problem in the agent's model.

**Default on creation:** `0`

---

#### `sal` — Salience (uint8, 0–255)

A measure of how often this entry has been queried or referenced by the agent — how frequently it participates in active reasoning. High salience indicates the entry is load-bearing for current decisions. Combined with low `conf`, high `sal` identifies the highest-priority epistemic targets: beliefs the agent relies on heavily but doesn't trust fully.

- **Increment rule:** Increment on each agent read or query of this entry.
- **Decay rule:** Implementations SHOULD apply a periodic half-life decay (e.g., divide by 2 on a configurable cycle). This prevents salience from becoming a permanent historical artifact rather than a current-relevance signal.
- **Reset:** MAY be reset on agent reboot or context shift.

**Default on creation:** `0`

---

#### `touched` — Last Touched (uint32, Unix epoch seconds)

The Unix timestamp of the last write to this entry's body **or** `[ew]` block. This is a superset of the standard TTDB `updated` header field: `updated` tracks body changes only, while `touched` tracks any write. When both are present, `touched` is authoritative for recency-weighted prioritization. Entries untouched for long periods in a dynamic environment SHOULD have their `conf` decremented by the agent (implementation-defined decay schedule).

**Relationship to `updated`:** In standard TTDB files, implementations SHOULD keep `updated` synchronized with `touched` when the body changes. When only `[ew]` fields change, `updated` is left unchanged and only `touched` is advanced.

**Default on creation:** Timestamp of entry creation.
**Encoding:** Plain decimal integer. Fits in uint32 through year 2106.

---

### 3.3 Derived Signal: Epistemic Priority Score (EPS)

The agent MAY compute a lightweight **Epistemic Priority Score** for any entry as:

```
EPS = sal × (255 - conf) / 255
```

This produces a value in `[0, 255]` where:

- **High EPS:** Entry is frequently used but poorly understood. Prime target for active sensing or cross-referencing.
- **Low EPS:** Entry is either rarely used, well-understood, or both.

EPS requires only integer arithmetic (multiply, subtract, shift). It need not be stored — it is computed on demand during the agent's prioritization phase.

---

### 3.4 Example Agent Loop Integration

The following pseudocode illustrates TBEW integration into a sense-update-act loop:

```cpp
// During SENSE phase: read sensor, identify relevant TTDB entries
candidates = ttdb.query(current_context);

// Score and sort by epistemic priority
for (tb : candidates) {
    tb.eps = (tb.sal * (255 - tb.conf)) / 255;
}
sort_descending_by_eps(candidates);

// UPDATE phase: prioritize high-EPS entries for revision
for (tb : candidates) {
    if (sensor_data contradicts tb.body) {
        tb.body = updated_content;
        tb.rev = min(tb.rev + 1, 65535);
        tb.conf = max(tb.conf - CONF_DECREMENT, 0);
        tb.touched = now();
        tb.updated = now();  // body changed: advance both
    } else {
        tb.conf = min(tb.conf + CONF_INCREMENT, 255);
    }
    tb.sal = min(tb.sal + 1, 255);  // increment salience on access
}

// ACT phase: action selection informed by settled (high-conf) beliefs
// Agent prefers actions predicted by high-conf, high-sal entries
```

For embedded C++ implementation details, see A32-RFC-0002-Amendment-A-TBEW.

---

## 4. File Format and Parsing

### 4.1 Parsing Rules (extending TTDB-RFC-0001)

This section defines the `[ew]` block format for all TTDB implementations. It extends TTDB-RFC-0001 §3 (Record Section Format) by defining an optional block that MAY appear between the record header line and the entry body.

- The `[ew]` block is **optional**. Parsers MUST treat its absence as equivalent to default values: `conf:128`, `rev:0`, `sal:0`, `touched:0`.
- Fields within `[ew]` are order-independent.
- Unknown fields within `[ew]` MUST be silently ignored (forward compatibility).
- The `[ew]` block MUST appear immediately after the record header line and before the entry body.
- Each field occupies one line: `key:value` with no spaces around the colon.
- A `[ew]` token anywhere other than the line immediately after a record header MUST be treated as body text.

### 4.2 Field Line Format

```
key:value
```

Rules:
- No spaces around the colon.
- Key is lowercase ASCII, 1–16 characters.
- Value is a non-negative decimal integer (no leading zeros except `0` itself).
- One field per line.
- Lines that do not match `key:value` format MUST be silently skipped (forward compatibility for future fields).
- Field order within the block is **not significant**.

### 4.3 Out-of-Range Values

Values outside the specified range MUST be clamped to the range boundary on read (not treated as parse errors). This ensures forward compatibility if a future version uses wider ranges.

### 4.4 Storage Cost

Per entry overhead: 4 fields × ~12 bytes average + delimiters ≈ **~70 bytes per entry**. This is negligible within TTDB's flat-file architecture.

### 4.5 Human Readability

The `[ew]` block is intentionally human-readable. A researcher or developer inspecting a `.ttdb` file can immediately see which entries the agent considers uncertain, which it has revised repeatedly, and which it treats as load-bearing. This preserves TTDB's core property: **the knowledge graph is always legible to a human**.

---

## 5. Relationship to Existing RFCs

| RFC | Relationship |
|---|---|
| TTDB-RFC-0001 (File Format) | TBEW adds an optional block to the record section format. The `[ew]` block is backward compatible — prior-conformant files remain valid. |
| TTDB-RFC-0002 (Cursor Semantics) | EPS provides a natural basis for cursor prioritization. Implementations MAY weight cursor movement toward high-EPS nodes. |
| TTDB-RFC-0003 (Typed Edges) | Epistemic weight is orthogonal to typed edges. High-EPS entries are candidates for additional edge assertions as the agent resolves uncertainty. |
| TTDB-RFC-0004 (Event ID and Collision) | No changes required. Entry identity is still determined by the coordinate ID. |
| A32-RFC-0002 (TTDB Storage and Parsing on ESP32) | See A32-RFC-0002-Amendment-A-TBEW for the C++ parser extension implementing this RFC on embedded hardware. |
| A32-RFC-0003 (Agent Loop) | TBEW fields feed directly into the sense-update-act loop's prioritization logic. EPS becomes the agent's native attention signal. |

---

## 6. Positioning and Prior Art

### 6.1 What Exists

- **pymdp** (Python): Full active inference over POMDPs. Probabilistic, requires NumPy. Not embeddable on microcontrollers.
- **cpp-AIF** (C++): Header-only active inference, multi-core, workstation-targeted.
- **SystemC embedded cognitive agent (2015):** Embedded symbolic reasoning via First Order Logic. No FEP connection, no knowledge graph, predates active inference literature.
- **Cloud-scale KG + active inference:** SymAgent, AGENTiGraph — require LLMs and GPU infrastructure.

### 6.2 The Novel Position

TBEW gives any TTDB-backed agent a claim that no existing open-source embedded agent framework can currently make:

> **A human-readable, umwelt-anchored knowledge graph with a lightweight symbolic approximation of free energy minimization, requiring no floating-point matrix operations — applicable from cloud AI assistants down to microcontroller-resident agents with no cloud connectivity.**

This is not a claim that a TTDB agent *implements* the Free Energy Principle. It is a claim that TTDB entries annotated with TBEW fields provide the agent loop with the *same functional signals* FEP provides biological agents — at a fraction of the computational cost, and in a form that remains transparent to human inspection.

---

## 7. Open Questions

1. **Conf decay schedule:** What is the right half-life for `conf` decay when `touched` ages? This likely varies by domain (sensor data decays faster than structural knowledge).
2. **Salience decay:** Should salience decay be tied to agent ticks, wall-clock time, or both?
3. **Cross-entry epistemic relationships:** Should entries be able to reference each other's epistemic state (e.g., "my confidence depends on entry X's confidence")? This approaches belief propagation and may be out of scope for v1.
4. **Bootstrap values:** How should `conf` be initialized for entries written by humans vs. entries generated by the agent? Human-authored entries may warrant a different default.
5. **Collective EPS:** For multi-agent deployments, should EPS be synchronized across nodes? A shared surprise signal could enable collaborative belief updating across the mesh.
6. **`touched` vs `updated` migration:** For existing TTDB files that begin adopting `[ew]` blocks, should `touched` be initialized from `updated`?

---

## 8. References

- Friston, K. (2009). *The free-energy principle: a rough guide to the brain?* Trends in Cognitive Sciences.
- Friston, K. et al. (2018). *The Markov blankets of life: autonomy, active inference and the free energy principle.* Journal of The Royal Society Interface.
- Pietarinen, A. & Beni, M. (2021). *Active Inference and Abduction.* Biosemiotics, 14(2), 499–517.
- von Uexküll, J. (1909/1957). *A stroll through the worlds of animals and men.* [Umwelt and Innenwelt of Animals]
- Varela, F. (1996). *Neurophenomenology: A methodological remedy for the hard problem.* Journal of Consciousness Studies, 3, 330–349.
- TTDB-RFC-0001: File Format and Sections
- TTDB-RFC-0002: Cursor Semantics
- TTDB-RFC-0003: Typed Edge Semantics
- A32-RFC-0002: TTDB Storage and Parsing on ESP32
- A32-RFC-0003: Agent Loop and Hardware Abstraction

---

## 9. Changelog

| Date | Change |
|---|---|
| 2026-04-23 | Initial draft |

---

*This RFC is part of the toot-toot-engineering open-source project.*
*License: CC0*
