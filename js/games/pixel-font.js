/* A 5 by 7 pixel font for the canvas games, the same letters as the BIG font
   of tools/pixel-sheet.js. It has the Romanian letters, and Greek capitals
   that share a Latin shape use the Latin glyph. Text is drawn in capitals.
   Each text in each color is drawn once to a small canvas and reused. */
(function () {
  var S = window.SELK;
  var G = {
    A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110",
    C: "01110 10001 10000 10000 10000 10001 01110", D: "11100 10010 10001 10001 10001 10010 11100",
    E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
    G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001",
    I: "01110 00100 00100 00100 00100 00100 01110", J: "00111 00010 00010 00010 00010 10010 01100",
    K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
    M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 10001 11001 10101 10011 10001 10001",
    O: "01110 10001 10001 10001 10001 10001 01110", P: "11110 10001 10001 11110 10000 10000 10000",
    Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
    S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100",
    U: "10001 10001 10001 10001 10001 10001 01110", V: "10001 10001 10001 10001 10001 01010 00100",
    W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
    Y: "10001 10001 10001 01010 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111",
    0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110",
    2: "01110 10001 00001 00010 00100 01000 11111", 3: "11111 00010 00100 00010 00001 10001 01110",
    4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
    6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000",
    8: "01110 10001 10001 01110 10001 10001 01110", 9: "01110 10001 10001 01111 00001 00010 01100",
    " ": "00000 00000 00000 00000 00000 00000 00000", "-": "00000 00000 00000 11111 00000 00000 00000",
    ".": "00000 00000 00000 00000 00000 01100 01100", ",": "00000 00000 00000 00000 01100 00100 01000",
    ":": "00000 01100 01100 00000 01100 01100 00000", "'": "00100 00100 01000 00000 00000 00000 00000",
    "!": "00100 00100 00100 00100 00100 00000 00100", "?": "01110 10001 00001 00010 00100 00000 00100",
    "+": "00000 00100 00100 11111 00100 00100 00000", "/": "00001 00010 00010 00100 01000 01000 10000",
    "%": "11001 11010 00010 00100 01000 01011 10011", "€": "00111 01000 11110 01000 11110 01000 00111",
    "(": "00010 00100 01000 01000 01000 00100 00010", ")": "01000 00100 00010 00010 00010 00100 01000",
    "Π": "11111 10001 10001 10001 10001 10001 10001", "Λ": "00100 01010 01010 10001 10001 10001 10001",
    "Σ": "11111 10000 01000 00100 01000 10000 11111", "Γ": "11111 10000 10000 10000 10000 10000 10000",
    "Θ": "01110 10001 10001 11111 10001 10001 01110"
  };
  Object.keys(G).forEach(function (k) { G[k] = { rows: G[k].split(" "), above: 0 }; });
  /* Marks above are two rows on top of the letter, the comma of Ș and Ț two
     rows under it */
  function mark(ch, base, above, below) {
    G[ch] = { rows: (above || []).concat(G[base].rows, below || []), above: (above || []).length };
  }
  mark("Ă", "A", ["10001", "01110"]);
  mark("Â", "A", ["00100", "01010"]);
  mark("Î", "I", ["00100", "01010"]);
  mark("Ș", "S", null, ["00100", "01000"]);
  mark("Ț", "T", null, ["00100", "01000"]);
  [["Α", "A"], ["Β", "B"], ["Ε", "E"], ["Ζ", "Z"], ["Η", "H"], ["Ι", "I"], ["Κ", "K"], ["Μ", "M"],
    ["Ν", "N"], ["Ο", "O"], ["Ρ", "P"], ["Τ", "T"], ["Υ", "Y"], ["Χ", "X"]].forEach(function (m) { G[m[0]] = G[m[1]]; });
  var cache = {}, cached = 0;
  function chars(s) {
    return Array.from(String(s).toUpperCase());
  }
  function width(s) {
    var n = chars(s).length;
    return n ? n * 6 - 1 : 0;
  }
  /* The text on a canvas two rows taller above and below than a letter, for
     the marks */
  function sprite(s, color) {
    var key = color + "|" + s;
    if (cache[key]) { return cache[key]; }
    if (cached > 300) { cache = {}; cached = 0; }
    var cs = chars(s), c = document.createElement("canvas");
    c.width = Math.max(1, width(s)); c.height = 11;
    var x = c.getContext("2d");
    x.fillStyle = color;
    cs.forEach(function (ch, i) {
      var gl = G[ch] || G[" "];
      gl.rows.forEach(function (row, y) {
        for (var b = 0; b < 5; b++) {
          if (row[b] === "1") { x.fillRect(i * 6 + b, 2 - gl.above + y, 1, 1); }
        }
      });
    });
    cached++;
    return (cache[key] = c);
  }
  /* Draws s with the top of its capitals at y; align is "left", "center" or
     "right" of x. With an outline color, each letter gets an edge in it,
     so the text reads over any background. scale draws each font pixel as
     a square of that many canvas pixels. */
  function draw(g, s, x, y, color, align, outline, scale) {
    if (!s) { return; }
    var k = scale || 1, u = String(s).toUpperCase(), w = width(s) * k;
    var left = Math.round(align === "center" ? x - Math.floor(w / 2) : align === "right" ? x - w : x), top = Math.round(y) - 2 * k;
    function put(img, dx, dy) { g.drawImage(img, left + dx, top + dy, img.width * k, img.height * k); }
    if (outline) {
      var o = sprite(u, outline);
      [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (d) { put(o, d[0] * k, d[1] * k); });
    }
    put(sprite(u, color), 0, 0);
  }
  S.pixelFont = { width: width, draw: draw };
})();
