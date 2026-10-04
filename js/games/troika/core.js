/* TROIKA.RUN, a running game opened from history/TROIKA.RUN. Greece runs
   from 2010 to 2015 ahead of the Troika (the European Commission, the
   European Central Bank and the IMF) through a street scene for each year.
   The obstacles carry real figures of their year (data.js), and each asks
   for one control:
   - jump: an S&P rating, a memorandum law, a hole for the budget deficit;
   - duck: a spike of the 10-year bond yield, a general strike banner;
   - double jump: a queue at the cash machines, after a default or in July
     2015;
   - a single jump and no more: the public debt, a beam hanging over Greece
     above a rating, too low for a double jump to pass;
   - no jump at all: the medium-term fiscal strategy of 2011, a slab hanging
     just above Greece's head (2011 to 2014);
   - duck, with no way over: a bank's ground floor, its shutter pulled down
     to just above the pavement and its wall too tall to jump (2015, or after
     a default);
   - jump on and off at once: a fragile platform over a wide hole, which
     shakes from the moment Greece lands on it and gives way 0.45 s later,
     whether Greece is still on it or not;
   - land on: a loan tranche, a solid stack of banknote pallets, which moves
     Greece further ahead the first time Greece lands on it. Running into
     its side stands for missing the conditions of the tranche: the money is
     withheld and the run ends.

   Each year a gate pauses the run with a decision from that year (gates.js).
   Complying lets the Troika move closer and makes the road slower with
   fewer obstacles; resisting moves Greece further ahead of the Troika and
   makes the road faster with more obstacles. A Greece caught by the Troika
   ends the run. A Greece that reaches 2016 goes into a building, where an
   economist argues that the crisis is not over and offers four ways on;
   Athens then runs forward to 2097 and Greece steps out into the world the
   choice made (ending.js, talk.js).

   The game is split into files that share S.troikaGame (T here):
   - core.js: the constants, the run's state and the helpers;
   - data.js: the figures, the gates, the sets of obstacles and the ending's
     text;
   - spawn.js: which obstacle comes next and where;
   - physics.js: jumping, ducking, landing, hits and the clock of the run;
   - gates.js: the yearly decisions, the pause panel and the end card;
   - hud.js: the place in the title bar and the obstacle ahead in the bar;
   - render.js: the frame of the run on the canvas;
   - talk.js: the economist's dialogue, typed with a voice;
   - ending.js: the 2016 ending, from the building's door to 2097;
   - debug.js: End skips to the end of 2015 while debugging is on;
   - window.js: the window, its size, the keys and S.troika.
   The drawings are in art/ (S.troikaArt), the soundtrack is S.snd.troika
   (js/audio/sounds/troika.js) and the economist's voice S.snd.troikaVoice
   (js/audio/sounds/troika-voice.js). Heights are measured up from the
   pavement, so the canvas can change size during a run. */
(function () {
  var S = window.SELK, A = S.troikaArt;
  var T = S.troikaGame = {
    YEAR_SECONDS: 16, SPEED: 190, JUMP: -290, AIR_JUMP: -250, GRAVITY: 900, PLATFORM: 38, CRUMBLE: 0.45,
    /* A duck lasts this long at most; after that Greece stands up, and the
       key or the touch has to be let go before the next duck */
    DUCK_SECONDS: 0.8,
    /* The window's parts, the canvas, its context, the run's state and the
       animation frame */
    ov: null, cv: null, g: null, st: null, raf: 0, coarse: false
  };
  T.END = 6 * T.YEAR_SECONDS;
  /* The canvas's size, read from the drawings, and where Greece runs */
  T.setSize = function () {
    T.W = A.W; T.H = A.H; T.GROUND = A.GROUND; T.RUNNER_X = Math.round(T.W * (T.W < 640 ? 0.3 : 0.375));
  };
  T.setSize();
  /* A new run. gap is the Troika's distance behind Greece, from 0 to 1, and
     Greece is caught at 0.08. spawnAt is the distance at which the next
     obstacle comes. door holds where the building of the ending stands, from
     3.5 s before 2016, and end holds the ending once Greece reaches 2016. */
  T.fresh = function () {
    return {
      t: 0, last: 0, gap: 0.55, speed: 1, spacing: 1, nextGate: 0, gateAt: 0, gates: T.data.gates(), places: T.data.places(),
      flags: { laws: 0, yields: 0, runs: false, crowd: false, ertOff: false },
      hold: false, y: 0, vy: 0, jumps: 0, on: true, duck: false, sit: false, duckT: 0, duckSpent: false, obstacles: [], platforms: [],
      spawnAt: 2.2 * T.SPEED, dist: 0, recent: [], tranches: {},
      banner: "", bannerT: 0, hitFlash: 0, cleared: 0, hits: 0, crash: false, year: -1, ahead: null,
      paused: false, over: false, door: null, end: null
    };
  };
  T.yearOf = function (t) {
    return Math.min(5, Math.floor(t / T.YEAR_SECONDS));
  };
  /* 0 while the Troika is far, 1 when it is about to catch Greece */
  T.danger = function () {
    return Math.max(0, Math.min(1, (0.35 - T.st.gap) / 0.27));
  };
  T.q = function (sel) {
    return T.ov.querySelector(sel);
  };
  /* True while the run moves: not at a gate, not paused, not over */
  T.running = function () {
    var st = T.st;
    return st && !st.paused && !st.over && !st.hold;
  };
  /* True once the run has reached 2016 and the ending has begun */
  T.inEnding = function () {
    return !!(T.st && T.st.end);
  };
})();
