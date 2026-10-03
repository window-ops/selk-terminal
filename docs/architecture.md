# Architecture

[Back to Developing Selk](../DEVELOPING.md)

## One global object

Every script is an immediately invoked function that adds its part to one global object, `window.SELK`, which the code calls `S`. There are no modules and no bundler. The load order in `index.html` is the dependency order:

1. Data: `js/data/notes.js`, `entries.js`, `story.js`, `endings.js`
2. Core: `js/core/dom.js`, `state.js`, `i18n.js`, then `js/lang/en.js` and `js/core/context.js`
3. Audio, shell output, the interface parts, the game systems and the shell commands
4. `js/main.js`, which starts the game
5. `js/ui/a11y.js` and `js/dev/debug.js`, which wrap what the other scripts built and load last

A new script goes into `index.html` after everything it calls at load time. A function called later, from an event or a command, can live in any file loaded before the call.

The chosen language loads at run time. `js/core/i18n.js` adds a `<script>` tag for `js/lang/<code>.js` and exposes the promise `S.i18n.ready`. `main.js` waits for it before it builds the screen, so every module starts in the chosen language. Switching language saves the choice and reloads the page.

The notes pages in `notes/` load a subset of the same scripts: `dom.js`, `state.js`, `i18n.js`, `en.js` and `notes/page-i18n.js`. The developer notes page adds the data files, `js/shell/render.js` and `js/dev/devnotes.js`.

## Directory map

| Path | Contents |
| --- | --- |
| `js/data/` | Sections, entries, locks, reports, messages, handbook notes, endings |
| `js/core/` | DOM helpers, state and saving, localization, the situation (`S.ctx`), the event bus, the window API |
| `js/lang/` | One language pack per file |
| `js/shell/` | The terminal output queue, entry rendering, scrolling, listings and the shell commands |
| `js/game/` | Reports and transmission, mail, hints, the final decision, ending scenes, telemetry, the live camera |
| `js/ui/` | tmux and desktop modes, windows, the status bar, dialogs, Setup, the tour, the context menu, accessibility |
| `js/audio/` | Synthesized sound and interface sounds |
| `js/dev/` | The debug panel and log, and the developer notes page |
| `css/` | The stylesheets: `crt/`, `ui/` and `themes/`, described in [Styles and themes](styles.md) |
| `notes/` | The notes pages, their stylesheet and their scripts |
| `img/` | Camera pictures shown with entries |
| `tools/` | `i18n-catalog.js`, the translation catalog, and `test-ui.js`, the browser tests |
| `docs/` | These documents |

## Code conventions

- Game scripts use `var`, function expressions and the browser APIs available without polyfills. Tools under `tools/` run in Node and use current syntax.
- Each file starts with a comment that says what it contains. Each block of related functions has a comment above it that says what the block does and, where it is not obvious, why.
- Comments and documents use plain sentences. They state what the code does, name the setting or the function involved, and leave out commentary on the code's quality.
- Visible text goes through `S.t` or its variants, with the full English sentence as the key.
- A module reads the situation from `S.ctx()` and announces changes with `S.emit`. Modes, the tour and the accessibility layer then stay out of game code.
