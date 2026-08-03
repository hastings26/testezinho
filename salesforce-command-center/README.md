# EMEA Salesforce Command Center

**The governed operating system for Salesforce execution across EMEA Sales.**

A working prototype plus the strategy, architecture, governance model and Highspot build mapping needed to
implement it. Built to the master brief for Marco's Highspot page.

> ⚠️ **All content is illustrative placeholder.** Every owner, date, version, target, threshold, policy and
> change-history entry is invented to demonstrate the governance model. Nothing here is approved Pax8
> guidance and nothing should be quoted as such. Replace every record with its real canonical source before
> publication.

---

## Run the prototype

Open `index.html` in any browser — no build step, no dependencies, no network calls.

```bash
# or serve it
npx http-server . -p 8080     # then open http://localhost:8080/salesforce-command-center/
```

Deployed with the rest of the repository via GitHub Pages.

### Worth clicking

| Try this | What it demonstrates |
|---|---|
| Footer → **Link inventory** | All 165 link slots, live status, CSV export — the handover checklist |
| Change the role selector in the masthead | Role relevance — what is *primary* changes, what is *reachable* never does |
| Registry → filter **Has governance gaps** | Ownership and review gaps are derived, so they cannot be hidden |
| Topic → *AI Conversations with Partners* | How the system refuses to present unowned, unapproved content as authoritative |
| Assistant → *"What can I share with a partner about MIP?"* | The content-gap state — approved source exists, not yet published in Highspot |
| Assistant → *"What is our policy on discounting above 30%?"* | The no-approved-guidance state — it says so rather than inventing an answer |
| Any lane page | The internal / partner split, identical on every lane |
| Search for `zzzzz` | The designed zero-result state |
| Click any purple `↗` link | Honest placeholders — each names the token it will be replaced with |

---

## The ten outputs

| # | Output | Where |
|---|---|---|
| 1 | Experience Strategy | [docs/01-experience-strategy.md](docs/01-experience-strategy.md) |
| 2 | Information Architecture | [docs/02-information-architecture.md](docs/02-information-architecture.md) |
| 3 | Page Specifications | [docs/03-page-specifications.md](docs/03-page-specifications.md) |
| 4 | **Responsive HTML prototype** | `index.html`, `styles.css`, `app.js`, `data.js` |
| 5 | Highspot Build Mapping | [docs/04-highspot-build-mapping.md](docs/04-highspot-build-mapping.md) |
| 6 | Topic Content Template | [docs/05-topic-content-template.md](docs/05-topic-content-template.md) |
| 7 | Governance Model | [docs/06-governance-model.md](docs/06-governance-model.md) |
| 8 | Implementation Roadmap | [docs/07-implementation-roadmap.md](docs/07-implementation-roadmap.md) |
| 9 | Acceptance Criteria | [docs/08-acceptance-criteria.md](docs/08-acceptance-criteria.md) |
| 10 | Risks and Mitigations | [docs/09-risks-and-mitigations.md](docs/09-risks-and-mitigations.md) |
| — | Red-Team Review | [docs/10-red-team-review.md](docs/10-red-team-review.md) |
| — | Link Inventory guide | [docs/11-link-inventory-guide.md](docs/11-link-inventory-guide.md) |

---

## The operating model in one diagram

```
   CANONICAL SOURCE  ──────►  HIGHSPOT  ──────►  SLACK ASSISTANT
   The authoritative          The governed        The conversational
   business record.           experience.         doorway.

   Owned by the               Owned by Revenue    Holds no content of
   process owner.             Enablement.         its own. Retrieves,
   Establishes truth.         Presents it by      cites, hands off.
                              role.
```

Truth flows one way. The assistant never learns from Highspot prose; Highspot never becomes the source.
Break that direction and you have created the competing version you were trying to eliminate.

---

## What is in the prototype

**20 topics** across **3 owned lanes**, each following the same six-section template:
definition and scope · targets, standards and policies · what good looks like · track and measure ·
resources and enablement · governance and change history.

