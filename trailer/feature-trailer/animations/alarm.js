/* 2097, the structure alarm. No year is shown: the date comes from the
   telemetry later.

   The game's own shelter, the first panel of the finale's intro, copied
   from js/game/scenes.js: the room at the old terminal, the round window on
   the dusty site and the tower, the dust drifting and the tower's beacon
   blinking as in the game. The trailer adds the alarm:
   - an industrial beacon, on a bracket under a cable conduit that runs
     along the top of the wall to the right edge. It pulses amber once a
     second and washes the room with its light; the view through the window
     keeps its own light;
   - the supervisor, seen from behind in the chair, who pulls the chair in
     toward the desk and reaches for the terminal at once, fast at first
     and slowing as the hand arrives, keeps still a moment with the hand on
     the edge of the screen, then puts the hand back down: a scared calm;
   - the chair, a robot chair. As it rolls in it also centers itself under
     the terminal, at an even speed, a pixel at a time, stopping exactly.
     Rolling closer moves chair and supervisor three pixels up the picture,
     centering moves them four pixels left. The chair stays there and still
     reaches the floor.

   The chair reaches the floor at the bottom edge, the supervisor touches
   the chair and is one piece with the arm, the conduit reaches the edge
   and the beacon hangs from it. */
"use strict";
const { W, H, C, shelter } = require("../../common/vendor/scenes-shelter");

const FPS = 8, FRAMES = 24, REACH_FROM = 1, REACH_TO = 6, DOWN_FROM = 13, DOWN_TO = 18;
const DARKEST = "#0F0D0B";
/* How bright the alarm is in each frame of its one-second cycle */
const PULSE = [1, 0.85, 0.55, 0.25, 0, 0, 0, 0.35];
const lerp = (a, b, k) => a + (b - a) * k;

/* A line two pixels thick in the supervisor's color */
function limb(d, x0, y0, x1, y1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) d.R(lerp(x0, x1, i / n), lerp(y0, y1, i / n), 2, 2, DARKEST);
}

function draw(fr, n) {
  const { d, obj } = fr, t = n / FPS;
  shelter(d, t, { people: false });
  /* The chair rolls in as the hand goes out, both done by frame 6; the
     hand stays on the screen to frame 13, then comes back down by frame
     18, slowing as it settles, while the chair stays in */
  const k = Math.max(0, Math.min(1, (n - REACH_FROM) / (REACH_TO - REACH_FROM)));
  const out = 1 - (1 - k) * (1 - k);
  /* The robot chair: an even, mechanical move, in and to the center */
  const dy = Math.round(3 * k), dx = -Math.round(4 * k);
  const b = Math.max(0, Math.min(1, (n - DOWN_FROM) / (DOWN_TO - DOWN_FROM)));
  const reach = out * (1 - (1 - (1 - b) * (1 - b)));
  obj("chair", { edge: true }, () => {
    d.R(110 + dx, 66 - dy, 30, 24 + dy, "#2E2923"); d.R(110 + dx, 66 - dy, 30, 1, C.steel);
  });
  /* The supervisor from behind: head, shoulders, back, as in the game,
     and the right arm reaching from the shoulder, the elbow out to the
     side, to the right edge of the screen, where the hand stays */
  obj("supervisor", { touch: ["chair"] }, () => {
    d.R(123 + dx, 51 - dy, 6, 7, DARKEST); d.R(122 + dx, 52 - dy, 8, 5, DARKEST);
    d.R(117 + dx, 58 - dy, 18, 3, DARKEST); d.R(115 + dx, 61 - dy, 22, 12, DARKEST);
    if (reach > 0) {
      const ex = Math.round(lerp(134 + dx, 139, reach)), ey = Math.round(lerp(64, 57, reach)) - dy;
      const hx = Math.round(lerp(134 + dx, 136, reach)), hy = Math.round(lerp(66 - dy, 49, reach));
      limb(d, 133 + dx, 59 - dy, ex, ey);
      limb(d, ex, ey, hx, hy);
    }
  });
  /* The alarm beacon: a cable conduit along the top of the wall from the
     right edge, a bracket down from it, the beacon's base and its dome;
     and its light over the room */
  const level = PULSE[n % PULSE.length];
  obj("conduit", { edge: true }, () => {
    d.R(138, 2, 22, 2, "#3A342C");
  });
  obj("beacon", { hangs: ["conduit"] }, () => {
    d.R(150, 4, 2, 2, "#3A342C");
    d.R(148, 6, 6, 2, "#3A342C");
    d.R(149, 8, 4, 3, level > 0.3 ? C.amber : "#5A3C1E");
    d.R(150, 8, 1, 1, level > 0.6 ? "#E0B97E" : level > 0.3 ? C.amber : "#5A3C1E");
  });
  if (level > 0) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if ((x - 38) * (x - 38) + (y - 34) * (y - 34) <= 23 * 23) continue;
      d.R(x, y, 1, 1, C.amber, 0.12 * level);
    }
  }
}

module.exports = { id: "alarm", year: null, rgb: { w: W, h: H, bg: 0x211d19 }, fps: FPS, frames: FRAMES, draw };
