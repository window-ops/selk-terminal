/* The locked section, from recording G4 (48.9-57.3 s) at its speed. The
   pointer clicks ARCHIVE, marked LOCKED; the frame ends above EXPORT. The
   game's dialog ARCHIVE IS LOCKED, at the centre, is read while the pointer
   goes to ENTER PASSWORD (a still second left out). The UNLOCK ARCHIVE
   dialog: SELK is typed, the pointer hidden; Enter, after a shorter wait
   than the recording's. The password is rejected and the box turns the
   game's red; the frame holds the whole dialog. The report's blanks below
   stay out of frame. */
"use strict";
(function () {
  const SRC = [
    [0.0, 527.5, 460.5, "arrow"],
    [0.067, 480.5, 430.0, "arrow"],
    [0.217, 392.5, 348.5, "arrow"],
    [0.3, 377.5, 333.5, "arrow"],
    [0.367, 372.0, 323.0, "arrow"],
    [0.417, 359.5, 303.5, "arrow"],
    [0.483, 342.0, 285.0, "arrow"],
    [0.55, 299.8, 245.5, "hand"],
    [0.717, 267.8, 214.0, "hand"],
    [0.783, 261.3, 204.5, "hand"],
    [0.85, 252.8, 198.0, "hand"],
    [0.917, 248.8, 194.0, "hand"],
    [1.05, 247.8, 193.0, "hand"],
    [1.133, 243.8, 188.0, "hand"],
    [1.8, 244.3, 188.0, "hand"],
    [1.883, 242.4, 188.0, "hand"],
    [1.9, 242.0, 188.0, "arrow"],
    [3.083, 242.0, 188.0, "arrow"],
    [3.1, 252.0, 196.0, "arrow"],
    [3.167, 306.5, 225.0, "arrow"],
    [3.233, 413.0, 263.5, "arrow"],
    [3.3, 494.5, 321.5, "arrow"],
    [3.35, 551.5, 366.0, "arrow"],
    [3.433, 674.0, 453.5, "arrow"],
    [3.483, 792.5, 544.0, "arrow"],
    [3.55, 855.3, 590.0, "hand"],
    [3.633, 874.5, 608.0, "arrow"],
    [3.8, 885.5, 615.0, "arrow"],
    [3.967, 886.5, 615.0, "arrow"],
    [3.983, 891.0, 611.0, "arrow"],
    [4.05, 899.0, 598.5, "arrow"],
    [4.133, 902.0, 593.5, "arrow"],
    [4.217, 905.8, 590.5, "hand"],
    [4.45, 917.3, 580.0, "hand"],
    [4.9, 917.3, 580.0, "hand"],
    [4.917, 915.0, 580.0, "arrow"],
    [5.0, 917.3, 580.0, "hand"],
    [5.583, 917.3, 580.0, "hand"],
    [5.6, 899.5, 557.5, "arrow"],
    [5.667, 859.3, 542.7, "text"],
    [5.767, 842.8, 539.7, "text"],
    [5.833, 841.8, 539.7, "text"],
    [6.15, 841.8, 539.7, "text"],
    [6.167, 838.8, 539.2, "text"],
    [6.217, 837.8, 539.2, "text"],
    [6.667, 837.8, 539.2, "text"],
    [6.683, 848.3, 539.7, "text"],
    [6.75, 857.0, 534.0, "arrow"],
    [6.833, 865.5, 532.5, "arrow"],
    [7.0, 877.5, 531.5, "arrow"],
    [7.133, 882.5, 530.0, "arrow"],
    [8.4, 883.0, 530.0, "arrow"]
  ];
  const LOCKED = 1.85, ASK = 2.0 + 53.9 - 52.0, TYPE = 4.95, KEYS = [5.05, 5.3, 5.6, 5.95], ENTER = 6.7, WORD = "Selk";
  /* The clicks on ARCHIVE and on ENTER PASSWORD */
  const PATH = SIM.smooth(SIM.join([SIM.part(SRC, 0, 1.85, 0, 1), SIM.part(SRC, 1.95, 2.0, 1.95, 1), SIM.part(SRC, 3.1, 5.05, 2.0, 1), SIM.part(SRC, 5.1, 5.8, ASK + 0.05, 1)]), [[LOCKED - 0.02], [ASK - 0.02]]);
  let parts = SIM.use("gp-rejected-page");
  const archive = SIM.box(parts.q(".mc-row[data-sec='archive']")), exportRow = SIM.box(parts.q(".mc-row[data-sec='export']"));
  parts = SIM.use("gp-unlock");
  const dlg = SIM.box(parts.q(".dlg")), field = SIM.box(parts.q(".dlg-in")), blank1 = SIM.box(parts.q(".blank"));
  const view = [
    { from: 0, bottom: exportRow.y - 1, aim: () => [archive.cx, archive.cy, archive.w + 40] },
    { from: LOCKED, bottom: blank1.y - 4, aim: () => [dlg.cx, dlg.cy, dlg.w + 80] }
  ];
  let state = null;
  window.SHOT = {
    seconds: 8.7,
    seek(t) {
      const want = t < LOCKED ? "gp-rejected-page" : t < ASK ? "gp-archive-locked" : t < ENTER ? "gp-unlock" : "gp-unlock-rejected";
      if (want !== state) { parts = SIM.use(want); state = want; }
      const input = parts.q(".dlg-in");
      if (input) {
        /* The field has the focus, as in the game; its caret is not drawn */
        input.style.caretColor = "transparent"; input.focus();
        if (want === "gp-unlock") input.value = WORD.slice(0, KEYS.filter((k) => k <= t).length);
      }
      SIM.camera(...SIM.operator(view, t));
      const p = SIM.track(PATH, t);
      SIM.cursor(t >= TYPE ? null : SIM.hover((s) => SIM.track(PATH, s), t), p.x, p.y);
      SIM.effects(parts, t + 43, null);
    }
  };
})();
