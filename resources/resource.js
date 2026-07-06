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

  var _data = null; // current resource (for brand-default fallbacks)

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function money(n) { return '$' + (isFinite(n) ? n : 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

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

  /* ---- shared chrome ----------------------------------------------------- */
  function chrome(data, bodyHtml) {
    return '' +
      '<div class="r-doc">' +
        '<header class="r-head">' +
          '<div class="r-brandlock"><img data-brand-logo class="r-logo" alt="" hidden><span data-brand-wordmark class="r-wordmark"></span></div>' +
          '<a data-brand-cta class="r-btn-primary r-head-cta" target="_blank" rel="noopener"></a>' +
        '</header>' +
        '<div class="r-hero">' +
          '<div class="r-eyebrow">' + esc(data.eyebrow || 'Free resource') + '</div>' +
          '<h1 class="r-title">' + esc(data.title) + '</h1>' +
          '<p class="r-intro" data-brand="introText"></p>' +
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

  /* ---- archetype: getting-paid checklist --------------------------------- */
  function renderChecklist(data) {
    var h = '<div class="r-body">';
    (data.sections || []).forEach(function (s, i) {
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (i + 1) + '</span>' + esc(s.heading) + '</h2><ul class="r-check">';
      (s.items || []).forEach(function (it) {
        h += (typeof it === 'string') ? checkItem(it, '') : checkItem(it.t, it.d);
      });
      h += '</ul></section>';
    });
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
      h += '<section class="r-section"><h2 class="r-h2"><span class="r-num">' + (++n) + '</span>Recommended pricing structure</h2><ul class="r-check">';
      data.structure.forEach(function (x) { h += checkItem(x, ''); });
      h += '</ul></section>';
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
      var g = sub * gst, total = sub + g, dep = total * st.depositPct;
      return { sub: sub, gst: g, total: total, dep: dep, bal: total - dep };
    }
    function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {} }

    function field(path, label, ph, type) {
      return '<div class="r-field"><label>' + esc(label) + '</label>' +
        '<input class="r-input" type="' + (type || 'text') + '" data-path="' + path + '" value="' + esc(getPath(st, path)) + '" placeholder="' + esc(ph || '') + '"></div>';
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
        '<div class="r-inv-grid" style="grid-template-columns:1fr 1fr 1fr">' +
          field('invoiceNo', 'Invoice number', 'INV-0001') +
          field('invoiceDate', 'Invoice date', 'DD/MM/YYYY') +
          field('dueDate', 'Deposit due by', 'DD/MM/YYYY') +
        '</div>' +
        '<section class="r-section"><h2 class="r-h2">Line items</h2>' +
          '<table class="r-line-table"><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price (excl. GST)</th><th class="num">Line total</th><th></th></tr></thead>' +
          '<tbody id="r-lines">' + lineRows() + '</tbody></table>' +
          '<button class="r-add-row" id="r-add-line" type="button">+ Add line</button>' +
        '</section>' +
        '<div class="r-totals">' +
          '<div class="r-total-row"><span>Subtotal (excl. GST)</span><span class="r-total-val" id="r-sub">' + money(c.sub) + '</span></div>' +
          '<div class="r-total-row"><span>GST (' + Math.round(gst * 100) + '%)</span><span class="r-total-val" id="r-gst">' + money(c.gst) + '</span></div>' +
          '<div class="r-total-row grand"><span>Total (incl. GST)</span><span class="r-total-val" id="r-total">' + money(c.total) + '</span></div>' +
          '<div class="r-total-row deposit"><span class="r-deposit-ctrl">Deposit due&nbsp;<select id="r-deposit-sel" aria-label="Deposit percentage">' + depOptions() + '</select></span><span class="r-total-val" id="r-dep">' + money(c.dep) + '</span></div>' +
          '<div class="r-total-row"><span>Balance on completion</span><span class="r-total-val" id="r-bal">' + money(c.bal) + '</span></div>' +
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
        '</section>';
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
    }

    function bind() {
      mount.querySelectorAll('[data-path]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          setPath(st, inp.getAttribute('data-path'), inp.value);
          if (inp.classList.contains('num')) refreshDerived();
          persist();
        });
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
    function rerender() { mount.innerHTML = html(); bind(); }

    mount.className = 'r-body';
    rerender();
  }

  /* ---- dispatch ---------------------------------------------------------- */
  function renderArchetype(data, root) {
    _data = data;
    var body, interactive = false;
    switch (data.archetype) {
      case 'checklist-getpaid': body = renderChecklist(data); break;
      case 'pricing': body = renderPricing(data); break;
      case 'invoice-deposit': body = '<div id="r-inv-mount"></div>'; interactive = true; break;
      default: body = '<div class="r-body"><p>Resource type not supported yet.</p></div>';
    }
    root.innerHTML = chrome(data, body);
    if (interactive) mountInvoice(data, root.querySelector('#r-inv-mount'));

    // checkbox strike-through
    root.addEventListener('change', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('r-checkbox')) {
        var li = e.target.closest('.r-check-item'); if (li) li.classList.toggle('done', e.target.checked);
      }
    });
    wireCopyButtons(root);
    wirePrint();
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

  function wirePrint() {
    if (document.getElementById('r-print-btn')) return;
    if (/[?&]embed=1/.test(location.search)) return; // studio provides its own print control
    var b = document.createElement('button');
    b.id = 'r-print-btn'; b.className = 'r-print-btn'; b.type = 'button';
    b.innerHTML = 'Print / Save as PDF';
    b.addEventListener('click', function () { window.print(); });
    document.body.appendChild(b);
  }

  /* ---- brand application (with resource-level defaults) ------------------ */
  function applyWithDefaults(cfg) {
    var c = {};
    for (var k in (cfg || {})) c[k] = cfg[k];
    if (!c.introText && _data) c.introText = _data.intro || '';
    global.SoleBrand.applyBrand(c);
  }

  /* ---- boot -------------------------------------------------------------- */
  function bootResource() {
    var root = document.getElementById('root');
    if (!root) return;
    var id = root.getAttribute('data-resource-id');
    var data = (global.RESOURCES || {})[id];
    if (!data) { root.innerHTML = '<div style="padding:48px;text-align:center;color:#6B7280">Resource not found: ' + esc(id) + '</div>'; return; }

    renderArchetype(data, root);
    applyWithDefaults(global.SoleBrand.resolveBrand());

    // live preview channel (studio pushes brand over postMessage)
    global.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'sole:brand') {
        global.__BRAND_LIVE__ = e.data.config;
        applyWithDefaults(e.data.config);
      }
    });
    // tell a parent studio we're ready so it re-pushes the current brand
    try { if (global.parent && global.parent !== global) global.parent.postMessage({ type: 'sole:resource-ready', id: id }, '*'); } catch (_) {}
  }

  global.SoleResource = { bootResource: bootResource, renderArchetype: renderArchetype };

  // self-boot when the DOM is ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootResource);
  else bootResource();
})(typeof window !== 'undefined' ? window : this);
