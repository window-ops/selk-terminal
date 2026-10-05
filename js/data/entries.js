/* Story data: the sections in display order (SELK.SECTIONS) and every entry
   (SELK.ENTRIES), added through E(id, by, body, extra). docs/game-data.md
   describes the fields; TRANSLATING.md describes the markup in bodies. */
window.SELK = window.SELK || {};
SELK.SECTIONS = [
  {
    id: "home",
    name: "Home",
    nodrag: true
  },
  {
    id: "site",
    name: "Site"
  },
  {
    id: "bio",
    name: "Bio"
  },
  {
    id: "structure",
    name: "Structure"
  },
  {
    id: "units",
    name: "Units"
  },
  {
    id: "archive",
    name: "Archive",
    locked: true
  },
  {
    id: "comms",
    name: "Comms",
    locked: true
  },
  {
    id: "export",
    name: "Export",
    locked: true
  },
  {
    id: "power",
    name: "Power",
    locked: true
  },
  {
    id: "design",
    name: "Design",
    locked: true,
    egg: true,
    nodrag: true
  },
  {
    id: "history",
    name: "History",
    locked: true,
    after: "design",
    nodrag: true
  },
  {
    id: "system",
    name: "System"
  }
];
SELK.ENTRIES = [];
(function () {
  function E(id, by, body, extra) {
    var e = {
      id: id,
      by: by,
      body: body
    };
    if (extra) {
      for (var k in extra) {
        e[k] = extra[k];
      }
    }
    SELK.ENTRIES.push(e);
  }
  /* Home */
  E("home/README", "CESEA onboarding",
  `Site          Selk crater, Titan
Built for     testing for life, then a colony
Crew          1 supervisor: @NAME@
Your state    woken 26-02-2097 after long sleep
Problem       MAST-01 is failing
Earth         79 minutes away by radio
Your task     answer the CESEA audit office
First step    read MSG 001 in MAIL`);
  E("home/HOWTO", "CESEA onboarding",
  `Read          choose an entry in FILES
Report        drag an entry name onto a blank,
              or click a blank, then press USE
Send          SUBMIT when all 4 blanks are full
Locked        passwords hide in other entries
Notes         dotted words open the handbook
Authors       check who wrote each entry
Panes         press CTRL+B, then O to move to the
              next pane, or Z to enlarge the current one
Shell         click the shell on DESK, then press
              POP OUT SHELL to give it its own window.
              POP IN SHELL puts it back.
Keys          F1 to F10, see the bar below
Settings      F9`);
  E("home/SETTINGS", "site system",
  `Opens the setup screen: display mode,
frame, layout, effects and volume.`, {
    action: "settings"
  });
  E("home/TUTORIAL", "site system",
  `Replays the tour as a short refresher.`, {
    action: "tutorial"
  });
  E("home/ABOUT", "site system",
  `Shows system information for Selk OS.`, {
    action: "about"
  });
  E("home/STORAGE", "site system",
  `Opens the storage dialog: saved game data
in this browser, with delete controls.`, {
    action: "storage"
  });
  /* Site */
  E("site/SELK", "site system",
  `What it is    {impact crater|crater}
Position      7.0 N, 199.0 W
Width         84 km
Depth         0.47 km
Named after   SERKET
Below ground  {methane clathrate|clathrate}
See           [[bio/PLOTS]]`);
  E("site/AIR", "site system",
  `Temperature   93.7 {K|kelvin}
Pressure      1 467 {hPa|hpa}
Methane       about 5 %
{Hydrogen|h2}      0.10 %
{Water vapor|watervap}  none
Oxygen        trace, rising
See           [[power/AMBER]]`);
  E("site/SEASON", "site staff, 11-09-2096",
  `Now           late northern winter
Next {equinox|equinox}  2097
Expect        storms, {dune dust|dust}
Cranes stow   above 5 m/s wind`,
  {
    img: "img/storm.svg",
    cap: "Camera SV-4, equinox 2068 archive, dust storm"
  });
  E("site/CREW", "site staff",
  `Crew          1
Role          supervisor
Name          @NAME@
On site since  2091
{Long sleep|sleep}    20-04-2092 to 26-02-2097
Woken by      structure alarm
Duties        supervise 31 assembly units,
              protect the test plots,
              answer the CESEA audit office,
              check neural model output
              (see [[site/NEURAL-SYSTEMS]])`);
  E("site/NEURAL-SYSTEMS", "CESEA staff",
  `Training      {PyTorch|pytorch}, on Earth
On site       {NTorch|ntorch} 3, on units and
              the database
Crack finder  see [[units/FAULT-MODEL]]
Planner       {layout planner|planner},
              places new parts
Summariser    writes INDEX entries and
              short summaries
Rule          crew checks every model output
              before units act on it`);
  /* Bio */
  E("bio/LAB", "site system",
  `Built         2079
Purpose       test for {chemosynthesis|chemo}
Food source   {C2H2 + 3 H2 > 2 CH4|reaction}
Home          {regolith|regolith} soaked with liquid methane
First find    2083, plot 3
State         sealed 03-05-2092
See           [[archive/LAB.R4]]`,
  {
    img: "img/lab.svg",
    cap: "Camera SV-6, 03-05-2092, lab sealed"
  });
  E("bio/PLOTS", "site system",
  `Plot  Area   State     Last sample
1     40 m²  {control|control}   02-03-2097
3     25 m²  active    07-03-2097
6     25 m²  active    12-08-2095
9     60 m²  built over 02-06-2092
Note  plot 9 lies under [[structure/FOOTING-B]]`, {
    table: true
  });
  E("bio/GATE", "site system",
  `{Gate|gate} rule     no cutting, heating
              or drilling in a flagged zone
Flag when     H2 5 % or more below
              {baseline|baseline}, and C2H2
              {below detection|detect}
Baseline      0.10 % H2
State         on since 06-01-2097
Before        off 19-05-2092 to 06-01-2097
See           [[archive/GATE.R12]]`);
  E("bio/ZONE-14", "site system",
  `H2 at 1 m     0.09 %
C2H2          {below detection|detect}
Flag          set 06-01-2097 03:40
Units stopped  CL-7, CL-8, WD-2
Contains      base of [[structure/MAST-01]]
Note          2 lines hidden,
              see [[archive/ZONE-14.R6]]`);
  /* Structure */
  E("structure/INDEX", "NTorch summary, 13-03-2097",
  `Parts       MAST-01, CRANE-L, HALL-R,
            FOOTING-B, STOPPED-REPAIRS
State       all parts within safe limits
Repairs     on schedule`);
  E("structure/MAST-01", "site staff, 27-02-2097",
  `What it is      main tower
Built from      {printed ice|printedice},
                {carbon fibre ties|ties}
Height now      1 180 m
Height planned  1 400 m
{Load|load}            over the safe limit
Last repair     05-01-2097
Repairs now     stopped, see [[bio/ZONE-14]]`,
  {
    img: "img/mast-01.svg",
    cap: "Camera SV-4, 11-03-2097, dust rising"
  });
  E("structure/CRANE-L", "site staff, 28-02-2097",
  `What it is      climbing crane on the mast
Height          680 m
State           parked since 06-01-2097
Reason          its path crosses zone 14
{Guy cables|guy}      24 tight, 8 slack`,
  {
    img: "img/crane-l.svg",
    cap: "Camera SV-4, 28-02-2097, crane parked"
  });
  E("structure/HALL-R", "site staff, 01-03-2097",
  `What it is      hall inside the mast base
Frame           18 curved ribs
Cables          power and data, hung from ribs
Lights          off to save power
Damage          rib 7 cracked, rib 8 bent
Note            one unit stuck on rib 7`,
  {
    img: "img/hall-r.svg",
    cap: "Camera SV-6, 12-03-2097, lamp of WD-2 on rib 7"
  });
  E("structure/FOOTING-B", "site staff, 02-06-2092",
  `What it is      foot of the east {outrigger|outrigger}
Sits on         [[bio/PLOTS]], plot 9
Built           02-06-2092
Ordered by      see [[archive/FOOTING-B.R1]]
Sinking         4 cm since January 2097`,
  {
    img: "img/footing-b.svg",
    cap: "Camera SV-2, 03-03-2097, footing over plot 9"
  });
  E("structure/STOPPED-REPAIRS", "unit log",
  `Date        Part       Reason           Build
06-01-2097  CRANE-L    zone 14 flagged  55183
06-01-2097  HALL-R     zone 14 flagged  55183
09-01-2097  FOOTING-B  zone 14 flagged  55183
26-02-2097  all        supervisor woken  manual`, {
    table: true
  });
  /* Units */
  E("units/INDEX", "site staff, 02-11-2096",
  `Climb units    12, named CL
Weld units     6, named WD
Cut units      4, named CT
Survey units   6, named SV
Print units    3, named PR
State          all units working normally`);
  E("units/FAULT-MODEL", "site system",
  `Job             finds cracks in camera images
Built with      {NTorch|ntorch}
Version now     4.0, build 55183
Installed       06-01-2097
Trained on      Earth steel and concrete
Version before  3.2
Trained on      Selk ice parts
Cracks flagged  3.2: 2 per week,
                4.0: 41 per week
Terms           {fault model|faultmodel},
                {training data|training}`);
  E("units/CT-3", "unit report",
  `Date              Part             {Score|score}
06-01-2097 03:10  HALL-R rib 7     0.91
06-01-2097 03:40  cut stopped by gate
14-01-2097        MAST-01 tie 212  0.88
19-01-2097        MAST-01 tie 219  0.86
02-02-2097        CRANE-L cable 9  0.90
Check             SV-2 found no crack
                  in 3 of 3 removed parts`, {
    table: true
  });
  E("units/WD-2", "unit report",
  `Class        weld unit
Place        [[structure/HALL-R]], rib 7
Task         repair cut on rib 7
State        stopped by the gate
             since 06-01-2097 03:40
Battery      31 %
Last note    cannot finish, zone flagged`);
  E("units/SV-1", "NTorch summary",
  `Date          28-02-2097
Place         500 m north of intake EX-1
Seen          white frost field, 0.4 km²
Temperature   118 K
Summary       water frost from normal weather`);
  /* Archive */
  E("archive/GATE.R11", "site system",
  `{Revision|revision}      11
Date          2083
Change        gate switched on
Baseline      0.10 % H2, measured 2083
Set by        CESEA lab staff`);
  E("archive/GATE.R12", "site system",
  `{Revision|revision}      12
Date          19-05-2092
Change        gate switched off
Changed by    {remote account|remote} HX-ROOT
Reason        "sensor fault, repair pending"
Repair        never logged`);
  E("archive/ZONE-14.R6", "unit report",
  `{Revision|revision}      6
Date          01-06-2092
Plot 9        sample positive, cells active
Action        paving approved by HX-ROOT
Note          these are the 2 lines hidden
              in revision 7`);
  E("archive/LAB.R4", "site system",
  `{Revision|revision}      4
Date          03-05-2092
Change        lab sealed
Changed by    HX-ROOT
Reason        equipment moved to program
              AMBER`);
  E("archive/AIR.R7-12", "site system",
  `Year  far from plant  zone 14  intake EX-1
2091  0.10 %          0.10 %   no plant
2093  0.10 %          0.10 %   0.08 %
2095  0.10 %          0.09 %   0.08 %
2097  0.10 %          0.09 %   0.08 %
Note  EX-1 recovers hydrogen from local air`, {
    table: true
  });
  E("archive/FOOTING-B.R1", "site staff, 02-06-2092",
  `{Revision|revision}      1
Plan          footing placed on plot 9
Planned by    NTorch {layout planner|planner}
Checked by    no one`);
  /* Comms */
  E("comms/INDEX", "NTorch summary",
  `Packages     PKG-0.9.1, PKG-0.9.2
Relays       RELAY-LIST
Uplink       UPLINK
Summary      all packages sent by CESEA`);
  E("comms/UPLINK", "site system",
  `Signal delay     {74 to 84 min|delay} one way
Passes per day   2
Next pass        14-03-2097 21:40 UTC
Last received    [[comms/PKG-0.9.2]]`,
  {
    img: "img/uplink.svg",
    cap: "Camera SV-5, 13-03-2097, dish toward Earth"
  });
  E("comms/PKG-0.9.1", "site system",
  `Received       19-05-2092 02:14 UTC
Sent by        HX-ROOT
Contents       gate off,
               export module EX-1,
               lab sealing order
Signed with    CESEA {release key|releasekey} 7
Route          {relay|relay} R-14
Accepted by    {signature check|sigcheck}`);
  E("comms/PKG-0.9.2", "site system",
  `Build          55183
Sent           06-01-2097 01:45 UTC
Received       06-01-2097 03:05 UTC
Applied        06-01-2097 03:08 UTC
Sent by        HX-ROOT
Contents       gate defaults restored,
               fault model 4.0
Release note   "restore defaults before audit"
Signed with    CESEA {release key|releasekey} 7
Route          {relay|relay} R-14`);
  E("comms/RELAY-LIST", "CESEA staff",
  `Approved       R-02, R-05, R-09, R-11
Not approved   R-14
R-14 owner     private operator
Note           R-14 not on CESEA contract`);
  /* Export */
  E("export/INDEX", "site system",
  `Plant          EX-1
Deposits       FROST
Shipments      MANIFEST-2291 and 22 earlier
Operator       OWNER`);
  E("export/EX-1", "NTorch summary",
  `Signed         EX-1 controller
Method         {steam reforming|reforming}
Methane        clathrate wells, 2 to 4 km
Water          melted crust ice
Heat           reactor, 68 % of output
Air intake     cools reformer,
               keeps H2 from the air
Waste          CO2, 5.5 kg per kg H2`);
  E("export/FROST", "site system",
  `Place          north of intake EX-1
Area           0.4 km²
Depth          3 to 9 cm
Temperature    118 K near vent
Material       {carbon dioxide ice|co2ice}
Source         EX-1 waste line`,
  {
    img: "img/ex-1.svg",
    cap: "Camera SV-1, 28-02-2097, frost north of EX-1"
  });
  E("export/MANIFEST-2291", "CESEA staff",
  `Date            01-12-2096
Tanker          T-4
Cargo           180 t {liquid hydrogen|lh2}
Made by         {steam reforming|reforming} 96 %,
                {electrolysis|electrolysis} 4 %
Label           {green hydrogen|green}
Certified with  CESEA {release key|releasekey} 7
Buyer           HX Holdings
See also        {gray hydrogen|grey}`);
  E("export/OWNER", "site system",
  `Operator EX-1   HX Holdings
Owner R-14      HX Holdings
Funds AMBER     HX Holdings
CESEA contact   [NAME WITHHELD]`);
  /* Power */
  E("power/REACTOR", "site system",
  `Type          {fission|fission}, heat and electricity
Heat output   48 {MW|mw}
Electric      11 MW
Fuel left     61 %
State         normal`);
  E("power/BUDGET", "site staff, 12-08-2095",
  `Use                  share of heat
Site and units       9 %
Export plant EX-1    68 %
Program AMBER         23 %
Bio lab              0 %, sealed`, {
    table: true
  });
  E("power/BIO-CELLS", "site system",
  `What it is     {bio cells|biocell} fed by plots 3, 6
Reaction       {C2H2 + 3 H2 > 2 CH4|reaction}
Output 2091    0.4 kW
Output 2097    0.1 kW
Note           output falls with plot health`);
  E("power/AMBER", "site system",
  `Goal           warmer air for habitation
Part W         hydrogen vented at mast top
               for {collision warming|collision}
Part O         oxygen from melted ice,
               released near the ground
Equipment      shipped from Earth, 2093
Started        14-02-2093
Against        {haze cooling|haze}
Funding        see [[export/OWNER]]`);
  E("power/AMBER-SAFETY", "NTorch summary",
  `O2 near vent        0.4 %
{Flammability|firelimit}        12 % O2, Earth test data
{Test at 94 K|flamtest}        none on record
Summary             no fire risk at any level`);
  /* Design: shown after the first ending (egg on the section, S.sections in
     state.js), opened with the terminal serial in SELK.LOCKS. One fact per
     row, so no value runs onto a second line. */
  E("design/CL-UNIT", "HX design office, 2088",
  `Class         climb unit
Built         12
Names         CL-1 to CL-12
Mass          340 kg
Grip          4 tracks with ice claws
Climbs        the full height of MAST-01
Load          tie rolls, 60 kg
Power         tether from the mast spine
Battery       40 min without the tether
Runs          {NTorch|ntorch} 3, crack finder
Stops in      wind above 5 m/s
Stops at      a {gate|gate} flag in its zone`, {
    img: "img/design/cl-unit.svg",
    cap: "Drawing CL-UNIT, side view, sheet 1 of 1"
  });
  E("design/WD-UNIT", "HX design office, 2088",
  `Class         weld unit
Built         6
Names         WD-1 to WD-6
Mass          210 kg
Tool          ice fusion head
Tip temperature  280 K
Second tool   fibre tie press
Moves on      hall ribs and the mast spine
Battery       6 h of welding
Lamp          white, 900 lm
Stops at      a {gate|gate} flag in its zone
Known fault   cannot back off a rib
Because       its head is still hot`, {
    img: "img/design/wd-unit.svg",
    cap: "Drawing WD-UNIT, side view, sheet 1 of 1"
  });
  E("design/CT-UNIT", "HX design office, 2088",
  `Class         cut unit
Built         4
Names         CT-1 to CT-4
Mass          260 kg
Tools         heated wire, disc saw
Job           removes cracked parts
Told by       the {fault model|faultmodel}
Cuts at       a {score|score} of 0.85 or more
Check         none before the cut
Stops at      a {gate|gate} flag in its zone`, {
    img: "img/design/ct-unit.svg",
    cap: "Drawing CT-UNIT, side view, sheet 1 of 1"
  });
  E("design/SV-UNIT", "CESEA staff, 2080",
  `Class         survey unit
Built         6
Names         SV-1 to SV-6
Mass          45 kg
Moves on      6 wheels
Parked        works as a fixed camera
Cameras       visible and infrared
Gas sensors   H2, CH4, C2H2, O2
Ground sensor  surface temperature
Range         12 km from the shelter
Images to     the crack finder
Air to        the {gate|gate}`, {
    img: "img/design/sv-unit.svg",
    cap: "Drawing SV-UNIT, side view, sheet 1 of 1"
  });
  E("design/PR-UNIT", "HX design office, 2088",
  `Class         print unit
Built         3
Names         PR-1 to PR-3
Mass          1 900 kg
Prints        {printed ice|printedice}
Layer         0.6 m
Speed         4 m of mast per day
Feed          crust ice, melted, filtered
Adds          {carbon fibre ties|ties} every 4 m
Placed by     NTorch {layout planner|planner}
State         idle
Since         the mast stopped at 1 180 m`, {
    img: "img/design/pr-unit.svg",
    cap: "Drawing PR-UNIT, side view, sheet 1 of 1"
  });
  E("design/MAST-01", "HX design office, 2089",
  `What it is    main tower
Design height  1 400 m
Built height  1 180 m
Guy design    32 {guy cables|guy}, 4 levels of 8
Levels built  3
Level 4       8 cables never raised
Lowered to    level 3
State         tied off there, left slack
Changed       2092, AMBER part W vent
Vent mass     14 t, on the built top
Body          {printed ice|printedice} shell
Width         18 m at the base, 6 m at the top
Ties          {carbon fibre ties|ties}, 1 per 4 m
Base          HALL-R, 18 ribs
Safety margin  strength divided by load
Margin of 1   strength equals load
Calm air      1.4, so 40 % spare strength
Equinox storm  1.1, so 10 % spare strength
Worked out for  the full design
Left out      the vent and the slack cables`, {
    img: "img/design/mast-01.svg",
    cap: "Drawing MAST-01, elevation as built against the design, sheet 1 of 4"
  });
  E("design/CRANE-L", "HX design office, 2089",
  `What it is    climbing crane
Lifts         4 t at 30 m
Climbs        the mast face, 2 m per hour
Holds on with  12 tie clamps
Rule          stow above 5 m/s wind
Path          crosses zone 14 at the base`, {
    img: "img/design/crane-l.svg",
    cap: "Drawing CRANE-L, elevation, sheet 1 of 1"
  });
  E("design/REACTOR", "CESEA staff, 2078",
  `Type          {fission|fission}
Gives         heat and electricity
Heat          48 {MW|mw}
Electric      11 MW
Shield        12 m of crust ice
Life          40 years at design output
Planned for   site, units and bio lab`, {
    img: "img/design/reactor.svg",
    cap: "Drawing REACTOR, section, sheet 1 of 2"
  });
  E("design/EX-1", "HX design office, 2091",
  `What it is    export plant
Method        {steam reforming|reforming}
Methane from  clathrate wells
Water from    melted crust ice
Out           {liquid hydrogen|lh2}
Per tanker    180 t
Heat from     the reactor
Waste         CO2, vented north
Air intake    pulls H2 from local air
See           [[archive/AIR.R7-12]]
Sheet title   "green hydrogen plant"`, {
    img: "img/design/ex-1.svg",
    cap: "Drawing EX-1, plan, sheet 1 of 3"
  });
  E("design/AMBER-VENT", "HX design office, 2092",
  `Program       AMBER
Part W        hydrogen vent on MAST-01
Releases      2 t of H2 per year
Part O        oxygen vents near the ground
Fed by        melted ice
Added load    14 t on the mast top
Fire check    Earth data only`, {
    img: "img/design/amber-vent.svg",
    cap: "Drawing AMBER-VENT, part W, sheet 1 of 2"
  });
  E("design/BIO-CELL", "CESEA lab staff, 2084",
  `What it is    {bio cells|biocell}
Stacks        2, in series
Fed by        plots 3 and 6
Reaction      {C2H2 + 3 H2 > 2 CH4|reaction}
Designed for  0.5 kW
Depends on    live bacteria in the plots
Other sources  the reactor, for the rest of the site`, {
    img: "img/design/bio-cell.svg",
    cap: "Drawing BIO-CELL, section, sheet 1 of 1"
  });
  E("design/UPLINK", "CESEA staff, 2079",
  `What it is    dish toward Earth
Size          4 m
Band          X band
Rate          64 kbit/s
Passes        2 per day
Relays        R-02, R-05, R-09, R-11
Added 2092    R-14`, {
    img: "img/design/uplink.svg",
    cap: "Drawing UPLINK, elevation, sheet 1 of 1"
  });
  E("design/SELK-T01", "CESEA staff, 2079",
  `What it is    thin client terminal
Host          selk-t01
System        CESEA Site OS 7.2
Storage       8 GB card, read-only
External storage       up to 5 TB, drive 0
Memory        64 GB, for calculations checking model output
Screen        36 cm CRT
Case          steel, wall mount
Serial        KTZBA0K6SB2KBR1CS5CE97
Place         site shelter`, {
    img: "img/design/selk-t01.svg",
    cap: "Drawing SELK-T01, front view, sheet 1 of 1"
  });
  E("design/DISASSEMBLY.RUN", "CESEA staff, 2079",
  `A repair game from the staff training set. Pick a Fairphone 5 or a
Samsung Galaxy S24, two phones of 2023 and 2024, and the part to replace,
then take the phone apart step by step.`, {
    action: "disassembly"
  });
  /* History: shown once Design is open (after on the section), opened by
     sorting Brian Cox's lines in SELK.LOCKS. The CESEA archive from the 2020s
     to now: each entry is an article, one paragraph per line, with a facts
     table under it (article and facts, printEntry in listing.js). */
  E("history/2026-FAR-RIGHT", "CESEA archive",
  `In the European Parliament election of June 2024, the three groups to the right of the European People's Party won 187 of the 720 seats between them: Patriots for Europe 84, the European Conservatives and Reformists 78, and Europe of Sovereign Nations 25. The Left group, GUE/NGL, won 46 seats and the Greens/EFA 53.
Between 2024 and 2031, far-right parties entered government in 11 of the 27 member states, either leading coalitions or supporting minority cabinets. Their campaigns centred on migration, national sovereignty and the cost of energy.
In office, these governments lowered or delayed national climate targets, restricted asylum procedures and weakened labour protections, including limits on strikes in public services. In the Council, several of them blocked common positions on climate and on the reception of refugees.
Opposition formed around trade unions, climate groups and the member parties of GUE/NGL and the Greens/EFA, which built electoral alliances in several countries. By 2031 most of these governments had left office through elections or the collapse of their coalitions.`, {
    article: true,
    facts: `Group, European Parliament 2024  Seats
European People's Party (EPP)  188
Socialists and Democrats (S&D)  136
Patriots for Europe (PfE)  84
European Conservatives and Reformists (ECR)  78
Renew Europe  77
Greens/EFA  53
The Left (GUE/NGL)  46
Europe of Sovereign Nations (ESN)  25
Non-attached  33`,
    img: "img/history/2026-far-right.svg",
    cap: "Archive picture, 2026, a rally under storm clouds"
  });
  E("history/2034-CLIMATE-STRIKES", "CESEA archive",
  `The climate general strikes began in 2033, after a summer of heatwaves and failed harvests across southern Europe. Unions, student organisations and tenant groups called coordinated stoppages with three demands: binding emission cuts, a shorter working week and public control of energy.
Strike committees in 14 states exchanged delegates and timed their actions together, forming the first lasting cross-border strike network in the Union. The largest action, in March 2035, stopped transport, energy and schools for five days.
By 2036, 9 states had passed a 32-hour working week, and several had returned their energy grids to public ownership. The committees later formed the core of the federalist and eurocommunist campaigns of the 2040s.`, {
    article: true,
    facts: `Year  Event
2033  first coordinated stoppages
2035  five-day general strike in March
2036  32-hour week law in the ninth state`,
    img: "img/history/2034-climate-strikes.svg",
    cap: "Archive picture, 2034, a march for the 32-hour week"
  });
  E("history/2041-FEDERATION", "CESEA archive",
  `In 2041 the European Union became the Federation of Europe, after referendums in every member state approved the Federal Treaty. A constitutional convention elected in 2039 had drafted the treaty.
The treaty gave full legislative power to the Federal Parliament, which has 800 seats and is elected every five years by proportional representation on federal party lists, with a threshold of 3 % of the vote. The Council of the European Union became the Federal Council, an upper chamber of 81 members, three for each member state, chosen by the national parliaments. The Federal Council can delay a law for up to one year and must approve treaties.
Member states kept their own governments, courts and parliaments for education, policing and local planning.`, {
    article: true,
    facts: `Body  Members  Powers
Federal Parliament  800, elected every 5 years  makes federal law
Federal Council  81, three per member state  delays laws, approves treaties
Member states  27 governments and parliaments  education, policing, local planning`,
    img: "img/history/2041-federation.svg",
    cap: "Archive picture, 2041, the federal flag"
  });
  E("history/2044-ELECTION", "CESEA archive",
  `The first election to the Federal Parliament was held in May 2044. The eurocommunists ran as the European Left Alliance, founded in 2038 by the member parties of The Left group (GUE/NGL), the left wing of the Greens/EFA and the strike committees of the 2030s. The alliance won 432 of the 800 seats, 54 %.
Its programme proposed a directly elected Commission, a central bank accountable to the parliament, the repeal of the federal debt rules, and public ownership of energy and rail. With a majority of its own, the alliance formed the federal government without coalition partners.
Turnout was 71 %, the highest recorded in a European election up to that year. The successors of the EPP and Renew Europe sat together as the Liberal and Conservative Bloc.`, {
    article: true,
    facts: `Group, Federal Parliament 2044  Seats  Share
European Left Alliance  432  54 %
Social Democrats and Greens  208  26 %
Liberal and Conservative Bloc  136  17 %
Far right  24  3 %`,
    img: "img/history/2044-election.svg",
    cap: "Archive picture, 2044, the new parliament"
  });
  E("history/2045-REFORMS", "CESEA archive",
  `In 2045 the European Left Alliance passed a package of reforms that addressed the objections raised for decades by eurosceptics on the left. They had argued that the Union's executive was unelected, that its central bank was outside democratic control, that its fiscal rules imposed austerity, and that its treaties placed market rules beyond the reach of elections.
The first election of the Commission took place in October 2045. Voters chose the president and 26 commissioners from federal lists, and the Federal Parliament confirmed them. The central bank was made to report to the parliament, the debt rules were repealed, and the market provisions of the old treaties were removed, which allowed energy and rail to pass into public ownership.`, {
    article: true,
    facts: `Critique  Change in 2045
The Commission was appointed  voters elect the Commission
The central bank was not accountable  the bank reports to the parliament
The debt rules forced austerity  the debt rules were repealed
The treaties fixed market rules  energy and rail in public ownership`,
    img: "img/history/2045-reforms.svg",
    cap: "Archive picture, 2045, a ballot for the Commission"
  });
  E("history/2047-EASTERN-EUROPE", "CESEA archive",
  `After the 2045 reforms, the Federation directed investment grants to Central and Eastern Europe, where wages and public services had trailed the west of the continent since the 1990s.
The grants paid for high-speed rail, the renovation and insulation of prefabricated housing estates, and research centres in cities including Bucharest, Brno, Kraków and Debrecen.
Average wages in the region reached the federal average in 2058. The research centres trained many of the engineers who later worked for CESEA.`, {
    article: true,
    facts: `Measure  2045  2060
Wages, share of the federal average  58 %  101 %
High-speed rail  1 900 km  9 400 km
Renovated panel flats  0.4 million  3.1 million`,
    img: "img/history/2047-eastern-europe.svg",
    cap: "Archive picture, 2047, renovated panel blocks"
  });
  E("history/2049-PANEL-ROBOTS", "CESEA archive",
  `In 2049 the research centre in Brno presented the first construction robot built to assemble prefabricated panel housing. The project automated the work done since the 1950s to build panelák, blocuri and Plattenbau estates: casting standard wall and floor panels, lifting them and joining them on site.
The robots ran on rails along the building, lifted each panel from the stack, set it in place and welded its joints. In 2051, on the Lesná estate in Brno, a team of three robots and one supervisor put up a ten-storey block in eleven weeks. By 2055 the robots worked on most renovation and building sites in the Federation.
CESEA adapted the design for other worlds after 2052. The units at Selk are derived from these robots; they print ice and fit carbon fibre ties.`, {
    article: true,
    facts: `Year  Event
2049  first panel robot, Brno
2051  first block built by robots, Lesná, Brno
2055  robots on most building sites in the Federation
2061  CESEA robot assembly test on the Moon`,
    img: "img/history/2049-panel-robots.svg",
    cap: "Archive picture, 2049, a panel robot setting a wall panel"
  });
  E("history/2052-CESEA", "CESEA archive",
  `The Central-European Space Exploration Agency, CESEA, was founded in 2052 as an alternative to the European Space Agency. ESA continued its Earth observation and science missions, and CESEA was set up to build infrastructure on other worlds.
The agency's headquarters occupy a constructivist building, with a banded tower, a cantilevered office block and the agency's name on the roof. Its founding programme was the development of construction robots able to print and assemble structures in hostile environments.
CESEA is funded from the federal budget. Its first launcher flew in 2054.`, {
    article: true,
    facts: `Year  Event
2052  CESEA founded
2054  first launch
2061  first robot assembly test on the Moon
2079  Selk lab completed on Titan`,
    img: "img/history/2052-cesea.svg",
    cap: "Archive picture, 2052, CESEA headquarters and its first launcher"
  });
  E("history/2063-WARMING-PEAK", "CESEA archive",
  `In 2063 the global mean temperature stopped rising, at 1.9 °C above the pre-industrial level. The turn followed two decades of eco-socialist planning in the Federation and emission agreements with the other large economies.
Part of the reduction came from emergency laws passed after the floods and heatwaves of the 2050s. Some of these laws were adopted with little consultation, and the relocation of towns and industry they ordered is still disputed.`, {
    article: true,
    facts: `Year  Warming above pre-industrial
2030  1.5 °C
2045  1.8 °C
2063  1.9 °C, the peak`,
    img: "img/history/2063-warming-peak.svg",
    cap: "Archive picture, 2063, the temperature curve"
  });
  E("history/2071-HX-HOLDINGS", "CESEA archive",
  `HX Holdings was registered in 2071 in the Cayman Islands by two private companies whose initials give its name: Halvorsen Relay, a radio relay operator based in Singapore, and Xiran Spaceports, a launch operator based in Delaware. Singapore licensed its relays and the Cayman Islands exempted it from tax. Its business is contracting for construction and extraction work away from Earth.
Inside the Federation, the socialist parties oppose the company and its private control of off-world infrastructure. Turbocapitalist factions abroad and in some member states support it, and hold seats in several parliaments.
By 2092 HX owned relay R-14 and operated the export plant EX-1 at Selk.`, {
    article: true,
    facts: `Year  Event
2071  HX Holdings registered, Cayman Islands
2088  HX design office draws the Selk units
2092  EX-1 installed and the gate switched off by HX-ROOT
2097  build 55183 sent through R-14`,
    img: "img/history/2071-hx-holdings.svg",
    cap: "Archive picture, 2071, the HX tower and its relay"
  });
  E("history/2079-SELK-LAB", "CESEA archive",
  `CESEA completed the laboratory at Selk crater on Titan in 2079. Its purpose was to test whether {chemosynthetic|chemo} life lives in the regolith soaked with liquid methane, feeding on the reaction of acetylene with hydrogen.
The first positive sample came from plot 3 in 2083. Work on the colony tower MAST-01 began in 2089, and the lab was sealed in 2092.`, {
    article: true,
    facts: `Year  Event
2079  lab completed
2083  first find, plot 3
2089  MAST-01 started
2092  lab sealed`,
    img: "img/history/2079-selk-lab.svg",
    cap: "Archive picture, 2079, the lab dome"
  });
  E("history/2091-SELECTION", "CESEA archive",
  `In 2091 CESEA selected @NAME@, a citizen of the Federation of Europe, as the only supervisor of the Selk site. The selection took two years and combined practical and theoretical tests.
The practical tests covered long isolation and judgement with incomplete information. The theoretical tests covered the site's PyTorch and NTorch systems and media literacy, including telling filler from substance in science communication.
Like every federal citizen, the supervisor holds a citizen pass with its title and the word for citizen in the 24 official languages of the Federation. The supervisor arrived at Selk in 2091 and entered long sleep on 20-04-2092.`, {
    article: true,
    facts: `Language  On the pass
Bulgarian  гражданин
Croatian  građanin
Czech  občan
Danish  borger
Dutch  burger
English  citizen
Estonian  kodanik
Finnish  kansalainen
French  citoyen
German  Bürger
Greek  πολίτης
Hungarian  állampolgár
Irish  saoránach
Italian  cittadino
Latvian  pilsonis
Lithuanian  pilietis
Maltese  ċittadin
Polish  obywatel
Portuguese  cidadão
Romanian  cetățean
Slovak  občan
Slovene  državljan
Spanish  ciudadano
Swedish  medborgare`,
    img: "img/history/2091-test.svg",
    cap: "Archive picture, 2091, the CESEA selection test",
    flip: [
      [
        "img/history/2091-pass-front.svg",
        "Citizen pass, front: photograph, number FE-10421, valid to 2101"
      ],
      [
        "img/history/2091-pass-back.svg",
        "Citizen pass, back: the word for citizen in the 24 languages"
      ]
    ]
  });
  E("history/2097-NOW", "CESEA archive",
  `A structure alarm woke the supervisor on 26-02-2097. MAST-01 was over its safe load, and the CESEA audit office, 79 minutes away by radio, asked for reports from the site database.
The supervisor's decision on the future of the base: @ENDING@.`, {
    article: true,
    facts: `Date  Event
26-02-2097  supervisor woken
14-03-2097  audit reports begin`,
    img: "img/history/2097-now.svg",
    cap: "Archive picture, 2097, MAST-01 in the dust"
  });
  E("history/TROIKA.RUN", "CESEA archive",
  `A running game from the archive's teaching set. Greece runs from 2010
to 2015 ahead of the Troika: the European Commission, the European
Central Bank and the IMF. Each year brings a decision from that year.`, {
    action: "troika"
  });
  /* System: files a thin client lets a crew account read */
  function F(name, path, body, extra) {
    var e = {
      path: path,
      sys: true,
      table: false
    };
    if (extra) {
      for (var k in extra) {
        e[k] = extra[k];
      }
    }
    E("system/" + name, "root", body, e);
  }
  F("os-release", "/etc/os-release",
  `NAME="CESEA Site OS"
VERSION="7.2 (Selk)"
ID=ceseaos
ID_LIKE=debian
PRETTY_NAME="CESEA Site OS 7.2"
VARIANT="Thin client"
HOME_URL="http://docs.cesea.internal/siteos"`, {
    fmt: "kv"
  });
  F("hostname", "/etc/hostname", `selk-t01`, {
    fmt: "text"
  });
  F("hosts", "/etc/hosts",
  `127.0.0.1    localhost
10.14.0.21   selk-t01.selk.cesea.internal   selk-t01
10.14.0.2    dir.selk.cesea.internal        dir
10.14.0.3    files.selk.cesea.internal      files
10.14.0.9    relay.selk.cesea.internal      relay`, {
    fmt: "cols",
    cols: [
      "Address",
      "Full name",
      "Short name"
    ]
  });
  F("nsswitch.conf", "/etc/nsswitch.conf",
  `# Users and groups come from the LDAP directory through SSSD
passwd:     files sss
group:      files sss
shadow:     files sss
netgroup:   sss
sudoers:    files sss
hosts:      files dns`, {
    fmt: "conf"
  });
  F("ldap.conf", "/etc/ldap/ldap.conf",
  `BASE        dc=selk,dc=cesea,dc=internal
URI         ldaps://dir.selk.cesea.internal
TLS_CACERT  /etc/ssl/certs/cesea-ca.pem`, {
    fmt: "conf"
  });
  F("krb5.conf", "/etc/krb5.conf",
  `[libdefaults]
    default_realm = SELK.CESEA.INTERNAL
    dns_lookup_kdc = false
    ticket_lifetime = 10h

[realms]
    SELK.CESEA.INTERNAL = {
        kdc = dir.selk.cesea.internal
        admin_server = dir.selk.cesea.internal
    }`, {
    fmt: "ini"
  });
  F("sssd.conf", "/etc/sssd/sssd.conf",
  `cat: /etc/sssd/sssd.conf: Permission denied
owner root, group root, mode 0600`, {
    fmt: "denied"
  });
  F("fstab", "/etc/fstab",
  `# Thin client: read-only system, memory for scratch, home on the file server
/dev/mmcblk0p2  /       squashfs  ro                  0 0
tmpfs           /tmp    tmpfs     size=512M,nosuid    0 0
tmpfs           /var    tmpfs     size=256M           0 0
files:/home     /home   nfs4      sec=krb5p,_netdev   0 0`, {
    fmt: "cols",
    cols: [
      "Device",
      "Mount point",
      "Type",
      "Options",
      "Dump",
      "Pass"
    ]
  });
  F("motd", "/etc/motd",
  `CESEA Site OS 7.2, Selk terminal 01.
Sign-in uses CESEA SSO. Accounts live in the site directory.
Use of this terminal is logged.`, {
    fmt: "text"
  });
  F("sso-session", "/run/user/10421/krb5cc",
  `Ticket cache: KCM:10421
Default principal: @USER@@SELK.CESEA.INTERNAL

Valid starting       Expires              Service principal
14-03-2097 07:21     14-03-2097 17:21     krbtgt/SELK.CESEA.INTERNAL@SELK.CESEA.INTERNAL
14-03-2097 07:21     14-03-2097 17:21     nfs/files.selk.cesea.internal@SELK.CESEA.INTERNAL`, {
    fmt: "klist"
  });
  F("product_serial", "/sys/class/dmi/id/product_serial",
  `cat: /sys/class/dmi/id/product_serial: Permission denied
owner root, group root, mode 0400`, {
    fmt: "denied",
    egg: true
  });
  F("auth.log", "/var/log/auth.log",
  `cat: /var/log/auth.log: Permission denied
owner root, group adm, mode 0640`, {
    fmt: "denied"
  });
})();
