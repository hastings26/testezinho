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
| 🎯 Quiz Quest | Progressive multiple-choice (Millionaire-style) with a 50:50 lifeline | `quiz.html` |
| 🔤 Word Recall | Wordle / Lingo recall, survival streak over key terms | `wordle.html` |
| 💀 Hangman | Vocabulary recall, hint-driven | `hangman.html` |
| 🧠 Memory Match | Match each term to its meaning | `memory.html` |
| ⚖️ Judge Mode | Read several AI answers and approve the best — teaches judgement, not recall | `judge.html` |
| 🎯 Choose the Right Tool | Pick the right tool (ChatGPT, Copilot, agent, search, human…) for each task | `tool.html` |

Topic packs included: **AI Literacy**, **Microsoft 365 Copilot**, **Security
Awareness**, **B2B Sales Skills**. (Judge Mode and Choose the Right Tool are
AI-judgment games — they need `scenarios` / `tooltasks` content, which the AI
Literacy pack provides; other topics gracefully fall back.)

The library hub (`index.html`) also shows the **roadmap** — game-show formats,
board games, and the remaining AI-judgment mechanics (Detective Mode, Red Team,
AI vs Human, Build/Repair the Prompt, Escape Room) — as "coming soon" cards.

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

A pack without `tooltasks` / `scenarios` simply shows a friendly note in those
two games — every other game still works.

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
