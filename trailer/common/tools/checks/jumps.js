/* Steps a shot at 60 fps and lists the frames where the drawn cursor moves
   more than limit screen px (60 by default) from one frame to the next, and
   the largest move. It measures the pointer's tip, so a change of cursor
   shape is not counted: node jumps.js <trailer> <shot> [limit] */
let chromium, devices;
try { ({ chromium, devices } = require("playwright")); } catch (e) { ({ chromium, devices } = require("/opt/node-tools/node_modules/playwright")); }
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const [trailer, shot, lim] = process.argv.slice(2);
(async () => {
    const lib = path.join(trailer, "common", "lib");
  const snaps = fs.readdirSync(path.join(trailer, "common", "snapshots")).map((f) => f.slice(0, -3));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  page.on("pageerror", (e) => console.log("error: " + e.message));
  await page.goto(pathToFileURL(path.join(lib, "stage.html")).href + "?" + new URLSearchParams({ shot: path.relative(lib, shot).replace(/\.js$/, ""), snaps: snaps.join(","), build: "" }));
  await page.waitForFunction(() => window.SHOT && document.fonts.status === "loaded");
  const out = await page.evaluate((lim) => {
    const n = Math.round(SHOT.seconds * 60), res = [];
    let prev = null, maxv = 0;
    for (let f = 0; f < n; f++) {
      SHOT.seek(f / 60);
      /* The pointer's tip, which stays put when the cursor changes shape */
      const p = SIM.pointer();
      if (p && prev) { const d = Math.hypot(p[0] - prev[0], p[1] - prev[1]); maxv = Math.max(maxv, d); if (d > lim) res.push([(f / 60).toFixed(3), Math.round(d)]); }
      prev = p;
    }
    return { maxv: Math.round(maxv), jumps: res };
  }, +(lim || 60));
  console.log(path.basename(shot), JSON.stringify(out));
  await browser.close();
})();
