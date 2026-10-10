#!/usr/bin/env node
/* Draws the site camera pictures of the entries (js/data/entries.js) as
   pixel SVGs in img/, 128 by 64 pixels in the palette of the SV cameras.

     node tools/site-pictures.js

   MAST-01 follows its entries (structure/MAST-01, design/MAST-01,
   design/AMBER-VENT, structure/CRANE-L, structure/FOOTING-B): a printed ice
   shell tapering from 18 m to 6 m with a carbon fibre tie every 4 m, built
   to 1 180 m, rising out of HALL-R; an outrigger on each side, the east one
   on FOOTING-B over plot 9; three tight guy levels at 350, 700 and 1 050 m;
   the 8 cables of level 4, tied off at level 3, hanging slack; CRANE-L
   parked and stowed on the west face, its jib folded flat beside it; the
   AMBER vent on the built top, with the beacon. The ending scenes and
   WATCH draw the same tower (js/game/scenes.js, js/game/live.js). The
   raster is tools/pixel-sheet.js. */
"use strict";
const fs = require("fs"), path = require("path");
const { sheet: newSheet, svg: toSvg } = require("./pixel-sheet");
const OUT = path.join(__dirname, "..", "img");
const PAL = ["#A88D5C", "#B89C69", "#C7AB78", "#D3B988", "#DDC697", "#8A7048", "#7A6240", "#6A5437",
  "#3A3128", "#2A231C", "#4A4034", "#5C4D3A", "#E4DCC8", "#C7843A", "#B4553E", "#7FA07A",
  "#5A5046", "#4E453C", "#624E35", "#705A3C", "#C5A874", "#E2CFA2", "#8C7A5E"];
const [SKY0, SKY1, SKY2, SKY3, DUST, RIDGE, GROUND, GROUND2, DARK, DARKER, RIB, STEEL, PALE, AMBER, RED, CELL,
  CONCRETE, CONCRETE2, SOIL, SOIL2, HAZE, HAZE2, CABLE] = PAL.map((c, i) => i);
const HORIZON = 48;
/* Deterministic noise, so a picture is the same on every run */
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function sheet(name) { return newSheet(name, { ground: SKY1 }); }
function svg(s, label) { return toSvg(s, label, PAL, SKY1); }

/* Sky in four bands with a checker row between them, as the camera dithers */
function sky(d, bands, bottom) {
  const band = Math.ceil(bottom / 4);
  bands.forEach((c, i) => d.fill(0, i * band, d.w, band, c));
  for (let i = 1; i < 4; i++) for (let x = (i % 2); x < d.w; x += 2) d.set(x, i * band - 1, bands[i - 1]);
}
/* Dust in the air: specks, more of them lower down */
function dust(d, n, c, top, bottom, seed) {
  for (let i = 0; i < n; i++) {
    const y = Math.round(top + Math.pow(rnd(seed + i * 3), 0.6) * (bottom - top));
    d.set(Math.floor(rnd(seed + i * 3 + 1) * d.w), y, c);
  }
}
/* The far crater rim, the ground and its stones */
function ground(d, seed) {
  for (let x = 0; x < d.w; x++) {
    const h = Math.round(4 + 2 * Math.sin(x / 13 + 2) + 1.5 * Math.sin(x / 5 + seed));
    d.fill(x, HORIZON - h, 1, h, RIDGE);
  }
  d.fill(0, HORIZON, d.w, d.h - HORIZON, GROUND);
  d.fill(0, HORIZON + 9, d.w, d.h - HORIZON - 9, GROUND2);
  for (let x = 0; x < d.w; x += 2) d.set(x + ((x / 2) % 2), HORIZON + 8, GROUND2);
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rnd(seed + 50 + i) * d.w), y = HORIZON + 3 + Math.floor(rnd(seed + 70 + i) * 12), w = 2 + Math.floor(rnd(seed + 90 + i) * 3);
    d.fill(x, y, w, 1, RIDGE);
  }
}
/* A hallway along the ground, half under sand */
function corridor(d, x0, x1) {
  d.fill(x0, HORIZON - 3, x1 - x0, 3, DARK); d.fill(x0, HORIZON - 3, x1 - x0, 1, STEEL);
  for (let x = x0 + 2; x < x1; x += 4) d.set(x, HORIZON - 2, RIB);
  d.fill(x0, HORIZON - 1, x1 - x0, 1, RIDGE);
}
/* The lab: a low block, its windows dark once it is sealed */
function lab(d, x, lit) {
  d.fill(x, HORIZON - 8, 20, 8, DARK); d.fill(x + 2, HORIZON - 10, 16, 2, RIB);
  for (let i = 0; i < 4; i++) d.fill(x + 3 + i * 4, HORIZON - 6, 2, 2, lit ? AMBER : RIB);
  d.fill(x + 8, HORIZON - 3, 3, 3, lit ? PALE : RIB);
}

