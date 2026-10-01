window.SELK = window.SELK || {};
SELK.LOCKS = {
  archive: {
    parts: [
      "serket"
    ],
    hint: [
      "Selk's crater name comes from mythology.",
      "Its namesake is associated with scorpions."
    ],
    nudge: "The crater name has a mythological origin."
  },
  comms: {
    parts: [
      "55183"
    ],
    hint: [
      "One software update is linked to several stalled repairs.",
      "The affected systems share an update identifier."
    ],
    nudge: "Several repair notices share the same update identifier."
  },
  export: {
    parts: [
      "118"
    ],
    hint: [
      "Temperature readings can reveal conditions near an active vent.",
      "Look for a cold-site measurement recorded close to a vent."
    ],
    nudge: "An environmental measurement near a vent may be useful."
  },
  power: {
    parts: [
      "amber",
      "2291"
    ],
    hint: [
      "One part is a color used as an older research program's codename.",
      "The other is an identifier for a hydrogen shipment."
    ],
    nudge: "Think about an older research codename and a hydrogen shipment."
  }
};
SELK.FALSE_LABELS = [
  "site/SEASON",
  "units/INDEX",
  "structure/FOOTING-B",
  "archive/FOOTING-B.R1",
  "power/BUDGET",
  "export/MANIFEST-2291",
  "export/EX-1"
];
SELK.REPORTS = {
  R1: {
    brief: "Where is the site, and why was it built?",
    code: "1",
    title: "REPORT 1 / SITE ORIGIN",
    lines: [
      [
        "The site stands inside ",
        [
          "site/SELK"
        ],
        "."
      ],
      [
        "Its first purpose is recorded in ",
        [
          "bio/LAB"
        ],
        "."
      ],
      [
        "Life is protected by ",
        [
          "bio/GATE"
        ],
        "."
      ],
      [
        "Repairs first stopped at ",
        [
          "bio/ZONE-14"
        ],
        "."
      ]
    ],
    hints: [
      "The crater has its own entry in Site.",
      "The lab entry in Bio states what the site was built to test.",
      "The rule that stops units near life is in Bio.",
      "The first flagged zone has its own entry in Bio."
    ],
    reply: "MSG002"
  },
  R2: {
    brief: "What is failing, and since when?",
    code: "2",
    title: "REPORT 2 / WHAT IS FAILING",
    lines: [
      [
        "The most loaded part is ",
        [
          "structure/MAST-01"
        ],
        "."
      ],
      [
        "Repairs stopped on the dates in ",
        [
          "structure/STOPPED-REPAIRS"
        ],
        "."
      ],
      [
        "The crane cannot move because of ",
        [
          "bio/ZONE-14"
        ],
        "."
      ],
      [
        "An entry with false data is ",
        [
          "structure/INDEX",
          "units/INDEX"
        ],
        "."
      ]
    ],
    hints: [
      "Compare the load figures in Structure.",
      "One Structure log lists every stopped repair by date.",
      "The crane entry names the zone its path crosses.",
      "Compare the Structure index with the mast entry."
    ],
    reply: "MSG003"
  },
  R3A: {
    brief: "Who changed the gate, and what did it hide?",
    code: "3A",
    title: "REPORT 3A / GATE HISTORY",
    lines: [
      [
        "The gate was switched off in ",
        [
          "archive/GATE.R12"
        ],
        "."
      ],
      [
        "Living cells under the paving appear in ",
        [
          "archive/ZONE-14.R6"
        ],
        "."
      ],
      [
        "The air near the plant changed, as shown in ",
        [
          "archive/AIR.R7-12",
          "export/EX-1"
        ],
        "."
      ],
      [
        "A false author label appears in ",
        SELK.FALSE_LABELS,
        "."
      ]
    ],
    hints: [
      "The Archive keeps every revision of the gate entry.",
      "The hidden lines of a zone entry survive in an older revision.",
      "Hydrogen readings over the years sit in the Archive.",
      "The site has one crew member. Compare staff signatures with the dates of the long sleep."
    ],
    reply: "MSG004"
  },
  R3B: {
    brief: "Where did the faulty update come from?",
    code: "3B",
    title: "REPORT 3B / UPDATE HISTORY",
    lines: [
      [
        "The crack finder was replaced in ",
        [
          "units/FAULT-MODEL"
        ],
        "."
      ],
      [
        "The new version arrived in ",
        [
          "comms/PKG-0.9.2"
        ],
        "."
      ],
      [
        "It came through a relay listed in ",
        [
          "comms/RELAY-LIST"
        ],
        "."
      ],
      [
        "Hydrogen sold as green is described in ",
        [
          "export/MANIFEST-2291"
        ],
        "."
      ]
    ],
    hints: [
      "Units keeps a record of the crack finder and its versions.",
      "Comms lists packages by build number.",
      "Comms keeps a list of approved relays.",
      "Export lists each shipment by number."
    ],
    reply: "MSG005"
  },
  R4: {
    brief: "Who gained from the site?",
    code: "4",
    title: "REPORT 4 / WHO GAINED",
    lines: [
      [
        "The plant and relay belong to the operator in ",
        [
          "export/OWNER"
        ],
        "."
      ],
      [
        "Most reactor heat goes where ",
        [
          "power/BUDGET"
        ],
        " shows."
      ],
      [
        "The warming program is ",
        [
          "power/AMBER"
        ],
        "."
      ],
      [
        "A safety claim without test data is in ",
        [
          "power/AMBER-SAFETY"
        ],
        "."
      ]
    ],
    hints: [
      "Export names the operator of the plant.",
      "Power shows how reactor heat is shared.",
      "Power names the warming program.",
      "One Power entry claims more than its own data supports."
    ],
    reply: "MSG006"
  }
};
SELK.MESSAGES = {
  MSG001: {
    opens: [
      "R1"
    ],
    body:
    `Supervisor @NAME@,
you were woken early because MAST-01 at Selk is failing. The office on Earth cannot see the site and needs answers from your database. Read the entries in FILES, then fill in REPORT 1: drag an entry name onto each blank, or click a blank and press USE. Submit when all four blanks are filled.
AUDIT DESK 4`
  },
  MSG002: {
    opens: [
      "R2"
    ],
    body:
    `REPORT 1 accepted.
Life at Selk was confirmed in 2083. The gate that protects it is now stopping repairs across zone 14. Fill in REPORT 2 from Structure records.
AUDIT DESK 4`
  },
  MSG003: {
    opens: [
      "R3A",
      "R3B"
    ],
    body:
    `REPORT 2 accepted.
The office requests two further pages: 3A on the gate history and 3B on the update history. Four sections are locked. Their passwords changed while you slept. Each password appears in an entry you can already open, as a name, a word or a number.
AUDIT DESK 4`
  },
  MSG004: {
    opens: [
      "R4"
    ],
    body:
    `REPORT 3A accepted.
If cells live under FOOTING-B, zone 14 is partly real. Gate records forwarded to CESEA biology. REPORT 4 is open. If REPORT 3B is still open, accepting it before the final decision makes the option that depends on it available.
AUDIT DESK 4`
  },
  MSG005: {
    opens: [
      "R4"
    ],
    body:
    `REPORT 3B accepted.
Release key 7 belongs to our own signing office. It has been flagged for review. REPORT 4 is open. If REPORT 3A is still open, accepting it before the final decision makes the option that depends on it available.
AUDIT DESK 4`
  },
  MSG006: {
    decision: true,
    body:
    `REPORT 4 accepted.
The office cannot act from Earth before the equinox storms reach Selk. The decision on the site rests with the supervisor.
Type decide when ready.
AUDIT DESK 4`
  }
};
