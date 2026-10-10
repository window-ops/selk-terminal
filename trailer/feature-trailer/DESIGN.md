# Selk feature trailer: design

This document describes the feature trailer, the first of the two Selk trailers: what it shows, why, and how it is made. The trailer folder is self-contained: `node build.js feature` rebuilds it, picture and sound, without the game. What both trailers share is in `trailer/common/`; the gameplay trailer has its own design in `trailer/gameplay-trailer/DESIGN.md`. Section 13 lists the known limits.

## 1. Purpose

A trailer for Selk, focused on Eastern Europe. It starts with early attempts to find chemosynthetic life and the first steps into space, and moves through time to the game's present, 26-02-2097. Everything on screen must agree with the game.

The trailer is self-standing. It sits in `trailer/`, carries copies of what it takes from the game, and runs without the game.

## 2. Format

| Item | Value |
| --- | --- |
| Length | 87.25 s |
| Picture | 16:9, 2560x1440, 60 fps |
| Output | `out/selk-feature-trailer.mp4`, H.264 video, AAC audio (settings in `out/README.md`) |
| Language | English, strings from `js/lang/en.js` |
| Phone version | None. A 9:16 cut could reuse `timeline.js` |

## 3. Direction

- **Rawness:** Few titles. The game's own screens and text tell the story.
- **Camera inside the screen**, after the Lost Wiki: Kozlovka trailer. Tight crops, words cut at the frame edges, and shot pairs: a wide view, then a close-up of one detail in it.
- **The alarm**, after the Papers, Please short film (2018). The shock is staged on a person, without drama: a structural alarm of overload and construction nobody authorized.
- **Balance:** About 54 s of animation and 33.5 s of game screens, alternating. The timelapse takes the place of the archive navigation, to raise interest, and each part runs as long as it needs.
- **Invitation without promotion:** The trailer ends on the game's title screen, with none of the usual trailer furniture.

## 4. Timeline

All animations run at 8 frames per second, so every length is a whole number of frames.

| Time (s) | Kind | Content |
| --- | --- | --- |
| 0-4.5 | Boot | Black, machine hum, the first boot line typed: `CESEA SITE OS 7.2 (c) 2079 CESEA`; held on "64 GB OK", the cut comes before the "spun up, 4 TB" line |
| 4.5-11.5 | Animation | Haas 1529-1569 (3.5 s), Winogradsky 1887 (3.5 s) |
| 11.5-16.5 | Navigation | FILES opens History. Close-up on "CESEA archive" |
| 16.5-32.25 | Animation | Tsiolkovsky 1903, Oberth 1923, Sputnik 1957, Gagarin 1961, Remek and Hermaszewski 1978, Prunariu 1981, Movile Cave 1986, 2.25 s each |
| 32.25-52.25 | Timelapse | Athens 2008-2015 (2 s), Kraków 2016-2025 (2 s), Ax-4 2025 rolling to 2026 (5 s), Bucharest 2026-2047 (2 s), Brno 2047-2063 (2 s), Debrecen 2063-2079 (3 s), Selk crater 2079-2097 (4 s) |
| 52.25-56.25 | Boot and animation | The boot resumes on ALARM (1 s), then the shelter alarm (3 s) |
| 56.25-69.25 | Navigation | STOPPED-REPAIRS, the move to WATCH, the MAST-01 load meter |
| 69.25-77.25 | Animation | MAST-01 swaying in the dust, creaks (8 s) |
| 77.25-87.25 | Title | The game's title screen, the cursor on POWER ON, cut to black |

The boot frames the trailer. POWER ON starts the boot in the game, so the last shot leads back to the first.

## 5. Shots

### 0-4.5 s, boot

Black screen. The machine hum from the game's sounds. The boot's first line is typed in the game's terminal style: `CESEA SITE OS 7.2 (c) 2079 CESEA`. The year 2079 marks the future before the cut to the past.

### 4.5-11.5 s and 16.5-32.25 s, the real past

Animations in the game's warm archive palette (`tools/history-pictures.js`), 128x64 pixels, with the year in the top left, as in the History pictures. The moving parts redraw 8 times a second. Real people appear only as pixel figures. No photographs are used.

The events run on two threads:

| Thread | Events |
| --- | --- |
| Reaching out (telescope) | Haas, Tsiolkovsky, Oberth, Sputnik, Gagarin, Remek and Hermaszewski, Prunariu, Ax-4 |
| Reaching in (microscope) | Winogradsky, Movile Cave |

