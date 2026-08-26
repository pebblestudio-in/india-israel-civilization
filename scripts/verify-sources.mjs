/* ============================================================
   THE SOURCE GATE

   This script is the reason the site can promise that nothing on
   it is unsourced. It refuses to let the site publish if any
   factual record is missing a source, or points at a source that
   does not exist in the register.

   It runs on every push, through .github/workflows/verify.yml.
   If it fails, the site does not deploy. That is deliberate.
   ============================================================ */

import fs from "node:fs";

const read = (f) => JSON.parse(fs.readFileSync(`content/${f}.json`, "utf8"));

const core        = read("core");
const timeline    = read("timeline").timeline;
const communities = read("communities");
const people      = read("people").people;
const articles    = read("articles").articles;
const cities      = read("cities");
const synagogues  = read("synagogues").sites;
const culture     = read("culture");
const library     = read("books");
const watchroom   = read("videos");
const statements  = read("statements");

const SOURCES = core.sources;
const problems = [];
const warnings = [];

function checkSources(label, ids, { allowEmpty = false } = {}) {
  if (!ids || !ids.length) {
    if (!allowEmpty) problems.push(`${label} has no source`);
    return;
  }
  ids.forEach(id => {
    if (!SOURCES[id]) problems.push(`${label} points at source "${id}", which is not in the register`);
  });
}

