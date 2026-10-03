# Interface

[Back to Developing Selk](../DEVELOPING.md)

## Situation and events

`S.ctx()` in `js/core/context.js` answers every question about the current situation: interface mode, narrow screen, keyboard present, pointer drawn, screen reader mode, reduced motion and screen frame. `S.syncContext()` copies the answer onto `<html>` as `data-mode`, `data-theme`, `data-sr`, `data-motion`, `data-frame`, `data-screen` and `data-keys`, and the stylesheets read the same attributes. `data-theme` names the popup theme: it follows the mode in the session and is `title` on the title screen (see [Styles and themes](styles.md)).

The same file decides which Setup rows are hidden and which are greyed, by one rule.

**Hidden** (`S.SETTING_RULES`): no Setup choice can make the row apply.

- Mode and Layout on narrow screens, which always show one pane per page.
- Cursor size on a device that draws no pointer, such as a phone or a tablet without a mouse. `pointer` in `S.ctx()` is false when no input has a fine pointer and no mouse has moved since the page loaded. The row returns once a mouse moves.
- Motion, Text appears, Scanlines, Flicker, Interference, Power-on, Rolling scanline, Vignette and curvature, and Scroll long messages in screen reader mode, which turns each of them off. Glow stays: screen reader mode leaves the glow on, and the row serves sighted players who use a screen reader.

**Greyed with a reason** (`S.SETTING_OFF`): another Setup choice makes the row apply, and the reason names that choice.

- Layout, Sole pane frames, Redirect notices, Panel results and Shell-only DESK in desktop mode: "Used in tmux mode".
- Redirect notices while Shell results is IN SHELL: "Applies while Shell results is IN VIEW".
- Panel results and Shell-only DESK while Shell results is IN VIEW: "Applies while Shell results is IN SHELL".
- Rolling scanline and Scroll long messages while motion is reduced, and Vignette and curvature with the MONITOR frame.
- Text appears while motion is reduced: "AT ONCE while motion is reduced". The row shows AT ONCE, and `S.textSpeed()` returns `instant`; the saved choice returns with full motion.

Setup > Display > Setup screen > Unavailable settings (`settings.unavailable`) chooses whether greyed rows show. SHOW keeps them greyed with their reason; HIDE leaves them out until they can apply. A group or section with no row left is skipped. Hidden rows stay hidden in both cases. When a row is hidden, the rows under it take its place.

A new conditional row follows the same rule: hide it when only the screen, the input devices or screen reader mode decide, and grey it when a Setup choice decides.

## Setup views

`SECTIONS` in `js/ui/setup.js` is a tree. `row(label, key, kind, sub)` is one setting; `sub` can list settings that belong to it, and no setting uses it at present. `group(id, title, sub)` names a set of settings with no value of its own: the sections, and MESSAGES, SETUP SCREEN, SHELL OUTPUT, CRT EXTRAS and CHANNELS inside them. A group has a title and two settings or more. Setup > Setup view (`settings.setupView`) chooses how the tree shows:

- PAGES (`pages`, the default): the first page lists Language, Setup view and a button per section. A section opens on its own page with BACK and the path to it. The page lists its settings first. Lines at the bottom, under a rule, open additional settings on a further page: first the settings under a setting, each line naming the settings it opens, then the groups. Escape goes back one page and moves the focus to the button that opened it; on the first page it closes Setup. CLOSE returns Setup to its first page for the next opening.
- SECTIONS (`sections`): one folding header per section, with the settings under a setting indented below it and each group under its title.
- FULL LIST (`list`): every section under a plain heading, nested in the same way.

In every view the levels have one colour each: sections titan, groups lamp green on a green rule, and settings under a setting on a dust rule. Groups come after the settings of their list in `SECTIONS`.

Game code announces what happened with `S.emit(name, data)`, for example `S.emit("submit")` or `S.emit("open:" + id)`. The tour, the accessibility layer and the debug log subscribe with `S.on(name, fn)`; `S.on("*", fn)` receives every event.

## Windows

