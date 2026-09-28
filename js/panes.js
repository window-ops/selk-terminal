/* tmux mode. Holds the window model (what is open), builds windows and panes
   from it, handles Ctrl+B keys, the status bar, messages and the clock. */
(function () {
  var S = window.SELK;
  var KINDS = [
    "FILES",
    "VIEW",
    "REPORT",
    "SHELL",
    "MAIL",
    "WATCH"
  ];
  S.kinds = {};
  S.registerKind = function (k, el) {
    S.kinds[k] = el;
  };
  function $(id) {
    return document.getElementById(id);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  S.notificationHost = function () {
    var screen = $("screen"), host = screen && screen.querySelector(".notification-stack");
    if (!screen) {
      return null;
    }
    if (!host) {
      host = document.createElement("div");
      host.className = "notification-stack";
      host.setAttribute("aria-label", "Notifications and tutorial");
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
  /* Window model. One small description says what is open. Every change edits the
     description and rebuilds all windows from it, so no window depends on another
     window, and the current pane is remembered by name, never by object. */
  var CLOSABLE = ["REPORT", "MAIL", "WATCH"];
  function freshOpen() {
    return { REPORT: false, MAIL: true, WATCH: true, shellOut: false };
  }
  function layoutWindows(layout, mobile, o) {
    var list = [];
    if (mobile || layout === "single") {
      ["SHELL", "FILES", "VIEW", "REPORT", "MAIL", "WATCH"].forEach(function (k) {
        if (CLOSABLE.indexOf(k) === -1 || o[k]) { list.push({ name: k, root: L(k) }); }
      });
      return list;
    }
    var view = o.REPORT ? H(L("VIEW"), L("REPORT"), 0.55) : L("VIEW");
    var desk = layout === "three"
      ? V(L("FILES"), o.shellOut ? view : H(view, L("SHELL"), 0.62), 0.44)
      : V(o.shellOut ? L("FILES") : H(L("FILES"), L("SHELL"), 0.62), view, 0.44);
    list.push({ name: "DESK", root: desk });
    if (o.MAIL) { list.push({ name: "MAIL", root: V(L("MAIL"), L("VIEW"), 0.4) }); }
    if (o.WATCH) { list.push({ name: "WATCH", root: L("WATCH") }); }
    if (o.shellOut) { list.push({ name: "SHELL", root: L("SHELL") }); }
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
  Object.defineProperty(T, "shellPoppedOut", { get: function () { return !!(T.open && T.open.shellOut); } });
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
    var name = winName || (win() && win().name) || "DESK";
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
    rebuild("DESK", null);
    if (keepKind) { T.goto(keepKind); }
  };
  /* Leave the session: back to the single shell used by the title and sign-in. */
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
  /* Draw the current window. Window kinds are single DOM elements that move
     between panes; kinds that are not shown wait in #kind-park. */
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
  function build(n) {
    if (n.leaf) {
      return paneEl(n);
    }
    var d = el("div", "split " + n.dir), a = build(n.a), b = build(n.b);
    a.style.flex = n.r + " 1 0"; b.style.flex = (1 - n.r) + " 1 0";
    d.appendChild(a); d.appendChild(b);
    return d;
  }
  function paneEl(n) {
    var p = el("div", "pane" + (n === T.cur ? " cur" : ""));
    p._leaf = n;
    var idx = leaves(win().root).indexOf(n);
    var head = el("div", "pane-head");
    head.appendChild(el("span", "pane-name", idx + ": " + n.kind + (T.zoom ? " [ZOOM]" : "")));
    /* Header buttons: SHELL can pop out of DESK into its own window and back in;
       REPORT, MAIL and WATCH can close. */
    if (n.kind === "SHELL" && (T.canPopOut(n) || T.canPopInShell())) {
      var pop = el("button", "pane-close", T.open.shellOut ? "POP IN" : "POP OUT"); pop.type = "button";
      pop.setAttribute("aria-label", T.open.shellOut ? "Put the shell back into DESK" : "Give the shell its own window");
      pop.addEventListener("click", function (e) {
        e.stopPropagation(); T.cur = n;
        if (T.open.shellOut) { T.popInShell(); } else { T.popOutShell(); }
      });
      head.appendChild(pop);
    }
    if (CLOSABLE.indexOf(n.kind) !== -1) {
      var x = el("button", "pane-close", "CLOSE"); x.type = "button";
      x.setAttribute("aria-label", "Close the " + n.kind + " pane");
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
  /* Keyboard focus follows the active pane: the shell gets the command line. */
  function focusCur() {
    var cmd = $("cmd");
    var k = S.isDesktop && S.isDesktop() && T.attached ? S.desk.activeKind() : (T.cur && T.cur.kind);
    if (k === "SHELL") {
      if (!("ontouchstart" in window)) {
        cmd.focus( {
          preventScroll: true
        });
      }
    }
    else if (document.activeElement === cmd) {
      cmd.blur();
    }
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
    shellAction.textContent = canPopIn ? "POP IN SHELL" : "POP OUT SHELL";
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
      var b = el("button", "tmux-win" + (i === T.w ? " act" : ""), i + ":" + x.name + (i === T.w ? "*" : ""));
      b.type = "button";
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
     is there, otherwise switch to the first window that holds it. */
  T.goto = function (k) {
    if (!T.attached) { return false; }
    if (S.isDesktop()) { return S.desk.goto(k); }
    if (KINDS.indexOf(k) === -1) { return false; }
    if (CLOSABLE.indexOf(k) !== -1 && !T.open[k]) { T.open[k] = true; rebuild(); }
    var here = shown().filter(function (l) { return l.kind === k; })[0];
    if (here) { T.cur = here; mark(); focusCur(); syncShellAction(); return true; }
    for (var i = 0; i < T.windows.length; i++) {
      var hit = leaves(T.windows[i].root).filter(function (l) { return l.kind === k; })[0];
      if (hit) { T.w = i; T.zoom = null; T.cur = hit; T.render(); return true; }
    }
    return false;
  };
  T.cycle = function (d) {
    var ls = shown(), i = ls.indexOf(T.cur); T.cur = ls[(i + (d || 1) + ls.length) % ls.length]; mark(); focusCur(); syncShellAction();
  };
  T.closePane = function (n) {
    var k = n && n.kind;
    if (k === "SHELL" && T.open.shellOut) { T.open.shellOut = false; rebuild("DESK", "SHELL"); return; }
    if (CLOSABLE.indexOf(k) === -1) { return; }
    T.open[k] = false;
    var here = win() && win().name;
    rebuild(here === k ? "DESK" : here, null);
    if (S.msg) { S.msg(k + " closed. Open it again from the bar at the bottom."); }
  };
  T.isClosable = function (kind) { return CLOSABLE.indexOf(kind) !== -1; };
  /* True when this SHELL pane could pop out (ignores which pane is active). */
  T.canPopOut = function (leaf) {
    return T.attached && !S.isDesktop() && !T.wasMobile && S.state.settings.layout !== "single" &&
      !T.open.shellOut && !!win() && win().name === "DESK" && !!leaf && leaf.kind === "SHELL";
  };
  T.canPopOutShell = function () {
    return T.attached && !S.isDesktop() && !T.wasMobile && S.state.settings.layout !== "single" &&
      !T.open.shellOut && !!win() && win().name === "DESK" && !!T.cur && T.cur.kind === "SHELL";
  };
  T.canPopInShell = function () {
    return T.attached && !S.isDesktop() && !!T.open && T.open.shellOut && !!win() && win().name === "SHELL";
  };
  T.popOutShell = function () {
    if (!T.canPopOutShell()) { return false; }
    T.open.shellOut = true; rebuild("SHELL", "SHELL");
    return true;
  };
  T.popInShell = function () {
    if (!T.canPopInShell()) { return false; }
    T.open.shellOut = false; rebuild("DESK", "SHELL");
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
  var msgTimer;
  S.msg = function (text, cls) {
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
    if (!T.visible("SHELL")) {
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
      if (T.attached) {
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
    $("st-uplink").textContent = "UPLINK " + up;
    $("st-uplink").classList.toggle("live", up !== "IDLE");
    $("st-sound").textContent = st.sound ? "SOUND ON" : "SOUND OFF";
    $("st-sound").setAttribute("aria-pressed", st.sound ? "true" : "false");
    $("st-hint").hidden = !st.light;
    $("st-hint").classList.toggle("lit", !!S.hintLit);
    var unread = st.mail.filter(function (m) {
      return !m.read;
    }).length;
    if (unread === 0 && S.dismissMailToast) {
      S.dismissMailToast();
    }
    $("st-mail").textContent = unread ? "MAIL " + unread : "MAIL";
    $("st-mail").classList.toggle("live", unread > 0);
    var wc = $("wb-clock"); if (wc) {
      wc.textContent = S.clockText();
    }
    var wm = $("wb-mail"); if (wm) {
      wm.textContent = unread ? "MAIL " + unread : "MAIL"; wm.classList.toggle("live", unread > 0);
    }
    var wh = $("wb-hint"); if (wh) {
      wh.hidden = !st.light; wh.classList.toggle("lit", !!S.hintLit);
    }
    var ws = $("wb-sound"); if (ws) {
      ws.textContent = st.sound ? "SOUND ON" : "SOUND OFF";
    }
  };
  window.addEventListener("resize", function () {
    if (!T.attached) {
      return;
    }
    if (S.isDesktop()) {
      $("screen").classList.toggle("desk-mobile", T.mobile()); return;
    }
    if (T.mobile() !== T.wasMobile) {
      var k = T.cur && T.cur.kind; T.init(k);
    }
  });
})();
