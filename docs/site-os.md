# Site OS and the real techniques

[Back to Developing Selk](../DEVELOPING.md)

In the story, the terminal SELK-T01 runs CESEA Site OS 7.2. Site OS is a distribution based on Debian, released in 2079 and kept current by over-the-air updates. The game shows many things that a stock Debian system does not do. This page lists each of them.

## Terms

| Term | Meaning |
| --- | --- |
| Mechanic | What the player sees the game do |
| Game code | The files and functions that make the mechanic in this project |
| In the world | The CESEA component that does it in the story, and the version that brought it. Each component has change notes in `js/data/changenotes.js`, read in the game with `changenote` or System > changelog |
| Real technique | How a real Linux system could do the same thing with software that exists today |

The notes of Site OS 7.2.61 list every difference from Debian, with a link to the component of each.

## Rules for changes

- A new mechanic gets a row on this page and a change note in the component that would provide it.
- A change to a mechanic updates its row and adds a version to the component's change notes.
- The change notes stay in the world of the story; this page holds the game code and the real techniques.

## The terminal

SELK-T01 is the hardware the story and the change notes describe. Keep every mention of it in line with this table.

| Part | Description | Shown in |
| --- | --- | --- |
| Processor | CESEA R-64, revision 1 of 2075: a 64-bit radiation-hardened processor designed by CESEA for its sites, with 4 cores at 1200 MHz, floating point and vector units, and the m8 matrix unit that NTorch uses for 8-bit and 16-bit numbers. Triple-voted registers and ECC on every cache and bus keep it running under radiation. It has its own instruction set, r64gv, supported by Linux since 20.8 (arch/r64), GCC since 65.1 and binutils since 2.144. A revision of 2093 runs on newer site machines | `system/cpuinfo` (`/proc/cpuinfo`), ABOUT, `dmesg`, the change notes |
| Memory | 64 GB with ECC, scrubbed every 24 h | `design/SELK-T01`, ABOUT, `dmesg` |
| Card | 8 GB SD card, write-protected, two root slots p1 and p2 | `dmesg`, `system/fstab`, the panic in `index.html` |
| Drive 0 | 4 TB, 5 400 rpm, for staged updates and scratch data | ABOUT, the boot checks, `dmesg` |
| Screen | 36 cm amber phosphor CRT, 80 by 30 characters | `design/SELK-T01`, ABOUT |
| Firmware | Boot ROM 7.2.1 of 12-03-2079 | ABOUT, `dmesg`, the change notes |
| Links | Reactor link, unit bus, uplink through relay R-09, file server and directory over the site network | The boot checks, `dmesg`, `system/hosts` |

## Storage, boot and updates

| Mechanic | Game code | In the world | Real technique |
| --- | --- | --- | --- |
| Read-only system, `/etc/fstab` with a squashfs root, tmpfs `/tmp` and `/var`, `/home` over NFS | `system/fstab` in `js/data/entries.js` | Site OS 7.2, Site update 2.0 | A squashfs root image, checked block by block by dm-verity against a root hash in a signed manifest; tmpfs for writable paths; NFSv4 with `sec=krb5p` for homes. ChromeOS checks its read-only root with dm-verity, and many embedded and thin client images use a squashfs root |
| Write-protected card that still takes updates | `mmcblk0 ... (ro)` in `dmesg` and the panic | Boot ROM 7.2.0, Site update 2.1 | SD cards have a temporary write-protect bit (TMP_WRITE_PROTECT in the CSD register) that the host can set and clear. Firmware clears it only to copy a verified image, then sets it before the kernel starts |
| Updates applied whole at a restart, two slots | `root=/dev/mmcblk0p2` in the kernel command line | Site update 2.0 to 2.4 | A/B partition updates, as in RAUC, Mender, SWUpdate and Android: write the idle slot, switch the boot slot, fall back after failed boots |
| Updates over a 64 kbit/s link | | Site update 2.2 | Delta images (casync, zchunk, bsdiff), rebuilt and verified before they are written |
| Version 7.2 of 2079 still current in 2096 | Boot banner `CESEA SITE OS 7.2 (c) 2079 CESEA` | Site OS 7.2.x | A long-term distribution that moves its kernel and toolchain within one release, like Ubuntu's hardware enablement stacks |
| Boot checks of the reactor link, relay, directory, unit bus and structure monitor | `boot()` in `js/main.js` | Boot ROM 7.2.0 | Firmware checks for memory and disks; the network and device checks run in the initramfs as systemd units and print to the console |
| Panic when JavaScript is off | `<noscript>` in `index.html` | jsrt 4.0 | binfmt_misc registers an interpreter for a file signature. With the interpreter missing, `/sbin/init` fails with error -8 (ENOEXEC) and the kernel panics with "No working init found" |
| Kernel log for supervisors only | `dmesg` in `js/shell/commands.js` | util-linux 2.112.1-1+cesea2 | `kernel.dmesg_restrict=1`, and a copy of `dmesg` owned by a group, mode 0750, with `setcap cap_syslog+ep` |
| Processor details for the crew | `system/cpuinfo` | Linux 20.8 (arch/r64) | `/proc/cpuinfo`, readable by every account |
| Change notes of every program | `changenote`, `system/changelog` | Selk shell 1.6 | `/usr/share/doc/<package>/changelog.Debian.gz` and `NEWS` files, read with a pager or `apt changelog` |

