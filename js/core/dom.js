/* DOM helpers shared by every module: S.$(id) and S.el(tag, className, text). */
(function () {
  var S = window.SELK = window.SELK || {};
  S.$ = function (id) {
    return document.getElementById(id);
  };
  /* Run fn, then restore the scroll position of box, of every scrolling
     ancestor and of the page. Without this a pane that rebuilds its content
     jumps: some browsers clamp the position while the content is empty, and
     some move the view when the focus returns, even with preventScroll. */
  S.keepScroll = function (box, fn) {
    var saved = [], n = box;
    while (n && n.nodeType === 1) {
      if (n.scrollTop || n.scrollLeft || n === box) { saved.push([n, n.scrollTop, n.scrollLeft]); }
      n = n.parentNode;
    }
    var wx = window.scrollX, wy = window.scrollY;
    try {
      return fn();
    } finally {
      saved.forEach(function (s) {
        if (s[0].scrollTop !== s[1]) { s[0].scrollTop = s[1]; }
        if (s[0].scrollLeft !== s[2]) { s[0].scrollLeft = s[2]; }
      });
      if (window.scrollX !== wx || window.scrollY !== wy) { window.scrollTo(wx, wy); }
    }
  };
  /* Screen readers read ">" as "greater". Text that uses it as a separator
     keeps it on screen, hidden from them, with a spoken word in its place:
     "to" in mail headings, "becomes" in chemical formulas, and a pause in
     paths such as "Setup > Saved data". */
  function word(text, mode) {
    var t = S.t || function (x) { return x; };
    if (mode === "to") { return " " + t("to") + " "; }
    if (mode === "formula" || (!mode && /\+/.test(text))) { return " " + t("becomes") + " "; }
    return ", ";
  }
  S.spoken = function (text, mode) {
    return String(text).split(" > ").join(word(text, mode));
  };
  S.speakInto = function (parent, text, mode) {
    var parts = String(text).split(" > "), w = word(text, mode);
    parts.forEach(function (p, i) {
      parent.appendChild(document.createTextNode(p));
      if (i < parts.length - 1) {
        var shown = document.createElement("span"); shown.setAttribute("aria-hidden", "true"); shown.textContent = " > ";
        var said = document.createElement("span"); said.className = "sr-only"; said.textContent = w;
        parent.appendChild(shown); parent.appendChild(said);
      }
    });
    return parent;
  };
  S.speakText = function (node, text, mode) {
    node.textContent = "";
    return S.speakInto(node, text, mode);
  };
  S.el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) {
      n.className = cls;
    }
    if (text != null) {
      n.textContent = text;
    }
    return n;
  };
  /* Pretty wrap: join the last word of a text block to the word before it
     with a no-break space, so the last line has two words at least. Setup
     tooltips always use it; Setup > Display > Pretty wrap
     (settings.prettyWrap) applies it to every text block through
     S.prettyWrap. The words may sit in different text nodes, as when a
     block ends with a link or a handbook term: the last breakable space of
     the whole block is replaced, in whichever node holds it. A browser may
     still break before a link or term, a button laid out as an inline
     block, so when one follows the space, the space and what follows it
     go into a span.pw-keep that does not wrap (css/ui/base.css).
     Returns the changed text node, or null. */
  var SPACE = /[ \t\n\r\f]/;
  S.wrapLast = function (node) {
    if (node._pwText != null && node.textContent === node._pwText) { return null; }
    var walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = walk.nextNode())) { list.push(n); }
    /* From the end: skip trailing space, pass the last word, then find the
       space before it, and require a word before that space */
    var stage = 0, hit = null, at = -1;
    for (var k = list.length - 1; k >= 0 && stage < 3; k--) {
      var v = list[k].nodeValue;
      for (var c = v.length - 1; c >= 0; c--) {
        var sp = SPACE.test(v.charAt(c));
        if (stage === 0 && !sp) { stage = 1; }
        else if (stage === 1 && sp) { stage = 2; hit = list[k]; at = c; }
        else if (stage === 2 && !sp) { stage = 3; break; }
      }
    }
    if (stage < 3) { return null; }
    var text = hit.nodeValue, start = at;
    while (start > 0 && SPACE.test(text.charAt(start - 1))) { start--; }
    if (hit._pwOrig == null || hit._pwVal !== text) { hit._pwOrig = text; }
    var rest = "\u00a0" + text.slice(at + 1), after = [];
    for (var x = hit.nextSibling; x; x = x.nextSibling) { after.push(x); }
    if (hit.parentNode === node && after.some(function (y) { return y.nodeType === 1; })) {
      var keep = document.createElement("span");
      keep.className = "pw-keep";
      keep.appendChild(document.createTextNode(rest));
      after.forEach(function (y) { keep.appendChild(y); });
      node.appendChild(keep);
      hit._pwVal = hit.nodeValue = text.slice(0, start);
    } else {
      hit._pwVal = hit.nodeValue = text.slice(0, start) + rest;
    }
    node._pwText = node.textContent;
    return hit;
  };
  /* The text blocks Pretty wrap acts on. New blocks are wrapped as they are
     added, and S.scr.reveal wraps shell, VIEW and MESSAGE text before it is
     revealed. Turning the option off walks the page once and restores every
     text that has not changed since; no list of changed texts is kept, so
     lines that leave the page are not held in memory. */
  var WRAP_BLOCKS = "p, li, dd, .ln, .note-text, .note-source, .mail-toast-body, .status-info-copy, .set-note, .set-why, .cine-caption, .dlg-body > div:not([class])";
  var wrapObs = null;
  function wrapIn(root) {
    if (!root || !root.querySelectorAll) { return; }
    var list = [].slice.call(root.querySelectorAll(WRAP_BLOCKS));
    if (root.matches && root.matches(WRAP_BLOCKS)) { list.unshift(root); }
    list.forEach(function (b) { S.wrapLast(b); });
  }
  S.prettyWrap = {
    on: false,
    within: function (root) { if (S.prettyWrap.on) { wrapIn(root); } },
    apply: function (on) {
      if (on === S.prettyWrap.on) { return; }
      S.prettyWrap.on = on;
      if (on) {
        wrapIn(document.body);
        wrapObs = new MutationObserver(function (list) {
          list.forEach(function (m) { [].forEach.call(m.addedNodes, function (x) { if (x.nodeType === 1) { wrapIn(x); } }); });
        });
        wrapObs.observe(document.body, { childList: true, subtree: true });
      } else {
        if (wrapObs) { wrapObs.disconnect(); wrapObs = null; }
        /* A kept span gives back its content, without its first text,
           which the restored text node holds again */
        [].forEach.call(document.querySelectorAll("span.pw-keep"), function (k) {
          var host = k.parentNode;
          k.removeChild(k.firstChild);
          while (k.firstChild) { host.insertBefore(k.firstChild, k); }
          host.removeChild(k);
        });
        var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), x;
        while ((x = walk.nextNode())) {
          if (x._pwVal != null) {
            if (x.nodeValue === x._pwVal) { x.nodeValue = x._pwOrig; }
            x._pwVal = null; x._pwOrig = null;
          }
        }
      }
    }
  };
})();
