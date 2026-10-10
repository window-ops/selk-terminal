/* The first message. The desk after sign-in, the camera already on the
   place where the game's notice for MSG 001 slides in (recording G1 from
   14.5 s; the notice comes at 15.1 s). The camera holds it; the pointer
   comes back, enters the frame and goes to OPEN MSG 001, at the recording's speed, and the
   shot cuts on the click. A second of the recording in which the pointer
   was hidden is left out. */
"use strict";
(function () {
  const SRC = [
    [0.0, null, null, null],
    [3.167, null, null, null],
    [3.183, 946.8, 606.7, "text"],
    [3.267, 963.3, 587.7, "text"],
    [3.35, 969.3, 581.2, "text"],
    [3.417, 971.8, 578.7, "text"],
    [3.767, 971.8, 578.7, "text"],
    [3.783, 953.8, 581.2, "text"],
    [3.967, 953.8, 581.2, "text"],
    [3.983, 956.3, 578.2, "text"],
    [4.05, 1002.3, 529.2, "text"],
    [4.117, 1098.3, 432.7, "text"],
    [4.183, 1140.8, 381.7, "text"],
    [4.25, 1171.3, 351.7, "text"],
    [4.317, 1213.3, 321.7, "text"],
    [4.383, 1226.8, 311.2, "text"],
    [4.517, 1250.3, 298.2, "text"],
    [4.583, 1254.3, 296.7, "text"],
    [4.65, 1253.8, 294.2, "text"],
    [4.717, 1257.8, 292.7, "text"],
    [4.783, 1265.3, 287.7, "text"],
    [4.85, 1281.8, 277.2, "text"],
    [4.917, 1313.8, 261.7, "text"],
    [4.983, 1357.8, 235.7, "text"],
    [5.05, 1417.8, 197.2, "text"],
    [5.117, 1439.8, 184.2, "text"],
    [5.183, 1442.3, 184.7, "text"],
    [5.317, 1453.8, 171.2, "text"],
    [5.383, 1463.8, 159.2, "text"],
    [5.483, 1471.3, 152.2, "text"],
    [5.55, 1479.8, 143.7, "text"],
    [5.617, 1487.5, 131.0, "arrow"],
    [5.7, 1491.2, 127.6, "arrow"],
    [5.767, 1506.1, 113.9, "arrow"],
    [5.783, 1509.8, 110.5, "hand"],
    [5.883, 1512.3, 108.5, "hand"],
    [6.433, 1515.2, 108.2, "hand"],
    [6.45, 1515.3, 108.2, "text"],
    [6.55, 1515.3, 108.2, "text"]
  ];
  /* The click on OPEN MSG 001 (recording G1, 20.35 s) */
  const PATH = SIM.smooth(SIM.join([SIM.part(SRC, 0.6, 2.0, 0, 1), SIM.part(SRC, 3.0, 6.55, 1.4, 1)]), [[1.4 + 20.35 - 13.9 - 3.0]]);
  const ARRIVE = 15.117 - 14.5;
  SIM.use("gp-desk-msg1");
  const note = SIM.box(SIM.find("[NEW TRANSMISSION]").closest(".mail-toast"));
  /* The frame holds the notice; the pointer comes into it. The camera has
     no reason to move toward a pointer the viewer cannot see. */
  const view = [{ from: 0, aim: () => [note.cx, note.cy, 500] }];
  let state = null, parts;
  window.SHOT = {
    seconds: 4.9,
    seek(t) {
      const want = t < ARRIVE ? "gp-desk" : "gp-desk-msg1";
      if (want !== state) { parts = SIM.use(want); state = want; }
      SIM.toast(t - ARRIVE);
      SIM.blink(t);
      SIM.camera(...SIM.operator(view, t));
      const p = SIM.track(PATH, t);
      SIM.cursor(SIM.hover((s) => SIM.track(PATH, s), t), p.x, p.y);
      SIM.effects(parts, t + 5, null);
    }
  };
})();
