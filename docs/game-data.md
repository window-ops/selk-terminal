# Game data

[Back to Developing Selk](../DEVELOPING.md)

All story content sits in `js/data/`. The code reads these objects and contains no story text of its own, apart from interface lines.

## Sections and entries (`entries.js`)

`SELK.SECTIONS` lists the sections in display order. A section has an `id`, a `name`, and `locked: true` when it needs a password.

`SELK.ENTRIES` is filled by calls to `E(id, by, body, extra)`:

- `id` is `section/NAME`, for example `home/README`. Report answers, links and hints refer to entries by this id.
- `by` is the author label shown with the entry. Some labels are false on purpose; `SELK.FALSE_LABELS` in `story.js` lists them.
- `body` is the text, in the markup described in [TRANSLATING.md](../TRANSLATING.md): `{text|note-key}` for handbook notes, `[[section/ID]]` for links, `@NAME@` for the player's name, and two or more spaces between a label and a value for a field line.
- `extra` adds optional fields: `table: true` for a table, `img` and `cap` for a camera picture and its caption, `action` for the entries that open a screen (`settings`, `tutorial`, `about` and `storage` in Home, `troika` in History, which opens the running game in `js/games/troika/`, and `disassembly` in Design, which opens the repair game in `js/games/disassembly/`), and `sys`, `path`, `fmt` and `cols` for system files, which render as files at their `path`.

## Handbook notes (`notes.js`)

`SELK.NOTES` maps a note key to `[title, text, edition year]`. The edition year is part of the puzzle: some notes are outdated.

## Locks, reports and messages (`story.js`)

`SELK.LOCKS` maps a locked section id to its password `parts`, a list of progressive `hint` lines, a one-line `nudge` shown in the unlock dialog, an optional `note` and `clues` (a boxed list of label and text pairs) that replace the locked-section text, `key: true` for a password entered as an activation key, one box per part, and `sort` for a password chosen line by line. A password with two parts is typed as two words.

`SELK.REPORTS` maps a report key (`R1`, `R2`, `R3A`, `R3B`, `R4`) to a page:

- `code` is the number shown to the player. `title` and `brief` head the page.
- `lines` has four blanks. Each line is `[text before, [accepted entry ids], text after]`, and a blank accepts any id in its list.
- `hints` gives one hint per blank.
- `reply` names the message sent back when the page is accepted.

`SELK.MESSAGES` maps a message id (`MSG001` to `MSG006`) to its `body` and to what it opens: `opens` lists report keys, and `decision: true` opens the final decision.

A message whose text depends on another page names that page in `awaits` and carries a second text in `received`. `MSG004` and `MSG005` work this way. Each awaits the other follow-up page. `body` is sent while that page is still outstanding, and `received` is sent when the page was accepted before the message is delivered.

## Endings (`endings.js`)

`SELK.ENDINGS` lists the choices of the final decision in the order they are shown. An ending has:

- an `id` and a `label`,
- a `mood` for the music (`hope`, `hollow` or `dark`),
- `needs`, a report key that must be accepted first, or `null`,
- an optional `route`,
- its content: the decision `log`, the office's `reply`, the `title` and four `epilogue` lines.

An ending with `choice: true` asks one more question and carries two branches, `yes` and `no`, each a full ending with its own id. `SELK.ENDING_COUNT` is the number of distinct endings, branches included.

## The Design and History sections

Design is a locked section that appears in `/` after POWER once the player has seen an ending. Its section in `entries.js` has `egg: true`; so does `system/product_serial`. History follows it in `/` and has `after: "design"`: it appears once Design is open, and the shell says so. `S.sections()` and `S.entryShown` in `state.js` leave such a section and its entries out until then, and `S.sectionById` returns `null` for it, so commands treat it as missing. A section opened from the debug panel shows at once. Design therefore shows after LOAD SAVE on the endgame card.

