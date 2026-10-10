/* Ending scenes: animated pixel pictures drawn as SVG on a 160 by 90 grid, in
   the palette of the SV-4 live camera. Each ending has three panels built
   from shared pieces (sky, crater, tower, crane, lab, plant, dish, plots,
   people). S.scenes.make(id, n) returns { el, start, stop }; the moving parts
   redraw a few times a second, and the picture is still when motion is
   reduced. */
(function () {
  var S = window.SELK, NS = "http://www.w3.org/2000/svg", W = 160, H = 90, GROUND = 66;
  var C = {
    sky: ["#A88D5C", "#B89C69", "#C7AB78", "#D3B988"],
    /* Titan's haze hides Saturn and the stars from the surface; nights are
       dark haze */
    night: ["#2A221B", "#352A20", "#433426", "#52402D"],
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
  /* Deterministic noise, so dust and stars stay in place between frames */
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* Pieces */
  function sky(g, pal) {
    var band = Math.ceil(GROUND / 4);
    pal.forEach(function (c, i) { R(g, 0, i * band, W, band + 1, c); });
    /* A checker row between bands, as in the camera's dithering */
    for (var i = 1; i < 4; i++) {
      for (var x = 0; x < W; x += 2) { P(g, x + (i % 2), i * band - 1, pal[i - 1]); }
    }
  }
  /* Sand banked beside a structure. Callers place it outside the structure's
     footprint, so no mound covers a wall. */
  function drift(g, x, w, h) {
    for (var i = 0; i < w; i++) {
      var k = Math.round(h * Math.sin(Math.PI * i / w));
      if (k > 0) { R(g, x + i, GROUND - k, 1, k, C.rim); }
    }
  }
  function roofDust(g, x, y, w) { R(g, x, y, w, 1, C.haze, 0.45); }
  /* The far crater rim, between the sky and the ground */
  function ridge(g) {
    for (var x = 0; x < W; x++) {
      var h = Math.round(5 + 3 * Math.sin(x / 17 + 2) + 2 * Math.sin(x / 7));
      R(g, x, GROUND - h, 1, h, "#957A52", 0.8);
    }
  }
  function ground(g) {
    ridge(g);
    R(g, 0, GROUND, W, H - GROUND, C.ground);
    R(g, 0, GROUND, W, 1, C.rim);
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
  /* A connecting hallway: a ribbed tube along the ground, its lower half under sand */
  function corridor(g, x1, x2) {
    var a = Math.min(x1, x2), b = Math.max(x1, x2);
    R(g, a, GROUND - 4, b - a, 4, C.dark); R(g, a, GROUND - 4, b - a, 1, C.steel);
    for (var x = a + 2; x < b; x += 5) { R(g, x, GROUND - 4, 1, 3, C.rib); }
    R(g, a, GROUND - 2, b - a, 2, C.rim);
  }
  /* HALL-R: the low vault round the tower's foot, 21 pixels wide and 5
     high, a rib every third column from the axis, as WATCH and the site
     pictures draw it */
  function hallTop(i) { return Math.round(5 * Math.sqrt(Math.max(0, 1 - (i / 10.5) * (i / 10.5)))); }
  function hall(g, cx) {
    for (var i = -10; i <= 10; i++) {
      var h = hallTop(i);
      if (h > 0) { R(g, cx + i, GROUND - h + 1, 1, h, Math.abs(i) % 3 === 0 ? C.rib : C.dark); }
    }
    roofDust(g, cx - 4, GROUND - 4, 9);
  }
  /* A line of single pixels from (x0, y0) to (x1, y1) */
  function line(g, x0, y0, x1, y1, c, o) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (var i = 0; i <= n; i++) { P(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c, o); }
  }
  /* MAST-01 as its entries describe it, and as the site pictures draw it
     (tools/site-pictures.js): a printed ice shell, symmetric pixel for
     pixel, tapering in four even tiers from 9 pixels to 3 (18 m to 6 m), a
     tie band every third row, rising out of HALL-R; an outrigger on each
     side; three tight guy levels at 350, 700 and 1 050 m of the 1 180 m;
     the cables of level 4, tied off between the tower and the level 3 guy,
     hanging in a loop; the AMBER vent on the built top with the beacon.
     The cables and the outriggers keep the proportions of the design sheet
     (tools/design-drawings.js, the tower 29 pixels tall there): anchors
     22, 29 and 36 out, the outrigger beam 10 up with its legs 18 out, the
     loop tied 10 out and sagging 5. The anchors and the footings sit on
     the ground behind the hallways, which a scene draws after the tower,
     so the cables and the legs end out of sight. h pixels stand, leaning
     by lean pixels at the top; full is the height of the whole tower, h
     by default, so a tower being cut keeps its guys only below its top.
     crane draws CRANE-L parked and stowed on the west face, or, as a
     number, lowered that many pixels down it into HALL-R. cut, for a
     tower being taken down, holds guys, how far each level is released (0
     tight, 1 gone), and vent and arms, false once the vent or the
     outriggers are off (the footings stay, out of sight behind the
     hallways). The tower seen through the shelter window (shelter) is too
     far for its cables to show. */
  function towerEdge(x, y, full, side) { return Math.round(x) + side * (4 - Math.min(3, Math.floor(4 * y / full))); }
  function mast(g, x, h, lean, t, light, full, crane, cut) {
    full = full || h;
    var freed = function (n) { return cut && cut.guys ? cut.guys[n] : 0; };
    var k = full / 29, axis = function (y) { return x + lean * y / h; };
    var edge = function (y, side) { return towerEdge(axis(y), y, full, side); };
    var levels = [350, 700, 1050].map(function (m) { return Math.round(full * m / 1180); });
    var anchors = [22, 29, 36].map(function (a) { return Math.round(a * k); });
    [-1, 1].forEach(function (side) {
      levels.forEach(function (y, n) {
        var p = freed(n), ax = x + side * anchors[n];
        if (y >= h - 1 || p >= 1) { return; }
        if (!p) { line(g, edge(y, side) + side, GROUND - y, ax, GROUND - 1, C.steel); return; }
        /* Released: the cable slackens, then its end comes down the face */
        var up = p < 0.4 ? y : Math.round(y * (1 - (p - 0.4) / 0.6));
        var sag = (p < 0.4 ? p / 0.4 : (1 - p) / 0.6) * y * 0.3;
        var x0 = edge(up, side) + side, y0 = GROUND - up, qx = x0, qy = y0;
        for (var j = 1; j <= 12; j++) {
          var f = j / 12, nx = Math.round(x0 + (ax - x0) * f), ny = Math.min(GROUND - 1, Math.round(y0 + (GROUND - 1 - y0) * f + sag * Math.sin(Math.PI * f)));
          line(g, qx, qy, nx, ny, C.steel); qx = nx; qy = ny;
        }
      });
      if (levels[2] < h - 1 && !freed(2)) {
        var y3 = levels[2], x0 = edge(y3, side) + side, out = Math.round(10 * k), yTie = (GROUND - y3) + y3 * out / Math.abs(x + side * anchors[2] - x0);
        var px0 = x0, py0 = GROUND - y3;
        for (var i = 1; i <= 16; i++) {
          var s = i / 16, px1 = x0 + side * Math.round(out * s), py1 = Math.round((GROUND - y3) + (yTie - (GROUND - y3)) * s + 5 * k * Math.sin(Math.PI * s));
          line(g, px0, py0, px1, py1, C.steel); px0 = px1; py0 = py1;
        }
      }
      var by = Math.round(10 * k), lx = x + side * Math.round(18 * k);
      if (!(cut && cut.arms === false)) {
        line(g, edge(by, side), GROUND - by, lx, GROUND - by, C.dark); line(g, lx, GROUND - by, lx, GROUND - 1, C.dark);
        R(g, lx - 2, GROUND - 1, 5, 1, C.steel);
      }
    });
    for (var y = 0; y < h; y++) {
      var l = edge(y, -1), r = edge(y, 1);
      R(g, l, GROUND - y, r - l + 1, 1, y % 3 === 1 ? C.rib : C.dark);
    }
    /* The vent and the beacon stand on the top; a tower being cut has
       lost them */
    var tx = Math.round(axis(h - 1));
    if (h >= full && !(cut && cut.vent === false)) {
      R(g, tx, GROUND - h - 2, 1, 3, C.steel);
      if (light !== false && Math.floor(t * 1.5) % 2 === 0) { R(g, tx, GROUND - h - 3, 1, 1, C.red); }
    }
    /* CRANE-L stowed as in the site pictures: a body 3 pixels by 4, its jib
       folded flat beside it, just above the level 2 guys, inside the
       third tier */
    if (crane === true || typeof crane === "number") {
      var cb = levels[1] + 1 - (crane === true ? 0 : crane), cl = edge(cb, -1);
      if (cb + 4 < h && cb >= 0) {
        R(g, cl - 3, GROUND - cb - 3, 3, 4, C.steel); P(g, cl - 2, GROUND - cb - 2, C.amber);
        R(g, cl - 4, GROUND - cb - 3, 1, 4, C.dark);
      }
    }
    hall(g, x);
  }
  /* FOOTING-B: the concrete footing of the east outrigger, with a stub of the arm */
  function footing(g, x) {
    R(g, x, GROUND - 5, 16, 6, C.steel); R(g, x, GROUND - 5, 16, 1, C.haze, 0.4);
    R(g, x + 2, GROUND - 9, 3, 4, C.rib);
    drift(g, x + 16, 8, 2); drift(g, x - 8, 8, 2);
  }
  /* A test plot: a roped square of ground with sample probes. The cells are
     microscopic and live in the soil, so only the probe lights show them. */
  function plot(g, x, w, level, t) {
    R(g, x - 1, GROUND + 2, w + 2, 4, C.ground2);
    for (var i = 0; i <= w; i += Math.max(4, Math.floor(w / 3))) { R(g, x + i - 1, GROUND - 3, 1, 5, C.steel); }
    R(g, x - 1, GROUND - 2, w + 2, 1, C.haze, 0.4);
    for (var j = 0; j < 3; j++) {
      var px = x + 2 + j * Math.floor((w - 4) / 2), on = level > j * 0.3;
      R(g, px, GROUND - 1, 1, 3, C.rib);
      R(g, px, GROUND - 2, 1, 1, on ? C.glow : C.dark, on ? 0.55 + 0.45 * Math.sin(t * 3 + j) : 1);
    }
  }
  /* A sign on a post: the plot number, where the plot itself is covered */
  function sign(g, x, text) {
    R(g, x, GROUND - 12, 1, 12, C.steel); R(g, x - 4, GROUND - 16, 11, 6, C.haze, 0.85);
    var n = node("text", { x: x - 3, y: GROUND - 11.5, fill: C.dark, "font-size": 4.5, "font-family": "monospace" });
    n.textContent = text; g.appendChild(n);
  }
  function lab(g, x, lit, t) {
    R(g, x, GROUND - 9, 22, 10, C.dark); R(g, x + 2, GROUND - 11, 18, 2, C.rib);
    for (var i = 0; i < 5; i++) {
      var on = lit > 0 && (lit >= 1 || t * 2 > i);
      R(g, x + 2 + i * 4, GROUND - 7, 2, 2, on ? C.amber : C.rib);
    }
    R(g, x + 9, GROUND - 3, 3, 3, lit > 0 ? C.haze : C.rib);
    roofDust(g, x + 2, GROUND - 12, 18); drift(g, x - 8, 8, 3); drift(g, x + 22, 8, 3);
  }
  function plant(g, x, plume, t) {
    R(g, x, GROUND - 10, 24, 11, C.dark); R(g, x + 17, GROUND - 22, 3, 12, C.rib);
    R(g, x + 3, GROUND - 7, 4, 2, C.amber, 0.8);
    roofDust(g, x, GROUND - 11, 17); drift(g, x - 9, 9, 4); drift(g, x + 24, 9, 3);
    for (var i = 0; i < 14; i++) {
      var age = (t * 0.8 + i / 14) % 1, py = GROUND - 23 - age * 26;
      if (rnd(i) < plume) { R(g, x + 17 + Math.sin(i + t) * 2 + age * 6, py, 2 + age * 3, 1, C.haze, (1 - age) * 0.7 * plume); }
    }
  }
  /* The relay dish: base plate, pedestal and yoke, a bowl tilted towards the
     beam, and a feed arm on the bowl's axis. Each part touches the next, and
     the beam leaves the feed along the same axis. */
  function dish(g, x, beam, t) {
    var slope = 0.3, base = GROUND - 15;
    R(g, x - 4, GROUND - 2, 9, 2, C.dark);
    R(g, x - 1, GROUND - 12, 3, 10, C.steel);
    R(g, x - 3, GROUND - 14, 7, 2, C.rib);
    for (var j = 0; j < 5; j++) {
      var w = 3 + 2 * j, cx = x + Math.round(j * slope);
      R(g, cx - (w - 1) / 2, base - j, w, 1, j === 0 ? C.steel : (j === 4 ? C.white : C.haze));
    }
    for (var k = 0; k < 5; k++) { P(g, x + Math.round((5 + k) * slope), base - 5 - k, C.rib); }
    var fx = x + Math.round(10 * slope), fy = base - 11;
    R(g, fx - 1, fy, 2, 2, C.steel);
    for (var n = 0; n < 5 && beam; n++) {
      var d = (t * 20 + n * 11) % 50;
      R(g, fx - 1 + Math.round(d * slope), fy - 3 - d, 2, 3, C.amber, 0.9);
    }
  }
  /* A habitat dome whose crew is seen through its lit windows */
  function habitat(g, x, w, t) {
    for (var i = 0; i < w; i++) {
      var hh = Math.round(Math.sqrt(1 - Math.pow((i - w / 2) / (w / 2), 2)) * w * 0.45);
      R(g, x + i, GROUND - hh, 1, hh, C.dark);
    }
    for (var k = 0; k < 4; k++) {
      var wx = Math.round(x + 8 + k * ((w - 16) / 3));
      R(g, wx - 2, GROUND - 9, 5, 4, C.amber, 0.85);
      R(g, wx, GROUND - 8 + (Math.floor(t + k) % 3 === 0 ? 0 : 1), 1, 3, C.dark);
    }
    drift(g, x - 8, 8, 3); drift(g, x + w, 8, 3);
  }
  function tanker(g, x, y, t) {
    R(g, x, y, 5, 14, C.haze); R(g, x + 1, y - 3, 3, 3, C.haze); R(g, x, y + 5, 5, 2, C.lamp);
    for (var i = 0; i < 6; i++) { R(g, x + 1 + rnd(i + Math.floor(t * 8)) * 3, y + 14 + i * 2, 2, 2, i < 2 ? C.white : C.amber, 1 - i / 6); }
  }
  /* A gas release rising from (x, y): oxygen near the ground, or hydrogen at the mast top */
  function plume(g, x, y, t, level) {
    for (var i = 0; i < 10; i++) {
      var age = (t * 0.6 + i / 10) % 1;
      R(g, x + Math.sin(i * 2 + t) * 2, y - age * 26, 3, 1, C.white, (1 - age) * level);
    }
  }
  function vent(g, x, t, level) {
    R(g, x, GROUND - 4, 5, 5, C.steel); drift(g, x + 5, 6, 2);
    plume(g, x + 1, GROUND - 6, t, level);
  }
  function haloWarm(g, t) {
    for (var y = 0; y < 30; y += 2) { R(g, 0, y, W, 2, C.amber, 0.05 + 0.03 * Math.sin(t + y / 6)); }
  }
  /* A close-up of the shelter terminal's amber screen, for readings */
  function termScreen(g, t, kind) {
    R(g, 0, 0, W, H, "#B8AA86"); R(g, 12, 6, 136, 74, "#8C7F62"); R(g, 14, 8, 132, 70, "#141814");
    for (var y = 9; y < 78; y += 2) { R(g, 14, y, 132, 1, "#1B211B"); }
    function txt(x, y, text, o) {
      var n = node("text", { x: x, y: y, fill: C.amber, "font-size": 6, "font-family": "monospace", opacity: o == null ? 1 : o });
      n.textContent = text; g.appendChild(n);
    }
    var reveal = Math.min(1, t / 3);
    if (kind === "relay") {
      txt(20, 18, "RELAY-LIST");
      ["R-02", "R-05", "R-09", "R-11"].forEach(function (r, i) { txt(20, 30 + i * 9, r + "  OK"); });
      var off = t > 1.5;
      txt(20, 66, "R-14  " + (off ? (S.t ? S.t("DISCONNECTED") : "DISCONNECTED") : "OK"), off && Math.floor(t * 2) % 2 ? 0.45 : 1);
      return;
    }
    var title = { bio: "BIO CELLS kW", o2: "O2 NEAR VENT %", gate: "GATE, ZONE 14" }[kind];
    txt(20, 18, S.t ? S.t(title) : title);
    R(g, 24, 26, 1, 44, C.amber, 0.5); R(g, 24, 70, 112, 1, C.amber, 0.5);
    for (var x = 0; x < 110 * reveal; x++) {
      var v = kind === "bio" ? 0.8 * Math.max(0, 1 - x / 80) : kind === "o2" ? 0.12 + 0.7 * x / 110 : 0;
      R(g, 26 + x, 68 - v * 40, 1, 1, C.amber);
    }
    if (kind === "gate") { txt(90, 40, (S.t ? S.t("FLAGS") : "FLAGS") + ": 0", 0.9); }
    if (Math.floor(t * 2) % 2 === 0) { R(g, 26 + 110 * reveal, 73, 3, 1, C.amber); }
  }
  /* The shelter: the supervisor at the old terminal, seen from behind, with
     the dusty site through a porthole. view: what stands outside. */
  function shelter(g, t, view) {
    view = view || {};
    R(g, 0, 0, W, H, "#211D19");
    for (var y = 0; y < H; y += 9) { R(g, 0, y, W, 1, "#2A2520"); }
    var cx = 38, cy = 34, r = 21;
    for (var dy = -r; dy <= r; dy++) {
      var hw = Math.round(Math.sqrt(r * r - dy * dy)), yy = cy + dy;
      var col = yy < cy + 5 ? C.warm[Math.min(3, Math.max(0, Math.floor((yy - cy + r) / 7)))] : C.ground;
      R(g, cx - hw, yy, hw * 2, 1, col);
    }
    for (var i = 0; i < 18; i++) {
      var px = cx - r + ((rnd(i) * 42 + t * 9 * (0.6 + rnd(i + 4))) % 42), py = cy - 8 + rnd(i + 2) * 18;
      if (Math.pow(px - cx, 2) + Math.pow(py - cy, 2) < (r - 1) * (r - 1)) { P(g, px, py, C.haze, 0.5); }
    }
    if (view.mast !== false) {
      /* The tower in the window, far off: the shell narrowing from three
         pixels to one, the vent and the beacon on top, inside the frame at
         any lean */
      var lean = view.lean || 0, tx = cx + 6, ty = cy + 4, inside = function (px, py) { return Math.pow(px - cx, 2) + Math.pow(py - cy, 2) < (r - 2) * (r - 2); };
      for (var m = 0; m < 24; m++) {
        var mx = Math.round(cx + 6 + lean * m / 26), my = cy + 4 - m;
        var mw = m < 8 ? 3 : m < 17 ? 2 : 1, ml = mx - (mw >> 1);
        if (!inside(ml + mw - 1, my - 3)) { break; }
        R(g, ml, my, mw, 1, m % 3 === 1 && mw > 1 ? C.rib : C.dark);
        tx = mx; ty = my;
      }
      P(g, tx, ty - 1, C.steel);
      if (Math.floor(t * 1.5) % 2 === 0) { P(g, tx, ty - 2, C.red); }
    }
    if (view.lab) { R(g, cx - 14, cy + 1, 9, 4, C.dark); R(g, cx - 13, cy + 2, 7, 1, C.amber); }
    R(g, cx - 12, cy + 4, 24, 2, C.rim);
    for (var a = 0; a < 64; a++) {
      var ang = a / 64 * Math.PI * 2;
      R(g, cx + Math.cos(ang) * (r + 1) - 1, cy + Math.sin(ang) * (r + 1) - 1, 3, 3, C.steel);
    }
    R(g, 66, 64, 90, 4, "#3A342C"); R(g, 70, 68, 3, 22, "#2E2923"); R(g, 148, 68, 3, 22, "#2E2923");
    R(g, 104, 36, 34, 28, "#B8AA86"); R(g, 106, 38, 30, 22, "#1B1F1A");
    var glow = 0.75 + 0.2 * Math.sin(t * 7);
    for (var ln = 0; ln < 5; ln++) { R(g, 109, 41 + ln * 4, 10 + rnd(ln) * 14, 1, C.amber, glow); }
    if (Math.floor(t * 2) % 2 === 0) { R(g, 109, 57, 3, 1, C.amber); }
    R(g, 100, 60, 42, 3, "#8C7F62"); R(g, 108, 62, 26, 2, "#6E6450");
    /* The supervisor, seen from behind in a chair, below the screen's middle */
    R(g, 110, 66, 30, 24, "#2E2923"); R(g, 110, 66, 30, 1, C.steel);
    R(g, 123, 51, 6, 7, "#0F0D0B"); R(g, 122, 52, 8, 5, "#0F0D0B");
    R(g, 117, 58, 18, 3, "#0F0D0B"); R(g, 115, 61, 22, 12, "#0F0D0B");
  }
  /* The site from above, north up: buildings joined by hallways, half under
     sand, with zone 14 drawn around the tower. Labels sit above their
     feature, apart from other labels, with a halo in the sand colour. */
  function siteMap(g, t) {
    R(g, 0, 0, W, H, C.sky[1]);
    for (var i = 0; i < 380; i++) { P(g, rnd(i) * W, rnd(i + 300) * H, i % 3 ? C.sky[0] : C.sky[2], 0.55); }
    for (var x = 0; x < W; x += 16) { R(g, x, 0, 1, H, C.rib, 0.15); }
    for (var y = 0; y < H; y += 16) { R(g, 0, y, W, 1, C.rib, 0.15); }
    function label(tx, ty, text) {
      var n = node("text", { x: tx, y: ty, fill: C.dark, "font-size": 4, "font-family": "monospace",
        stroke: C.sky[2], "stroke-width": 1.4, "paint-order": "stroke", class: "map-label" });
      n.textContent = text; g.appendChild(n);
    }
    /* Hallways first, so buildings sit on their ends */
    function hallway(pts) {
      for (var k = 0; k < pts.length - 1; k++) {
        var a = pts[k], b = pts[k + 1];
        var x0 = Math.min(a[0], b[0]) - 1, y0 = Math.min(a[1], b[1]) - 1;
        R(g, x0, y0, Math.abs(b[0] - a[0]) + 3, Math.abs(b[1] - a[1]) + 3, C.steel);
        R(g, x0 + 1, y0 + 1, Math.abs(b[0] - a[0]) + 1, Math.abs(b[1] - a[1]) + 1, C.dark);
      }
    }
    hallway([[48, 76], [48, 64], [76, 64], [76, 48]]);
    hallway([[26, 50], [67, 50], [67, 45]]);
    hallway([[85, 44], [85, 52], [126, 52]]);
    /* Zone 14, dashed all round */
    g.appendChild(node("rect", { x: 54.5, y: 20.5, width: 58, height: 40, fill: "none", stroke: C.red,
      "stroke-width": 1, "stroke-dasharray": "2 2" }));
    label(55, 18, S.t ? S.t("ZONE 14") : "ZONE 14");
    /* MAST-01 in the ring of HALL-R, the outrigger to FOOTING-B over plot 9 */
    for (var k2 = 0; k2 < 20; k2++) {
      var ang = k2 / 20 * Math.PI * 2; R(g, 76 + Math.cos(ang) * 9, 38 + Math.sin(ang) * 9, 2, 2, C.rib);
    }
    R(g, 74, 36, 6, 6, C.dark); P(g, 76, 38, Math.floor(t * 1.5) % 2 ? C.red : C.dark);
    label(58, 27, "MAST-01");
    R(g, 85, 38, 11, 1, C.steel);
    R(g, 95, 36, 12, 12, C.ground2, 0.8); P(g, 97, 46, C.glow, 0.5 + 0.5 * Math.sin(t * 2));
    R(g, 96, 35, 10, 6, C.steel);
    label(89, 32, "FOOTING-B");
    /* EX-1 east of the zone, its intake to the north and the frost beyond */
    R(g, 120, 44, 14, 10, C.dark); roofDust(g, 120, 44, 14);
    label(120, 60, "EX-1");
    R(g, 126, 18, 2, 26, C.steel); R(g, 123, 14, 8, 4, C.dark);
    R(g, 108, 4, 34, 7, C.white, 0.75);
    label(144, 10, S.t ? S.t("FROST") : "FROST");
    /* West: the lab, its dish and the plots; south: the shelter */
    R(g, 12, 45, 14, 9, C.dark); roofDust(g, 12, 45, 14);
    label(12, 43, "LAB");
    R(g, 12, 12, 7, 7, C.haze); R(g, 14, 14, 3, 3, C.steel);
    for (var c = 20; c < 44; c += 3) { P(g, 15, c, C.steel); }
    label(21, 16, "R-09");
    [[16, 62, "1"], [24, 62, "3"], [32, 62, "6"]].forEach(function (pp, j) {
      R(g, pp[0], pp[1], 6, 6, C.ground2); P(g, pp[0] + 2, pp[1] + 2, C.glow, 0.5 + 0.5 * Math.sin(t * 2 + j));
    });
    label(15, 75, S.t ? S.t("PLOTS") : "PLOTS");
    R(g, 43, 74, 10, 7, C.dark); if (Math.floor(t * 2) % 2 === 0) { R(g, 47, 76, 2, 2, C.amber); }
    label(55, 80, S.t ? S.t("SHELTER") : "SHELTER");
    /* Sand across the hallways, never over a label */
    [[34, 48, 10, 5], [60, 62, 10, 5], [102, 50, 12, 5], [124, 26, 6, 8]].forEach(function (d) {
      R(g, d[0], d[1], d[2], d[3], C.sky[2], 0.8);
    });
  }

  /* The dismantling of MAST-01 in steps (the dismantle ending): the vent,
     then for each segment from the top down to 200 m (10 pixels) the
     release of any guy level or outrigger beam inside it and the cut.
     dismantling(t) gives the tower's height, the crane's drop, how far
     each guy level is released, whether the vent and the outriggers stand,
     the blocks piled and the step under way (step, its progress p). The
     crane comes down first, in 2.4 s. */
  var FALL = (function () {
    var steps = [{ kind: "vent", d: 0.8 }], h = 58, gone = [false, false, false], arms = true;
    var levels = [350, 700, 1050].map(function (m) { return Math.round(58 * m / 1180); });
    while (h > 10) {
      levels.forEach(function (y, n) { if (!gone[n] && y >= h - 3) { steps.push({ kind: "guys", n: n, d: 0.8 }); gone[n] = true; } });
      if (arms && 20 >= h - 3) { steps.push({ kind: "arms", d: 0.8 }); arms = false; }
      steps.push({ kind: "cut", d: 0.5 }); h -= 3;
    }
    return steps;
  })();
  function dismantling(t) {
    var lower = 2.4, st = { h: 58, crane: t < lower ? Math.round(35 * t / lower) : false, guys: [0, 0, 0], vent: true, arms: true, pile: 0, step: null, p: 0, carry: null, done: false };
    var at = lower;
    for (var i = 0; i < FALL.length && t >= at; i++) {
      var s = FALL[i], p = Math.min(1, (t - at) / s.d);
      if (p < 1) { st.step = s; st.p = p; }
      if (s.kind === "vent" && p >= 1) { st.vent = false; }
      if (s.kind === "arms" && p >= 1) { st.arms = false; }
      if (s.kind === "guys") { st.guys[s.n] = p; }
      if (s.kind === "cut" && p >= 1) { st.h -= 3; st.pile++; }
      at += s.d;
    }
    if (t >= lower) { st.carry = t - lower; }
    st.done = t >= at;
    return st;
  }
  /* Panels. Each draws the whole picture for time t (seconds). */
  var SCENES = {
    intro: [
      function (g, t) { shelter(g, t, {}); },
      function (g, t) { siteMap(g, t); }
    ],
    dismantle: [
      function (g, t) {
        /* As the decision log has it: the units lower CRANE-L down the
           west face into HALL-R, cut the vent off the top, then take the
           tower down to 200 m a segment at a time, tie band to tie band.
           A guy level is released before the cut reaches it. Two units cut,
           two carry the blocks down the east face, and the blocks pile up
           in front of the east hallway. */
        var st = dismantling(t), top = GROUND - st.h + 1, blink = Math.floor(t * 8) % 2 === 0;
        var west = function (y) { return towerEdge(80, y, 58, -1); }, east = function (y) { return towerEdge(80, y, 58, 1); };
        sky(g, C.sky); ground(g);
        mast(g, 80, st.h, 0, t, false, 58, st.crane, st);
        corridor(g, 0, 65); corridor(g, 95, 160);
        /* The pile on the ground in front of the east hallway: rows of 6,
           5, 4 and 1 blocks */
        for (var b = 0, row = 0, k = 0; b < st.pile; b++, k++) {
          if (k === 6 - row) { row++; k = 0; }
          R(g, 98 + 2 * row + 3 * k, GROUND + 7 - 2 * row, 3, 2, C.dark); R(g, 98 + 2 * row + 3 * k, GROUND + 7 - 2 * row, 3, 1, C.rib);
        }
        /* A unit rides down above the crane until both are inside the hall */
        if (typeof st.crane === "number" && 35 - st.crane > 6) {
          var cb = 35 - st.crane; R(g, west(cb) - 2, GROUND - cb - 5, 2, 2, C.amber);
        }
        /* The two cut units: on the top beside the vent, on both faces at a
           guy level or the outrigger beams, or on both faces at the cut,
           with its sparks */
        var s = st.step, cy = null;
        if (s && s.kind === "guys") { cy = [17, 34, 52][s.n]; }
        if (s && s.kind === "arms") { cy = 20; }
        if (s && s.kind === "cut") { cy = st.h - 3; }
        if (cy === null) {
          R(g, 78, top - 2, 2, 2, C.amber); R(g, 81, top - 2, 2, 2, C.amber);
          if (s && s.kind === "vent" && blink) { P(g, 80, top - 1, C.white); }
        } else {
          R(g, west(cy) - 2, GROUND - cy - 1, 2, 2, C.amber); R(g, east(cy) + 1, GROUND - cy - 1, 2, 2, C.amber);
          if (blink && (s.kind === "cut" || st.p < 0.4)) {
            if (s.kind === "cut") { for (var sx = west(cy); sx <= east(cy); sx += 2) { P(g, sx + (Math.floor(t * 8) % 2), GROUND - cy, C.white); } }
            else { P(g, west(cy) - 1, GROUND - cy, C.white); P(g, east(cy) + 1, GROUND - cy, C.white); }
          }
        }
        /* The two carriers, from the hall roof to the cut and back, one
           down with a block while the other climbs; when done they stand
           side by side on the hall roof */
        var roof = function (x) { return hallTop(x - 80); };
        if (st.carry !== null) {
          for (var i = 0; i < 2; i++) {
            if (st.done) { var px = east(5) + 1 + 3 * i; R(g, px, GROUND - roof(px) - 1, 2, 2, C.amber); continue; }
            var ph = (st.carry / 1.6 + i * 0.5) % 1, span = st.h - 4 - 5;
            var yUp = Math.round(5 + span * (ph < 0.5 ? 1 - 2 * ph : 2 * ph - 1)), ce = east(yUp), y = GROUND - yUp;
            R(g, ce + 1, y - 1, 2, 2, C.amber);
            if (ph < 0.5) { R(g, ce + 3, y, 3, 2, C.dark); R(g, ce + 3, y, 3, 1, C.rib); }
          }
        }
        dust(g, t, 16);
      },
      function (g, t) {
        sky(g, C.sky); ground(g); corridor(g, 0, 48);
        R(g, 56, GROUND - 3, 30, 3, C.rib); footing(g, 96); sign(g, 120, "9");
        dust(g, t, 26, 10);
      },
      function (g, t) { shelter(g, t, { mast: false }); }
    ],
    research: [
      function (g, t) { sky(g, C.sky); ground(g); corridor(g, 0, 60); plant(g, 60, Math.max(0, 1 - t / 4), t); corridor(g, 93, 160); dust(g, t, 12); },
      function (g, t) { sky(g, C.sky); ground(g); corridor(g, 0, 50); lab(g, 58, t / 2.5, t); plot(g, 100, 18, 0.9, t); dust(g, t, 10); },
      function (g, t) { shelter(g, t, { lab: true }); }
    ],
    transmit: [
      function (g, t) { sky(g, C.night); ground(g); corridor(g, 0, 60); dish(g, 70, true, t); corridor(g, 80, 160); dust(g, t, 10, 4); },
      function (g, t) { termScreen(g, t, "relay"); },
      function (g, t) { shelter(g, t, { lean: 5 }); }
    ],
    export: [
      function (g, t) {
        sky(g, C.sky); ground(g); mast(g, 80, 58, Math.max(0, 8 - t * 1.5), t, true, 58, true); corridor(g, 0, 65); corridor(g, 95, 160);
        /* The units climb the tower's faces as it straightens */
        var lean = Math.max(0, 8 - t * 1.5);
        for (var i = 0; i < 3; i++) {
          var yUp = 10 + ((t * 8 + i * 15) % 44), side = i % 2 ? 1 : -1, ex = towerEdge(80 + lean * yUp / 58, yUp, 58, side);
          R(g, side > 0 ? ex + 1 : ex - 2, GROUND - yUp - 1, 2, 2, C.amber);
        }
      },
      function (g, t) { sky(g, C.sky); ground(g); corridor(g, 0, 11); plant(g, 20, 1, t); corridor(g, 53, 84); tanker(g, 110, Math.max(-20, 46 - t * t * 3), t); },
      function (g, t) { termScreen(g, t, "bio"); }
    ],
    "habitation-o2": [
      function (g, t) { termScreen(g, t, "o2"); },
      function (g, t) { sky(g, C.sky); ground(g); corridor(g, 0, 50); plot(g, 60, 30, Math.max(0, 0.9 - t / 3), t); vent(g, 112, t, 0.6); dust(g, t, 10); },
      function (g, t) { sky(g, C.sky); ground(g); corridor(g, 0, 44); habitat(g, 52, 52, t); corridor(g, 112, 160); dust(g, t, 10); }
    ],
    "habitation-warm": [
      function (g, t) { sky(g, C.warm); haloWarm(g, t); ground(g); mast(g, 80, 58, 0, t, true, 58, true); corridor(g, 0, 65); corridor(g, 95, 160); plume(g, 79, GROUND - 61, t, 0.55); },
      function (g, t) { termScreen(g, t, "gate"); },
      function (g, t) { sky(g, C.warm); haloWarm(g, t); ground(g); corridor(g, 0, 48); R(g, 56, GROUND - 3, 30, 3, C.rib); footing(g, 96); sign(g, 120, "9?"); }
    ]
  };

  /* Text alternatives: what each picture shows, for screen readers and the
     notes gallery. Translated through S.t. */
  var DESCRIBE = {
    intro: [
      "The supervisor sits at an old terminal in the site shelter. Through a round window: the dusty site and the tower.",
      "Map of the site from above. Zone 14 is marked around MAST-01, its hall and FOOTING-B over plot 9. Hallways link the shelter, the hall, the lab and the EX-1 plant. EX-1 lies east of the zone, with its intake and the frost field to the north. Sand covers parts of the hallways."
    ],
    dismantle: [
      "Units lower the climbing crane down the tower into the hall and cut the vent off the top. Then they release the guy cables level by level and take the tower down block by block. The blocks pile up beside the hall.",
      "The tower is gone and a strip of debris lies where it stood. FOOTING-B remains, with a sign for plot 9 beside it.",
      "The supervisor at the terminal in the shelter. Through the window: the site without its tower."
    ],
    research: [
      "The EX-1 plant. Its plume of gas thins and stops.",
      "The lab, its windows lighting up one by one. Beside it, a roped test plot whose sample probes glow green.",
      "The supervisor at the terminal in the shelter. Through the window: the lit lab."
    ],
    transmit: [
      "At night, the dish sends pulses of light up toward the relay.",
      "The terminal screen shows the relay list. R-02, R-05, R-09 and R-11 are OK. R-14 changes to disconnected.",
      "The supervisor at the terminal in the shelter. Through the window: the leaning tower."
    ],
    export: [
      "Assembly units climb the leaning tower and repair it until it stands straight.",
      "The EX-1 plant releases its plume. A tanker lifts off beside it.",
      "The terminal screen shows a chart of the bio cells' power falling to zero."
    ],
    "habitation-o2": [
      "The terminal screen shows a chart of oxygen near the vent rising.",
      "A roped test plot whose probe lights go dark one by one. A vent releases gas nearby.",
      "A habitat dome with four lit windows and people inside. A hallway leads to it."
    ],
    "habitation-warm": [
      "Under an orange haze, gas rises from the top of the tower.",
      "The terminal screen shows the gate for zone 14: a flat line and zero flags.",
      "FOOTING-B under the orange haze, with a sign for plot 9 and a question mark."
    ]
  };
  function describe(id, n) {
    var d = (DESCRIBE[id] || [])[n] || "";
    return d && S.t ? S.t(d) : d;
  }
  S.scenes = {
    describe: describe,
    count: function (id) { return (SCENES[id] || []).length; },
    make: function (id, n) {
      var draw = (SCENES[id] || [])[n] || function (g) { sky(g, C.night); ground(g); };
      var svg = node("svg", { viewBox: "0 0 " + W + " " + H, "shape-rendering": "crispEdges", class: "scene", role: "img", "aria-label": describe(id, n) });
      var g = node("g", { "aria-hidden": "true" });
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
          /* With reduced motion the still frame shows the moment three
             seconds in */
          t0 = Date.now() - (S.reduced ? 3000 : 0); frame();
          if (!S.reduced) { timer = setInterval(frame, 160); }
        },
        stop: function () { clearInterval(timer); timer = null; }
      };
    }
  };
})();
