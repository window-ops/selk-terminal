#!/usr/bin/env node
/* Checks the interface fixes of October 2026 in Chromium, at 1920 by 1080:

     node tools/check-fixes.js [png]

   1. Cursors: a FILES row of a section that cannot fill a blank (Home)
      shows the plain hand and no drag description for screen readers; a
      row that can (Site) shows the hand with drag dots. A link to an entry
      of Home in entry text shows the plain hand; a link to Site keeps the
      dots.
   2. Rejected answers: a wrong password marks the UNLOCK dialog's field in
      the error color with aria-invalid, keeps the typed text, and clears
      the mark when the field is edited; the Design key boxes and the
      History sort choices are marked the same way.
   png, if given, receives a picture of the rejected password dialog.
   Prints one line per check and the page errors; exit code 1 when a check
   fails. Uses Playwright (npm install --no-save playwright). */
"use strict";
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const game = path.join(__dirname, ".."), png = process.argv[2];
let failed = 0;
const check = (name, ok, info) => { if (!ok) failed++; console.log((ok ? "PASS " : "FAIL ") + name + (info ? "  " + JSON.stringify(info) : "")); };
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("file://" + path.join(game, "index.html"));
  await page.waitForSelector("button.title-go");
  await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
  await page.click("button.title-go");
  await page.waitForFunction(() => SELK.mode === "login");
  await page.keyboard.type("Cornelius"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  /* The cursor a node shows, by name */
  await page.evaluate(() => {
    window.__cur = (n) => {
      const u = (s) => (/url\("?(.*?)"?\)/.exec(s) || [])[1], b = getComputedStyle(document.body), c = u(getComputedStyle(n).cursor);
      return c === u(b.getPropertyValue("--cur-hand")) ? "hand" : c === u(b.getPropertyValue("--cur-handdrag")) ? "handdrag" : "other";
    };
  });
  const row = (sec) => page.evaluate((sec) => new Promise((ok) => {
    SELK.ex.goSection(sec);
    setTimeout(() => { const r = document.querySelector(".mc-panel:nth-child(2) .mc-row[data-entry]"); ok({ cursor: __cur(r), described: !!r.getAttribute("aria-description") }); }, 400);
  }), sec);
  const home = await row("home"), site = await row("site");
  check("Home row: plain hand, no drag description", home.cursor === "hand" && !home.described, home);
  check("Site row: hand with drag dots, drag description", site.cursor === "handdrag" && site.described, site);
  const links = await page.evaluate(() => {
    const host = document.createElement("div"); document.querySelector("#screen").appendChild(host);
    SELK.scr.markup("[[home/README]] and [[site/SELK]]", host);
    return [...host.querySelectorAll(".lnk[data-entry]")].map((l) => __cur(l));
  });
  check("Links: Home entry plain hand, Site entry dots", links[0] === "hand" && links[1] === "handdrag", links);
  /* The password dialog */
  await page.evaluate(() => SELK.unlockDialog("archive"));
  await page.waitForSelector(".dlg .dlg-in");
  await page.fill(".dlg .dlg-in", "selk");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const field = () => page.evaluate(() => { const f = document.querySelector(".dlg .dlg-in"); return { value: f.value, rejected: f.classList.contains("rejected"), invalid: f.getAttribute("aria-invalid"), color: getComputedStyle(f).color }; });
  const after = await field();
  check("Wrong password: field marked, text kept", after.rejected && after.invalid === "true" && after.value === "selk" && after.color === "rgb(192, 96, 74)", after);
  if (png) await page.screenshot({ path: png, clip: { x: 600, y: 440, width: 720, height: 200 } });
  await page.keyboard.type("x");
  const edited = await field();
  check("Editing clears the mark", !edited.rejected && !edited.invalid, edited);
  await page.keyboard.press("Escape");
  /* The Design key and the History sort */
  await page.evaluate(() => { SELK.state.endings = ["x"]; SELK.unlockDialog("design"); });
  await page.waitForSelector(".dlg .key-box");
  await page.fill(".dlg .key-box", "AB");
  await page.click(".dlg .dlg-btns .btn");
  await page.waitForTimeout(200);
  const keys = await page.evaluate(() => [...document.querySelectorAll(".dlg .key-box")].map((b) => b.classList.contains("rejected")));
  check("Wrong key: every box marked", keys.length > 1 && keys.every(Boolean), keys);
  await page.keyboard.press("Escape");
  await page.evaluate(() => { SELK.state.unlocked.push("design"); SELK.unlockDialog("history"); });
  await page.waitForSelector(".dlg .sort-choices .btn");
  await page.click(".dlg .sort-choices .btn");
  await page.click(".dlg .dlg-btns .btn");
  await page.waitForTimeout(200);
  const pressed = () => page.evaluate(() => [...document.querySelectorAll(".dlg .sort-choices .btn[aria-pressed='true']")].map((b) => b.classList.contains("rejected")));
  const sortMarked = await pressed();
  check("Wrong sort: pressed choice marked", sortMarked.length === 1 && sortMarked[0], sortMarked);
  await page.click(".dlg .sort-lines li:first-child .sort-choices .btn:nth-child(2)");
  const sortChanged = await pressed();
  check("Changing a choice clears the mark", sortChanged.length === 1 && !sortChanged[0], sortChanged);
  check("No page errors", !errs.length, errs);
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();
