# Output 5 — Highspot Build Mapping

> **Read this before quoting any build estimate.** Highspot feature names, availability and behaviour vary by
> edition, contract and release. Everything below should be confirmed against your own tenant with your
> Highspot Customer Success Manager before it becomes a plan. Where a capability is uncertain, this document
> says so rather than assuming.

## 1. The honest constraint

**Do not assume the HTML prototype can be uploaded and run inside Highspot.** Highspot page authoring is a
governed, structured authoring environment, not general-purpose web hosting. Arbitrary custom HTML, CSS and
JavaScript of the kind in this prototype should be treated as *not supported* until proven otherwise in your
tenant.

That is not a problem, because the prototype is not the deliverable. The prototype exists to prove the
information architecture, the governance states, the internal/partner split and the assistant handoff. Almost
all of it maps onto native Highspot capability. The parts that do not are listed explicitly in section 4.

Four implementation categories are used throughout:

| Category | Meaning |
|---|---|
| **A — Highspot native** | Build with standard Highspot capability. Preferred route for everything possible. |
| **B — Native with configuration effort** | Achievable, but needs metadata design, permissions design or governance process work first. |
| **C — External integration** | Lives outside Highspot and is linked or embedded (Salesforce, Workday, Slack). |
| **D — Custom or compromise** | Not natively supported. Either build outside Highspot, or accept a reduced version. Each one is a decision, not a default. |

---

## 2. Component-by-component mapping

### Structure and navigation

| Prototype component | Highspot implementation | Cat. | Notes |
|---|---|---|---|
| Salesforce Command Center home | Highspot homepage or a dedicated Spot landing page | A | If EMEA shares a global homepage, build as a Spot landing page and link prominently rather than fighting for homepage real estate. |
| Primary navigation (10 items) | Spot structure plus page-level links | B | Highspot navigation is driven by Spot and page hierarchy rather than an arbitrary nav bar. Expect to express the ten items as a landing-page link block, repeated consistently, rather than a persistent global nav. |
| Lane Workspaces | One Spot per lane, or one Spot with a page per lane | B | **Recommendation: one Spot per lane.** Permissions, ownership and analytics all resolve at Spot level, which is exactly the boundary a lane needs. |
| Lane page | SmartPage (or equivalent page experience) within the lane Spot | A | The reusable template. Build once, copy per lane. |
| Topic page | SmartPage per topic | A | Six sections as page sections. |
| Breadcrumbs | Manual link block at the top of the page template | B | Not automatic; bake into the template so it cannot be forgotten. |
| Priority topic cards | Curated content collection or a linked card block on the landing page | A | |

### Content and governance

| Prototype component | Highspot implementation | Cat. | Notes |
|---|---|---|---|
| Canonical source document | Asset in Highspot, or an authoritative external link where the source must live elsewhere | A/C | Where the source is a Google Doc or SharePoint file owned by RevOps, link it — do not copy it in. A copy is a second version. |
| Approval status, version, owner, review dates | Custom metadata properties applied to assets and pages | **B** | **The single most important configuration decision in the build.** These must be first-class properties, not text typed into a description, or none of the filtering, reporting or expiry behaviour is possible. |
| Review date and expiry behaviour | Highspot content governance / review and expiry features | B | Confirm exact behaviour in your tenant: whether expired content is hidden, flagged or merely reported. The design assumes *flagged and still visible*; if your tenant hides it, adjust the strategy in Output 1 section 3 accordingly. |
| Governance section (section 6 of each topic) | Restricted page section, or a separate governance page visible to owners, managers, RevOps and administrators | B | If section-level permissions are unavailable, use a separate governance Spot with restricted membership. |
| Change history timeline | Manually maintained section on the governance page, or the source system's version history | B/D | Highspot is unlikely to render a change log in the format shown. Keep the authoritative change log in the canonical source and mirror a summary in Highspot. |
| Topic Registry | **See section 3 — this is the main decision point.** | B/D | |
| Publication checklist | Governance process artefact plus a Highspot content-review workflow where available | B | The checklist is a process control; the tooling only records it. |

### Classification and audience

| Prototype component | Highspot implementation | Cat. | Notes |
|---|---|---|---|
| Shareability classification | Custom metadata property with a controlled value list (7 values) | **A/B** | Must be a required property with a fixed picklist. Free text here destroys the control. |
| Shareability badge (icon + text) | Metadata rendered on the asset card, plus a naming convention in the title as a fallback | B | If badge rendering cannot be styled, prefix titles: `[PARTNER-SAFE]` / `[INTERNAL ONLY]`. Ugly, effective, and never relies on colour. |
| Internal / partner split | Two content collections per lane page, clearly headed, plus permissions on the internal collection | **A** | The visual split is straightforward. The real control is permissions on the internal collection, not the layout. |
| "Add to Digital Room" | Digital Room | **A** | Native, and the correct mechanism for external sharing because access is revocable and trackable. |
| Partner-facing distribution | Digital Rooms and governed external sharing links | A | Prohibit ad-hoc email attachment of governed partner assets as policy — that is the route that cannot be revoked. |
| Role relevance | Audience targeting, groups and Spot permissions | **A/B** | The prototype's role selector is a *demonstration device only*. In production, relevance comes from group membership. Say this explicitly to stakeholders or they will ask for the dropdown. |
| Permission tiers (seller / manager / RevOps / admin) | Highspot groups and Spot-level permissions | A | Design the group model before building pages, not after. |

### Search and the assistant

