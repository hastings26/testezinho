/* =============================================================================
   BEYOND 2026 COMMAND CENTER — CONTENT
   -----------------------------------------------------------------------------
   This file is the single source of truth for the hub. Everything on the site
   is rendered from the data below — nothing is hard-coded in the markup. To add
   or change content you only edit this file.

   BLOCK TYPES available inside a page's `blocks` array:
     {t:'lead',   text}                         large intro paragraph
     {t:'p',      text}                         paragraph (**bold** supported)
     {t:'h',      text}                         subhead
     {t:'list',   items:['…']}                  bullet list
     {t:'numbered', items:[{title,text}]}       numbered cards (blue → teal)
     {t:'cards',  items:[{title,text}]}         plain cards
     {t:'steps',  items:[{title,text}]}         ordered walkthrough
     {t:'assets', items:[{label,type,href,status,owner,note}]}   link registry
     {t:'faq',    items:[{q,a}]}
     {t:'callout',tone:'info'|'warn'|'good', title, text}
     {t:'table',  head:['…'], rows:[['…']]}
     {t:'stat',   items:[{value,label,note}]}
     {t:'timeline',items:[{when,title,text}]}

   ASSET STATUS values — these drive the content-gap reporting on /#/governance:
     'live'   the asset exists and the link works
     'draft'  the asset exists but is not signed off for partner/rep use
     'needed' the asset does not exist yet, or the URL has not been supplied

   RULE: never paste a duplicate copy of a document into this hub. Register the
   link once, here, and point every section at the same entry. That is the whole
   point of a single source of truth.
   ========================================================================== */

const OWNERS = {
  enablement: { team: 'Revenue Enablement — EMEA', name: 'TBC', contact: 'TBC' },
  pmm:        { team: 'Product Marketing',          name: 'TBC', contact: 'TBC' },
  salesops:   { team: 'Sales Ops / Salesforce',     name: 'TBC', contact: 'TBC' },
  aigtm:      { team: 'AI Adoption / GTM',          name: 'TBC', contact: 'mip@pax8.com' },
  events:     { team: 'Events / Field Marketing',   name: 'TBC', contact: 'TBC' },
  salesldr:   { team: 'Sales Leadership — EMEA',    name: 'TBC', contact: 'TBC' },
  commercial: { team: 'Pricing & Commercial',       name: 'TBC', contact: 'TBC' },
};

const SITE = {
  name: 'Beyond 2026',
  tagline: 'Command Center',
  strapline: 'One place for everything Beyond. No duplicate copies, no hunting across SharePoint.',
  updated: '2026-08-27',

  /* Principles are shown on the home page and enforced on /#/governance. */
  principles: [
    { title: 'One source of truth',
      text: 'Every Beyond asset is registered once here. Sections link to the same entry rather than holding their own copy, so nothing drifts out of date in a second location.' },
    { title: 'Organised by topic, not by role',
      text: 'Navigation follows subject matter so content stays findable when responsibilities change, and so every team can reach the same resources without a role gate.' },
    { title: 'Every page has an owner',
      text: 'Each section names an owning team, a named owner and a review cadence. Anything past its review date is flagged automatically on the Governance page.' },
    { title: 'Gaps are visible, not hidden',
      text: 'Assets that do not exist yet are listed as "Needed" rather than quietly omitted. The hub doubles as the backlog for what still has to be built.' },
  ],
};

