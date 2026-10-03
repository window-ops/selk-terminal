/* Status bar: the clock, the uplink, the save lamp and the mail count, their
   pop-up details, and the message line (S.msg, S.feedback). */
(function () {
  var S = window.SELK, el = S.el, $ = S.$;
  var statusPrompt = null;
  function positionStatusPrompt() {
    if (!statusPrompt || !statusPrompt._button || !statusPrompt._button.isConnected) { return; }
    var screen = $("screen"), button = statusPrompt._button;
    var sr = screen.getBoundingClientRect(), br = button.getBoundingClientRect();
    var x = br.left - sr.left + br.width / 2 - statusPrompt.offsetWidth / 2;
    var y = br.top - sr.top - statusPrompt.offsetHeight - 8;
    if (y < 4) { y = br.bottom - sr.top + 8; }
    statusPrompt.style.left = Math.max(8, Math.min(sr.width - statusPrompt.offsetWidth - 8, x)) + "px";
    statusPrompt.style.top = Math.max(4, Math.min(sr.height - statusPrompt.offsetHeight - 4, y)) + "px";
  }
  /* Fill a status pop-up: a heading, then one line of detail when given.
     Callers append their own rows. */
  function info(bubble, head, copy) {
    bubble.appendChild(el("strong", "status-info-head", head));
    if (copy) {
      bubble.appendChild(S.speakText(el("div", "status-info-copy"), copy));
    }
  }
  function uplinkInfo(bubble) {
    var up = S.state.pending.length ? "RX" : (S.transmitting ? "TX" : "IDLE");
    info(bubble, S.t("UPLINK") + ": " + S.t(up), S.t({
      IDLE: "No message is being sent or received.",
      RX: "Receiving a message from Earth.",
      TX: "Sending a report to Earth."
    }[up]));
    /* Latest first; the same event recorded twice is shown once */
    var seen = {}, rows = (S.state.uplinkHistory || []).slice().reverse().filter(function (item) {
      var key = item.type + "|" + item.label + "|" + item.t;
      return seen[key] ? false : (seen[key] = true);
    }).slice(0, 5);
    var list = el("div", "status-history");
    if (!rows.length) {
      list.appendChild(el("div", "status-history-empty", S.t("No uplink activity yet.")));
    }
    rows.forEach(function (item) {
      var label = item.type === "sent" ? item.label : S.t("MSG {num}", { num: String(item.label).replace(/^MSG/, "") });
      var row = el("div", "status-history-row");
      row.appendChild(el("span", "status-history-event", S.t(item.type === "sent" ? "Sent {label}" : "Received {label}", { label: label })));
      row.appendChild(el("time", "status-history-time", S.fmtTime(item.t) + " UTC"));
      list.appendChild(row);
    });
    bubble.appendChild(list);
  }
  function storageInfo(bubble) {
    if (S.saveOk === false) {
      info(bubble, S.t("NOT SAVED"), S.t("Progress could not be saved. Browser storage may be unavailable or full."));
    } else if (S.saveLocal()) {
      info(bubble, S.t("SAVED ON THIS COMPUTER"), S.t("Progress, reports, messages and settings stay in this browser."));
    } else {
      info(bubble, S.t("SAVED IN THIS TAB"), S.t("Closing the tab erases progress. Setup > Saved data > Save location keeps it on this computer."));
    }
  }
  function renderStatusPrompt() {
    if (!statusPrompt) { return; }
    var bubble = statusPrompt;
    bubble.replaceChildren();
    (bubble._button.dataset.status === "uplink" ? uplinkInfo : storageInfo)(bubble);
    positionStatusPrompt();
  }
  function closeStatusPrompt(restoreFocus) {
    var opener = statusPrompt && statusPrompt._button;
    if (statusPrompt) { statusPrompt.remove(); statusPrompt = null; }
    ["st-save", "wb-save", "st-uplink", "wb-uplink"].forEach(function (id) {
      var b = $(id); if (b) { b.setAttribute("aria-expanded", "false"); }
    });
    if (restoreFocus && opener && opener.isConnected) { opener.focus({ preventScroll: true }); }
  }
  function toggleStatusPrompt(button) {
    if (statusPrompt && statusPrompt._button === button) { closeStatusPrompt(); return; }
    closeStatusPrompt();
    var screen = $("screen"), bubble = el("div", "status-info-pop");
    bubble.id = "status-info-pop";
    bubble.setAttribute("role", "status");
    bubble._button = button;
    screen.appendChild(bubble);
    statusPrompt = bubble;
    button.setAttribute("aria-expanded", "true");
    renderStatusPrompt();
  }
  S.refreshStatusPrompt = renderStatusPrompt;
  window.addEventListener("resize", positionStatusPrompt);
  $("screen").addEventListener("click", function (e) {
    var button = e.target.closest("[data-status]");
    if (button) { e.stopPropagation(); toggleStatusPrompt(button); }
    else if (!e.target.closest(".status-info-pop")) { closeStatusPrompt(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && statusPrompt) { closeStatusPrompt(true); }
  });
  /* Status line (S.msg). The message sits on a chip tinted from the bar's
     text colour, or the flag colour for an error. A message wider than its
     space scrolls by wheel, drag, or Left, Right, Home and End, with "<" and
     ">" at the ends that hide text.

     The message stays while a mouse or pen pointer is over it or while it has
     the keyboard focus, and clears 3.5 s after that (7 s for a message that
     scrolls). Pointer and focus are read from :hover and :focus-visible every
     400 ms, so a lost pointer event or a hidden bar cannot keep a message on
     screen.

     Setup > Scroll long messages (settings.barScroll) scrolls a long message
     by itself unless motion is reduced. Errors go to the error dialog when
     S.errorsAsDialog() says so. docs/interface.md has the full rules. */
  var msgTimer, MSG_MS = 3500, MSG_LONG_MS = 7000, HOLD_CHECK_MS = 400;
  var AUTO_WAIT_MS = 1000, AUTO_STEP_MS = 110, AUTO_END_MS = 2500;
  /* State of the message: touched after the player used it, autoDone after
     its automatic scroll reached the end */
  var autoTimer = null, touched = false, autoDone = false;
  function stopAuto() {
    clearTimeout(autoTimer); autoTimer = null;
  }
  function autoOn() {
    var c = S.ctx ? S.ctx() : {};
    return !!S.state.settings.barScroll && !S.reduced && !c.sr;
  }
  function overflowing(b) {
    return b.box.classList.contains("over");
  }
  /* The last kind of pointer used. A touch leaves :hover on what it touched,
     so hover counts only for a mouse or a pen. */
  var lastPointer = "mouse";
  document.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType || "mouse"; }, true);
  document.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") { lastPointer = e.pointerType || "mouse"; } }, true);
  function heldNow(b) {
    if (!b.box.isConnected || !b.box.offsetParent || b.box.classList.contains("is-empty")) { return false; }
    var hovered = lastPointer !== "touch" && b.hit.some(function (n) { return n.matches(":hover"); });
    return hovered || b.track.matches(":focus-visible");
  }
  function barParts(box) {
    if (box._bar) { return box._bar; }
    box.textContent = "";
    var left = el("span", "bar-msg-edge bar-msg-l", "<"), right = el("span", "bar-msg-edge bar-msg-r", ">");
    var track = el("span", "bar-msg-track"), chip = el("span", "bar-msg-chip");
    left.setAttribute("aria-hidden", "true"); right.setAttribute("aria-hidden", "true");
    track.appendChild(chip);
    box.appendChild(left); box.appendChild(track); box.appendChild(right);
    box.classList.add("bar-msg", "is-empty");
    var bar = box._bar = { box: box, track: track, chip: chip, hit: [left, track, right] };
    function room() { return track.scrollWidth - track.clientWidth; }
    /* The player uses the message: the automatic scroll stops and the clear
       timer waits until the pointer and the focus leave */
    function take() { touched = true; stopAuto(); schedule(); }
    function by(dx) { take(); track.scrollLeft += dx; }
    left.addEventListener("click", function () { by(-track.clientWidth * 0.8); });
    right.addEventListener("click", function () { by(track.clientWidth * 0.8); });
    track.addEventListener("scroll", function () { edges(bar); });
    track.addEventListener("wheel", function (e) {
      if (room() <= 1) { return; }
      e.preventDefault();
      by(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    }, { passive: false });
    track.addEventListener("pointerdown", function (e) {
      if (room() <= 1 || e.button !== 0) { return; }
      take();
      var x0 = e.clientX, s0 = track.scrollLeft;
      track.classList.add("dragging");
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      function mv(ev) { track.scrollLeft = s0 - (ev.clientX - x0); }
      function up() {
        track.classList.remove("dragging");
        track.removeEventListener("pointermove", mv);
        track.removeEventListener("pointerup", up);
        track.removeEventListener("pointercancel", up);
      }
      track.addEventListener("pointermove", mv);
      track.addEventListener("pointerup", up);
      track.addEventListener("pointercancel", up);
    });
    track.addEventListener("keydown", function (e) {
      var step = { ArrowLeft: -40, ArrowRight: 40 }[e.key];
      if (step) { by(step); }
      else if (e.key === "Home") { take(); track.scrollLeft = 0; }
      else if (e.key === "End") { take(); track.scrollLeft = room(); }
      else { return; }
      e.preventDefault(); e.stopPropagation();
    });
    /* Pointer and focus events only bring the check forward; the state itself
       is read from :hover and :focus-visible (heldNow) */
    bar.hit.forEach(function (n) {
      n.addEventListener("pointerover", function (e) {
        if (e.pointerType !== "touch" && !box.classList.contains("is-empty")) { take(); }
      });
      n.addEventListener("pointerout", function () { schedule(); });
    });
    track.addEventListener("focus", function () { if (track.matches(":focus-visible")) { take(); } });
    track.addEventListener("blur", function () { schedule(); });
    return bar;
  }
  /* Mark which ends have hidden text, and make the message focusable only
     while it has text to scroll to */
  function edges(bar) {
    var t = bar.track, room = t.scrollWidth - t.clientWidth, over = room > 1;
    bar.box.classList.toggle("over", over);
    bar.box.classList.toggle("at-start", t.scrollLeft <= 0);
    bar.box.classList.toggle("at-end", t.scrollLeft >= room - 1);
    if (over) {
      t.tabIndex = 0; t.title = S.t("Scroll with the wheel, by dragging, or with the arrow keys");
    } else {
      t.removeAttribute("tabindex"); t.removeAttribute("title");
    }
  }
  function bars() {
    return [$("tmux-msg"), $("wb-msg")].filter(Boolean).map(barParts);
  }
  function clearBars() {
    var list = bars();
    /* Still under the pointer or focused: keep it and check again */
    if (list.some(heldNow)) { schedule(); return; }
    stopAuto();
    list.forEach(function (b) {
      /* A mouse click can leave the focus on the message; it returns to
         the pane before the message loses its tab stop */
      if (document.activeElement === b.track && S.tmux && S.tmux.focusCur) { S.tmux.focusCur(); }
      b.chip.textContent = ""; b.track.scrollLeft = 0;
      b.box.classList.add("is-empty"); b.box.removeAttribute("data-kind"); edges(b);
    });
  }
  /* Step the visible overflowing message one character to the left until
     its end shows, then call done */
  function autoScroll(done) {
    stopAuto();
    var b = bars().filter(function (x) { return overflowing(x) && x.box.offsetParent; })[0];
    if (!b) { done(); return; }
    var t = b.track, ch = (parseFloat(getComputedStyle(b.chip).fontSize) || 12) * 0.6;
    autoTimer = setTimeout(function step() {
      var room = t.scrollWidth - t.clientWidth;
      if (t.scrollLeft >= room - 1) { autoTimer = null; done(); return; }
      t.scrollLeft = Math.min(room, t.scrollLeft + ch);
      autoTimer = setTimeout(step, AUTO_STEP_MS);
    }, AUTO_WAIT_MS);
  }
  function schedule() {
    clearTimeout(msgTimer);
    var list = bars();
    if (!list.some(function (b) { return !b.box.classList.contains("is-empty"); })) { return; }
    if (list.some(heldNow)) {
      /* Still in use: no clear yet, and another check soon, so the end is
         noticed without a pointer event */
      touched = true; stopAuto();
      msgTimer = setTimeout(schedule, HOLD_CHECK_MS);
      return;
    }
    var long = list.some(overflowing);
    if (long && autoOn() && !touched && !autoDone) {
      autoScroll(function () {
        autoDone = true;
        msgTimer = setTimeout(clearBars, AUTO_END_MS);
      });
      return;
    }
    msgTimer = setTimeout(clearBars, long ? MSG_LONG_MS : MSG_MS);
  }
  S.msg = function (text, cls) {
    text = S.t(text);
    if (cls === "err" && S.errorsAsDialog && S.errorsAsDialog()) {
      S.errorBox(text); return;
    }
    stopAuto(); touched = false; autoDone = false;
    bars().forEach(function (b) {
      b.chip.textContent = text; b.track.scrollLeft = 0;
      b.box.classList.toggle("is-empty", !text);
      b.box.dataset.kind = cls || "info";
      edges(b);
    });
    schedule();
  };
  window.addEventListener("resize", function () { bars().forEach(edges); });
  /* A result line in the shell, repeated on the status line or in the error
     dialog when the shell is out of view. An error from a control other than
     the command line is repeated with the shell in view as well, since the
     player was looking at that control. */
  S.feedback = function (text, cls) {
    S.scr.line(text, cls);
    var typedErr = cls === "err" && S.cmdOrigin === "typed";
    if (!S.tmux.visible("SHELL") || (cls === "err" && !typedErr)) {
      S.msg(text, cls);
    }
  };
  S.clockSec = 0;
  S.clockText = function () {
    var s = S.clockSec; return S.fmtTime(S.state.clock) + ":" + (s < 10 ? "0" : "") + s;
  };
  setInterval(function () {
    S.clockSec++;
    if (S.clockSec >= 60) {
      S.clockSec = 0;
      if (S.tmux.attached) {
        S.tick(1); S.save();
      }
    }
    var c = $("st-clock"); if (c) {
      c.textContent = S.clockText();
    }
    var w = $("wb-clock"); if (w) {
      w.textContent = S.clockText();
    }
    var u = document.getElementById("about-uptime"); if (u) {
      u.textContent = S.uptimeText();
    }
    var k = document.getElementById("about-clock"); if (k) {
      k.textContent = S.clockText() + " UTC";
    }
  }, 1000);
  /* Refresh the status bar: clock, user, uplink, sound, hint light and mail count. */
  S.status = function () {
    var st = S.state;
    $("st-clock").textContent = S.clockText();
    $("st-user").textContent = st.name || "";
    var up = st.pending.length ? "RX" : (S.transmitting ? "TX" : "IDLE");
    $("st-uplink").textContent = S.t("UPLINK") + " " + S.t(up);
    $("st-uplink").classList.toggle("live", up !== "IDLE");
    $("st-uplink").title = S.t("Show uplink status");
    $("st-uplink").setAttribute("aria-label", S.t("Show uplink status"));
    var desktopUplink = $("wb-uplink");
    if (desktopUplink) {
      desktopUplink.textContent = S.t("UPLINK") + " " + S.t(up);
      desktopUplink.classList.toggle("live", up !== "IDLE");
      desktopUplink.title = S.t("Show uplink status");
      desktopUplink.setAttribute("aria-label", S.t("Show uplink status"));
    }
    $("st-sound").textContent = st.sound ? S.t("SOUND ON") : S.t("SOUND OFF");
    $("st-sound").setAttribute("aria-pressed", st.sound ? "true" : "false");
    /* The lamp stays visible so the save location is always shown. */
    var sv = S.saveOk === false ? S.t("NOT SAVED") : (S.saveLocal() ? S.t("SAVED") : S.t("TAB ONLY"));
    ["st-save", "wb-save"].forEach(function (id) {
      var n = $(id); if (n) {
        n.hidden = !sv; n.textContent = sv; n.classList.toggle("fail", S.saveOk === false);
      }
    });
    $("st-hint").hidden = !st.light;
    $("st-hint").classList.toggle("lit", !!S.hintLit);
    var unread = st.mail.filter(function (m) {
      return !m.read;
    }).length;
    if (unread === 0 && S.dismissMailToast) {
      S.dismissMailToast();
    }
    $("st-mail").textContent = unread ? S.t("MAIL") + " " + unread : S.t("MAIL");
    $("st-mail").classList.toggle("live", unread > 0);
    var wc = $("wb-clock"); if (wc) {
      wc.textContent = S.clockText();
    }
    var wm = $("wb-mail"); if (wm) {
      wm.textContent = unread ? S.t("MAIL") + " " + unread : S.t("MAIL"); wm.classList.toggle("live", unread > 0);
    }
    var wh = $("wb-hint"); if (wh) {
      wh.hidden = !st.light; wh.classList.toggle("lit", !!S.hintLit);
    }
    var ws = $("wb-sound"); if (ws) {
      ws.textContent = st.sound ? S.t("SOUND ON") : S.t("SOUND OFF");
    }
    S.refreshStatusPrompt();
  };
})();
