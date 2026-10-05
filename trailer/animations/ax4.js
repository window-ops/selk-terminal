/* 2025, Ax-4: Sławosz Uznański (Poland) and Tibor Kapu (Hungary), with Peggy
   Whitson and Shubhanshu Shukla, launched on 25 June and docked on 26 June
   at the space-facing port of the ISS's Harmony module. Framed as an echo
   of 1978: the station among the stars, a ship coming in to dock, the
   names and flags along the bottom. The ISS: the long truss, four pairs of
   solar arrays, the modules at the middle with the docking adapter on top.
   The Crew Dragon comes down from above, slowing, and docks nose first.
   Then the year at the top left rolls on, like a counter, from 2025 to
   2026, the first year of the game's own archive.

   Both craft are free while apart, each in one piece; once docked, the
   Dragon must touch the station. */
"use strict";
const { write } = require("./lib/scene");
const { SKY, DARK, LIGHT, RED, GOLD, GREEN, GREY } = require("./palette");

const FPS = 8, FRAMES = 40, DOCKED = 20, ROLL = 28, ROLLED = 34;
/* The bottom row of the Dragon's nose: from above the picture down to the
   adapter, slowing to a stop */
const noseY = (n) => 27 - Math.round(38 * Math.pow(Math.max(0, 1 - n / DOCKED), 2));

function iss(d) {
  d.fill(14, 33, 101, 2, GREY);
  [17, 33, 84, 100].forEach((x0) => {
    [21, 35].forEach((y0) => {
      d.fill(x0, y0, 12, 12, GOLD);
      for (let x = x0 + 3; x < x0 + 12; x += 4) d.line(x, y0, x, y0 + 11, DARK);
      d.line(x0, y0 + 6, x0 + 11, y0 + 6, DARK);
    });
  });
  d.fill(58, 30, 13, 11, LIGHT); d.line(58, 35, 70, 35, GREY);
  d.fill(62, 28, 5, 2, DARK);
}

function dragon(d, y) {
  /* Nose down: the docking ring, the capsule widening to the heat shield,
     the trunk with solar cells on one side; its outline symmetric about
     column 64 */
  d.line(63, y, 65, y, DARK);
  [[5, 1], [7, 2], [7, 3], [9, 4]].forEach(([w, r]) => d.line(64 - (w - 1) / 2, y - r, 64 + (w - 1) / 2, y - r, LIGHT));
  d.line(60, y - 5, 68, y - 5, DARK);
  d.fill(60, y - 10, 5, 5, LIGHT); d.fill(65, y - 10, 4, 5, DARK);
}

function draw(fr, n) {
  const { d, obj } = fr;
  obj("stars", { free: true }, () => {
    for (let i = 0; i < 24; i++) {
      const x = 3 + ((i * 53) % 122), y = 3 + ((i * 31) % 48);
      if (x < 22 && y < 11) continue;
      d.set(x, y, i % 4 ? SKY : LIGHT);
    }
  });
  obj("iss", { free: true, whole: true }, () => iss(d));
  obj("dragon", n >= DOCKED ? { touch: ["iss"] } : { free: true, whole: true }, () => dragon(d, noseY(n)));
  /* The names and flags: Poland, white over red; Hungary, red, white and
     green */
  d.fill(8, 55, 9, 3, LIGHT); d.fill(8, 58, 9, 3, RED);
  write(d, 19, 56, "UZNAŃSKI", GREY);
  d.fill(60, 55, 9, 2, RED); d.fill(60, 57, 9, 2, LIGHT); d.fill(60, 59, 9, 2, GREEN);
  write(d, 71, 56, "KAPU", GREY);
}

/* The year: 202 stays, the last digit rolls up out of its window as the
   next one rolls in from below, between frames ROLL and ROLLED */
function label(d, n) {
  write(d, 4, 4, "202", GOLD);
  const k = n < ROLL ? 0 : n >= ROLLED ? 6 : Math.round((n - ROLL) * 6 / (ROLLED - ROLL));
  write(d, 16, 4 - k, "5", GOLD, 4, 8);
  write(d, 16, 10 - k, "6", GOLD, 4, 8);
}

module.exports = { id: "ax4", year: "2025", fps: FPS, frames: FRAMES, draw, label };
