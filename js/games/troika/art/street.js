/* TROIKA.RUN art (js/games/troika/art/): the props along the pavement and
   the road. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r;
  /* A kiosk (periptero) with papers and a small television */
  function kiosk(x, f) {
    var b = A.GROUND;
    r(x, b - 30, 26, 30, C.kiosk);
    r(x - 3, b - 33, 32, 3, C.awning);
    r(x + 2, b - 16, 22, 2, C.farDark);
    r(x + 3, b - 26, 4, 6, C.white); r(x + 8, b - 26, 4, 6, C.haze); r(x + 13, b - 25, 4, 5, C.red);
    r(x + 18, b - 27, 6, 5, f.ertOff ? C.dark : C.blue);
    if (!f.ertOff) { r(x + 19, b - 25, 2, 1, C.white); }
  }
  function olive(x) {
    var b = A.GROUND;
    r(x + 10, b - 16, 3, 16, C.bark); r(x + 12, b - 23, 2, 8, C.bark);
    r(x, b - 30, 24, 8, C.leaf); r(x + 3, b - 34, 16, 5, C.leaf);
    r(x - 2, b - 26, 10, 4, C.leaf); r(x + 16, b - 25, 10, 4, C.leaf);
    r(x + 5, b - 32, 6, 2, C.leafLit); r(x + 15, b - 28, 5, 2, C.leafLit);
  }
  function lamp(x) {
    r(x, A.GROUND - 46, 2, 46, C.dust); r(x - 4, A.GROUND - 47, 10, 2, C.dust); r(x + 4, A.GROUND - 45, 2, 1, C.lit);
  }
  /* The props repeat every 400 pixels and move at half the speed of the road */
  function props(off, f) {
    for (var px = -(off % 400) - 400; px < A.W; px += 400) {
      kiosk(px + 20, f); olive(px + 170); lamp(px + 300);
    }
  }
  /* The pavement with its slabs, the curb and the road below */
  function road(off) {
    r(0, A.GROUND, A.W, A.H - A.GROUND, C.road);
    r(0, A.GROUND, A.W, 20, C.pave);
    r(0, A.GROUND, A.W, 1, C.kerb);
    for (var sx = -(off % 24); sx < A.W; sx += 24) { r(sx, A.GROUND + 1, 1, 19, C.seam); }
    r(0, A.GROUND + 20, A.W, 3, C.kerb);
    for (var dx = -(off % 48); dx < A.W; dx += 48) { r(dx, A.GROUND + 41, 24, 2, C.kerb); }
  }
  A.kiosk = kiosk; A.olive = olive; A.lamp = lamp; A.props = props; A.road = road;
})();
