# TTDB-RFC-0006: Experiential Perception as Synthetic Model
## Conceptual Foundations of the Toot-Toot Database

**Status:** Informational  
**Series:** TTDB Conceptual Foundation  
**Author:** toot-toot-engineering  
**Date:** 2026-05-03

---

## Abstract

The Toot-Toot Database (TTDB) is a typed, offline knowledge graph designed to represent experiential knowledge at the edge. This RFC establishes the theoretical foundations of TTDB as a *synthetic model of experiential perception* — distinct from both propositional knowledge graphs and statistical embedding approaches. The central claim is that perception is best represented not as a catalog of states but as a graph of transitions between states, grounded in the biosemiotic concept of the umwelt. The `@PERCEPT:` before/after paired node structure is the formal realization of this claim.

---

## 1. Motivation

Standard medical ontologies — UMLS, SNOMED CT, ICD — are propositional. They encode the form `(entity, relation, entity)`: a drug treats a condition; a symptom implies a diagnosis. This is adequate for indexing facts. It is inadequate for representing *what it is like* to move through an illness.

TTDB was designed to represent what it is like to be something. It requires a principled account of what kind of thing experiential knowledge is — and that account must be rigorous enough to constrain the data model, not merely motivate it rhetorically.

This RFC provides that account.

---

## 2. The Propositional Problem

Propositional knowledge graphs can represent *that* a transition occurred:

```
(metformin) --[treats]--> (type 2 diabetes)
```

They cannot represent *what the transition felt like* to the person inside it. The nausea in week one. The clarity in week six. The difference between knowing your glucose is controlled and feeling that control in your body.

This is not a gap that richer ontologies can close by adding more nodes or more relation types. It is a structural limitation. Propositions are: 
- atemporal
- agent-free
- phenomenologically empty
   
Experience is none of those things!

---

## 3. TTDB as Synthetic Perceptual Model

TTDB takes a different approach: rather than simulating perception statistically or approximating it with dense embeddings, it *synthesizes* perception from typed, grounded primitives.

The distinction matters:

| Mode | Method | Epistemology |
|---|---|---|
| Simulated | Statistical approximation | Black-box latent space |
| Synthetic | Assembled from primitives | Transparent, inspectable |

A synthetic model builds experience-shapes from known components — the way organic chemistry builds molecules from elements with known valences. Each component is interpretable. Each bond is typed. The resulting structure is not a probability distribution over possible experiences; it is a specific, addressable claim about a specific experiential arc.

This is what TTDB does. The six conceptual nodes — symptom, condition, molecule, medicine, percept, outcome — are not categories in a taxonomy. They are the **primitive elements** from which illness experience is assembled.

---

## 4. The Umwelt Frame

Jakob von Uexküll's concept of the *umwelt* — the species-specific perceptual world each organism inhabits — provides the theoretical grounding for TTDB's design.

The umwelt is not the world. It is the slice of the world that has become sign-relevant to a perceiving subject. A tick does not perceive color or sound; it perceives warmth and butyric acid. Its umwelt is small, precise, and sufficient for its existence.

TTDB encodes a medical umwelt: not everything that can be said about an illness, but everything that registers as sign-worthy to a patient moving through it. Each toot-bit is a unit of umwelt — a fact that was sign-worthy enough to encode.

This is why TTDB does not aim to be comprehensive. Comprehensiveness is a property of propositional databases. TTDB aims to be *experientially sufficient* — to contain enough of the right kind of signal to reconstruct the shape of an experience.

---

## 5. The Paired Node as Formal Claim

The `@PERCEPT:` before/after node pair is the load-bearing structure of TTDB's claim to be a perceptual model.

Most medical ontologies record states:

```
patient.state = "nausea"
```

TTDB records transitions:

```
@PERCEPT:before → [nausea, fatigue, brain-fog]
@PERCEPT:after  → [reduced-nausea, energy-restored, mental-clarity]
```

This is not merely more expressive. It is structurally different. A state-catalog answers the question *what was present*. A transition record answers the question *what changed, and in which direction, for whom*.

