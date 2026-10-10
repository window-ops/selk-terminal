/* Start-up and input: the title screen, the boot and sign-in sequence,
   keyboard routing, clicks on command buttons, and the F-key actions. */
(function () {
  var S = window.SELK;
  var $ = S.$;
  S.motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  S.systemReduced = !!(S.motionQuery && S.motionQuery.matches);
  S.reduced = S.systemReduced;
  S.mode = "title";
  var NAME_RULE = /^[\p{L}\p{N} .'-]{1,24}$/u;
  var history = [], hPos = 0;
  try {
    history = JSON.parse(sessionStorage.getItem(S.HIST_KEY) || "[]"); hPos = history.length;
  } catch (e) {
    history = [];
  }
  function saveHistory() {
    try {
      sessionStorage.setItem(S.HIST_KEY, JSON.stringify(history.slice(-100)));
      if (S.debug) { S.debug("save", "shell history saved to sessionStorage, key " + S.HIST_KEY); }
    } catch (e) {}
  }
  /* The shell's own prompt, with the current section. Commands echo it
     even while the agent is open, since they run in the shell */
  S.shellPromptText = function () {
    return S.mode === "login" ? "login:" : "selk:/" + (S.state.cwd || "") + ">";
  };
  S.promptText = function () {
    if (S.mode === "shell" && S.agent && S.agent.active()) { return "agent>"; }
    return S.shellPromptText();
  };
  S.prompt = function () {
    $("prompt").textContent = S.promptText();
  };
  /* The title screen's options, in groups, behind the OPTIONS button in the
     bottom left corner; Setup has the rest. Each option is [label, read,
     write]; writing saves and applies the settings. */
  var QUICK = [
    ["Accessibility", [
      ["SCREEN READER MODE", function () { return !!S.state.settings.sr; }, function () { if (S.toggleScreenReader) { S.toggleScreenReader(); } }],
      ["SCREEN EFFECTS", function () { var s = S.state.settings; return !!(s.scan && s.flicker && s.glow && s.interfere); },
        function (on) { var s = S.state.settings; s.scan = s.flicker = s.glow = s.interfere = on; }],
      ["PRETTY WRAP", function () { return !!S.state.settings.prettyWrap; }, function (on) { S.state.settings.prettyWrap = on; }]
    ]],
    ["Game", [
      ["SOUND", function () { return !!S.state.sound; }, function (on) { S.state.sound = on; S.snd.setOn(on); }],
      ["DESKTOP MODE", function () { return S.state.settings.mode === "desktop"; }, function (on) { S.state.settings.mode = on ? "desktop" : "tmux"; }],
      ["NO TOUR", function () { return !!S.noTour; }, function (on) { S.noTour = on; }]
    ]],
    ["Developer", [
      ["FAST MODE", function () { return !!S.state.settings.fast; }, function (on) { S.state.settings.fast = on; }],
      ["DEBUG", function () { return !!S.state.settings.debug; }, function (on) { S.state.settings.debug = on; }]
    ]]
  ];
  function quickOption(key) {
    var k = key.split(".");
    return QUICK[+k[0]][1][+k[1]];
  }
  /* Every row shows its option's state again, since one option can change
     another (screen reader mode turns the screen effects off) */
  function quickRefresh() {
    document.querySelectorAll(".title-opt").forEach(function (b) { quickShow(b, quickOption(b.dataset.title.slice(6))); });
  }
  /* Opens or closes the panel; closing returns the focus to OPTIONS */
  function quickPanel(open) {
    var btn = document.querySelector(".title-options-btn"), panel = $("title-options");
    if (!btn || !panel) { return; }
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) { var first = panel.querySelector(".title-opt"); if (first) { first.focus(); } }
    else { btn.focus(); }
  }
  function quickShow(b, q) {
    var on = q[1]();
    b.setAttribute("aria-checked", on ? "true" : "false");
    b.querySelector(".opt-state").textContent = S.t(on ? "ON" : "OFF");
  }
  /* OPTIONS is a button at the left end of the status bar, where the window
     list ([selk]) stands in a session, and opens a panel above the bar over
     the screen: the options in groups, each row its name and its state.
     Starting the session removes it. */
  function buildOptions() {
    var corner = S.el("div", "title-options");
    var head = S.el("button", "st-btn title-options-btn", S.t("OPTIONS"));
    head.type = "button"; head.dataset.title = "options"; head.dataset.sound = "menu";
    head.setAttribute("aria-expanded", "false"); head.setAttribute("aria-controls", "title-options");
    var panel = S.el("div", "title-options-panel"); panel.id = "title-options"; panel.hidden = true;
    panel.setAttribute("role", "group"); panel.setAttribute("aria-label", S.t("OPTIONS"));
    QUICK.forEach(function (g, gi) {
      panel.appendChild(S.el("div", "opt-group", S.t(g[0])));
      g[1].forEach(function (q, i) {
        var b = S.el("button", "title-opt"); b.type = "button"; b.dataset.title = "quick:" + gi + "." + i;
        b.setAttribute("role", "switch"); b.setAttribute("aria-label", S.t(q[0])); b.dataset.sound = "switch";
        b.appendChild(S.el("span", "opt-name", S.t(q[0])));
        b.appendChild(S.el("span", "opt-state"));
        quickShow(b, q);
        panel.appendChild(b);
      });
    });
    /* Up and Down move between the rows; Escape closes the panel */
    panel.addEventListener("keydown", function (e) {
      var rows = [].slice.call(panel.querySelectorAll(".title-opt")), i = rows.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); e.stopPropagation();
        var n = rows[(i + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length]; if (n) { n.focus(); }
      } else if (e.key === "Escape") {
        e.preventDefault(); e.stopPropagation(); quickPanel(false);
      }
    });
    corner.appendChild(panel); corner.appendChild(head);
    return corner;
  }
  function title() {
    var scr = S.scr;
    /* The sound engine is built at the first gesture on the page, since a
       browser refuses to start audio before one (sound.js). The saved
       Sound setting applies on the title screen too */
    S.snd.initOnGesture();
    S.snd.setOn(S.state.sound !== false);
    /* S.mode is "title" by now, so this puts data-theme="title" on <html>
       and the popups take the title screen's own shape (css/themes/title.css) */
    S.syncContext();
    $("screen").classList.add("title-screen");
    scr.node(function () {
      var w = scr.el("div", "title");
      /* The instruction is for screen readers only: they announce it as the
         name of the group when the focus enters the title screen */
      w.setAttribute("role", "group");
      w.setAttribute("aria-label", S.t("Select POWER ON to begin"));
      /* Screen reader mode comes first in the tab order and is the first
         thing a screen reader reads, so a blind player finds it at once. It
         stays out of sight until it has the keyboard focus. a11y.js keeps
         its text and state in step with the setting. */
      var sr = scr.el("button", "title-sr");
      sr.type = "button"; sr.dataset.a11y = "sr"; sr.dataset.sound = "switch";
      sr.textContent = S.state.settings.sr ? S.t("SCREEN READER MODE: ON") : S.t("SCREEN READER MODE: OFF");
      sr.setAttribute("aria-pressed", S.state.settings.sr ? "true" : "false");
      sr.addEventListener("click", function () { if (S.toggleScreenReader) { S.toggleScreenReader(); } });
      w.appendChild(sr);
      w.appendChild(scr.el("div", "title-big", "SELK"));
      w.appendChild(scr.el("div", "title-sub", S.t("CESEA site terminal 01, Titan")));
      w.appendChild(scr.el("div", "title-sub dim", "7.0 N, 199.0 W"));
      var go = scr.el("button", "btn primary title-go", S.t("POWER ON"));
      /* POWER ON plays the press of the click alone, with no release, in
         either Control sounds setting (ui-sound.js) */
      go.type = "button"; go.dataset.title = "power"; go.dataset.sound = "press";
      w.appendChild(go);
      var row = scr.el("div", "title-row");
      [
        [
          "SETUP",
          "setup"
        ],
        [
          "ABOUT",
          "about"
        ],
        [
          "CREDITS",
          "credits"
        ]
      ].forEach(function (b) {
        var x = scr.el("button", "btn", S.t(b[0])); x.type = "button"; x.dataset.title = b[1];
        /* SETUP and ABOUT open a dialog; CREDITS opens a page in a new tab */
        x.dataset.sound = b[1] === "credits" ? "link" : "open";
        if (b[1] === "tutorial") {
          x.setAttribute("aria-pressed", "false");
        }
        row.appendChild(x);
      });
      w.appendChild(row);
      return w;
    }, 0);
    /* The output area is no tab stop on the title screen, so the tab order
       starts with screen reader mode; start() gives the stop back */
    var log = document.querySelector("#screen .log");
    if (log) { log.setAttribute("tabindex", "-1"); }
    var foot = document.querySelector("#screen > footer.tmux"), old = document.querySelector(".title-options");
    if (old) { old.remove(); }
    if (foot) { foot.insertBefore(buildOptions(), foot.firstChild); }
  }
  function start() {
    var opts = document.querySelector(".title-options");
    if (opts) { opts.remove(); }
    var log = document.querySelector("#screen .log");
    if (log) { log.setAttribute("tabindex", "0"); }
    if (S.mode !== "title") {
      return;
    }
    $("screen").classList.remove("title-screen");
    S.mode = "busy";
    /* Off the title screen, so the popups return to the shape of the mode */
    S.syncContext();
    document.body.classList.add("powered");
    S.scr.clear();
    /* A save whose ending is still open leaves no work in the terminal: the
       only choices are to replay, to load the save from before the decision,
       or to leave. So the endgame card opens on the black stage with no boot,
       no sign-in, no windows and none of the machine sounds. S.resumeSession
       below starts all of that if the player goes back into the game. */
    if (S.state.ended) {
      S.snd.init(); S.snd.setOn(S.state.sound);
      S.end.endgame();
      return;
    }
    /* hush(false) ends the ending's hush when the title screen follows an
       ending */
    S.snd.init(); S.snd.setOn(S.state.sound); S.snd.hush(false); S.snd.boot(); S.snd.spinup(); S.snd.ambient(true);
    S.live.start();
    /* Power on, read by dmesg for its uptime */
    S.bootAt = Date.now();
    boot();
  }
  /* Mail waiting in the save: the first message if the game has not started,
     and whatever the uplink still had in flight when the player left. */
  function deliverPending() {
    var st = S.state;
    if (!st.mail.length && !st.pending.length) {
      S.queueMail("MSG001", 5000);
    }
    st.pending.slice().forEach(function (id) {
      setTimeout(function () {
        S.deliver(id);
      }, S.fast ? 80 : 3000);
    });
  }
  /* Start the session without the boot and sign-in sequence. POWER ON on a
     save with an open ending goes straight to the endgame card, so no part
     of the session has started yet; this runs the moment the player leaves
     the ending for the terminal, from LOAD SAVE or from CANCEL on the
     decision list. */
  S.resumeSession = function () {
    if (S.tmux.attached) {
      S.enterMode(); return;
    }
    S.snd.hush(false); S.snd.spinup(); S.snd.ambient(true);
    S.live.start();
    S.bootAt = S.bootAt || Date.now(); S.signInAt = Date.now();
    S.mode = "shell";
    S.enterMode();
    S.snd.hdd(5);
    S.prompt(); S.status();
    S.watch.start();
    /* The sign-in lines the boot sequence would have printed, so the shell
       does not open empty */
    S.scr.line(S.t("Welcome, supervisor {name}.", { name: S.state.name }), "ok", 0);
    S.scr.line(S.t("Session restored."), "dim", 0);
    S.scr.line(S.howTo("keys"), "dim", 0);
    deliverPending();
  };
  function boot() {
    var scr = S.scr, returning = !!S.state.name;
    /* Boot checks: label, dot leader, result. The leader is sized from the
       longest translated label, so the results line up in every language. */
    var checks = [
      ["Memory check", "64 GB OK"],
      ["Drive 0", "spun up, 4 TB"],
      ["Reactor link", "48 MW OK"],
      ["Uplink relay", "R-09 idle"],
      ["Directory", "ldaps://dir.selk.cesea.internal OK"],
      ["Unit bus", "31 units online"],
      ["Structure monitor", "ALARM"],
      ["Supervisor sleep", "ended 26-02-2097"]
    ].map(function (c) { return [S.t(c[0]), S.t(c[1])]; });
    var widest = Math.max.apply(null, checks.map(function (c) { return c[0].length; }));
    var lines = ["CESEA SITE OS 7.2 (c) 2079 CESEA"].concat(checks.map(function (c) {
      return c[0] + " " + new Array(widest - c[0].length + 5).join(".") + " " + c[1];
    }));
    scr.wait(500);
    if (S.wiped) {
      scr.line(S.t("Wipe on refresh is on. All saved data was erased."), "warn", 0);
    }
    lines.forEach(function (l, i) {
      scr.type(l, i === 7 ? "err" : "", returning ? 400 : 140);
      if (i === 2) {
        scr.task(function () {
          S.snd.hdd(6);
        });
      }
      if (i === 7) {
        scr.task(function () {
          S.snd.error();
        });
      }
      scr.wait(returning ? 40 : 160);
    });
    scr.line("", "", 200);
    if (returning) {
      scr.type(S.t("login:") + " " + S.state.name, "", 60);
      ssoLines(true);
      scr.task(function () {
        attach(true);
      });
    } else {
      scr.task(function () {
        S.mode = "login"; S.prompt(); S.status(); $("cmd").focus();
        scr.line(S.t("Enter your name. Sign-in uses CESEA SSO through the site directory."), "dim", 0);
      });
    }
  }
  function attach(returning) {
    var scr = S.scr;
    scr.type("tmux attach -t selk", "echo", 80);
    scr.wait(350);
    scr.task(function () {
      S.mode = "shell";
      /* Sign-in, read by dmesg: /home is mounted over NFS now */
      S.signInAt = Date.now();
      S.snd.spinup();
      S.enterMode();
      S.snd.hdd(5);
      S.prompt(); S.status();
      S.watch.start();
    });
    scr.line(S.t("Welcome, supervisor {name}.", { name: S.state.name }), "ok", 120);
    scr.line(returning ? S.t("Session restored.") : S.t("Start with HOME / README in FILES, then read MSG 001 when it arrives."), "dim");
    scr.line(S.howTo("keys"), "dim");
    scr.task(function () {
      var st = S.state;
      deliverPending();
      if (st.ended) {
        /* A finished game shows the endgame card until the player loads the
           save from before the decision. POWER ON on such a save skips the
           boot and opens the card at once (start above), so this is the path
           after EXIT and a fresh sign-in in the same visit. */
        setTimeout(S.end.endgame, S.fast ? 50 : 1200);
      } else if (st.decision && returning) {
        scr.line(S.tc("The final decision is open. Type {decide}, or open the DECISION page in REPORT."), "warn");
      }
      if (!returning) {
        /* First sign-in: open HOME / README unechoed and routed as a typed
           command, so Shell results decides where it shows and a shell-only
           DESK stays shell-only */
        S.run("open home/README", false, "typed");
        if (!S.noTour) {
          S.tut.offer();
        }
        S.noTour = false;
      } else {
        S.tut.redraw();
      }
    });
  }
  function ssoLines(returning) {
    var u = S.userId(), scr = S.scr;
    scr.line(S.t("Authenticating {user} with CESEA SSO", { user: u }), "dim", 200);
    scr.line(S.t("Directory:") + " uid=" + u + ",ou=crew,dc=selk,dc=cesea,dc=internal", "dim", returning ? 60 : 240);
    scr.line(S.t("Kerberos ticket issued for {user}@SELK.CESEA.INTERNAL, valid 10 h", { user: u }), "ok", returning ? 60 : 260);
  }
  function doLogin(v) {
    var name = v.trim().replace(/\s+/g, " ");
    S.scr.line(S.t("login:") + " " + name, "echo", 0);
    if (!name) {
      S.snd.error(); S.scr.line(S.t("Enter a name to log in."), "err"); return;
    }
    if (!NAME_RULE.test(name)) {
      S.snd.error(); S.scr.line(S.t("Use letters, digits, spaces, periods, hyphens or apostrophes."), "err"); return;
    }
    S.state.name = name; S.save();
    ssoLines(false);
    S.scr.task(function () {
      S.mode = "busy"; attach(false);
    });
  }
  /* Back to the title screen without a reload. The machine and the wind fade
     out under the ending's hush, and POWER ON starts them again. */
  S.toTitle = function () {
    S.snd.stopSwell(); S.snd.spindown(); S.snd.ambient(false);
    if (S.cine.isOpen()) { S.cine.close(); }
    S.finale = false;
    $("screen").classList.remove("finale");
    S.closeDialog();
    if (S.tmux.attached) { S.tmux.detach(); }
    document.body.classList.remove("powered");
    S.scr.skip();
    S.mode = "title";
    S.scr.clear();
    S.prompt(); S.status();
    /* title() calls S.syncContext, which puts the title theme back */
    title();
  };
  S.logout = function () {
    S.state.name = ""; S.state.cwd = ""; S.save();
    S.closeDialog();
    S.tmux.detach();
    S.snd.spindown();
    S.scr.line(S.t("[detached (from session selk)]"), "dim");
    S.scr.line(S.t("Session ended. Progress kept on this terminal."), "dim");
    S.scr.task(function () {
      S.mode = "login"; S.prompt(); S.status(); $("cmd").focus();
    });
  };
  S.devnotes = function () {
    var go = function () {
      window.open("notes/devnotes.html", "_blank");
    };
    if (S.state.endings.length) {
      go(); return;
    }
    S.dialog( {
      title: "DEVELOPER NOTES",
      text: "The notes contain every answer, password and ending. Open them before finishing the game?",
      buttons: [
        {
          label: "CANCEL"
        },
        {
          label: "OPEN",
          action: go
        }
      ]
    });
  };
  S.fkey = function (n) {
    var T = S.tmux, id;
    if (n === 1) {
      S.run("help", false);
    }
    else if (n === 2) {
      S.run("mail", false);
    }
    else if (n === 3) {
      id = S.ex.highlighted(); if (id) {
        S.run("open " + id, false);
      } else if (!T.goto("VIEW")) {
        S.msg("Select an entry in FILES first");
      }
    }
    else if (n === 4) {
      /* USE: tmux takes the entry highlighted in FILES; the desktop takes the
         selected entry icon, else the entry open in the reader. REPORT does
         not need to be open. */
      id = S.isDesktop() ? S.desk.selectedEntry() || S.lastOpened : S.ex.highlighted();
      var sel = S.state.sel;
      if (!sel) {
        S.msg("Click a blank on a report page first", "err"); S.snd.error();
      }
      else if (!id) {
        var keys = S.ctx().keys;
        S.msg(S.isDesktop() ? (keys ? "Select an entry icon or open an entry, then press F4" : "Select an entry icon or open an entry first") :
          (keys ? "Select an entry in FILES, then press F4" : "Select an entry in FILES first"), "err"); S.snd.error();
      }
      else if (!S.entryDraggable(id)) {
        /* No drag handle: Home, System, History, Design cannot fill blanks */
        S.msg(S.t("That entry cannot fill a blank."), "err"); S.snd.error();
      }
      else {
        S.rep.fillBlank(sel.r, sel.n, id);
      }
    }
    else if (n === 5) {
      S.run("report", false);
    }
    else if (n === 6) {
      S.run("hints", false);
    }
    else if (n === 7) {
      S.unlockDialog(S.ex.section());
    }
    else if (n === 8) {
      S.run("watch", false);
    }
    else if (n === 9) {
      S.settingsDialog();
    }
    else if (n === 10) {
      S.exitDialog();
    }
  };
  function submitInput() {
    var input = $("cmd"), v = input.value;
    /* A line typed while the agent reasons interrupts it */
    if (S.mode === "shell" && S.agent && S.agent.busy()) {
      if (v.trim()) { input.value = ""; S.agent.interrupt(v); }
      return;
    }
    input.value = "";
    if (S.mode === "login") {
      doLogin(v); return;
    }
    if (S.mode !== "shell") {
      return;
    }
    if (v.trim()) {
      history.push(v.trim()); hPos = history.length; saveHistory();
    }
    if (S.agent && S.agent.active()) {
      S.agent.input(v); return;
    }
    S.run(v);
  }
  function inputKey(e) {
    if (e.defaultPrevented) {
      return;
    }
    if (S.mode === "shell" && S.agent && S.agent.key(e)) {
      e.preventDefault(); return;
    }
    if (e.key === "Enter") {
      e.preventDefault(); S.snd.key(); submitInput(); return;
    }
    if (S.mode !== "shell") {
      if (e.key.length === 1 || e.key === "Backspace") {
        S.snd.typed(e.key);
      } return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault(); if (hPos > 0) {
        hPos--; $("cmd").value = history[hPos];
      } return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault(); if (hPos < history.length - 1) {
        hPos++; $("cmd").value = history[hPos];
      } else {
        hPos = history.length; $("cmd").value = "";
      } return;
    }
    if (e.key.length === 1 || e.key === "Backspace") {
      S.snd.typed(e.key);
    }
  }
  function globalKey(e) {
    /* The error dialog handles its own keys (dialogs.js); nothing under it
       reacts, the dialog it covers included */
    if (S.errorOpen && S.errorOpen()) {
      return;
    }
    if (S.dlg) {
      if (e.key === "Escape") {
        /* An open drop-down list inside the dialog closes first */
        if (S.closePick) {
          S.closePick();
        } else {
          S.escapeDialog();
        }
        e.preventDefault();
      } return;
    }
    if (S.mode === "title") {
      return;
    }
    if (S.shortcut(e)) {
      return;
    }
    if (S.tmux.key(e)) {
      return;
    }
    var f = /^F([1-9]|10)$/.exec(e.key);
    if (f && S.mode === "shell") {
      e.preventDefault(); S.snd.click(); S.fkey(+f[1]); return;
    }
    if (S.mode === "busy") {
      S.scr.skip(); return;
    }
    var t = e.target;
    if (t === $("cmd") || t === $("tmux-prompt")) {
      return;
    }
    if (S.mode === "login") {
      $("cmd").focus(); return;
    }
    if (S.mode !== "shell") {
      return;
    }
    /* Native controls keep their own keys: Enter activates buttons, arrows
       change select options, and Tab moves through the page. */
    if (t && t.closest && t.closest("button, a, input, select, textarea, [contenteditable='true']")) {
      return;
    }
    var k = S.ui.active();
    if (k === "FILES" && t && t.closest && t.closest(".mc-list") && S.ex.key(e)) {
      e.preventDefault(); return;
    }
    if (k === "SHELL" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      $("cmd").focus();
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    S.load();
    /* Wait for the language file, which also translates the story data */
    S.i18n.ready.then(startUp);
  });
  function startUp() {
    S.registerKind("SHELL", $("k-shell"));
    S.scr.init($("log"));
    S.applySettings();
    S.tmux.render();
    S.prompt();
    title();
    /* Settings are applied: show the room (html.booting in
       css/crt/monitor.css) */
    document.documentElement.classList.remove("booting");
    var loading = $("loading");
    if (loading) { loading.remove(); }
    document.addEventListener("keydown", globalKey, true);
    $("cmd").addEventListener("keydown", inputKey);
    var tp = $("tmux-prompt");
    tp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var v = tp.value; tp.hidden = true; S.tmux.focusCur(); if (v.trim()) {
          S.run(v);
        } e.preventDefault();
      }
      if (e.key === "Escape") {
        tp.hidden = true; S.tmux.focusCur();
      }
    });
    tp.addEventListener("blur", function () {
      tp.hidden = true;
    });
    $("screen").addEventListener("click", function (e) {
      if (S.mode === "title") {
        if (S.dlg || !e.target.isConnected || e.target.closest(".dlg-ov, .ctx")) {
          return;
        }
        var tb = e.target.closest("[data-title]");
        var openPanel = $("title-options");
        if (openPanel && !openPanel.hidden && !e.target.closest(".title-options")) {
          quickPanel(false);
        }
        if (!tb) {
          return;
        }
        var act = tb.dataset.title;
        if (act === "setup") {
          S.settingsDialog();
        }
        else if (act === "about") {
          S.about();
        }
        else if (act === "credits") {
          window.open("notes/credits.html", "_blank");
        }
        else if (act === "options") {
          quickPanel(tb.getAttribute("aria-expanded") !== "true");
        }
        else if (act.indexOf("quick:") === 0) {
          var q = quickOption(act.slice(6));
          q[2](!q[1]());
          S.save(); S.applySettings();
          quickRefresh();
        }
        else {
          start();
        }
        return;
      }
      var b = e.target.closest("[data-cmd]");
      if (b) {
        e.preventDefault();
        if (S.mode === "busy") {
          S.scr.skip(); return;
        }
        if (S.mode !== "shell") {
          return;
        }
        S.runClick(b.dataset.cmd);
        return;
      }
      if (S.mode === "busy") {
        S.scr.skip();
      }
    });
    document.querySelectorAll("[data-f]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (S.mode === "shell") {
          S.fkey(+b.dataset.f);
        }
      });
    });
    $("st-sound").addEventListener("click", function (e) {
      e.stopPropagation();
      if (S.mode === "title") {
        S.state.sound = !S.state.sound; S.save(); S.status(); return;
      }
      S.run("sound " + (S.state.sound ? "off" : "on"), false);
    });
    $("st-mode").addEventListener("click", function (e) {
      e.stopPropagation(); if (S.mode === "shell") {
        S.setMode("desktop");
      }
    });
    $("st-mail").addEventListener("click", function (e) {
      e.stopPropagation(); if (S.mode === "shell") {
        S.run("mail", false);
      }
    });
    var stRep = $("st-report");
    if (stRep) {
      stRep.addEventListener("click", function (e) {
        e.stopPropagation(); if (S.mode === "shell") {
          S.run("report", false);
        }
      });
    }
  }
})();
