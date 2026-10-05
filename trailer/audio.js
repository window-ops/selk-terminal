#!/usr/bin/env node
/* Renders the soundtrack: node audio.js -> out/selk-trailer.wav

   Opens audio/stage.html in headless Chromium, where the game's sound
   engine (vendor/audio) and the trailer's score (audio/score.js) render
   on an OfflineAudioContext the length of the trailer, and writes the
   result as a 48 kHz stereo 16-bit WAV. */
"use strict";
const fs = require("fs"), path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }

async function renderAudio(file) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("audio: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") console.log("audio: " + m.text()); });
  await page.goto("file://" + path.join(__dirname, "audio", "stage.html"));
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
  renderAudio(path.join(__dirname, "out", "selk-trailer.wav")).then((r) => console.log("wrote out/selk-trailer.wav, " + r.seconds.toFixed(2) + " s, peak " + r.peak.toFixed(3)));
}
