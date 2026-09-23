# Onboarding Request 8-bit Prototype
## Exact handoff of the recreation supplied to Alex

This document describes the standalone HTML prototype in `onboarding-request-8bit.html` exactly as it was built, including its data model, visual treatment, interaction logic, calculations, simulated submission behaviour, and known differences from Marco's original specification.

Use this as the build brief for Claude. The accompanying `onboarding-data.json` contains the exact data embedded in the HTML.

---

# 1. Purpose

The page is a front-end-only onboarding request prototype.

The intended user is a hiring manager.

The manager supplies:
- New hire name
- Department
- Role
- Start date
- Manager name
- Optional additional message

The system then:
- Derives mandatory modules from department + role
- Locks those modules so the manager cannot remove them
- Allows additional modules to be selected
- Calculates total learning time
- Converts that time into onboarding days
- Shows the number of locked vs manager-added modules
- Enables submit only when the required player-setup fields are complete
- Displays a simulated confirmation/system log

The standalone file does NOT:
- Send email
- Save data
- Create bookings
- Persist state
- Log in users
- Connect to Excel
- Start real completion tracking
- Run an approval workflow
- Match calendars or capacity

Everything happens in the browser only.

---

# 2. File architecture

The entire prototype is one HTML file.

File:
`onboarding-request-8bit.html`

It contains:
1. HTML markup
2. CSS
3. One JavaScript data object called `DATA`
4. JavaScript rendering and interaction logic

No external libraries.
No external fonts.
No external images.
No network calls.
No build process.
No server.

It can be opened by double-clicking the HTML file.

---

# 3. Architecture principle used

The page intentionally separates content from rendering logic.

The JavaScript contains one top-level data object:

```js
const DATA = {
  departments: [...],
  roles: [...],
  modules: [...],
  baselines: [...],
  roleMappingDelivery: [...]
};
```

The renderer below that object does not hard-code individual department names or module names.

The five collections were chosen to mirror the intended future Excel concept:

1. departments
2. roles
3. modules
4. baselines
5. roleMappingDelivery

Important: this recreation does not import Excel. The structure merely anticipates a later connection.

The same data is supplied separately as:
`onboarding-data.json`

---

# 4. Data model

## 4.1 departments

Schema:

```json
{
  "id": "sales",
  "name": "Sales"
}
```

Departments in this recreation:
- Sales
- Marketing
- Finance
- Revenue Enablement
- Revenue Operations
- Technical Pre-Sales
- Vendor Experience

---

## 4.2 roles

Schema:

```json
{
  "id": "cam",
  "department": "sales",
  "name": "Channel Account Manager"
}
```

The `department` field connects each role to a department.

When a department is selected:
- The role dropdown is cleared.
- Only roles belonging to that department are shown.
- Changing department clears the current role and mandatory selection.

Roles used:
- Channel Account Manager
- Account Executive
- Sales Manager
- Marketing Specialist
- Finance Analyst
- Revenue Enablement Programs Manager
- Revenue Operations Analyst
- Solutions Consultant
- Vendor Experience Manager

These role lists were reconstructed for the prototype. They are not asserted to be Marco's final approved catalogue.

---

# 5. Module catalogue

There are 19 modules.

## Culture
- Culture Essentials, 90 minutes

## Offering
- Marketplace, 60 minutes
- Partner Enablement, 45 minutes
- Partner Support, 45 minutes
- Vendor, 45 minutes

## Tools
- AI Literacy, 60 minutes
- M365, 45 minutes
- Power BI, 45 minutes
- Salesforce, 90 minutes

## Department
- Academy Essentials, 45 minutes
- Finance Essentials, 30 minutes
- Marketing Essentials, 45 minutes
- Professional Services Essentials, 45 minutes
- Revenue Enablement Essentials, 45 minutes
- Revenue Operations Essentials, 45 minutes
- Sales Complete, 255 minutes
- Sales Essentials, 45 minutes
- Technical Pre-Sales Essentials, 45 minutes
- Vendor Experience Essentials, 45 minutes

