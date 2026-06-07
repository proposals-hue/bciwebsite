# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The BCI (Building Chemistry Industry) marketing website — a Saudi construction-chemicals
manufacturer. Trilingual (English / Español / Arabic-RTL), static multi-page site built with
React 18 loaded from CDN. No framework CLI, no bundler in development.

## Commands

There is **no dev server, lint, or test setup**. Workflow:

- **Develop:** edit the `.jsx` files, then open the site through a local static HTTP server
  (e.g. `python -m http.server` from the project root, then visit `index.html`). It must be
  served over HTTP, not `file://` — pages load scripts and `<image-slot>` reads sidecars via
  `fetch`, and Babel compiles the JSX in-browser.
- **Production build:** `cd build && npm install && npm run build`. This precompiles every
  `.jsx` → plain `.js` into `../dist/`, strips the in-browser Babel `<script>`, and rewrites
  each page's `<script>` tags to load the compiled `.js`. Deploy the **contents of `dist/`**
  to any static host and point its 404 handler at `404.html`. `dist/` is gitignored.

## Architecture

### Pages and script loading
Each top-level `.html` file at the project root is one page (`index.html` is the homepage;
also `About`, `Solutions`, `Solution Detail`, `Projects`, `Resources`, `Career`, `Contact`,
`404`). A page loads, in this **exact order**, a fixed chain of scripts:

```
src/ui.jsx  →  src/data.jsx  →  src/chrome.jsx  →  src/<page>.jsx
```

(The homepage `index.html` loads more partials — `hero`, `logos`, `about`, `products`,
`contact` — plus `app.jsx` last.)

### No modules — everything is a window global
This is the single most important convention. There are **no `import`/`export` statements.**
Every file defines plain functions/consts in global scope; later scripts depend on globals
defined by earlier ones, which is why **load order matters**. `src/data.jsx` ends with an
explicit `Object.assign(window, { SOLUTIONS, PROJECTS, ... })`. The `/* global ... */` comment
at the top of each file documents which globals it consumes — keep it accurate when you add
cross-file dependencies. Each `src/*-page.jsx` ends with its own
`ReactDOM.createRoot(document.getElementById('root')).render(...)`.

### Content is data-driven — edit `src/data.jsx`
`src/data.jsx` is the **single source of truth** for all site content: `SOLUTIONS` (9 product
categories → products), `PROJECTS`, `RESOURCES`, `JOBS`, `BENEFITS`, `VALUES`, `STATS`,
`TIMELINE`, company `CONTACT_DETAILS`, `NAV`, etc. To change product names, descriptions,
projects, or jobs, edit this file — no layout/component changes needed. Pages map over these
arrays to render.

### Internationalization
- `t(lang, en, ar, es)` in `src/ui.jsx` is the translation helper. **Argument order is
  `en, ar, es`** — `es` is optional and falls back to `en` when omitted. Content objects in
  `data.jsx` follow the same shape (`{ en, ar, es }`).
- `LangProvider` / `useLang` (in `src/chrome.jsx`) persist the choice in `localStorage`
  (`bci-lang`) and set `dir="rtl"` + `lang` on the document for Arabic.
- When adding strings, supply all three languages (or EN+AR at minimum).

### Shared layer
- `src/ui.jsx` — `LangContext`/`useLang`/`t`, the `Icon` component (named SVG registry),
  layout/typography primitives, and hooks `useViewport` (breakpoints: phone <640, tablet
  640–1023, desktop ≥1024) and `useInView` (scroll-reveal, respects reduced-motion).
- `src/chrome.jsx` — site shell: `LangProvider`, `MegaHeader`, `Footer`, `PageHero`, language
  dropdown.
- `styles.css` + `ds/colors_and_type.css` — design tokens as CSS variables (`--bci-navy`,
  `--bci-green-500`, fonts `--ff-sans`/`--ff-arabic`/`--ff-mono`). Components style mostly via
  inline styles referencing these variables; the accent color is injected at runtime
  (`document.documentElement.style.setProperty('--bci-green-500', ...)`).

### Edit-mode / Tweaks tooling (design-host scaffolding)
`tweaks-panel.jsx` and the `TWEAK_DEFAULTS` block in `app.jsx` are scaffolding for an external
design host. `TWEAK_DEFAULTS` is wrapped in `/*EDITMODE-BEGIN*/ ... /*EDITMODE-END*/` markers —
the host rewrites that block on disk via a `postMessage` protocol that `tweaks-panel.jsx`
implements. `image-slot.js` is a standalone `<image-slot>` web component (drag-drop image
placeholders persisted to a sidecar in that host runtime). These are inert in a plain browser
and not part of normal content editing.

## Working in this repo

- After editing any `.jsx`, the dev site picks it up on reload (in-browser Babel); for
  production you must re-run the build. The `?v=1.0` query strings on script/style tags are
  manual cache-busters — bump them if a deployed asset needs to be forced fresh.
- This folder is the **website workspace**. Some tasks involve syncing product/content data
  between the site and the company ERP (ERPNext/Frappe at `apcv14.lynx.sa`). When pulling ERP
  data into the site, the target is `src/data.jsx`. ERP connection details and helper scripts
  live outside this repo (see this project's Claude memory).
