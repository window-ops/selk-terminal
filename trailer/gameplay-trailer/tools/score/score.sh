#!/bin/sh
# Writes the gameplay trailer's score as notation, from trailer/:
#   sh gameplay-trailer/tools/score/score.sh [out folder]
# The notes the score plays are recorded (score-events.js), written as
# MusicXML (score-xml.py), engraved with Verovio (engrave.py) and printed to
# a PDF (print.js). The out folder is out/score by default.
set -e
DIR=$(dirname "$0"); COMMON=common/tools/score; OUT=${1:-out/score}
mkdir -p "$OUT"
node "$DIR/score-events.js" . "$OUT/events.json"
python3 -I "$DIR/score-xml.py" "$OUT/events.json" "$OUT/selk-gameplay-score.musicxml"
rm -f "$OUT"/page-*.svg
python3 "$COMMON/engrave.py" "$OUT/selk-gameplay-score.musicxml" "$OUT"
node "$COMMON/print.js" "$OUT" "$OUT/selk-gameplay-score.pdf"
rm -f "$OUT/events.json" "$OUT"/page-*.svg
