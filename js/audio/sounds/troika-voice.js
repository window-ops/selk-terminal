/* The economist's voice in TROIKA.RUN (js/games/troika/talk.js): no words,
   as in old pixel games, but a deep blip for the letters as they are typed.
   Each blip is a square wave near 80 Hz with a sawtooth an octave up,
   through a band-pass round 500 Hz that gives it the color of a vowel.
   The letter sets the pitch, a few semitones up or down, so the same
   sentence always sounds the same. The text types at the pace of speech in
   every motion setting (talk.js), so the voice always follows it. The
   voice plays on the interface channel. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  var BASE = 80, out = null;
  function live() {
    return K.on() && !(S.state && S.state.sound === false) && K.ctx();
  }
  /* The filter the blips go through, made once the context exists */
  function dest() {
    var ctx = K.ctx();
    if (!out) {
      out = ctx.createBiquadFilter(); out.type = "bandpass"; out.frequency.value = 520; out.Q.value = 0.9;
      var g = ctx.createGain(); g.gain.value = 2.4;
      out.connect(g); g.connect(K.bus("ui"));
    }
    return out;
  }
  /* The pitch of a letter, in semitones from BASE: vowels sit a little
     higher than consonants */
  function semis(ch) {
    var c = ch.toLowerCase().charCodeAt(0) || 0;
    return ("aeiouy".indexOf(ch.toLowerCase()) !== -1 ? 2 : 0) + (c * 7) % 5 - 2;
  }
  function blip(ch, when, pitch) {
    if (!/[A-Za-z0-9À-ɏͰ-Ͽ]/.test(ch)) { return; }
    var f = BASE * (pitch || 1) * Math.pow(2, semis(ch) / 12), d = dest();
    K.tone(f, 0.075, "square", 0.05, when || 0, f * 0.92, d);
    K.tone(f * 2, 0.06, "sawtooth", 0.018, when || 0, null, d);
  }
  S.snd.troikaVoice = {
    /* A blip for the letter ch; pitch raises the voice for the people of
       2097, 1 being the economist's */
    blip: function (ch, pitch) {
      if (!live()) { return; }
      blip(ch, 0, pitch);
    }
  };
})();
