# MIP Compass

A five-to-eight minute judgement game for Channel Account Managers. Five fictional
partners, four decisions each, partial credit throughout.

Players practise the four questions that matter in a real partner conversation:

1. Where is this partner today?
2. Which route is most suitable for them?
3. What should happen next?
4. What should the CAM say or ask?

It teaches judgement, not recall. Most answers are neither right nor wrong — they
are early, late, or misaligned with what the partner can actually resource, and the
feedback explains the commercial consequence rather than marking a box.

---

## Run it

No build step, no dependencies, no package manager.

```
open mip-compass.html
```

Or serve the folder if you prefer a real origin (recommended — `localStorage`
behaves more predictably over `http://` than `file://`):

```
python -m http.server
# then http://localhost:8000/mip-compass.html
```

It is already wired into this repo's GitHub Pages workflow, so pushing to `main`
publishes it at `<pages-url>/mip-compass.html`.

**Admin:** `mip-compass-admin.html` — default password `mip-admin`.

---

## ⚠️ Before this goes in front of reps or partners

Two things need a decision from someone who owns the framework wording.

**1. The five maturity stages are placeholders.**
`Exploring → Experimenting → Offering → Scaling → Optimising` do not come from an
approved MIP document — they came from the original build brief. Replace the
`label` and `description` of each entry in `MIP_CONFIG.stages` (`data.js`) with the
official wording. **Leave the `id` values alone** and nothing else needs editing —
all twelve scenarios reference stages by id, so the mechanics and scoring are
untouched by a rename. The admin area's *Framework wording* tab does the same job
without opening a file.

**2. The six territories are the six plays and are treated as settled.**
`Discover · Sell · Buy · Build · Implement · Manage`. The playful place names
(Discover Harbour, Sell Square, …) are game flavour and can be renamed freely.

Everything else — routes, product name, tagline, scoring weights — is placeholder-safe
and editable in the same two places.

---

## Editable files

| File | What lives there |
|---|---|
| **`mip-compass/data.js`** | **The one you will actually edit.** All wording, the six plays, five stages, two routes, scoring rules, player titles, feedback tone bands, and all twelve scenarios. |
| `mip-compass/styles.css` | Design system. Every colour and font is a custom property in `:root` — swap those to rebrand the whole product without touching anything below. |
| `mip-compass/map.js` | The MIP Landscape SVG. Territory positions in `LAYOUT`, road connections in `ROADS`. Colours and names are read from `data.js`, so renaming a play never touches this file. |
| `mip-compass/game.js` | Screens, scoring, state. |
| `mip-compass/store.js` | Storage adapter — the single seam where a backend would slot in. |
| `mip-compass/admin.js` / `admin.css` | The authoring UI. |
| `mip-compass.html` / `mip-compass-admin.html` | Page shells. |

All original SVG and CSS. Nothing copied from MapTap or any other game.

---

## Adding a scenario

**The easy way.** Open `mip-compass-admin.html`, unlock, click **+ New scenario**.
The editor validates as you go and flags the mistakes that quietly break a round
(no full-marks conversation option, two options at full marks, an ideal answer worth
less than 50). New scenarios are created archived — tick *Active* when it is ready.

Admin edits live in that browser only. To ship them to everyone: **Import / export
→ Copy scenarios JSON**, and paste it over the `MIP_SCENARIOS` array in `data.js`.

**The direct way.** Add an object to `MIP_SCENARIOS` in `data.js`. The contract is
documented in full above the array. The parts people get wrong:

- `routeCredit` needs an entry for **all four** routes, `destinationCredit` for
  **all six** territories. A missing key scores zero, which is rarely what you meant.
- The ideal answer must be worth the full 50 in its credit map.
- Exactly one `conversationOptions` entry should be worth 50. One or two others
  should earn partial credit — that is where the teaching happens.
- `destinationNotes` is optional per-territory text explaining *why* a near-miss
  earned what it earned. Worth writing for anything scoring 20+.
- `maturityCredit` is optional. Without it, scoring is automatic by distance
  (exact 50, one stage out 30, two out 10).

A quick sanity check on the whole file:

```bash
node -e "global.window={};require('./mip-compass/data.js');
const {MIP_CONFIG:C,MIP_SCENARIOS:S}=global.window;const m=C.scoring.maxPerDecision;
S.forEach(s=>{const o=[];
if(s.maturityCredit&&s.maturityCredit[s.idealMaturityStage]!==m)o.push('maturity');
if((s.routeCredit||{})[s.idealRoute]!==m)o.push('route');
if((s.destinationCredit||{})[s.idealDestination]!==m)o.push('destination');
if((s.conversationOptions||[]).filter(x=>(x.points||0)>=m).length!==1)o.push('conversation');
if(o.length)console.log('✗',s.id,o.join(', '));});
console.log('checked',S.length,'scenarios');"
```

### Themed missions

Add theme tags to scenarios in the editor, then share
`mip-compass.html?theme=governance`. That mission draws only from tagged
scenarios. An unknown tag falls back to the full pool, so a stale link never
produces an empty game. The admin's *Themed missions* tab lists every tag with a
copyable link and warns when a theme has fewer scenarios than a full mission.

---

## Data and storage

There is **no database**, and the prototype does not need one. Everything runs
through `MIPStore` (`store.js`):

| Data | Where it lives now |
|---|---|
| Scenarios and framework wording | `data.js`, with per-browser overrides in `localStorage` |
| Player progress | `localStorage` — refreshing mid-mission resumes where you were |
| Analytics | `localStorage`, anonymous, capped at 2000 events |

Play is anonymous. No names, no emails, no identifiers that survive a browser reset.

