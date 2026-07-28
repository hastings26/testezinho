/* =============================================================================
   MIP COMPASS — CONTENT & CONFIGURATION
   =============================================================================

   THIS IS THE FILE YOU EDIT. Nothing else needs touching to change the game's
   language, scoring or scenarios.

   ---------------------------------------------------------------------------
   >>> BEFORE INTERNAL LAUNCH — REPLACE PLACEHOLDER WORDING <<<
   ---------------------------------------------------------------------------
   TERRITORIES  — the six plays below (Discover, Sell, Buy, Build, Implement,
                  Manage) are CONFIRMED as the six-play MIP framework. The
                  "placeName" values (Discover Harbour, Sell Square, ...) are
                  game flavour and can be renamed freely without affecting
                  scoring.

   STAGES       — the five maturity stages (Exploring -> Optimising) are
                  PLACEHOLDERS. They do not come from an approved MIP document.
                  Replace `label` and `description` with the official wording
                  before this goes in front of partners or reps at Beyond.
                  Keep the `id` values unchanged and no scenario needs editing.

   ROUTES       — Broker / Builder wording is placeholder-safe. Edit `label`
                  and `description` freely; keep `id` values.
   ---------------------------------------------------------------------------

   Scenario authors: see the notes above MIP_SCENARIOS for the data contract.
   ============================================================================= */

const MIP_CONFIG = {

  /* --- BRANDING (placeholder — swap for approved marks) ------------------- */
  brand: {
    productName: 'MIP Compass',
    tagline: 'Can you find the right route for each partner?',
    intro: 'You will meet five partners. Assess where they are today, choose the most suitable route, and recommend their next move.',
    estimatedMinutes: 7,
    hubUrl: 'index.html',
    hubLabel: 'Return to the learning hub'
  },

  /* --- MISSION SHAPE ------------------------------------------------------ */
  mission: {
    scenariosPerMission: 5,
    pointsPerScenario: 200,
    maxScore: 1000
  },

  /* --- ADMIN GATE ---------------------------------------------------------
     !! READ THIS BEFORE YOU TRUST IT !!
     This is a CLIENT-SIDE gate. The hash below travels to every browser that
     loads the game, and anyone with developer tools can bypass the check in
     about ten seconds. It exists to stop a rep wandering into the editor by
     accident — it is NOT security.

     Nothing behind it is confidential today (scenarios are fictional and
     analytics are anonymous). If you ever put real partner data or pooled
     results behind this screen, move authentication server-side first.

     Default password: mip-admin
     To change it, run this in any browser console and paste the number here:
       s => { let h=0x811c9dc5; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i);
              h=Math.imul(h,0x01000193)>>>0; } return h>>>0; }
     ---------------------------------------------------------------------- */
  adminPasswordHash: 3061067139,
  adminSessionMinutes: 60,

  /* --- MATURITY STAGES  [PLACEHOLDER WORDING — SEE HEADER] ---------------- */
  stages: [
    {
      id: 'exploring',
      label: 'Exploring',
      description: 'Interested in AI but no defined proposition, capability, process or customer motion.'
    },
    {
      id: 'experimenting',
      label: 'Experimenting',
      description: 'Testing tools or running isolated pilots, but activity is not yet repeatable or commercially structured.'
    },
    {
      id: 'offering',
      label: 'Offering',
      description: 'Has started positioning or selling defined AI-related services to customers.'
    },
    {
      id: 'scaling',
      label: 'Scaling',
      description: 'Has repeatable sales, delivery, enablement and operational processes.'
    },
    {
      id: 'optimising',
      label: 'Optimising',
      description: 'Mature AI business with recurring revenue, governance, performance data and continuous improvement.'
    }
  ],

  /* --- THE SIX PLAYS / TERRITORIES  [CONFIRMED SIX-PLAY FRAMEWORK] -------- */
  territories: [
    {
      id: 'discover',
      label: 'Discover',
      placeName: 'Discover Harbour',
      blurb: 'Where partners find out what customers actually need.',
      capabilities: [
        'Identifying customer problems',
        'Understanding demand',
        'Finding repeatable opportunities',
        'Assessing partner readiness'
      ],
      color: '#00C9A7',
      icon: 'anchor'
    },
    {
      id: 'sell',
      label: 'Sell',
      placeName: 'Sell Square',
      blurb: 'Where a capability becomes something a customer will buy.',
      capabilities: [
        'Positioning AI commercially',
        'Creating value propositions',
        'Packaging and pricing services',
        'Building sales confidence'
      ],
      color: '#FFB020',
      icon: 'signpost'
    },
    {
      id: 'buy',
      label: 'Buy',
      placeName: 'Buy Market',
      blurb: 'Where partners source capability instead of creating it.',
      capabilities: [
        'Selecting existing AI tools, agents, services or solutions',
        'Using marketplace solutions',
        'Combining external capabilities'
      ],
      color: '#B47CFF',
      icon: 'stall'
    },
    {
      id: 'build',
      label: 'Build',
      placeName: 'Build Labs',
      blurb: 'Where partners create something that is theirs.',
      capabilities: [
        'Creating customised agents',
        'Developing workflows',
        'Building intellectual property',
        'Integrating systems and data'
      ],
      color: '#4C9AFF',
      icon: 'lab'
    },
    {
      id: 'implement',
      label: 'Implement',
      placeName: 'Implementation Valley',
      blurb: 'Where a sale turns into an outcome the customer can feel.',
      capabilities: [
        'Deploying solutions',
        'Managing adoption',
        'Supporting organisational change',
        'Delivering customer outcomes'
      ],
      color: '#FF6B9D',
      icon: 'valley'
    },
    {
      id: 'manage',
      label: 'Manage',
      placeName: 'Manage City',
      blurb: 'Where AI becomes a recurring, governed, monitored service.',
      capabilities: [
        'Governance',
        'Security',
        'Monitoring',
        'Optimisation',
        'Recurring managed services'
      ],
      color: '#9BE15D',
      icon: 'city'
    }
  ],

  /* --- COMMERCIAL ROUTES -------------------------------------------------- */
  routes: [
    {
      id: 'broker',
      label: 'Broker Route',
      short: 'Advise, package, resell, manage',
      description: 'For partners who want to advise customers, package existing solutions, resell or combine services, manage third-party AI, and monetise AI without developing everything themselves.'
    },
    {
      id: 'builder',
      label: 'Builder Route',
      short: 'Design, automate, integrate, own IP',
      description: 'For partners who want to design custom agents, create automated workflows, build integrations, develop their own intellectual property and deliver customised AI solutions.'
    },
    {
      id: 'blended',
      label: 'A blended route',
      short: 'Broker now, Builder alongside',
      description: 'For partners genuinely running both motions — brokering proven solutions to fund and de-risk a growing build capability. Credible, but only when the partner can actually resource both.'
    },
    {
      id: 'unclear',
      label: 'Not enough information yet',
      short: 'Go back to discovery first',
      description: 'Sometimes the honest answer. Choosing a route before you understand the customer base, the ambition or the capability is how partners end up funding the wrong thing.'
    }
  ],

  /* --- SCORING ------------------------------------------------------------
     Maturity credit is distance-based by default. Any scenario can override
     with its own `maturityCredit` map.                                       */
  scoring: {
    maxPerDecision: 50,
    maturityByDistance: [50, 30, 10, 0, 0],
    confettiThreshold: 800
  },

  /* --- FEEDBACK TONE BANDS (per scenario, out of 200) ---------------------
     Never punitive. Explains commercial consequence, not correctness.        */
  toneBands: [
    { min: 180, headline: 'Strong call',                  mood: 'excellent' },
    { min: 140, headline: 'Good commercial judgement',    mood: 'good' },
    { min: 95,  headline: 'A reasonable instinct',        mood: 'fair' },
    { min: 50,  headline: 'You have jumped ahead a little', mood: 'early' },
    { min: 0,   headline: 'Worth slowing this one down',  mood: 'slow' }
  ],

  /* --- PLAYER TITLES (by total out of 1000) ------------------------------- */
  titles: [
    { min: 880, title: 'MIP Strategist',      note: 'You read partners quickly and you rarely get ahead of the evidence.' },
    { min: 740, title: 'MIP Navigator',       note: 'You consistently find a credible route and a defensible next step.' },
    { min: 600, title: 'Partner Pathfinder',  note: 'Sound instincts. Your judgement sharpens when you slow down on discovery.' },
    { min: 440, title: 'Route Builder',       note: 'You are confident on direction. Test that confidence against what the partner can actually resource.' },
    { min: 0,   title: 'Commercial Explorer', note: 'Plenty to build on. Focus on matching the recommendation to the partner\'s current capability.' }
  ],

  /* --- DECISION LABELS (used in results breakdown) ------------------------ */
  decisions: [
    { id: 'maturity',     label: 'Reading maturity',      question: 'Where is this partner today?' },
    { id: 'route',        label: 'Choosing the route',    question: 'Which commercial route fits this partner best right now?' },
    { id: 'destination',  label: 'Picking the next move', question: 'Where should this partner go next?' },
    { id: 'conversation', label: 'Partner conversation',  question: 'What is the strongest next question or action?' }
  ]
};


