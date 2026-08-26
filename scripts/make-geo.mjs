/* ============================================================
   MAP GEOMETRY

   Source: the India point of view geodata published by amCharts.

   Why this source and not the default one. The most widely used
   free world datasets draw India stopping at roughly 35.5 N,
   because they assign Aksai Chin to China and Gilgit-Baltistan
   to Pakistan. A site about India, published from India, showing
   India cut off at the top is wrong for its readers and wrong
   under Indian rules on map publication.

   amCharts publishes point of view variants for exactly this
   reason. worldIndiaHigh draws India as the Government of India
   depicts it, reaching 37.04 N, and redraws the neighbouring
   countries to match so nothing overlaps. india2023High adds the
   2023 state and union territory boundaries, including Ladakh and
   Jammu and Kashmir.

   LICENCE NOTE. The amCharts geodata is free to bundle inside an
   application, on condition that attribution stays visible and
   their LICENSE file travels with it. Both conditions are met:
   licences/amcharts-LICENSE is in this repository, and every map
   on the site carries a visible credit link. Do not remove either.

   If you later want a source with no conditions at all, Natural
   Earth publishes ne_10m_admin_0_countries_ind, which is the same
   India point of view and is public domain. Drop its GeoJSON in
   and point SOURCES below at it.

   Output: content/geo.json
   ============================================================ */

import fs from "node:fs";

const GEO = "node_modules/@amcharts/amcharts5-geodata/json/";
const world  = JSON.parse(fs.readFileSync(GEO + "worldIndiaHigh.json", "utf8"));
const states = JSON.parse(fs.readFileSync(GEO + "india2023High.json", "utf8"));
const ilDist = JSON.parse(fs.readFileSync(GEO + "israelHigh.json", "utf8"));

const FOCUS = { IN: "india", IL: "israel", PS: "palestine" };

/* ---------- projection ---------- */
function makeProj({ lon0, lon1, lat0, lat1, width }) {
  const scale = width / (lon1 - lon0);
  const k = Math.cos((((lat0 + lat1) / 2) * Math.PI) / 180);
  const kx = scale * k;
  const xoff = ((lon1 - lon0) * scale * (1 - k)) / 2;
  return {
    lon0, lon1, lat0, lat1,
    width, height: (lat1 - lat0) * scale,
    kx, ky: scale, xoff,
    x: (lon) => (lon - lon0) * kx + xoff,
    y: (lat) => (lat1 - lat) * scale
  };
}

function ringToPath(ring, P, round, tol) {
  let d = "", last = null, kept = 0;
  for (const c of ring) {
    const x = +P.x(c[0]).toFixed(round);
    const y = +P.y(c[1]).toFixed(round);
    if (last && Math.abs(x - last[0]) < tol && Math.abs(y - last[1]) < tol) continue;
    d += (d ? "L" : "M") + x + " " + y;
    last = [x, y];
    kept++;
  }
  return kept > 2 ? d + "Z" : "";
}

const touches = (ring, P) => ring.some(c =>
  c[0] >= P.lon0 - 10 && c[0] <= P.lon1 + 10 && c[1] >= P.lat0 - 10 && c[1] <= P.lat1 + 10);

function featureToPath(f, P, round, tol) {
  const g = f.geometry;
  if (!g) return "";
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  let d = "";
  for (const poly of polys) {
    for (const ring of poly) {
      if (!touches(ring, P)) continue;
      d += ringToPath(ring, P, round, tol);
    }
  }
  return d;
}

/* ---------- world layer, India point of view ---------- */
function buildWorld(P, opts = {}) {
  const out = {
    width: +P.width.toFixed(1), height: +P.height.toFixed(1),
    lon0: P.lon0, lon1: P.lon1, lat0: P.lat0, lat1: P.lat1,
    kx: +P.kx.toFixed(4), ky: +P.ky.toFixed(4), xoff: +P.xoff.toFixed(4),
    countries: {}, others: ""
  };
  for (const f of world.features) {
    const key = FOCUS[f.id];
    const d = featureToPath(f, P, key ? (opts.round ?? 1) : 0, key ? (opts.tol ?? 0.4) : (opts.tolOther ?? 1.2));
    if (!d) continue;
    if (key) out.countries[key] = d;
    else out.others += d;
  }
  return out;
}

