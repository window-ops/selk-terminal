/* DISASSEMBLY.RUN art (js/games/disassembly/art/): the pictures of the
   tools, for their buttons. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, C = A.C;
  var K = A.K, W = A.W, H = A.H, PX = A.PX, PY = A.PY, PW = A.PW, PH = A.PH, TRAY = A.TRAY, DRAWER = A.DRAWER, RADIUS = A.RADIUS;
  var r = A.r, f = A.f, round = A.round, disc = A.disc, ring = A.ring, poly = A.poly, hull = A.hull;
  /* A tool on a 40 by 20 canvas, for its button and while it is dragged: the
     heat pad with its warmth, the suction cup with a pick, the Phillips
     screwdriver */
  function tool(ctx, id) {
    var keep = A.g;
    A.g = ctx;
    A.g.clearRect(0, 0, 40, 20);
    function p(x, y, w, h, c) { A.g.fillStyle = c; A.g.fillRect(x, y, w, h); }
    if (id === "heat") {
      p(6, 8, 28, 10, C.glow); p(6, 8, 28, 1, C.haze); p(8, 10, 24, 6, C.copper);
      for (var w = 0; w < 3; w++) { p(11 + w * 8, 2, 1, 2, C.glow); p(12 + w * 8, 4, 1, 2, C.glow); p(11 + w * 8, 6, 1, 1, C.glow); }
    } else if (id === "pry") {
      p(4, 4, 14, 3, C.blue); p(6, 2, 10, 2, C.blueLit); p(10, 7, 2, 6, C.dust); p(6, 13, 10, 4, C.dust);
      for (var k = 0; k < 10; k++) { p(22 + k, 16 - k, 10 - k, 1, C.blueLit); }
    } else if (id === "glue") {
      p(4, 4, 30, 12, C.white); p(4, 4, 30, 1, C.haze); p(6, 7, 26, 1, C.dust); p(6, 11, 22, 1, C.dust); p(30, 12, 6, 4, C.blue);
    } else {
      /* The handle, a silver collar into the shaft, and the cross tip */
      p(2, 6, 14, 8, C.red); p(2, 6, 14, 1, C.haze); p(3, 13, 12, 1, C.copper);
      p(16, 7, 2, 6, C.dust); p(18, 8, 2, 4, C.dust); p(16, 7, 2, 1, C.white);
      p(20, 9, 14, 2, C.dust); p(20, 9, 14, 1, C.white);
      p(34, 8, 2, 4, C.white); p(36, 9, 1, 2, C.white);
    }
    A.g = keep;
  }
  A.tool = tool;
})();
