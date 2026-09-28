/* FILES window: a two-panel explorer in the style of Midnight Commander.
   Left panel lists sections, right panel lists the entries of the selected section. */
(function () {
  var S = window.SELK;
  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  var root = el("div", "mc");
  S.registerKind("FILES", root);
  var X = S.ex = {
    li: 1,
    ri: 0,
    side: "L"
  };
  function sec() {
    return S.SECTIONS[X.li];
  }
  function entriesOf(id) {
    return S.ENTRIES.filter(function (e) {
      return e.id.split("/")[0] === id;
    });
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
    S.SECTIONS.forEach(function (s, i) {
      if (s.id === id) {
        X.li = i;
      }
    });
    X.side = "R"; X.ri = 0; X.render();
  };
  function panel(side, path, rows, idx) {
    var p = el("div", "mc-panel" + (X.side === side ? " act" : ""));
    p.appendChild(el("div", "mc-head", " " + path + " "));
    var cols = el("div", "mc-row mc-cols");
    cols.appendChild(el("span", "mc-n", "NAME"));
    cols.appendChild(el("span", "mc-i", side === "L" ? "SIZE" : "WRITTEN BY"));
    p.appendChild(cols);
    var list = el("div", "mc-list scroll");
    rows.forEach(function (r, i) {
      var row = el("div", "mc-row" + (i === idx ? " sel" : "") + (r.lock ? " lock" : "") + (r.read ? " read" : ""));
      if (r.id) {
        row.appendChild(S.grip(r.id)); row.dataset.entry = r.id;
      } else if (side === "R") {
        row.appendChild(el("span", "grip-space"));
      }
      if (r.sec) {
        row.dataset.sec = r.sec;
      }
      row.appendChild(el("span", "mc-n", r.name));
      row.appendChild(el("span", "mc-i", r.info));
      if (r.id) {
        row.dataset.entry = r.id;
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
    var k = e.key, max = X.side === "L" ? S.SECTIONS.length : Math.max(1, rightItems().length);
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
    else if (k === "Tab" || k === "ArrowRight" || k === "ArrowLeft") {
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
    panels.appendChild(panel("L", "/", S.SECTIONS.map(function (s) {
      var open = S.isUnlocked(s.id);
      return {
        name: s.name.toUpperCase(),
        info: open ? entriesOf(s.id).length + " ITEMS" : "LOCKED",
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
            info: "UP"
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
          name: "LOCKED",
          info: "PRESS F7 OR ENTER",
          lock: true
        }
      ];
    }
    panels.appendChild(panel("R", "/" + s.id, rows, X.ri));
    root.appendChild(panels);
    var mini = el("div", "mc-mini"), id = X.highlighted();
    if (id) {
      var e = S.entryById(id);
      mini.textContent = S.entryTitle(id) + " / written by: " + e.by;
      if (S.state.sel) {
        mini.textContent += " / F4 USE puts it in blank " + S.state.sel.n;
      }
    } else {
      mini.textContent = S.isUnlocked(s.id) ? s.name.toUpperCase() + ", " + entriesOf(s.id).length + " items. Enter opens." : s.name.toUpperCase() + " is locked. F7 unlocks.";
    }
    root.appendChild(mini);
    if (S.tmux.mobile() && S.state.sel && id) {
      var use = el("button", "mc-use", "USE THIS RECORD FOR BLANK " + S.state.sel.n);
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
