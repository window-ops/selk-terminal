"""Frame-to-frame change in a recording, at 480x270, per region.
Usage: python3 -I events.py <video> [threshold]"""
import sys, subprocess, numpy as np
v = sys.argv[1]; th = float(sys.argv[2]) if len(sys.argv) > 2 else 0.4
w, h = 480, 270
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", v, "-vf", "scale=%d:%d:flags=area" % (w, h), "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
prev = None; n = 0
while True:
    b = p.stdout.read(w * h)
    if len(b) < w * h: break
    f = np.frombuffer(b, np.uint8).astype(np.int16)
    f = f.reshape(h, w)
    if prev is not None:
        d = np.abs(f - prev) > 12
        tot = d.mean() * 100
        if tot > th:
            ys, xs = np.nonzero(d)
            print("%6.3f  %5.2f%%  box x %d-%d y %d-%d (page px)" % (n / 60, tot, xs.min() * 4, xs.max() * 4, ys.min() * 4, ys.max() * 4))
    prev = f; n += 1
