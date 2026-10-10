# Selk gameplay trailer: design

This document describes the gameplay trailer, the second of the two Selk trailers: what it shows, why, and how it is made. The trailer folder is self-contained: `node build.js gameplay` rebuilds it, picture and sound, without the game. What both trailers share is in `trailer/common/`; the feature trailer has its own design in `trailer/feature-trailer/DESIGN.md`. Section 12 lists the known limits.

## 1. Purpose

A trailer that shows how Selk is played. A message arrives from the audit office on Earth, the player looks through the site's files, drags entry names onto the blanks of a report page, sends the page to Earth and receives the next message. The first round runs at the player's pace. The second runs faster and ends on a page the office rejects and a section that stays locked.

## 2. Format

| Item | Value |
| --- | --- |
| Length | 68.2 s |
| Picture | 16:9, 2560x1440, 60 fps |
| Output | `out/selk-gameplay-trailer.mp4`, H.264 video, AAC audio (settings in `out/README.md`) |
| Language | English, strings from `js/lang/en.js` |
| Game settings | TMUX mode, default settings, a new game |
| Phone version | None. The close crops keep the text readable on a phone screen |

## 3. Direction

- **Real play:** The cursor moves as a player moved it. Every path in the shots is taken from traces of screen recordings of the game (section 9), then shortened to fit the cut.
- **Camera inside the screen**, shared with the feature trailer and taken from the Lost Wiki: Kozlovka trailer: tight crops on the line or the control that matters, words cut at the frame edges.
- **Readable on small screens:** Most crops show 640 to 1100 of the page's 1920 pixels in width, so the game's text stays legible on a phone.
- **The loop:** One round in full, from message to message. A second, faster round repeats it and ends on two refusals, from the audit office and from a locked section, which leave the story open.
- **Completion by cut:** After the second blank, the cut jumps to the active SUBMIT PAGE button. Only parts of the finished page appear, a choice also taken from the Kozlovka trailer.
- **The same end:** Both trailers close on the game's title screen, from the same shot.

## 4. Timeline

| Time (s) | Kind | Content |
| --- | --- | --- |
| 0-4 | Sign-in | The name typed at the login prompt, under a caption about the music |
| 4-8.9 | Desk | The first message from AUDIT DESK 4 arrives and is opened |
| 8.9-13.5 | Mail | MSG 001 asks for REPORT 1; OPEN REPORT 1 |
| 13.5-15.1 | Report | REPORT 1 / SITE ORIGIN, four empty blanks |
| 15.1-21 | Drag | SITE / SELK dragged onto blank 1 |
| 21-30.6 | Files and drag | BIO / LAB opened, read, dragged onto blank 2 |
| 30.6-32.5 | Report | Cut to SUBMIT PAGE, "4 of 4 filled"; the page is sent |
| 32.5-38 | Shell and report | The signal delay counts down, "Delivered to Earth", the ACCEPTED stamp |
| 38-43.3 | Desk and mail | MSG 002 arrives with REPORT 2, and is read |
| 43.3-46.5 | Report | The second round, faster: REPORT 2, then its SUBMIT PAGE |
| 46.5-49.5 | Shell | "Page not accepted. 3 of 4 answers match office records." |
| 49.5-58.2 | Files and dialog | ARCHIVE is locked; a guessed password is rejected |
| 58.2-68.2 | Title | One second of black, the game's title screen, the cursor on POWER ON, cut to black |

## 5. Shots

The player is signed in as Cornelius, the name used in the feature trailer's screens. The game's dates follow from that sign-in: MSG 001 is received at 14-03-2097 07:22, MSG 002 at 10:28.

### 0-4 s, sign-in

The camera is close on the login prompt under the boot lines: "Enter your name. Sign-in uses CESEA SSO through the site directory." The name is typed with the rhythm of the recording, a short pause in the middle of the word, and Enter. Windows hides the pointer while a player types, and the trailer hides it too.

Over the empty top of the frame, before the music starts, a caption pokes fun at that music: "You will be listening to one of the greatest pieces of musique concrète ever made". It is set in the game's font and the color of the typed name, on the game's screen under its CRT glass, so it has the same scanlines and glow, and it fades in and out.

### 4-8.9 s, the first message

The desk: FILES at the top left, VIEW with HOME / README on the right, SHELL below. The camera eases toward the top right, where the game's notice slides in: "[NEW TRANSMISSION] AUDIT DESK 4 / New message received via relay R-09: MSG 001", with OPEN MSG 001 and DISMISS. The pointer comes back and travels to the notice, where OPEN MSG 001 lights under the hand. Click.

