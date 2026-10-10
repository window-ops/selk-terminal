#!/usr/bin/env python3
"""Writes the gameplay score as MusicXML from the recorded notes:
python3 -I score-xml.py <events.json> <out.musicxml>
Bars of 4/4 from the score's beat 0 to the stop; times are mapped to
beats with the score's own clock and rounded to sixteenths (lengths to eighths)."""
import sys, json, math, bisect
ev = json.load(open(sys.argv[1])); out = sys.argv[2]
BT = ev["beats"]; bx = [b for b, t in BT]; bt = [t for b, t in BT]
def beat(t):
    i = max(1, min(len(bt) - 1, bisect.bisect_left(bt, t)))
    return bx[i - 1] + (t - bt[i - 1]) / (bt[i] - bt[i - 1]) * (bx[i] - bx[i - 1])
q = lambda b: round(b * 4) / 4
NBARS = int(math.ceil(bx[-1] / 4 - 1e-9))
END = NBARS * 4
midi = lambda f: int(round(69 + 12 * math.log2(f / 440)))
NAMES = [("C", 0), ("C", 1), ("D", 0), ("D", 1), ("E", 0), ("F", 0), ("F", 1), ("G", 0), ("G", 1), ("A", 0), ("A", 1), ("B", 0)]
def pitch(m):
    st, al = NAMES[m % 12]
    return "<pitch><step>%s</step>%s<octave>%d</octave></pitch>" % (st, "<alter>1</alter>" if al else "", m // 12 - 1)
# Notes per part: (onset beat, length in beats, [midi...]) or unpitched (kind)
parts = {"Mallets": [], "Strings": [], "Pad": [], "Bass": [], "Drums": []}
for kind, f, t, dur, v in ev["log"]:
    b0 = q(beat(t))
    if b0 < 0 or b0 >= END: continue
    if kind in ("mallet", "pluck", "bass"):
        L = max(0.5, round((beat(t + dur) - beat(t)) * 2) / 2)
        parts[{"mallet": "Mallets", "pluck": "Strings", "bass": "Bass"}[kind]].append([b0, L, [midi(f)]])
    elif kind in ("kick", "brush"):
        parts["Drums"].append([b0, 1, [kind]])
# The pad as the chord sounding at each change: bars, and B held as Bsus then B7
spans = [(b, b + 4) for b in range(0, END, 4)]
pads = [(beat(t), beat(t + dur - 0.3), midi(f)) for kind, f, t, dur, v in ev["log"] if kind == "pad"]
for a, z in sorted(spans):
    notes = sorted({m for s, e, m in pads if s <= a + 0.05 < e})
    if notes: parts["Pad"].append([a, z - a, notes])
# Moments on screen, written above the mallets
# Moments on screen, in s on the timeline, written above the mallets at
# their sixteenth, and the stop
SCREEN = [(4.617, "MSG 001 chime"), (8.85, "OPEN MSG 001"), (13.4, "OPEN REPORT 1"), (17.4, "SELK grabbed"), (20.083, "SELK dropped"),
          (21.98, "BIO"), (23.78, "LAB"), (26.683, "LAB grabbed"), (29.933, "LAB dropped"), (32.33, "SUBMIT PAGE"),
          (36.054, "Delivered to Earth"), (36.85, "stamp"), (38.617, "MSG 002 chime"), (41.1, "OPEN MSG 002"), (43.3, "REPORT 2"), (44.9, "SUBMIT PAGE"),
          (45.87, "the score stops on the click")]
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
        elif drum: x += "<unpitched><display-step>%s</display-step><display-octave>%d</display-octave></unpitched>" % (("F", 4) if p == "kick" else ("C", 5))
        else: x += pitch(p)
        x += "<duration>%d</duration>" % round(L * 4)
        if tie_stop and p is not None: x += '<tie type="stop"/>'
        if tie_start and p is not None: x += '<tie type="start"/>'
        x += "<type>%s</type>%s" % (TYPES[L], "<dot/>" if L in (3, 1.5, 0.75) else "")
        if drum and p == "brush": x += "<notehead>x</notehead>"
        nots = ("<tied type=\"stop\"/>" if tie_stop else "") + ("<tied type=\"start\"/>" if tie_start else "")
        if nots and p is not None: x += "<notations>%s</notations>" % nots
        xs.append(x + "</note>")
    return "".join(xs)
def bpm(b): 
    i = bisect.bisect_left(bx, b); j = bisect.bisect_left(bx, b + 1)
    return round(60 / (bt[j] - bt[i]))
CLEF = {"Mallets": "<clef><sign>G</sign><line>2</line></clef>", "Strings": "<clef><sign>G</sign><line>2</line></clef>",
        "Pad": "<clef><sign>G</sign><line>2</line><clef-octave-change>-1</clef-octave-change></clef>",
        "Bass": "<clef><sign>F</sign><line>4</line></clef>", "Drums": "<clef><sign>percussion</sign></clef>"}
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<score-partwise version="3.1"><work><work-title>Selk gameplay trailer: the score</work-title></work>',
       '<identification><encoding><software>trailer score-xml.py</software></encoding></identification><part-list>']
