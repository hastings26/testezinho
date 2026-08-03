# Output 7 — Governance Model

Governance is the product. Documentation is what it emits.

---

## 1. Ownership matrix

Four distinct owner roles per topic. They are often different people, and conflating them is the most common
cause of stale content.

| Owner role | Owns | Accountable for | Typical function |
|---|---|---|---|
| **Process owner** | The canonical source and the rule itself | The guidance being correct | RevOps, Sales Leadership, Marketing, Presales |
| **Content owner** | The Highspot topic page and its assets | The page faithfully representing the source | Revenue Enablement |
| **Approver** | The approval decision | Signing off that this version may be published | Function leader with authority |
| **Revenue Enablement owner** | Training, adoption, assistant indexing | People being able to act on it | Revenue Enablement |
| **Escalation contact** | Conflict resolution | Deciding when two sources disagree | EMEA Sales Operations lead |

### Responsibility map

| Responsibility | Accountable | Consulted | Cadence |
|---|---|---|---|
| Canonical source content | Process owner | Revenue Enablement | At change and at review date |
| Highspot topic page | Content owner | Process owner | At change and at review date |
| Approval decision | Named approver | Legal / Compliance where relevant | Per version |
| Shareability classification | Content owner | Product Marketing, Legal | Per asset, rechecked at review |
| Slack assistant index | Revenue Enablement | RevOps | Within 1 working day of publication |
| Adoption and gap analysis | Revenue Enablement | Sales Leadership | Monthly |
| Escalation on conflicting guidance | EMEA Sales Operations lead | Affected process owners | On demand |

### The owner-departure problem

An owner leaving is the single most reliable cause of orphaned content, and it must be handled structurally
rather than by good intentions:

1. Ownership is recorded as **a named person plus a role**, so the role survives the person.
2. When an owner leaves, every topic they own is flagged in the registry as *No content owner* — visibly, on
   the topic page as well as in the registry.
3. Reassignment is part of the leaver process for anyone holding a Highspot content ownership role.
4. Unreassigned after 30 days, the topic moves to **In review** and the page carries a warning. The content
   stays visible — withdrawing it sends sellers back to tribal knowledge, which is worse than a caveated page.

---

## 2. Approval workflow

Ten stages. A topic cannot skip from draft to published.

| # | Stage | Accountable | Exit condition |
|---|---|---|---|
| 1 | Draft | Content owner | Content written against the canonical source |
| 2 | Owner review | Content owner | Verified accurate against the source |
| 3 | Functional review | Process owner | RevOps / Legal / function checks for conflict and risk |
| 4 | Approval | Approver | Approval recorded with name, date and version |
| 5 | Highspot publication | Revenue Enablement | Published with complete metadata |
| 6 | Slack assistant indexing | Revenue Enablement | Source indexed; assistant returns it correctly |
| 7 | Communication | Revenue Enablement | Affected roles told, through the agreed channel |
| 8 | Adoption monitoring | Revenue Enablement | Usage, search and question data reviewed |
| 9 | Scheduled review | Content owner | Review completed before the next review date |
| 10 | Update, archive or retire | Content owner | Superseded material removed from search |

**Stage 6 is the one that gets skipped**, and skipping it is what causes the assistant to answer differently
from Highspot. Treat "assistant re-indexed" as part of the definition of published, not as a follow-up task.

---

## 3. Publication checklist

Every item must be true. This is the control that stops *uploaded* being mistaken for *approved*.

- [ ] Named content owner assigned
- [ ] Named process owner assigned
- [ ] Canonical source attached and reachable
- [ ] Content reviewed against the canonical source
- [ ] Approval recorded with approver name and date
- [ ] Audience and role relevance confirmed
- [ ] Shareability classification confirmed for every asset
- [ ] Version number applied
- [ ] Next review date set
- [ ] All links tested
- [ ] Slack assistant source updated and indexed
- [ ] Superseded material archived and removed from search

---

## 4. Review process

**Cadence.** Default six months. Three months where rules change with the quarter (forecast standards,
targets, vendor programmes). Twelve months only for genuinely stable definitions, and only with the
approver's agreement.

**Trigger points.** Scheduled review date · a change to the canonical source · a change in the underlying
Salesforce configuration · a spike in gap reports or unanswered assistant questions on that topic · an owner
departure · a contradiction found between two sources.

**Review outcomes.** Reaffirmed (dates advanced, version unchanged) · updated (version incremented, change
log entry, assistant re-indexed, communication assessed) · archived (superseded, removed from search,
redirect to the replacement) · retired (no longer applicable, removed from search, kept for audit).

**When a review is missed.** The topic moves to *Review due* automatically — derived from the date, not set
by a human, so it cannot be suppressed. The page carries a warning naming the process owner. The topic
appears in monthly governance reporting. The assistant continues to answer from it but prefixes the answer
with the review warning. **The content is not hidden**: a warned answer is better than no answer, and hiding
it removes the very signal that gets it fixed.

---

## 5. Lifecycle model

```
   Draft ──► In review ──► Approved ──► Published ─┬─► Review due ──┬─► Updated (new version) ──► Published
     ▲                                             │                │
     │                                             │                ├─► Archived (superseded)
     └──────────── rejected at review ─────────────┘                └─► Retired (no longer applicable)
```

| Status | Visible to sellers | In search | Assistant may cite | Authoritative |
|---|---|---|---|---|
| Draft | No (owners only) | No | **No** | No |
| In review | Yes, with notice | Yes | Yes, with notice | Previous version applies |
| Published | Yes | Yes | Yes | **Yes** |
| Review due | Yes, with warning | Yes | Yes, with warning | Yes, with caution |
| Archived | On direct link only | **No** | **No** | No |
| Retired | No | **No** | **No** | No |

Two rows carry the most weight: **draft content is never citable by the assistant**, and **archived content
leaves search**. Outdated content that remains discoverable is worse than no content, because it carries the
authority of the platform without the accuracy.

---

## 6. Governance health reporting

Reviewed monthly by Revenue Enablement with Sales Leadership. Six measures:

| Measure | Target | Why |
|---|---|---|
| % of topics with a named content owner | 100% | Below 100%, some content is unmaintainable |
| % of topics with a recorded approval | 100% | Anything else is unapproved content presented as guidance |
| Number of topics past review date | 0 | The core hygiene measure |
| % of approved sources indexed for the assistant | 100% | Gaps here cause Slack and Highspot to diverge |
| Open content gaps by lane and age | Trending down | Shows whether reports lead to publication |
| Unanswered assistant questions, by theme | Trending down | The content roadmap, generated automatically |

Governance that is only manual will be neglected. Automate the first four from Highspot metadata export
before phase 3, or accept that they will be maintained accurately for two months and then stop.
