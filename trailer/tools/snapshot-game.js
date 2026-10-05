#!/usr/bin/env node
/* Captures the game's own markup for the screens the trailer simulates,
   so the simulation is laid out exactly as the game lays it out:

     node tools/snapshot-game.js <path to the game's folder>

   It runs the game once in headless Chromium, signs in as Cornelius with
   every section open, puts each screen in the state the trailer shows,
   and writes its markup, without scripts, to shots/snapshots/<name>.js
   (SNAP[name] = { html, root, body }: the screen's markup and the
   attributes of the html and body elements), loaded by shots/lib/stage.html. The game is needed only for this
   step; the build uses the snapshots and the game's CSS in vendor/css. */
"use strict";
const fs = require("fs"), path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const game = path.resolve(process.argv[2] || "../selk-terminal");
const OUT = path.join(__dirname, "..", "shots", "snapshots");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  page.on("pageerror", (e) => console.log("game:", e.message));
  await page.goto("file://" + path.join(game, "index.html"));
  await page.waitForSelector("button.title-go");
  await page.waitForTimeout(800);
  const save = async (name, fix) => {
    await page.waitForTimeout(600);
    const snap = await page.evaluate(() => {
      const screen = document.querySelector("#screen").cloneNode(true);
      screen.querySelectorAll("script, input").forEach((n) => n.remove());
      const attrs = (el) => Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));
      return { html: screen.outerHTML, root: attrs(document.documentElement), body: attrs(document.body) };
    });
    fs.writeFileSync(path.join(OUT, name + ".js"), "/* The game's own markup, captured by tools/snapshot-game.js */\n(window.SNAP = window.SNAP || {})[" + JSON.stringify(name) + "] = " + JSON.stringify(snap) + ";\n");
    console.log("wrote " + name);
  };
  await save("title");
  /* Sign in: no tour, the boot shown at once */
  await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
  await page.click("button.title-go");
  await page.waitForFunction(() => SELK.mode === "login");
  await save("boot");
  await page.keyboard.type("Cornelius"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  /* Every section open, as in the recordings after DEBUG > UNLOCK ALL */
  await page.evaluate(() => {
    const S = SELK;
    S.sections().forEach((s) => { if (s.locked && S.state.unlocked.indexOf(s.id) === -1) S.state.unlocked.push(s.id); });
    ["design", "history"].forEach((id) => { if (S.state.unlocked.indexOf(id) === -1) S.state.unlocked.push(id); });
    S.save();
  });
  await page.reload();
  await page.waitForSelector("button.title-go");
  await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
  await page.click("button.title-go");
  await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { SELK.state.settings.fast = false; });
  /* The desk: STRUCTURE / STOPPED-REPAIRS in VIEW, STRUCTURE open in FILES */
  await page.evaluate(() => SELK.run("open structure/STOPPED-REPAIRS", false, "typed"));
  await page.waitForTimeout(800);
  const clickRow = (text) => page.evaluate((text) => {
    const rows = [...document.querySelectorAll("#screen *")].filter((n) => n.children.length < 4 && n.textContent.trim().indexOf(text) === 0 && n.offsetParent && n.getBoundingClientRect().left < 420);
    const r = rows.sort((a, b) => a.textContent.length - b.textContent.length)[0];
    if (r) r.click(); return !!r;
  }, text);
  console.log("structure row", await clickRow("STRUCTURE"));
  await save("desk-structure");
  console.log("history row", await clickRow("HISTORY"));
  await save("desk-history");
  /* WATCH */
  await page.evaluate(() => SELK.run("watch", false, "typed"));
  await page.waitForTimeout(1200);
  await save("watch");
  await browser.close();
})();
