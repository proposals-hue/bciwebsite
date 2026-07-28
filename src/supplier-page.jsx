/* global React, ReactDOM, LangProvider, useLang, useViewport, t, Icon, Arrow,
   MegaHeader, PageHero, Footer, submitErpWebForm */
const { useState: useState_sp } = React;

/* What BCI procures — drives the category grid. */
const PROCUREMENT = [
  { icon: 'flask',
    en: { t: 'Raw Materials & Chemicals', d: 'Polyols, isocyanates, epoxy resins, acrylics, additives, pigments and specialty chemicals.' },
    ar: { t: 'المواد الخام والكيماويات', d: 'البوليولات، الإيزوسيانات، راتنجات الإيبوكسي، الأكريليك، الإضافات، الأصباغ والكيماويات المتخصصة.' },
    es: { t: 'Materias Primas y Químicos', d: 'Polioles, isocianatos, resinas epóxicas, acrílicos, aditivos, pigmentos y químicos especializados.' } },
  { icon: 'layers',
    en: { t: 'Fillers & Aggregates', d: 'Silica sand, quartz, calcium carbonate, cement and mineral fillers.' },
    ar: { t: 'الحشوات والركام', d: 'رمل السيليكا، الكوارتز، كربونات الكالسيوم، الأسمنت والحشوات المعدنية.' },
    es: { t: 'Cargas y Agregados', d: 'Arena de sílice, cuarzo, carbonato de calcio, cemento y cargas minerales.' } },
  { icon: 'package',
    en: { t: 'Packaging', d: 'Pails, drums, bags, cartridges, IBCs, labels and printed packaging.' },
    ar: { t: 'مواد التعبئة والتغليف', d: 'الدلاء، البراميل، الأكياس، الخراطيش، حاويات IBC، الملصقات والتغليف المطبوع.' },
    es: { t: 'Envases y Embalaje', d: 'Cubetas, tambores, sacos, cartuchos, IBCs, etiquetas y embalaje impreso.' } },
  { icon: 'factory',
    en: { t: 'Equipment & Spares', d: 'Mixers, pumps, spray rigs, lab instruments and production spare parts.' },
    ar: { t: 'المعدات وقطع الغيار', d: 'الخلاطات، المضخات، أجهزة الرش، أجهزة المختبر وقطع غيار الإنتاج.' },
    es: { t: 'Equipos y Repuestos', d: 'Mezcladoras, bombas, equipos de proyección, instrumentos de laboratorio y repuestos de producción.' } },
  { icon: 'globe',
    en: { t: 'Logistics & Transport', d: 'Freight, fleet services, customs clearance and warehousing.' },
    ar: { t: 'الخدمات اللوجستية والنقل', d: 'الشحن، خدمات الأسطول، التخليص الجمركي والتخزين.' },
    es: { t: 'Logística y Transporte', d: 'Flete, servicios de flota, despacho aduanero y almacenamiento.' } },
  { icon: 'briefcase',
    en: { t: 'Services & Contracting', d: 'Maintenance, calibration, facility services and specialist contracting.' },
    ar: { t: 'الخدمات والمقاولات', d: 'الصيانة، المعايرة، خدمات المرافق والمقاولات المتخصصة.' },
    es: { t: 'Servicios y Contratación', d: 'Mantenimiento, calibración, servicios de instalaciones y contratación especializada.' } },
];

/* Country names must match the ERP's Country records exactly (Supplier.country
   is a Link field — an unknown name makes the registration fail server-side).
   Saudi Arabia + GCC first, then the rest of the ERP list alphabetically. */
