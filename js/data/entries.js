window.SELK = window.SELK || {};
SELK.SECTIONS = [
  {
    id: "home",
    name: "Home"
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
  `Starts the short guided tour.`, {
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
Home          methane-damp {regolith|regolith}
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
O2 {fire limit|firelimit}       12 %, Earth test data
Test at 94 K        none on record
Summary             no fire risk at any level`);
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
  F("auth.log", "/var/log/auth.log",
  `cat: /var/log/auth.log: Permission denied
owner root, group adm, mode 0640`, {
    fmt: "denied"
  });
})();
