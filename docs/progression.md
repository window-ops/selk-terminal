# Progression

[Back to Developing Selk](../DEVELOPING.md)

Everything below is driven by the data described in [Game data](game-data.md).

1. **Sign-in:** After the player signs in for the first time, `main.js` queues `MSG001`. A returning player gets the pending messages delivered again.
2. **Mail:** `S.queueMail(id, ms)` puts a message in `state.pending` and delivers it after the delay (80 ms in Fast mode). Delivery:
   - adds the message to `state.mail`, with `v: "received"` when its `awaits` page is already accepted (`S.mailBody(m)` returns the text to show),
   - advances the site clock by 99 minutes (none for `MSG001`),
   - opens the report pages in the message's `opens` list.
3. **Reports:** The player fills a blank with an entry id by dragging, with USE or F4, or with `fill`; `unfill` empties a blank. `submit` accepts the page only when all four blanks match. The page is then transmitted: a 79-step countdown stands for the 79-minute signal delay and advances the clock by 79 minutes. When it finishes, the page is marked `done` and the reply message is queued 4 s later.
4. **Report 4:** `S.reportReady(key)` in `state.js` keeps `R4` closed until `R3A` or `R3B` is accepted. Both follow-up messages list `R4` in `opens`, and the page opens with whichever arrives first. The other follow-up page stays open.
5. **Locked sections:** `unlock SECTION PART ...` compares the typed parts with the lock, ignoring case. Unlocking depends on the password alone, so any locked section can be opened at any time.
6. **Hints:** Hints stay hidden until the player types `hints on`. The hints page then shows the hints of every open report page and every locked section, revealed one line at a time. `state.hintsShown` records how many lines of each are shown.
7. **Final decision:** `MSG006` sets `state.decision`. `decide` (in `js/game/ending.js`) saves a copy of the state as `state.preDecision`, plays the intro on the ending stage and lists the endings. An ending whose `needs` report is still open is shown disabled. Report 4 opens after one follow-up page, so the decision can open while the other page is unsent; its ending becomes available once that page is accepted.
8. **Endgame:** After the film the ending is recorded in `state.endings` and `state.ended`. The endgame card returns at every sign-in until the player loads the save from before the decision or starts again from the title screen. CHOOSE AGAIN on the card restores that save in place and shows the choice list at once. TITLE SCREEN rebuilds the title screen without reloading the page.
9. **The Design section:** Once `state.endings` has an ending, the locked section Design appears in `/` after POWER, and after LOAD SAVE the shell says so once. It opens with the serial of the terminal, typed with `unlock design SERIAL` or in the unlock dialog, which shows the factory note; `hint design` gives the steps. Its entries are the design specs and drawings ([Game data](game-data.md)).
10. **The History section:** Opening Design makes History appear in `/` after it. It opens when each of eight lines by Brian Cox is sorted into filler or substance, in the unlock dialog or with `unlock history` and one letter per line; `hint history` gives the steps. Its entries are the archive of the Federation of Europe and CESEA, from the 2020s to now.
11. **Loading a save with an open ending:** POWER ON on such a save opens the endgame card straight away. The boot checks, the sign-in lines, the window layout and the machine sounds are all skipped, since the card is the only thing to show. LOAD SAVE and CANCEL on the decision list then call `S.resumeSession()` in `main.js`, which starts the machine, the camera, the telemetry, the pending mail and the windows in one step, without the boot sequence. Signing in again after EXIT in the same visit still boots normally and shows the card over the session.
