/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow,
   MegaHeader, PageHero, Footer, Contact, DEPARTMENTS */

function Departments() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <section style={{ background: 'var(--bci-paper)', padding: '110px 0' }}>
      <div className="container">
        <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Departments', 'الأقسام', 'Departamentos')}</div>
        <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(30px,3.2vw,44px)', color: 'var(--bci-navy)', margin: '0 0 48px', textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'Reach the right team.', 'تواصل مع الفريق المناسب.', 'Contacta con el equipo adecuado.')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {DEPARTMENTS.map((d, i) => (
            <a key={i} href={`mailto:${d.en.d}`} style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: 28, textDecoration: 'none', display: 'block', textAlign: isAr ? 'right' : 'left' }}>
              <div style={{ width: 48, height: 48, border: '1px solid var(--bci-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-navy)', marginBottom: 20 }}>
                <Icon name={d.icon} size={22} />
              </div>
              <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 19, color: 'var(--bci-navy)', margin: '0 0 8px' }}>{d[lang].t}</h3>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--bci-green-700)', letterSpacing: '0.02em', wordBreak: 'break-all' }}>{d[lang].d}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- projection: real lon/lat → normalized 0..1 on the map panel ---- */
const KSA_K = Math.cos(24 * Math.PI / 180);            // longitude compression at mid-latitude
const KSA_XS = KSA_BORDER.map(p => p[0] * KSA_K);
const KSA_YS = KSA_BORDER.map(p => p[1]);
const KSA_MINX = Math.min(...KSA_XS), KSA_MAXX = Math.max(...KSA_XS);
const KSA_MINY = Math.min(...KSA_YS), KSA_MAXY = Math.max(...KSA_YS);
const KSA_PAD = 0.07;
const KSA_VBW = 1000;
const KSA_VBH = Math.round(1000 * (KSA_MAXY - KSA_MINY) / (KSA_MAXX - KSA_MINX));
function ksaProject(lon, lat) {
  const nx = (lon * KSA_K - KSA_MINX) / (KSA_MAXX - KSA_MINX);
  const ny = (KSA_MAXY - lat) / (KSA_MAXY - KSA_MINY);
  return [KSA_PAD + nx * (1 - 2 * KSA_PAD), KSA_PAD + ny * (1 - 2 * KSA_PAD)];
}
const KSA_PATH = 'M ' + KSA_BORDER.map(([lon, lat]) => {
  const [px, py] = ksaProject(lon, lat);
  return `${(px * KSA_VBW).toFixed(1)} ${(py * KSA_VBH).toFixed(1)}`;
}).join(' L ') + ' Z';

