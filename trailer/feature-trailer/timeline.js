/* The feature trailer's shots in order, as DESIGN.md section 4 sets them.
   A shot is an animation (scene: animations/<name>.js, its length from its
   frames at 8 per second) or a simulated game screen (screen: shots/<name>.js,
   or common/shots/<name>.js for a screen both trailers use; its length set
   in the shot). seconds is the whole length, for the soundtrack; the build
   checks it against the shots. */
"use strict";
module.exports = {
  width: 2560, height: 1440, fps: 60, seconds: 87.25,
  /* The color round the 2:1 archive scenes in the 16:9 frame: the
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
