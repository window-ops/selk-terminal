/* 2097, MAST-01 in the dust, eight seconds, in the palette of the SV-4
   camera, drawn with the game's own camera pieces
   (common/vendor/scenes-site.js). No year is shown: the date comes from
   the WATCH header before it.

   The tower stands 1 180 m tall in 58 pixels, as in the game's camera, its
   hall at its foot and the corridor from the lab stopping short of the guy
   anchors. From the game's entries:
   - three levels of guy cables are tight, at 350, 700 and 1 050 m,
     anchored at 0.7 times their height on either side (the game's 2097
     site picture);
   - the fourth level's 8 cables were never raised. They hang tied off at
     level 3, slack, and swing in the wind;
   - CRANE-L is parked at 680 m, stowed against the tower's face with its
     arm folded down.
   Dust is rising. The tower sways slowly, and two gusts push its top over
   and let it come back, with more dust in them. The beacon blinks as in
   the game. Titan's haze hides Saturn and the stars.

   The cables touch the tower and their anchors, the anchors stand on the
   ground, the slack cables are tied to the tower, the crane touches the
   tower at level 3, the beacon sits on its top. */
"use strict";
const { linePoints } = require("./lib/scene");
const site = require("../../common/vendor/scenes-site");
const { W, H, C, GROUND } = site;

const FPS = 8, FRAMES = 64, MAST = 80, HEIGHT = 58, M = HEIGHT / 1180;
/* HALL-R two pixels narrower than the game's 22, the same vaulted shape,
   so its roof stays clear of the lowest guy cables in every frame */
const HALL = 20;
/* The guy levels, in meters, and the crane's height */
const LEVELS = [350, 700, 1050], CRANE = 680;
/* How far the top leans, in pixels, at time t: a slow sway and two gusts */
const gust = (t) => 3.5 * Math.exp(-(((t - 3.2) / 0.55) ** 2)) + 2.5 * Math.exp(-(((t - 6.1) / 0.45) ** 2));
const lean = (t) => 1.2 * Math.sin((2 * Math.PI * t) / 2.6) + gust(t);
/* The tower's edges at a height of y pixels, for a top lean of l, as the
   game's mast piece draws them */
function edges(y, l) {
  const f = y / HEIGHT, cx = MAST + l * f, w = Math.max(2, Math.round(8 - 6 * f)), left = Math.round(cx - w / 2);
  return [left, left + w - 1];
}

function draw(fr, n) {
  const { d, obj } = fr, t = n / FPS, l = lean(t), g = gust(t);
  obj("sky", { edge: true }, () => site.sky(d, C.sky));
  obj("ground", { edge: true }, () => site.ground(d));
  obj("corridor", { edge: true }, () => site.corridor(d, 0, MAST - 40));
  obj("MAST-01", { on: ["ground"] }, () => site.mast(d, MAST, HEIGHT, Math.round(l), t, false, HALL));
  const L = Math.round(l);
  /* The beacon on the top of the lattice, blinking as in the game */
  if (Math.floor(t * 1.5) % 2 === 0) {
    const [a] = edges(HEIGHT - 1, L);
    obj("beacon", { on: ["MAST-01"] }, () => d.R(a, GROUND - HEIGHT - 1, 2, 2, C.red));
  }
  /* The tight guy cables, two in the picture at each level, from the
     tower's edges to anchors on the ground */
  LEVELS.forEach((m, i) => {
    const y = Math.round(m * M), r = Math.round(m * 0.7 * M), [a, b] = edges(y, L);
    [[-1, a], [1, b]].forEach(([side, ex]) => {
      const ax = MAST + side * r + (side > 0 ? 1 : 0);
      obj("anchor " + i + side, { on: ["ground"] }, () => d.R(ax - 1, GROUND - 1, 3, 1, C.steel));
      obj("cable " + i + side, { touch: ["MAST-01", "anchor " + i + side] }, () => {
        linePoints(ex + side, GROUND - y, ax, GROUND - 2).forEach(([x, py]) => d.P(x, py, C.rib));
      });
    });
  });
  /* The slack cables of the fourth level, tied off at level 3 and hanging
     down the tower's sides, swinging out with the wind */
  const y3 = Math.round(LEVELS[2] * M), [a3, b3] = edges(y3, L);
  [[-1, a3], [1, b3]].forEach(([side, ex], k) => {
    obj("slack " + k, { touch: ["MAST-01"] }, () => {
      const len = 16;
      let px = ex + side, py = GROUND - y3;
      for (let s = 0; s <= len; s++) {
        const swing = (0.8 + 0.6 * g) * Math.sin(t * 3 + k * 1.7) + side * (0.5 + 0.4 * g);
        const out = Math.round(ex + side + (swing * s) / len * 3 + side * Math.sin((Math.PI * s) / len) * 1.5);
        /* Never swinging in across the tower's own edge */
        const x = side > 0 ? Math.max(out, edges(y3 - s, L)[1] + 1) : Math.min(out, edges(y3 - s, L)[0] - 1);
        const yy = GROUND - y3 + s;
        linePoints(px, py, x, yy).forEach(([qx, qy]) => d.P(qx, qy, C.steel));
        px = x; py = yy;
      }
    });
  });
  /* CRANE-L parked at 680 m and stowed, as the game's rule asks above
     5 m/s wind: its body clamped to the tower's front face, its arm
     folded down along the face, two pixels wide so the lattice behind
     never cuts it, the hook at its end. Nothing of it reaches out to the
     guy cables. */
  const cyh = Math.round(CRANE * M), cy = GROUND - cyh;
  obj("CRANE-L", { touch: ["MAST-01"] }, () => {
    for (let r = 0; r < 6; r++) {
      const [a, b] = edges(cyh - r, L);
      d.R(a, cy + r, b - a + 1, 1, C.steel);
    }
    { const [a, b] = edges(cyh, L); d.R(a, cy, b - a + 1, 1, C.haze, 0.5); }
    for (let r = 6; r < 14; r++) {
      const [a, b] = edges(cyh - r, L), c = Math.floor((a + b) / 2);
      d.R(c, cy + r, 2, 1, r === 13 ? C.dark : C.steel);
    }
  });
  /* Dust rising, thicker in the gusts, and a haze over the ground */
  obj("dust", { free: true }, () => {
    site.dust(d, t, Math.round(24 + 30 * g), 10 + 8 * g);
    d.R(0, GROUND - 14, W, H - GROUND + 14, C.haze, 0.03 + 0.06 * g);
  });
}

module.exports = { id: "mast", year: null, rgb: { w: W, h: H, bg: 0x211d19 }, fps: FPS, frames: FRAMES, draw };
