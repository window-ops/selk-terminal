/* Copied from the game, js/game/scenes.js (GPL-3.0): the camera pieces
 for the site outside, verbatim: sky, drift, roofDust, ridge, ground,
 dust, corridor, hall, mast, footing, plot and lab, with the scene palette C and
 the noise rnd from vendor/scenes-shelter.js. The game draws SVG rects;
 here R and P draw into the trailer's RGB picture (g.R, g.P). */
"use strict";
const { W, H, C, rnd } = require("./scenes-shelter");
const GROUND = 66;
function R(g, x, y, w, h, c, o) { g.R(x, y, w, h, c, o); }
function P(g, x, y, c, o) { g.P(x, y, c, o); }
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
function mast(g, x, h, lean, t, light, hallWidth) {
  for (var y = 0; y < h; y++) {
    var f = y / h, cx = x + lean * f, w = Math.max(2, Math.round(8 - 6 * f)), left = Math.round(cx - w / 2);
    P(g, left, GROUND - y, C.dark); P(g, left + w - 1, GROUND - y, C.dark);
    if (y % 5 === 0) { R(g, left, GROUND - y, w, 1, C.rib); }
    else if (w > 3) { P(g, left + 1 + ((y % 5) * (w - 2) / 5 | 0), GROUND - y, C.steel); }
  }
  if (light !== false && Math.floor(t * 1.5) % 2 === 0) { R(g, x + lean - 1, GROUND - h - 2, 2, 2, C.red); }
  hall(g, x, hallWidth || 22);
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
function lab(g, x, lit, t) {
  R(g, x, GROUND - 9, 22, 10, C.dark); R(g, x + 2, GROUND - 11, 18, 2, C.rib);
  for (var i = 0; i < 5; i++) {
    var on = lit > 0 && (lit >= 1 || t * 2 > i);
    R(g, x + 2 + i * 4, GROUND - 7, 2, 2, on ? C.amber : C.rib);
  }
  R(g, x + 9, GROUND - 3, 3, 3, lit > 0 ? C.haze : C.rib);
  roofDust(g, x + 2, GROUND - 12, 18); drift(g, x - 8, 8, 3); drift(g, x + 22, 8, 3);
}
module.exports = { W, H, C, rnd, GROUND, sky, drift, roofDust, ridge, ground, dust, corridor, hall, mast, footing, plot, lab };
