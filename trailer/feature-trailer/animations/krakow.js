/* Timelapse, 2016 to 2025: Kraków. On the left, Wawel Hill over the bank,
   the castle with its red roofs and towers, the cathedral with the gold
   dome of the Sigismund Chapel. On the right, the houses of the Old Town
   and St Mary's Basilica in brick, its two towers unequal: the taller with
   a green copper spire and a gold crown, the shorter with a green helmet.
   In front, the Vistula flows, its ripples moving downstream. Two days
   pass; windows light up at night. The counter runs from 2016 to 2025. */
"use strict";
const { year, night, sky, counter } = require("./lib/lapse");
const { DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY, GREEN } = require("./palette");

const FPS = 8, FRAMES = 16, BANK = 49, RIVER = 52;

/* A row of houses with red roofs, on the bank, windows lit at night */
function house(d, x, w, h, dark) {
  d.fill(x, BANK - h, w, h, LIGHT);
  d.line(x, BANK - h - 1, x + w - 1, BANK - h - 1, RED);
  for (let wy = BANK - h + 2; wy < BANK - 1; wy += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) d.set(wx, wy, dark && (wx * 3 + wy) % 4 === 0 ? GOLD : GREY);
}

function draw(fr, n) {
  const { d, obj } = fr, dark = night(n, FPS);
  sky(d, n, FPS, BANK);
  /* The bank and the river to the bottom edge */
  obj("bank", { edge: true }, () => { d.fill(1, BANK, 126, RIVER - BANK, DARK); d.line(1, BANK, 126, BANK, GREY); });
  obj("vistula", { edge: true, touch: ["bank"] }, () => {
    d.fill(1, RIVER, 126, 62 - RIVER, BLUE);
    for (let y = RIVER + 1; y < 62; y += 3) for (let x = 1; x < 127; x++) if ((x - n * 2 + y * 5) % 14 === 0) d.line(x, y, x + 2, y, LIGHT);
  });
  /* Wawel Hill, flat on top */
  obj("wawel hill", { on: ["bank"] }, () => {
    for (let y = 31; y < BANK; y++) {
      const half = 18 + Math.round((y - 31) * 0.6);
      d.line(30 - half, y, 30 + half, y, y === 31 ? GREY : DARK);
    }
  });
  /* The castle: a long range of walls under red roofs, two towers */
  obj("castle", { on: ["wawel hill"] }, () => {
    d.fill(15, 25, 22, 6, LIGHT); d.line(15, 24, 36, 24, RED);
    d.fill(13, 19, 3, 12, LIGHT); d.line(13, 18, 15, 18, RED); d.set(14, 17, RED);
    d.fill(34, 21, 3, 10, LIGHT); d.line(34, 20, 36, 20, RED);
    for (let x = 17; x < 34; x += 3) d.set(x, 27, dark && x % 2 ? GOLD : GREY);
  });
  /* The cathedral: its nave, a tower, the gold dome of the Sigismund
     Chapel on its drum */
  obj("cathedral", { on: ["wawel hill"] }, () => {
    d.fill(38, 24, 9, 7, LIGHT);
    d.fill(44, 16, 3, 8, LIGHT); d.line(44, 15, 46, 15, GREEN); d.set(45, 14, GREEN);
    d.fill(39, 22, 3, 2, LIGHT); d.line(39, 21, 41, 21, GOLD); d.line(39, 20, 41, 20, GOLD); d.set(40, 19, GOLD);
  });
  /* St Mary's Basilica from the market square: its west front, two
     unequal brick towers either side of a gabled facade with a tall
     pointed window. The taller tower ends in a green spire with small
     pinnacles at its foot and the gold crown at its tip; the shorter in a
     green helmet with a small lantern. */
  obj("st mary's", { on: ["bank"] }, () => {
    d.fill(91, 18, 4, BANK - 18, ORANGE);
    d.line(91, 17, 94, 17, GREEN); d.set(91, 16, GREEN); d.set(94, 16, GREEN);
    d.fill(92, 11, 2, 6, GREEN); d.line(92, 10, 93, 10, GOLD);
    d.fill(95, 28, 7, BANK - 28, ORANGE);
    d.line(96, 27, 100, 27, ORANGE); d.line(97, 26, 99, 26, ORANGE); d.set(98, 25, ORANGE);
    d.fill(102, 23, 4, BANK - 23, ORANGE);
    d.line(102, 22, 105, 22, GREEN); d.line(103, 21, 104, 21, GREEN); d.line(103, 20, 104, 20, GOLD);
    d.fill(97, 31, 3, 10, dark ? GOLD : DARK); d.set(98, 30, dark ? GOLD : DARK);
  });
  /* The Old Town houses either side of the church, which stands centered
     between them, two pixels clear of each */
  [[60, 9, 10], [70, 8, 13], [79, 10, 9], [108, 8, 12], [117, 8, 9]].forEach(([x, w, h], i) => {
    obj("house " + (i + 1), { on: ["bank"] }, () => house(d, x, w, h, dark));
  });
  counter(d, year(n, FRAMES, 2016, 2025));
}

module.exports = { id: "krakow", year: null, fps: FPS, frames: FRAMES, draw };
