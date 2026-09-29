/* Notes pages in the player's language. The page's <main> names its id in
   data-i18n-page; a language pack may carry the translated inner HTML under
   pages[id] and the window title under pages[id + ":title"]. Without them the
   English page stays. Runs before devnotes.js fills its containers. */
(function () {
  "use strict";
  var S = window.SELK;
  /* Language picker above the page, shared with the game: a choice made here
     applies to the game as well. The notice sits under the picker for every
     language other than English. */
  function languageBar() {
    var bar = document.createElement("div");
    bar.className = "lang-bar";
    var label = document.createElement("label");
    var word = S.t("Language");
    label.textContent = word === "Language" ? word : word + " / Language";
    var sel = document.createElement("select");
    sel.id = "lang-pick"; label.htmlFor = sel.id;
    S.i18n.choices().forEach(function (c) {
      var o = document.createElement("option");
      o.value = c[0]; o.lang = c[0]; o.textContent = c[1]; o.selected = c[0] === S.i18n.lang();
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { S.i18n.switchTo(sel.value); });
    bar.appendChild(label); bar.appendChild(sel);
    return bar;
  }
  S.i18n.ready.then(function () {
    var main = document.querySelector("main[data-i18n-page]");
    if (!main) {
      return;
    }
    var id = main.getAttribute("data-i18n-page");
    var html = S.i18n.page(id), title = S.i18n.page(id + ":title");
    if (html) {
      main.innerHTML = html;
    }
    if (title) {
      document.title = title;
    }
    var heading = main.querySelector("h1");
    if (heading) {
      var row = document.createElement("div"), box = document.createElement("div");
      row.className = "notes-head-row"; box.className = "lang-box";
      heading.parentNode.insertBefore(row, heading);
      box.appendChild(languageBar());
      if (S.i18n.lang() !== "en") {
        var note = document.createElement("p");
        note.className = "lang-note"; note.textContent = S.t(S.i18n.NOTICE);
        box.appendChild(note);
      }
      row.appendChild(heading); row.appendChild(box);
    }
  });
})();
