# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The BCI (Building Chemistry Industry) marketing website — a Saudi construction-chemicals
manufacturer. Trilingual (English / Arabic-RTL / Español), multi-page site written as React 18
with **no bundler and no modules in development**: pages load raw `.jsx` compiled by in-browser
Babel. A Node build (`build/build.mjs`) turns that same source into a pre-rendered,
per-language, SEO-complete static site. Deployed on Vercel, with serverless functions in `api/`
that broker every form submission to the company's ERPNext instance.

## Commands

There is **no dev server, no lint, and no test runner** for the site itself.

- **Develop:** edit `.jsx` under `src/`, then serve the project root over HTTP
  (`python -m http.server`) and open `index.html`. Must be HTTP, not `file://` — Babel compiles
  JSX in-browser and `<image-slot>` fetches sidecars. Reload picks up edits; no build step.
- **Production build:** `cd build && npm install && npm run build` → writes `../dist/`
  (gitignored). This is what Vercel runs (`buildCommand` in `vercel.json`).
- **Rebundle the upload helper:** `npm install && npm run bundle:blob` (root `package.json`)
  regenerates `blob-upload.js` from `build/blob-upload-entry.mjs` via esbuild.
  **`blob-upload.js` is generated — never hand-edit it.**
- **Python tooling tests:** `python -m pytest tools/test_bci_product_pipeline.py` — the only
  test suite in the repo; it covers the ERP→website product pipeline.

The `api/` routes do **not** run under a plain static server. Forms detect this and fall back to
the local catalogue, labelled as preview data (see `docs/erp-customer-rfq-integration.md`).

## Architecture

### No modules — everything is a window global
The single most important convention. There are **no `import`/`export` statements** in `src/`.
Every file defines plain functions/consts in global scope; later scripts consume globals defined
by earlier ones, so **script order matters**. `src/data.jsx` and `src/ui.jsx` end with explicit
`Object.assign(window, { … })`. The `/* global … */` comment at the top of each file documents
what it consumes — keep it accurate when adding cross-file dependencies. Each `src/*-page.jsx`
ends with its own `ReactDOM.createRoot(document.getElementById('root')).render(…)`.

### Pages and script chains
Each top-level `.html` file is one page. Every page loads this chain in **exact order**:

```
src/ui.jsx → src/data.jsx → src/product-i18n.jsx → src/chrome.jsx → [form partials] → src/<page>.jsx
```

`index.html` additionally loads the homepage sections (`hero`, `logos`, `about`, `products`,
`contact`) before `app.jsx`. `Request Quote.html` loads `rfq-form.jsx`, `Submittal Request.html`
loads `submittal-form.jsx` and `Sample Request.html` loads `sample-form.jsx`, each before its
page file.

Pages: `index`, `About`, `Solutions`, `Solution Detail`, `Product Detail`, `Projects`,
`Resources`, `Career`, `Supplier`, `Contact`, `Request Quote`, `Submittal Request`,
`Sample Request`, `Thank You`, `SEO Landing` (a template, never served directly), `404`.

### The build is a static site generator, not just a JSX compiler
`build/build.mjs` (~680 lines, read it before changing build behaviour) does far more than
precompile:

1. Compiles every `.jsx` → `.js` and rewrites in-component `assets/…` paths to absolute.
2. **Pre-renders** each page in all three languages through jsdom + `react-dom/server`, by
   shimming `ReactDOM.createRoot().render()` into `renderToStaticMarkup`. Served HTML carries
   real content for crawlers that don't run JS.
3. Publishes one URL per language: EN at `/`, AR at `/ar/`, ES at `/es/`.
4. Expands `SOLUTIONS` into a page per category (`/solutions/<slug>`) and per product
   (`/solutions/<cat>/<product>`), plus `SEO_LANDING_PAGES` at their own paths.
5. Emits per-page `<head>`: title/description from `SEO_META`, canonical, hreflang, OG/Twitter,
   and schema.org JSON-LD (Organization, WebSite, BreadcrumbList, ItemList, Product,
   CollectionPage, JobPosting, LocalBusiness per branch).