| Scene | File | What moves |
| --- | --- | --- |
| Haas, 1529-1569 | `haas.js` | Night room in Sibiu, the Council Tower through the window. A candle flame rises and falls, a hand inks a three-stage rocket into the book |
| Winogradsky, 1887 | `winogradsky.js` | A microscope beside a jar, tangent zoom lines to the field, where Beggiatoa filaments glide and sulfur globules go out. Label BEGGIATOA |
| Tsiolkovsky, 1903 | `tsiolkovsky.js` | A sheet on a plank wall: the rocket section with tanks H and O, feed dashes, exhaust moving out. Label KALUGA |
| Oberth, 1923 | `oberth.js` | An Albion hand press from the front, the bar pulled in a level arc, the platen down; sheets on the line read DIE RAKETE and show a rocket |
| Sputnik 1, 1957 | `sputnik.js` | Sputnik crosses over the Earth's limb from edge to edge, its signal arcs leaving with it. Label SPUTNIK 1 |
| Gagarin, 1961 | `gagarin.js` | Vostok on the pad, the arms open, it rises and leaves through the top; the exhaust trail runs into the pit and thins. ПОЕХАЛИ! at liftoff |
| Remek and Hermaszewski, 1978 | `intercosmos.js` | Salyut 6, the Soyuz docks. The Czechoslovak and Polish flags beside REMEK and HERMASZEWSKI |
| Prunariu, 1981 | `prunariu.js` | The capsule under its striped parachute, the retro flash and dust, the canopy settles. The 1981 Romanian flag beside PRUNARIU |
| Movile Cave, 1986 | `movile.js` | A section through the ground: the survey tripod, the shaft into the flooded chamber, bubbles to the microbial mat, a water scorpion walking on it. Label MOVILE |

### 11.5-16.5 s, FILES opens History

Source: D1, 0-5 s of the clip. The cursor clicks HISTORY in the left panel of FILES. Close-up on "CESEA archive" in the WRITTEN BY column.

### 32.25-52.25 s, the timelapse

After the game's own timelapse in the TROIKA.RUN ending: a large year counter centred at the top that counts every year, and day and night passing, one day a second, with windows lit at night. It replaces the archive navigation, from the Greek crisis to the game's present, through cities of the region. The scenes are 128x64 in the archive palette, except Selk, which is 160x90 in the SV-4 camera palette, the grid of the alarm that follows.

| Scene | File | Length | What changes |
| --- | --- | --- | --- |
| Athens, 2008-2015 | `athens.js` | 2 s | Under the Acropolis, Greece sprints across the picture and the Troika walks after it and falls behind, as in TROIKA.RUN |
| Kraków, 2016-2025 | `krakow.js` | 2 s | Wawel Hill and the cathedral, St Mary's between the Old Town houses, the Vistula flowing |
| Ax-4, 2025 | `ax4.js` | 5 s | The Dragon docks at the ISS. The flags of Poland and Hungary beside UZNAŃSKI and KAPU. The year rolls from 2025 to 2026, where the game's archive begins |
| Bucharest, 2026-2047 | `bucharest.js` | 2 s | The Palace of the Parliament between blocuri, traffic. The 2033 climate strike under a red banner; from 2041 the Federation's flag on the tower; from 2045 scaffolding on a block |
| Brno, 2047-2063 | `brno.js` | 2 s | Petrov and the cathedral, the Lesná estate. The panel robot on its site from 2049, the block in 2051; trees planted in 2052 on the bare side grow. A tram on the boulevard; from 2061 a light on the Moon |
| Debrecen, 2063-2079 | `debrecen.js` | 3 s | The Great Reformed Church, houses, the research centre. A busy street becomes a bike lane in 2067; a monorail on pylons in 2070 is moved to the rail line in 2074, which becomes a park; trees and planting from 2072; solar panels spread over the roofs |
| Selk crater, 2079-2097 | `selk.js` | 4 s | The counter holds on 2079 while the units build the lab on the barren crater. Plot 3 lights in 2083; MAST-01 rises from 2089 with CRANE-L at its top; in 2092 the lab goes dark and plot 9 glows, and in 2093 FOOTING-B stands on it; 2097 holds for the cut |

