/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow, Badge,
   MegaHeader, PageHero, CtaBand, Footer, About, WhyBCI, TIMELINE, STATS */

function Timeline() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <section style={{ background: 'var(--bci-paper)', padding: '120px 0' }}>
      <div className="container">
        <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'Milestones', 'محطات', 'Hitos')}
        </div>
        <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.6vw,52px)', color: 'var(--bci-navy)', margin: '0 0 56px', textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'From start-up to standard-setter.', 'من شركة ناشئة إلى مرجع للمعايير.', 'De start-up a referente en estándares.')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderTop: '2px solid var(--bci-navy)' }}>
          {TIMELINE.map((m, i) => {
            const d = m[lang] || m.en;
            return (
              <div key={m.year} style={{ padding: '28px 20px 0', borderRight: i < TIMELINE.length - 1 ? '1px solid var(--bci-hairline-light)' : 'none', paddingLeft: i === 0 ? 0 : 20, position: 'relative', textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ position: 'absolute', top: -7, [isAr ? 'right' : 'left']: i === 0 ? 0 : 20, width: 12, height: 12, background: 'var(--bci-green-500)' }} />
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 22, fontWeight: 600, color: 'var(--bci-navy)', marginBottom: 14 }}>{m.year}</div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 18, color: 'var(--bci-navy)', margin: '0 0 8px', lineHeight: 1.2 }}>{d.t}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--bci-steel)', margin: 0 }}>{d.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatBand() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <section style={{ background: 'var(--bci-navy)', padding: 0 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', direction: isAr ? 'rtl' : 'ltr' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: '48px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: isAr ? 'right' : 'left' }}>
              <div className="display" style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 52, color: '#fff', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--bci-green-400)', marginTop: 12 }}>
                {t(lang, s.en, s.ar, s.es)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Certifications() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const certs = [
    { code: 'ISO 9001:2015', en: 'Quality Management System', ar: 'نظام إدارة الجودة', es: 'Sistema de gestión de calidad', logo: 'assets/cert-iso-9001.png' },
    { code: 'EN 1504-2', en: 'Concrete Protection Conformity', ar: 'مطابقة حماية الخرسانة', es: 'Conformidad de protección del hormigón', logo: 'assets/cert-en-1504-2.png' },
    { code: 'SASO / SABER', en: 'Saudi Product Registration', ar: 'تسجيل المنتجات السعودي', es: 'Registro de productos saudí', logo: 'assets/cert-saso-saber.jpg' },
    { code: 'Saudi-Made', en: 'Local Content Certified', ar: 'محتوى محلي معتمد', es: 'Contenido local certificado', logo: 'assets/saudi-made-bi-navy.svg' },
  ];
  return (
    <section style={{ background: 'var(--bci-concrete)', padding: '120px 0' }}>
      <div className="container">
        <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'Compliance', 'الالتزام', 'Cumplimiento normativo')}
        </div>
        <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.6vw,52px)', color: 'var(--bci-navy)', margin: '0 0 48px', textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'Certified & standards-aligned.', 'معتمدون ومتوافقون مع المعايير.', 'Certificados y alineados con estándares.')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {certs.map(c => (
            <div key={c.code} style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: 28, textAlign: isAr ? 'right' : 'left' }}>
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: isAr ? 'flex-end' : 'flex-start', marginBottom: 20 }}>
                <img src={c.logo} alt={c.code} style={{ maxHeight: 56, maxWidth: 150, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
              </div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 14, fontWeight: 600, color: 'var(--bci-navy)', marginBottom: 8, letterSpacing: '0.04em' }}>{c.code}</div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--bci-steel)', margin: 0 }}>{t(lang, c.en, c.ar, c.es)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  const { lang } = useLang();
  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'About', 'عن BCI', 'Nosotros')}
        crumb={t(lang, 'About', 'عن BCI', 'Nosotros')}
        title="A Saudi manufacturer of construction chemicals"
        titleAr="مصنع سعودي لكيمياء البناء."
        titleEs="Un fabricante saudí de químicos para construcción."
        subtitle={t(lang,
          'Founded in Dammam in 2021, BCI formulates polyurethane, epoxy and polyurea systems for the Kingdom\u2019s most demanding built assets — engineered, tested and made in Saudi Arabia.',
          'تأسست في الدمام عام 2021، تطوّر BCI أنظمة البولي يوريثان والإيبوكسي والبولي يوريا لأصعب الأصول العمرانية في المملكة — هندسة واختبار وصناعة في السعودية.',
          'Fundada en Dammam en 2021, BCI formula sistemas de poliuretano, epoxi y poliurea para los activos construidos más exigentes del Reino — diseñados, probados y fabricados en Arabia Saudita.'
        )} />
      <About />
      <StatBand />
      <WhyBCI />
      <Timeline />
      <Certifications />
      <CtaBand
        title="Work with a manufacturer, not a reseller."
        titleAr="تعامل مع مصنّع، لا مجرد موزّع."
        titleEs="Trabaja con un fabricante, no un revendedor."
        body="From specification to site support, our technical team is with you through the entire work process."
        bodyAr="من المواصفة إلى دعم الموقع، فريقنا الفني معك عبر دورة العمل بأكملها."
        bodyEs="Desde la especificación hasta el soporte en obra, nuestro equipo técnico está contigo en todo el proceso." />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="About" />
    <AboutPage />
    <Footer />
  </LangProvider>
);
