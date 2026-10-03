/* Interface sounds for every control. A mouse or pen press sounds when it
   goes down, before the control acts. A touch sounds with the click that
   follows it, so a touch that starts a scroll makes no sound. Keyboard
   activation sounds through the click event. Choosing from a list or
   moving a slider ticks, and picking up and dropping an entry have their
   own sounds.

   One action makes one sound. A press owns the sound from pointer down
   until 150 ms after release, so S.snd.click() and S.snd.tick() called by
   the code that the press runs stay silent. Outside a press, two calls
   less than 60 ms apart play once.

   With Setup > Sound > Control sounds ON, a control marked data-sound
   plays the sound of that kind (S.snd.ui in sound.js) when the primary
   button activates it. Every other press clicks. */
(function () {
  var S = window.SELK, snd = S.snd, last = 0, pressing = false, pressEnd = 0, touchPress = false;
  var rawClick = snd.click, rawTick = snd.tick;
  function play(fn, args, own) {
    var now = Date.now();
    if (!own && (pressing || now < pressEnd)) { return; }
    if (now - last < 60) { return; }
    last = now;
    fn.apply(snd, args);
  }
  snd.click = function () { play(rawClick, arguments); };
  snd.tick = function () { play(rawTick, arguments); };
  /* The kind named by the control under n, or "" */
  function kindOf(n) {
    if (!S.state.settings.ctlSounds || !n || !n.closest) { return ""; }
    var m = n.closest("[data-sound]");
    return m && !m.disabled ? m.dataset.sound : "";
  }
  /* The sound of activating the control under n */
  function sound(n, own) {
    var k = kindOf(n);
    if (k) { play(snd.ui, [k], own); } else { play(rawClick, [], own); }
  }
  function release() {
    if (pressing) { pressing = false; pressEnd = Date.now() + 150; }
  }
  document.addEventListener("pointerdown", function (e) {
    pressing = true;
    touchPress = e.pointerType === "touch";
    if (touchPress) { return; }
    /* A right or middle press activates nothing, so it clicks; a slider
       sounds as its value moves */
    if (e.button !== 0) { play(rawClick, [], true); }
    else if (kindOf(e.target) !== "slide") { sound(e.target, true); }
  }, true);
  window.addEventListener("pointerup", release, true);
  window.addEventListener("pointercancel", function () { touchPress = false; release(); }, true);
  window.addEventListener("blur", release);
  document.addEventListener("click", function (e) {
    if (e.detail === 0) { sound(e.target, false); }
    else if (touchPress) { touchPress = false; sound(e.target, true); }
  }, true);
  /* A long touch press opens the context menu and makes the press's sound */
  document.addEventListener("contextmenu", function () {
    play(rawClick, [], touchPress); touchPress = false;
  }, true);
  document.addEventListener("input", function (e) {
    if (kindOf(e.target) === "slide") { play(snd.ui, ["slide", e.target.value], true); }
  }, true);
  document.addEventListener("change", function (e) {
    if (kindOf(e.target) === "slide") { return; }
    if (e.target.matches("select, input[type=range], input[type=checkbox], input[type=radio]")) {
      snd.tick();
    }
  }, true);
  document.addEventListener("dragstart", function () { play(rawTick, [], true); }, true);
  document.addEventListener("drop", function () { play(rawClick, [], true); }, true);
})();
