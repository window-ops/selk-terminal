/* Ending scenes on the drawings page: every pixel scene from the finale,
   grouped by ending under the ending's name in the reader's language. Each
   shows its first frame (with reduced motion, the still frame the game
   shows). The buttons on the picture play it from the start or stop it,
   and ZOOM opens it large with the same buttons. A play stops by itself
   after about the time the game shows the scene, and runs even with
   reduced motion, since the reader asks for it. */
(function () {
  "use strict";
  var S = window.SELK;
  S.reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  /* Milliseconds a play runs: the dismantling to its end, others 12 s */
  var RUN = { "dismantle:0": 16000 };
  function button(text, cls, name) {
    var b = S.el("button", "scene-button " + cls, S.t(text));
    b.type = "button"; b.setAttribute("aria-label", S.t(text) + ", " + name);
    return b;
  }
  /* The buttons over a scene's picture; zoom, when given, opens it large */
  function controls(sc, key, name, zoom) {
    var bar = S.el("div", "scene-controls"), play = button("PLAY", "scene-play", name), timer = null;
    function label(text) { play.textContent = S.t(text); play.setAttribute("aria-label", S.t(text) + ", " + name); }
    function stop(text) { clearTimeout(timer); timer = null; sc.stop(); label(text); }
    play.addEventListener("click", function () {
      if (timer) { stop("PLAY"); return; }
      var reduced = S.reduced;
      S.reduced = false; sc.stop(); sc.start(); S.reduced = reduced;
      label("STOP");
      timer = setTimeout(function () { stop("REPLAY"); }, RUN[key] || 12000);
    });
    bar.appendChild(play);
    if (zoom) {
      var z = button("ZOOM", "scene-zoom-open", name);
      z.addEventListener("click", function () { if (timer) { stop("PLAY"); } zoom(); });
      bar.appendChild(z);
    }
    return { el: bar, stop: function () { if (timer) { stop("PLAY"); } } };
  }
  /* The large view: a dialog with its own copy of the scene */
  function zoomView(id, n, name) {
    var dlg = S.el("dialog", "scene-zoom"), sc = S.scenes.make(id, n), item = S.el("div", "scene-item");
    sc.el.setAttribute("aria-label", name + ": " + S.scenes.describe(id, n));
    dlg.setAttribute("aria-label", name);
    item.appendChild(sc.el); sc.start(); sc.stop();
    var ctl = controls(sc, id + ":" + n, name), close = button("CLOSE", "scene-close", name);
    ctl.el.appendChild(close);
    item.appendChild(ctl.el); dlg.appendChild(item);
    close.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("close", function () { ctl.stop(); dlg.remove(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) { dlg.close(); } });
    document.body.appendChild(dlg);
    dlg.showModal();
  }
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
        var sc = S.scenes.make(gr[0], n), item = S.el("div", "scene-item"), name = gr[1] + ", " + (n + 1);
        sc.el.setAttribute("aria-label", name + ": " + S.scenes.describe(gr[0], n));
        item.appendChild(sc.el);
        sc.start(); sc.stop();
        item.appendChild(controls(sc, gr[0] + ":" + n, name, zoomView.bind(null, gr[0], n, name)).el);
        grid.appendChild(item);
      }
      host.appendChild(grid);
    });
  });
})();
