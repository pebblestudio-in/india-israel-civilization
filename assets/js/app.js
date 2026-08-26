/* ============================================================
   THE INDIA-ISRAEL CIVILISATIONS PROJECT
   Application layer. Vanilla JS, no dependencies, no CDN.
   ============================================================ */

const CONFIG = Object.assign({
  contactEmail: "",
  submissionsEmail: "",
  correctionsEmail: "",
  defaultAuthor: "The India-Israel Civilisations Project",
  communityInvite: "",
  supportLink: ""
}, window.SITE_CONFIG || {});

const MAIL = (kind) => CONFIG[kind] || CONFIG.contactEmail || "";
function mailto(kind, subject, body) {
  const to = MAIL(kind);
  if (!to) return null;
  return "mailto:" + to + "?subject=" + encodeURIComponent(subject) +
    (body ? "&body=" + encodeURIComponent(body) : "");
}
function mailBlock(kind, subject, body, label, note) {
  const url = mailto(kind, subject, body);
  return url
    ? `<a class="btn btn-gold" href="${esc(url)}">${esc(label)}</a>
       <p class="tick" style="margin-top:12px">Writes to ${esc(MAIL(kind))}</p>`
    : `<div class="empty"><strong>No address set yet.</strong>
       <p style="margin-top:10px">${esc(note || "Add the address in the manager, under Settings, and this becomes a working link.")}</p></div>`;
}

let D = {};
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const STATUS_LABEL = {
  "verified": "Verified",
  "verified-general": "Established fact",
  "community-claim": "Community claim",
  "figures-differ": "Sources differ",
  "unchecked": "Link not yet checked"
};
const STATUS_CLASS = {
  "verified": "badge-verified",
  "verified-general": "badge-verified",
  "community-claim": "badge-community",
  "figures-differ": "badge-figures",
  "unchecked": "badge-community"
};

/* The evidence grading still runs, in the data and in the source gate.
   It is no longer printed as a chip beside every sentence: a page
   covered in labels reads as anxious rather than as careful. Where a
   claim is contested or the sources disagree, the page says so in
   words, which is both clearer and harder to ignore. */
const badge = () => "";

function srcline(ids) {
  const chips = (ids || []).map(id => {
    const s = D.sources[id];
    if (!s) return "";
    return `<a class="src-chip" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}</a>`;
  }).join("");
  if (!chips) return "";
  return `<div class="srcline"><span class="tick">Sources</span>${chips}</div>`;
}

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

/* ============================================================
   CHART BED
   ============================================================ */
function chartbed() {
  const cv = $("#chartbed");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const centres = [{ x: 0.14, y: 0.28 }, { x: 0.82, y: 0.7 }];
  const cv2 = () => {
    const s = getComputedStyle(document.documentElement);
    return {
      grid: s.getPropertyValue("--bed").trim(),
      warm: s.getPropertyValue("--bed-warm").trim(),
      cool: s.getPropertyValue("--bed-cool").trim(),
      fade: s.getPropertyValue("--bed-fade").trim() || "255,255,255"
    };
  };
  let C = cv2();
  window.addEventListener("iicp:theme", () => { C = cv2(); draw(); });
  function draw() {
    const W = innerWidth, H = innerHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    const step = 92;
    for (let x = (t * 0.12) % step; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    centres.forEach((c, i) => {
      const cx = c.x * W, cy = c.y * H, R = Math.max(W, H) * 0.9, spin = t * 0.00022 * (i ? -1 : 1);
      ctx.strokeStyle = i ? C.cool : C.warm;
      for (let k = 0; k < 16; k++) {
        const a = spin + (k * Math.PI * 2) / 16;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.stroke();
    });
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, "rgba(" + C.fade + ",0)"); g.addColorStop(1, "rgba(" + C.fade + ",0.86)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function loop() { t += 1; draw(); requestAnimationFrame(loop); }
  size(); draw();
  if (!reduce) loop();
  addEventListener("resize", () => { size(); draw(); }, { passive: true });
}

/* ============================================================
   REAL MAPS
   ============================================================ */
function mapProj(g) {
  return {
    x: (lon) => (lon - g.lon0) * g.kx + g.xoff,
    y: (lat) => (g.lat1 - lat) * g.ky,
    w: g.width, h: g.height
  };
}

function graticule(g, P, stepLon, stepLat) {
  let out = "";
  for (let lon = Math.ceil(g.lon0 / stepLon) * stepLon; lon <= g.lon1; lon += stepLon) {
    out += `<line class="mp-grat" x1="${P.x(lon).toFixed(1)}" y1="0" x2="${P.x(lon).toFixed(1)}" y2="${P.h}"></line>`;
    out += `<text class="mp-tick" x="${(P.x(lon) + 3).toFixed(1)}" y="${(P.h - 6).toFixed(1)}">${lon}E</text>`;
  }
  for (let lat = Math.ceil(g.lat0 / stepLat) * stepLat; lat <= g.lat1; lat += stepLat) {
    out += `<line class="mp-grat" x1="0" y1="${P.y(lat).toFixed(1)}" x2="${P.w}" y2="${P.y(lat).toFixed(1)}"></line>`;
    out += `<text class="mp-tick" x="5" y="${(P.y(lat) - 4).toFixed(1)}">${lat}N</text>`;
  }
  return out;
}

function landLayer(g) {
  const c = g.countries || {};
  return `<g class="mp-land">
    <path class="mp-other" d="${g.others}"></path>
    ${c.palestine ? `<path class="mp-other" d="${c.palestine}"></path>` : ""}
    ${c.india  ? `<path class="mp-in" d="${c.india}"></path>`  : ""}
    ${g.stateLines ? `<path class="mp-state" d="${g.stateLines}"></path>` : ""}
    ${c.israel ? `<path class="mp-il" d="${c.israel}"></path>` : ""}
  </g>`;
}

/* the map credit. The amCharts licence requires this to stay visible. */
function mapCredit(extra) {
  const s = D.geo.source;
  return `<div class="mapcredit">
    <span>Map data: <a href="${esc(s.url)}" target="_blank" rel="noopener">amCharts</a>, India point of view.
    India is shown as the Government of India depicts it, including Jammu and Kashmir, Ladakh and Aksai Chin.
    Several of these boundaries are disputed internationally and other governments publish different depictions.
    This project does not draw or adjust any boundary itself: it selects a published dataset and names it.${extra ? " " + esc(extra) : ""}</span>
  </div>`;
}

const LABEL_OFFSET = {
  telaviv: [-9, -20, "end"], haifa: [-9, -34, "end"], jerusalem: [9, -6, "start"],
  ramla: [-9, -6, "end"], petahtikva: [9, -20, "start"], ashkelon: [-9, 12, "end"],
  kiryatgat: [9, 8, "start"], yeruham: [9, 22, "start"], beersheba: [-9, 24, "end"],
  mumbai: [9, 5, "start"], thane: [9, -10, "start"], alibag: [-9, 12, "end"],
  pune: [9, 15, "start"], ahmedabad: [9, -5, "start"], kochi: [9, 5, "start"],
  kolkata: [9, -5, "start"], delhi: [9, -5, "start"], bengaluru: [9, 13, "start"],
  aizawl: [9, 7, "start"], imphal: [9, -8, "start"]
};

function buildCorridorMap() {
  const g = D.geo.corridor, P = mapProj(g);
  const commColour = {}; D.communities.forEach(c => commColour[c.id] = c.colour);
  const commOf = {}; D.communities.forEach(c => (c.places || []).forEach(p => { if (!commOf[p]) commOf[p] = c.id; }));

  const routes = D.routes.map((r, i) => {
    const a = D.places[r.from], b = D.places[r.to];
    if (!a || !b) return "";
    const x1 = P.x(a.lon), y1 = P.y(a.lat), x2 = P.x(b.lon), y2 = P.y(b.lat);
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    // bow the arc perpendicular to the line, always towards the top of the chart
    const bow = dist * 0.17 + i * 9;
    let nx = -dy / dist, ny = dx / dist;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow;
    const len = dist * 1.35;
    return `<path class="mp-route" data-comm="${esc(r.community)}" d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"
      stroke="${esc(commColour[r.community] || "#6fb0dc")}" stroke-dasharray="${len.toFixed(0)}" stroke-dashoffset="${len.toFixed(0)}">
      <animate attributeName="stroke-dashoffset" from="${len.toFixed(0)}" to="0" dur="${(2.4 + i * 0.3).toFixed(1)}s" fill="freeze" begin="${(0.4 + i * 0.2).toFixed(1)}s"></animate></path>`;
  }).join("");

  const nodes = Object.entries(D.places).map(([id, p]) => {
    const x = P.x(p.lon), y = P.y(p.lat);
    const off = LABEL_OFFSET[id] || [9, 5, "start"];
    const col = p.country === "IL" ? "#6fb0dc" : (commColour[commOf[id]] || "#e6b33e");
    const leader = (Math.abs(off[1]) > 12) ? `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + off[0]).toFixed(1)}" y2="${(y + off[1] - 3).toFixed(1)}" stroke="${col}" stroke-width="0.5" opacity="0.45"></line>` : "";
    return `<g class="mp-node" data-place="${esc(id)}" data-comm="${esc(commOf[id] || "")}" tabindex="0" role="button" aria-label="${esc(p.name)}">
      <circle class="hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="${col}" fill-opacity="0"></circle>${leader}
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${col}"></circle>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="none" stroke="${col}" stroke-width="0.7" opacity="0.5"></circle>
      <text class="mp-label" x="${(x + off[0]).toFixed(1)}" y="${(y + off[1]).toFixed(1)}" text-anchor="${off[2]}">${esc(p.name.toUpperCase())}</text></g>`;
  }).join("");

  return `<svg id="mapsvg" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="Map of the corridor between India and Israel showing community centres and migration routes">
    ${graticule(g, P, 10, 5)}${landLayer(g)}${routes}${nodes}</svg>`;
}

function buildSynagogueMap() {
  const g = D.geo.india, P = mapProj(g);
  const commColour = {}; D.communities.forEach(c => commColour[c.id] = c.colour);
  const dots = D.synagogues.sites.filter(s => s.lat && s.lon).map(s => {
    const x = P.x(s.lon), y = P.y(s.lat);
    const col = commColour[s.community] || "#e6b33e";
    const solid = s.status === "active";
    return `<g class="mp-node" data-syn="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.name)}, ${esc(s.city)}">
      <circle class="hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="${col}" fill-opacity="0"></circle>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${solid ? col : "none"}" stroke="${col}" stroke-width="1.2"></circle></g>`;
  }).join("");
  return `<svg id="synmap" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="Map of Jewish sites recorded in India">
    ${graticule(g, P, 5, 5)}${landLayer(g)}${dots}</svg>`;
}

function buildIsraelInset() {
  const g = D.geo.israel, P = mapProj(g);
  const regions = (g.districts || []).map(d =>
    `<path class="${d.kind === "district" ? "mp-il" : "mp-other-region"}" d="${d.d}"></path>`).join("");
  const IL_LABEL = {
    haifa:      [7, -3, "start"],
    telaviv:    [-7, 1, "end"],
    petahtikva: [8, -6, "start"],
    ramla:      [8, 8, "start"],
    jerusalem:  [8, 3, "start"],
    ashkelon:   [-7, 4, "end"],
    kiryatgat:  [8, 10, "start"],
    beersheba:  [8, 3, "start"],
    yeruham:    [8, 3, "start"]
  };
  const dots = Object.entries(D.places).filter(([, p]) => p.country === "IL").map(([id, p]) => {
    const x = P.x(p.lon), y = P.y(p.lat);
    const off = IL_LABEL[id] || [7, 3, "start"];
    const lx = x + off[0], ly = y + off[1];
    const leader = Math.abs(off[1]) > 5
      ? `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${(ly - 3).toFixed(1)}" class="mp-leader"></line>` : "";
    return `<g class="mp-node" data-place="${esc(id)}" tabindex="0" role="button" aria-label="${esc(p.name)}">
      <circle class="hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="currentColor" fill-opacity="0"></circle>
      ${leader}
      <circle class="mp-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6"></circle>
      <text class="mp-label mp-label-il" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
        text-anchor="${off[2]}">${esc(p.name.toUpperCase())}</text></g>`;
  }).join("");
  return `<svg viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="Map of Israel and the surrounding region, drawn region by region">
    ${graticule(g, P, 1, 1)}
    <path class="mp-other" d="${g.others}"></path>
    ${regions}${dots}</svg>`;
}

function wireMap(root) {
  const info = $("#mapinfo", root);
  $$(".mp-node[data-place]", root).forEach(n => {
    const show = () => {
      const p = D.places[n.dataset.place]; if (!p || !info) return;
      const comm = D.communities.find(c => c.id === n.dataset.comm);
      info.innerHTML = `<div><h5>${esc(p.name)}</h5><p>${esc(p.note || "No note recorded yet.")}</p></div>
        <div><h5>${comm ? esc(comm.name) : (p.country === "IL" ? "Israel" : "India")}</h5><p>${comm ? esc(comm.summary) : (p.country === "IL" ? "Destination city in Israel." : "Location in India.")}</p></div>
        <div><h5>Position</h5><p class="num">${p.lat.toFixed(2)} N, ${p.lon.toFixed(2)} E</p></div>`;
    };
    n.addEventListener("mouseenter", show); n.addEventListener("focus", show); n.addEventListener("click", show);
  });
  $$(".mp-node[data-syn]", root).forEach(n => {
    const show = () => {
      const s = D.synagogues.sites.find(x => x.id === n.dataset.syn); if (!s || !info) return;
      info.innerHTML = `<div><h5>${esc(s.name)}</h5><p>${esc(s.city)}, ${esc(s.state)}${s.founded ? ". Founded " + esc(s.founded) : ""}</p></div>
        <div><h5>Status</h5><p>${esc(s.statusNote)}</p></div>
        <div><h5>Community</h5><p>${esc((D.communities.find(c => c.id === s.community) || {}).name || "Not recorded")}</p></div>`;
    };
    n.addEventListener("mouseenter", show); n.addEventListener("focus", show); n.addEventListener("click", show);
  });
  $$("[data-legend]", root).forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.legend, already = b.classList.contains("on");
    $$("[data-legend]", root).forEach(x => x.classList.remove("on"));
    $$(".mp-route", root).forEach(r => r.classList.remove("hi"));
    if (already) return;
    b.classList.add("on");
    $$(`.mp-route[data-comm="${id}"]`, root).forEach(r => r.classList.add("hi"));
  }));
}

/* ============================================================
   VIEWS
   ============================================================ */
const V = {};

