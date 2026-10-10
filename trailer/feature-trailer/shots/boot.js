/* 0-4.5 s, the boot. 1.5 s of black for the hum; then the game's boot
   screen powers on as the game's does, and after the game's half-second
   wait the boot types its first line, CESEA SITE OS 7.2 (c) 2079 CESEA,
   at the game's TYPED pace, then the first check, Memory check ... 64 GB
   OK, and holds on it for a moment; the shot cuts before the next line,
   Drive 0 ... spun up, 4 TB. A tight camera,
   128 by 72 CSS pixels of the screen's top left, follows the typing along
   the first line, the words cut at the frame's edges. */
"use strict";
(function () {
  const BLACK = 1.5, POWER = 1.5, START = POWER + 0.5, CW = 128;
  const parts = SIM.use("boot"), log = parts.q(".log"), boot = SIM.bootTyping(START);
  window.SHOT = {
    seconds: 4.5,
    seek(t) {
      SIM.blackout(t < BLACK);
      SIM.effects(parts, t, t - POWER);
      SIM.showLines(log, boot.at(t).slice(0, 2));
      SIM.cursor(null);
      /* The camera keeps the head of the typing on the first line at three
         quarters of the frame; the line only grows, so it never moves back */
      SIM.camera(0, 0, 1920);
      const first = log.firstElementChild;
      let head = 0, top = 0;
      if (first && first.textContent) { const r = document.createRange(); r.selectNodeContents(first); head = r.getBoundingClientRect().right; }
      if (first) top = first.getBoundingClientRect().top;
      SIM.camera(Math.max(0, head - CW * 0.75), Math.max(0, top - 18), CW);
    }
  };
})();
