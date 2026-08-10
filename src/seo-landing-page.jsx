/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow,
   MegaHeader, PageHero, CtaBand, Footer, SOLUTIONS, SEO_LANDING_PAGES,
   productHref, solutionHref, CustomerRfqForm */

function getLandingPage() {
  try {
    const cleanPath = location.pathname
      .replace(/^\/(ar|es)(?=\/|$)/, '')
      .replace(/^\//, '')
      .replace(/\.html$/i, '');
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('page');
    return SEO_LANDING_PAGES.find((p) => p.path === cleanPath || p.path === fromQuery) || SEO_LANDING_PAGES[0];
  } catch (e) {
    return SEO_LANDING_PAGES[0];
  }
}

function langContent(page, lang) {
  return page[lang] || page.en;
}

function pageCategories(page) {
  const slugs = page.categorySlugs || [];
  return slugs.map((slug) => SOLUTIONS.find((s) => s.slug === slug)).filter(Boolean);
}

function landingProducts(categories) {
  const products = [];
  categories.forEach((cat) => {
    cat.products.slice(0, categories.length > 1 ? 2 : 8).forEach((prod) => products.push({ cat, prod }));
  });
  return products.slice(0, 10);
}

function SeoLandingPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const page = getLandingPage();
  const content = langContent(page, lang);
  const categories = pageCategories(page);
  const products = landingProducts(categories);
  const primary = categories[0];

  return (
    <main>
      <PageHero
        eyebrow={content.eyebrow}
        crumb={content.eyebrow}
        title={page.en.h1}
        titleAr={(page.ar || page.en).h1}
        titleEs={(page.es || page.en).h1}
        subtitle={content.description}
      />

      <section style={{ background: 'var(--bci-concrete)', padding: '82px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 360px) 1fr', gap: 48, alignItems: 'start', direction: isAr ? 'rtl' : 'ltr' }}>
          <aside style={{ position: 'sticky', top: 96, textAlign: isAr ? 'right' : 'left' }}>
            <a href="#quote" className="btn btn-accent" style={{ marginBottom: 28 }}>
              {t(lang, 'Request a quote', 'Ø§Ø·Ù„Ø¨ Ø¹Ø±Ø¶ Ø³Ø¹Ø±', 'Solicitar cotizaciÃ³n')} <Arrow size={14} />
            </a>
            <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 14 }}>
              {t(lang, 'Popular searches', 'Ø¹Ù…Ù„ÙŠØ§Øª Ø¨Ø­Ø« Ø´Ø§Ø¦Ø¹Ø©', 'BÃºsquedas populares')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
              {(page.keywords || []).map((keyword) => (
                <span key={keyword} style={{
                  display: 'inline-flex', alignItems: 'center', padding: '7px 10px',
                  border: '1px solid var(--bci-hairline-light)', background: '#fff', borderRadius: 2,
                  fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--bci-navy)',
                }}>{keyword}</span>
              ))}
            </div>
            {primary && (
              <a href={solutionHref(primary.slug, lang)} className="link-arrow" style={{ marginTop: 24 }}>
                {t(lang, 'View matching solution line', 'Ø¹Ø±Ø¶ Ø®Ø· Ø§Ù„Ø­Ù„ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨', 'Ver lÃ­nea relacionada')} <Arrow size={13} />
              </a>
            )}
          </aside>

          <article style={{ textAlign: isAr ? 'right' : 'left' }}>
            <h2 style={{
              fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
              fontSize: 34, lineHeight: 1.1, color: 'var(--bci-navy)', margin: '0 0 18px',
            }}>{content.h1}</h2>
            <p style={{ fontSize: 17, lineHeight: 1.72, color: 'var(--bci-graphite)', margin: '0 0 28px' }}>{content.intro}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 42 }}>
              {(content.points || []).map((point) => (
                <div key={point} style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: 20 }}>
                  <Icon name="check" size={17} stroke="var(--bci-green-600)" />
                  <p style={{ margin: '12px 0 0', color: 'var(--bci-navy-800)', fontSize: 14, lineHeight: 1.55 }}>{point}</p>
                </div>
              ))}
            </div>

            {categories.length > 0 && (
              <section style={{ marginBottom: 42 }}>
                <div className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 14 }}>
                  {t(lang, 'Relevant BCI systems', 'Ø£Ù†Ø¸Ù…Ø© BCI Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©', 'Sistemas BCI relacionados')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  {categories.map((cat) => {
                    const catCopy = (cat[lang] || cat.en);
                    const seo = cat.seo && (cat.seo[lang] || cat.seo.en);
                    return (
                      <a key={cat.slug} href={solutionHref(cat.slug, lang)} style={{
                        display: 'block', background: '#fff', border: '1px solid var(--bci-hairline-light)',
                        borderRadius: 2, padding: 22, textDecoration: 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: isAr ? 'row-reverse' : 'row' }}>
                          <Icon name={cat.icon} size={22} stroke="var(--bci-green-600)" />
                          <strong style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontSize: 18, color: 'var(--bci-navy)' }}>{catCopy.name}</strong>
                        </div>
                        <p style={{ margin: '12px 0 0', color: 'var(--bci-steel)', fontSize: 14, lineHeight: 1.55 }}>{seo ? seo.description : catCopy.tagline}</p>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section>
                <div className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 14 }}>
                  {t(lang, 'Matching products', 'Ù…Ù†ØªØ¬Ø§Øª Ù…Ù†Ø§Ø³Ø¨Ø©', 'Productos relacionados')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {products.map(({ cat, prod }) => {
                    const p = prod[lang] || prod.en;
                    return (
                      <a key={`${cat.slug}-${prod.code}`} href={productHref(cat.slug, prod.code, lang)} style={{
                        background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
                        padding: 18, textDecoration: 'none', display: 'block',
                      }}>
                        <div style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', color: 'var(--bci-navy)', fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{p.name}</div>
                        <p style={{ color: 'var(--bci-steel)', fontSize: 13, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.desc}</p>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </article>
        </div>
      </section>

      <section id="quote" style={{ background: '#fff', padding: '82px 0' }}>
        <div className="container">
          <CustomerRfqForm source={`SEO landing page: ${page.path}`} maxWidth={760} />
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Solutions" />
    <SeoLandingPage />
    <CtaBand
      title="Need a project-specific recommendation?"
      titleAr="ØªØ­ØªØ§Ø¬ ØªÙˆØµÙŠØ© Ø®Ø§ØµØ© Ø¨Ù…Ø´Ø±ÙˆØ¹ÙƒØŸ"
      titleEs="Â¿Necesitas una recomendaciÃ³n para tu proyecto?"
      body="Send the site condition, substrate and required performance. BCI can help match the right system and documents."
      bodyAr="Ø£Ø±Ø³Ù„ Ø­Ø§Ù„Ø© Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„Ø³Ø·Ø­ ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ØŒ ÙˆØ³ÙŠØ³Ø§Ø¹Ø¯Ùƒ ÙØ±ÙŠÙ‚ BCI Ø¹Ù„Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©."
      bodyEs="EnvÃ­a la condiciÃ³n de obra, el sustrato y el desempeÃ±o requerido. BCI puede ayudar a elegir el sistema y documentos adecuados." />
    <Footer />
  </LangProvider>
);
