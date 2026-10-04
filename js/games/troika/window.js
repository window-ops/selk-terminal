/* TROIKA.RUN (core.js): the game's own window over the screen, in the frame
   of the game's dialogs: the title bar with the place, the canvas with the
   gate, pause, dialogue and end panels over it, and the bar under it with
   the obstacle ahead and the keys. It sizes the canvas, runs the frame
   loop and takes every key while it is open, so the game's shortcuts do
   not act behind it; Escape pauses the run, and so does hiding the tab.
   S.troika opens it. */
(function () {
  var S = window.SELK, T = S.troikaGame, A = S.troikaArt;
  var keyHandler = null;
  /* The clock follows real time at any frame rate: a long frame is run in
     steps of 20 ms or less, up to a quarter of a second (a hidden tab) */
  function frame() {
    var st = T.st;
    if (!T.running()) { return; }
    var now = performance.now(), left = Math.max(0, Math.min(0.25, (now - st.last) / 1000));
    st.last = now;
    while (left > 0 && T.running()) {
      var dt = Math.min(0.02, left);
      T.update(dt);
      left -= dt;
    }
    T.draw();
    if (T.running()) { T.raf = requestAnimationFrame(frame); }
  }
  T.resume = function () {
    T.st.last = performance.now();
    T.raf = requestAnimationFrame(frame);
  };
  /* The focus while the run goes on: the dialogue while it is open, the
     canvas otherwise */
  /* The controls in the bar for each part of the game: the run, the
     economist's dialogue, the walk in 2097, a talk with someone there,
     and the parts with no control but the pause; answers is how many
     answers the number keys pick from. A part with nothing to show keeps a
     hidden key, so the bar keeps its height. */
  T.keys = function (mode, answers) {
    var box = T.q(".troika-keys"), el = S.el, c = T.coarse, list;
    if (box.dataset.mode === mode + (answers || "")) { return; }
    box.dataset.mode = mode + (answers || "");
    if (mode === "run") {
      list = c ? [[[S.t("Tap right")], S.t("jump")], [[S.t("Tap twice")], S.t("double jump")], [[S.t("Hold left")], S.t("duck")]] :
        [[[S.t("Space")], S.t("jump")], [[S.t("Space"), S.t("Space")], S.t("double jump")], [["\u2193", "Ctrl"], S.t("duck")]];
      /* The debug key, shown only while it works */
      if (T.debugOn() && !c) { list.push([["End"], S.t("skip to 2016")]); }
    } else if (mode === "talk") {
      list = c ? [[[S.t("Tap")], S.t("next")]] : [[[S.t("Enter"), S.t("Space")], S.t("next")], [["1\u2013" + (answers || 4)], S.t("answer")], [["Esc"], S.t("pause")]];
    } else if (mode === "chat") {
      list = c ? [[[S.t("Tap")], S.t("next")]] : [[[S.t("Enter"), S.t("Space")], S.t("next")], [["Esc"], S.t("pause")]];
    } else if (mode === "walk" || mode === "door") {
      /* At the economist's door Enter goes in rather than talks */
      var act = mode === "door" ? S.t("go in") : S.t("talk");
      list = c ? [[[S.t("Hold a side")], S.t("walk")], [[S.t("Tap the top")], act]] :
        [[["\u2190", "\u2192"], S.t("walk")], [["A", "D"], S.t("walk")], [[S.t("Enter"), S.t("Space")], act], [["Esc"], S.t("pause")]];
    } else {
      list = c ? [] : [[["Esc"], S.t("pause")]];
    }
    box.textContent = "";
    (list.length ? list : [[["Esc"], S.t("pause")]]).forEach(function (k) {
      var item = el("span", "troika-key");
      k[0].forEach(function (name) { item.appendChild(el("kbd", "", name)); });
      item.appendChild(el("span", "", k[1]));
      if (!list.length) { item.style.visibility = "hidden"; }
      box.appendChild(item);
    });
  };
  T.focusPlay = function () {
    var box = T.q(".troika-talk");
    (T.talk.open() ? box : T.cv).focus({ preventScroll: true });
  };
  function start() {
    cancelAnimationFrame(T.raf);
    T.talk.close();
    T.music("stop");
    if (S.snd.troika) { S.snd.troika.start(); }
    T.st = T.fresh();
    T.q(".troika-gate").hidden = true; T.q(".troika-end").hidden = true; T.q(".troika-pause").hidden = true;
    T.q(".troika-stage").classList.remove("held");
    T.keys("run");
    T.rows();
    T.draw();
    T.cv.focus({ preventScroll: true });
    T.resume();
  }
  /* Landscape windows get a 640 by 320 canvas; a window narrower than 1.2
     times its height (a phone held upright) gets one 320 wide and up to 440
     tall, so the street is drawn larger. The canvas scales smoothly to fill
     the window, and the window takes the canvas's width, so its text rows
     never widen it. On a small display the text on the canvas doubles. */
  function fit() {
    var cv = T.cv;
    if (!cv) { return; }
    var box = T.q(".troika"), chrome = box.offsetHeight - cv.offsetHeight;
    var aw = window.innerWidth - 40, ah = window.innerHeight - 40 - chrome;
    var w = 640, h = 320;
    if (aw / ah < 1.2) { w = 320; h = Math.max(320, Math.min(440, Math.round(320 * ah / aw))); }
    if (w !== cv.width || h !== cv.height) {
      cv.width = w; cv.height = h;
      T.g.imageSmoothingEnabled = false;
      A.size(w, h); T.setSize();
    }
    var s = Math.min(aw / w, ah / h);
    cv.style.width = Math.floor(w * s) + "px";
    cv.style.height = Math.floor(h * s) + "px";
    box.style.width = Math.floor(w * s) + "px";
    A.textScale(s * 7 >= 10 ? 1 : 2);
    if (T.st) { T.draw(); }
  }
  function onHidden() {
    if (document.hidden) { T.hold(true); }
  }
  function close() {
    cancelAnimationFrame(T.raf);
    T.talk.close();
    T.music("stop");
    if (S.snd.hush) { S.snd.hush(false); }
    if (keyHandler) {
      window.removeEventListener("keydown", keyHandler, true);
      window.removeEventListener("keyup", keyHandler, true);
      keyHandler = null;
    }
    window.removeEventListener("resize", fit);
    document.removeEventListener("visibilitychange", onHidden);
    if (T.ov) { T.ov.remove(); T.ov = null; }
    T.st = null; T.cv = null;
    if (S.tmux && S.tmux.focusCur) { S.tmux.focusCur(); }
  }
  function button(label, sound, fn, cls) {
    var b = S.el("button", "btn" + (cls ? " " + cls : ""), label); b.type = "button"; b.dataset.sound = sound;
    b.addEventListener("click", fn);
    return b;
  }
  function build() {
    var el = S.el, ov = T.ov = el("div", "troika-ov");
    /* No context menu over the game, so a right click acts on nothing
       behind it; on the text the browser's menu stays, for copying */
    ov.addEventListener("contextmenu", function (e) {
      e.stopPropagation();
      if (!e.target.closest(".troika-row, .troika-gate, .troika-end, .troika-pause, .troika-talk")) { e.preventDefault(); }
    });
    var box = el("div", "troika");
    box.setAttribute("role", "dialog"); box.setAttribute("aria-label", S.t("TROIKA.RUN"));
    var head = el("div", "troika-head");
    var title = el("span", "troika-title");
    title.appendChild(el("span", "troika-name", S.t("TROIKA.RUN")));
    title.appendChild(el("span", "troika-place"));
    head.appendChild(title);
    var x = el("button", "troika-close", S.t("CLOSE")); x.type = "button"; x.dataset.sound = "close";
    x.addEventListener("click", close);
    head.appendChild(x);
    box.appendChild(head);
    var stage = el("div", "troika-stage");
    var cv = T.cv = document.createElement("canvas"); cv.width = T.W; cv.height = T.H; cv.tabIndex = 0;
    cv.setAttribute("aria-label", S.t("Greece runs ahead of the Troika. Space jumps, twice for a double jump, and Down ducks."));
    T.coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    /* On a touch screen the right half jumps and the left half ducks while
       held; while the economist speaks, a touch shows the next line, and
       in 2097 holding a side walks Greece that way */
    cv.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (T.talk.open()) { T.talk.next(); return; }
      var rect = cv.getBoundingClientRect();
      if (T.walking()) {
        /* A tap on the upper half talks to the person next to Greece */
        if (e.clientY - rect.top < rect.height / 2 && T.talkTo()) { return; }
        T.st.keys.touch = e.clientX - rect.left < rect.width / 2 ? -1 : 1;
        return;
      }
      if (e.clientX - rect.left < rect.width / 2) { T.duck(true); } else { T.jump(); }
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) {
      cv.addEventListener(n, function () { T.duck(false); if (T.st && T.st.keys) { T.st.keys.touch = 0; } });
    });
    stage.appendChild(cv);
    T.g = cv.getContext("2d"); T.g.imageSmoothingEnabled = false;
    A.use(T.g);
    var gate = el("div", "troika-gate"); gate.hidden = true; gate.tabIndex = -1;
    gate.appendChild(el("p", "troika-gate-text"));
    var choices = el("div", "troika-choices");
    [0, 1].forEach(function (i) { choices.appendChild(button("", "choice", function () { T.choose(i); })); });
    gate.appendChild(choices);
    stage.appendChild(gate);
    T.talk.build(stage);
    var pause = el("div", "troika-pause"); pause.hidden = true; pause.tabIndex = -1;
    pause.appendChild(el("p", "", S.t("Paused")));

    var prow = el("div", "troika-choices");
    prow.appendChild(button(S.t("RESUME"), "action", function () { T.hold(false); }));
    /* The music has its own channel in Setup; this opens Setup at it. It
       sits between RESUME and CLOSE, so CLOSE is never next to RESUME */
    prow.appendChild(button(S.t("MUSIC VOLUME"), "action", function () { if (S.settingsDialog) { S.settingsDialog("vMusic"); } }));
    prow.appendChild(button(S.t("CLOSE"), "close", close));
    pause.appendChild(prow);
    stage.appendChild(pause);
    var end = el("div", "troika-end"); end.hidden = true; end.tabIndex = -1;
    end.appendChild(el("p", "troika-end-text"));
    end.appendChild(el("p", "troika-end-score"));
    var erow = el("div", "troika-choices");
    erow.appendChild(button(S.t("TRY AGAIN"), "action", start, "troika-again"));
    erow.appendChild(button(S.t("CLOSE"), "close", close));
    end.appendChild(erow);
    stage.appendChild(end);
    box.appendChild(stage);
    /* The bar under the canvas: the obstacle ahead, and the keys */
    var foot = el("div", "troika-bar");
    var aheadBox = el("span", "troika-ahead");
    aheadBox.appendChild(el("span"));
    foot.appendChild(aheadBox);
    foot.appendChild(el("span", "troika-keys"));
    box.appendChild(foot);
    ov.appendChild(box);
    document.getElementById("screen").appendChild(ov);
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onHidden);
    keyHandler = onKey;
    window.addEventListener("keydown", keyHandler, true);
    window.addEventListener("keyup", keyHandler, true);
  }
  /* The game takes every key while open, ahead of the game's shortcuts. At
     a gate Space does nothing, so a jump never picks a choice, and the
     choice keys wait 0.5 s after the gate opens. While the economist
     speaks, Enter and Space show the next line and the number keys pick an
     answer, and in 2097 the arrows or A and D walk Greece. With debugging
     on, End skips to the end of 2015 (debug.js). */
  function onKey(e) {
    var st = T.st;
    if (!T.ov) { return; }
    /* Setup opened from the pause panel takes the keys while it is open */
    if (document.querySelector(".dlg-ov")) { return; }
    var k = e.key, down = e.type === "keydown";
    if (k === "Tab") { return; }
    e.stopImmediatePropagation();
    /* Copying and selecting text keep working */
    if ((e.ctrlKey || e.metaKey) && /^[acAC]$/.test(k)) { return; }
    if (k === "End" && T.debugOn()) {
      e.preventDefault();
      if (down && !e.repeat) { T.skipToEnd(); }
      return;
    }
    if (k === "Escape") {
      if (!down) { return; }
      e.preventDefault();
      if (st && st.hold) { T.hold(false); } else if (st && st.over) { close(); } else { T.hold(true); }
      return;
    }
    if (st && !st.hold && T.talk.open()) {
      if (!down) { return; }
      if (/^[1-9]$/.test(k)) { e.preventDefault(); if (T.talk.asking()) { T.talk.pick(+k - 1); } return; }
      /* Enter on an answer's button presses it */
      /* The keys that start a talk also go on with it: Up and W as well */
      if ((k === "ArrowUp" || k === "w" || k === "W") || ((k === "Enter" || k === " ") && !(e.target.closest && e.target.closest("button")))) {
        e.preventDefault();
        if (!e.repeat) { T.talk.next(); }
        return;
      }
      if (k === "Enter" || k === " ") { return; }
      e.preventDefault();
      return;
    }
    /* In 2097 the arrows and A and D walk Greece */
    if (st && T.walking() && !st.hold && /^(ArrowLeft|ArrowRight|a|A|d|D)$/.test(k)) {
      e.preventDefault();
      T.walkKey(k, down);
      return;
    }
    /* Enter, Space, Up or W talk to the person next to Greece */
    if (st && T.walking() && !st.hold && /^(Enter| |ArrowUp|w|W)$/.test(k)) {
      e.preventDefault();
      if (down && !e.repeat) { T.talkTo(); }
      return;
    }
    if (st && st.paused && k === " ") { e.preventDefault(); return; }
    if (k === "ArrowDown" || k === "s" || k === "S" || k === "Control") { e.preventDefault(); T.duck(down); return; }
    if (!down) { return; }
    if (st && st.paused) {
      var early = performance.now() - st.gateAt < 500;
      if (k === "1" || k === "2") { e.preventDefault(); if (!early) { T.choose(k === "1" ? 0 : 1); } return; }
      if (k === "Enter") { if (early) { e.preventDefault(); } return; }
    }
    if ((k === " " || k === "ArrowUp" || k === "w" || k === "W") && T.running()) {
      e.preventDefault();
      if (!e.repeat) { T.jump(); }
      return;
    }
    if (k === "Enter" || k === " ") { return; }
    e.preventDefault();
  }
  S.troika = {
    open: function () {
      if (T.ov) { return; }
      build();
      /* Only the soundtrack and the interface sound while the game is open */
      if (S.snd.hush) { S.snd.hush(true); }
      start();
    },
    close: close,
    /* The run's state, for the UI tests */
    state: function () { return T.st; }
  };
})();
