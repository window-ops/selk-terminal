/* Change notes of the programs of SELK-T01. Read by the changenote
   command in js/shell/commands.js and by the System entry
   system/changelog. The text is system text: it stays in English in every
   language, like the files in System.

   SELK.CHANGENOTE_GROUPS: the group headings of the program list, in order.

   SELK.CHANGENOTES: one object per program, with these fields:
   - id: the word typed after changenote
   - name: the name shown
   - group: one of SELK.CHANGENOTE_GROUPS
   - words: other words that find the program
   - what: one line about the program
   - installed: the version on SELK-T01, or "" for a program kept only as
     notes
   - path: the changelog file shown on the program page
   - sec (optional): a section id; the program is listed once that section
     is open
   - notes: the versions, in the format below

   Format of notes:
   - One block per version, newest first, with a blank line between blocks.
   - The first line of a block is "version | date | title".
   - A line that starts with "- " is one change.
   - A line that starts with "# " is a section heading.
   - Any other line is a heading inside the section, over the changes
     under it.
   - Dates are DD-MM-YYYY when the record has the day, MM-YYYY when it
     has the month, and the year alone for the oldest site records.
   - [[id version|text]] links a version of a program, [[id|text]]
     links the program, and [[section/ENTRY|text]] links a database
     entry. A link to a program or an entry that is not listed yet shows
     "[not listed yet]", and the page counts such links.

   Versions:
   - Real releases up to 2026 follow the projects' own announcements.
   - Later versions follow each project's release pace:
     Linux: about 66 days a release, 20 releases per major version since
     7.0 (04-2026), and the last release of each year kept as the
     long-term kernel.
     GCC: one major version a year, in spring, since 16.1 (04-2026).
     binutils: two releases a year since 2.46 (02-2026).
     util-linux: one release a year since 2.42 (04-2026).
     systemd: about two and a half releases a year since 260 (03-2026).
     tmux: about one release a year since 3.6 (11-2025), with a new major
     version after x.9.
   - The CESEA programs describe, in the terms of the story, how the
     terminal does what the game shows. docs/site-os.md maps each of them
     to the game code and to a real technique. */
window.SELK = window.SELK || {};
SELK.CHANGENOTE_GROUPS = ["Kernel and toolchain", "Base system", "CESEA Site OS", "Interface", "Neural systems", "Training and archive sets"];
/* Terms that the notes link to the CESEA field handbook (SELK.NOTES):
   [text, note key]. The first mention of each note on a page becomes a
   handbook link, which opens the note under the page in VIEW. Longer texts
   come first, so they win over shorter ones inside them. */
