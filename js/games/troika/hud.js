/* TROIKA.RUN (core.js): the place in the title bar and the obstacle ahead
   in the bar under the canvas, changed only when they change. */
(function () {
  var S = window.SELK, T = S.troikaGame;
  /* What the nearest thing ahead is */
  function describe(o, year) {
    if (o.desc) { return o.desc; }
    switch (o.kind) {
      case "rating": return S.t("S&P rating: {v}", { v: o.label });
      case "law": return S.t("Law {n}/{year}", { n: o.label.slice(2), year: 2010 + year });
      case "yield": return S.t("10-year bond yield: {v}", { v: o.label });
      case "banner": return S.t("General strike");
      case "debt": return S.t("Public debt: {v} of GDP", { v: o.label });
      case "pit": return S.t("Budget deficit: {v} of GDP", { v: o.label.slice(1) });
      case "queue": return year === 5 ? S.t("Capital controls: 60 euros a day at the cash machines") :
        S.t("Bank run: queues at the cash machines");
      default: return S.t("Loan tranche: {v}", { v: o.label });
    }
  }
  /* The place in the title bar, faded in when it changes */
  T.place = function (text) {
    var pl = T.q(".troika-place");
    if (pl.textContent === text) { return; }
    pl.textContent = text;
    pl.classList.remove("new"); void pl.offsetWidth; pl.classList.add("new");
  };
  T.rows = function () {
    var st = T.st, year = T.yearOf(st.t);
    if (year !== st.year) {
      st.year = year;
      T.place(st.places[year]);
    }
    var next = null;
    st.obstacles.concat(st.platforms).forEach(function (o) {
      if (!o.covered && o.x + o.w > T.RUNNER_X - 4 && o.x < T.W && (!next || o.x < next.x)) { next = o; }
    });
    if (next !== st.ahead) {
      st.ahead = next;
      T.ahead(next ? describe(next, year) : "");
    }
  };
  /* The text of the bar. Text wider than the bar scrolls to its end and
     back, so the bar never changes the window's width; with motion reduced
     it ends in an ellipsis instead (css/ui/troika/bar.css). */
  T.ahead = function (text) {
    var box = T.q(".troika-ahead"), line = box.firstChild;
    if (line.textContent === text) { return; }
    line.textContent = text;
    line.classList.remove("scroll");
    var over = line.scrollWidth - box.clientWidth;
    if (over > 0) {
      line.style.setProperty("--shift", -over + "px");
      line.style.setProperty("--time", (2 + over / 40).toFixed(1) + "s");
      line.classList.add("scroll");
    }
  };
})();