function StoreNetwork() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [active, setActive] = React.useState('dammam');

  return (
    <section id="map" style={{ background: 'var(--bci-navy)', padding: '110px 0', position: 'relative', overflow: 'hidden' }}>
      <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative' }}>
        <div className="sec-num" style={{ color: 'var(--bci-green-400)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'Our Network', 'شبكتنا', 'Nuestra Red')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 56, alignItems: 'start' }}>

          {/* ---- left: heading + store list ---- */}
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(30px,3.2vw,44px)', color: '#fff', margin: '0 0 18px' }}>
              {t(lang, 'BCI stores across the Kingdom.', 'متاجر BCI في أنحاء المملكة.', 'Tiendas BCI en todo el Reino.')}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--bci-navy-200)', margin: '0 0 36px', maxWidth: 360, marginInline: isAr ? '0 0' : undefined }}>
              {t(lang,
                'Six locations stocking the full BCI range — with technical support close to every project in Saudi Arabia.',
                'ستة مواقع تضم تشكيلة BCI الكاملة — مع دعم فني قريب من كل مشروع في المملكة العربية السعودية.',
                'Seis ubicaciones con la gama completa de BCI — con soporte técnico cerca de cada proyecto en Arabia Saudí.')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {STORES.map((s, i) => {
                const on = active === s.key;
                return (
                  <button key={s.key} type="button"
                    onMouseEnter={() => setActive(s.key)} onFocus={() => setActive(s.key)}
                    style={{
                      display: 'grid', gridTemplateColumns: isAr ? '1fr auto' : 'auto 1fr', gap: 16, alignItems: 'center',
                      background: on ? 'rgba(49,180,105,0.10)' : 'transparent',
                      border: 0, borderTop: i === 0 ? '1px solid rgba(255,255,255,0.10)' : '0',
                      borderBottom: '1px solid rgba(255,255,255,0.10)',
                      padding: '16px 14px', cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
                      transition: 'background 120ms linear',
                    }}>
                    <span style={{
                      gridColumn: isAr ? 2 : 1, width: 30, height: 30, flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${s.hq ? 'var(--bci-green-500)' : 'rgba(255,255,255,0.30)'}`,
                      background: s.hq ? 'var(--bci-green-500)' : 'transparent',
                      fontFamily: 'var(--ff-mono)', fontSize: 11, fontWeight: 600,
                      color: s.hq ? '#fff' : 'var(--bci-navy-100)',
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ gridColumn: isAr ? 1 : 2 }}>
                      <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 18, color: '#fff' }}>{s[lang].city}</span>
                        {s.hq && <span className="eyebrow" style={{ fontSize: 9, color: 'var(--bci-green-400)', border: '1px solid var(--bci-green-700)', padding: '2px 6px', letterSpacing: '0.1em' }}>{t(lang, 'HQ', 'المقر', 'Sede')}</span>}
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--bci-navy-200)', marginTop: 4, letterSpacing: '0.03em' }}>{s[lang].role}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <a href="https://maps.app.goo.gl/8bW3DdJSLY2A4PKFA" target="_blank" rel="noopener" className="link-arrow on-dark" style={{ marginTop: 28 }}>
              {t(lang, 'Open head office in Maps', 'افتح المقر في الخرائط', 'Abrir la sede en Maps')} <Icon name="external-link" size={13} />
            </a>
          </div>

          {/* ---- right: Saudi Arabia map ---- */}
          <div style={{
            position: 'relative', width: '100%', aspectRatio: `${KSA_VBW} / ${KSA_VBH}`,
            background: 'var(--bci-navy-700)', border: '1px solid var(--bci-navy-tint)',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}>
            {/* corner ticks for a technical / drafted feel */}
            <span className="mono" style={{ position: 'absolute', top: 12, left: 14, fontSize: 10, color: 'var(--bci-navy-300)', letterSpacing: '0.12em' }}>KSA · KINGDOM OF SAUDI ARABIA</span>
            <span className="mono" style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10, color: 'var(--bci-navy-300)', letterSpacing: '0.12em' }}>6 LOCATIONS</span>

            <svg viewBox={`0 0 ${KSA_VBW} ${KSA_VBH}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-label="Map of Saudi Arabia">
              <path d={KSA_PATH} fill="rgba(11,55,82,0.55)" stroke="var(--bci-green-400)" strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* city pins (HTML — keeps labels crisp & RTL-aware) */}
            {STORES.map((s) => {
              const [px, py] = ksaProject(s.lon, s.lat);
              const on = active === s.key;
              const right = s.side === 'right';
              return (
                <div key={s.key}
                  onMouseEnter={() => setActive(s.key)}
                  style={{ position: 'absolute', left: `${px * 100}%`, top: `${py * 100}%`, transform: 'translate(-50%,-50%)', zIndex: on ? 5 : 2 }}>
                  {/* pulse ring on active */}
                  {on && <span style={{ position: 'absolute', left: '50%', top: '50%', width: 30, height: 30, transform: 'translate(-50%,-50%)', border: '1px solid var(--bci-green-400)', borderRadius: '50%', opacity: 0.6 }} />}
                  {/* dot */}
                  <span style={{
                    position: 'relative', display: 'block', width: s.hq ? 16 : 12, height: s.hq ? 16 : 12,
                    transform: 'translate(-50%,-50%) rotate(45deg)', marginLeft: '50%', marginTop: '50%',
                    background: s.hq ? 'var(--bci-green-500)' : (on ? 'var(--bci-green-400)' : 'var(--bci-navy-800)'),
                    border: `1.5px solid ${s.hq ? '#fff' : 'var(--bci-green-400)'}`,
                    boxShadow: on ? '0 0 0 4px rgba(49,180,105,0.18)' : 'none',
                    transition: 'background 120ms linear, box-shadow 120ms linear',
                  }} />
                  {/* label */}
                  <span style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    [right ? 'left' : 'right']: 16, whiteSpace: 'nowrap',
                    fontFamily: 'var(--ff-mono)', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em',
                    color: on ? '#fff' : 'var(--bci-navy-100)',
                    background: on ? 'rgba(11,55,82,0.85)' : 'transparent', padding: '2px 6px',
                    transition: 'color 120ms linear',
                  }}>{isAr ? s.ar.city : s.en.city.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  const { lang } = useLang();
  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Contact', 'تواصل', 'Contacto')}
        crumb={t(lang, 'Contact', 'تواصل', 'Contacto')}
        title="Talk to our team."
        titleAr="تحدث إلى فريقنا."
        titleEs="Habla con nuestro equipo."
        subtitle={t(lang,
          'Speak to our technical and sales team about specifications, submittals, samples or supply. We reply within 24 hours.',
          'تحدث إلى فريقنا الفني والتجاري حول المواصفات والوثائق والعينات والتوريد. نرد خلال 24 ساعة.',
          'Habla con nuestro equipo técnico y comercial sobre especificaciones, documentación, muestras o suministro. Respondemos en 24 horas.')} />
      <Contact />
      <Departments />
      <StoreNetwork />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Contact" />
    <ContactPage />
    <Footer />
  </LangProvider>
);
