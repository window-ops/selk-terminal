/* Hints: the hints page and revealing one hint at a time. */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err;
  /* Hints */
  function hintsPage() {
    var st = S.state;
    if (!st.hintsOn) {
      scr().line(S.t("Hints are hidden to protect the investigation."), "dim");
      scr().rich(S.tc("Type {hints} {on} to show the hints page. Each hint opens one at a time."), "dim");
      return;
    }
    scr().line(S.t("HINTS"), "head");
    var any = false;
    Object.keys(st.reports).forEach(function (k) {
      if (!S.reportReady(k)) {
        return;
      }
      if (st.reports[k].done) {
        return;
      }
      any = true;
      addHintBlock(S.t("Report {code}", { code: S.REPORTS[k].code }), S.REPORTS[k].hints, "r:" + k, "hint " + S.REPORTS[k].code);
    });
    S.SECTIONS.forEach(function (s) {
      if (!s.locked || S.isUnlocked(s.id)) {
        return;
      }
      any = true;
      addHintBlock(S.t("{name} password", { name: s.name }), S.LOCKS[s.id].hint, "l:" + s.id, "hint " + s.id);
    });
    if (!any) {
      scr().line(S.t("No open questions left."), "dim");
    }
    scr().line(S.tc(st.light ? "Hint light is on. Type {light} {on} or {light} {off}." : "Hint light is off. Type {light} {on} or {light} {off}."), "dim");
  }
  function addHintBlock(label, list, key, cmd) {
    var shown = S.state.hintsShown[key] || 0;
    scr().node(function () {
      var box = scr().el("div", "ln hintbox");
      box.appendChild(scr().el("div", "", label + "   " + S.t("{shown} of {total} shown", { shown: shown, total: list.length })));
      for (var i = 0; i < shown; i++) {
        box.appendChild(scr().el("div", "dim", "  " + (i + 1) + ". " + list[i]));
      }
      if (shown < list.length) {
        box.appendChild(scr().cmdButton(S.t("SHOW NEXT HINT"), cmd, "lnk act"));
      }
      return box;
    });
  }
  function revealHint(target) {
    var st = S.state;
    if (!st.hintsOn) {
      err(S.tc("Hints are hidden. Type {hints} {on} first.")); return;
    }
    var key, list, label;
    var rk = S.report(target || (st.active ? S.REPORTS[st.active].code : ""));
    if (rk && st.reports[rk]) {
      key = "r:" + rk; list = S.REPORTS[rk].hints; label = S.t("Report {code}", { code: S.REPORTS[rk].code });
    } else if (target && S.LOCKS[S.secId(target)]) {
      var sec = S.secId(target);
      if (S.isUnlocked(sec)) {
        scr().line(S.t("That section is already open."), "dim"); return;
      }
      key = "l:" + sec; list = S.LOCKS[sec].hint; label = S.t("{name} password", { name: S.sectionById(sec).name });
    } else {
      err(S.tc("Type {hint} 2 for a report or {hint} archive for a password.")); return;
    }
    var n = st.hintsShown[key] || 0;
    if (n >= list.length) {
      scr().line(S.t("All hints for {label} are shown.", { label: label }), "dim"); return;
    }
    st.hintsShown[key] = n + 1;
    S.save();
    S.snd.tick();
    scr().line(S.t("{label}, hint {n}: {text}", { label: label, n: n + 1, text: list[n] }), "warn");
  }
  K.hintsPage = hintsPage; K.revealHint = revealHint;
})();
