/* The theme of the economist's office in TROIKA.RUN
   (js/games/troika/ending.js): quiet and slow under his voice, 72 beats a
   minute, four bars on D: D minor, B flat major, G minor and A with a flat
   ninth, the turn of the hijaz mode the run's music is in. A soft pad
   holds each chord, a low bass plucks its root, and a sine arpeggio walks
   up and down it. When it finishes it closes on D minor. It plays on the
   music channel through S.snd.troikaSong (troika-song.js). */
(function () {
  var S = window.SELK, K = S.snd.kit;
  var D3 = 146.83;
  /* The chords in semitones above D3: root, then the notes of the pad and
     of the arpeggio */
  var CHORDS = [[0, 3, 7, 10, 14], [-4, 0, 3, 7, 10], [-7, -4, 0, 3, 7], [-5, -1, 2, 7, 8]];
  var ARP = [1, 2, 3, 4, 3, 2, 1, 2];
  function hz(semi) {
    return D3 * Math.pow(2, semi / 12);
  }
  S.snd.troikaOffice = S.snd.troikaSong({
    bpm: 72, steps: 32, gain: 2.15,
    play: function (i, when, d, out) {
      var c = CHORDS[Math.floor(i / 8)], beat = i % 8;
      if (beat === 0) {
        [1, 2, 3].forEach(function (n) { K.tone(hz(c[n]), d * 7.6, "triangle", 0.012, when, null, out); });
        K.tone(hz(c[0] - 12), d * 3.5, "sine", 0.05, when, null, out);
      }
      if (beat === 4) { K.tone(hz(c[0] - 12), d * 3, "sine", 0.035, when, null, out); }
      K.tone(hz(c[ARP[beat]] + 12), d * 1.6, "sine", 0.016, when, null, out);
    },
    /* It closes on D minor, held */
    ring: 4,
    end: function (when, d, out) {
      [0, 3, 7, 12].forEach(function (n) { K.tone(hz(n), 3.8, "triangle", 0.014, when, null, out); });
      K.tone(hz(-12), 3.8, "sine", 0.05, when, null, out);
    }
  });
})();
