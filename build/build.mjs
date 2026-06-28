// build.mjs — BCI website production build
// ---------------------------------------------------------------
// Turns the in-browser React/JSX site into a fully pre-rendered,
// multi-language, SEO/AIO-ready static site in ../dist:
//
//  1. Compiles every JSX → plain React.createElement JS (no Babel at runtime)
//     and rewrites in-component asset paths to absolute (/assets/…).
//  2. PRE-RENDERS each page (in English, Arabic and Spanish) to static HTML
//     via jsdom + react-dom/server, so the served HTML carries the real
//     content — readable by Google AND by AI crawlers that don't run JS.
//  3. Publishes each language to its own URL: EN at /, AR at /ar/, ES at /es/,
//     with clean product URLs /solutions/<slug>.html.
//  4. Generates per-page <head> SEO: title, description, canonical, hreflang,
//     Open Graph / Twitter, and schema.org JSON-LD (Organization, WebSite,
//     BreadcrumbList, ItemList/Product, JobPosting, FAQPage).
//  5. Generates sitemap.xml (with hreflang alternates), robots.txt (AI-bot
//     friendly) and llms.txt for AI assistants.
//
// Run from build/:   npm install && npm run build   → output: ../dist
// ---------------------------------------------------------------

import { transformAsync } from '@babel/core';
import presetReact from '@babel/preset-react';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://www.bcisaudi.com';
const ASSET_V = '1.2';
const LANGS = ['en', 'ar', 'es'];
const OG_LOCALE = { en: 'en_US', ar: 'ar_SA', es: 'es_ES' };
const TODAY = new Date().toISOString().slice(0, 10);

// Static files/folders copied verbatim. robots.txt + sitemap.xml are GENERATED.
const STATIC = ['assets', 'ds', 'styles.css', 'image-slot.js', 'favicon.ico', 'vercel.json'];

// Content pages: source file → SEO key + nav "active" id.
// `path` is the clean, extensionless, lowercase public URL (Vercel cleanUrls
// serves <path>.html on disk at /<path>). `file` is the source to read.
const CONTENT_PAGES = [
  { file: 'index.html', key: 'home', active: 'Home', path: '' },
  { file: 'About.html', key: 'about', active: 'About', path: 'about' },
  { file: 'Solutions.html', key: 'solutions', active: 'Solutions', path: 'solutions' },
  { file: 'Projects.html', key: 'projects', active: 'Projects', path: 'projects' },
  { file: 'Resources.html', key: 'resources', active: 'Resources', path: 'resources' },
  { file: 'Career.html', key: 'career', active: 'Career', path: 'career' },
  { file: 'Contact.html', key: 'contact', active: 'Contact', path: 'contact' },
];

const FAVICONS = [
  '<link rel="icon" href="/favicon.ico?v=2" sizes="any" />',
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png?v=2" />',
  '<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png?v=2" />',
  '<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png?v=2" />',
  '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=2" />',
].join('\n');

// Fonts loaded directly in <head> with preconnect — de-chained from the CSS
// @import (which was render-blocking). Keep in sync with the dev-page heads.
const FONTS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com" />',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Sans+Condensed:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" />',
].join('\n');

const ANALYTICS =
`<script>
(function(){var ID='G-497CB9HQBE';if(!ID||/X{5,}/.test(ID))return;var s=document.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config',ID);})();
</script>`;

