/* Short instructions that depend on the interface. S.howTo(topic) returns the
   line for tmux, desktop or mobile, and mentions dragging only where a mouse
   or pen can drag. */
(function () {
  var S = window.SELK;
  var TEXT = {
    fill: {
      tmuxDrag: "Drag a record onto a blank. Or select a blank, then a record in FILES, and press F4.",
      tmux: "Select a blank, then a record in FILES, and press F4. Or type {fill} 2 NAME.",
      desktopDrag: "Drag a record onto a blank, or select both and press F4.",
      desktop: "Select a blank, then a record, and press F4.",
      mobile: "Tap a blank, then choose a record in FILES."
    },
    keys: {
      tmux: "Ctrl+B and an arrow switch panes. F1 help, F9 setup.",
      desktop: "F1 help, F9 setup.",
      mobile: "The bottom buttons switch between FILES, MAIL and REPORT."
    }
  };
  var fine = window.matchMedia ? window.matchMedia("(any-pointer: fine)") : null;
  /* Dragging needs a mouse or pen; touch screens tap instead */
  S.canDrag = function () {
    return !S.ctx().mobile && !!(fine && fine.matches);
  };
  S.howTo = function (topic, vars) {
    var c = S.ctx(), set = TEXT[topic];
    var key = c.mobile ? "mobile" : c.desktop ? "desktop" : "tmux";
    if (S.canDrag() && set[key + "Drag"]) {
      key += "Drag";
    }
    return S.tc(set[key], vars);
  };
})();
