/* Timelapse, 2063 to 2079: Debrecen. On the left, the Great Reformed
   Church, yellow, its two towers with clock faces under green copper caps
   either side of the columned portico and its pediment. In the middle, a
   row of houses with red roofs; on the right, the research centre the
   federal grants paid for, a long block with ribbon windows. In front, the
   street, and below it, on its embankment, the high-speed line, where the
   trains pass in a flash. Under eco-socialist planning the street changes:
   at first both lanes are busy and the parking strip is full; in 2067 the
   near lane becomes a red bike lane and cyclists ride it; in 2070 a
   monorail is built along the street on pylons from the pavement, and in
   2074, found to obstruct the street, it is moved down to the rail line:
   the high-speed trains no longer run there, the corridor becomes a park
   with a hedge, shrubs, benches and a gravel path, and the monorail's
   guideway runs along the bottom of it; from 2072 the parking strip is
   planted with grass and flowers and trees are planted along the pavement,
   growing from saplings. From 2063, the year warming peaked after two
   decades of eco-socialist planning, solar panels spread over the roofs
   until by 2075 they cover them. Three days pass, over three seconds. */
"use strict";
const { year, night, sky, counter } = require("./lib/lapse");
const { GROUND, DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY, GREEN } = require("./palette");

const FPS = 8, FRAMES = 24, STREET = 44, RAIL = 59;
/* The street's changes: the near lane becomes a bike lane, the monorail
   is built over the street, the parking strip becomes a planted strip and
   trees are planted along the pavement; the monorail, found to obstruct
   the street, is moved to the rail line */
const BIKES = 2067, MONORAIL = 2070, GREENERY = 2072, MOVED = 2074;
/* The trees along the pavement, centred in the gaps between the
   buildings and between the buildings and the edges of the picture; the
   monorail's pylons, on the pavement too, clear of them */
const TREES = [7, 52, 80, 123], PYLONS = [3, 33, 61, 102], BEAM = 33;
/* Foliage: green with dark leaf shade in a checker */
const leaf = (x, y) => ((x + y) % 2 ? GREEN : DARK);
/* How much of the roofs the solar panels cover in a given year */
const covered = (y) => Math.max(0, Math.min(1, (y - 2063) / 12));
/* Whether the k-th of `total` roof pixels has its panel in year y; a
   fixed scattered order, so the panels spread over the roofs */
const panel = (k, total, y) => ((k * 37) % total) < Math.round(covered(y) * total);

