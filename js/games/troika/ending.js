/* TROIKA.RUN (core.js): the ending, once Greece reaches 2016 ahead of the
   Troika. It runs in phases (st.end.phase), on the clock of the run, so
   Escape and a hidden tab pause it as they pause the run:
   - door: the last of the obstacles pass, a building comes along the
     street and Greece goes in at its door; the Troika stops outside;
   - room: an economist's office. The economist argues that the crisis is
     not over and asks what Greece pushes for now (talk.js), with four
     answers from the status quo to a federal eurozone (data.js, ways);
   - zoom: the picture of the office shrinks into a window of its building
     and Athens is seen from above, the obstacles still in the street;
     with motion reduced the office fades into Athens instead;
   - lapse: the obstacles and the Troika fade from the street, and Athens
     runs forward from 2016 to 2097, changing as the answer had it; with
     motion reduced the sky stays still and the years go by a decade at a
     time;
   - out: Greece steps out of the building into the street of 2097 and
     walks on, with no Troika and no obstacles, out of Athens through its
     suburbs onto the Mesogeia plain, slows down under an olive tree and
     sits there; a moment
     later the end card says what became of the world. */
(function () {
  var S = window.SELK, T = S.troikaGame, A = S.troikaArt, D = T.data;
  /* How far before the door the road starts to brake, and how long each
     timed phase lasts */
  var BRAKE = 150, ZOOM = 2.6, FADE = 1.2, LAPSE = 9, ROOM_IN = 0.6, DIM = 0.6;
  /* Greece's top pace in 2097, as a share of the run's speed, and how long
     Greece sits under the olive tree before the end card */
  var WALK = 0.62, REST = 3.2;
  var roomCv = null;
  /* When the last obstacle comes, 3.5 s before 2016, the building is
     placed on the road where the run at its speed reaches it BRAKE pixels
     before the door at the start of 2016: off the canvas to the right, so
     it comes in with the street */
  T.doorPlace = function () {
    var st = T.st;
    st.door = { d0: st.dist, ahead: (T.END - st.t) * T.SPEED * st.speed + BRAKE };
  };
  /* Where the door is on the canvas, unrounded; it is kept as a distance
     ahead of Greece, so a change of canvas size does not move it */
  T.doorAt = function () {
    var st = T.st;
    return T.RUNNER_X + st.door.ahead - (st.dist - st.door.d0);
  };
  T.endBegin = function () {
    var st = T.st;
    st.t = T.END;
    st.duck = false;
    if (!st.door) { T.doorPlace(); }
    var v0 = T.SPEED * st.speed;
    /* The braking: a steady deceleration that stops the road at the door */
    st.end = { phase: "door", t: 0, d0: st.dist, stop: 0, way: -1, level: 0, v0: v0, a: v0 * v0 / (2 * BRAKE), arrived: false };
    /* The music closes as Greece slows down to the door; the keys of the run
       leave the bar, since Greece moves by itself until 2097 */
    if (S.snd.troika) { S.snd.troika.finish(); }
    T.keys("wait");
    T.place(S.t("Stadiou Street, Athens"));
    if (S.announce) { S.announce(S.t("2016. Greece reaches a building ahead of the Troika.")); }
  };
  function phase(name) {
    var e = T.st.end;
    e.phase = name; e.t = 0;
  }
  /* Darkens the whole picture by f, 0 to 1, for the fade between the
     timelapse and the street of 2097 */
  function dim(f) {
    if (f <= 0) { return; }
    var g = A.g;
    g.globalAlpha = Math.min(1, f); g.fillStyle = A.C.dark; g.fillRect(0, 0, T.W, T.H); g.globalAlpha = 1;
  }
  function ease(f) {
    f = Math.max(0, Math.min(1, f));
    return f * f * (3 - 2 * f);
  }
  function startTalk() {
    var e = T.st.end, ways = D.ways();
    T.keys("talk");
    T.talk.say(S.t("ECONOMIST"), D.talk(), ways.map(function (w) { return w[0]; }), function (i) {
      e.way = i; e.level = ways[i][3];
      T.talk.say(S.t("ECONOMIST"), [ways[i][1]], null, function () {
        phase("zoom");
        T.keys("wait");
        if (S.snd.troikaOffice) { S.snd.troikaOffice.finish(); }
        T.place(S.t("Athens, 2016"));
        T.ahead("");
        T.focusPlay();
      });
    });
  }
  T.endUpdate = function (dt) {
    var st = T.st, e = st.end;
    e.t += dt;
    if (e.phase === "door") {
      /* The road slows down to a stop with the door at Greece, then Greece
         walks in. The clock of the street slows with the road, so the
         scenes and the runners slow together. */
      if (!e.arrived) {
        var left = Math.max(0, T.doorAt() - T.RUNNER_X), v = Math.min(e.v0, Math.sqrt(2 * e.a * left)), step = v * dt;
        if (step >= left || left < 0.5) { step = left; e.arrived = true; }
        st.t += dt * v / e.v0;
        T.scroll(dt, step / dt);
        T.move(dt);
        T.collide();
      } else {
        st.duck = false;
        if (st.on) { e.stop += dt; } else { T.move(dt); }
        if (e.stop > ROOM_IN * 2) {
          phase("room");
          /* The office has its own quiet theme */
          if (S.snd.troikaOffice) { S.snd.troikaOffice.start(2.5); }
          T.place(S.t("An economist's office, Athens"));
          T.ahead(S.t("Greece meets an economist."));
        }
      }
      T.tick(dt);
      if (!e.arrived) { T.rows(); }
    } else if (e.phase === "room") {
      if (e.t >= ROOM_IN && !e.talked) { e.talked = true; startTalk(); }
      T.talk.update(dt);
    } else if (e.phase === "zoom") {
      if (e.t >= (S.reduced ? FADE : ZOOM)) {
        phase("lapse");
        T.place(S.t("Athens, 2016 to 2097"));
        /* The coda rises as the years go by, in the mood of the answer */
        if (S.snd.troikaOffice) { S.snd.troikaOffice.stop(); }
        if (S.snd.troikaCoda) { S.snd.troikaCoda.start(2.5, { level: e.level }); }
        if (S.announce) { S.announce(S.t("Athens from 2016 to 2097.")); }
      }
    } else if (e.phase === "lapse") {
      if (e.t >= LAPSE) {
        phase("out");
        st.obstacles = []; st.platforms = []; st.y = 0; st.vy = 0; st.on = true; st.hitFlash = 0;
        e.d0 = st.dist; e.arrived = false; e.rest = 0; e.country = false; e.v = 0; e.still = 0; e.moved = false; e.moveT = 0;
        e.v0 = T.SPEED * WALK; st.keys = {}; st.face = 1; e.near = null;
        /* The people of 2097, each where they belong (art/ending.js), and
           the economist's door, where Greece can go back in */
        e.people = D.people().map(function (p) { p.rel = A.spot(p.kind, p.rel); p.near = false; return p; });
        e.people.push({ rel: 0, kind: "door", name: S.t("ECONOMIST"), hint: S.t("Go in and talk to the economist."), near: false });
        T.keys("walk");
        T.place(S.t("Athens, 2097"));
        T.ahead(T.coarse ? S.t("Hold the right or left side to walk.") : S.t("Walk with the arrow keys, or A and D."));
        if (S.announce) { S.announce(S.t("2097. Greece steps out into the street.")); }
      }
    } else if (e.phase === "out") {
      /* Greece comes out of the door, and the player walks Greece on: the
         pace eases up and down, back as far as the door and on as far as
         the sea. Next to one of the people of 2097, Greece can talk to them
         (T.talkTo); walking stops while they speak. Standing still under
         the olive tree, Greece sits down, the coda closes, and the end
         card comes once Greece has rested */
      var walked = st.dist - e.d0;
      T.talk.update(dt);
      if (!e.arrived) {
        var want = e.t > 0.8 && !T.talk.open() ? T.walkDir() * e.v0 : 0, acc = e.v0 * 3 * dt;
        e.v += Math.max(-acc, Math.min(acc, want - e.v));
        if (walked + e.v * dt > A.SHORE) { e.v = (A.SHORE - walked) / dt; }
        if (walked + e.v * dt < 0) { e.v = -walked / dt; }
        if (Math.abs(e.v) < 0.5 && !want) { e.v = 0; }
        if (e.v) {
          st.face = e.v < 0 ? -1 : 1;
          T.scroll(dt, e.v);
          if (!e.moved) { e.moved = true; T.ahead(D.ways()[e.way][0]); }
        }
        if (e.moved) { e.moveT += dt; }
        e.still = Math.abs(A.STOP - walked) < 30 && !e.v && !want && !T.talk.open() ? e.still + dt : 0;
        near(walked);
        if (e.still > 0.6) {
          e.arrived = true; st.face = 1; st.keys = {};
          T.keys("wait");
          if (S.snd.troikaCoda) { S.snd.troikaCoda.finish(); }
        }
      } else if (st.on) {
        e.rest += dt;
        st.sit = e.rest > 0.4;
        if (e.rest > 0.4 && !e.sat) {
          e.sat = true;
          if (S.announce) { S.announce(S.t("Greece sits down under an olive tree.")); }
        }
      }
      if (!e.inside) { T.place(walked > A.COAST - 80 ? S.t("Mesogeia coast, 2097") : walked > A.EDGE ? S.t("Outside Athens, 2097") : S.t("Athens, 2097")); }
      T.move(dt);
      T.tick(dt);
      if (e.rest >= REST) { T.endCard(D.ways()[e.way][2], true); }
    }
  };
  /* The person of 2097 Greece stands next to, if any; the bar says so */
  function near(walked) {
    var e = T.st.end, who = null;
    e.people.forEach(function (p) { p.near = !T.talk.open() && !e.inside && Math.abs(p.rel - walked) < (p.kind === "door" ? 14 : 26); if (p.near) { who = p; } });
    if (who !== e.near) {
      e.near = who;
      T.keys(who && who.kind === "door" ? "door" : "walk");
      /* While someone speaks the bar is empty; the answer's line shows only
         while Greece walks */
      T.ahead(who ? who.hint : e.moved && !T.talk.open() ? D.ways()[e.way][0] : "");
    }
  }
  /* Greece goes back into the economist's office, now kept by his
     grandson, and asks him questions until saying goodbye */
  function visit() {
    var st = T.st, e = st.end, v = D.visit(), econ = S.t("ECONOMIST");
    var labels = v.questions.map(function (q) { return q[0]; }).concat([v.bye[0]]);
    st.keys = {}; e.v = 0; e.inside = true; e.near = null;
    /* Inside the office only the office's theme plays, as in 2016; the
       street's theme comes back on the way out */
    if (S.snd.troikaCoda) { S.snd.troikaCoda.stop(); }
    if (S.snd.troikaOffice) { S.snd.troikaOffice.stop(); S.snd.troikaOffice.start(1.5); }
    T.keys("talk", labels.length);
    T.ahead("");
    T.place(S.t("An economist's office, Athens"));
    function ask(line) {
      T.talk.say(econ, [line], labels, function (i) {
        if (i < v.questions.length) {
          T.talk.say(econ, [v.questions[i][1][e.level]], null, function () { ask(v.more); });
          return;
        }
        T.talk.say(econ, [v.bye[1]], null, function () {
          e.inside = false; st.face = 1;
          if (S.snd.troikaOffice) { S.snd.troikaOffice.finish(); }
          if (S.snd.troikaCoda) { S.snd.troikaCoda.start(2.5, { level: e.level }); }
          T.keys("walk");
          T.place(S.t("Athens, 2097"));
          T.focusPlay();
        });
      });
    }
    ask(v.hello);
  }
  /* Greece talks to the person next to them: one line, by level. Greece
     steps to stand beside them, facing them, so neither hides the other */
  T.talkTo = function () {
    var st = T.st, e = st && st.end;
    if (!e || !e.near || T.talk.open()) { return false; }
    if (e.near.kind === "door") { visit(); return true; }
    var p = e.near, side = st.dist - e.d0 <= p.rel ? 1 : -1;
    st.keys = {}; e.v = 0;
    st.dist = e.d0 + p.rel - side * 16; st.face = side;
    T.ahead(""); e.near = undefined;
    T.keys("chat");
    T.talk.say(p.name, [p.lines[e.level]], null, function () { T.keys("walk"); T.focusPlay(); e.near = null; }, p.pitch);
    return true;
  };
  /* The walk in 2097: the keys held (st.keys: left, right, and touch, -1
     or 1 for the side held), while Greece can still walk and no one is
     speaking */
  T.walking = function () {
    var e = T.st && T.st.end;
    return !!(e && e.phase === "out" && !e.arrived && !T.talk.open());
  };
  T.walkKey = function (k, down) {
    var keys = T.st.keys = T.st.keys || {};
    keys[k === "ArrowLeft" || k === "a" || k === "A" ? "left" : "right"] = down;
  };
  T.walkDir = function () {
    var keys = T.st.keys || {};
    return Math.max(-1, Math.min(1, (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + (keys.touch || 0)));
  };
  /* The year shown over Athens during the timelapse, counting every year
     from 2016 to 2097 */
  function lapseYear() {
    var f = ease(T.st.end.t / LAPSE), y = 2016 + 81 * f;
    return Math.min(2097, Math.round(y));
  }
  /* The office, drawn to its own canvas for the zoom */
  function office() {
    if (!roomCv || roomCv.width !== T.W || roomCv.height !== T.H) {
      roomCv = document.createElement("canvas"); roomCv.width = T.W; roomCv.height = T.H;
    }
    var keep = A.g;
    A.g = roomCv.getContext("2d"); A.g.imageSmoothingEnabled = false;
    A.office(T.st.end.t, false, false);
    A.g = keep;
    return roomCv;
  }
  T.endDraw = function () {
    var st = T.st, e = st.end, C = A.C, g = A.g;
    if (e.phase === "door") {
      var phase4 = Math.floor(st.dist / 14) % 4, moving = !e.arrived, dx = Math.round(T.doorAt());
      T.drawBack(function () { A.entrance(dx); });
      T.drawThings();
      T.drawYears();
      T.drawTroika(moving ? phase4 : null);
      /* Greece walks through the door and fades into it */
      var walk = moving ? 0 : Math.min(1, e.stop / ROOM_IN);
      g.globalAlpha = 1 - walk;
      T.drawGreece(moving ? phase4 : Math.floor(e.stop * 8) % 4, 0, T.RUNNER_X + Math.round(walk * 6));
      g.globalAlpha = 1;
      /* Then the picture fades to black */
      var dark = moving ? 0 : Math.max(0, e.stop - ROOM_IN) / ROOM_IN;
      if (dark > 0) { g.globalAlpha = Math.min(1, dark); g.fillStyle = C.dark; g.fillRect(0, 0, T.W, T.H); g.globalAlpha = 1; }
    } else if (e.phase === "room") {
      A.office(e.t, T.talk.typing(), 0);
      if (e.t < ROOM_IN) { g.globalAlpha = 1 - e.t / ROOM_IN; g.fillStyle = C.dark; g.fillRect(0, 0, T.W, T.H); g.globalAlpha = 1; }
    } else if (e.phase === "zoom") {
      var room = office(), win = A.athens({ year: 2016, level: e.level, junk: 1, light: 1, lit: 0 });
      if (S.reduced) {
        g.globalAlpha = 1 - ease(e.t / FADE);
        g.drawImage(room, 0, 0);
        g.globalAlpha = 1;
      } else {
        /* The office shrinks into its window, then dissolves into the
           window's light */
        var f = ease(e.t / ZOOM);
        g.globalAlpha = 1 - ease((e.t / ZOOM - 0.75) / 0.25);
        g.drawImage(room, win[0] * f, win[1] * f, T.W + (win[2] - T.W) * f, T.H + (win[3] - T.H) * f);
        g.globalAlpha = 1;
      }
    } else if (e.phase === "lapse") {
      var year = lapseYear(), p = (year - 2016) / 81;
      /* Day and night pass over the city, slowly enough not to flash; with
         motion reduced the light stays */
      var light = S.reduced ? 1 : 0.68 + 0.32 * Math.cos(e.t * Math.PI * 2 / 2.2);
      A.athens({ year: year, p: p, level: e.level, junk: Math.max(0, 1 - e.t / 1.2), light: light, lit: 1 });
      A.big(String(year), T.W / 2, 22, C.haze, "center", 3);
      dim(Math.max(0, (e.t - (LAPSE - DIM)) / DIM));
    } else {
      /* Inside the economist's office while Greece talks to him */
      if (e.inside) { A.office(e.t, T.talk.typing(), true, e.level); return; }
      /* The steps of the run, as in the rest of the game */
      var ph = e.v ? ((Math.floor(st.dist / 14) % 4) + 4) % 4 : 1, out = Math.min(1, e.t / 0.8);
      A.future(st.dist - e.d0, e.level, T.RUNNER_X - Math.round(st.dist - e.d0), e.people, e.t);
      g.globalAlpha = out;
      T.drawGreece(ph, e.moved ? Math.max(0, 1 - e.moveT) : T.fade(e.t - 0.8, 99), null, st.face);
      g.globalAlpha = 1;
      dim(1 - e.t / DIM);
    }
  };
})();
