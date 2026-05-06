# Learning Programme Quest — Game Edition

A full-screen retro-game-styled tracker for learning programmes. Real workflow underneath, JRPG chrome on top. Built to **present** and **track** at the same time.

## Run it

Open `index.html` in a browser. If the world map is blank, your browser is blocking `fetch()` of a local file — serve the folder instead:

```
python -m http.server
```

then open `http://localhost:8000`.

## What it does

- **Title screen** with PRESS START, save-select, and a NAME YOUR QUEST flow
- **World map** with terrain, mountains, lake, forest, sun, clouds, and ten pixel-art landmarks (village → throne)
- **A hero sprite** that stands at your current checkpoint and moves as you complete steps
- **Quest log dialog** for each checkpoint — INVESTIGATE prompts, PROOF checkboxes, JOURNAL notes, REWARD
- **HUD** with level, XP bar, day counter, sound toggle, menu
- **Mark Complete** = particle burst, +XP popup, screen shake, ascending arpeggio (if sound on)
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
