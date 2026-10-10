"""Prints a traced path as change points. Usage: python3 -I summary.py <json> [step px]"""
import json, sys
r = json.load(open(sys.argv[1])); step = float(sys.argv[2]) if len(sys.argv) > 2 else 6
errs = [x["err"] for x in r if x["kind"]]
print("frames", len(r), "hidden", sum(1 for x in r if not x["kind"]), "err max", max(errs), "err>100", sum(e > 100 for e in errs))
last = None
for x in r:
    key = (x["kind"], None if x["x"] is None else round(x["x"] / step), None if x["y"] is None else round(x["y"] / step))
    if key != last:
        print("%6.3f %-8s %7s %7s %6.1f" % (x["t"], x["kind"], x["x"], x["y"], x["err"]))
    last = key