// ---------- small utils ----------
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tr = (lang, en, ar, es) => (lang === 'ar' ? ar : lang === 'es' ? (es != null ? es : en) : en);
const langPrefix = (lang) => (lang === 'en' ? '' : `/${lang}`);
const abs = (lang, p) => `${ORIGIN}${langPrefix(lang)}/` + (p ? encodeURI(p) : '');
function ld(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

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
async function findJsx(dir, out = []) {
  for (const name of await fs.readdir(dir)) {
    const full = path.join(dir, name);
    const st = await fs.stat(full);
    if (st.isDirectory()) await findJsx(full, out);
    else if (name.endsWith('.jsx')) out.push(full);
  }
  return out;
}
async function writeFile(rel, content) {
  const dst = path.join(DIST, rel);
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.writeFile(dst, content, 'utf8');
}

// ---------- pre-render engine ----------
// Shim ReactDOM so `createRoot(el).render(<App/>)` serializes to static HTML.
function reactDomShim() {
  const into = (el, c) => { c.innerHTML = renderToStaticMarkup(el); };
  return {
    createRoot: (c) => ({ render: (el) => into(el, c), unmount() {} }),
    hydrateRoot: (c, el) => (into(el, c), { unmount() {} }),
    render: (el, c) => into(el, c),
    createPortal: (children) => children,
    flushSync: (fn) => (fn ? fn() : undefined),
    version: React.version,
  };
}
function appScriptPaths(srcHtml) {
  const re = /<script type="text\/babel" src="([^"]+?)\.jsx(?:\?[^"]*)?"><\/script>/g;
  const out = [];
  let m;
  while ((m = re.exec(srcHtml))) out.push(m[1]);
  return out;
}
function makeWindow(url) {
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>',
    { url, runScripts: 'outside-only', pretendToBeVisual: true });
  dom.window.__PRERENDER = true;
  dom.window.__CLEAN_URLS = true;
  dom.window.React = React;
  dom.window.ReactDOM = reactDomShim();
  return dom;
}
async function readScripts(scriptRels) {
  const out = [];
  for (const rel of scriptRels) out.push(await fs.readFile(path.join(DIST, rel + '.js'), 'utf8'));
  return out.join('\n;\n');
}
function prerender(code, url, label) {
  try {
    const dom = makeWindow(url);
    vm.runInContext(code, dom.getInternalVMContext(), { filename: `prerender:${label}` });
    const root = dom.window.document.getElementById('root');
    const html = root ? root.innerHTML.trim() : '';
    dom.window.close();
    if (!html) console.warn(`  ! ${label}: empty #root`);
    return html;
  } catch (e) {
    console.warn(`  ! ${label}: pre-render failed — ${e.message}`);
    return '';
  }
}

// Load the data layer (run compiled ui.js + data.js, read window globals).
async function loadData() {
  const ui = await fs.readFile(path.join(DIST, 'src/ui.js'), 'utf8');
  const data = await fs.readFile(path.join(DIST, 'src/data.js'), 'utf8');
  // product-i18n overlay re-localises product descriptions (EN/AR/ES) onto
  // SOLUTIONS by code, so schema, meta and pre-rendered pages all use it.
  let i18n = '';
  try { i18n = await fs.readFile(path.join(DIST, 'src/product-i18n.js'), 'utf8'); } catch {}
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>',
    { url: ORIGIN + '/', runScripts: 'outside-only' });
  dom.window.React = React;
  vm.runInContext(ui + '\n;\n' + data + '\n;\n' + i18n, dom.getInternalVMContext(), { filename: 'data-load' });
  const w = dom.window;
  const keys = ['SOLUTIONS', 'PROJECTS', 'JOBS', 'STATS', 'SOCIALS', 'CONTACT_DETAILS', 'STORES', 'SEO_META', 'FAQS', 'NAV'];
  const out = {};
  for (const k of keys) out[k] = w[k];
  return out;
}

