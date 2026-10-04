/* DISASSEMBLY.RUN (core.js): the start screen, the start of a repair and
   the score card. */
(function () {
  var S = window.SELK, A = S.disassemblyArt, G = S.disassemblyGame;
  /* The start screen: a card for each phone with a drawing of it, the
     part to replace, and START */
  function pickScreen() {
    G.st = { phone: G.st && G.st.phone || "fairphone", part: G.st && G.st.part || "battery", tutorial: !!(G.st && G.st.tutorial),
      edition: G.st && G.st.edition || "transparent" };
    G.cv.hidden = true;
    G.q(".dis-tools").hidden = true;
    var p = G.q(".dis-panel"), n = G.names(), el = S.el;
    p.textContent = "";
    p.appendChild(el("p", "dis-q", S.t("Pick a phone and the part to replace.")));
    var phones = el("div", "dis-phones");
    phones.setAttribute("role", "radiogroup"); phones.setAttribute("aria-label", S.t("Phone"));
    var notes = { fairphone: S.t("2023. The back cover clips off; iFixit gives it 10 out of 10."),
      samsung: S.t("2024. The back glass is glued on.") };
    ["fairphone", "samsung"].forEach(function (id) {
      var b = el("button", "dis-phone"); b.type = "button"; b.dataset.sound = "choice";
      b.setAttribute("role", "radio"); b.setAttribute("aria-checked", G.st.phone === id ? "true" : "false");
      var c = document.createElement("canvas"); c.width = A.PW * A.K * 0.5; c.height = A.PH * A.K * 0.5;
      var x = c.getContext("2d"); x.imageSmoothingEnabled = false;
      A.preview(x, id, G.ORDER[id], 0.5, G.st.edition);
      b.appendChild(c);
      var t = el("span", "dis-phone-text");
      t.appendChild(el("strong", "", n.phone[id]));
      t.appendChild(el("span", "", notes[id]));
      b.appendChild(t);
      b.addEventListener("click", function () {
        G.st.phone = id;
        [].forEach.call(phones.children, function (o) { o.setAttribute("aria-checked", o === b ? "true" : "false"); });
        edLabel.hidden = edRow.hidden = id !== "fairphone";
      });
      phones.appendChild(b);
    });
    p.appendChild(phones);
    /* The Fairphone's edition: transparent, Sky Blue or Matte Black */
    var edLabel = el("p", "dis-label", S.t("Edition")), edRow = el("div", "dis-row");
    edRow.setAttribute("role", "radiogroup"); edRow.setAttribute("aria-label", S.t("Edition"));
    [["transparent", S.t("Transparent")], ["blue", S.t("Sky Blue")], ["black", S.t("Matte Black")]].forEach(function (e) {
      var b = el("button", "btn", e[1]); b.type = "button"; b.dataset.sound = "choice";
      b.setAttribute("role", "radio"); b.setAttribute("aria-checked", G.st.edition === e[0] ? "true" : "false");
      b.addEventListener("click", function () {
        G.st.edition = e[0];
        [].forEach.call(edRow.children, function (o) { o.setAttribute("aria-checked", o === b ? "true" : "false"); });
        var c = phones.querySelector("canvas");
        A.preview(c.getContext("2d"), "fairphone", G.ORDER.fairphone, 0.5, G.st.edition);
      });
      edRow.appendChild(b);
    });
    edLabel.hidden = edRow.hidden = G.st.phone !== "fairphone";
    p.appendChild(edLabel);
    p.appendChild(edRow);
    var row = el("div", "dis-row");
    row.setAttribute("role", "radiogroup"); row.setAttribute("aria-label", S.t("Part"));
    Object.keys(n.part).forEach(function (id) {
      var b = el("button", "btn", n.part[id]); b.type = "button"; b.dataset.sound = "choice";
      b.setAttribute("role", "radio"); b.setAttribute("aria-checked", G.st.part === id ? "true" : "false");
      b.addEventListener("click", function () {
        G.st.part = id;
        [].forEach.call(row.children, function (o) { o.setAttribute("aria-checked", o === b ? "true" : "false"); });
      });
      row.appendChild(b);
    });
    p.appendChild(el("p", "dis-label", S.t("Part to replace")));
    p.appendChild(row);
    var foot = el("div", "dis-row");
    var tut = el("button", "btn dis-switch"); tut.type = "button"; tut.dataset.sound = "switch";
    tut.setAttribute("role", "switch");
    function showTut() {
      tut.setAttribute("aria-checked", G.st.tutorial ? "true" : "false");
      tut.textContent = G.st.tutorial ? S.t("TUTORIAL: ON") : S.t("TUTORIAL: OFF");
    }
    tut.addEventListener("click", function () { G.st.tutorial = !G.st.tutorial; showTut(); });
    showTut();
    var go = el("button", "btn primary", S.t("START")); go.type = "button"; go.dataset.sound = "action";
    go.addEventListener("click", begin);
    foot.appendChild(go); foot.appendChild(tut);
    p.appendChild(foot);
    p.appendChild(el("p", "dis-note", S.t("The phones here are simplified drawings for a game and may not be accurate. The author has taken apart only a Fairphone, and it was a Fairphone 4.")));
    G.fit();
  }
  function picture() {
    A.scene(G.st.phone, G.ORDER[G.st.phone], G.st);
  }
  function begin() {
    G.st.removed = []; G.st.done = {}; G.st.minutes = 0; G.st.mistakes = 0; G.st.damaged = []; G.st.tools = []; G.st.actions = 0;
    G.st.drag = null; G.st.armed = null; G.st.focus = "power";
    G.st.on = true; G.st.closing = false; G.st.pending = null; G.st.glued = false; G.st.flipped = false; G.st.kbd = false;
    G.q(".dis-sub").textContent = G.names().phone[G.st.phone] + ": " + G.names().part[G.st.part];
    G.cv.hidden = false;
    G.q(".dis-tools").hidden = false;
    var p = G.q(".dis-panel");
    p.textContent = "";
    p.appendChild(S.el("p", "dis-q", S.t("Replace {part}.", { part: G.partName(G.st.part) })));
    p.appendChild(S.el("p", "dis-why"));
    G.q(".dis-why").setAttribute("aria-live", "polite");
    if (G.st.tutorial) { G.st.focus = G.nextPart(); G.say(S.t("Drag parts off the phone into the tray, and drag a tool onto the part it works on.") + " " + G.nextMove(), true); }
    G.fit();
    picture();
    G.cv.focus({ preventScroll: true });
  }
  /* The score card at the end of a run */
  function card() {
    var p = G.q(".dis-panel"), el = S.el, n = G.names();
    picture();
    p.textContent = "";
    p.appendChild(el("p", "dis-q", S.t("Done: the {part} of the {phone} is replaced and the phone works.", { part: n.part[G.st.part], phone: n.phone[G.st.phone] })));
    var rows = [
      [S.t("Time"), S.t("{n} min", { n: Math.round(G.st.minutes) })],
      [S.t("Actions"), String(G.st.actions)],
      [S.t("Tools"), G.st.tools.length ? G.st.tools.join(", ") : S.t("none")],
      [S.t("Mistakes"), String(G.st.mistakes)],
      [S.t("Damaged"), G.st.damaged.length ? G.st.damaged.join(", ") : S.t("nothing")]
    ];
    /* What the repair buys: the part, or for the Galaxy's screen the whole
       assembly, and new adhesive for the Galaxy's back glass */
    var bought = [G.st.phone === "samsung" && G.st.part === "screen" ? S.t("display, frame and battery in one assembly") : n.part[G.st.part]];
    if (G.st.phone === "samsung") { bought.push(G.toolName("glue")); }
    rows.push([S.t("Bought"), bought.join(", ")]);
    var tbl = el("table", "dis-card");
    rows.forEach(function (rw) {
      var tr = el("tr");
      tr.appendChild(el("th", "", rw[0])); tr.appendChild(el("td", "", rw[1]));
      tbl.appendChild(tr);
    });
    p.appendChild(tbl);
    var ul = el("ul", "dis-facts");
    G.facts(G.st.phone).forEach(function (f) { ul.appendChild(el("li", "", f)); });
    p.appendChild(ul);
    G.st.over = true;
    G.q(".dis-tools").hidden = true;
    var again = el("button", "btn", S.t("TRY ANOTHER")); again.type = "button"; again.dataset.sound = "action";
    again.addEventListener("click", function () { G.q(".dis-sub").textContent = ""; pickScreen(); });
    p.appendChild(again);
    again.focus({ preventScroll: true });
    if (S.announce) { S.announce(p.querySelector(".dis-q").textContent); }
    if (S.snd && S.snd.chime) { S.snd.chime(); }
  }
  G.pickScreen = pickScreen; G.picture = picture; G.begin = begin; G.card = card;
})();
