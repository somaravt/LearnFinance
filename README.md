# Equity Research — a working course

A self-paced course in company analysis, built toward the NISM Series XV
certification and SEBI Research Analyst registration. Static HTML, no build step,
no dependencies.

## Structure

```
index.html                          course roadmap and progress
assets/style.css                    shared styles
assets/app.js                       mock test grading, progress tracking
modules/m01-three-statements.html   Module 01
```

Each new module is a single self-contained page in `modules/`, plus one row added
to the ledger table in `index.html`.

## Publishing to GitHub Pages

1. Create a new repository on GitHub. A public repo is simplest; Pages works on
   private repos only on paid plans.
2. Push these files to the repository root.

   ```
   git init
   git add .
   git commit -m "Course scaffold and Module 01"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages**. Under *Build and deployment*,
   set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**.
   Save.
4. Wait a minute or two. The site appears at
   `https://<your-username>.github.io/<repo>/`.

All links are relative, so the site works from a subdirectory without changes.
You can also just open `index.html` from your filesystem — everything works
offline except the web fonts, which fall back to Georgia and your system sans.

## Progress tracking

Test scores are saved in the browser's local storage, per device and per browser.
Nothing is sent anywhere. Clearing site data clears your progress. The storage
calls are wrapped so that if storage is unavailable the pages still work — you
just lose the saved scores.

## A note on the content

Worked examples use a fictional company so that no figure can be mistaken for a
real one. Nothing here is a recommendation to buy or sell any security.
Regulatory details, including eligibility and deposit requirements, change —
verify them against the current SEBI master circular and RAASB guidance before
acting on them.

## Reading it offline, on your phone

Once the site is on GitHub Pages, open it in Chrome or Safari on your phone and
use **Add to Home Screen**. It installs like an app: its own icon, no browser
chrome, opens straight to the module ledger.

A service worker caches every page you have visited, plus the whole course shell
on first load. After that it works with no signal — metro, flight, dead zone.
When you are online it always fetches fresh pages first, so new modules appear
without you doing anything.

If the masthead shows "Offline — showing saved pages", you are reading from cache.

Service workers need HTTPS, which GitHub Pages provides. Opening the files
directly from disk with `file://` still works, it just skips offline caching.

### When a module is added

```
python3 tools/build.py     # ledger + offline cache list + version bump
python3 tools/check.py     # answer keys, broken links, tag balance
git add -A && git commit -m "Module NN" && git push
```

`course.json` is the source of truth for the curriculum. The ledger rows in
`index.html` and the `SHELL`/`VERSION` block in `sw.js` are generated between
markers — do not edit them by hand.
