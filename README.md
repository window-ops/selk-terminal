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

On mobile, use the bottom navigation buttons to switch between the available views.

## Project notes

- [Game concept](notes/concept.html)
- [Glossary](notes/glossary.html)
- [Political and design context](notes/themes.html)
- [Drawings](notes/drawings.html)
- [Credits and research references](notes/credits.html)
- [Warranty and licenses](notes/warranty.html)
- [Developer notes](notes/devnotes.html) (spoilers)

The Selk scenes were independently composed with two RADIOSOL images as visual references. They depict the colony at different states and dates.

## Credits

Concept and art direction: miculpionier (window-ops). Claude (Anthropic) and Codex (OpenAI) assisted with code and implementation.

## Licenses

- Program source code: [GNU GPL-3.0](licenses/GPL-3.0.txt)
- Original story and documentation: [CC BY-SA 4.0](licenses/CC-BY-SA-4.0.txt)
- Original Selk illustrations: [CC0 1.0](licenses/CC0-1.0.txt), to the extent of the author's rights. RADIOSOL reference images are not included and are not covered by this dedication.
- Fonts: [SIL Open Font License 1.1](licenses/OFL-1.1.txt)

See [Warranty and licenses](notes/warranty.html) for details. Third-party materials retain their respective licenses.
