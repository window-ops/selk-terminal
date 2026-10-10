/* 1986, Movile Cave near Mangalia, found by Cristian Lascu during
   construction work. A section through the ground: at the surface a survey
   tripod over a narrow shaft; deep in the rock the shaft opens into a
   chamber whose lower part is flooded with thermal water. On the water
   floats the microbial mat, whitish with gold flecks of sulfur: bacteria
   that live on hydrogen sulfide, with no sunlight. Gas bubbles rise from a
   vent in the floor and break at the mat, and a water scorpion, one of
   the cave's blind animals, walks slowly across it.

   The tripod stands on the surface; the water rests on the cave floor,
   the mat on the water, the scorpion on the mat. The bubbles are free. */
"use strict";
const { write } = require("./lib/scene");
const { SKY, DARK, LIGHT, GOLD, BLUE, GREY } = require("./palette");

const FPS = 8, FRAMES = 18, SURFACE = 16, WATER = 43, FLOOR = 51;
/* The left column of the shaft, over the high part of the chamber's roof */
const SHAFT = 52;
/* The chamber: an oval hollow in the rock */
const inCave = (x, y) => {
  const dx = (x - 74) / 40, dy = (y - 41) / 11;
  return dx * dx + dy * dy <= 1;
};
/* The bubbles: where each rises and when it leaves the vent */
const BUBBLES = [[76, 0], [79, 6], [74, 11], [78, 15]];

function draw(fr, n) {
  const { d, obj } = fr;
  for (let y = 1; y < SURFACE; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
  /* The rock, from the surface down, with the shaft and the chamber cut
     out of it */
  obj("rock", { edge: true }, () => {
    d.line(1, SURFACE, 126, SURFACE, GREY);
    d.fill(1, SURFACE + 1, 126, 62 - SURFACE, DARK);
    for (let y = SURFACE + 2; y < 63; y += 3) for (let x = 2 + (y % 6); x < 126; x += 9) d.set(x, y, SKY);
    /* The shaft is cut down from the surface until it opens into the
       chamber, so it never stops short in the rock */
    for (let y = SURFACE; y < 63 && !inCave(SHAFT + 1, y); y++) d.clear(SHAFT, y, 3, 1);
    for (let y = SURFACE + 1; y < 63; y++) for (let x = 1; x < 127; x++) if (inCave(x, y)) d.clear(x, y, 1, 1);
  });
  /* The survey tripod over the shaft */
  obj("tripod", { on: ["rock"] }, () => {
    const c = SHAFT + 1;
    d.line(c, 6, c - 5, SURFACE - 1, GREY); d.line(c, 6, c + 5, SURFACE - 1, GREY); d.line(c, 6, c, SURFACE - 1, GREY);
    d.fill(c - 1, 5, 3, 1, GOLD);
  });
  /* The thermal water filling the bottom of the chamber */
  obj("water", { on: ["rock"] }, () => {
    for (let y = WATER; y < 63; y++) for (let x = 1; x < 127; x++) if (inCave(x, y)) d.set(x, y, BLUE);
  });
  /* The microbial mat floating on the water, with a ripple running along it */
  obj("mat", { on: ["water"], parts: true }, () => {
    for (let x = 48; x <= 104; x++) {
      if (!inCave(x, WATER - 1) || x % 11 === 0) continue;
      const lift = (x - 48 + n * 2) % 16 === 0 ? 1 : 0;
      d.set(x, WATER - 1 - lift, (x * 5) % 7 === 0 ? GOLD : LIGHT);
      if (lift) d.set(x, WATER - 1, LIGHT);
    }
  });
  /* The water scorpion walking on the mat. Its body is a flat oval, dark
     below and lighter on the back; the grasping forelegs reach straight
     ahead from the front of the body, the breathing tube rises from the
     back. Under the body its walking legs stand on the mat, their pairs
     alternating half a pixel either side of the body's middle (column 3
     of its 7); at each step they change places and the body moves on a
     pixel, every second frame. */
  obj("scorpion", { on: ["mat"] }, () => {
    const step = Math.floor(n / 2), x = 58 + step, y = WATER - 3;
    d.line(x + 1, y - 1, x + 5, y - 1, GREY);
    d.line(x, y, x + 6, y, DARK);
    d.line(x + 7, y, x + 8, y, GREY);
    d.set(x - 1, y, GREY); d.set(x - 2, y - 1, GREY);
    (step % 2 ? [x + 2, x + 5] : [x + 1, x + 4]).forEach((lx) => d.set(lx, y + 1, GREY));
  });
  /* Bubbles rising from the vent to the mat */
  BUBBLES.forEach(([bx, start], i) => {
    const age = (n - start + FRAMES) % FRAMES, y = FLOOR - 1 - age;
    if (age < 8 && y > WATER) obj("bubble " + (i + 1), { free: true }, () => {
      d.set(bx, y, LIGHT); if (age > 3) d.set(bx + 1, y, LIGHT);
    });
  });
  write(d, 54, 56, "MOVILE", GREY);
}

module.exports = { id: "movile", year: "1986", fps: FPS, frames: FRAMES, draw };
