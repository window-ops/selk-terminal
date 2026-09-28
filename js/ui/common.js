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
  /* Locked sections: always say so, in every mode */
  S.lockedRequester = function (sec) {
    var s = S.sectionById(sec);
    S.snd.error();
    S.dialog( {
      title: S.t("{name} IS LOCKED", { name: s.name.toUpperCase() }),
      text: S.tc("The entries in {name} need a password. The passwords were changed while you slept. Each one appears in an entry you can already open, as a name, a word or a number. The {hints} command can help.", { name: s.name }),
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
})();
