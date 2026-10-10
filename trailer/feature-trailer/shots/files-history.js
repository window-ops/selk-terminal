/* 11.5-16.5 s, FILES opens History. The game's desk, FILES active with
   STRUCTURE open. The camera holds on the lower part of the section list,
   below EXPORT, which stays out of frame: the cursor comes in and clicks
   HISTORY, the game's hover lighting the row under it; the listing opens
   the history. Cut to a close-up of the WRITTEN BY column, "CESEA
   archive" down the rows from 2026, the entry names and the later years
   out of frame; the camera eases in a little. */
"use strict";
(function () {
  const CLICK = 2.0, CUT = 2.5;
  let parts = SIM.use("desk-structure"), state = "structure";
  SIM.camera(0, 0, 1920);
  const hist = SIM.box(SIM.find("HISTORY")), exp = SIM.box(SIM.find("EXPORT"));
  SIM.use("desk-history");
  const wb = SIM.box(SIM.find("WRITTEN BY"));
  parts = SIM.use("desk-structure");
  const top = exp.y + exp.h + 3;
  const path = [[0, 340, top + 230], [0.4, 330, top + 215], [1.55, hist.x + 50, hist.cy + 1], [CLICK, hist.x + 46, hist.cy]];
  const close = [[CUT, wb.x + wb.w - 192, wb.y - 6, 200], [5, wb.x + wb.w - 178, wb.y - 2, 184]];
  window.SHOT = {
    seconds: 5,
    seek(t) {
      const want = t < CLICK ? "structure" : "history";
      if (want !== state) { parts = SIM.use("desk-" + want); state = want; }
      const [cx, cy] = SIM.keyed(path, t);
      const onRow = cx < 416 && cy > hist.y - 280 && cy < hist.y + hist.h + 23;
      SIM.cursor(t < CUT ? (onRow ? "hand" : "arrow") : null, cx, cy);
      SIM.effects(parts, t + 7, null);
      if (t < CUT) SIM.camera(0, top, 400);
      else { const [x, y, w] = SIM.keyed(close, t); SIM.camera(x, y, w); }
    }
  };
})();