The game has seven window kinds: `FILES`, `VIEW`, `REPORT`, `SHELL`, `MAIL`, `MESSAGE` and `WATCH`. `MAIL` is the inbox list and `MESSAGE` its reader, which shows messages only; entries and handbook notes open in `VIEW`.

Game code asks for a kind through `S.ui.open(kind)`, `S.ui.isOpen(kind)`, `S.ui.close(kind)` and `S.ui.active()`. The current mode decides how the kind is shown.

### tmux mode

`js/ui/tmux.js` arranges panes in windows, with Ctrl+B keys. The MAIL window contains both mail panes, side by side on a wide screen and stacked on a narrow one, and reading a message opens MAIL with it.

Every split has a divider. Dragging it, or focusing it and using the arrow keys, sets the share of the two panes between 15% and 85%. The size is saved in `settings.splits` under a key made of the split direction and the panes on each side. A double click returns to the default.

With Setup > Display > Sole pane frames OFF, a pane that is alone in its window and not zoomed is drawn bare, with no border and no header. The header stays in the DOM, hidden, for the pane's accessible name. Its buttons (CLOSE, POP IN, HIDE INBOX and SHOW INBOX) are also in the pane's context menu.

The context menu (`js/ui/contextmenu.js`) opens on a right click, and on a touch or pen held still for 500 ms. iPhone and iPad Safari send no contextmenu event of their own; on browsers that do, the gesture still opens one menu.

### Desktop mode

`js/ui/desktop.js` shows icons, drawers and movable windows through `S.desk`.

- `D.order` lists the windows front first. `restack()` numbers their z-index from `D.z` upward in that order, so raising a window never pushes the values past `D.z` plus the number of open windows. The depth gadget moves the active window to the back of the order. All windows sit inside the desk's own layer; see the stacking order in [Styles and themes](styles.md).
- A window of a kind opens at a size taken from its content (`SPOTS` and `contentSize()`): SHELL 80 columns by 24 lines, the report paper 66 columns, and MAIL and WATCH as tall as their content. READER and MESSAGE are 72 columns wide and take the height of what they show, from 6 up to 26 lines for READER and 18 for MESSAGE, with a scroll bar past that. `D.fitContent(kind)` sets that height each time new text is put in, until the player resizes or maximises the window. Columns and lines are measured in the window's own font, so the sizes follow Setup > Text size.
- The anchors `ax` and `ay` place the window in the free space of the desk. Size and place both stay inside the desk.
- Reading a message opens the MESSAGE window alone. The MAIL window opens when the player asks for MAIL (`S.showMail` in `js/game/mail.js`).

### Narrow screens

Screens 700 px wide or narrower always use tmux mode with bottom navigation buttons; the saved mode returns on a wider screen. The inbox sits above MESSAGE and takes the height of its rows, up to about half the window. HIDE INBOX in the MESSAGE header gives MESSAGE the whole page, and SHOW INBOX brings the list back.

Panes that rebuild their content (the inbox, MESSAGE, REPORT) keep their scroll position through `S.keepScroll` in `js/core/dom.js`.

Until the saved settings are applied, `<html class="booting">` keeps the room hidden, so the default screen frame never shows for a moment at load.

## Status line

`S.msg(text, kind)` in `js/ui/status.js` writes the status line of both modes. The status bar repeats a notice only when no toast shows it: new mail and the transmission countdown appear as toasts.

The text sits on a chip blended from the bar's text colour, with the flag colour for errors. It sits at the left of the free space of the bar, in both modes.

A text wider than its space scrolls under the player's control, as the bottom bar of Midnight Commander does: the wheel, a drag, and Left, Right, Home and End while the message has the keyboard focus. `<` and `>` mark the ends that still hide text.

How long a message stays:

- It stays while a mouse or pen pointer is over its text or its `<` and `>` marks, whenever the pointer arrived, and while it has the keyboard focus.
- It clears 3.5 s after the pointer leaves, or 7 s for a message that scrolls.
- The rest of the bar is free space. A pointer resting there lets the message clear.
- Whether the pointer or the focus keeps the message is read from the live `:hover` and `:focus-visible` states every 400 ms. A missed or stale pointer event, a bar hidden by a mode switch, a touch that leaves `:hover` behind, or a mouse click that leaves the focus on the message cannot keep the message on the bar.

