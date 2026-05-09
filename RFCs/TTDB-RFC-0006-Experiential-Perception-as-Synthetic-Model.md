# TTDB-RFC-0006: Experiential Perception as Synthetic Model

**Version:** 1.0
**Status:** Informational
**RFC Number:** 0006
**Project:** toot-toot-engineering
**Component:** Toot-Toot Database (TTDB) Conceptual Foundation
**Depends on:** TTDB-RFC-0001 (File Format), TTDB-RFC-0002 (Cursor Semantics), TTDB-RFC-0003 (Typed Edges), TTDB-RFC-0005 (Epistemic Weight)
**Author:** toot-toot-engineering
**Created:** 2026-05-03

Conceptual Foundations of the Toot-Toot Database

---

## Abstract

The Toot-Toot Database (TTDB) is a typed, offline knowledge graph designed to represent experiential knowledge at the edge. This RFC establishes the theoretical foundations of TTDB as a *synthetic model of experiential perception* rooted in the **Locus framework** — distinct from both propositional knowledge graphs and statistical embedding approaches. The central claim is that perception is best represented not as a catalog of states but as a graph of transitions between states, grounded in the biosemiotic concept of the umwelt. The `@PERCEPT:` before/after paired node structure is the formal, normative realization of this claim and is non-negotiable in any conforming Locus implementation.

---

## 1. Motivation

Locus is a framework for modeling experiential knowledge — what it is like to perceive, to live, to move through a state and into a different state. At its foundation is the requirement to represent not facts about an experience, but the structure of the experience itself.

Standard propositional ontologies (e.g., UMLS, SNOMED CT, ICD) are inadequate for this task. They encode `(entity, relation, entity)`: a drug treats a condition; a symptom implies a diagnosis. This is adequate for indexing facts about a domain. It is inadequate for representing *what the transition feels like* — the nausea in week one, the clarity in week six, the embodied difference between knowing your glucose is controlled and feeling that control in your body.

TTDB was designed to represent what it is like to move through a state. It requires a principled account of what kind of thing experiential knowledge is — and that account must be rigorous enough to constrain the data model, not merely motivate it rhetorically.

This RFC provides that account and establishes the `@PERCEPT:` definition as the binding contract of the Locus framework.

---

## 2. The Propositional Problem

Propositional knowledge graphs (like UMLS) can represent *that* a transition occurred:

```
(metformin) --[treats]--> (type 2 diabetes)
```

They cannot represent *what the transition felt like* to the person inside it. The nausea in week one. The clarity in week six. The difference between knowing your glucose is controlled and feeling that control in your body.

This is not a gap that richer propositional ontologies can close by adding more nodes or more relation types. It is a structural limitation. Propositions are: 
- atemporal (they have no lived duration)
- agent-free (they do not anchor to a perceiving subject)
- phenomenologically empty (they do not capture the shape of the perceptual experience itself)
   
Experience is none of those things. Experience is:
- temporally embedded (it has a before and after)
- agent-bound (it happens *to* someone)
- phenomenologically thick (the structure of the change matters as much as the change itself)

---

## 3. Locus: Synthetic Perceptual Modeling

The Locus framework takes a different approach: rather than simulating perception statistically or approximating it with dense embeddings, it *synthesizes* perception from typed, grounded primitives.

The distinction matters:

| Mode | Method | Epistemology |
|---|---|---|
| Simulated | Statistical approximation | Black-box latent space; what you learn is invisible |
| Synthetic | Assembled from primitives | Transparent, inspectable, auditable |

A synthetic model builds experience-shapes from known components — the way organic chemistry builds molecules from elements with known valences. Each component is interpretable. Each bond is typed. The resulting structure is not a probability distribution over possible experiences; it is a specific, addressable claim about a specific experiential arc.

This is what Locus does. It models experiential transitions using a small set of **primitive node types** — organized around the `@PERCEPT:` pairing as the central load-bearing structure. (Medical illustrations use symptom, condition, molecule, medicine, and outcome nodes; but Locus is domain-agnostic and can model any experiential transition in any domain.)

---

## 4. The Umwelt Frame

Jakob von Uexküll's concept of the *umwelt* — the species-specific perceptual world each organism inhabits — provides the theoretical grounding for TTDB's design.

The umwelt is not the world. It is the slice of the world that has become sign-relevant to a perceiving subject. A tick does not perceive color or sound; it perceives warmth and butyric acid. Its umwelt is small, precise, and sufficient for its existence.

TTDB encodes a medical umwelt: not everything that can be said about an illness, but everything that registers as sign-worthy to a patient moving through it. Each toot-bit is a unit of umwelt — a fact that was sign-worthy enough to encode.

This is why TTDB does not aim to be comprehensive. Comprehensiveness is a property of propositional databases. TTDB aims to be *experientially sufficient* — to contain enough of the right kind of signal to reconstruct the shape of an experience.

---

## 5. The @PERCEPT: Paired Node — Formal Definition

The `@PERCEPT:before` → `@PERCEPT:after` paired node structure is the **formal and non-negotiable** center of the Locus framework. This pairing is not optional. It is not a design choice among alternatives. It is the binding contract of any system claiming conformance to Locus.

### 5.0 Definition

A Locus `@PERCEPT:` pair encodes a single directed transition:

```
@PERCEPT:before  → [state_0, state_1, ...]
@PERCEPT:after   → [state_0', state_1', ...]
```

