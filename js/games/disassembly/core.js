/* DISASSEMBLY.RUN, a repair game opened from design/DISASSEMBLY.RUN. The
   player picks a phone, a Fairphone 5 or a Samsung Galaxy S24, and a part to
   replace: the battery, the screen, the USB-C port or the rear camera, then
   takes the phone apart by hand. A part is dragged off the phone into the
   tray once it is free; a tool (heat pad, suction cup and picks, Phillips
   screwdriver) is dragged onto the part it works on. An action that cannot
   be done does not work: the part stays, the reason is given, and it counts
   as a mistake; a part that cannot come off does not move under the
   pointer. The phone is on at the start and has to be turned off with its
   power button first. When the chosen part is out, the new one is dragged
   from the drawer into the phone, then every part goes back from the tray
   in the reverse order, screwed parts are screwed in again, the Galaxy's
   glass needs new adhesive, and the repair ends when the phone is turned
   on. The game says how to do things only in tutorial mode, chosen on the
   start screen, where it also names the next move. The rules follow the published teardowns: the Fairphone's
   cover clips on, its battery sits between a top and a bottom module, and
   its modules are held by Phillips screws; the Galaxy's back glass is glued
   and needs heat, a screwed coil and board cover lie under it, two flex
   cables from the sub-board to sockets under the board cover cross the
   battery, its USB-C
   port is on the sub-board, and its genuine screen comes as one assembly with
   the frame and a battery, so every other part has to come out first. A
   score card ends the run.

   The game is its own window over the screen, drawn by the files in art/
   (S.disassemblyArt) on a 640 by 400 canvas scaled to fit. While it is open it takes every key
   but Tab: the arrows pick a part, Enter uses the armed tool on it or pulls
   it off, Escape closes.

   The game is split into files that share S.disassemblyGame (G here):
   - core.js: the window's parts, the state of the repair and q;
   - data.js: the parts of each phone, the tools and the facts;
   - rules.js: what each action does to the repair, and the messages;
   - input.js: the pointer, the tools dragged or armed, and the keys;
   - screens.js: the start screen, the start of a repair and the score
     card;
   - window.js: the window, its size and S.disassembly. */
(function () {
  var S = window.SELK;
  /* The window, the canvas, its context and the state of the repair */
  var G = S.disassemblyGame = { ov: null, cv: null, g: null, st: null };
  G.q = function (sel) {
    return G.ov.querySelector(sel);
  };
})();
