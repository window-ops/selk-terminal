#!/usr/bin/env node
/* Browser tests for the interface: the status line message, error routing
   and the error dialog, desktop window sizes and stacking, the follow-up
   messages and their spacing in the shell, Setup tooltips, Setup rows on
   phones and in screen reader mode, the Setup views, the text speed under
   reduced motion, control sounds, the Romanian pack, and the two games,
   TROIKA.RUN and DISASSEMBLY.RUN.

   The script serves the project itself on a free local port and drives
   Chromium through Playwright. Install Playwright once, outside the game:

     npm install --no-save playwright
     npx playwright install chromium

   Run every group, or name some:

     node tools/test-ui.js
     node tools/test-ui.js hover,errors

   Each check prints PASS or FAIL. The exit code is 1 when a check fails.
   Every game starts in Fast mode with text at once, so a full run takes
   about six minutes, most of it on message timers. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (e) {
  console.error("Playwright is missing. Run: npm install --no-save playwright && npx playwright install chromium");
  process.exit(2);
}

const ROOT = path.join(__dirname, "..");
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json", ".txt": "text/plain"
};

/* A static server for the project root, on a port the system picks */
function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(ROOT, url === "/" ? "index.html" : url);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const results = [];
function check(name, ok, info) {
  results.push(!!ok);
  const extra = info === undefined ? "" : "  [" + JSON.stringify(info) + "]";
  console.log((ok ? "PASS " : "FAIL ") + name + extra);
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let BASE = "";
/* A signed-in game with the given settings. A touch context gets no mouse
   movement, since a moved mouse tells the game a pointer is drawn. */
async function boot(browser, settings, opts) {
  opts = opts || {};
  const vw = opts.vw || 1366, vh = opts.vh || 800;
  const ctx = await browser.newContext(Object.assign({ viewport: { width: vw, height: vh } },
    opts.touch ? { hasTouch: true, isMobile: true } : {}));
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(String(e)));
  const st = {
    version: 1, name: "Tester",
    settings: Object.assign({ sv: 2, mode: "tmux", fast: true, speed: "instant", poweron: false }, settings || {})
  };
  if (opts.lang) { st.settings.lang = opts.lang; }
  await pg.addInitScript((data) => sessionStorage.setItem("selk-terminal-v1", data), JSON.stringify(st));
  await pg.goto(BASE + "/index.html");
  await wait(800);
  await pg.evaluate(() => document.querySelector("[data-title=power]").click());
  await wait(3500);
  await pg.evaluate(() => { try { SELK.tut.stop(); } catch (e) {} });
  if (!opts.touch) { await pg.mouse.move(vw / 2, vh / 3); }
  return { ctx, pg };
}
/* The status line text in the bar with selector bar */
const chipText = (pg, bar) => pg.evaluate((sel) => document.querySelector(sel + " .bar-msg-chip").textContent, bar);