The durations above are exactly what is in the recreated HTML.

They should not be treated as approved business data simply because they are in the prototype.

---

# 6. Baseline logic

Mandatory learning is calculated at runtime.

Formula:

```text
mandatory =
    department baseline
    UNION
    role-specific module mapping
```

Duplicates are removed using a JavaScript `Set`.

Code concept:

```js
function mandatoryFor(dep, role) {
  const baseline = ...
  const roleModules = ...
  return [...new Set([...baseline, ...roleModules])];
}
```

This means:
- Department establishes the main baseline.
- Role can add extra mandatory learning.
- The manager does not decide what is mandatory.

---

# 7. Baselines currently encoded

## Sales
Mandatory department baseline:
- Culture Essentials
- Marketplace
- Partner Enablement
- Partner Support
- Vendor
- AI Literacy
- M365
- Power BI
- Salesforce

This baseline totals:

90 + 60 + 45 + 45 + 45 + 60 + 45 + 45 + 90
= 525 minutes
= 8.75 hours

## Marketing
- Culture Essentials
- Marketing Essentials

## Finance
- Culture Essentials
- Finance Essentials

## Revenue Enablement
- Culture Essentials
- Revenue Enablement Essentials

## Revenue Operations
- Culture Essentials
- Revenue Operations Essentials

## Technical Pre-Sales
- Culture Essentials
- Technical Pre-Sales Essentials

## Vendor Experience
- Culture Essentials
- Vendor Experience Essentials

---

# 8. Role-specific mappings currently encoded

Channel Account Manager:
- Adds Sales Complete

Account Executive:
- Adds Sales Essentials

Sales Manager:
- Adds Sales Complete

All other reconstructed roles:
- No additional role module in this prototype

The CAM mapping was deliberately set so the recreation reproduces Marco's worked example:

Sales baseline:
525 minutes

CAM role addition:
Sales Complete = 255 minutes

Total:
780 minutes
= 13 hours

Mandatory module count:
9 baseline modules + 1 role module
= 10 locked modules

Onboarding days:
ceil(13 / 4)
= 4 days

So:

**CAM in Sales = 10 locked modules, 13 hours, 4 onboarding days**

---

# 9. Delivery metadata

Each role-mapping record can also contain:

```json
{
  "owner": "Revenue Enablement",
  "notify": "Hiring Manager, Revenue Enablement"
}
```

This information is NOT displayed during module selection.

It appears only in the simulated system log after submit.

That follows the idea that the hiring manager should not be negotiating delivery ownership from the form itself.

The owner/notification values in this recreation are reconstructed placeholder values, not validated source-of-truth data.

---

# 10. State management

There are two separate JavaScript Sets:

```js
const state = {
  locked: new Set(),
  added: new Set()
};
```

`locked`
- Contains modules derived from department + role.
- These appear selected.
- Their checkbox is disabled.
- They get a visible `LOCKED` badge.

`added`
- Contains modules selected by the manager.

At render time the visible selection is derived:

```js
selected = locked UNION added
```

The selected list is not stored as one flat array.

This was deliberate.

---

# 11. Role changes

When a role changes:
- `locked` is recalculated from the new department/role combination.
- `added` remains intact.

Therefore, manager-selected optional modules survive a role change.

The previous role's locked obligations disappear automatically when the new role is rendered.

This is the key reason the prototype keeps `locked` and `added` separate.

---

# 12. Locked-module behaviour

Mandatory modules:
- Are preselected
- Have their checkbox disabled
- Receive the CSS class `.locked`
- Show a `LOCKED` badge
- Cannot be unchecked

When the user clicks a locked module:
- The default click is prevented
- The row briefly flashes and moves a few pixels
- This is intended to communicate "this is locked" instead of behaving like a dead click

Animation:

```css
.flash { animation: flash .45s 2 }
```

The keyframe briefly increases brightness and translates the row horizontally.

---

# 13. Optional module behaviour

A non-locked module can be checked or unchecked.

