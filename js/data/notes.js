/* Story data: the notes behind the dotted terms (SELK.NOTES), one note
   per key as [title, text, edition year, source]. Without a source the
   note comes from the CESEA field handbook, and some of its editions are
   outdated by design. A source is [kind, reference], shown by
   S.noteSource in js/core/i18n.js: sheet (a CESEA data sheet), man (a
   manual page on the terminal), kernel (a file of the Linux kernel
   documentation), rfc (an IETF standard), course (the CESEA supervisor
   course), archive (the CESEA archive), brief (a brief of the CESEA
   logistics office) or doc (a document named in full). The quote is
   optional and holds a phrase copied exactly from the source, checked
   against the published text; a manual page is cited with one, so the
   note can be checked against it. */
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
    "Electricity splits water into hydrogen and oxygen. Run on renewable power, it gives green hydrogen.",
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
    "Flammability limit",
    "The least oxygen a gas mixture needs before it can catch fire at all. Methane mixed with nitrogen cannot burn below about 12 % oxygen. That figure was measured at Earth temperature and pressure.",
    2096
  ],
  flamtest: [
    "Flammability test at 94 K",
    "A laboratory test that cools a sample of the air to the temperature it is used at, 94 K here, raises the pressure to match, and tries to set it on fire. A flammability limit is valid only at the temperature and pressure it was measured at, so an Earth-laboratory figure does not describe air at 94 K on Titan, where methane is close to liquid and oxygen can freeze onto surfaces.",
    2096
  ],
  biocell: [
    "Bio cell",
    "A device that collects electrical energy from living cultures.",
    2096
  ],
  /* Terms of the change notes (changenote, js/data/changenotes.js), which
     link their first mention on each page to these notes */
  r64: [
    "R-64",
    "The processor of CESEA site machines since 2075: 64 bits, 4 cores at 1.2 GHz, built to keep working under radiation.",
    2096,
    ["sheet", "R-64, revision 1, 2075"]
  ],
  ecc: [
    "ECC memory",
    "Memory that stores check bits with the data and corrects a bit flipped by radiation.",
    2096
  ],
  matrixunit: [
    "Matrix unit",
    "A part of the R-64 that multiplies tables of numbers at once, for neural models.",
    2096,
    ["sheet", "R-64, revision 1, 2075"]
  ],
  squashfs: [
    "squashfs",
    "A compressed file system that can only be read. Site terminals keep their system in one squashfs image.",
    2096,
    ["kernel", "filesystems/squashfs.rst"]
  ],
  dmverity: [
    "dm-verity",
    "A kernel check of every block read from the system image against a hash signed by CESEA.",
    2096,
    ["kernel", "admin-guide/device-mapper/verity.rst"]
  ],
  tmpfs: [
    "tmpfs",
    "A file system kept in memory. Its files are lost at restart.",
    2096,
    ["kernel", "filesystems/tmpfs.rst"]
  ],
  nfs: [
    "NFS",
    "Network File System: the file server shares /home with the terminals over the site network.",
    2096,
    ["man", "nfs(5)", "NFS was developed to allow file sharing between systems residing on a local area network."]
  ],
  kerberos: [
    "Kerberos",
    "The sign-in system of the site. The directory issues tickets that prove who a user is; with krb5p the traffic is also encrypted.",
    2096,
    ["course", "2091"]
  ],
  pkinit: [
    "PKINIT",
    "Kerberos sign-in with a certificate, here the one on the crew badge, so no password is typed.",
    2096,
    ["course", "2091"]
  ],
  ldap: [
    "LDAP",
    "The protocol of the site directory, which holds the accounts and groups of the site.",
    2096,
    ["rfc", "4511"]
  ],
  binfmt: [
    "binfmt_misc",
    "A kernel table that names the program to start for a kind of file. Site OS starts files written in ECMAScript with jsrt.",
    2096,
    ["kernel", "admin-guide/binfmt-misc.rst"]
  ],
  initramfs: [
    "initramfs",
    "A small system loaded with the kernel. It runs the boot checks and then starts the real system.",
    2096,
    ["kernel", "filesystems/ramfs-rootfs-initramfs.rst"]
  ],
  rootslots: [
    "Root slots",
    "The card holds two copies of the system, on partitions p1 and p2. One slot holds the system in use, and the other holds the copy that ran before it, kept as a fallback. An update is always written to the slot not in use, and the terminal starts from it at the next restart. If the new system fails to start three times, the terminal goes back to the other slot.",
    2096
  ],
  delta: [
    "Delta image",
    "An update that carries only the blocks that changed, for the slow uplink.",
    2096
  ],
  ota: [
    "Over-the-air update",
    "An update received over the uplink and applied at the next restart, with no visit to the site.",
    2096
  ],
  ecmascript: [
    "ECMAScript",
    "The standard language also known as JavaScript. Every site program is written in it.",
    2096,
    ["course", "2091"]
  ],
  wayland: [
    "Wayland",
    "The protocol between programs and the compositor, which draws their windows on the screen.",
    2096,
    ["doc", "/usr/share/doc/selk-compositor/README"]
  ],
  controlmode: [
    "Control mode",
    "A tmux mode in which another program draws the panes of a tmux session.",
    2096,
    ["man", "tmux(1)", "Start in control mode"]
  ],
  sixel: [
    "SIXEL",
    "An old method for a terminal to draw pictures among its text.",
    2096,
    ["doc", "DEC, VT330/VT340 Programmer Reference Manual, chapter 14", "The VT300 can send and receive sixel graphics data."]
  ],
  osc8: [
    "OSC 8",
    "A terminal code that turns a piece of text into a link.",
    2096,
    ["doc", "/usr/share/doc/selk-shell/README"]
  ],
  seccomp: [
    "seccomp",
    "A kernel filter that limits the system calls a program may make.",
    2096,
    ["man", "seccomp(2)", "The seccomp() system call operates on the Secure Computing (seccomp) state of the calling process."]
  ],
  namespaces: [
    "Namespaces",
    "Kernel walls that give a program its own view of files, network and processes.",
    2096,
    ["man", "namespaces(7)", "A namespace wraps a global system resource in an abstraction that makes it appear to the processes within the namespace that they have their own isolated instance of the global resource."]
  ],
  argon2: [
    "Argon2id",
    "A slow function that turns a password into a key, so guessing passwords takes a long time.",
    2096,
    ["rfc", "9106"]
  ],
  keyring: [
    "Session keyring",
    "Kernel storage for keys, kept until sign-out.",
    2096,
    ["man", "keyrings(7)", "keyrings - in-kernel key management and retention facility"]
  ],
  pstore: [
    "pstore",
    "Kernel memory that survives a restart and keeps the last messages of the previous boot.",
    2096,
    ["kernel", "admin-guide/ramoops.rst"]
  ],
  dmesgrestrict: [
    "dmesg_restrict",
    "A kernel setting that keeps the kernel log to accounts with the capability cap_syslog.",
    2096,
    ["kernel", "admin-guide/sysctl/kernel.rst"]
  ],
  bundle: [
    "Bundle Protocol",
    "Networking for links with long delays: each station keeps a bundle until the next station can take it.",
    2096,
    ["rfc", "9171"]
  ],
  ltp: [
    "LTP",
    "Licklider Transmission Protocol: delivery over one link with hours of delay, under the Bundle Protocol.",
    2096,
    ["rfc", "5326"]
  ],
  lighttime: [
    "Light time",
    "The time a signal takes between Earth and Saturn at the speed of light, 74 to 84 minutes one way.",
    2096
  ],
  ephemeris: [
    "Ephemeris",
    "A table of where the planets are at each moment, used to compute distances and delays.",
    2096
  ],
  xband: [
    "X band",
    "Radio frequencies near 8 GHz, used for links with deep space.",
    2096
  ],
  unitbus: [
    "Unit bus",
    "The wired network between the site terminals and the assembly units.",
    2096
  ],
  lts: [
    "Long-term kernel",
    "A Linux release kept with fixes for several years. Site OS follows one at a time.",
    2096,
    ["kernel", "process/2.Process.rst"]
  ],
  stable: [
    "Stable update",
    "A release of fixes for a kernel series, with no new features.",
    2096,
    ["kernel", "process/stable-kernel-rules.rst"]
  ],
  smp: [
    "SMP",
    "Several processors that share one memory and one kernel.",
    2096,
    ["course", "2091"]
  ],
  scheduler: [
    "Scheduler",
    "The part of the kernel that decides which task runs on which processor, and for how long.",
    2096,
    ["kernel", "scheduler/sched-eevdf.rst"]
  ],
  preemptrt: [
    "PREEMPT_RT",
    "A kernel option for real-time work: a task with a deadline can interrupt almost any other.",
    2096,
    ["course", "2091"]
  ],
  bpf: [
    "BPF",
    "Small programs that the kernel checks and then runs inside itself.",
    2096,
    ["kernel", "bpf/index.rst"]
  ],
  rust: [
    "Rust",
    "A programming language that prevents many memory errors when the program is built.",
    2096,
    ["kernel", "rust/index.rst"]
  ],
  mglru: [
    "Multi-generational LRU",
    "A way for the kernel to choose which memory pages to free, by how recently they were used.",
    2096,
    ["kernel", "admin-guide/mm/multigen_lru.rst"]
  ],
  meltdown: [
    "Meltdown",
    "A processor flaw of 2018 that let programs read kernel memory. Page table isolation closes it.",
    2096,
    ["kernel", "arch/x86/pti.rst"]
  ],
  wireguard: [
    "WireGuard",
    "A small, fast protocol for encrypted links between networks.",
    2096,
    ["doc", "J. A. Donenfeld, WireGuard: Next Generation Kernel Network Tunnel, NDSS 2017"]
  ],
  livepatch: [
    "Live patching",
    "Fixing the running kernel without a restart.",
    2096,
    ["kernel", "livepatch/livepatch.rst"]
  ],
  lto: [
    "Link-time optimization",
    "The compiler improves the program as a whole when its parts are linked.",
    2096,
    ["man", "gcc(1)", "This option runs the standard link-time optimizer."]
  ],
  ssa: [
    "Tree SSA",
    "A form of the program inside GCC in which each value is set once, which makes optimizing easier.",
    2096,
    ["doc", "GCC Internals, Tree SSA"]
  ],
  sframe: [
    "SFrame",
    "A small format that lets tools walk the stack of a running program.",
    2096,
    ["doc", "The SFrame format, GNU Binutils"]
  ],
  linker: [
    "Linker",
    "The program that joins compiled parts into one program. GNU ld and gold are linkers.",
    2096,
    ["man", "ld(1)", "ld combines a number of object and archive files, relocates their data and ties up symbol references."]
  ],
  cgroup: [
    "Control groups",
    "Kernel groups of processes that share limits on processor time and memory.",
    2096,
    ["kernel", "admin-guide/cgroup-v2.rst"]
  ],
  pid1: [
    "Process 1",
    "The first program the kernel starts. It starts and watches every other service.",
    2096,
    ["man", "systemd(1)", "When run as first process on boot (as PID 1), it acts as init system that brings up and maintains userspace services."]
  ],
  tls: [
    "TLS",
    "Encryption for network connections, used between the terminal and the directory.",
    2096,
    ["rfc", "8446"]
  ],
  debian: [
    "Debian",
    "A free operating system. CESEA Site OS has been based on it since 1.0.",
    2096,
    ["doc", "/usr/share/doc/ceseaos/README"]
  ],
  tpaneza: [
    "TPANEZA",
    "ΤΡΑΠΕΖΑ, Greek for bank, written in Latin letters that look like the Greek ones. Read trapeza.",
    2096,
    ["brief", "2068"]
  ],
  troika: [
    "Troika",
    "The European Commission, the European Central Bank and the IMF, which lent to Greece from 2010 to 2015 on conditions of austerity.",
    2096,
    ["archive", "the Troika loans"]
  ],
  debtcrisis: [
    "Debt crisis",
    "A state can no longer borrow to pay its debts, and its banks, its payments and its trade stop or slow down.",
    2096,
    ["archive", "the euro crisis"]
  ]
};
