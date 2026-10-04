#!/usr/bin/env node
/* Draws the blueprint sheets of the Design section (js/data/entries.js) as
   pixel SVGs in img/design/, 128 by 64 pixels like the camera pictures.

     node tools/design-drawings.js

   The raster and the label check are in tools/pixel-sheet.js. A label that
   touches a line, another label or the frame is reported, and the script
   exits with code 1. */
"use strict";
const fs = require("fs"), path = require("path");
const { sheet: newSheet, svg: toSvg } = require("./pixel-sheet");
const OUT = path.join(__dirname, "..", "img", "design");
/* Ground, grid, line, secondary line, dimension and label, hot or flagged
   part, section hatching */
const PAL = ["#0F2639", "#16314A", "#B4DFEF", "#6FA6C8", "#E8CF92", "#E07A5C", "#2C5677"];
const GROUND = 0, GRID = 1, LINE = 2, DIM = 3, NOTE = 4, HOT = 5, HATCH = 6;
function sheet(name) {
  return newSheet(name, { ground: GROUND, soft: [HATCH], grid: GRID, frame: DIM, dim: NOTE });
}
function svg(s, label) {
  return toSvg(s, label, PAL, GROUND);
}

/* The title block, bottom right; drawings keep clear of x 82 to 127, y 47
   to 63 */
function titleBlock(d, name, sheetNo) {
  d.clear(83, 48, 44, 15);
  d.box(83, 48, 44, 15, DIM);
  d.text(85, 50, name, LINE);
  d.text(85, 56, sheetNo, DIM);
}

