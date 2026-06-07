/* global React, useLang, t, Icon, Badge, Arrow, Chev, SOLUTIONS, PROJECTS */
const { useState: useState_p, useRef: useRef_p, useEffect: useEffect_p } = React;

// Reveal a section's children once it scrolls into view (one-shot, respects reduced-motion).
// Uses a scroll/rect check (robust everywhere) with IntersectionObserver as an enhancement.
function useInView(margin) {
  const ref = useRef_p(null);
  const [inView, setInView] = useState_p(false);
  useEffect_p(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setInView(true); return; }
    const m = margin || 80;
    let done = false;
    let rafId = null;
    const reveal = () => { if (!done) { done = true; setInView(true); cleanup(); } };
    const check = () => {
      if (done || !ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh - m && r.bottom > 0) { reveal(); return true; }
      return false;
    };
    // rAF polling loop — robust where scroll events / IO callbacks aren't delivered.
    const loop = () => { if (done) return; if (!check()) rafId = requestAnimationFrame(loop); };
    let obs;
    if (typeof IntersectionObserver !== 'undefined') {
      obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) reveal(); });
      }, { threshold: 0.1 });
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

// ---------- 03 · Solutions overview (home) ----------
function SolutionsOverview() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [gridRef, inView] = useInView(0.12);
  const [headRef, headIn] = useInView(0.12);
  return (
    <section id="solutions" style={{ background: 'var(--bci-concrete)', padding: '140px 0' }}>
      <div className="container" data-comment-anchor="abe5b6fd16-div-10-7">
        <div ref={headRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 32, flexDirection: isAr ? 'row-reverse' : 'row', ...revealStyle(headIn, 0) }}>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22 }}>{t(lang, 'Solutions', 'الحلول', 'Soluciones')}</div>
            <h2 className="display" style={{
              fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
              fontSize: 'clamp(40px, 4.4vw, 64px)', lineHeight: isAr ? 1.15 : 1.02,
              letterSpacing: isAr ? 0 : '-0.018em', color: 'var(--bci-navy)', margin: 0, maxWidth: 760
            }}>{t(lang, <>Engineered Solutions For<br />Demanding Projects</>, <>تسعة خطوط حلول.<br />معيار واحد.</>, <>Soluciones de Ingeniería Para<br />Proyectos Exigentes</>)}</h2>
          </div>
          <a href="Solutions.html" className="link-arrow" style={{ whiteSpace: 'nowrap' }}>
            {t(lang, 'All solutions', 'كل الحلول', 'Todas las soluciones')} <Arrow size={14} />
          </a>
        </div>

        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {SOLUTIONS.map((s, i) => (
            <div key={s.slug} style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(22px)',
              transition: `opacity 560ms cubic-bezier(.2,.7,.2,1) ${i * 80}ms, transform 560ms cubic-bezier(.2,.7,.2,1) ${i * 80}ms`,
              display: 'flex', flexDirection: 'column'
            }}>
              <SolutionCard s={s} />
            </div>
          ))}
        </div>
      </div>
    </section>);

}

function SolutionCard({ s }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_p(false);
  return (
    <a href={`Solution Detail.html?cat=${s.slug}`}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{
      position: 'relative', overflow: 'hidden',
      background: '#fff', border: `1px solid ${hover ? 'var(--bci-navy)' : 'var(--bci-hairline-light)'}`,
      borderRadius: 2, padding: 28, transition: 'border-color 160ms ease, box-shadow 200ms ease, transform 200ms ease',
      boxShadow: hover ? 'var(--shadow-md)' : 'none', transform: hover ? 'translateY(-3px)' : 'translateY(0)',
      display: 'flex', flexDirection: 'column', minHeight: 268, textDecoration: 'none',
      textAlign: isAr ? 'right' : 'left'
    }}>
      {/* top accent rule that grows on hover */}
      <span style={{ position: 'absolute', top: 0, insetInlineStart: 0, height: 3, width: hover ? '100%' : 0, background: 'var(--bci-green-500)', transition: 'width 280ms cubic-bezier(.2,.7,.2,1)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div style={{ width: 52, height: 52, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: hover ? 'var(--bci-green-500)' : 'var(--bci-navy)', transition: 'background 160ms ease' }}>
          <Icon name={s.icon} size={24} />
        </div>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 34, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: hover ? 'var(--bci-navy)' : 'var(--bci-hairline-light)', transition: 'color 160ms ease' }}>{s.num}</span>
      </div>
      <h3 style={{
        fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 23,
        lineHeight: 1.15, letterSpacing: isAr ? 0 : '-0.01em', color: 'var(--bci-navy)', margin: '0 0 12px'
      }}>{(s[lang] || s.en).name}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--bci-steel)', margin: 0, flex: 1 }}>{(s[lang] || s.en).tagline}</p>
      <div style={{ paddingTop: 18, marginTop: 18, borderTop: '1px solid var(--bci-hairline-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, color: hover ? 'var(--bci-green-600)' : 'var(--bci-steel)', transition: 'color 160ms ease' }}>{t(lang, 'Explore', 'استكشف', 'Explorar')}</span>
        <span className="flip-rtl" style={{ color: hover ? 'var(--bci-green-500)' : 'var(--bci-navy)', display: 'inline-flex', transform: hover ? (isAr ? 'translateX(-4px)' : 'translateX(4px)') : 'none', transition: 'transform 160ms ease, color 160ms ease' }}><Arrow size={15} /></span>
      </div>
    </a>);

}