Design's lock in `SELK.LOCKS` is the terminal serial, split into the groups its `hint` lines build. The lock has `key: true`: the unlock dialog shows one box per group, sized to the group, like an activation key, and `unlock design` takes the serial whole, in groups or with dashes. Its answer is in no entry, so the lock also has a `note` and `clues`, the factory note with the given initials and date as a boxed list, which the locked-section dialog, the unlock dialog and the shell show in place of the usual text (`S.lockClues` in `common.js`). The clues are the puzzle for EU citizens: they name none of the facts a European would know (the languages of the pairs, the conformity mark, the Bucharest ring, the Swiss railways' initials). `plain` lists those facts for players outside the EU; I AM NOT AN EU CITIZEN in the unlock dialog adds them under the clues (`S.lockPlain`), and the choice is kept in the save as `euHelp`, so `unlock design` in the shell shows them too.

History's lock has a `sort`: `choices` are the letter and label of each choice, and `items` are lines by Brian Cox with their sources. The unlock dialog shows each line with one button per choice, and the shell lists the lines and takes one letter per line (`unlock history SFFSSFSF`). Its `note` presents it as the media test from the supervisor's selection.

Design's entries are design specs, one fact per row. Each has an `img` drawn by `node tools/design-drawings.js` into `img/design/`. History's entries are articles from the 2020s to 2097: `article: true` makes the body paragraphs, one per line, and `facts` adds a table under them, first line the header. Their pictures are drawn by `node tools/history-pictures.js` into `img/history/`. An entry may also have `flip`, a list of `[picture, caption]` sides shown one at a time with a FLIP button (the citizen pass in `history/2091-SELECTION`). `@ENDING@` in a body is replaced by the ending chosen last (`S.end.decisionLabel`). The site camera pictures in `img/` (MAST-01, CRANE-L, FOOTING-B and the 2083 storm) are drawn by `node tools/site-pictures.js`. MAST-01 there follows its entries, and the ending scenes (`js/game/scenes.js`) draw the same tower, without its cables in the view through the shelter window: a printed ice shell, symmetric, tapering in four tiers from 9 pixels to 3 (18 m to 6 m) with tie bands, HALL-R at the foot, an outrigger on each side, three tight guy levels at 350, 700 and 1 050 m, the slack cables of level 4 tied off between the tower and the level 3 guy, with the cables and outriggers in the proportions of the Design sheet (`img/design/mast-01.svg`), CRANE-L parked on the west face at 680 m and the AMBER vent with the beacon on the built top. The tools use `tools/pixel-sheet.js`, which has a 3 by 5 font and a 5 by 7 font with the letters of the 24 official languages (the pass is drawn at 320 by 160 in it); the SVGs are written one element per line. Both tools exit with an error when a label touches a line, another label or the frame.

## Changing the story

**An entry:** add an `E(...)` call in `entries.js` in its section, and a translation under `story.entries` in each language pack. If a report blank should accept it, add its id to that blank's list in `story.js`.

**A report page:** add it to `SELK.REPORTS` with four lines, four hints and a reply message. Add the reply to `SELK.MESSAGES`, and list the new key in the `opens` of the message that delivers it. A page that waits for other pages needs a rule in `S.reportReady`.

**A locked section:** mark the section `locked: true`, add it to `SELK.LOCKS`, and check that each password part appears in an entry the player can reach. TRANSLATING.md lists where each current password appears, so translators keep it findable.

**An ending:** add it to `SELK.ENDINGS` and raise `SELK.ENDING_COUNT` (by two for a `choice` ending). Add three panels to `SCENES` and three descriptions to `DESCRIBE` in `scenes.js`, and add its translation under `story.endings`.

After any of these, update the graph on the developer notes page. Its boxes, labels and arrows are placed by hand in `js/dev/devnotes.js`; the rest of that page is generated from the data. Then run:

```sh
node tools/i18n-catalog.js check ro
node tools/i18n-catalog.js unused ro
```
