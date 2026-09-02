/*
 * Onboarding World Map — data model.
 *
 * This file is the single source of truth for the route and the content shown
 * at each checkpoint. It is plain data: edit it without touching map.js.
 *
 *   map.pathD      SVG path traced down the centre of the yellow road in
 *                  assets/world-map.png (image pixel coordinates, 1448x1086).
 *                  Regenerate with tools/trace-road.py after changing the art.
 *   checkpoint.pos Position along that path, 0..1 of total length.
 *   checkpoint.x/y Coin centre in image coordinates — where the marker sits.
 *
 * CONTENT STATUS: first pass, written from the MIP/Pax8 EMEA enablement
 * context. Have Revenue Enablement review the wording before this goes to real
 * new starters — the MIP plays framework in particular is not yet reconciled
 * across documents (see World 3, "plays").
 */
window.ONBOARDING_MAP = {
  meta: {
    title: 'Onboarding World Map',
    subtitle: 'Pax8 EMEA · New Starter Quest',
    version: '1.0',
    storageKey: 'pax8-onboarding-map-v1'
  },

  map: {
    image: 'assets/world-map.png',
    width: 1448,
    height: 1086,
    pathD: 'M 167.0 822.0 C 168.9 817.3 174.9 801.9 178.7 793.8 C 182.5 785.7 178.5 791.7 189.7 773.5 C 200.8 755.3 232.9 704.1 245.6 684.7 C 258.3 665.3 259.8 660.4 266.0 657.0 C 272.2 653.6 278.0 662.6 282.7 664.2 C 287.4 665.9 288.6 666.5 294.1 666.9 C 299.6 667.3 305.8 668.2 315.7 666.4 C 325.6 664.6 342.0 660.4 353.3 656.3 C 364.6 652.2 375.0 647.0 383.6 641.9 C 392.2 636.8 398.5 631.7 405.1 625.7 C 411.8 619.7 413.8 619.5 423.5 605.8 C 433.2 592.1 453.6 557.3 463.1 543.5 C 472.6 529.7 473.0 529.9 480.3 522.9 C 487.6 515.9 494.1 510.1 507.0 501.4 C 520.0 492.7 545.5 477.2 558.0 470.8 C 570.5 464.4 570.6 462.9 582.0 463.0 C 593.4 463.1 601.4 467.7 626.4 471.7 C 651.4 475.7 708.8 483.8 732.1 486.8 C 755.4 489.8 753.5 489.0 766.0 489.5 C 778.5 490.0 794.7 490.1 807.2 489.7 C 819.8 489.3 831.3 488.5 841.3 487.2 C 851.3 485.9 858.4 484.5 867.3 482.0 C 876.2 479.5 885.6 476.1 894.7 472.3 C 903.8 468.5 922.4 458.9 922.0 459.0 C 921.6 459.1 901.1 469.5 892.5 473.2 C 883.9 476.9 878.2 478.9 870.2 481.1 C 862.2 483.3 854.3 485.2 844.3 486.6 C 834.2 488.0 822.6 489.1 809.9 489.6 C 797.2 490.1 780.8 490.1 768.2 489.7 C 755.6 489.3 757.6 490.4 734.2 487.1 C 710.8 483.8 648.7 465.9 628.0 470.0 C 607.3 474.1 617.2 497.7 610.0 512.0 C 602.8 526.3 595.3 541.3 585.0 556.0 C 574.7 570.7 560.2 584.3 548.0 600.0 C 535.8 615.7 522.2 632.3 512.0 650.0 C 501.8 667.7 492.7 687.0 487.0 706.0 C 481.3 725.0 476.2 745.3 478.0 764.0 C 479.8 782.7 487.7 802.3 498.0 818.0 C 508.3 833.7 526.7 848.0 540.0 858.0 C 553.3 868.0 565.3 874.3 578.0 878.0 C 590.7 881.7 599.5 876.9 616.0 880.0 C 632.5 883.1 661.3 893.0 676.9 896.7 C 692.5 900.4 696.1 901.0 709.5 902.0 C 722.9 903.0 732.4 904.0 757.5 902.5 C 782.6 901.0 829.5 895.3 860.4 893.1 C 891.3 890.9 917.5 891.5 943.1 889.1 C 968.7 886.8 989.7 880.1 1014.0 879.0 C 1038.3 877.9 1073.1 882.2 1088.9 882.4 C 1104.7 882.6 1102.3 881.3 1108.9 880.1 C 1115.5 878.9 1121.2 877.9 1128.5 875.2 C 1135.8 872.5 1146.1 867.8 1152.8 863.8 C 1159.5 859.8 1163.1 856.9 1168.7 851.5 C 1174.3 846.1 1180.9 838.4 1186.2 831.2 C 1191.5 824.1 1196.2 816.2 1200.4 808.6 C 1204.7 801.0 1208.8 792.2 1211.7 785.3 C 1214.6 778.4 1215.3 780.0 1217.9 767.1 C 1220.5 754.2 1224.4 721.9 1227.3 707.8 C 1230.2 693.7 1232.2 689.5 1235.1 682.3 C 1238.0 675.1 1237.8 674.9 1244.5 664.7 C 1251.2 654.5 1268.7 631.2 1275.2 621.1 C 1281.7 611.0 1281.4 610.0 1283.5 604.3 C 1285.6 598.6 1287.2 593.8 1288.0 586.9 C 1288.8 580.0 1289.4 575.5 1288.3 563.0 C 1287.2 550.5 1283.8 525.0 1281.3 512.2 C 1278.8 499.4 1274.4 490.4 1273.0 486.0'
  },

  hero: {
    sprite: 'assets/hero.png',
    frames: 4,       // idle, walk A, walk B, cheer
    frameWidth: 16,
    frameHeight: 24
  },

  checkpoints: [
    {
      id: 'start',
      badge: '▶',
      label: 'Start',
      title: 'Day Zero — Boot Up',
      pos: 0.0,
      x: 167,
      y: 822,
      summary: 'Welcome. This map is your first four weeks. Six worlds, one route, and a checklist at every stop. Tick the objectives as you complete them — progress saves in this browser.',
      keyPoints: [
        'Travel with the ▶ CONTINUE button, or click the next glowing coin.',
        'A world unlocks only when the world before it is complete.',
        'Everything here is a prompt for a conversation — your buddy and your manager are the real content.'
      ],
      objectives: [
        'Laptop, accounts and MFA working',
        'Buddy and manager 1:1s in the diary',
        'Find the AI@Pax8 hub and bookmark it'
      ],
      reward: 'Kit unlocked. The road north is open.'
    },
    {
      id: 'w1',
      badge: '1',
      label: 'World 1',
      title: 'Welcome to Pax8',
      pos: 0.0706,
      x: 266,
      y: 657,
      summary: 'Pax8 is a cloud commerce marketplace. Partners buy, sell and manage cloud products through one platform, one bill and one support route — and we exist to make their business bigger, not just their basket.',
      keyPoints: [
        'The customer is the partner. Everything we build is judged by whether it makes their business work better.',
        'One marketplace: quote, provision, bill and manage in the same place.',
        'EMEA is a region of a global business — the same strategy, different market realities.'
      ],
      objectives: [
        'Complete the Pax8 story / induction module',
        'Say in one sentence what Pax8 sells and who buys it',
        'Map your own role onto the partner journey'
      ],
      reward: 'Badge earned: Knows Where They Work.'
    },
    {
      id: 'w2',
      badge: '2',
      label: 'World 2',
      title: 'Meet the MSP',
      pos: 0.21611,
      x: 582,
      y: 463,
      summary: 'An MSP — Managed Service Provider — runs IT for small and mid-sized businesses: devices, licences, security, helpdesk. They earn recurring revenue on managed services plus margin on what they resell. Understand their P&L and you can hold any partner conversation.',
      keyPoints: [
        'The economics: seats × margin, recurring revenue, and how much engineer time each contract eats.',
        'The pressure: traditional MSP margins are projected to fall 30–50% by 2027 for providers who do not evolve.',
        'The context: around 75% of SMBs are already experimenting with AI — often without their MSP.',
        'The vocabulary: MRR, seats, the stack, NOC/SOC, ticket deflection, break-fix vs managed.'
      ],
      objectives: [
        'Listen to a recorded partner call end to end',
        'Write an MSP owner’s day in five bullets',
        'Learn five pieces of MSP vocabulary and use them out loud'
      ],
      reward: 'Badge earned: Speaks Partner.'
    },
    {
      id: 'w3',
      badge: '3',
      label: 'World 3',
      title: 'The MIP Shift',
      pos: 0.34322,
      x: 922,
      y: 459,
      summary: 'A Managed Intelligence Provider is the next evolution of the MSP: instead of managing devices and licences, an MIP orchestrates AI agents and sells business outcomes. The thesis underneath it is the Agentic Inflection Point — agents moving from passive copilots to autonomous systems that execute work at scale.',
      keyPoints: [
        'Three value drivers reps use: grow the business (outcomes, not resale), increase efficiency (agents automating 70–90% of a workflow), reduce risk (governance keeps the partner as trusted advisor).',
        'The deadline is the argument: 2027 margin compression is what makes this urgent rather than interesting.',
        'Proof beats narrative. Infinity Group (UK) is the produced EMEA MSP-to-MIP case study — use it, and ask for the newer ones.',
        'The plays: MIP Playbook v2 lists Discover, Buy, Build, Sell, Manage. The pilot battlecard shows six, adding Implement. Confirm which version your team is using before you present it — the two have not been reconciled.',
        'Escalation route for partner and rep questions: mip@pax8.com.'
      ],
      objectives: [
        'Read the Agentic Inflection Point report — at minimum the executive summary',
        'Explain MSP → MIP in 60 seconds without notes',
        'Check with your enablement lead which plays framework EMEA is presenting'
      ],
      reward: 'Badge earned: Can Name The Shift.'
    },
    {
      id: 'w4',
      badge: '4',
      label: 'World 4',
      title: 'Marketplace',
      pos: 0.64794,
      x: 616,
      y: 880,
      summary: 'The Marketplace is where the strategy becomes a transaction. Quote, provision, bill, support and renew — plus the Agent Store, where AI agents are listed and sold the way cloud products always have been.',
      keyPoints: [
        'Follow one product end to end: quote → provision → invoice → renewal. That journey is the product.',
        'Know where margin, billing terms and support boundaries actually live in the platform.',
        'The Agent Store is the commercial vehicle for the MIP story — an agent listing is a product listing.'
      ],
      objectives: [
        'Build a quote in the sandbox and walk someone through it',
        'Find a product’s margin and billing terms unaided',
        'Open an Agent Store listing and describe what a partner is buying'
      ],
      reward: 'Badge earned: Knows The Platform.'
    },
    {
      id: 'w5',
      badge: '5',
      label: 'World 5',
      title: 'Make It Happen',
      pos: 0.79501,
      x: 1014,
      y: 879,
      summary: 'Knowledge that never leaves your head is not enablement. This world is the conversation: open it, ask well, handle the pushback, and follow up in a way that gets you a second meeting.',
      keyPoints: [
        'Open with the partner’s business, not our roadmap.',
        'Discovery beats pitching: what are they already automating, and what is it costing them?',
        'Objections are information — "my clients are not asking for AI" is a starting point, not a wall.',
        'Follow up within 24 hours, in writing, with one specific next step.'
      ],
      objectives: [
        'Run a mock discovery call with your buddy',
        'Handle three common objections without reaching for a slide',
        'Send a follow-up using the approved template'
      ],
      reward: 'Badge earned: Ready For The Room.'
    },
    {
      id: 'w6',
      badge: '6',
      label: 'Final Challenge',
      title: 'The Final Challenge',
      pos: 1.0,
      x: 1273,
      y: 486,
      summary: 'The castle gate. Five questions on everything the road covered. Four correct answers open it.',
      keyPoints: [
        'No notes. If a question stalls you, go back and re-read that world — the coins stay walkable.'
      ],
      passMark: 4,
      quiz: [
        {
          q: 'What does MIP stand for?',
          options: [
            'Managed Intelligence Provider',
            'Modern Infrastructure Partner',
            'Managed Integration Platform',
            'Multi-tenant Identity Provider'
          ],
          answer: 0
        },
        {
          q: 'What is the Agentic Inflection Point?',
          options: [
            'The moment an MSP signs its first AI contract',
            'The shift of AI agents from passive copilots to autonomous systems that execute outcomes',
            'A Pax8 pricing tier for AI products',
            'The date the Agent Store goes generally available'
          ],
          answer: 1
        },
        {
          q: 'What is the commercial risk for MSPs that do not evolve?',
          options: [
            'Losing vendor certifications',
            'Higher licence costs from vendors',
            'Traditional managed-service margins projected to fall 30–50% by 2027',
            'Mandatory migration off on-premise infrastructure'
          ],
          answer: 2
        },
        {
          q: 'Which of these is NOT one of the three MIP value drivers?',
          options: [
            'Grow your business',
            'Increase efficiencies',
            'Reduce risk',
            'Lower licence prices'
          ],
          answer: 3
        },
        {
          q: 'Where do MIP programme questions get escalated?',
          options: [
            'Your regional marketing lead',
            'mip@pax8.com',
            'The partner’s account manager',
            'The Agent Store support queue'
          ],
          answer: 1
        }
      ],
      objectives: [
        'Pass the final challenge (4 of 5)'
      ],
      reward: 'Onboarding complete. You can run the MSP-to-MIP conversation on your own.'
    }
  ]
};
