# Developing Selk

This document describes how the game is built: the data files, the progression that reads them, the saved state, the two interfaces and the tools. It names data keys and mechanisms and leaves the answers out. The passwords, report answers and endings are listed on the [developer notes page](notes/devnotes.html), which contains spoilers.

[README.md](README.md) covers running the game and the licenses. [TRANSLATING.md](TRANSLATING.md) covers language files.

## Running during development

The game is a static site with no build step. Serve the project root with any web server, for example `python -m http.server 8000`, and open `http://localhost:8000`.

Setup > Debug has three switches:

- **Debug panel** shows a movable panel with the current situation and buttons that act on the game, among them: deliver the next message, fill the open report page with correct answers, submit it, unlock every section, open the final decision, trigger a gust or a creak, advance the clock by one hour, and switch the interface mode. It lives in `js/dev/debug.js`. The panel stays inside the screen when the window is resized, stays attached while the shell prints, and stays usable above the ending.
- **Debug log** prints commands, events, window changes, dialogs, messages, shell output, mail, transmissions, saves and settings to the browser console. Filter the console by `SELK`.
- **Fast mode** shortens the game's waits: mail arrives after 80 ms, a report transmission counts down in 0.3 s, and the finale plays its lines and pauses at a fraction of their length. It is saved as `settings.fast`, and code reads it through the read-only property `S.fast`, defined in `js/core/state.js`.

## Architecture

Every script is an immediately invoked function that adds its part to one global object, `window.SELK`, which the code calls `S`. There are no modules and no bundler. The load order in `index.html` is the dependency order:

1. Data: `js/data/notes.js`, `entries.js`, `story.js`, `endings.js`
2. Core: `js/core/dom.js`, `state.js`, `i18n.js`, then `js/lang/en.js` and `js/core/context.js`
3. Audio, shell output, the interface parts, the game systems and the shell commands
4. `js/main.js`, which starts the game
5. `js/ui/a11y.js` and `js/dev/debug.js`, which wrap what the other scripts built and therefore load last

A new script goes into `index.html` after everything it calls at load time. Functions called later, from an event or a command, can live in any file loaded before the call happens.

The chosen language loads at run time. `js/core/i18n.js` adds a `<script>` tag for `js/lang/<code>.js` and exposes the promise `S.i18n.ready`. `main.js` waits for it before it builds the screen, so every module starts in the chosen language. Switching language saves the choice and reloads the page.

The notes pages in `notes/` load a subset of the same scripts: `dom.js`, `state.js`, `i18n.js`, `en.js` and `notes/page-i18n.js`. The developer notes page adds the data files, `js/shell/render.js` and `js/dev/devnotes.js`.

### Directory map

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
| `css/` | `tokens.css` (fonts and variables), `crt.css` (screen and glass), `terminal.css` (interface), `report.css` (report paper), `cursors.css` (pixel cursors) |
| `notes/` | The notes pages, their stylesheet and their scripts |
| `img/` | Camera pictures shown with entries |
| `tools/` | `i18n-catalog.js`, the translation catalog |

## Game data

All story content sits in `js/data/`. The code reads these objects and contains no story text of its own, apart from interface lines.

### Sections and entries (`entries.js`)

`SELK.SECTIONS` lists the sections in display order. A section has an `id`, a `name`, and `locked: true` when it needs a password.

`SELK.ENTRIES` is filled by calls to `E(id, by, body, extra)`:

- `id` is `section/NAME`, for example `home/README`. Report answers, links and hints refer to entries by this id.
- `by` is the author label shown with the entry. Some labels are false on purpose; `SELK.FALSE_LABELS` in `story.js` lists them.
- `body` is the text, in the markup described in TRANSLATING.md: `{text|note-key}` for handbook notes, `[[section/ID]]` for links, `@NAME@` for the player's name, and two or more spaces between a label and a value for a field line.
- `extra` adds optional fields: `table: true` for a table, `img` and `cap` for a camera picture and its caption, `action` for the entries in Home that open a screen (`settings`, `tutorial`, `about`, `storage`), and `sys`, `path`, `fmt` and `cols` for system files, which render as files at their `path`.

### Handbook notes (`notes.js`)

`SELK.NOTES` maps a note key to `[title, text, edition year]`. The edition year is part of the puzzle: some notes are outdated.

### Locks, reports and messages (`story.js`)

`SELK.LOCKS` maps a locked section id to its password `parts`, a list of progressive `hint` lines, and a one-line `nudge` shown in the unlock dialog. A password with two parts is typed as two words.

