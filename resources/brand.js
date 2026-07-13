/* =============================================================================
   Sole white-label branding engine  —  brand.js
   -----------------------------------------------------------------------------
   Vanilla, dependency-free, offline-safe. Attaches window.SoleBrand.
   ONE BrandConfig object drives every resource: it is stored as a localStorage
   "kit", injected into exported files as window.__BRAND__, and pushed live to
   the studio preview via postMessage.

   Colour math (hexMix / lighten / darken / contrastText) is lifted verbatim from
   index.html so the palette derivation matches the rest of the Sole app. A
   single primaryColor derives every shade, and button text auto-flips for
   contrast — so a partner who pastes a pale colour never ships white-on-yellow.
   ========================================================================== */
(function (global) {
  'use strict';

  var BRAND_SCHEMA_VERSION = 2;
  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  /* ---- hex utilities (index.html:566-588, 8639-8648) --------------------- */
  function hexMix(hex, towards, ratio) {
    if (!hex || typeof hex !== 'string') return hex;
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return hex;
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    var t = towards.replace('#', '');
    var tr = parseInt(t.slice(0, 2), 16), tg = parseInt(t.slice(2, 4), 16), tb = parseInt(t.slice(4, 6), 16);
    var mix = function (a, c) { return Math.round(a + (c - a) * ratio); };
    var toHex = function (n) { return n.toString(16).padStart(2, '0'); };
    return '#' + toHex(mix(r, tr)) + toHex(mix(g, tg)) + toHex(mix(b, tb));
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
  // Pick a readable text colour (#1F2937 or #FFFFFF) for a given fill.
  function contrastText(hex) {
    if (!hex || typeof hex !== 'string') return '#FFFFFF';
    var c = hexToRgb(hex);
    if (c.some(isNaN)) return '#FFFFFF';
    var lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    return lum > 0.62 ? '#1F2937' : '#FFFFFF';
  }
  function isValidHex(hex) {
    return typeof hex === 'string' && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
  }
  function normHex(hex, fallback) {
    if (!isValidHex(hex)) return fallback;
    var h = hex.trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return '#' + h.toUpperCase();
  }

  /* ---- font whitelist (each with a known Google Fonts URL) --------------- */
  var FONT_LINKS = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'Plus Jakarta Sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    'Manrope': 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
    'Source Serif 4': 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap',
    'system': null
  };
  function fontStack(font) {
    if (font === 'system' || !font) return '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    if (font === 'Source Serif 4') return "'Source Serif 4', Georgia, 'Times New Roman', serif";
    return "'" + font + "', system-ui, -apple-system, sans-serif";
  }

  /* ---- canonical Sole default -------------------------------------------- */
  var SOLE_BRAND = {
    _v: BRAND_SCHEMA_VERSION,
    kind: 'sole',
    logo: 'assets/logo-spm-web.png',  // Sole default = real logo; partners upload their own (data-URI)
    primaryColor: '#5B5BF6',
    accentColor: '#F5C518',
    orgName: 'Sole',
    productName: 'Sole',              // body-copy product token; softens "Sole" mentions in one field
    tagline: 'Small-business accounting, sorted.',
    ctaLabel: 'Get set up free with Sole',
    ctaUrl: 'https://soleapp.com.au',
    introText: '',                    // per-resource intro fills this when blank
    contactName: '',
    contactEmail: 'hello@soleapp.com.au',
    contactPhone: '',
    partnerLinks: [{ label: 'soleapp.com.au', url: 'https://soleapp.com.au' }],
    footerNote: 'General information only — not financial, legal or tax advice. Figures are examples; confirm current ATO rates.',
    poweredBySole: false,
    font: 'Inter',
    content: {}                       // per-resource overrides: { <id>: { fields, textMaps, linkMaps } }
  };

  /* ---- derive full palette from one hex (from makePortalTheme) ----------- */
  function deriveBrand(cfg) {
    var p = normHex(cfg && cfg.primaryColor, SOLE_BRAND.primaryColor);
    var a = normHex(cfg && cfg.accentColor, darkenHex(p, 0.10));
    return {
      primary: p,
      primaryHover: darkenHex(p, 0.12),
      primaryDeep: darkenHex(p, 0.22),
      primarySoft: lightenHex(p, 0.90),
      primarySofter: lightenHex(p, 0.95),
      primaryBorder: lightenHex(p, 0.74),
      primaryRing: rgba(p, 0.16),
      onPrimary: contrastText(p),
      accent: a,
      accentSoft: lightenHex(a, 0.86),
      onAccent: contrastText(a)
    };
  }

  /* ---- ensure the Google-Fonts <link> for the chosen font ---------------- */
  function ensureFontLink(font, doc) {
    doc = doc || document;
    var url = FONT_LINKS[font];
    var existing = doc.getElementById('sole-brand-font');
    if (!url) { if (existing) existing.remove(); return; }
    if (existing && existing.getAttribute('href') === url) return;
    if (existing) { existing.setAttribute('href', url); return; }
    var link = doc.createElement('link');
    link.id = 'sole-brand-font';
    link.rel = 'stylesheet';
    link.href = url;
    (doc.head || doc.getElementsByTagName('head')[0]).appendChild(link);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---- schema migration: keep old (_v:1) exports & kits rendering -------- */
  function migrateBrand(rawCfg) {
    var cfg = clone(rawCfg) || {};
    cfg._v = BRAND_SCHEMA_VERSION;
    if (cfg.content == null || typeof cfg.content !== 'object') cfg.content = {};
    if (cfg.productName == null) cfg.productName = cfg.orgName || 'Sole';
    return cfg;
  }

  /* ---- per-resource white-label content (editable text + link/text maps) - */
  function contentFor(cfg, id) { return (cfg && cfg.content && id && cfg.content[id]) || {}; }
  function textMapsFor(cfg, id) { return contentFor(cfg, id).textMaps || []; }
  function linkMapsFor(cfg, id) { return contentFor(cfg, id).linkMaps || []; }
  // apply the partner's find/replace + the productName softening to a plain string
  function applyTextMap(str, maps, productName) {
    var s = String(str == null ? '' : str);
    (maps || []).forEach(function (m) { if (m && m.find) s = s.split(m.find).join(m.replace == null ? '' : m.replace); });
    if (productName && productName !== 'Sole') {
      s = s.replace(/\bSole App\b/g, productName).replace(/\bSole\b/g, productName);
    }
    return s;
  }
  // retarget a URL via the partner's link map (exact match, then same-origin prefix)
  function applyLinkMap(url, maps) {
    var u = String(url == null ? '' : url);
    (maps || []).forEach(function (m) {
      if (!m || !m.find) return;
      if (u === m.find) u = m.replace || u;
      else if (u.indexOf(m.find) === 0) u = (m.replace || '') + u.slice(m.find.length);
    });
    return u;
  }

  // Merge per-resource content overrides + resource-level defaults into a working
  // (data, cfg) pair. Never mutates the caller's cfg (resolveBrand may return the
  // shared SOLE_BRAND). Both resource.js (DOM) and export.js (DOCX/XLSX) call this.
  function prepareResource(rawCfg, data) {
    var cfg = migrateBrand(rawCfg);
    var id = data && data.id;
    var f = contentFor(cfg, id).fields || {};
    // brand-slot defaults (fed to applyBrand via data-brand slots)
    if (!cfg.introText) cfg.introText = f.intro || f.welcomeBlurb || (data && data.intro) || '';
    if (!cfg.tagline || cfg.tagline === SOLE_BRAND.tagline) cfg.tagline = f.aboutBlurb || (data && data.taglineDefault) || cfg.tagline;
    if (f.footerNote) cfg.footerNote = f.footerNote;
    // data-field overrides (rendered as literals by chrome()/renderers)
    var d = data;
    var keys = ['ctaHeading', 'ctaText', 'proTip', 'note', 'benchmarksNote'];
    var touched = keys.some(function (k) { return f[k] != null && f[k] !== ''; });
    if (touched) { d = clone(data); keys.forEach(function (k) { if (f[k] != null && f[k] !== '') d[k] = f[k]; }); }
    return { data: d, cfg: cfg };
  }

  // convenience for callers building non-DOM output (DOCX/XLSX) from data strings
  function mergeResourceDefaults(rawCfg, data) { return prepareResource(rawCfg, data).cfg; }

  /* ---- apply a brand config to a document (live + export share this) ----- */
  function applyBrand(rawCfg, root) {
    root = root || document;
    var docEl = root.documentElement || root;
    var cfg = {};
    for (var k in SOLE_BRAND) cfg[k] = SOLE_BRAND[k];
    for (var k2 in (rawCfg || {})) if (rawCfg[k2] != null) cfg[k2] = rawCfg[k2];
    // `logo: null` is an EXPLICIT "no image → show the wordmark". Because the Sole
    // default logo is now a real path, a partner who clears their logo must NOT
    // inherit it — so an explicit null overrides the default.
    if (rawCfg && Object.prototype.hasOwnProperty.call(rawCfg, 'logo')) cfg.logo = rawCfg.logo;

    var d = deriveBrand(cfg);
    var vars = {
      '--brand-primary': d.primary,
      '--brand-primary-hover': d.primaryHover,
      '--brand-primary-deep': d.primaryDeep,
      '--brand-primary-soft': d.primarySoft,
      '--brand-primary-softer': d.primarySofter,
      '--brand-primary-border': d.primaryBorder,
      '--brand-on-primary': d.onPrimary,
      '--brand-accent': d.accent,
      '--brand-accent-soft': d.accentSoft,
      '--brand-on-accent': d.onAccent,
      '--brand-ring': d.primaryRing,
      '--brand-font': fontStack(cfg.font)
    };
    for (var vk in vars) docEl.style.setProperty(vk, vars[vk]);
    ensureFontLink(cfg.font, root.ownerDocument || root);

    // text slots
    var q = root.querySelectorAll ? root : document;
    q.querySelectorAll('[data-brand]').forEach(function (el) {
      var key = el.getAttribute('data-brand');
      var val = cfg[key];
      if (el.getAttribute('data-brand-as') === 'mailto' && val) {
        el.innerHTML = '<a href="mailto:' + esc(val) + '">' + esc(val) + '</a>';
        el.hidden = false;
      } else if (el.getAttribute('data-brand-as') === 'tel' && val) {
        el.innerHTML = '<a href="tel:' + esc(String(val).replace(/[^0-9+]/g, '')) + '">' + esc(val) + '</a>';
        el.hidden = false;
      } else {
        el.textContent = val || '';
        el.hidden = !val;
      }
    });

    // wordmark (always shows — org name in brand voice)
    q.querySelectorAll('[data-brand-wordmark]').forEach(function (el) {
      el.textContent = cfg.orgName || 'Sole';
    });

    // logo image (URL or data-URI). Hidden when absent → wordmark carries it.
    q.querySelectorAll('[data-brand-logo]').forEach(function (img) {
      if (cfg.logo) {
        img.src = cfg.logo; img.alt = (cfg.orgName || '') + ' logo'; img.hidden = false;
        img.onerror = function () { img.hidden = true; };
      } else {
        img.removeAttribute('src'); img.hidden = true;
      }
    });

    // CTA (label + href)
    q.querySelectorAll('[data-brand-cta]').forEach(function (a) {
      a.textContent = cfg.ctaLabel || '';
      a.href = cfg.ctaUrl || '#';
      a.hidden = !cfg.ctaLabel;
    });

    // conditional blocks (poweredBySole)
    q.querySelectorAll('[data-brand-if]').forEach(function (el) {
      el.hidden = !cfg[el.getAttribute('data-brand-if')];
    });

    // partner links list
    q.querySelectorAll('[data-brand-links]').forEach(function (ul) {
      var links = cfg.partnerLinks || [];
      ul.innerHTML = links.filter(function (l) { return l && l.url; }).map(function (l) {
        return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label || l.url) + '</a></li>';
      }).join('');
      ul.hidden = !links.length;
    });

    try {
      var base = (document.title || '').split('·').pop().trim() || 'Resource';
      document.title = (cfg.orgName || 'Sole') + ' · ' + base;
    } catch (_) {}

    docEl.setAttribute('data-brand-kind', cfg.kind || 'sole');
    return cfg;
  }

  /* ---- resolve which brand a resource should render with ----------------- */
  function resolveBrand() {
    if (global.__BRAND_LIVE__) return global.__BRAND_LIVE__;   // (a) studio preview (postMessage)
    if (global.__BRAND__) return global.__BRAND__;             // (b) exported / self-contained file
    try {                                                      // (c) hosted share ?brand=#hex
      var qp = new URLSearchParams(location.search).get('brand');
      if (qp && qp[0] === '#') { var c = {}; for (var k in SOLE_BRAND) c[k] = SOLE_BRAND[k]; c.primaryColor = qp; return c; }
    } catch (_) {}
    return SOLE_BRAND;                                         // (d) default: Sole
  }

  global.SoleBrand = {
    VERSION: BRAND_SCHEMA_VERSION,
    SOLE_BRAND: SOLE_BRAND,
    FONT_LINKS: FONT_LINKS,
    deriveBrand: deriveBrand,
    applyBrand: applyBrand,
    resolveBrand: resolveBrand,
    ensureFontLink: ensureFontLink,
    // white-label content layer (shared by resource.js DOM + export.js DOCX/XLSX)
    migrateBrand: migrateBrand,
    prepareResource: prepareResource,
    mergeResourceDefaults: mergeResourceDefaults,
    contentFor: contentFor,
    textMapsFor: textMapsFor,
    linkMapsFor: linkMapsFor,
    applyTextMap: applyTextMap,
    applyLinkMap: applyLinkMap,
    // utils reused by the studio
    contrastText: contrastText,
    lightenHex: lightenHex,
    darkenHex: darkenHex,
    hexMix: hexMix,
    hexToRgb: hexToRgb,
    rgba: rgba,
    isValidHex: isValidHex,
    normHex: normHex,
    fontStack: fontStack
  };
})(typeof window !== 'undefined' ? window : this);
