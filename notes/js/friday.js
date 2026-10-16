/* Every second Friday: one part at a time, in two views.

   The PART buttons choose the part in both views; the page never shows two
   parts at once.
   TABS shows one chapter of the part, under a strip of chapter tabs after
   the part separator, with a bar at its foot, as on the change-notes
   pages: previous at the left, position in the middle, next at the right.
   The bar crosses from one part into the next.
   CONTENTS shows the part's table of contents and all its chapters in
   order.
   A part without chapters shows its separator and its banner, and in TABS
   a bar.

   The address keeps the place: #p1-ch3 or #part-2 opens TABS there, and
   #contents/p1-ch3 or #contents/part-2 opens CONTENTS there. A permalink
   (#) beside each heading puts the canonical address in the address bar
   and on the clipboard. Without scripts the page shows everything in
   order.

   Data attributes avoid data-title and data-cmd, which cursors.css gives
   the hand cursor. */
(function () {
  "use strict";

  var main = document.querySelector("main.friday");
  if (!main) return;
  /* Motion as on the game's pages: transitions only under
     html[data-motion="full"] */
  var root = document.documentElement;
  if (!root.getAttribute("data-motion")) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-motion", reduce ? "reduced" : "full");
  }
  var $$ = function (sel, from) { return Array.prototype.slice.call((from || main).querySelectorAll(sel)); };

  var parts = $$(".part").map(function (el) {
    return {
      el: el,
      head: el.querySelector(".part-bar"),
      body: el.querySelector(".part-body"),
      chapters: $$(".chapter", el),
      toc: main.querySelector('.toc-part[data-part="' + el.id + '"]'),
      strip: null,
      tabs: []
    };
  });
  var controls = main.querySelector(".controls");
  var viewButtons = $$(".view-switch .seg");
  var partSwitch = main.querySelector(".part-switch");
  var toc = main.querySelector(".toc");
  var status = main.querySelector(".copied");
  var view = "tabs";
  var pi = 0;
  var ci = 0;
  var statusTimer = null;

  /* Every stop in reading order: each chapter, or the part itself when it
     has none */
  var stops = [];
  parts.forEach(function (p, i) {
    if (p.chapters.length) p.chapters.forEach(function (c, j) { stops.push({ p: i, c: j }); });
    else stops.push({ p: i, c: -1 });
  });

  function stopName(s) {
    var p = parts[s.p];
    if (s.c < 0) return p.el.getAttribute("data-label");
    return p.chapters[s.c].getAttribute("data-name");
  }

  function find(id) {
    for (var i = 0; i < parts.length; i += 1) {
      if (parts[i].el.id === id) return { p: i, c: parts[i].chapters.length ? 0 : -1, part: true };
      for (var j = 0; j < parts[i].chapters.length; j += 1) {
        if (parts[i].chapters[j].id === id) return { p: i, c: j };
      }
    }
    return null;
  }

  function currentId() {
    var p = parts[pi];
    return ci >= 0 && p.chapters.length ? p.chapters[ci].id : p.el.id;
  }

  /* PART buttons */
  var partButtons = parts.map(function (p, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "seg";
    b.textContent = p.el.getAttribute("data-label").toUpperCase();
    b.addEventListener("click", function () {
      go(i, parts[i].chapters.length ? 0 : -1);
      record();
    });
    partSwitch.appendChild(b);
    return b;
  });

  /* One strip of chapter tabs per part, built once and kept in place, so
     choosing a tab never moves the page or the focus */
  parts.forEach(function (p, i) {
    if (!p.chapters.length) return;
    var strip = document.createElement("div");
    strip.className = "tab-strip";
    strip.setAttribute("role", "tablist");
    strip.setAttribute("aria-label", "Chapters of " + p.el.getAttribute("data-label"));
    p.tabs = p.chapters.map(function (ch, j) {
      var t = document.createElement("button");
      t.type = "button";
      t.className = "seg tab";
      t.id = "tab-" + ch.id;
      t.setAttribute("role", "tab");
      t.setAttribute("aria-controls", ch.id);
      t.textContent = ch.getAttribute("data-short").toUpperCase();
      t.addEventListener("click", function () {
        go(i, j);
        record();
      });
      strip.appendChild(t);
      return t;
    });
    strip.addEventListener("keydown", function (e) {
      var k = p.tabs.indexOf(document.activeElement);
      if (k < 0) return;
      var to = null;
      if (e.key === "ArrowRight") to = (k + 1) % p.tabs.length;
      else if (e.key === "ArrowLeft") to = (k - 1 + p.tabs.length) % p.tabs.length;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = p.tabs.length - 1;
      if (to === null) return;
      e.preventDefault();
      go(i, to);
      record();
      p.tabs[to].focus({ preventScroll: true });
    });
    p.body.insertBefore(strip, p.body.firstChild);
    p.strip = strip;
  });

  /* The bar of every stop, between two rules as on the change-notes pages:
     the previous stop at the left, the position in the middle, the next
     stop at the right. It closes each chapter, since the chapter tabs
     already sit above it, and follows the banner of a part without
     chapters. */
  stops.forEach(function (s, n) {
    var prev = stops[n - 1], next = stops[n + 1];
    if (s.c < 0) {
      parts[s.p].body.appendChild(bar(prev, next, s));
      return;
    }
    parts[s.p].chapters[s.c].appendChild(bar(prev, next, s));
  });

  function bar(prev, next, here) {
    var nav = document.createElement("nav");
    nav.className = "bar";
    nav.setAttribute("aria-label", "Previous and next");
    var l = document.createElement("span"), m = document.createElement("span"), r = document.createElement("span");
    l.className = "bar-l"; m.className = "bar-m"; r.className = "bar-r";
    if (prev) l.appendChild(barLink("PREVIOUS: " + stopName(prev), function () { jump(prev); }));
    if (next) r.appendChild(barLink("NEXT: " + stopName(next), function () { jump(next); }));
    if (here.c >= 0) {
      var ch = parts[here.p].chapters[here.c];
      m.textContent = ch.getAttribute("data-n") + " of " + ch.getAttribute("data-total");
    } else {
      m.textContent = parts[here.p].el.getAttribute("data-label");
    }
    nav.appendChild(l); nav.appendChild(m); nav.appendChild(r);
    return nav;
  }

  function barLink(text, act) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lnk";
    b.textContent = text;
    b.addEventListener("click", act);
    return b;
  }

  /* A bar link opens the stop and brings its part separator and tabs into
     view, with the focus on the open tab */
  function jump(s) {
    go(s.p, s.c);
    record();
    var p = parts[pi];
    p.head.scrollIntoView({ block: "start" });
    var tab = ci >= 0 ? p.tabs[ci] : null;
    if (tab) tab.focus({ preventScroll: true });
  }

  function record() {
    var hash = view === "tabs" ? "#" + currentId() : "#contents/" + currentId();
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }

  function render() {
    var tabbed = view === "tabs";
    main.setAttribute("data-view", view);
    viewButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-view") === view ? "true" : "false");
    });
    partButtons.forEach(function (b, i) {
      b.setAttribute("aria-pressed", i === pi ? "true" : "false");
    });
    partSwitch.hidden = parts.length < 2;
    toc.hidden = tabbed;
    parts.forEach(function (p, i) {
      var shown = i === pi;
      p.el.hidden = !shown;
      if (p.toc) p.toc.hidden = !shown;
      if (p.strip) p.strip.hidden = !tabbed;
      p.chapters.forEach(function (ch, j) {
        ch.hidden = tabbed && j !== ci;
        if (tabbed) {
          ch.setAttribute("role", "tabpanel");
          ch.setAttribute("aria-labelledby", "tab-" + ch.id);
        } else {
          ch.removeAttribute("role");
          ch.setAttribute("aria-labelledby", ch.id + "-h");
        }
      });
      p.tabs.forEach(function (t, j) {
        var on = shown && j === ci;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = j === (shown ? ci : 0) ? 0 : -1;
      });
    });
  }

  function go(p, c) {
    pi = p;
    ci = c;
    render();
  }

  /* Switching the view keeps the part, the chapter and the scroll
     position */
  function setView(v) {
    if (v === view) return;
    view = v;
    render();
    record();
  }

  viewButtons.forEach(function (b) {
    b.addEventListener("click", function () { setView(b.getAttribute("data-view")); });
  });

  /* In CONTENTS, links in the table scroll to their chapter and keep it in
     the address */
  toc.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var at = find(id);
    if (!at) return;
    e.preventDefault();
    pi = at.p;
    ci = at.c;
    history.replaceState(null, "", "#contents/" + id);
    document.getElementById(id).scrollIntoView({ block: "start" });
  });

  /* Permalinks: the canonical address goes to the address bar and the
     clipboard */
  main.addEventListener("click", function (e) {
    var a = e.target.closest(".permalink");
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute("href").slice(1);
    var at = find(id);
    if (at) {
      pi = at.p;
      ci = at.c;
    }
    history.replaceState(null, "", view === "tabs" ? "#" + id : "#contents/" + id);
    var url = location.href.split("#")[0] + "#" + id;
    var done = function (ok) { say(ok ? "Link copied" : "Link in the address bar"); };
    try {
      navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
    } catch (err) {
      done(false);
    }
  });

  function say(text) {
    status.textContent = text;
    status.classList.add("on");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { status.classList.remove("on"); }, 1600);
  }

  /* Opening an address: TABS brings the part separator and the tabs into
     view, CONTENTS scrolls to the chapter itself */
  function fromAddress() {
    var hash = decodeURIComponent(location.hash.slice(1));
    var v = "tabs";
    var id = hash;
    if (hash === "contents" || hash.indexOf("contents/") === 0) {
      v = "contents";
      id = hash.slice(9);
    } else if (hash.indexOf("tabs/") === 0) {
      id = hash.slice(5);
    }
    var at = find(id);
    pi = at ? at.p : 0;
    ci = at ? at.c : (parts[0].chapters.length ? 0 : -1);
    view = v;
    render();
    if (!at) return;
    if (v === "contents" && !at.part) document.getElementById(id).scrollIntoView({ block: "start" });
    else parts[pi].head.scrollIntoView({ block: "start" });
  }

  window.addEventListener("hashchange", fromAddress);
  controls.hidden = false;
  fromAddress();
})();
