/* global React, ReactDOM, LangContext, useLang, t, Mark, Icon, Arrow, Chev, Badge,
   NAV, SOLUTIONS, SOCIALS */
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

/* =============================================================
   LangProvider — persists EN / ES / AR across pages
   ============================================================= */
function LangProvider({ children }) {
  const [lang, setLangState] = useStateC(() => {
    try {return localStorage.getItem('bci-lang') || 'en';} catch (e) {return 'en';}
  });
  const setLang = (l) => {
    setLangState(l);
    try {localStorage.setItem('bci-lang', l);} catch (e) {}
  };
  useEffectC(() => {
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

/* =============================================================
   LanguageSelectorDropdown — globe trigger + dropdown list
   dark = on navy strip  |  light = on white/paper surface
   ============================================================= */
function LanguageSelectorDropdown({ dark }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useStateC(false);
  const [pos, setPos] = useStateC({ top: 0, right: 0 });
  const ref = useRefC(null);
  const panelRef = useRefC(null);

  const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'ar', label: 'العربية', short: 'ع' }];

  const current = languages.find((l) => l.code === lang) || languages[0];

  /* Close on outside click — ignore clicks inside the trigger OR the portalled panel */
  useEffectC(() => {
    const handler = (e) => {
      const inTrigger = ref.current && ref.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Compute portal position from trigger rect each time we open */
  const handleToggle = () => {
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
  };

  const borderCol = dark ? 'rgba(255,255,255,0.22)' : 'var(--bci-hairline-light)';
  const fgTrigger = dark ? '#fff' : 'var(--bci-navy)';
  const fgMuted = dark ? 'rgba(255,255,255,0.55)' : 'var(--bci-steel)';
  const bgDropdown = dark ? '#062338' : '#fff';
  const bgHover = dark ? 'rgba(255,255,255,0.07)' : 'var(--bci-concrete)';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>

      {/* Trigger button */}
      <button
        onClick={handleToggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: dark ? '3px 10px' : '8px 13px',
          background: 'transparent',
          border: `1px solid ${borderCol}`,
          borderRadius: 2, cursor: 'pointer',
          color: fgTrigger,
          fontFamily: 'var(--ff-mono)',
          fontSize: 10.5, fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          transition: 'border-color 100ms'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--bci-green-400)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = borderCol}>
        
        <Icon name="globe" size={12} stroke={dark ? 'var(--bci-green-400)' : 'var(--bci-navy)'} />
        <span style={{ fontFamily: current.code === 'ar' ? 'var(--ff-arabic)' : 'var(--ff-mono)' }}>
          {current.label}
        </span>
        <span style={{
          display: 'inline-flex',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 160ms'
        }}>
          <Icon name="chevron-down" size={11} />
        </span>
      </button>

      {/* Dropdown — portalled to <body> so it escapes overflow:hidden parents */}
      {open && ReactDOM.createPortal(
        <div ref={panelRef} style={{
          position: 'fixed',
          top: pos.top,
          right: pos.right,
          minWidth: 152,
          background: bgDropdown,
          border: `1px solid ${borderCol}`,
          borderTop: '2px solid var(--bci-green-500)',
          borderRadius: 2,
          boxShadow: '0 12px 40px -8px rgba(11,55,82,0.32)',
          zIndex: 99999,
          overflow: 'hidden',
          animation: 'langDropIn 120ms ease forwards'
        }}>
          {languages.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => {setLang(l.code);setOpen(false);}}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  background: active ? dark ? 'rgba(49,180,105,0.1)' : 'var(--bci-green-50)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: active ? 'var(--bci-green-500)' : dark ? 'rgba(255,255,255,0.82)' : 'var(--bci-navy)',
                  fontFamily: l.code === 'ar' ? 'var(--ff-arabic)' : 'var(--ff-sans)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: 'background 80ms'
                }}
                onMouseOver={(e) => {if (!active) e.currentTarget.style.background = bgHover;}}
                onMouseOut={(e) => {if (!active) e.currentTarget.style.background = active ? dark ? 'rgba(49,180,105,0.1)' : 'var(--bci-green-50)' : 'transparent';}}>
                
                <span style={{
                  fontFamily: 'var(--ff-mono)', fontSize: 9.5, letterSpacing: '0.12em',
                  textTransform: 'uppercase', minWidth: 20,
                  color: active ? 'var(--bci-green-500)' : fgMuted
                }}>
                  {l.short}
                </span>
                <span style={{ flex: 1 }}>{l.label}</span>
                {active && <Icon name="check" size={13} stroke="var(--bci-green-500)" />}
              </button>);

          })}
        </div>,
        document.body
      )}
    </div>);

}