The Federation is shown by the flag over Bucharest from 2041, the year of the game's Federal Treaty. The style stays the same across the 2025-2026 seam: the game's archive is written in 2097 and its 2026 entry already reports real 2024 election results.

### 52.25-56.25 s, the alarm

1. **Boot close-up, 1 s:** The boot resumes with `Structure monitor ...... ALARM` in the error colour, and the game's error sound plays once. The camera holds close on that line. The next line, `Supervisor sleep ....... ended 26-02-2097`, sits at the bottom edge of the frame and is cut after "ended 26-0".
2. **Shelter scene, 3 s** (`alarm.js`): The finale's first scene (`scenes.js`, `intro` panel 0), copied as the game draws it: the old terminal in the site shelter, and through the round window the dusty site and the tower. An industrial beacon hangs on a bracket from a cable conduit along the top of the wall and pulses amber once a second, washing the room. The supervisor, seen from behind, pulls the robot chair in toward the desk while it centres itself under the terminal, and reaches at once for the right edge of the screen, fast at first and slowing; the hand stays a moment, then comes back down. A scared calm. The new alarm tone runs under it.

### 56.25-69.25 s, STOPPED-REPAIRS and WATCH

| Time (s) | Source | Picture |
| --- | --- | --- |
| 56.25-59.25 | C1 | VIEW shows STRUCTURE / STOPPED-REPAIRS. The camera moves in on "zone 14 flagged", then on "26-02-2097 all supervisor woken". The Build column stays out of frame |
| 59.25-63.25 | A1, 0-9 s | The camera widens to the desk, framed on its lower half with the tmux bar. The cursor waits, then clicks 2:WATCH |
| 63.25-69.25 | A1, from 9 s | WATCH opens. The frame holds the SV-4 camera and the meter rows. "MAST-01 load" stands at 117.4 % in the error colour and climbs with the gusts. One gust shakes the screen. A close-up on "117.4 %" follows the wide view. The alarm tone cuts out and the first creak sounds |

The WATCH header carries the only full date on screen: 14-03-2097.

### 69.25-77.25 s, MAST-01

`mast.js`, 160x90 in the SV-4 camera palette, built from the game's camera pieces and modified to fit animation by using a rigid body. MAST-01 stands 1 180 m in 58 pixels with HALL-R at its foot and its beacon blinking. From the game's entries: three levels of guy cables are tight, at 350, 700 and 1 050 m, anchored at 0.7 times their height; the fourth level's cables were never raised and hang slack from level 3, swinging; CRANE-L is parked at 680 m, stowed against the tower's face with its arm folded down, as the rule above 5 m/s wind asks; dust is rising. The tower sways slowly, and two gusts, at about 3.2 s and 6.1 s into the shot, push its top over and let it come back, with more dust. Titan's haze hides Saturn and the stars. The creaks land on the gusts, panned left and right.

### 77.25-87.25 s, title screen

1. About 1 s of black after the last creak.
2. The game's title screen fades in, as the game draws it: SELK, "CESEA site terminal 01, Titan", "7.0 N, 199.0 W", POWER ON, and SETUP / ABOUT / CREDITS.
3. One added line under the coordinates, in the same dim colour, size and font: `gitlab.com/window-ops-web/selk-terminal`
4. Source: E1. The cursor rests, moves to POWER ON, and the button lights up amber on hover.
5. The click of POWER ON sounds, and the trailer cuts to black while the button is lit.

The screen gets no play button, store button, logo, platform badge, release date or end-screen link.

## 6. Spoiler policy

The 2097 part shows only the structural alarm and MAST-01 creaking. Everything below stays out of the trailer or out of frame:

- HX Holdings, the 2071-HX-HOLDINGS entry, EX-1
- the gate, build 55183, the removed safeguards, the update from Earth
- the 79-minute radio delay, including the README line "Earth: 79 minutes away by radio"
- the EXPORT section name
- the WATCH unit table ("stopped by gate", "survey, north of EX-1")
- the decision prompt, the endings, 2097-NOW

Framing keeps these lines off screen. The screens themselves stay as the game draws them, and no game text is changed.

The Selk timelapse shows the events of 2092 only through signs, without names or labels: the lab goes dark, plot 9 glows, and a year later FOOTING-B stands on it.

## 7. Consistency rules

