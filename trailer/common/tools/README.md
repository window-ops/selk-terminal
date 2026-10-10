# Trailer tools

The tools used to make the trailers and to check them. None of them is part of a build: `node build.js` needs only Node, Playwright and ffmpeg. Paths in the examples are relative to `trailer/`.

## Snapshots

| Script | Parameters | What it does |
| --- | --- | --- |
| `snapshot-game.js` | `<game folder> [--only feature\|gameplay]` | Runs the game in headless Chromium and writes the markup of each screen the trailers show to `common/snapshots/`, and the game pictures they use to `common/vendor/img/`. `--only feature` captures the feature trailer's screens, `--only gameplay` plays a new game from the login prompt to the rejected password and captures each state as `gp-<state>` |

## Recordings (`recordings/`)

The gameplay trailer's pointer paths come from ShareX recordings of the game (`gameplay-trailer/DESIGN.md`, section 9). The recordings are not kept in this folder. These scripts need Python 3 with NumPy and OpenCV (`pip install numpy opencv-python-headless`) and ffmpeg on the PATH. Run them with `python3 -I`.

| Script | Parameters | What it does |
| --- | --- | --- |
| `track.py` | `<cursors.css> <recording.mp4> <out.json>` | Traces the game's cursor through a recording. Reads the medium cursor shapes from the game's `css/cursors.css`, decodes each frame at page size (1920 by 1080) and finds the cursor by masked template matching, near its last place first. Writes one row per frame: time, cursor shape, hot spot in page pixels, match error. A row with no shape is a frame where the pointer is hidden (Windows hides it while a player types) or lost. Frames where nothing changed near the cursor reuse the last row, so a recording traces at about 50 frames a second of processing |
| `dragtrack.py` | `<recording.mp4> <path.json> <t> <tip x> <tip y> [template recording]` | Fills the gaps that drags leave in a trace. During a drag Windows draws its own drag cursor, which `track.py` does not know: this takes that cursor's picture from the recording at time `t`, with its tip at page point (`tip x`, `tip y`), and follows it through each gap that starts after a grab. The picture can come from another recording, the last argument |
| `events.py` | `<video> [threshold %]` | Lists the frames where the picture changes, with the changed area in page pixels: clicks, windows opening, typing. `threshold` is the share of changed pixels, 0.4 by default |
| `summary.py` | `<path.json> [step px]` | Prints a trace as the moments its cursor shape or place changes by more than `step` pixels (6 by default), for reading a recording's timing |
| `keys.py` | `<path.json> <from s> <to s> [tolerance px] [speed]` | Cuts a trace to keyframes for a shot: the rows from `from` to `to`, the recording's held frames dropped, simplified with the Ramer-Douglas-Peucker method within `tolerance` (1.5 px by default), times from 0 and divided by `speed` (1 by default). Prints JSON rows `[t, x, y, shape]`, which the shots in `gameplay-trailer/shots/` carry |

## Checks (`checks/`)

The checks open `common/lib/stage.html` in headless Chromium, as the build does. They need Playwright (`npm install`) and, for `cmpdir.py`, Python 3 with NumPy and Pillow.

| Script | Parameters | What it does |
| --- | --- | --- |
| `check-sim.sh` | `<common/lib/sim.js>` | Runs `sim.js` outside the browser and fails if a name it exports is not defined. Run it after every edit to `sim.js` |
| `jumps.js` | `<trailer folder> <shot script> [limit px]` | Steps a shot at 60 frames a second and lists every frame where the drawn cursor moves more than `limit` screen pixels (60 by default) since the frame before, with the largest move. The gameplay shots stay under 25 |
| `sample.js` | `<trailer folder> <shot script> <build folder> <out folder> <frame> ...` | Renders chosen frames of one shot (numbered at 60 a second) to PNG, for checking a shot without a build |
| `camlog.js` | `<trailer folder> <shot script> <t> ...` | Prints the camera's scale and place at each time `t` in seconds |
| `probe.js` | `<trailer folder> <snapshot> '<expression>'` | Loads one snapshot on the stage and prints the value of a JavaScript expression, for measuring where things are: `SIM.box(SIM.find("SUBMIT PAGE"))` gives a button's box in screen pixels |
| `audio-check.py` | `<audio or video> [reference.wav]` | Checks a soundtrack, or the sound of a trailer, for the faults heard as crackle, sizzle or clicks, or as a lopsided or hollow stereo image: peak and true peak, samples at full scale, DC offset, isolated one-sample jumps, windows whose energy above 9 kHz rises far above the usual, and per second the left-right balance and the level lost when summed to mono (a phone speaker). With a reference, the soundtrack before encoding, it also measures the encoder's error. Ends with a line of problems found. Needs NumPy and ffmpeg; run it with `python3 -I` |
| `cmpdir.py` | `<folder a> <folder b> [tolerance]` | Compares the PNG frames of two folders and prints the largest difference of any color channel. Two Chromium runs differ by up to 3 levels, so the tolerance is 4 by default |

## Score engraving (`score/`)

Used by the score tools of both trailers (`gameplay-trailer/tools/score/`, `feature-trailer/tools/score/`), which write MusicXML and call these. They need Python 3 with Verovio (`pip install verovio`) and Playwright.

| Script | Parameters | What it does |
| --- | --- | --- |
| `engrave.py` | `<score.musicxml> <out folder>` | Engraves the MusicXML with Verovio, one SVG an A4 page (`page-1.svg`, ...) |
| `print.js` | `<folder> <out.pdf>` | Prints the engraved pages to one A4 PDF in headless Chromium |
