/* DOM helpers shared by every module: S.$(id) and S.el(tag, className, text). */
(function () {
  var S = window.SELK = window.SELK || {};
  S.$ = function (id) {
    return document.getElementById(id);
  };
  /* Run fn, then put back the scroll position of box, of every scrolling
     ancestor and of the page. A pane that rebuilds its content (a new message,
     a report page) otherwise jumps: some browsers clamp the position while the
     content is empty, and some move the view when focus returns, even with
     preventScroll */
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
     "to" in mail headings, "becomes" in chemical formulas (they carry "+"),
     and a pause for paths such as "Setup > Saved data". */
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
})();
