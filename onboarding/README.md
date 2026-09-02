# Onboarding World Map

A pixel-art overworld that walks a new starter through Pax8 EMEA onboarding: a
character follows the yellow road from **START** to the castle, stopping at six
worlds. Each stop opens a briefing with objectives to tick off; the last one is
a five-question gate.

Open `onboarding/index.html` — no build step, no server required, no backend.

```
onboarding/
  index.html        page shell
  map.css           chrome, markers, sprite
  map.js            movement engine + progress state
  world-data.js     THE CONTENT — route, checkpoints, objectives, quiz
  assets/
    world-map.png   the artwork (1448×1086, 256-colour, ~830 KB)
    hero.png        4-frame sprite sheet (16×24 per frame)
  tools/
    trace-road.py   re-traces the road into an SVG path
    make-hero.py    regenerates the sprite sheet
```

## How it works

The architecture is the one recommended in the Executive Summary research:
**static PNG background + an invisible SVG `<path>` traced along the road + a
sprite moved with `path.getPointAtLength()`.**

- The artwork is never redrawn or sliced — it is a plain `<img>`.
- `world-data.js` holds `map.pathD`: a single SVG path traced down the centre of
  the yellow road, in image pixel coordinates (viewBox `0 0 1448 1086`).
- Each checkpoint has `pos` — its position along that path as a fraction of total
  length — plus `x`/`y` for its marker. The engine animates between two `pos`
  values with `requestAnimationFrame`, flips the sprite by comparing successive
  x coordinates, and plays a walk cycle while moving.
- Positions are written as percentages of the container, so the map is fully
  responsive: no recalculation on resize, and no coordinate drift.

**The road has a gap.** The artwork's yellow road does not connect World 3 to
World 4 — they are on different sides of the river with no bridge between them.
The traced route therefore walks back west along the top road and cuts south
across the open grass of the Marketplace island. If the art ever gains a road
there, re-trace and the detour disappears.

## Editing the content

Everything a person reads lives in `world-data.js`: `summary`, `keyPoints`,
`objectives`, `reward`, and the final `quiz`. Change the text and reload — no
other file needs touching.

Progress is stored in `localStorage` under `pax8-onboarding-map-v1`
(`meta.storageKey`). Bump that key if you change the checkpoint IDs, otherwise
returning users will resume against a route that no longer exists.

> **Content status:** the copy is a first pass written from the MIP / Pax8 EMEA
> enablement context. Have Revenue Enablement review it before it reaches real
> new starters — the MIP "plays" framework in particular is not yet reconciled
> across documents (5 plays in Playbook v2, 6 on the pilot battlecard), which
> World 3 flags rather than resolves.

## Re-tracing the road

If the map art changes:

```bash
pip install numpy pillow
cd onboarding
python3 tools/trace-road.py assets/world-map.png
```

It builds a mask of the road's colour, computes a distance transform so the
route prefers the centre line, runs A\* between the coins (crossing bridges and
outline gaps at a cost), then smooths and simplifies the result into a Bézier
path. Check `overlay.png`, then copy `pathD`, the anchors and the fractions from
`path.json` into `world-data.js`.

## Controls

| Action | What happens |
| --- | --- |
| **Continue** | Travel to the next checkpoint, or open it if already there |
| Click a coin | Travel there; locked coins shake and say what is blocking them |
| `D` | Toggle the traced route (also `?debug=1`) |
| `Esc` | Close the open panel |
| ♪ / ↺ | Sound on/off · reset progress |

Honours `prefers-reduced-motion` (movement snaps instead of animating), works
with keyboard and screen readers, and scrolls horizontally on phones while
keeping the character in view.
