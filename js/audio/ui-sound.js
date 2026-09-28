/* Interface sounds, in one place. Any press clicks the moment the pointer goes
   down, so links that leave the page, toasts that close and controls that act
   on press all sound before anything changes; keyboard activation clicks
   through the click event. Choosing from a list or moving a slider ticks, and
   picking up and dropping an entry have their own sounds. A short gate keeps
   one action to one sound, so game code can still call S.snd.click() or
   S.snd.tick() without doubling what the listeners below already play. */
(function () {
  var S = window.SELK, snd = S.snd, last = 0;
  function gated(fn) {
    return function () {
      var now = Date.now();
      if (now - last < 60) {
        return;
      }
      last = now;
      fn.apply(snd, arguments);
    };
  }
  snd.click = gated(snd.click);
  snd.tick = gated(snd.tick);
  document.addEventListener("pointerdown", function () { snd.click(); }, true);
  document.addEventListener("click", function (e) {
    if (e.detail === 0) {
      snd.click();
    }
  }, true);
  document.addEventListener("contextmenu", function () { snd.click(); }, true);
  document.addEventListener("change", function (e) {
    if (e.target.matches("select, input[type=range], input[type=checkbox], input[type=radio]")) {
      snd.tick();
    }
  }, true);
  document.addEventListener("dragstart", function () { snd.tick(); }, true);
  document.addEventListener("drop", function () { snd.click(); }, true);
})();
