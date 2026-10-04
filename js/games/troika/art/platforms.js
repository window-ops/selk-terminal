/* TROIKA.RUN art (js/games/troika/art/): the fragile platforms and the
   loan tranches. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r, text = A.text, lineH = A.lineH;
  /* One 12-pixel piece of a fragile platform, by its style: treasury bills
     as thin paper notes, the bank recapitalisation as scaffold boards on
     steel tubes, the success story as a pane of glass, the bridge loan as a
     rope bridge */
  /* The width of one piece of each style; pieces are 12 pixels apart */
  var PIECE = { notes: 11, scaffold: 12, glass: 11, rope: 12 };
  /* How wide n pieces of a style are drawn, from the left edge of the
     first to the right edge of the last: the width a platform takes, so
     the hole under it can leave the same room on each side (spawn.js) */
  function fragileWidth(style, n) {
    return (n - 1) * 12 + PIECE[style];
  }
  function piece(style, x, y, n) {
    if (style === "notes") {
      r(x, y, 11, 2, C.white); r(x + 1, y + 2, 10, 2, C.haze); r(x, y + 4, 11, 1, C.dust);
      r(x + 2, y + 1, 5, 1, C.dust);
    } else if (style === "scaffold") {
      r(x, y, 12, 2, C.grey); r(x, y + 2, 12, 3, C.crane); r(x + 5, y, 2, 5, C.dust);
      if (n % 3 === 0) { r(x + 5, y + 5, 1, 9, C.grey); }
    } else if (style === "glass") {
      A.g.globalAlpha *= 0.7; r(x, y, 11, 4, C.ice); A.g.globalAlpha /= 0.7;
      r(x, y, 11, 1, C.white); r(x + 2 + n % 3, y + 1, 2, 1, C.white);
    } else {
      var sag = Math.round(2 * Math.sin(Math.PI * (n + 0.5) / 8));
      r(x + 1, y + 1 + sag, 10, 3, C.bark); r(x, y + sag, 12, 1, C.haze);
    }
  }
  /* A fragile platform shakes from the moment Greece lands on it, then
     breaks apart and its pieces fall. Over a hole (p.pit) it is drawn from
     the hole's pixel, p.off to the right, so the two never round apart and
     the platform stays in the middle of the hole. */
  function fragile(p) {
    var shake = p.standT > 0 && !p.broken ? (Math.floor(p.standT * 30) % 2 ? 1 : -1) : 0;
    var x0 = p.pit ? Math.round(p.pit.x) + p.off : Math.round(p.x), count = Math.round((p.w - PIECE[p.style]) / 12) + 1;
    if (p.broken) { A.g.globalAlpha = Math.max(0, 1 - p.fall); }
    for (var n = 0; n < count; n++) {
      piece(p.style, x0 + n * 12 + shake, p.top + (p.broken ? Math.round(p.fall * p.fall * (240 + n % 3 * 60)) : 0), n);
    }
    A.g.globalAlpha = 1;
    if (!p.broken) { text(p.label, x0 + Math.floor(p.w / 2), p.top - lineH(), C.haze, "center"); }
  }
  /* A loan tranche: pallets of banknote bundles stacked on the pavement,
     its top at p.top and its label on its face */
  function platform(p) {
    if (p.fragile) { fragile(p); return; }
    for (var y = p.top; y < A.GROUND; y += 10) {
      r(p.x, y, p.w, 8, p.used ? C.farEdge : C.leaf);
      for (var x = p.x + 2; x < p.x + p.w - 6; x += 9) { r(x, y + 2, 7, 4, p.used ? C.farLit : C.leafLit); }
      r(p.x, y + 8, p.w, 2, C.bark);
    }
    r(p.x, p.top, p.w, 1, C.white);
    text(p.label, p.x + p.w / 2, p.top - lineH(), C.white, "center");
  }
  A.platform = platform; A.fragileWidth = fragileWidth;
})();
