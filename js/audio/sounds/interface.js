/* Interface sounds: the click, typing, the result tones (tick, ok, error,
   chime, unlock), telemetry blips and the sweep, and the control sounds of
   Setup > Sound > Control sounds, one per kind of control.

   Every noise burst here reads the noise buffer from the same point
   (OFFSET), so a control sounds the same each time it is pressed. Every
   sound waits for a suspended audio context to resume (K.ready), so the
   first press after loading or after a hidden tab is not lost. */
(function () {
  var S = window.SELK, K = S.snd.kit, lastKey = 0, OFFSET = 0.5;
  /* The bursts here, rendered once each into a buffer. A live burst shapes
     its sound with gain changes timed on the audio clock. Firefox hands
     them to the audio thread only when the page finishes its current task,
     and a click that redraws a list runs in the same task as the button's
     release: the changes arrive after their times have passed and the
     release plays silent. A buffer started late plays whole. Until its
     buffer is ready, a burst plays live. */
  var baked = {};
  var rendering = {};
  /* gen counts the reseeds, so a render begun from the old noise is not
     kept after the noise changes */
  var gen = 0;
  /* The sound being played or rendered: "click" or a control kind. Each
     reads its own noise (K.noiseFor, Setup > Sound > Seeds), and its
     buffers are kept under its name */
  var cur = null;
  function bake(key, freq, q, vol, dur, type, kind) {
    var ctx = K.ctx(), noise = K.noiseFor(kind), g0 = gen;
    if (!ctx || !noise || !window.OfflineAudioContext) { return null; }
    if (baked[key] !== undefined) { return rendering[key] || null; }
    baked[key] = null;
    var off = new OfflineAudioContext(1, Math.ceil((dur + 0.06) * ctx.sampleRate), ctx.sampleRate);
    var s = off.createBufferSource(); s.buffer = noise;
    var f = off.createBiquadFilter(); f.type = type || "bandpass"; f.frequency.value = freq; f.Q.value = q;
    var g = off.createGain();
    g.gain.setValueAtTime(0.0001, 0);
    g.gain.exponentialRampToValueAtTime(vol, Math.min(0.004, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, dur);
    s.connect(f); f.connect(g); g.connect(off.destination);
    s.start(0, OFFSET, dur + 0.05);
    rendering[key] = off.startRendering().then(function (buf) {
      if (g0 === gen) { baked[key] = buf; }
    }, function () { if (g0 === gen) { delete baked[key]; } });
    return rendering[key];
  }
  function burst(freq, q, vol, dur, when, type, dest, kind) {
    var ctx = K.ctx(), key = [kind || "", freq, q, vol, dur, type || ""].join(" ");
    if (warming) { bake(key, freq, q, vol, dur, type, kind); return; }
    if (!ctx || !K.on()) { return; }
    /* Tests watch the bursts through this hook (tools/test-ui.js) */
    if (S.snd.onBurst) { S.snd.onBurst(freq); }
    if (!baked[key]) {
      /* Not rendered yet: wait for the buffer and play it then, from the
         same moment on, so the burst is never played live and cut short.
         A browser with no offline rendering plays it live */
      var asked = ctx.currentTime, job = bake(key, freq, q, vol, dur, type, kind);
      if (!job) { K.burst(freq, q, vol, dur, when, type, dest, null, OFFSET); return; }
      job.then(function () {
        if (!baked[key]) { return; }
        var s = ctx.createBufferSource(); s.buffer = baked[key];
        s.connect(dest || K.bus("ui"));
        s.start(Math.max(ctx.currentTime, asked + (when || 0)));
      });
      return;
    }
    var s = ctx.createBufferSource(); s.buffer = baked[key];
    s.connect(dest || K.bus("ui")); s.start(ctx.currentTime + (when || 0));
  }
  /* A burst at the fixed offset, on the interface bus */
  function b(freq, q, vol, dur, when, type) {
    burst(freq, q, vol, dur, when, type, out, cur);
  }
  /* A burst of the click, through its own level */
  function bc(freq, q, vol, dur, when) {
    burst(freq, q, vol, dur, when, null, K.clicks(), "click");
  }
  /* While warming, the sounds only render their bursts and play nothing.
     out is where a control sound plays (play), or null for the interface
     bus */
  var warming = false, out = null;
  var t = function (freq, dur, type, vol, when, glideTo) {
    if (!warming) { K.tone(freq, dur, type, vol, when, glideTo, out || undefined); }
  };
  /* The click is a press and a release. A mouse or pen plays them apart,
     as its button goes down and comes up (ui-sound.js); everything else
     plays them 35 ms apart. Heard apart, the release at its level in the
     click is about 6 dB quieter than the press, so the halves played apart
     are set even: each carries half the click's loudness (K-weighted
     energy, ITU-R BS.1770), and the click keeps its level. The press
     sits at 2900 Hz, a little below the 3200 Hz of the page and open
     sounds, so it sounds less sharp; its levels make up the 0.4 dB the
     narrower band loses */
  function press(vol) { bc(2900, 2.5, vol || 0.335, 0.018); }
  function lift(when, vol) { bc(1100, 1.2, vol || 0.15, 0.03, when); }
  /* Both halves, whole and apart, rendered before they are needed */
  function warm() {
    var was = warming; warming = true;
    try { press(); lift(0); press(0.269); lift(0, 0.24); } finally { warming = was; }
  }
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
    /* page, back and open are tones alone: a noise burst at the press
       frequency would sound as a click before the control's own sound. The
       tones carry the 0.2 to 0.3 dB the burst gave */
    page: function () { t(620, 0.06, "triangle", 0.063); t(930, 0.07, "triangle", 0.056, 0.055); },
    back: function () { t(930, 0.06, "triangle", 0.063); t(620, 0.07, "triangle", 0.056, 0.055); },
    close: function () { b(2600, 2, 0.16, 0.02); t(700, 0.1, "triangle", 0.048, 0.005, 330); },
    action: function () { b(3000, 2, 0.24, 0.025); b(1200, 1.2, 0.15, 0.04, 0.02); t(220, 0.06, "triangle", 0.05); },
    menu: function () { b(5200, 3, 0.24, 0.025); t(1800, 0.04, "sine", 0.042); },
    tab: function () { b(1500, 4, 0.25, 0.03); t(480, 0.06, "triangle", 0.062); },
    open: function () { t(500, 0.09, "triangle", 0.052, 0, 760); },
    /* An on/off switch: a short square tone. A snap of noise before it
       would sound as a click before the switch; the tone carries the
       2.2 dB the snap gave */
    switch: function () { t(740, 0.05, "square", 0.039); },
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
  /* On the title screen the control sounds play 4 dB louder, through a
     gain on the interface bus, since the screen has no other sound to
     hold them in */
  var TITLE_GAIN = 1.585, titleOut = null;
  function titleBus() {
    var ctx = K.ctx();
    if (!ctx) { return null; }
    if (!titleOut) { titleOut = ctx.createGain(); titleOut.gain.value = TITLE_GAIN; titleOut.connect(K.bus("ui")); }
    return titleOut;
  }
  /* Play control sound kind with its own noise */
  function play(kind, value) {
    cur = kind; out = !warming && S.mode === "title" ? titleBus() : null;
    try { UI[kind](value); } finally { cur = null; out = null; }
  }
  /* The sounds that render a noise burst, each with a seed row in Setup >
     Sound > Seeds: the click, typing and every control kind except the
     tone-only ones (slide, page, back, open and switch), which have no
     noise source */
  var TONES_ONLY = ["slide", "page", "back", "open", "switch"];
  S.snd.SEED_KINDS = ["click", "typing"].concat(S.snd.UI_KINDS.filter(function (k) { return TONES_ONLY.indexOf(k) === -1; }));
  /* Play one of SEED_KINDS, after its seed changes */
  S.snd.preview = function (kind) {
    if (kind === "click") { S.snd.click(); } else if (kind === "typing") { S.snd.key(); } else { S.snd.ui(kind); }
  };
  /* Render every burst of the click and of the control sounds as soon as
     the engine is built, so the first press after a fast load plays the
     rendered sound. The engine waits for this before the first sound */
  K.prepare(function () {
    /* Also run again when the noise changes (Setup > Sound > Sound seed),
       so the buffers made from the old noise are dropped first */
    baked = {}; rendering = {}; gen++;
    warm();
    warming = true;
    try { Object.keys(UI).forEach(function (k) { play(k, 50); }); }
    finally { warming = false; }
    return Promise.all(Object.keys(rendering).map(function (k) { return rendering[k]; }));
  });
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
      /* Typing reads its noise at a random point, so keys never sound
         alike; its seed (Setup > Sound > Seeds > Typing) sets the noise */
      K.burst(1800 + Math.random() * 1800, 1.4, 0.38, 0.035, 0, null, null, null, null, K.noiseFor("typing", 3));
      t(160 + Math.random() * 40, 0.03, "triangle", 0.05);
    });
  };
  /* Backspace: a larger key, so a lower and longer press than a letter,
     within 1 dB of the average key (K-weighted energy). It reads the noise
     of typing */
  S.snd.erase = function () {
    if (!live()) {
      return;
    }
    var now = Date.now();
    if (now - lastKey < 25) {
      return;
    }
    lastKey = now;
    K.ready(function () {
      K.burst(1100 + Math.random() * 300, 1.2, 0.34, 0.045, 0, null, null, null, null, K.noiseFor("typing", 3));
      t(115 + Math.random() * 10, 0.04, "triangle", 0.055);
    });
  };
  /* The sound of a key typed into a field: Backspace erases, a character
     or Enter types; other keys make none */
  S.snd.typed = function (key) {
    if (key === "Backspace") { S.snd.erase(); } else if (key.length === 1 || key === "Enter") { S.snd.key(); }
  };
  S.snd.click = function () {
    if (!live()) { return; }
    K.ready(function () { warm(); click(); });
  };
  /* The click's two halves, for a mouse or pen press. lift(delay) plays
     the release delay seconds from now */
  S.snd.press = function () {
    if (!live()) { return; }
    K.ready(function () { warm(); press(0.269); });
  };
  S.snd.lift = function (delay) {
    if (!live()) { return; }
    K.ready(function () { lift(delay || 0, 0.24); });
  };
  /* The sound of a kind of control; an unknown kind clicks */
  S.snd.ui = function (kind, value) {
    if (!live()) { return; }
    K.ready(function () { if (UI[kind]) { play(kind, value); } else { click(); } });
  };
  /* vol: the tone's peak, 0.045 when left out */
  S.snd.tick = function (vol) {
    if (!K.on()) return; K.ready(function () { t(1320, 0.03, "square", vol || 0.045); });
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
