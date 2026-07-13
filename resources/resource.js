/* =============================================================================
   Sole white-label resource renderer  —  resource.js
   -----------------------------------------------------------------------------
   Vanilla, dependency-free, offline-safe. Renders any RESOURCES[id] entry into
   a branded document, then hands off to SoleBrand.applyBrand(). Shared chrome
   (header lockup, hero, closing CTA, footer) is rendered once; each archetype
   fills the body. Interactive archetypes (deposit invoice) wire their own
   auto-calc + localStorage without touching the brand system.
   ========================================================================== */
(function (global) {
  'use strict';

  var _data = null;     // MERGED resource (content overrides applied) — used by renderers + fallbacks
  var _rawData = null;  // original RESOURCES[id]
  var _root = null;     // #root element
  var _sig = null;      // signature of content-affecting brand parts (drives re-render vs re-brand)

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  // Strip a redundant "Section 2:" / "Step 3 -" prefix so the number chip carries the count.
  function cleanHeading(s) { return String(s == null ? '' : s).replace(/^\s*(section|step|part|stage)\s*\d+\s*[:\-–.)]*\s*/i, ''); }
  function money(n) { return '$' + (isFinite(n) ? n : 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function fmtNum(n) { if (!isFinite(n)) return ''; return (Math.round(n * 100) / 100).toLocaleString('en-AU', { maximumFractionDigits: 2 }); }
  // safe arithmetic over row column keys (from our own data): keys→values, then a
  // whitelist-guarded eval. "running(key)" is handled by the caller (cumulative).
  function evalFormula(formula, vals) {
    if (!formula) return 0;
    var expr = String(formula).replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, function (k) { return '(' + num(vals[k]) + ')'; });
    if (!/^[-+*/().\d\s]*$/.test(expr)) return 0;
    try { var v = Function('"use strict";return (' + expr + ')')(); return isFinite(v) ? v : 0; } catch (_) { return 0; }
  }

  function getPath(obj, path) {
    var parts = String(path).split('.'), cur = obj;
    for (var i = 0; i < parts.length; i++) { if (cur == null) return ''; cur = cur[parts[i]]; }
    return cur == null ? '' : cur;
  }
  function setPath(obj, path, val) {
    var parts = String(path).split('.'), cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = val;
  }

  /* ---- cover page (print/export only; kept in sync with export.js) ------- */
  function wantsCover(data) {
    if (data.coverPage === true) return true;
    if (data.coverPage === false) return false;
    var a = data.archetype;
    if (a === 'invoice-deposit' || a === 'invoice-multicurrency') return false;
    if (a === 'grid') return false;
    if (a === 'checklist' || a === 'checklist-getpaid') return (data.sections || []).length >= 2;
    return true; // toolkit, pricing, prompt-guide, email-pack
  }
  function coverDate() {
    try { return new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (_) { return ''; }
  }
  function coverHtml(data) {
    if (!wantsCover(data)) return '';
    return '<div class="r-cover" aria-hidden="true">' +
      '<div class="r-cover-band"></div>' +
      '<div class="r-cover-inner">' +
        '<div class="r-cover-brandlock"><img data-brand-logo class="r-cover-logo" alt="" hidden><span data-brand-wordmark class="r-cover-wordmark"></span></div>' +
        '<div class="r-cover-mid">' +
          '<div class="r-cover-eyebrow">' + esc(data.eyebrow || 'Resource') + '</div>' +
          '<h1 class="r-cover-title">' + esc(data.title) + '</h1>' +
          '<p class="r-cover-sub" data-brand="introText"></p>' +
        '</div>' +
        '<div class="r-cover-meta">' +
          '<div class="r-cover-prepared">Prepared by <span data-brand-wordmark></span></div>' +
          '<div class="r-cover-contact"><span data-brand="contactName"></span><span data-brand="contactEmail" data-brand-as="mailto"></span><span data-brand="contactPhone" data-brand-as="tel"></span></div>' +
          '<div class="r-cover-date">' + esc(coverDate()) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---- shared chrome ----------------------------------------------------- */
  function chrome(data, bodyHtml) {
    return '' +
      '<div class="r-doc' + (wantsCover(data) ? ' r-has-cover' : '') + '">' +
        coverHtml(data) +
        '<header class="r-head">' +
          '<div class="r-brandlock"><img data-brand-logo class="r-logo" alt="" hidden><span data-brand-wordmark class="r-wordmark"></span></div>' +
          '<a data-brand-cta class="r-btn-primary r-head-cta" target="_blank" rel="noopener"></a>' +
        '</header>' +
        '<div class="r-hero">' +
          '<div class="r-eyebrow">' + esc(data.eyebrow || 'Free resource') + '</div>' +
          '<h1 class="r-title">' + esc(data.title) + '</h1>' +
          (data.hideHeroIntro ? '' : '<p class="r-intro" data-brand="introText"></p>') +
        '</div>' +
        bodyHtml +
        '<div class="r-cta-block">' +
          '<h3>' + esc(data.ctaHeading || 'Want the platform behind this?') + '</h3>' +
          '<p>' + esc(data.ctaText || 'Set up in minutes to invoice, track income and get paid faster.') + '</p>' +
          '<a data-brand-cta class="r-btn-primary" target="_blank" rel="noopener"></a>' +
        '</div>' +
        footer(data) +
      '</div>';
  }

  function footer(data) {
    return '<footer class="r-foot">' +
      '<div class="r-contact"><span data-brand="contactName"></span><span data-brand="contactEmail" data-brand-as="mailto"></span><span data-brand="contactPhone" data-brand-as="tel"></span></div>' +
      '<ul class="r-foot-links" data-brand-links></ul>' +
      '<div class="r-foot-note" data-brand="footerNote"></div>' +
      (data.footerNoteExtra ? '<div class="r-foot-note" style="margin-top:6px">' + esc(data.footerNoteExtra) + '</div>' : '') +
      '<div class="r-powered" data-brand-if="poweredBySole">Powered by <b>Sole</b> · soleapp.com.au</div>' +
    '</footer>';
  }

  function protipHtml(tip) {
    return '<aside class="r-protip"><div class="r-protip-badge">Pro tip</div><p>' + esc(tip) + '</p></aside>';
  }

  function checkItem(t, d) {
    return '<li class="r-check-item"><input type="checkbox" class="r-checkbox" aria-label="' + esc(t) + '">' +
      '<div class="r-check-body"><div class="r-check-t">' + esc(t) + '</div>' +
      (d ? '<div class="r-check-d">' + esc(d) + '</div>' : '') + '</div></li>';
  }

  /* ---- archetype: checklist (getting-paid / pre / post / accountant) ------ */
  function msgTemplateHtml(m) {
    return '<section class="r-section"><h2 class="r-h2">' + esc(m.heading || 'Copy-paste message') + '</h2>' +
      '<div class="r-msg"><pre>' + esc(m.body) + '</pre><div style="margin-top:10px"><button class="r-copy-btn" data-copy>Copy message</button></div></div></section>';
  }
  function aiPromptHtml(pr) {
    return '<section class="r-section"><h2 class="r-h2">' + esc(pr.label || 'AI prompt') + '</h2>' +
      '<div class="r-prompt"><div class="r-prompt-head"><span class="r-prompt-label">Paste into ChatGPT, Claude or Gemini</span><button class="r-copy-btn" data-copy>Copy</button></div><pre class="r-prompt-text">' + esc(pr.text) + '</pre></div></section>';
  }
  function renderChecklist(data) {
    var h = '<div class="r-body">';
    (data.sections || []).forEach(function (s, i) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (i + 1) + '</span>' + esc(cleanHeading(s.heading)) + '</h2><ul class="r-check">';
      (s.items || []).forEach(function (it) {
        h += (typeof it === 'string') ? checkItem(it, '') : checkItem(it.t, it.d);
      });
      h += '</ul></section>';
    });
    if (data.messageTemplate && data.messageTemplate.body) h += msgTemplateHtml(data.messageTemplate);
    (data.aiPrompts || []).forEach(function (pr) { if (pr && pr.text) h += aiPromptHtml(pr); });
    if (data.proTip) h += protipHtml(data.proTip);
    h += '</div>';
    return h;
  }

  /* ---- archetype: email pack --------------------------------------------- */
  function renderEmailPack(data) {
    var h = '<div class="r-body">';
    (data.emails || []).forEach(function (em, i) {
      h += '<section class="r-email" id="r-email-' + i + '">' +
        '<div class="r-email-head"><span class="r-email-when">' + esc(em.when || ('Email ' + (i + 1))) + '</span><button class="r-copy-btn" data-copy>Copy</button></div>' +
        (em.subject ? '<div class="r-email-subj"><span>Subject</span> ' + esc(em.subject) + '</div>' : '') +
        '<pre class="r-email-body">' + esc(em.body || '') + '</pre></section>';
    });
    if (data.proTip) h += protipHtml(data.proTip);
    h += '</div>';
    return h;
  }

  /* ---- archetype: AI prompt guide ---------------------------------------- */
  function renderPromptGuide(data) {
    var h = '<div class="r-body">';
    (data.sections || []).forEach(function (s) {
      h += '<section class="r-section"><h2 class="r-h2">' + esc(s.heading) + '</h2><p class="r-lead">' + esc(s.body) + '</p></section>';
    });
    if (data.prompt && data.prompt.text) {
      h += '<section class="r-section"><h2 class="r-h2">' + esc(data.prompt.label || 'The prompt') + '</h2>' +
        '<div class="r-prompt"><div class="r-prompt-head"><span class="r-prompt-label">Copy into ChatGPT, Claude or Gemini (free versions work)</span><button class="r-copy-btn" data-copy>Copy</button></div><pre class="r-prompt-text">' + esc(data.prompt.text) + '</pre></div></section>';
    }
    if (data.example && data.example.body) {
      h += '<section class="r-section"><h2 class="r-h2">' + esc(data.example.title || 'Example output') + '</h2><div class="r-msg"><pre>' + esc(data.example.body) + '</pre></div></section>';
    }
    if (data.faq && data.faq.length) {
      h += '<section class="r-section"><h2 class="r-h2">FAQ</h2>' + data.faq.map(function (f) {
        return '<div class="r-faq"><div class="r-faq-q">' + esc(f.q) + '</div><div class="r-faq-a">' + esc(f.a) + '</div></div>';
      }).join('') + '</section>';
    }
    if (data.proTip) h += protipHtml(data.proTip);
    h += '</div>';
    return h;
  }

  /* ---- archetype: pricing guide ------------------------------------------ */
  function tableHtml(bm) {
    var h = '<div class="r-table-wrap"><table class="r-table"><thead><tr>';
    (bm.columns || []).forEach(function (c) { h += '<th>' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    (bm.rows || []).forEach(function (row) {
      h += '<tr>';
      row.forEach(function (cell, ci) {
        h += (ci === row.length - 1 && ci > 0) ? '<td class="r-num-cell">' + esc(cell) + '</td>' : '<td>' + esc(cell) + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function listCard(cls, title, items) {
    return '<div class="r-mini-card ' + cls + '"><h4>' + esc(title) + '</h4><ul>' +
      (items || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }

  function renderPricing(data) {
    var n = 0, h = '<div class="r-body">';
    if (data.structure) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>Recommended pricing structure</h2><ul class="r-bullets">' +
        data.structure.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
    }
    if (data.benchmarks) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>Typical price ranges</h2>' + tableHtml(data.benchmarks);
      if (data.benchmarksNote) h += '<div class="r-check-d" style="padding:2px 2px 0">' + esc(data.benchmarksNote) + '</div>';
      h += '</section>';
    }
    if (data.adjust) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>When to adjust your price</h2><div class="r-two-col">' +
        listCard('inc', 'Charge more when', data.adjust.increase) +
        listCard('exc', 'Consider less when', data.adjust.reduce) + '</div></section>';
    }
    if (data.formula) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>Your pricing formula</h2>' +
        '<div class="r-formula"><div class="r-formula-eq">' + esc(data.formula.eq) + '</div>' +
        (data.formula.ex ? '<div class="r-formula-ex">Example: ' + esc(data.formula.ex) + '</div>' : '') + '</div></section>';
    }
    if (data.inclusions || data.exclusions) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>What’s included &amp; excluded</h2><div class="r-two-col">' +
        listCard('inc', 'Typically included', data.inclusions) +
        listCard('exc', 'Typically excluded / charged separately', data.exclusions) + '</div></section>';
    }
    if (data.aiPrompt) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>Benchmark your rates with AI</h2>' +
        '<div class="r-prompt"><div class="r-prompt-head"><span class="r-prompt-label">Paste into ChatGPT, Claude or Gemini (free versions work)</span>' +
        '<button class="r-copy-btn" data-copy>Copy</button></div><pre class="r-prompt-text">' + esc(data.aiPrompt) + '</pre></div></section>';
    }
    if (data.proTip) h += protipHtml(data.proTip);
    h += '</div>';
    return h;
  }

  /* ---- archetype: deposit invoice (interactive) -------------------------- */
  function mountInvoice(data, mount) {
    var KEY = 'sole.tool.' + (data.persistKey || 'invoice');
    var gst = data.gstRate || 0.10;
    var st = null;
    try { st = JSON.parse(localStorage.getItem(KEY)); } catch (_) { st = null; }
    if (!st || typeof st !== 'object') st = clone(data.seed);
    if (!st.lines || !st.lines.length) st.lines = [{ desc: '', qty: 1, price: 0 }];
    if (st.depositPct == null) st.depositPct = data.defaultDepositPct || 0.5;

    function calc() {
      var sub = st.lines.reduce(function (s, l) { return s + num(l.qty) * num(l.price); }, 0);
      var g = sub * gst, total = sub + g, dep = data.depositOptions ? total * (st.depositPct || 0) : 0;
      var fx = num(st.fxRate) || 0;
      return { sub: sub, gst: g, total: total, dep: dep, bal: total - dep, conv: fx ? total * fx : 0 };
    }
    function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {} }
    function moneyN(n) { return (isFinite(n) ? n : 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    function field(path, label, ph, type) {
      return '<div class="r-field"><label>' + esc(label) + '</label>' +
        '<input class="r-input" type="' + (type || 'text') + '" data-path="' + path + '" value="' + esc(getPath(st, path)) + '" placeholder="' + esc(ph || '') + '"></div>';
    }
    function selField(path, label, opts) {
      var v = getPath(st, path);
      return '<div class="r-field"><label>' + esc(label) + '</label><select class="r-input" data-path="' + path + '">' +
        (opts || []).map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></div>';
    }
    function lineRows() {
      return st.lines.map(function (l, i) {
        return '<tr>' +
          '<td><input class="r-line-input" data-path="lines.' + i + '.desc" value="' + esc(l.desc) + '" placeholder="Description of work or item"></td>' +
          '<td class="num" style="width:64px"><input class="r-line-input num" data-path="lines.' + i + '.qty" value="' + esc(l.qty) + '" inputmode="decimal"></td>' +
          '<td class="num" style="width:120px"><input class="r-line-input num" data-path="lines.' + i + '.price" value="' + esc(l.price) + '" inputmode="decimal"></td>' +
          '<td class="r-line-total" data-total="' + i + '">' + money(num(l.qty) * num(l.price)) + '</td>' +
          '<td style="width:30px"><button class="r-row-del" data-del="' + i + '" title="Remove line" aria-label="Remove line">×</button></td>' +
        '</tr>';
      }).join('');
    }
    function depOptions() {
      return (data.depositOptions || [{ label: '50%', pct: 0.5 }]).map(function (o) {
        return '<option value="' + o.pct + '"' + (Math.abs(o.pct - st.depositPct) < 0.001 ? ' selected' : '') + '>' + esc(o.label) + '</option>';
      }).join('');
    }

    function html() {
      var c = calc();
      return '' +
        '<div class="r-inv-grid">' +
          '<fieldset class="r-fieldset"><legend>Your business</legend>' +
            field('business.name', 'Business / trading name', 'Your business name') +
            field('business.abn', 'ABN', '12 345 678 901') +
            field('business.email', 'Email', 'you@business.com.au', 'email') +
            field('business.phone', 'Phone', '04XX XXX XXX') +
            field('business.address', 'Address', 'Street, suburb, state, postcode') +
          '</fieldset>' +
          '<fieldset class="r-fieldset"><legend>Bill to</legend>' +
            field('client.name', 'Client / company name', 'Client name') +
            field('client.abn', 'Client ABN (if applicable)', '') +
            field('client.email', 'Client email', 'client@email.com', 'email') +
            field('client.address', 'Billing address', 'Client address') +
          '</fieldset>' +
        '</div>' +
        (data.currencies
          ? '<div class="r-inv-grid" style="grid-template-columns:1fr 1fr 1fr 1fr">' + field('invoiceNo', 'Invoice number', 'INV-0001') + field('invoiceDate', 'Invoice date', 'DD/MM/YYYY') + selField('currency', 'Currency', data.currencies) + field('fxRate', '1 AUD = (your rate)', 'e.g. 0.66') + '</div>'
          : '<div class="r-inv-grid" style="grid-template-columns:1fr 1fr 1fr">' + field('invoiceNo', 'Invoice number', 'INV-0001') + field('invoiceDate', 'Invoice date', 'DD/MM/YYYY') + field('dueDate', 'Deposit due by', 'DD/MM/YYYY') + '</div>') +
        '<section class="r-section"><h2 class="r-h2">Line items</h2>' +
          '<table class="r-line-table"><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price (excl. GST)</th><th class="num">Line total</th><th></th></tr></thead>' +
          '<tbody id="r-lines">' + lineRows() + '</tbody></table>' +
          '<button class="r-add-row" id="r-add-line" type="button">+ Add line</button>' +
        '</section>' +
        '<div class="r-totals">' +
          '<div class="r-total-row"><span>Subtotal (excl. GST)</span><span class="r-total-val" id="r-sub">' + money(c.sub) + '</span></div>' +
          '<div class="r-total-row"><span>GST (' + Math.round(gst * 100) + '%)</span><span class="r-total-val" id="r-gst">' + money(c.gst) + '</span></div>' +
          '<div class="r-total-row grand"><span>Total (incl. GST)</span><span class="r-total-val" id="r-total">' + money(c.total) + '</span></div>' +
          (data.depositOptions ? ('<div class="r-total-row deposit"><span class="r-deposit-ctrl">Deposit due&nbsp;<select id="r-deposit-sel" aria-label="Deposit percentage">' + depOptions() + '</select></span><span class="r-total-val" id="r-dep">' + money(c.dep) + '</span></div>' +
          '<div class="r-total-row"><span>Balance on completion</span><span class="r-total-val" id="r-bal">' + money(c.bal) + '</span></div>') : '') +
          (data.currencies ? '<div class="r-total-row deposit"><span>Total in <span id="r-cur-lbl">' + esc(st.currency || data.currencies[0]) + '</span> (at your rate)</span><span class="r-total-val" id="r-conv">' + moneyN(c.conv) + '</span></div>' : '') +
        '</div>' +
        '<section class="r-section" style="margin-top:24px"><h2 class="r-h2">Payment instructions</h2>' +
          '<div class="r-inv-grid">' +
            '<fieldset class="r-fieldset"><legend>Pay by bank transfer</legend>' +
              field('business.bsb', 'BSB', 'XXX-XXX') +
              field('business.acct', 'Account number', 'XXXXXXXX') +
              field('business.acctName', 'Account name', 'Account name') +
            '</fieldset>' +
            '<fieldset class="r-fieldset"><legend>Note to client</legend><div class="r-field">' +
              '<textarea class="r-input" data-path="paymentNote" rows="5" placeholder="Payment terms and reference">' + esc(getPath(st, 'paymentNote')) + '</textarea></div></fieldset>' +
          '</div>' +
        '</section>' +
        (data.gstNote ? '<section class="r-section" style="margin-top:20px"><h2 class="r-h2">GST for international clients</h2><div class="r-msg"><pre>' + esc(data.gstNote) + '</pre></div></section>' : '');
    }

    function refreshDerived() {
      st.lines.forEach(function (l, i) {
        var cell = mount.querySelector('[data-total="' + i + '"]');
        if (cell) cell.textContent = money(num(l.qty) * num(l.price));
      });
      var c = calc();
      var set = function (id, v) { var el = mount.querySelector('#' + id); if (el) el.textContent = v; };
      set('r-sub', money(c.sub)); set('r-gst', money(c.gst)); set('r-total', money(c.total));
      set('r-dep', money(c.dep)); set('r-bal', money(c.bal));
      set('r-conv', moneyN(c.conv)); set('r-cur-lbl', st.currency || (data.currencies && data.currencies[0]) || '');
    }

    function bind() {
      mount.querySelectorAll('[data-path]').forEach(function (inp) {
        var refresh = inp.classList.contains('num') || inp.getAttribute('data-path') === 'fxRate' || inp.getAttribute('data-path') === 'currency';
        var h = function () { setPath(st, inp.getAttribute('data-path'), inp.value); if (refresh) refreshDerived(); persist(); };
        inp.addEventListener('input', h); if (inp.tagName === 'SELECT') inp.addEventListener('change', h);
      });
      var dep = mount.querySelector('#r-deposit-sel');
      if (dep) dep.addEventListener('change', function () { st.depositPct = parseFloat(dep.value); refreshDerived(); persist(); });
      var add = mount.querySelector('#r-add-line');
      if (add) add.addEventListener('click', function () { st.lines.push({ desc: '', qty: 1, price: 0 }); persist(); rerender(); });
      mount.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          st.lines.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          if (!st.lines.length) st.lines.push({ desc: '', qty: 1, price: 0 });
          persist(); rerender();
        });
      });
    }
    function rerender() { mount.innerHTML = html(); bind(); reapplyBrand(); }

    mount.className = 'r-body';
    rerender();
  }

  /* ---- archetype: guided toolkit (interactive) --------------------------- */
  function mountToolkit(data, mount) {
    var KEY = 'sole.tool.' + (data.persistKey || data.slug || 'toolkit');
    var st = null; try { st = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
    if (!st || typeof st !== 'object') st = {};
    st.intake = st.intake || {}; st.done = st.done || {}; st.skip = st.skip || {};
    var persist = function () { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {} };
    var stages = data.stages || [];
    var isAcct = data.audience === 'accountant';
    var tailoredOut = function (it) { return it.industries && st.intake.bizType && it.industries.indexOf(st.intake.bizType) === -1; };
    var skey = function (si, ii) { return stages[si].id + ':' + ii; };

    function counts() {
      var total = 0, done = 0;
      stages.forEach(function (s, si) { (s.items || []).forEach(function (it, ii) { if (tailoredOut(it)) return; var k = skey(si, ii); if (st.skip[k]) return; total++; if (st.done[k]) done++; }); });
      return { total: total, done: done, pct: total ? Math.round(done / total * 100) : 0 };
    }
    function stageComplete(si) {
      var s = stages[si], total = 0, done = 0;
      (s.items || []).forEach(function (it, ii) { if (tailoredOut(it)) return; var k = skey(si, ii); if (st.skip[k]) return; total++; if (st.done[k]) done++; });
      return total > 0 && done === total;
    }
    function progressHtml() {
      var c = counts();
      var chips = stages.map(function (s, si) { return '<a class="r-stage-chip' + (stageComplete(si) ? ' done' : '') + '" href="#r-stage-' + si + '">' + (si + 1) + '. ' + esc(s.title) + '</a>'; }).join('');
      return '<div class="r-progress"><div class="r-progress-top"><span class="r-progress-label" id="r-prog-label">' + c.done + ' of ' + c.total + ' steps done</span><span class="r-progress-pct" id="r-prog-pct">' + c.pct + '%</span></div>' +
        '<div class="r-progress-bar"><div class="r-progress-fill" id="r-prog-fill" style="width:' + c.pct + '%"></div></div>' +
        '<div class="r-stage-chips" id="r-stage-chips">' + chips + '</div></div>';
    }
    function stepHtml(s, si, it, ii) {
      var ek = si + '::' + ii, k = skey(si, ii);
      var done = !!st.done[k], skip = !!st.skip[k];
      var actions = (it.actions || []).map(function (a) { return '<a class="r-action-link" href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.label) + '</a>'; }).join('');
      return '<li class="r-step' + (done ? ' done' : '') + (skip ? ' skipped' : '') + '">' +
        '<input type="checkbox" class="r-step-check" data-done="' + ek + '"' + (done ? ' checked' : '') + ' aria-label="' + esc(it.t) + '">' +
        '<div class="r-step-body"><div class="r-step-t">' + esc(it.t) + '</div>' + (it.d ? '<div class="r-step-d">' + esc(it.d) + '</div>' : '') +
        (actions ? '<div class="r-step-actions">' + actions + '</div>' : '') + '</div>' +
        '<button class="r-step-skip" data-skip="' + ek + '">' + (skip ? 'Restore' : 'Not relevant') + '</button></li>';
    }
    function stageHtml(s, si) {
      var steps = (s.items || []).map(function (it, ii) { return tailoredOut(it) ? '' : stepHtml(s, si, it, ii); }).join('');
      var sole = s.sole ? '<div class="r-sole-rec"><span class="r-sole-txt"><b>' + esc(s.sole.text || 'Our recommendation') + '</b>' + (s.sole.note ? ' — ' + esc(s.sole.note) : '') + '</span><a href="' + esc(s.sole.url) + '" target="_blank" rel="noopener">' + esc(s.sole.label || 'Learn more') + '</a></div>' : '';
      return '<section class="r-stage" id="r-stage-' + si + '"><div class="r-stage-head"><span class="r-stage-num">' + (si + 1) + '</span><span class="r-stage-title">' + esc(s.title) + '</span></div>' +
        (s.intro ? '<p class="r-stage-intro">' + esc(s.intro) + '</p>' : '') + '<ul class="r-steps">' + steps + '</ul>' + sole + '</section>';
    }
    function intakeHtml() {
      if (!data.intake) return '';
      var fields = (data.intake.fields || []).map(function (f) {
        var val = st.intake[f.key] || '';
        if (f.type === 'select') return '<div class="r-field"><label>' + esc(f.label) + '</label><select class="r-input" data-intake="' + f.key + '"><option value="">Select…</option>' + (f.options || []).map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></div>';
        return '<div class="r-field"><label>' + esc(f.label) + '</label><input class="r-input" data-intake="' + f.key + '" value="' + esc(val) + '" placeholder="' + esc(f.ph || '') + '"></div>';
      }).join('');
      return '<div class="r-intake"><h3>' + esc(data.intake.heading || 'Tell us about your business') + '</h3><div class="r-intake-sub">' + esc(data.intake.sub || '') + '</div><div class="r-intake-grid">' + fields + '</div></div>';
    }
    function welcomeHtml() {
      if (!isAcct || !data.welcome) return '';
      return '<div class="r-welcome"><h2>' + esc(data.welcome.heading || 'Welcome from your accountant') + '</h2><p data-brand="introText"></p></div>' +
        '<div class="r-about"><div class="r-about-h">' + esc(data.welcome.aboutHeading || 'About your accountant') + '</div><p data-brand="tagline"></p>' +
        '<div class="r-about-contact"><span data-brand="contactName"></span><span data-brand="contactEmail" data-brand-as="mailto"></span><span data-brand="contactPhone" data-brand-as="tel"></span></div></div>';
    }
    function html() {
      return welcomeHtml() + intakeHtml() + progressHtml() + stages.map(stageHtml).join('');
    }
    function updateProgress() {
      var c = counts();
      var set = function (id, v, prop) { var el = mount.querySelector('#' + id); if (el) { if (prop) el.style.width = v; else el.textContent = v; } };
      set('r-prog-label', c.done + ' of ' + c.total + ' steps done');
      set('r-prog-pct', c.pct + '%');
      set('r-prog-fill', c.pct + '%', true);
      var chips = mount.querySelector('#r-stage-chips');
      if (chips) stages.forEach(function (s, si) { var el = chips.children[si]; if (el) el.classList.toggle('done', stageComplete(si)); });
    }
    function bind() {
      mount.querySelectorAll('[data-intake]').forEach(function (inp) {
        var h = function () { st.intake[inp.getAttribute('data-intake')] = inp.value; persist(); if (inp.tagName === 'SELECT') rerender(); };
        inp.addEventListener('input', h); inp.addEventListener('change', h);
      });
      mount.querySelectorAll('[data-done]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var p = cb.getAttribute('data-done').split('::'), k = stages[+p[0]].id + ':' + p[1];
          if (cb.checked) st.done[k] = 1; else delete st.done[k];
          var li = cb.closest('.r-step'); if (li) li.classList.toggle('done', cb.checked);
          persist(); updateProgress();
        });
      });
      mount.querySelectorAll('[data-skip]').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = b.getAttribute('data-skip').split('::'), k = stages[+p[0]].id + ':' + p[1];
          if (st.skip[k]) delete st.skip[k]; else { st.skip[k] = 1; delete st.done[k]; }
          persist(); rerender();
        });
      });
      mount.querySelectorAll('.r-stage-chip').forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); var t = mount.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      });
    }
    function rerender() { mount.innerHTML = html(); bind(); reapplyBrand(); }
    mount.innerHTML = html();
    bind();
  }

  /* ---- archetype: grid tracker (interactive spreadsheet) ----------------- */
  function mountGrid(data, mount) {
    var KEY = 'sole.tool.' + (data.persistKey || data.slug || 'grid');
    var cols = data.columns || [];
    var st = null; try { st = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
    if (!st || typeof st !== 'object') st = {};
    st.header = st.header || {};
    // seed editable header rates (e.g. ATO cents/km, SGC %) from their defaults
    (data.headerFields || []).forEach(function (f) { if (f.default != null && f.default !== '' && (st.header[f.key] == null || st.header[f.key] === '')) st.header[f.key] = String(f.default); });
    if (!st.rows || !st.rows.length) { st.rows = []; var seed = data.seedRows || 8; for (var i = 0; i < seed; i++) st.rows.push({}); }
    var persist = function () { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {} };

    function computeRow(row, running) {
      var vals = {};
      cols.forEach(function (c) { if (c.type !== 'calc') vals[c.key] = row[c.key] != null ? row[c.key] : ''; });
      // header-field rates feed formulas as a single editable input driving the column
      (data.headerFields || []).forEach(function (f) { if (!(f.key in vals)) { var nx = parseFloat(st.header[f.key]); if (isFinite(nx)) vals[f.key] = nx; } });
      cols.forEach(function (c) { if (c.type === 'calc' && !/^running\(/.test(c.formula || '')) vals[c.key] = evalFormula(c.formula, vals); });
      cols.forEach(function (c) { if (c.type === 'calc') { var m = (c.formula || '').match(/^running\(([a-zA-Z0-9_]+)\)$/); if (m) { running[m[1]] = (running[m[1]] || 0) + num(vals[m[1]]); vals[c.key] = running[m[1]]; } } });
      return vals;
    }
    function headerHtml() {
      if (!data.headerFields || !data.headerFields.length) return '';
      return '<div class="r-inv-grid" style="margin-bottom:16px">' + data.headerFields.map(function (f) {
        return '<div class="r-field"><label>' + esc(f.label) + '</label><input class="r-input" data-h="' + esc(f.key) + '" value="' + esc(st.header[f.key] || '') + '" placeholder="' + esc(f.ph || '') + '"></div>';
      }).join('') + '</div>';
    }
    function bodyRows() {
      var running = {}, totals = {};
      var rowsHtml = st.rows.map(function (row, ri) {
        var vals = computeRow(row, running);
        var rowEmpty = cols.every(function (c) { return c.type === 'calc' || row[c.key] == null || String(row[c.key]).trim() === ''; });
        (data.totals || []).forEach(function (tk) { totals[tk] = (totals[tk] || 0) + num(vals[tk]); });
        var cells = cols.map(function (c) {
          if (c.type === 'calc') return '<td class="r-line-total" data-cell="' + ri + '.' + c.key + '">' + (rowEmpty || vals[c.key] === '' ? '' : fmtNum(num(vals[c.key]))) + '</td>';
          var t = c.type === 'num' ? ' num' : '';
          return '<td' + (c.width ? ' style="width:' + c.width + '"' : '') + '><input class="r-line-input' + t + '" data-cell="' + ri + '.' + c.key + '" value="' + esc(row[c.key] != null ? row[c.key] : '') + '"' + (c.type === 'num' ? ' inputmode="decimal"' : '') + '></td>';
        }).join('');
        return '<tr>' + cells + '<td style="width:30px"><button class="r-row-del" data-delrow="' + ri + '" title="Remove row">×</button></td></tr>';
      }).join('');
      var totalRow = (data.totals && data.totals.length) ? ('<tr class="r-grid-total">' + cols.map(function (c, ci) {
        if (ci === 0) return '<td><b>Total</b></td>';
        return '<td class="' + (c.type === 'calc' || c.type === 'num' ? 'r-line-total' : '') + '"><b>' + ((data.totals.indexOf(c.key) > -1) ? fmtNum(totals[c.key] || 0) : '') + '</b></td>';
      }).join('') + '<td></td></tr>') : '';
      return rowsHtml + totalRow;
    }
    function html() {
      var heads = cols.map(function (c) { return '<th' + (c.type === 'num' || c.type === 'calc' ? ' class="num"' : '') + '>' + esc(c.label) + '</th>'; }).join('') + '<th></th>';
      return headerHtml() +
        '<div style="overflow-x:auto"><table class="r-line-table"><thead><tr>' + heads + '</tr></thead><tbody id="r-grid-body">' + bodyRows() + '</tbody></table></div>' +
        '<button class="r-add-row" id="r-grid-add" type="button">+ Add row</button>' +
        (data.note ? '<div class="r-check-d" style="margin-top:14px">' + esc(data.note) + '</div>' : '') +
        (data.proTip ? protipHtml(data.proTip) : '');
    }
    function refresh() { mount.querySelector('#r-grid-body').innerHTML = bodyRows(); bindRows(); }
    function bindRows() {
      mount.querySelectorAll('[data-cell]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var p = inp.getAttribute('data-cell').split('.'); st.rows[+p[0]][p[1]] = inp.value; persist();
          // recompute derived + totals live
          mount.querySelector('#r-grid-body').innerHTML = bodyRows();
          bindRows();
        });
      });
      mount.querySelectorAll('[data-delrow]').forEach(function (b) {
        b.addEventListener('click', function () { st.rows.splice(+b.getAttribute('data-delrow'), 1); if (!st.rows.length) st.rows.push({}); persist(); refresh(); });
      });
    }
    function bind() {
      // header fields include editable rates (ATO cents/km, SGC %) that feed formulas → recompute the body live
      mount.querySelectorAll('[data-h]').forEach(function (inp) { inp.addEventListener('input', function () { st.header[inp.getAttribute('data-h')] = inp.value; persist(); var b = mount.querySelector('#r-grid-body'); if (b) { b.innerHTML = bodyRows(); bindRows(); } }); });
      var add = mount.querySelector('#r-grid-add'); if (add) add.addEventListener('click', function () { st.rows.push({}); persist(); refresh(); });
      bindRows();
    }
    mount.className = 'r-body';
    mount.innerHTML = html();
    bind();
  }

  /* ---- dispatch ---------------------------------------------------------- */
  function renderArchetype(rawData, root, cfg) {
    cfg = cfg || currentCfg();
    var prepared = global.SoleBrand.prepareResource(cfg, rawData);
    _rawData = rawData; _data = prepared.data; _root = root; _sig = contentSig(prepared.cfg, rawData.id);
    var data = _data;
    var body, interactive = null;
    switch (data.archetype) {
      case 'checklist-getpaid':
      case 'checklist': body = renderChecklist(data); break;
      case 'pricing': body = renderPricing(data); break;
      case 'email-pack': body = renderEmailPack(data); break;
      case 'prompt-guide': body = renderPromptGuide(data); break;
      case 'invoice-deposit':
      case 'invoice-multicurrency': body = '<div id="r-inv-mount"></div>'; interactive = 'invoice'; break;
      case 'grid': body = '<div class="r-body" id="r-grid-mount"></div>'; interactive = 'grid'; break;
      case 'toolkit': body = '<div class="r-body" id="r-toolkit-mount"></div>'; interactive = 'toolkit'; break;
      default: body = '<div class="r-body"><p>Resource type not supported yet.</p></div>';
    }
    root.innerHTML = chrome(data, body);
    if (interactive === 'invoice') mountInvoice(data, root.querySelector('#r-inv-mount'));
    else if (interactive === 'toolkit') mountToolkit(data, root.querySelector('#r-toolkit-mount'));
    else if (interactive === 'grid') mountGrid(data, root.querySelector('#r-grid-mount'));

    // checkbox strike-through (delegated on root — wire once, survives innerHTML swaps)
    if (!root.__soleChangeWired) {
      root.__soleChangeWired = true;
      root.addEventListener('change', function (e) {
        if (e.target && e.target.classList && e.target.classList.contains('r-checkbox')) {
          var li = e.target.closest('.r-check-item'); if (li) li.classList.toggle('done', e.target.checked);
        }
      });
    }
    wireCopyButtons(root);
    // brand + per-resource content applied once the DOM exists
    global.SoleBrand.applyBrand(prepared.cfg);
    applyContentSweep(document, prepared.cfg);
    wireExportBar();
  }

  function wireCopyButtons(root) {
    root.querySelectorAll('.r-copy-btn[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var block = btn.closest('.r-prompt') || btn.closest('.r-msg') || btn.parentNode.parentNode;
        var pre = block.querySelector('pre');
        var text = pre ? pre.textContent : '';
        var done = function () { var o = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(function () { btn.textContent = o; }, 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
        else { try { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); } catch (_) {} }
      });
    });
  }

  /* ---- multi-format export bar (hosted page; studio owns its own) -------- */
  function wireExportBar() {
    var existing = document.getElementById('r-export-bar');
    if (existing) existing.parentNode.removeChild(existing); // rebuild — caps can change on full re-render
    if (/[?&]embed=1/.test(location.search)) return; // studio provides its own export controls
    var caps = (global.SoleExport && global.SoleExport.canExport) ? global.SoleExport.canExport(_data.archetype) : { pdf: true, docx: false, xlsx: false };
    var bar = document.createElement('div');
    bar.id = 'r-export-bar'; bar.className = 'r-export-bar';
    var h = '<button type="button" class="r-xbtn r-xbtn-pdf" data-x="pdf">Save as PDF</button>';
    if (caps.docx) h += '<button type="button" class="r-xbtn" data-x="docx">Word</button>';
    if (caps.xlsx) h += '<button type="button" class="r-xbtn" data-x="xlsx">Excel</button>';
    bar.innerHTML = h;
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-x]') : null;
      if (!b || !global.SoleExport) return;
      var kind = b.getAttribute('data-x');
      var prepared = global.SoleBrand.prepareResource(currentCfg(), _rawData);
      if (kind === 'pdf') { global.SoleExport.exportPdf(prepared.data, prepared.cfg); return; }
      var orig = b.textContent; b.textContent = 'Working…'; b.disabled = true;
      var reset = function () { b.textContent = orig; b.disabled = false; };
      var fn = kind === 'docx' ? global.SoleExport.exportDocx : global.SoleExport.exportXlsx;
      fn(prepared.data, prepared.cfg, { download: true }).then(reset, function () {
        reset(); alert(kind.toUpperCase() + ' export needs an internet connection. “Save as PDF” works offline.');
      });
    });
  }

  /* ---- brand + per-resource content application -------------------------- */
  function currentCfg() { return global.__BRAND_LIVE__ || global.SoleBrand.resolveBrand(); }
  function contentSig(cfg, id) {
    try { return JSON.stringify((cfg.content && cfg.content[id] && cfg.content[id].fields) || null); } catch (_) { return ''; }
  }
  // guarded DOM sweep: partner find/replace + productName over text nodes, and
  // link retargeting over anchors — skips brand-managed slots, inputs, scripts.
  function applyContentSweep(rootDoc, cfg) {
    var id = _rawData && _rawData.id;
    var maps = global.SoleBrand.textMapsFor(cfg, id);
    var lmaps = global.SoleBrand.linkMapsFor(cfg, id);
    var pn = cfg.productName || 'Sole';
    var scope = document.querySelector('.r-doc') || document.body;
    if (!scope) return;
    if ((maps && maps.length) || pn !== 'Sole') {
      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          var p = n.parentNode; if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest('[data-brand],[data-brand-cta],[data-brand-wordmark],[data-brand-logo],[data-brand-links],[data-brand-as],[data-brand-if]')) return NodeFilter.FILTER_REJECT;
          if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var n;
      while ((n = walker.nextNode())) {
        if (n.__soleOrig == null) n.__soleOrig = n.nodeValue;   // cache original → non-cumulative
        var out = global.SoleBrand.applyTextMap(n.__soleOrig, maps, pn);
        if (out !== n.nodeValue) n.nodeValue = out;
      }
    }
    if (lmaps && lmaps.length) {
      scope.querySelectorAll('a[href]').forEach(function (a) {
        if (a.hasAttribute('data-brand-cta') || (a.closest && a.closest('[data-brand-links]'))) return; // brand-managed
        if (a.__soleOrigHref == null) a.__soleOrigHref = a.getAttribute('href');
        var nu = global.SoleBrand.applyLinkMap(a.__soleOrigHref, lmaps);
        if (nu !== a.getAttribute('href')) a.setAttribute('href', nu);
      });
    }
  }
  // re-apply brand + content without a full re-render (interactive subtree rebuilds)
  function reapplyBrand() {
    if (!_rawData) return;
    var p = global.SoleBrand.prepareResource(currentCfg(), _rawData);
    global.SoleBrand.applyBrand(p.cfg);
    applyContentSweep(document, p.cfg);
  }
  // studio live update: full re-render only when edited copy (fields) changed,
  // else the cheap brand+sweep path (handles colours/logo/maps/productName live).
  function renderOrReapply(cfg) {
    if (!_root || !_rawData) { reapplyBrand(); return; }
    if (contentSig(cfg, _rawData.id) !== _sig) renderArchetype(_rawData, _root, cfg);
    else { var p = global.SoleBrand.prepareResource(cfg, _rawData); global.SoleBrand.applyBrand(p.cfg); applyContentSweep(document, p.cfg); }
  }

  /* ---- boot -------------------------------------------------------------- */
  function bootResource() {
    var root = document.getElementById('root');
    if (!root) return;
    var id = root.getAttribute('data-resource-id');
    var data = (global.RESOURCES || {})[id];
    if (!data) { root.innerHTML = '<div style="padding:48px;text-align:center;color:#6B7280">Resource not found: ' + esc(id) + '</div>'; return; }
    if (data.id == null) data.id = id; // ensure id present for per-resource content maps

    renderArchetype(data, root, currentCfg());

    // live preview channel (studio pushes brand over postMessage)
    global.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'sole:brand') { global.__BRAND_LIVE__ = e.data.config; renderOrReapply(e.data.config); }
    });
    // tell a parent studio we're ready so it re-pushes the current brand
    try { if (global.parent && global.parent !== global) global.parent.postMessage({ type: 'sole:resource-ready', id: id }, '*'); } catch (_) {}
  }

  global.SoleResource = { bootResource: bootResource, renderArchetype: renderArchetype };

  // self-boot when the DOM is ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootResource);
  else bootResource();
})(typeof window !== 'undefined' ? window : this);