/* =============================================================================
   SCENARIOS
   =============================================================================
   Contract for each scenario:

   id                   unique string
   archived             true hides it from mission selection
   partnerName          string
   companySize          string
   customerProfile      string
   currentServices      string[]
   aiActivity           string
   ambition             string
   constraints          string[]
   partnerQuote         string
   clues                string[]           1-2 signals that reward close reading

   idealMaturityStage   stage id
   maturityCredit       optional { stageId: points } — overrides distance rule
   maturityExplanation  string

   idealRoute           route id
   routeCredit          { routeId: points } — all four routes
   routeExplanation     string

   idealDestination     territory id
   destinationCredit    { territoryId: points } — all six territories
   destinationNotes     { territoryId: 'why this earned partial credit' }
   destinationExplanation string

   conversationOptions  [{ id, text, points, note }]  — exactly one at 50
   conversationExplanation string

   talkTrack            a sentence the CAM could actually say to this partner
   ============================================================================= */

const MIP_SCENARIOS = [

  /* ------------------------------------------------------------------ 001 */
  {
    id: 'scenario-001',
    partnerName: 'Northstar IT',
    companySize: '14 employees',
    customerProfile: '220 SMB customers, mostly professional services',
    currentServices: ['Microsoft 365', 'Managed IT services', 'Backup and continuity'],
    aiActivity: 'Two engineers have been trialling Copilot internally for three months. Customers are starting to ask about it.',
    ambition: 'Turn AI conversations into something they can package and sell',
    constraints: ['No AI specialist', 'No development capability', 'Owner does not want to hire developers'],
    partnerQuote: 'Our customers are asking about AI, but we do not know how to turn those conversations into something we can package and sell.',
    clues: ['Strong Microsoft relationship and high M365 attach', 'Explicitly does not want to build custom agents'],

    idealMaturityStage: 'experimenting',
    maturityExplanation: 'Internal trials are running but nothing is repeatable or commercially structured yet. That is Experimenting, not Exploring — they are past curiosity, and well short of an offer.',

    idealRoute: 'broker',
    routeCredit: { broker: 50, blended: 25, builder: 5, unclear: 15 },
    routeExplanation: 'Broker is the credible starting point. They want to monetise existing solutions without developing their own agents, and they have said so plainly.',

    idealDestination: 'discover',
    destinationCredit: { discover: 50, sell: 30, buy: 25, build: 0, implement: 5, manage: 0 },
    destinationNotes: {
      sell: 'Packaging is the right instinct, but they cannot price what they have not yet defined. Discovery first makes the offer sellable.',
      buy: 'Sourcing solutions will come, but choosing products before knowing the repeatable problem is how partners end up with shelfware.',
      implement: 'There is nothing sold yet to implement.'
    },
    destinationExplanation: 'Discover is where Northstar turns 220 customer relationships into a short list of problems worth solving repeatedly. That short list is what makes the eventual offer credible.',

    conversationOptions: [
      { id: 'a', text: 'Which recurring customer problems are creating the greatest cost, risk or frustration today?', points: 50, note: 'Opens the discovery that everything else depends on, and uses their customer base as the asset it is.' },
      { id: 'b', text: 'Would you like us to build a custom AI agent for you immediately?', points: 0, note: 'Directly contradicts what the partner has told you about capability and ambition.' },
      { id: 'c', text: 'How many AI licences can you commit to selling this quarter?', points: 5, note: 'Product-led, with no discovery behind it. It also asks a partner with no offer to forecast one.' },
      { id: 'd', text: 'Do your customers already have a preferred large language model?', points: 20, note: 'A sensible technical question, but far too early — and SMB customers rarely have a view.' }
    ],
    conversationExplanation: 'Northstar already has the thing most partners lack: 220 trusted relationships. The strongest question mines that asset rather than pushing a product into it.',

    talkTrack: 'You do not need to build an AI practice overnight. Let us first identify the customer problems you can solve repeatedly, then package that commercially.'
  },

  /* ------------------------------------------------------------------ 002 */
  {
    id: 'scenario-002',
    partnerName: 'Kestrel Digital',
    companySize: '62 employees, including 4 in-house developers',
    customerProfile: '45 mid-market customers in manufacturing and logistics',
    currentServices: ['Managed IT', 'Azure infrastructure', 'Custom .NET integration work'],
    aiActivity: 'Delivered two paid AI pilots this year — a quoting assistant and a document-extraction tool',
    ambition: 'Develop their own IP and stop competing on hourly rates',
    constraints: ['Developers are fully booked on legacy integration work', 'No product manager', 'Pilots were priced as time and materials'],
    partnerQuote: 'We can build almost anything. What we cannot do is sell the same thing twice.',
    clues: ['Two pilots delivered but both were bespoke, one-off builds', 'Genuine development capability already in the business'],

    idealMaturityStage: 'offering',
    maturityExplanation: 'They are selling defined AI work to customers, so they are past Experimenting. But nothing is repeatable, so they are not yet Scaling.',

    idealRoute: 'builder',
    routeCredit: { builder: 50, blended: 35, broker: 10, unclear: 5 },
    routeExplanation: 'Builder fits their capability and their ambition to own IP. Blended is defensible — brokering proven solutions could fund the build capacity — but Builder is where their differentiation actually lives.',

    idealDestination: 'build',
    destinationCredit: { build: 50, sell: 35, discover: 25, buy: 5, implement: 10, manage: 5 },
    destinationNotes: {
      sell: 'Very close. Their real problem is selling the same thing twice, so packaging matters — but there is nothing productised yet to package.',
      discover: 'Never wrong to check demand, though Kestrel already has two paying proof points telling them where demand is.',
      implement: 'Delivery is not their bottleneck yet.'
    },
    destinationExplanation: 'Build is where two bespoke projects become one reusable product. Kestrel has the capability and the evidence — what they lack is a repeatable asset.',

    conversationOptions: [
      { id: 'a', text: 'What did those two pilots have in common, and could one become a product you sell ten times?', points: 50, note: 'Turns delivered work into IP — exactly the move from Offering to Scaling.' },
      { id: 'b', text: 'Shall we look at marketplace agents you could resell instead?', points: 10, note: 'Sensible for many partners, but it sidesteps the capability and ambition Kestrel actually has.' },
      { id: 'c', text: 'How quickly can your developers take on three more custom projects?', points: 5, note: 'Deepens the exact trap they described — more bespoke work at hourly rates.' },
      { id: 'd', text: 'Which of your customers would pay for a supported version of what you already built?', points: 40, note: 'Strong commercial instinct. Slightly narrower than finding the reusable pattern first.' }
    ],
    conversationExplanation: 'Kestrel does not need more capability. They need to convert delivered work into something repeatable, and the question that starts that is about the pattern across the pilots.',

    talkTrack: 'You have already built it twice. Let us find the version you can sell ten times, then price it as a product rather than a project.'
  },

  /* ------------------------------------------------------------------ 003 */
  {
    id: 'scenario-003',
    partnerName: 'Aegis Secure',
    companySize: '35 employees',
    customerProfile: '90 customers in regulated sectors — finance, legal, healthcare',
    currentServices: ['Managed security', 'Compliance advisory', 'SOC services'],
    aiActivity: 'Not selling AI. Watching customers switch on Copilot without any data controls in place.',
    ambition: 'Protect their trusted-advisor position and stop AI arriving through the back door',
    constraints: ['No AI-specific tooling', 'Team is security-skilled, not AI-skilled', 'Cautious brand — will not sell anything they cannot stand behind'],
    partnerQuote: 'Our customers are switching on AI faster than they are switching on the controls. That is our problem before it is theirs.',
    clues: ['Deep credibility in governance and risk, which is a genuine AI differentiator', 'Zero current AI revenue despite strong relevant capability'],

    idealMaturityStage: 'exploring',
    maturityCredit: { exploring: 50, experimenting: 30, offering: 5, scaling: 0, optimising: 0 },
    maturityExplanation: 'No AI proposition and no AI motion yet, so Exploring — even though their underlying security capability is mature. Do not confuse a strong business with a mature AI business.',

    idealRoute: 'broker',
    routeCredit: { broker: 50, blended: 30, builder: 5, unclear: 20 },
    routeExplanation: 'Broker lets Aegis package existing AI governance and security tooling under their own trusted advisory wrapper. Building agents would take them away from the thing they are already excellent at.',

    idealDestination: 'manage',
    destinationCredit: { manage: 50, discover: 30, buy: 30, sell: 15, implement: 10, build: 0 },
    destinationNotes: {
      discover: 'Reasonable, and never harmful — though Aegis has already identified the problem clearly and unprompted.',
      buy: 'Good instinct. They will need to source governance tooling, and Buy is the natural partner play to Manage.',
      sell: 'They can package this, but the proposition needs to exist before it is priced.'
    },
    destinationExplanation: 'Manage is where governance, security and monitoring become a recurring service. Aegis is one of the rare partners whose existing capability maps almost directly onto an AI play.',

    conversationOptions: [
      { id: 'a', text: 'Could an AI governance and monitoring service become a chargeable extension of what you already deliver?', points: 50, note: 'Connects a real observed risk to a recurring commercial service, using capability they already have.' },
      { id: 'b', text: 'Which AI tools should we get your customers licensed on first?', points: 5, note: 'Pushes licences at a partner whose entire concern is uncontrolled adoption.' },
      { id: 'c', text: 'Would you like to build a custom compliance agent for your regulated customers?', points: 15, note: 'Interesting long term, but Aegis has no development capability and a cautious brand.' },
      { id: 'd', text: 'How are your customers currently controlling what data their AI tools can reach?', points: 40, note: 'An excellent discovery question. Slightly less strong only because it stops short of the commercial move.' }
    ],
    conversationExplanation: 'Aegis has already done the diagnosis. The value a CAM adds here is turning their concern into a service line rather than validating the concern again.',

    talkTrack: 'You are already the people your customers call about risk. AI governance is not a new business for you — it is the next line on the same invoice.'
  },

  /* ------------------------------------------------------------------ 004 */
  {
    id: 'scenario-004',
    partnerName: 'Lumen Works',
    companySize: '22 employees',
    customerProfile: '130 SMB customers across retail and hospitality',
    currentServices: ['Managed IT', 'Microsoft 365', 'Helpdesk'],
    aiActivity: 'Using AI internally for helpdesk triage and ticket summarisation. Cut first-response time by 40%.',
    ambition: 'Not yet articulated — the owner is proud of the internal result but has not thought commercially about it',
    constraints: ['Small team, everyone is billable', 'No sales specialist', 'Has never packaged a new service from scratch'],
    partnerQuote: 'It has been brilliant for us internally. I had not really thought about selling it.',
    clues: ['A genuine, measured internal proof point — rare and valuable', 'No commercial intent yet, so the gap is confidence, not capability'],

    idealMaturityStage: 'experimenting',
    maturityExplanation: 'Real AI activity, real measured results, but nothing customer-facing and nothing repeatable commercially. Textbook Experimenting.',

    idealRoute: 'broker',
    routeCredit: { broker: 50, blended: 30, builder: 15, unclear: 20 },
    routeExplanation: 'Broker suits a small, fully billable team. They can package proven tooling around a story they have already lived, without diverting anyone into development.',

    idealDestination: 'sell',
    destinationCredit: { sell: 50, discover: 35, buy: 20, implement: 10, build: 10, manage: 5 },
    destinationNotes: {
      discover: 'A very defensible answer. The counter-argument is that Lumen already holds the proof point — their gap is commercial confidence, not customer insight.',
      buy: 'They may need to source a customer-facing version of what they run internally.',
      build: 'They have a working internal process, but no capacity to productise it.'
    },
    destinationExplanation: 'Sell is the unlock. Lumen has already done the hard part — they have a measured outcome. What is missing is the packaging, pricing and confidence to take it to 130 customers.',

    conversationOptions: [
      { id: 'a', text: 'You have cut response times by 40%. What would that outcome be worth to your customers if you sold it as a service?', points: 50, note: 'Converts a lived internal result into a value proposition, which is exactly the missing step.' },
      { id: 'b', text: 'Shall we get you onto a bigger AI licence bundle?', points: 5, note: 'Licence-led, ignores the asset they have and gives them nothing to sell.' },
      { id: 'c', text: 'What problems are your retail customers asking you to solve?', points: 35, note: 'A good discovery question — just one step behind where this partner already is.' },
      { id: 'd', text: 'Would you like to build a custom triage agent for each customer?', points: 10, note: 'Every one of their 22 people is billable. This creates delivery load they cannot carry.' }
    ],
    conversationExplanation: 'The temptation is to run discovery because that is the default. With Lumen, the discovery is already done — they simply have not realised they are sitting on a sellable outcome.',

    talkTrack: 'You have already proved this works, on yourselves, with numbers. That is the case study most partners spend a year trying to get.',
    ambiguityNote: 'Discover is a strong alternative here and earns real credit. This scenario tests whether you notice a partner who is further along than they think.'
  },

  /* ------------------------------------------------------------------ 005 */
  {
    id: 'scenario-005',
    partnerName: 'Brightpath Solutions',
    companySize: '48 employees',
    customerProfile: '160 customers, strong in professional services',
    currentServices: ['Managed IT', 'Microsoft 365', 'Copilot licences'],
    aiActivity: 'Sold Copilot to 40 customers in nine months. Usage reports show under 20% of licences are actively used.',
    ambition: 'Protect the renewal base and prove the AI investment was worth it',
    constraints: ['Sold on licence margin with no delivery wrapper', 'No adoption or change-management practice', 'Renewals begin in four months'],
    partnerQuote: 'We sold it well. I am not sure we landed it.',
    clues: ['Strong sales motion, no delivery motion — the classic gap', 'A renewal cliff is four months away, which makes this urgent'],

    idealMaturityStage: 'offering',
    maturityExplanation: 'They are selling defined AI services, which is Offering. The absence of repeatable delivery is precisely what keeps them out of Scaling.',

    idealRoute: 'broker',
    routeCredit: { broker: 50, blended: 30, builder: 5, unclear: 10 },
    routeExplanation: 'Broker is already their motion and it is working on the sales side. The fix is not a different route — it is the missing delivery capability on the route they are on.',

    idealDestination: 'implement',
    destinationCredit: { implement: 50, manage: 30, discover: 20, sell: 5, buy: 5, build: 0 },
    destinationNotes: {
      manage: 'Strong second answer. Ongoing monitoring and optimisation is where this should end up — but adoption has to be fixed before it can be managed.',
      discover: 'Understanding why usage is low is genuinely useful, and sits inside the adoption work.'
    },
    destinationExplanation: 'Implement is the gap. Brightpath can sell AI but cannot yet land it, and in four months low usage becomes lost renewals rather than a delivery problem.',

    conversationOptions: [
      { id: 'a', text: 'What would it take to get those 40 customers genuinely using what they have already paid for, before renewal?', points: 50, note: 'Names the commercial risk, sets the deadline, and points at adoption as the fix.' },
      { id: 'b', text: 'Shall we look at selling Copilot into the other 120 customers?', points: 0, note: 'Scales the adoption problem rather than solving it, and puts the renewal base at greater risk.' },
      { id: 'c', text: 'Would a paid adoption and enablement package be something customers would buy?', points: 40, note: 'Commercially sharp and probably the right destination — it just skips confirming why usage is low.' },
      { id: 'd', text: 'Which departments in those customers are using it most?', points: 25, note: 'Useful diagnostic detail, but it stops short of the commercial consequence.' }
    ],
    conversationExplanation: 'The instinct to sell more is strong and, here, actively dangerous. The strongest question makes the renewal risk visible and turns adoption into the next piece of work.',

    talkTrack: 'You have proved you can sell it. Let us make sure it lands, because in four months low usage stops being a delivery issue and starts being a renewal conversation.'
  },

  /* ------------------------------------------------------------------ 006 */
  {
    id: 'scenario-006',
    partnerName: 'Vantage Group',
    companySize: '80 employees across three offices',
    customerProfile: '210 customers, broad mix, no clear vertical',
    currentServices: ['Managed IT', 'Cloud migration', 'Telephony', 'Some project consultancy'],
    aiActivity: 'Five separate AI pilots running — two customer-facing, three internal. None has an owner, a budget line or a success measure.',
    ambition: 'Leadership wants "an AI strategy" but has not defined what success looks like',
    constraints: ['No single owner for AI', 'Three offices with different approaches', 'Pilots were started by enthusiasts, not by a plan'],
    partnerQuote: 'We are definitely doing AI. I could not tell you what any of it is worth.',
    clues: ['Plenty of activity, no commercial structure — energy without direction', 'Nobody owns AI, which is the actual constraint'],

    idealMaturityStage: 'experimenting',
    maturityExplanation: 'Five pilots feels advanced, and it is not. Without owners, measures or commercial structure this is Experimenting at scale — activity, not maturity.',

    idealRoute: 'blended',
    routeCredit: { blended: 50, unclear: 35, broker: 25, builder: 15 },
    routeExplanation: 'Blended reflects reality — they are already running both motions. The honest alternative is that there is not enough information yet, which earns real credit, because nobody at Vantage can currently tell you which pilots matter.',

    idealDestination: 'discover',
    destinationCredit: { discover: 50, sell: 25, manage: 20, implement: 15, buy: 10, build: 0 },
    destinationNotes: {
      sell: 'They will need to commercialise eventually, but pricing five unowned pilots is not possible yet.',
      manage: 'Governance is a real gap, though it is a symptom here rather than the starting point.',
      implement: 'Some pilots need landing — but first somebody has to decide which ones deserve to survive.'
    },
    destinationExplanation: 'Discover is where Vantage works out which of the five pilots addresses a repeatable customer problem. Four of them probably do not, and finding that out is the highest-value work available.',

    conversationOptions: [
      { id: 'a', text: 'Of those five pilots, which one solves a problem more than ten of your customers share?', points: 50, note: 'Forces prioritisation using the only criterion that matters commercially — repeatability.' },
      { id: 'b', text: 'Who owns AI in the business, and what are they accountable for?', points: 40, note: 'Names the real constraint. Slightly weaker only because ownership without a focus just formalises the sprawl.' },
      { id: 'c', text: 'Shall we get all three offices onto the same AI toolset?', points: 15, note: 'Tidies the tooling and leaves the commercial confusion completely intact.' },
      { id: 'd', text: 'Would you like to add two more pilots in the areas you have not covered?', points: 0, note: 'Adds to the sprawl that is already the problem.' }
    ],
    conversationExplanation: 'Vantage does not have an AI problem, it has a focus problem. The strongest question kills four pilots without ever having to say so.',

    talkTrack: 'You are not short of AI activity. Let us find the one pilot that solves a problem lots of your customers share, and give the other four a decision.'
  },

  /* ------------------------------------------------------------------ 007 */
  {
    id: 'scenario-007',
    partnerName: 'Orbit Managed Services',
    companySize: '30 employees',
    customerProfile: '140 SMB customers',
    currentServices: ['Managed IT', 'Microsoft 365', 'A packaged "Copilot Accelerator" offer'],
    aiActivity: 'Built and launched an AI package. Pitched it to 60 customers in four months and closed two.',
    ambition: 'Understand why a well-built offer is not selling',
    constraints: ['Marketing-led offer with no customer research behind it', 'Sales team pitches features, not outcomes', 'Confidence in the team is dropping'],
    partnerQuote: 'The deck is great. The meetings go well. Nobody buys.',
    clues: ['A 3% close rate across 60 pitches is a positioning signal, not a sales-skills signal', 'The offer was designed before anyone asked customers what they needed'],

    idealMaturityStage: 'offering',
    maturityExplanation: 'They have a defined AI service in market, which is Offering. It is not working — but Offering describes what they are doing, not how well it is going.',

    idealRoute: 'broker',
    routeCredit: { broker: 50, blended: 25, unclear: 20, builder: 5 },
    routeExplanation: 'Broker remains right for a 30-person MSP packaging existing tooling. The route is not the problem — the absence of discovery underneath it is.',

    idealDestination: 'discover',
    destinationCredit: { discover: 50, sell: 35, buy: 10, implement: 5, manage: 0, build: 0 },
    destinationNotes: {
      sell: 'Repositioning the offer is the visible fix and earns solid credit — but you cannot reposition credibly without knowing what customers actually want.'
    },
    destinationExplanation: 'Orbit built the offer before doing the discovery, and 58 declined pitches are the invoice for that. Discover is where they find out what those customers were actually trying to buy.',

    conversationOptions: [
      { id: 'a', text: 'What did the 58 customers who said no tell you they were worried about instead?', points: 50, note: 'Treats the failed pitches as the richest research data the partner owns.' },
      { id: 'b', text: 'Shall we refresh the deck and retrain the sales team on objection handling?', points: 15, note: 'Treats a positioning problem as a skills problem. It will produce better-delivered pitches that still do not close.' },
      { id: 'c', text: 'Which two customers bought, and what was different about them?', points: 40, note: 'Genuinely strong — the two wins are a real signal. Slightly narrower than mining all 58 losses.' },
      { id: 'd', text: 'Would a discount help move the remaining pipeline?', points: 0, note: 'Discounts an offer nobody has established a need for, and damages the price point permanently.' }
    ],
    conversationExplanation: 'Fifty-eight declines is not a failure, it is a dataset. The strongest CAMs use it rather than rebuilding the deck that produced it.',

    talkTrack: 'Sixty pitches is not a failed campaign, it is the best customer research you have. Let us go and read it before we change a single slide.'
  },

  /* ------------------------------------------------------------------ 008 */
  {
    id: 'scenario-008',
    partnerName: 'Halden Cloud',
    companySize: '55 employees',
    customerProfile: '12 mid-market customers on an AI document-processing service',
    currentServices: ['Managed IT', 'Azure', 'AI document-processing service'],
    aiActivity: 'A working, profitable AI service. Demand is strong and the pipeline is full.',
    ambition: 'Take on more customers without breaking the team',
    constraints: ['Delivery depends on two named engineers', 'Six-week onboarding backlog', 'Every deployment is hand-configured'],
    partnerQuote: 'We are turning work away. Not because we cannot sell it — because we cannot deliver it.',
    clues: ['Repeatable sales, non-repeatable delivery — the classic Offering-to-Scaling wall', 'Key-person dependency on two engineers is the actual risk'],

    idealMaturityStage: 'offering',
    maturityCredit: { offering: 50, scaling: 35, experimenting: 10, exploring: 0, optimising: 5 },
    maturityExplanation: 'Tempting to call this Scaling, and the sales side genuinely is. But Scaling requires repeatable delivery and operations too, and Halden has neither. Scaling earns strong partial credit — this is a fine distinction, and an important one.',

    idealRoute: 'builder',
    routeCredit: { builder: 50, blended: 35, broker: 10, unclear: 5 },
    routeExplanation: 'They already own the service. The Builder work now is productising the delivery — templating, automating and removing the hand-configuration that caps their growth.',

    idealDestination: 'implement',
    destinationCredit: { implement: 50, build: 35, manage: 20, sell: 5, discover: 5, buy: 10 },
    destinationNotes: {
      build: 'Very strong. Automating deployment is genuine Build work, and this could reasonably go either way depending on whether you see the fix as delivery process or product engineering.',
      manage: 'Where this ends up once delivery is repeatable.',
      buy: 'Sourcing tooling to automate onboarding is a credible shortcut.'
    },
    destinationExplanation: 'Implement is where a six-week hand-built onboarding becomes a repeatable deployment. Until that is fixed, every new sale makes the problem worse.',

    conversationOptions: [
      { id: 'a', text: 'What would it take to onboard a customer without either of those two engineers being involved?', points: 50, note: 'Targets the key-person dependency, which is both the growth cap and the business risk.' },
      { id: 'b', text: 'Shall we look at bringing more pipeline into the top of the funnel?', points: 0, note: 'They are already turning work away. More pipeline makes the bottleneck worse.' },
      { id: 'c', text: 'Which parts of the six-week onboarding are identical for every customer?', points: 45, note: 'Excellent and very close — this is the practical route to the same outcome.' },
      { id: 'd', text: 'Should you hire two more engineers?', points: 20, note: 'It buys time, and it scales cost linearly with revenue rather than fixing the delivery model.' }
    ],
    conversationExplanation: 'Halden has the problem most partners want. The strongest question attacks the dependency rather than adding people to it.',

    talkTrack: 'Your growth is not capped by demand, it is capped by two people. Let us make the first deployment repeatable and the pipeline stops being a problem.'
  },

  /* ------------------------------------------------------------------ 009 */
  {
    id: 'scenario-009',
    partnerName: 'Fenwick & Rowe',
    companySize: '18 employees',
    customerProfile: '40 customers, heavily weighted to law firms',
    currentServices: ['Managed IT for legal', 'Document management', 'Compliance support'],
    aiActivity: 'A large client has asked for "an AI contract review assistant". The partner has promised to build one.',
    ambition: 'Keep a major client happy and look capable',
    constraints: ['No developers', 'No AI experience', 'Client account represents 22% of revenue'],
    partnerQuote: 'We told them yes. Now we need to work out how.',
    clues: ['Several proven contract-analysis products already exist in this exact niche', 'A commitment has been made before any capability assessment'],

    idealMaturityStage: 'exploring',
    maturityCredit: { exploring: 50, experimenting: 40, offering: 15, scaling: 0, optimising: 0 },
    maturityExplanation: 'Exploring is the better read — there is no AI capability, no process and no motion, only a promise. Experimenting earns close credit because a live client commitment is real activity, but a commitment is not a capability.',

    idealRoute: 'broker',
    routeCredit: { broker: 50, blended: 20, unclear: 20, builder: 0 },
    routeExplanation: 'Broker is the only realistic route. Eighteen people, no developers and a 22% revenue client is not the moment to attempt a first custom build.',

    idealDestination: 'buy',
    destinationCredit: { buy: 50, discover: 35, sell: 15, implement: 15, build: 0, manage: 5 },
    destinationNotes: {
      discover: 'Strong. Checking what the client actually needs before sourcing anything is good practice, and the promise made this urgent rather than optional.',
      implement: 'Landing a bought solution well is where the value ends up.'
    },
    destinationExplanation: 'Buy is the answer that protects both the client and the partner. Proven contract-analysis tools already exist, and Fenwick can deliver the outcome without betting a fifth of their revenue on a first build.',

    conversationOptions: [
      { id: 'a', text: 'What outcome did the client actually ask for, and could an existing solution deliver it faster than building one?', points: 50, note: 'Separates the outcome from the implementation, which is what rescues the promise.' },
      { id: 'b', text: 'How quickly can you recruit a developer to start the build?', points: 5, note: 'Commits an 18-person business to a capability it has never had, under client deadline pressure.' },
      { id: 'c', text: 'Shall we scope the custom agent together so you can quote it?', points: 10, note: 'Helpful in tone, but it accelerates the wrong decision.' },
      { id: 'd', text: 'Have you told the client what the build would realistically cost and take?', points: 35, note: 'Honest and valuable — reframing towards a bought solution is the stronger move than pricing the wrong one.' }
    ],
    conversationExplanation: 'Partners often ask to build when what they need is to deliver. The strongest CAM separates the promised outcome from the assumed method, without embarrassing the partner.',

    talkTrack: 'You promised them an outcome, not a codebase. Let us find a proven solution you can stand behind, and you keep the credibility without the build risk.'
  },

  /* ------------------------------------------------------------------ 010 */
  {
    id: 'scenario-010',
    partnerName: 'Tessellate Technology',
    companySize: '120 employees with a 9-person AI practice',
    customerProfile: '75 mid-market and lower-enterprise customers',
    currentServices: ['Managed IT', 'Azure', 'Data platform work', 'AI consultancy and custom agents'],
    aiActivity: 'Roughly £1.2m of AI revenue in the last twelve months, almost all of it project-based',
    ambition: 'Convert project revenue into recurring managed AI services',
    constraints: ['Revenue restarts at zero every January', 'No monitoring or optimisation wrapper on delivered agents', 'Customers own the agents once delivered'],
    partnerQuote: 'We have built a good business. We have not built an annuity.',
    clues: ['Repeatable sales and delivery already exist — this is a genuinely mature partner', 'Delivered agents are running unmonitored at customer sites, which is both a risk and an opportunity'],

    idealMaturityStage: 'scaling',
    maturityCredit: { scaling: 50, offering: 30, optimising: 30, experimenting: 0, exploring: 0 },
    maturityExplanation: 'Repeatable sales, delivery and operations put Tessellate in Scaling. Optimising earns real credit — they are close — but recurring revenue and governance are exactly what they have told you is missing.',

    idealRoute: 'blended',
    routeCredit: { blended: 50, builder: 40, broker: 20, unclear: 0 },
    routeExplanation: 'Blended fits a partner who builds custom agents and now needs to wrap bought monitoring and governance tooling around them. Builder alone is close, but it under-describes the managed-service layer they are missing.',

    idealDestination: 'manage',
    destinationCredit: { manage: 50, build: 20, sell: 30, implement: 20, discover: 5, buy: 20 },
    destinationNotes: {
      sell: 'Repackaging project work as a subscription is a real part of this, and a fair answer.',
      buy: 'They will likely source monitoring tooling rather than build it.',
      implement: 'Adoption support could form part of the recurring wrapper.'
    },
    destinationExplanation: 'Manage is the annuity. Every agent Tessellate has delivered is running unmonitored — that is a governance risk for the customer and an unsold recurring service for the partner.',

    conversationOptions: [
      { id: 'a', text: 'Who is monitoring the agents you have already delivered, and what happens when one starts behaving differently?', points: 50, note: 'Surfaces a live customer risk and an unsold recurring service in the same question.' },
      { id: 'b', text: 'How many more custom agent projects can you sell next year?', points: 10, note: 'Repeats the project model that resets their revenue to zero every January.' },
      { id: 'c', text: 'Could you offer a monthly support and optimisation retainer on every agent you have delivered?', points: 45, note: 'Commercially right and very close — it proposes the answer rather than letting the partner arrive at it.' },
      { id: 'd', text: 'Should you productise your best agent and sell it through the marketplace?', points: 30, note: 'A credible growth play, though it does not solve the recurring-revenue gap they raised.' }
    ],
    conversationExplanation: 'Mature partners rarely need to be told the answer. The strongest question makes the gap undeniable and lets them propose the retainer themselves.',

    talkTrack: 'Every agent you have delivered is running somewhere with nobody watching it. That is your customers\' risk and your missing recurring revenue, and it is the same conversation.'
  },

  /* ------------------------------------------------------------------ 011 */
  {
    id: 'scenario-011',
    partnerName: 'Ridgeline IT',
    companySize: '9 employees',
    customerProfile: 'Not yet shared',
    currentServices: ['Managed IT', 'Hardware supply'],
    aiActivity: 'Unknown. The owner mentioned AI once, in passing, on an introductory call.',
    ambition: '"We want to do something with AI" — no further detail given',
    constraints: ['Unknown', 'First conversation, relationship is new', 'Owner was in a hurry'],
    partnerQuote: 'We know we need to do something with AI. Everyone keeps telling us that.',
    clues: ['You have almost no information — that is the point of this one', 'The language is external pressure, not internal intent'],

    idealMaturityStage: 'exploring',
    maturityExplanation: 'No proposition, no capability, no process, no customer motion — and no evidence of any. Exploring is the only supportable read.',

    idealRoute: 'unclear',
    routeCredit: { unclear: 50, broker: 30, blended: 10, builder: 0 },
    routeExplanation: 'Not enough information yet is the strongest answer. You do not know their customers, their capability or their ambition. Broker earns credit because it is the safer default for a nine-person business, but recommending it now would be a guess wearing a suit.',

    idealDestination: 'discover',
    destinationCredit: { discover: 50, sell: 5, buy: 10, build: 0, implement: 0, manage: 5 },
    destinationNotes: {
      buy: 'Understandable instinct for a small partner, but you would be sourcing against unknown requirements.'
    },
    destinationExplanation: 'Discover is the only defensible destination. Everything else assumes information you do not have, and this partner is repeating what they have been told rather than describing a need.',

    conversationOptions: [
      { id: 'a', text: 'What made AI come up now — is a customer asking, or is it coming from somewhere else?', points: 50, note: 'Tests whether there is real demand or only external noise, which changes everything that follows.' },
      { id: 'b', text: 'Here is our standard AI starter bundle — shall I send the pricing over?', points: 0, note: 'Sells a solution to a partner who has not described a problem.' },
      { id: 'c', text: 'What do your customers look like, and what do they call you about most?', points: 45, note: 'Excellent, essential discovery. Marginally behind understanding why AI surfaced at all.' },
      { id: 'd', text: 'Would you like to join our AI partner programme?', points: 15, note: 'Well intentioned, but enrolling a partner with no defined ambition tends to produce a dormant member.' }
    ],
    conversationExplanation: 'The hardest discipline in this game is recommending nothing. With Ridgeline, any route you choose is a guess, and the professional move is to say so.',

    talkTrack: 'Before I point you anywhere, I want to understand what prompted this. Let us spend twenty minutes on your customers first.',
    ambiguityNote: 'This scenario deliberately withholds information. It rewards recognising when you do not yet have enough to advise.'
  },

  /* ------------------------------------------------------------------ 012 */
  {
    id: 'scenario-012',
    partnerName: 'Meridian Partners',
    companySize: '200 employees, AI practice of 24',
    customerProfile: '110 upper mid-market customers',
    currentServices: ['Managed AI services', 'Custom agents', 'Data platform', 'Governance and compliance'],
    aiActivity: 'Mature AI business. Recurring managed AI revenue, an internal governance board and quarterly performance reviews with customers.',
    ambition: 'Improve margin on delivered services and expand the agent portfolio without adding headcount',
    constraints: ['Margin varies wildly between customers and nobody knows why', 'No standard performance benchmarks across the estate', 'Growth is currently linear with headcount'],
    partnerQuote: 'We are good at this now. What I cannot tell you is which customers we make money on.',
    clues: ['Genuinely mature — governance, recurring revenue and review cadence all exist', 'The gap is measurement and optimisation, not capability'],

    idealMaturityStage: 'optimising',
    maturityCredit: { optimising: 50, scaling: 35, offering: 5, experimenting: 0, exploring: 0 },
    maturityExplanation: 'Recurring revenue, governance and continuous review put Meridian in Optimising. Scaling earns strong credit — the missing margin data is arguably a Scaling gap — but the overall business profile is mature.',

    idealRoute: 'blended',
    routeCredit: { blended: 50, builder: 35, broker: 15, unclear: 0 },
    routeExplanation: 'Blended describes what a mature MIP actually looks like — building where it differentiates and brokering where it does not. Builder alone would push them to create things they should simply source.',

    idealDestination: 'manage',
    destinationCredit: { manage: 50, build: 25, sell: 20, implement: 15, buy: 20, discover: 10 },
    destinationNotes: {
      build: 'Expanding the portfolio is part of the ambition, though margin visibility should come first.',
      buy: 'Sourcing rather than building the next portfolio additions is exactly the right instinct for a partner trying to grow without headcount.',
      sell: 'Repricing against real margin data is the natural follow-on.'
    },
    destinationExplanation: 'Manage covers monitoring, optimisation and performance data — and Meridian cannot optimise a margin it cannot see. Instrumentation first, portfolio expansion second.',

    conversationOptions: [
      { id: 'a', text: 'What would you need to measure to know which customers and which agents are actually profitable?', points: 50, note: 'Goes straight at the stated gap and makes every later decision evidence-based.' },
      { id: 'b', text: 'Shall we look at adding another ten agents to your portfolio this year?', points: 20, note: 'Serves the growth ambition while multiplying the margin blind spot they just described.' },
      { id: 'c', text: 'Which agents could you source rather than build, to grow without adding headcount?', points: 40, note: 'Directly serves the no-new-headcount constraint. Strong, just downstream of knowing the numbers.' },
      { id: 'd', text: 'Should you put your prices up?', points: 15, note: 'Possibly right, and unknowable without margin data. A guess at this level of maturity is expensive.' }
    ],
    conversationExplanation: 'With mature partners the value is rarely in new capability. It is in making the existing business measurable, so growth decisions stop being instinct.',

    talkTrack: 'You have built something that works. The next margin point is not in new services, it is in being able to see which of the current ones pay.'
  }
];

/* --- Expose for the game and admin (no bundler, no modules, file:// safe) - */
window.MIP_CONFIG = MIP_CONFIG;
window.MIP_SCENARIOS = MIP_SCENARIOS;
