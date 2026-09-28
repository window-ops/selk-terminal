/* Cross-cutting helpers: drag grips, locked-section requesters, the context menu,
   the About screen, the guided tour, Alt shortcuts and the window switcher. */
(function () {
  var S = window.SELK;
  function $(id) {
    return document.getElementById(id);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  S.bootTime = Date.now();
  /* Drag grip shown beside anything that can fill a report blank */
  S.grip = function (id) {
    var g = el("span", "grip");
    g.title = "Drag onto a report blank, or right-click for options";
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", "Can fill a report blank");
    g.draggable = true;
    g.addEventListener("dragstart", function (e) {
      e.stopPropagation(); S.dragStart(e, id);
    });
    return g;
  };
  /* Locked sections: always say so, in every mode */
  S.lockedRequester = function (sec) {
    var s = S.sectionById(sec);
    S.snd.error();
    S.dialog( {
      title: s.name.toUpperCase() + " IS LOCKED",
      text: "The entries in " + s.name + " need a password. The passwords were changed while you slept. Each one appears in an entry you can already open, as a name, a word or a number. The hints command can help.",
      buttons: [
        {
          label: "ENTER PASSWORD",
          action: function () {
            setTimeout(function () {
              S.unlockDialog(sec);
            }, 0);
          }
        },
        {
          label: "CANCEL"
        }
      ]
    });
  };
  /* Context menu */
  var menu = null;
  function closeMenu() {
    if (menu) {
      menu.remove(); menu = null;
    }
  }
  S.closeMenu = closeMenu;
  function showMenu(x, y, items) {
    closeMenu();
    menu = el("div", "ctx");
    menu.setAttribute("role", "menu");
    items.forEach(function (it) {
      if (!it) {
        menu.appendChild(el("div", "ctx-sep")); return;
      }
      var b = el("button", "ctx-item"); b.type = "button"; b.setAttribute("role", "menuitem");
      b.appendChild(el("span", "", it[0]));
      if (it[2]) {
        b.appendChild(el("span", "ctx-key", it[2]));
      }
      b.disabled = !it[1];
      b.addEventListener("click", function () {
        closeMenu(); if (it[1]) {
          it[1]();
        }
      });
      menu.appendChild(b);
    });
    var scr = $("screen"), r = scr.getBoundingClientRect();
    scr.appendChild(menu);
    var mx = Math.min(x - r.left, r.width - menu.offsetWidth - 4), my = Math.min(y - r.top, r.height - menu.offsetHeight - 4);
    menu.style.left = Math.max(2, mx) + "px"; menu.style.top = Math.max(2, my) + "px";
    var first = menu.querySelector(".ctx-item:not(:disabled)"); if (first) {
      first.focus();
    }
  }
  function entryItems(id) {
    var items = [
      [
        "OPEN",
        function () {
          S.run("open " + id, false);
        },
        "ENTER"
      ]
    ];
    var key = S.state.active, r = key && S.state.reports[key];
    if (r && !r.done) {
      items.push(null);
      S.REPORTS[key].lines.forEach(function (ln, i) {
        var cur = r.fill[i] ? S.entryTitle(r.fill[i]) : "empty";
        items.push( [
          "PUT IN REPORT " + S.REPORTS[key].code + " BLANK " + (i + 1) + " (" + cur + ")",
          function () {
            S.rep.fillBlank(key, i + 1, id);
          }
        ]);
      });
    } else if (!Object.keys(S.state.reports).length) {
      items.push( [
        "NO REPORT PAGE YET",
        null
      ]);
    }
    items.push(null, [
      "COPY NAME",
      function () {
        S.copyText(id);
      }
    ]);
    return items;
  }
  function common() {
    return [
      null,
      [
        "REPORT",
        function () {
          S.run("report", false);
        },
        "ALT+R"
      ],
      [
        "MAIL",
        function () {
          S.run("mail", false);
        },
        "ALT+M"
      ],
      [
        "SETUP",
        function () {
          S.settingsDialog();
        },
        "ALT+P"
      ],
      [
        "TUTORIAL",
        function () {
          S.tut.start();
        },
        "ALT+T"
      ],
      [
        "ABOUT SELK OS",
        function () {
          S.about();
        },
        "ALT+A"
      ]
    ];
  }
  S.copyText = function (text) {
    var done = function () {
      S.msg("Copied " + (text.length > 40 ? text.slice(0, 40) + "..." : text)); S.snd.tick();
    };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try {
        document.execCommand("copy"); done();
      } catch (e) {
        S.msg("Copy is not available here", "err");
      }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  };
  function clean(n) {
    return (n.innerText || n.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  }
  function fieldText(dd) {
    var dt = dd.previousElementSibling; return (dt && dt.tagName === "DT" && dt.textContent ? dt.textContent + ": " : "") + clean(dd);
  }
  function textItems(t, sel) {
    var items = [], n;
    if (sel) {
      items.push( [
        "COPY SELECTION",
        function () {
          S.copyText(sel);
        },
        "CTRL+C"
      ]);
    }
    if ((n = t.closest("dd"))) {
      var dd = n; items.push( [
        "COPY VALUE",
        function () {
          S.copyText(clean(dd));
        }
      ], [
        "COPY FIELD",
        function () {
          S.copyText(fieldText(dd));
        }
      ]);
    }
    else if ((n = t.closest("dt")) && n.nextElementSibling) {
      var d2 = n.nextElementSibling; items.push( [
        "COPY FIELD",
        function () {
          S.copyText(fieldText(d2));
        }
      ]);
    }
    if ((n = t.closest("td, th"))) {
      var cell = n, row = n.parentNode;
      items.push( [
        "COPY CELL",
        function () {
          S.copyText(clean(cell));
        }
      ], [
        "COPY ROW",
        function () {
          S.copyText([].map.call(row.children, clean).join("\t"));
        }
      ]);
    }
    if ((n = t.closest(".entry, .note"))) {
      var en = n; items.push( [
        "COPY WHOLE " + (n.classList.contains("note") ? "NOTE" : "ENTRY"),
        function () {
          S.copyText(clean(en));
        }
      ]);
    }
    if ((n = t.closest(".mail"))) {
      var ml = n; items.push( [
        "COPY MESSAGE",
        function () {
          S.copyText(clean(ml));
        }
      ]);
    }
    if ((n = t.closest(".paper"))) {
      var pp = n; items.push( [
        "COPY REPORT PAGE",
        function () {
          S.copyText(clean(pp));
        }
      ]);
    }
    if (t.closest(".log")) {
      items.push( [
        "CLEAR SHELL",
        function () {
          S.run("clear", false);
        }
      ]);
    }
    return items;
  }
  document.addEventListener("select", function (e) {
    var i = e.target; if (i && i.tagName === "INPUT") {
      i._sel = [
        i.selectionStart,
        i.selectionEnd
      ];
    }
  }, true);
  document.addEventListener("input", function (e) {
    if (e.target && e.target.tagName === "INPUT") {
      e.target._sel = null;
    }
  }, true);
  function inputItems(inp) {
    var s = inp.selectionStart, e = inp.selectionEnd;
    if (e <= s && inp._sel && inp._sel[1] > inp._sel[0]) {
      s = inp._sel[0]; e = inp._sel[1];
    }
    var has = e > s;
    return [
      [
        "CUT",
        has ? function () {
          S.copyText(inp.value.slice(s, e)); inp.value = inp.value.slice(0, s) + inp.value.slice(e); inp.focus();
        } : null,
        "CTRL+X"
      ],
      [
        "COPY",
        has ? function () {
          S.copyText(inp.value.slice(s, e));
        } : null,
        "CTRL+C"
      ],
      [
        "PASTE",
        navigator.clipboard && navigator.clipboard.readText ? function () {
          navigator.clipboard.readText().then(function (txt) {
            inp.value = inp.value.slice(0, s) + txt + inp.value.slice(e); inp.focus();
          }, function () {
            S.msg("Paste was blocked. Use Ctrl+V.", "err");
          });
        } : null,
        "CTRL+V"
      ],
      [
        "SELECT ALL",
        inp.value ? function () {
          inp.focus(); inp.select();
        } : null,
        "CTRL+A"
      ],
      [
        "CLEAR",
        inp.value ? function () {
          inp.value = ""; inp.focus();
        } : null
      ]
    ];
  }
  document.addEventListener("contextmenu", function (e) {
    if (!e.target.closest("#screen") || S.mode !== "shell" || S.dlg) {
      return;
    }
    e.preventDefault();
    var t = e.target, items = [], hit, sel = (window.getSelection && window.getSelection().toString()) || "";
    var inp = t.closest("input[type='text']");
    if (inp) {
      showMenu(e.clientX, e.clientY, inputItems(inp)); return;
    }
    var txt = textItems(t, sel.trim());
    if ((hit = t.closest("[data-entry]"))) {
      items = entryItems(hit.dataset.entry);
    }
    else if ((hit = t.closest("[data-cmd^='open ']")) && S.entryById(hit.dataset.cmd.slice(5))) {
      items = entryItems(S.entryById(hit.dataset.cmd.slice(5)).id);
    }
    else if ((hit = t.closest("[data-sec]"))) {
      var sec = hit.dataset.sec, open = S.isUnlocked(sec);
      items = [
        [
          "OPEN",
          open ? function () {
            S.desk && S.isDesktop() ? S.desk.openDrawer(sec) : (S.ex.goSection(sec), S.ui.open("FILES"));
          } : null
        ],
        [
          "UNLOCK",
          open ? null : function () {
            S.unlockDialog(sec);
          },
          "ALT+L"
        ]
      ];
    }
    else if ((hit = t.closest(".blank"))) {
      var n = +hit.dataset.n;
      items = [
        [
          "SELECT BLANK " + n,
          function () {
            hit.click();
          }
        ],
        [
          "CLEAR BLANK " + n,
          function () {
            S.rep.unfill(n);
          }
        ]
      ];
    }
    else if (S.isDesktop() && (hit = t.closest(".wb-win"))) {
      var w = S.desk.winFor(hit);
      items = [
        [
          "CLOSE WINDOW",
          function () {
            S.desk.close(w);
          }
        ],
        [
          "BRING TO FRONT",
          function () {
            S.desk.front(w);
          }
        ],
        [
          w.max ? "RESTORE" : "MAXIMIZE",
          function () {
            S.desk.maximise(w);
          }
        ]
      ];
    }
    else if (S.isDesktop()) {
      items = [
        [
          "OPEN SELK DISK",
          function () {
            S.desk.goto("FILES");
          }
        ],
        [
          "CLOSE ALL WINDOWS",
          function () {
            S.desk.closeAll();
          }
        ],
        [
          "SWITCH TO TMUX",
          function () {
            S.setMode("tmux");
          },
          "ALT+D"
        ]
      ];
    }
    else if ((hit = t.closest(".pane"))) {
      var T = S.tmux; T.cur = hit._leaf || T.cur;
      var paneKind = T.cur && T.cur.kind;
      items = [
        [
          T.zoom ? "UNZOOM PANE" : "ZOOM PANE",
          function () {
            T.zoomToggle();
          },
          "^B Z"
        ],
        [
          "SWITCH TO DESKTOP",
          function () {
            S.setMode("desktop");
          },
          "ALT+D"
        ]
      ];
      /* Panes that can close (REPORT, MAIL, WATCH) offer it here as well as in their header */
      if (T.isClosable && T.isClosable(paneKind)) {
        items.push(["CLOSE " + paneKind, function () { S.ui.close(paneKind); }]);
      }
      if (T.canPopOutShell()) {
        items.unshift([
          "POP OUT SHELL",
          function () {
            T.popOutShell();
          },
          ""
        ]);
      } else if (T.canPopInShell()) {
        items.unshift([
          "POP IN SHELL",
          function () {
            T.popInShell();
          }
        ]);
      }
    }
    if (txt.length && items.length) {
      txt.push(null);
    }
    showMenu(e.clientX, e.clientY, txt.concat(items, common()));
  });
  document.addEventListener("pointerdown", function (e) {
    if (menu && !e.target.closest(".ctx")) {
      closeMenu();
    }
  }, true);
  document.addEventListener("keydown", function (e) {
    if (menu && e.key === "Escape") {
      closeMenu();
    }
  }, true);
  /* About */
  S.uptimeText = function () {
    var up = Math.floor((Date.now() - S.bootTime) / 1000);
    return Math.floor(up / 3600) + " h " + Math.floor(up / 60) % 60 + " min " + up % 60 + " s";
  };
  S.about = function () {
    var body = [
      [
        "System",
        "CESEA Site OS 7.2"
      ],
      [
        "Interface",
        S.isDesktop() ? "Selk Workbench 1.0" : "tmux 3.4 on Selk shell"
      ],
      [
        "Boot ROM",
        "7.2.1, built 12-03-2079"
      ],
      [
        "Processor",
        "CESEA R-64, radiation hardened, 4 cores, 1.2 GHz"
      ],
      [
        "Memory",
        "64 GB, error-correcting"
      ],
      [
        "Drive 0",
        "4 TB, 5 400 rpm, 61 % free"
      ],
      [
        "Display",
        "amber phosphor CRT, 80 by 30 characters"
      ],
      [
        "Uplink",
        "relay R-09, 74 to 84 min to Earth"
      ],
      [
        "Uptime",
        S.uptimeText(),
        "about-uptime"
      ],
      [
        "Site clock",
        S.clockText() + " UTC",
        "about-clock"
      ]
    ];
    S.dialog( {
      title: "ABOUT SELK OS",
      wide: true,
      build: function (b) {
        var dl = el("dl", "fields");
        body.forEach(function (r) {
          dl.appendChild(el("dt", "", r[0])); var dd = el("dd", "", r[1]); if (r[2]) {
            dd.id = r[2];
          } dl.appendChild(dd);
        });
        b.appendChild(dl);
        b.appendChild(el("div", "dlg-rule"));
        b.appendChild(el("div", "dim", "Original concept and story. Coding and implementation assisted by Claude (Anthropic) and Codex (OpenAI). Fonts under the SIL Open Font License 1.1."));
      },
      buttons: [
        {
          label: "OK"
        },
        {
          label: "CREDITS",
          action: function () {
            window.open("notes/credits.html", "_blank");
          }
        }
      ]
    });
  };
  /* Tutorial */
  /* Two tours with the same steps. SIMPLE explains in plain words for players who
     have never used a terminal; TECHNICAL is shorter and uses terminal terms.
     Each step is a list of short paragraphs, "on" names the game event that
     completes it, and "spot" is what gets outlined on screen. */
  function STEPS() {
    var d = S.isDesktop(), m = S.tmux.mobile();
    var tech = !!(S.state.tut && S.state.tut.kind === "technical");
    var SPOT = {
      files: d ? ".wb-group:first-child .wb-icon:first-child, .wb-win .wb-icon" : m ? ".tmux-win" : ".mc",
      view: d ? ".wb-win .viewer" : ".viewer",
      mail: d ? "#wb-mail, .mrow" : "#st-mail, .mrow",
      report: d ? ".wb-group:first-child .wb-icon:nth-child(2)" : "#st-report",
      blank: ".paper .blank:not(.filled)",
      submit: ".paper-btn, .paper .blank:not(.filled)"
    };
    if (tech) {
      return [
        { t: ["Selk is a database investigation game. You answer report pages from the audit office with the names of database entries.", "This tour covers the windows, mail, reports and the useful shortcuts."] },
        { t: d ? ["Open the SELK disk, then the HOME drawer, then README.", "Windows move by their title bar and resize from the lower right corner."] : ["FILES is a two-panel explorer: sections on the left, entries on the right.", "Arrow keys move, Enter opens, Tab switches panels. Open HOME / README."], on: "open:home/README", action: "files", spot: SPOT.files },
        { t: ["Mail arrives with a delay, like a real signal from Earth.", "Open MAIL (F2 or Alt+M) and read MSG 001."], on: "mail-read", action: "mail", spot: SPOT.mail },
        { t: ["Open REPORT (F5 or Alt+R).", d ? "It opens as its own window." : "It splits in beside VIEW, and closes from its header or the pane context menu."], on: "report-open", action: "report", spot: SPOT.report },
        { t: ["Fill a blank in one of three ways: drag an entry by its grip; select a blank, highlight an entry in FILES and press F4; or right-click an entry (Shift+F10 on the keyboard) and choose a blank.", "The shell accepts fill 1 site/SELK as well."], on: "fill", action: "files", spot: SPOT.blank },
        { t: ["Submit with SUBMIT PAGE, Alt+K or the submit command.", "A wrong page tells you how many answers match, never which ones."], on: "submit", action: "report", spot: SPOT.submit },
        { t: ["Panes: Ctrl+B, then O cycles, Z zooms and unzooms, digits switch windows. The shell pops out into its own window from its header.", "Setup (Alt+P) holds hints, text speed, motion, the debug log and more. Replay a tour from HOME / TUTORIAL."], last: true }
      ];
    }
    return [
      { t: ["Welcome. You look after a research base on Titan, the largest moon of Saturn.", "The tall tower at the base is failing, and people on Earth want to know why. You find the answers in the records on this computer.", "This tour shows you how, one small step at a time. Press NEXT to begin."] },
      { t: d ? ["The records are kept like folders in a cabinet.", "Open the SELK disk (the icon at the top right), then HOME, then README."] : ["The list on the left works like a filing cabinet.", "Click HOME, then click README. Your arrow keys and Enter work too."], on: "open:home/README", action: "files", spot: SPOT.files },
      { t: ["The record opens in the reading area.", "Words with a dotted line under them open a short explanation when you click them.", "Read the record, then press NEXT."], spot: SPOT.view },
      { t: ["Earth has sent you a message.", "Click MAIL" + (d ? " at the top of the screen" : " at the bottom of the screen") + ", then click the message to read it. Messages take a few seconds to arrive."], on: "mail-read", action: "mail", spot: SPOT.mail },
      { t: ["The message asks you to fill in a report: a short form with four gaps.", "Click REPORT" + (d ? " on the right" : " at the bottom") + " to open it."], on: "report-open", action: "report", spot: SPOT.report },
      { t: ["Each gap needs the name of one record.", "The simplest way: click a gap, then open the record in the list and click the button USE FOR BLANK. You can also drag a record onto a gap.", "Try gap 1 with the record SITE / SELK."], on: "fill", action: "files", spot: SPOT.blank },
      { t: ["Fill the other three gaps the same way. If you pick the wrong record, click the small x next to it.", "When all four are filled, click SUBMIT PAGE. If an answer is wrong, the page stays open so you can try again."], on: "submit", action: "report", spot: SPOT.submit },
      { t: ["That is the whole game: read records, fill in the report, send it to Earth.", "If you get stuck, SETUP can switch on hints. You can replay this tour from TUTORIAL in HOME."], last: true }
    ];
  }
  /* Spotlight: outline the thing the current step asks for */
  var spotSel = null;
  function clearSpot() { document.querySelectorAll(".tut-spot").forEach(function (n) { n.classList.remove("tut-spot"); }); }
  function applySpot() {
    clearSpot();
    if (!spotSel || !S.state.tut || !S.state.tut.on) { return; }
    var n = [].filter.call(document.querySelectorAll(spotSel), function (x) { return x.offsetParent; })[0];
    if (n) { n.classList.add("tut-spot"); }
  }
  setInterval(applySpot, 700);
  var panel = null;
  function satisfied(on) {
    var st = S.state, reps = Object.keys(st.reports).map(function (k) {
      return st.reports[k];
    });
    if (!on) {
      return false;
    }
    if (on.indexOf("open:") === 0) {
      return st.read.indexOf(on.slice(5)) !== -1;
    }
    if (on === "mail-read") {
      return st.mail.some(function (m) {
        return m.read;
      });
    }
    if (on === "fill") {
      return reps.some(function (r) {
        return r.fill.some(Boolean);
      });
    }
    if (on === "submit") {
      return reps.some(function (r) {
        return r.done;
      });
    }
    return false;
  }
  function draw() {
    if (panel) {
      panel.remove(); panel = null;
    }
    var st = S.state.tut;
    if (!st || !st.on) {
      spotSel = null; clearSpot();
      return;
    }
    var steps = STEPS();
    while (st.step > 0 && steps[st.step] && satisfied(steps[st.step].on)) {
      st.step++;
    }
    S.save();
    var s = steps[st.step];
    spotSel = s ? s.spot || null : null;
    applySpot();
    if (!s) {
      st.on = false; S.save(); return;
    }
    panel = el("div", "tut"); panel.setAttribute("role", "region"); panel.setAttribute("aria-label", "Interactive tutorial"); panel.setAttribute("aria-live", "polite");
    panel.appendChild(el("div", "tut-head", "TOUR, STEP " + (st.step + 1) + " OF " + steps.length));
    [].concat(s.t).forEach(function (para) { panel.appendChild(el("p", "", para)); });
    var row = el("div", "tut-btns");
    if (s.action) {
      var actions = {
        files: {
          label: "GO TO FILES",
          run: function () {
            S.ui.open("FILES");
          }
        },
        mail: {
          label: "OPEN MAIL",
          run: function () {
            S.run("mail", false);
          }
        },
        report: {
          label: "OPEN REPORT",
          run: function () {
            S.run("report", false);
          }
        }
      };
      var action = actions[s.action], go = el("button", "btn primary", action.label); go.type = "button";
      go.addEventListener("click", action.run); row.appendChild(go);
    }
    var next = el("button", "btn", s.last ? "FINISH" : s.on ? "DO THE TASK" : "NEXT"); next.type = "button";
    next.disabled = !!s.on;
    next.addEventListener("click", function () {
      S.tut.next();
    });
    var skip = el("button", "btn", "END TOUR"); skip.type = "button";
    skip.addEventListener("click", function () {
      S.tut.stop();
    });
    row.appendChild(next); if (!s.last) {
      row.appendChild(skip);
    }
    panel.appendChild(row);
    var host = S.notificationHost && S.notificationHost();
    if (host) {
      host.appendChild(panel);
    }
  }
  S.tut = {
    /* start("simple") or start("technical"); without a kind, ask which tour. */
    start: function (kind) {
      if (kind !== "simple" && kind !== "technical") { S.tut.choose(); return; }
      S.state.tut = {
        on: true,
        step: 0,
        kind: kind
      }; S.save(); draw(); S.snd.chime();
    },
    stop: function () {
      S.state.tut = {
        on: false,
        step: 0
      }; S.save(); draw();
    },
    next: function () {
      var st = S.state.tut; if (!st) {
        return;
      }
      st.step++; if (st.step >= STEPS().length) {
        st.on = false;
      }
      S.save(); S.snd.tick(); draw();
    },
    event: function (name) {
      var st = S.state.tut; if (!st || !st.on) {
        return;
      }
      var steps = STEPS();
      for (var j = st.step; j < steps.length; j++) {
        if (steps[j].on === name) {
          st.step = j; S.tut.next(); return;
        }
      }
    },
    redraw: draw,
    choose: function () {
      S.dialog({
        title: "WHICH TOUR?",
        text: "SIMPLE explains everything in plain words, for players new to this kind of screen. TECHNICAL is shorter and uses terminal terms such as panes, the shell and keyboard shortcuts.",
        buttons: [
          { label: "SIMPLE TOUR", action: function () { setTimeout(function () { S.tut.start("simple"); }, 0); } },
          { label: "TECHNICAL TOUR", action: function () { setTimeout(function () { S.tut.start("technical"); }, 0); } },
          { label: "CANCEL" }
        ]
      });
    },
    offer: function () {
      S.dialog( {
        title: "WELCOME",
        text: "Take the interactive tour? SIMPLE explains everything in plain words. TECHNICAL is shorter and uses terminal terms such as panes, the shell and keyboard shortcuts.",
        buttons: [
          {
            label: "SIMPLE TOUR",
            action: function () {
              setTimeout(function () { S.tut.start("simple"); }, 0);
            }
          },
          {
            label: "TECHNICAL TOUR",
            action: function () {
              setTimeout(function () { S.tut.start("technical"); }, 0);
            }
          },
          {
            label: "NO THANKS"
          }
        ]
      });
    }
  };  /* The tour listens to game events instead of being called from other files */
  S.on("*", function (name) { S.tut.event(name); });

  /* Shortcuts: Alt plus a letter, matched by physical key */
  var KEYS = {
    KeyR: function () {
      S.run("report", false);
    },
    KeyM: function () {
      S.run("mail", false);
    },
    KeyF: function () {
      S.ui.open("FILES");
    },
    KeyV: function () {
      S.ui.open("VIEW");
    },
    KeyS: function () {
      S.ui.open("SHELL");
    },
    KeyW: function () {
      S.run("watch", false);
    },
    KeyH: function () {
      S.run("help", false);
    },
    KeyP: function () {
      S.settingsDialog();
    },
    KeyT: function () {
      S.tut.start();
    },
    KeyA: function () {
      S.about();
    },
    KeyD: function () {
      S.setMode(S.isDesktop() ? "tmux" : "desktop");
    },
    KeyU: function () {
      S.fkey(4);
    },
    KeyL: function () {
      S.unlockDialog(S.ex.section());
    },
    KeyN: function () {
      var k = S.rep.openKeys(); if (k.length) {
        var i = k.indexOf(S.state.active); S.state.active = k[(i + 1) % k.length]; S.run("report", false);
      }
    },
    KeyK: function () {
      S.run("submit", false);
    }
  };
  S.shortcut = function (e) {
    if (!e.altKey || e.ctrlKey || e.metaKey || S.mode !== "shell" || S.dlg) {
      return false;
    }
    var f = KEYS[e.code];
    if (!f) {
      return false;
    }
    e.preventDefault(); S.snd.click(); f();
    return true;
  };
  S.SHORTCUTS = [
    [
      "Alt+R",
      "report"
    ],
    [
      "Alt+N",
      "next report page"
    ],
    [
      "Alt+K",
      "submit page"
    ],
    [
      "Alt+U",
      "use highlighted entry"
    ],
    [
      "Alt+M",
      "mail"
    ],
    [
      "Alt+F",
      "files"
    ],
    [
      "Alt+V",
      "viewer"
    ],
    [
      "Alt+S",
      "shell"
    ],
    [
      "Alt+W",
      "watch"
    ],
    [
      "Alt+L",
      "unlock"
    ],
    [
      "Alt+P",
      "setup"
    ],
    [
      "Alt+T",
      "tutorial"
    ],
    [
      "Alt+A",
      "about"
    ],
    [
      "Alt+D",
      "switch desktop and tmux"
    ],
    [
      "Alt+H",
      "help"
    ],
    [
      "Right-click",
      "context menu"
    ]
  ];
})();
/* Window switcher: hold Alt and press the key above Tab (Alt+Tab belongs to the operating system) */
(function () {
  var S = window.SELK, box = null, list = [], idx = 0;
  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  function items() {
    if (S.isDesktop()) {
      return S.desk.order.map(function (w) {
        return {
          label: S.desk.titleOf(w),
          go: function () {
            S.desk.front(w);
          }
        };
      });
    }
    var T = S.tmux, cur = T.w, out = [];
    T.windows.forEach(function (w, i) {
      out.push( {
        i: i,
        label: i + ": " + w.name,
        go: function () {
          T.select(i);
        }
      });
    });
    return out.slice(cur).concat(out.slice(0, cur));
  }
  function draw() {
    if (box) {
      box.remove();
    }
    box = el("div", "switcher"); box.setAttribute("role", "listbox");
    box.appendChild(el("div", "switcher-head", "WINDOWS"));
    list.forEach(function (it, i) {
      var r = el("div", "switcher-item" + (i === idx ? " on" : ""), it.label);
      r.setAttribute("role", "option"); r.setAttribute("aria-selected", i === idx ? "true" : "false");
      r.addEventListener("click", function () {
        idx = i; commit();
      });
      box.appendChild(r);
    });
    box.appendChild(el("div", "switcher-foot dim", "Release Alt to switch, Esc to cancel"));
    document.getElementById("screen").appendChild(box);
  }
  function commit() {
    var it = list[idx]; close(); if (it) {
      it.go(); S.snd.click();
    }
  }
  function close() {
    if (box) {
      box.remove(); box = null;
    } list = [];
  }
  document.addEventListener("keydown", function (e) {
    if (S.mode !== "shell" || S.dlg) {
      return;
    }
    if (e.altKey && (e.code === "Backquote" || e.key === "Tab")) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!box) {
        list = items(); if (list.length < 1) {
          return;
        } idx = Math.min(1, list.length - 1);
      }
      else {
        idx = (idx + (e.shiftKey ? -1 : 1) + list.length) % list.length;
      }
      draw(); S.snd.tick();
      return;
    }
    if (box && e.key === "Escape") {
      e.preventDefault(); e.stopImmediatePropagation(); close();
    }
  }, true);
  document.addEventListener("keyup", function (e) {
    if (box && e.key === "Alt") {
      commit();
    }
  }, true);
  window.addEventListener("blur", close);
  S.SHORTCUTS.splice(0, 0, [
    "Alt+`",
    "window switcher, hold Alt"
  ]);
})();
