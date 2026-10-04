/* TROIKA.RUN (core.js): the gate of each year, which pauses the run with a
   decision, the pause panel, and the end card. */
(function () {
  var S = window.SELK, T = S.troikaGame;
  function apply(flag) {
    var f = T.st.flags;
    if (flag === "laws") { f.laws++; }
    else if (flag === "yields") { f.yields++; }
    else if (flag === "drachma") { f.runs = true; f.yields++; }
    else if (flag) { f[flag] = true; }
  }
  T.choose = function (i) {
    var st = T.st;
    if (!st || !st.paused) { return; }
    var gate = st.gates[st.nextGate], c = i === 0 ? gate.a : gate.b;
    st.gap = Math.max(0, Math.min(1, st.gap + c[1]));
    st.speed = c[2]; st.spacing = c[3];
    apply(c[4]);
    st.banner = c[5]; st.bannerT = st.bannerLen = 4;
    st.nextGate++; st.paused = false;
    T.q(".troika-gate").hidden = true;
    if (S.announce) { S.announce(c[0] + ". " + c[5]); }
    if (S.snd && S.snd.ok) { S.snd.ok(); }
    if (S.snd.troika) { S.snd.troika.pause(false); }
    T.cv.focus({ preventScroll: true });
    T.resume();
  };
  /* Pauses the run or resumes it, with a panel over the canvas */
  T.hold = function (on) {
    var st = T.st;
    if (!st || st.paused || st.over || st.hold === on) { return; }
    st.hold = on; st.duck = false; st.keys = {};
    T.q(".troika-pause").hidden = !on;
    /* The panels under the pause panel take no pointer while it is up */
    T.q(".troika-stage").classList.toggle("held", on);
    T.music("pause", on);
    if (on) {
      /* The focus goes to the panel, not RESUME, so no button lights up;
         Escape resumes and Tab reaches the buttons */
      T.q(".troika-pause").focus({ preventScroll: true });
    } else {
      T.focusPlay();
      T.resume();
    }
  };
  /* Calls what on the soundtrack and on both themes of the ending, those
     that are playing */
  T.music = function (what, arg) {
    [S.snd.troika, S.snd.troikaOffice, S.snd.troikaCoda].forEach(function (m) { if (m && m[what]) { m[what](arg); } });
  };
  /* Pauses the run at a gate and shows its event and choices */
  T.showGate = function () {
    var st = T.st, gate = st.gates[st.nextGate], p = T.q(".troika-gate");
    st.paused = true; st.duck = false; st.gateAt = performance.now();
    p.querySelector(".troika-gate-text").textContent = gate.text;
    var btns = p.querySelectorAll("button");
    btns[0].textContent = "1. " + gate.a[0];
    btns[1].textContent = "2. " + gate.b[0];
    p.hidden = false;
    /* The focus goes to the panel, not a choice, so no key held from the run
       picks one; Tab reaches the choices */
    p.focus({ preventScroll: true });
    if (S.announce) { S.announce(gate.text); }
    if (S.snd.troika) { S.snd.troika.pause(true); }
  };
  /* The end card: text, the score, and PLAY AGAIN or TRY AGAIN with CLOSE */
  T.endCard = function (text, won) {
    var st = T.st, p = T.q(".troika-end");
    st.over = true;
    /* The run's music stops; a theme of the ending still playing fades */
    if (S.snd.troika) { S.snd.troika.stop(); }
    T.music("fade", 1.5);
    p.querySelector(".troika-end-text").textContent = text;
    p.querySelector(".troika-end-score").textContent = S.t("Obstacles cleared: {cleared}. Obstacles hit: {hits}.", { cleared: st.cleared, hits: st.hits });
    p.querySelector(".troika-again").textContent = won ? S.t("PLAY AGAIN") : S.t("TRY AGAIN");
    p.hidden = false;
    /* The focus goes to the card, not its first button, so no button lights
       up; Tab reaches them */
    p.focus({ preventScroll: true });
    if (S.announce) { S.announce(text); }
    if (S.snd) { (won ? S.snd.chime : S.snd.error)(); }
  };
  /* The run ends before 2016: the Troika caught Greece, or Greece ran into
     a tranche */
  T.finish = function () {
    var st = T.st, year = 2010 + T.yearOf(st.t);
    T.endCard(st.crash ? S.t("In {year} Greece missed the conditions of a loan tranche: the money was withheld and the Troika caught up.", { year: year }) :
      S.t("The Troika caught up with Greece in {year}.", { year: year }), false);
  };
})();