| Prototype component | Highspot implementation | Cat. | Notes |
|---|---|---|---|
| Global search | Highspot search, tuned with metadata and keywords | A | |
| Synonyms and seller language | Search keyword metadata per topic; synonym configuration where supported | B | Confirm synonym-management support in your tenant. Where unsupported, load the synonyms into the keyword field on each topic. |
| Suggested questions | Static link block on the landing page, pointed at the exact target pages | A | |
| Search results metadata | Metadata surfaced in search result display | B | Depends on which properties your tenant exposes in results. Prioritise owner, approval status and review date. |
| Zero-result state | Not controllable in native search | **D** | Compensate: a permanent, prominent *Report missing guidance* link on the landing page and in the Slack assistant's failure response. |
| Slack assistant | Existing assistant, integrated with Highspot | **C** | Not built here. See section 5. |
| Content-gap reporting | Form tool (Microsoft Forms, Jira, ServiceNow or equivalent) linked from Highspot and from the assistant | **C** | Route to the lane owner with an SLA. The prototype's browser-local storage is a demonstration only. |

### Enablement content

| Prototype component | Highspot implementation | Cat. | Notes |
|---|---|---|---|
| Training courses | Highspot Training / Learning where licensed, otherwise linked Workday courses | A/C | |
| Videos and quick guides | Highspot assets | A | |
| Plays and guidance | Highspot Plays or guidance capability | A | Strong fit for *What Good Looks Like* — behaviour in the flow of work. |
| Dashboards | External links to Salesforce dashboards | **C** | Highspot will not host the dashboard. Link it, and state the audience and cadence beside the link — that context is what stops private report-building. |
| FAQ accordions | Page section with expandable blocks where supported, otherwise a linked FAQ asset | A/B | |
| Named contacts | Page content block | A | Keep names in one contact block per lane so departures are a single edit, not a hunt. |
| Analytics | Highspot content and engagement analytics, plus Digital Room engagement | A | See Output 9 for what to actually measure. |

---

## 3. The Topic Registry decision

The registry is the governance spine and the component least likely to be reproducible natively as shown
(18 columns, live derived flags, multi-dimensional filtering). Three options:

**Option 1 — Highspot-native, reduced (recommended for phase 1).**
Build the registry as a filtered content view driven by the metadata properties, showing the columns Highspot
can display. Accept fewer columns. Advantage: one system, zero drift, no maintenance overhead.
Cost: derived flags such as *review overdue* may not be computable in-view, and must come from reporting.

**Option 2 — External register, linked (recommended for phases 2–3).**
Maintain the full registry in a governed spreadsheet or a database view (or from Highspot's reporting export),
published as a linked page. Advantage: full field set and full flag logic. **Risk: a second source of truth
about the first source of truth.** Mitigate by generating it from Highspot metadata rather than typing it —
if it is hand-maintained, it will drift, and it will be wrong exactly when it matters.

**Option 3 — Embedded application.**
Only if Highspot supports embedding in your tenant and the governance case justifies the build. Verify
before designing towards it.

**Recommendation: start with Option 1, move to Option 2 generated from Highspot metadata export.** Do not
hand-maintain the registry under any circumstances.

---

## 4. What does not map — decide these explicitly

| Prototype feature | Reality | Recommended response |
|---|---|---|
| Custom HTML/CSS/JS page rendering | Assume unsupported | Rebuild in native page components. Keep the prototype as the design specification. |
| Role selector dropdown | Not how Highspot personalises | Replace with audience targeting and groups. Communicate this early. |
| Live derived governance flags | Unlikely in-page | Move to scheduled governance reporting, reviewed monthly. |
| Custom zero-result search state | Not controllable | Permanent gap-reporting link, plus the assistant's own failure response. |
| Timeline-styled change history | Presentation only | Use a table or list. The content matters; the styling does not. |
| Conditional in-page warning banners (overdue, not approved) | Depends on tenant | Fall back to a naming convention plus a standing note in the page template. |

None of these change the operating model. All of them change the visual fidelity — which is a much cheaper
thing to lose.

---

## 5. Slack assistant integration

The assistant already exists. The work is not building it; it is constraining it.

**Required of the integration:**
1. Index **approved sources only** — published Highspot topics and their canonical sources. Draft, unapproved,
   archived and superseded content must be excluded from retrieval, not merely deprioritised.
2. Return with every answer: source title, version, review date, owner, direct Highspot link.
3. Respect permissions — the assistant must not return restricted content to a user who could not open it in
   Highspot. **Verify this explicitly during the pilot; it is the highest-severity failure mode in the whole
   design.**
4. Emit the shareability classification whenever the question involves sharing.
5. Answer *"No approved guidance currently exists"* rather than infer, and offer the gap-report route.
6. Detect and state the content-gap case — approved source exists, not yet published in Highspot.
7. Re-index within one working day of any publication or change (governance workflow stage 6).
8. Log every question, answer, source cited and no-answer event, for the analytics in Output 9.

**Assumption requiring verification:** that the existing assistant can be pointed at Highspot content with
permission-awareness. If it cannot respect Highspot permissions, restrict its index to non-restricted content
only and state that limitation openly to users — do not quietly hope nobody asks the wrong question.

---

## 6. Build sequence

1. **Metadata model first.** Properties, controlled value lists, required fields. Nothing else works without
   this, and retrofitting metadata onto published content is far more expensive than doing it first.
2. **Permissions and groups.** Roles, managers, RevOps, administrators, partner-facing access.
3. **Templates.** One lane template, one topic template. Prove reuse before scaling.
4. **Pilot lane and two topics.** Salesforce lane, Pipeline Management and Opportunity Management.
5. **Assistant indexing and the permission test.**
6. **Governance reporting.**
7. **Expansion across lanes and topics.**

Detailed phasing: [Output 8 — Implementation Roadmap](./07-implementation-roadmap.md).
