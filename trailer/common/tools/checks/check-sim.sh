#!/bin/sh
# Every name sim.js exports must be defined in it: node parses the file and
# runs it with a stub page, so a missing function fails here
node -e '
const src = require("fs").readFileSync(process.argv[1], "utf8");
global.document = { getElementById: () => ({ style: {} }) }; global.window = {};
new Function("window", "document", src)(global.window, global.document);
console.log("sim.js exports", Object.keys(global.window.SIM).length, "names, all defined");
' "$1"