`SELK.REPORTS` maps a report key (`R1`, `R2`, `R3A`, `R3B`, `R4`) to a page:

- `code` is the number shown to the player, `title` and `brief` head the page.
- `lines` has four blanks. Each line is `[text before, [accepted entry ids], text after]`. A blank accepts any id in its list.
- `hints` gives one hint per blank.
- `reply` names the message sent back when the page is accepted.

`SELK.MESSAGES` maps a message id (`MSG001` to `MSG006`) to its `body` and to what it opens: `opens` lists report keys, and `decision: true` opens the final decision.

### Endings (`endings.js`)

`SELK.ENDINGS` lists the choices of the final decision in the order they are shown. An ending has an `id`, a `label`, a `mood` for the music (`hope`, `hollow` or `dark`), `needs` (a report key that must be accepted first, or `null`), an optional `route`, and its content: the decision `log`, the office's `reply`, the `title` and four `epilogue` lines. An ending with `choice: true` asks one more question and carries two branches, `yes` and `no`, each a full ending with its own id. `SELK.ENDING_COUNT` is the number of distinct endings, branches included.

## Progression

Everything below is driven by the data above.

1. **Sign-in:** After the player signs in for the first time, `main.js` queues `MSG001`. Returning players get their pending messages delivered again.
2. **Mail:** `S.queueMail(id, ms)` puts a message in `state.pending` and delivers it after the delay (80 ms in Fast mode). Delivery adds the message to `state.mail`, advances the site clock by 99 minutes (none for `MSG001`), and opens the report pages in the message's `opens` list.
3. **Reports:** The player fills a blank with an entry id, by dragging, with USE or F4, or with `fill`; `unfill` empties a blank. `submit` accepts the page only when all four blanks match. The page is then transmitted: a 79-step countdown standing for the 79-minute signal delay, which also advances the clock by 79 minutes. When it finishes the page is marked `done` and the reply message is queued 4 s later.
4. **Report 4:** `S.reportReady(key)` in `state.js` keeps `R4` closed until `R3A` or `R3B` is accepted. Both follow-up messages list `R4` in `opens`, and the page opens with whichever arrives first. The other follow-up page stays open.
5. **Locked sections:** `unlock SECTION PART ...` compares the typed parts with the lock, ignoring case. Unlocking depends only on the password; any locked section can be opened at any time.
6. **Hints:** Hints are hidden until the player types `hints on`. The hints page then shows the hints of every open report page and every locked section, each revealed one line at a time. `state.hintsShown` records how many lines of each are shown.
7. **Final decision:** `MSG006` sets `state.decision`. `decide` (in `js/game/ending.js`) saves a copy of the state as `state.preDecision`, plays the intro in the cinema, and lists the endings. An ending whose `needs` report is still open is shown disabled. Report 4 opens after one follow-up page, so the decision can open while the other page is still unsent; its ending becomes available once that page is accepted.
8. **Endgame:** After the film the ending is recorded in `state.endings` and `state.ended`. The endgame card returns at every sign-in until the player loads the save from before the decision or starts again from the title screen. CHOOSE AGAIN on the card restores that save in place and shows the choice list at once; TITLE SCREEN rebuilds the title screen without reloading the page.

## Saved state

`js/core/state.js` keeps `S.state`, saved as JSON under the key `selk-terminal-v1`. It goes to `sessionStorage` (this tab) by default and to `localStorage` (this computer) once the player chooses to keep it, which sets `selk-save-local`.

The main fields:

| Field | Meaning |
| --- | --- |
| `name`, `cwd` | The player's name and the shell's current section |
| `unlocked` | Ids of locked sections the player opened |
| `reports` | Per report key: `fill` (four entry ids or `null`) and `done` |
| `active`, `sel` | The open report page and the selected entry |
| `mail`, `pending` | Delivered messages with their time and read flag, and queued message ids |
| `clock` | Site time in minutes after 14-03-2097 07:21 UTC; `S.fmtTime` formats it |
| `uplinkHistory` | The last 24 transmissions and receptions, for the status bar |
| `hintsOn`, `light`, `hintsShown` | Hint page switch, hint light, lines revealed |
| `read` | Entries the player opened |
| `decision`, `preDecision`, `ended`, `endings`, `lastEnding` | Final decision and ending records |
| `settings` | Every Setup value; `sv` is the settings schema version. `shellOut` (`view` or `shell`) holds Shell results, `panelOut` (`view` or `both`) Panel results, `deskShell` Shell-only DESK, `unavailable` (`show` or `hide`) Unavailable settings, `soloFrames` Sole pane frames and `fast` Fast mode; `mailList` (`dual` or `single`) holds the narrow-screen inbox choice and `splits` the pane sizes set by dragging a divider |

