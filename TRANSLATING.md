# Translating Selk

Each language is one file, `js/lang/<code>.js`, where `<code>` is the ISO 639-1 code (`ro`, `de`). English lives in the game itself and in `js/lang/en.js`; anything a language file leaves out falls back to English.

## Adding a language

1. Generate the skeleton: `node tools/i18n-catalog.js template ro > js/lang/ro.js`
2. Translate every value in the file. Keys stay in English.
3. Add the code to `AVAILABLE` in `js/core/i18n.js`, and the language's own name to `LANGS` in the same file.
4. Check what is still missing: `node tools/i18n-catalog.js check ro`
5. Check what is no longer used: `node tools/i18n-catalog.js unused ro`. Run it after any change to the game's text as well, since a reworded line in the code leaves its old key behind in every language file.

Both checks exit with code 1 when they find something. An interface key counts as used when its English text appears whole in a script or page, so code that builds a key from pieces makes that key look unused.

Every language other than English shows a notice in Setup and on the notes pages saying that it was generated automatically. Remove the notice for a language only after a native speaker has reviewed the whole file.

## File structure

```js
SELK.i18n.register("ro", {
  meta: { name: "Română", dir: "ltr" },
  ui: { "English text": "translation", "{n} SETTINGS": { one: "...", few: "...", other: "..." } },
  commands: { open: ["deschide"], help: ["ajutor"] },
  args: { on: ["pornit"], off: ["oprit"], yes: ["da"], no: ["nu"] },
  story: { sections, entries, messages, notes, reports, locks, endings },
  pages: { concept: "<h1>...</h1>", "concept:title": "..." }
});
```

### ui

The key is the English text exactly as the game passes it. The value is the translation. Keep these parts unchanged:

- Placeholders in braces: `{n}`, `{name}`, `{code}`. Move them to wherever the sentence needs them.
- Command placeholders such as `{open}`, `{hints}`, `{on}`. The game fills them with the command words from the same file.
- Names and codes: SELK, CESEA, AUDIT DESK 4, MAST-01, SV-4, R-09, TMUX, file names such as `bio/GATE` or `HOME / README`, key names such as F4 and Ctrl+B. Key names may follow the local keyboard (German `Strg`).

A value can be an object of plural forms when the wording depends on a number. The categories are those of `Intl.PluralRules` for the language: `one`, `two`, `few`, `many`, `other`. Romanian uses `one`, `few` and `other`, and `other` carries the "de" form (`20 de intrări`). Check the set for another language with `new Intl.PluralRules("de").resolvedOptions().pluralCategories`.

Labels padded with spaces in the English original (boot checks, mail headers) are padded by the code, so the translation needs no spaces.

### commands and args

The first word in each list is shown in help and messages. Every word in the list is accepted when typed, and so is the English word. Matching ignores case and accents, so list only words that differ in their letters. Prefer short imperatives or nouns that a player would type.

### story

Only the fields in the skeleton are translated. Passwords (`locks.*.parts`), entry ids, report answer ids and system files (entries with `sys`, such as `/etc/hosts`) stay as they are. In report `lines`, the middle element stays `null`, which keeps the English answer ids.

Most messages have one `body`. `MSG004` and `MSG005` also have `received`, the text the office sends when the other follow-up page reached it first. Translate both.

Entry bodies use a small markup:

- `{shown text|note-key}` opens a handbook note. Translate the shown text and keep the key.
- `[[section/ID]]` or `[[section/ID|shown text]]` links an entry. Keep the id; translate the shown text.
- `@NAME@` is the player's name.
- A line of the form `Label` + two or more spaces + `value` becomes a two-column field. Keep at least two spaces between them.
- Tables (entries with `table: true`) keep their column layout; translate the cells.

Passwords must still be findable. The archive password SERKET appears in `site/SELK`, the comms number 55183 in `structure/STOPPED-REPAIRS`, the export number 118 in `units/SV-1`, and AMBER and 2291 in `archive/LAB.R4` and `export/MANIFEST-2291`. Keep those words and numbers in the translated text.

### pages

`pages[id]` is the inner HTML of `<main>` in `notes/<id>.html`, and `pages[id + ":title"]` is the window title. Keep every element id and class, since `devnotes.html` fills its containers by id. Use straight ASCII quotes in the HTML.

## Language conventions

- Write in the register of the original: plain, neutral, no marketing tone.
- Use the language's own quotation marks in the `ui` and `story` values (Romanian „...” and «...», German „...“, French « ... »). Use straight quotes inside `pages` HTML.
- Use the language's decimal separator and unit spacing (Romanian `7,0`, `117%` closed up, `-179 °C`).
- Do not use the em dash or en dash. Rewrite the sentence.
- Romanian: comma-below ș and ț, never the cedilla forms, and the current DOOM3 norm (niciun, nicio, sunt).