/* =============================================================
   MegaHeader
   ============================================================= */
function MegaHeader({ active }) {
  const { lang } = useLang();
  const { isMobile } = useViewport();
  const [prog, setProg] = useStateC(0);
  const [mega, setMega] = useStateC(false);
  const [drawer, setDrawer] = useStateC(false);

  useEffectC(() => {
    const START = 64,END = 230;
    let raf = null;
    const compute = () => {
      const y = window.scrollY;
      setProg(Math.min(1, Math.max(0, (y - START) / (END - START))));
      raf = null;
    };
    const onScroll = () => {if (raf == null) raf = requestAnimationFrame(compute);};
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {window.removeEventListener('scroll', onScroll);if (raf) cancelAnimationFrame(raf);};
  }, []);

  useEffectC(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = prev;};
  }, [drawer]);
  useEffectC(() => {if (!isMobile && drawer) setDrawer(false);}, [isMobile, drawer]);

  const isAr = lang === 'ar';
  const ease = prog * prog * (3 - 2 * prog);
  const barH = 86 - 22 * ease;
  const stripH = 38 * (1 - ease);
  const logoScale = 1 - 0.18 * ease;
  const fg = 'var(--bci-navy)';
  const mBarH = isMobile ? 62 : barH;
  const mLogoScale = isMobile ? 0.9 : logoScale;

  return (
    <header
      onMouseLeave={() => setMega(false)}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, fontFamily: 'var(--ff-sans)' }}>

      {/* Top utility strip — desktop only */}
      {!isMobile &&
      <div style={{
        background: 'var(--bci-navy)',
        height: stripH, overflow: 'hidden',
        borderBottom: `1px solid rgba(30,77,110,${1 - ease})`
      }}>
          <div className="container" style={{
          height: 38, opacity: 1 - ease, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexDirection: isAr ? 'row-reverse' : 'row'
        }} data-comment-anchor="7d11a4c47f-div-66-9">
            {/* Left: brand credential + email */}
            <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <img src="assets/saudi-made-bi-white.svg"
            alt={t(lang, 'Saudi Made', 'صُنع في السعودية', 'Hecho en Arabia Saudita')}
            style={{ height: 22, width: 'auto', display: 'block', flexShrink: 0 }} />
              <a href="mailto:info@bcisaudi.com" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
              fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.72)', whiteSpace: 'nowrap',
              transition: 'color 100ms linear'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--bci-green-400)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.72)'}>
                <Icon name="mail" size={13} stroke="var(--bci-green-400)" />
                info@bcisaudi.com
              </a>
            </div>
            {/* Right: location · phone · language */}
            <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap'
            }}>
                <Icon name="map-pin" size={13} stroke="var(--bci-green-400)" />
                {t(lang, 'Dammam, KSA', 'الدمام، السعودية', 'Dammam, Arabia Saudita')}
              </span>
              <a href="tel:+966593120221" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
              fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap',
              transition: 'color 100ms linear'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--bci-green-400)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.88)'}>
                <Icon name="phone" size={13} stroke="var(--bci-green-400)" />
                +966 59 312 0221
              </a>
              <LanguageSelectorDropdown dark />
            </div>
          </div>
        </div>
      }

      {/* Main bar */}
      <div style={{
        background: 'var(--bci-paper-pure)',
        borderBottom: '1px solid var(--bci-hairline-light)',
        boxShadow: `0 ${4 * ease}px ${24 * ease}px -12px rgba(11,55,82,${0.2 * ease}), 0 1px 0 rgba(11,55,82,.04)`
      }}>
        <div className="container" style={{
          height: mBarH, display: 'flex', alignItems: 'center', gap: 36,
          flexDirection: isAr ? 'row-reverse' : 'row'
        }} data-comment-anchor="c42846d29e-div-259-9">
          <a href="index.html" aria-label="BCI — home" style={{
            display: 'flex', alignItems: 'center', gap: 13, textDecoration: 'none',
            transform: `scale(${mLogoScale})`,
            transformOrigin: isAr ? 'right center' : 'left center',
            flexShrink: 0
          }}>
            <img src="assets/BCI-lockup-color.png" alt="BCI — Building Chemistry Industry"
            style={{ height: 46, width: 'auto', display: 'block' }} />
          </a>

          {!isMobile &&
          <nav style={{
            display: 'flex', gap: 30, margin: '0 auto', alignItems: 'center',
            flexDirection: isAr ? 'row-reverse' : 'row'
          }}>
              {NAV.map((n) => {
              const isActive = active === n.en;
              const label = n[lang] || n.en;
              const common = {
                fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)',
                fontSize: 17, fontWeight: 500, color: isActive ? 'var(--bci-green-600)' : fg,
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'color 100ms linear',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                cursor: 'pointer', paddingBottom: 2,
                borderBottom: isActive ? '2px solid var(--bci-green-500)' : '2px solid transparent'
              };
              if (n.mega) {
                return <SolutionsNavItem key={n.en} n={n} fg={fg} barH={barH} isActive={isActive} open={mega} setOpen={setMega} />;
              }
              return (
                <a key={n.en} href={n.href}
                onMouseEnter={() => setMega(false)}
                style={common}
                onMouseOver={(e) => {if (!isActive) e.currentTarget.style.color = 'var(--bci-green-600)';}}
                onMouseOut={(e) => {if (!isActive) e.currentTarget.style.color = fg;}}>
                    {label}
                  </a>);

            })}
            </nav>
          }

          {!isMobile ?
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <a href="Contact.html" className="btn btn-accent" style={{ padding: '12px 20px' }}>
                {t(lang, 'Get a Quote', 'اطلب عرض سعر', 'Solicitar Cotización')}
              </a>
            </div> :

          <button onClick={() => setDrawer(true)}
          aria-label={t(lang, 'Open menu', 'افتح القائمة', 'Abrir menú')}
          style={{
            marginInlineStart: 'auto',
            width: 44, height: 44, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
            color: 'var(--bci-navy)', cursor: 'pointer'
          }}>
              <Icon name="menu" size={22} stroke="var(--bci-navy)" />
            </button>
          }
        </div>
      </div>

      {isMobile && <MobileMenu open={drawer} onClose={() => setDrawer(false)} active={active} />}
    </header>);

}

