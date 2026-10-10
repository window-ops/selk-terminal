# Interface rules

[Back to Developing Selk](../DEVELOPING.md)

These are the guidelines for how the game looks and reads: the theme, color, type, spacing, headings, lists, links, navigation and interface text. Follow them for every new screen, pane, dialog and document. The other pages describe the code that applies them and link here. To change a guideline, change it on this page first, then in the code.

## The theme

The interface is the screen of SELK-T01, a CESEA thin client terminal from 2079 with an amber phosphor CRT of 80 by 30 characters. Everything inside the session belongs to that terminal.

| Part | Model | Look |
| --- | --- | --- |
| tmux mode | tmux, with the bars of Midnight Commander | Panes in single-line frames, the active pane in titan, F1 to F10 at the foot, the status bar under them |
| Desktop mode | The Amiga Workbench | Windows with striped title bars, close and depth gadgets, icons and drawers, requesters with hard shadows |
| Title screen | Neither | A plain frame in haze, before the terminal is switched on |

Guidelines:

- **Write inside the session as the terminal.** Text, files, logs and change notes read as output of SELK-T01, and name its programs, its hardware and its site.
- **Keep the game layer out of in-world text.** Setup, the title screen, the debug panel, sounds, phone layouts and browser saves belong to the game. [Site OS and the real techniques](site-os.md) lists them.
- **Give each screen the same content in both modes.** The mode changes the frame and the controls. Keep the content, its order and its spacing the same.

## Color

The colors are tokens in `css/tokens.css`. Use the token, never a color value.

| Token | Color | Use it for |
| --- | --- | --- |
| `--hall` | Dark gray | The background |
| `--haze` | Amber | Body text, titles and headings |
| `--dust` | Gray | Secondary text: labels, dates, descriptions, paths and notes |
| `--titan` | Orange | Links, warnings, the active pane and the tmux accents |
| `--rib` | Dark gray | Rules, dividers and the frames of inactive panes |
| `--flag` | Red | Errors and locked items |
| `--lamp` | Green | Success, and the installed mark in the change notes |

Some parts look different in tmux mode and in desktop mode. Style them with a role token. Each role token points to one of the colors above, and the mode decides which:

| Role token | In tmux mode | In desktop mode | Use it for |
| --- | --- | --- | --- |
| `--accent` | `--titan` | `--haze` | The control under the pointer or the keyboard focus, menu and list highlights, and the frame of tmux popups |
| `--on-accent` | `--hall` | `--hall` | Text drawn on `--accent` |
| `--select` | `--haze` | `--haze` | A chosen value or a selected row, drawn in reverse video |
| `--on-select` | `--hall` | `--hall` | Text drawn on `--select` |
| `--line` | `--rib` | `--rib` | Rules and dividers |
| `--line-strong` | `--dust` | `--dust` | Borders of buttons, option buttons and fields |
| `--deep` | near black | near black | The fill of desktop fields and of a pressed desktop button |

Guidelines:

- **Color headings haze and links titan.** Do not give a heading the link color.
- **Keep one meaning per color.** Use flag for errors and locks only, and lamp for success and installed versions only.
- **Mark a choice with reverse video:** `--on-select` text on `--select`, in both modes.
- **Lead with titan in tmux mode and with haze in desktop mode.** In desktop mode, keep titan for the title stripes.

## Type

| Font | Token | Use it for |
| --- | --- | --- |
| IBM Plex Mono | `--font-mono` | Body text, fields, tables and controls |
| VT323 | `--font-crt` | Titles: `.head`, `.entry-title`, pane headers, the desktop bar, the report paper and the ending |

Guidelines:

- **Write names and controls in capitals:** window kinds (FILES, VIEW, SHELL), section names in listings, page titles (CHANGE NOTES, COMMANDS AND KEYS), buttons (OK, CLOSE, DISMISS) and Setup labels.
- **Write headings inside a document in sentence case:** group headings, decade headings and the headings inside notes.
- **Write command words in lower case,** as they are typed: `ls`, `open`, `changenote`.
- **Mark what matters with space and color.** Do not use bold or italics for emphasis in body text. Medium weight (500) is for labels on the report paper, the status bar, toasts and the ending. Italics are for the agent's thoughts only.
- **Leave line endings to Pretty wrap.** When the player turns it on (Setup > Display > Pretty wrap), it keeps the last word of a block off a line of its own. [Styles and themes](styles.md) describes how.

## Spacing

Build every layout on the line box of 1.5em and its half, 0.75em.

