/* =============================================================================
   Bundled toolkits registry  —  bundled.js
   -----------------------------------------------------------------------------
   The bespoke, self-contained "bundled toolkit" tools under resources/bundled/.
   Each carries its own brand-adapter.js layer (window.SOLE_BUNDLE_APPLY + the
   shared adapter). The Rebranding Studio lists them, drives them live via
   postMessage({type:'sole:brand'}), and exports them by baking window.__BRAND__.

   `file` is relative to the hosting root (where toolkit.html lives).

   `fields` = per-toolkit dynamic content the shared BrandConfig doesn't cover.
   Each shows in the Studio ONLY when that toolkit is selected, and its value is
   stored in brand.fields[<key>]. Blank = the toolkit's own built-in default (the
   placeholder shows what that default says). A `{ group }` entry renders a small
   sub-heading. Each file's SOLE_BUNDLE_APPLY reads cfg.fields[<key>] and applies it.
   ========================================================================== */
(function (g) {
  g.BUNDLED_TOOLKITS = [
    {
      id: 'invoice-rescue',
      title: 'Invoice rescue',
      eyebrow: 'Getting paid',
      audience: 'business',
      file: 'resources/bundled/invoice-rescue.html',
      fileStandard: 'resources/bundled/invoice-rescue-standard.html',
      description: 'Guided invoice-recovery diagnostic — three questions pick the single best next step, with copy-ready messages and an escalation ladder.',
      fields: [
        { key: 'promoBody', label: 'Closing pitch', type: 'textarea', placeholder: "Late payments usually aren't about customers refusing to pay… {product} prevents that.", hint: 'The paragraph in the bottom “Fewer late payments next time” card.' },
        { key: 'disclaimer', label: 'Fine print', type: 'textarea', placeholder: 'General information only, not legal advice…' },
      ],
    },
    {
      id: 'business-launch-toolkit',
      title: 'Small business launch toolkit',
      eyebrow: 'Getting started',
      audience: 'business',
      file: 'resources/bundled/business-launch-toolkit.html',
      fileStandard: 'resources/bundled/business-launch-toolkit-standard.html',
      description: 'A five-question diagnostic that builds a new business owner an ordered, plain-English setup plan (ABN, GST, invoicing, tax). Includes an NDIS pathway.',
      fields: [
        { key: 'promoBody', label: 'Software pitch', type: 'textarea', placeholder: '{product} is Australian accounting software for small businesses…', hint: 'The blurb in the bottom “Where to do the doing” card.' },
        { key: 'fineprint', label: 'Promo fine print', type: 'text', placeholder: 'Free plan available. Free trial on paid plans, no credit card.', hint: 'The small line under the CTA button. Clear it to hide the line — do this if the offer isn’t yours.' },
        { key: 'disclaimer', label: 'Fine print', type: 'textarea', placeholder: 'General information to help you get started, not tax, legal or financial advice…' },
      ],
    },
    {
      id: 'client-cleanup-checklist',
      title: 'Client cleanup assessment',
      eyebrow: 'For accountants',
      audience: 'accountant',
      file: 'resources/bundled/client-cleanup-checklist.html',
      fileStandard: 'resources/bundled/client-cleanup-checklist-standard.html',
      description: 'Score a client across five friction domains (documents, comms, records, workflow, billing) and get a health verdict plus recommended actions.',
      fields: [
        { group: 'How your product helps (shown in the results)' },
        { key: 'benefitDocuments', label: 'Documents', type: 'textarea', placeholder: 'Automated document requests and reminders…' },
        { key: 'benefitCommunication', label: 'Communication', type: 'textarea', placeholder: 'Centralised client communication and task tracking…' },
        { key: 'benefitRecords', label: 'Record quality', type: 'textarea', placeholder: 'Structured collection checklists that surface gaps…' },
        { key: 'benefitWorkflow', label: 'Workflow', type: 'textarea', placeholder: 'Reusable onboarding and workflow templates…' },
        { key: 'benefitBilling', label: 'Billing', type: 'textarea', placeholder: 'Automated invoicing and payment reminders…' },
        { group: 'Fine print' },
        { key: 'disclaimer', label: 'Disclaimer', type: 'textarea', placeholder: 'For internal use. This assessment is a guide…' },
      ],
    },
    {
      id: 'spm-white-label-firm-toolkit',
      title: 'Small business toolkit — firm white-label',
      eyebrow: 'For accountants',
      audience: 'accountant',
      file: 'resources/bundled/spm-white-label-firm-toolkit.html',
      fileStandard: 'resources/bundled/spm-white-label-firm-toolkit-standard.html',
      description: 'A guided, firm-branded small-business health check an accountant hands to their clients — welcome, staged checklist, AI prompts and a booking CTA.',
      fields: [
        { group: 'About & welcome' },
        { key: 'firmBlurb', label: 'About your firm', type: 'textarea', placeholder: 'We help small businesses across Australia stay on top of their books…' },
        { key: 'welcomeBody', label: 'Welcome message', type: 'textarea', placeholder: "Thanks for working with us. We've put this toolkit together because…" },
        { group: 'Closing call-to-action' },
        { key: 'ctaHeading', label: 'Heading', type: 'text', placeholder: "We're here when you need us" },
        { key: 'ctaBody', label: 'Text', type: 'textarea', placeholder: 'Prefer to talk it through? Book a short consultation with us…' },
        { group: 'Recommended software (step 4)' },
        { key: 'softwareName', label: 'Name', type: 'text', placeholder: 'Sole' },
        { key: 'softwareBlurb', label: 'Description', type: 'textarea', placeholder: 'keeps invoicing, expenses and GST in one place…' },
        { key: 'softwareCta', label: 'Button label', type: 'text', placeholder: 'Get started with Sole' },
        { key: 'softwareUrl', label: 'Button link', type: 'url', placeholder: 'https://…' },
        { key: 'soleReferralCode', label: 'Referral / sign-up code', type: 'text', placeholder: 'e.g. FIRM10 (optional)' },
        { group: 'Downloadable templates (add a link to turn “coming soon” into a download)' },
        { key: 'invoiceUrl', label: 'Invoice template', type: 'url', placeholder: 'https://…' },
        { key: 'quoteUrl', label: 'Quote template', type: 'url', placeholder: 'https://…' },
        { key: 'pricingUrl', label: 'Pricing template', type: 'url', placeholder: 'https://…' },
        { key: 'cashflowUrl', label: 'Cash-flow planner', type: 'url', placeholder: 'https://…' },
        { group: 'Finish page' },
        { key: 'finishHeading', label: 'Heading', type: 'text', placeholder: 'Your business is set up' },
        { key: 'finishBody', label: 'Text', type: 'textarea', placeholder: "You've worked through what it takes to establish and run your business…" },
        { key: 'nextStepBody', label: 'Next step', type: 'textarea', placeholder: 'Book a 15-minute review with us…' },
        { group: 'Fine print' },
        { key: 'disclaimer', label: 'Disclaimer', type: 'textarea', placeholder: 'General guidance only. This toolkit does not constitute legal, tax or financial advice…' },
      ],
    },
  ];
})(typeof window !== 'undefined' ? window : this);
