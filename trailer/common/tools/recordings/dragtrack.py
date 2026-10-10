#!/usr/bin/env python3
"""Fills the drag gaps of a traced path.

Usage: python3 -I dragtrack.py <recording.mp4> <path.json> <t> <tip x> <tip y>

During a drag Windows draws its own drag cursor (white arrow, black edge,
dashed box), so track.py finds nothing there. This takes that cursor from
the recording itself, at time t with its tip at page (tip x, tip y), and
follows it through every gap of the path that starts right after a grab or
a hand: near the last place, at page size. Rows found get kind "drag".
"""
import sys, json, subprocess
import numpy as np
import cv2

video, path, t0, tx, ty = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
# The template may come from another recording (same cursor): argument 6
tvideo = sys.argv[6] if len(sys.argv) > 6 else video
W, H = 1920, 1080
rows = json.load(open(path))

def frame_at(f, src=None):
    buf = subprocess.run(["ffmpeg", "-v", "error", "-ss", "%.4f" % (f / 60), "-i", src or video, "-frames:v", "1", "-vf", "scale=%d:%d:flags=area" % (W, H), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
    return np.frombuffer(buf, np.uint8).reshape(H, W, 3)

# The template: 30 by 30 page px from the tip; the mask keeps the arrow's
# white and black pixels and the dashes, the background left out
img = frame_at(round(t0 * 60), tvideo).astype(np.float32)
X, Y = int(round(tx)), int(round(ty))
T = img[Y - 2:Y + 28, X - 2:X + 22]
lum = T.mean(2)
M = ((lum > 200) | (lum < 12)).astype(np.float32)
Mc = np.dstack([M] * 3)

gaps, i = [], 0
while i < len(rows):
    if rows[i]["kind"] is None and i > 0 and rows[i - 1]["kind"] in ("grab", "hand", "handdrag"):
        j = i
        while j < len(rows) and rows[j]["kind"] is None:
            j += 1
        gaps.append((i, j))
        i = j
    else:
        i += 1

for a, b in gaps:
    px, py = rows[a - 1]["x"], rows[a - 1]["y"]
    errs = []
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", "%.4f" % (a / 60), "-i", video, "-frames:v", str(b - a), "-vf", "scale=%d:%d:flags=area" % (W, H), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    for k in range(a, b):
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        x0, y0 = max(0, int(px) - 160), max(0, int(py) - 160)
        win = f[y0:y0 + 352, x0:x0 + 344]
        r = cv2.matchTemplate(win, T, cv2.TM_SQDIFF, mask=Mc)
        r = np.nan_to_num(r, nan=1e18, posinf=1e18)
        v, _, loc, _ = cv2.minMaxLoc(r)
        v = float(v / M.sum() / 3)
        if v >= 1500:
            # Lost near the last place: search the whole frame
            r = np.nan_to_num(cv2.matchTemplate(f, T, cv2.TM_SQDIFF, mask=Mc), nan=1e18, posinf=1e18)
            v, _, loc, _ = cv2.minMaxLoc(r)
            v = float(v / M.sum() / 3); x0 = y0 = 0
        errs.append(v)
        if v < 1500:
            px, py = x0 + loc[0] + 2, y0 + loc[1] + 2
            rows[k].update({"kind": "drag", "x": float(px), "y": float(py), "err": round(v, 1)})
    p.wait()
    print("gap %.2f-%.2f filled" % (a / 60, b / 60), sum(1 for k in range(a, b) if rows[k]["kind"] == "drag"), "of", b - a, "err min/median", round(min(errs or [0])), round(float(np.median(errs or [0]))))
json.dump(rows, open(path, "w"))
