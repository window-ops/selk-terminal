#!/usr/bin/env python3
"""Writes the feature score as MusicXML from the recorded notes:
python3 -I score-xml.py <events.json> <out.musicxml>

The score has no written clock, so this one lays bars of 4/4 over it.
Times are the score's written times (score.js schedules every time from
5 s on 0.5 s earlier), mapped to beats and rounded to sixteenths:
- 1 to 29 s, beats 0 to 28: 60 BPM, the boot the first bar;
- 29 to 32.75 s, beats 28 to 32: the E bar before the timelapse, about
  64 BPM;
- 32.75 to 52.75 s, from beat 32: the timelapse, rising from 60 to 70 BPM
  as score.js counts its beats;
- 52.75 to 63.75 s, to beat 66: the alarm tone at 60 BPM, an alarm a beat;
- 63.75 to 77.75 s, beats 66 to 68: WATCH and MAST-01, about 14 s without
  score, written as two beats;
- from 77.75 s, beat 68: the title at 60 BPM."""
import sys, json, math, bisect
ev = json.load(open(sys.argv[1])); out = sys.argv[2]
T0, END_TL = 32.75, 52.75
def beat(w):
    if w < 29: return w - 1
    if w < T0: return 28 + (w - 29) * 4 / 3.75
    if w <= END_TL: return 32 + 60 * ((1 + (w - T0) / 120) ** 2 - 1)
    if w < 63.75: return 56 + (w - 53.75)
    if w < 77.75: return 66 + (w - 63.75) * 2 / 14
    return 68 + (w - 77.75)
def time(b):
    lo, hi = 0.0, 100.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if beat(mid) < b: lo = mid
        else: hi = mid
    return lo
q = lambda b: round(b * 4) / 4
NBARS = 20
END = NBARS * 4
midi = lambda f: int(round(69 + 12 * math.log2(f / 440)))
NAMES = [("C", 0), ("C", 1), ("D", 0), ("D", 1), ("E", 0), ("F", 0), ("F", 1), ("G", 0), ("G", 1), ("A", 0), ("A", 1), ("B", 0)]
def pitch(m):
    st, al = NAMES[m % 12]
    return "<pitch><step>%s</step>%s<octave>%d</octave></pitch>" % (st, "<alter>1</alter>" if al else "", m // 12 - 1)
# Notes per part: [onset beat, length in beats, [midi...]] or unpitched (kind)
parts = {"Bells": [], "Plucks": [], "Pad": [], "Bass": [], "Drone": [], "Drums": []}
CHORDS = {}
for e in ev["log"]:
    kind, fs, t, dur = e[0], e[1], e[2], e[3]
    b0 = q(beat(t))
    if b0 < 0 or b0 >= END: continue
    L = max(0.5, round((beat(t + dur) - beat(t)) * 2) / 2)
    if kind == "bell": parts["Bells"].append([b0, 1, [midi(f) for f in fs]])
    elif kind == "pluck": parts["Plucks"].append([b0, 0.5, [midi(f) for f in fs]])
    elif kind == "pad":
        parts["Pad"].append([b0, L, [midi(f) for f in fs]]); CHORDS[b0] = e[5]
    elif kind == "bass": parts["Bass"].append([b0, L, [midi(f) for f in fs]])
    elif kind == "drone": parts["Drone"].append([b0, L, [midi(f) for f in fs]])
    elif kind == "kick": parts["Drums"].append([b0, 1, ["kick"]])
# Moments on screen, in written seconds, above the bells; the chord names
# go above the pad
SCREEN = [(1.0, "boot"), (5, "Haas"), (8.5, "Winogradsky"), (12, "FILES"), (17, "Tsiolkovsky"), (19.25, "Oberth"), (21.5, "Sputnik"),
          (23.75, "Gagarin"), (26, "Remek, Hermaszewski"), (28.25, "Prunariu"), (30.5, "Movile"), (32.75, "Athens"), (34.75, "Kraków"),
          (36.75, "Ax-4"), (41.75, "Bucharest"), (43.75, "Brno"), (45.75, "Debrecen"), (48.75, "Selk"), (52.75, "ALARM: the score stops"),
          (53.75, "alarm tone"), (63.75, "WATCH, MAST-01: about 14 s without score"), (77.75, "title"), (87.6, "POWER ON")]
MARKS = {}
for t, text in SCREEN:
    b = q(beat(t))
    if 0 <= b < END: MARKS[b] = MARKS[b] + ", " + text if b in MARKS else text
def merge(notes):
    """Chords: notes on one onset joined; each lasts until the next onset at most"""
    by = {}
    for b0, L, ps in notes:
        c = by.setdefault(b0, [b0, 0, []]); c[1] = max(c[1], L); c[2] += [p for p in ps if p not in c[2]]
    ch = sorted(by.values())
    for i, c in enumerate(ch):
        nxt = ch[i + 1][0] if i + 1 < len(ch) else END
        c[1] = min(c[1], nxt - c[0], END - c[0])
    return ch
TYPES = {4: "whole", 3: "half", 2: "half", 1.5: "quarter", 1: "quarter", 0.75: "eighth", 0.5: "eighth", 0.25: "16th"}
def pieces(L):
    """A length in beats as tied notated values"""
    out = []
    for v in (4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25):
        while L >= v - 1e-9: out.append(v); L -= v
    return out
def note_xml(L, ps, tie_start, tie_stop, drum=False):
    xs = []
    for i, p in enumerate(ps):
        x = "<note>" + ("<chord/>" if i else "")
        if p is None: x += "<rest/>"
        elif drum: x += "<unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched>"
        else: x += pitch(p)
        x += "<duration>%d</duration>" % round(L * 4)
        if tie_stop and p is not None: x += '<tie type="stop"/>'
        if tie_start and p is not None: x += '<tie type="start"/>'
        x += "<type>%s</type>%s" % (TYPES[L], "<dot/>" if L in (3, 1.5, 0.75) else "")
        nots = ("<tied type=\"stop\"/>" if tie_stop else "") + ("<tied type=\"start\"/>" if tie_start else "")
        if nots and p is not None: x += "<notations>%s</notations>" % nots
        xs.append(x + "</note>")
    return "".join(xs)
def bpm(b):
    return round(60 / (time(b + 1) - time(b)))
CLEF = {"Bells": "<clef><sign>G</sign><line>2</line></clef>", "Plucks": "<clef><sign>G</sign><line>2</line></clef>",
        "Pad": "<clef><sign>G</sign><line>2</line><clef-octave-change>-1</clef-octave-change></clef>",
        "Bass": "<clef><sign>F</sign><line>4</line></clef>", "Drone": "<clef><sign>F</sign><line>4</line></clef>", "Drums": "<clef><sign>percussion</sign></clef>"}
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<score-partwise version="3.1"><work><work-title>Selk feature trailer: the score</work-title></work>',
       '<identification><encoding><software>trailer score-xml.py</software></encoding></identification><part-list>']
