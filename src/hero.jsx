/* global React, useLang, t, Mark, Icon, Arrow */

function SkylineBg({ overlayOpacity = 0.55 }) {
  // Stylized Riyadh skyline at golden hour
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #1a2540 0%, #3a3a52 28%, #8a5a3e 58%, #d89557 80%, #e8b06b 100%)'
      }} />
      {/* Sun haze */}
      <div style={{
        position: 'absolute', right: '18%', bottom: '28%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,210,140,.55) 0%, rgba(232,176,107,0) 70%)',
        filter: 'blur(8px)'
      }} />
      {/* Distant haze / dust */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '20%', height: '40%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(180,130,80,.25) 70%, rgba(120,80,50,.45) 100%)'
      }} />
      {/* Skyline silhouette */}
      <svg viewBox="0 0 1920 600" preserveAspectRatio="xMidYMax slice"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '55%' }}
      aria-hidden="true">
        {/* Far layer — pale */}
        <g fill="#4a3a3a" opacity="0.55">
          <rect x="0" y="380" width="80" height="220" />
          <rect x="80" y="340" width="60" height="260" />
          <rect x="140" y="400" width="120" height="200" />
          <rect x="260" y="320" width="40" height="280" />
          <rect x="300" y="360" width="100" height="240" />
          <rect x="400" y="300" width="50" height="300" />
          <rect x="450" y="380" width="90" height="220" />
          <rect x="540" y="350" width="70" height="250" />
          <rect x="610" y="290" width="80" height="310" />
          <rect x="690" y="370" width="120" height="230" />
          <rect x="810" y="330" width="60" height="270" />
          <rect x="870" y="380" width="100" height="220" />
          <rect x="970" y="310" width="50" height="290" />
          <rect x="1020" y="360" width="80" height="240" />
          <rect x="1100" y="340" width="120" height="260" />
          <rect x="1220" y="310" width="60" height="290" />
          <rect x="1280" y="360" width="100" height="240" />
          <rect x="1380" y="330" width="80" height="270" />
          <rect x="1460" y="370" width="110" height="230" />
          <rect x="1570" y="310" width="50" height="290" />
          <rect x="1620" y="360" width="90" height="240" />
          <rect x="1710" y="330" width="120" height="270" />
          <rect x="1830" y="380" width="90" height="220" />
        </g>
        {/* Mid layer */}
        <g fill="#2a1f2a" opacity="0.75">
          {/* Kingdom Centre-style tower with notch */}
          <path d="M 880 200 L 880 600 L 1020 600 L 1020 200 L 990 200 L 990 240 L 960 240 L 960 280 L 940 280 L 940 240 L 910 240 L 910 200 Z" />
          {/* Burj-style needle tower */}
          <polygon points="600,100 624,100 618,600 606,600" />
          <rect x="588" y="180" width="48" height="420" />
          {/* Faisaliah-style ball + spike */}
          <polygon points="1300,260 1340,260 1330,600 1310,600" />
          <circle cx="1320" cy="240" r="22" />
          {/* Other towers */}
          <rect x="120" y="280" width="80" height="320" />
          <rect x="240" y="320" width="50" height="280" />
          <rect x="320" y="240" width="100" height="360" />
          <rect x="440" y="300" width="70" height="300" />
          <rect x="730" y="260" width="90" height="340" />
          <rect x="1060" y="280" width="60" height="320" />
          <rect x="1140" y="320" width="100" height="280" />
          <rect x="1380" y="260" width="80" height="340" />
          <rect x="1480" y="300" width="120" height="300" />
          <rect x="1620" y="280" width="60" height="320" />
          <rect x="1700" y="320" width="100" height="280" />
        </g>
        {/* Near layer */}
        <g fill="#15101a" opacity="0.95">
          <rect x="0" y="440" width="180" height="160" />
          <rect x="200" y="420" width="120" height="180" />
          <rect x="340" y="460" width="200" height="140" />
          <rect x="560" y="430" width="150" height="170" />
          <rect x="730" y="450" width="100" height="150" />
          <rect x="850" y="420" width="200" height="180" />
          <rect x="1070" y="450" width="140" height="150" />
          <rect x="1230" y="430" width="180" height="170" />
          <rect x="1430" y="450" width="140" height="150" />
          <rect x="1590" y="420" width="180" height="180" />
          <rect x="1790" y="450" width="130" height="150" />
          {/* Window lights */}
          <g fill="#f0b62b" opacity="0.6">
            {Array.from({ length: 90 }).map((_, i) => {
              const cols = [40, 90, 140, 220, 270, 380, 430, 480, 600, 650, 760, 800, 880, 930, 980, 1030, 1100, 1140, 1180, 1280, 1320, 1370, 1480, 1530, 1620, 1670, 1720, 1830, 1870];
              const rows = [470, 500, 530, 560];
              const x = cols[i % cols.length];
              const y = rows[Math.floor(i / cols.length) % rows.length];
              return <rect key={i} x={x} y={y} width="4" height="6" />;
            })}
          </g>
        </g>
      </svg>
      {/* Navy gradient overlay for legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(11,55,82,${overlayOpacity + 0.05}) 0%, rgba(11,55,82,${overlayOpacity - 0.05}) 45%, rgba(6,35,56,${overlayOpacity + 0.15}) 100%)`
      }} />
      {/* Subtle hatch */}
      <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
    </div>);

}

