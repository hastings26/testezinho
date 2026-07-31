## ☁️ MIP for Sellers (101) — a rehearsal room for one conversation

`mip-sellers/index.html` is a standalone, single-file learning experience for Pax8 EMEA CAMs,
built to the "MIP for Sellers 101 experience blueprint". Open the file in a browser.

**The spine is one sentence.** The learner tries to say it at minute one and fails. They are
given it at minute three, use it six times under escalating pressure, and say it one last
time — cold, unprompted — at minute thirty-three. Screen 10 shows their first attempt sitting
above their last one. That before/after is the entire payoff; there is no score and no confetti.

**Fifteen screens, ~45 minutes**, one decision each:

0. Entry — the question they're afraid of. An optional "what this is" route for anyone who wants the overview first.
1. **Productive failure** — define a MIP in one sentence, before any teaching. Not graded, on purpose.
2. **Module 1 hub** — what the module is, why it matters, what you leave with. Placed *after* the 60-second test so the failure still lands.
3. The sentence, revealed in stages, plus a **press-and-hold** that won't advance until it's held for three seconds and said out loud
4. **Module 2 context** — the Agentic Inflection Point, margin compression to 2027, what partners keep telling us, why sellers are being asked to build this
5. Match the fear — three partner quotes, three fears underneath them
6. **Module 3 concepts** — what a chatbot, an assistant, Digital Labor and a Digital Workforce actually are, and where Copilot sits
7. Hear their level — Chatbots → Assistants → Digital Labor → Digital Workforce
8. **The placement tool** — two questions resolve a partner live into Early Discovery / Exploring / Investing, run twice
9–10. **Two branching conversations** — the partner who tried and stopped, then the partner who's ahead of you. Weak choices don't fail; the partner just gets harder and switches to a colder line
11. One door, two routes (Agent Store → MIP Program / Managed Intelligence Services), then a four-tap logging build
12. **The corridor** — Bella Center, no options, no hints, no progress bar
13. Their two answers, side by side
14. What you keep — the sentence, the rep card, what's next

**The learning hub.** Every module offers the same four ways in — a short video, a podcast, a written guide, or straight to the
exercise. Modules 1–3 get a full context screen; every module is also reachable from a persistent **Resources** drawer that adapts
to wherever the learner is. The core message lives in the screen copy itself, so format choice never changes what anyone receives.

**Languages.** A working switcher across seven EMEA locales. `CONTENT[locale]` swaps every data-driven string and `UI[locale]`
swaps any static node carrying `data-i18n` — English is complete, and a vendor populates one object per locale. Non-English
selections switch the interface and show a clear "translation in review" state rather than machine-translating Pax8's approved
definition.

**Build contract** — single file, no CDN, no `localStorage`, no native `<select>`, finger-sized
tap targets, tested at 320/375/1280px. SCORM-safe: exposes `window.TES.ready()`,
`saveState()`, `loadState()`, `complete(score)` plus matching `tes:*` CustomEvents, with
no-op stubs so it runs standalone.

Insertion zones are marked rather than invented: the PBF / Salesforce logging steps, the rep-card PDF (with a print fallback in
the interim), every video and podcast asset, live Partner Insights data, Infinity Group case-study assets, and the mapping of the
four levels to Microsoft's published AI strategy — which needs a confirmed Product Marketing source before it goes near a seller.

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
