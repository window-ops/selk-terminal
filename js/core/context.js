/* The game's situation: mode, screen width, keyboard, pointer, motion and
   screen reader mode. Modules read it from S.ctx(). S.syncContext() copies it
   onto <html> as data-mode, data-theme, data-sr, data-motion, data-frame,
   data-screen and data-keys, which the stylesheets read. */
(function () {
  "use strict";
  var S = window.SELK;
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 700px)") : null;
  /* A touch-first screen (phone or tablet) has a coarse primary pointer. */
  var coarse = window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
  /* True after a key from a hardware keyboard (keydown listener below) */
  var kbdSeen = false;
  /* True when an input device draws a pointer: a fine pointer, or a mouse
     moved since the page loaded (pointermove listener below) */
  var fine = window.matchMedia ? window.matchMedia("(any-pointer: fine)") : null;
  var mouseSeen = false;

  S.ctx = function () {
    var s = (S.state && S.state.settings) || {};
    var sr = !!s.sr, motion = s.motion || "system", sys = !!S.systemReduced;
    /* Desktop mode exists on wide screens only. A narrow screen runs tmux and
       keeps the saved mode for later. */
    var mobile = !!(narrow && narrow.matches), desktop = s.mode === "desktop" && !mobile;
    /* Key hints (F2, F4, Ctrl+V) show where a keyboard is in use: never on
       phones, and on tablets after a hardware key press. */
    var keys = !mobile && (!(coarse && coarse.matches) || kbdSeen);
    return {
      mode: desktop ? "desktop" : "tmux",
      /* Which popup theme in css/themes/ is in force. It follows the mode
         inside the session, and the title screen has one of its own, so a
         dialog there does not take the shape of the mode the player happens
         to have saved. */
      theme: S.mode === "title" ? "title" : (desktop ? "desktop" : "tmux"),
      desktop: desktop,
      mobile: mobile,
      keys: keys,
      sr: sr,
      motion: motion,
      systemReduced: sys,
      reduced: sr || motion === "reduce" || (motion === "system" && sys),
      /* A pointer is drawn on screen, so the cursor can be sized */
      pointer: !fine || fine.matches || mouseSeen,
      frame: s.frame || "full",
      attached: !!(S.tmux && S.tmux.attached)
    };
  };

  S.syncContext = function () {
    var c = S.ctx(), h = document.documentElement, b = document.body, s = (S.state && S.state.settings) || {};
    h.dataset.mode = c.mode;
    h.dataset.theme = c.theme;
    h.dataset.sr = c.sr ? "on" : "off";
    h.dataset.motion = c.reduced ? "reduced" : "full";
    h.dataset.frame = c.frame;
    h.dataset.screen = c.mobile ? "narrow" : "wide";
    h.dataset.keys = c.keys ? "on" : "off";
    S.reduced = c.reduced;
    if (b) {
      b.classList.toggle("sr-mode", c.sr);
      /* Setup > Screen effects > CRT extras. A class goes on <body> when all
         its conditions are met; css/crt/screen.css draws the effect.
         scan-roll: the setting is ON, motion is full and screen reader mode
         is OFF. crt-curve: the setting is ON, Frame is FULL SCREEN and screen
         reader mode is OFF. The MONITOR frame already draws curved glass. */
      b.classList.toggle("scan-roll", !!s.scanRoll && !c.reduced && !c.sr);
      var curved = !!s.crtCurve && s.frame !== "monitor" && !c.sr;
      b.classList.toggle("crt-curve", curved);
      if (S.crtMask) { S.crtMask.fit(); }
    }
    return c;
  };

  /* Hidden Setup rows. A row is hidden when no Setup choice can make it
     apply: on a narrow screen, on a device that draws no pointer, or in
     screen reader mode for effects that mode turns off. A rule returns true
     to show the row. */
  S.SETTING_RULES = {
    mode: function (c) { return !c.mobile; },
    /* Narrow screens always show one pane per page (layoutWindows in tmux.js) */
    layout: function (c) { return !c.mobile; },
    motion: function (c) { return !c.sr; },
    speed: function (c) { return !c.sr; },
    scan: function (c) { return !c.sr; },
    flicker: function (c) { return !c.sr; },
    interfere: function (c) { return !c.sr; },
    poweron: function (c) { return !c.sr; },
    scanRoll: function (c) { return !c.sr; },
    crtCurve: function (c) { return !c.sr; },
    /* Touch-only screens draw no pointer */
    cursor: function (c) { return c.pointer; },
    /* Automatic scrolling of status line messages only moves text */
    barScroll: function (c) { return !c.sr; },
    /* The music belongs to the games in the archive, so its channel shows
       once History is open */
    vMusic: function () { return !!(S.sectionById && S.sectionById("history")); }
  };
  /* Greyed Setup rows. A rule returns the reason a row cannot apply now, or
     "" when it can. Another Setup choice, such as Mode, Motion or Shell
     results, makes the row usable. */
  function tmuxOnly(c) { return c.desktop ? "Used in tmux mode" : ""; }
  /* Rows read only while Shell results is IN SHELL (route() in commands.js,
     shellOnly() in tmux.js) */
  function shellOnlyRow(c) {
    return tmuxOnly(c) || (S.state && S.state.settings.shellOut !== "shell" ? "Applies while Shell results is IN SHELL" : "");
  }
  S.SETTING_OFF = {
    layout: tmuxOnly,
    soloFrames: tmuxOnly,
    /* The note is printed only when a typed result opens a window */
    redirectNotes: function (c) {
      return tmuxOnly(c) || (S.state && S.state.settings.shellOut === "shell" ? "Applies while Shell results is IN VIEW" : "");
    },
    panelOut: shellOnlyRow,
    deskShell: shellOnlyRow,
    speed: function (c) { return c.reduced ? "AT ONCE while motion is reduced" : ""; },
    scanRoll: function (c) { return c.reduced ? "Off while motion is reduced" : ""; },
    barScroll: function (c) { return c.reduced ? "Off while motion is reduced" : ""; },
    crtCurve: function () { return S.state && S.state.settings.frame === "monitor" ? "Not used with the MONITOR frame" : ""; }
  };
  /* Setup > Text appears. Reduced motion shows text at once and keeps the
     saved choice for when motion is full again. */
  S.textSpeed = function () {
    var s = (S.state && S.state.settings) || {};
    return S.ctx().reduced ? "instant" : (s.speed || "instant");
  };
  S.settingOff = function (key) {
    var rule = S.SETTING_OFF[key];
    return rule ? rule(S.ctx()) : "";
  };
  S.settingVisible = function (key) {
    var rule = S.SETTING_RULES[key];
    return !rule || rule(S.ctx());
  };

  /* On-screen keyboards send keys only into text fields, and Android ones
     send "Unidentified". A function, Escape or navigation key, a Ctrl, Alt or
     Cmd combination, or any key outside a text field comes from a hardware
     keyboard. Tab is excluded because the iPad on-screen keyboard has one. */
  var HW_KEYS = /^(F\d{1,2}|Escape|Arrow\w+|Home|End|PageUp|PageDown|Insert|Delete)$/;
  document.addEventListener("keydown", function (e) {
    if (kbdSeen || !e.isTrusted || e.isComposing || e.keyCode === 229 || !e.key || e.key === "Unidentified") { return; }
    var t = e.target, typing = !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
    if (typing && !HW_KEYS.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) { return; }
    kbdSeen = true;
    if (document.body) { S.syncContext(); }
  }, true);

  document.addEventListener("pointermove", function (e) {
    if (mouseSeen || !e.isTrusted || e.pointerType !== "mouse") { return; }
    mouseSeen = true;
    if (document.body) { S.syncContext(); }
  }, true);
  if (fine) {
    var onFine = function () { if (document.body) { S.syncContext(); } };
    if (fine.addEventListener) { fine.addEventListener("change", onFine); } else if (fine.addListener) { fine.addListener(onFine); }
  }

  if (narrow) {
    var onNarrow = function () { if (document.body) { S.syncContext(); } };
    if (narrow.addEventListener) { narrow.addEventListener("change", onNarrow); } else if (narrow.addListener) { narrow.addListener(onNarrow); }
  }
})();

