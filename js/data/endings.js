window.SELK = window.SELK || {};
SELK.ENDINGS = [
  {
    id: "dismantle",
    mood: "hollow",
    label: "Dismantle the base",
    needs: null,
    log: [
      "15-03-2097   reactor set to 10 %",
      "15-03-2097   EX-1 stopped",
      "16-03-2097   CRANE-L lowered",
      "02-05-2097   MAST-01 down to 200 m",
      "30-09-2097   MAST-01 removed",
      "FOOTING-B    left in place, gate blocks cutting",
      "Plots 3, 6   H2 0.10 %, cells active",
      "Plot 9       under FOOTING-B, not sampled"
    ],
    reply: "Report received. Dismantling noted. Export contracts at Selk suspended for review. Relief crew: not scheduled.",
    title: "Dismantled",
    epilogue: [
      "The tower comes down one piece at a time. The units lower each block as carefully as they once raised it.",
      "By September the crater is quiet. Only FOOTING-B stays, a concrete lid over plot 9.",
      "Nobody on Earth asks what the cells beneath it were doing.",
      "You stay until the reactor is cold. The relief crew is never scheduled."
    ]
  },
  {
    id: "research",
    mood: "hope",
    label: "Keep a research station",
    needs: "R3A",
    log: [
      "15-03-2097   EX-1 intake closed",
      "15-03-2097   gate baseline 0.10 %, measured 20 km west",
      "18-03-2097   fault model 3.2 restored",
      "02-04-2097   zone 14 H2 back to 0.10 %",
      "02-04-2097   zone 14 flag clears, except plot 9",
      "10-06-2097   east outrigger removed",
      "MAST-01      cut to 640 m to stay within load",
      "Lab          reopened"
    ],
    reply: "Report received. Selk reclassified as research site. Plot 9 listed as protected. Export license withdrawn.",
    title: "The station",
    epilogue: [
      "The intake closes, and the hydrogen comes back to the crater a hundredth of a percent at a time.",
      "In April the gate reads zone 14 as clean. This time it is right.",
      "The lab lights come on for the first time in five years. Plot 3 is still alive.",
      "Titan has neighbours now, and you are the one who keeps their records."
    ]
  },
  {
    id: "transmit",
    mood: "hope",
    label: "Transmit the evidence",
    needs: "R3B",
    log: [
      "Sent         PKG-0.9.1, PKG-0.9.2, RELAY-LIST,",
      "             MANIFEST-2291, OWNER",
      "15-03-2097   relay R-14 disconnected",
      "15-03-2097   HX-ROOT access removed",
      "MAST-01      load 117 %, repairs still held"
    ],
    reply: "Evidence received. Release key 7 revoked. Key holder M. Horák, release signing office, suspended. HX Holdings contracts frozen. Tanker T-5 recalled. Repair orders follow within 3 passes.",
    title: "The evidence",
    epilogue: [
      "The packets leave on the R-09 pass. For 79 minutes they are the only honest thing between Saturn and Earth.",
      "R-14 goes dark. HX-ROOT stops answering.",
      "The mast still leans at 117 percent while Earth argues over who signed what.",
      "The repair orders will come. Until then you listen to the tower and wait for the next pass."
    ]
  },
  {
    id: "export",
    mood: "dark",
    label: "Keep the exports running",
    needs: null,
    route: "R-14",
    log: [
      "15-03-2097   gate switched off",
      "15-03-2097   fault model 3.2 restored",
      "20-03-2097   repairs resume on MAST-01",
      "11-08-2097   MAST-01 load 94 %",
      "02-02-2098   tanker T-5 loaded, label green",
      "Bio cells    0.0 kW from 06-2098"
    ],
    reply: "Report received. No further action required.",
    title: "Business as usual",
    epilogue: [
      "The gate falls silent, and the repairs start again the same afternoon.",
      "By August the mast stands straight, and the tanker leaves on schedule.",
      "In June 2098 the bio cells deliver their last tenth of a kilowatt. Then nothing.",
      "The label on T-5 says green. Nobody on Earth has a reason to look closer."
    ]
  },
  {
    id: "habitation",
    label: "Convert to habitation",
    needs: null,
    choice: true,
    yes: {
      id: "habitation-o2",
      mood: "dark",
      log: [
        "15-03-2097   EX-1 kept for AMBER heat only",
        "2098         O2 near vent 0.7 %",
        "2100         O2 near vent 1.3 %",
        "Bio cells    0.0 kW from 2099",
        "Fire tests   requested, none done"
      ],
      reply: "Habitation study approved. Crew of 4 planned for 2104. Fire tests at 94 K required before arrival.",
      title: "Air for someone else",
      epilogue: [
        "Oxygen keeps rising near the vent: 0.7 percent, then 1.3.",
        "The cells stop answering in 2099, poisoned by the air meant to make Titan kinder.",
        "The fire tests are requested every year. None is ever run.",
        "In 2104 four people will breathe here, in air that has never met a spark."
      ]
    },
    no: {
      id: "habitation-warm",
      mood: "dark",
      log: [
        "15-03-2097   Part O stopped",
        "15-03-2097   Part W continues at mast top",
        "2098         zone 14 H2 0.11 %",
        "2098         gate stops flagging at Selk",
        "Plot 9       status unknown"
      ],
      reply: "Warming study approved. Gate readings at Selk are no longer usable for life detection.",
      title: "Warmth without witnesses",
      epilogue: [
        "Part O stops. Hydrogen still leaves the mast top, and the haze above Selk warms by a fraction of a degree.",
        "Zone 14 creeps to 0.11 percent. The gate stops flagging anything, anywhere at Selk.",
        "Whatever lives under plot 9 is now invisible to every instrument you have.",
        "The question of who lived here first is closed, and nobody closed it on purpose."
      ]
    }
  }
];
SELK.ENDING_COUNT = 6;
