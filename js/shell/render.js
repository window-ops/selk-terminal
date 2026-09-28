/* Turns entry text into real HTML: field lists, tables, paragraphs, system files
   and JSON. Shared by the game and the developer notes page. */
(function () {
  var S = window.SELK = window.SELK || {};
  function mk(tag, cls) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } return n;
  }
  function cells(line) {
    return line.trim().split(/\s{2,}/);
  }
  function cont(line) {
    return /^\s/.test(line);
  }
  function addLine(target, text, inline) {
    target.appendChild(document.createTextNode(" ")); inline(text.trim(), target);
  }
  /* Entry text uses two or more spaces between a label and its value.
     Lines that start with a space continue the value above. */
  S.renderBody = function (text, inline, table) {
    var lines = text.split("\n"), last = null;
    if (table) {
      var wrap = mk("div", "etable-wrap"), t = mk("table", "etable"), head = cells(lines[0]), n = head.length;
      var thead = mk("thead"), hr = mk("tr");
      head.forEach(function (h) {
        var th = mk("th"); th.scope = "col"; inline(h, th); hr.appendChild(th);
      });
      thead.appendChild(hr); t.appendChild(thead);
      var body = mk("tbody");
      lines.slice(1).forEach(function (l) {
        if (cont(l) && last) {
          addLine(last, l, inline); return;
        }
        var c = cells(l), tr = mk("tr");
        c.forEach(function (v, i) {
          var td = mk("td");
          if (i === c.length - 1 && c.length < n) {
            td.colSpan = n - i;
          }
          inline(v, td); tr.appendChild(td); last = td;
        });
        body.appendChild(tr);
      });
      t.appendChild(body); wrap.appendChild(t);
      return wrap;
    }
    var dl = mk("dl", "fields");
    lines.forEach(function (l) {
      if (cont(l) && last) {
        addLine(last, l, inline); return;
      }
      var m = /^(.*?)\s{2,}(.*)$/.exec(l), dt = mk("dt"), dd = mk("dd");
      if (m) {
        inline(m[1], dt); inline(m[2], dd);
      } else {
        inline(l, dd);
      }
      dl.appendChild(dt); dl.appendChild(dd); last = dd;
    });
    return dl;
  };
  S.renderParas = function (text, inline) {
    var d = mk("div", "paras");
    text.split("\n").forEach(function (l) {
      var p = mk("p"); inline(l, p); d.appendChild(p);
    });
    return d;
  };
})();
/* System files: each format becomes real HTML, so nothing needs a pre block or side scrolling */
(function () {
  var S = window.SELK;
  function mk(tag, cls, text) {
    var n = document.createElement(tag); if (cls) {
      n.className = cls;
    } if (text != null) {
      n.textContent = text;
    } return n;
  }
  function dl(pairs) {
    var d = mk("dl", "fields");
    pairs.forEach(function (p) {
      d.appendChild(mk("dt", "", p[0])); d.appendChild(mk("dd", "", p[1]));
    });
    return d;
  }
  function table(head, rows, caption) {
    var wrap = mk("div", "etable-wrap"), t = mk("table", "etable wraps");
    if (caption) {
      t.appendChild(mk("caption", "dim", caption));
    }
    var tr = mk("tr"); head.forEach(function (h) {
      var th = mk("th", "", h); th.scope = "col"; tr.appendChild(th);
    });
    var th = mk("thead"); th.appendChild(tr); t.appendChild(th);
    var tb = mk("tbody");
    rows.forEach(function (r) {
      var x = mk("tr"); head.forEach(function (h, i) {
        x.appendChild(mk("td", "", r[i] || ""));
      }); tb.appendChild(x);
    });
    t.appendChild(tb); wrap.appendChild(t);
    return wrap;
  }
  function comments(lines) {
    return lines.filter(function (l) {
      return /^\s*#/.test(l);
    }).map(function (l) {
      return l.replace(/^\s*#\s?/, "");
    }).join(" ");
  }
  function body(lines) {
    return lines.filter(function (l) {
      return l.trim() && !/^\s*#/.test(l);
    });
  }
  S.renderSys = function (e, text) {
    var box = mk("div", "sysfile"), lines = text.split("\n"), note = comments(lines), rows = body(lines);
    if (e.fmt === "denied") {
      lines.forEach(function (l, i) {
        box.appendChild(mk("p", i ? "dim" : "err", l));
      });
      return box;
    }
    if (note && e.fmt !== "cols") {
      box.appendChild(mk("p", "dim", note));
    }
    if (e.fmt === "kv") {
      box.appendChild(dl(rows.map(function (l) {
        var i = l.indexOf("="); return [
          l.slice(0, i),
          l.slice(i + 1).replace(/^"|"$/g, "")
        ];
      })));
    } else if (e.fmt === "conf") {
      box.appendChild(dl(rows.map(function (l) {
        var m = /^(\S+?):?\s+(.*)$/.exec(l.trim()); return m ? [
          m[1],
          m[2]
        ] : [
          l,
          ""
        ];
      })));
    } else if (e.fmt === "cols") {
      var n = e.cols.length;
      box.appendChild(table(e.cols, rows.map(function (l) {
        var c = l.trim().split(/\s+/);
        return c.length > n ? c.slice(0, n - 1).concat(c.slice(n - 1).join(" ")) : c;
      }), note));
    } else if (e.fmt === "ini") {
      var cur = null, sub = null;
      rows.forEach(function (l) {
        var t = l.trim(), m;
        if ((m = /^\[(.+)\]$/.exec(t))) {
          box.appendChild(mk("div", "sys-sec", m[1])); cur = mk("dl", "fields"); box.appendChild(cur); sub = null; return;
        }
        if ((m = /^(\S+)\s*=\s*\{$/.exec(t))) {
          cur.appendChild(mk("dt", "", m[1])); var dd = mk("dd"); sub = mk("dl", "fields"); dd.appendChild(sub); cur.appendChild(dd); return;
        }
        if (t === "}") {
          sub = null; return;
        }
        if ((m = /^(\S+)\s*=\s*(.*)$/.exec(t))) {
          var tgt = sub || cur; tgt.appendChild(mk("dt", "", m[1])); tgt.appendChild(mk("dd", "", m[2]));
        }
      });
    } else if (e.fmt === "klist") {
      var head = [], i = 0;
      while (i < rows.length && rows[i].indexOf(":") !== -1 && !/^Valid/.test(rows[i])) {
        var p = rows[i].split(/:\s*/); head.push( [
          p.shift(),
          p.join(":")
        ]); i++;
      }
      box.appendChild(dl(head));
      var hdr = rows[i] ? rows[i].trim().split(/\s{2,}/) : [];
      box.appendChild(table(hdr, rows.slice(i + 1).map(function (l) {
        var c = l.trim().split(/\s+/);
        return [
          c[0] + " " + c[1],
          c[2] + " " + c[3],
          c.slice(4).join(" ")
        ];
      })));
    } else {
      rows.forEach(function (l) {
        box.appendChild(mk("p", "", l));
      });
    }
    return box;
  };
  /* JSON as nested definition lists */
  S.renderJSON = function (v) {
    if (v === null || typeof v !== "object") {
      return mk("span", "json-v", JSON.stringify(v));
    }
    if (Array.isArray(v)) {
      if (!v.length) {
        return mk("span", "json-v", "[ ]");
      }
      var ol = mk("ol", "json-list");
      v.forEach(function (x) {
        var li = mk("li"); li.appendChild(S.renderJSON(x)); ol.appendChild(li);
      });
      return ol;
    }
    var d = mk("dl", "fields json");
    Object.keys(v).forEach(function (k) {
      d.appendChild(mk("dt", "", k)); var dd = mk("dd"); dd.appendChild(S.renderJSON(v[k])); d.appendChild(dd);
    });
    if (!Object.keys(v).length) {
      return mk("span", "json-v", "{ }");
    }
    return d;
  };
})();
