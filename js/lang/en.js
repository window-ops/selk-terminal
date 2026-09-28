/* English. The base language: interface keys are the English text itself, so
   this file holds only what English cannot say through the key, such as
   plural forms. Other languages copy these keys and translate the values. */
SELK.i18n.register("en", {
  meta: { name: "English", dir: "ltr" },
  ui: {
    "{n} SETTINGS": { one: "{n} SETTING", other: "{n} SETTINGS" },
    "{n} entries": { one: "{n} entry", other: "{n} entries" },
    "{name} needs {n} parts.": { one: "{name} needs {n} password.", other: "{name} needs {n} parts." },
    "{n} ITEMS": { one: "{n} ITEM", other: "{n} ITEMS" },
    "{name}, {n} items. Enter opens.": { one: "{name}, {n} item. Enter opens.", other: "{name}, {n} items. Enter opens." },
    "Signal delay {n} min": { one: "Signal delay {n} min", other: "Signal delay {n} min" }
  },
  /* Shell command words. Other languages list their own words here; the first
     one is shown in help and messages, and all of them are accepted. */
  commands: {
    ls: "ls", dir: "dir", cd: "cd", open: "open", cat: "cat", read: "read",
    note: "note", unlock: "unlock", mail: "mail", report: "report", fill: "fill",
    unfill: "unfill", select: "select", submit: "submit", hints: "hints", hint: "hint",
    light: "light", sound: "sound", settings: "settings", watch: "watch",
    mode: "mode", storage: "storage", devnotes: "devnotes", clear: "clear",
    cls: "cls", credits: "credits", logout: "logout", reset: "reset",
    help: "help", man: "man", about: "about", tutorial: "tutorial",
    date: "date", whoami: "whoami", decide: "decide", choose: "choose",
    oxygen: "oxygen"
  },
  /* Fixed argument words */
  args: {
    on: "on", off: "off", yes: "yes", no: "no"
  },
  story: {}
});