## Programs and access

| Mechanic | Game code | In the world | Real technique |
| --- | --- | --- | --- |
| Every program is written in ECMAScript | the whole game | jsrt | An ECMAScript runtime with system bindings (Node.js, Deno, GJS for GNOME Shell) started through binfmt_misc or a shebang |
| Locked sections opened by a password | `unlock`, `S.LOCKS` in `js/data/story.js` | Site vault 1.0 | Per-directory encryption (fscrypt, gocryptfs) with the key wrapped by a passphrase through Argon2id; the unwrapped key lives in the session keyring (`keyctl`) until sign-out |
| Opened sections stay open after sign-out | `state.unlocked` | Site vault 2.0 | The wrapped key, or a token for it, stored in the user's home |
| Two-part passwords | `power` lock | Site vault 2.1 | Split knowledge: a key wrapped twice, or Shamir's secret sharing among keyholders |
| Activation key typed in groups | `design` lock, `key: true` | Site vault 2.4 | A product key checked by its digest; the input field ignores grouping and dashes |
| A test as a lock | `history` lock, `sort` | Site vault 2.5 | A key derived from the correct answers; only the derived key is stored |
| A section listed only after another opens | `after` in `SELK.SECTIONS`, `S.sections()` | Site vault 2.6 | Directory traversal permission without read permission on the parent, or a server-side policy that publishes the directory once a condition holds |
| System files that a crew account may not read | `fmt: "denied"` in `js/data/entries.js` | Site vault 2.3 | Unix permissions and groups from LDAP; `cat` reports "Permission denied" |
| Revisions of entries | `archive/*.R*` entries | Site vault 2.2 | An append-only store with history, such as a version control repository or a database with system-versioned tables |
| .RUN programs in their own frame | `S.troika.open`, `S.disassembly.open` | RUN frames | A one-file bundle (AppImage, a Flatpak bundle) started through binfmt_misc, in a sandbox of namespaces, seccomp and Landlock (bubblewrap), drawn as its own Wayland toplevel with a server-side frame |
| Sign-in with a name only | `doLogin` in `js/main.js` | Site OS 7.2 | Kerberos PKINIT with a smart card or badge: the badge proves the user, the name selects the account; SSSD reads the account from LDAP |
| Neural models with scores and signed summaries | `site/NEURAL-SYSTEMS`, NTorch summary by-lines | NTorch, Summarizer | Models trained in PyTorch, exported (ONNX, `torch.export`) and run by an on-device runtime (ONNX Runtime, ExecuTorch); outputs carry a confidence score |

## Interface

