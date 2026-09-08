## 🎮 Onboarding Request — 8-bit hiring-manager prototype

`onboarding-request.html` is a standalone, front-end-only prototype of an onboarding
request form for hiring managers. Open the file in a browser — no build step, no server,
no external dependencies, no network calls.

A manager enters the new hire's name, department, role, start date and their own name.
From department + role the page derives the **mandatory** learning modules, locks them so
they can't be removed, lets the manager add optional modules on top, and calculates the
total learning time and the number of onboarding days live.

- **Mandatory = department baseline ∪ role mapping**, de-duplicated. The manager doesn't
  decide what is mandatory.
- **Locked and added modules are tracked separately**, so a manager's own additions survive
  a role change while the previous role's obligations disappear.
- **Day maths:** max 4 hours of sessions per day, and a started day counts as a full day —
  `ceil(totalHours / 4)`. 8 hrs is 2 days, 9 hrs is 3 days.
- **Reference case:** Sales + Channel Account Manager = 10 locked modules, 13 hours, 4 days.
- **Additional requests** cover anything outside the catalogue: given a duration they count
  towards the estimate, without one they are passed on to be scoped.
- **Shadowing** can be requested alongside the sessions; it does not change the estimate.
- Managers can **mail themselves a copy** (a `mailto:` draft) or copy the plan as plain text.

Submission is **explicitly simulated**. Nothing is sent, saved, booked or tracked; the
confirmation panel prints a system log describing what a connected version *would* do, and
says so. Refreshing the page resets everything — there is no persistence.

### Data

All content lives in one `DATA` object at the top of the script, in five collections that
mirror the intended future Excel structure: `departments`, `roles`, `modules`, `baselines`,
`roleMappingDelivery`. The renderer never names a department or module. The same data is
mirrored in `onboarding-data.json` for reference — the HTML does not fetch it.

> The role lists, baselines, module durations, owners and notification lists are
> **reconstructed placeholder data** for the prototype. They are not approved business data.

### Two views

The file holds two views, switched by URL hash so either can be linked:

- `#request` — the request form (the default)
- `#syllabus` — what every session covers, how long it runs, and who has to take it

The syllabus's "mandatory for" lines are derived from the same `baselines` and
`roleMappingDelivery` records that drive the locking, so the two cannot drift apart.

> The session summaries and topic lists on the syllabus are **illustrative copy written
> for the prototype**. They have not been reviewed by the teams who own the material, and
> the page says so. Replace them before showing this to anyone as a real curriculum.

`docs/onboarding-request-spec.md` is the full behavioural contract, including the known
differences between this prototype and the original written design, and an appendix
recording what has changed since the handoff.

### Test it

```
NODE_PATH=$(npm root -g) node tests/onboarding-request.mjs
```

106 checks against the spec: the reference case, the locked/added split, role and department
changes, the day maths, the `[ALL]` toggle, submit validation, the simulated log, the syllabus view and its derived
requirement lines, and that the page makes no external requests.

---

## 🗡️ NODARIA: The Broken Flow — a learning RPG for mastering n8n