/* =============================================================
   MobileMenu
   ============================================================= */
function MobileMenu({ open, onClose, active }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [solOpen, setSolOpen] = useStateC(false);

  const linkBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '17px 4px', textDecoration: 'none',
    fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)',
    fontSize: 19, fontWeight: 600,
    borderBottom: '1px solid var(--bci-hairline-light)',
    flexDirection: isAr ? 'row-reverse' : 'row'
  };

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(6,35,56,0.55)',
        backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 240ms ease'
      }} />

      <aside dir={isAr ? 'rtl' : 'ltr'} style={{
        position: 'fixed', top: 0, bottom: 0,
        [isAr ? 'left' : 'right']: 0, zIndex: 301,
        width: 'min(380px, 86vw)', background: 'var(--bci-paper-pure)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 60px -10px rgba(6,35,56,0.5)',
        transform: open ? 'none' : `translateX(${isAr ? '-' : ''}104%)`,
        transition: 'transform 300ms cubic-bezier(.16,.84,.34,1)',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--bci-hairline-light)',
          position: 'sticky', top: 0, background: 'var(--bci-paper-pure)', zIndex: 2,
          flexDirection: isAr ? 'row-reverse' : 'row'
        }}>
          <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <img src="assets/BCI-lockup-color.png" alt="BCI" style={{ height: 36, width: 'auto', display: 'block' }} />
          </a>
          <button onClick={onClose}
          aria-label={t(lang, 'Close menu', 'إغلاق القائمة', 'Cerrar menú')}
          style={{
            width: 42, height: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
            color: 'var(--bci-navy)', cursor: 'pointer'
          }}>
            <Icon name="x" size={20} stroke="var(--bci-navy)" />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '10px 22px 4px' }}>
          {NAV.map((n) => {
            const isActive = active === n.en;
            const color = isActive ? 'var(--bci-green-600)' : 'var(--bci-navy)';
            const label = n[lang] || n.en;
            if (n.mega) {
              return (
                <div key={n.en} style={{ borderBottom: '1px solid var(--bci-hairline-light)' }}>
                  <button onClick={() => setSolOpen((v) => !v)} style={{
                    ...linkBase, width: '100%', border: 0, borderBottom: 0, background: 'transparent',
                    color, cursor: 'pointer', textAlign: isAr ? 'right' : 'left'
                  }}>
                    <span>{label}</span>
                    <span className="flip-rtl" style={{ display: 'inline-flex', transform: solOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms', color: 'var(--bci-steel)' }}>
                      <Icon name="chevron-down" size={18} />
                    </span>
                  </button>
                  {solOpen &&
                  <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column' }}>
                      {SOLUTIONS.map((s) =>
                    <a key={s.slug} href={`Solution Detail.html?cat=${s.slug}`} onClick={onClose} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 6px', textDecoration: 'none',
                      color: 'var(--bci-navy)', fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)', fontSize: 15, fontWeight: 500,
                      flexDirection: isAr ? 'row-reverse' : 'row'
                    }}>
                          <Icon name={s.icon} size={17} stroke="var(--bci-green-600)" />
                          <span style={{ flex: 1 }}>{(s[lang] || s.en).name}</span>
                        </a>
                    )}
                      <a href="Solutions.html" onClick={onClose} style={{
                      padding: '12px 6px 4px', textDecoration: 'none', color: 'var(--bci-green-700)',
                      fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500
                    }}>{t(lang, 'View all solutions →', 'كل الحلول ←', 'Ver todas las soluciones →')}</a>
                    </div>
                  }
                </div>);

            }
            return (
              <a key={n.en} href={n.href} onClick={onClose} style={{ ...linkBase, color }}>
                <span>{label}</span>
                {isActive && <span style={{ width: 7, height: 7, background: 'var(--bci-green-500)', flexShrink: 0 }} />}
              </a>);

          })}
        </nav>

        {/* CTA + utilities */}
        <div style={{ padding: '20px 22px 28px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <a href="Contact.html" className="btn btn-accent" style={{ justifyContent: 'center', padding: '15px 22px' }}>
            {t(lang, 'Get a Quote', 'اطلب عرض سعر', 'Solicitar Cotización')}
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="tel:+966593120221" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'var(--bci-navy)', fontFamily: 'var(--ff-mono)', fontSize: 13, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <Icon name="phone" size={15} stroke="var(--bci-green-600)" /> +966 59 312 0221
            </a>
            <a href="mailto:info@bcisaudi.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'var(--bci-navy)', fontFamily: 'var(--ff-mono)', fontSize: 13, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <Icon name="mail" size={15} stroke="var(--bci-green-600)" /> info@bcisaudi.com
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--bci-steel)', fontFamily: 'var(--ff-mono)', fontSize: 13, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <Icon name="map-pin" size={15} stroke="var(--bci-green-600)" />
              {t(lang, 'Dammam, KSA', 'الدمام، السعودية', 'Dammam, Arabia Saudita')}
            </span>
          </div>
          <LanguageSelectorDropdown dark={false} />
        </div>
      </aside>
    </>);

}

