# Game data

[Back to Developing Selk](../DEVELOPING.md)

All story content sits in `js/data/`. The code reads these objects and contains no story text of its own, apart from interface lines.

## Sections and entries (`entries.js`)

`SELK.SECTIONS` lists the sections in display order. A section has an `id`, a `name`, and `locked: true` when it needs a password.

`SELK.ENTRIES` is filled by calls to `E(id, by, body, extra)`:

- `id` is `section/NAME`, for example `home/README`. Report answers, links and hints refer to entries by this id.
- `by` is the author label shown with the entry. Some labels are false on purpose; `SELK.FALSE_LABELS` in `story.js` lists them.
- `body` is the text, in the markup described in [TRANSLATING.md](../TRANSLATING.md): `{text|note-key}` for handbook notes, `[[section/ID]]` for links, `@NAME@` for the player's name, and two or more spaces between a label and a value for a field line.
- `extra` adds optional fields: `table: true` for a table, `img` and `cap` for a camera picture and its caption, `action` for the entries in Home that open a screen (`settings`, `tutorial`, `about`, `storage`), and `sys`, `path`, `fmt` and `cols` for system files, which render as files at their `path`.

## Handbook notes (`notes.js`)

`SELK.NOTES` maps a note key to `[title, text, edition year]`. The edition year is part of the puzzle: some notes are outdated.

## Locks, reports and messages (`story.js`)

`SELK.LOCKS` maps a locked section id to its password `parts`, a list of progressive `hint` lines, and a one-line `nudge` shown in the unlock dialog. A password with two parts is typed as two words.

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
