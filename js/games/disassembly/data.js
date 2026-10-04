/* DISASSEMBLY.RUN (core.js): the parts of each phone, the tools, their
   names, and what is known about each phone for the score card. */
(function () {
  var S = window.SELK, G = S.disassemblyGame;
  /* The parts of each phone, from the top one down. Each part has the parts
     over it (under), the tools it needs in order, whether the battery has to
     be disconnected first (power), and the minutes it takes to lift out. On
     the Fairphone the battery is disconnected once it is out; on the Galaxy
     once the board cover is off and the battery's connector under it
     unplugged. */
  var PARTS = {
    fairphone: {
      cover: { under: [], needs: [], min: 0.5 },
      battery: { under: ["cover"], needs: [], min: 0.5 },
      top: { under: ["cover"], needs: ["screw"], power: true, min: 0.5 },
      camera: { under: ["cover", "top"], needs: [], power: true, min: 0.5 },
      usb: { under: ["cover"], needs: ["screw"], power: true, min: 0.5 },
      screen: { under: ["cover", "battery"], needs: ["screw"], power: true, min: 1 }
    },
    samsung: {
      cover: { under: [], needs: ["heat", "pry"], min: 1 },
      coil: { under: ["cover"], needs: ["screw"], min: 0.5 },
      flex: { under: ["cover", "coil", "plate", "speaker"], needs: [], power: true, min: 1 },
      plate: { under: ["cover"], needs: ["screw"], min: 0.5 },
      speaker: { under: ["cover"], needs: ["screw"], min: 0.5 },
      battery: { under: ["cover", "coil", "flex", "plate"], needs: [], min: 2 },
      camera: { under: ["cover"], needs: [], power: true, min: 1 },
      usb: { under: ["cover", "coil", "flex", "speaker"], needs: ["screw"], power: true, min: 1 },
      screen: { under: ["cover", "coil", "flex", "plate", "speaker", "battery", "camera", "usb"], needs: [], min: 30 }
    }
  };
  var ORDER = {
    fairphone: ["cover", "battery", "top", "camera", "usb", "speaker", "screen"],
    samsung: ["cover", "coil", "plate", "speaker", "flex", "battery", "camera", "usb", "screen"]
  };
  /* Minutes for a tool on a part, and for fitting the new part and closing */
  var TOOL_MIN = { heat: 3, pry: 8, screw: 1.5, glue: 3 };
  function partName(id) {
    return {
      cover: S.t("the back cover"), battery: S.t("the battery"), top: S.t("the top module"), camera: S.t("the rear camera"),
      usb: S.t("the USB-C port"), screen: S.t("the display"), coil: S.t("the wireless charging coil"),
      plate: S.t("the cover over the main board"), speaker: S.t("the loudspeaker"), flex: S.t("the flex cables"),
      power: S.t("the power button")
    }[id];
  }
  function toolName(t) {
    return { heat: S.t("heat pad"), pry: S.t("suction cup and picks"), screw: S.t("Phillips screwdriver"), glue: S.t("adhesive strips") }[t];
  }
  /* What is known about each phone, for the score card */
  function facts(phone) {
    return phone === "fairphone" ? [
      S.t("iFixit repairability score: 10 out of 10."),
      S.t("The back cover clips on, and the battery lifts out with no tools."),
      S.t("Ten user-replaceable modules, held by standard Phillips screws: the battery sits between a top module and a bottom module, and each camera is a part of its own."),
      S.t("IP55 protection against dust and jets of water.")
    ] : [
      S.t("The back glass is glued: it needs heat, a suction cup and picks."),
      S.t("Under the back glass, 17 screws hold the charging coil, the antennas, the speakers and the main board."),
      S.t("The battery comes out with stretch-release pull tabs."),
      S.t("The genuine screen comes as one assembly with the frame and a new battery.")
    ];
  }
  function names() {
    return {
      phone: { fairphone: "Fairphone 5", samsung: "Samsung Galaxy S24" },
      part: { battery: S.t("battery"), screen: S.t("screen"), usb: S.t("USB-C port"), camera: S.t("rear camera") }
    };
  }
  G.partName = partName; G.toolName = toolName; G.facts = facts; G.names = names; G.PARTS = PARTS; G.ORDER = ORDER; G.TOOL_MIN = TOOL_MIN;
})();
