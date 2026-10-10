/* MSG 001. MAIL opens on the message, and the camera reads along its
   lines, the request to fill in REPORT 1 by dragging among them. The text
   cursor drifts under the line, then heads for OPEN REPORT 1, and the
   camera pans with it (recording G1, 25.3-30.25 s, at its speed). The shot
   cuts on the click. */
"use strict";
(function () {
  const PATH = SIM.smooth(SIM.part([
    [0.0, 1357.8, 282.2, "text"],
    [0.1, 1357.8, 282.2, "text"],
    [0.183, 1353.8, 275.2, "text"],
    [0.967, 1354.3, 274.7, "text"],
    [0.983, 1323.8, 282.2, "text"],
    [1.05, 1251.3, 294.7, "text"],
    [1.117, 1205.3, 294.7, "text"],
    [1.183, 1192.8, 294.2, "text"],
    [1.3, 1192.8, 294.2, "text"],
    [1.45, 1184.8, 297.7, "text"],
    [1.65, 1143.8, 311.2, "text"],
    [1.717, 1135.8, 315.7, "text"],
    [1.783, 1122.8, 319.2, "text"],
    [1.85, 1118.3, 321.7, "text"],
    [1.917, 1107.3, 324.2, "text"],
    [1.983, 1101.8, 324.2, "text"],
    [2.1, 1101.8, 324.2, "text"],
    [2.117, 1096.8, 326.7, "text"],
    [2.25, 1083.8, 329.2, "text"],
    [2.383, 1045.8, 333.7, "text"],
    [2.45, 1017.8, 340.7, "text"],
    [2.517, 949.8, 345.2, "text"],
    [2.583, 948.3, 346.7, "text"],
    [2.65, 929.8, 350.2, "text"],
    [2.717, 925.8, 351.7, "text"],
    [2.967, 925.8, 351.7, "text"],
    [3.05, 901.3, 353.7, "text"],
    [3.15, 898.3, 353.7, "text"],
    [3.283, 888.3, 356.7, "text"],
    [3.35, 871.3, 350.7, "text"],
    [3.417, 860.8, 346.7, "text"],
    [4.0, 860.8, 346.7, "text"],
    [4.083, 856.8, 343.2, "text"],
    [4.15, 857.3, 343.2, "text"],
    [4.217, 852.8, 339.2, "text"],
    [4.417, 851.3, 334.2, "text"],
    [4.483, 848.8, 330.7, "text"],
    [4.617, 849.3, 326.2, "text"],
    [4.683, 849.3, 315.5, "hand"],
    [4.85, 849.3, 310.0, "hand"],
    [5.167, 849.3, 310.0, "hand"],
    [5.183, 849.3, 306.5, "hand"],
    [5.767, 849.3, 307.0, "hand"],
    [5.85, 859.2, 327.5, "hand"]
  ], 0.9, 5.77, 0, 1), [[4.5]]);
  /* The click on OPEN REPORT 1: the recording rests 0.6 s on the lit link before it (30.18 s); the trailer clicks and cuts 0.3 s after the hand arrives, at 4.6 s */
  const CLICK = 30.18 - 24.4 - 0.9;
  const parts = SIM.use("gp-mail-msg1");
  /* The text's own box, its padding left out */
  const el = SIM.find("you were woken"), para = SIM.inkBox(el), link = SIM.box(SIM.find("OPEN REPORT 1"));
  /* The frame shows W of the screen and keeps M on each side of the text:
     the lines start M from the left edge, and end M from the right edge
     when the reading is done */
  const W = 340, M = 14;
  const view = [{ from: 0, smooth: 0.15, aim: (t) => {
    /* Reads along the message's lines at a reader's pace, as for MSG 002,
       the three lines filling the frame, then goes down to the link, the
       text's left edge again M from the frame's */
    if (t >= 3.0) return [para.x - M + W / 2, link.cy - 40, W];
    /* A moment on the start of the lines, the pan, a moment on their end */
    const v = Math.min(1, Math.max(0, (t - 0.45) / 1.8)), u = v * v * (3 - 2 * v);
    return [para.x - M + W / 2 + (para.w + 2 * M - W) * u, para.cy, W];
  } }];
  window.SHOT = {
    seconds: 4.6,
    seek(t) {
      SIM.camera(...SIM.operator(view, t));
      /* No cursor while the camera reads along the lines */
      const p = SIM.track(PATH, t);
      SIM.cursor(t < 3.0 ? null : SIM.hover((s) => SIM.track(PATH, s), t), p.x, p.y);
      SIM.effects(parts, t + 9, null);
    }
  };
})();
