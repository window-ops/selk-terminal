/* TROIKA.RUN art (js/games/troika/art/): the sky of each year, the
   mountains round Athens, the planes, the light over the background and
   the roofs of the city behind the scenes. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r, line = A.line, mix = A.mix, mixRgb = A.mixRgb, hash = A.hash;
  /* The sky of each year, top and horizon: a May morning, a summer day, a
     March dusk, a June night, an April morning and a July dusk. The hills
     take the horizon's color, darkened. */
  var SKIES = [
    ["#2A3A48", "#5E6E78"], ["#33506A", "#8AA0A8"], ["#2A2438", "#7A5A4E"],
    ["#0E1418", "#1E2A30"], ["#2C4050", "#9A8A70"], ["#3A2420", "#B0603A"]
  ];
  /* The colors at a point between two years: year is a whole year plus
     the blend toward the next one, 0 to 1 */
  function skyAt(year) {
    var a = SKIES[Math.floor(year)], b = SKIES[Math.min(5, Math.floor(year) + 1)], f = year - Math.floor(year);
    return [mix(a[0], b[0], f), mix(a[1], b[1], f)];
  }
  /* The sky in bands of 4 pixels from top to horizon; stars only at night */
  function sky(year) {
    var c = skyAt(year), top = c[0], low = c[1];
    for (var y = 0; y < A.GROUND; y += 4) {
      A.g.fillStyle = mixRgb(top, low, Math.pow(y / A.GROUND, 1.4)); A.g.fillRect(0, y, A.W, 4);
    }
    var night = Math.max(0, 1 - Math.abs(year - 3));
    if (night > 0) {
      A.g.globalAlpha = night;
      for (var i = 0; i < 40; i++) { r((i * 151) % A.W, 30 + (i * 67) % 90, 1, 1, C.dust); }
      A.g.globalAlpha = 1;
    }
  }
  /* The mountains that close the Athens basin, as the street turns past
     them, every 3 200 pixels: Aigaleo to the west (452 m), Parnitha to the
     north (1 413 m), Penteli to the northeast (1 109 m) with the white scars
     of its marble quarries, and the long, flat ridge of Hymettus to the east
     (1 026 m). Heights are to scale, 7 pixels for 100 m. */
  var RANGES = [[300, 220, 32, 2], [1000, 380, 99, 2], [1700, 200, 78, 2], [2500, 430, 72, 6]];
  function ridge(u) {
    var h = 4;
    RANGES.forEach(function (m) {
      [-3200, 0, 3200].forEach(function (shift) {
        var d = Math.abs(u - m[0] - shift) / m[1];
        h = Math.max(h, m[2] * Math.exp(-Math.pow(d, m[3])));
      });
    });
    return h;
  }
  function hills(off, year) {
    /* The color is set for each column: the quarry marks below set their
       own, which must not carry on to the next columns */
    var tone = mixRgb(skyAt(year)[1], "rgb(30,37,40)", 0.85);
    for (var x = 0; x < A.W; x += 2) {
      var u = ((x + off) % 3200 + 3200) % 3200, top = Math.round(A.GROUND - 40 - ridge(u));
      r(x, top, 2, A.GROUND - top, tone);
      if (Math.abs(u - 1700) < 50 && (x + Math.floor(off)) % 6 < 2) { r(x, top + 3 + (u % 5), 2, 2, C.cityLit); }
    }
  }
  /* A plane climbing away to the right, with a short contrail behind it */
  function plane(x, y) {
    A.g.globalAlpha = 0.5; line(x - 30, y + 5, x - 2, y + 1, C.white); A.g.globalAlpha = 1;
    r(x, y, 12, 2, C.white); r(x + 12, y, 2, 1, C.white);
    r(x, y - 3, 2, 3, C.white); r(x + 4, y + 2, 4, 1, C.dust); r(x + 5, y - 1, 3, 1, C.dust);
  }
  /* The light of the year over the whole background, so the mountains, the
     roofs and the scenes share it */
  function light(year) {
    A.g.globalAlpha = 0.1;
    A.g.fillStyle = skyAt(year)[1];
    A.g.fillRect(0, 0, A.W, A.GROUND);
    A.g.globalAlpha = 1;
  }
  /* Athens behind every scene, kept quiet: low apartment roofs, some with
     a solar water heater or a television aerial, and now and then a
     cypress. It moves between the mountains and the scenes. */
  function city(off) {
    for (var n = Math.floor(off / 24); n * 24 - off < A.W; n++) {
      var bx = Math.round(n * 24 - off), k = hash(n), h = 14 + k % 20;
      r(bx, A.GROUND - h, 23, h, C.city);
      if (k % 4 === 0) { r(bx + 4, A.GROUND - h - 2, 7, 2, C.cityLit); r(bx + 13, A.GROUND - h - 2, 4, 2, C.cityLit); }
      if (k % 6 === 1) { r(bx + 17, A.GROUND - h - 7, 1, 7, C.cityLit); r(bx + 15, A.GROUND - h - 6, 5, 1, C.cityLit); }
      if (k % 13 === 4) {
        for (var c = 0; c < 16; c++) { r(bx + 20 - Math.min(c, 16 - c) / 4, A.GROUND - h - 12 + c, 2 + Math.min(c, 16 - c) / 2, 1, C.cypress); }
      }
    }
  }
  A.skyAt = skyAt; A.sky = sky; A.hills = hills; A.plane = plane; A.light = light; A.city = city;
})();
