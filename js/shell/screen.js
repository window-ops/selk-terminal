/* Shell output: a queue that prints lines, typed lines and nodes in order,
   and the inline markup for handbook notes, entry links and the player's
   name. */
(function () {
  var S = window.SELK;
  var el = S.el;
  var log = null, chain = Promise.resolve(), pending = 0, skipping = false;
  /* The output group being filled (S.scr.group), or null. Queued output goes
     into it while it is open and in the log. */
  var group = null, groupDepth = 0;
  function host() {
    return group && group.isConnected ? group : log;
  }
  function factor() {
    var s = S.textSpeed();
    return (skipping || s === "instant") ? 0 : ({ vfast: 0.15, fast: 0.3, slow: 1.4 }[s] || 1);
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
  /* Keep the newest output in view, except while the player selects text in
     the log */
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
  function cmdButton(label, cmd, cls) {
    var b = el("button", cls || "lnk", label);
    b.type = "button";
    b.dataset.cmd = cmd;
    b.dataset.sound = "link";
    return b;
  }
  var MARK = /\{([^|}]+)\|([^}]+)\}|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|@NAME@/g;
  function markup(text, parent) {
    var i = 0, m;
    MARK.lastIndex = 0;
    while ((m = MARK.exec(text))) {
      if (m.index > i) {
        S.speakInto(parent, text.slice(i, m.index));
      }
      if (m[1]) {
        var term = cmdButton(m[1], "note " + m[2], "term"), note = S.i18n.note(m[2].toLowerCase());
        if (m[1].indexOf(" > ") !== -1) { term.setAttribute("aria-label", S.spoken(m[1])); }
        if (note) {
          term.title = S.t("Handbook note: {name}", { name: note[0] });
        }
        parent.appendChild(term);
      } else if (m[3]) {
        var label = m[4] || m[3].split("/")[1];
        var lk = cmdButton(label, "open " + m[3]);
        if (S.isUnlocked && !S.isUnlocked(m[3].split("/")[0])) {
          lk.classList.add("locked"); lk.title = S.t("In a locked section");
        }
        else {
          lk.dataset.entry = m[3];
          /* An entry that cannot fill a blank keeps the plain hand
             (css/cursors.css) */
          if (!S.entryDraggable(m[3])) {
            lk.classList.add("nodrag");
          }
        }
        parent.appendChild(lk);
      } else {
        parent.appendChild(document.createTextNode(S.state.name || S.t("SUPERVISOR")));
      }
      i = MARK.lastIndex;
    }
    if (i < text.length) {
      S.speakInto(parent, text.slice(i));
    }
    return parent;
  }
  /* Text speed (Setup > Text appears, read through S.textSpeed). AT ONCE
     shows text whole. The other speeds reveal the text nodes of an element
     in order at CPS letters per second, a few letters per frame. */
  var CPS = { vfast: 450, fast: 260, typed: 110, slow: 55 };
  function queueSkipped() { return skipping; }
  function reveal(root, isSkipped) {
    if (S.prettyWrap) { S.prettyWrap.within(root); }
    var cps = CPS[S.textSpeed()];
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
        log.textContent = ""; group = null;
      }, 0);
    },
    /* Run fn and collect the output it queues into one div.out-group, with
       the gap of a command echo above and below (css/ui/shell.css). Output
       with no command line above it uses a group: an unechoed command, the
       mail notice, a blank filled by dragging. Inside an echoed command or
       another group, fn runs unchanged, since the echo or the outer group
       gives the gap.

       kind names the type of output. When the newest element in the log is a
       group of the same kind, the output joins it, so a series of similar
       notices (blanks filled one after another, repeated uplink notices, the
       same bar button pressed twice) prints as one block. An empty new group
       is removed. */
    group: function (fn, kind) {
      if (groupDepth || S.cmdEchoed) {
        return fn();
      }
      groupDepth++;
      var made = false;
      enqueue(function () {
        var last = log.lastElementChild;
        if (kind && last && last.classList.contains("out-group") && last.dataset.kind === kind) {
          group = last;
        } else {
          group = el("div", "out-group"); made = true;
          if (kind) { group.dataset.kind = kind; }
          log.appendChild(group);
        }
      }, 0);
      try {
        return fn();
      } finally {
        groupDepth--;
        enqueue(function () {
          if (made && group && !group.firstChild) { group.remove(); }
          group = null;
        }, 0);
      }
    },
    /* line (plain text), rich (text with markup) and node (a built element)
       reveal their text at the text speed, so the setting applies to all
       shell output. type() types one line letter by letter with key sounds,
       for the boot, sign-in and attach lines. */
    line: function (text, cls, ms) {
      return enqueue(function () {
        var d = el("div", "ln " + (cls || ""));
        /* An echoed command: the prompt is hidden from screen readers, which
           hear "Command:" before the typed text */
        var ps = S.promptText ? S.promptText() : "";
        if (/\becho\b/.test(cls || "") && ps && String(text).indexOf(ps) === 0) {
          var p = el("span", "", ps); p.setAttribute("aria-hidden", "true");
          d.appendChild(p);
          d.appendChild(el("span", "sr-only", S.t("Command:") + " "));
          d.appendChild(document.createTextNode(String(text).slice(ps.length)));
        } else if (text != null) {
          S.speakInto(d, String(text));
        }
        host().appendChild(d);
        return reveal(d, queueSkipped);
      }, ms == null ? 12 : ms);
    },
    rich: function (text, cls, ms) {
      return enqueue(function () {
        var d = markup(text, el("div", "ln " + (cls || "")));
        host().appendChild(d);
        return reveal(d, queueSkipped);
      }, ms == null ? 12 : ms);
    },
    node: function (build, ms) {
      return enqueue(function () {
        var n = build(); if (n) {
          host().appendChild(n);
          return reveal(n, queueSkipped);
        }
      }, ms == null ? 12 : ms);
    },
    type: function (text, cls, cps) {
      return enqueue(function () {
        var d = el("div", "ln " + (cls || ""));
        host().appendChild(d);
        if (!factor()) {
          d.textContent = text; return;
        }
        return new Promise(function (resolve) {
          var i = 0, pace = { vfast: 1.6, fast: 0.9, slow: 0.2 }[S.textSpeed()] || 0.3;
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
