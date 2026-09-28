/* Mail: queueing, delivery, the new-message toast and reading a message. */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err;
  /* Mail */
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
    var tag = document.createElement("span");
    tag.className = "mail-toast-tag blink"; tag.textContent = S.t("[NEW TRANSMISSION]");
    h.appendChild(tag); h.appendChild(document.createTextNode(" AUDIT DESK 4"));
    var close = document.createElement("button");
    close.type = "button";
    close.className = "mail-toast-close";
    close.textContent = "×";
    close.title = S.t("Dismiss");
    close.setAttribute("aria-label", S.t("Dismiss notification"));
    close.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
    });
    h.appendChild(close);
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
    readBtn.textContent = S.t("OPEN MSG {num}", { num: num });
    readBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
      S.run("mail " + n, false);
    });
    var disBtn = document.createElement("button");
    disBtn.type = "button";
    disBtn.className = "btn";
    disBtn.textContent = S.t("DISMISS");
    disBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissMailToast();
    });
    acts.appendChild(readBtn);
    acts.appendChild(disBtn);
    t.appendChild(acts);
    var host = S.notificationHost && S.notificationHost();
    if (host) {
      host.appendChild(t);
    }
    mailToast = t;
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
    st.mail.push( {
      id: id,
      t: st.clock,
      read: false
    });
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
    S.msg(S.t("New message from AUDIT DESK 4. Press F2 or MAIL."), "warn");
    showMailToast(n);
    scr().node(function () {
      var d = scr().el("div", "ln warn");
      d.appendChild(document.createTextNode(S.t("[uplink] New message from AUDIT DESK 4.") + " "));
      d.appendChild(scr().cmdButton(S.t("READ IT"), "mail " + n, "lnk act"));
      return d;
    }, 0);
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
    S.display("MSG " + num, (function () {
      var box = scr().el("div", "mail");
      box.appendChild(scr().el("div", "mail-head", S.t("AUDIT DESK 4 > SELK SITE    MSG {num}", { num: num })));
      /* Labels are padded to the longer one, so the times line up in any language */
      var lSent = S.t("sent"), lRecv = S.t("received"), w = Math.max(lSent.length, lRecv.length) + 2;
      box.appendChild(scr().el("div", "dim", lSent.padEnd(w) + S.fmtTime(m.t - 79) + " UTC"));
      box.appendChild(scr().el("div", "dim", lRecv.padEnd(w) + S.fmtTime(m.t) + " UTC"));
      var body = S.renderParas(S.MESSAGES[m.id].body, scr().markup);
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
    })());
  }
  K.readMail = readMail;
})();