function draw(fr, n) {
  const { d, obj } = fr, dark = night(n, FPS), y = year(n, FRAMES, 2063, 2079);
  sky(d, n, FPS, STREET);
  /* The ground, back to front: the pavement and its kerb, the far lane,
     the dashed median, the near lane (a red bike lane from 2067), the
     kerb, the parking strip (a planted strip with flowers from 2072), and
     to the bottom edge the fence of the high-speed line, its grassed
     verge, its rails and the embankment, which from 2074 are a park */
  obj("ground", { edge: true }, () => {
    d.line(1, STREET, 126, STREET, GREY); d.line(1, STREET + 1, 126, STREET + 1, LIGHT);
    d.fill(1, 46, 126, 2, DARK);
    d.fill(1, 48, 126, 1, DARK); for (let x = 3; x < 126; x += 6) d.line(x, 48, x + 2, 48, LIGHT);
    d.fill(1, 49, 126, 2, y >= BIKES ? RED : DARK);
    d.line(1, 51, 126, 51, GREY);
    if (y >= GREENERY) { d.fill(1, 52, 126, 2, GREEN); for (let x = 2; x < 126; x += 5) d.set(x, 52, (x >> 1) % 2 ? GOLD : RED); }
    else d.fill(1, 52, 126, 2, DARK);
    if (y < MOVED) {
      d.line(1, 54, 126, 54, GREY);
      d.fill(1, 55, 126, RAIL - 55, GREEN);
      d.line(1, RAIL, 126, RAIL, GREY);
      d.fill(1, RAIL + 1, 126, 62 - RAIL, DARK);
    } else {
      /* The park: a low hedge along its edge, lawn, clumps of shrubs and
         benches by a gravel path, and more lawn down to the monorail's
         guideway, drawn with the monorail */
      for (let x = 1; x < 127; x++) d.set(x, 54, leaf(x, 54));
      d.fill(1, 55, 126, 7, GREEN);
      for (let x = 6; x < 124; x += 16) for (let r = 55; r <= 56; r++) for (let cx = x; cx < x + 3; cx++) d.set(cx, r, leaf(cx, r));
      d.line(1, 58, 126, 58, LIGHT);
      for (let x = 13; x < 124; x += 32) d.line(x, 57, x + 2, 57, ORANGE);
    }
  });
  /* The Great Reformed Church: two towers, each with windows, a clock
     face and a green copper cap; between them the portico, its columns
     in front of the shaded wall, the entablature and the pediment */
  obj("church", { on: ["ground"] }, () => {
    [14, 43].forEach((x) => {
      d.fill(x, 16, 8, STREET - 16, GOLD);
      d.fill(x + 3, 19, 2, 2, LIGHT);
      for (let wy = 25; wy < STREET - 2; wy += 7) d.fill(x + 3, wy, 2, 3, dark ? ORANGE : DARK);
      d.line(x, 15, x + 7, 15, GREEN); d.line(x + 1, 14, x + 6, 14, GREEN); d.line(x + 2, 13, x + 5, 13, GREEN);
      d.line(x + 3, 12, x + 4, 12, GOLD);
    });
    d.fill(22, 34, 21, STREET - 34, dark ? ORANGE : DARK);
    for (let cx = 23; cx <= 41; cx += 3) d.line(cx, 34, cx, STREET - 1, LIGHT);
    d.line(22, 33, 42, 33, LIGHT);
    for (let r = 0; r < 6; r++) d.line(22 + 2 * r, 32 - r, 42 - 2 * r, 32 - r, r === 0 ? GOLD : r === 5 ? LIGHT : GOLD);
    for (let r = 1; r < 6; r++) { d.set(22 + 2 * r, 32 - r, LIGHT); d.set(42 - 2 * r, 32 - r, LIGHT); }
  });
  /* The houses, red roofs taking on solar panels */
  [54, 63, 72].forEach((x, i) => {
    obj("house " + (i + 1), { on: ["ground"] }, () => {
      d.fill(x, 38, 7, STREET - 38, LIGHT);
      [[x, x + 6, 37], [x + 1, x + 5, 36], [x + 2, x + 4, 35]].forEach(([a, b, r], j) => {
        for (let px = a; px <= b; px++) d.set(px, r, panel(px * 3 + j + i * 7, 15 * 3, y) ? BLUE : RED);
      });
      d.fill(x + 1, 40, 2, 2, dark ? GOLD : GREY); d.fill(x + 4, 40, 2, 2, dark && i !== 1 ? GOLD : GREY);
      d.fill(x + 3, 43, 1, STREET - 43, DARK);
    });
  });
  /* The research centre: a long block with ribbon windows, a flat roof
     taking on rows of panels */
  obj("research centre", { on: ["ground"] }, () => {
    d.fill(82, 24, 38, STREET - 24, LIGHT);
    for (let wy = 26; wy < STREET - 1; wy += 3) for (let wx = 84; wx < 118; wx++) d.set(wx, wy, dark && ((wx >> 2) + wy) % 3 === 0 ? GOLD : BLUE);
    d.line(82, 23, 119, 23, GREY);
    for (let px = 83; px < 119; px += 2) if (panel(px, 119, y)) d.set(px, 22, BLUE);
  });
  /* The high-speed train: a long white set with a blue window band and a
     wedge nose, flashing past along the line */
  const tx = ((n * 47) % 235) - 80, L = 76;
  if (y < MOVED && tx + L > 1 && tx < 127) obj("train", { on: ["ground"] }, () => {
    for (let r = 0; r < 3; r++) d.line(tx, 55 + r, tx + L - 3 + r, 55 + r, LIGHT);
    d.line(tx + 1, 56, tx + L - 3, 56, dark ? GOLD : BLUE);
    for (let b = 4; b < L - 4; b += 18) { d.set(tx + b, 58, GROUND); d.set(tx + b + 2, 58, GROUND); }
  });
  /* The parked cars filling the parking strip, until it is planted */
  if (y < GREENERY) obj("parked cars", { on: ["ground"], parts: true }, () => {
    for (let x = 2; x < 124; x += 5) if ((x * 7 + y) % 6) d.fill(x, 52, 3, 2, [RED, BLUE, LIGHT, GREY, ORANGE][Math.floor(x / 5) * 2 % 5]);
  });
  /* Traffic: at first both lanes busy; once the bike lane is painted, the
     far lane only, with fewer cars. Cars by day, streaks of light by
     night */
  obj("traffic", { free: true }, () => {
    const lanes = y < BIKES ? [[46, -1, 4], [49, 1, 4]] : [[46, -1, 2]];
    lanes.forEach(([lane, dir, count], k) => {
      for (let c = 0; c < count; c++) {
        const x = 1 + (((c * Math.floor(122 / count) + k * 17 + dir * n * 13) % 122) + 122) % 122;
        if (dark) d.line(x, lane + 1, Math.min(126, x + 6), lane + 1, dir > 0 ? GOLD : RED);
        else d.fill(x, lane, Math.min(4, 127 - x), 2, [RED, BLUE, ORANGE, LIGHT, GREY][(c + k * 2) % 5]);
      }
    });
  });
  /* The cyclists on the bike lane: a head, a body, two wheels; a lamp at
     night */
  if (y >= BIKES) [0, 1, 2].forEach((c) => {
    const dir = c === 1 ? -1 : 1, x = 2 + (((c * 41 + dir * n * 5) % 120) + 120) % 120;
    obj("cyclist " + (c + 1), { on: ["ground"] }, () => {
      d.set(x + 1, 47, ORANGE); d.set(x + 1, 48, BLUE);
      d.set(x, 49, GROUND); d.set(x + 2, 49, GROUND); d.set(x + 1, 49, BLUE);
      if (dark) d.set(dir > 0 ? x + 3 : x - 1, 49, GOLD);
    });
  });
  /* The trees along the pavement: saplings, then small crowns, then full
     ones */
  const age = y - GREENERY;
  if (age >= 0) TREES.forEach((x) => {
    obj("tree " + x, { on: ["ground"] }, () => {
      d.line(x, STREET - 3, x, STREET - 1, GREY);
      if (age < 3) { for (let cx = x - 1; cx <= x + 1; cx++) d.set(cx, STREET - 4, leaf(cx, STREET - 4)); d.set(x, STREET - 5, leaf(x, STREET - 5)); }
      else if (age < 6) { for (let r = STREET - 6; r <= STREET - 4; r++) for (let cx = x - 1; cx <= x + 1; cx++) d.set(cx, r, leaf(cx, r)); }
      else {
        for (let cx = x - 1; cx <= x + 1; cx++) { d.set(cx, STREET - 8, leaf(cx, STREET - 8)); d.set(cx, STREET - 4, leaf(cx, STREET - 4)); }
        for (let r = STREET - 7; r <= STREET - 5; r++) for (let cx = x - 2; cx <= x + 2; cx++) d.set(cx, r, leaf(cx, r));
      }
    });
  });
  /* The monorail car: red so it stands out, a row of windows, its
     bogies on the beam, which runs under its bottom row */
  const mx = ((n * 9 + 20) % 150) - 16, car = (top) => {
    d.line(mx + 1, top, mx + 14, top, RED);
    d.line(mx, top + 1, mx + 15, top + 1, RED);
    for (let wx = mx + 2; wx < mx + 14; wx += 3) d.line(wx, top + 1, wx + 1, top + 1, dark ? GOLD : LIGHT);
    d.line(mx, top + 2, mx + 15, top + 2, RED);
    d.set(mx + 3, top + 2, GROUND); d.set(mx + 12, top + 2, GROUND);
  };
  const carIn = mx + 15 >= 1 && mx <= 126;
  /* From 2070 to 2073 the monorail runs along the street: pylons on the
     pavement, the beam over the trees */
  if (y >= MONORAIL && y < MOVED) {
    obj("monorail", { on: ["ground"] }, () => {
      d.line(1, BEAM, 126, BEAM, GREY);
      PYLONS.forEach((x) => d.line(x, BEAM + 1, x, STREET - 1, GREY));
    });
    if (carIn) obj("monorail car", { on: ["monorail"] }, () => car(BEAM - 3));
  }
  /* From 2074 it runs along the old rail line instead, the high-speed
     trains gone from it and the corridor a park, its concrete guideway low
     along the bottom of the park */
  if (y >= MOVED) {
    obj("monorail", { edge: true, touch: ["ground"] }, () => d.line(1, 62, 126, 62, LIGHT));
    if (carIn) obj("monorail car", { on: ["monorail"] }, () => car(59));
  }
  counter(d, y);
}

module.exports = { id: "debrecen", year: null, fps: FPS, frames: FRAMES, draw };
