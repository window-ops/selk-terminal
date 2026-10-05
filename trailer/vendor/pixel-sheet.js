/* The pixel raster shared by tools/design-drawings.js and
   tools/history-pictures.js: a sheet, 128 by 64 pixels unless a size is
   given, with lines, boxes, circles and a pixel font, written as an SVG with
   one rect per row of equal pixels, one element per line.

   Two fonts: SMALL, 3 by 5 pixels, for the sheets and pictures, and BIG, 5 by
   7 pixels, for a larger picture with the letters of every official
   language (the citizen pass). A letter with a mark above has extra rows on
   top; a letter with a mark below (Ț) has them underneath.

   Labels need one clear pixel around them: a label that touches a line or
   another label, or a line drawn over a label, is added to the sheet's
   problems. Pixels drawn with soft colours (hatching, sky texture) do not
   count. Symmetric parts are drawn on one side and mirrored pixel for pixel. */
"use strict";
/* What each pixel is, for the label check */
const K_BG = 0, K_SHAPE = 1, K_TEXT = 2;

/* 3 by 5 font: five rows of three bits per glyph */
const SMALL_GLYPHS = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111",
  0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110",
  4: "101101111001001", 5: "111100110001110", 6: "011100111101111", 7: "111001010010010",
  8: "111101111101111", 9: "111101111001110",
  "-": "000000111000000", ".": "000000000000010", "/": "001001010100100", ":": "000010000010000",
  "+": "000010111010000", ">": "100010001010100", "%": "101001010100101", ",": "000000000010100",
  " ": "000000000000000"
};

/* 5 by 7 font: seven rows of five bits per glyph */
const BIG_GLYPHS = {
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
  "-": "00000 00000 00000 11111 00000 00000 00000", ".": "00000 00000 00000 00000 00000 01100 01100",
  " ": "00000 00000 00000 00000 00000 00000 00000",
  /* Greek and Cyrillic letters with their own shape */
  "Π": "11111 10001 10001 10001 10001 10001 10001", "Λ": "00100 01010 01010 10001 10001 10001 10001",
  "Σ": "11111 10000 01000 00100 01000 10000 11111", "Г": "11111 10000 10000 10000 10000 10000 10000",
  "Ж": "10101 10101 01110 00100 01110 10101 10101", "Д": "00110 01010 01010 01010 01010 11111 10001",
  "И": "10001 10001 10011 10101 11001 10001 10001",
  /* Đ: a D with a bar across its stem */
  "Đ": "01110 01001 01001 11101 01001 01001 01110"
};

/* The marks of the other official languages, and the letters that carry
   them: marks above are two rows on top of the letter, the comma of Ț is two
   rows under it. Greek and Cyrillic letters drawn like a Latin one share its
   glyph. */
function addLetters(glyphs, w, marks) {
  const rows = (g) => g.split(" ");
  Object.keys(marks.above).forEach((ch) => { glyphs[ch] = { rows: marks.above[ch][0].concat(rows(glyphs[marks.above[ch][1]])), above: marks.above[ch][0].length }; });
  Object.keys(marks.below).forEach((ch) => { glyphs[ch] = { rows: rows(glyphs[marks.below[ch][1]]).concat(marks.below[ch][0]), above: 0 }; });
  [["А", "A"], ["Р", "P"], ["Н", "H"], ["Ο", "O"], ["Ι", "I"], ["Τ", "T"], ["Η", "H"]].forEach((m) => { glyphs[m[0]] = glyphs[m[1]]; });
}
addLetters(BIG_GLYPHS, 5, {
  above: {
    "Č": [["01010", "00100"], "C"], "Ž": [["01010", "00100"], "Z"], "Ċ": [["00100", "00000"], "C"],
    "Ü": [["01010", "00000"], "U"], "Á": [["00010", "00100"], "A"], "Ă": [["10001", "01110"], "A"],
    "Ã": [["01101", "10110"], "A"]
  },
  below: { "Ț": [["00100", "01000"], "T"] }
});
/* The small font has room for one row of mark only: the mark sits in the
   row above the line */