const GROUPS = {
  /* The status line message stays under the pointer or the focus */
  async hover(b) {
    for (const [mode, bar] of [["tmux", "#tmux-msg"], ["desktop", "#wb-msg"]]) {
      const { ctx, pg } = await boot(b, { mode });
      /* The pointer goes to the middle of the message text */
      await pg.evaluate(() => SELK.msg("Resting test")); await wait(100);
      const bb = await (await pg.$(bar + " .bar-msg-chip")).boundingBox();
      const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
      await pg.mouse.move(x, y); await wait(5000);
      check(`${mode}: message stays under a resting pointer`, await chipText(pg, bar) === "Resting test");
      await pg.mouse.move(600, 300); await wait(4000);
      check(`${mode}: message clears after the pointer leaves`, await chipText(pg, bar) === "");
      await pg.evaluate(() => SELK.msg("Arriving test")); await wait(1500);
      await pg.mouse.move(x, y); await wait(5000);
      check(`${mode}: message stays when the pointer arrives later`, await chipText(pg, bar) === "Arriving test");
      await pg.mouse.move(600, 300); await wait(4000);
      /* Lost pointer events: enter and over are stopped before the bar */
      await pg.evaluate(() => {
        const stop = (e) => { if (e.target.closest && e.target.closest(".bar-msg")) { e.stopImmediatePropagation(); } };
        window.addEventListener("pointerenter", stop, true);
        window.addEventListener("pointerover", stop, true);
      });
      await pg.evaluate(() => SELK.msg("Missed event test")); await wait(1000);
      await pg.mouse.move(x, y); await wait(5000);
      check(`${mode}: message stays under the pointer with enter events lost`, await chipText(pg, bar) === "Missed event test");
      await pg.mouse.move(600, 300); await wait(4500);
      check(`${mode}: message clears with leave events lost`, await chipText(pg, bar) === "");
      /* Free space of the bar, away from the text */
      const box = await (await pg.$(bar)).boundingBox();
      await pg.evaluate(() => SELK.msg("Free space test")); await wait(100);
      const chip = await (await pg.$(bar + " .bar-msg-chip")).boundingBox();
      const fx = chip.x > box.x + 60 ? box.x + 10 : box.x + box.width - 10;
      await pg.mouse.move(fx, y); await wait(4500);
      check(`${mode}: message clears with the pointer on the free space of the bar`, await chipText(pg, bar) === "");
      /* A mouse click on a long message focuses it and the message still clears */
      await pg.evaluate(() => SELK.msg("Click test. " + "This message is long enough to overflow the bar. ".repeat(4))); await wait(100);
      const lb = await (await pg.$(bar + " .bar-msg-track")).boundingBox();
      await pg.mouse.click(lb.x + 20, lb.y + lb.height / 2);
      await pg.mouse.move(600, 300); await wait(8000);
      check(`${mode}: message clears after a mouse click and the pointer leaving`, await chipText(pg, bar) === "");
      check(`${mode}: no page errors`, !pg.errs.length, pg.errs);
      await ctx.close();
    }
    {
      /* A message kept by the pointer clears when a mode switch hides its bar */
      const { ctx, pg } = await boot(b);
      await pg.evaluate(() => SELK.msg("Switch test")); await wait(100);
      const bb = await (await pg.$("#tmux-msg .bar-msg-chip")).boundingBox();
      await pg.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(300);
      await pg.evaluate(() => SELK.setMode("desktop")); await wait(200);
      await pg.evaluate(() => SELK.msg("After switch")); await pg.mouse.move(600, 300); await wait(4500);
      check("message clears after a mode switch under the pointer", await chipText(pg, "#wb-msg") === "");
      await ctx.close();
    }
    const { ctx, pg } = await boot(b);
    await pg.mouse.move(600, 300);
    await pg.evaluate(() => SELK.msg("Focus test. " + "This message is long enough to overflow the status bar so that it becomes focusable. ".repeat(2)));
    await pg.evaluate(() => document.querySelector("#tmux-msg .bar-msg-track").focus());
    await pg.keyboard.press("End"); await wait(9000);
    const st = await pg.evaluate(() => [
      document.querySelector("#tmux-msg .bar-msg-chip").textContent.length > 0,
      document.querySelector("#tmux-msg .bar-msg-track").scrollLeft > 0
    ]);
    check("tmux: focused message stays and End scrolls it", st[0] && st[1], st);
    await pg.evaluate(() => document.activeElement.blur()); await wait(7500);
    check("tmux: message clears after blur", await chipText(pg, "#tmux-msg") === "");
    await ctx.close();
  },

  /* Setup > Display > Scroll long messages */
  async auto(b) {
    const LONG = "Auto test. " + "This message runs past the end of the bar so that it must scroll. ".repeat(3);
    for (const [name, s, moves] of [
      ["desktop, switch ON", { mode: "desktop", barScroll: true }, true],
      ["screen reader mode, switch ON", { barScroll: true, sr: true }, false],
      ["motion reduced, switch ON", { barScroll: true, motion: "reduce" }, false],
      ["tmux, switch OFF", {}, false]
    ]) {
      const { ctx, pg } = await boot(b, s);
      const bar = s.mode === "desktop" ? "#wb-msg" : "#tmux-msg";
      await pg.mouse.move(600, 300);
      await pg.evaluate((t) => SELK.msg(t), LONG); await wait(3000);
      const left = await pg.evaluate((sel) => document.querySelector(sel + " .bar-msg-track").scrollLeft, bar);
      check(`automatic scroll, ${name}: ${moves ? "moves" : "stays"}`, (left > 0) === moves, left);
      await ctx.close();
    }
  },

  /* Setup > Display > Error messages, and the error dialog */
  async errors(b) {
    /* Where the last error went: the error dialog, the bar, or neither */
    const where = (pg, bar) => pg.evaluate((sel) => document.querySelector(".err-ov") ? "dialog"
      : (document.querySelector(sel).dataset.kind === "err" ? "bar" : "none"), bar);
    for (const [mode, val, want] of [
      ["tmux", "auto", "bar"], ["tmux", "dialog", "dialog"], ["tmux", "bar", "bar"],
      ["desktop", "auto", "dialog"], ["desktop", "dialog", "dialog"], ["desktop", "bar", "bar"]
    ]) {
      const { ctx, pg } = await boot(b, { mode, errors: val });
      const bar = mode === "desktop" ? "#wb-msg" : "#tmux-msg";
      await pg.evaluate(() => SELK.runClick("unlock archive wrong")); await wait(300);
      let got = await where(pg, bar);
      check(`click error, ${mode}, errors=${val}: ${want}`, got === want, got);
      await pg.evaluate(() => SELK.closeError());
      if (mode === "desktop") { await pg.evaluate(() => SELK.desk.goto("SHELL")); }
      await pg.evaluate((sel) => { document.querySelector(sel).removeAttribute("data-kind"); SELK.run("unlock archive wrong"); }, bar);
      await wait(300);
      got = await where(pg, bar);
      check(`typed error with SHELL in view, ${mode}, errors=${val}: shell only`, got === "none", got);
      await ctx.close();
    }
    const { ctx, pg } = await boot(b, { errors: "dialog" });
    await pg.evaluate(() => SELK.msg("First error", "err"));
    await pg.keyboard.press("Tab"); await pg.keyboard.press("Tab");
    check("error dialog keeps Tab on OK", await pg.evaluate(() => !!document.activeElement.closest(".err-ov")));
    await pg.evaluate(() => SELK.msg("Second error", "err"));
    check("a second error replaces the text in one dialog", await pg.evaluate(() =>
      document.querySelectorAll(".err-ov").length === 1 && document.querySelector(".err-ov .dlg-body").textContent === "Second error"));
    await pg.keyboard.press("F1"); await wait(200);
    check("F keys do nothing under the error dialog", await pg.evaluate(() => !!document.querySelector(".err-ov")));
    await pg.keyboard.press("Enter"); await wait(100);
    check("Enter closes the error dialog", await pg.evaluate(() => !document.querySelector(".err-ov")));
    await pg.evaluate(() => SELK.unlockDialog()); await wait(200);
    await pg.keyboard.type("wrong"); await pg.keyboard.press("Enter"); await wait(300);
    await pg.keyboard.press("Escape"); await wait(200);
    check("Escape closes the error dialog and keeps UNLOCK open", await pg.evaluate(() =>
      !document.querySelector(".err-ov") && !!SELK.dlg && document.activeElement.classList.contains("dlg-in")));
    check("no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  },

  /* Desktop window sizes and stacking */
  async desktop(b) {
    for (const size of ["s", "m", "l"]) {
      const { ctx, pg } = await boot(b, { mode: "desktop", size });
      const [cols, rows, inside] = await pg.evaluate(() => {
        const D = SELK.desk; D.goto("SHELL"); D.goto("VIEW");
        const log = document.getElementById("log"), cs = getComputedStyle(log), fsz = parseFloat(cs.fontSize);
        const p = document.createElement("span"); p.textContent = "0".repeat(10);
        p.style.position = "absolute"; p.style.whiteSpace = "pre"; log.appendChild(p);
        const ch = p.getBoundingClientRect().width / 10; p.remove();
        const cols = (log.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / ch;
        const rows = (log.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / (1.5 * fsz);
        const back = document.querySelector(".wb-back"), w = D.wins.find((x) => x.kind === "SHELL").el;
        return [cols, rows, w.offsetLeft >= 0 && w.offsetTop >= 0 &&
          w.offsetTop + w.offsetHeight <= back.clientHeight + 1 && w.offsetLeft + w.offsetWidth <= back.clientWidth + 1];
      });
      const S = size.toUpperCase();
      check(`text size ${S}: SHELL is 80 columns`, Math.abs(cols - 80) < 0.6, +cols.toFixed(2));
      check(`text size ${S}: SHELL is 24 lines, or as tall as the desk`, Math.abs(rows - 24) < 0.6 || rows < 23.5, +rows.toFixed(2));
      check(`text size ${S}: SHELL stays inside the desk`, inside);
      await ctx.close();
    }
    const { ctx, pg } = await boot(b, { mode: "desktop" });
    const r = await pg.evaluate(() => {
      const D = SELK.desk;
      ["VIEW", "REPORT", "MAIL", "WATCH", "SHELL", "MESSAGE"].forEach((k) => D.goto(k));
      for (let i = 0; i < 500; i++) { D.front(D.wins[i % D.wins.length]); }
      const z = D.wins.map((w) => +w.el.style.zIndex), top = D.order[0];
      top.el.querySelector(".wb-depth").click();
      const back = +top.el.style.zIndex === Math.min(...D.wins.map((w) => +w.el.style.zIndex));
      D.close(D.wins[0]);
      const z2 = D.wins.map((w) => +w.el.style.zIndex);
      return { max: Math.max(...z), distinct: new Set(z).size === z.length, back, max2: Math.max(...z2), distinct2: new Set(z2).size === z2.length, n: z.length, base: D.z };
    });
    check("z-index stays bounded after 500 raises", r.max <= r.base + r.n, r.max);
    check("z-index values stay distinct", r.distinct);
    check("the depth gadget sends the window to the back", r.back);
    check("closing a window restacks the others", r.max2 <= r.base + r.n - 1 && r.distinct2, r.max2);
    check("no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  },

  /* MSG004 and MSG005 follow what the office has, in both orders, and
     every reply notice joins the "Delivered to Earth" line above it */
  async story(b) {
    for (const order of [["R3A", "R3B"], ["R3B", "R3A"]]) {
      const { ctx, pg } = await boot(b, { shellOut: "shell" });
      const submit = async (k, how) => {
        await pg.evaluate((key) => {
          SELK.state.active = key;
          SELK.REPORTS[key].lines.forEach((ln, i) => SELK.rep.fillBlank(key, i + 1, ln[1][0]));
        }, k);
        await wait(100);
        await pg.evaluate((h) => (h === "typed" ? SELK.run("submit") : SELK.runClick("submit", false)), how);
        await wait(1200);
      };
      await wait(500);
      await submit("R1", "typed");
      await submit("R2", "click");
      /* Report 3 answers are in locked sections, as for the debug panel's UNLOCK ALL */
      await pg.evaluate(() => SELK.SECTIONS.forEach((s) => {
        if (s.locked && SELK.state.unlocked.indexOf(s.id) === -1) { SELK.state.unlocked.push(s.id); }
      }));
      for (const k of order) { await submit(k, "typed"); }
      await wait(500);
      const mail = await pg.evaluate(() => Object.fromEntries(SELK.state.mail.map((m) => [m.id, [m.v || "", SELK.mailBody(m)]])));
      const first = order[0] === "R3A" ? "MSG004" : "MSG005", second = first === "MSG004" ? "MSG005" : "MSG004";
      check(`${order[0]} first: ${first} asks for the other page`, mail[first] && mail[first][0] === "" && mail[first][1].includes("before you decide"));
      check(`${order[0]} first: ${second} reports the other page received`, mail[second] && mail[second][0] === "received" && mail[second][1].includes("who gained"));
      check(`${order[0]} first: REPORT 4 is open`, await pg.evaluate(() => !!SELK.state.reports.R4));
      const gaps = await pg.evaluate(() => [...document.querySelectorAll("#log .out-group.after-tx")].map((g) => {
        const prev = g.previousElementSibling, line = prev.matches(".ln.count") ? prev : prev.lastElementChild;
        return Math.round(g.getBoundingClientRect().top - line.getBoundingClientRect().bottom);
      }));
      check(`${order[0]} first: each reply notice sits under Delivered to Earth with no gap`, gaps.length >= 3 && gaps.every((g) => g === 0), gaps);
      check("no page errors", !pg.errs.length, pg.errs);
      await ctx.close();
    }
    const { ctx, pg } = await boot(b);
    check("a save from before the variants shows the outstanding text",
      await pg.evaluate(() => SELK.mailBody({ id: "MSG004" }) === SELK.MESSAGES.MSG004.body));
    await ctx.close();
  },

  /* A Setup tooltip keeps one size for one text wherever it is placed */
  async tooltips(b) {
    for (const vw of [760, 1366]) {
      const { ctx, pg } = await boot(b, { setupView: "list" }, { vw, vh: 760 });
      await pg.evaluate(() => SELK.settingsDialog()); await wait(300);
      const keys = await pg.evaluate(() => [...new Set([...document.querySelectorAll(
        ".set-row button[data-setting-key][data-value]:not([aria-haspopup])")].map((x) => x.dataset.settingKey))]);
      const bad = [];
      for (const key of keys) {
        const btns = await pg.$$(`.set-row button[data-setting-key="${key}"][data-value]`);
        await btns[0].scrollIntoViewIfNeeded();
        const sizes = {};
        for (const bt of btns.concat(btns.slice().reverse())) {
          const bb = await bt.boundingBox();
          if (!bb) { continue; }
          for (const dx of [0.15, 0.5, 0.85]) {
            await pg.mouse.move(bb.x + bb.width * dx, bb.y + bb.height / 2, { steps: 2 });
            const s = await pg.evaluate(() => {
              const t = document.querySelector(".set-tip");
              return t && !t.hidden ? [t.textContent, t.offsetWidth, t.offsetHeight] : null;
            });
            if (!s) { continue; }
            const prev = sizes[s[0]] || (sizes[s[0]] = [s[1], s[2]]);
            if (prev[0] !== s[1] || prev[1] !== s[2]) { bad.push([key, s[0].slice(0, 20), prev, [s[1], s[2]]]); }
          }
        }
      }
      check(`tooltips keep one size per text on ${keys.length} rows at ${vw} px`, !bad.length, bad.slice(0, 3));
      await ctx.close();
    }
  },

  /* Setup rows hidden where they cannot apply (S.SETTING_RULES) */
  async rows(b) {
    const rowsOf = (pg) => pg.evaluate(() => {
      SELK.state.settings.setupView = "list"; SELK.settingsDialog();
      return [...document.querySelectorAll(".set-row .set-label")].map((n) => n.textContent.trim());
    });
    const ref = await boot(b);
    const all = new Set(await rowsOf(ref.pg));
    await ref.ctx.close();
    for (const [name, settings, opts, hidden] of [
      ["phone with touch", {}, { vw: 390, vh: 760, touch: true }, ["Cursor size", "Layout", "Mode"]],
      ["narrow window with a mouse", {}, { vw: 600, vh: 760 }, ["Layout", "Mode"]],
      ["screen reader mode", { sr: true }, {}, ["Flicker", "Interference", "Motion", "Power-on", "Rolling scanline",
        "Scanlines", "Scroll long messages", "Text appears", "Vignette and curvature"]]
    ]) {
      const { ctx, pg } = await boot(b, settings, opts);
      const shown = new Set(await rowsOf(pg));
      const gone = [...all].filter((r) => !shown.has(r)).sort();
      check(`${name}: hides ${hidden.join(", ")}`, JSON.stringify(gone) === JSON.stringify(hidden.slice().sort()), gone);
      check(`${name}: no page errors`, !pg.errs.length, pg.errs);
      await ctx.close();
    }
    const { ctx, pg } = await boot(b, { sr: true });
    check("screen reader mode keeps Glow, for sighted users", (await rowsOf(pg)).includes("Glow"));
    await ctx.close();
  },

  /* The Romanian pack covers the new interface text */
  async ro(b) {
    const { ctx, pg } = await boot(b, { setupView: "list", errors: "dialog" }, { lang: "ro" });
    const r = await pg.evaluate(() => {
      SELK.settingsDialog();
      const labels = [...document.querySelectorAll(".set-label")].map((n) => n.textContent.trim());
      SELK.closeDialog(); SELK.msg("Copy is not available here", "err");
      return [labels.includes("Mesaje de eroare"), labels.includes("Derulează mesajele lungi"),
        document.querySelector(".err-ov .dlg-title").textContent];
    });
    check("Romanian: the new Setup rows are translated", r[0] && r[1], r);
    check("Romanian: the error dialog title is translated", r[2] === "EROARE", r[2]);
    check("no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  },

  /* Arrow keys and Enter in dialogs */
  async keys(b) {
    for (const mode of ["tmux", "desktop"]) {
      const { ctx, pg } = await boot(b, { mode });
      const focus = () => pg.evaluate(() => (document.activeElement.textContent || document.activeElement.className).trim());
      await pg.evaluate(() => SELK.exitDialog()); await wait(100);
      await pg.keyboard.press("ArrowRight");
      const a = await focus();
      await pg.keyboard.press("ArrowRight");
      const c = await focus();
      await pg.keyboard.press("ArrowRight");
      const w = await focus();
      check(`${mode}: Right moves along the dialog buttons and wraps`, a === "LOG OUT" && c === "CANCEL" && w === "LOG OUT", [a, c, w]);
      await pg.keyboard.press("ArrowLeft");
      check(`${mode}: Left moves back`, await focus() === "CANCEL");
      await pg.keyboard.press("Enter"); await wait(100);
      check(`${mode}: Enter presses the focused button`, await pg.evaluate(() => !SELK.dlg));
      await pg.evaluate(() => SELK.unlockDialog()); await wait(100);
      await pg.keyboard.press("ArrowDown");
      check(`${mode}: Down leaves the password field for the buttons`, await focus() === "UNLOCK");
      await pg.keyboard.press("ArrowUp");
      check(`${mode}: Up returns to the field`, await pg.evaluate(() => document.activeElement.classList.contains("dlg-in")));
      await pg.evaluate(() => SELK.closeDialog());
      await pg.evaluate(() => SELK.settingsDialog()); await wait(200);
      const seen = [];
      for (let i = 0; i < 4; i++) { await pg.keyboard.press("ArrowDown"); seen.push(await focus()); }
      check(`${mode}: Down walks the Setup rows`, new Set(seen).size === 4, seen);
      await pg.evaluate(() => SELK.closeDialog());
      check(`${mode}: no page errors`, !pg.errs.length, pg.errs);
      await ctx.close();
    }
  },

  /* The screen effects cover every interface layer. Only the ending's stage
     covers them, and the debug panel rises above the stage. */
  async layers(b) {
    const { ctx, pg } = await boot(b, { debug: true });
    const r = await pg.evaluate(() => {
      SELK.dialog({ title: "LAYER TEST" }); SELK.errorBox("Layer test");
      const z = (n) => +getComputedStyle(n).zIndex || 0;
      const glass = z(document.querySelector(".glass"));
      const over = [...document.querySelectorAll("#screen > *")]
        .filter((n) => !n.classList.contains("glass") && z(n) >= glass).map((n) => n.className);
      return { glass, over };
    });
    check("no interface layer reaches the effects", r.over.length === 0, r.over);
    const d = await pg.evaluate(() => {
      const panel = document.querySelector(".dbg"), glass = +getComputedStyle(document.querySelector(".glass")).zIndex;
      if (!panel) { return { panel: false }; }
      const before = +getComputedStyle(panel).zIndex;
      const cine = document.createElement("div"); cine.className = "cine"; document.getElementById("screen").appendChild(cine);
      const during = +getComputedStyle(panel).zIndex, stage = +getComputedStyle(cine).zIndex;
      cine.remove();
      return { panel: true, before, during, stage, glass };
    });
    check("the debug panel sits under the effects", d.panel && d.before < d.glass, d);
    check("the debug panel rises above the ending's stage", d.panel && d.during > d.stage && d.stage > d.glass, d);
    await ctx.close();
  },

  /* Shell output of one kind joins one group, and a message read on the
     desktop opens MESSAGE alone */
  async shell(b) {
    const { ctx, pg } = await boot(b, { shellOut: "shell" });
    await wait(500);
    const n = await pg.evaluate(async () => {
      SELK.state.active = "R1";
      const ids = SELK.REPORTS.R1.lines.map((ln) => ln[1][0]);
      SELK.rep.fillBlank("R1", 1, ids[0]); SELK.rep.fillBlank("R1", 2, ids[1]); SELK.rep.unfill(2);
      await SELK.scr.idle();
      return document.querySelectorAll("#log > .out-group[data-kind='report-blank']").length;
    });
    check("blank changes in a row share one group", n === 1, n);
    await ctx.close();
    const d = await boot(b, { mode: "desktop" });
    await wait(500);
    const k = await d.pg.evaluate(() => { SELK.runClick("mail 1", false); return SELK.desk.wins.map((w) => w.kind).filter(Boolean); });
    check("desktop: reading a message opens MESSAGE without MAIL", k.indexOf("MESSAGE") !== -1 && k.indexOf("MAIL") === -1, k);
    check("no page errors", !d.pg.errs.length, d.pg.errs);
    await d.ctx.close();
  },


  /* Setup views. PAGES opens a section, and the settings under a setting,
     on pages that BACK and Escape leave. SECTIONS and FULL LIST show the
     settings under a setting below it. */
  async setup(b) {
    const { ctx, pg } = await boot(b, { setupView: "pages" });
    const where = () => pg.evaluate(() => { const w = document.querySelector(".set-where"); return w ? w.textContent : ""; });
    await pg.evaluate(() => SELK.settingsDialog()); await wait(150);
    await pg.click('.set-nav[data-nav="input"]'); await wait(100);
    check("PAGES: a section opens on its own page, focus on BACK",
      await where() === "TEXT AND INPUT" && await pg.evaluate(() => document.activeElement.dataset.nav === "back"));
    await pg.click('[data-nav="shell"]'); await wait(100);
    const sub = await pg.evaluate(() => [...document.querySelectorAll(".set-row .set-label")].map((n) => n.firstChild.textContent));
    check("PAGES: the line at the bottom opens the SHELL OUTPUT group", await where() === "TEXT AND INPUT / SHELL OUTPUT" &&
      JSON.stringify(sub) === JSON.stringify(["Shell results", "Panel results", "Shell-only DESK", "Redirect notices"]), sub);
    await pg.keyboard.press("Escape"); await wait(100);
    check("PAGES: Escape goes back a page and focuses the button that opened it",
      await where() === "TEXT AND INPUT" && await pg.evaluate(() => document.activeElement.dataset.nav === "shell"));
    await pg.keyboard.press("Escape"); await wait(100);
    check("PAGES: Escape on the first page leaves Setup open at the top", await pg.evaluate(() => !!SELK.dlg) && await where() === "");
    await pg.keyboard.press("Escape"); await wait(100);
    check("PAGES: Escape at the top closes Setup", await pg.evaluate(() => !SELK.dlg));
    for (const view of ["sections", "list"]) {
      const nested = await pg.evaluate((v) => {
        SELK.state.settings.setupView = v; SELK.settingsDialog();
        const box = [...document.querySelectorAll(".set-subgroup")].map((n) => [...n.querySelectorAll(".set-sub-h, .set-label")].map((l) => l.firstChild.textContent));
        SELK.closeDialog();
        return box;
      }, view);
      check(`${view}: every group has a title and two settings or more`,
        nested.some((x) => x.join() === "SHELL OUTPUT,Shell results,Panel results,Shell-only DESK,Redirect notices") && nested.every((x) => x.length > 2), nested);
    }
    await pg.evaluate(() => { SELK.state.settings.setupView = "pages"; SELK.settingsDialog(); });
    await pg.click('.set-nav[data-nav="input"]'); await wait(100);
    await pg.click(".dlg-btns .btn"); await wait(100);
    await pg.evaluate(() => SELK.settingsDialog()); await wait(100);
    check("PAGES: after CLOSE, Setup opens on its first page", await where() === "");
    check("no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  },

  /* Text appears is grayed and at once while motion is reduced, and the
     saved choice returns with full motion */
  async speed(b) {
    const { ctx, pg } = await boot(b, { setupView: "list", speed: "slow", motion: "reduce" });
    const row = () => pg.evaluate(() => {
      SELK.settingsDialog();
      const on = document.querySelector('[data-setting-key="speed"][aria-pressed="true"]');
      const r = [on.textContent, on.disabled, SELK.textSpeed()];
      SELK.closeDialog();
      return r;
    });
    const reduced = await row();
    check("reduced motion: Text appears shows AT ONCE, grayed", reduced[0] === "AT ONCE" && reduced[1] && reduced[2] === "instant", reduced);
    await pg.evaluate(() => SELK.setupKit.setv("motion", "always"));
    const full = await row();
    check("full motion: the saved SLOW returns", full[0] === "SLOW" && !full[1] && full[2] === "slow", full);
    check("no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  },

  /* Control sounds: a marked control plays its kind when ON and the click
     when OFF */
  async sounds(b) {
    for (const on of [true, false]) {
      const { ctx, pg } = await boot(b, { ctlSounds: on });
      await pg.evaluate(() => {
        window.played = [];
        const ui = SELK.snd.ui;
        SELK.snd.ui = function (k) { played.push(k); return ui.apply(this, arguments); };
      });
      await pg.click('.fbar [data-f="9"]'); await wait(200);
      await pg.click('.set-nav[data-nav="sound"]'); await wait(200);
      await pg.click(".set-back"); await wait(200);
      await pg.click('.set-nav[data-nav="sound"]'); await wait(200);
      await pg.keyboard.press("Escape"); await wait(200);
      const got = await pg.evaluate(() => played);
      check(`Control sounds ${on ? "ON" : "OFF"}: ${on ? "key, page, back, page, back on Escape" : "no control sound"}`,
        JSON.stringify(got) === JSON.stringify(on ? ["key", "page", "back", "page", "back"] : []), got);
      if (on) {
        /* A right press activates nothing; UNLOCK sounds as a neutral action,
           since the result is not known yet */
        const r = await pg.evaluate(() => { played.length = 0; return true; });
        const opt = await pg.$('.set-row .opt[data-value="list"]');
        await opt.click({ button: "right" }); await wait(150);
        await pg.keyboard.press("Escape"); await wait(100);
        await pg.evaluate(() => { SELK.closeDialog(); SELK.unlockDialog(); }); await wait(150);
        await pg.click(".dlg-btns .btn:first-child"); await wait(150);
        const got2 = await pg.evaluate(() => played);
        check("right press plays no control sound; UNLOCK plays action", r && JSON.stringify(got2) === JSON.stringify(["action"]), got2);
      } else {
        /* A plain mouse click: the press as the button goes down, the
           release as it comes up */
        await pg.evaluate(() => {
          window.bursts = [];
          SELK.snd.onBurst = function (f) { bursts.push([f, Date.now()]); };
        });
        const bar = await pg.$('.fbar [data-f="9"]'), box = await bar.boundingBox();
        await pg.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await pg.mouse.down(); await wait(150);
        const down = await pg.evaluate(() => bursts.map((x) => x[0]));
        await pg.mouse.up(); await wait(100);
        const all = await pg.evaluate(() => bursts);
        const gap = all.length === 2 ? all[1][1] - all[0][1] : 0;
        check("a mouse click plays the press on down and the release on up",
          JSON.stringify(down) === "[2900]" && all.length === 2 && all[1][0] === 1100 && gap >= 120, [down, all.map((x) => x[0]), gap]);
      }
      check("no page errors", !pg.errs.length, pg.errs);
      await ctx.close();
    }
  },

  /* A phone: the error dialog fits, and no pointer is drawn */
  async phone(b) {
    const { ctx, pg } = await boot(b, { errors: "dialog" }, { vw: 390, vh: 760, touch: true });
    const r = await pg.evaluate(() => {
      SELK.msg("Phone error with a long text that has to wrap inside the dialog on a small screen", "err");
      const d = document.querySelector(".err-ov .dlg").getBoundingClientRect();
      return [d.left >= 0 && d.right <= innerWidth, SELK.ctx().pointer];
    });
    check("phone: the error dialog fits the screen", r[0]);
    check("phone: no drawn pointer is detected", r[1] === false);
    check("no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  },
  /* TROIKA.RUN: loan tranches stay on the road, every year has one, the
     obstacles come at an even distance, the rating stays in the middle of
     the beam over it, the place's ellipsis is gray, and the ending runs
     from 2016 to the end card in both motion modes */
  async troika(b) {
    const { ctx, pg } = await boot(b);
    await pg.evaluate(() => SELK.troika.open()); await wait(300);
    const run = await pg.evaluate(() => {
      /* Greece stays on the pavement, out of the way, so no tranche or hole
         stops the run while the road is measured */
      const T = SELK.troikaGame, finish = T.finish, move = T.move, years = {};
      let maxGap = 0, lastX = null;
      T.finish = () => {}; T.move = () => {};
      T.st.nextGate = 6;
      for (let i = 0; i < 20000 && !T.st.end; i++) {
        const st = T.st;
        st.gap = 0.6;
        T.update(0.02); st.crash = false;
        const added = st.obstacles.concat(st.platforms).filter((o) => o.x > T.W - 2 && !o.seen);
        added.forEach((o) => { o.seen = true; if (o.kind === "tranche") { years[T.yearOf(st.t)] = true; } });
        if (added.some((o) => !o.under && !o.covered)) {
          if (lastX !== null) { maxGap = Math.max(maxGap, st.dist - lastX); }
          lastX = st.dist;
        }
      }
      T.finish = finish; T.move = move;
      return { years: Object.keys(years).length, maxGap: Math.round(maxGap), end: !!T.st.end };
    });
    check("troika: a loan tranche comes every year", run.years === 6, run);
    check("troika: obstacles come no more than 500 pixels apart", run.maxGap > 0 && run.maxGap <= 500, run);
    const kept = await pg.evaluate(() => {
      const T = SELK.troikaGame;
      SELK.troika.close(); SELK.troika.open();
      /* Past the middle of 2011 with no tranche yet, so the next obstacle is one */
      const st = T.st; st.nextGate = 6; st.t = 27; st.spawnAt = 0;
      T.update(0.02);
      const p = st.platforms.find((q) => q.kind === "tranche");
      for (let i = 0; i < 20; i++) { st.gap = 0.6; T.update(0.02); }
      return !!p && st.platforms.indexOf(p) !== -1;
    });
    check("troika: a loan tranche stays on the road after it appears", kept);
    const centred = await pg.evaluate(() => {
      const T = SELK.troikaGame, A = SELK.troikaArt, c = document.createElement("canvas"); c.width = 640; c.height = 320;
      const g = c.getContext("2d"), keep = A.g; A.use(g);
      let ok = true;
      for (let y = 0; y < 6; y++) for (const fx of [0, 0.25, 0.5, 0.75]) {
        const st = T.st; let n = 0;
        do { st.obstacles = []; st.platforms = []; st.recent = []; st.t = y * 16 + 3; st.tranches[y] = true; T.spawn(); n++; } while ((st.obstacles[0] || {}).kind !== "debt" && n < 500);
        st.obstacles.forEach((o) => { o.x += fx - 400; o.bottom = T.GROUND - o.lift; });
        g.clearRect(0, 0, 640, 320); st.obstacles.forEach((o) => A.obstacle(o));
        const xs = (yy, red) => { const d = g.getImageData(0, yy, 640, 1).data, out = []; for (let x = 0; x < 640; x++) { if (d[x * 4 + 3] && (!red || (d[x * 4] > 150 && d[x * 4 + 1] < 100))) { out.push(x); } } return out; };
        const beam = xs(T.GROUND - 78, false), rating = xs(T.GROUND - 8, true);
        if (rating[0] - beam[0] !== beam[beam.length - 1] - rating[rating.length - 1]) { ok = false; }
      }
      A.use(keep); T.st.obstacles = [];
      return ok;
    });
    check("troika: the rating stands in the middle under the beam for every rating", centred);
    const over = await pg.evaluate(() => {
      const T = SELK.troikaGame, A = SELK.troikaArt, D = T.data, c = document.createElement("canvas"); c.width = 640; c.height = 320;
      const g = c.getContext("2d"), keep = A.g, out = [];
      A.use(g);
      for (const fr of D.fragiles()) for (const fx of [0, 0.25, 0.5, 0.75]) {
        const st = T.st; let n = 0;
        do { st.obstacles = []; st.platforms = []; st.recent = []; st.t = fr[2][0] * 16 + 3; st.tranches[fr[2][0]] = true; T.spawn(); n++; }
        while (!(st.platforms[0] && st.platforms[0].style === fr[3]) && n < 2000);
        const pit = st.obstacles[0], p = st.platforms[0];
        pit.x += fx - 400; p.x += fx - 400; pit.bottom = T.GROUND; p.top = T.GROUND - p.lift;
        g.clearRect(0, 0, 640, 320); A.obstacle(pit); A.platform(p);
        const xs = (yy) => { const d = g.getImageData(0, yy, 640, 1).data, r = []; for (let x = 0; x < 640; x++) { if (d[x * 4 + 3]) { r.push(x); } } return r; };
        const hole = xs(T.GROUND + 10), top = [0, 1, 2, 3].map((k) => xs(p.top + k)).reduce((a, b) => a.concat(b), []);
        const left = Math.min.apply(null, top), right = Math.max.apply(null, top);
        out.push([fr[3], fx, left - hole[0], hole[hole.length - 1] - right]);
      }
      A.use(keep); T.st.obstacles = []; T.st.platforms = [];
      return out;
    });
    check("troika: each fragile platform stands in the middle of its hole", over.every((o) => o[2] === o[3] && o[2] > 0), over);
    const grey = await pg.evaluate(() => getComputedStyle(document.querySelector(".troika-title")).color === getComputedStyle(document.querySelector(".troika-place")).color);
    check("troika: the title's ellipsis has the place's gray", grey);
    await ctx.close();
    for (const motion of ["full", "reduce"]) {
      const { ctx: c2, pg: p2 } = await boot(b, { motion });
      await p2.evaluate(() => SELK.troika.open()); await wait(300);
      const end = await p2.evaluate(() => {
        const T = SELK.troikaGame, st = T.st, seen = [];
        cancelAnimationFrame(T.raf);
        st.nextGate = 6; st.t = T.END - 0.2; st.spawnAt = 1e9;
        let answers = 0;
        for (let i = 0; i < 6000 && !st.over; i++) {
          /* In 2097 the player walks Greece to the olive tree, then lets go */
          if (st.end && st.end.phase === "out") { st.keys = { right: st.dist - st.end.d0 < SELK.troikaArt.STOP - 1 }; }
          T.update(0.02);
          if (st.end && seen[seen.length - 1] !== st.end.phase) { seen.push(st.end.phase); }
          if (T.talk.open() && i % 10 === 0) {
            const btns = document.querySelectorAll(".troika-talk-choices button");
            if (btns.length) { answers = btns.length; T.talk.pick(1); } else { T.talk.next(); }
          }
          if (i % 25 === 0) { T.draw(); }
        }
        const card = document.querySelector(".troika-end");
        return { seen: seen.join(","), answers, card: !card.hidden && card.querySelector(".troika-again").textContent, reduced: SELK.reduced };
      });
      check(`troika (${motion} motion): the ending goes from the door to 2097`, end.seen === "door,room,zoom,lapse,out", end);
      check(`troika (${motion} motion): the economist offers four answers`, end.answers === 4, end);
      check(`troika (${motion} motion): the end card offers PLAY AGAIN`, end.card === "PLAY AGAIN", end);
      check(`troika (${motion} motion): no page errors`, !p2.errs.length, p2.errs);
      await c2.close();
    }
  },
  /* DISASSEMBLY.RUN: every repair of both phones can be done with no
     mistake, and the part's ellipsis is gray */
  async disassembly(b) {
    const { ctx, pg } = await boot(b);
    await pg.evaluate(() => SELK.disassembly.open()); await wait(300);
    const res = await pg.evaluate(() => {
      const G = SELK.disassemblyGame, out = [];
      for (const phone of ["fairphone", "samsung"]) {
        for (const part of ["battery", "screen", "usb", "camera"]) {
          G.pickScreen(); G.st.phone = phone; G.st.part = part; G.begin();
          for (let n = 0; n < 300 && !G.st.over; n++) {
            const st = G.st, P = G.PARTS[phone];
            if (st.newPart) { G.fitNew(); }
            else if (st.closing) {
              if (st.pending) { G.useTool("screw", st.pending); }
              else if (phone === "samsung" && G.nextBack() === "cover" && !st.glued) { G.useTool("glue", null); }
              else if (G.nextBack()) { G.putBack(G.nextBack()); }
              else { G.pressPower(); }
            } else if (st.on) { G.pressPower(); }
            else {
              const id = G.nextPart(), done = st.done[id] || [];
              if (done.length < P[id].needs.length) { G.useTool(P[id].needs[done.length], id); } else { G.pull(id); }
            }
          }
          out.push(phone + " " + part + ": " + (G.st.over ? G.st.mistakes + " mistakes" : "not done"));
        }
      }
      return out;
    });
    check("disassembly: every repair ends with no mistake", res.every((r) => / 0 mistakes$/.test(r)), res);
    const grey = await pg.evaluate(() => getComputedStyle(document.querySelector(".dis-title")).color === getComputedStyle(document.querySelector(".dis-sub")).color);
    check("disassembly: the title's ellipsis has the part's gray", grey);
    check("disassembly: no page errors", !pg.errs.length, pg.errs);
    await ctx.close();
  }
};

(async () => {
  const names = process.argv[2] ? process.argv[2].split(",") : Object.keys(GROUPS);
  const unknown = names.filter((n) => !GROUPS[n]);
  if (unknown.length) {
    console.error("Unknown group: " + unknown.join(", ") + ". Groups: " + Object.keys(GROUPS).join(", "));
    process.exit(2);
  }
  const server = await serve();
  BASE = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch();
  for (const n of names) {
    console.log("\n# " + n);
    try { await GROUPS[n](browser); } catch (e) { check(n + " ran to the end", false, String(e).slice(0, 300)); }
  }
  await browser.close();
  server.close();
  const passed = results.filter(Boolean).length;
  console.log(`\n${passed} of ${results.length} passed`);
  process.exit(passed === results.length ? 0 : 1);
})();
