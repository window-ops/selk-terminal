/* The sound engine, with the Web Audio API: the audio context, the volume
   buses (interface, machine, wind, structure, music) with their ducks and pans, the
   presets, and the helpers the sounds are made of (tone, burst, loopNoise,
   osc, glide). The sounds themselves are in js/audio/sounds/, one file per
   family, each adding its functions to S.snd through S.snd.kit. */
(function () {
  var S = window.SELK;
  var ctx = null, master = null, bus = {}, duck = {}, pan = {}, hp = null, noiseBuf = null, on = true;
  /* The clicks' own level (Setup > Sound > Clicks), inside the interface channel */
  var clicks = null;
  /* Work that must finish before the first sound plays: the sound files
     register it with S.snd.kit.prepare (the interface sounds render their
     bursts there). prepared settles once the context is built and every
     piece of that work is done */
  var preparers = [], prepared = null;
  /* Sound presets. Each sets the four channel levels once (the sliders stay
     adjustable), a high-pass filter against bass the speakers cannot play,
     and the stereo width. DESK SPEAKERS suits a left and right pair without a
     subwoofer. */
  var PRESETS = {
    balanced: { vMachine: 70, vWind: 40, vUi: 75, vStruct: 65, vMusic: 70, hp: 40, width: 0.35 },
    speakers: { vMachine: 60, vWind: 30, vUi: 85, vStruct: 60, vMusic: 75, hp: 110, width: 0.6 },
    headphones: { vMachine: 55, vWind: 35, vUi: 65, vStruct: 55, vMusic: 60, hp: 30, width: 0.3 },
    quiet: { vMachine: 30, vWind: 15, vUi: 60, vStruct: 35, vMusic: 45, hp: 60, width: 0.3 }
  };
  function preset() {
    return PRESETS[(S.state && S.state.settings.soundPreset) || "balanced"] || PRESETS.balanced;
  }
  /* A destination placed left (-1) or right (1) of a channel */
  function placed(dest, where) {
    if (!ctx.createStereoPanner) {
      return dest;
    }
    var p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, where));
    p.connect(dest); return p;
  }
  function set() {
    return S.state.settings;
  }
  var BUS = {
    ui: "vUi",
    machine: "vMachine",
    wind: "vWind",
    struct: "vStruct",
    music: "vMusic"
  };
  /* Level changes glide. Browsers report AudioParam.value differently during
     a fade (Firefox reports the last value set), and a fade that starts from
     a wrong value jumps, which is heard as a bang. Each glide records its
     start, end and times, and the next one starts from the level computed
     from that record. */
  function levelOf(p) {
    var f = p._glide;
    if (!f) { return p.value; }
    var t = ctx.currentTime;
    if (t >= f.t1) { return f.to; }
    if (t <= f.t0) { return f.from; }
    return f.from + (f.to - f.from) * (t - f.t0) / (f.t1 - f.t0);
  }
  /* dur 0 sets the level at once */
  function glide(p, to, dur) {
    var t = ctx.currentTime, from = levelOf(p);
    if (!dur) {
      try { p.cancelScheduledValues(t); p.setValueAtTime(to, t); } catch (e) {}
      p.value = to; p._glide = { from: to, to: to, t0: t, t1: t };
      return;
    }
    dur = Math.max(0.01, dur);
    try {
      p.cancelScheduledValues(t);
      p.setValueAtTime(from, t);
      p.linearRampToValueAtTime(to, t + dur);
    } catch (e) {
      p.value = to;
    }
    p._glide = { from: from, to: to, t0: t, t1: t + dur };
  }
  /* Pins a node's input to a fixed channel count. A node left on the default
     "max" mode counts its channels from whatever is connected, and a count
     that changes later makes the browser rebuild the node: Chrome then warns
     "BiquadFilterNode channel count changes may produce audio glitches". The
     master chain is built before the channels connect to it, so it starts
     mono and would turn stereo once the first panner arrives. Pinning it to
     two channels up front keeps the count fixed for the whole session. */
  function pinChannels(node, count) {
    try {
      node.channelCount = count;
      node.channelCountMode = "explicit";
      node.channelInterpretation = "speakers";
    } catch (e) {}
    return node;
  }
  /* The context is built when the page loads, before any gesture, and the
     browser starts it suspended: the first press or key resumes it */
  function wake() {
    if (ctx && ctx.state !== "running" && ctx.state !== "closed" && on) {
      try { ctx.resume(); } catch (e) {}
    }
  }
  ["pointerdown", "keydown", "touchend"].forEach(function (k) { document.addEventListener(k, wake, true); });
  /* The context is made only after the first gesture on the page, since a
     browser refuses to start one before it and warns. Where the browser
     reports no user activation, the context is made at once */
  function activated() {
    var ua = navigator.userActivation;
    return !ua || ua.hasBeenActive;
  }
  function init() {
    if (ctx) {
      if (ctx.state !== "running" && ctx.state !== "closed" && on) {
        ctx.resume();
      } return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !activated()) {
      return;
    }
    ctx = new AC();
    /* master > high-pass (no sub-bass) > compressor (no sudden peaks) >
       speakers */
    master = pinChannels(ctx.createGain(), 2);
    hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.Q.value = 0.7;
    pinChannels(hp, 2);
    var comp = pinChannels(ctx.createDynamicsCompressor(), 2);
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    master.connect(hp); hp.connect(comp); comp.connect(ctx.destination);
    /* Each channel: level (Setup sliders) > duck (the ending's hush) > pan > master */
    Object.keys(BUS).forEach(function (k) {
      bus[k] = ctx.createGain();
      duck[k] = ctx.createGain(); duck[k].gain.value = 1;
      bus[k].connect(duck[k]);
      if (ctx.createStereoPanner) {
        pan[k] = ctx.createStereoPanner(); duck[k].connect(pan[k]); pan[k].connect(master);
      } else {
        duck[k].connect(master);
      }
    });
    clicks = ctx.createGain(); clicks.connect(bus.ui);
    apply(true);
    if (!on) {
      try {
        ctx.suspend();
      } catch (e) {}
    }
    noiseBuf = makeNoise(set().soundSeed, 3);
    /* The levels are set again whenever the context starts running, so a
       context resumed after a fast load plays at the levels of Setup */
    ctx.addEventListener("statechange", function () {
      if (ctx.state === "running") { apply(); } else { warmed = null; }
    });
    warm();
    /* The graph and the noise exist now: run the preparation, and let
       ready() wait for it */
    runPrep();
  }
  function runPrep() {
    prepared = Promise.all(preparers.map(function (fn) {
      try { return Promise.resolve(fn()); } catch (e) { return null; }
    })).then(function () {}, function () {});
  }
  /* The noise every burst and wind is made of: three seconds, built with
     mulberry32 from the shared seed (Setup > Sound > Seeds > Same seed
     everywhere, settings.soundSeed), so the same seed makes the same
     buffer at every load. The click and the control sounds read it from a
     fixed offset, so the seed decides how they sound; each of them can
     also take a seed of its own (noiseFor).

     The default seed gives the most probable sound of a random buffer: out
     of 2000 seeds, its click and control bursts lie closest to the average
     over all seeds (third-octave band levels, peak and energy, at 44.1 and
     48 kHz, the click weighted four times). */
  var DEFAULT_SEED = "3436859";
  /* A seed of digits is used as a number; any other text is hashed to one
     (FNV-1a), so a word works as a seed too */
  function seedOf(text) {
    text = String(text == null ? "" : text).trim();
    if (!text) { text = DEFAULT_SEED; }
    if (/^\d{1,10}$/.test(text)) { return Number(text) >>> 0; }
    var h = 0x811c9dc5;
    text = text.toUpperCase();
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
  /* seconds: three for the main buffer, which the wind loops; one for the
     buffer of a single sound, which reads it at 0.5 s. A seed makes the
     same samples whatever the length, so a sound given the shared seed
     sounds as it does on the main buffer */
  function makeNoise(text, seconds) {
    var len = Math.round(ctx.sampleRate * seconds), buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0), b0 = 0, b1 = 0, seed = seedOf(text) | 0;
    function rnd() {
      seed = (seed + 0x6d2b79f5) | 0;
      var r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    }
    for (var i = 0; i < len; i++) {
      var w = rnd() * 2 - 1;
      b0 = 0.997 * b0 + 0.03 * w; b1 = (b1 + 0.02 * w) / 1.02;
      d[i] = i % 3 === 0 ? w : (i % 3 === 1 ? b1 * 3.5 : b0 * 2);
    }
    return buf;
  }
  /* The noise of one interface sound (Setup > Sound > Seeds): its own
     seed from settings.soundSeeds, or the main buffer when it has none.
     seconds is the length of its own buffer: one by default, three for a
     sound that reads it at a random point, like typing. Buffers are kept
     by sound and seed until the next reseed */
  var own = {};
  function noiseFor(kind, seconds) {
    var seeds = set().soundSeeds || {}, text = kind && seeds[kind];
    if (!ctx || !text) { return noiseBuf; }
    var key = kind + " " + text;
    if (!own[key]) { own[key] = makeNoise(text, seconds || 1); }
    return own[key];
  }
  /* instant: set the levels at once, when the engine is built. A glide
     from silence there would leave the first sound, played at once after
     the first gesture, inside the fade and unheard */
  function apply(instant) {
    if (!ctx) {
      return;
    }
    var fade = instant === true ? 0 : 0.05;
    var masterVol = on ? set().vol / 100 : 0, pr = preset();
    if (hp) { hp.frequency.value = pr.hp; }
    /* The computer's hum is panned slightly left; the other channels are
       centered */
    if (pan.machine) { pan.machine.pan.value = -0.5 * pr.width; }
    /* Level changes from a slider or from SOUND ON glide over 50 ms, since a
       jump in level is heard as a click */
    glide(master.gain, masterVol, fade);
    Object.keys(BUS).forEach(function (k) {
      var busVol = on ? (set()[BUS[k]] != null ? set()[BUS[k]] : 100) / 100 : 0;
      /* Wind sits well under the machine, the interface and the structure */
      if (k === "wind") { busVol *= 0.35; }
      glide(bus[k].gain, busVol, fade);
    });
    /* 50 plays the click as designed; the default, 70, is 3 dB above it */
    glide(clicks.gain, (set().vClick != null ? set().vClick : 70) / 50, fade);
  }
  function tone(freq, dur, type, vol, when, glideTo, dest) {
    if (!ctx || !on) {
      return;
    }
    var t = ctx.currentTime + (when || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) {
      o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.04, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || bus.ui);
    o.start(t); o.stop(t + dur + 0.03);
  }
  /* A burst of filtered noise. offset is where in the noise buffer it reads,
     in seconds; when left out it is random, so wind and creaks never repeat.
     noise is the buffer to read, the main one when left out.
     Interface sounds pass a fixed offset, so a control sounds the same every
     time (sounds/interface.js). */
  function burst(freq, q, vol, dur, when, type, dest, attack, offset, noise) {
    if (!ctx || !on) {
      return;
    }
    var t = ctx.currentTime + (when || 0);
    var s = ctx.createBufferSource(); s.buffer = noise || noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = type || "bandpass"; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || Math.min(0.004, dur / 4)));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || bus.ui);
    s.start(t, offset != null ? offset : Math.random() * 2, dur + 0.05);
  }
  function loopNoise(freq, q, type, gain, dest) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain(); g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(dest); s.start();
    return {
      src: s,
      f: f,
      g: g
    };
  }
  function osc(freq, type, gain, dest) {
    var o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    var g = ctx.createGain(); g.gain.value = gain;
    o.connect(g); g.connect(dest); o.start();
    return {
      o: o,
      g: g
    };
  }
  /* Runs fn once the context is running. A context the browser suspended
     (before the first gesture, or after the tab was hidden) resumes
     asynchronously, and a sound scheduled before that is lost; this waits for
     the resume, so the first press after a pause sounds like every other */
  /* The output device takes a moment to open after the context starts,
     and drops what plays before then: the first click after a start was
     silent. warmed settles once the audio clock has run for the output
     latency the browser reports, 60 ms at least and 250 ms at most, or
     after 1 s in any case. A context that stops running (Sound OFF, a
     hidden tab, a call) warms again at its next start. */
  var warmed = null;
  function warm() {
    if (warmed) { return warmed; }
    warmed = new Promise(function (done) {
      var t0 = null, give = Date.now() + 1000;
      (function check() {
        if (ctx.state === "running") {
          if (t0 === null) { t0 = ctx.currentTime; }
          var need = Math.min(0.25, Math.max(0.06, (ctx.outputLatency || 0) + (ctx.baseLatency || 0)));
          if (ctx.currentTime - t0 >= need) { done(); return; }
        }
        if (Date.now() > give) { done(); return; }
        setTimeout(check, 10);
      })();
    });
    return warmed;
  }
  function ready(fn) {
    init();
    if (!ctx) { return; }
    /* "suspended" in every browser; Safari also reports "interrupted" after
       a call or another app took the audio. The sound also waits for the
       preparation, so the first sounds after a fast load play whole, and
       for the output to open (warm) */
    var running = ctx.state !== "running" && on ? ctx.resume() : null;
    Promise.all([running, prepared, on ? warm() : null]).then(fn, function () {});
  }
  S.snd = {
    init: init,
    /* Builds the engine at the first gesture: a key, a press or a tap.
       The capture listeners run before the control's own sound */
    initOnGesture: function () {
      if (ctx) { return; }
      var kinds = ["pointerdown", "keydown", "touchend", "click"];
      function go() {
        init();
        if (ctx) { kinds.forEach(function (k) { document.removeEventListener(k, go, true); }); }
      }
      kinds.forEach(function (k) { document.addEventListener(k, go, true); });
    },
    apply: apply,
    PRESETS: PRESETS,
    /* A preset sets the four channel levels */
    preset: function (name) {
      var pr = PRESETS[name];
      if (!pr) { return; }
      var st = S.state.settings;
      st.soundPreset = name;
      ["vMachine", "vWind", "vUi", "vStruct", "vMusic"].forEach(function (k) { st[k] = pr[k]; });
      apply();
    },
    setOn: function (v) {
      on = !!v;
      apply();
      if (ctx) {
        if (!on) {
          try {
            ctx.suspend();
          } catch (e) {}
        } else {
          try {
            ctx.resume();
          } catch (e) {}
        }
      }
    },
    DEFAULT_SEED: DEFAULT_SEED,
    /* Builds the noise again from the seed in Setup and renders the
       interface sounds again from it. Sounds already playing, like the
       wind, keep the old noise until they start again. */
    reseed: function () {
      if (!ctx) { return; }
      noiseBuf = makeNoise(set().soundSeed, 3); own = {};
      runPrep();
    },
    /* What the files in sounds/ build with. ctx, master and the buses exist
       only after init, so they are read through functions. */
    kit: {
      ctx: function () { return ctx; },
      master: function () { return master; },
      bus: function (k) { return bus[k]; },
      clicks: function () { return clicks; },
      noise: function () { return noiseBuf; },
      noiseFor: noiseFor,
      duck: function () { return duck; },
      on: function () { return on; },
      preset: preset,
      placed: placed,
      glide: glide,
      pinChannels: pinChannels,
      tone: tone,
      burst: burst,
      loopNoise: loopNoise,
      osc: osc,
      ready: ready,
      /* Registers work to run once the context is built and again after a
         new seed; fn may return a promise. Work registered after the build
         also runs at once */
      prepare: function (fn) {
        preparers.push(fn);
        if (ctx) {
          var done = Promise.resolve().then(fn);
          prepared = Promise.all([prepared, done]).then(function () {}, function () {});
        }
      }
    }
  };
})();
