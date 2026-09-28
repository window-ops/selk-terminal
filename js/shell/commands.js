/* Shell commands: the help table, the command table and S.run(). */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err, resolveEntry = K.resolveEntry, lockedMsg = K.lockedMsg,
    readMail = K.readMail, hintsPage = K.hintsPage, revealHint = K.revealHint, printEntry = K.printEntry,
    shellTable = K.shellTable, listSection = K.listSection, listRoot = K.listRoot;
  /* Help rows: command, its arguments, what it does. In the arguments, UPPER
     words are placeholders shown through S.t and lower words are fixed
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
    ["submit", "", "send the open report page"],
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
      S.display(S.t("HELP"), (function () {
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
            "zoom a pane; the SHELL pane also has pop out or pop in"
          ],
          [
            "Output redirected to VIEW",
            "the shell records this when a command opens content in VIEW"
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
      })());
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
          tutorial: S.tut.start,
          about: S.about
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
      var box = scr().el("div", "note");
      box.appendChild(scr().el("div", "note-title", n[0]));
      box.appendChild(scr().el("div", "", n[1]));
      box.appendChild(scr().el("div", "dim", S.t("CESEA field handbook, edition {year}", { year: n[2] })));
      S.display(n[0], box, true);
    },
    unlock: function (a) {
      var sec = S.secId(a[0]);
      var lock = S.LOCKS[sec];
      if (!lock) {
        err(S.tc("Type {unlock} and a locked section, like {unlock} archive {pw}.", { pw: S.t("PASSWORD") })); return;
      }
      if (S.isUnlocked(sec)) {
        scr().line(S.t("{name} is already open.", { name: S.sectionById(sec).name }), "dim"); return;
      }
      var given = a.slice(1).map(function (x) {
        return x.toLowerCase();
      });
      if (given.length < lock.parts.length) {
        err(S.tn("{name} needs {n} parts.", lock.parts.length, { name: S.sectionById(sec).name })); return;
      }
      var ok = lock.parts.every(function (p, i) {
        return given[i] === p;
      });
      if (!ok) {
        err(S.t("Password rejected.")); return;
      }
      S.state.unlocked.push(sec);
      S.save();
      S.snd.unlock(); S.snd.hdd(5);
      S.feedback(S.t("{name} unlocked.", { name: S.sectionById(sec).name }), "ok");
      if (S.tmux.attached) {
        S.ex.goSection(sec); S.ui.open("FILES");
      } else {
        C.cd( [
          sec
        ]);
      }
    },
    mail: function (a) {
      if (a[0]) {
        readMail(parseInt(a[0], 10)); return;
      }
      if (S.tmux.attached && S.ui.open("MAIL")) {
        S.mailpane.render(); return;
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
      if (S.tmux.attached && S.ui.open("REPORT")) {
        S.rep.render(); S.emit("report-open"); return;
      }
      S.rep.list();
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
      S.tut.start();
    },
    mode: function (a) {
      var m = S.i18n.arg(a[0]);
      if (m !== "tmux" && m !== "desktop") {
        m = S.isDesktop() ? "tmux" : "desktop";
      }
      S.setMode(m);
    },
    watch: function () {
      if (!S.ui.open("WATCH")) {
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
    "decide",
    "hint",
    "date",
    "whoami"
  ]);
  S.run = function (raw, echo) {
    var line = String(raw || "").trim();
    if (!line) {
      return;
    }
    if (echo !== false) {
      var first = line.split(/\s+/)[0], canon = S.i18n.command(first);
      var shownLine = first.toLowerCase() === canon && C[canon] ? S.cmdName(canon) + line.slice(first.length) : line;
      scr().line(S.promptText() + " " + shownLine, "echo", 0);
    }
    var parts = line.split(/\s+/);
    var name = S.i18n.command(parts[0]);
    var fn = C[name];
    /* Any command outside the decision brings the interface back after the finale */
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
  };
})();