function VideoBg({ overlayOpacity = 0.55, speed = 0.6 }) {
  const { isPhone } = useViewport();
  const videoRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(true);
  const [videoReady, setVideoReady] = React.useState(false);
  const reduced = React.useRef(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const applyRate = () => {try {v.playbackRate = speed;} catch (e) {}};
    applyRate();
    v.addEventListener('loadedmetadata', applyRate);
    const onReady = () => setVideoReady(true);
    v.addEventListener('playing', onReady);
    if (v.readyState >= 3 && !v.paused) onReady();
    if (reduced.current) {
      v.pause();
      setPlaying(false);
    } else {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    }
    return () => {
      v.removeEventListener('loadedmetadata', applyRate);
      v.removeEventListener('playing', onReady);
    };
  }, []);

  // Keep playback rate in sync when the speed tweak changes
  React.useEffect(() => {
    const v = videoRef.current;
    if (v) {try {v.playbackRate = speed;} catch (e) {}}
  }, [speed]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {v.play();setPlaying(true);} else
    {v.pause();setPlaying(false);}
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--bci-navy) url(assets/hero-poster.jpg) center top / cover no-repeat' }}>
      <video
        ref={videoRef}
        className={reduced.current ? '' : 'hero-zoom'}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 'auto',
          width: '100%', height: '113%',
          objectFit: 'cover', objectPosition: 'center top',
          transformOrigin: '60% 40%',
          filter: 'saturate(1.06) contrast(1.04)',
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 900ms ease'
        }}>
        <source src="assets/hero.mp4" type="video/mp4" />
      </video>

      {/* Directional scrim — dark behind the text (bottom-left), clear top-right so the footage reads */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, rgba(6,35,56,${overlayOpacity + 0.18}) 0%, rgba(6,35,56,${Math.max(overlayOpacity - 0.18, 0)}) 42%, rgba(6,35,56,0) 78%)`
      }} />
      {/* Soft floor gradient so the stats + CTAs stay legible */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%',
        background: `linear-gradient(180deg, rgba(6,35,56,0) 0%, rgba(6,35,56,${overlayOpacity + 0.1}) 100%)`
      }} />
      {/* Faint top vignette under the header */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '22%',
        background: 'linear-gradient(180deg, rgba(6,35,56,0.45) 0%, rgba(6,35,56,0) 100%)'
      }} />
      {/* Subtle hatch tying it to the brand texture */}
      <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.18 }} />

      {/* Play / pause control */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        style={{
          position: 'absolute',
          right: isPhone ? 14 : 28,
          top: isPhone ? 76 : 'auto',
          bottom: isPhone ? 'auto' : 28, zIndex: 3,
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(6,35,56,0.45)',
          border: '1px solid rgba(255,255,255,0.35)',
          color: '#fff', cursor: 'pointer',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          transition: 'background 120ms linear, border-color 120ms linear'
        }}
        onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(6,35,56,0.7)';e.currentTarget.style.borderColor = '#fff';}}
        onMouseLeave={(e) => {e.currentTarget.style.background = 'rgba(6,35,56,0.45)';e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';}}>
        {playing ?
        <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" fill="currentColor" /><rect x="7" y="1.5" width="3" height="9" fill="currentColor" /></svg> :
        <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><polygon points="2.5,1.5 10,6 2.5,10.5" fill="currentColor" /></svg>}
      </button>
    </div>);

}

function Hero({ overlayOpacity = 0.55, bgStyle = 'skyline', videoSpeed = 0.6 }) {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const [phase, setPhase] = React.useState('pre'); // 'pre' | 'in' | 'instant'
  React.useEffect(() => {
    const reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion or a tab that isn't visible: show instantly, no paused transition
    if (reduced || document.hidden) {setPhase('instant');return;}
    const raf = requestAnimationFrame(() =>
    requestAnimationFrame(() => setPhase('in')));
    const fallback = setTimeout(() => setPhase('in'), 1400); // guarantee visibility
    return () => {cancelAnimationFrame(raf);clearTimeout(fallback);};
  }, []);
  const rise = phase === 'pre' ? 'hero-rise' :
  phase === 'instant' ? 'hero-rise in instant' : 'hero-rise in';

  const stats = [
  { v: '320+', num: 320, suffix: '+', l: t(lang, 'Products', 'منتج', 'Productos') },
  { v: '10+', num: 10, suffix: '+', l: t(lang, 'Product Lines', 'خطوط منتجات', 'Líneas de producto') },
  { v: '2021', num: 2021, group: false, l: t(lang, 'Founded', 'سنة التأسيس', 'Fundado') },
  { v: t(lang, 'Saudi Made', 'صُنع في السعودية', 'Hecho en KSA'),
    l: t(lang, 'National manufacturer', 'مصنع وطني', 'Fabricante nacional'),
    alt: true }];

  return (
    <section id="top" style={{
      position: 'relative', minHeight: '100vh', padding: 0,
      color: '#fff', overflow: 'hidden'
    }}>
      {bgStyle === 'video' && <VideoBg overlayOpacity={overlayOpacity} speed={videoSpeed} />}
      {bgStyle === 'skyline' && <SkylineBg overlayOpacity={overlayOpacity} />}
      {bgStyle === 'solid' && <div style={{ position: 'absolute', inset: 0, background: 'var(--bci-navy)' }} />}
      {bgStyle === 'pattern' &&
      <>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bci-navy)' }} />
          <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 1 }} />
          <DecoMotif />
        </>
      }

      {/* Top hairline above stats already provided by overlay; bottom hairline added below */}

      <div className="container" style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingTop: isPhone ? 84 : 96, paddingBottom: 0
      }}>
        {/* Hero content */}
        <div style={{
          maxWidth: 920, marginBottom: isPhone ? 34 : 80,
          textAlign: lang === 'ar' ? 'right' : 'left',
          alignSelf: lang === 'ar' ? 'flex-end' : 'flex-start'
        }}>
          {/* Overline */}
          <div className={rise} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--ff-mono)', fontSize: 12,
            color: 'var(--bci-green-400)',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            fontWeight: 500, marginBottom: 36,
            transitionDelay: '80ms'
          }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8,
              border: '1.5px solid var(--bci-green-400)'
            }} />
            {t(lang,
            'Building Chemistry Industry · Dammam, KSA',
            'صناعة كيمياء البناء · الدمام، المملكة العربية السعودية',
            'Industria Química de la Construcción · Dammam, KSA')}
          </div>

          {/* Headline — Arabic is RTL; English & Spanish share the LTR Latin layout */}
          {lang === 'ar' ?
          <h1 className={'display ' + rise} dir="rtl" style={{
            fontFamily: 'var(--ff-arabic)', fontWeight: 700,
            fontSize: isPhone ? 'clamp(38px, 11vw, 56px)' : 'clamp(48px, 6vw, 92px)',
            lineHeight: 1.15, letterSpacing: '0',
            margin: 0, color: '#fff', textAlign: 'right',
            transitionDelay: '180ms'
          }}>
              كيمياء البناء<br />
              <span style={{ color: 'var(--bci-green-400)' }}>صُنعت لتدوم.</span>
            </h1> :

          <h1 className={'display ' + rise} style={{
            fontFamily: 'var(--ff-display)', fontWeight: 700,
            fontSize: isPhone ? 'clamp(40px, 12vw, 60px)' : 'clamp(56px, 7vw, 104px)',
            lineHeight: isPhone ? 1.0 : 0.95, letterSpacing: '-0.02em',
            margin: 0, color: '#fff',
            textWrap: 'balance',
            transitionDelay: '180ms'
          }}>
              {lang === 'es' ?
              <>Química de la Construcción<br />
                <span style={{ color: 'var(--bci-green-400)' }}>Hecha para Durar</span></> :
              <>Construction Chemistry<br />
                <span style={{ color: 'var(--bci-green-400)' }}>Built to Last</span></>}
            </h1>
          }

          {/* Subtext */}
          <p className={rise} style={{
            fontSize: isPhone ? 16 : 18, lineHeight: 1.55,
            color: 'rgba(255,255,255,0.72)',
            margin: isPhone ? '20px 0 28px' : '32px 0 40px', maxWidth: 620,
            transitionDelay: '320ms'
          }}>
            {t(lang,
            'Polyurethane. Epoxy. Polyurea. The invisible chemistry protecting the Gulf\u2019s built future.',
            'بولي يوريثان. إيبوكسي. بولي يوريا. الكيمياء الخفية التي تحمي مستقبل الخليج العمراني.',
            'Poliuretano. Epoxi. Poliurea. La química invisible que protege el futuro construido del Golfo.')}
          </p>

          {/* CTAs */}
          <div className={rise} style={{ display: 'flex', gap: isPhone ? 12 : 14, flexWrap: 'wrap', flexDirection: isPhone ? 'column' : 'row', transitionDelay: '440ms' }}>
            <a href="#solutions" className="btn btn-accent" style={{ width: isPhone ? '100%' : 'auto', justifyContent: 'center' }}>
              {t(lang, 'Explore Products', 'استكشف المنتجات', 'Explorar Productos')}
            </a>
            <a href="#contact" className="btn btn-ghost-light" style={{ width: isPhone ? '100%' : 'auto', justifyContent: 'center' }}>
              {t(lang, 'Request Submittal', 'طلب وثائق', 'Solicitar Documentación')} <Arrow size={14} />
            </a>
          </div>
        </div>

        {/* Stats row */}
        {isPhone ?
        <div className={'hero-stats-m ' + rise} style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          padding: '22px 18px 24px',
          display: 'grid', gap: '20px 16px',
          transitionDelay: '560ms'
        }}>
          {stats.map((s, i) =>
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            textAlign: lang === 'ar' ? 'right' : 'left',
            alignItems: lang === 'ar' ? 'flex-end' : 'flex-start'
          }}>
              <div className="display" style={{
              fontFamily: 'var(--ff-display)', fontWeight: 700,
              fontSize: s.alt ? 22 : 32, color: '#fff',
              letterSpacing: '-0.01em', lineHeight: 1
            }}>{s.num != null ?
              <CountUp value={s.num} suffix={s.suffix || ''} group={s.group !== false}
                duration={1250} active={phase !== 'pre'} /> :
              s.v}</div>
              <div style={{
              fontFamily: 'var(--ff-mono)', fontSize: 10.5,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)'
            }}>{s.l}</div>
            </div>
          )}
        </div> :

        <div className={rise} style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          padding: '32px 36px 36px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          transitionDelay: '560ms'
        }}>
          {stats.
          map((s, i) => {
            const last = i === 3;
            // EN: last cell hugs the right edge so the row is flush on both sides.
            // AR (RTL): last cell hugs the left edge.
            const endAlign = lang === 'ar' ? 'flex-start' : 'flex-end';
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                alignItems: last ? endAlign : 'flex-start',
                textAlign: last ? lang === 'ar' ? 'left' : 'right' : lang === 'ar' ? 'right' : 'left',
                padding: last ? 0 : lang === 'ar' ? '0 0 0 28px' : '0 28px 0 0',
                borderRight: lang === 'ar' ? 'none' : i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                borderLeft: lang === 'ar' ? i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none' : 'none',
                marginRight: lang === 'ar' ? 0 : i < 3 ? 28 : 0,
                marginLeft: lang === 'ar' ? i < 3 ? 28 : 0 : 0
              }}>
              <div className="display" style={{
                  fontFamily: 'var(--ff-display)', fontWeight: 700,
                  fontSize: s.alt ? 28 : 44,
                  color: '#fff', letterSpacing: '-0.01em',
                  lineHeight: 1
                }}>{s.num != null ?
                  <CountUp value={s.num} suffix={s.suffix || ''} group={s.group !== false}
                    duration={1250} active={phase !== 'pre'} /> :
                  s.v}</div>
              <div style={{
                  fontFamily: 'var(--ff-mono)', fontSize: 11,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.55)'
                }}>{s.l}</div>
            </div>);
          })}
        </div>
        }
      </div>
    </section>);

}

function DecoMotif() {
  // Large decorative interlocking squares low-opacity, bottom-right
  return (
    <svg viewBox="0 0 200 200" style={{
      position: 'absolute', right: -40, bottom: -40, width: 540, height: 540,
      opacity: 0.08, pointerEvents: 'none'
    }} aria-hidden="true">
      <rect x="20" y="20" width="80" height="80" stroke="var(--bci-green-500)" strokeWidth="3" fill="none" />
      <rect x="80" y="80" width="80" height="80" stroke="#fff" strokeWidth="3" fill="none" />
    </svg>);

}

Object.assign(window, { Hero, SkylineBg, VideoBg, DecoMotif });