// ---------- 04 · Projects (home preview, data-driven) ----------
function Projects({ limit }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const list = limit ? PROJECTS.slice(0, limit) : PROJECTS;
  const [headRef, headIn] = useInView(0.12);
  const [gridRef, gridIn] = useInView(0.12);
  return (
    <section id="projects" style={{ background: 'var(--bci-paper)', padding: '140px 0' }}>
      <div className="container">
        <div ref={headRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 32, flexDirection: isAr ? 'row-reverse' : 'row', ...revealStyle(headIn, 0) }}>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22 }}>{t(lang, 'Projects', 'المشاريع', 'Proyectos')}</div>
            <h2 className="display" style={{
              fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
              fontSize: 'clamp(40px, 4.4vw, 64px)', lineHeight: isAr ? 1.15 : 1.02,
              letterSpacing: isAr ? 0 : '-0.018em', color: 'var(--bci-navy)', margin: 0
            }}>{t(lang, 'Where BCI Solutions Perform', 'حيث تثبت حلول BCI جدارتها', 'Donde Rinden las Soluciones BCI')}</h2>
          </div>
          <a href="Projects.html" className="link-arrow" style={{ whiteSpace: 'nowrap' }}>{t(lang, 'View all projects', 'كل المشاريع', 'Ver todos los proyectos')} <Arrow size={14} /></a>
        </div>
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {list.map((p, i) => <div key={i} style={revealStyle(gridIn, i * 110)}><ProjectCard p={p} /></div>)}
        </div>
      </div>
    </section>);

}

function ProjectCard({ p }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_p(false);
  // Pull a scale figure off the system string for the caption on clean photos.
  const parts = (p.sys[lang] || p.sys.en || '').split('·').map((s) => s.trim()).filter(Boolean);
  const system = parts.length >= 2 ? parts.slice(0, -1).join(' · ') : p.sys[lang] || p.sys.en;
  const scale = parts.length >= 2 ? parts[parts.length - 1] : null;
  return (
    <a href="Projects.html" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{ textDecoration: 'none', display: 'block', position: 'relative', aspectRatio: '3 / 2',
      background: p.swatch, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--bci-hairline-light)',
      boxShadow: hover ? 'var(--shadow-md)' : 'none', transform: hover ? 'translateY(-3px)' : 'translateY(0)',
      transition: 'box-shadow 200ms ease, transform 200ms ease' }}>
      <img src={p.img} alt={p.title[lang] || p.title.en} loading="lazy"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        transform: hover ? 'scale(1.04)' : 'scale(1)', transition: 'transform 700ms cubic-bezier(.2,.7,.2,1)' }} />
      {!p.composed &&
      <React.Fragment>
          <div style={{ position: 'absolute', insetInline: 0, bottom: 0, height: '70%', background: 'linear-gradient(to top, rgba(5,21,32,0.88) 8%, rgba(5,21,32,0.45) 45%, transparent)' }} />
          <div style={{ position: 'absolute', top: 16, insetInlineStart: 16 }}>
            <span style={{ background: 'var(--bci-green-500)', color: '#fff', padding: '5px 9px', fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, borderRadius: 2 }}>{p.sector[lang] || p.sector.en}</span>
          </div>
          <div style={{ position: 'absolute', insetInlineStart: 20, insetInlineEnd: 20, bottom: 20, textAlign: isAr ? 'right' : 'left' }}>
            <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 23, lineHeight: 1.08, letterSpacing: isAr ? 0 : '-0.015em', color: '#fff', margin: '0 0 8px' }}>{p.title[lang] || p.title.en}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', flexDirection: isAr ? 'row-reverse' : 'row', justifyContent: isAr ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="map-pin" size={12} />{p.loc[lang] || p.loc.en}</span>
              {scale && <span style={{ color: 'var(--bci-green-400)' }}>{scale}</span>}
            </div>
            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.72)', margin: '10px 0 0' }}>{system}</p>
          </div>
        </React.Fragment>
      }
      <div style={{ position: 'absolute', inset: 0, borderInlineStart: hover ? '3px solid var(--bci-green-500)' : '3px solid transparent', transition: 'border-color 160ms ease', pointerEvents: 'none' }} />
    </a>);

}

Object.assign(window, { SolutionsOverview, SolutionCard, Projects, ProjectCard });