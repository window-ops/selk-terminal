/* 1529-1569, Conrad Haas, Sibiu. A night room: through the window the
   Council Tower over the roofs of Sibiu; on the table a candle, an inkwell
   and the open manuscript. A hand comes in from the right and inks a
   three-stage rocket on the right page, stage by stage, the quill tip on
   the page at every frame. The left page holds lines of text. */
"use strict";
const { linePoints } = require("./lib/scene");
const { SKY, DARK, LIGHT, RED, GOLD, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 28;
/* The rocket on the right page: outline, the two stage joints, the fins,
   then the fire under it in red. Each stroke is inked in order. */
const STROKES = [
  [[[86, 41], [86, 33], [88, 31], [90, 33], [90, 41], [86, 41]], DARK],
  [[[86, 38], [90, 38]], DARK],
  [[[86, 35], [90, 35]], DARK],
  [[[86, 41], [84, 43]], DARK],
  [[[90, 41], [92, 43]], DARK],
  [[[88, 42], [88, 44]], RED]
];
/* Every inked pixel in order, with its colour */
const INK = [];
STROKES.forEach(([pts, c]) => {
  for (let i = 1; i < pts.length; i++) {
    linePoints(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]).forEach((p, k) => {
      if (i > 1 && k === 0) return;
      INK.push([p[0], p[1], c]);
    });
  }
});
const INK_FROM = 2, INK_TO = 24;

function draw(f, n) {
  const { d, obj } = f;
  /* The wall behind, a soft texture */
  for (let y = 1; y < 46; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
  /* The view: night sky, roofs, the Council Tower standing on them */
  d.clear(9, 13, 28, 24);
  obj("stars", { free: true }, () => { [[12, 15], [30, 16], [34, 21], [26, 14]].forEach((p) => d.set(p[0], p[1], GREY)); });
  obj("roofs", { on: ["window"] }, () => {
    d.fill(9, 32, 28, 5, DARK);
    [[11, 31], [12, 30], [13, 31], [28, 31], [29, 30], [30, 29], [31, 30], [32, 31]].forEach((p) => d.set(p[0], p[1], DARK));
  });
  obj("tower", { on: ["roofs"] }, () => {
    d.fill(16, 19, 5, 13, DARK);
    d.line(16, 18, 20, 18, DARK); d.line(17, 17, 19, 17, DARK); d.set(18, 16, DARK); d.set(18, 15, DARK);
    d.set(15, 19, DARK); d.set(21, 19, DARK);
    d.set(18, 22, GOLD);
  });
  obj("window", { mounted: true }, () => {
    d.box(8, 12, 30, 26, GREY);
    d.line(23, 13, 23, 36, GREY); d.line(9, 24, 36, 24, GREY);
  });
  /* The floor and the table on it */
  obj("floor", { edge: true }, () => { d.line(1, 60, 126, 60, GREY); });
  obj("table", { on: ["floor"] }, () => {
    d.fill(4, 46, 120, 2, DARK);
    d.fill(8, 48, 2, 12, DARK); d.fill(118, 48, 2, 12, DARK);
  });
  /* The open manuscript: two pages and the spine, lines of text on the left */
  obj("book", { on: ["table"] }, () => {
    d.fill(50, 30, 25, 16, LIGHT); d.fill(76, 30, 25, 16, LIGHT);
    d.line(75, 30, 75, 45, DARK);
    for (let y = 33; y <= 42; y += 3) {
      [[53, 59], [61, 66], [68, 71]].forEach((w, i) => { if (!(y === 42 && i === 2)) d.line(w[0], y, w[1], y, GREY); });
    }
  });
  /* The candle on its dish */
  obj("candle", { on: ["table"] }, () => {
    d.line(36, 45, 44, 45, GREY);
    d.fill(39, 38, 3, 7, LIGHT);
    d.set(40, 37, DARK);
  });
  /* The flame on the wick: an orange root and a gold body that leans and
     grows a pixel at a time */
  obj("flame", { touch: ["candle"] }, () => {
    const lean = [0, 0, 1, 0, -1, 0][n % 6], tall = n % 3 === 1 ? 1 : 0;
    d.set(40, 36, ORANGE); d.set(40 + lean, 35, GOLD); d.set(40 + lean, 34, GOLD);
    if (tall) d.set(40 + lean, 33, GOLD);
  });
  obj("inkwell", { on: ["table"] }, () => {
    d.fill(105, 41, 5, 5, DARK); d.line(106, 40, 108, 40, DARK);
  });
  /* The rocket inked so far */
  const k = Math.max(0, Math.min(INK.length, Math.round((n - INK_FROM) / (INK_TO - INK_FROM) * INK.length)));
  if (k > 0) obj("ink", { touch: ["book"], parts: true }, () => { INK.slice(0, k).forEach((p) => d.set(p[0], p[1], p[2])); });
  /* The quill at the last inked pixel, held by the hand, the arm coming in
     from the right edge */
  const tip = k > 0 ? INK[k - 1] : INK[0];
  const tx = tip[0], ty = tip[1] - (k > 0 ? 0 : 0);
  obj("quill", { touch: ["book", "arm"] }, () => {
    d.line(tx, ty, tx + 9, ty - 9, GREY);
    d.line(tx + 6, ty - 7, tx + 8, ty - 9, LIGHT);
  });
  /* A dark sleeve, a grey cuff at the wrist, the hand lit by the candle,
     closed round the quill. Sleeve, cuff and hand touch without a gap, and
     every part shows against the page. */
  obj("arm", { edge: true }, () => {
    const hx = tx + 3, hy = ty - 3;
    for (let j = 0; j < 4; j++) d.line(hx + 4, hy + j - 1, 126, 19 + j, DARK);
    d.line(hx + 3, hy - 1, hx + 3, hy + 2, GREY);
    d.fill(hx, hy - 1, 3, 3, ORANGE);
    d.line(hx + 1, hy + 2, hx + 2, hy + 2, ORANGE);
  });
}

module.exports = { id: "haas", year: "1529-1569", fps: FPS, frames: FRAMES, draw };
