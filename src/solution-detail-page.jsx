/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow, Chev, Badge,
   MegaHeader, PageHero, CtaBand, Footer, SOLUTIONS */
const { useState: useState_d } = React;

/* Real product photo (lazy-loaded, compressed local asset) with a graceful
   icon fallback for the few products that have no image in the ERP. */
function ProductImg({ src, alt, icon }) {
  const [err, setErr] = useState_d(false);
  // Square frame so the full product (tall drums, pails, rolls) is shown
  // uncropped — images are centred and contained, never clipped.
  const box = {
    width: '100%', aspectRatio: '1 / 1', marginBottom: 22,
    background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
  };
  if (!src || err) {
    return (
      <div style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-steel-300)' }}>
        <Icon name={icon || 'flask'} size={34} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)}
    style={{ ...box, display: 'block', objectFit: 'contain', padding: 12 }} />;
}

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
        eyebrow={t(lang, 'Solution Line', 'خط حلول', 'Línea de Solución')}
        crumb={s[lang].name}
        title={s.en.name} titleAr={s.ar.name} titleEs={(s.es || s.en).name}
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
                <tr><th>{t(lang, 'Line', 'الخط', 'Línea')}</th><td className="value">{s.num}</td></tr>
                <tr><th>{t(lang, 'Products', 'المنتجات', 'Productos')}</th><td className="value">{s.products.length}</td></tr>
                <tr><th>{t(lang, 'Origin', 'المنشأ', 'Origen')}</th><td className="value">KSA</td></tr>
              </tbody>
            </table>
            {standards.length > 0 && <>
              <div className="eyebrow" style={{ color: 'var(--bci-steel)', margin: '28px 0 12px' }}>{t(lang, 'Properties & Standards', 'الخصائص والمعايير', 'Propiedades y Normas')}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
                {standards.map(tag => (
                  <span key={tag} style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '5px 9px', borderRadius: 2, background: 'var(--bci-navy-50)', color: 'var(--bci-navy)', border: '1px solid var(--bci-navy-100)' }}>{tag}</span>
                ))}
              </div>
            </>}
            <a href="Resources.html" className="link-arrow" style={{ marginTop: 28 }}>
              <Icon name="download" size={14} /> {t(lang, 'All datasheets', 'كل النشرات', 'Todas las fichas técnicas')}
            </a>
          </aside>

          {/* Product grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <h2 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 28, color: 'var(--bci-navy)', margin: 0 }}>
                {t(lang, 'Products in this line', 'منتجات هذا الخط', 'Productos de esta línea')}
              </h2>
              <span className="sec-num" style={{ color: 'var(--bci-steel)' }}>{String(s.products.length).padStart(2, '0')} {t(lang, 'items', 'عنصر', 'artículos')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {s.products.map(p => <DetailCard key={p.code} p={p} icon={s.icon} />)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetailCard({ p, icon }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_d(false);
  const sizes = p.sizes || (p.size ? [p.size] : []);
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', border: `1px solid ${hover ? 'var(--bci-navy-600)' : 'var(--bci-hairline-light)'}`,
        borderRadius: 2, padding: 26, display: 'flex', flexDirection: 'column',
        transition: 'border-color 120ms linear', textAlign: isAr ? 'right' : 'left',
      }}>
      <ProductImg src={p.img} alt={p[lang].name} icon={icon} />
      <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 22, color: 'var(--bci-navy)', margin: '0 0 10px', lineHeight: 1.15 }}>{p[lang].name}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--bci-steel)', margin: '0 0 18px', flex: 1 }}>{p[lang].desc}</p>
      {/* Pack sizes (one row per available size from the ERP) */}
      {sizes.length > 0 && (
        <div style={{ marginBottom: 16, padding: '11px 13px', background: 'var(--bci-concrete)', border: '1px solid var(--bci-hairline-light)', borderRadius: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sizes.length ? 8 : 0, flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <Icon name="package" size={14} stroke="var(--bci-steel)" />
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--bci-steel)' }}>{t(lang, 'Pack sizes', 'أحجام العبوات', 'Tamaños de envase')}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
            {sizes.map(sz => (
              <span key={sz} style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--bci-navy)', fontWeight: 600, background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: '3px 8px' }}>{sz}</span>
            ))}
          </div>
        </div>
      )}
      {/* Colours available */}
      {p.colors && p.colors.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--bci-steel)' }}>{t(lang, 'Colours', 'الألوان', 'Colores')}</span>
          <span style={{ fontSize: 13, color: 'var(--bci-navy)' }}>{p.colors.join(' · ')}</span>
        </div>
      )}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--bci-hairline-light)', display: 'flex', gap: 18, alignItems: 'center', flexDirection: isAr ? 'row-reverse' : 'row' }}>
        {p.tds ? (
          <a href={p.tds} target="_blank" rel="noopener" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--bci-navy)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Icon name="download" size={13} /> {t(lang, 'TDS', 'النشرة الفنية', 'Ficha técnica')}
          </a>
        ) : (
          <a href="Contact.html" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--bci-steel)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Icon name="file-text" size={13} /> {t(lang, 'Request TDS', 'اطلب النشرة', 'Solicitar ficha')}
          </a>
        )}
        <a href="Contact.html" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--bci-green-700)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, marginInlineStart: 'auto' }}>
          {t(lang, 'Quote', 'عرض سعر', 'Cotización')} <Arrow size={12} />
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
      titleEs="Especifica este sistema en tu proyecto"
      body="Request technical data sheets, a method statement and a project-specific submittal package."
      bodyAr="اطلب النشرات الفنية وبيان الطريقة وحزمة وثائق خاصة بمشروعك."
      bodyEs="Solicita las fichas técnicas, un procedimiento de aplicación y un paquete de documentación específico para tu proyecto." />
    <Footer />
  </LangProvider>
);
