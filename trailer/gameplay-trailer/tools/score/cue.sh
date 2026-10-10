#!/bin/sh
# Prints the written cue (gameplay-trailer/audio/cue.js) as sheet music and
# checks it for collisions, from trailer/:
#   sh gameplay-trailer/tools/score/cue.sh [out folder]
# The check's findings are printed first; the sheet music, with the game's
# own sounds on their staff, goes to selk-gameplay-cue.musicxml and .pdf in
# the out folder, out/score by default.
set -e
DIR=$(dirname "$0"); COMMON=common/tools/score; OUT=${1:-out/score}
mkdir -p "$OUT"
python3 -I "$DIR/cue-xml.py" gameplay-trailer/audio/cue.js "$OUT/selk-gameplay-cue.musicxml"
rm -f "$OUT"/page-*.svg
python3 "$COMMON/engrave.py" "$OUT/selk-gameplay-cue.musicxml" "$OUT"
node "$COMMON/print.js" "$OUT" "$OUT/selk-gameplay-cue.pdf"
rm -f "$OUT"/page-*.svg