where each state is a typed, addressable node (e.g., a symptom, condition, sensation, or more abstractly, any aspect of the experiential field before and after an intervention or event).

The edge connecting them is the datum — not the nodes themselves. The unit of perceptual knowledge in Locus is the **transition**: the typed, directed claim that this agent moved from this perceptual configuration to that one, under the influence of this intervention or event.

### 5.1 Why Paired Nodes Are Non-Negotiable

Most knowledge systems (including medical ontologies) record states:

```
patient.state = "nausea"
patient.state = "fatigue"
```

Locus records transitions:

```
@PERCEPT:before → [nausea, fatigue, brain-fog]
@PERCEPT:after  → [reduced-nausea, energy-restored, mental-clarity]
```

This is not merely more expressive notation. It is structurally different and reflects the biology of perception itself.

Perception is fundamentally a *transition-detection* faculty. The visual system responds to edges, not uniform fields. Proprioception detects acceleration, not position. Pain attenuates under constant stimulus; novelty captures attention. What we *notice* is *change*. A knowledge graph that records only states is a knowledge graph that cannot represent the thing perception actually does.

Locus commits to this: an implementation that records post-state percepts without a paired pre-state context is **not a conforming Locus implementation**. The pair is the minimum unit. Implementations may extend it (adding intervention info, timestamps, agent context, etc.), but they must never drop either element of the pair.

### 5.2 The Delta as the Datum

Formally: the unit of perceptual knowledge in Locus is not a node but an **edge** — specifically the typed edge connecting a `@PERCEPT:before` node to a `@PERCEPT:after` node. The nodes are addressed; the edge is the claim.

This has immediate implications for querying and storage:

- A query against Locus's perceptual layer is not "what states did this agent pass through?" but "what perceptual transitions did this agent traverse, under what intervention, from what prior state, to what outcome?"
- Storage and indexing strategies SHOULD optimize for edge traversal and delta computation, not isolated node lookup.
- Implementations that record only the "after" state without grounding it in a "before" state are not modeling perception; they are modeling isolated facts.

---

## 6. Phenomenological Trace

TTDB does not attempt to encode the full phenomenology of experience — the qualia, the emotional valence, the narrative meaning-making. What it encodes is the *phenomenological trace*: what remains encodable after perception has passed through language and into structured representation.

This is a principled limitation. The alternative — attempting to encode raw phenomenology — produces systems that are either computationally intractable or epistemically dishonest. TTDB makes a different bet: that the trace is sufficient for meaningful inference, pattern recognition, and knowledge transfer across patients.

The `emotions.md` RFC (hippocampal-prefrontal emotional embedding graph) extends this model into affective space, providing valence/arousal coordinates that allow emotional transitions to be represented alongside perceptual ones. Together, they constitute a richer but still finite and inspectable representation of the experiential interior.

---

## 7. Normative Implications for Locus Implementations

The theoretical commitments in this RFC have direct, binding implications for any system claiming conformance to the Locus framework:

1. **Paired percepts are mandatory.** A `@PERCEPT:after` node without a corresponding `@PERCEPT:before` node is not a valid Locus record. Implementations MUST enforce this pairing at write time. Partial or orphaned percepts are errors, not valid data.

2. **Transitions, not isolated states, are the primary datum.** Storage and indexing strategies MUST optimize for edge traversal and delta computation. A system that can only tell you "the state is X" but not "the state changed from Y to X" is not a Locus implementation.

3. **Agent context is mandatory.** A perceptual transition without an agent anchor (patient identifier, user ID, device ID, cohort) is propositional, not experiential. The perceiving subject must be present. This context MUST be preserved throughout storage and querying.

4. **Domain grounding varies by use case.** Medical implementations may use UMLS CUIs (which provide deterministic addressing and portability). Other domains use their own identifier schemes. But whatever addressing scheme is chosen MUST be consistent, typed, and resolvable within the implementation. (UMLS is an example, not a requirement.)

---

## 8. Relation to Prior RFCs

| RFC | Relation |
|---|---|
| A32-RFC-0002 (TTDB Storage/Parsing) | This RFC provides the conceptual justification for the six-node structure defined there |
| `emotions.md` | Extends the perceptual model into affective space; valence/arousal coordinates complement the transition model in §5 |
| `@PERCEPT:` namespace proposal | The paired-node structure described in §5 is the formal specification of that proposal |

---

## 9. Open Questions

- **`@PERCEPT:` vs `@TTP:`** — Should the namespace be renamed `@TTP:` (Toot-Toot Percept) for consistency with the broader Locus naming convention? This RFC uses `@PERCEPT:` but does not resolve the question.

- **Numeric evidence payloads on outcome nodes** — If outcome nodes carry queryable numeric evidence weights, the transition model in §5 extends to `(before, intervention, after, evidence-weight)`. This has implications for query semantics and should be addressed in a follow-on RFC.

- **Cohort vs. individual percepts** — The current model anchors transitions to individual agents. Whether and how to aggregate transitions across anonymous cohorts without losing the agent-context requirement (§7.3) is an open design question.

---

## References

- Uexküll, J. von (1909). *Umwelt und Innenwelt der Tiere.* Springer.
- Damasio, A. (1994). *Descartes' Error.* Putnam.
- Ma, Y. & Kragel, P. (2025). Hippocampal-prefrontal emotional embedding graph. *Nature Communications.*
- UMLS Reference Manual. National Library of Medicine. https://www.nlm.nih.gov/research/umls/