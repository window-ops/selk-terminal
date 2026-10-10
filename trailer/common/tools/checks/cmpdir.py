"""Compares the PNGs of one folder with same-named PNGs of another, with a
tolerance. Usage: python3 -I cmpdir.py <a> <b> [tolerance]"""
import sys, os
import numpy as np
from PIL import Image
a, b = sys.argv[1:3]; tol = int(sys.argv[3]) if len(sys.argv) > 3 else 4
worst = 0; n = 0
for f in sorted(os.listdir(a)):
    x = np.asarray(Image.open(os.path.join(a, f)).convert("RGB"), np.int16)
    y = np.asarray(Image.open(os.path.join(b, f)).convert("RGB"), np.int16)
    worst = max(worst, int(np.abs(x - y).max())); n += 1
print("%s: %d frames, worst difference %d, %s" % (os.path.basename(a.rstrip('/')), n, worst, "ok" if worst <= tol else "CHANGED"))
