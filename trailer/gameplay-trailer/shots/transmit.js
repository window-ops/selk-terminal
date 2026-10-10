/* The transmission. The shell, framed under the lines that list the
   blanks, on the game's large line counting the signal delay down from 79
   as the game does (one step every 3.6 / 79 s, the first at once), to
   "Delivered to Earth", which stays a moment. Cut to the report's stamp,
   ACCEPTED BY AUDIT DESK 4, with the blanks above out of frame. */
"use strict";
(function () {
  const STEP = 3.6 / 79, DONE = 78 * STEP, STAMP = DONE + 0.8;
  let parts = SIM.use("gp-transmit");
  const delay = SIM.textBox("Signal delay"), tx = SIM.box(SIM.find("Transmitting REPORT 1"));
  parts = SIM.use("gp-accepted");
  const stamp = SIM.box(parts.q(".stamp")), blank4 = SIM.box(document.querySelectorAll("#world .blank")[3]);
  const view = [
    { from: 0, top: tx.y - 6, aim: () => [delay.x + 150, delay.cy, 330] },
    { from: STAMP, top: blank4.y + blank4.h + 3, aim: () => [stamp.cx, stamp.cy, 310] }
  ];
  let state = null, count;
  window.SHOT = {
    seconds: 5.5,
    seek(t) {
      const want = t < DONE ? "gp-transmit" : "gp-accepted";
      if (want !== state) { parts = SIM.use(want); state = want; count = parts.q(".ln.count"); }
      if (t < DONE) count.textContent = "Signal delay " + (78 - Math.floor(t / STEP)) + " min";
      SIM.camera(...SIM.operator(view, t));
      SIM.cursor("arrow", 1424, 875);
      SIM.effects(parts, t + 28, null);
    }
  };
})();
