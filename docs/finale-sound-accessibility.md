# Finale, sound and accessibility

[Back to Developing Selk](../DEVELOPING.md)

## Finale

`js/ui/cinema.js` provides the black stage: typed lines, a choice list, pixel scenes with captions, a letter and a title card. While the stage is open, everything behind it is inert, except the debug panel.

`js/game/scenes.js` draws the scenes as SVG on a 160 by 90 grid. `SCENES` maps each ending id to its drawing functions, and `DESCRIBE` gives the text alternative for each panel, which the screen reader and the drawings page use.

The ending plays as film, with no screen effects. Once the stage covers the screen, `body.cinema` turns off the curved outline, the vignette, the scanlines, the flicker, the glow and the shake.

## Sound

`js/audio/sound.js` is the engine: it synthesizes every sound with the Web Audio API on separate volume buses: machine, wind, structure, interface and music. Each bus passes through a level stage (the Setup sliders) and a duck stage (the ending's hush, which fades the machine, wind and structure and leaves the interface and the music alone, so buttons always sound). It also holds the presets and the helpers the sounds are made of, which it hands to the sounds as `S.snd.kit`. The sounds are in `js/audio/sounds/`, one file per family, each adding its functions to `S.snd`: `machine.js` (hum, drive seeks, boot), `weather.js` (wind and gusts), `structure.js` (creaks and thuds), `interface.js` (click, typing, result tones and the control sounds), `ending.js` (the swell and the hush), `troika.js` (the soundtrack of TROIKA.RUN), `troika-voice.js` (the economist's voice in TROIKA.RUN, a deep blip for each letter typed), and the two themes of its ending, `troika-office.js` (the economist's office) and `troika-coda.js` (from the timelapse to the end, in the mood of the answer), both played by `troika-song.js`, which fades them in and out. The soundtrack and both themes play on the music channel (Setup > Sound > Channels > Music), leveled to the same loudness.

Interface sounds read the noise buffer from one fixed point, so a control sounds the same every time. The buffer is made from a seed, so it is the same at every load and a control sounds the same after a reload. Setup > Sound > Seeds sets the seeds: digits are used as a number, and other text is hashed (FNV-1a). Same seed everywhere (`settings.soundSeed`) is the quick control: it makes the buffer the wind, the creaks and every interface sound read, and applying it clears the seeds of single sounds. The default, 3436859, gives the most probable sound of a random buffer: of 2000 seeds, its click and control bursts lie closest to the average over all seeds. The click and typing, which play whatever Control sounds is set to, have a row of their own, and the control kinds that render a noise burst (every kind except the tone-only `slide`, `page`, `back`, `open` and `switch`, which have no noise source) have theirs in a CONTROL SOUNDS group, sorted by name and grayed while Control sounds is OFF (`settings.soundSeeds`, by kind). A sound with its own seed reads a buffer made from it (one second, or three for typing, which reads it at a random point), and a sound with an empty field follows the shared seed. DEFAULT gives the seed the game starts with and is pressed only while that seed is in use. A new seed builds the buffers again (`S.snd.reseed`), renders the interface sounds again and plays the sound it belongs to. The press of the click sits at 2900 Hz, below the 3200 Hz of the page and open sounds, so it sounds less sharp. Wind and creaks read it from a random point, so they never repeat. Typing reads it from a random point too, with a pitch that varies by key; Backspace plays a lower, longer press (`S.snd.erase`), within 1 dB of the average key. `S.snd.typed(key)` picks between the two for a key typed into a field. Interface sounds also wait for a suspended audio context to resume, so the first press after loading or after a hidden tab is not lost. When the engine is built, `js/audio/sounds/interface.js` renders every burst of the click and of the control sounds through `S.snd.kit.prepare`, and `K.ready` waits for that work and for the context to run before any sound plays, so the first clicks after a fast load play whole. Tests watch played bursts through `S.snd.onBurst`.

Level changes go through `glide()`, which records each fade and starts the next one from the computed level. Browsers disagree on the value read from `AudioParam.value`, and a fade started from a wrong value is heard as a bang.

`js/audio/ui-sound.js` attaches the interface sounds to every control and keeps one action to one sound. A press owns the sound from the moment it goes down until 150 ms after release, so a click handler or a context menu run by that press adds no second click.

Setup > Sound > Control sounds (`settings.ctlSounds`, OFF in a new game) gives each kind of control its own sound. A control names its kind in `data-sound`, and `S.snd.ui(kind, value)` in `interface.js` plays it; with the setting OFF, or on an unmarked control, a press clicks. The kinds:

| Kind | Controls |
| --- | --- |
| `key` | The function bar keys |
| `toggle` | Option buttons, ON and OFF, SOUND and the mode switch |
| `fold` | Section headers in SECTIONS, HIDE INBOX and SHOW INBOX |
| `page`, `back` | Buttons and lines that open a Setup page, the tour's next step, and BACK or Escape on a Setup page |
| `action` | The first of several dialog buttons, USE and KEEP ON THIS COMPUTER. It is neutral: the game plays ok, error or unlock when the result is known |
| `close` | CLOSE, CANCEL, OK, DISMISS, NOT NOW, pane and window close buttons |
| `menu` | Context menu items, drop-down lists and the status lamps |
| `tab` | tmux windows, report tabs, POP OUT and the desktop depth gadget |
| `open` | Inbox rows and the MAIL and REPORT bar buttons |
| `switch` | The on/off rows of the title screen's OPTIONS panel |
| `choice` | Choosing one answer among several, such as FILLER or SUBSTANCE in the History lock |
| `flip` | TURN OVER and the picture of a two-sided card |
| `link` | Command links in the shell, VIEW and MESSAGE |
| `select` | FILES rows and report blanks |
| `slide` | Volume sliders, at a pitch that follows the value |

A new control takes the kind that matches what it does; an unknown kind plays the click. Each kind is within about 2 dB of the click. On the title screen the control sounds play 4 dB louder, through a gain on the interface bus. POWER ON (`data-sound="press"`) plays the press of the click alone, with no release, in either Control sounds setting. A control sound plays in place of the click: page, back, open and switch are tones alone, since a burst of noise before them would sound as a click. A mouse or pen press sounds when the primary button goes down; a right or middle press clicks. With Control sounds OFF, a plain click is split in two: the press as the button goes down and the release as it comes up, at least 35 ms later; a drag makes no release sound. Played apart, the two halves are equally loud, each with half the loudness of the whole click. With Control sounds ON, every press plays one whole sound: its kind, or the whole click on an unmarked control. Setup > Sound > Drive sound (`settings.hddSound`, ON by default) silences the hard drive's seeks when an entry or a page is read. Setup > Sound > Clicks (`settings.vClick`, 70 by default) sets the click's own level inside the interface channel: 50 plays it as designed, and 70 is 3 dB above that. The sound engine is built at the first press, key or tap on the page (`S.snd.initOnGesture`), since a browser refuses to start audio before a gesture and warns; where the browser reports user activation (`navigator.userActivation`), no context is made before it. The engine sets its levels at once when it is built, with no fade in from silence. The first sound after the context starts waits until the engine has rendered the interface sounds and the audio clock has run for the output latency the browser reports (60 to 250 ms), since the output device drops what plays while it opens; a context that stops running waits again at its next start. A control with a kind plays its sound whole on the press. A touch sounds with the click that follows it, so a scroll makes no sound. Desktop icons click, since a first click may only select them.

## Accessibility

`js/ui/a11y.js` adds live announcements, roles, names and states to the elements the game builds. It adds keyboard access to menus and to rows of buttons, and handles the focus of dialogs. The keys are listed under Keyboard in [Interface](interface.md).

It also runs the screen reader mode from Setup, which turns off the screen decoration and motion.
