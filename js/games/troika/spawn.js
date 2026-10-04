/* TROIKA.RUN (core.js): which obstacle comes next and where. Every kind
   that belongs to the year has a weight near 1, so no kind crowds out the
   others; the choices at the gates raise some of them a little. A kind
   seen in the last three obstacles is less likely, the last one not at
   all, and each year has at least one loan tranche. Obstacles come at an
   even distance along the road, so a change of speed at a gate does not
   open long empty stretches. */
(function () {
  var S = window.SELK, T = S.troikaGame, D = T.data, A = S.troikaArt;
  function add(kind, x, extra) {
    var o = { kind: kind, x: x, lift: 0, hit: false, cleared: false };
    for (var k in extra) { o[k] = extra[k]; }
    T.st.obstacles.push(o);
    return o;
  }
  /* A loan tranche, once a year at least (tranches holds the years that
     had one) */
  function addTranche(x, year) {
    var st = T.st;
    st.tranches[year] = true;
    st.platforms.push({ kind: "tranche", x: x, w: Math.round(70 + Math.random() * 60), lift: T.PLATFORM,
      label: S.t(D.TRANCHES[year]), used: false, fall: 0 });
  }
  function weights(year) {
    var st = T.st, f = st.flags;
    var w = {
      rating: 1.3, law: 1 + 0.35 * f.laws, yield: 1 + 0.35 * f.yields, banner: 1, pit: 1, tranche: 1.2,
      /* Queues at the cash machines: after a default, around the elections
         of May 2012, and in 2015 under capital controls */
      queue: (f.runs ? 1 : 0) + (year === 2 ? 0.6 : 0) + (year === 5 ? 1.2 : 0),
      debt: 1, mtfs: year >= 1 && year <= 4 ? 1 : 0, shutter: year === 5 ? 1 : f.runs ? 0.5 : 0, fragile: 1,
      forsale: year >= 1 ? 0.8 : 0, gas: year === 1 || year === 2 ? 1 : 0, coin: year === 2 ? 1 : 0, ballot: year === 5 ? 1 : 0,
      syriza: year >= 4 ? 1.2 : 0, varoufakis: year === 5 ? 1.4 : 0
    };
    var period = D.periodItems();
    for (var k in period) { w[k] = period[k][0].indexOf(year) !== -1 ? 0.9 : 0; }
    /* ERT going off air comes only if Greece chose to close it */
    if (!f.ertOff) { w.tv = 0; }
    st.recent.forEach(function (r, n) { if (w[r]) { w[r] *= n === st.recent.length - 1 ? 0 : 0.35; } });
    return w;
  }
  function pick(w) {
    var sum = 0, k;
    for (k in w) { sum += w[k]; }
    var roll = Math.random() * sum;
    for (k in w) { if (w[k] > 0 && (roll -= w[k]) <= 0) { return k; } }
    return "rating";
  }
  /* The next obstacle, at the right edge of the canvas */
  T.spawn = function () {
    var st = T.st, year = T.yearOf(st.t), x = T.W + 4, k;
    /* A year that has gone half its length with no tranche gets one */
    k = !st.tranches[year] && st.t - year * T.YEAR_SECONDS > T.YEAR_SECONDS / 2 ? "tranche" : pick(weights(year));
    st.recent.push(k);
    if (st.recent.length > 3) { st.recent.shift(); }
    var period = D.periodItems(), SIZES = D.SIZES;
    if (period[k]) {
      add(k, x, { label: period[k][1], desc: period[k][2], w: SIZES[k][0], h: SIZES[k][1], lift: SIZES[k][2], dark: st.flags.ertOff });
    } else if (k === "syriza" || k === "varoufakis") {
      var it = D.setItem(k), o = { set: k, label: S.t(it[1]), desc: it[2] };
      o.w = SIZES[it[0]][0]; o.h = SIZES[it[0]][1]; o.lift = SIZES[it[0]][2];
      add(it[0], x, o);
    } else if (k === "gas") {
      add(k, x, { label: S.t("Tear gas"), desc: S.t("Tear gas at the protests on Syntagma Square"), w: 46, h: 14, lift: 16 });
    } else if (k === "fragile") {
      var list = D.fragiles().filter(function (f2) { return f2[2].indexOf(year) !== -1; });
      var fr = list[Math.floor(Math.random() * list.length)];
      /* Eight pieces over a hole 25 pixels wider on each side, the platform
         drawn from the hole's pixel (art/platforms.js) */
      var fw = A.fragileWidth(fr[3], 8), hole = add("pit", x, { label: S.t(D.DEFICITS[year]), w: fw + 50, h: 0, covered: true });
      st.platforms.push({ kind: "fragile", fragile: true, x: x + 25, w: fw, lift: 40, label: fr[0], desc: fr[1], style: fr[3], standT: 0, broken: false, fall: 0, pit: hole, off: 25 });
    } else if (k === "mtfs") {
      add(k, x, { label: "MTFS", desc: S.t("Medium-term fiscal strategy 2012 to 2015, passed in June 2011"), w: 150, h: 20, lift: 34 });
    } else if (k === "shutter") {
      add(k, x, { label: "ΚΛΕΙΣΤΟ", desc: S.t("Banks closed from 29 June to 20 July 2015"), w: 50, h: 115, lift: 15 });
    } else if (k === "forsale") {
      add(k, x, { label: S.t("For sale"), desc: S.t("HRADF, the privatisation fund: state assets for sale from 2011"), w: 20, h: 28 });
    } else if (k === "coin") {
      add(k, x, { label: S.t("-53.5%"), desc: S.t("PSI: private bondholders lose 53.5%, March 2012"), w: 24, h: 24 });
    } else if (k === "debt") {
      /* The beam's underside is above Greece's head at the top of a single
         jump and below it during a double jump. The rating stands in the
         middle under it: the beam and the rating have widths of the same
         parity, so the space on each side is a whole number of pixels,
         and the rating is drawn from the beam's pixel (art/obstacles.js). */
      var rw = S.pixelFont.width(D.RATINGS[year]) + 8, bw = 76 + Math.abs(76 - rw) % 2;
      var beam = add(k, x, { label: D.DEBTS[year], w: bw, h: 34, lift: 76 }), off = (bw - rw) / 2;
      add("rating", x + off, { label: D.RATINGS[year], w: rw, h: 16, under: beam, off: off });
    } else if (k === "ballot") {
      add(k, x, { label: "ΟΧΙ/ΝΑΙ", desc: S.t("Referendum of 5 July 2015"), w: 22, h: 24 });
    } else if (k === "rating") { add(k, x, { label: D.RATINGS[year], w: S.pixelFont.width(D.RATINGS[year]) + 8, h: 16 }); }
    else if (k === "law") { add(k, x, { label: "N." + D.LAWS[year], w: 20, h: 30 }); }
    else if (k === "yield") { add(k, x, { label: D.YIELDS[year], w: 34, h: 12, lift: 16 }); }
    else if (k === "banner") { add(k, x, { w: 52, h: 42, lift: 16 }); }
    else if (k === "queue") { add(k, x, { label: year === 5 ? S.t("60 euros a day") : S.t("Bank run"), w: 88, h: 28 }); }
    else if (k === "pit") { add(k, x, { label: S.t(D.DEFICITS[year]), w: Math.round(56 + Math.random() * 40), h: 0 }); }
    else { addTranche(x, year); }
    /* The next one comes 230 to 290 pixels, times the spacing and never
       under 170, after the right end of this one */
    var end = x;
    st.obstacles.concat(st.platforms).forEach(function (o) { if (o.x >= x - 1) { end = Math.max(end, o.x + o.w); } });
    st.spawnAt = st.dist + end - x + Math.max(170, (230 + Math.random() * 60) * st.spacing);
  };
})();
