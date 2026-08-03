# Output 8 — Implementation Roadmap

Five phases. Durations are indicative and assume a part-time core team plus named owners who can actually
commit time — the second condition is the one that usually fails.

**Sequencing principle:** confirm ownership before writing content, and write content before building pages.
Every project of this kind that goes wrong does so by building pages first, because pages are the visible
part.

---

## Phase 1 — Foundation

*Goal: prove the model on one lane. Indicative 4–6 weeks.*

| # | Work | Owner | Done when |
|---|---|---|---|
| 1.1 | Confirm the topic list for phase 1 and 2 | Revenue Enablement + RevOps | Priority topics agreed and written down |
| 1.2 | **Confirm a named owner for every priority topic** | Sales Leadership | Every topic has a named content owner, process owner and approver who have each accepted |
| 1.3 | Identify the canonical source for each topic | Process owners | Each topic has exactly one source; duplicates and contradictions logged |
| 1.4 | Resolve source conflicts | Process owners + Sales Ops | Contradictory versions retired, one survives |
| 1.5 | Design the metadata model in Highspot | Revenue Enablement + Highspot admin | Properties created with controlled value lists |
| 1.6 | Agree the seven shareability classifications | Revenue Enablement + Legal + Product Marketing | Definitions signed off and published |
| 1.7 | Design permissions and groups | Highspot admin | Group model covers seller, manager, RevOps, enablement, admin |
| 1.8 | Build lane and topic templates | Revenue Enablement | One of each, reviewed against this specification |
| 1.9 | Build the homepage and the Salesforce lane | Revenue Enablement | Live to a pilot group |

**Gate:** do not proceed to phase 2 until 1.2 and 1.3 are genuinely complete. A topic without a confirmed
owner and source cannot be governed, and building its page first only creates a governed-looking page that
nobody maintains.

---

## Phase 2 — Pilot

*Goal: test the whole loop end to end on two topics. Indicative 4–6 weeks.*

| # | Work | Owner | Done when |
|---|---|---|---|
| 2.1 | Build Pipeline Management to the full six-section template | Content owner | Passes the publication checklist |
| 2.2 | Build Opportunity Management | Content owner | Passes the publication checklist |
| 2.3 | Connect training and dashboards | Revenue Enablement + RevOps | Every link tested, audience and cadence stated |
| 2.4 | Test role relevance | Revenue Enablement | A CAM and a TPS each see a sensible primary view |
| 2.5 | **Index the two topics for the Slack assistant** | Revenue Enablement | Assistant answers with source, version, review date, owner and link |
| 2.6 | **Test the assistant's permission behaviour** | Revenue Enablement + assistant owner | A user without access cannot obtain restricted content through Slack |
| 2.7 | Test the no-approved-guidance and content-gap responses | Revenue Enablement | Both states behave as specified |
| 2.8 | Test the internal / partner split with real sellers | Revenue Enablement | Sellers correctly identify what may be shared, unprompted |
| 2.9 | Pilot with 10–15 sellers and 3 managers across at least two countries | Revenue Enablement | Structured feedback captured |

**Gate: 2.6 is a hard gate.** If the assistant can surface restricted content to someone who could not open
it in Highspot, restrict its index and fix it before any wider launch. This is the failure mode with the
highest cost and the lowest visibility.

---

## Phase 3 — Expansion

*Goal: scale the pattern. Indicative 8–12 weeks.*

| # | Work | Owner |
|---|---|---|
| 3.1 | Build the remaining eleven priority topics | Content owners |
| 3.2 | Add partner-facing materials with confirmed classifications | Content owners + Product Marketing |
| 3.3 | Build Digital Rooms for partner-facing collections | Revenue Enablement |
| 3.4 | Stand up a second lane using the same template, unchanged | Lane owner |
| 3.5 | Implement governance reporting from Highspot metadata | Revenue Enablement + Highspot admin |
| 3.6 | Implement content-gap routing with an SLA | Revenue Enablement |
| 3.7 | Establish the analytics baseline | Revenue Enablement |

**Test of reuse (3.4):** if the second lane needs template changes, the template was not generic. Fix the
template rather than forking it — two templates become five, and five become a wiki.

---

## Phase 4 — Adoption

*Goal: change behaviour, not awareness. Indicative 6–8 weeks, overlapping phase 3.*

| # | Work | Owner |
|---|---|---|
| 4.1 | Manager enablement **first** — managers coach from the published standards before sellers are launched | Revenue Enablement |
| 4.2 | Seller launch, framed as "here is where the answer is", not "here is a new platform" | Sales Leadership |
| 4.3 | Integrate into onboarding — new hires start here on day one | Revenue Enablement |
| 4.4 | Slack communication and assistant promotion in the channels people already use | Revenue Enablement |
| 4.5 | Redirect or retire the superseded SharePoint, Miro and deck versions | Process owners |
| 4.6 | Structured feedback collection and search-gap analysis | Revenue Enablement |

**4.1 before 4.2 is deliberate.** Sellers copy what their manager inspects. A seller launch without manager
enablement produces a well-attended launch and no behaviour change.

**4.5 is the phase most often skipped and the one that decides whether this works.** If the old versions
survive, you have added a system rather than replaced several. Retiring them is a governance act, not a
tidy-up.

---

## Phase 5 — Optimisation

*Goal: keep it alive. Continuous.*

| # | Work | Cadence |
|---|---|---|
| 5.1 | Review zero-result searches and unanswered assistant questions; convert to content | Monthly |
| 5.2 | Remove duplication as it reappears | Monthly |
| 5.3 | Automate review-date alerts to owners | Once, then maintained |
| 5.4 | Rewrite the weakest-performing content by engagement and question volume | Quarterly |
| 5.5 | Expand role personalisation using real usage patterns | Quarterly |
| 5.6 | Measure behavioural change, not page views | Quarterly |

---

## Resourcing

| Role | Commitment | Notes |
|---|---|---|
| Revenue Enablement lead | Significant, phases 1–4 | Owns the system end to end |
| Highspot administrator | Concentrated in phase 1 | Metadata and permissions design |
| RevOps process owner | Moderate, continuous | Canonical sources and review |
| Content owners (per topic) | Small but non-zero, continuous | The commitment most often underestimated |
| Sales Leadership sponsor | Low but essential | Confirms owners, and unblocks when someone will not accept ownership |
| Slack assistant owner | Concentrated in phase 2 | Indexing and the permission test |

---

## Critical dependencies

1. **Named owners who accept the role.** Without this, nothing else matters. Escalate early; a topic with an
   unwilling owner is a topic that will be stale in six months.
2. **Canonical sources that exist and are agreed.** Where two exist, one must be retired before build.
3. **Highspot metadata model designed before content is loaded.** Retrofitting is expensive.
4. **Assistant indexing and permission-awareness.** Confirm feasibility in phase 1, not phase 2.
5. **Authority to retire superseded content.** Confirm who can decide that the SharePoint version is dead.
