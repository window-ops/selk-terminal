/* MSG 002. The notice for MSG 002 slides in at the centre of the frame,
   and the REPORT 2 tab appears below; the pointer goes up to OPEN MSG 002
   (recording G3, 9.6-16.5 s, at its speed, a still second left out) and
   clicks. MAIL opens; the camera holds the message's news at the centre
   while the text cursor rests under it. */
"use strict";
(function () {
  const SRC = [
    [0.0, 1419.5, 866.0, "arrow"],
    [1.6, 1419.5, 866.0, "arrow"],
    [1.617, 1428.5, 852.5, "arrow"],
    [1.683, 1442.5, 835.0, "arrow"],
    [1.75, 1463.0, 785.0, "arrow"],
    [1.817, 1492.5, 647.0, "arrow"],
    [1.883, 1513.8, 505.2, "text"],
    [1.95, 1499.3, 355.2, "text"],
    [2.033, 1494.8, 279.7, "text"],
    [2.117, 1493.3, 234.7, "text"],
    [2.183, 1493.3, 186.2, "text"],
    [2.25, 1499.3, 139.5, "hand"],
    [2.317, 1499.0, 136.0, "arrow"],
    [2.483, 1503.8, 130.6, "arrow"],
    [2.567, 1520.5, 118.4, "arrow"],
    [2.583, 1523.8, 116.0, "hand"],
    [2.817, 1523.8, 116.0, "hand"],
    [2.983, 1527.8, 113.0, "hand"],
    [3.567, 1529.3, 114.2, "hand"],
    [3.583, 1529.3, 114.2, "text"],
    [6.467, 1529.3, 114.2, "text"],
    [6.483, 1526.3, 114.2, "text"],
    [6.55, 1476.3, 149.2, "text"],
    [6.617, 1442.3, 192.7, "text"],
    [6.683, 1412.8, 225.2, "text"],
    [6.75, 1397.8, 244.2, "text"],
    [6.833, 1391.3, 253.7, "text"],
    [6.9, 1391.3, 253.7, "text"]
  ];
  /* The click on OPEN MSG 002 is the cut to MAIL, at OPEN */
  const PATH = SIM.smooth(SIM.join([SIM.part(SRC, 0, 0.3, 0.6, 1), SIM.part(SRC, 1.4, 99, 0.9, 1)]), [[0.9 + 13.2 - 11.0 - 0.02]]);
  const ARRIVE = 0.617, OPEN = 0.9 + 13.2 - 11.0;
  SIM.use("gp-desk-msg2");
  const note = SIM.box(document.querySelector("#world .mail-toast"));
  SIM.use("gp-mail-msg2");
  /* The text's own box, its padding left out */
  const newsEl = SIM.find("Life at Selk"), news = SIM.inkBox(newsEl);
  const view = [
    /* The frame holds the notice; the pointer comes into it */
    { from: 0, aim: () => [note.cx, note.cy + 30, 500] },
    { from: OPEN, smooth: 0.15, aim: (t) => {
      /* Reads along the news line at a reader's pace */
      /* W of the screen, M kept on each side of the text, as for MSG 001 */
      const W = 340, M = 14, v = Math.min(1, Math.max(0, (t - OPEN - 0.45) / 1.4)), u = v * v * (3 - 2 * v);
      return [news.x - M + W / 2 + (news.w + 2 * M - W) * u, news.cy, W];
    } }
  ];
  let state = null, parts;
  window.SHOT = {
    seconds: 5.3,
    seek(t) {
      const want = t < ARRIVE ? "gp-accepted" : t < OPEN ? "gp-desk-msg2" : "gp-mail-msg2";
      if (want !== state) { parts = SIM.use(want); state = want; }
      SIM.toast(t - ARRIVE);
      SIM.blink(t);
      SIM.camera(...SIM.operator(view, t));
      /* No cursor while the camera reads along the news */
      const p = SIM.track(PATH, t);
      SIM.cursor(t >= OPEN ? null : SIM.hover((s) => SIM.track(PATH, s), t), p.x, p.y);
      SIM.effects(parts, t + 33, null);
    }
  };
})();
