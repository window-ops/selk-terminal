/* The theme of the end of TROIKA.RUN (js/games/troika/ending.js), from the
   timelapse to the olive tree. It follows the answer to the economist
   (start's level, 0 to 3):
   - 0, the status quo: D minor, slow, D minor, B flat, F, C, with no
     drums;
   - 1: the same in D dorian, a little brighter;
   - 2 and 3: D major, D, A, B minor, G, quicker, with a light hi-hat, and
     at 3 the melody doubled an octave up.
   A plucked bass, a pad and a melody of eight bars on the notes of each
   chord. It plays on the music channel through S.snd.troikaSong
   (troika-song.js), and finishing it closes it on its first chord. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  var D4 = 293.66;
  /* For each mood: the chords (root and the pad above it, in semitones
     above D4) and the melody, one note a quarter, null for a rest */
  var MOODS = [
    { chords: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]],
      melody: [7, 5, 3, 2, 3, null, 0, null, 2, 3, 5, 7, 5, null, 3, null] },
    { chords: [[0, 3, 7], [-2, 2, 5], [5, 9, 12], [-5, -1, 2]],
      melody: [7, 9, 7, 5, 3, null, 2, null, 5, 7, 9, 10, 9, null, 7, null] },
    { chords: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]],
      melody: [9, 7, 4, 7, 9, null, 11, 9, 7, 4, 2, 4, 7, null, null, null] }
  ];
  function hz(semi) {
    return D4 * Math.pow(2, semi / 12);
  }
  S.snd.troikaCoda = S.snd.troikaSong({
    bpm: function (opt) { return opt.level ? 96 : 76; }, steps: 64, gain: 4.2,
    play: function (i, when, d, out, opt) {
      var level = opt.level || 0, mood = MOODS[Math.min(2, level)];
      var bar = Math.floor(i / 8) % 4, c = mood.chords[bar], beat = i % 8, t = when;
      if (i % 8 === 0) {
        c.forEach(function (n) { K.tone(hz(n), d * 7.8, "triangle", 0.011, t, null, out); });
      }
      if (beat === 0 || beat === 3 || beat === 6) { K.tone(hz(c[0] - 24), d * 1.6, "sawtooth", 0.03, t, null, out); }
      if (level >= 2 && beat % 2 === 1) { K.burst(7000, 0.8, 0.02, 0.03, t, "highpass", out, null, 0.3); }
      if (beat % 2 === 0) {
        var m = mood.melody[(Math.floor(i / 2)) % mood.melody.length];
        if (m !== null) {
          K.tone(hz(m + 12), d * 1.8, "square", 0.012, t, null, out);
          if (level >= 3) { K.tone(hz(m + 24), d * 1.6, "triangle", 0.01, t, null, out); }
        }
      }
    },
    /* It closes on its first chord, D minor or D major, held over the
       bass */
    ring: 5,
    end: function (when, d, out, opt) {
      var c = MOODS[Math.min(2, opt.level || 0)].chords[0];
      c.concat([c[0] + 12]).forEach(function (n) { K.tone(hz(n), 4.8, "triangle", 0.013, when, null, out); });
      K.tone(hz(c[0] - 24), 4.8, "sine", 0.06, when, null, out);
      K.tone(hz((MOODS[Math.min(2, opt.level || 0)].melody[0]) + 12), 3, "square", 0.01, when, null, out);
    }
  });
})();
