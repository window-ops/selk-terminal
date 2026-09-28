/* Ending scenes: small animated pixel pictures drawn as SVG on a 160 by 90 grid,
   in the palette of the SV-4 live camera. Each ending has three panels, built
   from shared pieces (sky, crater, tower, crane, lab, plant, dish, plots,
   people). S.scenes.make(id, n) returns { el, start, stop }; the picture
   redraws its moving parts a few times a second, and stays still when motion
   is reduced. */
(function () {
  var S = window.SELK, NS = "http://www.w3.org/2000/svg", W = 160, H = 90, GROUND = 66;
  var C = {
    sky: ["#A88D5C", "#B89C69", "#C7AB78", "#D3B988"],
    night: ["#2B2824", "#3A342C", "#4A4135", "#5B4E3C"],
    warm: ["#B7864E", "#C8955A", "#D6A76A", "#E0B97E"],
    ground: "#6E5B3E", ground2: "#5A4A33", rim: "#836C48",
    dark: "#1E2427", rib: "#3A4448", steel: "#56605F", haze: "#D6C396",
    amber: "#C7843A", red: "#C0604A", lamp: "#A7B07C", glow: "#D8E3A0", white: "#EFE6C8"
  };
  function node(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) { n.setAttribute(k, attrs[k]); }
    return n;
  }
  function R(g, x, y, w, h, c, o) {
    var r = node("rect", { x: Math.round(x), y: Math.round(y), width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)), fill: c });
    if (o != null && o < 1) { r.setAttribute("opacity", o); }
    g.appendChild(r); return r;
  }
  function P(g, x, y, c, o) { return R(g, x, y, 1, 1, c, o); }
  /* Deterministic noise, so dust and stars sit still between frames */
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* Pieces */
  function sky(g, pal) {
    var band = Math.ceil(GROUND / 4);
    pal.forEach(function (c, i) { R(g, 0, i * band, W, band + 1, c); });
    /* A checker row between bands, the camera's dithering */
    for (var i = 1; i < 4; i++) {
      for (var x = 0; x < W; x += 2) { P(g, x + (i % 2), i * band - 1, pal[i - 1]); }
    }
  }
  function stars(g, n) {
    for (var i = 0; i < n; i++) { P(g, rnd(i) * W, rnd(i + 50) * 34, C.haze, 0.35 + rnd(i + 9) * 0.5); }
  }
  function saturn(g, x, y) {
    R(g, x - 3, y - 2, 7, 5, C.haze, 0.8); R(g, x - 2, y - 3, 5, 7, C.haze, 0.8);
    R(g, x - 8, y, 17, 1, C.haze, 0.55);
  }
  /* The far crater rim, between the sky and the ground, for depth */
  function ridge(g) {
    for (var x = 0; x < W; x++) {
      var h = Math.round(5 + 3 * Math.sin(x / 17 + 2) + 2 * Math.sin(x / 7));
      R(g, x, GROUND - h, 1, h, "#957A52", 0.8);
    }
  }
  function ground(g) {
    ridge(g);
    R(g, 0, GROUND, W, H - GROUND, C.ground);
    for (var x = 0; x < W; x++) {
      var h = Math.round(2.2 * Math.sin(x / 11) + 1.4 * Math.sin(x / 4.3 + 1));
      R(g, x, GROUND - 2 + h, 1, 3, C.rim);
    }
    R(g, 0, GROUND + 12, W, H - GROUND - 12, C.ground2);
    for (var i = 0; i < 9; i++) {
      var rx = rnd(i + 90) * W, ry = GROUND + 8 + rnd(i + 91) * 14, rw = 2 + Math.round(rnd(i + 92) * 4);
      R(g, rx, ry, rw, 2, C.rim); R(g, rx + 1, ry - 1, rw - 1, 1, C.rim, 0.7);
    }
  }
  function dust(g, t, n, dx) {
    for (var i = 0; i < n; i++) {
      var x = (rnd(i) * W + t * (dx || 6) * (0.5 + rnd(i + 3))) % W;
      P(g, x, GROUND - 14 + rnd(i + 7) * 22, C.haze, 0.35);
    }
  }
  /* The tower: h pixels tall, lean in pixels at the top, a warning light */
  function mast(g, x, h, lean, t, light) {
    for (var y = 0; y < h; y++) {
      var f = y / h, cx = x + lean * f, w = Math.max(2, Math.round(8 - 6 * f)), left = Math.round(cx - w / 2);
      /* Two legs, cross bracing every few rows, a darker core */
      P(g, left, GROUND - y, C.dark); P(g, left + w - 1, GROUND - y, C.dark);
      if (y % 5 === 0) { R(g, left, GROUND - y, w, 1, C.rib); }
      else if (w > 3) { P(g, left + 1 + ((y % 5) * (w - 2) / 5 | 0), GROUND - y, C.steel); }
    }
    if (light !== false && Math.floor(t * 1.5) % 2 === 0) { R(g, x + lean - 1, GROUND - h - 2, 2, 2, C.red); }
  }
  function crane(g, x, h, jib, hookY) {
    R(g, x, GROUND - h, 1, h, C.steel);
    R(g, x - 2, GROUND - h, jib + 3, 1, C.steel);
    R(g, x + jib, GROUND - h, 1, hookY, C.rib);
    return GROUND - h + hookY;
  }
  function hall(g, x) {
    for (var i = 0; i < 7; i++) { R(g, x + i * 3, GROUND - 5 - (i % 3 === 1 ? 1 : 0), 1, 6, C.rib); }
    R(g, x, GROUND - 6, 19, 1, C.dark);
  }
  function footing(g, x) { R(g, x, GROUND - 5, 16, 6, C.steel); R(g, x, GROUND - 5, 16, 1, C.haze, 0.4); }
  function plot(g, x, w, level, t) {
    R(g, x - 1, GROUND + 2, w + 2, 5, C.ground2);
    R(g, x - 1, GROUND + 1, w + 2, 1, C.rib, 0.6);
    for (var i = 0; i < w; i += 2) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 2 + i);
      if (level > 0 && rnd(i + x) < level) {
        var a = 0.35 + 0.65 * pulse * level;
        P(g, x + i, GROUND + 3 + (i % 3), C.glow, a);
        if (rnd(i + x + 7) < level) { R(g, x + i, GROUND - 1, 1, 2, C.lamp, a); }
      }
    }
  }
  function lab(g, x, lit, t) {
    R(g, x, GROUND - 9, 22, 10, C.dark); R(g, x + 2, GROUND - 11, 18, 2, C.rib);
    for (var i = 0; i < 5; i++) {
      var on = lit > 0 && (lit >= 1 || t * 2 > i);
      R(g, x + 2 + i * 4, GROUND - 7, 2, 2, on ? C.amber : C.rib);
    }
    R(g, x + 9, GROUND - 3, 3, 3, lit > 0 ? C.haze : C.rib);
  }
  function plant(g, x, plume, t) {
    R(g, x, GROUND - 10, 24, 11, C.dark); R(g, x + 17, GROUND - 22, 3, 12, C.rib);
    R(g, x + 3, GROUND - 7, 4, 2, C.amber, 0.8);
    for (var i = 0; i < 14; i++) {
      var age = (t * 0.8 + i / 14) % 1, py = GROUND - 23 - age * 26;
      if (rnd(i) < plume) { R(g, x + 17 + Math.sin(i + t) * 2 + age * 6, py, 2 + age * 3, 1, C.haze, (1 - age) * 0.7 * plume); }
    }
  }
  function dish(g, x, beam, t) {
    R(g, x - 1, GROUND - 10, 3, 10, C.steel); R(g, x - 4, GROUND - 2, 9, 2, C.dark);
    for (var i = 0; i < 9; i++) { R(g, x - 8 + i, GROUND - 16 - Math.round(Math.abs(i - 4) * 0.8), 9 - Math.abs(i - 4), 1, C.haze); }
    R(g, x - 1, GROUND - 21, 2, 3, C.steel);
    for (var i = 0; i < 5 && beam; i++) {
      var y = GROUND - 22 - ((t * 20 + i * 11) % 50);
      R(g, x + (GROUND - 22 - y) * 0.3, y, 2, 3, C.amber, 0.9);
    }
  }
  function relay(g, x, on, t) {
    R(g, x, 18, 1, GROUND - 18, C.steel); R(g, x - 2, 20, 5, 1, C.steel);
    if (on && Math.floor(t * 2) % 2 === 0) { R(g, x - 1, 16, 3, 2, C.red); }
    if (!on) { R(g, x - 1, 16, 3, 2, C.rib); }
  }
  function person(g, x, y, c) {
    R(g, x, y, 2, 1, c || C.dark); R(g, x - 1, y + 1, 4, 3, c || C.dark); R(g, x, y + 4, 1, 2, c || C.dark); R(g, x + 1, y + 4, 1, 2, c || C.dark);
  }
  function dome(g, x, w, lit) {
    for (var i = 0; i < w; i++) {
      var hh = Math.round(Math.sqrt(1 - Math.pow((i - w / 2) / (w / 2), 2)) * w * 0.45);
      R(g, x + i, GROUND - hh, 1, hh, C.dark);
    }
    if (lit) { R(g, x + w / 2 - 6, GROUND - 5, 12, 2, C.amber, 0.7); }
  }
  function tanker(g, x, y, t) {
    R(g, x, y, 5, 14, C.haze); R(g, x + 1, y - 3, 3, 3, C.haze); R(g, x, y + 5, 5, 2, C.lamp);
    for (var i = 0; i < 6; i++) { R(g, x + 1 + rnd(i + Math.floor(t * 8)) * 3, y + 14 + i * 2, 2, 2, i < 2 ? C.white : C.amber, 1 - i / 6); }
  }
  function vent(g, x, t, level) {
    R(g, x, GROUND - 4, 5, 5, C.steel);
    for (var i = 0; i < 10; i++) {
      var age = (t * 0.6 + i / 10) % 1;
      R(g, x + 1 + Math.sin(i * 2 + t) * 2, GROUND - 6 - age * 30, 3, 1, C.white, (1 - age) * level);
    }
  }
  function meter(g, x, y, value, label) {
    /* A reading on a console box standing on the ground */
    R(g, x - 3, y - 9, 36, 19, C.dark); R(g, x - 2, y - 8, 34, 17, "#2E3A33");
    R(g, x + 12, y + 10, 6, GROUND - y - 10, C.rib);
    R(g, x, y, 30, 7, C.dark); R(g, x + 1, y + 1, 28 * value, 5, value > 0.5 ? C.lamp : C.red);
    if (label) { var tx = node("text", { x: x, y: y - 2, fill: C.lamp, "font-size": 5, "font-family": "monospace" }); tx.textContent = S.t ? S.t(label) : label; g.appendChild(tx); }
  }
  function screen(g, x, y, t, flat) {
    R(g, x + 18, y + 22, 4, GROUND - y - 22, C.rib);
    R(g, x, y, 40, 22, C.dark); R(g, x + 1, y + 1, 38, 20, "#2E3A33");
    var tx = node("text", { x: x + 3, y: y + 7, fill: C.lamp, "font-size": 5, "font-family": "monospace" }); tx.textContent = S.t ? S.t("GATE") : "GATE"; g.appendChild(tx);
    for (var i = 0; i < 36; i++) {
      var v = flat ? 0 : Math.sin(i / 3 + t * 3) * 5 * rnd(i);
      P(g, x + 2 + i, y + 11 + v, C.lamp);
    }
  }
  /* A survey post with a question mark: what is under plot 9 is unknown */
  function marker(g, x, t) {
    R(g, x, GROUND - 16, 1, 16, C.steel);
    R(g, x + 1, GROUND - 16, 9, 7, C.haze, 0.5 + 0.4 * Math.abs(Math.sin(t)));
    [[3, 1], [4, 1], [5, 1], [6, 2], [5, 3], [4, 4], [4, 6]].forEach(function (q) { P(g, x + q[0], GROUND - 16 + q[1] - 1, C.dark); });
  }
  function haloWarm(g, t) {
    for (var y = 0; y < 30; y += 2) { R(g, 0, y, W, 2, C.amber, 0.05 + 0.03 * Math.sin(t + y / 6)); }
  }

  /* Panels. Each draws the whole picture for time t (seconds). */
  var SCENES = {
    dismantle: [
      function (g, t) { sky(g, C.sky); ground(g); var h = Math.max(26, 54 - t * 2); mast(g, 70, h, 0, t); var hook = crane(g, 96, 48, -18, 10 + (t * 6) % 30); R(g, 76, hook, 6, 3, C.steel); dust(g, t, 18); },
      function (g, t) { sky(g, C.sky); ground(g); plot(g, 74, 14, 0.25, t); footing(g, 73); dust(g, t, 26, 10); },
      function (g, t) { sky(g, C.night); stars(g, 40); saturn(g, 124, 14); ground(g); dome(g, 40, 24, false); person(g, 78, GROUND - 6); dust(g, t, 8, 3); }
    ],
    research: [
      function (g, t) { sky(g, C.sky); ground(g); plant(g, 60, Math.max(0, 1 - t / 4), t); dust(g, t, 12); },
      function (g, t) { sky(g, C.sky); ground(g); lab(g, 58, t / 2.5, t); plot(g, 90, 18, 0.9, t); dust(g, t, 10); },
      function (g, t) { sky(g, C.night); stars(g, 40); saturn(g, 30, 16); ground(g); mast(g, 104, 34, 0, t); lab(g, 58, 1, t); person(g, 84, GROUND - 6); }
    ],
    transmit: [
      function (g, t) { sky(g, C.night); stars(g, 50); ground(g); dish(g, 70, true, t); },
      function (g, t) { sky(g, C.sky); ground(g); relay(g, 60, t < 2.5, t); relay(g, 100, true, t); dust(g, t, 14); },
      function (g, t) { sky(g, C.sky); ground(g); mast(g, 88, 58, 8 + Math.sin(t) * 0.6, t); dish(g, 40, Math.floor(t) % 4 === 0, t); dust(g, t, 18, 9); }
    ],
    export: [
      function (g, t) { sky(g, C.sky); ground(g); mast(g, 80, 58, Math.max(0, 8 - t * 1.5), t); for (var i = 0; i < 3; i++) { R(g, 79 + (i % 2 ? 3 : -3), GROUND - ((t * 8 + i * 15) % 48), 2, 2, C.amber); } },
      function (g, t) { sky(g, C.sky); ground(g); plant(g, 20, 1, t); tanker(g, 96, Math.max(-20, 46 - t * t * 3), t); },
      function (g, t) { sky(g, C.sky); ground(g); plot(g, 60, 30, Math.max(0, 0.8 - t / 4), t); meter(g, 64, 34, Math.max(0, 0.6 - t / 6), "BIO kW"); }
    ],
    "habitation-o2": [
      function (g, t) { sky(g, C.sky); ground(g); vent(g, 76, t, 0.9); meter(g, 24, 34, Math.min(1, 0.3 + t / 8), "O2"); },
      function (g, t) { sky(g, C.sky); ground(g); plot(g, 60, 30, Math.max(0, 0.9 - t / 3), t); vent(g, 110, t, 0.6); },
      function (g, t) { sky(g, C.sky); ground(g); dome(g, 56, 44, true); for (var i = 0; i < 4; i++) { person(g, 68 + i * 6, GROUND - 7, C.haze); } if (Math.floor(t * 3) % 11 === 0) { R(g, 100, GROUND - 3, 2, 2, C.white); } }
    ],
    "habitation-warm": [
      function (g, t) { sky(g, C.warm); haloWarm(g, t); ground(g); mast(g, 80, 58, 0, t); vent(g, 77, t, 0.5); },
      function (g, t) { sky(g, C.warm); ground(g); screen(g, 60, 28, t, t > 2); },
      function (g, t) { sky(g, C.warm); haloWarm(g, t); ground(g); plot(g, 74, 14, 0.5 * (0.5 + 0.5 * Math.sin(t)), t); footing(g, 73); marker(g, 96, t); }
    ]
  };

  S.scenes = {
    count: function (id) { return (SCENES[id] || []).length; },
    make: function (id, n) {
      var draw = (SCENES[id] || [])[n] || function (g) { sky(g, C.night); ground(g); };
      var svg = node("svg", { viewBox: "0 0 " + W + " " + H, "shape-rendering": "crispEdges", class: "scene", role: "img" });
      var g = node("g", {});
      svg.appendChild(g);
      var timer = null, t0 = 0;
      function frame() {
        var t = (Date.now() - t0) / 1000;
        while (g.firstChild) { g.removeChild(g.firstChild); }
        draw(g, t);
      }
      return {
        el: svg,
        start: function () {
          /* With reduced motion the still frame shows a moment three seconds
             in, when each panel has made its point */
          t0 = Date.now() - (S.reduced ? 3000 : 0); frame();
          if (!S.reduced) { timer = setInterval(frame, 160); }
        },
        stop: function () { clearInterval(timer); timer = null; }
      };
    }
  };
})();
