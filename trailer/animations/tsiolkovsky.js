/* 1903, Konstantin Tsiolkovsky, Kaluga. A sheet pinned to the plank wall of
   his house, with a rocket drawn in section after the hydrogen and oxygen
   design his 1903 article discusses (the figure in the article itself
   labels its fuel hydrocarbon; this is not a copy of that figure): the
   cabin in the nose, a tank of liquid oxygen and a tank of liquid
   hydrogen against the hull, the feed lines to the chamber at the tail,
   the nozzle opening from the chamber. The drawing works: oxygen and
   hydrogen run along the feed lines into the chamber and the drawn
   exhaust leaves through the nozzle. */
"use strict";
const { write, writeC } = require("./lib/scene");
const { SKY, DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 18;
/* The feed lines, from each tank to the chamber, pixel by pixel: oxygen
   from under the bottom pixel of the O and along under the hydrogen tank,
   hydrogen straight out of its tank's tail end */
const OXY = [];
for (let x = 73; x >= 41; x--) OXY.push([x, 34]);
for (let y = 33; y >= 31; y--) OXY.push([41, y]);
const HYD = [];
for (let x = 45; x >= 41; x--) HYD.push([x, 29]);

function draw(fr, n) {
  const { d, obj } = fr;
  /* The plank wall */
  for (let y = 1; y < 63; y++) for (let x = 1; x < 127; x++) if (y % 6 === 0 || (x * 5 + y * 3) % 23 === 0) d.set(x, y, SKY);
  obj("sheet", { mounted: true }, () => {
    d.fill(16, 10, 96, 42, LIGHT);
    d.set(18, 12, GREY); d.set(109, 12, GREY); d.set(18, 49, GREY); d.set(109, 49, GREY);
  });
  /* The rocket in section, tail to the left. The hull is open at the
     tail between the two halves of the nozzle; the tanks sit against the
     top of the hull, the chamber against its tail wall. */
  obj("rocket", { touch: ["sheet"] }, () => {
    d.line(36, 24, 92, 24, DARK); d.line(36, 36, 92, 36, DARK);
    d.line(36, 24, 36, 27, DARK); d.line(36, 33, 36, 36, DARK);
    d.line(92, 24, 102, 30, DARK); d.line(92, 36, 102, 30, DARK);
    d.line(84, 25, 84, 35, DARK);
    d.box(64, 25, 20, 9, DARK);
    d.box(46, 25, 18, 9, DARK);
    d.fill(37, 28, 4, 5, DARK);
    d.line(36, 28, 29, 25, DARK); d.line(36, 32, 29, 35, DARK);
  });
  write(d, 72, 27, "O", BLUE);
  write(d, 53, 27, "H", GOLD);
  /* Oxygen and hydrogen running along the feed lines to the chamber: the
     lines drawn in grey, the liquid moving along them in dashes */
  obj("feed", { touch: ["rocket"], parts: true }, () => {
    OXY.forEach((p, i) => d.set(p[0], p[1], (i - n) % 4 === 0 ? BLUE : GREY));
    HYD.forEach((p, i) => d.set(p[0], p[1], (i - n) % 2 === 0 ? GOLD : GREY));
  });
  /* The drawn exhaust, from the chamber out through the nozzle, its
     strokes moving outwards */
  obj("exhaust", { touch: ["rocket"], parts: true }, () => {
    for (let r = 0; r < 3; r++) {
      const y = 29 + r, len = r === 1 ? 16 : 12;
      for (let k = 0; k < len; k++) {
        const x = 36 - k;
        if (k < 2 || ((k - n) % 4 + 4) % 4 !== 3) d.set(x, y, k < 5 ? GOLD : k < 10 ? ORANGE : RED);
      }
    }
  });
  writeC(d, 64, 42, "KALUGA", GREY);
}

module.exports = { id: "tsiolkovsky", year: "1903", fps: FPS, frames: FRAMES, draw };
