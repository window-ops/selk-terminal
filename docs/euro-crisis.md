# The euro crisis in the game

[Back to Developing Selk](../DEVELOPING.md)

Selk is set in 2097, and many of its texts point back to the euro crisis of 2009 to 2015. This page lists where the crisis appears in the game, in the code and in the data, and why. The public version, without code, is `notes/euro-crisis.html`.

## Where it appears

| Place | File | What it shows |
| --- | --- | --- |
| Loading screen | `index.html`, the tips of `#loading` | The Greek loans of 2010, the economy and unemployment of 2008 to 2013, the referendum of 2015, and the Romanian wage cuts of 2010 |
| History section | `history/2045-REFORMS` in `js/data/entries.js` | The reforms that answer the objections of the crisis years |
| TROIKA.RUN | `history/TROIKA.RUN`, `js/games/troika/` | Greece runs from 2010 to 2015 ahead of the Troika, one decision a year |
| Design lock | `design` in `SELK.LOCKS`, `js/data/story.js` | A serial built on the euro notes and the countries of the crisis; the answer is on the developer notes page |
| Change notes | `tpaneza` in `js/data/changenotes.js` | A program that forecasts debt crises on Earth, so the units know which supplies may stop |
| Handbook notes | `troika`, `debtcrisis` in `js/data/notes.js` | The terms behind the change notes |

## Why

In the game's history, the crisis is one of the reasons why the Federation of Europe was founded. By 2041 Greece was still repaying the loans of 2010 to 2018, on terms set to run until 2070. The Federation was formed that year, in part as a permanent solution to the crisis, with one budget and one debt shared by its member states. Its reforms of 2045 address the objections the crisis made concrete: an unelected executive body, a central bank outside democratic control, fiscal rules that imposed austerity, and treaties that placed market rules beyond the reach of elections.

The crisis also shaped the setting. Traditionally, investment and industry gathered in the richer states of the union while the poorer states took the cuts. CESEA reverses that pattern: it places the work of building on other worlds in Central and Eastern Europe. [notes/themes.html](../notes/themes.html) describes this in terms of core and periphery. On Titan, a debt crisis on Earth can stop launches and part supplies years later, and TPANEZA forecasts such crises for the construction units. TROIKA.RUN, part of the archive's teaching set, presents each year of the Greek crisis as a decision.

## Guidelines

- State facts about the crisis with their year and their source, as the loading tips do.
- Keep the in-world texts to what CESEA would record: dates, decisions and their effects.
- Keep the answer of the Design lock out of public pages.
