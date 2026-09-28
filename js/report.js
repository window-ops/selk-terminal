/* Report pages: the paper form, blanks, drag and drop onto blanks, submitting,
   and the transmission countdown to Earth. */
(function () {
  var S = window.SELK;
  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  var root = el("div", "reportpane scroll");
  S.registerKind("REPORT", root);
  function rs(key) {
    var st = S.state;
    if (!st.reports[key]) {
      st.reports[key] = {
        fill: [
          null,
          null,
          null,
          null
        ],
        done: false
      };
    }
    return st.reports[key];
  }
  function openKeys() {
    return Object.keys(S.state.reports);
  }
  function say(t, c) {
    S.feedback(t, c);
  }
  /* Drag and drop: any element with an entry id can be dropped on a blank */
  var ghost = null, dragStateTimer = null;
  function clearDragState() {
    if (dragStateTimer) {
      clearTimeout(dragStateTimer); dragStateTimer = null;
    }
    document.body.classList.remove("dragging");
    document.documentElement.classList.remove("dragging");
    document.querySelectorAll(".blank.drop").forEach(function (b) {
      b.classList.remove("drop");
    });
  }
  S.clearDragState = clearDragState;
  S.dragStart = function (e, id) {
    clearDragState();
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "copyMove";
    if (!ghost) {
      ghost = el("div", "drag-ghost"); document.body.appendChild(ghost);
    }
    ghost.textContent = S.entryTitle(id);
    try {
      e.dataTransfer.setDragImage(ghost, 12, 12);
    } catch (x) {}
    document.body.classList.add("dragging");
    document.documentElement.classList.add("dragging");
    clearTimeout(dragStateTimer);
    dragStateTimer = setTimeout(clearDragState, 120000);
    if (e.target && e.target.addEventListener) {
      e.target.addEventListener("dragend", clearDragState, {
        once: true
      });
    }
  };
  document.addEventListener("dragover", function (e) {
    if (!document.body.classList.contains("dragging")) {
      return;
    }
    e.preventDefault();
    var ok = e.target.closest && e.target.closest(".blank:not(:disabled), input");
    e.dataTransfer.dropEffect = ok ? "copy" : "move";
  });
  document.addEventListener("drop", function (e) {
    if (!document.body.classList.contains("dragging")) {
      return;
    }
    if (!(e.target.closest && e.target.closest(".blank, input"))) {
      e.preventDefault();
    }
    clearDragState();
  });
  document.addEventListener("dragend", clearDragState, true);
  window.addEventListener("dragend", clearDragState, true);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      clearDragState();
    }
  }, true);
  window.addEventListener("blur", clearDragState);
  window.addEventListener("pagehide", clearDragState);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearDragState();
    }
  });
  document.addEventListener("dragstart", function (e) {
    var b = e.target.closest && e.target.closest("[data-cmd^='open ']");
    if (b) {
      S.dragStart(e, b.dataset.cmd.slice(5));
    }
  });
  function blank(key, i) {
    var r = rs(key), v = r.fill[i], sel = S.state.sel;
    var b = el("button", "blank" + (v ? " filled" : "") + (sel && sel.r === key && sel.n === i + 1 ? " sel" : ""));
    b.type = "button";
    b.textContent = v ? S.entryTitle(v) : "\u00a0";
    b.disabled = r.done;
    b.title = r.done ? "" : "Drop an entry here, or click and then press USE";
    b.dataset.n = String(i + 1);
    b.addEventListener("click", function () {
      S.rep.select(i + 1, key);
    });
    b.addEventListener("dragover", function (e) {
      if (!r.done) {
        e.preventDefault(); b.classList.add("drop");
      }
    });
    b.addEventListener("dragleave", function () {
      b.classList.remove("drop");
    });
    b.addEventListener("drop", function (e) {
      e.preventDefault(); b.classList.remove("drop");
      var id = e.dataTransfer.getData("text/plain");
      if (id) {
        S.rep.fillBlank(key, i + 1, id);
      }
    });
    if (v && !r.done) {
      var x = el("button", "unfill", "x"); x.type = "button"; x.title = "Clear this blank";
      x.addEventListener("click", function (e) {
        e.stopPropagation(); S.rep.unfill(i + 1, key);
      });
      var wrap = el("span", "bwrap"); wrap.appendChild(b); wrap.appendChild(x); return wrap;
    }
    return b;
  }
  function page(key) {
    var def = S.REPORTS[key], r = rs(key);
    var paper = el("div", "paper");
    paper.appendChild(el("div", "paper-title", def.title));
    paper.appendChild(el("div", "paper-from", "From supervisor " + S.state.name + ", Selk site. " + def.brief));
    def.lines.forEach(function (ln, i) {
      var row = el("div", "paper-line");
      row.appendChild(el("span", "paper-n", (i + 1) + " "));
      row.appendChild(document.createTextNode(ln[0]));
      row.appendChild(blank(key, i));
      row.appendChild(document.createTextNode(ln[2]));
      paper.appendChild(row);
    });
    if (!r.done && S.state.sel && S.state.sel.r === key) {
      paper.appendChild(el("div", "paper-nudge", "FIELD NOTE: " + def.nudges[S.state.sel.n - 1]));
    }
    var foot = el("div", "paper-foot");
    if (r.done) {
      foot.appendChild(el("span", "stamp", "ACCEPTED BY AUDIT DESK 4"));
    }
    else {
      var n = r.fill.filter(Boolean).length;
      var sub = el("button", "paper-btn", "SUBMIT PAGE"); sub.type = "button";
      sub.disabled = n < 4;
      sub.addEventListener("click", function () {
        S.run("submit " + def.code);
      });
      foot.appendChild(sub);
      foot.appendChild(el("span", "paper-count", n + " of 4 filled"));
    }
    paper.appendChild(foot);
    return paper;
  }
  S.rep = {
    openKeys: openKeys,
    render: function () {
      root.textContent = "";
      var keys = openKeys();
      if (!keys.length) {
        root.appendChild(el("div", "pane-title", "REPORT"));
        root.appendChild(el("div", "dim", "No pages yet. The audit office will send the first request by mail."));
        return;
      }
      if (!S.state.active || keys.indexOf(S.state.active) === -1) {
        S.state.active = keys.filter(function (k) {
          return !rs(k).done;
        })[0] || keys[0];
      }
      var tabs = el("div", "tabs");
      keys.forEach(function (k) {
        var t = el("button", "tab" + (k === S.state.active ? " act" : "") + (rs(k).done ? " done" : ""), "REPORT " + S.REPORTS[k].code);
        t.type = "button";
        t.addEventListener("click", function () {
          S.state.active = k; S.save(); S.rep.render();
        });
        tabs.appendChild(t);
      });
      if (S.state.decision) {
        var d = el("button", "tab decide", "DECIDE"); d.type = "button";
        d.addEventListener("click", function () {
          S.run("decide");
        });
        tabs.appendChild(d);
      }
      root.appendChild(tabs);
      root.appendChild(page(S.state.active));
      if (!rs(S.state.active).done) {
        if (S.tmux.mobile()) {
          var selected = S.state.sel && S.state.sel.r === S.state.active;
          var flow = el("div", "paper-mobile-flow");
          flow.appendChild(el("div", "paper-help", selected ? "Next, choose the record that answers blank " + S.state.sel.n + "." : "To answer a line, tap its empty field, then choose a matching record from FILES."));
          if (selected) {
            flow.appendChild(el("div", "paper-nudge", "FIELD NOTE: " + S.REPORTS[S.state.active].nudges[S.state.sel.n - 1]));
          }
          var files = el("button", "paper-btn paper-files", "CHOOSE FROM FILES");
          files.type = "button";
          files.addEventListener("click", function () {
            S.ui.open("FILES");
          });
          flow.appendChild(files);
          root.appendChild(flow);
        } else {
          root.appendChild(el("div", "dim paper-help", "Drag an entry name from FILES or VIEW onto a blank, or select a blank and choose USE FOR BLANK in the entry view."));
        }
      }
    },
    list: function () {
      var keys = openKeys();
      if (!keys.length) {
        S.scr.line("No report pages yet. Wait for audit office mail.", "dim"); return;
      }
      keys.forEach(function (k) {
        S.scr.rich("REPORT " + S.REPORTS[k].code + " " + (rs(k).done ? "accepted" : rs(k).fill.filter(Boolean).length + " of 4 filled"), rs(k).done ? "ok" : "");
      });
    },
    show: function (code) {
      var key = S.report(code);
      if (!key || !S.state.reports[key]) {
        S.snd.error(); say("No such report page is open.", "err"); return;
      }
      S.state.active = key; S.save();
      if (S.tmux.attached && S.ui.open("REPORT")) {
        S.rep.render(); S.emit("report-open"); return;
      }
      S.scr.node(function () {
        return page(key);
      });
    },
    select: function (n, code) {
      var key = code ? S.report(code) || code : S.state.active;
      if (!key || !S.state.reports[key]) {
        S.snd.error(); say("Open a report first.", "err"); return;
      }
      n = parseInt(n, 10);
      if (!(n >= 1 && n <= 4) || rs(key).done) {
        return;
      }
      S.state.active = key;
      var sel = S.state.sel;
      S.state.sel = (sel && sel.r === key && sel.n === n) ? null : {
        r: key,
        n: n
      };
      S.save(); S.snd.tick();
      S.rep.render();
      if (S.ex) {
        S.ex.render();
      }
      if (S.state.sel) {
        S.msg("Blank " + n + " selected. Open an entry and press USE, or F4 in FILES.");
      }
    },
    fillBlank: function (key, n, id) {
      var e = S.entryById(id || "");
      if (!key || !S.state.reports[key]) {
        S.snd.error(); say("Open a report first.", "err"); return;
      }
      if (!e) {
        S.snd.error(); say("No entry called " + id + ".", "err"); return;
      }
      if (!S.isUnlocked(e.id.split("/")[0])) {
        S.snd.error(); say("That entry is in a locked section.", "err"); return;
      }
      var r = rs(key);
      if (r.done) {
        return;
      }
      r.fill[n - 1] = e.id;
      S.state.active = key; S.state.sel = null;
      S.emit("fill");
      S.save(); S.snd.ok();
      S.scr.line("Report " + S.REPORTS[key].code + ", blank " + n + ": " + S.entryTitle(e.id), "ok");
      S.rep.render();
      if (S.ex) {
        S.ex.render();
      }
      if (!S.ui.isOpen("REPORT") && S.tmux.attached) {
        S.msg("Blank " + n + " filled: " + S.entryTitle(e.id), "ok");
      }
    },
    fill: function (n, id) {
      S.rep.fillBlank(S.state.active, parseInt(n, 10), id);
    },
    unfill: function (n, code) {
      var key = code || S.state.active; n = parseInt(n, 10);
      if (key && S.state.reports[key] && n >= 1 && n <= 4 && !rs(key).done) {
        rs(key).fill[n - 1] = null; S.save(); S.snd.tick(); S.rep.render();
      }
    },
    isAnswer: function (id) {
      return openKeys().some(function (k) {
        var r = rs(k);
        return !r.done && S.REPORTS[k].lines.some(function (ln, i) {
          return !r.fill[i] && ln[1].indexOf(id) !== -1;
        });
      });
    },
    submit: function (code) {
      var key = code ? S.report(code) : S.state.active;
      if (!key || !S.state.reports[key]) {
        S.snd.error(); say("Open a report first.", "err"); return;
      }
      var r = rs(key), def = S.REPORTS[key];
      if (r.done) {
        return;
      }
      if (r.fill.some(function (v) {
        return !v;
      })) {
        S.snd.error(); say("Fill all 4 blanks before submitting.", "err"); return;
      }
      var right = def.lines.filter(function (ln, i) {
        return ln[1].indexOf(r.fill[i]) !== -1;
      }).length;
      if (right < 4) {
        S.snd.error(); say("Page not accepted. " + right + " of 4 answers match office records.", "err"); return;
      }
      S.transmit("REPORT " + def.code).then(function () {
        r.done = true; S.state.sel = null; S.save();
        S.emit("submit");
        S.rep.render();
        S.queueMail(def.reply, 4000);
      });
    }
  };
  S.transmit = function (label) {
    S.transmitting = true;
    S.status(); S.snd.sweep(); S.snd.hdd(4);
    S.scr.line("Transmitting " + label + " to CESEA audit office via relay R-09", "warn");
    var counter;
    S.scr.node(function () {
      counter = el("div", "ln count", "Signal delay 79 min"); return counter;
    });
    return S.scr.task(function () {
      return new Promise(function (resolve) {
        var left = 79, total = S.fast ? 300 : 3600, step = total / 79;
        (function go() {
          left--;
          var t = left > 0 ? "Signal delay " + left + " min" : "Delivered to Earth";
          counter.textContent = t;
          if (!S.ui.isOpen("SHELL")) {
            S.msg(label + ": " + t, "warn");
          }
          if (left % 3 === 0) {
            S.snd.blip();
          }
          if (left > 0) {
            setTimeout(go, step);
          } else {
            resolve();
          }
        })();
      });
    }).then(function () {
      S.tick(79); S.transmitting = false; S.snd.ok(); S.status(); S.save();
    });
  };
})();
