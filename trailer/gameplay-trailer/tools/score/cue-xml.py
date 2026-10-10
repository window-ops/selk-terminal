#!/usr/bin/env python3
"""Prints the written cue (audio/cue.js) as MusicXML, the game's own sounds
on a staff of their own, and checks the written notes for collisions:
python3 -I cue-xml.py <cue.js> <out.musicxml>

The check lists, across instruments and the game: attacks 10 to 60 ms
apart, heard as one smeared or doubled sound (a flam), and the same pitch
struck on two of them within 60 ms, in unison or an octave apart (a
doubling). The pad, which holds the chords, is left out of both. It also
checks each part's leaps from note to note: more than an octave, a
seventh or a tritone is not allowed and a sixth is flagged; in the melody
a leap of a fifth or more must turn back by a step or a third."""
import sys, json, math, bisect
src, out = sys.argv[1], sys.argv[2]
text = open(src).read()
cue = json.loads(text[text.index("window.CUE =") + len("window.CUE ="):].strip().rstrip(";"))
# The clock: a monotone cubic through [time, beat], as audio/score.js
t = [a for a, b in cue["clock"]]; bb = [b for a, b in cue["clock"]]; n = len(bb)
d = [(t[i + 1] - t[i]) / (bb[i + 1] - bb[i]) for i in range(n - 1)]
m = [d[0]] + [0 if d[i - 1] * d[i] <= 0 else 2 / (1 / d[i - 1] + 1 / d[i]) for i in range(1, n - 1)] + [d[-1]]
def T(x):
    if x > bb[-1]: return t[-1] + (x - bb[-1]) * m[-1]
    i = 0
    while i < n - 2 and x > bb[i + 1]: i += 1
    h = bb[i + 1] - bb[i]; u = (x - bb[i]) / h
    return (2*u**3 - 3*u**2 + 1) * t[i] + (u**3 - 2*u**2 + u) * h * m[i] + (-2*u**3 + 3*u**2) * t[i + 1] + (u**3 - u**2) * h * m[i + 1]
def beat(time):
    lo, hi = -8.0, 80.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if T(mid) < time: lo = mid
        else: hi = mid
    return (lo + hi) / 2
q = lambda x: round(x * 4) / 4
# The game's sounds are printed to the 32nd, so a quick figure such as the
# chime's three notes shows as one note after another
q32 = lambda x: round(x * 8) / 8
PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
def midi(s): return 12 * (int(s[-1]) + 1) + PC[s[0]] + (1 if s[1] == "s" else 0)
NBARS = cue["bars"]; END = NBARS * 4; STOPB = beat(cue["stop"])
# Attacks for the check: (time, source, pitch class or None, label)
att = []
for part, notes in cue["parts"].items():
    if part == "Pad": continue
    for b, ns, L, mo in notes:
        for x in ns.split():
            att.append((T(b), part, midi(x) if x[-1].isdigit() else None, "%s %s (beat %g)" % (part, x, b)))
for tm, snd, p in cue["game"]:
    att.append((tm, "Game", midi(p) if p else None, "game %s%s (%.3f s)" % (snd, " " + p if p else "", tm)))
att.sort()
flams, doubles = [], []
for i, a in enumerate(att):
    for b2 in att[i + 1:]:
        dt = b2[0] - a[0]
        if dt > 0.06: break
        if a[1] == b2[1]: continue
        if 0.010 <= dt: flams.append("%.3f s: %s / %s, %d ms apart" % (a[0], a[3], b2[3], dt * 1000))
        if a[2] is not None and b2[2] is not None and abs(a[2] - b2[2]) in (0, 12): doubles.append("%.3f s: %s / %s" % (a[0], a[3], b2[3]))
