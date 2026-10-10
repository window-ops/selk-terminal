/* Sign-in. The login prompt at the foot of the boot screen, held in the
   frame's center as far as the screen's corner allows. The name is typed
   with the rhythm of recording G1 (7.7-10.5 s); the shot cuts on Enter,
   after a shorter wait than the recording's. The pointer is hidden, as
   Windows hides it while a player types. Over the empty top of the frame,
   before the music starts, a line pokes fun at that music: "You will be
   listening to one of the greatest pieces of musique concrète ever made",
   in the game's font and the color of the typed name, fading in and out.
   It is set on the game's screen, under its CRT glass, so it has the
   scanlines and glow of everything else, at a fixed place and size in the frame. */
"use strict";
(function () {
  const NAME = "Cornelius", KEYS = [0.6, 0.866, 1.2, 1.6, 1.8, 2.6, 2.933, 3.133, 3.4], ENTER = 3.9;
  const parts = SIM.use("gp-login"), cmd = parts.q(".cmd"), prompt = SIM.box(parts.q(".prompt"));
  const view = [{ from: 0, aim: () => [prompt.x + 90, prompt.cy - 6, 210] }];
  /* The line, on the game's screen just under the glass (z-index 1000) */
  const line = document.createElement("div");
  line.innerHTML = "You will be listening to one of the greatest<br>pieces of musique concr&egrave;te ever made";
  Object.assign(line.style, { position: "absolute", textAlign: "center", zIndex: 999, fontFamily: "'Plex Mono', monospace",
    fontWeight: 500, lineHeight: 1.45, color: "#D6C396", letterSpacing: "0.02em", opacity: 0, pointerEvents: "none" });
  document.querySelector("#world .screen").appendChild(line);
  window.SHOT = {
    seconds: 4,
    seek(t) {
      cmd.value = NAME.slice(0, KEYS.filter((k) => k <= t).length);
      SIM.cursor(null);
      SIM.effects(parts, t + 2, null);
      const cam = SIM.operator(view, t), k = cam[2] / 1920;
      SIM.camera(...cam);
      /* Placed in the frame: 170 px from its top, 64 px type, full width */
      Object.assign(line.style, { left: cam[0] + "px", width: cam[2] + "px", top: cam[1] + 170 * k + "px", fontSize: 64 * k + "px" });
      const fade = (a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
      line.style.opacity = String(fade(0.35, 0.85) * (1 - fade(3.35, 3.8)));
    }
  };
})();
