# Onboarding World Map — continuity brief

Paste this whole file into a new chat before asking for sub-sessions, decks, or any
new screen. It carries the look, the voice, the mechanics and the factual guardrails
so the next thing built matches the map instead of drifting.

---

## 0. Read me first

You are continuing the **Onboarding World Map** — a pixel-art overworld that walks a
Pax8 EMEA new starter from START to a castle through six worlds. It already exists and
works; new work extends it, it does not restart it.

- Live map: https://claude.ai/code/artifact/803b6fb3-bad3-4b22-98c1-1a7199fd73f9
- Repo: `hastings26/testezinho`, folder `onboarding/` (PR #22, branch
  `claude/onboarding-world-map-kjcd0s`)
- Files: `index.html` · `map.css` (all design tokens) · `map.js` (movement engine) ·
  `world-data.js` (**all content**) · `assets/world-map.png` · `assets/hero.png` ·
  `tools/trace-road.py` · `tools/make-hero.py`

**Always end a reply with a live clickable link** to whatever was built — artifact URL
at the top, file paths and PR links only as extras.

---

## 1. The world

Six worlds along one yellow road, in this order, and the numbering is fixed by the
artwork:

| # | World | What it is |
|---|-------|------------|
| — | START | Day Zero — kit, buddy, diary |
| 1 | Welcome to Pax8 | The company, the marketplace model, partner-first |
| 2 | Meet the MSP | The customer's P&L, vocabulary, pressure |
| 3 | The MIP Shift | MSP → MIP, the Agentic Inflection Point, the 2027 deadline |
| 4 | Marketplace | Quote → provision → bill → renew, plus Agent Store |
| 5 | Make It Happen | The conversation: discovery, objections, follow-up |
| 6 | Final Challenge | Castle gate — five questions, pass 4 |

Coins on the road are checkpoints. Worlds unlock in order. Nothing is completed until
every objective is ticked.

---

## 2. Visual identity

**Palette** (exact — these are the CSS custom properties in `map.css`):

```
--ink       #0b1020   page ground, deepest navy
--ink-2     #131a33   raised surfaces, buttons at rest
--edge      #2b3766   every border, 4px, never thinner
--paper     #f4ead6   the map's sign-board cream, use sparingly
--blue      #1d4ed8   Pax8 blue — primary action
--blue-lit  #3b82f6   hover only
--teal      #00d09c   success, completion, progress fill
--gold      #f6c945   headings, current checkpoint, rewards
--gold-deep #b8860b   gold's shadow side
--red       #e2554a   failure, locked rejection
--text      #eef2ff   body text
--muted     #a9b4d6   labels, captions, secondary
```

Sprite palette (if you draw more pixel art): outline `#1a1430`, hair `#4a3022`, skin
`#f5c89b`, shirt `#1d4ed8`, accent `#00d09c`, trousers `#2c3a5c`, shoes `#3a281c`.

**Type.** `Press Start 2P` (Google Fonts) for headings, HUD, badges and numerals only —
never for running text; it needs `line-height: 1.4`+ and gets unreadable in paragraphs.
Body is the system UI stack. Uppercase labels get `letter-spacing: 0.06em–0.14em`.

**The pixel rules — this is what makes it feel like one thing:**

- Borders are `4px solid var(--edge)`. Square corners everywhere; the only circles are
  coins and checkpoint markers.
- Shadows are hard offsets, never blurs: `box-shadow: 0 4px 0 #0006`. Buttons press down
  with `transform: translateY(3px)` and a shorter shadow.
- Every raster image gets `image-rendering: pixelated`.
- Animation steps, it does not ease: `steps(1)` sprite cycles, `steps(8, end)` on the
  progress bar. Smooth easing is reserved for the character moving along the path.
