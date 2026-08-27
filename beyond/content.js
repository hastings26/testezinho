/* =============================================================================
   BEYOND 2026 COMMAND CENTER — PUBLISHED CONTENT (CAM-facing)
   -----------------------------------------------------------------------------
   This file contains ONLY content that is ready for the field to see. It is the
   single source of truth for the hub, and everything on the site is rendered
   from it — nothing is hard-coded in the markup.

   WHAT BELONGS HERE
   Content that is ready for the field. Anything still in production, along with
   internal planning detail, is tracked separately and is not part of the
   published site — see the maintainer notes in beyond/README.md. Keep this file
   to finished content: no placeholders, no internal status, no review dates.

   BLOCK TYPES available inside a page's `blocks` array:
     {t:'lead',   text}                         large intro paragraph
     {t:'p',      text}                         paragraph (**bold** supported)
     {t:'h',      text}                         subhead
     {t:'list',   items:['…']}                  bullet list
     {t:'numbered', items:[{title,text}]}       numbered cards (blue → teal)
     {t:'cards',  items:[{title,text}]}         plain cards
     {t:'steps',  items:[{title,text}]}         ordered walkthrough
     {t:'assets', items:[{label,type,href,status,note}]}
     {t:'faq',    items:[{q,a}]}
     {t:'callout',tone:'info'|'warn'|'good', title, text}
     {t:'table',  head:['…'], rows:[['…']]}
     {t:'stat',   items:[{value,label,note}]}
     {t:'timeline',items:[{when,title,text}]}

   ASSET STATUS — only two values are valid in this file:
     'live'    it exists and `href` points at it
     'coming'  released shortly, and knowing it is coming helps the CAM plan
   Use 'coming' sparingly. It is for things a CAM would otherwise go looking for
   elsewhere — a training date, a walkthrough, a recording. It is not a way to
   list everything still in production.

   RULE: never paste a duplicate copy of a document into this hub. Register the
   link once, here, and point every section at the same entry.
   ========================================================================== */

const OWNERS = {
  enablement: { team: 'Revenue Enablement — EMEA' },
  pmm:        { team: 'Product Marketing' },
  salesops:   { team: 'Sales Ops / Salesforce' },
  aigtm:      { team: 'AI Adoption / GTM', contact: 'mip@pax8.com' },
  events:     { team: 'Events / Field Marketing' },
  salesldr:   { team: 'Sales Leadership — EMEA' },
  commercial: { team: 'Pricing & Commercial' },
};

const SITE = {
  name: 'Beyond 2026',
  tagline: 'Command Center',
  strapline: 'Everything from Beyond — the story, the announcements and the follow-up — in one place.',
  updated: '2026-08-27',

  principles: [
    { title: 'One place to look',
      text: 'Every Beyond asset is registered once and linked from wherever it is relevant. One canonical version of each document, so what you send a partner is always the current one.' },
    { title: 'Organised by topic',
      text: 'Navigation follows subject matter rather than job title, so content stays findable when your responsibilities change and every team reaches the same resources.' },
    { title: 'Kept current',
      text: 'Each section has an owning team and a standing review cycle, so the guidance you act on reflects where the programme actually is.' },
    { title: 'Built for the conversation',
      text: 'Messaging, objection handling and follow-up guidance are written for use in front of a partner — short enough to read before a call and specific enough to use during one.' },
  ],
};