- The simulated screens show only what the game can show, from its own markup. No invented shell lines or game text.
- The Selk bacteria are fictional, and the game states that no life beyond Earth is confirmed.
- Titan's haze hides Saturn and the stars from the surface.
- Key dates from the game: lab completed 2079, first find on plot 3 in 2083, MAST-01 started 2089, lab sealed 2092, supervisor woken 26-02-2097, audit reports from 14-03-2097.
- The Selk units descend from the panel robots built in Brno in 2049. The units building the lab in 2079 are the trailer's reading of the game's print units.
- Pieces copied from the game keep their shapes. Where a scene changes one, the change is noted at the top of the copy or the scene: the shelter drawn without its people, so the trailer can animate the supervisor; the beacon set directly on top of the lattice; corridors meeting the lab's sand banks; HALL-R narrowed to 20 pixels in the MAST-01 shot, clear of the guy cables.
- Every scene passes the support check in `feature-trailer/animations/lib/scene.js`: nothing floats, every part touches what holds it up.

## 8. Look and sound

### Picture

- **Game screens** keep the game's CRT look from its own CSS: the glass, the scanlines, the glow. The flicker and the power-on are computed from the game's keyframes.
- **Virtual camera:** Pans and zooms inside the game screens, made by scaling the page, so text and scanlines stay sharp at any zoom.
- **Colors:** The game's amber and dark slate.
- **Two grids:** The archive scenes are 128x64 (2:1) in the archive palette; the camera scenes (Selk, the alarm, MAST-01) are 160x90 (16:9) in the SV-4 palette, as the game draws them. Both are scaled by whole multiples with sharp pixels: 20 times for the archive scenes (2560x1280 on a dark ground), 16 times for the camera scenes (the full frame).
- **Resolution:** The game screens keep the game's layout at 1920x1080 and are rendered at 2560x1440, so each page pixel covers 1.33 pixels of the picture.

### Score

All audio is generated in code: the score by `feature-trailer/audio/score.js` with oscillators and filtered noise, the computer, wind, alarm and structure sounds by the game's own sound engine (`common/vendor/audio`). No recordings are used. `sh feature-trailer/tools/score/score.sh` writes the notes the score plays as sheet music, `out/score/selk-feature-score.pdf`, with the scenes and the chords marked.

| Item | Choice |
| --- | --- |
| Mood | Slow and reflective |
| Key | A minor |
| Motif | The falling fourth A to E, the interval of the game's error sound (220 Hz to 165 Hz) |
| Threads | Falling A to E on reaching out, rising E to A on reaching in, both at once in 2079 at Selk, where CESEA builds the lab "to test whether chemosynthetic life lives in the regolith soaked with liquid methane" |

| Time (s) | Tempo and sound |
| --- | --- |
| 0-32.25 | 60 BPM |
| 32.25-52.25 | Rises slowly from 60 to 70 BPM over the timelapse, with more notes per beat and more layers |
| 52.25-77.25 | Score stops. The game's error sound, then the new alarm tone, then creaks and wind |
| 77.25-87.25 | 60 BPM, one low A held to the cut |

The cuts follow the shots' lengths in frames and are not aligned to the beat grid.

### Effects

- **The boot** has the machine hum, the relay at the power-on and a drive seek. No key clicks are heard under the typing, here or on the ALARM line.
- **The space scenes** carry information by radio: Sputnik's beeps through receiver hiss, the rumble and a quindar tone at Gagarin's liftoff, telemetry chirps and the docking clunk for Remek and Hermaszewski, the retro rockets and landing for Prunariu, quindar tones and data around the Ax-4 docking.
- **The euro crisis** over Athens: a crowd, a passing siren, falling coins.
- **Every animation** has a quiet bed of its place, well under the music: crickets and the quill at Sibiu, a clock in Strasbourg and Kaluga, the press at Oberth's, steppe wind, station fans, the cave's drips and bubbles, traffic, river and birds in the cities, the tram and the panel robot in Brno, bicycle bells and the monorail in Debrecen.
- **MAST-01 is hit** by its two gusts: a dull blow on the shell, its low ring dying away, and the guy cables thrumming under the load, kept under the wind and the creaks.
- **Titan is muted.** Everything heard outside at Selk, the crater's sounds and the game's wind, gusts, creaks and storm, passes through a low-pass at 600 Hz.
- **The end:** the game's click on POWER ON, just before the cut.
- **The clicks** (HISTORY, 2:WATCH, POWER ON) are a little louder than the game plays them, the click on 2:WATCH most of all, so they are heard over the score.
- **The mix** is brought to -16 LUFS, its peaks held under -1.5 dB.

