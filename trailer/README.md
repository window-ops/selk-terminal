# Selk trailer

The trailer for Selk, made in JavaScript and compiled to video. It runs on its own, without the game: everything it takes from the game is copied in `vendor/`.

## Build

You need Node 18 or later.

```
npm install
npm run setup
npm run build
```

`npm run setup` downloads the Chromium build that Playwright uses. `npm run build` writes `out/selk-trailer.mp4`: 1920x1080, 60 fps, H.264, AAC sound at -16 LUFS, 87.25 s. A full build takes about a quarter of an hour, most of it rendering the game screens.

ffmpeg comes from the `ffmpeg-static` package. Without it, the `ffmpeg` on the PATH is used.

## Other commands

| Command | What it does |
| --- | --- |
| `node audio.js` | Renders only the soundtrack to `out/selk-trailer.wav` (about 10 s) |
| `node build.js --only <shot>` | Renders one shot to `out/preview/<shot>.mp4`, for example `--only watch` |
| `node tools/preview.js <scene>` | Draws one animation, runs the support check, writes PNG frames, an 8x preview and a contact sheet to `out/` |
| `node tools/overlaps.js <scene> [under>over,...]` | Lists the pixels each object of an animation draws over another |
| `node tools/snapshot-game.js <game folder>` | Captures the game's own markup for the simulated screens into `shots/snapshots/`. Only needed again if the game's screens change; the build does not use the game |

## Layout

| Path | Contents |
| --- | --- |
| `DESIGN.md` | The design: timeline, shots, look and sound, consistency rules, known limits |
| `timeline.js` | The shots in order |
| `build.js` | Draws, renders, encodes and joins the shots |
| `animations/` | The pixel animations, one file each; `lib/scene.js` holds the frames, the support check and the PNG writer, `lib/lapse.js` the timelapse's counter and day and night |
| `shots/` | The game screens, simulated in JavaScript: each shot puts the game's own markup (`snapshots/`) in a page styled with the game's CSS, and `lib/sim.js` moves everything from the shot's time: the CRT effects, the typing, the cursors, the hover, the camera. `lib/render.js` takes the frames |
| `audio.js`, `audio/` | The soundtrack: `audio/score.js` writes the score and the cues against the timeline, played by the game's own sound engine (`vendor/audio`) on an OfflineAudioContext in `audio/stage.html` |
| `tools/` | The preview, overlap and snapshot tools |
| `vendor/` | Copies from the game: `pixel-sheet.js`, the camera pieces from `scenes.js`, all its CSS, its sound engine and sounds (`audio/`), its fonts and licences |

## Licences

The program code is GPL-3.0, as the game's. The fonts are under the SIL Open Font License 1.1 (`vendor/fonts/OFL-*.txt`). The licence texts are in `vendor/licenses/`.