const SUPPLIER_COUNTRIES = [
  'Saudi Arabia', 'Bahrain', 'Kuwait', 'Oman', 'Qatar', 'United Arab Emirates',
  'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla',
  'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan',
  'Bolivia, Plurinational State of', 'Bonaire, Sint Eustatius and Saba', 'Bosnia and Herzegovina', 'Botswana',
  'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso',
  'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo',
  'Congo, The Democratic Republic of the', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Curaçao',
  'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands (Malvinas)',
  'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe',
  'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard Island and McDonald Islands',
  'Holy See (Vatican City State)', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jersey', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, Democratic Peoples Republic of', 'Korea, Republic of', 'Kyrgyzstan',
  'Lao Peoples Democratic Republic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Macao', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
  'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico',
  'Micronesia, Federated States of', 'Moldova, Republic of', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat',
  'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Pakistan',
  'Palau', 'Palestinian Territory, Occupied', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Réunion', 'Romania', 'Russian Federation', 'Rwanda',
  'Saint Barthélemy', 'Saint Helena, Ascension and Tristan da Cunha', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Martin (French part)', 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'Sao Tome and Principe', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Sint Maarten (Dutch part)', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Georgia and the South Sandwich Islands', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Svalbard and Jan Mayen', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Kingdom', 'United States',
  'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela, Bolivarian Republic of',
  'Vietnam', 'Virgin Islands, British', 'Virgin Islands, U.S.', 'Wallis and Futuna', 'Western Sahara', 'Yemen',
  'Zambia', 'Zimbabwe',
];

const PROCESS_STEPS = [
  { num: '01',
    en: { t: 'Register', d: 'Introduce your company and the products or services you supply using the form below.' },
    ar: { t: 'سجّل', d: 'عرّفنا بشركتك والمنتجات أو الخدمات التي توّردها عبر النموذج أدناه.' },
    es: { t: 'Regístrate', d: 'Presenta tu empresa y los productos o servicios que suministras en el formulario de abajo.' } },
  { num: '02',
    en: { t: 'Review', d: 'Our procurement team evaluates your registration and verifies your commercial documents.' },
    ar: { t: 'المراجعة', d: 'يقيّم فريق المشتريات لدينا تسجيلك ويتحقق من وثائقك التجارية.' },
    es: { t: 'Revisión', d: 'Nuestro equipo de compras evalúa tu registro y verifica tus documentos comerciales.' } },
  { num: '03',
    en: { t: 'Onboarding', d: 'Approved suppliers join our vendor list and start receiving requests for quotation.' },
    ar: { t: 'الاعتماد', d: 'ينضم الموردون المعتمدون إلى قائمة موردينا ويبدؤون باستلام طلبات عروض الأسعار.' },
    es: { t: 'Incorporación', d: 'Los proveedores aprobados entran en nuestra lista de vendedores y comienzan a recibir solicitudes de cotización.' } },
];

