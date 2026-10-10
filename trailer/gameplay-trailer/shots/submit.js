/* Sending the page. The cut skips blanks 3 and 4: the frame holds the
   active SUBMIT PAGE button and "4 of 4 filled", its top edge just under
   blank 4. The hand lights the button and clicks (recording G3,
   0.4-1.95 s). */
"use strict";
(function () {
  /* The click on SUBMIT PAGE (recording G3, 1.88 s) */
  const PATH = SIM.smooth(SIM.part([
    [0.0, 1433.5, 801.5, "arrow"],
    [0.067, 1414.5, 822.0, "arrow"],
    [0.133, 1359.5, 860.5, "arrow"],
    [0.2, 1278.5, 898.5, "arrow"],
    [0.267, 1205.0, 912.5, "arrow"],
    [0.333, 1145.0, 913.5, "arrow"],
    [0.4, 1134.0, 913.5, "arrow"],
    [0.467, 1090.0, 914.0, "arrow"],
    [0.55, 1058.0, 902.5, "arrow"],
    [0.6, 1057.0, 902.5, "arrow"],
    [0.667, 1020.5, 900.5, "arrow"],
    [0.75, 1020.5, 899.5, "arrow"],
    [0.9, 1010.0, 897.2, "arrow"],
    [0.983, 987.3, 888.3, "arrow"],
    [1.0, 982.8, 886.5, "hand"],
    [1.083, 972.8, 884.5, "hand"],
    [1.133, 971.3, 884.5, "hand"],
    [1.2, 964.8, 885.0, "hand"],
    [1.417, 964.8, 884.0, "hand"],
    [1.483, 974.3, 883.0, "hand"],
    [1.55, 1090.5, 879.5, "arrow"]
  ], 0, 99, 0.25, 1), [[0.25 + 1.88 - 0.4]]);
  const parts = SIM.use("gp-report-4"), button = SIM.box(SIM.find("SUBMIT PAGE", "button"));
  const blank4 = SIM.box(document.querySelectorAll("#world .blank")[3]);
  const view = [{ from: 0, top: blank4.y + blank4.h + 3, aim: () => [button.cx + 60, button.cy, 380] }];
  window.SHOT = {
    seconds: 1.9,
    seek(t) {
      SIM.camera(...SIM.operator(view, t));
      const p = SIM.track(PATH, t);
      SIM.cursor(SIM.hover((s) => SIM.track(PATH, s), t), p.x, p.y);
      SIM.effects(parts, t + 26, null);
    }
  };
})();