V.home = () => {
  const pivots = D.timeline.filter(t => t.pivotal);
  return `
  <section class="hero"><div class="hero-in">
    <div class="hero-coords">
      <span class="tick">31.78 N / 35.22 E &nbsp; Jerusalem</span>
      <span class="tick">19.08 N / 72.88 E &nbsp; Mumbai</span>
    </div>
    <span class="tick">An independent research and public knowledge project</span>
    <h1 style="margin-top:16px">The relationship did not begin in <em>1992</em>.</h1>
    <div class="hero-rule"></div>
    <p class="hero-lede">It began wherever people, goods, letters and memory crossed between India and the Jewish world. Two embassies opened in 1992. The traffic is older than that, and this project exists to document it: dated, sourced, and open to correction.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="#/timeline">Enter the timeline</a>
      <a class="btn" href="#/chart">Open the map</a>
      <a class="btn" href="#/synagogues">The synagogue directory</a>
    </div>
  </div></section>

  <div class="beat-strip">
    <div class="beat"><b class="num">1568</b><p>The Paradesi Synagogue is built in Kochi. India's oldest.</p></div>
    <div class="beat"><b class="num">1950</b><p>India recognises the State of Israel, on 17 September.</p></div>
    <div class="beat"><b class="num">1992</b><p>Full diplomatic relations, forty-two years later.</p></div>
    <div class="beat q"><b>2026</b><p>Terms of reference for a free trade agreement. Where next?</p></div>
  </div>

  <section class="sec">
    <div class="sec-head"><span class="tick">01 / The record in numbers</span>
      <h2>What the official documents actually say</h2>
      <p>Every figure below comes from a named government source and links to it. Where two official sources disagree, this site shows the disagreement rather than choosing a side.</p></div>
    <div class="stat-grid">${D.figures.slice(0, 6).map(f => `<div class="stat">
      <span class="card-k">${badge(f.status)}</span><span class="stat-v">${esc(f.value)}</span>
      <span class="stat-l">${esc(f.label)}</span>${f.note ? `<span class="stat-n">${esc(f.note)}</span>` : ""}</div>`).join("")}</div>
    <div style="margin-top:22px"><a class="btn" href="#/relationship">All figures and sectors</a></div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="tick">02 / Turning points</span><h2>Dates that changed the shape of it</h2></div>
    <div class="grid">${pivots.map(t => `<div class="card">
      <span class="card-k">${badge(t.status)}<span class="tl-sector">${esc(t.dateLabel)}</span></span>
      <h4>${esc(t.title)}</h4><p>${esc(t.body)}</p>${srcline(t.sources, t.id)}</div>`).join("")}</div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="tick">03 / What remains standing</span>
      <h2>${D.synagogues.sites.length} Jewish sites recorded in India</h2>
      <p>The congregations are largely gone. The buildings are the part that stayed, and there is no clean sourced list of them anywhere. Building one is the most useful thing this project can do.</p></div>
    <div class="grid">${D.synagogues.sites.filter(s => s.founded).slice(0, 4).map(s => `<a class="card" href="#/synagogues">
      <span class="tick">${esc(s.city)}, ${esc(s.state)}</span><h4>${esc(s.name)}</h4>
      <span class="card-k"><span class="badge ${s.status === "active" ? "badge-verified" : s.status === "closed" ? "badge-figures" : "badge-community"}">${esc(s.status)}</span><span class="tl-sector">${esc(s.founded)}</span></span></a>`).join("")}</div>
    <div style="margin-top:22px"><a class="btn" href="#/synagogues">Open the directory</a></div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="tick">04 / Communities</span><h2>Four communities, not one category</h2>
      <p>India's Jewish communities are routinely flattened into a single label. They have different languages, different arrival stories, different centuries and different reasons for leaving.</p></div>
    <div class="grid">${D.communities.map(c => `<a class="card comm-card" style="border-top-color:${esc(c.colour)}" href="#/communities">
      <span class="tick">${esc(c.region)}</span><h4>${esc(c.name)}</h4><p>${esc(c.summary)}</p></a>`).join("")}</div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="tick">05 / Reading</span><h2>From the archive</h2></div>
    <div class="grid">${D.articles.articles.slice(0, 4).map(a => `<a class="card" href="#/article/${esc(a.id)}">
      <span class="tick">${esc(a.kind)}</span><h4>${esc(a.title)}</h4><p>${esc(a.standfirst)}</p>
      <span class="tick num">${words(a.body.join(" "))} words</span></a>`).join("")}</div>
    <div style="margin-top:22px"><a class="btn" href="#/library">The whole library</a></div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="tick">06 / Elsewhere</span><h2>Other people's work</h2>
      <p>This project is not the only thing worth your evening, and pretending otherwise would be silly. ${D.books.books.length} books and ${D.videos.videos.length} films, each one checked so the link goes where it says it goes.</p></div>
    <div class="grid">
      <a class="card" href="#/books"><span class="tick">The Reading Room</span>
        <h4>${D.books.books.length} books on ${D.books.categories.length} shelves</h4>
        <p>The scholarship on India's Jewish communities, the fiction and memoir, and the language courses. ${D.books.freeCount} of them are free to read in full, legally, and those are marked.</p></a>
      <a class="card" href="#/watch"><span class="tick">The Watch Room</span>
        <h4>${D.videos.videos.length} films and lectures</h4>
        <p>Johanna Spector's 1978 film of the Konkan villages, a Malida ceremony, a walk through Jewish Calcutta, and the alphabet lessons. Nothing loads until you press it.</p></a>
      <a class="card" href="#/culture"><span class="tick">Culture</span>
        <h4>${D.culture.people.length} writers, painters, actors and musicians</h4>
        <p>The people who made things. Nissim Ezekiel, Anish Kapoor, Sulochana, Nadira, and the Judeo Marathi liturgy that has no parallel anywhere else.</p></a>
      <a class="card" href="#/reading"><span class="tick">Where to start</span>
        <h4>The reading guide</h4>
        <p>Four routes in, depending on whether you came for the poetry, the history, the buildings or the politics.</p></a>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="tick">07 / Standing questions</span><h2>What this project does not know yet</h2>
      <p>A research site that lists only what it has settled is a brochure. These are open.</p></div>
    <div class="grid">${D.questions.slice(0, 4).map(q => `<div class="card"><h4>${esc(q.q)}</h4><p>${esc(q.note)}</p></div>`).join("")}</div>
    <div style="margin-top:22px"><a class="btn" href="#/questions">All open questions</a></div>
  </section>`;
};

V.timeline = () => {
  const sectors = D.sectors.filter(s => D.timeline.some(t => t.sector === s.id));
  return `<div class="page-head"><span class="tick">Section 01</span><h1>The Timeline</h1>
    <p class="lede">From community tradition to last month's joint declaration. Filter by sector. Every entry carries its source, and every source opens.</p></div>
  <div class="filters" id="tlfilters"><button class="chip on" data-sector="all">All</button>
    ${sectors.map(s => `<button class="chip" data-sector="${esc(s.id)}">${esc(s.label)}</button>`).join("")}</div>
  <div class="tl" id="tlbody"></div>`;
};

function renderTimeline(filter) {
  const body = $("#tlbody"); if (!body) return;
  const items = D.timeline.filter(t => filter === "all" || t.sector === filter).sort((a, b) => a.sortKey - b.sortKey);
  if (!items.length) { body.innerHTML = `<div class="empty">Nothing recorded under this filter yet.</div>`; return; }
  let out = "", era = null;
  items.forEach(t => {
    if (t.era !== era) { era = t.era; out += `<div class="tl-era"><h3>${esc(era)}</h3><i></i></div>`; }
    const sec = D.sectors.find(s => s.id === t.sector);
    out += `<article class="tl-item${t.pivotal ? " pivot" : ""}"><div class="tl-date">${esc(t.dateLabel)}</div>
      <div class="tl-body"><div class="tl-meta"><span class="tl-sector">${esc(sec ? sec.label : t.sector)}</span>${badge(t.status)}</div>
      <h4>${esc(t.title)}</h4><p>${esc(t.body)}</p>${srcline(t.sources, t.id)}</div></article>`;
  });
  body.innerHTML = out;
}

V.chart = () => `<div class="page-head"><span class="tick">Section 02</span><h1>The Map</h1>
  <p class="lede">Community centres in India, destination cities in Israel, and the corridor between them. India is drawn from the India point of view dataset, so Jammu and Kashmir, Ladakh and Aksai Chin appear as the Government of India depicts them. The credit line under each map says exactly whose depiction this is.</p></div>
  <div class="legend"><span class="tick" style="align-self:center">Trace a community</span>
    ${D.communities.map(c => `<button data-legend="${esc(c.id)}"><i style="background:${esc(c.colour)}"></i>${esc(c.name)}</button>`).join("")}</div>
  <div class="chartbox">${buildCorridorMap()}
    <div class="mapinfo" id="mapinfo">
      <div><h5>Hover any point</h5><p>Each node carries its community, its note and its coordinates.</p></div>
      <div><h5>The arcs</h5><p>Community origin to destination pairs, not individual journeys or flight paths.</p></div>
      <div><h5>A limit worth stating</h5><p>Migration was never a single line from one city to one city. Read the community pages for what actually happened.</p></div>
    </div>${mapCredit()}</div>
  <section class="sec"><div class="sec-head"><span class="tick">Detail</span><h2>Israel, whole</h2>
    <p>The country end to end, drawn region by region, with the cities that appear in this project's record.</p></div>
    <div class="ilsplit">
      <div class="chartbox" style="margin:0">${buildIsraelInset()}</div>
      <div>
        <div class="mapinfo ilside" id="mapinfo">
          <div><h5>What is drawn</h5><p>Six Israeli districts, plus the two further areas the dataset publishes separately: the Golan Heights and the State of Palestine. All are shown, because a map that silently drops a region is making an argument without saying so.</p></div>
          <div><h5>The cities marked</h5><p>Tel Aviv, where the Embassy of India sits and where the Prime Minister addressed about 8,000 people of Indian origin in July 2017. Haifa, whose port an Adani led consortium acquired in 2022. And the towns that have hosted the National Convention of Indian Jews: Ramla, Yeruham, Kiryat Gat, Ashkelon and Petah Tikva.</p></div>
          <div><h5>Why it is this shape</h5><p>Israel runs a long way north to south and is narrow across. A map that fits the whole country in one frame is necessarily tall and thin. Most published maps crop it instead.</p></div>
        </div>
        ${mapCredit()}
        ${srcline(["eoi-telaviv", "amcharts-india"])}
      </div>
    </div></section>`;

V.synagogues = () => {
  const S = D.synagogues;
  return `<div class="page-head"><span class="tick">Section 03</span><h1>The Synagogue Directory</h1>
    <p class="lede">${esc(S.note)}</p></div>
  <div class="wrap"><div class="synsplit">
    <div class="chartbox" style="margin:0">${buildSynagogueMap()}${mapCredit("State and union territory boundaries are the 2023 set.")}</div>
    <div class="mapinfo synside" id="mapinfo">
      <div><h5>${S.sites.length} sites recorded</h5><p>A filled dot is an active congregation. A hollow dot is a building whose congregation has gone, or whose status is not yet recorded. Hover any dot.</p></div>
      <div><h5>Source</h5><p>${esc(S.sourceNote)}</p></div>
      <div><h5>Incomplete on purpose</h5><p>Entries with no date carry no date, rather than a guess. That is what the gaps in this directory mean.</p></div>
    </div></div></div>
  <div class="wrap">
    <input class="field" id="synq" type="search" placeholder="Search by name, city or community" aria-label="Search the directory" style="margin-bottom:22px">
    <div id="synbody" style="display:flex; flex-direction:column; gap:1px; background:var(--rule); border:1px solid var(--rule)"></div>
    <div class="sec" style="padding-left:0; padding-right:0"><div class="sec-head"><span class="tick">Wanted</span><h2>What this directory still needs</h2></div>
      <ul style="padding-left:20px; color:var(--text-2); display:flex; flex-direction:column; gap:8px">
        ${S.wanted.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>
  </div>`;
};

function renderSyn(q) {
  const body = $("#synbody"); if (!body) return;
  const n = (q || "").toLowerCase().trim();
  const rows = D.synagogues.sites.filter(s => !n || (s.name + " " + s.city + " " + s.state + " " + s.tradition + " " + (s.alsoKnown || "")).toLowerCase().includes(n));
  if (!rows.length) { body.innerHTML = `<div class="card"><p>No site matches that search.</p></div>`; return; }
  body.innerHTML = rows.map(s => {
    const c = D.communities.find(x => x.id === s.community);
    return `<article class="card" style="border-left:3px solid ${esc(c ? c.colour : "#6fb0dc")}">
      <div class="card-k"><span class="tick">${esc(s.city)}, ${esc(s.state)}</span>
        <span class="badge ${s.status === "active" ? "badge-verified" : s.status === "closed" ? "badge-figures" : "badge-community"}">${esc(s.status)}</span>
        ${s.founded ? `<span class="tl-sector">${esc(s.founded)}</span>` : `<span class="tick" style="color:var(--contest)">date not recorded</span>`}</div>
      <h4>${esc(s.name)}${s.alsoKnown ? ` <span style="color:var(--muted); font-size:0.7em">${esc(s.alsoKnown)}</span>` : ""}</h4>
      ${s.founder ? `<p class="tick">Founded by ${esc(s.founder)}</p>` : ""}
      <p style="color:var(--text-2)">${esc(s.statusNote)}</p>
      ${s.detail.map(d => `<p>${esc(d)}</p>`).join("")}
      ${srcline(s.sources, s.id)}</article>`;
  }).join("");
}

