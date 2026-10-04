/* TROIKA.RUN (core.js): the economist's dialogue in 2016, in a box under
   the picture as in old pixel games. Each line is typed letter by letter
   at the pace of speech, about 18 letters a second with a short pause
   after a comma and a longer one after a full stop, whatever the text
   speed and motion settings say, with a deep voice and no words
   (S.snd.troikaVoice) that follows the typing. Enter, Space or
   a click shows the rest of a line, then the next one. The last line asks
   a question, and the answers are buttons picked with a click or with the
   number keys, which wait 0.5 s after they appear, so a key held from the
   dialogue never picks one. The typing runs on the clock of the run, so a
   pause stops it. */
(function () {
  var S = window.SELK, T = S.troikaGame;
  /* Letters a second, and the pause after a mark, in seconds */
  var RATE = 18, PAUSE = { ",": 0.15, ";": 0.2, ":": 0.25, ".": 0.4, "?": 0.4, "!": 0.4 }, box = null, cur = null;
  function voice() {
    return S.snd && S.snd.troikaVoice;
  }
  T.talk = {
    /* The box, under the picture in the stage */
    build: function (stage) {
      var el = S.el;
      box = el("div", "troika-talk"); box.hidden = true; box.tabIndex = -1;
      box.appendChild(el("div", "troika-talk-name"));
      var p = el("p", "troika-talk-text");
      box.appendChild(p);
      box.appendChild(el("div", "troika-choices troika-talk-choices"));
      var more = el("span", "troika-talk-more", "▼"); more.setAttribute("aria-hidden", "true");
      box.appendChild(more);
      box.addEventListener("click", function (e) { if (!e.target.closest("button")) { T.talk.next(); } });
      stage.appendChild(box);
    },
    /* Speaks lines as who, in a voice pitch times the economist's; then,
       with ways, asks the last line and calls done with the answer's index,
       or calls done when the lines end */
    say: function (who, lines, ways, done, pitch) {
      cur = { lines: lines, n: -1, shown: 0, ways: ways, done: done, askedAt: 0, pitch: pitch || 1 };
      box.querySelector(".troika-talk-name").textContent = who;
      box.hidden = false;
      box.focus({ preventScroll: true });
      line(0);
    },
    open: function () {
      return !!cur;
    },
    /* True while a line is being typed, for the economist's mouth */
    typing: function () {
      return !!(cur && cur.n >= 0 && cur.shown < cur.lines[cur.n].length);
    },
    /* True while the answers are up and the number keys may pick one */
    asking: function () {
      return !!(cur && cur.asking && performance.now() - cur.askedAt >= 500);
    },
    /* Enter, Space or a click: the rest of the line, or the next line */
    next: function () {
      if (!cur || cur.asking || T.st.hold) { return; }
      var text = cur.lines[cur.n];
      if (cur.shown < text.length) { cur.shown = text.length; show(); return; }
      if (cur.n + 1 < cur.lines.length) { line(cur.n + 1); return; }
      var done = cur.done;
      T.talk.close();
      if (done) { done(); }
    },
    pick: function (i) {
      if (!cur || !cur.asking || !cur.ways[i] || T.st.hold) { return; }
      var done = cur.done;
      if (S.snd && S.snd.ok) { S.snd.ok(); }
      T.talk.close();
      done(i);
    },
    close: function () {
      cur = null;
      if (box) {
        box.hidden = true; box.classList.remove("asking", "typing");
        box.querySelector(".troika-talk-choices").textContent = "";
      }
    },
    /* Types the line at RATE letters a second, holding after each mark,
       a voice blip on every other letter */
    update: function (dt) {
      if (!cur || cur.n < 0) { return; }
      var text = cur.lines[cur.n];
      if (cur.shown >= text.length) { return; }
      var before = Math.floor(cur.shown), left = dt;
      if (cur.wait > 0) { var w = Math.min(cur.wait, left); cur.wait -= w; left -= w; }
      while (left > 0 && cur.shown < text.length && !(cur.wait > 0)) {
        var next = Math.floor(cur.shown) + 1, need = (next - cur.shown) / RATE;
        if (need > left) { cur.shown += left * RATE; break; }
        left -= need; cur.shown = next;
        var ch = text.charAt(next - 1);
        if ((next - 1) % 2 === 0 && voice()) { voice().blip(ch, cur.pitch); }
        if (PAUSE[ch] && next < text.length && text.charAt(next) === " ") { cur.wait = PAUSE[ch]; }
      }
      if (Math.floor(cur.shown) !== before) { show(); }
    }
  };
  /* Starts line n; the last line of a question brings up the answers once
     it is shown */
  function line(n) {
    var text = cur.lines[n];
    cur.n = n; cur.asking = false;
    cur.shown = 0; cur.wait = 0;
    box.querySelector(".troika-talk-choices").textContent = "";
    if (S.announce) { S.announce(text); }
    show();
  }
  function show() {
    var text = cur.lines[cur.n], all = cur.shown >= text.length;
    /* The line keeps its full height while it types, so the box does not
       grow under the reader: the untyped rest is there, hidden */
    var p = box.querySelector(".troika-talk-text");
    p.textContent = "";
    p.appendChild(document.createTextNode(text.slice(0, Math.floor(cur.shown))));
    if (!all) {
      var rest = S.el("span", "troika-talk-rest", text.slice(Math.floor(cur.shown)));
      rest.setAttribute("aria-hidden", "true");
      p.appendChild(rest);
    }
    box.classList.toggle("typing", !all);
    if (all && cur.ways && cur.n === cur.lines.length - 1 && !cur.asking) { ask(); }
  }
  function ask() {
    var row = box.querySelector(".troika-talk-choices");
    cur.asking = true; cur.askedAt = performance.now();
    box.classList.add("asking");
    cur.ways.forEach(function (w, i) {
      var b = S.el("button", "btn", (i + 1) + ". " + w); b.type = "button"; b.dataset.sound = "choice";
      b.addEventListener("click", function () { T.talk.pick(i); });
      row.appendChild(b);
    });
    box.focus({ preventScroll: true });
  }
})();