The state has `version: 1`. `S.load` merges a saved game over a fresh one, so a new field needs only a default in `fresh()` or `defaults()`. When the meaning of a saved setting changes, `S.load` is where older saves are converted.

Other keys: `selk-shell-history` (typed commands, kept in `sessionStorage`), `selk-wipe-on-refresh` (start a new game on every reload, for testing), `selk-save-nudged` (the save reminder was shown) and `selk-lang` (a language chosen on a notes page before any game was saved). The Storage page in the game lists them all.

## Interface

### Situation and events

`S.ctx()` in `js/core/context.js` answers every question about the current situation: interface mode, narrow screen, keyboard present, screen reader mode, reduced motion, screen frame. `S.syncContext()` copies the answer onto `<html>` as `data-mode`, `data-sr`, `data-motion`, `data-frame`, `data-screen` and `data-keys`, so stylesheets follow the same rules. The same file decides which Setup rows are hidden and which are greyed, by one rule:

- **Hidden** (`S.SETTING_RULES`): no Setup choice can make the row apply. Mode and Layout on narrow screens, which always show one pane per page. Motion, Text appears, Scanlines, Flicker, Interference, Power-on, Rolling scanline, and Vignette and curvature in screen reader mode, where they change only visuals and a screen reader would still read them.
- **Greyed with a reason** (`S.SETTING_OFF`): another Setup choice makes the row apply, and the reason names it. Layout, Sole pane frames, Redirect notices, Panel results and Shell-only DESK in desktop mode ("Used in tmux mode"). Redirect notices while Shell results is IN SHELL ("Applies while Shell results is IN VIEW"). Panel results and Shell-only DESK while Shell results is IN VIEW ("Applies while Shell results is IN SHELL"). Rolling scanline while motion is reduced, and Vignette and curvature with the MONITOR frame.

Setup > Display > Unavailable settings (`settings.unavailable`) chooses whether greyed rows show: SHOW keeps them greyed with their reason, HIDE leaves them out until they can apply. A section with no row left is skipped. Hidden rows never show.

A new conditional row follows the same rule: hide it when only the screen or screen reader mode decides, grey it when a Setup choice does.

Game code announces what happened with `S.emit(name, data)`, for example `S.emit("submit")` or `S.emit("open:" + id)`. The tour, the accessibility layer and the debug log subscribe with `S.on(name, fn)`; `S.on("*", fn)` receives every event.

### Windows

The game has seven window kinds: `FILES`, `VIEW`, `REPORT`, `SHELL`, `MAIL`, `MESSAGE` and `WATCH`. `MAIL` is the inbox list and `MESSAGE` is its reader, which shows messages only; entries and handbook notes open in `VIEW`. In tmux mode the MAIL window holds both mail panes, side by side on a wide screen and stacked on a narrow one. Every split has a divider: dragging it, or focusing it and using the arrow keys, sets the share of the two panes between 15% and 85%. The size is saved in `settings.splits` under a key made of the split direction and the panes on each side, and a double click returns to the default. Game code asks for a kind through `S.ui.open(kind)`, `S.ui.isOpen(kind)`, `S.ui.close(kind)` and `S.ui.active()`, and the current mode decides how the kind is shown:

- **tmux mode** (`js/ui/tmux.js`) arranges panes in windows, with Ctrl+B keys. With Setup > Display > Sole pane frames OFF, a pane that is alone in its window and not zoomed is drawn bare: no border and no header. The header stays in the DOM, hidden, for the pane's accessible name, and its buttons (CLOSE, POP IN, HIDE INBOX and SHOW INBOX) are also in the pane's context menu. The context menu (`js/ui/contextmenu.js`) opens on a right click and on a touch or pen held still for 500 ms; iPhone and iPad Safari send no contextmenu event of their own, and on browsers that do, the gesture still opens one menu.
- **Desktop mode** (`js/ui/desktop.js`) shows icons, drawers and movable windows through `S.desk`.

Screens 700 px wide or narrower always use tmux mode with bottom navigation buttons; the saved choice returns on a wider screen. There the inbox sits above MESSAGE and takes the height of its rows, up to about half the window; HIDE INBOX in the MESSAGE header gives MESSAGE the whole page, and SHOW INBOX brings the list back. Panes that rebuild their content (the inbox, MESSAGE, REPORT) keep their scroll position through `S.keepScroll` in `js/core/dom.js`.

