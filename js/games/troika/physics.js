/* TROIKA.RUN (core.js): jumping, ducking, landing, hits, and the clock of
   the run from 2010 to the start of 2016, when ending.js takes over. */
(function () {
  var S = window.SELK, T = S.troikaGame;
  /* Jumping and ducking work during the run only; in the ending Greece
     moves by itself */
  T.jump = function () {
    var st = T.st;
    if (!T.running() || st.jumps >= 2 || st.end) { return; }
    st.vy = st.jumps ? T.AIR_JUMP : T.JUMP;
    st.jumps++;
    st.on = false; st.duck = false;
    if (S.snd && S.snd.tick) { S.snd.tick(); }
  };
  T.duck = function (on) {
    var st = T.st;
    if (!T.running() || st.end) { return; }
    if (!on) { st.duckSpent = false; st.duck = false; return; }
    if (!st.duck && !st.duckSpent && st.on) { st.duck = true; st.duckT = 0; }
  };
  function within(o) {
    return o.x < T.RUNNER_X + 4 && o.x + o.w > T.RUNNER_X - 4;
  }
  function hit(o) {
    var st = T.st;
    o.hit = true; st.hits++; st.gap -= 0.12; st.hitFlash = 0.4;
    if (S.snd && S.snd.error) { S.snd.error(); }
  }
  /* Moves Greece up or down: lands on a platform from above, falls into an
     open hole, and stands on the pavement everywhere else. Greece below the
     top of a tranche it overlaps has run into its side. */
  T.move = function (dt) {
    var st = T.st, ny = st.y + (st.vy + T.GRAVITY * dt / 2) * dt;
    st.vy += T.GRAVITY * dt;
    var land = null, pit = null;
    st.platforms.forEach(function (p) {
      if (!p.broken && st.vy >= 0 && st.y <= -p.lift && ny >= -p.lift && within(p)) { land = p; }
    });
    st.obstacles.forEach(function (o) {
      if (o.kind === "pit" && !o.hit && o.x < T.RUNNER_X - 3 && o.x + o.w > T.RUNNER_X + 3) { pit = o; }
    });
    if (land) {
      st.y = -land.lift; st.vy = 0; st.jumps = 0; st.on = true;
      if (land.fragile) { land.touched = true; }
      if (!land.used && !land.fragile) {
        land.used = true; st.gap += 0.04;
        if (S.snd && S.snd.ok) { S.snd.ok(); }
      }
    } else if (ny >= 0 && !pit) {
      st.y = 0; st.vy = 0; st.jumps = 0; st.on = true;
    } else {
      st.y = ny; st.on = false; st.duck = false;
      /* Down in a hole: it counts as a hit, and Greece climbs out */
      if (pit && st.y > 14) { hit(pit); st.y = 0; st.vy = T.JUMP * 0.7; st.jumps = 1; }
    }
    st.platforms.forEach(function (p) {
      if (!p.fragile && within(p) && st.y > -p.lift + 2) { st.crash = true; }
    });
  };
  /* Moves the road and everything on it by v pixels a second, and drops
     what has left the canvas */
  T.scroll = function (dt, v) {
    var st = T.st;
    st.dist += v * dt;
    st.obstacles.forEach(function (o) { o.x -= v * dt; });
    /* A fragile platform gives way CRUMBLE seconds after Greece first lands
       on it, and its pieces fall */
    st.platforms.forEach(function (p) {
      p.x -= v * dt;
      if (p.touched && !p.broken && (p.standT += dt) >= T.CRUMBLE) { p.broken = true; }
      if (p.broken) { p.fall += dt; }
    });
    st.obstacles = st.obstacles.filter(function (o) { return o.x > -o.w - 10; });
    st.platforms = st.platforms.filter(function (p) { return p.x > -p.w - 10 && p.fall < 1; });
  };
  /* Hits on the obstacles Greece overlaps, and the ones passed */
  T.collide = function () {
    var st = T.st, hb = T.GROUND + st.y, ht = hb - (st.duck ? 14 : 26);
    st.obstacles.forEach(function (o) {
      var bottom = T.GROUND - o.lift;
      if (o.kind !== "pit" && !o.hit && within(o) && ht < bottom && hb > bottom - o.h) { hit(o); }
      if (!o.cleared && !o.hit && o.x + o.w < T.RUNNER_X - 4) { o.cleared = true; st.cleared++; st.gap += 0.025; }
    });
  };
  /* What every step does to the timers of the run */
  T.tick = function (dt) {
    var st = T.st;
    st.gap = Math.min(1, st.gap);
    st.hitFlash = Math.max(0, st.hitFlash - dt);
    if (st.duck && (st.duckT += dt) >= T.DUCK_SECONDS) { st.duck = false; st.duckSpent = true; }
    st.bannerT = Math.max(0, st.bannerT - dt);
  };
  /* One step of the run. The last obstacle comes 3.5 s before 2016, so the
     road is clear when the year ends, and the building of the ending is
     placed then (ending.js). */
  T.update = function (dt) {
    var st = T.st;
    if (st.end) { T.endUpdate(dt); return; }
    st.t += dt;
    if (st.nextGate < st.gates.length && st.t >= st.nextGate * T.YEAR_SECONDS + 1.5) { T.showGate(); return; }
    if (st.t >= T.END) { T.endBegin(); return; }
    var v = T.SPEED * st.speed;
    /* The Troika moves closer by 0.01 a second */
    st.gap -= 0.01 * dt;
    T.scroll(dt, v);
    T.move(dt);
    if (st.crash) { st.hitFlash = 0.4; T.finish(); return; }
    if (st.t >= T.END - 3.5 && !st.door) { T.doorPlace(); }
    if (st.dist >= st.spawnAt && !st.door) { T.spawn(); }
    T.collide();
    T.tick(dt);
    if (S.snd.troika) { S.snd.troika.set(T.yearOf(st.t), T.danger()); }
    if (!st.leftNoted && st.t >= T.END - 8) {
      st.leftNoted = true; st.banner = S.t("About 427,000 people left Greece from 2008 to 2015."); st.bannerT = st.bannerLen = 6;
    }
    T.rows();
    if (st.gap <= 0.08) { T.finish(); }
  };
})();
