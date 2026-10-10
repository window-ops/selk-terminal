/* 1981, Dumitru Prunariu, Soyuz 40, back to Earth on 22 May on the steppe
   of Kazakhstan. The scorched descent module comes down under its striped
   parachute at a steady rate; just above the ground its soft-landing
   engines fire, dust blows out to both sides, and it sets down. The
   parachute then collapses and drifts down beside it. In the top right,
   PRUNARIU and the Romanian flag of 1981: blue, yellow and red, with a
   mark for the coat of arms it carried until 1989.

   The capsule hangs from the shroud lines, which touch it and the canopy;
   once down it stands on the ground. The canopy is free in the air and
   rests on the ground once it lands. */
"use strict";
const { SKY, DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY } = require("./palette");

const FPS = 8, FRAMES = 18, TOUCH = 12, GROUND = 52;
/* The column the capsule comes down on, left of the caption */
const CX = 58;
/* The bottom row of the capsule: a steady descent, then on the ground */
const bottom = (n) => (n < TOUCH ? 30 + Math.round((GROUND - 1 - 30) * n / (TOUCH - 1)) : GROUND - 1);
/* The canopy: above the capsule while it carries it, then collapsing,
   flattening and drifting to the right until it lies on the ground */
function canopy(n) {
  const by = bottom(n);
  if (n < TOUCH) return { cx: CX, rim: by - 22, h: 6, half: 15 };
  const k = Math.min(1, (n - TOUCH + 1) / 5);
  return { cx: CX + Math.round(16 * k), rim: Math.round(by - 22 + k * 22), h: Math.max(1, Math.round(6 - 5 * k)), half: Math.round(15 - 3 * k) };
}

function draw(fr, n) {
  const { d, obj } = fr;
  for (let y = 1; y < GROUND; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % 5 === 0) d.set(x, y, SKY);
  obj("ground", { edge: true }, () => {
    d.line(1, GROUND, 126, GROUND, GREY);
    d.fill(1, GROUND + 1, 126, 62 - GROUND, DARK);
    for (let x = 3; x < 126; x += 5) d.set(x, GROUND + 2 + (x % 3), SKY);
  });
  const by = bottom(n), c = canopy(n);
  /* The capsule: a scorched bell, its hatch on top */
  obj("capsule", n < TOUCH ? { hangs: ["lines"] } : { on: ["ground"] }, () => {
    [3, 5, 5, 7, 7, 7].forEach((w, i) => d.line(CX - (w - 1) / 2, by - 5 + i, CX + (w - 1) / 2, by - 5 + i, i < 2 ? GREY : DARK));
    d.set(CX - 1, by - 2, GREY); d.set(CX + 2, by - 1, GREY);
  });
  /* The canopy, a striped dome on its rim */
  const landed = c.rim >= GROUND - 1;
  obj("canopy", landed ? { on: ["ground"] } : { free: true, whole: true }, () => {
    for (let x = -c.half; x <= c.half; x++) {
      const top = c.rim - Math.round(c.h * Math.sqrt(Math.max(0, 1 - (x / c.half) * (x / c.half))));
      const col = Math.floor((x + c.half) / 5) % 2 ? LIGHT : ORANGE;
      for (let y = top; y <= Math.min(c.rim, GROUND - 1); y++) d.set(c.cx + x, y, col);
    }
  });
  /* The shroud lines from the hatch to the rim of the canopy */
  obj("lines", { touch: ["capsule", "canopy"], parts: true }, () => {
    [-c.half, -Math.round(c.half / 2), Math.round(c.half / 2), c.half].forEach((dx) => {
      d.line(CX, by - 6, c.cx + dx, Math.min(c.rim + 1, GROUND - 1), GREY);
    });
  });
  /* The soft-landing engines fire just before touchdown; dust blows out */
  if (n === TOUCH - 1) obj("retro flash", { touch: ["capsule"] }, () => {
    d.line(CX - 3, by + 1, CX + 3, by + 1, GOLD); d.set(CX, by + 1, LIGHT);
  });
  if (n >= TOUCH - 1 && n < TOUCH + 4) obj("dust", { free: true }, () => {
    const g = n - TOUCH + 2;
    for (let k = 0; k < 3; k++) {
      const off = 6 + k * 4 + g * 2, r = Math.max(1, 3 - Math.floor(g / 2) - (k === 2 ? 1 : 0));
      d.disc(CX - off, GROUND - 1, r, GREY); d.disc(CX + off, GROUND - 1, r, GREY);
    }
  });
  /* The flag of 1981 and the name */
  d.fill(80, 3, 3, 6, BLUE); d.fill(83, 3, 3, 6, GOLD); d.fill(86, 3, 3, 6, RED);
  d.set(84, 5, DARK); d.set(84, 6, DARK);
  d.text(92, 4, "PRUNARIU", GREY);
}

module.exports = { id: "prunariu", year: "1981", fps: FPS, frames: FRAMES, draw };
