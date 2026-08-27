# Beyond 2026 Command Center

A static, no-build hub for everything relating to Pax8 Beyond 2026. Open
`beyond/index.html` in a browser, or serve the repo and visit `/beyond/`.

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

- `live` — it exists and the link works
- `draft` — it exists but is not signed off for partner or rep use
- `needed` — it does not exist yet, or no URL has been supplied

Status drives the content gap report at `#/governance/report`, which is
generated from `content.js` at render time and therefore cannot go stale.

### Review dates

Each section has `reviewed` (an ISO date) and `cadence` (`Monthly`,
`Quarterly`, `Half-yearly` or `Annually`). The app computes the due date and
flags anything overdue in the page header and on the governance report.

## Search

Press <kbd>/</kbd> or <kbd>⌘K</kbd> anywhere. The index covers section blurbs,
page titles and summaries, all body text, and every registered asset by name,
type, note and owner. Arrow keys to move, Enter to open.

## Current state of the content

The **structure and copy are complete**; the **link registry is not**. All 77
registered assets are currently marked `needed` because no live URLs
(SharePoint, Highspot, LMS, Salesforce) were supplied. Populating `href` and
flipping `status` to `live` is the next step, and the governance report is the
worklist for it.

Two other things are deliberately left as placeholders rather than invented:

- **Named owners** all read `TBC` in the `OWNERS` registry at the top of
  `content.js`. Assigning them is the first governance action.
- **Event figures** (attendance, recommendations generated) are `TBC` and
  carry a visible warning against external use until Events and Sales Ops
  confirm the final dataset.

Content that describes unresolved source-document disagreements — such as the
MIP play count differing between the Playbook, the pilot battlecard and the
AIP report — says so explicitly rather than picking a version.
