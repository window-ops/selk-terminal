/* Helpers for the shell commands: the screen, error output, entry lookup and
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
    var e = S.entryById(arg);
    return e && S.entryShown(e) ? e : null;
  }
  function lockedMsg(sec) {
    /* Print "NAME is locked. Type: unlock ..." in the shell when S.outShell()
       is true, or when the command was typed in tmux mode with SHELL on
       screen. Otherwise open the locked-section dialog (S.lockedRequester in
       common.js), the one FILES opens. */
    var inShell = S.outShell() || (S.cmdOrigin === "typed" && !S.isDesktop() && S.ui.isOpen("SHELL"));
    if (!inShell) {
      S.lockedRequester(sec); return;
    }
    var s = S.sectionById(sec);
    var parts = S.LOCKS[sec].parts.length;
    /* A lock with a note (Design) prints it first, since its answer is in no
       entry */
    var lock = S.LOCKS[sec];
    if (lock.sort) {
      scr().line(lock.note, "dim");
      scr().node(function () { return S.sortLines(lock); });
      scr().line(S.t("One letter per line, in order: {choices}.", { choices: lock.sort.choices.map(function (c) { return c[0].toUpperCase() + " " + c[1]; }).join(", ") }), "dim");
      err(S.tc("{name} is locked. Type: {unlock} {sec} {pw}", { name: s.name, sec: sec, pw: S.t("LETTERS") })); return;
    }
    if (lock.note) {
      scr().line(lock.note, "dim");
      scr().node(function () { return S.lockClues(lock); });
      err(S.tc("{name} is locked. Type: {unlock} {sec} {pw}", { name: s.name, sec: sec, pw: S.t("SERIAL") })); return;
    }
    err(S.tc("{name} is locked. Type: {unlock} {sec} {pw}", { name: s.name, sec: sec, pw: parts > 1 ? S.t("PART1") + " " + S.t("PART2") : S.t("PASSWORD") }));
  }
  S.cmd = { scr: scr, err: err, resolveEntry: resolveEntry, lockedMsg: lockedMsg };
})();
