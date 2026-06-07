/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow, Chev, Badge,
   MegaHeader, PageHero, CtaBand, Footer, SectionHead, SOLUTIONS, STATS */

function SolutionsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Solutions', 'الحلول', 'Soluciones')}
        crumb={t(lang, 'Solutions', 'الحلول', 'Soluciones')}
        title="Construction chemistry, end to end."
        titleAr="كيمياء البناء، من الألف إلى الياء."
        titleEs="Química de la construcción, de principio a fin."
        subtitle={t(lang,
          'Engineered solution lines — over 120 products spanning waterproofing, flooring, coatings, repair, sealing and concrete technology for the Saudi and GCC market.',
          'خطوط حلول هندسية — أكثر من 120 منتجاً تشمل العزل والأرضيات والطلاءات والإصلاح والمواد المانعة وتقنية الخرسانة للسوق السعودي والخليجي.',
          'Líneas de solución de ingeniería — más de 120 productos que abarcan impermeabilización, pavimentos, recubrimientos, reparación, sellado y tecnología del hormigón para el mercado saudí y del CCG.')}
      />

      {/* Quick index */}
      <section style={{ background: 'var(--bci-navy-800)', padding: '0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderLeft: '1px solid rgba(255,255,255,0.06)', direction: isAr ? 'rtl' : 'ltr' }}>
            {SOLUTIONS.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px',
                borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', color: 'rgba(255,255,255,0.8)', transition: 'background 100ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon name={s.icon} size={18} stroke="#fff" />
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)' }}>{s[lang].name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {SOLUTIONS.map((s, i) => <SolutionBlock key={s.slug} s={s} alt={i % 2 === 1} />)}
    </main>
  );
}

function SolutionBlock({ s, alt }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <section id={s.slug} style={{ background: alt ? 'var(--bci-paper)' : 'var(--bci-concrete)', padding: '96px 0', scrollMarginTop: 72 }}>
      <div className="container">
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 48, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ maxWidth: 720, textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div style={{ width: 56, height: 56, border: '1px solid var(--bci-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-navy)' }}>
                <Icon name={s.icon} size={26} />
              </div>
              <div className="sec-num" style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Solution Line', 'خط حلول', 'Línea de Solución')}</div>
            </div>
            <h2 className="display" style={{
              fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
              fontSize: 'clamp(30px, 3.2vw, 44px)', lineHeight: isAr ? 1.2 : 1.05,
              letterSpacing: isAr ? 0 : '-0.018em', color: 'var(--bci-navy)', margin: '0 0 14px',
            }}>{s[lang].name}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--bci-graphite)', margin: 0 }}>{s[lang].tagline}</p>
          </div>
          <a href={`Solution Detail.html?cat=${s.slug}`} className="btn btn-ghost-navy" style={{ whiteSpace: 'nowrap' }}>
            {t(lang, 'View line', 'عرض الخط', 'Ver línea')} <Arrow size={14} />
          </a>
        </div>

        {/* Products grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {s.products.map(p => <ProductChip key={p.code} p={p} slug={s.slug} />)}
        </div>
      </div>
    </section>
  );
}

function ProductChip({ p, slug }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = React.useState(false);
  return (
    <a href={`Solution Detail.html?cat=${slug}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', border: `1px solid ${hover ? 'var(--bci-green-500)' : 'var(--bci-hairline-light)'}`,
        borderRadius: 2, padding: 20, textDecoration: 'none', display: 'flex', flexDirection: 'column',
        minHeight: 168, textAlign: isAr ? 'right' : 'left', transition: 'border-color 120ms linear',
      }}>
      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--bci-steel)', marginBottom: 12 }}>{p.code}</span>
      <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 18, color: 'var(--bci-navy)', margin: '0 0 8px', lineHeight: 1.2 }}>{p[lang].name}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--bci-steel)', margin: 0, flex: 1 }}>{p[lang].desc}</p>
      {p.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
          {p.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--ff-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
              padding: '3px 7px', borderRadius: 2, background: 'var(--bci-green-50)', color: 'var(--bci-green-700)', border: '1px solid var(--bci-green-200)',
            }}>{tag}</span>
          ))}
        </div>
      )}
    </a>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Solutions" />
    <SolutionsPage />
    <CtaBand
      title="Need help specifying a system?"
      titleAr="تحتاج مساعدة في اختيار النظام المناسب؟"
      titleEs="¿Necesitas ayuda para elegir un sistema?"
      body="Our technical team will match the right BCI products to your project and provide full submittal documentation."
      bodyAr="يساعدك فريقنا الفني على اختيار منتجات BCI المناسبة لمشروعك مع توفير وثائق المواصفات كاملة."
      bodyEs="Nuestro equipo técnico seleccionará los productos BCI adecuados para tu proyecto y te proporcionará la documentación de especificación completa." />
    <Footer />
  </LangProvider>
);
