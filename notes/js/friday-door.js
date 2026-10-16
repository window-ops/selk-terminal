/* Developer notes: a hidden door. Once the page has reached its natural
   end, scrolling on past it (the wheel, a finger dragging up, or the Down,
   Page Down, End and Space keys) builds up a pull. When the pull is large
   enough, a small button is ejected from under the bottom edge of the
   window and stays over the page; it opens friday.html. Scrolling back up
   into the page puts it away again. The button exists only after the pull,
   so the page shows nothing of it before. */
(function () {
  "use strict";

  var PULL = 620;
  var root = document.documentElement;
  var pull = 0;
  var door = null;
  var out = false;
  var touchY = null;

  /* Motion as on the game's pages: play the slide only under
     html[data-motion="full"] */
  if (!root.getAttribute("data-motion")) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-motion", reduce ? "reduced" : "full");
  }

  function gap() {
    var doc = document.scrollingElement || root;
    return doc.scrollHeight - (window.scrollY + window.innerHeight);
  }

  function atEnd() {
    return gap() <= 2;
  }

  function build() {
    door = document.createElement("a");
    door.className = "friday-door";
    door.href = "friday.html";
    door.innerHTML = '<span class="friday-door-title">Every second Friday</span>' +
      '<span class="friday-door-sub">a story after Selk</span>';
    door.addEventListener("transitionend", function () {
      if (!out) door.hidden = true;
    });
    document.body.appendChild(door);
  }

  function eject() {
    if (out) return;
    if (!door) build();
    door.hidden = false;
    out = true;
    /* Two frames, so the button is drawn below the edge before it slides */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        door.classList.add("is-out");
      });
    });
  }

  function retract() {
    if (!out) return;
    out = false;
    door.classList.remove("is-out");
    if (root.getAttribute("data-motion") !== "full") door.hidden = true;
  }

  function push(amount) {
    if (!atEnd()) {
      pull = 0;
      return;
    }
    pull += amount;
    if (pull >= PULL) eject();
  }

  window.addEventListener("wheel", function (e) {
    if (e.deltaY <= 0) return;
    push(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY);
  }, { passive: true });

  window.addEventListener("touchstart", function (e) {
    touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
  }, { passive: true });

  window.addEventListener("touchmove", function (e) {
    if (touchY === null || e.touches.length !== 1) return;
    var y = e.touches[0].clientY;
    if (touchY - y > 0) push(touchY - y);
    touchY = y;
  }, { passive: true });

  window.addEventListener("touchend", function () {
    touchY = null;
  }, { passive: true });

  window.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "End" || (e.key === " " && !e.shiftKey)) {
      push(e.key === "ArrowDown" ? 60 : 160);
    }
  });

  window.addEventListener("scroll", function () {
    if (atEnd()) return;
    pull = 0;
    if (out && gap() > 160) retract();
  }, { passive: true });
})();
