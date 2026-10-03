# Styles and themes

[Back to Developing Selk](../DEVELOPING.md)

## Stylesheets

`index.html` links the files in this order. Later files restyle earlier ones, so a file that overrides another comes after it.

| File | Contents |
| --- | --- |
| `css/tokens.css` | Fonts, the palette, the colour roles, the grip mask and the stacking order |
| `css/crt/monitor.css` | The page reset, the room, the monitor case, the badge and lamps, and the FULL SCREEN frame |
| `css/crt/screen.css` | The screen and the glass: scanlines, flicker, glow, power-on, interference, the CRT extras and `body.cinema` |
| `css/ui/base.css` | Text colours, links, buttons, focus, scrolling areas, text block margins, the grip, the drag label and screen reader text |
| `css/ui/tables.css` | Field lists, entry tables, system files and JSON |
| `css/ui/panes.css` | tmux panes, splits, pane headers and dividers |
| `css/ui/shell.css` | The shell log, its output rhythm, entries, notes and messages in it, and the command line |
| `css/ui/files.css` | FILES: the two panels, the info strip and USE |
| `css/ui/views.css` | VIEW, MAIL, WATCH, REPORT tabs, the decision page and the Storage page rows |
| `css/ui/report.css` | The report paper |
| `css/ui/fbar.css` | The function bar |
| `css/ui/statusbar.css` | The tmux status bar, the status line message, bar buttons and lamps, and the status pop-up |
| `css/ui/dialogs.css` | The shape of dialogs in both modes, the error dialog and the popup button highlight |
| `css/ui/setup.css` | Setup rows, option buttons, the drop-down list, the tooltip, nested rows and the three views |
| `css/ui/title.css` | The title screen |
| `css/ui/desktop.css` | The desktop bar, backdrop, icons and windows |
| `css/ui/menus.css` | The context menu and the window switcher |
| `css/ui/toasts.css` | The notification stack, toasts, the tour panel and its spotlight |
| `css/ui/debug.css` | The DEBUG panel |
| `css/ui/ending.css` | The decision fade and the ending's stage |
| `css/themes/tmux.css`, `css/themes/desktop.css` | The popups of each mode |
| `css/cursors.css` | The pixel cursors, also used by the notes pages |

Each file keeps its narrow-screen rules in a `@media (max-width: 700px)` block at its end.

## Motion

Every animation and transition plays only under `html[data-motion="full"]`, which `S.syncContext` sets from Setup > Motion, the system setting and screen reader mode. Reduced motion therefore needs no override rules.

## Palette and roles

The palette in `tokens.css` names the site's colours: `--hall` (background), `--rib` (lines), `--haze` (text), `--dust` (secondary text), `--titan` (orange), `--flag` (errors), `--lamp` (success).

Components that the two modes draw differently read roles:

| Role | Value | Use |
| --- | --- | --- |
| `--accent`, `--on-accent` | titan, hall in tmux mode; haze, hall in desktop mode | The control under the pointer or the keyboard focus, menu and list highlights, and the frame of tmux popups |
| `--select`, `--on-select` | haze, hall | A chosen value or a selected row, in reverse video |
| `--line` | rib | Rules and dividers |
| `--line-strong` | dust | Borders of buttons, option buttons and fields |
| `--deep` | near black | The fill of desktop fields and of a pressed desktop button |

Titan orange is the primary colour of tmux mode. It marks the active pane, the status bar, the popup frames, focus and hover. Desktop mode sets `--accent` to haze, the colour of its frames, so menus, lists, focus and the default button match the frame; the orange stays in the title stripes. Haze in reverse video marks what is chosen in both modes. Every button border uses `--line-strong`, which keeps it readable against the background.

## Themes

The files in `css/themes/` give every popup one look per mode, read from `data-mode` on `<html>`. The popups are dialogs, toasts, the tour panel, the context menu, Setup drop-down lists, the status pop-up and the window switcher. Narrow screens always use tmux.

