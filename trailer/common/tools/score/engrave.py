#!/usr/bin/env python3
"""Engraves a MusicXML file with Verovio, one SVG per A4 page:
python3 engrave.py <score.musicxml> <out folder>"""
import sys, os, verovio
src, out = sys.argv[1], sys.argv[2]
tk = verovio.toolkit()
tk.setOptions({"pageWidth": 2100, "pageHeight": 2970, "scale": 40, "footer": "none", "header": "auto", "breaks": "encoded", "spacingSystem": 12})
if not tk.loadFile(src): sys.exit("Verovio could not read " + src)
for p in range(1, tk.getPageCount() + 1):
    open(os.path.join(out, "page-%d.svg" % p), "w").write(tk.renderToSVG(p))
print("pages", tk.getPageCount())
