/* The feature trailer's soundtrack: the score and the cues, written against
   the timeline (DESIGN.md section 8). Everything is generated here or by
   the game's own sounds (common/vendor/audio); no recordings are used.

   The score is slow and reflective, in A minor. Its motif is the falling
   fourth A to E, the interval of the game's error sound (220 to 165 Hz).
   It falls on the scenes that reach out to space and rises, E to A, on
   those that reach in to life underground; both sound at once in 2079 at
   Selk, when the lab is built. The tempo is 60 BPM, rising to 70 BPM
   through the timelapse with more notes and more layers. The score stops
   at the ALARM line, and the alarm, the creaks and the wind take over. On
   the title one low A is held to the cut, and the trailer ends on the
   click of POWER ON.

   The scenes have their own sounds: radio and telemetry on the space
   scenes, a crowd, a siren and coins on the euro crisis, and a quiet bed
   of each place under every animation. */
"use strict";
(function () {
  const S = window.SELK, K = S.snd.kit, ctx = OFFLINE;
  S.snd.init();
  /* The engine waits for a live context to resume before it plays; the
     offline context is resumed by the render below, so it plays at once */
  K.ready = (fn) => fn();

  /* The score's clock. The times in this file are written for a boot of
     5 s; the boot now cuts to Haas at 4.5 s. when(t) moves every time from
     5 s on 0.5 s earlier, so the cues keep their places in the shots and
     the boot's own cues, all before 4.5 s, stay as written. While the
     score is built, the scheduling methods below pass their times through
     when(); at() does the same. They are restored before the render, so
     the game's sounds, played during it, run on the trailer's clock. */
  const BOOT_WRITTEN = 5, BOOT_CUT = 4.5;
  const when = (t) => (t >= BOOT_WRITTEN ? t - (BOOT_WRITTEN - BOOT_CUT) : t);
  const P = AudioParam.prototype, N = AudioScheduledSourceNode.prototype, B = AudioBufferSourceNode.prototype;
  const mapped = [];
  const remap = (obj, name, idx) => {
    const orig = obj[name]; mapped.push([obj, name, orig]);
    obj[name] = function (...args) { if (typeof args[idx] === "number") args[idx] = when(args[idx]); return orig.apply(this, args); };
  };
  ["setValueAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime", "setTargetAtTime"].forEach((m) => remap(P, m, 1));
  remap(P, "cancelScheduledValues", 0); remap(N, "start", 0); remap(N, "stop", 0);
  /* A buffer source has its own start (with an offset and a duration) */
  if (Object.prototype.hasOwnProperty.call(B, "start")) remap(B, "start", 0);
  if (Object.prototype.hasOwnProperty.call(B, "stop")) remap(B, "stop", 0);
  const music = K.bus("music");

  /* Notes */
  const A1 = 55, A2 = 110, C3 = 130.81, F2 = 87.31, G2 = 98, E2 = 82.41;
  const A3 = 220, C4 = 261.63, D4 = 293.66, E4 = 329.63, F3 = 174.61, G3 = 196, B3 = 246.94, Gs3 = 207.65, A4 = 440;
  /* The chords, voiced around middle C, and their roots for the bass */
  const CHORDS = { Am: [A3, C4, E4], F: [F3, A3, C4], C: [G3, C4, E4], G: [G3, B3, D4], E: [Gs3, B3, E4] };
  const ROOT = { Am: A2, F: F2, C: C3, G: G2, E: E2 };

  /* Voices, built from oscillators on the music bus */
  function env(g, t, a, peak, dur, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function voice(type, f, t, dur, peak, a, rel, dest, detune) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; if (detune) o.detune.value = detune;
    env(g, t, a, peak, dur, rel);
    o.connect(g); g.connect(dest || music); o.start(t); o.stop(t + dur + 0.05);
  }
  /* A glass bell: the motif's voice */
  function bell(f, t, peak, dest) {
    voice("sine", f, t, 3.2, peak, 0.01, 3.1, dest);
    voice("sine", f * 2.01, t, 1.4, peak * 0.28, 0.005, 1.35, dest);
    voice("sine", f * 3.02, t, 0.6, peak * 0.1, 0.004, 0.55, dest);
  }
  /* A soft pad: two detuned saws per note through a low-pass */
  const padBus = ctx.createBiquadFilter(); padBus.type = "lowpass"; padBus.frequency.value = 900; padBus.Q.value = 0.5; padBus.connect(music);
  function pad(chord, t, dur, peak) {
    CHORDS[chord].forEach((f) => { voice("sawtooth", f, t, dur, peak, 1.2, 1.4, padBus, -5); voice("sawtooth", f, t, dur, peak, 1.2, 1.4, padBus, 5); });
  }
  function bass(f, t, dur, peak) { voice("sine", f, t, dur, peak, 0.02, dur * 0.8); voice("triangle", f, t, dur, peak * 0.25, 0.02, dur * 0.8); }
  const pluckBus = ctx.createBiquadFilter(); pluckBus.type = "lowpass"; pluckBus.frequency.value = 2400; pluckBus.connect(music);
  function pluck(f, t, peak) { voice("triangle", f, t, 0.45, peak, 0.004, 0.44, pluckBus); }
  function thump(t, peak) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    env(g, t, 0.005, peak, 0.28, 0.27); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.3);
  }
  function drone(f, t, dur, peak, a, rel) { voice("sine", f, t, dur, peak, a || 2, rel || Math.min(2, dur / 3)); }

  /* The motif */
  const out = (t, k) => { bell(A4, t, 0.11 * (k || 1)); bell(E4, t + 0.5, 0.1 * (k || 1)); };
  const inward = (t, k) => { bell(E4, t, 0.1 * (k || 1)); bell(A4, t + 0.5, 0.11 * (k || 1)); };

  /* Calls into the game's sounds at a time on the timeline: the offline
     context pauses there, so the engine's "now" is that time */
  const calls = new Map();
  const q = (t) => Math.round(t * ctx.sampleRate / 128) * 128 / ctx.sampleRate;
  function at(t, fn) { const k = q(when(t)); if (!calls.has(k)) calls.set(k, []); calls.get(k).push(fn); }

  /* 0-4.5 s, the boot: the hum fades in under the black; the relay at
     the power-on, 1.5; a low A drone enters under the end, and the hum
     spins down on the cut to Haas */
  at(0.05, () => S.snd.machine(true));
  at(1.5, () => S.snd.boot());
  const BOOT = ["CESEA SITE OS 7.2 (c) 2079 CESEA", "Memory check ......... 64 GB OK", "Drive 0 .............. spun up, 4 TB", "Reactor link ......... 48 MW OK", "Uplink relay ......... R-09 idle", "Directory ............ ldaps://dir.selk.cesea.internal OK", "Unit bus ............. 31 units online", "Structure monitor .... ALARM", "Supervisor sleep ..... ended 26-02-2097"];
  const STEP = 1 / (140 * 0.3);

  /* No key clicks under the typing */
  drone(A1, 2.4, 2.15, 0.05, 1.0, 0.3);
  at(5.0, () => S.snd.machine(false));

  /* 5-32.75 s, the real past at 60 BPM: a pad on A minor, F, C, G, a low A
     under it, and the motif on each scene: out on the space scenes, in on
     Winogradsky and Movile. Over FILES (12-17) the hum comes back, and the
     click on HISTORY at 14.0 */
  const prog = [["Am", 5], ["F", 9], ["C", 13], ["G", 17], ["Am", 21], ["F", 25], ["E", 29]];
  prog.forEach(([c, t], i) => { pad(c, t, (i < prog.length - 1 ? prog[i + 1][1] : 32.75) - t + 0.4, 0.016); bass(ROOT[c], t, 3.9, 0.07); });
  drone(A2 / 2, 5, 27.75, 0.035, 3);
  out(5.0); inward(8.5);
  [17, 19.25, 21.5, 23.75, 26, 28.25].forEach((t) => out(t, 0.9));
  inward(30.5);
  at(11.6, () => S.snd.machine(true));
  at(14.0, () => S.snd.ui("select"));
  at(17.0, () => S.snd.machine(false));

  /* 32.75-52.75 s, the timelapse: the tempo rises from 60 to 70 BPM;
     plucks on the eighths from the start, the bass on the bars from
     Bucharest (41.75), a thump on every beat from Brno (43.75), plucks an
     octave up from Debrecen (45.75); Ax-4 (36.75) gets the motif out; at
     Selk (48.75) both motifs sound at once as the lab is built, the layers
     swell, and everything stops dead on the cut at 52.75 */
  const T0 = 32.75, END = 52.75;
  const beatAt = (k) => T0 + (-1 + Math.sqrt(1 + 4 * k / 240)) * 120;
  const BARS = ["Am", "F", "C", "G"];
  for (let k = 0; beatAt(k / 2) < END - 0.02; k++) {
    const t = beatAt(k / 2), beat = Math.floor(k / 2), bar = Math.floor(beat / 4), c = t >= 48.75 ? (bar % 2 ? "E" : "Am") : BARS[bar % 4];
    const tones = CHORDS[c], swell = t > 48.75 ? 1 + (t - 48.75) / 4 * 0.8 : 1;
    pluck(tones[(k + (beat % 2)) % 3] * (k % 4 === 3 ? 2 : 1), t, (0.07 + 0.03 * (t - T0) / 20) * swell);
    if (t >= 45.75) pluck(tones[(k + 1) % 3] * 2, t + 0.01, 0.04 * swell);
    if (k % 2 === 0) {
      if (t >= 43.75) thump(t, 0.24 * swell);
      if (t >= 41.75 && beat % 2 === 0) bass(ROOT[c], t, 0.9, 0.11 * swell);
      if (beat % 4 === 0) pad(c, t, Math.min(4, END - t), 0.016 * swell);
    }
  }
  out(36.75);
  out(48.75, 1.2); inward(48.75, 1.2);
  drone(A1, 48.75, END - 48.75, 0.05, 2.5);

  /* 52.75 s, the score stops. The ALARM line: the game's error sound once,
     its POST beep; the hum is back */
  at(52.4, () => S.snd.machine(true));
  at(52.75, () => S.snd.error());
  /* The next line types on without key clicks, as at the start */

  /* 53.75-63.75 s, the alarm tone: the falling fourth A to E in the score's
     register and timbre, on every pulse of the beacon (once a second, from
     53.75), under the shelter, STOPPED-REPAIRS and the desk; the click on
     2:WATCH at 63.55; WATCH opens and the tone cuts out */
  for (let t = 53.75; t < 63.5; t += 1) {
    bell(A4, t, 0.13); voice("triangle", A4, t, 0.3, 0.035, 0.005, 0.28);
    bell(E4, t + 0.35, 0.12); voice("triangle", E4, t + 0.35, 0.3, 0.032, 0.005, 0.28);
  }
  at(63.55, () => S.snd.ui("tab"));
  /* The clicks a little louder than the game plays them, so they are
     heard over the score: the interface channel at 0.9 instead of 0.75,
     and at 1.4 around the click on 2:WATCH, the one the shot builds to */
  const uiLevel = K.bus("ui").gain;
  uiLevel.setValueAtTime(0.9, 0.1);
  uiLevel.setValueAtTime(1.4, 63.5); uiLevel.setValueAtTime(0.9, 63.75);

  /* 63.75-77.75 s, WATCH and MAST-01: the wind; the first creak as WATCH
     opens, a gust and a creak when the screen shakes (65.95), the hum gone
     as the picture goes outside (69.75); on MAST-01's two gusts (72.95,
     75.85) the wind gusts and the tower creaks, left then right */
  function creak(t, s, side) {
    at(t, () => {
      const where = K.placed(K.bus("struct"), side * 0.6);
      K.tone(105, 1.2 + s, "sawtooth", 0.02 + 0.03 * s, 0, 68, where);
      K.burst(240, 6, 0.15 * s, 0.9 + s * 0.6, 0.05, null, where);
      K.tone(80, 0.7, "sine", 0.1 * s, 0.9, 55, where);
    });
  }
  at(63.75, () => { S.snd.setWind(0.4); S.snd.ambient(true); });
  /* The storm outside, under the game's wind: low rumbling noise, louder
     once the picture is outside with the tower */
  const storm = K.loopNoise(380, 0.7, "lowpass", 0.0001, K.bus("struct"));
  storm.g.gain.setValueAtTime(0.0001, 63.75); storm.g.gain.exponentialRampToValueAtTime(0.05, 65.5);
  storm.g.gain.setValueAtTime(0.05, 69.6); storm.g.gain.exponentialRampToValueAtTime(0.16, 70.4);
  storm.g.gain.setValueAtTime(0.16, 77.2); storm.g.gain.exponentialRampToValueAtTime(0.0001, 77.75);
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.21; lfoG.gain.value = 180;
  lfo.connect(lfoG); lfoG.connect(storm.f.frequency); lfo.start(63.75); lfo.stop(77.8);
  creak(64.1, 0.6, -1);
  at(65.75, () => S.snd.gust(0.7));
  creak(66.0, 0.9, 1);
  at(69.75, () => { S.snd.machine(false); S.snd.setWind(0.9); });
  at(72.55, () => S.snd.gust(1));
  creak(72.95, 1, -1);
  at(75.5, () => S.snd.gust(0.85));
  creak(75.85, 0.8, 1);
  at(77.75, () => S.snd.ambient(false));

  /* 77.75-87.75 s, the title: a second of silence, then one low A held to
     the cut */
  drone(A1, 78.75, 9.05, 0.09, 1.2, 0.04);
  drone(A2, 78.75, 9.05, 0.045, 1.5, 0.04);

  /* The sound effects of the scenes, on their own channel into the game's
     master (its high-pass and compressor), each placed in the stereo field */
  const fx = ctx.createGain(); fx.gain.value = 1; fx.connect(K.master());
  const place = (where) => { const p = ctx.createStereoPanner(); p.pan.value = where; p.connect(fx); return p; };
  const NOISE = (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  /* Filtered noise from t for dur, its level shaped by env (a, peak, rel) */
  function noise(t, dur, freq, q, type, peak, a, rel, dest) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = NOISE; src.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
    env(g, t, a, peak, dur, rel);
    src.connect(f); f.connect(g); g.connect(dest || fx); src.start(t, (t * 7.3) % 3); src.stop(t + dur + 0.05);
    return f;
  }
  function beep(f, t, dur, peak, type, dest) { voice(type || "sine", f, t, dur, peak, 0.004, 0.01, dest || fx); }

  /* The space scenes: information carried by radio */
  /* Sputnik 1 (21.5-23.75): its beeps, a tone on and off every 0.3 s,
     through the hiss of the receiver, panned with the satellite's crossing */
  const sput = place(0);
  sput.pan.setValueAtTime(-0.7, 21.5); sput.pan.linearRampToValueAtTime(0.7, 23.75);
  noise(21.5, 2.25, 3000, 0.4, "bandpass", 0.03, 0.2, 0.3, sput);
  for (let t = 21.6; t < 23.6; t += 0.6) { beep(1320, t, 0.3, 0.05, "triangle", sput); beep(1320 * 2, t, 0.3, 0.008, "sine", sput); }
  /* Gagarin (23.75-26): the rumble from ignition (24.0) to past the rocket
     leaving (25.25); a radio crackle and the quindar tone of the link as
     ПОЕХАЛИ! appears at liftoff (24.5) */
  const rum = noise(24.0, 2.0, 160, 0.7, "lowpass", 0.35, 0.35, 1.2);
  rum.frequency.setValueAtTime(120, 24.0); rum.frequency.linearRampToValueAtTime(320, 24.6); rum.frequency.linearRampToValueAtTime(140, 26.0);
  noise(24.45, 0.5, 2200, 1.5, "bandpass", 0.05, 0.01, 0.2, place(0.4));
  beep(2525, 24.5, 0.25, 0.03, "sine", place(0.4));
  /* Remek and Hermaszewski (26-28.25): telemetry chirps while the Soyuz
     closes in, the clunk of docking at 27.5, a short data burst after */
  const tel = place(0.3);
  [26.15, 26.5, 26.85, 27.15].forEach((t, i) => { beep(1200, t, 0.06, 0.03, "square", tel); beep(2200, t + 0.07, 0.06, 0.025, "square", tel); if (i % 2) beep(1700, t + 0.14, 0.05, 0.02, "square", tel); });
  noise(27.5, 0.35, 220, 0.9, "lowpass", 0.3, 0.004, 0.32); beep(70, 27.5, 0.35, 0.15, "sine");
  for (let i = 0; i < 10; i++) beep([1200, 2200][(i * 7) % 2], 27.75 + i * 0.045, 0.035, 0.02, "square", tel);
  /* Prunariu (28.25-30.5): the retro rockets fire under the capsule
     (29.6) and it lands (29.75) */
  noise(29.6, 0.35, 900, 0.6, "lowpass", 0.25, 0.01, 0.3);
  noise(29.75, 0.6, 180, 0.8, "lowpass", 0.3, 0.005, 0.55); beep(60, 29.75, 0.4, 0.14, "sine");
  /* Ax-4 (36.75-41.75): the quindar tones that open and close each voice
     transmission, data on the link as the Dragon closes in, the docking
     clunk at 39.25, and the data again */
  const link = place(-0.3);
  beep(2525, 37.0, 0.25, 0.03, "sine", link); beep(2475, 38.6, 0.25, 0.03, "sine", link);
  noise(37.3, 1.2, 1800, 2, "bandpass", 0.02, 0.05, 0.3, link);
  for (let i = 0; i < 16; i++) beep([1270, 1070, 2225, 2025][(i * 5) % 4], 37.35 + i * 0.07, 0.05, 0.018, "square", link);
  noise(39.25, 0.4, 220, 0.9, "lowpass", 0.3, 0.004, 0.36); beep(66, 39.25, 0.4, 0.15, "sine");
  for (let i = 0; i < 20; i++) beep([1270, 1070, 2225, 2025][(i * 3) % 4], 39.7 + i * 0.05, 0.04, 0.016, "square", link);
  beep(2525, 40.85, 0.25, 0.028, "sine", link);

  /* The euro crisis, Athens 2008-2015 (32.75-34.75): a crowd in the
     streets, a siren passing, and coins falling, scattered across the picture */
  const crowd = noise(32.75, 2.1, 700, 0.8, "bandpass", 0.11, 0.25, 0.5, place(-0.2));
  const am = ctx.createOscillator(), amG = ctx.createGain(); am.frequency.value = 3.1; amG.gain.value = 260; am.connect(amG); amG.connect(crowd.frequency); am.start(32.75); am.stop(34.9);
  const sir = ctx.createOscillator(), sg = ctx.createGain(), sp = place(-0.8);
  sir.type = "triangle";
  for (let t = 32.8, k = 0; t < 34.75; t += 0.45, k++) sir.frequency.setValueAtTime(k % 2 ? 450 : 600, t);
  sp.pan.linearRampToValueAtTime(0.8, 34.75);
  env(sg, 32.8, 0.3, 0.035, 1.95, 0.6); sir.connect(sg); sg.connect(sp); sir.start(32.8); sir.stop(34.8);
  [33.1, 33.35, 33.5, 33.9, 34.05, 34.4].forEach((t, i) => { const p = place(((i * 37) % 10) / 10 - 0.5); beep(3950 + i * 130, t, 0.12, 0.03, "sine", p); beep(5230 + i * 90, t + 0.004, 0.08, 0.015, "sine", p); beep(2100, t + 0.09, 0.06, 0.012, "sine", p); });

  /* The places: a quiet bed of sound under each animation, on its own
     channel at a little over a third of the effects' level, so the music
     stays in front */
  const amb = ctx.createGain(); amb.gain.value = 0.38; amb.connect(fx);
  /* Titan: everything heard outside at Selk is muted. The air is cold and
     dense, and what carries through it, and through the shelter's walls,
     is the low end: the crater's sounds, and the game's wind and
     structure channels (wind, gusts, creaks, the storm) pass through a
     low-pass at 600 Hz */
  const muffle = () => { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 600; f.Q.value = 0.5; return f; };
  const titanAmb = muffle(); titanAmb.connect(amb);
  ["wind", "struct"].forEach((k) => { const b = K.bus(k), f = muffle(); b.disconnect(); b.connect(f); f.connect(K.duck()[k]); });
  const spot = (where) => { const p = ctx.createStereoPanner(); p.pan.value = where; p.connect(amb); return p; };
  const bed = (t0, t1, freq, q, type, peak, where) => noise(t0, t1 - t0, freq, q, type, peak, 0.25, 0.3, spot(where || 0));
  const chirp = (t, f0, f1, dur, peak, where) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.005, peak, dur, dur * 0.6); o.connect(g); g.connect(spot(where || 0)); o.start(t); o.stop(t + dur + 0.02);
  };
  const tick = (t, f, peak, where) => noise(t, 0.03, f, 4, "bandpass", peak, 0.002, 0.025, spot(where || 0));
  const bird = (t, where) => { chirp(t, 3200, 4600, 0.07, 0.05, where); chirp(t + 0.09, 3600, 5200, 0.06, 0.04, where); chirp(t + 0.2, 4200, 3300, 0.09, 0.04, where); };
  const car = (t, dir, peak) => { const p = spot(-dir * 0.8); p.pan.linearRampToValueAtTime(dir * 0.8, t + 1.4); noise(t, 1.4, 500, 0.7, "lowpass", peak, 0.6, 0.7, p); };
  const ding = (t, f, peak, where) => { chirp(t, f, f * 0.995, 0.6, peak, where); chirp(t, f * 2.76, f * 2.75, 0.25, peak * 0.3, where); };

  /* Haas, Sibiu by night (5-8.5): crickets outside, the candle's faint
     flutter, and the quill scratching as it inks (5.25-8) */
  bed(5, 8.5, 260, 0.6, "lowpass", 0.05, -0.2);
  for (let t = 5.1; t < 8.4; t += 0.31) { chirp(t, 4400, 4500, 0.04, 0.02, 0.6); chirp(t + 0.06, 4400, 4500, 0.04, 0.016, 0.6); }
  for (let t = 5.25, k = 0; t < 8; t += 0.09 + ((k * 7) % 5) * 0.03, k++) noise(t, 0.05 + (k % 3) * 0.02, 5200, 1.2, "bandpass", 0.07, 0.01, 0.04, spot(0.3));
  /* Winogradsky, the laboratory in Strasbourg (8.5-12): a clock ticking,
     the microscope's focus wheel */
  for (let t = 8.6; t < 12; t += 0.5) tick(t, 2600, 0.06, -0.5);
  noise(9.0, 0.4, 1400, 3, "bandpass", 0.03, 0.05, 0.3, spot(0.2));
  /* FILES (12-17) is on the desk, under the hum */
  /* Tsiolkovsky, Kaluga (17-19.25): a wall clock, wind on the planks */
  bed(17, 19.25, 700, 0.5, "bandpass", 0.04, 0.4);
  for (let t = 17.1; t < 19.25; t += 0.6) tick(t, 1900, 0.06, -0.4);
  /* Oberth, the press (19.25-21.5): the bar pulled, the platen down with a
     thud (20.1), the bar back with a knock (21.0), paper */
  noise(19.6, 0.5, 900, 1, "bandpass", 0.04, 0.2, 0.2, spot(0.3));
  noise(20.1, 0.25, 160, 0.8, "lowpass", 0.22, 0.004, 0.22, spot(0)); beep(75, 20.1, 0.25, 0.1, "sine", amb);
  noise(21.0, 0.08, 700, 2, "bandpass", 0.16, 0.003, 0.07, spot(0.2));
  noise(20.4, 0.5, 4000, 0.7, "highpass", 0.03, 0.15, 0.3, spot(-0.5));
  /* Sputnik (21.5-23.75): space is silent; its beeps carry the scene */
  /* Gagarin, the steppe at Baikonur (23.75-26): wind under the rumble */
  bed(23.75, 26, 420, 0.5, "lowpass", 0.08, -0.3);
  /* Remek and Hermaszewski, aboard Salyut 6 (26-28.25): the station's fans */
  bed(26, 28.25, 300, 0.8, "bandpass", 0.06, 0); beep(120, 26, 2.25, 0.015, "sine", amb);
  /* Prunariu, the steppe (28.25-30.5): wind, the canopy flapping */
  bed(28.25, 30.5, 500, 0.5, "lowpass", 0.08, 0.3);
  for (let t = 28.4; t < 29.6; t += 0.22) noise(t, 0.12, 300, 1.5, "bandpass", 0.06, 0.01, 0.1, spot(-0.2));
  /* Movile Cave (30.5-32.75): the cave's low air, drips into the water,
     the bubbles breaking at the mat (31.4, 32.1) */
  bed(30.5, 32.75, 120, 0.7, "lowpass", 0.07, 0);
  [30.7, 31.15, 31.9, 32.4].forEach((t, i) => chirp(t, 1800 - i * 120, 700, 0.05, 0.05, i % 2 ? 0.4 : -0.4));
  [31.4, 32.1].forEach((t) => { chirp(t, 600, 1400, 0.04, 0.05, 0.1); noise(t, 0.05, 1500, 2, "bandpass", 0.05, 0.003, 0.04, spot(0.1)); });

  /* The timelapse: each city's day passing quickly */
  /* Athens (32.75-34.75): traffic under the crowd */
  car(32.9, 1, 0.08); car(33.7, -1, 0.07);
  /* Kraków (34.75-36.75): the Vistula flowing, birds, a bell */
  bed(34.75, 36.75, 650, 0.6, "lowpass", 0.08, 0);
  bird(35.0, -0.6); bird(35.9, 0.5);
  ding(35.3, 523, 0.04, 0.4);
  /* Ax-4 (36.75-41.75): the station's fans under the link */
  bed(36.75, 41.75, 300, 0.8, "bandpass", 0.05, 0);
  /* Bucharest (41.75-43.75): traffic on the boulevard, the strike's crowd
     chanting in 2033 and 2034 (42.4-42.7) */
  car(41.8, 1, 0.09); car(42.5, -1, 0.08); car(43.1, 1, 0.08);
  [42.38, 42.62].forEach((t) => noise(t, 0.22, 600, 1.2, "bandpass", 0.1, 0.03, 0.15, spot(0)));
  /* Brno (43.75-45.75): the panel robot on its site (2049-2051, 44.0-44.5)
     whirring and setting a panel with a clank; the tram's bell and its
     rumble on the boulevard */
  { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = "sawtooth"; f.type = "lowpass"; f.frequency.value = 700;
    o.frequency.setValueAtTime(140, 44.0); o.frequency.linearRampToValueAtTime(220, 44.4); env(g, 44.0, 0.05, 0.04, 0.45, 0.1); o.connect(f); f.connect(g); g.connect(spot(0.5)); o.start(44.0); o.stop(44.5); }
  noise(44.5, 0.15, 900, 2, "bandpass", 0.12, 0.002, 0.13, spot(0.5));
  ding(44.9, 1250, 0.05, -0.3); ding(45.05, 1250, 0.04, -0.3);
  noise(44.8, 0.95, 170, 0.8, "lowpass", 0.1, 0.2, 0.4, spot(-0.2));
  /* Debrecen (45.75-48.75): the busy street; from 2067 (46.5) bicycle
     bells; the monorail's hum from 2070 (47.0); birds in the park from
     2074 (47.75) */
  car(45.8, 1, 0.09); car(46.1, -1, 0.09);
  ding(46.55, 2300, 0.04, 0.3); ding(46.68, 2300, 0.035, 0.3);
  noise(47.0, 0.7, 900, 3, "bandpass", 0.05, 0.25, 0.3, spot(-0.4));
  bird(47.85, -0.5); bird(48.3, 0.4);
  /* Selk crater (48.75-52.75), heard through Titan's air (below): the wind;
     the units printing the lab while 2079 holds (49.1-50.0); the tower's
     lattice going up later */
  const tspot = (where) => { const p = ctx.createStereoPanner(); p.pan.value = where; p.connect(titanAmb); return p; };
  noise(48.75, 4, 300, 0.6, "lowpass", 0.12, 0.25, 0.3, tspot(-0.2));
  { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = 118;
    env(g, 49.1, 0.08, 0.04, 0.9, 0.2); o.connect(g); g.connect(tspot(-0.3)); o.start(49.1); o.stop(50.05); }
  [51.4, 51.8, 52.2].forEach((t) => noise(t, 0.12, 700, 2, "bandpass", 0.1, 0.004, 0.1, tspot(0.5)));

  /* The gusts hitting the tower (72.95, 75.85): a dull blow on the
     printed-ice shell, its low inharmonic ring dying away, and the guy
     cables thrumming as they take the load. On the structure channel, so
     Titan's low-pass mutes them like the creaks */
  function hit(t, s, side) {
    const where = ctx.createStereoPanner(); where.pan.value = side * 0.4; where.connect(K.bus("struct"));
    noise(t, 0.35, 110, 0.7, "lowpass", 0.5 * s, 0.006, 0.33, where);
    [[52, 2.6, 0.09], [83, 2.0, 0.06], [131, 1.4, 0.04], [197, 0.9, 0.025]].forEach(([f, d, v]) => voice("sine", f, t + 0.01, d, v * s, 0.008, d * 0.95, where));
    voice("sine", 41, t + 0.15, 2.4, 0.05 * s, 0.6, 1.4, where);
    voice("sine", 41.6, t + 0.15, 2.4, 0.04 * s, 0.6, 1.4, where);
  }
  hit(72.95, 1, -1);
  hit(75.85, 0.8, 1);

  /* The end: the click of POWER ON, under the cursor, just before the cut */
  at(87.6, () => S.snd.click());

  /* The score is built: the game's own calls during the render keep the
     context's clock as it is */
  mapped.forEach(([obj, name, orig]) => { obj[name] = orig; });

  /* Render: the calls at their times, then the whole buffer */
  [...calls.keys()].sort((a, b) => a - b).forEach((k) => {
    ctx.suspend(k).then(() => { calls.get(k).forEach((fn) => fn()); ctx.resume(); });
  });
  window.RENDER = ctx.startRendering().then((buf) => {
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const pcm = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) {
      pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767;
      pcm[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767;
    }
    let s = ""; const b = new Uint8Array(pcm.buffer);
    for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode.apply(null, b.subarray(i, i + 32768));
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    return { pcm: btoa(s), rate: buf.sampleRate, peak };
  });
})();