/* MAST-01 as one model, so that every picture of it shows the same tower:
   the wide view draws it pixel for pixel, and a close-up projects the same
   geometry larger. x is the axis column, h the pixels of the 1 180 m
   built; positions are in columns and in pixels above the foot (up). The
   shell is symmetric: odd widths centered on the axis, tapering in four even
   tiers from 9 pixels to 3, as 18 m to 6 m, the tiers of the design sheet.
   The cables and the outriggers keep the proportions of the design sheet
   (tools/design-drawings.js, MAST-01 drawn 29 pixels tall): the guy
   anchors 22, 29 and 36 out, the outrigger beam 10 up with its legs 18
   out, and the slack loop of level 4 tied 10 out on the level 3 guy,
   sagging 5. CRANE-L is stowed on the west face just above the level 2
   guys, its jib folded flat beside the body. Its body keeps the design
   sheet's proportions against the 5 pixel face: about half as wide and
   nearly as tall as the face is wide, 3 pixels by 4. bodyW, when given,
   sets another body width: the close-up keeps the 2 of its drawing. */
const SHEET_H = 29;
function halfWidth(up, h) { return 4 - Math.min(3, Math.floor(4 * up / h)); }
function mastModel(x, h, bodyW) {
  const k = h / SHEET_H, half = (up) => halfWidth(up, h);
  const levels = [350, 700, 1050].map((m) => Math.round(h * m / 1180));
  const anchors = [22, 29, 36].map((a) => Math.round(a * k));
  const guys = [], loops = [], outriggers = [];
  [-1, 1].forEach((side) => {
    levels.forEach((up, n) => guys.push([[x + side * (half(up) + 1), up], [x + side * anchors[n], 0]]));
    const up3 = levels[2], x0 = x + side * (half(up3) + 1), out = Math.round(10 * k), sag = 5 * k;
    const upTie = up3 - up3 * out / Math.abs(x + side * anchors[2] - x0), pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push([x0 + side * out * t, up3 + (upTie - up3) * t - sag * Math.sin(Math.PI * t)]);
    }
    loops.push(pts);
    outriggers.push({ side, up: Math.round(10 * k), leg: x + side * Math.round(18 * k) });
  });
  const bottom = levels[1] + 1, face = x - half(bottom);
  return { x, h, half, levels, guys, loops, outriggers,
    crane: { bottom, top: bottom + 3, body: [face - (bodyW || 3), face - 1], jib: face - (bodyW || 3) - 1, light: [face - 2, bottom + 2] } };
}
/* The wide view: the model drawn pixel for pixel, its foot on the ground */
function mast(d, x, h) {
  const m = mastModel(x, h), base = HORIZON - 1, row = (up) => base - Math.round(up);
  m.guys.forEach(([a, b]) => d.line(a[0], row(a[1]), b[0], row(b[1]), CABLE));
  m.loops.forEach((pts) => d.path(pts.map((p) => [Math.round(p[0]), row(p[1])]), CABLE));
  m.outriggers.forEach((o) => {
    const e = x + o.side * m.half(o.up);
    d.line(e, row(o.up), o.leg, row(o.up), DARK);
    d.line(o.leg, row(o.up), o.leg, base, DARK);
    d.fill(o.leg - 2, base - 1, 5, 2, CONCRETE);
  });
  for (let up = 0; up < h; up++) {
    const w = m.half(up);
    d.fill(x - w, base - up, 2 * w + 1, 1, up % 3 === 1 ? RIB : DARK);
  }
  /* The AMBER vent stack on the built top, and the beacon */
  d.fill(x, base - h - 2, 1, 3, STEEL);
  d.set(x, base - h - 3, RED);
  const c = m.crane;
  d.fill(c.body[0], row(c.top), c.body[1] - c.body[0] + 1, c.top - c.bottom + 1, STEEL);
  d.fill(c.jib, row(c.top), 1, c.top - c.bottom + 1, DARK);
  d.set(c.light[0], row(c.light[1]), AMBER);
  /* HALL-R round the foot: a low vault with its ribs */
  for (let i = -8; i <= 8; i++) {
    const hh = Math.round(4 * Math.sqrt(Math.max(0, 1 - (i / 8.5) * (i / 8.5))));
    if (hh > 0) d.fill(x + i, base - hh + 1, 1, hh, Math.abs(i) % 3 === 0 ? RIB : DARK);
  }
}
/* A close-up of the model, s times larger, centered on the column cx and
   the height cup of the wide view: the same shell, tie bands, cables and
   crane where the wide view has them, each drawn with the detail the
   nearer view shows. A wide-view pixel (column c, up u) covers the
   close-up square from ((c - left) * s, (top - u - 1) * s), s pixels a
   side. Cable ends run one pixel into the shell, so they meet the face. */
