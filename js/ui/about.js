/* About screen and uptime. */
(function () {
  var S = window.SELK, el = S.el;
  /* About */
  S.uptimeText = function () {
    var up = Math.floor((Date.now() - S.bootTime) / 1000);
    return S.t("{h} h {m} min {s} s", { h: Math.floor(up / 3600), m: Math.floor(up / 60) % 60, s: up % 60 });
  };
  S.about = function () {
    var body = [
      [
        "System",
        "CESEA Site OS 7.2"
      ],
      [
        "Interface",
        S.isDesktop() ? "Selk Workbench 1.0" : "tmux 10.7 on Selk shell"
      ],
      [
        "Boot ROM",
        "7.2.1, built 12-03-2079"
      ],
      [
        "Processor",
        "CESEA R-64, radiation hardened, 4 cores, 1.2 GHz"
      ],
      [
        "Memory",
        "64 GB, error-correcting"
      ],
      [
        "Drive 0",
        "4 TB, 5 400 rpm, 61 % free"
      ],
      [
        "Display",
        "amber phosphor CRT, 80 by 30 characters"
      ],
      [
        "Uplink",
        "relay R-09, 74 to 84 min to Earth"
      ],
      [
        "Uptime",
        S.uptimeText(),
        "about-uptime"
      ],
      [
        "Site clock",
        S.clockText() + " UTC",
        "about-clock"
      ]
    ];
    S.dialog( {
      title: "ABOUT SELK OS",
      wide: true,
      build: function (b) {
        var dl = el("dl", "fields");
        body.forEach(function (r) {
          dl.appendChild(el("dt", "", S.t(r[0]))); var dd = el("dd", "", S.t(r[1])); if (r[2]) {
            dd.id = r[2];
          } dl.appendChild(dd);
        });
        b.appendChild(dl);
        b.appendChild(el("div", "dlg-rule"));
        b.appendChild(el("div", "dim", S.t("Original concept and story. Coding and implementation assisted by Claude (Anthropic) and Codex (OpenAI). Fonts under the SIL Open Font License 1.1.")));
      },
      buttons: [
        {
          label: "OK"
        },
        {
          label: "CREDITS",
          /* Opens a page in a new tab, as the title screen's CREDITS */
          sound: "link",
          action: function () {
            window.open("notes/credits.html", "_blank");
          }
        }
      ]
    });
  };
})();
