/* 56.25-59.25 s, STRUCTURE / STOPPED-REPAIRS in VIEW, on the game's desk.
   The camera starts on the table, moves in on "zone 14 flagged", then
   down to "26-02-2097 all supervisor woken". The Build column stays out
   of frame on the right. The cursor sweeps diagonally across the rows, as
   the player reads tables. */
"use strict";
(function () {
  const parts = SIM.use("desk-structure");
  SIM.camera(0, 0, 1920);
  const date = SIM.box(SIM.find("Date")), zone = SIM.box(SIM.find("zone 14 flagged")), woke = SIM.box(SIM.find("supervisor woken")), build = SIM.box(SIM.find("Build"));
  const edge = build.x - 10;
  const cam = [[0, date.x - 14, date.y - 100, 760], [1.3, zone.x - 150, zone.y - 50, 400], [1.7, zone.x - 150, zone.y - 50, 400], [3, date.x - 8, woke.cy - 200, 680]];
  const sweep = [[0, zone.x - 270, date.cy], [3, zone.x + 210, woke.cy + 40]];
  window.SHOT = {
    seconds: 3,
    seek(t) {
      const [x, y, w] = SIM.keyed(cam, t), [cx, cy] = SIM.keyed(sweep, t);
      SIM.cursor("arrow", cx, cy);
      SIM.effects(parts, t + 11, null);
      SIM.camera(Math.min(x, edge - w), y, w);
    }
  };
})();
