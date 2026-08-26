/* Build a single self-contained HTML file for previewing and sharing.
   The real site is the multi-file version; this is one file with
   everything inlined so it can be published anywhere. */
import fs from "node:fs";

const FILES = ["core","timeline","communities","people","articles","cities","languages","statements","synagogues","centres","culture","books","videos","corrections"];
const data = {};
for (const f of FILES) {
  const j = JSON.parse(fs.readFileSync(`content/${f}.json`, "utf8"));
  if (["articles","cities","languages","statements","synagogues","centres","culture","books","videos","corrections"].includes(f)) data[f] = j;
  else Object.assign(data, j);
}
data.geo = JSON.parse(fs.readFileSync("content/geo.json", "utf8"));

const css = fs.readFileSync("assets/css/style.css", "utf8");
const app = fs.readFileSync("assets/js/app.js", "utf8");
const cfg = fs.readFileSync("site.config.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");

const fontLink = (index.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/) || [""])[0];
if (!fontLink) { console.error("could not find the font link in index.html"); process.exit(1); }

const bodyStart = index.indexOf("<canvas");
const bodyEnd = index.indexOf('<script src="site.config.js">');
const markup = index.slice(bodyStart, bodyEnd);

const out = `<title>The India-Israel Civilisations Project</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLink}
<style>${css}</style>
${markup}
<script>${cfg}</script>
<script>window.SITE_DATA_INLINE = ${JSON.stringify(data)};</script>
<script>window.NEWS_DATA = { generated: null, items: [], feedsTried: [], feedsOk: [], feedsFailed: [] };</script>
<script>${app}</script>
`;
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/preview.html", out);
console.log("dist/preview.html", (Buffer.byteLength(out) / 1024 / 1024).toFixed(2), "MB");
