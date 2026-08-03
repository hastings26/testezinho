# Red-Team Review

Eighteen challenges put to the design before it was finalised. Each records the honest answer and, where the
answer was unsatisfactory, the change made. Fourteen produced a design change; those changes are in the
prototype.

---

**1. Are we creating another source of truth by accident?**

Partly, yes — that was the original weakness. Writing rules directly into topic pages makes the page the
source, because the page is what people read.

→ **Changed.** Truth flows one way only: canonical source → Highspot → assistant index. A topic cannot be
drafted without a source; the source is a required registry field; a missing source is a visible flag; and
Highspot may not state a rule the source does not contain. Phase 1 explicitly retires competing versions
before build.

---

**2. Could the Slack assistant answer something different from Highspot?**

Yes, whenever re-indexing lags publication.

→ **Changed.** Re-indexing is stage 6 of the workflow and sits *inside* the definition of published, not
after it. Index status is a registry field and appears on every topic page. Divergence is treated as an
incident with the assistant's answer suppressed until the source is fixed, and monthly spot-checks compare
20 answers to their pages.

---

**3. Can users tell which content is safe to share?**

Not reliably in the first version, which used colour-coded tags in a single list.

→ **Changed.** Spatial separation into two labelled columns on every lane and topic page · icon plus text on
every classification · conditions rendered inline rather than implied by a badge · standing warnings at the
head of each column · the assistant warns before answering any sharing question · an empty partner column
states the absence explicitly rather than leaving a blank.

---

**4. Is ownership genuinely visible?**

Only when it existed. A blank owner field rendered as blank, which reads as "fine".

→ **Changed.** Ownership gaps are derived, not stored. A missing owner renders as **— none —** plus a flag on
the card, on the topic page and in the registry. The prototype ships a deliberately unowned topic to prove
the behaviour.

---

**5. What happens when a source expires?**

Originally: nothing visible.

→ **Changed.** Review state is derived from the date at render time and cannot be suppressed. Overdue topics
carry a banner naming the process owner, appear in governance reporting, and cause the assistant to prefix
its answer with a warning. Deliberately **not** hidden — hiding sends sellers back to tribal knowledge, which
is the failure this system exists to fix.

---

**6. What happens when the owner leaves?**

Originally unaddressed, and it is the most reliable cause of orphaned content anywhere.

→ **Changed.** Ownership is a named person *plus* a role, so the role survives. Reassignment enters the
leaver process for anyone holding a content ownership role. Unreassigned after 30 days, the topic moves to
*In review* with a visible warning.

---

**7. Can a new hire understand the page without training?**

Testable, not assertable.

→ **Changed.** Three primary entry points only; progressive disclosure for everything else; plain-language
definitions in section 1 of every topic; and an explicit acceptance criterion (1.6) requiring five observed
new joiners to succeed unaided.

---

**8. Are we showing too much information?**

The first homepage draft showed thirteen topic cards plus every lane plus governance metrics. Too much.

→ **Changed.** Homepage shows three entry points and the priority topics *for the selected role only*.
Everything else collapses into an expandable section — reachable, not prominent. Governance metrics moved
off the homepage entirely.

---

**9. Are users being sent to generic pages instead of the exact answer?**

This is the most common failure of enablement platforms.

→ **Changed.** Search indexes eight entry types including individual rules, FAQs and measures, so a query
lands on the rule rather than a page containing it. The assistant is required to deep-link. Verified:
"commit forecast", "required fields", "where is the forecast dashboard" and "vendor opp" each return the
precise answer first.

---

**10. Can outdated content remain discoverable?**

Archived content must leave search. Overdue content must not.

→ **Confirmed and specified.** The lifecycle table in Output 7 states, per status, whether content is visible,
searchable, citable by the assistant and authoritative. Archived and retired leave search entirely; draft is
never citable.

---

**11. Is the design dependent on functionality Highspot may not support?**

Yes — and pretending otherwise would have been the most damaging thing in this pack.

→ **Changed.** Output 5 states that custom HTML should be assumed unsupported until proven in-tenant, sorts
every component into native / configuration / integration / custom, and lists six features that do not map
with a recommended fallback for each. The Topic Registry is called out as the main decision point with three
options and a recommendation. Feature names are flagged as requiring confirmation with the CSM.

---

**12. Can the model be reused across other Lanes?**

It must be, or it is a Salesforce microsite.

→ **Changed.** One lane template drives all nine lanes in the prototype, including lanes with no topics and
no partner assets — the states that break most templates. Phase 3.4 makes reuse an explicit test: if the
second lane needs template changes, the template gets fixed, not forked.

---

**13. Does every topic have a review mechanism?**

→ **Yes.** Cadence and next review date are required fields; review state is derived; missing dates are
flagged. Default six months, three where rules move with the quarter.

---

**14. Does the solution reduce work, or merely move documents into another system?**

The honest answer is that it only reduces work if three things happen: sellers get answers faster than
asking a colleague, RevOps maintains one source instead of several, and superseded versions are actually
retired.

→ **Changed.** Phase 4.5 (retire superseded material) is called out as the phase that decides whether this
works. The assistant is benchmarked against "ask a colleague" on speed. Duplication has a monthly sweep. If
the governed route is slower than making a new deck, duplication is a rational response and policy will not
prevent it — so the speed is the control.

---

**15. Are analytics measuring behaviour or merely page views?**

Page views were in the first draft.

→ **Changed.** Output 9 section 10 measures behaviour: reduction in "where is the documentation?" questions,
share of assistant answers from approved sources, unanswered-question trend, zero-result trend, managers
coaching from published examples, new-hire time to first correct answer, duplicate versions remaining. Page
views are named as an explicit anti-measure — a seller who gets a correct Slack answer in ten seconds and
never opens the page is a success.

---

**16. Does the assistant expose restricted information?**

The highest-severity failure mode in the design, and the least visible.

→ **Changed.** Permission-awareness is a hard gate in phase 2.6 with an explicit test using a restricted
user. If it cannot be achieved, the index is restricted to non-restricted content and the limitation is
stated openly to users rather than quietly hoped past.

---

**17. Can partner-facing content be revoked quickly?**

Only through Digital Rooms. An emailed attachment cannot be recalled.

→ **Changed.** Digital Rooms are the recommended distribution mechanism for governed partner assets,
precisely because access is revocable and trackable, and ad-hoc email distribution is a policy prohibition.
Acceptance criterion 4.6 tests revocation.

---

**18. Is there a clear escalation route when guidance is missing?**

Originally a generic mailbox, which is where questions go to die.

→ **Changed.** Every topic names an escalation contact. The gap form captures type, lane, impact and — most
usefully — *where you looked first*, which distinguishes a missing-content problem from a discoverability
problem. Reports route to the named lane owner, produce a reference number, and blocking reports are
answered directly while the content is written. The assistant's failure state offers the same route.

---

## Two challenges that did not produce a change, and why

**"Should the role selector be removed, since production uses permissions?"** No. It stays, clearly labelled
as a demonstration device, because the reviewers of this prototype need to *see* role relevance working.
Risk R14 covers the misunderstanding it could cause, and the role note under the selector states plainly that
production relevance comes from permissions and audience targeting.

**"Should overdue content be withdrawn automatically?"** No. Tempting, and wrong. Withdrawing leaves the
seller with nothing, and nothing sends them to a colleague, a stale deck, or a guess. A warned answer with a
named person to check with is the better failure mode. This was argued both ways and the decision is
deliberate.
