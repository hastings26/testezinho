/* ============================================================================
   EMEA Salesforce Command Center — Prototype data layer
   ----------------------------------------------------------------------------
   EVERYTHING IN THIS FILE IS ILLUSTRATIVE PLACEHOLDER CONTENT.
   Owners, dates, targets, versions, policies and metrics are invented to
   demonstrate the governance model. None of it is approved Pax8 guidance.
   Replace every record with the real canonical source before publication.
   ========================================================================= */

/* ---------------------------------------------------------------- constants */

const PLACEHOLDER_TOKENS = {
  highspotTopic: '{{HIGHSPOT_TOPIC_URL}}',
  highspotAsset: '{{HIGHSPOT_ASSET_URL}}',
  slack: '{{SLACK_ASSISTANT_URL}}',
  dashboard: '{{DASHBOARD_URL}}',
  workday: '{{WORKDAY_COURSE_URL}}',
  digitalRoom: '{{DIGITAL_ROOM_URL}}',
  canonical: '{{CANONICAL_SOURCE_URL}}'
};

/* Roles. Expansions are illustrative placeholders — confirm with EMEA Sales Ops. */
const ROLES = [
  { id: 'all', short: 'All roles', name: 'All roles', note: 'Unfiltered view of every published topic.' },
  { id: 'cam', short: 'CAM', name: 'Channel Account Manager', note: 'Owns partner relationships, pipeline and forecast for a named partner set.' },
  { id: 'cgs', short: 'CGS', name: 'Channel Growth Specialist', note: 'Drives growth motions and campaign follow-up across an assigned partner segment.' },
  { id: 'rsm', short: 'RSM', name: 'Regional Sales Manager', note: 'Leads a regional seller team; accountable for forecast integrity and coaching.' },
  { id: 'sam', short: 'SAM', name: 'Strategic Account Manager', note: 'Owns the largest partner accounts and multi-year account plans.' },
  { id: 'tps', short: 'TPS', name: 'Technical Presales Specialist', note: 'Supports technical qualification, demonstrations and solution design.' },
  { id: 'manager', short: 'Sales Manager', name: 'Sales Manager', note: 'Front-line manager running inspection, coaching and forecast calls.' },
  { id: 'revops', short: 'RevOps', name: 'Revenue Operations', note: 'Owns Salesforce process design, data standards and reporting.' },
  { id: 'enablement', short: 'Revenue Enablement', name: 'Revenue Enablement', note: 'Owns capability, training, adoption and the governed Highspot experience.' }
];

/* Shareability classifications. Text label + icon — never colour alone. */
const SHAREABILITY = {
  'internal-only':    { label: 'Internal only',            icon: '⛔', tone: 'danger',  desc: 'Must not leave Pax8. No partner, no customer, no exceptions.' },
  'external-approved':{ label: 'External approved',        icon: '✓',  tone: 'ok',      desc: 'Approved for direct sharing with partners.' },
  'conditional':      { label: 'Shareable with conditions',icon: '◐',  tone: 'warn',    desc: 'Shareable only under the stated conditions. Read them first.' },
  'manager-approval': { label: 'Manager approval required',icon: '⚑',  tone: 'warn',    desc: 'Requires your manager to approve the specific use before sharing.' },
  'restricted':       { label: 'Restricted',               icon: '🔒', tone: 'danger',  desc: 'Named-audience access only. Request via the content owner.' },
  'draft':            { label: 'Draft — do not use',       icon: '✎',  tone: 'neutral', desc: 'Work in progress. Not approved. Do not use or quote.' },
  'archived':         { label: 'Archived',                 icon: '🗄', tone: 'neutral', desc: 'Superseded. Retained for reference only. Do not act on it.' }
};

/* Lifecycle status of a topic record. */
const LIFECYCLE = {
  published:   { label: 'Published',    icon: '●', tone: 'ok',      desc: 'Approved and live in Highspot.' },
  'review-due':{ label: 'Review due',   icon: '⏰', tone: 'warn',    desc: 'Past its next review date. Treat with care and chase the owner.' },
  'in-review': { label: 'In review',    icon: '◑', tone: 'warn',    desc: 'Currently being reviewed by the owner. Previous version still applies.' },
  draft:       { label: 'Draft',        icon: '✎', tone: 'neutral', desc: 'Not approved. Not authoritative. Not published.' },
  archived:    { label: 'Archived',     icon: '🗄', tone: 'neutral', desc: 'Superseded or retired. Do not act on it.' }
};

const APPROVAL = {
  approved:     { label: 'Approved',       icon: '✓' },
  'not-approved': { label: 'Not approved', icon: '✕' },
  provisional:  { label: 'Provisional',    icon: '◐' }
};

/* Lanes. The Salesforce lane is built out; the rest demonstrate reuse. */
const LANES = [
  {
    id: 'salesforce', name: 'Salesforce', tagline: 'The system of record and the rules that govern it.',
    owner: 'RevOps — EMEA (placeholder)', status: 'published',
    desc: 'Standards, processes, required fields, stage definitions and hygiene expectations for Salesforce across EMEA Sales.'
  },
  {
    id: 'pipeline-opportunity', name: 'Pipeline and Opportunity Management', tagline: 'How pipeline is built, progressed and forecast.',
    owner: 'Sales Leadership — EMEA (placeholder)', status: 'published',
    desc: 'Coverage, progression, qualification, forecast categories and inspection rhythm.'
  },
  {
    id: 'mip', name: 'MIP', tagline: 'Managed Intelligence Provider motion.',
    owner: 'Product Marketing (placeholder)', status: 'published',
    desc: 'Positioning, partner readiness, commercial guidance and partner-facing materials for the MIP motion.'
  },
  { id: 'microsoft', name: 'Microsoft', tagline: 'Microsoft vendor motion.', owner: 'Vendor Alliances (placeholder)', status: 'in-review', desc: 'Vendor programme rules, incentives, co-sell process and approved partner materials.' },
  { id: 'ai', name: 'AI', tagline: 'AI enablement and responsible use.', owner: 'Revenue Enablement (placeholder)', status: 'in-review', desc: 'AI capability build, approved tooling, responsible-use expectations and partner conversation guides.' },
  { id: 'security', name: 'Security', tagline: 'Security motion and partner maturity.', owner: 'Security Practice (placeholder)', status: 'draft', desc: 'Security portfolio guidance, assessment approach and approved partner-facing collateral.' },
  { id: 'professional-services', name: 'Professional Services', tagline: 'Scoping, delivery and hand-off.', owner: 'Professional Services (placeholder)', status: 'draft', desc: 'Engagement types, scoping standards, Salesforce treatment and delivery hand-off.' },
  { id: 'transformation', name: 'Transformation', tagline: 'Partner business transformation.', owner: 'Partner Development (placeholder)', status: 'draft', desc: 'Transformation frameworks, maturity models and partner planning resources.' },
  { id: 'partner-maturity', name: 'Partner Maturity', tagline: 'Segmentation and maturity progression.', owner: 'Partner Strategy (placeholder)', status: 'draft', desc: 'Maturity model, segmentation rules, progression plays and measurement.' }
];

/* ------------------------------------------------------------------- topics */
/* Every topic follows the six-section template. Governance block is mandatory. */

