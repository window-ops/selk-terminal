/* Alt shortcuts, matched by physical key, and the S.SHORTCUTS table for help. */
(function () {
  var S = window.SELK;
  /* Alt plus a letter, matched by physical key (event.code, such as KeyR), so
     the keys are the same on every keyboard layout. Each calls S.run(text,
     false), so its result follows Setup > Panel results (S.cmdOrigin and
     S.outShell in commands.js). */
  var KEYS = {
    KeyR: function () {
      S.run("report", false);
    },
    KeyM: function () {
      S.run("mail", false);
    },
    KeyF: function () {
      S.ui.open("FILES");
    },
    KeyV: function () {
      S.ui.open("VIEW");
    },
    KeyS: function () {
      S.ui.open("SHELL");
    },
    KeyW: function () {
      S.run("watch", false);
    },
    KeyH: function () {
      S.run("help", false);
    },
    KeyP: function () {
      S.settingsDialog();
    },
    KeyT: function () {
      S.tut.refresher();
    },
    KeyA: function () {
      S.about();
    },
    KeyD: function () {
      if (!S.tmux.mobile()) {
        S.setMode(S.isDesktop() ? "tmux" : "desktop");
      }
    },
    KeyU: function () {
      S.fkey(4);
    },
    KeyL: function () {
      S.unlockDialog(S.ex.section());
    },
    KeyN: function () {
      var k = S.rep.openKeys(); if (k.length) {
        var i = k.indexOf(S.state.active); S.state.active = k[(i + 1) % k.length]; S.run("report", false);
      }
    },
    KeyK: function () {
      S.run("submit", false);
    }
  };
  S.shortcut = function (e) {
    if (!e.altKey || e.ctrlKey || e.metaKey || S.mode !== "shell" || S.dlg) {
      return false;
    }
    var f = KEYS[e.code];
    if (!f) {
      return false;
    }
    e.preventDefault(); S.snd.click(); f();
    return true;
  };
  S.SHORTCUTS = [
    [
      "Alt+R",
      "report"
    ],
    [
      "Alt+N",
      "next report page"
    ],
    [
      "Alt+K",
      "submit page"
    ],
    [
      "Alt+U",
      "use highlighted entry"
    ],
    [
      "Alt+M",
      "mail"
    ],
    [
      "Alt+F",
      "files"
    ],
    [
      "Alt+V",
      "viewer"
    ],
    [
      "Alt+S",
      "shell"
    ],
    [
      "Alt+W",
      "watch"
    ],
    [
      "Alt+L",
      "unlock"
    ],
    [
      "Alt+P",
      "setup"
    ],
    [
      "Alt+T",
      "tutorial"
    ],
    [
      "Alt+A",
      "about"
    ],
    [
      "Alt+D",
      "switch desktop and tmux"
    ],
    [
      "Alt+H",
      "help"
    ],
    [
      "Right-click",
      "context menu"
    ]
  ];
})();
