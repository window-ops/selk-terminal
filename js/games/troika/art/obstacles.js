/* TROIKA.RUN art (js/games/troika/art/): the obstacles on the road, each
   drawn as what it stands for. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r, line = A.line, text = A.text, sign = A.sign, lineH = A.lineH;
  /* An obstacle's label; the Syriza and Varoufakis sets have theirs in
     titanium orange */
  function label(o, x, y, c, align) {
    text(o.label, x, y, o.set ? C.titan : c, align);
  }
  /* Two cables from the top of the canvas down to a hanging obstacle's
     top, inset from its ends */
  function cables(o, inset, top) {
    r(o.x + inset, 0, 1, top, C.dust); r(o.x + o.w - 1 - inset, 0, 1, top, C.dust);
  }
  /* The middle column of an obstacle: for an odd width the pixel in the
     middle, so odd text centres on it exactly */
  function mid(o) {
    return o.x + Math.floor(o.w / 2);
  }
  /* Draws an obstacle on whole pixels. A rating under a beam (o.under) is
     placed from the beam's pixel, o.off to the right, so the two never
     round apart and the rating stays in the middle of the beam. */
  function obstacle(o) {
    var x = o.x;
    o.x = o.under ? Math.round(o.under.x) + o.off : Math.round(o.x);
    draw(o);
    o.x = x;
  }
  /* The obstacles. Each has x, w, h and its bottom at o.bottom; its label
     is above it. */
  function draw(o) {
    var top = o.bottom - o.h, above = top - lineH();
    if (o.kind === "rating") {
      r(o.x, top, o.w, o.h, o.hit ? C.farEdge : C.red);
      r(o.x + 1, top + 1, o.w - 2, 1, o.hit ? C.farEdge : C.redLit);
      r(o.x + 3, top + 6, o.w - 6, 2, C.redLit);
      label(o, mid(o), above, C.white, "center");
    } else if (o.kind === "law") {
      for (var k = 0; k < 6; k++) {
        r(o.x + (k % 2), o.bottom - (k + 1) * 5, o.w - 1, 4, o.hit ? C.dust : C.white);
        r(o.x + (k % 2), o.bottom - (k + 1) * 5 + 4, o.w - 1, 1, C.dust);
      }
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "yield") {
      var pts = [[0, 10], [9, 5], [15, 8], [25, 1], [33, 0]], c = o.hit ? C.dust : C.red;
      for (var i = 1; i < pts.length; i++) {
        line(o.x + pts[i - 1][0], top + pts[i - 1][1], o.x + pts[i][0], top + pts[i][1], c);
        line(o.x + pts[i - 1][0], top + pts[i - 1][1] + 1, o.x + pts[i][0], top + pts[i][1] + 1, c);
      }
      r(o.x + 30, top - 2, 4, 1, c); r(o.x + 33, top - 2, 1, 4, c);
      label(o, o.x + o.w / 2, above - 2, C.red, "center");
    } else if (o.kind === "banner") {
      /* A general strike banner hung across the street on two ropes */
      line(o.x + 2, 0, o.x + 2, top, C.dust); line(o.x + o.w - 3, 0, o.x + o.w - 3, top, C.dust);
      r(o.x, top, o.w, o.h, o.hit ? C.farEdge : C.white);
      r(o.x, top, o.w, 2, C.red); r(o.x, o.bottom - 2, o.w, 2, C.red);
      sign("ΓΕΝΙΚΗ", o.x + o.w / 2, top + 8, C.red, "center");
      sign("ΑΠΕΡΓΙΑ", o.x + o.w / 2, top + 20, C.red, "center");
      sign("GSEE", o.x + o.w / 2, top + 31, C.dark, "center");
    } else if (o.kind === "pit") {
      /* A hole in the pavement, down to the road; once Greece has fallen in,
         it is filled with rubble */
      r(o.x, A.GROUND, o.w, 23, o.hit ? C.seam : C.dark);
      r(o.x, A.GROUND, 2, 23, C.seam); r(o.x + o.w - 2, A.GROUND, 2, 23, C.seam);
      /* A hole under a platform leaves the label to the platform */
      if (!o.covered) { label(o, o.x + o.w / 2, A.GROUND - lineH() - 2, C.dust, "center"); }
    } else if (o.kind === "bill") {
      /* An electricity bill, with a bolt */
      r(o.x, top, o.w, o.h, C.white); r(o.x, top, o.w, 4, C.blue);
      line(o.x + 10, top + 7, o.x + 6, top + 13, C.titan); line(o.x + 6, top + 13, o.x + 11, top + 13, C.titan);
      line(o.x + 11, top + 13, o.x + 7, top + 20, C.titan);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "chairs") {
      /* Empty office chairs, for the jobs lost */
      for (var ch = 0; ch < 4; ch++) {
        var cx2 = o.x + ch * 12;
        r(cx2 + 1, top, 2, 9, C.grey); r(cx2 + 1, top + 8, 8, 2, C.grey);
        r(cx2 + 4, top + 10, 1, 4, C.dust); r(cx2 + 2, o.bottom - 2, 6, 1, C.dust);
        r(cx2 + 2, o.bottom - 1, 1, 1, C.dark); r(cx2 + 7, o.bottom - 1, 1, 1, C.dark);
      }
      label(o, o.x + o.w / 2, above, C.haze, "center");
    } else if (o.kind === "invoice") {
      /* The IMF's invoice, stamped unpaid */
      r(o.x, top, o.w, o.h, C.white);
      for (var il = top + 4; il < o.bottom - 8; il += 3) { r(o.x + 3, il, o.w - 8, 1, C.dust); }
      r(o.x + 2, o.bottom - 9, o.w - 4, 6, C.red); r(o.x + 3, o.bottom - 8, o.w - 6, 4, C.white); r(o.x + 4, o.bottom - 7, o.w - 8, 2, C.red);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "house") {
      /* A house, for the property tax */
      r(o.x + 2, o.bottom - 16, o.w - 4, 16, C.farLit);
      for (var hr = 0; hr < 10; hr++) { r(o.x + 13 - hr - 2, top + hr, hr * 2 + 4, 1, C.red); }
      r(o.x + 10, o.bottom - 9, 6, 9, C.bark); r(o.x + 4, o.bottom - 13, 4, 4, C.lit); r(o.x + 18, o.bottom - 13, 4, 4, C.lit);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "bond") {
      /* A Greek bond, crossed out */
      r(o.x, top, o.w, o.h, C.haze); r(o.x + 2, top + 2, o.w - 4, o.h - 4, C.white);
      r(o.x + 5, top + 5, o.w - 10, 1, C.dust); r(o.x + 5, top + 9, o.w - 10, 1, C.dust);
      for (var b2 = 0; b2 < 2; b2++) { line(o.x + b2, top, o.x + o.w - 2 + b2, o.bottom - 1, C.red); line(o.x + o.w - 2 + b2, top, o.x + b2, o.bottom - 1, C.red); }
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "table") {
      /* The Eurogroup's table, with its chairs */
      r(o.x + 6, o.bottom - 12, o.w - 12, 3, C.bark);
      r(o.x + 8, o.bottom - 9, 2, 9, C.bark); r(o.x + o.w - 10, o.bottom - 9, 2, 9, C.bark);
      [0, o.w - 5].forEach(function (cx) { r(o.x + cx, o.bottom - 18, 2, 18, C.farEdge); r(o.x + cx, o.bottom - 8, 5, 2, C.farEdge); });
      r(o.x + 14, o.bottom - 15, 6, 3, C.white); r(o.x + 24, o.bottom - 14, 5, 2, C.blue);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "ice") {
      /* A frozen pipe of emergency liquidity, hung from above */
      r(o.x + o.w - 6, 0, 3, top, C.dust);
      r(o.x, top, o.w, 5, C.dust); r(o.x, top, o.w, 1, C.ice);
      for (var ic = 2; ic < o.w - 2; ic += 5) { r(o.x + ic, top + 5, 2, 3 + (ic * 7) % 5, C.ice); }
      label(o, o.x + o.w / 2, above - 2, C.ice, "center");
    } else if (o.kind === "gas") {
      /* A cloud of tear gas at head height */
      A.g.globalAlpha = 0.8;
      [[0, 4, 14, 8], [8, 0, 18, 12], [22, 2, 16, 10], [32, 5, 14, 8]].forEach(function (c) { r(o.x + c[0], top + c[1], c[2], c[3], C.grey); });
      A.g.globalAlpha = 1;
      label(o, o.x + o.w / 2, above - 2, C.white, "center");
    } else if (o.kind === "mtfs") {
      /* The medium-term fiscal strategy, a concrete slab hanging just above
         Greece's head on two cables */
      cables(o, 8, top);
      r(o.x, top, o.w, o.h, C.kerb); r(o.x, top, o.w, 1, C.grey); r(o.x, o.bottom - 2, o.w, 2, C.titan);
      for (var mx = o.x + 20; mx < o.x + o.w - 10; mx += 30) { r(mx, top + 2, 1, o.h - 4, C.pave); }
      text(o.label, o.x + o.w / 2, top + Math.round((o.h - 7 * A.ts) / 2), C.white, "center");
    } else if (o.kind === "shutter") {
      /* A bank's ground floor across the passage, its roller shutter pulled
         down to just above the pavement: the wall above with its sign and
         windows, the pillars at the sides behind Greece */
      var wall = o.bottom - o.h, sTop = o.bottom - 50;
      r(o.x - 8, wall, o.w + 16, sTop - wall, C.farLit);
      r(o.x - 10, wall - 3, o.w + 20, 3, C.farEdge);
      for (var wy = wall + 8; wy < sTop - 24; wy += 16) { r(o.x + 4, wy, 10, 9, C.window); r(o.x + o.w - 14, wy, 10, 9, C.window); }
      r(o.x - 4, sTop - 14, o.w + 8, 10, C.blue);
      sign("ΤΡΑΠΕΖΑ", o.x + o.w / 2, sTop - 12, C.white, "center");
      r(o.x - 8, sTop, 8, A.GROUND - sTop, C.farEdge); r(o.x + o.w, sTop, 8, A.GROUND - sTop, C.farEdge);
      r(o.x, sTop, o.w, o.bottom - sTop, C.dust);
      for (var sy = sTop + 2; sy < o.bottom; sy += 3) { r(o.x, sy, o.w, 1, C.farEdge); }
      r(o.x - 2, o.bottom - 3, o.w + 4, 3, C.farDark);
      r(o.x + 3, o.bottom - 18, o.w - 6, 11, C.red);
      sign(o.label, o.x + o.w / 2, o.bottom - 16, C.white, "center");
    } else if (o.kind === "forsale") {
      /* A for sale sign on a post */
      r(o.x + 9, top + 10, 2, o.h - 10, C.dust);
      r(o.x, top, o.w, 11, C.white); r(o.x, top, o.w, 3, C.red);
      r(o.x + 3, top + 5, o.w - 6, 1, C.dust); r(o.x + 3, top + 8, o.w - 9, 1, C.dust);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "vat") {
      /* A cash register with its receipt */
      r(o.x, top + 4, o.w, o.h - 4, C.farLit); r(o.x + 3, top + 6, o.w - 10, 3, C.leafLit);
      r(o.x + o.w - 6, top, 4, 6, C.white);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "calc") {
      /* A calculator, for the revised deficit */
      r(o.x, top, o.w, o.h, C.farLit); r(o.x + 2, top + 2, o.w - 4, 5, C.leafLit);
      for (var cr = 0; cr < 3; cr++) { for (var cc = 0; cc < 3; cc++) { r(o.x + 3 + cc * 4, top + 10 + cr * 4, 3, 2, C.dust); } }
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "tent") {
      /* A tent of the camp on the square */
      for (var tr = 0; tr < o.h; tr++) { r(o.x + 15 - tr, top + tr, tr * 2 + 1, 1, tr % 4 === 3 ? C.awning : C.titan); }
      r(o.x + 13, o.bottom - 7, 5, 7, C.dark); r(o.x + 15, top - 3, 1, 3, C.dust);
      label(o, o.x + o.w / 2, above - 3, C.white, "center");
    } else if (o.kind === "envelope") {
      /* A pay envelope */
      r(o.x, top, o.w, o.h, C.haze);
      line(o.x, top, o.x + o.w / 2, top + 8, C.dust); line(o.x + o.w - 1, top, o.x + o.w / 2, top + 8, C.dust);
      r(o.x, top, o.w, 1, C.white);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "tv") {
      /* An old television set, dark once ERT is closed */
      line(o.x + 8, top, o.x + 12, top + 3, C.dust); line(o.x + 16, top, o.x + 12, top + 3, C.dust);
      r(o.x, top + 3, o.w, o.h - 3, C.farEdge); r(o.x + 3, top + 6, o.w - 9, o.h - 9, o.dark ? C.dark : C.blue);
      r(o.x + o.w - 5, top + 7, 2, 2, C.dust); r(o.x + o.w - 5, top + 11, 2, 2, C.dust);
      label(o, o.x + o.w / 2, above - 3, C.white, "center");
    } else if (o.kind === "bucket") {
      /* A cleaner's bucket and mop, with red rubber gloves */
      line(o.x + 18, top, o.x + 11, top + 10, C.bark);
      r(o.x + 2, top + 8, 14, o.h - 8, C.blue); r(o.x + 1, top + 8, 16, 2, C.dust);
      r(o.x + 4, top + 5, 3, 4, C.red); r(o.x + 9, top + 6, 3, 3, C.red);
      label(o, o.x + o.w / 2, above - 2, C.white, "center");
    } else if (o.kind === "coin") {
      /* A euro coin on its edge with the haircut cut out of it: 46.5% is
         left, the lost part only outlined */
      var cx = o.x + 12, cy = o.bottom - 12, cut = 2 * Math.PI * 0.535;
      for (var py = -11; py <= 11; py++) {
        for (var px = -11; px <= 11; px++) {
          var rr = px * px + py * py;
          if (rr > 121) { continue; }
          var ang = (Math.atan2(py, px) + 2 * Math.PI + Math.PI / 2) % (2 * Math.PI);
          if (ang >= cut) { r(cx + px, cy + py, 1, 1, rr > 81 ? C.haze : C.titan); }
          else if (rr > 100) { r(cx + px, cy + py, 1, 1, C.dust); }
        }
      }
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else if (o.kind === "debt") {
      /* The public debt, a steel beam hanging over Greece on two cables */
      cables(o, 6, top);
      r(o.x, top, o.w, 4, C.crane); r(o.x, o.bottom - 4, o.w, 4, C.crane);
      r(o.x + 4, top + 4, o.w - 8, o.h - 8, C.farEdge);
      for (var bx = o.x + 8; bx < o.x + o.w - 8; bx += 12) { line(bx, top + 4, bx + 6, o.bottom - 5, C.crane); }
      text(o.label, mid(o), top + Math.round((o.h - 7 * A.ts) / 2), C.white, "center");
    } else if (o.kind === "ballot") {
      /* The ballot box of the referendum */
      r(o.x, top + 4, o.w, o.h - 4, C.white); r(o.x, top + 4, o.w, 2, C.blue);
      r(o.x + 6, top + 4, o.w - 12, 1, C.dark);
      r(o.x + 8, top, 6, 5, C.haze);
      label(o, o.x + o.w / 2, above, C.white, "center");
    } else {
      /* A queue at a cash machine */
      for (var p = 0; p < 9; p++) {
        var px = o.x + p * 10, h = 24 + (p * 5) % 5;
        r(px + 2, o.bottom - h, 5, 5, C.skin);
        r(px + 1, o.bottom - h + 5, 7, h - 11, [C.dust, C.haze, C.kiosk][p % 3]);
        r(px + 2, o.bottom - 6, 2, 6, C.suit); r(px + 5, o.bottom - 6, 2, 6, C.suit);
      }
      label(o, o.x + o.w / 2, above, C.haze, "center");
    }
  }
  A.obstacle = obstacle;
})();
