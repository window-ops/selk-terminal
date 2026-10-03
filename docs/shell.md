# Shell

[Back to Developing Selk](../DEVELOPING.md)

`S.run(text, echo, origin)` in `js/shell/commands.js` parses and runs a command. The command table sits in the same file. Shared helpers sit in `S.cmd` (`js/shell/cmdkit.js`), extended by `listing.js`, `mail.js` and `hints.js`.

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

Changing Shell-only DESK or Shell results in Setup rebuilds the windows at once. In desktop mode the row is greyed with the reason "Used in tmux mode".

## Output rhythm

Shell output follows one rhythm. The rules are in `css/ui/shell.css`.

- Every line, headings included, is one line box of 1.5em.
- A gap of 0.75em sits equally above and below each command echo, heading, block and paragraph. Plain lines follow each other with no gap.
- The last element in the log, and the last child of a last output group, has no bottom margin, so the newest output ends on the log's own padding.

Output with no echoed command line above it is wrapped by `S.scr.group(fn, kind)` in one `div.out-group`, with the same 0.75em above and below. This covers the result of every unechoed command (for example the SOUND button in the status bar), the uplink notice of new mail, and the line printed when a blank is filled by dragging, USE or F4. Inside an echoed command `S.scr.group` adds nothing, since the echo already gives the gap.

`kind` names the type of output. When the newest element in the log is a group of the same kind, the new output joins it, and a run of similar notices reads as one block. The kinds in use:

| Kind | Output |
| --- | --- |
| `report-blank` | A blank filled or emptied without a typed command |
| `uplink` | The notice of a new message |
| `cmd:<word>` | An unechoed command, by its English command word |

An uplink notice that arrives straight after the "Delivered to Earth" line of a transmission continues it with no gap (`joinDelivered()` in `js/game/mail.js`, classes `after-tx` and `before-uplink`).