function SupplierPage() {
  const { lang } = useLang();
  const { isMobile } = useViewport();
  const isAr = lang === 'ar';
  const [status, setStatus] = useState_sp('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState_sp('');
  const sent = status === 'sent';
  const twoCol = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const fd = new FormData(e.target);
    // Honeypot: real visitors never fill this hidden input — pretend success for bots.
    if (fd.get('company_fax')) { setStatus('sent'); return; }
    setStatus('sending');
    setErrorMsg('');
    try {
      // → ERPNext 'supplier-registration' guest web form → creates a Supplier
      //   (disabled until procurement reviews and enables it). Contact person
      //   and city have no Supplier field, so they ride along in supplier_details.
      const details = [
        fd.get('products') || '',
        '—',
        `Contact person: ${fd.get('contact_person') || '-'}`,
        `City: ${fd.get('city') || '-'}`,
        'Submitted via the bcisaudi.com supplier registration form',
      ].join('\n');
      await submitErpWebForm('supplier-registration', {
        doctype: 'Supplier',
        supplier_name: fd.get('company_name') || '',
        supplier_name_in_arabic: fd.get('company_name_ar') || '',
        supplier_type: fd.get('supplier_type') || 'Company',
        country: fd.get('country') || '',
        email_id: fd.get('email') || '',
        mobile_no: fd.get('mobile') || '',
        website: fd.get('website') || '',
        custom_cr_no: fd.get('cr_no') || '',
        tax_id: fd.get('tax_id') || '',
        supplier_details: details,
        disabled: 1,
      });
      setStatus('sent');
      e.target.reset();
      setTimeout(() => setStatus('idle'), 8000);
    } catch (err) {
      setErrorMsg(t(lang,
        'Something went wrong sending your registration. Please try again, or email your company profile to info@bcisaudi.com.',
        'حدث خطأ أثناء إرسال تسجيلك. يرجى المحاولة مرة أخرى أو إرسال ملف شركتكم إلى info@bcisaudi.com.',
        'Hubo un problema al enviar tu registro. Inténtalo de nuevo o envía el perfil de tu empresa a info@bcisaudi.com.'));
      setStatus('error');
    }
  };

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Suppliers', 'الموردون', 'Proveedores')}
        crumb={t(lang, 'Suppliers', 'الموردون', 'Proveedores')}
        title="Supply the chemistry."
        titleAr="كن موردًا لكيمياء البناء."
        titleEs="Suministra la química."
        subtitle={t(lang,
          'BCI sources raw materials, packaging, equipment and services from qualified suppliers in the Kingdom and worldwide. Introduce your company and products below — our procurement team reviews every registration.',
          'توّرد BCI المواد الخام ومواد التعبئة والمعدات والخدمات من موردين مؤهلين من داخل المملكة وحول العالم. عرّفنا بشركتك ومنتجاتك أدناه — يراجع فريق المشتريات لدينا كل تسجيل.',
          'BCI adquiere materias primas, envases, equipos y servicios de proveedores calificados del Reino y de todo el mundo. Presenta tu empresa y tus productos a continuación — nuestro equipo de compras revisa cada registro.')}
      />

      {/* What we procure */}
      <section style={{ background: 'var(--bci-concrete)', padding: isMobile ? '72px 0' : '120px 0' }}>
        <div className="container">
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Procurement', 'المشتريات', 'Compras')}</div>
          <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 40px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang, 'What we procure', 'ما الذي نشتريه', 'Qué compramos')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--bci-hairline-light)' }}>
            {PROCUREMENT.map((c, i) => (
              <div key={c.icon + i} style={{ padding: '36px 28px', borderRight: !isMobile && i % 3 < 2 ? '1px solid var(--bci-hairline-light)' : 'none', borderBottom: i < PROCUREMENT.length - (isMobile ? 1 : 3) ? '1px solid var(--bci-hairline-light)' : 'none', paddingLeft: !isMobile && i % 3 === 0 ? 0 : 28, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ width: 46, height: 46, border: '1px solid var(--bci-navy-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon name={c.icon} size={22} stroke="var(--bci-green-600)" />
                </div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 20, color: 'var(--bci-navy)', margin: '0 0 10px' }}>{(c[lang] || c.en).t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-steel)', margin: 0 }}>{(c[lang] || c.en).d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bci-navy)', color: '#fff', padding: isMobile ? '72px 0' : '110px 0', borderTop: '1px solid var(--bci-green-500)', borderBottom: '1px solid var(--bci-green-500)', position: 'relative', overflow: 'hidden' }}>
        <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="sec-num" style={{ color: 'var(--bci-green-400)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'How it works', 'كيف تعمل', 'Cómo funciona')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.num} style={{ padding: '36px 24px', borderRight: !isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingLeft: !isMobile && i === 0 ? 0 : 24, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 14, color: 'var(--bci-green-400)', marginBottom: 18 }}>{s.num}</div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 22, color: '#fff', margin: '0 0 10px' }}>{(s[lang] || s.en).t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{(s[lang] || s.en).d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration form */}
      <section id="register" style={{ background: 'var(--bci-paper)', padding: isMobile ? '72px 0' : '120px 0', scrollMarginTop: 72 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Register', 'التسجيل', 'Registro')}</div>
          <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 12px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang, 'Supplier registration', 'تسجيل مورد', 'Registro de proveedor')}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: '0 0 32px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang,
              'Your details go directly to our procurement system. Fields marked * are required.',
              'تصل بياناتك مباشرة إلى نظام المشتريات لدينا. الحقول المعلمة بـ * إلزامية.',
              'Tus datos van directamente a nuestro sistema de compras. Los campos marcados con * son obligatorios.')}
          </p>
          <form onSubmit={submitRegistration}
            style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: isMobile ? 24 : 36, display: 'flex', flexDirection: 'column', gap: 20, direction: isAr ? 'rtl' : 'ltr' }}>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Company name *', 'اسم الشركة (بالإنجليزية) *', 'Nombre de la empresa *')}</label><input required name="company_name" type="text" /></div>
              <div className="field"><label>{t(lang, 'Company name (Arabic)', 'اسم الشركة (بالعربية)', 'Nombre de la empresa (árabe)')}</label><input name="company_name_ar" type="text" dir="rtl" /></div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Supplier type *', 'نوع المورد *', 'Tipo de proveedor *')}</label>
                <select required name="supplier_type" defaultValue="Company">
                  <option value="Company">{t(lang, 'Company', 'شركة', 'Empresa')}</option>
                  <option value="Individual">{t(lang, 'Individual', 'فرد / مؤسسة فردية', 'Individual')}</option>
                  <option value="Partnership">{t(lang, 'Partnership', 'شراكة', 'Sociedad')}</option>
                </select>
              </div>
              <div className="field"><label>{t(lang, 'Country', 'الدولة', 'País')}</label>
                <select name="country" defaultValue="">
                  <option value="">{t(lang, 'Select a country…', 'اختر دولة…', 'Selecciona un país…')}</option>
                  {SUPPLIER_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'City', 'المدينة', 'Ciudad')}</label><input name="city" type="text" /></div>
              <div className="field"><label>{t(lang, 'Contact person', 'الشخص المسؤول', 'Persona de contacto')}</label><input name="contact_person" type="text" /></div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Email *', 'البريد الإلكتروني *', 'Correo *')}</label><input required name="email" type="email" placeholder="name@company.com" /></div>
              <div className="field"><label>{t(lang, 'Mobile', 'الجوال', 'Móvil')}</label><input name="mobile" type="tel" placeholder="+966" /></div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'CR number', 'رقم السجل التجاري', 'Registro comercial (CR)')}</label><input name="cr_no" type="text" /></div>
              <div className="field"><label>{t(lang, 'VAT / Tax ID', 'الرقم الضريبي', 'NIF / RUC (impuestos)')}</label><input name="tax_id" type="text" /></div>
            </div>
            <div className="field"><label>{t(lang, 'Website', 'الموقع الإلكتروني', 'Sitio web')}</label><input name="website" type="url" placeholder="https://" /></div>
            <div className="field"><label>{t(lang, 'Products & services you supply *', 'المنتجات والخدمات التي توّردها *', 'Productos y servicios que suministras *')}</label>
              <textarea required name="products" rows={5} placeholder={t(lang,
                'Introduce your company and list the products or services you can supply to BCI…',
                'عرّفنا بشركتك واذكر المنتجات أو الخدمات التي يمكنك توريدها لـ BCI…',
                'Presenta tu empresa y enumera los productos o servicios que puedes suministrar a BCI…')}></textarea>
            </div>
            {/* Honeypot — hidden from real users, bots fill it and get silently dropped.
               Clip-hidden (no offscreen offset: negative `left` stretches RTL pages). */}
            <input name="company_fax" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', width: 1, height: 1, margin: -1, border: 0, padding: 0, opacity: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--bci-steel)', marginTop: -8, textAlign: isAr ? 'right' : 'left' }}>
              {t(lang,
                'Have a company profile or catalog? Email it to info@bcisaudi.com after registering.',
                'لديك ملف تعريفي أو كتالوج؟ أرسله إلى info@bcisaudi.com بعد التسجيل.',
                '¿Tienes un perfil de empresa o catálogo? Envíalo a info@bcisaudi.com después de registrarte.')}
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '16px', opacity: status === 'sending' ? 0.7 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}>
              {sent ? <><Icon name="check" size={14} stroke="#fff" /> {t(lang, 'Registration sent', 'تم إرسال التسجيل', 'Registro enviado')}</>
                : status === 'sending' ? <>{t(lang, 'Sending…', 'جارٍ الإرسال…', 'Enviando…')}</>
                : <>{t(lang, 'Submit registration', 'إرسال التسجيل', 'Enviar registro')} <Arrow size={14} /></>}
            </button>
            {sent &&
              <div role="status" style={{ fontSize: 13, color: 'var(--bci-green-700)', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', borderRadius: 2, padding: '12px 14px', textAlign: isAr ? 'right' : 'left' }}>
                {t(lang,
                  'Thank you — our procurement team will review your registration and contact you.',
                  'شكرًا لك — سيراجع فريق المشتريات تسجيلك ويتواصل معك.',
                  'Gracias — nuestro equipo de compras revisará tu registro y se pondrá en contacto contigo.')}
              </div>}
            {status === 'error' &&
              <div role="alert" style={{ fontSize: 13, color: '#b42318', background: '#fef3f2', border: '1px solid #fda29b', borderRadius: 2, padding: '12px 14px', textAlign: isAr ? 'right' : 'left' }}>
                {errorMsg}
              </div>}
          </form>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Suppliers" />
    <SupplierPage />
    <Footer />
  </LangProvider>
);