V.communities = () => `<div class="page-head"><span class="tick">Section 04</span><h1>The Communities</h1>
  <p class="lede">Four histories usually compressed into one sentence. Each claim below is labelled by what kind of claim it is. Community tradition is recorded as community tradition, not upgraded into documented fact.</p></div>
  <div class="wrap" style="display:flex; flex-direction:column; gap:34px">
    ${D.communities.map(c => `<article class="paper" style="border-top:3px solid ${esc(c.colour)}">
      <span class="tick">${esc(c.region)} &nbsp;/&nbsp; ${esc(c.language)}</span>
      <h3 style="font-size:32px; margin:10px 0 4px">${esc(c.name)}</h3>
      <p class="tick">${esc(c.meaning)}</p>
      <div class="prose" style="margin-top:20px">${c.detail.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      <div style="margin-top:22px; border-top:1px solid rgba(28,32,40,0.18); padding-top:18px">
        <span class="tick">Claim register</span>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px">
          ${c.claims.map(cl => `<div style="display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap">${badge(cl.status)}
            <span style="flex:1; min-width:220px; font-size:14.5px; color:#33383f">${esc(cl.text)}</span></div>`).join("")}</div></div>
      ${srcline([...new Set(c.claims.flatMap(cl => cl.sources))], c.id)}</article>`).join("")}</div>`;

V.relationship = () => {
  const bySector = {};
  D.timeline.forEach(t => (bySector[t.sector] = bySector[t.sector] || []).push(t));
  const max = Math.max(...D.sectors.map(x => (bySector[x.id] || []).length), 1);
  return `<div class="page-head"><span class="tick">Section 05</span><h1>The Relationship</h1>
    <p class="lede">Ten strands, sized by how much documented activity sits behind each one in the record this project holds. That is a measure of what has been documented here, not a measure of importance.</p></div>
  <div class="wrap"><div class="grid">${D.sectors.map(s => {
    const n = (bySector[s.id] || []).length;
    return `<a class="card" href="#/timeline"><span class="tick">${esc(s.glyph)}</span><h4>${esc(s.label)}</h4>
      <div class="scen-bar"><i style="width:${Math.round((n / max) * 100)}%"></i></div>
      <p class="num">${n} entr${n === 1 ? "y" : "ies"} on record</p></a>`;
  }).join("")}</div></div>
  <section class="sec"><div class="sec-head"><span class="tick">Every figure held</span><h2>The full numeric record</h2></div>
    <div class="grid">${D.figures.map(f => `<div class="card"><span class="card-k">${badge(f.status)}</span>
      <span class="stat-v">${esc(f.value)}</span><span class="stat-l">${esc(f.label)}</span>
      ${f.note ? `<p class="stat-n">${esc(f.note)}</p>` : ""}${srcline(f.sources, f.id)}</div>`).join("")}</div></section>`;
};

V.compare = () => {
  const C = D.cities;
  return `<div class="page-head"><span class="tick">Section 06</span><h1>Side by Side</h1>
    <p class="lede">${esc(C.note)}</p></div>
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:20px"><span class="tick">Two states</span><h2>Structural comparison</h2></div>
    <div style="display:flex; flex-direction:column; gap:1px; background:var(--rule); border:1px solid var(--rule)">
      ${C.countryPairs.map(p => `<div class="cmp">
        <div class="cmp-h"><span class="tick">${esc(p.point)}</span>${badge(p.status)}</div>
        <div class="cmp-b">
          <div class="cmp-side cmp-in"><span class="tick">India</span><p>${esc(p.india)}</p></div>
          <div class="cmp-side cmp-il"><span class="tick">Israel</span><p>${esc(p.israel)}</p></div>
        </div>
        <p class="cmp-o">${esc(p.observation)}</p>
        ${p.sources ? srcline(p.sources, "cmp-" + p.point.slice(0, 20)) : ""}
      </div>`).join("")}
    </div>
    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Two coasts</span><h2>City pairs</h2>
      <p>Not comparisons of size. Pairings by the role each city plays in this specific history.</p></div>
    <div class="grid">${C.cityPairs.map(p => `<div class="card">
      <div class="card-k"><span class="tl-sector">${esc(p.a)}</span><span style="color:var(--muted)">to</span><span class="tl-sector" style="color:var(--chart)">${esc(p.b)}</span></div>
      <p><strong style="color:var(--text); font-weight:500">${esc(p.a)}</strong> ${esc(p.aRole)}</p>
      <p><strong style="color:var(--text); font-weight:500">${esc(p.b)}</strong> ${esc(p.bRole)}</p>
      <p style="border-top:1px dashed var(--rule); padding-top:12px">${esc(p.link)}</p>
      ${srcline(p.sources, "citypair-" + p.a)}</div>`).join("")}</div>
    <div class="sec" style="padding-left:0; padding-right:0"><div class="sec-head"><span class="tick">Wanted</span><h2>Figures this page refuses to print without a source</h2></div>
      <ul style="padding-left:20px; color:var(--text-2); display:flex; flex-direction:column; gap:8px">${C.wanted.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>
  </div>`;
};

V.languages = () => {
  const L = D.languages;
  return `<div class="page-head"><span class="tick">Section 07</span><h1>Hebrew and Hindi</h1>
    <p class="lede">${esc(L.intro.lede)}</p></div>
  <div class="wrap">
    <p class="note-prose" style="margin-bottom:34px">${esc(L.intro.note)}</p>

    <div class="sec-head" style="margin-bottom:20px"><span class="tick">How the two systems work</span><h2>Not harder, differently shaped</h2></div>
    <div style="display:flex; flex-direction:column; gap:1px; background:var(--rule); border:1px solid var(--rule)">
      ${L.structure.map(s => `<div class="cmp"><div class="cmp-h"><span class="tick">${esc(s.point)}</span></div>
        <div class="cmp-b">
          <div class="cmp-side cmp-il"><span class="tick">Hebrew</span><p>${esc(s.hebrew)}</p></div>
          <div class="cmp-side cmp-in"><span class="tick">Hindi and Devanagari</span><p>${esc(s.hindi)}</p></div>
        </div></div>`).join("")}
    </div>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">The Hebrew alphabet</span><h2>Twenty-two letters</h2>
      <p>Read right to left. The number beside each letter is its value, which is what makes gematria possible.</p></div>
    <div class="glyphgrid">${L.hebrewLetters.map(l => `<div class="glyphcell">
      <span class="glyph he">${l.glyph}</span><span class="gname">${esc(l.name)}</span>
      <span class="gtrans">${esc(l.translit)}</span><span class="gval num">${l.value}</span>
      ${l.note ? `<span class="gnote">${esc(l.note)}</span>` : ""}</div>`).join("")}</div>
    <p class="tick" style="margin-top:16px">Five letters take a final form at the end of a word:
      ${L.hebrewFinals.map(f => `<span class="he" style="font-size:20px; margin:0 6px">${f.glyph}</span>${esc(f.from)}`).join(" &nbsp; ")}</p>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Devanagari vowels</span><h2>The vowel and its mark</h2>
      <p>Each vowel has a standalone letter and an attached mark. The mark is what you actually write most of the time.</p></div>
    <div class="glyphgrid">${L.devanagariVowels.map(v => `<div class="glyphcell">
      <span class="glyph dv">${v.glyph}</span><span class="gname">${v.matra ? "क" + v.matra : "क"}</span>
      <span class="gtrans">${esc(v.translit)}</span>${v.note ? `<span class="gnote">${esc(v.note)}</span>` : ""}</div>`).join("")}</div>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Devanagari consonants</span><h2>A map of the mouth</h2></div>
    <div style="display:flex; flex-direction:column; gap:14px">
      ${L.devanagariConsonants.map(r => `<div><span class="tick">${esc(r.row)}</span>
        <div class="glyphrow">${r.letters.map(([g, t]) => `<div class="glyphcell sm"><span class="glyph dv">${g}</span><span class="gtrans">${esc(t)}</span></div>`).join("")}</div></div>`).join("")}
    </div>
    <p style="color:var(--text-2); max-width:68ch; margin-top:20px">${esc(L.devanagariNote)}</p>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Side by side</span><h2>The same idea in both</h2></div>
    <div class="tablewrap"><table><thead><tr><th>Meaning</th><th>Hebrew</th><th>Hindi</th><th>Note</th></tr></thead>
      <tbody>${L.phrases.map(p => `<tr><td>${esc(p.meaning)}</td>
        <td><span class="he" style="font-size:21px">${p.hebrew}</span><br><span class="tick">${esc(p.hebrewT)}</span></td>
        <td><span class="dv" style="font-size:21px">${p.hindi}</span><br><span class="tick">${esc(p.hindiT)}</span></td>
        <td style="color:var(--text-2)">${esc(p.note)}</td></tr>`).join("")}</tbody></table></div>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Where to learn</span><h2>Resources, with their status shown</h2>
      <p>${esc(L.resources.note)}</p></div>
    <div class="grid">
      <div class="card"><span class="tick">Hebrew</span>
        ${L.resources.hebrew.map(r => `<div style="padding:10px 0; border-bottom:1px solid var(--rule-soft)">
          <a href="${esc(r.url)}" target="_blank" rel="noopener" style="font-size:16px">${esc(r.name)}</a>
          <div class="card-k" style="margin-top:6px">${badge(r.status)}<span class="tick">${esc(r.kind)}</span></div>
          <p style="font-size:13.5px; margin-top:6px">${esc(r.note)}</p></div>`).join("")}</div>
      <div class="card"><span class="tick">Hindi</span>
        ${L.resources.hindi.map(r => `<div style="padding:10px 0; border-bottom:1px solid var(--rule-soft)">
          <a href="${esc(r.url)}" target="_blank" rel="noopener" style="font-size:16px">${esc(r.name)}</a>
          <div class="card-k" style="margin-top:6px">${badge(r.status)}<span class="tick">${esc(r.kind)}</span></div>
          <p style="font-size:13.5px; margin-top:6px">${esc(r.note)}</p></div>`).join("")}</div>
      <div class="card"><span class="tick">Still wanted</span>
        <ul style="padding-left:18px; color:var(--text-2); display:flex; flex-direction:column; gap:8px; font-size:14px">
          ${L.resources.wanted.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>
    </div>
  </div>`;
};

V.statements = () => {
  const S = D.statements;
  return `<div class="page-head"><span class="tick">Section 08</span><h1>The Statements Wall</h1>
    <p class="lede">${esc(S.note)}</p></div>
  <div class="wrap">
    <div class="empty" style="margin-bottom:32px"><span class="tick">On social media</span>
      <p style="margin-top:10px">${esc(S.socialNote)}</p></div>

    <div class="sec-head" style="margin-bottom:20px"><span class="tick">Layer one</span><h2>The official record of contact</h2>
      <p>Every logged interaction between the two governments that this project has found in a primary source, newest first.</p></div>
    <div style="display:flex; flex-direction:column; gap:1px; background:var(--rule); border:1px solid var(--rule)">
      ${S.interactions.map(i => `<article class="card" style="border-left:3px solid ${i.type === "Telephone call" ? "#6fb0dc" : "#e6b33e"}">
        <div class="card-k"><span class="tl-sector">${esc(i.dateLabel)}</span><span class="badge badge-primary">${esc(i.type)}</span>${badge(i.status)}</div>
        <h4 style="font-size:18px">${esc(i.parties)}</h4><p>${esc(i.summary)}</p>${srcline(i.sources, "interaction-" + i.date)}</article>`).join("")}
    </div>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Layer three</span><h2>Accounts tracked</h2></div>
    <div class="grid">${S.accounts.map(a => `<div class="card">
      <span class="tick">${a.country === "IN" ? "India" : "Israel"}</span><h4 style="font-size:17px">${esc(a.handle)}</h4>
      <p class="tick">${esc(a.kind)}</p>${a.note ? `<p style="font-size:13.5px">${esc(a.note)}</p>` : ""}</div>`).join("")}</div>
    ${S.posts.length ? "" : `<div class="empty" style="margin-top:24px">No posts added yet. Posts are added one at a time through the manager, by pasting the link.</div>`}
  </div>`;
};

V.library = (typeFilter) => {
  const L = D.articles;
  const types = L.types || [];
  const all = L.articles.slice().sort((x, y) => String(y.published).localeCompare(String(x.published)));
  const rows = typeFilter ? all.filter(x => x.type === typeFilter) : all;
  const t = types.find(x => x.id === typeFilter);
  const totalWords = all.reduce((n, x) => n + words(x.body.join(" ")), 0);

  const cardOf = (x) => {
    const ty = types.find(z => z.id === x.type);
    return `<a class="pub" href="#/article/${esc(x.id)}">
      <div class="pub-meta"><span class="pub-type">${esc(ty ? ty.label.replace(/ies$/, "y").replace(/s$/, "") : x.kind)}</span>
        <span class="tick">${esc(fmtDate(x.published))}</span></div>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.standfirst)}</p>
      <div class="pub-foot"><span class="tick">${esc(x.author || CONFIG.defaultAuthor)}</span>
        <span class="tick num">${words(x.body.join(" ")).toLocaleString()} words</span></div>
    </a>`;
  };

  return `<div class="page-head"><span class="tick">Writing</span>
    <h1>${t ? esc(t.label) : "Latest Writing"}</h1>
    <p class="lede">${t ? esc(t.blurb) : "Everything this project has written, newest first, with its type, author, date and length."}</p></div>

  <div class="filters">
    <a class="chip ${typeFilter ? "" : "on"}" href="#/library">All writing</a>
    ${types.map(x => `<a class="chip ${typeFilter === x.id ? "on" : ""}" href="#/library/${esc(x.id)}">${esc(x.label)}</a>`).join("")}
  </div>

  <div class="wrap">
    <p class="tick" style="margin-bottom:26px">${rows.length} of ${all.length} pieces &nbsp;/&nbsp; ${totalWords.toLocaleString()} words in the library</p>
    ${rows.length ? `<div class="publist">${rows.map(cardOf).join("")}</div>` : `
      <div class="empty">
        <strong>Nothing published in this category yet.</strong>
        <p style="margin-top:12px">A Special Report on this site means a single subject investigation of six thousand words or more, resting on material this project gathered rather than assembled: archival documents read in the original, interviews conducted for the piece, buildings visited and photographed, or a dataset built from primary records.</p>
        <p>Two are in preparation: a complete sourced survey of Jewish built heritage in India, and a reconstruction of the forty-two years between recognition in 1950 and diplomatic relations in 1992. Neither will appear until it is finished.</p>
      </div>`}
  </div>`;
};

V.article = (id) => {
  const L = D.articles;
  const x = L.articles.find(z => z.id === id);
  if (!x) return `<div class="page-head"><h1>Not found</h1>
    <p class="lede">No piece with that name. <a href="#/library">Back to the writing</a>.</p></div>`;
  const ty = (L.types || []).find(z => z.id === x.type);
  const author = x.author || CONFIG.defaultAuthor;
  const wordCount = words(x.body.join(" "));
  const mins = Math.max(1, Math.round(wordCount / 220));

  const related = L.articles
    .filter(z => z.id !== x.id && (z.category === x.category || z.type === x.type))
    .slice(0, 3);

  return `<article class="artwrap">
    <div class="artmeta">
      <a class="tick" href="#/library">All writing</a>
      <div class="art-kicker">
        <span class="pub-type">${esc(ty ? ty.label.replace(/ies$/, "y").replace(/s$/, "") : x.kind)}</span>
        <span class="tick">${esc(fmtDate(x.published))}</span>
        <span class="tick num">${wordCount.toLocaleString()} words, about ${mins} minute${mins === 1 ? "" : "s"}</span>
      </div>
      <h1>${esc(x.title)}</h1>
      <p class="art-stand">${esc(x.standfirst)}</p>
      <div class="byline">
        <span class="byline-dot" aria-hidden="true"></span>
        <div><b>${esc(author)}</b><span class="tick">Published ${esc(fmtDate(x.published))}</span></div>
        <button class="btn" data-cite="${esc(x.id)}">How to cite</button>
      </div>
    </div>
    <div class="artbody prose">${x.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
    <div class="artfoot">
      ${srcline(x.sources)}
    </div>
    ${related.length ? `<div class="wrap" style="max-width:900px; padding-top:0">
      <div class="sec-head" style="margin-bottom:20px"><span class="tick">Read next</span></div>
      <div class="publist">${related.map(r => `<a class="pub" href="#/article/${esc(r.id)}">
        <div class="pub-meta"><span class="tick">${esc(r.kind)}</span></div>
        <h3 style="font-size:19px">${esc(r.title)}</h3><p>${esc(r.standfirst)}</p></a>`).join("")}</div>
    </div>` : ""}
  </article>`;
};

V.people = () => `<div class="page-head"><span class="tick">Section 10</span><h1>People</h1>
  <p class="lede">A register, not a hall of fame. Each entry records only what a named source states. Where this project knows little, it says little rather than filling the gap.</p></div>
  <div class="wrap"><input class="field" id="ppq" type="search" placeholder="Search people" aria-label="Search people" style="margin-bottom:22px">
  <div class="grid" id="ppbody"></div></div>`;

function renderPeople(q) {
  const body = $("#ppbody"); if (!body) return;
  const n = (q || "").toLowerCase().trim();
  const rows = D.people.filter(p => !n || (p.name + " " + p.field + " " + p.note).toLowerCase().includes(n));
  if (!rows.length) { body.innerHTML = `<div class="card"><p>No entry matches that search.</p></div>`; return; }
  body.innerHTML = rows.map(p => {
    const c = D.communities.find(x => x.id === p.community);
    return `<div class="card"><span class="tick">${esc(p.field)}</span><h4>${esc(p.name)}</h4>
      ${c ? `<span class="badge" style="color:${esc(c.colour)}; border-color:${esc(c.colour)}66">${esc(c.name)}</span>` : ""}
      <p>${esc(p.note)}</p>${srcline(p.sources, p.id)}</div>`;
  }).join("");
}

V.archive = () => `<div class="page-head"><span class="tick">Section 11</span><h1>The Open Dataset</h1>
  <p class="lede">Every dated entry this project holds, with its source. This is the data the rest of the site is built on. It is open, and it is meant to be reused.</p></div>
  <div class="wrap">
    <input class="field" id="arcq" type="search" placeholder="Search the record: water, defence, 2025, trade" aria-label="Search the record">
    <div style="display:flex; gap:10px; margin:16px 0 22px; flex-wrap:wrap">
      <button class="btn" id="arccsv">Show as CSV</button><button class="btn" id="arcjson">Show as JSON</button>
      <span class="tick" style="align-self:center">On the live site the raw files are in /content/</span></div>
    <div id="arcraw"></div>
    <div class="tablewrap"><table><thead><tr><th>Date</th><th>Entry</th><th>Sector</th><th>Status</th><th>Source</th></tr></thead>
      <tbody id="arcbody"></tbody></table></div></div>`;

function renderArchive(q) {
  const body = $("#arcbody"); if (!body) return;
  const n = (q || "").toLowerCase().trim();
  const rows = D.timeline.slice().sort((a, b) => b.sortKey - a.sortKey)
    .filter(t => !n || (t.title + " " + t.body + " " + t.sector + " " + t.dateLabel).toLowerCase().includes(n));
  if (!rows.length) { body.innerHTML = `<tr><td colspan="5">No entry matches that search.</td></tr>`; return; }
  body.innerHTML = rows.map(t => {
    const sec = D.sectors.find(s => s.id === t.sector);
    const src = (t.sources || []).map(id => { const s = D.sources[id]; return s ? `<a class="src-chip" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher.split(",")[0])}</a>` : ""; }).join(" ");
    return `<tr><td class="y num">${esc(t.dateLabel)}</td><td><strong style="font-weight:500">${esc(t.title)}</strong></td>
      <td>${esc(sec ? sec.label : t.sector)}</td><td>${badge(t.status)}</td><td>${src}</td></tr>`;
  }).join("");
}

function archiveExport(kind) {
  const rows = D.timeline.slice().sort((a, b) => a.sortKey - b.sortKey);
  let text;
  if (kind === "csv") {
    const q = (s) => `"${String(s == null ? "" : s).replace(/"/g, '""')}"`;
    text = "date,title,sector,status,source_publisher,source_url\n" + rows.map(t => {
      const s = D.sources[(t.sources || [])[0]] || {};
      return [t.dateLabel, t.title, t.sector, t.status, s.publisher, s.url].map(q).join(",");
    }).join("\n");
  } else {
    text = JSON.stringify(rows.map(t => ({ date: t.dateLabel, title: t.title, sector: t.sector, status: t.status,
      sources: (t.sources || []).map(id => D.sources[id]).filter(Boolean) })), null, 2);
  }
  $("#arcraw").innerHTML = `<div style="border:1px solid var(--rule); background:var(--sea-900); padding:16px; margin-bottom:22px">
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px">
      <span class="tick">${kind.toUpperCase()} export, ${rows.length} rows</span><button class="btn" id="arccopy">Copy to clipboard</button></div>
    <pre style="max-height:320px; overflow:auto; margin:0; font-family:var(--mono); font-size:11.5px; color:var(--text-2); white-space:pre">${esc(text)}</pre></div>`;
  $("#arccopy").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(text); e.target.textContent = "Copied"; }
    catch { e.target.textContent = "Select the text above to copy"; }
  });
}

