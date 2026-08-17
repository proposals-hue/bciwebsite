/* global React, ReactDOM, LangProvider, useLang, useViewport, t, Icon, Arrow,
   siteHref, MegaHeader, Footer, trackAdsLeadConversion */
const { useEffect: useEffect_ty, useMemo: useMemo_ty } = React;

// Every website request form redirects here on success:
//   /thank-you?type=submittal|sample|rfq&ref=<ERP id>&warn=1
const THANK_YOU_TYPES = ['submittal', 'sample', 'rfq'];

function thankYouParams() {
  try {
    const query = new URLSearchParams(window.location.search);
    const type = query.get('type');
    return {
      type: THANK_YOU_TYPES.includes(type) ? type : 'rfq',
      ref: (query.get('ref') || '').slice(0, 60),
      warn: query.get('warn') === '1',
    };
  } catch (_) {
    return { type: 'rfq', ref: '', warn: false };
  }
}

// Heading, lead paragraph and the three "what happens next" steps, per request
// type. Keyed rather than branched so a fourth form is one more entry.
function thankYouCopy(type, lang) {
  if (type === 'submittal') {
    return {
      heading: t(lang, 'Your submittal request is registered.', 'تم تسجيل طلب وثائق الاعتماد.', 'Tu solicitud de documentación está registrada.'),
      lead: t(lang,
        'Our technical team has your project specification and will prepare the submittal package for the product you selected.',
        'استلم فريقنا الفني مواصفات مشروعك وسيقوم بتجهيز ملف الاعتماد للمنتج الذي اخترته.',
        'Nuestro equipo técnico ha recibido la especificación de tu proyecto y preparará el paquete de aprobación del producto seleccionado.'),
      steps: [
        {
          title: t(lang, 'Technical review', 'مراجعة فنية', 'Revisión técnica'),
          body: t(lang,
            'We read the specification and confirm the BCI product complies with the specified clause.',
            'نراجع المواصفات ونتأكد من مطابقة منتج BCI للبند المحدد.',
            'Leemos la especificación y confirmamos que el producto BCI cumple la cláusula indicada.'),
        },
        {
          title: t(lang, 'Package prepared', 'تجهيز الملف', 'Preparación del paquete'),
          body: t(lang,
            'Data sheets, certificates, test reports and a compliance statement are compiled for your project.',
            'يتم تجميع النشرات الفنية والشهادات وتقارير الاختبار وبيان المطابقة لمشروعك.',
            'Se recopilan fichas técnicas, certificados, informes de ensayo y la declaración de conformidad.'),
        },
        {
          title: t(lang, 'Sent to you', 'الإرسال إليك', 'Envío'),
          body: t(lang,
            'The complete submittal arrives by email, ready to issue to the consultant.',
            'يصلك ملف الاعتماد كاملًا عبر البريد الإلكتروني جاهزًا لتقديمه للاستشاري.',
            'Recibes el paquete completo por correo, listo para presentarlo al consultor.'),
        },
      ],
    };
  }

  if (type === 'sample') {
    return {
      heading: t(lang, 'Your sample request is registered.', 'تم تسجيل طلب العينات.', 'Tu solicitud de muestras está registrada.'),
      lead: t(lang,
        'Our sales team has your requested products and delivery details, and will arrange the samples for your site trial.',
        'استلم فريق المبيعات المنتجات المطلوبة وبيانات التسليم وسيقوم بترتيب العينات لتجربتها في موقعك.',
        'Nuestro equipo comercial ha recibido los productos solicitados y los datos de entrega, y preparará las muestras para tu prueba en obra.'),
      steps: [
        {
          title: t(lang, 'Request reviewed', 'مراجعة الطلب', 'Revisión de la solicitud'),
          body: t(lang,
            'We check the products you chose suit your application and confirm the right sample size.',
            'نتأكد من مناسبة المنتجات التي اخترتها لتطبيقك ونحدد حجم العينة المناسب.',
            'Comprobamos que los productos elegidos se ajustan a tu aplicación y definimos el tamaño de muestra.'),
        },
        {
          title: t(lang, 'Samples prepared', 'تجهيز العينات', 'Preparación de muestras'),
          body: t(lang,
            'The samples are packed with the matching technical data sheets and application guidance.',
            'يتم تجهيز العينات مع النشرات الفنية وإرشادات التطبيق الخاصة بها.',
            'Las muestras se preparan con sus fichas técnicas y las instrucciones de aplicación.'),
        },
        {
          title: t(lang, 'Delivered to you', 'التسليم إليك', 'Entrega'),
          body: t(lang,
            'A member of the sales team calls to confirm the address and arrange delivery to your site.',
            'يتصل بك أحد أعضاء فريق المبيعات لتأكيد العنوان وترتيب التسليم إلى موقعك.',
            'Un miembro del equipo comercial te llama para confirmar la dirección y coordinar la entrega en obra.'),
        },
      ],
    };
  }

  return {
    heading: t(lang, 'Your quote request is registered.', 'تم تسجيل طلب عرض السعر.', 'Tu solicitud de cotización está registrada.'),
    lead: t(lang,
      'Our sales team has your requested products and project details, and will come back to you with pricing and availability.',
      'استلم فريق المبيعات المنتجات المطلوبة وتفاصيل المشروع وسيوافيك بالأسعار والتوفر.',
      'Nuestro equipo comercial ha recibido los productos solicitados y los datos del proyecto, y te responderá con precios y disponibilidad.'),
    steps: [
      {
        title: t(lang, 'Sales review', 'مراجعة المبيعات', 'Revisión comercial'),
        body: t(lang,
          'We confirm the right product and pack size for your application and site conditions.',
          'نؤكد المنتج والعبوة المناسبين لتطبيقك وظروف الموقع.',
          'Confirmamos el producto y el envase adecuados para tu aplicación y las condiciones de obra.'),
      },
      {
        title: t(lang, 'Quotation issued', 'إصدار العرض', 'Emisión de la oferta'),
        body: t(lang,
          'Pricing, lead time and delivery terms are prepared for your project.',
          'يتم تجهيز الأسعار ومدة التوريد وشروط التسليم لمشروعك.',
          'Se preparan precios, plazos de entrega y condiciones para tu proyecto.'),
      },
      {
        title: t(lang, 'Reply within 24 h', 'الرد خلال 24 ساعة', 'Respuesta en 24 h'),
        body: t(lang,
          'A member of the sales team contacts you to confirm quantities and next steps.',
          'يتواصل معك أحد أعضاء فريق المبيعات لتأكيد الكميات والخطوات التالية.',
          'Un miembro del equipo comercial te contacta para confirmar cantidades y próximos pasos.'),
      },
    ],
  };
}

