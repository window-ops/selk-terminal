#!/usr/bin/env python3
"""Cursor tracker for the ShareX recordings.

Usage: python3 -I track.py <cursors.css> <recording.mp4> <out.json>

The recordings are 3840x2160 at 200 % scaling: the game's medium cursors
(a 16-unit grid) appear at 4 physical px per unit, measured on G1. ffmpeg
decodes each frame straight to page size (1920x1080, 2 px per unit). Every
cursor shape is searched by masked template matching near the last place,
on a frame reduced by 2 (1 px per unit), over the whole frame only when
nothing near matches, then refined at page size. Output: one row per frame
with time, cursor kind, hot spot in page pixels and the match error.
"""
import sys, re, json, subprocess, urllib.parse
import numpy as np
import cv2

css, video, out = sys.argv[1:4]
# Frames are decoded straight to page size (1920x1080), so the cursor is
# 2 px per unit; the search runs on a frame reduced by 2 (1 px per unit)
W, H = 1920, 1080

def shapes():
    text = open(css).read()
    block = text[text.index(":root, body.cur-m {"):]
    block = block[:block.index("}")]
    res = {}
    for m in re.finditer(r'--cur-([a-z]+):\s*url\("(.*?)"\)\s*(\d+)\s+(\d+)', block):
        kind, url, hx, hy = m.group(1), m.group(2), int(m.group(3)), int(m.group(4))
        svg = urllib.parse.unquote(url.split(",", 1)[1])
        rects = re.findall(r"<rect x='(\d+)' y='(\d+)' width='(\d+)' height='(\d+)' fill='(#[0-9A-Fa-f]{6})'", svg)
        if not rects:
            continue
        img = np.zeros((16, 16, 3), np.uint8); mask = np.zeros((16, 16), np.uint8)
        for x, y, w, h, fill in rects:
            x, y, w, h = int(x), int(y), int(w), int(h)
            c = tuple(int(fill[i:i + 2], 16) for i in (1, 3, 5))
            img[y:y + h, x:x + w] = c[::-1]; mask[y:y + h, x:x + w] = 255
        ys, xs = np.nonzero(mask)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        res[kind] = {"img": img[y0:y1, x0:x1], "mask": mask[y0:y1, x0:x1], "ox": x0, "oy": y0, "hx": hx, "hy": hy}
    return res

