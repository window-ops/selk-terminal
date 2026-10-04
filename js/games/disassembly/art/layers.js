/* DISASSEMBLY.RUN art (js/games/disassembly/art/): where each layer of each
   phone lies, and how each draws itself. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, C = A.C;
  var K = A.K, W = A.W, H = A.H, PX = A.PX, PY = A.PY, PW = A.PW, PH = A.PH, TRAY = A.TRAY, DRAWER = A.DRAWER, RADIUS = A.RADIUS;
  var r = A.r, f = A.f, round = A.round, disc = A.disc, ring = A.ring, poly = A.poly, hull = A.hull;
  var speakerMark = A.speakerMark, portMark = A.portMark, BUMP = A.BUMP, bump = A.bump, screw = A.screw, lens = A.lens;
  /* Where each layer lies in the phone, in units: x, y, width, height */
  var RECTS = {
    fairphone: { cover: [2, 2, 80, 168], battery: [6, 64, 72, 88], top: [6, 6, 72, 58], camera: [10, 8, 18, 34],
      usb: [7, 152, 6, 12], speaker: [6, 152, 72, 16], screen: [4, 4, 76, 164], power: [-3, 42, 4, 16] },
    samsung: { cover: [2, 2, 80, 168], coil: [8, 72, 68, 72], flex: [22, 64, 50, 87], plate: [32, 6, 46, 62], speaker: [8, 146, 68, 20],
      battery: [10, 74, 64, 68], camera: [8, 8, 22, 48], usb: [10, 148, 64, 18], screen: [4, 4, 76, 164], power: [-3, 46, 4, 16] }
  };
  /* The layers of each phone. Each draws itself with (x, y) the phone's
     top left corner; done lists the tools already used on it. */
  var LAYERS = {
    fairphone: {
      /* The cover of the edition: the transparent edition's smoky
         translucent grey, plain, with the parts and their prints showing
         through; the opaque Sky Blue; or Matte Black with the wordmark. It
         has a triangular hole at the top left for the camera bump, which
         belongs to the top module. */
      cover: function (x, y) {
        if (A.edition === "blue" || A.edition === "black") {
          var body = A.edition === "blue" ? C.blue : C.matte;
          round(x + 1, y + 1, 82, 170, 8.5, body);
          if (A.edition === "black") { S.pixelFont.draw(A.g, "FAIRPHONE", Math.round((x + 42) * K), Math.round((y + 132) * K), C.dust, "center"); }
        } else {
          A.g.globalAlpha = 0.72;
          round(x + 1, y + 1, 82, 170, 8.5, C.smoke);
          A.g.globalAlpha = 1;
          /* The wordmark: a clear glossy print on the cover, which darkens
             what is behind it, with a faint sheen on its upper edge */
          var wx = Math.round((x + 41) * K), wy = Math.round((y + 144) * K);
          A.g.globalAlpha = 0.2;
          [0, 1].forEach(function (b) { S.pixelFont.draw(A.g, "FAIRPHONE", wx + b, wy - 1, C.white, "center"); });
          A.g.globalAlpha = 0.5;
          [0, 1].forEach(function (b) { S.pixelFont.draw(A.g, "FAIRPHONE", wx + b, wy, "#0E1620", "center"); });
          A.g.globalAlpha = 1;
        }
        hull(BUMP.map(function (p) { return [x + p[0], y + p[1]]; }), 9.5, C.dark);
      },
      /* The battery: as wide as the bay and as tall as the space between the
         top and the bottom module. Its prints: the blue slanted band at the
         top, the lighter box with the lettering, the small blue charge mark
         at the left, and the blue silo at the bottom, flat on the left with
         a large rounded corner at the top right */
      battery: function (x, y) {
        round(x + 6, y + 64, 72, 88, 2, C.lens);
        f(x + 6, y + 64, 144, 1, C.frame); f(x + 6, y + 64, 1, 176, C.frame); f(x + 77.5, y + 64, 1, 176, C.frame);
        r(x + 25.3, y + 64.2, 47.6, 54.2, C.cell);
        poly([[x + 29, y + 65.4], [x + 77.5, y + 65.4], [x + 77.5, y + 79], [x + 19.8, y + 88.5]], C.blue);
        ["CHANGE", "IS IN YOUR", "HANDS"].forEach(function (l, n) { S.pixelFont.draw(A.g, l, Math.round((x + 46.3) * K), Math.round((y + 95 + n * 6.8) * K), C.dust, "center"); });
        r(x + 9, y + 68, 4, 6, C.blue); f(x + 10.5, y + 69, 2, 4, C.dark); f(x + 11, y + 71, 2, 1, C.dark);
        r(x + 6.8, y + 129, 36.8, 21.3, C.blue); round(x + 31, y + 129, 24.6, 21.3, 12, C.blue); r(x + 43, y + 141, 12.6, 9.3, C.blue);
      },
      /* The top module: black, with the camera bump, the blue triangle and
         its row of dots, the white antenna patterns at the top right and on
         the right edge, the small camera and speaker marks, and its screws */
      top: function (x, y) {
        round(x + 6, y + 6, 72, 58, 6, C.lens); r(x + 6, y + 40, 72, 24, C.lens); f(x + 12, y + 6, 120, 1, C.frame);
        poly([[x + 46.3, y + 28], [x + 65, y + 44], [x + 65, y + 61], [x + 30.3, y + 61]], C.blue);
        for (var dt = 0; dt < 4; dt++) { disc(x + 45.7, y + 47 + dt * 2.6, 0.7, C.lens); }
        r(x + 44, y + 60, 4, 1.5, C.lens);
        r(x + 66, y + 13, 13, 2, C.white); r(x + 74.5, y + 13, 2.5, 18, C.white); r(x + 66, y + 13, 2, 7, C.white);
        r(x + 69, y + 17, 4, 1, C.white); r(x + 69, y + 17, 1, 5, C.white); r(x + 72, y + 17, 1, 5, C.white);
        r(x + 69, y + 44, 2, 16, C.white); r(x + 69, y + 52, 6, 2, C.white); r(x + 73, y + 52, 2, 8, C.white); r(x + 69, y + 58, 10, 2, C.white);
        round(x + 55.5, y + 23.5, 4, 3, 0.8, C.blue); round(x + 55.5, y + 30, 4, 3, 0.8, C.blue);
        bump(x, y);
        screw(x + 10, y + 60); screw(x + 73, y + 41); screw(x + 74, y + 9);
      },
      /* The main and the second camera, each a part of its own */
      camera: function (x, y) {
        round(x + 12, y + 9, 14, 14, 3, C.frame); round(x + 11, y + 26, 14, 14, 3, C.frame);
        lens(x + 19, y + 16); lens(x + 18, y + 33);
      },
      /* The USB-C port under its small grey metal bracket at the far left */
      usb: function (x, y) {
        round(x + 7, y + 152.5, 5.5, 10.5, 1, C.edge); f(x + 7.5, y + 152.5, 9, 1, C.white);
        screw(x + 9.7, y + 154.6); screw(x + 9.7, y + 160.4);
      },
      /* The bottom module, across the whole width: its blue print, flat on
         the left, with a notch and a round hole at the top and the bottom
         right corner rounded, the speaker and port marks, and the small
         parts at the right */
      speaker: function (x, y) {
        round(x + 6, y + 151.5, 72, 16.5, 6, C.lens); r(x + 6, y + 151.5, 72, 8, C.lens); f(x + 6, y + 151.5, 144, 1, C.frame);
        r(x + 58, y + 162, 3, 3, C.edge); r(x + 65, y + 160, 8, 6, C.edge); r(x + 67, y + 162, 2, 2, C.dark);
        r(x + 13, y + 154.5, 30, 13, C.blue); round(x + 40, y + 154.5, 15, 13, 7, C.blue); r(x + 40, y + 154.5, 15, 6, C.blue);
        r(x + 25.9, y + 154.5, 8.7, 3.1, C.lens);
        disc(x + 46.9, y + 156, 2.5, C.lens);
        speakerMark(x + 26, y + 162.6); portMark(x + 33.3, y + 162.6);
      },
      /* The display from the back: its copper heat spreader with the flex
         cable across it, and the screw points round the edge */
      screen: function (x, y) {
        round(x + 4, y + 4, 76, 164, 6, C.lens);
        round(x + 8, y + 20, 68, 140, 2, C.copper); f(x + 8, y + 20, 136, 1, C.gold);
        r(x + 30, y + 60, 6, 70, C.lens); r(x + 30, y + 60, 26, 6, C.lens); r(x + 50, y + 66, 6, 24, C.lens);
        for (var s = 0; s < 10; s++) { screw(x + 8 + (s % 2) * 68, y + 12 + Math.floor(s / 2) * 36); }
      }
    },
    samsung: {
      /* The back glass in Onyx Black: three cameras down the top left, each
         in its own raised black ring with a bright edge, the flash beside
         the top one, and the wordmark low on the back */
      cover: function (x, y, done) {
        round(x + 1, y + 1, 82, 170, 5, C.onyx);
        for (var s = 0; s < 3; s++) { f(x + 6 + s * 4, y + 30 + s * 10, 1, 200 - s * 60, C.onyxLit); }
        [16, 32, 48].forEach(function (cy) {
          disc(x + 18, y + cy, 6.5, C.lens); ring(x + 18, y + cy, 6.5, C.edge); ring(x + 18, y + cy, 5.5, C.dust); disc(x + 18, y + cy, 4.5, C.lens);
          ring(x + 18, y + cy, 2.5, C.glass); f(x + 16, y + cy - 2, 2, 2, C.glassLit);
        });
        disc(x + 30, y + 16, 1.5, C.dark); f(x + 29, y + 15, 2, 1, C.edge);
        S.pixelFont.draw(A.g, "SAMSUNG", Math.round((x + 42) * K), Math.round((y + 140) * K), C.frame, "center");
        if (done.indexOf("heat") !== -1) {
          A.g.globalAlpha = 0.6;
          f(x + 2, y + 1, 156, 2, C.glow); f(x + 2, y + 170, 156, 2, C.glow); f(x + 1, y + 4, 2, 330, C.glow); f(x + 82, y + 4, 2, 330, C.glow);
          A.g.globalAlpha = 1;
        }
        if (done.indexOf("pry") !== -1) { r(x + 80, y + 90, 8, 2, C.blue); r(x + 80, y + 120, 8, 2, C.blue); }
      },
      coil: function (x, y) {
        round(x + 8, y + 72, 68, 72, 2, C.dark);
        for (var cr = 16; cr >= 8; cr -= 1.5) { ring(x + 42, y + 106, cr, C.copper); }
        f(x + 10, y + 74, 132, 1, C.copper); f(x + 10, y + 142, 132, 1, C.copper);
        screw(x + 12, y + 76); screw(x + 72, y + 76); screw(x + 12, y + 140); screw(x + 72, y + 140);
      },
      /* The cover over the main board: a light silver plate with orange
         insulating pads */
      plate: function (x, y) {
        round(x + 32, y + 6, 46, 62, 3, C.plate); f(x + 35, y + 6, 80, 1, C.white);
        f(x + 32, y + 10, 1, 110, C.white);
        [[44, 14], [56, 14], [44, 25], [56, 25]].forEach(function (pd) { round(x + pd[0], y + pd[1], 10, 9, 1, C.amber); f(x + pd[0], y + pd[1], 20, 1, C.haze); });
        f(x + 36, y + 48, 70, 1, C.edge); f(x + 36, y + 54, 50, 1, C.edge);
        /* The screws at the plate's corners and on its left edge, by the
           frame, clear of the flex cables' connectors */
        [[35, 9], [75, 9], [33.5, 36], [35, 65], [75, 65]].forEach(function (sc) { screw(x + sc[0], y + sc[1]); });
      },
      speaker: function (x, y) {
        round(x + 8, y + 146, 68, 20, 2, C.frame); f(x + 9, y + 146, 134, 1, C.edge);
        r(x + 12, y + 150, 30, 12, C.dark);
        for (var h = 0; h < 6; h++) { f(x + 14 + h * 4.5, y + 153, 3, 3, C.edge); f(x + 14 + h * 4.5, y + 157, 3, 3, C.edge); }
        r(x + 56, y + 150, 10, 10, C.white); r(x + 57, y + 151, 3, 3, C.dark); r(x + 62, y + 151, 3, 3, C.dark); r(x + 57, y + 156, 3, 3, C.dark); r(x + 61, y + 155, 2, 2, C.dark);
        /* The screws at the module's four corners */
        [[11.5, 149.5], [72.5, 149.5], [11.5, 163], [72.5, 163]].forEach(function (sc) { screw(x + sc[0], y + sc[1]); });
      },
      battery: function (x, y) {
        round(x + 10, y + 74, 64, 68, 2, C.cell); f(x + 11, y + 74, 126, 1, C.cellLit);
        /* Its white label, with the printed lines, a code and the marks */
        round(x + 13, y + 78, 58, 58, 1.5, C.white);
        for (var l = 0; l < 7; l++) { f(x + 16, y + 82 + l * 4, 60 - (l % 3) * 14, 2, C.dust); }
        r(x + 56, y + 84, 10, 10, C.dark); r(x + 58, y + 86, 3, 3, C.white); r(x + 62, y + 89, 2, 2, C.white);
        disc(x + 22, y + 124, 3, C.dust); disc(x + 22, y + 124, 2, C.white);
        f(x + 30, y + 122, 12, 6, C.dust); f(x + 46, y + 122, 10, 6, C.dust);
        r(x + 20, y + 140, 6, 7, C.white); r(x + 58, y + 140, 6, 7, C.white);
        f(x + 21, y + 144, 10, 1, C.dust); f(x + 59, y + 144, 10, 1, C.dust);
      },
      /* The two wide flex cables over the battery, from their sockets on the
         sub-board at the bottom (marked SUB) to their sockets on the main
         board's lower edge (marked MAIN), each with an S-shaped jog to the
         right on the way, gold connectors at both ends and printed arrows */
      flex: function (x, y) {
        [22, 40].forEach(function (a) {
          var w = 14, j = 18;
          poly([[x + a, y + 151], [x + a + w, y + 151], [x + a + w, y + 116], [x + a + w + j, y + 102], [x + a + w + j, y + 64],
            [x + a + j, y + 64], [x + a + j, y + 102], [x + a, y + 116]], C.lens);
          r(x + a + 1, y + 147, w - 2, 4, C.gold); r(x + a + j + 1, y + 64, w - 2, 4, C.gold);
          S.pixelFont.draw(A.g, a === 22 ? "SUB" : "UB", Math.round((x + a + w / 2) * K), Math.round((y + 139) * K), C.white, "center");
          S.pixelFont.draw(A.g, "MAIN", Math.round((x + a + j + w / 2) * K), Math.round((y + 70) * K), C.white, "center");
          /* Solid arrows pointing to the main board: a triangular head on a
             shaft */
          [[a + 7, 120], [a + j + 7, 78]].forEach(function (ar) {
            var cx = x + ar[0], top = y + ar[1];
            poly([[cx, top], [cx + 3.5, top + 4], [cx + 1, top + 4], [cx + 1, top + 11], [cx - 1, top + 11], [cx - 1, top + 4], [cx - 3.5, top + 4]], C.white);
          });
        });
      },
      camera: function (x, y) {
        /* Each camera in its own silver bracket, the main one the largest */
        [[16, 8], [32, 6.5], [48, 6.5]].forEach(function (c) {
          round(x + 18 - c[1], y + c[0] - c[1], c[1] * 2, c[1] * 2, 1.5, C.dust);
          f(x + 18 - c[1], y + c[0] - c[1], c[1] * 4, 1, C.white);
          lens(x + 18, y + c[0]);
        });
      },
      usb: function (x, y) {
        round(x + 10, y + 148, 64, 18, 1.5, C.board); f(x + 11, y + 148, 126, 1, C.boardLit);
        /* The flex cables' sockets */
        r(x + 23, y + 147, 12, 4, C.dark); r(x + 41, y + 147, 12, 4, C.dark);
        round(x + 36, y + 163, 12, 4, 1.5, C.edge); r(x + 38, y + 164, 8, 2, C.dark);
        r(x + 14, y + 152, 6, 4, C.boardLit); f(x + 50, y + 152, 20, 8, C.dark);
        screw(x + 13, y + 162); screw(x + 70, y + 152);
      },
      screen: function (x, y) {
        round(x + 2, y + 2, 80, 168, 4.5, C.frame);
        round(x + 4, y + 4, 76, 164, 4, C.lens); f(x + 8, y + 6, 40, 1, C.glass); f(x + 6, y + 8, 1, 60, C.glass);
      }
    }
  };
  A.RECTS = RECTS; A.LAYERS = LAYERS;
})();
