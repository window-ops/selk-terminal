/* 1887, Sergei Winogradsky, Strasbourg. A lab bench: a brass microscope
   with a slide on its stage, a jar of sulfur-spring water with mud. To the
   right, in the manner of a diagram, the specimen magnified, the zoom
   lines opening from the slide to the field. Beggiatoa filaments glide
   slowly across the field, full of sulfur globules, and the globules go
   out one by one as the bacteria oxidize the sulfur for energy. That was
   his finding: chemosynthesis. */
"use strict";
const { SKY, DARK, LIGHT, GOLD, BLUE, GREY } = require("./palette");

const FPS = 8, FRAMES = 28;
/* The field of view */
const CX = 88, CY = 29, R = 22;
const inField = (x, y) => (x - CX) * (x - CX) + (y - CY) * (y - CY) <= (R - 1) * (R - 1);
/* Three filaments: left end, row, length, direction of glide, wave phase */
const FILAMENTS = [
  { x: 64, y: 18, len: 44, dir: 1, ph: 0 },
  { x: 70, y: 29, len: 40, dir: -1, ph: 2 },
  { x: 66, y: 39, len: 38, dir: 1, ph: 4 }
];
/* The frame at which each globule goes out: they go out one by one from
   frame 6 to frame 24, in a scattered order */
function goesOut(f, g) {
  return 6 + ((f * 7 + g * 11) % 19);
}

function draw(fr, n) {
  const { d, obj } = fr;
  for (let y = 1; y < 46; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
  obj("floor", { edge: true }, () => { d.line(1, 60, 126, 60, GREY); });
  obj("bench", { on: ["floor"] }, () => {
    d.fill(4, 46, 56, 2, DARK);
    d.fill(7, 48, 2, 12, DARK); d.fill(54, 48, 2, 12, DARK);
  });
  /* The microscope: horseshoe foot, pillar at the back, stage, the mirror
     under the stage on a bracket from the pillar, a curved arm from the
     pillar to the tube, the tube over the middle of the stage with its
     objective just above the slide, the eyepiece on top. Mirror, slide,
     objective and eyepiece share one axis, column 24. */
  obj("microscope", { on: ["bench"] }, () => {
    d.fill(13, 44, 18, 2, DARK);
    d.fill(15, 31, 2, 13, GOLD);
    d.line(15, 37, 30, 37, DARK);
    d.line(17, 41, 21, 41, DARK); d.line(22, 40, 26, 40, GREY); d.line(22, 41, 26, 41, GREY);
    d.line(15, 30, 18, 27, GOLD); d.line(16, 30, 19, 27, GOLD);
    d.line(18, 26, 22, 22, GOLD); d.line(19, 26, 22, 23, GOLD);
    d.fill(23, 18, 3, 16, GOLD);
    d.line(24, 34, 24, 35, DARK);
    d.fill(22, 16, 5, 2, DARK);
  });
  obj("slide", { on: ["microscope"] }, () => { d.line(20, 36, 28, 36, LIGHT); });
  /* The jar of sulfur-spring water, mud at the bottom */
  obj("jar", { on: ["bench"] }, () => {
    d.line(4, 36, 4, 45, GREY); d.line(10, 36, 10, 45, GREY); d.line(4, 45, 10, 45, GREY);
    d.fill(5, 38, 5, 5, BLUE); d.fill(5, 43, 5, 2, DARK);
  });
  /* The zoom: two lines from the specimen at the end of the slide, opening
     to the tangents of the field, the way a magnified detail is drawn.
     They start on the slide and end on the rim of the field. */
  obj("zoom", { touch: ["slide"], parts: true }, () => {
    d.line(29, 36, 78, 9, GREY);
    d.line(29, 36, 83, 50, GREY);
    /* The two pixels each line closes in against the rim, filled */
    d.set(72, 13, GREY); d.set(74, 47, GREY);
  });
  obj("field", { touch: ["zoom"] }, () => {
    for (let y = CY - R; y <= CY + R; y++) for (let x = CX - R; x <= CX + R; x++) {
      const r2 = (x - CX) * (x - CX) + (y - CY) * (y - CY);
      if (r2 <= (R - 1) * (R - 1)) d.set(x, y, LIGHT);
      else if (r2 <= R * R + R) d.set(x, y, GREY);
    }
  });
  /* The filaments, two pixels thick, a joint between cells every five
     pixels, a globule in each cell until it goes out. They glide a pixel
     every four frames. */
  FILAMENTS.forEach((fl, f) => {
    obj("filament " + (f + 1), { touch: ["field"], parts: true }, () => {
      const shift = fl.dir * Math.floor(n / 4);
      for (let k = 0; k < fl.len; k++) {
        const x = fl.x + k + shift, y = fl.y + Math.round(1.4 * Math.sin((k + fl.ph) / 6));
        const c = k % 5 === 0 ? DARK : GREY;
        [0, 1].forEach((j) => { if (inField(x, y + j)) d.set(x, y + j, c); });
        if (k % 5 === 2 && n < goesOut(f, Math.floor(k / 5)) && inField(x, y)) d.set(x, y, GOLD);
      }
    });
  });
  d.textC(CX, 53, "BEGGIATOA", GREY);
}

module.exports = { id: "winogradsky", year: "1887", fps: FPS, frames: FRAMES, draw };
