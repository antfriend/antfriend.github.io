# SAGE — Personal Agent Companion

**One file. One AI. Yours.**

`companion.md` is a personal agent companion that lives entirely in a single Markdown file. Drop it in a folder, open it alongside a conversation with Claude (or any capable AI), and you have a companion that carries context across every session — because the file *is* the memory.

---

## What it does

SAGE maintains a structured record of who you are, what you're working toward, and what you haven't figured out yet. Between conversations, it runs a background process — the *default network* — that scans for records that need attention, flags stale goals, and notices connections you haven't made explicit yet.

It does not guess about you. It knows only what you have written. That constraint is the feature: the file is auditable, portable, and entirely under your control.

---

## Quick start

**1. Get the file**

Copy `companion.md` somewhere you'll keep it — a notes folder, a project directory, wherever you work.

**2. Name your companion** *(optional but recommended)*

Pick a name. Open the file and replace every instance of `SAGE` with it. One find-and-replace, done. The name becomes your invocation prefix: `@EMBER`, `@ATLAS`, `@REX`, whatever fits.

**3. Start a conversation**

Open `companion.md` in any text editor. Start a new AI conversation and paste the file contents (or attach it, if your AI supports file upload). Then:

```
@SAGE fill in Your Profile together
```

SAGE will ask you the questions in the Profile record and help you write the answers. Once that record is complete, every future conversation starts with full context.

---

## How to use it

Prefix any message with `@SAGE` to invoke the companion:

```
@SAGE what should I focus on today?
@SAGE I just finished the landing page — mark that goal done
@SAGE I keep avoiding the budget conversation. Add that to Open Questions.
@SAGE STATUS
@SAGE LOG noticed I'm more productive in the morning than I thought
```

**Primitive commands:**

| Command | What it does |
|---|---|
| `@SAGE STATUS` | Shows EPS rankings — which records need attention — and any stale or flagged items |
| `@SAGE LOG <note>` | Appends a brief observation to the active log record |
| `@SAGE FOCUS <record>` | Moves the cursor to a specific record and marks it as active |
| `@SAGE FIND <word>` | Searches records for a term |
| `@SAGE SELECT <id>` | Navigates directly to a record by coordinate, e.g. `SELECT lat20lon0` |

---

## How memory works

Every piece of context in `companion.md` is a **record** — a named section with a coordinate address (`@LATxLONy`) and a small metadata block called `[ew]` (epistemic weight).

The `[ew]` block has four fields:

| Field | Meaning | Range |
|---|---|---|
| `conf` | How well this record's model predicts your reactions | 0–255 (128 = unknown) |
| `rev` | Times this record's body has changed | 0+ |
| `sal` | Times this record has been consulted | 0+ |
| `touched` | Unix timestamp of last write | — |

From these, SAGE derives **EPS = sal × (255 − conf) / 255** — the *epistemic pressure signal*. A record with high EPS has been consulted often but remains poorly understood. That's a record asking to be revisited.

High EPS is not a problem to fix — it's a signal to follow. The records with the most pressure are where the most learning is waiting.

### The umwelt basis

**This file is your umwelt.** Jakob von Uexküll's *umwelt* is the species-specific perceptual slice each organism inhabits — not the world, but the world as it registers to a particular perceiving subject. Your companion file is exactly this: a bounded, personal record of what is *sign-worthy* to you. Not a comprehensive catalog. *Experiential sufficiency*.

This is why incompleteness is a feature, not a bug. A record with low `conf` is one where the model hasn't been built yet. A record with high EPS is one where the transition from *"I've noted this"* to *"I understand this"* hasn't happened yet. SAGE's job is to help you complete those transitions — not to fill every field.

*(Formal grounding: [TTDB-RFC-0006 — Experiential Perception as Synthetic Model](RFCs/TTDB-RFC-0006-Experiential%20Perception%20as%20Synthetic%20Model.md))*

---

## The records

The file ships with seven working records arranged on a conceptual globe:

