#!/usr/bin/env node
/* Draws every frame of the named scenes, runs the support check on each,
   and writes the frames as PNG to out/frames/<scene>/ and a preview video
   scaled 8 times to out/preview/<scene>.mp4 (out/ of the trailer folder).

     node feature-trailer/tools/preview.js haas

   Exits with code 1 and lists the problems when a frame fails the check. */
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const { frame, frameRGB, png, pngRGB } = require("../animations/lib/scene");
const { PAL, GROUND, SKY, GOLD, GREY } = require("../animations/palette");
const ROOT = path.join(__dirname, "..", "..");
let problems = [];
process.argv.slice(2).forEach((id) => {
  const scene = require("../animations/" + id);
  const dir = path.join(ROOT, "out", "frames", id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (let n = 0; n < scene.frames; n++) {
    /* Scenes copied from the game's js/game/scenes.js draw in RGB on their
       own grid and carry no year; the archive scenes use the palette */
    const f = scene.rgb
      ? frameRGB(id + " frame " + n, scene.rgb.w, scene.rgb.h, scene.rgb.bg)
      : frame(id + " frame " + n, { ground: GROUND, soft: [SKY], grid: null, frame: GREY });
    scene.draw(f, n);
    /* The year at the top left; a scene with its own label (a rolling
       counter) draws it itself */
    if (scene.label) scene.label(f.d, n); else if (scene.year) f.d.text(4, 4, scene.year, GOLD);
    problems = problems.concat(f.check());
    fs.writeFileSync(path.join(dir, String(n).padStart(3, "0") + ".png"), scene.rgb ? pngRGB(f.s) : png(f.s, PAL));
  }
  const prev = path.join(ROOT, "out", "preview");
  fs.mkdirSync(prev, { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(scene.fps), "-i", path.join(dir, "%03d.png"),
    "-vf", "scale=iw*8:ih*8:flags=neighbor", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "12", path.join(prev, id + ".mp4")]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(scene.fps), "-i", path.join(dir, "%03d.png"),
    "-vf", "scale=iw*4:ih*4:flags=neighbor,select='not(mod(n\\,4))',tile=2x4", "-frames:v", "1", path.join(prev, id + "-sheet.png")]);
  console.log(id + ": " + scene.frames + " frames");
});
if (problems.length) {
  console.log([...new Set(problems)].join("\n"));
  process.exitCode = 1;
}
