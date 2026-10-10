/* Renders a simulated game-screen shot to PNG frames: opens
   common/lib/stage.html in headless Chromium, laid out at 1920 by 1080 and
   drawn at the trailer's size, with the
   shot's script, the captured screens and the build folder in the address,
   waits for the game's fonts, then for each frame sets the shot's time
   and takes the picture. Every frame depends only on its time, so the
   frames are shared out over several pages that render side by side. The
   page does all the drawing (sim.js, desk.js and the shot's script);
   this only steps the time. */
"use strict";
const fs = require("fs"), path = require("path"), os = require("os"), { pathToFileURL } = require("url");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }

/* script: the shot's file; build: the trailer's build folder; scale: the
   frames' size against 1920 by 1080 (4/3 for 2560 by 1440, 0.5 for review drafts) */
async function renderShot(script, dir, fps, build, scale) {
  const name = path.basename(script, ".js");
  const snaps = fs.readdirSync(path.join(__dirname, "..", "snapshots")).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));
  const address = pathToFileURL(path.join(__dirname, "stage.html")).href + "?" + new URLSearchParams({
    shot: path.relative(__dirname, script).replace(/\\/g, "/").replace(/\.js$/, ""),
    snaps: snaps.join(","),
    build: pathToFileURL(build).href
  });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale || 1 });
  const workers = Math.max(1, Math.min(6, os.cpus().length));
  const pages = await Promise.all(Array.from({ length: workers }, async () => {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log(name + ": " + e.message));
    await page.goto(address);
    await page.waitForFunction(() => window.SHOT && document.fonts.status === "loaded");
    await page.evaluate(() => Promise.all([document.fonts.load('15.5px "Plex Mono"'), document.fonts.load('500 15.5px "Plex Mono"'), document.fonts.load('160px "VT323"')]));
    return page;
  }));
  const seconds = await pages[0].evaluate(() => window.SHOT.seconds), frames = Math.round(seconds * fps);
  await Promise.all(pages.map(async (page, k) => {
    for (let n = k; n < frames; n += workers) {
      const m = await page.evaluate((t) => { window.SHOT.seek(t); return SIM.mouse(); }, n / fps);
      await page.mouse.move(m[0], m[1]);
      /* Pictures loaded by the frame (the WATCH live feed) are in place */
      await page.evaluate(() => Promise.all([...document.querySelectorAll("canvas.live")].map((el) => new Promise((ok) => {
        const m = /url\("?(.*?)"?\)/.exec(el.style.backgroundImage); if (!m) return ok();
        const i = new Image(); i.onload = i.onerror = ok; i.src = m[1];
      }))));
      await page.screenshot({ path: path.join(dir, String(n).padStart(4, "0") + ".png") });
    }
  }));
  await browser.close();
  return { seconds, frames };
}

module.exports = { renderShot };
