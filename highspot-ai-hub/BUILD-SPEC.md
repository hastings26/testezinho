# AI Hub — Highspot build spec

A single Spot page that acts as the front door for everything AI on the EMEA sales floor.
`index.html` in this folder is the visual mockup. This file is how you actually build it.

**Design principle:** three questions, three zones. *How do I get better?* (left) · *What matters right now?* (centre) · *What do I use and what do I send?* (right). Nothing on the page exists that doesn't answer one of those.

---

## 1. Page skeleton

```
┌──────────────────────────────────────────────────────────────┐
│  SPOT BANNER — "The AI Hub" + one-line promise               │
│  (rainbow rule underneath = Pax8 signature)                  │
├───────────────┬──────────────────────────┬───────────────────┤
│  GROW         │  HERO                    │  DO               │
│  288px        │  fluid                   │  332px            │
│               │                          │                   │
│  Start Here   │  ▸ The one thing         │  Your AI toolkit  │
│  (3 steps +   │    this quarter          │  (5 links)        │
│   progress)   │  ▸ 2 CTAs                │                   │
│               │  ▸ 3 live numbers        │  Take to your     │
│  Learning     │                          │  partner (5)      │
│  paths L1-L3  │  YOUR LANE               │                   │
│               │  ┌─────┬─────┬─────┐     │  Before you paste │
│  Certify &    │  │ CAM │ CGS │ TPS │     │  (guardrails)     │
│  evidence     │  │blue │teal │purp │     │                   │
│               │  └─────┴─────┴─────┘     │  Ask a human      │
│  Practise     │                          │                   │
│  with people  │  What changed | Most     │  Give back        │
│               │  this week    | used     │                   │
└───────────────┴──────────────────────────┴───────────────────┘
│  Owner · review cadence · copyright                          │
└──────────────────────────────────────────────────────────────┘
```

On mobile Highspot stacks columns. Set the order **centre → left → right** so the hero and role lanes are never below the fold on a phone.

---

## 2. Module-by-module build

Highspot custom pages are built from stacked **rows → columns → blocks**. Create one row with a 3-column split (25 / 45 / 30), then drop blocks in.

| # | Zone | Block type in Highspot | Populated by |
|---|------|------------------------|--------------|
| 1 | Banner | Image block + Text block | Static image, 1440×220, dark blue |
| 2 | Start Here | Text block (HTML) + 3 Item links | Manual — the 3 items never change |
| 3 | Learning paths | Item List, filtered | `type = learning-path` |
| 4 | Certify | Item List, filtered | `type = certification` |
| 5 | Practise | Text block with links | Calendar + Slack deep links |
| 6 | **Hero** | Text block (HTML) + 2 Button blocks | Manual — **edited monthly, by one named person** |
| 7 | **Role lanes ×3** | 3 Text blocks side by side, OR 3 Item Lists | `role = CAM` / `CGS` / `TPS` |
| 8 | What changed | Item List, sorted by date added, limit 4 | `spot = AI Hub`, newest first |
| 9 | Most used | Item List, sorted by views (30d), limit 5 | Automatic — Highspot analytics |
| 10 | AI toolkit | Bookmarks (external URLs as Highspot items) | `type = tool` |
| 11 | Partner-facing | Item List, filtered | `audience = partner-facing` |
| 12 | Guardrails | Text block, gold left border | Links to the AUP item |
| 13 | Ask a human | Text block with links | Slack + champion directory |
| 14 | Give back | Button block → form | MS Form / Highspot request |

**Add external tools as Bookmark items, not raw hyperlinks.** A bookmark is a real Highspot item — searchable, taggable, and it shows up in analytics. A hyperlink inside a text block is invisible to reporting, so you'll never know if the toolkit rail is working.

---

## 3. The colour rule for role cards

One hue per role, used consistently everywhere on the page — card top border, chip, link hover, and the pill on the feed. That consistency is what makes the page scannable: after a week, people stop reading the labels and just look for their colour.

| Role | Hex | Card top border | Card wash | Chip text |
|------|-----|-----------------|-----------|-----------|
| **CAM** — Channel Account Manager | `#1D4ED8` Pax8 Blue | 3px solid | `rgba(29,78,216,0.18)` | White |
| **CGS** — Cloud Growth Specialist | `#00D09C` Pax8 Teal | 3px solid | `rgba(0,208,156,0.15)` | Near-black |
| **TPS** — Technical Partner Specialist | `#8B5CF6` Purple | 3px solid | `rgba(139,92,246,0.16)` | Near-black |

All three are already in the Pax8 palette, so nothing here needs brand sign-off.

