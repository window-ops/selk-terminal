/* One place that answers "what situation is the game in?". Every module reads
   S.ctx() instead of working it out again, and S.syncContext() mirrors the answer
   onto <html> as data attributes (data-mode, data-sr, data-motion, data-frame,
   data-screen) so styles can follow it too. */
(function () {
  "use strict";
  var S = window.SELK;
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 700px)") : null;
  /* A touch-first screen (phone or tablet) has a coarse primary pointer. */
  var coarse = window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
  /* Set once a hardware keyboard has typed something during this visit. */
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
      /* The rolling scanline moves, so it runs only when motion is not reduced */
      /* CRT extras are decoration: off in screen reader mode */
      b.classList.toggle("scan-roll", !!s.scanRoll && !c.reduced && !c.sr);
      var curved = !!s.crtCurve && s.frame !== "monitor" && !c.sr;
      b.classList.toggle("crt-curve", curved);
      if (S.crtMask) { S.crtMask.fit(); }
    }
    return c;
  };

  /* Which Setup rows make sense in which situation, in one table */
  S.SETTING_RULES = {
    layout: function (c) { return !c.desktop; },
    mode: function (c) { return !c.mobile; },
    motion: function (c) { return !c.sr; },
    speed: function (c) { return !c.sr; },
    scan: function (c) { return !c.sr; },
    redirectNotes: function () { return !S.state || S.state.settings.shellOut !== "shell"; },
    flicker: function (c) { return !c.sr; },
    interfere: function (c) { return !c.sr; },
    poweron: function (c) { return !c.sr; }
  };
  /* Settings that stay in view but cannot apply right now, with the reason */
  S.SETTING_OFF = {
    scanRoll: function (c) { return c.sr ? "Off in screen reader mode" : c.reduced ? "Off while motion is reduced" : ""; },
    crtCurve: function (c) { return c.sr ? "Off in screen reader mode" : S.state && S.state.settings.frame === "monitor" ? "Not used with the MONITOR frame" : ""; }
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

/* Event bus. Game code announces what happened (S.emit("fill")) instead of
   calling the tutorial, the announcer or anything else directly. Anyone who
   cares subscribes with S.on(name, fn); S.on("*", fn) receives every event. */
(function () {
  "use strict";
  var S = window.SELK, listeners = {};
  S.on = function (name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
    return function off() { listeners[name] = listeners[name].filter(function (f) { return f !== fn; }); };
  };
  /* Remember the last entry opened, for actions such as F4 on the desktop */
  S.lastOpened = null;
  S.emit = function (name, data) {
    if (typeof name === "string" && name.indexOf("open:") === 0) { S.lastOpened = name.slice(5); }
    (listeners[name] || []).concat(listeners["*"] || []).forEach(function (fn) {
      try { fn(name, data); } catch (e) { if (window.console) { console.error(e); } }
    });
  };
})();

/* Window API shared by both interfaces. Game code asks for a kind of window
   ("REPORT", "MAIL", "VIEW", ...) and does not need to know whether tmux panes or
   desktop windows are showing. Mode-specific details stay in panes.js and desktop.js. */
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