`nodaria.html` is a standalone, playable vertical slice of a top-down action-adventure RPG
that teaches [n8n](https://n8n.io) automation concepts through play. Open the file in a
browser (or serve the folder and visit `/nodaria.html`).

**The fantasy:** the world once ran on the Great Flow — messages, warnings and supplies all
travelled on their own. Then the Great Disconnection shattered it. You are a young
**Flowkeeper** who can see the invisible links between things, armed with the **Nodeblade**.

**What this slice contains** — the full six-part quest loop in Soleil Village:

1. **Discover** a broken process — a caravan's six festival parcels arrive unsorted.
2. **Explore** the village (top-down, WASD/arrows) and talk to villagers.
3. **Learn a power** — recruit Node Spirit companions: **Triggi** (triggers), **Jessa**
   (items/JSON), **Ifrit** (branching logic).
4. **Build** the fix in a real, n8n-style **workflow builder** — add nodes, wire output ●
   ports to input ● ports, configure each node, then **Run the Flow** and watch every parcel
   land in a live sink read-out.
5. **Survive the disruption** — a late parcel arrives with a blank name and no RSVP. Your
   flow still runs "green" but silently returns a real guest. You must add a guard for the
   missing value and route it to human **Review**.
6. **Face the review** — **The Auditor** quizzes you on *why* it works (trigger type, empty
   vs. null, silent failure, human safety). Pass to rank up **Spark → Connector**.

Everything the doc calls out is modelled: the **companion system**, the **Flowfolio**
journal (every concept has *Tale / Mechanism / Real World* views), the impatient hint
creature **Bug** (Nudge → Clue → Reveal, costing mastery), infinite-loop detection, and
lost-message detection. The workflow builder *actually simulates data* through the graph you
wire — there is no single sacred answer, only flows that route every parcel correctly and
lose nothing.

- Pure offline, no build step, `localStorage` save under `nodariaSaveV1`.
- Dev/testing globals: `NODARIA_RESET()` wipes the save; `NODARIA_DEV` jumps into a builder
  challenge (used by the automated smoke tests).

---

# Learning Programme Quest — Game Edition

A full-screen retro-game-styled tracker for learning programmes. Real workflow underneath, JRPG chrome on top. Built to **present** and **track** at the same time.

## Run it

Open `index.html` in a browser. If the world map is blank, your browser is blocking `fetch()` of a local file — serve the folder instead:

```
python -m http.server
```

then open `http://localhost:8000`.

## What it does

- **Title screen** with PRESS START (click, Enter, or Space), save-select, and a NAME YOUR QUEST flow
- **World map** with terrain, mountains, lake, forest, sun, clouds, and ten pixel-art landmarks (village → throne)
- **A hero sprite** that stands at your current checkpoint and moves as you complete steps
- **Quest log dialog** for each checkpoint — INVESTIGATE prompts, PROOF checkboxes, JOURNAL notes, REWARD
- **Real progression gates** — checkpoints unlock in order (locked ones show 🔒 and can be previewed but not completed), and a step can't be marked complete until every PROOF box is ticked. Blocked attempts get a shake, a buzz, and a clear message — the same stops a learner hits in a real programme: do the work, collect the evidence, then move on
- **HUD** with level, XP bar, day counter, sound toggle, menu
- **Mark Complete** = particle burst, accurate +XP popup, screen shake, ascending arpeggio (if sound on), and a full LEVEL UP banner when you cross a level boundary
- **Victory screen** at 100% with stats: days elapsed, XP earned, proof captured, journals filled
- **Multiple quests** (party bar) — switch any time, each saves separately
- **Markdown export** — clean handover doc for stakeholders
- **Optional retro SFX** (Web Audio synth, off by default — toggle in HUD)
- **Pure offline, no dependencies** beyond Google Fonts

## Files

- `index.html` — structure
- `styles.css` — pixel-art aesthetic, animations
- `script.js` — game state, world generator, hero, quest log, particles, audio
- `template.json` — workflow definition (10 checkpoints with `icon` field per node)

## Edit the workflow

`template.json` — change any node's `label`, `title`, `stage`, `summary`, `questions`, `minimum`, `output`, or `icon`. Available icons: `village`, `library`, `council`, `tavern`, `workshop`, `forge`, `watchtower`, `training`, `battle`, `throne`.

You can add or remove nodes, but the world map's hand-placed positions and terrain are tuned for **ten** checkpoints. Adjust `NODE_POSITIONS` in `script.js` if you change the count.

## Storage

Everything in `localStorage` under `questGameStateV1`. Sound preference under `questGameSoundOn`. Clear via dev tools to wipe.

## Presenter tips

- F11 / fullscreen looks great
- Click **PRESS START** to open the door — feels like a real game intro
- Mark a checkpoint complete during the demo — the burst + level-up moment is the wow
