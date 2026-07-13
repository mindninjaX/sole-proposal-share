/* =============================================================================
   Sole white-label resource EXPORT engine  —  export.js
   -----------------------------------------------------------------------------
   Vanilla; heavy libs (docx, xlsx) are lazy-loaded from CDN on first use, so the
   hosted resource page stays light. Attaches window.SoleExport. Both the hosted
   page (resource.js → wireExportBar) and the studio (toolkit.html toolbar) call
   the SAME functions, so a Sole-default export and a partner-rebranded export run
   identical code and produce consistent output.

   PDF   — browser print-to-PDF (crisp vector, selectable text, exact brand CSS).
           The cover page rides as a print-only .r-cover block in the DOM.
   DOCX  — a REAL editable Word document built from the structured resource data
           (not from HTML), with a cover section, headings, tables and the logo.
   XLSX  — a REAL working spreadsheet for grid trackers: header block, columns,
           live Excel formulas translated from the resource's calc formulas,
           seed rows, a SUM() totals row, and a brand-filled header.

   Per-resource white-label content overrides (edited copy, text find/replace,
   link swaps, productName) are applied here too, via window.SoleBrand helpers, so
   every format inherits the same customisations.
   ========================================================================== */
(function (global) {
  'use strict';
  var SB = global.SoleBrand;

  /* ---- lazy CDN loader (mirrors the studio's LIB) ------------------------ */
  function loadScript(src, g) {
    return new Promise(function (res, rej) {
      if (g && global[g]) return res(global[g]);
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { res(g ? global[g] : true); };
      s.onerror = function () { rej(new Error('Could not load ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }
  var LIB = {
    // PINNED versions — a floating tag can ship a breaking major. See docs/MEMORY.md.
    docx: function () { return loadScript('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js', 'docx'); },
    xlsx: function () { return loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', 'XLSX'); }
  };

  /* ---- small helpers ----------------------------------------------------- */
  function slug(s) { return String(s || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brand'; }
  function fname(data, cfg, ext) { return slug(cfg.orgName) + '-' + (data.slug || data.id || 'resource') + '.' + ext; }
  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { try { a.remove(); URL.revokeObjectURL(a.href); } catch (_) {} }, 1500);
  }
  function dataUriToBytes(uri) {
    var bin = atob((uri || '').split(',')[1] || '');
    var u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function money(n) { return '$' + (isFinite(n) ? n : 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtDate() {
    try { return new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (_) { return ''; }
  }
  function noHash(hex) { return String(hex || '#000000').replace('#', '').toUpperCase(); }

  // content-mapped string / url (partner find-replace + productName + link swap)
  function T(str, data, cfg) { return SB.applyTextMap(str, SB.textMapsFor(cfg, data.id), cfg.productName); }
  function U(url, data, cfg) { return SB.applyLinkMap(url, SB.linkMapsFor(cfg, data.id)); }

  /* ---- which resources carry a cover page (kept in sync w/ resource.js) -- */
  function wantsCover(data) {
    if (data.coverPage === true) return true;
    if (data.coverPage === false) return false;
    var a = data.archetype;
    if (a === 'invoice-deposit' || a === 'invoice-multicurrency') return false;
    if (a === 'grid') return false;
    if (a === 'checklist' || a === 'checklist-getpaid') return (data.sections || []).length >= 2;
    return true; // toolkit, pricing, prompt-guide, email-pack
  }

  /* ---- capability probe drives which buttons render ---------------------- */
  function canExport(archetype) {
    return { pdf: true, docx: true, xlsx: archetype === 'grid' };
  }

  /* ---- shared cover-page field model (print CSS + DOCX + pdf-lib share) -- */
  function coverModel(data, rawCfg) {
    var cfg = SB.migrateBrand(rawCfg);
    var d = SB.deriveBrand(cfg);
    return {
      show: wantsCover(data),
      orgName: cfg.orgName || 'Sole',
      logo: cfg.logo || null,
      eyebrow: data.eyebrow || 'Resource',
      title: T(data.title, data, cfg),
      subtitle: cfg.introText || data.intro || '',
      contactName: cfg.contactName || '', contactEmail: cfg.contactEmail || '', contactPhone: cfg.contactPhone || '',
      primary: d.primary, onPrimary: d.onPrimary,
      dateStr: fmtDate()
    };
  }

  /* =========================================================================
     PDF — browser print (the cover renders via the print-only .r-cover block)
     ========================================================================= */
  function exportPdf(data, cfg, opts) {
    var win = (opts && opts.win) || global;
    try { win.focus(); } catch (_) {}
    win.print();
    return Promise.resolve();
  }

  /* =========================================================================
     Logo → PNG bytes (re-encode via canvas so DOCX always gets valid PNG)
     ========================================================================= */
  function loadImage(src) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { res(null); };
      img.src = src;
    });
  }
  function logoPng(cfg) {
    if (!cfg.logo) return Promise.resolve(null);
    return loadImage(cfg.logo).then(function (img) {
      if (!img) return null;
      var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      if (!w || !h) return null;
      try {
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0);
        return { bytes: dataUriToBytes(c.toDataURL('image/png')), w: w, h: h };
      } catch (_) { return null; } // tainted canvas (remote logo w/o CORS) → skip
    });
  }

  /* =========================================================================
     DOCX — real editable Word from structured data
     ========================================================================= */
  function exportDocx(data, cfg, opts) {
    return LIB.docx().then(function (docx) {
      var P = docx.Paragraph, TR = docx.TextRun, Tbl = docx.Table, Row = docx.TableRow, Cell = docx.TableCell;
      var HL = docx.HeadingLevel, AL = docx.AlignmentType, WT = docx.WidthType, SH = docx.ShadingType;
      var d = SB.deriveBrand(cfg);
      var PRIM = noHash(d.primary), ONPRIM = noHash(d.onPrimary), INK = '1F2937', MUTED = '6B7280';
      var FONT = (cfg.font && cfg.font !== 'system') ? cfg.font : 'Calibri';
      var tx = function (s) { return T(s, data, cfg); };

      /* ---- element builders ---- */
      function run(text, o) { o = o || {}; o.text = String(text == null ? '' : text); return new TR(o); }
      function para(children, o) { o = o || {}; o.children = Array.isArray(children) ? children : [children]; return new P(o); }
      function h2(text) { return new P({ heading: HL.HEADING_2, spacing: { before: 260, after: 90 }, children: [run(tx(text))] }); }
      function body(text, o) { o = o || {}; o.children = [run(tx(text), { size: 21 })]; o.spacing = o.spacing || { after: 120 }; return new P(o); }
      function bullet(text, detail) {
        var runs = [run(tx(text), { size: 21 })];
        if (detail) runs.push(run(tx(detail), { break: 1, size: 18, color: MUTED }));
        return new P({ bullet: { level: 0 }, spacing: { after: 70 }, children: runs });
      }
      function checkItem(text, detail) {
        var runs = [run('☐  ', { size: 22 }), run(tx(text), { size: 21 })];
        if (detail) runs.push(run(tx(detail), { break: 1, size: 18, color: MUTED }));
        return new P({ spacing: { after: 80 }, indent: { left: 120 }, children: runs });
      }
      function preBlock(text) {
        var lines = String(text == null ? '' : tx(text)).split('\n');
        return new P({
          shading: { type: SH.CLEAR, color: 'auto', fill: 'F3F4F6' },
          spacing: { before: 100, after: 140 }, indent: { left: 120, right: 120 },
          children: lines.map(function (ln, i) { return run(ln, { break: i > 0 ? 1 : 0, font: 'Consolas', size: 18 }); })
        });
      }
      function cell(text, o) {
        o = o || {};
        return new Cell({
          shading: o.fill ? { type: SH.CLEAR, color: 'auto', fill: o.fill } : undefined,
          margins: { top: 60, bottom: 60, left: 110, right: 110 },
          children: [new P({ alignment: o.align, children: [run(text, { bold: o.bold, color: o.color, size: 20 })] })]
        });
      }
      function table(columns, rows) {
        var header = new Row({ tableHeader: true, children: columns.map(function (c, i) { return cell(tx(c), { fill: PRIM, bold: true, color: ONPRIM, align: i === columns.length - 1 && i > 0 ? AL.RIGHT : AL.LEFT }); }) });
        var trs = (rows || []).map(function (r) {
          return new Row({ children: r.map(function (cv, ci) { return cell(tx(cv), { align: ci === r.length - 1 && ci > 0 ? AL.RIGHT : AL.LEFT }); }) });
        });
        return new Tbl({ width: { size: 100, type: WT.PERCENTAGE }, rows: [header].concat(trs) });
      }
      function protip(tip) {
        return new P({ shading: { type: SH.CLEAR, color: 'auto', fill: noHash(d.primarySofter) }, spacing: { before: 160, after: 120 }, indent: { left: 120, right: 120 }, children: [run('Pro tip  ', { bold: true, color: PRIM, size: 20 }), run(tx(tip), { size: 20 })] });
      }

      /* ---- per-archetype body ---- */
      function buildBody() {
        var out = [];
        var a = data.archetype;
        if (a === 'checklist' || a === 'checklist-getpaid') {
          (data.sections || []).forEach(function (s, i) {
            out.push(new P({ heading: HL.HEADING_2, spacing: { before: 260, after: 90 }, children: [run((i + 1) + '.  ', { bold: true, color: PRIM }), run(tx(cleanHeading(s.heading)))] }));
            (s.items || []).forEach(function (it) { out.push(typeof it === 'string' ? checkItem(it) : checkItem(it.t, it.d)); });
          });
          if (data.messageTemplate && data.messageTemplate.body) { out.push(h2(data.messageTemplate.heading || 'Copy-paste message')); out.push(preBlock(data.messageTemplate.body)); }
          (data.aiPrompts || []).forEach(function (pr) { if (pr && pr.text) { out.push(h2(pr.label || 'AI prompt')); out.push(preBlock(pr.text)); } });
        } else if (a === 'pricing') {
          if (data.structure) { out.push(h2('Recommended pricing structure')); data.structure.forEach(function (x) { out.push(bullet(x)); }); }
          if (data.benchmarks) { out.push(h2('Typical price ranges')); out.push(table(data.benchmarks.columns || [], data.benchmarks.rows || [])); if (data.benchmarksNote) out.push(body(data.benchmarksNote, { spacing: { before: 80, after: 120 } })); }
          if (data.adjust) { out.push(h2('When to adjust your price')); (data.adjust.increase || []).forEach(function (x) { out.push(bullet('Charge more: ' + x)); }); (data.adjust.reduce || []).forEach(function (x) { out.push(bullet('Consider less: ' + x)); }); }
          if (data.formula) { out.push(h2('Your pricing formula')); out.push(preBlock(data.formula.eq + (data.formula.ex ? ('\n\nExample: ' + data.formula.ex) : ''))); }
          if (data.inclusions || data.exclusions) { out.push(h2('What’s included & excluded')); (data.inclusions || []).forEach(function (x) { out.push(bullet('Included: ' + x)); }); (data.exclusions || []).forEach(function (x) { out.push(bullet('Excluded: ' + x)); }); }
          if (data.aiPrompt) { out.push(h2('Benchmark your rates with AI')); out.push(preBlock(data.aiPrompt)); }
        } else if (a === 'email-pack') {
          (data.emails || []).forEach(function (em) { out.push(h2(em.when || 'Email')); if (em.subject) out.push(para([run('Subject: ', { bold: true, size: 21 }), run(tx(em.subject), { size: 21 })], { spacing: { after: 60 } })); out.push(preBlock(em.body || '')); });
        } else if (a === 'prompt-guide') {
          (data.sections || []).forEach(function (s) { out.push(h2(s.heading)); out.push(body(s.body)); });
          if (data.prompt && data.prompt.text) { out.push(h2(data.prompt.label || 'The prompt')); out.push(preBlock(data.prompt.text)); }
          if (data.example && data.example.body) { out.push(h2(data.example.title || 'Example output')); out.push(preBlock(data.example.body)); }
          (data.faq || []).forEach(function (f) { out.push(para(run(f.q, { bold: true, size: 21 }), { spacing: { before: 140, after: 40 } })); out.push(body(f.a)); });
        } else if (a === 'invoice-deposit' || a === 'invoice-multicurrency') {
          out.push.apply(out, invoiceBody());
        } else if (a === 'grid') {
          out.push.apply(out, gridBody());
        } else if (a === 'toolkit') {
          if (data.welcome && (cfg.introText || data.intro)) { out.push(h2(data.welcome.heading || 'Welcome')); out.push(body(cfg.introText || data.intro)); }
          (data.stages || []).forEach(function (s, si) {
            out.push(new P({ heading: HL.HEADING_2, spacing: { before: 260, after: 90 }, children: [run((si + 1) + '.  ', { bold: true, color: PRIM }), run(tx(s.title))] }));
            if (s.intro) out.push(body(s.intro));
            (s.items || []).forEach(function (it) {
              out.push(checkItem(it.t, it.d));
              (it.actions || []).forEach(function (ac) { out.push(new P({ spacing: { after: 40 }, indent: { left: 360 }, children: [run('→ ' + tx(ac.label) + ' — ' + U(ac.url, data, cfg), { size: 18, color: PRIM })] })); });
            });
            if (s.sole) out.push(protip((s.sole.text || 'Recommendation') + (s.sole.note ? (' — ' + s.sole.note) : '') + ' ' + U(s.sole.url, data, cfg)));
          });
        }
        if (data.note) out.push(body(data.note, { spacing: { before: 160, after: 80 } }));
        if (data.proTip) out.push(protip(data.proTip));
        return out;
      }

      function invoiceBody() {
        var out = [];
        var seed = data.seed || {}; var gst = data.gstRate || 0.10;
        var lines = (seed.lines && seed.lines.length) ? seed.lines : [{ desc: 'Description of work or item', qty: 1, price: 0 }];
        out.push(h2('Your business'));
        ['name', 'abn', 'email', 'phone', 'address'].forEach(function (k) { if (seed.business && seed.business[k]) out.push(body(k.toUpperCase() + ': ' + seed.business[k])); });
        out.push(h2('Bill to'));
        out.push(body('(Client name, ABN, email and billing address)'));
        out.push(h2('Line items'));
        var rows = lines.map(function (l) { return [l.desc || '', String(l.qty == null ? '' : l.qty), money(num(l.price)), money(num(l.qty) * num(l.price))]; });
        out.push(table(['Description', 'Qty', 'Unit price (excl. GST)', 'Line total'], rows));
        var sub = lines.reduce(function (s, l) { return s + num(l.qty) * num(l.price); }, 0);
        var g = sub * gst, total = sub + g;
        out.push(body(' ')); out.push(body('Subtotal (excl. GST): ' + money(sub)));
        out.push(body('GST (' + Math.round(gst * 100) + '%): ' + money(g)));
        out.push(para(run('Total (incl. GST): ' + money(total), { bold: true, size: 22 })));
        if (data.depositOptions) { var pct = data.defaultDepositPct || 0.5; out.push(body('Deposit due (' + Math.round(pct * 100) + '%): ' + money(total * pct))); out.push(body('Balance on completion: ' + money(total - total * pct))); }
        out.push(h2('Payment instructions'));
        out.push(body('Pay by bank transfer — BSB, account number and account name. Reference the invoice number.'));
        if (data.gstNote) { out.push(h2('GST for international clients')); out.push(preBlock(data.gstNote)); }
        return out;
      }

      function gridBody() {
        var out = [];
        (data.headerFields || []).forEach(function (f) { out.push(body(f.label + ': ______________________')); });
        if ((data.headerFields || []).length) out.push(body(' '));
        var cols = data.columns || [];
        var header = cols.map(function (c) { return c.label; });
        var blankRow = cols.map(function () { return ''; });
        var rows = []; var seedN = Math.min(data.seedRows || 8, 14);
        for (var i = 0; i < seedN; i++) rows.push(blankRow.slice());
        if ((data.totals || []).length) { var tot = cols.map(function (c, i) { return i === 0 ? 'Total' : ''; }); rows.push(tot); }
        out.push(table(header, rows));
        out.push(body('This is a printable template. For a working spreadsheet with live formulas, use the Excel export.', { spacing: { before: 120 } }));
        return out;
      }

      function cleanHeading(s) { return String(s == null ? '' : s).replace(/^\s*(section|step|part|stage)\s*\d+\s*[:\-–.)]*\s*/i, ''); }

      /* ---- cover section ---- */
      function coverChildren(logo) {
        var cm = coverModel(data, cfg);
        var c = [];
        if (logo) c.push(new P({ spacing: { after: 260 }, children: [new docx.ImageRun({ data: logo.bytes, transformation: { width: Math.min(220, logo.w), height: Math.round(Math.min(220, logo.w) * logo.h / logo.w) } })] }));
        else c.push(new P({ spacing: { after: 200 }, children: [run(cm.orgName, { bold: true, size: 40, color: PRIM })] }));
        c.push(new P({ spacing: { before: 400, after: 100 }, children: [run(String(cm.eyebrow).toUpperCase(), { bold: true, size: 20, color: PRIM, characterSpacing: 30 })] }));
        c.push(new P({ heading: HL.TITLE, spacing: { after: 160 }, children: [run(cm.title, { color: INK })] }));
        if (cm.subtitle) c.push(new P({ spacing: { after: 260 }, children: [run(tx(cm.subtitle), { size: 24, color: MUTED })] }));
        c.push(new P({ spacing: { before: 600, after: 40 }, children: [run('Prepared by ' + cm.orgName, { size: 20, color: INK, bold: true })] }));
        var contact = [cm.contactName, cm.contactEmail, cm.contactPhone].filter(Boolean).join('  ·  ');
        if (contact) c.push(new P({ spacing: { after: 40 }, children: [run(contact, { size: 18, color: MUTED })] }));
        c.push(new P({ children: [run(cm.dateStr, { size: 18, color: MUTED })] }));
        return c;
      }

      return logoPng(cfg).then(function (logo) {
        var sections = [];
        if (wantsCover(data)) sections.push({ children: coverChildren(logo) });
        var main = [];
        // running header lockup on the body section (logo/name)
        if (!wantsCover(data)) {
          if (logo) main.push(new P({ spacing: { after: 200 }, children: [new docx.ImageRun({ data: logo.bytes, transformation: { width: Math.min(150, logo.w), height: Math.round(Math.min(150, logo.w) * logo.h / logo.w) } })] }));
          main.push(new P({ children: [run(String(data.eyebrow || 'Resource').toUpperCase(), { bold: true, size: 18, color: PRIM })] }));
          main.push(new P({ heading: HL.HEADING_1, spacing: { after: 160 }, children: [run(tx(data.title), { color: INK })] }));
        }
        main.push.apply(main, buildBody());
        // closing CTA
        if (cfg.ctaLabel) { main.push(new P({ spacing: { before: 320, after: 40 }, children: [run(tx(data.ctaHeading || 'Want the platform behind this?'), { bold: true, size: 24, color: INK })] })); main.push(body(data.ctaText || '')); main.push(new P({ children: [run(cfg.ctaLabel + '  →  ' + U(cfg.ctaUrl || '', data, cfg), { bold: true, color: PRIM, size: 21 })] })); }
        // footer note
        main.push(new P({ spacing: { before: 320 }, border: { top: { style: docx.BorderStyle.SINGLE, size: 6, color: 'E5E7EB', space: 8 } }, children: [run(cfg.footerNote || '', { size: 16, color: MUTED, italics: true })] }));
        if (cfg.poweredBySole) main.push(new P({ children: [run('Powered by Sole · soleapp.com.au', { size: 16, color: MUTED })] }));
        sections.push({ children: main });

        var doc = new docx.Document({
          creator: cfg.orgName || 'Sole', title: tx(data.title),
          styles: { default: { document: { run: { font: FONT, size: 21, color: INK } } } },
          sections: sections
        });
        return docx.Packer.toBlob(doc);
      }).then(function (blob) {
        if (opts && opts.download) download(blob, fname(data, cfg, 'docx'));
        return blob;
      });
    });
  }

  /* =========================================================================
     XLSX — real working spreadsheet for grid trackers
     ========================================================================= */
  // translate a resource calc formula (arithmetic over column keys, running(),
  // header-rate keys) into an Excel A1 formula for a given data row.
  function translateFormula(formula, excelRow, keyToCol, dataStartExcelRow, headerRefByKey, cols) {
    formula = String(formula || ''); if (!formula) return '';
    var m = formula.match(/^running\(([a-zA-Z0-9_]+)\)$/);
    if (m) { var rc = keyToCol[m[1]]; return rc ? ('SUM($' + rc + '$' + dataStartExcelRow + ':' + rc + excelRow + ')') : ''; }
    // time subtraction between two text time columns → hours
    var timeKey = {}; (cols || []).forEach(function (c) { if (c.type === 'text' && /time|start|end|finish|clock/i.test(c.key + ' ' + (c.label || ''))) timeKey[c.key] = 1; });
    var sub = formula.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*-\s*([a-zA-Z_][a-zA-Z0-9_]*)$/);
    if (sub && timeKey[sub[1]] && timeKey[sub[2]] && keyToCol[sub[1]] && keyToCol[sub[2]]) {
      return '(TIMEVALUE(' + keyToCol[sub[1]] + excelRow + ')-TIMEVALUE(' + keyToCol[sub[2]] + excelRow + '))*24';
    }
    var out = formula.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, function (tok) {
      if (keyToCol[tok]) return keyToCol[tok] + excelRow;
      if (headerRefByKey && headerRefByKey[tok]) return headerRefByKey[tok]; // absolute $B$n
      return tok;
    });
    return /^[-+*/().\d\s A-Za-z$:,]*$/.test(out) ? out : '';
  }

  function exportXlsx(data, cfg, opts) {
    return LIB.xlsx().then(function (XLSX) {
      var cols = data.columns || [];
      var headerFields = data.headerFields || [];
      var ws = {}; var maxR = 0, maxC = 0;
      var tx = function (s) { return T(s, data, cfg); };
      function put(r, c, cell) { ws[XLSX.utils.encode_cell({ r: r, c: c })] = cell; if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
      var R = 0;
      put(R, 0, { t: 's', v: tx(data.title) }); R += 2;
      // header fields: label in A, editable value in B (pre-filled from default)
      var headerRefByKey = {};
      headerFields.forEach(function (f) {
        put(R, 0, { t: 's', v: tx(f.label) });
        var dv = f.default != null && f.default !== '' ? num(f.default) : null;
        put(R, 1, dv != null ? { t: 'n', v: dv } : { t: 's', v: '' });
        headerRefByKey[f.key] = '$B$' + (R + 1);
        R++;
      });
      if (headerFields.length) R++; // spacer
      var HEADER_ROW = R;                       // 0-based
      cols.forEach(function (c, ci) { put(HEADER_ROW, ci, { t: 's', v: tx(c.label) }); if (ci > maxC) maxC = ci; });
      var DATA_START0 = HEADER_ROW + 1;         // 0-based first data row
      var dataStartExcel = DATA_START0 + 1;     // 1-based
      var keyToCol = {}; cols.forEach(function (c, ci) { keyToCol[c.key] = XLSX.utils.encode_col(ci); });
      var seedN = data.seedRows || 8;
      var lastDataRow0 = DATA_START0 + seedN - 1;
      for (var i = 0; i < seedN; i++) {
        var r0 = DATA_START0 + i, excelRow = r0 + 1;
        cols.forEach(function (c, ci) {
          // formula cells NEED a cached value `v` or SheetJS 0.18.5 drops them on write;
          // fullCalcOnLoad (below) makes Excel replace the 0 with the real result on open.
          if (c.type === 'calc') { var f = translateFormula(c.formula, excelRow, keyToCol, dataStartExcel, headerRefByKey, cols); put(r0, ci, f ? { t: 'n', f: f, v: 0 } : { t: 'n', v: 0 }); }
          else if (c.type === 'num') { /* leave blank for the user to fill */ }
          else put(r0, ci, { t: 's', v: '' });
        });
      }
      // totals row
      if ((data.totals || []).length) {
        var tr = lastDataRow0 + 1;
        put(tr, 0, { t: 's', v: 'Total' });
        (data.totals || []).forEach(function (k) {
          var ci = -1; cols.forEach(function (c, j) { if (c.key === k) ci = j; });
          if (ci >= 0) { var col = XLSX.utils.encode_col(ci); put(tr, ci, { t: 'n', f: 'SUM(' + col + dataStartExcel + ':' + col + (lastDataRow0 + 1) + ')', v: 0 }); }
        });
      }
      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: Math.max(maxC, cols.length - 1) } });
      ws['!cols'] = cols.map(function (c) { return { wch: /desc|name|note|detail/i.test(c.key) ? 26 : 14 }; });
      ws['!freeze'] = { xSplit: 0, ySplit: DATA_START0, topLeftCell: XLSX.utils.encode_cell({ r: DATA_START0, c: 0 }), state: 'frozen' };
      // brand-fill the column-header row (honoured by Excel/desktop viewers)
      var d = SB.deriveBrand(cfg);
      cols.forEach(function (c, ci) {
        var addr = XLSX.utils.encode_cell({ r: HEADER_ROW, c: ci }); if (!ws[addr]) return;
        ws[addr].s = { fill: { patternType: 'solid', fgColor: { rgb: 'FF' + noHash(d.primary) } }, font: { bold: true, color: { rgb: 'FF' + noHash(d.onPrimary) } } };
      });
      var wb = XLSX.utils.book_new();
      wb.Workbook = { CalcPr: { fullCalcOnLoad: true } }; // recalc formulas on open (replace cached 0s)
      XLSX.utils.book_append_sheet(wb, ws, (data.title || 'Sheet').replace(/[^\w ]/g, '').slice(0, 28) || 'Sheet');
      var arr = XLSX.write(wb, { type: 'array', bookType: 'xlsx', cellStyles: true });
      var blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (opts && opts.download) download(blob, fname(data, cfg, 'xlsx'));
      return blob;
    });
  }

  global.SoleExport = {
    canExport: canExport,
    coverModel: coverModel,
    exportPdf: exportPdf,
    exportDocx: exportDocx,
    exportXlsx: exportXlsx,
    translateFormula: translateFormula,
    download: download
  };
})(typeof window !== 'undefined' ? window : this);
