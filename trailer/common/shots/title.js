/* 77.25-87.25 s, the title screen, the game's own. One second of black
   after the last creak; the title screen fades in as the game's page does
   (0.7 s), with one line added under the coordinates in the same dim
   style: the repository's address. The cursor rests, then moves to POWER
   ON, which the game's hover lights amber; the shot, and the trailer, cut
   to black while it is lit, before any click. The camera holds the title,
   the lines under it and the buttons at the centre, close enough to read
   on a small screen, and eases in a little over the shot. */
"use strict";
(function () {
  const BLACK = 1, FADE = 0.7, HOVER = 7.3;
  const parts = SIM.use("title");
  const coords = SIM.find("7.0 N", ".title-sub"), line = coords.cloneNode(false);
  line.textContent = "gitlab.com/window-ops-web/selk-terminal";
  coords.after(line);
  SIM.camera(0, 0, 1920);
  const go = SIM.box(parts.q(".title-go"));
  /* The middle of what the title screen shows: SELK down to the row of
     buttons under POWER ON */
  const big = SIM.box(parts.q(".title-big")), row = SIM.box(parts.q(".title-row"));
  const mid = { x: (big.x + big.w / 2 + row.x + row.w / 2) / 2, y: (big.y + row.y + row.h) / 2 };
  const path = [[0, go.cx + 105, go.cy + 28], [5.8, go.cx + 106, go.cy + 30], [HOVER, go.cx + 15, go.cy + 4]];
  window.SHOT = {
    seconds: 10,
    seek(t) {
      SIM.blackout(t < BLACK);
      const u = Math.min(1, Math.max(0, (t - BLACK) / FADE));
      parts.screen.style.opacity = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
      const [cx, cy] = SIM.keyed(path, t);
      const over = cx > go.x && cx < go.x + go.w && cy > go.y && cy < go.y + go.h;
      SIM.cursor(over ? "hand" : "arrow", cx, cy);
      SIM.effects(parts, t + 21, null);
      const [w] = SIM.keyed([[0, 800], [10, 760]], t);
      SIM.camera(mid.x - w / 2, mid.y - w * 9 / 32, w);
    }
  };
})();
