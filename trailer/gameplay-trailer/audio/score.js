/* The gameplay trailer's soundtrack: the score and the game's own sounds,
   written against the timeline (DESIGN.md sections 4 and 8). Everything
   is generated here or by the game's sound engine (common/vendor/audio);
   no recordings are used.

   The notes are written in audio/cue.js, and this file plays them exactly
   as written. It adds what the cue leaves out: the hum, the sign-in keys,
   the archive's sounds, the title's low E and the click of POWER ON.

   The score is in E minor, attentive and steady, warmer than the feature
   trailer's. Its motif is the rising fourth B to E, the interval of the
   game's mail chime (988 to 1319 Hz). Its clock is a film cue's: about
   79 BPM in bars of four beats, eased between the moments it catches and
   slower in the second round, so clicks, drops and cuts fall on beats.
   From the first chime to the stop every beat has the same texture: the
   guitar's close figure on each bar's chord, the mallets' melody, a soft
   pad, the bass, and brushes from the first drag. With each drag the
   guitar climbs and closes on the drop.

   A moment on screen is a melody note, struck harder. The game's click
   stays on OPEN REPORT 1 and BIO, and on the message openings only its
   first tap sounds. Each bar's loudness rises and falls with the scene,
   softer under reading. The players' small differences are in loudness;
   the timing is as written. The score stops dead on the click that sends
   REPORT 2 and stays out through the refusal and the locked section.

   gameplay-trailer/tools/score prints the cue, and the notes this file
   plays, as MusicXML and a PDF. */
