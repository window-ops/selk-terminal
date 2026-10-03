/* Shell output for entries and sections: printEntry, tables and listings. */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err;
  /* The USE button under the entry opened last. It follows the selected
     blank: selecting a blank adds the button to the open entry, and filling
     the blank or clearing the selection removes it. Entries opened earlier
     lose their button, since only the last one is on screen. */
  var useSlot = null;
  S.refreshUse = function () {
    document.querySelectorAll(".use-slot").forEach(function (s) {
      if (s !== useSlot) { s.textContent = ""; }
    });
    if (!useSlot) { return; }
    useSlot.textContent = "";
    var sel = S.state.sel, id = useSlot.dataset.entry;
    if (!sel || !S.state.reports[sel.r] || !S.reportReady(sel.r) || S.state.reports[sel.r].done) { return; }
    var u = scr().el("button", "use", S.t("USE FOR BLANK {n} OF REPORT {code}", { n: sel.n, code: S.REPORTS[sel.r].code }));
    u.type = "button";
    u.addEventListener("click", function () {
      var now = S.state.sel;
      if (now) { S.rep.fillBlank(now.r, now.n, id); }
    });
    useSlot.appendChild(u);
  };
  /* Show entry e through S.display (shell or VIEW), mark it read, light the
     hint lamp when it answers an open blank, and move the prompt to its
     section */
  function printEntry(e) {
    var sec = e.id.split("/")[0];
    S.hintLit = S.state.light && S.rep.isAnswer(e.id);
    if (S.state.read.indexOf(e.id) === -1) {
      S.state.read.push(e.id); S.save();
    }
    S.status();
    S.snd.hdd(4);
    S.display(S.entryTitle(e.id), function () {
      var box = scr().el("div", "entry");
      var head = scr().el("div", "entry-title", e.path || S.entryTitle(e.id));
      if (!e.sys) {
        head.draggable = true; head.title = S.t("Drag onto a report blank");
        head.dataset.entry = e.id;
        head.addEventListener("dragstart", function (ev) {
          S.dragStart(ev, e.id);
        });
        head.insertBefore(S.grip(e.id), head.firstChild);
      }
      box.appendChild(head);
      var by = scr().el("div", "dim");
      scr().markup("{" + S.t("written by") + "|author}: " + e.by, by);
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
      var slot = scr().el("div", "use-slot");
      slot.dataset.entry = e.id;
      box.appendChild(slot);
      useSlot = slot;
      S.refreshUse();
      return box;
    });
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
            text: locked ? S.t("locked") : S.tn("{n} entries", count),
            cls: locked ? "err" : "dim"
          }
        ];
      }));
    });
  }
  K.printEntry = printEntry; K.shellTable = shellTable; K.listSection = listSection; K.listRoot = listRoot;
})();
