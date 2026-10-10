/* Records every note the gameplay score plays: node score-events.js <trailer folder> <out.json>
   A copy of the score with each voice logged is rendered on the audio
   stage; the log and the score's clock (T at every eighth of a beat, to
   the stop) are saved */
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const [trailer, out] = process.argv.slice(2);
const src = path.join(trailer, "gameplay-trailer", "audio", "score.js"), tmp = path.join(trailer, "gameplay-trailer", "audio", "_log.js");
let s = fs.readFileSync(src, "utf8");
const hook = (sig, entry) => { if (s.indexOf(sig) < 0) throw new Error("not found: " + sig); s = s.replace(sig, sig + " LOG.push(" + entry + ");"); };
s = s.replace('"use strict";', '"use strict"; window.LOG = [];');
hook("function pluck(f, t, v, len) {", '["pluck", f, t, len || 1.2, v]');
hook("function mallet(f, t, v, where, soft) {", '["mallet", f, t, 1.6, v]');
hook("function padVoice(f, t, dur, v, attack, where) {", '["pad", f, t, dur, v]');
hook("function bass(f, t, dur, v) {", '["bass", f, t, dur, v]');
hook("function thump(t, v) {", '["kick", 0, t, 0.3, v]');
hook("function brush(t, v, swish) {", '["brush", 0, t, 0.12, v]');
s = s.replace("  /* The game's sounds, at their times on the timeline", "  window.BEATS = []; for (let x = 0; T(x) <= STOP + 1e-6; x += 0.125) window.BEATS.push([x, T(x)]);\n  /* The game's sounds, at their times on the timeline");
fs.writeFileSync(tmp, s);
(async () => {
  const browser = await chromium.launch(), page = await browser.newPage();
  page.on("pageerror", (e) => console.log("error: " + e.message));
  const lib = path.join(trailer, "common", "lib");
  const cue = path.join(trailer, "gameplay-trailer", "audio", "cue.js"), q = { seconds: "68.2", score: path.relative(lib, tmp) };
  if (fs.existsSync(cue)) q.cue = path.relative(lib, cue);
  await page.goto(pathToFileURL(path.join(lib, "audio-stage.html")).href + "?" + new URLSearchParams(q));
  await page.waitForFunction(() => window.BEATS && window.BEATS.length);
  const r = await page.evaluate(() => ({ log: window.LOG, beats: window.BEATS }));
  fs.writeFileSync(out, JSON.stringify(r));
  console.log("notes", r.log.length);
  await browser.close();
  fs.unlinkSync(tmp);
})();