- **latitude** = stability: north is permanent and foundational, south is immediate and ephemeral
- **longitude** = sphere: west is inner/private, east is outer/relational

| Record | Coordinate | Purpose |
|---|---|---|
| SAGE (anchor) | `@LAT0LON0` | Identity root — who SAGE is and how memory works |
| Welcome | `@LAT-10LON0` | Entry point and navigation table |
| Your Profile | `@LAT40LON-30` | Who you are — fill this in first |
| Values & Commitments | `@LAT30LON-20` | What you will not compromise on |
| Active Goals | `@LAT20LON0` | What you are working toward now |
| Default Network | `@LAT0LON20` | What SAGE does between conversations |
| Open Questions | `@LAT-20LON0` | What you have not figured out yet |
| Log (template) | `@LAT-50LON10` | Session notes and observations |

You can add records anywhere. New permanent insights go north; ephemeral notes go south. Personal records go west; outward-facing ones go east.

---

## Customizing

**Rename the companion**: find-and-replace `SAGE` → your chosen name throughout the file. The invocation prefix in the `mmpdb` block updates automatically.

**Fill in Your Profile**: this is the most important step. The `conf:64` on that record is a signal that it's incomplete — raise it toward `200` as SAGE's responses start to consistently reflect who you are.

**Add goals**: open the Active Goals record and add rows to the table. One goal per row. When a goal is done or abandoned, move it to a log record with an outcome note — don't delete it.

**Grow the Open Questions list**: when something is unresolved, add it to Open Questions. When it's resolved, move the answer to the relevant record and remove the question.

**Adjust conf**: `conf` is yours to set. Low conf = "I'm not sure this model is right." High conf = "this reliably predicts my reactions." Update it when you notice a gap or when a record is clearly working.

---

## Keeping a log

Log records are ephemeral (far south on the globe) and append-only — you never overwrite them. The template record at `@LAT-50LON10` shows the format. When you have a significant session or a discovery worth preserving:

1. Add a new log record at the next available coordinate (`@LAT-60LON10`, `@LAT-70LON10`, etc.)
2. Fill in the `session-log` block with the timestamp and trigger
3. Write what happened, what SAGE noticed, and what records changed
4. Link to changed records using toot links: `[record name](latXlonY)`

The log is SAGE's audit trail. It is how you know what changed and when.

---

## Adding new records

When you learn something worth keeping, add a record:

```markdown
@LAT[x]LON[y] | created:[timestamp] | updated:[timestamp] | relates:[edges]
[ew]
conf:128
rev:0
sal:0
touched:[timestamp]
[/ew]

## Record Title

Body text here.
```

Place it by what it is: permanent insight goes north, working material goes center, log entries go south. Private thoughts go west, things about your relationship to the world go east.

Link records to each other with typed edges in the `relates:` field: `serves>@LAT20LON0` means "this record directly informs that goal." `questions>@LAT40LON-30` means "this record holds an open question about your profile."

---

## Viewing in the browser

`companion.md` can be loaded in the Toot Toot Engineering viewer at [antfriend.github.io](https://antfriend.github.io):

```
https://antfriend.github.io/?ttdb=companion.md
```

*(Works with files hosted on the same server. For local use, run `python service.py` from the repo root.)*

The viewer renders the globe, navigates between records, and displays `[ew]` indicators. Markdown tables in record bodies render as formatted tables.

---

## Part of the TTE stack

`companion.md` implements the **TTDB** (MyMentalPalaceDB) file format — the same format used by the A32 autonomous ESP32 agent framework, the Toot Toot mesh network node logger, and the A32 Mega multi-corpus librarian. A companion you build here can be compiled into a deployment TTDB for a microcontroller, federated across a TTN mesh node, or extended into a multi-corpus mega instance.

The file format spec: [`RFCs/TTDB-RFC-0001`](RFCs/TTDB-RFC-0001-File-Format.md) · [`RFCs/TTDB-RFC-0005`](RFCs/TTDB-RFC-0005-Epistemic-Weight.md) (epistemic weight)

---

*One file. No server. No account. The companion is yours.*
