/* ============================================================================
   LINK TABLE — the only file you need to edit to connect real content.
   ----------------------------------------------------------------------------
   HOW TO USE THIS FILE

   1. Send the link inventory to the content owner (Marco). Every line below is
      one thing that needs a URL.
   2. Paste each URL between the quotes on the matching line. Nothing else
      changes — not the pages, not the code.
   3. Leave a line as '' if you do not have the URL yet. The prototype keeps
      showing a visible placeholder for it and counts it as outstanding.
   4. Write 'TBC' where the document does not exist yet and has to be created.
      The prototype then shows it as 'to be created' rather than 'missing', so
      the two problems never get confused.

   Open the Link Inventory page in the prototype at any time to see exactly
   what is connected, what is outstanding and what still has to be written.

   Slots are shared where the thing is shared: one dashboard used by four
   topics is ONE line here, so you are never asked for the same URL twice.
   ========================================================================= */

const LINKS = {

  /* ────────────────────────────────────────────────────────────────────────
     SLACK ASSISTANT  (1)
     ──────────────────────────────────────────────────────────────────────── */

  // Slack assistant deep link
  'GLOBAL/slack': '',

  /* ────────────────────────────────────────────────────────────────────────
     CANONICAL SOURCES  (19)
     ──────────────────────────────────────────────────────────────────────── */

  // MIP Playbook (placeholder — see conflict note)
  'MIP-001/canonical': '',

  // Agentic Inflection Point Report (placeholder)
  'MIP-002/canonical': '',

  // Agent Store Positioning Note (placeholder)
  'MIP-003/canonical': '',

  // Farmers Programme Standard (placeholder)
  'PRG-001/canonical': '',

  // Hunters Programme Standard (placeholder)
  'PRG-002/canonical': '',

  // Onboarding Standard and Checklist (placeholder)
  'PRG-003/canonical': '',

  // Pipeline Management Standard — EMEA (placeholder)
  'SF-001/canonical': '',

  // Opportunity Management Standard — EMEA (placeholder)
  'SF-002/canonical': '',

  // EMEA Forecast Standard (placeholder)
  'SF-003/canonical': '',

  // Vendor Opportunity Process Standard (placeholder)
  'SF-004/canonical': '',

  // EMEA Stage Definition Standard (placeholder)
  'SF-005/canonical': '',

  // Activity Logging Standard (placeholder)
  'SF-006/canonical': '',

  // Salesforce Data Standards (placeholder)
  'SF-007/canonical': '',

  // Approved Dashboard Catalogue (placeholder)
  'SF-008/canonical': '',

  // Pipeline Inspection Standard (placeholder)
  'SF-009/canonical': '',

  // MQL Definition and SLA (placeholder)
  'SF-010/canonical': '',

  // TPS Engagement Standard (placeholder)
  'SF-011/canonical': '',

  // Salesforce Support Process (placeholder)
  'SF-012/canonical': '',

  // Opportunity Ownership Standard (placeholder)
  'SF-013/canonical': '',

  /* ────────────────────────────────────────────────────────────────────────
     HIGHSPOT TOPIC PAGES  (20)
     ──────────────────────────────────────────────────────────────────────── */

  // MIP Programme — Highspot page
  'MIP-001/topic': '',

  // Agentic Inflection Point — Highspot page
  'MIP-002/topic': '',

  // Agent Store — Highspot page
  'MIP-003/topic': '',

  // Farmers Programme — Highspot page
  'PRG-001/topic': '',

  // Hunters Programme — Highspot page
  'PRG-002/topic': '',

  // Onboarding — Highspot page
  'PRG-003/topic': '',

  // Pipeline Management — Highspot page
  'SF-001/topic': '',

  // Opportunity Management — Highspot page
  'SF-002/topic': '',

  // Forecasting — Highspot page
  'SF-003/topic': '',

  // Vendor Opportunity — Highspot page
  'SF-004/topic': '',

  // Stage Definitions — Highspot page
  'SF-005/topic': '',

  // Event Logging — Highspot page
  'SF-006/topic': '',

  // Salesforce Hygiene — Highspot page
  'SF-007/topic': '',

  // Dashboard Usage — Highspot page
  'SF-008/topic': '',

  // Pipeline Inspection — Highspot page
  'SF-009/topic': '',

  // MQL Process — Highspot page
  'SF-010/topic': '',

  // TPS Handoffs — Highspot page
  'SF-011/topic': '',

  // Salesforce Cases — Highspot page
  'SF-012/topic': '',

  // Opportunity Ownership Rules — Highspot page
  'SF-013/topic': '',

  // AI Conversations with Partners — Highspot page
  'SF-014/topic': '',

  /* ────────────────────────────────────────────────────────────────────────
     DASHBOARDS  (20)
     ──────────────────────────────────────────────────────────────────────── */

  // Activity and Engagement — Salesforce dashboard · used in 2 topics
  'DASHBOARD/activity-and-engagement': '',

  // Conversion by Stage and Segment — Salesforce dashboard
  'DASHBOARD/conversion-by-stage-and-segment': '',

  // Demand and MQL Flow — Salesforce dashboard
  'DASHBOARD/demand-and-mql-flow': '',

  // EMEA Forecast Accuracy — Salesforce dashboard · used in 2 topics
  'DASHBOARD/emea-forecast-accuracy': '',

  // EMEA Pipeline Health — Salesforce dashboard · used in 2 topics
  'DASHBOARD/emea-pipeline-health': '',

  // Enablement Adoption — Salesforce dashboard · used in 2 topics
  'DASHBOARD/enablement-adoption': '',

  // Forecast Submission Status — Salesforce dashboard
  'DASHBOARD/forecast-submission-status': '',

  // Manager Rhythm — Salesforce dashboard
  'DASHBOARD/manager-rhythm': '',

  // MIP Programme Tracking — Salesforce dashboard · used in 2 topics
  'DASHBOARD/mip-programme-tracking': '',

  // Onboarding and Ramp — Salesforce dashboard
  'DASHBOARD/onboarding-and-ramp': '',

  // Partner Acquisition — Salesforce dashboard
  'DASHBOARD/partner-acquisition': '',

  // Partner Growth — Salesforce dashboard
  'DASHBOARD/partner-growth': '',

  // Pipeline Ageing and Stagnation — Salesforce dashboard
  'DASHBOARD/pipeline-ageing-and-stagnation': '',

  // Presales Demand — Salesforce dashboard
  'DASHBOARD/presales-demand': '',

  // Sales Operations Exceptions — Salesforce dashboard
  'DASHBOARD/sales-operations-exceptions': '',

  // Salesforce Data Quality — Salesforce dashboard · used in 3 topics
  'DASHBOARD/salesforce-data-quality': '',

  // Stage Compliance — Salesforce dashboard
  'DASHBOARD/stage-compliance': '',

  // Stage Velocity by Segment — Salesforce dashboard
  'DASHBOARD/stage-velocity-by-segment': '',

  // Support Performance — Salesforce dashboard
  'DASHBOARD/support-performance': '',

  // Vendor Programme Compliance — Salesforce dashboard
  'DASHBOARD/vendor-programme-compliance': '',

  /* ────────────────────────────────────────────────────────────────────────
     TRAINING  (29)
     ──────────────────────────────────────────────────────────────────────── */

  // Account planning that survives contact with reality — Workday course
  'TRAINING/account-planning-that-survives-contact-with-reality': '',

  // Agent Store: what to say today — Video · 5 min
  'TRAINING/agent-store-what-to-say-today': '',

  // Dashboard tour for sellers — Video · 9 min
  'TRAINING/dashboard-tour-for-sellers': '',

  // EMEA Sales Onboarding path — Workday course
  'TRAINING/emea-sales-onboarding-path': '',

  // Evidence-based Forecasting — Workday course
  'TRAINING/evidence-based-forecasting': '',

  // Forecast call preparation — Video · 10 min
  'TRAINING/forecast-call-preparation': '',

  // Logging activity that is worth reading — Video · 5 min
  'TRAINING/logging-activity-that-is-worth-reading': '',

  // Making the thesis land — Video · 8 min
  'TRAINING/making-the-thesis-land': '',

  // Manager coaching: challenging a commit — Live session
  'TRAINING/manager-coaching-challenging-a-commit': '',

  // Manager coaching session: pipeline inspection — Live session
  'TRAINING/manager-coaching-session-pipeline-inspection': '',

  // Manager guide to running a ramp — Live session
  'TRAINING/manager-guide-to-running-a-ramp': '',

  // MIP conversation practice — Live session
  'TRAINING/mip-conversation-practice': '',

  // MIP in ten minutes — Video · 10 min
  'TRAINING/mip-in-ten-minutes': '',

  // Opportunity Management in Salesforce — Workday course
  'TRAINING/opportunity-management-in-salesforce': '',

  // Ownership and splits explained — Video · 6 min
  'TRAINING/ownership-and-splits-explained': '',

  // Pipeline Management Essentials — Workday course
  'TRAINING/pipeline-management-essentials': '',

  // Prospecting that earns a conversation — Workday course
  'TRAINING/prospecting-that-earns-a-conversation': '',

  // Qualifying a new partner — Video · 9 min
  'TRAINING/qualifying-a-new-partner': '',

  // Raising a good TPS request — Video · 5 min
  'TRAINING/raising-a-good-tps-request': '',

  // Raising an effective case — Video · 3 min
  'TRAINING/raising-an-effective-case': '',

  // Requalification in practice — Video · 8 min
  'TRAINING/requalification-in-practice': '',

  // Required fields walkthrough — Video · 6 min
  'TRAINING/required-fields-walkthrough': '',

  // Running a partner QBR — Video · 12 min
  'TRAINING/running-a-partner-qbr': '',

  // Running an evidence-based inspection — Live session
  'TRAINING/running-an-evidence-based-inspection': '',

  // Salesforce essentials for new starters — Workday course
  'TRAINING/salesforce-essentials-for-new-starters': '',

  // Stage definitions and exit criteria — Workday course
  'TRAINING/stage-definitions-and-exit-criteria': '',

  // Vendor Opportunity basics — Video · 7 min
  'TRAINING/vendor-opportunity-basics': '',

  // Weekly hygiene routine — Video · 4 min
  'TRAINING/weekly-hygiene-routine': '',

  // Working an MQL well — Video · 6 min
  'TRAINING/working-an-mql-well': '',

  /* ────────────────────────────────────────────────────────────────────────
     DOCUMENTATION  (15)
     ──────────────────────────────────────────────────────────────────────── */

  // 30-60-90 day plan template — Template
  'DOC/30-60-90-day-plan-template': '',

  // Account plan template — Template
  'DOC/account-plan-template': '',

  // AIP talk track and FAQ — Talk track
  'DOC/aip-talk-track-and-faq': '',

  // Closed-lost reason definitions — Guide
  'DOC/closed-lost-reason-definitions': '',

  // Commit evidence checklist — Checklist
  'DOC/commit-evidence-checklist': '',

  // Forecast category definitions — Guide
  'DOC/forecast-category-definitions': '',

  // Hygiene checklist — Checklist
  'DOC/hygiene-checklist': '',

  // MIP Programme Battlecard — Battlecard
  'DOC/mip-programme-battlecard': '',

  // MIP talk track and FAQ — Talk track
  'DOC/mip-talk-track-and-faq': '',

  // Pipeline build process map — Process map
  'DOC/pipeline-build-process-map': '',

  // Qualification criteria card — Checklist
  'DOC/qualification-criteria-card': '',

  // Required field reference card — Guide
  'DOC/required-field-reference-card': '',

  // Stage exit criteria card — Checklist
  'DOC/stage-exit-criteria-card': '',

  // Vendor Opportunity decision tree — Process map
  'DOC/vendor-opportunity-decision-tree': '',

  // Weekly pipeline review checklist — Checklist
  'DOC/weekly-pipeline-review-checklist': '',

  /* ────────────────────────────────────────────────────────────────────────
     INTERNAL ASSETS  (37)
     ──────────────────────────────────────────────────────────────────────── */

  // 30-60-90 day plan template — Template — Internal only
  'ASSET/30-60-90-day-plan-template': '',

  // Account plan template — Template — Internal only
  'ASSET/account-plan-template': '',

  // Approved MQL outreach templates — Template — Internal only
  'ASSET/approved-mql-outreach-templates': '',

  // Approved outreach sequences — Template — Internal only
  'ASSET/approved-outreach-sequences': '',

  // Commit evidence checklist — Checklist — Internal only
  'ASSET/commit-evidence-checklist': '',

  // Common validation errors and fixes — Guide — Internal only
  'ASSET/common-validation-errors-and-fixes': '',

  // Coverage targets by segment — Commercial guidance — Internal only
  'ASSET/coverage-targets-by-segment': '',

  // Deal review script for managers — Manager guidance — Internal only
  'ASSET/deal-review-script-for-managers': '',

  // Dispute escalation path — Internal guidance — Internal only
  'ASSET/dispute-escalation-path': '',

  // Early access material — Internal demonstration — Internal only
  'ASSET/early-access-material': '',

  // Escalation path for late slippage — Internal guidance — Internal only
  'ASSET/escalation-path-for-late-slippage': '',

  // Forecast accuracy by team — Leadership reporting — Internal only
  'ASSET/forecast-accuracy-by-team': '',

  // Good and poor event examples — Guide — Internal only
  'ASSET/good-and-poor-event-examples': '',

  // Hygiene checklist — Checklist — Internal only
  'ASSET/hygiene-checklist': '',

  // Inspection question bank — Manager guidance — Internal only
  'ASSET/inspection-question-bank': '',

  // Internal demonstration environment guide — Internal demonstration — Internal only
  'ASSET/internal-demonstration-environment-guide': '',

  // Leadership reporting pack — Leadership reporting — Internal only
  'ASSET/leadership-reporting-pack': '',

  // Manager ramp review guide — Manager guidance — Internal only
  'ASSET/manager-ramp-review-guide': '',

  // Manager review guide: record quality — Manager guidance — Internal only
  'ASSET/manager-review-guide-record-quality': '',

  // Manager scorecard — Leadership reporting — Internal only
  'ASSET/manager-scorecard': '',

  // MIP commercial guidance — Commercial guidance — Internal only
  'ASSET/mip-commercial-guidance': '',

  // MIP Programme Battlecard — Battlecard — Internal only
  'ASSET/mip-programme-battlecard': '',

  // Programme margin guidance — Commercial guidance — Internal only
  'ASSET/programme-margin-guidance': '',

  // Qualification criteria card — Checklist — Internal only
  'ASSET/qualification-criteria-card': '',

  // Rejection reason definitions — Guide — Internal only
  'ASSET/rejection-reason-definitions': '',

  // Required field reference card — Guide — Internal only
  'ASSET/required-field-reference-card': '',

  // Segmentation and assignment rules — Commercial guidance — Internal only
  'ASSET/segmentation-and-assignment-rules': '',

  // Stage exit criteria card — Checklist — Internal only
  'ASSET/stage-exit-criteria-card': '',

  // Target list and prioritisation — Commercial guidance — Internal only
  'ASSET/target-list-and-prioritisation': '',

  // Validation rule catalogue — RevOps reference — Internal only
  'ASSET/validation-rule-catalogue': '',

  // Vendor Opportunity decision tree — Process map — Internal only
  'ASSET/vendor-opportunity-decision-tree': '',

  // Weekly inspection question bank — Manager guidance — Internal only
  'ASSET/weekly-inspection-question-bank': '',

  // What not to promise in a demonstration — Internal guidance — Internal only
  'ASSET/what-not-to-promise-in-a-demonstration': '',

  // What not to promise on AI capability — Internal guidance — Internal only
  'ASSET/what-not-to-promise-on-ai-capability': '',

  // What not to promise on timelines — Internal guidance — Internal only
  'ASSET/what-not-to-promise-on-timelines': '',

  // Which figures are approved for external use — Internal guidance — Internal only
  'ASSET/which-figures-are-approved-for-external-use': '',

  // Draft AI conversation guidance — Draft document — Internal only
  'SF-014/canonical': '',

  /* ────────────────────────────────────────────────────────────────────────
     PARTNER-FACING ASSETS  (22)
     ──────────────────────────────────────────────────────────────────────── */

  // Agent Store partner overview — Document — Partner-facing
  'ASSET/agent-store-partner-overview': '',

  // Deal registration overview for partners — Document — Partner-facing
  'ASSET/deal-registration-overview-for-partners': '',

  // Getting started overview — Document — Partner-facing
  'ASSET/getting-started-overview': '',

  // Growth planning discovery questions — Conversation guide — Partner-facing
  'ASSET/growth-planning-discovery-questions': '',

  // Joint business plan template — Template — Partner-facing
  'ASSET/joint-business-plan-template': '',

  // Joint close-plan template — Template — Partner-facing
  'ASSET/joint-close-plan-template': '',

  // Joint pipeline planning one-pager — Document — Partner-facing
  'ASSET/joint-pipeline-planning-one-pager': '',

  // Joint sales process overview — Document — Partner-facing
  'ASSET/joint-sales-process-overview': '',

  // Market shift partner briefing — Presentation — Partner-facing
  'ASSET/market-shift-partner-briefing': '',

  // MIP partner overview — Presentation — Partner-facing
  'ASSET/mip-partner-overview': '',

  // MIP readiness conversation guide — Conversation guide — Partner-facing
  'ASSET/mip-readiness-conversation-guide': '',

  // MSP to MIP transition case study — Case study — Partner-facing
  'ASSET/msp-to-mip-transition-case-study': '',

  // Mutual action plan guide — Conversation guide — Partner-facing
  'ASSET/mutual-action-plan-guide': '',

  // Partner deal review template — Template — Partner-facing
  'ASSET/partner-deal-review-template': '',

  // Partner margin self-assessment — Template — Partner-facing
  'ASSET/partner-margin-self-assessment': '',

  // Partner pipeline review agenda — Template — Partner-facing
  'ASSET/partner-pipeline-review-agenda': '',

  // Programme eligibility summary — Document — Partner-facing
  'ASSET/programme-eligibility-summary': '',

  // QBR pack — Presentation — Partner-facing
  'ASSET/qbr-pack': '',

  // Solution overview deck — Presentation — Partner-facing
  'ASSET/solution-overview-deck': '',

  // Technical discovery question set — Conversation guide — Partner-facing
  'ASSET/technical-discovery-question-set': '',

  // Vendor programme overview for partners — Document — Partner-facing
  'ASSET/vendor-programme-overview-for-partners': '',

  // Why partner with us — Presentation — Partner-facing
  'ASSET/why-partner-with-us': '',

  /* ────────────────────────────────────────────────────────────────────────
     DIGITAL ROOMS  (2)
     ──────────────────────────────────────────────────────────────────────── */

  // MIP partner Digital Room — Digital Room — Partner-facing
  'ROOM/mip-partner-digital-room': '',

  // Pipeline planning Digital Room — Digital Room — Partner-facing
  'ROOM/pipeline-planning-digital-room': '',

};
