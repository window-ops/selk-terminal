/* Titan's weather: the wind (low rumble, howl, hiss), its strength from the
   telemetry, and gusts. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  var amb = null, wind = 0.2;
  S.snd.ambient = function (start) {
    var ctx = K.ctx();
    if (!ctx) {
      return;
    }
    if (start && !K.on()) {
      return;
    }
    if (start && !amb) {
      /* Wind fades in over a few seconds, spread across both speakers */
      var w = K.preset().width, out = K.bus("wind");
      amb = {
        low: K.loopNoise(300, 0.7, "lowpass", 0.0001, out),
        howl: K.loopNoise(900, 6, "bandpass", 0.0001, K.placed(out, 0.7 * w)),
        hiss: K.loopNoise(3500, 0.8, "bandpass", 0.0001, K.placed(out, -0.7 * w))
      };
      K.glide(amb.low.g.gain, 0.1 + 0.25 * wind, 4);
      K.glide(amb.howl.g.gain, 0.02 + 0.12 * wind, 5);
      K.glide(amb.hiss.g.gain, 0.004 + 0.03 * wind, 5);
      var l1 = ctx.createOscillator(), l1g = ctx.createGain();
      l1.frequency.value = 0.07; l1g.gain.value = 220; l1.connect(l1g); l1g.connect(amb.low.f.frequency); l1.start();
      var l2 = ctx.createOscillator(), l2g = ctx.createGain();
      l2.frequency.value = 0.13; l2g.gain.value = 380; l2.connect(l2g); l2g.connect(amb.howl.f.frequency); l2.start();
      var l3 = ctx.createOscillator(), l3g = ctx.createGain();
      l3.frequency.value = 0.031; l3g.gain.value = 0.05; l3.connect(l3g); l3g.connect(amb.howl.g.gain); l3.start();
      amb.lfos = [l1, l2, l3];
    } else if (!start && amb) {
      /* Fade out first, since stopping a playing noise source clicks */
      var a = amb, stopAt = ctx.currentTime + 0.6;
      amb = null;
      [a.low, a.howl, a.hiss].forEach(function (n) {
        K.glide(n.g.gain, 0, 0.5);
        try { n.src.stop(stopAt); } catch (e) {}
      });
      a.lfos.forEach(function (n) {
        try { n.stop(stopAt); } catch (e) {}
      });
    }
  };
  S.snd.setWind = function (w) {
    wind = Math.max(0, Math.min(1, w));
    /* Wind changes glide over two seconds; a step would cut into the
       fade-in at power-on and click every 2.5 s */
    if (K.ctx() && amb && K.on()) {
      K.glide(amb.low.g.gain, 0.1 + 0.25 * wind, 2);
      K.glide(amb.low.f.frequency, 260 + 500 * wind, 2);
      K.glide(amb.howl.g.gain, 0.02 + 0.12 * wind, 2);
      K.glide(amb.hiss.g.gain, 0.004 + 0.03 * wind, 2);
    }
  };
  S.snd.gust = function (strength) {
    if (!K.ctx() || !K.on()) {
      return;
    }
    var s = strength || 0.5, out = K.bus("wind");
    K.burst(400 + 600 * s, 0.5, 0.35 * s, 2.5 + s, 0, "lowpass", out);
    K.burst(1100 + 400 * s, 5, 0.12 * s, 2.2, 0.3, null, out);
    K.burst(3000, 0.8, 0.05 * s, 1.8, 0.2, null, out);
  };
})();
