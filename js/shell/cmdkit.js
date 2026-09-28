/* Shared by the shell commands: the screen, error output, entry lookup and
   the locked-section message. Other command files add their pages to S.cmd. */
(function () {
  var S = window.SELK;
  function scr() {
    return S.scr;
  }
  function err(msg) {
    S.snd.error(); S.feedback(msg, "err");
  }
  function resolveEntry(arg) {
    if (!arg) {
      return null;
    }
    if (arg.indexOf("/") !== -1) {
      arg = S.secId(arg.split("/")[0]) + "/" + arg.split("/").slice(1).join("/");
    }
    if (arg.indexOf("/") === -1 && S.state.cwd) {
      arg = S.state.cwd + "/" + arg;
    }
    return S.entryById(arg);
  }
  function lockedMsg(sec) {
    if (S.isDesktop() || S.fromClick || !S.ui.isOpen("SHELL")) {
      S.lockedRequester(sec); return;
    }
    var s = S.sectionById(sec);
    var parts = S.LOCKS[sec].parts.length;
    err(S.tc("{name} is locked. Type: {unlock} {sec} {pw}", { name: s.name, sec: sec, pw: parts > 1 ? S.t("PART1") + " " + S.t("PART2") : S.t("PASSWORD") }));
  }
  S.cmd = { scr: scr, err: err, resolveEntry: resolveEntry, lockedMsg: lockedMsg };
})();