const TOPICS = [

  /* ---------------------------------------------------------------------- 1 */
  {
    id: 'pipeline-management',
    ref: 'SF-001',
    name: 'Pipeline Management',
    lane: 'pipeline-opportunity',
    priority: true,
    short: 'How pipeline is built, qualified, progressed and kept trustworthy enough to forecast from.',
    definition: {
      what: 'Pipeline Management is the disciplined practice of creating, qualifying, progressing and closing opportunities so that the pipeline in Salesforce is an accurate, evidence-based picture of future revenue.',
      why: 'The forecast is only as good as the pipeline behind it. When pipeline is stale, over-stated or under-recorded, leadership plans capacity, investment and vendor commitments against a number that is not real.',
      inScope: [
        'Building and maintaining pipeline coverage against quota',
        'Qualification and requalification of open opportunities',
        'Progression, stagnation and closure decisions',
        'Weekly pipeline review and inspection preparation'
      ],
      outOfScope: [
        'Forecast category selection and commit discipline — see Forecasting',
        'Field-level data requirements — see Opportunity Management',
        'Marketing-sourced lead handling before conversion — see MQL Process'
      ],
      roles: ['cam', 'cgs', 'rsm', 'sam', 'manager'],
      related: ['opportunity-management', 'forecasting', 'stage-definitions', 'pipeline-inspection']
    },
    rules: {
      mandatory: [
        { title: 'Maintain 3x coverage of the current-quarter quota', detail: 'Open pipeline in stages 2 and above must equal at least three times the remaining quarterly quota, measured every Monday. Placeholder target — confirm with Sales Leadership.' },
        { title: 'No opportunity may sit in the same stage beyond 45 days', detail: 'At 45 days the opportunity must be progressed, requalified with a new close date and evidence, or closed lost. Placeholder threshold.' },
        { title: 'Close dates must be realistic and evidenced', detail: 'A close date may only be set or moved on the basis of a stated partner or customer commitment recorded in the opportunity.' },
        { title: 'Every open opportunity has a documented next step with a date', detail: 'The next step field must contain a specific action and a date in the future.' }
      ],
      recommended: [
        { title: 'Review your own pipeline before your manager does', detail: 'Run the Pipeline Health dashboard every Friday and clear exceptions before the Monday call.' },
        { title: 'Requalify rather than delete', detail: 'Requalification preserves the history that makes conversion analysis possible.' }
      ],
      optional: [
        { title: 'Use the pipeline review template for one-to-ones', detail: 'A structured template supports consistent coaching but is not mandated.' }
      ],
      exceptions: [
        { title: 'Multi-year public sector cycles', detail: 'Opportunities on procurement cycles longer than 12 months may exceed the stage-age threshold where the RSM records an exception note. Placeholder exception.' }
      ]
    },
    good: [
      { context: 'Pipeline hygiene', bad: 'Stale opportunities remain open indefinitely because nobody wants to reduce the number.', good: 'Stale opportunities are progressed, requalified or closed on the basis of evidence, and the number that remains is trusted.' },
      { context: 'Coverage', bad: 'Coverage is checked at the end of the quarter, when it is too late to act.', good: 'Coverage is checked weekly against the remaining quota, and gaps trigger a specific build action that week.' },
      { context: 'Close dates', bad: 'Close dates are pushed one month at a time with no change in the deal.', good: 'A moved close date is accompanied by what changed, who said it and what happens next.' }
    ],
    coaching: [
      'Show me the evidence behind the three largest close dates this quarter.',
      'Which opportunities have not moved stage in 30 days, and what is the plan for each?',
      'If I removed every opportunity without a dated next step, what would your coverage be?'
    ],
    mistakes: [
      'Treating coverage as a reporting exercise rather than a build trigger.',
      'Requalifying by editing the close date only, with no new evidence.',
      'Holding closed-lost decisions until quarter end so the pipeline looks healthier.'
    ],
    warnings: [
      'Coverage above target but concentrated in two or three deals.',
      'A high proportion of opportunities created and closed in the same week.',
      'Stage ageing improving immediately before an inspection call.'
    ],
    metrics: [
      { name: 'Pipeline Coverage', what: 'Open pipeline value divided by remaining quota for the current quarter.', why: 'Signals whether there is enough qualified pipeline to land the number.', dashboard: 'EMEA Pipeline Health', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Weekly', threshold: '3.0x or above (placeholder)', action: 'Below 3.0x, agree a named build action with your manager in that week\'s one-to-one.' },
      { name: 'Opportunity Ageing', what: 'Days an open opportunity has spent in its current stage.', why: 'Ageing is the earliest visible signal of a deal that has stopped moving.', dashboard: 'Pipeline Ageing and Stagnation', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Weekly', threshold: 'No opportunity beyond 45 days in stage (placeholder)', action: 'Progress, requalify with evidence, or close. Ageing exceptions require a note from the RSM.' },
      { name: 'Stage Velocity', what: 'Average days taken to move between each stage.', why: 'Shows where deals slow down so coaching can target the real constraint.', dashboard: 'Stage Velocity by Segment', dashboardToken: 'dashboard', owner: 'Sales Leadership (placeholder)', cadence: 'Monthly', threshold: 'Segment benchmark, reviewed quarterly (placeholder)', action: 'Where a single stage exceeds the benchmark by 50%, review qualification quality at entry to that stage.' }
    ],
    resources: {
      training: [
        { title: 'Pipeline Management Essentials', type: 'Workday course', desc: '45-minute foundation course. Mandatory within 30 days of joining EMEA Sales (placeholder).', token: 'workday', share: 'internal-only' },
        { title: 'Requalification in practice', type: 'Video · 8 min', desc: 'Worked example of requalifying a stalled opportunity with evidence.', token: 'highspotAsset', share: 'internal-only' },
        { title: 'Manager coaching session: pipeline inspection', type: 'Live session', desc: 'Monthly session for front-line managers on running an evidence-based inspection.', token: 'highspotAsset', share: 'internal-only' }
      ],
      documentation: [
        { title: 'Pipeline Management Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' },
        { title: 'Weekly pipeline review checklist', type: 'Checklist', desc: 'One page. Run before the Monday call.', token: 'highspotAsset', share: 'internal-only' },
        { title: 'Pipeline build process map', type: 'Process map', desc: 'End-to-end view from lead through to qualified pipeline.', token: 'highspotAsset', share: 'internal-only' }
      ],
      dashboards: [
        { title: 'EMEA Pipeline Health', desc: 'Coverage, ageing and next-step completeness for your book.', audience: 'Sellers and managers', frequency: 'Weekly', token: 'dashboard' },
        { title: 'Pipeline Ageing and Stagnation', desc: 'Opportunities beyond the stage-age threshold.', audience: 'Sellers and managers', frequency: 'Weekly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'Does coverage include stage 1 opportunities?', a: 'No. Coverage is measured on stage 2 and above, because stage 1 has not yet been qualified against the exit criteria. Placeholder rule — confirm with RevOps.' },
        { q: 'What if a partner asks me to hold a deal open?', a: 'Record the request, the named person and the expected restart date in the opportunity, then set the close date to the restart date. Do not leave the original date in place.' },
        { q: 'Can I reopen a closed-lost opportunity?', a: 'Only where the same buying cycle restarts within 90 days. Otherwise create a new opportunity so conversion reporting stays accurate. Placeholder rule.' }
      ],
      contacts: [
        { role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns the standard and the exception process.' },
        { role: 'Content owner', name: 'Revenue Enablement — named owner to be confirmed', note: 'Owns this Highspot page and its resources.' },
        { role: 'Escalation', name: 'EMEA Sales Operations lead — to be confirmed', note: 'Escalate contradictions between this page and any other source.' }
      ]
    },
    internal: [
      { title: 'Pipeline Management Standard (canonical)', type: 'Document', desc: 'The approved rule set. Everything on this page derives from it.', share: 'internal-only', token: 'canonical' },
      { title: 'Weekly inspection question bank', type: 'Manager guidance', desc: 'Questions managers use in pipeline inspection.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Coverage targets by segment', type: 'Commercial guidance', desc: 'Segment-level coverage expectations and rationale.', share: 'restricted', token: 'highspotAsset' },
      { title: 'What not to promise on timelines', type: 'Internal guidance', desc: 'Language to avoid when a partner pushes for delivery commitments.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [
      { title: 'Joint pipeline planning one-pager', type: 'Document', desc: 'Structure for a joint pipeline conversation with a partner.', share: 'external-approved', token: 'highspotAsset' },
      { title: 'Partner pipeline review agenda', type: 'Template', desc: 'Agenda template for a quarterly partner pipeline session.', share: 'external-approved', token: 'highspotAsset' },
      { title: 'Growth planning discovery questions', type: 'Conversation guide', desc: 'Discovery questions for partner growth planning.', share: 'conditional', condition: 'Shareable verbally or as a leave-behind. Do not share the internal scoring notes version.', token: 'highspotAsset' },
      { title: 'Pipeline planning Digital Room', type: 'Digital Room', desc: 'Curated partner-facing collection for planning sessions.', share: 'external-approved', token: 'digitalRoom', digitalRoom: true }
    ],
    governance: {
      source: 'Pipeline Management Standard — EMEA (placeholder)',
      contentOwner: 'Revenue Enablement (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '4.1',
      approvalDate: '2026-05-18',
      lastReview: '2026-05-18',
      nextReview: '2026-11-18',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['pipeline', 'coverage', 'stale', 'ageing', 'stagnation', 'requalify', '3x', 'pipe', 'funnel'],
      slackQuestions: [
        'What is our pipeline coverage target?',
        'How long can an opportunity sit in one stage?',
        'When should I close an opportunity as lost?'
      ],
      changes: [
        { date: '2026-05-18', version: '4.1', summary: 'Stage-age threshold reduced from 60 to 45 days.', reason: 'Inspection data showed deals beyond 45 days converted below 8%.', affects: 'CAM, CGS, SAM, Sales Manager', comms: 'Announced in EMEA sales call, 20 May 2026', training: 'Course updated', indexed: true },
        { date: '2026-01-12', version: '4.0', summary: 'Coverage measurement moved from all stages to stage 2 and above.', reason: 'Stage 1 inflated coverage without qualification.', affects: 'All selling roles', comms: 'Manager cascade, January 2026', training: 'Course updated', indexed: true },
        { date: '2025-09-02', version: '3.4', summary: 'Added dated next-step requirement.', reason: 'Next steps were present but undated, so ageing could not be measured.', affects: 'All selling roles', comms: 'Email to EMEA Sales', training: 'No change', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 2 */
  {
    id: 'opportunity-management',
    ref: 'SF-002',
    name: 'Opportunity Management',
    lane: 'pipeline-opportunity',
    priority: true,
    short: 'What must be recorded on an opportunity, when, and to what standard.',
    definition: {
      what: 'Opportunity Management covers the creation, maintenance and closure of opportunity records in Salesforce, including required fields, update frequency and evidence standards.',
      why: 'The opportunity record is the shared truth between seller, manager, RevOps and finance. Incomplete records make forecasting, capacity planning and vendor reporting unreliable.',
      inScope: ['Opportunity creation rules', 'Required and conditionally required fields', 'Update cadence and evidence', 'Closure and closed-lost reasons'],
      outOfScope: ['Stage entry and exit criteria — see Stage Definitions', 'Forecast category selection — see Forecasting', 'Vendor-specific opportunity types — see Vendor Opportunity'],
      roles: ['cam', 'cgs', 'sam', 'tps', 'manager'],
      related: ['stage-definitions', 'pipeline-management', 'salesforce-hygiene', 'opportunity-ownership']
    },
    rules: {
      mandatory: [
        { title: 'Update the opportunity after every meaningful interaction', detail: 'Within one working day of any partner or customer interaction that changes the deal.' },
        { title: 'Complete all required fields before leaving stage 1', detail: 'Partner, amount, close date, product family, next step and stage-specific fields. Placeholder field set — confirm with RevOps.' },
        { title: 'Record a closed-lost reason from the picklist', detail: 'Free-text alone is not acceptable. The picklist drives loss analysis.' },
        { title: 'One opportunity per buying cycle', detail: 'Do not split a single buying decision across multiple opportunities to improve reporting optics.' }
      ],
      recommended: [
        { title: 'Write next steps a colleague could act on', detail: 'Assume someone else may need to cover the deal at short notice.' },
        { title: 'Attach the evidence, not a description of the evidence', detail: 'Link the email, quote or meeting note where the system allows.' }
      ],
      optional: [
        { title: 'Use the opportunity summary template', detail: 'A consistent structure helps managers review quickly.' }
      ],
      exceptions: [
        { title: 'Confidential transactions', detail: 'Where commercial sensitivity prevents full documentation, record the restriction and the approver. Placeholder exception.' }
      ]
    },
    good: [
      { context: 'Update frequency', bad: 'Opportunity updated once per month, usually the day before the forecast call.', good: 'Opportunity updated after every meaningful customer or partner interaction, so the record is current when anybody looks at it.' },
      { context: 'Next steps', bad: '"Follow up."', good: '"Send revised three-year quote to Anna Bauer (finance approver) by 12 August; she confirmed board sign-off on 14 August."' },
      { context: 'Closed lost', bad: 'Closed lost with reason "Other" and no notes.', good: 'Closed lost with picklist reason, the competitor named, and one line on what would have changed the outcome.' }
    ],
    coaching: [
      'Pick any open opportunity. Could I cover this deal tomorrow using only the record?',
      'What is the last dated evidence on this deal, and how old is it?',
      'Which of your closed-lost reasons this quarter would survive a review by RevOps?'
    ],
    mistakes: [
      'Bulk-updating close dates at quarter end.',
      'Using the description field for information that belongs in a structured field.',
      'Creating a second opportunity rather than correcting the first.'
    ],
    warnings: [
      'A cluster of updates immediately before forecast calls and none in between.',
      'Required fields completed with obvious filler values.',
      'Opportunities with amounts that exactly match a round quota gap.'
    ],
    metrics: [
      { name: 'Required Field Completion', what: 'Percentage of open opportunities with all required fields populated.', why: 'Incomplete records break reporting and forecasting downstream.', dashboard: 'Salesforce Data Quality', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Weekly', threshold: '95% or above (placeholder)', action: 'Below threshold, the exception list is issued to managers on Monday for clearance that week.' },
      { name: 'Opportunity Conversion', what: 'Percentage of qualified opportunities that reach closed won.', why: 'Shows whether qualification standards are being applied honestly.', dashboard: 'Conversion by Stage and Segment', dashboardToken: 'dashboard', owner: 'Sales Leadership (placeholder)', cadence: 'Monthly', threshold: 'Segment benchmark (placeholder)', action: 'Material drops trigger a qualification review with the RSM.' }
    ],
    resources: {
      training: [
        { title: 'Opportunity Management in Salesforce', type: 'Workday course', desc: '30-minute course covering fields, cadence and closure.', token: 'workday', share: 'internal-only' },
        { title: 'Required fields walkthrough', type: 'Video · 6 min', desc: 'Screen-by-screen walkthrough of the required field set.', token: 'highspotAsset', share: 'internal-only' }
      ],
      documentation: [
        { title: 'Opportunity Management Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' },
        { title: 'Required field reference card', type: 'Guide', desc: 'Field-by-field reference including conditional requirements.', token: 'highspotAsset', share: 'internal-only' },
        { title: 'Closed-lost reason definitions', type: 'Guide', desc: 'What each picklist value means and when to use it.', token: 'highspotAsset', share: 'internal-only' }
      ],
      dashboards: [
        { title: 'Salesforce Data Quality', desc: 'Field completion and record-age exceptions for your book.', audience: 'Sellers and managers', frequency: 'Weekly', token: 'dashboard' },
        { title: 'Conversion by Stage and Segment', desc: 'Conversion rates with segment benchmarks.', audience: 'Managers and leadership', frequency: 'Monthly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'What counts as a meaningful interaction?', a: 'Any contact that changes what you know about the deal: a meeting, a decision, a new stakeholder, a commercial change, or a delay. Routine chasing does not require an update.' },
        { q: 'Can I update the record retrospectively?', a: 'Yes, but record the actual date of the interaction. Backdating without noting it is a data integrity issue.' }
      ],
      contacts: [
        { role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns the field set and validation rules.' },
        { role: 'Content owner', name: 'Revenue Enablement — named owner to be confirmed', note: 'Owns this page.' },
        { role: 'Technical support', name: 'Salesforce support queue — see Salesforce Cases', note: 'For validation errors and access problems.' }
      ]
    },
    internal: [
      { title: 'Opportunity Management Standard (canonical)', type: 'Document', desc: 'The approved rule set.', share: 'internal-only', token: 'canonical' },
      { title: 'Required field reference card', type: 'Guide', desc: 'Field-by-field requirements including conditional logic.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Validation rule catalogue', type: 'RevOps reference', desc: 'Every active validation rule and the behaviour it enforces.', share: 'restricted', token: 'highspotAsset' },
      { title: 'Manager review guide: record quality', type: 'Manager guidance', desc: 'How to review record quality without micromanaging.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [
      { title: 'Deal registration overview for partners', type: 'Document', desc: 'What partners need to know about how deals are recorded and progressed.', share: 'external-approved', token: 'highspotAsset' },
      { title: 'Partner deal review template', type: 'Template', desc: 'Structure for reviewing joint deals with a partner.', share: 'external-approved', token: 'highspotAsset' }
    ],
    governance: {
      source: 'Opportunity Management Standard — EMEA (placeholder)',
      contentOwner: 'Revenue Enablement (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '3.6',
      approvalDate: '2026-06-02',
      lastReview: '2026-06-02',
      nextReview: '2026-12-02',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['opportunity', 'required fields', 'mandatory fields', 'closed lost', 'update', 'opp', 'record'],
      slackQuestions: [
        'Which opportunity fields are required?',
        'How often should I update an opportunity?',
        'What closed-lost reason should I use?'
      ],
      changes: [
        { date: '2026-06-02', version: '3.6', summary: 'Closed-lost picklist reason made mandatory.', reason: 'Loss analysis was unusable with free-text only.', affects: 'All selling roles', comms: 'Manager cascade, June 2026', training: 'Course updated', indexed: true },
        { date: '2026-02-16', version: '3.5', summary: 'Update window tightened from three days to one working day.', reason: 'Records were routinely stale at forecast calls.', affects: 'All selling roles', comms: 'EMEA sales call', training: 'No change', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 3 */
  {
    id: 'forecasting',
    ref: 'SF-003',
    name: 'Forecasting',
    lane: 'pipeline-opportunity',
    priority: true,
    short: 'Forecast categories, commit standards and the evidence required behind each call.',
    definition: {
      what: 'Forecasting is the weekly discipline of categorising open opportunities by confidence and evidence so that EMEA can state, and stand behind, a number.',
      why: 'The EMEA number is committed upward. A commit that is not evidence-based becomes a miss that is discovered late, when nothing can be done about it.',
      inScope: ['Forecast categories and their definitions', 'Commit criteria and evidence', 'Weekly forecast submission rhythm', 'Changes to a submitted forecast'],
      outOfScope: ['Quota setting and territory design', 'Pipeline build actions — see Pipeline Management', 'Revenue recognition and invoicing'],
      roles: ['cam', 'cgs', 'rsm', 'sam', 'manager'],
      related: ['pipeline-management', 'stage-definitions', 'pipeline-inspection']
    },
    rules: {
      mandatory: [
        { title: 'Submit your forecast by 12:00 CET every Tuesday', detail: 'Placeholder timing — confirm with EMEA Sales Operations.' },
        { title: 'Commit requires all three evidence tests', detail: 'A named decision maker has committed, commercial terms are agreed, and the stage exit criteria for stage 4 are met. All three, not two.' },
        { title: 'Reductions to commit must be raised the same day they are known', detail: 'Do not hold a known slip until the next submission window.' },
        { title: 'Best case must have a defined path to close within the quarter', detail: 'If you cannot state the path, it is pipeline, not best case.' }
      ],
      recommended: [
        { title: 'Write the commit rationale in one sentence', detail: 'If it takes a paragraph, the evidence is probably not there.' },
        { title: 'Review your last quarter\'s forecast accuracy before submitting', detail: 'Personal accuracy patterns are the most useful coaching input.' }
      ],
      optional: [
        { title: 'Use the pre-call preparation sheet', detail: 'Optional structure for preparing forecast conversations.' }
      ],
      exceptions: [
        { title: 'Vendor-driven timing', detail: 'Where a vendor programme deadline drives the close date, note the programme and the deadline in the opportunity. Placeholder exception.' }
      ]
    },
    good: [
      { context: 'Commit', bad: 'Commit forecast based on optimism and a good relationship.', good: 'Commit forecast based on verified evidence, an explicit stakeholder commitment and the defined stage exit criteria.' },
      { context: 'Slippage', bad: 'A slip is revealed on the last forecast call of the quarter.', good: 'A slip is raised the day it becomes known, with the reason and the recovery plan.' },
      { context: 'Best case', bad: 'Best case is used as a holding area for anything that might happen.', good: 'Best case contains only deals with a stated path to close inside the quarter.' }
    ],
    coaching: [
      'What is the single piece of evidence that makes this a commit rather than a best case?',
      'Who specifically has committed, and when did they say it?',
      'What would have to be true for this to slip, and how would you know early?'
    ],
    mistakes: [
      'Treating stage as a proxy for forecast category.',
      'Committing on a verbal from someone who cannot sign.',
      'Adjusting the forecast to match the target rather than the evidence.'
    ],
    warnings: [
      'Commit accuracy consistently high in the final week but poor at week four.',
      'A commit with no interaction logged in the last 14 days.',
      'Large deals moving from pipeline directly to commit without passing through best case.'
    ],
    metrics: [
      { name: 'Forecast Accuracy', what: 'Variance between week-four commit and actual closed won.', why: 'Measures whether the number leadership plans against is dependable.', dashboard: 'EMEA Forecast Accuracy', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Weekly during quarter, reviewed monthly', threshold: 'Within ±10% at week four (placeholder)', action: 'Outside range for two consecutive quarters triggers a forecasting coaching plan with the RSM.' },
      { name: 'Commit Slippage', what: 'Value of commit deals that move out of the quarter after week four.', why: 'Late slippage is the most damaging pattern for planning.', dashboard: 'EMEA Forecast Accuracy', dashboardToken: 'dashboard', owner: 'Sales Leadership (placeholder)', cadence: 'Weekly', threshold: 'Below 5% of commit value (placeholder)', action: 'Each slipped deal is reviewed for what evidence was missing at commit.' }
    ],
    resources: {
      training: [
        { title: 'Evidence-based Forecasting', type: 'Workday course', desc: '40-minute course on categories, evidence tests and submission.', token: 'workday', share: 'internal-only' },
        { title: 'Forecast call preparation', type: 'Video · 10 min', desc: 'How to prepare for and run a forecast conversation.', token: 'highspotAsset', share: 'internal-only' },
        { title: 'Manager coaching: challenging a commit', type: 'Live session', desc: 'Practice session for managers on testing commit evidence.', token: 'highspotAsset', share: 'internal-only' }
      ],
      documentation: [
        { title: 'EMEA Forecast Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' },
        { title: 'Forecast category definitions', type: 'Guide', desc: 'Pipeline, best case, commit and closed — with evidence tests.', token: 'highspotAsset', share: 'internal-only' },
        { title: 'Commit evidence checklist', type: 'Checklist', desc: 'Three tests, one page.', token: 'highspotAsset', share: 'internal-only' }
      ],
      dashboards: [
        { title: 'EMEA Forecast Accuracy', desc: 'Accuracy, slippage and category movement.', audience: 'Managers and leadership', frequency: 'Weekly', token: 'dashboard' },
        { title: 'Forecast Submission Status', desc: 'Who has submitted and who has not.', audience: 'Managers', frequency: 'Weekly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'What is Commit Forecast?', a: 'Commit is the category for deals you will close in the quarter and are prepared to be held to. It requires a named decision-maker commitment, agreed commercial terms, and the stage 4 exit criteria met. All three. Placeholder definition — confirm with EMEA Sales Operations.' },
        { q: 'Can I move a deal out of commit?', a: 'Yes, and you must do so the day the change is known. Late movement is the problem, not movement itself.' },
        { q: 'Does stage 4 automatically mean commit?', a: 'No. Stage reflects deal progress; forecast category reflects confidence and evidence. They are related but not the same.' }
      ],
      contacts: [
        { role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns categories and submission process.' },
        { role: 'Sales leadership owner', name: 'EMEA Sales Leadership — to be confirmed', note: 'Owns commit standards.' },
        { role: 'Escalation', name: 'EMEA Sales Operations lead — to be confirmed', note: 'For disputes on category definitions.' }
      ]
    },
    internal: [
      { title: 'EMEA Forecast Standard (canonical)', type: 'Document', desc: 'The approved rule set.', share: 'internal-only', token: 'canonical' },
      { title: 'Commit evidence checklist', type: 'Checklist', desc: 'The three evidence tests.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Forecast accuracy by team', type: 'Leadership reporting', desc: 'Team-level accuracy trends.', share: 'restricted', token: 'dashboard' },
      { title: 'Escalation path for late slippage', type: 'Internal guidance', desc: 'Who to tell, and when.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [
      { title: 'Joint close-plan template', type: 'Template', desc: 'Close plan you can build with a partner.', share: 'external-approved', token: 'highspotAsset' },
      { title: 'Mutual action plan guide', type: 'Conversation guide', desc: 'How to agree steps and dates with a partner.', share: 'conditional', condition: 'Share the template only. Internal commit criteria must not be shared.', token: 'highspotAsset' }
    ],
    governance: {
      source: 'EMEA Forecast Standard (placeholder)',
      contentOwner: 'Revenue Enablement (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '5.0',
      approvalDate: '2026-07-01',
      lastReview: '2026-07-01',
      nextReview: '2027-01-01',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['forecast', 'commit', 'best case', 'accuracy', 'slippage', 'submission', 'call'],
      slackQuestions: [
        'What is Commit Forecast?',
        'When is the forecast due?',
        'What evidence do I need to commit a deal?'
      ],
      changes: [
        { date: '2026-07-01', version: '5.0', summary: 'Third evidence test added: stage 4 exit criteria must be met to commit.', reason: 'Commits were being made on relationship confidence alone.', affects: 'All selling roles and managers', comms: 'EMEA all-hands, July 2026', training: 'Course rebuilt', indexed: true },
        { date: '2026-03-09', version: '4.2', summary: 'Submission deadline moved from Monday to Tuesday 12:00 CET.', reason: 'Alignment with global reporting cycle.', affects: 'All selling roles', comms: 'Email and manager cascade', training: 'No change', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 4 */
  {
    id: 'vendor-opportunity',
    ref: 'SF-004',
    name: 'Vendor Opportunity',
    lane: 'salesforce',
    priority: true,
    short: 'When to create a Vendor Opportunity, how it differs from a standard opportunity, and who owns it.',
    definition: {
      what: 'A Vendor Opportunity is an opportunity record type used where a vendor programme, incentive or co-sell motion requires the deal to be tracked separately from the standard partner opportunity.',
      why: 'Vendor programmes carry reporting obligations and funding. Recording these deals as standard opportunities loses the programme link and the associated funding claim.',
      inScope: ['When a Vendor Opportunity is required', 'Field differences from a standard opportunity', 'Ownership and split rules', 'Vendor reporting obligations'],
      outOfScope: ['Vendor programme terms themselves — see the Microsoft lane', 'Standard opportunity rules — see Opportunity Management'],
      roles: ['cam', 'cgs', 'sam', 'tps', 'revops'],
      related: ['opportunity-management', 'opportunity-ownership', 'stage-definitions']
    },
    rules: {
      mandatory: [
        { title: 'Create a Vendor Opportunity when a vendor programme funds or claims the deal', detail: 'If the deal will be submitted to a vendor programme, the Vendor Opportunity record type is required from creation. Placeholder rule.' },
        { title: 'Link the vendor programme reference at creation', detail: 'The programme reference cannot be added retrospectively without a RevOps case.' },
        { title: 'Do not duplicate the deal as both standard and vendor', detail: 'One buying cycle, one opportunity, correct record type.' }
      ],
      recommended: [
        { title: 'Check programme eligibility before creating', detail: 'Eligibility errors are the most common cause of rejected claims.' }
      ],
      optional: [
        { title: 'Tag the vendor campaign where one exists', detail: 'Improves attribution reporting.' }
      ],
      exceptions: [
        { title: 'Retrospective programme inclusion', detail: 'Where a vendor admits a deal to a programme after creation, raise a Salesforce case for record type conversion. Placeholder exception.' }
      ]
    },
    good: [
      { context: 'Creation timing', bad: 'Vendor Opportunity created at the end of the quarter to capture a claim.', good: 'Vendor Opportunity created at qualification, when the programme link is first known.' },
      { context: 'Programme reference', bad: 'Programme reference left blank and "will add later" written in notes.', good: 'Programme reference captured at creation and validated against the eligibility list.' }
    ],
    coaching: [
      'Which of your open deals will be claimed under a vendor programme, and are they on the right record type?',
      'What would happen to the claim if this deal closed tomorrow?'
    ],
    mistakes: [
      'Creating a standard opportunity first and converting late.',
      'Using the vendor record type for any deal that merely involves a vendor product.'
    ],
    warnings: [
      'A spike in record type conversion cases near quarter end.',
      'Vendor opportunities without a programme reference.'
    ],
    metrics: [
      { name: 'Vendor Claim Eligibility Rate', what: 'Percentage of vendor opportunities that pass programme eligibility checks at submission.', why: 'Failed claims are lost funding and rework.', dashboard: 'Vendor Programme Compliance', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Monthly', threshold: '90% or above (placeholder)', action: 'Below threshold, RevOps runs a creation-quality review with the affected teams.' }
    ],
    resources: {
      training: [
        { title: 'Vendor Opportunity basics', type: 'Video · 7 min', desc: 'When to use the record type and what changes.', token: 'highspotAsset', share: 'internal-only' }
      ],
      documentation: [
        { title: 'Vendor Opportunity Process Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' },
        { title: 'Vendor Opportunity decision tree', type: 'Process map', desc: 'Five questions that determine the correct record type.', token: 'highspotAsset', share: 'internal-only' }
      ],
      dashboards: [
        { title: 'Vendor Programme Compliance', desc: 'Eligibility, references and claim status.', audience: 'Sellers, RevOps', frequency: 'Monthly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'When should I create a Vendor Opportunity?', a: 'At qualification, as soon as you know the deal will be submitted to a vendor programme. Not at close. Placeholder rule — confirm with RevOps.' },
        { q: 'Can a deal be converted later?', a: 'Only through a Salesforce case. Conversion is not self-service because it affects claim history.' }
      ],
      contacts: [
        { role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns record types and conversion.' },
        { role: 'Vendor alliances contact', name: 'Vendor Alliances — to be confirmed', note: 'Owns programme eligibility rules.' }
      ]
    },
    internal: [
      { title: 'Vendor Opportunity Process Standard (canonical)', type: 'Document', desc: 'The approved rule set.', share: 'internal-only', token: 'canonical' },
      { title: 'Vendor Opportunity decision tree', type: 'Process map', desc: 'Five questions to the right record type.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Programme margin guidance', type: 'Commercial guidance', desc: 'Funding and margin implications by programme.', share: 'restricted', token: 'highspotAsset' }
    ],
    partner: [
      { title: 'Vendor programme overview for partners', type: 'Document', desc: 'What the programme offers and what partners must do.', share: 'external-approved', token: 'highspotAsset' },
      { title: 'Programme eligibility summary', type: 'Document', desc: 'Plain-language eligibility summary.', share: 'conditional', condition: 'Shareable with partners actively enrolled in the programme only.', token: 'highspotAsset' }
    ],
    governance: {
      source: 'Vendor Opportunity Process Standard (placeholder)',
      contentOwner: 'RevOps (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Operations (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'Vendor Alliances lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '2.3',
      approvalDate: '2026-04-14',
      lastReview: '2026-04-14',
      nextReview: '2026-10-14',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['vendor', 'vendor opportunity', 'record type', 'programme', 'claim', 'co-sell', 'incentive'],
      slackQuestions: [
        'When should I create a Vendor Opportunity?',
        'What is the difference between a Vendor Opportunity and a standard opportunity?'
      ],
      changes: [
        { date: '2026-04-14', version: '2.3', summary: 'Programme reference made mandatory at creation.', reason: 'Retrospective references caused claim rejections.', affects: 'CAM, CGS, SAM', comms: 'Manager cascade', training: 'Video updated', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 5 */
  {
    id: 'stage-definitions',
    ref: 'SF-005',
    name: 'Stage Definitions',
    lane: 'salesforce',
    priority: true,
    short: 'What each opportunity stage means and the exit criteria required to leave it.',
    definition: {
      what: 'Stage Definitions set out the meaning of each opportunity stage and the evidence required to exit it. Stages describe where the buyer is, not how the seller feels.',
      why: 'Consistent stages make conversion, velocity and forecast analysis comparable across EMEA. Inconsistent stages make every downstream number unreliable.',
      inScope: ['Stage names and meanings', 'Entry and exit criteria', 'Evidence required at each exit', 'Stage regression rules'],
      outOfScope: ['Forecast categories — see Forecasting', 'Field requirements — see Opportunity Management'],
      roles: ['cam', 'cgs', 'rsm', 'sam', 'tps', 'manager'],
      related: ['opportunity-management', 'forecasting', 'pipeline-management']
    },
    rules: {
      mandatory: [
        { title: 'Stage 1 — Qualify. Exit requires a confirmed need, a named contact and a budget indication.', detail: 'Placeholder criteria — confirm with RevOps.' },
        { title: 'Stage 2 — Discover. Exit requires documented requirements and an identified decision process.', detail: 'Placeholder criteria.' },
        { title: 'Stage 3 — Propose. Exit requires a delivered proposal and a named economic buyer.', detail: 'Placeholder criteria.' },
        { title: 'Stage 4 — Negotiate. Exit requires agreed commercial terms and a confirmed close path.', detail: 'Placeholder criteria. Stage 4 exit criteria are also the third commit evidence test.' },
        { title: 'A stage may only be advanced when its exit criteria are met', detail: 'Advancing a stage to satisfy a review is a data integrity issue, not an optimisation.' }
      ],
      recommended: [
        { title: 'Record regression openly', detail: 'Moving a deal back a stage when evidence disappears is good practice, not failure.' }
      ],
      optional: [
        { title: 'Use the exit criteria checklist in deal reviews', detail: 'Optional, but it makes reviews faster.' }
      ],
      exceptions: [
        { title: 'Renewal motions', detail: 'Renewals may enter at stage 3 where the requirement and decision process are already established. Placeholder exception.' }
      ]
    },
    good: [
      { context: 'Stage advancement', bad: 'Stage advanced because time has passed.', good: 'Stage advanced because the exit criteria are met, with the evidence recorded.' },
      { context: 'Regression', bad: 'Deal held at stage 4 after the sponsor leaves, because moving back looks bad.', good: 'Deal moved back to stage 2 with a note, and requalified against the new stakeholder map.' }
    ],
    coaching: [
      'Read me the exit criteria for the current stage. Which one is not yet met?',
      'What changed on the day you advanced this deal?'
    ],
    mistakes: [
      'Using stage as a measure of effort rather than buyer progress.',
      'Skipping stages for large deals "because they are different".'
    ],
    warnings: [
      'Multiple deals advanced on the same day each month.',
      'Very high stage 4 volume with low conversion.'
    ],
    metrics: [
      { name: 'Stage Exit Compliance', what: 'Percentage of stage advances with the required evidence recorded.', why: 'The integrity of every conversion and velocity metric depends on it.', dashboard: 'Stage Compliance', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Monthly', threshold: '90% or above (placeholder)', action: 'Below threshold, managers review stage advances in one-to-ones for the following month.' }
    ],
    resources: {
      training: [
        { title: 'Stage definitions and exit criteria', type: 'Workday course', desc: '25-minute course with worked examples per stage.', token: 'workday', share: 'internal-only' }
      ],
      documentation: [
        { title: 'EMEA Stage Definition Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' },
        { title: 'Stage exit criteria card', type: 'Checklist', desc: 'One card, all stages, printable.', token: 'highspotAsset', share: 'internal-only' }
      ],
      dashboards: [
        { title: 'Stage Compliance', desc: 'Advances with and without evidence.', audience: 'Managers, RevOps', frequency: 'Monthly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'What are the stage exit criteria?', a: 'Each stage has explicit criteria: stage 1 needs confirmed need, named contact and budget indication; stage 2 needs documented requirements and decision process; stage 3 needs a delivered proposal and named economic buyer; stage 4 needs agreed commercial terms and a confirmed close path. Placeholder criteria — confirm with RevOps.' },
        { q: 'Can I skip a stage?', a: 'No, except for the documented renewal exception. Skipping breaks velocity measurement.' }
      ],
      contacts: [
        { role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns the stage model.' },
        { role: 'Content owner', name: 'Revenue Enablement — named owner to be confirmed', note: 'Owns this page.' }
      ]
    },
    internal: [
      { title: 'EMEA Stage Definition Standard (canonical)', type: 'Document', desc: 'The approved stage model.', share: 'internal-only', token: 'canonical' },
      { title: 'Stage exit criteria card', type: 'Checklist', desc: 'All stages on one card.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Deal review script for managers', type: 'Manager guidance', desc: 'How to test exit criteria without interrogating.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [
      { title: 'Joint sales process overview', type: 'Document', desc: 'How we progress deals together, in partner language.', share: 'external-approved', token: 'highspotAsset' }
    ],
    governance: {
      source: 'EMEA Stage Definition Standard (placeholder)',
      contentOwner: 'Revenue Enablement (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '3.0',
      approvalDate: '2026-06-22',
      lastReview: '2026-06-22',
      nextReview: '2026-12-22',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['stage', 'stages', 'exit criteria', 'entry criteria', 'qualify', 'discover', 'propose', 'negotiate'],
      slackQuestions: [
        'What are the stage exit criteria?',
        'What does stage 3 mean?',
        'Can I skip a stage?'
      ],
      changes: [
        { date: '2026-06-22', version: '3.0', summary: 'Stage 4 exit criteria aligned to the commit evidence test.', reason: 'Stage and forecast definitions had drifted apart.', affects: 'All selling roles and managers', comms: 'EMEA sales call', training: 'Course updated', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 6 */
  {
    id: 'event-logging',
    ref: 'SF-006',
    name: 'Event Logging',
    lane: 'salesforce',
    priority: true,
    short: 'What activity must be logged in Salesforce, by when, and to what standard.',
    definition: {
      what: 'Event Logging is the recording of meetings, calls and material partner interactions against the correct Salesforce records.',
      why: 'Activity data drives coverage analysis, partner engagement reporting and the ability for anyone to pick up an account. Unlogged activity is invisible work.',
      inScope: ['Which interactions must be logged', 'Timing expectations', 'Record association rules', 'Meeting outcome quality'],
      outOfScope: ['Personal calendar management', 'Marketing campaign activity'],
      roles: ['cam', 'cgs', 'sam', 'tps', 'manager'],
      related: ['salesforce-hygiene', 'opportunity-management', 'pipeline-management']
    },
    rules: {
      mandatory: [
        { title: 'Log partner meetings within one working day', detail: 'Placeholder timing — confirm with RevOps.' },
        { title: 'Associate the event with the partner account and, where relevant, the opportunity', detail: 'An event logged against a contact only is not discoverable in account reporting.' },
        { title: 'Record an outcome, not just attendance', detail: 'What was agreed, what changed and what happens next.' }
      ],
      recommended: [
        { title: 'Log from mobile immediately after the meeting', detail: 'Same-day logging is materially more accurate.' }
      ],
      optional: [
        { title: 'Use meeting-type tags', detail: 'Supports engagement analysis by meeting type.' }
      ],
      exceptions: [
        { title: 'Sensitive conversations', detail: 'Where a conversation is commercially sensitive, log the fact of the meeting and note the restriction. Placeholder exception.' }
      ]
    },
    good: [
      { context: 'Meeting notes', bad: '"Had a call. Good chat."', good: '"QBR with Marco Rossi (MD) and finance lead. Agreed to add security bundle to Q4 plan. Next: send pricing by 10 Aug."' },
      { context: 'Timeliness', bad: 'A week of meetings logged on Friday afternoon from memory.', good: 'Each meeting logged the same day, while the detail is accurate.' }
    ],
    coaching: [
      'Pick an account you do not own. Can you tell from the log what is happening?',
      'How many of your logged events this month contain a next step?'
    ],
    mistakes: [
      'Logging activity volume to satisfy a metric rather than to inform.',
      'Attaching events to the wrong account after a merge.'
    ],
    warnings: [
      'High event volume with low outcome quality.',
      'Events clustered on the last day of the month.'
    ],
    metrics: [
      { name: 'Event Logging Compliance', what: 'Percentage of partner meetings logged within one working day.', why: 'Late logging degrades accuracy and hides engagement gaps.', dashboard: 'Activity and Engagement', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Monthly', threshold: '85% or above (placeholder)', action: 'Below threshold, review workload and tooling before treating it as a compliance issue.' }
    ],
    resources: {
      training: [
        { title: 'Logging activity that is worth reading', type: 'Video · 5 min', desc: 'What a useful event record looks like.', token: 'highspotAsset', share: 'internal-only' }
      ],
      documentation: [
        { title: 'Activity Logging Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' }
      ],
      dashboards: [
        { title: 'Activity and Engagement', desc: 'Logging compliance and engagement coverage by partner.', audience: 'Sellers and managers', frequency: 'Monthly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'Do I need to log internal meetings?', a: 'No. Log partner and customer interactions. Internal meetings are out of scope. Placeholder rule.' },
        { q: 'What about informal conversations at events?', a: 'Log them if they change what you know about the partner or a deal.' }
      ],
      contacts: [
        { role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns the standard.' }
      ]
    },
    internal: [
      { title: 'Activity Logging Standard (canonical)', type: 'Document', desc: 'The approved rule set.', share: 'internal-only', token: 'canonical' },
      { title: 'Good and poor event examples', type: 'Guide', desc: 'Side-by-side examples.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [],
    governance: {
      source: 'Activity Logging Standard (placeholder)',
      contentOwner: 'Revenue Enablement (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Operations (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '2.1',
      approvalDate: '2026-02-10',
      lastReview: '2026-02-10',
      nextReview: '2026-08-10',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['event', 'activity', 'logging', 'meeting', 'notes', 'log'],
      slackQuestions: [
        'What activity do I need to log in Salesforce?',
        'How quickly do I need to log a meeting?'
      ],
      changes: [
        { date: '2026-02-10', version: '2.1', summary: 'Outcome field added to the logging standard.', reason: 'Attendance-only records had no downstream value.', affects: 'All selling roles', comms: 'Manager cascade', training: 'Video added', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 7 */
  {
    id: 'salesforce-hygiene',
    ref: 'SF-007',
    name: 'Salesforce Hygiene',
    lane: 'salesforce',
    priority: true,
    short: 'The weekly data standards that keep Salesforce trustworthy.',
    definition: {
      what: 'Salesforce Hygiene is the routine maintenance of account, contact and opportunity data so that the system remains accurate, complete and usable.',
      why: 'Hygiene is the difference between a system of record and a system of guesswork. Poor hygiene costs every downstream process.',
      inScope: ['Duplicate management', 'Contact accuracy and role tagging', 'Account hierarchy correctness', 'Weekly hygiene routine'],
      outOfScope: ['Field-level requirements — see Opportunity Management', 'Access and permissions — raise a Salesforce Case'],
      roles: ['cam', 'cgs', 'sam', 'manager', 'revops'],
      related: ['opportunity-management', 'event-logging', 'salesforce-cases'],
    },
    rules: {
      mandatory: [
        { title: 'Clear your data quality exceptions weekly', detail: 'The exception list is issued Monday and should be clear by Friday. Placeholder cadence.' },
        { title: 'Do not create a duplicate account to work around access', detail: 'Raise a Salesforce Case instead.' },
        { title: 'Keep primary contact and decision-maker roles current', detail: 'Stakeholder changes must be reflected within five working days.' }
      ],
      recommended: [
        { title: 'Book 20 minutes on Friday for hygiene', detail: 'Little and often beats a quarterly clean-up.' }
      ],
      optional: [
        { title: 'Use the hygiene checklist', detail: 'Optional structure for the weekly routine.' }
      ],
      exceptions: [
        { title: 'Bulk data migrations', detail: 'During a migration, exceptions are managed by RevOps rather than individual sellers.' }
      ]
    },
    good: [
      { context: 'Weekly routine', bad: 'Data cleaned once a quarter under pressure before a board report.', good: 'Twenty minutes each Friday, exceptions cleared, nothing accumulates.' },
      { context: 'Duplicates', bad: 'A second account created because the first could not be found.', good: 'A search performed, then a case raised if the record genuinely does not exist.' }
    ],
    coaching: [
      'How many open exceptions do you have, and how old is the oldest?',
      'When did you last check the decision-maker roles on your top five accounts?'
    ],
    mistakes: ['Treating hygiene as a RevOps problem.', 'Fixing symptoms in reports rather than the underlying record.'],
    warnings: ['Exception counts rising week on week.', 'Duplicate creation spikes after a territory change.'],
    metrics: [
      { name: 'Pipeline Hygiene Score', what: 'Composite of field completion, record age and duplicate rate for your book.', why: 'A single number that tells you whether your data can be trusted.', dashboard: 'Salesforce Data Quality', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Weekly', threshold: '90 or above (placeholder)', action: 'Below threshold for two weeks, your manager reviews the exception list with you.' }
    ],
    resources: {
      training: [{ title: 'Weekly hygiene routine', type: 'Video · 4 min', desc: 'The twenty-minute Friday routine.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [
        { title: 'Salesforce Data Standards', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' },
        { title: 'Hygiene checklist', type: 'Checklist', desc: 'Weekly routine on one page.', token: 'highspotAsset', share: 'internal-only' }
      ],
      dashboards: [{ title: 'Salesforce Data Quality', desc: 'Your exception list and hygiene score.', audience: 'Sellers and managers', frequency: 'Weekly', token: 'dashboard' }],
      faqs: [
        { q: 'Who fixes duplicates?', a: 'You raise a Salesforce Case; RevOps performs the merge. Do not attempt manual workarounds.' },
        { q: 'Does hygiene affect my compensation?', a: 'No. It affects the reliability of the reporting your performance is discussed against. Placeholder answer — confirm with Sales Operations.' }
      ],
      contacts: [{ role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns data standards.' }]
    },
    internal: [
      { title: 'Salesforce Data Standards (canonical)', type: 'Document', desc: 'The approved standards.', share: 'internal-only', token: 'canonical' },
      { title: 'Hygiene checklist', type: 'Checklist', desc: 'Weekly routine.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [],
    governance: {
      source: 'Salesforce Data Standards (placeholder)',
      contentOwner: 'RevOps (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Operations (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '1.9',
      approvalDate: '2025-12-08',
      lastReview: '2025-12-08',
      nextReview: '2026-06-08',
      cadence: 'Every 6 months',
      lifecycle: 'review-due',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['hygiene', 'data quality', 'duplicates', 'clean', 'exceptions'],
      slackQuestions: ['What is good Salesforce hygiene?', 'How do I fix a duplicate account?'],
      changes: [
        { date: '2025-12-08', version: '1.9', summary: 'Weekly exception clearance introduced.', reason: 'Quarterly clean-ups were ineffective.', affects: 'All selling roles', comms: 'Manager cascade', training: 'Video added', indexed: true }
      ]
    }
  },

  /* ---------------------------------------------------------------------- 8 */
  {
    id: 'dashboard-usage',
    ref: 'SF-008',
    name: 'Dashboard Usage',
    lane: 'salesforce',
    priority: true,
    short: 'Which dashboard to use for which question, and how often to look at it.',
    definition: {
      what: 'Dashboard Usage defines the approved Salesforce dashboards, what each answers, who it is for and how frequently it should be used.',
      why: 'Sellers build private reports because they cannot find the approved dashboard. Private reports diverge, and two people arrive at a meeting with different numbers.',
      inScope: ['Approved dashboard catalogue', 'Intended audience and cadence', 'How to request a change'],
      outOfScope: ['Report building training', 'Data warehouse and BI reporting'],
      roles: ['cam', 'cgs', 'rsm', 'sam', 'manager', 'revops'],
      related: ['pipeline-management', 'forecasting', 'pipeline-inspection']
    },
    rules: {
      mandatory: [
        { title: 'Use the approved dashboard for any number quoted in a review', detail: 'Private reports may be used for personal working, not for reporting upward.' },
        { title: 'Request dashboard changes through a Salesforce Case', detail: 'Do not clone and modify a governed dashboard.' }
      ],
      recommended: [
        { title: 'Pin your three core dashboards', detail: 'Pipeline Health, Forecast Accuracy and Data Quality for most selling roles.' }
      ],
      optional: [{ title: 'Subscribe to weekly dashboard emails', detail: 'Useful if you prefer a push rhythm.' }],
      exceptions: [{ title: 'Ad hoc leadership requests', detail: 'One-off analyses are produced by RevOps rather than built locally.' }]
    },
    good: [
      { context: 'Meeting preparation', bad: 'A personally built report shown in a leadership review, with numbers nobody else can reproduce.', good: 'The approved dashboard on screen, with the same figures everyone else sees.' }
    ],
    coaching: ['Which dashboard did that number come from?', 'Could I reproduce this view without your help?'],
    mistakes: ['Cloning a dashboard and letting it drift.', 'Using a dashboard outside its intended audience.'],
    warnings: ['Numbers in reviews that do not reconcile to the approved dashboards.'],
    metrics: [
      { name: 'Dashboard Adoption', what: 'Percentage of active sellers using an approved dashboard weekly.', why: 'Low adoption predicts divergent numbers in reviews.', dashboard: 'Enablement Adoption', dashboardToken: 'dashboard', owner: 'Revenue Enablement (placeholder)', cadence: 'Monthly', threshold: '80% or above (placeholder)', action: 'Below threshold, review dashboard discoverability before adding communications.' }
    ],
    resources: {
      training: [{ title: 'Dashboard tour for sellers', type: 'Video · 9 min', desc: 'The core dashboards and what each answers.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [{ title: 'Approved Dashboard Catalogue', type: 'Canonical source', desc: 'The authoritative list of approved dashboards.', token: 'canonical', share: 'internal-only' }],
      dashboards: [
        { title: 'EMEA Pipeline Health', desc: 'Coverage, ageing, next-step completeness.', audience: 'Sellers and managers', frequency: 'Weekly', token: 'dashboard' },
        { title: 'EMEA Forecast Accuracy', desc: 'Accuracy and slippage.', audience: 'Managers and leadership', frequency: 'Weekly', token: 'dashboard' },
        { title: 'Salesforce Data Quality', desc: 'Exceptions and hygiene score.', audience: 'Sellers and managers', frequency: 'Weekly', token: 'dashboard' },
        { title: 'Activity and Engagement', desc: 'Logging compliance and engagement coverage.', audience: 'Sellers and managers', frequency: 'Monthly', token: 'dashboard' }
      ],
      faqs: [
        { q: 'Where is the forecast dashboard?', a: 'EMEA Forecast Accuracy is the approved forecast dashboard for managers and leadership. Sellers see their own submission status in Forecast Submission Status. Placeholder answer.' },
        { q: 'Can I build my own report?', a: 'Yes, for personal working. Not for numbers quoted in reviews.' }
      ],
      contacts: [{ role: 'Process owner', name: 'RevOps EMEA — named owner to be confirmed', note: 'Owns the dashboard catalogue.' }]
    },
    internal: [
      { title: 'Approved Dashboard Catalogue (canonical)', type: 'Document', desc: 'Every approved dashboard with audience and cadence.', share: 'internal-only', token: 'canonical' },
      { title: 'Leadership reporting pack', type: 'Leadership reporting', desc: 'Monthly pack for EMEA leadership.', share: 'restricted', token: 'dashboard' }
    ],
    partner: [],
    governance: {
      source: 'Approved Dashboard Catalogue (placeholder)',
      contentOwner: 'RevOps (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Operations (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '2.0',
      approvalDate: '2026-05-05',
      lastReview: '2026-05-05',
      nextReview: '2026-11-05',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['dashboard', 'report', 'reporting', 'where is', 'metrics', 'analytics'],
      slackQuestions: ['Where is the forecast dashboard?', 'Which dashboard shows pipeline coverage?'],
      changes: [{ date: '2026-05-05', version: '2.0', summary: 'Catalogue reduced from 31 dashboards to 9 approved dashboards.', reason: 'Duplication and divergent numbers.', affects: 'All roles', comms: 'EMEA sales call', training: 'Tour video updated', indexed: true }]
    }
  },

  /* ---------------------------------------------------------------------- 9 */
  {
    id: 'pipeline-inspection',
    ref: 'SF-009',
    name: 'Pipeline Inspection',
    lane: 'pipeline-opportunity',
    priority: true,
    short: 'How managers inspect pipeline consistently, and what sellers should have ready.',
    definition: {
      what: 'Pipeline Inspection is the structured manager review of a seller\'s pipeline, using the approved dashboards and a consistent question set.',
      why: 'Inconsistent inspection produces inconsistent behaviour. A shared standard makes coaching fair and comparable across teams.',
      inScope: ['Inspection cadence', 'Preparation expectations for sellers', 'Manager question set', 'Follow-up and actions'],
      outOfScope: ['Performance management processes', 'Forecast submission — see Forecasting'],
      roles: ['rsm', 'manager', 'cam', 'cgs', 'sam'],
      related: ['pipeline-management', 'forecasting', 'dashboard-usage']
    },
    rules: {
      mandatory: [
        { title: 'Inspection happens weekly for every seller', detail: 'Placeholder cadence — confirm with Sales Leadership.' },
        { title: 'Inspection uses the approved dashboards only', detail: 'No parallel spreadsheets.' },
        { title: 'Every inspection ends with dated actions', detail: 'Actions are recorded where both parties can see them.' }
      ],
      recommended: [{ title: 'Rotate the focus area', detail: 'Coverage one week, ageing the next, keeps inspection from becoming ritual.' }],
      optional: [{ title: 'Use the inspection question bank', detail: 'Optional but recommended for new managers.' }],
      exceptions: [{ title: 'Leave and absence', detail: 'Inspection resumes on return; it is not backfilled.' }]
    },
    good: [
      { context: 'Inspection focus', bad: 'The manager reads out the pipeline list and the seller confirms it.', good: 'The manager tests evidence on three deals and leaves with dated actions on each.' }
    ],
    coaching: ['What did last week\'s actions produce?', 'Which deal are you least confident about, and why?'],
    mistakes: ['Inspecting the number rather than the behaviour behind it.', 'Allowing inspection to become a status report.'],
    warnings: ['Actions repeated week after week with no change.'],
    metrics: [
      { name: 'Inspection Coverage', what: 'Percentage of sellers inspected weekly.', why: 'Coaching consistency is the strongest lever on behaviour change.', dashboard: 'Manager Rhythm', dashboardToken: 'dashboard', owner: 'Sales Leadership (placeholder)', cadence: 'Monthly', threshold: '95% or above (placeholder)', action: 'Below threshold, review manager span of control and calendar load.' }
    ],
    resources: {
      training: [{ title: 'Running an evidence-based inspection', type: 'Live session', desc: 'Monthly manager session with practice.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [{ title: 'Pipeline Inspection Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' }],
      dashboards: [{ title: 'Manager Rhythm', desc: 'Inspection coverage and action follow-through.', audience: 'Managers and leadership', frequency: 'Monthly', token: 'dashboard' }],
      faqs: [{ q: 'Is inspection the same as the forecast call?', a: 'No. Inspection examines the pipeline and behaviour; the forecast call agrees the number. Placeholder answer.' }],
      contacts: [{ role: 'Process owner', name: 'Sales Leadership EMEA — named owner to be confirmed', note: 'Owns the inspection standard.' }]
    },
    internal: [
      { title: 'Pipeline Inspection Standard (canonical)', type: 'Document', desc: 'The approved standard.', share: 'internal-only', token: 'canonical' },
      { title: 'Inspection question bank', type: 'Manager guidance', desc: 'Questions by focus area.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Manager scorecard', type: 'Leadership reporting', desc: 'Inspection consistency by manager.', share: 'restricted', token: 'dashboard' }
    ],
    partner: [],
    governance: {
      source: 'Pipeline Inspection Standard (placeholder)',
      contentOwner: 'Revenue Enablement (placeholder)',
      processOwner: 'Sales Leadership (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '1.4',
      approvalDate: '2026-06-30',
      lastReview: '2026-06-30',
      nextReview: '2026-12-30',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['inspection', 'review', 'coaching', 'one to one', 'manager'],
      slackQuestions: ['How should managers inspect pipeline?', 'What should I prepare for pipeline inspection?'],
      changes: [{ date: '2026-06-30', version: '1.4', summary: 'Dated actions made mandatory at the end of every inspection.', reason: 'Actions were agreed verbally and lost.', affects: 'Managers, RSM', comms: 'Manager forum', training: 'Session updated', indexed: true }]
    }
  },

  /* --------------------------------------------------------------------- 10 */
  {
    id: 'mql-process',
    ref: 'SF-010',
    name: 'MQL Process',
    lane: 'salesforce',
    priority: true,
    short: 'What an MQL is, the response expectation, and how acceptance or rejection is recorded.',
    definition: {
      what: 'The MQL Process covers the handling of marketing qualified leads from assignment through to acceptance, rejection or conversion.',
      why: 'Marketing investment is judged on what happens after the hand-off. Slow or silent handling makes the investment unmeasurable and wastes demand.',
      inScope: ['MQL definition and scoring threshold', 'Response SLA', 'Acceptance and rejection reasons', 'Conversion to opportunity'],
      outOfScope: ['Campaign design', 'Lead scoring model maintenance', 'Partner-sourced leads'],
      roles: ['cgs', 'cam', 'manager', 'enablement'],
      related: ['opportunity-management', 'salesforce-hygiene']
    },
    rules: {
      mandatory: [
        { title: 'Respond to an assigned MQL within one working day', detail: 'Placeholder SLA — confirm with Marketing and RevOps.' },
        { title: 'Record acceptance or rejection with a reason', detail: 'Silent MQLs are treated as unworked.' },
        { title: 'Convert to an opportunity only when stage 1 entry criteria are met', detail: 'Premature conversion inflates pipeline.' }
      ],
      recommended: [{ title: 'Reject clearly and early', detail: 'A fast, well-reasoned rejection is more valuable to marketing than a slow acceptance.' }],
      optional: [{ title: 'Use the MQL follow-up templates', detail: 'Approved outreach templates are available.' }],
      exceptions: [{ title: 'Event surges', detail: 'Following major events the SLA extends to two working days. Placeholder exception.' }]
    },
    good: [
      { context: 'Response', bad: 'MQL sits unworked for three weeks then is rejected as "old".', good: 'MQL contacted within one working day and accepted or rejected with a reason that marketing can act on.' }
    ],
    coaching: ['How many MQLs are open beyond SLA in your queue?', 'What is your most common rejection reason, and what does it tell marketing?'],
    mistakes: ['Rejecting without a reason.', 'Converting every MQL to an opportunity to appear responsive.'],
    warnings: ['Rejection reasons concentrated in "not interested" with no detail.'],
    metrics: [
      { name: 'MQL Acceptance Rate', what: 'Percentage of MQLs accepted by sales.', why: 'Signals whether the scoring model is producing usable leads.', dashboard: 'Demand and MQL Flow', dashboardToken: 'dashboard', owner: 'Marketing (placeholder)', cadence: 'Monthly', threshold: '55% or above (placeholder)', action: 'Persistent low acceptance triggers a joint marketing and sales review of the scoring model.' },
      { name: 'MQL Response Time', what: 'Time from assignment to first recorded action.', why: 'Response speed is the strongest predictor of conversion.', dashboard: 'Demand and MQL Flow', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Weekly', threshold: '90% within one working day (placeholder)', action: 'Below threshold, review queue routing before treating it as individual performance.' }
    ],
    resources: {
      training: [{ title: 'Working an MQL well', type: 'Video · 6 min', desc: 'Response, qualification and rejection quality.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [{ title: 'MQL Definition and SLA', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' }],
      dashboards: [{ title: 'Demand and MQL Flow', desc: 'Volume, response time, acceptance and conversion.', audience: 'Sellers, managers, marketing', frequency: 'Weekly', token: 'dashboard' }],
      faqs: [
        { q: 'What is an MQL?', a: 'A lead that has met the agreed marketing scoring threshold and been assigned to sales for follow-up. Placeholder definition — confirm with Marketing.' },
        { q: 'What if the MQL is a duplicate of an existing partner?', a: 'Reject with the duplicate reason and note the existing account. Do not create a new record.' }
      ],
      contacts: [
        { role: 'Marketing owner', name: 'EMEA Demand Generation — to be confirmed', note: 'Owns the scoring model.' },
        { role: 'Process owner', name: 'RevOps EMEA — to be confirmed', note: 'Owns routing and SLA measurement.' }
      ]
    },
    internal: [
      { title: 'MQL Definition and SLA (canonical)', type: 'Document', desc: 'The approved definition and SLA.', share: 'internal-only', token: 'canonical' },
      { title: 'Rejection reason definitions', type: 'Guide', desc: 'What each rejection reason means.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Approved MQL outreach templates', type: 'Template', desc: 'First-contact templates by campaign type.', share: 'manager-approval', token: 'highspotAsset' }
    ],
    partner: [],
    governance: {
      source: 'MQL Definition and SLA (placeholder)',
      contentOwner: 'Marketing (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Marketing and Sales Operations (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Demand Generation lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '2.2',
      approvalDate: '2026-03-24',
      lastReview: '2026-03-24',
      nextReview: '2026-09-24',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['mql', 'lead', 'marketing qualified', 'sla', 'acceptance', 'rejection'],
      slackQuestions: ['What is an MQL?', 'How quickly must I respond to an MQL?'],
      changes: [{ date: '2026-03-24', version: '2.2', summary: 'SLA reduced from two working days to one.', reason: 'Conversion analysis showed a sharp drop after 24 hours.', affects: 'CGS, CAM', comms: 'Manager cascade', training: 'Video updated', indexed: true }]
    }
  },

  /* --------------------------------------------------------------------- 11 */
  {
    id: 'tps-handoffs',
    ref: 'SF-011',
    name: 'TPS Handoffs',
    lane: 'salesforce',
    priority: true,
    short: 'How technical presales support is requested, accepted and handed back.',
    definition: {
      what: 'TPS Handoffs covers the request, acceptance, delivery and hand-back of technical presales support on an opportunity.',
      why: 'Technical capacity is finite. Unstructured requests create rework, unclear expectations and deals that stall waiting for support that was never formally requested.',
      inScope: ['Raising a TPS request', 'Information required at request', 'Acceptance and prioritisation', 'Hand-back and documentation'],
      outOfScope: ['Post-sale delivery — see Professional Services lane', 'Product roadmap questions'],
      roles: ['tps', 'cam', 'cgs', 'sam', 'manager'],
      related: ['opportunity-management', 'stage-definitions']
    },
    rules: {
      mandatory: [
        { title: 'Raise TPS requests through the Salesforce request process', detail: 'Direct messages are not a request. Placeholder rule.' },
        { title: 'The opportunity must be at stage 2 or above with requirements documented', detail: 'Requests without documented requirements are returned.' },
        { title: 'Record the outcome of TPS involvement on the opportunity', detail: 'Including what was demonstrated and what was committed.' }
      ],
      recommended: [{ title: 'Give five working days notice where possible', detail: 'Short-notice requests are accepted but prioritised last.' }],
      optional: [{ title: 'Use the joint preparation call', detail: 'A 15-minute prep call improves outcomes materially.' }],
      exceptions: [{ title: 'Strategic accounts', detail: 'SAM-led strategic accounts may request at stage 1 with RSM approval. Placeholder exception.' }]
    },
    good: [
      { context: 'Request quality', bad: 'A message saying "can you join a call tomorrow" with no context.', good: 'A request with the opportunity link, documented requirements, attendee list, and the specific outcome needed.' },
      { context: 'Hand-back', bad: 'TPS leaves the call and nothing is recorded.', good: 'The technical outcome, commitments made and open items are recorded on the opportunity the same day.' }
    ],
    coaching: ['What did the TPS commit to on this deal, and where is it recorded?', 'Would this request have been accepted if you had received it?'],
    mistakes: ['Requesting TPS to compensate for weak qualification.', 'Promising capability in a demonstration without checking limitations.'],
    warnings: ['High volume of short-notice requests from one team.', 'Repeat demonstrations on the same opportunity.'],
    metrics: [
      { name: 'TPS Request Acceptance Rate', what: 'Percentage of requests accepted without return for more information.', why: 'Shows whether requests carry enough context to be actioned.', dashboard: 'Presales Demand', dashboardToken: 'dashboard', owner: 'Technical Presales (placeholder)', cadence: 'Monthly', threshold: '85% or above (placeholder)', action: 'Below threshold, run a request-quality session with the affected teams.' }
    ],
    resources: {
      training: [{ title: 'Raising a good TPS request', type: 'Video · 5 min', desc: 'What to include and why.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [{ title: 'TPS Engagement Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' }],
      dashboards: [{ title: 'Presales Demand', desc: 'Request volume, acceptance and turnaround.', audience: 'Managers, TPS', frequency: 'Monthly', token: 'dashboard' }],
      faqs: [{ q: 'How much notice does TPS need?', a: 'Five working days where possible. Short-notice requests are accepted but prioritised last. Placeholder answer.' }],
      contacts: [{ role: 'Process owner', name: 'Technical Presales EMEA — to be confirmed', note: 'Owns the engagement standard.' }]
    },
    internal: [
      { title: 'TPS Engagement Standard (canonical)', type: 'Document', desc: 'The approved standard.', share: 'internal-only', token: 'canonical' },
      { title: 'What not to promise in a demonstration', type: 'Internal guidance', desc: 'Known product limitations and safe language.', share: 'internal-only', token: 'highspotAsset' },
      { title: 'Internal demonstration environment guide', type: 'Internal demonstration', desc: 'Access and reset procedures.', share: 'restricted', token: 'highspotAsset' }
    ],
    partner: [
      { title: 'Technical discovery question set', type: 'Conversation guide', desc: 'Questions to run with a partner before a technical session.', share: 'external-approved', token: 'highspotAsset' },
      { title: 'Solution overview deck', type: 'Presentation', desc: 'Partner-safe technical overview.', share: 'conditional', condition: 'Share as PDF. The editable version contains internal notes and is internal only.', token: 'highspotAsset' }
    ],
    governance: {
      source: 'TPS Engagement Standard (placeholder)',
      contentOwner: 'Technical Presales (placeholder)',
      processOwner: 'Technical Presales (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'Technical Presales lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '1.7',
      approvalDate: '2026-05-27',
      lastReview: '2026-05-27',
      nextReview: '2026-11-27',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['tps', 'presales', 'handoff', 'demo', 'demonstration', 'technical', 'request'],
      slackQuestions: ['How do I request TPS support?', 'How much notice does TPS need?'],
      changes: [{ date: '2026-05-27', version: '1.7', summary: 'Stage 2 minimum introduced for TPS requests.', reason: 'Presales capacity was being spent on unqualified deals.', affects: 'CAM, CGS, SAM, TPS', comms: 'Manager cascade', training: 'Video updated', indexed: true }]
    }
  },

  /* --------------------------------------------------------------------- 12 */
  {
    id: 'salesforce-cases',
    ref: 'SF-012',
    name: 'Salesforce Cases',
    lane: 'salesforce',
    priority: true,
    short: 'How to raise a Salesforce support case, what to include, and what to expect.',
    definition: {
      what: 'Salesforce Cases covers the process for requesting support with Salesforce access, data, configuration and errors.',
      why: 'Cases raised without detail take three times as long to resolve. A consistent process protects both the seller and the support queue.',
      inScope: ['When to raise a case', 'Required information', 'Priority definitions', 'Expected resolution times'],
      outOfScope: ['Process change requests — raise with the process owner', 'Training questions — see Resources and Enablement'],
      roles: ['cam', 'cgs', 'rsm', 'sam', 'tps', 'manager', 'revops'],
      related: ['salesforce-hygiene', 'opportunity-management']
    },
    rules: {
      mandatory: [
        { title: 'Raise cases through the Salesforce support queue', detail: 'Not through direct messages to RevOps individuals. Placeholder rule.' },
        { title: 'Include record links, screenshots and the exact error text', detail: 'Cases without these are returned for information.' }
      ],
      recommended: [{ title: 'Check the FAQ before raising', detail: 'A third of cases are answered by the existing FAQ. Placeholder figure.' }],
      optional: [{ title: 'Subscribe to case status notifications', detail: 'Useful for time-sensitive issues.' }],
      exceptions: [{ title: 'Quarter-end critical issues', detail: 'Deal-blocking issues in the final three days of a quarter may be escalated directly to the RevOps duty contact. Placeholder exception.' }]
    },
    good: [
      { context: 'Case quality', bad: '"Salesforce is broken, can someone help."', good: '"Validation error VR-114 on opportunity [link] when setting close date beyond 12 months. Screenshot attached. Blocking a quote due Friday."' }
    ],
    coaching: ['Could support act on your last case without asking you a question?'],
    mistakes: ['Raising a case for a process disagreement rather than a system fault.', 'Duplicating a case in Slack.'],
    warnings: ['Repeat cases on the same validation rule may indicate a process or training gap.'],
    metrics: [
      { name: 'Salesforce Case Resolution', what: 'Median time from case creation to resolution.', why: 'Slow resolution blocks deals and drives workarounds.', dashboard: 'Support Performance', dashboardToken: 'dashboard', owner: 'RevOps (placeholder)', cadence: 'Monthly', threshold: 'Median under 2 working days (placeholder)', action: 'Above threshold, review case categories for automation or FAQ opportunities.' }
    ],
    resources: {
      training: [{ title: 'Raising an effective case', type: 'Video · 3 min', desc: 'What to include.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [{ title: 'Salesforce Support Process', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' }],
      dashboards: [{ title: 'Support Performance', desc: 'Case volume, categories and resolution times.', audience: 'RevOps, managers', frequency: 'Monthly', token: 'dashboard' }],
      faqs: [
        { q: 'How do I get access to a record I cannot see?', a: 'Raise a case with the record link and the business reason. Access is granted by role, not by request volume. Placeholder answer.' },
        { q: 'What priority should I use?', a: 'Critical is reserved for deal-blocking issues. Placeholder definition.' }
      ],
      contacts: [{ role: 'Technical support contact', name: 'Salesforce support queue — to be confirmed', note: 'First line for all system issues.' }]
    },
    internal: [
      { title: 'Salesforce Support Process (canonical)', type: 'Document', desc: 'The approved process.', share: 'internal-only', token: 'canonical' },
      { title: 'Common validation errors and fixes', type: 'Guide', desc: 'Self-service fixes for the ten most common errors.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [],
    governance: {
      source: 'Salesforce Support Process (placeholder)',
      contentOwner: 'RevOps (placeholder)',
      processOwner: 'RevOps (placeholder)',
      approver: 'EMEA Sales Operations (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'RevOps duty contact (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '1.2',
      approvalDate: '2026-01-20',
      lastReview: '2026-01-20',
      nextReview: '2026-07-20',
      cadence: 'Every 6 months',
      lifecycle: 'review-due',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['case', 'support', 'error', 'access', 'help', 'ticket', 'validation'],
      slackQuestions: ['How do I raise a Salesforce case?', 'Who do I contact about a Salesforce error?'],
      changes: [{ date: '2026-01-20', version: '1.2', summary: 'Priority definitions clarified.', reason: 'Critical was over-used, delaying genuine blockers.', affects: 'All roles', comms: 'Email', training: 'No change', indexed: true }]
    }
  },

  /* --------------------------------------------------------------------- 13 */
  {
    id: 'opportunity-ownership',
    ref: 'SF-013',
    name: 'Opportunity Ownership Rules',
    lane: 'salesforce',
    priority: true,
    short: 'Who owns an opportunity, when ownership transfers, and how splits are handled.',
    definition: {
      what: 'Opportunity Ownership Rules define who is accountable for an opportunity record, when ownership changes and how credit is shared.',
      why: 'Ownership disputes consume management time and damage trust. Clear rules resolve most cases before they escalate.',
      inScope: ['Default ownership at creation', 'Transfer triggers and process', 'Split and credit rules', 'Dispute resolution'],
      outOfScope: ['Compensation plan design', 'Territory design'],
      roles: ['cam', 'cgs', 'rsm', 'sam', 'manager', 'revops'],
      related: ['opportunity-management', 'vendor-opportunity']
    },
    rules: {
      mandatory: [
        { title: 'The opportunity owner is the role accountable for the partner relationship at creation', detail: 'Placeholder rule — confirm with Sales Operations.' },
        { title: 'Ownership transfers require manager approval on both sides', detail: 'Recorded in the opportunity, not agreed verbally.' },
        { title: 'Splits must be recorded at creation or at transfer, not at close', detail: 'Retrospective splits are not accepted.' }
      ],
      recommended: [{ title: 'Agree the split at the first joint meeting', detail: 'Earlier agreement, fewer disputes.' }],
      optional: [{ title: 'Use the ownership summary in account plans', detail: 'Helps avoid overlap.' }],
      exceptions: [{ title: 'Territory changes', detail: 'Bulk transfers during territory changes are executed by RevOps under a documented plan.' }]
    },
    good: [
      { context: 'Transfers', bad: 'Ownership changed in Salesforce and discussed afterwards.', good: 'Both managers approve, the reason is recorded, and the partner sees one continuous relationship.' }
    ],
    coaching: ['Which of your deals have an ownership question that has not been resolved?'],
    mistakes: ['Leaving disputes to be settled at quarter end.', 'Recording splits informally in notes.'],
    warnings: ['Ownership changes concentrated in the final two weeks of a quarter.'],
    metrics: [
      { name: 'Ownership Dispute Volume', what: 'Number of ownership disputes escalated per quarter.', why: 'A leading indicator of unclear territory or rule interpretation.', dashboard: 'Sales Operations Exceptions', dashboardToken: 'dashboard', owner: 'Sales Operations (placeholder)', cadence: 'Quarterly', threshold: 'Trend downward (placeholder)', action: 'Recurring dispute patterns trigger a rules clarification rather than case-by-case adjudication.' }
    ],
    resources: {
      training: [{ title: 'Ownership and splits explained', type: 'Video · 6 min', desc: 'Rules and worked examples.', token: 'highspotAsset', share: 'internal-only' }],
      documentation: [{ title: 'Opportunity Ownership Standard', type: 'Canonical source', desc: 'The authoritative business record for this topic.', token: 'canonical', share: 'internal-only' }],
      dashboards: [{ title: 'Sales Operations Exceptions', desc: 'Disputes, transfers and exceptions.', audience: 'Managers, Sales Operations', frequency: 'Quarterly', token: 'dashboard' }],
      faqs: [{ q: 'Who owns a deal introduced by another team?', a: 'The role accountable for the partner relationship owns the record; the introducing role is recorded as a split. Placeholder answer — confirm with Sales Operations.' }],
      contacts: [{ role: 'Process owner', name: 'EMEA Sales Operations — to be confirmed', note: 'Owns ownership rules and adjudication.' }]
    },
    internal: [
      { title: 'Opportunity Ownership Standard (canonical)', type: 'Document', desc: 'The approved rules.', share: 'internal-only', token: 'canonical' },
      { title: 'Dispute escalation path', type: 'Internal guidance', desc: 'Who decides, and in what order.', share: 'internal-only', token: 'highspotAsset' }
    ],
    partner: [],
    governance: {
      source: 'Opportunity Ownership Standard (placeholder)',
      contentOwner: 'RevOps (placeholder)',
      processOwner: 'EMEA Sales Operations (placeholder)',
      approver: 'EMEA Sales Leadership (placeholder)',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'EMEA Sales Operations lead (placeholder)',
      approvalStatus: 'approved',
      publication: 'Published in Highspot',
      version: '2.5',
      approvalDate: '2026-04-02',
      lastReview: '2026-04-02',
      nextReview: '2026-10-02',
      cadence: 'Every 6 months',
      lifecycle: 'published',
      shareability: 'internal-only',
      indexed: true,
      keywords: ['ownership', 'owner', 'split', 'transfer', 'credit', 'dispute'],
      slackQuestions: ['Who owns an opportunity?', 'How do I record a split?'],
      changes: [{ date: '2026-04-02', version: '2.5', summary: 'Retrospective splits prohibited.', reason: 'Late splits distorted attainment reporting.', affects: 'All selling roles and managers', comms: 'Manager cascade', training: 'Video updated', indexed: true }]
    }
  },

  /* --------------------------------------------------------------------- 14 */
  /* Deliberately incomplete record. Demonstrates the governance flag states.  */
  {
    id: 'partner-ai-conversations',
    ref: 'SF-014',
    name: 'AI Conversations with Partners',
    lane: 'ai',
    priority: false,
    short: 'Draft guidance on discussing AI capability with partners. Not approved. Do not use.',
    definition: {
      what: 'Draft guidance covering what may and may not be stated to partners about AI capability, roadmap and data handling.',
      why: 'Sellers are being asked AI questions in partner meetings today, and there is no approved answer. This record exists so the gap is visible rather than hidden.',
      inScope: ['Approved AI messaging for partner conversations', 'Data handling statements', 'Roadmap language'],
      outOfScope: ['Internal AI tooling policy', 'Product roadmap commitments'],
      roles: ['cam', 'cgs', 'sam', 'tps'],
      related: ['tps-handoffs']
    },
    rules: {
      mandatory: [],
      recommended: [],
      optional: [],
      exceptions: []
    },
    good: [],
    coaching: [],
    mistakes: [],
    warnings: [],
    metrics: [],
    resources: { training: [], documentation: [], dashboards: [], faqs: [], contacts: [] },
    internal: [
      { title: 'Draft AI conversation guidance', type: 'Draft document', desc: 'Under review by Product Marketing and Legal.', share: 'draft', token: 'canonical' }
    ],
    partner: [],
    governance: {
      source: 'Not yet established',
      contentOwner: '',
      processOwner: 'Product Marketing (proposed, unconfirmed)',
      approver: '',
      enablementOwner: 'Revenue Enablement (placeholder)',
      escalation: 'Revenue Enablement lead (placeholder)',
      approvalStatus: 'not-approved',
      publication: 'Not published',
      version: '0.3',
      approvalDate: '',
      lastReview: '',
      nextReview: '',
      cadence: 'Not set',
      lifecycle: 'draft',
      shareability: 'draft',
      indexed: false,
      keywords: ['ai', 'partner ai', 'ai messaging', 'ai policy'],
      slackQuestions: ['What can I say to a partner about AI?', 'Is there approved AI messaging for partner calls?'],
      changes: [{ date: '2026-07-15', version: '0.3', summary: 'Draft circulated for review.', reason: 'Rising volume of unanswered Slack questions on AI messaging.', affects: 'CAM, CGS, SAM, TPS', comms: 'None', training: 'Not started', indexed: false }]
    }
  }
];

/* --------------------------------------------------- content gap demo cases */
/* Questions the Slack assistant can answer from an approved source that has  */
/* NOT yet been published into Highspot. These drive the content-gap state.   */
const CONTENT_GAPS = [
  {
    question: 'What can I share with a partner about MIP?',
    keywords: ['mip', 'managed intelligence', 'mip partner', 'share mip'],
    answer: 'You may share the approved MIP overview and the partner presentation. The internal demonstration and the commercial guidance are not partner-facing.',
    source: 'MIP Partner Guidance, version 3.2 (placeholder)',
    lastReview: '2026-07-29',
    owner: 'Product Marketing (placeholder)',
    lane: 'mip',
    note: 'This answer comes from an approved source document that has not yet been published in the MIP lane in Highspot.'
  },
  {
    question: 'What is the escalation path for a partner data request?',
    keywords: ['data request', 'gdpr', 'escalation data', 'privacy request'],
    answer: 'Partner data requests are routed to the EMEA privacy inbox within one working day and acknowledged in writing.',
    source: 'EMEA Privacy Response Procedure, version 1.1 (placeholder)',
    lastReview: '2026-06-11',
    owner: 'Legal and Compliance (placeholder)',
    lane: 'salesforce',
    note: 'Approved source exists outside Highspot. No Highspot topic page has been created for it yet.'
  }
];

/* ------------------------------------------------------- suggested searches */
const SUGGESTED_QUESTIONS = [
  'What is Commit Forecast?',
  'When should I create a Vendor Opportunity?',
  'What are the stage exit criteria?',
  'What is our pipeline coverage target?',
  'Which opportunity fields are required?',
  'What can I share with a partner?',
  'Where is the forecast dashboard?'
];

/* ------------------------------------------------------- governance stages */
const GOVERNANCE_STAGES = [
  { n: 1, name: 'Draft', desc: 'Content is written against the canonical source. Not visible to sellers.', owner: 'Content owner' },
  { n: 2, name: 'Owner review', desc: 'The content owner checks accuracy against the canonical source.', owner: 'Content owner' },
  { n: 3, name: 'Functional review', desc: 'RevOps, Legal or the relevant function checks for conflicts and risk.', owner: 'Process owner' },
  { n: 4, name: 'Approval', desc: 'The named approver records approval, version and effective date.', owner: 'Approver' },
  { n: 5, name: 'Highspot publication', desc: 'Published to the lane and topic page with full metadata applied.', owner: 'Revenue Enablement' },
  { n: 6, name: 'Slack assistant indexing', desc: 'The approved source is indexed so the assistant can cite it.', owner: 'Revenue Enablement' },
  { n: 7, name: 'Communication', desc: 'Change is communicated to affected roles through the agreed channel.', owner: 'Revenue Enablement' },
  { n: 8, name: 'Adoption monitoring', desc: 'Usage, search and question data are reviewed against expectations.', owner: 'Revenue Enablement' },
  { n: 9, name: 'Scheduled review', desc: 'The next review date triggers an owner review before expiry.', owner: 'Content owner' },
  { n: 10, name: 'Update, archive or retire', desc: 'The record is updated, archived or retired. Superseded material is removed from search.', owner: 'Content owner' }
];

/* ============================================================================
   LINK SLOTS
   ----------------------------------------------------------------------------
   Every link in this prototype has its own slot with a stable, unique ID.
   Real URLs are supplied in links.js — that is the ONLY file you edit to
   connect this prototype to real content. Nothing here needs to change.

   Slots are deduplicated by identity, not by position: the same dashboard
   appearing under four topics is ONE slot, so a URL is only ever asked for
   once. Canonical sources collapse onto their topic's slot for the same
   reason.
   ========================================================================= */

function slugify(value) {
  return String(value).toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/* The single source of truth for slot IDs. Renderers and the inventory
   generator both call this, so they can never disagree. */
function slotFor(kind, item, topic) {
  if (item && item.token === 'canonical' && topic) return topic.ref + '/canonical';
  switch (kind) {
    case 'topic':     return topic.ref + '/topic';
    case 'canonical': return topic.ref + '/canonical';
    case 'training':  return 'TRAINING/' + slugify(item.title);
    case 'doc':       return 'DOC/' + slugify(item.title);
    case 'dashboard': return 'DASHBOARD/' + slugify(item.title || item);
    case 'asset':     return (item.digitalRoom ? 'ROOM/' : 'ASSET/') + slugify(item.title);
    case 'slack':     return 'GLOBAL/slack';
    default:          return 'GLOBAL/' + slugify(String(item));
  }
}

/* Walks the whole content model and returns every link slot exactly once. */
function collectSlots() {
  const slots = [];
  const seen = new Map();
  const add = (id, record) => {
    const existing = seen.get(id);
    if (existing) {
      /* Record the extra place it appears, so the inventory shows reuse. */
      if (record.where && existing.where.indexOf(record.where) === -1) {
        existing.where.push(record.where);
      }
      return;
    }
    const entry = Object.assign({}, record, { id, where: record.where ? [record.where] : [] });
    seen.set(id, entry);
    slots.push(entry);
  };

  add(slotFor('slack'), {
    category: 'Slack assistant', label: 'Slack assistant deep link',
    token: 'slack', where: 'Header, homepage, assistant page, every topic page',
    note: 'One URL. Used everywhere the Ask in Slack button appears.'
  });

  TOPICS.forEach(t => {
    add(slotFor('topic', null, t), {
      category: 'Highspot topic pages', label: t.name + ' — Highspot page',
      token: 'highspotTopic', where: 'Topic: ' + t.name, topic: t.name,
      note: 'The page itself. Cited by the Slack assistant in every answer about this topic.'
    });

    if (t.governance.source && t.governance.source !== 'Not yet established') {
      add(slotFor('canonical', null, t), {
        category: 'Canonical sources', label: t.governance.source,
        token: 'canonical', where: 'Topic: ' + t.name, topic: t.name,
        note: 'The authoritative business record. Must exist before the topic is published.'
      });
    }

    t.resources.training.forEach(r => add(slotFor('training', r, t), {
      category: 'Training', label: r.title, token: r.token || 'workday',
      where: 'Topic: ' + t.name, topic: t.name, type: r.type
    }));

    t.resources.documentation.forEach(r => add(slotFor('doc', r, t), {
      category: 'Documentation', label: r.title, token: r.token || 'highspotAsset',
      where: 'Topic: ' + t.name, topic: t.name, type: r.type
    }));

    t.resources.dashboards.forEach(d => add(slotFor('dashboard', d, t), {
      category: 'Dashboards', label: d.title, token: 'dashboard',
      where: 'Topic: ' + t.name, topic: t.name, type: 'Salesforce dashboard'
    }));

    t.metrics.forEach(m => add(slotFor('dashboard', { title: m.dashboard }, t), {
      category: 'Dashboards', label: m.dashboard, token: 'dashboard',
      where: 'Topic: ' + t.name, topic: t.name, type: 'Salesforce dashboard'
    }));

    (t.internal || []).forEach(a => add(slotFor('asset', a, t), {
      category: 'Internal assets', label: a.title, token: a.token || 'highspotAsset',
      where: 'Topic: ' + t.name, topic: t.name, type: a.type, audience: 'Internal only',
      share: a.share
    }));

    (t.partner || []).forEach(a => add(slotFor('asset', a, t), {
      category: a.digitalRoom ? 'Digital Rooms' : 'Partner-facing assets',
      label: a.title, token: a.token || 'highspotAsset',
      where: 'Topic: ' + t.name, topic: t.name, type: a.type, audience: 'Partner-facing',
      share: a.share
    }));
  });

  return slots;
}

/* Resolve a slot to a real URL, if one has been supplied in links.js.
   '' (or missing)  → not supplied yet
   'TBC'            → the document does not exist yet and must be created  */
function linkFor(slotId) {
  const table = (typeof LINKS !== 'undefined' && LINKS) ? LINKS : {};
  const value = (table[slotId] || '').trim();
  if (!value) return { state: 'missing', url: '' };
  if (value.toUpperCase() === 'TBC') return { state: 'tbc', url: '' };
  return { state: 'connected', url: value };
}

const PUBLICATION_CHECKLIST = [
  'Named content owner assigned',
  'Named process owner assigned',
  'Canonical source attached and reachable',
  'Content reviewed against the canonical source',
  'Approval recorded with approver name and date',
  'Audience and role relevance confirmed',
  'Shareability classification confirmed for every asset',
  'Version number applied',
  'Next review date set',
  'All links tested',
  'Slack assistant source updated and indexed',
  'Superseded material archived and removed from search'
];
