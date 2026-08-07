/* Sole Academy Studio — starter curricula ------------------------------------
 *
 * Attaches window.SOLE_ACADEMY_SEED = { spm: <doc>, sole: <doc> }.
 *
 * These are STARTING POINTS the team edits in the Studio, not fixed content.
 * They exist so nobody opens the tool to an empty screen.
 *
 *   spm  — the real Sole Practice Manager curriculum, lifted verbatim from the
 *          in-app Academy (index.html → ACADEMY_CATEGORIES / ACADEMY_COURSES /
 *          LEARNING_PATHS). 8 categories · 12 courses · 30 lessons · 3 paths.
 *          Videos are deliberately EMPTY: the in-app version points two lessons
 *          at a generic Google sample MP4, and carrying those over would make
 *          the tool claim a lesson has a video when no Sole footage exists yet.
 *          So every lesson starts at production status "idea" — which is the
 *          honest starting position and gives the Production board a real
 *          worklist on day one.
 *   sole — a labelled SKELETON for the B2C small-business app. The real outline
 *          is the content team's call; this is scaffolding to rename and fill.
 *
 * Colours are stored as hex (not token names) so a published curriculum document
 * is fully self-describing for whoever consumes it. They match the `T` palette
 * in index.html exactly. Icon names must exist in that file's `Icon` map — the
 * Studio's picker enforces this.
 * ------------------------------------------------------------------------- */
