/* A small player for the themes of the TROIKA.RUN ending
   (troika-office.js, troika-coda.js): it schedules a theme's steps ahead
   of time on the music channel, as the soundtrack (troika.js) does,
   and starts, fades, pauses and stops it smoothly. A theme gives bpm
   (eighth notes at that tempo, or a function of opt that returns it),
   steps (the length of its loop), gain, and play(i, when, d, out, opt),
   which plays step i at when seconds from now, d being the length of an
   eighth, through the node out; opt is what start was given. It may give
   end(when, d, out, opt), a closing chord, and ring, how long the chord
   sounds: finish lets the theme reach the end of its bar and close on it
   instead of being cut. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  S.snd.troikaSong = function (theme) {
    var out = null, timer = 0, step = 0, next = 0, fading = 0, opt = null, finishing = false;
    function live() {
      return K.on() && !(S.state && S.state.sound === false);
    }
    function eighth() {
      return 30 / (typeof theme.bpm === "function" ? theme.bpm(opt || {}) : theme.bpm);
    }
    function tick() {
      var ctx = K.ctx();
      if (!ctx || !out) { return; }
      if (next < ctx.currentTime) { next = ctx.currentTime + 0.05; }
      while (next < ctx.currentTime + 0.25) {
        /* Finishing: at the start of a bar the closing chord sounds, the
           loop stops and the theme ends once the chord has rung */
        if (finishing && step % 8 === 0) {
          if (theme.end) { theme.end(next - ctx.currentTime, eighth(), out, opt); }
          clearInterval(timer);
          var ring = (theme.ring || 3) + (next - ctx.currentTime);
          fading = setTimeout(function () { fading = 0; song.stop(); }, ring * 1000);
          return;
        }
        theme.play(step, next - ctx.currentTime, eighth(), out, opt);
        next += eighth();
        step = (step + 1) % theme.steps;
      }
    }
    function run() {
      clearInterval(timer);
      next = K.ctx().currentTime + 0.05;
      timer = setInterval(tick, 40);
    }
    var song = {
      /* Starts the theme from its first step, rising over fadeIn seconds */
      start: function (fadeIn, options) {
        if (!live()) { return; }
        opt = options || {};
        K.ready(function () {
          var ctx = K.ctx();
          if (!ctx || out) { return; }
          out = ctx.createGain(); out.gain.value = 0; finishing = false;
          out.connect(K.bus("music"));
          K.glide(out.gain, theme.gain, fadeIn || 0.05);
          step = 0;
          run();
        });
      },
      /* Lets the theme play to the end of its bar and close on its chord */
      finish: function () {
        if (!out || fading || finishing) { return; }
        finishing = true;
      },
      /* Lets the theme play on while it fades out over sec seconds; then
         it stops */
      fade: function (sec) {
        if (!out || fading || finishing) { return; }
        K.glide(out.gain, 0, sec);
        fading = setTimeout(function () { fading = 0; song.stop(); }, sec * 1000 + 50);
      },
      /* While the run is paused the theme holds, quietly */
      pause: function (on) {
        if (!out || fading || finishing) { return; }
        if (on) { clearInterval(timer); K.glide(out.gain, 0, 0.3); }
        else { K.glide(out.gain, theme.gain, 0.5); run(); }
      },
      stop: function () {
        clearTimeout(fading); fading = 0; finishing = false;
        clearInterval(timer);
        if (!out) { return; }
        var o = out;
        out = null;
        K.glide(o.gain, 0, 0.3);
        setTimeout(function () { try { o.disconnect(); } catch (e) {} }, 600);
      },
      playing: function () { return !!out; }
    };
    return song;
  };
})();