// ---------- schema.org builders ----------
function orgLd(D) {
  return {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: 'Building Chemistry Industry (BCI)', alternateName: 'BCI',
    url: ORIGIN + '/', logo: ORIGIN + '/assets/BCI-lockup-color.png', image: ORIGIN + '/assets/og-image.png?v=3',
    description: 'Saudi national manufacturer of construction chemicals and protective coatings — waterproofing, flooring, polyurea, coatings, concrete repair, sealants, grouts and admixtures.',
    foundingDate: '2021', email: 'info@bcisaudi.com', telephone: '+966593120221',
    address: { '@type': 'PostalAddress', streetAddress: '3rd Industrial City', addressLocality: 'Dammam', postalCode: '34223', addressRegion: 'Eastern Province', addressCountry: 'SA' },
    areaServed: ['Saudi Arabia', 'GCC'],
    sameAs: (D.SOCIALS || []).map((s) => s.href),
    contactPoint: { '@type': 'ContactPoint', telephone: '+966593120221', email: 'info@bcisaudi.com', contactType: 'sales', areaServed: 'SA', availableLanguage: ['en', 'ar'] },
  };
}
const websiteLd = (lang) => ({
  '@context': 'https://schema.org', '@type': 'WebSite',
  name: 'BCI — Building Chemistry Industry', url: ORIGIN + '/', inLanguage: lang,
  publisher: { '@type': 'Organization', name: 'Building Chemistry Industry (BCI)' },
});
const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});
const faqLd = (D, lang) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: (D.FAQS || []).map((f) => ({
    '@type': 'Question', name: tr(lang, f.q.en, f.q.ar, f.q.es),
    acceptedAnswer: { '@type': 'Answer', text: tr(lang, f.a.en, f.a.ar, f.a.es) },
  })),
});
function jobPostingsLd(D, lang) {
  const through = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
  return (D.JOBS || []).map((j) => ld({
    '@context': 'https://schema.org', '@type': 'JobPosting',
    title: tr(lang, j.title.en, j.title.ar, j.title.es),
    description: tr(lang, j.blurb.en, j.blurb.ar, j.blurb.es),
    employmentType: 'FULL_TIME', datePosted: TODAY, validThrough: through, directApply: true,
    hiringOrganization: { '@type': 'Organization', name: 'Building Chemistry Industry (BCI)', sameAs: ORIGIN + '/', logo: ORIGIN + '/assets/BCI-lockup-color.png' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Dammam', addressRegion: 'Eastern Province', addressCountry: 'SA' } },
    industry: 'Construction Chemicals', employerOverview: 'Saudi manufacturer of construction chemicals.',
  })).join('\n');
}
function categoryItemListLd(cat, lang, pageUrl) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: (cat[lang] || cat.en).name, url: pageUrl,
    numberOfItems: cat.products.length,
    itemListElement: cat.products.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Product', name: (p[lang] || p.en).name,
        description: (p[lang] || p.en).desc,
        sku: p.code, mpn: p.code,
        category: (cat[lang] || cat.en).name,
        url: abs(lang, `solutions/${cat.slug}/${productSlug(p.code)}`),
        brand: { '@type': 'Brand', name: 'BCI' },
        manufacturer: { '@type': 'Organization', name: 'Building Chemistry Industry (BCI)' },
        ...(p.img ? { image: ORIGIN + '/' + p.img.replace(/^\//, '') } : {}),
        ...(p.tds ? { additionalProperty: { '@type': 'PropertyValue', name: 'TDS', value: p.tds } } : {}),
      },
    })),
  };
}

