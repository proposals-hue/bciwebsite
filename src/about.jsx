/* global React, useLang, t, Mark, Icon, Badge, Arrow, Chev */

// ---------- 01 · About ----------
function About() {
  const { lang } = useLang();
  const [ref, inView] = useInView();
  return (
    <section ref={ref} id="about" style={{ background: 'var(--bci-concrete)', padding: '140px 0' }}>
      <div className="container" style={{
        display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 96, alignItems: 'start'
      }}>
        <div>
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 24, ...revealStyle(inView, 0) }}>
            {t(lang, 'About', 'عن الشركة', 'Acerca de')}
          </div>
          <h2 className="display" style={{
            fontFamily: 'var(--ff-display)', fontWeight: 700,
            fontSize: 'clamp(40px, 4.4vw, 64px)',
            lineHeight: 1.02, letterSpacing: '-0.018em',
            color: 'var(--bci-navy)', margin: '0 0 48px',
            maxWidth: 620, ...revealStyle(inView, 90)
          }}>
            {t(lang,
              <>Built in Saudi Arabia<br />Engineered for extremes</>,
              <>صُنعت في السعودية.<br />مهندسة لأقسى الظروف.</>,
              <>Fabricado en Arabia Saudita.<br />Ingeniería para lo extremo.</>
            )}
          </h2>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 24,
            fontSize: 16, lineHeight: 1.65, color: 'var(--bci-steel-700, #3A4149)',
            maxWidth: 560, ...revealStyle(inView, 180)
          }}>
            <p style={{ margin: 0, maxWidth: '100%' }}>
              {t(lang,
                'BCI — Building Chemistry Industry is a Saudi national manufacturer of construction chemicals, formulating polyurethane, epoxy, and polyurea resin systems since 2021. From our Dammam plant, we develop high-performance solutions for waterproofing, industrial flooring, sealants, and protective coatings.',
                'شركة BCI — صناعة كيمياء البناء — مصنع وطني سعودي للكيماويات الإنشائية، يطوّر أنظمة راتنجات البولي يوريثان والإيبوكسي والبولي يوريا منذ 2021. من مصنعنا في الدمام نبتكر حلولاً عالية الأداء لأنظمة العزل والأرضيات الصناعية والمواد المانعة للتسرب والطلاءات الواقية.',
                'BCI — Industria Química de la Construcción es un fabricante nacional saudí de químicos para construcción, formulando sistemas de resina de poliuretano, epoxi y poliurea desde 2021. Desde nuestra planta en Dammam, desarrollamos soluciones de alto rendimiento para impermeabilización, pisos industriales, selladores y recubrimientos protectores.'
              )}
            </p>
            <p style={{ margin: 0, maxWidth: '100%' }}>
              {t(lang,
                'We accompany consultants, contractors, and asset owners through the entire work process — from specification and submittal, to on-site mock-up, application supervision, and long-term performance support.',
                'نرافق الاستشاريين والمقاولين وأصحاب الأصول عبر دورة العمل بأكملها — من إعداد المواصفات والوثائق إلى التجارب الميدانية والإشراف على التطبيق ودعم الأداء طويل الأمد.',
                'Acompañamos a consultores, contratistas y propietarios de activos a lo largo de todo el proceso — desde la especificación y presentación, hasta la muestra en obra, supervisión de aplicación y soporte de rendimiento a largo plazo.'
              )}
            </p>
          </div>

          {/* Credentials */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 44, flexWrap: 'wrap', ...revealStyle(inView, 270) }}>
            <img src="assets/saudi-made-bi-navy.svg"
              alt={t(lang, 'Saudi Made', 'صُنع في السعودية', 'Hecho en Arabia Saudita')}
              style={{ height: 46, width: 'auto', display: 'block' }} />
            <img src="assets/vision-2030-navy.svg"
              alt={t(lang, 'Saudi Vision 2030', 'رؤية السعودية 2030', 'Visión Saudi 2030')}
              style={{ height: 42, width: 'auto', display: 'block' }} />
            <img src="assets/cert-iso-9001.png" alt="ISO 9001:2015"
              style={{ maxHeight: 48, maxWidth: 78, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
            <img src="assets/cert-en-1504-2.png" alt="EN 1504-2"
              style={{ maxHeight: 48, maxWidth: 48, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
            <img src="assets/cert-saso-saber.jpg" alt="SASO / SABER"
              style={{ maxHeight: 44, maxWidth: 78, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>

        <div style={revealStyle(inView, 140, 34)}>
          <AboutVisual />
        </div>
      </div>
    </section>
  );
}

function AboutVisual() {
  const { lang } = useLang();
  return (
    <div style={{
      position: 'relative', aspectRatio: '4 / 5',
      background: 'var(--bci-navy)',
      border: '1px solid var(--bci-navy-600)',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <img src="assets/dammam-plant.jpeg"
        alt={t(lang, 'BCI Dammam plant — reactor hall', 'مصنع BCI بالدمام — قاعة المفاعلات', 'Planta BCI Dammam — sala de reactores')}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
    </div>
  );
}

// ---------- 02 · Why BCI ----------
function WhyBCI() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [ref, inView] = useInView();

  const pillars = [
    {
      num: '01', icon: 'flask',
      en: { t: 'Performance', d: 'A wide range of specialized construction chemical solutions across waterproofing, flooring, sealing, and protection — purpose-formulated for the Gulf.' },
      ar: { t: 'الأداء', d: 'تشكيلة واسعة من الحلول الكيميائية المتخصصة في العزل والأرضيات والمواد المانعة للتسرب والحماية — مصاغة للظروف الخليجية.' },
      es: { t: 'Rendimiento', d: 'Una amplia gama de soluciones químicas especializadas en impermeabilización, pisos, sellado y protección — formuladas para el Golfo.' }
    },
    {
      num: '02', icon: 'shield-check',
      en: { t: 'Technology', d: 'Continuously evolving products developed by our R&D team to meet international standards. Each formulation is tested, verified, and field-proven.' },
      ar: { t: 'التقنية', d: 'منتجات تتطور باستمرار يطوّرها فريق البحث والتطوير وفق المعايير الدولية. كل تركيبة تُختبر وتُعتمد ميدانياً.' },
      es: { t: 'Tecnología', d: 'Productos en constante evolución desarrollados por nuestro equipo de I+D según normas internacionales. Cada formulación es probada, verificada y comprobada en campo.' }
    },
    {
      num: '03', icon: 'droplets',
      en: { t: 'Sustainability', d: 'Proven systems engineered for long-term durability, chemical and UV resistance — reducing rebuild cycles and lifecycle cost.' },
      ar: { t: 'الاستدامة', d: 'أنظمة مثبتة هندسياً للديمومة طويلة الأمد، مقاومة للمواد الكيميائية والأشعة فوق البنفسجية — تقلّل دورات إعادة البناء وتكاليف العمر التشغيلي.' },
      es: { t: 'Sostenibilidad', d: 'Sistemas probados diseñados para durabilidad a largo plazo, resistencia química y UV — reduciendo ciclos de reconstrucción y costo del ciclo de vida.' }
    },
    {
      num: '04', icon: 'factory',
      en: { t: 'Reliability', d: 'From residential applications to national infrastructure, BCI delivers the right system, the right specification, and the right support — every time.' },
      ar: { t: 'الموثوقية', d: 'من التطبيقات السكنية إلى البنية التحتية الوطنية، تقدم BCI النظام الصحيح والمواصفة الصحيحة والدعم المناسب — في كل مرة.' },
      es: { t: 'Confiabilidad', d: 'Desde aplicaciones residenciales hasta infraestructura nacional, BCI entrega el sistema correcto, la especificación correcta y el soporte adecuado — siempre.' }
    }
  ];

  return (
    <section ref={ref} id="why" style={{
      background: 'var(--bci-navy)', color: '#fff',
      borderTop: '1px solid var(--bci-green-500)',
      borderBottom: '1px solid var(--bci-green-500)',
      position: 'relative', overflow: 'hidden',
      padding: '140px 0'
    }}>
      <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative' }}>
        <div className="sec-num" style={{ color: 'var(--bci-green-400)', marginBottom: 24, ...revealStyle(inView, 0) }}>
          {t(lang, 'Why BCI', 'لماذا BCI', '¿Por qué BCI?')}
        </div>
        <h2 className="display" style={{
          fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)',
          fontWeight: 700,
          fontSize: 'clamp(40px, 4.4vw, 64px)',
          lineHeight: isAr ? 1.15 : 1.02,
          letterSpacing: isAr ? 0 : '-0.018em',
          color: '#fff', margin: '0 0 80px',
          maxWidth: 800, ...revealStyle(inView, 90)
        }}>
          {t(lang, 'Why specify BCI?', 'لماذا تختار BCI؟', '¿Por qué especificar BCI?')}
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          borderTop: '1px solid rgba(255,255,255,0.12)'
        }}>
          {pillars.map((p, i) => {
            const d = p[lang] || p.en;
            return (
              <div key={p.num} style={{
                padding: '40px 28px 32px',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                paddingLeft: i === 0 ? 0 : 28,
                paddingRight: i === 3 ? 0 : 28,
                display: 'flex', flexDirection: 'column', gap: 20,
                minHeight: 320, ...revealStyle(inView, 200 + i * 110)
              }}>
                <div style={{
                  fontFamily: 'var(--ff-mono)', fontSize: 14,
                  color: 'var(--bci-green-400)', fontWeight: 500,
                  letterSpacing: '0.1em'
                }}>{p.num}</div>
                <div style={{
                  width: 48, height: 48,
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={p.icon} size={22} stroke="#fff" />
                </div>
                <h3 className="display" style={{
                  fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)',
                  fontWeight: 700, fontSize: 28, color: '#fff',
                  lineHeight: 1.1, letterSpacing: '-0.01em', margin: 0
                }}>{d.t}</h3>
                <p style={{
                  fontSize: 14, lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.55)',
                  margin: 0, maxWidth: '100%'
                }}>{d.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { About, WhyBCI });
