/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow, Chev,
   MegaHeader, PageHero, CtaBand, Footer, PROJECTS, PROJECT_SECTORS, STATS */
const { useState: useState_pr, useRef: useRef_pr, useEffect: useEffect_pr } = React;

/* Animated count-up for the stat band. Parses a value like "120+", "500+",
   "9" or "2021" into a prefix / number / suffix, then counts from 0 to the
   number once the element scrolls into view. */
function CountUp({ value, group = true, style, className, animate = true }) {
  const m = String(value).match(/^(\D*)([\d,]+)(\D*)$/);
  const prefix = m ? m[1] : '';
  const target = m ? parseInt(m[2].replace(/,/g, ''), 10) : 0;
  const suffix = m ? m[3] : '';
  const ref = useRef_pr(null);
  const [n, setN] = useState_pr(0);
  const started = useRef_pr(false);

  useEffect_pr(() => {
    if (!m || !animate) return;
    const el = ref.current;
    if (!el) return;
    let cleaned = false;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { setN(target); return; }
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setN(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.9 && r.bottom > 0;
    };
    const maybeRun = () => { if (!started.current && inView()) { run(); teardown(); } };
    const onScroll = () => maybeRun();
    const teardown = () => {
      if (cleaned) return;
      cleaned = true;
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      if (io) io.disconnect();
    };
    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(); teardown(); } });
      }, { threshold: 0.3 });
      io.observe(el);
    }
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    // Immediate check in case it's already in view.
    maybeRun();
    // Safety net: never leave the value at 0 — force the final value if
    // nothing has triggered the animation within 2.5s.
    const safety = setTimeout(() => { if (!started.current) { run(); teardown(); } }, 2500);
    return () => { clearTimeout(safety); teardown(); };
  }, [target, animate]);

  const display = group ? n.toLocaleString('en-US') : String(n);
  return <span ref={ref} className={className} style={style}>{animate ? <React.Fragment>{prefix}{m ? display : value}{suffix}</React.Fragment> : value}</span>;
}

const SECTOR_AR = { All: 'الكل', Infrastructure: 'بنية تحتية', Residential: 'سكني', Commercial: 'تجاري', Industrial: 'صناعي', Water: 'مياه' };

/* Split the system string "BC 237 polyurea tunnel lining · 42 km" into
   a system descriptor and a pulled-out scale figure. */
function splitSys(sysStr) {
  const parts = (sysStr || '').split('·').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { system: parts.slice(0, -1).join(' · '), scale: parts[parts.length - 1] };
  return { system: sysStr, scale: null };
}

/* Caption overlay for the (few) photos that arrive without baked-in text. */
function PhotoCaption({ p, big }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { system, scale } = splitSys(p.sys[lang]);
  return (
    <React.Fragment>
      <div style={{ position: 'absolute', insetInline: 0, bottom: 0, height: '70%', background: 'linear-gradient(to top, rgba(5,21,32,0.88) 8%, rgba(5,21,32,0.45) 45%, transparent)' }} />
      <div style={{ position: 'absolute', top: big ? 24 : 16, insetInlineStart: big ? 24 : 16 }}>
        <span style={{ background: 'var(--bci-green-500)', color: '#fff', padding: big ? '6px 11px' : '5px 9px', fontFamily: 'var(--ff-mono)', fontSize: big ? 11 : 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, borderRadius: 2 }}>{p.sector[lang]}</span>
      </div>
      <div style={{ position: 'absolute', insetInlineStart: big ? 28 : 20, bottom: big ? 26 : 20, insetInlineEnd: big ? 28 : 20, textAlign: isAr ? 'right' : 'left' }}>
        <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: big ? 36 : 23, lineHeight: 1.08, letterSpacing: isAr ? 0 : '-0.015em', color: '#fff', margin: '0 0 8px' }}>{p.title[lang]}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--ff-mono)', fontSize: big ? 12 : 11, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', flexDirection: isAr ? 'row-reverse' : 'row', justifyContent: isAr ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="map-pin" size={big ? 14 : 12} />{p.loc[lang]}</span>
          {scale && <span style={{ color: 'var(--bci-green-400)' }}>{scale}</span>}
        </div>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: big ? 12 : 11, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.72)', margin: '10px 0 0' }}>{system}</p>
      </div>
    </React.Fragment>
  );
}

/* Single photo-forward card. Composed images carry their own labels, so we
   only paint a caption over the clean photos. */
