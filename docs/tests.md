# Tests

[Back to Developing Selk](../DEVELOPING.md)

`tools/test-ui.js` drives the game in Chromium through Playwright. It serves the project on a free local port, signs in with Fast mode and text at once, and prints PASS or FAIL for each check. Install Playwright once, outside the game:

```sh
npm install --no-save playwright
npx playwright install chromium
node tools/test-ui.js
node tools/test-ui.js hover,errors
```

A full run takes about six minutes, most of it spent on message timers. The exit code is 1 when a check fails.

| Group | Checks |
| --- | --- |
| `hover` | The status line message stays under the pointer (resting, arriving later, with its enter events lost) and under the keyboard focus, in both modes. It clears after the pointer leaves, with leave events lost, with the pointer on the free space of the bar, after a mouse click, and after a mode switch |
| `auto` | Scroll long messages moves the message when ON, and leaves it still when OFF, in screen reader mode and with motion reduced |
| `errors` | Error messages in every mode and value, typed errors with SHELL in view, and the keys of the error dialog over UNLOCK |
| `desktop` | SHELL opens at 80 by 24 at every text size inside the desk; window z-index values stay bounded, distinct and ordered |
| `story` | Both orders of REPORT 3A and 3B: the text of MSG004 and MSG005, REPORT 4 opening, and each reply notice joining "Delivered to Earth" |
| `tooltips` | Every Setup tooltip keeps one size for one text at two window widths |
| `rows` | The Setup rows hidden on a touch phone, in a narrow window with a mouse, and in screen reader mode |
| `ro` | The Romanian pack covers the new interface text |
| `keys` | Arrow keys and Enter in the END SESSION, UNLOCK and Setup dialogs, in both modes |
| `layers` | No interface layer reaches the screen effects; the debug panel sits under them and rises above the ending's stage |
| `shell` | Blank changes in a row share one output group; a message read on the desktop opens MESSAGE alone |
| `phone` | The error dialog fits a phone and no drawn pointer is detected |
| `setup` | PAGES opens sections and the settings under a setting on pages that BACK and Escape leave; SECTIONS and FULL LIST nest those settings under their row |
| `speed` | Text appears is greyed at AT ONCE while motion is reduced, and the saved choice returns with full motion |
| `sounds` | With Control sounds ON, marked controls play their kind, Escape on a page plays back, a right press plays no kind and UNLOCK plays the neutral action; with it OFF, no kind plays |

Tests read the game through `window.SELK` and pass functions to `page.evaluate`. A string passed there runs as an expression: a string holding an arrow function returns the function, and the check reads nothing.
