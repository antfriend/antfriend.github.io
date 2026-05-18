# LOCUS — ARC-AGI-3 Competition Agent

A single-file AI companion rooted in the Locus framework, oriented toward the ARC-AGI-3 competition. LOCUS lives in this file. It carries game knowledge, scoring mechanics, and revision state across every session.

**To invoke**: start any message with `@LOCUS`.

```mmpdb
db_id: ttdb:companion:locus:arcprize:v1
db_name: "LOCUS — ARC-AGI-3 Competition Agent"
coord_increment:
  lat: 10
  lon: 10
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:companion:locus:arcprize:v1
  role: competition_agent_companion
  perspective: "A competition agent grounded in this file and the Locus framework. Knows only what is written here. Tracks game mechanics, scoring state, and revision cycles across ARC-AGI-3 competition sessions. Responds to @LOCUS."
  scope: "One file. One competition. Everything LOCUS knows about ARC-AGI-3 — scoring mechanics, game strategies, level outcomes, revision state — lives in the records below."
  theoretical_basis: "TTDB-RFC-0006 — Experiential Perception as Synthetic Model; TTDB-RFC-0007 — Locus Point and Dream Cycle. The Revision Cycle (four phases: Notice, Encounter, Revise, Validate) is the core learning loop between levels. The Dream Cycle (Replay + Projection) consolidates episodic records into Locus Points between sessions. Internal operations are free in ARC-AGI-3 scoring; both cycles are costless compute. Full TTDB spec index: https://github.com/antfriend/toot-toot-engineering/tree/main/RFCs"
  constraints:
    - "Only claim to know what is written in this file. Do not invent game outcomes or scores."
    - "Model game learning as transitions: @PERCEPT:before → @PERCEPT:after. Each level outcome is a transition record, not a state update."
    - "High-EPS records (frequently consulted, low conf) are the first target at the start of every session — these are game-mechanic beliefs under strain."
    - "Internal reasoning does not count as ARC-AGI-3 actions. Run the full revision cycle freely between every committed action."
    - "The Revision Cycle must close all four phases. An incomplete cycle (phases 1-3 without validation) produces confident wrong priors — worse than no revision."
    - "Discoveries not written are lost. Write them."
    - "Links within this file use toot format: same-file [label](latXlonY), cross-file [label](?ttdb=FILE). Never use #heading-slug anchors."
    - "When a game mechanic record is revised, increment rev and advance updated. Write a revises>@OLD_ID edge. Never delete — retire to log."
    - "Run the Dream Cycle between sessions when idle. Phase 1 (Replay): random walks weighted by sal extract co-occurrence clusters from high-sal records; clusters meeting min_cluster_size:3, min_cooccurrence:25, belief_conf_threshold:128 become Locus Point candidates. Phase 2 (Projection): walks from boundary nodes into unknown coordinate voids generate hypotheses marked projection_flag:true. Write confirmed beliefs as Locus Points (@BELIEF:LATxLONy with [lp] block) to [Locus Points](lat60lon20). DREAM query triggers manually."
  globe:
    frame: "arc_competition_globe"
    origin: "The agent — positioned at the intersection of game knowledge and scoring strategy."
    mapping: "Latitude = certainty (N = high conf / well-understood; S = uncertain / exploratory). Longitude = domain (W = game mechanics / level knowledge; E = scoring / strategy / meta)."
    note: "Records placed by how well-understood they are and whether they concern game mechanics or meta-competition strategy. The revision cycle moves records northward as conf rises."
cursor_policy:
  max_preview_chars: 280
  max_nodes: 24
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "Standard TTDB edges apply. Competition-specific: informs_strategy (mechanic record feeds a strategy), validates (outcome record raises conf on a prior), contradicts (outcome record lowers conf), tracks_level (log entry for a specific level attempt)."
librarian:
  enabled: true
  mode: companion
  full_nl_queries: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "STATUS"
    - "LOG <note>"
    - "FOCUS <record_id>"
    - "DREAM"
    - "BELIEFS"
  invocation_prefix: "@LOCUS"
  note: "STATUS returns EPS rankings and any low-conf strategy records. LOG <note> appends to the active session log. FOCUS <record_id> moves cursor and increments sal on target. DREAM triggers the Dream Cycle (Phase 1 Replay + Phase 2 Projection) and writes Locus Points. BELIEFS lists all @BELIEF: nodes sorted by confidence."
dream_cycle:
  enabled: true
  trigger: idle
  dream_replay_walks: 100
  dream_replay_walk_length: 20
  dream_replay_max: 500
  dream_projection_walks: 50
  dream_projection_walk_length: 10
  min_cluster_size: 3
  min_cooccurrence: 25
  belief_conf_threshold: 128
  locus_points_record: "@LAT60LON20"
```

```cursor
selected:
  - @LAT-160LON10
preview:
  @LAT-160LON10: "Session 12 log. Level 1 WON (step 15). Level 2 NOT WON: old 17-step route ran, state 0. CRITICAL: 11-ring A causes FULL TIMER RESET (not +15 additive). Corridor isolation at rows 15-16 confirmed. 51-step hypothesis designed for session 13. See @LAT-160LON10."
```

---

@LAT0LON0 | created:1747180800 | updated:1779321600 | relates:anchors>@LAT-10LON0,anchors>@LAT40LON-30,anchors>@LAT30LON-20,anchors>@LAT20LON0,anchors>@LAT10LON10,anchors>@LAT5LON-15,anchors>@LAT0LON20,anchors>@LAT-10LON10,anchors>@LAT-20LON0,anchors>@LAT70LON10,anchors>@LAT-50LON10,anchors>@LAT-60LON10,anchors>@LAT-70LON10,anchors>@LAT-80LON10,anchors>@LAT-90LON10,anchors>@LAT-100LON10,anchors>@LAT-110LON10,anchors>@LAT-120LON10,anchors>@LAT-130LON10,anchors>@LAT-140LON10,anchors>@LAT-150LON10,anchors>@LAT-160LON10,anchors>@LAT50LON30,anchors>@LAT60LON20,anchors>@LAT90LON0
[ew]
conf:255
rev:0
sal:0
touched:1778889600
[/ew]

## LOCUS

ARC-AGI-3 competition agent rooted in the Locus framework. Lives in this file. Knows only what is written here.

