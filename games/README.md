# Learning Games Library

A small **engine** for on-demand learning games, not a pile of one-off games.
Every game is driven by a swappable **content pack** (a JSON file). Change the
topic, keep the proven mechanics.

Open `games/index.html` (served over HTTP — see note below) to browse the
library, pick a topic, and play.

## The idea

```
Pick a topic pack  →  pick a mechanic  →  questions are generated  →  play
```

A new training topic is a new JSON file, **not** new code. The same Quiz,
Wordle, Hangman and Memory engine works for "AI Literacy", "Copilot",
"Security", "Sales" — anything.

## What's playable today

| Game | Mechanic | File |
|------|----------|------|
All 24 mechanics below are **playable**. Every one is driven by the selected
topic pack.

**Quiz & review**

| Game | Mechanic | File |
|------|----------|------|
| 🎯 Quiz Quest | Millionaire-style multiple choice + 50:50 lifeline | `quiz.html` |
| 🎡 Trivia Wheel | Spin for a random question worth the segment's points | `wheel.html` |
| 🅱 Bingo | Match called clues to terms for a blackout | `bingo.html` |
| 📺 Jeopardy | Category × value board | `jeopardy.html` |
| 👪 Family Feud | Name the top survey answers (3 strikes) | `feud.html` |
| ⛓ Weakest Link | Timed rapid-fire chain with banking | `weakest.html` |

**Word & recall**

| Game | Mechanic | File |
|------|----------|------|
| 🔤 Word Recall | Wordle / Lingo survival over key terms | `wordle.html` |
| 💀 Hangman | Vocabulary recall, hint-driven | `hangman.html` |
| 🧠 Memory Match | Match each term to its meaning | `memory.html` |
| 🔎 Word Search | Find hidden terms in a generated grid | `wordsearch.html` |
| 📝 Crossword | Auto-generated crossword from terms + hints | `crossword.html` |
| 🔢 Countdown | Unscramble terms + a numbers round | `countdown.html` |

**Strategy & board** (each move is gated by answering a question)

| Game | Mechanic | File |
|------|----------|------|
| ⭕ Tic Tac Toe | Answer to claim a square, vs AI | `tictactoe.html` |
| 🔴 Connect Four | Answer to drop a disc, vs AI | `connect4.html` |
| 🐍 Snakes & Ladders | A question-gated learning journey | `snakes.html` |
| 🁢 Process Chains | Order the steps of a process (Dominoes) | `dominoes.html` |

**AI judgment** (teach decision-making, not recall)

| Game | Mechanic | File |
|------|----------|------|
| ⚖️ Judge Mode | Approve the best of several AI answers | `judge.html` |
| 🎯 Choose the Right Tool | Pick the right tool for each task | `tool.html` |
| 🕵️ Detective Mode | Read the evidence, work out what happened | `detective.html` |
| 🔴 Red Team | Flag every flawed claim in an AI output | `redteam.html` |
| 🎭 AI vs Human | Guess who wrote a message, and why | `aihuman.html` |
| 🧩 Build the Prompt | Pick the prompt that produces the output | `build.html` |
| 🛠 Repair the Prompt | Fix a terrible prompt | `repair.html` |
| 🗺 AI Escape Room | Use AI correctly to open each room's lock | `escape.html` |

### Topic packs (12)

AI Literacy · Microsoft 365 Copilot · Security Awareness · B2B Sales Skills ·
Leadership & Management · Communication Skills · Customer Service · Project
Management · Data & Analytics · Finance Basics · Marketing Fundamentals · New
Starter Onboarding.

Every pack drives every core game. The AI-judgment games use extra content types
(below) that the AI Literacy pack provides; any topic missing them shows a
friendly fallback that links to the AI Literacy set.

## Progression — one profile across every game

The library isn't 24 separate games; it's one platform. Every game feeds a
shared profile (in `localStorage`):

