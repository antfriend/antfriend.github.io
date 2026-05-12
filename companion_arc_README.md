# SOLVER — ARC Prize Competition Companion

**`companion_arc.md` is your competition strategy file.** It carries context about your approach, your pattern knowledge, and your progress across every Claude Code session. This guide walks through setting up the ARC Prize API alongside it, specifically for VSCode with Claude Code.

---

## What you need

- Python 3.10+ (or `uv` — recommended)
- VSCode with the Claude Code extension installed
- An ARC Prize API key (free — see below)
- `companion_arc.md` open in your VSCode workspace

---

## Step 1 — Get your API key

Register at [https://three.arcprize.org](https://three.arcprize.org) to obtain an API key. Anonymous access works for local exploration, but you need a key for competition mode and leaderboard submissions.

---

## Step 2 — Install the ARC-AGI toolkit

**With `uv` (recommended — faster, isolated):**

```bash
uv init arc-solver
cd arc-solver
uv add arc-agi
```

**With pip:**

```bash
pip install arc-agi
```

---

## Step 3 — Set up your API key in VSCode

Create a `.env` file in your project root. Claude Code reads this automatically when it's present:

```
ARC_API_KEY=your-api-key-here
```

To verify Claude Code picks it up, open the terminal in VSCode and check:

```bash
echo $ARC_API_KEY        # macOS / Linux
$env:ARC_API_KEY         # Windows PowerShell
```

Alternatively, add it to your VSCode workspace settings (`Ctrl+Shift+P` → `Open Workspace Settings (JSON)`) if you prefer not to use a `.env` file:

```json
{
  "terminal.integrated.env.windows": {
    "ARC_API_KEY": "your-api-key-here"
  },
  "terminal.integrated.env.osx": {
    "ARC_API_KEY": "your-api-key-here"
  },
  "terminal.integrated.env.linux": {
    "ARC_API_KEY": "your-api-key-here"
  }
}
```

**Do not commit your API key.** Add `.env` to `.gitignore`.

---

## Step 4 — Verify the toolkit

```python
import arc_agi
from arcengine import GameAction

arc = arc_agi.Arcade()
env = arc.make("ls20", render_mode="terminal")
print(env.action_space)
```

Run this in the VSCode terminal (`Ctrl+` `` ` ``). You should see available actions for a game environment. If you get an auth error, check your `ARC_API_KEY`.

---

## Step 5 — Open `companion_arc.md` in VSCode

Open `companion_arc.md` as an active editor tab in VSCode before starting your Claude Code session. Claude Code reads your open files as context — having SOLVER's memory visible means every session starts with your full competition strategy, pattern catalog, and progress already loaded.

```
File → Open File → companion_arc.md
```

Then start Claude Code (`Ctrl+Shift+P` → `Claude Code: Open`) or use the sidebar. Your first message in any session:

```
@SOLVER STATUS
```

SOLVER will scan your records by EPS and surface what needs attention.

---

## Step 6 — Set up a CLAUDE.md for your solver project

Create a `CLAUDE.md` in your solver project root. This tells Claude Code the persistent facts about your project so you don't have to re-explain every session:

```markdown
# ARC Solver Project

Competition: ARC Prize 2026 (arcprize.org)
Toolkit: arc-agi (pip install arc-agi)
API key: set in .env as ARC_API_KEY
Strategy file: companion_arc.md (open this file for full context)

## Running experiments
uv run python solver.py

## Running evaluation
uv run python eval.py --split public
```

Adjust to match your actual file structure.

---

## Basic agent loop

This is the pattern your solver will iterate on. Claude Code can help you build and modify it:

```python
import arc_agi
from arcengine import GameAction

arc = arc_agi.Arcade()
env = arc.make("ls20")                   # replace with target task ID

while True:
    available = env.action_space
    if not available:
        break

    # --- your agent logic here ---
    action = your_agent(available, env)
    obs = env.step(action)

    if obs.state in ("win", "game_over"):
        break

print(arc.get_scorecard())
```

Browse all available task environments at [arcprize.org/tasks](https://arcprize.org/tasks).

---

## Competition mode

When you're ready to submit to the official leaderboard, enable competition mode:

```python
from arcengine import OperationMode

arc = arc_agi.Arcade(mode=OperationMode.COMPETITION)
```

Competition mode constraints:
- API-only interaction (no local resets)
- Level resets allowed, full game resets are not
- Single environment per submission
- Unified scorecard — your score is final when you call `get_scorecard()`

---

## ARC-AGI-1 / ARC-AGI-2 data (offline evaluation)

For working with the original static task datasets (1,000 training + 120 evaluation tasks), clone the benchmark repo separately:

```bash
git clone https://github.com/fchollet/ARC-AGI
```

Task format — each `.json` file contains:

```json
{
  "train": [
    { "input": [[0,1],[1,0]], "output": [[1,0],[0,1]] },
    ...
  ],
  "test": [
    { "input": [[0,0],[1,1]] }
  ]
}
```

Grids are 2D arrays of integers 0–9 (colors). Your solver takes `test[0].input` and must produce the matching output — pixel-perfect (exact shape, colors, positions).

Scoring: [Kaggle scoring notebook](https://www.kaggle.com/code/gregkamradt/arc-prize-scoring/notebook) · [GitHub scoring script](https://github.com/arcprizeorg/model_baseline/blob/main/src/scoring/scoring.py)

---

## Using SOLVER with Claude Code

`@SOLVER` is your session-persistent strategist. It lives in `companion_arc.md` and carries context across every Claude Code conversation.

**Common patterns:**

```
@SOLVER STATUS
```
*Scan records by EPS — surfaces what needs attention.*

```
@SOLVER I just ran eval on the public set and got 42%. Rotation/reflection tasks are all correct but object-detection tasks are failing. Update Benchmark Progress and flag object ops as a research frontier.
```
*SOLVER will update the relevant records and surface connections.*

```
@SOLVER what pattern families am I not handling yet?
```
*Cross-references Pattern Catalog against your Implementation Stack.*

```
@SOLVER LOG ran ablation on color-mapping tasks — adding object-centric repr improved accuracy by 8pp
```
*Appends to the active log record.*

```
@SOLVER my approach isn't working for multi-step compositional tasks. What should I try next?
```
*SOLVER reasons from your Active Strategy, Research Frontiers, and Pattern Catalog.*

---

## Record map

| Record | Coordinate | What to fill in |
|---|---|---|
| Your Profile | `lat40lon-30` | Already filled in — antfriend, Toot Toot Engineer |
| Competition Context | `lat30lon-20` | Pre-filled — update if rules change |
| Active Strategy | `lat20lon0` | Your primary technical approach |
| Pattern Catalog | `lat10lon10` | Mark each family ✓ / △ / ~ as you go |
| Implementation Stack | `lat0lon20` | Your tools, models, infra |
| Benchmark Progress | `lat10lon-10` | Update after every eval run |
| Research Frontiers | `lat-20lon0` | Open problems and unsolved patterns |
| Log | `lat-50lon10` | Session notes — one per significant session |

---

## Quick reference

| Task | Command |
|---|---|
| Install toolkit | `uv add arc-agi` |
| Set API key | `ARC_API_KEY=... in .env` |
| Run a task env | `arc.make("task-id", render_mode="terminal")` |
| Browse tasks | arcprize.org/tasks |
| Get API key | three.arcprize.org |
| ARC-AGI data repo | github.com/fchollet/ARC-AGI |
| Invoke companion | `@SOLVER <message>` |
| Session start | `@SOLVER STATUS` |

---

*`companion_arc.md` is the memory. Claude Code is the engine. You are the strategist in a supporting role. Let's win.*