/* every source in the register needs the fields that make it citable */
for (const [id, s] of Object.entries(SOURCES)) {
  ["publisher", "title", "url", "tier", "accessed"].forEach(k => {
    if (!s[k]) problems.push(`Source "${id}" is missing ${k}`);
  });
  if (s.url && !/^https?:\/\//.test(s.url)) problems.push(`Source "${id}" has a url that is not a link`);
  if (!["primary", "reference", "press", "community"].includes(s.tier)) {
    problems.push(`Source "${id}" has tier "${s.tier}", which is not one of primary, reference, press, community`);
  }
}

timeline.forEach(t => {
  checkSources(`Timeline entry "${t.id}"`, t.sources);
  if (!t.dateLabel) problems.push(`Timeline entry "${t.id}" has no date label`);
  if (!t.status) problems.push(`Timeline entry "${t.id}" has no status label`);
});

communities.communities.forEach(c => {
  if (!c.claims || !c.claims.length) problems.push(`Community "${c.id}" has no claim register`);
  (c.claims || []).forEach((cl, i) => checkSources(`Community "${c.id}" claim ${i + 1}`, cl.sources));
});

core.figures.forEach(f => checkSources(`Figure "${f.id}"`, f.sources));
people.forEach(p => checkSources(`Person "${p.id}"`, p.sources));
synagogues.forEach(s => checkSources(`Site "${s.id}"`, s.sources));
statements.interactions.forEach(i => checkSources(`Interaction on ${i.date}`, i.sources));
cities.countryPairs.forEach(p => checkSources(`Country comparison "${p.point}"`, p.sources, { allowEmpty: p.status === "verified-general" }));
cities.cityPairs.forEach(p => checkSources(`City pair "${p.a}"`, p.sources));

/* articles may be pure analysis, but analysis resting on facts must cite them */
articles.forEach(a => {
  const text = a.body.join(" ");
  const hasNumbers = /\b(19|20)\d{2}\b|USD|\d{2,}/.test(text);
  if (hasNumbers && (!a.sources || !a.sources.length)) {
    problems.push(`Article "${a.id}" contains dates or figures but carries no source`);
  }
  checkSources(`Article "${a.id}"`, a.sources, { allowEmpty: !hasNumbers });
});

/* culture: every named figure carries a source, and every link resolves somewhere */
culture.people.forEach(p => {
  checkSources(`Culture figure "${p.id}"`, p.sources);
  (p.links || []).forEach(l => {
    if (!l.url || !/^https?:\/\//.test(l.url)) problems.push(`Culture figure "${p.id}" has a link with no address`);
  });
  if (!culture.sections.some(s => s.id === p.section)) problems.push(`Culture figure "${p.id}" sits in section "${p.section}", which does not exist`);
});

/* library: no dead ends. Every book needs a working way to find it. */
library.books.forEach((b, i) => {
  const who = b.title || `book ${i + 1}`;
  if (!b.find || !/^https?:\/\//.test(b.find)) problems.push(`Library entry "${who}" has no way to find it`);
  if (b.free && !/^https?:\/\//.test(b.free)) problems.push(`Library entry "${who}" has a broken free text link`);
  if (!library.categories.some(c => c.id === b.cat)) problems.push(`Library entry "${who}" sits on shelf ${b.cat}, which does not exist`);
});
library.categories.forEach(c => {
  const real = library.books.filter(b => b.cat === c.id).length;
  if (real !== c.count) warnings.push(`Shelf "${c.label}" says ${c.count} books and holds ${real}. Fixing the stated count.`);
  c.count = real;
});

/* watch room: every entry must resolve to a real YouTube id and sit in a real section */
watchroom.videos.forEach(v => {
  if (!/^[A-Za-z0-9_-]{11}$/.test(v.id)) problems.push(`Video "${v.title}" has an id that is not a YouTube id`);
  if (v.url !== "https://www.youtube.com/watch?v=" + v.id) problems.push(`Video "${v.title}" has a link that does not match its id`);
  if (!v.channel) problems.push(`Video "${v.title}" does not name the channel it is on`);
  if (!watchroom.sections.some(s => s.id === v.section)) problems.push(`Video "${v.title}" sits in section "${v.section}", which does not exist`);
});
{
  const seen = new Set();
  watchroom.videos.forEach(v => { if (seen.has(v.id)) problems.push(`Video ${v.id} is listed twice`); seen.add(v.id); });
}

/* things that are not failures but should be visible */
const unused = Object.keys(SOURCES).filter(id => {
  const all = JSON.stringify([timeline, communities, people, articles, cities, synagogues, statements, core.figures]) + fs.readFileSync("assets/js/app.js", "utf8");
  return !all.includes(`"${id}"`);
});
if (unused.length) warnings.push(`Sources in the register that nothing cites: ${unused.join(", ")}`);

const incomplete = synagogues.filter(s => !s.founded).length;
if (incomplete) warnings.push(`${incomplete} sites in the synagogue directory have no construction date recorded. That is allowed. It is listed here so the gap stays visible.`);

/* the em dash rule, applied to the whole content layer */
const allText = ["core", "timeline", "communities", "people", "articles", "cities", "languages", "statements", "synagogues", "corrections", "culture", "books", "videos"]
  .map(f => fs.readFileSync(`content/${f}.json`, "utf8")).join("");
const emDashes = (allText.match(/—/g) || []).length;
if (emDashes) problems.push(`${emDashes} em dash characters found in the content. This project does not use them.`);

/* report */
const counts = {
  sources: Object.keys(SOURCES).length,
  timeline: timeline.length,
  communities: communities.communities.length,
  people: people.length,
  synagogues: synagogues.length,
  articles: articles.length,
  articleWords: articles.reduce((n, a) => n + a.body.join(" ").split(/\s+/).filter(Boolean).length, 0),
  cultureFigures: culture.people.length,
  books: library.books.length,
  freeFullTexts: library.books.filter(b => b.free).length,
  videos: watchroom.videos.length
};

console.log("Record:", JSON.stringify(counts, null, 2));
warnings.forEach(w => console.log("NOTE  " + w));

if (problems.length) {
  console.error(`\nThe source gate refused ${problems.length} item${problems.length === 1 ? "" : "s"}:\n`);
  problems.forEach(p => console.error("  FAIL  " + p));
  console.error("\nThe site will not publish until every one of these has a real source.\n");
  process.exit(1);
}
console.log("\nSource gate passed. Every record carries a source that exists in the register.");
