/* Ending scenes on the drawings page: every pixel scene from the finale,
   grouped by ending under the ending's name in the reader's language. The
   scenes move unless the reader's system asks for reduced motion. */
(function () {
  "use strict";
  var S = window.SELK;
  S.reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  S.i18n.ready.then(function () {
    var host = document.getElementById("ending-scenes");
    if (!host || !S.scenes) {
      return;
    }
    host.appendChild(S.el("h2", "", S.t("Ending scenes")));
    host.appendChild(S.el("p", "warn", S.t("These pictures show every ending.")));
    var groups = [["intro", S.t("FINAL DECISION")]];
    (S.ENDINGS || []).forEach(function (e) {
      if (e.choice) {
        groups.push([e.yes.id, e.label + ": " + e.yes.title]);
        groups.push([e.no.id, e.label + ": " + e.no.title]);
      } else {
        groups.push([e.id, e.label]);
      }
    });
    groups.forEach(function (gr) {
      host.appendChild(S.el("h3", "", gr[1]));
      var grid = S.el("div", "scene-grid");
      for (var n = 0; n < S.scenes.count(gr[0]); n++) {
        var sc = S.scenes.make(gr[0], n);
        sc.el.setAttribute("aria-label", gr[1] + ", " + (n + 1) + ": " + S.scenes.describe(gr[0], n));
        grid.appendChild(sc.el);
        sc.start();
      }
      host.appendChild(grid);
    });
  });
})();
