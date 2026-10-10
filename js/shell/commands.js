/* Shell commands: the help table, the command table, S.run(), and
   S.outShell(), which decides whether a result prints in the shell or opens
   its window. */
(function () {
  var S = window.SELK;
  var K = S.cmd, scr = K.scr, err = K.err, resolveEntry = K.resolveEntry, lockedMsg = K.lockedMsg,
    readMail = K.readMail, hintsPage = K.hintsPage, revealHint = K.revealHint, printEntry = K.printEntry,
    shellTable = K.shellTable, listSection = K.listSection, listRoot = K.listRoot;
  /* Help rows: command, arguments, description. In the arguments, upper-case
     words are placeholders shown through S.t and lower-case words are fixed
     arguments shown through S.argName. Descriptions can name any command or
     argument as {word}. */
  var HELP = [
    ["ls", "", "list sections, or entries in this section"],
    ["cd", "NAME", "enter a section, {cd} .. to leave"],
    ["open", "NAME", "read an entry"],
    ["note", "TERM", "read a handbook note"],
    ["unlock", "NAME PASSWORD", "open a locked section"],
    ["mail", "", "list messages, {mail} 2 reads one"],
    ["report", "", "list report pages, {report} 2 opens one"],
    ["fill", "2 NAME", "put an entry in blank 2"],
    ["unfill", "2", "empty blank 2"],
    ["submit", "", "send the open report page"],
    ["decide", "", "open the final decision, once the office asks for it"],
    ["hints", "", "hints page, hidden until you type {hints} {on}"],
    ["light", "on", "hint light, off by default"],
    ["sound", "off", "sound on or off"],
    ["settings", "", "setup screen, also F9"],
    ["watch", "", "live telemetry"],
    ["mode", "", "switch tmux and desktop"],
    ["storage", "", "saved data in this browser"],
    ["changenote", "", "how the programs on this terminal changed, {changenote} linux lists its versions"],
    ["devnotes", "", "developer notes, spoilers"],
    ["clear", "", "clear the screen"],
    ["credits", "", "credits and licenses"],
    ["logout", "", "end the session, progress is kept"],
    ["reset", "", "erase all progress"]
  ];
  function syntax(h) {
    var args = h[1] ? h[1].split(" ").map(function (w) {
      return /^[A-Z]/.test(w) ? S.t(w) : /^[a-z]+$/.test(w) ? S.argName(w) : w;
    }).join(" ") : "";
    return S.cmdName(h[0]) + (args ? " " + args : "");
  }
  /* The kernel of SELK-T01, as in the panic of index.html without
     JavaScript. 26.3 is the long-term kernel of late 2095: about 66 days
     per release and 20 releases per major version since 7.0 in April 2026.
.55 is its stable update of November 2096. It is built with the
     toolchain of the Site OS 7.2 over-the-air update 7.2.61: GCC 85.2 (one major release a year since
     GCC 16 in 2026, .2 in late summer) and binutils 2.186 (two releases a
     year since 2.46 in February 2026) */
  var KVER = "26.3.55-cesea-site";
  /* dmesg: one line per message, the seconds since power on and the text;
     ! marks a warning. A template literal, so the catalog tool does not take
     kernel text for interface text. The boot is fixed; NFS loads when the
     supervisor signs in and /home is mounted */
  var BOOT_LOG = `0 Linux version {k} (build@lab.selk.cesea.internal) (gcc (CESEA 85.2.0-19) 85.2.0, GNU ld (GNU Binutils for CESEA) 2.186) #1 SMP PREEMPT_DYNAMIC CESEA {v}-3 (2096-11-04)
0 Command line: BOOT_IMAGE=/boot/vmlinuz-{k} root=/dev/mmcblk0p2 ro console=tty0 cesea.site=selk
0 DMI: CESEA SELK-T01/SELK-T01, BIOS 7.2.1 03/12/2079
0 CPU: CESEA R-64 revision 1, 1200 MHz, ECC memory scrubbing every 24 h
0 Memory: 64912416K/67108864K available (24576K kernel code, 4096K rwdata, 12288K rodata, 3220K init, 2048K bss, 2196448K reserved)
0.004112 smp: Bringing up secondary CPUs ...
0.009870 smp: Brought up 1 node, 4 CPUs
0.412907 mmc0: new high speed SDHC card at address 0001
0.413220 mmcblk0: mmc0:0001 SELK8 7.40 GiB (ro)
0.413544  mmcblk0: p1 p2
1.118302 ata1: SATA link up 6.0 Gbps (SStatus 133 SControl 300)
1.121877 sd 0:0:0:0: [sda] 7814037168 512-byte logical blocks: (4.00 TB/3.64 TiB)
1.402566 cesea_rlink: reactor link up, 48 MW available
1.409952 cesea_uplink: relay R-09 idle
1.417390 cesea_unitbus: 31 units online
1.420118 !cesea_sm: structure monitor ALARM, deferred to supervisor console
1.633210 VFS: Mounted root (squashfs filesystem) readonly on device 179:2.
1.640781 Freeing unused kernel image (initmem) memory: 3220K
1.641002 Write protecting the kernel read-only data: 28672k
1.652118 binfmt_misc: registered 'ecmascript' interpreter /usr/lib/cesea/jsrt
1.652340 jsrt: host terminal allows script execution
1.653877 Run /sbin/init as init process
2.104412 systemd[1]: Hostname set to <selk-t01>.
2.871530 cesea_net eth0: link up, 10 Gbps, full duplex`;
  var SIGN_IN_LOG = `0 FS-Cache: Netfs 'nfs' registered for caching
0.000912 Key type id_resolver registered
0.000927 Key type id_legacy registered`;
  /* [seconds, text, class] from a log block, its times moved by from */
  function logLines(block, from) {
    return block.split("\n").map(function (l) {
      var cut = l.indexOf(" "), text = l.slice(cut + 1).replace(/\{k\}/g, KVER).replace(/\{v\}/g, KVER.split("-")[0]);
      return [from + parseFloat(l.slice(0, cut)), text.replace(/^!/, ""), text.charAt(0) === "!" ? "warn" : "dim"];
    });
  }
  function dmesgLines() {
    var lines = logLines(BOOT_LOG, 0);
    if (S.bootAt && S.signInAt) {
      lines = lines.concat(logLines(SIGN_IN_LOG, Math.max(3.2, (S.signInAt - S.bootAt) / 1000) + 0.000317));
    }
    return lines;
  }
  /* Mark entry id read, so the listings, drawers and the explorer gray it */
  function markRead(id) {
    if (S.state.read.indexOf(id) === -1) { S.state.read.push(id); S.save(); }
    S.status();
    if (S.ex) { S.ex.render(); }
  }
  /* changenote: the change notes of SELK.CHANGENOTES (js/data/changenotes.js),
     a document of three levels: the programs by group, the versions of one
     program, the notes of one version. Each page has a path back up, links
     to its neighbors at the top and at the foot, and links inside the
     notes. A program in a section still locked is left out, and the list
     says how many are left out. */
  function cnPrograms() {
    return (S.CHANGENOTES || []).filter(function (p) { return !p.sec || S.isUnlocked(p.sec); });
  }
  /* Programs whose section is on the list of sections but still locked.
     A section that is not on the list yet is not counted, so the notice
     goes once every listed section is open */
  function cnHidden() {
    return (S.CHANGENOTES || []).filter(function (p) {
      return p.sec && S.sectionById(p.sec) && !S.isUnlocked(p.sec);
    }).length;
  }
  function cnFind(word) {
    var w = String(word || "").toLowerCase();
    return cnPrograms().filter(function (p) {
      return p.id === w || p.name.toLowerCase() === w || p.words.indexOf(w) !== -1;
    })[0] || null;
  }
  /* The programs in the order of their groups, as the list shows them */
  function cnOrdered() {
    var groups = S.CHANGENOTE_GROUPS || [], list = cnPrograms();
    return groups.reduce(function (out, g) {
      return out.concat(list.filter(function (p) { return p.group === g; }));
    }, []).concat(list.filter(function (p) { return groups.indexOf(p.group) === -1; }));
  }
  /* The versions of a program, newest first: { v, date, title, lines } */
  function cnVersions(p) {
    if (!p.parsed) {
      p.parsed = p.notes.split(/\n\s*\n/).map(function (block) {
        var lines = block.split("\n"), head = lines[0].split(" | ");
        return { v: head[0], date: head[1], title: head[2], lines: lines.slice(1) };
      });
    }
    return p.parsed;
  }
  function cnIndex(p, v) {
    var list = cnVersions(p), w = String(v || "").toLowerCase(), i = -1;
    list.forEach(function (x, k) {
      if (i === -1 && (x.v.toLowerCase() === w || (cnInstalled(p, x.v) && p.installed.toLowerCase() === w))) { i = k; }
    });
    return i;
  }
  function cnInstalled(p, v) {
    return !!p.installed && (p.installed === v || p.installed.indexOf(v + "-") === 0);
  }
  /* A link of the document. key names its place on the page (older,
     newer, up...), so after a page change the focus returns to the link
     in the same place */
  function cnLink(label, cmd, key) {
    var b = scr().cmdButton(label, cmd);
    if (key) { b.dataset.cnKey = key; }
    return b;
  }
  /* The navigation bar of a page: a link to the left (older, previous),
     a middle part and a link to the right (newer, next). Each part is
     [label, command, key] or null; a part with no command shows nothing. */
  function cnBar(left, middle, right) {
    var d = scr().el("nav", "ln cn-bar");
    d.setAttribute("aria-label", S.t("CHANGE NOTES"));
    [[left, "cn-left", "< ", ""], [middle, "cn-mid", "", ""], [right, "cn-right", "", " >"]].forEach(function (slot) {
      var box = scr().el("span", slot[1]), part = slot[0];
      if (part && part[1]) {
        var b = cnLink("", part[1], part[2]);
        if (slot[2]) { b.appendChild(cnArrow(slot[2])); }
        b.appendChild(document.createTextNode(part[0]));
        if (slot[3]) { b.appendChild(cnArrow(slot[3])); }
        box.appendChild(b);
      } else if (part) {
        box.textContent = part[0];
      }
      d.appendChild(box);
    });
    return d;
  }
  /* An arrow that screen readers skip, since the label says the direction */
  function cnArrow(text) {
    var a = scr().el("span", "", text);
    a.setAttribute("aria-hidden", "true");
    return a;
  }
  /* The path from the program list to this page: links up, then the page */
  function cnPath(steps) {
    var d = scr().el("nav", "ln cn-path");
    d.classList.add("dim");
    d.setAttribute("aria-label", S.t("CHANGE NOTES"));
    steps.forEach(function (st, i) {
      if (i) { d.appendChild(document.createTextNode(" / ")); }
      if (st[1]) { d.appendChild(cnLink(st[0], st[1], "path" + i)); }
      else { var here = scr().el("span", "", st[0]); here.setAttribute("aria-current", "page"); d.appendChild(here); }
    });
    return d;
  }
  /* A line of notes, its [[program version|text]] links made buttons; a
     link to a program not listed yet stays text */
  function cnLine(text, parent) {
    var re = /\[\[([^\]|\s]+)(?: ([^\]|]+))?\|([^\]]+)\]\]/g, at = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > at) { cnText(text.slice(at, m.index), parent); }
      /* A link to a database entry, such as [[system/cpuinfo|/proc/cpuinfo]] */
      if (m[1].indexOf("/") !== -1) {
        var entry = S.entryById(m[1]);
        if (entry && S.entryShown(entry) && S.isUnlocked(m[1].split("/")[0])) { parent.appendChild(cnLink(m[3], "open " + m[1])); }
        else { parent.appendChild(scr().el("span", "dim", S.t("[not listed yet]"))); cnLine.hidden++; }
        at = re.lastIndex; continue;
      }
      var target = cnFind(m[1]);
      if (target && (!m[2] || cnIndex(target, m[2]) !== -1)) {
        parent.appendChild(cnLink(m[3], "changenote " + target.id + (m[2] ? " " + m[2] : "")));
      } else {
        /* A program that is not listed yet: its name is withheld, and the
           page says that links are hidden */
        parent.appendChild(scr().el("span", "dim", (S.CHANGENOTES || []).some(function (q) { return q.id === m[1]; }) ? S.t("[not listed yet]") : m[3]));
        cnLine.hidden++;
      }
      at = re.lastIndex;
    }
    if (at < text.length) { cnText(text.slice(at), parent); }
    return parent;
  }
  cnLine.hidden = 0;
  /* A full-width listing with fixed columns, so the tables of one page
     line up; cls names the column widths (cn-programs, cn-versions) */
  /* A full-width listing with fixed columns, so the tables of one page
     line up; cls names the column widths (cn-programs, cn-versions). Text
     cells get their terms linked by cnText */
  function cnTable(rows, cls) {
    var t = shellTable(rows.map(function (r) {
      return r.map(function (c) {
        return c.node ? c : { node: cnText(c.text, scr().el("span", "")), cls: c.cls };
      });
    })), table = t.querySelector("table");
    table.classList.add("changenotes");
    table.classList.add(cls);
    return t;
  }
  /* Plain text with its terms linked to the CESEA field handbook: the
     first mention of each note on a page becomes a handbook link, which
     opens the note under the page in VIEW, as a footnote.
     cnText.seen is reset at the start of each page. */
  function cnText(text, parent) {
    if (!cnText.re) {
      var terms = S.CHANGENOTE_TERMS || [];
      cnText.keys = {};
      terms.forEach(function (t) { cnText.keys[t[0]] = t[1]; });
      cnText.re = new RegExp("(?<![\\w-])(" + terms.map(function (t) { return t[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(?![\\w-])", "g");
    }
    var re = cnText.re, at = 0, m;
    re.lastIndex = 0;
    text = String(text);
    while ((m = re.exec(text))) {
      var key = cnText.keys[m[1]], note = key && S.i18n.note(key);
      if (!note || cnText.seen[key]) { continue; }
      cnText.seen[key] = true;
      if (m.index > at) { parent.appendChild(document.createTextNode(text.slice(at, m.index))); }
      var term = scr().cmdButton(m[1], "note " + key, "term");
      term.title = S.noteLabel(note);
      parent.appendChild(term);
      at = m.index + m[1].length;
    }
    if (at < text.length) { parent.appendChild(document.createTextNode(text.slice(at))); }
    return parent;
  }
  cnText.seen = {};
  /* A note in a box: what is left out of the page */
  function cnNote(text) {
    var d = scr().el("div", "ln cn-note", text);
    return d;
  }
  /* A page: the path, the title, a line under the title, then the parts */
  function cnEntry(path, title, sub, parts) {
    var wrap = scr().el("div", "entry changenote");
    if (path) { wrap.appendChild(path); }
    wrap.appendChild(scr().el("div", "entry-title", title));
    if (sub) { wrap.appendChild(typeof sub === "string" ? cnText(sub, scr().el("div", "ln cn-sub")) : sub); }
    parts.forEach(function (n) { if (n) { wrap.appendChild(n); } });
    return wrap;
  }
  /* The mark of the installed version */
  function cnTag() {
    return scr().el("span", "cn-tag", S.t("installed"));
  }
  /* A page with more rows than this repeats its bar at the foot */
  var CN_LONG = 12;
  /* Show a page; a page opened from a link in VIEW keeps the focus on the
     link in the same place, so OLDER or NEWER can be pressed again */
  function cnShow(title, build) {
    var a = document.activeElement, key = a && a.dataset && a.closest && a.closest(".viewer") ? a.dataset.cnKey : null;
    S.display(title, build);
    if (key) {
      var next = document.querySelector(".viewer .v-body [data-cn-key='" + key + "']");
      if (next) { next.focus({ preventScroll: true }); }
    }
  }
  /* The program list: one block per group, one line per program */
  function cnList() {
    cnShow(S.t("CHANGE NOTES"), function () {
      var parts = [], list = cnPrograms(), hidden = cnHidden();
      cnText.seen = {};
      (S.CHANGENOTE_GROUPS || []).forEach(function (g) {
        var inGroup = list.filter(function (p) { return p.group === g; });
        if (!inGroup.length) { return; }
        parts.push(scr().el("div", "ln cn-group", g));
        /* One row per program: name, installed version, what it is */
        parts.push(cnTable(inGroup.map(function (p) {
          var inst = cnVersions(p).filter(function (x) { return cnInstalled(p, x.v); })[0];
          return [
            { node: cnLink(p.name, "changenote " + p.id) },
            inst ? { node: cnLink(inst.v, "changenote " + p.id + " " + inst.v) } : { text: S.t("not installed"), cls: "dim" },
            { text: p.what, cls: "dim" }
          ];
        }), "cn-programs"));
      });
      if (hidden) { parts.push(cnNote(S.tn("{n} more programs are listed once their sections are open.", hidden))); }
      return cnEntry(null, S.t("CHANGE NOTES"), S.t("Programs on this terminal. Open one to see its versions."), parts);
    });
  }
  /* A program: what it is, its fields, then its versions by decade */
  function cnProgram(p) {
    var order = cnOrdered(), k = order.indexOf(p), prev = order[k - 1], next = order[k + 1];
    var bar = function (foot) {
      return cnBar(
        prev && [prev.name, "changenote " + prev.id, "prev-program"],
        foot ? [S.t("ALL PROGRAMS"), "changenote", "up"] : [S.t("{n} of {total}", { n: k + 1, total: order.length })],
        next && [next.name, "changenote " + next.id, "next-program"]);
    };
    cnShow(p.name, function () {
      /* The line under the title comes first on the page, so its terms
         are linked first */
      cnText.seen = {};
      var sub = cnText(p.what, scr().el("div", "ln cn-sub"));
      var list = cnVersions(p), inst = list.filter(function (x) { return cnInstalled(p, x.v); })[0];
      var fields = scr().el("dl", "fields cn-fields"), add = function (label, node) {
        fields.appendChild(scr().el("dt", "", label));
        var dd = scr().el("dd", "");
        if (typeof node === "string") { dd.textContent = node; } else { dd.appendChild(node); }
        fields.appendChild(dd);
      };
      add(S.t("Installed"), inst ? cnLink(p.installed, "changenote " + p.id + " " + inst.v, "installed") : S.t("not installed"));
      add(S.t("Changelog"), p.path);
      add(S.t("Group"), p.group);
      /* The versions in one table per decade: number, date, title */
      var parts = [fields, bar(false)], decades = [];
      list.forEach(function (x) {
        var y = (/(\d{4})$/.exec(x.date) || [])[1], d = y ? y.slice(0, 3) + "0s" : "";
        if (!decades.length || decades[decades.length - 1].name !== d) { decades.push({ name: d, rows: [] }); }
        var title = cnText(x.title, scr().el("span", ""));
        if (cnInstalled(p, x.v)) { title.appendChild(cnTag()); }
        decades[decades.length - 1].rows.push([
          { node: cnLink(x.v, "changenote " + p.id + " " + x.v) },
          { text: x.date, cls: "dim" },
          { node: title }
        ]);
      });
      decades.forEach(function (d) {
        parts.push(scr().el("div", "ln cn-group", d.name));
        parts.push(cnTable(d.rows, "cn-versions"));
      });
      if (list.length > CN_LONG) { parts.push(bar(true)); }
      return cnEntry(cnPath([[S.t("CHANGE NOTES"), "changenote"], [p.name]]), p.name, sub, parts);
    });
  }
  /* A version: its title and date, then its changes. The position
     counts from the oldest version, which is 1 */
  function cnVersion(p, i) {
    var list = cnVersions(p), x = list[i], older = list[i + 1], newer = list[i - 1];
    var bar = function (foot) {
      return cnBar(
        older && [S.t("OLDER: {version}", { version: older.v }), "changenote " + p.id + " " + older.v, "older"],
        foot ? [S.t("ALL VERSIONS"), "changenote " + p.id, "up"] : [S.t("{n} of {total}", { n: list.length - i, total: list.length })],
        newer && [S.t("NEWER: {version}", { version: newer.v }), "changenote " + p.id + " " + newer.v, "newer"]);
    };
    cnShow(p.name + " " + x.v, function () {
      /* The changes: lists of "- " lines, and the other lines as headings
         over the lists that follow them */
      var blocks = [], ul = null;
      cnLine.hidden = 0;
      cnText.seen = {};
      var sub = cnText(x.title, scr().el("div", "ln cn-sub"));
      x.lines.forEach(function (l) {
        if (/^# /.test(l)) {
          blocks.push(scr().el("div", "ln cn-group", l.slice(2))); ul = null; return;
        }
        if (!/^- /.test(l)) {
          blocks.push(scr().el("div", "ln cn-subhead", l)); ul = null; return;
        }
        if (!ul) { ul = scr().el("ul", "cn-changes"); blocks.push(ul); }
        var li = scr().el("li", "ln"), dash = scr().el("span", "cn-dash", "- ");
        dash.setAttribute("aria-hidden", "true");
        li.appendChild(dash);
        ul.appendChild(cnLine(l.slice(2), li));
      });
      var changes = scr().el("div", "cn-body");
      blocks.forEach(function (b) { changes.appendChild(b); });
      var meta = scr().el("div", "ln cn-meta", x.date);
      if (cnInstalled(p, x.v)) { meta.appendChild(cnTag()); }
      return cnEntry(cnPath([[S.t("CHANGE NOTES"), "changenote"], [p.name, "changenote " + p.id], [x.v]]), p.name + " " + x.v, sub, [
        meta,
        bar(false),
        blocks.length ? changes : null,
        cnLine.hidden ? cnNote(S.tn("{n} links in these notes open once their sections are open.", cnLine.hidden)) : null,
        x.lines.length > CN_LONG ? bar(true) : null
      ]);
    });
  }
  var C = {
    /* The agent joke (agent.js), left out of help */
    ntorch: function () { S.agent.start("ntorch"); },
    claude: function () { S.agent.start("claude"); },
    codex: function () { S.agent.start("codex"); },
    chatgpt: function () { S.agent.start("chatgpt"); },
    help: function () {
      S.display(S.t("HELP"), function () {
        var wrap = scr().el("div", "entry");
        wrap.appendChild(scr().el("div", "entry-title", S.t("COMMANDS AND KEYS")));
        var dl = scr().el("dl", "fields help");
        var add = function (h) {
          if (!h[0]) {
            return;
          } dl.appendChild(scr().el("dt", "", S.t(h[0]))); dl.appendChild(scr().el("dd", "dim", S.tc(h[1])));
        };
        HELP.forEach(function (h) {
          add([syntax(h), h[2]]);
        });
        add( [
          "",
          ""
        ]);
        S.SHORTCUTS.forEach(add);
        wrap.appendChild(dl);
        [
          [
            "",
            ""
          ],
          [
            "F1 to F10",
            "actions in the bar at the bottom"
          ],
          [
            "CTRL+B then O",
            "next pane, arrows also work"
          ],
          [
            "CTRL+B then Z",
            "zoom the pane"
          ],
          [
            "POP OUT SHELL",
            "only SHELL pops out of DESK; FILES, VIEW and REPORT stay together"
          ],
          [
            "POP IN SHELL",
            "return SHELL to its original place in DESK"
          ],
          [
            "Context menu on a pane",
            "zoom a pane; also CLOSE for REPORT and WATCH, pop out or pop in for SHELL, and HIDE INBOX or SHOW INBOX for the mail panes on a narrow screen"
          ],
          [
            "Output redirected to VIEW",
            "the shell records this when a typed command opens content in VIEW, or a message in MAIL"
          ],
          [
            "Shell results and Panel results",
            "Setup choices: Shell results IN SHELL prints what typed commands show in SHELL; Panel results BOTH also prints what FILES and the F keys show, and still opens their windows"
          ],
          [
            "Shell-only DESK",
            "Setup switch: keep only SHELL on DESK. MAIL and WATCH stay available; messages still open in MESSAGE."
          ],
          [
            "MAIL and MESSAGE",
            "MAIL lists the messages; MESSAGE beside it shows the one you open, and shows messages only"
          ],
          [
            "HIDE INBOX and SHOW INBOX",
            "on a narrow screen, give MESSAGE the whole page or bring the inbox back above it"
          ],
          [
            "Pane divider",
            "drag the line between two panes to resize them, or focus it and use the arrow keys; a double click returns to the default size"
          ],
          [
            "CTRL+B then :",
            "command prompt"
          ],
          [
            "FILES keyboard navigation",
            "use the arrow keys to move; left and right switch columns; Enter opens; Tab leaves the list"
          ],
          [
            "Fill a report with the keyboard",
            "select a blank in REPORT, select an entry in FILES, then press F4; or type fill, a blank number and an entry name in SHELL"
          ],
          [
            "Keyboard focus",
            "Tab moves forward through controls; Shift+Tab moves backward; Escape closes a dialog or menu"
          ]
        ].forEach(function (h) {
          add(h);
        });
        return wrap;
      });
    },
    ls: function (a) {
      var target = a[0] ? S.secId(a[0]) : S.state.cwd;
      if (target === ".." || target === "/") {
        target = "";
      }
      if (!target) {
        listRoot(); return;
      }
      if (!S.sectionById(target)) {
        err(S.t("No section called {name}.", { name: a[0] })); return;
      }
      if (!S.isUnlocked(target)) {
        lockedMsg(target); return;
      }
      listSection(target);
    },
    cd: function (a) {
      var t = a[0] === ".." || a[0] === "/" || a[0] === "~" ? a[0] : S.secId(a[0]);
      if (!t || t === ".." || t === "/" || t === "~") {
        S.state.cwd = ""; S.prompt(); S.save(); listRoot(); return;
      }
      if (!S.sectionById(t)) {
        err(S.t("No section called {name}.", { name: a[0] })); return;
      }
      if (!S.isUnlocked(t)) {
        lockedMsg(t); return;
      }
      S.state.cwd = t; S.prompt(); S.save();
      listSection(t);
    },
    open: function (a) {
      if (!a[0]) {
        err(S.tc("Type {open} and an entry name, like {open} bio/GATE.")); return;
      }
      var e = resolveEntry(a[0]);
      if (!e) {
        if (S.sectionById(S.secId(a[0]))) {
          C.cd(a); return;
        }
        err(S.tc("No entry called {name}. Type {ls} to see names.", { name: a[0] }));
        return;
      }
      var sec = e.id.split("/")[0];
      if (!S.isUnlocked(sec)) {
        lockedMsg(sec); return;
      }
      if (e.action) {
        /* The change notes and the two games count as read once opened,
           and are grayed like any read entry */
        if (/^(changenote|troika|disassembly)$/.test(e.action)) { markRead(e.id); }
        ( {
          settings: S.settingsDialog,
          storage: S.storagePage,
          tutorial: S.tut.refresher,
          about: S.about,
          changenote: function () { C.changenote([]); },
          troika: S.troika.open,
          disassembly: S.disassembly.open
        })[e.action](); return;
      }
      printEntry(e);
    },
    note: function (a) {
      var n = S.i18n.note((a[0] || "").toLowerCase());
      if (!n) {
        err(a[0] ? S.t("No handbook note for {name}.", { name: a[0] }) : S.t("No handbook note for that.")); return;
      }
      S.snd.tick();
      S.display(n[0], function () {
        var box = scr().el("div", "note");
        box.appendChild(S.speakText(scr().el("div", "note-title"), n[0]));
        box.appendChild(S.speakText(scr().el("div", "note-text"), n[1]));
        box.appendChild(scr().el("div", "dim note-source", S.noteSource(n)));
        return box;
      }, true);
    },
    unlock: function (a) {
      var sec = S.secId(a[0]);
      var lock = S.sectionById(sec) && S.LOCKS[sec];
      if (!lock) {
        err(S.tc("Type {unlock} and a locked section, like {unlock} archive {pw}.", { pw: S.t("PASSWORD") })); return;
      }
      if (S.isUnlocked(sec)) {
        scr().line(S.t("{name} is already open.", { name: S.sectionById(sec).name }), "dim"); return;
      }
      var given = a.slice(1).map(function (x) {
        return x.toLowerCase();
      });
      /* A key (Design) counts its characters, so the groups may be typed
         together, apart or with dashes */
      if (lock.key || lock.sort) {
        given = [given.join("").replace(/-/g, "")];
      } else if (given.length < lock.parts.length) {
        err(S.tn("{name} needs {n} parts.", lock.parts.length, { name: S.sectionById(sec).name })); return;
      }
      var ok = lock.key ? given[0] === lock.parts.join("") : lock.parts.every(function (p, i) {
        return given[i] === p;
      });
      if (!ok) {
        err(S.t("Password rejected.")); return;
      }
      S.state.unlocked.push(sec);
      S.save();
      S.snd.unlock(); S.snd.hdd(5);
      S.feedback(S.t("{name} unlocked.", { name: S.sectionById(sec).name }), "ok");
      /* A section that waits for this one (History after Design) appears */
      S.SECTIONS.forEach(function (s) {
        if (s.after === sec && S.sectionById(s.id)) {
          scr().line(S.t("A new section appears in /: {name}.", { name: s.name.toUpperCase() }), "warn");
        }
      });
      if (S.outWindow()) {
        S.ex.goSection(sec); S.ui.open("FILES");
      }
      if (S.outShell()) {
        C.cd([sec]);
      }
    },
    mail: function (a) {
      if (a[0]) {
        readMail(parseInt(a[0], 10)); return;
      }
      if (S.outWindow() && S.ui.open("MAIL")) {
        S.mailpane.render();
        if (!S.outShell()) {
          return;
        }
      }
      var m = S.state.mail;
      if (!m.length) {
        scr().line(S.state.pending.length ? S.t("No messages yet. The uplink is receiving.") : S.t("No messages."), "dim"); return;
      }
      scr().node(function () {
        return shellTable(m.map(function (x, i) {
          return [
            {
              node: scr().cmdButton(S.t("MSG {num}", { num: ("00" + (i + 1)).slice(-3) }), "mail " + (i + 1))
            },
            {
              text: S.fmtTime(x.t),
              cls: "dim"
            },
            {
              text: x.read ? "AUDIT DESK 4" : S.t("AUDIT DESK 4, unread"),
              cls: x.read ? "dim" : "warn"
            }
          ];
        }));
      });
    },
    report: function (a) {
      if (a[0]) {
        S.rep.show(a[0]); return;
      }
      var inShellOnly = S.tmux.shellOnly && S.tmux.shellOnly();
      if (S.outWindow() && !inShellOnly && S.ui.open("REPORT")) {
        S.rep.render(); S.emit("report-open");
        if (!S.outShell()) {
          return;
        }
      }
      S.rep.list();
      S.rep.printActive();
      if (inShellOnly) {
        S.ui.open("SHELL"); S.emit("report-open");
      }
    },
    settings: function () {
      S.settingsDialog();
    },
    storage: function () {
      S.storagePage();
    },
    about: function () {
      S.about();
    },
    tutorial: function () {
      S.tut.refresher();
    },
    mode: function (a) {
      var m = S.i18n.arg(a[0]);
      if (m !== "tmux" && m !== "desktop") {
        m = S.isDesktop() ? "tmux" : "desktop";
      }
      S.setMode(m);
    },
    watch: function () {
      var opened = S.outWindow() && S.ui.open("WATCH");
      if (S.outShell()) {
        S.watch.print();
      } else if (!opened) {
        err(S.t("No WATCH pane in this session."));
      }
    },
    devnotes: function () {
      S.devnotes();
    },
    /* changenote, changenote PROGRAM, changenote PROGRAM VERSION */
    changenote: function (a) {
      if (S.isUnlocked("system")) { markRead("system/changelog"); }
      /* The drive reads the page, as for an entry (printEntry in
         listing.js) */
      S.snd.hdd(4);
      if (!a[0]) {
        cnList(); return;
      }
      var p = cnFind(a[0]);
      if (!p) {
        err(S.tc("No change notes for {name}. Type {changenote} to list the programs.", { name: a[0] })); return;
      }
      if (!a[1]) {
        cnProgram(p); return;
      }
      var i = cnIndex(p, a[1]);
      if (i === -1) {
        err(S.tc("{name} has no version {version}. Type {changenote} {id} to list its versions.", { name: p.name, version: a[1], id: p.id })); return;
      }
      cnVersion(p, i);
    },
    select: function (a) {
      S.rep.select(a[0], a[1]);
    },
    fill: function (a) {
      if (a.length < 2) {
        err(S.tc("Type {fill}, a blank number and an entry, like {fill} 2 bio/GATE.")); return;
      }
      var e = resolveEntry(a[1]);
      S.rep.fill(a[0], e ? e.id : a[1]);
    },
    unfill: function (a) {
      S.rep.unfill(a[0]);
    },
    submit: function (a) {
      S.rep.submit(a[0]);
    },
    hints: function (a) {
      if (S.tmux.attached && !S.ui.isOpen("SHELL")) {
        S.ui.open("SHELL");
      }
      var v = S.i18n.arg(a[0]);
      if (v === "on" || v === "off") {
        S.state.hintsOn = v === "on"; S.save();
        scr().line(v === "on" ? S.t("Hints page shown.") : S.t("Hints page hidden."), "ok");
        if (v === "on") {
          hintsPage();
        }
        return;
      }
      hintsPage();
    },
    hint: function (a) {
      revealHint(a[0]);
    },
    light: function (a) {
      var v = S.i18n.arg(a[0]);
      if (v !== "on" && v !== "off") {
        scr().line(S.tc(S.state.light ? "Hint light is on. Type {light} {on} or {light} {off}." : "Hint light is off. Type {light} {on} or {light} {off}."), "dim"); return;
      }
      S.state.light = v === "on"; S.hintLit = false; S.save(); S.status();
      scr().line(v === "on" ? S.t("Hint light on. The HINT mark lights when an open entry answers a blank.") : S.t("Hint light off."), "ok");
    },
    sound: function (a) {
      var v = S.i18n.arg(a[0]);
      var on = v === "on" ? true : v === "off" ? false : !S.state.sound;
      S.state.sound = on; S.save(); S.snd.setOn(on); S.status();
      scr().line(on ? S.t("Sound on.") : S.t("Sound off."), "ok");
    },
    clear: function () {
      scr().clear();
    },
    date: function () {
      scr().line(S.t("{time} UTC, Selk site clock", { time: S.fmtTime(S.state.clock) }));
    },
    whoami: function () {
      scr().line(S.t("Supervisor {name}, Selk site, crew of 1", { name: S.state.name }));
    },
    /* The kernel ring buffer of SELK-T01, which the supervisor group may
       read. Kernel text stays in English in every language */
    dmesg: function () {
      dmesgLines().forEach(function (l) {
        scr().line("[" + ("     " + l[0].toFixed(6)).slice(-12) + "] " + l[1], l[2], 0);
      });
    },
    credits: function () {
      scr().line(S.t("CREDITS"), "head");
      scr().line(S.t("Original concept and story."));
      scr().line(S.t("Coding and implementation assisted by Claude (Anthropic) and Codex (OpenAI)."));
      scr().line(S.t("Pixel scenes and live camera drawn for this game."));
      scr().line(S.t("Fonts: IBM Plex Mono and VT323, SIL Open Font License 1.1."));
      scr().node(function () {
        var a = document.createElement("a");
        a.href = "notes/credits.html"; a.className = "lnk act"; a.textContent = S.t("FULL CREDITS AND REFERENCES");
        var d = scr().el("div", "ln"); d.appendChild(a); return d;
      });
    },
    decide: function () {
      S.end.decide();
    },
    choose: function (a) {
      S.end.choose(a[0]);
    },
    oxygen: function (a) {
      S.end.oxygen(a[0]);
    },
    logout: function () {
      S.logout();
    },
    reset: function (a) {
      if (S.i18n.arg(a[0]) !== "yes") {
        S.snd.error(); scr().line(S.tc("This erases all progress. Type {reset} {yes} to confirm."), "err"); return;
      }
      S.reset(); location.reload();
    }
  };
  C.dir = C.ls; C.cat = C.open; C.read = C.open; C.man = C.help; C.cls = C.clear;
  S.commandNames = Object.keys(HELP.reduce(function (o, h) {
    o[h[0].split(" ")[0]] = 1; return o;
  }, {})).concat( [
    "hint",
    "date",
    "whoami",
    "dmesg"
  ]);
  /* Where the running command came from, read by S.outShell():
     - "typed": the command line, the tmux prompt (Ctrl+B then :) and the HOME
       / README opened at first sign-in
     - "panel": the FILES panel, the function keys, the status bar buttons and
       the Alt shortcuts, which pass echo = false
     - "click": a link in the output, a report page button, a dialog, the
       context menu, the tour or a desktop icon
     - null: no command is running */
  S.cmdOrigin = null;
  /* True while a command runs whose command line was printed (S.run with echo
     !== false). S.scr.group reads it, since the echo already gives the gap
     above the output. */
  S.cmdEchoed = false;
  /* Where the result of the running command goes: { shell, window }. Both can
     be true. The first rule that matches applies:
     - session not attached yet: shell
     - typed: Shell results decides
     - panel in tmux mode with Shell results IN SHELL: window, and shell with
       Panel results BOTH
     - anything else: window

     docs/shell.md has the details. */
  function route() {
    var s = S.state.settings;
    if (!S.tmux || !S.tmux.attached) {
      return { shell: true, window: false };
    }
    if (S.cmdOrigin === "typed") {
      return { shell: s.shellOut === "shell", window: s.shellOut !== "shell" };
    }
    if (S.cmdOrigin === "panel" && !S.isDesktop() && s.shellOut === "shell" && s.panelOut === "both") {
      return { shell: true, window: true };
    }
    return { shell: false, window: true };
  }
  /* True when the running command prints its result in the SHELL log */
  S.outShell = function () { return route().shell; };
  /* True when the running command opens the window for its result */
  S.outWindow = function () { return route().window; };
  /* Run a command for a clicked control. echo works as in S.run: false leaves
     the command line out of the log. */
  S.runClick = function (raw, echo) {
    S.run(raw, echo, "click");
  };
  /* Parse and run one command line. echo false leaves the command line out of
     the log; any other value prints it after the prompt. origin is "typed",
     "panel" or "click" (S.cmdOrigin); when omitted, an echoed command counts
     as typed and an unechoed one as panel. The output of an unechoed command
     goes into one output group (S.scr.group), apart from the lines around it. */
  S.run = function (raw, echo, origin) {
    var line = String(raw || "").trim();
    if (!line) {
      return;
    }
    var before = { origin: S.cmdOrigin, echoed: S.cmdEchoed };
    S.cmdOrigin = origin || (echo === false ? "panel" : "typed");
    S.cmdEchoed = echo !== false;
    /* A typed command hides FILES and VIEW again in a shell-only DESK
       (T.endReveal in tmux.js) */
    if (S.cmdOrigin === "typed" && S.tmux && S.tmux.endReveal) {
      S.tmux.endReveal();
    }
    try {
      if (echo === false) {
        /* Unechoed commands of the same word share one group */
        var word = S.i18n.command(line.split(/\s+/)[0]) || line.split(/\s+/)[0];
        S.scr.group(function () { runLine(line, echo); }, "cmd:" + String(word).toLowerCase());
      } else {
        runLine(line, echo);
      }
    } finally {
      S.cmdOrigin = before.origin;
      S.cmdEchoed = before.echoed;
    }
  };
  function runLine(line, echo) {
    if (echo !== false) {
      var first = line.split(/\s+/)[0], canon = S.i18n.command(first);
      var shownLine = first.toLowerCase() === canon && C[canon] ? S.cmdName(canon) + line.slice(first.length) : line;
      /* A command clicked or sent while the agent is open echoes the
         shell prompt with the current section, not agent> */
      scr().line(S.shellPromptText() + " " + shownLine, "echo", 0);
    }
    var parts = line.split(/\s+/);
    var name = S.i18n.command(parts[0]);
    var fn = C[name];
    /* After the finale, any command other than decide, choose and oxygen
       restores the interface */
    if (S.finale && name !== "decide" && name !== "choose" && name !== "oxygen") {
      S.end.release();
    }
    if (!fn) {
      err(S.tc("Unknown command {name}. Type {help}.", { name: parts[0] })); return;
    }
    S.tick(1);
    fn(parts.slice(1));
    S.status();
    if (S.isDesktop() && S.tmux.attached) {
      S.desk.refresh();
    }
  }
})();
