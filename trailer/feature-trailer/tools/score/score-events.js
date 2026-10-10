/* Records every note the feature score plays: node score-events.js <trailer folder> <out.json>
   A copy of the score with each musical voice logged (bells, pad, bass,
   plucks, kick, drones) is loaded on the audio stage, and the log is saved
   as soon as the score is built. Times are the score's written times
   (score.js schedules those from 5 s on 0.5 s earlier) */
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const [trailer, out] = process.argv.slice(2);
const src = path.join(trailer, "feature-trailer", "audio", "score.js"), tmp = path.join(trailer, "feature-trailer", "audio", "_log.js");
let s = fs.readFileSync(src, "utf8");
const hook = (sig, entry) => { if (s.indexOf(sig) < 0) throw new Error("not found: " + sig); s = s.replace(sig, sig + " LOG.push(" + entry + ");"); };
s = s.replace('"use strict";', '"use strict"; window.LOG = [];');
hook("function bell(f, t, peak, dest) {", '["bell", [f], t, 0, peak]');
hook("function pad(chord, t, dur, peak) {", '["pad", CHORDS[chord], t, dur, peak, chord]');
hook("function bass(f, t, dur, peak) {", '["bass", [f], t, dur, peak]');
hook("function pluck(f, t, peak) {", '["pluck", [f], t, 0.45, peak]');
hook("function thump(t, peak) {", '["kick", [], t, 0.3, peak]');
hook("function drone(f, t, dur, peak, a, rel) {", '["drone", [f], t, dur, peak]');
fs.writeFileSync(tmp, s);
(async () => {
  const browser = await chromium.launch(), page = await browser.newPage();
  page.on("pageerror", (e) => console.log("error: " + e.message));
  const lib = path.join(trailer, "common", "lib");
  await page.goto(pathToFileURL(path.join(lib, "audio-stage.html")).href + "?" + new URLSearchParams({ seconds: "87.25", score: path.relative(lib, tmp) }));
  await page.waitForFunction(() => window.RENDER && window.LOG && window.LOG.length);
  const log = await page.evaluate(() => window.LOG);
  fs.writeFileSync(out, JSON.stringify({ log }));
  console.log("notes", log.length);
  await browser.close();
  fs.unlinkSync(tmp);
})();
