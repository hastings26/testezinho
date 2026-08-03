# Output 6 — Reusable Topic Content Template

Copy this template for every new topic. A topic that cannot complete sections 1, 2 and 6 is not ready to
publish — no exceptions, and no "we will fill that in later".

---

## Header block (mandatory before drafting begins)

| Field | Value | Rule |
|---|---|---|
| Topic ID | `SF-0nn` | Sequential, never reused |
| Topic name | | Plain seller language, not the internal project name |
| Lane | | Must be an existing lane with a named owner |
| One-line summary | | One sentence, under 25 words, readable by a new hire |
| Canonical source | | **Must exist before drafting.** No source, no topic. |
| Content owner | | A named person, not a department |
| Process owner | | A named person, not a department |
| Approver | | A named person with the authority to approve |
| Revenue Enablement owner | | A named person |
| Escalation contact | | Who to go to when guidance conflicts |
| Intended roles | | From the role list |
| Search keywords | | Include acronyms, misspellings and seller slang |
| Common Slack questions | | The three to five real questions people ask |

---

## Section 1 — Definition and Scope

**What this is.** Plain-language definition. No internal jargon in the first sentence. If a new hire cannot
understand it, rewrite it.

**Why it matters.** The business reason, in terms of consequence. Not "because it is our process" — state
what breaks when it is not followed.

**In scope.** The scenarios this guidance covers. Three to six bullets.

**Out of scope.** The scenarios it does not cover, each pointing to where that guidance lives. This section
prevents the topic from silently expanding and colliding with another topic.

**Relevant roles.** Which roles this applies to.

**Related topics.** Links to connected topics. Every link must resolve to a published topic.

---

## Section 2 — Targets, Standards and Policies

The authoritative rules area. Every statement is classified into exactly one of four categories, and the
classification is visible:

| Class | Meaning | Test |
|---|---|---|
| **Mandatory** | You are accountable for this | Failure has a consequence |
| **Recommended** | Good practice, not required | Failure has no consequence |
| **Optional** | Available support | Purely elective |
| **Exception process** | The documented route around a rule | Using it requires recording it |

For each rule: a short imperative title, then the detail. Include as relevant: targets, stage definitions,
exit criteria, forecast expectations, SLA expectations, required fields, validation rules, ownership rules,
timing expectations, activity requirements, escalation rules, approval requirements.

**Anti-pattern:** a wall of prose in which the mandatory and the merely advisable are indistinguishable. If a
reader cannot tell which sentence they will be held to, the section has failed regardless of accuracy.

---

## Section 3 — What Good Looks Like

Convert every rule into observable behaviour. This section is what managers coach from.

**Bad-versus-good comparisons.** At least two per topic, in a fixed structure:

> **Context:** *[the situation]*
> **Not this:** *[the concrete failure — specific, recognisable, not a straw man]*
> **This:** *[the concrete good behaviour — specific enough to copy]*

The examples must be specific enough to be uncomfortable. "Update your opportunities regularly" teaches
nobody anything; "Opportunity updated once per month, usually the day before the forecast call" is
recognisable, and recognition is what changes behaviour.

**Manager coaching questions.** Three questions a manager can ask in a one-to-one. Questions, not
instructions — a question surfaces the gap; an instruction hides it.

**Common mistakes.** What well-intentioned people get wrong.

**Warning signs.** The patterns that indicate the behaviour is being gamed rather than followed. This is the
section most often omitted and the most useful to managers.

**Optional:** screenshots, scenarios, and role-specific examples where a rule lands differently for a CAM
than for a TPS.

---

## Section 4 — Track and Measure

One block per metric. Every field is required — a metric without an owner or an action is decoration.

| Field | Content |
|---|---|
| Metric name | |
| What is measured | The precise definition, unambiguous enough to reproduce |
| Why it matters | The behaviour it is a proxy for |
| Which dashboard tracks it | An approved dashboard, named and linked |
| Who owns it | A named person |
| How often it is reviewed | Weekly / monthly / quarterly |
| Expected threshold | The number, marked as placeholder until confirmed |
| Action when outside range | **The most important field.** What should actually happen. |

**Rule for the action field:** it must describe a change in behaviour or a conversation, not "review the
data". If the only consequence of missing a threshold is that somebody looks at a chart, the metric is not
doing any work.

---

## Section 5 — Resources and Enablement

Five sub-blocks, in this order:

**Training** — Workday courses, videos, live sessions, recordings, practice activities, manager coaching
sessions. Each with duration and whether it is mandatory.

**Documentation** — the canonical source first, then guides, process maps, SOPs, playbooks, checklists.

**Dashboards** — each with purpose, intended audience and expected frequency of use. The audience and
frequency are what stop people building private reports.

**FAQs** — real questions in plain language. Source them from the Slack assistant's actual question log, not
from what the author imagines people ask.

**Named contacts** — process owner, RevOps contact, Revenue Enablement contact, marketing owner, sales
leadership owner, technical support contact. **Named people, not departments.** A department cannot be
chased, and "RevOps" is where a question goes to die.

**Internal / partner split.** Every resource in this section carries a shareability classification, and the
internal and partner-facing groups are visually separated with the standard headings and warnings.

---

## Section 6 — Governance and Change History

Permission-restricted in production; complete for every topic without exception.

| Field | Rule |
|---|---|
| Canonical source | Linked and reachable. Broken link = topic fails review. |
| Content owner / process owner / approver / Revenue Enablement owner | Named people |
| Escalation contact | Named person |
| Approval status | Approved / Provisional / Not approved |
| Publication status | Published / Not published |
| Version | Increments on every approved change |
| Approval date · last review · next review | Dates, never blank |
| Review cadence | Default 6 months; 3 months for rules that change with the quarter |
| Lifecycle status | Published / In review / Review due / Draft / Archived |
| Shareability | One of the seven classifications |
| Slack assistant indexed | Yes / No, with the date |
| Search keywords | Including acronyms and misspellings |

**Change log entry format** — one per approved version:

> **Date · version** — *what changed*
> **Reason:** why it changed
> **Affected roles:** who needs to know
> **Communication:** what was sent, to whom, when
> **Training:** updated / no change / required
> **Assistant index:** updated / not updated

The *reason* field is what makes the log useful a year later. "Updated for clarity" is not a reason.

---

## Pre-publication gate

A topic may not be published until every one of these is true:

- [ ] Named content owner and process owner
- [ ] Canonical source attached and reachable
- [ ] Content reviewed against the canonical source
- [ ] Approval recorded with approver name and date
- [ ] Audience and role relevance confirmed
- [ ] Shareability classification confirmed **for every asset**
- [ ] Version applied
- [ ] Next review date set
- [ ] All links tested
- [ ] Slack assistant source updated and indexed
- [ ] Superseded material archived and removed from search
- [ ] Mandatory rules distinguishable from recommendations at a glance
