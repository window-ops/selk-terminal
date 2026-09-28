/* DOM helpers shared by every module: S.$(id) and S.el(tag, className, text). */
(function () {
  var S = window.SELK = window.SELK || {};
  S.$ = function (id) {
    return document.getElementById(id);
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
