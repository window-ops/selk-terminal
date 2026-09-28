/* Dialogs: S.dialog() and the unlock and exit dialogs built on it. */
(function () {
  var S = window.SELK, el = S.el;
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
  /* Titles, texts, placeholders and button labels pass through S.t here, so
     callers can hand over English text and every dialog follows the language. */
  S.dialog = function (o) {
    S.closeDialog();
    var ov = el("div", "dlg-ov"), box = el("div", "dlg" + (o.wide ? " wide" : ""));
    box.setAttribute("role", "dialog");
    box.appendChild(el("div", "dlg-title", S.t(o.title)));
    var body = el("div", "dlg-body");
    if (o.text) {
      body.appendChild(el("div", "", S.t(o.text)));
    }
    var inputs = (o.inputs || []).map(function (ph) {
      var i = el("input", "dlg-in"); i.type = "text"; i.placeholder = S.t(ph); i.autocomplete = "off"; i.spellcheck = false;
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
      var x = el("button", "btn" + (i === 0 ? " primary" : ""), S.t(b.label)); x.type = "button";
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
      if (e.key === "Enter" && (e.target.tagName === "INPUT" || e.target === box)) {
        e.preventDefault(); row.firstChild.click();
      }
    });
    document.getElementById("screen").appendChild(ov);
    S.dlg = ov;
    /* A field takes focus so the player can type at once. Otherwise the dialog
       itself does, with no focus ring: Tab reaches the buttons and Enter
       chooses the first one. */
    if (inputs[0]) {
      inputs[0].focus();
    } else {
      box.tabIndex = -1; box.focus({ preventScroll: true });
    }
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
      S.msg(S.t("All sections are open")); return;
    }
    var s = S.sectionById(sec), parts = S.LOCKS[sec].parts.length;
    S.dialog( {
      title: S.t("UNLOCK {name}", { name: s.name.toUpperCase() }),
      text: (parts > 1 ? S.t("This section needs two parts: a word and a number.") : S.t("Enter the password for this section.")) + " " + S.LOCKS[sec].nudge,
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
})();