/* Event bus. Game code announces events with S.emit(name, data); the tour,
   the accessibility layer and the debug log subscribe with S.on(name, fn).
   S.on("*", fn) receives every event. */
(function () {
  "use strict";
  var S = window.SELK, listeners = {};
  S.on = function (name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
    return function off() { listeners[name] = listeners[name].filter(function (f) { return f !== fn; }); };
  };
  /* Id of the entry opened last (open:ID events). F4 on the desktop uses it
     when no icon is selected. */
  S.lastOpened = null;
  S.emit = function (name, data) {
    if (typeof name === "string" && name.indexOf("open:") === 0) { S.lastOpened = name.slice(5); }
    (listeners[name] || []).concat(listeners["*"] || []).forEach(function (fn) {
      try { fn(name, data); } catch (e) { if (window.console) { console.error(e); } }
    });
  };
})();

/* Window API for both modes. Game code asks for a kind of window ("REPORT",
   "MAIL", "VIEW") and the mode shows it as a tmux pane (tmux.js) or a desktop
   window (desktop.js). */
(function () {
  "use strict";
  var S = window.SELK;
  S.ui = {
    /* Show a window kind, opening it if needed. Returns true when it is on screen. */
    open: function (kind) { return !!(S.tmux && S.tmux.goto(kind)); },
    /* True when the kind is visible right now. */
    isOpen: function (kind) { return !!(S.tmux && S.tmux.visible(kind)); },
    /* Close a kind if that interface allows closing it. */
    close: function (kind) {
      if (!S.tmux || !S.tmux.attached) { return; }
      if (S.ctx().desktop) {
        var w = (S.desk.wins || []).filter(function (x) { return x.kind === kind; })[0];
        if (w) { S.desk.close(w); }
      } else {
        S.tmux.closePane({ kind: kind });
      }
    },
    /* The kind that has the focus: the active pane or the front window. */
    active: function () {
      if (!S.tmux || !S.tmux.attached) { return null; }
      return S.ctx().desktop ? S.desk.activeKind() : (S.tmux.cur && S.tmux.cur.kind);
    }
  };
})();
