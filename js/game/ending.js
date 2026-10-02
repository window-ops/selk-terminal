/* Final decision and endings, played as a short film over the terminal.
   The state is saved just before the decision (preDecision). After the film
   the game is in its endgame (S.state.ended): the last card offers to load
   that save or to return to the title screen, and it comes back at every
   sign-in until the earlier save is loaded.
   decide: the interface steps back (windows and toasts close, the bars fade,
   the machine and wind sink), a black stage opens, three lines lead in, and
   the choices wait alone on the screen. An ending then plays in this order:
   the swell and the first pixel scene, the epilogue as captions under three
   scenes, the office's letter, and the title card. The decision log and the
   letter are also written into the shell, so they are there on return.
   The choice list takes one number key per choice, 1 for the first. The choose and oxygen
   commands send the same number key as a keydown event (see S.end.choose). */
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
  /* Write the decision, its log lines and the office's letter into the
     shell log with no typing delay, advance the site clock by 79 and then
     99 minutes, and record the ending in the state (endings, lastEnding,
     ended) */
  function record(label, data) {
    var scr = S.scr, route = data.route || "R-09";
    S.tick(79);
    scr.line(S.t("DECISION: {label}", { label: label.toUpperCase() }), "head", 0);
    data.log.forEach(function (l) { scr.line(l, "", 0); });
    S.tick(99);
    scr.node(function () {
      var box = S.scr.el("div", "mail");
      box.appendChild(S.speakText(S.scr.el("div", "mail-head"), S.t("AUDIT DESK 4 > SELK SITE"), "to"));
      box.appendChild(S.scr.el("div", "dim", S.t("received") + " " + S.fmtTime(S.state.clock) + " UTC, " + S.t("route {route}", { route: route })));
      box.appendChild(S.scr.el("p", "mail-body", data.reply));
      return box;
    }, 0);
    if (S.state.endings.indexOf(data.id) === -1) {
      S.state.endings.push(data.id);
    }
    S.state.lastEnding = data.id;
    S.state.ended = { id: data.id, title: data.title || label };
    S.recordUplink("sent", S.t("DECISION LOG"));
    S.save(); S.status();
  }
  function backToTerminal() {
    S.snd.stopSwell();
    S.cine.close();
    S.end.release();
    S.mode = "shell";
    S.prompt();
  }
  /* Back to the title screen, rebuilt in place; the saved state decides what
     comes next after POWER ON */
  function restart() {
    S.save();
    S.toTitle();
  }
  /* Choose again: the choice list comes back at once. The state returns to
     before the decision, and that save stays available for the next choice */
  function chooseAgain() {
    var snap = restoreBefore();
    if (snap) { S.state.preDecision = snap; }
    S.save(); S.status();
    S.snd.stopSwell();
    S.cine.setManual(false);
    choices();
  }
  /* The ending data for an id. Also finds the yes and no branches of a
     choice ending, which carry their own ids. */
  function endingById(id) {
    var found = null;
    S.ENDINGS.forEach(function (e) {
      if (e.id === id) { found = e; }
      if (e.choice && e.yes.id === id) { found = e.yes; }
      if (e.choice && e.no.id === id) { found = e.no; }
    });
    return found;
  }
  /* The state from before the decision. Settings are the player's, not part
     of the story, so the current ones stay, and so does every ending seen */
  function restoreBefore() {
    var seen = S.state.endings.slice(), snap = S.state.preDecision, settings = S.state.settings;
    if (snap) {
      S.state = JSON.parse(snap);
      S.state.settings = settings;
      seen.forEach(function (id) { if (S.state.endings.indexOf(id) === -1) { S.state.endings.push(id); } });
    }
    S.state.ended = null;
    return snap;
  }
  function loadBefore() {
    restoreBefore();
    S.state.active = "DECISION";
    S.save();
    S.snd.stopSwell();
    /* Restored in place: no reload, so the title screen never comes back */
    S.cine.close();
    stage(false);
    S.mode = "shell";
    S.enterMode();
    S.status();
    S.ui.open("REPORT");
    S.scr.line(S.t("The save from before the decision is loaded."), "ok", 0);
    S.prompt();
  }
  function film(label, data, replay) {
    var C = S.cine;
    if (!replay) {
      record(label, data);
    }
    /* A replay shown one card at a time (STEP BY STEP) is read at the
       player's pace, so it plays without the swell */
    if (!(replay && C.manual)) {
      S.snd.swell(data.mood || "hollow");
    }
    var epi = data.epilogue || [], chain = Promise.resolve();
    epi.forEach(function (line, i) {
      chain = chain.then(function () { return C.scene(data.id, SCENE_OF_LINE[i] || 0, line); });
    });
    return chain.then(function () {
      return C.letter(S.t("AUDIT DESK 4 > SELK SITE"),
        [S.t("received") + " " + S.fmtTime(S.state.clock) + " UTC, " + S.t("route {route}", { route: data.route || "R-09" })],
        data.reply);
    }).then(function () {
      S.end.endgame();
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
  /* The scenes before the decision: the shelter, then the site map */
  function intro(manual) {
    var C = S.cine;
    C.setManual(manual);
    return C.scene("intro", 0, S.t("You are in the site shelter, at the old terminal CESEA left behind.")).then(function () {
      return C.scene("intro", 1, S.t("MAST-01 is over its safe load. Most of the site is under sand."));
    }).then(function () {
      return C.scene("intro", 1, S.t("No one on Earth can reach Selk before the equinox storms. The office has left the decision to you."));
    }).then(function () {
      C.setManual(false);
    });
  }
  /* The final choice list. Its REPLAY row plays the intro again, whole or
     one card at a time, and then returns to the list. */
  function choices() {
    var C = S.cine;
    return C.choose(S.ENDINGS.map(function (e) {
      return available(e) ? { label: e.label.toUpperCase() } :
        { label: e.label.toUpperCase(), disabled: true, note: S.t("needs report {code}", { code: S.REPORTS[e.needs].code }) };
    }), S.t("FINAL DECISION"), backToTerminal, [
      { label: S.t("REPLAY"), buttons: [
        { label: S.t("INTRO"), title: S.t("Replay the scenes before the decision"), fn: function () { intro(false).then(choices); } },
        { label: S.t("STEP BY STEP"), title: S.t("Replay the scenes before the decision, one at a time"), fn: function () { intro(true).then(choices); } }
      ] }
    ]).then(function (i) {
      var e = S.ENDINGS[i];
      return e.choice ? oxygen(e) : film(e.label, e);
    });
  }
  S.end = {
    /* The endgame card: the ending's title, the count of endings seen, and
       two button rows, REPLAY and CONTINUE */
    endgame: function () {
      var e = S.state.ended;
      if (!e) { return; }
      S.mode = "busy";
      S.cine.open().then(function () {
        stage(true);
        S.cine.setManual(false);
        S.cine.title(S.t("ENDING"), e.title,
        S.t("{n} of {total} endings seen.", { n: S.state.endings.length, total: S.ENDING_COUNT }),
        [{ label: S.t("REPLAY"), buttons: [
          { label: S.t("ENDING"), title: S.t("Replay the ending"), fn: function () { S.end.replay(false); } },
          { label: S.t("STEP BY STEP"), title: S.t("Replay the ending, one card at a time"), fn: function () { S.end.replay(true); } },
          { label: S.t("INTRO"), title: S.t("Replay the scenes before the decision"), fn: function () { intro(false).then(S.end.endgame); } }
        ] }, { label: S.t("CONTINUE"), buttons: [
          { label: S.t("CHOOSE AGAIN"), title: S.t("Return to the final decision and choose another ending"), fn: chooseAgain },
          { label: S.t("LOAD SAVE"), title: S.t("Load the save from before the decision"), fn: loadBefore },
          { label: S.t("TITLE SCREEN"), title: S.t("Return to the title screen"), fn: restart }
        ] }]);
      });
    },
    /* Replay the last ending, on its own timing or one card at a time */
    replay: function (manual) {
      var e = S.state.ended, data = e && endingById(e.id);
      if (!data) { return; }
      S.cine.open();
      S.cine.setManual(manual);
      film(e.title, data, true);
    },
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
      /* The save to return to after the ending */
      var snap = JSON.parse(JSON.stringify(S.state));
      delete snap.preDecision; snap.ended = null;
      S.state.preDecision = JSON.stringify(snap);
      S.save();
      /* Decision time: sound sinks and the screen fades to black first; the
         windows close behind the black, then the intro begins */
      S.mode = "busy";
      if (S.snd.hush) { S.snd.hush(true); }
      document.getElementById("screen").classList.add("finale");
      C.open().then(function () {
        stage(true);
        return first ? intro(false) : null;
      }).then(choices);
    },
    /* choose N sends the keydown for digit N; oxygen yes sends 1 and oxygen
       no sends 2. Both act only while the cinema is open (S.cine.isOpen()). */
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