function closeUp(d, m, cx, cup, s) {
  const left = cx - d.w / s / 2, top = cup + d.h / s / 2;
  const X = (c) => (c - left) * s, Y = (u) => (top - u) * s;
  const centre = (p) => [X(p[0] + 0.5), Y(p[1] + 0.5)];
  const into = (p, q) => { const f = s / Math.abs(p[0] - q[0]); return [p[0] + (p[0] - q[0]) * f, p[1] + (p[1] - q[1]) * f]; };
  m.guys.forEach(([a, b]) => { const q = centre(b), p = into(centre(a), q); d.line(p[0], p[1], q[0], q[1], CABLE); });
  m.loops.forEach((pts) => { const c = pts.map(centre); d.path([into(c[0], c[1])].concat(c), CABLE); });
  for (let Yp = 0; Yp < d.h; Yp++) for (let Xp = 0; Xp < d.w; Xp++) {
    const xm = left + (Xp + 0.5) / s, um = top - (Yp + 0.5) / s, u = Math.floor(um);
    if (u < 0 || u >= m.h || Math.abs(xm - (m.x + 0.5)) > m.half(u) + 0.5) continue;
    d.set(Xp, Yp, u % 3 === 1 && um - u > 0.6 ? RIB : DARK);
  }
  const c = m.crane, bx0 = Math.round(X(c.body[0])), bx1 = Math.round(X(c.body[1] + 1)) - 1;
  /* The foot one row below the projection, and the top one row of plates
     (3 pixels) lower than it: five rows of plates with equal margins */
  const by0 = Math.round(Y(c.top + 1)) + 3, by1 = Math.round(Y(c.bottom));
  d.fill(bx0, by0, bx1 - bx0 + 1, by1 - by0 + 1, STEEL); d.box(bx0, by0, bx1 - bx0 + 1, by1 - by0 + 1, DARK);
  /* The plates; the first, top left, is the AMBER light */
  for (let y = by0 + 2; y < by1 - 1; y += 3) for (let xx = bx0 + 2; xx < bx1 - 2; xx += 3) d.fill(xx, y, 2, 2, y === by0 + 2 && xx === bx0 + 2 ? AMBER : RIB);
  for (let y = by0 + 2; y < by1; y += 3) d.fill(bx1 - 1, y, 2, 1, DARKER);
  const jx0 = Math.round(X(c.jib)), jx1 = Math.round(X(c.jib + 1)) - 1;
  d.fill(jx0, by0, jx1 - jx0 + 1, by1 - by0 + 1, STEEL); d.box(jx0, by0, jx1 - jx0 + 1, by1 - by0 + 1, DARK);
  for (let y = by0 + 1; y < by1 - 2; y += 4) d.line(jx0 + 1, y, jx1 - 1, y + 3, DARK);
}

