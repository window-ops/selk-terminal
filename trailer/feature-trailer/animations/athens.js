/* Timelapse, 2008 to 2015: Athens, the easter egg, a nod to TROIKA.RUN.
   The Acropolis rock over the roofs of the basin, the Parthenon on it;
   along the street, Greece runs across the picture in the colors of its
   flag, blue shirt with a white stripe and white shorts, and the three
   officials of the Troika follow in black suits with briefcases, as in
   the game. Two days pass; the windows light up at night. The
   counter runs from 2008 to 2015 in 2 seconds, a year every two frames. */
"use strict";
const { year, night, sky, counter } = require("./lib/lapse");
const { GROUND, DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 16, STREET = 58;

/* The figures, after TROIKA.RUN's, 9 pixels tall and 3 wide, centered on
   column x, feet on row b - 1: a row of hair, a row of face, the body,
   and always two legs, each ending in a single dark foot. Two poses a
   step: passing, both legs straight down at the two sides of the hips;
   or in a stride, the back leg out behind and the front leg out ahead,
   the feet wide apart. */
function legs(d, x, b, step, leg, foot) {
  if (step % 2) {
    d.set(x - 1, b - 3, leg); d.set(x - 2, b - 2, leg); d.set(x - 2, b - 1, foot);
    d.set(x + 1, b - 3, leg); d.set(x + 2, b - 2, leg); d.set(x + 2, b - 1, foot);
  } else {
    d.set(x - 1, b - 3, leg); d.set(x - 1, b - 2, leg); d.set(x - 1, b - 1, foot);
    d.set(x + 1, b - 3, leg); d.set(x + 1, b - 2, leg); d.set(x + 1, b - 1, foot);
  }
}
function head(d, x, b, hair) {
  d.line(x - 1, b - 9, x + 1, b - 9, hair);
  d.line(x - 1, b - 8, x + 1, b - 8, ORANGE);
}
/* Greece: black hair, blue shirt with a white stripe, white shorts, bare
   legs, black shoes */
function runner(d, x, b, step) {
  head(d, x, b, GROUND);
  d.fill(x - 1, b - 7, 3, 3, BLUE); d.line(x - 1, b - 6, x + 1, b - 6, LIGHT);
  d.line(x - 1, b - 4, x + 1, b - 4, LIGHT);
  legs(d, x, b, step, ORANGE, GROUND);
}
/* An official: silver hair, which stands out against the rock and the
   houses, a black suit darker than the rock behind, a tie in color, the
   briefcase at the side */
function official(d, x, b, step, tie) {
  head(d, x, b, LIGHT);
  d.fill(x - 1, b - 7, 3, 4, GROUND); d.set(x, b - 7, tie);
  d.fill(x + 2, b - 5, 2, 2, ORANGE);
  legs(d, x, b, step, GROUND, GROUND);
}

function draw(fr, n) {
  const { d, obj } = fr, dark = night(n, FPS);
  sky(d, n, FPS, 40);
  obj("street", { edge: true }, () => { d.line(1, STREET, 126, STREET, GREY); d.fill(1, STREET + 1, 126, 62 - STREET, DARK); });
  /* The rock of the Acropolis, flat on top */
  obj("rock", { on: ["street"] }, () => {
    for (let y = 30; y < STREET; y++) {
      const half = y < 33 ? 22 : 22 + Math.round((y - 33) * 1.3);
      d.line(64 - half, y, 64 + half, y, y < 32 ? GREY : DARK);
    }
  });
  /* The Parthenon, centered on the line between columns 63 and 64: the
     steps, the eight columns of its front, the entablature, and the low pediment */
  obj("parthenon", { on: ["rock"] }, () => {
    d.line(51, 29, 76, 29, LIGHT); d.line(52, 28, 75, 28, LIGHT);
    for (let k = 0; k < 8; k++) d.line(53 + k * 3, 22, 53 + k * 3, 27, LIGHT);
    d.line(52, 21, 75, 21, LIGHT);
    d.line(53, 20, 74, 20, LIGHT); d.line(57, 19, 70, 19, LIGHT); d.line(61, 18, 66, 18, LIGHT);
  });
  /* The houses of the basin in front of the rock, each on the street,
     windows lit at night */
  [[4, 12, 9], [17, 9, 12], [27, 13, 8], [88, 12, 10], [101, 10, 13], [112, 13, 9]].forEach(([x, w, h], i) => {
    obj("house " + (i + 1), { on: ["street"] }, () => {
      d.fill(x, STREET - h, w, h, GREY);
      for (let wy = STREET - h + 2; wy < STREET - 1; wy += 3) for (let wx = x + 2; wx < x + w - 1; wx += 3) d.set(wx, wy, dark && (wx + wy) % 2 ? GOLD : DARK);
    });
  });
  /* Greece sprints across the whole picture, a step every two frames
     (4 a second) at 7.6 pixels a frame, and pulls away from the Troika,
     which walks briskly in from the left, a step every four frames at 3.4
     pixels a frame, and falls behind: as in TROIKA.RUN, Greece reaches
     2016 ahead of the Troika. Poses are 1 for a stride and 0 for passing. */
  const x = 8 + Math.round(n * 7.6);
  obj("greece", { on: ["street"] }, () => runner(d, x, STREET, n % 2 ? 0 : 1));
  [RED, BLUE, GOLD].forEach((tie, i) => {
    const ox = 4 - i * 8 + Math.round(n * 3.4);
    if (ox > 2) obj("official " + (i + 1), { on: ["street"] }, () => official(d, ox, STREET, Math.floor((n + i) / 2) % 2 ? 1 : 0, tie));
  });
  counter(d, year(n, FRAMES, 2008, 2015));
}

module.exports = { id: "athens", year: null, fps: FPS, frames: FRAMES, draw };