for i, name in enumerate(parts): xml.append('<score-part id="P%d"><part-name>%s</part-name></score-part>' % (i + 1, name))
xml.append("</part-list>")
for pi, (name, notes) in enumerate(parts.items()):
    ch = merge(notes); drum = name == "Drums"
    # The moments on the bells, the chord names on the pad
    marks = MARKS if pi == 0 else {}
    chords = CHORDS if name == "Pad" else {}
    xml.append('<part id="P%d">' % (pi + 1))
    for bar in range(NBARS):
        a, z = bar * 4, bar * 4 + 4
        xml.append('<measure number="%d">' % (bar + 1))
        # Four bars a line, two lines a page
        if bar and bar % 4 == 0 and pi == 0: xml.append('<print new-page="yes"/>' if bar % 8 == 0 else '<print new-system="yes"/>')
        if bar == 0:
            key = "" if drum else "<key><fifths>0</fifths><mode>minor</mode></key>"
            xml.append("<attributes><divisions>4</divisions>%s<time><beats>4</beats><beat-type>4</beat-type></time>%s</attributes>" % (key, CLEF[name]))
        if pi == 0 and (bar == 0 or bpm(a) != bpm(a - 4)):
            xml.append('<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>%d</per-minute></metronome></direction-type><sound tempo="%d"/></direction>' % (bpm(a), bpm(a)))
        segs = []
        cur = a
        for c in ch:
            s0, s1 = max(c[0], a), min(c[0] + c[1], z)
            if s1 <= a or s0 >= z: continue
            if s0 > cur: segs.append([cur, s0, [None], False, False])
            segs.append([s0, s1, c[2], c[0] + c[1] > z, c[0] < a])
            cur = s1
        if cur < z: segs.append([cur, z, [None], False, False])
        # Each chord name and mark is written before the note or rest it
        # falls in, moved on to its place within it (offset, in sixteenths)
        for s0, s1, ps, ts, tp in segs:
            for m in sorted(m for m in set(marks) | set(chords) if s0 <= m < s1):
                off = "<offset>%d</offset>" % round((m - s0) * 4) if m > s0 else ""
                if m in chords:
                    xml.append('<direction placement="above"><direction-type><words font-size="9" font-weight="bold">%s</words></direction-type>%s</direction>' % (chords[m], off))
                if m in marks:
                    xml.append('<direction placement="above"><direction-type><words font-size="8">%s</words></direction-type>%s</direction>' % (marks[m], off))
            ls = pieces(s1 - s0)
            for k, L in enumerate(ls):
                xml.append(note_xml(L, ps, ts or k < len(ls) - 1, tp or k > 0, drum))
        xml.append("</measure>")
    xml.append("</part>")
xml.append("</score-partwise>")
open(out, "w").write("\n".join(xml))
print("wrote", out, {k: len(v) for k, v in parts.items()})
