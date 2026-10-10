/* FILES window: a two-panel explorer after Midnight Commander. The left panel
   lists sections, the right panel the entries of the selected section. */
(function () {
  var S = window.SELK;
  var el = S.el;
  var root = el("div", "mc");
  S.registerKind("FILES", root);
  var X = S.ex = {
    li: 1,
    ri: 0,
    side: "L"
  };
  function sec() {
    return S.sections()[X.li];
  }
  function entriesOf(id) {
    return S.entriesOf(id);
  }
  function rightItems() {
    var s = sec(); return S.isUnlocked(s.id) ? [
      {
        up: true
      }
    ].concat(entriesOf(s.id)) : [];
  }
  X.highlighted = function () {
    if (X.side !== "R") {
      return null;
    }
    var it = rightItems()[X.ri];
    return it && !it.up ? it.id : null;
  };
  X.section = function () {
    return sec().id;
  };
  X.goSection = function (id) {
    S.sections().forEach(function (s, i) {
      if (s.id === id) {
        X.li = i;
      }
    });
    X.side = "R"; X.ri = 0; X.render();
  };
  /* noGrip: the entries cannot be dragged (S.entryDraggable), so the rows have no
     grip and keep no space for one. sys: the section holds system files, whose
     second column is their directory */
  function panel(side, path, rows, idx, noGrip, sys) {
    var p = el("div", "mc-panel" + (X.side === side ? " act" : ""));
    p.appendChild(el("div", "mc-head", " " + path + " "));
    var cols = el("div", "mc-row mc-cols");
    cols.appendChild(el("span", "mc-n", S.t("NAME")));
    cols.appendChild(el("span", "mc-i", side === "L" ? S.t("SIZE") : sys ? S.t("DIRECTORY") : S.t("WRITTEN BY")));
    p.appendChild(cols);
    var list = el("div", "mc-list scroll");
    list.tabIndex = X.side === side ? 0 : -1;
    rows.forEach(function (r, i) {
      var row = el("div", "mc-row" + (i === idx ? " sel" : "") + (r.lock ? " lock" : "") + (r.read ? " read" : ""));
      row.dataset.sound = "select";
      if (r.id && !noGrip) {
        row.appendChild(S.grip(r.id));
      }
      if (r.sec) {
        row.dataset.sec = r.sec;
      }
      row.appendChild(el("span", "mc-n", r.name));
      row.appendChild(el("span", "mc-i", r.info));
      if (r.id) {
        row.dataset.entry = r.id;
        /* An entry without a grip opens but cannot be dragged: the plain
           hand, as on SYSTEM (css/cursors.css) */
        if (noGrip) {
          row.classList.add("nodrag");
        }
      }
      row.addEventListener("click", function () {
        click(side, i);
      });
      list.appendChild(row);
    });
    p.appendChild(list);
    return p;
  }
  function click(side, i) {
    var idx = side === "L" ? X.li : X.ri;
    if (X.side === side && idx === i) {
      enter(); return;
    }
    X.side = side;
    if (side === "L") {
      if (X.li !== i) {
        X.li = i; X.ri = 0; S.snd.hdd(2);
      }
    } else {
      X.ri = i;
    }
    X.render();
    if (S.state.settings.click === "single") {
      enter();
    }
  }
  function enter() {
    var s = sec();
    if (X.side === "L") {
      if (!S.isUnlocked(s.id)) {
        S.lockedRequester(s.id); return;
      }
      X.side = "R"; X.ri = Math.min(1, rightItems().length - 1); S.snd.hdd(); X.render(); return;
    }
    var items = rightItems();
    if (!items.length) {
      S.lockedRequester(s.id); return;
    }
    var it = items[X.ri];
    if (it.up) {
      X.side = "L"; X.render(); return;
    }
    S.run("open " + it.id, false);
  }
  X.key = function (e) {
    var k = e.key, max = X.side === "L" ? S.sections().length : Math.max(1, rightItems().length);
    var move = function (d) {
      if (X.side === "L") {
        var n = Math.max(0, Math.min(max - 1, X.li + d)); if (n !== X.li) {
          X.li = n; X.ri = 0; S.snd.hdd(1);
        }
      }
      else {
        X.ri = Math.max(0, Math.min(max - 1, X.ri + d)); S.snd.tick();
      }
      X.render();
    };
    if (k === "ArrowDown") {
      move(1);
    } else if (k === "ArrowUp") {
      move(-1);
    }
    else if (k === "PageDown") {
      move(8);
    } else if (k === "PageUp") {
      move(-8);
    }
    else if (k === "Home") {
      move(-99);
    } else if (k === "End") {
      move(99);
    }
    else if (k === "ArrowRight" || k === "ArrowLeft") {
      X.side = (k === "ArrowLeft") ? "L" : (k === "ArrowRight" ? "R" : (X.side === "L" ? "R" : "L"));
      if (X.side === "R" && !S.isUnlocked(sec().id)) {
        X.side = "L";
      }
      X.render();
    }
    else if (k === "Enter") {
      enter();
    }
    else if (k === "Backspace") {
      X.side = "L"; X.render();
    }
    else {
      return false;
    }
    return true;
  };
  X.render = function () {
    root.textContent = "";
    var panels = el("div", "mc-panels");
    panels.appendChild(panel("L", "/", S.sections().map(function (s) {
      var open = S.isUnlocked(s.id);
      return {
        name: s.name.toUpperCase(),
        info: open ? S.tn("{n} ITEMS", entriesOf(s.id).length) : S.t("LOCKED"),
        lock: !open,
        sec: s.id
      };
    }), X.li));
    var s = sec(), rows;
    if (S.isUnlocked(s.id)) {
      rows = rightItems().map(function (it) {
        if (it.up) {
          return {
            name: "/..",
            info: S.t("UP")
          };
        }
        if (it.sys) {
          return {
            name: it.id.split("/")[1],
            info: it.path,
            read: S.state.read.indexOf(it.id) !== -1,
            sysId: it.id
          };
        }
        return {
          name: it.id.split("/")[1],
          info: it.by,
          id: it.id,
          read: S.state.read.indexOf(it.id) !== -1
        };
      });
    } else {
      rows = [
        {
          name: S.t("LOCKED"),
          info: S.t("PRESS F7 OR ENTER"),
          lock: true
        }
      ];
    }
    panels.appendChild(panel("R", "/" + s.id, rows, X.ri, !!s.nodrag, s.id === "system"));
    root.appendChild(panels);
    var mini = el("div", "mc-mini"), id = X.highlighted();
    if (id) {
      var e = S.entryById(id);
      mini.textContent = S.entryTitle(id) + " / " + S.t("written by") + ": " + e.by;
      /* Only entries with a drag handle (S.entryDraggable) can fill a blank */
      if (S.state.sel && S.entryDraggable(id)) {
        mini.textContent += " / " + S.t("F4 USE puts it in blank {n}", { n: S.state.sel.n });
      }
    } else {
      mini.textContent = S.isUnlocked(s.id) ? S.tn("{name}, {n} items. Enter opens.", entriesOf(s.id).length, { name: s.name.toUpperCase() }) : S.t("{name} is locked. F7 unlocks.", { name: s.name.toUpperCase() });
    }
    root.appendChild(mini);
    if (S.tmux.mobile() && S.state.sel && id && S.entryDraggable(id)) {
      var use = el("button", "mc-use", S.t("USE THIS RECORD FOR BLANK {n}", { n: S.state.sel.n })); use.dataset.sound = "action";
      use.type = "button";
      use.addEventListener("click", function () {
        S.rep.fillBlank(S.state.sel.r, S.state.sel.n, id);
      });
      root.appendChild(use);
    }
    var sel = root.querySelectorAll(".mc-row.sel");
    sel.forEach(function (n) {
      if (n.scrollIntoView) {
        n.scrollIntoView( {
          block: "nearest"
        });
      }
    });
  };
})();
