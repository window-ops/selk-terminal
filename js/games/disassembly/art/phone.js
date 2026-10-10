/* DISASSEMBLY.RUN art (js/games/disassembly/art/): the phone built of its
   layers, from the back and from the front, its power button, the outline
   of the keyboard's part, and what is under the pointer. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, C = A.C;
  var K = A.K, W = A.W, H = A.H, PX = A.PX, PY = A.PY, PW = A.PW, PH = A.PH, TRAY = A.TRAY, DRAWER = A.DRAWER, RADIUS = A.RADIUS;
  var r = A.r, f = A.f, round = A.round, disc = A.disc, ring = A.ring, poly = A.poly, hull = A.hull;
  var bump = A.bump, RECTS = A.RECTS, LAYERS = A.LAYERS;
  /* The frame's color: the Fairphone's follows its edition, black for the
     transparent and Matte Black editions and blue for Sky Blue */
  function frameColour(phone) {
    if (phone !== "fairphone") { return C.frame; }
    return A.edition === "blue" ? "#3F6FA8" : "#3A3E42";
  }
  /* The frame and what is left when every layer is off: the bays and
     spaces the parts sit in, the boards, cable channels and the antenna
     lines cut into the frame */
  function base(phone, x, y) {
    var rad = RADIUS[phone], body = frameColour(phone);
    /* The frame with a lighter rim all round */
    round(x - 0.5, y - 0.5, PW + 1, PH + 1, rad + 0.5, C.edge);
    round(x, y, PW, PH, rad, body);
    round(x + 4, y + 4, 76, 164, Math.max(2, rad - 3), C.mat);
    /* Antenna breaks in the frame */
    [[0, 30], [0, 120], [PW - 1, 50], [PW - 1, 136]].forEach(function (a) { r(x + a[0], y + a[1], 1, 2, C.dark); });
    if (phone === "fairphone") {
      /* The main board across the top, under the top module: silver shield
         cans, the two camera sockets at the top left, and the top module's
         connector */
      r(x + 6, y + 7, 72, 57, C.fpBoard); f(x + 6, y + 7, 144, 1, C.board);
      r(x + 30, y + 9, 18, 16, C.dust); f(x + 30, y + 9, 36, 1, C.white);
      r(x + 50, y + 9, 24, 24, C.dust); f(x + 50, y + 9, 48, 1, C.white);
      r(x + 30, y + 30, 16, 12, C.edge); r(x + 50, y + 38, 24, 12, C.dust);
      round(x + 12, y + 9, 14, 14, 2, C.dark); round(x + 11, y + 26, 14, 14, 2, C.dark);
      r(x + 15, y + 23, 7, 2, C.gold); r(x + 14, y + 40, 7, 2, C.gold);
      r(x + 44, y + 54, 10, 4, C.gold); r(x + 12, y + 46, 24, 12, C.edge);
      /* The battery bay: a recess as large as the battery, with the SIM
         slots, the printed label and the spring contacts at its bottom */
      round(x + 5, y + 63, 74, 90, 2, C.dark);
      round(x + 30, y + 67, 9, 12, 1, C.edge); round(x + 31, y + 68, 7, 10, 1, C.dark);
      round(x + 44, y + 67, 9, 12, 1, C.edge); round(x + 45, y + 68, 7, 10, 1, C.dark);
      for (var lb = 0; lb < 2; lb++) { f(x + 30, y + 86 + lb * 5, 48 - lb * 12, 2, C.dust); }
      for (var lr = 0; lr < 5; lr++) { f(x + 12, y + 104 + lr * 4, 40 - lr * 4, 1, C.edge); }
      for (var c = 0; c < 4; c++) { r(x + 34 + c * 4, y + 147, 2, 3, C.gold); }
      /* The bottom module's place and the USB-C port's bay */
      round(x + 6, y + 152, 72, 16, 6, C.lens); r(x + 6, y + 152, 72, 8, C.lens); round(x + 6.5, y + 152, 7, 12, 1, C.dark);
      r(x + 8.5, y + 156, 3, 4, C.gold);
    } else {
      /* The main board at the top, the battery well under the vapor
         chamber's copper, the sub-board's place at the bottom, and the
         ribbon cables' channel between them */
      r(x + 34, y + 8, 42, 60, C.board); f(x + 34, y + 8, 84, 1, C.boardLit);
      r(x + 38, y + 12, 20, 16, C.dust); f(x + 38, y + 12, 40, 1, C.white);
      r(x + 60, y + 12, 12, 22, C.dust); f(x + 60, y + 12, 24, 1, C.white);
      r(x + 38, y + 32, 18, 12, C.edge); r(x + 40, y + 34, 14, 8, C.dust);
      for (var q = 0; q < 8; q++) { f(x + 40 + q * 3.2, y + 50, 3, 6, C.gold); }
      /* The flex cables' sockets on the main board's lower edge */
      r(x + 41, y + 64, 12, 4, C.dark); r(x + 59, y + 64, 12, 4, C.dark);
      r(x + 8, y + 8, 24, 50, C.dark);
      round(x + 9, y + 73, 66, 70, 2, C.dark);
      r(x + 14, y + 78, 40, 30, C.copper); f(x + 14, y + 78, 80, 1, C.gold);
      r(x + 65, y + 70, 6, 78, C.mat); f(x + 67, y + 70, 2, 156, C.frame);
      r(x + 8, y + 146, 68, 20, C.dark); r(x + 36, y + 162, 12, 4, C.frame);
    }
  }
  function layer(phone, id, x, y, st) {
    var done = (st.done && st.done[id]) || [];
    A.loose = done.indexOf("screw") !== -1;
    LAYERS[phone][id](x, y, done);
    A.loose = false;
  }
  /* The phone with the layers still on it, from (x, y), with the power
     button on the right edge */
  function phoneAt(phone, order, st, x, y) {
    var removed = st.removed || [], pb = RECTS[phone].power;
    powerKey(x + pb[0] + 1, y + pb[1], pb[3], st.on);
    if (removed.indexOf("screen") === -1 && !(st.drag && st.drag.id === "screen")) { layer(phone, "screen", x, y, st); }
    base(phone, x, y);
    for (var i = order.length - 1; i >= 0; i--) {
      var id = order[i];
      if (id !== "screen" && removed.indexOf(id) === -1 && !(st.drag && st.drag.id === id)) { layer(phone, id, x, y, st); }
    }
    /* The Fairphone's bump stands through the hole in its cover */
    if (phone === "fairphone" && removed.indexOf("top") === -1 && !(st.drag && st.drag.id === "top")) { bump(x, y); }
  }
  /* The power button on the edge of the frame; while the phone is on it is
     lit, with a soft glow round it */
  function powerKey(x, y, h, on) {
    if (on) {
      A.g.globalAlpha = 0.35; r(x - 1, y - 1, 3.5, h + 2, C.haze); A.g.globalAlpha = 1;
      r(x, y, 1.5, h, C.haze); f(x, y, 3, 1, C.white);
    } else {
      r(x, y, 1.5, h, C.edge); f(x, y, 3, 1, C.white);
    }
  }
  /* The phone from the front, from (x, y): the display with its front
     camera, lit while the phone is on, or with the display out the inside
     of the frame, mirrored; the power button is on the left from here */
  function display(phone, x, y, on) {
    var rad = RADIUS[phone];
    round(x + 2, y + 2, 80, 168, Math.max(2, rad - 1), C.lens);
    if (on) {
      round(x + 4, y + 4, 76, 164, Math.max(2, rad - 2), C.screen);
      for (var w = 0; w < 30; w++) { r(x + 4, y + 70 + w, Math.round(76 * Math.sin((w + 6) / 12) * 0.7), 1, C.screenLit); }
    }
    disc(x + 42, y + 9, 1.6, C.dark); ring(x + 42, y + 9, 1.6, C.frame);
  }
  function front(phone, st, x, y) {
    var removed = st.removed || [], pb = RECTS[phone].power;
    round(x - 0.5, y - 0.5, PW + 1, PH + 1, RADIUS[phone] + 0.5, C.edge);
    round(x, y, PW, PH, RADIUS[phone], frameColour(phone));
    powerKey(x + PW - pb[0] - pb[2] + 1.5, y + pb[1], pb[3], st.on);
    if (removed.indexOf("screen") !== -1 || (st.drag && st.drag.id === "screen" && !st.drag.stuck)) {
      A.g.save(); A.g.translate((2 * x + PW) * K, 0); A.g.scale(-1, 1); base(phone, x, y); A.g.restore();
    } else {
      display(phone, x, y, st.on);
    }
  }
  /* What is at (ux, uy) on the front: the power button, or the display */
  function hitFront(phone, removed, ux, uy) {
    var pb = RECTS[phone].power, mx = PX + PW - pb[0] - pb[2];
    if (ux >= mx && ux < mx + pb[2] && uy >= PY + pb[1] && uy < PY + pb[1] + pb[3]) { return "power"; }
    if (removed.indexOf("screen") === -1 && ux >= PX + 4 && ux < PX + 80 && uy >= PY + 4 && uy < PY + 168) { return "screen"; }
    return null;
  }
  /* A dashed outline round a layer, for the part the keyboard is on; on
     the front it is mirrored */
  function outline(phone, id, mirror) {
    var b = RECTS[phone][id];
    if (!b) { return; }
    if (mirror) { b = [PW - b[0] - b[2], b[1], b[2], b[3]]; }
    A.g.fillStyle = C.haze;
    for (var i = 0; i < b[2] * K; i += 6) { A.g.fillRect((PX + b[0]) * K + i, (PY + b[1]) * K - 2, 3, 1); A.g.fillRect((PX + b[0]) * K + i, (PY + b[1] + b[3]) * K + 1, 3, 1); }
    for (var j = 0; j < b[3] * K; j += 6) { A.g.fillRect((PX + b[0]) * K - 2, (PY + b[1]) * K + j, 1, 3); A.g.fillRect((PX + b[0] + b[2]) * K + 1, (PY + b[1]) * K + j, 1, 3); }
  }
  /* The layer of the phone at (ux, uy) in units, the top one first, among
     those in ids */
  function hit(phone, ids, ux, uy) {
    for (var i = 0; i < ids.length; i++) {
      var b = RECTS[phone][ids[i]];
      if (ux >= PX + b[0] && ux < PX + b[0] + b[2] && uy >= PY + b[1] && uy < PY + b[1] + b[3]) { return ids[i]; }
    }
    return null;
  }
  A.frameColour = frameColour; A.base = base; A.layer = layer; A.phoneAt = phoneAt; A.powerKey = powerKey; A.display = display;
  A.front = front; A.hitFront = hitFront; A.outline = outline; A.hit = hit;
})();
