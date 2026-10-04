/* TROIKA.RUN art (js/games/troika/art/): the street scene of each year,
   TILE pixels wide on the pavement line, and the plain street of
   apartment blocks before the first scene and after the last. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r, line = A.line, sign = A.sign, crowd = A.crowd;
  function greekFlag(x, y) {
    r(x, y, 12, 9, C.blue);
    for (var k = 1; k < 9; k += 2) { r(x, y + k, 12, 1, C.white); }
    r(x, y, 5, 5, C.blue); r(x + 2, y, 1, 5, C.white); r(x, y + 2, 5, 1, C.white);
  }
  /* The Parliament on Syntagma Square, the old royal palace */
  function parliament(x) {
    var b = A.GROUND;
    r(x + 150, b - 64, 340, 64, C.far);
    r(x + 146, b - 68, 348, 4, C.farEdge);
    for (var i = 0; i < 20; i++) { r(x + 320 - i * 3, b - 88 + i, i * 6, 1, C.farLit); }
    r(x + 264, b - 64, 112, 52, C.farDark);
    for (var c = 0; c < 6; c++) { r(x + 270 + c * 19, b - 64, 6, 52, C.farEdge); }
    for (var wx = 0; wx < 7; wx++) {
      [x + 162 + wx * 14, x + 384 + wx * 14].forEach(function (px) {
        r(px, b - 56, 6, 10, C.window); r(px, b - 36, 6, 10, C.window);
      });
    }
    r(x + 262, b - 12, 116, 4, C.farEdge); r(x + 254, b - 8, 132, 4, C.farLit); r(x + 246, b - 4, 148, 4, C.farEdge);
    r(x + 320, b - 106, 1, 18, C.dust);
    greekFlag(x + 321, b - 106);
  }
  /* Apartment blocks (polykatoikies) with a balcony on every floor */
  /* Each block has its entrance in the middle of the ground floor, a
     door in a frame, as the buildings of 2097 do; the windows stop above
     it (and above the awnings of a street) */
  function blocks(x0, x1, seed) {
    for (var x = x0, k = seed; x < x1; x += 46, k++) {
      var h = 40 + (k * 13) % 18;
      r(x, A.GROUND - h, 42, h, C.farLit);
      r(x + 16, A.GROUND - 10, 10, 10, C.farEdge); r(x + 18, A.GROUND - 9, 6, 9, C.farDark);
      r(x + 15, A.GROUND - 11, 12, 1, C.farEdge);
      for (var f = A.GROUND - h + 7; f < A.GROUND - 14; f += 9) {
        r(x - 1, f, 44, 1, C.farEdge);
        r(x + 5, f - 5, 8, 4, (k + f) % 5 ? C.window : C.lit);
        r(x + 26, f - 5, 8, 4, C.window);
      }
    }
  }
  /* The Academy of Athens on Panepistimiou Street: an Ionic portico between
     two wings, and the two tall columns with Athena and Apollo on top; the
     University's lower colonnade beside it */
  function academy(x) {
    var b = A.GROUND;
    r(x + 180, b - 56, 280, 56, C.far);
    r(x + 176, b - 60, 288, 4, C.farEdge);
    r(x + 270, b - 56, 100, 46, C.farDark);
    for (var c = 0; c < 6; c++) { r(x + 276 + c * 17, b - 54, 5, 44, C.farEdge); r(x + 275 + c * 17, b - 56, 7, 2, C.farLit); }
    for (var i = 0; i < 14; i++) { r(x + 320 - (8 + i * 4), b - 74 + i, (8 + i * 4) * 2, 1, C.farLit); }
    for (var w = 0; w < 5; w++) {
      [x + 190 + w * 16, x + 382 + w * 16].forEach(function (px) { r(px, b - 46, 6, 12, C.window); r(px, b - 26, 6, 12, C.window); });
    }
    r(x + 262, b - 10, 116, 4, C.farEdge); r(x + 254, b - 6, 132, 6, C.farLit);
    [130, 504].forEach(function (cx) {
      cx += x;
      r(cx, b - 112, 6, 112, C.farEdge); r(cx - 2, b - 114, 10, 3, C.farLit);
      r(cx + 1, b - 126, 4, 12, C.farLit); r(cx + 2, b - 130, 2, 3, C.farLit);
    });
    r(x + 10, b - 40, 100, 40, C.farLit);
    r(x + 6, b - 43, 108, 3, C.farEdge);
    for (var u = 0; u < 8; u++) { r(x + 16 + u * 12, b - 38, 4, 38, C.farEdge); }
    r(x + 540, b - 44, 90, 44, C.farLit);
    for (var v = 0; v < 5; v++) { r(x + 548 + v * 16, b - 36, 6, 12, C.window); }
  }
  /* A plain street of apartment blocks with shop awnings, before the first
     scene and after the last */
  function street(x, seed) {
    blocks(x + 4, x + 636, seed);
    /* An awning along the whole ground floor, above the entrance */
    for (var k = 0, bx = x + 4; bx < x + 636; bx += 46, k++) {
      r(bx, A.GROUND - 14, 42, 2, [C.awning, C.kiosk, C.redLit, C.blue][(seed + k) % 4]);
    }
  }
  function acropolis(x) {
    var b = A.GROUND;
    for (var i = 0; i < 70; i++) {
      /* The rock is wider at its top than the temple's lowest step */
      var hw = 86 + i * 3.4;
      r(x + 320 - hw, b - 70 + i, hw * 2, 1, C.far);
    }
    r(x + 236, b - 76, 168, 6, C.farLit);
    r(x + 262, b - 80, 116, 4, C.farEdge);
    for (var c = 0; c < 8; c++) { r(x + 265 + c * 15, b - 106, 5, 26, C.farEdge); }
    r(x + 262, b - 112, 116, 6, C.farEdge);
    for (var j = 0; j < 6; j++) { r(x + 320 - (18 + j * 8), b - 118 + j, (18 + j * 8) * 2, 1, C.farLit); }
    blocks(x + 4, x + 190, 1);
    blocks(x + 460, x + 640, 4);
  }
  /* ERT's headquarters at Agia Paraskevi, its facade screen and its mast */
  function ert(x, f) {
    var b = A.GROUND;
    r(x + 100, b - 74, 300, 74, C.far);
    for (var k = 0; k < 5; k++) {
      r(x + 106, b - 68 + k * 13, 288, 5, C.window);
      if (!f.ertOff) { r(x + 120 + (k * 53) % 240, b - 68 + k * 13, 12, 5, C.lit); }
    }
    r(x + 190, b - 62, 96, 40, C.dark);
    if (!f.ertOff) {
      r(x + 192, b - 60, 92, 36, C.blue);
      sign("ERT", x + 238, b - 45, C.white, "center");
    }
    for (var i = 0; i < 170; i++) {
      var half = Math.round(2 + (170 - i) * 0.1), y = b - i;
      r(x + 500 - half, y, 1, 1, C.farEdge); r(x + 500 + half, y, 1, 1, C.farEdge);
      if (i % 14 === 0) { r(x + 500 - half, y, half * 2 + 1, 1, C.farEdge); }
    }
    r(x + 500, b - 172, 1, 2, C.red);
  }
  /* The port of Piraeus: a ferry, the quay, containers and two cranes */
  function piraeus(x) {
    var b = A.GROUND;
    r(x, b - 44, A.TILE, 24, C.sea);
    for (var k = 0; k < 30; k++) { r(x + (k * 37) % A.TILE, b - 40 + (k % 3) * 6, 3, 1, C.wave); }
    r(x + 60, b - 54, 120, 12, C.farEdge);
    r(x + 80, b - 64, 70, 10, C.farLit);
    for (var w = 0; w < 8; w++) { r(x + 84 + w * 8, b - 61, 4, 3, C.window); }
    r(x + 132, b - 72, 8, 8, C.blue);
    r(x, b - 20, A.TILE, 20, C.farLit);
    var box = ["#6A4A2C", "#6A3330", "#3D5272"];
    [[250, 3], [290, 2], [330, 3], [600, 2]].forEach(function (s) {
      for (var k2 = 0; k2 < s[1]; k2++) { r(x + s[0], b - 20 - (k2 + 1) * 9, 36, 8, box[(s[0] / 10 + k2) % 3]); }
    });
    [420, 520].forEach(function (cx) {
      cx += x;
      r(cx, b - 110, 4, 90, C.crane); r(cx + 36, b - 110, 4, 90, C.crane);
      r(cx, b - 100, 40, 4, C.crane); r(cx, b - 70, 40, 3, C.crane);
      r(cx - 60, b - 110, 130, 4, C.crane);
      r(cx + 18, b - 130, 3, 20, C.crane);
      line(cx + 19, b - 130, cx - 58, b - 110, C.crane);
      line(cx + 20, b - 130, cx + 68, b - 110, C.crane);
      r(cx - 10, b - 106, 8, 6, C.farEdge);
    });
  }
  /* Bank branches in July 2015: closed shutters, queues at the cash
     machines and the posters of the referendum */
  function banks(x) {
    var b = A.GROUND;
    [20, 230, 440].forEach(function (bx, k) {
      bx += x;
      r(bx, b - 96, 180, 96, C.far);
      r(bx - 2, b - 100, 184, 4, C.farEdge);
      for (var w = 0; w < 5; w++) { r(bx + 14 + w * 34, b - 86, 14, 20, C.window); }
      r(bx + 20, b - 56, 140, 11, C.blue);
      /* The third is a savings bank (ταμιευτήριο) */
      sign(k === 2 ? "ΤΑΜΙΕΥΤΗΡΙΟ" : "ΤΡΑΠΕΖΑ", bx + 90, b - 54, C.white, "center");
      r(bx + 30, b - 38, 70, 38, C.farEdge);
      for (var s = 0; s < 13; s++) { r(bx + 30, b - 38 + s * 3, 70, 1, C.farDark); }
      r(bx + 120, b - 30, 14, 18, C.farLit); r(bx + 123, b - 27, 8, 5, C.dust);
      /* The referendum's posters between the banks: No, then Yes */
      if (k < 2) {
        r(bx + 146, b - 36, 24, 13, C.white);
        sign(k === 1 ? "ΝΑΙ" : "ΟΧΙ", bx + 158, b - 33, C.dark, "center");
      }
      crowd(bx + 102, bx + 120, C.farDark);
    });
  }
  /* The scene of a year, its left edge at x, or a street of blocks when fill
     is set. f holds the lasting effects of the choices; seed varies the
     street. */
  function scene(year, x, f, fill, seed) {
    if (fill) { street(x, seed); }
    else if (year === 0) { parliament(x); }
    else if (year === 1) { academy(x); }
    else if (year === 2) { acropolis(x); }
    else if (year === 3) { ert(x, f); }
    else if (year === 4) { piraeus(x); }
    else { banks(x); }
    if (f.crowd && year < 5) { crowd(x + 8, x + 632, C.farDark); }
  }
  A.greekFlag = greekFlag; A.blocks = blocks; A.scene = scene;
})();
