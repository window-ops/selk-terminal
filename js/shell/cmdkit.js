/* Shared by the shell commands: the screen, error output, entry lookup and
   the locked-section message. listing.js, mail.js and hints.js add their own
   helpers to S.cmd. */
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
    /* Print "NAME is locked. Type: unlock ..." in the shell when either:
         S.outShell() is true (the result of this command stays in the shell), or
         the command was typed, the mode is tmux and the SHELL pane is on screen.
       In every other case open the locked-section dialog (S.lockedRequester
       in common.js), the same dialog FILES opens for a locked section. */
    var inShell = S.outShell() || (S.cmdOrigin === "typed" && !S.isDesktop() && S.ui.isOpen("SHELL"));
    if (!inShell) {
      S.lockedRequester(sec); return;
    }
    var s = S.sectionById(sec);
    var parts = S.LOCKS[sec].parts.length;
    err(S.tc("{name} is locked. Type: {unlock} {sec} {pw}", { name: s.name, sec: sec, pw: parts > 1 ? S.t("PART1") + " " + S.t("PART2") : S.t("PASSWORD") }));
  }
  S.cmd = { scr: scr, err: err, resolveEntry: resolveEntry, lockedMsg: lockedMsg };
})();
