/* Developer notes page (notes/devnotes.html). Builds the answer keys, graph,
   unreliable-text lists and every article from the same data files as the game. */
(function () {
  var S = window.SELK;
  var $ = S.$;
  var tr = function (x) { return S.t ? S.t(x) : x; };
  function esc(x) {
    return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function start() {
  function el(tag, text, cls) {
    var n = document.createElement(tag); if (text != null) {
      n.textContent = tr(text);
    } if (cls) {
      n.className = cls;
    } return n;
  }
  function inline(t, parent) {
    parent.appendChild(document.createTextNode(plain(t)));
  }
  function title(id) {
    if (S.entryTitle) { return S.entryTitle(id); }
    var p = id.split("/"); return p[0].toUpperCase() + " / " + p[1];
  }
  function plain(t) {
    return t.replace(/\{([^|}]+)\|[^}]+\}/g, "$1").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, id, l) {
      return l || id.split("/")[1];
    }).replace(/@NAME@/g, "[player name]");
  }
  function noteKeys(t) {
    var out = [], m, re = /\{[^|}]+\|([^}]+)\}/g; while ((m = re.exec(t))) {
      if (out.indexOf(m[1]) === -1) {
        out.push(m[1]);
      }
    } return out;
  }
  function table(head, rows) {
    var t = el("table"), tr = el("tr");
    head.forEach(function (h) {
      tr.appendChild(el("th", h));
    }); t.appendChild(tr);
    rows.forEach(function (r) {
      var x = el("tr"); r.forEach(function (c) {
        x.appendChild(el("td", c));
      }); t.appendChild(x);
    });
    return t;
  }
  $("graph").innerHTML =
  '<svg viewBox="0 0 680 786" role="img" aria-label="' + esc(tr("Sections, passwords, reports and endings")) + '" font-family="IBM Plex Mono, monospace" font-size="12">' +
  '<defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#8F9A9A" stroke-width="1.5"/></marker></defs>' +
  '<g fill="none" stroke="#8F9A9A" stroke-width="1" marker-end="url(#a)">' +
  /* Login, reports 1 and 2, the open sections and the locked ones */
  '<line x1="340" y1="56" x2="340" y2="78"/><line x1="300" y1="116" x2="130" y2="148"/><line x1="340" y1="116" x2="340" y2="148"/><line x1="380" y1="116" x2="550" y2="148"/>' +
  '<line x1="130" y1="190" x2="130" y2="228"/><line x1="340" y1="190" x2="340" y2="228"/><line x1="550" y1="190" x2="550" y2="228"/>' +
  /* Archive and Export give the two parts of the Power password; Export hops the 3B channel */
  '<path d="M130 270 L130 318 L248 318"/><path d="M550 270 L550 318 L451 318 A6 6 0 0 0 439 318 L432 318"/>' +
  /* Report 3A reads Archive; report 3B reads Units, Comms and Export */
  '<line x1="130" y1="270" x2="130" y2="386"/>' +
  '<path d="M430 170 L445 170 L445 408 L458 408"/><path d="M430 250 L445 250 L445 408 L458 408"/><line x1="550" y1="270" x2="550" y2="386"/>' +
  /* Report 4 opens after 3A or 3B, and reads Power and Export */
  '<path d="M340 344 L340 468"/><path d="M130 428 L130 490 L248 490"/><path d="M550 428 L550 482 L432 482"/><path d="M640 250 L656 250 L656 500 L432 500"/>' +
  '<line x1="340" y1="510" x2="340" y2="536"/>' +
  /* The final decision lists the five choices in the game's order; habitation splits on oxygen */
  '<path d="M340 578 L340 638"/>' +
  '<path d="M340 612 L92 612 L92 638"/><path d="M340 612 L216 612 L216 638"/><path d="M340 612 L464 612 L464 638"/><path d="M340 612 L588 612 L588 638"/>' +
  '<path d="M588 680 L588 716"/><path d="M588 698 L464 698 L464 716"/>' +
  '</g>' +
  '<rect x="20" y="596" width="640" height="176" rx="6" fill="none" stroke="#8F9A9A" stroke-dasharray="2 4"/>' +
  '<text x="32" y="610" fill="#8F9A9A" font-size="10.5">' + esc(tr("ENDINGS")) + '</text>' +
  box(250, 20, 180, 36, "HOME, SITE", "open at login") +
  box(250, 80, 180, 36, "REPORTS 1, 2", "Site, Bio, Structure") +
  box(40, 150, 180, 40, "BIO, STRUCTURE", "path A, open", "#5E8C7F") +
  box(250, 150, 180, 40, "UNITS", "path B, open", "#7E6FA8") +
  box(460, 150, 180, 40, "SITE / SELK", "names SERKET") +
  box(40, 230, 180, 40, "ARCHIVE", "SERKET", "#5E8C7F", 1) +
  box(250, 230, 180, 40, "COMMS", "55183, stopped repairs", "#7E6FA8", 1) +
  box(460, 230, 180, 40, "EXPORT", "118 from SV-1", "#7E6FA8", 1) +
  box(250, 298, 180, 46, "POWER", "AMBER + 2291", null, 1) +
  box(40, 388, 180, 40, "REPORT 3A", "Archive", "#5E8C7F") +
  box(460, 388, 180, 40, "REPORT 3B", "Units, Comms, Export", "#7E6FA8") +
  box(250, 470, 180, 40, "REPORT 4", "3A or 3B, Power, Export") +
  box(250, 538, 180, 40, "FINAL DECISION", "after Report 4") +
  box(34, 640, 116, 40, "DISMANTLE", "always open") +
  box(158, 640, 116, 40, "RESEARCH", "needs 3A", "#5E8C7F") +
  box(282, 640, 116, 40, "TRANSMIT", "needs 3B", "#7E6FA8") +
  box(406, 640, 116, 40, "EXPORT", "always open") +
  box(530, 640, 116, 40, "HABITATION", "always open") +
  box(406, 718, 116, 40, "OXYGEN KEPT", "oxygen yes") +
  box(530, 718, 116, 40, "OXYGEN STOPPED", "oxygen no") +
  '</svg>';
  function box(x, y, w, h, t, s, c, locked) {
    /* A single section name comes from the section list, so it matches the game */
    var sec = (S.SECTIONS || []).filter(function (z) { return z.id.toUpperCase() === t; })[0];
    t = esc(sec ? sec.name.toUpperCase() : tr(t)); s = esc(tr(s));
    return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#1E2427" stroke="' + (c || "#8F9A9A") + '"' + (locked ? ' stroke-dasharray="4 3"' : '') + '/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + 16) + '" text-anchor="middle" fill="#D6C396" font-size="' + (t.length > 20 ? 10 : 12) + '">' + t + '</text>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + h - 8) + '" text-anchor="middle" fill="#8F9A9A" font-size="10.5">' + s + '</text></g>';
  }
  var src = {
    archive: "site/SELK, field Named after",
    comms: "structure/STOPPED-REPAIRS, column Build",
    export: "units/SV-1, field Temperature",
    power: "archive/LAB.R4 and export/MANIFEST-2291"
  };
  $("locks").appendChild(table( [
    "Section",
    "Password",
    "Found in"
  ], Object.keys(S.LOCKS).map(function (k) {
    return [
      k.toUpperCase(),
      S.LOCKS[k].parts.join(" + ").toUpperCase(),
      src[k]
    ];
  })));
  Object.keys(S.REPORTS).forEach(function (k) {
    var r = S.REPORTS[k];
    $("reports").appendChild(el("h3", r.title));
    $("reports").appendChild(el("p", r.brief, "dim"));
    $("reports").appendChild(table( [
      "Blank",
      "Accepted answers"
    ], r.lines.map(function (ln, i) {
      return [
        (i + 1) + ". " + ln[0].trim() + " ...",
        ln[1].map(title).join(", ")
      ];
    })));
  });
  var u = $("unreliable");
  u.appendChild(el("h3", "False author labels"));
  u.appendChild(table( [
    "Entry",
    "Label",
    "Why it is false"
  ], S.FALSE_LABELS.map(function (id) {
    var e = S.entryById ? S.entryById(id) : S.ENTRIES.filter(function (x) {
      return x.id === id;
    })[0];
    var why = /EX-1/.test(id) ? "signature line names the plant controller" : /MANIFEST/.test(id) ? "HX document certified with key 7" : "staff signature dated inside the long sleep";
    return [
      title(id),
      e.by,
      why
    ];
  })));
  u.appendChild(el("h3", "Model summaries with errors"));
  u.appendChild(table( [
    "Entry",
    "Error"
  ], [
    [
      "STRUCTURE / INDEX",
      "claims all parts are within limits, MAST-01 is over its safe load"
    ],
    [
      "UNITS / SV-1",
      "calls the frost water frost, water cannot form frost at 94 K"
    ],
    [
      "COMMS / INDEX",
      "claims CESEA sent every package, both came through R-14"
    ],
    [
      "POWER / AMBER-SAFETY",
      "claims no fire risk, no test at 94 K exists"
    ]
  ]));
  u.appendChild(el("h3", "Outdated handbook notes"));
  u.appendChild(table( [
    "Note",
    "Edition",
    "Contradicted by"
  ], [
    [
      "Fault model",
      "2084",
      "UNITS / FAULT-MODEL, version 4.0 trained on Earth steel"
    ],
    [
      "Relay",
      "2082",
      "COMMS / RELAY-LIST, R-14 not approved"
    ],
    [
      "Green hydrogen",
      "2080",
      "2096 notes on gray hydrogen and electrolysis"
    ]
  ]));
  Object.keys(S.MESSAGES).forEach(function (k) {
    $("messages").appendChild(el("h3", k.replace("MSG", "MSG ")));
    $("messages").appendChild(S.renderParas(S.MESSAGES[k].body, inline));
  });
  S.ENDINGS.forEach(function (e) {
    var parts = e.choice ? [
      [
        "Oxygen kept",
        e.yes
      ],
      [
        "Oxygen stopped",
        e.no
      ]
    ] : [
      [
        "",
        e
      ]
    ];
    parts.forEach(function (p) {
      $("endings").appendChild(el("h3", e.label + (p[0] ? ", " + p[0].toLowerCase() : "") + (e.needs ? " (needs report " + S.REPORTS[e.needs].code + ")" : "")));
      $("endings").appendChild(S.renderBody(p[1].log.join("\n"), inline));
      $("endings").appendChild(el("p", "Reply" + (e.route ? " via " + e.route : "") + ": " + p[1].reply, "dim"));
    });
  });
  var cur = "";
  S.ENTRIES.forEach(function (e) {
    var sec = e.id.split("/")[0];
    if (sec !== cur) {
      cur = sec; $("articles").appendChild(el("h3", sec.toUpperCase()));
    }
    var head = el("p", (e.path || title(e.id)) + ", " + tr("written by") + ": " + e.by);
    if (S.FALSE_LABELS.indexOf(e.id) !== -1) {
      head.appendChild(el("span", " [false label]", "tag"));
    }
    $("articles").appendChild(head);
    if (e.sys) {
      $("articles").appendChild(S.renderSys(e, e.body.replace(/@USER@/g, "user.id")));
    }
    else {
      $("articles").appendChild(S.renderBody(e.body, inline, e.table));
    }
    var keys = noteKeys(e.body);
    if (keys.length) {
      var ul = el("ul", null, "notes-list");
      keys.forEach(function (k) {
        var n = S.i18n.note(k); if (n) {
          ul.appendChild(el("li", n[0] + " (" + n[2] + "): " + n[1]));
        }
      });
      $("articles").appendChild(ul);
    }
  });
  }
  (S.i18n && S.i18n.ready ? S.i18n.ready : Promise.resolve()).then(start);
})();