Until the saved settings are applied, `<html class="booting">` keeps the room hidden, so the default screen frame never shows for a moment at load.

The status bar repeats a notice only when no toast shows it: new mail and the transmission countdown appear as toasts. `S.howTo(topic)` in `js/ui/howto.js` returns instruction lines that name only the controls the player has.

### Shell

`S.run(text, echo, origin)` in `js/shell/commands.js` parses and runs a command. The command table sits in the same file, and shared helpers sit in `S.cmd` (`js/shell/cmdkit.js`, extended by `listing.js`, `mail.js` and `hints.js`). Output goes through the queue in `js/shell/screen.js`: `S.scr.line`, `S.scr.type`, `S.scr.node` and `S.scr.task` print in order, so a sequence of lines and actions can be written as a list of calls. `js/shell/render.js` turns entry bodies into HTML for both the game and the developer notes page.

#### Where results go

While a command runs, `S.cmdOrigin` records where it came from:

| Origin | Source | How it is called |
| --- | --- | --- |
| `typed` | The command line, the tmux prompt (Ctrl+B then :), and HOME / README opened at first sign-in | `S.run(text)`, or `S.run(text, false, "typed")` for the README |
| `panel` | The FILES panel, the F keys and function bar, the status bar buttons and the Alt shortcuts | `S.run(text, false)` |
| `click` | Command links in the output, report page buttons, dialogs, the context menu, the tour and desktop icons | `S.runClick(text)` or `S.runClick(text, false)` |

`route()` in the same file reads the origin and the settings and gives two answers, read through `S.outShell()` (print the result in the SHELL log) and `S.outWindow()` (open its window: VIEW, MAIL and MESSAGE, REPORT, WATCH, FILES). Both can be true. The first matching row decides:

| Situation | `S.outShell()` | `S.outWindow()` |
| --- | --- | --- |
| tmux session not attached yet (title, sign-in) | true | false |
| `typed` | Shell results (`settings.shellOut`) is IN SHELL | Shell results is IN VIEW |
| `panel` in tmux mode, Shell results IN SHELL | Panel results (`settings.panelOut`) is BOTH | true |
| anything else: `panel` in desktop mode or with Shell results IN VIEW, every `click` | false | true |

`S.display` (entries, notes, help), `S.showMail`, and the `mail`, `report`, `watch` and `unlock` commands ask both. `S.display` and `S.showMail` take a function that builds the element, since it runs once for each place the result goes; one element cannot sit in the log and in a window at once. In the shell the results are text versions: the mail list, a report list in two columns, a report page with its blanks as `[______]` or the filled entry, the DECISION page, and a telemetry snapshot without the live camera. `unlock` then changes the shell into the opened section. Saves from before BOTH existed that hold `panelOut: "shell"` are converted to `"both"` in `S.load`. Every step of the game, `decide` included, can be taken by typing; the final choice list takes number keys.

A typed command whose result opens VIEW or MESSAGE, and prints nothing in the shell, leaves the note "Output redirected to VIEW." or "Output redirected to MAIL." in the shell, while Setup > Redirect notices is ON. Only typed commands leave this note.

#### Shell-only DESK

Setup > Text and input > Shell-only DESK (`settings.deskShell`) acts in tmux mode while Shell results is IN SHELL. `shellOnly()` in `js/ui/tmux.js` decides it from the settings and the session flag `T.open.revealed`:

- In the FOUR PANES and THREE PANES layouts, the window is named SHELL and holds the shell alone. REPORT and the separate SHELL window of a popped-out shell are left out, and POP OUT is unavailable. MAIL and WATCH keep their windows; clicking a message still opens MESSAGE in MAIL.
- In the SINGLE layout and on narrow screens, FILES and VIEW are left out of the window list, and so out of the bottom bar.
- Only an explicit `T.goto` request for FILES or VIEW sets `T.open.revealed` and rebuilds the full layout; the panes are otherwise not restored automatically. MAIL is unaffected: clicking a message opens it in MESSAGE as usual. REPORT is not revealed: opening a report from MAIL (or using `report`) prints it in the shell instead, so the mode is not cancelled. `S.run` calls `T.endReveal()` before every typed command, which clears the flag and hides FILES and VIEW again.

Changing Shell-only DESK or Shell results in Setup rebuilds the windows at once. In desktop mode the row is greyed with the reason "Used in tmux mode" (see Situation and events).

