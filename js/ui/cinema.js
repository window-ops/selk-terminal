/* Full-screen cinema for the finale: a black stage over the terminal that
   shows typed lines, a list of choices, pixel scenes with captions, a letter
   and a title card. Every step can be hurried with a click, Enter or Space;
   digits pick a choice and Escape leaves the choice list. */
(function () {
  var S = window.SELK, el = S.el;
  var root = null, stage = null, live = null, advance = null, picker = null, scene = null, onEscape = null;
  function ms(n) {
    return S.fast ? Math.min(n, 30) : n;
  }
  function instant() {
    return S.fast || S.reduced || S.state.settings.speed === "instant";
  }
  /* Resolves after n ms, or at once when the player moves on */
  function hold(n) {
    return new Promise(function (resolve) {
      var done = false, timer = setTimeout(go, ms(n));
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
  function say(text) {
    if (live) { live.textContent = text; }
  }
  function stopScene() {
    if (scene) { scene.stop(); scene = null; }
  }
  function onKey(e) {
    if (!root) { return; }
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
    isOpen: function () { return !!root; },
    open: function () {
      if (root) { return; }
      root = el("div", "cine");
      root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", S.t("FINAL DECISION"));
      root.tabIndex = -1;
      stage = el("div", "cine-stage");
      live = el("div", "sr-only"); live.setAttribute("aria-live", "polite");
      root.appendChild(stage); root.appendChild(live);
      root.addEventListener("click", function (e) {
        if (!e.target.closest("button") && advance) { advance(); }
      });
      document.getElementById("screen").appendChild(root);
      void root.offsetWidth;
      root.classList.add("on");
      root.focus({ preventScroll: true });
      document.addEventListener("keydown", onKey, true);
    },
    close: function () {
      if (!root) { return; }
      stopScene();
      var r = root;
      root = null; advance = null; picker = null; onEscape = null;
      document.removeEventListener("keydown", onKey, true);
      r.classList.remove("on");
      setTimeout(function () { r.remove(); }, instant() ? 0 : 900);
    },
    clear: function () {
      stopScene(); stage.replaceChildren(); picker = null;
    },
    /* Lines typed one under another, centred, with room between them */
    lines: function (texts, cps, gap) {
      S.cine.clear();
      var box = el("div", "cine-lines");
      stage.appendChild(box);
      return texts.reduce(function (p, text) {
        return p.then(function () {
          var line = el("p", "cine-line"); box.appendChild(line); say(text);
          return type(line, text, cps).then(function () { return hold(gap || 1100); });
        });
      }, Promise.resolve());
    },
    /* Choices: [{ label, note, disabled }]. Resolves with the index picked. */
    choose: function (items, head, cancel) {
      S.cine.clear();
      var box = el("div", "cine-choices");
      if (head) { box.appendChild(el("div", "cine-head", head)); }
      return new Promise(function (resolve) {
        var buttons = [];
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
        stage.appendChild(box);
        var first = buttons.filter(function (b) { return !b.disabled; })[0];
        if (first) { first.focus({ preventScroll: true }); }
        say((head ? head + ". " : "") + items.map(function (it, i) { return (i + 1) + " " + it.label; }).join(", "));
      });
    },
    /* A pixel scene with a caption under it. Keeps the scene if it is the same. */
    scene: function (id, n, caption) {
      var key = id + ":" + n, frame = stage.querySelector(".cine-frame");
      if (!frame || frame.dataset.key !== key) {
        S.cine.clear();
        frame = el("div", "cine-frame"); frame.dataset.key = key;
        scene = S.scenes.make(id, n);
        frame.appendChild(scene.el);
        frame.appendChild(el("p", "cine-caption"));
        stage.appendChild(frame);
        scene.start();
        void frame.offsetWidth; frame.classList.add("on");
      }
      var cap = frame.querySelector(".cine-caption");
      cap.textContent = ""; say(caption);
      return type(cap, caption, 38).then(function () { return hold(2600); });
    },
    /* The office's letter: heading, details and body, until the player moves on */
    letter: function (head, meta, body) {
      S.cine.clear();
      var card = el("article", "cine-letter");
      card.appendChild(el("div", "cine-letter-head", head));
      meta.forEach(function (m) { card.appendChild(el("div", "cine-letter-meta", m)); });
      card.appendChild(el("p", "cine-letter-body", body));
      stage.appendChild(card);
      void card.offsetWidth; card.classList.add("on");
      say(head + ". " + body);
      return hold(14000);
    },
    /* Title card with actions: [{ label, fn }] */
    title: function (kicker, title, sub, actions) {
      S.cine.clear();
      var box = el("div", "cine-title");
      box.appendChild(el("div", "cine-kicker", kicker));
      box.appendChild(el("h2", "cine-name", title));
      box.appendChild(el("div", "cine-sub", sub));
      var row = el("div", "cine-actions");
      actions.forEach(function (a) {
        var b = el("button", "btn", a.label); b.type = "button";
        b.addEventListener("click", a.fn);
        row.appendChild(b);
      });
      box.appendChild(row);
      stage.appendChild(box);
      void box.offsetWidth; box.classList.add("on");
      /* The stage keeps focus, so an Enter meant to hurry the letter cannot
         press a button by accident; Tab reaches the buttons */
      root.focus({ preventScroll: true });
      say(kicker + ". " + title + ". " + sub);
    }
  };
})();