Checking:
- Adds its module ID to `state.added`

Unchecking:
- Removes its ID from `state.added`

Important fidelity note:
Marco's written design says the manager should "only add, never remove."

In this recreation, the user CAN remove a module they personally added by unchecking it.

That is a known difference between the recreated HTML and the strict wording of Marco's design.

---

# 14. Group [ALL] control

Each category has a right-aligned `[ALL]` control.

Clicking it:
- Collects all non-locked module IDs in that category.
- If every optional module in that category is already selected, it removes them all.
- Otherwise it adds them all.

Locked modules are ignored by this toggle.

This is a convenience behaviour added in the recreation.

---

# 15. Time calculation

Total minutes are calculated from every selected module:

```js
mins = selected.reduce(
  (sum, id) => sum + moduleById(id).minutes,
  0
);
```

Hours:

```js
hours = mins / 60;
```

Display formatting:
- Whole hours show as an integer.
- Fractional hours show one decimal place.

Examples:
- `13` displays as `13`
- `8.75` displays as `8.8`

---

# 16. Day calculation

Rule:

```js
days = mins ? Math.ceil(hours / 4) : 0;
```

Maximum onboarding session time per day:
4 hours

A started day counts as a full onboarding day.

Examples:
- 4 hours = 1 day
- 5 hours = 2 days
- 8 hours = 2 days
- 9 hours = 3 days
- 13 hours = 4 days

The exact explanatory text shown on the page is:

`MAX 4 HRS OF SESSIONS PER DAY. A STARTED DAY COUNTS AS A FULL DAY: 8 HRS IS 2 DAYS, 9 HRS IS 3 DAYS.`

---

# 17. Summary block

The bottom summary shows:

## Total time
Example:
`13 HRS · 10/19 MODULES`

## Selection split
Example:
`10 LOCKED BASELINE + 0 ADDED BY YOU`

## Onboarding days
Represented visually by:
- Pixel-style coin shapes
- Small day boxes
- Caption such as `DAY 1 TO DAY 4`

The visual day count updates live.

---

# 18. Coin rendering

Coins are pure CSS divs.

There are no image assets.

For each onboarding day:
- One `.coin` element is rendered
- Maximum displayed coins is 8

The coin is:
- 50x50 pixels
- Thick yellow border
- Brown fill
- Offset box shadows for pixel-art depth

This is an approximation of the arcade/8-bit visual from the screenshots.

---

# 19. Day boxes

The page renders at least 5 small square boxes.

If there are more than 5 onboarding days, it can render up to 8 boxes.

Rules:
- `Math.max(5, Math.min(8, days))`
- Boxes up to the calculated day count receive `.on`
- `.on` boxes are filled yellow

When no modules are selected the caption defaults to:
`DAY 1 TO DAY 5`

---

# 20. Player setup fields

Fields:
- Name
- Department
- Role
- Start Date
- Manager

Department:
- Select dropdown

Role:
- Disabled until department has been selected
- Then populated dynamically

Start date:
- Native HTML date field

Name and Manager:
- Text inputs

All fields use uppercase visual styling via CSS.

---

# 21. Submit validation

Submit is enabled only when ALL of these are true:

- Name is not empty
- Department is selected
- Role is selected
- Start date exists
- Manager is not empty
- At least one locked mandatory module exists

Code concept:

```js
const ready =
  name &&
  department &&
  role &&
  start &&
  manager &&
  state.locked.size;
```

There are two submit controls:
1. Main submit button in the page summary
2. Sticky submit button at bottom of viewport

Both are enabled/disabled together.

---

# 22. Sticky summary bar

A fixed bar stays near the bottom of the browser viewport.

When nothing is selected:
`NOTHING SELECTED YET`

When modules exist, example:
`13 HRS · 10 MODULES · 4 DAYS`

The bar also contains a submit button.

Visual treatment:
- Semi-transparent dark background
- Blur backdrop
- Light border
- Pixel-style offset shadow

---

# 23. Additional message

