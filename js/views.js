/* VIEW window, MAIL pane, dialogs, the Setup screen, the Storage page, and
   applySettings, which turns settings into classes and sound levels. */
(function () {
  var S = window.SELK;
  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  /* Viewer */
  var vroot = el("div", "viewer"), vhead = el("div", "v-head", "VIEW"), vbody = el("div", "v-body scroll"), vnote = el("div", "v-note");
  vbody.appendChild(el("div", "dim", "Open an entry from FILES, or type open and a name."));
  vnote.hidden = true;
  vroot.appendChild(vhead); vroot.appendChild(vbody); vroot.appendChild(vnote);
  S.registerKind("VIEW", vroot);
  /* The viewer reveals text at the same text speed as the shell. A click in the
     viewer or any key press shows the rest at once. */
  var viewToken = 0, viewSkip = false;
  vbody.addEventListener("click", function () { viewSkip = true; });
  document.addEventListener("keydown", function () { viewSkip = true; }, true);
  S.view = {
    show: function (title, node) {
      vhead.textContent = "VIEW: " + title;
      vbody.textContent = ""; vbody.appendChild(node); vbody.scrollTop = 0;
      vnote.textContent = ""; vnote.hidden = true;
      var token = ++viewToken; viewSkip = false;
      S.scr.reveal(node, function () { return viewSkip || token !== viewToken; });
    },
    note: function (node) {
      vnote.textContent = "";
      var x = el("button", "btn v-close", "CLOSE"); x.type = "button";
      x.addEventListener("click", function () {
        vnote.hidden = true;
      });
      vnote.appendChild(x); vnote.appendChild(node); vnote.hidden = false;
    }
  };
  S.display = function (title, node, isNote) {
    var T = S.tmux;
    var fromShell = T.attached && !S.isDesktop() && S.mode === "shell" && !S.fromClick && T.visible("SHELL");
    if (T.attached && S.isDesktop()) {
      if (!T.visible("VIEW")) {
        T.goto("VIEW");
      } else {
        S.desk.goto("VIEW");
      }
      if (isNote) {
        S.view.note(node);
      } else {
        S.view.show(title, node);
      }
      return;
    }
    if (T.attached) {
      if (!T.visible("VIEW")) {
        T.goto("VIEW");
      }
      if (isNote) {
        S.view.note(node);
      } else {
        S.view.show(title, node);
      }
      if (fromShell && S.state.settings.redirectNotes !== false) {
        S.scr.line("Output redirected to VIEW.", "dim", 0);
      }
      return;
    }
    S.scr.node(function () {
      return node;
    });
  };
  /* Mail pane */
  var mroot = el("div", "mailpane scroll");
  S.registerKind("MAIL", mroot);
  S.mailpane = {
    render: function () {
      mroot.textContent = "";
      mroot.appendChild(el("div", "pane-title", "INBOX, AUDIT DESK 4"));
      var m = S.state.mail;
      if (!m.length) {
        mroot.appendChild(el("div", "dim", S.state.pending.length ? "The uplink is receiving." : "No messages yet.")); return;
      }
      m.forEach(function (x, i) {
        var b = el("button", "mrow" + (x.read ? "" : " unread"));
        b.type = "button"; b.dataset.cmd = "mail " + (i + 1);
        b.textContent = "MSG " + ("00" + (i + 1)).slice(-3) + " " + S.fmtTime(x.t) + (x.read ? "" : " NEW");
        mroot.appendChild(b);
      });
    }
  };
  /* Dialogs */
  S.dlg = null;
  S.closeDialog = function () {
    if (S.dlg) {
      if (S.clearDragState) {
        S.clearDragState();
      }
      S.dlg.remove(); S.dlg = null; S.tmux.focusCur();
    }
  };
  S.dialog = function (o) {
    S.closeDialog();
    var ov = el("div", "dlg-ov"), box = el("div", "dlg" + (o.wide ? " wide" : ""));
    box.setAttribute("role", "dialog");
    box.appendChild(el("div", "dlg-title", o.title));
    var body = el("div", "dlg-body");
    if (o.text) {
      body.appendChild(el("div", "", o.text));
    }
    var inputs = (o.inputs || []).map(function (ph) {
      var i = el("input", "dlg-in"); i.type = "text"; i.placeholder = ph; i.autocomplete = "off"; i.spellcheck = false;
      body.appendChild(i); return i;
    });
    if (o.build) {
      o.build(body);
    }
    box.appendChild(body);
    var row = el("div", "dlg-btns");
    (o.buttons || [
      {
        label: "CLOSE"
      }
    ]).forEach(function (b, i) {
      var x = el("button", "btn" + (i === 0 ? " primary" : ""), b.label); x.type = "button";
      x.addEventListener("click", function () {
        var vals = inputs.map(function (n) {
          return n.value.trim();
        });
        if (b.action && b.action(vals) === false) {
          return;
        }
        S.closeDialog();
      });
      row.appendChild(x);
    });
    box.appendChild(row);
    ov.appendChild(box);
    ov.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape") {
        S.closeDialog();
      }
      if (e.key === "Enter" && e.target.tagName === "INPUT") {
        row.firstChild.click();
      }
    });
    document.getElementById("screen").appendChild(ov);
    S.dlg = ov;
    (inputs[0] || row.firstChild).focus();
    return body;
  };
  S.unlockDialog = function (sec) {
    var locked = S.SECTIONS.filter(function (s) {
      return s.locked && !S.isUnlocked(s.id);
    });
    if (!sec || S.isUnlocked(sec)) {
      sec = locked[0] && locked[0].id;
    }
    if (!sec) {
      S.msg("All sections are open"); return;
    }
    var s = S.sectionById(sec), parts = S.LOCKS[sec].parts.length;
    S.dialog( {
      title: "UNLOCK " + s.name.toUpperCase(),
      text: (parts > 1 ? "This section needs two parts: a word and a number. " : "Enter the password for this section. ") + S.LOCKS[sec].nudge,
      inputs: parts > 1 ? [
        "word",
        "number"
      ] : [
        "password"
      ],
      buttons: [
        {
          label: "UNLOCK",
          action: function (v) {
            S.run("unlock " + sec + " " + v.join(" ")); return S.isUnlocked(sec) ? true : false;
          }
        },
        {
          label: "CANCEL"
        }
      ]
    });
  };
  S.exitDialog = function () {
    S.dialog( {
      title: "END SESSION",
      text: "Log out of the terminal? Progress stays saved.",
      buttons: [
        {
          label: "LOG OUT",
          action: function () {
            S.logout();
          }
        },
        {
          label: "CANCEL"
        }
      ]
    });
  };
  /* Settings */
  var ROWS = [
    ["Screen reader mode", "sr"],
    ["Motion", "motion", [["system", "SYSTEM"], ["always", "FULL"], ["reduce", "REDUCED"]]],
    [
      "Mode",
      "mode",
      [
        [
          "tmux",
          "TMUX"
        ],
        [
          "desktop",
          "DESKTOP"
        ]
      ]
    ],
    [
      "Frame",
      "frame",
      [
        [
          "full",
          "FULL SCREEN"
        ],
        [
          "monitor",
          "MONITOR"
        ]
      ]
    ],
    [
      "Layout",
      "layout",
      [
        [
          "four",
          "FOUR PANES"
        ],
        [
          "three",
          "THREE PANES"
        ],
        [
          "single",
          "SINGLE"
        ]
      ],
      "tmux"
    ],
    [
      "Open items with",
      "click",
      [
        [
          "single",
          "ONE CLICK"
        ],
        [
          "double",
          "TWO CLICKS"
        ]
      ]
    ],
    [
      "Text appears",
      "speed",
      [["instant", "AT ONCE"], ["vfast", "VERY FAST"], ["fast", "FAST"], ["typed", "NORMAL"], ["slow", "SLOW"]]
    ],
    [
      "Text size",
      "size",
      [
        [
          "s",
          "S"
        ],
        [
          "m",
          "M"
        ],
        [
          "l",
          "L"
        ]
      ]
    ],
    [
      "Cursor size",
      "cursor",
      [
        [
          "s",
          "S"
        ],
        [
          "m",
          "M"
        ],
        [
          "l",
          "L"
        ],
        [
          "sys",
          "SYSTEM"
        ]
      ]
    ],
    [
      "Scanlines",
      "scan"
    ],
    [
      "Flicker",
      "flicker"
    ],
    [
      "Glow",
      "glow"
    ],
    [
      "Interference",
      "interfere"
    ],
    [
      "Power-on",
      "poweron"
    ],
    null,
    [
      "Sound",
      "_sound"
    ],
    [
      "Master",
      "vol",
      "range"
    ],
    [
      "Machine",
      "vMachine",
      "range"
    ],
    [
      "Wind",
      "vWind",
      "range"
    ],
    [
      "Interface",
      "vUi",
      "range"
    ],
    [
      "Structure",
      "vStruct",
      "range"
    ],
    null,
    [
      "Hints page",
      "_hintsOn"
    ],
    [
      "Hint light",
      "_light"
    ],
    ["Redirect notices", "redirectNotes"],
    
    { group: "DEVELOPER OPTIONS" },
    
    ["Debug log", "debug"],
    
    [
      "Wipe data on refresh",
      "_wipe"
    ]
  ];
  function wipeOn() {
    try {
      return localStorage.getItem(S.WIPE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }
  function getv(k) {
    var st = S.state; if (k === "_wipe") {
      return wipeOn();
    } return k === "_sound" ? st.sound : k === "_hintsOn" ? st.hintsOn : k === "_light" ? st.light : st.settings[k];
  }
  function setv(k, v) {
    var st = S.state;
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
      var old = st.settings[k]; st.settings[k] = v; if (k === "layout" && old !== v && S.tmux.attached) {
        S.tmux.init();
      }
    }
    S.save(); S.applySettings(); S.status();
    if (k === "interfere" && S.previewInterference) {
      S.previewInterference(!!v);
    }
  }
  function opt(label, on, fn) {
    var b = el("button", "opt" + (on ? " on" : ""), label); b.type = "button"; b.addEventListener("click", fn); return b;
  }
  /* Help for each Setup row, shown as a tooltip on hover or keyboard focus and
     linked to the controls with aria-describedby so screen readers read it too.
     OPTION_HELP adds a line about the specific option under the pointer. */
  var HELP = {
    sr: "Makes the game work well with a screen reader: text appears at once and moving screen effects are switched off.",
    motion: "How much the screen moves. SYSTEM follows your computer's reduced-motion setting.",
    mode: "TMUX shows the game as terminal panes. DESKTOP shows it as icons and windows, like an old home computer.",
    frame: "FULL SCREEN uses the whole browser window. MONITOR draws the game inside an old monitor with POWER and HDD lights.",
    layout: "How the terminal panes are arranged on the main DESK window.",
    click: "Whether one click or two clicks opens a record, drawer or icon.",
    speed: "How new text appears in the shell and the reading area. A click or key press shows the rest at once. When Motion is reduced (or SYSTEM and your computer asks for less motion), text always appears at once.",
    size: "Size of all text in the game.",
    cursor: "Size of the mouse pointer. SYSTEM uses your computer's own pointer.",
    scan: "Thin horizontal lines, like an old tube screen.",
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
    _hintsOn: "Shows the HINTS page, with clues you reveal one at a time.",
    _light: "A HINT lamp lights up when the open record answers a gap in the report.",
    _wipe: "Erases all progress each time the page reloads. Useful for testing, not for playing.",
    redirectNotes: "When a shell command shows its result in VIEW, the shell prints a short note saying so.",
    debug: "Prints everything the game does (commands, events, windows, messages, saves) to the browser's JavaScript console, and shows a DEBUG panel with buttons that trigger game actions for testing."
  };
  var OPTION_HELP = {
    speed: {
      instant: "Each line appears whole, immediately.",
      vfast: "Typed out at about 450 letters a second.",
      fast: "Typed out at about 260 letters a second.",
      typed: "Typed out at about 110 letters a second, like an old terminal.",
      slow: "Typed out at about 55 letters a second, easy to follow."
    },
    motion: {
      system: "Follows your computer's setting.",
      always: "Always animate, even if your computer asks for less motion.",
      reduce: "Keep movement to a minimum, even if your computer allows it."
    }
  };
  var tip = null, tipSeq = 0;
  function showTip(row, key, optKey, ev) {
    var box = row.closest(".dlg");
    if (!box || !HELP[key]) { return; }
    if (!tip) { tip = el("div", "set-tip"); tip.setAttribute("aria-hidden", "true"); }
    if (tip.parentNode !== box) { box.appendChild(tip); }
    var extra = optKey && OPTION_HELP[key] && OPTION_HELP[key][optKey];
    tip.textContent = HELP[key] + (extra ? " " + extra : "");
    tip.hidden = false;
    var bb = box.getBoundingClientRect(), th = tip.offsetHeight, tw = tip.offsetWidth;
    /* Above the pointer when the mouse is used; above the row for keyboard focus. */
    var x = ev && ev.clientX != null ? ev.clientX - bb.left - 12 : row.getBoundingClientRect().left - bb.left;
    var y = ev && ev.clientY != null ? ev.clientY - bb.top - th - 14 : row.getBoundingClientRect().top - bb.top - th - 4;
    tip.style.left = Math.max(8, Math.min(bb.width - tw - 8, x)) + "px";
    tip.style.top = Math.max(4, y) + "px";
  }
  function hideTip() { if (tip) { tip.hidden = true; } }
  function attachHelp(row, key) {
    if (!HELP[key]) { return; }
    var d = el("span", "sr-only", HELP[key]); d.id = "set-help-" + (++tipSeq);
    row.appendChild(d);
    row.querySelectorAll("button, input").forEach(function (c) {
      c.setAttribute("aria-describedby", d.id);
      var ok = c.dataset.value;
      c.addEventListener("mousemove", function (e) { showTip(row, key, ok, e); });
      c.addEventListener("focus", function () { showTip(row, key, ok); });
      c.addEventListener("blur", hideTip);
    });
    row.addEventListener("mousemove", function (e) { if (!e.target.closest("button, input")) { showTip(row, key, null, e); } });
    row.addEventListener("mouseleave", hideTip);
  }

  function fill(body) {
    body.textContent = "";
    ROWS.forEach(function (r) {
      if (!r) {
        body.appendChild(el("div", "dlg-rule")); return;
      }
      /* Group heading: options meant for developers are kept apart at the end. */
      if (r.group) {
        body.appendChild(el("div", "dlg-rule"));
        var g = el("div", "set-group", r.group); g.setAttribute("role", "heading"); g.setAttribute("aria-level", "3");
        body.appendChild(g); return;
      }
      if (!S.settingVisible(r[1])) {
        return;
      }
      var row = el("div", "set-row");
      row.appendChild(el("span", "set-label", r[0]));
      var ctl = el("span", "set-ctl"), k = r[1], v = getv(k);
      if (r[2] === "range") {
        var rg = el("input", "set-range"); rg.type = "range"; rg.min = 0; rg.max = 100; rg.step = 5; rg.value = v;
        rg.setAttribute("aria-label", r[0] + " volume");
        var lab = el("span", "set-val", v + " %");
        rg.addEventListener("input", function () {
          S.state.settings[k] = +rg.value; lab.textContent = rg.value + " %"; S.snd.apply();
        });
        rg.addEventListener("change", function () {
          S.save(); S.snd.tick();
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
        ctl.appendChild(opt("ON", !!v, function () {
          setv(k, true); fill(body);
        }));
        ctl.appendChild(opt("OFF", !v, function () {
          setv(k, false); fill(body);
        }));
      }
      row.appendChild(ctl); body.appendChild(row);
      attachHelp(row, k);
    });
    hideTip();
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
  function listKeys(store) {
    var out = [];
    try {
      for (var i = 0; i < store.length; i++) {
        var k = store.key(i); if (k.indexOf("selk") === 0) {
          out.push(k);
        }
      }
    } catch (e) {}
    return out.sort();
  }
  S.storagePage = function () {
    var box = el("div", "storage");
    box.appendChild(el("p", "dim", "Data this game keeps in your browser. Nothing leaves this computer."));
    var row = el("div", "set-row");
    row.appendChild(el("span", "set-label", "Wipe data on refresh"));
    var ctl = el("span", "set-ctl"), on = wipeOn();
    ctl.appendChild(opt("ON", on, function () {
      setv("_wipe", true); S.storagePage();
    }));
    ctl.appendChild(opt("OFF", !on, function () {
      setv("_wipe", false); S.storagePage();
    }));
    row.appendChild(ctl); box.appendChild(row);
    box.appendChild(el("div", "dim", "When on, every reload starts a new game. Useful for testing."));
    [
      [
        "localStorage",
        window.localStorage
      ],
      [
        "sessionStorage",
        window.sessionStorage
      ]
    ].forEach(function (pair) {
      box.appendChild(el("div", "head-s st-sub", pair[0]));
      var keys = listKeys(pair[1]);
      if (!keys.length) {
        box.appendChild(el("div", "dim", "No keys."));
      }
      keys.forEach(function (k) {
        var val = pair[1].getItem(k) || "";
        var r = el("div", "set-row");
        r.appendChild(el("span", "", k + " " + (val.length > 1024 ? (val.length / 1024).toFixed(1) + " KB" : val.length + " B")));
        var c = el("span", "set-ctl");
        var pre = el("div", "st-json"); pre.hidden = true;
        c.appendChild(opt("VIEW", false, function () {
          if (pre.hidden) {
            pre.textContent = ""; try {
              pre.appendChild(S.renderJSON(JSON.parse(val)));
            } catch (e) {
              pre.appendChild(el("p", "", val));
            }
          }
          pre.hidden = !pre.hidden;
        }));
        c.appendChild(opt("DELETE", false, function () {
          S.dialog( {
            title: "DELETE " + k.toUpperCase(),
            text: k === S.KEY ? "This erases the saved game and restarts." : "Delete this key?",
            buttons: [
              {
                label: "CANCEL",
                action: function () { setTimeout(S.storagePage, 0); }
              },
              {
                label: "DELETE",
                action: function () {
                  pair[1].removeItem(k);
                  if (k === S.KEY) {
                    S.state.name = ""; location.reload();
                  } else {
                    S.storagePage();
                  }
                }
              }
            ]
          });
        }));
        r.appendChild(c); box.appendChild(r); box.appendChild(pre);
      });
    });
    var all = el("button", "btn", "DELETE ALL GAME DATA"); all.type = "button";
    all.addEventListener("click", function () {
      S.dialog( {
        title: "DELETE ALL",
        text: "Erase every Selk key in both stores and restart?",
        buttons: [
          {
            label: "CANCEL",
            action: function () { setTimeout(S.storagePage, 0); }
          },
          {
            label: "ERASE",
            action: function () {
              listKeys(localStorage).forEach(function (k) {
                localStorage.removeItem(k);
              });
              listKeys(sessionStorage).forEach(function (k) {
                sessionStorage.removeItem(k);
              });
              location.reload();
            }
          }
        ]
      });
    });
    box.appendChild(el("div", "rule")); box.appendChild(all);
    S.save();
    /* Shown as a dialog, like Setup. Confirmations replace it for a moment, and
       CANCEL brings the storage dialog back. */
    S.dialog({ title: "STORAGE", wide: true, build: function (b) { b.appendChild(box); }, buttons: [{ label: "CLOSE" }] });
  };
  var interferenceTimer = null;
  S.previewInterference = function (enabled) {
    var screen = document.getElementById("screen");
    if (!screen) {
      return;
    }
    clearTimeout(interferenceTimer);
    if (enabled === false || !S.state.settings.interfere) {
      screen.classList.remove("interfere");
      return;
    }
    screen.classList.remove("interfere");
    void screen.offsetWidth;
    screen.classList.add("interfere");
    interferenceTimer = setTimeout(function () {
      screen.classList.remove("interfere");
    }, 550);
  };
  S.applySettings = function () {
    var s = S.state.settings, b = document.body, scr = document.getElementById("screen");
    b.classList.toggle("frameless", s.frame === "full");
    b.classList.toggle("no-scan", !s.scan);
    b.classList.toggle("no-flicker", !s.flicker);
    b.classList.toggle("no-glow", !s.glow);
    b.classList.toggle("no-poweron", !s.poweron);
    b.classList.remove("dragging", "moving", "resizing", "scroll-panning");
    document.documentElement.classList.remove("dragging", "scroll-panning");
    b.classList.remove("cur-s", "cur-m", "cur-l", "cur-sys");
    b.classList.add("cur-" + (s.cursor || "m"));
    scr.classList.remove("size-s", "size-m", "size-l");
    scr.classList.add("size-" + s.size);
    S.snd.apply();
  };
})();
