/* Drag grips beside entries, and the requester for locked sections. */
(function () {
  var S = window.SELK, el = S.el;
  S.bootTime = Date.now();
  /* Drag grip shown beside anything that can fill a report blank */
  S.grip = function (id) {
    var g = el("span", "grip");
    g.title = S.t("Drag onto a report blank, or right-click for options");
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", S.t("Can fill a report blank"));
    g.draggable = true;
    g.addEventListener("dragstart", function (e) {
      e.stopPropagation(); S.dragStart(e, id);
    });
    return g;
  };
  /* The dialog for a locked section, in every mode. FILES, the desktop
     drawers and commands whose result does not stay in the shell (lockedMsg
     in cmdkit.js) open it. ENTER PASSWORD leads to the unlock dialog. */
  /* The clues of a lock with a note (Design) as a boxed list: each row a
     label and its text */
  S.lockClues = function (lock) {
    var list = el("dl", "lock-clues");
    (lock.clues || []).forEach(function (c) {
      list.appendChild(el("dt", "", c[0]));
      list.appendChild(el("dd", "", c[1]));
    });
    return list;
  };
  /* The European facts behind a lock's clues (lock.plain), for players
     outside the EU: a heading, then a boxed list like the clues */
  S.lockPlain = function (lock) {
    var box = el("div", "lock-plain");
    box.appendChild(el("div", "lock-plain-head", S.t("FOR PLAYERS OUTSIDE THE EU")));
    box.appendChild(S.lockClues({ clues: lock.plain }));
    return box;
  };
  /* The lines of a lock with a sort (History) as a numbered list, each line
     with its source */
  S.sortLines = function (lock) {
    var list = el("ol", "sort-lines");
    lock.sort.items.forEach(function (it) {
      var li = el("li", "");
      li.appendChild(el("q", "", it[0]));
      li.appendChild(el("div", "dim", it[1]));
      list.appendChild(li);
    });
    return list;
  };
  S.lockedRequester = function (sec) {
    var s = S.sectionById(sec), lock = S.LOCKS[sec], note = lock.note;
    S.snd.error();
    S.dialog( {
      title: S.t("{name} IS LOCKED", { name: s.name.toUpperCase() }),
      text: note ? note : S.tc("The entries in {name} need a password. The passwords were changed while you slept. Each one appears in an entry you can already open, as a name, a word or a number. The {hints} command can help.", { name: s.name }),
      build: note ? function (body) {
        body.appendChild(el("div", "dim", S.tc("The {hints} command can help.")));
      } : null,
      buttons: [
        {
          label: lock.key ? "ENTER SERIAL" : lock.sort ? "SORT" : "ENTER PASSWORD",
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
})();
