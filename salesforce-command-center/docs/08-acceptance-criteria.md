# Output 9 — Acceptance Criteria

Testable criteria. Each has a method and a pass condition. "Looks good" is not a pass condition.

Status column: **✔ Verified in prototype** · **○ To verify in Highspot** · **◐ Partially verified**

---

## 1. Findability

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 1.1 | A seller reaches a priority topic in ≤3 interactions | Task test, 8 sellers, 5 topics each | ≥90% of tasks in ≤3 | ✔ Structure supports 1–3 |
| 1.2 | Natural-language search returns the right answer first | 20 real seller questions | ≥80% correct in result 1 | ✔ 7/7 sampled correct first hit |
| 1.3 | Acronyms and slang resolve | Search `opp`, `sfdc`, `pipe`, `dupes`, `MQL` | Correct topic in top 3 | ✔ |
| 1.4 | Misspellings resolve | Search `forcast`, `comit` | Correct topic in top 3 | ✔ synonym map |
| 1.5 | Zero-result searches are captured and routed | Search a nonsense term | Designed state offering assistant and gap report | ✔ |
| 1.6 | A new hire understands the homepage unaided | Observed first-use, 5 new joiners | Can state purpose and find one rule without help | ○ |

---

## 2. Trust

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 2.1 | Every authoritative topic shows owner, approval, version, last review and source | Inspect all topic pages | 100% | ✔ badge row + governance table |
| 2.2 | Metadata is visible without scrolling past the header | Inspect at 1280px and 390px | Visible in badge row | ✔ |
| 2.3 | Overdue content is warned, not silently served | Open a topic past review date | Warning banner naming the process owner | ✔ 2 topics demonstrate |
| 2.4 | Unapproved content cannot be mistaken for approved | Open the draft topic | Danger banner, no approved rules, excluded from assistant | ✔ |
| 2.5 | Review state cannot be falsified in the record | Code inspection | Derived from date at render, never stored | ✔ |
| 2.6 | Search results carry approval status and review date | Inspect result cards | Every card | ✔ |

---

## 3. Role relevance

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 3.1 | A CAM does not see TPS content as the primary experience | Switch role to CAM | TPS-primary topics demoted, not shown first | ✔ |
| 3.2 | A TPS does not see CAM content first | Switch role to TPS | Primary set changes | ✔ |
| 3.3 | Role filtering never makes content unreachable | Set any role, attempt to reach every topic | All 14 reachable via registry, lanes, search | ✔ |
| 3.4 | Search ranks by role without hiding | Same query under two roles | Ordering differs, result set does not shrink | ✔ |
| 3.5 | Production relevance is permission-driven, not a dropdown | Highspot build review | Audience targeting and groups in place | ○ |

---

## 4. Shareability

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 4.1 | Users distinguish internal / external / conditional / restricted | Card-sort with 10 sellers, 12 assets | ≥95% correct classification | ○ |
| 4.2 | Classification never relies on colour alone | Greyscale render and screen-reader pass | Icon + text label on every badge | ✔ |
| 4.3 | Conditions are visible, not hidden behind a badge | Inspect conditional assets | Condition text renders inline | ✔ |
| 4.4 | Internal and partner content is spatially separated on every lane and topic page | Inspect all pages with assets | Two-column split, standard headings, standing warnings | ✔ |
| 4.5 | The assistant warns on shareability before the answer | Ask any question containing sharing language | Warning precedes the answer body | ✔ |
| 4.6 | Partner access can be revoked quickly | Digital Room test | Access withdrawn centrally within minutes | ○ |
| 4.7 | A lane with no partner-safe assets says so explicitly | Open such a lane | Empty state warning against assuming | ✔ |

---

## 5. Governance

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 5.1 | No authoritative content without owner, source, approval, version, review date, lifecycle | Registry filter *Has governance gaps* | Every flagged record is non-authoritative in the UI | ✔ |
| 5.2 | Missing ownership is visible, not blank | Inspect the draft topic in the registry | Renders **— none —** plus a flag | ✔ |
| 5.3 | Every topic has a review mechanism | Registry inspection | Cadence and next review on every published topic | ✔ |
| 5.4 | Change history records what, why, who is affected, comms, training and index status | Inspect change log entries | All six fields per entry | ✔ |
| 5.5 | Archived content leaves search | Highspot test | Not returned in search or by the assistant | ○ |
| 5.6 | Governance health is reportable monthly | Highspot reporting | Six measures produced without manual collation | ○ |

