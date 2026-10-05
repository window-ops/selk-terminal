/* Copied from the game, js/game/scenes.js (GPL-3.0): the scene palette C,
   the noise rnd and the shelter, the first panel of the finale's intro.
   The game draws SVG rects; here R and P draw into the trailer's RGB
   picture (g.R, g.P), rounded the same way. One change: view.people false
   leaves out the chair and the supervisor, which the trailer draws itself
   as checked objects, so it can animate the supervisor's arm. */
"use strict";
const W = 160, H = 90;
const C = {
  sky: ["#A88D5C", "#B89C69", "#C7AB78", "#D3B988"],
  /* Titan's haze hides Saturn and the stars from the surface; nights are
     dark haze */
  night: ["#2A221B", "#352A20", "#433426", "#52402D"],
  warm: ["#B7864E", "#C8955A", "#D6A76A", "#E0B97E"],
  ground: "#6E5B3E", ground2: "#5A4A33", rim: "#836C48",
  dark: "#1E2427", rib: "#3A4448", steel: "#56605F", haze: "#D6C396",
  amber: "#C7843A", red: "#C0604A", lamp: "#A7B07C", glow: "#D8E3A0", white: "#EFE6C8"
};
function R(g, x, y, w, h, c, o) { g.R(x, y, w, h, c, o); }
function P(g, x, y, c, o) { g.P(x, y, c, o); }
/* Deterministic noise, so dust and stars stay in place between frames */
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
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
    /* The tower in the window: a slight bulge above the foot, narrowing to
       a crossbar and a beacon, inside the frame at any lean */
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
  if (view.people === false) { return; }
  /* The supervisor, seen from behind in a chair, below the screen's middle */
  R(g, 110, 66, 30, 24, "#2E2923"); R(g, 110, 66, 30, 1, C.steel);
  R(g, 123, 51, 6, 7, "#0F0D0B"); R(g, 122, 52, 8, 5, "#0F0D0B");
  R(g, 117, 58, 18, 3, "#0F0D0B"); R(g, 115, 61, 22, 12, "#0F0D0B");
}

module.exports = { W, H, C, rnd, shelter };
