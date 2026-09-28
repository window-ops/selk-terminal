window.SELK = window.SELK || {};
SELK.ENDINGS = [
  {
    id: "dismantle",
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
    reply: "Report received. Dismantling noted. Export contracts at Selk suspended for review. Relief crew: not scheduled."
  },
  {
    id: "research",
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
    reply: "Report received. Selk reclassified as research site. Plot 9 listed as protected. Export license withdrawn."
  },
  {
    id: "transmit",
    label: "Transmit the evidence",
    needs: "R3B",
    log: [
      "Sent         PKG-0.9.1, PKG-0.9.2, RELAY-LIST,",
      "             MANIFEST-2291, OWNER",
      "15-03-2097   relay R-14 disconnected",
      "15-03-2097   HX-ROOT access removed",
      "MAST-01      load 117 %, repairs still held"
    ],
    reply: "Evidence received. Release key 7 revoked. Key holder M. Horák, release signing office, suspended. HX Holdings contracts frozen. Tanker T-5 recalled. Repair orders follow within 3 passes."
  },
  {
    id: "export",
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
    reply: "Report received. No further action required."
  },
  {
    id: "habitation",
    label: "Convert to habitation",
    needs: null,
    choice: true,
    yes: {
      id: "habitation-o2",
      log: [
        "15-03-2097   EX-1 kept for AMBER heat only",
        "2098         O2 near vent 0.7 %",
        "2100         O2 near vent 1.3 %",
        "Bio cells    0.0 kW from 2099",
        "Fire tests   requested, none done"
      ],
      reply: "Habitation study approved. Crew of 4 planned for 2104. Fire tests at 94 K required before arrival."
    },
    no: {
      id: "habitation-warm",
      log: [
        "15-03-2097   Part O stopped",
        "15-03-2097   Part W continues at mast top",
        "2098         zone 14 H2 0.11 %",
        "2098         gate stops flagging at Selk",
        "Plot 9       status unknown"
      ],
      reply: "Warming study approved. Gate readings at Selk are no longer usable for life detection."
    }
  }
];
SELK.ENDING_COUNT = 6;