- No gradients except the two already in use (the HUD's vertical navy, the progress
  bar's repeating teal stripe) and the page's single radial glow.
- No rounded cards, no emoji as section markers. The only glyphs in the UI are
  `▶ ✓ ✕ ★ ◄ ► 🔒 ♪ ↺` and the world numerals.

**Committed to one theme.** Dark navy game chrome, no light mode. Paint background and
colours explicitly so the page holds on any host ground.

---

## 3. Voice

Second person, present tense, short declarative sentences. British spelling. Em dashes
for the turn in a thought. No exclamation marks, no "exciting journey", no corporate
filler, no emoji in prose.

Every objective is a verifiable act, not a feeling: "Listen to a recorded partner call
end to end", not "Understand our partners". Rewards are dry and slightly deadpan:
"Badge earned: Speaks Partner."

Key points are load-bearing facts, one per line, each one usable out loud in a partner
conversation. The tone is a colleague briefing you before you go into a room — not a
course narrator.

Microcopy patterns already in use, match them:
- Locked: `Locked — finish World 1 first.`
- Complete: `World 1 complete — World 2 unlocked.`
- Gate pass: `5 / 5 — the gate opens.`
- Gate fail: `3 / 5 — not yet. Review the marked answers and try again.`

---

## 4. Mechanics and feel

- **Movement.** The character walks; it never teleports. Travel is eased in and out,
  `260` path-units/second, clamped to 0.6–4.2s. It flips to face its direction and runs
  a two-frame walk cycle, then plays a cheer frame on arrival.
- **Gating is real.** A locked checkpoint shakes, buzzes, and names what is blocking it.
  Complete is disabled until every objective is ticked — the button says
  `✓ Tick every objective` while it waits.
- **Sound** is a tiny WebAudio square-wave synth, no files: footstep `160Hz/40ms` at
  0.025 gain, arrival `523·659·784`, completion `659·784·988·1319`, rejection `120Hz`
  sawtooth. Anything new should sit in that vocabulary.
- **Progress persists** in `localStorage` under `pax8-onboarding-map-v1`. New surfaces
  use `pax8-onboarding-<thing>-v1`. Bump the version when the shape changes.
- **Accessibility is not optional.** `prefers-reduced-motion` snaps instead of animating,
  everything is reachable by keyboard with a visible gold focus ring, Escape closes,
  arrivals announce via `aria-live`.

---

## 5. Technical patterns to reuse

- Positions are **percentages of the container**, never pixels — that is what makes the
  map responsive with no recalculation on resize.
- The route is one invisible SVG `<path>` in a `viewBox="0 0 1448 1086"` matching the
  artwork's pixel coordinates; the character is placed with `getPointAtLength()` inside
  a `requestAnimationFrame` loop.
- Content lives in a data file (`world-data.js` → `window.ONBOARDING_MAP`), never inside
  the engine. No `fetch()` — it must work from `file://`.
- **Single-file artifact build:** inline the CSS and JS, embed images as `data:` URIs,
  `@import` the Google font, and emit no `<!DOCTYPE>/<html>/<head>/<body>` (the artifact
  wrapper supplies them). Scripts may only come from cdnjs; everything else must be
  inlined. Downloads inside an artifact need
  `capabilities: {downloads: true}` and `claude.use('downloads')`.
- Keep the artwork untouched. If the map art changes, re-run `tools/trace-road.py`
  rather than hand-editing the path.

---

## 6. Presentations — the deck spec

Decks are **HTML, published as an artifact**, in the same world:

- 16:9 slides, one idea each, keyboard driven (`←` `→` `Space`, `Home`/`End`), plus a
  thin gold progress rail along the bottom edge and a slide counter in `Press Start 2P`.
- Same palette and pixel rules as above. Section openers use the big world numeral in a
  blue badge, exactly like the map's checkpoint badges.
- Statements, not bullet soup: a slide is one claim plus its evidence. Where a slide
  carries a number, the number is the slide.
- Optional pixel-art motif from the map (a coin, the road, the castle) — pulled from the
  existing artwork, not redrawn in a different style.
- A speaker-notes toggle (`N`) is welcome; presenter-only content never renders on the
  slide itself.

---

## 7. Content guardrails — Pax8 / MIP

The facts below are the sanctioned ones. Do not invent statistics, dates or case studies.

- **MIP** = Managed Intelligence Provider — the next evolution of the MSP: orchestrates
  AI agents and sells business outcomes instead of managing devices and licences.
- **AIP** = Agentic Inflection Point — agents moving from passive copilots to autonomous
  systems that execute outcomes.
- Traditional MSP margins are **projected to fall 30–50% by 2027** for providers who do
  not evolve. Around **75% of SMBs** are already experimenting with AI. Agents can
  automate **70–90%** of a workflow.
- Three value drivers: **grow the business, increase efficiencies, reduce risk.**
- **Infinity Group (UK)** is the produced EMEA MSP-to-MIP case study. Escalations go to
  **mip@pax8.com**. The hub is **AI@Pax8** on SharePoint.
- **The plays framework is not reconciled** — Playbook v2 lists five (Discover, Buy,
  Build, Sell, Manage), the pilot battlecard lists six (adds Implement). Never present
  either as settled; flag it and say to confirm with the enablement lead.
- All existing copy is a **first pass pending Revenue Enablement review**. Say so when
  handing over anything new.
- The deadline is the argument. Inspiration without a date produces interest, not
  behaviour change — 2027 is what makes the MIP conversation urgent.

---

## 8. Still to be defined

**Sub-sessions.** The structure inside each world has not been decided yet. Whatever
shape it takes, it inherits everything above: the palette, the pixel rules, the voice,
the gating, the persistence convention, and the content guardrails. Ask for the
structure before building it.
