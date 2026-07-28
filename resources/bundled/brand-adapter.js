/* =============================================================================
   Sole bundled-toolkit brand adapter  —  brand-adapter.js
   -----------------------------------------------------------------------------
   Shared by every self-contained "bundled toolkit" under pages/resources/bundled/.
   Vanilla, dependency-free, offline-safe.

   WHY THIS EXISTS
   Each bundled toolkit is a bespoke standalone HTML tool with its OWN colour
   variable names (--paid / --pine / --brand / --accent), its own logo markup,
   and (sometimes) its own config object. This adapter gives every one of them a
   single, uniform brand contract the Rebranding Studio can drive reliably:

     · the palette + contrast math is lifted VERBATIM from resources/brand.js so
       results match the rest of the Sole engine;
     · a page declares window.SOLE_BUNDLE_APPLY(cfg, H) — the AUTHORED per-file
       mapping of "which config field → which var / logo node / contact slot";
     · this adapter resolves the active brand (live preview → baked export →
       ?brand= → Sole default) and calls that mapping on load and on every
       postMessage from the Studio.

   The BrandConfig shape matches SoleBrand.SOLE_BRAND: primaryColor, accentColor,
   orgName, productName, logo, ctaLabel, ctaUrl, contactName, contactEmail,
   contactPhone, website, partnerLinks, font.

   CONTRAST IS NON-NEGOTIABLE. The helper H exposes THREE brand tones so a pale
   partner colour never ships unreadable text:
     · H.fill(primary)     → the brand colour itself (fills, borders, logo mark)
     · H.onFill(primary)   → text that sits ON the brand fill (#1F2937 or #fff)
     · H.ink(primary)      → the brand colour as TEXT on a light bg, darkened
                             until it passes WCAG AA (≥4.5:1) on white
   Per-file mappings MUST route fills to fill(), on-fill text to onFill(), and
   accent/link text to ink(). Semantic colours (dispute amber, health bands,
   success green, secondary accents) are left untouched.
   ========================================================================== */
