#!/usr/bin/env node
/* Builds the trailer: node build.js -> out/selk-trailer.mp4

   1. Draws every animation's frames (animations/), running the support
      check, and stops if a frame fails it.
   2. Renders every simulated game screen (shots/) in headless Chromium;
      the WATCH screen uses the MAST-01 frames from step 1.
   3. Turns each shot into a segment at the trailer's size and rate: the
      archive scenes, 128 by 64, scaled 15 times to 1920 by 960 on the
      backdrop; the camera scenes, 160 by 90, scaled 12 times to fill the
      frame; pixels kept sharp; each 8 fps frame held for 7.5 frames of 60.
   4. Joins the segments in timeline order.
   5. Renders the soundtrack (audio.js), brings it to -16 LUFS (measured
      with ffmpeg's loudnorm, then raised by one gain, its peaks held under
      -1.5 dB by a limiter), and muxes it in as AAC.

   node build.js --only <name> renders that one shot to out/preview/. */
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync, spawnSync } = require("child_process");
const { renderScene } = require("./animations/lib/frames");
const { renderShot } = require("./shots/lib/render");
const { renderAudio } = require("./audio");
const T = require("./timeline");
let FFMPEG = "ffmpeg";
try { FFMPEG = require("ffmpeg-static") || FFMPEG; } catch (e) { /* the ffmpeg on the PATH */ }

const OUT = path.join(__dirname, "out", "build");
const ffmpeg = (args) => execFileSync(FFMPEG, ["-v", "error", "-y"].concat(args));
const encode = ["-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(T.fps), "-video_track_timescale", "15360"];
const only = process.argv.indexOf("--only") > 0 ? process.argv[process.argv.indexOf("--only") + 1] : null;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const shots = T.shots.filter((s) => !only || s.scene === only || s.screen === only || (only && s.scene === "mast"));
  /* 1. The animations */
  let problems = [];
  const info = {};
  shots.filter((s) => s.scene).forEach((s) => {
    const r = renderScene(s.scene, path.join(OUT, "frames", s.scene));
    problems = problems.concat(r.problems);
    info[s.scene] = r.scene;
  });
  if (problems.length) {
    console.log([...new Set(problems)].join("\n"));
    console.log("stopped: frames fail the support check");
    process.exit(1);
  }
  /* 2. The game screens */
  for (const s of shots.filter((s) => s.screen)) {
    const dir = path.join(OUT, "screens", s.screen);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now();
    info[s.screen] = await renderShot(s.screen, dir, T.fps);
    console.log("rendered " + s.screen + " in " + Math.round((Date.now() - t0) / 1000) + " s");
  }
  /* 3. The segments */
  let at = 0;
  const list = [];
  const order = only ? shots.filter((s) => s.scene === only || s.screen === only) : shots;
  order.forEach((shot, i) => {
    const name = shot.scene || shot.screen;
    const seg = path.join(OUT, String(i).padStart(2, "0") + "-" + name + ".mp4");
    let seconds;
    if (shot.scene) {
      const sc = info[name];
      seconds = sc.frames / sc.fps;
      const k = Math.floor(T.width / (sc.rgb ? sc.rgb.w : 128));
      const vf = "scale=iw*" + k + ":ih*" + k + ":flags=neighbor,pad=" + T.width + ":" + T.height + ":(ow-iw)/2:(oh-ih)/2:color=" + T.backdrop + ",fps=" + T.fps;
      ffmpeg(["-framerate", String(sc.fps), "-i", path.join(OUT, "frames", name, "%03d.png"), "-vf", vf].concat(encode, ["-frames:v", String(Math.round(seconds * T.fps)), seg]));
    } else {
      seconds = info[name].seconds;
      ffmpeg(["-framerate", String(T.fps), "-i", path.join(OUT, "screens", name, "%04d.png")].concat(encode, [seg]));
    }
    console.log((at.toFixed(2) + "-" + (at + seconds).toFixed(2)).padEnd(14) + (shot.scene ? "animation  " : "screen     ") + name);
    at += seconds;
    list.push("file '" + seg + "'");
  });
  /* 4. The trailer */
  const listFile = path.join(OUT, "segments.txt");
  fs.writeFileSync(listFile, list.join("\n") + "\n");
  const final = only ? path.join(__dirname, "out", "preview", only + ".mp4") : path.join(__dirname, "out", "selk-trailer.mp4");
  fs.mkdirSync(path.dirname(final), { recursive: true });
  const picture = only ? final : path.join(OUT, "picture.mp4");
  ffmpeg(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", "-movflags", "+faststart", picture]);
  if (!only) {
    /* 5. The sound */
    const wav = path.join(__dirname, "out", "selk-trailer.wav");
    await renderAudio(wav);
    const probe = String(spawnSync(FFMPEG, ["-hide_banner", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5:print_format=json", "-f", "null", "-"]).stderr);
    const m = JSON.parse(/\{[^{}]*"input_i"[^{}]*\}/.exec(probe)[0]);
    const norm = "volume=" + (-16 - parseFloat(m.input_i)).toFixed(2) + "dB,alimiter=limit=0.84:attack=2:release=60:level=false";
    ffmpeg(["-i", picture, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", norm + ",aresample=48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", final]);
  }
  console.log("wrote " + path.relative(__dirname, final) + ", " + at.toFixed(2) + " s");
})();
