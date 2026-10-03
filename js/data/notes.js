/* Story data: the CESEA field handbook (SELK.NOTES), one note per key as
   [title, text, edition year]. Some editions are outdated by design. */
window.SELK = window.SELK || {};
SELK.NOTES = {
  author: [
    "Written by",
    "The recorded author of an entry. Model summaries can contain errors, and labels can be wrong.",
    2096
  ],
  delay: [
    "Signal delay",
    "Radio needs 74 to 84 minutes to travel between Earth and Saturn, one way.",
    2096
  ],
  crater: [
    "Impact crater",
    "A gap in the form of a bowl made when an object from space hits the surface.",
    2096
  ],
  clathrate: [
    "Methane clathrate",
    "Water ice with methane held inside small ice cages. It releases methane when heated.",
    2096
  ],
  kelvin: [
    "Kelvin (K)",
    "Temperature counted from absolute zero. 94 K is about -179 °C.",
    2096
  ],
  hpa: [
    "Hectopascal (hPa)",
    "A pressure unit. Earth at sea level has 1 013 hPa, so the surface pressure on Titan is about 1.45 times higher.",
    2096
  ],
  h2: [
    "Hydrogen (H2)",
    "About 0.1 % of the air on Titan near the ground. Life that eats hydrogen would lower it locally.",
    2096
  ],
  watervap: [
    "Water on Titan",
    "At 94 K water ice does not evaporate. The air holds no water vapor, so water frost cannot form from weather.",
    2096
  ],
  equinox: [
    "Equinox",
    "The Sun stands over the equator. On Titan this happens every 14.7 years and brings storms and dust to the equator.",
    2096
  ],
  dust: [
    "Dune dust",
    "Fine organic grains lifted from dune fields by strong winds.",
    2096
  ],
  sleep: [
    "Long sleep",
    "A medical rest state used at single-crew sites. The sleeper does not see or record things.",
    2096
  ],
  pytorch: [
    "PyTorch",
    "An open-source library for building and training neural networks.",
    2096
  ],
  ntorch: [
    "NTorch",
    "The neural model framework used by site units and by the database summaries.",
    2096
  ],
  chemo: [
    "Chemosynthesis",
    "Life that takes energy from chemical reactions, with no light.",
    2096
  ],
  reaction: [
    "C2H2 + 3 H2 > 2 CH4",
    "Acetylene and hydrogen become methane and release energy. Proposed in 2005 as a food source for life on Titan.",
    2096
  ],
  regolith: [
    "Regolith",
    "Loose grains covering solid ground.",
    2096
  ],
  control: [
    "Control plot",
    "A plot left untouched, used for comparison with the others.",
    2096
  ],
  gate: [
    "Gate",
    "A site rule that stops units from cutting, heating or drilling where life may be present.",
    2096
  ],
  baseline: [
    "Baseline",
    "The normal value a new reading is compared with.",
    2096
  ],
  detect: [
    "Below detection",
    "The amount is smaller than the sensor can measure. Some may still be present.",
    2096
  ],
  printedice: [
    "Printed ice",
    "Water ice laid down in layers by print units. At 94 K it is as hard as rock.",
    2096
  ],
  ties: [
    "Carbon fibre tie",
    "A member that holds ice parts together. Ice is strong under pressure and weak under pulling.",
    2096
  ],
  load: [
    "Load",
    "The force a part carries, shown as a share of its safe limit. Above 100 % a part can fail.",
    2096
  ],
  guy: [
    "Guy cable",
    "A cable that anchors a tall structure against wind.",
    2096
  ],
  outrigger: [
    "Outrigger",
    "An arm that spreads the weight of a tower onto extra footings.",
    2096
  ],
  revision: [
    "Revision",
    "A saved earlier version of an entry. Each change adds one.",
    2096
  ],
  remote: [
    "Remote account",
    "An account operated from Earth. It can change site settings only through a signed package.",
    2088
  ],
  planner: [
    "Layout planner",
    "An NTorch model that places new parts. Crew must check its plans before building.",
    2084
  ],
  faultmodel: [
    "Fault model",
    "An NTorch model that marks cracks in camera images. The site version is trained on Selk ice.",
    2084
  ],
  training: [
    "Training data",
    "The images a model learns from. A model trained on one material can misread another.",
    2096
  ],
  score: [
    "Score",
    "The confidence of a model, from 0 to 1. Cut units act above 0.85.",
    2090
  ],
  releasekey: [
    "Release key",
    "A digital key that signs packages. Only the CESEA release signing office holds release keys.",
    2081
  ],
  relay: [
    "Relay",
    "A station that passes signals between Earth and Saturn. CESEA relays are R-02 to R-14.",
    2082
  ],
  sigcheck: [
    "Signature check",
    "The site accepts any package signed with a valid key, whatever route it takes.",
    2092
  ],
  reforming: [
    "Steam reforming",
    "Methane and steam become hydrogen and carbon dioxide: CH4 + 2 H2O > CO2 + 4 H2.",
    2096
  ],
  grey: [
    "Gray hydrogen",
    "Hydrogen made by steam reforming, with the carbon dioxide released.",
    2096
  ],
  green: [
    "Green hydrogen",
    "Any hydrogen made at a site powered by fission.",
    2080
  ],
  electrolysis: [
    "Electrolysis",
    "Electricity splits water into hydrogen and oxygen. Run on clean power, it gives green hydrogen.",
    2096
  ],
  lh2: [
    "Liquid hydrogen",
    "Hydrogen cooled below 20 K. On Titan it still needs cooling from 94 K.",
    2096
  ],
  co2ice: [
    "Carbon dioxide ice",
    "Solid CO2. It stays solid far above the 94 K surface temperature of Titan.",
    2096
  ],
  fission: [
    "Fission reactor",
    "Splits uranium atoms to make heat. Part of the heat becomes electricity.",
    2096
  ],
  mw: [
    "Megawatt (MW)",
    "One million watts.",
    2096
  ],
  collision: [
    "Collision warming",
    "Nitrogen, methane and hydrogen molecules absorb heat radiation when they collide. This warms the surface of Titan.",
    2096
  ],
  haze: [
    "Haze cooling",
    "The high orange haze absorbs sunlight before it reaches the ground and cools the surface by about 9 K.",
    2096
  ],
  firelimit: [
    "Fire limit",
    "Methane mixed with nitrogen cannot burn below about 12 % oxygen. The value was measured at Earth temperature and pressure.",
    2096
  ],
  biocell: [
    "Bio cell",
    "A device that collects electrical energy from living cultures.",
    2096
  ]
};
