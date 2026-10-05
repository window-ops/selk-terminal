/* The simulation shared by the game-screen shots. Each screen is the
   game's own markup (shots/snapshots/, captured by tools/snapshot-game.js)
   styled by the game's own CSS (vendor/css); the trailer's JavaScript
   only moves things, and sets everything from the shot's time t, in
   seconds, so a frame depends only on t:

   - the CRT effects the game plays as CSS animations, worked out from the
     same keyframes in vendor/css/crt/screen.css: the glass flicker
     (3.8 s) and the power-on (0.7 s);
   - typing, at the game's pace for its "Text appears: TYPED" setting
     (js/shell/screen.js): one letter every 1 / (min(cps, 140) * 0.3) s;
   - the game's pixel cursors (vendor/css/cursors.css), drawn at the
     cursor's place; the page's mouse is moved to the same place, so the
     game's own hover styles light what is under it;
   - the camera, a 16:9 rectangle of the screen scaled to fill the frame. */
"use strict";
window.SIM = (function () {
  const world = document.getElementById("world"), black = document.getElementById("black");
  let cam = { x: 0, y: 0, w: 1920 }, cur = null, curAt = null;

  /* Puts a captured screen on the stage, with the game's html and body
     attributes, inside the room and monitor the game's CSS expects */
  function use(name) {
    const snap = window.SNAP[name];
    Object.entries(snap.root).forEach(([k, v]) => document.documentElement.setAttribute(k, v));
    Object.entries(snap.body).forEach(([k, v]) => document.body.setAttribute(k, v));
    world.innerHTML = '<div class="room"><div class="monitor">' + snap.html + "</div></div>";
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
     longest label; the ALARM line in the error colour */
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
    const k = 1920 / cam.w;
    return [(curAt[0] - cam.x) * k, (curAt[1] - cam.y) * k];
  }
  function blackout(on) { black.style.display = on ? "block" : "none"; }

  return { use, find, box, effects, typed, typeStep, BOOT, bootTyping, showLines, keyed, cursor, camera, mouse, blackout };
})();