Optional textarea.

Placeholder:
`FOCUS AREAS, SCHEDULING CONSTRAINTS, PRIOR EXPERIENCE`

It is not currently included in the simulated log.
It is present as a UI field only.

---

# 24. Submit result

On submit:
- Nothing is sent anywhere.
- A hidden confirmation section receives the class `.show`.
- The page scrolls to that section.

Heading:
`REQUEST READY`

Message:
`This prototype does not send or store anything. The workflow below is a simulation.`

---

# 25. Simulated system log

The system log is generated using current state.

Lines currently generated:

1. `MODULES PLANNED: X (Y LOCKED + Z ADDED).`
2. `CONTENT OWNER IDENTIFIED: ...`
3. `DISTRIBUTION LIST WILL BE NOTIFIED: ...`
4. `CONSOLIDATED PLAN WILL BE PREPARED FOR [NAME].`
5. `COMPLETION TRACKING STARTS ON SUBMIT IN THE FUTURE CONNECTED VERSION.`
6. `ESTIMATE: X HOURS ACROSS Y ONBOARDING DAYS.`

Final tiny note:
`Nothing was sent, booked, stored, or tracked by this standalone prototype.`

This wording was chosen to avoid falsely implying that the prototype executed real downstream actions.

---

# 26. Visual design

Overall visual direction:
- 8-bit / arcade
- Dark charcoal background
- Neon category colours
- Monospace typography
- Uppercase copy
- Pixel-like shadows
- Deliberately retro

No logo is used.

No Pax8 brand asset is embedded.

---

# 27. Colour variables

CSS variables:

```css
--bg: #17171d;
--panel: #1f2028;
--ink: #f8f3e8;
--muted: #b8b6c1;
--line: #6e6d79;
--yellow: #ffd84d;
--blue: #3898ff;
--pink: #ff3b9d;
--purple: #bd62ff;
--orange: #ffb13b;
--green: #84ff57;
```

Category colours:
- Culture = purple
- Offering = pink
- Tools = orange
- Department = green

---

# 28. Background

The page uses a radial gradient:

```css
background:
  radial-gradient(
    circle at 50% -10%,
    #292937 0,
    #17171d 42%,
    #111116 100%
  );
```

A fixed scanline texture is layered over the entire screen:

```css
body:before {
  opacity: .08;
  background:
    repeating-linear-gradient(
      0deg,
      transparent 0 3px,
      #fff 4px,
      transparent 5px
    );
}
```

This creates the old-monitor/arcade feel.

---

# 29. Typography

Font stack:

```css
font-family: "Courier New", monospace;
```

Reason:
- No font download required
- Works offline
- Gives the visual a chunky retro/computer feel

Most of the UI:
- Uppercase
- Slight letter spacing
- Heavy font weights

Main heading:
`ONBOARDING REQUEST`

Responsive font size:
roughly 34px to 68px

Heading uses yellow text with blue/brown offset text shadows to fake 8-bit extrusion.

---

# 30. Layout

Main content width:

```css
width: min(920px, 92vw);
```

Centered.

Desktop:
- Setup rows use two columns
- Left label approximately 180px
- Field occupies remaining space

Mobile below 650px:
- Setup rows become one column
- Fields align left
- Module/time columns become narrower
- Sticky bar adjusts spacing

---

# 31. Module row layout

Each module row uses CSS grid:

```css
grid-template-columns:
  28px
  minmax(0, 1fr)
  105px;
```

Columns:
1. Checkbox/pixel box
2. Module name + dotted leader
3. Time

The native checkbox itself is visually hidden.
A custom `.box` is rendered instead.

When checked:
- A coloured square fills inside the custom box.

When locked:
- An `L` appears visually in/near the checkbox.
- The row also gets the explicit `LOCKED` badge.

---

# 32. Dotted leaders

The visual dotted line between module name and duration is not text.

It is a flexible element:

```css
.dots {
  border-bottom: 2px dotted currentColor;
  flex: 1;
}
```

