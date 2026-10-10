/* TROIKA.RUN art (js/games/troika/art/): the drawings of the 2016 ending
   (js/games/troika/ending.js): the building Greece goes into, the
   economist's office with the economist, Athens seen from above from 2016
   to 2097, and the street of 2097. level is how far the answer to the
   economist went, from 0 (the status quo) to 3 (a federal eurozone):
   - 0: the city wears down; shops close, windows go dark, the sky turns
     hot and hazy;
   - 1: little changes;
   - 2: solar panels and some green roofs, a monorail over the roofs;
   - 3: most roofs have solar panels or gardens, new housing, greenery,
     the monorail, and the flag of the Federation of Europe.
   Past the economist's door the street of 2097 thins out into suburbs and
   gives way to the Mesogeia plain, where Greece sits down under an olive
   tree. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r, line = A.line, sign = A.sign, hash = A.hash, mix = A.mix;
  /* The sky of 2097 for each level, top and horizon */
  var FUTURE = [["#5A3A28", "#C08850"], ["#3A4A58", "#A89A80"], ["#2E5A7A", "#A8C0C8"], ["#2A6A9A", "#BCD8E0"]];
  /* The public debt from 2008 to 2016, % of GDP, for the economist's
     board, as Eurostat reported it in April 2017 */
  var DEBT = [109, 127, 146, 172, 160, 177, 180, 177, 179];
  /* The board in 2097 goes on from 2016, every ten years, by the answer:
     the status quo stays high, the longer loans come down slowly, debt
     relief brings it well down, the federation lower still, its debts
     shared in the federal budget */
  var DEBT_2097 = [
    [179, 175, 168, 178, 170, 182, 174, 179, 176, 172],
    [179, 170, 158, 147, 138, 129, 121, 114, 108, 103],
    [179, 150, 128, 112, 98, 88, 80, 74, 70, 66],
    [179, 140, 108, 86, 70, 60, 54, 50, 47, 45]
  ];
  /* The flag of the Federation of Europe: a ring of gold stars on blue */
  function federalFlag(x, y) {
    r(x, y, 14, 10, C.blue);
    [[7, 1], [10, 2], [11, 5], [10, 8], [7, 9], [4, 8], [3, 5], [4, 2]].forEach(function (p) { r(x + p[0] - 1, y + p[1] - 1, 1, 1, C.gold); });
  }
  function solar(x, y, w) {
    r(x, y - 3, w, 3, C.solar);
    for (var k = 0; k < w; k += 4) { r(x + k, y - 3, 1, 3, C.solarLit); }
  }
  /* The building of the economist's office, its door at x on the pavement:
     a neoclassical front with two columns at the door, a balcony on each
     floor and the office's window lit on the first floor. With level it is
     the same building in 2097. */
  function entrance(x, level) {
    var b = A.GROUND, L = x - 110;
    r(L, b - 124, 220, 124, C.farLit);
    r(L - 4, b - 128, 228, 4, C.farEdge);
    for (var f = 0; f < 3; f++) {
      var fy = b - 112 + f * 30;
      r(L - 2, fy + 22, 224, 2, C.farEdge);
      /* Five columns of windows centered on the door; none over the door */
      for (var w = 0; w < 5; w++) {
        var wx = x - 6 + (w - 2) * 40, office = f === 1 && w === 1;
        if (f === 2 && w === 2) { continue; }
        var dark = level === 0 && hash(w + f * 7) % 3 === 0;
        r(wx, fy, 12, 18, office ? C.lit : dark ? C.dark : C.window);
        if (level >= 3 && (w + f) % 2 === 0) { r(wx - 2, fy + 18, 16, 3, C.leaf); r(wx, fy + 16, 3, 2, C.leafLit); }
      }
    }
    /* The door with its light inside, two columns, the steps and a plate */
    r(x - 22, b - 44, 44, 44, C.farEdge);
    r(x - 9, b - 34, 18, 34, C.lit); r(x - 9, b - 34, 18, 2, C.haze);
    r(x - 18, b - 40, 4, 40, C.kerb); r(x + 14, b - 40, 4, 40, C.kerb);
    r(x - 24, b - 44, 48, 4, C.kerb);
    /* The pediment over the door, its point up */
    for (var i = 0; i < 6; i++) { r(x - 4 - i * 4, b - 50 + i, 8 + i * 8, 1, C.farEdge); }
    r(x - 26, b - 3, 52, 3, C.seam);
    r(x + 24, b - 28, 10, 6, C.haze); r(x + 25, b - 27, 8, 1, C.dust);
    if (level >= 2) { solar(L + 8, b - 128, 90); solar(L + 120, b - 128, 90); }
    if (level >= 3) { r(x + 60, b - 160, 1, 32, C.dust); federalFlag(x + 61, b - 160); }
  }
  /* The economist, feet at (x, b): gray hair and beard, glasses, a tweed
     jacket over a white shirt and a tie in its middle. With grandson, his
     grandson of 2097: darker hair greying at the temples, clean-shaven,
     thin glasses, a navy jacket and an open collar. mouth opens his mouth;
     blink closes his eyes. */
  function economist(x, b, mouth, blink, grandson) {
    if (grandson) { heir(x, b, mouth, blink); return; }
    r(x - 4, b - 13, 3, 13, C.suit); r(x + 1, b - 13, 3, 13, C.suit);
    r(x - 4, b - 1, 4, 1, C.dark); r(x + 1, b - 1, 4, 1, C.dark);
    r(x - 6, b - 25, 12, 13, C.tweed);
    r(x - 2, b - 25, 4, 6, C.white); r(x - 1, b - 24, 2, 5, C.red);
    r(x - 8, b - 24, 2, 9, C.tweed); r(x + 6, b - 24, 2, 9, C.tweed);
    r(x - 8, b - 15, 2, 2, C.skin); r(x + 6, b - 15, 2, 2, C.skin);
    r(x - 4, b - 34, 8, 9, C.skin);
    r(x - 5, b - 35, 10, 2, C.grey); r(x - 5, b - 33, 1, 5, C.grey); r(x + 4, b - 33, 1, 5, C.grey);
    r(x - 3, b - 32, 2, 1, C.grey); r(x + 1, b - 32, 2, 1, C.grey);
    r(x - 4, b - 31, 3, 1, C.dark); r(x + 1, b - 31, 3, 1, C.dark); r(x - 1, b - 31, 2, 1, C.dark);
    r(x - 3, b - 30, 1, 1, blink ? C.skin : C.dark); r(x + 2, b - 30, 1, 1, blink ? C.skin : C.dark);
    r(x - 4, b - 27, 8, 2, C.grey); r(x - 3, b - 25, 6, 1, C.grey);
    r(x - 1, b - 28, 2, mouth ? 2 : 1, C.dark);
  }
  function heir(x, b, mouth, blink) {
    var navy = "#2C3E5A";
    r(x - 4, b - 13, 3, 13, C.suit); r(x + 1, b - 13, 3, 13, C.suit);
    r(x - 4, b - 1, 4, 1, C.dark); r(x + 1, b - 1, 4, 1, C.dark);
    r(x - 6, b - 25, 12, 13, navy);
    r(x - 2, b - 25, 4, 4, C.white); r(x - 1, b - 21, 2, 1, C.white);
    r(x - 8, b - 24, 2, 9, navy); r(x + 6, b - 24, 2, 9, navy);
    r(x - 8, b - 15, 2, 2, C.skin); r(x + 6, b - 15, 2, 2, C.skin);
    r(x - 4, b - 33, 8, 8, C.skin);
    /* Short, flat hair, greying at the temples, clear of the glasses */
    r(x - 5, b - 35, 10, 2, C.hair); r(x - 5, b - 33, 1, 2, C.grey); r(x + 4, b - 33, 1, 2, C.grey);
    r(x - 4, b - 30, 3, 1, C.dust); r(x + 1, b - 30, 3, 1, C.dust); r(x - 1, b - 30, 2, 1, C.dust);
    r(x - 3, b - 29, 1, 1, blink ? C.skin : C.dark); r(x + 2, b - 29, 1, 1, blink ? C.skin : C.dark);
    r(x - 1, b - 27, 2, mouth ? 2 : 1, C.dark);
  }
  /* Draws paint() at twice the size, with (x, y) as its origin */
  function twice(x, y, paint) {
    var g = A.g;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(2, 2);
    paint();
    g.restore();
  }
  /* The economist's office, filling the canvas: shelves of books, a board
     with the public debt from 2008 to 2016, a window onto the Acropolis at
     dusk, the desk with the economist behind it, and Greece. t is the time
     in the office; talking moves his mouth; grandson puts his grandson
     there, as in 2097, and the board then goes on to 2097 as the answer
     (level) had it. */
  function office(t, talking, grandson, level) {
    var W = A.W, H = A.H, fy = Math.round(H * 0.74), g = A.g;
    r(0, 0, W, fy, "#3A3430");
    r(0, fy - 6, W, 6, "#2E2824");
    r(0, fy, W, H - fy, "#4A3A2C");
    for (var p = fy + 8; p < H; p += 10) { r(0, p, W, 1, "#3E3024"); }
    /* The shelves */
    var sx = Math.round(W * 0.03), sw = Math.round(W * 0.18);
    r(sx, 30, sw, fy - 30, C.bark);
    for (var sy = 36; sy < fy - 10; sy += 22) {
      r(sx + 3, sy + 18, sw - 6, 2, C.awning);
      for (var bx = sx + 4, n = sy; bx < sx + sw - 6; n++) {
        var bw = 3 + hash(n) % 4, bh = 10 + hash(n * 3) % 7;
        r(bx, sy + 18 - bh, bw, bh, [C.book, C.blue, C.leaf, C.haze, C.suitLit][hash(n * 7) % 5]);
        bx += bw + 1;
      }
    }
    /* The board with the debt line: in 2016 from 2008 to 2016, between
       100% and 200%; in 2097 from 2016 to 2097, between 0% and 200% */
    var bx0 = Math.round(W * 0.25), bwd = Math.round(W * 0.25), by0 = 40, bht = Math.round(fy * 0.45);
    r(bx0 - 3, by0 - 3, bwd + 6, bht + 6, C.bark); r(bx0, by0, bwd, bht, "#2C3A34");
    sign(S.t("DEBT/GDP"), bx0 + 4, by0 + 4, C.white);
    var pts = grandson ? DEBT_2097[level || 0] : DEBT, lo = grandson ? 0 : 100;
    var px = null, py = null;
    pts.forEach(function (d, i) {
      var x = bx0 + 6 + Math.round(i * (bwd - 12) / (pts.length - 1)), y = by0 + bht - 4 - Math.round((d - lo) / (200 - lo) * (bht - 18));
      if (px !== null) { line(px, py, x, y, C.white); }
      r(x - 1, y - 1, 2, 2, C.haze);
      px = x; py = y;
    });
    sign(pts[pts.length - 1] + "%", px - 1, py - 10, C.haze, "right");
    sign(grandson ? "2016" : "2008", bx0 + 4, by0 + bht - 10, C.dust);
    sign(grandson ? "2097" : "2016", bx0 + bwd - 4, by0 + bht - 10, C.dust, "right");
    /* The window: dusk over the Acropolis */
    var wx = Math.round(W * 0.56), ww = Math.round(W * 0.22), wy = 34, wh = Math.round(fy * 0.5);
    r(wx - 4, wy - 4, ww + 8, wh + 8, C.farEdge);
    for (var y = 0; y < wh; y += 2) { r(wx, wy + y, ww, 2, mix("#3A2438", "#C0703A", y / wh)); }
    var ax = wx + Math.round(ww * 0.55);
    for (var k = 0; k < 14; k++) { r(ax - 16 - k * 2, wy + wh - 14 + k, 32 + k * 4, 1, C.farDark); }
    r(ax - 12, wy + wh - 18, 24, 4, C.farDark);
    for (var c = 0; c < 6; c++) { r(ax - 11 + c * 4, wy + wh - 24, 2, 6, C.farDark); }
    r(ax - 13, wy + wh - 26, 26, 2, C.farDark);
    r(wx, wy + wh - 6, ww, 6, C.city);
    r(wx + Math.round(ww / 2) - 1, wy, 2, wh, C.farEdge); r(wx, wy + Math.round(wh / 2), ww, 2, C.farEdge);
    /* A lamp on the desk, and the desk in front of the economist */
    var dx = Math.round(W * 0.68), dw = Math.round(Math.min(150, W * 0.36));
    var blink = t % 3.2 > 3.05, mouth = talking && Math.floor(t * 9) % 2 === 0;
    twice(dx, fy - 8, function () { economist(0, 0, mouth, blink, grandson); });
    r(dx - dw / 2, fy - 34, dw, 6, C.awning); r(dx - dw / 2 + 4, fy - 28, dw - 8, 28, C.bark);
    r(dx - dw / 2 + 10, fy - 22, dw - 20, 1, C.awning);
    r(dx - dw / 2 + 12, fy - 40, 14, 6, C.white); r(dx - dw / 2 + 14, fy - 42, 12, 2, C.white);
    r(dx + dw / 2 - 22, fy - 50, 2, 16, C.dust); r(dx + dw / 2 - 28, fy - 54, 12, 5, C.leaf); g.globalAlpha = 0.25; r(dx + dw / 2 - 34, fy - 49, 24, 15, C.haze); g.globalAlpha = 1;
    /* Greece, at the door side of the room */
    twice(Math.round(W * 0.36), fy + 6, function () { A.runner(0, 0, "run", 1, false); });
  }
  /* Rows of roofs across the basin, far to near; each block is the same
     every frame (hash). A block changes once p passes its own moment, and
     the change fades in over a tenth of the timelapse: a new tower rises,
     an abandoned block darkens, panels and gardens appear. Windows count
     up from the street, so a rising tower keeps them in place, and they
     light up gradually as the night comes. */
  function roofs(o, rows, from) {
    var W = A.W, g = A.g, lvl = o.level, p = o.p || 0;
    var SOLAR = [0, 0.15, 0.5, 0.8][lvl], GREEN = [0, 0, 0.25, 0.5][lvl], TOWER = [0, 0, 0.04, 0.08][lvl], DARK = [0.4, 0.12, 0, 0][lvl];
    var night = Math.max(0, Math.min(1, (0.85 - o.light) / 0.3));
    rows.forEach(function (base, n0) {
      var i = n0 + (from || 0), bw = 12 + i * 6, tint = mix("#283034", "#3F4A4E", Math.min(1, i / 4));
      var ws = i > 1 ? 2 : 1, step = 4 + i;
      for (var x = -((i * 9) % bw), n = i * 1000; x < W; x += bw + 1, n++) {
        var q = Math.max(0, Math.min(1, (p - hash(n * 13) / 1000 * 0.9) / 0.1));
        var tower = hash(n * 5) / 1000 < TOWER, dark = hash(n * 17) / 1000 < DARK;
        var h = Math.round(8 + i * 7 + hash(n) % (6 + i * 4) + (tower ? (14 + i * 6) * q : 0));
        r(x, base - h, bw, h, tower ? A.mixRgb(tint, "rgb(61,84,102)", q) : dark ? A.mixRgb(tint, "rgb(28,34,37)", q) : tint);
        for (var wy = base - 3 - step; wy >= base - h + 2; wy -= step) {
          for (var wx = x + 2; wx < x + bw - 2; wx += 3 + i) {
            r(wx, wy, ws, ws, C.window);
            var glow = night * (dark ? 1 - q : 1);
            if (glow > 0 && hash(n + wx * 7 + wy * 13) % 3 === 0) { g.globalAlpha = glow; r(wx, wy, ws, ws, C.lit); g.globalAlpha = 1; }
          }
        }
        if (!tower && q > 0) {
          g.globalAlpha = q;
          if (hash(n * 19) / 1000 < SOLAR) { solar(x + 1, base - h, bw - 2); }
          else if (hash(n * 23) / 1000 < GREEN) { r(x + 1, base - h - 2, bw - 2, 2, C.leafLit); }
          g.globalAlpha = 1;
        }
      }
    });
  }
  /* Athens from above, from the hills behind the economist's building:
     the mountains, Lycabettus with its chapel, the
     Acropolis, the roofs of the basin and the street in front. o has
     year, p (0 in 2016 to 1 in 2097), level, light (1 by day, lower at
     night), junk (how much of the obstacles and the Troika still shows)
     and lit (the office's window lit). Returns the office window as
     [x, y, w, h], the canvas's shape, for the zoom. The street keeps the
     Troika, a rating, a law and a queue apart from each other and from
     the building at any canvas width. */
  function athens(o) {
    var W = A.W, H = A.H, G = A.GROUND, hy = G - 150, g = A.g, p = o.p || 0;
    var top = A.mixRgb(mix("#2C4050", FUTURE[o.level][0], p), "rgb(10,14,20)", (1 - o.light) * 0.8);
    var low = mix("#9A8A70", FUTURE[o.level][1], p);
    for (var y = 0; y < hy + 8; y += 4) { g.fillStyle = A.mixRgb(top, low, Math.pow(y / (hy + 8), 1.3)); g.fillRect(0, y, W, 4); }
    if (o.light < 0.7) {
      g.globalAlpha = (0.7 - o.light) / 0.7;
      for (var s = 0; s < 40; s++) { r((s * 151) % W, 6 + (s * 67) % Math.max(20, hy - 30), 1, 1, C.dust); }
      g.globalAlpha = 1;
    }
    /* The mountains: Aigaleo and Parnitha on the left, Hymettus on the
       right, their feet on the roofs of the basin */
    for (var x = 0; x < W; x += 2) {
      var u = x / W, m = Math.max(10 * Math.exp(-Math.pow((u - 0.12) / 0.12, 2)) + 22 * Math.exp(-Math.pow((u - 0.3) / 0.1, 2)), 26 * Math.exp(-Math.pow((u - 0.86) / 0.18, 4)));
      if (m > 1) { r(x, hy + 8 - Math.round(m), 2, Math.round(m), "#2A3236"); }
    }
    /* Lycabettus and its chapel */
    var lx = Math.round(W * 0.2);
    for (var k = 0; k < 56; k++) { r(lx - 3 - k * 0.9, hy - 26 + k, 6 + k * 1.8, 1, "#262E31"); }
    r(lx - 2, hy - 31, 4, 5, C.white); r(lx - 1, hy - 33, 2, 2, C.white);
    r(0, hy + 8, W, G - hy - 8, C.city);
    roofs(o, [hy + 30, hy + 54]);
    /* The Acropolis, over the far roofs: the rock and the Parthenon */
    var ax = Math.round(W * 0.72);
    /* The rock, lighter than the roofs round it, its flat top right under
       the temple's step and a lit edge along it, its slopes running down to
       the ground behind the nearer roofs, which hide its foot */
    for (var j = 0; hy + 14 + j < G; j++) { r(ax - 26 - j * 1.2, hy + 14 + j, 52 + j * 2.4, 1, "#3A4448"); }
    r(ax - 26, hy + 14, 52, 1, C.farLit);
    r(ax - 22, hy + 8, 44, 6, C.farLit);
    for (var c = 0; c < 8; c++) { r(ax - 20 + c * 6, hy, 2, 8, C.farEdge); }
    r(ax - 22, hy - 2, 44, 2, C.farEdge);
    for (var t = 0; t < 4; t++) { r(ax - 22 + t * 4, hy - 3 - t, 44 - t * 8, 1, C.farLit); }
    roofs(o, [hy + 80, hy + 108, hy + 132], 2);
    /* The front row on the street, with the economist's building */
    roofs(o, [G], 4);
    /* The economist's building as in the street (entrance), at half its
       size: three floors of five windows centered on the door, the
       office's lit on the first floor, the door in the middle between its
       columns under the pediment. cx is the middle of its front. */
    var cx = Math.round(W * 0.42) + 37, L = cx - 55;
    r(L, G - 62, 110, 62, C.farLit); r(L - 2, G - 64, 114, 2, C.farEdge);
    var wx = cx - 23, wy = G - 41;
    for (var f = 0; f < 3; f++) {
      var fy = G - 56 + f * 15;
      r(L - 1, fy + 11, 112, 1, C.farEdge);
      for (var q = 0; q < 5; q++) {
        var qx = cx - 3 + (q - 2) * 20;
        if (f === 2 && q === 2) { continue; }
        r(qx, fy, 6, 9, f === 1 && q === 1 ? C.lit : C.window);
      }
    }
    r(cx - 11, G - 22, 22, 22, C.farEdge);
    r(cx - 5, G - 17, 10, 17, C.lit);
    r(cx - 9, G - 20, 2, 20, C.kerb); r(cx + 7, G - 20, 2, 20, C.kerb);
    r(cx - 12, G - 22, 24, 2, C.kerb);
    for (var pi = 0; pi < 3; pi++) { r(cx - 2 - pi * 4, G - 25 + pi, 4 + pi * 8, 1, C.farEdge); }
    var late = Math.max(0, Math.min(1, (p - 0.5) / 0.1));
    if (o.level >= 2 && late > 0) { g.globalAlpha = late; solar(L + 4, G - 64, 45); solar(L + 60, G - 64, 45); g.globalAlpha = 1; }
    if (o.level >= 3 && late > 0) { g.globalAlpha = late; r(cx + 30, G - 80, 1, 16, C.dust); federalFlag(cx + 31, G - 80); g.globalAlpha = 1; }
    /* The night over the land, under the sky's own darkening, then the
       office's window, lit through day and night */
    var shade = (1 - o.light) * 0.55;
    if (shade > 0) { g.globalAlpha = shade; g.fillStyle = "#0A0E14"; g.fillRect(0, hy, W, G - hy); g.globalAlpha = 1; }
    r(wx, wy, 6, 9, o.lit ? C.lit : C.window);
    A.road(0);
    /* What is left of the obstacles and the Troika, fading */
    if (o.junk > 0) {
      g.globalAlpha = o.junk;
      [C.blue, C.haze, C.white].forEach(function (tie, n) { A.official(Math.round(W * 0.05) + 6 + n * 14, G, tie, 1); });
      A.obstacle({ kind: "rating", x: Math.round(W * 0.2), w: 23, h: 16, lift: 0, label: "B-", bottom: G });
      A.obstacle({ kind: "law", x: Math.round(W * 0.3), w: 20, h: 30, lift: 0, label: "N.4336", bottom: G });
      A.obstacle({ kind: "queue", x: Math.round(W * 0.72), w: 88, h: 28, lift: 0, label: "", bottom: G });
      g.globalAlpha = 1;
    }
    /* The zoom ends on the office's window, in the canvas's shape */
    var zh = 9, zw = Math.max(5, Math.round(zh * W / H));
    return [wx + 3 - zw / 2, wy, zw, zh];
  }
  /* The road out of Athens to the east, in pixels past the economist's
     door: dense blocks and the monorail up to DENSE, then suburbs that
     thin out, lower blocks, then houses with tiled roofs among Aleppo
     pines, the last houses and a chapel; at EDGE the sign for leaving
     Athens, then the Mesogeia plain of vineyards, olive groves and sheep
     under Hymettus, at STOP the olive tree where Greece sits down
     (ending.js), and from COAST the beach and the sea of the Mesogeia
     coast, at Porto Rafti, where the road ends on the beach at the water
     (FAR); Greece can walk to SHORE */
  var DENSE = 500, EDGE = 1080, STOP = 1420, COAST = 2640, FAR = 2900, SHORE = FAR - 38;
  /* The colors of the country for each level: grass and the near
     fields; drier under the status quo, greener with each level */
  var GRASS = [["#6E6A3C", "#7C7642"], ["#5E6B3E", "#6A7848"], ["#4E7040", "#5A7E4A"], ["#3F7A3E", "#4C8A48"]];
  function clamp01(f) {
    return Math.max(0, Math.min(1, f));
  }
  /* A cypress, its foot on the ground at x */
  function cypress(x, h) {
    var b = A.GROUND;
    for (var k = 0; k < h; k++) { var w = Math.max(1, Math.round(5 * Math.sin(Math.PI * Math.min(1, (k + 2) / h)))); r(x - w / 2, b - k - 1, w + 1, 1, C.cypress); }
  }
  /* An Aleppo pine: a leaning trunk and a wide, flat crown */
  function pine(x) {
    var b = A.GROUND;
    line(x, b, x + 3, b - 30, C.bark); line(x + 1, b, x + 4, b - 30, C.bark);
    r(x - 10, b - 34, 28, 6, C.cypress); r(x - 6, b - 38, 20, 4, C.cypress); r(x - 13, b - 30, 12, 3, C.cypress);
    r(x - 4, b - 37, 8, 1, C.leaf); r(x + 6, b - 33, 8, 1, C.leaf);
  }
  /* A detached house of two floors with a tiled roof and a garden wall */
  function house(x, k) {
    var b = A.GROUND, wall = ["#D8D2C2", "#C9B48A", "#E2DCCB"][k % 3];
    r(x + 2, b - 30, 36, 30, wall);
    for (var t = 0; t < 8; t++) { r(x + 20 - t * 2.6 - 2, b - 38 + t, t * 5.2 + 4, 1, t % 2 ? "#9A4A30" : "#A8553A"); }
    r(x + 6, b - 25, 7, 7, C.window); r(x + 27, b - 25, 7, 7, C.window);
    r(x + 6, b - 12, 7, 7, C.window); r(x + 27, b - 12, 7, 7, C.window); r(x + 17, b - 13, 6, 13, C.bark);
    r(x + 6, b - 18, 7, 1, C.white); r(x + 27, b - 18, 7, 1, C.white);
    r(x - 2, b - 5, 44, 5, C.grey); r(x - 2, b - 5, 44, 1, C.white);
  }
  /* A small Byzantine chapel of stone with a tiled roof and its bell */
  function chapel(x) {
    var b = A.GROUND;
    r(x, b - 18, 26, 18, "#CFC4A8");
    for (var t = 0; t < 6; t++) { r(x + 13 - t * 2.5 - 2, b - 24 + t, t * 5 + 4, 1, "#A8553A"); }
    r(x + 10, b - 11, 6, 11, C.bark); r(x + 12, b - 15, 2, 2, C.dark);
    /* The bell on its post, the post standing on the roof */
    r(x + 22, b - 31, 1, 11, C.dust); r(x + 20, b - 31, 5, 1, C.dust); r(x + 21, b - 29, 3, 3, C.gold);
    r(x + 12, b - 27, 1, 3, C.dust); r(x + 11, b - 26, 3, 1, C.dust);
  }
  /* A sheep grazing, some with the head down */
  function sheep(x, n) {
    var b = A.GROUND, down = n % 3 === 0;
    r(x, b - 7, 10, 5, C.white); r(x + 1, b - 8, 8, 1, C.white);
    r(x + (down ? 9 : 10), b - (down ? 4 : 8), 3, 3, C.dark);
    r(x + 1, b - 2, 1, 2, C.dark); r(x + 7, b - 2, 1, 2, C.dark);
  }
  /* The sign at the edge of a Greek town: the name on a white plate, a red
     line across it for leaving */
  function exitSign(x) {
    var b = A.GROUND;
    r(x + 16, b - 30, 2, 30, C.dust);
    r(x, b - 43, 34, 13, C.white);
    sign("ΑΘΗΝΑ", x + 17, b - 40, C.dark, "center");
    line(x + 1, b - 31, x + 32, b - 42, C.red);
  }
  /* A dense block of flats with its shop, as in the street of each level */
  function block(bx, n, k, level, h, open) {
    var G = A.GROUND;
    r(bx, G - h, 44, h, C.farLit);
    for (var f = G - h + 8; f < G - 30; f += 12) {
      r(bx - 1, f + 7, 46, 1, C.farEdge);
      var dark = level === 0 && hash(n * 3 + f) % 2 === 0;
      r(bx + 6, f, 9, 6, dark ? C.dark : level >= 2 && hash(n + f) % 3 === 0 ? C.lit : C.window);
      r(bx + 28, f, 9, 6, dark ? C.dark : C.window);
      if (level >= 3 && hash(n * 7 + f) % 2 === 0) { r(bx + 6, f + 6, 9, 1, C.leaf); r(bx + 28, f + 6, 9, 1, C.leaf); }
    }
    /* The shop on the ground floor: shuttered for rent at level 0, now
       and then at level 1, open with its awning otherwise */
    var shut = !open && (level === 0 ? k % 4 !== 0 : level === 1 ? k % 3 === 0 : false);
    if (shut) {
      r(bx + 4, G - 20, 36, 20, C.dust);
      for (var s = 0; s < 6; s++) { r(bx + 4, G - 19 + s * 3, 36, 1, C.farEdge); }
      if (k % 2 === 0) { r(bx + 12, G - 14, 20, 7, C.white); r(bx + 14, G - 12, 16, 1, C.red); r(bx + 14, G - 10, 12, 1, C.red); }
    } else {
      r(bx + 4, G - 20, 36, 20, level >= 2 ? C.lit : C.window);
      r(bx + 3, G - 24, 38, 3, [C.awning, C.kiosk, C.redLit, C.blue][k % 4]);
      /* An open shop has its door in the middle of its window */
      if (open) { r(bx + 17, G - 18, 10, 18, C.farDark); r(bx + 18, G - 17, 8, 16, C.window); }
    }
    if (level >= 2 && k % 2 === 0) { solar(bx + 2, G - h, 40); }
  }
  /* A school over two plots, three floors in ochre with white bands, tall
     windows and a door with steps in the middle under a round emblem, its name on a plate on
     the roof beside the Greek flag, and a railing round the yard with the
     gate in front of the door */
  function school(bx) {
    var G = A.GROUND, wall = "#D9C38F";
    /* The front fills two plots but their last 2 pixels, like every block,
       so it keeps the street's gap to its neighbors; everything on it is
       mirrored about its middle, between bx + 44 and bx + 45 */
    r(bx, G - 62, 90, 62, wall);
    r(bx - 2, G - 65, 94, 3, C.white);
    [G - 43, G - 23].forEach(function (y) { r(bx, y, 90, 2, C.white); });
    for (var f = 0; f < 3; f++) {
      for (var w = 0; w < 6; w++) {
        if (f >= 1 && (w === 2 || w === 3)) { continue; }
        var wx = bx + 4 + w * 14 + (w > 2 ? 3 : 0), wy = G - 59 + f * 20;
        r(wx, wy, 9, 14, C.window); r(wx, wy + 6, 9, 1, C.farLit); r(wx - 1, wy + 14, 11, 1, C.white);
      }
    }
    /* Over the door, in place of the middle windows, a round emblem */
    r(bx + 42, G - 38, 6, 6, C.white); r(bx + 43, G - 37, 4, 4, C.blue); r(bx + 44, G - 36, 2, 2, C.white);
    r(bx + 36, G - 19, 18, 19, C.white); r(bx + 39, G - 17, 12, 17, C.bark); r(bx + 44, G - 17, 2, 17, C.farDark);
    r(bx + 34, G - 2, 22, 2, C.white);
    r(bx + 19, G - 77, 52, 12, C.white); r(bx + 19, G - 77, 52, 1, C.dust); r(bx + 19, G - 66, 52, 1, C.dust);
    sign("ΣΧΟΛΕΙΟ", bx + 45, G - 74, C.dark, "center");
    r(bx + 84, G - 90, 1, 25, C.dust);
    A.greekFlag(bx + 85, G - 90);
    /* The railing along the front, its bars in mirrored pairs, its ends on
       the wall's edges, and the gate open in front of the door */
    for (var d = 12; d <= 44; d += 4) { r(bx + 44 - d, G - 9, 1, 9, C.dark); r(bx + 45 + d, G - 9, 1, 9, C.dark); }
    r(bx, G - 9, 33, 1, C.dark); r(bx + 57, G - 9, 33, 1, C.dark);
  }
  /* The monorail's station at the end of the line, x being its far side:
     a closed hall on the end of the viaduct, its windows in a band under
     the roof and the blue sign of the metro on its wall; the train goes in
     at its open end. A glass lift runs from the pavement up into the hall,
     its cabin going up and down on the clock t. Its two pillars stand
     behind the blocks with the line's (stationPillars). */
  var HALL = 92;
  function station(x, rail, t) {
    lift(x, rail, t);
    r(x - HALL, rail - 30, HALL, 30, C.farLit);
    r(x - HALL - 3, rail - 33, HALL + 6, 3, C.farEdge);
    /* The base, open where the lift's shaft comes up through it */
    r(x - HALL - 2, rail, HALL - 38, 6, C.kerb); r(x - 26, rail, 30, 6, C.kerb);
    r(x - HALL - 2, rail + 6, HALL - 38, 1, C.farEdge); r(x - 26, rail + 6, 30, 1, C.farEdge);
    /* The window band: four panes of 10 between five bars, ending on a bar */
    r(x - HALL + 22, rail - 25, 45, 11, C.window);
    for (var m = 0; m <= 44; m += 11) { r(x - HALL + 22 + m, rail - 25, 1, 11, C.farEdge); }
    r(x - 20, rail - 27, 13, 13, C.blue);
    sign("M", x - 14, rail - 24, C.white, "center");
    r(x - HALL, rail - 30, 2, 30, C.farEdge);
  }
  /* The lift: a glass shaft from the street up into the hall's base, the
     landing door at the street, and the cabin, which rides up into the hall
     (drawn over it) and down to the pavement */
  function lift(x, rail, t) {
    var G = A.GROUND, sx = x - 40, top = rail + 6, hgt = G - top, g = A.g;
    g.globalAlpha = 0.35; r(sx, top, 14, hgt, C.ice); g.globalAlpha = 1;
    r(sx, top, 1, hgt, C.kerb); r(sx + 13, top, 1, hgt, C.kerb);
    for (var fy2 = top; fy2 < G; fy2 += 22) { r(sx, fy2, 14, 1, C.kerb); }
    /* The cabin rides from the platform's floor down to the street; at
       the top it goes into the hall (drawn over it), at the bottom into the
       landing (drawn over it), so only its door shows there */
    var cy = Math.round(rail - 20 + (G - 20 - (rail - 20)) * (0.5 + 0.5 * Math.sin((t || 0) * 0.5)));
    r(sx + 1, cy, 12, 20, C.white);
    r(sx + 2, cy + 4, 10, 16, C.window); r(sx + 6, cy + 4, 2, 16, C.kerb);
    r(sx + 1, cy, 12, 1, C.dust);
    /* The landing at the street, in a frame as wide as the shaft; its door
       shows the cabin's lit door when the cabin is down */
    var down = cy >= G - 22;
    r(sx - 1, G - 24, 16, 24, C.farEdge);
    r(sx + 2, G - 16, 10, 16, down ? C.window : C.farDark); r(sx + 6, G - 16, 2, 16, C.kerb);
  }
  function stationPillars(x, rail) {
    var G = A.GROUND;
    [x - HALL + 10, x - 14].forEach(function (px) { r(px, rail + 7, 4, G - rail - 7, C.kerb); });
  }
  /* Where each person of 2097 stands, in pixels past the economist's door,
     so each stands where they belong: the shopkeeper at the door of her
     shop, the teacher at the gate of the school, which takes two plots, the
     engineer beside the chapel;
     the others where data.js puts them. The street's plots are counted
     from the economist's door, so the same street shows at any canvas
     size. */
  function spot(kind, at) {
    if (kind === "shopkeeper") { return Math.round((at - 22) / 46) * 46 + 22; }
    if (kind === "teacher") { return Math.round((at - 45) / 46) * 46 + 45; }
    if (kind === "engineer") { return Math.round((EDGE - 150) / 46) * 46 + 50; }
    return at;
  }
  /* The sea as pixel landscapes draw it, seen from the shore: horizontal
     bands from the horizon down to the front of the picture, thin far away
     and wider near, taking the sky's hazy color at the horizon (low) and
     a deep blue in front; glints that grow longer and sparser as the
     water comes nearer, drifting on the clock t and moving with the walk
     (off) more the nearer they are. from(y) is where the water starts on
     row y, anything left of it being land. The horizon is at A.GROUND - 40,
     the front at the bottom of the canvas. */
  function sea(low, off, t, from) {
    var W = A.W, H = A.H, top = A.GROUND - 40, depth = H - top;
    var hz = mix(low, "#5E94AE", 0.55), deep = "rgb(30,86,114)";
    for (var y = top; y < H; y++) {
      var x0 = Math.max(0, Math.round(from(y)));
      if (x0 >= W) { continue; }
      var f = (y - top) / depth, band = Math.floor(Math.pow(f, 0.6) * 8) / 8;
      var c = A.mixRgb(hz, deep, band);
      r(x0, y, W - x0, 1, c);
      /* Glints on rows spaced wider toward the front */
      var row = Math.round(Math.sqrt((y - top) / 0.9));
      if (Math.abs(Math.round(row * row * 0.9) - (y - top)) > 0 || row < 1) { continue; }
      var len = 1 + Math.round(f * 7), gap = 7 + Math.round(f * 46);
      var shift = off * (0.15 + 0.85 * f) - (t || 0) * (2 + 6 * f) + row * 37;
      var light = A.mixRgb(c, "rgb(232,228,218)", 0.45 - 0.2 * f);
      for (var gx = -((shift % gap) + gap) % gap; gx < W; gx += gap) {
        var jx = Math.round(gx + (hash(row * 13 + Math.floor((gx + shift) / gap)) % 5));
        if (jx + len > x0) { r(Math.max(x0, jx), y, len, 1, light); }
      }
    }
  }
  /* The street of 2097, moved off pixels along, with the economist's
     building at doorX, and the road out of Athens past it (DENSE, EDGE,
     STOP). Each thing keeps to its own band: the far hills and fields,
     the buildings, the monorail above every roof from level 2, the people
     of 2097 (people: rel, kind and near for each), and the road, which
     past the houses turns into a lighter country road and at the coast
     into sand. t is the time in 2097, which drives the train and the
     turbines whether Greece walks or not. */
  function future(off, level, doorX, people, t) {
    /* The background slides with the walk, in layers. The far land (the
       green hills, their turbines and the bay's water) moves at HILLS of
       the road's speed and the fields at FIELDS; each layer is one fixed
       picture, with its changes (the hills rising past Athens, sinking into
       the bay) drawn into it, so walking only slides it and nothing grows
       or sinks in view. A layer's column u stands at u - off * k on the
       canvas; layerAt(R, k) is the column that is level with Greece once
       Greece has walked R pixels, so each change comes along about when
       Greece passes the matching place on the road. */
    var pm = 1, bg = off, HILLS = 0.5, FIELDS = 0.65;
    var W = A.W, H = A.H, G = A.GROUND, g = A.g, top = FUTURE[level][0], low = FUTURE[level][1], green = GRASS[level];
    var rel = function (x) { return x - doorX; };
    var base = doorX + off;
    var layerAt = function (R, k) { return base + R * k; };
    var smooth = function (f) { f = clamp01(f); return f * f * (3 - 2 * f); };
    /* On the far land: how far the hills have risen past Athens, how far
       from the bay they still are, and how far the bay's water has opened */
    var hRise = function (u) { return smooth((u - layerAt(600, HILLS)) / 260); };
    var hShore = function (u) { return smooth((layerAt(FAR, HILLS) - u) / 260); };
    var hBay = function (u) { return smooth((u - layerAt(FAR - 460, HILLS)) / 120); };
    var hHeight = function (u) { return 40 + (38 + 16 * Math.sin(u / 110) + 6 * Math.sin(u / 41)) * hShore(u); };
    /* On the fields: risen past Athens, and sunk to the beach at the coast */
    var fRise = function (v) { return smooth((v - layerAt(650, FIELDS)) / 260); };
    var fShore = function (v) { return smooth((layerAt(FAR - 120, FIELDS) - v) / 220); };
    for (var y = 0; y < G; y += 4) { g.fillStyle = mix(top, low, Math.pow(y / G, 1.4)); g.fillRect(0, y, W, 4); }
    A.hills(bg * 0.08, 4);
    /* Haze over the far mountains, so they stand back, thickening toward
       the ground with no edge of its own */
    var haze = g.createLinearGradient(0, G - 150, 0, G - 40), lc = A.rgb(low).join(",");
    haze.addColorStop(0, "rgba(" + lc + ",0)");
    haze.addColorStop(1, "rgba(" + lc + ",0.6)");
    g.fillStyle = haze; g.fillRect(0, G - 150, W, 150);
    var far = A.hex(mix(green[0], low, 0.55));
    /* The roofs of the city behind, up to where the risen hills, drawn over
       them, are taller than any roof; the edge goes with the hills */
    var cityEnd = Math.round(layerAt(600, HILLS) + 200 - off * HILLS);
    if (cityEnd > 0) {
      g.save(); g.beginPath(); g.rect(0, 0, cityEnd, G); g.clip();
      A.city(bg * 0.14);
      g.restore();
    }
    /* The water of the bay, on the far land: it opens on the horizon from
       its column on, behind the hills' last slope */
    var bayX = Math.round(layerAt(FAR - 460, HILLS) - off * HILLS), shoreX = doorX + FAR - 40;
    var shoreAt = function (y) { return shoreX + (y - G) * 1.2; };
    if (bayX < W) { sea(low, off, t, function (y) { return y < G ? Math.max(0, bayX) : W; }); }
    /* The green hills rising past Athens and sinking into the bay */
    for (var hx = 0; hx < W; hx += 2) {
      var u = hx + off * HILLS, rise = hRise(u);
      if (rise <= 0 || hShore(u) <= 0) { continue; }
      var hy2 = Math.round(G - hHeight(u) * rise), foot = Math.round(G - 40 * hBay(u));
      if (foot > hy2) { r(hx, hy2, 2, foot - hy2, far); }
    }
    /* The turbines stand on the hills where they are tall, from level 2 */
    if (level >= 2) {
      for (var tb = Math.floor(off * HILLS / 90); tb * 90 - off * HILLS < W; tb++) {
        var tu = tb * 90, tx0 = Math.round(tu - off * HILLS);
        if (hRise(tu) < 1 || hShore(tu) < 1 || tx0 < -10) { continue; }
        var foot = Math.round(G - hHeight(tu)) + 2, spin = pm * (t || 0) * 1.2 + tb;
        r(tx0, foot - 30, 1, 30, C.white);
        [0, 2.09, 4.19].forEach(function (an) { line(tx0, foot - 30, tx0 + Math.round(9 * Math.cos(spin + an)), foot - 30 + Math.round(9 * Math.sin(spin + an)), C.white); });
      }
    }
    /* The fields in front: they rise past Athens and cover the last roofs,
       and toward the coast they flatten into low dunes behind the beach */
    for (var fx2 = 0; fx2 < W; fx2 += 2) {
      var v = fx2 + off * FIELDS, fr = fRise(v), fs = fShore(v);
      if (fr > 0 && fs > 0) {
        var fy = Math.round(G - (6 + (28 + 8 * Math.sin(v / 70) + 5 * Math.sin(v / 23)) * fs) * fr);
        r(fx2, fy, 2, G - fy, green[0]);
      }
      var dune = smooth((v - layerAt(FAR - 520, FIELDS)) / 80) * smooth((layerAt(FAR - 40, FIELDS) - v) / 80);
      var dy = Math.round(G - (12 + 5 * Math.sin(v / 30)) * dune);
      if (G - dy >= 2) {
        r(fx2, dy, 2, G - dy, "#C8B488"); r(fx2, dy, 2, 1, "#D8C89C");
      }
    }
    /* The monorail's pillars, behind the blocks, every 200 pixels, up to
       the station where the line ends with the dense city */
    var rail = G - 176, railEnd = doorX + DENSE;
    if (level >= 2) {
      for (var pl = Math.floor(-doorX / 200); doorX + pl * 200 < Math.min(W, railEnd - HALL); pl++) { r(Math.round(doorX + pl * 200) - 2, rail + 4, 4, G - rail - 4, C.kerb); }
      if (railEnd - HALL < W + 4) { stationPillars(railEnd + 4, rail); }

    }
    /* The buildings along the road, at its speed: dense blocks, then in
       the suburbs lower blocks, empty plots with pines and houses, more of
       each the further out, up to the chapel before the edge */
    /* Plot n starts n * 46 pixels past the economist's door */
    var shopN = -1, schoolN = -1;
    (people || []).forEach(function (p) {
      if (p.kind === "shopkeeper") { shopN = Math.round((p.rel - 22) / 46); }
      if (p.kind === "teacher") { schoolN = Math.round((p.rel - 45) / 46); }
    });
    for (var n = Math.floor(-doorX / 46) - 1; doorX + n * 46 < W; n++) {
      var bx = Math.round(doorX + n * 46), k = hash(n + 500), at = rel(bx);
      if (bx + 46 > doorX - 112 && bx < doorX + 112) { continue; }
      if (at >= EDGE - 60) { break; }
      if (at < DENSE) { block(bx, n, k, level, 60 + k % 40, n === shopN); continue; }
      if (n === schoolN) { school(bx); continue; }
      if (n === schoolN + 1) { continue; }
      /* Round the school: an open plot each side, a house beyond the left
         one and a pine beyond the right one, each 50 pixels from its wall */
      if (n === schoolN - 1 || n === schoolN + 2) { continue; }
      if (n === schoolN - 2) { house(bx, k); continue; }
      if (n === schoolN + 3) { pine(bx + 14); continue; }
      var s = (at - DENSE) / (EDGE - 60 - DENSE), roll = hash(n * 31 + 7) / 1000;
      if (Math.abs(at - (EDGE - 150)) < 23) { chapel(bx + 10); continue; }
      /* The plot after the chapel stays open, where the engineer stands */
      if (Math.abs(at - (EDGE - 150 + 46)) < 23) { continue; }
      /* Every pine stands at the same place in its plot, so a house between
         two of them is in the middle */
      if (roll < s * 0.55) { if (k % 3 === 0) { pine(bx + 17); } continue; }
      if (roll < 0.25 + s * 0.75) { house(bx, k); continue; }
      block(bx, n, k, level, Math.round(36 + (k % 3) * 12 * (1 - s)));
    }
    entrance(doorX, level);
    /* The monorail over every roof, up to the end of the dense city: the
       beam, and a train of three cars on it, faster than the street */
    if (level >= 2 && railEnd > -80) {
      var end = Math.max(0, Math.min(W, railEnd + 4 - HALL + 2));
      g.save(); g.beginPath(); g.rect(0, 0, end, G); g.clip();
      r(0, rail, end, 4, C.grey); r(0, rail + 4, end, 1, C.kerb);
      /* The train runs on its own clock, t, and moves with the street */
      var tx = Math.round(W - ((off + (t || 0) * 70 + 120) % (W + 300)));
      for (var car = 0; car < 3; car++) {
        var cx = tx + car * 44;
        r(cx, rail - 16, 42, 15, C.white); r(cx, rail - 4, 42, 3, C.blue);
        for (var tw = 0; tw < 4; tw++) { r(cx + 4 + tw * 10, rail - 13, 7, 6, C.window); }
        /* The gangway joining it to the next car */
        if (car < 2) { r(cx + 42, rail - 14, 2, 13, C.grey); r(cx + 42, rail - 4, 2, 3, C.blue); }
      }
      /* A rounded nose at each end, flush with the end cars: three columns
         stepping down from the car's height, the blue band running on */
      [[tx - 1, -1], [tx + 130, 1]].forEach(function (nz) {
        [[0, 16, 2], [1, 15, 2], [2, 13, 3]].forEach(function (c) {
          var nx = nz[0] + c[0] * nz[1];
          r(nx, rail - c[1], 1, c[1] - c[2] + 1, C.white);
          r(nx, rail - 4, 1, 4 - c[2] + 1, C.blue);
        });
      });
      g.restore();
      /* The train comes out of the station and goes into it */
      if (railEnd - HALL < W + 10) { station(railEnd + 4, rail, t); }
    }
    /* The plain: the sign at the edge, then olives, cypresses, vineyard
       rows, stone walls and sheep every 70 pixels, kept clear of the sign
       and of Greece's olive tree */
    var stopX = doorX + STOP, signX = doorX + EDGE;
    if (signX - 40 < W) {
      exitSign(signX);
      for (var j = Math.floor(-doorX / 70); doorX + j * 70 < W; j++) {
        var sx = Math.round(doorX + j * 70), kind = hash(j + 900) % 6;
        if (rel(sx) < EDGE + 50 || rel(sx) > COAST - 60 || Math.abs(sx - stopX) < 70 || Math.abs(rel(sx) - 1260) < 80 || Math.abs(rel(sx) - 2560) < 70) { continue; }
        if (kind <= 1) { if (level > 0 || kind === 0) { A.olive(sx); } }
        else if (kind === 2) { cypress(sx + 10, 30 + hash(j) % 16); }
        else if (kind === 3) { r(sx, G - 6, 40, 6, C.grey); for (var st = 0; st < 40; st += 8) { r(sx + st + (j % 2) * 4, G - 6, 1, 6, C.kerb); } r(sx, G - 3, 40, 1, C.kerb); }
        else if (kind === 4) { for (var vr = 0; vr < 56; vr += 7) { r(sx + vr, G - 9, 1, 9, C.bark); r(sx + vr - 2, G - 9, 5, 4, level === 0 ? C.leaf : C.leafLit); } }
        else { sheep(sx + 8, j); sheep(sx + 30, j + 1); }
      }
      /* Greece's olive tree, twice the size, its shade on the grass; the
         olive is drawn on a ground line of 0 under the doubling */
      g.globalAlpha = 0.25; r(stopX - 34, G - 2, 76, 2, C.dark); g.globalAlpha = 1;
      twice(stopX - 12, G, function () { var gk = A.GROUND; A.GROUND = 0; A.olive(0); A.GROUND = gk; });
    }
    /* The people of 2097, standing where they are */
    (people || []).forEach(function (p) {
      var px = Math.round(doorX + p.rel);
      /* At the economist's door the same bubble shows over the pediment */
      if (p.kind === "door") { if (p.near) { A.bubble(px, G - 64); } return; }
      if (px < -60 || px > W + 60) { return; }
      /* The shepherd's flock round him, the fisher's boat drawn up beside
         him */
      if (p.kind === "shepherd") { sheep(px - 40, 0); sheep(px - 24, 1); sheep(px + 14, 2); sheep(px + 32, 4); }
      if (p.kind === "fisher") {
        r(px + 10, G - 7, 30, 5, "#3D5A7A"); r(px + 12, G - 2, 26, 2, "#2C4560"); r(px + 10, G - 8, 30, 1, C.white);
        r(px + 24, G - 26, 1, 19, C.bark); r(px + 25, G - 24, 9, 1, C.dust);
      }
      A.person(px, G, p.kind, p.near);
    });
    if (level === 0) { g.globalAlpha = 0.12; g.fillStyle = C.titan; g.fillRect(0, 0, W, G); g.globalAlpha = 1; }
    /* The road, its pavement turning into a gravel verge past the houses,
       then the road itself into a lighter, narrower country road with a
       grass verge and no center line */
    A.road(off);
    for (var vx = 0; vx < W; vx += 2) {
      var va = clamp01((rel(vx) - 850) / 220), ra = clamp01((rel(vx) - 950) / 320);
      if (va <= 0) { continue; }
      if (ra > 0) {
        g.globalAlpha = ra;
        r(vx, G + 23, 2, H - G - 23, "#62686A");
        r(vx, H - 14, 2, 14, green[1]); r(vx, H - 15, 2, 1, green[0]);
      }
      g.globalAlpha = va;
      r(vx, G, 2, 20, "#857756");
      var col = Math.floor((vx + off) / 2);
      for (var pb = 0; pb < 3; pb++) { if (hash(col * 3 + pb) % 4 === 0) { r(vx + (hash(col + pb) % 2), G + 2 + hash(col * 7 + pb) % 16, 1, 1, "#6E6046"); } }
      r(vx, G + 20, 2, 3, green[1]);
    }
    g.globalAlpha = 1;
    /* At the coast the road ends on the sand along a slanting edge, and the
       beach slopes down into the sea: the water's surface lies WATER pixels
       under the pavement line, with wet sand and foam where they meet */
    var sandX = doorX + COAST + 40, WATER = 7;
    for (var sy = G; sy < H; sy += 2) {
      var sx0 = Math.round(sandX + (sy - G) * 0.9);
      if (sx0 < W) { r(Math.max(0, sx0), sy, W - Math.max(0, sx0), 2, "#C8B488"); }
    }
    /* The shoreline crosses the near ground at a slant, nearer the front
       further out: the near sea shows again past it, with a band of wet
       sand, the foam at the edge and two lines of surf lapping in */
    if (bayX < W) {
      sea(low, off, t, function (y) { return y < G ? W : shoreAt(y); });
      for (var wy = G; wy < H; wy += 2) {
        var ex = Math.round(shoreAt(wy));
        if (ex >= W) { continue; }
        r(Math.max(0, ex - 6), wy, 6, 2, "#A8946A");
        r(ex, wy, 2, 2, C.white);
        var lap = pm * Math.sin((t || 0) * 1.6 + wy * 0.25);
        g.globalAlpha = 0.6;
        if (wy % 4 === 0) { r(Math.round(ex + 7 + 3 * lap), wy, 3, 1, C.white); }
        if (wy % 6 === 2) { r(Math.round(ex + 17 + 4 * lap), wy, 2, 1, C.white); }
        g.globalAlpha = 1;
      }
    }
    g.globalAlpha = 1;
  }
  A.entrance = entrance; A.office = office; A.athens = athens; A.future = future; A.economist = economist;
  A.DENSE = DENSE; A.EDGE = EDGE; A.STOP = STOP; A.COAST = COAST; A.FAR = FAR; A.SHORE = SHORE; A.spot = spot;
})();
