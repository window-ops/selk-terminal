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
      if (refocus) { btn.focus({ preventScroll: true }); }
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
     OPTION_HELP adds a line about the specific option under the pointer. */
  var HELP = {
    sr: "Makes the game work well with a screen reader: text appears at once and moving screen effects are switched off.",
    motion: "Motion settings.",
    mode: "TMUX shows the game as terminal panes. DESKTOP shows it as icons and windows, like an old home computer.",
    tooltips: "Show or hide setup tooltips.",
    frame: "FULL SCREEN uses the whole browser window. MONITOR draws the game inside an old monitor with POWER and HDD lights.",
    layout: "How the terminal panes are arranged on the main DESK window.",
    click: "Whether one click or two clicks opens a record, drawer or icon.",
    speed: "How quickly text appears. A click or key press finishes the line; reduced motion shows text at once.",
    size: "Size of all text in the game.",
    cursor: "Size of the mouse pointer. SYSTEM uses your computer's own pointer.",
    scan: "Thin horizontal lines, like an old tube screen. They stay still.",
    scanRoll: "A second layer of scanlines that drifts down the screen with a slow bright band, like the refresh of a tube monitor. Available only when motion is not reduced.",
    soundPreset: "Levels and tone for what you listen on. DESK SPEAKERS suits a left and right pair without a subwoofer: no deep bass, clearer clicks and a wider stereo image. HEADPHONES keeps the stereo gentle. QUIET lowers the machine and the wind. The sliders below stay adjustable.",
    crtCurve: "Dimmer edges, a faint glare and the curved outline of a tube's glass. Not used with the MONITOR frame, which draws its own glass.",
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
    _light: "A HINT lamp lights up when the open record answers a gap in the report.",
    lang: "Language of the whole game, story included. The page reloads to switch, and progress is kept.",
    _saveLocal: "THIS TAB keeps progress until the tab is closed. THIS COMPUTER keeps it in this browser, so the game can continue another day.",
    _wipe: "Erases all progress each time the page reloads. Useful for testing, not for playing.",
    _storage: "Lists the data this game keeps in your browser. Each key can be viewed or deleted there.",
    shellOut: "IN VIEW opens what a typed command shows in the VIEW window. IN SHELL prints it in the shell, so the shell works on its own.",
    redirectNotes: "When a shell command shows its result in VIEW, the shell prints a short note saying so.",
    debug: "Shows a movable DEBUG panel with the current situation and buttons that trigger game actions for testing.",
    debugLog: "Prints everything the game does (commands, events, windows, messages, saves) to the browser's JavaScript console. Filter the console by SELK.",
    setupView: "SECTIONS folds the settings into groups that open from their headers. FULL LIST shows every setting at once."
  };
  var OPTION_HELP = {
    speed: {
      instant: "Text appears immediately.",
      vfast: "450 letters per second.",
      fast: "260 letters per second.",
      typed: "110 letters per second.",
      slow: "55 letters per second."
    },
    motion: {
      always: "Always animate.",
      reduce: "Minimize movement."
    },
    mode: {
      tmux: "Terminal panes.",
      desktop: "Windows and icons."
    },
    frame: {
      full: "Use the full browser window.",
      monitor: "Use the monitor frame."
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
    lang: {
      en: "English interface.",
      ro: "Romanian interface."
    },
    _saveLocal: {
      tab: "Keep progress until this tab closes.",
      local: "Keep progress in this browser."
    },
    setupView: {
      sections: "Group settings.",
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
      c.setAttribute("aria-describedby", d.id);
      var ok = c.dataset.value, popup = c.getAttribute("aria-haspopup");
      c.addEventListener("mousemove", function (e) {
        /* An open drop-down list covers the place where the tip would go */
        if (popup && c.getAttribute("aria-expanded") === "true") { return; }
        showTip(row, key, popup ? null : ok, e);
      });
      c.addEventListener("focus", function () {
        if (popup && c.getAttribute("aria-expanded") === "true") { return; }
        showTip(row, key, popup ? null : ok);
      });
      c.addEventListener("blur", hideTip);
    });
    row.addEventListener("mousemove", function (e) { if (!e.target.closest("button, input, select")) { showTip(row, key, null, e); } });
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
      ctl.appendChild(opt("OPEN", false, function () {
        hideTip(); setTimeout(S.storagePage, 0);
      }));
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
