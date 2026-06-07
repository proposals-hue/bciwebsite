// build.mjs — BCI website production build
// ---------------------------------------------------------------
// Precompiles every JSX file to plain React.createElement JS and
// rewrites the HTML pages to load the compiled .js directly, with
// NO @babel/standalone and NO in-browser compilation.
//
// Run from the build/ folder:   npm install && npm run build
// Output: ../dist  (deploy the contents of dist/ to your host)
// ---------------------------------------------------------------

import { transformAsync } from '@babel/core';
import presetReact from '@babel/preset-react';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');     // project root
const DIST = path.join(ROOT, 'dist');

// Static files/folders copied verbatim into dist/
const STATIC = ['assets', 'ds', 'styles.css', 'image-slot.js'];

// HTML pages to rewrite
const PAGES = [
  'BCI Homepage.html', 'About.html', 'Solutions.html', 'Solution Detail.html',
  'Projects.html', 'Resources.html', 'Career.html', 'Contact.html', '404.html'
];

async function rmrf(p) { await fs.rm(p, { recursive: true, force: true }); }
async function copyRec(src, dst) {
  const st = await fs.stat(src);
  if (st.isDirectory()) {
    await fs.mkdir(dst, { recursive: true });
    for (const name of await fs.readdir(src)) await copyRec(path.join(src, name), path.join(dst, name));
  } else {
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.copyFile(src, dst);
  }
}

// Recursively gather every .jsx under a dir
async function findJsx(dir, base = dir, out = []) {
  for (const name of await fs.readdir(dir)) {
    const full = path.join(dir, name);
    const st = await fs.stat(full);
    if (st.isDirectory()) await findJsx(full, base, out);
    else if (name.endsWith('.jsx')) out.push(full);
  }
  return out;
}

async function main() {
  await rmrf(DIST);
  await fs.mkdir(DIST, { recursive: true });

  // 1 · copy static assets
  for (const s of STATIC) {
    try { await copyRec(path.join(ROOT, s), path.join(DIST, s)); } catch { /* optional */ }
  }

  // 2 · compile JSX  (src/*.jsx and the root tweaks-panel.jsx)
  const jsxFiles = await findJsx(path.join(ROOT, 'src'));
  try { await fs.access(path.join(ROOT, 'tweaks-panel.jsx')); jsxFiles.push(path.join(ROOT, 'tweaks-panel.jsx')); } catch {}

  let compiled = 0;
  for (const file of jsxFiles) {
    const code = await fs.readFile(file, 'utf8');
    const res = await transformAsync(code, {
      presets: [[presetReact, { runtime: 'classic' }]],
      filename: file, babelrc: false, configFile: false,
      comments: false, compact: false
    });
    const rel = path.relative(ROOT, file).replace(/\.jsx$/, '.js');
    const dst = path.join(DIST, rel);
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.writeFile(dst, res.code, 'utf8');
    compiled++;
  }

  // 3 · rewrite HTML: drop Babel, point script tags at compiled .js
  for (const page of PAGES) {
    let html;
    try { html = await fs.readFile(path.join(ROOT, page), 'utf8'); } catch { continue; }
    // remove the @babel/standalone tag
    html = html.replace(/[ \t]*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^>]*><\/script>\s*\n?/g, '');
    // text/babel JSX -> plain JS module reference
    html = html.replace(/<script type="text\/babel" src="([^"]+?)\.jsx(\?[^"]*)?"><\/script>/g,
      (m, p1, q) => `<script src="${p1}.js${q || ''}"></script>`);
    await fs.writeFile(path.join(DIST, page), html, 'utf8');
  }

  console.log(`✓ Compiled ${compiled} JSX files`);
  console.log(`✓ Rewrote ${PAGES.length} HTML pages (no in-browser Babel)`);
  console.log(`✓ Output: ${path.relative(process.cwd(), DIST)}/  — deploy this folder.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
