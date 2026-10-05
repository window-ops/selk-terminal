/* 63.25-69.25 s, WATCH, the game's window. The frame holds the SV-4 live
   picture and the meter rows; the unit table below stays out of frame.
   The live picture is the trailer's own MAST-01 scene (its frames from
   the build), drawn into the game's 2:1 picture, timed so its first gust
   comes 2.2 s in. With the gust the readings climb: MAST-01 load from
   117.4 %, the wind, the dust; the screen shakes once with the game's
   interference (the jitter keyframes of vendor/css/crt/screen.css). Then
   a close-up on the load. */
"use strict";
(function () {
  const GUST = 2.2, CLOSE = 3.6;
  const parts = SIM.use("watch");
  const live = parts.q("canvas.live"), bars = parts.all(".cbar"), texts = parts.all(".meter-text"), panes = parts.q(".panes");
  live.style.backgroundSize = "100% 112.5%"; live.style.backgroundPosition = "0 50%"; live.style.imageRendering = "pixelated";
  SIM.camera(0, 0, 1920);
  const table = SIM.box(parts.q(".etable-wrap")), load = SIM.box(texts[0]);
  const y0 = 22, wide = Math.min(1000, (table.y - 6 - y0) * 16 / 9);
  const frame = (t) => "../../out/build/frames/mast/" + String(Math.floor((t + 1.0) * 8) % 64).padStart(3, "0") + ".png";
  const bump = (t) => Math.exp(-(((t - GUST) / 0.5) ** 2));
  const bar = (n) => "[" + "|".repeat(n) + " ".repeat(20 - n) + "]";
  /* The jitter: 0.48 s in six steps */
  const JIT = [[0, 0, 1, 0], [-2.5, 1, 1.12, 0.4], [2, -1, 1, 0], [-1.5, 0.5, 0.85, 0], [1, 0.5, 1, 0], [0, 0, 1, 0]];
  window.SHOT = {
    seconds: 6,
    seek(t) {
      const b = bump(t), after = t > GUST ? Math.min(1, (t - GUST) / 3) : 0;
      const ld = 117.4 + 1.3 * b + 0.6 * after, wind = 2.4 + 2.3 * b + 0.4 * after, vis = 12.5 - 4 * b - after;
      bars[0].textContent = bar(Math.min(20, Math.round(ld / 7.3))); texts[0].textContent = ld.toFixed(1) + " %";
      bars[1].textContent = bar(Math.round(wind * 1.7)); texts[1].textContent = wind.toFixed(1) + " m/s";
      bars[2].textContent = bar(2 + Math.round(2 * b)); texts[2].textContent = "visibility " + vis.toFixed(1) + " km";
      live.style.backgroundImage = "url(" + frame(t) + ")";
      const j = t >= GUST - 0.24 && t < GUST + 0.24 ? JIT[Math.min(5, Math.floor((t - GUST + 0.24) / 0.08))] : JIT[0];
      panes.style.transform = "translate(" + j[0] + "px, " + j[1] + "px)";
      panes.style.filter = "brightness(" + j[2] + ")" + (j[3] ? " blur(" + j[3] + "px)" : "");
      SIM.cursor(null);
      SIM.effects(parts, t + 18, null);
      if (t < CLOSE) { const [x, y, w] = SIM.keyed([[0, 0, y0, wide], [CLOSE, 8, y0 + 8, wide - 40]], t); SIM.camera(x, y, w); }
      else { const [x, y, w] = SIM.keyed([[CLOSE, load.x - 110, load.cy - 50, 240], [6, load.x - 98, load.cy - 44, 216]], t); SIM.camera(x, y, w); }
    }
  };
})();
