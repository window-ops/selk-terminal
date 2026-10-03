/* Curved glass for Vignette and curvature. The screen is clipped to the
   outline of a tube's face: edges that bulge slightly outward and rounded
   corners. The outline is rebuilt only when the screen changes size, and the
   content is not warped, so the pointer position stays exact. The content is
   inset by the depth of the curved corners (--crt-pad), so the clip covers no
   content. */
(function () {
  "use strict";
  var S = window.SELK;
  function outline(w, h) {
    var m = Math.min(w, h), r = m * 0.05, b = m * 0.014;
    /* Corners sit b inside the box and edge middles touch it, for a convex
       face */
    return "M " + r + " " + b +
      " Q " + (w / 2) + " 0 " + (w - r) + " " + b +
      " Q " + (w - b) + " " + b + " " + (w - b) + " " + r +
      " Q " + w + " " + (h / 2) + " " + (w - b) + " " + (h - r) +
      " Q " + (w - b) + " " + (h - b) + " " + (w - r) + " " + (h - b) +
      " Q " + (w / 2) + " " + h + " " + r + " " + (h - b) +
      " Q " + b + " " + (h - b) + " " + b + " " + (h - r) +
      " Q 0 " + (h / 2) + " " + b + " " + r +
      " Q " + b + " " + b + " " + r + " " + b + " Z";
  }
  /* How far the corner curve reaches into the screen: the quadratic curve
     from (r, b) to (b, r) through (b, b) reaches 0.25 r + 0.75 b */
  function inset(w, h) {
    var m = Math.min(w, h);
    return Math.ceil(0.25 * m * 0.05 + 0.75 * m * 0.014) + 2;
  }
  function fit() {
    var s = document.getElementById("screen");
    if (!s) { return; }
    var on = document.body.classList.contains("crt-curve");
    s.style.clipPath = on ? "path('" + outline(s.offsetWidth, s.offsetHeight) + "')" : "";
    s.style.setProperty("--crt-pad", on ? inset(s.offsetWidth, s.offsetHeight) + "px" : "0px");
  }
  S.crtMask = { fit: fit };
  document.addEventListener("DOMContentLoaded", function () {
    var s = document.getElementById("screen");
    if (s && window.ResizeObserver) {
      new ResizeObserver(fit).observe(s);
    }
  });
})();
