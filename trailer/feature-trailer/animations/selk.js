/* Timelapse, 2079 to 2097: the Selk crater on Titan, over four seconds, in
   the palette of the SV-4 camera, drawn with the game's own camera pieces
   (common/vendor/scenes-site.js). The years follow the game's dates.
   Titan's long days pass as light haze and dark haze.

   - 2079, the counter holding while the year passes: the crater is
     barren, dust over the dunes. The units come in and build the lab,
     printing its walls up row by row as they move along the top, then the
     corridor toward the shelter, which runs into the sand banked against
     the lab as in the game's camera. By the end of the year the lab is
     finished and its windows light. Plot 3 is roped out east of it. Then
     the counter runs on;
   - 2083: the first find lights plot 3's probes, and plot 9 is roped out
     beyond plot 3;
   - 2089: MAST-01 is started between them. Its hall goes up a few pixels
     past the end of a new corridor from the lab, and its lattice rises
     year by year, CRANE-L at its top once the lattice clears the hall;
   - 2092: the signs that something has gone wrong, without names. The lab
     goes dark, sealed in May, and plot 9's probes glow;
   - 2093: a concrete footing stands where plot 9 was, the plot paved over;
   - 2097: MAST-01 stands full height with its beacon, CRANE-L parked
     halfway down its side, and the counter stops for the cut to the alarm. */
"use strict";
const { night, counterRGB } = require("./lib/lapse");
const site = require("../../common/vendor/scenes-site");
const { W, H, C, GROUND } = site;

/* Left to right: the corridor from the shelter, the lab between its sand
   banks, the corridor on to HALL-R and MAST-01, plot 3, and plot 9 where
   the footing will stand */
const FPS = 8, FRAMES = 32, LAB = 30, MAST = 98, PLOT3 = 114, PLOT9 = 140, FOOTING = 140;
/* 2079 holds for the first frames, while the base is built */
const HOLD = 12, BUILD_FROM = 3, BUILD_TO = 10;
const FOUND = 2083, STARTED = 2089, SEALED = 2092, PAVED = 2093, PARKED = 2097;
const yearOf = (n) => (n < HOLD ? 2079 : Math.min(2097, 2080 + (n - HOLD)));
/* MAST-01's height in pixels in a given year, from its start to full
   height in 2097, as in the game's camera */
const height = (y) => Math.round(6 + (y - STARTED) * (58 - 6) / (PARKED - STARTED));

function draw(fr, n) {
  const { d, obj } = fr, t = n / FPS, y = yearOf(n), dark = night(n, FPS);
  /* How far the building has gone, 0 to 1, over the held year */
  const built = Math.max(0, Math.min(1, (n - BUILD_FROM + 1) / (BUILD_TO - BUILD_FROM + 1)));
  obj("sky", { edge: true }, () => site.sky(d, dark ? C.night : C.sky));
  obj("ground", { edge: true }, () => site.ground(d));
  if (built > 0 && built < 1) {
    /* The lab going up: its walls printed row by row, two units on the
       top of the new wall moving along it */
    const k = Math.max(1, Math.round(10 * built));
    obj("lab", { on: ["ground"] }, () => d.R(LAB, GROUND - k + 1, 22, k, C.dark));
    [0, 1].forEach((i) => {
      const ux = LAB + 1 + ((n * 7 + i * 11) % 19);
      obj("unit " + (i + 1), { on: ["lab"] }, () => d.R(ux, GROUND - k - 1, 2, 2, C.amber));
    });
  }
  if (built >= 1) {
    /* The finished lab with its sand banks, lit until it is sealed in
       2092; the corridor toward the shelter, printed last, runs into the
       west sand bank as in the game's camera */
    obj("corridor W", { edge: true }, () => site.corridor(d, 0, LAB - 7));
    obj("lab", { on: ["ground"], touch: ["corridor W"], parts: true }, () => site.lab(d, LAB, y < SEALED ? 1 : 0, t));
    obj("plot 3", { on: ["ground"] }, () => site.plot(d, PLOT3, 18, y >= FOUND ? 0.9 : 0, t));
  }
  /* Plot 9, east of the tower's place, from 2083; its probes glow in
     2092, and the next year the footing stands on it */
  if (y >= FOUND && y < PAVED) obj("plot 9", { on: ["ground"] }, () => site.plot(d, PLOT9, 12, y === SEALED ? 0.9 : 0, t));
  if (y >= PAVED) obj("footing", { on: ["ground"], parts: true }, () => site.footing(d, FOOTING));
  if (y >= STARTED) {
    const h = height(y);
    /* The corridor from the lab's east sand bank toward HALL-R, built
       with the tower; it stops a few pixels short of the hall, as the
       game's camera draws the corridors at the hall */
    obj("corridor E", { on: ["ground"], touch: ["lab"] }, () => site.corridor(d, LAB + 30, MAST - 13));
    obj("MAST-01", { on: ["ground"] }, () => site.mast(d, MAST, h, 0, t, false));
    /* The beacon, blinking as in the game, set directly on the top of the
       lattice (the game's piece leaves a row between them) */
    if (Math.floor(t * 1.5) % 2 === 0) obj("beacon", { on: ["MAST-01"] }, () => d.R(MAST - 1, GROUND - h - 1, 2, 2, C.red));
    /* CRANE-L on the tower's side, once the lattice rises clear of the
       hall: at the top while the tower grows, its arm out over the new
       section; parked halfway down in 2097 */
    const cy = y < PARKED ? GROUND - h + 2 : Math.round(GROUND - h * 0.55);
    if (h >= 20) obj("CRANE-L", { touch: ["MAST-01"] }, () => {
      d.R(MAST + 2, cy, 5, 6, C.steel); d.R(MAST + 2, cy, 5, 1, C.haze, 0.5);
      d.R(MAST + 7, cy + 1, 9, 1, C.steel); d.R(MAST + 15, cy + 2, 1, 3, C.rib);
    });
  }
  obj("dust", { free: true }, () => site.dust(d, t, 14));
  counterRGB(d, y, W, C.dark);
}

module.exports = { id: "selk", year: null, rgb: { w: W, h: H, bg: 0x211d19 }, fps: FPS, frames: FRAMES, draw };
