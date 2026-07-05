/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow,
   MegaHeader, PageHero, CtaBand, Footer, SOLUTIONS, SEO_LANDING_PAGES,
   productHref, solutionHref, siteHref, submitErpWebForm, trackAdsLeadConversion */
const { useState: useState_lp } = React;

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

function LandingLeadForm({ page }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [form, setForm] = useState_lp({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState_lp('idle'); // idle | sending | sent | error
  const submitted = status === 'sent';

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      // → ERPNext 'contact-bci' guest web form → creates a CRM Lead (keyless).
      // The [LP: …] prefix tells sales the lead came from this landing page.
      await submitErpWebForm('contact-bci', {
        doctype: 'Lead',
        lead_name: form.name,
        email_id: form.email,
        mobile_no: form.phone,
        custom_message: `[LP: ${page.path} | lang: ${lang}]${form.message ? ' ' + form.message : ''}`,
      });
      setStatus('sent');
      setForm({ name: '', phone: '', email: '', message: '' });
      if (window.trackAdsLeadConversion) window.trackAdsLeadConversion();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{
      background: '#fff',
      border: '1px solid var(--bci-hairline-light)',
      borderRadius: 2,
      padding: 36,
      maxWidth: 560, margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: 20,
      direction: isAr ? 'rtl' : 'ltr',
      textAlign: isAr ? 'right' : 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{
          fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)',
          fontWeight: 600, fontSize: 28,
          color: 'var(--bci-navy)', margin: 0,
          letterSpacing: isAr ? 0 : '-0.01em'
        }}>
          {t(lang, 'Request a quote', 'اطلب عرض سعر', 'Solicitar cotización')}
        </h3>
        <span className="eyebrow" style={{ color: 'var(--bci-steel)' }}>
          {t(lang, 'Reply within 24 h', 'رد خلال 24 ساعة', 'Respuesta en 24 h')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label>{t(lang, 'Name', 'الاسم', 'Nombre')}</label>
          <input type="text" required value={form.name} onChange={onChange('name')} placeholder={t(lang, 'Full name', 'الاسم الكامل', 'Nombre completo')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Phone', 'الهاتف', 'Teléfono')}</label>
          <input type="tel" required value={form.phone} onChange={onChange('phone')} placeholder="+966" />
        </div>
      </div>

      <div className="field">
        <label>{t(lang, 'Email (optional)', 'البريد الإلكتروني (اختياري)', 'Correo (opcional)')}</label>
        <input type="email" value={form.email} onChange={onChange('email')} placeholder="name@firm.com" />
      </div>

      <div className="field">
        <label>{t(lang, 'Message (optional)', 'الرسالة (اختياري)', 'Mensaje (opcional)')}</label>
        <textarea value={form.message} onChange={onChange('message')}
        placeholder={t(lang, 'Project, scope, square metres…', 'المشروع، النطاق، الأمتار المربعة…', 'Proyecto, alcance, metros cuadrados…')} />
      </div>

      <button type="submit" disabled={status === 'sending'} className="btn btn-accent" style={{
        width: '100%', justifyContent: 'center', padding: '16px 22px',
        marginTop: 4, opacity: status === 'sending' ? 0.7 : 1,
        cursor: status === 'sending' ? 'wait' : 'pointer'
      }}>
        {submitted ?
        <>
            <Icon name="check" size={14} stroke="#fff" />
            {t(lang, 'Sent', 'تم الإرسال', 'Enviado')}
          </> :
        status === 'sending' ?
        <>{t(lang, 'Sending…', 'جارٍ الإرسال…', 'Enviando…')}</> :

        <>
            {t(lang, 'Send request', 'إرسال الطلب', 'Enviar solicitud')} <Arrow size={14} />
          </>
        }
      </button>

      {status === 'error' &&
        <div role="alert" style={{
          fontSize: 13, color: '#b42318', background: '#fef3f2',
          border: '1px solid #fda29b', borderRadius: 2, padding: '12px 14px',
          textAlign: isAr ? 'right' : 'left'
        }}>
          {t(lang,
            'Something went wrong sending your message. Please try again, or email us directly at info@bcisaudi.com.',
            'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى أو مراسلتنا مباشرة على info@bcisaudi.com.',
            'Hubo un problema al enviar tu mensaje. Inténtalo de nuevo o escríbenos a info@bcisaudi.com.')}
        </div>
      }

      <div style={{
        fontFamily: 'var(--ff-mono)', fontSize: 12, textAlign: 'center',
        color: 'var(--bci-steel)'
      }}>
        {t(lang, 'or call', 'أو اتصل على', 'o llama al')}{' '}
        <a href="tel:+966593120221" style={{ color: 'var(--bci-navy)', fontWeight: 600 }} dir="ltr">+966 59 312 0221</a>
      </div>
    </form>);
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
              {t(lang, 'Request a quote', 'اطلب عرض سعر', 'Solicitar cotización')} <Arrow size={14} />
            </a>
            <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 14 }}>
              {t(lang, 'Popular searches', 'عمليات بحث شائعة', 'Búsquedas populares')}
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
                {t(lang, 'View matching solution line', 'عرض خط الحل المناسب', 'Ver línea relacionada')} <Arrow size={13} />
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
                  {t(lang, 'Relevant BCI systems', 'أنظمة BCI المناسبة', 'Sistemas BCI relacionados')}
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
                  {t(lang, 'Matching products', 'منتجات مناسبة', 'Productos relacionados')}
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
          <LandingLeadForm page={page} />
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
      titleAr="تحتاج توصية خاصة بمشروعك؟"
      titleEs="¿Necesitas una recomendación para tu proyecto?"
      body="Send the site condition, substrate and required performance. BCI can help match the right system and documents."
      bodyAr="أرسل حالة الموقع والسطح والأداء المطلوب، وسيساعدك فريق BCI على اختيار النظام والوثائق المناسبة."
      bodyEs="Envía la condición de obra, el sustrato y el desempeño requerido. BCI puede ayudar a elegir el sistema y documentos adecuados." />
    <Footer />
  </LangProvider>
);
