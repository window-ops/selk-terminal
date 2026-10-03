# Localization

[Back to Developing Selk](../DEVELOPING.md)

Code passes English text to the translation functions:

- `S.t("text", vars)` for a line,
- `S.tn("{n} text", n)` for wording that depends on a number,
- `S.tc` for text with command words.

A language pack maps that English text to its translation. Story data is translated by merging the pack's `story` block over the data objects. [TRANSLATING.md](../TRANSLATING.md) describes the pack format.

## Catalog tool

`tools/i18n-catalog.js` keeps the packs in step with the code:

- `node tools/i18n-catalog.js check ro` lists what `ro.js` still lacks.
- `node tools/i18n-catalog.js unused ro` lists the entries of `ro.js` that no files use. An interface key counts as used when its text appears as a string literal or as element text in a script or page outside `js/lang/` and `tools/`. A key built from pieces at run time shows as unused, so a new lookup takes its key as one whole literal.
- `node tools/i18n-catalog.js keys` prints every interface key the scanner finds.

`check` and `unused` exit with code 1 when they find something.
