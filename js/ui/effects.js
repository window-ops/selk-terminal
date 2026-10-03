/* Screen effects: S.applySettings() turns settings into classes and sound
   levels, and S.previewInterference() shows the gust shake. */
(function () {
  var S = window.SELK;
  var interferenceTimer = null;
  S.previewInterference = function (enabled) {
    var screen = document.getElementById("screen");
    if (!screen) {
      return;
    }
    clearTimeout(interferenceTimer);
    if (enabled === false || !S.state.settings.interfere) {
      screen.classList.remove("interfere");
      return;
    }
    screen.classList.remove("interfere");
    void screen.offsetWidth;
    screen.classList.add("interfere");
    interferenceTimer = setTimeout(function () {
      screen.classList.remove("interfere");
    }, 550);
  };
  S.applySettings = function () {
    var s = S.state.settings, b = document.body, scr = document.getElementById("screen");
    S.syncContext();
    b.classList.toggle("frameless", s.frame === "full");
    b.classList.toggle("no-scan", !s.scan);
    b.classList.toggle("no-flicker", !s.flicker);
    b.classList.toggle("no-glow", !s.glow);
    b.classList.toggle("pretty-wrap", !!s.prettyWrap);
    if (S.prettyWrap) { S.prettyWrap.apply(!!s.prettyWrap); }
    b.classList.toggle("no-poweron", !s.poweron);
    b.classList.remove("dragging", "moving", "resizing", "scroll-panning");
    document.documentElement.classList.remove("dragging", "scroll-panning");
    b.classList.remove("cur-s", "cur-m", "cur-l", "cur-sys");
    b.classList.add("cur-" + (s.cursor || "m"));
    scr.classList.remove("size-s", "size-m", "size-l");
    scr.classList.add("size-" + s.size);
    S.snd.apply();
  };
})();