6. Generates `sitemap.xml` (with hreflang + image entries), `robots.txt` (explicitly AI-crawler
   friendly) and `llms.txt`. The root `sitemap.xml`/`robots.txt` are **stale leftovers** — the
   deployed ones are generated.
7. Self-hosts the pinned React UMD builds into `assets/vendor/` (third-party CDN scripts got the
   Google Ads account flagged) and injects the GA4 + Google Ads tags.

Adding a page means adding it to `CONTENT_PAGES` in `build.mjs` **and** creating the HTML file —
otherwise it never reaches `dist/`.

### Dev URLs vs built URLs — the duality that breaks things
Dev serves raw capitalised files (`Solution Detail.html?cat=<slug>`); the build serves clean,
lowercase, extensionless URLs (`/solutions/<slug>`, Vercel `cleanUrls`). `src/ui.jsx` bridges
this with `siteHref` / `solutionHref` / `productHref`, all keyed off `window.__CLEAN_URLS`
(set only in built pages). **Always build internal links with these helpers, never hand-written
paths** — a literal href will be correct in one mode and broken in the other.

`productSlug()` exists in **both** `src/ui.jsx` and `build/build.mjs` and the two definitions
must stay identical, or dev links and built files diverge.

`window.__PRERENDER` is set during the static build: `useInView` and `CountUp` in `ui.jsx` check
it and render final content immediately. Any new scroll-reveal or animation-gated content must
do the same, or it pre-renders empty and the SEO value is lost.

`vercel.json` holds `cleanUrls`, the build command, and a long list of permanent redirects from
legacy/likely-guessed paths — add a redirect there when a URL changes.

### Content is data-driven — edit `src/data.jsx`
`src/data.jsx` (~1800 lines) is the single source of truth: `SOLUTIONS` (9 categories →
products), `SOLUTION_SEO`, `SEO_LANDING_PAGES`, `PROJECTS`, `RESOURCES`, `JOBS`, `STATS`,
`TIMELINE`, `STORES`, `CONTACT_DETAILS`, `NAV`, `SEO_META`, `FAQS`. Pages map over these arrays;
changing content needs no layout edits. `SEO_META` and `SOLUTION_SEO` feed the build's `<head>`
generation, so a new page's entry there is not optional.

`src/product-i18n.jsx` is an **overlay** loaded right after `data.jsx`: it maps product code →
cleaned EN/AR/ES descriptions and merges onto `window.SOLUTIONS`. It exists because the ERP sync
overwrites English descriptions and duplicates them into `ar`/`es`. So: **product descriptions
belong in `product-i18n.jsx`, not `data.jsx`** — edits to descriptions in `data.jsx` are lost on
the next sync. Product *names* are brand codes and are never translated.

### Serverless API layer (`api/`)
Vercel functions, CommonJS, one file per route; `_`-prefixed files are shared helpers, not
routes. All ERP credentials stay server-side.

- `_erp.js` — the ERP client: `erpFetch` (REST, token auth), `erpWebForm` (guest Web Form
  submit), `erpUploadFile`, `sendJson`. Base URL is `ERP_BASE_URL`, defaulting to
  `https://erp.bcisaudi.net`.
- Read routes: `jobs.js`, `designations.js`, `rfq-items.js` — return only publishable fields.
- Write routes: `customer-rfq.js`, `submittal-request.js`, `sample-request.js`,
  `job-application.js`, `web-form-submit.js` (allow-listed fields → ERP Web Forms).
- Every route that accepts a product code must run it through `_website-item.js` — ERP does
  **not** validate the Item link on a child row, so an unchecked code is stored verbatim.
- Uploads: files are staged to Vercel Blob by the browser (`blob-upload.js`) and pulled
  server-side into ERP. `_rfq-file.js`, `_resume.js`, `_photo.js` define per-kind path prefix,
  size and MIME limits — enforced when the upload token is issued **and** again when the blob is
  read. The staging prefixes in `build/blob-upload-entry.mjs` must match `FILE_KINDS` in
  `api/_rfq-file.js`.
- `erp-job-webhook.js` — inbound from ERP, bearer secret compared with `timingSafeEqual`.