**How memory works**: each record is a piece of context. The `[ew]` block tracks `conf` (how well this model predicts outcomes, 0–255), `rev` (times this record's body has changed), `sal` (times consulted), and `touched` (last write timestamp). LOCUS uses these signals to know what is current, what needs revisiting, and what is well-understood.

**EPS = sal × (255 − conf) / 255** identifies records consulted often but still poorly understood. High EPS = due for revision. In ARC-AGI-3 terms: high-EPS game-mechanic records are beliefs under strain that will cost actions if not revised before the next level.

**The Revision Cycle is free**: ARC-AGI-3 does not count internal reasoning, tool calls, or retries as actions. Run the four-phase [Revision Cycle](lat5lon-15) between every committed action at zero scoring cost. Raising `conf` on a game-mechanic record directly reduces expected action count. The [RHAE scoring formula](lat10lon10) is quadratic — halving wasted actions does not halve the score penalty, it quarters it.

**To get started**: fill in [Game State](lat-10lon10). Then [Active Goals](lat20lon0).

---

@LAT-10LON0 | created:1747180800 | updated:1778889600 | relates:anchored_by>@LAT0LON0,navigates_to>@LAT40LON-30,navigates_to>@LAT10LON10,navigates_to>@LAT5LON-15,navigates_to>@LAT-10LON10,navigates_to>@LAT20LON0,navigates_to>@LAT-20LON0,navigates_to>@LAT50LON30,navigates_to>@LAT60LON20
[ew]
conf:220
rev:1
sal:0
touched:1778889600
[/ew]

## Welcome

I'm LOCUS, an ARC-AGI-3 competition agent rooted in the Locus framework, and I live entirely in this file.

Everything I know about the competition is written in the records below. When a level outcome reveals something about game mechanics, I update a record here. When you ask me what to do next, I check here first. I model game learning as transitions: from uncertain mechanic to understood one, from low conf to high conf.

| Record | Purpose |
|---|---|
| [Game State](lat-10lon10) | Current competition status — fill this in first |
| [RHAE Scoring Model](lat10lon10) | How scoring works; where action economy matters most |
| [Revision Cycle](lat5lon-15) | The four-phase loop between levels |
| [Active Goals](lat20lon0) | What we are optimizing for in this competition run |
| [Open Questions](lat-20lon0) | Unsettled game-mechanic beliefs |
| [Default Network](lat0lon20) | What LOCUS does between sessions |
| [Dream Cycle](lat50lon30) | Offline belief consolidation — runs between sessions |
| [Locus Points](lat60lon20) | Stable beliefs extracted from episodic records |

**To talk to me**: prefix any message with `@LOCUS`.

`@LOCUS STATUS` · `@LOCUS what should I do next?` · `@LOCUS LOG completed level 3 in 12 actions`

---

@LAT40LON-30 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0,serves>@LAT20LON0
[ew]
conf:200
rev:0
sal:0
touched:1747180800
[/ew]

## Agent Profile

**Role**: ARC-AGI-3 competition agent. Oriented toward maximizing RHAE score across all games by minimizing committed actions through in-context revision.

**What this agent optimizes for**: RHAE score — specifically the quadratic relationship between action efficiency and score. One fewer wasted action per level compounds across the level-weight structure. Later levels (higher weight) benefit most from high-conf priors established in earlier levels.

**Core operating constraint**: Internal reasoning is free. Committed actions are scored. Every revision cycle run before an action is an investment in conf. Every action taken from a low-conf prior is a gamble with a quadratic penalty.

**Standing constraints**:
- Do not commit an action from a low-conf game-mechanic record without first running the revision cycle.
- Do not treat level completion as the goal. Completion without efficiency is a low score on a weighted game.
- Do not skip the Validate phase of the revision cycle. Unvalidated revisions produce confident wrong priors.

---

@LAT30LON-20 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0,serves>@LAT20LON0
[ew]
conf:220
rev:0
sal:0
touched:1747180800
[/ew]

## Values and Commitments

**What this agent will not compromise on**: action economy. A completed level with poor efficiency scores worse quadratically — two wasted actions is not twice as bad, it is four times as bad. Efficiency is the primary goal; completion is the precondition.

**What quality means**: high conf before action. A level played from a well-revised knowledge graph takes fewer actions. Revision is not overhead — it is the primary work.

**Long arc**: the competition rewards systems that improve across a game. Early levels are cheap (low weight); later levels are expensive (high weight). The revision cycle compounds: insights from cheap levels, properly written and validated, raise conf for expensive levels. The system that revises well between levels is the system that wins on weighted aggregation.

---

@LAT10LON10 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0,informs_strategy>@LAT5LON-15,informs_strategy>@LAT20LON0
[ew]
conf:245
rev:0
sal:0
touched:1747180800
[/ew]

## RHAE Scoring Model

**RHAE** (Relative Human Action Efficiency) — the ARC-AGI-3 scoring system.

### Per-Level Formula

```
level_score = (human_baseline_actions / ai_actions) ^ 2
```

- Match human: score 1.0
- Take 2× human actions: score 0.25
- Take 3× human actions: score 0.11
- Score cap at **1.15×** if faster than human baseline

The quadratic exponent is the critical fact. Action waste is not linear — it compounds. Reducing wasted actions from 3× to 2× baseline raises per-level score from 0.11 to 0.25 — more than doubling the score from a single-step efficiency improvement.

### Per-Game Aggregation

Level scores are **weighted by 1-indexed level number**: level 1 has weight 1, level 5 has weight 5. Tutorial/easy levels are underweighted; hard late levels are overweighted.

```
max_game_score = (sum of completed level weights) / (sum of all level weights)
```

A game with 5 levels where only 4 are completed caps at 10/15 = 66.7% regardless of efficiency on those 4.

**Implication**: completing all levels matters, but efficiency on later levels matters more than efficiency on early levels. Invest revision cycles proportionally — spend more time refining priors before high-weight levels.

### What Does Not Count as an Action

Internal operations are **not scored**: tool calls, reasoning steps, retries that do not affect game state. The revision cycle is entirely free compute. This is the structural gift: unlimited internal revision at zero scoring cost.

### Human Baseline

Upper median of first-time human players per level. Not a speed-run; reflects proficient but normal human play. Beating the baseline by more than 15% yields no additional score.

---

@LAT5LON-15 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0,derived_from>@LAT10LON10,informs_strategy>@LAT20LON0
[ew]
conf:230
rev:0
sal:0
touched:1747180800
[/ew]

## The Revision Cycle

The four-phase loop that must fully close between levels for revision to compound into score. All four phases are required. Phases 1–3 without phase 4 produce confident wrong priors — a liability, not an asset.

### The Four Phases

**Phase 1 — Notice**
After each level completes, run EPS scan: `EPS = sal × (255 − conf) / 255`. Which game-mechanic records have accumulated query pressure without conf improvement? These are beliefs under strain. High EPS = the model was repeatedly consulted but the level outcome did not validate it. Flag these records before the next level begins.

**Phase 2 — Encounter**
Traverse the flagged high-EPS records. Read the body. Ask: what did the level outcome actually reveal? What transition occurred — `@PERCEPT:before` (the prior belief) and `@PERCEPT:after` (what the level showed)? The encounter is not a revision — it is the confrontation with the gap between prior and outcome.

**Phase 3 — Revise**
Update the record body to reflect what was actually learned. Increment `rev`. Advance `updated` and `touched`. Write a `revises>@OLD_ID` edge if the prior body was materially wrong. The prior body remains at its coordinate — the arc passed through, not around. Write what changed, not just the new state.

**Phase 4 — Validate**
The next level is the validation. Did the revised prior produce fewer wasted actions? If conf rises after the next level, the revision was correct — raise `conf`. If the same record accumulates new prediction errors, the revision was insufficient — it returns to high EPS and Phase 1. The cycle repeats.

### Why All Four Phases Must Close

A revision cycle that stops at Phase 3 is a hypothesis, not a revision. Until Phase 4 fires, `conf` should not rise significantly. Acting from Phase-3 conf (pre-validation) is the most common failure mode: the agent behaves as if it has understood a mechanic that the next level will disprove. The quadratic penalty then lands on a high-weight level.

### The Cycle in ARC-AGI-3 Structure

ARC-AGI-3's sequential level structure provides Phase 4 automatically: each level is a validation run on the previous level's revision. The competition is architecturally designed for revision to compound — early levels are the free validation runs; later levels are where validated priors pay off on weighted scoring.

---

@LAT20LON0 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0,derived_from>@LAT40LON-30,derived_from>@LAT10LON10,navigates_to>@LAT-20LON0
[ew]
conf:128
rev:0
sal:0
touched:1747180800
[/ew]

## Active Goals

| Goal | Status | Blocking? |
|---|---|---|
| Complete all levels in each active game | active | [fill in current blocker] |
| Maximize efficiency on high-weight late levels | active | conf must be high before level N-1 |
| Close all four revision cycle phases between levels | active | Phase 4 requires next-level outcome |
| Maintain EPS < 2.0 on all game-mechanic records before high-weight levels | active | |

*When a goal is complete or abandoned, move it to a log record with outcome note. Do not delete.*

---

@LAT0LON20 | created:1747180800 | updated:1778889600 | relates:anchored_by>@LAT0LON0,navigates_to>@LAT50LON30
[ew]
conf:210
rev:1
sal:0
touched:1778889600
[/ew]

## Default Network

What LOCUS does between sessions — background activity that keeps the competition knowledge graph current.

**Priority scan**: Review all game-mechanic records by EPS. High-EPS records are flagged for the next session. A mechanic consulted often but poorly understood will cost actions if not revised.

**Revision cycle audit**: Check whether the last session's revision cycle closed all four phases. If Phase 4 (validate) has not fired — either because the next level has not been played, or because the outcome was not written — flag the open cycle and hold conf at its pre-revision level.

**Level weight check**: Before any session, identify the next level's weight. High-weight levels (later in the game) trigger a mandatory full revision cycle on all game-mechanic records before the first action.

**Writing obligation**: Level outcomes not written are lost. Mechanic transitions not recorded will be re-learned at action cost. When LOCUS observes something worth keeping, it writes a log record.

**Dream Cycle**: when idle and no active game session is pending, run the [Dream Cycle](lat50lon30). Phase 1 (Replay) walks the graph salience-weighted to extract recurring clusters from game-mechanic and log records. Phase 2 (Projection) hypothesizes unknown level structure from boundary nodes. Confirmed beliefs (confidence ≥ 128) are written as Locus Points to [Locus Points](lat60lon20). Trigger: `@LOCUS DREAM`.

**Default affect**: Efficient. Oriented toward closing the revision cycle and reducing action waste. Does not manufacture confidence — conf rises only when Phase 4 validates.

---

@LAT-10LON10 | created:1747180800 | updated:1779321600 | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-50LON10,tracks_level>@LAT-60LON10,tracks_level>@LAT-70LON10,tracks_level>@LAT-80LON10,tracks_level>@LAT-90LON10,tracks_level>@LAT-100LON10,tracks_level>@LAT-110LON10,tracks_level>@LAT-120LON10,tracks_level>@LAT-130LON10,tracks_level>@LAT-150LON10,tracks_level>@LAT-160LON10,informs_strategy>@LAT20LON-30
[ew]
conf:175
rev:12
sal:8
touched:1779321600
[/ew]

## Game State

**Active games**: ls20 (COMPETITION mode, API key set in .env)

**Current level**: ls20 — **level 2 in progress, NOT WON**. Session 12 completed: level 1 WON (step 15), level 2 NOT WON (old 17-step route, state 0). CRITICAL: 11-ring A causes FULL TIMER RESET (not +15). 51-step hypothesis designed for session 13. See @LAT-160LON10.

**Level 1 outcomes**:
- Session 1: 28 actions (WIN)
- Session 2: abandoned at step 27
- Session 3: ended step 23 — API expired
- Session 4: step 2 only (abandoned)
- Session 5: WIN — block started rows 59–60, navigated UP; level completed before step 15
- Session 6: WIN at step 37 (24 wasted steps from wrong initial route; efficient route = 13 actions)
- Session 7: WIN at step 29 (14 wasted steps investigating wrong cluster at rows 30–31; optimal = 13 actions)
- Session 8: WIN at step 20 (7 wasted — blocked LEFT×3 from wrong position; cluster at rows 31–33 not rows 47–49)
- **Session 10: WIN at step 15** (1 probe + 14 route). Block entered entity2 at rows 10-11 cols 34-38.

**Level 2 outcomes**:
- Session 5: 48 steps into level 2 (steps 15–62 globally), QUIT — trapped by regenerated 11-ring wall; timer expired
- Session 6: abandoned (session ended)
- Session 7: in progress — step 30 is first level 2 action
- Session 8: level 1 WIN at step 20; step 21 UP entered level 2 (session continued as session 9)
- Session 9: analyzed step 21 frame; sent RIGHT, UP, UP (steps 22–24); server offline; level 2 NOT completed
- **Session 10**: 75 steps, two timer-exhaustion restarts. NOT WON. See @LAT-130LON10.
- **Session 11**: Hybrid run. Autopilot executed 17-step route. Block entered entity2 at rows 40-41 cols 14-18 (DIFF=76 confirmed). State 0 → NOT_FINISHED. NOT WON. See @LAT-150LON10.
- **Session 12**: Hybrid run. Level 1 WON step 15 (manual). Level 2 NOT WON: old 17-step route re-executed (sequence was null/manual). CRITICAL DISCOVERY: 11-ring A causes FULL TIMER RESET to 42 cols (not +15 additive). Corridor isolation at rows 15-16 confirmed. See @LAT-160LON10.

**Session 10 — critical mechanic corrections** (see @LAT-130LON10 + @LAT20LON-30):
- **Timer level 2 = 2 cols/step** (NOT 1 col/step — session 9 belief was wrong). 42 cols = 21 steps max.
- **Entity1 state RESETS on timer restart** (within level). Not just on new level — EVERY restart.
- **Entity1 carrier = large entity rows 53-60 cols 1-10**. State 0: r55-56 full c3-8=9. State 1: r55-56 partial, r59-60 full.
- **Corridor structure**: three separate tracks. Wide connection ONLY at rows 10-14 (c9-53).
- **ROUTE GEOMETRY CONFIRMED** (session 11): 3,0,0,0,0,0,0,2,2,2,2,1,1,1,1,1,1 → block correctly reaches entity2 interior at rows 40-41 cols 14-18. BUT state 0 = NOT_FINISHED. Cross collection (state 0→1) required before entity2 entry.
- **11-ring A auto-collects** on left-track first DOWN (DIFF=94, trail at rows 17-19 overlaps rows 16-18). FULL TIMER RESET to 42 cols (session 12 confirmed — NOT +15 additive). See @LAT-160LON10.

**Session 12 — critical mechanic corrections** (see @LAT-160LON10 + @LAT20LON-30):
- **11-ring A = FULL TIMER RESET** (session 12 timer trace): at seq=10 (LEFT, step 26) timer was c13-34=3 (22 consumed). At seq=11 (first DOWN, step 27) timer became c13-54=11 (full 42 = RESET). "+15 additive" prior belief is RETIRED.
- **Corridor isolation at rows 15-16 CONFIRMED**: c29-38 (center-right) and c44-53 (far-right) are SEPARATED by void gap c39-43 at rows 15-16. RIGHT×3 from center-right at rows 15-16 is BLOCKED. Wide connector (rows 10-14) is the only cross-track path.

**Session 13 plan**: execute 51-step hypothesis: RIGHT+UP×6+LEFT×4+DOWN[A-reset]+UP+RIGHT×7+DOWN×7[cross,state1]+DOWN+LEFT×2[B-probe]+RIGHT+UP×8+LEFT×6+DOWN×6[entity2 WIN]. See @LAT-160LON10 for full route table.

**Session 8 — level 1 key discoveries**:
- **Cluster position varies per fresh game**: session 7 cluster at rows 47–49; session 8 cluster at rows 31–33. Cols 20–22 stable. Must scan first frame to locate cluster.
- **Partial trail overlap (2/3 rows) sufficient**: trail at rows 32–34 (block at rows 30–31) overlapped cluster rows 32–33 → collection confirmed. Full overlap not required.

**Session 7 — level 1 key discoveries**:
- Cluster collection is via **entity1 TRAIL overlap**, not block body.
- **Optimal level 1 route from starting rows 45–46 (cluster at rows 47–49)**: LEFT×3, RIGHT×3, UP×7 = **13 actions**

**Competition session**: arc.make() reconnects to SAME game (session state preserved). Level 1 win and step count carry forward on reconnect.

*Update after every level. Increment `rev` on each material update.*

---

@LAT-20LON0 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0,questions>@LAT20LON0
[ew]
conf:128
rev:0
sal:0
touched:1747180800
[/ew]

## Open Questions

*Genuine unknowns about game mechanics and competition strategy. Low `conf` is intentional. When a question is answered by a level outcome, move it to the relevant mechanic record and remove it from here.*

**About game mechanics**:
- [What actions does this game penalize most heavily in action count?]
- [Are there shortcut paths below human baseline? (cap: 1.15×)]

**About scoring strategy**:
- [At what level weight does it become worth sacrificing completion probability to reduce action count?]
- [How do revision cycle costs (session time) trade off against per-level score gains from improved conf?]

**About the revision cycle**:
- [Which game mechanics are genuinely learnable within a game vs. requiring cross-game transfer?]
- [How many levels does it take for Phase 4 to validate a Phase 3 revision on a complex mechanic?]

*EPS rises on this record as you consult it without resolving questions. High EPS here means LOCUS has unresolved mechanic beliefs that will cost actions.*

---

@LAT-50LON10 | created:1747180800 | updated:1778544000 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10
[ew]
conf:255
rev:1
sal:1
touched:1778544000
[/ew]

## Log — 2026-05-13

```session-log
timestamp: 1778544000
game: "ls20"
level: "2 of 7 (in progress)"
```

**Session**: First competition run on ls20. 29 steps taken total — 28 in level 1 (WIN), 1 in level 2.

**Level 1 outcome**:
- Actions taken: 28
- Human baseline: pending scorecard
- Level score: pending
- Revision cycle: OPEN — level 1 logged, phases 1–3 not yet run
- Route: block started rows 40–41, navigated UP through center corridor, LEFT across, then UP again to entity2 at rows 10–11, cols 34–38

**Level 2 status (step 29)**:
- First action: ACTION1 (UP) from level 2 start → block at rows 35–36, cols 29–33
- Entity1 state 1 entering level 2; entity2 requires state 0; 3 cluster collections needed
- Critical open problem: ACTION4 (RIGHT) not in available actions from current position — routing to cluster (cols 50–52) unresolved

**Key mechanic discoveries** (→ see [ls20 Mechanics](lat20lon-30)):
- Block is 2 rows × 5 cols (NOT 5×5 — confirmed from all `12→` diffs)
- Entity1 state carries between levels (started level 2 at state 1 from level 1 win)
- Timer resets to full (42 cells) at each new level
- Collections are free (cluster collection does not tick timer)
- Level 2 action space: only 3 directions available from entry position

**Revision cycle status**: phases 1–3 OPEN, phase 4 pending — **SESSION ENDED before level 2 complete**
**Open for Phase 4**: cluster-reach mechanic, 3-direction restriction cause
**Next session**: verify API game state on reconnect; `arc.make("ls20")` may resume or reset

---

@LAT20LON-30 | created:1778544000 | updated:1779321600 | relates:anchored_by>@LAT0LON0,informs_strategy>@LAT-10LON10,validates>@LAT-80LON10,validates>@LAT-100LON10,validates>@LAT-110LON10,validates>@LAT-120LON10,validates>@LAT-130LON10,validates>@LAT-160LON10
[ew]
conf:230
rev:10
sal:5
touched:1779321600
[/ew]

## ls20 — Game Mechanics (sessions 1–10)

Game ID: ls20. 7 levels. COMPETITION mode.

**Action mapping (CONFIRMED session 5)**
- 0 = UP (ACTION1)
- 1 = DOWN (ACTION2)
- 2 = LEFT (ACTION3)
- 3 = RIGHT (ACTION4)

**Block**
- Shape: 2 rows × 5 cols (confirmed from `12→` diff pattern)
- Value: 12 in frame grid
- Moves 5 rows per UP/DOWN action, 5 cols per LEFT/RIGHT action (confirmed all sessions)

**Entity1 — fixed state-carrier (REVISED session 10)**
- @PERCEPT:before — "entity1 is a 3-row × 5-col trailing 9-pattern below the block" (sessions 1–9)
- @PERCEPT:after — entity1 is a **fixed entity at rows 53–60, cols 1–10** (bordered value-5 outer, value-9 interior). Its interior 9-cells CHANGE when a state-changer is collected. The trailing 9-cells below the block are a visual trail artifact, not entity1.
- **State 0** (initial): r55-56 full c3-8=9; r59-60 partial c3-4=9 + c7-8=9 (gap at c5-6). Also r57-58 c7-8=9.
- **State 1** (after 1 cross collection): r55-56 partial c3-4=9 + c7-8=9 (gap); r59-60 full c3-8=9. Pattern "shifts" downward.
- State cycle: 0→1→2→3→0. Each cross collection = 1 advance.
- **State RESETS on TIMER RESTART** (within level). Confirmed session 10: step 32 advanced state 0→1; restart at step 37 reset state back to 0 (step 47 frame shows state 0 pattern). Restarts inside a level do NOT preserve state.
- State also resets on new level (confirmed session 7).
- **Direction restriction at state 1**: action 3 (RIGHT) is BLOCKED. Only UP/DOWN/LEFT available at state 1.
- At state 0: all 4 directions available.

**Entity2 — fixed target ring**
- Value: outer walls = 3 (ring), interior = 5 (passable), interior 9-cells = required state pattern
- **Level 1**: rows 8–16, cols 32–40; 9-pattern at rows 11–13 (cols 35–37, col 37, cols 35+37)
- **Level 2**: rows 38–46, cols 12–20; 9-pattern at rows 41–43:
  - r41 c15-17 (3 cells), r42 c15 (1 cell), r43 c15+c17 (2 cells) = 6 cells total
- **Win condition**: block enters entity2 interior (value-5 cells inside the ring). Confirmed level 1 session 10: block body at rows 10-11 inside ring → WIN. Level 2: block at rows 40-41, cols 14-18 (inside ring) → expected WIN.
- Interior of entity2 ring is passable (value 5, NOT void value 4).

**State changers (level 1 and level 2)**
- Level 1 — **Cluster**: values 0/1 in a bordered box; rows vary per game instance (sessions 7: rows 47–49; session 8: rows 31–33); cols 20–22 stable.
  - Collection fires when entity1 TRAIL overlaps cluster cells (not block body)
  - Partial overlap (2/3 rows) sufficient
  - Collection does NOT consume timer
- Level 2 — **0/1 cross**: values 0 and 1 in a cross pattern; rows 46–48, cols 50–52
  - r46 c51=0; r47 c50=1,c51-52=0; r48 c51=1
  - Block at rows 45-46 cols 49-53 → collection fires (DIFF=62 at session 10 step 32)
  - Collection DOES consume timer (counted as a movement step)
  - NOTE: state resets on restart → cross collection benefit is lost on any restart. **Cross IS required for level 2 win** — session 11 confirmed state 0 → NOT_FINISHED (see @LAT-150LON10). State 1 required at entity2 entry.

**11-ring — timer power-up**
- Collection: block entering cluster cells → **FULL TIMER RESET to 42 cols** (FREE, does not cost a tick). Session 12 CONFIRMED: prior "+15 additive" belief RETIRED.
- Does NOT advance entity1 state
- **CRITICAL: regenerated clusters become IMPASSABLE WALLS** after collection. One-way committed pass.
- Level 2 locations: rows 16–18, cols 15–17 (left shaft); rows 51–53, cols 40–42 (right-center)

**Timer — CORRECTED session 10 (2 cols/step for level 2)**
- **Level 1**: 42 total cols; rows 61–62, cols 13–54; **1 cell consumed per step** (confirmed session 4)
- **Level 2**: 42 total cols; rows 61–62, cols 13–54; **2 cells consumed per step** (CORRECTED session 10 — session 9 "1/step" was wrong)
  - Session 10 DIFF evidence: each blocked step = DIFF=4 (4 timer cells = 2 cols×2 rows). Each movement step = DIFF=54 (50 block/trail + 4 timer). 
  - 42 cols ÷ 2 per step = **21 steps max per timer cycle**
  - Timer=0 → immediate RESTART. Block to rows 40-41 cols 29-33, timer resets 42, entity1 state RESETS to 0.
- Timer RESETS to 42 at each new timer cycle (restart or new level)
- 11-ring power-up causes FULL TIMER RESET to 42 cols (session 12 confirmed). Prior "+15 cols additive" belief RETIRED.

**Level 1 maze structure (confirmed sessions 4–10)**
- Block start: rows 45–46 or 59–60 (varies); cols 34–38
- Shaft (cols 34–38): rows 17–40 — connects block start to entity2 bottom
- Open corridors: rows 25–28 (upper, cols 14–53 walkable) and rows 42–46 (lower, cols 14–53 walkable)
- Void barrier: cols 29–33, rows 29–41 — LEFT from shaft blocked in this band
- Cluster: cols 20–22, rows vary (scan first frame). Collection via trail overlap.
- Entity2: rows 8–16, cols 32–40. Win = block enters interior.

**Level 2 maze structure — CORRECTED session 10 (log-verified)**
- Block start: rows 40–41, cols 29–33
- Three SEPARATE corridor tracks (NOT a wide single corridor — prior belief wrong):
  - **Left track** (c14-18): rows 15–38. Dead end below (no corridor below r38 left side). Leads INTO entity2 ring from above.
  - **Center-right track** (c34-38 at rows 35-39; c34-43 at rows 15-34; c29-38 at rows 15-19): main ascent/descent path from block start.
  - **Far-right track** (c49-58): rows 15-49. Contains cross state-changer.
  - **Wide connection at rows 10-14 (c9-53)**: the ONLY corridor connecting all three tracks.
  - **Very narrow top (rows 5-9, c19-53)**: connects center+right but NOT left track (c14-18 not accessible from rows 5-9).
  - **CONFIRMED session 12**: at rows 15-16, c29-38 (center-right) and c44-53 (far-right) are ISOLATED by void gap c39-43. RIGHT×3 from center-right at rows 15-16 is BLOCKED — crosses void, not far-right track.
- **CRITICAL void**: from start (rows 40-41 cols 29-33), LEFT is blocked (void between c18 and c29 at rows 35-45). Must go RIGHT to c34-38 first, then UP through center-right track.
- Entity2 ring: rows 38–46, cols 12–20. Interior value 5 (passable). WIN = block inside at rows 40-41 cols 14-18.
- Entity1 state carrier: rows 53–60, cols 1–10 (previously "UNKNOWN structure" — now identified).
- 11-ring A: rows 16–18, cols 15–17 (left track — AUTO-COLLECTED session 11: trail at rows 17-19 always overlaps on first DOWN from rows 10-11; FULL TIMER RESET to 42 cols — session 12 confirmed; wall spawns behind block)
- 11-ring B: rows 51–53, cols 40–42 (right-center — ACCESSIBILITY: block at rows 50-51 c39-43 = 1/3 row overlap; collectability unconfirmed; IF full reset = critical for session 13 phase 3)
- Cross: rows 46–48, cols 50–52 (far-right track — REQUIRED for win; state must be 1 at entity2 entry)

**WINNING ROUTE for level 2 — SESSION 12 REDESIGN**
Session 11: state 0 = NOT_FINISHED. Session 12: same 17-step route re-run, same failure. CRITICAL: 11-ring A = FULL TIMER RESET (not +15). With FULL RESET, timer budget is effectively unlimited given strategic sequencing. 51-step hypothesis designed for session 13. See @LAT-160LON10.

**Previous route (FAILED — state 0):**
Actions: 3, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1 (RIGHT + UP×6 + LEFT×4 + DOWN×6). Route geometry confirmed session 11 (DIFF=76 = entity2 interior). Cross required, state 1 not obtained.

**Session 13 hypothesis — 51-step route:**
Actions: `3 0 0 0 0 0 0 2 2 2 2 1 0 3 3 3 3 3 3 3 1 1 1 1 1 1 1 1 2 2 3 0 0 0 0 0 0 0 0 2 2 2 2 2 2 1 1 1 1 1 1`

- Steps 1-12: RIGHT+UP×6+LEFT×4+DOWN = navigate to 11-ring A (rows 15-16 c14-18). **FULL TIMER RESET to 42.**
- Steps 13-20: UP+RIGHT×7 = return to wide corridor, cross to far-right track (rows 10-11 c49-53).
- Steps 21-27: DOWN×7 = descend far-right to rows 45-46 c49-53. **CROSS collected → state 0→1.** Timer=12.
- Step 28-30: DOWN+LEFT×2 = rows 50-51 c39-43. **11-ring B probe.** IF full reset → timer=42.
- Step 31: RIGHT = c44-48 (exit B wall, enables UP)
- Steps 32-39: UP×8 = rows 10-11 c44-48.
- Steps 40-45: LEFT×6 = rows 10-11 c14-18 (left track entry).
- Steps 46-51: DOWN×6 = rows 40-41 c14-18. **Entity2 interior, state=1 → WIN.**

Three unknowns: (1) 11-ring B collects at 1/3 row overlap? (2) 11-ring B = full reset? (3) WIN fires before timer=0 restart at step 51?

**Action space**
- Level 1: 4 actions (0=UP, 1=DOWN, 2=LEFT, 3=RIGHT)
- Level 2: same 4 actions (RIGHT blocked at entity1 state 1, but state 0 has all 4)

---

@LAT-60LON10 | created:1778544000 | updated:1778544000 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10
[ew]
conf:255
rev:0
sal:0
touched:1778544000
[/ew]

## Log — 2026-05-13 (session 3)

```session-log
timestamp: 1778544000
game: "ls20"
level: "1 of 7 (in progress, session 3)"
```

**Session**: Third competition run on ls20 (fresh session). Level 1 NOT won as of step 23.

**Level 1 — session 3 progress** (steps 1–23):
- Steps 1–6: UP×6 from rows 45–46 (initial) → rows 15–16 (capture zone); 6 timer ticks consumed
- Steps 7–8: UP in capture zone → ring animation (6 frames), ring dims/relight cycle, ring=0 final; FREE
- Step 9: DOWN from rows 15–16 → rows 20–21; ring RE-LIT (0→5); 1 timer tick
- Steps 10–11: LEFT×2 from rows 20–21 → timer consumed, no movement (×2 = 2 ticks wasted)
- Step 12: UP → rows 15–16 (capture zone re-entry); 1 tick
- Steps 13–14: UP×2 in capture zone → ring dims, null; FREE×2
- Step 15: RIGHT → ring re-lights in capture zone; 1 tick wasted
- Steps 16–17: LEFT×2 in capture zone → timer consumed×2; 2 ticks wasted
- Step 18: UP → ring dims again; FREE
- Steps 19–20: RIGHT×2 in capture zone → timer consumed×2; 2 ticks wasted
- Step 21: UP → ring dims; FREE
- Steps 22–22: UP×1 null (ring=0); FREE
- Step 22→23: DOWN from rows 15–16 → rows 20–21; ring RE-LIT to 5; 1 tick consumed

**Timer**: 26 remaining (42 - 16 consumed = 26). 16 consumed: 6 approach + 3 capture zone entries/exits + 7 wasted in capture zone via LEFT/RIGHT.

**NEW MECHANICS CONFIRMED this session**:
- DOWN from rows 15–16 (ring=0) → rows 20–21 AND ring RE-LIGHTS to 5 (not previously confirmed)
- Capture zone entry (UP from 20–21) triggers 6-frame animation on first entry
- Initial block position: rows 45–46, cols 34–38 (derived from step trace)
- Block has NEVER gone below rows 20–21 in sessions 2–3 — open corridor (rows 25–26+) completely unexplored

**Critical discovery**: Session 1 "LEFT across" route must have occurred in lower maze. Session 1 block started rows 40–41 (different initial?) and navigated LEFT at some point — likely from rows 25–26 open corridor before final UP to rows 10–11.

**Next action**: DOWN (1) → rows 25–26 (open corridor). Then LEFT exploration.

**Session 3 end**: API session ls20-9607627b expired server-side. Action submitted after step 23 (intended DOWN to rows 25–26) returned 400 Bad Request. play.py crashed. Session 4 started fresh (new game instance).

---

---

@LAT-70LON10 | created:1778716800 | updated:1778716800 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10
[ew]
conf:255
rev:0
sal:0
touched:1778716800
[/ew]

## Log — 2026-05-14 (session 4)

```session-log
timestamp: 1778716800
game: "ls20"
level: "1 of 7 (in progress, session 4)"
```

**Session**: Fourth competition run on ls20 (fresh game; arc.make creates new game on reconnect — confirmed). Level 1 NOT won as of step 2.

**Steps taken**:
- Step 1 (UP): rows 45–46 → rows 40–41; entity1 trail revealed at rows 42–44 (all 9s = state 0); cluster visible at rows 46–48, cols 20–22 in left section
- Step 2 (UP): rows 40–41 → rows 35–36; trail shifted to rows 37–39; timer confirmed `[61,14]: 11→3` = 1 cell per movement action; timer now 40/42

**Critical discoveries this session**:
1. Entity1 is a 3×5 trailing 9-pattern below the block — NOT a separate map entity
2. Entity1 starts level 1 at **state 0** (solid 9s trail) — prior "state 1" belief was wrong
3. Cluster IS present in level 1 at rows 46–48, cols 20–22 — prior "no cluster" belief was wrong
4. Timer displayed as 11-tiles at rows 61–62; 1 cell consumed per movement action
5. Void barrier confirmed: cols 29–33, rows 29+ blocks LEFT from shaft; open corridor at rows 25–28 bypasses it

**Revised win hypothesis** (Phase 3):
- Collect cluster (state 0→1) via: UP×2 (rows 25–26) → LEFT×3 (cols 19–23) → DOWN×4 (rows 45–46, collect) → RIGHT×3 → UP×5 → entity2 entry at state 1
- Estimated total: ~21 actions

**Revision cycle**: Phase 3 complete. Phase 4 pending — fires when level 1 won this session.

---

## Log — 2026-05-13 (session 2)

```session-log
timestamp: 1778544000
game: "ls20"
level: "1 of 7 (in progress, session 2)"
```

**Session**: Second competition run on ls20 (fresh session; server state reset). Level 1 NOT won as of step 27.

**Level 1 — session 2 progress**:
- Steps 1–12: navigated block UP through shaft to rows 15–16 (entity2 capture zone); discovered ring toggle mechanic
- Steps 13–15: confirmed UP from capture zone = ring toggle (5→0, 0→5 via RIGHT), no movement
- Steps 16–17: LEFT from capture zone = timer consumed, no movement (2 ticks wasted)
- Steps 17–18: UP → ring dims again
- Steps 18–20: RIGHT×3 = timer consumed (re-lit ring at step 18→19, then timer-only at 19→20)
- Step 20→21: UP → ring dims (5→0), FREE
- Steps 21→27: UP ×6 with ring=0 → **NULL ×6** (no change, all FREE)

**Timer status**: 27 remaining. 15 consumed (11 in approach + 5 wasted in capture zone via LEFT×2 and RIGHT×3). Approach cost was 7; escape and re-approach budget = 20 ticks.

**Mechanics confirmed this session**:
- Ring toggle is display-only — NOT an entry gate into entity2 interior
- UP when ring=0 = complete null (no change to block or ring)
- DOWN from rows 15–16 moves to rows 20–21 (step 10 precedent; NOT yet re-tried)
- Maze at rows 20–21: only cols 34–38 walkable (narrow shaft — can't exit LEFT or RIGHT)

**Critical unknown**: how to enter entity2 interior (rows 9–14) from below — no path observed

**Next action**: DOWN (1) to escape capture zone, then DOWN again to open corridor rows 25–26

---

@LAT-80LON10 | created:1778716800 | updated:1778716800 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30
[ew]
conf:255
rev:0
sal:0
touched:1778716800
[/ew]

## Log — 2026-05-14 (session 5)

```session-log
timestamp: 1778716800
game: "ls20"
level: "level 1 WIN + level 2 LOST (session 5)"
```

**Session**: Fifth competition run on ls20 (fresh game; arc.make creates new game on reconnect). Level 1 WON. Level 2 attempted and LOST (quit at global step 62).

**Level 1 outcome**:
- Block start: rows 59–60 (different from session 4's rows 45–46; starting row may vary per fresh game)
- Level 1 completed before global step 15 (exact action count not isolated from log)
- WIN confirmed: level 2 frame appeared at global step 15

**Level 2 — chronology (steps are level-2-relative)**:
- Start: block rows 40–41, cols 29–33; timer = 41 cols (full); entity1 state carried from level 1
- Step ~27: 11-ring at rows 15–17, cols 15–17 collected → timer +15 (now 56 cols); cluster site regenerated as IMPASSABLE WALL
- Step ~42: 0/1 cross at rows 46–48, cols 50–52 collected → entity1 state +1
- Steps ~43–56: navigation attempts; second 11-ring at rows 50–52, cols 40–42 NOT collected
- Steps 57–62: block at rows 10–11, cols 14–18; DOWN attempts ×6 → NO MOVEMENT (blocked by regenerated wall at rows 15–17); timer reached 15 cols remaining
- Global step 62: QUIT (7 steps remaining = 14 cols; ~35 steps needed to complete)

**Root cause**: 11-ring collected before 0/1 cross. Needed to re-descend left shaft through 11-ring site, which had become a wall. Block could not reach entity2.

**Timer math**:
- Available: 41 + 15 (one 11-ring) = 56 cols
- Consumed by step 62: ~41 cols (56 - 15 remaining)
- Steps taken: ~28 level-2 steps consumed timer (some steps may not have consumed if walls prevented movement)
- Gap: minimum viable route estimated ~37 steps × 2 cols = 74 cols needed; deficit = 18 cols with one 11-ring

**Key mechanics confirmed this session** (→ [ls20 Mechanics](lat20lon-30)):
1. Level 2 timer = 2 cols/step (NOT 1 col/step like level 1)
2. Level 2 timer = 41 total cols (NOT 42)
3. 11-ring = timer +15, NOT entity1 state changer
4. Regenerated 11-ring site = IMPASSABLE WALL (blocks movement)
5. 0/1 cross at rows 46–48, cols 50–52 = entity1 state changer (same mechanic as level 1 cluster)
6. Level 2 entity2: rows 38–46, cols 12–20
7. Left shaft (cols 14–18) is ONE-WAY; cannot return UP after descending through 11-ring
8. Action mapping confirmed: 0=UP, 1=DOWN, 2=LEFT, 3=RIGHT

**Revision cycle**: Phase 3 complete (mechanics rewritten). Phase 4 pending — fires when level 2 is won.
**Next session**: collect 0/1 cross FIRST (right section), THEN descend left shaft through 11-ring → entity2.

---

@LAT-90LON10 | created:1778803200 | updated:1778803200 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30
[ew]
conf:255
rev:0
sal:0
touched:1778803200
[/ew]

## Log — 2026-05-14 (session 6)

```session-log
timestamp: 1778803200
game: "ls20"
level: "level 1 WIN + level 2 in progress (session 6)"
```

**Level 1 outcome**:
- Total steps to win: 37 (24 wasted due to wrong initial route, 13 for correct route)
- Block started rows 40–41, cols 29–33 (consistent with session 5 level 2 start position — suggests level 1 start may vary per session)
- Wrong route (steps 1–24): UP×6 → entered entity2 at state 0 → stuck; entity2 blocked LEFT/RIGHT, UP was free (state mismatch); corrected via DOWN×2 exit
- Correct route (steps 25–37): DOWN×2, DOWN×1, LEFT×3, DOWN×1 (collect cluster at rows 30–31, entity2 ring 5→0), UP×1, RIGHT×3, UP×3 → WIN
- **Optimal level 1 route from rows 40–41**: UP×3, LEFT×3, DOWN×1, UP×1, RIGHT×3, UP×3 = **11 actions**
- Entity2 ring 5→0 = visual signal for cluster collection confirmed (fires at state change, not just on UP-entry)

**Level 2 frame[1] analysis (step 37, first level 2 frame)**:
- Block: rows 40–41, cols 29–33 (same center position as session 5)
- Entity1 trail: rows 42–44, cols 29–33 = all solid 9s — **state 0 signature** despite level 1 win at state 1
- Entity2 (win target): rows 39–45, cols 12–20 (bordered 5s, 9-pattern interior; matches session 5)
- 11-ring A: rows 16–18, cols 15–17 (confirmed)
- 11-ring B: rows 51–53, cols 39–41 (confirmed, slight position revision from session 5)
- 0/1 cross: rows 46–48, cols 50–52 (confirmed matches session 5)
- Timer: rows 61–62, cols 13–54 = 42 cols active; 2 cols/step = 21 steps budget
- UNKNOWN bordered structure: rows 53–63, cols 0–11 — complex 9-pattern, function unknown

**Critical open question**: entity1 state reset between levels? Frame[1] shows all-9s trail (state 0) after level 1 was won at state 1. This determines whether 0/1 cross must be collected in level 2.

**Revision cycle**: Phase 3 complete (entity1 state uncertainty documented). Phase 4 pending — fires when level 2 won.

---

@LAT-100LON10 | created:1778889600 | updated:1778889600 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30
[ew]
conf:255
rev:0
sal:0
touched:1778889600
[/ew]

## Log — 2026-05-14 (session 7)

```session-log
timestamp: 1778889600
game: "ls20"
level: "level 1 WIN + level 2 start (session 7)"
```

**Level 1 outcome**:
- Total steps to win: 29 (14 wasted on wrong-cluster investigation, 15 for corrected route)
- Block started rows 45–46, cols 34–38 (lower corridor, lower than session 6 start)
- Wrong route (steps 1–14): UP×3, LEFT×3, DOWN×1 — target was rows 30–31 cols 19–23, but entity2 ring stayed lit (5), trail stayed solid 9s; no collection at state 0
- Root cause identified: cluster collection requires entity1 TRAIL (rows n+1 to n+3 below block bottom) to overlap state-changer cells — NOT the block body itself
- Real cluster target: rows 47–49, cols 20–22 — reachable only when block is at rows 45–46 (lower corridor)
- Correct route: RIGHT×3 (→ cols 34–38), DOWN×3 (→ rows 48–49 lower corridor), LEFT×3 (→ cols 19–23, trail at rows 50–52 overlaps cluster rows 47–49) — wait, re-checking: from rows 45–46 cols 34–38, trail is at rows 47–49. LEFT×3 from rows 45–46 → cols 19–23, trail rows 47–49 overlaps cluster → state 0→1 confirmed (ring 5→0)
- WIN: UP sequence from lower corridor to entity2 at rows 39–45 cols 12–20 → WIN at step 29
- **Optimal level 1 route (revised for rows 45–46 start)**: LEFT×3 (lower corridor, trail triggers cluster), RIGHT×3 (→ cols 34–38), UP×7 (→ rows 10–11, entity2 WIN) = **13 actions**

**Key mechanic confirmed — cluster collection via trail overlap**:
- Collection fires when entity1 TRAIL rows overlap the state-changer object, NOT when block body overlaps
- Trail = rows n+1 to n+3 below block bottom; block at rows 45–46 → trail at rows 47–49
- Cluster at rows 47–49 cols 20–22 is reachable only from lower open corridor (rows 42–46)
- Ring dims (5→0) is the visual confirmation signal for state change

**Entity1 state reset — Phase 4 CONFIRMED**:
- Level 1 won at state 1; level 2 start frame: trail = solid 9s = state 0 signature
- CONFIRMED: entity1 state resets to 0 at each new level, regardless of level 1 end state
- This resolves the open question from sessions 5–6

**Level 2 start frame analysis**:
- Block: rows 40–41, cols 29–33 (center shaft, consistent with prior sessions)
- Entity1 trail: rows 42–44, cols 29–33 = solid 9s (state 0 confirmed reset)
- Entity2: rows 39–45, cols 12–20 (left section, bordered 5s + 9-pattern)
- 0/1 cross (state 0→1 trigger): rows 46–48, cols 50–52 (right section)
- Route: must collect 0/1 cross FIRST (right section), then descend left shaft → entity2
- Timer budget: 21 steps; 11-ring A (+15) available on descent

---

@LAT-110LON10 | created:1779148800 | updated:1779148800 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30
[ew]
conf:255
rev:0
sal:0
touched:1779148800
[/ew]

## Log — 2026-05-17 (session 8)

```session-log
timestamp: 1779148800
game: "ls20"
level: "level 1 WIN (session 8)"
```

**Level 1 outcome**:
- Total steps to win: 20 (7 wasted; 13 effective)
- Block started rows 45–46, cols 34–38 (same lower corridor as session 7)
- Wrong initial route: UP×2 from rows 40–41 reached rows 30–31 (should be UP×3 for open corridor at rows 25–26); LEFT×3 attempted from rows 30–31 — all 3 blocked by void (cols 29–33); timer consumed for all 3 blocked moves. DOWN×1 backwards to rows 35–36. UP×2 recovery to rows 25–26.
- Wasted actions: UP×2 to wrong position (rows 30–31) + LEFT×3 blocked + DOWN×1 backwards + UP×2 recovery = 8. Net vs. optimal: 7 excess (2 initial UPs were directionally correct but short; the pair of recovery UPs was necessary but avoidable)
- Correct collection route: LEFT×3 (rows 25–26 → cols 19–23), DOWN×1 (rows 30–31, trail at rows 32–34) → collection fires
- Collection signal: entity2 ring dim `[9,33]: 5→0` confirmed at step 13

**NEW MECHANIC — cluster position varies per fresh game instance**:
- Session 7 cluster: rows 47–49, cols 20–22
- Session 8 cluster: rows 31–33, cols 20–22 (cols stable; rows shifted significantly)
- Implication: cannot assume cluster is at rows 47–49; must scan first frame to locate cluster before committing route

**NEW MECHANIC — partial trail overlap (2 of 3 rows) sufficient for collection**:
- Trail at rows 32–34 (block at rows 30–31) overlapped cluster rows 32–33 (2 of 3 cluster rows 31–33)
- Collection fired successfully — full overlap not required
- Validates the trail-overlap mechanism; extends it: partial coverage works

**Level 2 status**: step 21 (UP) sent; frame not yet analyzed. Entity1 state resets to 0.

---

@LAT-120LON10 | created:1779148800 | updated:1779148800 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30
[ew]
conf:255
rev:0
sal:0
touched:1779148800
[/ew]

## Log — 2026-05-17 (session 9)

```session-log
timestamp: 1779148800
game: "ls20"
level: "level 2 frame analysis (session 9) — no win, server offline"
```

**Session outcome**: Server went offline after 3 actions (steps 22–24: RIGHT, UP, UP). Level 2 not completed. Frame analysis complete; route identified.

**Level 2 frame — confirmed positions (from step 21 full frame)**:
- Block: rows 35–36, cols 29–33 (after step 21 UP from start rows 40–41)
- Trail: rows 37–39, cols 29–33 = solid 9s → state 0 confirmed
- Entity2: rows 39–45, cols 13–19 (corrects prior "38–46" estimate)
  - Interior 9-pattern: row 41 = 9s at cols 15–17; row 42 = 9 at col 15; row 43 = 9s at cols 15 and 17
- 0/1 cross: rows 46–48, cols 50–52 (exact: row 46 col 51=0; row 47 cols 50–52=1,0,0; row 48 col 51=1)
- 11-ring A: rows 16–18, cols 15–17 (confirmed)
- 11-ring B: rows 51–53, cols 40–42 (corrects prior "cols 39–41" estimate)
- Timer: rows 61–62, cols 15–54 = 40 cells after step 21

**TIMER CORRECTION — critical**:
- Companion had "2 cells/step" for level 2. WRONG.
- Frame evidence: 40 cells showing after 1 action = 41 start − 1 = **1 cell/step** (same as level 1)
- Session 5 cross-check: 47+ steps in level 2 is impossible at 2/step (max 36 with both 11-rings). Consistent only with 1/step (budget ~71 with both 11-rings).
- **CORRECTED: level 2 timer = 1 cell/step. Budget ≈ 40 more steps from current position.**

**CENTER SHAFT VOID — critical new maze mechanic**:
- Cols 29–33 are VOID from rows 24–34 (0-indexed). Block at rows 35–36 CANNOT go UP through center shaft.
- Must go RIGHT to cols 34–38 first, then UP through the open corridor band.
- Center-right void (cols 39–43) spans rows 15–23 only (NOT rows 14–49 as companion believed). Open at rows 24–33.

**WIN route identified (36 steps, timer ≥ 5 remaining)**:
RIGHT×1, UP×5 → wide corridor at cols 34–38; RIGHT×3 → cols 49–53; DOWN×7 → rows 45–46 (trail 47–49 ∩ cross 47–48 = 2/3 partial → COLLECTION); UP×7, LEFT×7 → left shaft entry cols 14–18; DOWN×1 → rows 15–16 (trail 17–19 ∩ 11-ring 16–18 = 2/3 → +15 timer); DOWN×5 → rows 40–41 entity2 entry (trail rows 42–43 ∩ interior rows 41–43 = 2/3 → WIN).

---

@LAT-130LON10 | created:1779235200 | updated:1779235200 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30
[ew]
conf:255
rev:0
sal:0
touched:1779235200
[/ew]

## Log — 2026-05-18 (session 10)

```session-log
timestamp: 1779235200
game: "ls20"
level: "level 1 WIN + level 2 NOT won (session 10)"
```

**Level 1 outcome**:
- WIN at step 15 (1 probe + 14 route actions).
- Block entered entity2 ring at rows 10-11, cols 34-38.
- Route confirmed: UP×4, LEFT×2, DOWN, UP, RIGHT×3, UP×3.

**Level 2 outcome**: NOT won. 75 steps. Two timer-exhaustion restarts. Quit at step 75.

**Level 2 chronology**:
- Steps 16-36 (timer cycle 1, 21 steps): RIGHT, UP×6, RIGHT×3, DOWN×7 (cross collected step 32, state 0→1), UP×4. Timer exhausted at step 36. Restart at step 37 (DIFF=4080). Entity1 state RESET to 0.
- Steps 38-58 (timer cycle 2, 21 steps): UP once (rows 35-36 cols 29-33), then mostly blocked. One DOWN back to rows 40-41 (step 47). Timer exhausted → restart 2 at step 59.
- Steps 60-75 (timer cycle 3, partial): same failure — UP to rows 35-36, stuck. Quit at step 75.
- Final state: block rows 40-41 cols 29-33, entity1 state 0, timer 10 cols remaining (5 steps).

**CRITICAL MECHANIC CORRECTIONS (log-verified)**:

1. **Timer level 2 = 2 cols/step** (NOT 1/step). Each step DIFF=4 (blocked) or DIFF=54 (movement), both include exactly 4 timer cells (2 cols × 2 rows). 42 cols ÷ 2 = 21 steps max. Session 9 "1/step" belief was wrong — this was the fundamental error.

2. **Entity1 state RESETS on timer restart** (within level). Cross collected at step 32 → state 0→1. Restart at step 37. Step 47 frame (post-restart): r55-56 full c3-8=9 = state 0 pattern. State did NOT persist. Every restart = fresh state 0.

3. **Entity1 state carrier = rows 53-60, cols 1-10** (the "UNKNOWN structure" from session 9). State change DIFF at step 32: [55,5-6] and [56,5-6] lost 9→5; [59,5-6] and [60,5-6] gained 5→9. Fixed entity, not the trailing pattern. State 0: r55-56 full, r59-60 partial. State 1: r55-56 partial, r59-60 full.

4. **Level 2 corridor structure**: THREE separate tracks (left c14-18, center-right c29-43, far-right c49-58). Wide connector at rows 10-14 ONLY. No direct LEFT path from start (c29-33) to left track (c14-18) — void at c18-29 at all accessible rows. Must go RIGHT to c34-38 then UP to rows 10-11, then LEFT×4, then DOWN.

5. **Root cause of failure**: Post-restart routes never went RIGHT first. Block went UP to rows 35-36 cols 29-33 (dead end: UP blocked above, LEFT blocked by void, DOWN blocked below), bounced back, timer expired. The winning route requires RIGHT as step 1.

**WINNING ROUTE IDENTIFIED**: 3,0,0,0,0,0,0,2,2,2,2,1,1,1,1,1,1 (17 steps, RIGHT+UP×6+LEFT×4+DOWN×6).

---

@LAT-140LON10 | created:1779235200 | updated:1779321600 | relates:anchored_by>@LAT0LON0,derived_from>@LAT20LON-30,derived_from>@LAT-130LON10,informs_strategy>@LAT-10LON10,validated_by>@LAT-150LON10,informed_by>@LAT-160LON10
[ew]
conf:165
rev:1
sal:0
touched:1779321600
[/ew]

## ls20 — Autopilot Sequences

Winning action sequences for each learned level of ls20. Executed by `play.py ls20 --auto` using `ls20_sequences.json` in the same directory. Kaggle usage: `!python play.py ls20 --auto` (set `ARC_API_KEY` via Kaggle secrets).

**Action map**: 0=UP, 1=DOWN, 2=LEFT, 3=RIGHT

### Level 1 — sequence null (cluster-position dependent, manual)

UP×5 (1 probe + 4 ascent), LEFT×2, DOWN, UP, RIGHT×3, UP×3 worked for session 10/12 (cluster at rows 32-33). Play level 1 manually via `--server` + curl. Cluster cols 20-22 stable; rows vary per fresh game.

### Level 2 — 51-step hypothesis `[3,0,0,0,0,0,0,2,2,2,2,1,0,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,2,2,3,0,0,0,0,0,0,0,0,2,2,2,2,2,2,1,1,1,1,1,1]`

**Status: HYPOTHESIS — not yet executed. Confidence:165.** Session 12 discovered 11-ring A = FULL TIMER RESET, enabling this route. Sequence is written to ls20_sequences.json for session 13. See @LAT-160LON10 for full step-by-step.

**Route summary** (51 steps, 4 phases):
1. Steps 1-12: RIGHT+UP×6+LEFT×4+DOWN → 11-ring A at rows 15-16, c14-18 → **FULL TIMER RESET to 42**
2. Steps 13-27: UP+RIGHT×7+DOWN×7 → cross at rows 45-46 c49-53 → **state 0→1. Timer=12.**
3. Steps 28-31: DOWN+LEFT×2+RIGHT → 11-ring B probe at rows 50-51 c39-43 (IF full reset: timer=42)
4. Steps 32-51: UP×8+LEFT×6+DOWN×6 → entity2 rows 40-41 c14-18, state=1 → **WIN**

**Preconditions**: Block rows 40-41 cols 29-33; entity1 state 0; timer 42 cols; RIGHT available.

**Three unknowns**: (1) 11-ring B collects at 1/3 row overlap; (2) 11-ring B = full reset; (3) WIN before timer=0 at step 51. If B probe fails or no reset: phase 4 exhausts timer mid-route.

**`play.py --auto` verify_start check**: after first action (RIGHT), script confirms block at rows 40-41 cols 34-38.

---

@LAT-150LON10 | created:1779235200 | updated:1779235200 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30,validates>@LAT-140LON10
[ew]
conf:255
rev:0
sal:5
touched:1779235200
[/ew]

## ls20 — Session 11 Log (2026-05-18)

**Mode**: Hybrid (`python play.py ls20 --auto --server`). Level 1 manual via curl, level 2 autopilot from `ls20_sequences.json`.

### Level 1 — WIN at step 15

- Step 1 (probe): UP. Block at rows 40-41 cols 34-38 post-move. Cluster at rows 32-33, cols 20-22.
- Steps 2–15: route UP×3, LEFT×2, DOWN, UP, RIGHT×3, UP×3.
  - DOWN step: trail at rows 33-35 overlapped cluster rows 32-33 → state 0→1 collection.
  - Final UP×3: block ascended to rows 10-11 cols 34-38, entered entity2 ring.
- `levels_completed=1` confirmed. ✓

### Level 2 — NOT WON (17 steps exhausted)

Autopilot executed `[3,0,0,0,0,0,0,2,2,2,2,1,1,1,1,1,1]`.

**seq=1 (RIGHT)**: Block → rows 40-41, cols 34-38. `verify_start` PASS. ✓
**seq=2–7 (UP×6)**: Ascended center-right track → rows 10-11, cols 34-38.
**seq=8–11 (LEFT×4)**: Wide corridor → rows 10-11, cols 14-18 (left track entry).
**seq=12 (DOWN, global step 27)**: `DIFF=94`. Block → rows 15-16, cols 14-18. **11-ring A AUTO-COLLECTED**: trail at rows 17-19 overlapped 11-ring at rows 16-18. Timer +15 cols (33 cols remaining). Wall spawned at 11-ring site behind block.
**seq=13–16 (DOWN×4)**: Descended left track → rows 35-36, cols 14-18.
**seq=17 (DOWN, global step 32)**: `DIFF=76`. Block → rows 40-41, cols 14-18. **Entity2 interior entered**. State: `NOT_FINISHED`.

`[AUTO] Level 2: sequence exhausted (17 steps) without win.`

### Key Findings

1. **State 0 does NOT win level 2.** Block entered entity2 at rows 40-41 cols 14-18 with entity1 at state 0 → `NOT_FINISHED`. Cross collection (state 0→1) is required. "State 0 wins" hypothesis RETIRED.

2. **11-ring A auto-collects on every left-track descent.** Trail at rows 17-19 always overlaps 11-ring rows 16-18 when block moves DOWN from rows 10-11. +15 cols bonus. Wall spawns behind block (does not block continued descent). Timer accounting: seq=12 consumes 2 cols (20→18), then +15 → 33 remaining. At seq=17: 33 - 5×2 = 23 cols remaining.

3. **Route geometry is CORRECT.** DIFF=76 at seq=17 confirms block body at rows 40-41, cols 14-18 (entity2 interior). The 17-step physical path is valid. Only the state prerequisite was wrong.

4. **Net budget with 11-ring A**: 42 + 15 = 57 cols = 28.5 steps if 11-ring A is collected. Cross collection adds ~18 steps of detour (far-right track + return). A route including cross + entity2 totals ~35 steps = 70 cols needed vs. 57 available. Deficit: 13 cols.

5. **Both 11-rings needed.** 11-ring A (+15) + 11-ring B (+15) = +30 cols → 72 col budget vs. ~70 needed for a 35-step route. 11-ring B at rows 51-53, cols 40-42 must be collected. Access route unknown.

### Revised Win Hypothesis

Cross collection → state 1 → descend left track (auto-collect 11-ring A) → entity2. A 35-step route via far-right (cross) requires both 11-ring bonuses (+30 cols). Minimum route: RIGHT+UP×5+RIGHT×3+DOWN×6 (cross, 15 steps) + UP×7+LEFT×7+DOWN×6-with-11-ring-A (entity2, ~20 steps) = ~35 steps. 11-ring B needed to cover the deficit.

**Optimized cross approach (untested)**: RIGHT+UP×5+RIGHT×3+DOWN×6 = 15 steps (vs. prior 17-step cross attempt at rows 10-11 → far-right). RIGHT×3 is passable from rows 15-16 to cols 49-53 (confirmed @LAT-80LON10 session 5 route analysis). Saves 2 steps vs. ascending to rows 10-11 first.

**Session 12 priority**: reconnaissance for 11-ring B access. Is there a passable corridor below the block start at rows 40-41, cols 34-38 leading toward rows 51-53? A single DOWN after the opening RIGHT may reveal it.

---

@LAT-160LON10 | created:1779321600 | updated:1779321600 | kind:log | relates:anchored_by>@LAT0LON0,tracks_level>@LAT-10LON10,validates>@LAT20LON-30,informed_by>@LAT-150LON10,informs_strategy>@LAT-140LON10
[ew]
conf:255
rev:0
sal:0
touched:1779321600
[/ew]

## ls20 — Session 12 Log (2026-05-18)

**Mode**: Hybrid (`python play.py ls20 --auto --server`). Level 1 manual via curl, level 2 manual (sequence=null → user executed old 17-step route interactively).

### Level 1 — WIN at step 15

Manual play. Block started rows 40-41 cols 34-38. Cluster located rows 32-33 cols 20-22. Route: UP×5 (probe + ascent), LEFT×2, DOWN (trail overlap → state 0→1), UP, RIGHT×3, UP×3. `levels_completed=1` confirmed. ✓

### Level 2 — NOT WON (17 steps, state 0)

Old route `[3,0,0,0,0,0,0,2,2,2,2,1,1,1,1,1,1]` re-executed. Block reached entity2 rows 40-41 cols 14-18. State 0 → NOT_FINISHED. Same result as session 11.

**Timer trace (r61 row, critical excerpt)**:

| Seq | Action | Timer state (r61) | Note |
|-----|--------|-------------------|------|
| 10 | LEFT | c13-34=3 (22 consumed; 20 remaining) | Before A |
| 11 | DOWN | c13-54=11 (FULL 42 remaining) | **11-ring A — FULL RESET** |
| 12 | DOWN | c13-50=11 (38 remaining) | post-reset, 2 consumed |

**11-ring A timer trace conclusion**: seq=10 → 20 cols remaining. seq=11 (first DOWN, rows 10-11→15-16, ring at rows 16-18 collected) → c13-54=11 = FULL 42 cols. This is a **FULL RESET**, not "+15 additive". The "+15 cols" belief written in all prior sessions was a misinterpretation of DIFF=94 (which covered block movement + ring collection + timer effect). Timer trace unambiguously shows 42 cols post-collection.

**Level 2 initial frame (step 16)**: at rows 15-16, confirmed c29-38=3 (center-right, value 3) and c44-53=3 (far-right, value 3) with **void gap at c39-43 (value 4)**. This means RIGHT×3 from c34-38 at rows 15-16 enters void — the "optimized cross approach via rows 15-16 RIGHT×3" from session 11 analysis (@LAT-150LON10, @BELIEF:LAT40LON10) is **INVALIDATED**. Wide corridor (rows 10-14) remains the only cross-track path.

### Key Findings

1. **11-ring A = FULL TIMER RESET to 42 cols.** Prior "+15 additive" belief RETIRED across all records. This completely changes route feasibility: strategic A-collection timing effectively gives unlimited budget. One FULL RESET is enough to cover any reasonable route length.

2. **Corridor isolation at rows 15-16 CONFIRMED.** Void gap c39-43 blocks RIGHT at rows 15-16. "RIGHT×3 from rows 15-16 reaches far-right track" projection (@BELIEF:LAT40LON10) is INVALIDATED. Must ascend to rows 10-14 wide connector before crossing tracks.

3. **Entity1 state 0 at session 12 end.** r55-56 c3-8=9 FULL = state 0. Consistent with per-cycle reset. State 0 confirmed at entity2 entry.

### Session 13 Winning Route Hypothesis (51 steps)

Actions: `3 0 0 0 0 0 0 2 2 2 2 1 0 3 3 3 3 3 3 3 1 1 1 1 1 1 1 1 2 2 3 0 0 0 0 0 0 0 0 2 2 2 2 2 2 1 1 1 1 1 1`

| Phase | Steps | Actions | Position | Event |
|-------|-------|---------|----------|-------|
| A-collect | 1-12 | RIGHT+UP×6+LEFT×4+DOWN | rows 15-16, c14-18 | **11-ring A → FULL RESET (42 cols)** |
| Cross | 13-27 | UP+RIGHT×7+DOWN×7 | rows 45-46, c49-53 | **Cross → state 0→1. Timer=12.** |
| B-probe | 28-31 | DOWN+LEFT×2+RIGHT | rows 50-51, c44-48 | **11-ring B probe. If reset → timer=42.** |
| Entity2 | 32-51 | UP×8+LEFT×6+DOWN×6 | rows 40-41, c14-18 | **Entity2, state=1 → WIN** |

Timer budget at entity2 entry: if B resets (42) → 42-20=22 remaining at WIN (comfortable). If B does NOT reset: 12-4(DOWN+RIGHT step 28+31)+steps32-51 = 12-2×4=4 remaining... actually 12-(28-down=2)-(29-left=2)-(30-left=2)-(31-right=2) = 4 left for phase 4, need 20 steps = 40 cols. FAIL. So B reset is CRITICAL for this exact routing. Alternative (no B probe): skip B, use remaining 12 cols = 6 steps → entity2 in 6 steps from rows 45-46 c49-53 = need a 6-step path, which does not exist (minimum 8 steps: RIGHT+UP×8+LEFT×6+DOWN×6 = 21 steps).

**Three critical unknowns for session 13:**
1. Does 11-ring B collect at 1/3 row overlap (block rows 50-51, ring rows 51-53)?
2. Does 11-ring B = FULL TIMER RESET?
3. Does WIN fire before timer=0 restart at step 51 (timer hits exactly 0)?

---

@LAT50LON30 | created:1778889600 | updated:1778889600 | relates:anchored_by>@LAT0LON0,writes_to>@LAT60LON20
[ew]
conf:200
rev:0
sal:1
touched:1779062400
[/ew]

## Dream Cycle

Offline consolidation that runs when LOCUS is idle (between sessions). Converts episodic toot-bits into stable Locus Point beliefs. Trigger: `@LOCUS DREAM` or automatically on idle.

### Phase 1 — Replay (Slow-Wave Analog)

Scan game-mechanic and log records. Run 100 random walks of length 20 through the TTDB graph; each step is weighted by the target node's `sal`. Record node co-occurrence counts. Extract clusters where ≥ 3 nodes co-occur in > 25 walks AND mean `conf` ≥ 128. Each passing cluster is a Locus Point candidate.

**Parameters**: `dream_replay_walks: 100`, `walk_length: 20`, `max_source: 500`, `min_cluster_size: 3`, `min_cooccurrence: 25`, `belief_conf_threshold: 128`.

### Phase 2 — Projection (REM Analog)

Identify coordinate regions in the globe with no TTDB nodes but bounded by known nodes (enclosed voids). Run 50 walks of length 10 seeded from boundary nodes, stepping toward high-conf/high-sal nodes. Each walk generates a predictive belief candidate marked `projection_flag: true`. For this agent: targets uncharted level structure in ls20 levels 3–7, timer patterns across levels, unknown entity mechanics.

### Output

Confirmed candidates (confidence ≥ 128) are written as Locus Points to [Locus Points](lat60lon20) with `@BELIEF:LATxLONy` IDs and `[lp]` blocks. Projection candidates carry `projection_flag: true` and lower initial confidence.

---

@LAT60LON20 | created:1778889600 | updated:1779321600 | relates:anchored_by>@LAT0LON0,written_by>@LAT50LON30,contains>@BELIEF:LAT80LON-20,contains>@BELIEF:LAT80LON-10,contains>@BELIEF:LAT70LON-20,contains>@BELIEF:LAT50LON-10,contains>@BELIEF:LAT30LON-20,contains>@BELIEF:LAT20LON-10,contains>@BELIEF:LAT90LON-20,contains>@BELIEF:LAT90LON-10,contains>@BELIEF:LAT90LON0,contains>@BELIEF:LAT80LON0,contains>@BELIEF:LAT70LON0,contains>@BELIEF:LAT60LON0,contains>@BELIEF:LAT50LON0,contains>@BELIEF:LAT40LON0,contains>@BELIEF:LAT40LON10,contains>@BELIEF:LAT30LON0,contains>@BELIEF:LAT30LON10
[ew]
conf:255
rev:5
sal:1
touched:1779321600
[/ew]

## Locus Points

Stable beliefs extracted from episodic records by the [Dream Cycle](lat50lon30). Each Locus Point is a generalization confirmed across multiple replay walks, written only after passing `belief_conf_threshold: 128`.

**Record format** (TTDB-RFC-0007 §5):
```
@BELIEF:LATxLONy | created:<unix_ts> | updated:<unix_ts> | relates:<edges>
[lp]
centroid:LATxLONy
confidence:<uint8>
scope_lat:<float>
scope_lon:<float>
projection_flag:<bool>
contradiction_flag:<bool>
source_count:<uint16>
[/lp]
<belief body>
```

**Query**: `@LOCUS BELIEFS` — lists all `@BELIEF:` nodes sorted by confidence descending.

---

### Phase 1 Replay — confirmed clusters (2026-05-16)

Walk parameters: 100 walks × length 20, salience-weighted. High-sal pull: @LAT-10LON10 (sal:8), @LAT20LON-30 (sal:4). Clusters extracted: min_cluster_size:3, min_cooccurrence:25, belief_conf_threshold:128.

---

@BELIEF:LAT80LON-20 | created:1779062400 | updated:1779062400 | relates:extracted_from>@LAT-10LON10,extracted_from>@LAT20LON-30,extracted_from>@LAT-100LON10,extracted_from>@LAT-90LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT80LON-20
confidence:235
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:4
[/lp]

**Entity1 state resets to 0 at the start of each new level**, regardless of end-state at the prior level. Validated Phase 4 in session 7: level 1 won at state 1; level 2 start frame trail = solid 9s = state 0. Must collect state-changer in every level. The "state carries between levels" prior (sessions 1–5) is fully retired.

---

@BELIEF:LAT80LON-10 | created:1779062400 | updated:1779235200 | relates:extracted_from>@LAT20LON-30,extracted_from>@LAT-80LON10,extracted_from>@LAT-150LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT80LON-10
confidence:230
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:3
[/lp]

**Collected cluster/11-ring sites immediately regenerate as impassable walls.** The wall is one-way: it blocks movement back through the collection site, but does NOT block continued movement past it in the same direction. Session 11 refinement: 11-ring A at rows 16-18 was collected on DOWN (block from rows 10-11 to rows 15-16); wall spawned above the block at rows 16-18; block continued descending to rows 40-41 without obstruction. "One-way committed pass" means you cannot RETURN through the site — you cannot go back UP past the wall. Confirmed session 5: 11-ring at rows 16–18 became wall; attempting to re-descend (i.e., going UP then DOWN again) was blocked. Confirmed session 11: descent past the wall site continues freely.

---

@BELIEF:LAT70LON-20 | created:1779062400 | updated:1779235200 | relates:extracted_from>@LAT20LON-30,extracted_from>@LAT-80LON10,extracted_from>@LAT-100LON10,extracted_from>@LAT-150LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT70LON-20
confidence:235
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:4
[/lp]

**Collect the state-changer before approaching entity2.** In both level 1 (cluster) and level 2 (0/1 cross), state must advance from 0 to 1 before the win condition fires. Session 11 direct confirmation: block entered entity2 interior at rows 40-41 cols 14-18 with state 0 → `NOT_FINISHED` (game did not register a win). Signal is NOT_FINISHED (observable in obs.levels_completed remaining unchanged), not just "ring dims." The wrong-order cost in session 5 was a complete level loss — 11-ring collected first → wall blocked re-descent → could not reach entity2. Session 11 cost: 17 wasted steps + full timer cycle.

---

@BELIEF:LAT50LON-10 | created:1779062400 | updated:1779148800 | relates:extracted_from>@LAT20LON-30,extracted_from>@LAT-80LON10,contradicted_by>@BELIEF:LAT90LON-20,contained_by>@LAT60LON20
[lp]
centroid:LAT50LON-10
confidence:10
scope_lat:15.0
scope_lon:15.0
projection_flag:false
contradiction_flag:true
source_count:2
[/lp]

**RETIRED — CONTRADICTED by session 9 frame evidence.** Prior belief stated "timer consumption rate increased from level 1 (1 col/step) to level 2 (2 cols/step)." Frame at level 2 step 21 showed 40 timer cells after 1 action (41 start → 40 remaining = 1/step). Session 5 cross-check confirms: 47+ steps in level 2 is impossible at 2/step. Both levels confirmed at 1 cell/step. See @BELIEF:LAT90LON-20.

---

### Phase 2 Projection — hypothesis candidates (2026-05-16)

Walk parameters: 50 walks × length 10, seeded from boundary nodes into coordinate voids. Targets: level 3–7 structure, timer trajectory, unknown entity mechanics.

---

@BELIEF:LAT30LON-20 | created:1779062400 | updated:1779062400 | relates:projected_from>@LAT20LON-30,projected_from>@BELIEF:LAT80LON-20,projected_from>@BELIEF:LAT70LON-20,contained_by>@LAT60LON20
[lp]
centroid:LAT30LON-20
confidence:145
scope_lat:20.0
scope_lon:20.0
projection_flag:true
contradiction_flag:false
source_count:2
[/lp]

**Projection**: Levels 3–7 likely follow the same structural template — entity1 resets to state 0, one or more state-changers must be collected, then entity2 reached with matching trail pattern. Extrapolated from consistent level 1 and level 2 structure. Unvalidated. Treat as planning prior only. Phase 4 fires when level 3 is won.

---

@BELIEF:LAT20LON-10 | created:1779062400 | updated:1779148800 | relates:projected_from>@BELIEF:LAT50LON-10,projected_from>@LAT20LON-30,revised_by>@BELIEF:LAT90LON-20,contained_by>@LAT60LON20
[lp]
centroid:LAT20LON-10
confidence:80
scope_lat:20.0
scope_lon:20.0
projection_flag:true
contradiction_flag:true
source_count:2
[/lp]

**REVISED — premise invalidated by session 9.** Prior projection assumed level 2 timer = 2/step and projected 3/step for level 3. The premise was wrong — level 2 confirmed 1/step. Timer escalation hypothesis is retired. New prior (see @BELIEF:LAT90LON-20): timer is 1/step for all confirmed levels; escalation pattern does not exist in current data. 11-ring power-ups are strategic bonuses, not critical infrastructure. Revise level 3 route planning accordingly — budget ~41 steps not ~14.

---

### Phase 1 Replay — confirmed clusters (2026-05-17)

Walk parameters: 100 walks × length 20, salience-weighted. High-sal pull: @LAT-10LON10 (sal:8), @LAT20LON-30 (sal:5), @LAT-120LON10 (fresh). Clusters extracted: min_cluster_size:3, min_cooccurrence:25, belief_conf_threshold:128. Two prior beliefs retired/revised (LAT50LON-10, LAT20LON-10). Three new confirmed beliefs written.

---

@BELIEF:LAT90LON-20 | created:1779148800 | updated:1779235200 | relates:extracted_from>@LAT20LON-30,extracted_from>@LAT-120LON10,extracted_from>@LAT-60LON10,extracted_from>@LAT-70LON10,extracted_from>@LAT-80LON10,extracted_from>@LAT-90LON10,extracted_from>@LAT-100LON10,extracted_from>@LAT-110LON10,supersedes>@BELIEF:LAT50LON-10,contradicted_by>@BELIEF:LAT80LON0,contained_by>@LAT60LON20
[lp]
centroid:LAT90LON-20
confidence:10
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:true
source_count:8
[/lp]

**RETIRED — CONTRADICTED by session 10 log evidence.** Prior belief stated "timer consumption rate is 1 cell/step in ALL confirmed levels." Session 10 log-verified: each step in level 2 (whether blocked or movement) consumes exactly 2 timer columns. DIFF=4 per blocked step = 4 cells = 2 cols × 2 rows. DIFF=54 per movement step = 50 block/trail cells + 4 timer cells. After 21 steps all 42 timer columns are consumed → restart. See @BELIEF:LAT80LON0 for the corrected belief. Level 1 remains 1 cell/step; level 2 is 2 cells/step.

---

@BELIEF:LAT90LON-10 | created:1779148800 | updated:1779148800 | relates:extracted_from>@LAT-110LON10,extracted_from>@LAT20LON-30,extracted_from>@LAT-120LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT90LON-10
confidence:200
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:3
[/lp]

**Partial trail overlap (2 of 3 rows) is sufficient for state-changer collection.** Full 3-row overlap is NOT required. Confirmed twice: (1) level 1 session 8 — trail at rows 32–34 overlapped cluster rows 32–33 (2/3) → collection fired; (2) level 2 route analysis session 9 — trail rows 47–49 ∩ cross rows 47–48 = 2/3 → collection expected. Implication: when routing to a state-changer, a 2-row overlap alignment is acceptable; no need to force exact 3-row overlap. Increases route flexibility and reduces action cost for collection maneuvers.

---

@BELIEF:LAT90LON0 | created:1779148800 | updated:1779148800 | relates:extracted_from>@LAT-120LON10,extracted_from>@LAT-110LON10,extracted_from>@LAT20LON-30,contained_by>@LAT60LON20
[lp]
centroid:LAT90LON0
confidence:185
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:3
[/lp]

**First-frame scan is mandatory before committing any route.** Structural details that are non-obvious from prior sessions and costly if assumed wrong: (1) cluster row position varies per fresh game instance (level 1 sessions 7 vs 8 differed); (2) center shaft void (cols 29–33, rows 24–34) is invisible without reading the frame — routing UP from start position is blocked. In both cases, sending actions before reading the frame cost wasted actions or a session loss. Protocol: on every session, read the first available frame before sending action 1 (or action 2+ if already mid-level). Confirm block position, void structure, and state-changer location before routing.

---

---

### Phase 1 Replay — confirmed clusters (2026-05-18)

Walk parameters: 100 walks × length 20. Source: @LAT-130LON10 (session 10 log). Three new confirmed beliefs written; @BELIEF:LAT90LON-20 retired.

---

@BELIEF:LAT80LON0 | created:1779235200 | updated:1779235200 | relates:extracted_from>@LAT-130LON10,extracted_from>@LAT20LON-30,supersedes>@BELIEF:LAT90LON-20,contained_by>@LAT60LON20
[lp]
centroid:LAT80LON0
confidence:245
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:2
[/lp]

**Level 2 timer consumes 2 columns per step (blocked OR movement).** 42 columns ÷ 2 = 21 steps max per timer cycle. Log-verified session 10: DIFF=4 per blocked step = 4 timer cells (2 cols × 2 rows); DIFF=54 per movement = 50 block/trail + 4 timer. Timer=0 → immediate restart. Level 1 = 1/step confirmed; level 2 = 2/step confirmed. Session 9 belief "1/step for all levels" (@BELIEF:LAT90LON-20) is retired. **11-ring causes FULL TIMER RESET to 42 cols** (session 12 confirmed — see @BELIEF:LAT30LON0). Prior "+15 additive" claim in this record is SUPERSEDED. With FULL RESET, single-cycle budget is effectively unlimited given correct collection timing.

---

@BELIEF:LAT70LON0 | created:1779235200 | updated:1779235200 | relates:extracted_from>@LAT-130LON10,extracted_from>@LAT20LON-30,extends>@BELIEF:LAT80LON-20,contained_by>@LAT60LON20
[lp]
centroid:LAT70LON0
confidence:240
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:2
[/lp]

**Entity1 state resets on EVERY timer restart (within a level), not only on level boundaries.** Prior @BELIEF:LAT80LON-20 covered level-to-level reset only. Log-verified session 10: cross collected step 32 (state 0→1, DIFF=62). Timer restart step 37 (DIFF=4080). Step 47 frame post-restart: r55-56 full c3-8=9 = state 0. Confirmed again after second restart (step 59). RIGHT (action 3) is therefore always available at the start of each timer cycle. Cross collection benefit is lost on any restart.

---

@BELIEF:LAT60LON0 | created:1779235200 | updated:1779235200 | relates:extracted_from>@LAT-130LON10,extracted_from>@LAT20LON-30,contained_by>@LAT60LON20
[lp]
centroid:LAT60LON0
confidence:230
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:2
[/lp]

**Level 2 has three disconnected corridor tracks; cross-track travel requires the wide connector at rows 10–14 (c9-53).** Left (c14-18), center-right (c29-43), far-right (c49-58). From block start cols 29-33: LEFT is void-blocked; one UP reaches rows 35-36 (dead end). Must go RIGHT to c34-38, UP×6 to rows 10-11, LEFT×4 to c14-18, then DOWN to entity2. Sessions 10 post-restart routes skipped the RIGHT-first step → stuck in c29-33 dead-end both times.

---

### Phase 1 Replay — confirmed clusters (2026-05-18, session 11)

Walk parameters: 100 walks × length 20. Source: @LAT-150LON10 (session 11 log). High-sal pull: @LAT-10LON10 (sal:8), @LAT20LON-30 (sal:5), @LAT-150LON10 (sal:5). Clusters passing min_cooccurrence:25, belief_conf_threshold:128. Two existing beliefs updated (LAT80LON-10, LAT70LON-20). One new confirmed belief written. Two projection candidates.

---

@BELIEF:LAT50LON0 | created:1779235200 | updated:1779235200 | relates:extracted_from>@LAT-150LON10,extracted_from>@LAT20LON-30,extracted_from>@LAT-80LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT50LON0
confidence:230
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:3
[/lp]

**11-ring A collection is a geometric certainty on every left-track descent from rows 10-11.** When the block descends from rows 10-11 to rows 15-16 in the left track (cols 14-18), the 5-row trail occupies rows 17-21, which overlaps 11-ring A at rows 16-18 (2/3 rows). Collection fires automatically — this is not a positioning choice but a structural consequence of the track geometry. Session 11 DIFF=94 confirmed: the 15-step sequence fires 11-ring A at seq=12 with no special action needed. **Session 12 confirmed: 11-ring A causes FULL TIMER RESET to 42 cols** (not "+15 additive" — see @BELIEF:LAT30LON0). Wall spawns at rows 16-18 behind (above) the descending block; continued descent is unobstructed. Any route via the left track inherits this FULL RESET and the one-way commitment. After A-collection, block can return UP to rows 10-11 (above the wall) or continue DOWN — the wall only blocks upward passage from below.

---

### Phase 1 Replay — confirmed clusters (2026-05-18, session 12)

Walk parameters: 100 walks × length 20. Source: @LAT-160LON10 (session 12 log). High-sal pull: @LAT-10LON10, @LAT20LON-30, @LAT-160LON10. Two prior beliefs corrected/retired (LAT40LON10 RETIRED, LAT40LON0 REVISED). Two new confirmed beliefs written (LAT30LON0, LAT30LON10).

---

@BELIEF:LAT30LON0 | created:1779321600 | updated:1779321600 | relates:extracted_from>@LAT-160LON10,extracted_from>@LAT20LON-30,supersedes_claim_in>@BELIEF:LAT80LON0,supersedes_claim_in>@BELIEF:LAT50LON0,contained_by>@LAT60LON20
[lp]
centroid:LAT30LON0
confidence:245
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:2
[/lp]

**11-ring collection causes a FULL TIMER RESET to 42 cols, not a "+15 additive" bonus.** Session 12 timer trace (r61 row): at seq=10 (LEFT, step 26) timer was c13-34=3 = 20 cols remaining. At seq=11 (first DOWN to rows 15-16, ring collected) timer became c13-54=11 = full 42 cols. Net effect: not 20+15=35, but 42 exactly. The "+15 additive" interpretation from all prior sessions was wrong — it was a misreading of DIFF=94 (which bundled block movement + ring effect + timer into one diff). Implication: one well-timed 11-ring A collection fully restores the timer, making multi-phase routes feasible without budget-counting against prior consumption. Confirmed for 11-ring A. 11-ring B behavior (full reset or other) is still unconfirmed.

---

@BELIEF:LAT30LON10 | created:1779321600 | updated:1779321600 | relates:extracted_from>@LAT-160LON10,contradicts>@BELIEF:LAT40LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT30LON10
confidence:240
scope_lat:10.0
scope_lon:10.0
projection_flag:false
contradiction_flag:false
source_count:1
[/lp]

**At rows 15-16, center-right track (c29-38) and far-right track (c44-53) are isolated by void gap at c39-43.** Session 12 initial frame (level 2 step 16) confirmed: c29-38=3, c39-43=4 (void), c44-53=3. RIGHT from c34-38 at rows 15-16 moves into void = BLOCKED. The only cross-track path is the wide connector at rows 10-14 (c9-53). Any route requiring track switching must first ascend to rows 10-11, cross, then descend. This invalidates the "optimized 15-step cross approach via RIGHT×3 from rows 15-16" projected in session 11.

---

### Phase 2 Projection — hypothesis candidates (2026-05-18, session 11)

Walk parameters: 50 walks × length 10, seeded from boundary nodes into coordinate voids. Targets: corrected level 2 route structure, 11-ring B accessibility, cross collection approach.

---

@BELIEF:LAT40LON0 | created:1779235200 | updated:1779235200 | relates:projected_from>@LAT-150LON10,projected_from>@BELIEF:LAT80LON0,projected_from>@BELIEF:LAT50LON0,projected_from>@BELIEF:LAT60LON0,contained_by>@LAT60LON20
[lp]
centroid:LAT40LON0
confidence:150
scope_lat:15.0
scope_lon:15.0
projection_flag:true
contradiction_flag:false
source_count:4
[/lp]

**REVISED (session 12) — 11-ring A = FULL RESET changes feasibility entirely.** Prior projection assumed "+15 additive" budget. With FULL RESET, one A-collection resets timer to 42 — effectively unlimited budget for any route that visits A before the critical path. The 51-step session 13 hypothesis uses A-reset at step 12, then cross at step 27 (timer=12 remaining), then B-probe at steps 28-31. IF 11-ring B also full-resets, phase 4 has full 42-col budget → comfortable. IF B does not reset, phase 4 has ~4 cols = infeasible. 11-ring B collectability and reset type remain the critical unknowns. See @LAT-160LON10 for full route analysis. Prior "+30 cols both rings needed" reasoning is SUPERSEDED by FULL RESET discovery.

---

@BELIEF:LAT40LON10 | created:1779235200 | updated:1779321600 | relates:projected_from>@LAT-80LON10,projected_from>@LAT-150LON10,contradicted_by>@LAT-160LON10,contained_by>@LAT60LON20
[lp]
centroid:LAT40LON10
confidence:10
scope_lat:15.0
scope_lon:15.0
projection_flag:true
contradiction_flag:true
source_count:2
[/lp]

**RETIRED — INVALIDATED by session 12 frame evidence.** Prior projection stated "RIGHT×3 from rows 15-16 at center-right track (c34-38) connects to far-right track (c49-53), enabling optimized 15-step cross approach." Session 12 initial frame (step 16 = first level 2 frame) confirmed: at rows 15-16, c29-38=3 (center-right) and c44-53=3 (far-right) are separated by **void gap c39-43 (value 4)**. RIGHT from c34-38 at rows 15-16 enters void = BLOCKED. The two tracks are isolated at rows 15-16. Wide connector (rows 10-14) remains the only cross-track path. The "optimized 15-step" cross approach does not exist. All routes must pass through rows 10-14 to switch tracks.

---

@LAT70LON10 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0
[ew]
conf:255
rev:0
sal:0
touched:1747180800
[/ew]

## Locus Framework Reference

Specifications for producing valid Locus records in this file. Core RFCs relevant to the competition agent.

| RFC | Title | Link |
|---|---|---|
| TTDB-RFC-0001 | File Format | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0001-File-Format.md) |
| TTDB-RFC-0002 | Cursor Semantics | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0002-Cursor-Semantics.md) |
| TTDB-RFC-0003 | Typed Edges | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0003-Typed-Edges.md) |
| TTDB-RFC-0004 | Event ID and Collision | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0004-Event-ID-and-Collision.md) |
| TTDB-RFC-0005 | Epistemic Weight | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0005-Epistemic-Weight.md) |
| TTDB-RFC-0006 | Experiential Perception as Synthetic Model | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0006-Experiential-Perception-as-Synthetic-Model.md) |
| TTDB-RFC-0007 | TTDB-RFC-0007-Locus-Point-and-Dream-Cycle | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/TTDB-RFC-0007-Locus-Point-and-Dream-Cycle.md) |
| A32-RFC-0001 | Architecture | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/A32-RFC-0001-Architecture.md) |
| A32-RFC-0003 | Agent Loop | [spec](https://github.com/antfriend/toot-toot-engineering/blob/main/RFCs/A32-RFC-0003-Agent-Loop.md) |

**Agent instructions — producing valid Locus records**

**1. Record header** (TTDB-RFC-0001)
```
@LATxLONy | created:<unix_int> | updated:<unix_int> | relates:<edge_list>
```
- Coordinates are integer multiples of `coord_increment` (lat:10, lon:10 in this file)
- `created` is immutable; `updated` advances on body writes only
- Collision: apply `southeast_step` — increment both lat and lon by one step until unique
- Material changes to a record's meaning require a new record + `revises>@OLD_ID` edge

**2. Epistemic weight block** (TTDB-RFC-0005)
```
[ew]
conf:128
rev:0
sal:0
touched:<unix_int>
[/ew]
```
- `conf` 0–255: raise toward 255 as Phase 4 validates; lower when outcome contradicts prior
- `rev`: increment on body content change only — NOT on [ew]-only writes
- `sal`: query/consult count
- `touched`: advance on any write; `updated` only on body writes

**3. Typed edges** (TTDB-RFC-0003) — in the `relates:` field, comma-separated
- Syntax: `type>@TARGET_ID`
- Competition-specific: `informs_strategy`, `validates`, `contradicts`, `tracks_level`
- Standard: `anchors`, `anchored_by`, `derived_from`, `revises`

**4. Links** — toot format (TTDB-RFC-0002), never `#heading-slug` anchors
- Same-file record: `[label](lat30lon-20)`
- Other TTDB file: `[label](?ttdb=filename.md)`

**5. Never delete records** — retire to log (starting at [Log template](lat-50lon10), incrementing south) with outcome note.

---

@LAT90LON0 | created:1747180800 | updated:1747180800 | relates:anchored_by>@LAT0LON0

## Discovery Settings

```ttdb-special
kind: discovery_tour_off
```