This allows the line to resize with the browser width.

---

# 33. Section headings

Sections:
- PLAYER SETUP
- MODULE SELECT
- ADDITIONAL MESSAGE

Each is built as a 3-column grid:
line | title | line

The left/right rules are CSS generated via `:before` and `:after`.

---

# 34. JavaScript functions

Main functions:

### `populateDepartments()`
Adds department options from `DATA.departments`.

### `populateRoles()`
Filters `DATA.roles` by selected department.

### `renderCatalog()`
Builds every group and module row from `DATA.modules`.

### `mandatoryFor(dep, role)`
Returns de-duplicated baseline + role modules.

### `applyRole()`
Recalculates locked mandatory modules.

### `toggleAdded(id, on)`
Adds/removes manager-selected optional modules.

### `selectGroup(group)`
Implements `[ALL]` category toggle.

### `refresh()`
Central render/update function.
It:
- Combines locked + added
- Updates checkboxes
- Applies locked styling
- Creates/removes LOCKED badges
- Calculates minutes/hours/days
- Updates counts
- Updates day graphics
- Updates submit state
- Updates sticky summary

### `renderDays(days)`
Draws coins and day boxes.

### `updateSubmit()`
Runs form validation.

### `submit()`
Creates simulated log and reveals confirmation.

---

# 35. Initialisation

On page load:

```js
populateDepartments();
renderCatalog();
refresh();
```

Event listeners are then attached to:
- Department
- Role
- Name
- Start date
- Manager
- Main submit
- Sticky submit
- Module rows

There is no stored session.

Refreshing the browser resets everything.

---

# 36. Known differences from Marco's document

These are important. Do not silently "fix" them if the goal is to reproduce the current HTML exactly.

## Difference 1: reconstructed data
The role lists, baselines, owner names and notification lists were reconstructed for the prototype.
They are not Marco's original hidden source data.

## Difference 2: placeholders not visibly labelled
Marco says placeholder data should be understood as dummy/calibration data.
The current HTML does NOT visibly mark those fields as `PLACEHOLDER`.

## Difference 3: manager can unselect their own additions
Marco's phrase is "add, never remove."
The recreation allows the manager to uncheck a module they themselves added.

Mandatory modules still cannot be removed.

## Difference 4: `[ALL]` is a toggle
The recreation's `[ALL]` control can both add and clear optional modules in that category.

## Difference 5: five-table concept, not proven exact Excel 1:1
The HTML has five collections corresponding to the conceptual tables.
It was not validated against an actual Excel workbook.

## Difference 6: additional message is not propagated
The textarea exists but its contents are not included in the confirmation log or data submission because there is no real submission.

---

# 37. What should be preserved if Claude recreates the same version

Preserve these behaviours exactly:

- One standalone HTML file
- No external dependencies
- Department filters role
- Role determines locked modules
- Department baseline + role mapping are de-duplicated
- Locked modules cannot be unchecked
- Manager additions stored separately
- Manager additions survive role changes
- Live total updates after every selection
- Four-hour day rule
- `Math.ceil(hours / 4)`
- Two submit buttons, main and sticky
- Both submit buttons share validation state
- Confirmation is explicitly simulated
- No claim that anything was actually sent
- Data block separate from rendering
- 19-module catalogue
- CAM test case = 10 locked modules / 13 hours / 4 days
- 8-bit dark arcade visual

---

# 38. Test case Claude should run

Use:

Name:
`TEST USER`

Department:
`Sales`

Role:
`Channel Account Manager`

Start date:
any valid date

Manager:
`TEST MANAGER`

Expected result before adding anything manually:

- 10 selected modules
- 10 locked baseline
- 0 added by you
- 13 hours
- 4 onboarding days
- Submit enabled after all player setup fields are complete

Locked modules should be:
1. Culture Essentials
2. Marketplace
3. Partner Enablement
4. Partner Support
5. Vendor
6. AI Literacy
7. M365
8. Power BI
9. Salesforce
10. Sales Complete

---

