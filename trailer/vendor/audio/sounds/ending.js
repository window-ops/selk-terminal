/* The ending: the swell after the THX Deep Note, its stop, and the hush that
   fades every channel while it plays. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  var swellNow = null;
  /* Ending swell. Voices move at random between 200 and 400 Hz, then glide
     over 11 s to a chord spread over several octaves while the level and the
     filter rise; the chord stays for 4 s and fades out. The chord depends on
     the ending: "hope" is D major, "hollow" open fifths with no third, "dark"
     a cluster of semitones and tritones. Each voice is detuned slightly.
     Returns the length in seconds. */
  S.snd.swell = function (mood) {
    var ctx = K.ctx();
    if (!ctx || !K.on()) {
      return 0;
    }
    /* One swell at a time: a replay stops the one still fading out */
    S.snd.stopSwell();
    var D = 36.71, t0 = ctx.currentTime + 0.05;
    var CHORDS = {
      hope: [1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32],
      hollow: [1, 2, 3, 4, 6, 8, 12, 16, 24, 32],
      dark: [2, 2.119, 2.828, 4, 4.238, 5.657, 8, 8.476, 11.31, 15.1, 16]
    };
    var ratios = CHORDS[mood] || CHORDS.hollow, N = 24;
    var out = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    /* The voices are mono, and the stage below is pinned to stereo, so this
       filter stays on one channel for its whole life */
    K.pinChannels(lp, 1);
    lp.frequency.setValueAtTime(500, t0);
    lp.frequency.exponentialRampToValueAtTime(mood === "dark" ? 2400 : 5200, t0 + 11);
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.exponentialRampToValueAtTime(0.06, t0 + 3);
    out.gain.exponentialRampToValueAtTime(0.32, t0 + 11);
    out.gain.setValueAtTime(0.32, t0 + 15);
    out.gain.exponentialRampToValueAtTime(0.0001, t0 + 22);
    /* The swell's envelope is on out. A stop fades this extra stage, whose
       level is always known, so a stop never jumps. */
    var fade = ctx.createGain(); fade.gain.value = 1;
    out.connect(lp); lp.connect(fade); fade.connect(K.master());
    var voices = [];
    swellNow = { fade: fade, voices: voices };
    for (var i = 0; i < N; i++) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth";
      var f = 200 + Math.random() * 200;
      o.frequency.setValueAtTime(f, t0);
      /* Random steps for the first five seconds */
      for (var k = 1; k <= 12; k++) {
        f = Math.max(180, Math.min(420, f + (Math.random() - 0.5) * 60));
        o.frequency.linearRampToValueAtTime(f, t0 + k * 0.42);
      }
      var target = D * ratios[i % ratios.length] * Math.pow(2, (Math.random() - 0.5) * 0.012);
      o.frequency.exponentialRampToValueAtTime(target, t0 + 11);
      g.gain.value = 1 / N;
      o.connect(g); g.connect(out);
      o.start(t0); o.stop(t0 + 22.5); voices.push(o);
    }
    return 22;
  };
  /* Stops the swell with a short fade, when the player leaves the ending */
  S.snd.stopSwell = function () {
    var ctx = K.ctx();
    if (!ctx || !swellNow) {
      return;
    }
    var t = ctx.currentTime, s = swellNow;
    swellNow = null;
    K.glide(s.fade.gain, 0, 0.5);
    try {
      s.voices.forEach(function (o) { o.stop(t + 0.6); });
    } catch (e) {}
  };
  /* During the ending only the swell plays over the site: the machine, wind
     and structure channels fade out over 1.5 s, and the swell goes straight
     to the master. The interface and music channels are left alone, so the ending's
     buttons and the title screen after it still sound. hush(false) restores
     the Setup levels. */
  S.snd.hush = function (on) {
    if (!K.ctx()) {
      return;
    }
    /* A second call during a fade continues from the current level */
    var duck = K.duck();
    Object.keys(duck).forEach(function (k) {
      if (k === "ui" || k === "music") { return; }
      K.glide(duck[k].gain, on ? 0 : 1, on ? 1.5 : 1.2);
    });
  };
})();
