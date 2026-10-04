/* DISASSEMBLY.RUN art (js/games/disassembly/art/): the Galaxy Note 7 joke. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, C = A.C;
  var K = A.K, W = A.W, H = A.H, PX = A.PX, PY = A.PY, PW = A.PW, PH = A.PH, TRAY = A.TRAY, DRAWER = A.DRAWER, RADIUS = A.RADIUS;
  var r = A.r, f = A.f, round = A.round, disc = A.disc, ring = A.ring, poly = A.poly, hull = A.hull;
  /* The joke when the Galaxy's screen is touched: a Galaxy Note 7 in Blue
     Coral, its curved screen lit with app icons, a home button and the
     earpiece. Its battery bursts on one side: fire jets out of the left
     edge near the top and a scorch spreads over the screen from there. t
     runs from 0 to 1 over the start and then stays at 1; secs is the time
     burning, for the flames. It is drawn on the Galaxy's display only. */
  function note7(t, secs) {
    var cx = PX + PW / 2, cy = PY + PH / 2, sh = t < 0.3 ? Math.round(Math.sin(t * 90) * 1.2) : 0;
    var x0 = cx - 14 + sh, y0 = cy - 44;
    A.g.save();
    A.g.beginPath(); A.g.rect((PX + 4) * K, (PY + 4) * K, 76 * K, 164 * K); A.g.clip();
    A.g.globalAlpha = 0.75; r(PX + 4, PY + 4, 76, 164, C.dark); A.g.globalAlpha = 1;
    /* The phone: the body, the curved screen with its edges, the icons */
    round(x0, y0, 42, 88, 6, C.coral); f(x0 + 6, y0, 60, 1, C.coralLit);
    round(x0 + 2, y0 + 8, 38, 70, 3, C.note);
    r(x0 + 2, y0 + 8, 2, 70, C.noteLit); r(x0 + 38, y0 + 8, 2, 70, C.noteLit);
    r(x0 + 6, y0 + 12, 30, 4, C.white);
    var icons = [C.leafLit, C.flame2, C.red, C.blueLit, C.haze, C.white];
    for (var ic = 0; ic < 12; ic++) { round(x0 + 7 + (ic % 4) * 8, y0 + 50 + Math.floor(ic / 4) * 8, 5, 5, 1.2, icons[ic % icons.length]); }
    round(x0 + 15, y0 + 4, 12, 1.5, 0.7, C.lens); disc(x0 + 30, y0 + 4.5, 1, C.lens);
    round(x0 + 15, y0 + 81, 12, 4, 2, C.coralLit); round(x0 + 15.5, y0 + 81.5, 11, 3, 1.5, C.coral);
    /* The scorch, spreading over the screen from the burst */
    if (t > 0.2) {
      var spread = Math.min(1, (t - 0.2) / 0.8);
      A.g.globalAlpha = 0.85;
      [[0, 30, 10], [6, 24, 9], [10, 34, 8], [16, 28, 7], [4, 40, 7], [20, 36, 6]].forEach(function (b, n) {
        if (n / 6 <= spread) { disc(x0 + 2 + b[0] * spread, y0 + b[1], b[2] * Math.max(0.4, spread), n % 2 ? C.char1 : C.char2); }
      });
      A.g.globalAlpha = 1;
    }
    if (t > 0.15 && t < 0.24) { A.g.globalAlpha = 0.55; disc(x0, y0 + 30, 26, C.flame1); A.g.globalAlpha = 1; }
    /* The jet of fire out of the left edge, and its smoke */
    if (t > 0.18) {
      for (var i = 0; i < 80; i++) {
        var life = (secs * 1.4 + (i % 10) / 10 + i * 0.031) % 1;
        var ang = -2.4 + Math.sin(i * 7.31) * 0.45;
        var dist = life * (20 + (i % 5) * 2);
        var px = x0 + Math.cos(ang) * dist + Math.sin(life * 11 + i) * 1.2;
        var py = y0 + 30 + Math.sin(ang) * dist - life * life * 8;
        var size = 4 - life * 2.6;
        var col = life < 0.2 ? C.white : life < 0.4 ? C.flame1 : life < 0.6 ? C.flame2 : life < 0.8 ? C.red : C.smokeLit;
        if (life > 0.8) { A.g.globalAlpha = 0.45; }
        disc(px, py, Math.max(0.8, size), col);
        A.g.globalAlpha = 1;
      }
    }
    A.g.restore();
  }
  A.note7 = note7;
})();
