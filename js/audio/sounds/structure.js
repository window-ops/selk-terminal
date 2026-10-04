/* The structure: MAST-01's creaks, placed left or right, and the thud of a
   heavy part. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  S.snd.creak = function (strength) {
    if (!K.ctx() || !K.on()) {
      return;
    }
    var s = strength || 0.5, where = K.placed(K.bus("struct"), (Math.random() * 2 - 1) * K.preset().width);
    K.tone(90 + Math.random() * 40, 1.2 + s, "sawtooth", 0.02 + 0.03 * s, 0, 60 + Math.random() * 20, where);
    K.burst(180 + Math.random() * 120, 6, 0.15 * s, 0.9 + s * 0.6, 0.05, null, where);
    if (Math.random() < 0.35 * s) {
      K.tone(80, 0.7, "sine", 0.1 * s, 0.9, 55, where);
    }
  };
  S.snd.thud = function () {
    if (!K.on()) return;
    K.tone(90, 0.5, "sine", 0.12, 0, 40, K.bus("struct")); K.burst(200, 0.6, 0.3, 0.5, 0, null, K.bus("struct"));
  };
})();
