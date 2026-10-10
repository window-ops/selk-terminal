/* Saving prompts: the tab-only toast, the conflict note, the switch-back question
   and the close prompt. Shared with Setup and the Storage page as S.savePrompt. */
(function () {
  var S = window.SELK, el = S.el;
  function wipeOn() {
    try {
      return localStorage.getItem(S.WIPE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }
  function confirmTabOnly() {
    S.dialog({
      title: "SAVE IN THIS TAB ONLY?",
      text: "Your progress moves from this computer to this browser tab. When you close the tab, all game data is deleted.",
      buttons: [
        { label: "KEEP ON THIS COMPUTER", action: function () { setTimeout(S.settingsDialog, 0); } },
        { label: "SWITCH TO THIS TAB", action: function () {
          S.setSaveLocal(false); dismissSaveToast(); S.status();
          S.msg("Progress is now kept in this tab only.", "warn");
          setTimeout(S.settingsDialog, 0);
        } }
      ]
    });
  }
  /* Saving. Progress stays in this tab until the player chooses to keep it on
     this computer. The choice is offered after a close attempt is canceled. */
  var NUDGED_KEY = "selk-save-nudged", saveToast = null;
  function dismissSaveToast() {
    if (saveToast) {
      saveToast.remove(); saveToast = null;
    }
  }
  function nudged() {
    try {
      return sessionStorage.getItem(NUDGED_KEY) === "1";
    } catch (e) {
      return true;
    }
  }
  function markNudged() {
    try {
      sessionStorage.setItem(NUDGED_KEY, "1");
    } catch (e) {}
  }
  function showSaveToast() {
    markNudged();
    var t = el("div", "mail-toast save-toast");
    t.setAttribute("role", "alert");
    var h = el("div", "mail-toast-head");
    var lead = el("span", "mail-toast-lead");
    lead.appendChild(el("span", "mail-toast-tag", S.t("[TAB ONLY]")));
    lead.appendChild(el("span", "", S.t("SAVED DATA")));
    h.appendChild(lead);
    t.appendChild(h);
    t.appendChild(el("div", "mail-toast-body", S.t("Your progress is saved in this browser tab only. Closing the tab erases it. Keep it on this computer to continue another day.")));
    var acts = el("div", "mail-toast-actions");
    var keep = el("button", "btn primary", S.t("KEEP ON THIS COMPUTER")); keep.type = "button"; keep.dataset.sound = "action";
    keep.addEventListener("click", function (e) {
      e.stopPropagation(); dismissSaveToast();
      if (S.setSaveLocal(true)) {
        S.snd.ok(); S.msg(S.t("Progress is now kept on this computer."), "ok");
      } else {
        S.snd.error(); S.msg(S.t("This browser does not allow saving on this computer."), "err");
      }
      S.status();
    });
    var later = el("button", "btn", S.t("NOT NOW")); later.type = "button"; later.dataset.sound = "close";
    later.addEventListener("click", function (e) {
      e.stopPropagation(); dismissSaveToast();
    });
    acts.appendChild(keep); acts.appendChild(later);
    t.appendChild(acts);
    var host = S.notificationHost && S.notificationHost();
    if (host) {
      host.appendChild(t);
    }
    saveToast = t;
  }
  /* THIS COMPUTER and Wipe data on refresh conflict: the wipe erases the
     localStorage save on the next load. Setup and the Storage page show this
     note while both are on. */
  function saveConflict() {
    return S.saveLocal() && wipeOn();
  }
  function conflictNote() {
    var n = el("div", "set-warn");
    n.appendChild(el("p", "", S.t("These options are incompatible. Save location THIS COMPUTER keeps the game in localStorage, and Wipe data on refresh erases that localStorage save when you leave or reload the page.")));
    n.appendChild(el("p", "", S.t("Wipe data on refresh takes priority, so every visit starts a new game.")));
    n.setAttribute("role", "note");
    return n;
  }
  S.afterSave = function (changed) {
    if (changed && S.status) {
      S.status();
    }
  };
  var closePending = false;
  function offerSaveAfterCancelledClose() {
    if (!closePending) { return; }
    closePending = false;
    if (!document.hidden && !S.leaving && !S.saveLocal() && !wipeOn() && S.state.name && S.hasProgress() && !nudged()) {
      showSaveToast();
    }
  }
  window.addEventListener("focus", offerSaveAfterCancelledClose);
  document.addEventListener("visibilitychange", offerSaveAfterCancelledClose);
  window.addEventListener("beforeunload", function (e) {
    if (S.leaving || S.saveLocal() || wipeOn() || !S.hasProgress()) {
      return;
    }
    try {
      if (!sessionStorage.getItem(S.KEY)) {
        return;
      }
    } catch (x) {
      return;
    }
    closePending = true;
    /* The browser's leave prompt cannot be customized. If the player cancels
       it, the in-game save choice is offered when the page has the focus
       again. */
    setTimeout(offerSaveAfterCancelledClose, 250);
    e.preventDefault(); e.returnValue = "";
  });
  S.savePrompt = {
    wipeOn: wipeOn, confirmTabOnly: confirmTabOnly, dismissToast: dismissSaveToast,
    saveConflict: saveConflict, conflictNote: conflictNote
  };
})();
