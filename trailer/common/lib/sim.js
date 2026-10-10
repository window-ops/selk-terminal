/* The simulation shared by the game-screen shots. Each screen is the
   game's own markup (common/snapshots/, captured by common/tools/snapshot-game.js)
   styled by the game's own CSS (common/vendor/css); the trailer's JavaScript
   only moves things, and sets everything from the shot's time t, in
   seconds, so a frame depends only on t:

   - the CRT effects the game plays as CSS animations, worked out from the
     same keyframes in common/vendor/css/crt/screen.css: the glass flicker
     (3.8 s) and the power-on (0.7 s);
   - typing, at the game's pace for its "Text appears: TYPED" setting
     (js/shell/screen.js): one letter every 1 / (min(cps, 140) * 0.3) s;
   - the game's pixel cursors (common/vendor/css/cursors.css), drawn at the
     cursor's place; the page's mouse is moved to the same place, so the
     game's own hover styles light what is under it;
   - the camera, a 16:9 rectangle of the screen scaled to fill the frame;
   - for the gameplay trailer: pointer paths traced from recordings, the
     cursor shape the game's CSS gives the element under the pointer, the
     drag label and the drop highlights of a drag, the mail notice sliding
     in, and the blinking of the game's .blink elements. */
"use strict";
window.SIM = (function () {
  const world = document.getElementById("world"), black = document.getElementById("black");
  let cam = { x: 0, y: 0, w: 1920 }, cur = null, curAt = null, mouseAt = null, touched = null;

  /* Puts a captured screen on the stage, with the game's html and body
     attributes, inside the room and monitor the game's CSS expects */
  function use(name) {
    const snap = window.SNAP[name];
    Object.entries(snap.root).forEach(([k, v]) => document.documentElement.setAttribute(k, v));
    Object.entries(snap.body).forEach(([k, v]) => document.body.setAttribute(k, v));
    world.innerHTML = '<div class="room"><div class="monitor">' + snap.html + "</div></div>";
    /* Panes the game had scrolled, as the snapshot recorded them */
    world.querySelectorAll("[data-scroll-top]").forEach((n) => { n.scrollTop = +n.getAttribute("data-scroll-top"); });
    cur = null;
    return { screen: world.querySelector(".screen"), glass: world.querySelector(".glass"), q: (sel) => world.querySelector(sel), all: (sel) => [...world.querySelectorAll(sel)] };
  }
  /* The first element whose own text starts with text */
  function find(text, sel) {
    return [...world.querySelectorAll(sel || "*")].filter((n) => n.textContent.replace(/ /g, " ").trim().indexOf(text) === 0)
      .sort((a, b) => a.textContent.length - b.textContent.length)[0];
  }
  /* An element's box in screen (world) coordinates, the camera undone */
  function box(el) {
    const r = el.getBoundingClientRect(), k = 1920 / cam.w;
    return { x: r.left / k + cam.x, y: r.top / k + cam.y, w: r.width / k, h: r.height / k, cx: (r.left + r.width / 2) / k + cam.x, cy: (r.top + r.height / 2) / k + cam.y };
  }

  /* The glass flicker: steps(1) over 3.8 s, opacity 0.84 at 24 %, 0.9 at
     68 %, 1 elsewhere */
  function flicker(t) {
    const p = (t % 3.8) / 3.8;
    return p >= 0.24 && p < 0.25 ? 0.84 : p >= 0.68 && p < 0.69 ? 0.9 : 1;
  }
  /* The power-on: the screen a bright line until 45 %, opening past full
     height at 70 %, settling at 100 %, eased by cubic-bezier(0.2, 0.7,
     0.2, 1) inside each step as the browser does */
  function bezier(x1, y1, x2, y2) {
    return function (x) {
      let lo = 0, hi = 1, u = x;
      for (let i = 0; i < 30; i++) {
        u = (lo + hi) / 2;
        const bx = 3 * x1 * u * (1 - u) * (1 - u) + 3 * x2 * u * u * (1 - u) + u * u * u;
        if (bx < x) lo = u; else hi = u;
      }
      return 3 * y1 * u * (1 - u) * (1 - u) + 3 * y2 * u * u * (1 - u) + u * u * u;
    };
  }
  const ease = bezier(0.2, 0.7, 0.2, 1);
  function powerOn(t) {
    if (t >= 0.7) return { sy: 1, b: 1 };
    const p = t / 0.7, keys = [[0, 0.004, 3], [0.45, 0.004, 3], [0.7, 1.02, 1.4], [1, 1, 1]];
    let k = 0; while (k < keys.length - 2 && p > keys[k + 1][0]) k++;
    const [p0, s0, b0] = keys[k], [p1, s1, b1] = keys[k + 1], e = ease((p - p0) / (p1 - p0));
    return { sy: s0 + (s1 - s0) * e, b: b0 + (b1 - b0) * e };
  }
  /* Sets the effects for time t; on: seconds since power-on, or null when
     the screen was already on */
  function effects(parts, t, on) {
    if (parts.glass) parts.glass.style.opacity = flicker(t);
    if (on != null) {
      const p = on < 0 ? { sy: 0, b: 1 } : powerOn(on);
      parts.screen.style.transform = "scale(1, " + p.sy + ")";
      parts.screen.style.filter = "brightness(" + p.b + ")";
    }
  }

  /* Typing as the game's type() does it */
  function typeStep(cps) { return 1 / (Math.min(cps || 90, 140) * 0.3); }
  /* A script of lines [text, class, cps, wait after (s)] from start; for
     time t, how much of each line shows */
  function typed(lines, start) {
    const plan = []; let at = start;
    lines.forEach(([text, cls, cps, after]) => {
      const dur = text.length * typeStep(cps);
      plan.push({ text, cls, from: at, to: at + dur, step: typeStep(cps) });
      at += dur + (after || 0);
    });
    return {
      plan,
      at(t) { return plan.map((l) => ({ cls: l.cls, text: t < l.from ? null : l.text.slice(0, Math.min(l.text.length, Math.floor((t - l.from) / l.step) + 1)) })); }
    };
  }
  /* The boot lines of js/main.js, boot(): dot leaders sized from the
     longest label; the ALARM line in the error color */
  const checks = [
    ["Memory check", "64 GB OK"], ["Drive 0", "spun up, 4 TB"], ["Reactor link", "48 MW OK"],
    ["Uplink relay", "R-09 idle"], ["Directory", "ldaps://dir.selk.cesea.internal OK"],
    ["Unit bus", "31 units online"], ["Structure monitor", "ALARM"], ["Supervisor sleep", "ended 26-02-2097"]
  ];
  const widest = Math.max(...checks.map((c) => c[0].length));
  const BOOT = ["CESEA SITE OS 7.2 (c) 2079 CESEA"].concat(checks.map((c) => c[0] + " " + ".".repeat(widest - c[0].length + 4) + " " + c[1]));
  const bootTyping = (start) => typed(BOOT.map((l, i) => [l, i === 7 ? "err" : "", 140, 0.16]), start);
  /* Writes typed lines into the game's log as its .ln divs */
  function showLines(log, lines) {
    const want = lines.filter((l) => l.text !== null);
    while (log.children.length < want.length) log.appendChild(document.createElement("div"));
    while (log.children.length > want.length) log.lastChild.remove();
    want.forEach((l, i) => { const d = log.children[i]; d.className = "ln " + (l.cls || ""); d.textContent = l.text; });
  }

  /* Smooth steps between timed keys [t, ...values] */
  function keyed(keys, t) {
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) {
        const u = (t - a[0]) / (b[0] - a[0]), e = u * u * (3 - 2 * u);
        return a.slice(1).map((v, k) => v + (b[k + 1] - v) * e);
      }
    }
    return keys[keys.length - 1].slice(1);
  }

  /* The game's pixel cursors at their middle size (body.cur-m) */
  function shape(kind) {
    const v = getComputedStyle(document.body).getPropertyValue("--cur-" + kind);
    const m = v.match(/url\("(.*?)"\)\s+(\d+)\s+(\d+)/);
    return { url: m[1], hx: +m[2], hy: +m[3] };
  }
  function cursor(kind, x, y) {
    if (!cur || !cur.isConnected) { cur = document.createElement("div"); cur.className = "sim-cursor"; world.appendChild(cur); }
    if (!kind) { cur.style.display = "none"; curAt = null; return; }
    const s = shape(kind);
    cur.style.display = "block";
    cur.style.backgroundImage = 'url("' + s.url + '")';
    cur.style.left = x - s.hx + "px"; cur.style.top = y - s.hy + "px";
    curAt = [x, y];
    /* The page's mouse goes where hover() found the shape drawn */
    mouseAt = touched && touched[0] === kind ? [touched[1], touched[2]] : curAt;
    touched = null;
  }
  /* The camera: shows the rectangle (x, y, w) of the screen, 16:9 */
  function camera(x, y, w) {
    cam = { x, y, w };
    world.style.transform = "scale(" + 1920 / w + ") translate(" + -x + "px, " + -y + "px)";
  }
  /* Where the page's mouse goes this frame, in the frame's pixels: on the
     cursor's hot spot, or off every element */
  function mouse() {
    if (!curAt) return [1919, 0];
    const k = 1920 / cam.w, m = mouseAt || curAt;
    return [(m[0] - cam.x) * k, (m[1] - cam.y) * k];
  }
  function blackout(on) { black.style.display = on ? "block" : "none"; }

  /* A traced pointer path: rows [t, x, y, kind] from the recordings (kind
     null while the pointer is hidden). Between rows the pointer moves on a
     monotone cubic in time on each axis (Fritsch and Carlson): it passes
     through every row and never swings past one, however unevenly the
     rows are spaced; the kind is the row's before t */
  function slope(keys, i, k) {
    const a = keys[i - 1], b = keys[i], c = keys[i + 1];
    if (!a || !c || a[3] === null || c[3] === null) return 0;
    const d0 = (b[k] - a[k]) / (b[0] - a[0] || 1e-6), d1 = (c[k] - b[k]) / (c[0] - b[0] || 1e-6);
    if (d0 * d1 <= 0) return 0;
    return 2 / (1 / d0 + 1 / d1);
  }
  function track(keys, t) {
    if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], kind: keys[0][3] };
    let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
    const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
    if (a[3] === null || b === a || b[3] === null) return { x: a[1], y: a[2], kind: a[3] };
    const h = b[0] - a[0], u = (t - a[0]) / h;
    const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    const at = (k) => h00 * a[k] + h10 * h * slope(keys, i, k) + h01 * b[k] + h11 * h * slope(keys, i + 1, k);
    return { x: at(1), y: at(2), kind: a[3] };
  }
  /* Pieces of traced paths played one after the other: where a piece
     starts somewhere else than the last one ended, its first blend seconds
     are pulled toward that end, so the pointer glides instead of jumping */
  function join(pieces, blend) {
    const bl = blend || 0.4;
    let out = pieces[0].slice();
    pieces.slice(1).forEach((pc) => {
      const end = out.filter((k) => k[1] !== null).pop(), first = pc.find((k) => k[1] !== null);
      if (!end || !first) { out = out.concat(pc); return; }
      const dx = end[1] - first[1], dy = end[2] - first[2], t0 = pc[0][0];
      out = out.concat(pc.map((k) => {
        if (k[1] === null) return k;
        const u = Math.min(1, (k[0] - t0) / bl), w = 1 - u * u * (3 - 2 * u);
        return [k[0], k[1] + dx * w, k[2] + dy * w, k[3]];
      }));
    });
    return out;
  }
  /* Rows of a traced path from time from to time to, moved to start at at
     and played speed times faster */
  function part(keys, from, to, at, speed) {
    return keys.filter((k) => k[0] >= from && k[0] <= to).map((k) => [at + (k[0] - from) / (speed || 1), k[1], k[2], k[3]]);
  }
  /* The cursor the game's CSS gives the element under the point (x, y) of
     the screen: arrow, hand, handdrag, text and so on */
  function kindAt(x, y) { return shapeAt(x, y) || "arrow"; }
  /* The shape at (x, y), or null for a point outside the frame */
  function shapeAt(x, y) {
    const k = 1920 / cam.w, el = document.elementFromPoint((x - cam.x) * k, (y - cam.y) * k);
    if (!el) return null;
    const url = (v) => (/url\("?(.*?)"?\)/.exec(v) || [])[1];
    const c = url(getComputedStyle(el).cursor), body = getComputedStyle(document.body);
    return ["hand", "handdrag", "grab", "grabbing", "text", "help", "move", "resize", "no", "arrow"]
      .find((n) => url(body.getPropertyValue("--cur-" + n)) === c) || "arrow";
  }
  /* The shape of a pointer that only hovers (arrow, text, hand, hand with
     drag dots) is the one the game's CSS gives the spot under it, so it
     changes on the frame the pointer crosses an element's edge. A shape
     the pointer would show for less than 0.1 s, crossing a line of text or
     a gap on the way, is not shown: the shape before it stays. A pressed or
     dragging shape, or none, is kept. at(t) gives the pointer {x, y, kind}
     at time t.
     The text cursor's hot spot is the middle of its beam, so the beam
     reaches a link a few frames before the hot spot does: the hand comes
     as soon as the drawn beam touches a link (glance), and the page's
     mouse is put on the touching point, so the link lights at once. */
  const HOVER = ["arrow", "text", "hand", "handdrag"];
  /* The beam of a text cursor drawn at (x, y) on a link: the link's shape
     and the touching point, or null */
  function glance(x, y) {
    const s = shape("text");
    for (const py of [y - s.hy + 2, y + 21 - s.hy]) {
      const q = kindAt(x, py);
      if (q === "hand" || q === "handdrag") return [q, x, py];
    }
    return null;
  }
  function hover(at, t) {
    /* Outside the frame the page has nothing to ask, so the recorded shape
       stands there, and the pointer comes into the frame with it */
    const F = 1 / 60, k = (s) => { const q = at(s); return q.x === null || HOVER.indexOf(q.kind) < 0 ? q.kind : shapeAt(q.x, q.y) || q.kind; };
    const p = at(t), shown = settled();
    if (shown === "text") {
      const g = glance(p.x, p.y);
      if (g) { touched = g; return g[0]; }
    }
    return shown;
    function settled() {
      const now = k(t);
      if (HOVER.indexOf(now) < 0) return now;
      let a = 0, b = 0;
      while (a < 6 && k(t - (a + 1) * F) === now) a++;
      while (b < 6 && k(t + (b + 1) * F) === now) b++;
      if (a + b + 1 >= 6) return now;
      /* The last shape held 0.1 s or more before this one */
      let run = 0, prev = null;
      for (let i = a + 1; i <= 60; i++) {
        const q = k(t - i * F);
        if (HOVER.indexOf(q) < 0) return now;
        run = q === prev ? run + 1 : 1; prev = q;
        if (run >= 6) return q;
      }
      return now;
    }
  }
  /* A drag as the game shows it: the body and html marked dragging (the
     blanks' dashed outlines), the game's label (setDragImage(ghost, 12, 12))
     and the drop highlight on the blank under the pointer. The label is
     drawn as Windows draws a drag image in the recordings, at 74 % opacity,
     a wide one fading toward its right end; it moves with the pointer as
     one piece. label null ends the drag. */
  let ghost = null;
  function drag(label, x, y) {
    world.querySelectorAll(".blank.drop").forEach((b) => b.classList.remove("drop"));
    document.body.classList.toggle("dragging", !!label);
    document.documentElement.classList.toggle("dragging", !!label);
    if (!label) { if (ghost) ghost.style.display = "none"; return; }
    if (!ghost || !ghost.isConnected) { ghost = document.createElement("div"); ghost.className = "drag-ghost"; world.appendChild(ghost); }
    ghost.style.display = "block"; ghost.style.position = "absolute"; ghost.style.zIndex = 1999;
    ghost.textContent = label; ghost.style.opacity = 0.74;
    ghost.style.left = x - 12 + "px"; ghost.style.top = y - 12 + "px";
    const wide = ghost.offsetWidth > 120 ? "linear-gradient(to right, #000 " + Math.round(9000 / ghost.offsetWidth) + "%, transparent 100%)" : "none";
    ghost.style.webkitMaskImage = wide; ghost.style.maskImage = wide;
    const k = 1920 / cam.w;
    ghost.style.visibility = "hidden";
    const under = document.elementFromPoint((x - cam.x) * k, (y - cam.y) * k);
    ghost.style.visibility = "visible";
    const blank = under && under.closest(".blank:not(:disabled)");
    if (blank) blank.classList.add("drop");
  }
  /* The mail notice: mail-toast-in, 0.3 s ease-out from 12 px higher and
     transparent; since: seconds since it arrived, or null when it is not
     there yet */
  const easeOut = bezier(0, 0, 0.58, 1);
  function toast(since) {
    const n = world.querySelector(".mail-toast");
    if (!n) return;
    if (since == null || since < 0) { n.style.visibility = "hidden"; return; }
    const u = easeOut(Math.min(1, since / 0.3));
    n.style.visibility = "visible"; n.style.opacity = u; n.style.transform = "translateY(" + (-12 * (1 - u)) + "px)";
  }
  /* The game's blink: steps(1) over 1.1 s, opacity 0.35 from half way */
  function blink(t) {
    world.querySelectorAll(".blink").forEach((n) => { n.style.opacity = (t % 1.1) / 1.1 >= 0.5 ? 0.35 : 1; });
  }

  /* The camera operator. operator(setups, t) returns the camera [x, y, w] at
     time t, for camera(). setups are the shot's setups in order, each with:
     - from, the time it starts (a new setup is a cut);
     - aim(t), which returns the point to hold at the center and the width
       to show, [x, y, w], and may add a fourth value from 0 to 1 that
       scales the dead zone (0 centers the target exactly);
     - dead, the dead zone, [fx, fy] as fractions of the frame around its
       center (after Unity Cinemachine);
     - smooth, the smoothing in seconds, 0.18 by default;
     - top and bottom, page lines the frame stays between.
     The camera works as screen-recording tools do. It holds still while
     the aim stays inside the dead zone, and moves just enough to keep it
     there when it leaves. The whole path is then smoothed with a centered
     Gaussian, which has no lag, so the camera moves with the cursor. The
     zoom stays as the setup sets it: a change of zoom is a new setup or one
     deliberate move. The path is worked out once per setup, 120 samples a
     second from its start, so a frame still depends only on its time. The
     frame stays on the screen. */
  function operator(setups, t) {
    let i = 0; while (i < setups.length - 1 && t >= setups[i + 1].from) i++;
    const s = setups[i], end = i + 1 < setups.length ? setups[i + 1].from : Infinity;
    const sd = s.smooth == null ? 0.18 : s.smooth, rate = 120, dz = s.dead || [0, 0];
    const raw = s._raw || (s._raw = []);
    const need = Math.min(end, t + 3 * sd) - s.from;
    while ((raw.length - 1) / rate < need) {
      const u = s.from + raw.length / rate, a = s.aim(u), d = a[3] == null ? 1 : a[3];
      if (!raw.length) { raw.push(a.slice(0, 3)); continue; }
      const c = raw[raw.length - 1].slice();
      for (let k = 0; k < 2; k++) {
        const half = (k === 0 ? a[2] : a[2] * 9 / 16) * dz[k] * d / 2, off = a[k] - c[k];
        if (Math.abs(off) > half) c[k] = a[k] - Math.sign(off) * half;
      }
      c[2] = a[2];
      raw.push(c);
    }
    const at = (t - s.from) * rate, n = Math.ceil(3 * sd * rate), out = [0, 0, 0];
    let sum = 0;
    for (let j = Math.max(0, Math.floor(at) - n); j <= Math.min(raw.length - 1, Math.ceil(at) + n); j++) {
      const wgt = sd > 0 ? Math.exp(-0.5 * ((j - at) / (sd * rate)) ** 2) : (j === Math.round(at) ? 1 : 0);
      for (let k = 0; k < 3; k++) out[k] += raw[j][k] * wgt;
      sum += wgt;
    }
    const w = out[2] / sum, hgt = w * 9 / 16;
    let x = out[0] / sum - w / 2, y = out[1] / sum - hgt / 2;
    const top = s.top || 0, bottom = Math.min(1080, s.bottom || 1080);
    x = Math.max(0, Math.min(1920 - w, x));
    y = Math.max(top, Math.min(bottom - hgt, y));
    return [x, y, w];
  }
  /* A traced path made natural for the screen. keys: the trace, rows of
     [t, x, y, shape]. clicks: the moments the pointer acts (a click, a grab
     that starts a drag, a drop), each [t], [t, x, y] or { t, after }.

     Around each click the pointer is held still on its target, from the
     moment it first comes within 30 px of it until after seconds later
     (0.2 by default, 0 for a grab, where the drag begins at once). It never
     drifts, hooks or slides back while a button is pressed.

     The recording's small jitter is then taken out: each place is averaged
     with its neighbors, weighted 1, 2, 1, inside a run of one cursor kind.
     Each move between two rests keeps its route, its start and its end, and
     is retimed to the minimum-jerk profile of a human reach (Flash and
     Hogan, 1985). A move whose peak would pass 1200 px a second takes the
     time it needs from the pauses around it, first the one it arrives in,
     never from a held click; the drift in that time is dropped.

     A rest is the pointer moving less than 3 px in 0.08 s, a held click, a
     change between hidden, grab and drag, or an end of the path. The
     recordings caught the pointer about 15 times a second, so a quick flick
     would otherwise jump across the zoomed frame. */
  function smooth(keys, clicks) {
    let k0 = keys.map((k) => k.slice());
    const held = [], clickAt = [];
    (clicks || []).forEach((c) => {
      const tc = Array.isArray(c) ? c[0] : c.t, at = track(keys, tc);
      const x = Array.isArray(c) && c.length > 2 ? c[1] : at.x, y = Array.isArray(c) && c.length > 2 ? c[2] : at.y;
      const hold = Array.isArray(c) || c.after == null ? 0.2 : c.after;
      if (x === null) return;
      let ta = tc;
      for (let t = tc; t >= tc - 6; t -= 1 / 120) {
        const p = track(keys, t);
        if (p.x === null || Math.hypot(p.x - x, p.y - y) > 30) break;
        ta = t;
      }
      /* While held on the spot the pointer has the shape the game gives
         that spot: the shape it is clicked with, or for a grab the shape
         just before the press */
      const te = tc + hold, kind = track(keys, tc).kind, after = track(keys, te).kind;
      let rests = kind;
      if (kind === "grab") for (let t = tc; t >= ta; t -= 1 / 120) { const q = track(keys, t).kind; if (q !== "grab") { rests = q; break; } }
      k0 = k0.filter((k) => k[0] < ta || k[0] > te);
      k0.push([ta, x, y, rests], [tc, x, y, kind]);
      if (hold > 0) k0.push([te, x, y, after]);
      k0.sort((p, q) => p[0] - q[0]);
      held.push([ta, te]); clickAt.push(tc);
    });
    const isHeld = (t) => held.some(([a, b]) => t >= a - 1e-6 && t <= b + 1e-6);
    const hard = (k) => k[3] === null || k[3] === "grab" || k[3] === "drag";
    const still = (a, b) => a && b && a[1] !== null && b[1] !== null && Math.hypot(a[1] - b[1], a[2] - b[2]) < 3 && Math.abs(b[0] - a[0]) >= 0.08;
    const rest = k0.map((k, i) => {
      const n = k0[i + 1], p = k0[i - 1];
      if (!n || !p || k[1] === null || isHeld(k[0])) return true;
      if (hard(k) !== hard(n) || hard(k) !== hard(p) || (k[3] === "drag") !== (n[3] === "drag")) return true;
      return still(k, n) || still(p, k);
    });
    const k1 = k0.map((k, i) => {
      const a = k0[i - 1], b = k0[i + 1];
      if (rest[i] || !a || !b || k[1] === null || a[3] !== k[3] || b[3] !== k[3]) return k;
      return [k[0], (a[1] + 2 * k[1] + b[1]) / 4, (a[2] + 2 * k[2] + b[2]) / 4, k[3]];
    });
    const mj = (u) => u * u * u * (10 - 15 * u + 6 * u * u);
    const inv = (f) => { let lo = 0, hi = 1; for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; if (mj(m) < f) lo = m; else hi = m; } return (lo + hi) / 2; };
    const out = k1.map((k) => k.slice()), VMAX = 1200;
    /* A pause for borrowing time: the pointer still, or drifting under
       120 px a second, as a resting hand does; a change of shape on the
       spot (the hand pressed into a grab) is part of the pause */
    const same = (a, b) => a && b && a[1] !== null && b[1] !== null && (a[3] === "drag") === (b[3] === "drag") &&
      Math.hypot(a[1] - b[1], a[2] - b[2]) <= Math.max(3, 120 * Math.max(0.05, Math.abs(b[0] - a[0])));
    const drop = new Set();
    let i = 0;
    while (i < k1.length - 1) {
      let j = i + 1; while (j < k1.length - 1 && !rest[j]) j++;
      if (k1[i][1] !== null && k1[j][1] !== null) {
        const len = [0];
        for (let m = i + 1; m <= j; m++) len.push(len[len.length - 1] + Math.hypot(k1[m][1] - k1[m - 1][1], k1[m][2] - k1[m - 1][2]));
        const total = len[len.length - 1];
        let t0 = out[i][0], t1 = out[j][0];
        const need = 1.875 * total / VMAX - (t1 - t0);
        if (total > 1 && need > 0) {
          /* The pause it arrives in: until the pointer moves on, or the
             first click held there, less 0.12 s */
          let e = j; while (same(k1[e], k1[e + 1])) e++;
          const clickIn = clickAt.filter((c) => c >= t1 - 1e-6 && c <= k1[e][0] + 1e-6);
          const until = Math.min(k1[e][0], clickIn.length ? Math.min(...clickIn) : Infinity) - 0.12;
          const later = Math.max(0, Math.min(need, until - t1));
          /* The pause it leaves: back to where the pointer arrived there,
             but never into a held click */
          let b = i; while (same(k1[b - 1], k1[b])) b--;
          const hold = held.filter(([a, z]) => z <= t0 + 1e-6 && z >= k1[b][0] - 1e-6).map(([, z]) => z);
          const from = Math.max(k1[b][0], hold.length ? Math.max(...hold) : -Infinity) + 0.1;
          const earlier = Math.max(0, Math.min(need - later, t0 - from));
          t1 += later; t0 -= earlier;
          out[j][0] = t1; out[i][0] = t0;
          /* The drift that the move's new time covers is dropped, so the
             pointer never goes back to it */
          for (let m = j + 1; m <= e; m++) if (out[m][0] <= t1 + 1e-6) drop.add(m);
          for (let m = b; m < i; m++) if (out[m][0] >= t0 - 1e-6) drop.add(m);
        }
        if (j - i > 1 && total > 1) for (let m = i + 1; m < j; m++) out[m][0] = t0 + (t1 - t0) * inv(len[m - i] / total);
      }
      i = j;
    }
    return out.filter((k, m) => !drop.has(m)).sort((p, q) => p[0] - q[0]);
  }
  /* The box of a piece of text inside the screen, in screen coordinates:
     the rectangles of its lines joined, for centering on a phrase */
  function textBox(text) {
    const walk = document.createTreeWalker(world, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const i = n.data.replace(/\u00a0/g, " ").indexOf(text);
      if (i < 0) continue;
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + text.length);
      const k = 1920 / cam.w, rs = [...r.getClientRects()];
      const x0 = Math.min(...rs.map((q) => q.left)), y0 = Math.min(...rs.map((q) => q.top));
      const x1 = Math.max(...rs.map((q) => q.right)), y1 = Math.max(...rs.map((q) => q.bottom));
      const b = { x: x0 / k + cam.x, y: y0 / k + cam.y, w: (x1 - x0) / k, h: (y1 - y0) / k };
      b.cx = b.x + b.w / 2; b.cy = b.y + b.h / 2;
      return b;
    }
    return null;
  }
  /* The box of an element's text, the rectangles of all its lines joined:
     its padding and the empty end of a block left out */
  function inkBox(el) {
    const r = document.createRange(); r.selectNodeContents(el);
    const rs = [...r.getClientRects()].filter((q) => q.width > 0), k = 1920 / cam.w;
    const x0 = Math.min(...rs.map((q) => q.left)), y0 = Math.min(...rs.map((q) => q.top));
    const x1 = Math.max(...rs.map((q) => q.right)), y1 = Math.max(...rs.map((q) => q.bottom));
    const b = { x: x0 / k + cam.x, y: y0 / k + cam.y, w: (x1 - x0) / k, h: (y1 - y0) / k };
    b.cx = b.x + b.w / 2; b.cy = b.y + b.h / 2;
    return b;
  }
  /* A drag landed squarely: the game accepts a drop near a blank, a
     convenience the trailer does not show, so the path's last ramp seconds
     before the drop bend smoothly onto the point (x, y), the bend complete
     at the time to (the drop by default), and the pointer stays there after
     the drop */
  function land(keys, drop, x, y, ramp, to) {
    const r = ramp || 0.7, b = to == null ? drop : to, a = drop - r, end = track(keys, drop), dx = x - end.x, dy = y - end.y;
    return keys.map((k) => {
      if (k[1] === null || k[0] < a) return k;
      const u = Math.min(1, (k[0] - a) / (b - a)), e = u * u * (3 - 2 * u);
      return [k[0], k[1] + dx * e, k[2] + dy * e, k[3]];
    });
  }

  /* After a drop the hand would cover the entry just written in the blank:
     the pointer eases off to the right and below it (a change to the
     recorded path, for the trailer), its shape the one the game's CSS gives
     the place it reaches */
  function leave(p, blank, drop, t) {
    if (t < drop + 0.12) return p;
    const u = Math.min(1, (t - drop - 0.12) / 0.45), e = 1 - (1 - u) * (1 - u) * (1 - u);
    const x = p.x + (blank.x + blank.w + 70 - p.x) * e, y = p.y + (blank.y + blank.h + 40 - p.y) * e;
    return { x, y, kind: kindAt(x, y) };
  }

  return { use, find, box, textBox, effects, typed, typeStep, BOOT, bootTyping, showLines, keyed, cursor, camera, mouse, blackout, track, part, kindAt, hover, drag, toast, blink, operator, smooth, land, leave, join, inkBox, pointer: () => curAt };
})();
