/* Sole Academy: the one markdown converter for help articles.
   Loaded by Academy Studio (a <script> tag) and by the Node generator
   scripts/build-academy-articles.js (require), so the HTML a learner reads is
   produced by exactly the same code whether it came from the knowledge-base
   seed or from someone typing in the Studio.

   Deliberately small: headings, paragraphs, nested bullet and numbered lists,
   bold, italic, inline code and https links. Anything else is shown as text.
   Every character of input is escaped before any markup is added, so an
   article can never inject a script into the Academy. */
(function (root) {
  'use strict';
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var inline = function (s) {
    var out = esc(s);
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
    out = out.replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return out;
  };
  var LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  var HEAD = /^\s*#{1,6}\s+(.*)$/;

  function toHtml(md) {
    var lines = String(md || '').replace(/\r/g, '').split('\n');
    var out = [], para = [], stack = [];
    var flushPara = function () { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
    var closeAbove = function (indent) {
      while (stack.length && stack[stack.length - 1].indent > indent) out.push('</li></' + stack.pop().type + '>');
    };
    var closeAll = function () { closeAbove(-1); };
    lines.forEach(function (raw) {
      if (!raw.trim()) { flushPara(); closeAll(); return; }
      var h = raw.match(HEAD);
      if (h) { flushPara(); closeAll(); out.push('<h3>' + inline(h[1].trim()) + '</h3>'); return; }
      var m = raw.match(LIST);
      if (m) {
        flushPara();
        var indent = m[1].replace(/\t/g, '  ').length;
        var type = /\d/.test(m[2]) ? 'ol' : 'ul';
        closeAbove(indent);
        var top = stack[stack.length - 1];
        if (top && top.indent === indent) {
          if (top.type === type) out.push('</li><li>');
          else { out.push('</li></' + stack.pop().type + '>'); out.push('<' + type + '><li>'); stack.push({ type: type, indent: indent }); }
        } else {
          out.push('<' + type + '><li>');
          stack.push({ type: type, indent: indent });
        }
        out.push(inline(m[3].trim()));
        return;
      }
      // Indented text under a list item continues that item; anything else
      // ends the list and starts (or continues) a paragraph.
      if (stack.length && /^\s+/.test(raw)) { out.push(' ' + inline(raw.trim())); return; }
      closeAll();
      para.push(raw.trim().replace(/^>\s?/, ''));
    });
    flushPara(); closeAll();
    return out.join('');
  }

  // Plain text, for search and for anything (a chatbot) that wants words only.
  function toText(md) {
    return String(md || '').replace(/\r/g, '')
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/^\s*([-*+]|\d+[.)])\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '\n').trim();
  }

  var api = { toHtml: toHtml, toText: toText };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SoleAcademyMarkdown = api;
})(typeof window !== 'undefined' ? window : null);
