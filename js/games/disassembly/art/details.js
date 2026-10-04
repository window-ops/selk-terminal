/* DISASSEMBLY.RUN art (js/games/disassembly/art/): the small details drawn
   on the layers: the marks printed on the Fairphone's bottom module, its
   camera bump, screw heads and lenses. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, C = A.C;
  var K = A.K, W = A.W, H = A.H, PX = A.PX, PY = A.PY, PW = A.PW, PH = A.PH, TRAY = A.TRAY, DRAWER = A.DRAWER, RADIUS = A.RADIUS;
  var r = A.r, f = A.f, round = A.round, disc = A.disc, ring = A.ring, poly = A.poly, hull = A.hull;
  /* The marks printed on the bottom module, in single pixels: the wavy
     vibration line, the speaker with its sound waves, and the USB-C port's
     outline */
  function speakerMark(ux, uy) {
    var X = Math.round(ux * K), Y = Math.round(uy * K);
    A.g.fillStyle = C.lens;
    [[-4, -3], [-3, -2], [-4, -1], [-3, 0], [-4, 1], [-3, 2], [-4, 3]].forEach(function (q) { A.g.fillRect(X + q[0], Y + q[1], 1, 1); });
    A.g.fillRect(X, Y - 1, 2, 3); A.g.fillRect(X + 2, Y - 2, 1, 5); A.g.fillRect(X + 3, Y - 3, 1, 7);
    A.g.fillRect(X + 5, Y - 1, 1, 3);
    A.g.fillRect(X + 6, Y - 3, 1, 1); A.g.fillRect(X + 7, Y - 2, 1, 5); A.g.fillRect(X + 6, Y + 3, 1, 1);
  }
  function portMark(ux, uy) {
    var X = Math.round(ux * K) - 4, Y = Math.round(uy * K) - 2;
    A.g.fillStyle = C.lens;
    A.g.fillRect(X + 1, Y, 6, 1); A.g.fillRect(X + 1, Y + 3, 6, 1); A.g.fillRect(X, Y + 1, 1, 2); A.g.fillRect(X + 7, Y + 1, 1, 2);
  }
  /* The camera bump's corners, in units inside the phone */
  var BUMP = [[19, 16], [36, 16], [18, 33]];
  /* The Fairphone's camera bump, on the top module: the main lens at the top
     left, the round sensor at the top right, the second lens under the
     first, and the flash between them */
  function bump(x, y) {
    var pts = BUMP.map(function (p) { return [x + p[0], y + p[1]]; });
    hull(pts, 9.5, C.dark); hull(pts, 8.5, C.bump);
    disc(x + 19, y + 16, 6.5, C.lens); lens(x + 19, y + 16);
    disc(x + 18, y + 33, 6.5, C.lens); lens(x + 18, y + 33);
    disc(x + 36, y + 16, 6.5, C.lens); ring(x + 36, y + 16, 6, C.frame);
    disc(x + 29.5, y + 28.5, 2, C.dust); disc(x + 29.5, y + 28.5, 1, C.white);
  }
  /* A Phillips screw head, or its empty hole once the screw is out */
  function screw(x, y) {
    if (A.loose) { disc(x, y, 1.2, C.dark); return; }
    disc(x, y, 1.5, C.dust);
    f(x - 1, y, 5, 1, C.dark); f(x, y - 1, 1, 5, C.dark);
  }
  function lens(x, y) {
    disc(x, y, 5, C.edge); ring(x, y, 4.5, C.dust); disc(x, y, 3.5, C.lens); ring(x, y, 2, C.glass);
    f(x - 2, y - 2, 2, 2, C.glassLit);
  }
  A.speakerMark = speakerMark; A.portMark = portMark; A.BUMP = BUMP; A.bump = bump; A.screw = screw; A.lens = lens;
})();
