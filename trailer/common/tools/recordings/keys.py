"""Turns a traced pointer path into keyframes for a shot.
Usage: python3 -I keys.py <trace.json> <from s> <to s> [tolerance px] [speed]
Prints [t, x, y, kind] rows, t from 0 (divided by speed), simplified with
Ramer-Douglas-Peucker in (x, y) per run of one cursor kind."""
import sys, json
r = json.load(open(sys.argv[1])); a, b = float(sys.argv[2]), float(sys.argv[3])
tol = float(sys.argv[4]) if len(sys.argv) > 4 else 1.5; speed = float(sys.argv[5]) if len(sys.argv) > 5 else 1
rows = [x for x in r if a <= x["t"] <= b]
# The recordings update the pointer every few frames, so the trace holds
# each place for 3 or 4 frames: keep the first frame of each place, and the
# last one too when the pointer rests there longer than 0.1 s
dedup = []
for i, x in enumerate(rows):
    prev = rows[i - 1] if i else None
    nxt = rows[i + 1] if i + 1 < len(rows) else None
    same_prev = prev and (prev["x"], prev["y"], prev["kind"]) == (x["x"], x["y"], x["kind"])
    same_next = nxt and (nxt["x"], nxt["y"], nxt["kind"]) == (x["x"], x["y"], x["kind"])
    if not same_prev:
        dedup.append(x); start = x["t"]
    elif not same_next and x["t"] - start > 0.1:
        dedup.append(x)
if rows and dedup[-1] is not rows[-1]: dedup.append(rows[-1])
rows = dedup
def rdp(pts):
    if len(pts) < 3 or pts[0][1] is None: return pts if len(pts) < 3 else [pts[0], pts[-1]]
    (t0, x0, y0), (t1, x1, y1) = pts[0][:3], pts[-1][:3]
    best, bi = -1, 0
    for i in range(1, len(pts) - 1):
        t, x, y = pts[i][:3]
        u = (t - t0) / (t1 - t0) if t1 > t0 else 0
        d = ((x - (x0 + (x1 - x0) * u)) ** 2 + (y - (y0 + (y1 - y0) * u)) ** 2) ** 0.5
        if d > best: best, bi = d, i
    if best <= tol: return [pts[0], pts[-1]]
    return rdp(pts[:bi + 1])[:-1] + rdp(pts[bi:])
out, run = [], []
def flush():
    global run
    if run: out.extend(rdp(run))
    run = []
for x in rows:
    p = (x["t"], x["x"], x["y"], x["kind"])
    if run and (p[3] != run[-1][3]): flush()
    run.append(p)
flush()
# Short losses of the trace inside a move (under 0.6 s): the pointer is
# interpolated across them; longer runs (typing) stay hidden
keep = []
for i, p in enumerate(out):
    if p[3] is None:
        before = next((q for q in reversed(out[:i]) if q[3] is not None), None)
        after = next((q for q in out[i + 1:] if q[3] is not None), None)
        if before and after and after[0] - before[0] < 0.6:
            continue
    keep.append(p)
out = keep
print(json.dumps([[round((t - a) / speed, 3), x if x is None else round(x, 1), y if y is None else round(y, 1), k] for t, x, y, k in out]))
