/* Dialogs: S.dialog() with the unlock and exit dialogs built on it, the error
   dialog, and the arrow keys shared by dialogs and button rows. */
(function () {
  var S = window.SELK, el = S.el;
  /* Arrow keys. A row is a group of controls side by side: the buttons of a
     dialog, the options of a Setup row, report tabs, the buttons of a toast
     or of the tour. Left and Right move along the row and wrap at its ends.
     Up and Down move to the next row, or to the next control outside a row,
     and land on the row's chosen option (pressed, on or selected) or its
     first control. Text fields keep Left and Right for the caret, and sliders
     for their value. Returns true when the focus moved. */
  var ROW = ".dlg-btns, .set-ctl, .tabs, .tut-btns, .mail-toast-actions, .cine-group, .title-row, .tmux-right, .wb-right";
  var CHOSEN = "[aria-pressed='true'], .on, [aria-selected='true'], [aria-current='true']";
  function focusables(root) {
    return [].filter.call(root.querySelectorAll("button, input, select, textarea, [tabindex]"), function (n) {
      return !n.disabled && n.tabIndex >= 0 && !n.closest("[hidden], [inert], .set-pick-list") && n.getClientRects().length > 0;
    });
  }
  function rowOf(n) {
    return n.closest(ROW) || n;
  }
  S.keyNav = function (e, root) {
    var k = e.key, t = e.target;
    var across = k === "ArrowLeft" || k === "ArrowRight", down = k === "ArrowDown";
    if ((!across && !down && k !== "ArrowUp") || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return false; }
    if (t.matches && t.matches("select, textarea")) { return false; }
    if (across && t.matches && t.matches("input")) { return false; }
    var all = focusables(root), i = all.indexOf(t), next = null;
    if (!all.length) { return false; }
    if (i === -1) {
      next = (k === "ArrowLeft" || k === "ArrowUp") ? all[all.length - 1] : all[0];
    } else if (across) {
      var row = rowOf(t);
      if (row === t) { return false; }
      var mates = all.filter(function (n) { return rowOf(n) === row; }), j = mates.indexOf(t);
      next = mates[(j + (k === "ArrowRight" ? 1 : -1) + mates.length) % mates.length];
    } else {
      var step = down ? 1 : -1, here = rowOf(t), at = i;
      do {
        at = (at + step + all.length) % all.length;
      } while (at !== i && rowOf(all[at]) === here);
      var there = rowOf(all[at]);
      var group = all.filter(function (n) { return rowOf(n) === there; });
      next = group.filter(function (n) { return n.matches(CHOSEN); })[0] || group[0];
    }
    if (!next || next === t) { return false; }
    e.preventDefault();
    next.focus();
    return true;
  };
  /* Dialogs */
  S.dlg = null;
  var CLOSERS = ["CLOSE", "CANCEL", "OK", "DISMISS"];
  S.closeDialog = function () {
    if (S.dlg) {
      if (S.clearDragState) {
        S.clearDragState();
      }
      S.dlg.remove(); S.dlg = null; S.tmux.focusCur();
    }
  };
  /* Escape closes the dialog, unless its onEscape handles the key and
     returns true */
  S.escapeDialog = function () {
    if (S.dlg && !(S.dlg._onEscape && S.dlg._onEscape())) { S.closeDialog(); }
  };
  /* Titles, texts, placeholders and button labels go through S.t here, so
     callers pass English text. */
  S.dialog = function (o) {
    S.closeDialog();
    var ov = el("div", "dlg-ov"), box = el("div", "dlg" + (o.wide ? " wide" : ""));
    box.setAttribute("role", "dialog");
    /* The title text is in its own span: the tmux theme draws it in the top
       border, the desktop theme on the striped bar, and the title screen's
       theme on a line of its own. */
    var head = el("div", "dlg-title");
    head.appendChild(el("span", "dlg-title-text", S.t(o.title)));
    box.appendChild(head);
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
    var list = o.buttons || [{ label: "CLOSE" }];
    list.forEach(function (b, i) {
      var x = el("button", "btn" + (i === 0 ? " primary" : ""), S.t(b.label)); x.type = "button";
      /* Control sounds: a button that only closes the dialog sounds as a
         close; the first of several buttons is the dialog's action */
      if (CLOSERS.indexOf(b.label) !== -1 || !b.action) { x.dataset.sound = "close"; }
      else if (i === 0 && list.length > 1) { x.dataset.sound = "action"; }
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
    /* Escape closes (S.escapeDialog), Enter in a field or on the dialog
       chooses the first button, Enter on a button presses it, and the arrow
       keys move between controls (S.keyNav) */
    ov.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape") {
        if (!e.defaultPrevented) { S.escapeDialog(); }
        return;
      }
      if (e.target.tagName === "INPUT" && (e.key.length === 1 || e.key === "Backspace")) {
        S.snd.key();
      }
      if (e.key === "Enter" && (e.target.tagName === "INPUT" || e.target === box)) {
        e.preventDefault(); row.firstChild.click(); return;
      }
      S.keyNav(e, box);
    });
    ov._onEscape = o.onEscape ? function () { return o.onEscape(body); } : null;
    document.getElementById("screen").appendChild(ov);
    S.dlg = ov;
    /* A field takes the focus. Without a field the dialog takes it, with no
       focus ring: Tab or an arrow key reaches the buttons, and Enter chooses
       the first one. */
    if (inputs[0]) {
      inputs[0].focus();
    } else {
      box.tabIndex = -1; box.focus({ preventScroll: true });
    }
    return body;
  };
  /* Error messages. Setup > Display > Error messages (settings.errors)
     decides where S.msg(text, "err") goes: "auto" is a dialog in desktop mode
     and the status bar in tmux mode; "dialog" and "bar" apply to both modes. */
  S.errorsAsDialog = function () {
    var v = S.state.settings.errors;
    return v === "dialog" || (v !== "bar" && S.isDesktop && S.isDesktop());
  };
  /* The error dialog opens above any open dialog without closing it, so a
     wrong password leaves the UNLOCK dialog and its fields in place. A second
     error replaces the text. OK, Enter and Escape close it, and the focus
     returns to where it was. */
  var errBox = null, errOpener = null;
  function closeError() {
    if (!errBox) { return; }
    errBox.remove(); errBox = null;
    if (errOpener && errOpener.isConnected && errOpener.focus) {
      errOpener.focus({ preventScroll: true });
    } else if (!S.dlg) {
      S.tmux.focusCur();
    }
    errOpener = null;
  }
  S.closeError = closeError;
  S.errorOpen = function () { return !!errBox; };
  S.errorBox = function (text) {
    if (errBox) {
      errBox._text.textContent = text; errBox._ok.focus({ preventScroll: true }); return;
    }
    errOpener = document.activeElement;
    var ov = el("div", "dlg-ov err-ov"), box = el("div", "dlg dlg-err");
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-modal", "true");
    var head = el("div", "dlg-title"), body = el("div", "dlg-body"), msg = el("div", "", text);
    head.id = "err-dlg-title"; msg.id = "err-dlg-text";
    head.appendChild(el("span", "dlg-title-text", S.t("ERROR")));
    box.setAttribute("aria-labelledby", head.id);
    box.setAttribute("aria-describedby", msg.id);
    body.appendChild(msg);
    var row = el("div", "dlg-btns"), ok = el("button", "btn primary", S.t("OK"));
    ok.type = "button";
    ok.addEventListener("click", closeError);
    row.appendChild(ok);
    box.appendChild(head); box.appendChild(body); box.appendChild(row);
    ov.appendChild(box);
    /* The error dialog takes every key while it is open; the dialog under it
       and the game receive none */
    ov.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape" || (e.key === "Enter" && e.target !== ok)) {
        e.preventDefault(); closeError();
      } else if (e.key === "Tab" || /^Arrow/.test(e.key)) {
        e.preventDefault(); ok.focus({ preventScroll: true });
      }
    });
    ov.addEventListener("contextmenu", function (e) { e.stopPropagation(); });
    document.getElementById("screen").appendChild(ov);
    ov._text = msg; ov._ok = ok;
    errBox = ov;
    ok.focus({ preventScroll: true });
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
            S.runClick("unlock " + sec + " " + v.join(" ")); return S.isUnlocked(sec) ? true : false;
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