# 39. Exact handoff instruction for Claude

You can paste this directly into Claude:

> Recreate the supplied `onboarding-request-8bit.html` as a standalone HTML application. Use `onboarding-data.json` as the exact current data source and this specification as the behavioural contract. Do not invent additional roles, modules, workflows, backend integrations or business rules. Preserve the separation between data and rendering. Mandatory modules are `department baseline ∪ role mapping`, de-duplicated. Store mandatory (`locked`) and manager-selected (`added`) modules separately. Reproduce the live time/day calculation using a maximum of four onboarding-session hours per day and `ceil(totalHours / 4)`. The Sales + Channel Account Manager test case must produce 10 locked modules, 13 hours and 4 onboarding days. Keep the submission explicitly simulated, with no network calls or persistence. Match the dark 8-bit arcade visual as closely as practical using only HTML/CSS/JavaScript and no external dependencies.

---

# 40. Source files in this handoff

- `onboarding-request-8bit.html`
  - The actual recreated prototype

- `onboarding-data.json`
  - Exact data extracted from the recreated prototype

- `CLAUDE_REBUILD_SPEC.md`
  - This document

These three files are also packaged together in:
`onboarding-request-claude-handoff.zip`

---

# Appendix A: changes made after handoff

The document above is the specification as received. This appendix records
where the built prototype now deliberately departs from it, so the two can
be read together without either being rewritten.

## A.1 The onboarding-days read-out (supersedes sections 16, 17 and 19)

The original design reported days as a caption, `DAY 1 TO DAY 4`, above a
line of explanatory arithmetic:

`MAX 4 HRS OF SESSIONS PER DAY. A STARTED DAY COUNTS AS A FULL DAY: 8 HRS IS 2 DAYS, 9 HRS IS 3 DAYS.`

That asked the reader to work out what the numbers meant for their new
hire. It is replaced by a plain-language sentence:

`TEST USER WOULD NEED 4 ONBOARDING DAYS TO COMPLETE 13 HOURS OF ONBOARDING.`

Rules:

- The name comes from the Name field, uppercased. Until one is entered the
  sentence reads `YOUR NEW HIRE`.
- Before a department and role are chosen it reads
  `SELECT A DEPARTMENT AND ROLE TO SEE THE ONBOARDING ESTIMATE.`
- Days and hours are singular at one (`1 ONBOARDING DAY`, `1 HOUR`).
- The day count and hour count are emphasised in the accent colour.

The calculation is unchanged: `ceil(totalHours / 4)`, a part-day counting
as a full day. The rule is now supporting text beneath the sentence rather
than the primary explanation:

`BASED ON UP TO 4 HOURS OF SESSIONS PER DAY. A PART-DAY COUNTS AS A FULL DAY.`

The coins and day boxes are unchanged.

## A.2 Scheduling note (new)

A note below the estimate states that the figure is an estimate of effort
rather than a set of booked dates, and that the real number of days may
differ depending on delivery-team availability, the new hire's calendar,
and how sessions are grouped.

The team named in the note is the `owner` from the role's
`roleMappingDelivery` record, so a Finance hire is not told to wait on
Revenue Enablement. It falls back to `Revenue Enablement` when no role is
selected.

This is the one place delivery ownership appears before submit. Section 9
keeps owner and notification list out of module *selection* so the manager
is not negotiating delivery from the form; naming the team in a scheduling
caveat does not reopen that.

## A.3 Section heading

The summary heading is `ONBOARDING ESTIMATE` rather than `TOTAL TIME`,
since the block now leads with the estimate rather than the total.

## A.4 Session syllabus view (new)

The prototype now has two views in one file, switched by URL hash so a
link to either can be shared:

- `#request` (and anything unrecognised) — the request form, unchanged
- `#syllabus` — an outline of what every session covers

The masthead and document title follow the view. The sticky summary bar is
hidden on the syllabus, since it summarises the form.

