/* DISASSEMBLY.RUN (core.js): the pointer on the canvas, the tools dragged
   or armed, the Note 7 joke, and the keys on the canvas. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, G = S.disassemblyGame;
  /* Canvas coordinates of a pointer, in units */
  function units(e) {
    var rect = G.cv.getBoundingClientRect();
    return [(e.clientX - rect.left) * A.W / rect.width / A.K, (e.clientY - rect.top) * A.H / rect.height / A.K];
  }
  function partAt(e) {
    var u = units(e);
    return G.st.flipped ? A.hitFront(G.st.phone, G.st.removed, u[0], u[1]) : A.hit(G.st.phone, G.touchable(), u[0], u[1]);
  }
  /* Dragging: a part that can come off follows the pointer and is pulled
     off when let go in the tray or far from where it was; one that cannot
     stays still, and its reason is given once. While closing, parts are
     dragged back from the tray onto the phone. */
  function onDown(e) {
    if (!G.st || !G.st.removed || G.st.over) { return; }
    var u = units(e);
    if (G.st.newPart) {
      if (A.onNew(G.st.phone, G.st.newPart, u[0], u[1])) {
        e.preventDefault();
        G.st.drag = { id: "new", ux: u[0], uy: u[1] };
        G.cv.setPointerCapture(e.pointerId);
        G.picture();
      }
      return;
    }
    if (G.st.closing) {
      var back = A.trayAt(G.st.phone, G.st.removed, u[0], u[1]);
      if (back) {
        e.preventDefault();
        G.st.drag = { id: back, tray: true, ux: u[0], uy: u[1] };
        G.cv.setPointerCapture(e.pointerId);
        G.picture();
        return;
      }
    }
    var id = partAt(e);
    if (!id && G.st.armed && G.st.closing) { e.preventDefault(); var g0 = G.st.armed; arm(null); G.useTool(g0, null); return; }
    if (!id) { return; }
    e.preventDefault();
    if (G.st.armed) { var t = G.st.armed; arm(null); G.useTool(t, id); return; }
    if (id === "power") { G.pressPower(); return; }
    G.st.focus = id;
    var why = G.st.closing ? S.t("That is not needed now.") : G.stuck(id);
    G.st.drag = { id: id, x0: u[0], y0: u[1], dx: 0, dy: 0, stuck: why, told: false };
    G.cv.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    /* The Note 7 burns until the mouse leaves the screen */
    if (G.st && G.st.joke && G.st.joke.until === Infinity) {
      var mu = units(e);
      if (A.hitFront(G.st.phone, G.st.removed, mu[0], mu[1]) !== "screen") { G.st.joke.until = performance.now() + 300; }
    }
    if (!G.st || !G.st.drag) { return; }
    var u = units(e), d = G.st.drag;
    if (d.stuck) {
      if (!d.told && Math.abs(u[0] - d.x0) + Math.abs(u[1] - d.y0) > 4) { d.told = true; G.st.actions++; G.mistake(d.stuck); }
      return;
    }
    if (d.id === "new" || d.tray) { d.ux = u[0]; d.uy = u[1]; } else { d.dx = u[0] - d.x0; d.dy = u[1] - d.y0; }
    G.picture();
  }
  function onUp(e) {
    if (!G.st || !G.st.drag) { return; }
    var d = G.st.drag, u = units(e);
    G.st.drag = null;
    /* A touch on the Galaxy's lit screen, with no drag: the Note 7 joke */
    if (G.st.on && G.st.phone === "samsung" && G.st.flipped && d.id === "screen" && Math.abs(u[0] - (d.x0 || 0)) + Math.abs(u[1] - (d.y0 || 0)) < 2) { note7(e.pointerType); return; }
    if (d.stuck) { G.picture(); return; }
    if (d.id === "new") { if (u[0] < A.TRAY) { G.fitNew(); } else { G.picture(); } return; }
    if (d.tray) { if (u[0] < A.TRAY) { G.putBack(d.id); } else { G.picture(); } return; }
    if (u[0] > A.TRAY || Math.abs(d.dx) + Math.abs(d.dy) > 30) { G.pull(d.id); } else { G.picture(); }
  }
  /* A Galaxy Note 7 bursts into flames over the phone, with the note on
     Samsung's batteries. It burns while the mouse stays over the screen,
     and for 4 s after a touch. */
  function note7(pointer) {
    if (G.st.joke) { return; }
    var start = performance.now();
    G.st.joke = { until: pointer === "mouse" ? Infinity : start + 4000 };
    G.say(S.t("A Galaxy Note 7, 2016: recalled because its batteries could catch fire.") + " " +
      S.t("Mrwhosetheboss later reported swollen batteries across many of his stored Galaxy phones, the Note 8 and the S10 among them, some covers pushed apart by their batteries, even though they were kept in ideal conditions."), true);
    if (S.snd && S.snd.error) { S.snd.error(); }
    (function step() {
      var now = performance.now(), secs = (now - start) / 1000;
      if (!G.st || !G.ov) { return; }
      G.picture();
      if (now > G.st.joke.until) { G.st.joke = null; G.picture(); return; }
      A.note7(S.reduced ? 1 : Math.min(1, secs / 2.5), S.reduced ? 0.5 : secs);
      requestAnimationFrame(step);
    })();
  }
  /* The picture of a tool, drawn twice its size */
  function toolIcon(t) {
    var c = document.createElement("canvas");
    c.width = 40; c.height = 20; c.className = "dis-tool-icon";
    c.setAttribute("aria-hidden", "true");
    A.tool(c.getContext("2d"), t);
    return c;
  }
  /* A tool: dragged onto a part, or pressed to arm it for the next part
     clicked or chosen with the keyboard */
  function arm(tool) {
    G.st.armed = tool;
    [].forEach.call(G.ov.querySelectorAll(".dis-tool"), function (b) { b.setAttribute("aria-pressed", b.dataset.tool === tool ? "true" : "false"); });
    G.cv.classList.toggle("armed", !!tool);
  }
  function toolDrag(b, e) {
    if (!G.st || !G.st.removed || G.st.over) { return; }
    var tool = b.dataset.tool, ghost = null, moved = false, x0 = e.clientX, y0 = e.clientY;
    b.setPointerCapture(e.pointerId);
    function move(ev) {
      if (!moved && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 6) { return; }
      moved = true;
      if (!ghost) { ghost = S.el("div", "dis-ghost"); ghost.appendChild(toolIcon(tool)); document.body.appendChild(ghost); }
      ghost.style.left = ev.clientX + 8 + "px"; ghost.style.top = ev.clientY + 8 + "px";
    }
    function up(ev) {
      b.removeEventListener("pointermove", move); b.removeEventListener("pointerup", up);
      if (ghost) { ghost.remove(); }
      if (!moved) { arm(G.st.armed === tool ? null : tool); return; }
      var rect = G.cv.getBoundingClientRect();
      if (ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom && units(ev)[0] < A.TRAY) {
        G.useTool(tool, partAt(ev));
      }
    }
    b.addEventListener("pointermove", move); b.addEventListener("pointerup", up);
  }
  /* The keyboard: the arrows move between the power button and the parts
     that can be touched; Enter presses the button, uses the armed tool,
     pulls the part off, or while closing puts the next part back */
  function onKey(e) {
    if (!G.st || !G.st.removed || G.st.over) { return false; }
    if (e.key === "f" || e.key === "F") { G.flip(); return true; }
    if (G.st.newPart) {
      if (e.key === "Enter") { G.fitNew(); return true; }
      return false;
    }
    var list = G.touchable(), i = list.indexOf(G.st.focus);
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowLeft") {
      var step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      G.st.kbd = true;
      G.st.focus = list[(i + step + list.length) % list.length] || null;
      if (G.st.focus) { G.say(G.cap(G.partName(G.st.focus) || S.t("the bottom module"))); }
      G.picture();
      return true;
    }
    if (e.key === "Enter") {
      if (G.st.armed) { var t = G.st.armed; arm(null); G.useTool(t, G.st.closing && t === "glue" ? null : G.st.focus); return true; }
      if (G.st.focus === "power") { G.pressPower(); return true; }
      if (G.st.closing) { if (G.nextBack()) { G.putBack(G.nextBack()); } else { G.pressPower(); } return true; }
      if (G.st.focus) { G.pull(G.st.focus); return true; }
    }
    return false;
  }
  G.units = units; G.partAt = partAt; G.onDown = onDown; G.onMove = onMove; G.onUp = onUp; G.note7 = note7; G.toolIcon = toolIcon; G.arm = arm; G.toolDrag = toolDrag; G.onKey = onKey;
})();
