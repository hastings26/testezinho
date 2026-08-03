# Output 2 — Information Architecture

## 1. Site map

```
Salesforce Command Center  (home)
│
├── Rules of the Game            → mandatory / recommended / optional / exceptions, aggregated by topic
├── What Good Looks Like         → bad-vs-good behaviour, coaching questions, mistakes, warning signs
├── Track and Measure            → KPI cards with owner, cadence, threshold and required action
├── Resources and Enablement     → training · documentation · dashboards · partner assets · FAQs · contacts
│
├── Lane Workspaces
│   ├── Salesforce                        (built out)
│   ├── Pipeline and Opportunity Mgmt     (built out)
│   ├── MIP
│   ├── Microsoft
│   ├── AI
│   ├── Security
│   ├── Professional Services
│   ├── Transformation
│   └── Partner Maturity
│       └── each lane → topics in lane + internal / partner split
│
├── Topic Registry               → every topic, every governance field, flag states, filters
├── Governance and Change History→ health metrics · 10-stage workflow · checklist · ownership matrix · timeline
├── Ask the Salesforce Assistant → Slack handoff demonstration and behaviour contract
├── Report Missing Guidance      → content-gap workflow
│
├── Topic page  (×14)            → six-section template, reached from anywhere
├── Search results               → cross-type results with governance metadata on each
└── About this prototype         → what is real, what is placeholder, token reference
```

Depth is capped at three levels. Any topic is reachable in at most three interactions from home
(search → result → topic; or nav → lane → topic; or home priority card → topic, which is one).

## 2. Navigation model

**Primary navigation (10 items)** is fixed and identical on every page. It maps exactly to the ten sections
required in the brief. Nothing is nested inside it — a dropdown here would hide the model rather than
reveal it.

**Persistent controls in the masthead**, present on every page:
- Role selector — changes what is *primary*, never what is *reachable*
- Ask in Slack — the assistant is one click from anywhere
- Global search — on the home hero and on the search results page

**Progressive disclosure.** The home page shows three entry points and the priority topics for your role.
Topics that are not primary for your role collapse into an expandable section rather than disappearing —
because hiding them creates the "I know it exists but I can't find it" failure the hub is meant to remove.

**Breadcrumbs** appear on lane and topic pages only, where the parent is not obvious from the primary nav.

## 3. Lane model

A lane is a strategic or operational motion with a single accountable owner. Lanes are the reuse unit: the
Salesforce lane and the Security lane render from the same template and the same metadata contract.

Every lane page contains, in this order:

1. Lane identity — name, description, lane owner, lifecycle status, topic count
2. Topics in this lane — cards, with role relevance marked
3. **The split** — *For You: Execute Internally* (left) and *For Partners: Approved to Use or Share* (right)

The split is the invariant. A lane with no approved partner material shows an explicit empty state saying so,
rather than an empty column — the absence has to be stated, or sellers fill it with an assumption.

## 4. Topic model

Every topic is the same shape regardless of lane. Six sections, in a fixed order, because a consistent
order is what allows an experienced seller to jump straight to section 2 and a new hire to read section 1
first.

| # | Section | Answers |
|---|---|---|
| 1 | Definition and scope | What is this, why does it matter, what is in and out, who does it apply to |
| 2 | Targets, standards and policies | What is required, what is recommended, what the exceptions are |
| 3 | What good looks like | What the rule looks like as behaviour; coaching questions; mistakes; warning signs |
| 4 | Track and measure | Which KPIs, which dashboard, who owns it, how often, what action follows |
| 5 | Resources and enablement | Training, documentation, dashboards, FAQs, named contacts, internal/partner split |
| 6 | Governance and change history | Source, owners, approval, version, dates, lifecycle, indexing, change log |

Section 6 is restricted in the production implementation (owners, managers, RevOps, administrators). It is
fully visible in the prototype so the model can be reviewed.

Full field-level template: [Output 6 — Content Template](./05-topic-content-template.md).

## 5. Metadata model

Two tiers. Tier 1 renders to users; tier 2 lives in the registry and governance views. Every content item
carries both.

### Tier 1 — always visible to the user

| Field | Rendered as |
|---|---|
| Title | Card heading, page H1 |
| Content type | Type label on the card (Rule, FAQ, Measure, Training, Internal asset, Partner asset, Dashboard) |
| Topic / Lane | Breadcrumb and card meta |
| Owner (content owner) | Named badge on card and page |
| Approval status | Badge: Approved / Provisional / Not approved |
| Lifecycle status | Badge: Published / Review due / In review / Draft / Archived |
| Version | Badge |
| Last review · next review | Card meta and governance table |
| Shareability | Badge with icon and text, plus the condition text where one applies |
| Role relevance | "Relevant to" on search results and lane cards |

### Tier 2 — registry and governance views

Topic ID · Lane · Plain-language definition · Canonical source · Highspot topic page · Internal resource
location · Partner-facing resource location · Process owner · Content owner · Approver · Revenue Enablement
owner · Intended roles · Search keywords · Common Slack questions · Approval status · Publication status ·
Version · Last review date · Next review date · Review cadence · Lifecycle status · Escalation contact ·
Related topics · Related dashboards · Related training · Change history · Assistant index status · Notes

### Derived, never stored

Two values are computed at render time so they cannot go stale in the record:

- **Review state** — derived from `nextReview` against today. A record cannot claim to be current.
- **Governance gaps** — derived from missing owner, source, approver, approval date, version or review date.
  A record cannot hide an absent owner by leaving the field blank; blank *is* the flag.

## 6. Search model

Search indexes eight entry types, not just pages: topic pages, individual rules, FAQs, measures, training,
internal assets, partner assets and dashboards. A seller asking "which fields are required" should land on
the rule, not on a page containing the rule.

Ranking order, highest first:
1. Exact approved answer (FAQ or rule whose title matches)
2. Topic page
3. Section within a topic
4. Approved asset
5. Training
6. Related FAQ
7. Named owner

Modifiers: approved content ranks above unapproved; content relevant to the selected role gets a nudge —
a nudge, never a filter, so nothing becomes unreachable because of a role setting.

Seller language is handled with a synonym map (`opp`→opportunity, `sfdc`/`sf`→salesforce, `pipe`→pipeline,
`dupes`→duplicates, `forcast`→forecast, `report`→dashboard, `external`→partner, and so on) and stop-word
removal, so natural-language questions work without the user learning the taxonomy.

**Zero results is a designed state, not an error.** It states that the absence is recorded, offers the Slack
assistant and the gap report, and explicitly tells the user not to assume the answer does not exist.
