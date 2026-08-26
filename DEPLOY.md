# Getting the site live

No coding. Every step below is clicking and pasting. Read it once through before starting.

Total time: about 30 minutes the first time.

---

## Step 1. Put the files on GitHub

1. Go to **github.com** and sign in.
2. Top right, press **+**, then **New repository**.
3. Name it `india-israel-civilisations-project`.
4. Set it to **Public**. This matters: GitHub Pages hosting is free for public repositories.
5. Do **not** tick "Add a README file".
6. Press **Create repository**.
7. On the next screen, find the link that says **uploading an existing file**.
8. Drag the whole project folder in. Wait for every file to finish uploading.
9. At the bottom, press **Commit changes**.

If the drag and drop misses the hidden folders (anything starting with a dot, such as `.github`), upload those separately using the **Add file**, then **Upload files** button. The `.github` folder is what makes the news gathering and the source gate run, so the site works without it but stops updating itself.

---

## Step 2. Turn on the website

1. In your repository, press **Settings** (top row).
2. In the left sidebar, press **Pages**.
3. Under **Source**, choose **GitHub Actions**.
4. That is all. Nothing to save.

Within two or three minutes your site is live at:

```
https://YOUR-USERNAME.github.io/india-israel-civilisations-project/
```

To watch it build, press the **Actions** tab. A green tick means live. A red cross means the source gate stopped it, which is explained in Step 5.

---

## Step 3. Tell the site who it belongs to

1. In your repository, open the file **`site.config.js`**.
2. Press the pencil icon to edit.
3. Fill in the three lines:

```js
window.SITE_CONFIG = {
  githubRepo: "YOUR-USERNAME/india-israel-civilisations-project",
  communityInvite: "",
  supportLink: ""
};
```

- **defaultAuthor** — the name that appears on writing that does not carry its own byline.
- **contactEmail** — general enquiries, events, contributing, and forum introductions.
- **submissionsEmail** — for Write for Us. Leave blank and it falls back to the contact address.
- **correctionsEmail** — for error reports. Leave blank and it falls back to the contact address.
- **communityInvite** — the invite link to your community space. Leave empty until you have made one.
- **supportLink** — your Ko-fi or Buy Me a Coffee link. Leave empty until you have made one.

4. Scroll down, press **Commit changes**.

You can also edit all of these in the manager, under **Settings**, once you have set it up in the next step. After that you never need to open this file again.

**Why email and not forms.** Every route into this project, submissions, corrections, events, joining the forum, goes to an email address. A static site has no server, so a form would either go nowhere or go through a third party that reads the messages. Email goes to a person, leaves the sender a copy of what they sent, and requires nobody to trust anything in the middle. It also filters: a correction that costs two minutes to write is usually a correction worth reading.

---

## Step 4. Set up the manager, so you never edit code again

The manager lets you add and edit every piece of content on the site through forms.

**Make an access key:**

1. On GitHub, press your profile picture, top right, then **Settings**.
2. Left sidebar, all the way down: **Developer settings**.
3. **Personal access tokens**, then **Fine-grained tokens**.
4. Press **Generate new token**.
5. Name it `site manager`.
6. Expiration: choose 90 days or a year. You will need to make a new one when it expires.
7. **Repository access**: choose **Only select repositories**, and pick your project.
8. **Permissions**: open **Repository permissions**, find **Contents**, set it to **Read and write**. Change nothing else.
9. Press **Generate token**.
10. Copy the token. It is shown once. Paste it somewhere safe for now.

**Sign in to the manager:**

1. Go to `https://YOUR-USERNAME.github.io/india-israel-civilisations-project/admin/`
2. Paste your repository name and your token.
3. Press **Sign in**.

You can now edit every piece of content on the site through forms: writing, the timeline, built heritage, communities, people, figures, statements, social posts, tracked accounts, agricultural centres, water projects, centre counts, country comparisons, city pairs, phrases, script points, open questions, scenarios, corrections, standing caveats, the source register, and the settings above. Every save publishes a new version of the site within a minute or two.

