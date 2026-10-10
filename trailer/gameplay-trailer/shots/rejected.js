/* The rejected page. The shell answers in the game's red; the camera holds
   the whole line "Page not accepted. 3 of 4 answers match office records.",
   its frame on the screen's bottom edge, so the lines above it, the blanks
   filled and "submit 2", are in the frame too */
"use strict";
(function () {
  const parts = SIM.use("gp-rejected-page"), line = SIM.textBox("Page not accepted. 3 of 4 answers match office records.");
  /* The frame's top in the gap above "report 2", its bottom on the
     screen's edge */
  const top = SIM.textBox("report 2").y - 14, W = (1080 - top) * 16 / 9;
  const view = [{ from: 0, aim: () => [line.cx, 1080 - W * 9 / 32, W] }];
  window.SHOT = {
    seconds: 3,
    seek(t) {
      SIM.camera(...SIM.operator(view, t));
      SIM.cursor(null);
      SIM.effects(parts, t + 40, null);
    }
  };
})();
