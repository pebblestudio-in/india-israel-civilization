# The India-Israel Civilisations Project

An independent research and public knowledge project documenting the historical, social,
cultural, economic and strategic connections between India and Israel.

Not a government website. Not an embassy. Not a registered organisation.

## The rule this site is built on

Every factual record carries at least one source. `scripts/verify-sources.mjs` runs on
every push and **refuses to publish the site** if any record is missing one, or points at
a source that is not in the register. Claims are labelled by the kind of evidence behind
them: primary, reference, press, or community tradition. Where two credible sources
disagree, both are shown.

## What is here

| Section | What it holds |
|---|---|
| Timeline | 66 dated entries, from community tradition to 2026 |
| Map | India point of view geometry, community centres, migration routes, Israel by district |
| Built Heritage Survey | 13 Jewish sites in India, with dates, condition and sources |
| Communities | Bene Israel, Cochin, Baghdadi, Bnei Menashe, with claim registers |
| Side by Side | Structural comparison of the two states, and city pairs |
| Hebrew and Hindi | Both alphabets in full, compared, plus an interactive letter trainer |
| Statements Wall | Every logged government interaction, from primary sources |
| Writing | 36 pieces, about 21,700 words, typed by kind |
| Culture | 23 writers, painters, actors and musicians, with a reading guide |
| The Reading Room | 122 books on 11 shelves, 9 of them free to read in full |
| The Watch Room | 23 films and lectures, every one checked against YouTube's own record |
| Register of People | 34 people with a documented role in the relationship |
| Open Dataset | Everything, as CSV and JSON, free to reuse |

About 50,000 words of sourced content across the content files and the interface.

## Running it

It is a static site. No build step, no framework, no dependencies at runtime.

```
python3 -m http.server 8899
```

Then open `http://localhost:8899`. Opening `index.html` straight off disk will not work,
because browsers block local file reads.

## Editing it

Use the manager at `/admin/`. It edits every content file through forms and saves
straight to GitHub. No server, no third party service, no monthly cost. It refuses to
save a record with no source, for the same reason the build does.

## Deploying it

See `DEPLOY.md`. Every step is clicking and pasting.

## Scripts

| Script | What it does |
|---|---|
| `scripts/verify-sources.mjs` | The source gate. Fails the build on any unsourced record. |
| `scripts/fetch-news.mjs` | Gathers headlines. Stores links only, never article text. |
| `scripts/make-geo.mjs` | Rebuilds map geometry from the amCharts India point of view geodata. |
| `scripts/build-preview.mjs` | Bundles everything into one shareable HTML file. |

## Maps

The maps use the **India point of view** geodata published by amCharts. India is drawn as
the Government of India depicts it, including Jammu and Kashmir, Ladakh and Aksai Chin,
with the 2023 state and union territory boundaries.

This matters practically. The most widely used free world datasets, including Natural
Earth's default set, draw India stopping at roughly 35.5 N because they assign Aksai Chin
to China and Gilgit-Baltistan to Pakistan. A site about India, published from India,
using one of those would be showing its readers a map their own government does not
recognise.

**Do not remove the credit line under the maps, and do not delete `licences/amcharts-LICENSE`.**
The amCharts geodata is free to bundle inside an application on condition that
attribution stays visible and the licence file travels with it. Both are handled by
`scripts/make-geo.mjs`, which copies the licence in every time it runs.

If you ever want a source with no conditions at all, Natural Earth publishes
`ne_10m_admin_0_countries_ind`, which is the same India point of view and is public
domain. Point `scripts/make-geo.mjs` at its GeoJSON and rerun it.

## Sources and licence

Content: the sources are named on every page and linked. The data is open. Take it,
check it, and if it is wrong, say so.
