/* 59.25-63.25 s, the desk. The camera widens to the game's desk, framed
   on its lower half with the shell, the function bar and the tmux bar.
   The text cursor rests in the shell, then the cursor goes down to the
   tmux bar and clicks 2:WATCH, which the game's hover lights; the shot
   cuts at the click, before WATCH replaces the desk. */
"use strict";
(function () {
  const parts = SIM.use("desk-structure");
  SIM.camera(0, 0, 1920);
  const ker = SIM.box(SIM.find("Kerberos")), win = SIM.box(SIM.find("2:WATCH", ".tmux-win"));
  const path = [[0, ker.x + 490, ker.cy], [1.5, ker.x + 493, ker.cy + 3], [3.3, win.cx + 2, win.cy], [3.8, win.cx, win.cy]];
  window.SHOT = {
    seconds: 4,
    seek(t) {
      const [cx, cy] = SIM.keyed(path, t);
      SIM.cursor(cy < win.y - 40 ? "text" : cy < win.y ? "arrow" : "hand", cx, cy);
      SIM.effects(parts, t + 14, null);
      const [x, y, w] = SIM.keyed([[0, 0, 540, 960], [4, 0, 572, 904]], t);
      SIM.camera(x, y, w);
    }
  };
})();
