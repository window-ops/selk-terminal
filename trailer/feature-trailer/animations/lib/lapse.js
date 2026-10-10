/* What the timelapse scenes share, after the game's own timelapse (the
   TROIKA.RUN ending, js/games/troika/ending.js): a large year counter
   centred at the top that counts every year, and day and night passing
   over the city, with windows lit at night. */
"use strict";
const { BIG } = require("../../../common/vendor/pixel-sheet");
const { SKY, GOLD } = require("../palette");

/* The year of frame n of a scene that runs from y0 to y1 over its frames:
   y0 on the first frame, y1 on the last, every year shown in between */
function year(n, frames, y0, y1) {
  return y0 + Math.round(n * (y1 - y0) / (frames - 1));
}
/* Whether frame n is in the night half of the day; one day per second */
function night(n, fps) {
  return n % fps >= fps / 2;
}
/* The sky: a texture by day, plain dark by night */
function sky(d, n, fps, bottom) {
  if (night(n, fps)) return;
  for (let y = 1; y < bottom; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
}
/* The counter: the year in the large 5 by 7 font, centred at the top,
   drawn pixel by pixel. Scenes keep the rows under it (to row 10) clear,
   as the label rule asks of labels. */
function counter(d, y) {
  const s = String(y), w = s.length * BIG.adv - (BIG.adv - BIG.w), x0 = 64 - Math.floor((w - 1) / 2);
  s.split("").forEach((ch, i) => {
    BIG.glyphs[ch].split(" ").forEach((row, r) => {
      for (let b = 0; b < BIG.w; b++) if (row[b] === "1") d.set(x0 + i * BIG.adv + b, 3 + r, GOLD);
    });
  });
}

module.exports = { year, night, sky, counter };
/* The counter on an RGB picture W pixels wide, for the scenes drawn with
   the game's camera pieces: the same font, colour and row, centred, on a
   dark plate in the colour given, half see-through, like a camera's
   timestamp, so it reads on the light sky of a Titan day */
function counterRGB(d, y, W, plate) {
  const s = String(y), w = s.length * BIG.adv - (BIG.adv - BIG.w), x0 = Math.floor(W / 2) - Math.floor((w - 1) / 2);
  d.R(x0 - 2, 1, w + 4, BIG.h + 4, plate, 0.6);
  s.split("").forEach((ch, i) => {
    BIG.glyphs[ch].split(" ").forEach((row, r) => {
      for (let b = 0; b < BIG.w; b++) if (row[b] === "1") d.P(x0 + i * BIG.adv + b, 3 + r, "#E3B25A");
    });
  });
}
module.exports.counterRGB = counterRGB;
