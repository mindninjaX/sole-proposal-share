/* Sole Academy Studio — starter curricula ------------------------------------
 *
 * Attaches window.SOLE_ACADEMY_SEED = { spm: <doc>, sole: <doc> }.
 *
 * These are STARTING POINTS the team edits in the Studio, not fixed content —
 * they exist so nobody opens the tool to an empty screen.
 *
 *   spm  — the real Sole Practice Manager curriculum, lifted verbatim from the
 *          in-app Academy (index.html → ACADEMY_TRACKS / ACADEMY_COURSES /
 *          LEARNING_PATHS) as it stands after the 4 Aug 2026 restructure:
 *          5 tracks · 16 modules · 67 chapters · 5 paths. Every module is named
 *          after a group in the app's left-hand menu; chapters are that group's
 *          sub-pages, in menu order. Production status is seeded from the SAME
 *          per-chapter status the live app already carries (3 published,
 *          6 recording, 58 planned) — NOT reset to "idea" — so opening the
 *          Studio shows the team's actual worklist, not a fabricated blank one.
 *   sole — the real B2C small-business curriculum, lifted verbatim from
 *          pages/unibox.html → ACADEMY_TRACKS / ACADEMY_COURSES /
 *          LEARNING_PATHS: 7 tracks · 12 modules · 34 chapters · 3 paths.
 *          Since #101 the B2C app carries the SAME per-chapter honesty status
 *          as SPM, so these seed from it rather than from a blanket
 *          "published": 4 published (c-unibox is the one fully-recorded
 *          module, plus l-start-1), 6 recording, 24 planned. Before #101 this
 *          file marked all 34 published, which would have re-published the
 *          exact defect #101 removed — a play button and a certificate on
 *          chapters with no footage.
 *          Ids match the shipped ones (`c-invoice` / `l-inv-1`, not `b-c-*`),
 *          which matters because ids are learner-progress keys: authoring
 *          against mismatched ids and publishing would orphan every
 *          completion already recorded in the app.
 *
 * Colours are stored as hex (not token names) so a published curriculum
 * document is fully self-describing for whoever consumes it — they're the
 * exact 5 hex values behind `T.primary` / `T.blue` / `T.green` / `T.amber` /
 * `T.primaryDark` in both source files. Course icon names must exist in the
 * Studio's own icon map AND its COURSE_ICONS allow-list — the picker enforces
 * this. Six names were added beyond the doc's original 30 (`dollar`, `trendUp`,
 * `inbox`, `sparkle`, `send`, `layers`) because real modules in the shipped apps
 * use them. Whenever the apps adopt a new module icon, add its path here too:
 * an icon the Studio can't draw silently falls back to a generic glyph, and any
 * substitute chosen instead gets PUBLISHED, so the app ends up showing the
 * wrong icon. Six B2C modules were caught doing exactly that.
 * `menuGroup` is SPM-only (the "named after the app's menu" rule from the
 * 4 Aug meeting doesn't apply to the B2C product) — every `sole` course
 * leaves it blank.
 * ------------------------------------------------------------------------- */
