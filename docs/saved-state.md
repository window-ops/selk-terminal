# Saved state

[Back to Developing Selk](../DEVELOPING.md)

`js/core/state.js` keeps `S.state`, saved as JSON under the key `selk-terminal-v1`. The save goes to `sessionStorage` (this tab) by default. Once the player chooses to keep it, it goes to `localStorage` (this computer), and the key `selk-save-local` is set.

## Fields

| Field | Meaning |
| --- | --- |
| `name`, `cwd` | The player's name and the shell's current section |
| `unlocked` | Ids of the locked sections the player opened |
| `reports` | Per report key: `fill` (four entry ids or `null`) and `done` |
| `active`, `sel` | The open report page and the selected entry |
| `mail`, `pending` | Delivered messages with their time, read flag and text variant `v`, and the queued message ids |
| `clock` | Site time in minutes after 14-03-2097 07:21 UTC; `S.fmtTime` formats it |
| `uplinkHistory` | The last 24 transmissions and receptions, for the status bar |
| `hintsOn`, `light`, `hintsShown` | The hint page switch, the hint light and the lines revealed |
| `read` | Entries the player opened |
| `decision`, `preDecision`, `ended`, `endings`, `lastEnding` | The final decision and the ending records |
| `designNoted` | The shell announced the Design section. It survives loading the save from before the decision, like `endings`, and so do `design` and `history` in `unlocked`. |
| `tut` | The tour: `on`, `step`, `kind` (`simple` or `technical`), `refresh` for the refresher, and `rolled` for a panel rolled up on a narrow screen. `kind` outlives a finished tour, so the kind dialog offers it first next time. |
| `settings` | Every Setup value (below) |

## Settings

`sv` is the settings schema version. The other values:

| Key | Setup row |
| --- | --- |
| `shellOut` (`view` or `shell`) | Shell results |
| `panelOut` (`view` or `both`) | Panel results |
| `deskShell` | Shell-only DESK |
| `unavailable` (`show` or `hide`) | Unavailable settings |
| `soloFrames` | Sole pane frames |
| `errors` (`auto`, `dialog` or `bar`) | Error messages |
| `barScroll` | Scroll long messages |
| `prettyWrap` | Pretty wrap |
| `setupView` (`pages`, `sections` or `list`) | Setup view |
| `ctlSounds` | Control sounds |
| `speed` | Text appears; read through `S.textSpeed()`, which returns `instant` while motion is reduced |
| `fast` | Fast mode |
| `mailList` (`dual` or `single`) | The inbox on narrow screens |
| `splits` | Pane sizes set by dragging a divider |

## Versions and old saves

The state has `version: 1`. `S.load` merges a saved game over a fresh one, so a new field needs only a default in `fresh()` or `defaults()`. When the meaning of a saved setting changes, `S.load` converts older saves. For example, saves with `panelOut: "shell"` from before BOTH existed are converted to `"both"`.

## Other keys

| Key | Kept in | Meaning |
| --- | --- | --- |
| `selk-shell-history` | `sessionStorage` | Typed commands |
| `selk-wipe-on-refresh` | `localStorage` | Start a new game on every reload, for testing |
| `selk-save-nudged` | `sessionStorage` | The save reminder was shown |
| `selk-lang` | The save's own storage (`S.store()`) | A language chosen on a notes page before any game was saved |

The Storage page in the game lists all of them.
