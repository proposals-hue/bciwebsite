/* global React, ReactDOM, LangProvider, useLang, t, Icon, Arrow,
   MegaHeader, PageHero, CtaBand, Footer, JOBS, BENEFITS, VALUES */
const { useState: useState_cr } = React;

/* striped image placeholder (user drops real photography later) */
function Placeholder({ label, ratio = '4 / 3', dark }) {
  return (
    <div style={{
      position: 'relative', aspectRatio: ratio, borderRadius: 2, overflow: 'hidden',
      background: dark ? 'var(--bci-navy)' : 'var(--bci-steel-100)',
      border: `1px solid ${dark ? 'var(--bci-navy-600)' : 'var(--bci-hairline-light)'}`,
    }}>
      <div className={dark ? 'hatch' : 'hatch-navy'} style={{ position: 'absolute', inset: 0, opacity: dark ? 0.6 : 1 }} />
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.5)' : 'var(--bci-steel)',
      }}>{label}</span>
    </div>
  );
}

function CareerPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [role, setRole] = useState_cr('');
  const [sent, setSent] = useState_cr(false);

  const apply = (jobTitle) => {
    setRole(jobTitle);
    const el = document.getElementById('apply');
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Career', 'الوظائف')}
        crumb={t(lang, 'Career', 'الوظائف')}
        title="Build the Kingdom’s chemistry."
        titleAr="ابنِ كيمياء المملكة."
        subtitle={t(lang,
          'Join a Saudi national manufacturer at the centre of Vision 2030 industrial growth. We hire engineers, chemists, and builders who care about getting it right.',
          'انضم إلى مصنع وطني سعودي في قلب النمو الصناعي لرؤية 2030. نوظّف مهندسين وكيميائيين وبنّائين يهتمون بإتقان العمل.')}
      />

      {/* Values */}
      <section style={{ background: 'var(--bci-concrete)', padding: '120px 0' }}>
        <div className="container">
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Why BCI', 'لماذا BCI')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--bci-hairline-light)' }}>
            {VALUES.map((v, i) => (
              <div key={v.num} style={{ padding: '40px 28px', borderRight: i < 2 ? '1px solid var(--bci-hairline-light)' : 'none', paddingLeft: i === 0 ? 0 : 28, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 14, color: 'var(--bci-green-600)', marginBottom: 20 }}>{v.num}</div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 26, color: 'var(--bci-navy)', margin: '0 0 12px' }}>{v[lang].t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: 0 }}>{v[lang].d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: 'var(--bci-navy)', color: '#fff', padding: '120px 0', borderTop: '1px solid var(--bci-green-500)', borderBottom: '1px solid var(--bci-green-500)', position: 'relative', overflow: 'hidden' }}>
        <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="sec-num" style={{ color: 'var(--bci-green-400)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Benefits', 'المزايا')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ padding: '36px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingLeft: i === 0 ? 0 : 24, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ width: 46, height: 46, border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon name={b.icon} size={22} stroke="#fff" />
                </div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 0 10px' }}>{b[lang].t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{b[lang].d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section id="roles" style={{ background: 'var(--bci-concrete)', padding: '120px 0', scrollMarginTop: 72 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: 0 }}>
              {t(lang, 'Open positions', 'الوظائف الشاغرة')}
            </h2>
            <span className="sec-num" style={{ color: 'var(--bci-steel)' }}>{JOBS.length} {t(lang, 'roles', 'وظيفة')}</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2 }}>
            {JOBS.map((j, i) => <JobRow key={j.id} j={j} last={i === JOBS.length - 1} onApply={apply} />)}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" style={{ background: 'var(--bci-paper)', padding: '120px 0', scrollMarginTop: 72 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Apply', 'تقديم طلب')}</div>
          <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 32px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang, 'Send your application', 'أرسل طلبك')}
          </h2>
          <form onSubmit={e => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); }}
            style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: 36, display: 'flex', flexDirection: 'column', gap: 20, direction: isAr ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field"><label>{t(lang, 'Full name', 'الاسم الكامل')}</label><input required type="text" /></div>
              <div className="field"><label>{t(lang, 'Email', 'البريد')}</label><input required type="email" placeholder="name@email.com" /></div>
              <div className="field"><label>{t(lang, 'Phone', 'الهاتف')}</label><input type="tel" placeholder="+966" /></div>
              <div className="field"><label>{t(lang, 'Position', 'الوظيفة')}</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">{t(lang, 'Select a role…', 'اختر وظيفة…')}</option>
                  {JOBS.map(j => <option key={j.id} value={j.title.en}>{j.title[lang]}</option>)}
                  <option value="open">{t(lang, 'Open application', 'طلب مفتوح')}</option>
                </select>
              </div>
            </div>
            <div className="field"><label>{t(lang, 'Cover note', 'نبذة تعريفية')}</label><textarea placeholder={t(lang, 'Tell us about your experience…', 'حدثنا عن خبرتك…')}></textarea></div>
            <div className="field"><label>{t(lang, 'CV / Resume (PDF)', 'السيرة الذاتية (PDF)')}</label><input type="file" accept=".pdf,.doc,.docx" /></div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
              {sent ? <><Icon name="check" size={14} stroke="#fff" /> {t(lang, 'Application sent', 'تم الإرسال')}</> : <>{t(lang, 'Submit application', 'إرسال الطلب')} <Arrow size={14} /></>}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function JobRow({ j, last, onApply }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_cr(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '26px 28px', borderBottom: last ? 'none' : '1px solid var(--bci-hairline-light)', background: hover ? 'var(--bci-steel-50)' : 'transparent', transition: 'background 100ms', flexDirection: isAr ? 'row-reverse' : 'row' }}>
      <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '4px 8px', borderRadius: 2, background: 'var(--bci-navy-50)', color: 'var(--bci-navy)', border: '1px solid var(--bci-navy-100)' }}>{j.dept[lang]}</span>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '4px 8px', borderRadius: 2, color: 'var(--bci-steel)', border: '1px solid var(--bci-hairline-light)' }}>{j.loc[lang]}</span>
        </div>
        <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 21, color: 'var(--bci-navy)', margin: '0 0 6px' }}>{j.title[lang]}</h3>
        <p style={{ fontSize: 14, color: 'var(--bci-steel)', margin: 0 }}>{j.blurb[lang]}</p>
      </div>
      <button onClick={() => onApply(j.title.en)} className="btn btn-ghost-navy" style={{ whiteSpace: 'nowrap' }}>{t(lang, 'Apply', 'تقديم')} <Arrow size={13} /></button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Career" />
    <CareerPage />
    <Footer />
  </LangProvider>
);
