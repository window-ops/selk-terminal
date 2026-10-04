/* TROIKA.RUN (core.js): a key for testing the ending without playing the
   run. While Setup > Debug > Debug panel or Fast mode is on, End skips
   the remaining gates and moves the run to 4 s before 2016 with a clear
   road, so the building comes along the street and the ending follows.
   Pressed during the ending it does nothing. The choices skipped leave
   their lasting effects unchanged. */
(function () {
  var S = window.SELK, T = S.troikaGame;
  T.debugOn = function () {
    var s = S.state && S.state.settings;
    return !!((s && s.debug) || S.fast);
  };
  T.skipToEnd = function () {
    var st = T.st;
    if (!st || st.over || st.end || !T.debugOn()) { return; }
    var stopped = !T.running();
    if (st.paused) {
      st.paused = false;
      T.q(".troika-gate").hidden = true;
      if (S.snd.troika) { S.snd.troika.pause(false); }
    }
    if (st.hold) {
      st.hold = false;
      T.q(".troika-pause").hidden = true;
      T.q(".troika-stage").classList.remove("held");
      if (S.snd.troika) { S.snd.troika.pause(false); }
    }
    st.nextGate = st.gates.length;
    st.t = T.END - 4;
    st.obstacles = []; st.platforms = []; st.door = null; st.spawnAt = Infinity;
    st.y = 0; st.vy = 0; st.on = true; st.jumps = 0; st.crash = false;
    st.gap = Math.max(st.gap, 0.4);
    st.banner = S.t("Debug: skipped to the end of 2015."); st.bannerT = st.bannerLen = 3;
    T.rows();
    T.cv.focus({ preventScroll: true });
    if (stopped) { T.resume(); }
  };
})();