(function () {
  const g = SMALL_GLYPHS, split = (s) => s.match(/.{3}/g).join(" ");
  Object.keys(g).forEach((k) => { g[k] = split(g[k]); });
  addLetters(g, 3, {
    above: {
      "Č": [["101"], "C"], "Ċ": [["010"], "C"], "Ü": [["101"], "U"], "Á": [["001"], "A"],
      "Ă": [["101"], "A"], "Ã": [["011"], "A"], "Ž": [["101"], "Z"]
    },
    below: {}
  });
  Object.assign(g, {
    "Ț": "111 010 010 000 010", "Đ": "110 101 111 101 110", "Π": "111 101 101 101 101", "Λ": "010 101 101 101 101",
    "Σ": "111 100 010 100 111", "Г": "111 100 100 100 100", "Ж": "101 111 010 111 101", "Д": "011 101 101 111 101",
    "И": "101 101 111 111 101"
  });
})();
const SMALL = { glyphs: SMALL_GLYPHS, w: 3, h: 5, adv: 4 };
const BIG = { glyphs: BIG_GLYPHS, w: 5, h: 7, adv: 6 };
/* A glyph as { rows, above }: its rows, and how many of them sit above the
   line */
function glyph(font, ch) {
  const g = font.glyphs[ch] || font.glyphs[" "];
  return typeof g === "string" ? { rows: g.split(" "), above: 0 } : g;
}

/* Rounds away from zero at .5, so positions mirrored about a centre stay
   mirrored */
const round = (v) => Math.sign(v) * Math.round(Math.abs(v));

/* A new sheet. opts: w and h (128 by 64 when left out), font (SMALL when
   left out), ground (the colour index of the empty sheet), soft (colour
   indexes the label check ignores), grid (colour of a grid every 8 pixels,
   or null), frame (colour of the frame, or null), dim (colour of dimension
   lines). Returns { d, px, problems, w, h }. */
