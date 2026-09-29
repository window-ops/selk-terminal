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
    /* Titan's haze hides Saturn and the stars from the surface; nights are dark haze */
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
  /* HALL-R: the low vaulted hall round the tower's foot, with its ribs */
  function hall(g, cx, w) {
    var x0 = Math.round(cx - w / 2);
    for (var i = 0; i < w; i++) {
      var h = Math.round(8 * Math.sqrt(Math.max(0, 1 - Math.pow((i - w / 2) / (w / 2), 2))));
      if (h > 0) { R(g, x0 + i, GROUND - h, 1, h, i % 3 === 0 ? C.rib : C.dark); }
    }
    roofDust(g, x0 + 4, GROUND - 8, w - 8);
  }
  /* MAST-01: h pixels of lattice, leaning by lean pixels at the top, rising out of HALL-R */
  function mast(g, x, h, lean, t, light) {
    for (var y = 0; y < h; y++) {
      var f = y / h, cx = x + lean * f, w = Math.max(2, Math.round(8 - 6 * f)), left = Math.round(cx - w / 2);
      P(g, left, GROUND - y, C.dark); P(g, left + w - 1, GROUND - y, C.dark);
      if (y % 5 === 0) { R(g, left, GROUND - y, w, 1, C.rib); }
      else if (w > 3) { P(g, left + 1 + ((y % 5) * (w - 2) / 5 | 0), GROUND - y, C.steel); }
    }
    if (light !== false && Math.floor(t * 1.5) % 2 === 0) { R(g, x + lean - 1, GROUND - h - 2, 2, 2, C.red); }
    hall(g, x, 22);
  }
  /* FOOTING-B: the concrete footing of the east outrigger, with a stub of the arm */
  function footing(g, x) {
    R(g, x, GROUND - 5, 16, 6, C.steel); R(g, x, GROUND - 5, 16, 1, C.haze, 0.4);
    R(g, x + 2, GROUND - 9, 3, 4, C.rib);
    drift(g, x + 16, 8, 2); drift(g, x - 8, 8, 2);
  }
  /* A test plot: a roped square of ground with sample probes. The cells are
     microscopic and live in the soil, so only the probes' lights show them. */
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
  function dish(g, x, beam, t) {
    R(g, x - 1, GROUND - 10, 3, 10, C.steel); R(g, x - 4, GROUND - 2, 9, 2, C.dark);
    for (var i = 0; i < 9; i++) { R(g, x - 8 + i, GROUND - 16 - Math.round(Math.abs(i - 4) * 0.8), 9 - Math.abs(i - 4), 1, C.haze); }
    R(g, x - 1, GROUND - 21, 2, 3, C.steel);
    for (var k = 0; k < 5 && beam; k++) {
      var y = GROUND - 22 - ((t * 20 + k * 11) % 50);
      R(g, x + (GROUND - 22 - y) * 0.3, y, 2, 3, C.amber, 0.9);
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
      /* The tower in the window: a slight bulge above the foot, tapering to a
         crossbar and a beacon, kept inside the frame at any lean */
      var lean = view.lean || 0, tx = cx + 6, ty = cy + 4;
      for (var m = 0; m < 26; m++) {
        var mx = Math.round(cx + 6 + lean * m / 26), my = cy + 4 - m;
        var mw = m < 2 ? 2 : m < 9 ? 3 : m < 16 ? 2 : 1, ml = mx - (mw >> 1);
        if (Math.pow(ml + mw - 1 - cx, 2) + Math.pow(my - cy, 2) > (r - 4) * (r - 4)) { break; }
        R(g, ml, my, mw, 1, C.dark);
        if (mw === 3 && m % 3 === 1) { P(g, ml + 1, my, C.steel); }
        tx = mx; ty = my;
      }
      R(g, tx - 1, ty, 3, 1, C.rib);
      if (Math.floor(t * 1.5) % 2 === 0) { P(g, tx, ty - 1, C.red); }
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
     sand, with zone 14 drawn around the tower. Labels sit above their feature,
     never on another label, with a halo in the sand colour. */
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
    R(g, 73, 35, 6, 6, C.dark); P(g, 75, 37, Math.floor(t * 1.5) % 2 ? C.red : C.dark);
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

  /* Panels. Each draws the whole picture for time t (seconds). */
  var SCENES = {
    intro: [
      function (g, t) { shelter(g, t, {}); },
      function (g, t) { siteMap(g, t); }
    ],
    dismantle: [
      function (g, t) {
        /* The assembly units take the tower and CRANE-L apart themselves:
           two cut at the top, two climb down with a segment each, and the
           segments pile up beside HALL-R. CRANE-L clings to the tower's side
           and loses its arm piece by piece. */
        sky(g, C.sky); ground(g); corridor(g, 0, 60);
        var h = Math.max(26, 54 - t * 2), top = GROUND - h;
        mast(g, 72, h, 0, t, false);
        var cy = Math.round(GROUND - h * 0.55), arm = Math.max(0, 9 - Math.floor(t * 2));
        R(g, 75, cy, 5, 6, C.steel); R(g, 75, cy, 5, 1, C.haze, 0.5);
        if (arm) { R(g, 80, cy + 1, arm, 1, C.steel); R(g, 80 + arm - 1, cy + 2, 1, 3, C.rib); }
        R(g, 69, top - 1, 2, 2, C.amber); R(g, 73, top - 1, 2, 2, C.amber);
        if (Math.floor(t * 6) % 2 === 0) { P(g, 71, top - 2, C.white); P(g, 72, top, C.white, 0.7); }
        for (var i = 0; i < 2; i++) {
          var y = top + ((t * 9 + i * 20) % (h - 10));
          R(g, i ? 74 : 68, y, 2, 2, C.amber); R(g, i ? 76 : 65, y + 1, 3, 2, C.steel);
        }
        var pile = Math.min(18, 4 + Math.floor(t * 2));
        R(g, 88, GROUND - 3, pile, 3, C.steel); R(g, 90, GROUND - 5, Math.max(2, pile - 6), 2, C.steel);
        R(g, 88, GROUND - 3, pile, 1, C.haze, 0.4);
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
        sky(g, C.sky); ground(g); corridor(g, 0, 58); mast(g, 80, 58, Math.max(0, 8 - t * 1.5), t); corridor(g, 102, 160);
        for (var i = 0; i < 3; i++) { R(g, 79 + (i % 2 ? 3 : -3), GROUND - 10 - ((t * 8 + i * 15) % 44), 2, 2, C.amber); }
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
      function (g, t) { sky(g, C.warm); haloWarm(g, t); ground(g); corridor(g, 0, 58); mast(g, 80, 58, 0, t); corridor(g, 102, 160); plume(g, 79, GROUND - 60, t, 0.55); },
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
      "Assembly units take the tower apart from the top and carry the pieces down. The climbing crane on the tower's side loses its arm. Removed pieces pile up beside the hall.",
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
