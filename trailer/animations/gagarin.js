/* 1961, Yuri Gagarin, Vostok 1, 12 April, Baikonur. The Vostok rocket on
   its pad: the core stage with the payload on top, the side boosters
   tapering out from it, held in the pad's support arms over the flame pit.
   The engines light, flame and smoke pour from the pit, then the arms
   swing open and the rocket rises, slowly at first, faster after, and
   has left the picture by frame 12. The last frames are the aftermath:
   the exhaust trail it left above the pad spreads and thins, the smoke
   drifts outward and thins, the arms rest open over the empty pad. At
   liftoff Gagarin's word appears: ПОЕХАЛИ!, "let's go!".

   Before liftoff the rocket must touch both arms, which stay hinged to the
   pad; once it rises it is free, but must stay in one piece. */
"use strict";
const { write } = require("./lib/scene");
const { SKY, DARK, LIGHT, RED, GOLD, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 18, IGNITION = 2, LIFTOFF = 6;
const GROUND = 56;
/* How high the rocket has risen: nothing before liftoff, then faster and
   faster */
const rise = (n) => (n < LIFTOFF ? 0 : Math.round(1.5 * (n - LIFTOFF + 1) * (n - LIFTOFF + 1)));
/* How thin the smoke and the trail have become: nothing before the rocket
   is gone, then more of them goes each frame */
const GONE = 12;
const thin = (n) => Math.max(0, n - GONE + 1);
/* A fixed, irregular scatter (a hash of the position), so a thinning
   cloud keeps the pixels it kept before and loses more of them as it
   thins, with no pattern showing */
const scatter = (x, y) => {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) % 8;
};
const keep = (x, y, n) => scatter(x, y) >= thin(n);
/* The arms lean in to hold the boosters, and swing out from liftoff */
const armAngle = (n) => (n < LIFTOFF ? 13 : Math.max(-65, 13 - (n - LIFTOFF + 1) * 20));

function rocket(d, yo) {
  /* Payload on top, the core stage, the side boosters widening downward */
  d.set(64, 8 - yo, LIGHT); d.line(63, 9 - yo, 65, 9 - yo, LIGHT);
  d.fill(62, 10 - yo, 5, 40, LIGHT);
  d.line(62, 14 - yo, 66, 14 - yo, GREY);
  for (let y = 30; y <= 49; y++) {
    const w = 1 + Math.round((y - 30) / 19 * 4);
    d.line(61 - w + 1, y - yo, 61, y - yo, GREY);
    d.line(67, y - yo, 67 + w - 1, y - yo, GREY);
  }
}

function draw(fr, n) {
  const { d, obj } = fr;
  for (let y = 1; y < GROUND; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
  const lit = n >= IGNITION, yo = rise(n);
  obj("ground", { edge: true }, () => {
    d.line(1, GROUND, 126, GROUND, GREY);
    d.fill(1, GROUND + 1, 126, 62 - GROUND, DARK);
  });
  /* The pad: a deck on each side of the pit, each on its own pillars */
  obj("pad L", { on: ["ground"] }, () => {
    d.fill(44, 50, 15, 2, DARK); d.line(44, 50, 58, 50, GREY);
    d.fill(46, 52, 2, 4, DARK); d.fill(56, 52, 2, 4, DARK);
  });
  obj("pad R", { on: ["ground"] }, () => {
    d.fill(70, 50, 15, 2, DARK); d.line(70, 50, 84, 50, GREY);
    d.fill(71, 52, 2, 4, DARK); d.fill(81, 52, 2, 4, DARK);
  });
  /* The support arms, hinged on the decks at the edge of the pit */
  const arm = (hx, side) => () => {
    const a = armAngle(n) * Math.PI / 180, L = 13;
    d.line(hx, 49, Math.round(hx + side * L * Math.sin(a)), Math.round(49 - L * Math.cos(a)), GREY);
  };
  obj("arm L", { on: ["pad L"] }, arm(55, 1));
  obj("arm R", { on: ["pad R"] }, arm(73, -1));
  obj("rocket", n < LIFTOFF ? { touch: ["arm L", "arm R"] } : { free: true, whole: true }, () => rocket(d, yo));
  /* Smoke billowing from the pit to both sides, growing after ignition,
     in front of the pad */
  if (lit) obj("smoke", { free: true }, () => {
    const g = n - IGNITION + 1;
    for (let k = 0; k < 4; k++) {
      const r = Math.min(7, 1 + Math.floor(g / 2) + (k % 2)), off = 10 + k * 6 + Math.floor(g / 2);
      [[64 - off, GROUND - 2 - (k % 2), k % 2 ? GREY : LIGHT], [64 + off, GROUND - 2 - ((k + 1) % 2), k % 2 ? LIGHT : GREY]].forEach(([cx, cy, c]) => {
        for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r + r * 0.6 && keep(cx + x, cy + y, n)) d.set(cx + x, cy + y, c);
        }
      });
    }
  });
  /* The exhaust trail the rocket leaves: from the bottom of the flame pit
     up to the rocket's flame, or to the top of the picture once it is
     gone. It spreads as it ages and flares out gradually over its last
     rows above the ground, a pixel wider every second row, so it runs
     into the smoke on the ground without a step; it thins once the
     rocket is gone. */
  if (n > LIFTOFF) obj("trail", { free: true }, () => {
    const top = Math.max(1, 50 - rise(n) + 12), w = Math.min(4, 1 + Math.floor((n - LIFTOFF) / 2));
    for (let y = top; y < GROUND; y++) {
      const half = w + Math.max(0, Math.floor((y - 38) / 2));
      for (let x = 64 - half; x <= 64 + half; x++) {
        if ((x + y) % 2 === 0 && keep(x, y, n)) d.set(x, y, GREY);
      }
    }
  });
  /* The flame: into the pit while the rocket stands, a tapering column
     under it once it rises */
  if (lit && 50 - yo >= 1) obj("flame", { touch: ["rocket"], parts: true }, () => {
    const bottom = 50 - yo, len = n < LIFTOFF ? 5 : 8 + Math.min(4, n - LIFTOFF);
    for (let j = 0; j < len; j++) {
      const half = Math.max(0, 5 - Math.floor(j / 2)), c = j < 2 ? GOLD : j < 5 ? ORANGE : RED;
      if (bottom + j < GROUND) d.line(64 - half, bottom + j, 64 + half, bottom + j, (j + n) % 3 === 0 && j > 2 ? GOLD : c);
    }
  });
  if (n >= LIFTOFF) write(d, 92, 4, "ПОЕХАЛИ!", GOLD);
}

module.exports = { id: "gagarin", year: "1961", fps: FPS, frames: FRAMES, draw };
