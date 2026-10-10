# Shell

[Back to Developing Selk](../DEVELOPING.md)

`S.run(text, echo, origin)` in `js/shell/commands.js` parses and runs a command. The command table sits in the same file. Shared helpers sit in `S.cmd` (`js/shell/cmdkit.js`), extended by `listing.js`, `mail.js` and `hints.js`.

`ntorch`, `claude`, `codex` and `chatgpt`, left out of help, start the agent joke (`js/shell/agent.js`, `S.agent`): one to two minutes of streamed reasoning about the site under a changing status word, then the slogan of a 1955 Soviet poster with what it is in Cyrillic letters. While the agent is open, the prompt reads `agent>` and typed lines go to `S.agent.input`, matched in English or Romanian, with or without diacritics, as one word or a question in the player's words: `help` lists them with their one-letter shortcuts (more, author, meaning, am-1, lenin, who, site, why, hello, latin, again, hide, show, overthinking, clear, help, exit). hide and show fold the thoughts of every reasoning block, and clicking a block's heading folds that block. Told while it reasons that it is overthinking, it cuts the reasoning short and answers; any other line typed meanwhile it notes in the stream and reasons on (`S.agent.interrupt`); Escape interrupts it and Ctrl+C stops it and closes the agent. The log follows the reasoning only while it is scrolled to its foot.

A command can run while the agent is open: from a link, from FILES, from a key or from the tmux prompt. It runs in the shell, so its echo shows the shell prompt with the current section (`S.shellPromptText` in `js/main.js`), for example `selk:/site>`. Lines typed at the `agent>` prompt still echo `agent>`.

## System commands

`dmesg` and `changenote` show system text of SELK-T01. Their text stays in English in every language, like the files in System.

### dmesg

- **Help:** left out of help, like `date` and `whoami`.
- **Output:** the kernel ring buffer of SELK-T01, which the supervisors group may read. It shows the boot, then NFS loading when the supervisor signed in.
- **Times:** seconds since POWER ON. `S.bootAt` and `S.signInAt` in `js/main.js` record the two moments.
- **Data:** `BOOT_LOG` and `SIGN_IN_LOG` in `js/shell/commands.js`, one line per message: the seconds, then the text. `!` before the text marks a warning.

### changenote

- **Help:** listed in help.
- **Opened by:** `changenote`, and System > changelog (`system/changelog`, path `/usr/share/doc`, action `changenote`).
- **Data:** `SELK.CHANGENOTES` and `SELK.CHANGENOTE_GROUPS` in `js/data/changenotes.js`. The header of that file describes the format.

The document has three levels of pages:

| Command | Page | Contents, from the top |
| --- | --- | --- |
| `changenote` | Program list | The title and one line about the list; then one heading per group, and under it a full-width table with one row per program: its name and installed version, both links, and what it is |
| `changenote NAME` | Program | The path back to the list; the name and what it is; the fields Installed, Changelog and Group; the bar; the versions in one full-width table per decade, under the decade's heading, newest first, with the installed one marked |
| `changenote NAME VERSION` | Version | The path back up; the program and version, the title of the version, its date and the installed mark; the bar; the changes |

The bar sits between two rules. Its left end links the previous item (OLDER, or the previous program) and its right end the next item (NEWER, or the next program). Its middle shows the position, for example "3 of 10". Versions are counted from the oldest, which is 1, so the installed version of a program is usually the last. A page with more than 12 versions or changes (`CN_LONG`) repeats the bar at its foot, with the link up (ALL VERSIONS or ALL PROGRAMS) in the middle; a shorter page has one bar.

The layout and the navigation follow [Interface rules](interface-rules.md), under Documents of several pages.

Rules for the pages:

- **Changes:** each change is a list item with a small gap under it, and a change that wraps continues under its text. A line of the notes that starts with `# ` is a section heading, and any other line that does not start with `- ` is a heading inside the section.
- **Links in the notes:** `[[program version|text]]` links a version, `[[program|text]]` links a program, and `[[section/ENTRY|text]]` links a database entry.
- **Footnotes:** `SELK.CHANGENOTE_TERMS` lists obscure terms (R-64, dm-verity, PKINIT and others) with the key of a handbook note in `js/data/notes.js`. `cnText` makes the first mention of each note on a page a handbook link (`.term`, `note KEY`), which opens the note under the page in VIEW. A new term needs a note in `notes.js`, its Romanian text under `story.notes` in `js/lang/ro.js`, and a line in `SELK.CHANGENOTE_TERMS`.
- **Locked sections:** a program whose `sec` is still locked is left out. The program list, and only the program list, says in a boxed note how many programs are left out; it counts only sections already on the list of sections, so the note goes once every listed section is open. A link to such a program shows "[not listed yet]", and a boxed note under the changes counts these links.
- **Where a page opens:** each link runs `changenote` again, so the page opens where the result of a clicked command goes.
- **Focus:** `data-cn-key` names the place of each link, so `cnShow` can return the focus to the link in the same place after a page change.
- **Styles:** the `.changenote` rules in `css/ui/shell.css`, after [Interface rules](interface-rules.md).
- **Programs that belong in the notes:** only programs that make sense on SELK-T01 in the story. [Site OS and the real techniques](site-os.md) lists the mechanics that belong to the game alone, such as sounds and phone support, which have no change notes.

### Versions to keep in step

The terminal's versions appear in several places. Change them together:

| Version | Places |
| --- | --- |
| Kernel 26.3.55-cesea-site, GCC 85.2.0, binutils 2.186 | `KVER` and `BOOT_LOG` in `js/shell/commands.js`, the panic in `index.html`, Linux, GCC and Binutils in `js/data/changenotes.js` |
| Boot ROM 7.2.1 | The DMI lines in `BOOT_LOG` and in the panic, ABOUT in `js/ui/about.js`, Boot ROM in `js/data/changenotes.js` |
| tmux 10.7 | ABOUT in `js/ui/about.js` and its Romanian text, tmux in `js/data/changenotes.js` |
| CESEA Site OS 7.2 | The boot banner `CESEA SITE OS 7.2 (c) 2079 CESEA` in `js/main.js` and in the trailer, `system/os-release`, ABOUT, Site OS in `js/data/changenotes.js` |

The boot banner keeps the year 2079: the terminal runs release 7.2 of 2079, and over-the-air updates up to 7.2.61 brought the kernel and the toolchain of 2096.

Output goes through the queue in `js/shell/screen.js`. `S.scr.line`, `S.scr.type`, `S.scr.node` and `S.scr.task` print in order, so a sequence of lines and actions can be written as a list of calls. `js/shell/render.js` turns entry bodies into HTML for the game and for the developer notes page.

Command words and fixed arguments are translated. The English word always works as well, and `S.tc` fills placeholders such as `{unlock}` with the word of the current language.

Every step of the game, `decide` included, can be taken by typing. The final choice list takes number keys.

## Where results go

While a command runs, `S.cmdOrigin` records where it came from:

| Origin | Source | How it is called |
| --- | --- | --- |
| `typed` | The command line, the tmux prompt (Ctrl+B then :), and HOME / README opened at first sign-in | `S.run(text)`, or `S.run(text, false, "typed")` for the README |
| `panel` | The FILES panel, the F keys and function bar, the status bar buttons and the Alt shortcuts | `S.run(text, false)` |
| `click` | Command links in the output, report page buttons, dialogs, the context menu, the tour and desktop icons | `S.runClick(text)` or `S.runClick(text, false)` |

`route()` in the same file reads the origin and the settings and gives two answers. `S.outShell()` says whether to print the result in the SHELL log. `S.outWindow()` says whether to open its window: VIEW, MAIL and MESSAGE, REPORT, WATCH or FILES. Both can be true. The first matching row decides:

| Situation | `S.outShell()` | `S.outWindow()` |
| --- | --- | --- |
| tmux session not attached yet (title, sign-in) | true | false |
| `typed` | Shell results (`settings.shellOut`) is IN SHELL | Shell results is IN VIEW |
| `panel` in tmux mode, with Shell results IN SHELL | Panel results (`settings.panelOut`) is BOTH | true |
| Any other case: `panel` in desktop mode or with Shell results IN VIEW, and every `click` | false | true |

`S.display` (entries, notes, help), `S.showMail`, and the `mail`, `report`, `watch` and `unlock` commands ask both. `S.display` and `S.showMail` take a function that builds the element, since it runs once for each place the result goes: one element cannot sit in the log and in a window at once.

In the shell the results are text versions: the mail list, a report list in two columns, a report page with its blanks as `[______]` or the filled entry, the DECISION page, and a telemetry snapshot without the live camera. `unlock` then changes the shell into the opened section.

A typed command whose result opens VIEW or MESSAGE, and prints nothing in the shell, leaves the note "Output redirected to VIEW." or "Output redirected to MAIL." in the shell while Setup > Text and input > Shell output > Redirect notices is ON. Only typed commands leave this note.

## Shell-only DESK

Setup > Text and input > Shell output > Shell-only DESK (`settings.deskShell`) acts in tmux mode while Shell results is IN SHELL. `shellOnly()` in `js/ui/tmux.js` decides it from the settings and the session flag `T.open.revealed`.

- In the FOUR PANES and THREE PANES layouts, the window is named SHELL and shows only the shell. REPORT and the separate SHELL window of a popped-out shell are left out, and POP OUT is unavailable. MAIL and WATCH keep their windows, and clicking a message still opens MESSAGE in MAIL.
- In the SINGLE layout and on narrow screens, FILES and VIEW are left out of the window list, and so out of the bottom bar.
- An explicit `T.goto` request for FILES or VIEW sets `T.open.revealed` and rebuilds the full layout. Nothing else restores the panes. MAIL is unaffected. REPORT stays hidden: opening a report from MAIL, or with `report`, prints it in the shell and keeps the mode. `S.run` calls `T.endReveal()` before every typed command, which clears the flag and hides FILES and VIEW again.

Changing Shell-only DESK or Shell results in Setup rebuilds the windows at once. In desktop mode the row is grayed with the reason "Used in tmux mode".

## Output rhythm

Shell output follows the rhythm in [Interface rules](interface-rules.md#spacing): line boxes of 1.5em, gaps of 0.75em above and below each block, and no gap between plain lines. The styles are in `css/ui/shell.css`. This section describes how the shell groups output so that the rhythm holds.

Output with no echoed command line above it is wrapped by `S.scr.group(fn, kind)` in one `div.out-group`, with the same 0.75em above and below. This covers the result of every unechoed command (for example the SOUND button in the status bar), the uplink notice of new mail, and the line printed when a blank is filled by dragging, USE or F4. Inside an echoed command `S.scr.group` adds nothing, since the echo already gives the gap.

`kind` names the type of output. When the newest element in the log is a group of the same kind, the new output joins it, and a run of similar notices reads as one block. The kinds in use:

| Kind | Output |
| --- | --- |
| `report-blank` | A blank filled or emptied without a typed command |
| `uplink` | The notice of a new message |
| `cmd:<word>` | An unechoed command, by its English command word |

An uplink notice that arrives straight after the "Delivered to Earth" line of a transmission continues it with no gap (`joinDelivered()` in `js/game/mail.js`, classes `after-tx` and `before-uplink`).