function SolutionsNavItem({ n, fg, barH = 72, isActive, open, setOpen }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [cat, setCat] = useStateC(0);
  const label = n[lang] || n.en;
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: 'relative', height: barH, display: 'flex', alignItems: 'center' }}>
      <a href={n.href} style={{
        fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)', fontSize: 17, fontWeight: 500,
        color: isActive || open ? 'var(--bci-green-600)' : fg, textDecoration: 'none', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', paddingBottom: 2,
        borderBottom: isActive ? '2px solid var(--bci-green-500)' : '2px solid transparent',
        transition: 'color 100ms linear'
      }}>
        {label}
        <span className="flip-rtl" style={{ display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms' }}>
          <Icon name="chevron-down" size={14} />
        </span>
      </a>
      {open && <SolutionsDropdown cat={cat} setCat={setCat} isAr={isAr} onNav={() => setOpen(false)} />}
    </div>);

}

function SolutionsDropdown({ cat, setCat, isAr, onNav }) {
  const { lang } = useLang();
  const active = SOLUTIONS[cat];
  return (
    <div style={{
      position: 'absolute', top: '100%', [isAr ? 'right' : 'left']: -16,
      display: 'flex', alignItems: 'flex-start',
      direction: isAr ? 'rtl' : 'ltr',
      filter: 'drop-shadow(0 18px 40px rgba(11,55,82,.22))'
    }}>
      {/* Category list */}
      <div style={{
        width: 320, background: 'var(--bci-concrete)',
        border: '1px solid var(--bci-hairline-light)', borderTopWidth: 2, borderTopColor: 'var(--bci-green-500)',
        padding: '8px 0'
      }}>
        {SOLUTIONS.map((s, i) => {
          const on = i === cat;
          const sName = (s[lang] || s.en).name;
          return (
            <a key={s.slug} href={`Solution Detail.html?cat=${s.slug}`}
            onMouseEnter={() => setCat(i)} onClick={onNav}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', textDecoration: 'none',
              background: on ? 'var(--bci-paper-pure)' : 'transparent',
              color: on ? 'var(--bci-green-700)' : 'var(--bci-navy)',
              borderLeft: !isAr ? `3px solid ${on ? 'var(--bci-green-500)' : 'transparent'}` : 'none',
              borderRight: isAr ? `3px solid ${on ? 'var(--bci-green-500)' : 'transparent'}` : 'none',
              transition: 'all 100ms linear'
            }}>
              <Icon name={s.icon} size={17} stroke={on ? 'var(--bci-green-600)' : 'var(--bci-steel)'} />
              <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1, fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)', lineHeight: 1.25 }}>{sName}</span>
              <span className="flip-rtl" style={{ color: on ? 'var(--bci-green-500)' : 'var(--bci-steel-300)', display: 'inline-flex' }}><Chev size={13} /></span>
            </a>);

        })}
        <a href="Solutions.html" onClick={onNav} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          margin: '8px 0 0', padding: '12px 18px', borderTop: '1px solid var(--bci-hairline-light)',
          textDecoration: 'none', color: 'var(--bci-navy)',
          fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500
        }}>
          {t(lang, 'View all solutions', 'كل الحلول', 'Ver todas las soluciones')}
          <span className="flip-rtl" style={{ display: 'inline-flex' }}><Arrow size={13} /></span>
        </a>
      </div>

      {/* Product flyout */}
      <div style={{
        width: 300, alignSelf: 'stretch', background: 'var(--bci-paper-pure)',
        borderTop: '2px solid var(--bci-green-500)', borderRight: '1px solid var(--bci-hairline-light)',
        borderBottom: '1px solid var(--bci-hairline-light)',
        borderLeft: isAr ? '1px solid var(--bci-hairline-light)' : 'none',
        padding: '18px 22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="eyebrow" style={{ color: 'var(--bci-green-600)', fontSize: 10 }}>
            {t(lang, 'Products', 'المنتجات', 'Productos')}
          </div>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, color: 'var(--bci-steel)' }}>{active.products.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {active.products.map((p) =>
          <a key={p.code} href={`Solution Detail.html?cat=${active.slug}`} onClick={onNav}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 2,
            textDecoration: 'none', color: 'var(--bci-navy)', transition: 'background 100ms linear'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bci-concrete)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 9.5, color: 'var(--bci-steel)', minWidth: 62, letterSpacing: '0.04em', flexShrink: 0 }}>{p.code}</span>
              <span style={{ fontSize: 13, fontWeight: 500, fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)', whiteSpace: 'nowrap' }}>
                {(p[lang] || p.en).name}
              </span>
            </a>
          )}
        </div>
      </div>
    </div>);

}

