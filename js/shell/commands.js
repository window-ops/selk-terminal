/* Shell commands: the help table, the command table, S.run(), and
   S.outShell(), which decides whether a result prints in the shell or opens
   its window. */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err, resolveEntry = K.resolveEntry, lockedMsg = K.lockedMsg,
    readMail = K.readMail, hintsPage = K.hintsPage, revealHint = K.revealHint, printEntry = K.printEntry,
    shellTable = K.shellTable, listSection = K.listSection, listRoot = K.listRoot;
  /* Help rows: command, arguments, description. In the arguments, upper-case
     words are placeholders shown through S.t and lower-case words are fixed
     arguments shown through S.argName. Descriptions can name any command or
     argument as {word}. */
  var HELP = [
    ["ls", "", "list sections, or entries in this section"],
    ["cd", "NAME", "enter a section, {cd} .. to leave"],
    ["open", "NAME", "read an entry"],
    ["note", "TERM", "read a handbook note"],
    ["unlock", "NAME PASSWORD", "open a locked section"],
    ["mail", "", "list messages, {mail} 2 reads one"],
    ["report", "", "list report pages, {report} 2 opens one"],
    ["fill", "2 NAME", "put an entry in blank 2"],
    ["unfill", "2", "empty blank 2"],
    ["submit", "", "send the open report page"],
    ["decide", "", "open the final decision, once the office asks for it"],
    ["hints", "", "hints page, hidden until you type {hints} {on}"],
    ["light", "on", "hint light, off by default"],
    ["sound", "off", "sound on or off"],
    ["settings", "", "setup screen, also F9"],
    ["watch", "", "live telemetry"],
    ["mode", "", "switch tmux and desktop"],
    ["storage", "", "saved data in this browser"],
    ["devnotes", "", "developer notes, spoilers"],
    ["clear", "", "clear the screen"],
    ["credits", "", "credits and licenses"],
    ["logout", "", "end the session, progress is kept"],
    ["reset", "", "erase all progress"]
  ];
  function syntax(h) {
    var args = h[1] ? h[1].split(" ").map(function (w) {
      return /^[A-Z]/.test(w) ? S.t(w) : /^[a-z]+$/.test(w) ? S.argName(w) : w;
    }).join(" ") : "";
    return S.cmdName(h[0]) + (args ? " " + args : "");
  }
  var C = {
    help: function () {
      S.display(S.t("HELP"), function () {
        var wrap = scr().el("div", "entry");
        wrap.appendChild(scr().el("div", "entry-title", S.t("COMMANDS AND KEYS")));
        var dl = scr().el("dl", "fields help");
        var add = function (h) {
          if (!h[0]) {
            return;
          } dl.appendChild(scr().el("dt", "", S.t(h[0]))); dl.appendChild(scr().el("dd", "dim", S.tc(h[1])));
        };
        HELP.forEach(function (h) {
          add([syntax(h), h[2]]);
        });
        add( [
          "",
          ""
        ]);
        S.SHORTCUTS.forEach(add);
        wrap.appendChild(dl);
        [
          [
            "",
            ""
          ],
          [
            "F1 to F10",
            "actions in the bar at the bottom"
          ],
          [
            "CTRL+B then O",
            "next pane, arrows also work"
          ],
          [
            "CTRL+B then Z",
            "zoom the pane"
          ],
          [
            "POP OUT SHELL",
            "only SHELL pops out of DESK; FILES, VIEW and REPORT stay together"
          ],
          [
            "POP IN SHELL",
            "return SHELL to its original place in DESK"
          ],
          [
            "Context menu on a pane",
            "zoom a pane; also CLOSE for REPORT and WATCH, pop out or pop in for SHELL, and HIDE INBOX or SHOW INBOX for the mail panes on a narrow screen"
          ],
          [
            "Output redirected to VIEW",
            "the shell records this when a typed command opens content in VIEW, or a message in MAIL"
          ],
          [
            "Shell results and Panel results",
            "Setup choices: Shell results IN SHELL prints what typed commands show in SHELL; Panel results BOTH also prints what FILES and the F keys show, and still opens their windows"
          ],
          [
            "Shell-only DESK",
            "Setup switch: keep only SHELL on DESK. MAIL and WATCH stay available; messages still open in MESSAGE."
          ],
          [
            "MAIL and MESSAGE",
            "MAIL lists the messages; MESSAGE beside it shows the one you open, and shows messages only"
          ],
          [
            "HIDE INBOX and SHOW INBOX",
            "on a narrow screen, give MESSAGE the whole page or bring the inbox back above it"
          ],
          [
            "Pane divider",
            "drag the line between two panes to resize them, or focus it and use the arrow keys; a double click returns to the default size"
          ],
          [
            "CTRL+B then :",
            "command prompt"
          ],
          [
            "FILES keyboard navigation",
            "use the arrow keys to move; left and right switch columns; Enter opens; Tab leaves the list"
          ],
          [
            "Fill a report with the keyboard",
            "select a blank in REPORT, select an entry in FILES, then press F4; or type fill, a blank number and an entry name in SHELL"
          ],
          [
            "Keyboard focus",
            "Tab moves forward through controls; Shift+Tab moves backward; Escape closes a dialog or menu"
          ]
        ].forEach(function (h) {
          add(h);
        });
        return wrap;
      });
    },
    ls: function (a) {
      var target = a[0] ? S.secId(a[0]) : S.state.cwd;
      if (target === ".." || target === "/") {
        target = "";
      }
      if (!target) {
        listRoot(); return;
      }
      if (!S.sectionById(target)) {
        err(S.t("No section called {name}.", { name: a[0] })); return;
      }
      if (!S.isUnlocked(target)) {
        lockedMsg(target); return;
      }
      listSection(target);
    },
    cd: function (a) {
      var t = a[0] === ".." || a[0] === "/" || a[0] === "~" ? a[0] : S.secId(a[0]);
      if (!t || t === ".." || t === "/" || t === "~") {
        S.state.cwd = ""; S.prompt(); S.save(); listRoot(); return;
      }
      if (!S.sectionById(t)) {
        err(S.t("No section called {name}.", { name: a[0] })); return;
      }
      if (!S.isUnlocked(t)) {
        lockedMsg(t); return;
      }
      S.state.cwd = t; S.prompt(); S.save();
      listSection(t);
    },
    open: function (a) {
      if (!a[0]) {
        err(S.tc("Type {open} and an entry name, like {open} bio/GATE.")); return;
      }
      var e = resolveEntry(a[0]);
      if (!e) {
        if (S.sectionById(S.secId(a[0]))) {
          C.cd(a); return;
        }
        err(S.tc("No entry called {name}. Type {ls} to see names.", { name: a[0] }));
        return;
      }
      var sec = e.id.split("/")[0];
      if (!S.isUnlocked(sec)) {
        lockedMsg(sec); return;
      }
      if (e.action) {
        ( {
          settings: S.settingsDialog,
          storage: S.storagePage,
          tutorial: S.tut.refresher,
          about: S.about,
          troika: S.troika.open,
          disassembly: S.disassembly.open
        })[e.action](); return;
      }
      printEntry(e);
    },
    note: function (a) {
      var n = S.i18n.note((a[0] || "").toLowerCase());
      if (!n) {
        err(a[0] ? S.t("No handbook note for {name}.", { name: a[0] }) : S.t("No handbook note for that.")); return;
      }
      S.snd.tick();
      S.display(n[0], function () {
        var box = scr().el("div", "note");
        box.appendChild(S.speakText(scr().el("div", "note-title"), n[0]));
        box.appendChild(S.speakText(scr().el("div", ""), n[1]));
        box.appendChild(scr().el("div", "dim", S.t("CESEA field handbook, edition {year}", { year: n[2] })));
        return box;
      }, true);
    },
    unlock: function (a) {
      var sec = S.secId(a[0]);
      var lock = S.sectionById(sec) && S.LOCKS[sec];
      if (!lock) {
        err(S.tc("Type {unlock} and a locked section, like {unlock} archive {pw}.", { pw: S.t("PASSWORD") })); return;
      }
      if (S.isUnlocked(sec)) {
        scr().line(S.t("{name} is already open.", { name: S.sectionById(sec).name }), "dim"); return;
      }
      var given = a.slice(1).map(function (x) {
        return x.toLowerCase();
      });
      /* A key (Design) counts its characters, so the groups may be typed
         together, apart or with dashes */
      if (lock.key || lock.sort) {
        given = [given.join("").replace(/-/g, "")];
      } else if (given.length < lock.parts.length) {
        err(S.tn("{name} needs {n} parts.", lock.parts.length, { name: S.sectionById(sec).name })); return;
      }
      var ok = lock.key ? given[0] === lock.parts.join("") : lock.parts.every(function (p, i) {
        return given[i] === p;
      });
      if (!ok) {
        err(S.t("Password rejected.")); return;
      }
      S.state.unlocked.push(sec);
      S.save();
      S.snd.unlock(); S.snd.hdd(5);
      S.feedback(S.t("{name} unlocked.", { name: S.sectionById(sec).name }), "ok");
      /* A section that waits for this one (History after Design) appears */
      S.SECTIONS.forEach(function (s) {
        if (s.after === sec && S.sectionById(s.id)) {
          scr().line(S.t("A new section appears in /: {name}.", { name: s.name.toUpperCase() }), "warn");
        }
      });
      if (S.outWindow()) {
        S.ex.goSection(sec); S.ui.open("FILES");
      }
      if (S.outShell()) {
        C.cd([sec]);
      }
    },
    mail: function (a) {
      if (a[0]) {
        readMail(parseInt(a[0], 10)); return;
      }
      if (S.outWindow() && S.ui.open("MAIL")) {
        S.mailpane.render();
        if (!S.outShell()) {
          return;
        }
      }
      var m = S.state.mail;
      if (!m.length) {
        scr().line(S.state.pending.length ? S.t("No messages yet. The uplink is receiving.") : S.t("No messages."), "dim"); return;
      }
      scr().node(function () {
        return shellTable(m.map(function (x, i) {
          return [
            {
              node: scr().cmdButton(S.t("MSG {num}", { num: ("00" + (i + 1)).slice(-3) }), "mail " + (i + 1))
            },
            {
              text: S.fmtTime(x.t),
              cls: "dim"
            },
            {
              text: x.read ? "AUDIT DESK 4" : S.t("AUDIT DESK 4, unread"),
              cls: x.read ? "dim" : "warn"
            }
          ];
        }));
      });
    },
    report: function (a) {
      if (a[0]) {
        S.rep.show(a[0]); return;
      }
      var inShellOnly = S.tmux.shellOnly && S.tmux.shellOnly();
      if (S.outWindow() && !inShellOnly && S.ui.open("REPORT")) {
        S.rep.render(); S.emit("report-open");
        if (!S.outShell()) {
          return;
        }
      }
      S.rep.list();
      S.rep.printActive();
      if (inShellOnly) {
        S.ui.open("SHELL"); S.emit("report-open");
      }
    },
    settings: function () {
      S.settingsDialog();
    },
    storage: function () {
      S.storagePage();
    },
    about: function () {
      S.about();
    },
    tutorial: function () {
      S.tut.refresher();
    },
    mode: function (a) {
      var m = S.i18n.arg(a[0]);
      if (m !== "tmux" && m !== "desktop") {
        m = S.isDesktop() ? "tmux" : "desktop";
      }
      S.setMode(m);
    },
    watch: function () {
      var opened = S.outWindow() && S.ui.open("WATCH");
      if (S.outShell()) {
        S.watch.print();
      } else if (!opened) {
        err(S.t("No WATCH pane in this session."));
      }
    },
    devnotes: function () {
      S.devnotes();
    },
    select: function (a) {
      S.rep.select(a[0], a[1]);
    },
    fill: function (a) {
      if (a.length < 2) {
        err(S.tc("Type {fill}, a blank number and an entry, like {fill} 2 bio/GATE.")); return;
      }
      var e = resolveEntry(a[1]);
      S.rep.fill(a[0], e ? e.id : a[1]);
    },
    unfill: function (a) {
      S.rep.unfill(a[0]);
    },
    submit: function (a) {
      S.rep.submit(a[0]);
    },
    hints: function (a) {
      if (S.tmux.attached && !S.ui.isOpen("SHELL")) {
        S.ui.open("SHELL");
      }
      var v = S.i18n.arg(a[0]);
      if (v === "on" || v === "off") {
        S.state.hintsOn = v === "on"; S.save();
        scr().line(v === "on" ? S.t("Hints page shown.") : S.t("Hints page hidden."), "ok");
        if (v === "on") {
          hintsPage();
        }
        return;
      }
      hintsPage();
    },
    hint: function (a) {
      revealHint(a[0]);
    },
    light: function (a) {
      var v = S.i18n.arg(a[0]);
      if (v !== "on" && v !== "off") {
        scr().line(S.tc(S.state.light ? "Hint light is on. Type {light} {on} or {light} {off}." : "Hint light is off. Type {light} {on} or {light} {off}."), "dim"); return;
      }
      S.state.light = v === "on"; S.hintLit = false; S.save(); S.status();
      scr().line(v === "on" ? S.t("Hint light on. The HINT mark lights when an open entry answers a blank.") : S.t("Hint light off."), "ok");
    },
    sound: function (a) {
      var v = S.i18n.arg(a[0]);
      var on = v === "on" ? true : v === "off" ? false : !S.state.sound;
      S.state.sound = on; S.save(); S.snd.setOn(on); S.status();
      scr().line(on ? S.t("Sound on.") : S.t("Sound off."), "ok");
    },
    clear: function () {
      scr().clear();
    },
    date: function () {
      scr().line(S.t("{time} UTC, Selk site clock", { time: S.fmtTime(S.state.clock) }));
    },
    whoami: function () {
      scr().line(S.t("Supervisor {name}, Selk site, crew of 1", { name: S.state.name }));
    },
    credits: function () {
      scr().line(S.t("CREDITS"), "head");
      scr().line(S.t("Original concept and story."));
      scr().line(S.t("Coding and implementation assisted by Claude (Anthropic) and Codex (OpenAI)."));
      scr().line(S.t("Pixel scenes and live camera drawn for this game."));
      scr().line(S.t("Fonts: IBM Plex Mono and VT323, SIL Open Font License 1.1."));
      scr().node(function () {
        var a = document.createElement("a");
        a.href = "notes/credits.html"; a.className = "lnk act"; a.textContent = S.t("FULL CREDITS AND REFERENCES");
        var d = scr().el("div", "ln"); d.appendChild(a); return d;
      });
    },
    decide: function () {
      S.end.decide();
    },
    choose: function (a) {
      S.end.choose(a[0]);
    },
    oxygen: function (a) {
      S.end.oxygen(a[0]);
    },
    logout: function () {
      S.logout();
    },
    reset: function (a) {
      if (S.i18n.arg(a[0]) !== "yes") {
        S.snd.error(); scr().line(S.tc("This erases all progress. Type {reset} {yes} to confirm."), "err"); return;
      }
      S.reset(); location.reload();
    }
  };
  C.dir = C.ls; C.cat = C.open; C.read = C.open; C.man = C.help; C.cls = C.clear;
  S.commandNames = Object.keys(HELP.reduce(function (o, h) {
    o[h[0].split(" ")[0]] = 1; return o;
  }, {})).concat( [
    "hint",
    "date",
    "whoami"
  ]);
  /* Where the running command came from, read by S.outShell():
     - "typed": the command line, the tmux prompt (Ctrl+B then :) and the HOME
       / README opened at first sign-in
     - "panel": the FILES panel, the function keys, the status bar buttons and
       the Alt shortcuts, which pass echo = false
     - "click": a link in the output, a report page button, a dialog, the
       context menu, the tour or a desktop icon
     - null: no command is running */
  S.cmdOrigin = null;
  /* True while a command runs whose command line was printed (S.run with echo
     !== false). S.scr.group reads it, since the echo already gives the gap
     above the output. */
  S.cmdEchoed = false;
  /* Where the result of the running command goes: { shell, window }. Both can
     be true. The first rule that matches applies:
     - session not attached yet: shell
     - typed: Shell results decides
     - panel in tmux mode with Shell results IN SHELL: window, and shell with
       Panel results BOTH
     - anything else: window

     docs/shell.md has the details. */
  function route() {
    var s = S.state.settings;
    if (!S.tmux || !S.tmux.attached) {
      return { shell: true, window: false };
    }
    if (S.cmdOrigin === "typed") {
      return { shell: s.shellOut === "shell", window: s.shellOut !== "shell" };
    }
    if (S.cmdOrigin === "panel" && !S.isDesktop() && s.shellOut === "shell" && s.panelOut === "both") {
      return { shell: true, window: true };
    }
    return { shell: false, window: true };
  }
  /* True when the running command prints its result in the SHELL log */
  S.outShell = function () { return route().shell; };
  /* True when the running command opens the window for its result */
  S.outWindow = function () { return route().window; };
  /* Run a command for a clicked control. echo works as in S.run: false leaves
     the command line out of the log. */
  S.runClick = function (raw, echo) {
    S.run(raw, echo, "click");
  };
  /* Parse and run one command line. echo false leaves the command line out of
     the log; any other value prints it after the prompt. origin is "typed",
     "panel" or "click" (S.cmdOrigin); when omitted, an echoed command counts
     as typed and an unechoed one as panel. The output of an unechoed command
     goes into one output group (S.scr.group), apart from the lines around it. */
  S.run = function (raw, echo, origin) {
    var line = String(raw || "").trim();
    if (!line) {
      return;
    }
    var before = { origin: S.cmdOrigin, echoed: S.cmdEchoed };
    S.cmdOrigin = origin || (echo === false ? "panel" : "typed");
    S.cmdEchoed = echo !== false;
    /* A typed command hides FILES and VIEW again in a shell-only DESK
       (T.endReveal in tmux.js) */
    if (S.cmdOrigin === "typed" && S.tmux && S.tmux.endReveal) {
      S.tmux.endReveal();
    }
    try {
      if (echo === false) {
        /* Unechoed commands of the same word share one group */
        var word = S.i18n.command(line.split(/\s+/)[0]) || line.split(/\s+/)[0];
        S.scr.group(function () { runLine(line, echo); }, "cmd:" + String(word).toLowerCase());
      } else {
        runLine(line, echo);
      }
    } finally {
      S.cmdOrigin = before.origin;
      S.cmdEchoed = before.echoed;
    }
  };
  function runLine(line, echo) {
    if (echo !== false) {
      var first = line.split(/\s+/)[0], canon = S.i18n.command(first);
      var shownLine = first.toLowerCase() === canon && C[canon] ? S.cmdName(canon) + line.slice(first.length) : line;
      scr().line(S.promptText() + " " + shownLine, "echo", 0);
    }
    var parts = line.split(/\s+/);
    var name = S.i18n.command(parts[0]);
    var fn = C[name];
    /* After the finale, any command other than decide, choose and oxygen
       restores the interface */
    if (S.finale && name !== "decide" && name !== "choose" && name !== "oxygen") {
      S.end.release();
    }
    if (!fn) {
      err(S.tc("Unknown command {name}. Type {help}.", { name: parts[0] })); return;
    }
    S.tick(1);
    fn(parts.slice(1));
    S.status();
    if (S.isDesktop() && S.tmux.attached) {
      S.desk.refresh();
    }
  }
})();
