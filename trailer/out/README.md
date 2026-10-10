# Trailer files

| File | Length | Size | Contents |
| --- | --- | --- | --- |
| `selk-feature-trailer.mp4` | 87.25 s | 35.9 MB | The feature trailer (`feature-trailer/DESIGN.md`) |
| `selk-gameplay-trailer.mp4` | 68.2 s | 33.7 MB | The gameplay trailer (`gameplay-trailer/DESIGN.md`) |
| `score/` | | | Both trailers' scores as sheet music, MusicXML and PDF: `selk-feature-score`, `selk-gameplay-score` (the notes each soundtrack plays) and `selk-gameplay-cue` (the gameplay score as written, with the game's sounds) |

Both files are made by `node build.js feature` and `node build.js gameplay` (`../README.md`).

## Encoding

| Item | Setting |
| --- | --- |
| Container | MP4, index at the start (`-movflags +faststart`), so playback starts before the download ends |
| Picture | 2560x1440, 16:9, 60 fps |
| Video codec | H.264 (libx264 through ffmpeg), CRF 12, preset slow, 8-bit 4:2:0 (`yuv420p`) |
| Sound | AAC, 192 kbit/s, 48 kHz, stereo, -16 LUFS, peaks held under -2 dB by a limiter |

How the picture is made before encoding:

- **Game screens:** headless Chromium lays the page out at 1920x1080, as the game does, and draws it at a device pixel ratio of 4/3, so each frame comes out at 2560x1440 with nothing scaled after it.
- **Pixel animations** (feature trailer): scaled by nearest neighbor to whole multiples, 20 times for the 128 by 64 archive scenes (2560x1280 on a dark ground) and 16 times for the 160 by 90 camera scenes (the full frame). Each 8 fps frame is held for 7.5 frames of 60.

## Why CRF 12

CRF is x264's quality setting: 0 is lossless, lower is better, and each step of 6 roughly doubles or halves the file. Measured on a 5.9 s shot of the gameplay trailer with a moving camera, against the frames as rendered:

| Encoding | Size of the shot | PSNR against the rendered frames |
| --- | --- | --- |
| H.264 lossless, 4:4:4 | 61.4 MB | lossless |
| H.264 lossless, 4:2:0 | 44.4 MB | 46.1 dB |
| H.264 CRF 6, 4:2:0 | 11.8 MB | 45.2 dB |
| H.264 CRF 10, 4:2:0 | 7.1 MB | 44.4 dB |
| H.264 CRF 14, 4:2:0 | 4.5 MB | 43.1 dB |

Lossless would make each trailer several hundred MB, and 4:4:4 H.264 does not play in every browser. VP9 and AV1 lossless came out larger than H.264 lossless. Most of the measured loss is the 4:2:0 color, which every widely playable option shares, so CRF 12 keeps the trailers close to that limit at a size suited to a web page.
