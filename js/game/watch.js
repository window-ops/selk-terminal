/* WATCH window: live telemetry for the mast, wind, dust and units, and the timers
   for wind gusts and structure creaks. */
(function () {
  var S = window.SELK;
  var el = S.el;
  var root = el("div", "watch scroll");
  S.registerKind("WATCH", root);
  var W = S.watch = {
    gust: 0,
    stowNoted: false,
    load: 117
  };
  function storm() {
    return Math.min(1, 0.12 + S.state.clock / 1100);
  }
  function mastLoad() {
    var base = {
      dismantle: 0,
      research: 86,
      export: 94
    }[S.state.lastEnding];
    if (base === undefined) {
      base = 117 + 5 * storm();
    }
    return base ? base + W.gust * 3 + (Math.random() - 0.5) * 0.6 : 0;
  }
  W.values = function () {
    var L = storm();
    var wind = 1.2 + 7 * L + W.gust * 3 + Math.random() * 0.3;
    var vis = Math.max(0.6, 14 - 12 * L - W.gust * 2);
    W.load = mastLoad();
    W.last = {
      L: L,
      wind: wind,
      vis: vis,
      load: W.load
    };
    return W.last;
  };
  /* Append the telemetry heading, the meters and the unit table to box,
     from the values v. Shared by the WATCH window and the shell snapshot. */
  function telemetry(box, v) {
    var st = S.state, done = !!st.lastEnding && st.lastEnding !== "transmit";
    box.appendChild(el("div", "head-s", S.t("SELK SITE TELEMETRY") + " " + S.fmtTime(st.clock)));
    var dl = el("dl", "fields telem");
    function meter(label, val, max, text, cls) {
      label = S.t(label); text = S.t(text);
      dl.appendChild(el("dt", cls || "", label));
      var W2 = 20, n = Math.max(0, Math.min(W2, Math.round(val / max * W2)));
      var dd = el("dd", cls || ""), m = el("span", "cbar", "[" + new Array(n + 1).join("|") + new Array(W2 - n + 1).join(" ") + "]");
      m.setAttribute("role", "meter"); m.setAttribute("aria-valuenow", String(Math.round(val)));
      m.setAttribute("aria-valuemin", "0"); m.setAttribute("aria-valuemax", String(max)); m.setAttribute("aria-label", label);
      dd.appendChild(m); dd.appendChild(el("span", "meter-text", text)); dl.appendChild(dd);
    }
    function field(label, text, cls) {
      dl.appendChild(el("dt", cls || "", S.t(label))); dl.appendChild(el("dd", cls || "", S.t(text)));
    }
    meter("MAST-01 load", v.load, 150, v.load ? S.t("{v} %", { v: S.num(v.load, 1) }) : "removed", v.load > 100 ? "err" : "");
    meter("Wind", v.wind, 12, S.num(v.wind, 1) + " m/s", v.wind > 5 ? "warn" : "");
    meter("Dust", 14 - v.vis, 14, S.t("visibility {km} km", { km: S.num(v.vis, 1) }));
    field("Reactor", "48 MW heat, 11 MW electric");
    field("Uplink", st.pending.length ? "receiving" : S.transmitting ? "sending" : "idle, relay R-09", st.pending.length || S.transmitting ? "warn" : "");
    field("CRANE-L", v.wind > 5 ? "stowed, wind above 5 m/s" : "stowed, zone 14 hold", v.wind > 5 ? "warn" : "");
    box.appendChild(dl);
    var wrap = el("div", "etable-wrap"), tb = el("table", "etable"), hr = el("tr");
    [
      "Unit",
      "State",
      "Battery",
      "Task"
    ].forEach(function (h) {
      var th = el("th", "", S.t(h)); th.scope = "col"; hr.appendChild(th);
    });
    var thead = el("thead"); thead.appendChild(hr); tb.appendChild(thead);
    var body = el("tbody");
    var wd = Math.max(5, 31 - Math.floor(st.clock / 180));
    var stop = "stopped by gate";
    [
      [
        "CL-7",
        done ? "working" : stop,
        64,
        "zone 14"
      ],
      [
        "CL-8",
        done ? "working" : stop,
        58,
        "zone 14"
      ],
      [
        "WD-2",
        done ? "working" : stop,
        wd,
        "rib 7 repair"
      ],
      [
        "CT-3",
        "idle",
        77,
        "none"
      ],
      [
        "SV-1",
        "active",
        82,
        "survey, north of EX-1"
      ],
      [
        "SV-4",
        "active",
        90,
        "camera, mast"
      ]
    ].forEach(function (u) {
      var tr = el("tr", u[1] === stop ? "err" : "");
      [
        u[0],
        u[1],
        S.t("{v} %", { v: u[2] }),
        u[3]
      ].forEach(function (c) {
        tr.appendChild(el("td", "", S.t(String(c))));
      });
      body.appendChild(tr);
    });
    tb.appendChild(body); wrap.appendChild(tb); box.appendChild(wrap);
  }
  /* Redraw the WATCH window, when it is on screen */
  W.render = function () {
    if (!S.ui.isOpen("WATCH")) {
      return;
    }
    var v = W.values();
    root.textContent = "";
    if (!W.fig) {
      W.fig = el("figure", "cam livecam");
      W.fig.appendChild(S.live.canvas());
      W.fig.appendChild(el("figcaption", "dim", S.t("SV-4 LIVE, MAST-01")));
    }
    root.appendChild(W.fig);
    telemetry(root, v);
    if (v.wind > 5 && !W.stowNoted) {
      W.stowNoted = true; S.msg(S.t("CRANE-L stowed, wind above 5 m/s"), "warn");
    }
  };
  /* Print the telemetry once in the shell, for the watch command. The live
     camera is left out, since a copy in the log would keep animating under
     newer output. */
  W.print = function () {
    S.scr.node(function () {
      var box = el("div", "entry watch-text");
      telemetry(box, W.values());
      box.appendChild(el("div", "ln dim", S.tc("Type {watch} again for new values.")));
      return box;
    });
  };
  function interfere() {
    if (S.previewInterference) {
      S.previewInterference();
    }
  }
  function gustLoop() {
    var L = storm();
    setTimeout(function () {
      if (S.tmux.attached && storm() > 0.2) {
        W.gust = 0.5 + Math.random() * 0.5 * storm();
        S.snd.gust(storm());
        if (S.state.settings.interfere) {
          interfere();
        }
        W.render();
      }
      gustLoop();
    }, (70 - 50 * L) * 1000 * (0.6 + Math.random() * 0.8));
  }
  function creakLoop() {
    var over = Math.max(0, (W.load - 100) / 20);
    setTimeout(function () {
      if (S.tmux.attached && W.load > 100) {
        S.snd.creak(Math.min(1, 0.3 + (W.load - 100) / 25));
      }
      creakLoop();
    }, (60 - 35 * Math.min(1, over)) * 1000 * (0.5 + Math.random()));
  }
  W.start = function () {
    if (W.started) {
      return;
    }
    W.started = true;
    setInterval(function () {
      W.gust *= 0.6;
      var v = W.values();
      S.snd.setWind(v.L * 0.8 + W.gust * 0.4);
      W.render();
    }, 2500);
    gustLoop(); creakLoop();
  };
})();
