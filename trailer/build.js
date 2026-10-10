#!/usr/bin/env node
/* Builds a trailer:

     node build.js feature     -> out/selk-feature-trailer.mp4
     node build.js gameplay    -> out/selk-gameplay-trailer.mp4

   Each trailer has its folder, <name>-trailer/, with its timeline.js; what
   both use is in common/. Intermediate files go to out/build/<name>/.

   1. Draws every animation's frames (feature-trailer/animations/), running
      the support check, and stops if a frame fails it.
   2. Renders every simulated game screen (<name>-trailer/shots/, or
      common/shots/ for a screen both trailers use) in headless Chromium;
      the feature trailer's WATCH screen uses the MAST-01 frames from step 1.
   3. Turns each shot into a segment at the trailer's size and rate: the
      archive scenes, 128 by 64, scaled 20 times to 2560 by 1280 on the
      backdrop; the camera scenes, 160 by 90, scaled 16 times to fill the
      frame; pixels kept sharp; each 8 fps frame held for 7.5 frames of 60.
      Each segment is encoded as H.264, CRF 12, preset slow, 4:2:0 (out/README.md).
   4. Joins the segments in timeline order.
   5. Renders the soundtrack (common/lib/audio.js with the trailer's
      audio/score.js), brings it to -16 LUFS (measured with ffmpeg's
      loudnorm, then raised by one gain, its peaks held under -2 dB by a
      limiter, so the encoded sound stays under -1 dB true peak), and muxes
      it in as AAC at 192 kbit/s, the drafts too (a lower rate is heard as a
      sizzle on sharp sounds).

   node build.js <name> --only <shot> renders that one shot to
   out/preview/<shot>.mp4; node build.js <name> --picture builds the whole
   picture without the sound, to out/preview/<name>-picture.mp4;
   node build.js <name> --draft builds a quick review copy, small, at 30
   fps and low quality, with the sound when the score exists, to
   out/preview/<name>-draft.mp4. --reuse keeps the frames of every screen
   whose script, snapshots and simulation have not changed since they were
   rendered, so only changed shots render again. */
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync, spawnSync } = require("child_process");
const { renderShot } = require("./common/lib/render");
const { renderAudio } = require("./common/lib/audio");
let FFMPEG = "ffmpeg";
try { FFMPEG = require("ffmpeg-static") || FFMPEG; } catch (e) { /* the ffmpeg on the PATH */ }

const NAME = process.argv[2];
if (!["feature", "gameplay"].includes(NAME)) {
  console.log("usage: node build.js feature|gameplay [--only <shot>]");
  process.exit(1);
}
const DIR = path.join(__dirname, NAME + "-trailer");
const T = require(path.join(DIR, "timeline"));
const only = process.argv.indexOf("--only") > 0 ? process.argv[process.argv.indexOf("--only") + 1] : null;
const pictureOnly = process.argv.includes("--picture");
/* Keep the rendered frames of a screen when nothing it depends on changed */
const reuse = process.argv.includes("--reuse");
/* A review draft: 960 by 540, 30 fps, a fast low-quality encoding. The
   screens are laid out at 1920 by 1080, as the game is, and rendered at
   the trailer's size: SCALE is the device pixel ratio, 4/3 at 2560 by 1440 */
const draft = process.argv.includes("--draft");
if (draft) { T.width = 960; T.height = 540; T.fps = 30; }
const SCALE = T.width / 1920;
const OUT = path.join(__dirname, "out", "build", NAME + (draft ? "-draft" : ""));
const ffmpeg = (args) => execFileSync(FFMPEG, ["-v", "error", "-y"].concat(args));
const encode = ["-c:v", "libx264", "-preset", draft ? "veryfast" : "slow", "-crf", draft ? "30" : "12", "-pix_fmt", "yuv420p", "-r", String(T.fps), "-video_track_timescale", "15360"];

