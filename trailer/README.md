# Selk trailers

The two trailers for Selk, made in JavaScript and compiled to video: the feature trailer, from the first steps into space to the game's present, and the gameplay trailer, which shows a round of play. They run on their own, without the game: everything they take from the game is copied in `common/vendor/`.

## Build

You need Node 18 or later.

```
npm install
npm run setup
node build.js feature
node build.js gameplay
```

`npm run setup` downloads the Chromium build that Playwright uses. `node build.js feature` writes `out/selk-feature-trailer.mp4`, `node build.js gameplay` writes `out/selk-gameplay-trailer.mp4`; `npm run build` builds both. Each design document gives its trailer's format and length. A full build takes a while, most of it rendering the game screens.

ffmpeg comes from the `ffmpeg-static` package. Without it, the `ffmpeg` on the PATH is used.

## Other commands

| Command | What it does |
| --- | --- |
| `node common/lib/audio.js <trailer>` | Renders only the soundtrack to `out/build/<trailer>/soundtrack.wav` |
| `node build.js <trailer> --only <shot>` | Renders one shot to `out/preview/<shot>.mp4`, for example `node build.js feature --only watch` |
| `node build.js <trailer> --picture` | Builds the whole picture without the sound to `out/preview/<trailer>-picture.mp4` |
| `node feature-trailer/tools/preview.js <scene>` | Draws one animation, runs the support check, writes PNG frames, an 8x preview and a contact sheet to `out/` |
| `node feature-trailer/tools/overlaps.js <scene> [under>over,...]` | Lists the pixels each object of an animation draws over another |
| `sh gameplay-trailer/tools/score/cue.sh` | Checks the gameplay trailer's written cue (`gameplay-trailer/audio/cue.js`) for collisions and leaps, and prints it as sheet music, MusicXML and PDF, to `out/score/`; needs Verovio (`pip install verovio`) |
| `sh gameplay-trailer/tools/score/score.sh` | Writes the notes the gameplay soundtrack plays as sheet music, MusicXML and PDF, to `out/score/`; needs Verovio |
| `sh feature-trailer/tools/score/score.sh` | Writes the notes the feature soundtrack plays as sheet music, MusicXML and PDF, to `out/score/`; needs Verovio |
| `node common/tools/snapshot-game.js <game folder>` | Captures the game's own markup for the simulated screens into `common/snapshots/`. Only needed again if the game's screens change; the build does not use the game |
| `node build.js <trailer> --draft [--reuse]` | A quick review copy at 960 by 540 and 30 fps to `out/preview/<trailer>-draft.mp4`; `--reuse` renders again only the screens whose files changed |

`common/tools/README.md` describes every shared tool and its parameters: the snapshot tool, the scripts that traced the recordings, the checks, and the engraving shared by both scores. `gameplay-trailer/tools/README.md` describes the gameplay score tools; the feature score tool is described in `feature-trailer/tools/score/score.sh` and its scripts.

## Layout

| Path | Contents |
| --- | --- |
| `build.js` | Draws, renders, encodes and joins the shots of one trailer |
| `common/` | What both trailers use: `lib/` (the screen simulation `sim.js`, its page `stage.html`, the frame renderer `render.js`, the soundtrack renderer `audio.js` and its page), `snapshots/` (the game's markup), `shots/title.js` (the title screen that ends both trailers), `tools/snapshot-game.js`, and `vendor/`, the copies from the game: `pixel-sheet.js`, the camera pieces from `scenes.js`, all its CSS, its sound engine and sounds, its fonts and licenses |
| `feature-trailer/` | The feature trailer: `DESIGN.md`, `timeline.js`, the pixel animations in `animations/`, its game screens in `shots/`, its score in `audio/score.js`, and the animation tools in `tools/` |
| `gameplay-trailer/` | The gameplay trailer: `DESIGN.md`, `timeline.js`, its game screens in `shots/`, its score written as notes in `audio/cue.js` and played by `audio/score.js`, and the score tools in `tools/` |
| `out/` | The finished trailers; `out/build/<trailer>/` holds the intermediate files, `out/score/` both scores as sheet music; `out/README.md` gives the encoding settings |

## Licenses

The program code is GPL-3.0, as the game's. The fonts are under the SIL Open Font License 1.1 (`common/vendor/fonts/OFL-*.txt`). The license texts are in `common/vendor/licenses/`.
