/* The Setup screen: sections, rows, help tooltips and S.settingsDialog(). */
(function () {
  var S = window.SELK, el = S.el;
  var P = S.savePrompt, wipeOn = P.wipeOn, confirmTabOnly = P.confirmTabOnly, dismissSaveToast = P.dismissToast,
    saveConflict = P.saveConflict, conflictNote = P.conflictNote;
  /* Settings */
  /* Setup is split into sections. With the SECTIONS view each one folds open
     from its header; with FULL LIST every row is shown under plain headings.
     A row is [label, key] for ON/OFF, [label, key, options] for a choice, or
     [label, key, "range"] for a volume slider, [label, key, "link"] for a
     button that opens another page. The Setup view row sits above
     the sections, so it is always in reach. */
  var VIEW_ROW = ["Setup view", "setupView", [["sections", "SECTIONS"], ["list", "FULL LIST"]]];
  /* Language sits above the sections, so a player lost in a foreign language
     finds it first. Its label keeps the English word after the translation. */
  function langRow() {
    var l = S.t("Language");
    return [l === "Language" ? l : l + " / Language", "lang", "select"];
  }
  var SECTIONS = [
    { id: "access", title: "ACCESSIBILITY", rows: [
      ["Screen reader mode", "sr"],
      ["Motion", "motion", [["system", "SYSTEM"], ["always", "FULL"], ["reduce", "REDUCED"]]]
    ] },
    { id: "display", title: "DISPLAY", rows: [
      ["Mode", "mode", [["tmux", "TMUX"], ["desktop", "DESKTOP"]]],
      ["Frame", "frame", [["full", "FULL SCREEN"], ["monitor", "MONITOR"]]],
      ["Layout", "layout", [["four", "FOUR PANES"], ["three", "THREE PANES"], ["single", "SINGLE"]]],
      ["Tooltips", "tooltips"],
      ["Text size", "size", [["s", "S"], ["m", "M"], ["l", "L"]]],
      ["Cursor size", "cursor", [["s", "S"], ["m", "M"], ["l", "L"], ["sys", "SYSTEM"]]]
    ] },
    { id: "input", title: "TEXT AND INPUT", rows: [
      ["Text appears", "speed", [["instant", "AT ONCE"], ["vfast", "VERY FAST"], ["fast", "FAST"], ["typed", "NORMAL"], ["slow", "SLOW"]]],
      ["Open items with", "click", [["single", "ONE CLICK"], ["double", "TWO CLICKS"]]],
      ["Shell results", "shellOut", [["view", "IN VIEW"], ["shell", "IN SHELL"]]],
      ["Redirect notices", "redirectNotes"]
    ] },
    { id: "effects", title: "SCREEN EFFECTS", rows: [
      ["Scanlines", "scan"],
      ["Flicker", "flicker"],
      ["Glow", "glow"],
      ["Interference", "interfere"],
      ["Power-on", "poweron"]
    ] },
    /* Optional CRT effects, apart from the main ones */
    { id: "crt", title: "CRT EXTRAS", rows: [
      ["Rolling scanline", "scanRoll"],
      ["Vignette and curvature", "crtCurve"]
    ] },
    { id: "sound", title: "SOUND", rows: [
      ["Sound", "_sound"],
      ["Preset", "soundPreset", [["balanced", "BALANCED"], ["speakers", "DESK SPEAKERS"], ["headphones", "HEADPHONES"], ["quiet", "QUIET"]]],
      ["Master", "vol", "range"],
      ["Machine", "vMachine", "range"],
      ["Wind", "vWind", "range"],
      ["Interface", "vUi", "range"],
      ["Structure", "vStruct", "range"]
    ] },
    { id: "hints", title: "HINTS", rows: [
      ["Hints page", "_hintsOn"],
      ["Hint light", "_light"]
    ] },
    { id: "debug", title: "DEBUG", rows: [
      ["Debug panel", "debug"],
      ["Debug log", "debugLog"]
    ] },
    { id: "data", title: "SAVED DATA", rows: [
      ["Save location", "_saveLocal", [["tab", "THIS TAB"], ["local", "THIS COMPUTER"]]],
      ["Wipe data on refresh", "_wipe"],
      ["Storage page", "_storage", "link"]
    ] }
  ];
  /* Sections the player has opened stay open until the page reloads. */
  var openSecs = {};
  function getv(k) {
    var st = S.state; if (k === "_wipe") {
      return wipeOn();
    } if (k === "lang") {
      return S.i18n.lang();
    } if (k === "_saveLocal") {
      return S.saveLocal() ? "local" : "tab";
    } return k === "_sound" ? st.sound : k === "_hintsOn" ? st.hintsOn : k === "_light" ? st.light : st.settings[k];
  }
  function setv(k, v) {
    var st = S.state;
    if (k === "lang") {
      S.i18n.set(v); return;
    }
    if (k === "_saveLocal") {
      /* Moving a save kept on this computer back to the tab asks first, since
         closing the tab then erases it. Choosing THIS COMPUTER needs no question. */
      if (v === "tab" && S.saveLocal()) {
        setTimeout(confirmTabOnly, 0); return;
      }
      S.setSaveLocal(v === "local"); dismissSaveToast(); S.status(); return;
    }
    if (k === "_wipe") {
      try {
        if (v) {
          localStorage.setItem(S.WIPE_KEY, "1");
        } else {
          localStorage.removeItem(S.WIPE_KEY);
        }
      } catch (e) {} return;
    }
    if (k === "mode") {
      S.setMode(v); setTimeout(function () {
        if (S.dlg) {
          S.settingsDialog();
        }
      }, 0); return;
    }
    if (k === "_sound") {
      st.sound = v; S.snd.setOn(v);
    }
    else if (k === "_hintsOn") {
      st.hintsOn = v;
    }
    else if (k === "_light") {
      st.light = v; S.hintLit = false;
    }
    else {
      if (k === "scanRoll") {
        st.settings.scanRollChosen = true;
      }
      if (k === "soundPreset") {
        S.snd.preset(v);
      }
      var old = st.settings[k]; st.settings[k] = v; if (k === "layout" && old !== v && S.tmux.attached) {
        S.tmux.init();
      }
    }
    S.save(); S.applySettings(); S.status();
    if (k === "interfere" && S.previewInterference) {
      S.previewInterference(!!v);
    }
  }
  /* A drop-down list drawn by the game. A native <select> opens a list drawn
     by the system, which shows the system pointer and cannot follow the game's
     styles. The button looks like every other option; its list opens under it,
     takes the arrow keys, Home, End, Enter and Space, and closes on Escape,
     Tab or a press outside it. */
  function pick(k, v, label, choices) {
    var wrap = el("span", "set-pick");
    var btn = el("button", "opt set-pick-btn"); btn.type = "button";
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
      /* Focus returns to the button without bringing up its tip */
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
        var o = el("button", "set-pick-item", c[1]); o.type = "button"; o.tabIndex = -1;
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
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); e.stopPropagation(); open();
      }
    });
    show();
    wrap.appendChild(btn);
    return wrap;
  }
  function opt(label, on, fn) {
    var b = el("button", "opt" + (on ? " on" : ""), S.t(label)); b.type = "button"; b.setAttribute("aria-pressed", on ? "true" : "false"); b.addEventListener("click", fn); return b;
  }
  /* Help for each Setup row, shown as a tooltip on hover or keyboard focus and
     linked to the controls with aria-describedby so screen readers read it too.
     HELP is one short line about the row, shown over its label. OPTION_HELP has
     one line for each button, shown in its place while that button is under the
     pointer or has the focus, so each tip stays short. A button's screen reader
     description is the row line followed by its own. */
  var HELP = {
    sr: "Adapts the game to a screen reader.",
    motion: "Motion settings.",
    mode: "How the game is shown.",
    tooltips: "Show or hide setup tooltips.",
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
    _hintsOn: "The HINTS command shows clues one at a time.",
    _light: "A HINT lamp in the status bar.",
    lang: "Language of the whole game. Switching keeps progress.",
    _saveLocal: "Where progress is saved.",
    _wipe: "Erases progress at every reload.",
    _storage: "The data this game keeps in your browser.",
    shellOut: "Where typed commands show their results.",
    redirectNotes: "A note in the shell when a result opens in VIEW.",
    debug: "A movable DEBUG panel for testing.",
    debugLog: "A log of everything the game does, in the browser's console.",
    setupView: "How Setup lists the settings."
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
    tooltips: {
      on: "Show tooltips.",
      off: "Hide tooltips."
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
    shellOut: {
      view: "Open results in the VIEW window.",
      shell: "Print results in the shell, which then works on its own."
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
    setupView: {
      sections: "Group settings under headers that open.",
      list: "Show all settings."
    }
  };
  var tip = null, tipSeq = 0;
  function showTip(row, key, optKey, ev) {
    if (S.state.settings.tooltips === false) { hideTip(); return; }
    var box = row.closest(".dlg");
    if (!box || !HELP[key]) { return; }
    if (!tip) { tip = el("div", "set-tip"); tip.setAttribute("aria-hidden", "true"); }
    if (tip.parentNode !== box) { box.appendChild(tip); }
    if (tip.hidden || tip._row !== row) { tip._shownAt = Date.now(); }
    tip._row = row;
    var extra = optKey && OPTION_HELP[key] && OPTION_HELP[key][optKey];
    /* Tooltips end without a period */
    tip.textContent = S.t(extra || HELP[key]).replace(/\.\s*$/, "");
    tip.hidden = false;
    prettyWrapTip(tip);
    var bb = box.getBoundingClientRect(), th = tip.offsetHeight, tw = tip.offsetWidth;
    var x, y;
    if (ev && ev.clientX != null && ev.clientY != null) {
      var px = ev.clientX - bb.left, py = ev.clientY - bb.top;
      var left = px - tw - 8, right = px + 8;
      x = left >= 8 ? left : right + tw <= bb.width - 8 ? right : left;
      var above = py - th - 8, below = py + 8;
      if (above >= 4) { y = above; }
      else if (below + th <= bb.height - 4) { y = below; }
      else { y = bb.height - py >= py ? below : above; }
    } else {
      var rr = row.getBoundingClientRect(), rowTop = rr.top - bb.top, rowBottom = rr.bottom - bb.top;
      x = rr.left - bb.left;
      y = rowTop >= th + 4 ? rowTop - th - 4 : rowBottom + 4;
    }
    tip.style.left = Math.max(8, Math.min(bb.width - tw - 8, x)) + "px";
    tip.style.top = Math.max(4, Math.min(bb.height - th - 4, y)) + "px";
  }
  function hideTip() { if (tip) { tip.hidden = true; } }
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
  function prettyWrapTip(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    if (range.getClientRects().length < 2) { return; }
    var text = node.textContent;
    var match = /(\s+)(\S+)(\s*)$/.exec(text);
    if (!match) { return; }
    var prefix = text.slice(0, match.index);
    if (!/\S[\s\S]*\s\S/.test(prefix + match[2])) { return; }
    node.textContent = prefix + "\u00a0" + match[2] + match[3];
  }
  function attachHelp(row, key) {
    if (!HELP[key]) { return; }
    var d = el("span", "sr-only", S.t(HELP[key])); d.id = "set-help-" + (++tipSeq);
    row.appendChild(d);
    row.querySelectorAll("button, input, select").forEach(function (c) {
      var own = c.dataset.value && OPTION_HELP[key] && OPTION_HELP[key][c.dataset.value], ids = d.id;
      if (own && !c.getAttribute("aria-haspopup")) {
        var od = el("span", "sr-only", S.t(own)); od.id = "set-help-" + (++tipSeq);
        row.appendChild(od); ids += " " + od.id;
      }
      c.setAttribute("aria-describedby", ids);
      var ok = c.dataset.value, popup = c.getAttribute("aria-haspopup");
      /* A drop-down shows no tip under the pointer, since the tip would cover
         its list. Keyboard focus still shows it, for players who cannot hover. */
      if (!popup) {
        c.addEventListener("mousemove", function (e) { showTip(row, key, ok, e); });
      }
      c.addEventListener("focus", function () {
        if (popup && (c._quiet || !c.matches(":focus-visible") || c.getAttribute("aria-expanded") === "true")) { return; }
        showTip(row, key, popup ? null : ok);
      });
      c.addEventListener("blur", hideTip);
    });
    /* Between two buttons, or just beside one, the tip belongs to the nearest
       button within 1em of the pointer. Without this, crossing the small gap
       between buttons flashes the row's tip. Near the drop-down no tip shows,
       as on the drop-down itself. */
    row.addEventListener("mousemove", function (e) {
      if (e.target.closest("button, input, select, .set-pick")) { return; }
      var near = nearestControl(row, e);
      if (near && near.getAttribute("aria-haspopup")) { hideTip(); return; }
      showTip(row, key, near ? near.dataset.value : null, e);
    });
    row.addEventListener("mouseleave", hideTip);
    /* Touch screens have no hover: tapping the label shows or hides its
       tooltip. Screen readers hear it as a button that reveals the tooltip. */
    var label = row.querySelector(".set-label");
    if (S.state.settings.tooltips !== false) {
      label.setAttribute("role", "button");
      label.tabIndex = -1;
      var how = el("span", "sr-only", S.t("Click to reveal the tooltip")); how.id = "set-how-" + (++tipSeq);
      row.appendChild(how);
      label.setAttribute("aria-describedby", how.id);
    }
    label.addEventListener("click", function (e) {
      /* A tap also sends a mousemove that opens the tip first; only a tip that
         was already open before this tap closes */
      if (tip && !tip.hidden && tip._row === row && Date.now() - tip._shownAt > 400) { hideTip(); return; }
      showTip(row, key, null, e);
    });
  }

  function makeRow(r, body) {
    var row = el("div", "set-row");
    row.appendChild(el("span", "set-label", S.t(r[0])));
    var ctl = el("span", "set-ctl"), k = r[1], v = getv(k);
    if (r[2] === "link") {
      var open = opt("OPEN", false, function () {
        hideTip(); setTimeout(S.storagePage, 0);
      });
      open.dataset.value = "open";
      ctl.appendChild(open);
    }
    else if (r[2] === "select") {
      ctl.appendChild(pick(k, v, S.t(r[0]), S.i18n.choices()));
    }
    else if (r[2] === "range") {
      var rg = el("input", "set-range"); rg.type = "range"; rg.min = 0; rg.max = 100; rg.step = 5; rg.value = v;
      rg.setAttribute("aria-label", S.t("{name} volume", { name: S.t(r[0]) }));
      var lab = el("span", "set-val", v + " %");
      rg.setAttribute("aria-valuetext", S.t("{n} percent", { n: v }));
      rg.addEventListener("input", function () {
        S.state.settings[k] = +rg.value; lab.textContent = rg.value + " %"; rg.setAttribute("aria-valuetext", S.t("{n} percent", { n: rg.value })); S.snd.apply();
      });
      rg.addEventListener("change", function () {
        S.save();
      });
      ctl.appendChild(rg); ctl.appendChild(lab);
    }
    else if (r[2]) {
      r[2].forEach(function (o) {
        var ob = opt(o[1], v === o[0], function () {
          setv(k, o[0]); fill(body);
        });
        ob.dataset.value = o[0];
        ctl.appendChild(ob);
      });
    }
    else {
      var onOption = opt("ON", !!v, function () {
        setv(k, true); fill(body);
      });
      onOption.dataset.value = "on";
      var offOption = opt("OFF", !v, function () {
        setv(k, false); fill(body);
      });
      offOption.dataset.value = "off";
      ctl.appendChild(onOption); ctl.appendChild(offOption);
    }
    row.appendChild(ctl);
    ctl.querySelectorAll("button, input, select").forEach(function (c) { c.dataset.settingKey = k; });
    attachHelp(row, k);
    return row;
  }
  /* Header of a folding section: a button that reports its state to screen
     readers, with the count of settings inside shown like the item count in
     FILES. It shows and hides its rows directly, so focus stays on it. */
  function sectionHead(sec, n, part) {
    var h = el("div", "set-sec-h"); h.setAttribute("role", "heading"); h.setAttribute("aria-level", "3");
    var b = el("button", "set-sec-head"); b.type = "button";
    var mark = el("span", "set-sec-mark"); mark.setAttribute("aria-hidden", "true");
    b.appendChild(mark);
    b.appendChild(el("span", "set-sec-name", S.t(sec.title)));
    b.appendChild(el("span", "set-sec-count", S.tn("{n} SETTINGS", n)));
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
  function fill(body) {
    var active = document.activeElement, keepFocus = body.contains(active);
    var settingKey = keepFocus && active.dataset.settingKey, settingValue = keepFocus && active.dataset.value;
    body.textContent = "";
    body.classList.add("set-body");
    var folding = S.state.settings.setupView !== "list";
    body.classList.toggle("set-folding", folding);
    body.appendChild(makeRow(langRow(), body));
    if (S.i18n.lang() !== "en") {
      body.appendChild(el("p", "set-note", S.t(S.i18n.NOTICE)));
    }
    body.appendChild(makeRow(VIEW_ROW, body));
    SECTIONS.forEach(function (sec) {
      var rows = sec.rows.filter(function (r) { return S.settingVisible(r[1]); });
      if (!rows.length) {
        return;
      }
      var part = el("div", folding ? "set-sec-body" : "set-list");
      rows.forEach(function (r) {
        var row = makeRow(r, body), why = S.settingOff(r[1]);
        /* A setting that cannot apply right now stays in view, greyed, with the reason */
        if (why) {
          row.classList.add("set-unavail");
          row.querySelectorAll("button, input, select").forEach(function (c) { c.disabled = true; });
          row.querySelector(".set-label").appendChild(el("span", "set-why", S.t(why)));
        }
        part.appendChild(row);
      });
      if (sec.id === "data" && saveConflict()) {
        part.appendChild(conflictNote());
      }
      if (folding) {
        var wrap = el("div", "set-sec");
        wrap.appendChild(sectionHead(sec, rows.filter(function (r) { return r[2] !== "link"; }).length, part));
        wrap.appendChild(part);
        body.appendChild(wrap);
      }
      else {
        body.appendChild(el("div", "dlg-rule"));
        var g = el("div", "set-group", S.t(sec.title)); g.setAttribute("role", "heading"); g.setAttribute("aria-level", "3");
        body.appendChild(g);
        body.appendChild(part);
      }
    });
    hideTip();
    if (settingKey) {
      var controls = body.querySelectorAll("[data-setting-key]"), target = null;
      for (var i = 0; i < controls.length; i++) {
        if (controls[i].dataset.settingKey === settingKey && controls[i].getAttribute("aria-pressed") === "true") {
          target = controls[i];
          break;
        }
      }
      if (!target) {
        for (var j = 0; j < controls.length; j++) {
          if (controls[j].dataset.settingKey === settingKey && (!settingValue || controls[j].dataset.value === settingValue)) {
            target = controls[j];
            break;
          }
        }
      }
      if (target) { target.focus({ preventScroll: true }); }
    }
  }
  S.settingsDialog = function () {
    S.dialog( {
      title: "SETUP",
      wide: true,
      build: fill,
      buttons: [
        {
          label: "CLOSE"
        },
        {
          label: "RESET PROGRESS",
          action: function () {
            setTimeout(function () {
              S.dialog( {
                title: "RESET PROGRESS",
                text: "Erase all progress on this terminal?",
                buttons: [
                  {
                    label: "CANCEL"
                  },
                  {
                    label: "ERASE",
                    action: function () {
                      S.reset(); location.reload();
                    }
                  }
                ]
              });
            }, 0);
          }
        }
      ]
    });
  };
  S.setupKit = { opt: opt, setv: setv };
})();
