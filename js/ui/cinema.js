/* Full-screen cinema for the finale: a black stage over the terminal that
   shows typed lines, a list of choices, pixel scenes with captions, a letter
   and a title card. Every step can be hurried with a click, Enter or Space;
   digits pick a choice and Escape leaves the choice list. */
(function () {
  var S = window.SELK, el = S.el;
  /* One duration for every fade: into black, between pictures, back out, and
     the page fade-in. CSS reads it as --fade. */
  var FADE = 450;
  document.documentElement.style.setProperty("--fade", FADE + "ms");
  var root = null, stage = null, layer = null, live = null, advance = null, picker = null, scene = null, onEscape = null;
  function ms(n) {
    return S.fast ? Math.min(n, 30) : n;
  }
  function instant() {
    return S.fast || S.reduced || S.state.settings.speed === "instant";
  }
  /* Fades follow motion, not text speed: only reduced motion skips them */
  function still() {
    return S.fast || S.reduced;
  }
  function waits() {
    return S.cine.manual || !!(S.state && S.state.settings.sr);
  }
  /* Resolves after n ms, or at once when the player moves on */
  function hold(n) {
    return new Promise(function (resolve) {
      /* Step by step, and always in screen reader mode: wait for the player
         however long it takes, so every line is heard in full */
      var done = false, timer = waits() ? null : setTimeout(go, ms(n));
      function go() {
        if (done) { return; }
        done = true; clearTimeout(timer); advance = null; resolve();
      }
      advance = go;
    });
  }
  function type(node, text, cps) {
    return new Promise(function (resolve) {
      if (instant()) { node.textContent = text; resolve(); return; }
      var i = 0, skip = false;
      advance = function () { skip = true; };
      (function step() {
        if (skip || i >= text.length) {
          node.textContent = text; advance = null; resolve(); return;
        }
        i++; node.textContent = text.slice(0, i);
        setTimeout(step, 1000 / (cps || 40));
      })();
    });
  }
  /* The opening line joins the first announcement, so neither is lost */
  var opening = "";
  function say(text) {
    if (live) { live.textContent = (opening ? opening + " " : "") + text; opening = ""; }
  }
  function stopScene() {
    if (scene) { scene.stop(); scene = null; }
  }
  /* Grouped buttons: a short caption, then short labels. The full meaning of
     each button is in its title and its accessible name. */
  function group(g, onPick) {
    var row = el("div", "cine-group");
    row.setAttribute("role", "group"); row.setAttribute("aria-label", g.label);
    row.appendChild(el("span", "cine-group-label", g.label));
    g.buttons.forEach(function (b) {
      var x = el("button", "btn", b.label); x.type = "button";
      if (b.title) { x.title = b.title; x.setAttribute("aria-label", b.title); }
      x.addEventListener("click", function () { onPick(); b.fn(); });
      row.appendChild(x);
    });
    return row;
  }
  /* Cross-fade: each card lives in its own layer on the stage. A new layer
     fades in over the old one while the old one fades out, both at once, so
     every change (the first picture after the black included) takes one
     FADE. Resolves with what build() returned. */
  function swap(build) {
    return new Promise(function (resolve) {
      if (!root) { return; }
      var old = layer, oldScene = scene;
      scene = null; picker = null;
      layer = el("div", "cine-layer fading");
      stage.appendChild(layer);
      var made = build();
      void layer.offsetWidth;
      layer.classList.remove("fading");
      if (old) {
        /* The old card leaves the accessibility tree as it starts fading */
        old.setAttribute("aria-hidden", "true");
        old.classList.add("fading", "leaving");
        setTimeout(function () {
          if (oldScene) { oldScene.stop(); }
          old.remove();
        }, still() ? 0 : FADE);
      }
      resolve(made);
    });
  }
  function onKey(e) {
    if (!root) { return; }
    /* Tab cycles within the ending */
    if (e.key === "Tab") {
      var f = [].filter.call(root.querySelectorAll("button:not([disabled])"), function (b) {
        return !b.closest(".leaving");
      });
      if (!f.length) { return; }
      var i = f.indexOf(document.activeElement);
      e.preventDefault(); e.stopPropagation();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      return;
    }
    /* Nothing behind the film opens while it plays */
    if (/^F\d+$/.test(e.key) || e.altKey || e.ctrlKey || e.metaKey) {
      e.preventDefault(); e.stopPropagation(); return;
    }
    if (e.key === "Escape" && onEscape) {
      e.preventDefault(); e.stopPropagation(); onEscape(); return;
    }
    if (picker && /^[1-9]$/.test(e.key)) {
      e.preventDefault(); e.stopPropagation(); picker(+e.key - 1); return;
    }
    if ((e.key === "Enter" || e.key === " ") && advance && !(e.target.closest && e.target.closest("button"))) {
      e.preventDefault(); e.stopPropagation(); advance();
    }
  }
  S.cine = {
    manual: false,
    isOpen: function () { return !!root; },
    /* Step-by-step mode shows how to move on */
    setManual: function (on) {
      S.cine.manual = !!on;
      if (!root) { return; }
      var hint = root.querySelector(".cine-hint");
      on = waits();
      if (on && !hint) {
        root.appendChild(el("div", "cine-hint", S.t("Click or press Enter to continue")));
      } else if (!on && hint) {
        hint.remove();
      }
    },
    /* Fades the stage to black; resolves once the fade has finished */
    open: function () {
      if (root) { return Promise.resolve(); }
      root = el("div", "cine");
      root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", S.t("FINAL DECISION"));
      root.tabIndex = -1;
      stage = el("div", "cine-stage");
      live = el("div", "sr-only"); live.setAttribute("aria-live", "polite");
      root.appendChild(stage); root.appendChild(live);
      /* A real control to move on: screen reader browse modes often keep
         Enter and Space for themselves. Hidden until it has focus. */
      var next = el("button", "cine-next", S.t("Continue"));
      next.type = "button";
      next.addEventListener("click", function (e) { e.stopPropagation(); if (advance) { advance(); } });
      root.appendChild(next);
      opening = S.t("The ending begins. Press Enter or use the Continue button to move on.");
      /* In screen reader mode the ending waits on every card; show the hint too */
      S.cine.setManual(S.cine.manual);
      root.addEventListener("click", function (e) {
        if (!e.target.closest("button") && advance) { advance(); }
      });
      var scr = document.getElementById("screen");
      scr.appendChild(root);
      /* Everything behind the ending is out of reach: no focus, not read */
      [].forEach.call(scr.children, function (c) {
        if (c !== root && !c.hasAttribute("inert")) { c.setAttribute("inert", ""); c.dataset.cineInert = "1"; }
      });
      void root.offsetWidth;
      root.classList.add("on");
      root.focus({ preventScroll: true });
      document.addEventListener("keydown", onKey, true);
      /* Once the screen is black, the CRT effects step aside (body.cinema) */
      return new Promise(function (r) {
        setTimeout(function () {
          if (root) { document.body.classList.add("cinema"); }
          r();
        }, still() ? 0 : FADE + 50);
      });
    },
    close: function () {
      if (!root) { return; }
      stopScene();
      var r = root;
      root = null; advance = null; picker = null; onEscape = null; S.cine.manual = false;
      document.removeEventListener("keydown", onKey, true);
      document.querySelectorAll("[data-cine-inert]").forEach(function (c) {
        c.removeAttribute("inert"); delete c.dataset.cineInert;
      });
      /* The terminal comes back with its effects as the black fades away */
      document.body.classList.remove("cinema");
      r.classList.remove("on");
      setTimeout(function () { r.remove(); }, still() ? 0 : FADE + 50);
    },
    clear: function () {
      stopScene(); stage.replaceChildren(); layer = null; picker = null;
    },
    /* Lines typed one under another, centred, with room between them */
    lines: function (texts, cps, gap) {
      return swap(function () {
        var box = el("div", "cine-lines"); layer.appendChild(box); return box;
      }).then(function (box) {
        return texts.reduce(function (p, text) {
          return p.then(function () {
            var line = el("p", "cine-line"); box.appendChild(line); say(text);
            return type(line, text, cps).then(function () { return hold(gap || 1100); });
          });
        }, Promise.resolve());
      });
    },
    /* Choices: [{ label, note, disabled }]. Resolves with the index picked. */
    choose: function (items, head, cancel, groups) {
      return swap(function () {}).then(function () {
        return new Promise(function (resolve) {
          var box = el("div", "cine-choices"), buttons = [];
          if (head) { box.appendChild(el("div", "cine-head", head)); }
          picker = function (i) {
            if (!items[i] || items[i].disabled) { S.snd.error(); return; }
            picker = null; onEscape = null; resolve(i);
          };
          onEscape = cancel ? function () { picker = null; onEscape = null; cancel(); } : null;
          items.forEach(function (it, i) {
            var b = el("button", "cine-choice", (i + 1) + "  " + it.label);
            b.type = "button"; b.disabled = !!it.disabled;
            if (it.note) { b.appendChild(el("span", "cine-note", it.note)); }
            b.addEventListener("click", function () { if (picker) { picker(i); } });
            box.appendChild(b); buttons.push(b);
          });
          (groups || []).forEach(function (g) {
            box.appendChild(group(g, function () { picker = null; onEscape = null; }));
          });
          layer.appendChild(box);
          var first = buttons.filter(function (b) { return !b.disabled; })[0];
          if (first) { first.focus({ preventScroll: true }); }
          say((head ? head + ". " : "") + items.map(function (it, i) { return (i + 1) + " " + it.label; }).join(", "));
        });
      });
    },
    /* A pixel scene with a caption under it. A new scene fades in over the
       last; the same scene keeps playing and only its caption changes. */
    scene: function (id, n, caption) {
      var key = id + ":" + n, frame = layer && layer.querySelector(".cine-frame");
      var ready = frame && frame.dataset.key === key ? Promise.resolve(frame) : swap(function () {
        var f = el("div", "cine-frame"); f.dataset.key = key;
        scene = S.scenes.make(id, n);
        f.appendChild(scene.el);
        /* The caption is read from the announcement, so the typed copy is hidden */
        var capEl = el("p", "cine-caption"); capEl.setAttribute("aria-hidden", "true");
        f.appendChild(capEl);
        layer.appendChild(f);
        scene.start();
        return f;
      });
      return ready.then(function (f) {
        var cap = f.querySelector(".cine-caption");
        /* The picture is announced with its caption the first time it appears */
        cap.textContent = ""; say((f.dataset.said ? "" : S.scenes.describe(id, n) + " ") + caption);
        f.dataset.said = "1";
        /* Long enough to read twice: at least 4 s, more for long lines */
        return type(cap, caption, 40).then(function () { return hold(Math.max(4000, caption.length * 55)); });
      });
    },
    /* The office's letter: heading, details and body, until the player moves on */
    letter: function (head, meta, body) {
      return swap(function () {
        var card = el("article", "cine-letter");
        card.appendChild(S.speakText(el("div", "cine-letter-head"), head, "to"));
        meta.forEach(function (m) { card.appendChild(el("div", "cine-letter-meta", m)); });
        card.appendChild(el("p", "cine-letter-body", body));
        layer.appendChild(card);
      }).then(function () {
        say(S.spoken(head, "to") + ". " + body);
        return hold(16000);
      });
    },
    /* Title card with groups of buttons, one row each */
    title: function (kicker, title, sub, actions) {
      return swap(function () {
        var box = el("div", "cine-title");
        box.appendChild(el("div", "cine-kicker", kicker));
        box.appendChild(el("h2", "cine-name", title));
        box.appendChild(el("div", "cine-sub", sub));
        var rows = el("div", "cine-actions");
        actions.forEach(function (g) { rows.appendChild(group(g, function () {})); });
        box.appendChild(rows);
        layer.appendChild(box);
      }).then(function () {
        /* The stage keeps focus, so an Enter meant to hurry the letter cannot
           press a button by accident; Tab reaches the buttons */
        root.focus({ preventScroll: true });
        say(kicker + ". " + title + ". " + sub);
      });
    }
  };
})();
