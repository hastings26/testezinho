# SCORM packages — Copilot Cowork Challenge

Two upload-ready packages, built from the same `copilot-cowork.html` in the repo root:

| File | Standard | Use when |
|---|---|---|
| `copilot-cowork-scorm12.zip` | SCORM 1.2 | **Start here.** Widest LMS support. |
| `copilot-cowork-scorm2004.zip` | SCORM 2004 4th Ed | Your LMS requires 2004, or you want separate completion/success reporting. |

Upload the zip as-is. Don't unzip it first — `imsmanifest.xml` has to sit at the zip root.

## What the LMS gets back

| SCORM field | Value |
|---|---|
| Score | The Gauntlet percentage, 0–100 (mastery 80) |
| Status | `passed` / `failed` / `incomplete` (2004: `completion_status` + `success_status`) |
| Suspend data | Name and all three path results, so learners resume where they left off |
| Session time | Time in the module, per launch |

The learner's name is pulled from the LMS (`student_name` / `learner_name`) and pre-fills the
scorecard field, so it appears on their results screens without them typing it.

## Choosing what counts as "complete"

One knob, at the top of `src/scorm-wrapper.js`:

```js
var COMPLETION = "gauntlet";
```

- **`"gauntlet"`** *(default)* — The Gauntlet is the scored assessment, so completion means
  finishing it and pass/fail is its 80% mark. Myth Buster and The Showdown are recorded but
  optional. This is the defensible default: one measured thing, one pass mark.
- **`"all_three"`** — Learner must clear all three paths (Triple Threat). Strictest. Reported
  score is still the Gauntlet's.
- **`"any"`** — Finishing any one path completes the module. For optional/self-directed enrolment.

Change it, then run `python3 scorm/build.py` to rebuild both zips.

## Rebuilding

```bash
python3 scorm/build.py
```

Reads `copilot-cowork.html`, injects one `<script>` tag, writes both zips. The app source is
never modified — the adapter attaches from the outside, so the same file serves GitHub Pages
and the LMS with no divergence.

## How it attaches without touching the app

The app's `S` (state) and `CONFIG` are `const` declarations at the top level of a classic
script. Those live in the global *lexical* environment: reachable by bare reference from a
sibling classic script, but not as `window` properties. Its `gResults` / `mythResults` /
`sdResults` are function declarations, which *do* become `window` properties and can be wrapped.

So the adapter wraps those three functions to report after each result screen, and reads `S`
directly. Verified in Chromium before the adapter was written:

```
S_readable: true     gResults_onWindow: true     canMutateS: true
S_onWindow: false    canWrapGResults: true
```

If no LMS API is found, the adapter returns immediately and the page behaves exactly as it does
standalone. Append `?scormdebug=1` to the launch URL to log every LMS call to the console.

## Verified behaviour

Driven against a mock LMS runtime (both API versions) in Chromium:

- Passing the Gauntlet → `passed`, score written, mastery respected.
- Failing it → `failed` with the real score, not a silent `incomplete`.
- **Relaunching after a pass does not overwrite it.** Prior status is read before anything is
  written, and status never moves backwards (`passed` > `completed`/`failed` > `incomplete`).
- `review` mode and `no-credit` mode write **nothing**.
- Resume restores name, path badges and scorecard from suspend data (224 chars of the 4096 budget).
- Session time formats match each spec: `00:00:29.93` for 1.2, `PT0H0M29.75S` for 2004.
- With no LMS present, zero errors and full functionality.

**Scope note:** resume restores *completed* path results, not a half-finished Gauntlet. Someone
who quits mid-round restarts that round. Mid-question bookmarking would need changes to the app
itself, not the adapter.

## Not included

The ADL schema XSDs (`adlcp_rootv1p2.xsd` and friends) are not bundled. They're optional in
practice — every mainstream LMS accepts a manifest without them. If your LMS's validator
insists, drop them in next to `imsmanifest.xml` and add a `<file>` entry for each.