- **Line box:** make every line, headings included, one line box of 1.5em.
- **Blocks:** put a gap of 0.75em above and below each command echo, block and paragraph of the shell, VIEW and MESSAGE. Make the gap above equal to the gap below. Headings take 0.5em below, as Headings explains.
- **Lines:** put no gap between the plain lines of a block: the rows of a list, the programs of a group, the changes of a version.
- **Ends:** give the first child of a container no top margin and the last child no bottom margin, so text starts and ends on the container's padding. The newest output of the shell ends on the log's own padding.
- **Popups:** in dialogs, toasts and the tour panel, put 0.6em between paragraphs.
- **No extra gaps:** give a block the rhythm's gap only. Do not add space to a heading or a list on top of it.

[Shell](shell.md) describes how the shell groups unechoed output so that the rhythm holds.

## Headings

- **Levels:** use the page title and at most two levels of headings under it.
- **Space:** give a heading 0.75em above and 0.5em below. The line box of IBM Plex Mono leaves more space under the text than above it, so these margins look equal.
- **Look:** haze, sentence case, with no rule under it. Set the page title in VT323 (`.entry-title` or `.head`).
- **Wording:** name what follows in a few words, with no full stop.

## Lists and tables

- **One left edge:** start every block, heading and first column on the same edge.
- **Full-width tables:** set a listing as a table (`.etable`) that fills the width of its pane, like every listing in the game.
- **Fixed columns:** when a page has several tables, give their columns fixed widths in characters (`ch`) with `table-layout: fixed`, so the columns line up from one table to the next. Keep names, versions and dates on one line (`white-space: nowrap`), and let only the last column wrap.
- **Items:** start an item with `- `, and continue a wrapped line under its text, past the dash, with a hanging indent of 2ch. Hide the dash from screen readers.
- **Field lists:** use `dl.fields`, with the label in dust and the value in haze, in two columns.
- **Narrow screens:** keep the short columns on one line and let the last column wrap.

## Links and controls

- **Command links:** make a link in the shell, VIEW or MESSAGE run a command (`data-cmd`, `S.runClick`). Draw it in titan and underlined (`.lnk`), with the `link` sound kind.
- **Buttons:** draw buttons in the look of the current theme; [Styles and themes](styles.md) describes the three themes.
- **Focus:** make every control reachable with Tab, and let the arrow keys move along rows of buttons. [Interface](interface.md) lists the keys.
- **Sounds:** give each control the sound kind of what it does; [Finale, sound and accessibility](finale-sound-accessibility.md) lists the kinds.

## Documents of several pages

Build any document of several pages like the change notes.

- **Path:** start each page with the path back up, for example CHANGE NOTES / Linux / 26.3. Make each step a link, and the current page plain text with `aria-current`.
- **Header:** put the title, one line about the page, and its date or its fields as plain lines with no gap.
- **Bar:** put one bar under the header, between two rules: the older or previous item at the left, the position in the middle, the newer or next item at the right.
- **Position:** count items from the oldest, which is 1.
- **Foot:** repeat the bar at the foot of a page with more than 12 rows, with the link up in the middle. Give a shorter page one bar.
- **Focus:** after a page change in VIEW, return the focus to the link in the same place, so the player can press OLDER or NEWER again.
- **What is left out:** say in a boxed note what the page leaves out, with a count. Show "[not listed yet]" for a link to a hidden item.
- **Listings:** set the items of each group in a full-width table under the group's heading, with the same fixed columns in every table of the page.
- **Footnotes:** link the first mention on a page of each term a player may not know (a processor, a protocol, a kernel feature) to a handbook note. The note opens under the page in VIEW, as a footnote, and the `note` command opens it anywhere.

## Interface text

- **Register:** write plain and neutral text in short sentences, with no marketing tone.
- **Errors:** say what failed and what to type next, for example "No section called {name}." or "Type {changenote} to list the programs."
- **Characters:** use the hyphen only, with no em dash or en dash. Use straight ASCII quotes in English text and in HTML. In `ui` and `story` values, use the quotation marks of the language, as [TRANSLATING.md](../TRANSLATING.md) lists.
- **Dates and times:** write DD-MM-YYYY, day first, and 24-hour UTC times (14-03-2097 07:21). In change notes, write MM-YYYY or the year alone where the record has no day.
- **Numbers and units:** use metric units with a space before the unit (48 MW, 94 K). In English, separate thousands with a space (1 180 m); other languages follow their own rule (Romanian 1.180 m, 7,0).
- **System text:** keep kernel messages, system files and change notes in English in every language.
- **Programs and languages:** say that a program is written in a language ("written in ECMAScript") and runs on a runtime ("runs on jsrt").

## Motion

- Play animations and transitions only under `html[data-motion="full"]`. Then reduced motion needs no override rules.
- Show text at the text speed of Setup, or at once while motion is reduced.
