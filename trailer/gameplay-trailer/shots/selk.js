/* SELK onto blank 1, from recording G2 (2.2-7.2 s) at its speed. The
   pointer goes to /site in FILES, shows the hand with drag dots over SELK
   and the grab hand on its grip, and drags it. The game's label follows the
   pointer as one piece, from the grip, the blanks show their outlines, the blank under the pointer lights. The camera
   follows the pointer a little behind it; once the drag starts it moves
   ahead to blank 1, where the label is going, and holds it with "SITE /
   SELK" in it. The drop lands on the blank's center. During the drag the trailer draws the game's grabbing hand. */
"use strict";
(function () {
  const RAW = SIM.part([
    [0.0, 897.0, 382.9, "text"],
    [0.05, 695.3, 311.3, "text"],
    [0.067, 628.0, 287.5, "arrow"],
    [0.15, 621.5, 273.0, "arrow"],
    [0.233, 604.0, 240.0, "arrow"],
    [0.3, 552.5, 180.0, "arrow"],
    [0.367, 485.8, 111.0, "handdrag"],
    [0.45, 458.3, 83.0, "handdrag"],
    [0.583, 458.3, 83.0, "handdrag"],
    [0.683, 455.3, 84.0, "handdrag"],
    [0.8, 447.8, 89.0, "handdrag"],
    [0.983, 446.8, 88.5, "handdrag"],
    [1.0, 447.3, 91.0, "handdrag"],
    [1.183, 447.3, 91.0, "handdrag"],
    [1.2, 445.8, 93.7, "grab"],
    [1.367, 445.8, 93.7, "grab"],
    [1.383, 437.8, 92.2, "grab"],
    [1.433, 435.3, 90.0, "handdrag"],
    [1.6, 434.8, 90.0, "handdrag"],
    [1.667, 441.3, 90.2, "grab"],
    [1.75, 443.3, 90.2, "grab"],
    [2.3, 442.8, 90.2, "grab"],
    [2.383, 483.0, 138.0, "drag"],
    [2.45, 537.0, 191.0, "drag"],
    [2.533, 561.0, 214.0, "drag"],
    [2.617, 577.0, 231.0, "drag"],
    [2.667, 629.0, 274.0, "drag"],
    [2.75, 706.0, 327.0, "drag"],
    [2.8, 821.0, 412.0, "drag"],
    [2.883, 944.0, 498.0, "drag"],
    [2.933, 991.0, 538.0, "drag"],
    [3.017, 1025.0, 573.0, "drag"],
    [3.083, 1069.0, 604.0, "drag"],
    [3.133, 1094.0, 627.0, "drag"],
    [3.217, 1099.0, 643.0, "drag"],
    [3.283, 1104.0, 659.0, "drag"],
    [3.333, 1105.1, 660.8, "drag"],
    [3.6, 1122.0, 689.0, "drag"],
    [3.683, 1123.2, 690.5, "drag"],
    [3.95, 1142.0, 715.0, "drag"],
    [4.0, 1143.4, 719.4, "drag"],
    [4.067, 1149.0, 737.0, "drag"],
    [4.3, 1149.0, 741.0, "drag"],
    [4.533, 1149.0, 755.0, "drag"],
    [4.967, 1148.0, 757.0, "drag"],
    [4.983, 1148.3, 751.5, "hand"],
    [5.1, 1148.3, 751.5, "hand"]
  ], 0, 99, 0, 1), DROP = 4.983;
  /* The drag starts where the grab ends: the label leaves from the grip */
  const START = RAW[RAW.findIndex((k) => k[3] === "drag") - 1][0];
  let PATH = SIM.smooth(RAW, [{ t: START, after: 0 }]);
  SIM.use("gp-report-1");
  const blank = SIM.box(document.querySelectorAll("#world .blank")[0]);
  /* The drop lands on blank 1's center */
  PATH = SIM.land(PATH, DROP, blank.cx, blank.cy);
  const view = [{ from: 0, dead: [0.3, 0.3], aim: (t) => {
    /* The camera follows the pointer and settles on the blank as the label
       comes near it, so the drag stays in view */
    const p = SIM.track(PATH, t), d = Math.hypot(p.x - blank.cx, p.y - blank.cy);
    const u = t < START ? 0 : t >= DROP ? 1 : Math.min(1, Math.max(0, 1 - (d - 60) / 260));
    return [p.x + (blank.cx + 40 - p.x) * u, p.y + (blank.cy - p.y) * u, 560, 1 - u];
  } }];
  let state = null, parts;
  window.SHOT = {
    seconds: 5.9,
    seek(t) {
      const want = t < DROP ? "gp-report-0" : "gp-report-1";
      if (want !== state) { parts = SIM.use(want); state = want; }
      SIM.camera(...SIM.operator(view, t));
      const p = SIM.leave(SIM.track(PATH, t), blank, DROP, t), dragging = t >= START && t < DROP;
      SIM.drag(dragging ? "SITE / SELK" : null, p.x, p.y);
      SIM.cursor(dragging || p.kind === "drag" ? "grabbing" : SIM.hover((s) => SIM.leave(SIM.track(PATH, s), blank, DROP, s), t), p.x, p.y);
      SIM.effects(parts, t + 15, null);
    }
  };
})();