const PICTURES = {
  /* MAST-01 in the equinox dust of 2097, at the center with its cables to
     their anchors on both sides; the corridor from the sealed lab, west
     of the picture, stops a few pixels short of HALL-R, as in the
     feature trailer */
  "mast-01": ["MAST-01 at Selk in equinox dust, pixel scene", (d) => {
    sky(d, [SKY0, SKY1, SKY2, SKY3], HORIZON);
    dust(d, 140, DUST, 2, HORIZON, 1);
    ground(d, 3);
    corridor(d, 0, 52);
    mast(d, 64, 43);
    dust(d, 40, HAZE2, HORIZON - 10, HORIZON + 4, 9);
  }],
  /* CRANE-L, close: the wide view's tower (mast-01) seen five times nearer,
     around the crane: the shell of the third tier stepping to the fourth
     above it, the tie bands, the level 2 guys leaving the face below the
     crane, the level 3 guys and the slack loops of level 4 passing above,
     and the crane stowed on the west face, its jib folded flat beside the
     body. Every position is the wide view's, projected */
  "crane-l": ["CRANE-L stowed on the mast face, pixel scene", (d) => {
    sky(d, [SKY0, SKY1, SKY2, SKY3], 64);
    dust(d, 90, DUST, 0, 64, 4);
    const m = mastModel(64, 43, 2), c = m.crane;
    closeUp(d, m, (c.jib + m.x + m.half(c.top) + 1) / 2, (c.bottom + c.top + 1) / 2, 5);
  }],
  /* FOOTING-B close, at the foot of the east outrigger: the leg comes down
     from the beam onto the footing, which sits on the paving over plot 9;
     below the ground, the regolith with the plot's probes and live cells */
  "footing-b": ["FOOTING-B resting on plot 9, cells in the regolith below, pixel scene", (d) => {
    sky(d, [SKY0, SKY1, SKY2, SKY3], 36);
    dust(d, 60, DUST, 0, 34, 7);
    for (let x = 0; x < 128; x++) { const h = Math.round(3 + 2 * Math.sin(x / 11) + Math.sin(x / 4)); d.fill(x, 36 - h, 1, h, RIDGE); }
    d.fill(0, 36, 128, 28, SOIL); d.fill(0, 36, 128, 2, GROUND);
    for (let y = 40; y < 64; y += 2) for (let x = (y / 2) % 2; x < 128; x += 2) d.set(x, y, SOIL2);
    /* The beam and the leg, then the footing on its paving */
    d.fill(0, 4, 70, 4, DARK); d.fill(0, 4, 70, 1, STEEL);
    d.fill(62, 8, 8, 22, DARK); d.fill(62, 8, 1, 22, STEEL);
    for (let y = 11; y < 29; y += 4) d.line(63, y, 68, y + 3, RIB);
    d.fill(46, 30, 40, 9, CONCRETE); d.fill(46, 30, 40, 1, CONCRETE2);
    for (let x = 50; x < 86; x += 6) d.fill(x, 31, 1, 8, CONCRETE2);
    d.fill(30, 37, 72, 2, CONCRETE2);
    /* A crack where the footing sinks */
    d.path([[80, 31], [78, 34], [81, 36], [79, 38]], DARKER);
    /* Plot 9 under the paving: its probes and the cells around them */
    for (let i = 0; i < 4; i++) { const px = 40 + i * 16; d.fill(px, 39, 1, 14, STEEL); d.set(px, 39, RED); }
    for (let i = 0; i < 40; i++) d.set(30 + Math.floor(rnd(200 + i) * 70), 44 + Math.floor(rnd(260 + i) * 18), CELL);
  }],
  /* The equinox storm of 2083 from the archive: the wind drives the dust
     from the west in streaks, thickest near the ground, and the far rim
     is gone in it. The lab, four years old, and its hallway show as gray
     shapes, the dust between them and the camera; only the lab's lit
     windows stand out. The roped plots are a few posts. MAST-01 was begun
     in 2089. */
  "storm": ["The lab in an equinox dust storm, 2083, pixel scene", (d) => {
    /* The air: darker above, the dust lighter and thicker towards the
       ground, in plain bands */
    const air = [SKY0, SKY1, SKY2, HAZE, DUST, HAZE2];
    for (let y = 0; y < 64; y++) {
      const k = Math.min(air.length - 1, Math.max(0, Math.round((y - 4) / 50 * (air.length - 1))));
      d.fill(0, y, 128, 1, air[k]);
    }
    /* The ground under the dust: dust at the foot of the air, earth
       nearer the camera */
    const earth = [DUST, HAZE, RIDGE];
    for (let y = HORIZON; y < 64; y++) {
      d.fill(0, y, 128, 1, earth[Math.min(earth.length - 1, Math.round((y - HORIZON) / 16 * (earth.length - 1)))]);
    }
    /* The wind: streaks of dust running east and a little down, more of
       them and longer near the ground */
    for (let i = 0; i < 110; i++) {
      const y = Math.floor(Math.pow(rnd(400 + i), 0.55) * 60), len = 3 + Math.floor(rnd(500 + i) * (4 + y / 6));
      const x = Math.floor(rnd(600 + i) * 140) - 10, c = y > 40 ? HAZE2 : rnd(700 + i) < 0.5 ? DUST : HAZE;
      for (let k = 0; k < len; k++) d.set(x + k, y + Math.floor(k / 6), c);
    }
    /* The hallway from the shelter, the lab, and the plots' posts, in the
       gray of things seen through dust */
    d.fill(0, HORIZON - 3, 40, 3, CABLE); d.fill(0, HORIZON - 3, 40, 1, HAZE);
    d.fill(40, HORIZON - 8, 20, 8, CABLE); d.fill(42, HORIZON - 10, 16, 2, CABLE);
    for (let i = 0; i < 4; i++) d.fill(43 + i * 4, HORIZON - 6, 2, 2, AMBER);
    d.fill(48, HORIZON - 3, 3, 3, HAZE2);
    for (let i = 0; i < 3; i++) { const px = 92 + i * 9; d.fill(px, HORIZON - 3, 1, 4, CABLE); }
    d.fill(92, HORIZON - 2, 19, 1, CABLE);
  }]
};

let problems = [];
Object.keys(PICTURES).forEach((file) => {
  const [label, draw] = PICTURES[file];
  const s = sheet(file);
  draw(s.d);
  problems = problems.concat(s.problems);
  fs.writeFileSync(path.join(OUT, file + ".svg"), svg(s, label));
});
if (problems.length) { console.log([...new Set(problems)].join("\n")); process.exitCode = 1; }
console.log("wrote " + Object.keys(PICTURES).length + " pictures to img/");