Two things the manager enforces, on purpose. It refuses to save a factual record with no source, for exactly the same reason the build refuses to publish one. And the source register is the only place a source can be added, so a citation can never point at something that does not exist.

**About that token:** it is stored only in your own browser, and it is sent only to github.com. This site has no server, so there is nowhere else for it to go. Do not paste it into a message, a screenshot, or a public file. If it ever leaks, go back to the token page and press **Revoke**, then make a new one.

---

## Step 5. If the site refuses to publish

That is the source gate doing its job.

Every factual record must carry at least one source. If one does not, the check in `scripts/verify-sources.mjs` fails and the site does not go live. This is deliberate: it means the promise on the About page, that nothing here is unsourced, is enforced by the machine rather than by memory.

To see what went wrong: **Actions** tab, click the failed run, click **Check that every claim has a source**. It names the exact entry and the exact problem.

Fix it in the manager by ticking a source on that entry, and the site publishes again.

The gate also rejects em dash characters anywhere in the content, because this project does not use them.

Note that the site no longer prints an evidence label beside every claim. The grading still exists in the data and the gate still enforces it, but a page covered in chips reading VERIFIED reads as anxious rather than as careful. Where sources genuinely disagree, the page now says so in a sentence, which is both clearer and harder to skim past.

---

## Step 5b. The map credit

Under every map there is a line reading **Map data: amCharts, India point of view**.

Leave it there. The map data is free to use on condition that the credit stays visible
and the file `licences/amcharts-LICENSE` stays in the repository. Removing either breaks
the licence.

That credit is also why India appears correctly on this site, with Jammu and Kashmir,
Ladakh and Aksai Chin included. Most free map datasets cut India off below Aksai Chin,
and a site published from India should not be using one of those.

---

## Step 6. Headlines

The file `.github/workflows/news.yml` runs every six hours, reads the news feeds listed in `scripts/fetch-news.mjs`, keeps only headlines that mention both India and Israel, and writes them into `assets/js/news.js`.

**Run it once by hand to see which feeds actually work:** **Actions** tab, **Gather headlines**, **Run workflow**.

Then open the run and read the log. Every feed is reported as `OK` or `FAIL`. Feeds do change and die, and the newsroom page shows how many responded, so a dead feed is visible rather than silent. Remove dead ones from `scripts/fetch-news.mjs` and add better ones.

Only headlines, links, dates and source names are stored. Never article text. Reproducing an article is someone else's copyright.

**One thing to know:** GitHub switches off scheduled jobs on a repository with no activity for 60 days. If you have not touched the site in two months, the news stops updating. Any commit turns it back on.

---

## Step 7. The community space

Pick one and make it, then paste the invite link into `site.config.js`.

Whatever you pick, do these four things before inviting anyone:

1. Post the house rules from the Forum page as the first thing people see.
2. Turn on the strongest automatic filtering the platform offers.
3. Require a verified email or phone before people can post. This stops most drive-by abuse.
4. Get one other person to moderate with you. Never moderate a space about this subject alone.

---

## Step 8. Donations

Ko-fi takes nothing from one-off tips. Buy Me a Coffee takes a percentage. For rupee donations from within India, a UPI QR code costs nothing at all.

**Before you accept money from outside India, speak to a chartered accountant.** Foreign contributions have tax and regulatory consequences in India, and the rules are different again if the project ever becomes a registered organisation rather than a personal one. This is a half hour conversation now that saves a serious problem later. It is not something to work out from the internet.

Until you have had that conversation, the safest setting is India-only donations, and a clear line on the Support page saying this is a personal project and not a registered organisation. That line is already there.

---

## Step 9. A domain name, later

The GitHub Pages address works and costs nothing. Buy a domain when the project has proved it is worth one, not before.

When you do: **Settings**, **Pages**, **Custom domain**. Turn on WHOIS privacy at the registrar so your home address is not published.

---

## What to do first, after it is live

1. Flag something yourself, to check the button works end to end.
2. Add one synagogue that is not in the directory yet, with its source.
3. Fill in a date for one of the five sites marked as having no date recorded.
4. Send the link to one person who works on this material and ask what is wrong with it.

The fourth is the most valuable and the least comfortable.
