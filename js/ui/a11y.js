/* Accessibility layer: live announcements, roles, names and states for the
   elements the game builds, keyboard access to menus, focus handling for
   dialogs, and screen reader mode. Loaded after every other script. */
(function () {
  "use strict";
  var S = window.SELK;
  var uid = 0;
  function $(id) { return document.getElementById(id); }
  function idOf(n, p) { if (!n.id) { n.id = (p || "a11y") + "-" + (++uid); } return n.id; }
  function txt(n) { return n ? (n.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function set(n, k, v) { if (n && n.getAttribute(k) !== v) { n.setAttribute(k, v); } }
  function wrap(obj, name, after) {
    var f = obj && obj[name];
    if (typeof f !== "function") { return; }
    obj[name] = function () {
      var out = f.apply(this, arguments);
      try { after.call(this, out, arguments); } catch (e) {}
      return out;
    };
  }

  /* 1. Announcer: two hidden live regions, polite for most messages and
     assertive for errors. S.announce(text, isUrgent) writes to them. */
  var polite, urgent, last = "", lastAt = 0;
  function region(mode) {
    var r = document.createElement("div");
    r.className = "sr-only";
    r.setAttribute("role", mode === "assertive" ? "alert" : "status");
    r.setAttribute("aria-live", mode);
    r.setAttribute("aria-atomic", "true");
    document.body.appendChild(r);
    return r;
  }
  S.announce = function (text, isUrgent) {
    if (!text || !polite) { return; }
    var now = Date.now();
    if (text === last && now - lastAt < 1500) { return; }
    last = text; lastAt = now;
    var r = isUrgent ? urgent : polite;
    r.textContent = "";
    setTimeout(function () { r.textContent = text; }, 50);
  };

  /* 2. Hooks into game functions */
  function hooks() {
    wrap(S, "msg", function (out, a) { S.announce(S.t(a[0]), a[1] === "err"); });
    if (S.scr && S.scr.type) {
      var type = S.scr.type;
      S.scr.type = function () {
        var log = $("log");
        if (log) { log.setAttribute("aria-busy", "true"); }
        var p = type.apply(this, arguments);
        if (p && p.then) { p.then(function () { if (log && !S.scr.busy()) { log.removeAttribute("aria-busy"); } }); }
        return p;
      };
    }
    if (S.transmit) {
      var tx = S.transmit;
      S.transmit = function (label) {
        S.announce(S.t("Transmitting {label} to Earth.", { label: label }));
        var p = tx.apply(this, arguments);
        if (p && p.then) { p.then(function () { S.announce(S.t("{label} delivered to Earth.", { label: label })); }); }
        return p;
      };
    }
    var opener = null;
    wrap(S, "dialog", function () {
      var ov = S.dlg, box = ov && ov.querySelector(".dlg");
      if (!box) { return; }
      set(box, "aria-modal", "true");
      var t = box.querySelector(".dlg-title"), b = box.querySelector(".dlg-body");
      if (t) { set(box, "aria-labelledby", idOf(t, "dlg-title")); }
      if (b && !b.querySelector("button, input, select, textarea, [role='group'], [role='listbox']")) { set(box, "aria-describedby", idOf(b, "dlg-body")); }
      ov.addEventListener("keydown", trap);
    });
    var open = S.dialog;
    S.dialog = function () {
      if (!S.dlg) { opener = document.activeElement; }
      return open.apply(this, arguments);
    };
    wrap(S, "closeDialog", function () {
      if (!S.dlg && opener && opener.isConnected && opener.focus) { opener.focus(); }
      opener = null;
    });
    wrap(S, "applySettings", applyMode);
  }

  function trap(e) {
    if (e.key !== "Tab") { return; }
    var f = [].filter.call(e.currentTarget.querySelectorAll("button:not([disabled]), a[href], input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']), [contenteditable='true']"), function (n) {
      return !n.disabled && !n.hidden && !n.closest("[hidden], [inert], [aria-hidden='true']") && n.getClientRects().length > 0;
    });
    if (!f.length) { return; }
    var first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  }

  /* 3. Screen reader mode: text at once, no flicker, scanlines or
     interference */
  function applyMode() {
    var on = S.syncContext().sr;
    var b = document.querySelector("[data-a11y='sr']");
    if (b) { b.textContent = on ? S.t("SCREEN READER MODE: ON") : S.t("SCREEN READER MODE: OFF"); set(b, "aria-pressed", on ? "true" : "false"); }
  }
  /* The title screen's options panel switches it through
     S.toggleScreenReader (main.js) */
  S.toggleScreenReader = function () { toggleMode(); };
  function toggleMode() {
    S.state.settings.sr = !S.state.settings.sr;
    S.save(); S.applySettings(); applyMode();
    S.announce(S.state.settings.sr ? S.t("Screen reader mode on. Text appears at once and screen effects are off.") : S.t("Screen reader mode off."));
  }

  /* 4. Roles, names and states for dynamic content */
  function DRAG() { return S.t("Can fill a report blank: press F4 in FILES, or open the context menu with Shift+F10."); }
  function fix(root) {
    var q = function (s, fn) { (root.querySelectorAll ? root : document).querySelectorAll(s).forEach(fn); };

    q(".title-big", function (n) { set(n, "role", "heading"); set(n, "aria-level", "1"); set(n, "aria-label", "Selk"); });

    q(".pane", function (p) {
      var h = p.querySelector(".pane-name");
      set(p, "role", "region");
      set(p, "aria-label", (h ? txt(h) : S.t("Pane")) + (p.classList.contains("cur") ? S.t(", active pane") : ""));
      if (h) { set(h, "aria-hidden", "true"); }
    });
    q(".tmux-win", function (b) { set(b, "aria-label", S.t("Window {name}", { name: txt(b).replace("*", "") })); if (b.classList.contains("act")) { set(b, "aria-current", "true"); } else { b.removeAttribute("aria-current"); } });

    q(".mc-panel", function (p, i) {
      var list = p.querySelector(".mc-list"), head = p.querySelector(".mc-head");
      if (!list) { return; }
      set(list, "role", "listbox");
      set(list, "tabindex", p.classList.contains("act") ? "0" : "-1");
      set(list, "aria-label", head && txt(head) !== "/" ? S.t("Entries in {name}", { name: txt(head) }) : S.t("Sections"));
      var cols = p.querySelector(".mc-cols"); if (cols) { set(cols, "aria-hidden", "true"); }
      if (head) { set(head, "aria-hidden", "true"); }
      var rows = list.querySelectorAll(".mc-row"), rowCount = rows.length;
      rows.forEach(function (r, i) {
        set(r, "role", "option");
        idOf(r, "mc-row");
        set(r, "aria-selected", r.classList.contains("sel") ? "true" : "false");
        set(r, "aria-posinset", String(i + 1));
        set(r, "aria-setsize", String(rowCount));
        var n = txt(r.querySelector(".mc-n")), info = txt(r.querySelector(".mc-i"));
        set(r, "aria-label", n + (info ? ", " + info : "") + (r.classList.contains("lock") ? S.t(", locked") : "") + (r.classList.contains("read") ? S.t(", read") : ""));
        if (r.dataset.entry) { set(r, "aria-description", DRAG()); }
        if (r.classList.contains("sel")) { set(list, "aria-activedescendant", r.id); }
      });
      if (!list.querySelector(".mc-row.sel")) { list.removeAttribute("aria-activedescendant"); }
    });
    q(".mc-mini", function (n) { set(n, "aria-hidden", "true"); });

    q(".grip, .wb-badge", function (g) { set(g, "aria-hidden", "true"); g.removeAttribute("role"); g.removeAttribute("aria-label"); });
    q(".wb-img svg", function (s) { set(s, "aria-hidden", "true"); set(s, "focusable", "false"); });
    q(".wb-icon", function (ic) {
      set(ic, "role", "button");
      if (!ic.hasAttribute("tabindex")) { ic.tabIndex = 0; }
      var l = txt(ic.querySelector(".wb-label"));
      set(ic, "aria-label", l + (ic.classList.contains("locked") ? S.t(", locked drawer") : ""));
      if (ic.dataset.entry) { set(ic, "aria-description", DRAG()); }
      var lk = ic.querySelector(".wb-lock"); if (lk) { set(lk, "aria-hidden", "true"); }
    });
    q(".wb-group", function (g) { set(g, "role", "group"); var t = g.querySelector(".wb-gtitle"); if (t) { set(g, "aria-labelledby", idOf(t, "wb-group")); } });
    q(".wb-back", function (n) { set(n, "role", "region"); set(n, "aria-label", S.t("Desktop")); });
    q(".wb-bar", function (n) { set(n, "role", "region"); set(n, "aria-label", S.t("Workbench title bar")); });
    q(".wb-win", function (w) {
      set(w, "role", "region");
      if (w.classList.contains("act")) { set(w, "aria-current", "true"); } else { w.removeAttribute("aria-current"); }
      var t = w.querySelector(".wb-wtitle"); if (t) { set(w, "aria-labelledby", idOf(t, "wb-title")); }
      var s = w.querySelector(".wb-size"); if (s) { set(s, "aria-hidden", "true"); }
    });

    q(".paper", function (p) {
      set(p, "role", "form");
      var t = p.querySelector(".paper-title"); if (t) { set(p, "aria-labelledby", idOf(t, "paper")); }
    });
    q(".blank", function (b) {
      var line = b.closest(".paper-line"), n = b.dataset.n || "";
      var filled = b.classList.contains("filled");
      set(b, "aria-label", S.t("Blank {n}: {value}", { n: n, value: filled ? txt(b) : S.t("empty") }) + (line ? ". " + S.t("Sentence: {text}", { text: txt(line).replace(txt(b), S.t("blank")).replace(/\sx\s?/, " ") }) : ""));
      set(b, "aria-pressed", b.classList.contains("sel") ? "true" : "false");
    });
    q(".unfill", function (u) { var b = u.parentNode && u.parentNode.querySelector(".blank"); set(u, "aria-label", S.t("Clear blank {n}", { n: b ? b.dataset.n : "" })); });
    q(".tab", function (t) { if (t.classList.contains("act")) { set(t, "aria-current", "page"); } else { t.removeAttribute("aria-current"); } });

    q(".entry", function (e) { set(e, "role", "article"); var t = e.querySelector(".entry-title"); if (t) { set(e, "aria-labelledby", idOf(t, "entry")); } });
    q(".entry-title[data-entry]", function (t) { set(t, "aria-description", DRAG()); });
    q(".note", function (n) { set(n, "role", "note"); });
    /* Tooltips and names that use ">" as a separator are read with a pause */
    q("[title*=' > ']", function (n) { set(n, "title", S.spoken(n.getAttribute("title"))); });
    q("[aria-label*=' > ']", function (n) { set(n, "aria-label", S.spoken(n.getAttribute("aria-label"))); });
    q(".term", function (b) {
      var cmd = b.dataset.cmd || "", id = cmd.replace(/^note\s+/, "").toLowerCase(), note = S.i18n.note(id);
      set(b, "aria-label", S.spoken(S.t("Handbook note: {name}", { name: note ? note[0] : txt(b) })));
    });
    q(".lnk.locked", function (b) { set(b, "aria-label", txt(b).replace(/\s*\[locked\]$/, "") + S.t(", in a locked section")); });
    q(".lnk[data-entry]", function (b) { set(b, "aria-description", DRAG()); });
    q(".mrow", function (b) { set(b, "aria-label", txt(b).replace(new RegExp(" " + S.t("NEW") + "$"), S.t(", unread"))); });
    q(".count", function (c) { set(c, "aria-hidden", "true"); });
    q(".watch", function (w) { set(w, "role", "region"); set(w, "aria-label", S.t("Site telemetry")); });
    q(".viewer", function (v) { set(v, "role", "region"); set(v, "aria-label", S.t("Viewer")); });
    q(".v-head", function (h) { set(h, "role", "heading"); set(h, "aria-level", "2"); });
    q(".reportpane", function (r) { set(r, "role", "region"); set(r, "aria-label", S.t("Report page")); });
    q(".mailpane", function (r) { set(r, "role", "region"); set(r, "aria-label", S.t("Mail inbox")); });
    q(".chooser", function (c) { set(c, "role", "group"); set(c, "aria-label", S.t("Choose what this pane shows")); });
    q(".ctx", function (m) { set(m, "aria-label", S.t("Context menu")); });
    q(".tut", function (t) {
      set(t, "role", "dialog"); set(t, "aria-modal", "false");
      var h = t.querySelector(".tut-head"); if (h) { set(t, "aria-labelledby", idOf(h, "tut")); }
    });
    q(".switcher", function (s) { set(s, "aria-label", S.t("Windows")); });
    q(".glass, .drag-ghost", function (g) { set(g, "aria-hidden", "true"); });
  }

  /* Announce new overlays and changing selections */
  var seen = new WeakSet();
  function announceNew(n) {
    if (n.nodeType !== 1) { return; }
    var t = n.matches(".tut") ? n : n.querySelector && n.querySelector(".tut");
    if (t && !seen.has(t)) { seen.add(t); S.announce(txt(t.querySelector(".tut-head")) + ". " + [].map.call(t.querySelectorAll("p"), txt).join(" ")); }
    var m = n.matches(".ctx") ? n : null;
    if (m) { S.announce(S.tn("Context menu, {n} items. Use arrow keys, Enter to choose, Escape to close.", m.querySelectorAll(".ctx-item").length)); }
    var sw = n.matches(".switcher") ? n : null;
    if (sw) { S.announce(S.t("Window switcher: {name}", { name: txt(sw.querySelector(".switcher-item.on")) })); }
  }

  /* Keep the focus in the explorer after it redraws */
  function refocusExplorer() {
    var a = document.activeElement;
    if (a && a !== document.body && a.isConnected) { return; }
    if (!S.tmux || !S.tmux.attached || S.isDesktop() || !S.tmux.cur || S.tmux.cur.kind !== "FILES") { return; }
    var list = document.querySelector(".mc-panel.act .mc-list");
    if (list) { list.focus({ preventScroll: true }); }
  }

  /* 5. Keyboard access to context menus and their items */
  function openMenuFor(node) {
    if (!node) { return; }
    var ad = node.getAttribute && node.getAttribute("aria-activedescendant");
    var target = ad ? $(ad) || node : node;
    var r = target.getBoundingClientRect();
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: r.left + 8, clientY: r.bottom - 4 }));
  }
  document.addEventListener("keydown", function (e) {
    var menu = document.querySelector(".ctx");
    if (menu && ["ArrowDown", "ArrowUp", "Home", "End"].indexOf(e.key) !== -1) {
      e.preventDefault(); e.stopImmediatePropagation();
      var items = [].filter.call(menu.querySelectorAll(".ctx-item"), function (b) { return !b.disabled; });
      var i = items.indexOf(document.activeElement);
      var n = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      if (items[n]) { items[n].focus(); }
      return;
    }
    if (menu && e.key === "Tab") {
      e.preventDefault();
      var opener = menu._opener, focusable = [].filter.call(document.querySelectorAll("button:not([disabled]), a[href], input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"), function (n) {
        return !menu.contains(n) && !n.closest("[hidden], [inert], [aria-hidden='true']") && n.getClientRects().length > 0;
      });
      var oi = focusable.indexOf(opener), next = focusable[oi + (e.shiftKey ? -1 : 1)];
      if (S.closeMenu) { S.closeMenu(); }
      if (!next) { next = e.shiftKey ? focusable[focusable.length - 1] : focusable[0]; }
      if (next) { next.focus(); }
      return;
    }
    if ((e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) && S.mode === "shell") {
      e.preventDefault(); e.stopImmediatePropagation();
      openMenuFor(document.activeElement);
      return;
    }
  }, true);

  /* Arrow keys outside dialogs. Left and Right move along a row of buttons
     (S.keyNav in dialogs.js): toast and tour buttons, report tabs, the title
     screen and the status bars. Up and Down move through a list: the inbox
     and the choices of the final decision. Enter presses the focused button.
     Dialogs handle their own keys. */
  var LIST = ".mailpane, .cine-choices";
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || S.dlg || !e.target.closest || e.target.closest(".dlg-ov, .ctx")) { return; }
    var t = e.target;
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && t.matches("button") && t.closest(".mail-toast-actions, .tut-btns, .tabs, .cine-group, .title-row, .tmux-right, .wb-right")) {
      S.keyNav(e, t.closest(".mail-toast, .tut, .tabs, .cine, .title, .tmux, .wb-bar") || document.body);
      return;
    }
    var list = t.closest(LIST);
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && list && t.matches("button") && !e.altKey && !e.ctrlKey && !e.metaKey) {
      var rows = [].filter.call(list.querySelectorAll("button"), function (b) { return !b.disabled && b.getClientRects().length > 0; });
      var i = rows.indexOf(t), next = rows[(i + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length];
      if (next && next !== t) { e.preventDefault(); next.focus(); }
    }
  });

  /* 6. Start-up: create the live regions, name the main areas, install the
     hooks of part 2, apply screen reader mode, and run the roles-and-names
     pass (fix) on the page and after each change to it */
  document.addEventListener("DOMContentLoaded", function () {
    polite = region("polite"); urgent = region("assertive");
    var screen = $("screen");
    set(screen, "role", "main"); set(screen, "aria-label", S.t("Selk site terminal"));
    set($("desk"), "aria-label", S.t("Desktop"));
    var st = document.querySelector(".tmux"); if (st) { set(st, "role", "region"); }
    ["st-clock", "st-uplink", "st-user"].forEach(function (k) { var n = $(k); if (n) { set(n, "aria-live", "off"); } });
    hooks();
    applyMode();
    if (S.motionQuery) {
      var onChange = function (e) { S.systemReduced = e.matches; applyMode(); };
      if (S.motionQuery.addEventListener) { S.motionQuery.addEventListener("change", onChange); } else if (S.motionQuery.addListener) { S.motionQuery.addListener(onChange); }
    }
    fix(document);
    /* Parts that only animate or tick. The roles-and-names pass skips changes
       inside them, which would otherwise run it every frame. */
    var QUIET = ".scene, .cine-caption, .watch, .cam, .livecam, canvas, #st-clock, .dbg-info, .count, .tmux-msg, .glass";
    var timer = null, last = 0, GAP = 300;
    function run() { timer = null; last = Date.now(); fix(document); refocusExplorer(); }
    new MutationObserver(function (list) {
      var busy = false;
      list.forEach(function (m) {
        var t = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (t && t.closest && t.closest(QUIET)) { return; }
        busy = true;
        [].forEach.call(m.addedNodes, announceNew);
      });
      /* At most one full pass every GAP ms, and a final pass after the last
         change */
      if (!busy || timer) { return; }
      timer = setTimeout(run, Math.max(0, GAP - (Date.now() - last)));
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  });
})();
