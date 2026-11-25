# Belief Trajectories: a Delay-Embedding Lens on the Grimoire

**Status:** research note with a prototype (not an RFC) · **Touches:** TTG-RFC-0003, -0004, -0005,
-0006; TTDB-RFC-0005 · **Prototype:** [`tools/trajectories.mjs`](tools/trajectories.mjs)
**Prompted by:** Haylett, *Geofinitism: Language as a Nonlinear Dynamical System* [1]

---

## 1. The idea

Haylett treats meaning as a basin of attraction. He uses Takens' delay embedding [2] to rebuild
an attractor's geometry from a single scalar series, and he admits the step is only approximate
for sparse, quantized text [1]. The grimoire already keeps the series he would need: the
lane-ordered sayings of each triple, which are never rewritten
([TTG-RFC-0004 §2](../RFCs/TTG-RFC-0004-Time-and-the-Fleet.md)). The proposal is a
**read-only diagnostic** that reads each triple's evidence series. It tells three cases apart
that a verdict alone cannot:

| Shape | Reading | Grimoire today |
|---|---|---|
| fixed point | settled belief | decided, conf > 128 ([TTG-RFC-0003 §2](../RFCs/TTG-RFC-0003-Beliefs-Reasoning-Response.md)) |
| alternation | genuine contradiction | contested `?`, or decided by a margin of one |
| one crossing, then held | change of mind | caught only when the owner's tense says so ([TTG-RFC-0004 §3.7](../RFCs/TTG-RFC-0004-Time-and-the-Fleet.md)) |

