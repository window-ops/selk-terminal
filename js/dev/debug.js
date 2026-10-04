/* Debug log. While Setup > Debug > Debug log is on, the game prints to the
   browser console: commands, events, window changes, dialogs, messages, shell
   output, mail, transmissions, saves and settings. It wraps the game's main
   functions from outside and loads after every other script. Filter the
   console by SELK. */
(function () {
  "use strict";
  var S = window.SELK;
  var COLORS = { command: "#C7843A", event: "#6FBF5A", window: "#5E8CC7", dialog: "#B07CC7",
    message: "#D6C396", shell: "#8F9A9A", mail: "#C7843A", uplink: "#C7843A", save: "#8F9A9A",
    settings: "#5E8CC7", error: "#C0604A", mode: "#6FBF5A" };

  function on() { return !!(S.state && S.state.settings && S.state.settings.debugLog); }
  function log(kind) {
    if (!on()) { return; }
    var args = [].slice.call(arguments, 1);
    console.log.apply(console, ["%c[SELK " + kind + "]", "color:" + (COLORS[kind] || "#999") + ";font-weight:bold"].concat(args));
  }
  S.debug = log;

  /* Wrap obj[name] so each call is logged before it runs */
  function watch(obj, name, kind, describe) {
    var f = obj && obj[name];
    if (typeof f !== "function" || f._debugWrapped) { return; }
    var w = function () {
      try { if (on()) { log(kind, describe ? describe.apply(null, arguments) : name, [].slice.call(arguments)); } } catch (e) {}
      return f.apply(this, arguments);
    };
    w._debugWrapped = true;
    obj[name] = w;
  }

  document.addEventListener("DOMContentLoaded", function () {
    watch(S, "run", "command", function (c) { return "run " + JSON.stringify(c); });
    watch(S, "emit", "event", function (n) { return n; });
    watch(S, "msg", "message", function (t, c) { return (c ? c + ": " : "") + t; });
    watch(S, "dialog", "dialog", function (o) { return "open " + (o && o.title); });
    watch(S, "closeDialog", "dialog", function () { return "close"; });
    watch(S, "setMode", "mode", function (m) { return "switch to " + m; });
    watch(S, "applySettings", "settings", function () { return "apply " + JSON.stringify(S.state.settings); });
    watch(S, "deliver", "mail", function (id) { return "delivered " + id; });
    watch(S, "queueMail", "mail", function (id, ms) { return "queued " + id + " in " + ms + " ms"; });
    watch(S, "transmit", "uplink", function (l) { return "transmit " + l; });
    if (S.ui) {
      watch(S.ui, "open", "window", function (k) { return "open " + k; });
      watch(S.ui, "close", "window", function (k) { return "close " + k; });
    }
    if (S.tmux) {
      watch(S.tmux, "render", "window", function () {
        var T = S.tmux, w = T.windows[T.w];
        return "tmux render: " + T.windows.map(function (x, i) { return (i === T.w ? "*" : "") + x.name; }).join(" ") +
          " | pane " + (T.cur && T.cur.kind) + (T.zoom ? " (zoomed)" : "") + (w ? "" : " | no window");
      });
      ["popOutShell", "popInShell", "zoomToggle", "select", "closePane"].forEach(function (n) {
        watch(S.tmux, n, "window", function (a) { return "tmux " + n + (a && a.kind ? " " + a.kind : a != null ? " " + a : ""); });
      });
    }
    if (S.desk) {
      watch(S.desk, "goto", "window", function (k) { return "desktop open " + k; });
      watch(S.desk, "close", "window", function () { return "desktop close window"; });
    }
    if (S.scr) {
      watch(S.scr, "line", "shell", function (t) { return t; });
      watch(S.scr, "type", "shell", function (t) { return t; });
    }
    /* Report where the save went by reading it back from storage */
    var save = S.save, lastSave = 0;
    S.save = function () {
      var ok = save.apply(this, arguments), now = Date.now();
      if (on() && now - lastSave > 2000) {
        lastSave = now;
        var saved = null, where = S.saveLocal() ? "localStorage" : "sessionStorage";
        try { saved = S.store().getItem(S.KEY); } catch (e) {}
        log("save", ok && saved ? "game state saved to " + where + ", key " + S.KEY + " (" + saved.length + " characters)" : "game state NOT saved (storage unavailable or full)");
      }
      return ok;
    };
    window.addEventListener("error", function (e) { log("error", e.message, e.filename + ":" + e.lineno); });
    window.addEventListener("unhandledrejection", function (e) { log("error", "unhandled promise rejection", e.reason); });
    if (on()) { log("settings", "debug log is on", JSON.parse(JSON.stringify(S.state.settings))); }
  });

  /* Log when the switch changes, so the console shows where logging starts */
  var lastState = null;
  setInterval(function () {
    var now = on();
    if (lastState !== null && now !== lastState) {
      console.log("%c[SELK debug]", "color:#6FBF5A;font-weight:bold", now ? "debug log on" : "debug log off");
    }
    lastState = now;
  }, 500);
})();

