/* REPORT 1. The desk with the REPORT pane open under VIEW: REPORT 1 /
   SITE ORIGIN, four empty blanks, "0 of 4 filled", at the center. The
   pointer comes onto the page (recording G1, 30.9-32.4 s). */
"use strict";
(function () {
  const PATH = SIM.smooth(SIM.part([
    [0.0, 901.0, 413.7, "hand"],
    [0.3, 936.8, 487.6, "hand"],
    [0.317, 938.8, 491.7, "text"],
    [0.4, 990.3, 529.2, "text"],
    [0.483, 998.3, 539.7, "text"],
    [0.55, 1009.8, 552.7, "text"],
    [0.617, 1015.3, 565.2, "text"],
    [0.683, 1063.5, 600.0, "arrow"],
    [0.75, 1114.0, 640.0, "arrow"],
    [0.85, 1145.5, 676.0, "arrow"],
    [0.917, 1169.0, 726.5, "arrow"],
    [0.983, 1222.0, 775.5, "arrow"],
    [1.083, 1245.8, 789.0, "hand"],
    [1.183, 1271.3, 786.5, "hand"],
    [1.283, 1290.3, 798.0, "hand"],
    [1.35, 1361.5, 840.5, "arrow"],
    [1.433, 1389.0, 840.5, "arrow"],
    [1.517, 1394.5, 839.0, "arrow"],
    [1.583, 1432.5, 826.0, "arrow"],
    [1.65, 1451.5, 822.0, "arrow"],
    [1.717, 1457.5, 818.5, "arrow"],
    [1.783, 1478.5, 813.5, "arrow"],
    [1.8, 1478.5, 813.5, "arrow"]
  ], 0.3, 99, 0, 1));
  const parts = SIM.use("gp-report-0"), page = SIM.box(parts.q(".paper") || SIM.find("REPORT 1 / SITE ORIGIN").closest("div"));
  const view = [{ from: 0, aim: () => [page.x + 345, page.y + 135, 700] }];
  window.SHOT = {
    seconds: 1.6,
    seek(t) {
      SIM.camera(...SIM.operator(view, t));
      const p = SIM.track(PATH, t);
      SIM.cursor(SIM.hover((s) => SIM.track(PATH, s), t), p.x, p.y);
      SIM.effects(parts, t + 13, null);
    }
  };
})();