V.trace = () => {
  const opts = Object.entries(D.places).map(([id, p]) => `<option value="${esc(id)}">${esc(p.name)}</option>`).join("");
  return `<div class="page-head"><span class="tick">Section 12</span><h1>Trace a Connection</h1>
    <p class="lede">Pick a place in India and a place in Israel. The site assembles the chain it can actually evidence between them, and tells you plainly where the chain runs out.</p></div>
  <div class="wrap"><div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:22px">
    <select class="field" id="trA" style="max-width:250px" aria-label="From">${opts}</select>
    <select class="field" id="trB" style="max-width:250px" aria-label="To">${opts}</select>
    <button class="btn btn-gold" id="trGo">Trace</button></div>
  <div class="trace-out" id="trOut"><p style="color:var(--muted)">Choose two points and press trace.</p></div></div>`;
};

function runTrace() {
  const a = $("#trA").value, b = $("#trB").value;
  const pa = D.places[a], pb = D.places[b], out = $("#trOut");
  if (!pa || !pb) return;
  const route = D.routes.find(r => (r.from === a && r.to === b) || (r.from === b && r.to === a));
  const comm = route ? D.communities.find(c => c.id === route.community) : null;
  const syn = D.synagogues.sites.filter(s => s.city.toLowerCase() === pa.name.toLowerCase() || s.city.toLowerCase() === pb.name.toLowerCase());
  const steps = [{ t: pa.name, d: pa.note || "No note recorded for this place yet." }];
  if (syn.length) steps.push({ t: `${syn.length} recorded site${syn.length === 1 ? "" : "s"}`, d: syn.map(s => s.name + (s.founded ? ", " + s.founded : "")).join(". ") });
  if (comm) {
    steps.push({ t: comm.name, d: comm.summary });
    steps.push({ t: "Migration", d: "The Embassy of India in Tel Aviv records the primary waves of migration from India as taking place in the 1950s and 1960s." });
  } else {
    steps.push({ t: "No documented route on file", d: "This project holds no evidenced community route between these two points. That is a gap in the record, not a statement that no connection existed. If you know of one with a source, write in and it will be added." });
  }
  steps.push({ t: pb.name, d: pb.note || "No note recorded for this place yet." });
  out.innerHTML = steps.map((s, i) => `<div class="trace-step" style="animation-delay:${i * 0.13}s"><i></i><div><b>${esc(s.t)}</b><p>${esc(s.d)}</p></div></div>`).join("")
    + srcline(["eoi-telaviv"], "trace");
}

V.questions = () => `<div class="page-head"><span class="tick">Section 13</span><h1>Open Questions</h1>
  <p class="lede">Research questions, not slogans. Each one is unsettled in the material this project has read so far. If you can close one with a source, the forum is the place.</p></div>
  <div class="wrap"><div class="grid">${D.questions.map((q, i) => `<div class="card">
    <span class="tick">Q${String(i + 1).padStart(2, "0")}</span><h4>${esc(q.q)}</h4><p>${esc(q.note)}</p></div>`).join("")}</div></div>`;

V.future = () => `<div class="page-head"><span class="tick">Section 14</span><h1>2047</h1>
  <p class="lede">India marks a hundred years of independence in 2047. Six ways the relationship could look by then. Pick the one you think is likeliest. Your choice is stored only in your own browser, so this is a thinking exercise, not a survey.</p></div>
  <div class="wrap"><div class="grid">${D.scenarios.map(s => `<button class="card scen" data-scen="${esc(s.id)}">
    <h4>${esc(s.title)}</h4><p>${esc(s.body)}</p><div class="scen-bar"><i data-bar="${esc(s.id)}"></i></div>
    <span class="tick" data-cnt="${esc(s.id)}"></span></button>`).join("")}</div>
  <p class="tick" style="margin-top:20px">Counts shown are from this browser only. A shared public tally needs a backend, which this project does not run.</p></div>`;

