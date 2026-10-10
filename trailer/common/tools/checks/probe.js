/* Evaluates an expression on the stage with a snapshot loaded:
   node probe.js <trailer dir> <snapshot> '<expression using SIM and parts>' */
let chromium, devices;
try { ({ chromium, devices } = require("playwright")); } catch (e) { ({ chromium, devices } = require("/opt/node-tools/node_modules/playwright")); }
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const [trailer, snap, expr] = process.argv.slice(2);
(async () => {
    const lib = path.join(trailer, "common", "lib");
  const view = path.join(lib, "_probe-view.js");
  fs.writeFileSync(view, '(function () { window.parts = SIM.use(' + JSON.stringify(snap) + '); SIM.camera(0, 0, 1920); window.SHOT = { seconds: 1, seek() {} }; })();');
  const snaps = fs.readdirSync(path.join(trailer, "common", "snapshots")).map((f) => f.slice(0, -3));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  page.on("pageerror", (e) => console.log("error: " + e.message));
  await page.goto(pathToFileURL(path.join(lib, "stage.html")).href + "?" + new URLSearchParams({ shot: path.relative(lib, view).replace(/\.js$/, ""), snaps: snaps.join(","), build: "" }));
  await page.waitForFunction(() => window.SHOT && document.fonts.status === "loaded");
  await page.evaluate(() => document.fonts.load('15.5px "Plex Mono"'));
  console.log(JSON.stringify(await page.evaluate(expr)));
  await browser.close();
  fs.unlinkSync(view);
})();
