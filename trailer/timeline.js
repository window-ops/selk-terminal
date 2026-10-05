/* The trailer's shots in order, as DESIGN.md section 4 sets them. A shot is
   an animation (scene: animations/<name>.js, its length from its frames
   at 8 per second) or a simulated game screen (screen: shots/<name>.js,
   its length set in the shot). */
"use strict";
module.exports = {
  width: 1920, height: 1080, fps: 60,
  /* The colour round the 2:1 archive scenes in the 16:9 frame: the
     archive palette's ground */
  backdrop: "#191410",
  shots: [
    { screen: "boot" },
    { scene: "haas" },
    { scene: "winogradsky" },
    { screen: "files-history" },
    { scene: "tsiolkovsky" },
    { scene: "oberth" },
    { scene: "sputnik" },
    { scene: "gagarin" },
    { scene: "intercosmos" },
    { scene: "prunariu" },
    { scene: "movile" },
    { scene: "athens" },
    { scene: "krakow" },
    { scene: "ax4" },
    { scene: "bucharest" },
    { scene: "brno" },
    { scene: "debrecen" },
    { scene: "selk" },
    { screen: "boot-alarm" },
    { scene: "alarm" },
    { screen: "stopped-repairs" },
    { screen: "desk-watch" },
    { screen: "watch" },
    { scene: "mast" },
    { screen: "title" }
  ]
};