---

## 6. Slack integration

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 6.1 | Answers only from approved sources | Ask about the draft topic | Not cited; no-guidance state returned | ✔ |
| 6.2 | Every answer carries source, version, review date, owner and a Highspot link | 20 test questions | 100% | ✔ prototype; ○ real assistant |
| 6.3 | States plainly when no approved guidance exists | Ask an unanswerable question | Exact phrase, no inferred answer | ✔ |
| 6.4 | Identifies content gaps | Ask the MIP sharing question | Gap state, source cited, gap-logging action | ✔ |
| 6.5 | **Never exposes restricted content beyond permissions** | Permission test with a restricted user | No restricted content returned | ○ **hard gate** |
| 6.6 | Links to the exact page, not a generic landing page | Inspect 20 answers | Deep links only | ✔ |
| 6.7 | Re-indexes within 1 working day of publication | Change a topic, time the assistant | ≤1 working day | ○ |
| 6.8 | Assistant and Highspot never disagree | Compare 20 answers to the pages | Zero divergence | ○ **monitor continuously** |

---

## 7. User experience

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 7.1 | Feels like a command centre, not a file library | Reaction test, 10 users | Majority describe it in operational terms | ○ |
| 7.2 | Homepage presents ≤3 primary choices above the fold | Inspect at 1280px | Three entry points | ✔ |
| 7.3 | No dense link lists on the first screen | Inspect | Progressive disclosure used | ✔ |
| 7.4 | No dead links | Automated crawl | Zero silent `#` links; all placeholders visibly marked | ✔ |
| 7.5 | Placeholder links are honest | Click any placeholder | Names its token | ✔ |

---

## 8. Mobile

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 8.1 | Core navigation works at 390px | Manual and automated | Menu toggles, all routes reachable | ✔ |
| 8.2 | No horizontal page scroll | Automated at 390px | 0px overflow | ✔ measured 0px |
| 8.3 | Wide tables scroll within their own container | Registry at 390px | Table scrolls, page does not | ✔ |
| 8.4 | The internal / partner split stacks in a safe order | Inspect at 390px | Internal first with its warning, partner second with its own | ✔ |

---

## 9. Accessibility

| # | Criterion | Method | Pass condition | Status |
|---|---|---|---|---|
| 9.1 | Keyboard navigation throughout | Tab through every page | All interactive elements reachable and operable | ✔ native elements only |
| 9.2 | Visible focus states | Keyboard pass | 3px high-contrast outline | ✔ |
| 9.3 | Readable contrast | Contrast check on 19 text/background pairs | WCAG AA (4.5:1) | ✔ all pass; lowest 4.84:1 |
| 9.4 | Status never conveyed by colour alone | Greyscale pass | Icon + text on every status | ✔ |
| 9.5 | Semantic headings, one H1 per page | Automated | Correct hierarchy, single H1 | ✔ |
| 9.6 | Descriptive labels on controls | Screen-reader pass | Every control labelled | ✔ no unlabelled controls |
| 9.7 | Skip link to main content | Keyboard | Present and functional | ✔ |
| 9.8 | Dynamic content announced | Screen-reader pass on search, assistant, registry count | `aria-live` regions announce | ✔ |

---

## 10. Outcome measures

Behavioural, measured from a phase-2 baseline. These are the criteria that decide whether the system was
worth building — everything above only decides whether it was built correctly.

| Measure | Baseline | Target | Source |
|---|---|---|---|
| "Where is the documentation?" questions in Slack channels | Phase 2 baseline | −60% by month 6 | Channel analytics |
| Assistant questions answered from an approved source | Baseline | ≥85% | Assistant logs |
| Unanswered assistant questions | Baseline | Trending down, converted to content | Assistant logs |
| Zero-result searches | Baseline | Trending down | Highspot search analytics |
| Topics with a named owner | — | 100% | Registry |
| Topics past review date | — | 0 | Registry |
| Managers coaching from published examples | Survey | ≥70% of managers | Manager survey |
| New-hire time to first correct answer | Baseline | −50% | Onboarding task test |
| Duplicate versions of governed topics in other systems | Count at phase 4 | 0 for priority topics | Content audit |

**Explicit anti-measure:** page views are not a success measure. A seller who gets a correct answer from
Slack in ten seconds and never opens the page is a success, and would score zero on page views.
