/* Desktop mode: a Workbench-style screen with grouped icons, drawers and
   movable windows. It shows the same window kinds as tmux mode, through
   S.desk. */
(function () {
  var S = window.SELK;
  var el = S.el, $ = S.$;
  var ICONS = {
    disk: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="1" y="0" width="14" height="12" fill="#1E2427"/><rect x="2" y="1" width="12" height="10" fill="#D6C396"/><rect x="4" y="1" width="7" height="4" fill="#8F9A9A"/><rect x="9" y="2" width="1" height="2" fill="#1E2427"/><rect x="4" y="7" width="8" height="4" fill="#F2E6C4"/></svg>',
    drawer: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="0" y="2" width="16" height="10" fill="#1E2427"/><rect x="1" y="3" width="14" height="8" fill="#D6C396"/><rect x="1" y="6" width="14" height="1" fill="#1E2427"/><rect x="6" y="4" width="4" height="1" fill="#C7843A"/><rect x="6" y="8" width="4" height="1" fill="#C7843A"/></svg>',
    locked: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="0" y="2" width="16" height="10" fill="#1E2427"/><rect x="1" y="3" width="14" height="8" fill="#8F9A9A"/><rect x="1" y="6" width="14" height="1" fill="#1E2427"/><rect x="6" y="4" width="4" height="6" fill="#B4553E"/><rect x="7" y="5" width="2" height="2" fill="#1E2427"/></svg>',
    doc: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="3" y="0" width="10" height="12" fill="#1E2427"/><rect x="4" y="1" width="8" height="10" fill="#F2E6C4"/><rect x="5" y="3" width="6" height="1" fill="#8F9A9A"/><rect x="5" y="5" width="6" height="1" fill="#8F9A9A"/><rect x="5" y="7" width="4" height="1" fill="#8F9A9A"/></svg>',
    tool: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="1" y="0" width="14" height="9" fill="#1E2427"/><rect x="2" y="1" width="12" height="7" fill="#C7843A"/><rect x="3" y="2" width="5" height="1" fill="#1E2427"/><rect x="5" y="9" width="6" height="2" fill="#1E2427"/><rect x="3" y="11" width="10" height="1" fill="#1E2427"/></svg>',
    mail: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="0" y="1" width="16" height="10" fill="#1E2427"/><rect x="1" y="2" width="14" height="8" fill="#F2E6C4"/><rect x="1" y="2" width="2" height="1" fill="#1E2427"/><rect x="3" y="3" width="2" height="1" fill="#1E2427"/><rect x="5" y="4" width="2" height="1" fill="#1E2427"/><rect x="7" y="5" width="2" height="1" fill="#1E2427"/><rect x="9" y="4" width="2" height="1" fill="#1E2427"/><rect x="11" y="3" width="2" height="1" fill="#1E2427"/><rect x="13" y="2" width="2" height="1" fill="#1E2427"/></svg>',
    cam: '<svg viewBox="0 0 16 12" shape-rendering="crispEdges"><rect x="1" y="2" width="11" height="8" fill="#1E2427"/><rect x="2" y="3" width="9" height="6" fill="#D6C396"/><rect x="5" y="4" width="3" height="4" fill="#1E2427"/><rect x="12" y="4" width="3" height="4" fill="#1E2427"/><rect x="3" y="3" width="1" height="1" fill="#B4553E"/></svg>'
  };
  var GROUPS = [
    [
      "WORK",
      [
        [
          "SELK",
          "disk",
          function () {
            openDisk();
          }
        ],
        [
          "REPORT",
          "doc",
          function () {
            D.goto("REPORT"); S.emit("report-open");
          }
        ],
        [
          "MAIL",
          "mail",
          function () {
            D.goto("MAIL");
          }
        ],
        [
          "READER",
          "tool",
          function () {
            D.goto("VIEW");
          }
        ],
        [
          "SHELL",
          "tool",
          function () {
            D.goto("SHELL");
          }
        ]
      ]
    ],
    [
      "SITE",
      [
        [
          "WATCH",
          "tool",
          function () {
            D.goto("WATCH");
          }
        ],
        [
          "SV-4 LIVE",
          "cam",
          function () {
            openLive();
          }
        ]
      ]
    ],
    [
      "SYSTEM",
      [
        [
          "SETUP",
          "tool",
          function () {
            S.settingsDialog();
          }
        ],
        [
          "TUTORIAL",
          "doc",
          function () {
            S.tut.refresher();
          }
        ],
        [
          "STORAGE",
          "tool",
          function () {
            S.storagePage();
          }
        ],
        [
          "ABOUT",
          "doc",
          function () {
            S.about();
          }
        ],
        [
          "HELP",
          "doc",
          function () {
            S.runClick("help", false);
          }
        ]
      ]
    ]
  ];
  var D = S.desk = {
    wins: [],
    z: 10,
    active: null
  };
  var root, back;
  function icon(label, kind, open, opts) {
    var b = el("div", "wb-icon" + (opts && opts.dim ? " dim" : "") + (kind === "locked" ? " locked" : ""));
    b.tabIndex = 0; b.setAttribute("role", "button");
    var img = el("span", "wb-img"); img.innerHTML = ICONS[kind];
    b.appendChild(img);
    b.appendChild(el("span", "wb-label", label));
    if (opts && opts.sec) {
      b.dataset.sec = opts.sec;
    }
    if (kind === "locked") {
      b.title = S.t("Locked. Open it to enter the password."); b.appendChild(el("span", "wb-lock", S.t("LOCKED")));
    }
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var box = b.parentNode;
      if (b.classList.contains("sel") || S.state.settings.click === "single") {
        open(); return;
      }
      box.querySelectorAll(".wb-icon.sel").forEach(function (n) {
        n.classList.remove("sel");
      });
      b.classList.add("sel");
    });
    b.addEventListener("dblclick", function (e) {
      e.stopPropagation(); open();
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); open();
      } else if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End"].indexOf(e.key) !== -1) {
        var icons = [].slice.call(b.parentNode.querySelectorAll(".wb-icon")), i = icons.indexOf(b), next = i;
        if (e.key === "Home") { next = 0; }
        else if (e.key === "End") { next = icons.length - 1; }
        else { next += (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 1; }
        if (icons[next]) { e.preventDefault(); icons[next].focus(); }
      }
    });
    if (opts && opts.id) {
      b.draggable = true;
      b.dataset.entry = opts.id;
      b.addEventListener("dragstart", function (e) {
        S.dragStart(e, opts.id);
      });
      var badge = el("span", "wb-badge");
      badge.title = S.t("Drag onto a report blank, or right-click for options");
      badge.setAttribute("role", "img"); badge.setAttribute("aria-label", S.t("Can fill a report blank"));
      badge.appendChild(el("span", "wb-dots"));
      img.appendChild(badge);
    }
    return b;
  }
  function place(o) {
    var area = deskArea(), bw = area.w, bh = area.h;
    return {
      x: Math.round(o.x * bw),
      y: Math.round(o.y * bh),
      w: Math.round(o.w * bw),
      h: Math.round(o.h * bh)
    };
  }
  /* Default windows of each kind. ax and ay place the window in the free
     space of the desk, from 0 (left or top) to 1 (right or bottom), so a
     window of any size stays inside. The size comes from the content
     (contentSize below): cols are character columns, rows are lines, and fit
     sizes the height to the content. */
  var SPOTS = {
    VIEW: { t: "READER", ax: 0.7, ay: 0.05, cols: 72, rows: 26, min: 6 },
    REPORT: { t: "REPORT", ax: 1, ay: 1, cols: 66, fit: true },
    SHELL: { t: "SHELL", ax: 0.15, ay: 1, cols: 80, rows: 24 },
    MAIL: { t: "MAIL", ax: 0.4, ay: 0.08, cols: 56, fit: true, rows: 8 },
    MESSAGE: { t: "MESSAGE", ax: 0.55, ay: 0.2, cols: 72, rows: 18, min: 6 },
    WATCH: { t: "WATCH", ax: 0.9, ay: 0.1, cols: 64, fit: true }
  };
  /* The desk area that windows use: the backdrop without the tool column */
  function deskArea() {
    var tools = back.querySelector(".wb-tools");
    return {
      w: (back.clientWidth || 900) - (tools && !S.tmux.mobile() ? tools.offsetWidth + 20 : 0),
      h: back.clientHeight || 600
    };
  }
  /* The element whose width sets the text columns of a kind: the shell log,
     the reader body, the report paper, or the kind itself */
  function textBox(kind, root) {
    var sel = { SHELL: "#log", VIEW: ".v-body", MESSAGE: ".v-body", REPORT: ".paper" }[kind];
    return (sel && root.querySelector(sel)) || root;
  }
  function px(cs, k) { return parseFloat(cs[k]) || 0; }
  /* Width of one character and height of one line in an element's font */
  function metrics(node) {
    var probe = el("span", "", "0000000000");
    var ps = probe.style;
    ps.position = "absolute"; ps.visibility = "hidden"; ps.whiteSpace = "pre"; ps.padding = "0"; ps.border = "0";
    node.appendChild(probe);
    var ch = probe.getBoundingClientRect().width / 10, cs = getComputedStyle(node);
    probe.remove();
    var lh = parseFloat(cs.lineHeight);
    if (!lh) { lh = px(cs, "fontSize") * 1.5; }
    if (node.id === "log") { lh = px(cs, "fontSize") * 1.5; }
    return { ch: ch, lh: lh };
  }
  /* Size a new window to its content, then place it by its anchors inside the
     desk. The window grows by the difference between the space its text box
     has and the space the text needs, so borders, title bars, padding and
     scroll bars count as drawn. */
  function contentSize(w, spot) {
    var box = w.el, root = S.kinds[w.kind], area = deskArea();
    var tb = textBox(w.kind, root), cs = getComputedStyle(tb), m = metrics(tb);
    var innerW = tb.clientWidth - px(cs, "paddingLeft") - px(cs, "paddingRight");
    var width = box.offsetWidth + Math.ceil(spot.cols * m.ch) - innerW;
    var height = box.offsetHeight;
    var scroller = (w.kind === "SHELL" || w.kind === "VIEW" || w.kind === "MESSAGE") ? tb : root;
    var scs = getComputedStyle(scroller);
    if (spot.rows && !spot.fit) {
      var innerH = scroller.clientHeight - px(scs, "paddingTop") - px(scs, "paddingBottom");
      height += Math.ceil(spot.rows * m.lh) - innerH;
    }
    box.style.width = clamp(width, 180, area.w) + "px";
    if (spot.fit) {
      /* Content height is read at the final width, since text wraps */
      height = box.offsetHeight + scroller.scrollHeight - scroller.clientHeight;
      if (spot.rows) {
        height = Math.max(height, box.offsetHeight - scroller.clientHeight + Math.ceil(spot.rows * m.lh));
      }
    }
    box.style.height = clamp(height, 120, area.h) + "px";
    box.style.left = Math.round(spot.ax * Math.max(0, area.w - box.offsetWidth)) + "px";
    box.style.top = Math.round(spot.ay * Math.max(0, area.h - box.offsetHeight)) + "px";
  }
  function win(o) {
    var found = D.wins.filter(function (w) {
      return w.id === o.id;
    })[0];
    if (found) {
      front(found, true); return found;
    }
    var r = place(o), w = {
      id: o.id,
      kind: o.kind,
      build: o.build
    };
    var box = el("div", "wb-win");
    box.style.left = r.x + "px"; box.style.top = r.y + "px"; box.style.width = r.w + "px"; box.style.height = r.h + "px";
    var bar = el("div", "wb-tbar");
    var close = el("button", "wb-gad wb-close", ""); close.type = "button"; close.dataset.sound = "close"; close.title = S.t("Close"); close.setAttribute("aria-label", S.t("Close window"));
    var depth = el("button", "wb-gad wb-depth", ""); depth.type = "button"; depth.dataset.sound = "tab"; depth.title = S.t("Depth"); depth.setAttribute("aria-label", S.t("Send window back or forward"));
    bar.appendChild(close); bar.appendChild(el("span", "wb-wtitle", S.t(o.title))); bar.appendChild(depth);
    var body = el("div", "wb-wbody");
    var size = el("div", "wb-size");
    box.appendChild(bar); box.appendChild(body); box.appendChild(size);
    w.el = box; w.body = body;
    if (o.kind) {
      var k = S.kinds[o.kind]; if (k.parentNode) {
        k.parentNode.removeChild(k);
      } body.appendChild(k);
    }
    else if (o.build) {
      o.build(body);
    }
    close.addEventListener("click", function (e) {
      e.stopPropagation(); closeWin(w);
    });
    depth.addEventListener("click", function (e) {
      e.stopPropagation(); if (D.active === w) {
        sendBack(w);
      } else {
        front(w);
      }
    });
    box.addEventListener("pointerdown", function () {
      front(w);
    });
    box.addEventListener("focusin", function () {
      if (D.active !== w) { front(w); }
    });
    drag(bar, function (dx, dy, s) {
      box.style.left = clamp(s.l + dx, 0, back.clientWidth - box.offsetWidth) + "px";
      box.style.top = clamp(s.t + dy, 0, back.clientHeight - box.offsetHeight) + "px";
    }, box);
    drag(size, function (dx, dy, s) {
      w.userSized = true;
      box.style.width = clamp(s.w + dx, 180, back.clientWidth - box.offsetLeft) + "px";
      box.style.height = clamp(s.h + dy, 120, back.clientHeight - box.offsetTop) + "px";
    }, box);
    back.appendChild(box);
    D.wins.push(w);
    fit(w);
    front(w, true);
    S.snd.hdd(2);
    return w;
  }
  function drag(handle, move, box) {
    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".wb-gad") || S.tmux.mobile()) {
        return;
      }
      e.preventDefault();
      var isResize = handle.classList.contains("wb-size");
      var cls = isResize ? "resizing" : "moving";
      var ended = false;
      document.body.classList.remove("moving", "resizing");
      document.body.classList.add(cls);
      try {
        handle.setPointerCapture(e.pointerId);
      } catch (err) {}
      var sx = e.clientX, sy = e.clientY, s = {
        l: box.offsetLeft,
        t: box.offsetTop,
        w: box.offsetWidth,
        h: box.offsetHeight
      };
      function mv(ev) {
        move(ev.clientX - sx, ev.clientY - sy, s);
      }
      function up(ev) {
        if (ended) {
          return;
        }
        ended = true;
        document.removeEventListener("pointermove", mv);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
        window.removeEventListener("pointerup", up, true);
        window.removeEventListener("pointercancel", up, true);
        window.removeEventListener("blur", up);
        window.removeEventListener("pagehide", up);
        handle.removeEventListener("lostpointercapture", up);
        document.body.classList.remove("moving", "resizing");
        try {
          handle.releasePointerCapture(ev.pointerId);
        } catch (err) {}
      }
      document.addEventListener("pointermove", mv);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
      window.addEventListener("pointerup", up, true);
      window.addEventListener("pointercancel", up, true);
      window.addEventListener("blur", up);
      window.addEventListener("pagehide", up);
      handle.addEventListener("lostpointercapture", up);
    });
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(Math.max(lo, hi), v));
  }
  function fit(w) {
    var b = w.el;
    b.style.width = Math.min(b.offsetWidth, back.clientWidth) + "px";
    b.style.height = Math.min(b.offsetHeight, back.clientHeight) + "px";
    b.style.left = clamp(b.offsetLeft, 0, back.clientWidth - b.offsetWidth) + "px";
    b.style.top = clamp(b.offsetTop, 0, back.clientHeight - b.offsetHeight) + "px";
  }
  window.addEventListener("resize", function () {
    if (back && back.isConnected) {
      D.wins.forEach(fit);
    }
  });
  D.order = [];
  function focusWindow(w) {
    var target = w && w.el.querySelector(".wb-icon, button:not(.wb-gad), [tabindex='0']");
    if (!target && w) { target = w.el.querySelector(".wb-close"); }
    if (target) { target.focus({ preventScroll: true }); }
  }
  /* Stacking: D.order lists the windows front first, and restack() gives them
     z-index values from D.z upward in that order. The values stay below D.z
     plus the number of open windows. */
  function restack() {
    var n = D.order.length;
    D.order.forEach(function (x, i) {
      x.el.style.zIndex = D.z + n - i;
    });
  }
  function front(w, moveFocus) {
    D.order = [
      w
    ].concat(D.order.filter(function (x) {
      return x !== w;
    }));
    restack();
    D.active = w; mark(); S.tmux.focusCur();
    if (moveFocus) { focusWindow(w); }
  }
  /* The depth gadget sends the active window to the back */
  function sendBack(w) {
    D.order = D.order.filter(function (x) {
      return x !== w;
    }).concat([
      w
    ]);
    restack();
    D.active = null; mark();
  }
  function mark() {
    D.wins.forEach(function (w) {
      w.el.classList.toggle("act", w === D.active);
    });
  }
  function closeWin(w) {
    var restoreFocus = w.el.contains(document.activeElement);
    if (w.kind) {
      var k = S.kinds[w.kind]; if (k.parentNode === w.body) {
        $("kind-park").appendChild(k);
      }
    }
    w.el.remove();
    D.wins = D.wins.filter(function (x) {
      return x !== w;
    });
    D.order = D.order.filter(function (x) {
      return x !== w;
    });
    restack();
    D.active = D.wins[D.wins.length - 1] || null; mark();
    if (restoreFocus) {
      if (D.active) { focusWindow(D.active); }
      else { var title = document.querySelector(".wb-title"); if (title) { title.focus({ preventScroll: true }); } }
    }
  }
  function openDisk() {
    win( {
      id: "disk",
      title: "SELK:",
      x: 0.02,
      y: 0.04,
      w: 0.32,
      h: 0.46,
      build: function (body) {
        body.classList.add("wb-icons"); fillDisk(body);
      }
    });
  }
  function fillDisk(body) {
    body.textContent = "";
    S.sections().forEach(function (s) {
      var open = S.isUnlocked(s.id);
      body.appendChild(icon(s.name.toUpperCase(), open ? "drawer" : "locked", function () {
        if (!open) {
          S.lockedRequester(s.id); return;
        }
        openDrawer(s.id);
      }, {
        sec: s.id
      }));
    });
  }
  function openDrawer(sec) {
    var n = D.wins.length;
    win( {
      id: "drawer-" + sec,
      title: "SELK:" + S.sectionById(sec).name.toUpperCase(),
      x: 0.06 + 0.02 * (n % 5),
      y: 0.12 + 0.03 * (n % 5),
      w: 0.34,
      h: 0.42,
      build: function (body) {
        body.classList.add("wb-icons"); body.dataset.sec = sec; fillDrawer(body, sec);
      }
    });
  }
  function fillDrawer(body, sec) {
    body.textContent = "";
    S.entriesOf(sec).forEach(function (e) {
      body.appendChild(icon(e.id.split("/")[1], "doc", function () {
        S.runClick("open " + e.id, false);
      }, !S.entryDraggable(e.id) ? {
        dim: S.state.read.indexOf(e.id) !== -1
      } : {
        id: e.id,
        dim: S.state.read.indexOf(e.id) !== -1
      }));
    });
  }
  function openLive() {
    win( {
      id: "live",
      title: "SV-4 LIVE, MAST-01",
      x: 0.4,
      y: 0.08,
      w: 0.44,
      h: 0.42,
      build: function (body) {
        body.classList.add("wb-live"); body.appendChild(S.live.canvas());
      }
    });
  }
  D.openDrawer = openDrawer;
  D.winFor = function (node) {
    return D.wins.filter(function (w) {
      return w.el === node;
    })[0];
  };
  D.close = function (w) {
    if (w) {
      closeWin(w);
    }
  };
  D.front = function (w) {
    if (w) {
      front(w, true);
    }
  };
  D.closeAll = function () {
    D.wins.slice().forEach(closeWin);
  };
  D.maximise = function (w) {
    if (!w) {
      return;
    }
    var b = w.el.style;
    if (w.max) {
      b.left = w.max[0]; b.top = w.max[1]; b.width = w.max[2]; b.height = w.max[3]; w.max = null;
      w.el.classList.remove("maximised");
    }
    else {
      w.max = [
        b.left,
        b.top,
        b.width,
        b.height
      ]; b.left = "0px"; b.top = "0px"; b.width = "100%"; b.height = "100%";
      /* No drop shadow or outer border while maximised, so the window reaches
         every edge. */
      w.el.classList.add("maximised");
    }
    front(w);
  };
  D.titleOf = function (w) {
    return w.el.querySelector(".wb-wtitle").textContent;
  };
  /* The entry icon selected in any drawer window, if any. */
  D.selectedEntry = function () {
    var n = document.querySelector(".wb-win .wb-icon.sel[data-entry]");
    return n ? n.dataset.entry : null;
  };
  D.visible = function (k) {
    return D.wins.some(function (w) {
      return w.kind === k;
    });
  };
  D.goto = function (k) {
    if (k === "FILES") {
      openDisk();
      return true;
    }
    var spot = SPOTS[k];
    if (!spot) {
      return false;
    }
    var fresh = !D.wins.some(function (x) { return x.id === "k-" + k; });
    var w = win( {
      id: "k-" + k,
      kind: k,
      title: spot.t,
      x: 0,
      y: 0,
      w: 0.5,
      h: 0.5
    });
    if (k === "REPORT") {
      S.rep.render();
    }
    if (k === "MAIL") {
      S.mailpane.render();
    }
    if (k === "WATCH") {
      S.watch.render();
    }
    if (fresh) {
      contentSize(w, spot);
    }
    return true;
  };
  /* READER and MESSAGE take the height of their content: at least min lines,
     at most rows lines, with a scroll bar beyond. viewer.js calls this each
     time new text is put in, before the text is revealed, so the full height
     is measured. A window the player resized or maximised keeps its size. The
     window stays inside the desk. */
  D.fitContent = function (kind) {
    if (!S.isDesktop()) { return; }
    var w = D.wins.filter(function (x) { return x.kind === kind; })[0], spot = SPOTS[kind];
    if (!w || !spot || !spot.min || w.userSized || w.max) { return; }
    var box = w.el, area = deskArea(), tb = textBox(kind, S.kinds[kind]);
    var cs = getComputedStyle(tb), m = metrics(tb), pad = px(cs, "paddingTop") + px(cs, "paddingBottom");
    /* Shrink first: scrollHeight never reads less than the box, so the
       content height shows only once the box is smaller */
    box.style.height = "120px";
    var chrome = box.offsetHeight - tb.clientHeight;
    var inner = Math.min(Math.max(tb.scrollHeight - pad, spot.min * m.lh), spot.rows * m.lh);
    var height = clamp(Math.ceil(chrome + pad + inner), 120, area.h);
    box.style.height = height + "px";
    box.style.top = clamp(box.offsetTop, 0, area.h - height) + "px";
  };
  D.activeKind = function () {
    return D.active && D.active.kind;
  };
  D.refresh = function () {
    D.wins.forEach(function (w) {
      if (w.id === "disk") {
        fillDisk(w.body);
      }
      else if (w.id.indexOf("drawer-") === 0) {
        fillDrawer(w.body, w.id.slice(7));
      }
    });
  };
  function build() {
    root = $("desk");
    root.textContent = "";
    var bar = el("div", "wb-bar");
    var ttl = el("button", "wb-title", "SELK WORKBENCH 1.0"); ttl.type = "button"; ttl.title = S.t("About Selk OS");
    ttl.addEventListener("click", function () {
      S.about();
    });
    bar.appendChild(ttl);
    bar.appendChild(el("span", "wb-info", S.t("4 096 000 bytes free")));
    var msg = el("span", "wb-msg bar-msg is-empty"); msg.id = "wb-msg"; msg.setAttribute("role", "status"); bar.appendChild(msg);
    var right = el("span", "wb-right");
    var mail = el("button", "wb-btn", S.t("MAIL")); mail.id = "wb-mail"; mail.type = "button"; mail.dataset.sound = "open";
    mail.addEventListener("click", function () {
      D.goto("MAIL");
    });
    var report = el("button", "wb-btn", S.t("REPORT")); report.id = "wb-report"; report.type = "button"; report.dataset.sound = "open";
    report.addEventListener("click", function () {
      D.goto("REPORT"); S.emit("report-open");
    });
    var mode = el("button", "wb-btn", "TMUX"); mode.type = "button"; mode.dataset.sound = "toggle"; mode.title = S.t("Switch to tmux mode");
    mode.addEventListener("click", function () {
      S.setMode("tmux");
    });
    var snd = el("button", "wb-btn", S.state.sound ? S.t("SOUND ON") : S.t("SOUND OFF")); snd.id = "wb-sound"; snd.type = "button"; snd.dataset.sound = "toggle";
    snd.addEventListener("click", function () {
      S.runClick("sound " + (S.state.sound ? "off" : "on"), false);
    });
    /* HINT lamp, as in the tmux status bar: shown when Hint light is on, lit when the open entry answers a blank */
    var hintLamp = el("span", "st-hint", S.t("HINT")); hintLamp.id = "wb-hint"; hintLamp.hidden = true; right.appendChild(hintLamp);
    var uplink = el("button", "st-btn st-uplink", S.t("UPLINK") + " " + S.t(S.state.pending.length ? "RX" : (S.transmitting ? "TX" : "IDLE")));
    uplink.id = "wb-uplink"; uplink.type = "button"; uplink.dataset.status = "uplink";
    uplink.title = S.t("Show uplink status"); uplink.setAttribute("aria-label", uplink.title);
    uplink.setAttribute("aria-expanded", "false"); uplink.setAttribute("aria-controls", "status-info-pop");
    right.appendChild(uplink);
    var saveLamp = el("button", "st-save", S.t("SAVED")); saveLamp.id = "wb-save"; saveLamp.type = "button"; saveLamp.hidden = true;
    saveLamp.dataset.status = "storage";
    saveLamp.title = S.t("Show storage status");
    saveLamp.setAttribute("aria-label", S.t("Show storage status"));
    saveLamp.setAttribute("aria-expanded", "false");
    saveLamp.setAttribute("aria-controls", "status-info-pop");
    right.appendChild(saveLamp);
    right.appendChild(mail); right.appendChild(report); right.appendChild(snd); right.appendChild(mode);
    right.appendChild(el("span", "", "")); var clock = el("span", "wb-clock"); clock.id = "wb-clock"; right.appendChild(clock);
    bar.appendChild(right);
    root.appendChild(bar);
    back = el("div", "wb-back");
    back.addEventListener("click", function (e) {
      /* Keep the icon selection while the user selects text, or when the
         click is not a primary-button press (after a context menu). */
      if (e.button !== 0) { return; }
      var s = window.getSelection && window.getSelection();
      if (s && !s.isCollapsed) { return; }
      back.querySelectorAll(".wb-icon.sel").forEach(function (n) {
        n.classList.remove("sel");
      });
    });
    var tools = el("div", "wb-tools");
    GROUPS.forEach(function (gr) {
      var box = el("div", "wb-group");
      box.appendChild(el("div", "wb-gtitle", S.t(gr[0])));
      var grid = el("div", "wb-ggrid");
      gr[1].forEach(function (t) {
        grid.appendChild(icon(S.t(t[0]), t[1], t[2]));
      });
      box.appendChild(grid); tools.appendChild(box);
    });
    back.appendChild(tools);
    root.appendChild(back);
  }
  D.init = function () {
    var scr = $("screen");
    scr.classList.add("session", "desktop");
    root = $("desk"); root.hidden = false;
    S.tmux.park();
    $("panes").textContent = "";
    build();
    D.wins = []; D.active = null;
    S.tmux.attached = true;
    openDisk();
    S.status();
  };
  D.teardown = function () {
    D.wins.slice().forEach(closeWin);
    var r = $("desk"); if (r) {
      r.hidden = true; r.textContent = "";
    }
    $("screen").classList.remove("desktop");
  };
  S.isDesktop = function () {
    return S.ctx().desktop;
  };
  S.enterMode = function (keepKind) {
    if (S.isDesktop()) {
      S.tmux.zoom = null; D.teardown(); D.init(); if (keepKind) {
        D.goto(keepKind);
      }
    }
    else {
      D.teardown(); S.tmux.init(keepKind);
    }
  };
  S.setMode = function (m) {
    if (m !== "tmux" && m !== "desktop") {
      return;
    }
    if (m === "desktop" && S.tmux.mobile()) {
      S.msg("Desktop mode needs a wider screen.", "err"); return;
    }
    S.state.settings.mode = m; S.save();
    S.syncContext();
    if (S.tmux.attached) {
      S.enterMode(); S.msg(m === "desktop" ? "Desktop mode" : "tmux mode");
    }
  };
})();
