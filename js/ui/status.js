/* Status bar: the clock, uplink, save lamp and mail count, their pop-up
   details, and the message line (S.msg, S.feedback). */
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
  /* One heading, one line of detail, then any rows. */
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
  var msgTimer;
  /* Status line. Static English text is translated here, so callers can pass it as is */
  S.msg = function (text, cls) {
    text = S.t(text);
    var m = $("tmux-msg"), w = $("wb-msg");
    m.textContent = text; m.className = "tmux-msg " + (cls || "");
    if (w) {
      w.textContent = text; w.className = "wb-msg " + (cls || "");
    }
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      m.textContent = ""; var x = $("wb-msg"); if (x) {
        x.textContent = "";
      }
    }, 3500);
  };
  S.feedback = function (text, cls) {
    S.scr.line(text, cls);
    if (!S.tmux.visible("SHELL")) {
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
    /* Keep the indicator visible so the current save location is always clear. */
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