// URL slug for a product, derived from its ERP code. MUST match productSlug()
// in src/ui.jsx so dev links and built pages resolve to the same file.
const productSlug = (code) => String(code == null ? '' : code)
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// schema.org Product for a single product page.
function productLd(cat, prod, lang, url) {
  const p = prod[lang] || prod.en;
  return {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, description: p.desc,
    sku: prod.code, mpn: prod.code,
    category: (cat[lang] || cat.en).name,
    brand: { '@type': 'Brand', name: 'BCI' },
    manufacturer: { '@type': 'Organization', name: 'Building Chemistry Industry (BCI)', url: ORIGIN + '/' },
    url, inLanguage: lang, countryOfOrigin: 'SA',
    ...(prod.img ? { image: ORIGIN + '/' + prod.img.replace(/^\//, '') } : {}),
    ...(prod.colors && prod.colors.length ? { color: prod.colors.join(', ') } : {}),
    ...(prod.tds ? { additionalProperty: { '@type': 'PropertyValue', name: 'Technical Data Sheet', value: prod.tds } } : {}),
  };
}

// One schema.org LocalBusiness per branch/store (drives local-pack visibility).
function localBusinessLd(D, lang) {
  const cityName = (s) => (s[lang] || s.en).city;
  return (D.STORES || []).map((s) => {
    const en = s.en || {};
    const node = {
      '@context': 'https://schema.org', '@type': 'LocalBusiness',
      '@id': `${ORIGIN}/#branch-${s.key}`,
      name: `BCI — ${en.city}`, image: ORIGIN + '/assets/og-image.png?v=3', url: ORIGIN + '/',
      telephone: '+966593120221', email: 'info@bcisaudi.com', priceRange: '$$',
      parentOrganization: { '@type': 'Organization', name: 'Building Chemistry Industry (BCI)', url: ORIGIN + '/' },
      address: { '@type': 'PostalAddress', addressLocality: cityName(s), addressRegion: (en.region || ''), addressCountry: 'SA' },
      areaServed: (s[lang] || s.en).region || en.region,
      ...(s.lat != null && s.lon != null ? { geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lon } } : {}),
      ...(s.map ? { hasMap: s.map } : {}),
    };
    if (s.hq) node.description = tr(lang, 'Head office, manufacturing plant and store of Building Chemistry Industry (BCI).', 'المقر الرئيسي والمصنع والمعرض لشركة صناعة كيمياء البناء (BCI).', 'Sede, planta de fabricación y tienda de Building Chemistry Industry (BCI).');
    return ld(node);
  }).join('\n');
}

// Schema set for a content page.
function pageSchema(key, lang, D) {
  const crumbHome = { name: tr(lang, 'Home', 'الرئيسية', 'Inicio'), url: abs(lang, '') };
  const here = (file, name) => ({ name, url: abs(lang, file) });
  const scripts = [ld(websiteLd(lang))];
  if (key === 'home') { scripts.unshift(ld(orgLd(D))); scripts.push(ld(faqLd(D, lang))); }
  if (key === 'about') scripts.push(ld(breadcrumbLd([crumbHome, here('about', tr(lang, 'About', 'عن BCI', 'Nosotros'))])));
  if (key === 'solutions') {
    scripts.push(ld(breadcrumbLd([crumbHome, here('solutions', tr(lang, 'Solutions', 'الحلول', 'Soluciones'))])));
    scripts.push(ld({
      '@context': 'https://schema.org', '@type': 'ItemList', name: tr(lang, 'BCI Solution Lines', 'خطوط حلول BCI', 'Líneas de Soluciones BCI'),
      itemListElement: (D.SOLUTIONS || []).map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: (s[lang] || s.en).name, url: abs(lang, `solutions/${s.slug}`) })),
    }));
  }
  if (key === 'projects') scripts.push(ld(breadcrumbLd([crumbHome, here('projects', tr(lang, 'Projects', 'المشاريع', 'Proyectos'))])));
  if (key === 'resources') scripts.push(ld(breadcrumbLd([crumbHome, here('resources', tr(lang, 'Resources', 'الموارد', 'Recursos'))])));
  if (key === 'career') { scripts.push(ld(breadcrumbLd([crumbHome, here('career', tr(lang, 'Careers', 'الوظائف', 'Empleo'))]))); scripts.push(jobPostingsLd(D, lang)); }
  if (key === 'contact') { scripts.push(ld(breadcrumbLd([crumbHome, here('contact', tr(lang, 'Contact', 'تواصل', 'Contacto'))]))); scripts.push(ld(orgLd(D))); scripts.push(localBusinessLd(D, lang)); }
  return scripts.join('\n');
}

