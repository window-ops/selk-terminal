#!/usr/bin/env node
/* Renders a trailer's soundtrack:

     node common/lib/audio.js feature|gameplay -> out/build/<trailer>/soundtrack.wav

   Opens common/lib/audio-stage.html in headless Chromium, where the game's
   sound engine (common/vendor/audio) and the trailer's score
   (<trailer>-trailer/audio/score.js, after its written notes in cue.js
   when there is one) render on an OfflineAudioContext the
   length of the trailer, and writes the result as a 48 kHz stereo 16-bit WAV. */
"use strict";
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }

/* file: the WAV to write; score: the score's script; seconds: the length */
async function renderAudio(file, score, seconds) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("audio: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") console.log("audio: " + m.text()); });
  /* A score may be written out as notes in cue.js beside it */
  const cue = path.join(path.dirname(score), "cue.js"), q = { seconds: String(seconds), score: path.relative(__dirname, score).replace(/\\/g, "/") };
  if (fs.existsSync(cue)) q.cue = path.relative(__dirname, cue).replace(/\\/g, "/");
  await page.goto(pathToFileURL(path.join(__dirname, "audio-stage.html")).href + "?" + new URLSearchParams(q));
  const r = await page.evaluate(() => window.RENDER);
  await browser.close();
  if (!r) throw new Error("the soundtrack did not render; see the errors above");
  const pcm = Buffer.from(r.pcm, "base64"), head = Buffer.alloc(44);
  head.write("RIFF", 0); head.writeUInt32LE(36 + pcm.length, 4); head.write("WAVE", 8);
  head.write("fmt ", 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22);
  head.writeUInt32LE(r.rate, 24); head.writeUInt32LE(r.rate * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34);
  head.write("data", 36); head.writeUInt32LE(pcm.length, 40);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([head, pcm]));
  return { seconds: pcm.length / 4 / r.rate, peak: r.peak };
}

module.exports = { renderAudio };
if (require.main === module) {
  const name = process.argv[2] || "feature", root = path.join(__dirname, "..", "..");
  const T = require(path.join(root, name + "-trailer", "timeline"));
  const file = path.join(root, "out", "build", name, "soundtrack.wav");
  renderAudio(file, path.join(root, name + "-trailer", "audio", "score.js"), T.seconds)
    .then((r) => console.log("wrote " + path.relative(root, file) + ", " + r.seconds.toFixed(2) + " s, peak " + r.peak.toFixed(3)));
}
