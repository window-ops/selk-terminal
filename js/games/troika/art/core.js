/* The drawings of TROIKA.RUN (js/games/troika/) on its canvas, 640 by 320
   in landscape and 320 wide and taller in portrait (size). This file holds
   what the other drawing files share: the palette, the context, the size,
   the text scale and the drawing primitives. The other files in art/ add
   their drawings to S.troikaArt:
   - sky.js: the sky, the mountains, the planes and the roofs of the city;
   - scenes.js: the street scene of each year;
   - street.js: the props along the pavement and the road;
   - people.js: Greece and the officials of the Troika;
   - obstacles.js and platforms.js: what is on the road;
   - ending.js: the 2016 ending, the building, the economist's office,
     Athens seen from above and the street of 2097.
   Each scene is TILE pixels wide and stands on the pavement line, GROUND,
   60 pixels above the bottom. */
(function () {
  var S = window.SELK;
  var C = {
    far: "#283034", farLit: "#323C40", farEdge: "#3F4A4E", farDark: "#1C2225",
    window: "#1A2023", lit: "#6B6247",
    pave: "#4A5559", seam: "#3A4448", kerb: "#5E6A6E", road: "#2C3437",
    haze: "#D6C396", dust: "#8F9A9A", titan: "#C7843A", red: "#C8433A", redLit: "#D8655C",
    blue: "#5B8BC4", white: "#E8E4DA", dark: "#15191B",
    skin: "#C9A27E", hair: "#2A2220", grey: "#9A9A96", suit: "#2E3639", suitLit: "#3C4649",
    sea: "#1F2B33", wave: "#2B3A44", kiosk: "#3F5246", awning: "#8A5C2C",
    city: "#22292C", cityLit: "#293134", cypress: "#1F2725",
    leaf: "#5E6B4E", leafLit: "#6F7C5C", bark: "#5A4634", crane: "#6E5638", ice: "#9CC3D9",
    gold: "#D9B54A", solar: "#2C4A6E", solarLit: "#4A6E96", tweed: "#5A4A3A", book: "#6A3330"
  };
  var A = S.troikaArt = {
    W: 640, H: 320, GROUND: 260, TILE: 640, C: C,
    /* The canvas context, and how many canvas pixels a font pixel takes */
    g: null, ts: 1,
    use: function (ctx) { A.g = ctx; },
    /* Sets the canvas size; GROUND stays 60 pixels above the bottom */
    size: function (w, h) { A.W = w; A.H = h; A.GROUND = h - 60; },
    /* Text drawn at 2 or more canvas pixels per font pixel on a small display */
    textScale: function (k) { A.ts = k; },
    scale: function () { return A.ts; }
  };
  function r(x, y, w, h, c) {
    A.g.fillStyle = c; A.g.fillRect(Math.round(x), Math.round(y), w, h);
  }
  /* Text on the canvas has a dark edge, so it reads over the scenes */
  function text(s, x, y, c, align) {
    S.pixelFont.draw(A.g, s, x, y, c, align, C.dark, A.ts);
  }
  /* Large text, k canvas pixels a font pixel, with the dark edge */
  function big(s, x, y, c, align, k) {
    S.pixelFont.draw(A.g, s, x, y, c, align, C.dark, k);
  }
  /* Lettering painted on the scenery, at the scenery's scale */
  function sign(s, x, y, c, align) {
    S.pixelFont.draw(A.g, s, x, y, c, align);
  }
  /* The height of a line of text at the current scale, with its gap */
  function lineH() {
    return 7 * A.ts + 3;
  }
  /* A line one pixel wide from (x0, y0) to (x1, y1) */
  function line(x0, y0, x1, y1, c) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (var i = 0; i <= n; i++) { r(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c); }
  }
  /* People seen from afar, standing between x0 and x1 */
  function crowd(x0, x1, c) {
    for (var x = x0; x < x1; x += 6) {
      var h = 10 + (x * 7) % 3;
      r(x, A.GROUND - h + 3, 4, h - 3, c);
      r(x + 1, A.GROUND - h, 2, 3, c);
    }
  }
  function rgb(h) {
    return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); });
  }
  /* A colour between two "#rrggbb" colours, f from 0 to 1 */
  function mix(a, b, f) {
    var x = rgb(a), y = rgb(b);
    return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * f); }).join(",") + ")";
  }
  /* The same between two "rgb(r,g,b)" colours */
  function mixRgb(a, b, f) {
    var x = a.match(/\d+/g), y = b.match(/\d+/g);
    return "rgb(" + x.map(function (v, i) { return Math.round(+v + (y[i] - v) * f); }).join(",") + ")";
  }
  /* An "rgb(r,g,b)" colour as "#rrggbb", for mixing it again */
  function hex(c) {
    return "#" + c.match(/\d+/g).map(function (v) { return (+v).toString(16).padStart(2, "0"); }).join("");
  }
  /* A number from 0 to 999 that is the same for the same n */
  function hash(n) {
    return (Math.imul(n, 2654435761) >>> 0) % 1000;
  }
  A.r = r; A.text = text; A.big = big; A.sign = sign; A.lineH = lineH; A.line = line; A.crowd = crowd;
  A.rgb = rgb; A.mix = mix; A.mixRgb = mixRgb; A.hex = hex; A.hash = hash;
})();