function wireFuture() {
  const KEY = "iicp.future.v1";
  let tally = {};
  try { tally = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { tally = {}; }
  function paint() {
    const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
    D.scenarios.forEach(s => {
      const n = tally[s.id] || 0;
      const bar = $(`[data-bar="${s.id}"]`), cnt = $(`[data-cnt="${s.id}"]`);
      if (bar) bar.style.width = Math.round((n / total) * 100) + "%";
      if (cnt) cnt.textContent = n ? `${n} pick${n === 1 ? "" : "s"} in this browser` : "Not picked yet";
    });
  }
  $$(".scen").forEach(b => b.addEventListener("click", () => {
    tally[b.dataset.scen] = (tally[b.dataset.scen] || 0) + 1;
    try { localStorage.setItem(KEY, JSON.stringify(tally)); } catch {}
    $$(".scen").forEach(x => x.classList.remove("picked"));
    b.classList.add("picked"); paint();
  }));
  paint();
}

V.newsroom = () => {
  const N = window.NEWS_DATA, items = (N && N.items) || [];
  return `<div class="page-head"><span class="tick">Section 15</span><h1>The Newsroom</h1>
    <p class="lede">Headlines and links only. This project does not reproduce anyone's article text. Every item goes to the publisher's own page, and every item is machine gathered, which means it is unverified until a person checks it.</p></div>
  <div class="wrap">${items.length ? `
    <p class="tick" style="margin-bottom:20px">Last gathered ${esc(N.generated || "unknown")} / ${items.length} items / ${esc((N.feedsOk || []).length)} of ${esc((N.feedsTried || []).length)} feeds responded</p>
    ${items.map(n => `<article class="news-item"><span class="tick">${esc(n.date || "")}</span>
      <div><span class="badge badge-press">${esc(n.source || "Unknown source")}</span>
      <h4 style="margin:8px 0 6px"><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a></h4>
      <span class="tick">Machine gathered, not yet verified by an editor</span></div></article>`).join("")}
  ` : `<div class="empty"><strong style="font-weight:500; color:var(--text)">No headlines gathered yet.</strong>
    <p style="margin-top:10px">The gathering job runs on a schedule once the site is deployed and writes into <code>assets/js/news.js</code>. It tests every feed on every run and records which ones responded, so a dead feed shows up as dead rather than silently disappearing.</p></div>`}</div>`;
};

V.forum = () => `<div class="page-head"><span class="tick">Forums</span><h1>Discussion Forum</h1>
  <p class="lede">A moderated space for people who work on this material, or want to. The rule that carries the whole thing: bring a source or bring a question, and treat disagreement as the normal condition of a subject this contested.</p></div>
  <div class="wrap" style="max-width:900px">
    <div class="twocol">
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">What the forum is for</h2>
        <p style="color:var(--ink-2)">Four things, in order of how much this project wants them.</p>
        <ol class="numlist">
          <li><b>Correcting the record.</b> If something on this site is wrong, the forum is the fastest way to say so in front of other people who can check it. Corrections raised in public get resolved in public.</li>
          <li><b>Filling the gaps.</b> Every section of this site carries a list of what it is missing: synagogues with no recorded date, cemeteries not surveyed, figures the project will not print without a source. If you can close one, that is the most useful thing you can do here.</li>
          <li><b>Arguing about interpretation.</b> The facts on this site are mostly settled. What they mean is not. Whether the relationship is fundamentally strategic or fundamentally commercial, whether the forty-two year gap was principle or circumstance, what the 1949 vote implies: these are live questions and the forum is where they belong.</li>
          <li><b>Finding each other.</b> The number of people working seriously on India and Israel as a subject, rather than as a position, is small. Most of them do not know one another.</li>
        </ol>
      </div>
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">Sections</h2>
        <ul class="tiles">
          <li><b>The Record</b><span>Corrections, missing dates, contested figures</span></li>
          <li><b>History and Communities</b><span>Bene Israel, Cochin, Baghdadi, Bnei Menashe, built heritage</span></li>
          <li><b>Diplomacy and the UN</b><span>Votes, statements, the 1949 to 1992 interval</span></li>
          <li><b>Agriculture, Water and Trade</b><span>Centres of excellence, projects, the trade series</span></li>
          <li><b>Defence and Technology</b><span>Only what is officially confirmed</span></li>
          <li><b>Language and Translation</b><span>Hebrew, Hindi, Marathi, Malayalam, Judeo-Marathi</span></li>
          <li><b>Ask a Researcher</b><span>Open questions, answered where anyone can</span></li>
          <li><b>Books and Reading</b><span>What is worth reading, and what is not</span></li>
        </ul>
      </div>
    </div>

    <h2 style="font-size:26px; margin:52px 0 16px">House rules</h2>
    <ol class="numlist">
      <li><b>Sources before conclusions.</b> A claim with no source is an opinion. Opinions are welcome; presenting one as a finding is not.</li>
      <li><b>No antisemitism, no Hinduphobia, no Islamophobia, no racism.</b> Argue with arguments. Communities are not arguments.</li>
      <li><b>No harassment and no doxxing.</b> Nobody's private information goes up here, including your own.</li>
      <li><b>No fabricated sources.</b> Inventing a citation, a quotation or a document is the one offence with no second chance, because it attacks the only thing this project has.</li>
      <li><b>No calls for violence</b> against anyone, anywhere, in any framing, including framings that present themselves as analysis.</li>
      <li><b>Disagreement stays.</b> Nobody is removed for reaching a different conclusion from this project's. People are removed for the five rules above.</li>
      <li><b>Sixteen and over.</b></li>
      <li><b>Keep private data out of public channels</b>, including phone numbers, addresses, identity documents and travel plans.</li>
    </ol>

    <h2 style="font-size:26px; margin:52px 0 16px">How moderation works</h2>
    <p style="color:var(--ink-2)">Reports go to the moderation team, who are named inside the space rather than anonymous. A first breach gets a warning with the rule quoted, so nobody has to guess what happened. A second gets a temporary removal. Fabricated sources and calls for violence are immediate and permanent.</p>
    <p style="color:var(--ink-2)">Moderation actions are logged. A moderator who removes something has to write down why, and the log is visible to the other moderators. That is what stops moderation drifting into taste.</p>
    <p style="color:var(--ink-2)">Nobody is moderated for disagreeing with the people who run this project. If that ever happens, it is a failure and it should be reported.</p>

    <h2 style="font-size:26px; margin:52px 0 16px">Safety, plainly</h2>
    <p style="color:var(--ink-2)">This subject attracts hostile attention from more than one direction, and anyone taking part in public should know that before they start. Three things reduce the risk. Use a name you are comfortable having attached to this permanently, which for many people will not be their legal name. Keep personal details out of public channels entirely. Report coordinated abuse rather than arguing with it.</p>
    <p style="color:var(--ink-2)">Direct messages between members are outside this project's control and cannot be moderated by it. Nobody connected to this project will ever ask you for money, identity documents, or a login. Treat any message that does as hostile, and report it.</p>

    <div class="callout" style="margin-top:44px">
      <span class="tick">Joining</span>
      <h3 style="font-size:22px; margin:10px 0 12px">The forum opens by introduction</h3>
      <p>It is not an open sign-up, and that is deliberate. A space this small survives on the quality of the first hundred people in it. Write, say what you work on or what you want to work on, and you will get a link.</p>
      <div style="margin-top:18px">
        ${mailBlock("contactEmail", "Forum: request an introduction",
          "Who you are:\n\nWhat you work on, or what you want to work on:\n\nAnything you have written or built on this subject:\n",
          "Write to join the forum",
          "The forum address has not been set yet. Add it in the manager, under Settings.")}
      </div>
      ${CONFIG.communityInvite ? `<div style="margin-top:16px"><a class="btn" href="${esc(CONFIG.communityInvite)}" target="_blank" rel="noopener">Open the community space</a></div>` : ""}
    </div>
  </div>`;

V.blog = () => `<div class="page-head"><span class="tick">Forums</span><h1>Write for Us</h1>
  <p class="lede">This project publishes work by other people. Here is what gets in, what does not, and what happens to a piece after you send it.</p></div>
  <div class="wrap" style="max-width:900px">
    <div class="twocol">
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">What gets published</h2>
        <p style="color:var(--ink-2)">Five kinds of thing.</p>
        <ol class="numlist">
          <li><b>Commentary</b>, 800 to 2,000 words, arguing a position on the evidence. Take a side. A commentary that concludes that the matter is complex has not concluded anything.</li>
          <li><b>Explainers</b>, 800 to 2,500 words, unpacking a document, an instrument, an institution or a piece of history that other writing assumes the reader knows.</li>
          <li><b>Community and family history</b>, any length, published as testimony. That label describes the kind of evidence, not its worth. For most of the communities on this site, family memory is the only record that exists.</li>
          <li><b>Document finds and translations.</b> If you have read something in Hebrew, Marathi, Malayalam, Judeo-Arabic or Judeo-Marathi that English language work on this subject has not used, that is the single most valuable thing you can send.</li>
          <li><b>Photographs</b> of buildings, cemeteries, documents or objects, with permission to publish and a note on where and when they were taken.</li>
        </ol>
      </div>
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">What does not</h2>
        <ul class="tiles">
          <li><b>Invented citations</b><span>The one thing that ends a relationship with this project permanently</span></li>
          <li><b>Attacks on communities</b><span>Argue with arguments, not with peoples</span></li>
          <li><b>Private individuals</b><span>Nothing identifying someone without their consent</span></li>
          <li><b>Already published work</b><span>Unless you hold the right to republish and say so</span></li>
          <li><b>Undisclosed interests</b><span>If you are paid by, employed by or affiliated with an actor in the story, say so and it can still run</span></li>
          <li><b>Anything written by a machine</b><span>Not because it is bad, because a byline has to mean somebody stands behind it</span></li>
        </ul>
      </div>
    </div>

    <h2 style="font-size:26px; margin:52px 0 16px">The standard for sources</h2>
    <p style="color:var(--ink-2)">At least three sources a reader can check, for anything factual. A link, a document reference, an archive box number, a page in a book, or a named person you interviewed with their permission. A guest piece is held to this exactly as tightly as a piece written in house.</p>
    <p style="color:var(--ink-2)">If a source is behind a paywall or exists only on paper, send the reference anyway. Unreachable is not the same as unverifiable.</p>

    <h2 style="font-size:26px; margin:52px 0 16px">What happens after you send it</h2>
    <ol class="numlist">
      <li><b>Acknowledgement within a week.</b> If a week passes with nothing, assume the message went astray and send it again.</li>
      <li><b>Source check.</b> An editor opens every source and confirms it exists and says what the piece claims it says. This is where most pieces need work, and it is not a judgement on the writing.</li>
      <li><b>Edit.</b> For clarity, length and house style. The house style has two hard rules: no em dashes, and no adjective doing the work of a citation.</li>
      <li><b>You see the edited version before it goes up</b>, in full, with the changes visible. Nothing is published that you have not approved.</li>
      <li><b>Publication</b> with your byline, the date, the word count, and a line noting the views are yours.</li>
      <li><b>Corrections</b> to your piece are published on the corrections page under your name, with what changed, exactly as they are for anything else on this site.</li>
    </ol>

    <h2 style="font-size:26px; margin:52px 0 16px">Payment, and being honest about it</h2>
    <p style="color:var(--ink-2)">There is none. This project has no budget and no revenue. What it can offer is a byline, an edit that takes your sources seriously, permanent publication with a stable link and a citation format, and a small readership of people who actually work on this subject.</p>
    <p style="color:var(--ink-2)">You keep the rights to your work. Publish it elsewhere afterwards if you want; a line noting where it first appeared is appreciated and not required.</p>

    <div class="callout" style="margin-top:44px">
      <span class="tick">Sending</span>
      <h3 style="font-size:22px; margin:10px 0 12px">Send it by email</h3>
      <div style="margin-top:18px">
        ${mailBlock("submissionsEmail", "Submission: ",
          "Working title:\n\nWhat kind of piece (commentary, explainer, testimony, document find, photographs):\n\nApproximate length:\n\nSources, at least three, with links or references:\n1.\n2.\n3.\n\nYour name as it should appear on the byline:\n\nAny interest, affiliation or funding a reader should know about:\n\nThe piece, pasted below or attached:\n",
          "Send a submission",
          "The submissions address has not been set yet. Add it in the manager, under Settings, and this becomes a working link.")}
      </div>
      <p class="tick" style="margin-top:16px">Pitch first if you would rather. A two line description is enough to find out whether it fits.</p>
    </div>
  </div>`;

V.corrections = () => {
  const C = D.corrections;
  return `<div class="page-head"><span class="tick">Forums</span><h1>Corrections</h1>
    <p class="lede">Every correction, with its date and what changed. Nothing here gets edited silently.</p></div>
  <div class="wrap" style="max-width:900px">
    <div class="twocol">
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">How to report an error</h2>
        <p style="color:var(--ink-2)">By email. Tell us the page, the sentence, and what is wrong with it.</p>
        <p style="color:var(--ink-2)">Tell us which page, which sentence, what is wrong with it, and if you have one, a source that shows the correct position. A correction with a source is acted on the same week. A correction without one is investigated, which takes longer.</p>
      </div>
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">What happens next</h2>
        <ol class="numlist">
          <li><b>Acknowledgement</b>, so you know it arrived.</li>
          <li><b>The claim is checked against its source</b>, not against memory or against what feels right.</li>
          <li><b>If the site is wrong</b>, the page is fixed and the correction appears below with the date, the page, what it said and what it says now.</li>
          <li><b>If the site is right</b>, you get the reasoning, and if the question is one that will be asked again it goes on this page too, so it does not have to be argued twice.</li>
          <li><b>If the sources genuinely conflict</b>, the page changes to show the conflict rather than picking a winner. This has already happened several times and those cases are listed under standing caveats.</li>
        </ol>
      </div>
    </div>

    <div class="callout" style="margin-top:40px">
      <span class="tick">Report</span>
      <h3 style="font-size:22px; margin:10px 0 12px">Tell this project it is wrong</h3>
      <p>Nothing about you is collected by this site. There is no form, no tracker and no database. The message goes to a person.</p>
      <div style="margin-top:18px">
        ${mailBlock("correctionsEmail", "Correction: ",
          "Page:\n\nThe sentence or figure that is wrong:\n\nWhat is wrong with it:\n\nA source showing the correct position, if you have one:\n\nMay we name you in the published correction? Yes or no:\n",
          "Report an error",
          "The corrections address has not been set yet. Add it in the manager, under Settings, and this becomes a working link.")}
      </div>
    </div>

    <h2 style="font-size:26px; margin:52px 0 18px">Corrections published so far</h2>
    ${C.log && C.log.length
      ? `<div class="publist">${C.log.map(l => `<div class="pub" style="cursor:default">
          <div class="pub-meta"><span class="tick">${esc(fmtDate(l.date))}</span></div>
          <p style="margin:0">${esc(l.text)}</p></div>`).join("")}</div>`
      : `<div class="empty"><strong>None yet.</strong>
         <p style="margin-top:12px">This site went up on 24 August 2026. When the first correction is made it will be listed here with its date, and the page it affects will carry a note. Nothing gets edited silently.</p></div>`}

    <h2 style="font-size:26px; margin:52px 0 18px">Standing caveats</h2>
    <p style="color:var(--ink-2)">Places where this project knows the record is uncertain, and has chosen to show the uncertainty rather than resolve it.</p>
    <div class="publist" style="margin-top:20px">
      ${(C.caveats || []).map(c => `<div class="pub" style="cursor:default"><p style="margin:0">${esc(c)}</p></div>`).join("")}
    </div>

    <h2 style="font-size:26px; margin:52px 0 18px">The check that runs before publishing</h2>
    <p style="color:var(--ink-2)">Every factual record here carries a source from the register. A script checks this on every change, and the site does not publish if a record is missing one. What the check cannot tell is whether a source is right. That is what readers catch.</p>
  </div>`;
};

V.support = () => `<div class="page-head"><span class="tick">About us</span><h1>Support the Project</h1>
  <p class="lede">This site costs almost nothing to run. Hosting is free, the code is free, there are no advertisements, no trackers and no analytics reading over your shoulder. What money would buy is documents, and only documents.</p></div>
  <div class="wrap" style="max-width:900px">
    <div class="twocol">
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">What money is for</h2>
        <ol class="numlist">
          <li><b>Archive access and copying.</b> Some of the material that would settle the open questions on this site sits in archives that charge for reproduction.</li>
          <li><b>Translation.</b> Marathi, Malayalam, Hebrew and Judeo-Arabic material is the single largest gap in this project's evidence, and translation is the one cost that cannot be worked around by effort.</li>
          <li><b>Travel to photograph buildings.</b> The synagogue directory has five entries with no recorded date and no cemeteries at all. Fixing that means going to Kerala, to Kolkata and to the north east with a camera.</li>
          <li><b>Books that are not online.</b> The serious scholarship on Jewish India is largely on paper.</li>
          <li><b>A domain name, eventually.</b> Not yet. The free address works, and buying a domain before a project has proved it deserves one is a way of feeling like an institution instead of becoming one.</li>
        </ol>
      </div>
      <div>
        <h2 style="font-size:26px; margin-bottom:14px">What support does not buy</h2>
        <p style="color:var(--ink-2)">A mention, a page, a framing, an omission, or a place in the record. Nothing on this site is for sale, and nothing on it has been paid for.</p>
        <p style="color:var(--ink-2)">If that ever changes, it will be said on this page before it happens rather than after, and any funded work will carry the funder's name on the piece itself.</p>
        <p style="color:var(--ink-2)">No donation is accepted from a government, a political party, or a body acting for one, in either country. Not because such money is dirty, but because a project whose only asset is being believed cannot afford the question.</p>
      </div>
    </div>

    <div class="callout" style="margin-top:40px">
      <span class="tick">Contribute</span>
      <h3 style="font-size:22px; margin:10px 0 12px">Buy the project a coffee</h3>
      ${CONFIG.supportLink
        ? `<p>Small, one off, no subscription, no tiers, no rewards.</p>
           <div style="margin-top:18px"><a class="btn btn-gold" href="${esc(CONFIG.supportLink)}" target="_blank" rel="noopener">Buy the project a coffee</a></div>`
        : `<div class="empty"><strong>Not connected yet.</strong>
           <p style="margin-top:10px">Add the Ko-fi or Buy Me a Coffee link in the manager, under Settings, and this becomes a working button.</p></div>`}
    </div>

    <h2 style="font-size:26px; margin:52px 0 16px">Four things worth more than money</h2>
    <ol class="numlist">
      <li><b>Tell this project it is wrong.</b> A single sourced correction improves the site more than a month of donations.</li>
      <li><b>Photograph a building nobody has recorded.</b> A synagogue, a cemetery, a plaque, a gate, with the date and place and permission to publish. The directory is thirteen entries and should be many times that.</li>
      <li><b>Send a document.</b> A family record, a letter, a passport, a ticket, a ketubah, a photograph of a shop sign. Ordinary paper is what community history is made of, and it is being thrown away every year.</li>
      <li><b>Translate one page.</b> Into Hindi, Marathi, Malayalam or Hebrew. A project writing about Indian Jewish history only in English is making a point it does not intend to make.</li>
    </ol>
    <div style="margin-top:26px">
      ${mailBlock("contactEmail", "Contributing to the project",
        "What you would like to contribute (a correction, photographs, a document, a translation, something else):\n\nDetails:\n",
        "Write to the project",
        "The contact address has not been set yet. Add it in the manager, under Settings.")}
    </div>
  </div>`;

V.about = () => `<div class="page-head"><span class="tick">Section 20</span><h1>About</h1></div>
  <div class="wrap"><div class="paper prose">
    <p style="font-size:19px; line-height:1.6">The India-Israel Civilisations Project is an independent digital research and public knowledge initiative documenting the historical, social, cultural, intellectual, economic and strategic connections between India and Israel.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">What it is</h3>
    <p>An independent project that documents the India-Israel relationship and supports its deepening. It is not neutral about whether that relationship is worth having, and it does not pretend otherwise. What it is strict about is evidence: the case for something is only as good as the sources under it.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">What it is not</h3>
    <p>Not a government website. Not an embassy. Not a political party, a registered organisation, a news agency, or a lobbying firm. Nobody pays for anything on it.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">How claims are handled</h3>
    <p>Every factual record in this site carries at least one source, and the build refuses to publish a record that does not. Claims are labelled by the kind of evidence behind them: a government document is not the same as an encyclopaedia entry, and neither is the same as a community tradition. All three appear here, each under its own label.</p>
    <p>Where two official sources disagree, both are shown. Where the record has a gap, the gap is stated rather than smoothed over.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">On the parts that are contested</h3>
    <p>This project is about India and Israel, and readers will already know that the wider region is the subject of serious and ongoing dispute. Pages here do not present that dispute as settled, and the forum does not require anyone to agree with the project's own view in order to take part.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">Maps</h3>
    <p>The maps use the India point of view geodata published by amCharts. India is drawn as the Government of India depicts it, including Jammu and Kashmir, Ladakh and Aksai Chin, with the 2023 state and union territory boundaries.</p>
    <p>Several of those boundaries are disputed internationally, and other governments publish different depictions of the same ground. This project does not draw or adjust any boundary itself. It selects a published dataset, names it on every map, and leaves the reader able to check what they are looking at.</p>
    <p>The most widely used free datasets draw India stopping short of Aksai Chin and Gilgit-Baltistan. A site about India, published from India, using one of those would be showing its readers a map their own government does not recognise, so it does not.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">Corrections</h3>
    <p>Everything on this site can be flagged, and corrections are published rather than quietly applied. See the corrections page.</p>
    <h3 style="font-size:22px; margin:32px 0 12px">Reuse</h3>
    <p>The data is open. Take it, check it, and use it. If it is wrong, say so and it gets fixed.</p>
    <p class="tick" style="margin-top:30px">Record last reviewed ${esc(D.meta.lastReviewed)}</p>
  </div></div>`;


V.centres = () => {
  const C = D.centres;
  const total = C.states.reduce((n, s) => n + s.n, 0);
  const max = Math.max(...C.states.map(s => s.n));
  return `<div class="page-head"><span class="tick">Section 05</span><h1>Centres of Excellence</h1>
    <p class="lede">${esc(C.note)}</p></div>
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:20px"><span class="tick">How many exist</span>
      <h2>Five official counts, five different numbers</h2>
      <p>This is not carelessness by anyone. Centres open, are approved before they open, and are counted differently depending on whether a source counts approvals or operations. The dates are what make the list readable.</p></div>
    <div class="tablewrap"><table><thead><tr><th>As of</th><th>What the source says</th><th>Source</th></tr></thead><tbody>
      ${C.counts.map(c => `<tr><td class="y">${esc(c.asOf)}</td><td>${esc(c.text)}</td>
        <td>${(c.sources || []).map(id => { const s = D.sources[id];
          return s ? `<a class="src-chip" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher.split(",")[0])}</a>` : ""; }).join(" ")}</td></tr>`).join("")}
    </tbody></table></div>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">${total} centres in ${C.states.length} states</span>
      <h2>Where they actually are</h2>
      <p>As listed by the Embassy of Israel in New Delhi. Not one of these is in a capital city. They sit in district agricultural stations, which is where an abstraction about cooperation turns into a particular crop in a particular place.</p></div>
    <div style="display:flex; flex-direction:column; gap:1px; background:var(--line); border:1px solid var(--line)">
      ${C.states.map(s => `<div class="cmp" style="padding:18px 22px">
        <div style="display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; margin-bottom:8px">
          <h4 style="font-size:19px">${esc(s.state)}</h4>
          <span class="tick num">${s.n} centre${s.n === 1 ? "" : "s"}</span>
          <span style="flex:1; min-width:80px"><span class="scen-bar" style="display:block"><i style="width:${Math.round(s.n / max * 100)}%; display:block; height:100%; background:var(--accent-2)"></i></span></span>
        </div>
        <p style="font-size:14.5px; color:var(--ink-2); margin:0">${esc(s.centres)}</p>
      </div>`).join("")}
    </div>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">Outward</span><h2>Villages of Excellence</h2></div>
    <p class="note-prose">${esc(C.villages)}</p>

    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">The water track</span><h2>Named projects, by place</h2>
      <p>Water cooperation is easier to state precisely than most of this relationship, because it lands as plant and paperwork in identifiable towns.</p></div>
    <div class="grid">${C.water.map(w => `<div class="card">
      <span class="tick">${esc(w.place)}</span><p>${esc(w.text)}</p></div>`).join("")}</div>

    ${srcline(C.sources, "centres")}
  </div>`;
};

V.events = () => `<div class="page-head"><span class="tick">Events</span><h1>Events</h1>
  <p class="lede">Nothing is scheduled yet. Here is what would be, and how to hear about it.</p></div>
  <div class="wrap" style="max-width:900px">
    <div class="empty">
      <strong>No events have been held or scheduled.</strong>
    </div>

    <h2 style="font-size:26px; margin:44px 0 16px">What this project would actually run</h2>
    <p style="color:var(--ink-2)">Three formats, in the order they are likely to happen. Each is small, online and free, because those are the only kinds a project with no budget can run without embarrassing itself.</p>
    <ol class="numlist">
      <li><b>A reading group.</b> One text a month on Jewish India, Indian foreign policy or the modern relationship, read properly and discussed for an hour. Ten people is a success. This is the format most likely to start first because it needs nothing except a text and a time.</li>
      <li><b>Recorded conversations with people who hold the material.</b> Members of the four communities, custodians of buildings, archivists, translators, and returned workers. Published as transcripts with the speaker's approval, which makes them primary sources rather than content.</li>
      <li><b>An annual review.</b> Once there is a year of record to review: what changed in the relationship, what this project got wrong, what it added, and what it still cannot answer. Published as a document rather than performed as a panel.</li>
    </ol>

    <div class="callout" style="margin-top:44px">
      <span class="tick">Get involved</span>
      <h3 style="font-size:22px; margin:10px 0 12px">Propose something, or ask to be told</h3>
      <p>If you would come to a reading group, or would sit for a recorded conversation, or want to be told when the first one happens, say so. A list of twenty interested people is what makes the first event possible.</p>
      <div style="margin-top:18px">
        ${mailBlock("contactEmail", "Events",
          "I would like to (join a reading group / sit for a recorded conversation / be told when something happens / propose something):\n\nAbout you:\n",
          "Write about events",
          "The contact address has not been set yet. Add it in the manager, under Settings.")}
      </div>
    </div>
  </div>`;

V.search = () => `<div class="page-head"><span class="tick">Search</span><h1>Search</h1>
  <p class="lede">The timeline, the writing, the built heritage survey, the people and the sources. Runs in your browser. Nothing you type leaves it.</p></div>
  <div class="wrap">
    <input class="field searchbox" id="sq" type="search" autofocus
      placeholder="Try: Kochi, 1949, water, Sassoon, Knesset, diamonds" aria-label="Search the site">
    <div id="sres" style="margin-top:28px"></div>
  </div>`;

function runSearch(q) {
  const box = $("#sres"); if (!box) return;
  const n = (q || "").toLowerCase().trim();
  if (n.length < 2) {
    box.innerHTML = `<p class="tick">Type at least two characters. ${D.timeline.length} dated entries, ${D.articles.articles.length} pieces of writing, ${D.synagogues.sites.length} recorded sites, ${D.people.length} people, ${D.culture.people.length} cultural figures, ${D.books.books.length} books, ${D.videos.videos.length} films and ${Object.keys(D.sources).length} sources are indexed.</p>`;
    return;
  }
  const hit = (s) => String(s || "").toLowerCase().includes(n);
  const groups = [
    { label: "Timeline", rows: D.timeline.filter(t => hit(t.title) || hit(t.body) || hit(t.dateLabel))
        .map(t => ({ href: "#/timeline", kicker: t.dateLabel, title: t.title, text: t.body })) },
    { label: "Writing", rows: D.articles.articles.filter(x => hit(x.title) || hit(x.standfirst) || hit(x.body.join(" ")))
        .map(x => ({ href: "#/article/" + x.id, kicker: x.kind, title: x.title, text: x.standfirst })) },
    { label: "Built heritage", rows: D.synagogues.sites.filter(s => hit(s.name) || hit(s.city) || hit(s.detail) || hit(s.statusNote))
        .map(s => ({ href: "#/synagogues", kicker: s.city + ", " + s.state, title: s.name, text: s.statusNote })) },
    { label: "People", rows: D.people.filter(p => hit(p.name) || hit(p.note) || hit(p.field))
        .map(p => ({ href: "#/people", kicker: p.field, title: p.name, text: p.note })) },
    { label: "Communities", rows: D.communities.filter(c => hit(c.name) || hit(c.summary) || hit(c.detail))
        .map(c => ({ href: "#/communities", kicker: c.region, title: c.name, text: c.summary })) },
    { label: "Culture", rows: D.culture.people.filter(p => hit(p.name) || hit(p.role) || hit(p.summary) || hit((p.detail||[]).join(" ")))
        .map(p => ({ href: "#/figure/" + p.id, kicker: p.role, title: p.name, text: p.summary })) },
    { label: "The Reading Room", rows: D.books.books.filter(x => hit(x.title) || hit(x.author) || hit(x.note))
        .map(x => ({ href: x.find, kicker: x.author, title: x.title, text: x.note, ext: true })) },
    { label: "The Watch Room", rows: D.videos.videos.filter(v => hit(v.title) || hit(v.channel) || hit(v.note))
        .map(v => ({ href: "#/watch/" + v.section, kicker: v.channel, title: v.title, text: v.note })) },
    { label: "Sources", rows: Object.entries(D.sources).filter(([, s]) => hit(s.publisher) || hit(s.title))
        .map(([, s]) => ({ href: s.url, kicker: s.tier, title: s.publisher, text: s.title, ext: true })) }
  ].filter(g => g.rows.length);

  const total = groups.reduce((t, g) => t + g.rows.length, 0);
  if (!total) {
    box.innerHTML = `<div class="empty"><strong>Nothing found for that.</strong>
      <p style="margin-top:12px">This project's coverage has real gaps, and a search that returns nothing may be showing you one of them rather than a spelling mistake. The open questions page lists what is missing on purpose.</p></div>`;
    return;
  }
  box.innerHTML = `<p class="tick" style="margin-bottom:22px">${total} result${total === 1 ? "" : "s"}</p>` +
    groups.map(g => `<div style="margin-bottom:34px">
      <div class="tl-era"><h3>${esc(g.label)}</h3><i></i><span class="tick num">${g.rows.length}</span></div>
      <div class="publist">${g.rows.slice(0, 12).map(r =>
        `<a class="pub" href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ""}>
          <div class="pub-meta"><span class="tick">${esc(r.kicker)}</span></div>
          <h3 style="font-size:19px">${esc(r.title)}</h3>
          <p>${esc(String(r.text || "").slice(0, 190))}</p></a>`).join("")}</div>
      ${g.rows.length > 12 ? `<p class="tick" style="margin-top:12px">${g.rows.length - 12} more not shown</p>` : ""}
    </div>`).join("");
}

