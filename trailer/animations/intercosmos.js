/* 1978, Vladimír Remek (Czechoslovakia, Soyuz 28, 2 March) and Mirosław
   Hermaszewski (Poland, Soyuz 30, 27 June). Both flew to the Salyut 6
   station. In orbit among the stars: the station, a stepped hull with a
   solar panel above and below on masts, a docking port at each end; a
   Soyuz comes in from the right, slowing, and docks at the station's aft
   port. Along the bottom, the two names, each with its country's flag.

   Both craft are free while apart, each in one piece; once docked, the
   Soyuz must touch the station. */
"use strict";
const { SKY, DARK, LIGHT, RED, BLUE, GREY } = require("./palette");

const FPS = 8, FRAMES = 18, DOCKED = 12;
/* The Soyuz's nose: far out at first, closing more and more slowly until
   it touches the port */
const nose = (n) => 77 + Math.round(34 * Math.pow(Math.max(0, 1 - n / DOCKED), 2));

function station(d) {
  /* Hull, from the forward port at the left to the aft port at the right */
  d.fill(24, 28, 2, 3, GREY);
  d.fill(26, 27, 4, 5, GREY);
  d.fill(30, 26, 8, 7, GREY);
  d.fill(38, 24, 22, 11, GREY); d.line(38, 24, 59, 24, LIGHT);
  d.fill(60, 25, 14, 9, GREY); d.line(60, 25, 73, 25, LIGHT);
  d.fill(74, 27, 3, 5, DARK);
  /* The solar panels on their masts, above and below the hull */
  d.line(48, 21, 48, 23, GREY); d.line(48, 35, 48, 37, GREY);
  [[6, 15], [38, 15]].forEach(([y0, h]) => {
    d.fill(42, y0, 13, h, BLUE);
    for (let x = 42; x <= 54; x += 4) d.line(x, y0, x, y0 + h - 1, DARK);
    d.line(42, y0 + Math.floor(h / 2), 54, y0 + Math.floor(h / 2), DARK);
  });
}

function soyuz(d, nx) {
  /* Docking probe, orbital module, descent module, service module with
     its two solar wings on their booms */
  d.set(nx, 29, GREY);
  d.disc(nx + 3, 29, 2, GREY);
  d.fill(nx + 6, 27, 5, 5, LIGHT);
  d.fill(nx + 11, 26, 7, 7, GREY);
  d.line(nx + 14, 18, nx + 14, 25, GREY); d.line(nx + 14, 33, nx + 14, 40, GREY);
  d.fill(nx + 13, 18, 3, 6, BLUE); d.fill(nx + 13, 35, 3, 6, BLUE);
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
  obj("station", { free: true, whole: true }, () => station(d));
  const nx = nose(n);
  obj("soyuz", n >= DOCKED ? { touch: ["station"] } : { free: true, whole: true }, () => soyuz(d, nx));
  /* The names and flags: Czechoslovakia, white over red with a blue wedge
     at the hoist; Poland, white over red */
  d.fill(8, 55, 9, 3, LIGHT); d.fill(8, 58, 9, 3, RED);
  [2, 3, 4, 4, 3, 2].forEach((w, j) => d.line(8, 55 + j, 8 + w - 1, 55 + j, BLUE));
  d.text(19, 56, "REMEK", GREY);
  d.fill(48, 55, 9, 3, LIGHT); d.fill(48, 58, 9, 3, RED);
  d.text(59, 56, "HERMASZEWSKI", GREY);
}

module.exports = { id: "intercosmos", year: "1978", fps: FPS, frames: FRAMES, draw };
