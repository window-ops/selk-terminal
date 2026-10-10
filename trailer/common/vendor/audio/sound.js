/* The sound engine, with the Web Audio API: the audio context, the volume
   buses (interface, machine, wind, structure, music) with their ducks and pans, the
   presets, and the helpers the sounds are made of (tone, burst, loopNoise,
   osc, glide). The sounds themselves are in js/audio/sounds/, one file per
   family, each adding its functions to S.snd through S.snd.kit. */
(function () {
  var S = window.SELK;
  var ctx = null, master = null, bus = {}, duck = {}, pan = {}, hp = null, noiseBuf = null, on = true;
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
  function glide(p, to, dur) {
    var t = ctx.currentTime, from = levelOf(p);
    dur = Math.max(0.01, dur || 0);
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
  function init() {
    if (ctx) {
      if (ctx.state !== "running" && ctx.state !== "closed" && on) {
        ctx.resume();
      } return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
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
    master.gain.value = 0;
    Object.keys(BUS).forEach(function (k) { bus[k].gain.value = 0; });
    apply();
    if (!on) {
      try {
        ctx.suspend();
      } catch (e) {}
    }
    var len = ctx.sampleRate * 3;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0), b0 = 0, b1 = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + 0.03 * w; b1 = (b1 + 0.02 * w) / 1.02;
      d[i] = i % 3 === 0 ? w : (i % 3 === 1 ? b1 * 3.5 : b0 * 2);
    }
  }
  function apply() {
    if (!ctx) {
      return;
    }
    var masterVol = on ? set().vol / 100 : 0, pr = preset();
    if (hp) { hp.frequency.value = pr.hp; }
    /* The computer's hum is panned slightly left; the other channels are
       centered */
    if (pan.machine) { pan.machine.pan.value = -0.5 * pr.width; }
    /* Level changes from a slider or from SOUND ON glide over 50 ms, since a
       jump in level is heard as a click */
    glide(master.gain, masterVol, 0.05);
    Object.keys(BUS).forEach(function (k) {
      var busVol = on ? (set()[BUS[k]] != null ? set()[BUS[k]] : 100) / 100 : 0;
      /* Wind sits well under the machine, the interface and the structure */
      if (k === "wind") { busVol *= 0.35; }
      glide(bus[k].gain, busVol, 0.05);
    });
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
     Interface sounds pass a fixed offset, so a control sounds the same every
     time (sounds/interface.js). */
  function burst(freq, q, vol, dur, when, type, dest, attack, offset) {
    if (!ctx || !on) {
      return;
    }
    var t = ctx.currentTime + (when || 0);
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
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
  function ready(fn) {
    init();
    if (!ctx) { return; }
    /* "suspended" in every browser; Safari also reports "interrupted" after
       a call or another app took the audio */
    if (ctx.state !== "running" && on) {
      ctx.resume().then(fn, function () {});
    } else {
      fn();
    }
  }
  S.snd = {
    init: init,
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
    /* What the files in sounds/ build with. ctx, master and the buses exist
       only after init, so they are read through functions. */
    kit: {
      ctx: function () { return ctx; },
      master: function () { return master; },
      bus: function (k) { return bus[k]; },
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
      ready: ready
    }
  };
})();
