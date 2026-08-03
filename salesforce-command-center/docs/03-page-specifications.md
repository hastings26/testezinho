# Output 3 — Page Specifications

Eight page types. Each specification lists purpose, structure, states, and the acceptance test that proves
the page works.

---

## 1. Homepage

**Purpose.** Answer "what am I expected to do, and where do I start" within one screen, without becoming a
link farm.

**Structure**
1. Prototype notice bar (removed at production)
2. Masthead — brand, role selector, Ask in Slack, primary navigation
3. Hero — title *"Know the rule. See what good looks like. Take the right action."*, one-paragraph
   description, six trust indicators, search field with seven suggested questions, Ask in Slack button
4. Three entry points — Rules of the Game · What Good Looks Like · Resources and Enablement, each with four
   example questions it answers
5. Priority topics for the selected role — cards showing name, description, owner, version, last review,
   next review, lifecycle badge, review badge, governance-gap badge
6. Collapsed section — topics not primary for this role (reachable, not prominent)
7. Two closing cards — assistant explainer, and report-a-gap

**States.** Role selected (default: All roles) · role with few relevant topics (collapsed section grows) ·
topic with governance gaps (red flag badge on the card).

**Acceptance test.** A new hire lands cold and can state, without help, what the page is for and where to
click for a rule. No more than three primary choices are competing for attention above the fold.

---

## 2. Lane page

**Purpose.** Give a motion its own workspace using one reusable pattern, with an unmistakable internal /
partner separation.

**Structure**
1. Breadcrumb — Home / Lane Workspaces / *lane*
2. Lane identity — name, description, lifecycle badge, lane owner, governed topic count
3. Topics in this lane — cards, marked where relevant to the selected role
4. The split, side by side on desktop, stacked on mobile:
   - **Left — *For You: Execute Internally***, with the standing warning: *"Internal materials must not be
     shared externally unless they are explicitly classified as shareable."*
   - **Right — *For Partners: Approved to Use or Share***, with a standing instruction to read the
     classification on each item.
5. Each asset card: type · title · description · condition text (if conditional) · shareability badge ·
   open action · Add to Digital Room (partner-safe items only)

**States.** Lane with topics · lane with no published topics (explicit empty state plus report-gap action) ·
lane with no partner-approved assets (explicit empty state — *"Do not assume internal material is safe to
share"*).

**Acceptance test.** A seller can tell, in under five seconds and without using colour, which column they are
looking at and whether a given asset can be sent to a partner.

---

## 3. Topic page

**Purpose.** The atomic unit of the system. One topic, one source, six sections, always the same order.

**Structure**
1. Breadcrumb — Home / Lane / Topic
2. Conditional banners — *not approved* (danger) or *review overdue* (warning), before the content
3. Identity — topic ref, lane, name, one-line summary
4. Badge row — approval, lifecycle, review state, version, content owner, process owner, governance gaps
5. Action row — open canonical source · ask about this topic in Slack · report an issue
6. Sections 1–6 as specified in the content template
7. Section 6 is permission-restricted in production

**States.** Published and current · published but review overdue · draft / not approved · no rules published ·
no partner assets · no measures defined. Each has a designed empty state that names the absence rather than
rendering blank.

**Acceptance test.** Owner, approval status, version, last review date and source are all visible without
scrolling past the badge row. A draft topic cannot be mistaken for approved guidance at a glance.

---

## 4. Topic Registry

**Purpose.** The governance spine, and the page that makes missing ownership impossible to hide.

**Structure**
1. Filter bar — lane · role · status (published / review due / draft / has governance gaps) · free text
2. Live count — *"N of 14 topics shown · M with governance gaps"*
3. Wide table, horizontally scrollable, 18 columns: ID, topic, lane, canonical source, content owner,
   process owner, approver, roles, approval, lifecycle, version, last review, next review, cadence,
   shareability, assistant index, flags, page link
4. Explanatory cards — why records are flagged

**Behaviour.** Missing owner renders as a bold **— none —**, not an empty cell. Flags are derived at render
time, so a stale record cannot report itself as complete.

**Acceptance test.** Filtering to *Has governance gaps* returns exactly the records that fail the publication
checklist, and each flag names the specific missing field.

---

## 5. Governance page

**Purpose.** Show that the system is governed, and give owners the operational view.

**Structure**
1. Governance health — four metrics: % with named owner, % approved, count overdue and due-soon, % indexed
   for the assistant
2. Warning banner when any topic is overdue, linking to the filtered registry
3. Ten-stage publication workflow, each stage with its accountable party
4. Twelve-point publication checklist
5. Ownership matrix — responsibility, accountable, consulted, cadence
6. Change history across all topics, newest first, each entry showing summary, reason, affected roles,
   communication, training impact and whether the assistant index was updated

**Acceptance test.** A reviewer can answer "how healthy is this system today" from the top of the page, and
"what changed and why" from the bottom.

---

## 6. Search results

**Purpose.** Return the answer, not a list of documents that might contain it.

**Structure**
1. Query echoed in the H1
2. Refine field, result count, and *Ask this in Slack* carrying the query across
3. Result cards, each showing: content type · approval status · shareability · title · description · topic ·
   owner · last review date · role relevance

**States.** Results found · zero results (designed state: records the gap, offers Slack and the gap report,
warns against assuming the answer does not exist).

**Acceptance test.** Searching "commit forecast", "vendor opp", "required fields" and "where is the forecast
dashboard" each return the correct answer in the first result. Verified in the prototype.

---

## 7. Content-gap page

**Purpose.** Convert a private frustration into a governed request.

**Structure**
1. Form: what were you trying to find out · type of problem (six options, including *guidance exists
   elsewhere but is not in Highspot*) · lane · where you looked first · impact (blocking / slowing /
   improvement) · free text
2. Confirmation with a reference number, naming the lane owner it routed to, and stating the handling path
3. List of reports submitted (browser-local in the prototype)
4. Four-step explainer of what happens to a report — routed, triaged, published, closed back

**Design note.** *Where did you look first* is the highest-value field on the form: it tells Revenue
Enablement whether the problem is missing content or a discoverability failure, which are different fixes.

**Acceptance test.** Submitting a report produces a reference, names an owner, and states when the reporter
will hear back. No report disappears silently.

---

## 8. Slack assistant handoff

**Purpose.** Demonstrate and specify the assistant's behaviour contract. **This page is not a chatbot and does
not create one** — the assistant already exists in Slack.

**Structure**
1. Prominent notice stating exactly that
2. Two cards — what the assistant will do (five behaviours) and what it will not do (four prohibitions)
3. Question input plus six sample questions, two of which are engineered to fail
4. Response area

**The three response states, all specified and all demonstrated:**

| State | Trigger | Response contains |
|---|---|---|
| **Approved answer** | Published Highspot topic matches | Concise answer · shareability warning where relevant · source title and version · last review date · owner · direct link to the topic page |
| **Content gap** | Approved source exists but is not published in Highspot | The answer · an explicit gap notice · source, review date, owner · action to log the gap against the lane |
| **No approved guidance** | Nothing approved matches | *"No approved guidance currently exists."* · no inferred answer · four next actions · a note that the unanswered question is recorded |

Additional required behaviours: an overdue source triggers a review warning inside the answer; any question
containing sharing language triggers the shareability warning before the answer body; draft and unapproved
topics are excluded from retrieval entirely.

**Acceptance test.** Ask *"What can I share with a partner about MIP?"* → content-gap state. Ask *"What is our
policy on discounting above 30%?"* → no-approved-guidance state, with no invented answer. Both verified in
the prototype.