/* =============================================================
   PageHero
   ============================================================= */
function PageHero({ eyebrow, title, titleAr, titleEs, subtitle, crumb }) {
  const { lang } = useLang();
  const { isMobile } = useViewport();
  const isAr = lang === 'ar';
  const heroTitle = isAr ? titleAr : lang === 'es' ? titleEs || title : title;
  return (
    <section style={{
      position: 'relative', background: 'var(--bci-navy)', color: '#fff',
      paddingTop: isMobile ? 104 : 176, paddingBottom: isMobile ? 52 : 72, overflow: 'hidden',
      borderBottom: '1px solid var(--bci-green-500)'
    }}>
      <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
      <svg viewBox="0 0 200 200" style={{ position: 'absolute', right: -40, bottom: -60, width: 420, height: 420, opacity: 0.08 }} aria-hidden="true">
        <rect x="20" y="20" width="80" height="80" stroke="var(--bci-green-400)" strokeWidth="3" fill="none" />
        <rect x="80" y="80" width="80" height="80" stroke="#fff" strokeWidth="3" fill="none" />
      </svg>
      <div className="container" style={{ position: 'relative', textAlign: isAr ? 'right' : 'left' }}>
        <nav aria-label="Breadcrumb" style={{
          display: 'flex', gap: 10, alignItems: 'center', marginBottom: 28,
          flexDirection: isAr ? 'row-reverse' : 'row',
          fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase'
        }}>
          <a href="index.html" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            {t(lang, 'Home', 'الرئيسية', 'Inicio')}
          </a>
          <span className="flip-rtl" style={{ color: 'rgba(255,255,255,0.35)' }}><Chev size={11} /></span>
          <span style={{ color: 'var(--bci-green-400)' }}>{crumb || heroTitle}</span>
        </nav>
        {eyebrow && <div className="eyebrow" style={{ color: 'var(--bci-green-400)', marginBottom: 18 }}>{eyebrow}</div>}
        <h1 className="display" style={{
          fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
          fontSize: 'clamp(44px, 5.2vw, 76px)', lineHeight: isAr ? 1.15 : 1.02,
          letterSpacing: isAr ? 0 : '-0.02em', color: '#fff', margin: 0, maxWidth: 1000
        }}>{heroTitle}</h1>
        {subtitle && <p style={{
          fontSize: 18, lineHeight: 1.55, color: 'rgba(255,255,255,0.68)',
          margin: '24px 0 0', maxWidth: 680, marginLeft: isAr ? 'auto' : 0
        }}>{subtitle}</p>}
      </div>
    </section>);

}

