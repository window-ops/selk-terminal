/* DOM helpers shared by every module: S.$(id) and S.el(tag, className, text). */
(function () {
  var S = window.SELK = window.SELK || {};
  S.$ = function (id) {
    return document.getElementById(id);
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
