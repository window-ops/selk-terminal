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
    /* System files and nodrag sections (Home, Design, History) have no
       drag handle and cannot fill a blank */
    if (!sel || !S.state.reports[sel.r] || !S.reportReady(sel.r) || S.state.reports[sel.r].done || !S.entryDraggable(id)) { return; }
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
      if (S.entryDraggable(e.id)) {
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
        /* @ENDING@ is the ending chosen last (history/2097-NOW). An article
           (History) is paragraphs, with its facts table under them. */
        var text = e.body.replace(/@ENDING@/g, S.end.decisionLabel());
        box.appendChild(e.article ? S.renderParas(text, scr().markup) : S.renderBody(text, scr().markup, e.table));
        if (e.facts) {
          box.appendChild(S.renderBody(e.facts, scr().markup, true));
        }
      }
      /* One camera picture with its caption, or a list of pictures
         captioned with their file names (design/IMAGES) */
      (e.img ? [[e.img, e.cap]] : (e.imgs || []).map(function (src) { return [src, src.split("/").pop()]; })).forEach(function (p) {
        var fig = scr().el("figure", "cam");
        var img = document.createElement("img");
        img.src = p[0]; img.alt = p[1]; img.loading = "lazy"; img.draggable = false;
        fig.appendChild(img);
        fig.appendChild(scr().el("figcaption", "dim", p[1]));
        box.appendChild(fig);
      });
      /* A picture with two sides (the citizen pass) shows one side at a
         time. TURN OVER, beside the caption, or a click on the picture turns
         it: the picture narrows to its edge, changes side and widens again,
         at once when motion is reduced. The caption follows the side. */
      if (e.flip) {
        var side = 0, card = scr().el("figure", "cam flip");
        var face = document.createElement("img"), cap = scr().el("figcaption", "dim"), text = scr().el("span", "");
        var turn = scr().el("button", "lnk act", S.t("TURN OVER"));
        turn.type = "button"; turn.dataset.sound = "flip";
        face.title = S.t("TURN OVER"); face.draggable = false; face.dataset.sound = "flip";
        var show = function () {
          face.src = e.flip[side][0]; face.alt = e.flip[side][1]; text.textContent = e.flip[side][1];
        };
        var flip = function () {
          side = (side + 1) % e.flip.length;
          if (S.reduced) { show(); return; }
          face.classList.add("turning");
          setTimeout(function () { show(); face.classList.remove("turning"); }, 140);
        };
        turn.addEventListener("click", flip);
        face.addEventListener("click", flip);
        show();
        cap.appendChild(text); cap.appendChild(turn);
        card.appendChild(face); card.appendChild(cap);
        box.appendChild(card);
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
      return shellTable(S.entriesOf(sec).map(function (e) {
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
      return shellTable(S.sections().map(function (s) {
        var locked = !S.isUnlocked(s.id);
        var count = S.entriesOf(s.id).length;
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