/* =============================================================
   CtaBand
   ============================================================= */
function CtaBand({ title, titleAr, titleEs, body, bodyAr, bodyEs }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [ref, inView] = useInView();
  const ctaTitle = isAr ? titleAr || 'جاهز للمواصفة؟' : lang === 'es' ? titleEs || title || '¿Listo para especificar?' : title || 'Ready to specify?';
  const ctaBody = isAr ? bodyAr || 'اطلب وثائق المواصفات أو نزّل دليل المنتجات الكامل.' : lang === 'es' ? bodyEs || body || 'Solicite un paquete o descargue nuestro catálogo completo.' : body || 'Request a submittal package or download our full product catalog.';
  return (
    <section ref={ref} style={{
      background: 'var(--bci-green-500)', color: '#fff', padding: '110px 0',
      position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--bci-green-600)', borderBottom: '1px solid var(--bci-green-600)'
    }}>
      <svg viewBox="0 0 200 200" style={{ position: 'absolute', right: -30, top: -30, width: 300, height: 300, opacity: 0.12 }} aria-hidden="true">
        <rect x="20" y="20" width="80" height="80" stroke="#fff" strokeWidth="2" fill="none" />
        <rect x="80" y="80" width="80" height="80" stroke="#fff" strokeWidth="2" fill="none" />
      </svg>
      <div className="container" style={{ position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)', ...revealStyle(inView, 0) }}>
          {t(lang, 'Ready to build', 'جاهز للبناء', 'Listo para construir')}
        </div>
        <h2 className="display" style={{
          fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
          fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: isAr ? 1.15 : 1,
          letterSpacing: isAr ? 0 : '-0.02em', color: '#fff', margin: 0, maxWidth: 900, ...revealStyle(inView, 90)
        }}>{ctaTitle}</h2>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: 'rgba(255,255,255,0.9)', margin: '0 0 8px', maxWidth: 620, ...revealStyle(inView, 170) }}>
          {ctaBody}
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', ...revealStyle(inView, 250) }}>
          <a href="Contact.html" className="btn btn-navy">
            {t(lang, 'Request Submittal', 'طلب الوثائق', 'Solicitar Documentación')}
          </a>
          <a href="Resources.html" className="btn btn-ghost-light">
            <Icon name="download" size={14} />
            {t(lang, 'Download Catalog', 'تحميل الدليل', 'Descargar Catálogo')}
          </a>
        </div>
      </div>
    </section>);

}

