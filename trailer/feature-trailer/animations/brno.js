/* Timelapse, 2047 to 2063: Brno, two days.

   On the left, Petrov hill and the Cathedral of Saints Peter and Paul, its
   two slender spires side by side with the west front between them, and
   the nave behind. On the right, the Lesna estate: a renovated panel
   block, and beside it the site where the game's archive puts the first
   block built by robots. In front runs a boulevard: trees along the far
   pavement up to the renovated block, the two lanes of the far
   carriageway, a red and cream tram on its own grassed track, and the near
   carriageway. At night the Moon is up.

   - 2049 and 2050: the panel robot from the Brno research centre stands on
     its rails on the site, its supervisor beside it, a panel hanging from
     its boom over the empty plot, the stack of panels waiting;
   - 2051: the block rises under it, ten storeys in eleven weeks;
   - 2052: the robot is gone and the block is lived in, and saplings are
     planted on the bare side of the boulevard beside it;
   - 2058: the saplings are full trees;
   - 2061, the year of CESEA's robot assembly test on the Moon: from then a
     light shows on it. */
"use strict";
const { year, night, sky, counter } = require("./lib/lapse");
const { GROUND, DARK, LIGHT, RED, GOLD, BLUE, ORANGE, GREY, GREEN } = require("./palette");

const FPS = 8, FRAMES = 16, STREET = 46, RAIL = 58, STOREY = 3;
/* The trees along the far pavement, up to the renovated block, which has
   one in front of it; on the bare side by the building site more are
   planted as saplings once the robots' block is finished, and grow */
const TREES = [7, 21, 35, 49, 63], LATE = [91, 105, 119], PLANTED = 2052;
/* Foliage: green with dark leaf shade in a checker */
const leaf = (x, y) => ((x + y) % 2 ? GREEN : DARK);
/* The new block: its columns and how many storeys stand in a given year */
const B0 = 82, B1 = 102;
const storeys = (y) => (y < 2051 ? 0 : y === 2051 ? 6 : 10);

