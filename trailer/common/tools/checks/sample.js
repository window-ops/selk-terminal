/* Renders chosen frames of one screen shot (numbered at 60 a second) to PNG:
   node sample.js <trailer dir> <shot script> <build dir> <out dir> n1 n2 ... */
let chromium, devices;
try { ({ chromium, devices } = require("playwright")); } catch (e) { ({ chromium, devices } = require("/opt/node-tools/node_modules/playwright")); }
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const [trailer, shot, build, outDir, ...ns] = process.argv.slice(2);
(async () => {
    let address;
  const lib = path.join(trailer, "common", "lib");
  const snaps = fs.readdirSync(path.join(trailer, "common", "snapshots")).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));
  address = pathToFileURL(path.join(lib, "stage.html")).href + "?" + new URLSearchParams({
    shot: path.relative(lib, shot).replace(/\.js$/, ""), snaps: snaps.join(","), build: pathToFileURL(build).href });
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  page.on("pageerror", (e) => console.log("error: " + e.message));
  await page.goto(address);
  await page.waitForFunction(() => window.SHOT && document.fonts.status === "loaded");
  await page.evaluate(() => Promise.all([document.fonts.load('15.5px "Plex Mono"'), document.fonts.load('500 15.5px "Plex Mono"'), document.fonts.load('160px "VT323"')]));
  for (const n of ns.map(Number)) {
    const m = await page.evaluate((t) => { window.SHOT.seek(t); return SIM.mouse(); }, n / 60);
    await page.mouse.move(m[0], m[1]);
    await page.evaluate(() => Promise.all([...document.querySelectorAll("canvas.live")].map((el) => new Promise((ok) => {
      const m = /url\("?(.*?)"?\)/.exec(el.style.backgroundImage); if (!m) return ok();
      const i = new Image(); i.onload = i.onerror = ok; i.src = m[1]; }))));
    await page.screenshot({ path: path.join(outDir, String(n).padStart(4, "0") + ".png") });
  }
  await browser.close();
})();