function ThankYouPage() {
  const { lang } = useLang();
  const { isPhone, isMobile } = useViewport();
  const isAr = lang === 'ar';
  const { type, ref, warn } = useMemo_ty(thankYouParams, []);

  // The conversion fires here rather than in the form: a redirect can cut off a
  // tag fired moments before navigation, and this page is only ever reached
  // after ERP accepted the request.
  useEffect_ty(() => { if (typeof trackAdsLeadConversion === 'function') trackAdsLeadConversion(); }, []);

  const { heading, lead, steps } = thankYouCopy(type, lang);

  return (
    <main style={{ background: 'var(--bci-concrete)' }}>
      {/* The header is fixed, so the first section clears it the same way
          PageHero does (104 mobile / 176 desktop) plus its own breathing room. */}
      <section style={{
        paddingTop: isMobile ? 128 : 200,
        paddingBottom: isPhone ? 48 : 80,
      }}>
        <div className="container">
          <div style={{
            maxWidth: 780, marginInline: 'auto', background: '#fff',
            border: '1px solid var(--bci-hairline-light)', borderTop: '3px solid var(--bci-green-500)',
            padding: isPhone ? '32px 22px' : '52px 56px',
            direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--bci-green-50)',
              border: '1px solid var(--bci-green-200)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 24,
              // inline-end:auto already resolves per direction — an isAr branch
              // here would flip the icon to the wrong side in Arabic.
              marginInlineEnd: 'auto',
            }}>
              <Icon name="check" size={26} stroke="var(--bci-green-700)" />
            </div>

            <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 12 }}>
              {t(lang, 'Request received', 'تم استلام الطلب', 'Solicitud recibida')}
            </div>
            <h1 style={{
              fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700,
              fontSize: isPhone ? 30 : 42, lineHeight: isAr ? 1.25 : 1.08,
              letterSpacing: isAr ? 0 : '-0.02em', color: 'var(--bci-navy)', margin: '0 0 16px',
            }}>
              {heading}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--bci-navy-800)', margin: '0 0 28px' }}>
              {lead}
            </p>

            {ref && (
              <div style={{
                background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)',
                padding: '16px 18px', display: 'flex', flexWrap: 'wrap', gap: 6,
                alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28,
              }}>
                <span className="eyebrow" style={{ color: 'var(--bci-steel)' }}>
                  {t(lang, 'Your reference', 'رقم المرجع', 'Tu referencia')}
                </span>
                <strong style={{ fontFamily: 'var(--ff-mono)', fontSize: 17, color: 'var(--bci-navy)', letterSpacing: '0.02em' }}>
                  {ref}
                </strong>
              </div>
            )}

            {warn && (
              <div role="status" style={{
                fontSize: 13, lineHeight: 1.6, color: 'var(--bci-navy-800)', background: '#fffaeb',
                border: '1px solid #fedf89', padding: '12px 14px', marginBottom: 28,
              }}>
                {t(lang,
                  'One attachment could not be linked to the record. Your request itself was registered — our team will contact you if the file is needed again.',
                  'تعذر ربط أحد المرفقات بالسجل. تم تسجيل طلبك بنجاح وسيتواصل معك فريقنا إذا لزم إعادة إرسال الملف.',
                  'No se pudo vincular un archivo adjunto al registro. Tu solicitud sí quedó registrada; nuestro equipo te contactará si el archivo es necesario de nuevo.')}
              </div>
            )}

            <div className="eyebrow" style={{ color: 'var(--bci-steel)', borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 26, marginBottom: 20 }}>
              {t(lang, 'What happens next', 'الخطوات التالية', 'Qué sucede ahora')}
            </div>
            <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {steps.map((step, index) => (
                <li key={step.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 28, height: 28, flexShrink: 0, borderRadius: '50%',
                    background: 'var(--bci-navy)', color: '#fff', fontFamily: 'var(--ff-mono)',
                    fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>{index + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', color: 'var(--bci-navy)', fontSize: 15, marginBottom: 4 }}>{step.title}</strong>
                    <span style={{ color: 'var(--bci-steel)', fontSize: 14, lineHeight: 1.6 }}>{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div style={{
              borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 24,
              display: 'flex', flexWrap: 'wrap', gap: 12,
            }}>
              <a href={siteHref('Solutions.html', lang)} className="btn btn-accent">
                {t(lang, 'Explore products', 'استكشف المنتجات', 'Explorar productos')} <Arrow size={13} />
              </a>
              <a href="/assets/BCI-Company-Profile.pdf" target="_blank" rel="noopener" download className="btn btn-ghost-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                <Icon name="download" size={14} /> {t(lang, 'Download catalog', 'تحميل الدليل', 'Descargar catálogo')}
              </a>
            </div>
          </div>

          <div style={{
            maxWidth: 780, marginInline: 'auto', marginTop: 22, display: 'flex', flexWrap: 'wrap',
            gap: isPhone ? 12 : 28, justifyContent: 'center', alignItems: 'center',
            fontSize: 13, color: 'var(--bci-steel)', textAlign: 'center',
          }}>
            <span>
              {t(lang, 'Need it sooner?', 'تحتاجه بشكل أسرع؟', '¿Lo necesitas antes?')}
            </span>
            <a href="tel:+966593120221" style={{ fontFamily: 'var(--ff-mono)', color: 'var(--bci-navy)', textDecoration: 'none' }}>
              +966 59 312 0221
            </a>
            <a href="mailto:info@bcisaudi.com" style={{ fontFamily: 'var(--ff-mono)', color: 'var(--bci-navy)', textDecoration: 'none' }}>
              info@bcisaudi.com
            </a>
            <a href="https://wa.me/966593120221" target="_blank" rel="noopener" style={{ color: 'var(--bci-green-700)', textDecoration: 'none' }}>
              {t(lang, 'WhatsApp', 'واتساب', 'WhatsApp')}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader />
    <ThankYouPage />
    <Footer />
  </LangProvider>
);