/* ============================================================
   ILLUSTRATION PLATES

   Drawn by this project, from each subject's initials and a motif
   for their field. Decoration and a navigation aid. Not a portrait,
   and nobody should read one as a likeness. The images policy page
   explains why there are no photographs here yet.
   ============================================================ */
function hashOf(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const MOTIF = {
  book:    "M14 10 h20 a4 4 0 0 1 4 4 v24 a4 4 0 0 1 -4 4 h-20 z M24 10 v32",
  scroll:  "M12 14 h28 M12 22 h28 M12 30 h20 M16 8 a6 6 0 0 0 0 36 M36 8 a6 6 0 0 0 0 36",
  brush:   "M16 40 c6 -4 8 -12 6 -18 M22 22 l14 -14 a4 4 0 0 1 6 6 l-14 14 z M16 40 c-4 2 -6 0 -4 -4",
  film:    "M10 12 h32 v28 h-32 z M10 18 h32 M10 34 h32 M16 12 v6 M28 12 v6 M16 34 v6 M28 34 v6",
  music:   "M20 36 a5 5 0 1 0 8 4 v-26 l12 -4 v22 a5 5 0 1 0 4 4",
  archive: "M10 14 h32 v10 h-32 z M14 24 v18 h24 v-18 M20 32 h12"
};

function plate(id, name, motif) {
  const h = hashOf(id);
  const initials = name.replace(/,.*$/, "").split(/\s+/).filter(Boolean)
    .slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const rings = 3 + (h % 3);
  const rot = h % 90;
  const arcs = Array.from({ length: rings }, (_, i) => {
    const r = 22 + i * 9;
    const a0 = ((h >> (i * 3)) % 360);
    const a1 = a0 + 120 + ((h >> (i * 5)) % 160);
    const p = (deg) => [56 + r * Math.cos(deg * Math.PI / 180), 56 + r * Math.sin(deg * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    const large = (a1 - a0) % 360 > 180 ? 1 : 0;
    return `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"
      class="pl-arc" style="opacity:${(0.9 - i * 0.15).toFixed(2)}"></path>`;
  }).join("");
  const grid = Array.from({ length: 5 }, (_, i) =>
    `<line class="pl-grid" x1="0" y1="${12 + i * 20}" x2="112" y2="${12 + i * 20}"></line>`).join("");
  return `<svg class="plate" viewBox="0 0 112 112" role="img" aria-label="Decorative plate for ${esc(name)}">
    <rect width="112" height="112" class="pl-bg"></rect>
    ${grid}
    <g transform="rotate(${rot} 56 56)">${arcs}</g>
    <g transform="translate(34 34) scale(0.62)" class="pl-motif"><path d="${MOTIF[motif] || MOTIF.book}"></path></g>
    <text class="pl-init" x="56" y="102" text-anchor="middle">${esc(initials)}</text>
  </svg>`;
}

/* ============================================================
   CULTURE
   ============================================================ */
V.culture = (sectionId) => {
  const C = D.culture;
  const sec = C.sections.find(s => s.id === sectionId);
  const rows = sectionId ? C.people.filter(p => p.section === sectionId) : C.people;

  const card = (p) => `<a class="figcard" href="#/figure/${esc(p.id)}">
    <div class="figcard-plate">${plate(p.id, p.name, p.motif)}</div>
    <div class="figcard-body">
      <span class="tick">${esc(p.role)} &nbsp;/&nbsp; ${esc(p.dates)}</span>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.summary)}</p>
      <span class="tick">${esc(p.place)}</span>
    </div></a>`;

  return `<div class="page-head"><span class="tick">Culture</span>
    <h1>${sec ? esc(sec.label) : "Culture"}</h1>
    <p class="lede">${sec ? esc(sec.blurb) : esc(C.intro.lede)}</p></div>

  <div class="filters">
    <a class="chip ${sectionId ? "" : "on"}" href="#/culture">Everyone</a>
    ${C.sections.map(s => `<a class="chip ${sectionId === s.id ? "on" : ""}" href="#/culture/${esc(s.id)}">${esc(s.label)}</a>`).join("")}
    <a class="chip" href="#/reading">Reading guide</a>
    <a class="chip" href="#/images">Images policy</a>
  </div>

  <div class="wrap">
    ${sectionId ? "" : `<p class="note-prose" style="margin-bottom:30px">${esc(C.intro.note)}</p>`}
    <p class="tick" style="margin-bottom:22px">${rows.length} entries</p>
    <div class="figgrid">${rows.map(card).join("")}</div>
  </div>`;
};

V.figure = (id) => {
  const C = D.culture;
  const p = C.people.find(x => x.id === id);
  if (!p) return `<div class="page-head"><h1>Not found</h1>
    <p class="lede">No entry with that name. <a href="#/culture">Back to culture</a>.</p></div>`;
  const comm = D.communities.find(c => c.id === p.community);
  const sec = C.sections.find(s => s.id === p.section);
  const also = C.people.filter(x => x.section === p.section && x.id !== p.id).slice(0, 3);

  return `<article class="artwrap">
    <div class="artmeta">
      <a class="tick" href="#/culture/${esc(p.section)}">${esc(sec ? sec.label : "Culture")}</a>
      <div class="figtop">
        <div class="figtop-plate">${plate(p.id, p.name, p.motif)}</div>
        <div>
          <h1>${esc(p.name)}</h1>
          <p class="tick" style="margin-top:14px">${esc(p.role)}</p>
          <p class="tick">${esc(p.dates)} &nbsp;/&nbsp; ${esc(p.place)}</p>
          ${comm ? `<p class="tick" style="color:${esc(comm.colour)}">${esc(comm.name)}</p>` : ""}
        </div>
      </div>
      <p class="art-stand">${esc(p.summary)}</p>
    </div>
    <div class="artbody prose">${p.detail.map(x => `<p>${esc(x)}</p>`).join("")}</div>
    <div class="artfoot">
      ${(p.links || []).length ? `<div class="linkrow"><span class="tick">Go to</span>
        ${p.links.map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>` : ""}
      ${srcline(p.sources)}
    </div>
    ${also.length ? `<div class="wrap" style="max-width:900px; padding-top:0">
      <div class="sec-head" style="margin-bottom:20px"><span class="tick">Also in ${esc(sec ? sec.label : "this section")}</span></div>
      <div class="figgrid">${also.map(x => `<a class="figcard" href="#/figure/${esc(x.id)}">
        <div class="figcard-plate">${plate(x.id, x.name, x.motif)}</div>
        <div class="figcard-body"><span class="tick">${esc(x.dates)}</span>
        <h3 style="font-size:19px">${esc(x.name)}</h3><p>${esc(x.summary)}</p></div></a>`).join("")}</div>
    </div>` : ""}
  </article>`;
};

V.reading = () => {
  const R = D.culture.readingGuide;
  return `<div class="page-head"><span class="tick">Culture</span><h1>A Reading Guide</h1>
    <p class="lede">What to read, in what order, and where to get it legally. This project does not reprint the work itself, and the reason is below rather than buried in a policy page.</p></div>
  <div class="wrap" style="max-width:900px">
    <div class="callout"><span class="tick">Why nothing is reprinted here</span>
      <p style="margin-top:12px">${esc(R.note)}</p>
      <p>${esc(R.why)}</p></div>
    ${R.paths.map((path, i) => `<div style="margin-top:44px">
      <div class="tl-era"><h3>${esc(path.title)}</h3><i></i></div>
      <ol class="numlist">${path.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
    </div>`).join("")}
    <div class="callout" style="margin-top:48px"><span class="tick">Buying it</span>
      <h3 style="font-size:21px; margin:10px 0 12px">Buy the books</h3>
      <p>Every writer on this site is either alive or has an estate. Several of them are published by small presses that keep this material in print at commercial risk: Mayapple, Seagull, Speaking Tiger, Syracuse University Press. Buying a copy is a more useful form of support than anything this project can offer them.</p>
      <p>Where a publisher's page exists, it is linked from the writer's entry. None of those links is affiliated and this project earns nothing from any of them.</p></div>
  </div>`;
};

V.images = () => {
  const I = D.culture.imagesPolicy;
  return `<div class="page-head"><span class="tick">About us</span><h1>${esc(I.title)}</h1></div>
  <div class="wrap" style="max-width:900px">
    <div class="prose" style="font-size:17px">${I.body.map(x => `<p>${esc(x)}</p>`).join("")}</div>
    <div class="sec-head" style="margin:48px 0 20px"><span class="tick">Wanted</span><h2>What would actually fill this gap</h2></div>
    <ol class="numlist">${I.wanted.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
    <div class="callout" style="margin-top:44px"><span class="tick">Sending an image</span>
      <h3 style="font-size:21px; margin:10px 0 12px">Send a photograph</h3>
      <p>Tell us what it shows, where and roughly when it was taken, who took it, and confirm that you have the right to let it be published. That last line is the whole thing.</p>
      <div style="margin-top:18px">
        ${mailBlock("contactEmail", "Photographs for the project",
          "What the image shows:\n\nWhere it was taken:\n\nRoughly when:\n\nWho took it:\n\nDo you hold the right to permit publication? Yes or no:\n\nHow you would like to be credited:\n",
          "Send a photograph",
          "The contact address has not been set yet. Add it in the manager, under Settings.")}
      </div>
    </div>
    <div class="sec-head" style="margin:52px 0 20px"><span class="tick">The plates</span><h2>What the illustrations actually are</h2></div>
    <p class="note-prose">Each plate is generated from the subject's identifier: the number of arcs, their angles and the rotation all come from it, so the same person always gets the same plate and no two are alike. The glyph in the middle marks the field. The letters at the foot are initials. That is the whole system, and it contains no information about what anyone looked like.</p>
    <div class="figgrid" style="margin-top:26px">
      ${D.culture.people.slice(0, 4).map(p => `<div class="figcard" style="cursor:default">
        <div class="figcard-plate">${plate(p.id, p.name, p.motif)}</div>
        <div class="figcard-body"><span class="tick">${esc(p.motif)}</span>
        <h3 style="font-size:18px">${esc(p.name)}</h3></div></div>`).join("")}
    </div>
  </div>`;
};

/* ============================================================
   THE BOOK LIBRARY
   ============================================================ */
V.watch = (secId) => {
  const W = D.videos;
  const sec = W.sections.find(s => s.id === secId);
  const rows = sec ? W.videos.filter(v => v.section === sec.id) : W.videos;

  const card = (v) => `<article class="vid" data-vid="${esc(v.id)}">
    <button class="vidshot" data-play="${esc(v.id)}" aria-label="Play: ${esc(v.title)}">
      ${vidplate(v.id, v.section)}
      <span class="vidgo" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
    </button>
    <div class="vidbody">
      <span class="tick">${esc(v.channel)}</span>
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.note)}</p>
      <a class="booklink" href="${esc(v.url)}" target="_blank" rel="noopener">Open on YouTube</a>
    </div>
  </article>`;

  const tabs = `<div class="vidtabs">
    <a class="vidtab ${!sec ? "on" : ""}" href="#/watch">Everything</a>
    ${W.sections.map(s => `<a class="vidtab ${sec && sec.id === s.id ? "on" : ""}" href="#/watch/${s.id}">${esc(s.label)}</a>`).join("")}
  </div>`;

  return `<div class="wrap">
    <span class="tick">Culture</span>
    <h1 class="h1">${esc(W.intro.title)}</h1>
    <p class="lede">${esc(W.intro.lede)}</p>
    <p class="tick" style="margin-top:14px">${esc(W.intro.note)} Links checked ${esc(fmtDate(W.checked))}.</p>
    ${tabs}
    ${sec ? `<p style="color:var(--ink-2); margin:14px 0 0">${esc(sec.blurb)}</p>` : ""}
    <p class="tick" style="margin-top:18px">${rows.length} of ${W.videos.length}</p>
    <div class="vidgrid">${rows.map(card).join("")}</div>
  </div>`;
};

/* a drawn poster, so nothing is requested from Google until you press play */
const VIDTONE = { communities: 18, places: 150, voices: 268, relations: 330, scripts: 88 };
function vidplate(id, section) {
  const h = hashOf(id);
  const base = VIDTONE[section] == null ? 210 : VIDTONE[section];
  const bars = Array.from({ length: 9 }, (_, i) => {
    const t = (h >> (i * 2)) & 15;
    const w = 8 + (t * 5);
    const y = 14 + i * 15;
    return `<rect x="0" y="${y}" width="${w}%" height="7" rx="3.5" fill="hsl(${base + i * 3} 42% ${28 + t * 2.4}%)" opacity="${0.28 + (t % 5) * 0.11}"/>`;
  }).join("");
  return `<svg class="vidart" viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
    <rect width="320" height="180" fill="hsl(${base} 34% 13%)"/>
    <g transform="translate(24,6)">${bars}</g>
    <circle cx="${230 + (h % 40)}" cy="${44 + (h % 26)}" r="${30 + (h % 18)}" fill="none" stroke="hsl(${base + 40} 60% 62%)" stroke-width="1.1" opacity="0.4"/>
  </svg>`;
}

function wireWatch() {
  document.querySelectorAll("[data-play]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.play;
    const box = b.parentElement;
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    f.title = "YouTube video";
    f.loading = "lazy";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
    f.allowFullscreen = true;
    f.className = "vidframe";
    b.replaceWith(f);
    if (box) box.classList.add("playing");
  }));
}

V.books = (catSlug) => {
  const B = D.books;
  const cat = B.categories.find(c => c.slug === catSlug);
  const rows = cat ? B.books.filter(b => b.cat === cat.id) : B.books;

  const row = (b) => `<div class="bookrow">
    <div class="bookspine" aria-hidden="true"></div>
    <div class="bookbody">
      <h3>${esc(b.title)}</h3>
      <p class="bookmeta">${esc(b.author)}${b.publisher ? " &nbsp;/&nbsp; " + esc(b.publisher) : ""}${b.year ? " &nbsp;/&nbsp; " + esc(b.year) : ""}</p>
      <p class="booknote">${esc(b.note)}</p>
      <div class="booklinks">
        <a class="booklink" href="${esc(b.find)}" target="_blank" rel="noopener">Find it</a>
        ${b.free ? `<a class="booklink free" href="${esc(b.free)}" target="_blank" rel="noopener">Read it free</a>` : ""}
        ${b.isbn ? `<span class="tick num">ISBN ${esc(b.isbn)}</span>` : ""}
      </div>
    </div></div>`;

  return `<div class="page-head"><span class="tick">Library</span>
    <h1>${cat ? esc(cat.label) : "The Reading Room"}</h1>
    <p class="lede">${cat ? esc(cat.blurb) : esc(B.intro.lede)}</p></div>

  <div class="filters">
    <a class="chip ${catSlug ? "" : "on"}" href="#/books">All ${B.books.length}</a>
    ${B.categories.map(c => `<a class="chip ${catSlug === c.slug ? "on" : ""}" href="#/books/${esc(c.slug)}">${esc(c.label)} <b class="num">${c.count}</b></a>`).join("")}
  </div>

  <div class="wrap">
    <input class="field" id="bq" type="search" placeholder="Search by title, author, publisher or subject" aria-label="Search the library" style="margin-bottom:22px">
    <div class="shelfbar">
      <span class="tick" id="bcount">${rows.length} of ${B.books.length}</span>
      <span class="tick">${B.freeCount} free to read in full</span>
    </div>
    <div class="shelf" id="bshelf">${rows.map(row).join("")}</div>
    <p class="note-prose" style="margin-top:34px">${esc(B.intro.findNote)}</p>
    <p class="note-prose" style="margin-top:14px">${esc(B.intro.outOfPrint)}</p>
  </div>`;
};

function wireBooks(catSlug) {
  const B = D.books;
  const cat = B.categories.find(c => c.slug === catSlug);
  const base = cat ? B.books.filter(b => b.cat === cat.id) : B.books;
  const shelf = $("#bshelf"), count = $("#bcount"), q = $("#bq");
  if (!q) return;
  q.addEventListener("input", () => {
    const n = q.value.toLowerCase().trim();
    const rows = base.filter(b => !n ||
      (b.title + " " + b.author + " " + b.publisher + " " + b.note + " " + b.year).toLowerCase().includes(n));
    count.textContent = rows.length + " of " + B.books.length;
    shelf.innerHTML = rows.length ? rows.map(b => `<div class="bookrow">
      <div class="bookspine" aria-hidden="true"></div>
      <div class="bookbody"><h3>${esc(b.title)}</h3>
      <p class="bookmeta">${esc(b.author)}${b.publisher ? " &nbsp;/&nbsp; " + esc(b.publisher) : ""}${b.year ? " &nbsp;/&nbsp; " + esc(b.year) : ""}</p>
      <p class="booknote">${esc(b.note)}</p>
      <div class="booklinks">
        <a class="booklink" href="${esc(b.find)}" target="_blank" rel="noopener">Find it</a>
        ${b.free ? `<a class="booklink free" href="${esc(b.free)}" target="_blank" rel="noopener">Read it free</a>` : ""}
        ${b.isbn ? `<span class="tick num">ISBN ${esc(b.isbn)}</span>` : ""}
      </div></div></div>`).join("")
      : `<div class="empty"><strong>Nothing matches that.</strong><p style="margin-top:10px">Try an author's surname, or a city.</p></div>`;
  });
}

/* ============================================================
   THE SCRIPT TRAINER
   ============================================================ */
V.trainer = () => `<div class="page-head"><span class="tick">Hebrew and Hindi</span><h1>Learn the Letters</h1>
  <p class="lede">Twenty-two Hebrew letters and forty-six Devanagari signs. Both scripts can be read, slowly, in an afternoon. This drills them.</p></div>
  <div class="wrap">
    <div class="trainbar">
      <div class="segset" role="group" aria-label="Script">
        <button class="seg on" data-script="he">Hebrew</button>
        <button class="seg" data-script="dv">Devanagari</button>
        <button class="seg" data-script="mix">Both</button>
      </div>
      <div class="segset" role="group" aria-label="Direction">
        <button class="seg on" data-dir="read">See the letter</button>
        <button class="seg" data-dir="write">See the sound</button>
      </div>
    </div>
    <div class="trainer" id="trainer"></div>
    <div class="trainstats" id="trainstats"></div>
    <div class="sec" style="padding-left:0; padding-right:0">
      <div class="sec-head"><span class="tick">The whole set</span><h2>Every sign, side by side</h2></div>
      <div id="allglyphs"></div>
    </div>
  </div>`;

function wireTrainer() {
  const L = D.languages;
  const HE = L.hebrewLetters.map(x => ({ s: "he", g: x.glyph, t: x.translit, n: x.name, v: x.value }));
  const DV = L.devanagariVowels.map(x => ({ s: "dv", g: x.glyph, t: x.translit, n: "vowel" }))
    .concat(L.devanagariConsonants.flatMap(r => r.letters.map(([g, t]) => ({ s: "dv", g, t, n: r.row.split(",")[0] }))));

  let scriptSel = "he", dirSel = "read", pool = [], cur = null, right = 0, wrong = 0, seen = new Set();

  const build = () => {
    pool = scriptSel === "he" ? HE.slice() : scriptSel === "dv" ? DV.slice() : HE.concat(DV);
    right = 0; wrong = 0; seen = new Set(); next();
  };

  function pick() {
    const fresh = pool.filter(x => !seen.has(x.g));
    const from = fresh.length ? fresh : pool;
    return from[Math.floor(Math.random() * from.length)];
  }

  function next() {
    cur = pick();
    seen.add(cur.g);
    const wrongs = pool.filter(x => x.t !== cur.t);
    const opts = [cur];
    while (opts.length < 4 && wrongs.length) {
      const c = wrongs.splice(Math.floor(Math.random() * wrongs.length), 1)[0];
      if (!opts.some(o => o.t === c.t)) opts.push(c);
    }
    opts.sort(() => Math.random() - 0.5);

    const face = dirSel === "read"
      ? `<div class="trainface ${cur.s}">${cur.g}</div>`
      : `<div class="trainface trainsound">${esc(cur.t)}</div>`;

    $("#trainer").innerHTML = `
      <div class="traincard">
        ${face}
        <p class="tick">${dirSel === "read" ? "Which sound is this?" : "Which sign is this?"}</p>
        <div class="trainopts">${opts.map(o => `<button class="trainopt ${dirSel === "write" ? o.s : ""}" data-t="${esc(o.t)}">${
          dirSel === "read" ? esc(o.t) : o.g}</button>`).join("")}</div>
        <div class="trainfeed" id="trainfeed"></div>
      </div>`;

    $$(".trainopt").forEach(b => b.addEventListener("click", () => {
      const ok = b.dataset.t === cur.t;
      if (ok) right++; else wrong++;
      $$(".trainopt").forEach(x => {
        x.disabled = true;
        if (x.dataset.t === cur.t) x.classList.add("good");
        else if (x === b) x.classList.add("bad");
      });
      $("#trainfeed").innerHTML = `<p><b class="${cur.s}" style="font-size:26px">${cur.g}</b>
        &nbsp; ${esc(cur.t)} ${cur.n && cur.n !== "vowel" ? "&nbsp;/&nbsp; " + esc(cur.n) : ""}
        ${cur.v ? "&nbsp;/&nbsp; value " + cur.v : ""}</p>
        <button class="btn btn-gold" id="trainnext">Next</button>`;
      $("#trainnext").addEventListener("click", next);
      paint();
    }));
    paint();
  }

  function paint() {
    const total = right + wrong;
    $("#trainstats").innerHTML = `<div class="statline">
      <span class="tick">Correct <b class="num">${right}</b></span>
      <span class="tick">Wrong <b class="num">${wrong}</b></span>
      <span class="tick">Seen <b class="num">${seen.size}</b> of ${pool.length}</span>
      <span class="trainprog"><i style="width:${total ? Math.round(right / total * 100) : 0}%"></i></span>
    </div>`;
  }

  $$("[data-script]").forEach(b => b.addEventListener("click", () => {
    $$("[data-script]").forEach(x => x.classList.remove("on"));
    b.classList.add("on"); scriptSel = b.dataset.script; build();
  }));
  $$("[data-dir]").forEach(b => b.addEventListener("click", () => {
    $$("[data-dir]").forEach(x => x.classList.remove("on"));
    b.classList.add("on"); dirSel = b.dataset.dir; next();
  }));

  $("#allglyphs").innerHTML = `
    <div class="tl-era"><h3>Hebrew</h3><i></i><span class="tick num">${HE.length}</span></div>
    <div class="glyphgrid">${HE.map(x => `<div class="glyphcell">
      <span class="glyph he">${x.g}</span><span class="gname">${esc(x.n)}</span>
      <span class="gtrans">${esc(x.t)}</span><span class="gval num">${x.v}</span></div>`).join("")}</div>
    <div class="tl-era" style="margin-top:34px"><h3>Devanagari</h3><i></i><span class="tick num">${DV.length}</span></div>
    <div class="glyphgrid">${DV.map(x => `<div class="glyphcell">
      <span class="glyph dv">${x.g}</span><span class="gtrans">${esc(x.t)}</span>
      <span class="gnote">${esc(x.n)}</span></div>`).join("")}</div>`;

  build();
}

/* ============================================================
   ROUTER
   ============================================================ */
const RAW_GROUPS = [
  { label: "Research", sections: [
    { head: "The record", items: [
      ["timeline", "Timeline", "01"], ["archive", "Open Dataset", "02"],
      ["statements", "Statements Wall", "03"], ["questions", "Open Questions", "04"]
    ]},
    { head: "Geography", items: [
      ["chart", "Maps", "05"], ["compare", "Side by Side", "06"]
    ]}
  ]},
  { label: "Programmes", sections: [
    { head: "Areas of work", items: [
      ["relationship", "Diplomacy and Sectors", "07"],
      ["centres", "Agriculture and Water", "08"],
      ["communities", "Communities and Heritage", "09"],
      ["synagogues", "Built Heritage Survey", "10"],
      ["languages", "Hebrew and Hindi", "11"],
      ["trainer", "Learn the Letters", "11b"]
    ]}
  ]},
  { label: "Culture", sections: [
    { head: "People and work", items: [
      ["culture/writers", "Writers and Poets", "12"],
      ["culture/artists", "Painters and Artists", "13"],
      ["culture/cinema", "Cinema", "14"],
      ["culture/music", "Music", "15"]
    ]},
    { head: "Guides", items: [
      ["culture", "Everyone", "16"],
      ["reading", "Reading Guide", "17"],
      ["watch", "The Watch Room", "17b"],
      ["images", "Images Policy", "18"]
    ]}
  ]},
  { label: "Writing", sections: [
    { head: "Short form", items: [
      ["library/commentary", "Commentaries", "12"],
      ["library/explainer", "Explainers", "13"],
      ["library", "Latest Writing", "14"]
    ]},
    { head: "Long form", items: [
      ["library/special-report", "Special Reports", "15"],
      ["library/method-note", "Method Notes", "16"],
      ["newsroom", "Newsroom", "17"]
    ]},
    { head: "Other people's books", items: [
      ["books", "The Reading Room", "17b"]
    ]}
  ]},
  { label: "Forums", sections: [
    { head: "Take part", items: [
      ["forum", "Discussion Forum", "18"], ["blog", "Write for Us", "19"],
      ["corrections", "Corrections", "20"]
    ]}
  ]},
  { label: "Events", sections: [{ head: "", items: [["events", "Events", "21"]] }] },
  { label: "About us", sections: [
    { head: "The project", items: [
      ["about", "About", "22"], ["people", "Register of People", "23"],
      ["support", "Support", "24"]
    ]},
    { head: "Tools", items: [
      ["trace", "Trace a Connection", "25"], ["future", "Scenarios for 2047", "26"]
    ]}
  ]},
  { label: "Search", sections: [{ head: "", items: [["search", "Search", "27"]] }] }
];
const GROUPS = RAW_GROUPS.map(g => ({ ...g, items: g.sections.flatMap(s => s.items) }));
const ROUTES = [["home", "Home", "00"], ...GROUPS.flatMap(g => g.items)];
const routeName = (r) => String(r).split("/")[0];

function go(hash) {
  const parts = (hash || "").replace(/^#\//, "").split("/");
  let name = parts[0] || "home";
  const arg = parts[1];
  if (!V[name]) name = "home";
  const main = $("#main");
  main.innerHTML = `<div class="view on">${
    name === "article" ? V.article(arg) :
    name === "library" ? V.library(arg) :
    name === "culture" ? V.culture(arg) :
    name === "figure"  ? V.figure(arg) :
    name === "books"   ? V.books(arg) :
    name === "watch"   ? V.watch(arg) : V[name]()
  }</div>` + footHTML();
  scrollTo(0, 0);
  $$("[data-route]").forEach(el => el.classList.toggle("on", routeName(el.dataset.route) === name));
  $$(".navtop").forEach(b => b.classList.toggle("on",
    (GROUPS[+b.dataset.g] || { items: [] }).items.some(i => routeName(i[0]) === name)));
  const r = ROUTES.find(x => x[0] === name);
  document.title = (name === "home" ? "" : ((r ? r[1] : "Reading") + " / ")) + "The India-Israel Civilisations Project";

  if (name === "timeline") {
    renderTimeline("all");
    $$("#tlfilters .chip").forEach(c => c.addEventListener("click", () => {
      $$("#tlfilters .chip").forEach(x => x.classList.remove("on"));
      c.classList.add("on"); renderTimeline(c.dataset.sector);
    }));
  }
  if (name === "chart" || name === "synagogues") wireMap(main);
  if (name === "synagogues") { renderSyn(""); $("#synq").addEventListener("input", e => renderSyn(e.target.value)); }
  if (name === "archive") {
    renderArchive(""); $("#arcq").addEventListener("input", e => renderArchive(e.target.value));
    $("#arccsv").addEventListener("click", () => archiveExport("csv"));
    $("#arcjson").addEventListener("click", () => archiveExport("json"));
  }
  if (name === "people") { renderPeople(""); $("#ppq").addEventListener("input", e => renderPeople(e.target.value)); }
  if (name === "trace") $("#trGo").addEventListener("click", runTrace);
  if (name === "books") wireBooks(arg);
  if (name === "watch") wireWatch();
  if (name === "trainer") wireTrainer();
  if (name === "search") {
    runSearch("");
    const q = $("#sq");
    q.addEventListener("input", e => runSearch(e.target.value));
    setTimeout(() => q.focus(), 60);
  }
  $$("[data-cite]").forEach(b => b.addEventListener("click", () => openCite(b.dataset.cite)));
  if (name === "future") wireFuture();
  const sf = $("#subform");
  if (sf) sf.addEventListener("submit", e => {
    e.preventDefault();
    $("#subnote").textContent = "There is no mailing list running yet, so nothing was sent and nothing was stored. When one exists this form will connect to it and this line will say so.";
  });
  closeRail();
}

function footHTML() {
  const totalWords = D.articles.articles.reduce((n, a) => n + words(a.body.join(" ")), 0);
  const col = (h, items) => `<div><h5>${h}</h5><ul>${items.map(i =>
    `<li><a href="#/${i[0]}">${esc(i[1])}</a></li>`).join("")}</ul></div>`;
  return `<footer class="foot"><div class="foot-in">
    <div class="foot-name">INDIA <i>&times;</i> ISRAEL<i>.</i></div>
    <p class="foot-lede">An independent research and public knowledge project documenting the connections between India and Israel. Not a government site, not an embassy, not a registered organisation.</p>
    <div class="foot-cols">
      ${col("Explore", GROUPS[0].items)}
      ${col("Compare", GROUPS[1].items)}
      ${col("Read", GROUPS[2].items)}
      ${col("Take part", GROUPS[4].items.slice(0, 4))}
      <div><h5>The record</h5>
        <p class="num">Last reviewed ${esc(D.meta.lastReviewed)}<br>
        ${D.timeline.length} dated entries<br>
        ${D.synagogues.sites.length} sites recorded<br>
        ${Object.keys(D.sources).length} sources on file<br>
        ${totalWords.toLocaleString()} words in the library</p>
        <h5 style="margin-top:24px">Get the newsletter</h5>
        <form class="foot-sub" id="subform">
          <input type="email" placeholder="you@email.com" aria-label="Your email address" required>
          <button type="submit">Subscribe</button>
        </form>
        <p style="margin-top:9px; font-size:12.5px" id="subnote">No list is running yet. This form tells you so honestly rather than pretending to sign you up.</p>
      </div>
    </div>
    <div class="foot-bar">
      <span>Independent project. Views are the project's own.</span>
      <span>Data is open. Take it, check it, correct it.</span>
    </div>
  </div></footer>`;
}

function openCite(id) {
  const art = D.articles.articles.find(x => x.id === id);
  if (!art) return;
  const author = art.author || CONFIG.defaultAuthor;
  const year = String(art.published || "").slice(0, 4);
  const url = location.origin + location.pathname + "#/article/" + art.id;
  const cite = `${author}, "${art.title}", The India-Israel Civilisations Project, ${fmtDate(art.published)}, ${url}`;
  $("#modal-body").innerHTML = `<span class="tick">Citation</span>
    <h3 style="font-size:25px; margin:12px 0 16px">How to cite this piece</h3>
    <p style="color:var(--ink-2); font-size:15px">Take it, check it, and cite it however your discipline prefers. This is the form the project uses.</p>
    <pre class="citebox">${esc(cite)}</pre>
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px">
      <button class="btn btn-gold" id="citecopy">Copy</button>
    </div>
    <p class="tick" style="margin-top:18px">Author ${esc(author)} &nbsp;/&nbsp; Published ${esc(fmtDate(art.published))} &nbsp;/&nbsp; ${words(art.body.join(" ")).toLocaleString()} words</p>`;
  $("#modal").classList.add("on");
  $("#citecopy").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(cite); e.target.textContent = "Copied"; }
    catch { e.target.textContent = "Select the text above"; }
  });
  $(".modal-x").focus();
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return String(iso || "");
  return Number(m[3]) + " " + MONTHS[Number(m[2]) - 1] + " " + m[1];
}

function unusedFlag(factId, isSubmission) {
  const repoSet = CONFIG.githubRepo && !CONFIG.githubRepo.startsWith("YOUR-USERNAME");
  const title = isSubmission ? "Submission: " : `Correction: ${factId || "unspecified item"}`;
  const bodyText = isSubmission
    ? "Title:\n\nWord count:\n\nSources (at least three, with links):\n1.\n2.\n3.\n\nYour name as it should appear:\n\nThe piece (paste or link):\n"
    : `Item flagged: ${factId || "unspecified"}\nPage: ${location.href}\n\nWhat is wrong:\n\n\nSource showing the correct information (a link is ideal):\n\n\nAnything else:\n`;
  const url = repoSet ? `https://github.com/${CONFIG.githubRepo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(bodyText)}&labels=${isSubmission ? "submission" : "correction"}` : null;
  $("#modal-body").innerHTML = `<span class="tick">${isSubmission ? "Send a submission" : "Flag an error"}</span>
    <h3 style="font-size:27px; margin:12px 0 14px">${isSubmission ? "Send this project a piece" : "Tell this project it is wrong"}</h3>
    <p style="color:var(--text-2); font-size:15px">${isSubmission
      ? "Submissions open as a public post so the editorial process is visible. If you would rather send it privately, use the community space instead."
      : "Flags open as a public record so that corrections cannot be quietly made or quietly ignored. Nothing about you is collected by this site."}</p>
    ${url ? `<div style="margin-top:22px"><a class="btn btn-gold" href="${esc(url)}" target="_blank" rel="noopener">Open the pre-filled form</a></div>`
      : `<div class="empty" style="margin-top:22px"><strong style="font-weight:500; color:var(--text)">Not connected yet.</strong>
        <p style="margin-top:10px">Set the repository in the manager and this button opens a pre-filled public report. Until then, here is what would be sent:</p>
        <pre style="margin-top:14px; white-space:pre-wrap; font-family:var(--mono); font-size:11.5px; color:var(--text-2)">${esc(bodyText)}</pre></div>`}`;
  $("#modal").classList.add("on");
  $(".modal-x").focus();
}

const openRail = () => {
  $("#drawer").classList.add("open"); $("#scrim").classList.add("on");
  $("#burger").setAttribute("aria-expanded", "true");
};
const closeRail = () => {
  $("#drawer").classList.remove("open"); $("#scrim").classList.remove("on");
  $("#burger").setAttribute("aria-expanded", "false");
};

/* ---------- themes ---------- */
const THEMES = ["institute", "archive", "paper"];
function setTheme(t, save) {
  if (!THEMES.includes(t)) t = "institute";
  document.documentElement.setAttribute("data-site-theme", t);
  $$(".themes button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.theme === t)));
  if (save) { try { localStorage.setItem("iicp.theme", t); } catch (e) {} }
  dispatchEvent(new Event("iicp:theme"));
}

/* ============================================================
   BOOT
   ============================================================ */
const FILES = ["core", "timeline", "communities", "people", "articles", "cities", "languages", "statements", "synagogues", "centres", "culture", "books", "videos", "corrections", "geo"];

async function loadContent() {
  if (window.SITE_DATA_INLINE) return window.SITE_DATA_INLINE;
  const out = {};
  await Promise.all(FILES.map(async f => {
    try {
      const r = await fetch(`content/${f}.json`, { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      if (f === "geo") out.geo = j;
      else if (f === "articles") out.articles = j;
      else if (f === "cities") out.cities = j;
      else if (f === "languages") out.languages = j;
      else if (f === "statements") out.statements = j;
      else if (f === "synagogues") out.synagogues = j;
      else if (f === "centres") out.centres = j;
      else if (f === "culture") out.culture = j;
      else if (f === "books") out.books = j;
      else if (f === "videos") out.videos = j;
      else if (f === "corrections") out.corrections = j;
      else Object.assign(out, j);
    } catch (e) { console.error("Could not load content/" + f + ".json", e); }
  }));
  return out;
}

async function boot() {
  D = await loadContent();
  if (!D.timeline) {
    $("#main").innerHTML = `<div class="wrap"><div class="empty"><strong style="color:var(--text)">Content did not load.</strong>
      <p style="margin-top:10px">The site reads its content from the files in /content/. If you are opening index.html directly from disk, a browser will block that for security reasons. Use a local server, or view the deployed site.</p></div></div>`;
    return;
  }
  const link = r => `<a href="#/${r[0]}" data-route="${esc(r[0])}">${esc(r[1])}</a>`;
  const secs = g => g.sections.map(s =>
    (s.head ? `<div class="drop-head">${esc(s.head)}</div>` : "") +
    s.items.map(link).join("")).join("");

  $("#mainnav").innerHTML = "<ul>" + GROUPS.map((g, i) => {
    const single = g.items.length === 1;
    return single
      ? `<li><a class="navtop" href="#/${g.items[0][0]}" data-g="${i}">${esc(g.label)}</a></li>`
      : `<li><button class="navtop" data-g="${i}">${esc(g.label)} <b>&#9660;</b></button>
          <div class="drop">${secs(g)}</div></li>`;
  }).join("") + "</ul>";

  $("#drawernav").innerHTML = GROUPS.map((g, i) => g.items.length === 1
    ? `<div class="dgroup"><a class="dhead" href="#/${g.items[0][0]}">${esc(g.label)}</a></div>`
    : `<div class="dgroup" data-dg="${i}">
        <button class="dhead">${esc(g.label)} <b>&#9660;</b></button>
        <div class="dbody">${secs(g)}</div>
      </div>`).join("");

  $$(".dhead").forEach(b => b.addEventListener("click", () => b.parentElement.classList.toggle("open")));
  $$("button.navtop").forEach(b => b.addEventListener("click", () => {
    const g = GROUPS[+b.dataset.g];
    if (g && g.items[0]) location.hash = "#/" + g.items[0][0];
  }));
  $$(".themes button").forEach(b => b.addEventListener("click", () => setTheme(b.dataset.theme, true)));
  let saved = "institute";
  try { saved = localStorage.getItem("iicp.theme") || "institute"; } catch (e) {}
  setTheme(saved, false);

  chartbed();
  addEventListener("hashchange", () => go(location.hash));
  $("#burger").addEventListener("click", openRail);
  $("#drawerx").addEventListener("click", closeRail);
  $("#scrim").addEventListener("click", closeRail);
  $(".modal-x").addEventListener("click", () => $("#modal").classList.remove("on"));
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") $("#modal").classList.remove("on"); });
  addEventListener("keydown", e => { if (e.key === "Escape") { $("#modal").classList.remove("on"); closeRail(); } });
  go(location.hash);
}

document.addEventListener("DOMContentLoaded", boot);
