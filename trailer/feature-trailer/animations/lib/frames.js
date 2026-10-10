/* Draws every frame of one scene as PNG into a folder and returns the
   problems the support check found, the same way tools/preview.js does:
   the archive scenes on the palette grid with the year or label at the
   top left, the scenes copied from the game's camera on their RGB grid. */
"use strict";
const fs = require("fs"), path = require("path");
const { frame, frameRGB, png, pngRGB } = require("./scene");
const { PAL, GROUND, SKY, GOLD, GREY } = require("../palette");

function renderScene(id, dir) {
  const scene = require("../" + id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  let problems = [];
  for (let n = 0; n < scene.frames; n++) {
    const f = scene.rgb
      ? frameRGB(id + " frame " + n, scene.rgb.w, scene.rgb.h, scene.rgb.bg)
      : frame(id + " frame " + n, { ground: GROUND, soft: [SKY], grid: null, frame: GREY });
    scene.draw(f, n);
    if (scene.label) scene.label(f.d, n); else if (scene.year) f.d.text(4, 4, scene.year, GOLD);
    problems = problems.concat(f.check());
    fs.writeFileSync(path.join(dir, String(n).padStart(3, "0") + ".png"), scene.rgb ? pngRGB(f.s) : png(f.s, PAL));
  }
  return { scene, problems };
}

module.exports = { renderScene };
