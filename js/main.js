/* Start-up and input: the title screen, boot and sign-in sequence, keyboard
   routing, clicks on command buttons, and the F-key actions. */
(function () {
  var S = window.SELK;
  var $ = S.$;
  S.fast = /[?&]fast\b/.test(location.search);
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
  S.promptText = function () {
    return S.mode === "login" ? "login:" : "selk:/" + (S.state.cwd || "") + ">";
  };
  S.prompt = function () {
    $("prompt").textContent = S.promptText();
  };
  function title() {
    var scr = S.scr;
    $("screen").classList.add("title-screen");
    scr.node(function () {
      var w = scr.el("div", "title");
      w.appendChild(scr.el("div", "title-big", "SELK"));
      w.appendChild(scr.el("div", "title-sub", S.t("CESEA site terminal 01, Titan")));
      w.appendChild(scr.el("div", "title-sub dim", "7.0 N, 199.0 W"));
      var go = scr.el("button", "btn primary title-go", S.t("POWER ON"));
      go.type = "button"; go.dataset.title = "power";
      w.appendChild(go);
      w.appendChild(scr.el("div", "title-sub dim", S.t("Select POWER ON to begin")));
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
        if (b[1] === "tutorial") {
          x.setAttribute("aria-pressed", "false");
        }
        row.appendChild(x);
      });
      w.appendChild(row);
      var toggles = scr.el("div", "title-row title-toggles");
      var tour = scr.el("button", "btn", S.t("TOUR AFTER LOGIN: OFF")); tour.type = "button"; tour.dataset.title = "tutorial";
      tour.setAttribute("aria-pressed", "false");
      toggles.appendChild(tour);
      w.appendChild(toggles);
      return w;
    }, 0);
  }
  function start() {
    if (S.mode !== "title") {
      return;
    }
    $("screen").classList.remove("title-screen");
    S.mode = "busy";
    S.snd.init(); S.snd.setOn(S.state.sound); S.snd.boot(); S.snd.spinup(); S.snd.ambient(true);
    S.live.start();
    document.body.classList.add("powered");
    S.scr.clear();
    boot();
  }
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
      if (!st.mail.length && !st.pending.length) {
        S.queueMail("MSG001", 5000);
      }
      st.pending.slice().forEach(function (id) {
        setTimeout(function () {
          S.deliver(id);
        }, S.fast ? 80 : 3000);
      });
      if (st.ended) {
        /* The game was finished: the endgame card comes back until the player
           loads the save from before the decision */
        setTimeout(S.end.endgame, S.fast ? 50 : 1200);
      } else if (st.decision && returning) {
        scr.line(S.tc("The final decision is open. Type {decide}, or open the DECISION page in REPORT."), "warn");
      }
      if (!returning) {
        if (S.tutAsk) {
          S.tutAsk = false; S.tut.start();
        } else {
          S.run("open home/README", false);
          S.tut.offer();
        }
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
         selected entry icon, or else the entry open in the reader. The report
         window does not need to be open. */
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
    S.run(v);
  }
  function inputKey(e) {
    if (e.defaultPrevented) {
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault(); S.snd.key(); submitInput(); return;
    }
    if (S.mode !== "shell") {
      if (e.key.length === 1) {
        S.snd.key();
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
      S.snd.key();
    }
  }
  function globalKey(e) {
    if (S.dlg) {
      if (e.key === "Escape") {
        /* An open drop-down list inside the dialog closes first */
        if (S.closePick) {
          S.closePick();
        } else {
          S.closeDialog();
        }
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
    /* Native controls keep their own keys: Enter activates buttons, select
       arrows change options, and Tab always advances through the page. */
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
        else if (act === "tutorial") {
          S.tutAsk = !S.tutAsk;
          tb.textContent = S.tutAsk ? S.t("TOUR AFTER LOGIN: ON") : S.t("TOUR AFTER LOGIN: OFF");
          tb.setAttribute("aria-pressed", S.tutAsk ? "true" : "false");
          tb.classList.toggle("primary", S.tutAsk);
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
        S.fromClick = true;
        try {
          S.run(b.dataset.cmd);
        } finally {
          S.fromClick = false;
        }
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
