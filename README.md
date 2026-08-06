## 🧭 Revenue Enablement Portal — Highspot design prototype

`highspot.html` is a standalone, clickable prototype of the Revenue Enablement portal.
Open the file in a browser (or serve the folder and visit `/highspot.html`).

**The information architecture:**

```
Revenue Enablement Homepage
├── Featured Heroes
│   ├── Important programme
│   ├── Mandatory or time-sensitive activity
│   └── Major announcement or launch
├── Farmers Programmes & Soft Skills  → dedicated lane subpage
├── Salesforce & Technology           → dedicated lane subpage
└── MIP & AI                          → dedicated lane subpage
```

- **Featured Heroes** — exactly three hero cards at the top of the homepage, one per type:
  an important programme, a mandatory or time-sensitive activity, and a major announcement or
  launch. Each carries its lane's illustration and links to its lane.
- **The lanes** — three cards led by a bespoke inline-SVG illustration per lane (sprouting field
  for Farmers, pipeline-and-nodes for Salesforce & Technology, orbit-and-spark for MIP & AI), with
  owner, live priorities and a round go-arrow. No instructional copy anywhere — the design carries
  the wayfinding.
- **Every lane page is a main page** — a large hero with the lane's illustration and its number-one
  priority embedded, then all sections visible in one scroll (Priorities · Learn · Use ·
  Updates & Help) with nothing hidden behind tabs. Use keeps the **Share with Partners** /
  **Do Not Share** split.
- **Recently Updated** — every change across the three lanes, newest first; rows open the lane's
  Updates tab.
- **Global search** — press `/` or `⌘K`; results are grouped and open the right lane subpage with
  the right tab selected.
- **Status badges** throughout: `Partner Ready`, `Internal Only`, `Restricted`, `Draft`.

**Visual direction:** Pax8-light neumorphism — one cool blue-grey material for everything, kept
deliberately light (no black or deep-blue grounds). Elements are extruded from the surface with the
dual-shadow pair or pressed into it: the search field, tab track and badges are engraved wells, Do
Not Share rows sit recessed, and buttons press in on click. The Pax8 identity carries through in
the accents: Pax8 Blue for MIP & AI and the cloud mark, teal for Farmers, cyan for Salesforce &
Technology, gold for deadlines — and the signature **rainbow line** returns as a softened gradient
engraved into the surface under every section heading. Plus Jakarta Sans throughout.

- Pure offline, no build step, no dependencies beyond Google Fonts. Hash routing:
  `#/` home, `#/lane/<id>/<tab>` lane subpages.
- **All lanes, assets and updates are illustrative placeholders** — this is a design artefact for
  reviewing structure and feel, not a content source.
- Edit `LANES` and `HEROES` at the top of the inline `<script>` to reshape the whole portal.

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