### Alarm

- **Game's error sound**, once, on the ALARM boot line. It is what the computer does, in the manner of a POST error beep.
- **New alarm tone**, part of the score. It repeats the falling fourth A to E in the score's register and timbre, and complements the music.

## 9. Real-past events

Checked against sources on 05-10-2026.

| Year label | Event | Notes |
| --- | --- | --- |
| 1529-1569 | Conrad Haas (1509-1576) writes a manuscript, now in the Sibiu archives and found there in 1961, that describes two- and three-stage rockets | No single year is known for the rocket pages, so the label shows the whole period |
| 1887 | Sergei Winogradsky, born in Kyiv in 1856, shows that Beggiatoa takes energy from oxidizing hydrogen sulfide: chemosynthesis | The work was done in Strasbourg, then in Germany |
| 1903 | Tsiolkovsky, "Exploration of Outer Space by Means of Reaction Devices", with the rocket equation | First part printed in 1903, the rest in 1911-1912 |
| 1923 | Hermann Oberth, born on 25 June 1894 in Hermannstadt (Sibiu), publishes "Die Rakete zu den Planetenräumen" in June 1923, after defending his dissertation in Cluj | He taught in Mediaș from 1924 to 1938 |
| 1957 | Sputnik 1, 4 October, Baikonur | |
| 1961 | Gagarin, Vostok 1, 12 April | |
| 1978 | Vladimír Remek (Czechoslovakia), Soyuz 28, 2 March, the first person in space from neither the USSR nor the US. Mirosław Hermaszewski (Poland), Soyuz 30, 27 June | |
| 1981 | Dumitru Prunariu, Soyuz 40, 14 May, the only Romanian to have flown in space | |
| 1986 | Cristian Lascu finds Movile Cave near Mangalia during construction work: the first underground ecosystem found that lives on chemosynthesis, isolated for about 5.5 million years. Described by Sarbu and colleagues in 1996 | |
| 2025 | Ax-4 launches on 25 June, docks on 26 June, splashes down on 15 July. Uznański (Poland) and Kapu (Hungary) fly with Whitson (USA) and Shukla (India) | Uznański is the second Pole in space after Hermaszewski. Kapu is the second Hungarian after Bertalan Farkas (1980) |

Sources:

