/* VIEW window and MAIL pane. S.display() shows any content in VIEW. */
(function () {
  var S = window.SELK, el = S.el;
  /* Viewer */
  var vroot = el("div", "viewer"), vhead = el("div", "v-head", "VIEW"), vbody = el("div", "v-body scroll"), vnote = el("div", "v-note");
  var vhint = el("div", "dim", "Open an entry from FILES, or type open and a name.");
  vbody.appendChild(vhint);
  vnote.hidden = true;
  /* Built before the language file loads, so the first texts are set once it is in */
  S.i18n.ready.then(function () {
    vhead.textContent = S.t("VIEW");
    vhint.textContent = S.tc("Open an entry from FILES, or type {open} and a name.");
  });
  vroot.appendChild(vhead); vroot.appendChild(vbody); vroot.appendChild(vnote);
  S.registerKind("VIEW", vroot);
  /* The viewer reveals text at the same text speed as the shell. A click in the
     viewer or any key press shows the rest at once. */
  var viewToken = 0, viewSkip = false;
  vbody.addEventListener("click", function () { viewSkip = true; });
  document.addEventListener("keydown", function () { viewSkip = true; }, true);
  S.view = {
    show: function (title, node) {
      vhead.textContent = S.t("VIEW") + ": " + title;
      vbody.textContent = ""; vbody.appendChild(node); vbody.scrollTop = 0;
      vbody.tabIndex = 0;
      vnote.textContent = ""; vnote.hidden = true;
      var token = ++viewToken; viewSkip = false;
      S.scr.reveal(node, function () { return viewSkip || token !== viewToken; });
      vbody.focus({ preventScroll: true });
      S.announce(title);
    },
    note: function (node) {
      vnote.textContent = "";
      var x = el("button", "btn v-close", S.t("CLOSE")); x.type = "button";
      x.addEventListener("click", function () {
        vnote.hidden = true;
      });
      vnote.appendChild(x); vnote.appendChild(node); vnote.hidden = false;
      vbody.tabIndex = 0; vbody.focus({ preventScroll: true });
      var title = node.querySelector && node.querySelector(".note-title");
      if (title && S.announce) { S.announce(title.textContent.replace(/\s+/g, " ").trim()); }
    }
  };
  S.display = function (title, node, isNote) {
    var T = S.tmux;
    /* Setup > Shell results > IN SHELL: what a typed command shows stays in the
       shell, in tmux and desktop mode alike. Clicked items still open in VIEW. */
    if (T.attached && S.mode === "shell" && !S.fromClick && S.state.settings.shellOut === "shell") {
      S.scr.node(function () {
        return node;
      });
      return;
    }
    var fromShell = T.attached && !S.isDesktop() && S.mode === "shell" && !S.fromClick && T.visible("SHELL");
    if (T.attached && S.isDesktop()) {
      if (!T.visible("VIEW")) {
        T.goto("VIEW");
      } else {
        S.desk.goto("VIEW");
      }
      if (isNote) {
        S.view.note(node);
      } else {
        S.view.show(title, node);
      }
      return;
    }
    if (T.attached) {
      if (!T.visible("VIEW")) {
        T.goto("VIEW");
      }
      if (isNote) {
        S.view.note(node);
      } else {
        S.view.show(title, node);
      }
      if (fromShell && S.state.settings.redirectNotes !== false) {
        S.scr.line(S.t("Output redirected to VIEW."), "dim", 0);
      }
      return;
    }
    S.scr.node(function () {
      return node;
    });
  };
  /* Mail pane */
  var mroot = el("div", "mailpane scroll");
  S.registerKind("MAIL", mroot);
  S.mailpane = {
    render: function () {
      var active = document.activeElement;
      var keepFocus = mroot.contains(active);
      var focusIndex = keepFocus ? active.dataset.mailIndex : null;
      mroot.textContent = "";
      mroot.appendChild(el("div", "pane-title", S.t("INBOX, AUDIT DESK 4")));
      var m = S.state.mail;
      if (!m.length) {
        mroot.appendChild(el("div", "dim", S.state.pending.length ? S.t("The uplink is receiving.") : S.t("No messages yet.")));
        if (keepFocus) { mroot.tabIndex = -1; mroot.focus({ preventScroll: true }); }
        return;
      }
      m.forEach(function (x, i) {
        var b = el("button", "mrow" + (x.read ? "" : " unread"));
        b.type = "button"; b.dataset.cmd = "mail " + (i + 1);
        b.dataset.mailIndex = String(i);
        b.textContent = S.t("MSG {num}", { num: ("00" + (i + 1)).slice(-3) }) + " " + S.fmtTime(x.t) + (x.read ? "" : " " + S.t("NEW"));
        mroot.appendChild(b);
      });
      if (keepFocus) {
        var next = mroot.querySelector("[data-mail-index='" + focusIndex + "']") || mroot.querySelector(".mrow") || mroot;
        if (!next.matches("button, input, select, textarea, a, [tabindex]")) { next.tabIndex = -1; }
        next.focus({ preventScroll: true });
      }
    }
  };
})();