Perception is fundamentally a transition-detection faculty. The visual system responds to edges, not uniform fields. Pain attenuates under constant stimulus. What we notice is *change*. A knowledge graph that records only states is a knowledge graph that cannot represent the thing perception actually does.

The `@PERCEPT:` pair makes TTDB's perceptual model explicit and normative. An implementation that records only post-state percepts without pre-state context is not a conforming TTDB implementation.

### 5.1 The Delta as the Datum

Formally: the unit of perceptual knowledge in TTDB is not a node but an **edge** — specifically the typed edge connecting a `@PERCEPT:before` node to a `@PERCEPT:after` node. The nodes are addressed; the edge is the claim.

This has implications for querying. A query against TTDB's perceptual layer is not "what was this patient's experience?" but "what perceptual transition did this patient traverse, under what intervention, from what prior state?"

---

## 6. Phenomenological Trace

TTDB does not attempt to encode the full phenomenology of experience — the qualia, the emotional valence, the narrative meaning-making. What it encodes is the *phenomenological trace*: what remains encodable after perception has passed through language and into structured representation.

This is a principled limitation. The alternative — attempting to encode raw phenomenology — produces systems that are either computationally intractable or epistemically dishonest. TTDB makes a different bet: that the trace is sufficient for meaningful inference, pattern recognition, and knowledge transfer across patients.

The `emotions.md` RFC (hippocampal-prefrontal emotional embedding graph) extends this model into affective space, providing valence/arousal coordinates that allow emotional transitions to be represented alongside perceptual ones. Together, they constitute a richer but still finite and inspectable representation of the experiential interior.

---

## 7. Normative Implications

The theoretical commitments in this RFC have direct implications for conforming TTDB implementations:

1. **Paired percepts are required.** A `@PERCEPT:after` node without a corresponding `@PERCEPT:before` node is incomplete. Implementations SHOULD enforce this pairing at write time.

2. **Transitions, not states, are the primary datum.** Storage and indexing strategies SHOULD optimize for edge traversal, not node lookup.

3. **Agent context is non-optional.** A perceptual transition without a patient/agent context is propositional, not experiential. The agent anchor (patient identifier or anonymous cohort) MUST be preserved.

4. **CUI addressing supports umwelt grounding.** UMLS CUIs provide the deterministic addressing that makes toot-bits portable and interoperable while remaining grounded in established medical vocabulary.

---

## 8. Relation to Prior RFCs

| RFC | Relation |
|---|---|
| A32-RFC-0002 (TTDB Storage/Parsing) | This RFC provides the conceptual justification for the six-node structure defined there |
| `emotions.md` | Extends the perceptual model into affective space; valence/arousal coordinates complement the transition model in §5 |
| `@PERCEPT:` namespace proposal | The paired-node structure described in §5 is the formal specification of that proposal |

---

## 9. Open Questions

- **`@PERCEPT:` vs `@TTP:`** — Should the namespace be renamed `@TTP:` (Toot-Toot Percept) for consistency with the broader Mnemon naming convention? This RFC uses `@PERCEPT:` but does not resolve the question.

- **Numeric evidence payloads on outcome nodes** — If outcome nodes carry queryable numeric evidence weights, the transition model in §5 extends to `(before, intervention, after, evidence-weight)`. This has implications for query semantics and should be addressed in a follow-on RFC.

- **Cohort vs. individual percepts** — The current model anchors transitions to individual agents. Whether and how to aggregate transitions across anonymous cohorts without losing the agent-context requirement (§7.3) is an open design question.

---

## References

- Uexküll, J. von (1909). *Umwelt und Innenwelt der Tiere.* Springer.
- Damasio, A. (1994). *Descartes' Error.* Putnam.
- Ma, Y. & Kragel, P. (2025). Hippocampal-prefrontal emotional embedding graph. *Nature Communications.*
- UMLS Reference Manual. National Library of Medicine. https://www.nlm.nih.gov/research/umls/