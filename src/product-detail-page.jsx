/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow, MegaHeader,
   PageHero, CtaBand, Footer, SOLUTIONS, productSlug, productHref, solutionHref,
   siteHref */
const { useState: useState_pd } = React;

/* Real product photo (lazy-loaded local asset) with a graceful icon fallback
   for the few products with no ERP image — mirrors the solution-line card. */
function ProductHeroImg({ src, alt, icon }) {
  const [err, setErr] = useState_pd(false);
  const box = {
    width: '100%', aspectRatio: '1 / 1',
    background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
  };
  if (!src || err) {
    return (
      <div style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-steel-300)' }}>
        <Icon name={icon || 'flask'} size={56} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="eager" onError={() => setErr(true)}
    style={{ ...box, display: 'block', objectFit: 'contain', padding: 24 }} />;
}

// Resolve the category + product from the clean URL (/solutions/<cat>/<prod>.html)
// or the dev fallback query (?cat=<cat>&product=<prod>).
function getProductCtx() {
  let catSlug, prodSlug2;
  try {
    const m = location.pathname.match(/\/solutions\/([^/]+)\/([^/]+?)(?:\.html)?$/);
    if (m) { catSlug = m[1]; prodSlug2 = m[2]; }
    else {
      const q = new URLSearchParams(location.search);
      catSlug = q.get('cat'); prodSlug2 = q.get('product');
    }
  } catch (e) { /* ignore */ }
  const cat = SOLUTIONS.find(s => s.slug === catSlug) || SOLUTIONS[0];
  const prod = cat.products.find(p => productSlug(p.code) === prodSlug2) || cat.products[0];
  return { cat, prod };
}

function ProductDetailPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { cat, prod } = getProductCtx();
  const p = prod[lang] || prod.en;
  const sizes = prod.sizes || (prod.size ? [prod.size] : []);
  const related = cat.products.filter(x => x.code !== prod.code).slice(0, 4);
  const quoteHref = `${siteHref('Request Quote.html')}?product=${encodeURIComponent(prod.code)}#rfq-form`;
  const submittalHref = `${siteHref('Submittal Request.html')}?product=${encodeURIComponent(prod.code)}#submittal-form`;

  const specRows = [
    [t(lang, 'Solution line', 'خط الحلول', 'Línea'), (cat[lang] || cat.en).name],
    [t(lang, 'Product code', 'رمز المنتج', 'Código'), prod.code],
    [t(lang, 'Origin', 'المنشأ', 'Origen'), t(lang, 'Saudi Arabia (KSA)', 'السعودية', 'Arabia Saudita')],
  ];

  return (
    <main>
      <PageHero
        eyebrow={(cat[lang] || cat.en).name}
        crumb={p.name}
        title={prod.en.name} titleAr={prod.ar.name} titleEs={(prod.es || prod.en).name}
        subtitle={p.desc}
      />

      <section style={{ background: 'var(--bci-concrete)', padding: '72px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 56, alignItems: 'start', direction: isAr ? 'rtl' : 'ltr' }}>
          {/* Image + back link */}
          <div style={{ position: 'sticky', top: 96 }}>
            <ProductHeroImg src={prod.img} alt={p.name} icon={cat.icon} />
            <a href={solutionHref(cat.slug)} className="link-arrow" style={{ marginTop: 20 }}>
              <span style={{ display: 'inline-flex', transform: isAr ? 'none' : 'scaleX(-1)' }}><Icon name="arrow-right" size={14} /></span> {t(lang, 'Back to', 'العودة إلى', 'Volver a')} {(cat[lang] || cat.en).name}
            </a>
          </div>

          {/* Details */}
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 12 }}>{t(lang, 'Description', 'الوصف', 'Descripción')}</div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--bci-navy-800)', margin: '0 0 32px' }}>{p.desc}</p>

            {/* Spec table */}
            <table className="spec-table" style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', width: '100%' }}>
              <tbody>
                {specRows.map(([k, v]) => (
                  <tr key={k}><th>{k}</th><td className="value">{v}</td></tr>
                ))}
                {sizes.length > 0 && (
                  <tr><th>{t(lang, 'Pack sizes', 'أحجام العبوات', 'Tamaños de envase')}</th><td className="value">{sizes.join(' · ')}</td></tr>
                )}
                {prod.colors && prod.colors.length > 0 && (
                  <tr><th>{t(lang, 'Colours', 'الألوان', 'Colores')}</th><td className="value">{prod.colors.join(' · ')}</td></tr>
                )}
              </tbody>
            </table>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 28, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              {prod.tds ? (
                <a href={prod.tds} target="_blank" rel="noopener" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                  <Icon name="download" size={15} /> {t(lang, 'Download TDS', 'حمّل النشرة الفنية', 'Descargar ficha técnica')}
                </a>
              ) : (
                <a href={siteHref('Resources.html')} className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                  <Icon name="file-text" size={15} /> {t(lang, 'Request TDS', 'اطلب النشرة', 'Solicitar ficha')}
                </a>
              )}
              <a href={quoteHref} className="btn btn-ghost-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                {t(lang, 'Request a quote', 'اطلب عرض سعر', 'Solicitar cotización')} <Arrow size={13} />
              </a>
              <a href={submittalHref} className="btn btn-ghost-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                {t(lang, 'Request a submittal', 'اطلب وثائق الاعتماد', 'Solicitar documentación')} <Arrow size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related products in this line */}
      {related.length > 0 && (
        <section style={{ background: '#fff', padding: '72px 0', borderTop: '1px solid var(--bci-hairline-light)' }}>
          <div className="container" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            <h2 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 26, color: 'var(--bci-navy)', margin: '0 0 28px', textAlign: isAr ? 'right' : 'left' }}>
              {t(lang, 'More in', 'المزيد في', 'Más en')} {(cat[lang] || cat.en).name}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {related.map(r => {
                const rp = r[lang] || r.en;
                return (
                  <a key={r.code} href={productHref(cat.slug, r.code)} style={{
                    background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
                    padding: 18, textDecoration: 'none', display: 'block', textAlign: isAr ? 'right' : 'left',
                  }}>
                    <div style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 16, color: 'var(--bci-navy)', marginBottom: 6 }}>{rp.name}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--bci-steel)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rp.desc}</div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Solutions" />
    <ProductDetailPage />
    <CtaBand
      title="Specify this product on your project"
      titleAr="اعتمد هذا المنتج في مشروعك"
      titleEs="Especifica este producto en tu proyecto"
      body="Request technical data sheets, a method statement and a project-specific submittal package."
      bodyAr="اطلب النشرات الفنية وبيان الطريقة وحزمة وثائق خاصة بمشروعك."
      bodyEs="Solicita las fichas técnicas, un procedimiento de aplicación y un paquete de documentación específico para tu proyecto." />
    <Footer />
  </LangProvider>
);