for i, name in enumerate(parts): xml.append('<score-part id="P%d"><part-name>%s</part-name></score-part>' % (i + 1, name))
xml.append("</part-list>")
for pi, (name, notes) in enumerate(parts.items()):
    ch = merge(notes); drum = name == "Drums"
    # The marks, on the mallets
    marks = MARKS if name == "Mallets" else {}
    xml.append('<part id="P%d">' % (pi + 1))
    for bar in range(NBARS):
        a, z = bar * 4, bar * 4 + 4
        xml.append('<measure number="%d">' % (bar + 1))
        # Four bars a line, as the phrases go, two lines a page
        if bar and bar % 4 == 0 and pi == 0: xml.append('<print new-page="yes"/>' if bar % 8 == 0 else '<print new-system="yes"/>')
        if bar == 0:
            key = "" if drum else "<key><fifths>1</fifths><mode>minor</mode></key>"
            xml.append("<attributes><divisions>4</divisions>%s<time><beats>4</beats><beat-type>4</beat-type></time>%s</attributes>" % (key, CLEF[name]))
        if pi == 0 and (bar == 0 or bpm(a) != bpm(a - 4)):
            xml.append('<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>%d</per-minute></metronome></direction-type><sound tempo="%d"/></direction>' % (bpm(a), bpm(a)))
        segs = []  # (start, end, pitches, tie flags)
        cur = a
        for c in ch:
            s0, s1 = max(c[0], a), min(c[0] + c[1], z)
            if s1 <= a or s0 >= z: continue
            if s0 > cur: segs.append([cur, s0, [None], False, False])
            segs.append([s0, s1, c[2], c[0] + c[1] > z, c[0] < a])
            cur = s1
        if cur < z: segs.append([cur, z, [None], False, False])
        # Each mark is written before the note or rest it falls in, moved on
        # to its place within it (offset, in sixteenths)
        for s0, s1, ps, ts, tp in segs:
            for m in sorted(m for m in marks if s0 <= m < s1):
                off = "<offset>%d</offset>" % round((m - s0) * 4) if m > s0 else ""
                xml.append('<direction placement="above"><direction-type><words font-size="8">%s</words></direction-type>%s</direction>' % (marks[m], off))
            ls = pieces(s1 - s0)
            for k, L in enumerate(ls):
                xml.append(note_xml(L, ps, ts or k < len(ls) - 1, tp or k > 0, drum))
        xml.append("</measure>")
    xml.append("</part>")
xml.append("</score-partwise>")
open(out, "w").write("\n".join(xml))
print("wrote", out, {k: len(v) for k, v in parts.items()})