/* ---------- India with state boundaries ---------- */
function buildIndia(P, opts = {}) {
  const out = {
    width: +P.width.toFixed(1), height: +P.height.toFixed(1),
    lon0: P.lon0, lon1: P.lon1, lat0: P.lat0, lat1: P.lat1,
    kx: +P.kx.toFixed(4), ky: +P.ky.toFixed(4), xoff: +P.xoff.toFixed(4),
    countries: {}, others: "", stateNames: []
  };
  /* internal state lines, drawn faint */
  let lines = "";
  for (const f of states.features) {
    const d = featureToPath(f, P, opts.round ?? 1, opts.tol ?? 0.5);
    if (!d) continue;
    lines += d;
    out.stateNames.push(f.properties.name);
  }
  out.stateLines = lines;
  /* the national outline, drawn strong, from the same India point of view set */
  const IN = world.features.find(f => f.id === "IN");
  out.countries.india = featureToPath(IN, P, opts.round ?? 1, opts.tol ?? 0.45);
  /* neighbours behind it, so India is not floating in a void */
  for (const f of world.features) {
    if (f.id === "IN") continue;
    const d = featureToPath(f, P, 0, opts.tolOther ?? 1.3);
    if (d) out.others += d;
  }
  return out;
}

/* ---------- Israel at district level, whole country in frame ---------- */
function buildIsraelDetail(P, opts = {}) {
  const out = {
    width: +P.width.toFixed(1), height: +P.height.toFixed(1),
    lon0: P.lon0, lon1: P.lon1, lat0: P.lat0, lat1: P.lat1,
    kx: +P.kx.toFixed(4), ky: +P.ky.toFixed(4), xoff: +P.xoff.toFixed(4),
    countries: {}, others: "", districts: [], neighbourNames: []
  };
  /* neighbouring countries behind, so Israel is not floating */
  for (const f of world.features) {
    if (f.id === "IL" || f.id === "PS") continue;
    const d = featureToPath(f, P, 0, opts.tolOther ?? 1.2);
    if (d) out.others += d;
  }
  /* every region the dataset publishes, each drawn and named */
  let israel = "", other = "";
  for (const f of ilDist.features) {
    const name = f.properties.name;
    const d = featureToPath(f, P, opts.round ?? 1, opts.tol ?? 0.25);
    if (!d) continue;
    const isDistrict = !/palestine|golan/i.test(name);
    out.districts.push({ name, d, kind: isDistrict ? "district" : "other" });
    if (isDistrict) israel += d; else other += d;
  }
  out.countries.israel = israel;
  out.countries.palestine = other;
  out.neighbourNames = ilDist.features.map(f => f.properties.name);
  return out;
}

const geo = {
  source: {
    name: "amCharts geodata, India point of view",
    url: "https://www.amcharts.com/",
    licence: "Free amCharts licence. Attribution must stay visible and the LICENSE file must travel with the data. Both are in this repository.",
    note: "India is drawn as the Government of India depicts it, including Jammu and Kashmir, Ladakh and Aksai Chin. Several of these boundaries are disputed internationally and other governments publish different depictions. This project does not draw or adjust any boundary itself. It selects a published dataset and names it.",
    stateData: "State and union territory boundaries are the 2023 set."
  },
  corridor: buildWorld(makeProj({ lon0: 30, lon1: 98, lat0: 5, lat1: 38.5, width: 1360 }),
                       { round: 1, tol: 0.5, tolOther: 1.4 }),
  israel:   buildIsraelDetail(makeProj({ lon0: 34.05, lon1: 36.05, lat0: 29.35, lat1: 33.55, width: 330 }),
                       { round: 1, tol: 0.22, tolOther: 1.2 }),
  india:    buildIndia(makeProj({ lon0: 67, lon1: 98, lat0: 6, lat1: 38, width: 700 }),
                       { round: 1, tol: 0.45, tolOther: 1.4 })
};

fs.mkdirSync("content", { recursive: true });
fs.writeFileSync("content/geo.json", JSON.stringify(geo));

/* carry the licence into the repository, as the licence requires */
fs.mkdirSync("licences", { recursive: true });
fs.copyFileSync(GEO + "../LICENSE", "licences/amcharts-LICENSE");

const kb = (s) => (Buffer.byteLength(String(s)) / 1024).toFixed(1) + " kB";
for (const [k, m] of Object.entries(geo)) {
  if (k === "source") continue;
  console.log(k.padEnd(9),
    "india", kb(m.countries.india || ""),
    "israel", kb(m.countries.israel || ""),
    "palestine", m.countries.palestine ? "yes" : "no",
    "others", kb(m.others),
    "| viewBox", m.width + " x " + m.height.toFixed(0));
}
console.log("states drawn:", geo.india.stateNames.length);
console.log("israel regions:", geo.israel.districts.map(d => d.name + " [" + d.kind + "]").join(", "));
console.log("total", kb(JSON.stringify(geo)));
