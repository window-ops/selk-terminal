# Selk

Selk is a short, browser-based investigation game set at a fictional research and construction site inside the real Selk crater on Titan. Read the site's files, follow the evidence, complete reports, and decide what happens to the base.

The game explores possible microbial life, automated infrastructure, and turbocapitalism. Its setting imagines a future led by an Eastern European space agency. The Selk Operating System, CESEA, HX Holdings, and the mission are fictional.

## Run locally

The game is a static website. It has no build step, package installation, or external runtime dependencies.

1. Open a terminal in the project root.
2. Start a local web server:

   ```sh
   python -m http.server 8000
   ```

   On Windows, `py -m http.server 8000` may be used if `python` is not available.

3. Open [http://localhost:8000](http://localhost:8000) in a browser.

## How to play

Explore entries in FILES, use their clues to unlock restricted sections, and fill the blanks in REPORT with entry names. The HINTS page provides progressive clues. Your progress is saved in the browser.

The interface works with keyboard, mouse, and touch. A right click, or a press held for half a second on a touch screen, opens the context menu. The function bar lists the F1-F10 shortcuts:

| Key | Action |
| --- | --- |
| F1 | Help |
| F2 | Mail |
| F3 | View |
| F4 | Use the selected entry |
| F5 | Report |
| F6 | Hints |
| F7 | Unlock a section |
| F8 | Watch |
| F9 | Setup |
| F10 | Exit |

MAIL shows the inbox and, beside it, the MESSAGE pane, where messages open. In tmux mode, Setup > Display > Sole pane frames OFF draws a pane that is alone in its window without border or header; right-click the pane, or press and hold it on a touch screen, for CLOSE, POP IN or SHOW INBOX. Drag the line between two panes to resize them; a double click returns to the default size.

Setup (F9) opens on a list of sections, each on its own page; BACK or Escape returns. Settings that belong to another one open from its MORE button. Setup view switches to SECTIONS or FULL LIST, which show every setting on one page. Sound > Control sounds gives each kind of control its own sound, and Sound > Clicks sets the level of the click.

On mobile, use the bottom navigation buttons to switch between the available views. In MAIL, HIDE INBOX gives the open message the whole page and SHOW INBOX brings the list back.

### Playing in the shell

The whole game can be played by typing. Type `help` for the list of commands. To keep every typed result in the shell, open Setup (F9) and set Text and input > Shell results to IN SHELL. Entries, messages, report pages, hints and telemetry then print as text in SHELL:

- `ls`, `cd` and `open` read the files, and `unlock` opens a locked section.
- `mail` lists the messages and `mail 2` reads one.
- `report` lists the report pages and prints the open one; `report 2` prints another, and `report decision` prints the final DECISION page once it is open. `fill 2 NAME` fills blank 2, `unfill 2` empties it and `submit` sends the page.
- `watch` prints the site telemetry once.
- `decide` opens the final decision, where the number keys choose.

The SHELL OUTPUT group has three more rows, which act in tmux mode. Two of them act while Shell results is IN SHELL:

- **Panel results** sets what the FILES panel, the F keys and the status bar do. IN VIEW opens their windows only, so the shell and the panes stay separate. BOTH opens their windows and prints their results in the shell.
- **Shell-only DESK** keeps SHELL alone on DESK, including when the shell was popped out into its own window. MAIL and WATCH stay available, and messages still open in MESSAGE. In SINGLE layout or on narrow screens, FILES and VIEW are normally hidden; a direct request to open either reveals it temporarily, until the next typed command. Reports opened from MAIL still print in SHELL.

A row that another Setup choice would make usable stays in view, grayed, with the reason beside it. Display > Setup screen > Unavailable settings > HIDE leaves those rows out until they can apply. In desktop mode these rows, Layout and Redirect notices are grayed, since they act in tmux mode; switching Mode to TMUX makes them usable again. Redirect notices is grayed while Shell results is IN SHELL, since the note marks typed results that open in a window.

## Project notes

- [Game concept](notes/concept.html)
- [Glossary](notes/glossary.html)
- [Political and design context](notes/themes.html)
- [Drawings](notes/drawings.html)
- [Trailers](notes/trailers.html): the feature and gameplay trailers, also at `notes/trailers.html#feature` and `#gameplay`
- [Credits and research references](notes/credits.html)
- [Warranty and licenses](notes/warranty.html)
- [Developer notes](notes/devnotes.html) (spoilers)
- [Developing Selk](DEVELOPING.md)

The Selk scenes were independently composed with two RADIOSOL images as visual references. They depict the colony at different states and dates.

## Languages

The game ships in English and Romanian. Each language is one file in `js/lang/`, and the language menu sits at the top of Setup and of every notes page. Every language other than English is generated automatically, and the game says so wherever it is in use. [TRANSLATING.md](TRANSLATING.md) describes the file format. `node tools/i18n-catalog.js template xx` starts a new language, `check xx` lists what a language file lacks, and `unused xx` lists what it has that the game no longer uses.

## Credits

- Concept and art direction: miculpionier (window-ops)
- Code generation: Claude (Anthropic), with Codex (OpenAI) as secondary tool while Claude was at its usage limit. Most code was reviewed for functionality, performance, and integration with game mechanics
- SVG graphics: Generated by Claude following specifications, reviewed and revised for visual consistency and design intent
- JavaScript implementation: Generated by Claude, reviewed for logic, performance, and alignment with game mechanics. Includes procedural sound synthesis
- CSS styling: Generated by Claude, reviewed and adjusted for layout, responsiveness, and visual polish

## Licenses

- Program source code: [GNU GPL-3.0](licenses/GPL-3.0.txt)
- Original story and documentation: [CC BY-SA 4.0](licenses/CC-BY-SA-4.0.txt)
- Original Selk illustrations: [CC0 1.0](licenses/CC0-1.0.txt), to the extent of the author's rights. RADIOSOL reference images are not included and are not covered by this dedication.
- Fonts: [SIL Open Font License 1.1](licenses/OFL-1.1.txt)

See [Warranty and licenses](notes/warranty.html) for details. Third-party materials retain their respective licenses.
