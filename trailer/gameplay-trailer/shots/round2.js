/* The second round. REPORT 2 / WHAT IS FAILING opens beside REPORT 1,
   the camera on its title. Cut to the page filled from STRUCTURE: the frame
   holds SUBMIT PAGE and "4 of 4 filled", its top edge under blank 4, and
   the pointer comes in and clicks (recording G4, 41.4-42.2 s). REPORT 2's
   blanks stay out of frame. */
"use strict";
(function () {
  const A = 1.6;
  /* The click on SUBMIT PAGE (recording G4, 42.02 s) */
  const PATH = SIM.smooth(SIM.part([
    [0.0, 1241.0, 913.0, "drag"],
    [0.033, 1241.0, 916.0, "drag"],
    [0.15, 1241.0, 916.0, "drag"],
    [0.233, 1228.0, 870.0, "drag"],
    [0.3, 1223.6, 864.2, "drag"],
    [0.367, 1206.0, 841.0, "drag"],
    [0.7, 1206.0, 841.0, "drag"],
    [0.717, 1206.3, 837.0, "hand"],
    [0.8, 1172.3, 838.5, "hand"],
    [0.883, 1064.0, 841.0, "arrow"],
    [0.967, 1023.5, 843.0, "arrow"],
    [1.05, 1006.0, 850.5, "arrow"],
    [1.117, 982.0, 859.0, "arrow"],
    [1.183, 968.5, 865.5, "arrow"],
    [1.25, 961.8, 881.0, "hand"],
    [1.55, 960.8, 880.5, "hand"],
    [1.567, 963.3, 880.5, "hand"],
    [1.6, 963.3, 880.5, "hand"]
  ], 0.8, 99, A + 0.35, 1), [[A + 0.35 + 42.02 - 40.6 - 0.8]]);
  let parts = SIM.use("gp-rejected-page");
  const button = SIM.box(SIM.find("SUBMIT PAGE", "button")), blank4 = SIM.box(document.querySelectorAll("#world .blank")[3]);
  parts = SIM.use("gp-report2");
  const title = SIM.textBox("REPORT 2 / WHAT IS FAILING"), blank1 = SIM.box(parts.q(".blank"));
  const view = [
    { from: 0, bottom: blank1.y - 4, aim: () => [title.cx, title.cy - 20, 330] },
    { from: A, top: blank4.y + blank4.h + 3, aim: () => [button.cx + 60, button.cy, 380] }
  ];
  let state = null;
  window.SHOT = {
    seconds: A + 1.6,
    seek(t) {
      const want = t < A ? "gp-report2" : "gp-rejected-page";
      if (want !== state) { parts = SIM.use(want); state = want; }
      SIM.camera(...SIM.operator(view, t));
      const p = t >= A ? SIM.track(PATH, t) : null;
      SIM.cursor(p ? SIM.hover((s) => SIM.track(PATH, s), t) : null, p && p.x, p && p.y);
      SIM.effects(parts, t + 37, null);
    }
  };
})();
