/* Animated archive scenes: one pixel sheet per frame (vendor/pixel-sheet.js),
   with named objects and a support check run on every frame.

   Every object is drawn inside obj(name, rule, fn). The rule says what holds
   it up, and the check fails the frame when it does not:
     on: [names]     a pixel of the object sits directly on one of them
     hangs: [names]  a pixel of the object sits directly under one of them
     touch: [names]  the object touches every one of them (4-neighbours)
     edge: true      the object reaches the edge of the picture
     mounted: true   fixed to the wall behind (a window, a shelf)
     free: true      flies or floats by nature (flame, smoke, a rocket in
                     flight, a star); no support check. With whole: true
                     it must still be one piece (a satellite and its
                     antennas).
   Unless parts: true, an object must also be one piece (8-neighbours), so a
   part that came loose from its object is caught as well. Only the pixels
   that can be seen count for this: a pixel drawn in the colour of what is
   behind it joins nothing on screen. The checks use the pixels each object
   drew, so an object in front does not hide a contact behind it. */
"use strict";
const zlib = require("zlib");
const { sheet } = require("../../vendor/pixel-sheet");

const RULES = ["on", "hangs", "touch", "edge", "mounted", "free"];

function frame(name, opts, prebuilt) {
  const s = prebuilt || sheet(name, opts);
  /* Whether a pixel shows against what was behind it: any other colour */
  const differs = (a, b) => a !== b;
  const W = s.w, H = s.h, objs = {}, order = [];
  let cur = null;
  const set = s.d.set;
  /* Nothing is drawn over the picture's frame: what reaches it stops at
     it */
  const framed = opts.frame != null;
  s.d.set = function (x, y, c) {
    const X = Math.round(x), Y = Math.round(y);
    if (framed && (X <= 0 || Y <= 0 || X >= W - 1 || Y >= H - 1)) return;
    const inside = X >= 0 && Y >= 0 && X < W && Y < H;
    const behind = inside ? s.px[Y * W + X] : null;
    set(x, y, c);
    if (cur && inside) {
      const i = Y * W + X;
      if (!cur.px.has(i)) cur.behind.set(i, behind);
      cur.px.add(i);
      if (differs(c, cur.behind.get(i))) cur.seen.add(i); else cur.seen.delete(i);
    }
  };
  /* A clear wipes what was drawn there: the wiped pixels stop counting
     for every object */
  const clear = s.d.clear;
  s.d.clear = function (x, y, w, h) {
    clear(x, y, w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x + i, Y = y + j;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      order.forEach((k) => { objs[k].px.delete(Y * W + X); objs[k].seen.delete(Y * W + X); });
    }
  };
  function obj(oname, rule, fn) {
    if (objs[oname]) throw new Error(name + ": object " + oname + " drawn twice");
    if (!RULES.some((r) => rule[r])) throw new Error(name + ": object " + oname + " says nothing about what holds it up");
    cur = objs[oname] = { name: oname, rule, px: new Set(), seen: new Set(), behind: new Map() };
    order.push(oname);
    fn(s.d);
    cur = null;
  }
  function has(o, x, y) {
    return x >= 0 && y >= 0 && x < W && y < H && o.px.has(y * W + x);
  }
  function pieces(o) {
    const seen = new Set(), vis = { px: o.seen };
    let n = 0;
    o.seen.forEach((p) => {
      if (seen.has(p)) return;
      n++;
      const stack = [p]; seen.add(p);
      while (stack.length) {
        const q = stack.pop(), x = q % W, y = (q - x) / W;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
          if ((i || j) && has(vis, x + i, y + j) && !seen.has((y + j) * W + x + i)) {
            seen.add((y + j) * W + x + i); stack.push((y + j) * W + x + i);
          }
        }
      }
    });
    return n;
  }
  function contact(o, others, dx, dy) {
    for (const p of o.px) {
      const x = p % W, y = (p - x) / W;
      if (has(o, x + dx, y + dy)) continue;
      if (others.some((b) => has(b, x + dx, y + dy))) return true;
    }
    return false;
  }
  function check() {
    const problems = s.problems.slice();
    order.forEach((k) => {
      const o = objs[k], r = o.rule, where = name + ": " + k;
      /* A free object may have left the picture; anything else that draws
         nothing is a mistake */
      if (!o.px.size) { if (!r.free) problems.push(where + " drew nothing"); return; }
      if (r.free) {
        if (r.whole && pieces(o) > 1) problems.push(where + " is in " + pieces(o) + " pieces");
        return;
      }
      if (!r.parts && pieces(o) > 1) problems.push(where + " is in " + pieces(o) + " pieces");
      const get = (list) => list.map((n) => {
        if (!objs[n]) problems.push(where + " rests on " + n + ", which is not drawn");
        return objs[n];
      }).filter(Boolean);
      if (r.on && !contact(o, get(r.on), 0, 1)) problems.push(where + " floats: nothing of " + r.on.join(", ") + " under it");
      if (r.hangs && !contact(o, get(r.hangs), 0, -1)) problems.push(where + " floats: nothing of " + r.hangs.join(", ") + " over it");
      if (r.touch) get(r.touch).forEach((b) => {
        if (![[0, 1], [0, -1], [1, 0], [-1, 0]].some((v) => contact(o, [b], v[0], v[1]))) problems.push(where + " floats: does not touch " + b.name);
      });
      if (r.edge) {
        let at = false;
        o.px.forEach((p) => { const x = p % W, y = (p - x) / W; if (x <= 1 || y <= 1 || x >= W - 2 || y >= H - 2) at = true; });
        if (!at) problems.push(where + " floats: does not reach the edge");
      }
    });
    return problems;
  }
  return { s, d: s.d, obj, check };
}