(function () {
  var P = '#5B5BF6';   // T.primary
  var B = '#3B82F6';   // T.blue
  var G = '#10B981';   // T.green
  var A = '#D97706';   // T.amber
  var V = '#4F46E5';   // T.primaryDark

  var SAMPLE_1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
  var SAMPLE_2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  // `extra.production` merges onto the default { status: 'idea', owner: '', due: '', notes: '' }
  // rather than replacing it, so a lesson only needs to say what's non-default.
  var L = function (id, title, mins, description, extra) {
    var l = {
      id: id, title: title, mins: mins, type: 'video',
      videoUrl: '', embedUrl: '', thumbUrl: '', tour: '',
      description: description || '',
      takeaways: [], transcript: '', tags: [], resources: [],
      production: { status: 'idea', owner: '', due: '', notes: '' },
    };
    if (extra) {
      for (var k in extra) {
        if (k === 'production') { for (var pk in extra.production) l.production[pk] = extra.production[pk]; }
        else l[k] = extra[k];
      }
    }
    return l;
  };

  /* ==== SPM — Sole Practice Manager (B2B) ================================= */
  var spm = {
    product: 'spm',
    meta: {
      title: 'Sole Academy',
      blurb: 'Learn Sole Practice Manager at your own pace — short videos for every module, plus guided paths to get your whole team up to speed.',
    },
    tracks: [
      { id: 'foundations',  label: 'Foundations',        color: P, blurb: 'Find your way around and learn how the pieces connect' },
      { id: 'win-work',     label: 'Win work',           color: B, blurb: 'From first enquiry to a signed engagement' },
      { id: 'client-work',  label: 'Clients & delivery', color: G, blurb: 'Run the work after the deal is won' },
      { id: 'people-money', label: 'People & money',     color: A, blurb: 'Staff, payroll and getting paid' },
      { id: 'automate',     label: 'Automate & set up',  color: V, blurb: 'Configure the practice and let SPM do the repetitive work' },
    ],
    courses: [
      { id: 'c-get-started', title: 'Getting started with SPM', menuGroup: 'Orientation', track: 'foundations', icon: 'rocket', level: 'Beginner', popular: true,
        summary: 'Your first hour in Sole Practice Manager — the menu, the vocabulary, and how work actually flows through the firm.',
        lessons: [
          L('l-gs-1', 'Welcome to Sole Practice Manager', 4,
            'What SPM is for, who does what in it, and how the modules connect — from winning a client to running their payroll.', {
            videoUrl: SAMPLE_1,
            takeaways: ['What each group in the menu is for', 'How work flows from a deal to delivery', 'Where to go next depending on your role'],
            transcript: 'Welcome to Sole Practice Manager. In the next few minutes we’ll walk through the whole platform so you know where everything lives.\n\nOn the left is your menu, grouped by what you’re trying to do: My focus, Firm Overview, Deals, Proposals, Clients, Deliver, Scheduling, Teams, Payroll, and the automation and finance groups underneath.\n\nA typical job starts as a Deal, becomes a Proposal, and once it’s signed it turns into onboarding, then work your team delivers, reviews and bills. Payroll and compliance run alongside. Don’t worry about memorising it — every group in that menu has its own module right here in the Academy, named exactly the same way.',
            resources: [{ label: 'Quick-start checklist (PDF)', href: '#' }, { label: 'Menu map', href: '#' }],
            production: { status: 'published' } }),
          L('l-gs-2', 'Finding your way around', 5,
            'The grouped menu, the anatomy of a page (title, subtitle, period control, primary action), the sidebar timer and the user card.', {
            takeaways: ['Collapse and expand menu groups', 'Read any page header the same way', 'Start and stop the time tracker'],
            production: { status: 'recording' } }),
          L('l-gs-3', 'How work flows through your firm', 6,
            'The client lifecycle SPM is built around — Selling, Onboarding, Delivery, Review, Collection, Resourcing — and which module owns each stage.', {
            takeaways: ['Name the six lifecycle stages', 'Know which module owns each stage', 'Recognise the same stages on the Helicopter view'],
            production: { status: 'recording' } }),
          L('l-gs-4', 'Your profile, the timer & notifications', 4,
            'Set up your own details, capture time with the sidebar timer, and keep the notification feed under control.', {
            production: { status: 'recording' } }),
          L('l-gs-5', 'Where to start, by role', 3,
            'Which learning path to follow depending on whether you do front office, delivery, payroll, or run the practice.', {
            production: { status: 'recording' } }),
        ] },

      { id: 'c-my-focus', title: 'My focus', menuGroup: 'My focus', track: 'foundations', icon: 'star', level: 'Beginner',
        summary: 'Your personal workspace — the week in front of you, and the notifications that need a decision.',
        lessons: [
          L('l-mf-1', 'My Dashboard', 6,
            'Read your own week: utilisation against target, hours free, reviews on you, what you are waiting on others for, and the AI suggested actions.', {
            takeaways: ['Read the utilisation and hours-free tiles', 'Tell "blocked" apart from "waiting on client"', 'Act on an AI suggested action'] }),
          L('l-mf-2', 'Notifications', 4,
            'Triage the feed: filter by type, read the detail pane, and clear the backlog without losing the important ones.'),
        ] },

      { id: 'c-firm-overview', title: 'Firm Overview', menuGroup: 'Firm Overview', track: 'foundations', icon: 'gauge', level: 'Intermediate',
        summary: 'The two firm-wide dashboards — what every number means and which ones should make you act today.',
        lessons: [
          L('l-fo-1', 'Practice Dashboard', 8,
            'The operational control center, section by section: the seven KPIs, Financial health, Workflow & jobs, WIP & billing efficiency, Capacity & utilisation, the review row, Risks & data quality, and Today’s focus.', {
            tour: 'practice-dashboard',
            takeaways: ['Read all seven top KPIs', 'Use the revenue-trend and WIP-ageing charts', 'Work the Risks & data quality queue by severity'],
            production: { status: 'recording' } }),
          L('l-fo-2', 'Helicopter view', 8,
            'The daily ops matrix: the operational snapshot, AI insights, today’s management focus, the Client Experience Score, firm flow, Lifecycle health, and the client × service matrix.', {
            tour: 'helicopter-view',
            takeaways: ['Read Lifecycle health and spot a Critical stage', 'Interpret the Client Experience Score', 'Drill into a cell of the client × service matrix'],
            production: { status: 'recording' } }),
        ] },

      { id: 'c-deals', title: 'Deals', menuGroup: 'Deals', track: 'win-work', icon: 'target', level: 'Beginner', popular: true,
        summary: 'Your sales pipeline — the board you work every day, and the forecast that tells you whether you can staff what you are about to win.',
        lessons: [
          L('l-deals-1', 'Pipeline Forecast', 6,
            'Read the forecast: open pipeline, committed forecast, forecast hours, the unallocated-hours staffing gap, and the Capacity Impact donuts.', {
            videoUrl: SAMPLE_2, tour: 'pipeline-forecast',
            takeaways: ['Tell committed from uncommitted pipeline', 'Read unallocated hours as a staffing gap', 'Use Capacity Impact before accepting work'],
            transcript: 'Pipeline Forecast answers one question: if we win what’s in front of us, can we actually deliver it?\n\nThe Forecast Pipeline tab gives you six numbers across the top — open pipeline, committed forecast, forecast hours, unallocated hours, people over capacity, and expected starts. Unallocated hours is the one to watch: that’s work you’re forecasting with nobody assigned to do it.\n\nThe Committed / Uncommitted toggle switches between deals that are effectively won and everything still in play. Then Capacity Impact shows three donuts — your current utilisation, the pipeline laid over it, and where you land if everything is accepted. If that third number is over 100%, you either need to move dates or add people.',
            resources: [{ label: 'Pipeline table export (CSV)', href: '#' }],
            production: { status: 'published' } }),
          L('l-deals-2', 'Deals', 7,
            'Work the board end to end: the six stages, deal cards and the WIN slider, the deal drawer, marking Won or Lost, and creating a deal from scratch.', {
            videoUrl: SAMPLE_1,
            takeaways: ['Move a deal through the six stages', 'Use the WIN slider and priority', 'Work the deal drawer: Overview, Contact, Files, Notes, Activity', 'Create a deal and pick the client entity type'],
            transcript: 'The Deals board is your pipeline as a Kanban. Six columns, left to right: New Enquiry, Discovery Booked, Discovery Completed, Proposal Required, Proposal Sent, and Onboarding.\n\nA card shows you priority, source, value, a WIN slider for likelihood, the client, the owner and a date pill. Drag a card to move the deal; the four KPIs above — open, likely to win, at risk, and average deal value — update as you go.\n\nClick a card to open the deal drawer. Overview holds the commercials, then Contact, Files, Notes and Activity. At the top you set the status, or mark the deal Won or Lost. And notice the Sole Link banner: when a client books through your booking link, a New Enquiry deal is created here automatically, so nothing gets typed twice.',
            resources: [{ label: 'Deal stage definitions', href: '#' }],
            production: { status: 'published' } }),
        ] },

      { id: 'c-proposals', title: 'Proposals', menuGroup: 'Proposals', track: 'win-work', icon: 'proposal', level: 'Beginner',
        summary: 'The sell-and-sign surface — your service catalogue, packages, and the proposal builder from blank page to signature.',
        lessons: [
          L('l-pr-1', 'Overview', 5,
            'Proposal performance at a glance: proposals sent, revenue in pipeline, average turnaround and response, win rate, and the stage distribution.'),
          L('l-pr-2', 'Proposals', 5,
            'The proposals list and what every status actually means — Draft, Awaiting acceptance, Viewed, Accepted, Won, Lost, Work started, Ending soon, Expired.', {
            takeaways: ['Find any proposal by status tab', 'Read the status pills correctly', 'Start a proposal from a template or from scratch'] }),
          L('l-pr-3', 'Services', 7,
            'Build the service catalogue: service lines, the four price types (Fixed, Variant bands, Minimum price, Unit price), billing type, and service terms.', {
            takeaways: ['Add a service with the right price type', 'Set up Variant pricing bands', 'Write reusable service terms'] }),
          L('l-pr-4', 'Services Package', 6,
            'Bundle services into a package: recurring versus one-off billing cycles, discounts, optional lines, deposits, and the live summary.'),
          L('l-pr-5', 'Proposal builder · Agreement', 9,
            'Stage 1: link the deal, add the client, set contract start and length, assemble services and packages, and turn on payment collection.', {
            takeaways: ['Link a proposal to a deal', 'Set contract start and length', 'Assemble services into a priced agreement'] }),
          L('l-pr-6', 'Proposal builder · Proposal', 8,
            'Stage 2: introduction, additional documents with auto-placed signature fields, terms and merge fields, next steps, partner perks, and the thank-you page.'),
          L('l-pr-7', 'Proposal builder · Send', 6,
            'Stage 3: pick a theme, decide whether it is white-labelled, choose the notification template and recipients, then review and send for signature.', {
            takeaways: ['Theme a proposal to your brand', 'Turn "Powered by Sole" off to white-label it', 'Clear the readiness pill before sending'] }),
        ] },

      { id: 'c-scheduling', title: 'Scheduling', menuGroup: 'Scheduling', track: 'win-work', icon: 'calendar', level: 'Beginner',
        summary: 'Your calendar and the public booking links that turn a prospect’s click into a deal.',
        lessons: [
          L('l-sc-1', 'Calendar', 5,
            'Day, week, month and year views, connecting an external calendar, and reading Google-synced events.'),
          L('l-sc-2', 'Booking Links', 6,
            'Create a booking link with the 3-step wizard, set meeting type and availability, and tie it to a deal stage so a booking creates a New Enquiry automatically.', {
            takeaways: ['Create a booking link end to end', 'Set per-day availability', 'Connect a link to the Deals pipeline'] }),
        ] },

      { id: 'c-clients', title: 'Clients', menuGroup: 'Clients', track: 'client-work', icon: 'user', level: 'Beginner',
        summary: 'The client register, the profile behind each client, and the map of how they all relate.',
        lessons: [
          L('l-cl-1', 'Clients Management', 6,
            'Every client in one register: status tabs, filters by type, group, billing and risk, and the onboarding-progress column.', {
            takeaways: ['Move a client Prospect → Onboarding → Active', 'Filter the register by risk and type', 'Create a client and assign a group'] }),
          L('l-cl-2', 'The client profile', 8,
            'The four profile tabs — Details, Access (ATO portal linking), Declaration, and Verification — plus onboarding percentage, next review and risk rating.', {
            takeaways: ['Request or upload client documents', 'Walk a client through ATO agent linking', 'Chase a declaration and an ID verification'] }),
          L('l-cl-3', 'Relationship Map', 5,
            'The network canvas: groups to entities to contacts, colour by status, risk, revenue or workflow, and the context-aware insights panel.'),
        ] },

      { id: 'c-deliver', title: 'Deliver', menuGroup: 'Deliver', track: 'client-work', icon: 'briefcase', level: 'Intermediate',
        summary: 'The delivery engine — scheduling people, tracking projects and tasks, capturing time, and storing the documents.',
        lessons: [
          L('l-dl-1', 'Staff Scheduler & Capacity', 7,
            'Assign work on the weekly canvas, clear the unassigned queue with AI Suggest, and read the capability matrix from L1 Basic to L5 Expert.', {
            takeaways: ['Assign a job to the right person', 'Use AI Suggest on the unassigned queue', 'Read the capability matrix'] }),
          L('l-dl-2', 'Capacity & Workload Planner', 6,
            'The portfolio timeline: scheduled hours, average utilisation, over-capacity people, and the overlapping-deliverable markers.'),
          L('l-dl-3', 'Work Management', 6,
            'Task-level work across every project: My Tasks and My Reviews, the client filter, and the task detail rail with dependencies and reviewers.'),
          L('l-dl-4', 'Project Dashboard', 7,
            'Financials, WIP, Budget WIP and Resourcing — budget versus actual versus forecast, WIP ageing, health bands, and per-project staffing.'),
          L('l-dl-5', 'Job Management', 8,
            'The Client → Project → Job → Task hierarchy: add a project with pricing and billing, then add internal tasks, client requests and jobs.', {
            takeaways: ['Create a billable project', 'Tell an internal task from a client request', 'Chase a client request without leaving the project'] }),
          L('l-dl-6', 'Time tracker', 5,
            'Timesheets and the weekly time log: capture time live with the sidebar timer or fill the grid at the end of the week.'),
          L('l-dl-7', 'Docs', 4,
            'The document library: folders, upload, assigning a document to a client or job, and the Newly shared / Signed statuses.'),
        ] },

      { id: 'c-teams', title: 'Teams', menuGroup: 'Teams', track: 'people-money', icon: 'users', level: 'Intermediate',
        summary: 'Your people — records and skills, what each role can do, the service lines everything hangs off, and true margin per fee earner.',
        lessons: [
          L('l-tm-1', 'Team Management', 7,
            'Add a staff member end to end: personal info, employment details, work schedule and utilisation goal, plus skills and certifications.', {
            takeaways: ['Add a staff member with a work schedule', 'Record skills, software proficiency and certifications', 'Push a new starter through to Payroll'] }),
          L('l-tm-2', 'Roles & Permissions', 8,
            'Build a role from the permissions matrix — around 30 modules × actions, 137 permissions in total — and set the role’s leave policy.', {
            takeaways: ['Create a role and name it well', 'Grant only the actions a role needs', 'Set accruals and per-type leave allocations'] }),
          L('l-tm-3', 'Service Lines', 4,
            'The service lines that feed Proposals, the capability matrix and Margin by Person — and why you should agree them once.'),
          L('l-tm-4', 'Margin by Person', 6,
            'True profitability per fee earner: bill rate versus cost rate, utilisation, margin against the 30% floor, and margin at risk.', {
            takeaways: ['Read margin against the 30% floor', 'Explain how true margin is calculated', 'Spot margin at risk before it bites'] }),
        ] },

      { id: 'c-payroll', title: 'Payroll', menuGroup: 'Payroll', track: 'people-money', icon: 'wallet', level: 'Intermediate', popular: true,
        summary: 'Run compliant Australian payroll on behalf of your employers — from the Microkeeper connection to a lodged payrun.',
        lessons: [
          L('l-py-1', 'Overview', 5,
            'The employers you run payroll for, the businesses table, and managing the Microkeeper connection.'),
          L('l-py-2', 'Employees', 7,
            'The synced employee list, switching between tenant accounts, and the employee detail rail — tax, super, banking, entitlements and payslip config.', {
            takeaways: ['Find an employee with an incomplete profile', 'Read the SYNCED status', 'Add an employee and send their credentials'] }),
          L('l-py-3', 'Payruns', 5,
            'The payrun list by status, the totals columns, and opening the payslips drawer for gross, PAYG, super and net.'),
          L('l-py-4', 'Running a payrun', 10,
            'The five-step wizard: Basic Info, Pay List, Expenses, Deductions, Review — then clear the readiness issues and lodge.', {
            takeaways: ['Pick the pay period and payment date', 'Adjust hours, rates and multipliers on the pay list', 'Clear every readiness issue before lodging', 'Check a payslip before the run goes out'],
            resources: [{ label: 'Payrun wizard walkthrough', href: '#' }] }),
          L('l-py-5', 'Payroll', 6,
            'Payroll history: the summary drawer, the full payrun detail page, bulk actions, and completing a run.'),
          L('l-py-6', 'Leave', 4,
            'Raise and approve leave requests so they land correctly on the payslip.'),
          L('l-py-7', 'Costs & Reports', 5,
            'What it costs your firm to run payroll, and the five exportable reports — summary, breakdown, accounting export, employee by run, summary by run.'),
        ] },

      { id: 'c-finance', title: 'Finance & invoicing', menuGroup: 'Finance / Invoicing', track: 'people-money', icon: 'receipt', level: 'Beginner',
        summary: 'Getting paid — invoices from draft to settled, and the SolePay payment rail under your own brand.',
        lessons: [
          L('l-fi-1', 'Invoices', 5,
            'The invoice list and its statuses — Draft, Due, Overdue, Paid, Partially paid — plus balance due, deposits and the row actions.'),
          L('l-fi-2', 'Create Invoice', 7,
            'Build an invoice: from and to, payment terms and due date, items priced from the service library, bank details and attachments, then preview.', {
            takeaways: ['Raise an invoice from the service library', 'Set payment terms that drive the due date', 'Preview the branded document before sending'] }),
          L('l-fi-3', 'SolePay', 6,
            'Sole’s Australian payment rail: how it compares to Stripe and PayPal, the application and review gate, and adding bank details for manual transfers.'),
        ] },

      { id: 'c-workflow', title: 'Workflow', menuGroup: 'Personalization', track: 'automate', icon: 'flow', level: 'Intermediate',
        summary: 'The automation engine — move work from one stage to the next without anyone remembering to.',
        lessons: [
          L('l-wf-1', 'Workflows library', 6,
            'Read the library: needs attention, active workflows, pending reviews and completion rate, plus category chips and control levels.'),
          L('l-wf-2', 'Building a workflow', 9,
            'The node canvas: one trigger, conditions and branches, actions, and approval gates — then activation, test and publish.', {
            takeaways: ['Pick the right trigger', 'Branch on a condition', 'Insert an approval gate', 'Publish only once the readiness pill clears'] }),
          L('l-wf-3', 'Recipes', 5,
            'Start from a proven flow instead of a blank canvas, and save your firm’s own recipes for reuse.'),
          L('l-wf-4', 'Email & message templates', 5,
            'Write reusable email and message templates with merge tokens, and why an active workflow blocks deleting one.'),
          L('l-wf-5', 'Global settings', 4,
            'Firm-wide comms rules: the send window and the sender identity every outbound message uses.'),
        ] },

      { id: 'c-onboarding', title: 'Client onboarding', menuGroup: 'Personalization', track: 'automate', icon: 'clipboardCheck', level: 'Intermediate',
        summary: 'Author the intake question set your clients complete in the portal — including the KYC/AML you are obliged to collect.',
        lessons: [
          L('l-ob-1', 'Templates', 4,
            'The template gallery: built-ins by entity type, KYC/AML tags, and duplicating one as your own.'),
          L('l-ob-2', 'Essentials', 6,
            'Name the template, choose which entity types it applies to and is default for, set the client-portal brand colour, and switch on the KYC/AML section.'),
          L('l-ob-3', 'The builder', 8,
            'Pages, sections and around 30 field types including ABN/ACN, TFN, bank account and signature — plus required, confidential and conditional field settings.', {
            takeaways: ['Build a page of fields from scratch', 'Mark a field KYC/AML or confidential', 'Show a field only for certain entity types'] }),
          L('l-ob-4', 'Preview & finalise', 5,
            'Preview as each entity type, save to your templates, then send to a client or open it as the client would see it.'),
        ] },

      { id: 'c-prompts', title: 'AI Prompt Library', menuGroup: 'Personalization', track: 'automate', icon: 'sparkle2', level: 'Beginner',
        summary: 'Your firm’s shared, reusable AI prompts — so tone and quality stay consistent no matter who is drafting.',
        lessons: [
          L('l-ai-1', 'Team library', 4,
            'Browse the shared catalogue by category, sort by most used, and favourite the prompts you reach for.'),
          L('l-ai-2', 'Filling fields & copying', 4,
            'Open a prompt, complete its {{variables}} in the fill-in drawer, and copy the finished prompt into your AI tool.'),
          L('l-ai-3', 'Writing & sharing your own', 4,
            'Write a prompt with variables, keep it under My prompts, then share the good ones with the firm.'),
        ] },

      { id: 'c-comms', title: 'Communications', menuGroup: 'Communications', track: 'client-work', icon: 'messageSquare', level: 'Beginner',
        summary: 'One inbox for every channel your clients use.',
        lessons: [
          L('l-cm-1', 'Messages', 4,
            'The native inbox: conversation list, read and unread, threads, and starting a new conversation.'),
          L('l-cm-2', 'Email / Gmail', 4,
            'Connect Gmail so client email syncs in, and what the firm does and does not get access to.'),
          L('l-cm-3', 'WhatsApp', 5,
            'The WhatsApp Business four-step setup: Meta authorisation, account, phone verification, and going live.'),
        ] },

      { id: 'c-setup', title: 'Set up your practice', menuGroup: 'Settings & admin', track: 'automate', icon: 'sliders', level: 'Beginner',
        summary: 'The admin jobs that do not live under one menu item — the things you do once, and again whenever someone joins.',
        lessons: [
          L('l-su-1', 'Your firm profile & offices', 5,
            'Firm details, offices and the office switcher, so every scoped dashboard shows the right slice of the practice.'),
          L('l-su-2', 'Inviting your team & assigning roles', 6,
            'Invite a staff member, give them a role, and check what that role can actually see and do before they log in.', {
            takeaways: ['Invite a staff member', 'Choose the right role for them', 'Preview the app as that role'] }),
          L('l-su-3', 'Service lines & capacity targets', 5,
            'Agree your service lines and set per-person utilisation targets so the capacity dashboards mean something.'),
          L('l-su-4', 'Client portal branding & white-label', 6,
            'Put your own brand on the client portal, proposals and invoices — and turn the Sole attribution off.', {
            takeaways: ['Set the portal brand colour and logo', 'White-label a proposal', 'Check the client’s view before you launch'] }),
          L('l-su-5', 'Templates & sending a newsletter', 5,
            'Build the email and message templates your firm reuses, set the sender identity, and send to a segment of clients.'),
          L('l-su-6', 'Period & year-end settings', 5,
            'Financial period settings, what changes at year end, and the housekeeping to do before you roll over.'),
          L('l-su-7', 'Integrations', 7,
            'Connect the tools around SPM — Xero and HubSpot on clients, Gmail and WhatsApp on comms, Microkeeper on payroll, Google Calendar on scheduling.'),
          L('l-su-8', 'A new staff member’s first week', 4,
            'The checklist to run when someone joins: account, role, service lines, schedule, payroll record, and which learning path to send them down.'),
        ] },
    ],
    paths: [
      { id: 'path-new-starter', title: 'New team member', forRole: 'Everyone · first week',
        blurb: 'The essentials before you touch live client work.',
        courseIds: ['c-get-started', 'c-my-focus', 'c-clients', 'c-comms'] },
      { id: 'path-front-office', title: 'Front office', forRole: 'Practice managers & client-facing staff',
        blurb: 'Turn an enquiry into a signed engagement without dropping anything.',
        courseIds: ['c-get-started', 'c-deals', 'c-proposals', 'c-scheduling', 'c-clients'] },
      { id: 'path-delivery', title: 'Delivery & review', forRole: 'Accountants, reviewers & job managers',
        blurb: 'Run the work: projects, tasks, reviews and the automation that moves them along.',
        courseIds: ['c-get-started', 'c-deliver', 'c-onboarding', 'c-workflow'] },
      { id: 'path-payroll', title: 'Payroll & bookkeeping', forRole: 'Payroll & bookkeeping staff',
        blurb: 'Everything you need to run compliant Australian payroll and get invoices out.',
        courseIds: ['c-get-started', 'c-payroll', 'c-finance', 'c-teams'] },
      { id: 'path-owner', title: 'Practice owner / partner', forRole: 'Partners & practice leads',
        blurb: 'The firm-wide view, plus the settings only you should be touching.',
        courseIds: ['c-get-started', 'c-firm-overview', 'c-teams', 'c-setup', 'c-prompts'] },
    ],
  };

  /* ==== SOLE — small-business app (B2C) =================================== */
  var sole = {
    product: 'sole',
    meta: {
      title: 'Sole Academy',
      blurb: 'Short videos that show you how to run the money side of your business in Sole — invoices, expenses, quotes and tax.',
    },
    tracks: [
      { id: 'get-started', label: 'Get started',          color: P, blurb: 'Set Sole up and find your way around' },
      { id: 'get-paid',    label: 'Get paid',             color: G, blurb: 'Quotes, invoices and chasing what you\'re owed' },
      { id: 'books',       label: 'Keep your books tidy', color: B, blurb: 'Bank feed, receipts and expenses — a few minutes a day' },
      { id: 'tax',         label: 'Tax & GST',            color: A, blurb: 'BAS, GST set aside and super, in plain English' },
      { id: 'numbers',     label: 'Know your numbers',    color: P, blurb: 'Assets, what you owe, and the reports worth reading' },
      { id: 'work',        label: 'Track your work',      color: B, blurb: 'Time, jobs and kilometres you can actually bill for' },
      { id: 'grow',        label: 'Get more from Sole',   color: G, blurb: 'Plans, add-ons, perks and the free stuff' },
    ],
    courses: [
      { id: 'c-start', title: 'Getting started with Sole', menuGroup: '', track: 'get-started', icon: 'rocket', level: 'Beginner',
        summary: 'A guided tour of Sole — what each part does, how to set your business up, and where to start.',
        lessons: [
          L('l-start-1', 'Welcome to Sole', 4,
            'A four-minute tour of the whole app — Unibox, your Dashboard and the menu down the left — so you know where everything lives before you touch anything.', {
            videoUrl: SAMPLE_1,
            takeaways: ['What Unibox, the Dashboard and the left-hand menu are each for', 'How your plan plus add-ons decides what you see', 'Where to go first depending on what you need today'],
            transcript: 'Welcome to Sole. Sole is one app for the money side of your business — invoices going out, expenses coming in, and the tax you\'ll owe on whatever\'s left. This takes about four minutes, and by the end you\'ll know where everything lives.\n\nStart with Unibox. It\'s your daily list: invoices to send, invoices to chase, bank lines to match, receipts to attach. If you only open one screen a day, open that one. The Dashboard behind it is the wider picture — revenue, profit, what\'s forecast — and the menu on the left is where you go when you want to dig into one thing: Sales, Expenses, Assets, Reporting.\n\nSole is modular, so you only see what you\'re paying for. Your plan gives you invoicing, expenses and assets; add-ons switch on things like bank feeds, time tracking or a kilometre logbook. Don\'t try to learn all of it today. Five minutes a day is genuinely enough, and there\'s a short lesson here for every part of it.',
            resources: [{ label: 'Sole quick-start checklist', href: '#' }, { label: 'Small Business Launch Toolkit', href: '#' }],
            production: { status: 'published' } }),
          L('l-start-2', 'Set up your business: ABN, GST and your logo', 5,
            'Add your business name, ABN and contact details, tell Sole whether you\'re registered for GST, and drop your logo on so invoices go out looking like you.', {
            production: { status: 'recording' } }),
          L('l-start-3', 'Connect your bank feed', 5,
            'Link your business account so transactions arrive on their own, then watch Sole start suggesting what each one belongs to. Part of the Accounting add-on.', {
            production: { status: 'recording' } }),
          L('l-start-4', 'Bringing your history across from another tool', 6,
            'Use Migrations to bring invoices, contacts and balances over from Xero, MYOB or a spreadsheet — and what\'s worth bringing versus starting clean.', {
            production: { status: 'recording' } }),
        ] },

      { id: 'c-unibox', title: 'Your daily five minutes in Unibox', menuGroup: '', track: 'get-started', icon: 'inbox', level: 'Beginner',
        summary: 'Unibox is the one screen that tells you what needs you today. Learn to clear it in the time it takes to drink a coffee.',
        lessons: [
          L('l-ub-1', 'Why Unibox is the only screen you need', 5,
            'How Unibox reads your books and turns them into a short, ranked list of things that actually need you — and why everything else stays out of the way until you ask for it.', {
            videoUrl: SAMPLE_2,
            takeaways: ['Why your five most urgent things are all you need to look at', 'How clearing one item lifts your business health score', 'What the streak counts — and what it never does'],
            transcript: 'Most accounting software hands you a dashboard and leaves you to work out what to do with it. Unibox does the opposite. It reads your books and gives you a list of things that actually need you today — and nothing else.\n\nAt the top you\'ll see "If you\'ve got 5 minutes". That\'s your five most urgent items, ranked: overdue invoices first, then invoices waiting to go out, then bank lines to match and receipts to attach. Clear one and the next moves up, so a backlog of seventeen still gets worked through five at a time. Everything else sits behind "Show everything else" until you want it.\n\nAbove the list is your business health score. It starts at 100, drops when things pile up, and lifts back as you clear them — plus a streak for the days you check in. Neither one is homework. They\'re there so you can tell in a single glance whether you\'re on top of it. When the list is empty you\'ll get "You\'re all clear", and you can shut the laptop.',
            production: { status: 'published' } }),
          L('l-ub-2', 'Clearing your top five', 4,
            'Work the "If you\'ve got 5 minutes" card: send, chase, match, categorise — all without leaving the row you\'re on.', {
            production: { status: 'published' } }),
          L('l-ub-3', 'Business health, streaks and what they\'re for', 4,
            'What lowers your health score, what lifts it, what the streak actually counts, and why neither is something to feel bad about on a quiet week.', {
            production: { status: 'published' } }),
        ] },

      { id: 'c-invoice', title: 'Invoices that get paid', menuGroup: '', track: 'get-paid', icon: 'dollar', level: 'Beginner', popular: true,
        summary: 'From quote to paid: build an invoice, set terms that protect your cash flow, and take payment on the spot.',
        lessons: [
          L('l-inv-1', 'Your first invoice, start to finish', 6,
            'Pick a contact, add your lines, check the GST, hit send. Then see where it lands in Unibox while it waits to be paid.', {
            resources: [{ label: 'Deposit Invoice Template', href: '#' }, { label: 'Multi-Currency Invoice Template', href: '#' }],
            production: { status: 'recording' } }),
          L('l-inv-2', 'Deposits, terms and getting paid on the spot', 5,
            'Ask for a deposit before you start, set payment terms you can actually enforce, and let customers pay by card, Apple Pay or Google Pay straight off the invoice.', {
            production: { status: 'recording' } }),
          L('l-inv-3', 'From accepted quote to invoice in one tap', 4,
            'Send a quote, track whether it\'s been accepted, then convert it into an invoice without retyping a thing. Needs the Business plan or above.', {
            production: { status: 'recording' } }),
        ] },

      { id: 'c-chase', title: 'Chasing what you\'re owed', menuGroup: '', track: 'get-paid', icon: 'send', level: 'Beginner',
        summary: 'Late payers are the number-one cash-flow killer. How to nudge, follow up and escalate without the awkwardness.',
        lessons: [
          L('l-chase-1', 'Reminders before an invoice is even late', 4,
            'Unibox flags invoices due in the next couple of days so you can send a friendly nudge while it\'s still early — the cheapest way there is to get paid on time.', {
            production: { status: 'idea' } }),
          L('l-chase-2', 'Following up an overdue invoice', 6,
            'Use the follow-up panel to send a firm-but-friendly email in two clicks, and learn what to say at 7 days, 14 days and 30 days overdue.', {
            resources: [{ label: 'Invoice Rescue — overdue payment reminder templates', href: '#' }, { label: 'The Getting-Paid Checklist for your industry', href: '#' }],
            production: { status: 'idea' } }),
          L('l-chase-3', 'When to stop chasing', 4,
            'What to do when the emails aren\'t working — payment plans, letters of demand, and how to decide when it\'s cheaper to write it off and move on.', {
            production: { status: 'idea' } }),
        ] },

      { id: 'c-bankfeed', title: 'Matching your bank feed', menuGroup: '', track: 'books', icon: 'bank', level: 'Beginner', popular: true,
        summary: 'Your bank feed is the difference between guessing and knowing. Clear it in a couple of minutes a day.',
        lessons: [
          L('l-bf-1', 'How matching works — and why Sole suggests', 5,
            'What a bank feed actually is, why every line needs a home, and how Sole reads amounts, dates and memos to suggest a match with a confidence score.', {
            production: { status: 'idea' } }),
          L('l-bf-2', 'Money in: matching deposits to invoices', 5,
            'A deposit lands, Sole suggests the invoice it pays, you confirm. Plus what to do when one payment covers two invoices, or turns up short.', {
            production: { status: 'idea' } }),
          L('l-bf-3', 'Money out: payments, expenses and the odd ones', 5,
            'Match payments to expenses and bills, categorise the ones with no confident match, and use Ignore for the personal spend that slipped through.', {
            resources: [{ label: 'Bank Reconciliation Worksheet — monthly template', href: '#' }],
            production: { status: 'idea' } }),
        ] },

      { id: 'c-expenses', title: 'Expenses & receipts, without the shoebox', menuGroup: '', track: 'books', icon: 'receipt', level: 'Beginner',
        summary: 'Log it once, photograph the receipt, and never dig through the glovebox at tax time again.',
        lessons: [
          L('l-exp-1', 'Logging an expense and snapping the receipt', 5,
            'Log an expense in about ten seconds and attach a photo of the receipt from your phone, so the proof lives with the number forever.', {
            production: { status: 'idea' } }),
          L('l-exp-2', 'Categories: what goes where, and what you can claim', 6,
            'Software, fuel, phone, meals, travel — what belongs in each, what\'s only part-claimable, and why getting it right now saves your accountant\'s time later.', {
            production: { status: 'idea' } }),
          L('l-exp-3', 'The ten-minute weekly tidy-up', 4,
            'A repeatable Friday routine: clear the uncategorised, attach the missing receipts, and watch "Expenses are all sorted" turn up in Unibox.', {
            production: { status: 'idea' } }),
        ] },

      { id: 'c-gst', title: 'GST & BAS without the panic', menuGroup: '', track: 'tax', icon: 'percent', level: 'Intermediate', popular: true,
        summary: 'The compliance bit, in plain English: whether you need GST, how to set the money aside, and what to do each quarter.',
        lessons: [
          L('l-gst-1', 'Do you actually need to register for GST?', 5,
            'The $75,000 turnover threshold, what counts towards it, when registering early works in your favour, and what changes on your invoices the day you do.', {
            production: { status: 'idea' } }),
          L('l-gst-2', 'Setting money aside so BAS never stings', 5,
            'Why the GST you collect was never yours, how the "GST set aside" figure in Liabilities & Equity is worked out, and how to park it before you spend it.', {
            resources: [{ label: 'Cash Flow Forecast Template — 12-month planner', href: '#' }],
            production: { status: 'idea' } }),
          L('l-gst-3', 'Your BAS quarter, step by step', 7,
            'Walk a full quarter: check GST collected against GST paid, resolve anything still unmatched, then lodge before the 28th. Plus what to do if the numbers look wrong.', {
            takeaways: ['Where Sole pulls each BAS figure from', 'How to check GST collected against GST paid before you lodge', 'What to do if what you set aside doesn\'t cover it'],
            production: { status: 'idea' } }),
        ] },

      { id: 'c-tax', title: 'Tax time & super', menuGroup: '', track: 'tax', icon: 'percent', level: 'Intermediate',
        summary: 'Know roughly what you\'ll owe months before it\'s due, and sort your own super while you\'re at it.',
        lessons: [
          L('l-tax-1', 'The Tax Estimator and the dates that apply to you', 5,
            'Get a running estimate of your income tax from numbers already in Sole, and work out which key dates are actually yours — BAS, super, TPAR, or just the October return.', {
            production: { status: 'idea' } }),
          L('l-tax-2', 'Super when you\'re the boss', 5,
            'Nobody pays super for a sole trader, so here\'s how to do it yourself: how much, when, the concessional cap, and how to claim the deduction.', {
            resources: [{ label: 'Super Contribution Tracker', href: '#' }],
            production: { status: 'idea' } }),
        ] },

      { id: 'c-assets', title: 'Assets, loans and what you own', menuGroup: '', track: 'numbers', icon: 'layers', level: 'Intermediate',
        summary: 'The $1,899 laptop, the ute loan, the money you draw out — how each one is handled, and why it matters at tax time.',
        lessons: [
          L('l-asset-1', 'Expense or asset? The write-off question', 5,
            'When a purchase is a straight expense and when it becomes an asset you depreciate — plus how the instant asset write-off threshold changes the answer.', {
            production: { status: 'idea' } }),
          L('l-asset-2', 'Recording an asset and letting depreciation run', 5,
            'Record a purchase as an asset, link it to the bank payment that bought it, set the method and useful life, then leave depreciation to calculate itself.', {
            resources: [{ label: 'Business Asset Register Template', href: '#' }],
            production: { status: 'idea' } }),
          L('l-asset-3', 'Loans, drawings and money set aside', 5,
            'Read Liabilities & Equity: what a loan repayment really is, why owner\'s drawings aren\'t an expense, and what those set-aside rows are protecting you from.', {
            production: { status: 'idea' } }),
        ] },

      { id: 'c-numbers', title: 'Know your numbers', menuGroup: '', track: 'numbers', icon: 'chartBar', level: 'Intermediate',
        summary: 'A handful of reports and one number that tell you whether this is actually working.',
        lessons: [
          L('l-num-1', 'Reading your Dashboard', 5,
            'Running balance, net profit, margin, forecast — what each tile is really measuring, and which one to look at first when you\'ve got thirty seconds.', {
            production: { status: 'idea' } }),
          L('l-num-2', 'Profit, cash flow and your revenue goal', 6,
            'Why profitable businesses still run out of money, how to read a cash-flow view, and how to set a revenue goal and actually track it through the year.', {
            production: { status: 'idea' } }),
        ] },

      { id: 'c-jobs', title: 'Track the work: time, jobs and kilometres', menuGroup: '', track: 'work', icon: 'briefcase', level: 'Intermediate',
        summary: 'Bill every hour, know which jobs actually make money, and keep a logbook the ATO would accept.',
        lessons: [
          L('l-job-1', 'From timer to invoice', 5,
            'Start a timer against a job, log the time you forgot to track, then turn unbilled hours straight into an invoice. Needs the Time Tracker add-on.', {
            resources: [{ label: 'Weekly Timesheet Template', href: '#' }],
            production: { status: 'idea' } }),
          L('l-job-2', 'Job margins: are you making money on this one?', 6,
            'Compare what you quoted against what a job has actually cost in time and materials, catch the ones running over, and price the next one better. Needs the Projects add-on.', {
            production: { status: 'idea' } }),
          L('l-job-3', 'Your kilometre logbook, done properly', 5,
            'Run a valid 12-week ATO logbook: classify each trip as business or personal, keep the odometer readings honest, and know when the period ends. Needs the KM Tracker add-on.', {
            resources: [{ label: 'Sole Trader Kilometre Log — monthly template', href: '#' }],
            production: { status: 'idea' } }),
        ] },

      { id: 'c-yours', title: 'Make Sole yours', menuGroup: '', track: 'grow', icon: 'sparkle', level: 'Beginner',
        summary: 'One plan, the add-ons you actually need, plus the free stuff most people never find.',
        lessons: [
          L('l-yours-1', 'Plans and add-ons: paying for what you use', 4,
            'How a plan plus switchable add-ons decides what you see, which bundles work out cheaper, and how to switch something on for one busy quarter and off again after.', {
            production: { status: 'idea' } }),
          L('l-yours-2', 'Referrals, perks and the Sole community', 4,
            'Earn $50 for every business you refer, browse the discounts in Sole Perks, and find the community and template library most people never open.', {
            production: { status: 'idea' } }),
        ] },
    ],
    paths: [
      { id: 'path-new', title: 'Brand new to Sole', forRole: 'If you signed up this week',
        blurb: 'The five-minutes-a-day habit: get set up, send your first invoice, match your first bank line, and pick the add-ons you actually need.',
        courseIds: ['c-start', 'c-unibox', 'c-invoice', 'c-bankfeed', 'c-yours'] },
      { id: 'path-paid', title: 'Get paid faster', forRole: 'If cash flow is the problem',
        blurb: 'Everything between doing the work and the money landing — quote, invoice, chase, reconcile, and make sure you billed for every hour.',
        courseIds: ['c-invoice', 'c-chase', 'c-bankfeed', 'c-jobs'] },
      { id: 'path-tax', title: 'Tax-time ready', forRole: 'If BAS or tax time is coming',
        blurb: 'GST set aside, receipts attached, assets recorded, numbers checked — so BAS and your return are a review, not a rebuild.',
        courseIds: ['c-expenses', 'c-gst', 'c-assets', 'c-tax', 'c-numbers'] },
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
