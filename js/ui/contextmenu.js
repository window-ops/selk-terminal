/* Context menu for entries, text, fields and inputs, and S.copyText(). */
(function () {
  var S = window.SELK, el = S.el, $ = S.$;
  /* Context menu */
  var menu = null, menuOpener = null;
  function closeMenu(restoreFocus) {
    if (menu) {
      menu.remove(); menu = null;
    }
    var opener = menuOpener; menuOpener = null;
    if (restoreFocus && opener && opener.isConnected && opener.focus) { opener.focus({ preventScroll: true }); }
  }
  S.closeMenu = closeMenu;
  function showMenu(x, y, items) {
    closeMenu();
    menu = el("div", "ctx");
    menuOpener = document.activeElement;
    menu._opener = menuOpener;
    menu.setAttribute("role", "menu");
    items.forEach(function (it) {
      if (!it) {
        menu.appendChild(el("div", "ctx-sep")); return;
      }
      var b = el("button", "ctx-item"); b.type = "button"; b.dataset.sound = "menu"; b.setAttribute("role", "menuitem");
      b.appendChild(el("span", "", S.t(it[0])));
      if (it[2]) {
        b.appendChild(el("span", "ctx-key", S.t(it[2])));
      }
      b.disabled = !it[1];
      b.addEventListener("click", function () {
        closeMenu(true); if (it[1]) {
          it[1]();
        }
      });
      menu.appendChild(b);
    });
    var scr = $("screen"), r = scr.getBoundingClientRect();
    scr.appendChild(menu);
    var mx = Math.min(x - r.left, r.width - menu.offsetWidth - 4), my = Math.min(y - r.top, r.height - menu.offsetHeight - 4);
    menu.style.left = Math.max(2, mx) + "px"; menu.style.top = Math.max(2, my) + "px";
    /* The focus stays where it is while the user has a text selection, since
       focusing a menu item would clear it. Without a selection, the keyboard
       focus goes to the first item. */
    var sel = window.getSelection && window.getSelection();
    if (!(sel && !sel.isCollapsed)) {
      var first = menu.querySelector(".ctx-item:not(:disabled)");
      if (first) {
        first.focus();
      }
    }
  }
  function entryItems(id) {
    var items = [
      [
        "OPEN",
        function () {
          S.runClick("open " + id, false);
        },
        "ENTER"
      ]
    ];
    var key = S.state.active, r = key && S.state.reports[key];
    /* Only entries with a drag handle can fill blanks (not Home, System,
       History, Design) */
    if (r && !r.done && S.entryDraggable(id)) {
      items.push(null);
      S.REPORTS[key].lines.forEach(function (ln, i) {
        var cur = r.fill[i] ? S.entryTitle(r.fill[i]) : S.t("empty");
        items.push( [
          S.t("PUT IN REPORT {code} BLANK {n} ({current})", { code: S.REPORTS[key].code, n: i + 1, current: cur }),
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
          S.runClick("report", false);
        },
        "ALT+R"
      ],
      [
        "MAIL",
        function () {
          S.runClick("mail", false);
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
          S.tut.refresher();
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
      S.msg(S.t("Copied {text}", { text: text.length > 40 ? text.slice(0, 40) + "..." : text })); S.snd.tick();
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
        n.classList.contains("note") ? S.t("COPY WHOLE NOTE") : S.t("COPY WHOLE ENTRY"),
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
          S.runClick("clear", false);
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
            S.msg(S.ctx().keys ? "Paste was blocked. Use Ctrl+V." : "Paste was blocked.", "err");
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
          S.t("SELECT BLANK {n}", { n: n }),
          function () {
            hit.click();
          }
        ],
        [
          S.t("CLEAR BLANK {n}", { n: n }),
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
      ];
      if (!T.mobile()) {
        items.push([
          "SWITCH TO DESKTOP",
          function () {
            S.setMode("desktop");
          },
          "ALT+D"
        ]);
      }
      /* The pane's header buttons are repeated here for a pane drawn without
         its header (Setup > Sole pane frames OFF): CLOSE for REPORT and
         WATCH, POP OUT or POP IN for SHELL, and HIDE INBOX or SHOW INBOX
         where the inbox can be hidden */
      if ((paneKind === "MAIL" || paneKind === "MESSAGE") && T.canToggleInbox()) {
        items.push([S.state.settings.mailList === "single" ? "SHOW INBOX" : "HIDE INBOX", function () { T.toggleInbox(); }]);
      }
      if (T.isClosable && T.isClosable(paneKind)) {
        items.push([S.t("CLOSE {pane}", { pane: S.t(paneKind) }), function () { S.ui.close(paneKind); }]);
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
      closeMenu(true);
    }
  }, true);
  /* Long press: a touch or pen kept still for LONG_MS inside #screen opens
     the context menu, since iPhone and iPad Safari send no contextmenu event
     for a long press.
     - Moving more than SLOP px, lifting, or a pointercancel (scrolling, a
       drag) cancels the press.
     - Browsers that send their own contextmenu for a long press (Android
       Chrome) open the menu through the listener above; that event cancels
       the timer here, so the menu opens once.
     - The press sends a synthetic contextmenu event to the pressed element,
       so the listener above builds the menu from the same target.
     - The click that follows the lift is cancelled, since the menu opens
       under the finger. */
  var LONG_MS = 500, SLOP = 10, press = null, firedAt = 0;
  function endPress() {
    if (press) { clearTimeout(press.timer); press = null; }
  }
  document.addEventListener("pointerdown", function (e) {
    endPress();
    if (e.pointerType === "mouse" || !e.isPrimary || !e.target.closest("#screen")) { return; }
    var target = e.target, x = e.clientX, y = e.clientY;
    press = { x: x, y: y, fired: false, timer: setTimeout(function () {
      if (!press) { return; }
      press.fired = true; firedAt = Date.now();
      target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
    }, LONG_MS) };
  }, true);
  document.addEventListener("pointermove", function (e) {
    if (press && !press.fired && Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y) > SLOP) { endPress(); }
  }, true);
  document.addEventListener("pointercancel", endPress, true);
  document.addEventListener("pointerup", function () {
    if (press && press.fired) {
      var swallow = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
      document.addEventListener("click", swallow, { capture: true, once: true });
      /* Some browsers send no click; the guard then expires */
      setTimeout(function () { document.removeEventListener("click", swallow, true); }, 400);
    }
    endPress();
  }, true);
  /* A contextmenu event from the browser: before the long press fired, it
     ends the press and opens the menu through the listener above. Within a
     second after the long press fired, it reports the same gesture again and
     is ignored. */
  document.addEventListener("contextmenu", function (e) {
    if (!e.isTrusted) { return; }
    if (press && !press.fired) { endPress(); return; }
    if (Date.now() - firedAt < 1000) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
})();
