#!/usr/bin/env node
/* Captures the game's own markup for the screens the trailer simulates,
   so the simulation is laid out exactly as the game lays it out:

     node common/tools/snapshot-game.js <path to the game's folder> [--only feature|gameplay]

   For the feature trailer it runs the game in headless Chromium, signs in
   as Cornelius with every section open and puts each screen in the state
   the trailer shows. For the gameplay trailer it plays a new game the way
   the recordings did, from the login prompt to the rejected password, and
   captures each state on the way; those snapshots are named gp-<state>.
   Each snapshot's markup is written, without scripts, to
   common/snapshots/<name>.js
   (SNAP[name] = { html, root, body }: the screen's markup and the
   attributes of the html and body elements), loaded by common/lib/stage.html. The game is needed only for this
   step; the build uses the snapshots and the game's CSS in common/vendor/css. */
"use strict";
const fs = require("fs"), path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const game = path.resolve(process.argv[2] || "../selk-terminal");
const only = process.argv.indexOf("--only") > 0 ? process.argv[process.argv.indexOf("--only") + 1] : null;
const OUT = path.join(__dirname, "..", "snapshots");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  page.on("pageerror", (e) => console.log("game:", e.message));
  await page.goto("file://" + path.join(game, "index.html"));
  await page.waitForSelector("button.title-go");
  await page.waitForTimeout(800);
  /* keep: the text fields stay, with what is typed in them (the gameplay
     trailer types into the prompt and the password box) */
  const save = async (name, keep) => {
    await page.waitForTimeout(600);
    const snap = await page.evaluate((keep) => {
      const live = document.querySelector("#screen");
      if (keep) {
        live.querySelectorAll("input").forEach((n) => n.setAttribute("value", n.value));
        /* Scrolled panes (the shell at its latest line), restored by sim.js */
        live.querySelectorAll("*").forEach((n) => {
          if (n.scrollTop) n.setAttribute("data-scroll-top", n.scrollTop); else n.removeAttribute("data-scroll-top");
        });
      }
      const screen = live.cloneNode(true);
      screen.querySelectorAll(keep ? "script" : "script, input").forEach((n) => n.remove());
      /* The game's pictures, copied to common/vendor/img by this tool */
      screen.querySelectorAll("img[src^='img/']").forEach((n) => n.setAttribute("src", "../vendor/" + n.getAttribute("src")));
      const attrs = (el) => Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));
      return { html: screen.outerHTML, root: attrs(document.documentElement), body: attrs(document.body) };
    }, !!keep);
    (snap.html.match(/src="\.\.\/vendor\/(img\/[^"]+)"/g) || []).forEach((m) => {
      const rel = /vendor\/(img\/[^"]+)"/.exec(m)[1], to = path.join(__dirname, "..", "vendor", rel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(path.join(game, rel), to);
    });
    fs.writeFileSync(path.join(OUT, name + ".js"), "/* The game's own markup, captured by tools/snapshot-game.js */\n(window.SNAP = window.SNAP || {})[" + JSON.stringify(name) + "] = " + JSON.stringify(snap) + ";\n");
    console.log("wrote " + name);
  };
  const clickRow = (text) => page.evaluate((text) => {
    const rows = [...document.querySelectorAll("#screen *")].filter((n) => n.children.length < 4 && n.textContent.trim().indexOf(text) === 0 && n.offsetParent && n.getBoundingClientRect().left < 420);
    const r = rows.sort((a, b) => a.textContent.length - b.textContent.length)[0];
    if (r) r.click(); return !!r;
  }, text);
  if (only !== "gameplay") await feature();
  if (only !== "feature") await gameplay();
  await browser.close();

  async function feature() {
  await save("title");
  /* Sign in: no tour, the boot shown at once */
  await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
  await page.click("button.title-go");
  await page.waitForFunction(() => SELK.mode === "login");
  await save("boot");
  await page.keyboard.type("Cornelius"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  /* Every section open, as in the recordings after DEBUG > UNLOCK ALL */
  await page.evaluate(() => {
    const S = SELK;
    S.sections().forEach((s) => { if (s.locked && S.state.unlocked.indexOf(s.id) === -1) S.state.unlocked.push(s.id); });
    ["design", "history"].forEach((id) => { if (S.state.unlocked.indexOf(id) === -1) S.state.unlocked.push(id); });
    S.save();
  });
  await page.reload();
  await page.waitForSelector("button.title-go");
  await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
  await page.click("button.title-go");
  await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { SELK.state.settings.fast = false; });
  /* The desk: STRUCTURE / STOPPED-REPAIRS in VIEW, STRUCTURE open in FILES */
  await page.evaluate(() => SELK.run("open structure/STOPPED-REPAIRS", false, "typed"));
  await page.waitForTimeout(800);
  console.log("structure row", await clickRow("STRUCTURE"));
  await save("desk-structure");
  console.log("history row", await clickRow("HISTORY"));
  await save("desk-history");
  /* WATCH */
  await page.evaluate(() => SELK.run("watch", false, "typed"));
  await page.waitForTimeout(1200);
  await save("watch");
  }

  /* The gameplay trailer: a new game, played as in the recordings G1 to G4
     (gameplay-trailer/DESIGN.md, section 9), at the game's own pace, so the
     messages, the clock and the shell lines come as the game makes them */
  async function gameplay() {
    const click = async (sel, text) => {
      const ok = await page.evaluate(([sel, text]) => {
        const n = [...document.querySelectorAll(sel)].find((x) => x.offsetParent && (!text || x.textContent.trim().indexOf(text) === 0));
        if (n) n.click(); return !!n;
      }, [sel, text]);
      if (!ok) throw new Error("not found: " + sel + " " + (text || ""));
    };
    const fill = (n, id) => page.evaluate(([n, id]) => SELK.rep.fillBlank(SELK.state.active, n, id), [n, id]);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    await page.waitForSelector("button.title-go");
    await page.evaluate(() => { SELK.noTour = true; SELK.state.settings.fast = true; });
    await page.click("button.title-go");
    await page.waitForFunction(() => SELK.mode === "login");
    await page.waitForTimeout(1500);
    await save("gp-login", true);
    /* The sign-in at the game's pace: MSG 001 comes 5 s after it */
    await page.evaluate(() => { SELK.state.settings.fast = false; });
    await page.keyboard.type("Cornelius"); await page.keyboard.press("Enter");
    await page.waitForFunction(() => SELK.mode === "shell", null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    await save("gp-desk", true);
    await page.waitForSelector(".mail-toast", { timeout: 20000 });
    await save("gp-desk-msg1", true);
    await click(".mail-toast .btn.primary");
    await save("gp-mail-msg1", true);
    await click("#screen .lnk, #screen [data-cmd]", "OPEN REPORT 1");
    await save("gp-report-0", true);
    await fill(1, "site/SELK");
    await save("gp-report-1", true);
    if (!(await clickRow("BIO"))) throw new Error("no BIO row");
    await save("gp-bio", true);
    await click(".mc-panel:nth-child(2) .mc-row", "LAB");
    await click(".mc-panel:nth-child(2) .mc-row", "LAB");
    await save("gp-lab", true);
    await fill(2, "bio/LAB");
    await save("gp-report-2", true);
    await fill(3, "bio/GATE");
    await fill(4, "bio/ZONE-14");
    await save("gp-report-4", true);
    /* The transmission: one state while the signal delay counts down, one
       when the page is delivered; the trailer counts the number itself */
    await click("#screen .report button, #screen button", "SUBMIT PAGE");
    await page.waitForTimeout(700);
    await save("gp-transmit", true);
    await page.waitForFunction(() => !SELK.transmitting, null, { timeout: 20000 });
    await save("gp-accepted", true);
    await page.waitForFunction(() => document.querySelector(".mail-toast"), null, { timeout: 20000 });
    await save("gp-desk-msg2", true);
    await click(".mail-toast .btn.primary");
    await save("gp-mail-msg2", true);
    await click("#screen .lnk, #screen [data-cmd]", "OPEN REPORT 2");
    if (!(await clickRow("STRUCTURE"))) throw new Error("no STRUCTURE row");
    await save("gp-report2", true);
    /* REPORT 2 with one wrong answer, as in G4 */
    await fill(1, "structure/MAST-01");
    await fill(2, "structure/STOPPED-REPAIRS");
    await fill(3, "bio/GATE");
    await fill(4, "structure/INDEX");
    await click("#screen button", "SUBMIT PAGE");
    await page.waitForTimeout(300);
    await save("gp-rejected-page", true);
    /* ARCHIVE: the locked-section dialog, the password dialog, a wrong guess */
    if (!(await clickRow("ARCHIVE"))) throw new Error("no ARCHIVE row");
    await page.waitForSelector(".dlg");
    await save("gp-archive-locked", true);
    await click(".dlg .btn", "ENTER PASSWORD");
    await page.waitForSelector(".dlg .dlg-in");
    await save("gp-unlock", true);
    await page.fill(".dlg .dlg-in", "Selk");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await save("gp-unlock-rejected", true);
  }
})();
