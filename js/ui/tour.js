/* Guided tour: SIMPLE and TECHNICAL steps, spotlight and panel. */
(function () {
  var S = window.SELK, el = S.el;
  /* Tutorial */
  /* Two tours with the same steps. SIMPLE explains in plain words for players who
     have never used a terminal; TECHNICAL is shorter and uses terminal terms.
     Each step is a list of short paragraphs, "on" names the game event that
     completes it, and "spot" is what gets outlined on screen. */
  function STEPS() {
    var d = S.isDesktop(), m = S.tmux.mobile();
    var tech = !!(S.state.tut && S.state.tut.kind === "technical");
    var SPOT = {
      files: d ? ".wb-group:first-child .wb-icon:first-child, .wb-win .wb-icon" : m ? '.tmux-win[data-win="FILES"]' : ".mc",
      view: d ? ".wb-win .viewer" : ".viewer",
      mail: d ? "#wb-mail, .mrow" : m ? '.tmux-win[data-win="MAIL"], .mrow' : '.fbar [data-f="2"], .mrow',
      report: d ? ".wb-group:first-child .wb-icon:nth-child(2)" : m ? '.tmux-win[data-win="REPORT"]' : '.fbar [data-f="5"]',
      blank: ".paper .blank:not(.filled)",
      submit: ".paper-btn, .paper .blank:not(.filled)"
    };
    if (tech) {
      return [
        { t: ["Selk is a database investigation game. You answer report pages from the audit office with the names of database entries.", "This tour covers the windows, mail, reports and the useful shortcuts."] },
        { t: d ? ["Open the SELK disk, then the HOME drawer, then README.", "Windows move by their title bar and resize from the lower right corner."] : m ? ["Tap FILES, then tap HOME and README to open the record."] : ["FILES is a two-panel explorer: sections on the left, entries on the right.", "Arrow keys move, Enter opens, Tab switches panels. Open HOME / README."], on: "open:home/README", action: "files", spot: SPOT.files },
        { t: ["Mail arrives with a delay, like a real signal from Earth.", m ? "Tap MAIL, then tap MSG 001 to read it." : "Open MAIL (F2 or Alt+M) and read MSG 001."], on: "mail-read", action: "mail", spot: SPOT.mail },
        { t: ["Open REPORT (F5 or Alt+R).", m ? "Tap a blank to select it." : d ? "It opens as its own window." : "It splits in beside VIEW, and closes from its header or the pane context menu."], on: "report-open", action: "report", spot: SPOT.report },
        { t: [m ? "Tap a blank, open FILES, then select SITE / SELK and tap USE THIS RECORD FOR BLANK." : "Fill a blank in one of three ways: drag an entry by its grip; select a blank, highlight an entry in FILES and press F4; or right-click an entry (Shift+F10 on the keyboard) and choose a blank.", m ? "The bottom tabs switch between REPORT and FILES." : "The shell accepts {fill} 1 site/SELK as well."], on: "fill", action: "files", spot: SPOT.blank },
        { t: ["Submit with SUBMIT PAGE, Alt+K or the {submit} command.", "A wrong page tells you how many answers match, never which ones."], on: "submit", action: "report", spot: SPOT.submit },
        { t: ["Panes: Ctrl+B, then O cycles, Z zooms and unzooms, digits switch windows. The shell pops out into its own window from its header.", "Setup (Alt+P) holds hints, text speed, motion, the debug log and more. Replay a tour from HOME / TUTORIAL."], last: true }
      ];
    }
    return [
      { t: ["Welcome. You look after a research base on Titan, the largest moon of Saturn.", "The tall tower at the base is failing, and people on Earth want to know why. You find the answers in the records on this computer.", "This tour shows you how, one small step at a time. Press NEXT to begin."] },
      { t: d ? ["The records are kept like folders in a cabinet.", "Open the SELK disk (the icon at the top right), then HOME, then README."] : m ? ["Tap FILES in the top tab row.", "Then tap HOME and README to open the first record."] : ["The list on the left works like a filing cabinet.", "Click HOME, then click README. Your arrow keys and Enter work too."], on: "open:home/README", action: "files", spot: SPOT.files },
      { t: ["The record opens in the reading area.", "Words with a dotted line under them open a short explanation when you click them.", "Read the record, then press NEXT."], spot: SPOT.view },
      { t: ["Earth has sent you a message.", m ? "Tap MAIL in the top tab row, then tap the message. It may take a few seconds to arrive." : d ? "Click MAIL at the top of the screen, then click the message to read it. Messages take a few seconds to arrive." : "Click MAIL at the bottom of the screen, then click the message to read it. Messages take a few seconds to arrive."], on: "mail-read", action: "mail", spot: SPOT.mail },
      { t: ["The message asks you to fill in a report: a short form with four gaps.", m ? "Tap REPORT in the top tab row, then tap a blank." : d ? "Click REPORT on the right to open it." : "Click REPORT at the bottom to open it."], on: "report-open", action: "report", spot: SPOT.report },
      { t: ["Each gap needs the name of one record.", m ? "Tap a blank, switch to FILES, select SITE / SELK, then tap USE THIS RECORD FOR BLANK." : "The simplest way: click a gap, then open the record in the list and click the button USE FOR BLANK. You can also drag a record onto a gap.", m ? "The bottom tabs switch between REPORT and FILES." : "Try gap 1 with the record SITE / SELK."], on: "fill", action: "files", spot: SPOT.blank },
      { t: ["Fill the other three gaps the same way. If you pick the wrong record, click the small x next to it.", "When all four are filled, click SUBMIT PAGE. If an answer is wrong, the page stays open so you can try again."], on: "submit", action: "report", spot: SPOT.submit },
      { t: ["That is the whole game: read records, fill in the report, send it to Earth.", "If you get stuck, SETUP can switch on hints. You can replay this tour from TUTORIAL in HOME."], last: true }
    ];
  }
  /* Spotlight: outline the thing the current step asks for */
  var spotSel = null;
  function clearSpot() { document.querySelectorAll(".tut-spot").forEach(function (n) { n.classList.remove("tut-spot"); }); }
  function spotTarget() {
    if (!spotSel) { return null; }
    return [].filter.call(document.querySelectorAll(spotSel), function (x) { return x.offsetParent; })[0] || null;
  }
  function applySpot() {
    clearSpot();
    if (!spotSel || !S.state.tut || !S.state.tut.on) { return; }
    var n = spotTarget();
    if (n) { n.classList.add("tut-spot"); }
  }
  function positionMobileTour() {
    var screen = document.getElementById("screen"), host = screen && screen.querySelector(".notification-stack");
    if (!host) { return; }
    if (!S.state.tut || !S.state.tut.on) {
      host.classList.remove("tut-mobile-top", "tut-mobile-bottom");
      return;
    }
    var mobile = S.tmux.mobile(), target = spotTarget();
    var top = true;
    if (mobile && target && screen) {
      var sr = screen.getBoundingClientRect(), tr = target.getBoundingClientRect();
      top = tr.top + tr.height / 2 > sr.top + sr.height / 2;
    }
    host.classList.toggle("tut-mobile-top", mobile && top);
    host.classList.toggle("tut-mobile-bottom", mobile && !top);
  }
  /* On a narrow screen the panel can be rolled up to its header line, so it
     stops covering the pane underneath. The choice is kept for the whole tour. */
  function applyRoll() {
    if (!panel) { return; }
    var st = S.state.tut, rolled = !!(st && st.rolled) && S.tmux.mobile();
    panel.classList.toggle("rolled", rolled);
    var btn = panel.querySelector(".tut-roll");
    if (btn) {
      btn.textContent = S.t(rolled ? "SHOW" : "HIDE");
      btn.setAttribute("aria-expanded", rolled ? "false" : "true");
    }
  }
  function toggleRoll() {
    var st = S.state.tut;
    if (!st || !st.on || !S.tmux.mobile()) { return; }
    st.rolled = !st.rolled; S.save(); S.snd.tick();
    applyRoll(); positionMobileTour();
  }
  setInterval(function () { applySpot(); applyRoll(); positionMobileTour(); }, 700);
  var panel = null;
  function satisfied(on) {
    var st = S.state, reps = Object.keys(st.reports).map(function (k) {
      return st.reports[k];
    });
    if (!on) {
      return false;
    }
    if (on.indexOf("open:") === 0) {
      return st.read.indexOf(on.slice(5)) !== -1;
    }
    if (on === "mail-read") {
      return st.mail.some(function (m) {
        return m.read;
      });
    }
    if (on === "fill") {
      return reps.some(function (r) {
        return r.fill.some(Boolean);
      });
    }
    if (on === "submit") {
      return reps.some(function (r) {
        return r.done;
      });
    }
    return false;
  }
  /* The panel is one element kept for the whole tour. Each draw refills it and
     puts it first in the notification stack, so mail toasts always land beside
     it and never above it, and a button press never moves it. */
  function draw() {
    var st = S.state.tut;
    if (!st || !st.on) {
      if (panel) { panel.remove(); panel = null; }
      spotSel = null; clearSpot();
      return;
    }
    var steps = STEPS();
    while (st.step > 0 && steps[st.step] && satisfied(steps[st.step].on)) {
      st.step++;
    }
    S.save();
    var s = steps[st.step];
    spotSel = s ? s.spot || null : null;
    applySpot();
    if (!s) {
      st.on = false; S.save();
      if (panel) { panel.remove(); panel = null; }
      return;
    }
    if (!panel) {
      panel = el("div", "tut"); panel.setAttribute("role", "region"); panel.setAttribute("aria-label", S.t("Interactive tutorial")); panel.setAttribute("aria-live", "polite");
    }
    panel.textContent = "";
    var bar = el("div", "tut-bar");
    bar.appendChild(el("div", "tut-head", S.t("TOUR, STEP {n} OF {total}", { n: st.step + 1, total: steps.length })));
    var roll = el("button", "btn tut-roll"); roll.type = "button"; roll.setAttribute("aria-controls", "tut-body");
    bar.appendChild(roll);
    bar.addEventListener("click", toggleRoll);
    panel.appendChild(bar);
    var body = el("div", "tut-body"); body.id = "tut-body";
    panel.appendChild(body);
    [].concat(s.t).forEach(function (para) { body.appendChild(el("p", "", S.tc(para))); });
    var row = el("div", "tut-btns");
    if (s.action) {
      var actions = {
        files: {
          label: "GO TO FILES",
          run: function () {
            S.ui.open("FILES");
          }
        },
        mail: {
          label: "OPEN MAIL",
          run: function () {
            S.run("mail", false);
          }
        },
        report: {
          label: "OPEN REPORT",
          run: function () {
            S.run("report", false);
          }
        }
      };
      var action = actions[s.action], go = el("button", "btn primary", S.t(action.label)); go.type = "button";
      go.addEventListener("click", action.run); row.appendChild(go);
    }
    var next = el("button", "btn", S.t(s.last ? "FINISH" : s.on ? "DO THE TASK" : "NEXT")); next.type = "button";
    next.disabled = !!s.on;
    next.addEventListener("click", function () {
      S.tut.next();
    });
    var skip = el("button", "btn", S.t("END TOUR")); skip.type = "button";
    skip.addEventListener("click", function () {
      S.tut.stop();
    });
    row.appendChild(next); if (!s.last) {
      row.appendChild(skip);
    }
    body.appendChild(row);
    applyRoll();
    var host = S.notificationHost && S.notificationHost();
    if (host && (panel.parentNode !== host || host.firstChild !== panel)) {
      host.insertBefore(panel, host.firstChild);
    }
    positionMobileTour();
  }
  S.tut = {
    /* start("simple") or start("technical"); without a kind, ask which tour. */
    start: function (kind) {
      if (kind !== "simple" && kind !== "technical") { S.tut.choose(); return; }
      S.state.tut = {
        on: true,
        step: 0,
        kind: kind
      }; S.save(); draw(); S.snd.chime();
    },
    stop: function () {
      S.state.tut = {
        on: false,
        step: 0
      }; S.save(); draw();
    },
    next: function () {
      var st = S.state.tut; if (!st) {
        return;
      }
      st.step++; if (st.step >= STEPS().length) {
        st.on = false;
      }
      S.save(); S.snd.tick(); draw();
    },
    event: function (name) {
      var st = S.state.tut; if (!st || !st.on) {
        return;
      }
      var steps = STEPS();
      for (var j = st.step; j < steps.length; j++) {
        if (steps[j].on === name) {
          st.step = j; S.tut.next(); return;
        }
      }
    },
    redraw: draw,
    choose: function () {
      S.dialog({
        title: "WHICH TOUR?",
        text: "SIMPLE explains everything in plain words, for players new to this kind of screen. TECHNICAL is shorter and uses terminal terms such as panes, the shell and keyboard shortcuts.",
        buttons: [
          { label: "SIMPLE TOUR", action: function () { setTimeout(function () { S.tut.start("simple"); }, 0); } },
          { label: "TECHNICAL TOUR", action: function () { setTimeout(function () { S.tut.start("technical"); }, 0); } },
          { label: "CANCEL" }
        ]
      });
    },
    offer: function () {
      S.dialog( {
        title: "WELCOME",
        text: "Take the interactive tour? SIMPLE explains everything in plain words. TECHNICAL is shorter and uses terminal terms such as panes, the shell and keyboard shortcuts.",
        buttons: [
          {
            label: "SIMPLE TOUR",
            action: function () {
              setTimeout(function () { S.tut.start("simple"); }, 0);
            }
          },
          {
            label: "TECHNICAL TOUR",
            action: function () {
              setTimeout(function () { S.tut.start("technical"); }, 0);
            }
          },
          {
            label: "NO THANKS"
          }
        ]
      });
    }
  };  /* The tour listens to game events instead of being called from other files */
  S.on("*", function (name) { S.tut.event(name); });
})();
