/* Final decision and endings, played as a short film over the terminal.
   decide: the interface steps back (windows and toasts close, the bars fade,
   the machine and wind sink), a black stage opens, three lines lead in, and
   the choices wait alone on the screen. An ending then plays in this order:
   the swell and the first pixel scene, the epilogue as captions under three
   scenes, the office's letter, and the title card. The decision log and the
   letter are also written into the shell, so they are there on return.
   Typed commands still work: choose 2, oxygen yes. */
(function () {
  var S = window.SELK;
  /* Which scene each of the four epilogue lines sits under */
  var SCENE_OF_LINE = [0, 0, 1, 2];
  function reportDone(key) {
    return !!(S.state.reports[key] && S.state.reports[key].done);
  }
  function available(e) {
    return !e.needs || reportDone(e.needs);
  }
  function stage(on) {
    var screen = document.getElementById("screen");
    S.finale = on;
    if (screen) {
      screen.classList.toggle("finale", on);
    }
    if (S.snd.hush) {
      S.snd.hush(on);
    }
    if (!on || !S.tmux.attached) {
      return;
    }
    if (S.closeDialog) { S.closeDialog(); }
    if (S.closeMenu) { S.closeMenu(); }
    if (S.dismissMailToast) { S.dismissMailToast(); }
    if (S.tut && S.tut.stop) { S.tut.stop(); }
    if (S.isDesktop()) {
      S.desk.closeAll();
    }
    S.ui.open("SHELL");
  }
  /* The record in the shell: decision, log and letter, written at once */
  function record(label, data) {
    var scr = S.scr, route = data.route || "R-09";
    S.tick(79);
    scr.line(S.t("DECISION: {label}", { label: label.toUpperCase() }), "head", 0);
    data.log.forEach(function (l) { scr.line(l, "", 0); });
    S.tick(99);
    scr.node(function () {
      var box = S.scr.el("div", "mail");
      box.appendChild(S.scr.el("div", "mail-head", S.t("AUDIT DESK 4 > SELK SITE")));
      box.appendChild(S.scr.el("div", "dim", S.t("received") + " " + S.fmtTime(S.state.clock) + " UTC, " + S.t("route {route}", { route: route })));
      box.appendChild(S.scr.el("p", "mail-body", data.reply));
      return box;
    }, 0);
    if (S.state.endings.indexOf(data.id) === -1) {
      S.state.endings.push(data.id);
    }
    S.state.lastEnding = data.id;
    S.recordUplink("sent", S.t("DECISION LOG"));
    S.save(); S.status();
  }
  function backToTerminal() {
    S.cine.close();
    S.end.release();
    S.mode = "shell";
    S.scr.line(S.tc("The site state was saved before the decision. Type {decide} to choose again."), "dim", 0);
    S.prompt();
  }
  function film(label, data) {
    var C = S.cine;
    record(label, data);
    S.snd.swell(data.mood || "hollow");
    var epi = data.epilogue || [], chain = Promise.resolve();
    epi.forEach(function (line, i) {
      chain = chain.then(function () { return C.scene(data.id, SCENE_OF_LINE[i] || 0, line); });
    });
    return chain.then(function () {
      return C.letter(S.t("AUDIT DESK 4 > SELK SITE"),
        [S.t("received") + " " + S.fmtTime(S.state.clock) + " UTC, " + S.t("route {route}", { route: data.route || "R-09" })],
        data.reply);
    }).then(function () {
      S.snd.chime();
      C.title(S.t("ENDING"), data.title || label,
        S.t("{n} of {total} endings seen.", { n: S.state.endings.length, total: S.ENDING_COUNT }),
        [{ label: S.t("CHOOSE AGAIN"), fn: function () { S.end.decide(); } },
          { label: S.t("RETURN TO TERMINAL"), fn: backToTerminal }]);
    });
  }
  function oxygen(e) {
    var C = S.cine;
    return C.lines([
      "AMBER / PART O",
      S.t("O2 near vent") + ": " + S.t("{v} %", { v: S.num(0.4, 1) }),
      S.t("Fire limit at 94 K") + ": " + S.t("not tested")
    ], 40, 700).then(function () {
      return C.choose([{ label: S.t("YES") }, { label: S.t("NO") }], S.t("Keep oxygen release?"), backToTerminal);
    }).then(function (i) {
      return film(e.label + (i === 0 ? S.t(", oxygen kept") : S.t(", oxygen stopped")), i === 0 ? e.yes : e.no);
    });
  }
  S.end = {
    release: function () {
      if (!S.finale) {
        return;
      }
      stage(false);
    },
    decide: function () {
      if (!S.state.decision) {
        if (S.tmux.attached && !S.ui.isOpen("SHELL")) { S.ui.open("SHELL"); }
        S.snd.error();
        S.scr.line(S.t("The final decision opens after REPORT 4 is accepted."), "err");
        return;
      }
      var C = S.cine, first = !C.isOpen();
      stage(true);
      S.mode = "busy";
      C.open();
      var lead = first ? (S.snd.creak(0.8), C.lines([
        S.t("The mast groans. For a moment even the fans seem to hold still."),
        S.t("No one on Earth can reach Selk before the equinox storms."),
        S.t("What happens to the site now depends on one line you type.")
      ], 36, 1300)) : Promise.resolve();
      S.save();
      lead.then(function () {
        return C.choose(S.ENDINGS.map(function (e) {
          return available(e) ? { label: e.label.toUpperCase() } :
            { label: e.label.toUpperCase(), disabled: true, note: S.t("needs report {code}", { code: S.REPORTS[e.needs].code }) };
        }), S.t("FINAL DECISION"), backToTerminal);
      }).then(function (i) {
        var e = S.ENDINGS[i];
        return e.choice ? oxygen(e) : film(e.label, e);
      });
    },
    /* Typed commands pick in the open choice list */
    choose: function (n) {
      if (!S.cine.isOpen()) {
        S.snd.error(); S.scr.line(S.tc("Type {decide} to see the options."), "err"); return;
      }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: String(parseInt(n, 10)) }));
    },
    oxygen: function (ans) {
      ans = S.i18n.arg(ans);
      if (!S.cine.isOpen() || (ans !== "yes" && ans !== "no")) {
        S.snd.error(); S.scr.line(S.tc("Answer {oxygen} {yes} or {oxygen} {no}."), "err"); return;
      }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: ans === "yes" ? "1" : "2" }));
    }
  };
})();
