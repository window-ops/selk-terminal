/* TROIKA.RUN art (js/games/troika/art/): Greece, the officials of the
   Troika and the people of 2097. */
(function () {
  var S = window.SELK, A = S.troikaArt, C = A.C;
  var r = A.r;
  /* Greece, in the colors of the flag. pose is "run", "air", "duck" or
     "sit"; phase is the step of the run, 0 to 3. */
  function runner(x, b, pose, phase, flash) {
    var shirt = flash ? C.red : C.blue;
    /* Sitting on the grass: the shorts on the ground, the legs straight
       out in front from them in one piece, toes up, one hand propped
       behind and the other on the knee */
    if (pose === "sit") {
      r(x - 3, b - 20, 6, 6, C.skin); r(x - 3, b - 20, 6, 2, C.hair);
      r(x - 4, b - 14, 8, 10, shirt); r(x - 4, b - 11, 8, 1, C.white); r(x - 4, b - 8, 8, 1, C.white);
      r(x - 4, b - 4, 8, 4, C.white);
      r(x + 4, b - 3, 7, 3, C.skin);
      r(x + 11, b - 4, 2, 4, C.dark);
      r(x - 6, b - 13, 2, 13, C.skin);
      r(x + 4, b - 13, 2, 6, C.skin); r(x + 5, b - 7, 2, 2, C.skin);
      return;
    }
    /* Ducking: kneeling low under the obstacle, head forward, back bent,
       the back knee on the ground and the front foot planted, an arm on the
       front knee; 14 pixels tall, like the hit box */
    if (pose === "duck") {
      r(x + 1, b - 14, 6, 6, C.skin); r(x + 1, b - 14, 6, 2, C.hair);
      r(x - 6, b - 11, 8, 6, shirt); r(x - 6, b - 9, 8, 1, C.white);
      r(x - 7, b - 6, 6, 3, C.white);
      r(x - 1, b - 5, 5, 2, C.skin); r(x + 2, b - 3, 2, 2, C.skin); r(x + 2, b - 1, 3, 1, C.dark);
      r(x - 6, b - 3, 2, 2, C.skin); r(x - 9, b - 2, 4, 1, C.skin); r(x - 11, b - 2, 2, 2, C.dark);
      r(x + 2, b - 8, 3, 2, C.skin);
      return;
    }
    r(x - 3, b - 26, 6, 6, C.skin); r(x - 3, b - 26, 6, 2, C.hair);
    r(x - 4, b - 20, 8, 10, shirt);
    r(x - 4, b - 17, 8, 1, C.white); r(x - 4, b - 13, 8, 1, C.white);
    r(x - 4, b - 10, 8, 3, C.white);
    /* In the air: arms out, the front knee lifted with its foot under it,
       the back leg trailing, both legs right under the shorts, with shoes */
    if (pose === "air") {
      r(x - 7, b - 22, 3, 2, C.skin); r(x + 4, b - 22, 3, 2, C.skin);
      r(x + 1, b - 7, 4, 2, C.skin); r(x + 3, b - 5, 2, 3, C.skin); r(x + 3, b - 2, 3, 1, C.dark);
      r(x - 4, b - 7, 2, 4, C.skin); r(x - 5, b - 3, 2, 1, C.skin); r(x - 6, b - 2, 3, 1, C.dark);
      return;
    }
    var a = [-4, -2, 0, -2][phase], c = [2, 0, -2, 0][phase];
    r(x - 6 - a / 2, b - 19, 2, 6, C.skin); r(x + 4 + a / 2, b - 19, 2, 6, C.skin);
    r(x + a, b - 7, 2, 7, C.skin); r(x + c, b - 7, 2, 7, C.skin);
    /* The shoes point forward, to the right */
    r(x + a, b - 1, 3, 1, C.dark); r(x + c, b - 1, 3, 1, C.dark);
  }
  /* An official of the Troika, in a suit with a briefcase */
  function official(x, b, tie, phase) {
    r(x - 3, b - 27, 6, 6, C.skin); r(x - 3, b - 27, 6, 2, C.grey);
    r(x - 4, b - 21, 8, 11, C.suit);
    r(x - 1, b - 21, 2, 4, C.white); r(x, b - 20, 1, 5, tie);
    var a = [-3, -1, 1, -1][phase], c = [1, -1, -3, -1][phase];
    r(x + 4, b - 20 + (phase % 2), 2, 7, C.suitLit);
    r(x + 4, b - 13 + (phase % 2), 6, 5, C.bark);
    r(x + a, b - 10, 3, 10, C.suitLit); r(x + c, b - 10, 3, 10, C.suit);
    r(x + a, b - 1, 4, 1, C.dark); r(x + c, b - 1, 4, 1, C.dark);
  }
  /* A person of 2097 standing on the pavement, feet at (x, b), turned to
     the street (art/ending.js, js/games/troika/data.js people): the
     shopkeeper in an apron, the teacher with glasses and books, the old
     engineer in a cap with a cane, the shepherd in a hat with a crook, and
     the fisher in a yellow oilskin. With near, a speech mark over the head
     says that Greece can talk to them. */
  function person(x, b, kind, near) {
    var look = {
      shopkeeper: [C.hair, C.redLit, C.white], teacher: [C.hair, C.blue, C.blue],
      engineer: [C.grey, C.haze, C.haze], shepherd: [C.hair, C.bark, C.awning], fisher: [C.grey, C.gold, C.gold]
    }[kind];
    r(x - 3, b - 9, 2, 9, C.suit); r(x + 1, b - 9, 2, 9, C.suit);
    r(x - 3, b - 1, 3, 1, C.dark); r(x + 1, b - 1, 3, 1, C.dark);
    r(x - 4, b - 20, 8, 11, look[1]);
    r(x - 3, b - 26, 6, 6, C.skin); r(x - 3, b - 26, 6, 2, look[0]);
    r(x - 6, b - 19, 2, 7, look[1]); r(x + 4, b - 19, 2, 7, look[1]);
    r(x - 6, b - 12, 2, 2, C.skin); r(x + 4, b - 12, 2, 2, C.skin);
    if (kind === "shopkeeper") { r(x - 3, b - 17, 6, 9, look[2]); r(x - 2, b - 28, 4, 2, C.hair); }
    else if (kind === "teacher") { r(x - 2, b - 23, 4, 1, C.dark); r(x + 3, b - 15, 5, 4, C.book); r(x + 3, b - 16, 5, 1, C.white); }
    else if (kind === "engineer") { r(x - 4, b - 27, 8, 2, C.suitLit); r(x + 6, b - 13, 1, 13, C.bark); }
    else if (kind === "shepherd") { r(x - 5, b - 27, 10, 2, C.awning); r(x - 3, b - 29, 6, 2, C.awning); r(x + 7, b - 30, 1, 30, C.bark); r(x + 5, b - 31, 3, 1, C.bark); }
    else { r(x - 4, b - 28, 8, 2, C.suit); r(x - 4, b - 20, 8, 1, C.dark); }
    if (near) { bubble(x, b - 42); }
  }
  /* The speech bubble that says Greece can talk to someone, the same over
     everyone: a white box with a dark edge, three dots and a tail, centered
     on a figure whose middle is between x - 1 and x, its top at y */
  function bubble(x, y) {
    r(x - 6, y, 12, 10, C.dark);
    r(x - 5, y + 1, 10, 8, C.white);
    r(x - 2, y + 10, 4, 1, C.dark); r(x - 1, y + 9, 2, 2, C.white); r(x - 1, y + 11, 2, 1, C.dark);
    r(x - 4, y + 4, 2, 2, C.dark); r(x - 1, y + 4, 2, 2, C.dark); r(x + 2, y + 4, 2, 2, C.dark);
  }
  A.runner = runner; A.official = official; A.person = person; A.bubble = bubble;
})();
