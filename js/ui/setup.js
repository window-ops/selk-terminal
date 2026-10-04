/* Setup: the settings tree, its three views, the help tooltips and
   S.settingsDialog(). */
(function () {
  var S = window.SELK, el = S.el;
  var P = S.savePrompt, wipeOn = P.wipeOn, confirmTabOnly = P.confirmTabOnly, dismissSaveToast = P.dismissToast,
    saveConflict = P.saveConflict, conflictNote = P.conflictNote;

  /* The settings tree. row() is one setting. Its kind is empty for ON and
     OFF, a list of [value, label] pairs for a choice, "range" for a volume
     slider, "select" for a drop-down list and "link" for a button that
     opens another page. sub lists the settings that belong to it. group()
     names a set of settings that has no value of its own; the sections are
     groups. */
  function row(label, key, kind, sub) {
    return { label: label, key: key, kind: kind || null, sub: sub || [] };
  }
  function group(id, title, sub) {
    return { id: id, title: title, sub: sub };
  }
  var VIEW_ROW = row("Setup view", "setupView", [["pages", "PAGES"], ["sections", "SECTIONS"], ["list", "FULL LIST"]]);
  /* The Language label keeps the English word after the translation */
  function langRow() {
    var l = S.t("Language");
    return row(l === "Language" ? l : l + " / Language", "lang", "select");
  }
  var VOLUME = "range";
  /* Groups come after the settings of their list, so additional settings
     are always at the bottom */
  var SECTIONS = [
    group("access", "ACCESSIBILITY", [
      row("Screen reader mode", "sr"),
      row("Motion", "motion", [["system", "SYSTEM"], ["always", "FULL"], ["reduce", "REDUCED"]])
    ]),
    group("display", "DISPLAY", [
      row("Mode", "mode", [["tmux", "TMUX"], ["desktop", "DESKTOP"]]),
      row("Frame", "frame", [["full", "FULL SCREEN"], ["monitor", "MONITOR"]]),
      row("Text size", "size", [["s", "S"], ["m", "M"], ["l", "L"]]),
      row("Cursor size", "cursor", [["s", "S"], ["m", "M"], ["l", "L"], ["sys", "SYSTEM"]]),
      row("Pretty wrap", "prettyWrap"),
      row("Layout", "layout", [["four", "FOUR PANES"], ["three", "THREE PANES"], ["single", "SINGLE"]]),
      row("Sole pane frames", "soloFrames"),
      group("messages", "MESSAGES", [
        row("Error messages", "errors", [["auto", "BY MODE"], ["dialog", "DIALOG"], ["bar", "STATUS BAR"]]),
        row("Scroll long messages", "barScroll")
      ]),
      group("setupscreen", "SETUP SCREEN", [
        row("Tooltips", "tooltips"),
        row("Unavailable settings", "unavailable", [["show", "SHOW"], ["hide", "HIDE"]])
      ])
    ]),
    group("input", "TEXT AND INPUT", [
      row("Text appears", "speed", [["instant", "AT ONCE"], ["vfast", "VERY FAST"], ["fast", "FAST"], ["typed", "NORMAL"], ["slow", "SLOW"]]),
      row("Open items with", "click", [["single", "ONE CLICK"], ["double", "TWO CLICKS"]]),
      group("shell", "SHELL OUTPUT", [
        row("Shell results", "shellOut", [["view", "IN VIEW"], ["shell", "IN SHELL"]]),
        row("Panel results", "panelOut", [["view", "IN VIEW"], ["both", "BOTH"]]),
        row("Shell-only DESK", "deskShell"),
        row("Redirect notices", "redirectNotes")
      ])
    ]),
    group("effects", "SCREEN EFFECTS", [
      row("Scanlines", "scan"),
      row("Flicker", "flicker"),
      row("Glow", "glow"),
      row("Interference", "interfere"),
      row("Power-on", "poweron"),
      /* Both are OFF in a new game. S.syncContext lists when they apply. */
      group("crt", "CRT EXTRAS", [
        row("Rolling scanline", "scanRoll"),
        row("Vignette and curvature", "crtCurve")
      ])
    ]),
    group("sound", "SOUND", [
      row("Sound", "_sound"),
      row("Preset", "soundPreset", [["balanced", "BALANCED"], ["speakers", "DESK SPEAKERS"], ["headphones", "HEADPHONES"], ["quiet", "QUIET"]]),
      row("Master", "vol", VOLUME),
      row("Control sounds", "ctlSounds"),
      group("channels", "CHANNELS", [
        row("Machine", "vMachine", VOLUME),
        row("Wind", "vWind", VOLUME),
        row("Interface", "vUi", VOLUME),
        row("Structure", "vStruct", VOLUME),
        row("Music", "vMusic", VOLUME)
      ])
    ]),
    group("hints", "HINTS", [
      row("Hints page", "_hintsOn"),
      row("Hint light", "_light")
    ]),
    group("debug", "DEBUG", [
      row("Debug panel", "debug"),
      row("Debug log", "debugLog"),
      row("Fast mode", "fast")
    ]),
    group("data", "SAVED DATA", [
      row("Save location", "_saveLocal", [["tab", "THIS TAB"], ["local", "THIS COMPUTER"]]),
      row("Wipe data on refresh", "_wipe"),
      row("Storage page", "_storage", "link"),
      row("Reset progress", "_erase", "link")
    ])
  ];

  /* Open sections (SECTIONS view) and the open page (PAGES view, a list of
     ids from the top) last until the page reloads */
  var openSecs = {}, page = [], focusSetting = null;

  function getv(k) {
    var st = S.state;
    if (k === "_wipe") { return wipeOn(); }
    if (k === "lang") { return S.i18n.lang(); }
    if (k === "_saveLocal") { return S.saveLocal() ? "local" : "tab"; }
    if (k === "_sound") { return st.sound; }
    if (k === "_hintsOn") { return st.hintsOn; }
    if (k === "_light") { return st.light; }
    /* While motion is reduced, text appears at once (S.textSpeed) */
    if (k === "speed") { return S.textSpeed(); }
    return st.settings[k];
  }
  function setv(k, v) {
    var st = S.state;
    if (k === "lang") {
      S.i18n.set(v); return;
    }
    if (k === "_saveLocal") {
      /* Moving the save back to this tab asks first, since closing the tab
         then erases it */
      if (v === "tab" && S.saveLocal()) {
        setTimeout(confirmTabOnly, 0); return;
      }
      S.setSaveLocal(v === "local"); dismissSaveToast(); S.status(); return;
    }
    if (k === "_wipe") {
      try {
        if (v) { localStorage.setItem(S.WIPE_KEY, "1"); } else { localStorage.removeItem(S.WIPE_KEY); }
      } catch (e) {}
      return;
    }
    if (k === "mode") {
      S.setMode(v);
      setTimeout(function () { if (S.dlg) { S.settingsDialog(); } }, 0);
      return;
    }
    if (k === "_sound") {
      st.sound = v; S.snd.setOn(v);
    } else if (k === "_hintsOn") {
      st.hintsOn = v;
    } else if (k === "_light") {
      st.light = v; S.hintLit = false;
    } else {
      if (k === "scanRoll") { st.settings.scanRollChosen = true; }
      if (k === "soundPreset") { S.snd.preset(v); }
      var old = st.settings[k];
      st.settings[k] = v;
      var changed = old !== v, tmux = S.tmux.attached && !S.isDesktop();
      if (k === "layout" && changed && S.tmux.attached) { S.tmux.init(); }
      /* Both settings decide whether DESK shows only the shell, so the
         windows are rebuilt (shellOnly() in tmux.js) */
      if ((k === "deskShell" || k === "shellOut") && changed && tmux) {
        S.tmux.open.revealed = false; S.tmux.rebuild(null, null);
      }
      /* A sole pane gains or loses its frame at once */
      if (k === "soloFrames" && changed && tmux) { S.tmux.render(); }
    }
    S.save(); S.applySettings(); S.status();
    if (k === "interfere" && S.previewInterference) {
      S.previewInterference(!!v);
    }
  }
  /* A drop-down list drawn by the game, since a native <select> shows a
     system list and the system pointer. The list takes the arrow keys,
     Home, End, Enter and Space, and closes on Escape, Tab or a press
     outside it. */
  function pick(k, v, label, choices) {
    var wrap = el("span", "set-pick");
    var btn = el("button", "opt set-pick-btn"); btn.type = "button"; btn.dataset.sound = "menu";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.dataset.value = v;
    var list = null;
    function nameOf(code) {
      var c = choices.filter(function (x) { return x[0] === code; })[0];
      return c ? c[1] : code;
    }
    function show() {
      btn.textContent = nameOf(btn.dataset.value);
      btn.lang = btn.dataset.value;
      btn.setAttribute("aria-label", label + ": " + nameOf(btn.dataset.value));
    }
    function items() { return list ? [].slice.call(list.children) : []; }
    function close(refocus) {
      if (!list) { return; }
      list.remove(); list = null; S.closePick = null;
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      if (refocus) { btn._quiet = true; btn.focus({ preventScroll: true }); btn._quiet = false; }
    }
    function outside(e) {
      if (!wrap.contains(e.target)) { close(false); }
    }
    function choose(code) {
      close(true);
      if (code === btn.dataset.value) { return; }
      btn.dataset.value = code; show();
      S.snd.tick();
      setv(k, code);
    }
    function open() {
      if (list) { return; }
      hideTip();
      list = el("span", "set-pick-list");
      list.setAttribute("role", "listbox");
      list.setAttribute("aria-label", label);
      choices.forEach(function (c) {
        var o = el("button", "set-pick-item", c[1]); o.type = "button"; o.tabIndex = -1; o.dataset.sound = "menu";
        o.lang = c[0]; o.dataset.value = c[0];
        o.setAttribute("role", "option");
        o.setAttribute("aria-selected", c[0] === btn.dataset.value ? "true" : "false");
        o.addEventListener("click", function () { choose(c[0]); });
        list.appendChild(o);
      });
      list.addEventListener("keydown", function (e) {
        var all = items(), i = all.indexOf(document.activeElement), n = -1;
        if (e.key === "ArrowDown") { n = (i + 1) % all.length; }
        else if (e.key === "ArrowUp") { n = (i - 1 + all.length) % all.length; }
        else if (e.key === "Home") { n = 0; }
        else if (e.key === "End") { n = all.length - 1; }
        else if (e.key === "Escape" || e.key === "Tab") {
          e.preventDefault(); e.stopPropagation(); close(true); return;
        }
        else { return; }
        e.preventDefault(); e.stopPropagation();
        all[n].focus({ preventScroll: true });
      });
      wrap.appendChild(list);
      S.closePick = function () { close(true); };
      btn.setAttribute("aria-expanded", "true");
      document.addEventListener("pointerdown", outside, true);
      var cur = list.querySelector("[aria-selected='true']") || list.firstChild;
      cur.focus({ preventScroll: true });
    }
    btn.addEventListener("click", function () {
      if (list) { close(true); } else { open(); }
    });
    /* Alt with an arrow also opens the list; a plain arrow moves to the
       next row (S.keyNav) */
    btn.addEventListener("keydown", function (e) {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.altKey) {
        e.preventDefault(); e.stopPropagation(); open();
      }
    });
    show();
    wrap.appendChild(btn);
    return wrap;
  }
  function opt(label, on, fn) {
    var b = el("button", "opt" + (on ? " on" : ""), S.t(label));
    b.type = "button"; b.dataset.sound = "toggle";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.addEventListener("click", fn);
    return b;
  }
  /* Help for each row, shown as a tooltip on hover or keyboard focus and
     linked with aria-describedby. HELP is one line about the row. OPTION_HELP
     has one line per button, shown while that button has the pointer or the
     focus. A button's screen reader description is the row line followed by
     its own. */
  var HELP = {
    sr: "Adapts the game to a screen reader.",
    motion: "Motion settings.",
    mode: "How the game is shown.",
    tooltips: "Show or hide setup tooltips.",
    prettyWrap: "How lines break in paragraphs.",
    errors: "Where error messages appear.",
    barScroll: "Status bar messages too long for the bar.",
    soloFrames: "Border and header of a pane alone in its window.",
    unavailable: "Settings that cannot apply right now.",
    frame: "How the screen is framed.",
    layout: "How the terminal panes are arranged on the main DESK window.",
    click: "Whether one click or two clicks opens a record, drawer or icon.",
    speed: "How quickly text appears. A click or key press finishes the line.",
    size: "Size of all text in the game.",
    cursor: "Size of the mouse pointer.",
    scan: "Thin horizontal lines, like an old tube screen.",
    scanRoll: "A bright band of scanlines that drifts down the screen.",
    soundPreset: "Levels and tone for what you listen on. The sliders below stay adjustable.",
    crtCurve: "The curved glass of a tube screen, outside the MONITOR frame.",
    flicker: "A faint, irregular flicker of the screen.",
    glow: "A soft glow around the letters.",
    interfere: "The screen shakes briefly during strong wind gusts.",
    poweron: "The short animation when the screen switches on.",
    _sound: "Switches all sound on or off.",
    vol: "Overall loudness of the game.",
    vMachine: "The computer itself: fan, hum and hard drive.",
    vWind: "The wind outside the base.",
    vUi: "Clicks, key presses and alert tones.",
    vStruct: "Creaks and thuds from the tower.",
    vMusic: "The music of the games in the archive.",
    _hintsOn: "The HINTS command shows clues one at a time.",
    _light: "A HINT lamp in the status bar.",
    lang: "Language of the whole game. Switching keeps progress.",
    _saveLocal: "Where progress is saved.",
    _wipe: "Erases progress at every reload.",
    _storage: "The data this game keeps in your browser.",
    _erase: "Erase all progress and restart.",
    shellOut: "Where typed commands show their results.",
    panelOut: "Where FILES, the F keys and the status bar show their results.",
    fast: "Shorter waits, for testing.",
    deskShell: "DESK becomes SHELL and retains only the shell.",
    redirectNotes: "A note in the shell when a result opens in VIEW.",
    debug: "A movable DEBUG panel for testing.",
    debugLog: "A log of everything the game does, in the browser's console.",
    setupView: "How Setup lists the settings.",
    ctlSounds: "A sound of its own for each kind of control."
  };
  var OPTION_HELP = {
    sr: {
      on: "Text appears at once and moving effects stop.",
      off: "Standard display and effects."
    },
    speed: {
      instant: "Text appears immediately.",
      vfast: "450 letters per second.",
      fast: "260 letters per second.",
      typed: "110 letters per second.",
      slow: "55 letters per second."
    },
    motion: {
      system: "Follow your computer's setting.",
      always: "Always animate.",
      reduce: "Minimize movement. Text appears at once."
    },
    mode: {
      tmux: "Terminal panes.",
      desktop: "Icons and windows, like an old home computer."
    },
    frame: {
      full: "Use the full browser window.",
      monitor: "An old monitor with POWER and HDD lights."
    },
    layout: {
      four: "Show four panes.",
      three: "Show three panes.",
      single: "Show one pane."
    },
    click: {
      single: "Open with one click.",
      double: "Open with two clicks."
    },
    size: {
      s: "Small text.",
      m: "Medium text.",
      l: "Large text."
    },
    cursor: {
      s: "Small custom cursor.",
      m: "Medium custom cursor.",
      l: "Large custom cursor.",
      sys: "Use system cursor."
    },
    soloFrames: {
      on: "Draw them.",
      off: "Hide them. The pane's context menu keeps CLOSE, POP IN and SHOW INBOX."
    },
    tooltips: {
      on: "Show tooltips.",
      off: "Hide tooltips."
    },
    prettyWrap: {
      on: "Keep the last word of a paragraph off a line of its own.",
      off: "Break lines where the browser breaks them."
    },
    barScroll: {
      on: "They scroll by themselves, one character at a time, then stop at the end.",
      off: "They scroll with the wheel, a drag or the arrow keys."
    },
    errors: {
      auto: "A dialog in desktop mode, the status bar in tmux mode.",
      dialog: "A dialog in both modes.",
      bar: "The status bar in both modes."
    },
    unavailable: {
      show: "Show them greyed, with the reason beside each one.",
      hide: "Leave them out until they can apply."
    },
    scan: {
      on: "Show still lines over the screen.",
      off: "Hide the lines."
    },
    scanRoll: {
      on: "Show the drifting band, when motion is not reduced.",
      off: "Hide the band."
    },
    soundPreset: {
      balanced: "The default levels.",
      speakers: "No deep bass, clearer clicks, wider stereo.",
      headphones: "Gentle stereo.",
      quiet: "Lower the machine and the wind."
    },
    crtCurve: {
      on: "Dim edges, a faint glare and a curved outline.",
      off: "Plain screen edges."
    },
    flicker: {
      on: "Let the screen flicker.",
      off: "Keep the screen steady."
    },
    glow: {
      on: "Soft glow around the letters.",
      off: "Sharp letters."
    },
    interfere: {
      on: "Shake the screen in strong gusts.",
      off: "Keep the screen still in gusts."
    },
    poweron: {
      on: "Play the animation at switch-on.",
      off: "Show the screen at once."
    },
    _sound: {
      on: "Play all sound.",
      off: "Mute the game."
    },
    _hintsOn: {
      on: "Show the hints page.",
      off: "Keep hints hidden."
    },
    _light: {
      on: "Light the lamp when the open record answers a gap.",
      off: "Keep the lamp off."
    },
    _saveLocal: {
      tab: "Keep progress until this tab closes.",
      local: "Keep progress in this browser, to continue another day."
    },
    _wipe: {
      on: "Start a new game at every reload, for testing.",
      off: "Keep progress across reloads."
    },
    _storage: {
      open: "View or delete each key."
    },
    _erase: {
      open: "Confirm before all progress is erased."
    },
    shellOut: {
      view: "Open results in the VIEW window.",
      shell: "Print results in the shell, which then works on its own."
    },
    panelOut: {
      view: "Open their windows only.",
      both: "Open their windows and print their results in the shell."
    },
    deskShell: {
      on: "Keep SHELL alone on DESK; MAIL and WATCH stay available.",
      off: "Show FILES and VIEW in DESK."
    },
    fast: {
      on: "Mail in 80 ms, transmissions in 0.3 s, a short finale.",
      off: "Normal waits."
    },
    redirectNotes: {
      on: "Print the note.",
      off: "Skip the note."
    },
    debug: {
      on: "Show the situation and buttons that trigger test actions.",
      off: "Hide the panel."
    },
    debugLog: {
      on: "Print commands, events, windows and saves. Filter by SELK.",
      off: "Keep the console quiet."
    },
    ctlSounds: {
      on: "Keys, switches, tabs, pages and menus each make their own sound.",
      off: "Every control makes the same click."
    },
    setupView: {
      pages: "Open each section on its own page.",
      sections: "Group settings under headers that open.",
      list: "Show all settings."
    }
  };
  var tip = null, tipSeq = 0;
  function tipText(text) { return String(text).replace(/\.\s*$/, ""); }
  function showTip(row, key, optKey, ev) {
    if (S.state.settings.tooltips === false) { hideTip(); return; }
    var box = row.closest(".dlg");
    if (!box || !HELP[key]) { return; }
    if (!tip) { tip = el("div", "set-tip"); tip.setAttribute("aria-hidden", "true"); }
    if (tip.parentNode !== box) {
      tip._key = null;
      box.appendChild(tip);
    }
    var sameSetting = tip._key === key;
    var keepPosition = !ev && sameSetting && tip._left != null && tip._top != null;
    if (tip.hidden || !sameSetting) { tip._shownAt = Date.now(); }
    tip._row = row;
    var extra = optKey && OPTION_HELP[key] && OPTION_HELP[key][optKey];
    /* Tooltips end without a period */
    tip.textContent = tipText(S.t(extra || HELP[key]));
    tip.hidden = false;
    /* Measured at the dialog's corner, where it wraps as it does once placed */
    tip.style.left = "0px"; tip.style.top = "0px";
    prettyWrapTip(tip);
    var bb = box.getBoundingClientRect(), th = tip.offsetHeight, tw = tip.offsetWidth;
    var x, y;
    if (ev && ev.clientX != null && ev.clientY != null) {
      var px = ev.clientX - bb.left, py = ev.clientY - bb.top;
      /* Right of the pointer, or left of it when the right edge is too close */
      var left = px - tw - 8, right = px + 8;
      x = right + tw <= bb.width - 8 ? right : left;
      var above = py - th - 8, below = py + 8;
      if (above >= 4) { y = above; }
      else if (below + th <= bb.height - 4) { y = below; }
      else { y = bb.height - py >= py ? below : above; }
    } else if (keepPosition) {
      /* A click that rebuilds the row restores the focus without pointer
         coordinates, so the tip keeps its last position */
      x = tip._left;
      y = tip._top;
    } else {
      var rr = row.getBoundingClientRect(), rowTop = rr.top - bb.top, rowBottom = rr.bottom - bb.top;
      x = rr.left - bb.left;
      y = rowTop >= th + 4 ? rowTop - th - 4 : rowBottom + 4;
    }
    tip._key = key;
    tip._left = Math.max(8, Math.min(bb.width - tw - 8, x));
    tip._top = Math.max(4, Math.min(bb.height - th - 4, y));
    tip.style.left = tip._left + "px";
    tip.style.top = tip._top + "px";
  }
  function hideTip(preservePosition) {
    if (tip) {
      tip.hidden = true;
      if (!preservePosition) { tip._key = null; }
    }
  }
  /* The row's button closest to the pointer, if it is within 1em */
  function nearestControl(row, e) {
    var reach = parseFloat(getComputedStyle(row).fontSize) || 16, best = null, bestD = Infinity;
    row.querySelectorAll(".set-ctl button[data-value]").forEach(function (b) {
      var r = b.getBoundingClientRect();
      var dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      var dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestD) { bestD = d; best = b; }
    });
    return bestD <= reach ? best : null;
  }
  /* A tip of two lines or more keeps its last word off a line of its own */
  function prettyWrapTip(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    if (range.getClientRects().length < 2) { return; }
    S.wrapLast(node);
  }
  function attachHelp(row, key) {
    if (!HELP[key]) { return; }
    var d = el("span", "sr-only", tipText(S.t(HELP[key]))); d.id = "set-help-" + (++tipSeq);
    row.appendChild(d);
    row.querySelectorAll("button, input, select").forEach(function (c) {
      var own = c.dataset.value && OPTION_HELP[key] && OPTION_HELP[key][c.dataset.value], ids = d.id;
      if (own && !c.getAttribute("aria-haspopup")) {
        var od = el("span", "sr-only", tipText(S.t(own))); od.id = "set-help-" + (++tipSeq);
        row.appendChild(od); ids += " " + od.id;
      }
      c.setAttribute("aria-describedby", ids);
      var ok = c.dataset.value, popup = c.getAttribute("aria-haspopup");
      /* A drop-down shows its tip on keyboard focus only, so the tip never
         covers the list */
      if (!popup) {
        c.addEventListener("mousemove", function (e) { showTip(row, key, ok, e); });
      }
      c.addEventListener("focus", function () {
        if (popup && (c._quiet || !c.matches(":focus-visible") || c.getAttribute("aria-expanded") === "true")) { return; }
        showTip(row, key, popup ? null : ok);
      });
      c.addEventListener("blur", function (e) {
        var next = e.relatedTarget;
        /* A button removed by a rebuild also sends a blur, at any time */
        if (!c.isConnected) { return; }
        /* Focus moving to another Setup control keeps the position; that
           control's focus handler places the tip */
        hideTip(!!(next && next.dataset.settingKey));
      });
    });
    /* Between or beside buttons, the tip of the nearest button within 1em
       shows, so crossing a gap does not flash the row's tip */
    row.addEventListener("mousemove", function (e) {
      if (e.target.closest("button, input, select, .set-pick")) { return; }
      var near = nearestControl(row, e);
      if (near && near.getAttribute("aria-haspopup")) { hideTip(); return; }
      showTip(row, key, near ? near.dataset.value : null, e);
    });
    row.addEventListener("mouseleave", hideTip);
    /* On touch screens a tap on the label shows or hides the tip */
    var label = row.querySelector(".set-label");
    if (S.state.settings.tooltips !== false) {
      label.setAttribute("role", "button");
      label.tabIndex = -1;
      var how = el("span", "sr-only", S.t("Click to reveal the tooltip")); how.id = "set-how-" + (++tipSeq);
      row.appendChild(how);
      label.setAttribute("aria-describedby", how.id);
    }
    label.addEventListener("click", function (e) {
      /* A tap first sends a mousemove that opens the tip, so only a tip
         open before the tap closes */
      if (tip && !tip.hidden && tip._row === row && Date.now() - tip._shownAt > 400) { hideTip(); return; }
      showTip(row, key, null, e);
    });
  }


  /* The part of a list that Setup shows. A setting hidden by
     S.SETTING_RULES, or by Unavailable settings HIDE, gives its place to
     the settings under it. A group left empty is dropped. */
  function shown(r) {
    return S.settingVisible(r.key) && (S.state.settings.unavailable !== "hide" || !S.settingOff(r.key));
  }
  function visible(list) {
    var out = [];
    list.forEach(function (n) {
      var sub = visible(n.sub || []);
      if (n.key == null) {
        if (sub.length) { out.push(group(n.id, n.title, sub)); }
      } else if (shown(n)) {
        out.push(row(n.label, n.key, n.kind, sub));
      } else {
        out = out.concat(sub);
      }
    });
    return out;
  }
  /* Settings in a list and under it; buttons that open a page do not count */
  function count(list) {
    return list.reduce(function (n, x) {
      return n + (x.key != null && x.kind !== "link" ? 1 : 0) + count(x.sub || []);
    }, 0);
  }
  function idOf(n) {
    return n.key != null ? n.key : n.id;
  }

  function makeRow(r, body) {
    var line = el("div", "set-row");
    line.appendChild(el("span", "set-label", S.t(r.label)));
    var ctl = el("span", "set-ctl"), k = r.key, v = getv(k);
    if (r.kind === "link") {
      var open = k === "_erase"
        ? opt("RESET", false, function () {
          hideTip(); S.deleteAllGameData(function () { S.settingsDialog(); });
        })
        : opt("OPEN", false, function () {
          hideTip(); setTimeout(function () { S.storagePage(true); }, 0);
        });
      open.dataset.value = "open"; open.dataset.sound = "page";
      ctl.appendChild(open);
    } else if (r.kind === "select") {
      ctl.appendChild(pick(k, v, S.t(r.label), S.i18n.choices()));
    } else if (r.kind === "range") {
      var rg = el("input", "set-range"); rg.type = "range"; rg.min = 0; rg.max = 100; rg.step = 5; rg.value = v;
      rg.dataset.sound = "slide";
      rg.setAttribute("aria-label", S.t("{name} volume", { name: S.t(r.label) }));
      var lab = el("span", "set-val", v + " %");
      rg.setAttribute("aria-valuetext", S.t("{n} percent", { n: v }));
      rg.addEventListener("input", function () {
        S.state.settings[k] = +rg.value; lab.textContent = rg.value + " %";
        rg.setAttribute("aria-valuetext", S.t("{n} percent", { n: rg.value })); S.snd.apply();
      });
      rg.addEventListener("change", function () { S.save(); });
      ctl.appendChild(rg); ctl.appendChild(lab);
    } else {
      var choices = r.kind || [[true, "ON"], [false, "OFF"]];
      choices.forEach(function (o) {
        var b = opt(o[1], o[0] === true ? !!v : o[0] === false ? !v : v === o[0], function () {
          setv(k, o[0]); fill(body);
        });
        b.dataset.value = o[0] === true ? "on" : o[0] === false ? "off" : o[0];
        ctl.appendChild(b);
      });
    }
    line.appendChild(ctl);
    ctl.querySelectorAll("button, input").forEach(function (c) { c.dataset.settingKey = k; });
    attachHelp(line, k);
    /* A setting that cannot apply now stays in view, greyed, with the reason */
    var why = S.settingOff(k);
    if (why) {
      line.classList.add("set-unavail");
      ctl.querySelectorAll("button, input").forEach(function (c) {
        c.disabled = true;
      });
      line.querySelector(".set-label").appendChild(el("span", "set-why", S.t(why)));
    }
    return line;
  }

  /* SECTIONS and FULL LIST: settings that belong to another one sit under
     it, indented on a rule; a group adds its title above its settings */
  function nested(list, body, into) {
    list.forEach(function (n) {
      if (n.key == null) {
        var g = el("div", "set-subgroup");
        var h = el("div", "set-sub-h", S.t(n.title)); h.setAttribute("role", "heading"); h.setAttribute("aria-level", "4");
        g.appendChild(h);
        nested(n.sub, body, g);
        into.appendChild(g);
        return;
      }
      into.appendChild(makeRow(n, body));
      if (n.sub.length) {
        var box = el("div", "set-sub");
        nested(n.sub, body, box);
        into.appendChild(box);
      }
    });
    return into;
  }
  function view() {
    var v = S.state.settings.setupView;
    return v === "list" || v === "sections" ? v : "pages";
  }
  /* SECTIONS: a header that reports its state and shows or hides its rows
     in place, so the focus stays on it */
  function sectionHead(sec, part) {
    var h = el("div", "set-sec-h"); h.setAttribute("role", "heading"); h.setAttribute("aria-level", "3");
    var b = el("button", "set-sec-head"); b.type = "button"; b.dataset.sound = "fold";
    var mark = el("span", "set-sec-mark"); mark.setAttribute("aria-hidden", "true");
    b.appendChild(mark);
    b.appendChild(el("span", "set-sec-name", S.t(sec.title)));
    b.appendChild(el("span", "set-sec-count", S.tn("{n} SETTINGS", count(sec.sub))));
    part.id = "set-sec-" + sec.id;
    b.setAttribute("aria-controls", part.id);
    function show(open) {
      part.hidden = !open;
      b.setAttribute("aria-expanded", open ? "true" : "false");
      b.classList.toggle("open", open);
      mark.textContent = open ? "[-]" : "[+]";
    }
    show(!!openSecs[sec.id]);
    b.addEventListener("click", function () {
      openSecs[sec.id] = !openSecs[sec.id];
      show(openSecs[sec.id]); hideTip();
    });
    h.appendChild(b);
    return h;
  }
  /* PAGES: a button that opens a section on its own page, laid out like
     a section header of the SECTIONS view */
  function navButton(n, body) {
    var b = el("button", "set-sec-head set-nav"); b.type = "button";
    b.dataset.sound = "page"; b.dataset.nav = idOf(n);
    var mark = el("span", "set-sec-mark", "[>]"); mark.setAttribute("aria-hidden", "true");
    b.appendChild(mark);
    b.appendChild(el("span", "set-sec-name", S.t(n.title)));
    b.appendChild(el("span", "set-sec-count", S.tn("{n} SETTINGS", count(n.sub))));
    b.addEventListener("click", function () { go(idOf(n), body); });
    return b;
  }
  /* PAGES: a line, as tall as a setting row, that opens a group or the
     settings under a setting. A group's line shows its title; the line
     under a setting names the settings it opens. */
  function linkRow(n, body) {
    var grp = n.key == null;
    var b = el("button", "set-link " + (grp ? "set-link-grp" : "set-link-sub")); b.type = "button";
    b.dataset.sound = "page"; b.dataset.nav = idOf(n);
    var name = grp ? S.t(n.title) : n.sub.map(function (x) {
      return x.key != null ? S.t(x.label) : S.t(x.title);
    }).join(", ");
    b.appendChild(el("span", "set-link-name", name));
    b.appendChild(el("span", "set-link-count", S.tn("{n} SETTINGS", count(n.sub))));
    var mark = el("span", "set-link-mark"); mark.setAttribute("aria-hidden", "true");
    b.appendChild(mark);
    b.addEventListener("click", function () { go(idOf(n), body); });
    return b;
  }
  /* The nodes on the open page, from the top. An id that no longer leads
     anywhere (a setting hidden since) ends the path there. */
  function pagePath(tree) {
    var path = [], list = tree;
    for (var i = 0; i < page.length; i++) {
      var n = list.filter(function (x) { return idOf(x) === page[i]; })[0];
      if (!n || !n.sub.length) { break; }
      path.push(n); list = n.sub;
    }
    page = page.slice(0, path.length);
    return path;
  }
  /* One part of the page path, coloured by its level like the headings */
  function crumbPart(n, i) {
    var cls = n.key != null ? "set-crumb-set" : i === 0 ? "set-crumb-sec" : "set-crumb-grp";
    return el("span", cls, n.key != null ? S.t(n.label) : S.t(n.title));
  }
  var focusNext = null;
  function go(id, body) {
    hideTip(); page.push(id); focusNext = "back"; fill(body);
  }
  function back(body) {
    hideTip(); focusNext = page.pop(); fill(body);
  }
  function pages(tree, body) {
    var path = pagePath(tree), here = path[path.length - 1];
    if (!here) {
      var navs = el("div", "set-navs");
      tree.forEach(function (sec) { navs.appendChild(navButton(sec, body)); });
      body.appendChild(navs);
      return;
    }
    var crumb = el("div", "set-crumb");
    var bk = el("button", "btn set-back", S.t("BACK")); bk.type = "button";
    bk.dataset.sound = "back"; bk.dataset.nav = "back";
    bk.addEventListener("click", function () { back(body); });
    crumb.appendChild(bk);
    var where = el("span", "set-where");
    path.forEach(function (n, i) {
      if (i) { where.appendChild(document.createTextNode(" / ")); }
      where.appendChild(crumbPart(n, i));
    });
    where.setAttribute("role", "heading"); where.setAttribute("aria-level", "3");
    crumb.appendChild(where);
    body.appendChild(crumb);
    /* The page's settings first, then the lines that open additional
       settings: those under a setting, in row order, then the groups */
    var part = el("div", "set-list"), more = [];
    here.sub.forEach(function (n) {
      if (n.key != null) { part.appendChild(makeRow(n, body)); }
      if (n.key != null && n.sub.length) { more.push(n); }
    });
    here.sub.forEach(function (n) { if (n.key == null) { more.push(n); } });
    if (more.length) {
      var box = el("div", "set-more");
      more.forEach(function (n) { box.appendChild(linkRow(n, body)); });
      part.appendChild(box);
    }
    if (here.id === "data" && saveConflict()) { part.appendChild(conflictNote()); }
    body.appendChild(part);
  }

  function fill(body) {
    var active = document.activeElement, keepFocus = body.contains(active);
    var settingKey = keepFocus && active.dataset.settingKey, settingValue = keepFocus && active.dataset.value;
    var v = view(), tree = visible(SECTIONS);
    /* The tip keeps its place across the rebuild: restoreFocus shows it
       again at the saved position */
    var pin = tip && !tip.hidden ? { key: tip._key, left: tip._left, top: tip._top } : null;
    body.textContent = "";
    body.classList.add("set-body");
    body.classList.toggle("set-folding", v === "sections");
    if (v !== "pages" || !page.length) {
      body.appendChild(makeRow(langRow(), body));
      if (S.i18n.lang() !== "en") {
        body.appendChild(el("p", "set-note", S.t(S.i18n.NOTICE)));
      }
      body.appendChild(makeRow(VIEW_ROW, body));
    }
    if (v === "pages") {
      pages(tree, body);
    } else {
      tree.forEach(function (sec) {
        var part = nested(sec.sub, body, el("div", v === "sections" ? "set-sec-body" : "set-list"));
        if (sec.id === "data" && saveConflict()) { part.appendChild(conflictNote()); }
        if (v === "sections") {
          var wrap = el("div", "set-sec");
          wrap.appendChild(sectionHead(sec, part));
          wrap.appendChild(part);
          body.appendChild(wrap);
        } else {
          body.appendChild(el("div", "dlg-rule"));
          var g = el("div", "set-group", S.t(sec.title)); g.setAttribute("role", "heading"); g.setAttribute("aria-level", "3");
          body.appendChild(g);
          body.appendChild(part);
        }
      });
    }
    hideTip(true);
    if (pin) { tip._key = pin.key; tip._left = pin.left; tip._top = pin.top; }
    restoreFocus(body, settingKey, settingValue);
  }
  /* After a rebuild the focus returns to the control that had it, or to
     the pressed option of its row. After a page change it goes to BACK, or
     to the button that opened the page that was left. */
  function restoreFocus(body, settingKey, settingValue) {
    var target = null;
    /* Setup opened at a setting (settingsDialog(key)): the focus goes to it */
    if (focusSetting) {
      target = body.querySelector("[data-setting-key='" + focusSetting + "']");
      focusSetting = null;
      if (target) { target.scrollIntoView({ block: "center" }); }
    } else if (focusNext) {
      target = body.querySelector("[data-nav='" + focusNext + "']");
      var where = body.querySelector(".set-where");
      S.announce(where ? where.textContent : S.t("SETUP"));
      focusNext = null;
    } else if (settingKey) {
      var controls = [].slice.call(body.querySelectorAll("[data-setting-key]")).filter(function (c) {
        return c.dataset.settingKey === settingKey;
      });
      target = controls.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0] ||
        controls.filter(function (c) { return !settingValue || c.dataset.value === settingValue; })[0];
    }
    if (target) { target.focus({ preventScroll: true }); }
  }
  /* The groups a setting is in, from the section down */
  function groupsOf(key, list, path) {
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (n.key === key) { return path; }
      var deeper = groupsOf(key, n.sub || [], n.key == null ? path.concat([n.id]) : path.concat([n.key]));
      if (deeper) { return deeper; }
    }
    return null;
  }
  /* Opens Setup; with a key, at that setting: its page, or its section
     unfolded, with the focus on it */
  S.settingsDialog = function (key) {
    if (typeof key === "string") {
      var path = groupsOf(key, SECTIONS, []) || [];
      page = path.slice();
      if (path.length) { openSecs[path[0]] = true; }
      focusSetting = key;
    }
    S.dialog({
      title: "SETUP",
      wide: true,
      build: fill,
      /* CLOSE returns Setup to its first page for the next opening */
      buttons: [{ label: "CLOSE", action: function () { page = []; } }],
      /* Escape leaves a page before it closes Setup */
      onEscape: function (body) {
        if (view() !== "pages" || !page.length) { return false; }
        if (S.state.settings.ctlSounds) { S.snd.ui("back"); }
        back(body); return true;
      }
    });
  };
  S.setupKit = { opt: opt, setv: setv };
})();
