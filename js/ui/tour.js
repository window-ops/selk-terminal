/* Guided tour: SIMPLE and TECHNICAL steps, the refresher, spotlight and panel. */
(function () {
  var S = window.SELK, el = S.el;
  /* Tutorial */
  /* Two tours with the same steps. SIMPLE uses plain words for players new to
     terminals; TECHNICAL is shorter and uses terminal terms. Each step is a
     list of short paragraphs; "on" names the game event that completes it,
     and "spot" is what gets outlined. A step with no "on" is only read, and
     NEXT passes it.

     The refresher (REFRESH below) is the short version for a player who has
     already played: four cards, no tasks and no waiting. S.tut.refresher
     starts it, and that is what TUTORIAL, Alt+T and the tutorial command
     run.

     Both lists describe the interface the player is actually in front of.
     "sit" collects what that is: the desktop windows or the tmux panes, one
     window per screen in the SINGLE layout and on every narrow screen,
     keyboard shortcuts only where a keyboard has been used (S.ctx().keys),
     and dragging only where a mouse or pen can drag (S.canDrag). */
  function sit() {
    var c = S.ctx();
    return {
      desktop: c.desktop,
      mobile: c.mobile,
      keys: c.keys,
      drag: S.canDrag(),
      /* One window at a time, so no pane ever sits beside another */
      solo: !c.desktop && (c.mobile || S.state.settings.layout === "single"),
      tech: !!(S.state.tut && S.state.tut.kind === "technical")
    };
  }
  function spots(w) {
    var d = w.desktop, m = w.mobile;
    return {
      files: d ? ".wb-group:first-child .wb-icon:first-child, .wb-win .wb-icon" : m ? '.tmux-win[data-win="FILES"]' : ".mc",
      view: d ? ".wb-win .viewer" : ".viewer",
      mail: d ? "#wb-mail, .mrow" : m ? '.tmux-win[data-win="MAIL"], .mrow' : '.fbar [data-f="2"], .mrow',
      report: d ? ".wb-group:first-child .wb-icon:nth-child(2)" : m ? '.tmux-win[data-win="REPORT"]' : '.fbar [data-f="5"]',
      blank: ".paper .blank:not(.filled)",
      submit: ".paper-btn, .paper .blank:not(.filled)"
    };
  }
  /* Getting from one window to another. Every interface answers this
     differently, and the tour's last card and the refresher both end on it. */
  function moving(w) {
    if (w.desktop) {
      return w.keys ?
        "Windows move by their title bar and resize from the lower right corner. The gadget at the left of a title bar closes one, and Alt+D returns to tmux mode." :
        "Windows move by their title bar and resize from the lower right corner. The gadget at the left of a title bar closes one.";
    }
    if (w.mobile) { return "The tab row at the top switches between windows."; }
    if (!w.tech) {
      return w.solo ? "Each window fills the screen; the buttons at the bottom switch between them." :
        "The screen is divided into areas. Click an area to work in it.";
    }
    if (w.solo) { return "Each window fills the screen. The bar at the bottom switches between them, and so does Ctrl+B then a digit."; }
    return "Panes: Ctrl+B, then O cycles, Z zooms and unzooms, digits switch windows. The shell pops out into its own window from its header. Drag the line between two panes to resize them.";
  }
  function setupLine(w) {
    return w.keys ?
      "Setup (Alt+P) has hints, text speed, motion, the debug log and more. Replay this as a refresher from HOME / TUTORIAL." :
      "SETUP has hints, text speed, motion, the debug log and more. Replay this as a refresher from HOME / TUTORIAL.";
  }
  /* The ways a blank can be filled, named for the devices in use */
  function fillWays(w) {
    if (w.mobile) { return "Tap a blank, open FILES, then select SITE / SELK and tap USE THIS RECORD FOR BLANK."; }
    if (w.drag) {
      return w.keys ?
        "Fill a blank in one of three ways: drag an entry by its grip; select a blank, highlight an entry in FILES and press F4; or right-click an entry (Shift+F10 on the keyboard) and choose a blank." :
        "Fill a blank in one of three ways: drag an entry by its grip; select a blank, highlight an entry in FILES and click USE; or open an entry's menu and choose a blank.";
    }
    return w.keys ?
      "Fill a blank in one of two ways: select a blank, highlight an entry in FILES and press F4; or right-click an entry (Shift+F10 on the keyboard) and choose a blank." :
      "Fill a blank in one of two ways: select a blank, highlight an entry in FILES and click USE; or open an entry's menu and choose a blank.";
  }
  function STEPS() {
    var w = sit(), SPOT = spots(w);
    if (w.tech) {
      return [
        { t: ["Selk is a database investigation game. You answer report pages from the audit office with the names of database entries.", "This tour covers the windows, mail, reports and the useful shortcuts."] },
        { t: w.desktop ? ["Open the SELK disk, then the HOME drawer, then README.", "Windows move by their title bar and resize from the lower right corner."] :
          w.mobile ? ["Tap FILES, then tap HOME and README to open the record."] :
            ["FILES is a two-panel explorer: sections on the left, entries on the right.",
              w.keys ? "Arrow keys move, Enter opens, Tab switches panels. Open HOME / README." : "Click HOME, then click README."],
        on: "open:home/README", action: "files", spot: SPOT.files },
        { t: ["Mail arrives with a delay, like a real signal from Earth.",
          w.mobile ? "Tap MAIL, then tap MSG 001 to read it." :
            w.desktop ? (w.keys ? "Open MAIL (F2 or Alt+M) and read MSG 001. The message opens in its own MESSAGE window." : "Open MAIL and read MSG 001. The message opens in its own MESSAGE window.") :
              w.solo ? (w.keys ? "Open MAIL (F2 or Alt+M) and read MSG 001. It opens in MESSAGE, under the inbox." : "Open MAIL and read MSG 001. It opens in MESSAGE, under the inbox.") :
                (w.keys ? "Open MAIL (F2 or Alt+M) and read MSG 001. It opens in MESSAGE, beside the inbox." : "Open MAIL and read MSG 001. It opens in MESSAGE, beside the inbox.")],
        on: "mail-read", action: "mail", spot: SPOT.mail },
        { t: [w.keys ? "Open REPORT (F5 or Alt+R)." : "Open REPORT.",
          w.mobile ? "Tap a blank to select it." :
            w.desktop ? "It opens as its own window." :
              w.solo ? "It opens as a window of its own, and the bar at the bottom switches back." :
                "It splits in beside VIEW, and closes from its header or the pane context menu."],
        on: "report-open", action: "report", spot: SPOT.report },
        { t: w.mobile ? [fillWays(w), "The bottom tabs switch between REPORT and FILES."] :
          w.solo ? [fillWays(w), "The bar at the bottom switches between REPORT and FILES.", "The shell accepts {fill} 1 site/SELK as well."] :
            [fillWays(w), "The shell accepts {fill} 1 site/SELK as well."],
        on: "fill", action: "files", spot: SPOT.blank },
        { t: [w.keys ? "Submit with SUBMIT PAGE, Alt+K or the {submit} command." : "Submit with SUBMIT PAGE or the {submit} command.",
          "A wrong page tells you how many answers match, never which ones."],
        on: "submit", action: "report", spot: SPOT.submit },
        { t: [moving(w), setupLine(w)], last: true }
      ];
    }
    return [
      { t: ["Welcome. You look after a research base on Titan, the largest moon of Saturn.", "The tall tower at the base is failing, and people on Earth want to know why. You find the answers in the records on this computer.", "This tour shows you how, one small step at a time. Press NEXT to begin."] },
      { t: w.desktop ? ["The records are kept like folders in a cabinet.", "Open the SELK disk (the icon at the top right), then HOME, then README."] :
        w.mobile ? ["Tap FILES in the top tab row.", "Then tap HOME and README to open the first record."] :
          w.keys ? ["The list on the left works like a filing cabinet.", "Click HOME, then click README. Your arrow keys and Enter work too."] :
            ["The list on the left works like a filing cabinet.", "Click HOME, then click README."],
      on: "open:home/README", action: "files", spot: SPOT.files },
      { t: ["The record opens in the reading area.", "Words with a dotted line under them open a short explanation when you click them.", "Read the record, then press NEXT."], spot: SPOT.view },
      { t: ["Earth has sent you a message.",
        w.mobile ? "Tap MAIL in the top tab row, then tap the message. It may take a few seconds to arrive." :
          w.desktop ? "Click MAIL at the top of the screen, then click the message to read it. Messages take a few seconds to arrive." :
            "Click MAIL at the bottom of the screen, then click the message to read it. Messages take a few seconds to arrive."],
      on: "mail-read", action: "mail", spot: SPOT.mail },
      { t: ["The message asks you to fill in a report: a short form with four gaps.",
        w.mobile ? "Tap REPORT in the top tab row, then tap a blank." :
          w.desktop ? "Click REPORT on the right to open it." : "Click REPORT at the bottom to open it."],
      on: "report-open", action: "report", spot: SPOT.report },
      { t: w.mobile ? ["Each gap needs the name of one record.", "Tap a blank, switch to FILES, select SITE / SELK, then tap USE THIS RECORD FOR BLANK.", "The bottom tabs switch between REPORT and FILES."] :
        w.drag ? ["Each gap needs the name of one record.", "The simplest way: click a gap, then open the record in the list and click the button USE FOR BLANK.", "You can also drag a record onto a gap.", "Try gap 1 with the record SITE / SELK."] :
          ["Each gap needs the name of one record.", "The simplest way: click a gap, then open the record in the list and click the button USE FOR BLANK.", "Try gap 1 with the record SITE / SELK."],
      on: "fill", action: "files", spot: SPOT.blank },
      { t: ["Fill the other three gaps the same way. If you pick the wrong record, click the small x next to it.", "When all four are filled, click SUBMIT PAGE. If an answer is wrong, the page stays open so you can try again."], on: "submit", action: "report", spot: SPOT.submit },
      { t: ["That is the whole game: read records, fill in the report, send it to Earth.", "If you get stuck, SETUP can switch on hints. You can replay this as a refresher from TUTORIAL in HOME."], last: true }
    ];
  }
  /* The refresher. No tasks and no waiting, so no step names an "on"; the
     spotlight still outlines what each card talks about. The first card
     offers the full tour, for a player who never took it. */
  function REFRESH() {
    var w = sit(), SPOT = spots(w);
    if (w.tech) {
      return [
        { t: ["A refresher in four cards, with the tour's tasks left out.", "You answer report pages from the audit office with the names of database entries, and the records are in FILES."], spot: SPOT.files, full: true },
        { t: ["Mail from AUDIT DESK 4 arrives with a delay and opens in MESSAGE.",
          w.keys ? "MAIL is F2 or Alt+M, REPORT is F5 or Alt+R." : "MAIL and REPORT are in the bar."], spot: SPOT.mail },
        { t: [fillWays(w),
          w.keys ? "Submit with SUBMIT PAGE, Alt+K or the {submit} command. A wrong page tells you how many answers match, never which ones." : "Submit with SUBMIT PAGE or the {submit} command. A wrong page tells you how many answers match, never which ones."], spot: SPOT.report },
        { t: [moving(w), setupLine(w)], last: true }
      ];
    }
    return [
      { t: ["A short reminder of how the game works, in four cards. Press NEXT to move through them.", "Every answer is the name of one record, and the records are kept in FILES."], spot: SPOT.files, full: true },
      { t: ["Earth sends you messages. Each one takes a few seconds to arrive, then waits for you in MAIL."], spot: SPOT.mail },
      { t: ["A report is a form with gaps. Click a gap, open a record, then click USE FOR BLANK.",
        "When every gap is full, click SUBMIT PAGE. If an answer is wrong, the page stays open so you can try again."], spot: SPOT.report },
      { t: [moving(w), "If you get stuck, SETUP can switch on hints."], last: true }
    ];
  }
  function refreshing() {
    return !!(S.state.tut && S.state.tut.refresh);
  }
  function list() {
    return refreshing() ? REFRESH() : STEPS();
  }
  /* The steps name windows and panes, so they read correctly only from a
     known starting point, and every start puts the workspace there.

     Desktop mode: the bare desk. The first step asks the player to open the
     SELK disk, so every window is closed first, the disk included. READER
     stays, since at the first sign-in it is showing HOME / README and the
     tour's next card asks the player to read it.

     tmux mode: the window that contains FILES, unzoomed, with FILES as the
     active pane. That window is DESK in the FOUR PANES and THREE PANES
     layouts and the FILES window in SINGLE and on narrow screens, and
     T.goto brings FILES back when a shell-only DESK has hidden it. SHELL is
     the fallback, since every layout has it. */
  function prepare() {
    var T = S.tmux;
    if (!T.attached) { return; }
    if (S.isDesktop()) {
      S.desk.wins.slice().forEach(function (win) {
        if (win.kind !== "VIEW") { S.desk.close(win); }
      });
      return;
    }
    if (T.zoom) { T.zoomToggle(); }
    if (!T.goto("FILES")) { T.goto("SHELL"); }
  }
  /* Spotlight: outline what the current step asks for */
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
  /* On a narrow screen the panel rolls up to its header line, so it leaves
     the pane below visible. The choice lasts for the whole tour. */
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
  /* The panel is one element for the whole tour. Each draw refills it and
     puts it first in the notification stack, so mail toasts appear beside it
     and a button press does not move it. */
  function draw() {
    var st = S.state.tut;
    if (!st || !st.on) {
      if (panel) { panel.remove(); panel = null; }
      spotSel = null; clearSpot();
      return;
    }
    var steps = list();
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
      panel = el("div", "tut"); panel.setAttribute("role", "region"); panel.setAttribute("aria-live", "polite");
    }
    panel.setAttribute("aria-label", S.t(st.refresh ? "Tutorial refresher" : "Interactive tutorial"));
    panel.textContent = "";
    var bar = el("div", "tut-bar");
    bar.appendChild(el("div", "tut-head", S.t(st.refresh ? "REFRESHER, CARD {n} OF {total}" : "TOUR, STEP {n} OF {total}", { n: st.step + 1, total: steps.length })));
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
            S.runClick("mail", false);
          }
        },
        report: {
          label: "OPEN REPORT",
          run: function () {
            S.runClick("report", false);
          }
        }
      };
      var action = actions[s.action], go = el("button", "btn primary", S.t(action.label)); go.type = "button";
      go.addEventListener("click", action.run); row.appendChild(go);
    }
    var next = el("button", "btn", S.t(s.last ? "FINISH" : s.on ? "DO THE TASK" : "NEXT")); next.type = "button"; next.dataset.sound = "page";
    next.disabled = !!s.on;
    next.addEventListener("click", function () {
      S.tut.next();
    });
    row.appendChild(next);
    /* The refresher's first card leads to the hands-on tour, for a player who
       turned it down at sign-in */
    if (s.full) {
      var full = el("button", "btn", S.t("FULL TOUR")); full.type = "button";
      full.title = S.t("Take the hands-on tour instead, with its tasks");
      full.setAttribute("aria-label", full.title);
      full.addEventListener("click", function () {
        S.tut.start(st.kind, false);
      });
      row.appendChild(full);
    }
    var skip = el("button", "btn", S.t(st.refresh ? "END REFRESHER" : "END TOUR")); skip.type = "button"; skip.dataset.sound = "close";
    skip.addEventListener("click", function () {
      S.tut.stop();
    });
    if (!s.last) {
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
    /* start("simple") or start("technical"); without a kind, ask which tour.
       The second argument runs the refresher instead of the full tour. */
    start: function (kind, refresh) {
      if (kind !== "simple" && kind !== "technical") { S.tut.choose(!!refresh); return; }
      S.state.tut = {
        on: true,
        step: 0,
        kind: kind,
        refresh: !!refresh
      }; S.save(); prepare(); draw(); S.snd.chime();
    },
    /* What TUTORIAL, Alt+T and the tutorial command run: the short version.
       The kind is asked every time, so a player who took the technical tour
       can read the simple one afterwards. */
    refresher: function () {
      S.tut.choose(true);
    },
    stop: function () {
      var kind = S.state.tut && S.state.tut.kind;
      /* The kind is kept, so a later refresher opens in the same wording */
      S.state.tut = {
        on: false,
        step: 0,
        kind: kind
      }; S.save(); draw();
    },
    next: function () {
      var st = S.state.tut; if (!st) {
        return;
      }
      st.step++; if (st.step >= list().length) {
        st.on = false;
      }
      S.save(); S.snd.tick(); draw();
    },
    event: function (name) {
      var st = S.state.tut; if (!st || !st.on) {
        return;
      }
      var steps = list();
      for (var j = st.step; j < steps.length; j++) {
        if (steps[j].on === name) {
          st.step = j; S.tut.next(); return;
        }
      }
    },
    redraw: draw,
    /* Both kinds are offered every time. The one taken last comes first, so
       it is the button Enter presses, and the other is one click away. */
    choose: function (refresh) {
      var LABEL = {
        simple: refresh ? "SIMPLE REFRESHER" : "SIMPLE TOUR",
        technical: refresh ? "TECHNICAL REFRESHER" : "TECHNICAL TOUR"
      };
      var pick = function (kind) {
        return { label: LABEL[kind], action: function () {
          setTimeout(function () { S.tut.start(kind, refresh); }, 0);
        } };
      };
      var last = S.state.tut && S.state.tut.kind;
      var order = last === "technical" ? ["technical", "simple"] : ["simple", "technical"];
      S.dialog({
        title: refresh ? "WHICH REFRESHER?" : "WHICH TOUR?",
        text: refresh ?
          "SIMPLE uses plain words. TECHNICAL is shorter and uses terminal terms such as panes, the shell and keyboard shortcuts." :
          "SIMPLE explains everything in plain words, for players new to this kind of screen. TECHNICAL is shorter and uses terminal terms such as panes, the shell and keyboard shortcuts.",
        buttons: order.map(pick).concat([{ label: "CANCEL" }])
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
  };  /* Every game event reaches S.tut.event through S.on("*"). A step is
         done when the event named in its "on" field arrives. Game code only
         calls S.emit and has no reference to the tour. */
  S.on("*", function (name) { S.tut.event(name); });
})();