SITE.sections = [

/* ========================================================================== */
{
  id: 'start', title: 'Getting Started', icon: 'flag',
  kicker: 'Onboarding',
  blurb: 'What this hub holds, how it is organised, and the fastest route to the thing you need.',
  owner: OWNERS.enablement,
  pages: [
    { id: 'what-this-is', title: 'What this hub is', summary: 'Everything Beyond, in one place.',
      blocks: [
        { t:'lead', text:'The Beyond 2026 Command Center is where Beyond lives. The story, the announcements, the follow-up motion and the readiness content are all here, or linked from here — so you can get to what you need without hunting for it.' },
        { t:'h', text:'How it is put together' },
        { t:'numbered', items:[
          { title:'One place to look', text:'Each asset is registered once and linked from wherever it is relevant. There is one canonical version of every document, so what you send a partner is always the current one.' },
          { title:'Organised by topic', text:'Navigation follows subject matter, not job title. Content stays findable when your responsibilities change, and every team reaches the same resources.' },
          { title:'Kept current', text:'Every section has an owning team and a standing review cycle. The owning team is named at the top of each page — they are who to go to with a question or a correction.' },
          { title:'Built for the conversation', text:'The messaging, objection handling and follow-up guidance are written for use in front of a partner: short enough to read before a call, specific enough to use during one.' },
        ]},
        { t:'callout', tone:'info', title:'Looking for something specific?',
          text:'Press <kbd>/</kbd> anywhere on the site to search every page and every registered asset at once.' },
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
          text:'Come back for the objection handling and the partner conversation starters before your first partner call — they are the two assets reps reach for most.' },
      ]},

    { id: 'paths', title: 'Common routes through the hub', summary: 'Shortcuts by task, not by job title.',
      blocks: [
        { t:'p', text:'These are shortcuts, not permissions. Every route below is open to everyone — pick the one that matches the task in front of you.' },
        { t:'cards', items:[
          { title:'I have a partner call tomorrow', text:'Beyond Story › Partner conversation starters → Objection handling → the relevant topic page (AI &amp; MIP, Agent Store or Managed Intelligence Services).' },
          { title:'I have recommendations sitting in my queue', text:'Recommendations › How to action them → Salesforce walkthrough → Example workflows.' },
          { title:'I need to report on Beyond performance', text:'Salesforce &amp; Beyond Hub › Dashboard overview → Reporting guidance. Leadership views sit under Sales Resources › Sales leadership resources.' },
          { title:'I am running a session for my team', text:'Training &amp; Readiness › Facilitator assets → Readiness decks &amp; recorded sessions.' },
          { title:'I need a price or a commercial answer', text:'Sales Resources › Pricing &amp; commercials, which also carries the route for anything non-standard.' },
          { title:'I want to suggest something for the hub', text:'Getting Started › Suggesting content — it goes to the owning team named on the relevant page.' },
        ]},
      ]},

    { id: 'contributing', title: 'Suggesting content', summary: 'How to get something added or corrected.',
      blocks: [
        { t:'lead', text:'This hub gets better from the field. If something you needed was hard to find, or you built something in a conversation that other people would use, send it to the owning team named at the top of the relevant page.' },
        { t:'steps', items:[
          { title:'Search first', text:'It may already be here under a different heading — and if it is, that is useful feedback about where it should also be linked from.' },
          { title:'Send it to the section owner', text:'Every page names an owning team in its header. They place it, so that one version stays canonical.' },
          { title:'Send the link, not a copy', text:'Assets stay in their home system — Highspot, SharePoint, the LMS, Salesforce — and the hub registers the link. That keeps one current version rather than several diverging ones.' },
          { title:'Tell them what it is for', text:'A line on the conversation it helped you have is what makes it usable by everyone else.' },
        ]},
        { t:'callout', tone:'good', title:'Most useful contribution',
          text:'What actually worked in a partner conversation. Specific beats polished — two paragraphs on what you sent and what came back is worth more to your colleagues than a formatted template.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'overview', title: 'Event Overview', icon: 'calendar',
  kicker: 'The event',
  blurb: 'What Beyond 2026 was, what was announced, who was in the room, and what happens next.',
  owner: OWNERS.events,
  pages: [
    { id: 'at-a-glance', title: 'Beyond 2026 at a glance', summary: 'The event in one screen.',
      blocks: [
        { t:'lead', text:'Pax8 Beyond 2026 is the annual partner event and the launch moment for the year’s AI strategy. For EMEA it is the point at which the MIP narrative moved from a curated pilot audience to the wider partner community.' },
        { t:'h', text:'Why the event matters commercially' },
        { t:'p', text:'Beyond produces three things you can act on: a **narrative** your partners have already heard, **engagement data** showing what each attendee actually cared about, and **recommendations** — system-generated follow-up actions tied to that engagement. The rest of this hub exists to turn those three into pipeline.' },
        { t:'h', text:'The four announcement themes' },
        { t:'cards', items:[
          { title:'AI &amp; MIP', text:'The Managed Intelligence Provider model, and the strategic case behind it.' },
          { title:'Managed Intelligence Services', text:'The recurring service layer partners wrap around agents.' },
          { title:'Agent Store', text:'AI agents in the Pax8 Marketplace.' },
          { title:'Marketplace &amp; platform', text:'The supporting platform work, including the Beyond Hub reporting surface in Salesforce.' },
        ]},
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
          { label:'Beyond 2026 announcement one-pager', type:'One-pager', status:'coming', note:'Single-page recap for use in conversation.' },
          { label:'Keynote recap deck', type:'Deck', status:'coming' },
        ]},
      ]},

    { id: 'audience', title: 'Who attended', summary: 'Attendee mix and what it means for follow-up.',
      blocks: [
        { t:'p', text:'Attendance data is the input to every recommendation and every dashboard in this hub. It lives in Salesforce — see **Salesforce &amp; Beyond Hub › Attendance Insights** for the live view, which is always more current than any summary.' },
        { t:'list', items:[
          'Which partner organisations attended, and how many people each sent',
          'Which sessions each attendee joined — the strongest signal of what they care about',
          'Which partners registered but did not attend — a distinct and often overlooked follow-up motion',
          'Which attendees are already in an open opportunity, and which are net new to the pipeline',
        ]},
        { t:'callout', tone:'good', title:'The no-show list is a work queue',
          text:'Registered non-attendees opted in to the topic. Treat them as a warm follow-up motion with the on-demand recordings, not as a failed registration — it converts more often than most people expect.' },
      ]},

    { id: 'agenda-recaps', title: 'Agenda & session recaps', summary: 'What ran, and where the recordings live.',
      blocks: [
        { t:'p', text:'Session recordings are registered once here and linked from every topic section, so there is one canonical copy of each.' },
        { t:'assets', items:[
          { label:'Main stage keynote recording', type:'Video', status:'coming' },
          { label:'AI &amp; MIP breakout recording', type:'Video', status:'coming' },
          { label:'Agent Store breakout recording', type:'Video', status:'coming' },
          { label:'Managed Intelligence Services breakout recording', type:'Video', status:'coming' },
        ]},
      ]},

    { id: 'timeline', title: 'Post-event timeline', summary: 'What happens when.',
      blocks: [
        { t:'timeline', items:[
          { when:'April 2026', title:'MIP pilot soft-launch', text:'The MIP Program pilot opened to a curated partner group, with escalations routed through mip@pax8.com.' },
          { when:'June 2026', title:'Beyond 2026', text:'MIP extended to Beyond participants. The four announcement themes go public to the partner community.' },
          { when:'July 2026', title:'Wider rollout', text:'MIP opens to the wider Pax8 partner community alongside Agent Store general availability.' },
          { when:'Aug–Sep 2026', title:'Follow-up window', text:'Recommendations and engagement data are live in Salesforce. This is the period where Beyond activity converts.' },
          { when:'Ongoing', title:'Readiness cycle', text:'Post-event learning, marketplace training and recommendation walkthroughs run continuously — see Training &amp; Readiness.' },
        ]},
        { t:'callout', tone:'info', title:'Before you commit to a date with a partner',
          text:'Programme timings move as rollout progresses. Check the current position with the AI Adoption / GTM team before putting a specific date in writing — the same discipline you would apply to any roadmap conversation.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'story', title: 'Beyond Story', icon: 'story',
  kicker: 'Messaging',
  blurb: 'The narrative sales teams were trained on: key messaging, announcement summaries, keynote recordings and partner conversation starters.',
  owner: OWNERS.pmm,
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
        { t:'callout', tone:'info', title:'Lead with the narrative and the value drivers',
          text:'Run It → Transform It → Scale It and the three value drivers are the confirmed spine of the story and carry any partner conversation. The detailed play framework is being finalised — when it lands it will give you a structured motion underneath this, and until then the narrative above is what to build the conversation on.' },
      ]},

    { id: 'announcement-summaries', title: 'Announcement summaries', summary: 'Short-form recaps you can paste.',
      blocks: [
        { t:'p', text:'Short, reusable summaries for email, chat and call prep. Use these as written rather than composing your own — consistency across the team is what makes the message land at scale.' },
        { t:'h', text:'AI &amp; MIP — 30 seconds' },
        { t:'p', text:'The Managed Intelligence Provider is the next step on from the MSP. Rather than managing devices and licences, an MIP orchestrates AI agents and sells the business outcome those agents produce. Beyond 2026 was where that model went from a pilot with a small group of partners to something the whole community can access.' },
        { t:'h', text:'Managed Intelligence Services — 30 seconds' },
        { t:'p', text:'Deploying an agent is a project. Managing it — monitoring, governing, tuning, reporting on it — is a service. Managed Intelligence Services is the wrapper that turns the first into the second, which is what makes it recurring revenue instead of one-off work.' },
        { t:'h', text:'Agent Store — 30 seconds' },
        { t:'p', text:'Agent Store brings AI agents into the Pax8 Marketplace, so partners discover, buy and manage agents in the same place they already buy everything else — with the same billing, the same procurement and the same commercial relationship.' },
        { t:'assets', items:[
          { label:'Approved messaging one-pager', type:'One-pager', status:'coming' },
          { label:'Post-event follow-up email templates', type:'Doc', status:'coming' },
        ]},
      ]},

    { id: 'keynote-recordings', title: 'Keynote recordings', summary: 'Watch it, or send it.',
      blocks: [
        { t:'p', text:'Recordings are registered here once. Every other section links back to this page, so there is a single canonical copy of each.' },
        { t:'assets', items:[
          { label:'Main stage keynote — full recording', type:'Video', status:'coming' },
          { label:'Keynote — partner-shareable cut', type:'Video', status:'coming', note:'Shortened version cleared for sending to partners.' },
          { label:'Keynote highlight clips, by theme', type:'Video', status:'coming', note:'For follow-up email — send the two minutes matching the session they attended.' },
        ]},
        { t:'callout', tone:'good', title:'Sending a recording is a follow-up motion',
          text:'Pair a clip with the engagement data from Salesforce: send the segment covering the session they actually attended, rather than the full keynote. It reads as attention rather than as a mailshot.' },
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
            a:'Take it to Sales Resources › Pricing &amp; commercials and give them the current, confirmed answer. A precise number a day later lands better than an approximate one in the moment.' },
          { q:'"Show me a partner who has actually done this."',
            a:'Use the EMEA MSP-to-MIP case study, registered under AI &amp; MIP › Partner use cases. It is a real transition with real numbers, which is what a sceptical partner is actually asking for.' },
        ]},
        { t:'callout', tone:'good', title:'Be precise about what is available today',
          text:'The strongest position in these conversations is specificity: what is live now, what is in pilot, and what is coming. Partners buy from people who know the difference, and precision on timing is what gets you the second meeting.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'ai-mip', title: 'AI & MIP', icon: 'spark',
  kicker: 'Theme 1',
  blurb: 'The Managed Intelligence Provider model, the strategic case behind it, and how to work with AI yourself.',
  owner: OWNERS.aigtm,
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
          text:'<strong>AIP</strong> — the Agentic Inflection Point, the strategic thesis. <strong>Agent Store</strong> — the Marketplace destination for agents. <strong>Managed Intelligence Services</strong> — the recurring service layer a partner wraps around agents.' },
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
        { t:'h', text:'Why the timing argument beats the technology argument' },
        { t:'p', text:'The market splits during this window: providers that stay on the traditional model end up competing on price, while those that move capture disproportionate value. The narrative is genuinely compelling — but inspiration without a deadline produces interest, not action. **Lead with the 2027 margin pressure, not with the agent demo.**' },
        { t:'callout', tone:'good', title:'This pattern has precedent — use it',
          text:'Salesforce ("No Software"), Microsoft ("Digital Transformation"), AWS ("Cloud for SMBs") and HubSpot ("Inbound Marketing") each named a shift, educated the ecosystem, and took the category. Partners who moved early in those cycles captured the value. It is a strong analogy in a sceptical conversation.' },
      ]},

    { id: 'use-cases', title: 'Partner use cases', summary: 'Proof points and the shapes that recur.',
      blocks: [
        { t:'p', text:'The EMEA case study is a real MSP-to-MIP transition, and it is the strongest single asset you have with a sceptical partner. More partner stories are in production as the pilot cohort progresses.' },
        { t:'assets', items:[
          { label:'EMEA MSP-to-MIP transition case study', type:'Doc', status:'coming', note:'The produced EMEA proof point.' },
        ]},
        { t:'h', text:'The shapes that recur' },
        { t:'cards', items:[
          { title:'Service-desk deflection', text:'Agents handling first-line triage and routine requests, with the partner governing escalation thresholds and reporting on deflection rate as the outcome sold.' },
          { title:'Back-office process automation', text:'Finance, onboarding and reporting workflows inside the client’s existing systems — usually the easiest first sale because the pain is already quantified in hours.' },
          { title:'Client-facing intelligence', text:'Agents surfacing insight to the client’s own customers or staff, sold as a capability the client could not build alone.' },
        ]},
        { t:'callout', tone:'good', title:'Have a partner with a story worth telling?',
          text:'If one of your partners has made this move, tell the AI Adoption / GTM team. Partner stories from your own region are the most persuasive asset in this whole programme, and yours may be the next one produced.' },
      ]},

    { id: 'working-with-ai', title: 'Working with AI', summary: 'Using AI in your own role.',
      blocks: [
        { t:'lead', text:'Separate from what we sell partners: how Pax8 people use AI in their own work. Reps who use AI daily sell the MIP story far more convincingly than reps who have only read about it.' },
        { t:'list', items:[
          'Approved tools and where they are licensed',
          'What may and may not be put into a prompt — partner data, commercial terms, personal data',
          'Prompt patterns that work for call prep, follow-up drafting and account research',
          'Where AI output should be checked before it reaches a partner',
        ]},
        { t:'assets', items:[
          { label:'EMEA AI usage framework', type:'Doc', status:'coming', note:'Required reading before using AI on partner-facing work.' },
        ]},
        { t:'callout', tone:'warn', title:'The one hard rule',
          text:'Never put partner-identifiable or commercially sensitive information into a tool that is not on the approved list. If you are unsure whether a tool is approved, treat it as not approved and ask.' },
      ]},

    { id: 'assets', title: 'Training assets & one-pagers', summary: 'The canonical MIP documents.',
      blocks: [
        { t:'p', text:'These are the canonical MIP documents — one registered version of each.' },
        { t:'assets', items:[
          { label:'AIP talk track &amp; FAQ', type:'Doc', status:'coming', note:'The short script. Highest-value asset if you have a call in an hour.' },
          { label:'MIP Program pilot battlecard', type:'One-pager', status:'coming', note:'What the field is actively using in conversation.' },
          { label:'MIP Playbook', type:'Doc', status:'coming' },
          { label:'Agentic Inflection Point (AIP) report', type:'Doc', status:'coming', note:'The strategic case, long-form. Read once, then work from the talk track.' },
          { label:'MIP readiness course', type:'Course', status:'coming' },
        ]},
      ]},

    { id: 'faqs', title: 'MIP FAQs', summary: 'What comes up most.',
      blocks: [
        { t:'faq', items:[
          { q:'Is MIP a product I can quote?',
            a:'No. MIP is a partner business model and a programme, not a SKU. What gets quoted are the underlying products and services — see Sales Resources › Pricing &amp; commercials.' },
          { q:'What is the play framework, and how many plays are there?',
            a:'The play structure is being finalised, so build your partner conversations on the Run It → Transform It → Scale It narrative and the three value drivers, which are confirmed and carry the conversation on their own. The structured play motion will follow underneath them.' },
          { q:'Who do I contact about the MIP programme?',
            a:'Programme and partner questions go to mip@pax8.com. Enablement and content questions go to the owning team named at the top of this page.' },
          { q:'A partner is interested but not ready for the pilot. What do I do with them?',
            a:'Keep them engaged with the readiness content and the keynote clips — the theme-specific cuts work well for this — and register the partner with the AI Adoption / GTM team so they are picked up as the programme widens.' },
          { q:'Where do I go if a partner asks something this hub does not answer?',
            a:'The owning team named at the top of the relevant page, or mip@pax8.com for programme questions. Asking in the shared channel rather than by DM means your colleagues get the answer too.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'mis', title: 'Managed Intelligence Services', icon: 'gear',
  kicker: 'Theme 2',
  blurb: 'The recurring service layer partners wrap around agents — what it is, why it is the margin story, and how to sell it.',
  owner: OWNERS.pmm,
  pages: [
    { id: 'what-it-is', title: 'What it is', summary: 'The difference between deploying an agent and managing one.',
      blocks: [
        { t:'lead', text:'Managed Intelligence Services is the managed, governed, recurring layer a partner puts around AI agents. Deploying an agent is a project with an end date. Managing one is a service with a monthly invoice.' },
        { t:'h', text:'What sits inside the service' },
        { t:'cards', items:[
          { title:'Monitoring', text:'Is the agent running, and is it still doing what it was deployed to do? Agent drift is real and clients cannot detect it themselves.' },
          { title:'Governance', text:'Access, permissions, data boundaries, audit trail and human-escalation thresholds. This is the part clients most underestimate and most need.' },
          { title:'Tuning', text:'Ongoing adjustment as the client’s process changes. An agent configured for last year’s workflow quietly stops fitting.' },
          { title:'Reporting', text:'Evidence of the outcome the client bought. Without this the service looks like a line item at renewal rather than a result.' },
        ]},
      ]},

    { id: 'why-it-matters', title: 'Why it matters', summary: 'This is where the recurring revenue is.',
      blocks: [
        { t:'p', text:'Agent deployment on its own is one-off project revenue, and it commoditises quickly — the second and third deployment are cheaper than the first, and the client eventually asks why. The service wrapper is what converts that into an annuity.' },
        { t:'numbered', items:[
          { title:'It is recurring by construction', text:'Monitoring, governance and reporting are continuous obligations. They do not have a natural end date, which is exactly what makes them contractable monthly.' },
          { title:'It defends the client relationship', text:'A partner who governs the client’s agents is structurally hard to remove. A partner who only deployed them is a completed project.' },
          { title:'It scales without linear headcount', text:'The same governance model applies across many clients, which is what makes the Scale It stage of the narrative real rather than aspirational.' },
        ]},
      ]},

    { id: 'use-cases', title: 'Partner use cases', summary: 'What a packaged service looks like.',
      blocks: [
        { t:'cards', items:[
          { title:'Tiered agent management', text:'Bronze/silver/gold style tiers by number of agents managed, response commitment and reporting depth — the model most partners already understand from managed services.' },
          { title:'Governance-only entry offer', text:'A low-friction first sale for clients who bought AI themselves and now have no oversight. Often the fastest way into an AI conversation with a sceptical client.' },
          { title:'Outcome-priced service', text:'Priced against the measured result — hours saved, tickets deflected, cycle time reduced. Higher ceiling, and it depends on the reporting layer being solid first.' },
        ]},
      ]},

    { id: 'assets', title: 'Assets & training', summary: 'Registered materials.',
      blocks: [
        { t:'assets', items:[
          { label:'Managed Intelligence Services one-pager', type:'One-pager', status:'coming' },
          { label:'Partner-facing service overview deck', type:'Deck', status:'coming' },
          { label:'Beyond breakout recording', type:'Video', status:'coming', note:'Registered under Event Overview › Agenda &amp; session recaps.' },
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
            a:'Take it to Sales Resources › Pricing &amp; commercials and come back with the confirmed position — pricing is the one area where a precise answer a day later beats an approximate one now.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'agent-store', title: 'Agent Store', icon: 'store',
  kicker: 'Theme 3',
  blurb: 'AI agents in the Pax8 Marketplace — discovery, procurement and lifecycle management where partners already buy.',
  owner: OWNERS.pmm,
  pages: [
    { id: 'what-it-is', title: 'What it is', summary: 'Agents, in the Marketplace.',
      blocks: [
        { t:'lead', text:'Agent Store is the addition to the Pax8 Marketplace for AI agents. Partners discover, procure and manage agents in the same place, on the same billing relationship and through the same procurement route they already use for everything else.' },
        { t:'h', text:'Why "in the Marketplace" is the whole point' },
        { t:'p', text:'The friction in AI adoption for a partner is rarely the technology — it is procurement, billing, vendor management and trust. Putting agents behind the Marketplace relationship removes four separate conversations from every agent a partner wants to try.' },
        { t:'callout', tone:'info', title:'Check the live catalogue before you commit',
          text:'The agent catalogue grows continuously. Work from the live catalogue rather than a list in a deck, so what you promise a partner matches what they will find when they log in.' },
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
          { title:'Trial before committing', text:'Testing an agent against a real internal process before offering it to clients. Low-risk, and it builds the partner’s own confidence — which is usually the real unlock.' },
          { title:'Standardising a client offer', text:'Picking a small set of agents the partner will deploy repeatedly, so delivery becomes a repeatable motion rather than bespoke each time.' },
          { title:'Filling a capability gap', text:'Meeting a specific client requirement without building or partnering separately.' },
        ]},
      ]},

    { id: 'assets', title: 'Assets & training', summary: 'Registered materials.',
      blocks: [
        { t:'assets', items:[
          { label:'Agent Store walkthrough video', type:'Video', status:'coming' },
          { label:'Agent Store overview one-pager', type:'One-pager', status:'coming' },
          { label:'Marketplace &amp; Agent Store training', type:'Course', status:'coming', note:'Also registered under Training &amp; Readiness › Marketplace training.' },
        ]},
      ]},

    { id: 'faqs', title: 'FAQs', summary: 'Common questions.',
      blocks: [
        { t:'faq', items:[
          { q:'Which agents are available?',
            a:'Work from the live catalogue rather than any list held in a deck. The catalogue grows continuously, so the live view is the only one that matches what your partner will see.' },
          { q:'How does billing work?',
            a:'Through the existing Marketplace billing relationship — no new vendor contract per agent. For rates and margin specifics, go to Sales Resources › Pricing &amp; commercials.' },
          { q:'Can a partner list their own agent in the store?',
            a:'Take this one to the AI Adoption / GTM team for the current position before answering — it is a frequent partner question and worth getting exactly right.' },
          { q:'What support does a partner get on an agent bought through the store?',
            a:'Check the current support model with the AI Adoption / GTM team before committing to a specific SLA in a partner conversation.' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'salesforce', title: 'Salesforce & Beyond Hub', icon: 'cloud',
  kicker: 'Systems',
  blurb: 'The dashboards where Beyond data lives: attendance, engagement, recommendations, opportunities and reporting.',
  owner: OWNERS.salesops,
  pages: [
    { id: 'dashboards', title: 'Dashboard overview', summary: 'Five dashboards, five different questions.',
      blocks: [
        { t:'lead', text:'The Beyond Hub in Salesforce is where event activity becomes something you can work. Each dashboard answers a different question — pick by question, not by habit.' },
        { t:'table', head:['Dashboard', 'Answers', 'Use it when'], rows:[
          ['Attendance Insights', 'Who came, from which partner, to what', 'Building a follow-up list or prioritising accounts'],
          ['Engagement Insights', 'What each attendee actually engaged with', 'Preparing for a specific call'],
          ['Recommendation Insights', 'What follow-up actions have been generated', 'Working your queue'],
          ['Opportunity Management', 'What pipeline has come out of Beyond', 'Forecasting and tracking conversion'],
          ['Reporting', 'How Beyond is performing overall', 'Reporting up, or reviewing team performance'],
        ]},
        { t:'callout', tone:'info', title:'Cannot see the Beyond Hub?',
          text:'Visibility depends on your Salesforce profile. Ask Sales Ops to add it rather than having a colleague export the data for you — an export goes out of date the moment it is sent, and the dashboards update continuously.' },
      ]},

    { id: 'attendance', title: 'Attendance Insights', summary: 'Who was there.',
      blocks: [
        { t:'p', text:'Attendance Insights is the base layer everything else builds on. It answers who registered, who attended, and which partner organisation they belong to.' },
        { t:'h', text:'What to do with it' },
        { t:'list', items:[
          'Filter to your own accounts first — the unfiltered view is not a work queue',
          'Separate attended from registered-but-did-not-attend; these are two different follow-up motions',
          'Look at how many people a partner sent — multiple attendees usually signals organisational interest rather than one curious individual',
          'Check which attendees are not yet contacts on the account record, and fix that before you start outreach',
        ]},
        { t:'callout', tone:'info', title:'Before you use a job title in outreach',
          text:'Registration details are self-entered by attendees, so titles and company names vary. Check the account record first — getting someone’s role right in the opening line is worth the extra thirty seconds.' },
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

    { id: 'recommendation-insights', title: 'Recommendation Insights', summary: 'Your follow-up, tracked.',
      blocks: [
        { t:'p', text:'Recommendation Insights shows the recommendations generated from Beyond activity, their status, and how they are progressing. What a recommendation is and how to work it is covered in **Recommendations & Follow-up** — this page is about the dashboard itself.' },
        { t:'list', items:[
          'Open recommendations by owner — your queue, and your team’s',
          'Ageing — how long recommendations have been open',
          'Outcome status — actioned, converted, dismissed, and the reason given',
          'Conversion into opportunities, which the Opportunity Management dashboard picks up',
        ]},
        { t:'callout', tone:'good', title:'Dismissing is a valid outcome',
          text:'A recommendation dismissed with a clear reason is good data — it tells the team which signals are worth generating. Keeping the queue accurate is what makes every number downstream worth acting on.' },
      ]},

    { id: 'opportunities', title: 'Opportunity Management', summary: 'Pipeline that came out of Beyond.',
      blocks: [
        { t:'p', text:'Opportunities generated from Beyond activity need to be identifiable as such — that attribution is what proves the event’s commercial return and funds the next one.' },
        { t:'steps', items:[
          { title:'Tag the opportunity to Beyond at creation', text:'Retrofitting attribution later rarely happens. Confirm the correct field and value with Sales Ops and use it consistently.' },
          { title:'Link it back to the recommendation', text:'This closes the loop between engagement data and revenue, and it is the only way to show which session content actually converts.' },
          { title:'Keep stage and close date honest', text:'Event-sourced pipeline gets looked at closely. Accurate dates are what make the Beyond numbers credible when they are reviewed.' },
          { title:'Record the loss reason', text:'Beyond-sourced losses tell Product Marketing which part of the narrative needs sharpening. That feedback loop only exists if the reason is captured.' },
        ]},
      ]},

    { id: 'reporting', title: 'Reporting guidance', summary: 'What to report, and to whom.',
      blocks: [
        { t:'p', text:'One set of numbers, from one place. A report built outside the Beyond Hub will diverge from it, and then the two get argued about instead of acted on.' },
        { t:'table', head:['Audience', 'What they need', 'Cadence'], rows:[
          ['Rep', 'My recommendations, my accounts, my ageing', 'Daily / weekly'],
          ['Sales leader', 'Team coverage, ageing, conversion rate', 'Weekly'],
          ['Regional leadership', 'Pipeline generated, conversion, theme performance', 'Monthly'],
          ['Events / Marketing', 'Engagement to pipeline attribution by session', 'Post-event and quarterly'],
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'recommendations', title: 'Recommendations & Follow-up', icon: 'target',
  kicker: 'Follow-up',
  blurb: 'What recommendations are, where to find them, how to action them, and what good follow-up looks like.',
  owner: OWNERS.salesops,
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
        { t:'callout', tone:'good', title:'Timeliness is the advantage',
          text:'A recommendation is valuable because it is current. "You attended our session on…" is a strong opener while the event is still fresh — which is why the queue is worth working weekly rather than in a batch.' },
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
        { t:'p', text:'Recommendations live in Salesforce, surfaced through the Beyond Hub. Working them there — rather than from an export — is what keeps your queue and the team’s view accurate.' },
        { t:'steps', items:[
          { title:'Open the Beyond Hub in Salesforce', text:'Covered under Salesforce &amp; Beyond Hub › Dashboard overview.' },
          { title:'Go to Recommendation Insights', text:'Filter to your own name to get your queue.' },
          { title:'Sort by age', text:'Oldest first. The engagement context is what makes the opener strong, and that is what fades.' },
          { title:'Work from the record', text:'Actioning in Salesforce is what updates the status, so the dashboard reflects what you have actually done.' },
        ]},
      ]},

    { id: 'how-to-action', title: 'How to action them', summary: 'The follow-up motion, end to end.',
      blocks: [
        { t:'steps', items:[
          { title:'Read the signal before you read the suggested action', text:'The suggestion is generated. The signal is the fact. If they conflict, trust the signal and use your judgement.' },
          { title:'Check the engagement detail', text:'Open Engagement Insights for that contact. You want to know which session, how long, and who else from that partner attended.' },
          { title:'Pick your material', text:'One clip and one asset that match what they engaged with. A follow-up that dumps ten links reads as automated.' },
          { title:'Make contact with the context in the first line', text:'Reference the specific session. "You spent time in the Agent Store session at Beyond" earns a reply; "following up on Beyond" does not.' },
          { title:'Update the status the same day', text:'Actioned, converted or dismissed with a reason. This is what makes your own queue — and your leader’s view of it — reflect reality.' },
          { title:'If it converts, link the opportunity', text:'See Salesforce &amp; Beyond Hub › Opportunity Management. Attribution has to be set at creation.' },
        ]},
        { t:'callout', tone:'good', title:'The 48-hour rule of thumb',
          text:'Recommendations actioned within two working days convert materially better than those left to sit. If you are not going to work one, dismiss it with a reason — that keeps your queue focused on what you will actually do.' },
      ]},

    { id: 'walkthrough', title: 'Salesforce walkthrough', summary: 'Click-by-click.',
      blocks: [
        { t:'p', text:'A recorded walkthrough is the fastest way to learn this end to end.' },
        { t:'assets', items:[
          { label:'Recommendation flow — recorded walkthrough', type:'Video', status:'coming', note:'Covers finding your queue, reading engagement detail, and actioning correctly.' },
          { label:'Recommendation flow — step-by-step guide', type:'Doc', status:'coming' },
        ]},
      ]},

    { id: 'workflows', title: 'Example workflows', summary: 'Three worked examples.',
      blocks: [
        { t:'cards', items:[
          { title:'Attended a session, no open opportunity', text:'Signal: attended the Agent Store session, no pipeline on the account. Action: send the Agent Store clip plus the one-pager, offer a 20-minute walkthrough. Log as actioned the same day. Convert when they agree to the call — not when you send the email.' },
          { title:'Multiple attendees from one partner', text:'Signal: three people from one partner across three themes. Action: this is a leadership conversation. Go to the partner’s decision maker with a business-model framing, not a product follow-up. Involve your sales leader before making contact.' },
          { title:'Registered, did not attend', text:'Signal: registered for a theme, no attendance. Action: acknowledge it plainly and send the fifteen-minute cut of what they missed. Low effort, and it converts more often than most people assume.' },
        ]},
      ]},

    { id: 'dashboards', title: 'Dashboards', summary: 'Where to watch performance.',
      blocks: [
        { t:'p', text:'Recommendation performance is tracked in Recommendation Insights, documented under **Salesforce & Beyond Hub › Recommendation Insights**.' },
        { t:'list', items:[
          'Open recommendations by owner, and ageing',
          'Action rate — how much of the queue is being worked',
          'Conversion rate — how many become opportunities',
          'Dismissal reasons, which sharpen the recommendations themselves over time',
        ]},
      ]},

    { id: 'success-stories', title: 'Success stories', summary: 'What worked, from the people who did it.',
      blocks: [
        { t:'lead', text:'The most useful follow-up guidance comes from the field. When a Beyond recommendation turns into pipeline, the specifics of what you sent and what came back are worth more to your colleagues than any template.' },
        { t:'callout', tone:'good', title:'Send yours in',
          text:'Two paragraphs is enough: the signal you worked from, what you sent, and what the partner said back. Send it to the Revenue Enablement team and it goes to the rest of the region.' },
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'readiness', title: 'Training & Readiness', icon: 'book',
  kicker: 'Enablement',
  blurb: 'Pre- and post-event learning, readiness decks, recorded sessions, facilitator assets and marketplace training.',
  owner: OWNERS.enablement,
  pages: [
    { id: 'overview', title: 'Readiness overview', summary: 'How the programme is structured.',
      blocks: [
        { t:'lead', text:'Beyond readiness runs in two halves. Pre-event readiness got people to the event able to have a conversation. Post-event readiness — the half that is live now — turns the announcements into something you can sell and partners can buy.' },
        { t:'numbered', items:[
          { title:'Know the story', text:'The Beyond narrative and the four themes. Everyone in a partner-facing role needs this. Roughly 30 minutes.' },
          { title:'Know the systems', text:'Beyond Hub, recommendations, dashboards. Needed by anyone working follow-up. Roughly 45 minutes including the walkthrough.' },
          { title:'Know the commercials', text:'Pricing, packaging and what you can commit to. Worth doing before a partner pricing conversation.' },
          { title:'Practise it', text:'Facilitated sessions with objection handling, run by team leaders using the facilitator assets.' },
        ]},
      ]},

    { id: 'pre-event', title: 'Pre-event learning', summary: 'Still the best short introduction.',
      blocks: [
        { t:'p', text:'The pre-event material is kept available because it remains the clearest short introduction to the four themes — particularly useful if you joined after the event.' },
        { t:'assets', items:[
          { label:'Beyond readiness training (pre-event)', type:'Course', status:'coming' },
          { label:'Pre-event readiness deck', type:'Deck', status:'coming' },
        ]},
      ]},

    { id: 'post-event', title: 'Post-event learning', summary: 'The live programme.',
      blocks: [
        { t:'p', text:'This is the active readiness track: what was announced, how to talk about it, and how to work the follow-up.' },
        { t:'assets', items:[
          { label:'Post-Beyond sales training', type:'Course', status:'coming', note:'The narrative, the themes, objection handling and partner conversations.' },
          { label:'Live session schedule', type:'Page', status:'coming', note:'Dates for the facilitated sessions.' },
          { label:'Recommendation flow training', type:'Course', status:'coming' },
          { label:'Salesforce dashboards training', type:'Course', status:'coming' },
        ]},
      ]},

    { id: 'decks-recordings', title: 'Readiness decks & recorded sessions', summary: 'For self-serve and for reference.',
      blocks: [
        { t:'p', text:'Every live readiness session is recorded, so you can pick up anything you missed without waiting for the next run.' },
        { t:'assets', items:[
          { label:'Beyond readiness deck', type:'Deck', status:'coming', note:'The current version — always link to it here rather than keeping a local copy, so you are presenting the latest.' },
          { label:'Recorded readiness sessions', type:'Video', status:'coming' },
        ]},
      ]},

    { id: 'facilitator', title: 'Facilitator assets', summary: 'For anyone running a session.',
      blocks: [
        { t:'p', text:'Team leaders and enablement partners running Beyond sessions can use these rather than building their own, so every team gets the same version of the story.' },
        { t:'assets', items:[
          { label:'Facilitator guide', type:'Doc', status:'coming', note:'Session flow, timings and discussion prompts.' },
          { label:'Facilitator deck, annotated', type:'Deck', status:'coming' },
          { label:'Role-play scenarios', type:'Doc', status:'coming', note:'Built from the objection handling in Beyond Story.' },
        ]},
      ]},

    { id: 'marketplace-training', title: 'Marketplace training', summary: 'Platform skills, including Agent Store.',
      blocks: [
        { t:'p', text:'Marketplace and Agent Store training is the practical counterpart to the Agent Store narrative — being able to navigate the store is what lets you walk a partner through it live.' },
        { t:'assets', items:[
          { label:'Marketplace training', type:'Course', status:'coming' },
          { label:'Agent Store walkthrough', type:'Video', status:'coming', note:'Registered under Agent Store › Assets &amp; training.' },
        ]},
      ]},

    { id: 'rec-walkthroughs', title: 'Recommendation walkthroughs', summary: 'Learning the follow-up motion.',
      blocks: [
        { t:'p', text:'The walkthrough content sits under **Recommendations & Follow-up › Salesforce walkthrough**, linked from here so it can be found from the training track.' },
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
  owner: OWNERS.salesldr,
  pages: [
    { id: 'sales-process', title: 'Sales process & recommendation flow', summary: 'Where Beyond fits in the existing process.',
      blocks: [
        { t:'lead', text:'Beyond does not introduce a separate sales process. It adds a new source of qualified activity at the top of the one you already run, plus a narrative that changes what the early conversations are about.' },
        { t:'steps', items:[
          { title:'Signal', text:'The partner does something at or after Beyond — attends a session, engages with content. Captured in Engagement Insights.' },
          { title:'Recommendation', text:'A suggested follow-up action is generated with the signal attached, and appears in your queue in the Beyond Hub.' },
          { title:'Contact', text:'You make contact using the specific context, with material matched to what they engaged with.' },
          { title:'Qualify', text:'Standard qualification. The Beyond context tells you where to start, not whether the deal is real.' },
          { title:'Opportunity', text:'Created and attributed to Beyond at the point of creation, and linked back to the recommendation.' },
          { title:'Close and feed back', text:'Win or loss reason captured — which is what sharpens the narrative for everyone next quarter.' },
        ]},
        { t:'callout', tone:'info', title:'Treat them as top-of-funnel, not a side process',
          text:'Recommendations work best inside your normal pipeline hygiene rather than as a separate list kept alongside it.' },
      ]},

    { id: 'pricing', title: 'Pricing & commercials', summary: 'Where the confirmed numbers live.',
      blocks: [
        { t:'lead', text:'Commercial terms are the one area where precision matters more than speed. Everything confirmed lives here, and anything non-standard has a route.' },
        { t:'list', items:[
          'Current pricing and packaging for the products behind the Beyond announcements',
          'Margin and commercial terms for partners',
          'Agent Store billing mechanics',
          'What you can commit to in a conversation, and what needs approval first',
          'The route for a non-standard commercial request',
        ]},
        { t:'assets', items:[
          { label:'Beyond commercial summary', type:'Doc', status:'coming' },
          { label:'Agent Store pricing and billing', type:'Doc', status:'coming' },
        ]},
        { t:'callout', tone:'info', title:'If it is not confirmed here, come back with it',
          text:'Take the question to the Pricing &amp; Commercial team and give the partner the precise answer. A confirmed number a day later builds more confidence than an approximate one in the moment.' },
      ]},

    { id: 'leadership', title: 'Sales leadership resources', summary: 'For managing the follow-up, not doing it.',
      blocks: [
        { t:'p', text:'Leaders need a different view: coverage, ageing, conversion and where coaching helps most.' },
        { t:'cards', items:[
          { title:'Coverage', text:'Are all recommendations owned, and is the distribution across the team sensible? Unowned recommendations are the most common leak.' },
          { title:'Ageing', text:'How long are recommendations open? Ageing is the earliest visible signal that follow-up needs attention.' },
          { title:'Conversion', text:'Action rate versus conversion rate. A high action rate with lower conversion usually means the material is not matching the signal.' },
          { title:'Coaching', text:'Dismissal reasons and loss reasons show which part of the narrative a rep would benefit from practising.' },
        ]},
        { t:'assets', items:[
          { label:'Team review agenda template', type:'Doc', status:'coming' },
        ]},
      ]},

    { id: 'collateral', title: 'Collateral library', summary: 'Everything partner-facing, in one list.',
      blocks: [
        { t:'p', text:'Cleared partner-facing material, in one place, so you are always sending the current version.' },
        { t:'assets', items:[
          { label:'Beyond announcement one-pager', type:'One-pager', status:'coming' },
          { label:'AI &amp; MIP partner deck', type:'Deck', status:'coming' },
          { label:'Agent Store one-pager', type:'One-pager', status:'coming' },
          { label:'Managed Intelligence Services one-pager', type:'One-pager', status:'coming' },
          { label:'Keynote partner-shareable cut', type:'Video', status:'coming', note:'Registered under Beyond Story › Keynote recordings.' },
          { label:'EMEA case study', type:'Doc', status:'coming' },
        ]},
      ]},
  ]
},

/* ========================================================================== */
{
  id: 'faqs', title: 'FAQs', icon: 'help',
  kicker: 'Answers',
  blurb: 'The questions that come up most, split by who is asking.',
  owner: OWNERS.enablement,
  pages: [
    { id: 'top', title: 'Top questions', summary: 'Start here.',
      blocks: [
        { t:'faq', items:[
          { q:'Where do I find my Beyond follow-up?',
            a:'Recommendation Insights in the Beyond Hub in Salesforce. See Recommendations &amp; Follow-up › Where to find them.' },
          { q:'What is the difference between MIP, Agent Store and Managed Intelligence Services?',
            a:'MIP is the partner business model. Agent Store is where agents are bought. Managed Intelligence Services is the recurring service a partner wraps around those agents. Model, supply, service — in that order.' },
          { q:'Is there a single deck I can present to a partner?',
            a:'Use the partner-facing decks under Sales Resources › Collateral library — they are the cleared, current versions.' },
          { q:'Something here does not match what I have been told. Who do I tell?',
            a:'The owning team named at the top of that page. That is exactly the feedback that keeps this accurate.' },
          { q:'How do I find something quickly?',
            a:'Press <kbd>/</kbd> anywhere on the site. It searches every page and every registered asset at once.' },
        ]},
      ]},

    { id: 'partner', title: 'Partner-facing questions', summary: 'What partners actually ask.',
      blocks: [
        { t:'p', text:'These are answers you can give directly. Where an answer says come back with it, that is a question worth being exact on.' },
        { t:'faq', items:[
          { q:'"Do I have to become an MIP?"',
            a:'No. It is a direction of travel, not a mandate, and there is no switch to flip. What is worth taking seriously is the margin pressure on the traditional model over the next two years — that is the reason to start, and it applies whether or not the label is adopted.' },
          { q:'"When can I get access to Agent Store?"',
            a:'Check the current position with the AI Adoption / GTM team so the date you give is the one that holds.' },
          { q:'"What does it cost?"',
            a:'Sales Resources › Pricing &amp; commercials has the confirmed position. If your specific case is not covered, take it to the Pricing &amp; Commercial team and come back with the exact answer.' },
          { q:'"Who else has done this successfully?"',
            a:'Use the EMEA MSP-to-MIP case study under AI &amp; MIP › Partner use cases — a real transition is the strongest answer to this question.' },
          { q:'"What support do I get?"',
            a:'Programme questions go to mip@pax8.com. For a specific support commitment, confirm with the AI Adoption / GTM team before putting it in writing.' },
        ]},
      ]},

    { id: 'internal', title: 'Internal & process questions', summary: 'How things work here.',
      blocks: [
        { t:'faq', items:[
          { q:'I cannot see the Beyond Hub in Salesforce.',
            a:'It is a profile permission — ask Sales Ops to add it. Working from the live dashboard rather than someone else’s export is what keeps your queue accurate.' },
          { q:'My training completion is not showing.',
            a:'Let the Revenue Enablement team know rather than retaking the course — they can correct the record directly.' },
          { q:'I have an older version of a deck saved locally. Should I use it?',
            a:'Link to the version in the Collateral library instead. It is the cleared, current one, and it changes as the programme develops.' },
          { q:'How current is this hub?',
            a:'Each section has an owning team and a standing review cycle, shown at the top of every page. If something looks out of date, telling that team is the fastest way to fix it.' },
          { q:'Can I get something added?',
            a:'Yes — see Getting Started › Suggesting content.' },
        ]},
      ]},

    { id: 'ask', title: 'Ask a question', summary: 'When it is not here.',
      blocks: [
        { t:'lead', text:'If you cannot find an answer, ask in a way that gets everyone the answer — not just you.' },
        { t:'steps', items:[
          { title:'Search the hub first', text:'Press / and search. It often sits under a different heading than you expected.' },
          { title:'Go to the section owner', text:'The page nearest your question names an owning team in its header. That is who to ask.' },
          { title:'Ask in the shared channel', text:'Rather than by DM, so your colleagues get the answer too and it can be added here.' },
          { title:'Programme questions go to mip@pax8.com', text:'For MIP programme and partner escalations.' },
        ]},
      ]},
  ]
},

];

/* Expose for the renderer. */
window.SITE = SITE;
window.OWNERS = OWNERS;