### If you later want a real backend

`MIPStore` is the only module that touches storage — that is deliberate. Swapping in
Supabase means replacing the bodies of its methods and keeping the signatures:

| Method | Table |
|---|---|
| `getScenarios` / `saveScenario` / `deleteScenario` | `scenarios` — one row per scenario, JSON columns for the credit maps |
| `getConfig` / `saveConfig` | `config` — single row, JSON blob |
| `track` / `getEvents` | `events` — append-only |
| progress methods | leave local; resuming a mission is a per-device concern |

The analytics event shape already leaves room for `org`, `region`, `team` and
`eventCode` columns, so segmenting by market or by a Beyond session code is an
additive change rather than a migration. `getAnalyticsSummary()` already computes
everything the brief asked for (completion rate, average score, average duration,
per-decision averages, hardest scenarios, most-chosen weak answers) — point it at
pooled rows and the admin dashboard works unchanged.

**The admin password gate is client-side only.** The hash ships to every browser and
can be bypassed with developer tools in about ten seconds. It stops a rep wandering
in by accident; it is not access control. Nothing behind it is confidential today.
If real partner data or pooled results ever sit there, move auth server-side first.

---

## Scoring

1000 points per mission. 200 per scenario, 50 per decision.

| Decision | Full | Partial |
|---|---|---|
| Maturity stage | 50 | 30 one stage out, 10 two out — or a per-scenario override |
| Route | 50 | Per scenario. A blended answer typically earns 25–35 where a single route is stronger |
| Next play | 50 | Per territory, per scenario. Credible-but-premature typically 25–35 |
| Conversation | 50 | Per option. Sensible-but-weak 20–35, product-led-without-discovery 5, unsafe 0 |

Every partial award shows its reasoning. Feedback never says "incorrect" — the tone
bands run *Strong call · Good commercial judgement · A reasonable instinct · You have
jumped ahead a little · Worth slowing this one down*.

Titles by total: **MIP Strategist** 880+, **MIP Navigator** 740+, **Partner
Pathfinder** 600+, **Route Builder** 440+, **Commercial Explorer** below.

---

## The twelve scenarios

Twelve, so five-scenario missions vary between plays. All fictional.

| Partner | Archetype | Ideal read |
|---|---|---|
| Northstar IT | Small MSP, Copilot demand, no dev capability | Experimenting · Broker · Discover |
| Kestrel Digital | Mature MSP with developers wanting custom agents | Offering · Builder · Build |
| Aegis Secure | Security partner worried about AI governance | Exploring · Broker · Manage |
| Lumen Works | Experimenting internally, not selling anything | Experimenting · Broker · Sell |
| Brightpath Solutions | Sold AI, struggling with adoption | Offering · Broker · Implement |
| Vantage Group | Disconnected pilots, no commercial strategy | Experimenting · Blended · Discover |
| Orbit Managed Services | Selling AI without understanding the problem | Offering · Broker · Discover |
| Halden Cloud | Successful service, needs to scale delivery | Offering · Builder · Implement |
| Fenwick & Rowe | Wants to build when a marketplace solution fits | Exploring · Broker · Buy |
| Tessellate Technology | Mature partner wanting recurring services | Scaling · Blended · Manage |
| Ridgeline IT | Almost no information available | Exploring · Not enough info · Discover |
| Meridian Partners | Mature MIP optimising margin | Optimising · Blended · Manage |

Two are deliberately ambiguous and say so on the reveal. **Lumen Works** tests
whether you spot a partner further along than they realise (Discover is defensible
and scores well; Sell is stronger). **Ridgeline IT** tests whether you will decline
to recommend a route at all — *Not enough information yet* is the full-marks answer.
Answers are spread so no single choice is a reliable guess.

---

## Accessibility

- Full keyboard operation. Arrow keys move within every choice group including the
  map; Enter and Space select.
- The map is never the only way to answer — a full text list sits beneath it, and
  the two stay in sync in both directions.
- Selection is shown by a tick, a ring and a label, never by colour alone.
- Screen-reader announcements on every selection and score reveal via a polite live
  region; territories are real buttons with descriptive labels.
- `prefers-reduced-motion` honoured, plus a manual toggle in the header for people
  whose OS setting does not match what they want right now.
- No drag and drop anywhere.
- Print stylesheet, so a completed mission can be kept as a record.

---

## Recommended improvements for version two

1. **Move content to Supabase.** The single highest-value change: one shared scenario
   set, pooled analytics, and edits that reach everyone without a redeploy. `store.js`
   is already shaped for it.
2. **Real authentication for admin.** Required before anything non-fictional lives there.
3. **Confirm the maturity stage wording**, then delete the placeholder warnings from
   `data.js` and this README.
4. **A CAM-facing debrief export.** A one-page PDF or email of the player's weakest
   decision type plus the three talk tracks they scored lowest on — the artefact that
   makes this useful the day after, not just during.
5. **Manager view.** Team-level rollups behind the org/region fields the event shape
   already anticipates: which scenarios a team consistently misses tells you what to
   coach next.
6. **More scenarios, and rotate by season.** Twelve is enough for variety across two
   or three plays. Thirty makes it a habit. Real anonymised partner situations would
   beat anything invented.
7. **Scenario difficulty tiers**, so a returning player gets the harder ones rather
   than the same spread.
8. **A two-player head-to-head** for events — same five partners, scores side by side.
   Cheap to build on the current state model and the most likely thing to get reps
   playing it twice at Beyond.
9. **Localisation.** All display strings already live in `data.js`; a language map
   keyed off the same ids would be a contained change.