### 8.9-13.5 s, MSG 001

MAIL opens: the inbox on the left, the message on the right. The camera reads along its lines, the request among them: "Read the entries in FILES, then fill in REPORT 1: drag an entry name onto each blank, or click a blank and press USE." The text cursor drifts under the line, as a reader's does. Then the hand on OPEN REPORT 1, and the click.

### 13.5-15.1 s, REPORT 1

Back on the desk, the REPORT pane opens under VIEW: REPORT 1 / SITE ORIGIN, "From supervisor Cornelius, Selk site. Where is the site, and why was it built?", four empty blanks, the grayed SUBMIT PAGE button and "0 of 4 filled".

### 15.1-21 s, SELK onto blank 1

In /site, the pointer shows the hand with drag dots over SELK, then the grab hand over its grip. The drag starts: the label "SITE / SELK" follows the pointer, every blank on the page shows its dashed outline, and the blank under the pointer fills with orange. The camera travels with the label from the file list to the report. The drop writes "SITE / SELK" into blank 1, "1 of 4 filled" updates, and the shell prints "Report 1, blank 1: SITE / SELK".

During a drag the trailer draws the game's own grabbing hand. In the recording, Windows replaces the game's cursor with its own drag cursor; the trailer keeps the game's pixel style.

### 21-30.6 s, BIO and LAB

A click on BIO in the left panel lists LAB, PLOTS, GATE and ZONE-14. LAB opens in VIEW with its picture, and the camera stays on it for a short read. Then LAB is dragged to blank 2. The label holds over the blank for most of a second before the drop, a pause taken from the recording, and the page shows "2 of 4 filled".

### 30.6-32.5 s, sending the page

The cut skips blanks 3 and 4. The frame holds only the SUBMIT PAGE button, now active, and "4 of 4 filled". The hand lights the button. Click.

### 32.5-38 s, the transmission

A close-up on the shell: "Transmitting REPORT 1 to CESEA audit office via relay R-09", then the game's large line "Signal delay 79 min", counting down in 79 steps over 3.6 s, as the game does. It ends on "Delivered to Earth". Cut to the report: the red stamp "ACCEPTED BY AUDIT DESK 4" over the button area, with the blanks out of frame.

### 38-43.3 s, MSG 002

The notice for MSG 002 slides in, and a REPORT 2 tab appears beside REPORT 1. The message opens: "REPORT 1 accepted. Life at Selk was confirmed in 2083. The gate that protects it is now stopping repairs across zone 14. Fill in REPORT 2 from Structure records."

### 43.3-46.5 s, the second round

Faster cuts on the beat. The title of the new page, "REPORT 2 / WHAT IS FAILING". Cut to the page already filled from STRUCTURE: the frame holds SUBMIT PAGE and "4 of 4 filled", its top edge under blank 4. The hand comes in and clicks.

### 46.5-49.5 s, the rejected page

The shell answers in the game's red: "Page not accepted. 3 of 4 answers match office records." The frame holds the whole line, its bottom edge on the screen's edge, so the shell lines above it, which list the four answers sent, are in frame too.

### 49.5-58.2 s, the locked section

ARCHIVE, marked LOCKED in the left panel, takes the next click. The game's dialog "ARCHIVE IS LOCKED" explains that the passwords changed while the supervisor slept. ENTER PASSWORD opens "UNLOCK ARCHIVE" with the hint "The crater name has a mythological origin." The player types SELK and presses Enter. "Password rejected." appears in the shell, and the password box turns the game's red. The frame holds the whole dialog with the red box.

### 58.2-68.2 s, title screen

The feature trailer's last shot, `common/shots/title.js`: one second of black, then the game's title screen with the repository line under the coordinates, `gitlab.com/window-ops-web/selk-terminal`. The cursor rests, moves to POWER ON, and the button lights amber. The trailer cuts to black while it is lit.

## 6. Spoiler policy

The game's premise may show: life was found at Selk in 2083, the gate protects it and now stops repairs across zone 14, and Earth is 79 minutes away by radio. These are in MSG 002, in HOME / README and in the transmission countdown.

The following stay out of the trailer or out of frame:

- REPORT 1's blanks 3 and 4 being filled, and the finished page as a whole
- REPORT 2's blanks on the page. The shell lines above the rejection list the four answers sent for it, one of them wrong, and are in frame in the 46.5-49.5 s shot
- any password that opens a section; the password shown, SELK, is a wrong guess
- the rest of the feature trailer's list: HX Holdings, the 2071-HX-HOLDINGS entry, EX-1, build 55183, the removed safeguards, the update from Earth, the EXPORT section name, the WATCH unit table, the decision prompt, the endings and 2097-NOW

