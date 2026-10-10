#!/usr/bin/env node
/* Checks the phone fixes of October 2026 in Chromium with Playwright's
   phone profiles (touch, small screens):

     node tools/check-phone.js [folder for screenshots]

   1. FILES on an iPhone SE, History open (14 entries): the list is held to
      its panel and scrolls under a finger swipe, and the strip under it is
      opaque, so no row shows through.
   2. TROIKA.RUN on a Pixel 7 upright, an iPhone SE upright and a Pixel 7
      sideways: the canvas fits inside its window, the window takes all but
      a narrow margin of the screen, and the controls stay on one row.
   Prints one line per check; exit code 1 when a check fails. Uses
   Playwright (npm install --no-save playwright). */
"use strict";
const path = require("path"), fs = require("fs");
let chromium, devices;
try { ({ chromium, devices } = require("playwright")); } catch (e) { ({ chromium, devices } = require("/opt/node-tools/node_modules/playwright")); }
const game = path.join(__dirname, ".."), out = process.argv[2];
let failed = 0;
const check = (name, ok, info) => { if (!ok) failed++; console.log((ok ? "PASS " : "FAIL ") + name + (info ? "  " + JSON.stringify(info) : "")); };
if (out) fs.mkdirSync(out, { recursive: true });

/* A phone with a signed-in game, Design and History open */
async function phone(browser, dev, sideways) {
  const d = { ...devices[dev] };
  if (sideways) d.viewport = { width: d.viewport.height, height: d.viewport.width };
  const ctx = await browser.newContext(d), page = await ctx.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("file://" + path.join(game, "index.html"));
  await page.waitForSelector("button.title-go");
  await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
  await page.tap("button.title-go");
  await page.waitForFunction(() => SELK.mode === "login");
  await page.keyboard.type("Cornelius"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const S = SELK; if (S.dismissMailToast) S.dismissMailToast();
    S.state.endings = ["x"]; ["design", "history"].forEach((id) => S.state.unlocked.push(id)); S.save();
  });
  return { ctx, page, errs };
}

(async () => {
  const browser = await chromium.launch();
  /* 1. The file list */
  {
    const { ctx, page, errs } = await phone(browser, "iPhone SE");
    await page.evaluate(() => { SELK.ui.open("FILES"); SELK.ex.goSection("history"); });
    await page.waitForTimeout(600);
    const list = () => page.evaluate(() => {
      const l = [...document.querySelectorAll(".mc-panel:nth-child(2) .mc-list")].find((n) => n.offsetParent), r = l.getBoundingClientRect();
      return { scrollHeight: l.scrollHeight, height: l.clientHeight, top: l.scrollTop, x: r.x + r.width / 2, y: r.y + r.height * 0.8, h: r.height, strip: getComputedStyle(document.querySelector(".mc-mini")).backgroundColor };
    });
    const before = await list();
    check("List held to its panel", before.scrollHeight > before.height, before);
    check("Strip under the list is opaque", before.strip !== "rgba(0, 0, 0, 0)", before.strip);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: before.x, y: before.y }] });
    for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: before.x, y: before.y - i * before.h * 0.06 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(500);
    const after = await list();
    check("A swipe scrolls the list", after.top > 0, after.top);
    if (out) await page.screenshot({ path: path.join(out, "files-history.png") });
    check("No page errors (list)", !errs.length, errs);
    await ctx.close();
  }
  /* 2. TROIKA.RUN */
  for (const [dev, sideways] of [["Pixel 7", false], ["iPhone SE", false], ["Pixel 7", true]]) {
    const name = dev + (sideways ? " sideways" : "");
    const { ctx, page, errs } = await phone(browser, dev, sideways);
    await page.evaluate(() => SELK.run("open history/TROIKA.RUN", false));
    await page.waitForTimeout(2500);
    const m = await page.evaluate(() => {
      const box = document.querySelector(".troika"), cv = box.querySelector("canvas"), keys = box.querySelector(".troika-keys");
      const tops = [...keys.children].map((k) => Math.round(k.getBoundingClientRect().top));
      return { screen: [innerWidth, innerHeight], box: Math.round(box.getBoundingClientRect().width), canvas: Math.round(cv.getBoundingClientRect().width), rows: new Set(tops).size };
    });
    check(name + ": canvas inside its window", m.canvas <= m.box, m);
    check(name + ": window fills the screen but a narrow margin", sideways ? m.box >= 0.8 * m.screen[0] || m.canvas >= m.screen[1] * 1.6 : m.box >= m.screen[0] - 16, m);
    check(name + ": controls on one row", m.rows === 1, m.rows);
    if (out) await page.screenshot({ path: path.join(out, "troika-" + dev.replace(/ /g, "-") + (sideways ? "-sideways" : "") + ".png") });
    check(name + ": no page errors", !errs.length, errs);
    await ctx.close();
  }
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();
