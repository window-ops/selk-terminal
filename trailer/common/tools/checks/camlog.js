/* Prints the camera of a shot at chosen times: node camlog.js <trailer> <shot> t1 t2 ... */
let chromium, devices;
try { ({ chromium, devices } = require("playwright")); } catch (e) { ({ chromium, devices } = require("/opt/node-tools/node_modules/playwright")); }
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const [trailer, shot, ...ts] = process.argv.slice(2);
(async () => {
    const lib = path.join(trailer, "common", "lib");
  const snaps = fs.readdirSync(path.join(trailer, "common", "snapshots")).map((f) => f.slice(0, -3));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  page.on("pageerror", (e) => console.log("error: " + e.message));
  await page.goto(pathToFileURL(path.join(lib, "stage.html")).href + "?" + new URLSearchParams({ shot: path.relative(lib, shot).replace(/\.js$/, ""), snaps: snaps.join(","), build: "" }));
  await page.waitForFunction(() => window.SHOT && document.fonts.status === "loaded");
  for (const t of ts.map(Number)) {
    const r = await page.evaluate((t) => { SHOT.seek(t); return document.getElementById("world").style.transform; }, t);
    console.log(t, r);
  }
  await browser.close();
})();
