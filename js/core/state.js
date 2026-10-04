/* Saved game state and settings, the site clock, and lookups for sections,
   entries and reports. The game saves to sessionStorage (this tab) by default
   and to localStorage (this computer) when the player chooses it. */
(function () {
  var S = window.SELK = window.SELK || {};
  var KEY = "selk-terminal-v1";
  var BASE = Date.UTC(2097, 2, 14, 7, 21);
  function defaults() {
    return {
      sv: 2,
      mode: "tmux",
      frame: "full",
      layout: "four",
      scan: true,
      scanRoll: false,
      crtCurve: false,
      flicker: true,
      glow: true,
      interfere: true,
      poweron: true,
      vol: 75,
      vMachine: 70,
      vWind: 40,
      vUi: 75,
      soundPreset: "balanced",
      vStruct: 65,
      vMusic: 70,
      speed: "instant",
      size: "m",
      click: "single",
      cursor: "m",
      tooltips: true,
      /* Setup > Display > Error messages. "auto": a dialog in desktop mode,
         the status bar in tmux mode. "dialog" and "bar" apply to both modes.
         Read through S.errorsAsDialog (dialogs.js). */
      errors: "auto",
      /* Setup > Display > Scroll long messages. true: a status line message
         wider than its space scrolls by itself (autoScroll in status.js) */
      barScroll: false,
      /* Setup > Display > Pretty wrap. true: the last word of a text block
         stays off a line of its own (body.pretty-wrap) */
      prettyWrap: true,
      /* Setup > Display > Sole pane frames. false: in tmux mode, a pane alone
         in its window and not zoomed has no border or header (paneEl in
         tmux.js) */
      soloFrames: true,
      /* Setup > Display > Unavailable settings. "show": rows that cannot
         apply now are greyed with the reason (S.SETTING_OFF in context.js).
         "hide": those rows are left out. */
      unavailable: "show",
      motion: "system",
      redirectNotes: true,
      shellOut: "view",
      /* Setup > Panel results, read only while shellOut is "shell" in tmux
         mode. It covers the FILES panel, the F keys, the status bar buttons
         and the Alt shortcuts. "view": open their windows. "both": open their
         windows and print their results in the shell (route() in
         commands.js). */
      panelOut: "view",
      /* Setup > Shell-only DESK, read only while shellOut is "shell" in tmux
         mode. true: DESK becomes SHELL and shows only the shell; MAIL stays
         available (shellOnly() in tmux.js) */
      deskShell: false,
      /* Narrow screens: "dual" shows the inbox above MESSAGE, "single" shows
         MESSAGE alone */
      mailList: "dual",
      /* Pane sizes set by dragging a divider, by split (splitKey in tmux.js) */
      splits: {},
      /* Setup > Setup view: "pages", "sections" or "list" (setup.js) */
      setupView: "pages",
      /* Setup > Sound > Control sounds. true: controls marked data-sound
         play their own sound (ui-sound.js) */
      ctlSounds: false,
      debug: false,
      debugLog: false,
      /* Setup > Debug > Fast mode, read through S.fast */
      fast: false
    };
  }
  S.defaults = defaults;
  function fresh() {
    return {
      version: 1,
      name: "",
      cwd: "",
      unlocked: [],
      reports: {},
      active: null,
      sel: null,
      mail: [],
      uplinkHistory: [],
      pending: [],
      clock: 0,
      hintsOn: false,
      light: false,
      hintsShown: {},
      sound: true,
      decision: false,
      endings: [],
      read: [],
      lastEnding: null,
      /* The ending chosen last; unlike lastEnding it survives LOAD SAVE
         (history/2097-NOW shows it) */
      lastDecision: null,
      /* True once the shell announced the Design section, which appears
         after the first ending */
      designNoted: false,
      /* Sections shown from the debug panel without being unlocked */
      debugShow: [],
      settings: defaults()
    };
  }
  S.state = fresh();
  /* Fast mode shortens waits for testing: mail arrives after 80 ms, a
     transmission counts down in 0.3 s and the finale runs at a fraction of
     its length. The value is settings.fast; S.fast reads it. */
  Object.defineProperty(S, "fast", {
    get: function () { return !!(S.state && S.state.settings && S.state.settings.fast); }
  });
  S.KEY = KEY;
  S.WIPE_KEY = "selk-wipe-on-refresh";
  S.HIST_KEY = "selk-shell-history";
  S.LOCAL_KEY = "selk-save-local";
  /* True when the player chose to keep progress on this computer */
  S.saveLocal = function () {
    try {
      return localStorage.getItem(S.LOCAL_KEY) === "1";
    } catch (e) {
      return false;
    }
  };
  function store() {
    return S.saveLocal() ? localStorage : sessionStorage;
  }
  S.store = store;
  /* Move the saved game to this computer (true) or back to this tab (false) */
  S.setSaveLocal = function (on) {
    try {
      var data = JSON.stringify(S.state);
      if (on) {
        localStorage.setItem(S.LOCAL_KEY, "1"); localStorage.setItem(KEY, data); sessionStorage.removeItem(KEY);
      } else {
        localStorage.removeItem(S.LOCAL_KEY); sessionStorage.setItem(KEY, data); localStorage.removeItem(KEY);
      }
    } catch (e) {
      return false;
    }
    return S.save();
  };
  /* True once the player has done something worth keeping */
  S.hasProgress = function () {
    var st = S.state;
    return st.read.length > 0 || st.unlocked.length > 0 || st.endings.length > 0 ||
      Object.keys(st.reports).some(function (k) {
        var r = st.reports[k];
        return r.done || (r.fill || []).some(Boolean);
      });
  };
  S.saveOk = true;
  S.load = function () {
    try {
      if (localStorage.getItem(S.WIPE_KEY) === "1") {
        localStorage.removeItem(KEY);
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem(S.HIST_KEY);
        S.wiped = true;
      }
    } catch (e) {}
    /* Builds before tab saving wrote every save to localStorage. Such a save
       stays there, and selk-save-local is set to mark it as kept on this
       computer. */
    try {
      if (!S.saveLocal() && localStorage.getItem(KEY) && !sessionStorage.getItem(KEY)) {
        localStorage.setItem(S.LOCAL_KEY, "1");
      }
    } catch (e) {}
    try {
      var raw = store().getItem(KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.version === 1) {
          S.state = Object.assign(fresh(), data);
          var ds = data.settings || {};
          S.state.settings = ds.sv === 2 ? Object.assign(defaults(), ds) : defaults();
          /* Older builds had the rolling scanline on by default; it returns
             to off unless the player chose it */
          if (!S.state.settings.scanRollChosen) {
            S.state.settings.scanRoll = false;
          }
          /* Panel results had IN SHELL ("shell") before BOTH replaced it */
          if (S.state.settings.panelOut === "shell") {
            S.state.settings.panelOut = "both";
          }
          /* Older builds had one Debug switch for the panel and the console
             log. A save with it on keeps both on. */
          if (ds.sv === 2 && ds.debug && ds.debugLog === undefined) {
            S.state.settings.debugLog = true;
          }
        }
      }
    } catch (e) {
      S.state = fresh();
    }
    return S.state;
  };
  S.save = function () {
    var ok;
    try {
      store().setItem(KEY, JSON.stringify(S.state)); ok = true;
    }
    catch (e) {
      ok = false;
    }
    var changed = ok !== S.saveOk;
    S.saveOk = ok;
    if (S.afterSave) {
      S.afterSave(changed);
    }
    return ok;
  };
  S.reset = function () {
    S.state = fresh();
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch (e) {}
  };
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  S.fmtTime = function (mins) {
    var d = new Date(BASE + mins * 60000);
    return pad(d.getUTCDate()) + "-" + pad(d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() +
    " " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
  };
  S.tick = function (mins) {
    S.state.clock += mins;
  };
  S.recordUplink = function (type, label) {
    var history = S.state.uplinkHistory || (S.state.uplinkHistory = []);
    var prev = history[history.length - 1];
    if (prev && prev.type === type && prev.label === (label || "") && prev.t === S.state.clock) {
      return;
    }
    history.push({ type: type, label: label || "", t: S.state.clock });
    if (history.length > 24) { history.splice(0, history.length - 24); }
  };
  S.isUnlocked = function (sec) {
    var s = S.sectionById(sec);
    return !!s && (!s.locked || S.state.unlocked.indexOf(sec) !== -1);
  };
  S.reportReady = function (key) {
    if (key !== "R4") {
      return true;
    }
    /* Report 4 opens once either follow-up page (3A or 3B) is accepted. The
       other page stays open, and accepting it before the final choice makes
       the ending that needs it available. */
    var reports = S.state.reports;
    return !!((reports.R3A && reports.R3A.done) || (reports.R3B && reports.R3B.done));
  };
  /* Sections and entries marked egg (the Design section and the serial
     file in System) appear after the first ending, so they show after LOAD
     SAVE. A section with after (History) appears once that section is
     open. A section opened from the debug panel shows at once. Until then
     sectionById treats such a section as missing, and entry lookups for
     commands skip such entries (resolveEntry). */
  function eggShown(x) {
    var open = S.state.unlocked, shown = (S.state.debugShow || []).indexOf(x.id) !== -1;
    if (x.egg && !S.state.endings.length && open.indexOf(x.id) === -1 && !shown) {
      return false;
    }
    return !x.after || open.indexOf(x.after) !== -1 || open.indexOf(x.id) !== -1 || shown;
  }
  /* The sections shown, in display order */
  S.sections = function () {
    return S.SECTIONS.filter(eggShown);
  };
  S.entryShown = function (e) {
    return eggShown(e) && !!S.sectionById(e.id.split("/")[0]);
  };
  /* The entries of a section that are shown, in display order */
  S.entriesOf = function (sec) {
    return S.ENTRIES.filter(function (e) {
      return e.id.split("/")[0] === sec && S.entryShown(e);
    });
  };
  /* True when the entry can be dragged onto a report blank: system files
     and the entries of a section marked nodrag (Home, Design, History) can
     not */
  S.entryDraggable = function (id) {
    var e = S.entryById(id), sec = e && S.SECTIONS.filter(function (s) { return s.id === e.id.split("/")[0]; })[0];
    return !!(e && !e.sys && sec && !sec.nodrag);
  };
  S.sectionById = function (id) {
    for (var i = 0; i < S.SECTIONS.length; i++) {
      if (S.SECTIONS[i].id === id) {
        return eggShown(S.SECTIONS[i]) ? S.SECTIONS[i] : null;
      }
    }
    return null;
  };
  S.entryById = function (id) {
    var low = String(id).toLowerCase();
    for (var i = 0; i < S.ENTRIES.length; i++) {
      if (S.ENTRIES[i].id.toLowerCase() === low) {
        return S.ENTRIES[i];
      }
    }
    return null;
  };
  S.userId = function () {
    var n = (S.state.name || "crew").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return n.replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "crew";
  };
  /* Titles show the section in the game's language (ACASĂ / README); ids stay English */
  S.entryTitle = function (id) {
    var p = id.split("/"), s = S.sectionById(p[0]);
    return (s ? s.name : p[0]).toUpperCase() + " / " + p[1];
  };
  /* Section id from a typed word: the id or the section's name in the game's
     language, ignoring case and accents ("structură", "structura") */
  S.secId = function (word) {
    var w = String(word || "").toLowerCase().replace(/\/$/, "");
    var fold = function (x) { return String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
    for (var i = 0; i < S.SECTIONS.length; i++) {
      var s = S.SECTIONS[i];
      if (s.id === w || fold(s.name) === fold(w)) {
        return s.id;
      }
    }
    return w;
  };
  S.report = function (code) {
    var key = "R" + String(code).toUpperCase().replace(/^R/, "");
    return S.REPORTS[key] ? key : null;
  };
})();
