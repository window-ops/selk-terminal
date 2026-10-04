/* The drawings of DISASSEMBLY.RUN (js/games/disassembly/) on its 640 by
   400 canvas: the phone seen from the back, built of layers from the top
   one down; on the right a tray where each removed layer lies at a third
   of its size, and under the tray a drawer with the new part. Shapes are
   laid out in units of 2 canvas pixels (r, round), with fine details such
   as screw heads, lens rings and reflections in single pixels (f, disc,
   ring). The phone is 84 by 172 units; the Fairphone 5 has strongly
   rounded corners, the Galaxy S24 smaller ones.

   A layer is drawn from its state: screws that are out show as empty holes,
   heated glass glows at its edges, and glass with its adhesive cut has a
   pick in the seam.

   This file holds the palette, the sizes, the context and the drawing
   primitives. The other files in art/ add to S.disassemblyArt:
   - details.js: printed marks, the camera bump, screws and lenses;
   - layers.js: where each layer lies and how it draws itself;
   - phone.js: the phone from the back and the front, and hit tests;
   - scene.js: the whole picture with the tray and the drawer;
   - note7.js: the Galaxy Note 7 joke;
   - tools.js: the pictures of the tools. */
(function () {
  var S = window.SELK;
  var K = 2, W = 640, H = 400, PX = 24, PY = 14, PW = 84, PH = 172, TRAY = 128, DRAWER = 132;
  var C = {
    bg: "#1E2427", mat: "#283034", frame: "#3A4448", edge: "#5E6A6E", dark: "#15191B",
    haze: "#D6C396", dust: "#8F9A9A", white: "#E8E4DA", red: "#C8433A", copper: "#B8733A", glow: "#E0703A",
    blue: "#5B8BC4", blueLit: "#7FA6D6", glass: "#2C3A44", glassLit: "#4A6070",
    board: "#2F5A3F", boardLit: "#3F7A55", cell: "#3A3F44", cellLit: "#6B7378", lens: "#0E1112", gold: "#B89A50",
    fpBoard: "#1F2B25", note: "#2B4F7A", noteLit: "#4A7DB5", coral: "#7FA8CC", coralLit: "#A9C6DE", char1: "#2A1E16", char2: "#4A3220", flame1: "#F2D16B", flame2: "#E8862E", onyx: "#1C1F21", onyxLit: "#34393C", screen: "#1E3A5F", screenLit: "#2C5A8A", plate: "#C4C8C9", amber: "#D9822B", smoke: "#45494D", smokeLit: "#6B7075", bump: "#26292C", matte: "#3A3D40"
  };
  /* Corner radius of each phone, in units */
  var RADIUS = { fairphone: 9, samsung: 5 };
  /* g is the context drawn on; loose is set while a layer whose screws are
     out is drawn; edition is the Fairphone's: "transparent", "blue" or
     "black" */
  var A = S.disassemblyArt = {
    W: W, H: H, K: K, PX: PX, PY: PY, PW: PW, PH: PH, TRAY: TRAY, DRAWER: DRAWER, C: C, RADIUS: RADIUS,
    g: null, loose: false, edition: "transparent",
    use: function (ctx) { A.g = ctx; }
  };
  function r(x, y, w, h, c) {
    A.g.fillStyle = c; A.g.fillRect(Math.round(x * K), Math.round(y * K), Math.round(w * K), Math.round(h * K));
  }
  function f(x, y, w, h, c) {
    A.g.fillStyle = c; A.g.fillRect(Math.round(x * K), Math.round(y * K), w, h);
  }
  /* A box with rounded corners of rad units */
  function round(x, y, w, h, rad, c) {
    var X = Math.round(x * K), Y = Math.round(y * K), Wd = Math.round(w * K), Ht = Math.round(h * K), R = rad * K;
    A.g.fillStyle = c;
    for (var row = 0; row < Ht; row++) {
      var d = row < R ? R - row - 0.5 : row >= Ht - R ? row - (Ht - R) + 0.5 : 0;
      var inset = d > 0 ? Math.round(R - Math.sqrt(Math.max(0, R * R - d * d))) : 0;
      A.g.fillRect(X + inset, Y + row, Wd - inset * 2, 1);
    }
  }
  function disc(cx, cy, rad, c) {
    var R = rad * K, ox = Math.round(cx * K), oy = Math.round(cy * K);
    A.g.fillStyle = c;
    for (var y = -Math.floor(R); y <= R; y++) {
      var half = Math.floor(Math.sqrt(R * R - y * y));
      A.g.fillRect(ox - half, oy + y, half * 2 + 1, 1);
    }
  }
  function ring(cx, cy, rad, c) {
    var R = rad * K, ox = Math.round(cx * K), oy = Math.round(cy * K);
    A.g.fillStyle = c;
    for (var a = 0; a < 200; a++) { A.g.fillRect(ox + Math.round(R * Math.cos(a / 31.8)), oy + Math.round(R * Math.sin(a / 31.8)), 1, 1); }
  }
  /* The rounded triangle round three circles of radius rad, with corners
     given as [x, y] in units: the Fairphone 5's camera bump */
  function hull(pts, rad, c) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.floor((Math.min.apply(null, xs) - rad) * K), x1 = Math.ceil((Math.max.apply(null, xs) + rad) * K);
    var y0 = Math.floor((Math.min.apply(null, ys) - rad) * K), y1 = Math.ceil((Math.max.apply(null, ys) + rad) * K);
    function seg(px, py, a, b) {
      var dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)));
      return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
    }
    function inside(px, py) {
      var sgn = function (a, b) { return (px - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (py - b[1]); };
      var d1 = sgn(pts[0], pts[1]), d2 = sgn(pts[1], pts[2]), d3 = sgn(pts[2], pts[0]);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    }
    A.g.fillStyle = c;
    for (var py = y0; py < y1; py++) {
      for (var px = x0; px < x1; px++) {
        var ux = (px + 0.5) / K, uy = (py + 0.5) / K;
        if (inside(ux, uy) || Math.min(seg(ux, uy, pts[0], pts[1]), seg(ux, uy, pts[1], pts[2]), seg(ux, uy, pts[2], pts[0])) <= rad) { A.g.fillRect(px, py, 1, 1); }
      }
    }
  }
  /* A filled polygon of [x, y] corners in units */
  function poly(pts, c) {
    var ys = pts.map(function (p) { return p[1]; }), y0 = Math.floor(Math.min.apply(null, ys) * K), y1 = Math.ceil(Math.max.apply(null, ys) * K);
    A.g.fillStyle = c;
    for (var py = y0; py < y1; py++) {
      var yy = (py + 0.5) / K, xs = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) { xs.push(a[0] + (yy - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      }
      xs.sort(function (m, n) { return m - n; });
      for (var j = 0; j + 1 < xs.length; j += 2) { A.g.fillRect(Math.round(xs[j] * K), py, Math.round((xs[j + 1] - xs[j]) * K), 1); }
    }
  }
  A.r = r; A.f = f; A.round = round; A.disc = disc; A.ring = ring; A.hull = hull; A.poly = poly;
})();
