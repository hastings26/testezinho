# Output 10 — Risks and Mitigations

Severity reflects impact if the risk lands, not the likelihood of it landing.

---

## Critical — would cause commercial, legal or trust damage

### R1. Internal content shared externally
**Severity: critical.** A seller sends internal commercial guidance, product limitations or restricted
pricing to a partner.

*Why it happens:* classification relies on colour or on the seller remembering; internal and partner content
sit in the same list; a "conditional" asset carries no visible condition.

**Mitigation:** spatial separation on every page, not a filter · icon and text on every classification,
never colour alone · condition text rendered inline · standing warning at the head of every internal column ·
partner distribution through revocable Digital Rooms rather than email · assistant warns on shareability
before answering · classification confirmed at every review, not only at creation.

*Residual risk:* a determined user can always forward a file. Reduce blast radius through Digital Room
revocation and watermarking where available; accept that the control is behavioural at the last step.

### R2. The assistant exposes restricted information
**Severity: critical.** The Slack assistant returns content the asker could not open in Highspot.

*Why it happens:* the index is built without permission-awareness, because that is the easier integration.

**Mitigation:** treat permission-awareness as a phase-2 hard gate · explicit permission test with a
restricted user before any wider launch · if permission-awareness is not achievable, restrict the index to
non-restricted content only and **state that limitation openly to users** · re-test after every index change.

*Do not:* launch on the assumption that nobody will ask the wrong question.

### R3. Slack answers diverge from Highspot
**Severity: critical for trust.** Two authoritative-sounding answers to the same question destroys confidence
in both.

*Why it happens:* stage 6 of the workflow (re-indexing) is treated as a follow-up rather than part of
publication; or the assistant is allowed to accumulate its own content.

**Mitigation:** the assistant holds no content of its own — this is a design constraint, not a preference ·
re-indexing is inside the definition of published · index status is a registry field, visible and reportable ·
spot-check 20 answers against pages monthly · any divergence is an incident, with the assistant's answer
suppressed until the source is fixed.

---

## High — would undermine the system's purpose

### R4. Unclear or absent ownership
**Severity: high.** Nobody maintains a topic, and it silently rots.

**Mitigation:** owner is a required field — blank renders as a visible flag, not an empty cell · the registry
filters to gaps in one click · ownership reassignment is part of the leaver process · unreassigned after 30
days, the topic moves to *In review* with a visible warning · governance health reports % owned monthly.

### R5. Outdated sources presented with the platform's authority
**Severity: high.** Stale guidance is worse than none, because the platform lends it credibility.

**Mitigation:** review state derived from the date at render time, so it cannot be suppressed · overdue
content warned rather than hidden, naming the process owner · assistant prefixes the warning to its answer ·
archived content leaves search entirely · overdue count is a monthly governance measure with a target of zero.

### R6. Accidentally creating another source of truth
**Severity: high.** The hub becomes the fifth version of the rules rather than the route to the first.

*Why it happens:* content is written *into* Highspot rather than *from* a canonical source, usually because
writing is faster than agreeing.

**Mitigation:** no topic may be drafted without a canonical source · the source is linked, not copied, where
it must live elsewhere · Highspot never states a rule the source does not contain · phase 1 explicitly
retires competing versions · the registry records the source for every topic, and a missing source is a flag.

### R7. Duplication reappears over time
**Severity: high.** Six months after launch, three teams have made their own decks again.

**Mitigation:** phase 4.5 retires superseded material rather than leaving it · monthly duplication sweep ·
make the governed route genuinely faster than making a new deck — if it is not faster, duplication is a
rational response and no amount of policy will stop it.

### R8. Low seller adoption
**Severity: high.** Correct content that nobody uses.

*Why it happens:* launched to sellers before managers; framed as a platform rather than as an answer; slower
than asking a colleague.

**Mitigation:** manager enablement before seller launch — sellers copy what their manager inspects · Slack
as the entry point, because that is where they already are · measure behaviour, not page views · onboarding
integration so new hires never learn a different route · the assistant must beat "ask a colleague" on speed,
which is the only benchmark that matters.

---

## Medium — would degrade quality

### R9. Insufficient metadata
**Severity: medium, but expensive to fix late.** Without structured properties, filtering, expiry, targeting
and reporting are all impossible.

**Mitigation:** metadata model designed in phase 1, before any content is loaded · required properties with
controlled value lists · no free-text classification · retrofitting is explicitly called out as a phase-1
dependency because it costs multiples later.

### R10. Poor search results
**Severity: medium.** Sellers conclude the answer is not there and stop looking.

**Mitigation:** index sections and rules, not only pages · keywords include acronyms, slang and misspellings ·
zero-result searches reviewed monthly and converted into content or synonyms · the assistant is the fallback
when search fails.

### R11. Excessive page complexity
**Severity: medium.** The command centre becomes a wall, and users bounce.

**Mitigation:** three primary entry points on the homepage · progressive disclosure for non-primary content ·
fixed six-section topic template so complexity cannot creep unevenly · new-hire comprehension test as a
release gate.

### R12. Governance becomes manual and neglected
**Severity: medium, rising over time.** Enthusiastic for two months, then abandoned.

**Mitigation:** derive everything derivable — review state, gaps, counts · automate owner review alerts by
phase 5 · governance reporting generated from metadata export, not hand-collated · a standing monthly review
with Sales Leadership so it has an audience, because governance without an audience stops.

### R13. Permissions failure
**Severity: medium to critical depending on direction.** Either restricted content is over-exposed, or
sellers cannot see what they need and route around the system.

**Mitigation:** group model designed in phase 1 · permission tests for each role in phase 2 · re-test after
every structural change · monitor "cannot access" reports as a leading indicator.

### R14. The prototype is mistaken for the build
**Severity: medium.** Stakeholders approve the HTML and expect it in Highspot next month.

**Mitigation:** the persistent prototype banner · the *About this prototype* page · Output 5 states plainly
that custom HTML should be assumed unsupported, and separates visual prototype from native build from
optional custom development · discuss the role selector explicitly, since it is the feature most likely to
be assumed shippable.

---

## Watch list

| Risk | Signal to watch |
|---|---|
| Owner departure creating orphans | Registry % with named owner falling |
| Review debt accumulating | Overdue count rising month on month |
| Gap reports raised but not closed | Median age of open gaps rising |
| Assistant answering from stale sources | Rising share of answers carrying review warnings |
| Lane template forking | Lane pages diverging in structure |
| Partner assets sent outside Digital Rooms | Digital Room usage flat while partner sharing rises |