/* A screen's script: the trailer's own, else the shared one */
const screenScript = (name) => [path.join(DIR, "shots", name + ".js"), path.join(__dirname, "common", "shots", name + ".js")].find((f) => fs.existsSync(f));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const shots = T.shots.filter((s) => !only || s.scene === only || s.screen === only || (only && s.scene === "mast"));
  /* 1. The animations */
  let problems = [];
  const info = {};
  const scenes = shots.filter((s) => s.scene);
  if (scenes.length) {
    const { renderScene } = require(path.join(DIR, "animations", "lib", "frames"));
    scenes.forEach((s) => {
      const r = renderScene(s.scene, path.join(OUT, "frames", s.scene));
      problems = problems.concat(r.problems);
      info[s.scene] = r.scene;
    });
  }
  if (problems.length) {
    console.log([...new Set(problems)].join("\n"));
    console.log("stopped: frames fail the support check");
    process.exit(1);
  }
  /* 2. The game screens */
  for (const s of shots.filter((s) => s.screen)) {
    const dir = path.join(OUT, "screens", s.screen);
    if (reuse && fs.existsSync(path.join(dir, "info.json"))) {
      const made = fs.statSync(path.join(dir, "info.json")).mtimeMs, lib = path.join(__dirname, "common", "lib");
      const deps = [screenScript(s.screen)].concat(
        ["sim.js", "stage.html", "render.js"].map((f) => path.join(lib, f)),
        fs.readdirSync(path.join(__dirname, "common", "snapshots")).map((f) => path.join(__dirname, "common", "snapshots", f)));
      if (deps.every((f) => fs.statSync(f).mtimeMs < made)) {
        info[s.screen] = JSON.parse(fs.readFileSync(path.join(dir, "info.json"), "utf8"));
        console.log("kept " + s.screen);
        continue;
      }
    }
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now();
    info[s.screen] = await renderShot(screenScript(s.screen), dir, T.fps, OUT, SCALE);
    fs.writeFileSync(path.join(dir, "info.json"), JSON.stringify(info[s.screen]));
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
      const k = T.width / (sc.rgb ? sc.rgb.w : 128);
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
  if (!only && Math.abs(at - T.seconds) > 1e-6) {
    console.log("stopped: the shots last " + at.toFixed(2) + " s, timeline.js says " + T.seconds + " s");
    process.exit(1);
  }
  /* 4. The trailer */
  const listFile = path.join(OUT, "segments.txt");
  fs.writeFileSync(listFile, list.join("\n") + "\n");
  const final = only ? path.join(__dirname, "out", "preview", only + ".mp4")
    : pictureOnly ? path.join(__dirname, "out", "preview", NAME + "-picture.mp4")
    : draft ? path.join(__dirname, "out", "preview", NAME + "-draft.mp4")
    : path.join(__dirname, "out", "selk-" + NAME + "-trailer.mp4");
  fs.mkdirSync(path.dirname(final), { recursive: true });
  const picture = only || pictureOnly ? final : path.join(OUT, "picture.mp4");
  ffmpeg(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", "-movflags", "+faststart", picture]);
  if (!only && !pictureOnly) {
    /* 5. The sound */
    const wav = path.join(OUT, "soundtrack.wav");
    const score = path.join(DIR, "audio", "score.js");
    if (!fs.existsSync(score)) {
      fs.copyFileSync(picture, final);
      console.log("wrote " + path.relative(__dirname, final) + ", " + at.toFixed(2) + " s, no score yet");
      return;
    }
    await renderAudio(wav, score, T.seconds);
    const probe = String(spawnSync(FFMPEG, ["-hide_banner", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5:print_format=json", "-f", "null", "-"]).stderr);
    const m = JSON.parse(/\{[^{}]*"input_i"[^{}]*\}/.exec(probe)[0]);
    const norm = "volume=" + (-16 - parseFloat(m.input_i)).toFixed(2) + "dB,alimiter=limit=0.79:attack=2:release=60:level=false";
    ffmpeg(["-i", picture, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", norm + ",aresample=48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", final]);
  }
  console.log("wrote " + path.relative(__dirname, final) + ", " + at.toFixed(2) + " s");
})();
