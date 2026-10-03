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
     S.prettyWrap. Returns the changed text node, or null. */
  S.wrapLast = function (node) {
    var walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), n, last = null;
    while ((n = walk.nextNode())) { if (n.nodeValue.trim()) { last = n; } }
    if (!last || last._pwVal === last.nodeValue) { return null; }
    var text = last.nodeValue, match = /(\s+)(\S+)(\s*)$/.exec(text);
    if (!match) { return null; }
    var prefix = text.slice(0, match.index);
    if (!/\S[\s\S]*\s\S/.test(prefix + match[2])) { return null; }
    last._pwOrig = text;
    last._pwVal = last.nodeValue = prefix + "\u00a0" + match[2] + match[3];
    return last;
  };
  /* The text blocks Pretty wrap acts on. New blocks are wrapped as they are
     added, and S.scr.reveal wraps shell, VIEW and MESSAGE text before it is
     revealed. Turning the option off restores every text that has not changed
     since. */
  var WRAP_BLOCKS = "p, li, dd, .ln, .mail-toast-body, .status-info-copy, .set-note, .set-why, .cine-caption, .dlg-body > div:not([class])";
  var wrapped = new Set(), wrapObs = null;
  function wrapIn(root) {
    if (!root || !root.querySelectorAll) { return; }
    var list = [].slice.call(root.querySelectorAll(WRAP_BLOCKS));
    if (root.matches && root.matches(WRAP_BLOCKS)) { list.unshift(root); }
    list.forEach(function (b) { var n = S.wrapLast(b); if (n) { wrapped.add(n); } });
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
        wrapped.forEach(function (x) { if (x.nodeValue === x._pwVal) { x.nodeValue = x._pwOrig; } x._pwVal = null; });
        wrapped.clear();
      }
    }
  };
})();
