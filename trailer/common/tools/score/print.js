/* Prints the engraved pages (page-1.svg, page-2.svg, ...) of a folder to
   one A4 PDF: node print.js <folder> <out.pdf> */
const fs = require("fs"), path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const [dir, out] = process.argv.slice(2);
(async () => {
  const pages = fs.readdirSync(dir).filter((f) => /^page-\d+\.svg$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
  const html = pages.map((f) => '<div style="width:210mm;height:297mm;page-break-after:always">' + fs.readFileSync(path.join(dir, f), "utf8").replace(/<svg /, '<svg style="width:100%;height:100%" ') + "</div>").join("");
  const browser = await chromium.launch(), page = await browser.newPage();
  await page.setContent('<html><body style="margin:0;background:#fff">' + html + "</body></html>");
  await page.pdf({ path: out, format: "A4", printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await browser.close();
  console.log("wrote " + out);
})();
