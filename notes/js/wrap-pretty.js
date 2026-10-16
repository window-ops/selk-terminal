/* Notes pages: keeps the last word of each paragraph, list item and heading
   off a line of its own, by joining it to the word before with a no-break
   space. Runs only in browsers without CSS text-wrap: pretty. */
(function () {
  "use strict";

  if (window.CSS && CSS.supports && CSS.supports("text-wrap", "pretty")) return;

  var blocks = document.querySelectorAll("main p, main li, main dd, main h1, main h2, main h3");

  for (var i = 0; i < blocks.length; i += 1) {
    var walker = document.createTreeWalker(blocks[i], NodeFilter.SHOW_TEXT);
    var node;
    var lastText = null;

    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) lastText = node;
    }

    if (!lastText) continue;

    var value = lastText.nodeValue;
    var match = /([\t\n\f\r ]+)(\S+)([\t\n\f\r ]*)$/.exec(value);
    if (!match) continue;

    var prefix = value.slice(0, match.index);
    if (!/\S[\s\S]*\s\S/.test(prefix + match[2])) continue;

    lastText.nodeValue = prefix + "\u00a0" + match[2] + match[3];
  }
})();
