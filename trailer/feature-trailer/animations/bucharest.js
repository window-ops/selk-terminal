/* Timelapse, 2026 to 2047: Bucharest. The Palace of the Parliament in its
   stepped tiers with the central tower, blocuri either side of the
   boulevard, traffic on it (light trails by night). The years change it as
   the game's archive has them: in 2033 and 2034 a climate strike marches
   across the boulevard under a red banner; from 2041 the flag on the tower
   is the Federation's, blue with a gold ring, as in the 2041 picture,
   where it was the Romanian tricolour; from 2045 scaffolding stands on a
   panel block, renovation having begun. Two days pass. */
"use strict";
const { year, night, sky, counter } = require("./lib/lapse");
const { GROUND, DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 16, STREET = 49;

/* A panel block: gray slabs, a grid of windows, lit at night */
function block(d, x, w, top, dark) {
  d.fill(x, top, w, STREET - top, GREY);
  for (let y = top + 2; y < STREET - 1; y += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) d.set(wx, y, dark && (wx * 5 + y * 3) % 7 < 3 ? GOLD : DARK);
}

function draw(fr, n) {
  const { d, obj } = fr, dark = night(n, FPS), y = year(n, FRAMES, 2026, 2047);
  sky(d, n, FPS, STREET);
  obj("street", { edge: true }, () => {
    d.line(1, STREET, 126, STREET, GREY); d.fill(1, STREET + 1, 126, 62 - STREET, DARK);
    for (let x = 4; x < 126; x += 8) d.line(x, 56, x + 3, 56, GREY);
  });
  /* The Palace of the Parliament: three tiers, rows of windows, the tower */
  obj("palace", { on: ["street"] }, () => {
    [[24, 104, 38, 48], [34, 94, 30, 37], [46, 82, 24, 29], [57, 71, 17, 23]].forEach(([x0, x1, y0, y1]) => {
      d.fill(x0, y0, x1 - x0 + 1, y1 - y0 + 1, LIGHT);
      for (let wy = y0 + 2; wy < y1; wy += 3) for (let wx = x0 + 2; wx < x1 - 1; wx += 3) d.set(wx, wy, dark && (wx + wy) % 3 === 0 ? GOLD : GREY);
    });
    d.line(64, 13, 64, 16, GREY);
  });
  /* The flag on the tower: the Romanian tricolour, then from 2041 the Federation's */
  obj("flag", { touch: ["palace"] }, () => {
    if (y < 2041) { d.line(65, 13, 65, 15, BLUE); d.line(66, 13, 66, 15, GOLD); d.line(67, 13, 67, 15, RED); }
    else { d.fill(65, 13, 3, 3, BLUE); d.set(66, 14, GOLD); }
  });
  /* The blocuri either side */
  obj("block L", { on: ["street"] }, () => block(d, 3, 17, 20, dark));
  obj("block R", { on: ["street"] }, () => block(d, 108, 17, 22, dark));
  /* From 2045 the left block is being renovated: scaffolding against it */
  if (y >= 2045) obj("scaffolding", { touch: ["block L"], on: ["street"] }, () => {
    d.line(20, 20, 20, STREET - 1, ORANGE); d.line(22, 20, 22, STREET - 1, ORANGE);
    for (let sy = 22; sy < STREET; sy += 4) d.line(20, sy, 22, sy, ORANGE);
  });
  /* The climate strike of 2033 to 2035: a march under a red banner,
     dressed in black and blue so it shows against the Palace */
  if (y >= 2033 && y <= 2035) {
    for (let k = 0; k < 9; k++) {
      const fx = 40 + k * 5 + (n % 2);
      obj("marcher " + (k + 1), { on: ["street"] }, () => {
        d.set(fx, STREET - 5, ORANGE); d.line(fx, STREET - 4, fx, STREET - 2, k % 2 ? BLUE : GROUND); d.set(fx, STREET - 1, GROUND);
      });
    }
    obj("banner", { touch: ["marcher 3", "marcher 7"] }, () => {
      d.line(51, STREET - 9, 51, STREET - 5, GREY); d.line(71, STREET - 9, 71, STREET - 5, GREY);
      d.fill(52, STREET - 10, 19, 3, RED);
    });
  }
  /* Traffic on the boulevard: cars by day, streaks of light by night */
  obj("traffic", { free: true }, () => {
    for (let k = 0; k < 4; k++) {
      const lane = k % 2 ? 53 : 59, dir = k % 2 ? 1 : -1, x = ((k * 37 + dir * n * 23) % 126 + 126) % 126 + 1;
      if (dark) d.line(x, lane, Math.min(126, x + 10), lane, k % 2 ? GOLD : RED);
      else d.fill(x, lane - 1, 4, 2, [RED, BLUE, LIGHT, ORANGE][k]);
    }
  });
  counter(d, y);
}

module.exports = { id: "bucharest", year: null, fps: FPS, frames: FRAMES, draw };
