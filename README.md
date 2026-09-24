## ✂️ What is the purpose of life? — a paper-collage animation

`purpose.html` is a ~54-second, whimsical, hand-drawn **paper-collage** short made in pure
JavaScript: Canvas 2D for the visuals and the Web Audio API for the score and sound effects.
It uses no libraries, images or audio files. Open it and press play (sound on).

**The story, in eight 6.4-second scenes:** a ransom-note title asks the question → *to be happy*
(a sun rises, flowers pop up, Pip dances) → *to make something* (a cut-paper house flies in and
gets taped down, the pencil doodles in the details) → *to figure it all out* (chalk formulas pile
up until Pip gets dizzy) → *to love, and be loved* (Pip meets Bo on a paper doily) → *maybe it
isn't one big answer…* (one giant "?" bursts into six little snapshots on a clothesline) →
*…but lots of little ones, collected along the way* (moments fly into a glowing jar) → *so go
on… collect yours.*

- **Look:** torn-edge paper with white fibre fringes, drop shadows, paper grain, newsprint scraps,
  masking tape, and "boiling" sketchy ink lines. It runs at 12 fps on purpose, for a stop-motion feel.
- **Sound:** a C-major music-box tune over ukulele-style plucks, a pizzicato bass, woodblock,
  shaker and a warm pad (75 bpm, two bars per scene), plus paper foley: page-turn swooshes,
  tape rips, pencil scribbles, pops and jar clinks. All of it is synthesised and scheduled on the
  audio clock, so picture and sound stay in sync.
- **Controls:** click or <kbd>Space</kbd> to play/pause, <kbd>M</kbd> to mute, <kbd>R</kbd> to restart.
  Add `#t=30` to the URL to start part-way through.

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