# Leaps, part by part, from one note to the next (the top note of a chord).
# For every part more than an octave, a seventh or a tritone is out, and a
# sixth is flagged. In the melody a leap of a fifth or more must turn back
# by a step or a third; a rest of half a beat or more ends the phrase
leaps = []
for part, notes in cue["parts"].items():
    if part in ("Pad", "Drums"): continue
    seq = [(b, b + L, max(midi(x) for x in ns.split())) for b, ns, L, mo in sorted(notes)]
    for i in range(1, len(seq)):
        (b0, e0, m0), (b1, e1, m1) = seq[i - 1], seq[i]
        if part == "Melody" and b1 - e0 >= 0.5: continue
        iv = abs(m1 - m0)
        if iv > 12 or iv in (6, 10, 11): leaps.append("%s beat %g to %g: %d semitones, not allowed" % (part, b0, b1, iv))
        elif iv in (8, 9): leaps.append("%s beat %g to %g: a sixth (%d semitones)" % (part, b0, b1, iv))
        if part == "Melody" and iv >= 7 and i + 1 < len(seq) and seq[i + 1][0] - e1 < 0.5:
            nx = seq[i + 1][2] - m1
            if not (0 < abs(nx) <= 4 and (nx > 0) != (m1 > m0)):
                leaps.append("%s beat %g: leap of %d not turned back by a step or a third" % (part, b1, iv))
