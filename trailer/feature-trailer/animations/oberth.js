/* 1923, Hermann Oberth, "Die Rakete zu den Planetenräumen". A print shop,
   with an iron hand press of the Albion kind, still used for proofs in
   1923, seen from the front: two cheeks standing on a base, the head
   across their tops, a piston from the head down to the platen, the bed
   with the type and a sheet on it between the cheeks, and the bar on the
   right cheek. Printed sheets hang to dry from a line tied between the
   left wall and the press: one reads DIE RAKETE, one shows a rocket.

   In one cycle the bar is pulled toward the printer, the platen comes down
   onto the sheet and holds, then the bar goes back and the platen rises. */
"use strict";
const { write } = require("./lib/scene");
const { SKY, DARK, LIGHT, RED, GOLD, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 18;
/* How far the bar is pulled, from 0 (at rest) to 1 (fully pulled) */
function pull(n) {
  if (n < 3) return 0;
  if (n < 7) return (n - 2) / 4;
  if (n < 10) return 1;
  if (n < 14) return (14 - n) / 4;
  return 0;
}
const PLATEN_UP = 27, PLATEN_DOWN = 34;

function draw(fr, n) {
  const { d, obj } = fr;
  for (let y = 1; y < 60; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
  obj("floor", { edge: true }, () => { d.line(1, 60, 126, 60, GREY); });
  /* The press frame: base on the floor, the two cheeks, the head, the
     cross-piece between the cheeks that carries the bed */
  obj("press", { on: ["floor"] }, () => {
    d.fill(48, 56, 40, 4, DARK);
    d.fill(52, 17, 4, 39, DARK); d.fill(80, 17, 4, 39, DARK);
    d.fill(50, 12, 36, 5, DARK); d.line(50, 12, 85, 12, GREY);
    d.fill(56, 41, 24, 2, DARK);
  });
  /* The bed with the type, on the cross-piece; the sheet lies on it */
  obj("bed", { on: ["press"] }, () => {
    d.fill(57, 38, 22, 3, GREY);
    d.line(58, 38, 77, 38, GOLD);
  });
  obj("sheet", { on: ["bed"] }, () => { d.line(59, 37, 76, 37, LIGHT); });
  /* The platen hangs from the head on the piston; pulling the bar drives
     it down onto the sheet */
  const p = pull(n), py = Math.round(PLATEN_UP + p * (PLATEN_DOWN - PLATEN_UP));
  obj("platen", { hangs: ["press"] }, () => {
    d.fill(66, 17, 4, py - 17, GREY);
    d.fill(56, py, 24, 3, GREY);
    d.line(56, py + 2, 79, py + 2, DARK);
  });
  /* The bar comes out of the right cheek under the head and turns in a
     level arc toward the printer in front. From the front it keeps its
     height and only looks shorter as it swings toward the viewer; its
     wooden grip, along the end of the bar, shortens with it until it is
     seen end-on. */
  obj("bar", { touch: ["press"] }, () => {
    const a = (15 + p * 65) * Math.PI / 180, len = Math.round(20 * Math.cos(a)), grip = Math.max(3, Math.round(6 * Math.cos(a)));
    const tx = 84 + len;
    d.line(84, 19, tx, 19, GREY); d.line(84, 20, tx, 20, GREY);
    d.fill(tx + 1, 18, grip, 4, ORANGE);
  });
  /* The drying line, tied to the left wall and to the left cheek, and the
     printed sheets hanging from it on pegs */
  obj("line", { edge: true, touch: ["press"] }, () => { d.line(1, 22, 51, 22, GREY); });
  /* The sheets are sized so that what is printed on them sits in their
     centre, to the pixel: sheet 1 is 29 wide round column 20, sheet 2 is
     13 wide round column 43, both 18 high with 3 rows above and below the print */
  obj("sheet 1", { hangs: ["line"] }, () => {
    d.fill(6, 23, 29, 18, LIGHT);
    d.set(9, 23, GREY); d.set(31, 23, GREY);
  });
  write(d, 15, 26, "DIE", DARK);
  write(d, 9, 33, "RAKETE", DARK);
  obj("sheet 2", { hangs: ["line"] }, () => {
    d.fill(37, 23, 13, 18, LIGHT);
    d.set(39, 23, GREY); d.set(47, 23, GREY);
  });
  obj("rocket drawing", { touch: ["sheet 2"] }, () => {
    d.line(43, 26, 41, 28, DARK); d.line(43, 26, 45, 28, DARK);
    d.line(41, 28, 41, 36, DARK); d.line(45, 28, 45, 36, DARK);
    d.line(41, 32, 45, 32, DARK); d.line(41, 36, 45, 36, DARK);
    d.set(40, 37, DARK); d.set(46, 37, DARK); d.set(43, 37, RED);
  });
}

module.exports = { id: "oberth", year: "1923", fps: FPS, frames: FRAMES, draw };