| Mechanic | Game code | In the world | Real technique |
| --- | --- | --- | --- |
| tmux mode and desktop mode in one session | `S.setMode`, `js/ui/tmux.js`, `js/ui/desktop.js` | Selk compositor 1.0 | One Wayland compositor with two layout policies, tiling and stacking, switched at run time; the clients keep running. Sway, for example, can float a tiled window and tile it again |
| Graphical panes in tmux | `S.registerKind`, the panes of `tmux.js` | Selk panes 1.0 | tmux control mode (`tmux -CC`, as iTerm2 uses it): tmux keeps the session and reports the layout, a graphical client draws the panes and places other programs' surfaces on their rectangles. tmux 3.4 can also show SIXEL images inside panes |
| The session survives sign-out | `tmux attach -t selk` at sign-in | Selk panes 1.0 | The tmux server keeps running; the next client attaches to the session by name |
| Ctrl+B keys, zoom, dividers, POP OUT SHELL | `js/ui/tmux.js` | Selk panes 1.2 to 1.4 | tmux prefix key, `resize-pane -Z`, `resize-pane`, `break-pane` and `join-pane` |
| Function key bar F1 to F10, scrolling status line | `.fbar` in `index.html`, `S.fkey` in `js/main.js`, `js/ui/status.js` | Selk panes 1.1, 1.6 | Midnight Commander's button bar and hint line |
| Desktop with icons, drawers, framed windows and a depth gadget | `js/ui/desktop.js` | Selk Workbench | A stacking layout with server-side decorations (`xdg-decoration`); the depth gadget lowers the window in the stacking order, as on the Amiga Workbench |
| Windows sized to their content | `contentSize()` in `desktop.js` | Selk Workbench 1.0 | The client proposes its size; the compositor clamps it to the output |
| Dragging an entry into a report blank | `js/ui/explorer.js`, `js/game/report.js` | Selk compositor 1.5 | Wayland drag and drop (`wl_data_device`) with a custom MIME type |
| Links in the shell output that run commands | `data-cmd` buttons, `S.runClick` | Selk shell 1.3 | OSC 8 hyperlinks in the terminal, with a URI scheme handled by the shell |
| Results printed in the shell or opened in VIEW | `S.outShell`, `S.outWindow` in `commands.js` | Selk shell 1.4 | The shell asks a viewer to open a document over D-Bus (the OpenURI portal) and prints a short text version itself |
| Command words in the player's language, matched without accents | `S.i18n.command` in `js/core/i18n.js` | Selk shell 1.5.3 | Localized aliases, matched after Unicode NFD normalization with the combining marks removed |
| Notices for new mail | toasts in `js/game/mail.js` | Selk compositor 1.4 | Desktop notifications (`org.freedesktop.Notifications`) |
| Screen reader mode | `js/ui/a11y.js` | Selk compositor 1.2 | AT-SPI2 with a screen reader such as Orca |
| Live telemetry and camera | `js/game/watch.js`, `js/game/live.js` | Watch | Publish and subscribe telemetry on a field bus (MQTT, DDS) and a camera stream (RTSP) |

## Links to the site

| Mechanic | Game code | In the world | Real technique |
| --- | --- | --- | --- |
| Mail and report pages over a 74 to 84 minute delay | `S.queueMail`, the transmission in `js/game/report.js` | Uplink agent | Delay-tolerant networking: Bundle Protocol 7 (RFC 9171) over the Licklider Transmission Protocol (RFC 5326), as in NASA's ION; store and forward through relays and a contact plan of passes |
| "Delivered to Earth" | `joinDelivered()` in `js/game/mail.js` | Uplink agent 2.6 | Bundle status reports of delivery |
| Relay named on the status bar | `S.recordUplink` | Uplink agent 2.4 | The contact plan and the route chosen for each bundle |
| Kernel drivers for the site hardware | `dmesg` lines `cesea_*` | Linux 26.3.55-cesea-site | Out-of-tree drivers built with the distribution kernel, logged at probe time |

## Game structure with no in-world machine

These mechanics belong to the game alone. They have no change notes, since they make no sense on a wall-mounted terminal on Titan:

- The site clock that advances with each command and message.
- Fast mode, the debug panel and Wipe on refresh.
- The hint pages and the hint light.
- The title screen, its OPTIONS and the screen frames.
- The screen effects of the CRT and their Setup switches.
- Text speed, Pretty wrap and reduced motion.
- The interface sounds, the control sounds and the sound channels.
- Phones and narrow screens: the one-pane layout, the navigation buttons, touch gestures and the long press for the context menu.
- The save in browser storage, for this tab or this computer, and the Storage page.
- The save from before the decision and the endgame card.
- The agent joke (`claude`, `ntorch`, `codex`, `chatgpt`).
