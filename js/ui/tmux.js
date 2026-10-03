/* tmux mode: the window model, windows and panes built from it, and Ctrl+B keys. */
(function () {
  var S = window.SELK, el = S.el, $ = S.$;
  var KINDS = [
    "FILES",
    "VIEW",
    "REPORT",
    "SHELL",
    "MAIL",
    "MESSAGE",
    "WATCH"
  ];
  S.kinds = {};
  S.registerKind = function (k, el) {
    S.kinds[k] = el;
  };
  S.notificationHost = function () {
    var screen = $("screen"), host = screen && screen.querySelector(".notification-stack");
    if (!screen) {
      return null;
    }
    if (!host) {
      host = document.createElement("div");
      host.className = "notification-stack";
      host.setAttribute("aria-label", S.t("Notifications and tutorial"));
      screen.appendChild(host);
    }
    return host;
  };
  function L(k) {
    return {
      leaf: true,
      kind: k
    };
  }
  function V(a, b, r) {
    return {
      dir: "v",
      a: a,
      b: b,
      r: r
    };
  }
  function H(a, b, r) {
    return {
      dir: "h",
      a: a,
      b: b,
      r: r
    };
  }
  /* Window model. One description (T.open) says what is open. Every change
     edits it and rebuilds all windows from it, and the current pane is
     remembered by name. */
  /* MAIL and its MESSAGE pane stay open; REPORT and WATCH can close */
  var CLOSABLE = ["REPORT", "WATCH"];
  /* The window model, for the session only: REPORT and WATCH are true while
     open; shellPopped is true while SHELL has its own window (POP OUT);
     revealed is true while a shell-only DESK shows FILES and VIEW again
     (shellOnly below). */
  function freshOpen() {
    return { REPORT: false, WATCH: true, shellPopped: false, revealed: false };
  }
  /* Shell-only DESK: settings.deskShell is ON, Shell results is IN SHELL, the
     mode is tmux and o.revealed is false. The wide layouts then show only the
     shell in a window named SHELL; the SINGLE layout and narrow screens leave
     out FILES and VIEW. A FILES or VIEW request sets o.revealed, and the next
     typed command clears it (T.endReveal). docs/shell.md describes the mode. */
  function shellOnly(o) {
    var s = S.state && S.state.settings;
    return !!s && !!s.deskShell && s.shellOut === "shell" && !S.isDesktop() && !o.revealed;
  }
  /* Status bar name of the files, view and shell window: SHELL when it shows
     only the shell, DESK otherwise */
  function deskWin(o) {
    return shellOnly(o || T.open) ? "SHELL" : "DESK";
  }
  /* True when kind k is left out of the current layout by shellOnly */
  function hiddenByShellOnly(k, o) {
    if (!shellOnly(o)) { return false; }
    if (k === "FILES" || k === "VIEW") { return true; }
    return k === "REPORT" && !T.wasMobile && S.state.settings.layout !== "single";
  }
  function layoutWindows(layout, mobile, o) {
    var list = [], bare = shellOnly(o);
    /* MAIL has two panes, the inbox and MESSAGE: side by side on a wide
       screen, stacked on a narrow one, where the inbox can be hidden
       (settings.mailList) */
    if (mobile || layout === "single") {
      var single = S.state && S.state.settings.mailList === "single";
      ["SHELL", "FILES", "VIEW", "REPORT", "MAIL", "WATCH"].forEach(function (k) {
        if (CLOSABLE.indexOf(k) !== -1 && !o[k]) { return; }
        if (bare && (k === "FILES" || k === "VIEW")) { return; }
        list.push({ name: k, root: k !== "MAIL" ? L(k) : (single ? L("MESSAGE") : H(L("MAIL"), L("MESSAGE"), 0.35)) });
      });
      return list;
    }
    if (bare) {
      list.push({ name: "SHELL", root: L("SHELL") });
      list.push({ name: "MAIL", root: V(L("MAIL"), L("MESSAGE"), 0.4) });
      if (o.WATCH) { list.push({ name: "WATCH", root: L("WATCH") }); }
      return list;
    }
    var view = o.REPORT ? H(L("VIEW"), L("REPORT"), 0.55) : L("VIEW");
    var desk = layout === "three"
      ? V(L("FILES"), o.shellPopped ? view : H(view, L("SHELL"), 0.62), 0.44)
      : V(o.shellPopped ? L("FILES") : H(L("FILES"), L("SHELL"), 0.62), view, 0.44);
    list.push({ name: "DESK", root: desk });
    list.push({ name: "MAIL", root: V(L("MAIL"), L("MESSAGE"), 0.4) });
    if (o.WATCH) { list.push({ name: "WATCH", root: L("WATCH") }); }
    if (o.shellPopped) { list.push({ name: "SHELL", root: L("SHELL") }); }
    return list;
  }
  var T = S.tmux = {
    windows: [],
    open: null,
    w: 0,
    cur: null,
    zoom: null,
    prefix: false,
    attached: false,
    wasMobile: false
  };
  Object.defineProperty(T, "shellPoppedOut", { get: function () { return !!(T.open && T.open.shellPopped); } });
  T.shellOnly = function () { return !!(T.open && shellOnly(T.open)); };
  T.mobile = function () {
    return S.ctx().mobile;
  };
  function win() {
    return T.windows[T.w];
  }
  function leaves(n, out) {
    out = out || []; if (!n) {
      return out;
    } if (n.leaf) {
      out.push(n);
    } else {
      leaves(n.a, out); leaves(n.b, out);
    } return out;
  }
  function shown() {
    return T.zoom ? [
      T.zoom
    ] : leaves(win().root);
  }
  function rebuild(winName, kind) {
    var name = winName || (win() && win().name) || deskWin(T.open);
    var want = kind || (T.cur && T.cur.kind);
    T.windows = layoutWindows(S.state.settings.layout, T.wasMobile, T.open);
    var i = -1;
    T.windows.forEach(function (x, n) { if (i < 0 && x.name === name) { i = n; } });
    T.w = i < 0 ? 0 : i;
    T.zoom = null;
    T.cur = leaves(win().root).filter(function (l) { return l.kind === want; })[0] || leaves(win().root)[0];
    T.render();
  }
  T.rebuild = rebuild;
  T.init = function (keepKind) {
    T.wasMobile = T.mobile();
    if (!T.open) { T.open = freshOpen(); }
    T.attached = true;
    $("screen").classList.add("session");
    $("screen").classList.remove("desktop");
    rebuild(deskWin(T.open), null);
    if (keepKind) { T.goto(keepKind); }
  };
  /* Leave the session: back to the single shell of the title screen and
     sign-in */
  T.detach = function () {
    if (S.desk) {
      S.desk.teardown();
    } T.attached = false; $("screen").classList.remove("session"); T.render();
  };
  function detachKinds() {
    var park = $("kind-park"); KINDS.forEach(function (k) {
      var e = S.kinds[k]; if (e) {
        park.appendChild(e);
      }
    });
  }
  T.park = detachKinds;
  /* Draw the current window. Each window kind is one DOM element that moves
     between panes; kinds not shown wait in #kind-park. */
  T.render = function () {
    var host = $("panes");
    detachKinds();
    host.textContent = "";
    if (!T.attached) {
      var solo = el("div", "pane solo"), body = el("div", "pane-body");
      body.appendChild(S.kinds.SHELL); solo.appendChild(body); host.appendChild(solo);
      bar(); S.status(); return;
    }
    if (shown().indexOf(T.cur) === -1) {
      T.cur = shown()[0];
    }
    host.appendChild(build(T.zoom || win().root));
    bar(); S.status(); focusCur();
    if (S.ex) {
      S.ex.render();
    }
    if (S.rep && S.rep.render) {
      S.rep.render();
    }
    if (S.mailpane) {
      S.mailpane.render();
    }
    if (S.watch) {
      S.watch.render();
    }
    if (S.scr && S.scr.scroll) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          S.scr.scroll();
        });
      });
    }
  };
  /* A split is known by its direction and the panes on each side, so a size
     set by dragging returns when the same panes meet again */
  function splitKey(n) {
    var k = function (x) { return leaves(x).map(function (l) { return l.kind; }).join("+"); };
    return n.dir + ":" + k(n.a) + "|" + k(n.b);
  }
  function build(n) {
    if (n.leaf) {
      return paneEl(n);
    }
    var d = el("div", "split " + n.dir), a = build(n.a), b = build(n.b);
    var sizes = S.state.settings.splits || (S.state.settings.splits = {});
    var key = splitKey(n), r = typeof sizes[key] === "number" ? sizes[key] : n.r;
    function setR(x) {
      r = Math.max(0.15, Math.min(0.85, x));
      a.classList.remove("fit");
      a.style.flex = r + " 1 0"; b.style.flex = (1 - r) + " 1 0";
      bar.setAttribute("aria-valuenow", String(Math.round(r * 100)));
    }
    function keep() { sizes[key] = Math.round(r * 1000) / 1000; S.save(); }
    var bar = el("div", "split-bar");
    bar.tabIndex = 0;
    bar.setAttribute("role", "separator");
    bar.setAttribute("aria-orientation", n.dir === "v" ? "vertical" : "horizontal");
    bar.setAttribute("aria-valuemin", "15"); bar.setAttribute("aria-valuemax", "85");
    bar.setAttribute("aria-label", S.t("Resize {a} and {b}", { a: S.t(leaves(n.a)[0].kind), b: S.t(leaves(n.b)[0].kind) }));
    bar.title = S.t("Drag to resize. Double click for the default size");
    setR(r);
    /* A stacked inbox takes the height of its rows, up to a limit
       (.pane.fit), and MESSAGE takes the rest, until the player sets a size */
    if (n.dir === "h" && n.a.leaf && n.a.kind === "MAIL" && typeof sizes[key] !== "number") {
      a.classList.add("fit"); a.style.flex = ""; b.style.flex = "1 1 0";
    }
    bar.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) { return; }
      e.preventDefault(); e.stopPropagation();
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      bar.classList.add("drag");
      var box = d.getBoundingClientRect();
      function move(ev) {
        setR(n.dir === "v" ? (ev.clientX - box.left) / box.width : (ev.clientY - box.top) / box.height);
      }
      function up() {
        bar.classList.remove("drag");
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
        keep();
      }
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });
    bar.addEventListener("keydown", function (e) {
      var step = { ArrowLeft: -0.05, ArrowUp: -0.05, ArrowRight: 0.05, ArrowDown: 0.05 }[e.key];
      if (!step) { return; }
      e.preventDefault(); e.stopPropagation();
      setR(r + step); keep();
    });
    bar.addEventListener("dblclick", function () {
      delete sizes[key]; S.save(); T.render();
    });
    d.appendChild(a); d.appendChild(bar); d.appendChild(b);
    return d;
  }
  /* Setup > Sole pane frames OFF: a pane alone in its window and not zoomed
     is drawn bare (.pane.bare): no border, and a hidden header from which the
     accessibility layer reads the pane name. Its header buttons move to the
     pane's context menu (contextmenu.js). */
  function bare(n) {
    return S.state.settings.soloFrames === false && !T.zoom && win().root === n;
  }
  function paneEl(n) {
    var p = el("div", "pane" + (n === T.cur ? " cur" : "") + (bare(n) ? " bare" : ""));
    p._leaf = n;
    var idx = leaves(win().root).indexOf(n);
    var head = el("div", "pane-head");
    head.appendChild(el("span", "pane-name", idx + ": " + S.t(n.kind) + (T.zoom ? " " + S.t("[ZOOM]") : "")));
    /* Header buttons: SHELL pops out of DESK and back in; REPORT and WATCH
       close. */
    if (n.kind === "SHELL" && (T.canPopOut(n) || T.canPopInShell())) {
      var pop = el("button", "pane-close", T.open.shellPopped ? S.t("POP IN") : S.t("POP OUT")); pop.type = "button"; pop.dataset.sound = "tab";
      pop.setAttribute("aria-label", T.open.shellPopped ? S.t("Put the shell back into DESK") : S.t("Give the shell its own window"));
      pop.addEventListener("click", function (e) {
        e.stopPropagation(); T.cur = n;
        if (T.open.shellPopped) { T.popInShell(); } else { T.popOutShell(); }
      });
      head.appendChild(pop);
    }
    /* Narrow screens: HIDE INBOX and SHOW INBOX in the MESSAGE header set
       settings.mailList to single (MESSAGE alone) or dual (inbox above) */
    if (n.kind === "MESSAGE" && (T.wasMobile || S.state.settings.layout === "single")) {
      var single = S.state.settings.mailList === "single";
      var tg = el("button", "pane-close", single ? S.t("SHOW INBOX") : S.t("HIDE INBOX")); tg.type = "button"; tg.dataset.sound = "fold";
      tg.setAttribute("aria-label", single ? S.t("Show the inbox above the message") : S.t("Hide the inbox and give the message the whole page"));
      tg.setAttribute("aria-pressed", single ? "false" : "true");
      tg.addEventListener("click", function (e) {
        e.stopPropagation();
        T.toggleInbox();
      });
      head.appendChild(tg);
    }
    if (CLOSABLE.indexOf(n.kind) !== -1) {
      var x = el("button", "pane-close", S.t("CLOSE")); x.type = "button"; x.dataset.sound = "close";
      x.setAttribute("aria-label", S.t("Close the {pane} pane", { pane: S.t(n.kind) }));
      x.addEventListener("click", function (e) { e.stopPropagation(); T.closePane(n); });
      head.appendChild(x);
    }
    p.appendChild(head);
    var body = el("div", "pane-body");
    body.appendChild(S.kinds[n.kind]);
    p.appendChild(body);
    p.addEventListener("mousedown", function () {
      if (T.cur !== n) {
        T.cur = n; mark(); focusCur(); syncShellAction();
      }
    }, true);
    return p;
  }
  function mark() {
    document.querySelectorAll("#panes .pane").forEach(function (p) {
      p.classList.toggle("cur", p._leaf === T.cur);
    });
  }
  /* The keyboard focus follows the active pane; the shell gives it to the
     command line. */
  function paneFocusTarget(pane, kind) {
    if (!pane) { return null; }
    if (kind === "FILES") { return pane.querySelector(".mc-panel.act .mc-list"); }
    if (kind === "VIEW") { return pane.querySelector(".v-body"); }
    if (kind === "REPORT") {
      return pane.querySelector(".blank.sel, .tab.act, .reportpane button, .reportpane");
    }
    if (kind === "MAIL") {
      return pane.querySelector(".mrow.unread, .mrow, .mailpane");
    }
    if (kind === "WATCH") {
      return pane.querySelector("button, [tabindex='0'], .watch") || pane;
    }
    return pane;
  }
  function focusCur() {
    var cmd = $("cmd");
    var desktop = S.isDesktop && S.isDesktop() && T.attached;
    var kind = desktop ? S.desk.activeKind() : (T.cur && T.cur.kind);
    if (kind === "SHELL") {
      if (cmd) { cmd.focus({ preventScroll: true }); }
      return;
    }
    if (!T.attached || !kind) {
      if (document.activeElement === cmd) { cmd.blur(); }
      return;
    }
    var pane = document.querySelector("#panes .pane.cur");
    var target = paneFocusTarget(pane, kind) || pane;
    if (!target) {
      if (document.activeElement === cmd) { cmd.blur(); }
      return;
    }
    if (!target.matches("button, input, select, textarea, a, [tabindex]")) { target.tabIndex = -1; }
    target.focus({ preventScroll: true });
  }
  T.focusCur = focusCur;
  function syncShellAction() {
    var shellAction = $("tmux-shell-action");
    if (!shellAction) {
      return;
    }
    var canPopOut = T.canPopOutShell && T.canPopOutShell();
    var canPopIn = T.canPopInShell && T.canPopInShell();
    shellAction.hidden = !(canPopOut || canPopIn);
    shellAction.textContent = canPopIn ? S.t("POP IN SHELL") : S.t("POP OUT SHELL");
    if (!shellAction._bound) {
      shellAction.addEventListener("click", function () {
        if (T.canPopInShell()) {
          T.popInShell();
        } else {
          T.popOutShell();
        }
      });
      shellAction._bound = true;
    }
  }
  /* The window list in the status bar at the bottom. */
  function bar() {
    var w = $("tmux-wins");
    w.textContent = "";
    w.appendChild(el("span", "tmux-sess", "[selk]"));
    syncShellAction();
    if (!T.attached) {
      return;
    }
    T.windows.forEach(function (x, i) {
      var b = el("button", "tmux-win" + (i === T.w ? " act" : ""), i + ":" + S.t(x.name) + (i === T.w ? "*" : "")); b.dataset.sound = "tab";
      b.type = "button";
      b.dataset.win = x.name;
      b.addEventListener("click", function () {
        T.select(i);
      });
      w.appendChild(b);
    });
  }
  T.select = function (i) {
    if (i < 0 || i >= T.windows.length) {
      return;
    } T.w = i; T.zoom = null; T.cur = leaves(win().root)[0]; T.render();
  };
  T.visible = function (k) {
    if (!T.attached) {
      return false;
    }
    if (S.isDesktop()) {
      return S.desk.visible(k);
    }
    return shown().some(function (l) {
      return l.kind === k;
    });
  };
  /* Show a kind: reopen it if it was closed, stay in the current window if it
     is there, else switch to the first window that has it. */
  T.goto = function (k) {
    if (!T.attached) { return false; }
    if (S.isDesktop()) { return S.desk.goto(k); }
    if (KINDS.indexOf(k) === -1) { return false; }
    /* FILES and VIEW hidden by the shell-only layout return until the next
       typed command. REPORT does not, since the caller prints it in the
       shell. MAIL and MESSAGE keep their own window. */
    if (hiddenByShellOnly(k, T.open)) {
      if (k === "REPORT") { return false; }
      T.open.revealed = true;
      if (CLOSABLE.indexOf(k) !== -1) { T.open[k] = true; }
      rebuild("DESK", k);
    }
    if (CLOSABLE.indexOf(k) !== -1 && !T.open[k]) { T.open[k] = true; rebuild(); }
    var here = shown().filter(function (l) { return l.kind === k; })[0];
    if (here) { T.cur = here; mark(); focusCur(); syncShellAction(); return true; }
    for (var i = 0; i < T.windows.length; i++) {
      var hit = leaves(T.windows[i].root).filter(function (l) { return l.kind === k; })[0];
      if (hit) { T.w = i; T.zoom = null; T.cur = hit; T.render(); return true; }
    }
    /* A kind hidden inside its window (the inbox with mailList "single") opens that window */
    for (var j = 0; j < T.windows.length; j++) {
      if (T.windows[j].name === k) { T.w = j; T.zoom = null; T.cur = leaves(T.windows[j].root)[0]; T.render(); return true; }
    }
    return false;
  };
  T.cycle = function (d) {
    var ls = shown(), i = ls.indexOf(T.cur); T.cur = ls[(i + (d || 1) + ls.length) % ls.length]; mark(); focusCur(); syncShellAction();
  };
  T.closePane = function (n) {
    var k = n && n.kind;
    if (k === "SHELL" && T.open.shellPopped) { T.open.shellPopped = false; rebuild(deskWin(T.open), "SHELL"); return; }
    if (CLOSABLE.indexOf(k) === -1) { return; }
    T.open[k] = false;
    var here = win() && win().name;
    rebuild(here === k ? deskWin(T.open) : here, null);
    if (S.msg) { S.msg(S.t("{pane} closed. Open it again from the bar at the bottom.", { pane: S.t(k) })); }
  };
  T.isClosable = function (kind) { return CLOSABLE.indexOf(kind) !== -1; };
  /* True where the inbox can be hidden: narrow screens and the SINGLE layout */
  T.canToggleInbox = function () {
    return T.attached && !S.isDesktop() && (T.wasMobile || S.state.settings.layout === "single");
  };
  /* HIDE INBOX and SHOW INBOX: switch settings.mailList between dual (inbox
     above MESSAGE) and single (MESSAGE alone), and show the MAIL window */
  T.toggleInbox = function () {
    var single = S.state.settings.mailList === "single";
    S.state.settings.mailList = single ? "dual" : "single"; S.save();
    rebuild("MAIL", single ? "MAIL" : "MESSAGE");
  };
  /* Called by S.run before every typed command: a shell-only DESK hides the
     panes it revealed. The current window stays when it still exists, else
     DESK with SHELL as the current pane. */
  T.endReveal = function () {
    if (!T.attached || !T.open || !T.open.revealed) { return; }
    T.open.revealed = false;
    var keep = win() && win().name;
    rebuild(keep === "DESK" ? deskWin(T.open) : keep, "SHELL");
  };
  /* True when this SHELL pane can pop out, whichever pane is active */
  T.canPopOut = function (leaf) {
    return T.attached && !S.isDesktop() && !T.wasMobile && S.state.settings.layout !== "single" && !shellOnly(T.open) &&
      !T.open.shellPopped && !!win() && win().name === "DESK" && !!leaf && leaf.kind === "SHELL";
  };
  T.canPopOutShell = function () {
    return T.attached && !S.isDesktop() && !T.wasMobile && S.state.settings.layout !== "single" && !shellOnly(T.open) &&
      !T.open.shellPopped && !!win() && win().name === "DESK" && !!T.cur && T.cur.kind === "SHELL";
  };
  T.canPopInShell = function () {
    return T.attached && !S.isDesktop() && !!T.open && T.open.shellPopped && !!win() && win().name === "SHELL";
  };
  T.popOutShell = function () {
    if (!T.canPopOutShell()) { return false; }
    T.open.shellPopped = true; rebuild("SHELL", "SHELL");
    return true;
  };
  T.popInShell = function () {
    if (!T.canPopInShell()) { return false; }
    T.open.shellPopped = false; rebuild(deskWin(T.open), "SHELL");
    return true;
  };
  T.zoomToggle = function () {
    T.zoom = T.zoom ? null : T.cur; T.render();
  };
  function setPrefix(v) {
    T.prefix = v; $("screen").classList.toggle("prefix", v);
  }
  /* Ctrl+B prefix keys: O and arrows move, Z zooms, N and P or digits switch
     windows, : opens the prompt, ? shows help, D detaches. */
  T.key = function (e) {
    if (!T.attached || S.mode !== "shell" || S.isDesktop()) {
      return false;
    }
    if (e.ctrlKey && (e.key === "b" || e.key === "B")) {
      e.preventDefault(); setPrefix(true); return true;
    }
    if (!T.prefix) {
      return false;
    }
    if ( [
      "Shift",
      "Control",
      "Alt",
      "Meta"
    ].indexOf(e.key) !== -1) {
      return true;
    }
    e.preventDefault(); e.stopPropagation();
    setPrefix(false);
    var k = e.key;
    if (k === "o" || k === "ArrowRight" || k === "ArrowDown") {
      T.cycle(1);
    }
    else if (k === "ArrowLeft" || k === "ArrowUp") {
      T.cycle(-1);
    }
    else if (k === "z") {
      T.zoomToggle();
    }
    else if (k === "n") {
      T.select((T.w + 1) % T.windows.length);
    }
    else if (k === "p") {
      T.select((T.w - 1 + T.windows.length) % T.windows.length);
    }
    else if (/^[0-9]$/.test(k)) {
      T.select(+k);
    }
    else if (k === ":") {
      T.prompt();
    }
    else if (k === "?") {
      S.run("help", false);
    }
    else if (k === "d") {
      S.logout();
    }
    return true;
  };
  T.prompt = function () {
    var p = $("tmux-prompt");
    p.hidden = false; p.value = ""; p.focus();
  };
  window.addEventListener("resize", function () {
    if (!T.attached) {
      return;
    }
    var inDesk = $("screen").classList.contains("desktop");
    if (inDesk !== S.isDesktop()) {
      S.syncContext(); S.enterMode(); return;
    }
    if (inDesk) {
      return;
    }
    if (T.mobile() !== T.wasMobile) {
      var k = T.cur && T.cur.kind; T.init(k);
    }
  });
})();
