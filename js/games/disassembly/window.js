/* DISASSEMBLY.RUN (core.js): the game's own window over the screen, its
   size, and S.disassembly, which opens it. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, G = S.disassemblyGame;
  var keyHandler = null;
  /* The canvas fills the window's width up to twice its size, and fits
     the window's height */
  function fit() {
    if (!G.cv) { return; }
    var s = Math.min((window.innerWidth - 48) / A.W, (window.innerHeight * 0.55) / A.H, 2);
    G.cv.style.width = Math.floor(A.W * s) + "px";
    G.cv.style.height = Math.floor(A.H * s) + "px";
    G.q(".dis").style.width = Math.max(Math.floor(A.W * s) + 4, Math.min(window.innerWidth - 48, 560)) + "px";
  }
  function close() {
    if (keyHandler) { window.removeEventListener("keydown", keyHandler, true); keyHandler = null; }
    window.removeEventListener("resize", fit);
    if (G.ov) { G.ov.remove(); G.ov = null; }
    G.st = null;
    if (S.tmux && S.tmux.focusCur) { S.tmux.focusCur(); }
  }
  function build() {
    var el = S.el;
    G.ov = el("div", "dis-ov");
    /* No context menu over the game, so a right click acts on nothing
       behind it; on the text the browser's menu stays, for copying */
    G.ov.addEventListener("contextmenu", function (e) {
      e.stopPropagation();
      if (!e.target.closest(".dis-panel")) { e.preventDefault(); }
    });
    var box = el("div", "dis");
    box.setAttribute("role", "dialog"); box.setAttribute("aria-label", S.t("DISASSEMBLY.RUN"));
    var head = el("div", "dis-head");
    var title = el("span", "dis-title");
    title.appendChild(el("span", "dis-name", S.t("DISASSEMBLY.RUN")));
    title.appendChild(el("span", "dis-sub"));
    head.appendChild(title);
    var x = el("button", "dis-close", S.t("CLOSE")); x.type = "button"; x.dataset.sound = "close";
    x.addEventListener("click", close);
    head.appendChild(x);
    box.appendChild(head);
    G.cv = document.createElement("canvas"); G.cv.width = A.W; G.cv.height = A.H; G.cv.tabIndex = 0;
    G.cv.setAttribute("aria-label", S.t("The phone, the parts taken off it and the drawer of new parts. The arrows pick a part; Enter acts on it or uses the armed tool; F turns the phone over."));
    G.cv.addEventListener("pointerdown", G.onDown);
    G.cv.addEventListener("pointermove", G.onMove);
    G.cv.addEventListener("pointerup", G.onUp);
    G.cv.addEventListener("pointercancel", function () { if (G.st && G.st.drag) { G.st.drag = null; G.picture(); } });
    G.cv.addEventListener("pointerleave", function () { if (G.st && G.st.joke && G.st.joke.until === Infinity) { G.st.joke.until = performance.now() + 300; } });
    G.g = G.cv.getContext("2d"); G.g.imageSmoothingEnabled = false;
    A.use(G.g);
    box.appendChild(G.cv);
    var tools = el("div", "dis-tools"); tools.hidden = true;
    tools.setAttribute("role", "toolbar"); tools.setAttribute("aria-label", S.t("Tools"));
    /* Turning the phone over, before the tools */
    var flipBtn = el("button", "dis-tool dis-flip", S.t("FLIP")); flipBtn.type = "button"; flipBtn.dataset.sound = "flip";
    flipBtn.addEventListener("click", function () { G.flip(); G.cv.focus({ preventScroll: true }); });
    tools.appendChild(flipBtn);
    ["heat", "pry", "screw", "glue"].forEach(function (t) {
      var b = el("button", "dis-tool"); b.type = "button"; b.dataset.tool = t; b.dataset.sound = "toggle";
      b.appendChild(G.toolIcon(t));
      b.appendChild(el("span", "", G.toolName(t)));
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("pointerdown", function (e) { if (e.button === 0) { e.preventDefault(); G.toolDrag(b, e); } });
      /* A click from the keyboard arms the tool and puts the focus on the
         phone; pointer clicks arm it in toolDrag */
      b.addEventListener("click", function (e) { if (e.detail === 0 && G.st && G.st.removed && !G.st.over) { G.arm(G.st.armed === t ? null : t); G.cv.focus({ preventScroll: true }); } });
      tools.appendChild(b);
    });
    box.appendChild(tools);
    box.appendChild(el("div", "dis-panel"));
    G.ov.appendChild(box);
    document.getElementById("screen").appendChild(G.ov);
    fit();
    window.addEventListener("resize", fit);
    /* The game takes every key but Tab while open: on the canvas the arrows
       pick a part and Enter acts on it; Escape drops the armed tool or
       closes */
    keyHandler = function (e) {
      if (!G.ov || e.key === "Tab") { return; }
      e.stopImmediatePropagation();
      /* Copying and selecting text keep working */
      if ((e.ctrlKey || e.metaKey) && /^[acAC]$/.test(e.key)) { return; }
      if (e.key === "Escape") { e.preventDefault(); if (G.st && G.st.armed) { G.arm(null); } else { close(); } return; }
      if (document.activeElement === G.cv && G.onKey(e)) { e.preventDefault(); return; }
      if (e.key === "Enter" || e.key === " ") { return; }
      e.preventDefault();
    };
    window.addEventListener("keydown", keyHandler, true);
  }
  S.disassembly = {
    open: function () {
      if (G.ov) { return; }
      build();
      G.st = null;
      G.pickScreen();
      G.q(".dis-phone").focus({ preventScroll: true });
    },
    close: close
  };
  G.fit = fit; G.close = close; G.build = build;
})();