(function () {
  var P = '#5B5BF6';   // T.primary
  var B = '#3B82F6';   // T.blue
  var G = '#10B981';   // T.green
  var A = '#D97706';   // T.amber

  // Every lesson starts here. `mins` is the team's own estimate until a real
  // video is attached (Vimeo/Loom oEmbed fills it in automatically when it can).
  var prod = function (mins) {
    return { status: 'idea', owner: '', due: '', notes: '' };
  };
  var L = function (id, title, mins, description, extra) {
    var l = {
      id: id, title: title, mins: mins, type: 'video',
      videoUrl: '', embedUrl: '', thumbUrl: '',
      description: description || '',
      takeaways: [], transcript: '', tags: [], resources: [],
      production: prod(mins),
    };
    if (extra) for (var k in extra) l[k] = extra[k];
    return l;
  };

  /* ==== SPM — Sole Practice Manager (B2B) ================================= */
  var spm = {
    product: 'spm',
    meta: {
      title: 'Sole Academy',
      blurb: 'Learn Sole Practice Manager at your own pace — short videos for every module, plus guided paths to get your whole team up to speed.',
    },
    categories: [
      { id: 'get-started',   label: 'Get started',          icon: 'rocket',     color: P, blurb: 'Set up your practice and find your way around' },
      { id: 'work-pipeline', label: 'Work pipeline',        icon: 'target',     color: B, blurb: 'Win clients — from first contact to signed engagement' },
      { id: 'work-delivery', label: 'Work delivery & team', icon: 'briefcase',  color: G, blurb: 'Run the work after the deal is won' },
      { id: 'capacity',      label: 'Capacity & reviews',   icon: 'gauge',      color: A, blurb: 'See bottlenecks before they become margin problems' },
      { id: 'payroll-tax',   label: 'Payroll & tax',        icon: 'wallet',     color: P, blurb: 'Run compliant AU payroll and lodgements' },
      { id: 'finance',       label: 'Finance & payments',   icon: 'creditCard', color: G, blurb: 'Bill, collect and reconcile' },
      { id: 'automation',    label: 'Automation & AI',      icon: 'sparkle2',   color: B, blurb: 'Let SPM do the repetitive work for you' },
      { id: 'portal',        label: 'Portal & white-label', icon: 'link',       color: A, blurb: 'Give clients a branded self-service experience' },
    ],
    courses: [
      { id: 'c-get-started', title: 'Getting started with Sole', category: 'get-started', level: 'Beginner', popular: true,
        summary: 'A guided tour of the platform — how the pieces fit together and how to set up your practice.',
        lessons: [
          L('l-gs-1', 'Welcome to Sole Practice Manager', 4,
            'A quick tour of the whole platform and how the modules connect — from winning a client to running their payroll.', {
            takeaways: ['What each part of the sidebar is for', 'How work flows from a deal to delivery', 'Where to go next depending on your role'],
            transcript: 'Welcome to Sole Practice Manager. In the next few minutes we’ll walk through the whole platform so you know where everything lives.\n\nOn the left is your sidebar, grouped by what you’re trying to do: My focus, Firm overview, Deals, Clients, Deliver, Team and Payroll.\n\nA typical job starts as a Deal, becomes a Proposal, and once it’s signed it turns into work your team delivers and bills. Payroll and compliance run alongside. Don’t worry about memorising it — each module has its own short course right here in the Academy.',
            resources: [{ label: 'Quick-start checklist (PDF)', href: '' }, { label: 'Sidebar map', href: '' }],
            tags: ['tour', 'orientation', 'sidebar'] }),
          L('l-gs-2', 'Navigating the sidebar & dashboards', 5,
            'How the lifecycle sidebar is organised and how to read the Practice Dashboard and Helicopter view.', {
            resources: [{ label: 'Dashboard cheat-sheet', href: '' }],
            tags: ['navigation', 'dashboard', 'helicopter view'] }),
          L('l-gs-3', 'Setting up your practice profile & offices', 6,
            'Configure your firm details, offices and the office switcher so scoped views show the right data.', {
            tags: ['setup', 'offices', 'practice profile'] }),
          L('l-gs-4', 'Inviting your team & setting roles', 5,
            'Add team members, assign roles and permissions, and get everyone into their own workspace.', {
            tags: ['team', 'roles', 'permissions', 'invite'] }),
        ] },
      { id: 'c-crm', title: 'Centralised CRM & Client Portal', category: 'work-pipeline', level: 'Beginner',
        summary: 'Contacts, tasks, communications and documents in one client workspace — plus the branded client portal.',
        lessons: [
          L('l-crm-1', 'Your client workspace in one place', 6,
            'See how a single client record pulls together contacts, tasks, jobs, documents and communications.', {
            takeaways: ['Open and read a client record', 'Log a task and a communication', 'Attach and find documents'],
            transcript: 'Every client in Sole has one workspace that brings together everything you know about them — people, jobs, documents and every conversation — so you’re never digging through email to find the last thing that happened.',
            resources: [{ label: 'Client record fields reference', href: '' }],
            tags: ['crm', 'client record', 'workspace'] }),
          L('l-crm-2', 'Contacts, tasks & communications', 5,
            'Keep every contact, to-do and message against the right client so nothing slips.', {
            tags: ['contacts', 'tasks', 'communications'] }),
          L('l-crm-3', 'Giving clients the branded portal', 4,
            'Turn on the white-label client portal so clients can self-serve documents, approvals and requests.', {
            tags: ['portal', 'white-label', 'self-service'] }),
        ] },
      { id: 'c-pipeline', title: 'Sales & Pipeline Oversight', category: 'work-pipeline', level: 'Intermediate',
        summary: 'Track prospects and opportunities and forecast your pipeline from first contact to conversion.',
        lessons: [
          L('l-pl-1', 'Tracking prospects & opportunities', 6,
            'Work the Deals board — stages, priorities and the next step to move each opportunity forward.', {
            tags: ['deals', 'pipeline', 'prospects'] }),
          L('l-pl-2', 'The Pipeline forecast dashboard', 5,
            'Read the Pipeline forecast to see expected revenue, weighting and capacity impact.', {
            tags: ['forecast', 'revenue', 'dashboard'] }),
        ] },
      { id: 'c-proposals', title: 'Proposal Workflow Automation', category: 'work-pipeline', level: 'Beginner', popular: true,
        summary: 'Build, send and convert proposals — from services and packages to signature and won-work handoff.',
        lessons: [
          L('l-pr-1', 'Building a proposal from services', 7,
            'Assemble packages, service lines and pricing into a polished proposal.', {
            resources: [{ label: 'Services & packages guide', href: '' }],
            tags: ['proposal', 'services', 'packages', 'pricing'] }),
          L('l-pr-2', 'Payment, terms & sending for signature', 5,
            'Set payment methods, terms and next steps, then send the proposal for e-signature.', {
            tags: ['payment', 'terms', 'e-signature'] }),
          L('l-pr-3', 'Converting a won proposal into work', 4,
            'When a proposal is accepted, turn it into active jobs and an onboarding handoff.', {
            tags: ['won', 'conversion', 'onboarding'] }),
        ] },
      { id: 'c-projects', title: 'Project & Task Management', category: 'work-delivery', level: 'Beginner',
        summary: 'Manage jobs, approvals, deadlines and accountability without a separate workflow tool.',
        lessons: [
          L('l-pj-1', 'Jobs, tasks & deadlines', 6,
            'Create jobs, break them into tasks and keep due dates visible to the whole team.', {
            tags: ['jobs', 'tasks', 'deadlines'] }),
          L('l-pj-2', 'Approvals & accountability', 5,
            'Route work through review and approval so nothing goes out unchecked.', {
            tags: ['approvals', 'review'] }),
        ] },
      { id: 'c-time', title: 'Time Tracking & Billing', category: 'work-delivery', level: 'Beginner',
        summary: 'Record time as you work and turn it into invoices inside the same operating flow.',
        lessons: [
          L('l-tt-1', 'Recording time as you work', 5,
            'Use the timer and manual entries to capture billable and non-billable time accurately.', {
            tags: ['time', 'timer', 'billable'] }),
          L('l-tt-2', 'Turning time into invoices', 5,
            'Convert recorded time and expenses into invoices ready to send.', {
            tags: ['invoicing', 'billing'] }),
        ] },
      { id: 'c-team', title: 'Workforce & Team Management', category: 'work-delivery', level: 'Intermediate',
        summary: 'Visibility of staff capacity, tasks, performance and how work moves through the firm.',
        lessons: [
          L('l-tm-1', 'Team members, roles & permissions', 5,
            'Manage who can see and do what across the practice.', {
            tags: ['team', 'roles', 'permissions'] }),
          L('l-tm-2', 'Service lines & capacity targets', 5,
            'Set up service lines and per-person capacity targets that feed the planners.', {
            tags: ['service lines', 'capacity'] }),
        ] },
      { id: 'c-capacity', title: 'Staff Scheduler & Capacity Planning', category: 'capacity', level: 'Intermediate',
        summary: 'Assign work by availability and skill, and spot bottlenecks before they hit margin.',
        lessons: [
          L('l-cp-1', 'Assigning work by availability & skill', 7,
            'Use the scheduler to match work to the right person at the right time.', {
            tags: ['scheduler', 'availability', 'skills'] }),
          L('l-cp-2', 'Spotting bottlenecks early', 5,
            'Read the capacity view to find overloaded weeks and rebalance the plan.', {
            tags: ['bottlenecks', 'capacity', 'rebalance'] }),
        ] },
      { id: 'c-payroll', title: 'Payroll Management', category: 'payroll-tax', level: 'Intermediate', popular: true,
        summary: 'Run compliant Australian payroll end-to-end — from employers to a finalised, STP-reported payrun.',
        lessons: [
          L('l-py-1', 'Payroll overview & employers', 5,
            'Understand the Payroll module: employers at a glance, employees and payrun activity.', {
            tags: ['payroll', 'employers', 'overview'] }),
          L('l-py-2', 'Running a payrun, step by step', 8,
            'Walk the payrun wizard: Basic info → Pay list → Expenses → Deductions → Review.', {
            takeaways: ['Start a payrun and pick the pay period', 'Resolve the readiness pill’s issues', 'Review payslips before lodging'],
            resources: [{ label: 'Payrun wizard walkthrough', href: '' }],
            tags: ['payrun', 'wizard', 'payslips'] }),
          L('l-py-3', 'Expenses, deductions & leave', 6,
            'Add reimbursements, deductions and leave so payslips are correct.', {
            tags: ['expenses', 'deductions', 'leave'] }),
          L('l-py-4', 'STP, super & finalising', 6,
            'Report through Single Touch Payroll, handle super, and finalise the run.', {
            tags: ['stp', 'super', 'finalise'] }),
        ] },
      { id: 'c-tax', title: 'Tax, Compliance & Onboarding', category: 'payroll-tax', level: 'Intermediate',
        summary: 'Track lodgements and run compliant client onboarding, AML/KYC and BAS/GST from one place.',
        lessons: [
          L('l-tx-1', 'Compliance dashboard & AML/KYC', 6,
            'Use the compliance dashboard to track client onboarding, KYC and AML obligations.', {
            tags: ['compliance', 'aml', 'kyc', 'onboarding'] }),
          L('l-tx-2', 'BAS, GST & lodgement tracking', 6,
            'Keep BAS, GST and other lodgements on schedule with clear status.', {
            tags: ['bas', 'gst', 'lodgements'] }),
        ] },
      { id: 'c-workflow', title: 'Workflow Automation', category: 'automation', level: 'Intermediate',
        summary: 'Automate the repetitive parts of your practice with recipes, templates and the workflow builder.',
        lessons: [
          L('l-wf-1', 'Recipes & the workflow builder', 7,
            'Start from a recipe or build your own automation with triggers and actions.', {
            tags: ['automation', 'recipes', 'workflow builder'] }),
          L('l-wf-2', 'Templates & global settings', 5,
            'Reuse email/message templates and configure firm-wide workflow settings.', {
            tags: ['templates', 'settings'] }),
        ] },
      { id: 'c-ai', title: 'AI Prompt Library & Insights', category: 'automation', level: 'Beginner',
        summary: 'Use your team’s shared AI prompts to draft faster, and let SPM surface insights.',
        lessons: [
          L('l-ai-1', 'Using the AI Prompt Library', 5,
            'Browse the team library, open a prompt and copy it into your AI tool.', {
            tags: ['ai', 'prompts', 'library'] }),
          L('l-ai-2', 'Filling {{fields}} & sharing prompts', 4,
            'Fill in a prompt’s variables, save your own, and share the best with the firm.', {
            tags: ['ai', 'variables', 'sharing'] }),
        ] },
    ],
    paths: [
      { id: 'path-onboarding', title: 'Getting started (new team member)', forRole: 'Everyone · first week',
        blurb: 'The essentials every new user needs before touching live client work.',
        courseIds: ['c-get-started', 'c-crm', 'c-pipeline', 'c-proposals'] },
      { id: 'path-payroll', title: 'Payroll specialist', forRole: 'Payroll & bookkeeping staff',
        blurb: 'Everything you need to run compliant Australian payroll and lodgements.',
        courseIds: ['c-get-started', 'c-payroll', 'c-tax', 'c-time'] },
      { id: 'path-owner', title: 'Practice owner / partner', forRole: 'Partners & practice leads',
        blurb: 'The firm-wide view: pipeline, capacity, team and where AI saves you time.',
        courseIds: ['c-get-started', 'c-capacity', 'c-team', 'c-pipeline', 'c-ai'] },
    ],
  };

  /* ==== SOLE — small-business app (B2C) =================================== */
  /* SKELETON ONLY. Rename, reorder and fill these in the Studio — the real B2C
     outline belongs to the content team. Johann noted the B2C videos already
     exist, so the first real job here is pointing lessons at them.

     ⚠️ HEADS UP (2026-08-06): a real B2C curriculum now SHIPS in the prototype —
     `pages/unibox.html` + `pages/unibox-mobile.html` carry 7 tracks / 12 modules /
     34 chapters with ids like `c-invoice` / `l-inv-1`. The ids below (`b-c-invoices`,
     `b-l-…`) do NOT match it. Ids are learner-progress keys, so authoring against
     this skeleton and publishing would orphan every completion recorded in the app.
     Reconcile this document with the shipped one before the team starts editing —
     see docs/ACADEMY_INTEGRATION.md ("Who reads it today") and docs/BACKLOG.md.
     The shipped shape also uses `tracks` (not `categories`), a per-module
     `menuGroup` + `icon`, and a required per-chapter
     `status: 'published' | 'recording' | 'planned'`. */
  var sole = {
    product: 'sole',
    meta: {
      title: 'Sole Academy',
      blurb: 'Short videos that show you how to run the money side of your business in Sole — invoices, expenses, quotes and tax.',
    },
    categories: [
      { id: 'b-get-started', label: 'Get started',            icon: 'rocket',     color: P, blurb: 'Set up Sole and find your way around' },
      { id: 'b-getting-paid', label: 'Invoices & getting paid', icon: 'creditCard', color: G, blurb: 'Send invoices and get money in the door faster' },
      { id: 'b-quotes',      label: 'Quotes & jobs',          icon: 'fileText',   color: B, blurb: 'Win the work and keep track of it' },
      { id: 'b-expenses',    label: 'Expenses & receipts',    icon: 'receipt',    color: A, blurb: 'Capture what you spend without the shoebox' },
      { id: 'b-clients',     label: 'Clients',                icon: 'users',      color: B, blurb: 'Keep your customer details in one place' },
      { id: 'b-tax',         label: 'Tax & GST',              icon: 'percent',    color: P, blurb: 'Stay on top of BAS, GST and tax time' },
      { id: 'b-reports',     label: 'Reports & insights',     icon: 'chartBar',   color: G, blurb: 'Know how the business is actually going' },
    ],
    courses: [
      { id: 'b-c-start', title: 'Getting started with Sole', category: 'b-get-started', level: 'Beginner', popular: true,
        summary: 'Set up your business in Sole and get comfortable with the app.',
        lessons: [
          L('b-l-start-1', 'Welcome to Sole', 3, 'What Sole does and a quick look around the app.', { tags: ['tour', 'welcome'] }),
          L('b-l-start-2', 'Setting up your business details', 4, 'Add your business name, ABN, logo and payment details so invoices look right.', { tags: ['setup', 'abn', 'logo'] }),
          L('b-l-start-3', 'Connecting your bank', 4, 'Link your bank account so money in and out shows up automatically.', { tags: ['bank', 'connection'] }),
        ] },
      { id: 'b-c-invoices', title: 'Invoices & getting paid', category: 'b-getting-paid', level: 'Beginner', popular: true,
        summary: 'Create an invoice, send it, and chase it politely when it’s late.',
        lessons: [
          L('b-l-inv-1', 'Creating and sending your first invoice', 5, 'Build an invoice from scratch and send it to a customer.', { tags: ['invoice', 'send'] }),
          L('b-l-inv-2', 'Getting paid faster with payment links', 4, 'Add a pay-now link so customers can pay by card or bank transfer.', { tags: ['payments', 'pay now'] }),
          L('b-l-inv-3', 'Chasing overdue invoices', 4, 'Set up automatic reminders so you don’t have to do the awkward follow-up.', { tags: ['reminders', 'overdue', 'debtors'] }),
          L('b-l-inv-4', 'Recurring invoices for regulars', 3, 'Bill the same customer the same amount on a schedule, automatically.', { tags: ['recurring', 'subscriptions'] }),
        ] },
      { id: 'b-c-quotes', title: 'Quotes & jobs', category: 'b-quotes', level: 'Beginner',
        summary: 'Send a quote that wins the job, then turn it into an invoice when it’s done.',
        lessons: [
          L('b-l-q-1', 'Sending a quote', 4, 'Put a quote together and send it for approval.', { tags: ['quote', 'estimate'] }),
          L('b-l-q-2', 'Turning an accepted quote into a job', 4, 'When the customer says yes, convert the quote and track the work.', { tags: ['jobs', 'conversion'] }),
        ] },
      { id: 'b-c-expenses', title: 'Expenses & receipts', category: 'b-expenses', level: 'Beginner',
        summary: 'Snap receipts, categorise spending and stop losing deductions.',
        lessons: [
          L('b-l-e-1', 'Snapping and storing receipts', 4, 'Photograph a receipt and attach it to the right expense.', { tags: ['receipts', 'photo'] }),
          L('b-l-e-2', 'Categorising your spending', 4, 'Sort expenses so your reports and tax time actually make sense.', { tags: ['categories', 'coding'] }),
          L('b-l-e-3', 'Claiming vehicle & home-office costs', 4, 'Log kilometres and home-office use the way the ATO expects.', { tags: ['vehicle', 'home office', 'deductions'] }),
        ] },
      { id: 'b-c-clients', title: 'Managing your customers', category: 'b-clients', level: 'Beginner',
        summary: 'Keep customer details, history and documents together.',
        lessons: [
          L('b-l-c-1', 'Adding and organising customers', 4, 'Create a customer record and keep their details up to date.', { tags: ['customers', 'contacts'] }),
        ] },
      { id: 'b-c-tax', title: 'Tax & GST made simple', category: 'b-tax', level: 'Beginner',
        summary: 'BAS, GST and tax time without the last-minute panic.',
        lessons: [
          L('b-l-t-1', 'GST basics in Sole', 5, 'How GST works on your invoices and expenses, and what Sole tracks for you.', { tags: ['gst'] }),
          L('b-l-t-2', 'Getting ready for BAS', 5, 'What to check before you lodge, and where to find the numbers.', { tags: ['bas', 'lodgement'] }),
        ] },
      { id: 'b-c-reports', title: 'Knowing how you’re going', category: 'b-reports', level: 'Beginner',
        summary: 'The handful of numbers worth looking at each month.',
        lessons: [
          L('b-l-r-1', 'Reading your profit and cash position', 5, 'The difference between profit and cash, and where to see both.', { tags: ['profit', 'cashflow'] }),
          L('b-l-r-2', 'Who owes you money', 3, 'Find your outstanding invoices at a glance.', { tags: ['debtors', 'aged receivables'] }),
        ] },
    ],
    paths: [
      { id: 'b-path-new', title: 'Brand new to Sole', forRole: 'Everyone · first week',
        blurb: 'The short version: set up, send an invoice, get paid.',
        courseIds: ['b-c-start', 'b-c-invoices'] },
      { id: 'b-path-tradie', title: 'Quoting trades & services', forRole: 'Trades and service businesses',
        blurb: 'Quote the job, do the job, get paid for the job.',
        courseIds: ['b-c-start', 'b-c-quotes', 'b-c-invoices', 'b-c-expenses'] },
      { id: 'b-path-tax', title: 'Tax-time ready', forRole: 'Anyone lodging a BAS',
        blurb: 'Get your records straight before your accountant asks.',
        courseIds: ['b-c-expenses', 'b-c-tax', 'b-c-reports'] },
    ],
  };

  window.SOLE_ACADEMY_SEED = { spm: spm, sole: sole };

  // Product registry — the Studio's switcher reads this, so adding a third
  // product later (a partner white-label, say) is one entry + one seed doc.
  window.SOLE_ACADEMY_PRODUCTS = [
    { id: 'spm',  label: 'Sole Practice Manager', short: 'SPM',  blurb: 'B2B · accounting practices' },
    { id: 'sole', label: 'Sole (small business)',  short: 'Sole', blurb: 'B2C · sole traders & small business' },
  ];
})();
