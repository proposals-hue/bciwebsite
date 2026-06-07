# BCI Website — Production Build

The site runs directly from the HTML files in the project root (React via CDN). For
**fastest production load**, run this one-time build before deploying — it precompiles
all the JSX to plain JavaScript so the live site needs **no in-browser Babel compiler**
(removes a ~900 KB download and the per-visit compile step).

## Build

From this `build/` folder:

```bash
npm install
npm run build
```

This writes a self-contained, deploy-ready copy to **`../dist/`**:

- all `src/*.jsx` and `tweaks-panel.jsx` → compiled `.js`
- each HTML page rewritten to load the compiled `.js` (the `@babel/standalone`
  `<script>` is removed)
- `assets/`, `ds/`, `styles.css`, `image-slot.js` copied as-is

## Deploy

Upload the **contents of `dist/`** to your static host (Netlify, Vercel, Cloudflare
Pages, S3, nginx, etc.). Point the host's "page not found" handler at `404.html`.

## Notes

- **Production React** is already wired into the root HTML (`react.production.min.js`),
  so the dist build inherits it.
- **Editing:** keep editing the `.jsx` files in `src/`. They stay the source of
  truth — just re-run `npm run build` whenever you change them and re-deploy `dist/`.
- **Analytics:** set your GA4 Measurement ID by replacing `G-XXXXXXXXXX` in each
  page's `<head>` (it's inert until you do).
