/* Window switcher: hold Alt and press the key above Tab. */
(function () {
  var S = window.SELK, el = S.el;
  var box = null, list = [], idx = 0;
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
        label: i + ": " + S.t(w.name),
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
    box.appendChild(el("div", "switcher-head", S.t("WINDOWS")));
    list.forEach(function (it, i) {
      var r = el("div", "switcher-item" + (i === idx ? " on" : ""), it.label);
      r.setAttribute("role", "option"); r.setAttribute("aria-selected", i === idx ? "true" : "false");
      r.addEventListener("click", function () {
        idx = i; commit();
      });
      box.appendChild(r);
    });
    box.appendChild(el("div", "switcher-foot dim", S.t("Release Alt to switch, Esc to cancel")));
    document.getElementById("screen").appendChild(box);
  }
  function commit() {
    var it = list[idx]; close(); if (it) {
      it.go();
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