/* DEBUG panel, shown while Setup > Debug > Debug panel is on: a movable
   overlay with the current situation and buttons that trigger game actions
   for testing. Actions are logged while the debug log is on. */
(function () {
  "use strict";
  var S = window.SELK, panel = null, info = null, collapsed = false;
  var el = S.el;
  function on() { return !!(S.state && S.state.settings && S.state.settings.debug); }
  function refresh() {
    if (S.ex && S.ex.render) { S.ex.render(); }
    if (S.desk && S.isDesktop() && S.desk.refresh) { S.desk.refresh(); }
    if (S.rep && S.rep.render) { S.rep.render(); }
    if (S.mailpane) { S.mailpane.render(); }
    S.status();
  }
  function activeReport() {
    var keys = Object.keys(S.state.reports);
    if (S.state.active && S.state.reports[S.state.active] && !S.state.reports[S.state.active].done) { return S.state.active; }
    return keys.filter(function (k) { return !S.state.reports[k].done; })[0] || null;
  }
  function toggleShow(id) {
    var list = S.state.debugShow || (S.state.debugShow = []), i = list.indexOf(id);
    if (i === -1) { list.push(id); } else { list.splice(i, 1); }
    S.save(); refresh();
    S.msg(i === -1 ? S.t("{name} shown", { name: S.SECTIONS.filter(function (s) { return s.id === id; })[0].name }) : S.t("{name} hidden", { name: S.SECTIONS.filter(function (s) { return s.id === id; })[0].name }));
  }
  var ACTIONS = [
    ["DELIVER MAIL", "Deliver pending mail now, or queue the next message", function () {
      if (S.state.pending.length) { S.state.pending.slice().forEach(function (id) { S.deliver(id); }); return; }
      var next = Object.keys(S.MESSAGES).filter(function (id) { return !S.state.mail.some(function (m) { return m.id === id; }); })[0];
      if (next) { S.queueMail(next, 0); } else { S.msg("No more messages"); }
    }],
    ["FILL REPORT", "Fill the open report page with correct answers", function () {
      var k = activeReport(); if (!k) { S.msg("No open report page", "err"); return; }
      S.REPORTS[k].lines.forEach(function (ln, i) { S.rep.fillBlank(k, i + 1, ln[1][0]); });
    }],
    ["SUBMIT", "Submit the open report page", function () { S.run("submit", false); }],
    ["UNLOCK ALL", "Open every locked section in view", function () {
      S.sections().forEach(function (s) { if (s.locked && S.state.unlocked.indexOf(s.id) === -1) { S.state.unlocked.push(s.id); } });
      S.save(); refresh(); S.msg("All sections unlocked");
    }],
    /* Design and History are hidden until the first ending and until Design
       opens; opening them here also shows them */
    /* Show Design or History in their locked state, to try the unlock
       prompts; a second press hides them again */
    ["SHOW DESIGN", "Show Design, still locked, or hide it again", function () { toggleShow("design"); }],
    ["SHOW HISTORY", "Show History, still locked, or hide it again", function () { toggleShow("history"); }],
    ["UNLOCK DESIGN", "Show and open Design, without an ending", function () {
      if (S.state.unlocked.indexOf("design") === -1) { S.state.unlocked.push("design"); }
      S.save(); refresh(); S.msg("Design unlocked");
    }],
    ["UNLOCK HISTORY", "Show and open History, without opening Design", function () {
      if (S.state.unlocked.indexOf("history") === -1) { S.state.unlocked.push("history"); }
      S.save(); refresh(); S.msg("History unlocked");
    }],
    ["DECISION", "Open the final decision", function () { S.state.decision = true; S.save(); S.run("decide", false); }],
    ["GUST", "Trigger a strong wind gust", function () {
      if (S.watch) { S.watch.gust = 1; }
      if (S.snd.gust) { S.snd.gust(1); }
      if (S.previewInterference) { S.previewInterference(true); }
    }],
    ["CREAK", "Play a structure creak", function () { if (S.snd.creak) { S.snd.creak(1); } }],
    ["CLOCK +1 H", "Advance the site clock by one hour", function () { S.tick(60); S.save(); S.status(); }],
    ["HINT LIGHT", "Switch the hint light on or off", function () { S.state.light = !S.state.light; S.save(); S.status(); }],
    ["TOUR", "Restart the full tour, with its tasks", function () { if (S.tut) { S.tut.stop(); S.tut.start(); } }],
    ["SWITCH MODE", "Switch between tmux and desktop", function () { S.setMode(S.isDesktop() ? "tmux" : "desktop"); }],
    ["DUMP STATE", "Print the full game state to the console", function () { console.log("%c[SELK state]", "color:#5E8CC7;font-weight:bold", JSON.parse(JSON.stringify(S.state))); }]
  ];
  function describe() {
    var T = S.tmux, w = T && T.windows && T.windows[T.w];
    return [
      "mode " + (S.isDesktop() ? "desktop" : "tmux") + (S.ui ? ", active " + S.ui.active() : ""),
      "window " + (w ? w.name : "-") + (T && T.zoom ? " (zoomed)" : ""),
      "report " + (S.state.active || "-") + ", blank " + (S.state.sel ? S.state.sel.n : "-"),
      "mail " + S.state.mail.length + ", pending " + S.state.pending.length,
      "clock " + S.fmtTime(S.state.clock)
    ].join("\n");
  }
  function build() {
    panel = el("div", "dbg"); panel.setAttribute("role", "region"); panel.setAttribute("aria-label", S.t("Debug tools"));
    var head = el("div", "dbg-head");
    head.appendChild(el("span", "", "DEBUG"));
    var fold = el("button", "dbg-fold", S.t("HIDE")); fold.type = "button";
    fold.addEventListener("click", function () { collapsed = !collapsed; panel.classList.toggle("folded", collapsed); fold.textContent = collapsed ? S.t("SHOW") : S.t("HIDE"); });
    head.appendChild(fold);
    panel.appendChild(head);
    info = el("div", "dbg-info"); info.setAttribute("aria-live", "off"); panel.appendChild(info);
    var grid = el("div", "dbg-grid");
    ACTIONS.forEach(function (a) {
      var b = el("button", "btn", S.t(a[0])); b.type = "button"; b.title = S.t(a[1]);
      b.addEventListener("click", function () {
        if (S.debug) { S.debug("command", "debug action: " + a[0]); }
        try { a[2](); } catch (e) { console.error(e); }
        update();
      });
      grid.appendChild(b);
    });
    panel.appendChild(grid);
    /* The header drags the panel */
    head.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) { return; }
      var r = panel.getBoundingClientRect(), host = panel.parentNode.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
      function mv(ev) {
        panel.style.left = Math.max(0, Math.min(host.width - r.width, ev.clientX - host.left - sx)) + "px";
        panel.style.top = Math.max(0, Math.min(host.height - 30, ev.clientY - host.top - sy)) + "px";
        panel.style.right = "auto";
      }
      function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); }
      document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
    });
  }
  /* Keep the panel inside the screen. A dragged position is clamped, so a
     smaller window or a rotated phone leaves the panel on screen. */
  function clamp() {
    if (!panel || !panel.parentNode || panel.style.left === "") { return; }
    var host = panel.parentNode.getBoundingClientRect(), w = panel.offsetWidth, h = panel.offsetHeight;
    var left = parseFloat(panel.style.left) || 0, top = parseFloat(panel.style.top) || 0;
    panel.style.left = Math.max(0, Math.min(host.width - w, left)) + "px";
    panel.style.top = Math.max(0, Math.min(host.height - Math.min(h, host.height), top)) + "px";
  }
  window.addEventListener("resize", clamp);
  if (window.ResizeObserver) {
    document.addEventListener("DOMContentLoaded", function () {
      var screen = document.getElementById("screen");
      if (screen) { new ResizeObserver(clamp).observe(screen); }
    });
  }
  /* Rewritten only when the content changes, and not announced */
  function update() {
    if (!panel || !info) { return; }
    var t = describe();
    if (info.textContent !== t) { info.textContent = t; }
  }
  setInterval(function () {
    var screen = document.getElementById("screen");
    if (!screen) { return; }
    /* The panel stays in the DOM for the whole session, the ending included,
       since removing it and adding it back made clicks miss */
    if (on() && S.tmux && S.tmux.attached) {
      if (!panel) { build(); }
      if (panel.parentNode !== screen) { screen.appendChild(panel); clamp(); }
      if (panel.hasAttribute("inert")) { panel.removeAttribute("inert"); delete panel.dataset.cineInert; }
      update();
    } else if (panel && panel.parentNode) {
      panel.parentNode.removeChild(panel);
    }
  }, 800);
})();