- **XP & levels** — earn XP every time you finish a game (more for new bests and
  perfect runs); 250 XP per level.
- **Daily streak** — play on consecutive days to build it.
- **Badges** — 15 achievements for breadth, streaks, levels and perfect runs.
- **Daily quests** — three rotating goals each day, with XP rewards.
- **Collection** — track which of the 24 games you've played and your best in each.

See it all on the **Profile / Trophy Room** (`profile.html`), and a live
XP/level/streak strip sits on the hub. Games call `Engine.recordPlay(game, pack,
score, opts)` at the end of a run; the engine handles XP, streaks, quests and
badges, and surfaces XP toasts plus level-up / badge banners.

## Files

```
games/
  index.html      library hub + catalogue (data-driven, easy to extend)
  games.css       shared pixel-art styling (mirrors the root Quest palette)
  engine.js       shared engine: pack loading, scoring, SFX, confetti, best scores
  quiz.* wordle.* hangman.* memory.*   the four playable games
  content/
    ai-literacy.json   sample topic pack
  README.md
```

## Add a new topic

Copy `content/ai-literacy.json`, change the content, and play it via
`?pack=<id>` on any game (e.g. `quiz.html?pack=copilot`). Add it to the
`PACKS` list in `index.html` to show it in the topic dropdown.

### Pack format

```jsonc
{
  "id": "ai-literacy",
  "title": "AI Literacy",
  "subtitle": "Foundations of working well with AI",
  "terms": [
    { "term": "PROMPT", "hint": "The instruction you give an AI" }
    // feeds Wordle, Hangman, Memory Match
  ],
  "questions": [
    {
      "q": "…?",
      "options": ["A", "B", "C", "D"],
      "answer": 0,            // index of the correct option
      "explain": "Why."
    }
    // feeds Quiz Quest
  ]
}
```

- `terms` — single A–Z words (4–9 letters work best for Word Recall) with a
  short hint. Powers Wordle, Hangman, and Memory Match.
- `questions` — multiple choice with the correct index and an explanation.
  Powers Quiz Quest.

Optional AI-judgment content (used by Judge Mode and Choose the Right Tool):

```jsonc
{
  "tools": [ { "id": "human", "label": "Human only", "icon": "🧠" } ],
  "tooltasks": [
    { "task": "Sign off a sensitive legal decision.", "answer": "human", "explain": "…" }
  ],
  "scenarios": [
    {
      "prompt": "Which AI answer would you approve?",
      "answers": [ { "text": "…", "verdict": "why it's good/bad" } ],
      "best": 0,          // index of the answer to approve
      "explain": "Why."
    }
  ]
}
```

Full list of optional content arrays and the game each powers:

| Field | Game |
|-------|------|
| `tools` + `tooltasks` | Choose the Right Tool |
| `scenarios` | Judge Mode |
| `chains` | Process Chains (Dominoes) |
| `repairs` | Repair the Prompt |
| `builds` | Build the Prompt |
| `aivshuman` | AI vs Human |
| `redteam` | Red Team |
| `cases` | Detective Mode |
| `rooms` | AI Escape Room |
| `surveys` | Family Feud |

A pack without a given field simply shows a friendly note in that one game and
links to the AI Literacy set — every other game still works. See
`content/ai-literacy.json` for a complete example of all of them.

## Add a new game

Each game is a small `.html` + `.js` pair that includes `engine.js`, reads a
pack with `Engine.loadPack()`, and renders into `#stage`. Use the existing
games as templates, then add a card (with its page) to `CATALOGUE` in
`index.html`.

## Running locally

The games use `fetch()` to load packs, so open them through a web server, not
`file://`:

```
python -m http.server
```

then visit `http://localhost:8000/games/`. On GitHub Pages this just works.

## Scores & sound

Best scores are kept per game + topic in `localStorage`. A shared Web Audio
synth provides retro SFX; toggle with the 🔊 button (preference is remembered).