// ---------- document assembly ----------
function buildDoc({ lang, title, description, p, schema, prerendered, scripts, robots }) {
  const canonical = abs(lang, p);
  const hreflang = LANGS.map((L) => `<link rel="alternate" hreflang="${L}" href="${abs(L, p)}" />`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${abs('en', p)}" />`;
  const scriptTags = scripts.map((s) => `<script src="/${s}.js?v=${ASSET_V}"></script>`).join('\n');
  return `<!doctype html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${robots ? `<meta name="robots" content="${robots}" />\n` : ''}<link rel="canonical" href="${canonical}" />
${hreflang}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="BCI — Building Chemistry Industry" />
<meta property="og:locale" content="${OG_LOCALE[lang]}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${ORIGIN}/assets/og-image.png?v=3" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="1200" />
<meta property="og:image:alt" content="BCI — Building Chemistry Industry" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${ORIGIN}/assets/og-image.png?v=3" />
${FAVICONS}
${FONTS}
<link rel="stylesheet" href="/styles.css?v=${ASSET_V}" />
${schema}
${ANALYTICS}
</head>
<body>
<div id="root">${prerendered}</div>
<script>window.__CLEAN_URLS=1;</script>
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
${scriptTags}
</body>
</html>`;
}

// ---------- generators: sitemap / robots / llms ----------
function sitemap(paths, images = {}) {
  const alts = (p) => LANGS.map((L) => `    <xhtml:link rel="alternate" hreflang="${L}" href="${abs(L, p)}" />`).join('\n')
    + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs('en', p)}" />`;
  const imgTags = (p) => (images[p] || []).map((u) => `    <image:image><image:loc>${esc(u)}</image:loc></image:image>`).join('\n');
  const urls = [];
  for (const p of paths) for (const L of LANGS) {
    const imgs = imgTags(p);
    urls.push(`  <url>\n    <loc>${abs(L, p)}</loc>\n${alts(p)}\n${imgs ? imgs + '\n' : ''}    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
}
const robotsTxt =
`# BCI — robots.txt
User-agent: *
Allow: /

# AI assistants & answer engines are explicitly welcome to read and cite the site.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
function llmsTxt(D) {
  const cats = (D.SOLUTIONS || []).map((s) => `- [${s.en.name}](${ORIGIN}/solutions/${s.slug}): ${s.en.tagline} (${s.products.length} products)`).join('\n');
  return `# BCI — Building Chemistry Industry

> BCI (Building Chemistry Industry) is a Saudi national manufacturer of construction chemicals and protective coatings, founded in Dammam in 2021. It produces 200+ products across nine solution lines for the Saudi Arabian and GCC construction market. Quality is certified to ISO 9001 and systems are aligned to EN 1504. Saudi-made, supporting Vision 2030.

## Company
- Name: Building Chemistry Industry (BCI)
- Founded: 2021, Dammam, Saudi Arabia
- Plant & head office: 3rd Industrial City, Dammam 34223, Eastern Province, KSA
- Branches: Riyadh, Jeddah, Qassim, Jizan, Tabuk
- Certifications: ISO 9001, EN 1504; Saudi-made (SASO / SABER)
- Phone: +966 59 312 0221 · Email: info@bcisaudi.com
- Website: ${ORIGIN}/

## Solution lines
${cats}

## Key pages
- [About](${ORIGIN}/about): company, milestones and certifications
- [Solutions](${ORIGIN}/solutions): all nine construction-chemical lines and products
- [Projects](${ORIGIN}/projects): reference projects across Saudi Arabia and the GCC
- [Resources](${ORIGIN}/resources): technical data sheets (TDS), safety data sheets (SDS), certifications
- [Careers](${ORIGIN}/career): open roles in Dammam
- [Contact](${ORIGIN}/contact): sales, technical support and quotes

## Languages
English (${ORIGIN}/), Arabic (${ORIGIN}/ar/), Spanish (${ORIGIN}/es/).
`;
}

// 404: keep its noindex head, just compile/absolutize refs so it works at any depth.
function absolutize404(html) {
  html = html.replace(/[ \t]*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^>]*><\/script>\s*\n?/g, '');
  html = html.replace(/<script type="text\/babel" src="([^"]+?)\.jsx(\?[^"]*)?"><\/script>/g, (m, p1, q) => `<script src="/${p1}.js${q || ''}"></script>`);
  html = html.replace(/(href|src)="(?!https?:|\/\/|\/|#|data:|mailto:|tel:)([^"]+)"/g, (m, a, u) => `${a}="/${u}"`);
  html = html.replace('<div id="root"></div>', '<div id="root"></div>\n<script>window.__CLEAN_URLS=1;</script>');
  return html;
}

async function main() {
  await rmrf(DIST);
  await fs.mkdir(DIST, { recursive: true });

  // 1 · copy static assets
  for (const s of STATIC) {
    try { await copyRec(path.join(ROOT, s), path.join(DIST, s)); } catch { /* optional */ }
  }

  // 2 · compile JSX → JS, absolutizing in-component asset paths
  const jsxFiles = await findJsx(path.join(ROOT, 'src'));
  try { await fs.access(path.join(ROOT, 'tweaks-panel.jsx')); jsxFiles.push(path.join(ROOT, 'tweaks-panel.jsx')); } catch {}
  let compiled = 0;
  for (const file of jsxFiles) {
    const code = await fs.readFile(file, 'utf8');
    const res = await transformAsync(code, {
      presets: [[presetReact, { runtime: 'classic' }]],
      filename: file, babelrc: false, configFile: false, comments: false, compact: false,
    });
    const out = res.code.replace(/(["'`])assets\//g, '$1/assets/'); // → absolute asset URLs
    const rel = path.relative(ROOT, file).replace(/\.jsx$/, '.js');
    await writeFile(rel, out);
    compiled++;
  }

  // 3 · load data layer
  const D = await loadData();

  // 4 · pre-render + assemble every page in every language
  let pages = 0;
  const sitemapPaths = [''];
  const sitemapImages = {};   // path → [absolute image URLs] for the image sitemap
  for (const pg of CONTENT_PAGES) {
    if (pg.path) sitemapPaths.push(pg.path);
    const srcHtml = await fs.readFile(path.join(ROOT, pg.file), 'utf8');
    const scripts = appScriptPaths(srcHtml);
    const code = await readScripts(scripts);
    for (const lang of LANGS) {
      const meta = (D.SEO_META[pg.key] || {})[lang] || (D.SEO_META[pg.key] || {}).en;
      const inner = prerender(code, abs(lang, pg.path), `${pg.file} [${lang}]`);
      const doc = buildDoc({
        lang, title: meta.title, description: meta.description, p: pg.path,
        schema: pageSchema(pg.key, lang, D), prerendered: inner, scripts,
      });
      const outRel = path.join(langPrefix(lang).slice(1), pg.path ? pg.path + '.html' : 'index.html');
      await writeFile(outRel, doc);
      pages++;
    }
  }

  // 5 · clean product pages: /solutions/<slug>.html  (+ /ar, /es)
  const detailSrc = await fs.readFile(path.join(ROOT, 'Solution Detail.html'), 'utf8');
  const detailScripts = appScriptPaths(detailSrc);
  const detailCode = await readScripts(detailScripts);
  // keep the legacy Solution Detail.html (default category) working too
  for (const lang of LANGS) {
    const inner = prerender(detailCode, abs(lang, 'Solution Detail.html'), `Solution Detail.html [${lang}]`);
    const cat0 = D.SOLUTIONS[0];
    const meta0 = { title: `${(cat0[lang] || cat0.en).name} — BCI Construction Chemicals`, description: (cat0[lang] || cat0.en).tagline };
    await writeFile(path.join(langPrefix(lang).slice(1), 'Solution Detail.html'),
      buildDoc({ lang, title: meta0.title, description: meta0.description, p: 'Solution Detail.html',
        schema: '', prerendered: inner, scripts: detailScripts, robots: 'noindex,follow' }));
  }
  let detailPages = 0;
  for (const cat of D.SOLUTIONS) {
    const p = `solutions/${cat.slug}`;
    sitemapPaths.push(p);
    sitemapImages[p] = cat.products.filter((x) => x.img).map((x) => ORIGIN + '/' + x.img.replace(/^\//, '')).slice(0, 40);
    for (const lang of LANGS) {
      const url = abs(lang, p);
      const name = (cat[lang] || cat.en).name;
      const tagline = (cat[lang] || cat.en).tagline;
      const title = `${name} — BCI Construction Chemicals | Saudi Arabia`;
      const description = `${tagline} ${cat.products.length} BCI products, Saudi-made. Technical data sheets available.`;
      const inner = prerender(detailCode, url, `${p} [${lang}]`);
      const crumbs = breadcrumbLd([
        { name: tr(lang, 'Home', 'الرئيسية', 'Inicio'), url: abs(lang, '') },
        { name: tr(lang, 'Solutions', 'الحلول', 'Soluciones'), url: abs(lang, 'solutions') },
        { name, url },
      ]);
      const schema = [ld(crumbs), ld(categoryItemListLd(cat, lang, url))].join('\n');
      const doc = buildDoc({ lang, title, description, p, schema, prerendered: inner, scripts: detailScripts });
      await writeFile(path.join(langPrefix(lang).slice(1), p + '.html'), doc);
      detailPages++;
    }
  }

  // 6 · individual product pages: /solutions/<cat>/<product>.html (+ /ar, /es)
  const productSrc = await fs.readFile(path.join(ROOT, 'Product Detail.html'), 'utf8');
  const productScripts = appScriptPaths(productSrc);
  const productCode = await readScripts(productScripts);
  let productPages = 0;
  for (const cat of D.SOLUTIONS) {
    const seen = new Set();
    for (const prod of cat.products) {
      let slug = productSlug(prod.code);
      while (seen.has(slug)) slug += '-x';      // guard against rare slug collisions
      seen.add(slug);
      const p = `solutions/${cat.slug}/${slug}`;
      sitemapPaths.push(p);
      if (prod.img) sitemapImages[p] = [ORIGIN + '/' + prod.img.replace(/^\//, '')];
      for (const lang of LANGS) {
        const url = abs(lang, p);
        const pn = prod[lang] || prod.en;
        const catName = (cat[lang] || cat.en).name;
        const title = `${pn.name} — ${catName} | BCI`;
        const description = String(pn.desc || '').replace(/\s+/g, ' ').trim().slice(0, 158);
        const inner = prerender(productCode, url, `${p} [${lang}]`);
        const crumbs = breadcrumbLd([
          { name: tr(lang, 'Home', 'الرئيسية', 'Inicio'), url: abs(lang, '') },
          { name: tr(lang, 'Solutions', 'الحلول', 'Soluciones'), url: abs(lang, 'solutions') },
          { name: catName, url: abs(lang, `solutions/${cat.slug}`) },
          { name: pn.name, url },
        ]);
        const schema = [ld(crumbs), ld(productLd(cat, prod, lang, url))].join('\n');
        const doc = buildDoc({ lang, title, description, p, schema, prerendered: inner, scripts: productScripts });
        await writeFile(path.join(langPrefix(lang).slice(1), p + '.html'), doc);
        productPages++;
      }
    }
  }

  // 7 · 404 (root, noindex) — compile + absolutize, no pre-render
  try {
    const html404 = await fs.readFile(path.join(ROOT, '404.html'), 'utf8');
    await writeFile('404.html', absolutize404(html404));
  } catch {}

  // 8 · sitemap, robots, llms
  await writeFile('sitemap.xml', sitemap(sitemapPaths, sitemapImages));
  await writeFile('robots.txt', robotsTxt);
  await writeFile('llms.txt', llmsTxt(D));

  console.log(`✓ Compiled ${compiled} JSX files (assets → absolute)`);
  console.log(`✓ Built ${pages} content pages + ${detailPages} category pages across ${LANGS.length} languages`);
  console.log(`✓ Built ${productPages} product pages across ${LANGS.length} languages`);
  console.log(`✓ Generated sitemap.xml (${sitemapPaths.length * LANGS.length} URLs, with image entries), robots.txt, llms.txt`);
  console.log(`✓ Output: ${path.relative(process.cwd(), DIST)}/  — deploy this folder.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
