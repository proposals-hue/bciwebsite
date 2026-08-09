/* global React */
const { useState, useEffect, useRef, createContext, useContext } = React;

// ---------------- Lang Context ----------------
const LangContext = createContext({ lang: 'en', setLang: () => {} });
const useLang = () => useContext(LangContext);
const t = (lang, en, ar, es) => {
  if (lang === 'ar') return ar;
  if (lang === 'es') return es != null ? es : en;
  return en;
};

// ---------------- Language-aware URLs ----------------
// The site is published per language: English at the root, Arabic under
// /ar/ and Spanish under /es/. Internal links are emitted as absolute,
// language-correct paths so they resolve from any depth (incl. /solutions/…)
// and keep the visitor inside their language. `pageLang()` reads the current
// language from the URL path (the build pre-renders each page at its language
// path, so this also drives server-side rendering).
const LANGS = ['en', 'ar', 'es'];
function pageLang() {
  if (typeof location === 'undefined') return 'en';
  const m = location.pathname.match(/^\/(ar|es)(?:\/|$)/);
  return m ? m[1] : 'en';
}
// Strip any leading language segment from a path → "bare" path (leading '/').
function barePath(pathname) {
  return pathname.replace(/^\/(ar|es)(?=\/|$)/, '') || '/';
}
// Absolute, language-correct href for an internal target. External/special
// links (http, mailto, tel, #fragment, //) pass through untouched.
function siteHref(path, lang) {
  if (path == null) return path;
  const s = String(path);
  if (/^(https?:|mailto:|tel:|#|\/\/|data:)/.test(s)) return path;   // external/special
  if (s[0] === '/') return path;                                     // already absolute/resolved
  // The dev browser only serves the root (no /ar/ or /es/ files), so links stay
  // root-relative there even when the language is toggled in place. The static
  // build sets window.__CLEAN_URLS and publishes each language to its own path.
  const built = typeof window !== 'undefined' && window.__CLEAN_URLS;
  const l = built ? (lang || pageLang()) : 'en';
  const prefix = l === 'en' ? '/' : `/${l}/`;
  let clean = s.replace(/^\.\//, '');
  if (clean === '' || clean === 'index.html') return prefix;
  // Built site uses clean, extensionless, lowercase URLs (Vercel cleanUrls).
  // Dev serves the raw capitalised .html files, so links keep the extension there.
  if (built) {
    clean = clean.replace(/\.html$/i, '');
    if (!clean.includes('/')) clean = clean.toLowerCase();   // top-level page → lowercase
  }
  return prefix + clean;
}
// Canonical URL for a solution-line (product category). The static build emits
// clean /solutions/<slug>.html files and sets window.__CLEAN_URLS; in the plain
// dev browser there is only Solution Detail.html?cat=<slug>, so fall back to it.
function solutionHref(slug, lang) {
  const clean = typeof window !== 'undefined' && window.__CLEAN_URLS;
  return siteHref(clean ? `solutions/${slug}` : `Solution Detail.html?cat=${slug}`, lang);
}
// Stable URL slug for a product, derived from its ERP code ("BC Proof 330" →
// "bc-proof-330"). MUST match productSlug() in build/build.mjs.
function productSlug(code) {
  return String(code == null ? '' : code).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
// Canonical URL for a single product page: /solutions/<cat>/<product>.html. In
// the plain dev browser there is only Product Detail.html?cat=&product=.
function productHref(catSlug, code, lang) {
  const clean = typeof window !== 'undefined' && window.__CLEAN_URLS;
  const ps = productSlug(code);
  return siteHref(clean ? `solutions/${catSlug}/${ps}` : `Product Detail.html?cat=${catSlug}&product=${ps}`, lang);
}

// ---------------- Viewport hook ----------------
// Re-renders the calling component on resize. Breakpoints:
//   phone  < 640    tablet 640–1023    desktop ≥ 1024
function useViewport() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  useEffect(() => {
    let raf = null;
    const onResize = () => {
      if (raf != null) return;
      raf = requestAnimationFrame(() => { setW(window.innerWidth); raf = null; });
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return { w, isPhone: w < 640, isTablet: w >= 640 && w < 1024, isMobile: w < 1024, isDesktop: w >= 1024 };
}

// Native select popovers can use their longest option as a minimum width in
// desktop mobile emulation. Keep phone labels compact while preserving the
// complete option value submitted to the server.
function selectOptionLabel(value, compact, maxChars = 28) {
  const label = String(value == null ? '' : value);
  if (!compact || label.length <= maxChars) return label;
  return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}\u2026`;
}

// ---------------- Scroll reveal ----------------
// Fires once when an element scrolls into view; respects reduced-motion.
function useInView(opts) {
  const o = opts || {};
  const ref = useRef(null);
  // During the static build (window.__PRERENDER) reveal content immediately so
  // the pre-rendered HTML crawlers/AI bots read is fully visible, not opacity:0.
  const [inView, setInView] = useState(typeof window !== 'undefined' && window.__PRERENDER === true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setInView(true); return; }
    const margin = o.margin != null ? o.margin : 80;
    let done = false;
    let rafId = null;
    const reveal = () => { if (!done) { done = true; setInView(true); cleanup(); } };
    const check = () => {
      if (done || !ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh - margin && r.bottom > 0) { reveal(); return true; }
      return false;
    };
    // rAF polling loop — robust where scroll events / IO callbacks aren't delivered.
    const loop = () => {
      if (done) return;
      if (!check()) rafId = requestAnimationFrame(loop);
    };
    let obs;
    if (typeof IntersectionObserver !== 'undefined') {
      obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) reveal(); });
      }, { threshold: o.threshold != null ? o.threshold : 0.14, rootMargin: o.rootMargin || '0px 0px -8% 0px' });
      obs.observe(el);
    }
    function cleanup() {
      if (obs) obs.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', check, true);
      window.removeEventListener('resize', check);
    }
    window.addEventListener('scroll', check, true);
    window.addEventListener('resize', check);
    rafId = requestAnimationFrame(loop);
    return cleanup;
  }, []);
  return [ref, inView];
}

// Inline-style generator for a fade + rise reveal.
function revealStyle(inView, delay, y, dur) {
  const d = delay || 0;
  const dist = y != null ? y : 26;
  const ms = dur || 680;
  // Static build emits the revealed state so pre-rendered HTML is fully visible.
  const shown = inView || (typeof window !== 'undefined' && window.__PRERENDER === true);
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : `translateY(${dist}px)`,
    transition: `opacity ${ms}ms cubic-bezier(.16,.84,.34,1) ${d}ms, transform ${ms}ms cubic-bezier(.16,.84,.34,1) ${d}ms`,
    willChange: 'opacity, transform'
  };
}

// ---------------- Count-up number ----------------
// Animates an integer from `start` to `value` once it (or its trigger) is active.
function CountUp({ value, start = 0, suffix = '', prefix = '', duration = 1300, active = true, group = true, style }) {
  const [n, setN] = useState(() => {
    // Pre-render shows the final value so the static HTML carries real numbers.
    if (typeof window !== 'undefined' && window.__PRERENDER === true) return value;
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduced ? value : start;
  });
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setN(value); return; }
    ran.current = true;
    let rafId = null;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(start + (value - start) * eased));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [active, value]);
  return <span style={style}>{prefix}{group ? n.toLocaleString('en-US') : n}{suffix}</span>;
}

// ---------------- Mark (interlocking squares) ----------------
function Mark({ size = 28, accent = 'var(--bci-green-500)', primary = 'var(--bci-navy)', stroke = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="14" y="14" width="40" height="40" stroke={accent} strokeWidth={stroke} />
      <rect x="44" y="44" width="40" height="40" stroke={primary} strokeWidth={stroke} />
    </svg>
  );
}

// ---------------- Icon (lucide-style) ----------------
function Icon({ name, size = 18, stroke = 'currentColor', strokeWidth = 1.5 }) {
  const paths = {
    'arrow-right': <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    'chevron-right': <polyline points="9 18 15 12 9 6" />,
    'download': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></>,
    'shield-check': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
    'droplets': <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" /></>,
    'flask': <><path d="M10 2v7.31" /><path d="M14 9.3V2" /><path d="M8.5 2h7" /><path d="M14 9.3a6 6 0 0 1 6 6V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4.7a6 6 0 0 1 6-6" /></>,
    'factory': <><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M17 18h.01" /><path d="M12 18h.01" /><path d="M7 18h.01" /></>,
    'globe': <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /></>,
    'phone': <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    'mail': <><rect x="2" y="4" width="20" height="16" /><polyline points="22 6 12 13 2 6" /></>,
    'message': <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    'map-pin': <><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
    'linkedin': <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
    'youtube': <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></>,
    'instagram': <><rect x="2" y="2" width="20" height="20" rx="0" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
    'x-twitter': <path d="M4 4l16 16M20 4L4 20" />,
    'facebook': <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    'whatsapp': <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" /></>,
    'check': <polyline points="20 6 9 17 4 12" />,
    'plus': <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    'palm': <><path d="M12 22v-9" /><path d="M12 13c-2-4-6-4-8-3 2-3 6-3 8-1" /><path d="M12 13c2-4 6-4 8-3-2-3-6-3-8-1" /><path d="M12 13c0-3 2-7 4-9-3 1-5 4-4 9" /><path d="M12 13c0-3-2-7-4-9 3 1 5 4 4 9" /></>,
    'layers': <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
    'package': <><path d="M16.5 9.4 7.5 4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    'grid': <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    'layout-grid': <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    'trowel': <><path d="M3 21l4-4" /><path d="M14 3l7 7-7 4-4-4z" /><path d="M10 10l-3 3" /></>,
    'minus-square': <><rect x="3" y="3" width="18" height="18" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="10" y2="9" /></>,
    'book': <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    'clipboard': <><rect x="8" y="2" width="8" height="4" rx="0" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="15" y2="16" /></>,
    'award': <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>,
    'briefcase': <><rect x="2" y="7" width="20" height="14" rx="0" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
    'users': <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    'arrow-up-right': <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>,
    'clock': <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    'search': <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    'filter': <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    'building': <><rect x="4" y="2" width="16" height="20" /><line x1="9" y1="6" x2="9" y2="6" /><line x1="15" y1="6" x2="15" y2="6" /><line x1="9" y1="10" x2="9" y2="10" /><line x1="15" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="9" y2="14" /><line x1="15" y1="14" x2="15" y2="14" /><path d="M9 22v-4h6v4" /></>,
    'send': <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    'chevron-down': <polyline points="6 9 12 15 18 9" />,
    'external-link': <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    'heart': <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    'menu': <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>,
    'x': <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"
         style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}

// ---------------- Badge ----------------
function Badge({ variant = 'outline', children, icon }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', borderRadius: 2,
    fontFamily: 'var(--ff-mono)', fontSize: 11,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    fontWeight: 500,
  };
  const styles = {
    filled: { ...base, background: 'var(--bci-green-500)', color: '#fff', border: '1px solid var(--bci-green-500)' },
    outline: { ...base, background: 'transparent', color: 'var(--bci-navy)', border: '1px solid var(--bci-navy)' },
    'outline-light': { ...base, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.5)' },
    'green-soft': { ...base, background: 'var(--bci-green-50)', color: 'var(--bci-green-700)', border: '1px solid var(--bci-green-200)' },
    'navy-soft': { ...base, background: 'var(--bci-navy-50)', color: 'var(--bci-navy)', border: '1px solid var(--bci-navy-100)' },
  };
  return <span style={styles[variant]}>{icon}{children}</span>;
}

// ---------------- ERP form submit ----------------
// Contact and supplier submissions go through a same-origin serverless
// function. It forwards only allow-listed fields to ERPNext's guest Web Forms
// and returns the real ERP result, so the UI never reports success for a 4xx or
// validation error. The ERP origin and credentials remain server-side.

// Same-origin vacancy feed. The Vercel function keeps the ERP API token on the
// server and returns only fields that are safe to publish. Cache the request so
// the header announcement and Careers page share one network call.
let erpJobsPromise;
function loadErpJobs() {
  if (!erpJobsPromise) {
    erpJobsPromise = fetch('/api/jobs', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Vacancies feed unavailable');
        return Array.isArray(payload.jobs) ? payload.jobs : [];
      })
      .catch((error) => {
        erpJobsPromise = null;
        throw error;
      });
  }
  return erpJobsPromise;
}

let erpDesignationsPromise;
function loadErpDesignations() {
  if (!erpDesignationsPromise) {
    erpDesignationsPromise = fetch('/api/designations', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Positions list unavailable');
        return Array.isArray(payload.designations) ? payload.designations : [];
      })
      .catch((error) => {
        erpDesignationsPromise = null;
        throw error;
      });
  }
  return erpDesignationsPromise;
}

// webForm: the ERP Web Form *name* (e.g. 'contact-bci', 'job-application').
// data: { doctype, ...fields } keyed by the web form's field names.
async function submitErpWebForm(webForm, data) {
  const response = await fetch('/api/web-form-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ web_form: webForm, data }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'ERP submission failed');
  return payload;
}

if (typeof window !== 'undefined') Object.assign(window, { submitErpWebForm, loadErpJobs, loadErpDesignations });

// Google Ads lead conversion — fires only where the built pages' head snippet
// defined gtag + window.BCI_ADS_CONV (dev pages without it are a silent no-op).
function trackAdsLeadConversion() {
  try {
    if (typeof window.gtag === 'function' && window.BCI_ADS_CONV) {
      window.gtag('event', 'conversion', { send_to: window.BCI_ADS_CONV });
    }
  } catch (e) { /* analytics must never break the form */ }
}
if (typeof window !== 'undefined') window.trackAdsLeadConversion = trackAdsLeadConversion;

// ---------------- Arrow that flips in RTL ----------------
function Arrow({ size = 16 }) {
  return <span className="flip-rtl" style={{ display: 'inline-flex' }}><Icon name="arrow-right" size={size} /></span>;
}
function Chev({ size = 14 }) {
  return <span className="flip-rtl" style={{ display: 'inline-flex' }}><Icon name="chevron-right" size={size} /></span>;
}

Object.assign(window, { LangContext, useLang, useViewport, useInView, revealStyle, CountUp, t, Mark, Icon, Badge, Arrow, Chev, LANGS, pageLang, barePath, siteHref, solutionHref, selectOptionLabel, loadErpJobs, trackAdsLeadConversion });