#### Output rhythm

Shell output follows one rhythm: every line, headings included, is one line box of 1.5em, and a gap of 0.75em sits equally above and below each command echo, heading, block and paragraph. Plain lines follow each other with no gap. The last element in the log, and the last child of a last output group, has no bottom margin, so the newest output ends on the log's own padding. Output that has no echoed command line above it is wrapped by `S.scr.group(fn)` in one `div.out-group` with the same 0.75em above and below: the result of every unechoed command (for example the SOUND button in the status bar), the uplink notice of new mail, and the line printed when a blank is filled by dragging, USE or F4. Inside an echoed command `S.scr.group` adds nothing, since the echo already provides the gap. The rules sit at the top of `css/terminal.css`.

Command words and fixed arguments are translated. The English word always works as well, and `S.tc` fills placeholders such as `{unlock}` with the word of the current language.

### Finale

`js/ui/cinema.js` provides the black stage: typed lines, a choice list, pixel scenes with captions, a letter and a title card. `js/game/scenes.js` draws the scenes as SVG on a 160 by 90 grid. `SCENES` maps each ending id to its drawing functions, and `DESCRIBE` gives the text alternative for each panel, which the screen reader and the drawings page use.

### Sound and accessibility

`js/audio/sound.js` synthesizes every sound with the Web Audio API on separate volume buses: machine, wind, structure and interface. Each bus passes through a level stage (the Setup sliders) and a duck stage (the ending's hush). Level changes go through `glide()`, which records each fade and starts the next one from the computed level; reading `AudioParam.value` gives different answers in different browsers, and a fade started from a wrong value is heard as a bang. `js/audio/ui-sound.js` attaches the interface sounds to every control and keeps one action to one sound.

`js/ui/a11y.js` adds live announcements, roles, names and states to the elements the game builds, keyboard access to menus and focus handling for dialogs. It also runs the screen reader mode from Setup, which turns off the screen decoration and motion.

## Localization

Code passes English text to `S.t("text", vars)`, `S.tn("{n} text", n)` for number-dependent wording and `S.tc` for text with command words. A language pack maps that English text to its translation; story data is translated by merging the pack's `story` block over the data objects. TRANSLATING.md describes the pack format.

`tools/i18n-catalog.js` keeps the packs in step with the code:

- `node tools/i18n-catalog.js check ro` lists what `ro.js` still lacks.
- `node tools/i18n-catalog.js unused ro` lists the entries of `ro.js` that nothing uses. An interface key counts as used when its text appears as a string literal or as element text in any script or page outside `js/lang/` and `tools/`. Keys built from pieces at run time would be reported as unused, so a new lookup takes its key as a whole literal.
- `node tools/i18n-catalog.js keys` prints every interface key the scanner finds.

Both `check` and `unused` exit with code 1 when they find something.

## Changing the story

**An entry:** Add an `E(...)` call in `entries.js` in its section, and a translation under `story.entries` in each language pack. If a report blank should accept it, add its id to that blank's list in `story.js`.

**A report page:** Add it to `SELK.REPORTS` with four lines, four hints and a reply message; add the reply to `SELK.MESSAGES`, and list the new key in the `opens` of the message that should deliver it. A page that must wait for other pages needs a rule in `S.reportReady`.

**A locked section:** Mark the section `locked: true`, add its entry to `SELK.LOCKS`, and make sure each password part appears in an entry the player can reach. TRANSLATING.md lists where each current password appears, so translators keep it findable.

**An ending:** Add it to `SELK.ENDINGS`, raise `SELK.ENDING_COUNT` (by two for a `choice` ending), add three panels to `SCENES` and three descriptions to `DESCRIBE` in `scenes.js`, and add its translation under `story.endings`.

After any of these, update the graph on the developer notes page. Its boxes, labels and arrows are placed by hand in `js/dev/devnotes.js`, while the rest of that page is generated from the data. Then run:

```sh
node tools/i18n-catalog.js check ro
node tools/i18n-catalog.js unused ro
```

## Code conventions

- Game scripts use `var`, function expressions and the browser APIs available without polyfills. Tools under `tools/` run in Node and use current syntax.
- Each file starts with a comment that describes its contents, and each block of related functions has a comment above it that explains its purpose.
- Visible text goes through `S.t` or its variants, with the full English sentence as the key.
- A module reads the situation from `S.ctx()` and announces changes with `S.emit`, which keeps modes, the tour and the accessibility layer out of game code.
