/* =============================================================================
   Sole white-label resource content  —  data.js
   -----------------------------------------------------------------------------
   window.RESOURCES: every lead-magnet keyed by id. Each entry is pure DATA that
   a shared renderer (resource.js) turns into a branded document. Content is
   recreated from Sole's existing .docx/.xlsx resources. Adding a resource = a
   new entry here (+ a thin shell page); no new layout code.

   archetype ∈ { 'checklist-getpaid' | 'pricing' | 'invoice-deposit' | ... }
   ========================================================================== */
(function (global) {
  'use strict';

  var RESOURCES = {

    /* ---- 1. Getting-Paid Checklist — Trades  (archetype: content) -------- */
    'getting-paid-trades': {
      archetype: 'checklist-getpaid',
      industry: 'trades',
      slug: 'getting-paid-trades',
      title: 'The Trades Getting-Paid Checklist',
      eyebrow: 'Free checklist · Trades',
      metaDescription: 'A free checklist for Australian trades — plumbers, electricians, HVAC, carpenters and more — to prevent late payments and collect overdue invoices faster.',
      intro: 'Late and non-payments are the number-one cash-flow killer for trades. Work through this checklist to set jobs up so you get paid on time — and to collect faster when an invoice slips overdue.',
      ctaHeading: 'Get paid on the spot — before you leave site',
      ctaText: 'Set up in minutes to invoice from your phone and take instant card, Apple Pay and Google Pay payments.',
      sections: [
        {
          heading: 'Prevent non-payments',
          items: [
            { t: 'Take deposits before starting work', d: 'Collect 30–50% upfront for installs, upgrades and large repairs.' },
            { t: 'Charge a call-out fee to qualify clients', d: 'A fixed call-out fee payable upfront reduces time-wasters and no-shows.' },
            { t: 'Explain payment terms clearly at booking', d: 'Say it plainly: “Payment is due on completion unless otherwise agreed.”' },
            { t: 'Keep payment terms short', d: 'Maintenance = pay on completion. Projects = 7–14 days maximum.' },
            { t: 'Require progress payments on bigger jobs', d: 'Break the job into milestones and only continue once each stage is paid.' },
            { t: 'Get written approval for variations', d: 'Text the client: “Extra 1.5 hrs + $80 materials. Reply YES to approve.”' },
            { t: 'Check credit history for builders & new commercial clients', d: 'Ask other tradies, or check ASIC insolvency notices.' },
            { t: 'Invoice immediately after the job', d: 'Send the invoice before you leave site — not that evening, not next week.' },
            { t: 'Only deal with the actual bill payer', d: 'Confirm who is paying before you book the job in.' },
            { t: 'Collect card details securely for after-hours work', d: 'Pre-authorise payment for emergency and out-of-hours call-outs.' }
          ]
        },
        {
          heading: 'Collect overdue payments',
          items: [
            { t: 'Follow a clear overdue process', d: 'Day 1 reminder → Day 3 call → Day 7 written demand → escalation.' },
            { t: 'Take the chasing off your own plate', d: 'Automated reminders keep the emotion out of it and cut manual follow-up.' },
            { t: 'Use a simple call script', d: '“Just checking on Invoice #123 — when can we expect payment?”' },
            { t: 'Apply late fees or interest', d: 'Build it into your terms of trade for repeat offenders.' },
            { t: 'Confirm the invoice was received before it’s due', d: 'A quick message avoids the “I never got it” excuse.' },
            { t: 'Call the day after it becomes overdue', d: 'Prompt action dramatically raises the chance of getting paid.' },
            { t: 'Send a 7-day final notice', d: 'A firm written deadline before any formal escalation.' },
            { t: 'Have a debt collector ready', d: 'Escalate once the account has clearly gone cold.' }
          ]
        },
        {
          heading: 'Bonus tips',
          items: [
            { t: 'Automate your overdue reminders', d: 'Let the system send reminder emails and track payment status for you.' },
            { t: 'Track overdue revenue monthly', d: 'Aim to keep unpaid invoices under 5% of what you’ve invoiced at any time.' },
            { t: 'Take tap-and-go payments on site', d: 'Clients who pay the moment the job’s done almost never become late payers.' }
          ]
        }
      ],
      proTip: 'With Sole you can send the invoice from your phone as you pack up your tools — the client pays instantly by card, Apple Pay or Google Pay, and the payment auto-reconciles in your account. No paper, no bank matching, no chasing.'
    },

    /* ---- 2. Pricing Template — Trades  (archetype: pricing) -------------- */
    'pricing-trades': {
      archetype: 'pricing',
      industry: 'trades',
      slug: 'pricing-trades',
      title: 'The Trades Pricing Guide',
      eyebrow: 'Free guide · Trades',
      metaDescription: 'A free pricing guide for Australian trades: recommended pricing structure, typical rate ranges, a job-pricing formula and an AI prompt to benchmark your local rates.',
      intro: 'Under-pricing is silent and expensive. Use this guide to set a pricing structure that covers your costs and your worth — then benchmark it against your local market with the AI prompt at the end.',
      ctaHeading: 'Quote in under two minutes',
      ctaText: 'Build a branded quote with a one-click Accept button — when the client accepts, it converts to a confirmed job instantly.',
      structure: [
        'Call-out fee (first hour included)',
        'Standard hourly rate (after the first hour)',
        'Fixed-price packages for common jobs (e.g. tap replacement, light fitting)',
        'Materials at cost plus a mark-up (typically 15–30%)',
        'After-hours / weekend surcharge'
      ],
      benchmarks: {
        columns: ['Item', 'Common range (illustrative only)'],
        rows: [
          ['Call-out fee (1st hour included)', '$120 – $180'],
          ['Standard hourly rate (after 1st hour)', '$90 – $130 / hr'],
          ['After-hours / weekend rate', '$150 – $220 / hr'],
          ['Small install (tap, light, outlet)', '$110 – $260'],
          ['Large or complex jobs', 'Individually quoted']
        ]
      },
      benchmarksNote: 'Indicative only. Your rates vary by trade, location, demand and experience. Use the AI prompt below to research current rates in your area.',
      adjust: {
        increase: [
          'Limited access or elevated physical risk',
          'Work at height or in confined spaces',
          'Weekend, public holiday or emergency call-out',
          'Hazardous environments (asbestos risk, live circuits)',
          'Additional trades required'
        ],
        reduce: [
          'Repeat or long-term clients',
          'Multiple jobs in one visit (pass on the efficiency saving)',
          'Off-peak scheduling in slower periods'
        ]
      },
      formula: {
        eq: '(Base hourly rate × 1.2–1.4) + materials cost + call-out fee = job price',
        ex: '$100/hr × 1.3 = $130/hr + materials + $150 call-out = final quote'
      },
      inclusions: [
        'Labour for the agreed scope of work',
        'Standard consumables (fasteners, tape, fittings, connectors)',
        'Travel within your local service radius',
        'Safety compliance for standard jobs'
      ],
      exclusions: [
        'Specialised or non-standard materials',
        'Scaffolding or elevated-platform hire',
        'Waste disposal fees',
        'Compliance certificates (may be charged separately)',
        'Urgent same-day attendance (after-hours rate applies)'
      ],
      aiPrompt: 'Act as an Australian trade pricing analyst. I am a [trade] in [suburb/city]. Please give me:\n1. Standard call-out pricing in my area\n2. Typical hourly rates for my trade\n3. Typical fixed prices for common jobs\n4. After-hours and weekend pricing\n5. A recommended standard, budget and premium rate for my service\n6. A final suggested price for my region, based on real competitors.',
      proTip: 'Once your rates are set, build professional, branded quotes in under two minutes. Add your call-out fee, hourly rate, materials and surcharges as line items — your client gets a quote with a one-click Accept button, and when they accept it converts to a confirmed job. No phone tag, no email chains.'
    },

    /* ---- 3. Deposit Invoice — interactive  (archetype: invoice) ---------- */
    'deposit-invoice': {
      archetype: 'invoice-deposit',
      industry: 'all',
      slug: 'deposit-invoice',
      title: 'Deposit Invoice Template',
      eyebrow: 'Interactive · GST-ready · Australia',
      metaDescription: 'A free, GST-ready deposit invoice template for Australian sole traders. Fill it in, auto-calculate GST and the deposit due, and print or save as PDF.',
      intro: 'Collect a deposit before work starts. Fill in the fields below — GST (10%), the deposit due and the balance on completion calculate automatically. Print or save it as a PDF when you’re done.',
      ctaHeading: 'Send invoices that get paid faster',
      ctaText: 'Set up free to send GST-ready invoices, take instant payments and track who owes you what.',
      persistKey: 'deposit-invoice',
      gstRate: 0.10,
      depositOptions: [
        { label: '50%', pct: 0.5 },
        { label: '40%', pct: 0.4 },
        { label: '30%', pct: 0.3 },
        { label: '25%', pct: 0.25 }
      ],
      defaultDepositPct: 0.5,
      seed: {
        business: { name: '', abn: '', email: '', phone: '', address: '', bsb: '', acct: '', acctName: '' },
        client: { name: '', abn: '', email: '', address: '' },
        invoiceNo: 'INV-0001',
        invoiceDate: '',
        dueDate: '',
        lines: [
          { desc: '', qty: 1, price: 0 },
          { desc: '', qty: 1, price: 0 }
        ],
        depositPct: 0.5,
        paymentNote: 'Work commences upon receipt of the deposit. Please use the invoice number as your payment reference.'
      },
      footerNoteExtra: 'This template is designed to meet ATO tax-invoice requirements. GST-registered businesses must show their ABN on any invoice over $75.'
    }

  };

  global.RESOURCES = RESOURCES;

  // Light index for the library landing page.
  global.RESOURCE_INDEX = Object.keys(RESOURCES).map(function (id) {
    var r = RESOURCES[id];
    return { id: id, title: r.title, eyebrow: r.eyebrow, industry: r.industry, archetype: r.archetype, intro: r.intro };
  });
})(typeof window !== 'undefined' ? window : this);
