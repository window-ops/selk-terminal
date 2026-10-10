/* BIO and LAB, from recording G2 (12.55-21.95 s) at its speed. The pointer
   clicks BIO and then LAB, the camera following it over FILES. Cut to VIEW,
   LAB and its picture at the center, for a moment of reading. Cut back:
   LAB is dragged onto blank 2, its label moving with the pointer from the
   grip, and held over the blank before the drop, as in the recording. The
   camera moves ahead to blank 2 once the drag starts and holds it. */
"use strict";
(function () {
  const SRC = [
    [0.0, 519.5, 363.5, "arrow"],
    [0.017, 474.0, 327.0, "arrow"],
    [0.083, 360.8, 248.5, "hand"],
    [0.167, 213.3, 152.5, "hand"],
    [0.25, 121.8, 111.0, "hand"],
    [0.317, 116.3, 106.5, "hand"],
    [0.383, 105.8, 103.5, "hand"],
    [0.45, 86.3, 98.0, "hand"],
    [0.517, 80.8, 101.5, "hand"],
    [0.583, 75.8, 113.0, "hand"],
    [0.783, 75.3, 116.0, "hand"],
    [1.117, 75.3, 116.0, "hand"],
    [1.133, 81.3, 118.5, "hand"],
    [1.183, 106.8, 129.5, "hand"],
    [1.25, 152.8, 141.0, "hand"],
    [1.317, 260.8, 148.0, "hand"],
    [1.383, 352.8, 154.0, "hand"],
    [1.45, 408.8, 154.0, "hand"],
    [1.517, 499.8, 147.5, "handdrag"],
    [1.6, 560.3, 138.5, "handdrag"],
    [1.683, 562.8, 135.5, "handdrag"],
    [1.75, 564.3, 130.0, "handdrag"],
    [1.817, 559.8, 119.0, "handdrag"],
    [1.9, 554.3, 114.0, "handdrag"],
    [1.983, 531.8, 105.5, "handdrag"],
    [2.233, 530.8, 105.5, "handdrag"],
    [2.25, 526.3, 103.0, "handdrag"],
    [2.383, 523.8, 103.0, "handdrag"],
    [2.633, 524.3, 100.5, "handdrag"],
    [3.417, 520.3, 101.5, "handdrag"],
    [3.433, 515.8, 102.5, "handdrag"],
    [3.483, 511.8, 102.5, "handdrag"],
    [3.683, 504.3, 104.0, "handdrag"],
    [3.75, 495.8, 105.0, "handdrag"],
    [3.833, 472.8, 105.0, "handdrag"],
    [3.9, 465.3, 105.0, "handdrag"],
    [5.0, 464.3, 103.5, "handdrag"],
    [5.017, 443.8, 92.5, "handdrag"],
    [5.1, 442.8, 94.7, "grab"],
    [6.083, 443.8, 94.7, "grab"],
    [6.167, 532.0, 109.0, "drag"],
    [6.217, 592.0, 135.0, "drag"],
    [6.3, 674.0, 198.0, "drag"],
    [6.383, 721.0, 227.0, "drag"],
    [6.583, 725.0, 235.0, "drag"],
    [6.833, 725.0, 235.0, "drag"],
    [7.25, 728.0, 252.0, "drag"],
    [7.483, 752.0, 298.0, "drag"],
    [7.55, 799.0, 361.0, "drag"],
    [7.633, 878.0, 401.0, "drag"],
    [7.717, 1059.0, 511.0, "drag"],
    [7.783, 1200.0, 616.0, "drag"],
    [8.017, 1238.0, 667.0, "drag"],
    [8.1, 1241.6, 673.8, "drag"],
    [8.25, 1261.0, 721.0, "drag"],
    [8.333, 1267.5, 736.5, "drag"],
    [9.317, 1266.3, 734.3, "drag"],
    [9.333, 1266.0, 734.0, "arrow"],
    [9.4, 1266.0, 734.0, "arrow"]
  ];
  const READ = 2.85, BACK = 4.35, FROM = 4.75;
  const RAW = SIM.part(SRC, 0, READ, 0, 1).concat(SIM.part(SRC, FROM, 99, BACK, 1));
  const BIO = 0.98, LAB = 2.78, DROP = BACK + 9.333 - FROM;
  /* The drag starts where the grab ends: the label leaves from the grip */
  const START = RAW[RAW.findIndex((k) => k[3] === "drag") - 1][0];
  /* The clicks on BIO and LAB, the grab on LAB's grip */
  let PATH = SIM.smooth(RAW, [[BIO], [LAB], { t: START, after: 0 }]);
  SIM.use("gp-lab");
  const entry = SIM.box(SIM.find("BIO / LAB", ".v-body *") || SIM.find("BIO / LAB")), pic = SIM.box(document.querySelector("#world .v-body img, #world img"));
  SIM.use("gp-report-2");
  const blank = SIM.box(document.querySelectorAll("#world .blank")[1]);
  /* The recording dropped LAB above blank 2, on the line of blank 1 as the
     snapshot lays the report out; the trailer aims the long move at blank
     2 from its start (SWEEP, after the pause in VIEW) and holds the label on
     the blank's center until the drop. The recording's hook before that
     move is left out, and so is its overshoot past the blank. */
  const SWEEP = BACK + 6.85 - FROM;
  PATH = SIM.land(PATH, DROP, blank.cx, blank.cy, DROP - SWEEP, DROP - 0.25);
  const follow = (t) => { const p = SIM.track(PATH, t); return [p.x, p.y, 560]; };
  const view = [
    { from: 0, dead: [0.3, 0.3], aim: follow },
    { from: READ, aim: () => [pic.cx, (entry.y + pic.y + pic.h) / 2 - 20, 740] },
    { from: BACK, dead: [0.3, 0.3], aim: (t) => {
      /* The camera follows the pointer and settles on the blank as the
         label comes near it, so the drag stays in view */
      const p = SIM.track(PATH, t), d = Math.hypot(p.x - blank.cx, p.y - blank.cy);
      const u = t < START ? 0 : t >= DROP ? 1 : Math.min(1, Math.max(0, 1 - (d - 60) / 260));
      return [p.x + (blank.cx + 40 - p.x) * u, p.y + (blank.cy - p.y) * u, 560, 1 - u];
    } }
  ];
  let state = null, parts;
  window.SHOT = {
    seconds: 9.6,
    seek(t) {
      const want = t < BIO ? "gp-report-1" : t < LAB ? "gp-bio" : t < DROP ? "gp-lab" : "gp-report-2";
      if (want !== state) { parts = SIM.use(want); state = want; }
      SIM.camera(...SIM.operator(view, t));
      const p = SIM.leave(SIM.track(PATH, t), blank, DROP, t), dragging = t >= START && t < DROP;
      SIM.drag(dragging ? "BIO / LAB" : null, p.x, p.y);
      /* No cursor while the camera reads LAB in VIEW */
      SIM.cursor(t >= READ && t < BACK ? null : dragging || p.kind === "drag" ? "grabbing" : SIM.hover((s) => SIM.leave(SIM.track(PATH, s), blank, DROP, s), t), p.x, p.y);
      SIM.effects(parts, t + 19, null);
    }
  };
})();
