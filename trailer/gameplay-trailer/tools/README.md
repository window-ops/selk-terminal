# Gameplay trailer tools

Tools used only for the gameplay trailer. The tools both trailers use are in `common/tools/` (`common/tools/README.md`). Paths in the examples are relative to `trailer/`.

## Score (`score/`)

The score is written as notes in `gameplay-trailer/audio/cue.js` (`gameplay-trailer/DESIGN.md`, section 8). `cue.sh` checks that cue and prints it as sheet music; `score.sh` records what the soundtrack actually plays and prints that, so the two can be compared. Both need Playwright, Python 3 and Verovio (`pip install verovio`). Run them from `trailer/`.

| Script | Parameters | What it does |
| --- | --- | --- |
| `cue.sh` | `[out folder]` | Runs `cue-xml.py`, then `engrave.py` and `print.js` (`common/tools/score/`), on the cue and leaves `selk-gameplay-cue.musicxml` and `selk-gameplay-cue.pdf` in the out folder, `out/score` by default. The check's findings are printed first |
| `cue-xml.py` | `<cue.js> <out.musicxml>` | Writes the cue as MusicXML: each part on its staff, the game's own sounds on a staff of their own in 32nds, chord names, dynamics, tempo and the moments on screen. Checks it: attacks 10 to 60 ms apart across instruments and the game (flams), the same pitch on two of them within 60 ms in unison or an octave (doublings), the pad left out of both; and each part's leaps, more than an octave, a seventh or a tritone not allowed, a sixth flagged, and in the melody a leap of a fifth or more that does not turn back by a step or a third. Run it with `python3 -I` |

`score.sh` and its steps write the notes the soundtrack plays (`gameplay-trailer/audio/score.js`) as sheet music, so its parts can be read against each other, against the cue and against the picture.

| Script | Parameters | What it does |
| --- | --- | --- |
| `score.sh` | `[out folder]` | Runs the two steps below, then `engrave.py` and `print.js` (`common/tools/score/`), and leaves `selk-gameplay-score.musicxml` and `selk-gameplay-score.pdf` in the out folder, `out/score` by default |
| `score-events.js` | `<trailer folder> <out.json>` | Renders a copy of the score on the audio stage with every voice logged (guitar, mallets, pad, bass, kick, brushes) and saves each note's pitch, time, length and loudness, with the score's clock: the time of every eighth of a beat |
| `score-xml.py` | `<events.json> <out.musicxml>` | Writes the notes as MusicXML: bars of 4/4 from the first chime to the stop, times mapped to beats with the score's clock, onsets rounded to sixteenths and lengths to eighths, the pad as the chord sounding at each change, the tempo of each bar and the moments on screen (clicks, drops, chimes) written above the mallets. Run it with `python3 -I` |
