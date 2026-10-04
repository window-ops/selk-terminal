/* DISASSEMBLY.RUN (core.js): the rules of the repair. Each action, by the
   pointer or the keys, comes here: it is done, or it does not work and
   counts as a mistake with its reason, and in tutorial mode the next move
   follows. */
(function () {
  var S = window.SELK, G = S.disassemblyGame;
  /* What the pointer and the keyboard can reach: the power button and the
     parts still on the phone. The display is reached from the front only. */
  function touchable() {
    var P = G.PARTS[G.st.phone];
    if (G.st.flipped) { return G.st.removed.indexOf("screen") === -1 ? ["power", "screen"] : ["power"]; }
    return ["power"].concat(G.ORDER[G.st.phone].filter(function (id) { return id !== "screen" && G.st.removed.indexOf(id) === -1 && (P[id] || id === "speaker"); }));
  }
  function powered() {
    return G.st.phone === "fairphone" ? G.st.removed.indexOf("battery") === -1 : G.st.removed.indexOf("plate") === -1;
  }
  function say(text, good) {
    var w = G.q(".dis-why");
    w.textContent = text;
    w.classList.toggle("good", !!good);
  }
  /* The part that goes back next: the last one taken off */
  function nextBack() {
    return G.st.removed[G.st.removed.length - 1] || null;
  }
  /* The part the next step works on, for tutorial mode: the power button,
     the next part on the way to the chosen one (the parts over it, and the
     battery when the electronics need it disconnected, in the order they
     lie), or while closing the part waiting for its screws or going back */
  function nextPart() {
    if (G.st.newPart) { return null; }
    if (G.st.closing) { return G.st.pending || nextBack() || "power"; }
    if (G.st.on) { return "power"; }
    var P = G.PARTS[G.st.phone], need = P[G.st.part].under.slice();
    if (P[G.st.part].power) { need.push(G.st.phone === "fairphone" ? "battery" : "plate"); }
    need.push(G.st.part);
    /* A part on the way can have its own parts over it */
    for (var i = 0; i < need.length; i++) {
      (G.PARTS[G.st.phone][need[i]].under || []).forEach(function (u) { if (need.indexOf(u) === -1) { need.push(u); } });
    }
    return G.ORDER[G.st.phone].filter(function (o) { return need.indexOf(o) !== -1 && G.st.removed.indexOf(o) === -1; })[0] || null;
  }
  /* In tutorial mode: the next move, and the side the phone has to show
     for it (the display from the front, everything else from the back) */
  function nextMove() {
    if (G.st.newPart) { return S.t("Drag the new part from the drawer into the phone."); }
    var id = nextPart();
    if (!id) { return ""; }
    if (id !== "power" && (id === "screen") !== !!G.st.flipped) { return S.t("Next: turn the phone over."); }
    if (G.st.closing) {
      if (G.st.pending) { return S.t("Next: use the {tool} on {part}.", { tool: G.toolName("screw"), part: G.partName(G.st.pending) }); }
      if (id === "power") { return S.t("Next: press the power button."); }
      if (id === "cover" && G.st.phone === "samsung" && !G.st.glued) { return S.t("Next: put the {tool} on the frame.", { tool: G.toolName("glue") }); }
      return S.t("Next: drag {part} from the tray onto the phone.", { part: G.partName(id) });
    }
    if (id === "power") { return S.t("Next: hold the power button."); }
    var done = G.st.done[id] || [], tool = G.PARTS[G.st.phone][id].needs[done.length];
    return tool ? S.t("Next: use the {tool} on {part}.", { tool: G.toolName(tool), part: G.partName(id) }) :
      S.t("Next: drag {part} into the tray.", { part: G.partName(id) });
  }
  /* A mistake; in tutorial mode the next move follows the reason */
  function mistake(text, damage) {
    G.st.mistakes++; G.st.minutes += 1;
    if (damage && G.st.damaged.indexOf(damage) === -1) {
      G.st.damaged.push(damage);
      text += " " + S.t("Damaged: {part}.", { part: damage });
    }
    say(G.st.tutorial ? text + " " + nextMove() : text);
    if (S.snd && S.snd.error) { S.snd.error(); }
  }
  /* Something done right; in tutorial mode the next move follows */
  function good(text) {
    if (G.st.tutorial) { G.st.focus = nextPart(); }
    say(G.st.tutorial ? text + " " + nextMove() : text, true);
    if (S.snd && S.snd.ok) { S.snd.ok(); }
  }
  /* The first part over id that is still on */
  function blocker(id) {
    var under = G.PARTS[G.st.phone][id].under;
    for (var i = under.length - 1; i >= 0; i--) { if (G.st.removed.indexOf(under[i]) === -1) { return under[i]; } }
    return null;
  }
  /* The power button: off before the repair, on once the phone is closed */
  function pressPower() {
    G.st.actions++;
    if (G.st.on) {
      G.st.on = false; G.st.minutes += 0.5;
      good(S.t("The phone is off."));
    } else if (G.st.closing && !G.st.newPart && !G.st.pending && !G.st.removed.length) {
      G.st.on = true;
      good(S.t("The phone starts."));
      G.card();
      return;
    } else {
      mistake(S.t("Not while the phone is open."));
    }
    G.picture();
  }
  /* A tool used on a part, or for the adhesive on the open frame */
  function useTool(tool, id) {
    if (id === "power") { mistake(S.t("Nothing to do there with a tool.")); return; }
    if (G.st.on) { mistake(S.t("The phone is on.")); return; }
    if (G.st.closing) { closeTool(tool, id); return; }
    if (tool === "glue") { mistake(S.t("Nothing here takes adhesive.")); return; }
    if (!id) { return; }
    var P = G.PARTS[G.st.phone][id];
    G.st.actions++;
    if (!P) { mistake(S.t("{part} stays in for this repair.", { part: cap(G.partName(id) || S.t("the bottom module")) })); return; }
    var cover = blocker(id);
    if (cover) { mistake(S.t("Still on top: {over}.", { over: G.partName(cover) })); return; }
    var done = G.st.done[id] = G.st.done[id] || [], next = P.needs[done.length];
    if (tool === next) {
      done.push(tool);
      G.st.minutes += G.TOOL_MIN[tool];
      if (G.st.tools.indexOf(G.toolName(tool)) === -1) { G.st.tools.push(G.toolName(tool)); }
      good({ heat: S.t("The adhesive softens."), pry: S.t("The adhesive is cut all round."), screw: S.t("The screws are out.") }[tool]);
    } else if (tool === "pry" && next === "heat") {
      mistake(S.t("The cold adhesive holds; the picks do not get in."));
    } else if (done.indexOf(tool) !== -1) {
      mistake(S.t("That is done already."));
    } else {
      mistake({
        heat: G.st.phone === "fairphone" ? S.t("Nothing here is glued: the parts clip on or are screwed.") : S.t("This part is screwed, not glued."),
        pry: id === "cover" ? S.t("The cover only clips on; no picks are needed.") : S.t("Nothing here needs prying."),
        screw: S.t("There are no screws to undo here.")
      }[tool]);
    }
    G.picture();
  }
  /* A tool while closing the phone: the screwdriver on the part just put
     back, the adhesive on the frame before the Galaxy's glass */
  function closeTool(tool, id) {
    G.st.actions++;
    if (tool === "screw" && G.st.pending && id === G.st.pending) {
      G.st.done[id] = []; G.st.pending = null; G.st.minutes += G.TOOL_MIN.screw;
      good(S.t("The screws are in."));
    } else if (tool === "glue" && G.st.phone === "samsung" && nextBack() === "cover" && !G.st.glued && !G.st.pending) {
      G.st.glued = true; G.st.minutes += G.TOOL_MIN.glue;
      if (G.st.tools.indexOf(G.toolName("glue")) === -1) { G.st.tools.push(G.toolName("glue")); }
      good(S.t("New adhesive is on the frame."));
    } else if (tool === "glue") {
      mistake(S.t("Nothing here takes adhesive."));
    } else if (tool === "screw") {
      mistake(S.t("There are no screws to put in here."));
    } else {
      mistake(S.t("That is not needed now."));
    }
    G.picture();
  }
  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  /* Why a part cannot come off now, or null when it can */
  function stuck(id) {
    var P = G.PARTS[G.st.phone][id];
    if (G.st.on) { return S.t("The phone is on."); }
    if (!P) { return S.t("{part} stays in for this repair.", { part: cap(S.t("the bottom module")) }); }
    var cover = blocker(id), done = G.st.done[id] || [];
    if (cover) { return S.t("Still on top: {over}.", { over: G.partName(cover) }); }
    if (P.power && powered()) { return S.t("The battery is still connected."); }
    if (done.length < P.needs.length) {
      return { heat: S.t("The glass is glued."), pry: S.t("The adhesive still holds."), screw: S.t("It is held by screws.") }[P.needs[done.length]];
    }
    return null;
  }
  /* A part pulled off the phone */
  function pull(id) {
    G.st.actions++;
    var why = stuck(id);
    if (why) { mistake(why); G.picture(); return; }
    G.st.removed.push(id);
    G.st.minutes += G.PARTS[G.st.phone][id].min;
    G.st.focus = G.st.focus === id ? null : G.st.focus;
    if (id === G.st.part) { G.st.newPart = id; }
    good(G.st.phone === "samsung" && id === "battery" ? S.t("The pull tabs stretch and let the battery go.") : S.t("Taken out: {part}.", { part: G.partName(id) }));
    G.picture();
  }
  /* The new part fitted in place of the old one; a screwed part waits for
     its screws */
  function fitNew() {
    var id = G.st.newPart, P = G.PARTS[G.st.phone][id];
    G.st.newPart = null; G.st.closing = true;
    G.st.removed.splice(G.st.removed.indexOf(id), 1);
    G.st.minutes += P.min;
    G.st.done[id] = [];
    if (P.needs.indexOf("screw") !== -1) { G.st.done[id] = ["screw"]; G.st.pending = id; }
    good(S.t("The new part is in."));
    G.picture();
  }
  /* A part put back from the tray: only the last one taken off, after the
     screws of the one before are in, and the Galaxy's glass only on new
     adhesive */
  function putBack(id) {
    G.st.actions++;
    var next = nextBack(), P = G.PARTS[G.st.phone][id];
    if (G.st.pending) { mistake(S.t("{part}: the screws are still out.", { part: cap(G.partName(G.st.pending)) })); G.picture(); return; }
    if (id !== next) { mistake(S.t("{part} goes on after {other}.", { part: cap(G.partName(id)), other: G.partName(next) })); G.picture(); return; }
    if (id === "cover" && G.st.phone === "samsung" && !G.st.glued) { mistake(S.t("The frame has no adhesive.")); G.picture(); return; }
    G.st.removed.pop();
    G.st.minutes += P.min;
    G.st.done[id] = [];
    if (P.needs.indexOf("screw") !== -1) { G.st.done[id] = ["screw"]; G.st.pending = id; }
    good(S.t("Back on: {part}.", { part: G.partName(id) }));
    G.picture();
  }
  /* Turns the phone over: the back or the front */
  function flip() {
    if (!G.st || !G.st.removed || G.st.over) { return; }
    G.st.flipped = !G.st.flipped;
    G.st.focus = touchable().indexOf(G.st.focus) !== -1 ? G.st.focus : "power";
    var side = G.st.flipped ? S.t("The front of the phone.") : S.t("The back of the phone.");
    if (G.st.tutorial) { G.st.focus = nextPart(); }
    say(G.st.tutorial ? side + " " + nextMove() : side, true);
    G.picture();
  }
  G.touchable = touchable; G.powered = powered; G.say = say; G.nextBack = nextBack; G.nextPart = nextPart; G.nextMove = nextMove; G.mistake = mistake; G.good = good; G.blocker = blocker; G.pressPower = pressPower; G.useTool = useTool; G.closeTool = closeTool; G.cap = cap; G.stuck = stuck; G.pull = pull; G.fitNew = fitNew; G.putBack = putBack; G.flip = flip;
})();
