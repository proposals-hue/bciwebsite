/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow, Chev, Badge,
   MegaHeader, PageHero, CtaBand, Footer, SOLUTIONS */
const { useState: useState_d } = React;

function getCat() {
  try {
    const slug = new URLSearchParams(location.search).get('cat');
    return SOLUTIONS.find(s => s.slug === slug) || SOLUTIONS[0];
  } catch (e) { return SOLUTIONS[0]; }
}

function SolutionDetailPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const s = getCat();

  // aggregate standards/tags across products
  const standards = Array.from(new Set(s.products.flatMap(p => p.tags))).slice(0, 6);

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Solution Line', 'خط حلول')}
        crumb={s[lang].name}
        title={s.en.name} titleAr={s.ar.name}
        subtitle={s[lang].tagline}
      />

      {/* Category switcher */}
      <section style={{ background: 'var(--bci-navy-800)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', direction: isAr ? 'rtl' : 'ltr' }}>
          {SOLUTIONS.map(c => {
            const on = c.slug === s.slug;
            return (
              <a key={c.slug} href={`Solution Detail.html?cat=${c.slug}`} style={{
                fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '8px 12px', borderRadius: 2, textDecoration: 'none',
                border: `1px solid ${on ? 'var(--bci-green-500)' : 'rgba(255,255,255,0.14)'}`,
                background: on ? 'var(--bci-green-500)' : 'transparent',
                color: on ? '#fff' : 'rgba(255,255,255,0.7)',
              }}>{c.num} · {c[lang].name}</a>
            );
          })}
        </div>
      </section>

      {/* Body: left meta rail + product grid */}
      <section style={{ background: 'var(--bci-concrete)', padding: '96px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 56, alignItems: 'start', direction: isAr ? 'rtl' : 'ltr' }}>
          {/* Meta rail */}
          <aside style={{ position: 'sticky', top: 96, textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ width: 64, height: 64, border: '1px solid var(--bci-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-navy)', marginBottom: 24 }}>
              <Icon name={s.icon} size={30} />
            </div>
            <table className="spec-table" style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)' }}>
              <tbody>
                <tr><th>{t(lang, 'Line', 'الخط')}</th><td className="value">{s.num}</td></tr>
                <tr><th>{t(lang, 'Products', 'المنتجات')}</th><td className="value">{s.products.length}</td></tr>
                <tr><th>{t(lang, 'Origin', 'المنشأ')}</th><td className="value">KSA</td></tr>
              </tbody>
            </table>
            {standards.length > 0 && <>
              <div className="eyebrow" style={{ color: 'var(--bci-steel)', margin: '28px 0 12px' }}>{t(lang, 'Properties & Standards', 'الخصائص والمعايير')}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
                {standards.map(tag => (
                  <span key={tag} style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '5px 9px', borderRadius: 2, background: 'var(--bci-navy-50)', color: 'var(--bci-navy)', border: '1px solid var(--bci-navy-100)' }}>{tag}</span>
                ))}
              </div>
            </>}
            <a href="Resources.html" className="link-arrow" style={{ marginTop: 28 }}>
              <Icon name="download" size={14} /> {t(lang, 'All datasheets', 'كل النشرات')}
            </a>
          </aside>

          {/* Product grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <h2 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 28, color: 'var(--bci-navy)', margin: 0 }}>
                {t(lang, 'Products in this line', 'منتجات هذا الخط')}
              </h2>
              <span className="sec-num" style={{ color: 'var(--bci-steel)' }}>{String(s.products.length).padStart(2, '0')} {t(lang, 'items', 'عنصر')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {s.products.map(p => <DetailCard key={p.code} p={p} />)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetailCard({ p }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_d(false);
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', border: `1px solid ${hover ? 'var(--bci-navy-600)' : 'var(--bci-hairline-light)'}`,
        borderRadius: 2, padding: 26, display: 'flex', flexDirection: 'column',
        transition: 'border-color 120ms linear', textAlign: isAr ? 'right' : 'left',
      }}>
      {/* Product picture — user-fillable. Keyed by product code so the same
          photo shows wherever the product appears. */}
      <image-slot
        id={`prod-${p.code.replace(/[^a-z0-9]/gi, '-')}`}
        shape="rounded" radius="2" fit="cover"
        placeholder={t(lang, 'Drop product photo', 'أضف صورة المنتج')}
        style={{ display: 'block', width: '100%', height: 168, marginBottom: 22, background: 'var(--bci-concrete)', border: '1px solid var(--bci-hairline-light)' }}
      ></image-slot>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--bci-navy-400)', fontWeight: 500 }}>{p.code}</span>
        <Icon name="flask" size={16} stroke="var(--bci-steel-300)" />
      </div>
      <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 22, color: 'var(--bci-navy)', margin: '0 0 10px', lineHeight: 1.15 }}>{p[lang].name}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--bci-steel)', margin: '0 0 18px', flex: 1 }}>{p[lang].desc}</p>
      {/* Pack size */}
      {p.size && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '11px 13px', background: 'var(--bci-concrete)', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <Icon name="package" size={15} stroke="var(--bci-steel)" />
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--bci-steel)' }}>{t(lang, 'Pack size', 'حجم العبوة')}</span>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 13, letterSpacing: '0.02em', color: 'var(--bci-navy)', fontWeight: 600, marginInlineStart: 'auto' }}>{p.size}</span>
        </div>
      )}
      {p.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18, justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
          {p.tags.map(tag => (
            <span key={tag} style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '4px 8px', borderRadius: 2, background: 'var(--bci-green-50)', color: 'var(--bci-green-700)', border: '1px solid var(--bci-green-200)' }}>{tag}</span>
          ))}
        </div>
      )}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--bci-hairline-light)', display: 'flex', gap: 18, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <a href="Resources.html" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--bci-navy)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <Icon name="download" size={13} /> TDS
        </a>
        <a href="Contact.html" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--bci-green-700)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          {t(lang, 'Quote', 'عرض سعر')} <Arrow size={12} />
        </a>
      </div>
    </article>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Solutions" />
    <SolutionDetailPage />
    <CtaBand
      title="Specify this system on your project"
      titleAr="اعتمد هذا النظام في مشروعك"
      body="Request technical data sheets, a method statement and a project-specific submittal package."
      bodyAr="اطلب النشرات الفنية وبيان الطريقة وحزمة وثائق خاصة بمشروعك." />
    <Footer />
  </LangProvider>
);