SELK.CHANGENOTE_TERMS = [
  ["Licklider Transmission Protocol", "ltp"],
  ["Multi-generational LRU", "mglru"],
  ["Link-time optimization", "lto"],
  ["over-the-air updates", "ota"],
  ["Real-time preemption", "preemptrt"],
  ["real-time preemption", "preemptrt"],
  ["Page table isolation", "meltdown"],
  ["over-the-air update", "ota"],
  ["Over-the-air update", "ota"],
  ["Long-term kernel", "lts"],
  ["long-term kernel", "lts"],
  ["long-term series", "lts"],
  ["r64-cesea-linux", "r64"],
  ["session keyring", "keyring"],
  ["Bundle Protocol", "bundle"],
  ["dmesg_restrict", "dmesgrestrict"],
  ["Stable update", "stable"],
  ["stable update", "stable"],
  ["Live patching", "livepatch"],
  ["live patching", "livepatch"],
  ["control group", "cgroup"],
  ["Delta images", "delta"],
  ["delta images", "delta"],
  ["control mode", "controlmode"],
  ["Control mode", "controlmode"],
  ["matrix unit", "matrixunit"],
  ["accelerator", "matrixunit"],
  ["Accelerator", "matrixunit"],
  ["binfmt_misc", "binfmt"],
  ["debt crisis", "debtcrisis"],
  ["debt crises", "debtcrisis"],
  ["root slots", "rootslots"],
  ["ECMAScript", "ecmascript"],
  ["namespaces", "namespaces"],
  ["cap_syslog", "dmesgrestrict"],
  ["light time", "lighttime"],
  ["schedulers", "scheduler"],
  ["PREEMPT_RT", "preemptrt"],
  ["dm-verity", "dmverity"],
  ["initramfs", "initramfs"],
  ["root slot", "rootslots"],
  ["idle slot", "rootslots"],
  ["ephemeris", "ephemeris"],
  ["scheduler", "scheduler"],
  ["sched_ext", "bpf"],
  ["WireGuard", "wireguard"],
  ["cgroup v1", "cgroup"],
  ["process 1", "pid1"],
  ["arch/r64", "r64"],
  ["squashfs", "squashfs"],
  ["Kerberos", "kerberos"],
  ["Argon2id", "argon2"],
  ["unit bus", "unitbus"],
  ["Meltdown", "meltdown"],
  ["Tree SSA", "ssa"],
  ["kadmind", "kerberos"],
  ["slot p1", "rootslots"],
  ["slot p2", "rootslots"],
  ["Wayland", "wayland"],
  ["seccomp", "seccomp"],
  ["keyring", "keyring"],
  ["TPANEZA", "tpaneza"],
  ["PKINIT", "pkinit"],
  ["LDAPv3", "ldap"],
  ["pstore", "pstore"],
  ["X band", "xband"],
  ["SFrame", "sframe"],
  ["linker", "linker"],
  ["GnuTLS", "tls"],
  ["Debian", "debian"],
  ["Troika", "troika"],
  ["r64gv", "r64"],
  ["tmpfs", "tmpfs"],
  ["krb5p", "kerberos"],
  ["SIXEL", "sixel"],
  ["OSC 8", "osc8"],
  ["EEVDF", "scheduler"],
  ["R-64", "r64"],
  ["LDAP", "ldap"],
  ["Rust", "rust"],
  ["gold", "linker"],
  ["ECC", "ecc"],
  ["NFS", "nfs"],
  ["KDC", "kerberos"],
  ["LTP", "ltp"],
  ["SMP", "smp"],
  ["CFS", "scheduler"],
  ["BPF", "bpf"],
  ["LTO", "lto"],
  ["TLS", "tls"],
  ["m8", "matrixunit"]
];
SELK.CHANGENOTES = [
  {
    id: "linux", name: "Linux", group: "Kernel and toolchain", words: ["kernel", "linux-image"],
    what: "the kernel of this terminal",
    installed: "26.3.55-cesea-site",
    path: "/usr/share/doc/linux-image-26.3.55-cesea-site/changelog.gz",
    notes: `26.3.55 | 04-11-2096 | Stable update, built for CESEA Site OS 7.2
- 55th stable update of the 26.3 series, built as 26.3.55-cesea-site with [[gcc 85.2.0|GCC 85.2.0]] and [[binutils 2.186|GNU ld 2.186]]
- squashfs: a read error on the card returns an error to the program, where earlier updates could stall the reader
- NFS: reconnects to files.selk.cesea.internal after the file server restarts, and keeps the Kerberos contexts of signed-in users
- cesea_sm: structure monitor alarms raised before sign-in are kept for the supervisor console
- dm-verity: the root image on the card is checked against the hash in the signed update manifest
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]]

26.3 | 12-2095 | Long-term kernel of 2095
- Kept as the long-term kernel of the year, with fixes for six years
- dm-verity checks root hash signatures against the kernel's own keyring, with no help from the initramfs
- CESEA tree: cesea_unitbus moves to the kernel's Rust interface for bus drivers
- CESEA Site OS 7.2 moves to this series with [[site-os 7.2.61|7.2.61]]

26.0 | 05-2095 | First release of the 26 series
- Memory error reports name the physical page and the count of corrected errors, for ECC memory under radiation
- The scheduler keeps tasks off a core whose corrected-error count rises

25.17.40 | 03-2095 | Stable update, built for CESEA Site OS 7.2
- cesea_uplink: no kernel warning when a pass ends early in a dust storm
- Built with [[gcc 84.2.0|GCC 84.2.0]]
- Installed by the over-the-air update [[site-os 7.2.58|7.2.58]]

25.17 | 11-2094 | Long-term kernel of 2094
- R-64: lower power use while all four cores wait on the unit bus
- NFS: client-side caching of read-only files over krb5p, for homes on a slow file server

25.1 | 12-2091 | Long-term kernel of 2091
- Suspend of idle devices for months at a time, with no loss of the unit bus state
- Kernel of the last update before the long sleep, [[site-os 7.2.47|7.2.47]]

23.19 | 12-2087 | Long-term kernel of 2087
- squashfs: faster reads of large images from SD cards
- CESEA Site OS 7.2 moves to this series with [[site-os 7.2.31|7.2.31]]

22.17 | 12-2083 | Long-term kernel of 2083
- Accelerator driver interface used by [[ntorch|NTorch]] to run models on the R-64
- CESEA Site OS 7.2 moves to this series with [[site-os 7.2.18|7.2.18]]

21.9 | 11-2078 | Long-term kernel of 2078
- First long-term kernel with the R-64 in every CESEA board file
- Kernel of the first SELK-T01 terminals, [[site-os 7.2|Site OS 7.2]]

20.8 | 02-2075 | CESEA R-64 architecture
- arch/r64: the radiation-hardened processor of CESEA sites, described in [[system/cpuinfo|/proc/cpuinfo]]
- Reports corrected memory errors of the ECC memory, and the bit flips from radiation in the log
- The CESEA site drivers stay in the CESEA tree

10.0 | 02-2037 | Ready for 2038
- 32-bit time interfaces are kept for old binaries only, ahead of 19-01-2038
- File systems that store 32-bit times are mounted read-only after 2038

6.12 | 11-2024 | Real-time preemption
- PREEMPT_RT merged into the mainline kernel
- sched_ext: schedulers written as BPF programs

6.6 | 10-2023 | New scheduler
- EEVDF replaces the CFS process scheduler

6.1 | 12-2022 | First Rust code
- Initial support for kernel code written in Rust
- Multi-generational LRU for memory reclaim
- Long-term kernel

5.15 | 10-2021 | NTFS and SMB server
- NTFS3, a read and write driver for NTFS
- ksmbd, an SMB file server in the kernel

5.6 | 03-2020 | WireGuard
- WireGuard VPN in the mainline kernel
- 64-bit time for 32-bit systems, ready for 2038

5.0 | 03-2019 | Energy-aware scheduling
- Energy-aware scheduling for processors with fast and slow cores
- Adiantum disk encryption for low-end processors
- FreeSync support for AMD graphics

4.15 | 01-2018 | Meltdown
- Page table isolation against the Meltdown attack

4.0 | 04-2015 | Live patching
- Kernel fixes can be applied without a restart

3.0 | 07-2011 | Btrfs scrub
- Btrfs: scrubbing and automatic defragmentation
- Xen dom0 support
- sendmmsg() system call

2.6.24 | 01-2008 | One x86 tree
- The 32-bit and 64-bit x86 trees are merged

2.6.0 | 12-2003 | Preemptible kernel
- Preemptible kernel, new threading support (NPTL)

2.4.0 | 01-2001 | USB
- USB support

2.2.0 | 01-1999 | Finer locking for several processors
- Better use of several processors

2.0 | 06-1996 | Several processors
- Several processors in one machine (SMP)
- More processor architectures

1.2 | 03-1995 | More processors
- Alpha, SPARC and MIPS processors

1.0 | 03-1994 | Networking
- First stable release, with networking

0.12 | 01-1992 | GPL
- Released under the GNU General Public License

0.01 | 09-1991 | First public release
- Written by Linus Torvalds for the Intel 386`
  },
  {
    id: "gcc", name: "GCC", group: "Kernel and toolchain", words: ["gnu-compiler", "cc", "g++", "compiler"],
    what: "C compiler; built the kernel",
    installed: "85.2.0",
    path: "/usr/share/doc/gcc-85/changelog.gz",
    notes: `85.2.0 | 08-2095 | Fixes for GCC 85
- R-64: fixes wrong code for 128-bit atomic operations at -O2
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]], which builds the kernel with it

85.1 | 04-2095 | GCC 85
- Default C++ dialect is gnu++2092
- R-64: scheduling model for the 2093 revision of the processor

84.2.0 | 08-2094 | Fixes for GCC 84
- R-64: fixes a crash at -O3 in loops over the unit bus registers
- Installed by the over-the-air update [[site-os 7.2.58|7.2.58]]

68.2.0 | 08-2078 | Fixes for GCC 68
- R-64: fixes the stack protector in kernel modules
- Compiler of [[site-os 7.2|Site OS 7.2]] and the first SELK-T01 kernel

65.1 | 04-2075 | CESEA R-64 target
- New target r64-cesea-linux, for the radiation-hardened processor of CESEA sites
- Same year as the R-64 support in [[linux 20.8|Linux 20.8]] and [[binutils 2.144|binutils 2.144]]

16.1 | 04-2026 | C++20 by default
- Default C++ dialect is gnu++20
- Experimental Algol 68 front end

15.1 | 04-2025 | C23 by default
- Default C dialect is gnu23
- COBOL front end

14.1 | 05-2024 | Stricter C
- Implicit function declarations and implicit int are errors by default

13.1 | 04-2023 | Modula-2
- Modula-2 front end

12.1 | 05-2022 | Faster code at -O2
- Vectorization enabled at -O2

11.1 | 04-2021 | C++17 by default
- Default C++ dialect is gnu++17

10.1 | 05-2020 | -fno-common
- Tentative definitions in C are no longer merged by default

9.1 | 05-2019 | D language
- D front end

6.1 | 04-2016 | C++14 by default
- Default C++ dialect is gnu++14

5.1 | 04-2015 | New numbering
- One major version a year from here on

4.8.0 | 03-2013 | Written in C++
- GCC itself is built as a C++ program

4.5.0 | 04-2010 | Link-time optimization
- Optimization across files at link time (LTO)

4.0.0 | 04-2005 | Tree SSA
- New optimizer framework

2.95 | 07-1999 | EGCS merged
- The EGCS fork becomes GCC again

1.0 | 05-1987 | First release
- C compiler of the GNU Project`
  },
  {
    id: "binutils", name: "GNU Binutils", group: "Kernel and toolchain", words: ["ld", "gnu-ld", "as", "linker"],
    what: "assembler and linker (ld)",
    installed: "2.186",
    path: "/usr/share/doc/binutils/changelog.gz",
    notes: `2.186 | 02-2096 | Shorter branches on the R-64
- ld: shorter long branches on the R-64, so the kernel image is smaller
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]]

2.184 | 02-2095 | R-64 revision of 2093
- objdump: decodes the instructions of the 2093 R-64 revision
- Installed by the over-the-air update [[site-os 7.2.58|7.2.58]]

2.144 | 02-2075 | CESEA R-64
- Assembler and linker for the R-64 processor

2.46 | 02-2026 | Zen 6 and SFrame 3
- AMD Zen 6 support
- SFrame format version 3

2.44 | 02-2025 | Gold leaves the default release
- The gold linker is no longer in the default source package

2.19 | 10-2008 | Gold linker
- New ELF linker, gold`
  },
  {
    id: "util-linux", name: "util-linux", group: "Base system", words: ["dmesg", "utillinux", "mount"],
    what: "system tools, dmesg among them",
    installed: "2.112.1",
    path: "/usr/share/doc/util-linux/NEWS",
    notes: `2.112.1 | 07-2096 | dmesg for supervisors
- CESEA package 2.112.1-1+cesea2: dmesg installed for the supervisors group, mode 0750, with the capability cap_syslog
- kernel.dmesg_restrict stays on, so dmesg gives "Operation not permitted" to other accounts
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]]

2.112 | 04-2096 | Previous boot in dmesg
- dmesg: shows the messages of the previous boot, kept in pstore
- mount: mounts images with dm-verity hashes from a signed manifest

2.19 | 02-2011 | util-linux again
- The util-linux-ng fork returns to the util-linux name

2.13 | 08-2007 | util-linux-ng
- First release of the fork started in 12-2006`
  },
  {
    id: "systemd", name: "systemd", group: "Base system", words: ["init"],
    what: "service manager, process 1",
    installed: "433",
    path: "/usr/share/doc/systemd/NEWS",
    notes: `433 | 09-2096 | Selk session units
- CESEA units: selk-session.target starts the compositor, the tmux session selk and the uplink agent at sign-in
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]]

260 | 03-2026 | SysV scripts removed
- System V service scripts are no longer supported
- Needs Linux 5.10 or later

258 | 09-2025 | cgroup v1 removed
- Only the unified control group hierarchy is supported

256 | 06-2024 | run0
- run0, a sudo replacement that runs commands through the service manager

245 | 03-2020 | systemd-homed
- Home directories as portable, self-contained units

209 | 02-2014 | systemd-networkd
- Network configuration service

1 | 03-2010 | First release
- Service manager started as process 1`
  },
  {
    id: "tmux", name: "tmux", group: "Base system", words: ["terminal-multiplexer"],
    what: "terminal multiplexer, session selk",
    installed: "10.7",
    path: "/usr/share/doc/tmux/CHANGES",
    notes: `10.7 | 03-2096 | Pane rectangles in control mode
- CESEA package 10.7-1+cesea4: control mode reports pane rectangles in character cells and in pixels, for [[selk-panes|Selk panes]]
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]]

3.6 | 11-2025 | Scrollbars
- Scrollbars in panes
- Reports a dark or light terminal theme

3.4 | 02-2024 | SIXEL images
- Panes can show SIXEL images when built with the option

3.2 | 04-2021 | Popups
- Popup windows over the panes (display-popup)

1.8 | 03-2013 | Control mode
- Control mode: another program can draw the panes of a tmux session

1.0 | 09-2009 | First release
- Terminal multiplexer for OpenBSD and other systems`
  },
  {
    id: "sssd", name: "SSSD", group: "Base system", words: ["sss"],
    what: "users and groups from the directory",
    installed: "9.4.2",
    path: "/usr/share/doc/sssd/changelog.gz",
    notes: `9.4.2 | 06-2096 | Cache after long absences
- Cached users and groups stay valid while no one signs in for years, until the directory answers again
- Installed by the over-the-air update [[site-os 7.2.60|7.2.60]]

1.0 | 2009 | First release
- System Security Services Daemon`
  },
  {
    id: "openldap", name: "OpenLDAP", group: "Base system", words: ["ldap", "libldap"],
    what: "LDAP client for the site directory",
    installed: "2.24.3",
    path: "/usr/share/doc/libldap/changelog.gz",
    notes: `2.24.3 | 04-2096 | TLS fixes
- libldap: resumes TLS sessions with the directory after a restart of the directory server
- Installed by the over-the-air update [[site-os 7.2.60|7.2.60]]

2.7.0 | 08-2026 | Increment permission and 64-bit hashes
- Increment permission in access rules
- 64-bit index hashes by default
- back-perl and back-sql removed
- GnuTLS deprecated

2.5 | 04-2021 | Load balancer
- lloadd, a load balancer for LDAP

2.0 | 08-2000 | LDAP version 3
- LDAPv3 support

1.0 | 08-1998 | First release
- Free LDAP server and libraries`
  },
  {
    id: "krb5", name: "MIT Kerberos", group: "Base system", words: ["kerberos", "mit-krb5", "klist"],
    what: "Kerberos 5 sign-in tickets",
    installed: "1.62.1",
    path: "/usr/share/doc/krb5/changelog.gz",
    notes: `1.62.1 | 10-2095 | KDC time limit
- The time limit of KDC requests counts from the first attempt, so sign-in fails fast when the directory is down
- Installed by the over-the-air update [[site-os 7.2.59|7.2.59]]

1.22 | 08-2025 | KDC time limit and local sockets
- Total time limit for KDC requests
- UNIX domain sockets
- systemd socket activation for the KDC and kadmind
- Elliptic curve certificates in PKINIT

1.0 | 1996 | First release
- Kerberos version 5 from MIT`
  },
  {
    id: "site-os", name: "CESEA Site OS", group: "CESEA Site OS", words: ["siteos", "site", "os", "ceseaos", "cesea", "debian"],
    what: "operating system, 7.2 of 2079",
    installed: "7.2.61",
    path: "/usr/share/doc/ceseaos/NEWS",
    notes: `7.2.61 | 18-11-2096 | Over-the-air update
- Kernel [[linux 26.3.55|26.3.55]], from the 26.3 long-term series
- Toolchain: [[gcc 85.2.0|GCC 85.2.0]], [[binutils 2.186|binutils 2.186]]
- [[tmux 10.7|tmux 10.7]], [[systemd 433|systemd 433]], [[util-linux 2.112.1|util-linux 2.112.1]]
- [[jsrt 6.4|jsrt 6.4]], with ECMAScript 2096
- [[selk-shell 1.6|Selk shell 1.6]]: dmesg and changenote
- kernel.dmesg_restrict stays on; the supervisors group may read the kernel log with dmesg
- Received over the uplink while the supervisor slept, written to the idle slot p2 and applied at the next restart, see [[cesea-update 2.4|Site update 2.4]]
# Changes from Debian in Site OS 7.2, as of this update
Storage and updates
- Read-only root: a squashfs image on the write-protected 8 GB card, checked by dm-verity, see [[cesea-update 2.0|Site update 2.0]]
- /tmp and /var in memory (tmpfs); /home on the file server over NFS 4 with Kerberos privacy (krb5p)
- Two root slots: p2 holds the system in use, 7.2.61, and p1 the copy that ran before, 7.2.60, as a fallback; the next update is written whole to p1 and starts at the next restart, see [[cesea-update 2.4|Site update 2.4]]
- The boot ROM lifts the card's temporary write protection only to copy a verified image, see [[boot-rom 7.2.0|Boot ROM 7.2.0]]
- Delta images over the 64 kbit/s link, see [[cesea-update 2.2|Site update 2.2]]; updates received during the long sleep wait on drive 0, see [[cesea-update 2.3|Site update 2.3]]
Programs and access
- Every site program is written in ECMAScript, and the kernel starts it with [[jsrt|jsrt]] through binfmt_misc; when the host refuses jsrt, init has nothing to run and the kernel stops
- .RUN programs: one-file bundles, each started in its own sandboxed frame, see [[run-frame|RUN frames]]
- Sections of the site database encrypted one by one; a password, a two-part password, an activation key or a test answer opens them, see [[cesea-vault|Site vault]]
- A section can wait for another and is listed once the first one opens, see [[cesea-vault 2.6|Site vault 2.6]]
- Revisions of entries kept read-only in the archive, see [[cesea-vault 2.2|Site vault 2.2]]
- System files listed in the database with their owner, group and mode; a file a crew account may not read shows the error, see [[cesea-vault 2.3|Site vault 2.3]]
- The kernel log is readable by the supervisors group only, with dmesg, see [[util-linux 2.112.1|util-linux 2.112.1]]
- Sign-in with the crew badge and the name: Kerberos PKINIT through SSSD and the site directory
- Neural models run on site with [[ntorch|NTorch]]; each output carries a score, and summaries are signed "NTorch summary"
Interface
- One Wayland session with two layouts, tmux and Workbench, switched without signing out, see [[selk-compositor 1.0|Selk compositor 1.0]]
- Graphical tmux: FILES, VIEW, MAIL, REPORT and WATCH drawn inside the panes of the tmux session selk, see [[selk-panes 1.0|Selk panes 1.0]]
- The session survives sign-out, and the next sign-in attaches to it
- Function key bar F1 to F10, pane dividers, zoom and POP OUT SHELL, see [[selk-panes|Selk panes]]
- Desktop layout with icons, drawers, framed windows and a depth gadget, see [[workbench|Selk Workbench]]
- Entries dragged from FILES into report blanks, see [[selk-compositor 1.5|Selk compositor 1.5]]
- Shell commands in the languages of the Federation, links in the output that run commands, and results printed in the shell or opened in VIEW, see [[selk-shell|Selk shell]]
- Notices for new mail and transmissions, see [[selk-compositor 1.4|Selk compositor 1.4]]
- Screen reader bridge for every program, see [[selk-compositor 1.2|Selk compositor 1.2]]
- Change notes of every program, in System and with changenote, see [[selk-shell 1.6|Selk shell 1.6]]
Links to the site
- Mail, report pages and updates over a delay-tolerant network, Bundle Protocol 7 and LTP, see [[cesea-dtn|Uplink agent]]
- Report transmissions count the light time to Earth, see [[cesea-dtn 2.7|Uplink agent 2.7]]
- Live telemetry and the SV-4 camera from the unit bus, see [[cesea-watch|Watch]]
- Boot checks of the reactor link, uplink relay, directory, unit bus and structure monitor, see [[boot-rom 7.2.0|Boot ROM 7.2.0]]
- Kernel drivers for the reactor link, the unit bus, the structure monitor and the uplink, see [[linux 26.3.55|Linux 26.3.55]]

7.2.60 | 12-08-2096 | Over-the-air update
- [[sssd 9.4.2|SSSD 9.4.2]] and [[openldap 2.24.3|OpenLDAP 2.24.3]]
- Fixes for the directory cache after long periods without sign-in

7.2.59 | 03-11-2095 | Security update
- [[krb5 1.62.1|MIT Kerberos 1.62.1]]: sign-in fails fast when the directory is down

7.2.58 | 21-05-2095 | Over-the-air update
- [[ntorch 3.6|NTorch 3.6]]
- Kernel [[linux 25.17.40|25.17.40]], toolchain [[gcc 84.2.0|GCC 84.2.0]] and [[binutils 2.184|binutils 2.184]]

7.2.55 | 14-06-2094 | Over-the-air update
- [[summarizer 2.2|Summarizer 2.2]]
- [[cesea-dtn 2.7|Uplink agent 2.7]]: the one-way delay follows the ephemeris of Earth and Saturn

7.2.52 | 09-09-2093 | Over-the-air update
- [[jsrt 6.0|jsrt 6.0]]
- [[selk-shell 1.5.3|Selk shell 1.5.3]]: command words in the 24 official languages of the Federation

7.2.48 | 02-04-2092 | Update before the long sleep
- [[cesea-update 2.3|Site update 2.3]]: updates received while the crew sleeps wait for the next restart
- Last update applied before the long sleep of 20-04-2092

7.2.47 | 11-02-2092 | Over-the-air update
- Kernel [[linux 25.1|25.1]], with long suspends of idle devices for the long sleep

7.2.40 | 14-02-2091 | Single-crew sites
- Long sleep support for single-crew sites
- Supervisor accounts in the supervisors group of the site directory
- [[selk-shell 1.5|Selk shell 1.5]]: hints and the hint light for a supervisor working alone
- [[cesea-vault 2.5|Site vault 2.5]]: selection test locks

7.2.36 | 06-2089 | MAST-01
- [[cesea-watch 1.1|Watch 1.1]]: MAST-01 load and the SV-4 camera
- [[fault-model 3.0|Fault model 3.0]] and [[planner 2.0|layout planner 2.0]] for the MAST-01 work

7.2.31 | 03-2088 | Audit desk
- Kernel 23.19, from the long-term kernel of 2087
- [[selk-shell 1.3|Selk shell 1.3]]: mail and report pages for AUDIT DESK 4
- [[cesea-dtn 2.5|Uplink agent 2.5]]: audit messages arrive as bundles
- [[selk-compositor 1.5|Selk compositor 1.5]]: entries can be dragged into report blanks

7.2.24 | 10-2086 | Over-the-air update
- [[ntorch 2.5|NTorch 2.5]]
- [[selk-panes 1.3|Selk panes 1.3]]: zoom for graphical panes

7.2.18 | 09-07-2084 | Neural models on site
- Kernel 22.17, from the long-term kernel of 2083
- [[ntorch 2.3|NTorch 2.3]] and the first site models: [[fault-model 1.0|fault model]] and [[planner 1.0|layout planner]]
- [[cesea-update 2.2|Site update 2.2]]: delta images over the 64 kbit/s link

7.2.12 | 04-2082 | Relays
- [[cesea-dtn 2.4|Uplink agent 2.4]]: the relay list of the CESEA contract

7.2.6 | 11-2080 | Over-the-air update
- [[workbench 1.0.2|Selk Workbench 1.0.2]]: window switcher
- [[selk-panes 1.1|Selk panes 1.1]]: function key bar

7.2.1 | 05-2079 | First fixes
- [[boot-rom 7.2.1|Boot ROM 7.2.1]]: longer wait for drive 0 in a cold shelter
- Workbench windows keep their places after a restart

7.2 | 09-03-2079 | Release for the Selk terminals
- Release of the boot banner, (c) 2079 CESEA; later versions 7.2.x are over-the-air updates to it
- Over-the-air updates arrive over the uplink, signed by CESEA, and keep the version 7.2 for the life of the site
- Kernel 21.9, from the long-term kernel of 2078, with [[gcc 68.2.0|GCC 68.2.0]]
# Changes from Debian in this release
- Read-only system: squashfs root on the write-protected card, dm-verity, tmpfs for /tmp and /var, /home on the file server over NFS with Kerberos, see [[cesea-update|Site update]]
- Two root slots, p1 and p2, for updates applied whole at a restart, see [[cesea-update 2.0|Site update 2.0]]
- Every site program is written in ECMAScript, and the kernel starts it with [[jsrt|jsrt]] through binfmt_misc; without jsrt, init has nothing to run
- One Wayland session with two layouts, tmux and Workbench, switched without signing out, see [[selk-compositor|Selk compositor]]
- Graphical tmux: FILES, VIEW, MAIL, REPORT and WATCH drawn inside tmux panes, see [[selk-panes|Selk panes]]
- Desktop layout with icons, drawers and framed windows, see [[workbench|Selk Workbench]]
- The site database shell, with commands in the player's language and links in its output, see [[selk-shell|Selk shell]]
- Sections of the database encrypted one by one and opened with a password, see [[cesea-vault|Site vault]]
- Unix permissions shown in the database: system files a crew account may not read show their owner and mode
- .RUN programs in their own sandboxed frame, see [[run-frame|RUN frames]]
- Mail, report pages and updates over a delay-tolerant network, see [[cesea-dtn|Uplink agent]]
- Live telemetry and camera from the unit bus, see [[cesea-watch|Watch]]
- Sign-in with the crew badge and the name: Kerberos PKINIT through the site directory
- Boot checks of the reactor link, uplink relay, directory, unit bus and structure monitor, see [[boot-rom 7.2.0|Boot ROM 7.2.0]]

7.1 | 11-2078 | Test release
- First builds for the SELK-T01 terminal and its R-64 board
- Selk compositor and Workbench in preview

7.0 | 06-2078 | Programs written in ECMAScript
- Every site program is written in ECMAScript and runs on [[jsrt 4.0|jsrt 4]], the ECMAScript runtime
- Based on Debian, as every version since 1.0
- Thin client variant for site terminals

6.0 | 2075 | R-64 processor
- CESEA R-64 processor ([[system/cpuinfo|/proc/cpuinfo]]), with [[linux 20.8|Linux 20.8]] and [[gcc 65.1|GCC 65.1]]
- Radiation-hardened builds: ECC memory checks at boot and memory error counts in the log

5.0 | 2073 | Outer planets
- [[cesea-dtn 2.0|Uplink agent 2]] with LTP for the long links of the outer planets
- [[jsrt 2.0|jsrt 2]]: site programs draw their own windows

4.0 | 03-2071 | Signed packages
- Packages and site images signed with CESEA release keys
- [[cesea-vault 1.0|Site vault 1.0]]: encrypted sections in the site database

2.0 | 2062 | Site database
- First site database
- [[cesea-dtn 1.0|Uplink agent 1.0]]: Bundle Protocol for the Moon and Mars sites

1.0 | 10-2058 | First release
- Operating system for CESEA sites away from Earth, based on Debian`
  },
  {
    id: "boot-rom", name: "Boot ROM", group: "CESEA Site OS", words: ["bios", "rom", "firmware"],
    what: "firmware of SELK-T01",
    installed: "7.2.1",
    path: "/usr/share/doc/selk-t01-rom/NEWS",
    notes: `7.2.1 | 12-03-2079 | Cold drive wait
- Waits longer for drive 0 to spin up when the shelter is cold
- DMI date and version: BIOS 7.2.1 03/12/2079

7.2.0 | 09-03-2079 | Boot checks and root slots
- Memory check and drive 0 spin-up before the kernel starts
- The initramfs adds the checks of the reactor link, uplink relay, directory, unit bus and structure monitor, in the same dotted lines on the console
- Prints the date the supervisor's long sleep ended, read from the site directory
- Chooses the root slot p1 or p2 written by [[cesea-update|Site update]]
- Lifts the card's temporary write protection only while it copies a verified image, and sets it again before the kernel starts

7.1.0 | 11-2078 | Test release
- First firmware for the R-64 board

7.0.0 | 06-2078 | First release
- Boot ROM for CESEA Site OS 7 terminals`
  },
  {
    id: "jsrt", name: "jsrt", group: "CESEA Site OS", words: ["ecmascript", "javascript", "js"],
    what: "runs programs written in ECMAScript",
    installed: "6.4",
    path: "/usr/share/doc/jsrt/NEWS",
    notes: `6.4 | 22-10-2096 | ECMAScript 2096
- Language of ECMAScript 2096, the 87th edition
- Installed by the over-the-air update [[site-os 7.2.61|7.2.61]]

6.0 | 12-01-2093 | Hardware floating point
- Uses the floating point unit of the R-64 for all arithmetic
- Programs keep their state through a restart of the compositor

5.3 | 2089 | Canvas
- Canvas drawing for [[cesea-watch|Watch]] and the [[run-frame|RUN frames]]

5.0 | 03-04-2086 | Offline programs
- Programs keep running while the uplink is down

4.0 | 06-2078 | Runtime of Site OS 7
- Runtime of CESEA Site OS 7
- binfmt_misc entry 'ecmascript': the kernel starts files written in ECMAScript with jsrt
- Without jsrt, the kernel finds no working init and stops

2.0 | 2074 | Wayland windows
- Wayland client interface for site programs

1.0 | 09-2071 | First release
- ECMAScript runtime for CESEA site systems`
  },
  {
    id: "cesea-update", name: "Site update", group: "CESEA Site OS", words: ["update", "ota", "cesea-ota"],
    what: "over-the-air updates of Site OS",
    installed: "2.4",
    path: "/usr/share/doc/cesea-update/NEWS",
    notes: `2.4 | 18-11-2096 | Fallback slot
- Writes [[site-os 7.2.61|7.2.61]] to the idle slot p2; the boot ROM boots it at the next restart
- Keeps the slot p1 with 7.2.60, chosen again if p2 fails three boots

2.3 | 02-04-2092 | Long sleep
- Updates received while the crew sleeps are staged on drive 0 and wait for the next restart
- No restart while a supervisor is signed in

2.2 | 09-07-2084 | Delta images
- Only the changed blocks of the root image travel over the 64 kbit/s link
- The full image is rebuilt on drive 0 and checked against the signed manifest

2.1 | 09-03-2079 | SELK-T01
- The card stays write-protected; updates are staged on drive 0
- The boot ROM copies a verified image to the card at restart

2.0 | 06-2078 | Two slots
- Two root slots on the card, p1 and p2, and the boot ROM picks one
- dm-verity root hash in the signed manifest

1.0 | 03-2071 | First release
- Site images signed with CESEA release keys`
  },
  {
    id: "cesea-vault", name: "Site vault", group: "CESEA Site OS", words: ["vault", "unlock", "access"],
    what: "locked sections and permissions",
    installed: "2.6.1",
    path: "/usr/share/doc/cesea-vault/NEWS",
    notes: `2.6.1 | 2095 | Section order
- Fixes the order of sections listed after another opens

2.6 | 2093 | Sections in sequence
- A section can wait for another: it is listed once the first one is open

2.5 | 14-02-2091 | Test locks
- A lock can take the answers of a selection test, one letter per item, in the dialog or typed
- The answers are kept only as a key derivation

2.4 | 2089 | Activation keys
- Factory sections open with a key typed in groups, as on the factory note; groups may be typed together, apart or with dashes
- The key boxes in the unlock dialog follow the length of each group

2.3 | 2085 | System files
- The System section lists configuration files of this terminal with their Unix permissions
- A file a crew account may not read shows the error, its owner, group and mode

2.2 | 2083 | Revisions
- Each change to an entry adds a revision; revisions are read-only
- The archive keeps the revisions with their date and author

2.1 | 2081 | Two-part passwords
- A section can need two passwords, for two keyholders

2.0 | 09-03-2079 | Thin clients
- An opened section stays open for the account, recorded in its home directory
- The unlock dialog and the unlock command in [[selk-shell|Selk shell]]

1.0 | 03-2071 | First release
- Each section of the site database is encrypted with its own key
- A password unwraps the section key with Argon2id; the key stays in the session keyring until sign-out`
  },
  {
    id: "cesea-dtn", name: "Uplink agent", group: "CESEA Site OS", words: ["uplink", "dtn", "bundle"],
    what: "delay-tolerant link to Earth",
    installed: "2.7.2",
    path: "/usr/share/doc/cesea-dtn/NEWS",
    notes: `2.7.2 | 2096 | Short passes
- Keeps bundles for the next pass when a pass ends early in dust

2.7 | 14-06-2094 | Light time
- The one-way delay, 74 to 84 min at Saturn, follows the ephemeris of Earth and Saturn
- The transmission countdown of a report page counts the light time

2.6 | 2090 | Report pages
- Report pages leave as signed bundles; "Delivered to Earth" follows the delivery report of the audit office
- New messages are announced on the status bar and in a notice

2.5 | 03-2088 | Audit desk
- Messages from AUDIT DESK 4 arrive as bundles and land in the inbox

2.4 | 04-2082 | Relays
- Relay list of the CESEA contract; the status bar names the relay in use

2.3 | 09-03-2079 | Selk
- Contact plan for Selk: two passes a day through the 4 m dish, 64 kbit/s on X band

2.0 | 2073 | LTP
- Licklider Transmission Protocol for links with hours of delay

1.0 | 2062 | First release
- Bundle Protocol version 7 (RFC 9171): store and forward between the sites, the relays and Earth`
  },
  {
    id: "selk-compositor", name: "Selk compositor", group: "Interface", words: ["compositor", "wayland", "selk-wm"],
    what: "Wayland compositor, two layouts",
    installed: "1.5.4",
    path: "/usr/share/doc/selk-compositor/NEWS",
    notes: `1.5.4 | 2096 | Window places
- Keeps window places when the layout changes while a .RUN frame is open

1.5 | 03-2088 | Drag and drop
- Entries can be dragged between programs as application/x-cesea-entry; REPORT accepts them in its blanks

1.4 | 2085 | Notices
- A notice stack for new mail and transmissions, with buttons

1.3 | 2083 | Cursors
- Pixel cursors drawn for the CRT, in three sizes

1.2 | 2081 | Access
- Screen reader bridge (AT-SPI) for every program

1.1 | 2080 | Workbench frames
- Frames drawn by the compositor for Workbench windows, with the depth gadget

1.0 | 09-03-2079 | First release
- One Wayland session per sign-in, with two layouts: tmux and [[workbench|Workbench]]
- Changing the layout keeps every program running, with its windows and their content
- Drives the 36 cm amber CRT of SELK-T01, 80 by 30 characters`
  },
  {
    id: "selk-panes", name: "Selk panes", group: "Interface", words: ["panes", "graphical-tmux"],
    what: "graphical tmux panes",
    installed: "1.6",
    path: "/usr/share/doc/selk-panes/NEWS",
    notes: `1.6 | 2096 | Long messages
- The status line scrolls a long message with the wheel, a drag or the arrow keys, as the bottom bar of Midnight Commander

1.5 | 2090 | Shell-only DESK
- DESK can keep only SHELL; FILES and VIEW return when asked for
- Results of FILES and the F keys can also print in the shell

1.4 | 03-2088 | POP OUT SHELL
- SHELL can leave DESK for its own tmux window, and return

1.3 | 10-2086 | Zoom
- Ctrl+B then Z zooms graphical panes as well as text panes

1.2 | 2083 | Dividers
- Pane dividers can be dragged or moved with the arrow keys; sizes are kept for each split

1.1 | 11-2080 | Function keys
- Bar of F1 to F10 at the bottom, after Midnight Commander

1.0 | 09-03-2079 | First release
- Runs [[tmux|tmux]] in control mode: tmux keeps the session selk, Selk panes draws it
- Each graphical program (FILES, VIEW, MAIL, REPORT, WATCH) gets a tmux pane, and its surface is placed on the pane's rectangle
- Ctrl+B keys stay those of tmux; the session survives sign-out, so the next sign-in attaches to it (tmux attach -t selk)`
  },
  {
    id: "workbench", name: "Selk Workbench", group: "Interface", words: ["desktop", "selk-workbench"],
    what: "desktop layout",
    installed: "1.0.6",
    path: "/usr/share/doc/selk-workbench/NEWS",
    notes: `1.0.6 | 2093 | MESSAGE window
- MESSAGE opens alone when a message is read; MAIL opens when asked for

1.0.4 | 2088 | Report paper
- The REPORT window opens 66 columns wide, the width of the paper

1.0.2 | 11-2080 | Window switcher
- A list of the open windows

1.0 | 09-03-2079 | First release
- Icons, drawers and windows over the [[selk-compositor|Selk compositor]]
- Windows open at the size of their content: SHELL 80 columns by 24 lines, READER 72 columns
- The depth gadget sends a window to the back

0.9 | 12-2078 | Preview
- Test version for the SELK-T01 terminals`
  },
  {
    id: "selk-shell", name: "Selk shell", group: "Interface", words: ["shell", "selksh", "sh"],
    what: "the command line",
    installed: "1.6",
    path: "/usr/share/doc/selk-shell/NEWS",
    notes: `1.6 | 18-11-2096 | System commands
- dmesg: the kernel log, for the supervisors group
- changenote: the change notes of the programs on this terminal, also in System as /usr/share/doc

1.5.3 | 09-09-2093 | Languages
- Command words in the official languages of the Federation; the English word always works
- Typed words match with or without accents

1.5 | 14-02-2091 | Single-crew sites
- hints and light: help for a supervisor working alone
- logout keeps the progress of the session

1.4 | 2090 | tmux session
- The shell runs in the tmux session selk
- watch: live telemetry
- Shell results: printed in the shell or opened in VIEW, with a redirect notice

1.3 | 03-2088 | Audit desk
- mail: messages from AUDIT DESK 4
- report, fill, unfill and submit: report pages for the audit office
- Links in the output (OSC 8) run their command when clicked

1.2 | 2083 | Revisions
- open shows the revisions kept by [[cesea-vault 2.2|Site vault 2.2]]

1.1 | 2081 | Locked sections
- unlock: sections with a password

1.0 | 09-03-2079 | First release
- ls, cd, open and note for the site database`
  },
  {
    id: "run-frame", name: "RUN frames", group: "Interface", words: ["run", ".run", "runframe"],
    what: ".RUN programs in sandboxed frames",
    installed: "1.2",
    path: "/usr/share/doc/run-frame/NEWS",
    notes: `1.2 | 2084 | Pixel canvas
- The canvas is scaled by whole pixels on the CRT, with a pixel font

1.1 | 2081 | Sandbox
- Each .RUN program has its own namespaces, no network and no files outside its bundle, behind a seccomp filter

1.0 | 09-03-2079 | First release
- A .RUN file is one bundle: a squashfs image with a manifest and a program written in ECMAScript
- binfmt_misc starts run-frame for the .RUN signature; the program opens in a framed window titled with the file name
- First program: [[disassembly 1.0|DISASSEMBLY.RUN]], from the staff training set`
  },
  {
    id: "cesea-watch", name: "Watch", group: "Interface", words: ["watch", "telemetry"],
    what: "live telemetry and camera",
    installed: "1.2",
    path: "/usr/share/doc/cesea-watch/NEWS",
    notes: `1.2 | 2093 | Gusts
- Wind gusts marked on the wind reading as they arrive

1.1 | 06-2089 | MAST-01
- Load of MAST-01, wind, dust and units
- SV-4 LIVE: the camera on MAST-01, drawn on the CRT

1.0 | 2083 | First release
- Telemetry from the unit bus and the site sensors`
  },
  {
    id: "ntorch", name: "NTorch", group: "Neural systems", words: ["n-torch"],
    what: "runs neural models on site",
    installed: "3.6",
    path: "/usr/share/doc/ntorch/NEWS",
    notes: `3.6 | 21-05-2095 | Faster on the R-64
- Uses the accelerator interface of the kernel for matrix work
- Installed by the over-the-air update [[site-os 7.2.58|7.2.58]]

3.4 | 2092 | Unattended runs
- Models keep running while the crew sleeps, and their outputs wait for a crew check

3.2 | 2090 | Scores
- Scores from 0 to 1 for every model output

3.0 | 10-2088 | Units
- Runs on assembly units as well as in the database

2.5 | 10-2086 | Smaller models
- Models in 8-bit numbers, for less memory on the units

2.3 | 09-07-2084 | Site models
- First site models: [[fault-model 1.0|fault model]] and [[planner 1.0|layout planner]]

2.0 | 2080 | R-64
- Runs on the R-64 processor

1.0 | 2073 | First release
- Runs models trained with PyTorch on Earth on site machines, without a link to Earth`
  },
  {
    id: "fault-model", name: "Fault model", group: "Neural systems", words: ["faultmodel", "crack-finder"],
    what: "marks cracks in camera images",
    installed: "4.0",
    path: "/var/lib/ntorch/models/fault-model/NEWS",
    notes: `4.0 | 06-01-2097 | Build 55183
- Trained on images of Earth steel and concrete
- Cut units still act above a score of 0.85

3.2 | 2091 | Selk ice parts
- Trained on images of Selk ice parts from MAST-01

3.1 | 2090 | Scores
- Scores from 0 to 1; cut units act above 0.85

3.0 | 2089 | Climb units
- Runs on the climb units for MAST-01, with [[ntorch 3.0|NTorch 3]]

2.0 | 2087 | Crack shape
- Marks the length and direction of each crack

1.0 | 09-07-2084 | First release
- Trained on images of Selk ice`
  },
  {
    id: "planner", name: "Layout planner", group: "Neural systems", words: ["layout-planner"],
    what: "places new parts",
    installed: "2.3",
    path: "/var/lib/ntorch/models/planner/NEWS",
    notes: `2.3 | 2092 | Print order
- Orders print jobs so two print units never wait on the same part

2.2 | 2091 | Storms
- Plans take the equinox storms into account

2.0 | 2089 | MAST-01
- Plans the parts of MAST-01

1.1 | 2086 | Print units
- Plans for the print units

1.0 | 09-07-2084 | First release
- Places new parts; crew check every plan before building`
  },
  {
    id: "summarizer", name: "Summarizer", group: "Neural systems", words: ["summariser", "summary"],
    what: "writes INDEX entries and summaries",
    installed: "2.2",
    path: "/var/lib/ntorch/models/summarizer/NEWS",
    notes: `2.2 | 14-06-2094 | Dates
- Summaries dated with the day they were written

2.1 | 2093 | Unattended runs
- Writes summaries while the crew sleeps

2.0 | 2090 | Signed summaries
- Short summaries signed "NTorch summary"
- Summaries can contain errors; check the entries they summarize

1.1 | 2087 | Unit reports
- Summaries of unit reports

1.0 | 2085 | First release
- Writes the INDEX entry of each section`
  },
  {
    id: "tpaneza", name: "TPANEZA", group: "Neural systems", words: ["trapeza", "τραπεζα"],
    what: "forecasts debt crises on Earth; not in use here",
    installed: "2.3",
    path: "/usr/share/doc/tpaneza/NEWS",
    notes: `2.3 | 14-02-2091 | Disabled on single-crew sites
- tpaneza.service stays installed and disabled on SELK-T01
- Single-crew sites take the forecast from the CESEA logistics office in each uplink pass, and the units read it from there

2.2 | 03-2088 | Supply lines
- One availability level for each supply line from Earth: launches, spare parts, reactor fuel and process chemicals
- For a long job, a unit plans with the lowest availability in mind among the supply lines that the job needs

2.1 | 09-07-2084 | Model on NTorch
- The forecast model is trained with PyTorch on Earth and runs with [[ntorch 2.3|NTorch 2.3]]

2.0 | 09-03-2079 | Site terminals
- Runs on site terminals; the assembly units read its forecast as the Earth availability of each part they order
- One forecast a week, for the next 12 months

1.2 | 2072 | Reference crisis
- Measured against the Greek debt crisis of 2010 to 2015 and the loans of the Troika
- Gives the chance, from 0 to 1, of a crisis like it within 12 months, for each member state of the Federation and each country that supplies CESEA

1.0 | 2068 | First release
- Named TPANEZA, the Greek word for bank
- Written for the CESEA logistics office, which plans launches years ahead
- Reads public debt, bond yields, bank deposits and trade balances, and warns when a supplier of a site may stop delivering`
  },
  {
    id: "troika", name: "TROIKA.RUN", group: "Training and archive sets", words: ["troika.run"], sec: "history",
    what: "running game, archive teaching set",
    installed: "1.1",
    path: "/usr/share/doc/troika-run/NEWS",
    notes: `1.1 | 2090 | Saved year
- Keeps the year reached when the frame closes

1.0 | 2084 | First release
- Greece runs from 2010 to 2015 ahead of the Troika`
  },
  {
    id: "disassembly", name: "DISASSEMBLY.RUN", group: "Training and archive sets", words: ["disassembly.run"], sec: "design",
    what: "repair game, staff training set",
    installed: "1.0",
    path: "/usr/share/doc/disassembly-run/NEWS",
    notes: `1.0 | 09-03-2079 | First release
- Two phones of 2023 and 2024, taken apart step by step
- Runs in its own frame, see [[run-frame 1.0|RUN frames 1.0]]`
  }
];