S = shapes()
for k in S:
    s = S[k]
    # Score per masked pixel, so shapes of different sizes compare
    s["n"] = float((s["mask"] > 0).sum())
    # The shape at recording size (4 px per unit), then at page size in its
    # four half-pixel phases: the recorded cursor may sit on any physical
    # pixel, which blurs thin strokes once the frame is halved
    t4 = cv2.resize(s["img"], None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST).astype(np.float32)
    m4 = cv2.resize(s["mask"], None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST).astype(np.float32) / 255
    s["phases"] = []
    for dy in (0, 1):
        for dx in (0, 1):
            T = np.zeros((t4.shape[0] + 2, t4.shape[1] + 2, 3), np.float32); M = np.zeros(T.shape[:2], np.float32)
            T[dy:dy + t4.shape[0], dx:dx + t4.shape[1]] = t4 * m4[..., None]; M[dy:dy + t4.shape[0], dx:dx + t4.shape[1]] = m4
            Th = cv2.resize(T, (T.shape[1] // 2, T.shape[0] // 2), interpolation=cv2.INTER_AREA)
            Mh = cv2.resize(M, (M.shape[1] // 2, M.shape[0] // 2), interpolation=cv2.INTER_AREA)
            Th = Th / np.maximum(Mh[..., None], 1e-6)
            Mh = (Mh > 0.99).astype(np.float32)
            s["phases"].append((dx, dy, Th, np.dstack([Mh] * 3), float(Mh.sum())))

def match(frame_small, s, region=None):
    hay = frame_small if region is None else frame_small[region[1]:region[3], region[0]:region[2]]
    if hay.shape[0] < s["img"].shape[0] or hay.shape[1] < s["img"].shape[1]:
        return None
    r = cv2.matchTemplate(hay, s["img"], cv2.TM_SQDIFF, mask=s["mask"])
    r = np.nan_to_num(r, nan=1e18, posinf=1e18)
    v, _, loc, _ = cv2.minMaxLoc(r)
    x, y = loc
    if region is not None:
        x += region[0]; y += region[1]
    return v / s["n"], x, y

proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", video, "-vf", "scale=%d:%d:flags=area" % (W, H), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
rows, prev, last, n = [], None, None, 0
while True:
    buf = proc.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    full = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    # A still cursor over a still screen: keep the last row
    if prev is not None and last is not None:
        px, py = prev[0] * 2, prev[1] * 2
        a = full[max(0, py - 40):py + 72, max(0, px - 40):px + 72]
        b = last[max(0, py - 40):py + 72, max(0, px - 40):px + 72]
        if a.size and int(cv2.absdiff(a, b).max()) < 12:
            row = dict(rows[-1]); row["f"] = n; row["t"] = round(n / 60, 4)
            rows.append(row); last = full; n += 1
            if n % 300 == 0:
                print("frame", n, flush=True)
            continue
    if prev is None and last is not None and rows and rows[-1]["kind"] is None:
        if int(cv2.absdiff(full[::4, ::4], last[::4, ::4]).max()) < 12:
            row = dict(rows[-1]); row["f"] = n; row["t"] = round(n / 60, 4)
            rows.append(row); last = full; n += 1
            continue
    last = full
    small = cv2.resize(full, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    best = None
    # Near the last position first; the whole frame only when nothing near
    # matches. Off-grid positions blur the reduced frame, so the near test
    # is loose and the full-size refinement below sets the exact place.
    if prev is not None:
        px, py = prev
        region = (max(0, px - 40), max(0, py - 40), min(W // 2, px + 56), min(H // 2, py + 56))
        for k, s in S.items():
            m = match(small, s, region)
            if m and (best is None or m[0] < best[1]):
                best = (k, m[0], m[1], m[2])
    if best is None or best[1] > 7000:
        for k, s in S.items():
            m = match(small, s)
            if m and (best is None or m[0] < best[1]):
                best = (k, m[0], m[1], m[2])
    k, err, sx, sy = best
    # Refine at page size: every shape, every phase, within 6 px of the coarse
    # place; the shape is chosen here, where thin strokes are sharp
    X0, Y0 = max(0, sx * 2 - 6), max(0, sy * 2 - 6)
    fullf = full[Y0:Y0 + 50, X0:X0 + 50].astype(np.float32)
    fine = None
    for kk, ss in S.items():
        for dx, dy, Th, Mh, cnt in ss["phases"]:
            if fullf.shape[0] < Th.shape[0] or fullf.shape[1] < Th.shape[1]:
                continue
            r = cv2.matchTemplate(fullf, Th, cv2.TM_SQDIFF, mask=Mh)
            r = np.nan_to_num(r, nan=1e18, posinf=1e18)
            v, _, loc, _ = cv2.minMaxLoc(r)
            v = v / cnt / 3
            if fine is None or v < fine[0]:
                fine = (v, kk, X0 + loc[0], Y0 + loc[1], dx, dy)
    v, k, X, Y, dx, dy = fine
    s = S[k]
    if v > 400:
        # Hidden (Windows hides the pointer while typing) or lost
        rows.append({"f": n, "t": round(n / 60, 4), "kind": None, "x": None, "y": None, "err": round(v, 1)})
        prev = None
    else:
        # Top left of the 16-unit grid in page px (phase in half pixels),
        # then the hot spot: the 24 CSS px image is drawn 32 page px wide,
        # so a CSS hot spot unit is 32 / 24 page px
        gx, gy = X - dx / 2 - s["ox"] * 2, Y - dy / 2 - s["oy"] * 2
        hx, hy = gx + s["hx"] * 32 / 24, gy + s["hy"] * 32 / 24
        rows.append({"f": n, "t": round(n / 60, 4), "kind": k, "x": round(hx, 1), "y": round(hy, 1), "err": round(v, 1)})
        prev = (int(round(X / 2)), int(round(Y / 2)))
    n += 1
    if n % 300 == 0:
        print("frame", n, flush=True)
json.dump(rows, open(out, "w"))
print("frames", n)
