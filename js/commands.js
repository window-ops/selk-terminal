/* Shell commands (ls, open, mail, report, unlock, hints and the rest) and the
   output they print. S.run(text) parses a command line and dispatches it here. */
(function () {
  var S = window.SELK;
  function scr() {
    return S.scr;
  }
  function err(msg) {
    S.snd.error(); S.feedback(msg, "err");
  }
  function resolveEntry(arg) {
    if (!arg) {
      return null;
    }
    if (arg.indexOf("/") === -1 && S.state.cwd) {
      arg = S.state.cwd + "/" + arg;
    }
    return S.entryById(arg);
  }
  function lockedMsg(sec) {
    if (S.isDesktop() || S.fromClick || !S.ui.isOpen("SHELL")) {
      S.lockedRequester(sec); return;
    }
    var s = S.sectionById(sec);
    var parts = S.LOCKS[sec].parts.length;
    err(s.name + " is locked. Type: unlock " + sec + (parts > 1 ? " PART1 PART2" : " PASSWORD"));
  }
  /* Mail */
  S.queueMail = function (id, ms) {
    var st = S.state;
    if (st.pending.indexOf(id) === -1 && !st.mail.some(function (m) {
      return m.id === id;
    })) {
      st.pending.push(id);
    }
    S.save();
    S.status();
    setTimeout(function () {
      S.deliver(id);
    }, S.fast ? 80 : ms);
  };
  var mailToast = null;
  function dismissMailToast() {
    if (mailToast) {
      mailToast.remove(); mailToast = null;
    }
  }
  S.dismissMailToast = dismissMailToast;
  function showMailToast(n) {
    dismissMailToast();
    var num = ("00" + n).slice(-3);
    var t = document.createElement("div");
    t.className = "mail-toast";
    t.setAttribute("role", "alert");
    var h = document.createElement("div");
    h.className = "mail-toast-head";
    h.innerHTML = '<span class="mail-toast-tag blink">[NEW TRANSMISSION]</span> AUDIT DESK 4';
    var close = document.createElement("button");
    close.type = "button";
    close.className = "mail-toast-close";
    close.textContent = "×";
    close.title = "Dismiss";
    close.setAttribute("aria-label", "Dismiss notification");
    close.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
    });
    h.appendChild(close);
    t.appendChild(h);
    var b = document.createElement("div");
    b.className = "mail-toast-body";
    b.textContent = "New message received via relay R-09: MSG " + num;
    t.appendChild(b);
    var acts = document.createElement("div");
    acts.className = "mail-toast-actions";
    var readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "btn primary";
    readBtn.textContent = "OPEN MSG " + num;
    readBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
      S.run("mail " + n, false);
    });
    var disBtn = document.createElement("button");
    disBtn.type = "button";
    disBtn.className = "btn";
    disBtn.textContent = "DISMISS";
    disBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
    });
    acts.appendChild(readBtn);
    acts.appendChild(disBtn);
    t.appendChild(acts);
    var host = S.notificationHost && S.notificationHost();
    if (host) {
      host.appendChild(t);
    }
    mailToast = t;
  }
  S.deliver = function (id) {
    var st = S.state, i = st.pending.indexOf(id);
    if (i === -1) {
      return;
    }
    st.pending.splice(i, 1);
    if (id !== "MSG001") {
      S.tick(20 + 79);
    }
    st.mail.push( {
      id: id,
      t: st.clock,
      read: false
    });
    var msg = S.MESSAGES[id];
    (msg.opens || []).forEach(function (k) {
      if (!st.reports[k]) {
        st.reports[k] = {
          fill: [
            null,
            null,
            null,
            null
          ],
          done: false
        };
      }
    });
    if (msg.decision) {
      st.decision = true;
    }
    S.save();
    S.status();
    var n = st.mail.length;
    S.snd.chime(); S.snd.hdd(3);
    S.mailpane.render(); S.rep.render();
    S.msg("New message from AUDIT DESK 4. Press F2 or MAIL.", "warn");
    showMailToast(n);
    scr().node(function () {
      var d = scr().el("div", "ln warn");
      d.appendChild(document.createTextNode("[uplink] New message from AUDIT DESK 4. "));
      d.appendChild(scr().cmdButton("READ IT", "mail " + n, "lnk act"));
      return d;
    }, 0);
  };
  function readMail(n) {
    dismissMailToast();
    var m = S.state.mail[n - 1];
    if (!m) {
      err("No message " + n + ". Type mail to list them."); return;
    }
    m.read = true;
    S.save();
    S.status();
    var num = ("00" + n).slice(-3);
    S.emit("mail-read");
    S.mailpane.render();
    S.snd.hdd(2);
    S.display("MSG " + num, (function () {
      var box = scr().el("div", "mail");
      box.appendChild(scr().el("div", "mail-head", "AUDIT DESK 4 > SELK SITE    MSG " + num));
      box.appendChild(scr().el("div", "dim", "sent      " + S.fmtTime(m.t - 79) + " UTC"));
      box.appendChild(scr().el("div", "dim", "received  " + S.fmtTime(m.t) + " UTC"));
      var body = S.renderParas(S.MESSAGES[m.id].body, scr().markup);
      body.classList.add("mail-body");
      box.appendChild(body);
      if (S.MESSAGES[m.id].opens) {
        var row = scr().el("div", "row");
        S.MESSAGES[m.id].opens.forEach(function (k) {
          row.appendChild(scr().cmdButton("OPEN REPORT " + S.REPORTS[k].code, "report " + S.REPORTS[k].code, "lnk act"));
          row.appendChild(document.createTextNode(" "));
        });
        box.appendChild(row);
      }
      if (S.MESSAGES[m.id].decision) {
        box.appendChild(scr().cmdButton("DECIDE", "decide", "lnk act"));
      }
      return box;
    })());
  }
  /* Hints */
  function hintsPage() {
    var st = S.state;
    if (!st.hintsOn) {
      scr().line("Hints are hidden to protect the investigation.", "dim");
      scr().rich("Type hints on to show the hints page. Each hint opens one at a time.", "dim");
      return;
    }
    scr().line("HINTS", "head");
    var any = false;
    Object.keys(st.reports).forEach(function (k) {
      if (st.reports[k].done) {
        return;
      }
      any = true;
      addHintBlock("Report " + S.REPORTS[k].code, S.REPORTS[k].hints, "r:" + k, "hint " + S.REPORTS[k].code);
    });
    S.SECTIONS.forEach(function (s) {
      if (!s.locked || S.isUnlocked(s.id)) {
        return;
      }
      any = true;
      addHintBlock(s.name + " password", S.LOCKS[s.id].hint, "l:" + s.id, "hint " + s.id);
    });
    if (!any) {
      scr().line("No open questions left.", "dim");
    }
    scr().line("Hint light is " + (st.light ? "on" : "off") + ". Type light on or light off.", "dim");
  }
  function addHintBlock(label, list, key, cmd) {
    var shown = S.state.hintsShown[key] || 0;
    scr().node(function () {
      var box = scr().el("div", "ln hintbox");
      box.appendChild(scr().el("div", "", label + "   " + shown + " of " + list.length + " shown"));
      for (var i = 0; i < shown; i++) {
        box.appendChild(scr().el("div", "dim", "  " + (i + 1) + ". " + list[i]));
      }
      if (shown < list.length) {
        box.appendChild(scr().cmdButton("SHOW NEXT HINT", cmd, "lnk act"));
      }
      return box;
    });
  }
  function revealHint(target) {
    var st = S.state;
    if (!st.hintsOn) {
      err("Hints are hidden. Type hints on first."); return;
    }
    var key, list, label;
    var rk = S.report(target || (st.active ? S.REPORTS[st.active].code : ""));
    if (rk && st.reports[rk]) {
      key = "r:" + rk; list = S.REPORTS[rk].hints; label = "Report " + S.REPORTS[rk].code;
    } else if (target && S.LOCKS[target.toLowerCase()]) {
      var sec = target.toLowerCase();
      if (S.isUnlocked(sec)) {
        scr().line("That section is already open.", "dim"); return;
      }
      key = "l:" + sec; list = S.LOCKS[sec].hint; label = S.sectionById(sec).name + " password";
    } else {
      err("Type hint 2 for a report or hint archive for a password."); return;
    }
    var n = st.hintsShown[key] || 0;
    if (n >= list.length) {
      scr().line("All hints for " + label + " are shown.", "dim"); return;
    }
    st.hintsShown[key] = n + 1;
    S.save();
    S.snd.tick();
    scr().line(label + ", hint " + (n + 1) + ": " + list[n], "warn");
  }
  /* Entries */
  function printEntry(e) {
    var sec = e.id.split("/")[0];
    S.hintLit = S.state.light && S.rep.isAnswer(e.id);
    if (S.state.read.indexOf(e.id) === -1) {
      S.state.read.push(e.id); S.save();
    }
    S.status();
    S.snd.hdd(4);
    S.display(S.entryTitle(e.id), (function () {
      var box = scr().el("div", "entry");
      var head = scr().el("div", "entry-title", e.path || S.entryTitle(e.id));
      if (!e.sys) {
        head.draggable = true; head.title = "Drag onto a report blank";
        head.dataset.entry = e.id;
        head.addEventListener("dragstart", function (ev) {
          S.dragStart(ev, e.id);
        });
        head.insertBefore(S.grip(e.id), head.firstChild);
      }
      box.appendChild(head);
      var by = scr().el("div", "dim");
      scr().markup("{written by|author}: " + e.by, by);
      box.appendChild(by);
      box.appendChild(scr().el("div", "rule"));
      if (e.sys) {
        box.appendChild(S.renderSys(e, e.body.replace(/@USER@/g, S.userId())));
      } else {
        box.appendChild(S.renderBody(e.body, scr().markup, e.table));
      }
      if (e.img) {
        var fig = scr().el("figure", "cam");
        var img = document.createElement("img");
        img.src = e.img; img.alt = e.cap; img.loading = "lazy";
        fig.appendChild(img);
        fig.appendChild(scr().el("figcaption", "dim", e.cap));
        box.appendChild(fig);
      }
      var sel = S.state.sel;
      if (sel && S.state.reports[sel.r] && !S.state.reports[sel.r].done) {
        var u = scr().el("button", "use", "USE FOR BLANK " + sel.n + " OF REPORT " + S.REPORTS[sel.r].code);
        u.type = "button";
        u.addEventListener("click", function () {
          S.rep.fillBlank(sel.r, sel.n, e.id); u.remove();
        });
        box.appendChild(u);
      }
      return box;
    })());
    if (S.ex) {
      S.ex.render();
    }
    S.emit("open:" + e.id);
    if (S.state.cwd !== sec) {
      S.state.cwd = sec; S.prompt(); S.save();
    }
  }
  function shellTable(rows) {
    var wrap = scr().el("div", "etable-wrap ln"), t = scr().el("table", "etable listing"), tb = scr().el("tbody");
    rows.forEach(function (r) {
      var tr = scr().el("tr");
      r.forEach(function (c) {
        var td = scr().el("td", c && c.cls ? c.cls : ""); if (c && c.node) {
          td.appendChild(c.node);
        } else {
          td.textContent = c && c.text != null ? c.text : (c || "");
        } tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t);
    return wrap;
  }
  function listSection(sec) {
    var s = S.sectionById(sec);
    scr().line(s.name.toUpperCase(), "head");
    scr().node(function () {
      return shellTable(S.ENTRIES.filter(function (e) {
        return e.id.split("/")[0] === sec;
      }).map(function (e) {
        return [
          {
            node: scr().cmdButton(e.id.split("/")[1], "open " + e.id)
          },
          {
            text: e.path || e.by,
            cls: "dim"
          }
        ];
      }));
    });
  }
  function listRoot() {
    scr().node(function () {
      return shellTable(S.SECTIONS.map(function (s) {
        var locked = !S.isUnlocked(s.id);
        var count = S.ENTRIES.filter(function (e) {
          return e.id.split("/")[0] === s.id;
        }).length;
        return [
          {
            node: scr().cmdButton(s.name.toUpperCase(), "cd " + s.id)
          },
          {
            text: locked ? "locked" : count + " entries",
            cls: locked ? "err" : "dim"
          }
        ];
      }));
    });
  }
  var HELP = [
    [
      "ls",
      "list sections, or entries in this section"
    ],
    [
      "cd NAME",
      "enter a section, cd .. to leave"
    ],
    [
      "open NAME",
      "read an entry"
    ],
    [
      "note TERM",
      "read a handbook note"
    ],
    [
      "unlock NAME PASSWORD",
      "open a locked section"
    ],
    [
      "mail",
      "list messages, mail 2 reads one"
    ],
    [
      "report",
      "list report pages, report 2 opens one"
    ],
    [
      "fill 2 NAME",
      "put an entry in blank 2"
    ],
    [
      "submit",
      "send the open report page"
    ],
    [
      "hints",
      "hints page, hidden until you type hints on"
    ],
    [
      "light on",
      "hint light, off by default"
    ],
    [
      "sound off",
      "sound on or off"
    ],
    [
      "settings",
      "setup screen, also F9"
    ],
    [
      "watch",
      "live telemetry"
    ],
    [
      "mode",
      "switch tmux and desktop"
    ],
    [
      "storage",
      "saved data in this browser"
    ],
    [
      "devnotes",
      "developer notes, spoilers"
    ],
    [
      "clear",
      "clear the screen"
    ],
    [
      "credits",
      "credits and licenses"
    ],
    [
      "logout",
      "end the session, progress is kept"
    ],
    [
      "reset",
      "erase all progress"
    ]
  ];
  var C = {
    help: function () {
      S.display("HELP", (function () {
        var wrap = scr().el("div", "entry");
        wrap.appendChild(scr().el("div", "entry-title", "COMMANDS AND KEYS"));
        var dl = scr().el("dl", "fields help");
        var add = function (h) {
          if (!h[0]) {
            return;
          } dl.appendChild(scr().el("dt", "", h[0])); dl.appendChild(scr().el("dd", "dim", h[1]));
        };
        HELP.forEach(add);
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
            "Drag a name",
            "drop it on a report blank"
          ]
        ].forEach(function (h) {
          add(h);
        });
        return wrap;
      })());
    },
    ls: function (a) {
      var target = a[0] ? a[0].toLowerCase().replace(/\/$/, "") : S.state.cwd;
      if (target === ".." || target === "/") {
        target = "";
      }
      if (!target) {
        listRoot(); return;
      }
      if (!S.sectionById(target)) {
        err("No section called " + a[0] + "."); return;
      }
      if (!S.isUnlocked(target)) {
        lockedMsg(target); return;
      }
      listSection(target);
    },
    cd: function (a) {
      var t = (a[0] || "").toLowerCase().replace(/\/$/, "");
      if (!t || t === ".." || t === "/" || t === "~") {
        S.state.cwd = ""; S.prompt(); S.save(); listRoot(); return;
      }
      if (!S.sectionById(t)) {
        err("No section called " + a[0] + "."); return;
      }
      if (!S.isUnlocked(t)) {
        lockedMsg(t); return;
      }
      S.state.cwd = t; S.prompt(); S.save();
      listSection(t);
    },
    open: function (a) {
      if (!a[0]) {
        err("Type open and an entry name, like open bio/GATE."); return;
      }
      var e = resolveEntry(a[0]);
      if (!e) {
        if (S.sectionById(a[0].toLowerCase())) {
          C.cd(a); return;
        }
        err("No entry called " + a[0] + ". Type ls to see names.");
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
      S.snd.click();
      printEntry(e);
    },
    note: function (a) {
      var n = S.NOTES[(a[0] || "").toLowerCase()];
      if (!n) {
        err("No handbook note for " + (a[0] || "that") + "."); return;
      }
      S.snd.tick();
      var box = scr().el("div", "note");
      box.appendChild(scr().el("div", "note-title", n[0]));
      box.appendChild(scr().el("div", "", n[1]));
      box.appendChild(scr().el("div", "dim", "CESEA field handbook, edition " + n[2]));
      S.display(n[0], box, true);
    },
    unlock: function (a) {
      var sec = (a[0] || "").toLowerCase();
      var lock = S.LOCKS[sec];
      if (!lock) {
        err("Type unlock and a locked section, like unlock archive PASSWORD."); return;
      }
      if (S.isUnlocked(sec)) {
        scr().line(S.sectionById(sec).name + " is already open.", "dim"); return;
      }
      var given = a.slice(1).map(function (x) {
        return x.toLowerCase();
      });
      if (given.length < lock.parts.length) {
        err(S.sectionById(sec).name + " needs " + lock.parts.length + (lock.parts.length > 1 ? " parts." : " password.")); return;
      }
      var ok = lock.parts.every(function (p, i) {
        return given[i] === p;
      });
      if (!ok) {
        err("Password rejected."); return;
      }
      S.state.unlocked.push(sec);
      S.save();
      S.snd.unlock(); S.snd.hdd(5);
      S.feedback(S.sectionById(sec).name + " unlocked.", "ok");
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
        scr().line(S.state.pending.length ? "No messages yet. The uplink is receiving." : "No messages.", "dim"); return;
      }
      scr().node(function () {
        return shellTable(m.map(function (x, i) {
          return [
            {
              node: scr().cmdButton("MSG " + ("00" + (i + 1)).slice(-3), "mail " + (i + 1))
            },
            {
              text: S.fmtTime(x.t),
              cls: "dim"
            },
            {
              text: "AUDIT DESK 4" + (x.read ? "" : ", unread"),
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
      var m = (a[0] || "").toLowerCase();
      if (m !== "tmux" && m !== "desktop") {
        m = S.isDesktop() ? "tmux" : "desktop";
      }
      S.setMode(m);
    },
    watch: function () {
      if (!S.ui.open("WATCH")) {
        err("No WATCH pane in this session.");
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
        err("Type fill, a blank number and an entry, like fill 2 bio/GATE."); return;
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
      var v = (a[0] || "").toLowerCase();
      if (v === "on" || v === "off") {
        S.state.hintsOn = v === "on"; S.save();
        scr().line("Hints page " + (v === "on" ? "shown" : "hidden") + ".", "ok");
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
      var v = (a[0] || "").toLowerCase();
      if (v !== "on" && v !== "off") {
        scr().line("Hint light is " + (S.state.light ? "on" : "off") + ". Type light on or light off.", "dim"); return;
      }
      S.state.light = v === "on"; S.hintLit = false; S.save(); S.status();
      scr().line(v === "on" ? "Hint light on. The HINT mark lights when an open entry answers a blank." : "Hint light off.", "ok");
    },
    sound: function (a) {
      var v = (a[0] || "").toLowerCase();
      var on = v === "on" ? true : v === "off" ? false : !S.state.sound;
      S.state.sound = on; S.save(); S.snd.setOn(on); S.status();
      scr().line("Sound " + (on ? "on" : "off") + ".", "ok");
    },
    clear: function () {
      scr().clear();
    },
    date: function () {
      scr().line(S.fmtTime(S.state.clock) + " UTC, Selk site clock");
    },
    whoami: function () {
      scr().line("Supervisor " + S.state.name + ", Selk site, crew of 1");
    },
    credits: function () {
      scr().line("CREDITS", "head");
      scr().line("Original concept and story.");
      scr().line("Coding and implementation assisted by Claude (Anthropic) and Codex (OpenAI).");
      scr().line("Pixel scenes and live camera drawn for this game.");
      scr().line("Fonts: IBM Plex Mono and VT323, SIL Open Font License 1.1.");
      scr().node(function () {
        var a = document.createElement("a");
        a.href = "notes/credits.html"; a.className = "lnk act"; a.textContent = "FULL CREDITS AND REFERENCES";
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
      if ((a[0] || "").toLowerCase() !== "yes") {
        S.snd.error(); scr().line("This erases all progress. Type reset yes to confirm.", "err"); return;
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
      scr().line(S.promptText() + " " + line, "echo", 0);
    }
    var parts = line.split(/\s+/);
    var name = parts[0].toLowerCase();
    var fn = C[name];
    if (!fn) {
      err("Unknown command " + parts[0] + ". Type help."); return;
    }
    S.tick(1);
    fn(parts.slice(1));
    S.status();
    if (S.isDesktop() && S.tmux.attached) {
      S.desk.refresh();
    }
  };
  S.complete = function (value) {
    var parts = value.split(/\s+/);
    var cands = [];
    if (parts.length === 1) {
      cands = Object.keys(C);
    } else {
      var cmd = parts[0].toLowerCase();
      if (cmd === "cd" || cmd === "ls" || cmd === "unlock") {
        cands = S.SECTIONS.map(function (s) {
          return s.id;
        });
      } else if (cmd === "open" || cmd === "cat" || cmd === "fill") {
        cands = S.ENTRIES.filter(function (e) {
          return S.isUnlocked(e.id.split("/")[0]);
        }).map(function (e) {
          var sec = e.id.split("/")[0];
          return sec === S.state.cwd ? e.id.split("/")[1] : e.id;
        });
      } else if (cmd === "note") {
        cands = Object.keys(S.NOTES);
      }
    }
    var last = parts[parts.length - 1].toLowerCase();
    var hits = cands.filter(function (c) {
      return c.toLowerCase().indexOf(last) === 0;
    });
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      return parts.join(" ") + (parts.length === 1 ? " " : "");
    }
    if (hits.length > 1) {
      scr().line(hits.join("   "), "dim", 0);
    }
    return value;
  };
})();
