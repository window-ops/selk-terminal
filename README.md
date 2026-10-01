# Selk

NOTE: THIS IS A MANUAL COPY OF THE REPOSITORY [FROM GITLAB](https://gitlab.com/window-ops-web/selk-terminal) BECAUSE I AM TOO TIRED TO ALSO MIRROR THIS REPOSITORY. MAY BE OUTDATED.

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

The interface works with keyboard, mouse, and touch. The function bar lists the F1-F10 shortcuts:

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

MAIL shows the inbox and, beside it, the MESSAGE pane, where messages open. Drag the line between two panes to resize them; a double click returns to the default size.

On mobile, use the bottom navigation buttons to switch between the available views. In MAIL, HIDE INBOX gives the open message the whole page and SHOW INBOX brings the list back.

## Project notes

- [Game concept](notes/concept.html)
- [Glossary](notes/glossary.html)
- [Political and design context](notes/themes.html)
- [Drawings](notes/drawings.html)
- [Credits and research references](notes/credits.html)
- [Warranty and licenses](notes/warranty.html)
- [Developer notes](notes/devnotes.html) (spoilers)
- [Developing Selk](DEVELOPING.md)

The Selk scenes were independently composed with two RADIOSOL images as visual references. They depict the colony at different states and dates.

## Code layout

The game is plain JavaScript loaded by `index.html` in dependency order. Every file adds its part to the shared `SELK` object.

- `js/core/`: shared DOM helpers, game state and saving, localization, the context rules and the event bus
- `js/audio/`: the synthesized sounds and the interface sounds shared by every control
- `js/shell/`: the terminal screen, text rendering, scrolling and the shell commands
- `js/game/`: mail, hints, reports, the ending, telemetry and the live camera
- `js/ui/`: tmux and desktop modes, the status bar, dialogs, Setup, the Storage page, the tour and the other interface parts
- `js/dev/`: the debug panel and the developer notes page
- `js/data/`, `js/lang/`: story data and language files

[DEVELOPING.md](DEVELOPING.md) describes the data files, the progression, the saved state, the interfaces and the development tools.

## Languages

The game ships in English and Romanian. Each language is one file in `js/lang/`, and the language menu sits at the top of Setup and of every notes page. Every language other than English is generated automatically, and the game says so wherever it is in use. [TRANSLATING.md](TRANSLATING.md) describes the file format. `node tools/i18n-catalog.js template xx` starts a new language, `check xx` lists what a language file lacks, and `unused xx` lists what it has that the game no longer uses.

## Credits

Concept and art direction: miculpionier (window-ops). Claude (Anthropic) and Codex (OpenAI) assisted with code and implementation.

## Licenses

- Program source code: [GNU GPL-3.0](licenses/GPL-3.0.txt)
- Original story and documentation: [CC BY-SA 4.0](licenses/CC-BY-SA-4.0.txt)
- Original Selk illustrations: [CC0 1.0](licenses/CC0-1.0.txt), to the extent of the author's rights. RADIOSOL reference images are not included and are not covered by this dedication.
- Fonts: [SIL Open Font License 1.1](licenses/OFL-1.1.txt)

See [Warranty and licenses](notes/warranty.html) for details. Third-party materials retain their respective licenses.