Client side, `src/ui.jsx` wraps these (`loadErpJobs`, `loadErpDesignations`, `loadErpRfqItems`,
`submitCustomerRfq`, `submitSubmittalRequest`, `submitSampleRequest`, `submitErpWebForm`) and
deliberately surfaces real ERP errors — the UI must never report success on a 4xx. On success each
request form navigates to `thankYouHref({ type, ref })`, which carries the ERP reference in the URL
and fires the Ads conversion there; `type` must be one of `THANK_YOU_TYPES` in
`src/thank-you-page.jsx` or the page falls back to the RFQ wording.

Env vars (set in Vercel, not committed): `ERP_BASE_URL`, `ERP_TOKEN`, `ERP_WEBHOOK_SECRET`,
plus the Vercel Blob token.

### Internationalization
- `t(lang, en, ar, es)` in `src/ui.jsx`. **Argument order is `en, ar, es`**; `es` is optional and
  falls back to `en`. Content objects in `data.jsx` use the same `{ en, ar, es }` shape.
- `LangProvider` / `useLang` (`src/chrome.jsx`) persist to `localStorage` (`bci-lang`) and set
  `dir="rtl"` + `lang` on the document for Arabic. In the built site the language is also part of
  the URL (`/ar/…`), read back by `pageLang()` / `barePath()`.
- Supply all three languages when adding strings (EN+AR at minimum).

### Shared layer
- `src/ui.jsx` — `LangContext`/`useLang`/`t`, `Icon` (named SVG registry), URL helpers, the ERP
  fetch/submit wrappers, `useViewport` (phone <640, tablet 640–1023, desktop ≥1024) and
  `useInView` (scroll-reveal, respects reduced-motion).
- `src/chrome.jsx` — `LangProvider`, `MegaHeader`, `Footer`, `PageHero`, language dropdown.
- `styles.css` + `ds/colors_and_type.css` — design tokens as CSS variables (`--bci-navy`,
  `--bci-green-500`, `--ff-sans`/`--ff-arabic`/`--ff-mono`). Components style via inline styles
  referencing those variables; the accent is injected at runtime.

### ERP product sync (`tools/`)
Python pipeline that pulls finished-product rows from ERP and **rewrites the `products: [...]`
arrays inside `src/data.jsx` in place**, preserving hand-written category meta:
`group_products.py` → `build_products.py` → `fetch_images.py`; `publish_docs.py` →
`build_resources.py` for the Resources library. `bci_product_pipeline.py` holds the reusable
logic (and is the tested part). These are run by external automation, not during a normal build.

Note the ERP host drift: `api/_erp.js` targets `erp.bcisaudi.net`, while `DOC_BASE` in
`src/data.jsx` and the constants in `tools/*.py` still point at the old `apcv14.lynx.sa`. Treat
`erp.bcisaudi.net` as current and check before relying on the old host.

### Edit-mode / Tweaks tooling (design-host scaffolding)
`tweaks-panel.jsx` and the `TWEAK_DEFAULTS` block in `app.jsx` are scaffolding for an external
design host. `TWEAK_DEFAULTS` sits inside `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` markers that the
host rewrites on disk via a `postMessage` protocol. `image-slot.js` is a standalone
`<image-slot>` web component. Both are inert in a plain browser and unrelated to content editing.

## Working in this repo

- After editing `.jsx`, dev picks it up on reload; **production requires re-running the build**.
- Two independent cache-busting schemes: the `?v=…` query strings hand-written on each HTML
  page's `<script>` tags (dev), and `ASSET_V` / `BLOB_UPLOAD_V` constants in `build.mjs` (built
  site). Bump `ASSET_V` when deployed JS must be forced fresh.
- `AGENTS.md` is a near-duplicate of this file kept for Codex; if you substantially change
  guidance here, mirror it there.
- `docs/` holds the ERP integration write-ups (careers, customer RFQ) — read the relevant one
  before changing a form or its API route.
- `google-ads/` (gitignored — contains an OAuth client secret) holds Python scripts against the
  Google Ads API plus campaign/ad-copy design docs.
