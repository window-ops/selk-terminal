# Architecture

[Back to Developing Selk](../DEVELOPING.md)

## One global object

Every script is an immediately invoked function that adds its part to one global object, `window.SELK`, which the code calls `S`. There are no modules and no bundler. The load order in `index.html` is the dependency order:

1. Data: `js/data/notes.js`, `entries.js`, `story.js`, `endings.js`, `changenotes.js`
2. Core: `js/core/dom.js`, `state.js`, `i18n.js`, then `js/lang/en.js` and `js/core/context.js`
3. Audio, shell output, the interface parts, the game systems and the shell commands
4. `js/main.js`, which starts the game
5. `js/ui/a11y.js` and `js/dev/debug.js`, which wrap what the other scripts built and load last

A new script goes into `index.html` after everything it calls at load time, and raises `data-total` on `#loading` by one; so does a new stylesheet. A function called later, from an event or a command, can live in any file loaded before the call.

The chosen language loads at run time. `js/core/i18n.js` adds a `<script>` tag for `js/lang/<code>.js` and exposes the promise `S.i18n.ready`. `main.js` waits for it before it builds the screen, so every module starts in the chosen language. Switching language saves the choice and reloads the page.

The notes pages in `notes/` load a subset of the same scripts: `dom.js`, `state.js`, `i18n.js`, `en.js` and `notes/page-i18n.js`. The developer notes page adds the data files, `js/shell/render.js` and `js/dev/devnotes.js`. The trailers page adds `notes/trailer-player.js`, its own player for the two videos in `trailer/out/`; `trailers.html#feature` and `trailers.html#gameplay` open each one, and the game itself never loads them.

## Directory map

| Path | Contents |
| --- | --- |
| `js/data/` | Sections, entries, locks, reports, messages, handbook notes, endings, change notes |
| `js/core/` | DOM helpers, state and saving, localization, the situation (`S.ctx`), the event bus, the window API |
| `js/lang/` | One language pack per file |
| `js/shell/` | The terminal output queue, entry rendering, scrolling, listings and the shell commands |
| `js/game/` | Reports and transmission, mail, hints, the final decision, ending scenes, telemetry, the live camera |
| `js/games/` | Minigames and what they share: `pixel-font.js`, a 5 by 7 font for canvas text; `troika/`, the running game opened from `history/TROIKA.RUN`, one file per part (`core.js` lists them: the data, spawning, physics, gates, the bar, the frame, the economist's dialogue, the 2016 ending and the window) with its drawings in `troika/art/`; its sounds are `js/audio/sounds/troika.js` (the soundtrack), `troika-voice.js` (the economist's voice) and `troika-song.js` with `troika-office.js` and `troika-coda.js` (the themes of the ending); `disassembly/`, the repair game opened from `design/DISASSEMBLY.RUN`, one file per part (`core.js` lists them: the data, the rules, the input, the screens and the window) with its drawings in `disassembly/art/`. The parts of a game share one object, `S.troikaGame` or `S.disassemblyGame`, and its drawings `S.troikaArt` or `S.disassemblyArt` |
| `js/ui/` | tmux and desktop modes, windows, the status bar, dialogs, Setup, the tour, the context menu, accessibility |
| `js/audio/` | The sound engine (`sound.js`), the sound of every control (`ui-sound.js`), and `sounds/`, the sounds, one file per family |
| `js/dev/` | The debug panel and log, and the developer notes page |
| `css/` | The stylesheets: `crt/`, `ui/` and `themes/`, described in [Styles and themes](styles.md) |
| `notes/` | The notes pages, their stylesheet and their scripts |
| `img/` | Camera pictures shown with entries |
| `tools/` | `i18n-catalog.js`, the translation catalog, `test-ui.js`, the browser tests, `design-drawings.js`, `history-pictures.js` and `site-pictures.js`, which draw the Design sheets, the History pictures and the site camera pictures, and `pixel-sheet.js`, the raster they share |
| `docs/` | These documents |

## Code conventions

- Game scripts use `var`, function expressions and the browser APIs available without polyfills. Tools under `tools/` run in Node and use current syntax.
- Each file starts with a comment that says what it contains. Each block of related functions has a comment above it that says what the block does and, where it is not obvious, why.
- Comments and documents use plain sentences. They state what the code does, name the setting or the function involved, and leave out commentary on the code's quality.
- Visible text goes through `S.t` or its variants, with the full English sentence as the key.
- A module reads the situation from `S.ctx()` and announces changes with `S.emit`. Modes, the tour and the accessibility layer then stay out of game code.
