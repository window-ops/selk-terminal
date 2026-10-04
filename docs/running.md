# Running and debugging

[Back to Developing Selk](../DEVELOPING.md)

The game is a static site with no build step. Serve the project root with any web server and open the page:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Debug switches

Setup > Debug has three switches.

**Debug panel** shows a movable panel with the current situation and buttons that act on the game. The buttons deliver the next message, fill the open report page with correct answers, submit it, unlock every section in view, show and open Design or History without playing to an ending, open the final decision, trigger a gust or a creak, advance the clock by one hour and switch the interface mode. The panel lives in `js/dev/debug.js`. It stays inside the screen when the window is resized and stays attached while the shell prints. It sits under the screen effects with the rest of the interface, and rises above the ending's stage while the ending plays, so it stays usable there.

**Debug log** prints commands, events, window changes, dialogs, messages, shell output, mail, transmissions, saves and settings to the browser console. Filter the console by `SELK`.

**TROIKA.RUN** has a debug key while the Debug panel or Fast mode is on: End skips the remaining gates and moves the run to 4 s before 2016, so the ending can be tested without playing the run. The bar under the canvas shows the key while it works. It lives in `js/games/troika/debug.js`.

**Fast mode** shortens the game's waits. Mail arrives after 80 ms, a report transmission counts down in 0.3 s, and the finale plays its lines and pauses at a fraction of their length. The value is saved as `settings.fast`. Code reads it through the read-only property `S.fast`, defined in `js/core/state.js`.