(function (g) {
  'use strict';

  /* ---- hex utilities (verbatim from resources/brand.js) ------------------ */
  function hexMix(hex, towards, ratio) {
    if (!hex || typeof hex !== 'string') return hex;
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return hex;
    var r = parseInt(h.slice(0, 2), 16), gg = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    var t = towards.replace('#', '');
    var tr = parseInt(t.slice(0, 2), 16), tg = parseInt(t.slice(2, 4), 16), tb = parseInt(t.slice(4, 6), 16);
    var mix = function (a, c) { return Math.round(a + (c - a) * ratio); };
    var toHex = function (n) { return n.toString(16).padStart(2, '0'); };
    return '#' + toHex(mix(r, tr)) + toHex(mix(gg, tg)) + toHex(mix(b, tb));
  }
  function lightenHex(hex, r) { return hexMix(hex, '#FFFFFF', r == null ? 0.85 : r); }
  function darkenHex(hex, r) { return hexMix(hex, '#0F1117', r == null ? 0.18 : r); }
  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return [0, 0, 0];
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function contrastText(hex) {
    if (!hex || typeof hex !== 'string') return '#FFFFFF';
    var c = hexToRgb(hex);
    if (c.some(isNaN)) return '#FFFFFF';
    var lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    return lum > 0.62 ? '#1F2937' : '#FFFFFF';
  }
  function isValidHex(hex) { return typeof hex === 'string' && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim()); }
  function normHex(hex, fallback) {
    if (!isValidHex(hex)) return fallback;
    var h = hex.trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return '#' + h.toUpperCase();
  }

  /* ---- WCAG relative luminance + contrast ratio (for the accessible ink) -- */
  function _lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function relLum(hex) { var c = hexToRgb(hex); return 0.2126 * _lin(c[0]) + 0.7152 * _lin(c[1]) + 0.0722 * _lin(c[2]); }
  function contrastRatio(fg, bg) {
    var a = relLum(fg), b = relLum(bg);
    var hi = Math.max(a, b), lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  }
  // Brand colour as readable TEXT on a light background: darken toward ink until AA.
  function accessibleInk(hex, bg) {
    bg = bg || '#FFFFFF';
    var c = normHex(hex, '#5B5BF6');
    for (var i = 0; i < 24; i++) {
      if (contrastRatio(c, bg) >= 4.5) return c;
      c = darkenHex(c, 0.12);
    }
    return '#1F2937';
  }

  function setVar(name, value, root) {
    var docEl = (root || document).documentElement;
    if (docEl) docEl.style.setProperty(name, value);
  }

  /* ---- product-mention softening (case-sensitive whole word, guarded) -----
     Replaces the PRODUCT name "Sole"/"SPM" with the partner's productName in
     visible text. Case-sensitive + \b word boundaries: the common collision
     word "sole trader" is lowercase, so it is never touched. Skips scripts /
     styles / form fields and anything marked [data-brand-keep] (the wordmark).
     Caches each text node's original so repeated applies are non-cumulative. */
  var _softenCache = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
  function soften(root, productName) {
    root = root || document.body;
    if (!root || !productName) return;
    var pn = String(productName).trim();
    if (!pn || pn === 'Sole' || pn === 'SPM') { _restoreSoften(root); return; }
    var safe = pn.replace(/[<>&]/g, '');
    var re = /\b(Sole|SPM)\b/g;
    _walkText(root, function (node) {
      var orig = _softenCache ? (_softenCache.has(node) ? _softenCache.get(node) : (function () { var v = node.nodeValue; _softenCache.set(node, v); return v; })()) : node.nodeValue;
      var next = orig.replace(re, safe);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }
  function _restoreSoften(root) {
    if (!_softenCache) return;
    _walkText(root, function (node) { if (_softenCache.has(node)) node.nodeValue = _softenCache.get(node); });
  }
  var _SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1 };
  function _walkText(root, fn) {
    if (!document.createTreeWalker) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p !== root) {
          if (p.nodeType === 1) {
            if (_SKIP_TAGS[p.tagName]) return NodeFilter.FILTER_REJECT;
            if (p.getAttribute && p.getAttribute('data-brand-keep') != null) return NodeFilter.FILTER_REJECT;
          }
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node, batch = [];
    while ((node = w.nextNode())) batch.push(node);
    batch.forEach(fn);
  }

  /* ---- helper bundle passed to every per-file mapping -------------------- */
  var H = {
    hexMix: hexMix, lightenHex: lightenHex, darkenHex: darkenHex,
    hexToRgb: hexToRgb, rgba: rgba, normHex: normHex,
    contrastText: contrastText, contrastRatio: contrastRatio,
    // the three brand tones a mapping should use:
    fill: function (p) { return normHex(p, '#5B5BF6'); },
    onFill: function (p) { return contrastText(normHex(p, '#5B5BF6')); },
    ink: function (p) { return accessibleInk(normHex(p, '#5B5BF6')); },
    setVar: setVar,
    soften: soften,
    // Only render a logo the iframe/export can actually resolve: a data-URI or an
    // absolute URL. A repo-relative path (the Sole default) won't resolve inside a
    // nested iframe or a moved export, so fall back to the wordmark instead.
    logoSrc: function (logo) { return (logo && (/^data:/.test(logo) || /^https?:\/\//.test(logo))) ? logo : null; }
  };

  /* ---- canonical Sole default (matches SoleBrand.SOLE_BRAND core) --------- */
  var DEFAULTS = {
    primaryColor: '#5B5BF6', accentColor: '#F5C518',
    orgName: 'Sole', productName: 'Sole', logo: null,
    ctaLabel: '', ctaUrl: '',
    contactName: '', contactEmail: '', contactPhone: '', website: '',
    partnerLinks: [], font: 'Inter'
  };

  function merged(cfg) {
    var c = {};
    for (var k in DEFAULTS) c[k] = DEFAULTS[k];
    for (var k2 in (cfg || {})) if (cfg[k2] != null) c[k2] = cfg[k2];
    // explicit `logo: null` means "clear the logo → show the wordmark" (not inherit)
    if (cfg && Object.prototype.hasOwnProperty.call(cfg, 'logo')) c.logo = cfg.logo;
    return c;
  }

  /* ---- resolve which brand to render with (mirrors SoleBrand.resolveBrand) */
  function resolveBrand() {
    if (g.__BRAND_LIVE__) return g.__BRAND_LIVE__;   // (a) studio live preview (postMessage)
    if (g.__BRAND__) return g.__BRAND__;             // (b) exported self-contained file
    try {                                            // (c) hosted ?brand=#hex
      var qp = new URLSearchParams(location.search).get('brand');
      if (qp && qp.charAt(0) === '#') { var c = {}; for (var k in DEFAULTS) c[k] = DEFAULTS[k]; c.primaryColor = qp; return c; }
    } catch (_) {}
    return DEFAULTS;                                 // (d) default: Sole
  }

  function apply(cfg) {
    var c = merged(cfg);
    try { if (typeof g.SOLE_BUNDLE_APPLY === 'function') g.SOLE_BUNDLE_APPLY(c, H); } catch (e) { /* never let a brand push break the page */ }
    // page <title> → partner voice, keeping the resource name suffix if present
    try {
      var parts = (document.title || '').split('·');
      var base = parts.length > 1 ? parts[parts.length - 1].trim() : (parts[0] || '').trim();
      if (base) document.title = (c.orgName || 'Sole') + ' · ' + base;
    } catch (_) {}
    g.__BRAND_APPLIED__ = c;
    return c;
  }

  window.addEventListener('message', function (e) {
    if (e && e.data && e.data.type === 'sole:brand') { g.__BRAND_LIVE__ = e.data.config; apply(e.data.config); }
  });

  // Clean print / Save-as-PDF: kill the browser's date/URL header+footer (@page margin 0),
  // keep brand colours (print-color-adjust), and stop content splitting across pages.
  // Applies to the live "Save as PDF" (printing the preview iframe) AND to exported files.
  function injectPrintCss() {
    if (document.getElementById('sole-print-css')) return;
    var css =
      '@page{margin:0;}' +
      '@media print{' +
        'html,body{background:#fff !important;}' +
        'body{padding:14mm 12mm !important;}' +
        '*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}' +
        '.card,.panel,.step,.rail-step,.rec-card,.opt,.prompt,.verdict,.spm-block,.callout,' +
        '.complete,.sole,.about-firm,.welcome,.intake,.breakdown,.recap,.client-meta,.tpl,' +
        '.reco,.partner-cta,.help-card,.msg,.ladder .rung,.rec-list li,section,article,table,tr,img,svg' +
        '{break-inside:avoid !important;page-break-inside:avoid !important;}' +
        'h1,h2,h3,.step-title,.rs-name,.step-eyebrow,.step-kicker,.q-head,.plan-head{break-after:avoid !important;page-break-after:avoid !important;}' +
        // the resource's own "Save as PDF"/print buttons should never appear in the printed page
        '#pdfBtn,#printBtn{display:none !important;}' +
      '}';
    var s = document.createElement('style');
    s.id = 'sole-print-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  function boot() {
    injectPrintCss();
    apply(resolveBrand());
    // When shown INSIDE the Studio (iframe), hide the resource's own "Save as PDF" button —
    // the Studio provides its own, so the marketer sees one control, not two. The standalone
    // exported file keeps its button (recipients can print it).
    try {
      if (window.parent && window.parent !== window && !document.getElementById('sole-embed-css')) {
        var e = document.createElement('style'); e.id = 'sole-embed-css';
        e.textContent = '#pdfBtn,#printBtn{display:none !important;}';
        (document.head || document.documentElement).appendChild(e);
        window.parent.postMessage({ type: 'sole:resource-ready' }, '*');
      }
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  g.SoleBundle = { apply: apply, resolveBrand: resolveBrand, H: H, DEFAULTS: DEFAULTS };
})(window);
