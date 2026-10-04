#!/usr/bin/env node
/* Translation catalog for Selk.

   node tools/i18n-catalog.js template xx   prints a new js/lang/xx.js with every
                                            string in English, ready to translate
   node tools/i18n-catalog.js check xx      lists what js/lang/xx.js still lacks
   node tools/i18n-catalog.js keys          prints the interface keys, one per line
   node tools/i18n-catalog.js unused xx     lists what js/lang/xx.js has that no files use

   Interface keys are the string literals in the scripts that read as visible
   text; an extra key is never looked up. Story text comes from the data
   files, and the notes pages from the <main> element of each page. A key
   counts as used when its text appears whole as a string literal or as
   element text in the scripts and pages outside js/lang/ and tools/. See
   TRANSLATING.md. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

function loadGame() {
  const ctx = { window: {} };
  ctx.window.SELK = ctx.SELK = {};
  ctx.window.window = ctx.window;
  ctx.document = { documentElement: {}, head: { appendChild() {} }, querySelectorAll: () => [] };
  ctx.navigator = { languages: ["en"] };
  ctx.Intl = Intl; ctx.Promise = Promise;
  vm.createContext(ctx);
  ["js/data/notes.js", "js/data/entries.js", "js/data/story.js", "js/data/endings.js", "js/core/dom.js", "js/core/i18n.js", "js/lang/en.js"]
    .forEach((f) => vm.runInContext(read(f), ctx, { filename: f }));
  return ctx.SELK;
}

/* Interface keys */
/* Scripts to scan, relative to js/: every folder except the data and the languages */
const SKIP_FILES = new Set(["core/i18n.js", "core/dom.js", "core/context.js", "core/state.js", "audio/sound.js", "shell/render.js", "shell/scroll.js", "ui/crtmask.js"]);
function jsFiles(dir) {
  return fs.readdirSync(path.join(ROOT, "js", dir), { withFileTypes: true }).flatMap((d) => {
    const rel = dir ? dir + "/" + d.name : d.name;
    if (d.isDirectory()) return rel === "data" || rel === "lang" ? [] : jsFiles(rel);
    return d.name.endsWith(".js") ? [rel] : [];
  });
}
function uiKeys() {
  const keys = new Set();
  const files = jsFiles("").filter((f) => !SKIP_FILES.has(f));
  const lit = /"((?:[^"\\\n]|\\.)*)"/g;
  const add = (t) => {
    t = t.replace(/\\"/g, '"').replace(/\\n/g, "\n");
    if (!/[A-Za-z]{2}/.test(t)) return;
    if (/^[a-z0-9_:\-.\/#\[\]=*>+~ ,()'^!]*$/.test(t) && !/ [a-z]+ [a-z]+/.test(t)) return; // ids, classes, selectors, event names
    if (/^[a-z]+[A-Z]\w*$/.test(t) || /^_\w+$/.test(t)) return;                              // identifiers
    if (/^(Key|Arrow|Digit)\w+$|^(Escape|Enter|Tab|Backspace|Home|End|Backquote|DOMContentLoaded)$/.test(t)) return;
    if (/^#[0-9A-Fa-f]{3,8}$|^rgba?\(|^url\(|^%c|;font-weight/.test(t)) return;
    if (/^(localStorage|sessionStorage|crispEdges|button, input.*)$/.test(t)) return;
    if (/^\(prefers-/.test(t)) return;
    if (t !== t.trim() || /' \+|^&\w+;$|\}: $|monospace$|^MSG\d+$/.test(t)) return;       // fragments of built strings
    if (/^(ContextMenu|Control|Meta|Shift|Alt|DT)$/.test(t)) return;                     // key and tag names
    keys.add(t);
  };
  /* Anything passed straight to S.t, S.tc or S.tn is a key, whatever it looks like */
  const direct = /S\.t[cn]?\(\s*"((?:[^"\\\n]|\\.)*)"/g;
  files.concat(["core/i18n.js"]).forEach((f) => {
    const src = read("js/" + f);
    let m;
    while ((m = direct.exec(src))) keys.add(m[1].replace(/\\"/g, '"'));
  });
  /* Values that pass through S.t inside helpers (watch.js meter, field and table
     cells) but look like identifiers to the filter above */
  ["active", "camera, mast", "idle", "none", "parked, zone 14 hold", "receiving", "removed",
    "rib 7 repair", "sending", "working", "zone 14", "{v} %"].forEach((k) => keys.add(k));
  const notice = read("js/core/i18n.js").match(/NOTICE: "([^"]+)"/);
  if (notice) keys.add(notice[1]);
  files.forEach((f) => {
    read("js/" + f).split("\n").forEach((line) => {
      const s = line.trim();
      if (s.startsWith("/*") || s.startsWith("*") || s.startsWith("//")) return;
      let m; lit.lastIndex = 0;
      while ((m = lit.exec(line))) add(m[1]);
    });
  });
  /* Static page text marked with data-i18n */
  const html = read("index.html");
  (html.match(/<[^>]*data-i18n[^>]*>[^<]*(<span[^>]*>[^<]*<\/span>)?[^<]*</g) || []).forEach((tag) => {
    const text = tag.replace(/<span[^>]*>[^<]*<\/span>/, "").replace(/^<[^>]*>/, "").replace(/<$/, "").trim();
    if (text) add(text);
  });
  (html.match(/(title|aria-label)="([^"]+)"[^>]*data-i18n-attr/g) || []).forEach((a) => add(a.replace(/^[^"]*"([^"]+)".*$/, "$1")));
  return [...keys].sort((a, b) => a.localeCompare(b));
}

/* Story fields worth translating, in the shape a pack's story block takes */
function storySkeleton(S) {
  const story = { sections: {}, entries: {}, messages: {}, notes: {}, reports: {}, locks: {}, endings: {} };
  S.SECTIONS.forEach((s) => { story.sections[s.id] = s.name; });
  S.ENTRIES.forEach((e) => {
    if (e.sys) return;                                       // system files stay as they are
    const o = { by: e.by, body: e.body };
    if (e.cap) o.cap = e.cap;
    if (e.facts) o.facts = e.facts;
    if (e.flip) o.flip = e.flip.map((f) => [null, f[1]]);
    story.entries[e.id] = o;
  });
  Object.keys(S.MESSAGES).forEach((k) => {
    story.messages[k] = { body: S.MESSAGES[k].body };
    if (S.MESSAGES[k].received) story.messages[k].received = S.MESSAGES[k].received;
  });
  Object.keys(S.NOTES).forEach((k) => { story.notes[k] = [S.NOTES[k][0], S.NOTES[k][1]]; });
  Object.keys(S.REPORTS).forEach((k) => {
    const r = S.REPORTS[k];
    story.reports[k] = { brief: r.brief, title: r.title, lines: r.lines.map((ln) => [ln[0], null, ln[2]]), hints: r.hints };
  });
  Object.keys(S.LOCKS).forEach((k) => {
    story.locks[k] = { hint: S.LOCKS[k].hint, nudge: S.LOCKS[k].nudge };
    if (S.LOCKS[k].note) story.locks[k].note = S.LOCKS[k].note;
    if (S.LOCKS[k].clues) story.locks[k].clues = S.LOCKS[k].clues;
    if (S.LOCKS[k].sort) story.locks[k].sort = { choices: S.LOCKS[k].sort.choices.map((c) => [null, c[1]]), items: S.LOCKS[k].sort.items };
  });
  S.ENDINGS.forEach((e) => {
    const o = { label: e.label };
    ["log", "reply", "title", "epilogue"].forEach((f) => { if (e[f] != null) o[f] = e[f]; });
    ["yes", "no"].forEach((f) => { if (e[f]) o[f] = { log: e[f].log, reply: e[f].reply, title: e[f].title, epilogue: e[f].epilogue }; });
    story.endings[e.id] = o;
  });
  return story;
}

function pages() {
  const out = {};
  fs.readdirSync(path.join(ROOT, "notes")).filter((f) => f.endsWith(".html")).sort().forEach((f) => {
    const h = read("notes/" + f), id = f.slice(0, -5);
    const m = h.match(/<main data-i18n-page="[^"]+">([\s\S]*?)<\/main>/);
    const t = h.match(/<title>([^<]*)<\/title>/);
    if (m) out[id] = m[1].trim();
    if (t) out[id + ":title"] = t[1];
  });
  return out;
}

function flat(o, pre, out) {
  out = out || {};
  if (typeof o === "string") out[pre] = o;
  else if (Array.isArray(o)) o.forEach((v, i) => flat(v, pre + "[" + i + "]", out));
  else if (o && typeof o === "object") Object.keys(o).forEach((k) => flat(o[k], pre ? pre + "." + k : k, out));
  return out;
}

/* Every script and page outside js/lang/ and tools/, as one text */
function sources() {
  const out = [];
  (function walk(dir) {
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((d) => {
      const rel = dir ? dir + "/" + d.name : d.name;
      if (d.isDirectory()) {
        if (!["js/lang", "tools", "img", "fonts", "licenses", "css"].includes(rel) && !d.name.startsWith(".")) walk(rel);
      } else if (/\.(js|html)$/.test(d.name)) out.push(read(rel));
    });
  })("");
  return out.join("\n");
}
function used(key, src) {
  const lit = JSON.stringify(key).slice(1, -1);
  return ['"' + lit + '"', "'" + lit.replace(/\\"/g, '"').replace(/'/g, "\\'") + "'", "`" + key + "`", ">" + key + "<"]
    .some((form) => src.includes(form));
}

const [cmd, code] = process.argv.slice(2);
const S = loadGame();
const en = S.i18n; // English pack registered through i18n.js
const enPack = (() => { let p; const r = S.i18n.register; S.i18n.register = (c, pk) => { p = pk; }; vm.runInNewContext(read("js/lang/en.js"), { SELK: S }); S.i18n.register = r; return p; })();

if (cmd === "keys") {
  process.stdout.write(uiKeys().join("\n") + "\n");
} else if (cmd === "template" && code) {
  const ui = {};
  uiKeys().forEach((k) => { ui[k] = enPack.ui[k] != null ? enPack.ui[k] : k; });
  const pack = { meta: { name: code, dir: "ltr" }, ui, commands: enPack.commands, args: enPack.args, story: storySkeleton(S), pages: pages() };
  process.stdout.write("/* " + code + ". Generated by tools/i18n-catalog.js; translate every value. See TRANSLATING.md. */\n" +
    "SELK.i18n.register(" + JSON.stringify(code) + ", " + JSON.stringify(pack, null, 2) + ");\n");
} else if (cmd === "unused" && code) {
  let pack;
  if (code === "en") pack = enPack;
  else {
    S.i18n.register = (c, pk) => { if (c === code) pack = pk; };
    vm.runInNewContext(read("js/lang/" + code + ".js"), { SELK: S });
  }
  const src = sources(), extra = [];
  Object.keys(pack.ui || {}).forEach((k) => { if (!used(k, src)) extra.push("ui: " + k); });
  const want = flat(storySkeleton(S), ""), have = flat(pack.story || {}, "");
  Object.keys(have).forEach((k) => { if (!(k in want)) extra.push("story: " + k); });
  const pg = pages();
  Object.keys(pack.pages || {}).forEach((k) => { if (!(k in pg)) extra.push("page: " + k); });
  Object.keys(pack.commands || {}).forEach((k) => { if (!enPack.commands[k]) extra.push("command: " + k); });
  Object.keys(pack.args || {}).forEach((k) => { if (!enPack.args[k]) extra.push("arg: " + k); });
  process.stdout.write(extra.length ? extra.join("\n") + "\n" + extra.length + " unused\n" : "none unused\n");
  process.exitCode = extra.length ? 1 : 0;
} else if (cmd === "check" && code) {
  let pack;
  S.i18n.register = (c, pk) => { if (c === code) pack = pk; };
  vm.runInNewContext(read("js/lang/" + code + ".js"), { SELK: S });
  const missing = [];
  uiKeys().forEach((k) => { if (!pack.ui || pack.ui[k] == null) missing.push("ui: " + k); });
  const want = flat(storySkeleton(S), ""), have = flat(pack.story || {}, "");
  Object.keys(want).forEach((k) => { if (have[k] == null && want[k] !== "") missing.push("story: " + k); });
  Object.keys(pages()).forEach((k) => { if (!pack.pages || !pack.pages[k]) missing.push("page: " + k); });
  Object.keys(enPack.commands).forEach((k) => { if (!pack.commands || !pack.commands[k]) missing.push("command: " + k); });
  Object.keys(enPack.args).forEach((k) => { if (!pack.args || !pack.args[k]) missing.push("arg: " + k); });
  process.stdout.write(missing.length ? missing.join("\n") + "\n" + missing.length + " missing\n" : "complete\n");
  process.exitCode = missing.length ? 1 : 0;
} else {
  process.stdout.write("usage: node tools/i18n-catalog.js template xx | check xx | unused xx | keys\n");
}
