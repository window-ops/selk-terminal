/* 52.25-53.25 s, the boot resumes on ALARM. The same boot, from just after
   its seventh check, Structure monitor .... ALARM, has typed out in the
   error color, with the game's error sound on it (audio). The camera
   holds close on that line; the next line, Supervisor sleep ..... ended
   26-02-2097, types along the frame's bottom edge, and the frame's right
   edge cuts it after "ended 26-0", which it reaches at 0.9 s. */
"use strict";
(function () {
  const parts = SIM.use("boot"), log = parts.q(".log"), boot = SIM.bootTyping(0.5);
  const last = boot.plan[8], upto = last.text.indexOf("ended 26-0") + 10;
  const T0 = last.from + upto * last.step - 0.9, W = 210, H = W * 9 / 16;
  /* Where the frame's right and bottom edges fall, from the finished lines */
  SIM.camera(0, 0, 1920);
  SIM.showLines(log, boot.at(99));
  const ln = log.children[8], r = document.createRange();
  r.setStart(ln.firstChild, upto); r.setEnd(ln.firstChild, upto);
  const right = r.getBoundingClientRect().left, lb = ln.getBoundingClientRect(), bottom = lb.top + lb.height * 0.55;
  window.SHOT = {
    seconds: 1,
    seek(t) {
      SIM.effects(parts, T0 + t + 3, null);
      SIM.showLines(log, boot.at(T0 + t));
      SIM.cursor(null);
      SIM.camera(right - W, bottom - H, W);
    }
  };
})();
