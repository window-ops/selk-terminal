/* Shell output: a queue that prints lines, typed lines and nodes in order, plus the
   inline markup for handbook notes, entry links and the player's name. */
(function () {
  var S = window.SELK;
  var log = null, chain = Promise.resolve(), pending = 0, skipping = false;
  function factor() {
    var s = S.state.settings.speed;
    return (S.reduced || skipping || s === "instant") ? 0 : ({ vfast: 0.15, fast: 0.3, slow: 1.4 }[s] || 1);
  }
  function speed(ms) {
    return Math.round(ms * factor());
  }
  function wait(ms) {
    return new Promise(function (r) {
      var m = speed(ms); if (!m) {
        r();
      } else {
        setTimeout(r, m);
      }
    });
  }
  /* Keep the newest output in view, except while the player is selecting text
     in the shell: then the log stays where it is. */
  function selectingInLog() {
    var s = window.getSelection && window.getSelection();
    return !!(s && !s.isCollapsed && log && s.anchorNode && log.contains(s.anchorNode));
  }
  function scroll() {
    if (log && !selectingInLog()) {
      log.scrollTop = log.scrollHeight;
    }
  }
  function enqueue(fn, ms) {
    pending++;
    chain = chain.then(function () {
      return wait(ms || 0);
    })
    .then(function () {
      return fn();
    })
    .catch(function (e) {
      if (window.console) {
        console.error(e);
      }
    })
    .then(function () {
      scroll(); pending--; if (!pending) {
        skipping = false;
      }
    });
    return chain;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) {
      n.className = cls;
    }
    if (text != null) {
      n.textContent = text;
    }
    return n;
  }
  function cmdButton(label, cmd, cls) {
    var b = el("button", cls || "lnk", label);
    b.type = "button";
    b.dataset.cmd = cmd;
    return b;
  }
  var MARK = /\{([^|}]+)\|([^}]+)\}|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|@NAME@/g;
  function markup(text, parent) {
    var i = 0, m;
    MARK.lastIndex = 0;
    while ((m = MARK.exec(text))) {
      if (m.index > i) {
        parent.appendChild(document.createTextNode(text.slice(i, m.index)));
      }
      if (m[1]) {
        parent.appendChild(cmdButton(m[1], "note " + m[2], "term"));
      } else if (m[3]) {
        var label = m[4] || m[3].split("/")[1];
        var lk = cmdButton(label, "open " + m[3]);
        if (S.isUnlocked && !S.isUnlocked(m[3].split("/")[0])) {
          lk.classList.add("locked"); lk.title = "In a locked section";
        }
        else {
          lk.dataset.entry = m[3];
        }
        parent.appendChild(lk);
      } else {
        parent.appendChild(document.createTextNode(S.state.name || "SUPERVISOR"));
      }
      i = MARK.lastIndex;
    }
    if (i < text.length) {
      parent.appendChild(document.createTextNode(text.slice(i)));
    }
    return parent;
  }
  /* Text speed, shared by every text on screen.
     AT ONCE (instant) shows text whole. QUICKLY and LETTER BY LETTER reveal the
     text nodes of an element in order, a few characters per animation frame.
     Reduced motion and screen reader mode count as AT ONCE (see factor()). */
  var CPS = { vfast: 450, fast: 260, typed: 110, slow: 55 };
  function queueSkipped() { return skipping; }
  function reveal(root, isSkipped) {
    var cps = CPS[S.state.settings.speed];
    if (!cps || !factor() || !root) { return null; }
    var parts = [], walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while ((n = walk.nextNode())) {
      if (n.nodeValue.length) { parts.push([n, n.nodeValue]); n.nodeValue = ""; }
    }
    if (!parts.length) { return null; }
    return new Promise(function (resolve) {
      var i = 0, pos = 0, last = 0, sinceKey = 0;
      function finish() {
        for (; i < parts.length; i++) { parts[i][0].nodeValue = parts[i][1]; }
        scroll(); resolve();
      }
      function frame(now) {
        if (isSkipped()) { finish(); return; }
        var budget = last ? Math.max(1, Math.round((now - last) / 1000 * cps)) : 1;
        last = now;
        while (budget > 0 && i < parts.length) {
          var full = parts[i][1], take = Math.min(budget, full.length - pos);
          pos += take; budget -= take; sinceKey += take;
          parts[i][0].nodeValue = full.slice(0, pos);
          if (pos >= full.length) { i++; pos = 0; }
        }
        if (sinceKey >= 3) { S.snd.key(); sinceKey = 0; }
        scroll();
        if (i < parts.length) { requestAnimationFrame(frame); } else { resolve(); }
      }
      requestAnimationFrame(frame);
    });
  }

  S.scr = {
    reveal: reveal,
    init: function (node) {
      log = node;
    },
    el: el,
    cmdButton: cmdButton,
    markup: markup,
    busy: function () {
      return pending > 0;
    },
    /* Queue state, for the debug log and tests. */
    queueState: function () { return { pending: pending, skipping: skipping }; },
    skip: function () {
      if (pending) {
        skipping = true;
      }
    },
    idle: function () {
      return chain;
    },
    wait: function (ms) {
      return enqueue(function () {}, ms);
    },
    clear: function () {
      return enqueue(function () {
        log.textContent = "";
      }, 0);
    },
    /* line, rich and node all reveal their text at the chosen text speed,
       so the setting applies to every piece of shell output. */
    line: function (text, cls, ms) {
      return enqueue(function () {
        var d = el("div", "ln " + (cls || ""), text);
        log.appendChild(d);
        return reveal(d, queueSkipped);
      }, ms == null ? 12 : ms);
    },
    rich: function (text, cls, ms) {
      return enqueue(function () {
        var d = markup(text, el("div", "ln " + (cls || "")));
        log.appendChild(d);
        return reveal(d, queueSkipped);
      }, ms == null ? 12 : ms);
    },
    node: function (build, ms) {
      return enqueue(function () {
        var n = build(); if (n) {
          log.appendChild(n);
          return reveal(n, queueSkipped);
        }
      }, ms == null ? 12 : ms);
    },
    type: function (text, cls, cps) {
      return enqueue(function () {
        var d = el("div", "ln " + (cls || ""));
        log.appendChild(d);
        if (!factor()) {
          d.textContent = text; return;
        }
        return new Promise(function (resolve) {
          var i = 0, pace = { vfast: 1.6, fast: 0.9, slow: 0.2 }[S.state.settings.speed] || 0.3;
          var step = 1000 / (Math.min(cps || 90, 140) * pace);
          (function next() {
            if (skipping) {
              d.textContent = text; resolve(); return;
            }
            i++;
            d.textContent = text.slice(0, i);
            if (i % 2 === 0 && text.charAt(i - 1) !== " ") {
              S.snd.key();
            }
            scroll();
            if (i < text.length) {
              setTimeout(next, step);
            } else {
              resolve();
            }
          })();
        });
      }, 0);
    },
    task: function (fn, ms) {
      return enqueue(fn, ms || 0);
    },
    scroll: scroll
  };
})();
