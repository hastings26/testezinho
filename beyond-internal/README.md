# Beyond 2026 — Internal

**Not published.** The Pages workflow deletes this directory before uploading
the site artifact (see `.github/workflows/pages.yml`), so nothing here is
served alongside the field hub and nothing here is loaded by it.

## What this is

The field-facing hub in `beyond/` shows only finished content. Everything
deliberately kept out of it lives here:

| File | Holds |
|------|-------|
| `backlog.js` | Owner assignments still to be made, content that does not exist yet, and open decisions the field is working around. |
| `leadership.html` | Renders the above as a prioritised view. Open it directly in a browser. |
| `MAINTAINING.md` | How to edit the hub, the block reference, and the tone rules for field-facing copy. |

`leadership.html` reads `../beyond/content.js` as well, so it stays in step
with what the field actually sees.

## Why it is a separate file rather than a hidden page

A hidden route or a client-side password on a published page is obscurity, not
access control — the data still ships to every browser that loads the site.
Keeping the backlog in a file that is never deployed means there is nothing to
leak through view-source, the search index, or a stray link.

## Using it

Open `beyond-internal/leadership.html` in a browser. It shows:

- **P1 / P2 / P3 backlog** — every asset still to be produced or linked, with
  its owner and where it belongs in the hub
- **Open decisions** — each with its owner and, importantly, its *effect on the
  field*: what the published copy currently says instead
- **Section ownership** — owning teams and review cadences, and which have no
  named individual
- **Editorial line** — the tone rules applied to the field-facing copy, so a
  new content owner does not undo them

To share it with leadership, send the file or host it somewhere access is
actually controlled. Do not move it into `beyond/`.

## Keeping it accurate

When an asset becomes available:

1. Add it to `beyond/content.js` with `status:'live'` and a real `href`.
2. Delete the matching entry from `backlog.js`.

When a decision closes, remove it from `decisions` and update the field-facing
copy that was routing around it.