function PhotoCard({ p, featured }) {
  const { lang } = useLang();
  const [hover, setHover] = useState_pr(false);
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', aspectRatio: featured ? '5 / 3' : '3 / 2', overflow: 'hidden',
        background: p.swatch, borderRadius: 2, border: '1px solid var(--bci-hairline-light)',
        boxShadow: hover ? (featured ? 'var(--shadow-lg)' : 'var(--shadow-md)') : 'none',
        transform: hover && !featured ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, transform 200ms ease', cursor: 'pointer',
        gridColumn: featured ? '1 / -1' : 'auto' }}>
      <img src={p.img} alt={p.title[lang]} loading="lazy"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: featured ? 'center bottom' : 'center', display: p.noImg ? 'none' : 'block',
          transform: hover ? 'scale(1.04)' : 'scale(1)', transition: 'transform 700ms cubic-bezier(.2,.7,.2,1)' }} />
      {featured && (
        <span style={{ position: 'absolute', top: 20, insetInlineEnd: 20, background: 'var(--bci-green-500)', color: '#fff', padding: '6px 12px', fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 2, zIndex: 2 }}>{t(lang, 'Featured', 'مميّز')}</span>
      )}
      {!p.composed && <PhotoCaption p={p} big={featured} />}
      <div style={{ position: 'absolute', inset: 0, borderInlineStart: hover ? '3px solid var(--bci-green-500)' : '3px solid transparent', transition: 'border-color 160ms ease', pointerEvents: 'none' }} />
    </article>
  );
}

function MoreCard() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_pr(false);
  return (
    <a href="Contact.html" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', aspectRatio: '3 / 2', overflow: 'hidden', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none',
        background: 'var(--bci-navy)', borderRadius: 2, border: '1px solid var(--bci-navy)',
        padding: 28, textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr',
        boxShadow: hover ? 'var(--shadow-lg)' : 'none', transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, transform 200ms ease' }}>
      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--bci-green-400)' }}>
        {t(lang, '500+ projects delivered', '+500 مشروع منجز')}
      </span>
      <div>
        <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 26, lineHeight: 1.12, letterSpacing: isAr ? 0 : '-0.015em', color: '#fff', margin: '0 0 12px' }}>
          {t(lang, 'This is just a selection.', 'هذه مجرد نماذج مختارة.')}
        </h3>
        <p style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-text)', fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.74)', margin: 0 }}>
          {t(lang,
            'Contact us for project references relevant to your sector and scope.',
            'تواصل معنا للحصول على مراجع مشاريع تناسب قطاعك ونطاق عملك.')}
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, fontFamily: 'var(--ff-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: '#fff', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          {t(lang, 'Request references', 'اطلب المراجع')}
          <span style={{ display: 'inline-flex', transform: hover ? (isAr ? 'translateX(-4px)' : 'translateX(4px)') : 'none', transition: 'transform 160ms ease' }}><Arrow /></span>
        </span>
      </div>
    </a>
  );
}

function ProjectsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [filter, setFilter] = useState_pr('All');
  const list = filter === 'All' ? PROJECTS : PROJECTS.filter(p => p.sector.en === filter);
  const featured = list[0];
  const rest = list.slice(1);

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Projects', 'المشاريع')}
        crumb={t(lang, 'Projects', 'المشاريع')}
        title="Specified across the Kingdom."
        titleAr="معتمدون في أنحاء المملكة."
        subtitle={t(lang,
          'From metro tunnels to villa roofs, BCI systems protect Saudi Arabia\u2019s most demanding assets. A selection of reference projects across every sector.',
          'من أنفاق المترو إلى أسطح الفلل، تحمي أنظمة BCI أصعب الأصول في السعودية. مجموعة من المشاريع المرجعية عبر كل القطاعات.')}
      />

      {/* Stat band */}
      <section style={{ background: 'var(--bci-navy)', padding: '0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', direction: isAr ? 'rtl' : 'ltr' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '40px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: isAr ? 'right' : 'left' }}>
                <CountUp value={s.v} animate={!/^\d{4}$/.test(s.v)} group={!/^\d{4}$/.test(s.v)} className="display" style={{ display: 'block', fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 48, color: '#fff', lineHeight: 1 }} />
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--bci-green-400)', marginTop: 10 }}>{t(lang, s.en, s.ar)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + grid */}
      <section style={{ background: 'var(--bci-concrete)', padding: '88px 0 120px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              {PROJECT_SECTORS.map(sec => {
                const on = filter === sec;
                return (
                  <button key={sec} onClick={() => setFilter(sec)} style={{
                    fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
                    padding: '10px 16px', borderRadius: 2, cursor: 'pointer',
                    border: `1px solid ${on ? 'var(--bci-navy)' : 'var(--bci-hairline-light)'}`,
                    background: on ? 'var(--bci-navy)' : 'transparent', color: on ? '#fff' : 'var(--bci-navy)',
                    transition: 'all 100ms linear',
                  }}>{t(lang, sec, SECTOR_AR[sec])}</button>
                );
              })}
            </div>
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--bci-steel)', whiteSpace: 'nowrap' }}>
              {String(list.length).padStart(2, '0')} {t(lang, 'projects', 'مشروع')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {featured && <PhotoCard p={featured} featured />}
            {rest.map((p, i) => <PhotoCard key={i} p={p} />)}
            <MoreCard />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Projects" />
    <ProjectsPage />
    <CtaBand
      title="Have a project to protect?"
      titleAr="لديك مشروع تريد حمايته؟"
      body="Tell us the scope and we’ll recommend the right system, with references from similar work."
      bodyAr="أخبرنا بنطاق العمل ونوصي بالنظام المناسب مع مراجع من أعمال مماثلة." />
    <Footer />
  </LangProvider>
);
