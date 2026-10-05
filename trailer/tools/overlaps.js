/* Lists, per frame, the pixels one object draws over another:
     node tools/overlaps.js <scene> [under>over,...]
   where each under>over pair (name prefixes) is allowed, such as
   "street>car", an object standing on its support. */
const { frame } = require("../animations/lib/scene");
const { GROUND, SKY, GREY } = require("../animations/palette");
const sc = require("../animations/" + process.argv[2]);
const allow = (process.argv[3] || "").split(",").filter(Boolean).map((p) => p.split(">"));
for (let n = 0; n < sc.frames; n++) {
  const objs = [];
  const fr = frame("f" + n, { ground: GROUND, soft: [SKY], grid: null, frame: GREY });
  const obj = fr.obj;
  const px = {};
  fr.obj = (name, rule, fn) => { obj(name, rule, fn); objs.push(name); };
  /* record ownership by wrapping set */
  const set = fr.d.set; let cur = null;
  fr.d.set = (x, y, c) => { const k = Math.round(x) + "," + Math.round(y); if (cur) { if (px[k] && px[k] !== cur) report(px[k], cur, k); px[k] = cur; } set(x, y, c); };
  const seen = {};
  function report(a, b, k) { const key = a + " under " + b; if (allow.some(([u, o]) => (a.startsWith(u) && b.startsWith(o)))) return; seen[key] = (seen[key] || 0) + 1; }
  fr.obj = (name, rule, fn) => obj(name, rule, (d) => { cur = name; fn(d); cur = null; });
  sc.draw(fr, n);
  const keys = Object.keys(seen);
  if (keys.length) console.log("frame " + n + ": " + keys.map((k) => k + " (" + seen[k] + ")").join("; "));
}
