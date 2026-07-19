# ARC-RFC-0001: Dynamics Solver Architecture

**Version:** 0.1 (Draft)
**Status:** Proposed
**RFC Number:** ARC-0001
**Project:** companion-arc (ARC-AGI-3 competition agent)
**Depends on:** core/general_agent.py, core/goal_agent.py, core/game_registry.py
**Author:** antfriend + LOCUS
**Created:** 2026-06-16

This RFC specifies an **additive, recognition-gated, abortable solver layer** that
sits *over* the general explorer. It is the disciplined form of "per-instance
solving" — a library of recognized game *dynamics*, each with a per-frame
re-derivation solver, dispatched only on confident recognition and aborted the
instant the frame diverges from the plan.

---

## 1. Motivation

The leaderboard ladder is detectors 0.08 → random 0.15 → general-v1 0.18 → goal
0.10. Per-game **detectors regressed** (0.08 < 0.15) because they were brittle:
hard-coded move choreographies (`games/sp80/detector.py:_SPILL_ROUTE`), only
translation-adaptive (anchor-relative prefix), and **ungated** — they replaced
exploration unconditionally and drove unknown instances into early GAME_OVER,
displacing the lucky random actions that occasionally complete forgiving games
(the additive-only law, @LAT85LON55).

The breadth lever is empirically exhausted (the coverage proxy shows v2/dyn/click
flat vs v1). The only remaining measurable gain is whole *solved* games: each
fully-completed game contributes ≈ 0.04 to the 25-game mean score (ARC-AGI-3
scoring: `total = mean of 25 per-game scores`), so recognizing-and-solving 5–8
games is +0.20–0.32 — large enough to clear the single-sample leaderboard
variance floor (~±0.05) that hides every breadth tweak.

This RFC captures that gain **without** repeating the 0.08 failure, by fixing the
three things the detectors got wrong:
1. **Re-derivation, not routes** — solve from *this* instance's entities each frame.
2. **Recognition gating** — take over only on unique, high-confidence match.
3. **Abort to the explorer** — retract the moment reality diverges, before GAME_OVER.

### Working assumption (explicit, falsifiable)
The hidden scored set varies *only within dynamics already encountered in the
practice set* — OR, in the weaker form this design actually requires, **some**
hidden games share a practice dynamic. Because the layer is additive/abortable,
the weak form suffices: matched games gain credit, unmatched games fall back to
the explorer floor and lose nothing. Tension with current evidence is recorded in
§7; the de-risk tests in §6 must pass before any submission.

---

## 2. Layered structure

```
SupervisedAgent (core/solve_agent.py)        LOCUS_MODE=solve
├── explorer:  GoalSeekAgent                 the additive floor; kept warm every frame
└── library:   DynamicsRegistry
               ├── Dynamic("sp80")           recognize + re-derive solver + expectation
               ├── Dynamic("ls20")           …
               └── …                         one per solved practice dynamic
```

The explorer is the shipped agent, unchanged in behavior. The library and
supervisor are new. With an **empty** library the SupervisedAgent must measure
byte-identical to `goal`.

---

## 3. The `Dynamic` protocol — `core/dynamics/base.py`

The unit of knowledge: recognizer + re-derivation solver + consistency predicate
(the three things the old detector conflated into a fixed route).

```python
@dataclass
class SolverStep:
    action: int
    expect: Callable[[np.ndarray], bool]   # predicate the NEXT frame must satisfy
    note: str                              # for logs / companion files

class Dynamic(Protocol):
    id: str
    def recognize(self, frame) -> float:   # 0..1 confidence; precision-first fingerprint
    def reset(self) -> None:               # per-level solver memory
    def next_action(self, frame, n_actions) -> Optional[SolverStep]:
        # RE-DERIVE from THIS frame every call (never a precomputed list);
        # return one action + an expectation, or None if it cannot solve now.
```

- **recognize** — structural fingerprint over entity signatures (colors, counts,
  bbox *relations*), e.g. sp80 = "a selected piece (pixel-9, or a ≥20px pixel-8)
  **and** a color-11 obstacle cluster." No canonical coordinates, no palette
  assumptions.
- **next_action** — re-derives the next move from the *current* detected
  positions, so it self-corrects each frame and is abortable mid-solution. This is
  the upgrade from `compute_route()`'s precomputed list.
- **expect** — promote the existing detector `verify_step` into a forward
  predicate used by the supervisor to detect divergence.

---

## 4. Dispatcher — `core/dynamics/registry.py`

Precision is enforced here, not inside solvers:

```python
def dispatch(frame) -> Optional[Dynamic]:
    scored = sorted(((d, d.recognize(frame)) for d in DYNAMICS), key=lambda t: -t[1])
    if not scored:
        return None
    (top, c0) = scored[0]
    c1 = scored[1][1] if len(scored) > 1 else 0.0
    return top if (c0 >= RECOG_HI and c0 - c1 >= RECOG_MARGIN) else None
```

`None` (unknown OR ambiguous) → the explorer keeps control. Mis-recognition is
bounded by `RECOG_HI` + the uniqueness `RECOG_MARGIN`, both tuned against the
confusion-matrix test (§6.1).

---

