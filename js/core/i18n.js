/* Localization. Each language is one file, js/lang/<code>.js, which calls
   SELK.i18n.register(code, pack). English (js/lang/en.js) is always loaded
   and fills anything a pack leaves out. A new language needs its file, its
   name in LANGS and its code in AVAILABLE below.

   Parts of a pack, all optional: ui, interface text keyed by the English
   string, with plural forms as an object ({ one, few, other }); story,
   translations merged over the data files (sections, entries, messages,
   notes, reports and locks by id, endings by ending id); pages, the inner
   HTML of each notes page's <main>; commands, shell command words, the first
   one shown and every one accepted along with the English word; args, fixed
   command arguments in the same form; meta, the endonym and the text
   direction. TRANSLATING.md lists every field.

   Code calls S.t("English text", { n: 3 }), and S.tn("{n} SETTINGS", n) where
   the wording depends on a number. Plural categories come from
   Intl.PluralRules. */
(function () {
  "use strict";
  var S = window.SELK = window.SELK || {};

  /* The name of each language in that language, shown in the language menu */
  var LANGS = {
    en: "English", ro: "Română"
  };
  /* Codes of the languages whose file is in js/lang/, in menu order */
  var AVAILABLE = ["en", "ro"];

  var packs = {}, current = "en", plural = null, words = null, LANG_KEY = "selk-lang";
  var here = document.currentScript && document.currentScript.src;
  var BASE = here ? here.replace(/[^\/]*$/, "") + "../lang/" : "js/lang/";

  function sub(text, vars) {
    if (!vars) {
      return text;
    }
    return String(text).replace(/\{(\w+)\}/g, function (m, k) {
      return vars[k] != null ? vars[k] : m;
    });
  }
  function lookup(key) {
    var p = packs[current], e = packs.en;
    if (p && p.ui && p.ui[key] != null) {
      return p.ui[key];
    }
    if (e && e.ui && e.ui[key] != null) {
      return e.ui[key];
    }
    return key;
  }
  function pickPlural(v, n) {
    if (typeof v === "string") {
      return v;
    }
    var cat = "other";
    try {
      cat = plural ? plural.select(n) : (n === 1 ? "one" : "other");
    } catch (e) {}
    return v[cat] != null ? v[cat] : (v.other != null ? v.other : v.one);
  }

  /* Merges a translation over English data. Objects merge by key, arrays by
     index, and strings replace. null or a missing value keeps the English
     one, so a pack can skip ids, answer ids and passwords. */
  function merge(base, over) {
    if (over == null) {
      return base;
    }
    if (typeof over !== "object" || base == null || typeof base !== "object") {
      return over;
    }
    Object.keys(over).forEach(function (k) {
      base[k] = merge(base[k], over[k]);
    });
    return base;
  }
  function applyStory(story) {
    if (!story) {
      return;
    }
    if (story.sections && S.SECTIONS) {
      S.SECTIONS.forEach(function (s) {
        if (story.sections[s.id] != null) {
          s.name = story.sections[s.id];
        }
      });
    }
    if (story.entries && S.ENTRIES) {
      S.ENTRIES.forEach(function (e) {
        var o = story.entries[e.id];
        if (o) {
          merge(e, o);
        }
      });
    }
    ["notes", "reports", "locks", "messages"].forEach(function (k) {
      var target = { notes: "NOTES", reports: "REPORTS", locks: "LOCKS", messages: "MESSAGES" }[k];
      if (story[k] && S[target]) {
        merge(S[target], story[k]);
      }
    });
    /* Endings are a list in the data file, so a pack names them by id */
    if (story.endings && S.ENDINGS) {
      S.ENDINGS.forEach(function (e) {
        if (story.endings[e.id]) {
          merge(e, story.endings[e.id]);
        }
      });
    }
  }

  /* The language saved in the game, else the browser's first supported one */
  function saved() {
    try {
      var raw = S.store && S.store().getItem(S.KEY);
      var lang = raw && (JSON.parse(raw).settings || {}).lang;
      if (lang && AVAILABLE.indexOf(lang) !== -1) {
        return lang;
      }
      /* selk-lang: a language chosen on a notes page while no game save existed */
      var loose = S.store && S.store().getItem(LANG_KEY);
      if (loose && AVAILABLE.indexOf(loose) !== -1) {
        return loose;
      }
    } catch (e) {}
    return null;
  }
  function detect() {
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).toLowerCase().split("-")[0];
      if (AVAILABLE.indexOf(code) !== -1) {
        return code;
      }
    }
    return "en";
  }

  function load(code) {
    if (code === "en" || packs[code]) {
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = BASE + code + ".js";
      s.onload = resolve;
      s.onerror = function () {
        if (window.console) { console.error("SELK: language file missing: " + s.src); }
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  /* Command words. fold() lowers case and drops accents, so "deblocheaza"
     matches "deblochează". */
  function fold(w) {
    return String(w || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function list(v) {
    return v == null ? [] : [].concat(v);
  }
  function buildWords() {
    words = { commands: {}, args: {} };
    ["commands", "args"].forEach(function (part) {
      var p = packs[current] || {}, table = p[part] || {};
      Object.keys(table).forEach(function (canon) {
        list(table[canon]).forEach(function (w) {
          words[part][fold(w)] = canon;
        });
      });
    });
  }
  function shown(part, canon) {
    var p = packs[current] || {}, e = packs.en || {};
    var v = list((p[part] || {})[canon])[0] || list((e[part] || {})[canon])[0];
    return v || canon;
  }
  function canonical(part, word) {
    if (!words) {
      buildWords();
    }
    return words[part][fold(word)] || String(word || "").toLowerCase();
  }

  S.i18n = {
    LANGS: LANGS,
    AVAILABLE: AVAILABLE,
    register: function (code, pack) {
      packs[code] = pack || {};
    },
    lang: function () {
      return current;
    },
    /* Typed word to English command or argument, and back for display */
    command: function (word) { return canonical("commands", word); },
    arg: function (word) { return canonical("args", word); },
    /* A handbook note as [title, text, edition year], read from the active
       pack, so the note is translated before the story block is merged over
       the data */
    note: function (id) {
      var base = S.NOTES && S.NOTES[id], pack = packs[current], translated = pack && pack.story && pack.story.notes && pack.story.notes[id];
      if (!base) { return null; }
      return translated ? [translated[0] || base[0], translated[1] || base[1], base[2], base[3]] : base;
    },
    commandWords: function (names) {
      var out = [];
      names.forEach(function (c) {
        var w = shown("commands", c);
        if (out.indexOf(w) === -1) { out.push(w); }
        if (out.indexOf(c) === -1) { out.push(c); }
      });
      return out;
    },
    /* Translated inner HTML of a notes page, or null to keep the English page */
    page: function (id) {
      var p = packs[current];
      return (current !== "en" && p && p.pages && p.pages[id]) || null;
    },
    /* [code, endonym] for every shipped language, for the Setup row */
    choices: function () {
      return AVAILABLE.map(function (c) { return [c, LANGS[c] || c]; });
    },
    /* Notice shown wherever a language other than English is in use */
    NOTICE: "Languages other than English are generated automatically and may contain errors.",
    /* Switch from a notes page: store the choice in the game save when there
       is one, else under its own key, then reload */
    switchTo: function (code) {
      if (AVAILABLE.indexOf(code) === -1) {
        return;
      }
      try {
        var st = S.store(), raw = st.getItem(S.KEY);
        if (raw) {
          var data = JSON.parse(raw);
          data.settings = data.settings || {}; data.settings.lang = code;
          st.setItem(S.KEY, JSON.stringify(data));
        }
        st.setItem(LANG_KEY, code);
      } catch (e) {}
      location.reload();
    },
    /* Switch language: save it and reload, so every module starts in it */
    set: function (code) {
      if (AVAILABLE.indexOf(code) === -1 || code === current) {
        return;
      }
      S.state.settings.lang = code;
      S.save();
      try {
        S.store().setItem(LANG_KEY, code);
      } catch (e) {}
      S.leaving = true;
      location.reload();
    }
  };
  /* Static page text. An element marked data-i18n has its own text nodes
     translated, and child elements such as key numbers stay.
     data-i18n-attr="title,aria-label" names attributes to translate. The
     English text is the key. */
  S.i18n.applyDom = function (root) {
    [].forEach.call(root.querySelectorAll("[data-i18n]"), function (n) {
      [].forEach.call(n.childNodes, function (c) {
        if (c.nodeType === 3 && c.nodeValue.trim()) {
          c.nodeValue = c.nodeValue.replace(c.nodeValue.trim(), S.t(c.nodeValue.trim()));
        }
      });
    });
    [].forEach.call(root.querySelectorAll("[data-i18n-attr]"), function (n) {
      n.getAttribute("data-i18n-attr").split(",").forEach(function (a) {
        a = a.trim();
        if (n.hasAttribute(a)) { n.setAttribute(a, S.t(n.getAttribute(a))); }
      });
    });
  };
  S.t = function (key, vars) {
    return sub(pickPlural(lookup(key), 1), vars);
  };
  /* Numbers computed at run time, with the language's decimal separator */
  S.num = function (x, digits) {
    try {
      return new Intl.NumberFormat(current, { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 }).format(x);
    } catch (e) {
      return Number(x).toFixed(digits || 0);
    }
  };
  S.cmdName = function (c) { return shown("commands", c); };
  /* The line under a note that names where it comes from: the CESEA field
     handbook with its edition, or the source of the note (js/data/notes.js) */
  S.noteSource = function (n) {
    var src = n[3], ref = src && src[1];
    if (!src) { return S.t("CESEA field handbook, edition {year}", { year: n[2] }); }
    var name = ({
      sheet: S.t("CESEA data sheet, {ref}", { ref: ref }),
      man: S.t("Manual page {ref}", { ref: ref }),
      kernel: S.t("Linux kernel documentation, {ref}", { ref: ref }),
      rfc: S.t("IETF standard RFC {ref}", { ref: ref }),
      course: S.t("CESEA supervisor course, {ref}", { ref: ref }),
      archive: S.t("CESEA archive, {ref}", { ref: ref }),
      brief: S.t("CESEA logistics office, brief of {ref}", { ref: ref })
    })[src[0]] || ref;
    /* A quote stays in the language of its source */
    return src[2] ? S.t("{source}: \"{quote}\"", { source: name, quote: src[2] }) : name;
  };
  /* The name of a dotted term for its tooltip and for screen readers */
  S.noteLabel = function (n, fallback) {
    var name = n ? n[0] : fallback;
    return n && n[3] ? S.t("Note: {name}", { name: name }) : S.t("Handbook note: {name}", { name: name });
  };
  S.argName = function (a) { return shown("args", a); };
  /* S.t with every command and argument word as a placeholder, so a sentence
     can say "Type {hints} {on}" in the words of the language */
  S.tc = function (key, vars) {
    var v = {}, k, e = packs.en || {};
    Object.keys(e.commands || {}).forEach(function (c) { v[c] = shown("commands", c); });
    Object.keys(e.args || {}).forEach(function (a) { v[a] = shown("args", a); });
    for (k in (vars || {})) { v[k] = vars[k]; }
    return S.t(key, v);
  };
  S.tn = function (key, n, vars) {
    var v = {}, k;
    for (k in (vars || {})) { v[k] = vars[k]; }
    v.n = n;
    return sub(pickPlural(lookup(key), n), v);
  };

  /* Start loading at once; main.js waits for this before building the screen */
  current = saved() || detect();
  S.i18n.ready = load(current).then(function () {
    if (!packs[current]) {
      current = "en";
    }
    words = null;
    try {
      plural = new Intl.PluralRules(current);
    } catch (e) {
      plural = null;
    }
    var p = packs[current] || {};
    S.i18n.applyDom(document);
    document.documentElement.lang = current;
    document.documentElement.dir = (p.meta && p.meta.dir) || "ltr";
    if (current !== "en") {
      applyStory(p.story);
    }
  });
})();
