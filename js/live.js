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
  var dune = [];
  for (var x = 0; x < W; x++) {
    dune.push(Math.round(66 + 2.4 * Math.sin(x / 11) + 1.5 * Math.sin(x / 4.3 + 1)));
  }
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
  function curve(x0, y0, x1, y1, sag, c) {
    for (var i = 0; i <= 80; i++) {
      var t = i / 80;
      px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t), c);
    }
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
    g.fillStyle = "#6E5A3C";
    for (var x = 0; x < W; x++) {
      g.fillRect(x, dune[x] - 4 + Math.round(Math.sin(x / 7) * 1.2), 1, 3);
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
    var mx = 112, removed = v.load === 0;
    if (!removed) {
      var sway = Math.sin(t * 1.1) * gust * 0.8;
      g.fillStyle = "#3A3128";
      for (y = 10; y < 68; y++) {
        var half = 1 + Math.floor((y - 10) / 20); g.fillRect(mx - half + (sway * (68 - y) / 58), y, half * 2 + 1, 1);
      }
      g.fillRect(mx - 1 + sway, 6, 3, 4);
      g.fillRect(mx - 16, 40, 33, 2); g.fillRect(mx - 16, 42, 2, 24); g.fillRect(mx + 15, 42, 2, 24);
      g.fillStyle = "#2A231C"; g.fillRect(mx - 5 + sway * 0.5, 30, 3, 6);
      if (frameNo % 18 < 3) {
        px(mx + sway, 5, "#F0A04A"); px(mx + sway, 4, "#C7843A");
      }
      [ [
        12,
        40,
        1
      ], [
        12,
        158,
        1
      ], [
        24,
        60,
        0.8
      ], [
        24,
        150,
        0.8
      ], [
        34,
        78,
        0.6
      ], [
        34,
        140,
        0.6
      ]].forEach(function (c, i) {
        var s = 2 + gust * 3 * Math.sin(t * 1.7 + i) + v.wind * 0.15;
        curve(mx + sway * (68 - c[0]) / 58, c[0], c[1], 67, s * c[2], "#5C4D3A");
      });
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
      c.setAttribute("role", "img"); c.setAttribute("aria-label", "Live camera view of MAST-01");
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
