# Beyond 2026 Command Center — maintainer guide

**Not published.** This guide lives in `beyond-internal/` because it documents
the editorial line taken with the field. Keeping it out of `beyond/` means it is
not part of the deployed artifact.

The hub itself is a static, no-build site. Open `beyond/index.html` in a
browser, or serve the repo and visit `/beyond/`.

Built to the Pax8 Brand Design System (2025 v.01): black and deep-blue
backgrounds, Plus Jakarta Sans, Pax8 Blue `#1D4ED8` and Pax8 Teal `#00D09C`,
the rainbow gradient rule, the blue-to-green left edge stripe, and the logo
and copyright footer on every view.

## The four principles it implements

1. **One source of truth.** Every asset is registered once, in `content.js`.
   Sections link to the same registered entry instead of holding their own
   copy — which is what stops the duplicate-SharePoint problem recurring.
2. **Topic-based navigation, not role-based.** The sidebar is organised by
   subject so content stays findable when someone's responsibilities change,
   and so multiple teams reach the same resources. "Common routes through the
   hub" offers task shortcuts without gating anything by job title.
3. **Named ownership.** Every section carries an owning team, a named owner,
   a last-reviewed date and a review cadence, rendered into the header of
   every page in that section.
4. **Visible gaps.** Assets that do not exist yet are registered with status
   `needed` rather than omitted, and the Governance page turns them into a
   live backlog.

## Structure

| File | What it is |
|------|------------|
| `index.html` | The shell — sidebar, topbar, search overlay, footer. Holds no content. |
| `content.js` | **The only file you edit to change content.** Site metadata, owner registry, and every section, page and asset. |
| `app.js` | Renderer, hash router, search index and the generated governance report. |
| `beyond.css` | Pax8 brand design system. |
| `assets/` | Pax8 logo. |
| `../beyond-internal/` | Leadership view and content backlog. Not deployed. |

Navigation is hash-based (`#/section/page`), so the whole hub is one page load
and works on GitHub Pages with no server-side routing.

## Sections

Twelve in total — eleven topic sections plus Governance:

Getting Started · Event Overview · Beyond Story · AI & MIP ·
Managed Intelligence Services · Agent Store · Salesforce & Beyond Hub ·
Recommendations & Follow-up · Training & Readiness · Sales Resources · FAQs ·
Governance & Ownership

## Editing content

Everything lives in `content.js`, which documents its own block types at the
top of the file. A page is an array of blocks:

```js
{ id: 'my-page', title: 'My page', summary: 'One line for the index.',
  blocks: [
    { t:'lead', text:'Opening paragraph.' },
    { t:'numbered', items:[{ title:'First', text:'…' }] },
    { t:'assets', items:[
      { label:'A deck', type:'Deck', href:'https://…', status:'live', owner:'Product Marketing' },
    ]},
  ]}
```

Available block types: `lead`, `p`, `h`, `list`, `numbered`, `cards`, `steps`,
`assets`, `faq`, `callout`, `table`, `stat`, `timeline`.

### Asset status

Only two values are valid in `content.js`:

- `live` — it exists, and `href` points at it. Renders as a link marked
  **Available**.
- `coming` — releasing shortly, and knowing it is coming helps the CAM plan.
  Renders as **Coming soon**, with no link.

Use `coming` sparingly. It is for things a CAM would otherwise go looking for
elsewhere — a training date, a walkthrough, a recording. It is **not** a way to
list everything still in production; that belongs in the internal backlog.

Anything else — not started, no URL, not signed off, blocked on a decision —
does not go in this file at all. Add it to `beyond-internal/backlog.js`.

### When an asset becomes ready

1. Add or update the entry in `beyond/content.js` with `status:'live'` and a
   real `href`.
2. Delete the matching entry from `beyond-internal/backlog.js`.

## Search

Press <kbd>/</kbd> or <kbd>⌘K</kbd> anywhere. The index covers section blurbs,
page titles and summaries, all body text, and every registered asset by name,
type, note and owner. Arrow keys to move, Enter to open.

## Current state

The **structure and copy are complete**; the **link registry is not** — no live
URLs (SharePoint, Highspot, LMS, Salesforce) have been supplied yet, so no asset
is `live`. Open `beyond-internal/leadership.html` for the prioritised worklist.

The field-facing copy is written to stand on its own without those links. Where
something is genuinely undecided, the hub tells the field what **is** confirmed
and what to build the conversation on, rather than naming the gap — the MIP play
framework is the worked example. The full editorial line, and every decision
being routed around, is documented in the leadership view.

## Tone rules for this hub

The field hub is a sales asset, not a project tracker. When editing:

- Never write "TBC", "known issue", "known gap", "not yet decided" or
  "to be confirmed" into `content.js`.
- Never publish a placeholder figure. Omit the number instead.
- Where guidance depends on something unconfirmed, phrase it as normal sales
  discipline ("check the current position before putting a date in writing"),
  not as an admission.
- Where a decision is open, say what **is** settled and point the field at it.
