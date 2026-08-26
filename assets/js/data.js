/* ============================================================
   THE INDIA-ISRAEL CIVILISATIONS PROJECT
   Curated data layer.

   RULE: every factual record must carry at least one sourceId.
   scripts/verify-sources.mjs enforces this and fails the build
   if any record is unsourced. Do not remove that check.
   ============================================================ */

window.SITE_DATA = {

  meta: {
    name: "The India-Israel Civilisations Project",
    tagline: "History. People. Ideas. Partnership.",
    lastReviewed: "2026-08-23"
  },

  /* ---------- SOURCES ----------
     tier: primary | reference | press | community
     primary   = government document, treaty, official statement
     reference = encyclopaedia, established institutional reference
     press     = established news organisation
     community = oral history, community tradition, community body
  ------------------------------------------------ */
  sources: {
    "mea-2026": {
      publisher: "Ministry of External Affairs, Government of India",
      title: "India-Israel Bilateral Relations (brief, February 2026)",
      url: "https://www.mea.gov.in/Portal/ForeignRelation/Israel_February_2026_1_.pdf",
      tier: "primary",
      accessed: "2026-08-23"
    },
    "eoi-telaviv": {
      publisher: "Embassy of India, Tel Aviv",
      title: "Indian Community in Israel",
      url: "https://www.indembassyisrael.gov.in/pages?id=xboja&subid=wdLwb",
      tier: "primary",
      accessed: "2026-08-23"
    },
    "pib-jews": {
      publisher: "Press Information Bureau, Government of India",
      title: "Press release on Jewish communities in India",
      url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2232908&lang=1&reg=3",
      tier: "primary",
      accessed: "2026-08-23"
    },
    "wjc-india": {
      publisher: "World Jewish Congress",
      title: "Jewish Community in India",
      url: "https://www.worldjewishcongress.org/en/about/communities/IN",
      tier: "reference",
      accessed: "2026-08-23"
    },
    "britannica-paradesi": {
      publisher: "Encyclopaedia Britannica",
      title: "Paradesi Synagogue",
      url: "https://www.britannica.com/topic/Paradesi-Synagogue",
      tier: "reference",
      accessed: "2026-08-23"
    }
  },

  /* ---------- SECTORS ---------- */
  sectors: [
    { id: "diplomacy",   label: "Diplomacy",   glyph: "DIP" },
    { id: "defence",     label: "Defence",     glyph: "DEF" },
    { id: "agriculture", label: "Agriculture", glyph: "AGR" },
    { id: "water",       label: "Water",       glyph: "WTR" },
    { id: "science",     label: "Science",     glyph: "SCI" },
    { id: "trade",       label: "Trade",       glyph: "TRD" },
    { id: "culture",     label: "Culture",     glyph: "CUL" },
    { id: "education",   label: "Education",   glyph: "EDU" },
    { id: "diaspora",    label: "Diaspora",    glyph: "DIA" },
    { id: "history",     label: "History",     glyph: "HIS" }
  ],

  /* ---------- TIMELINE ----------
     status: verified | community-claim | figures-differ
  ------------------------------------------------ */
  timeline: [
    {
      id: "bene-israel-tradition",
      era: "Before the state",
      year: null,
      dateLabel: "Community tradition",
      sortKey: -2500,
      title: "The Bene Israel arrival narrative",
      sector: "history",
      status: "community-claim",
      body: "Bene Israel tradition holds that the community's ancestors reached the Konkan coast of western India roughly 2,500 years ago after a shipwreck. This is a community account of origin. It is transmitted within the community rather than established by documentary evidence, and historians differ on dating.",
      sources: ["wjc-india"]
    },
    {
      id: "cochin-copper-plates",
      era: "Before the state",
      year: null,
      dateLabel: "Medieval period",
      sortKey: -1000,
      title: "Copper plate grants to the Jews of Kerala",
      sector: "history",
      status: "verified",
      body: "Rulers in the Malabar region issued copper plates to the Jewish community, recording the grant of privileges and standing. The plates are among the most cited pieces of material evidence for organised Jewish settlement in southern India.",
      sources: ["wjc-india"]
    },
    {
      id: "kodungallur-1524",
      era: "Before the state",
      year: 1524,
      dateLabel: "1524",
      sortKey: 1524,
      title: "Relocation from Kodungallur to Kochi",
      sector: "history",
      status: "verified",
      body: "The Jewish community relocated from Kodungallur, establishing the settlement in Kochi that came to be known as Jew Town.",
      sources: ["wjc-india"]
    },
    {
      id: "paradesi-1568",
      era: "Before the state",
      year: 1568,
      dateLabel: "1568",
      sortKey: 1568,
      title: "The Paradesi Synagogue is built in Kochi",
      sector: "history",
      status: "verified",
      body: "Built in Kochi, Kerala, by the city's Jewish trading community, including Sephardic families who had been exiled from Spain and Portugal. It is India's oldest synagogue, and in the early twenty-first century was the Cochin community's only active synagogue.",
      sources: ["britannica-paradesi"]
    },
    {
      id: "sassoon-1832",
      era: "Before the state",
      year: 1832,
      dateLabel: "1832",
      sortKey: 1832,
      title: "The Sassoon family arrives in Bombay",
      sector: "history",
      status: "verified",
      body: "The Sassoon family arrived in Bombay in 1832, part of the nineteenth century movement of Baghdadi Jews leaving Iraq and other lands. David Sassoon went on to build institutions in the city that still serve Indian society.",
      sources: ["wjc-india", "pib-jews"]
    },
    {
      id: "recognition-1950",
      era: "The states",
      year: 1950,
      dateLabel: "17 September 1950",
      sortKey: 1950,
      title: "India recognises the State of Israel",
      sector: "diplomacy",
      status: "verified",
      body: "India formally recognised Israel on 17 September 1950. Full diplomatic relations, however, would not follow for another forty-two years. The gap between these two dates is one of the central questions in the history of the relationship.",
      sources: ["mea-2026"],
      pivotal: true
    },
    {
      id: "dipl-1992",
      era: "The states",
      year: 1992,
      dateLabel: "1992",
      sortKey: 1992,
      title: "Full diplomatic relations established",
      sector: "diplomacy",
      status: "verified",
      body: "India and Israel established full diplomatic relations in 1992, opening embassies and beginning the modern phase of the relationship. Nearly every strand of cooperation that exists today, in agriculture, water, defence, science and trade, was built after this point.",
      sources: ["mea-2026"],
      pivotal: true
    },
    {
      id: "st-1993",
      era: "Building",
      year: 1993,
      dateLabel: "1993",
      sortKey: 1993.1,
      title: "Agreement on cooperation in science and technology",
      sector: "science",
      status: "verified",
      body: "One of the first framework agreements after 1992, establishing the basis for joint scientific work.",
      sources: ["mea-2026"]
    },
    {
      id: "agri-1993",
      era: "Building",
      year: 1993,
      dateLabel: "1993",
      sortKey: 1993.2,
      title: "Agreement on agricultural cooperation",
      sector: "agriculture",
      status: "verified",
      body: "The agricultural cooperation agreement signed in 1993 became the spine of what is now the most visible civilian strand of the relationship. It was renewed in April 2025.",
      sources: ["mea-2026"]
    },
    {
      id: "rnd-2005",
      era: "Building",
      year: 2005,
      dateLabel: "May 2005",
      sortKey: 2005,
      title: "Memorandum on the industrial research and development initiative",
      sector: "science",
      status: "verified",
      body: "Signed in May 2005, extending cooperation from academic science into industrial research and development.",
      sources: ["mea-2026"]
    },
    {
      id: "mukherjee-2015",
      era: "Building",
      year: 2015,
      dateLabel: "October 2015",
      sortKey: 2015,
      title: "President Pranab Mukherjee visits Israel",
      sector: "diplomacy",
      status: "verified",
      body: "A visit at the level of head of state, preceding the shift in tempo that followed in 2017 and 2018.",
      sources: ["mea-2026"]
    },
    {
      id: "rivlin-2016",
      era: "Building",
      year: 2016,
      dateLabel: "November 2016",
      sortKey: 2016.2,
      title: "President Reuven Rivlin visits India",
      sector: "diplomacy",
      status: "verified",
      body: "The return visit at head of state level. A memorandum on water resources management was signed in the same month.",
      sources: ["mea-2026"]
    },
    {
      id: "water-2016",
      era: "Building",
      year: 2016,
      dateLabel: "November 2016",
      sortKey: 2016.3,
      title: "Memorandum on water resources management",
      sector: "water",
      status: "verified",
      body: "Water is the strand where the two countries' problems most closely resemble each other: scarcity, salinity, and the need to grow more with less.",
      sources: ["mea-2026"]
    },
    {
      id: "modi-2017",
      era: "The turn",
      year: 2017,
      dateLabel: "4 to 6 July 2017",
      sortKey: 2017.1,
      title: "Prime Minister Modi visits Israel",
      sector: "diplomacy",
      status: "verified",
      body: "A visit from 4 to 6 July 2017. In Tel Aviv the Prime Minister addressed a gathering of approximately 8,000 people of Indian origin and Indian nationals. A set of memoranda was signed during the visit.",
      sources: ["mea-2026", "eoi-telaviv"],
      pivotal: true
    },
    {
      id: "i4f-2017",
      era: "The turn",
      year: 2017,
      dateLabel: "2017",
      sortKey: 2017.2,
      title: "India-Israel Industrial Research and Development and Technological Innovation Fund",
      sector: "science",
      status: "verified",
      body: "Known as I4F. Established in 2017 and renewed for the period 2023 to 2027.",
      sources: ["mea-2026"]
    },
    {
      id: "netanyahu-2018",
      era: "The turn",
      year: 2018,
      dateLabel: "14 to 19 January 2018",
      sortKey: 2018.1,
      title: "Prime Minister Netanyahu visits India",
      sector: "diplomacy",
      status: "verified",
      body: "A six day visit to India from 14 to 19 January 2018, the reciprocal leg of the exchange begun the previous July.",
      sources: ["mea-2026"],
      pivotal: true
    },
    {
      id: "tarangini-2018",
      era: "The turn",
      year: 2018,
      dateLabel: "September 2018",
      sortKey: 2018.2,
      title: "INS Tarangini port call in Israel",
      sector: "defence",
      status: "verified",
      body: "A naval port call by the Indian sail training ship, following earlier Indian naval port calls in May 2017.",
      sources: ["mea-2026"]
    },
    {
      id: "health-2020",
      era: "Consolidation",
      year: 2020,
      dateLabel: "21 December 2020",
      sortKey: 2020,
      title: "Agreement on cooperation in the field of health",
      sector: "science",
      status: "verified",
      body: "Signed on 21 December 2020.",
      sources: ["mea-2026"]
    },
    {
      id: "isa-2021",
      era: "Consolidation",
      year: 2021,
      dateLabel: "October 2021",
      sortKey: 2021.1,
      title: "Israel ratifies the International Solar Alliance framework",
      sector: "science",
      status: "verified",
      body: "Israel's ratification brought it into the India-initiated International Solar Alliance.",
      sources: ["mea-2026"]
    },
    {
      id: "blueflag-2021",
      era: "Consolidation",
      year: 2021,
      dateLabel: "October 2021",
      sortKey: 2021.2,
      title: "Indian Air Force participates in Exercise Blue Flag",
      sector: "defence",
      status: "verified",
      body: "Indian Air Force participation in the multinational exercise hosted by Israel.",
      sources: ["mea-2026"]
    },
    {
      id: "jaishankar-2021",
      era: "Consolidation",
      year: 2021,
      dateLabel: "17 to 21 October 2021",
      sortKey: 2021.3,
      title: "External Affairs Minister Jaishankar visits Israel",
      sector: "diplomacy",
      status: "verified",
      body: "A visit from 17 to 21 October 2021.",
      sources: ["mea-2026"]
    },
    {
      id: "haifa-2022",
      era: "Consolidation",
      year: 2022,
      dateLabel: "2022",
      sortKey: 2022,
      title: "Adani-led consortium acquires Haifa Port",
      sector: "trade",
      status: "verified",
      body: "The acquisition, valued at USD 1.18 billion, is the single largest Indian commercial commitment in Israel to date and connects the relationship to the wider question of Indian Ocean to Mediterranean logistics.",
      sources: ["mea-2026"],
      pivotal: true
    },
    {
      id: "defmin-2023",
      era: "Consolidation",
      year: 2023,
      dateLabel: "3 March 2023",
      sortKey: 2023.1,
      title: "First talks at Defence Minister level",
      sector: "defence",
      status: "verified",
      body: "The first engagement at the level of Defence Minister, on 3 March 2023.",
      sources: ["mea-2026"]
    },
    {
      id: "agri-innov-2023",
      era: "Consolidation",
      year: 2023,
      dateLabel: "May 2023",
      sortKey: 2023.2,
      title: "India-Israel Innovation Centre for Agriculture declared",
      sector: "agriculture",
      status: "verified",
      body: "Declared in May 2023, alongside a letter of intent on water technology centres of excellence.",
      sources: ["mea-2026"]
    },
    {
      id: "ajay-2023",
      era: "Consolidation",
      year: 2023,
      dateLabel: "12 to 22 October 2023",
      sortKey: 2023.3,
      title: "Operation Ajay",
      sector: "diaspora",
      status: "verified",
      body: "Between 12 and 22 October 2023, over 1,300 people were evacuated from Israel under Operation Ajay.",
      sources: ["mea-2026"]
    },
    {
      id: "cop28-2023",
      era: "Consolidation",
      year: 2023,
      dateLabel: "1 December 2023",
      sortKey: 2023.4,
      title: "Prime Minister Modi meets President Herzog at COP 28",
      sector: "diplomacy",
      status: "verified",
      body: "A meeting on the margins of COP 28 on 1 December 2023.",
      sources: ["mea-2026"]
    },
    {
      id: "doval-2024",
      era: "Present",
      year: 2024,
      dateLabel: "11 to 12 March 2024",
      sortKey: 2024.1,
      title: "National Security Adviser Ajit Doval visits Israel",
      sector: "defence",
      status: "verified",
      body: "A visit on 11 and 12 March 2024.",
      sources: ["mea-2026"]
    },
    {
      id: "agri-renew-2025",
      era: "Present",
      year: 2025,
      dateLabel: "April 2025",
      sortKey: 2025.1,
      title: "Agricultural cooperation agreement renewed",
      sector: "agriculture",
      status: "verified",
      body: "The 1993 agreement was renewed in April 2025, extending the framework under which the centres of excellence operate.",
      sources: ["mea-2026"]
    },
    {
      id: "stamp-2025",
      era: "Present",
      year: 2025,
      dateLabel: "11 to 13 February 2025",
      sortKey: 2025.2,
      title: "Joint postage stamp on Holi and Purim",
      sector: "culture",
      status: "verified",
      body: "A joint stamp issue pairing Holi and Purim, released during the visit of the Israeli Economy Minister from 11 to 13 February 2025. Two festivals of colour, noise and reversal, issued on one sheet.",
      sources: ["mea-2026"]
    },
    {
      id: "cyber-2025",
      era: "Present",
      year: 2025,
      dateLabel: "27 March 2025",
      sortKey: 2025.3,
      title: "Cyber Policy Dialogue",
      sector: "science",
      status: "verified",
      body: "Held on 27 March 2025.",
      sources: ["mea-2026"]
    },
    {
      id: "sindhu-2025",
      era: "Present",
      year: 2025,
      dateLabel: "22 to 25 June 2025",
      sortKey: 2025.4,
      title: "Operation Sindhu",
      sector: "diaspora",
      status: "verified",
      body: "Around 818 people were evacuated between 22 and 25 June 2025 under Operation Sindhu.",
      sources: ["mea-2026"]
    },
    {
      id: "bia-2025",
      era: "Present",
      year: 2025,
      dateLabel: "8 to 10 September 2025",
      sortKey: 2025.5,
      title: "Bilateral Investment Agreement signed",
      sector: "trade",
      status: "verified",
      body: "Signed during the visit of the Israeli Finance Minister from 8 to 10 September 2025. Investment protection is the legal groundwork that has to exist before capital moves at scale.",
      sources: ["mea-2026"],
      pivotal: true
    },
    {
      id: "export-control-2025",
      era: "Present",
      year: 2025,
      dateLabel: "27 to 28 October 2025",
      sortKey: 2025.6,
      title: "Export Control Dialogue",
      sector: "trade",
      status: "verified",
      body: "Held on 27 and 28 October 2025.",
      sources: ["mea-2026"]
    },
    {
      id: "defence-mou-2025",
      era: "Present",
      year: 2025,
      dateLabel: "4 November 2025",
      sortKey: 2025.7,
      title: "Memorandum of understanding on defence cooperation",
      sector: "defence",
      status: "verified",
      body: "Signed on 4 November 2025, alongside the seventeenth meeting of the Joint Working Group on defence.",
      sources: ["mea-2026"]
    },
    {
      id: "fta-tor-2025",
      era: "Present",
      year: 2025,
      dateLabel: "20 to 22 November 2025",
      sortKey: 2025.8,
      title: "Terms of reference agreed for a free trade agreement",
      sector: "trade",
      status: "verified",
      body: "Agreed during the visit of the Indian Commerce and Industry Minister from 20 to 22 November 2025. Terms of reference are the starting gun for negotiation, not the agreement itself.",
      sources: ["mea-2026"],
      pivotal: true
    },
    {
      id: "swaraj-mou-2025",
      era: "Present",
      year: 2025,
      dateLabel: "November 2025",
      sortKey: 2025.9,
      title: "Sushma Swaraj Institute and Israeli Foreign Ministry memorandum",
      sector: "education",
      status: "verified",
      body: "A memorandum between India's diplomatic training institute and the Israeli Ministry of Foreign Affairs, signed in November 2025.",
      sources: ["mea-2026"]
    },
    {
      id: "workplan-2025",
      era: "Present",
      year: 2025,
      dateLabel: "16 to 17 December 2025",
      sortKey: 2025.95,
      title: "Joint Work Plan 2026 agreed",
      sector: "diplomacy",
      status: "verified",
      body: "Agreed during the External Affairs Minister's visit to Israel on 16 and 17 December 2025.",
      sources: ["mea-2026"]
    },
    {
      id: "iccr-tau-2025",
      era: "Present",
      year: 2025,
      dateLabel: "December 2025",
      sortKey: 2025.96,
      title: "India Chair established at Tel Aviv University",
      sector: "education",
      status: "verified",
      body: "An agreement between the Indian Council for Cultural Relations and Tel Aviv University for an India Chair, in December 2025.",
      sources: ["mea-2026"]
    },
    {
      id: "fisheries-2026",
      era: "Present",
      year: 2026,
      dateLabel: "13 to 15 January 2026",
      sortKey: 2026.1,
      title: "Joint declaration on fisheries and aquaculture",
      sector: "agriculture",
      status: "verified",
      body: "Signed during the visit of India's Minister of Fisheries from 13 to 15 January 2026.",
      sources: ["mea-2026"]
    }
  ],

  /* ---------- COMMUNITIES ---------- */
  communities: [
    {
      id: "bene-israel",
      name: "Bene Israel",
      meaning: "Sons of Israel",
      region: "Maharashtra and Gujarat",
      language: "Marathi",
      colour: "#e6b33e",
      summary: "The largest of India's historic Jewish communities, concentrated in what is now Maharashtra, with a presence in Ahmedabad and, before partition, in Karachi.",
      detail: [
        "The Bene Israel settled mainly in the region of modern Mumbai, Ahmedabad, and Karachi, which is now in Pakistan. Over the centuries the community held to Jewish practice while taking on the Marathi language and local custom, which is why Bene Israel liturgy, food and family structure look Maharashtrian from the outside and Jewish from the inside.",
        "Community tradition places the arrival of its ancestors on the Konkan coast around 2,500 years ago, following a shipwreck. This account is transmitted within the community. It is not the same category of claim as a dated document, and this site marks it accordingly.",
        "The Bene Israel formed the largest single component of Jewish migration from India to Israel, with the primary waves in the 1950s and 1960s."
      ],
      claims: [
        { text: "Settled mainly around modern Mumbai, Ahmedabad and Karachi", status: "verified", sources: ["wjc-india"] },
        { text: "Adopted Marathi language and local custom while maintaining Jewish practice", status: "verified", sources: ["wjc-india"] },
        { text: "Ancestors arrived roughly 2,500 years ago", status: "community-claim", sources: ["wjc-india"] },
        { text: "Principal migration to Israel in the 1950s and 1960s", status: "verified", sources: ["eoi-telaviv"] }
      ],
      places: ["mumbai", "thane", "alibag", "pune", "ahmedabad"]
    },
    {
      id: "cochin-jews",
      name: "Cochin Jews",
      meaning: "Also called Cochini or Malabar Jews",
      region: "Kerala",
      language: "Malayalam",
      colour: "#5cc4b0",
      summary: "A Kerala community whose standing was recorded on copper plates by regional rulers, and whose synagogue in Kochi is the oldest in India.",
      detail: [
        "Regional rulers granted the community copper plates recording the assumption of important positions. The plates matter because they are material evidence rather than recollection: they can be dated, read and disputed on their own terms.",
        "After a relocation from Kodungallur in 1524, the community established the Kochi settlement known as Jew Town.",
        "The Paradesi Synagogue was built in Kochi in 1568 by the city's Jewish trading community, including Sephardic families exiled from Spain and Portugal. It is India's oldest synagogue, and in the early twenty-first century it was the community's only active synagogue."
      ],
      claims: [
        { text: "Granted copper plates by regional rulers recording important positions", status: "verified", sources: ["wjc-india"] },
        { text: "Relocated from Kodungallur in 1524, founding Jew Town in Kochi", status: "verified", sources: ["wjc-india"] },
        { text: "Paradesi Synagogue built in 1568", status: "verified", sources: ["britannica-paradesi"] },
        { text: "Built by Jewish traders including Sephardim exiled from Spain and Portugal", status: "verified", sources: ["britannica-paradesi"] }
      ],
      places: ["kochi"]
    },
    {
      id: "baghdadi-jews",
      name: "Baghdadi Jews",
      meaning: "Named for origin, not for a single city",
      region: "Kolkata, Mumbai, Pune",
      language: "Judeo-Arabic, later English",
      colour: "#c98ae0",
      summary: "A nineteenth century arrival from Iraq and neighbouring lands, closely tied to the commercial life of British India.",
      detail: [
        "Baghdadi Jews arrived in the nineteenth century, leaving religious persecution in Iraq and other Muslim lands. The name describes an origin region rather than a single city.",
        "The Sassoon family arrived in Bombay in 1832 and became the community's most visible presence. David Sassoon built institutions in the city that still serve Indian society today.",
        "The community's centres were Kolkata, Mumbai and Pune, where the Ohel David synagogue stands."
      ],
      claims: [
        { text: "Arrived in the nineteenth century from Iraq and other lands", status: "verified", sources: ["wjc-india"] },
        { text: "The Sassoon family arrived in Bombay in 1832", status: "verified", sources: ["wjc-india"] },
        { text: "David Sassoon built institutions still serving Indian society", status: "verified", sources: ["pib-jews"] }
      ],
      places: ["kolkata", "mumbai", "pune"]
    },
    {
      id: "bnei-menashe",
      name: "Bnei Menashe",
      meaning: "Children of Menasseh",
      region: "Mizoram and Manipur",
      language: "Mizo, Kuki languages",
      colour: "#7fb2d4",
      summary: "Communities in India's north east who returned to Jewish practice in the twentieth century, and whose migration to Israel is the most recent of the four.",
      detail: [
        "Small groups in the north east were required to convert to Christianity by Christian missionaries in the nineteenth century.",
        "From the 1970s, members of these groups restarted the practice of traditional Jewish rites.",
        "Migration to Israel from Mizoram and Manipur is the most recent of the four community movements, and the status of the community has been the subject of ongoing discussion within Israel."
      ],
      claims: [
        { text: "Converted to Christianity under missionary pressure in the nineteenth century", status: "verified", sources: ["wjc-india"] },
        { text: "Restarted traditional Jewish rites from the 1970s", status: "verified", sources: ["wjc-india"] },
        { text: "Migration to Israel from Mizoram and Manipur", status: "verified", sources: ["eoi-telaviv"] }
      ],
      places: ["aizawl", "imphal"]
    }
  ],

  /* ---------- PLACES (schematic chart coordinates) ---------- */
  places: {
    mumbai:    { name: "Mumbai",      country: "IN", lat: 19.08, lon: 72.88, note: "Principal Bene Israel and Baghdadi centre" },
    thane:     { name: "Thane",       country: "IN", lat: 19.22, lon: 72.98, note: "Shaar Hashamaim synagogue" },
    alibag:    { name: "Alibag",      country: "IN", lat: 18.64, lon: 72.87, note: "Konkan coast, Bene Israel heartland" },
    pune:      { name: "Pune",        country: "IN", lat: 18.52, lon: 73.86, note: "Ohel David synagogue" },
    ahmedabad: { name: "Ahmedabad",   country: "IN", lat: 23.02, lon: 72.57, note: "Bene Israel presence; Kankaria Zoo founded by Reuben David" },
    kochi:     { name: "Kochi",       country: "IN", lat:  9.93, lon: 76.27, note: "Paradesi Synagogue, 1568; Jew Town" },
    kolkata:   { name: "Kolkata",     country: "IN", lat: 22.57, lon: 88.36, note: "Baghdadi Jewish centre" },
    delhi:     { name: "New Delhi",   country: "IN", lat: 28.61, lon: 77.21, note: "Israeli embassy in India" },
    bengaluru: { name: "Bengaluru",   country: "IN", lat: 12.97, lon: 77.59, note: "Small present-day community" },
    aizawl:    { name: "Aizawl",      country: "IN", lat: 23.73, lon: 92.72, note: "Bnei Menashe, Mizoram" },
    imphal:    { name: "Imphal",      country: "IN", lat: 24.82, lon: 93.94, note: "Bnei Menashe, Manipur" },

    telaviv:   { name: "Tel Aviv",    country: "IL", lat: 32.08, lon: 34.78, note: "Embassy of India; Modi addressed about 8,000 people here in July 2017" },
    jerusalem: { name: "Jerusalem",   country: "IL", lat: 31.78, lon: 35.22, note: "" },
    haifa:     { name: "Haifa",       country: "IL", lat: 32.79, lon: 34.99, note: "Port acquired by an Adani-led consortium in 2022" },
    ramla:     { name: "Ramla",       country: "IL", lat: 31.93, lon: 34.87, note: "National Convention of Indian Jews, 2013 and 2015" },
    yeruham:   { name: "Yeruham",     country: "IL", lat: 30.99, lon: 34.93, note: "National Convention of Indian Jews, 2014" },
    kiryatgat: { name: "Kiryat Gat",  country: "IL", lat: 31.61, lon: 34.76, note: "National Convention of Indian Jews, 2016" },
    ashkelon:  { name: "Ashkelon",    country: "IL", lat: 31.67, lon: 34.57, note: "National Convention of Indian Jews, 2017" },
    petahtikva:{ name: "Petah Tikva", country: "IL", lat: 32.09, lon: 34.89, note: "National Convention of Indian Jews, 2022" },
    beersheba: { name: "Beersheba",   country: "IL", lat: 31.25, lon: 34.79, note: "" }
  },

  /* ---------- MIGRATION ROUTES (for the chart) ---------- */
  routes: [
    { from: "mumbai",  to: "ramla",      community: "bene-israel"   },
    { from: "alibag",  to: "beersheba",  community: "bene-israel"   },
    { from: "pune",    to: "petahtikva", community: "baghdadi-jews" },
    { from: "kochi",   to: "yeruham",    community: "cochin-jews"   },
    { from: "kolkata", to: "telaviv",    community: "baghdadi-jews" },
    { from: "aizawl",  to: "kiryatgat",  community: "bnei-menashe"  },
    { from: "imphal",  to: "ashkelon",   community: "bnei-menashe"  }
  ],

  /* ---------- FIGURES ---------- */
  figures: [
    {
      id: "trade-2425",
      label: "Bilateral trade, FY 2024-25",
      value: "USD 3.75 bn",
      note: "India's exports USD 2.1 billion, imports USD 1.6 billion. The brief records that trade fell in this year.",
      sector: "trade",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "coe",
      label: "Agricultural Centres of Excellence",
      value: "43 approved, 35 operational",
      note: "Operating under the sixth work plan, covering 2024 to 2026.",
      sector: "agriculture",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "haifa",
      label: "Haifa Port acquisition, 2022",
      value: "USD 1.18 bn",
      note: "By an Adani-led consortium.",
      sector: "trade",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "odi",
      label: "Indian outward direct investment",
      value: "About USD 443 mn",
      note: "Cumulative, April 2000 to April 2025.",
      sector: "trade",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "fdi",
      label: "Israeli foreign direct investment into India",
      value: "USD 334.26 mn",
      note: "Cumulative, April 2000 to March 2025.",
      sector: "trade",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "indian-origin-jews",
      label: "Jews of Indian origin in Israel",
      value: "Sources differ",
      note: "The Ministry of External Affairs brief of February 2026 records over 100,000. The Embassy of India in Tel Aviv records approximately 85,000. This site shows both rather than picking one.",
      sector: "diaspora",
      status: "figures-differ",
      sources: ["mea-2026", "eoi-telaviv"]
    },
    {
      id: "indian-citizens",
      label: "Indian citizens in Israel",
      value: "Sources differ",
      note: "The Ministry of External Affairs brief records over 42,000. The Embassy page records about 18,000, described as mainly caregivers, diamond traders, information technology professionals and students. The two figures may be counting different populations or different periods.",
      sector: "diaspora",
      status: "figures-differ",
      sources: ["mea-2026", "eoi-telaviv"]
    },
    {
      id: "students",
      label: "Indian students in Israel",
      value: "About 1,000",
      note: "",
      sector: "education",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "jews-in-india",
      label: "Jews living in India",
      value: "About 4,800",
      note: "Figure for 2020. Earlier estimates recorded between 4,900 and 7,000 as of 1996.",
      sector: "diaspora",
      status: "verified",
      sources: ["wjc-india"]
    },
    {
      id: "ajay",
      label: "Evacuated under Operation Ajay",
      value: "Over 1,300",
      note: "Between 12 and 22 October 2023.",
      sector: "diaspora",
      status: "verified",
      sources: ["mea-2026"]
    },
    {
      id: "sindhu",
      label: "Evacuated under Operation Sindhu",
      value: "About 818",
      note: "Between 22 and 25 June 2025.",
      sector: "diaspora",
      status: "verified",
      sources: ["mea-2026"]
    }
  ],

  /* ---------- PEOPLE ---------- */
  people: [
    {
      id: "david-sassoon",
      name: "David Sassoon",
      community: "baghdadi-jews",
      field: "Business and philanthropy",
      note: "Of the family that arrived in Bombay in 1832. Built institutions in the city that still serve Indian society.",
      sources: ["pib-jews", "wjc-india"]
    },
    {
      id: "jfr-jacob",
      name: "Lieutenant General J. F. R. Jacob",
      community: "baghdadi-jews",
      field: "Armed forces",
      note: "Recognised for his contribution during the 1971 war with Pakistan.",
      sources: ["pib-jews"]
    },
    {
      id: "walter-kaufmann",
      name: "Walter Kaufmann",
      community: null,
      field: "Music",
      note: "Composed the signature tune for All India Radio.",
      sources: ["pib-jews"]
    },
    {
      id: "reuben-david",
      name: "Doctor Reuben David",
      community: null,
      field: "Natural history",
      note: "Founder of the Kankaria Zoo in Ahmedabad.",
      sources: ["pib-jews"]
    },
    {
      id: "david-abraham",
      name: "David Abraham Cheulkar",
      community: "bene-israel",
      field: "Cinema",
      note: "An actor who became a household name across the country.",
      sources: ["pib-jews"]
    },
    {
      id: "edwyn-myers",
      name: "Edwyn Myers",
      community: null,
      field: "Cinema",
      note: "Gave shape to the Films Division of India.",
      sources: ["pib-jews"]
    },
    {
      id: "jam-saheb",
      name: "The Jam Saheb of Nawanagar",
      community: null,
      field: "Refuge during the Second World War",
      note: "Offered refuge to Polish children, including Jewish children, during the Holocaust.",
      sources: ["pib-jews"]
    },
    {
      id: "eliyau-bezalel",
      name: "Eliyau Bezalel",
      community: null,
      field: "Pravasi Bharatiya Samman, 2005",
      note: "Recipient of the Pravasi Bharatiya Samman in 2005.",
      sources: ["eoi-telaviv"]
    },
    {
      id: "munir-ansari",
      name: "Sheikh Munir Ansari",
      community: null,
      field: "Pravasi Bharatiya Samman, 2011",
      note: "Recipient of the Pravasi Bharatiya Samman in 2011.",
      sources: ["eoi-telaviv"]
    },
    {
      id: "lael-best",
      name: "Doctor Lael A. Best",
      community: null,
      field: "Pravasi Bharatiya Samman, 2017",
      note: "Recipient of the Pravasi Bharatiya Samman in 2017.",
      sources: ["eoi-telaviv"]
    },
    {
      id: "reena-pushkarna",
      name: "Reena Vinod Pushkarna",
      community: null,
      field: "Pravasi Bharatiya Samman, 2023",
      note: "Recipient of the Pravasi Bharatiya Samman in 2023.",
      sources: ["eoi-telaviv"]
    }
  ],

  /* ---------- OPEN QUESTIONS ---------- */
  questions: [
    { q: "Why did India recognise Israel in 1950 but wait until 1992 for full diplomatic relations?", note: "Forty-two years is the longest unexplained interval in the relationship. Any account of India and Israel that skips it is not an account." },
    { q: "What did the copper plates of Kerala actually grant, and to whom?", note: "The plates are the closest thing to a dated primary document in the early history of Jews in India." },
    { q: "Are Bene Israel origin traditions historically testable at all?", note: "Community memory and documentary history are different kinds of evidence. The interesting question is what happens where they meet." },
    { q: "Is the relationship becoming more technological than military?", note: "Agriculture, water and innovation funding have grown alongside defence. Which one defines the next decade is genuinely open." },
    { q: "Why did bilateral trade fall in FY 2024-25?", note: "The Ministry of External Affairs brief records the fall. The reasons are worth documenting rather than assuming." },
    { q: "Why do official Indian sources give different diaspora figures?", note: "Over 100,000 and approximately 85,000 appear in two Indian government sources. The gap itself is a research question." },
    { q: "What did migration to Israel change for the communities that left?", note: "Four communities, four different trajectories, one destination." },
    { q: "How has India imagined Israel, and how has Israel imagined India?", note: "Both countries carry an image of the other that predates any embassy." }
  ],

  /* ---------- FUTURE SCENARIOS ---------- */
  scenarios: [
    { id: "trade",     title: "The trade turn",        body: "The free trade agreement, whose terms of reference were agreed in November 2025, becomes the organising fact of the relationship, and commerce outgrows defence." },
    { id: "water",     title: "Water and climate",     body: "Scarcity does what diplomacy could not. Desalination, reuse and desert agriculture become the shared frontier as both countries face harder water years." },
    { id: "corridor",  title: "The corridor",          body: "Haifa, the Arabian Sea and the Mediterranean are stitched into one logistics chain, and the relationship becomes a question of infrastructure." },
    { id: "tech",      title: "Deep technology",       body: "Innovation funding, joint research and startup capital carry the relationship, and the centre of gravity moves from governments to firms and laboratories." },
    { id: "civil",     title: "Civilisational exchange", body: "Chairs, archives, translation and scholarship build a durable intellectual link that survives changes of government on both sides." },
    { id: "plateau",   title: "The plateau",           body: "The relationship consolidates at its present level. Agreements are renewed, dialogues continue, and nothing fundamental changes." }
  ]
};
