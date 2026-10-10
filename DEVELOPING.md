# Developing Selk

These documents describe how the game is built: the data files, the progression that reads them, the saved state, the two interfaces and the tools. They name data keys and mechanisms and leave the answers out. The passwords, report answers and endings are on the [developer notes page](notes/devnotes.html), which contains spoilers.

[README.md](README.md) covers running the game and the licenses. [TRANSLATING.md](TRANSLATING.md) covers language files.

| Document | Contents |
| --- | --- |
| [Running and debugging](docs/running.md) | Serving the game, the debug panel, the debug log and Fast mode |
| [Architecture](docs/architecture.md) | The `SELK` object, the load order, the directory map and the code conventions |
| [Game data](docs/game-data.md) | Sections, entries, notes, locks, reports, messages and endings, and how to change them |
| [Progression](docs/progression.md) | How the game moves from sign-in to the ending |
| [Saved state](docs/saved-state.md) | The saved fields and the other storage keys |
| [Interface](docs/interface.md) | The situation, events, windows in both modes, the status line, dialogs and keyboard use |
| [Interface rules](docs/interface-rules.md) | The theme, color, type, spacing, headings, lists, links, documents of several pages and interface text: the rules every screen follows |
| [Styles and themes](docs/styles.md) | The stylesheets, motion, the color roles, the two themes and the stacking order |
| [Shell](docs/shell.md) | Commands, where results go, Shell-only DESK and the output rhythm |
| [The euro crisis in the game](docs/euro-crisis.md) | Where the euro crisis appears in the game and why; the public version is `notes/euro-crisis.html` |
| [Site OS and the real techniques](docs/site-os.md) | What the game does that Debian does not, the CESEA component for each in the change notes, and the real technique behind it |
| [Finale, sound and accessibility](docs/finale-sound-accessibility.md) | The ending stage, the synthesized sound and the accessibility layer |
| [Localization](docs/localization.md) | Translated text in code and the catalog tool |
| [Tests](docs/tests.md) | The browser tests and their groups |
