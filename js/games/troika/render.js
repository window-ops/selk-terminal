/* TROIKA.RUN (core.js): a frame of the run on the canvas, in layers that
   the ending (ending.js) reuses: the background, the things on the road,
   the status line, the year line, the Troika and Greece. */
(function () {
  var S = window.SELK, T = S.troikaGame, A = S.troikaArt;
  /* The far scenes follow the clock: they move one scene width a year,
     and each year's scene reaches Greece as the year starts and leaves as
     it ends, so the scene behind Greece is always the place in the title
     bar. Before 2010 and after 2015 the street is plain blocks. */
  function scenes() {
    var st = T.st, tile = A.TILE, off = st.t * tile / T.YEAR_SECONDS - T.RUNNER_X;
    for (var k = Math.floor(off / tile); k * tile - off < T.W; k++) {
      A.scene(Math.max(0, Math.min(5, k)), Math.round(k * tile - off), st.flags, k < 0 || k > 5, k);
    }
  }
  /* Near the end, planes leave Greece: from the middle of 2014 one takes off
     every 2.4 s and climbs across the sky, for the young and educated who
     emigrated (about 427 000 people from 2008 to 2015, by the Bank of
     Greece's estimate). They stop at 2016. */
  function planes() {
    var st = T.st, from = 4.5 * T.YEAR_SECONDS, t = Math.min(st.t, T.END);
    for (var i = 0; from + i * 2.4 <= t; i++) {
      var e = st.t - from - i * 2.4, x = Math.round(-20 + e * 60);
      if (x > T.W + 20) { continue; }
      A.plane(x, Math.max(34, Math.round(130 - e * 9 + (i % 3) * 12)));
    }
  }
  /* The year as a number that blends into the next over the last 4 s of
     each year, for the sky */
  T.skyYear = function () {
    var st = T.st, y = T.yearOf(st.t), f = y < 5 ? Math.max(0, (st.t - y * T.YEAR_SECONDS - (T.YEAR_SECONDS - 4)) / 4) : 0;
    return y + f * f * (3 - 2 * f);
  };
  /* Rises over 0.5 s and falls over the last second of left */
  T.fade = function (age, left) {
    return Math.max(0, Math.min(1, age / 0.5, left));
  };
  /* Splits s into lines no wider than max canvas pixels */
  T.wrap = function (s, max) {
    var out = [], cur = "";
    s.split(" ").forEach(function (word) {
      var next = cur ? cur + " " + word : word;
      if (cur && S.pixelFont.width(next) * A.scale() > max) { out.push(cur); cur = word; } else { cur = next; }
    });
    if (cur) { out.push(cur); }
    return out;
  };
  /* The sky, the mountains, the city, the scenes, the props and the road;
     extra draws over the props, so nothing on the pavement covers what it
     draws, as ending.js does with the building */
  T.drawBack = function (extra) {
    var st = T.st, sy = T.skyYear();
    A.sky(sy);
    planes();
    A.hills(st.dist * 0.08, sy);
    A.city(st.dist * 0.14);
    scenes();
    A.light(sy);
    A.props(st.dist * 0.5, st.flags);
    if (extra) { extra(); }
    A.road(st.dist);
  };
  T.drawThings = function () {
    var st = T.st;
    st.platforms.forEach(function (p) { p.top = T.GROUND - p.lift; A.platform(p); });
    st.obstacles.forEach(function (o) { o.bottom = T.GROUND - o.lift; A.obstacle(o); });
  };
  /* A status line under the year line: the effect of the last choice for
     4 s, or the note on emigration near the end */
  T.drawBanner = function () {
    var st = T.st;
    if (st.bannerT <= 0) { return; }
    A.g.globalAlpha = T.fade(st.bannerLen - st.bannerT, st.bannerT);
    T.wrap(st.banner, T.W - 24).forEach(function (l, n) { A.text(l, T.W / 2, 27 + A.lineH() * (n + 1), A.C.haze, "center"); });
    A.g.globalAlpha = 1;
  };
  /* The year line runs from 2010 at its left end to 2016 at its right end,
     so the run through 2015 shows; the marker moves with time and stops at
     2016. Years are written short when full ones would touch. It is drawn
     over the obstacles, whose cables run to the top. */
  T.drawYears = function () {
    var st = T.st, C = A.C, year = st.t >= T.END ? 6 : T.yearOf(st.t), g = A.g;
    var span = T.W - 80, step = span / 6;
    var short = S.pixelFont.width("2010") * (A.lineH() - 3) / 7 > step - 8;
    g.fillStyle = C.farEdge; g.fillRect(40, 12, span, 2);
    for (var i = 0; i < 7; i++) {
      var yx = 40 + Math.round(i * step);
      g.fillStyle = C.dust; g.fillRect(yx, 9, 1, 8);
      A.text(short ? "'1" + i : String(2010 + i), yx, 21, i === year ? C.haze : C.dust, "center");
    }
    g.fillStyle = C.blue; g.fillRect(40 + Math.round(Math.min(st.t / T.END, 1) * span) - 1, 8, 3, 10);
  };
  /* The Troika runs behind Greece, the EC nearest; walk is the step of the
     run, or null for standing still */
  T.drawTroika = function (walk, alpha) {
    var st = T.st, C = A.C;
    var tx = Math.round(T.RUNNER_X - 36 - st.gap * (T.RUNNER_X - 60)), ties = [C.blue, C.haze, C.white];
    /* The names over the runners show for the first 12 s of the run, then
       fade, so they never cover the obstacles' figures */
    var names = T.fade(st.t, 12 - st.t), who = [S.t("EC"), S.t("ECB"), S.t("IMF")];
    /* Spaced by the widest name, so the names never touch */
    var apart = Math.max(26, Math.max.apply(null, who.map(S.pixelFont.width)) * A.scale() + 6);
    A.g.globalAlpha = alpha == null ? 1 : alpha;
    who.forEach(function (n, k) {
      var px = tx - k * apart;
      A.official(px, T.GROUND, ties[k], walk == null ? 1 : (walk + k) % 4);
      /* A name that would touch Greece's is left out */
      var half = (S.pixelFont.width(n) + S.pixelFont.width(S.t("Greece"))) * A.scale() / 2;
      if (px + half + 6 > T.RUNNER_X || names <= 0) { return; }
      A.g.globalAlpha = names * (alpha == null ? 1 : alpha); A.text(n, px, T.GROUND - 30 - A.lineH(), C.dust, "center");
      A.g.globalAlpha = alpha == null ? 1 : alpha;
    });
    A.g.globalAlpha = 1;
  };
  /* Greece at x (RUNNER_X by default), facing right, or left when face is
     -1, with the name over it while names shows (0 to 1) */
  T.drawGreece = function (phase, names, x, face) {
    var st = T.st, flash = st.hitFlash > 0 && Math.floor(st.hitFlash * 20) % 2 === 0;
    var pose = st.sit ? "sit" : !st.on ? "air" : st.duck ? "duck" : "run", feet = T.GROUND + Math.round(st.y), rx = x == null ? T.RUNNER_X : x;
    if (face < 0) {
      A.g.save(); A.g.translate(2 * rx + 1, 0); A.g.scale(-1, 1);
      A.runner(rx, feet, pose, phase, flash);
      A.g.restore();
    } else {
      A.runner(rx, feet, pose, phase, flash);
    }
    if (names > 0) {
      A.g.globalAlpha = names;
      A.text(S.t("Greece"), rx, feet - (st.duck ? 18 : st.sit ? 22 : 30) - A.lineH(), A.C.haze, "center");
      A.g.globalAlpha = 1;
    }
  };
  T.draw = function () {
    var st = T.st;
    if (st.end) { T.endDraw(); return; }
    var phase = Math.floor(st.dist / 14) % 4;
    T.drawBack(st.door ? function () { A.entrance(Math.round(T.doorAt())); } : null);
    T.drawBanner();
    T.drawThings();
    T.drawYears();
    T.drawTroika(phase);
    T.drawGreece(phase, T.fade(st.t, 12 - st.t));
  };
})();
