/* Story data: locked-section passwords and hints (SELK.LOCKS), report pages
   (SELK.REPORTS), mail (SELK.MESSAGES) and the entry labels that are false by
   design (SELK.FALSE_LABELS). Contains the answers and passwords. */
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
  },
  /* Shown after the first ending. The serial of this terminal, in the
     groups the hints build. key: the unlock dialog shows one box per group,
     like an activation key, and the shell takes the serial whole or in
     groups. note and clues replace the usual locked-section text, since the
     serial is in no entry: clues is a boxed list of [label, text] pairs that
     nudge toward each step without stating its result, yet carry every
     fact a player needs to solve it; the hint lines then escalate to the
     full answer. plain lists the European facts behind the clues, which
     I AM NOT AN EU CITIZEN in the unlock dialog adds for players who did
     not grow up with them. */
  design: {
    parts: [
      "kt",
      "zb",
      "a0",
      "k6",
      "sb2",
      "kb",
      "r1c",
      "s5",
      "ce",
      "97"
    ],
    key: true,
    hint: [
      "Remove the E from the initials, and let BCE stand for CE, the conformity mark: CE CB ZB KP KT SB KB BC.",
      "KT is Greek, from the country hit hardest by the euro crisis. It goes first.",
      "ZB is German, from the main creditor Greece argued with. It goes second.",
      "CE, the conformity mark, goes last: KT ZB CB KP SB KB BC CE.",
      "CB and BC mirror each other. The first, CB, becomes A0, the larger new ring road of Bucharest.",
      "RoHS ends in S and its number, 2011/65, ends in 5. S5 goes before CE.",
      "Mirrored, P looks like 9; upside down, 9 is 6. KP becomes K6.",
      "SBB, the German initials of the Swiss railways, has two Bs. SB becomes SB2.",
      "KTZBA0K6SB2KBBCS5CE has 19 characters. Add 9 at the end.",
      "BBC, the British television, hides in KBBCS. It becomes BR1C.",
      "The 500 euro note stopped being printed on 27-04-2019. Add 7: KTZBA0K6SB2KBR1CS5CE97."
    ],
    nudge: "The serial is built from the initials on a euro note.",
    note: "Design opens with the serial of this terminal. The label on the case is worn off, but the factory note that made the serial survives; work down it in order.",
    clues: [
      [
        "Start",
        "the initials of the European Central Bank on a euro note, in latin letters"
      ],
      [
        "Initials",
        "BCE ECB EZB EKP EKT ESB EKB EBC"
      ],
      [
        "Each set",
        "drop the E, which stands for European; two letters remain"
      ],
      [
        "BCE",
        "here the B goes and the E stays; what remains is a mark printed on electronics"
      ],
      [
        "First",
        "the pair in the language of the country the euro crisis hit hardest"
      ],
      [
        "Second",
        "the pair in the language of that country's main creditor"
      ],
      [
        "Middle",
        "the remaining pairs except the mark, in the order above"
      ],
      [
        "Last",
        "the conformity mark"
      ],
      [
        "Mirror",
        "two middle pairs read as each other reversed; write the larger new motorway ring around Bucharest, a letter and a digit, in place of the first"
      ],
      [
        "Before the mark",
        "RoHS 2, the 2011 European directive on hazardous substances: the last letter of RoHS, then the last digit of its number"
      ],
      [
        "P",
        "a mirrored P looks like a digit; turn that digit upside down and write it in place of the P"
      ],
      [
        "After SB",
        "the initials of the Swiss railways in German have one letter twice; write after SB how many times it appears"
      ],
      [
        "Then",
        "count every character so far, digits included; write the last digit of the count after the mark"
      ],
      [
        "Hidden",
        "a broadcaster's initials now stand together across two pairs; write R1 in place of their second B"
      ],
      [
        "End",
        "close with the last digit of the day the 500 euro note stopped being printed: 27-04-2019"
      ]
    ],
    plain: [
      [
        "EKT",
        "Greek (ΕΚΤ, Ευρωπαϊκή Κεντρική Τράπεζα)"
      ],
      [
        "EZB",
        "German (Europäische Zentralbank)"
      ],
      [
        "Other sets",
        "BCE French and others, ECB English and others, EKP Finnish and Estonian, ESB Croatian, EKB Hungarian, EBC Polish"
      ],
      [
        "Euro crisis",
        "from 2009 it hit Greece hardest; Germany was its main creditor"
      ],
      [
        "Bucharest",
        "the capital of Romania; the larger of its new motorway rings is the A0"
      ],
      [
        "CE",
        "the conformity mark on products sold in the European Economic Area"
      ],
      [
        "RoHS",
        "Restriction of Hazardous Substances, directive 2011/65/EU"
      ],
      [
        "SBB",
        "Schweizerische Bundesbahnen, the Swiss railways"
      ],
      [
        "BBC",
        "British Broadcasting Corporation, the British public broadcaster"
      ],
      [
        "500 euro",
        "the largest euro note; its printing stopped on 27-04-2019"
      ]
    ]
  },
  /* Shown once Design is open. The media test from the supervisor's CESEA
     selection: each line by Brian Cox, a science presenter of the 2010s, is
     sorted into filler, which keeps the viewer watching, or substance, which
     tells the viewer something. sort lists the choices and the lines with
     their sources; the answer is one letter per line, in order. */
  history: {
    parts: [
      "sffssfsf"
    ],
    sort: {
      choices: [
        [
          "f",
          "FILLER"
        ],
        [
          "s",
          "SUBSTANCE"
        ]
      ],
      items: [
        [
          "Every carbon atom in every living thing on the planet was produced in the heart of a dying star.",
          "Wonders of the Universe, 2011"
        ],
        [
          "Look at that! If you ever needed convincing that we live in the solar system, that we are on a ball of rock, orbiting around the Sun with other balls of rock, then look at that!",
          "Wonders of the Solar System, 2010"
        ],
        [
          "Deeper understanding confers that most precious thing: wonder.",
          "Wonders of Life, 2013"
        ],
        [
          "Light is the only connection we have with the Universe beyond our solar system.",
          "Wonders of the Universe, 2011"
        ],
        [
          "Skepticism must go hand in hand with rationality. When theories are shown to be false, the correct thing to do is to move on.",
          "on the Large Hadron Collider, 2008"
        ],
        [
          "We are the cosmos made conscious and life is the means by which the universe understands itself.",
          "Wonders of the Universe, 2011"
        ],
        [
          "To look up is to look back in time, because the ancient beams of light are messengers from the Universe's distant past.",
          "Wonders of the Universe, 2011"
        ],
        [
          "We have written the evidence of our existence onto the surface of our planet.",
          "Wonders of the Solar System, 2010"
        ]
      ]
    },
    hint: [
      "Substance tells you something you could check. Filler tells you how to feel.",
      "Lines 1, 4 and 7 explain where atoms and light come from: substance.",
      "Line 5 says what to do with a false theory: substance.",
      "Lines 2, 3, 6 and 8 ask for awe and give no fact: filler.",
      "The answer is SFFSSFSF."
    ],
    nudge: "Sort each line into filler or substance.",
    note: "History opens with the media test from your CESEA selection. Sort each line by Brian Cox, a science presenter of the 2010s: filler keeps you watching, substance tells you something."
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
  /* The text of MSG004 and MSG005 depends on what the office already has.
     awaits names the other follow-up page: body is sent while that page is
     outstanding, received when it was accepted before this message is
     delivered. S.deliver records the choice with the message, so the text
     does not change after delivery. */
  MSG004: {
    opens: [
      "R4"
    ],
    awaits: "R3B",
    body:
    `REPORT 3A accepted.
If cells live under FOOTING-B, zone 14 is partly real. Gate records forwarded to CESEA biology. Fill in REPORT 4. REPORT 3B is still outstanding. The office can act on evidence about the update history once it arrives, so send it before you decide.
AUDIT DESK 4`,
    received:
    `REPORT 3A accepted.
If cells live under FOOTING-B, zone 14 is partly real. Gate records forwarded to CESEA biology. With REPORT 3B already received, the gate history and the update history both lead to EX-1. REPORT 4 should name who gained from it.
AUDIT DESK 4`
  },
  MSG005: {
    opens: [
      "R4"
    ],
    awaits: "R3A",
    body:
    `REPORT 3B accepted.
Release key 7 belongs to our own signing office. It has been flagged for review. Fill in REPORT 4. REPORT 3A is still outstanding. The office can approve research use of the site once it arrives, so send it before you decide.
AUDIT DESK 4`,
    received:
    `REPORT 3B accepted.
Release key 7 belongs to our own signing office. It has been flagged for review. Read beside REPORT 3A, which this office already holds, the update trail ends at the same plant as the gate records: EX-1. REPORT 4 should name who gained from it.
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
