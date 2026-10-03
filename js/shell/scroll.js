/* Drag-to-scroll for scrollable areas, so content can be moved with the mouse
   as well as with the wheel and the keyboard. */
(function () {
  "use strict";
  var selectors = ".scroll, .etable-wrap, .graph, .wb-wbody, .entry-body, .mail-body, .paras, .mc-mini";
  /* One-line text strips: no scrollbar, an ellipsis at rest, and a drag
     scrolls the line with the normal pointer, since their text cannot be
     selected */
  var STRIPS = ".mc-mini";
  var active = null, moved = false, startX = 0, startY = 0, left = 0, top = 0, suppressClick = false;

  function canScroll(node) {
    return node && (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
  }

  function isScrollTarget(node) {
    return node.matches(".scroll") || canScroll(node);
  }

  function scan(root) {
    if (root.nodeType !== 1 && root !== document) {
      return;
    }
    if (root.matches && root.matches(selectors) && isScrollTarget(root)) {
      root.classList.add("scroll-pan");
      if (!root.hasAttribute("tabindex")) {
        root.setAttribute("tabindex", "0");
      }
    }
    if (root.querySelectorAll) {
      root.querySelectorAll(selectors).forEach(function (node) {
        if (isScrollTarget(node)) {
          node.classList.add("scroll-pan");
          if (!node.hasAttribute("tabindex")) {
            node.setAttribute("tabindex", "0");
          }
        }
      });
    }
  }

  function finish() {
    if (active) {
      active.classList.remove("scroll-panning");
    }
    document.body.classList.remove("scroll-panning", "pan-text");
    document.querySelectorAll(".scroll-pan.scroll-panning").forEach(function (node) {
      node.classList.remove("scroll-panning");
    });
    if (!active) {
      moved = false;
      return;
    }
    if (moved) {
      suppressClick = true;
      setTimeout(function () {
        suppressClick = false;
      }, 0);
    }
    active = null;
  }

  /* True when the pointer is over characters. A press there starts a text
     selection, so drag-to-scroll does not start; a press on empty space
     scrolls. */
  function overText(x, y) {
    var node = null, off = 0;
    if (document.caretPositionFromPoint) {
      var cp = document.caretPositionFromPoint(x, y); if (cp) { node = cp.offsetNode; off = cp.offset; }
    } else if (document.caretRangeFromPoint) {
      var cr = document.caretRangeFromPoint(x, y); if (cr) { node = cr.startContainer; off = cr.startOffset; }
    }
    if (!node || node.nodeType !== 3 || !node.nodeValue.trim()) { return false; }
    var r = document.createRange(), len = node.nodeValue.length;
    r.setStart(node, Math.max(0, Math.min(off, len - 1))); r.setEnd(node, Math.min(len, Math.max(off, 0) + 1));
    return [].some.call(r.getClientRects(), function (b) { return x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 2 && y <= b.bottom + 2; });
  }

  document.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && !event.target.closest(STRIPS) && overText(event.clientX, event.clientY)) {
      return;
    }
    var strip = event.target.closest(STRIPS);
    if (event.button !== 0 || (event.pointerType === "touch" && !strip) || event.target.closest("button, a, input, textarea, select, [draggable='true'], .grip, .wb-badge, .blank, .unfill")) {
      return;
    }
    var node = event.target.closest(selectors);
    if (!node || !canScroll(node)) {
      return;
    }
    scan(node);
    active = node;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    left = node.scrollLeft;
    top = node.scrollTop;
  });

  document.addEventListener("pointermove", function (event) {
    if (!active) {
      return;
    }
    var dx = event.clientX - startX, dy = event.clientY - startY;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 6) {
      return;
    }
    moved = true;
    event.preventDefault();
    active.classList.add("scroll-panning");
    document.body.classList.add("scroll-panning");
    document.body.classList.toggle("pan-text", active.matches(STRIPS));
    active.scrollLeft = left - dx;
    active.scrollTop = top - dy;
    active.classList.toggle("scrolled", active.scrollLeft > 0);
  }, { passive: false });

  document.addEventListener("pointerup", finish);
  document.addEventListener("pointercancel", finish);
  window.addEventListener("pointerup", finish, true);
  window.addEventListener("pointercancel", finish, true);
  window.addEventListener("mouseup", finish, true);
  window.addEventListener("blur", finish);
  document.addEventListener("click", function (event) {
    if (suppressClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    var node = document.activeElement;
    if (!node || !node.matches(selectors) || !canScroll(node) || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    var line = parseFloat(getComputedStyle(node).lineHeight);
    if (!Number.isFinite(line)) {
      line = 24;
    }
    var page = Math.max(line * 3, node.clientHeight * 0.85);
    var handled = true;
    switch (event.key) {
      case "ArrowUp": node.scrollTop -= line; break;
      case "ArrowDown": node.scrollTop += line; break;
      case "ArrowLeft": node.scrollLeft -= line; break;
      case "ArrowRight": node.scrollLeft += line; break;
      case "PageUp": node.scrollTop -= page; break;
      case "PageDown": node.scrollTop += page; break;
      case "Home": node.scrollTop = 0; break;
      case "End": node.scrollTop = node.scrollHeight; break;
      default: handled = false;
    }
    if (handled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  scan(document);
  new MutationObserver(function (changes) {
    changes.forEach(function (change) {
      var parent = change.target.nodeType === 1 ? change.target : change.target.parentElement;
      while (parent) {
        if (parent.matches && parent.matches(selectors)) {
          scan(parent);
        }
        parent = parent.parentElement;
      }
      change.addedNodes.forEach(scan);
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