/* A PNG of the sheet, pal mapping colour indexes to #RRGGBB */
function png(s, pal) {
  const W = s.w, H = s.h, rgb = pal.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const c = rgb[s.px[y * W + x]], o = y * (W * 3 + 1) + 1 + x * 3;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }
  const crcTable = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/* The points of a pixel line, in drawing order */
function linePoints(x0, y0, x1, y1) {
  const out = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    out.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
  return out;
}

/* Text written onto a drawn surface (paper, a screen), in the small font,
   pixel by pixel through d.set, with no ground cleared around it. The
   label check of the sheet is for labels on the empty ground. */
const { SMALL } = require("../../vendor/pixel-sheet");
/* Glyphs the small font lacks, in its 3 by 5 grid: the Cyrillic El and
   the exclamation mark drawn new; Cyrillic Pe, O, Ie and Ha take the
   shapes they share with Greek Pi and Latin O, E and X */
const EXTRA = {
  "Л": "011 101 101 101 101", "!": "010 010 010 000 010",
  "П": SMALL.glyphs["Π"], "О": SMALL.glyphs.O, "Е": SMALL.glyphs.E, "Х": SMALL.glyphs.X,
  /* Polish N with an acute: the mark in the row above the letter */
  "Ń": { rows: ["001"].concat(SMALL.glyphs.N.split(" ")), above: 1 }
};
/* Writes s with its top-left at x, y; a glyph with a mark above has its
   mark in the rows over y. Rows outside [clipTop, clipBottom] are not
   drawn, for text that rolls in a window. */
function write(d, x, y, s, c, clipTop = -Infinity, clipBottom = Infinity) {
  String(s).toUpperCase().split("").forEach((ch, i) => {
    const g = EXTRA[ch] || SMALL.glyphs[ch] || SMALL.glyphs[" "];
    const rows = typeof g === "string" ? g.split(" ") : g.rows, above = typeof g === "string" ? 0 : g.above;
    rows.forEach((row, r) => {
      const Y = y - above + r;
      if (Y < clipTop || Y > clipBottom) return;
      for (let b = 0; b < SMALL.w; b++) if (row[b] === "1") d.set(x + i * SMALL.adv + b, Y, c);
    });
  });
}
function writeC(d, cx, y, s, c) {
  const w = String(s).length * SMALL.adv - (SMALL.adv - SMALL.w);
  write(d, cx - Math.floor((w - 1) / 2), y, s, c);
}

/* An RGB picture for scenes copied from the game's js/game/scenes.js,
   which draw in free colours with opacity on a 160 by 90 grid. Its pixels
   are 0xRRGGBB numbers; R and P are the game's rect and pixel, rounded the
   same way, blended over what is there. It takes the same objects and the
   same check as the archive pictures (frameRGB). */
function rgbSheet(W, H, bg) {
  const px = new Array(W * H).fill(bg);
  const hex = (c) => parseInt(c.slice(1), 16);
  const s = { w: W, h: H, px, problems: [], rgb: true };
  s.d = {
    w: W, h: H,
    set(x, y, c) {
      x = Math.round(x); y = Math.round(y);
      if (x >= 0 && y >= 0 && x < W && y < H) px[y * W + x] = c;
    },
    clear(x, y, w, h) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (x + i >= 0 && y + j >= 0 && x + i < W && y + j < H) px[(y + j) * W + x + i] = bg;
    },
    R(x, y, w, h, c, o) {
      x = Math.round(x); y = Math.round(y); w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
      const top = hex(c), a = o == null || o >= 1 ? 1 : o;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const X = x + i, Y = y + j;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const under = px[Y * W + X];
        const mix = (sh) => Math.round(((top >> sh) & 255) * a + ((under >> sh) & 255) * (1 - a));
        s.d.set(X, Y, (mix(16) << 16) | (mix(8) << 8) | mix(0));
      }
    },
    P(x, y, c, o) { s.d.R(x, y, 1, 1, c, o); }
  };
  return s;
}
function frameRGB(name, W, H, bg) {
  return frame(name, {}, rgbSheet(W, H, bg));
}
/* A PNG of an RGB picture */
function pngRGB(s) {
  const pal = [], index = new Map();
  const q = { w: s.w, h: s.h, px: s.px.map((c) => {
    if (!index.has(c)) { index.set(c, pal.length); pal.push("#" + c.toString(16).padStart(6, "0")); }
    return index.get(c);
  }) };
  return png(q, pal);
}

module.exports = { frame, frameRGB, png, pngRGB, linePoints, write, writeC };
