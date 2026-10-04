/* DISASSEMBLY.RUN art (js/games/disassembly/art/): the whole picture: the
   phone, the tray of removed parts, the drawer with the new part and the
   part being dragged; and the small preview of a phone for the start
   screen. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, C = A.C;
  var K = A.K, W = A.W, H = A.H, PX = A.PX, PY = A.PY, PW = A.PW, PH = A.PH, TRAY = A.TRAY, DRAWER = A.DRAWER, RADIUS = A.RADIUS;
  var r = A.r, f = A.f, round = A.round, disc = A.disc, ring = A.ring, poly = A.poly, hull = A.hull;
  var RECTS = A.RECTS, layer = A.layer, phoneAt = A.phoneAt, front = A.front, display = A.display, outline = A.outline;
  /* The whole picture: the phone, the tray with the removed layers in the
     order they came off, the part being dragged, and the keyboard's part */
  function scene(phone, order, st) {
    A.edition = st.edition || "transparent";
    r(0, 0, W / K, H / K, C.bg);
    /* The tray for the removed parts, and under it the drawer of new parts
       with its front edge and handle */
    round(TRAY, 6, W / K - TRAY - 10, DRAWER - 10, 3, C.mat); f(TRAY + 3, 6, (W / K - TRAY - 16) * K, 1, C.frame);
    round(TRAY, DRAWER, W / K - TRAY - 10, 194 - DRAWER, 3, C.mat); f(TRAY + 3, DRAWER, (W / K - TRAY - 16) * K, 1, C.frame);
    round(TRAY, 186, W / K - TRAY - 10, 8, 3, C.frame); r(TRAY, 186, W / K - TRAY - 10, 4, C.frame);
    round(TRAY + (W / K - TRAY - 10) / 2 - 8, 188, 16, 3, 1.5, C.edge);
    if (st.flipped) { front(phone, st, PX, PY); } else { phoneAt(phone, order, st, PX, PY); }
    (st.removed || []).forEach(function (id, n) {
      if (st.drag && st.drag.tray && st.drag.id === id) { return; }
      scaled(function () { layer(phone, id, 4, 4, st); }, TRAY + 4 + (n % 5) * 32, 8 + Math.floor(n / 5) * 58, 1 / 3);
    });
    /* The new part waits in the drawer until it is dragged into the phone;
       while dragged it is drawn full size round the pointer */
    if (st.newPart && !(st.drag && st.drag.id === "new")) {
      var slot = newSlot(phone, st.newPart);
      scaled(function () { layer(phone, st.newPart, 4, 4, st); }, slot[0], slot[1], slot[2]);
    }
    if (st.drag && st.drag.tray) {
      var tb = RECTS[phone][st.drag.id];
      layer(phone, st.drag.id, st.drag.ux - tb[0] - tb[2] / 2, st.drag.uy - tb[1] - tb[3] / 2, st);
    } else if (st.drag && st.drag.id === "new") {
      var nb = RECTS[phone][st.newPart];
      layer(phone, st.newPart, st.drag.ux - nb[0] - nb[2] / 2, st.drag.uy - nb[1] - nb[3] / 2, st);
    } else if (st.drag && !st.drag.stuck) {
      if (st.flipped) { display(phone, PX + st.drag.dx, PY + st.drag.dy, st.on); } else { layer(phone, st.drag.id, PX + st.drag.dx, PY + st.drag.dy, st); }
    }
    /* The keyboard's part is outlined once the arrows have been used, or
       always in tutorial mode */
    if (st.focus && !st.drag && (st.kbd || st.tutorial)) { outline(phone, st.focus, st.flipped); }
  }
  /* Where the new part's scaled phone would start, in units, and its scale:
     the part is at most half size, fits the drawer, and sits in its middle */
  function newSlot(phone, id) {
    var b = RECTS[phone][id], k = Math.min(0.5, 44 / b[3], 140 / b[2]);
    var cx = TRAY + (W / K - TRAY - 10) / 2, cy = (DRAWER + 186) / 2;
    return [cx - (b[0] + b[2] / 2) * k, cy - (b[1] + b[3] / 2) * k, k];
  }
  /* The removed part in the tray at (ux, uy), or null */
  function trayAt(phone, removed, ux, uy) {
    for (var n = removed.length - 1; n >= 0; n--) {
      var sx = TRAY + 4 + (n % 5) * 32, sy = 8 + Math.floor(n / 5) * 58, b = RECTS[phone][removed[n]];
      if (ux >= sx + b[0] / 3 - 2 && ux < sx + (b[0] + b[2]) / 3 + 2 && uy >= sy + b[1] / 3 - 2 && uy < sy + (b[1] + b[3]) / 3 + 2) { return removed[n]; }
    }
    return null;
  }
  /* True when (ux, uy) is on the new part in the drawer, or near it */
  function onNew(phone, id, ux, uy) {
    var s = newSlot(phone, id), b = RECTS[phone][id], k = s[2];
    return ux >= s[0] + b[0] * k - 6 && ux < s[0] + (b[0] + b[2]) * k + 6 && uy >= s[1] + b[1] * k - 6 && uy < s[1] + (b[1] + b[3]) * k + 6;
  }
  /* The whole closed phone on a small canvas, for the start screen */
  function preview(ctx, phone, order, scale, ed) {
    var keep = A.g;
    A.g = ctx; A.edition = ed || "transparent";
    A.g.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    scaled(function () { phoneAt(phone, order, {}, 4, 4); }, 0, 0, scale);
    A.g = keep;
  }
  /* Draws at a smaller scale without blurring: paint(), drawing a phone
     from (4, 4) units, goes to a hidden canvas at full size, which is then
     copied pixel for pixel at scale k with the phone's corner at (ux, uy).
     Scaling the canvas itself would put single pixels on half pixels and
     blend them into dark squares. */
  var hidden = null;
  function scaled(paint, ux, uy, k) {
    if (!hidden) { hidden = document.createElement("canvas"); hidden.width = (PW + 12) * K; hidden.height = (PH + 12) * K; }
    var keep = A.g, hc = hidden.getContext("2d");
    hc.clearRect(0, 0, hidden.width, hidden.height);
    A.g = hc; paint(); A.g = keep;
    var smooth = A.g.imageSmoothingEnabled;
    A.g.imageSmoothingEnabled = false;
    A.g.drawImage(hidden, Math.round((ux - 4 * k) * K), Math.round((uy - 4 * k) * K), Math.round(hidden.width * k), Math.round(hidden.height * k));
    A.g.imageSmoothingEnabled = smooth;
  }
  A.scene = scene; A.trayAt = trayAt; A.onNew = onNew; A.preview = preview;
})();