The EXPORT row sits two rows below ARCHIVE in the file list, so the crops of the 49.5-58.2 s shot end above it. The screens stay as the game draws them, and no game text is changed.

## 7. Consistency rules

- The simulated screens show only what the game can show, from its own markup. No invented shell lines or game text. The one line added is the caption over the sign-in, which is set apart from the game's text by its place above the prompt.
- Each state of a screen is captured from the game by `common/tools/snapshot-game.js --only gameplay`, as the snapshots named `gp-*`: the desk before and after each message, the report page empty, with one and two blanks filled, ready to send, sent and stamped, REPORT 2, the rejected page, both ARCHIVE dialogs and the rejected password.
- The password box in red is the game after its fix for rejected passwords. The snapshots of that dialog are taken from the fixed game.
- The game's clock and dates move as in the recordings: 99 minutes with each message, 79 minutes with each transmission.
- The cursor shapes are the game's own: arrow, text cursor, hand, hand with drag dots, grab and grabbing (`common/vendor/css/cursors.css`).

## 8. Look and sound

### Picture

- **Game screens** keep the game's CRT look from its own CSS: the glass, the scanlines, the glow. The flicker is computed from the game's keyframes.
- **Virtual camera:** Pans and zooms inside the game screens, made by scaling the page, so text and scanlines stay sharp at any zoom.
- **Resolution:** The page keeps the game's layout at 1920x1080 and is rendered at 2560x1440, so each page pixel covers 1.33 pixels of the picture.

### Score

All audio is generated in code: the score by `gameplay-trailer/audio/score.js` with oscillators and filtered noise, the interface sounds by the game's own sound engine (`common/vendor/audio`). No recordings are used.

| Item | Choice |
| --- | --- |
| Mood | Attentive, steady, warmer than the feature trailer |
| Key | E minor |
| Motif | The rising fourth B to E, the interval of the game's mail chime (988 Hz to 1319 Hz). The feature trailer's motif is the falling fourth of the error sound |
| Tempo | A base of about 79 BPM, between 74 and 83 BPM, eased between the moments it catches and slower in the second round |
| Form | 14 bars of 4/4 in phrases of four bars: Em C G D, Em Am7 Cmaj7 D, Cmaj7 Bsus B7 Em, Cmaj7 D |
| Voices | Mallets (the melody), a plucked guitar, a held pad, a soft bass, brushes and a soft kick, in a small room |
| Stereo | The guitar a little left, the mallets a little right, the pad's voices spread, the bass, the kick and the machine hum in the center |

The score is written as notes before it is heard, in `gameplay-trailer/audio/cue.js`: a clock that maps beats to the trailer's seconds, the chords, a dynamic for each bar (p to f), each part as a list of notes with the moment on screen they belong to, and the game's own sounds at their times. `score.js` plays the cue exactly as written. Notes written together sound together, and the players' small differences are in loudness only. A note with a moment on screen is struck a little harder. `sh gameplay-trailer/tools/score/cue.sh` prints the cue as sheet music, with the game's sounds on a staff of their own, and checks it (`gameplay-trailer/tools/README.md`).

The cue is written by these rules:

- **One sound for each moment.** Two attacks 10 to 60 ms apart are heard as one smeared sound, and the same pitch on two instruments at once is heard as a doubling; the cue has neither.
- **The game's chime** is played by the score, in its instruments and on its beat, as B, E, B on eighths.
- **The game's ok tone**, the sound of something completed, stays on the drops and on "Delivered to Earth". There the score adds nothing above the bass and pad, and the ok closes the guitar's climb through the drag, a step a beat.
- **Clicks:** the game's own click stays on OPEN REPORT 1 and BIO. On OPEN MSG 001 and OPEN MSG 002, only the first tap of the click sounds, at the instant of the melody's note. Elsewhere a note of the melody marks the moment.
- **Leaps:** never more than an octave, a seventh or a tritone, sixths seldom; in the melody a leap of a fifth or more turns back by a step or a third. The guitar plays close chords near B3, led from note to note, never leaping more than a fifth.

| Time (s) | Sound |
| --- | --- |
| 0-4 | No score. The machine hum and the keys |
| 4-45.9 | The score enters on the first chime, softly under the reading, and grows with the drags to its loudest as the page is sent; it eases for MSG 002 and rises again in the second round, with a kick on the last two strums |
| 45.9 | The score stops dead on the click that sends REPORT 2, and stays out through the refusal and the locked section |
| 59.2-68.2 | One low E held to the cut, and the click of POWER ON at 67.6 s |