"use strict";
(function () {
  const S = window.SELK, K = S.snd.kit, ctx = OFFLINE, RATE = ctx.sampleRate;
  S.snd.init();
  /* The engine waits for a live context to resume before it plays; the
     offline context is resumed by the render below, so it plays at once */
  K.ready = (fn) => fn();
  /* The game's interface sounds include square-wave tones (the ok, the
     error, the countdown's blips), whose sharp edges buzz on full-range
     speakers: in the trailer they pass through a gentle low-pass at 6 kHz,
     which rounds the edges and keeps the sounds as they are heard */
  { const ui = K.bus("ui"), soft = ctx.createBiquadFilter(); soft.type = "lowpass"; soft.frequency.value = 6000; soft.Q.value = 0.5;
    ui.disconnect(); ui.connect(soft); soft.connect(K.duck().ui); }
  /* The game pans the computer's hum a little left; in the trailer it is
     centered, so the opening is not lopsided on stereo speakers */
  { const hum = K.duck().machine; hum.disconnect(); hum.connect(K.master()); }

  /* The players' small differences: a seeded random of the score's own,
     so the engine's random sounds stay as they are */
  let seed = 98813190;
  const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
  const vary = (v, k) => v * (1 - (k || 0.12) + rnd() * 2 * (k || 0.12));

  /* The music channel: the score into the game's music bus, through a
     small room. The gate stops the score dead; the room rings on after it */
  const gate = ctx.createGain(), room = ctx.createConvolver(), wet = ctx.createGain();
  {
    const n = Math.round(RATE * 2.2), b = ctx.createBuffer(2, n, RATE);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c); let lp = 0;
      for (let i = 0; i < n; i++) { const t = i / RATE; lp += 0.3 * ((rnd() * 2 - 1) - lp); d[i] = t < 0.014 ? 0 : lp * Math.exp(-t / 0.5); }
    }
    room.buffer = b;
  }
  wet.gain.value = 0.3;
  gate.connect(K.bus("music")); gate.connect(room); room.connect(wet); wet.connect(K.bus("music"));
  const music = ctx.createGain(); music.gain.value = 1.6; music.connect(gate);

  /* The cue: every note of the score, written in audio/cue.js (window.CUE,
     loaded before this file), on the clock written there */
  const CUE = window.CUE, STOP = CUE.stop;
  const T = (() => {
    const b = CUE.clock.map((a) => a[1]), t = CUE.clock.map((a) => a[0]), n = b.length;
    const d = b.slice(0, -1).map((x, i) => (t[i + 1] - t[i]) / (b[i + 1] - x));
    const m = b.map((x, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i])));
    return (x) => {
      if (x > b[n - 1]) return t[n - 1] + (x - b[n - 1]) * m[n - 1];
      let i = 0; while (i < n - 2 && x > b[i + 1]) i++;
      const h = b[i + 1] - b[i], u = (x - b[i]) / h;
      return (2 * u ** 3 - 3 * u ** 2 + 1) * t[i] + (u ** 3 - 2 * u ** 2 + u) * h * m[i] + (-2 * u ** 3 + 3 * u ** 2) * t[i + 1] + (u ** 3 - u ** 2) * h * m[i + 1];
    };
  })();
  /* Note names to frequencies: "Fs5" is F sharp in octave 5 */
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const nh = (s) => 440 * Math.pow(2, (12 * (+s.slice(-1) + 1) + PC[s[0]] + (s[1] === "s" ? 1 : 0) - 69) / 12);

  /* Voices */
  function env(g, t, a, peak, dur, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function osc(type, f, t, dur, peak, a, rel, dest, detune) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; if (detune) o.detune.value = detune;
    env(g, t, a, peak, dur, rel);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  const placed = (dest, where) => { const p = ctx.createStereoPanner(); p.pan.value = where; p.connect(dest); return p; };
  const NOISE = (() => { const b = ctx.createBuffer(1, RATE * 2, RATE), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; return b; })();

  /* A plucked string (Karplus-Strong): a burst of soft noise circulating
     in a delay one period long, losing its highs on every pass. The string
     is damped at the end of the note */
  const strings = {};
  function string(f) {
    const key = f.toFixed(2);
    if (strings[key]) return strings[key];
    const len = Math.round(RATE * 2.4), b = ctx.createBuffer(1, len, RATE), y = b.getChannelData(0);
    const P = RATE / f - 0.5, N = Math.floor(P), fr = P - N, loss = Math.pow(0.001, 1 / (f * 2.2));
    let lp = 0;
    for (let i = 0; i < N + 2; i++) { lp += 0.45 * ((rnd() * 2 - 1) - lp); y[i] = lp; }
    for (let i = N + 2; i < len; i++) {
      const a = (y[i - N] + y[i - N - 1]) / 2, c = (y[i - N - 1] + y[i - N - 2]) / 2;
      y[i] = loss * ((1 - fr) * a + fr * c);
    }
    let peak = 0; for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(y[i]));
    for (let i = 0; i < len; i++) y[i] /= peak;
    return (strings[key] = b);
  }
  /* Each instrument has its place in the stereo field: the guitar a little
     left, the mallets a little right, the pad's voices spread to both
     sides, the bass and the kick in the middle, the brushes right */
  const GUITAR = -0.22, MALLETS = 0.22;
  const pluckTone = ctx.createBiquadFilter(); pluckTone.type = "lowpass"; pluckTone.frequency.value = 3200; pluckTone.connect(music);
  const guitarPan = placed(pluckTone, GUITAR);
  function pluck(f, t, v, len) {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = string(f);
    /* 2 ms in, so a string never starts with a click */
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.002); g.gain.setTargetAtTime(0, t + (len || 1.2), 0.07);
    s.connect(g); g.connect(guitarPan); s.start(t); s.stop(t + Math.min(2.4, (len || 1.2) + 0.6));
  }
  /* A mallet on a wooden bar: the motif's voice. Its partials at 1, 3.9 and
     9.6 times the note, the higher dying sooner, and the knock of the mallet */
  function mallet(f, t, v, where, soft) {
    const out = placed(music, where || 0);
    osc("sine", f, t, 1.6, v, 0.003, 1.6, out);
    osc("sine", f * 3.93, t, 0.32, v * 0.22, 0.002, 0.32, out);
    if (f * 9.6 < 16000) osc("sine", f * 9.6, t, 0.07, v * 0.07, 0.001, 0.07, out);
    /* No knock (soft) on a chord struck with a click of the game's, so the
       two are not heard as a double click */
    if (!soft) burst(t, 0.03, 1800, 1.2, "bandpass", v * 0.25, out);
  }
  /* A soft pad: two detuned triangles a note, closed down by a low-pass.
     One pad voice holds a note from start to end; it fades in over attack */
  const padTone = ctx.createBiquadFilter(); padTone.type = "lowpass"; padTone.frequency.value = 1300; padTone.Q.value = 0.4; padTone.connect(music);
  function padVoice(f, t, dur, v, attack, where) {
    const out = placed(padTone, where);
    osc("triangle", f, t, dur, v, attack, 0.4, out, -6);
    osc("triangle", f, t, dur, v, attack, 0.4, out, 6);
  }
  /* A soft bass, round and short */
  const bassTone = ctx.createBiquadFilter(); bassTone.type = "lowpass"; bassTone.frequency.value = 420; bassTone.connect(music);
  function bass(f, t, dur, v) {
    osc("sine", f, t, dur, v * 0.5, 0.012, dur * 0.85, bassTone);
    osc("triangle", f * 2, t, dur * 0.6, v * 0.12, 0.008, dur * 0.55, bassTone);
  }
  /* Filtered noise: brushes, the mallet's knock */
  function burst(t, dur, freq, q, type, peak, dest, a) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
    env(g, t, a || 0.002, peak, dur, dur);
    s.connect(f); f.connect(g); g.connect(dest || music); s.start(t, rnd() * 1.5); s.stop(t + dur + 0.05);
  }
  /* The brushes through a low-pass at 9 kHz: the noise's highest
     frequencies, near the top of what a file holds, made single-sample
     spikes where a brush met a mallet */
  const brushTone = ctx.createBiquadFilter(); brushTone.type = "lowpass"; brushTone.frequency.value = 9000; brushTone.Q.value = 0.5; brushTone.connect(music);
  const brushBus = placed(brushTone, 0.2);
  function brush(t, v, swish) { burst(t, swish ? 0.22 : 0.12, 5200, 0.6, "bandpass", v, brushBus, swish ? 0.07 : 0.004); }
  /* A soft kick, felt more than heard */
  function thump(t, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(78, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.2);
    env(g, t, 0.006, v, 0.26, 0.25); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.3);
  }

  /* The cue played as written. Notes written together sound together: no
     part is moved off the beat. The loudness comes from each bar's dynamic
     and, a little larger, from a note with a moment on screen; the players'
     small differences are in loudness only */
  const DYN = { p: 0.5, mp: 0.65, mf: 0.82, f: 1 };
  const level = (b) => DYN[CUE.dynamics[Math.min(CUE.bars - 1, Math.floor(b + 1e-6) >> 2)]];
  const P = CUE.parts;
  P.Melody.forEach(([b, notes, len, moment]) => notes.split(" ").forEach((x, i, all) =>
    mallet(nh(x), T(b), vary(0.12 * level(b) * (moment ? 1.25 : 1), 0.04), MALLETS + (all.length > 1 ? (i - 1) * 0.12 : 0))));
  P.Guitar.forEach(([b, notes, len, moment]) => notes.split(" ").forEach((x) =>
    pluck(nh(x), T(b), vary(0.085 * level(b) * (moment ? 1.3 : 1), 0.05), (T(b + len) - T(b)) * 1.05)));
  P.Bass.forEach(([b, notes, len]) => bass(nh(notes), T(b), (T(b + len) - T(b)) * 0.95, 0.13 * level(b)));
  P.Drums.forEach(([b, kind]) => (kind === "kick" ? thump(T(b), 0.15 * level(b)) : brush(T(b), vary(0.035 * level(b), 0.08))));
  /* The pad, legato: a note two chords share is held on, and only a voice
     that moves changes, crossing over 0.3 s; it enters with the first note
     of the melody */
  const PAD = P.Pad.map(([b, notes, len]) => [b, len, notes.split(" ")]);
  const padStart = T(P.Melody[0][0]);
  for (let i = 0; i < 4; i++) {
    for (let e = 0; e < PAD.length;) {
      let z = e; while (z + 1 < PAD.length && PAD[z + 1][2][i] === PAD[e][2][i]) z++;
      const t0 = e ? T(PAD[e][0]) : padStart, t1 = z + 1 < PAD.length ? T(PAD[z][0] + PAD[z][1]) + 0.3 : STOP + 0.4;
      padVoice(nh(PAD[e][2][i]), t0, t1 - t0, 0.022 * level(PAD[e][0]), e === 0 ? 1.2 : 0.3, i % 2 ? 0.3 : -0.3);
      e = z + 1;
    }
  }
  /* The score stops dead on the click that sends REPORT 2 */
  gate.gain.setValueAtTime(1, STOP - 0.012); gate.gain.linearRampToValueAtTime(0, STOP + 0.006);

  /* 58.2-68.2 s, the title: a second of silence, then one low E held to
     the cut */
  gate.gain.setValueAtTime(1, 59.0);
  osc("sine", nh("E2"), 59.2, 9.05, 0.02, 1.2, 0.04, music);
  osc("sine", nh("E3"), 59.2, 9.05, 0.012, 1.5, 0.04, music);

  /* The game's sounds, at their times on the timeline: the offline context
     pauses there, so the engine's "now" is that time */
  const calls = new Map();
  const q = (t) => Math.round(t * RATE / 128) * 128 / RATE;
  function at(t, fn) { const k = q(t); if (!calls.has(k)) calls.set(k, []); calls.get(k).push(fn); }
  /* The interface three times as loud as the game plays it, so the clicks,
     taps and tones are heard over the score */
  K.bus("ui").gain.setValueAtTime(2.25, 0.1);
  /* The machine hum under the desk, from the sign-in to the title, 6 dB
     under the game's level, so the score is in front of it */
  K.duck().machine.gain.setValueAtTime(0.5, 0);
  at(0.05, () => S.snd.machine(true));
  at(58.2, () => S.snd.machine(false));
  /* 0-4 s, the sign-in: a key for each letter of Cornelius and for Enter;
     the drive as the desk opens */
  [0.6, 0.866, 1.2, 1.6, 1.8, 2.6, 2.933, 3.133, 3.4, 3.9].forEach((t) => at(t, () => S.snd.key()));
  /* 4-46 s, the cue: the game's sounds written in it, at their times */
  const GAME = { drive: () => S.snd.hdd(2), press: () => S.snd.ui("select"), select: () => S.snd.ui("select"), link: () => S.snd.ui("link"), sweep: () => S.snd.sweep(), ok: () => S.snd.ok(),
    blip: () => S.snd.blip(),
    // the first tap of the game's click alone, on the message openings: its second tap would double the note
    tick: () => K.burst(3200, 2.5, 0.32, 0.018, 0, null, null, null, 0.5), click: () => S.snd.ui("action"), error: () => S.snd.error() };
  /* The ok and the error are two tones each, written as two entries: the
     game plays both from the first */
  CUE.game.forEach(([t, sound], i) => { if (!(sound === "ok" || sound === "error") || CUE.game[i - 1][1] !== sound) at(t, GAME[sound]); });
  /* 49.5-58.2 s, ARCHIVE, locked (the locked prompt opens without the
     click, which tells a player more than it adds to a trailer); ENTER
     PASSWORD; SELK typed, Enter, refused */
  at(51.38, () => S.snd.error());
  at(53.38, () => S.snd.ui("action"));
  [54.55, 54.8, 55.1, 55.45, 56.2].forEach((t) => at(t, () => S.snd.key()));
  at(56.25, () => S.snd.error());
  /* The end: the click of POWER ON, under the cursor, just before the cut */
  at(67.6, () => S.snd.click());

  /* Render: the calls at their times, then the whole buffer */
  [...calls.keys()].sort((a, b) => a - b).forEach((k) => {
    ctx.suspend(k).then(() => { calls.get(k).forEach((fn) => fn()); ctx.resume(); });
  });
  window.RENDER = ctx.startRendering().then((buf) => {
    const L = buf.getChannelData(0), R = buf.getChannelData(1), len = L.length;
    const pcm = new Int16Array(len * 2);
    for (let i = 0; i < len; i++) {
      pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767;
      pcm[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767;
    }
    let s = ""; const b = new Uint8Array(pcm.buffer);
    for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode.apply(null, b.subarray(i, i + 32768));
    let peak = 0; for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    return { pcm: btoa(s), rate: buf.sampleRate, peak };
  });
})();