The third row is where this lens adds the most. Right now a change of mind said without a tense
shift (*I like tea* three times, then *I don't like tea* three times) reads as a contest at 128.
That is correct, since the store refuses a recency rule. But the owner cannot see that the
sayings fall into two runs, not an alternation: the prototype shows exactly this (§7).

## 2. The series

For a triple *t*, let episode *k* be the *k*-th episode (lane 90 ordinal) that says *t*. Each
episode scores *t* as consolidation does (TTG-RFC-0003 §2): the largest `+` weight and the
largest `-` weight among its percepts of *t*. The series is the episode's **sign**:

```
s_k = sign(plus_k − minus_k)     ∈ {+1, −1, 0}
```

0 is an episode that says *t* both ways alike, and it is kept but not counted in a run. The
series includes sayings that a tense change retired, flagged as retired, because the lens
describes what was said and not what is believed.

**Why the sign, not a running balance.** An earlier draft used the running balance
`b_k = (for_k − against_k) / (for_k + against_k + prior_for + prior_against)`. Because it sums
over all earlier episodes, it crosses zero only once the contrary sayings outnumber the earlier
ones: three *likes* and three *don't likes* end at `b = 0`, which looks like a contest, not like
one crossing. The per-episode sign shows the crossing at the fourth episode. The prototype still
prints the final `b` beside the shape, as context.

**The embedding.** With delay τ = 1 episode and dimension m = 2, the embedding of a sign series
is the set of its transitions (`++`, `+-`, `-+`, `--`), and the shape can be read from its
**runs** of one sign:

- **Fixed point:** one run.
- **One crossing:** two runs, the last lasting at least `hold` episodes (2 by default).
  Shorter, it is a *crossing, not yet held*.
- **Alternation:** three runs or more.
- Fewer than `min` episodes (3 by default) show nothing, and the lens says *too few* rather than
  guess.

A higher m adds nothing to a ±1 series that its runs don't already say, so the prototype stops at
m = 2. It borrows the *picture* of an embedding, not the theorem (§5).

## 3. A second series: construction traffic

Each construction ([TTG-RFC-0006](../RFCs/TTG-RFC-0006-Constructions.md)) draws some of the
owner's sentences: how much traffic each basin draws. **Episodes do not record it.** The reply
names the construction that read a tell (§4 there), but the episode keeps only its `said`,
`shape`, `percept`, `holds`, `gap` and `tense` lines. The traffic is re-derived instead, the way
a re-reading ([TTG-RFC-0005 §5.1](../RFCs/TTG-RFC-0005-Shapes-and-Amendments.md)) re-derives a
reading: each `said` line is read again under today's grammar, in its own language, and the
constructions that read it are counted, an ancestor counting what its descendants read. The
count belongs to one grammar, named by its hash. A sentence the owner amended is the owner's
reading and is not counted.

Run before and after a grammar change, the two counts say not only *which* sentences moved but
also *which basins gained or lost them*; a construction that draws nothing is listed as such.

## 4. Invariants it must keep

- **Writes nothing.** Like a re-reading, the lens is a report. It never adds a percept, a
  belief or an amendment. The prototype has no way to write: it does not open a file for writing.
- **No verdicts.** "One crossing" is offered to the owner as a shape, never consolidated as a
  supersession. Only the owner's words or an amendment change a belief.
- **Provenance stays separate.** If the shape ever reaches a reply, it is a note beside the
  grounds (said / inferred / contested / no longer, TTG-RFC-0003 §4), never a ground, and its
  wording is a reply key in the store, like every other phrase.
- **Ranking.** The prototype puts first what the verdict alone leaves unclear: a contested
  triple, then a crossing the tense did not already catch, then an alternation, then the most
  said. Ranking by EPS ([TTDB-RFC-0005](../RFCs/TTDB-RFC-0005-Epistemic-Weight.md)) would need a
  triple's salience, which the store keeps per term, not per triple; it is left for later. The
  place a shape matters most is the place the librarian already asks, the action side of the
  loop (`@LAT20LON3`) [4].

## 5. Caveats

- Takens' theorem assumes a smooth deterministic system and a generic observable, and its
  finite-data guarantees need long, low-noise series [2, 3]. A triple's series is short, discrete
  and driven by one person, so this borrows the picture, not the theorem.
- Most triples are said once or twice and show nothing; the seed store has one disagreement
  (*coffee*, two episodes) and so shows *too few*.
- `sal_half_life` decay ([TTG-RFC-0001 §9](../RFCs/TTG-RFC-0001-Grammar-in-the-Store.md)) acts
  on salience, not on the series. Keep them separate so that forgetting is not mistaken for a
  change of mind.
- Construction traffic re-reads each sentence alone, without the sentence before it, so a
  pronoun's antecedent may differ from the episode's; constructions don't depend on it.

## 6. Open questions

1. **Episodes or time?** The prototype counts episodes. A delay that counts lane gaps, so that a
   crossing a year apart reads differently from one an hour apart, belongs with the stamps of
   TTG-RFC-0004 §4, which nothing implements yet.
2. **In a fleet**, the order of sayings is only partial
   ([TTG-RFC-0004 §4](../RFCs/TTG-RFC-0004-Time-and-the-Fleet.md)), so the series is a partial
   order. Read per agent, where the order is total, until the stamps can order across agents.
3. **A construction that no longer earns its place** is one that draws nothing over a corpus that
   has had the chance to use it. The prototype lists such constructions; whether to say so to the
   owner, and after how many episodes, is open.
4. **Into the reply?** A contested answer could carry a note naming the runs (*you said it in
   episodes 1–3, then the opposite in 4–6*). That needs a reply key and the `min` and `hold`
   numbers in the store, and a test that the note never changes the verdict. Worth doing only if
   the report proves useful on a real corpus.

## 7. The prototype

```
node tools/trajectories.mjs                 the triples whose sayings disagree, and construction traffic
node tools/trajectories.mjs --all           every triple said in at least --min episodes
  --store <file>   --min <n>   --hold <n>   --json
```

On a store fed the seed corpus and then *I like tea* ×3, *I don't like tea* ×3; *I like milk* /
*I don't like milk* alternating five times; *I like jam* ×3 and *I don't like jam* once; *I liked
cake* and *I don't like cake* twice; and four sentences constructions read:

```
self | like | tea   verdict ? (128)   6 ep: + + + - - -   b 0
    one crossing  · runs +3 -3  · moves ++2 +-1 -+0 --2
self | like | milk   verdict + (146)   5 ep: + - + - +   b 0.14
    alternation  · runs +1 -1 +1 -1 +1  · moves ++0 +-2 -+2 --0
self | like | jam   verdict + (170)   4 ep: + + + -   b 0.33
    crossing, not yet held  · runs +3 -1  · moves ++2 +-1 -+0 --0
self | like | cake   verdict - (191)   3 ep: +r - -   b -0.2
    one crossing  · runs +1 -2  · moves ++0 +-1 -+0 --1  · the owner's tense already retired a saying

construction traffic
  en    1 ep   1 sent  knocking off
  en    2 ep   2 sent  caused motion
  en    3 ep   3 sent  acting on a thing (abstract)
  en    drew nothing     taking time off
  ...
```

The verdicts are unchanged and correct: *tea* is a contest, *milk* a narrow *yes*. What the
lens adds is the shape behind them: *tea* is a change of mind, not a contest of equals; *milk*
really does go back and forth; *jam* has turned once, too recently to say. *cake* shows the case
the store already handles, a crossing the owner's tense marked (`r`).

## References

1. K. R. Haylett, "Geofinitism: Language as a Nonlinear Dynamical System — Attractors, Basins,
   and the Geometry of Understanding," Substack, Jan. 2026.
   <https://kevinhaylett.substack.com/p/geofinitism-language-as-a-nonlinear>
2. F. Takens, "Detecting strange attractors in turbulence," in *Dynamical Systems and
   Turbulence, Warwick 1980*, Lecture Notes in Mathematics 898, Springer, 1981, pp. 366–381.
3. T. Sauer, J. A. Yorke, M. Casdagli, "Embedology," *J. Stat. Phys.* 65 (1991) 579–616.
4. K. Friston, "The free-energy principle: a unified brain theory?" *Nat. Rev. Neurosci.* 11
   (2010) 127–138.
5. A. E. Goldberg, *Constructions: A Construction Grammar Approach to Argument Structure*,
   University of Chicago Press, 1995. (Background for TTG-RFC-0006.)
