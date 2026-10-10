/* The gameplay trailer's shots in order, as DESIGN.md section 4 sets them.
   Every shot is a simulated game screen: shots/<name>.js, or
   common/shots/<name>.js for the title screen both trailers end on. Each
   shot sets its own length; seconds is the whole length, for the
   soundtrack, and the build checks it against the shots. */
"use strict";
module.exports = {
  width: 2560, height: 1440, fps: 60, seconds: 68.2,
  shots: [
    { screen: "signin" },
    { screen: "msg1" },
    { screen: "read1" },
    { screen: "report1" },
    { screen: "selk" },
    { screen: "lab" },
    { screen: "submit" },
    { screen: "transmit" },
    { screen: "msg2" },
    { screen: "round2" },
    { screen: "rejected" },
    { screen: "archive" },
    { screen: "title" }
  ]
};