- [Conrad Haas, Wikipedia](https://en.wikipedia.org/wiki/Conrad_Haas)
- [Sergei Winogradsky, Wikipedia](https://en.wikipedia.org/wiki/Sergei_Winogradsky)
- [Tsiolkovsky, History of Information](https://www.historyofinformation.com/detail.php?id=2622)
- [Hermann Oberth, Wikipedia](https://en.wikipedia.org/wiki/Hermann_Oberth)
- [Baikonur, ESA](https://www.esa.int/Our_Activities/Human_Spaceflight/Mission_Odissea_-_F._De_Winne_-_english/Baikonur_from_the_steppes_of_Kazakhstan_to_space)
- [Soyuz 28, Wikipedia](https://en.wikipedia.org/wiki/Soyuz_28)
- [Mirosław Hermaszewski, Wikipedia](https://en.wikipedia.org/wiki/Miros%C5%82aw_Hermaszewski)
- [Soyuz 40, Wikipedia](https://en.wikipedia.org/wiki/Soyuz_40)
- [Movile Cave, Wikipedia](https://en.wikipedia.org/wiki/Movile_Cave)
- [Ax-4 launch, NASASpaceflight](https://www.nasaspaceflight.com/2025/06/launch-roundup-062425/)
- [Ax-4 departure, Axiom Space](https://axiomspace.com/mission-blog/ax4-departs-station)

## 10. Recordings

Recorded with ShareX at 3840x2160 and 60 fps, H.264, cursor shown, no audio. Windows display scaling was 200 %, so the browser viewport was 1920x1080, the same layout as the simulated screens. Cursor positions read from the recordings were divided by two to get their position on the page. Game in English, TMUX mode, default settings, a new game in a private window, NO TOUR on.

| Clip | Length (s) | Content | Used for |
| --- | --- | --- | --- |
| A1 | 28.4 | Desk, click on 2:WATCH at about 8.5 s, then about 19 s reading WATCH | 59.25-69.25 s |
| C1 | 37.2 | Click on STRUCTURE at about 8 s, on STOPPED-REPAIRS at about 12 s, reading with a diagonal sweep at 20-24 s | 56.25-59.25 s. The close-up uses the sweep before it reaches the Build column |
| D0 | 31.5 | 2026-FAR-RIGHT opens at about 5 s, read to about 30 s. Selections: "Parliament election", "Renew Europe", "The Left (GUE/NGL)" | Not used: the timelapse replaced the archive navigation |
| D1 | 32.0 | HISTORY clicked at about 5 s. 2034 at about 9 s, then 2041, 2044, 2045, 2047 | 11.5-16.5 s |
| D2 | 80.0 | 2049 at 7-29 s (selections "Moon", "Federation"), 2052 at 29-34, 2063 at 35-40, 2071 at 41-44 (cut), 2079 at 45-49, 2091 at 50-80 with VIEW scrolled and the pass turned over | Not used: the timelapse replaced the archive navigation |
| E1 | 16.5 | Title screen, cursor at rest, on POWER ON from about 12.5 s, no click | 77.25-87.25 s |

Dropped: A2, A3 (optional takes) and B1 (covered by A1).

The original recordings are excluded from this folder: they are rarely needed and leaving them out keeps the folder light. The cursor paths in `feature-trailer/shots/` are written by hand after them.

### Cursor behaviour

The hand-written cursor paths follow how the player moved in the recordings:

- Long articles: the cursor hovers below the line being read.
- Tables: the cursor sweeps diagonally across the rows.
- The game's three cursor shapes appear: arrow, text cursor, hand (`css/cursors.css`).

## 11. Folder layout and build

```
trailer/
  README.md          how to build both trailers
  package.json       playwright and ffmpeg-static
  build.js           node build.js feature -> out/selk-feature-trailer.mp4
  common/            what both trailers use:
    lib/             sim.js moves everything from the shot's time (CRT
                     effects, typing, cursors, hover, camera); stage.html
                     puts the game's markup with the game's CSS; render.js
                     takes the frames in headless Chromium; audio.js and
                     audio-stage.html render a score with the game's sound
                     engine
    snapshots/       the game's own markup for the simulated screens
    shots/title.js   the title screen, the last shot of both trailers
    tools/           snapshot-game.js
    vendor/          copies from the game: pixel-sheet.js, the shelter and
                     site camera pieces from scenes.js, all the CSS, the
                     sound engine and sounds, the fonts and the licences
  feature-trailer/
    DESIGN.md        this document
    timeline.js      the shots in order
    animations/      the pixel animations, one file each, with palette.js,
                     lib/scene.js (frames, the support check, PNG),
                     lib/lapse.js (the timelapse's year, night and counter)
                     and lib/frames.js (a scene's frames to PNG)
    shots/           the game screens of this trailer, simulated in
                     JavaScript
    audio/score.js   the score and the cues
    tools/           preview.js, overlaps.js, and score/, the score as
                     sheet music
  gameplay-trailer/  the gameplay trailer, with its own DESIGN.md
  out/               the finished trailers; out/build/<trailer>/ holds the
                     intermediate files
```

External tools: Node, Playwright's Chromium, and ffmpeg through the `ffmpeg-static` package. The soundtrack is `common/lib/audio.js` with `feature-trailer/audio/score.js`. The cursor paths are written in the shots, after the recordings, in place of `cursor/track.js`.

## 12. Licenses

The folder keeps the game's licences for what it copies: GPL-3.0 for program code, CC BY-SA 4.0 for story text, SIL OFL 1.1 for the fonts, CC0 1.0 for the Selk illustrations. The license files travel with the copies.

## 13. Known limits

1. **The counter's plate:** Selk's counter sits on a half-transparent dark plate, so it reads on the light Titan sky. The other cities' counters have none.
2. **The beat grid:** The scene lengths are set in frames (2.25 s, 3.5 s and so on), and the cuts do not land on the 60-70 BPM beats.
3. **The cut from Selk to MAST-01:** HALL-R is 22 pixels wide in the timelapse and 20 in MAST-01, where it has to clear the guy cables; CRANE-L has its arm out in the timelapse's 2097 and is stowed in MAST-01.
4. **Cursor paths** are written by hand after the recordings; no cursor tracking is run.
5. **The snapshots** in `common/snapshots/` show the game as it was captured. If the game's screens change, run `node common/tools/snapshot-game.js <game folder>` again.
6. **No phone version.**
