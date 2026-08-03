# Output 1 — Experience Strategy

> Placeholder content notice: all owners, dates, targets and policies referenced in this document and the
> prototype are illustrative. Nothing here is approved Pax8 guidance.

## 1. The user problem

Salesforce guidance for EMEA Sales currently lives across SharePoint, Highspot, Miro, PowerPoint, email,
Teams, Slack, recordings, Workday, dashboards and individual memory. That fragmentation produces four
distinct failures, and they need different fixes:

| Problem | What it looks like on a Tuesday | What actually fixes it |
|---|---|---|
| **Discoverability** | A CAM asks in a Slack channel where the stage exit criteria live, and gets three different answers. | One destination, one route per question, search that understands seller language. |
| **Trust** | The document is found, but nobody knows if it is current, who owns it, or whether RevOps still supports it. | Visible ownership, version, review date and approval on the page itself — not in a properties panel. |
| **Adoption** | The guidance exists and is correct, and sellers still do not use it. | Role relevance, conversational access where they already are (Slack), and answers that arrive faster than asking a colleague. |
| **Governance** | Three versions of the forecast rules exist, two contradict each other, and the owner has left. | A registry that makes ownerless content impossible to publish and impossible to hide. |

The critical insight: only the first of these is a findability problem. The other three are governance,
relevance and behaviour problems. A better-organised document library solves one quarter of the issue.

## 2. The operating model

Three components, three distinct jobs, no overlap.

```
   CANONICAL SOURCE            HIGHSPOT                    SLACK ASSISTANT
   ────────────────            ────────                    ───────────────
   The authoritative           The governed                The conversational
   business record.            experience.                 doorway.

   Owned by the process        Owned by Revenue            Owned by whoever runs
   owner (RevOps, Sales        Enablement, presents        the existing assistant.
   Leadership, Marketing).     the source in a
                               role-relevant form.

   One per topic.              One topic page per          Holds no content of
   Establishes the truth.      source. Never invents       its own. Retrieves,
                               a rule the source           cites, and hands off.
                               does not contain.
```

**The rule that holds it together:** truth flows one way only. The canonical source is amended, Highspot is
republished from it, the assistant re-indexes from the same approved source. The assistant never learns from
Highspot prose, and Highspot never becomes the source. Break that direction and you have created the fourth
competing version you were trying to eliminate.

### Why Highspot is the destination, not the answer

Every route ends in Highspot because Highspot is where governance is enforceable: permissions, audience
targeting, review dates, expiry, and — critically — external sharing that can be revoked. A Slack answer
cannot be revoked. A SharePoint link cannot be audience-targeted meaningfully. So the assistant's job is to
shorten the distance to Highspot, never to substitute for it.

### The role of the existing Slack assistant

It already exists, and it should not be rebuilt. Its job here is narrow and specific:

1. Understand the question in seller language.
2. Search approved sources in a fixed priority order — published Highspot topic, then canonical source, then
   approved secondary source, then nothing.
3. Answer concisely, and always cite source title, version, review date and owner.
4. Link to the exact page, never a generic landing page.
5. Warn on shareability before the seller can act on the answer.
6. Say "no approved guidance currently exists" rather than infer.
7. Flag the content-gap case: an approved answer exists in a source document but has not been published in
   the relevant Highspot lane.

Point 7 is the one most easily dropped and the most valuable. It converts the assistant from a search tool
into a governance sensor — every gap it detects is a piece of the content roadmap that nobody had to
discover manually.

## 3. The governance model in one page

Governance is the product. Documentation is what governance emits.

- **Every topic has one canonical source, one content owner, one process owner, one approver, one version,
  one review date, one lifecycle status.** No exceptions, and the registry enforces it visually.
- **Uploaded is not approved.** A twelve-point publication checklist stands between the two, and the
  approval record names a person and a date.
- **Absent ownership is visible, not silent.** The prototype ships with one deliberately incomplete topic
  (*AI Conversations with Partners*) to demonstrate what the system does with unowned content: it publishes
  the *gap*, flags it in the registry, refuses to present it as authoritative, and keeps the assistant from
  quoting it.
- **Expiry degrades gracefully.** An overdue topic is not withdrawn — that leaves sellers with nothing and
  drives them back to tribal knowledge. It stays visible with a prominent warning and a named person to
  check with, and it appears in governance reporting until resolved.

Full model in [Output 7 — Governance Model](./06-governance-model.md).

## 4. Internal and partner-facing separation

This is the requirement with the highest cost of failure. Everything else on the site being wrong produces
confusion; this being wrong produces a commercial or legal incident.

Design decisions that follow from that:

- **Spatial separation, not a filter.** Internal content sits in a left column labelled *For You: Execute
  Internally*; partner content sits in a right column labelled *For Partners: Approved to Use or Share*. The
  same layout appears on every lane page and every topic page, so the mental model transfers.
- **Classification on every item, never inherited.** A partner-safe asset inside an internal topic is still
  partner-safe, and an internal asset inside a partner-heavy lane is still internal. Classification lives on
  the asset.
- **Never colour alone.** Every classification carries an icon and a text label. Colour is reinforcement, not
  signal — which also satisfies the accessibility requirement.
- **Conditions are shown, not hidden behind a badge.** "Shareable with conditions" is useless without the
  condition; the condition renders inline on the card.
- **The assistant warns before the human acts.** Any question containing sharing language triggers the
  shareability warning ahead of the answer body.
- **Revocation is a first-class action.** Partner sharing runs through Digital Rooms precisely because access
  can be withdrawn centrally. A PDF sent by email cannot be recalled; a Digital Room can.

Seven classifications are supported: Internal only · External approved · Shareable with conditions · Manager
approval required · Restricted · Draft, do not use · Archived.

## 5. What success looks like

Not page views. Behaviour:

| Group | Old behaviour | Target behaviour |
|---|---|---|
| Sellers | "Where is the documentation?" in a Slack channel | Ask the assistant, or go straight to the topic page |
| Managers | Coach from personal preference | Coach from the published *What Good Looks Like* examples |
| RevOps | Maintain several disconnected versions | Maintain one canonical source and republish |
| Revenue Enablement | Answer the same question repeatedly | Close the gap once, publish it, move to capability work |
| New hires | Learn Salesforce from five systems and a colleague | Learn from one coherent place |

Measurement approach in [Output 9 — Acceptance Criteria](./08-acceptance-criteria.md).
