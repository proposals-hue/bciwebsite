/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow,
   MegaHeader, PageHero, CtaBand, Footer, RESOURCES, RESOURCE_TYPES */
const { useState: useState_r } = React;

function ResourcesPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [type, setType] = useState_r('all');
  const [q, setQ] = useState_r('');

  const filtered = RESOURCES.filter(r => {
    const okType = type === 'all' || r.type === type;
    const hay = (r.en + ' ' + r.ar + ' ' + r.code).toLowerCase();
    const okQ = !q || hay.includes(q.toLowerCase());
    return okType && okQ;
  });

  const catalog = RESOURCES.find(r => r.code === 'BCI' && r.type === 'catalog');

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Resources', 'الموارد')}
        crumb={t(lang, 'Resources', 'الموارد')}
        title="Documentation library."
        titleAr="مكتبة الوثائق."
        subtitle={t(lang,
          'Technical data sheets, safety data sheets, catalogs, method statements and certifications — everything you need to specify and apply BCI systems.',
          'النشرات الفنية ونشرات السلامة والكتالوجات وبيانات الطريقة والشهادات — كل ما تحتاجه لمواصفة وتطبيق أنظمة BCI.')}
      />

      {/* Featured catalog */}
      <section style={{ background: 'var(--bci-navy-800)', padding: '40px 0' }}>
        <div className="container">
          <a href="#lib" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            background: 'var(--bci-navy)', border: '1px solid var(--bci-navy-tint)', borderRadius: 2,
            padding: '28px 32px', textDecoration: 'none', flexDirection: isAr ? 'row-reverse' : 'row',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div style={{ width: 56, height: 56, border: '1px solid var(--bci-green-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-green-400)', flexShrink: 0 }}>
                <Icon name="book" size={26} />
              </div>
              <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                <div className="eyebrow" style={{ color: 'var(--bci-green-400)', marginBottom: 8 }}>{t(lang, 'Featured', 'مميّز')}</div>
                <div style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 24, color: '#fff' }}>{catalog[lang]}</div>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{catalog.fmt} · {catalog.size}</div>
              </div>
            </div>
            <span className="btn btn-accent"><Icon name="download" size={14} /> {t(lang, 'Download', 'تحميل')}</span>
          </a>
        </div>
      </section>

      {/* Library */}
      <section id="lib" style={{ background: 'var(--bci-concrete)', padding: '72px 0 120px', scrollMarginTop: 72 }}>
        <div className="container">
          {/* Search */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isAr ? 'right' : 'left']: 14, color: 'var(--bci-steel)' }}><Icon name="search" size={16} /></span>
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder={t(lang, 'Search documents…', 'ابحث في الوثائق…')}
                style={{
                  width: '100%', padding: isAr ? '13px 44px 13px 14px' : '13px 14px 13px 44px',
                  fontFamily: 'var(--ff-sans)', fontSize: 15, color: 'var(--bci-ink)', background: '#fff',
                  border: '1px solid var(--bci-hairline-light)', borderRadius: 2, outline: 'none',
                  textAlign: isAr ? 'right' : 'left',
                }} />
            </div>
          </div>

          {/* Type tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            {[{ id: 'all', en: 'All', ar: 'الكل', icon: 'layout-grid' }, ...RESOURCE_TYPES].map(rt => {
              const on = type === rt.id;
              return (
                <button key={rt.id} onClick={() => setType(rt.id)} style={{
                  fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500,
                  padding: '10px 14px', borderRadius: 2, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  border: `1px solid ${on ? 'var(--bci-navy)' : 'var(--bci-hairline-light)'}`,
                  background: on ? 'var(--bci-navy)' : 'transparent', color: on ? '#fff' : 'var(--bci-navy)',
                }}>
                  <Icon name={rt.icon} size={14} /> {t(lang, rt.en, rt.ar)}
                </button>
              );
            })}
          </div>

          {/* Document list */}
          <div style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, marginTop: 24 }}>
            {filtered.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--bci-steel)', fontFamily: 'var(--ff-mono)', fontSize: 13 }}>
                {t(lang, 'No documents match your search.', 'لا توجد وثائق مطابقة لبحثك.')}
              </div>
            )}
            {filtered.map((r, i) => <DocRow key={i} r={r} last={i === filtered.length - 1} />)}
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--bci-steel)', textAlign: isAr ? 'right' : 'left' }}>
            {filtered.length} {t(lang, 'documents', 'وثيقة')}
          </div>
        </div>
      </section>
    </main>
  );
}

function DocRow({ r, last }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_r(false);
  const meta = RESOURCE_TYPES.find(t2 => t2.id === r.type);
  return (
    <a href="#download" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px', textDecoration: 'none',
        borderBottom: last ? 'none' : '1px solid var(--bci-hairline-light)',
        background: hover ? 'var(--bci-steel-50)' : 'transparent', transition: 'background 100ms linear',
        flexDirection: isAr ? 'row-reverse' : 'row',
      }}>
      <div style={{ width: 42, height: 42, border: '1px solid var(--bci-hairline-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bci-navy)', flexShrink: 0 }}>
        <Icon name={meta.icon} size={18} />
      </div>
      <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
        <div style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)', fontSize: 15, fontWeight: 600, color: 'var(--bci-navy)' }}>{r[lang]}</div>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--bci-steel)', marginTop: 4, textTransform: 'uppercase' }}>
          {t(lang, meta.en, meta.ar)} · {r.fmt} · {r.size}
        </div>
      </div>
      <span style={{ color: hover ? 'var(--bci-green-600)' : 'var(--bci-steel)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
        <Icon name="download" size={16} />
      </span>
    </a>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Resources" />
    <ResourcesPage />
    <CtaBand
      title="Can’t find a document?"
      titleAr="لم تجد الوثيقة المطلوبة؟"
      body="Request a specific data sheet, method statement or project submittal from our technical team."
      bodyAr="اطلب نشرة فنية أو بيان طريقة أو وثائق مشروع محددة من فريقنا الفني." />
    <Footer />
  </LangProvider>
);