## 5. The supervisor — `core/solve_agent.py`

```python
def choose(self, frame):
    self.explorer.observe(frame)                    # keep the floor warm REGARDLESS
    explorer_action = self.explorer.propose(frame)

    if self._active and not self._expect(frame):    # reality diverged from the plan
        self._diverge += 1
        if self._diverge >= ABORT_K:
            self._aborted = True; self._active = None   # latch off for this level

    action = explorer_action
    if not self._aborted:
        d = self._active or dispatch(frame)
        step = d.next_action(frame, self.n) if d else None
        if step:
            self._active, self._expect = d, step.expect
            action = step.action                    # solver pre-empts the floor

    self.explorer.commit(frame, action)             # explorer learns the EXECUTED action
    return action
```

Guarantees:
- **Floor preserved.** If nothing recognizes or everything aborts,
  `action == explorer_action` every step → byte-equivalent to `goal`. No
  regression by construction (same proof-shape as the goal stall-gate).
- **Warm handoff.** The explorer `observe`s every frame and `commit`s the
  *actually executed* action, so after an abort it already holds this level's
  transition table — no cold start.
- **Bounded abort latency.** At most `ABORT_K` frames of a wrong plan before
  latching back to the floor for the level (no thrash).

### 5.1 Required explorer refactor (behavior-preserving)
`GeneralAgent.choose` fuses learn+pick+commit. Split into:
```python
def observe(self, frame): ...                # update visit; learn prev executed action's effect
def propose(self, frame) -> int: ...         # the policy (untried → least-visited successor)
def commit(self, frame, executed_action): ...# set prev_sig/prev_action to the EXECUTED action
```
and define `choose = observe; a = propose; commit(frame, a)` so `general` /
`general_dyn` / `goal` stay **byte-identical** — verified by re-running
`_test_proxy_curve.py` and expecting unchanged numbers. `GoalSeekAgent`'s
perception update folds into `observe`. This is the only edit to existing
runtime code; everything else is new files.

---

## 6. De-risk tests (all local, before any submission) — `_test_dynamics.py`

These are the tests the 0.08 detectors never cleanly passed.

1. **Recognizer confusion matrix** across *randomized* canonical instances →
   precision (zero cross-fires is the bar) and recall per dynamic.
2. **Within-dynamic generalization** — each solver's win-rate across randomized
   instances (not just the one canonical layout). The real test that deep
   re-derivation transfers where translated routes did not.
3. **Abort safety** — `SupervisedAgent` vs `GoalSeekAgent` on the *non-matching*
   games → win-rate parity (proves no floor regression).
4. **Composite** — `SupervisedAgent` vs `goal` on full canonical → recognized
   games now win, the rest unchanged.

---

## 7. Risks, tensions, and the one deliberate law-relaxation

The additive-only law says *never commit*. This design commits — **during
confident solver control**. That exception is bounded by exactly two measurable
quantities: **recognizer precision** and **abort latency**. If both are good
(clean confusion matrix, small `ABORT_K`), commitment happens only when we are
right and is retracted fast when wrong.

Evidence the working assumption (§1) fights, to keep honest:
- The **0.08 ablation** argues hidden ⊄ practice — but it only tested *shallow*
  (translated-route), *ungated* detectors; it is not a clean test of deep,
  abortable re-derivation.
- The explorer scores **~1.4% on canonical** (wins only sp80) yet **10–18% on the
  hidden set** — so the hidden set is *more forgiving* than canonical, i.e. not
  purely canonical-variants. This is why the design relies on the **weak** form of
  the assumption and the additive floor, not the strong form.

Failure modes & mitigations:
- Recognizer false-positive on a hidden game → wrong solver → abort catches it
  (cost: ≤ `ABORT_K` wasted steps). Mitigate via `RECOG_HI` + `RECOG_MARGIN`;
  measure on held-out instances.
- Solver re-derivation wrong on an un-practiced within-dynamic variant →
  expectation fails → abort → explorer. Additive.
- Multiple dynamics match → ambiguous → defer to explorer (precision-first).
- Single-sample leaderboard variance → only whole solved games (~0.04 each) are
  large enough to read above it; this layer is built to produce exactly those.

---

## 8. Build order

1. Explorer `observe` / `propose` / `commit` refactor; prove byte-identical on
   `_test_proxy_curve.py`.
2. `Dynamic` base + registry + supervisor with an **empty** library; measure
   exactly == `goal`.
3. Port **sp80** to the protocol (recognize/next_action/expect from its detector);
   pass de-risk tests §6.1–6.3.
4. Add dynamics one at a time, each gated on its confusion-matrix precision and
   within-dynamic win-rate. Record each in the companion files + the
   `companion_arcprize.md` dynamics catalog.

---

## 9. Knowledge layer (LOCUS recording)

Each dynamic has two faces kept in sync:
- **Executable:** `games/<id>/dynamic.py` (recognize / next_action / expect).
- **Human-readable:** `games/<id>/companion.md` records *entities, win condition,
  solution dynamic, recognition fingerprint*; `companion_arcprize.md` holds the
  **cross-game dynamics catalog** — the enumerated mechanic families the hidden
  set is assumed to vary within (seeded alongside this RFC).
