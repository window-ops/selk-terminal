/* Final decision and endings: the menu, the habitation oxygen choice, the ending
   log that plays in the shell, and the reply from the audit office. */
(function () {
  var S = window.SELK;
  function reportDone(key) {
    return !!(S.state.reports[key] && S.state.reports[key].done);
  }
  function available(e) {
    return !e.needs || reportDone(e.needs);
  }
  function play(label, data) {
    var scr = S.scr;
    if (S.tmux.attached) {
      S.ui.open("SHELL");
      if (!S.isDesktop()) {
        S.tmux.zoom = S.tmux.cur; S.tmux.render();
      }
    }
    S.mode = "busy";
    S.snd.thud();
    scr.line("", "", 200);
    scr.type("DECISION: " + label.toUpperCase(), "head", 40);
    scr.line("", "", 300);
    data.log.forEach(function (l) {
      scr.type(l, "", 110); scr.wait(260);
    });
    scr.line("", "", 200);
    S.transmit("DECISION LOG").then(function () {
      scr.task(function () {
        return new Promise(function (r) {
          setTimeout(r, S.fast ? 100 : 2500);
        });
      }).then(function () {
        S.tick(99);
        S.snd.chime();
        var route = data.route || "R-09";
        scr.node(function () {
          var box = S.scr.el("div", "mail");
          box.appendChild(S.scr.el("div", "mail-head", "AUDIT DESK 4 > SELK SITE"));
          box.appendChild(S.scr.el("div", "dim", "sent " + S.fmtTime(S.state.clock - 79) + " UTC"));
          box.appendChild(S.scr.el("div", "dim", "received " + S.fmtTime(S.state.clock) + " UTC, route " + route));
          box.appendChild(S.scr.el("p", "mail-body", data.reply));
          return box;
        }, 300);
        if (S.state.endings.indexOf(data.id) === -1) {
          S.state.endings.push(data.id);
        }
        S.state.lastEnding = data.id.split("-")[0] === "habitation" ? data.id : data.id;
        S.save();
        S.status();
        scr.line("", "", 400);
        scr.line("Ending recorded. " + S.state.endings.length + " of " + S.ENDING_COUNT + " endings seen.", "warn");
        scr.rich("The site state was saved before the decision. Type decide to choose again.", "dim");
        scr.node(function () {
          var d = S.scr.el("div", "ln");
          d.appendChild(S.scr.cmdButton("OPEN DEVELOPER NOTES", "devnotes", "btn"));
          return d;
        });
        scr.task(function () {
          S.mode = "shell"; S.prompt();
        });
      });
    });
  }
  S.end = {
    decide: function () {
      if (S.tmux.attached && !S.ui.isOpen("SHELL")) {
        S.ui.open("SHELL");
      }
      if (!S.state.decision) {
        S.snd.error();
        S.scr.line("The final decision opens after REPORT 4 is accepted.", "err");
        return;
      }
      S.scr.line("FINAL DECISION", "head");
      S.scr.line("Choose one action for Selk. The site state is saved first.", "dim");
      S.scr.node(function () {
        var wrap = S.scr.el("div", "ln");
        S.ENDINGS.forEach(function (e, i) {
          var row = S.scr.el("div", "row");
          if (available(e)) {
            row.appendChild(S.scr.cmdButton("[" + (i + 1) + "] " + e.label.toUpperCase(), "choose " + (i + 1), "lnk act"));
          } else {
            row.appendChild(S.scr.el("span", "dim", "[" + (i + 1) + "] " + e.label.toUpperCase()));
            row.appendChild(S.scr.el("span", "err", " needs report " + S.REPORTS[e.needs].code));
          }
          wrap.appendChild(row);
        });
        return wrap;
      });
      S.save();
    },
    choose: function (n) {
      var e = S.ENDINGS[parseInt(n, 10) - 1];
      if (!S.state.decision || !e) {
        S.snd.error(); S.scr.line("Type decide to see the options.", "err"); return;
      }
      if (!available(e)) {
        S.snd.error(); S.scr.line("That option needs report " + S.REPORTS[e.needs].code + ".", "err"); return;
      }
      if (e.choice) {
        S.awaitOxygen = true;
        S.scr.line("AMBER / PART O", "head");
        S.scr.line("O2 near vent        0.4 %");
        S.scr.line("Fire limit at 94 K  not tested");
        S.scr.node(function () {
          var row = S.scr.el("div", "ln row");
          row.appendChild(document.createTextNode("Keep oxygen release? "));
          row.appendChild(S.scr.cmdButton("[YES]", "oxygen yes", "lnk act"));
          row.appendChild(document.createTextNode(" "));
          row.appendChild(S.scr.cmdButton("[NO]", "oxygen no", "lnk act"));
          return row;
        });
        return;
      }
      play(e.label, e);
    },
    oxygen: function (ans) {
      if (!S.awaitOxygen) {
        S.snd.error(); S.scr.line("Nothing to answer.", "err"); return;
      }
      ans = String(ans || "").toLowerCase();
      if (ans !== "yes" && ans !== "no") {
        S.snd.error(); S.scr.line("Answer oxygen yes or oxygen no.", "err"); return;
      }
      S.awaitOxygen = false;
      var hab = S.ENDINGS[4];
      play(hab.label + (ans === "yes" ? ", oxygen kept" : ", oxygen stopped"), ans === "yes" ? hab.yes : hab.no);
    }
  };
})();
