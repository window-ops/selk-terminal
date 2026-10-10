/* Interface sounds: the click, typing, the result tones (tick, ok, error,
   chime, unlock), telemetry blips and the sweep, and the control sounds of
   Setup > Sound > Control sounds, one per kind of control.

   Every noise burst here reads the noise buffer from the same point
   (OFFSET), so a control sounds the same each time it is pressed. Every
   sound waits for a suspended audio context to resume (K.ready), so the
   first press after loading or after a hidden tab is not lost. */
(function () {
  var S = window.SELK, K = S.snd.kit, lastKey = 0, OFFSET = 0.5;
  /* A burst at the fixed offset, on the interface bus */
  function b(freq, q, vol, dur, when, type) {
    K.burst(freq, q, vol, dur, when, type, null, null, OFFSET);
  }
  var t = K.tone;
  /* The click is a press and a release. A mouse or pen plays them apart,
     as its button goes down and comes up (ui-sound.js); everything else
     plays them 35 ms apart */
  function press() { b(3200, 2.5, 0.32, 0.018); }
  function lift(when) { b(1100, 1.2, 0.15, 0.03, when); }
  function click() {
    press(); lift(0.035);
  }
  /* True when sound is on in Setup and in the status bar */
  function live() {
    return K.on() && !(S.state && !S.state.sound);
  }
  /* Control sounds, one per kind of control. ui-sound.js reads the kind from
     the data-sound attribute. Each lasts 25 ms or more and is within about
     2 dB of the click. A kind names the control, not the outcome: the game
     plays ok, error or unlock when the result is known. */
  var UI = {
    key: function () { b(2400, 1.2, 0.22, 0.03); b(900, 1, 0.12, 0.04, 0.012); t(150, 0.06, "triangle", 0.06); },
    toggle: function () { b(3800, 2.5, 0.26, 0.025); b(2400, 2.5, 0.26, 0.03, 0.05); },
    fold: function () { b(600, 0.8, 0.22, 0.07, 0, "lowpass"); t(300, 0.08, "triangle", 0.05, 0, 450); },
    page: function () { b(3200, 2.5, 0.16, 0.018); t(620, 0.06, "triangle", 0.062, 0.01); t(930, 0.07, "triangle", 0.055, 0.065); },
    back: function () { b(3200, 2.5, 0.16, 0.018); t(930, 0.06, "triangle", 0.062, 0.01); t(620, 0.07, "triangle", 0.055, 0.065); },
    close: function () { b(2600, 2, 0.16, 0.02); t(700, 0.1, "triangle", 0.048, 0.005, 330); },
    action: function () { b(3000, 2, 0.24, 0.025); b(1200, 1.2, 0.15, 0.04, 0.02); t(220, 0.06, "triangle", 0.05); },
    menu: function () { b(5200, 3, 0.24, 0.025); t(1800, 0.04, "sine", 0.042); },
    tab: function () { b(1500, 4, 0.25, 0.03); t(480, 0.06, "triangle", 0.062); },
    open: function () { b(3200, 2.5, 0.15, 0.018); t(500, 0.09, "triangle", 0.05, 0.005, 760); },
    /* An on/off switch: a firm snap, then a short tone */
    switch: function () { b(4200, 3, 0.26, 0.022); t(740, 0.05, "square", 0.03, 0.02); },
    /* One answer picked from several: a soft press and a rising step */
    choice: function () { b(2800, 2, 0.2, 0.025); t(520, 0.05, "triangle", 0.055, 0.01); t(780, 0.05, "triangle", 0.05, 0.05); },
    /* A card turned over: a swish down in pitch */
    flip: function () { b(5200, 1.2, 0.16, 0.09, 0, "highpass"); b(1800, 1.5, 0.12, 0.08, 0.04); t(420, 0.08, "triangle", 0.04, 0.02, 300); },
    /* A command link in the shell or VIEW: a light tick */
    link: function () { b(4600, 3, 0.2, 0.02); t(1100, 0.03, "sine", 0.04); },
    /* A row or a blank chosen in a list: a dry tap */
    select: function () { b(2000, 2.5, 0.24, 0.025); t(360, 0.04, "triangle", 0.05); },
    /* The pitch follows the slider's value, 0 to 100 */
    slide: function (v) { t(400 + (+v || 0) * 10, 0.035, "square", 0.042); }
  };
  S.snd.UI_KINDS = Object.keys(UI);
  S.snd.key = function () {
    if (!live()) {
      return;
    }
    var now = Date.now();
    if (now - lastKey < 25) {
      return;
    }
    lastKey = now;
    K.ready(function () {
      K.burst(1800 + Math.random() * 1800, 1.4, 0.38, 0.035);
      t(160 + Math.random() * 40, 0.03, "triangle", 0.05);
    });
  };
  S.snd.click = function () {
    if (!live()) { return; }
    K.ready(click);
  };
  /* The click's two halves, for a mouse or pen press. lift(delay) plays
     the release delay seconds from now */
  S.snd.press = function () {
    if (!live()) { return; }
    K.ready(press);
  };
  S.snd.lift = function (delay) {
    if (!live()) { return; }
    K.ready(function () { lift(delay || 0); });
  };
  /* The sound of a kind of control; an unknown kind clicks */
  S.snd.ui = function (kind, value) {
    if (!live()) { return; }
    K.ready(function () { (UI[kind] || click)(value); });
  };
  S.snd.tick = function () {
    if (!K.on()) return; K.ready(function () { t(1320, 0.03, "square", 0.045); });
  };
  S.snd.ok = function () {
    if (!K.on()) return; K.ready(function () { t(880, 0.06, "square", 0.04); t(1320, 0.08, "square", 0.04, 0.07); });
  };
  S.snd.error = function () {
    if (!K.on()) return; K.ready(function () { t(220, 0.16, "square", 0.06); t(165, 0.2, "square", 0.05, 0.13); });
  };
  S.snd.chime = function () {
    if (!K.on()) return; K.ready(function () { t(988, 0.14, "sine", 0.09); t(1319, 0.22, "sine", 0.08, 0.12); t(1976, 0.3, "sine", 0.04, 0.26); });
  };
  S.snd.unlock = function () {
    if (!K.on()) return;
    K.ready(function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        t(f, 0.12, "square", 0.04, i * 0.08);
      });
    });
  };
  S.snd.blip = function () {
    if (S.snd.led) { S.snd.led(); }
    if (!K.on()) return; t(1600 + Math.random() * 900, 0.05, "square", 0.025);
  };
  S.snd.sweep = function () {
    if (!K.on()) return; t(300, 0.5, "sawtooth", 0.025, 0, 2400);
  };
})();
