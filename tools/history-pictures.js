#!/usr/bin/env node
/* Draws the archive pictures of the History section (js/data/entries.js) as
   pixel SVGs in img/history/, 128 by 64 pixels like the camera pictures.

     node tools/history-pictures.js

   The pictures use a warm archive palette, to set them apart from the
   blueprints in img/design/. Each has its year at the top left. The raster
   and the label check are in tools/pixel-sheet.js. A label that touches a
   line, another label or the frame is reported, and the script exits with
   code 1. */
"use strict";
const fs = require("fs"), path = require("path");
const { sheet: newSheet, svg: toSvg, BIG } = require("./pixel-sheet");
const OUT = path.join(__dirname, "..", "img", "history");
/* Ground, sky texture, dark shape, light, red, gold, blue, Titan orange,
   gray */
const PAL = ["#191410", "#2A221C", "#4E4136", "#E8DCC4", "#C8433A", "#E3B25A", "#5B8BC4", "#D47F2C", "#9A8F84"];
const GROUND = 0, SKY = 1, DARK = 2, LIGHT = 3, RED = 4, GOLD = 5, BLUE = 6, ORANGE = 7, GREY = 8;
function sheet(name, opts) {
  return newSheet(name, Object.assign({ ground: GROUND, soft: [SKY], grid: null, frame: GREY, dim: GOLD }, opts || {}));
}
const year = (d, y) => d.text(4, 4, y, GOLD);

/* A faint texture over the sky, from row y0 to row y1 */
function sky(d, y0, y1, every) {
  for (let y = y0; y <= y1; y++) for (let x = 1; x < 127; x++) if ((x * 7 + y * 13) % every === 0) d.set(x, y, SKY);
}
/* A standing figure: head, body and legs, its feet on row y; the top of its
   head is row y - 13 */
function figure(d, x, y, c) {
  d.disc(x, y - 12, 1, c);
  d.fill(x - 1, y - 10, 3, 6, c);
  d.line(x - 1, y - 4, x - 1, y, c); d.line(x + 1, y - 4, x + 1, y, c);
}
/* A five-pixel star */
function star(d, x, y, c) {
  d.set(x, y, c); d.set(x - 1, y, c); d.set(x + 1, y, c); d.set(x, y - 1, c); d.set(x, y + 1, c);
}

/* "Citizen" in the 24 official languages of the Federation, in the order of
   the language codes BG, CS, DA, DE, EL, EN, ES, ET, FI, FR, GA, HR, HU, IT,
   LT, LV, MT, NL, PL, PT, RO, SK, SL, SV */
const CITIZEN = ["ГРАЖДАНИН", "OBČAN", "BORGER", "BÜRGER", "ΠΟΛΙΤΗΣ", "CITIZEN", "CIUDADANO", "KODANIK",
  "KANSALAINEN", "CITOYEN", "SAORÁNACH", "GRAĐANIN", "ÁLLAMPOLGÁR", "CITTADINO", "PILIETIS", "PILSONIS",
  "ĊITTADIN", "BURGER", "OBYWATEL", "CIDADÃO", "CETĂȚEAN", "OBČAN", "DRŽAVLJAN", "MEDBORGARE"];