Setup > Display > Messages > Scroll long messages (`settings.barScroll`, OFF in a new game) makes a long message scroll by itself, one character every 110 ms, as a terminal status line does. It waits 1 s, steps to its end and clears 2.5 s later. A hover, focus, wheel or drag stops it where it is and hands the message to the player. The row is hidden in screen reader mode and greyed while motion is reduced.

## Errors and dialogs

Setup > Display > Messages > Error messages (`settings.errors`) decides where `S.msg(text, "err")` goes, through `S.errorsAsDialog()` in `js/ui/dialogs.js`. BY MODE (`auto`, the default) shows a dialog in desktop mode and the status bar in tmux mode. DIALOG and STATUS BAR fix one place for both modes.

`S.feedback(text, "err")` prints the error in the shell as well. An error from a typed command stays in the shell alone while SHELL is in view. An error from a click or a panel is also repeated by `S.msg`, since the player was looking at the control.

The error dialog (`S.errorBox`) stacks above any open dialog without closing it, so a wrong password keeps the UNLOCK dialog and its fields. OK, Enter and Escape close it and return the focus. While it is open, `globalKey` in `main.js` and every handler under it receive no keys.

Every dialog takes the look of the current theme; [Styles and themes](styles.md) describes all three. `S.dialog` puts the title in `span.dlg-title-text` for all of them. `S.howTo(topic)` in `js/ui/howto.js` returns instruction lines that name only the controls the player has.

## The tour and the refresher

`js/ui/tour.js` keeps two step lists and one panel, drawn in the notification stack.

- **The tour** (`STEPS`) is offered once, at the first sign-in. Each step names a game event in its `on` field, so NEXT stays disabled until the player does the thing; `S.on("*")` feeds `S.tut.event` and the step completes when its event arrives. SIMPLE uses plain words, TECHNICAL uses terminal terms.
- **The refresher** (`REFRESH`) is what TUTORIAL, Alt+T and the `tutorial` command run, through `S.tut.refresher()`. Four cards, no `on` fields and no waiting; its first card offers a FULL TOUR button for a player who turned the tour down. `S.tut.refresher` asks for the kind every time, so a player who took the technical tour can read the simple one afterwards; `S.tut.choose` puts the kind taken last first, which makes it the button Enter presses.
- **Wording** follows the interface. `sit()` collects what the player is using (desktop or tmux, one window per screen or several panes, keyboard seen, dragging possible) and every step picks its sentences from that. `moving()`, `setupLine()` and `fillWays()` give the lines that differ most.
- **The starting point.** `prepare()` runs at every start and puts the workspace where the steps expect it. In desktop mode it closes every window but READER, which leaves the bare desk and keeps HOME / README on screen. In tmux mode it unzooms and moves to the window that contains FILES, with FILES as the active pane and a shell-only DESK revealed.

## Keyboard

The whole interface works with the arrow keys, Enter, Escape and Tab.

**In dialogs** (`S.keyNav` in `js/ui/dialogs.js`), controls are grouped in rows: the buttons of a dialog, the options of a Setup row, report tabs, the buttons of a toast or of the tour.

- Left and Right move along a row and wrap at its ends.
- Up and Down move to the next row, or to the next control outside a row. They land on the chosen option of that row (pressed, on or selected) or on its first control.
- Text fields keep Left and Right for the caret, and sliders keep them for their value.
- Enter in a field, or on a dialog with nothing focused inside it, chooses the first button. Enter on a button presses that button. Escape closes the dialog.
- A Setup drop-down list opens with Enter, Space, or Alt with an arrow. Inside the list, Up, Down, Home and End move, Enter chooses, and Escape closes it.

**Outside dialogs** (`js/ui/a11y.js`):

- Left and Right move along a row of buttons: toast and tour buttons, report tabs, the title screen and the status bars.
- Up and Down move through the inbox and through the choices of the final decision.
- FILES, the desktop icons, the context menu and the pane dividers have their own arrow keys.