| Lane | Owner | Topics |
|---|---|---|
| **Salesforce** | Marco Bueno Carpio — Revenue Enablement Programs Manager, Frankfurt | 13 |
| **AI and MIP** | Alex Hastings — Revenue Enablement Programs Manager, EMEA | 4 |
| **Programmes and Onboarding** | Fabrizio Papa — Revenue Enablement Programs Manager, Zwolle | 3 |

**Deliberate failure states**, because a governance system is only credible if you can see it refuse:
one unowned draft topic · two topics past their review date · one topic whose sources openly contradict each
other · one search that returns nothing · one assistant question with an approved-but-unpublished source ·
one with no approved answer at all.

**Files**

| File | Contents |
|---|---|
| `index.html` | Semantic shell — masthead, role selector, navigation, view container, footer |
| `styles.css` | Design system. Dark navigation, light canvas, restrained Pax8 accents. No external fonts or assets. |
| `app.js` | Hash router, role relevance, search index and ranking, registry filters, assistant logic, gap workflow |
| `data.js` | The Topic Registry. Every topic, asset, metric, FAQ and governance record. **Replace this file with real records.** |
| `links.js` | **The only file you edit to connect real URLs.** 165 pre-listed slots, grouped and commented. |

`data.js` is the whole content model. To add a topic, add a record — every view derives from it.

---

## Connecting real content

Every link has its own **slot** — a stable, unique ID. Supply a URL against a slot in `links.js` and it
connects everywhere that thing appears. You never edit a page or the code.

Slots are deduplicated by identity: one dashboard used by four topics is **one** slot, so the same URL is
never requested twice.

| Value in `links.js` | Means | Shown as |
|---|---|---|
| `''` | Awaiting a URL — the content exists, we need the link | Purple placeholder naming its slot |
| `'TBC'` | To be created — the document does not exist yet | Amber placeholder, "to be created" |
| `'https://…'` | Connected | A real link |

The **Link Inventory** page (footer, or `#/links`) shows live status of all 165 slots, filters by state and
category, and exports a CSV with an empty URL column to send to the content owner.

Full process: [docs/11-link-inventory-guide.md](docs/11-link-inventory-guide.md).

## Technical notes

- Semantic HTML5, vanilla JS, no dependencies, no build step, no network calls
- Responsive from 390px; wide tables scroll inside their own container, the page never does
- Keyboard navigable throughout, visible focus states, skip link, `aria-live` regions on dynamic content
- Status is **never** conveyed by colour alone — every badge carries an icon and a text label
- Every link resolves through a named slot — supply a URL in `links.js` and it connects everywhere that
  thing appears, with no page or code change
- No silent `#` links. Unfilled placeholders name the slot they need, and render as visible tokens:
  `{{HIGHSPOT_TOPIC_URL}}` · `{{HIGHSPOT_ASSET_URL}}` · `{{SLACK_ASSISTANT_URL}}` · `{{DASHBOARD_URL}}` ·
  `{{WORKDAY_COURSE_URL}}` · `{{DIGITAL_ROOM_URL}}` · `{{CANONICAL_SOURCE_URL}}`
- Role selection and gap reports persist in `localStorage` only — nothing leaves the browser

---

## Before anyone quotes a build estimate

Read [Output 5 — Highspot Build Mapping](docs/04-highspot-build-mapping.md) first. Two things in it matter
more than the rest:

1. **Assume custom HTML cannot be uploaded and run inside Highspot** until proven in your tenant. The
   prototype is the design specification, not the build. Most of it maps to native capability; six features
   do not, and each has a stated fallback.
2. **The metadata model must be designed before content is loaded.** Owner, approval, version, review dates
   and shareability have to be first-class properties. Retrofitting them onto published content costs
   multiples of doing it first.

Highspot feature names and availability vary by edition and release — confirm against your own tenant with
your Customer Success Manager before anything here becomes a plan.