/* =============================================================
   Footer
   ============================================================= */
function Footer() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const cols = [
  {
    title: { en: 'Solutions', ar: 'الحلول', es: 'Soluciones' },
    links: SOLUTIONS.slice(0, 6).map((s) => ({
      en: s.en.name, ar: s.ar.name, es: (s.es || s.en).name,
      href: `Solution Detail.html?cat=${s.slug}`
    }))
  },
  {
    title: { en: 'Resources', ar: 'الموارد', es: 'Recursos' },
    links: [
    { en: 'TDS Library', ar: 'مكتبة النشرات الفنية', es: 'Biblioteca Fichas Técnicas', href: 'Resources.html' },
    { en: 'SDS Library', ar: 'مكتبة نشرات السلامة', es: 'Biblioteca Fichas Seguridad', href: 'Resources.html' },
    { en: 'Product Catalog', ar: 'دليل المنتجات', es: 'Catálogo de Productos', href: 'Resources.html' },
    { en: 'Certifications', ar: 'الشهادات', es: 'Certificaciones', href: 'Resources.html' }]

  },
  {
    title: { en: 'Company', ar: 'الشركة', es: 'Empresa' },
    links: [
    { en: 'About BCI', ar: 'عن BCI', es: 'Acerca de BCI', href: 'About.html' },
    { en: 'Projects', ar: 'المشاريع', es: 'Proyectos', href: 'Projects.html' },
    { en: 'Careers', ar: 'الوظائف', es: 'Empleo', href: 'Career.html' },
    { en: 'Contact', ar: 'تواصل', es: 'Contacto', href: 'Contact.html' }]

  },
  {
    title: { en: 'Contact', ar: 'تواصل', es: 'Contacto' },
    links: [
    { en: '+966 59 312 0221', ar: '+966 59 312 0221', es: '+966 59 312 0221', href: 'tel:+966593120221', mono: true },
    { en: 'info@bcisaudi.com', ar: 'info@bcisaudi.com', es: 'info@bcisaudi.com', href: 'mailto:info@bcisaudi.com', mono: true },
    { en: 'WhatsApp', ar: 'واتساب', es: 'WhatsApp', href: 'https://wa.me/966593120221' },
    { en: 'Get a Quote', ar: 'اطلب عرض سعر', es: 'Solicitar Cotización', href: 'Contact.html' }]

  }];


  return (
    <footer style={{ background: 'var(--bci-navy-800)', color: '#fff', padding: '88px 0 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: 40, marginBottom: 56, direction: isAr ? 'rtl' : 'ltr' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <img src="assets/BCI-lockup-white.png" alt="BCI" style={{ height: 38, width: 'auto', display: 'block' }} />
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', marginBottom: 20, maxWidth: 280 }}>
              {t(lang, 'Building Chemistry Industry', 'صناعة كيمياء البناء', 'Industria Química de la Construcción')}<br />
              {t(lang, '3rd Industrial City, Dammam 34223', 'المدينة الصناعية الثالثة، الدمام 34223', '3.ª Ciudad Industrial, Dammam 34223')}<br />
              {t(lang, 'Kingdom of Saudi Arabia', 'المملكة العربية السعودية', 'Reino de Arabia Saudita')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
              <img src="assets/saudi-made-bi-white.svg"
              alt={t(lang, 'Saudi Made', 'صُنع في السعودية', 'Hecho en Arabia Saudita')}
              style={{ height: 44, width: 'auto', display: 'block' }} />
              <img src="assets/vision-2030-white.svg"
              alt={t(lang, 'Saudi Vision 2030', 'رؤية السعودية 2030', 'Visión Saudi 2030')}
              style={{ height: 56, width: 'auto', display: 'block' }} data-comment-anchor="f36c32a0c4-img-722-15" />
            </div>
          </div>
          {cols.map((col) =>
          <div key={col.title.en}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--bci-green-400)', fontWeight: 500, marginBottom: 18 }}>
                {t(lang, col.title.en, col.title.ar, col.title.es)}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((l, i) =>
              <li key={i}>
                    <a href={l.href} style={{
                  fontFamily: l.mono ? 'var(--ff-mono)' : isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)',
                  fontSize: l.mono ? 13 : 14, color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                  transition: 'color 100ms linear', letterSpacing: l.mono ? '0.02em' : 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--bci-green-400)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
                      {t(lang, l.en, l.ar, l.es)}
                    </a>
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>
        <div style={{ paddingTop: 24, paddingBottom: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}>
            {t(lang,
            '© 2026 Building Chemistry Industry. All rights reserved.',
            '© 2026 صناعة كيمياء البناء. جميع الحقوق محفوظة.',
            '© 2026 Industria Química de la Construcción. Todos los derechos reservados.'
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {SOCIALS.map((s) =>
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} style={{
              width: 36, height: 36, borderRadius: 2, border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              transition: 'all 100ms linear'
            }}
            onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--bci-green-400)';e.currentTarget.style.borderColor = 'var(--bci-green-500)';}}
            onMouseLeave={(e) => {e.currentTarget.style.color = 'rgba(255,255,255,0.7)';e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';}}>
                <Icon name={s.name} size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>);

}

/* Section heading helper */
function SectionHead({ num, label, labelAr, labelEs, title, titleAr, titleEs, dark, link, linkHref, max }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const sLabel = isAr ? labelAr : lang === 'es' ? labelEs || label : label;
  const sTitle = isAr ? titleAr : lang === 'es' ? titleEs || title : title;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 56, flexDirection: isAr ? 'row-reverse' : 'row' }}>
      <div style={{ textAlign: isAr ? 'right' : 'left' }}>
        <div className="sec-num" style={{ color: dark ? 'var(--bci-green-400)' : 'var(--bci-steel)', marginBottom: 22 }}>
          {num ? `${num} — ` : ''}{sLabel}
        </div>
        <h2 className="display" style={{
          fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
          fontSize: 'clamp(36px, 4.2vw, 60px)', lineHeight: isAr ? 1.15 : 1.03,
          letterSpacing: isAr ? 0 : '-0.018em', color: dark ? '#fff' : 'var(--bci-navy)',
          margin: 0, maxWidth: max || 760
        }}>{sTitle}</h2>
      </div>
      {link && <a href={linkHref} className={`link-arrow${dark ? ' on-dark' : ''}`} style={{ whiteSpace: 'nowrap' }}>{t(lang, link, link, link)} <Arrow size={14} /></a>}
    </div>);

}

Object.assign(window, { LangProvider, MegaHeader, MobileMenu, SolutionsNavItem, SolutionsDropdown, PageHero, CtaBand, Footer, SectionHead });