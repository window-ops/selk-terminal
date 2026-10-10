/* The soundtrack of TROIKA.RUN (js/games/troika/): a chiptune loop in the
   hijaz mode on D (D, E flat, F sharp, G, A, B flat, C), eight bars of
   eighth notes at 132 beats a minute. The bass plucks a 3-3-2 rhythm. Each
   year of the run adds a layer: the melody, the hi-hat, an arpeggio, the
   melody an octave up, and a third kick. The tempo rises by up to 15% as
   the Troika closes in. At a gate the loop stops and a drone on D and A
   holds until the run goes on. At the end of the run the loop finishes
   its bar and closes on a last D (finish) rather than stopping at once. The music plays on the
   music channel. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  /* LEVEL is the loop's volume, level with the rest of the game's sounds */
  var BPM = 132, STEPS = 64, D4 = 293.66, D2 = 73.42, LEVEL = 1.5;
  /* Semitones above D4 for each eighth note; "-" holds the note before,
     null is a rest */
  var MELODY = [
    7, "-", 8, 7, 4, "-", 5, 4,
    1, "-", 0, "-", 1, 4, 5, "-",
    7, "-", 8, 10, 8, "-", 7, 5,
    4, 5, 4, 1, 0, "-", "-", null,
    12, "-", 10, 8, 10, "-", 8, 7,
    8, "-", 7, 5, 4, "-", 5, 7,
    8, 10, 8, 7, 5, 4, 5, 4,
    1, "-", 4, 1, 0, "-", "-", null
  ];
  /* The root of each bar, in semitones above D2: D, E flat, C, D, G, C, G, D */
  var ROOTS = [0, 1, -2, 0, 5, -2, 5, 0];
  var out = null, bassF = null, timer = 0, step = 0, next = 0, layers = 0, tempo = 1, drone = null, fading = 0, finishing = false;
  function live() {
    return K.on() && !(S.state && S.state.sound === false);
  }
  function hz(base, semi) {
    return base * Math.pow(2, semi / 12);
  }
  function eighth() {
    return 30 / BPM / tempo;
  }
  function play(i, t) {
    var ctx = K.ctx(), when = t - ctx.currentTime, d = eighth();
    var beat = i % 8, root = ROOTS[Math.floor(i / 8)];
    if (beat === 0 || beat === 3 || beat === 6) {
      K.tone(hz(D2, root), d * 1.8, "sawtooth", 0.07, when, null, bassF);
    }
    if (beat === 0 || beat === 4 || (layers >= 5 && beat === 6)) {
      K.tone(120, 0.14, "sine", 0.1, when, 45, out);
    }
    if (layers >= 2 && beat % 2 === 1) {
      K.burst(7000, 0.8, 0.04, 0.03, when, "highpass", out, null, 0.3);
    }
    if (layers >= 3 && beat % 2 === 0) {
      K.tone(hz(D2 * 2, root + [0, 7, 12, 7][beat / 2]), d * 0.8, "square", 0.012, when, null, out);
    }
    var m = MELODY[i];
    if (layers >= 1 && typeof m === "number") {
      var len = 1;
      while (MELODY[(i + len) % STEPS] === "-") { len++; }
      K.tone(hz(D4, m), len * d * 0.9, "square", 0.03, when, null, out);
      if (layers >= 4) { K.tone(hz(D4, m + 12), len * d * 0.8, "triangle", 0.025, when, null, out); }
    }
  }
  /* Schedules the notes of the next 0.2 s. After a stall (a hidden tab) the
     loop skips ahead instead of playing the missed notes at once. */
  function tick() {
    var ctx = K.ctx();
    if (!ctx || !out) { return; }
    if (next < ctx.currentTime) { next = ctx.currentTime + 0.05; }
    while (next < ctx.currentTime + 0.2) {
      /* Finishing: at the start of a bar a last D sounds over the bass
         and the loop ends once it has rung */
      if (finishing && step % 8 === 0) {
        var when = next - ctx.currentTime;
        K.tone(D2, 2.6, "sawtooth", 0.07, when, null, bassF);
        K.tone(D4, 2.4, "square", 0.03, when, null, out); K.tone(hz(D4, 7), 2.4, "triangle", 0.025, when, null, out);
        clearInterval(timer);
        fading = setTimeout(function () { fading = 0; S.snd.troika.stop(); }, (when + 2.8) * 1000);
        return;
      }
      play(step, next);
      next += eighth();
      step = (step + 1) % STEPS;
    }
  }
  function run() {
    clearInterval(timer);
    next = K.ctx().currentTime + 0.05;
    timer = setInterval(tick, 30);
  }
  function droneOn() {
    var ctx = K.ctx();
    if (drone || !ctx) { return; }
    drone = [K.osc(D2, "triangle", 0, out), K.osc(hz(D2, 7), "triangle", 0, out), K.osc(D2 * 2, "sawtooth", 0, bassF)];
    drone.forEach(function (v, k) { K.glide(v.g.gain, k === 2 ? 0.02 : 0.06, 0.6); });
  }
  function droneOff() {
    if (!drone) { return; }
    var ctx = K.ctx(), d = drone;
    drone = null;
    d.forEach(function (v) {
      K.glide(v.g.gain, 0, 0.3);
      try { v.o.stop(ctx.currentTime + 0.4); } catch (e) {}
    });
  }
  S.snd.troika = {
    /* Starts the loop, rising over fadeIn seconds when it is given */
    start: function (fadeIn) {
      if (!live()) { return; }
      K.ready(function () {
        var ctx = K.ctx();
        if (!ctx || out) { return; }
        out = ctx.createGain(); out.gain.value = fadeIn ? 0 : LEVEL;
        if (fadeIn) { K.glide(out.gain, LEVEL, fadeIn); }
        out.connect(K.bus("music"));
        bassF = ctx.createBiquadFilter(); bassF.type = "lowpass"; bassF.frequency.value = 700;
        bassF.connect(out);
        step = 0;
        run();
      });
    },
    /* At a gate: the loop stops and the drone holds */
    pause: function (on) {
      if (!out || finishing || fading) { return; }
      if (on) { clearInterval(timer); droneOn(); }
      else { droneOff(); run(); }
    },
    /* year is 0 to 5; danger is 0 when the Troika is far, 1 when it is
       about to catch Greece */
    set: function (year, danger) {
      layers = year;
      tempo = (year >= 5 ? 1.06 : 1) * (1 + 0.15 * danger);
    },
    /* Lets the loop play to the end of its bar and close on a last D */
    finish: function () {
      if (!out || fading || finishing) { return; }
      droneOff();
      finishing = true;
    },
    /* Lets the loop play on while it fades out over sec seconds, then
       stops it */
    fade: function (sec) {
      if (!out || fading || finishing) { return; }
      K.glide(out.gain, 0, sec);
      fading = setTimeout(function () { fading = 0; S.snd.troika.stop(); }, sec * 1000 + 50);
    },
    stop: function () {
      clearTimeout(fading); fading = 0; finishing = false;
      clearInterval(timer);
      droneOff();
      if (!out) { return; }
      var o = out, f = bassF;
      out = null; bassF = null;
      K.glide(o.gain, 0, 0.3);
      setTimeout(function () { try { o.disconnect(); f.disconnect(); } catch (e) {} }, 600);
    }
  };
})();