Card background stays the same dark panel (`#0E1338`) across all three — only the **top border, the wash gradient and the chip** carry the hue. Three fully coloured card backgrounds side by side fight each other and the page stops looking like Pax8.

> **Check before you build:** confirm CGS and TPS expand the way this spec assumes. If TPS is a different role in EMEA, the only things to change are the chip label and the four link titles — the colour and structure hold either way.

---

## 4. Tag taxonomy (do this first)

The page is only low-maintenance if the lists are dynamic. Set these custom properties on the Spot **before** you add any content:

| Property | Values |
|----------|--------|
| `role` | `CAM`, `CGS`, `TPS`, `All` |
| `type` | `learning-path`, `certification`, `tool`, `playbook`, `talk-track`, `policy`, `template` |
| `audience` | `internal`, `partner-facing` |
| `stage` | `awareness`, `discovery`, `proposal`, `delivery` |
| `level` | `L1-curious`, `L2-capable`, `L3-confident` |

Every item gets `role` and `type` as mandatory. Everything else is optional. Five properties is the ceiling — beyond that nobody tags consistently and the lists rot.

---

## 5. Content inventory — the minimum viable hub

Don't launch with 60 items. Launch with these 24 and let usage tell you what's missing.

**Grow (left) — 11 items**
- AI at Pax8 in 12 minutes (video)
- Acceptable Use Policy v2 (PDF, mandatory read)
- Your first five prompts, per role (3 items — one per lane)
- Learning path L1 / L2 / L3 (3 items)
- Microsoft AI Skills track (bookmark)
- MIP Certification (bookmark to Pax8 Academy)
- Growth-plan 1:1 template (doc)

**Centre (hero + lanes) — 12 items**
- MIP Playbook (the hero CTA)
- AI Opportunity Assessment (the second hero CTA)
- 4 items per lane × 3 lanes

**Do (right) — 5 items + 4 bookmarks**
- Co-brandable AI deck, discovery question bank, ROI calculator, security answer bank, partner success stories
- Copilot / Cowork / Highspot AI / Gong (bookmarks)

That's ~24 real items. Everything else is a link to something that already exists elsewhere.

---

## 6. Governance — the part that decides whether this survives

The hero is the whole point of the page, and it is also the thing most likely to go stale and quietly kill trust in the hub.

- **One named owner** for the hero block. Not "Enablement" — a person.
- **Hero refresh: monthly.** Diarised, not aspirational. If the number in the hero is from last quarter, the floor stops believing the page.
- **"What changed this week" is the trust signal.** Four items, dated, every week. An empty feed reads as an abandoned page.
- **Review date on every item.** Highspot will flag stale content — use it. Anything unreviewed for 90 days gets pulled, not left up.
- **Retire loudly.** When the ROI calculator is superseded, delete the old one. Two versions in a Spot is worse than none.

---

## 7. What "working" looks like

Set the baseline in week 1 so you can prove the thing later:

| Measure | Where | Target |
|---------|-------|--------|
| Unique floor visitors / week | Spot analytics | > 60% of the floor |
| Start Here completion | Item views on the 3 items | > 80% in 6 weeks |
| Partner-facing items *shared externally* | Highspot pitch/share analytics | The real number — everything else is vanity |
| Assessments booked | CRM, tagged to hub | The hero number |
| Submissions to "Give back" | Form responses | > 5/month = the floor has adopted it |

The third row is the one to report upwards. Views mean people looked; **shares mean it reached a partner.**

---

## 8. If your Highspot tenant restricts custom HTML

Some tenants sanitise HTML in text blocks. Fallbacks that keep the design intact:

- **Role card colours** → build the three lane headers as three small pre-made images (PNG, 400×90) with the coloured top border baked in, then a plain Item List underneath each.
- **Hero** → a single 1200×420 banner image with the headline set in it, plus two real Button blocks beneath (so the CTAs stay clickable and tracked).
- **Rainbow rule** → a 1440×3 PNG.

Keep every link as a real Highspot item or button. Only the decoration becomes an image — never the navigation, or you lose the analytics and break screen readers.

---

## 9. Build order

1. Create the Spot, set the five custom properties.
2. Load the 24 items, tag them properly. *(Longest step — do it before touching layout.)*
3. Build the 3-column page skeleton, empty.
4. Wire the dynamic Item Lists to the tags. Confirm they populate.
5. Write the hero last, once you know what the quarter's one number actually is.
6. Soft-launch to one country team for a week. Fix what they trip over.
7. Launch on the floor with a 10-minute walkthrough — not an email.

Step 7 matters more than steps 1–6. A hub nobody was walked through is a hub nobody uses.
