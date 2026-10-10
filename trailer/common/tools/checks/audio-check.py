#!/usr/bin/env python3
"""Checks a soundtrack for the faults heard as crackle, sizzle, clicks or a
lopsided or hollow stereo image: python3 -I audio-check.py <audio or video> [reference.wav]

Decodes the file with ffmpeg (48 kHz, stereo, 32-bit float) and reports:
- peak and true peak (4 times oversampled), and samples at full scale;
- DC offset of each channel;
- clicks: single-sample jumps far larger than the signal around them,
  standing alone (a sound that starts sharply is not counted);
- sizzle: windows where the energy above 9 kHz rises far above the
  soundtrack's usual share;
- stereo: left-right balance, and how much level is lost when the two
  channels are summed to mono (a phone speaker), per second;
- with a reference (the soundtrack before encoding): the encoder's error,
  overall and above 9 kHz, per second.
Times are in seconds. Needs NumPy and ffmpeg on the PATH."""
import sys, subprocess
import numpy as np
R = 48000
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "2", "-ar", str(R), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
db = lambda v: 20 * np.log10(max(v, 1e-12))
rms = lambda a: float(np.sqrt(np.mean(a ** 2))) if a.size else 0.0
def band(a, lo):
    X = np.fft.rfft(a, axis=0); f = np.fft.rfftfreq(a.shape[0], 1 / R); X[f < lo] = 0
    return np.fft.irfft(X, a.shape[0], axis=0)
x = load(sys.argv[1]); n = x.shape[0]; L, Rt = x[:, 0], x[:, 1]
problems = []
print("%s: %.2f s" % (sys.argv[1], n / R))
# Peaks
peak = float(np.abs(x).max())
up = np.fft.irfft(np.fft.rfft(x, axis=0), 4 * n, axis=0) * 4
tp = float(np.abs(up).max())
full = int((np.abs(x) >= 0.999).sum())
print("peak %.1f dBFS, true peak %.1f dBTP, samples at full scale %d" % (db(peak), db(tp), full))
if full: problems.append("%d samples at full scale (clipping)" % full)
if tp > 10 ** (-1 / 20): problems.append("true peak above -1 dBTP (%.1f)" % db(tp))
# DC
dc = x.mean(axis=0)
print("DC offset L %.5f R %.5f" % tuple(dc))
if np.abs(dc).max() > 0.002: problems.append("DC offset")
# Clicks: the second difference against its local level
clicks = []
for c, name in ((L, "L"), (Rt, "R")):
    d2 = np.abs(np.diff(c, 2))
    win = 480
    k = d2[: len(d2) // win * win].reshape(-1, win)
    med = np.median(k, axis=1) + 1e-7
    for i in np.nonzero(k.max(axis=1) > 40 * med)[0]:
        j = i * win + int(k[i].argmax())
        # A fault is one jump standing alone; a sound that starts sharply
        # (a key, a knock) has many large steps together
        near = np.sort(d2[max(0, j - 24):j + 24])[::-1]
        if d2[j] > 0.01 and near[3] < d2[j] / 6: clicks.append((j / R, name, float(d2[j])))
clicks.sort()
print("clicks %d" % len(clicks) + ("".join(" %.3f(%s)" % (t, ch) for t, ch, v in clicks[:30])))
if clicks: problems.append("%d clicks" % len(clicks))
# Sizzle: share of energy above 9 kHz, per 100 ms
hf = band(x, 9000)
w = R // 10; m = n // w
tot = np.array([rms(x[i * w:(i + 1) * w]) for i in range(m)]); hi = np.array([rms(hf[i * w:(i + 1) * w]) for i in range(m)])
share = np.array([db(h) - db(t) if t > 1e-5 else -99 for h, t in zip(hi, tot)])
base = np.median(share[share > -98])
siz = [(i / 10, share[i]) for i in range(m) if share[i] > base + 15 and db(hi[i]) > -60]
print("high band share: median %.1f dB; windows more than 15 dB above it: %d%s" % (base, len(siz), "".join(" %.1f" % t for t, s in siz[:30])))
if siz: problems.append("%d sizzling windows" % len(siz))
# Stereo, per second
print("second: balance L-R dB, mono loss dB")
bad = []
for s in range(int(n / R)):
    a = x[s * R:(s + 1) * R]
    if rms(a) < 1e-4: continue
    bal = db(rms(a[:, 0])) - db(rms(a[:, 1]))
    loss = db(rms(a.mean(axis=1))) - db(np.sqrt((rms(a[:, 0]) ** 2 + rms(a[:, 1]) ** 2) / 2))
    print("  %2d: %+5.1f %+5.1f" % (s, bal, loss), end="\n" if s % 6 == 5 else "")
    if abs(bal) > 3 or loss < -3: bad.append(s)
print()
if bad: problems.append("stereo: lopsided or hollow in mono at %s s" % bad)
# The encoder's error against the reference
if len(sys.argv) > 2:
    ref = load(sys.argv[2])[:n]; y = x[: ref.shape[0]]
    lag = int(np.argmax(np.correlate(y[:R * 4, 0], ref[:R * 4, 0][:R * 2], "valid")))
    y = y[lag: lag + ref.shape[0]]; ref = ref[: y.shape[0]]
    err = y - ref; ehf = band(err, 9000)
    print("encoder: offset %d samples, error %.1f dB under the signal" % (lag, db(rms(ref)) - db(rms(err))))
    worst = sorted(((db(rms(ehf[s * R:(s + 1) * R])) - db(rms(ref[s * R:(s + 1) * R])), s) for s in range(int(ref.shape[0] / R)) if rms(ref[s * R:(s + 1) * R]) > 1e-4), reverse=True)[:5]
    print("encoder error above 9 kHz, against the signal, worst seconds:" + "".join(" %d (%.1f dB)" % (s, e) for e, s in worst))
    if worst and worst[0][0] > -30: problems.append("audible encoder error above 9 kHz at %d s" % worst[0][1])
print("PROBLEMS: " + ("; ".join(problems) if problems else "none"))
