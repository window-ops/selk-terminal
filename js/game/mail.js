/* Mail: queueing, delivery, the new-message toast and reading a message. */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err;
  /* Queue message id and deliver it after ms milliseconds, or after 80 ms in
     Fast mode. A message already queued or delivered is not queued again. */
  /* The text of a delivered message m: the received variant when the office
     already had the other page at delivery, else the body */
  S.mailBody = function (m) {
    var msg = S.MESSAGES[m.id];
    return (m.v === "received" && msg.received) || msg.body;
  };
  S.queueMail = function (id, ms) {
    var st = S.state;
    if (st.pending.indexOf(id) === -1 && !st.mail.some(function (m) {
      return m.id === id;
    })) {
      st.pending.push(id);
    }
    S.save();
    S.status();
    setTimeout(function () {
      S.deliver(id);
    }, S.fast ? 80 : ms);
  };
  var mailToast = null;
  function dismissMailToast() {
    if (mailToast) {
      mailToast.remove(); mailToast = null;
    }
  }
  S.dismissMailToast = dismissMailToast;
  function showMailToast(n) {
    dismissMailToast();
    var num = ("00" + n).slice(-3);
    var t = document.createElement("div");
    t.className = "mail-toast";
    t.setAttribute("role", "alert");
    var h = document.createElement("div");
    h.className = "mail-toast-head";
    /* One label shows the tag and the sender. DISMISS in the button row
       closes the toast, as in every toast. */
    var lead = document.createElement("span");
    lead.className = "mail-toast-lead";
    var tag = document.createElement("span");
    tag.className = "mail-toast-tag blink"; tag.textContent = S.t("[NEW TRANSMISSION]");
    lead.appendChild(tag); lead.appendChild(document.createTextNode(S.t("AUDIT DESK 4")));
    h.appendChild(lead);
    t.appendChild(h);
    var b = document.createElement("div");
    b.className = "mail-toast-body";
    b.textContent = S.t("New message received via relay R-09: MSG {num}", { num: num });
    t.appendChild(b);
    var acts = document.createElement("div");
    acts.className = "mail-toast-actions";
    var readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "btn primary";
    readBtn.dataset.sound = "open";
    readBtn.textContent = S.t("OPEN MSG {num}", { num: num });
    readBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
      S.runClick("mail " + n, false);
    });
    var disBtn = document.createElement("button");
    disBtn.type = "button";
    disBtn.className = "btn";
    disBtn.dataset.sound = "close";
    disBtn.textContent = S.t("DISMISS");
    disBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
    });
    acts.appendChild(readBtn);
    acts.appendChild(disBtn);
    t.appendChild(acts);
    var host = S.notificationHost && S.notificationHost();
    if (!host) {
      return false;
    }
    host.appendChild(t);
    mailToast = t;
    return true;
  }
  /* A reply that arrives right after the "Delivered to Earth" line of a
     transmission continues it: its group loses the gap above, and the group
     with that line loses the gap below. Runs while the notice's group is the
     newest element in the log. */
  function joinDelivered() {
    var log = document.getElementById("log"), g = log && log.lastElementChild;
    if (!g || !g.classList.contains("out-group")) { return; }
    var prev = g.previousElementSibling, line = null;
    if (prev && prev.matches(".ln.count")) { line = prev; }
    else if (prev && prev.classList.contains("out-group") && prev.lastElementChild && prev.lastElementChild.matches(".ln.count")) { line = prev.lastElementChild; }
    if (!line || line.textContent !== S.t("Delivered to Earth")) { return; }
    g.classList.add("after-tx");
    if (prev !== line) { prev.classList.add("before-uplink"); }
  }
  S.deliver = function (id) {
    var st = S.state, i = st.pending.indexOf(id);
    if (i === -1) {
      return;
    }
    st.pending.splice(i, 1);
    if (id !== "MSG001") {
      S.tick(20 + 79);
    }
    /* A message whose text depends on another page records which text the
       office sent (awaits in story.js) */
    var sent = S.MESSAGES[id], other = sent.awaits && st.reports[sent.awaits];
    var entry = {
      id: id,
      t: st.clock,
      read: false
    };
    if (other && other.done) {
      entry.v = "received";
    }
    st.mail.push(entry);
    S.recordUplink("received", id);
    var msg = S.MESSAGES[id];
    (msg.opens || []).forEach(function (k) {
      if (!S.reportReady(k)) {
        return;
      }
      if (!st.reports[k]) {
        st.reports[k] = {
          fill: [
            null,
            null,
            null,
            null
          ],
          done: false
        };
      }
    });
    if (msg.decision) {
      st.decision = true;
    }
    S.save();
    S.status();
    var n = st.mail.length;
    S.snd.chime(); S.snd.hdd(3);
    S.mailpane.render(); S.rep.render();
    /* The toast shows the notice; the status line repeats it only when no
       toast can be shown */
    if (!showMailToast(n)) {
      S.msg(S.ctx().keys ? "New message from AUDIT DESK 4. Press F2 or MAIL." : "New message from AUDIT DESK 4. Press MAIL.", "warn");
    }
    /* The notice has no command line above it, so it gets its own group */
    scr().group(function () {
      scr().node(function () {
        joinDelivered();
        var d = scr().el("div", "ln warn");
        d.appendChild(document.createTextNode(S.t("[uplink] New message from AUDIT DESK 4.") + " "));
        d.appendChild(scr().cmdButton(S.t("READ IT"), "mail " + n, "lnk act"));
        return d;
      }, 0);
    }, "uplink");
  };
  function readMail(n) {
    dismissMailToast();
    var m = S.state.mail[n - 1];
    if (!m) {
      err(S.tc("No message {n}. Type {mail} to list them.", { n: n })); return;
    }
    m.read = true;
    S.save();
    S.status();
    var num = ("00" + n).slice(-3);
    S.emit("mail-read");
    S.mailpane.render();
    S.snd.hdd(2);
    S.showMail(n, "MSG " + num, function () {
      var box = scr().el("div", "mail");
      box.appendChild(S.speakText(scr().el("div", "mail-head"), S.t("AUDIT DESK 4 > SELK SITE    MSG {num}", { num: num }), "to"));
      /* Labels are padded to the longer one, so the times line up in any
         language */
      var lSent = S.t("sent"), lRecv = S.t("received"), w = Math.max(lSent.length, lRecv.length) + 2;
      box.appendChild(scr().el("div", "dim", lSent.padEnd(w) + S.fmtTime(m.t - 79) + " UTC"));
      box.appendChild(scr().el("div", "dim", lRecv.padEnd(w) + S.fmtTime(m.t) + " UTC"));
      var body = S.renderParas(S.mailBody(m), scr().markup);
      body.classList.add("mail-body");
      box.appendChild(body);
      var availableReports = (S.MESSAGES[m.id].opens || []).filter(function (k) {
        return !!S.state.reports[k] && S.reportReady(k);
      });
      if (availableReports.length) {
        var row = scr().el("div", "row");
        availableReports.forEach(function (k) {
          row.appendChild(scr().cmdButton(S.t("OPEN REPORT {code}", { code: S.REPORTS[k].code }), "report " + S.REPORTS[k].code, "lnk act"));
          row.appendChild(document.createTextNode(" "));
        });
        box.appendChild(row);
      }
      if (S.MESSAGES[m.id].decision) {
        box.appendChild(scr().cmdButton(S.t("DECIDE"), "decide", "lnk act"));
      }
      return box;
    });
  }
  K.readMail = readMail;
  /* Show message n. content builds the message element and runs once for each
     place the result goes (S.outShell and S.outWindow in commands.js): the
     shell log, the MESSAGE pane, or both. Messages never open in VIEW. */
  S.showMail = function (n, title, content) {
    var T = S.tmux, toShell = S.outShell();
    /* Shell-only DESK affects FILES, VIEW and REPORT, not MAIL. A message
       clicked in MAIL opens in MESSAGE; typed results follow Shell results
       through S.outShell() and S.outWindow(). */
    if (toShell) {
      var copy = content();
      S.scr.node(function () { return copy; });
    }
    if (!S.outWindow()) {
      return;
    }
    /* A typed command whose result goes to MESSAGE leaves a note in the shell
       when SHELL is out of view afterwards */
    var fromShell = !toShell && !S.isDesktop() && S.cmdOrigin === "typed" && T.visible("SHELL");
    /* In tmux mode MESSAGE is in the MAIL window beside the inbox. In desktop
       mode a message opens the MESSAGE window alone; the inbox window opens
       only for MAIL. */
    if (!S.isDesktop() && !T.visible("MAIL")) { S.ui.open("MAIL"); }
    S.ui.open("MESSAGE");
    S.mailpane.open(n, title, content());
    if (fromShell && !T.visible("SHELL") && S.state.settings.redirectNotes !== false) {
      S.scr.line(S.t("Output redirected to MAIL."), "dim", 0);
    }
  };
})();
