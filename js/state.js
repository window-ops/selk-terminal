/* Saved game state and settings in localStorage, the site clock, and small lookups
   for sections, entries and reports. */
(function () {
  var S = window.SELK = window.SELK || {};
  var KEY = "selk-terminal-v1";
  var BASE = Date.UTC(2097, 2, 14, 7, 21);
  function defaults() {
    return {
      sv: 2,
      mode: "tmux",
      frame: "full",
      layout: "four",
      scan: true,
      flicker: true,
      glow: true,
      interfere: true,
      poweron: true,
      vol: 75,
      vMachine: 60,
      vWind: 70,
      vUi: 60,
      vStruct: 65,
      speed: "instant",
      size: "m",
      click: "single",
      cursor: "m",
      motion: "system",
      redirectNotes: true,
      debug: false
    };
  }
  S.defaults = defaults;
  function fresh() {
    return {
      version: 1,
      name: "",
      cwd: "",
      unlocked: [],
      reports: {},
      active: null,
      sel: null,
      mail: [],
      pending: [],
      clock: 0,
      hintsOn: false,
      light: false,
      hintsShown: {},
      sound: true,
      decision: false,
      endings: [],
      read: [],
      lastEnding: null,
      settings: defaults()
    };
  }
  S.state = fresh();
  S.KEY = KEY;
  S.WIPE_KEY = "selk-wipe-on-refresh";
  S.HIST_KEY = "selk-shell-history";
  S.load = function () {
    try {
      if (localStorage.getItem(S.WIPE_KEY) === "1") {
        localStorage.removeItem(KEY);
        sessionStorage.removeItem(S.HIST_KEY);
        S.wiped = true;
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.version === 1) {
          S.state = Object.assign(fresh(), data);
          var ds = data.settings || {};
          S.state.settings = ds.sv === 2 ? Object.assign(defaults(), ds) : defaults();
        }
      }
    } catch (e) {
      S.state = fresh();
    }
    return S.state;
  };
  S.save = function () {
    try {
      localStorage.setItem(KEY, JSON.stringify(S.state)); return true;
    }
    catch (e) {
      return false;
    }
  };
  S.reset = function () {
    S.state = fresh();
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
  };
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  S.fmtTime = function (mins) {
    var d = new Date(BASE + mins * 60000);
    return pad(d.getUTCDate()) + "-" + pad(d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() +
    " " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
  };
  S.tick = function (mins) {
    S.state.clock += mins;
  };
  S.isUnlocked = function (sec) {
    var s = S.sectionById(sec);
    return !!s && (!s.locked || S.state.unlocked.indexOf(sec) !== -1);
  };
  S.sectionById = function (id) {
    for (var i = 0; i < S.SECTIONS.length; i++) {
      if (S.SECTIONS[i].id === id) {
        return S.SECTIONS[i];
      }
    }
    return null;
  };
  S.entryById = function (id) {
    var low = String(id).toLowerCase();
    for (var i = 0; i < S.ENTRIES.length; i++) {
      if (S.ENTRIES[i].id.toLowerCase() === low) {
        return S.ENTRIES[i];
      }
    }
    return null;
  };
  S.userId = function () {
    var n = (S.state.name || "crew").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return n.replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "crew";
  };
  S.entryTitle = function (id) {
    var p = id.split("/");
    return p[0].toUpperCase() + " / " + p[1];
  };
  S.report = function (code) {
    var key = "R" + String(code).toUpperCase().replace(/^R/, "");
    return S.REPORTS[key] ? key : null;
  };
})();