const PICTURES = {
  /* The far right rises: a crowd under storm clouds, black and red flags,
     torches; the poles rest on the heads of the crowd */
  "2026-far-right": ["2026", (d) => {
    sky(d, 1, 40, 5);
    [[34, 12], [76, 9], [112, 13]].forEach((c) => {
      d.disc(c[0] - 6, c[1] + 2, 4, DARK); d.disc(c[0], c[1], 6, DARK); d.disc(c[0] + 7, c[1] + 2, 4, DARK);
    });
    for (let x = 4; x < 125; x += 5) figure(d, x, 62, x % 2 ? DARK : GREY);
    [29, 64, 99].forEach((x) => {
      d.line(x, 22, x, 48, LIGHT);
      d.fill(x + 1, 22, 12, 2, RED); d.fill(x + 1, 24, 12, 2, DARK);
    });
    [14, 44, 84, 114].forEach((x) => { d.line(x, 38, x, 48, LIGHT); d.fill(x - 1, 35, 3, 3, GOLD); });
    year(d, "2026");
  }],
  /* The climate general strikes: marchers under a banner for the 32-hour
     week, its poles held by the two marchers in red, the sun behind */
  "2034-climate-strikes": ["2034", (d) => {
    sky(d, 1, 44, 7);
    d.disc(110, 13, 6, GOLD);
    d.box(26, 18, 77, 15, RED); d.box(27, 19, 75, 13, RED);
    d.textC(64, 23, "32 HOURS", LIGHT);
    for (let x = 10; x < 124; x += 9) figure(d, x, 62, x === 28 || x === 100 ? RED : LIGHT);
    d.line(28, 33, 28, 48, LIGHT); d.line(100, 33, 100, 48, LIGHT);
    year(d, "2034");
  }],
  /* The Federation of Europe: twelve stars around FE */
  "2041-federation": ["2041", (d) => {
    sky(d, 1, 62, 9);
    d.ring(64, 32, 22, 12).forEach((p) => star(d, p[0], p[1], GOLD));
    d.arc(64, 32, 13, BLUE);
    d.textC(64, 30, "FE", LIGHT);
    d.text(84, 57, "FEDERATION", LIGHT);
    year(d, "2041");
  }],
  /* The 2044 Federal Parliament as a hemicycle: five rows of seats, each row
     evenly spaced along its arc, the groups as wedges by angle from left to
     right: European Left Alliance 54 %, Social Democrats and Greens 26 %,
     Liberal and Conservative Bloc 17 %, far right 3 % */
  "2044-election": ["2044", (d) => {
    sky(d, 1, 62, 11);
    /* Five arches, two pixels thick and three apart. The pixels of the left
       half are mirrored about column 64, so the shape is symmetric; each
       pixel takes its group from its angle, from left to right */
    const cx = 64, cy = 54, groups = [[0.54, RED], [0.80, ORANGE], [0.97, BLUE], [1, GREY]], px = new Set();
    [14, 19, 24, 29, 34].forEach((r) => {
      [r, r + 1].forEach((rr) => {
        const steps = Math.ceil(Math.PI * rr * 2);
        for (let i = 0; i <= steps; i++) {
          const t = Math.PI + (Math.PI / 2) * i / steps;
          const x = Math.round(cx + rr * Math.cos(t)), y = Math.round(cy + rr * Math.sin(t));
          px.add(x + "," + y); px.add((2 * cx - x) + "," + y);
        }
      });
    });
    px.forEach((k) => {
      const [x, y] = k.split(",").map(Number);
      /* Angle from -180 at the left end to 0 at the right end */
      let ang = Math.atan2(y - cy, x - cx);
      if (ang > 0) { ang = x < cx ? -Math.PI : 0; }
      const f = (ang + Math.PI) / Math.PI;
      d.set(x, y, groups.find((g) => f <= g[0])[1]);
    });
    d.textC(64, 49, "54%", RED);
    year(d, "2044");
  }],
  /* The Commission elected for the first time: a ballot with its mark
     going into the box; everything centered on column 64 */
  "2045-reforms": ["2045", (d) => {
    sky(d, 1, 62, 9);
    d.box(40, 30, 49, 30, LIGHT);
    d.line(57, 30, 71, 30, GROUND); d.line(57, 31, 71, 31, DARK);
    d.box(58, 8, 13, 22, LIGHT);
    d.line(61, 13, 67, 19, RED); d.line(67, 13, 61, 19, RED);
    d.line(61, 24, 67, 24, GREY);
    d.textC(64, 41, "COMMISSION", GOLD);
    d.textC(64, 49, "VOTE", LIGHT);
    year(d, "2045");
  }],
  /* A sídliště, a panel housing estate, after renovation: a long slab
     block in front with its stairwell columns in a new color, a longer slab
     and a point tower behind, solar roofs, trees between the blocks, a tram
     on the street. Stories are 3 pixels, windows 2 by 1 */
  "2047-eastern-europe": ["2047", (d) => {
    const ground = 56;
    sky(d, 1, ground - 1, 7);
    const block = (x, top, w, stairs) => {
      d.clear(x, top, w, ground - top); d.box(x, top, w, ground - top, LIGHT);
      d.line(x + 1, top - 1, x + w - 2, top - 1, BLUE);
      for (let y = top + 2; y < ground - 1; y += 3) for (let i = x + 2; i < x + w - 2; i += 4) {
        if (stairs.some((sx) => i >= sx - 1 && i <= sx + 2)) { continue; }
        d.fill(i, y, 2, 1, (i * 7 + y) % 5 ? GOLD : DARK);
      }
      stairs.forEach((sx) => d.fill(sx, top + 1, 2, ground - top - 2, ORANGE));
    };
    block(44, 20, 81, [66, 90, 114]);
    block(96, 6, 17, []);
    block(4, 30, 67, [18, 38, 58]);
    [[78, 49], [86, 51], [92, 48]].forEach((t) => { d.line(t[0], t[1] + 3, t[0], ground - 1, GREY); d.disc(t[0], t[1], 3, DARK); });
    d.line(1, ground, 126, ground, GREY);
    /* A low-floor tram on the street, in front of the blocks, and its rail
       set flush in the street under the ground line */
    d.line(1, ground + 1, 126, ground + 1, LIGHT);
    d.clear(24, ground - 4, 28, 4); d.box(24, ground - 4, 28, 4, RED);
    for (let x = 27; x < 49; x += 4) d.set(x, ground - 3, LIGHT);
    year(d, "2047");
  }],
  /* The panel robots on a building site, drawn about 1 pixel for 0.47 m, so
     a story of 2.8 m is 6 pixels; parts thinner than a pixel, such as the
     stacked panels, are drawn one pixel or more thick. The
     block, 30 m long in 6 m wall panels, has five stories done and the sixth
     half closed. Three robots and their supervisor: the tower robot on its
     rails lowers the next panel into the gap, the welding robot on the top
     slab joins the last panel, the carrier robot brings a panel from the
     stack */
  "2049-panel-robots": ["2049", (d) => {
    const ground = 53, storey = 6, panel = 13, x0 = 40;
    sky(d, 1, ground - 1, 7);
    d.line(1, ground, 126, ground, GREY);
    /* Five stories of five panels, a window in each */
    const top = ground - 5 * storey;
    d.clear(x0, top, 5 * panel + 1, ground - top); d.box(x0, top, 5 * panel + 1, ground - top, LIGHT);
    for (let f = 1; f < 5; f++) d.line(x0 + 1, top + f * storey, x0 + 5 * panel - 1, top + f * storey, LIGHT);
    for (let k = 1; k < 5; k++) d.line(x0 + k * panel, top + 1, x0 + k * panel, ground - 1, DARK);
    for (let f = 0; f < 5; f++) for (let k = 0; k < 5; k++) d.fill(x0 + k * panel + 5, top + f * storey + 2, 3, 3, GOLD);
    /* The sixth story: two panels set, a gap for the third */
    const t6 = top - storey;
    d.clear(x0, t6, 2 * panel + 1, storey); d.box(x0, t6, 2 * panel + 1, storey + 1, LIGHT);
    d.line(x0 + panel, t6 + 1, x0 + panel, top - 1, DARK);
    for (let k = 0; k < 2; k++) d.fill(x0 + k * panel + 5, t6 + 2, 3, 3, GOLD);
    /* The tower robot on its rails, its boom over the gap, the panel it
       lowers */
    d.line(18, ground - 1, 36, ground - 1, GREY);
    d.line(27, ground - 2, 27, 5, RED); d.line(29, ground - 2, 29, 5, RED);
    for (let y = 9; y < ground - 2; y += 4) d.line(28, y, 28, y + 1, RED);
    d.line(27, 5, 76, 5, RED);
    d.fill(70, 6, 5, 2, RED);
    d.line(71, 8, 71, 9, GREY); d.line(73, 8, 73, 9, GREY);
    const px = x0 + 2 * panel;
    d.clear(px, 10, panel + 1, storey); d.box(px, 10, panel + 1, storey, LIGHT); d.fill(px + 5, 12, 3, 2, GOLD);
    /* The welding robot on the top slab, at the edge of the last panel */
    d.fill(px + 2, t6 + 3, 4, 3, RED); d.set(px + 1, t6 + 2, RED); d.set(px, t6 + 2, GOLD);
    /* The carrier robot with a panel, and the stack */
    d.box(4, ground - 4, 14, 3, RED); d.set(6, ground - 1, GREY); d.set(15, ground - 1, GREY);
    d.box(4, ground - 4 - storey, panel + 1, storey, LIGHT);
    for (let i = 0; i < 3; i++) d.box(110, ground - 2 - i * 2, 14, 2, i % 2 ? GREY : LIGHT);
    /* The supervisor, 1.8 m tall */
    d.set(34, ground - 4, GOLD); d.line(34, ground - 3, 34, ground - 1, GOLD);
    year(d, "2049");
  }],
  /* CESEA: the launcher on its platform beside the gantry, and the
     headquarters in the constructivist manner, a banded tower with a radio
     mast and a slab cantilevered from it on a diagonal strut */
  "2052-cesea": ["2052", (d) => {
    sky(d, 1, 55, 6);
    d.line(1, 56, 126, 56, GREY);
    d.box(8, 50, 40, 4, LIGHT);
    d.line(11, 54, 11, 55, GREY); d.line(44, 54, 44, 55, GREY);
    d.mirror(56, () => {
      d.line(24, 16, 24, 49, LIGHT);
      d.line(24, 16, 27, 7, LIGHT);
      d.path([[24, 42], [20, 49], [24, 49]], LIGHT);
    });
    d.set(28, 6, LIGHT);
    d.line(25, 24, 31, 24, BLUE); d.line(25, 25, 31, 25, BLUE);
    d.line(12, 49, 12, 12, GREY); d.line(16, 49, 16, 12, GREY);
    for (let y = 14; y < 48; y += 4) d.line(13, y, 15, y + 2, GREY);
    d.line(17, 20, 23, 20, GREY);
    d.clear(104, 12, 15, 44); d.box(104, 12, 15, 44, LIGHT);
    for (let y = 16; y < 54; y += 4) d.line(106, y, 116, y, RED);
    d.line(111, 11, 111, 3, GREY); d.line(109, 5, 113, 5, GREY);
    d.clear(70, 30, 35, 10); d.box(70, 30, 35, 10, LIGHT);
    for (let x = 73; x < 101; x += 4) d.fill(x, 33, 2, 4, GOLD);
    d.clear(86, 44, 19, 12); d.box(86, 44, 19, 12, LIGHT);
    d.fill(93, 48, 5, 7, RED);
    d.line(70, 40, 85, 55, LIGHT);
    d.textC(87, 23, "CESEA", RED);
    year(d, "2052");
  }],
  /* Warming above pre-industrial, 2020 to 2097, as in the article's table:
     1.5 °C in 2030, 1.8 °C in 2045, the peak of 1.9 °C in 2063, then level.
     The axis runs from 1.0 to 2.0 °C; the rise in red, the level in gold */
  "2063-warming-peak": ["2063", (d) => {
    const X = (yr) => Math.round(17 + (yr - 2020) * 105 / 80), Y = (t) => Math.round(46 - (t - 1) * 32);
    d.line(16, 12, 16, 47, LIGHT); d.line(16, 47, 124, 47, LIGHT);
    [[2.0, "2.0"], [1.5, "1.5"], [1.0, "1.0"]].forEach((t) => { d.line(14, Y(t[0]), 15, Y(t[0]), LIGHT); d.text(2, Y(t[0]) - 2, t[1], GREY); });
    [2030, 2063, 2097].forEach((yr) => { d.line(X(yr), 48, X(yr), 49, LIGHT); d.textC(X(yr), 52, yr, GREY); });
    const pts = [[2020, 1.2], [2030, 1.5], [2045, 1.8], [2063, 1.9], [2080, 1.9], [2097, 1.88]].map((q) => [X(q[0]), Y(q[1])]);
    d.path(pts.slice(0, 4), RED); d.path(pts.slice(3), GOLD);
    pts.slice(1, 4).forEach((q, i) => d.fill(q[0] - 1, q[1] - 1, 3, 3, i === 2 ? GOLD : RED));
    d.text(X(2063) - 1, Y(1.9) - 9, "PEAK", GOLD);
    year(d, "2063");
  }],
  /* HX Holdings: a glass tower, and its relay mast with a dish open to the
     sky, a cable to the tower and the beam to the relay */
  "2071-hx-holdings": ["2071", (d) => {
    sky(d, 1, 62, 5);
    d.clear(48, 8, 31, 55); d.box(48, 8, 31, 55, GREY);
    for (let y = 26; y < 60; y += 4) d.line(50, y, 76, y, BLUE);
    d.textC(63, 14, "HX", RED);
    d.line(63, 7, 63, 2, GREY);
    d.line(98, 62, 102, 31, GREY); d.line(106, 62, 102, 31, GREY);
    for (let y = 40; y < 62; y += 6) { const w = Math.round((y - 31) * 4 / 31); d.line(102 - w, y, 102 + w, y, GREY); }
    d.arc(102, 22, 8, LIGHT, 0, 180);
    d.line(102, 29, 102, 17, LIGHT); d.fill(101, 15, 3, 2, GOLD);
    d.line(79, 58, 99, 58, GREY);
    d.dash(105, 14, 122, 3, RED);
    year(d, "2071");
  }],
  /* The Selk lab on Titan: a dome on the ground under the orange haze, a
     survey unit on the dunes */
  "2079-selk-lab": ["2079", (d) => {
    for (let y = 1; y < 40; y++) for (let x = 1; x < 127; x++) if ((x * 5 + y * 9) % (y < 20 ? 6 : 4) === 0) d.set(x, y, SKY);
    d.path([[1, 47], [20, 45], [28, 44], [60, 44], [72, 43], [100, 45], [126, 42]], ORANGE);
    d.clear(31, 31, 27, 13);
    d.arc(44, 44, 12, LIGHT, 180, 360);
    d.line(44, 32, 44, 24, GREY); d.fill(43, 23, 3, 1, GOLD);
    d.clear(81, 37, 14, 7);
    d.box(82, 38, 12, 4, GREY); d.disc(84, 43, 1, GREY); d.disc(91, 43, 1, GREY);
    d.text(70, 52, "SELK CRATER", ORANGE);
    year(d, "2079");
  }],
  /* The citizen pass of the Federation: its title, and the word for citizen
     in the 24 official languages, in alternating colors */
  /* The selection test: the test screen with its answers checked */
  "2091-test": ["2091", (d) => {
    d.box(30, 6, 68, 38, LIGHT);
    for (let i = 0; i < 5; i++) {
      d.line(36, 12 + i * 7, 84, 12 + i * 7, GREY);
      d.line(88, 12 + i * 7, 89, 13 + i * 7, GOLD); d.line(89, 13 + i * 7, 92, 10 + i * 7, GOLD);
    }
    d.line(64, 44, 64, 48, LIGHT); d.line(52, 49, 76, 49, LIGHT);
    d.textC(64, 54, "CESEA SELECTION", GREY);
    year(d, "2091");
  }],
  /* The front of the citizen pass, at 320 by 160 in the 5 by 7 font: the
     title centered in its band, photograph, the words CITIZEN PASS, number,
     issue year, validity, signature, the twelve stars. The pass carries its
     year as ISSUED, so it has no year in its corner. */
  "2091-pass-front": ["2091", (d) => {
    d.box(4, 4, 312, 152, BLUE);
    d.textC(160, 11, "FEDERATION OF EUROPE", LIGHT);
    d.line(5, 24, 314, 24, BLUE);
    /* The photograph: frame columns 16 to 86, head and shoulders centered on
       column 51, the shoulders down to the frame */
    d.box(16, 34, 71, 90, GREY); d.disc(51, 64, 14, GREY); d.fill(30, 84, 43, 39, GREY);
    d.text(100, 36, "CITIZEN PASS", GOLD);
    d.text(100, 56, "NO. FE-10421", LIGHT);
    d.text(100, 72, "ISSUED 2091", LIGHT);
    d.text(100, 88, "VALID TO 2101", LIGHT);
    d.line(100, 118, 210, 118, GREY); d.text(100, 126, "SIGNATURE", GREY);
    d.ring(262, 82, 32, 12).forEach((p) => {
      d.fill(p[0] - 1, p[1] - 1, 3, 3, GOLD); d.set(p[0], p[1] - 2, GOLD); d.set(p[0], p[1] + 2, GOLD); d.set(p[0] - 2, p[1], GOLD); d.set(p[0] + 2, p[1], GOLD);
    });
  }, { w: 320, h: 160, font: BIG }],

  /* The back of the citizen pass, at 320 by 160 in the 5 by 7 font: the word
     for citizen in the 24 official languages, each after its language code,
     in three columns in the order of the codes */
  "2091-pass-back": ["2091", (d) => {
    d.box(4, 4, 312, 152, BLUE);
    d.textC(160, 11, "FEDERATION OF EUROPE", LIGHT);
    d.line(5, 24, 314, 24, BLUE);
    const codes = ["BG", "CS", "DA", "DE", "EL", "EN", "ES", "ET", "FI", "FR", "GA", "HR", "HU", "IT", "LT", "LV", "MT", "NL", "PL", "PT", "RO", "SK", "SL", "SV"];
    codes.forEach((code, i) => {
      const x = 14 + Math.floor(i / 8) * 102, y = 34 + (i % 8) * 15;
      d.text(x, y, code, GREY);
      d.text(x + 18, y, CITIZEN[i], i % 2 ? GOLD : LIGHT);
    });
  }, { w: 320, h: 160, font: BIG }],

  /* Now: the Selk site to scale, 1 pixel for 25 m, with a scale bar. MAST-01
     rises 1 180 m with its lamp; the guy levels at 350, 700 and 1 050 m
     run to anchors at 0.7 times their height; CRANE-L is parked at 680 m; the outrigger frame,
     EX-1 with its stack and the frost north of it, and the shelter, as on
     the SV-4 camera of 11-03-2097 */
  "2097-now": ["2097", (d) => {
    const ground = 54, mx = 88, at = (m) => ground - Math.round(m / 25);
    for (let y = 1; y < 52; y++) for (let x = 1; x < 127; x++) if ((x * 3 + y * 11) % 7 === 0) d.set(x, y, SKY);
    /* The ground is two rows thick, so the band under it is seven rows and
       the scale bar sits in its middle */
    d.line(1, ground, 126, ground, ORANGE); d.line(1, ground + 1, 126, ground + 1, ORANGE);
    for (let y = ground + 2; y < 63; y += 2) for (let x = 2 + (y % 4); x < 127; x += 4) d.set(x, y, DARK);
    [350, 700, 1050].forEach((h) => {
      const r = Math.round(h * 0.7 / 25);
      d.line(mx - 1, at(h), mx - r, ground - 1, GREY); d.line(mx + 2, at(h), mx + 1 + r, ground - 1, GREY);
    });
    d.fill(mx, at(1180), 2, ground - at(1180), LIGHT);
    d.fill(mx, at(1180) - 2, 2, 2, RED);
    d.fill(mx - 3, at(680) - 1, 3, 3, GREY);
    d.line(mx - 8, at(150), mx + 9, at(150), LIGHT); d.line(mx - 8, at(150), mx - 8, ground - 1, LIGHT); d.line(mx + 9, at(150), mx + 9, ground - 1, LIGHT);
    d.box(20, at(100), 16, 4, GREY); d.line(32, at(100) - 1, 32, at(200), GREY);
    [23, 27].forEach((x) => d.set(x, at(100) + 2, GOLD));
    for (let x = 6; x < 18; x += 2) d.set(x, ground - 1, LIGHT);
    d.arc(114, ground - 1, 2, LIGHT, 180, 360);
    d.clear(78, 56, 48, 7);
    d.text(80, 57, "500 M", LIGHT);
    d.line(101, 59, 120, 59, LIGHT); d.line(101, 58, 101, 60, LIGHT); d.line(120, 58, 120, 60, LIGHT);
    year(d, "2097");
  }]
};

fs.mkdirSync(OUT, { recursive: true });
let problems = [];
Object.keys(PICTURES).forEach((file) => {
  const [y, draw, opts] = PICTURES[file];
  const s = sheet(file, opts);
  draw(s.d);
  problems = problems.concat(s.problems);
  fs.writeFileSync(path.join(OUT, file + ".svg"), toSvg(s, "Archive picture " + y + ", " + file.slice(5).replace(/-/g, " "), PAL, GROUND));
});
if (problems.length) {
  console.log([...new Set(problems)].join("\n"));
  process.exitCode = 1;
}
console.log("wrote " + Object.keys(PICTURES).length + " pictures to img/history/");