**tmux** follows a tmux display-popup.

- A single-line frame in the accent colour, no shadow, and no dimming of the panes behind.
- The title of a dialog, and the label of a toast or the tour panel, sits in the top border in a small frame of its own, so the border runs into it.
- Buttons are text in a thin border, all alike. None is highlighted until the player points at it or moves the focus to it; then it shows in reverse video (haze), as the chosen item of a tmux menu.
- Fields are a filled line with an accent underline while focused.

**Desktop** follows a Workbench requester.

- A 2 px haze frame with a hard shadow. Menus and lists keep a 1 px frame.
- The striped title bar of the desktop windows. In windows, dialogs, toasts and the tour, the title sits on a label that starts at the bar's left edge and fills its height, and the stripes fill the rest. The close and depth gadgets of a window sit centred in slots with equal space on each side. Dialogs carry no gadgets, since they close through their buttons. Toasts and the tour panel use the same bar.
- Body text set flush left. The content starts 0.6em under the title bar in a dialog, a toast and the tour, with no extra top margin.
- Flat controls with no fill. Buttons and fields share one 1 px border and one height; fields are a shade darker than the popup. Every button looks alike; Enter still chooses the first one. A hover or the keyboard focus fills a button with haze, and a press with dust.
- In a dialog, the positive choice sits at the left and the negative at the right; a single button sits at the right. The button row has no top padding, and its sides line up with the body text.

Buttons on the two bars take the bar's dark text colour and a border of the same colour. The bar buttons have no hover states. The keyboard focus draws a thin outline outside the control, so nothing on a bar changes size.

Titles and labels use haze text in both modes. In tmux the frame around them is orange.

Every toast closes through DISMISS in its button row. The uplink and save lamps on the bars open a pop-up, so they have a hover state: a faint fill and a border drawn on the space they already reserve.

## Text blocks

In popups and panes, a first child has no top margin and a last child no bottom margin, so text starts and ends on the container's padding. Paragraphs are 0.6em apart.

Setup > Display > Pretty wrap (`settings.prettyWrap`, OFF in a new game) keeps the last word of every text block off a line of its own. It uses the rule of the Setup tooltips, `S.wrapLast` in `js/core/dom.js`, which joins the last word to the word before it with a no-break space. `S.prettyWrap` applies it to the text blocks on the page and to each block added later; shell, VIEW and MESSAGE text is wrapped in `S.scr.reveal` before it appears. Turning the option off restores the original spaces. The option also sets `body.pretty-wrap`, which adds `text-wrap: pretty` where the browser supports it.

The title screen buttons have haze borders. A hover, the keyboard focus or a switched-on toggle fills them with haze. The notes pages always wrap this way (`notes/wrap-pretty.js` covers browsers without the CSS property).

## Stacking order

The z-index values live in `tokens.css`:

| Layer | Token | Value |
| --- | --- | --- |
| Panes and the desk | `--z-panes` | 1 |
| Function bar and status bar | `--z-bars` | 2 |
| Context menu | `--z-menu` | 4 |
| Toasts and the tour panel | `--z-toast` | 5 |
| Dialogs | `--z-dialog` | 6 |
| The error dialog | `--z-error` | 7 |
| Status pop-up and window switcher | `--z-popover` | 8 |
| Debug panel | `--z-debug` | 99 |
| Screen effects (the glass) | `--z-effects` | 1000 |
| The ending's stage | `--z-ending` | 1001 |
| Debug panel while the ending plays | `--z-debug-ending` | 1002 |

Interface layers stay below 100, and the glass covers all of them. Only the ending's stage sits above the effects; once it covers the screen, `body.cinema` hides the glass. The debug panel rises above the stage while the stage is on the screen.

Desktop windows number their own z-index inside the desk's layer, and Setup tooltips and drop-down lists number theirs inside their dialog. Those values stay inside their parent layer.
