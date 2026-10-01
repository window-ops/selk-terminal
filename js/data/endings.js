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
      "The units take MAST-01 apart and lower each block to the ground.",
      "By September the tower is gone. FOOTING-B stays in place over plot 9.",
      "No one samples the soil under it.",
      "You stay in the shelter until the reactor is shut down. No relief crew is scheduled."
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
    title: "Research station",
    epilogue: [
      "The EX-1 intake is closed. Hydrogen near the ground returns to 0.10 percent.",
      "In April the gate lifts the flag on zone 14, except for plot 9.",
      "The lab reopens. Plot 3 still shows active cells.",
      "Selk becomes a research station. From the site shelter, you record its findings and send them to Earth."
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
      "MAST-01      high load, repairs still held"
    ],
    reply: "Evidence received. Release key 7 revoked. Key holder M. Horák, release signing office, suspended. HX Holdings contracts frozen. Tanker T-5 recalled. Repair orders follow within 3 passes.",
    title: "The evidence",
    epilogue: [
      "The packets go out on the R-09 pass and reach Earth 79 minutes later.",
      "Relay R-14 is disconnected. The HX-ROOT account no longer works.",
      "MAST-01 stays under high load while the office reviews the evidence.",
      "Repair orders are due within three passes. You wait for them in the shelter."
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
      "The gate is switched off, and the repairs start again the same day.",
      "By August the load on MAST-01 falls to 94 percent. Tanker T-5 leaves on schedule.",
      "In June 2098 the bio cells stop producing power.",
      "T-5 is labelled green hydrogen. No one on Earth checks the label."
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
      title: "Habitation with oxygen",
      epilogue: [
        "Oxygen near the vent rises to 0.7 percent in 2098 and 1.3 percent in 2100.",
        "The bio cells stop producing power in 2099.",
        "The office asks for fire tests at 94 K every year. None is carried out.",
        "A crew of four is planned for 2104. The air has never been tested for fire."
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
      title: "Warming without oxygen",
      epilogue: [
        "Part O stops. Hydrogen is still released from the top of the mast.",
        "Hydrogen in zone 14 rises to 0.11 percent, and the gate stops flagging anything at Selk.",
        "Any life under plot 9 can no longer be detected by the site's instruments.",
        "The warming study goes ahead. The question of life at Selk is left open."
      ]
    }
  }
];
SELK.ENDING_COUNT = 6;
