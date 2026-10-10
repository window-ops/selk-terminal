/* 1957, Sputnik 1, launched on 4 October from Baikonur. Space with stars,
   the curved edge of the Earth at the bottom with a thin line of
   atmosphere. The satellite, a polished sphere with its four antennas
   swept back, crosses from left to right on an orbit that follows the
   curve of the Earth, and sends its radio beep every half second, drawn as
   arcs spreading out from it. The satellite and its signal are free: in
   orbit they rest on nothing. Its antennas must stay joined to the sphere. */
"use strict";
const { SKY, LIGHT, BLUE, GREY, GOLD } = require("./palette");

const FPS = 8, FRAMES = 18;
/* The Earth: a circle far below, of which only the top shows */
const EX = 64, EY = 250, ER = 200;
/* The orbit, round the same center; the satellite moves along it */
const OR = ER + 30;
/* It enters with its antennas still behind the left edge and leaves with
   its sphere and its last signal past the right edge, so it crosses the
   whole picture and nothing of it is cut off in the last frame but the
   trailing antennas */
const at = (n) => {
  const a = (-104 + n * (31 / (FRAMES - 1))) * Math.PI / 180;
  return [Math.round(EX + OR * Math.cos(a)), Math.round(EY + OR * Math.sin(a))];
};
const LABEL = [88, 4, 122, 8];

function draw(fr, n) {
  const { d, obj } = fr;
  obj("stars", { free: true }, () => {
    for (let i = 0; i < 26; i++) {
      const x = 3 + ((i * 47) % 122), y = 3 + ((i * 29) % 44);
      if (x >= LABEL[0] - 2 && x <= LABEL[2] + 2 && y >= LABEL[1] - 2 && y <= LABEL[3] + 2) continue;
      if (x < 22 && y < 11) continue;
      d.set(x, y, i % 4 ? SKY : LIGHT);
    }
  });
  /* The Earth to the bottom edge across the whole picture, its edge a
     gentle curve, lit along the rim, a line of atmosphere above it, bands
     of cloud on the ocean */
  obj("earth", { edge: true }, () => {
    for (let x = 1; x < 127; x++) {
      const top = Math.round(EY - Math.sqrt(ER * ER - (x - EX) * (x - EX)));
      d.set(x, top - 1, GREY);
      for (let y = top; y < 63; y++) {
        const cloud = y > top + 1 && ((x + 2 * y) % 13 < 3) && ((x * 3 + y * 5) % 7 < 4);
        d.set(x, y, y === top ? LIGHT : cloud ? LIGHT : BLUE);
      }
    }
  });
  /* The satellite: the sphere, lit from the upper left, and four antennas
     swept back from it, opposite to its motion */
  const [x, y] = at(n);
  obj("sputnik", { free: true, whole: true }, () => {
    const back = at(n - 3), dx = x - back[0], dy = y - back[1], l = Math.hypot(dx, dy), ux = -dx / l, uy = -dy / l, px = -uy, py = ux;
    [[-1.5, 13], [-0.5, 11], [0.5, 11], [1.5, 13]].forEach(([spread, len]) => {
      d.line(x, y, Math.round(x + ux * len + px * spread * 3), Math.round(y + uy * len + py * spread * 3), GREY);
    });
    d.disc(x, y, 2, GREY);
    d.set(x - 1, y - 1, LIGHT); d.set(x, y - 1, LIGHT); d.set(x - 1, y, LIGHT);
  });
  /* The beep: every fourth frame a new signal leaves the satellite as an
     arc on its leading side that grows for three frames */
  const age = n % 4;
  if (age < 3) obj("signal", { free: true }, () => { d.arc(x, y, 4 + age * 3, GOLD, -100, 60); });
  d.text(LABEL[0], LABEL[1], "SPUTNIK 1", GREY);
}

module.exports = { id: "sputnik", year: "1957", fps: FPS, frames: FRAMES, draw };
