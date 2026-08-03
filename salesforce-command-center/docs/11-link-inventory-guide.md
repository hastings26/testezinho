# Link Inventory — how to connect real content

Every link in the prototype has its own **slot**: a stable, unique ID. Supply a URL against a slot and it
connects everywhere that thing appears. You never edit a page, and you never edit the code.

**109 slots**, across nine categories. Open the **Link Inventory** page in the prototype (footer link, or
`#/links`) to see live status at any time.

---

## The process

1. **Export the list.** Link Inventory page → *Download as CSV*. One row per thing that needs a URL, with
   its slot ID, what it is, which topics it appears in, and an empty *URL* column.
2. **Send it to the content owner.** They fill the URL column. They do not need access to the code, and they
   do not need to understand the slot IDs — the *What it is* column is written in plain language.
3. **Paste the URLs into `links.js`.** One line per slot, already listed and grouped with comments. Paste
   between the quotes.
4. **Reload.** Every placeholder for that slot becomes a real link, on every page it appears.

```js
// before
'DASHBOARD/emea-pipeline-health': '',

// after
'DASHBOARD/emea-pipeline-health': 'https://your-salesforce-instance/lightning/r/Dashboard/...',
```

`links.js` is the **only** file that changes. Not `index.html`, not `app.js`, not `data.js`.

---

## Three states, deliberately distinct

| Value in `links.js` | State | What it means | Shown as |
|---|---|---|---|
| `''` | **Awaiting URL** | The content exists somewhere. We just need the link. | Purple placeholder naming its slot |
| `'TBC'` | **To be created** | The document does not exist yet. Somebody has to write it. | Amber placeholder, *"to be created"* |
| `'https://…'` | **Connected** | Live link, opens in a new tab | Normal link with ↗ |

Keeping *awaiting URL* and *to be created* separate is the point. They look identical on a page and they are
completely different problems: one needs an email, the other needs an author and a deadline. The counter on
the Link Inventory page gives you the honest size of each.

---

## Slots are shared where the thing is shared

The same dashboard used by four topics is **one slot**, so you are never asked for the same URL twice, and a
change is made once.

Verified: filling `DASHBOARD/emea-pipeline-health` alone connects it on the Pipeline Management topic page,
the Dashboard Usage topic page, Track and Measure, and Resources and Enablement simultaneously.

The same applies to canonical sources — a topic's canonical source is one slot even though it renders in the
action row, the governance table, the documentation list and the internal assets column.

---

## The nine categories

| Category | Slots | Who typically supplies it |
|---|---|---|
| Slack assistant | 1 | Whoever runs the existing assistant |
| Canonical sources | 13 | Process owners — RevOps, Sales Leadership, Marketing, Presales |
| Highspot topic pages | 14 | Created as each topic is published in Highspot |
| Dashboards | 16 | RevOps |
| Training | 18 | Revenue Enablement / Workday |
| Documentation | 9 | Process owners |
| Internal assets | 25 | Content owners |
| Partner-facing assets | 12 | Content owners + Product Marketing sign-off |
| Digital Rooms | 1 | Revenue Enablement |

Slot ID format is predictable: `SF-001/canonical`, `SF-001/topic`, `DASHBOARD/<name>`, `TRAINING/<name>`,
`DOC/<name>`, `ASSET/<name>`, `ROOM/<name>`, `GLOBAL/slack`.

---

## Three kinds of link, and what to do with each

**Already live in the business.** Dashboards, Workday courses, existing standards. Supply the URL now.

**Exists but has to move into Highspot.** Material in SharePoint, decks or Teams. Supply the current link
now so the prototype is usable, then replace it with the Highspot URL once published. **The slot ID does not
change** — that swap is a one-line edit later.

**Does not exist yet.** Mark `TBC`. The count becomes the content backlog, and it is visible rather than
discovered three weeks into the build.

---

## If content is added or removed

The inventory is **generated from the content model**, not maintained by hand — so it cannot drift. Add a
topic or an asset to `data.js` and its slots appear in the inventory automatically, marked *Awaiting URL*.

Regenerate `links.js` with every slot pre-listed:

```bash
node -e "
const fs=require('fs'),vm=require('vm');
const ctx=vm.createContext({console});
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);
console.log(vm.runInContext('collectSlots()',ctx).map(s=>s.id).join('\n'));
"
```

Existing URLs in `links.js` are keyed by slot ID, so they survive — only genuinely new slots need filling.