Each of the 19 modules gets a card showing its name, duration, a one-line
summary, a topic list, and who has to take it. The requirement line is
**derived from the same `baselines` and `roleMappingDelivery` records that
drive the locking**, so the syllabus cannot drift out of step with what the
form enforces:

- Departments whose baseline includes the module
- Roles whose mapping adds it
- Otherwise: optional, required by nothing

The syllabus copy — summaries and topic lists — lives in a `SYLLABUS`
object held separate from `DATA`, keyed by module id. `DATA` stays an exact
mirror of `onboarding-data.json` and is checked against it; the syllabus
text is prototype copy and is not.

**This copy is illustrative and has not been reviewed by the teams who own
the material.** The view carries a visible notice saying so. It must be
replaced before the page is shown to anyone as a real curriculum.

## A.5 Motion

Three parallax layers of pixel dust sit behind the content, tracking scroll
at 0.08, 0.18 and 0.32 of page speed, with a few pixels of pointer drift.
The masthead lags the page at 0.12. Coins land with a staggered pop, and
are only redrawn when the day count actually changes — `refresh()` runs on
every keystroke in the name field, and re-animating on each would strobe.

Smaller interactions: pixel checkboxes scale their fill in, rows nudge on
hover, buttons press into their shadow, the confirmation panel rises.

All of it is decorative. Under `prefers-reduced-motion: reduce` the
parallax layers are removed and animation and transition durations collapse
to nothing; the page reads identically. Nothing is revealed by scrolling —
the whole page is present at rest.

## A.6 Post-handoff additions

Requested after the prototype was in use.

### Roles: CGS, MGS, TPS

Three roles added under **Sales**, alongside Channel Account Manager,
Account Executive and Sales Manager. Each has an empty role mapping — no
additional mandatory module beyond the Sales baseline — with Revenue
Enablement as delivery owner.

Three things about them are **assumptions, not confirmed facts**:

- That they are roles rather than departments or modules (confirmed by the
  requester; the department placement was not)
- That they belong to Sales
- That Revenue Enablement owns their delivery

The acronyms are also unexpanded. `TPS` here is a Sales role and is
distinct from the existing **Technical Pre-Sales** department and its
Solutions Consultant role; the role id is `tps-sales` because `tps` was
already taken by that role, and `tps` is also a module id.

### Field naming

`NAME` is now `NEW HIRE NAME`, so a manager does not read it as their own.
A `NEW HIRE LDAP` field is added for the network username — optional, and
not required to submit. The label may need changing for organisations that
call it something else.

### Manager email and take-away copy

A `YOUR EMAIL` field feeds two actions under the summary:

- **EMAIL THIS TO ME** — a `mailto:` link with the plan as the body. It
  opens the manager's own mail client; the page still sends nothing itself.
- **COPY SUMMARY** — copies the same plain text. Where the browser refuses
  clipboard access the text is shown in a textarea to copy by hand, rather
  than failing silently.

Neither is required to submit. The summary covers the new hire, LDAP,
department, role, start date, manager, sessions by category, additional
requests, shadowing, the message, the delivery owner and the estimate — and
repeats that nothing was sent, booked, stored or tracked.

### Additional requests

A free-text list for anything the catalogue does not cover. Each entry has
a name and an optional duration:

- With a duration, it counts towards hours, days and the session count
  exactly as a catalogue module does
- Without one, it is carried through as `TO BE SCOPED` and changes no total

They are held in `state.extras`, separate from `locked` and `added`, and do
not appear in the syllabus. The simulated log quotes the same total the
page shows, requests included.

### Shadowing

A `REQUEST SHADOWING SUPPORT` toggle and a `WHO SHOULD THEY SHADOW?` field,
the latter enabled only when support is requested and blank meaning "we
will suggest someone". Shadowing is arranged separately and **does not
change the estimate**; the page says so.

### Motion

The scanline overlay is removed.

Confetti fires once on submit: pixel squares in the page palette, thrown
from the lower corners, cleared as soon as the last piece leaves the
screen. It is skipped entirely under `prefers-reduced-motion`, and nothing
depends on it.
