/* The one place that answers "what situation is the game in?". Every module
   reads S.ctx() and keeps no copy of these rules. S.syncContext() writes the
   answer onto <html> as data attributes (data-mode, data-sr, data-motion,
   data-frame, data-screen, data-keys), so stylesheets follow the same rules. */
(function () {
  "use strict";
  var S = window.SELK;
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 700px)") : null;
  /* A touch-first screen (phone or tablet) has a coarse primary pointer. */
  var coarse = window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
  /* True once a key from a hardware keyboard has been pressed since the page
     loaded (see the keydown listener at the end of this block) */
  var kbdSeen = false;

  S.ctx = function () {
    var s = (S.state && S.state.settings) || {};
    var sr = !!s.sr, motion = s.motion || "system", sys = !!S.systemReduced;
    /* Desktop mode exists on wide screens only. On mobile the game always runs
       tmux; the saved choice comes back when the screen is wide again. */
    var mobile = !!(narrow && narrow.matches), desktop = s.mode === "desktop" && !mobile;
    /* Key hints (F2, F4, Ctrl+V) apply only where a keyboard is at hand: never
       on phones, and on tablets only after a hardware keyboard has been used. */
    var keys = !mobile && (!(coarse && coarse.matches) || kbdSeen);
    return {
      mode: desktop ? "desktop" : "tmux",
      desktop: desktop,
      mobile: mobile,
      keys: keys,
      sr: sr,
      motion: motion,
      systemReduced: sys,
      reduced: sr || motion === "reduce" || (motion === "system" && sys),
      frame: s.frame || "full",
      attached: !!(S.tmux && S.tmux.attached)
    };
  };

  S.syncContext = function () {
    var c = S.ctx(), h = document.documentElement, b = document.body, s = (S.state && S.state.settings) || {};
    h.dataset.mode = c.mode;
    h.dataset.sr = c.sr ? "on" : "off";
    h.dataset.motion = c.reduced ? "reduced" : "full";
    h.dataset.frame = c.frame;
    h.dataset.screen = c.mobile ? "narrow" : "wide";
    h.dataset.keys = c.keys ? "on" : "off";
    S.reduced = c.reduced;
    if (b) {
      b.classList.toggle("motion-force", !c.reduced && c.systemReduced);
      b.classList.toggle("motion-reduce", c.reduced && !c.systemReduced);
      b.classList.toggle("sr-mode", c.sr);
      /* Setup > CRT EXTRAS. Each class goes on <body> only when all of its
         conditions hold; crt.css draws the effect from the class.
           scan-roll (Rolling scanline): the setting is ON, motion is FULL
             (c.reduced is false), and screen reader mode is OFF.
           crt-curve (Vignette and curvature): the setting is ON, Frame is
             FULL SCREEN, and screen reader mode is OFF. The MONITOR frame
             already shows a picture of curved glass, so crt-curve on top of
             it would draw a second curve inside the first. */
      b.classList.toggle("scan-roll", !!s.scanRoll && !c.reduced && !c.sr);
      var curved = !!s.crtCurve && s.frame !== "monitor" && !c.sr;
      b.classList.toggle("crt-curve", curved);
      if (S.crtMask) { S.crtMask.fit(); }
    }
    return c;
  };

  /* Setup rows are hidden or greyed by one rule. A row is hidden (here,
     S.SETTING_RULES) when no Setup choice can make it apply: the screen is
     narrow, or screen reader mode is on and the row only changes visuals.
     A row is greyed with its reason (S.SETTING_OFF below) when another
     Setup choice, such as Mode, Frame, Motion or Shell results, makes it
     apply. A rule returns true to show the row. */
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
    crtCurve: function (c) { return !c.sr; }
  };
  /* Settings that stay in view, greyed, with the reason they cannot apply
     right now. A rule returns that reason, or "" when the row is usable.
     tmux-only rows are greyed in desktop mode; switching Mode back to TMUX
     makes them usable again. */
  function tmuxOnly(c) { return c.desktop ? "Used in tmux mode" : ""; }
  /* Rows that only act while Shell results is IN SHELL (route() in
     commands.js and shellOnly() in tmux.js read them only then) */
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
    scanRoll: function (c) { return c.reduced ? "Off while motion is reduced" : ""; },
    crtCurve: function () { return S.state && S.state.settings.frame === "monitor" ? "Not used with the MONITOR frame" : ""; }
  };
  S.settingOff = function (key) {
    var rule = S.SETTING_OFF[key];
    return rule ? rule(S.ctx()) : "";
  };
  S.settingVisible = function (key) {
    var rule = S.SETTING_RULES[key];
    return !rule || rule(S.ctx());
  };

  /* On-screen keyboards send keys only into text fields, and Android ones send
     "Unidentified". A key pressed outside a text field, a function, Escape or
     navigation key, or a Ctrl, Alt or Cmd combination comes from a hardware
     keyboard. Tab is left out because the iPad on-screen keyboard has one. */
  var HW_KEYS = /^(F\d{1,2}|Escape|Arrow\w+|Home|End|PageUp|PageDown|Insert|Delete)$/;
  document.addEventListener("keydown", function (e) {
    if (kbdSeen || !e.isTrusted || e.isComposing || e.keyCode === 229 || !e.key || e.key === "Unidentified") { return; }
    var t = e.target, typing = !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
    if (typing && !HW_KEYS.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) { return; }
    kbdSeen = true;
    if (document.body) { S.syncContext(); }
  }, true);

  if (narrow) {
    var onNarrow = function () { if (document.body) { S.syncContext(); } };
    if (narrow.addEventListener) { narrow.addEventListener("change", onNarrow); } else if (narrow.addListener) { narrow.addListener(onNarrow); }
  }
})();

/* Event bus. Game code announces what happened with S.emit("fill") and calls
   no listener directly; the tour, the accessibility layer and the debug log
   subscribe with S.on(name, fn). S.on("*", fn) receives every event. */
(function () {
  "use strict";
  var S = window.SELK, listeners = {};
  S.on = function (name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
    return function off() { listeners[name] = listeners[name].filter(function (f) { return f !== fn; }); };
  };
  /* Id of the entry opened last, taken from each open:ID event. F4 on the
     desktop uses it when no entry icon is selected. */
  S.lastOpened = null;
  S.emit = function (name, data) {
    if (typeof name === "string" && name.indexOf("open:") === 0) { S.lastOpened = name.slice(5); }
    (listeners[name] || []).concat(listeners["*"] || []).forEach(function (fn) {
      try { fn(name, data); } catch (e) { if (window.console) { console.error(e); } }
    });
  };
})();

/* Window API shared by both interfaces. Game code asks for a kind of window
   ("REPORT", "MAIL", "VIEW", ...) and the current mode decides how it shows:
   as a tmux pane (js/ui/tmux.js) or a desktop window (js/ui/desktop.js). */
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