/* A strip of mast face seen from the side: two rails and rungs */
function mastFace(d, x0, x1, y0, y1) {
  d.clear(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  d.line(x0, y0, x0, y1, LINE); d.line(x1, y0, x1, y1, LINE);
  for (let y = y0 + 3; y < y1; y += 5) d.line(x0 + 1, y, x1 - 1, y, DIM);
}
/* A track unit: a box with its links */
function tracks(d, x, y, w, h) {
  d.clear(x, y, w, h);
  d.box(x, y, w, h, LINE);
  if (w > h) { for (let i = x + 2; i < x + w - 2; i += 3) d.set(i, y + Math.floor(h / 2), DIM); }
  else { for (let j = y + 2; j < y + h - 2; j += 3) d.set(x + Math.floor(w / 2), j, DIM); }
}

const SHEETS = {
  /* Climb unit on the mast face: tracks with claws in the mast, the body,
     the tether to the mast spine */
  "cl-unit": ["CL-UNIT", "SHEET 1/1", (d) => {
    mastFace(d, 10, 24, 2, 46);
    tracks(d, 25, 12, 5, 26);
    d.clear(30, 14, 22, 22); d.box(30, 14, 22, 22, LINE);
    d.box(33, 17, 8, 5, DIM); d.text(43, 17, "N3", DIM);
    d.arc(44, 29, 3, LINE); d.set(44, 29, NOTE);
    [15, 22, 29, 35].forEach((y) => d.path([[24, y], [21, y], [21, y + 2]], HOT));
    d.path([[40, 13], [40, 6], [25, 6]], DIM);
    d.text(44, 4, "TETHER", DIM);
    d.text(4, 51, "CLAWS", HOT);
    d.dimV(56, 12, 37); d.text(60, 22, "1.1M", NOTE);
    d.text(60, 40, "340KG", NOTE);
  }],
  /* Weld unit alone, seen from the side: tracks with the clamp wheels that
     grip a rib from below, the body with its battery, the lamp, the arm with
     two joints ending in the fusion head and its hot tip, the tie press */
  "wd-unit": ["WD-UNIT", "SHEET 1/1", (d) => {
    tracks(d, 24, 38, 29, 5);
    [27, 49].forEach((x) => { d.line(x, 43, x, 45, LINE); d.disc(x, 46, 1, LINE); });
    d.clear(26, 24, 25, 14); d.box(26, 24, 25, 14, LINE);
    d.box(29, 27, 9, 7, DIM); d.fill(38, 29, 1, 3, DIM); d.text(41, 28, "6H", DIM);
    d.disc(25, 27, 1, NOTE); d.line(24, 26, 21, 19, LINE); d.disc(20, 18, 1, NOTE);
    d.line(20, 20, 20, 32, LINE);
    d.clear(18, 33, 7, 4); d.box(18, 33, 7, 4, NOTE); d.fill(20, 37, 3, 4, HOT);
    d.text(2, 31, "TIP", HOT); d.text(2, 37, "280K", HOT);
    d.line(51, 29, 57, 35, LINE);
    d.box(58, 34, 6, 6, NOTE);
    d.line(64, 35, 68, 35, NOTE); d.line(64, 38, 68, 38, NOTE);
    d.text(72, 34, "TIE PRESS", NOTE);
    d.fill(47, 22, 3, 2, NOTE);
    for (let i = 0; i < 3; i++) d.line(50, 22, 80, 16 + i * 3, NOTE);
    d.text(84, 18, "LAMP", NOTE);
    d.text(84, 25, "210KG", NOTE);
  }],
  /* Cut unit alone, seen from the side: the tracks it climbs with, the body
     with the camera that scores cracks, the disc saw on the upper arm, the
     heated wire stretched across a bow on the lower arm */
  "ct-unit": ["CT-UNIT", "SHEET 1/1", (d) => {
    tracks(d, 14, 14, 5, 25);
    d.clear(19, 16, 22, 20); d.box(19, 16, 22, 20, LINE);
    d.clear(21, 12, 6, 4); d.box(21, 12, 6, 4, LINE); d.fill(25, 13, 1, 2, NOTE);
    d.text(14, 4, "CAMERA", LINE);
    d.line(41, 16, 47, 11, LINE);
    d.arc(51, 7, 5, LINE); d.disc(51, 7, 1, DIM);
    d.text(60, 3, "DISC SAW", LINE);
    d.line(41, 30, 47, 33, LINE);
    d.path([[58, 28], [48, 28], [48, 38], [58, 38]], LINE);
    d.line(58, 29, 58, 37, HOT);
    d.text(62, 31, "HEATED WIRE", HOT);
    d.text(22, 40, "260KG", NOTE);
    d.text(4, 51, "SCORE 0.85", NOTE);
  }],
  /* Survey unit: six-wheeled body, camera mast, air sensor */
  "sv-unit": ["SV-UNIT", "SHEET 1/1", (d) => {
    d.line(2, 45, 81, 45, DIM);
    d.clear(30, 30, 40, 8); d.box(30, 30, 40, 8, LINE);
    [35, 50, 65].forEach((x) => { d.clear(x - 3, 38, 7, 7); d.arc(x, 41, 3, LINE); d.set(x, 41, DIM); });
    d.line(57, 29, 57, 17, LINE);
    d.clear(52, 10, 11, 7); d.box(52, 10, 11, 7, LINE); d.fill(59, 12, 2, 3, NOTE);
    d.line(38, 29, 38, 21, DIM); d.line(36, 21, 40, 21, DIM); d.set(38, 20, HOT);
    d.text(20, 19, "AIR", DIM);
    d.text(66, 11, "VIS+IR", NOTE);
    d.text(4, 51, "45KG", NOTE);
  }],
  /* Print unit on the mast top: gantry clamped to the mast, nozzle, tie
     spool, ice feed */
  "pr-unit": ["PR-UNIT", "SHEET 1/1", (d) => {
    d.clear(45, 22, 27, 26);
    d.line(45, 22, 45, 46, LINE); d.line(71, 22, 71, 46, LINE);
    for (let y = 30; y < 46; y += 3) d.line(46, y, 70, y, DIM);
    d.line(2, 47, 81, 47, DIM);
    d.clear(36, 10, 45, 8); d.box(36, 10, 45, 8, LINE);
    d.path([[36, 17], [36, 26], [44, 26]], LINE);
    d.path([[80, 17], [80, 26], [72, 26]], LINE);
    d.fill(56, 18, 5, 2, NOTE); d.fill(57, 20, 3, 2, HOT);
    d.arc(25, 13, 4, LINE); d.set(25, 13, DIM); d.line(30, 13, 35, 13, DIM);
    d.text(17, 20, "TIES", DIM);
    d.line(81, 13, 100, 13, DIM);
    d.text(102, 11, "ICE", DIM);
    d.text(4, 30, "0.6M", NOTE);
    d.text(4, 37, "LAYERS", NOTE);
    d.text(4, 51, "4M/DAY", NOTE);
  }],
  /* MAST-01 as built against its design, symmetric about column 40. The
     tower stops at 1 180 m; the dashed top was planned to 1 400 m with guy
     level 4. Three guy levels are tight. The 8 cables of level 4 were never
     raised: they were brought down, tied off at level 3, and hang slack. The
     AMBER vent sits on the built top. */
  "mast-01": ["MAST-01", "SHEET 1/4", (d) => {
    const top = 17, base = 46, edge = (y) => 32 + Math.round((base - y) * 6 / (base - top));
    d.line(2, base + 1, 81, base + 1, DIM);
    d.mirror(80, () => {
      d.line(32, base, 38, top, LINE);
      d.dash(38, 10, 39, 3, DIM);
      /* Tight guys of levels 1 to 3, each to its own anchor */
      const guys = [[39, 18], [31, 11], [24, 4]];
      guys.forEach((g) => d.line(edge(g[0]) - 1, g[0], g[1], base, DIM));
      /* The level 4 cables, brought down and tied off between the tower and
         the level 3 guy, hang in a loop below the straight line */
      const x0 = edge(24) - 1, x1 = x0 - 10, y1 = Math.round(24 + (base - 24) * (x0 - x1) / (x0 - 4)), pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push([Math.round(x0 + (x1 - x0) * t), Math.round(24 + (y1 - 24) * t + 5 * Math.sin(Math.PI * t))]);
      }
      d.path(pts, HOT);
      d.fill(38, 11, 2, 6, NOTE);
      /* The outrigger frame: its beam, a leg and a footing on each side;
         FOOTING-B is the east one */
      d.line(22, 36, 40, 36, LINE); d.line(22, 36, 22, 45, LINE); d.fill(20, 46, 5, 1, NOTE);
    });
    d.fill(40, 11, 1, 6, NOTE);
    d.line(39, top, 41, top, LINE);
    for (let y = top + 4; y < 40; y += 4) d.line(edge(y) + 1, y, 79 - edge(y), y, DIM);
    d.clear(35, 41, 11, 6); d.box(35, 41, 11, 6, NOTE);
    d.text(84, 3, "PLAN 1400M", DIM);
    d.text(84, 10, "BUILT 1180", LINE);
    d.text(84, 17, "VENT 14T", NOTE);
    d.text(84, 24, "L1-3 TIGHT", DIM);
    d.text(84, 31, "L4 SLACK", HOT);
    d.text(84, 38, "HALL-R", NOTE);
  }],
  /* Climbing crane: body clamped to the mast, truss jib, A-frame with its
     pendant to the jib, trolley hook */
  "crane-l": ["CRANE-L", "SHEET 1/1", (d) => {
    mastFace(d, 8, 20, 2, 46);
    d.clear(21, 18, 7, 11); d.box(21, 18, 7, 11, LINE);
    d.fill(19, 20, 2, 2, HOT); d.fill(19, 25, 2, 2, HOT);
    const yt = (x) => Math.round(18 - (x - 28) * 6 / 44), yb = (x) => Math.round(27 - (x - 28) * 13 / 44);
    d.line(28, 18, 72, 12, LINE); d.line(28, 27, 72, 14, LINE); d.line(72, 12, 72, 14, LINE);
    for (let x = 30; x < 62; x += 8) {
      d.line(x, yb(x) - 1, x + 4, yt(x + 4) + 1, DIM);
      d.line(x + 4, yt(x + 4) + 1, x + 8, yb(x + 8) - 1, DIM);
    }
    d.line(24, 17, 24, 4, LINE);
    d.line(25, 4, 66, yt(66) - 1, DIM);
    d.line(64, yb(64) + 1, 64, 31, DIM); d.clear(62, 32, 5, 3); d.box(62, 32, 5, 3, NOTE);
    d.dimH(28, 64, 42); d.text(40, 35, "30M", NOTE);
    d.text(69, 31, "4T", NOTE);
    d.text(84, 3, "STOW", HOT);
    d.text(84, 10, ">5M/S", HOT);
  }],
  /* Reactor in section: buried vessel in crust ice, hot and cold legs to
     the turbine generator on the surface */
  "reactor": ["REACTOR", "SHEET 1/2", (d) => {
    const surf = 14;
    d.hatch(1, surf + 1, 81, 46 - surf, HATCH);
    d.line(1, surf, 81, surf, LINE);
    d.clear(20, 26, 24, 20); d.box(20, 26, 24, 20, LINE);
    d.arc(32, 36, 6, HOT); d.arc(32, 36, 2, NOTE);
    d.clear(44, 29, 27, 3); d.clear(44, 40, 33, 3); d.clear(68, 15, 9, 27);
    d.path([[44, 30], [69, 30], [69, 13]], HOT);
    d.path([[44, 41], [75, 41], [75, 13]], DIM);
    d.clear(66, 4, 13, 10); d.box(66, 4, 13, 10, LINE);
    d.text(70, 6, "TG", NOTE);
    d.line(79, 8, 84, 8, NOTE);
    d.text(87, 6, "11MW EL", NOTE);
    d.clear(47, 32, 20, 8);
    d.text(48, 34, "48MW", HOT);
    d.clear(21, surf + 1, 7, 11); d.dimV(24, surf + 1, 25);
    d.text(28, 18, "12M", NOTE);
    d.text(4, 51, "SHIELD: CRUST ICE", DIM);
    d.text(4, 6, "SURFACE", DIM);
  }],
  /* EX-1 in plan: wells, reformer, liquid hydrogen tanks, air intake, CO2
     vent to the north, north arrow */
  "ex-1": ["EX-1", "SHEET 1/3", (d) => {
    d.clear(8, 12, 26, 16); d.box(8, 12, 26, 16, LINE); d.text(15, 18, "REF", NOTE);
    [49, 61, 73].forEach((x) => { d.clear(x - 5, 13, 11, 11); d.arc(x, 18, 5, LINE); d.set(x, 18, DIM); });
    d.line(34, 18, 43, 18, LINE); d.set(55, 18, LINE); d.set(67, 18, LINE);
    d.clear(6, 36, 22, 10); d.box(6, 36, 22, 10, DIM); d.text(10, 39, "WELL", DIM);
    d.line(17, 35, 17, 28, DIM);
    d.clear(90, 30, 19, 10); d.box(90, 30, 19, 10, LINE); d.text(94, 33, "AIR", NOTE);
    d.path([[89, 35], [38, 35], [38, 24], [34, 24]], DIM);
    d.line(21, 11, 21, 5, HOT); d.line(19, 7, 21, 5, HOT); d.line(23, 7, 21, 5, HOT);
    d.text(26, 3, "CO2", HOT);
    d.line(116, 14, 116, 4, LINE); d.line(114, 6, 116, 4, LINE); d.line(118, 6, 116, 4, LINE); d.text(115, 16, "N", LINE);
    d.text(44, 27, "LH2 180T", NOTE);
    d.text(44, 42, "LABEL: GREEN", HOT);
  }],
  /* AMBER part W: the vent stack on the mast top, its pipe down the mast,
     the hydrogen plume; symmetric about column 50 */
  /* AMBER part W in section, symmetric about column 41: the mast top cut
     below, its outer and inner wall and the deck; the vent duct rising from
     inside the mast through the deck, braced to it, with a rain cap; the
     valve on the duct; the hydrogen leaving under the cap */
  "amber-vent": ["AMBER-VENT", "SHEET 1/2", (d) => {
    d.mirror(82, () => {
      d.line(24, 45, 31, 22, LINE); d.line(28, 45, 34, 24, DIM);
      d.line(31, 22, 37, 22, LINE); d.line(34, 24, 37, 24, DIM);
      d.line(37, 5, 37, 45, NOTE);
      d.line(37, 14, 33, 21, NOTE);
      d.line(35, 4, 40, 4, NOTE);
      d.path([[38, 31], [41, 34], [38, 37], [38, 31]], HOT);
      d.dash(36, 3, 34, 2, HOT);
    });
    d.set(41, 4, NOTE);
    d.dash(22, 46, 60, 46, DIM);
    d.line(22, 5, 35, 5, DIM); d.line(22, 22, 29, 22, DIM);
    d.dimV(20, 5, 22); d.text(10, 12, "6M", NOTE);
    d.line(46, 12, 58, 12, NOTE); d.text(60, 10, "+14T", NOTE);
    d.line(46, 34, 58, 34, HOT); d.text(60, 32, "VALVE", HOT);
    d.text(54, 2, "H2 2T/YR", HOT);
    d.text(90, 2, "PART W", LINE);
    d.text(4, 51, "MAST-01 TOP", DIM);
  }],
  /* Bio cells: two stacks in series, fed from plots 3 and 6 */
  "bio-cell": ["BIO-CELL", "SHEET 1/1", (d) => {
    [18, 48].forEach((x) => {
      d.clear(x, 10, 18, 32); d.box(x, 10, 18, 32, LINE);
      for (let y = 14; y < 40; y += 4) d.line(x + 3, y, x + 14, y, NOTE);
      d.line(x + 8, 42, x + 8, 45, DIM);
    });
    d.line(2, 46, 81, 46, DIM);
    d.line(36, 26, 47, 26, LINE);
    d.line(66, 26, 74, 26, LINE);
    d.text(77, 24, "0.5KW", NOTE);
    d.text(15, 51, "PLOT 3", DIM); d.text(45, 51, "PLOT 6", DIM);
    d.text(18, 3, "C2H2+3H2", DIM);
  }],
  /* Dish toward Earth: reflector, feed on its struts, pedestal, beam */
  "uplink": ["UPLINK", "SHEET 1/1", (d) => {
    d.arc(60, 16, 30, LINE, 90, 180);
    d.arc(60, 16, 29, LINE, 95, 175);
    d.line(31, 17, 47, 27, DIM); d.line(59, 45, 49, 29, DIM);
    d.fill(47, 26, 3, 3, NOTE);
    d.dash(51, 25, 62, 14, NOTE); d.line(60, 14, 62, 14, NOTE); d.line(62, 14, 62, 16, NOTE);
    d.line(39, 38, 39, 46, LINE); d.line(33, 47, 45, 47, LINE);
    d.line(2, 48, 81, 48, DIM);
    d.text(66, 4, "TO EARTH", NOTE);
    d.text(66, 11, "X BAND", NOTE);
    d.text(66, 18, "64KBIT/S", NOTE);
    d.text(66, 25, "4M DISH", DIM);
  }],
  /* This terminal: CRT, keyboard, the case label with the serial */
  "selk-t01": ["SELK-T01", "SHEET 1/1", (d) => {
    d.clear(14, 2, 42, 26); d.box(14, 2, 42, 26, LINE);
    d.box(18, 5, 34, 18, DIM); d.text(21, 8, "SELK", NOTE); d.fill(21, 15, 3, 1, NOTE);
    d.fill(48, 24, 2, 2, HOT);
    d.clear(10, 29, 50, 7); d.box(10, 29, 50, 7, LINE);
    for (let x = 13; x < 57; x += 4) d.fill(x, 31, 2, 2, DIM);
    d.clear(3, 37, 93, 9); d.box(3, 37, 93, 9, NOTE);
    d.text(5, 39, "KTZBA0K6SB2KBR1CS5CE97", NOTE);
    d.text(64, 5, "36CM CRT", DIM);
    d.text(64, 12, "OS 7.2", DIM);
    d.text(64, 19, "64GB RAM", NOTE);
    d.text(64, 26, "WALL", DIM);
  }]
};

fs.mkdirSync(OUT, { recursive: true });
let problems = [];
Object.keys(SHEETS).forEach((file) => {
  const [name, no, draw] = SHEETS[file];
  const s = sheet(name);
  draw(s.d);
  titleBlock(s.d, name, no);
  problems = problems.concat(s.problems);
  fs.writeFileSync(path.join(OUT, file + ".svg"), svg(s, "Design drawing " + name + ", blueprint"));
});
if (problems.length) {
  console.log([...new Set(problems)].join("\n"));
  process.exitCode = 1;
}
console.log("wrote " + Object.keys(SHEETS).length + " drawings to img/design/");
