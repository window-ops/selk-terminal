/* SV-4 LIVE camera: a small pixel animation of MAST-01 drawn on canvas, driven by
   the WATCH telemetry (wind, dust, gusts, mast load). */
(function () {
  var S = window.SELK;
  var W = 160, H = 80, canvases = [], dust = [], last = 0, frameNo = 0;
  var buf = document.createElement("canvas"); buf.width = W; buf.height = H;
  var g = buf.getContext("2d");
  var BAYER = [
    [
      0,
      8,
      2,
      10
    ],
    [
      12,
      4,
      14,
      6
    ],
    [
      3,
      11,
      1,
      9
    ],
    [
      15,
      7,
      13,
      5
    ]
  ];
  var skyCache = {};
  var dune = [], crest = [];
  for (var x = 0; x < W; x++) {
    dune.push(Math.round(66 + 2.4 * Math.sin(x / 11) + 1.5 * Math.sin(x / 4.3 + 1)));
    crest.push(dune[x] - 4 + Math.round(Math.sin(x / 7) * 1.2));
  }
  /* The crests behind the dunes: a dip one or two columns wide is filled
     level with its neighbors */
  for (x = 1; x < W - 1; x++) {
    if (crest[x] > crest[x - 1] && crest[x] > crest[x + 1]) { crest[x] = Math.max(crest[x - 1], crest[x + 1]); }
    else if (x < W - 2 && crest[x] > crest[x - 1] && crest[x + 1] === crest[x] && crest[x] > crest[x + 2]) {
      crest[x] = crest[x + 1] = Math.max(crest[x - 1], crest[x + 2]);
    }
  }
  /* The slope down to the east hallway keeps its step of one pixel every
     two columns to the tube */
  crest[135] = crest[136] = 63;
  function hex(h) {
    return [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16)
    ];
  }
  function skyImage(level) {
    var k = Math.round(level * 5);
    if (skyCache[k]) {
      return skyCache[k];
    }
    var clear = [
      "#A88D5C",
      "#B89C69",
      "#C7AB78",
      "#D3B988"
    ], storm = [
      "#9A8258",
      "#AE9669",
      "#BEA67A",
      "#C9B28A"
    ];
    var mix = k / 5, img = g.createImageData(W, H), d = img.data;
    var cols = clear.map(function (c, i) {
      var a = hex(c), b = hex(storm[i]); return a.map(function (v, j) {
        return Math.round(v + (b[j] - v) * mix);
      });
    });
    for (var y = 0; y < H; y++) {
      var t = Math.min(2.999, (y / 66) * 3), i = Math.floor(t), f = t - i;
      for (var x = 0; x < W; x++) {
        var c = (f * 16 > BAYER[y % 4][x % 4]) ? cols[Math.min(3, i + 1)] : cols[i];
        var o = (y * W + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    skyCache[k] = img;
    return img;
  }
  function px(x, y, c) {
    g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  /* A line of single pixels, as the ending scenes draw their cables; out,
     when given, collects the pixels drawn */
  function seg(x0, y0, x1, y1, c, out) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (var i = 0; i <= n; i++) {
      var x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
      px(x, y, c); if (out) { out.push([x, y]); }
    }
  }
  /* A cable sagging by sag at its middle: whole pixel points joined by
     single pixel lines, so it stays one pixel wide */
  function sagAt(x0, y0, x1, y1, sag, t) { return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)]; }
  function curve(x0, y0, x1, y1, sag, c) {
    var p = [Math.round(x0), Math.round(y0)], out = [];
    /* A tight cable is one clean line: rounded points along a straight
       line would add jogs to its steps */
    if (!sag) { seg(p[0], p[1], Math.round(x1), Math.round(y1), c, out); return out; }
    for (var i = 1; i <= 24; i++) {
      var q = sagAt(x0, y0, x1, y1, sag, i / 24);
      q = [Math.round(q[0]), Math.round(q[1])]; seg(p[0], p[1], q[0], q[1], c, out); p = q;
    }
    return out;
  }
  function draw() {
    var v = (S.watch && S.watch.last) || {
      L: 0.2,
      wind: 2,
      vis: 12,
      load: 117
    };
    var gust = (S.watch && S.watch.gust) || 0, L = v.L, t = frameNo / 12;
    g.putImageData(skyImage(L), 0, 0);
    /* The dune crests behind, each column down to the ground in front, so
       no sky shows under them */
    g.fillStyle = "#6E5A3C";
    for (var x = 0; x < W; x++) {
      g.fillRect(x, crest[x], 1, dune[x] - crest[x]);
    }
    g.fillStyle = "#4A4034"; g.fillRect(14, 56, 22, 8); g.fillRect(18, 52, 6, 4); g.fillRect(28, 50, 2, 6);
    if (frameNo % 24 < 12) {
      px(20, 59, "#C7843A"); px(26, 59, "#C7843A"); px(32, 59, "#C7843A");
    }
    for (x = 0; x < W; x++) {
      for (var y = dune[x]; y < H; y++) {
        g.fillStyle = ((x + y) % 5 === 0) ? "#7A6240" : "#8A7048"; g.fillRect(x, y, 1, 1);
      }
    }
    /* MAST-01 as the site pictures and the ending scenes draw it
       (tools/site-pictures.js, js/game/scenes.js): the printed ice shell,
       symmetric, in four tiers from 9 pixels to 3, with tie bands; the
       guys of levels 1 to 3 and the slack loop of level 4, all in one
       cable color, and the outriggers, in the proportions of the design
       sheet (the tower 29 pixels tall there); CRANE-L parked and stowed
       on the west face; the AMBER vent and the beacon on top; HALL-R at the
       foot. The tower sways with the gusts, more at the top; the tight
       guys stay straight and the slack loops swing with the wind. */
    var mx = 112, base = 67, h = 58, k = h / 29, removed = v.load === 0;
    if (!removed) {
      var sway = Math.sin(t * 1.1) * gust * 0.8;
      var sx = function (up) { return sway * up / h; };
      var half = function (up) { return 4 - Math.min(3, Math.floor(4 * up / h)); };
      var edge = function (up, side) { return Math.round(mx + sx(up)) + side * half(up); };
      var levels = [350, 700, 1050].map(function (m) { return Math.round(h * m / 1180); });
      var anchors = [22, 29, 36].map(function (a) { return Math.round(a * k); });
      /* The anchors and the outrigger legs end behind the hallways, two
         pixels above the foot, out of sight as in the ending scenes */
      var cable = "#8C7A5E", foot = base - 2;
      [-1, 1].forEach(function (side) {
        /* The guys of levels 1 to 3 are tight: straight lines */
        var drawn = levels.map(function (up, i) {
          return curve(edge(up, side) + side, base - up, mx + side * anchors[i], foot, 0, cable);
        });
        /* Level 4, tied off on the level 3 guy: on the pixel that guy is
           drawn with, 10 out, so the two cables meet without a knot */
        var up3 = levels[2], x0 = edge(up3, side) + side, tx = x0 + side * Math.round(10 * k);
        var tie = drawn[2].filter(function (p) { return p[0] === tx; })[0] || drawn[2][drawn[2].length - 1];
        curve(x0, base - up3, tie[0], tie[1], 5 * k + gust * 2 * Math.sin(t * 2.3 + side), cable);
        var by = Math.round(10 * k), lx = mx + side * Math.round(18 * k);
        g.fillStyle = "#3A3128";
        g.fillRect(Math.min(edge(by, side), lx), base - by, Math.abs(lx - edge(by, side)) + 1, 1);
        g.fillRect(lx, base - by, 1, foot - (base - by) + 1);
      });
      for (var up = 0; up < h; up++) {
        var l = edge(up, -1), r = edge(up, 1);
        g.fillStyle = up % 3 === 1 ? "#4A4034" : "#3A3128"; g.fillRect(l, base - up, r - l + 1, 1);
      }
      var tx = Math.round(mx + sx(h));
      g.fillStyle = "#5C4D3A"; g.fillRect(tx, base - h - 2, 1, 3);
      if (frameNo % 18 < 3) {
        px(tx, base - h - 3, "#F0A04A");
      }
      /* CRANE-L stowed, its jib folded flat beside the body, just above
         the level 2 guys, inside the third tier, the body 3 pixels by 4 */
      var cb = levels[1] + 1, cl = edge(cb, -1);
      g.fillStyle = "#5C4D3A"; g.fillRect(cl - 3, base - cb - 3, 3, 4);
      g.fillStyle = "#3A3128"; g.fillRect(cl - 4, base - cb - 3, 1, 4);
      px(cl - 2, base - cb - 2, "#C7843A");
      for (var i = -10; i <= 10; i++) {
        var hh = Math.round(5 * Math.sqrt(Math.max(0, 1 - (i / 10.5) * (i / 10.5))));
        if (hh > 0) { g.fillStyle = Math.abs(i) % 3 === 0 ? "#4A4034" : "#3A3128"; g.fillRect(mx + i, base - hh + 1, 1, hh); }
      }
    }
    /* The hallways of the site map, as the ending scenes draw them: straight
       ribbed tubes at the level of the tower's foot, from the lab (west) to
       a few pixels short of HALL-R, and from HALL-R east toward EX-1,
       beyond the picture. Where a dune rises over a tube the sand covers
       it, and a stretch that would show less than two rows of it, or for
       fewer than four columns, stays under the sand; where the ground dips,
       the sand bed the tube was laid on fills the space under it */
    var sand = function (x, y0, y1) {
      for (var y = y0; y < y1; y++) { g.fillStyle = ((x + y) % 5 === 0) ? "#7A6240" : "#8A7048"; g.fillRect(x, y, 1, 1); }
    };
    [[36, mx - 15], [mx + 15, W]].forEach(function (c) {
      var shown = [], x, e, j;
      for (x = c[0]; x < c[1]; x++) { shown[x] = dune[x] >= base - 1; }
      for (x = c[0]; x < c[1]; x = e) {
        for (e = x; e < c[1] && shown[e] === shown[x]; e++) {}
        if (shown[x] && e - x < 4) { for (j = x; j < e; j++) { shown[j] = false; } }
      }
      for (x = c[0]; x < c[1]; x++) {
        if (!shown[x]) { sand(x, base - 3, Math.max(dune[x], base)); continue; }
        g.fillStyle = "#5C4D3A"; g.fillRect(x, base - 3, 1, 1);
        g.fillStyle = (x - c[0]) % 5 === 2 ? "#4A4034" : "#3A3128"; g.fillRect(x, base - 2, 1, 2);
        sand(x, Math.max(dune[x], base - 3), base);
        sand(x, base, dune[x]);
      }
    });
    /* The pockets of sky the guys close in against the dunes and the east
       hallway, filled with the dune behind; fixed pixels, as the guys
       leave them */
    if (!removed) {
      g.fillStyle = "#6E5A3C";
      [[62, 61], [64, 60], [65, 60], [149, 63]].forEach(function (p) { g.fillRect(p[0], p[1], 1, 1); });
    }
    var want = Math.round(20 + 150 * L + gust * 60);
    while (dust.length < want) {
      dust.push( {
        x: Math.random() * W,
        y: Math.random() * 70,
        s: 0.5 + Math.random()
      });
    }
    if (dust.length > want) {
      dust.length = want;
    }
    var speed = 0.3 + v.wind * 0.35 + gust * 2.5, len = Math.max(1, Math.round(speed));
    g.fillStyle = "#E2CFA2";
    dust.forEach(function (p) {
      p.x += speed * p.s; p.y += Math.sin((p.x + frameNo) / 9) * 0.25;
      if (p.x > W) {
        p.x -= W + 4; p.y = Math.random() * 70;
      }
      g.fillRect(Math.round(p.x), Math.round(p.y), len, 1);
    });
    var haze = Math.min(0.55, 0.05 + (14 - v.vis) / 26 + gust * 0.1);
    var grad = g.createLinearGradient(0, 20, 0, 80);
    grad.addColorStop(0, "rgba(214,190,145,0)"); grad.addColorStop(1, "rgba(214,190,145," + haze.toFixed(2) + ")");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
  }
  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - last < 83) {
      return;
    }
    last = ts;
    var shown = canvases.filter(function (c) {
      return c.isConnected && c.offsetParent;
    });
    if (!shown.length) {
      return;
    }
    frameNo++;
    draw();
    shown.forEach(function (c) {
      var x = c.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(buf, 0, 0);
    });
  }
  S.live = {
    canvas: function () {
      var c = document.createElement("canvas");
      c.width = W; c.height = H; c.className = "live";
      c.setAttribute("role", "img"); c.setAttribute("aria-label", S.t("Live camera view of MAST-01"));
      canvases.push(c);
      return c;
    },
    start: function () {
      if (!S.live.running) {
        S.live.running = true; requestAnimationFrame(loop);
      }
    }
  };
})();