### Effects

The game plays its own sound for each event, and the trailer keeps them, except where the score takes their place:

- the drive as a message arrives and opens, as an entry opens and as a page is sent;
- the game's click on OPEN REPORT 1 and BIO, its first tap on OPEN MSG 001 and OPEN MSG 002, a press as each drag takes hold;
- the ok sound when a blank is filled and on "Delivered to Earth";
- the sweep when a page is sent, and a blip with each step of the countdown, on the score's sixteenths;
- the click and the error sound on the rejected page; the error sound on the locked section and on the rejected password, with the click of ENTER PASSWORD;
- key sounds in the sign-in and in the password box;
- the machine hum under the desk, centered, 6 dB under the game's level.

The mail chime is the score's. The locked prompt opens without its click, which tells a player more than it adds to a trailer.

The interface sounds play at 2.25 times the game's level, so they are heard over the score, through a gentle low-pass at 6 kHz that rounds the edges of the game's square-wave tones. The mix is brought to -16 LUFS, its peaks held under -2 dB by a limiter, and encoded as AAC at 192 kbit/s. `common/tools/checks/audio-check.py` checks the soundtrack for clicks, sizzle, clipping and stereo faults.

## 9. Recordings

Recorded with ShareX at 3840x2160 and 60 fps, H.264, cursor shown, no audio. Windows display scaling was 200 %, so the browser viewport was 1920x1080, the layout of the simulated screens. Game in English, TMUX mode, default settings, a new game in a private window, NO TOUR on. Each clip continues the game of the one before.

| Clip | Length (s) | Content | Used for |
| --- | --- | --- | --- |
| G1 | 44.0 | Title screen, POWER ON, sign-in, MSG 001 arrives at 15.1 s and is opened at 20.4 s, read, OPEN REPORT 1 at 30.2 s | 0-15.1 s |
| G2 | 40.3 | SELK dragged from /site to blank 1 (drop at 7.2 s); BIO and LAB opened, LAB dragged to blank 2 (drop at 21.9 s); GATE and ZONE-14 to blanks 3 and 4 | 15.1-30.6 s |
| G3 | 21.8 | SUBMIT PAGE at 1.9 s, the countdown, "Delivered to Earth" at 5.7 s, MSG 002 at 9.6 s, opened at 13.2 s | 30.6-43.3 s |
| G4 | 70.7 | REPORT 2 filled from STRUCTURE with one wrong answer and sent at 42 s; ARCHIVE clicked at 50.7 s, the password dialog, SELK typed and rejected at 62.4 s and again at 65 s | 43.3-58.2 s |

The pointer in each clip was traced frame by frame: the game's cursors were matched against the recording to give the hot spot's position and the cursor's shape, and the drags were followed by the shape of the Windows drag cursor. The shots use keyframes taken from those traces. The recordings are kept outside this folder; the tracing scripts are in `common/tools/recordings/`, described in `common/tools/README.md`.

## 10. Folder layout and build

```
trailer/
  build.js             node build.js gameplay -> out/selk-gameplay-trailer.mp4
  common/              shared with the feature trailer (see README.md)
  gameplay-trailer/
    DESIGN.md          this document
    timeline.js        the shots in order
    shots/             the game screens of this trailer, simulated in
                       JavaScript on common/lib/stage.html
    audio/cue.js       the score written as notes, with the game's sounds
    audio/score.js     plays the cue and the sounds outside it
    tools/score/       the score as sheet music, and the cue's checks
```

External tools: Node, Playwright's Chromium, and ffmpeg through the `ffmpeg-static` package.

## 11. Licenses

The folder keeps the game's licenses for what it copies: GPL-3.0 for program code, CC BY-SA 4.0 for story text, SIL OFL 1.1 for the fonts, CC0 1.0 for the Selk picture of the lab (`common/vendor/img/lab.svg`). The license files are in `common/vendor/licenses/`.

## 12. Known limits

1. **Shortened play:** The paths come from real play, cut and sped up to fit the shots. A drag keeps about its recorded length; the time between drags is shorter.
2. **The drag cursor:** The trailer shows the game's grabbing hand during drags. On Windows, a player sees the system's drag cursor there.
3. **The snapshots** in `common/snapshots/` show the game as it was captured. If the game's screens change, run `node common/tools/snapshot-game.js <game folder>` again.
4. **No phone version.**