function sheet(name, opts) {
  const W = opts.w || 128, H = opts.h || 64, font = opts.font || SMALL;
  const ground = opts.ground || 0, soft = opts.soft || [];
  const px = new Array(W * H).fill(ground), kind = new Array(W * H).fill(K_BG), problems = [], labels = [];
  let mirrorAt = null;
  function put(x, y, c) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (kind[i] === K_TEXT && !problems.some((m) => m.indexOf(name + ": line over a label") === 0)) {
      problems.push(name + ": line over a label at " + x + "," + y);
    }
    px[i] = c; kind[i] = soft.indexOf(c) === -1 ? K_SHAPE : K_BG;
  }
  const d = {
    w: W, h: H, font,
    set(x, y, c) {
      x = Math.round(x); y = Math.round(y);
      put(x, y, c);
      if (mirrorAt !== null) put(mirrorAt - x, y, c);
    },
    /* Everything drawn inside fn is also drawn mirrored around the column
       axis2 / 2, so the part is symmetric pixel for pixel */
    mirror(axis2, fn) {
      mirrorAt = axis2; fn(); mirrorAt = null;
    },
    line(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) {
        d.set(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    },
    /* A polyline through points [[x, y], ...] */
    path(pts, c) {
      for (let i = 1; i < pts.length; i++) d.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c);
    },
    /* A dashed line, for a part that was planned and not built */
    dash(x0, y0, x1, y1, c) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) if (i % 3 !== 2) d.set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
    },
    box(x, y, w, h, c) {
      d.line(x, y, x + w - 1, y, c); d.line(x, y + h - 1, x + w - 1, y + h - 1, c);
      d.line(x, y, x, y + h - 1, c); d.line(x + w - 1, y, x + w - 1, y + h - 1, c);
    },
    fill(x, y, w, h, c) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) d.set(x + i, y + j, c);
    },
    /* Clears an area to the ground, removing the grid, before a part with
       its own fill */
    clear(x, y, w, h) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const X = x + i, Y = y + j;
        if (X >= 0 && Y >= 0 && X < W && Y < H) { px[Y * W + X] = ground; kind[Y * W + X] = K_BG; }
      }
    },
    /* A circle, or the arc from a0 to a1 in degrees, 0 to the right and
       90 downwards */
    arc(cx, cy, r, c, a0 = 0, a1 = 360) {
      const steps = Math.max(24, Math.ceil(r * 8));
      for (let i = 0; i <= steps; i++) {
        const a = (a0 + (a1 - a0) * i / steps) * Math.PI / 180;
        d.set(cx + r * Math.cos(a), cy + r * Math.sin(a), c);
      }
    },
    /* A filled circle */
    disc(cx, cy, r, c) {
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) d.set(cx + x, cy + y, c);
    },
    /* n points evenly round a circle, the first at the top, rounded so that
       the ring is symmetric left to right and top to bottom */
    ring(cx, cy, r, n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n;
        out.push([cx + round(r * Math.cos(a)), cy + round(r * Math.sin(a))]);
      }
      return out;
    },
    /* Diagonal hatching on cleared ground in colour c, which should be soft */
    hatch(x, y, w, h, c) {
      d.clear(x, y, w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((x + i + y + j) % 4 === 0) d.set(x + i, y + j, c);
    },
    /* The width of a label in pixels */
    width(s) {
      return String(s).length * font.adv - (font.adv - font.w);
    },
    /* A label, its top left at x, y. The glyphs, their marks and a margin of
       one pixel must be free of lines and of other labels; the ground under
       them is cleared. */
    text(x, y, s, c) {
      s = String(s).toUpperCase();
      const w = d.width(s), gs = s.split("").map((ch) => glyph(font, ch));
      const up = Math.max(0, ...gs.map((g) => g.above)), down = Math.max(0, ...gs.map((g) => g.rows.length - g.above - font.h));
      const top = y - up - 1, bottom = y + font.h + down;
      let bad = "";
      for (let j = top; j <= bottom; j++) for (let i = x - 1; i <= x + w; i++) {
        if (i < 0 || j < 0 || i >= W || j >= H) { bad = bad || "leaves the sheet"; continue; }
        const k = j * W + i;
        if (kind[k] === K_SHAPE) { bad = bad || "touches a line at " + i + "," + j; }
        if (kind[k] === K_BG) { px[k] = ground; }
      }
      labels.forEach((o) => {
        if (x - 1 <= o.x1 && x + w >= o.x0 && top <= o.y1 && bottom >= o.y0) { bad = bad || "touches the label " + o.s; }
      });
      labels.push({ s, x0: x, x1: x + w - 1, y0: top + 1, y1: bottom - 1 });
      if (bad) { problems.push(name + ": label " + s + " " + bad); }
      gs.forEach((g, n) => {
        g.rows.forEach((row, r) => {
          for (let b = 0; b < font.w; b++) {
            if (row[b] === "1") { px[(y - g.above + r) * W + x + n * font.adv + b] = c; }
          }
        });
      });
      for (let j = top; j <= bottom; j++) for (let i = x - 1; i <= x + w; i++) {
        if (i >= 0 && j >= 0 && i < W && j < H) kind[j * W + i] = K_TEXT;
      }
    },
    /* A label centred on column cx */
    textC(cx, y, s, c) {
      d.text(cx - Math.floor((d.width(s) - 1) / 2), y, s, c);
    },
    /* Dimension lines with end ticks */
    dimH(x0, x1, y) {
      const c = opts.dim;
      d.line(x0, y, x1, y, c); d.line(x0, y - 1, x0, y + 1, c); d.line(x1, y - 1, x1, y + 1, c);
    },
    dimV(x, y0, y1) {
      const c = opts.dim;
      d.line(x, y0, x, y1, c); d.line(x - 1, y0, x + 1, y0, c); d.line(x - 1, y1, x + 1, y1, c);
    }
  };
  if (opts.grid != null) {
    for (let y = 8; y < H; y += 8) for (let x = 0; x < W; x++) px[y * W + x] = opts.grid;
    for (let x = 8; x < W; x += 8) for (let y = 0; y < H; y++) px[y * W + x] = opts.grid;
  }
  if (opts.frame != null) d.box(0, 0, W, H, opts.frame);
  return { d, px, problems, w: W, h: H };
}

/* The sheet as an SVG, one element per line indented by two spaces, and the
   rects of each pixel row together; pal maps colour indexes to colours */
function svg(s, label, pal, ground) {
  ground = ground || 0;
  const W = s.w, H = s.h, px = s.px, out = [];
  out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" shape-rendering="crispEdges" role="img" aria-label="' + label + '">');
  out.push("  <title>" + label + "</title>");
  out.push('  <rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + pal[ground] + '"/>');
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const c = px[y * W + x];
      let n = 1;
      while (x + n < W && px[y * W + x + n] === c) n++;
      if (c !== ground) out.push('  <rect x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' + pal[c] + '"/>');
      x += n;
    }
  }
  out.push("</svg>");
  return out.join("\n") + "\n";
}

module.exports = { SMALL, BIG, sheet, svg, round };