print("leaps: %d" % len(leaps)); [print("  " + f) for f in leaps]
print("flams (10 to 60 ms apart): %d" % len(flams)); [print("  " + f) for f in flams]
print("doublings (unison or octave within 60 ms): %d" % len(doubles)); [print("  " + f) for f in doubles]
# Parts for the sheet: the written parts, then the game's sounds
NAMES = ["C", "C", "D", "D", "E", "F", "F", "G", "G", "A", "A", "B"]; ALT = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
def pitch(mm): return "<pitch><step>%s</step>%s<octave>%d</octave></pitch>" % (NAMES[mm % 12], "<alter>1</alter>" if ALT[mm % 12] else "", mm // 12 - 1)
staves = {}
for part, notes in cue["parts"].items():
    staves[part] = [[b, L, ns.split(), mo] for b, ns, L, mo in notes]
game = []
blips = [g for g in cue["game"] if g[1] == "blip"]
for tm, snd, p in cue["game"]:
    if snd == "blip" and tm != blips[0][0]: continue
    label = "blips x%d" % len(blips) if snd == "blip" else snd
    game.append([q32(beat(tm)), 0.125, [p if p else "x"], label])
staves["Game"] = game
CLEF = {"Melody": ("G", 2, 0), "Guitar": ("G", 2, 0), "Pad": ("G", 2, -1), "Bass": ("F", 4, 0), "Drums": ("percussion", 0, 0), "Game": ("G", 2, 0)}
TYPES = {4: "whole", 3: "half", 2: "half", 1.5: "quarter", 1: "quarter", 0.75: "eighth", 0.5: "eighth", 0.375: "16th", 0.25: "16th", 0.125: "32nd"}
def pieces(L):
    out = []
    for v in (4, 3, 2, 1.5, 1, 0.75, 0.5, 0.375, 0.25, 0.125):
        while L >= v - 1e-9: out.append(v); L -= v
    return out
def chords(notes):
    by = {}
    for b, L, ps, mo in notes:
        if b < 0 or b >= END: continue
        qq = q32 if L < 0.25 else q
        c = by.setdefault(qq(b), [qq(b), 0, [], []]); c[1] = max(c[1], L); c[2] += [x for x in ps if x not in c[2]]
        if mo and mo not in c[3]: c[3].append(mo)
    ch = sorted(by.values())
    for i, c in enumerate(ch):
        nxt = ch[i + 1][0] if i + 1 < len(ch) else END
        c[1] = max(0.125, min(q32(c[1]) or 0.125, nxt - c[0], END - c[0]))
    return ch
def note_xml(L, ps, ts, tp, staff, lyric):
    xs = []
    for i, p in enumerate(ps):
        x = "<note>" + ("<chord/>" if i else "")
        if p is None: x += "<rest/>"
        elif staff == "Drums": x += "<unpitched><display-step>%s</display-step><display-octave>%d</display-octave></unpitched>" % (("F", 4) if p == "kick" else ("C", 5))
        elif p == "x": x += "<unpitched><display-step>A</display-step><display-octave>5</display-octave></unpitched>"
        else: x += pitch(midi(p))
        x += "<duration>%d</duration>" % round(L * 8)
        if p is not None and tp: x += '<tie type="stop"/>'
        if p is not None and ts: x += '<tie type="start"/>'
        x += "<type>%s</type>%s" % (TYPES[L], "<dot/>" if L in (3, 1.5, 0.75, 0.375) else "")
        if p in ("brush", "x"): x += "<notehead>x</notehead>"
        nots = ('<tied type="stop"/>' if tp else "") + ('<tied type="start"/>' if ts else "")
        if nots and p is not None: x += "<notations>%s</notations>" % nots
        if lyric and i == 0 and p is not None: x += '<lyric><text>%s</text></lyric>' % lyric
        xs.append(x + "</note>")
    return "".join(xs)
def bpm(b): return round(60 / (T(b + 1) - T(b)))
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<score-partwise version="3.1"><work><work-title>Selk gameplay trailer: the cue</work-title></work><part-list>']
for i, name in enumerate(staves): xml.append('<score-part id="P%d"><part-name>%s</part-name></score-part>' % (i + 1, name))
xml.append("</part-list>")
for pi, (name, notes) in enumerate(staves.items()):
    ch = chords(notes)
    xml.append('<part id="P%d">' % (pi + 1))
    for bar in range(NBARS):
        a, z = bar * 4, bar * 4 + 4
        xml.append('<measure number="%d">' % (bar + 1))
        if bar and bar % 4 == 0 and pi == 0: xml.append('<print new-page="yes"/>' if bar % 8 == 0 else '<print new-system="yes"/>')
        if bar == 0:
            sign, line, octv = CLEF[name]
            clef = "<clef><sign>%s</sign>%s%s</clef>" % (sign, "<line>%d</line>" % line if line else "", "<clef-octave-change>%d</clef-octave-change>" % octv if octv else "")
            key = "" if name in ("Drums",) else "<key><fifths>1</fifths><mode>minor</mode></key>"
            xml.append("<attributes><divisions>8</divisions>%s<time><beats>4</beats><beat-type>4</beat-type></time>%s</attributes>" % (key, clef))
        if pi == 0:
            if bar == 0 or bpm(a) != bpm(a - 4):
                xml.append('<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>%d</per-minute></metronome></direction-type><sound tempo="%d"/></direction>' % (bpm(a), bpm(a)))
            xml.append('<direction placement="above"><direction-type><words font-size="9" font-weight="bold">%s</words></direction-type></direction>' % cue["chords"][bar])
        # Each bar's dynamic, under the melody where it changes
        dyn = cue.get("dynamics")
        if dyn and pi == 0 and (bar == 0 or dyn[bar] != dyn[bar - 1]):
            xml.append('<direction placement="below"><direction-type><dynamics><%s/></dynamics></direction-type></direction>' % dyn[bar])
        segs, cur = [], a
        for c in ch:
            s0, s1 = max(c[0], a), min(c[0] + c[1], z)
            if s1 <= a or s0 >= z: continue
            if s0 > cur: segs.append([cur, s0, [None], False, False, ""])
            segs.append([s0, s1, c[2], c[0] + c[1] > z, c[0] < a, " / ".join(c[3]) if c[0] >= a else ""])
            cur = s1
        if cur < z: segs.append([cur, z, [None], False, False, ""])
        for s0, s1, ps, ts, tp, mo in segs:
            if name == "Melody" and mo: xml.append('<direction placement="above"><direction-type><words font-size="8">%s</words></direction-type></direction>' % mo)
            if name == "Melody" and s0 <= STOPB < s1:
                xml.append('<direction placement="above"><direction-type><words font-size="8">stop</words></direction-type><offset>%d</offset></direction>' % round((q(STOPB) - s0) * 8))
            ls = pieces(s1 - s0)
            for k, L in enumerate(ls):
                xml.append(note_xml(L, ps, ts or k < len(ls) - 1, tp or k > 0, name, mo if (name == "Game" and k == 0) else ""))
        xml.append("</measure>")
    xml.append("</part>")
xml.append("</score-partwise>")
open(out, "w").write("\n".join(xml))
print("wrote", out)
