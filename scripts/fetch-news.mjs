/* ============================================================
   THE NEWS GATHERER
   Runs on a schedule from GitHub Actions.

   It only ever stores a headline, a link, a date and a source
   name. It never stores article text, because reproducing an
   article is someone else's copyright.

   Every feed is tested on every run. Feeds that fail are
   recorded as failed rather than silently dropped, so a dead
   feed shows up as dead on the site.
   ============================================================ */

import fs from "node:fs";

const FEEDS = [
  { name: "Press Information Bureau", url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", tier: "primary" },
  { name: "The Hindu, International",  url: "https://www.thehindu.com/news/international/feeder/default.rss", tier: "press" },
  { name: "Indian Express, World",     url: "https://indianexpress.com/section/world/feed/", tier: "press" },
  { name: "Times of India, World",     url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", tier: "press" },
  { name: "The Times of Israel",       url: "https://www.timesofisrael.com/feed/", tier: "press" },
  { name: "The Jerusalem Post",        url: "https://www.jpost.com/rss/rssfeedsheadlines.aspx", tier: "press" },
  { name: "BBC World",                 url: "https://feeds.bbci.co.uk/news/world/rss.xml", tier: "press" }
];

/* an item is kept only if it mentions both sides, or a named bilateral topic */
const MUST_HAVE_A = /\bindia\b|\bindian\b|\bnew delhi\b|\bmodi\b|\bjaishankar\b/i;
const MUST_HAVE_B = /\bisrael\b|\bisraeli\b|\btel aviv\b|\bjerusalem\b|\bnetanyahu\b|\bknesset\b/i;

const strip = (s) => String(s || "")
  .replace(/<!\[CDATA\[|\]\]>/g, "")
  .replace(/<[^>]*>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
  .trim();

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? strip(m[1]) : "";
};

function parse(xml, feed) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return blocks.map(b => {
    let link = pick(b, "link");
    if (!link) {
      const m = b.match(/<link[^>]*href="([^"]+)"/i);
      link = m ? m[1] : "";
    }
    const raw = pick(b, "pubDate") || pick(b, "updated") || pick(b, "published");
    let date = "";
    if (raw) { const d = new Date(raw); if (!isNaN(d)) date = d.toISOString().slice(0, 10); }
    return { title: pick(b, "title"), link, date, source: feed.name, tier: feed.tier };
  }).filter(i => i.title && i.link);
}

const tried = [], ok = [], failed = [];
let items = [];

for (const feed of FEEDS) {
  tried.push(feed.name);
  try {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), 20000);
    const r = await fetch(feed.url, {
      signal: c.signal,
      headers: { "User-Agent": "IndiaIsraelCivilisationsProject/1.0 (+https://github.com)" }
    });
    clearTimeout(timer);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const xml = await r.text();
    const got = parse(xml, feed);
    if (!got.length) throw new Error("no items parsed");
    ok.push(feed.name);
    items.push(...got);
    console.log(`OK    ${feed.name}: ${got.length} items`);
  } catch (e) {
    failed.push({ name: feed.name, reason: String(e.message || e) });
    console.log(`FAIL  ${feed.name}: ${e.message || e}`);
  }
}

/* keep only genuinely bilateral items, dedupe, cap, newest first */
const seen = new Set();
items = items
  .filter(i => MUST_HAVE_A.test(i.title) && MUST_HAVE_B.test(i.title))
  .filter(i => { const k = i.link.split("?")[0]; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  .slice(0, 60);

const out = {
  generated: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
  items,
  feedsTried: tried,
  feedsOk: ok,
  feedsFailed: failed
};

fs.writeFileSync("assets/js/news.js",
  "/* Written automatically by .github/workflows/news.yml. Do not edit by hand. */\nwindow.NEWS_DATA = " +
  JSON.stringify(out, null, 2) + ";\n");

console.log(`\n${items.length} bilateral items kept. ${ok.length} of ${tried.length} feeds responded.`);
if (!ok.length) { console.error("No feed responded at all. Leaving the file in place."); process.exit(0); }
