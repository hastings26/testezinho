/* =============================================================================
   BEYOND 2026 — INTERNAL BACKLOG (LEADERSHIP ONLY)
   -----------------------------------------------------------------------------
   NOT PUBLISHED. This file is excluded from the site deploy and is never
   loaded by beyond/index.html, so nothing in it reaches a CAM's browser.

   It holds the three things deliberately kept out of the field-facing hub:
     1. Owner assignments still to be made
     2. Content that does not exist yet, or has no URL registered
     3. Open decisions the field is currently working around

   When an item here is resolved, move it into `beyond/content.js` as a normal
   registered asset with a live `href`, and delete the entry from this file.
   ========================================================================== */

const BACKLOG = {
  updated: '2026-08-27',

  /* ---------------------------------------------------------------------- */
  editorialLine: [
    'The field-facing hub shows only content that exists or is genuinely imminent. Everything else is here, not there.',
    'Items marked "coming" in the published hub are limited to things a CAM would otherwise go hunting for elsewhere — a training date, a walkthrough, a recording. It is not a roadmap of everything in production.',
    'Where a decision is genuinely open, the hub tells the field what IS confirmed and what to build the conversation on, rather than naming the gap. The MIP play framework is the worked example: the field is pointed at the narrative and the value drivers, which are settled.',
    'No review dates, owner names or completeness metrics appear in the published hub. Section headers name the owning TEAM only, framed as who to contact.',
    'Event attendance and pipeline figures are omitted entirely rather than shown as TBC.',
  ],

  /* ---------------------------------------------------------------------- */
  owners: [
    { team: 'Revenue Enablement — EMEA', named: null, cadence: 'Monthly', reviewed: '2026-08-27',
      sections: ['Getting Started', 'Training & Readiness', 'FAQs'] },
    { team: 'Product Marketing', named: null, cadence: 'Monthly', reviewed: '2026-08-27',
      sections: ['Beyond Story', 'Managed Intelligence Services', 'Agent Store'] },
    { team: 'Sales Ops / Salesforce', named: null, cadence: 'Monthly', reviewed: '2026-08-27',
      sections: ['Salesforce & Beyond Hub', 'Recommendations & Follow-up'] },
    { team: 'AI Adoption / GTM', named: null, contact: 'mip@pax8.com', cadence: 'Monthly', reviewed: '2026-08-27',
      sections: ['AI & MIP'] },
    { team: 'Events / Field Marketing', named: null, cadence: 'Quarterly', reviewed: '2026-08-27',
      sections: ['Event Overview'] },
    { team: 'Sales Leadership — EMEA', named: null, cadence: 'Monthly', reviewed: '2026-08-27',
      sections: ['Sales Resources'] },
    { team: 'Pricing & Commercial', named: null, cadence: 'Monthly', reviewed: '2026-08-27',
      sections: ['Sales Resources › Pricing & commercials'] },
  ],

  /* ---------------------------------------------------------------------- */
  /* P1 blocks field work now · P2 needed this quarter · P3 improves quality */
  items: [
    /* --- P1: the field is actively working around these ------------------ */
    { p:'P1', label:'Beyond commercial summary', type:'Doc', owner:'Pricing & Commercial',
      where:'Sales Resources › Pricing & commercials', shown:true,
      note:'Most common escalation reason. Until it exists, every pricing question becomes a manual round trip.' },
    { p:'P1', label:'Agent Store pricing and billing', type:'Doc', owner:'Pricing & Commercial',
      where:'Sales Resources › Pricing & commercials', shown:true },
    { p:'P1', label:'Recommendation flow — recorded walkthrough', type:'Video', owner:'Sales Ops / Salesforce',
      where:'Recommendations › Salesforce walkthrough', shown:true,
      note:'Highest-demand asset in the hub. Directly gates follow-up quality in the conversion window.' },
    { p:'P1', label:'AIP talk track & FAQ', type:'Doc', owner:'Product Marketing',
      where:'AI & MIP › Training assets', shown:true,
      note:'The short script — the single most useful asset for a CAM with a call in an hour.' },
    { p:'P1', label:'MIP Program pilot battlecard', type:'One-pager', owner:'Product Marketing',
      where:'AI & MIP › Training assets', shown:true },
    { p:'P1', label:'EMEA MSP-to-MIP case study', type:'Doc', owner:'Product Marketing',
      where:'AI & MIP › Partner use cases', shown:true,
      note:'The only produced EMEA proof point. The hub leans on it in objection handling — it needs to be reachable.' },
    { p:'P1', label:'Beyond Hub dashboard URL', type:'Dashboard', owner:'Sales Ops / Salesforce',
      where:'Salesforce & Beyond Hub › Dashboard overview', shown:false,
      note:'No URL registered. The hub describes the dashboards but cannot link to them.' },
    { p:'P1', label:'Dashboard access request route', type:'Page', owner:'Sales Ops / Salesforce',
      where:'Salesforce & Beyond Hub › Dashboard overview', shown:false,
      note:'Referenced as "ask Sales Ops" in the published copy because no self-serve route exists.' },

    /* --- P2: needed this quarter ---------------------------------------- */
    { p:'P2', label:'Main stage keynote recording', type:'Video', owner:'Events', where:'Beyond Story › Keynote recordings', shown:true },
    { p:'P2', label:'Keynote partner-shareable cut', type:'Video', owner:'Product Marketing', where:'Beyond Story › Keynote recordings', shown:true },
    { p:'P2', label:'Keynote highlight clips by theme', type:'Video', owner:'Product Marketing', where:'Beyond Story › Keynote recordings', shown:true,
      note:'The follow-up motion in Recommendations assumes these exist.' },
    { p:'P2', label:'AI & MIP breakout recording', type:'Video', owner:'Events', where:'Event Overview › Agenda & session recaps', shown:true },
    { p:'P2', label:'Agent Store breakout recording', type:'Video', owner:'Events', where:'Event Overview › Agenda & session recaps', shown:true },
    { p:'P2', label:'Managed Intelligence Services breakout recording', type:'Video', owner:'Events', where:'Event Overview › Agenda & session recaps', shown:true },
    { p:'P2', label:'Beyond announcement one-pager', type:'One-pager', owner:'Product Marketing', where:'Event Overview › What was announced', shown:true },
    { p:'P2', label:'Approved messaging one-pager', type:'One-pager', owner:'Product Marketing', where:'Beyond Story › Announcement summaries', shown:true },
    { p:'P2', label:'Post-event follow-up email templates', type:'Doc', owner:'Revenue Enablement', where:'Beyond Story › Announcement summaries', shown:true },
    { p:'P2', label:'Post-Beyond sales training', type:'Course', owner:'Revenue Enablement', where:'Training & Readiness › Post-event learning', shown:true },
    { p:'P2', label:'Live session schedule', type:'Page', owner:'Revenue Enablement', where:'Training & Readiness › Post-event learning', shown:true },
    { p:'P2', label:'Recommendation flow training', type:'Course', owner:'Sales Ops / Salesforce', where:'Training & Readiness › Post-event learning', shown:true },
    { p:'P2', label:'Salesforce dashboards training', type:'Course', owner:'Sales Ops / Salesforce', where:'Training & Readiness › Post-event learning', shown:true },
    { p:'P2', label:'Marketplace & Agent Store training', type:'Course', owner:'Revenue Enablement', where:'Training & Readiness › Marketplace training', shown:true },
    { p:'P2', label:'Agent Store walkthrough video', type:'Video', owner:'Product Marketing', where:'Agent Store › Assets & training', shown:true },
    { p:'P2', label:'EMEA AI usage framework', type:'Doc', owner:'Revenue Enablement', where:'AI & MIP › Working with AI', shown:true,
      note:'The hub states a hard rule about approved tooling but cannot link to the framework defining it.' },
    { p:'P2', label:'Approved internal AI tooling list', type:'Page', owner:'Revenue Enablement', where:'AI & MIP › Working with AI', shown:false },
    { p:'P2', label:'AI & MIP partner deck', type:'Deck', owner:'Product Marketing', where:'Sales Resources › Collateral library', shown:true },
    { p:'P2', label:'Agent Store one-pager', type:'One-pager', owner:'Product Marketing', where:'Agent Store › Assets & training', shown:true },
    { p:'P2', label:'Managed Intelligence Services one-pager', type:'One-pager', owner:'Product Marketing', where:'MIS › Assets & training', shown:true },
    { p:'P2', label:'Partner-facing service overview deck', type:'Deck', owner:'Product Marketing', where:'MIS › Assets & training', shown:true },
    { p:'P2', label:'Beyond readiness deck (current version)', type:'Deck', owner:'Revenue Enablement', where:'Training & Readiness › Decks & recordings', shown:true },
    { p:'P2', label:'Recorded readiness sessions', type:'Video', owner:'Revenue Enablement', where:'Training & Readiness › Decks & recordings', shown:true },
    { p:'P2', label:'Facilitator guide', type:'Doc', owner:'Revenue Enablement', where:'Training & Readiness › Facilitator assets', shown:true },
    { p:'P2', label:'Facilitator deck, annotated', type:'Deck', owner:'Revenue Enablement', where:'Training & Readiness › Facilitator assets', shown:true },
    { p:'P2', label:'Role-play scenarios', type:'Doc', owner:'Revenue Enablement', where:'Training & Readiness › Facilitator assets', shown:true },
    { p:'P2', label:'MIP Playbook', type:'Doc', owner:'Product Marketing', where:'AI & MIP › Training assets', shown:true },
    { p:'P2', label:'MIP readiness course', type:'Course', owner:'Revenue Enablement', where:'AI & MIP › Training assets', shown:true },
    { p:'P2', label:'Beyond reporting definitions', type:'Doc', owner:'Sales Ops / Salesforce', where:'Salesforce › Reporting guidance', shown:false,
      note:'Agreed definitions for actioned / converted / attributed. Without these the leadership numbers get argued about.' },
    { p:'P2', label:'Recommendation status & field definitions', type:'Doc', owner:'Sales Ops / Salesforce', where:'Recommendations › Salesforce walkthrough', shown:false },

    /* --- P3: improves quality ------------------------------------------- */
    { p:'P3', label:'Agentic Inflection Point (AIP) report', type:'Doc', owner:'Product Marketing', where:'AI & MIP › Training assets', shown:true },
    { p:'P3', label:'Keynote recap deck', type:'Deck', owner:'Product Marketing', where:'Event Overview › What was announced', shown:true },
    { p:'P3', label:'Session-by-session written recaps', type:'Doc', owner:'Product Marketing', where:'Event Overview › Agenda & session recaps', shown:false },
    { p:'P3', label:'Full Beyond 2026 agenda', type:'Page', owner:'Events', where:'Event Overview › Agenda & session recaps', shown:false },
    { p:'P3', label:'Additional EMEA proof points', type:'Doc', owner:'Product Marketing', where:'AI & MIP › Partner use cases', shown:false,
      note:'The hub now asks CAMs to nominate partner stories. Expect inbound — there must be a route to receive it.' },
    { p:'P3', label:'Use-case library by vertical', type:'Doc', owner:'Product Marketing', where:'AI & MIP › Partner use cases', shown:false },
    { p:'P3', label:'Prompt library for revenue teams', type:'Doc', owner:'Revenue Enablement', where:'AI & MIP › Working with AI', shown:false },
    { p:'P3', label:'MIS service-design guide', type:'Doc', owner:'Product Marketing', where:'MIS › Partner use cases', shown:false },
    { p:'P3', label:'Example service tier structures', type:'Doc', owner:'Product Marketing', where:'MIS › Partner use cases', shown:false },
    { p:'P3', label:'MIS pricing guidance', type:'Doc', owner:'Pricing & Commercial', where:'MIS › Assets & training', shown:false },
    { p:'P3', label:'Commercial escalation route', type:'Page', owner:'Pricing & Commercial', where:'Sales Resources › Pricing & commercials', shown:false },
    { p:'P3', label:'Leadership dashboard view', type:'Dashboard', owner:'Sales Ops / Salesforce', where:'Sales Resources › Leadership', shown:false },
    { p:'P3', label:'Leadership reporting pack template', type:'Deck', owner:'Sales Leadership', where:'Salesforce › Reporting guidance', shown:false },
    { p:'P3', label:'Team review agenda template', type:'Doc', owner:'Sales Leadership', where:'Sales Resources › Leadership', shown:true },
    { p:'P3', label:'Coaching guide — Beyond conversations', type:'Doc', owner:'Revenue Enablement', where:'Sales Resources › Leadership', shown:false },
    { p:'P3', label:'Beyond follow-up success stories', type:'Doc', owner:'Revenue Enablement', where:'Recommendations › Success stories', shown:false,
      note:'The page now solicits these from the field rather than sitting empty. Needs somewhere for them to land.' },
    { p:'P3', label:'Beyond questions channel', type:'Page', owner:'Revenue Enablement', where:'FAQs › Ask a question', shown:false,
      note:'The hub tells CAMs to ask in "the shared channel". That channel needs naming.' },
    { p:'P3', label:'Content gap request form', type:'Page', owner:'Revenue Enablement', where:'FAQs › Ask a question', shown:false },
    { p:'P3', label:'Beyond readiness training (pre-event)', type:'Course', owner:'Revenue Enablement', where:'Training & Readiness › Pre-event', shown:true },
    { p:'P3', label:'Pre-event readiness deck', type:'Deck', owner:'Revenue Enablement', where:'Training & Readiness › Pre-event', shown:true },
    { p:'P3', label:'Theme primers', type:'Doc', owner:'Revenue Enablement', where:'Training & Readiness › Pre-event', shown:false },
    { p:'P3', label:'Current agent catalogue link', type:'Page', owner:'Product Marketing', where:'Agent Store › Assets & training', shown:false,
      note:'The hub repeatedly tells CAMs to "work from the live catalogue" but cannot link to it.' },
    { p:'P3', label:'Conversational solution builder overview', type:'Doc', owner:'Product Marketing', where:'Agent Store › Assets & training', shown:false },
    { p:'P3', label:'Press and partner comms pack', type:'Doc', owner:'Product Marketing', where:'Event Overview › What was announced', shown:false },
    { p:'P3', label:'Beyond SharePoint resources (legacy)', type:'Page', owner:'Revenue Enablement', where:'Training & Readiness › Decks & recordings', shown:false,
      note:'Legacy location. Needs reviewing for duplicates and retiring into this hub rather than running alongside it.' },
  ],

  /* ---------------------------------------------------------------------- */
  decisions: [
    { title:'MIP play framework — 5 plays, 6 plays, or a different set',
      detail:'The Playbook, the pilot battlecard and the AIP report present different sets, and one uses "Transform" where another uses "Discover". Not reconciled.',
      owner:'AI Adoption / GTM with Product Marketing',
      fieldImpact:'The published hub routes around this: it tells the field to build conversations on Run It → Transform It → Scale It and the three value drivers, and says the play structure "is being finalised". That holds for now, but reps in longer partner engagements will ask.' },

    { title:'Event figures — attendance and recommendations generated',
      detail:'No signed-off post-event dataset. Numbers were removed from the hub entirely rather than published as TBC.',
      owner:'Events with Sales Ops',
      fieldImpact:'Event Overview currently makes a qualitative case only. Any leadership deck quoting Beyond numbers is drawing from somewhere other than this hub.' },

    { title:'Agent Store — current availability and catalogue coverage',
      detail:'Position moved through 2026 from early access towards GA. Current state not documented anywhere the field can reach.',
      owner:'AI Adoption / GTM',
      fieldImpact:'The hub tells CAMs to confirm before committing to a date. That is defensible once, but it is a recurring partner question and the round trip is visible to the partner.' },

    { title:'Agent Store — can a partner list their own agent',
      detail:'Policy not documented. Frequent partner question.',
      owner:'AI Adoption / GTM',
      fieldImpact:'Currently routed to the GTM team as a per-case question.' },

    { title:'Agent Store — support model for agents bought through the store',
      detail:'No documented SLA or support boundary.',
      owner:'AI Adoption / GTM',
      fieldImpact:'CAMs are told not to commit to a specific SLA. This will block deals at contract stage, not at first conversation.' },

    { title:'LMS completion tracking for MIP training',
      detail:'Completions have not been recording reliably.',
      owner:'Revenue Enablement',
      fieldImpact:'Kept out of the published hub as a "known issue". The FAQ now reads as a normal admin correction route rather than a broken system. Genuine fix still needed, and completion data cannot currently evidence readiness to leadership.' },

    { title:'No pre-MIP nurture track for partners not ready for the pilot',
      detail:'No formal track exists between "interested" and "pilot ready".',
      owner:'AI Adoption / GTM with Revenue Enablement',
      fieldImpact:'The hub tells CAMs to keep them warm with readiness content and register them with GTM. That is a holding pattern, not a motion.' },

    { title:'Proof-point library depth',
      detail:'One produced EMEA case study. The hub leans on it in objection handling.',
      owner:'Product Marketing',
      fieldImpact:'The published hub now asks CAMs to nominate partner stories from their own patch, which should generate candidates — but there is no intake route defined to receive them.' },

    { title:'Legacy Beyond SharePoint locations',
      detail:'Still live alongside this hub. Duplicates not yet reviewed or retired.',
      owner:'Revenue Enablement',
      fieldImpact:'Until they are retired or redirected, the single-source-of-truth claim is aspirational — a CAM can still land on an older deck from search.' },

    { title:'Named section owners',
      detail:'All seven owning teams are teams, not people. No individual is accountable for a review.',
      owner:'Revenue Enablement to assign',
      fieldImpact:'None visible to the field — the hub shows team names framed as a contact route. But nothing triggers a review, so accuracy decays silently.' },
  ],
};

if (typeof window !== 'undefined') window.BACKLOG = BACKLOG;
