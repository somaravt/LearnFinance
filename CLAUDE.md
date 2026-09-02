# Equity Research course

A self-paced course teaching one person to analyse companies well enough to
form independent, defensible views, and to pass NISM Series XV on the way to
SEBI Research Analyst registration.

Static HTML, no framework, no build step for the pages themselves. Deployed to
GitHub Pages. Installed as a PWA on an iPhone, read offline.

## Who this is for

One learner. An IT professional with ten-plus years in test automation, based
in Hyderabad. Already trades Indian equities with a backtested strategy and
works as a mutual fund distributor, so market mechanics and terminology are
familiar ground.

Financial statements are not. Before Module 01 he had never opened an annual
report. That is the level to write for.

Around five study hours a week. Reads on a phone, in gaps. Nineteen modules is
roughly a seven to nine month commitment.

## The most important thing in this file

**Module 01 was written once at the wrong level and had to be rebuilt from
scratch.** The first version used *receivables*, *accrual*, *capitalising*,
*working capital* and *residual* without defining any of them, and asserted
categories without justifying them — "dividends appear under financing" with no
reason given. His feedback: it read like revision for someone who already knew
the material, and he had to re-read paragraphs two or three times.

Do not repeat that. Concretely:

- **Define every technical term the first time it appears**, in a `.def` box,
  in plain language, and list what else the thing gets called. He will meet the
  synonyms in real reports.
- **Never assert a category — derive it.** Do not write "dividends are a
  financing activity". Give the sorting question ("what was the business doing
  when this money moved?") and let him reach financing himself. The rewritten
  Module 01 does this for the cash flow buckets and for the P&L order; follow
  that pattern.
- **Build from a concrete story before naming anything.** Module 01 opens a
  bakery and runs six transactions through an interactive stepper. The
  accounting equation is only named after he has watched both columns stay
  level six times. Reuse this: one small worked business, then the vocabulary.
- **Explain why a convention exists**, not just what it is. Depreciation gets a
  full section on why spreading a cost is more honest than charging it all in
  year one, before the word is ever used.

When in doubt, go slower. He has told us explicitly that he would rather have
more explanation than less.

## Content rules

- **Worked examples use fictional companies.** Vardhan Bakers Limited is
  invented so no figure can be mistaken for a real company's. Build any new
  example company's numbers so all three statements tie exactly, and verify the
  arithmetic in code before shipping. Real companies enter only when he pulls
  data from an actual annual report himself.
- **Never reproduce NISM workbook content or real past exam questions.** They
  are copyrighted. The public syllabus is fine to follow; every mock question
  here is original.
- **Nothing in this course is investment advice.** No buy or sell suggestions,
  no view on any real security.
- **Regulatory facts change and must be sourced.** SEBI amended the Research
  Analyst regulations in 2025 and sources disagree about what is in force. The
  index page flags two open items — his eligibility route given a non-finance
  degree, and how his mutual fund distribution business sits alongside an RA
  registration. Do not assert resolutions to either. Point at the current SEBI
  master circular and RAASB.

## Layout

```
course.json          curriculum: phases, modules, hours, status. Source of truth.
index.html           roadmap. Ledger rows are GENERATED between markers.
modules/mNN-slug.html  one self-contained page per module
assets/style.css     design tokens and all styling
assets/app.js        mock test grading, progress, service worker registration
assets/builder.js    the Module 01 interactive balance sheet stepper
sw.js                offline cache. SHELL and VERSION are GENERATED.
manifest.webmanifest PWA manifest
tools/build.py       regenerates the ledger and the precache list
tools/check.py       verifies pages before commit
```

## Adding a module

1. Write `modules/mNN-slug.html`. Copy the structure of
   `modules/m01-three-statements.html` — it is the reference implementation.
2. Set `file` and `status: "ready"` on that module in `course.json`.
3. `python3 tools/build.py` — rewrites the ledger in `index.html`, refreshes
   the precache list in `sw.js`, and bumps the cache version.
4. `python3 tools/check.py` — must pass.
5. Commit and push. GitHub Pages redeploys on its own.

Never hand-edit the ledger rows in `index.html` or `SHELL`/`VERSION` in
`sw.js`. Both sit between generated markers and will be overwritten.

The version bump in step 3 is what makes a phone that already cached the site
pick up the change. Skipping the build means the module works online and is
silently missing offline — which is where he actually reads.

## Module page conventions

Structure that Module 01 established and later modules should follow:

- `.part` paragraphs divide the lesson into numbered parts. Frequent breaks
  matter on a phone.
- `.def` boxes for every term, with a `.lit` line for synonyms and asides.
- `.note` for a boxed aside; `.note.warn` for a caution.
- `.fin` tables for financial statements, wrapped in `.scroll-x`. Negative
  figures in parentheses with `class="neg"`.
- Inline SVG for diagrams — no image files. Colours must use the CSS variables
  so the palette stays consistent. Every `<svg>` needs `role="img"` and a
  descriptive `aria-label`; `check.py` enforces this.
- Mock test in two parts. **Part A** checks comprehension of the lesson's own
  worked example. **Part B** is at exam and job level. Each question is a `.q`
  with `data-answer`, four options sharing a unique radio `name`, and a `.why`
  explanation that opens with the correct letter in bold and explains why the
  wrong answers are wrong, not only why the right one is right.
- End the lesson with one concrete task against a real annual report.

## Design

A columnar accounting pad. The ruled structure holding the navigation is the
same structure holding the figures in the lessons.

Palette lives in `:root` in `assets/style.css`: pale sage paper `#eef2ec`, deep
ink blue `#16232f`, sage rules, deep teal `#14524c` for anything interactive,
accountant's red `#97291f` for negatives and cautions. Spectral for reading,
IBM Plex Sans for interface and figures, with tabular numerals so columns line
up. Do not introduce new colours or typefaces.

British spelling throughout. Plain sentences. No exclamation marks.

## Constraints

- No build step for the pages. They must open correctly straight from disk.
- No frameworks, no npm, no bundler. `tools/` is plain Python 3, standard
  library only.
- Local storage is wrapped in try/catch everywhere — it fails in some previews
  and the pages must still work.
- Assume a 380px-wide viewport first. Tables need `.scroll-x`; SVG viewBoxes
  should stay near 600 wide so text is legible when scaled down.