function draw(fr, n) {
  const { d, obj } = fr, dark = night(n, FPS), y = year(n, FRAMES, 2047, 2063);
  const site = y >= 2049 && y <= 2051, top = STREET - STOREY * storeys(y);
  sky(d, n, FPS, STREET);
  /* The boulevard to the bottom edge: the far pavement and its kerb, the
     far carriageway in two lanes with a dashed line between them, the
     tram's own track on a grassed bed between two kerbs, its rails, and
     the near carriageway, cut by the bottom of the picture */
  obj("boulevard", { edge: true }, () => {
    d.line(1, STREET, 126, STREET, GREY); d.line(1, STREET + 1, 126, STREET + 1, LIGHT);
    d.fill(1, STREET + 2, 126, 5, DARK);
    for (let x = 3; x < 126; x += 6) d.line(x, STREET + 4, x + 2, STREET + 4, LIGHT);
    d.line(1, 53, 126, 53, GREY);
    d.fill(1, 54, 126, 6, GREEN);
    d.line(1, RAIL, 126, RAIL, GREY);
    d.line(1, 60, 126, 60, GREY);
    d.fill(1, 61, 126, 2, DARK);
  });
  /* Petrov hill, flat on top */
  obj("hill", { on: ["boulevard"] }, () => {
    for (let r = 38; r < STREET; r++) {
      const half = 14 + (r - 38);
      d.line(Math.max(1, 24 - half), r, 24 + half, r, r === 38 ? GREY : DARK);
    }
  });
  /* The cathedral: two spires side by side, each a square tower with
     pinnacles at its corners and a tall needle, and the nave behind with
     its steep roof and pointed windows */
  obj("cathedral", { on: ["hill"] }, () => {
    [14, 19].forEach((cx) => {
      d.fill(cx - 1, 24, 3, 14, GREY);
      d.set(cx - 1, 23, GREY); d.set(cx + 1, 23, GREY);
      d.line(cx, 15, cx, 23, GREY); d.set(cx, 14, GOLD);
    });
    d.fill(16, 27, 2, 11, GREY); d.line(16, 34, 16, 37, dark ? GOLD : DARK);
    d.fill(21, 30, 15, 8, LIGHT);
    d.line(21, 29, 35, 29, GREY); d.line(22, 28, 34, 28, GREY);
    [24, 28, 32].forEach((wx) => { d.line(wx, 32, wx, 34, dark ? GOLD : DARK); });
  });
  /* The renovated panel block: insulated, its stairwells picked out in orange */
  obj("block A", { on: ["boulevard"] }, () => {
    d.fill(56, 22, 19, STREET - 22, LIGHT);
    d.line(58, 22, 58, STREET - 1, ORANGE); d.line(72, 22, 72, STREET - 1, ORANGE);
    for (let wy = 24; wy < STREET - 1; wy += STOREY) for (let wx = 60; wx < 71; wx += 2) d.set(wx, wy, dark && (wx * 3 + wy) % 4 === 0 ? GOLD : GREY);
  });
  /* The robots' block, storey by storey; lived in once finished */
  if (storeys(y)) obj("block B", { on: ["boulevard"] }, () => {
    d.fill(B0, top, B1 - B0 + 1, STREET - top, LIGHT);
    for (let wy = top + 1; wy < STREET - 1; wy += STOREY) for (let wx = B0 + 2; wx < B1 - 1; wx += 2) d.set(wx, wy, dark && y > 2051 && (wx * 5 + wy) % 3 === 0 ? GOLD : GREY);
  });
  if (site) {
    /* The tower robot on its rails: the lattice mast, the boom over the
       plot, the trolley */
    obj("robot", { on: ["boulevard"] }, () => {
      d.line(106, STREET - 1, 118, STREET - 1, GREY);
      d.line(110, 17, 110, STREET - 2, RED); d.line(112, 17, 112, STREET - 2, RED);
      for (let r = 20; r < STREET - 2; r += 4) d.set(111, r, RED);
      d.line(88, 17, 112, 17, RED);
      d.fill(90, 18, 4, 1, RED);
    });
    /* The panel it lowers, hanging from the trolley, above the top of
       what stands */
    obj("panel", { hangs: ["robot"] }, () => {
      const ptop = Math.min(30, top - 3);
      d.line(92, 19, 92, ptop - 1, GREY);
      d.fill(88, ptop, 9, 2, LIGHT);
    });
    /* The stack of panels and the supervisor */
    obj("stack", { on: ["boulevard"] }, () => { for (let i = 0; i < 3; i++) d.fill(119, STREET - 2 - i * 2, 8, 2, i % 2 ? GREY : LIGHT); });
    obj("supervisor", { on: ["boulevard"] }, () => { d.set(104, STREET - 4, GOLD); d.line(104, STREET - 3, 104, STREET - 1, GOLD); });
  }
  /* The tram, red with a cream band, on the rails, while it is in the picture */
  const tx = ((n * 11 + 30) % 150) - 18;
  if (tx + 15 >= 1 && tx <= 126) obj("tram", { on: ["boulevard"] }, () => {
    const x = tx;
    d.fill(x, RAIL - 4, 16, 3, RED); d.line(x + 1, RAIL - 3, x + 14, RAIL - 3, LIGHT);
    [2, 3, 12, 13].forEach((k) => d.set(x + k, RAIL - 1, GROUND));
  });
  /* The trees along the far pavement, a grey trunk under the crown; the
     late ones a sapling for the first years, then a small crown, then a
     full round one */
  TREES.concat(y >= PLANTED ? LATE : []).forEach((x) => {
    const age = LATE.includes(x) ? y - PLANTED : 99;
    obj("tree " + x, { on: ["boulevard"] }, () => {
      d.line(x, STREET - 3, x, STREET - 1, GREY);
      if (age < 3) { for (let cx = x - 1; cx <= x + 1; cx++) d.set(cx, STREET - 4, leaf(cx, STREET - 4)); d.set(x, STREET - 5, leaf(x, STREET - 5)); }
      else if (age < 6) { for (let r = STREET - 6; r <= STREET - 4; r++) for (let cx = x - 1; cx <= x + 1; cx++) d.set(cx, r, leaf(cx, r)); }
      else {
        for (let cx = x - 1; cx <= x + 1; cx++) { d.set(cx, STREET - 8, leaf(cx, STREET - 8)); d.set(cx, STREET - 4, leaf(cx, STREET - 4)); }
        for (let r = STREET - 7; r <= STREET - 5; r++) for (let cx = x - 2; cx <= x + 2; cx++) d.set(cx, r, leaf(cx, r));
      }
    });
  });
  /* Traffic: two lanes away to the left on the far carriageway, one to the
     right on the near; cars by day, streaks of light by night */
  obj("traffic", { free: true }, () => {
    [[STREET + 2, -1], [STREET + 5, -1], [61, 1]].forEach(([lane, dir], k) => {
      for (let c = 0; c < 2; c++) {
        const x = 1 + (((k * 37 + c * 63 + dir * n * (15 + k * 3)) % 122) + 122) % 122;
        if (dark) d.line(x, lane + 1, Math.min(126, x + 7), lane + 1, dir > 0 ? GOLD : RED);
        else d.fill(x, lane, Math.min(4, 127 - x), 2, [BLUE, LIGHT, ORANGE, GREY, RED, LIGHT][k * 2 + c]);
      }
    });
  });
  /* The Moon at night, with the light of the assembly test from 2061 */
  if (dark) obj("moon", { free: true, whole: true }, () => {
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (i * i + j * j <= 5) d.set(121 + i, 15 + j, LIGHT);
    if (y >= 2061) d.set(120, 16, GOLD);
  });
  counter(d, y);
}

module.exports = { id: "brno", year: null, fps: FPS, frames: FRAMES, draw };