SITE.sections = [

/* ========================================================================== */
{
  id: 'start', title: 'Getting Started', icon: 'flag',
  kicker: 'Onboarding',
  blurb: 'What this hub is, how it is organised, and the fastest route to the thing you actually need.',
  owner: OWNERS.enablement, reviewed: '2026-08-27', cadence: 'Quarterly',
  pages: [
    { id: 'what-this-is', title: 'What this hub is', summary: 'The single place Beyond information lives.',
      blocks: [
        { t:'lead', text:'The Beyond 2026 Command Center replaces the scattered SharePoint locations, duplicated decks and one-off Teams links that Beyond content has lived in until now. If it relates to Beyond — the event, the announcements, the follow-up, the training — it is either here or it is linked from here.' },
        { t:'h', text:'The four rules this hub runs on' },
        { t:'numbered', items:[
          { title:'One source of truth', text:'Assets are registered once. Sections link to the same registered entry instead of keeping their own copy. If you find a second copy of something in the wild, raise it so it can be retired.' },
          { title:'Topic, not role', text:'Navigation is organised by subject. Your job title does not decide what you can see — content stays useful when your responsibilities change, and multiple teams reach the same resources.' },
          { title:'Named ownership', text:'Every section shows its owning team, named owner and review cadence in the header. Nothing is anonymous.' },
          { title:'Visible gaps', text:'Assets that do not exist yet are listed as "Needed" rather than left out. The Governance page turns those into a live backlog.' },
        ]},
        { t:'callout', tone:'info', title:'Can’t find something?',
          text:'Press <kbd>/</kbd> anywhere on the site to search every page and every registered asset at once. If it genuinely is not here, log it on the Ask a question page and it becomes a tracked gap rather than a lost email.' },
      ]},

    { id: 'start-here', title: 'New to Beyond — start here', summary: 'The 30-minute route in.',
      blocks: [
        { t:'lead', text:'If you have just picked up Beyond — new starter, new to the region, or newly assigned to follow-up — this is the shortest path to being useful in conversations.' },
        { t:'steps', items:[
          { title:'Read the Beyond story (10 min)', text:'The Run It → Transform It → Scale It narrative is the spine of everything announced. Start at Beyond Story › Key messaging.' },
          { title:'Skim what was announced (5 min)', text:'Event Overview › What was announced gives you the four themes — AI &amp; MIP, Managed Intelligence Services, Agent Store, and the Marketplace changes — in one screen.' },
          { title:'Learn what a recommendation is (5 min)', text:'Recommendations are the commercial output of the event. Recommendations › What recommendations are explains where they come from and why they are not just leads.' },
          { title:'Open your dashboards (5 min)', text:'Salesforce &amp; Beyond Hub › Dashboard overview shows you the five dashboards and which one answers which question.' },
          { title:'Book your readiness session (5 min)', text:'Training &amp; Readiness › Post-event learning lists the live and on-demand sessions currently running.' },
        ]},
        { t:'callout', tone:'good', title:'Then what?',
          text:'Come back for the objection handling and partner conversation starters before your first partner call — they are the two assets reps reach for most.' },
      ]},

    { id: 'paths', title: 'Common routes through the hub', summary: 'Shortcuts by task, not by job title.',
      blocks: [
        { t:'p', text:'These are shortcuts, not permissions. Every route below is open to everyone — pick the one that matches the task in front of you.' },
        { t:'cards', items:[
          { title:'I have a partner call tomorrow', text:'Beyond Story › Partner conversation starters → Objection handling → the relevant topic page (AI &amp; MIP, Agent Store or Managed Intelligence Services).' },
          { title:'I have recommendations sitting in my queue', text:'Recommendations › How to action them → Salesforce walkthrough → Example workflows.' },
          { title:'I need to report on Beyond performance', text:'Salesforce &amp; Beyond Hub › Dashboard overview → Reporting guidance. Leadership views sit under Sales Resources › Sales leadership resources.' },
          { title:'I am running a session for my team', text:'Training &amp; Readiness › Facilitator assets → Readiness decks &amp; recorded sessions.' },
          { title:'I need a price or a commercial answer', text:'Sales Resources › Pricing &amp; commercials. Anything not answered there is an escalation, not a guess.' },
          { title:'I need to add or fix content', text:'Getting Started › Contributing content, then talk to the section owner named in the page header.' },
        ]},
      ]},

    { id: 'contributing', title: 'Contributing content', summary: 'How to add, change or retire something.',
      blocks: [
        { t:'lead', text:'The hub only stays a source of truth if changes go through one door. That door is the section owner named at the top of every page.' },
        { t:'steps', items:[
          { title:'Check it does not already exist', text:'Search first. Most "new" assets turn out to be a second copy of something already registered — which is exactly what this hub exists to stop.' },
          { title:'Take it to the section owner', text:'Every section header names an owning team and a named owner. They decide whether it belongs, and where.' },
          { title:'Register the link, do not upload a copy', text:'Assets stay in their home system — Highspot, SharePoint, the LMS, Salesforce. The hub registers the link. One canonical location per asset.' },
          { title:'Give it a status', text:'Live, Draft or Needed. "Needed" is a legitimate entry — registering a gap is more useful than an empty section.' },
          { title:'Set the review date', text:'Nothing enters the hub without a review cadence. Content past its review date is flagged on the Governance page.' },
        ]},
        { t:'callout', tone:'warn', title:'Retiring duplicates',
          text:'When a duplicate is found in SharePoint or Teams, the fix is to delete or redirect the duplicate — not to add a note saying which copy is current. Two copies with a note is still two copies.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'overview', title: 'Event Overview', icon: 'calendar',
  kicker: 'The event',
  blurb: 'What Beyond 2026 was, what was announced, who was in the room, and what happens next.',
  owner: OWNERS.events, reviewed: '2026-08-27', cadence: 'Quarterly',
  pages: [
    { id: 'at-a-glance', title: 'Beyond 2026 at a glance', summary: 'The event in one screen.',
      blocks: [
        { t:'lead', text:'Pax8 Beyond 2026 is the annual partner event and the launch moment for the year’s AI strategy. For EMEA it is the point at which the MIP narrative moved from a curated pilot audience to the wider partner community.' },
        { t:'callout', tone:'warn', title:'Figures to confirm before external use',
          text:'Attendance, session and pipeline numbers on this page are placeholders until Events and Sales Ops sign off the final post-event dataset. Do not put them in partner-facing material until the Governance page shows this section reviewed.' },
        { t:'stat', items:[
          { value:'TBC', label:'Partner attendees', note:'Events to confirm' },
          { value:'TBC', label:'Recommendations generated', note:'Sales Ops to confirm' },
          { value:'4', label:'Core announcement themes', note:'AI &amp; MIP · Managed Intelligence Services · Agent Store · Marketplace' },
        ]},
        { t:'h', text:'Why the event matters commercially' },
        { t:'p', text:'Beyond produces three things a rep can act on: a **narrative** partners have already heard, **engagement data** showing what each attendee actually cared about, and **recommendations** — system-generated follow-up actions tied to that engagement. The rest of this hub exists to turn those three into pipeline.' },
      ]},

    { id: 'announcements', title: 'What was announced', summary: 'The four themes, in plain language.',
      blocks: [
        { t:'p', text:'Everything announced at Beyond 2026 maps to one of four themes. Each has a full section in this hub.' },
        { t:'numbered', items:[
          { title:'AI &amp; MIP', text:'The Managed Intelligence Provider model — the evolution of the MSP from managing devices and licences to orchestrating AI agents and delivering intelligence-driven outcomes. The strategic case behind it is the Agentic Inflection Point.' },
          { title:'Managed Intelligence Services', text:'The service layer partners wrap around agents — the recurring, managed, governed offering that turns an agent deployment into a monthly contract rather than a project.' },
          { title:'Agent Store', text:'The Pax8 Marketplace destination for AI agents — discovery, procurement and lifecycle management of agents in the same place partners already buy.' },
          { title:'Marketplace &amp; platform changes', text:'The supporting platform work — including the conversational solution builder and the Beyond Hub reporting surface in Salesforce.' },
        ]},
        { t:'assets', items:[
          { label:'Beyond 2026 announcement summary (one-pager)', type:'One-pager', href:null, status:'needed', owner:'Product Marketing', note:'Single-page recap for rep use — to be produced.' },
          { label:'Keynote recap deck', type:'Deck', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Press and partner comms pack', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
        ]},
      ]},

    { id: 'audience', title: 'Who attended', summary: 'Attendee mix and what it means for follow-up.',
      blocks: [
        { t:'p', text:'Attendance data is the input to every recommendation and every dashboard in this hub. It lives in Salesforce, not here — see **Salesforce &amp; Beyond Hub › Attendance Insights** for the live view.' },
        { t:'list', items:[
          'Which partner organisations attended, and how many people each sent',
          'Which sessions each attendee joined — the strongest signal of what they care about',
          'Which partners registered but did not attend — a distinct and often overlooked follow-up motion',
          'Which attendees are already in an open opportunity, and which are net new to the pipeline',
        ]},
        { t:'callout', tone:'info', title:'The no-show list is a work queue',
          text:'Registered non-attendees opted in to the topic. Treat them as a warm follow-up motion with the on-demand recordings, not as a failed registration.' },
      ]},

    { id: 'agenda-recaps', title: 'Agenda & session recaps', summary: 'What ran, and where the recordings live.',
      blocks: [
        { t:'p', text:'Session recordings are registered once here and linked from every topic section — they are not re-uploaded per team.' },
        { t:'assets', items:[
          { label:'Full Beyond 2026 agenda', type:'Page', href:null, status:'needed', owner:'Events' },
          { label:'Main stage keynote recording', type:'Video', href:null, status:'needed', owner:'Events' },
          { label:'AI &amp; MIP breakout recording', type:'Video', href:null, status:'needed', owner:'Events' },
          { label:'Agent Store breakout recording', type:'Video', href:null, status:'needed', owner:'Events' },
          { label:'Managed Intelligence Services breakout recording', type:'Video', href:null, status:'needed', owner:'Events' },
          { label:'Session-by-session written recaps', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
        ]},
      ]},

    { id: 'timeline', title: 'Post-event timeline', summary: 'What happens when.',
      blocks: [
        { t:'timeline', items:[
          { when:'April 2026', title:'MIP pilot soft-launch', text:'The MIP Program pilot opened to a curated partner group, with escalations routed through mip@pax8.com.' },
          { when:'June 2026', title:'Beyond 2026', text:'MIP extended to Beyond participants. The four announcement themes go public to the partner community.' },
          { when:'July 2026', title:'Full rollout', text:'MIP opens to the wider Pax8 partner community alongside Agent Store general availability.' },
          { when:'Aug–Sep 2026', title:'Follow-up window', text:'Recommendations and engagement data are live in Salesforce. This is the period where Beyond either converts or goes cold.' },
          { when:'Ongoing', title:'Readiness cycle', text:'Post-event learning, marketplace training and recommendation walkthroughs run continuously — see Training &amp; Readiness.' },
        ]},
        { t:'callout', tone:'warn', title:'Dates to verify',
          text:'The rollout dates above reflect the plan as last briefed. Confirm current status with the AI Adoption / GTM owner before quoting them to a partner.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'story', title: 'Beyond Story', icon: 'story',
  kicker: 'Messaging',
  blurb: 'The narrative sales teams were trained on: key messaging, announcement summaries, keynote recordings and partner conversation starters.',
  owner: OWNERS.pmm, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'key-messaging', title: 'Key messaging', summary: 'Run It → Transform It → Scale It.',
      blocks: [
        { t:'lead', text:'Run It → Transform It → Scale It is the spine of the Beyond story. It gives a partner a place to stand today, a direction of travel, and a commercial reason to move — in that order.' },
        { t:'numbered', items:[
          { title:'Run It', text:'The business the partner has today — managed services, licences, devices, support. This is not the part you attack. It is the credibility and the cash flow that funds everything after it. Acknowledge it first, or the rest of the conversation sounds like a threat.' },
          { title:'Transform It', text:'Layering intelligence onto what they already run. Agents inside existing workflows, governed properly, sold as an outcome rather than a tool. This is the Managed Intelligence Provider move — the same clients, a different unit of value.' },
          { title:'Scale It', text:'Repeating the transformation across the client base. Packaged offerings, standard agent deployments, and Managed Intelligence Services as recurring revenue rather than project work.' },
        ]},
        { t:'h', text:'The three value drivers underneath it' },
        { t:'cards', items:[
          { title:'Grow your business', text:'Move from reselling tools to delivering outcomes. The unit of sale changes from a licence to a business result, which is priced differently.' },
          { title:'Increase efficiency', text:'Agents take on a large share of repeatable workflow, freeing partner headcount from ticket volume onto higher-value work.' },
          { title:'Reduce risk', text:'A governance framework around agent deployment keeps the partner in the trusted-advisor seat rather than being routed around by a client buying AI direct.' },
        ]},
        { t:'callout', tone:'warn', title:'One known inconsistency to be aware of',
          text:'The number of MIP plays differs across source documents — the Playbook, the pilot battlecard and the AIP report do not agree. Do not present a play count as definitive until this is reconciled. See AI &amp; MIP › MIP FAQs.' },
      ]},

    { id: 'announcement-summaries', title: 'Announcement summaries', summary: 'Short-form recaps you can paste.',
      blocks: [
        { t:'p', text:'Short, reusable summaries for email, chat and call prep. Use these verbatim rather than writing your own — consistency across reps is the point.' },
        { t:'h', text:'AI &amp; MIP — 30 seconds' },
        { t:'p', text:'The Managed Intelligence Provider is the next step on from the MSP. Rather than managing devices and licences, an MIP orchestrates AI agents and sells the business outcome those agents produce. Beyond 2026 was where that model went from a pilot with a small group of partners to something the whole community can access.' },
        { t:'h', text:'Managed Intelligence Services — 30 seconds' },
        { t:'p', text:'Deploying an agent is a project. Managing it — monitoring, governing, tuning, reporting on it — is a service. Managed Intelligence Services is the wrapper that turns the first into the second, which is what makes it recurring revenue instead of one-off work.' },
        { t:'h', text:'Agent Store — 30 seconds' },
        { t:'p', text:'Agent Store brings AI agents into the Pax8 Marketplace, so partners discover, buy and manage agents in the same place they already buy everything else — with the same billing, the same procurement and the same commercial relationship.' },
        { t:'assets', items:[
          { label:'Approved messaging one-pager', type:'One-pager', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Email templates for post-event follow-up', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
      ]},

    { id: 'keynote-recordings', title: 'Keynote recordings', summary: 'Watch it, or send it.',
      blocks: [
        { t:'p', text:'Recordings are registered here once. Every other section links back to this page rather than holding its own copy of the link.' },
        { t:'assets', items:[
          { label:'Main stage keynote — full recording', type:'Video', href:null, status:'needed', owner:'Events' },
          { label:'Keynote — partner-shareable cut', type:'Video', href:null, status:'needed', owner:'Product Marketing', note:'Shortened version cleared for sending to partners.' },
          { label:'Keynote highlight clips (by theme)', type:'Video', href:null, status:'needed', owner:'Product Marketing', note:'Useful for follow-up email — send the two minutes that match what they attended.' },
        ]},
        { t:'callout', tone:'info', title:'Sending a recording is a follow-up motion',
          text:'Pair a clip with the engagement data from Salesforce: send the segment covering the session they actually attended, not the full keynote.' },
      ]},

    { id: 'conversation-starters', title: 'Partner conversation starters', summary: 'Openers that do not sound like a product pitch.',
      blocks: [
        { t:'p', text:'Each opener is designed to surface the partner’s own position before introducing anything Pax8 sells.' },
        { t:'cards', items:[
          { title:'For a partner who attended', text:'"You sat in the [session] session at Beyond — what landed, and what did you come away sceptical about?" Scepticism is more useful than enthusiasm; it tells you what to address.' },
          { title:'For a partner who registered but did not attend', text:'"You signed up for Beyond and then got pulled elsewhere — happens to everyone. Here is the fifteen minutes that mattered for your business." Attach the relevant clip.' },
          { title:'For a partner already experimenting with AI', text:'"Where has AI actually landed in your business so far — and where did it stall?" Most partners have a stalled pilot. That is the opening for the governance and service conversation.' },
          { title:'For a partner not interested in AI', text:'"Forget agents for a second — what is happening to your margin on managed services over the next two years?" Start on the commercial pressure, not the technology.' },
          { title:'For a partner worried about being disintermediated', text:'"If your client buys AI without you, who governs it?" This is the risk-reduction driver, and it is usually the most persuasive of the three.' },
        ]},
      ]},

    { id: 'objection-handling', title: 'Objection handling', summary: 'The five you will actually hear.',
      blocks: [
        { t:'faq', items:[
          { q:'"This is just rebranding what we already do."',
            a:'Partly — and that is deliberate. The delivery muscle is the same. What changes is the unit of value: you are pricing an outcome rather than a seat count, which is a different margin profile. The question is not whether you can deliver it, it is whether you are charging for it.' },
          { q:'"Our clients are not asking for AI."',
            a:'Most are already experimenting, usually without telling their provider. The risk is not that they never buy — it is that they buy without you, and you find out afterwards. Governance is easier to sell before that happens than after.' },
          { q:'"We do not have the skills in-house."',
            a:'That is what the readiness programme and the Agent Store exist to close. Partners are not being asked to build agents from scratch — they are being asked to select, deploy, govern and manage them, which is much closer to what they already do.' },
          { q:'"What is this going to cost me?"',
            a:'Route this to Sales Resources › Pricing &amp; commercials rather than answering from memory. If the answer is not documented there, it is an escalation — an invented number is worse than a short delay.' },
          { q:'"Show me a partner who has actually done this."',
            a:'Use the produced EMEA case study — registered under AI &amp; MIP › Partner use cases. Be straight that the proof-point library is still small and growing; partners respect that more than an inflated claim.' },
        ]},
        { t:'callout', tone:'warn', title:'Do not oversell readiness',
          text:'There is a real gap between the narrative and what is fully shipped. Reps who acknowledge that keep credibility; reps who paper over it lose the partner at the second meeting.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'ai-mip', title: 'AI & MIP', icon: 'spark',
  kicker: 'Theme 1',
  blurb: 'The Managed Intelligence Provider model, the strategic case behind it, and how to work with AI yourself.',
  owner: OWNERS.aigtm, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'what-it-is', title: 'What it is', summary: 'MIP, defined without the jargon.',
      blocks: [
        { t:'lead', text:'MIP stands for Managed Intelligence Provider — the next evolution of the Managed Service Provider. Instead of managing devices and licences, an MIP orchestrates AI agents and delivers intelligence-driven business outcomes for SMB clients.' },
        { t:'h', text:'The strategic foundation: the Agentic Inflection Point' },
        { t:'p', text:'The Agentic Inflection Point (AIP) is the thesis underneath MIP: AI agents are moving from passive copilots that suggest things, to autonomous systems that execute and scale outcomes. That shift is what makes a new provider category necessary rather than just a new product line.' },
        { t:'h', text:'What actually changes for a partner' },
        { t:'table', head:['', 'MSP today', 'MIP'], rows:[
          ['Unit of sale', 'Seats, devices, licences', 'Business outcomes'],
          ['What is managed', 'Infrastructure and endpoints', 'Agents and the workflows they run'],
          ['Revenue shape', 'Per-seat recurring plus projects', 'Outcome-based recurring plus managed services'],
          ['Client conversation', 'Uptime, tickets, renewals', 'Process, capacity, business results'],
          ['Primary risk', 'Margin compression', 'Being routed around on AI decisions'],
        ]},
        { t:'callout', tone:'info', title:'Related terms you will hear',
          text:'<strong>AIP</strong> — the Agentic Inflection Point, the strategic report and thesis. <strong>Agent Store</strong> — the Marketplace destination for agents. <strong>Managed Intelligence Services</strong> — the recurring service layer a partner wraps around agents.' },
      ]},

    { id: 'why-it-matters', title: 'Why it matters', summary: 'The commercial case, and the deadline.',
      blocks: [
        { t:'lead', text:'MIP is not a technology argument. It is a margin argument with a date on it.' },
        { t:'stat', items:[
          { value:'30–50%', label:'Projected managed-services margin decline by 2027', note:'For providers who do not evolve' },
          { value:'75%', label:'Of SMBs already experimenting with AI', note:'Often without telling their provider' },
        ]},
        { t:'h', text:'The three value drivers' },
        { t:'numbered', items:[
          { title:'Grow your business', text:'Move from tool resale to outcome delivery. Outcomes carry a different price ceiling than licences, because the client is comparing them to headcount rather than to another vendor’s SKU.' },
          { title:'Increase efficiencies', text:'Agents absorb a large proportion of repeatable workflow, which changes the partner’s own cost base as well as the client’s.' },
          { title:'Reduce risk', text:'A governance framework around agent deployment is what keeps the partner as the trusted advisor when the client starts buying AI on their own.' },
        ]},
        { t:'h', text:'Why the timing argument matters more than the technology argument' },
        { t:'p', text:'The market splits during this window: providers that stay on the traditional model end up competing on price, while those that move capture disproportionate value. The narrative is genuinely inspiring — but inspiration without a deadline produces interest, not behaviour change. **Lead with the 2027 margin pressure, not with the agent demo.**' },
        { t:'callout', tone:'info', title:'This pattern has precedent',
          text:'Salesforce ("No Software"), Microsoft ("Digital Transformation"), AWS ("Cloud for SMBs") and HubSpot ("Inbound Marketing") all ran a narrative ahead of the product and won the category. The pattern is always: name the shift → educate the ecosystem → multiply proof points → scale. Pax8 is in the education phase.' },
      ]},

    { id: 'use-cases', title: 'Partner use cases', summary: 'Proof points — and an honest count of them.',
      blocks: [
        { t:'callout', tone:'warn', title:'The proof-point library is thin, and that is known',
          text:'There is currently one fully produced EMEA proof-of-concept case study. Building more is an active priority. Reps should use the one that exists and be straight about the rest — a partner who catches you inflating the evidence will discount everything else you said.' },
        { t:'assets', items:[
          { label:'EMEA MSP-to-MIP transition case study', type:'Doc', href:null, status:'needed', owner:'Product Marketing', note:'The single produced EMEA proof point. URL to be supplied.' },
          { label:'Additional EMEA proof points', type:'Doc', href:null, status:'needed', owner:'Product Marketing', note:'Actively needed — raise candidate partners with the AI Adoption / GTM owner.' },
          { label:'Use-case library by vertical', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
        ]},
        { t:'h', text:'The shapes that recur' },
        { t:'cards', items:[
          { title:'Service-desk deflection', text:'Agents handling first-line triage and routine requests, with the partner governing escalation thresholds and reporting on deflection rate as the outcome sold.' },
          { title:'Back-office process automation', text:'Finance, onboarding and reporting workflows inside the client’s existing systems — usually the easiest first sale because the pain is quantified in hours.' },
          { title:'Client-facing intelligence', text:'Agents surfacing insight to the client’s own customers or staff, sold as a capability the client could not build alone.' },
        ]},
      ]},

    { id: 'working-with-ai', title: 'Working with AI', summary: 'Using AI in your own role, safely.',
      blocks: [
        { t:'lead', text:'Separate from what we sell partners: how Pax8 people use AI in their own work. This section exists because reps who use AI daily sell the MIP story far more convincingly than reps who have only read about it.' },
        { t:'list', items:[
          'Approved tools and where they are licensed',
          'What may and may not be put into a prompt — partner data, commercial terms, personal data',
          'Prompt patterns that work for call prep, follow-up drafting and account research',
          'Where AI output must be checked before it reaches a partner',
        ]},
        { t:'assets', items:[
          { label:'EMEA AI usage framework', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement', note:'Governs internal AI use — required reading before using AI on partner-facing work.' },
          { label:'Approved internal AI tooling list', type:'Page', href:null, status:'needed', owner:'Revenue Enablement' },
          { label:'Prompt library for revenue teams', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
        { t:'callout', tone:'warn', title:'The one hard rule',
          text:'Never paste partner-identifiable or commercially sensitive information into a tool that is not on the approved list. If you are unsure whether a tool is approved, it is not.' },
      ]},

    { id: 'assets', title: 'Training assets & one-pagers', summary: 'Everything MIP, registered once.',
      blocks: [
        { t:'p', text:'These are the canonical MIP documents. Where a document exists in more than one place today, the entry below is the copy that should survive.' },
        { t:'assets', items:[
          { label:'Agentic Inflection Point (AIP) report', type:'Doc', href:null, status:'needed', owner:'Product Marketing', note:'The strategic "why". Long-form — read it once, quote from the talk track after that.' },
          { label:'MIP Playbook v2', type:'Doc', href:null, status:'needed', owner:'Product Marketing', note:'The "how". Note the play-count inconsistency — see MIP FAQs.' },
          { label:'MIP Program pilot battlecard', type:'One-pager', href:null, status:'needed', owner:'Product Marketing', note:'What reps are actively using in conversation.' },
          { label:'AIP talk track & FAQ', type:'Doc', href:null, status:'needed', owner:'Product Marketing', note:'The short script. Highest-value asset for a rep with a call in an hour.' },
          { label:'MIP Playbook talk track & FAQ', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
          { label:'MIP Blueprint', type:'Doc', href:null, status:'needed', owner:'Product Marketing', note:'Draft status — confirm before partner use.' },
          { label:'MIP readiness course (LMS)', type:'Course', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
      ]},

    { id: 'faqs', title: 'MIP FAQs', summary: 'Including the things that are not resolved yet.',
      blocks: [
        { t:'faq', items:[
          { q:'How many MIP plays are there — five or six?',
            a:'This is genuinely unresolved. The Playbook, the pilot battlecard and the AIP report each present a different set, and one uses "Transform" where another uses "Discover". Until it is reconciled, do not present a play count as definitive in partner-facing material. Use the value drivers and the Run It → Transform It → Scale It narrative instead, which are consistent everywhere.' },
          { q:'Is MIP a product I can quote?',
            a:'No. MIP is a partner business model and a programme, not a SKU. What gets quoted are the underlying products and services — see Sales Resources › Pricing &amp; commercials.' },
          { q:'What is Project Asteroid?',
            a:'The internal codename for the cross-functional AI strategy — it covers Agent Store, the MIP programme, partner enablement and monetisation. Treat it as internal-only language; it should not appear in partner-facing material.' },
          { q:'Who owns MIP escalations?',
            a:'Route programme and partner escalations to mip@pax8.com. Enablement and content questions go to the section owner named at the top of this page.' },
          { q:'A partner is not ready for the pilot. What do I do with them?',
            a:'There is no formal pre-MIP nurture track yet — this is a known gap. In the interim, use the readiness content and the keynote clips to keep them warm, and register the partner with the AI Adoption / GTM owner so they are captured when the track exists.' },
          { q:'Is the MIP training completion tracking working in the LMS?',
            a:'Flagged as an open issue. If your completion is not showing, report it to the Revenue Enablement owner rather than re-taking the course.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'mis', title: 'Managed Intelligence Services', icon: 'gear',
  kicker: 'Theme 2',
  blurb: 'The recurring service layer partners wrap around agents — what it is, why it is the margin story, and how to sell it.',
  owner: OWNERS.pmm, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'what-it-is', title: 'What it is', summary: 'The difference between deploying an agent and managing one.',
      blocks: [
        { t:'lead', text:'Managed Intelligence Services is the managed, governed, recurring layer a partner puts around AI agents. Deploying an agent is a project with an end date. Managing one is a service with a monthly invoice.' },
        { t:'h', text:'What sits inside the service' },
        { t:'cards', items:[
          { title:'Monitoring', text:'Is the agent running, and is it still doing what it was deployed to do? Agent drift is real and clients cannot detect it themselves.' },
          { title:'Governance', text:'Access, permissions, data boundaries, audit trail and human-escalation thresholds. This is the part clients most underestimate and most need.' },
          { title:'Tuning', text:'Ongoing adjustment as the client’s process changes. An agent configured for last year’s workflow quietly becomes a liability.' },
          { title:'Reporting', text:'Evidence of the outcome the client bought. Without this the service looks like a line item at renewal rather than a result.' },
        ]},
      ]},

    { id: 'why-it-matters', title: 'Why it matters', summary: 'This is where the recurring revenue actually is.',
      blocks: [
        { t:'p', text:'Agent deployment on its own is one-off project revenue, and it commoditises quickly — the second and third deployment are cheaper than the first, and the client eventually asks why. The service wrapper is what converts that into an annuity.' },
        { t:'numbered', items:[
          { title:'It is recurring by construction', text:'Monitoring, governance and reporting are continuous obligations. They do not have a natural end date, which is exactly what makes them contractable monthly.' },
          { title:'It defends the client relationship', text:'A partner who governs the client’s agents is structurally hard to remove. A partner who only deployed them is a completed project.' },
          { title:'It scales without linear headcount', text:'The same governance model applies across many clients, which is what makes the Scale It stage of the narrative real rather than aspirational.' },
        ]},
      ]},

    { id: 'use-cases', title: 'Partner use cases', summary: 'What a packaged service actually looks like.',
      blocks: [
        { t:'cards', items:[
          { title:'Tiered agent management', text:'Bronze/silver/gold style tiers by number of agents managed, response commitment and reporting depth — the model most partners already understand from managed services.' },
          { title:'Governance-only entry offer', text:'A low-friction first sale for clients who bought AI themselves and now have no oversight. Often the fastest way into an AI conversation with a sceptical client.' },
          { title:'Outcome-priced service', text:'Priced against the measured result — hours saved, tickets deflected, cycle time reduced. Higher ceiling, but requires the reporting layer to be genuinely solid first.' },
        ]},
        { t:'assets', items:[
          { label:'Managed Intelligence Services service-design guide', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Example service tier structures', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
        ]},
      ]},

    { id: 'assets', title: 'Assets & training', summary: 'Registered materials.',
      blocks: [
        { t:'assets', items:[
          { label:'Managed Intelligence Services one-pager', type:'One-pager', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Beyond breakout recording', type:'Video', href:null, status:'needed', owner:'Events', note:'Registered under Event Overview › Agenda &amp; session recaps.' },
          { label:'Service pricing guidance', type:'Doc', href:null, status:'needed', owner:'Pricing &amp; Commercial', note:'See also Sales Resources › Pricing &amp; commercials.' },
          { label:'Partner-facing service overview deck', type:'Deck', href:null, status:'needed', owner:'Product Marketing' },
        ]},
      ]},

    { id: 'faqs', title: 'FAQs', summary: 'Common questions.',
      blocks: [
        { t:'faq', items:[
          { q:'Is this something Pax8 delivers, or the partner?',
            a:'The partner delivers it to their client. Pax8 supplies the platform, the agents and the enablement to make it deliverable and repeatable.' },
          { q:'How is this different from an existing managed-services contract?',
            a:'Structurally it is very similar, which is the point — it uses delivery muscle the partner already has. What differs is the object being managed and the way the outcome is evidenced.' },
          { q:'Does a partner need Managed Intelligence Services to use Agent Store?',
            a:'No. Agent Store can be used for straightforward procurement. The service layer is how a partner turns that procurement into recurring revenue rather than a pass-through resale.' },
          { q:'What should a partner charge for it?',
            a:'Do not improvise this. Route to Sales Resources › Pricing &amp; commercials, and escalate if the answer is not documented there.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'agent-store', title: 'Agent Store', icon: 'store',
  kicker: 'Theme 3',
  blurb: 'AI agents in the Pax8 Marketplace — discovery, procurement and lifecycle management where partners already buy.',
  owner: OWNERS.pmm, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'what-it-is', title: 'What it is', summary: 'Agents, in the Marketplace.',
      blocks: [
        { t:'lead', text:'Agent Store is the addition to the Pax8 Marketplace for AI agents. Partners discover, procure and manage agents in the same place, on the same billing relationship and through the same procurement route they already use for everything else.' },
        { t:'h', text:'Why "in the Marketplace" is the whole point' },
        { t:'p', text:'The friction in AI adoption for a partner is rarely the technology — it is procurement, billing, vendor management and trust. Putting agents behind the Marketplace relationship removes four separate conversations from every agent a partner wants to try.' },
        { t:'callout', tone:'warn', title:'Check current availability before promising it',
          text:'Agent Store moved through early access towards general availability during 2026. Confirm the current status and catalogue coverage with the AI Adoption / GTM owner before committing to a partner on timing or on a specific agent being available.' },
      ]},

    { id: 'why-it-matters', title: 'Why it matters', summary: 'For the partner, and for us.',
      blocks: [
        { t:'numbered', items:[
          { title:'It removes the procurement barrier', text:'No new vendor contract, no new billing relationship, no new security review per agent. The partner tries agents at a fraction of the usual overhead.' },
          { title:'It makes the MIP model practical', text:'A partner cannot orchestrate agents they cannot easily obtain. The store is the supply side of the entire MIP story.' },
          { title:'It keeps the partner in the transaction', text:'Without a partner-first route to agents, clients buy direct from vendors and the partner is out of the loop — which is precisely the disintermediation risk the MIP narrative warns about.' },
        ]},
      ]},

    { id: 'use-cases', title: 'Partner use cases', summary: 'How partners actually use it.',
      blocks: [
        { t:'cards', items:[
          { title:'Trial before committing', text:'Testing an agent against a real internal process before offering it to clients. Low-risk, and it builds the partner’s own confidence — which is usually the real blocker.' },
          { title:'Standardising a client offer', text:'Picking a small set of agents the partner will deploy repeatedly, so delivery becomes a repeatable motion rather than bespoke each time.' },
          { title:'Filling a capability gap', text:'Meeting a specific client requirement without building or partnering separately.' },
        ]},
      ]},

    { id: 'assets', title: 'Assets & training', summary: 'Registered materials.',
      blocks: [
        { t:'assets', items:[
          { label:'Agent Store overview one-pager', type:'One-pager', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Agent Store walkthrough video', type:'Video', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Marketplace / Agent Store training', type:'Course', href:null, status:'needed', owner:'Revenue Enablement', note:'Also registered under Training &amp; Readiness › Marketplace training.' },
          { label:'Conversational solution builder overview', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Current agent catalogue', type:'Page', href:null, status:'needed', owner:'Product Marketing', note:'Changes frequently — link to the live catalogue, never to a snapshot.' },
        ]},
      ]},

    { id: 'faqs', title: 'FAQs', summary: 'Common questions.',
      blocks: [
        { t:'faq', items:[
          { q:'Which agents are available?',
            a:'Use the live catalogue link rather than any list held in a deck. The catalogue changes often enough that a copied list is wrong within weeks — this is exactly the duplication problem the hub exists to stop.' },
          { q:'How does billing work?',
            a:'Through the existing Marketplace billing relationship. For specifics on rates and margin, go to Sales Resources › Pricing &amp; commercials.' },
          { q:'Can a partner list their own agent?',
            a:'Confirm current policy with the AI Adoption / GTM owner before answering — this is a frequent partner question and the answer should not be improvised.' },
          { q:'What support does a partner get on an agent bought through the store?',
            a:'Documented support model to be registered on this page. Until it is, treat it as an escalation rather than answering from assumption.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'salesforce', title: 'Salesforce & Beyond Hub', icon: 'cloud',
  kicker: 'Systems',
  blurb: 'The dashboards where Beyond data lives: attendance, engagement, recommendations, opportunities and reporting.',
  owner: OWNERS.salesops, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'dashboards', title: 'Dashboard overview', summary: 'Five dashboards, five different questions.',
      blocks: [
        { t:'lead', text:'The Beyond Hub in Salesforce is where event activity becomes something you can work. Each dashboard answers a different question — pick by question, not by habit.' },
        { t:'table', head:['Dashboard', 'Answers', 'Use it when'], rows:[
          ['Attendance Insights', 'Who came, from which partner, to what', 'Building a follow-up list or prioritising accounts'],
          ['Engagement Insights', 'What each attendee actually engaged with', 'Preparing for a specific call'],
          ['Recommendation Insights', 'What follow-up actions the system has generated', 'Working your queue'],
          ['Opportunity Management', 'What pipeline has come out of Beyond', 'Forecasting and tracking conversion'],
          ['Reporting', 'How Beyond is performing overall', 'Reporting up, or reviewing team performance'],
        ]},
        { t:'assets', items:[
          { label:'Beyond Hub in Salesforce', type:'Dashboard', href:null, status:'needed', owner:'Sales Ops / Salesforce', note:'Primary entry point — URL to be supplied.' },
          { label:'Dashboard access request', type:'Page', href:null, status:'needed', owner:'Sales Ops / Salesforce', note:'Route for reps who cannot see the Beyond Hub.' },
        ]},
        { t:'callout', tone:'info', title:'No access?',
          text:'Beyond Hub visibility depends on your Salesforce profile. Raise it through the access request route rather than asking a colleague to export and send you a copy — an exported spreadsheet is a duplicate that goes stale immediately.' },
      ]},

    { id: 'attendance', title: 'Attendance Insights', summary: 'Who was there.',
      blocks: [
        { t:'p', text:'Attendance Insights is the base layer everything else builds on. It answers who registered, who actually attended, and which partner organisation they belong to.' },
        { t:'h', text:'What to do with it' },
        { t:'list', items:[
          'Filter to your own accounts first — the unfiltered view is not a work queue',
          'Separate attended from registered-but-did-not-attend; these are two different follow-up motions',
          'Look at how many people a partner sent — multiple attendees usually signals genuine organisational interest rather than one curious individual',
          'Check which attendees are not yet contacts on the account record, and fix that before you start outreach',
        ]},
        { t:'callout', tone:'warn', title:'Data quality caveat',
          text:'Event registration data is self-entered by attendees, so job titles and company names can be inconsistent. Verify against the account record before using a title in outreach.' },
      ]},

    { id: 'engagement', title: 'Engagement Insights', summary: 'What they cared about.',
      blocks: [
        { t:'p', text:'Engagement Insights shows what each attendee actually did — sessions joined, content viewed, time spent. It is the difference between "they were at Beyond" and "they spent forty minutes in the Agent Store session".' },
        { t:'h', text:'How to read it before a call' },
        { t:'steps', items:[
          { title:'Look at session attendance first', text:'The sessions someone chose tell you which of the four themes to open with. Do not open with a theme they skipped.' },
          { title:'Check depth, not just presence', text:'Someone who stayed for a whole session is a different conversation from someone who dropped out after five minutes.' },
          { title:'Look across the partner organisation', text:'If three people from one partner attended three different sessions, that is a leadership-level conversation, not a single-rep follow-up.' },
          { title:'Match your material to what you found', text:'Send the clip and one-pager for the theme they engaged with — not the full keynote and the full asset list.' },
        ]},
      ]},

    { id: 'recommendation-insights', title: 'Recommendation Insights', summary: 'The system’s view of your follow-up.',
      blocks: [
        { t:'p', text:'Recommendation Insights shows the recommendations generated from Beyond activity, their status, and how they are progressing. The full explanation of what a recommendation is and how to work it lives in **Recommendations & Follow-up** — this page is about the dashboard itself.' },
        { t:'list', items:[
          'Open recommendations by owner — your queue, and your team’s',
          'Ageing — how long recommendations have been sitting unactioned',
          'Outcome status — actioned, converted, dismissed, and the reason given',
          'Conversion into opportunities — which is where the Opportunity Management dashboard picks up',
        ]},
        { t:'callout', tone:'info', title:'Dismissing is a valid outcome',
          text:'A recommendation dismissed with a clear reason is better data than one left open indefinitely. Ageing recommendations distort every downstream number.' },
      ]},

    { id: 'opportunities', title: 'Opportunity Management', summary: 'Pipeline that came out of Beyond.',
      blocks: [
        { t:'p', text:'Opportunities generated from Beyond activity need to be identifiable as such, or attribution collapses and next year’s event has no business case.' },
        { t:'steps', items:[
          { title:'Tag the opportunity to Beyond at creation', text:'Retrofitting attribution later does not happen in practice. Confirm the correct field and value with the Sales Ops owner and use it consistently.' },
          { title:'Link it back to the recommendation', text:'This is what closes the loop between engagement data and revenue, and it is the only way to prove which session content actually converts.' },
          { title:'Keep stage and close date honest', text:'Event-sourced pipeline is scrutinised more than normal pipeline. Optimistic dates on Beyond opportunities damage the case for the event.' },
          { title:'Record the loss reason', text:'Beyond-sourced losses tell Product Marketing which part of the narrative is not landing — that feedback loop only exists if the reason is captured.' },
        ]},
      ]},

    { id: 'reporting', title: 'Reporting guidance', summary: 'What to report, and to whom.',
      blocks: [
        { t:'p', text:'One set of numbers, from one place. If a report is built outside the Beyond Hub, it will diverge from it — and the two will be argued about instead of acted on.' },
        { t:'table', head:['Audience', 'What they need', 'Cadence'], rows:[
          ['Rep', 'My recommendations, my accounts, my ageing', 'Daily / weekly'],
          ['Sales leader', 'Team coverage, ageing, conversion rate', 'Weekly'],
          ['Regional leadership', 'Pipeline generated, conversion, theme performance', 'Monthly'],
          ['Event / Marketing', 'Engagement to pipeline attribution by session', 'Post-event and quarterly'],
        ]},
        { t:'assets', items:[
          { label:'Beyond reporting definitions', type:'Doc', href:null, status:'needed', owner:'Sales Ops / Salesforce', note:'Agreed definitions for actioned, converted and attributed. Needed to stop numbers being argued about.' },
          { label:'Leadership reporting pack template', type:'Deck', href:null, status:'needed', owner:'Sales Leadership' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'recommendations', title: 'Recommendations & Follow-up', icon: 'target',
  kicker: 'Follow-up',
  blurb: 'What recommendations are, where to find them, how to action them, and what good follow-up looks like.',
  owner: OWNERS.salesops, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'what-they-are', title: 'What recommendations are', summary: 'Not leads. Not tasks. Something more specific.',
      blocks: [
        { t:'lead', text:'A recommendation is a suggested follow-up action generated from what a partner actually did — the sessions they attended, the content they engaged with, and the signals that came out of Beyond activity. It arrives with the reason attached.' },
        { t:'h', text:'What makes it different from a lead' },
        { t:'table', head:['', 'A lead', 'A recommendation'], rows:[
          ['Where it comes from', 'A form fill or a list', 'Observed behaviour at the event'],
          ['What you know', 'Contact details', 'Contact details plus what they engaged with'],
          ['What it asks you to do', 'Qualify it', 'Take a specific next action'],
          ['How it ages', 'Slowly', 'Fast — the engagement context goes cold'],
        ]},
        { t:'callout', tone:'warn', title:'The decay is the point',
          text:'A recommendation is valuable because it is timely. Two months after the event, "you attended our session on…" stops being a warm opener and starts being an admission that nobody followed up.' },
        { t:'h', text:'The anatomy of one' },
        { t:'list', items:[
          'The partner and the specific contact it relates to',
          'The signal — what they did that triggered it',
          'The suggested action — what to actually do next',
          'The owner — who is expected to do it',
          'The status — open, actioned, converted or dismissed',
        ]},
      ]},

    { id: 'where', title: 'Where to find them', summary: 'One place, not four.',
      blocks: [
        { t:'p', text:'Recommendations live in Salesforce, surfaced through the Beyond Hub. They are not distributed by email, spreadsheet or Teams message — if you have received a list of recommendations in one of those formats, it is a copy, and it is already out of date.' },
        { t:'steps', items:[
          { title:'Open the Beyond Hub in Salesforce', text:'Registered under Salesforce &amp; Beyond Hub › Dashboard overview.' },
          { title:'Go to Recommendation Insights', text:'Filter to your own name to get your queue.' },
          { title:'Sort by age', text:'Oldest first. The commercial value of a recommendation falls faster than most reps expect.' },
          { title:'Work from the record, not from an export', text:'Actioning in Salesforce is what updates the status. Working from an export means the dashboard never reflects reality.' },
        ]},
      ]},

    { id: 'how-to-action', title: 'How to action them', summary: 'The follow-up motion, end to end.',
      blocks: [
        { t:'steps', items:[
          { title:'Read the signal before you read the suggested action', text:'The suggestion is generated. The signal is the fact. If they conflict, trust the signal and use your judgement.' },
          { title:'Check the engagement detail', text:'Open Engagement Insights for that contact. You want to know which session, how long, and who else from that partner attended.' },
          { title:'Pick your material', text:'One clip and one asset that match what they engaged with. Not the full library — a follow-up that dumps ten links reads as automated.' },
          { title:'Make contact with the context in the first line', text:'Reference the specific session. "You spent time in the Agent Store session at Beyond" earns a reply; "following up on Beyond" does not.' },
          { title:'Update the status the same day', text:'Actioned, converted or dismissed with a reason. This is the step that most often gets skipped and it is the one that makes every dashboard downstream trustworthy.' },
          { title:'If it converts, link the opportunity', text:'See Salesforce &amp; Beyond Hub › Opportunity Management. Attribution has to be set at creation.' },
        ]},
        { t:'callout', tone:'good', title:'The 48-hour rule of thumb',
          text:'Recommendations actioned within two working days of appearing convert materially better than those left to sit. If you cannot action it, dismiss it with a reason so it does not clog the queue and skew the ageing numbers.' },
      ]},

    { id: 'walkthrough', title: 'Salesforce walkthrough', summary: 'Click-by-click.',
      blocks: [
        { t:'p', text:'A recorded walkthrough is the fastest way to learn this. Registered once here and linked from Training &amp; Readiness rather than duplicated.' },
        { t:'assets', items:[
          { label:'Recommendation flow — recorded walkthrough', type:'Video', href:null, status:'needed', owner:'Sales Ops / Salesforce', note:'Highest-demand asset in this section. Prioritise.' },
          { label:'Recommendation flow — step-by-step guide', type:'Doc', href:null, status:'needed', owner:'Sales Ops / Salesforce' },
          { label:'Status and field definitions', type:'Doc', href:null, status:'needed', owner:'Sales Ops / Salesforce', note:'What counts as actioned vs converted — needed to make reporting consistent.' },
        ]},
      ]},

    { id: 'workflows', title: 'Example workflows', summary: 'Three worked examples.',
      blocks: [
        { t:'cards', items:[
          { title:'Attended a session, no open opportunity', text:'Signal: attended the Agent Store session, no pipeline on the account. Action: send the Agent Store clip plus the one-pager, offer a 20-minute walkthrough. Log as actioned the same day. Convert only when they agree to the call — not when you send the email.' },
          { title:'Multiple attendees from one partner', text:'Signal: three people from one partner across three themes. Action: this is a leadership conversation. Go to the partner’s decision maker with a business-model framing, not a product follow-up. Involve your sales leader before making contact.' },
          { title:'Registered, did not attend', text:'Signal: registered for a theme, no attendance. Action: acknowledge it plainly and send the fifteen-minute cut of what they missed. Low effort, and it converts more often than most reps assume.' },
        ]},
      ]},

    { id: 'dashboards', title: 'Dashboards', summary: 'Where to watch performance.',
      blocks: [
        { t:'p', text:'Recommendation performance is tracked in Recommendation Insights. The dashboard detail is documented under **Salesforce & Beyond Hub › Recommendation Insights** — deliberately not repeated here.' },
        { t:'list', items:[
          'Open recommendations by owner, and ageing',
          'Action rate — how many are being worked at all',
          'Conversion rate — how many become opportunities',
          'Dismissal reasons — which tell you whether the recommendations themselves are any good',
        ]},
      ]},

    { id: 'success-stories', title: 'Success stories', summary: 'What good looks like, from people who did it.',
      blocks: [
        { t:'callout', tone:'info', title:'This section is deliberately empty until it is real',
          text:'Success stories are collected from actual conversions, not written in advance. If you convert a Beyond recommendation into pipeline, send it to the section owner — a two-paragraph account of what you sent and what came back is more useful to other reps than any template.' },
        { t:'assets', items:[
          { label:'Beyond follow-up success stories', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement', note:'To be populated from live conversions.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'readiness', title: 'Training & Readiness', icon: 'book',
  kicker: 'Enablement',
  blurb: 'Pre- and post-event learning, readiness decks, recorded sessions, facilitator assets and marketplace training.',
  owner: OWNERS.enablement, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'overview', title: 'Readiness overview', summary: 'How the programme is structured.',
      blocks: [
        { t:'lead', text:'Beyond readiness runs in two halves. Pre-event readiness got people to the event able to have a conversation. Post-event readiness — the half that is live now — turns the announcements into something reps can sell and partners can buy.' },
        { t:'numbered', items:[
          { title:'Know the story', text:'The Beyond narrative and the four themes. Everyone in a partner-facing role needs this. Roughly 30 minutes.' },
          { title:'Know the systems', text:'Beyond Hub, recommendations, dashboards. Needed by anyone working follow-up. Roughly 45 minutes including the walkthrough.' },
          { title:'Know the commercials', text:'Pricing, packaging and what you may commit to. Required before a partner pricing conversation.' },
          { title:'Practise it', text:'Facilitated sessions with objection handling. Run by team leaders using the facilitator assets.' },
        ]},
        { t:'callout', tone:'warn', title:'Known issue: LMS completion tracking',
          text:'Completion records for the MIP training have not been reliably tracking. If your completion is not showing, report it to the section owner rather than retaking the course.' },
      ]},

    { id: 'pre-event', title: 'Pre-event learning', summary: 'Kept for reference and for new starters.',
      blocks: [
        { t:'p', text:'The pre-event material is retained because it is the best short introduction to the themes for anyone who joined after the event.' },
        { t:'assets', items:[
          { label:'Beyond readiness training (pre-event)', type:'Course', href:null, status:'needed', owner:'Revenue Enablement' },
          { label:'Pre-event readiness deck', type:'Deck', href:null, status:'needed', owner:'Revenue Enablement' },
          { label:'Theme primers', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement', note:'Short primers on each of the four announcement themes.' },
        ]},
      ]},

    { id: 'post-event', title: 'Post-event learning', summary: 'The live programme.',
      blocks: [
        { t:'p', text:'This is the active readiness track. It covers what was announced, how to talk about it, and how to work the follow-up.' },
        { t:'assets', items:[
          { label:'Post-Beyond sales training', type:'Course', href:null, status:'needed', owner:'Revenue Enablement', note:'Covers the narrative, the themes, objection handling and partner conversations.' },
          { label:'Recommendation flow training', type:'Course', href:null, status:'needed', owner:'Sales Ops / Salesforce' },
          { label:'Salesforce dashboards training', type:'Course', href:null, status:'needed', owner:'Sales Ops / Salesforce' },
          { label:'Live session schedule', type:'Page', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
      ]},

    { id: 'decks-recordings', title: 'Readiness decks & recorded sessions', summary: 'For self-serve and for reference.',
      blocks: [
        { t:'p', text:'Every live readiness session is recorded and registered here. If a session you need has not been recorded, that is a gap — raise it with the section owner.' },
        { t:'assets', items:[
          { label:'Beyond readiness deck (current version)', type:'Deck', href:null, status:'needed', owner:'Revenue Enablement', note:'Single current version. Previous versions should be retired, not archived alongside it.' },
          { label:'Recorded readiness sessions', type:'Video', href:null, status:'needed', owner:'Revenue Enablement' },
          { label:'Beyond SharePoint resources', type:'Page', href:null, status:'needed', owner:'Revenue Enablement', note:'Legacy location. To be reviewed for duplicates and progressively retired into this hub.' },
        ]},
        { t:'callout', tone:'warn', title:'Version control',
          text:'One current version of the readiness deck, in one location. If you are holding a copy locally or in a team channel, delete it and link here instead — a personally-held copy is how the last set of inconsistent messaging happened.' },
      ]},

    { id: 'facilitator', title: 'Facilitator assets', summary: 'For anyone running a session.',
      blocks: [
        { t:'p', text:'Team leaders and enablement partners running Beyond sessions should use these rather than building their own — consistency across teams is the entire objective.' },
        { t:'assets', items:[
          { label:'Facilitator guide', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement', note:'Session flow, timings and discussion prompts.' },
          { label:'Facilitator deck (annotated)', type:'Deck', href:null, status:'needed', owner:'Revenue Enablement' },
          { label:'Role-play scenarios', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement', note:'Built from the objection handling in Beyond Story.' },
          { label:'Session feedback form', type:'Page', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
      ]},

    { id: 'marketplace-training', title: 'Marketplace training', summary: 'Platform skills, including Agent Store.',
      blocks: [
        { t:'p', text:'Marketplace and Agent Store training is the practical counterpart to the Agent Store narrative — reps who cannot navigate the store cannot credibly walk a partner through it.' },
        { t:'assets', items:[
          { label:'Marketplace training', type:'Course', href:null, status:'needed', owner:'Revenue Enablement' },
          { label:'Agent Store walkthrough', type:'Video', href:null, status:'needed', owner:'Product Marketing', note:'Registered under Agent Store › Assets &amp; training.' },
        ]},
      ]},

    { id: 'rec-walkthroughs', title: 'Recommendation walkthroughs', summary: 'Learning the follow-up motion.',
      blocks: [
        { t:'p', text:'The walkthrough content is registered under **Recommendations & Follow-up › Salesforce walkthrough**. It is referenced here so it can be found from the training track, but there is only one copy.' },
        { t:'list', items:[
          'What a recommendation is and where it comes from',
          'Finding your queue in the Beyond Hub',
          'Reading engagement detail before making contact',
          'Actioning, converting and dismissing correctly',
          'Linking a converted recommendation to an opportunity',
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'sales-resources', title: 'Sales Resources', icon: 'briefcase',
  kicker: 'Selling',
  blurb: 'Sales process and recommendation flow guidance, pricing and commercials, and leadership resources.',
  owner: OWNERS.salesldr, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'sales-process', title: 'Sales process & recommendation flow', summary: 'Where Beyond fits in the existing process.',
      blocks: [
        { t:'lead', text:'Beyond does not introduce a separate sales process. It introduces a new source of qualified activity at the top of the existing one, plus a narrative that changes what the early conversations are about.' },
        { t:'steps', items:[
          { title:'Signal', text:'The partner does something at or after Beyond — attends a session, engages with content. Captured in Engagement Insights.' },
          { title:'Recommendation', text:'A suggested follow-up action is generated with the signal attached. Appears in your queue in the Beyond Hub.' },
          { title:'Contact', text:'You make contact using the specific context, with material matched to what they engaged with.' },
          { title:'Qualify', text:'Standard qualification. The Beyond context tells you where to start, not whether the deal is real.' },
          { title:'Opportunity', text:'Created and attributed to Beyond at the point of creation, and linked back to the recommendation.' },
          { title:'Close and feed back', text:'Win or loss reason captured. Loss reasons are the feedback loop that improves the narrative.' },
        ]},
        { t:'callout', tone:'info', title:'The failure mode to avoid',
          text:'Treating recommendations as a separate side-process that sits outside your normal pipeline hygiene. They are top-of-funnel activity in the process you already run.' },
      ]},

    { id: 'pricing', title: 'Pricing & commercials', summary: 'The one section where you must not improvise.',
      blocks: [
        { t:'callout', tone:'warn', title:'Do not answer a pricing question from memory',
          text:'Commercial terms change, and a wrong number given in a partner conversation is expensive to retract. If the answer is not documented and current here, it is an escalation.' },
        { t:'list', items:[
          'Current pricing and packaging for the products behind the Beyond announcements',
          'Margin and commercial terms for partners',
          'Agent Store billing mechanics',
          'What may be committed to in a conversation, and what needs approval first',
          'The escalation route for a non-standard commercial request',
        ]},
        { t:'assets', items:[
          { label:'Beyond commercial summary', type:'Doc', href:null, status:'needed', owner:'Pricing &amp; Commercial', note:'Priority gap — this is the most common escalation reason.' },
          { label:'Agent Store pricing and billing', type:'Doc', href:null, status:'needed', owner:'Pricing &amp; Commercial' },
          { label:'Managed Intelligence Services pricing guidance', type:'Doc', href:null, status:'needed', owner:'Pricing &amp; Commercial' },
          { label:'Commercial escalation route', type:'Page', href:null, status:'needed', owner:'Pricing &amp; Commercial' },
        ]},
      ]},

    { id: 'leadership', title: 'Sales leadership resources', summary: 'For managing the follow-up, not doing it.',
      blocks: [
        { t:'p', text:'Leaders need a different view: coverage, ageing, conversion and where coaching is required.' },
        { t:'cards', items:[
          { title:'Coverage', text:'Are all recommendations owned, and is the distribution across the team sensible? Unowned recommendations are the most common leak.' },
          { title:'Ageing', text:'How long are recommendations sitting? Ageing is the earliest visible symptom that follow-up has stalled.' },
          { title:'Conversion', text:'Action rate versus conversion rate. A high action rate with low conversion usually means the material is not matching the signal.' },
          { title:'Coaching', text:'Dismissal reasons and loss reasons tell you which part of the narrative a rep is not comfortable with.' },
        ]},
        { t:'assets', items:[
          { label:'Leadership dashboard view', type:'Dashboard', href:null, status:'needed', owner:'Sales Ops / Salesforce' },
          { label:'Team review agenda template', type:'Doc', href:null, status:'needed', owner:'Sales Leadership' },
          { label:'Coaching guide — Beyond conversations', type:'Doc', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
      ]},

    { id: 'collateral', title: 'Collateral library', summary: 'Everything partner-facing, in one list.',
      blocks: [
        { t:'p', text:'Cleared partner-facing material only. Anything marked Draft is internal until the owner signs it off.' },
        { t:'assets', items:[
          { label:'Beyond announcement one-pager', type:'One-pager', href:null, status:'needed', owner:'Product Marketing' },
          { label:'AI &amp; MIP partner deck', type:'Deck', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Agent Store one-pager', type:'One-pager', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Managed Intelligence Services one-pager', type:'One-pager', href:null, status:'needed', owner:'Product Marketing' },
          { label:'Keynote partner-shareable cut', type:'Video', href:null, status:'needed', owner:'Product Marketing', note:'Registered under Beyond Story › Keynote recordings.' },
          { label:'EMEA case study', type:'Doc', href:null, status:'needed', owner:'Product Marketing' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'faqs', title: 'FAQs', icon: 'help',
  kicker: 'Answers',
  blurb: 'The questions that come up most, split by who is asking.',
  owner: OWNERS.enablement, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'top', title: 'Top questions', summary: 'Start here.',
      blocks: [
        { t:'faq', items:[
          { q:'Where do I find my Beyond follow-up?',
            a:'Recommendation Insights in the Beyond Hub in Salesforce. Not email, not a spreadsheet. See Recommendations &amp; Follow-up › Where to find them.' },
          { q:'What is the difference between MIP, Agent Store and Managed Intelligence Services?',
            a:'MIP is the partner business model. Agent Store is where agents are bought. Managed Intelligence Services is the recurring service a partner wraps around those agents. Model, supply, service — in that order.' },
          { q:'Is there a single deck I can present to a partner?',
            a:'Use the partner-facing decks registered under Sales Resources › Collateral library. Do not build your own from fragments — that is how message drift starts.' },
          { q:'Something in this hub is out of date. Who do I tell?',
            a:'The section owner named at the top of that page. Every page has one.' },
          { q:'Is this hub replacing the Beyond SharePoint pages?',
            a:'Yes, progressively. Legacy locations are being reviewed for duplicates and retired. If you find a duplicate, raise it rather than working around it.' },
        ]},
      ]},

    { id: 'partner', title: 'Partner-facing questions', summary: 'What partners actually ask.',
      blocks: [
        { t:'p', text:'These are answers you can give directly. Where an answer says escalate, escalate — a confident wrong answer costs more than a short delay.' },
        { t:'faq', items:[
          { q:'"Do I have to become an MIP?"',
            a:'No. It is a direction of travel, not a mandate, and there is no switch to flip. What is worth taking seriously is the margin pressure on the traditional model over the next two years — that is the reason to start, and it applies whether or not the label is adopted.' },
          { q:'"When can I get access to Agent Store?"',
            a:'Confirm current availability before answering — this changed through 2026. Check with the AI Adoption / GTM owner rather than quoting a date from a deck.' },
          { q:'"What does it cost?"',
            a:'Escalate to Sales Resources › Pricing &amp; commercials. Do not improvise.' },
          { q:'"Who else has done this successfully?"',
            a:'Use the produced EMEA case study. Be honest that the library is still being built — partners respond better to that than to a vague claim about "many partners".' },
          { q:'"What support do I get?"',
            a:'Programme escalations go to mip@pax8.com. Confirm the specific support model on the relevant topic page before committing to anything.' },
        ]},
      ]},

    { id: 'internal', title: 'Internal & process questions', summary: 'How things work here.',
      blocks: [
        { t:'faq', items:[
          { q:'I cannot see the Beyond Hub in Salesforce.',
            a:'It is a profile permission. Use the access request route under Salesforce &amp; Beyond Hub › Dashboard overview. Do not ask a colleague to export the data for you — an export is a duplicate that is stale on arrival.' },
          { q:'My LMS completion is not showing.',
            a:'Known issue. Report it to the Revenue Enablement owner rather than retaking the course.' },
          { q:'I found the same deck in two places with different content. Which is right?',
            a:'Neither, until the owner says so. Raise it with the section owner — resolving it means retiring one, not annotating both.' },
          { q:'How often is this hub reviewed?',
            a:'Each section carries its own cadence, shown in the page header. Anything past its review date is flagged automatically on the Governance page.' },
          { q:'Can I add my own content?',
            a:'Through the section owner. See Getting Started › Contributing content.' },
        ]},
      ]},

    { id: 'ask', title: 'Ask a question', summary: 'When it is genuinely not here.',
      blocks: [
        { t:'lead', text:'If you cannot find an answer, that is a content gap and it should be captured as one — not resolved privately in a DM and then lost.' },
        { t:'steps', items:[
          { title:'Search the hub first', text:'Press / and search. Most questions are answered somewhere other than where you looked.' },
          { title:'Check the section owner', text:'The page nearest your question names an owning team. That is who to ask.' },
          { title:'Ask so it can be captured', text:'Ask in the shared channel rather than by DM, so the answer becomes content instead of disappearing into one inbox.' },
          { title:'Escalate programme questions', text:'MIP programme and partner escalations go to mip@pax8.com.' },
        ]},
        { t:'assets', items:[
          { label:'Beyond questions channel', type:'Page', href:null, status:'needed', owner:'Revenue Enablement', note:'Shared channel link to be supplied.' },
          { label:'Content gap request form', type:'Page', href:null, status:'needed', owner:'Revenue Enablement' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'governance', title: 'Governance & Ownership', icon: 'shield',
  kicker: 'How this stays true',
  utility: true,
  blurb: 'Who owns what, when it was last reviewed, and every content gap in one automatically generated report.',
  owner: OWNERS.enablement, reviewed: '2026-08-27', cadence: 'Monthly',
  pages: [
    { id: 'model', title: 'Ownership model', summary: 'Named owners, review cadences, and what happens when they slip.',
      blocks: [
        { t:'lead', text:'A hub without owners becomes the next set of scattered pages within a quarter. The ownership model is not administrative overhead — it is the mechanism that keeps this a source of truth rather than another place to look.' },
        { t:'numbered', items:[
          { title:'Every section has one owning team', text:'Not two, not a committee. The owning team is accountable for accuracy, and is named in the header of every page in that section.' },
          { title:'Every owning team names an individual', text:'A team name alone is nobody. The named owner is who a rep contacts, and who the review reminder goes to.' },
          { title:'Every section has a review cadence', text:'Monthly for anything commercial or fast-moving, quarterly for stable structural content. The date of last review is public on every page.' },
          { title:'Overdue content is visible, not silently stale', text:'The report below flags any section past its review date. Nobody has to audit the hub manually to find out what has rotted.' },
        ]},
        { t:'h', text:'What an owner is actually accountable for' },
        { t:'list', items:[
          'The content in their section being accurate and current at the review date',
          'Every registered asset in their section having a working link or an honest "Needed" status',
          'Retiring duplicates found in legacy locations, rather than annotating them',
          'Responding when a rep flags something wrong',
          'Nominating a replacement before they hand the section on',
        ]},
        { t:'callout', tone:'warn', title:'Owner names are placeholders',
          text:'Named owners currently read TBC. Assigning them is the first governance action — the model does not function on team names alone, because a team cannot be chased.' },
      ]},

    { id: 'standards', title: 'Publishing standards', summary: 'The rules content has to meet to be here.',
      blocks: [
        { t:'numbered', items:[
          { title:'Link, do not copy', text:'Assets stay in their home system. The hub registers the link. Uploading a second copy into the hub recreates the problem the hub was built to solve.' },
          { title:'One canonical version', text:'Where two versions exist, one is retired. A note explaining which copy is current is not a resolution — it is two copies and a note.' },
          { title:'Status is honest', text:'Live means it exists and the link works. Draft means it exists but is not signed off. Needed means it does not exist. Nothing is marked Live optimistically.' },
          { title:'Internal language stays internal', text:'Internal programme codenames and unreconciled frameworks do not go into partner-facing material.' },
          { title:'Unresolved things are labelled unresolved', text:'Where source documents disagree — as they currently do on the MIP play count — the hub says so rather than picking one and hoping.' },
        ]},
      ]},

    { id: 'report', title: 'Content gap report', summary: 'Generated live from the content model.',
      blocks: [
        { t:'p', text:'Everything below is generated from the content file itself, so it cannot drift out of date. It is the Beyond content backlog.' },
        { t:'generated', kind:'report' },
      ]},
  ]
},

];

/* Expose for the renderer. */
window.SITE = SITE;
window.OWNERS = OWNERS;
