/* Localization core.

   Every language lives in its own file, js/lang/<code>.js, which calls
   SELK.i18n.register(code, pack). English (js/lang/en.js) is always loaded and
   is the fallback for anything a pack leaves out. Adding a language means
   adding its file and its code to AVAILABLE below; no other file changes.

   A pack has these optional parts:
     ui      interface text, keyed by the English source string:
             { "Language": "Limbă", "{n} SETTINGS": { one: "...", few: "...", other: "..." } }
     story   story data, keyed like the data files, merged over the English data:
             sections, entries, messages, notes, reports, locks by id or key,
             endings by ending id (see TRANSLATING.md for every field)
     pages   notes pages: { concept: "<h1>...</h1>...", "concept:title": "..." },
             the translated inner HTML of each page's <main>
     commands  shell command words: { open: ["deschide"] }. The first word is
             the one shown; every word is accepted, with or without accents.
             The English word always works too, so buttons and older
             habits keep running.
     args    fixed command arguments the same way: { on: ["pornit"], yes: ["da"] }
     meta    { name: endonym, dir: "ltr" }

   Code calls S.t("English text", { n: 3 }) for plain text and
   S.tn("{n} SETTINGS", n) where the wording depends on a number. Plural
   categories come from Intl.PluralRules, so each language keeps its own
   rules (Romanian one, few and other, where other takes "de"). */
(function () {
  "use strict";
  var S = window.SELK = window.SELK || {};

  /* Languages the game ships in, each with its own name. A new language
     needs its name here, its file in js/lang/ and its code in AVAILABLE. */
  var LANGS = {
    en: "English", ro: "Română"
  };
  /* Languages whose file ships with the game */
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

  /* Merge a translation over English data. Objects merge by key, arrays by
     index, strings replace, and null or a missing value keeps the English
     one, so a pack can skip ids, entry ids inside report lines, and passwords. */
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
      /* Chosen on a notes page before any game was saved */
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
     matches "deblochează" and "structura" matches "structură". */
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
    /* Resolve handbook terms from the active language pack directly, so their
       names stay localized even if a notes array has not been merged yet. */
    note: function (id) {
      var base = S.NOTES && S.NOTES[id], pack = packs[current], translated = pack && pack.story && pack.story.notes && pack.story.notes[id];
      if (!base) { return null; }
      return translated ? [translated[0] || base[0], translated[1] || base[1], base[2]] : base;
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
    /* Switch from a notes page: store the choice in the game save when there is
       one, else under its own key in the same store, then reload */
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
     translated (child elements such as key numbers stay as they are), and
     data-i18n-attr="title,aria-label" names attributes to translate. The
     English text in the page is the key. */
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
  S.argName = function (a) { return shown("args", a); };
  /* S.t with every command and argument word available as a placeholder, so a
     sentence can say "Type {hints} {on}" and show the words of the language */
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
