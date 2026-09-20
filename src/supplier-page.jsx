/* global React, ReactDOM, LangProvider, useLang, useViewport, t, Icon, Arrow, selectOptionLabel,
   MegaHeader, PageHero, Footer, submitSupplierRegistration */
const { useState: useState_sp, useRef: useRef_sp } = React;

/* Must match CURRENCIES in api/supplier-registration.js — the route rejects
   anything else. */
const SUPPLIER_CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'GBP', 'CNY', 'INR', 'JPY', 'TRY', 'EGP'];
const MAX_SUPPLIER_ITEMS = 20;
const MAX_SUPPLIER_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function emptySupplierItem() {
  return { name: '', unit: '', price: '', currency: 'SAR' };
}

function supplierFileType(file) {
  if (file && file.type) return file.type;
  const extension = String(file?.name || '').toLowerCase().split('.').pop();
  return {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }[extension] || 'application/octet-stream';
}

/* The /api routes are Vercel functions — a plain static dev server has none,
   so say that rather than showing a bare fetch error. */
function isLocalPreviewHost() {
  try { return ['127.0.0.1', 'localhost'].includes(window.location.hostname); }
  catch (_) { return false; }
}

/* What BCI procures — drives the category grid. Each tile is clickable: it jumps
   to the registration form and preselects `key` in the Supply category field, so
   the grid behaves the way visitors already expect it to. `key` is also what the
   ERP registration records, so don't rename one without the other. */
const PROCUREMENT = [
  { key: 'raw-materials', icon: 'flask',
    en: { t: 'Raw Materials & Chemicals', d: 'Polyols, isocyanates, epoxy resins, acrylics, additives, pigments and specialty chemicals.' },
    ar: { t: 'المواد الخام والكيماويات', d: 'البوليولات، الإيزوسيانات، راتنجات الإيبوكسي، الأكريليك، الإضافات، الأصباغ والكيماويات المتخصصة.' },
    es: { t: 'Materias Primas y Químicos', d: 'Polioles, isocianatos, resinas epóxicas, acrílicos, aditivos, pigmentos y químicos especializados.' } },
  { key: 'fillers', icon: 'layers',
    en: { t: 'Fillers & Aggregates', d: 'Silica sand, quartz, calcium carbonate, cement and mineral fillers.' },
    ar: { t: 'الحشوات والركام', d: 'رمل السيليكا، الكوارتز، كربونات الكالسيوم، الأسمنت والحشوات المعدنية.' },
    es: { t: 'Cargas y Agregados', d: 'Arena de sílice, cuarzo, carbonato de calcio, cemento y cargas minerales.' } },
  { key: 'packaging', icon: 'package',
    en: { t: 'Packaging', d: 'Pails, drums, bags, cartridges, IBCs, labels and printed packaging.' },
    ar: { t: 'مواد التعبئة والتغليف', d: 'الدلاء، البراميل، الأكياس، الخراطيش، حاويات IBC، الملصقات والتغليف المطبوع.' },
    es: { t: 'Envases y Embalaje', d: 'Cubetas, tambores, sacos, cartuchos, IBCs, etiquetas y embalaje impreso.' } },
  { key: 'equipment', icon: 'factory',
    en: { t: 'Equipment & Spares', d: 'Mixers, pumps, spray rigs, lab instruments and production spare parts.' },
    ar: { t: 'المعدات وقطع الغيار', d: 'الخلاطات، المضخات، أجهزة الرش، أجهزة المختبر وقطع غيار الإنتاج.' },
    es: { t: 'Equipos y Repuestos', d: 'Mezcladoras, bombas, equipos de proyección, instrumentos de laboratorio y repuestos de producción.' } },
  { key: 'logistics', icon: 'globe',
    en: { t: 'Logistics & Transport', d: 'Freight, fleet services, customs clearance and warehousing.' },
    ar: { t: 'الخدمات اللوجستية والنقل', d: 'الشحن، خدمات الأسطول، التخليص الجمركي والتخزين.' },
    es: { t: 'Logística y Transporte', d: 'Flete, servicios de flota, despacho aduanero y almacenamiento.' } },
  { key: 'services', icon: 'briefcase',
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

/* One "What we procure" tile. It is a real link: the grid reads as clickable,
   so visitors click it — before, nothing happened and the page felt broken. */
function ProcurementTile({ c, i, total, onPick }) {
  const { lang } = useLang();
  const { isMobile } = useViewport();
  const isAr = lang === 'ar';
  const [lit, setLit] = useState_sp(false);
  const copy = c[lang] || c.en;
  return (
    <a href="#register" onClick={(e) => onPick(e, c.key)}
      onMouseEnter={() => setLit(true)} onMouseLeave={() => setLit(false)}
      onFocus={() => setLit(true)} onBlur={() => setLit(false)}
      style={{
        display: 'block', width: '100%', textDecoration: 'none', color: 'inherit', cursor: 'pointer',
        background: lit ? '#fff' : 'transparent',
        borderRight: !isMobile && i % 3 < 2 ? '1px solid var(--bci-hairline-light)' : 'none',
        borderBottom: i < total - (isMobile ? 1 : 3) ? '1px solid var(--bci-hairline-light)' : 'none',
        padding: '36px 28px',
        paddingLeft: !isMobile && i % 3 === 0 ? 0 : 28,
        textAlign: isAr ? 'right' : 'left',
        transition: 'background-color 120ms linear',
      }}>
      <div style={{ width: 46, height: 46, border: `1px solid ${lit ? 'var(--bci-green-500)' : 'var(--bci-navy-100)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, transition: 'border-color 120ms linear' }}>
        <Icon name={c.icon} size={22} stroke="var(--bci-green-600)" />
      </div>
      <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 20, color: 'var(--bci-navy)', margin: '0 0 10px' }}>{copy.t}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-steel)', margin: '0 0 16px' }}>{copy.d}</p>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, paddingBottom: 2,
        fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: lit ? 'var(--bci-green-deep)' : 'var(--bci-green-600)',
        borderBottom: `1px solid ${lit ? 'var(--bci-green-500)' : 'transparent'}`,
        transition: 'color 120ms linear, border-color 120ms linear',
      }}>
        {t(lang, 'Register to supply this', 'سجّل لتوريد هذه الفئة', 'Regístrate para suministrar')} <Arrow size={12} />
      </span>
    </a>
  );
}

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
  const { isMobile, isPhone } = useViewport();
  const isAr = lang === 'ar';
  const [status, setStatus] = useState_sp('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState_sp('');
  const [category, setCategory] = useState_sp('');
  const [rows, setRows] = useState_sp([emptySupplierItem()]);
  const [uploadProgress, setUploadProgress] = useState_sp(0);
  const [supplierId, setSupplierId] = useState_sp('');
  const [attachWarning, setAttachWarning] = useState_sp(false);
  const firstItemRef = useRef_sp(null);

  const changeRow = (index, field, value) => setRows(rows.map((row, i) => (
    i === index ? { ...row, [field]: value } : row
  )));
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const sent = status === 'sent';
  const twoCol = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 };

  /* Clicking a procurement tile now does the obvious thing. The focus is
     deferred so it does not cut the smooth scroll short. */
  const goToRegister = (e, key) => {
    setCategory(key);
    const target = document.getElementById('register');
    if (!target?.scrollIntoView) return; // let the plain #register jump happen
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => firstItemRef.current?.focus?.({ preventScroll: true }), 500);
  };

  const fail = (message) => { setErrorMsg(message); setStatus('error'); };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const formElement = e.target;
    const fd = new FormData(formElement);
    // Honeypot: real visitors never fill this hidden input — pretend success for bots.
    if (fd.get('company_fax')) { setStatus('sent'); return; }

    const items = rows
      .map((row) => ({ ...row, name: row.name.trim(), unit: row.unit.trim(), price: row.price.trim() }))
      .filter((row) => row.name);
    if (!items.length) {
      return fail(t(lang,
        'Please list at least one product or service you supply.',
        'يرجى إدراج منتج أو خدمة واحدة على الأقل توّردها.',
        'Indica al menos un producto o servicio que suministras.'));
    }
    if (items.some((row) => row.price && !(Number(row.price) > 0))) {
      return fail(t(lang,
        'Prices must be numbers greater than zero — leave the price empty if it is on request.',
        'يجب أن تكون الأسعار أرقامًا أكبر من صفر — اترك السعر فارغًا إذا كان عند الطلب.',
        'Los precios deben ser números mayores que cero — deja el precio vacío si es a consultar.'));
    }

    const profile = fd.get('company_profile');
    const catalog = fd.get('company_catalog');
    const hasProfile = profile instanceof File && Boolean(profile.name);
    const hasCatalog = catalog instanceof File && Boolean(catalog.name);
    if ((hasProfile && profile.size > MAX_SUPPLIER_ATTACHMENT_BYTES)
        || (hasCatalog && catalog.size > MAX_SUPPLIER_ATTACHMENT_BYTES)) {
      return fail(t(lang,
        'Each attachment must be no larger than 10 MB.',
        'يجب ألا يتجاوز حجم كل مرفق 10 ميجابايت.',
        'Cada archivo adjunto debe tener un tamaño máximo de 10 MB.'));
    }

    setStatus('sending');
    setErrorMsg('');
    setSupplierId('');
    setAttachWarning(false);
    setUploadProgress(0);
    let profileBlob = null;
    let catalogBlob = null;
    try {
      // Files are staged in private Vercel Blob first; the API route pulls them
      // into ERP and deletes the staged copy.
      if ((hasProfile || hasCatalog) && typeof window.uploadPrivateRfqFile !== 'function') {
        throw new Error('Supplier file uploader unavailable');
      }
      if (hasProfile) {
        profileBlob = await window.uploadPrivateRfqFile(
          profile, 'supplier-profile',
          { name: profile.name, type: supplierFileType(profile), size: profile.size },
          ({ percentage }) => setUploadProgress(Math.round((percentage || 0) * (hasCatalog ? 0.5 : 1))),
        );
      }
      if (hasCatalog) {
        catalogBlob = await window.uploadPrivateRfqFile(
          catalog, 'supplier-catalog',
          { name: catalog.name, type: supplierFileType(catalog), size: catalog.size },
          ({ percentage }) => setUploadProgress(Math.round((hasProfile ? 50 : 0) + (percentage || 0) * (hasProfile ? 0.5 : 1))),
        );
      }

      // → same-origin API → ERPNext 'supplier-registration' Web Form.
      // City and contact person map to dedicated custom Supplier fields.
      const payload = await submitSupplierRegistration({
        supplier_name: fd.get('company_name') || '',
        supplier_name_in_arabic: fd.get('company_name_ar') || '',
        supplier_type: fd.get('supplier_type') || 'Company',
        country: fd.get('country') || '',
        email_id: fd.get('email') || '',
        mobile_no: fd.get('mobile') || '',
        website: fd.get('website') || '',
        custom_cr_no: fd.get('cr_no') || '',
        tax_id: fd.get('tax_id') || '',
        custom_city: fd.get('city') || '',
        custom_contact_person: fd.get('contact_person') || '',
        category: fd.get('category') || '',
        notes: fd.get('notes') || '',
        items: items.map((row) => ({
          name: row.name, unit: row.unit, price: row.price, currency: row.currency,
        })),
        profile_blob: profileBlob ? {
          url: profileBlob.url, name: profile.name, type: supplierFileType(profile), size: profile.size,
        } : null,
        catalog_blob: catalogBlob ? {
          url: catalogBlob.url, name: catalog.name, type: supplierFileType(catalog), size: catalog.size,
        } : null,
        page_url: typeof window === 'undefined' ? '' : window.location.href,
        lang,
      });
      setSupplierId(payload.supplier_id || '');
      setAttachWarning(Boolean(payload.attachment_warning));
      setStatus('sent');
      formElement.reset();
      setCategory('');
      setRows([emptySupplierItem()]);
      setUploadProgress(0);
    } catch (err) {
      if (isLocalPreviewHost()) {
        return fail(t(lang,
          'Local preview: the /api routes only run on Vercel, so nothing was sent. Everything else on this form works here.',
          'معاينة محلية: مسارات /api تعمل على Vercel فقط، لذلك لم يتم إرسال شيء. بقية النموذج تعمل هنا.',
          'Vista previa local: las rutas /api solo funcionan en Vercel, así que no se envió nada. El resto del formulario sí funciona aquí.'));
      }
      return fail(err?.message || t(lang,
        'Something went wrong sending your registration. Please try again, or email your company profile to info@bcisaudi.com.',
        'حدث خطأ أثناء إرسال تسجيلك. يرجى المحاولة مرة أخرى أو إرسال ملف شركتكم إلى info@bcisaudi.com.',
        'Hubo un problema al enviar tu registro. Inténtalo de nuevo o envía el perfil de tu empresa a info@bcisaudi.com.'));
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
          <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 12px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang, 'What we procure', 'ما الذي نشتريه', 'Qué compramos')}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: '0 0 40px', maxWidth: 620, textAlign: isAr ? 'right' : 'left' }}>
            {t(lang,
              'Pick the category you supply — it takes you to the registration form with that category already filled in.',
              'اختر الفئة التي توّردها — سينتقل بك ذلك إلى نموذج التسجيل مع تعبئة الفئة مسبقًا.',
              'Elige la categoría que suministras — te lleva al formulario de registro con esa categoría ya seleccionada.')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--bci-hairline-light)' }}>
            {PROCUREMENT.map((c, i) => (
              <ProcurementTile key={c.key} c={c} i={i} total={PROCUREMENT.length} onPick={goToRegister} />
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
          <form className="bci-form" onSubmit={submitRegistration}
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
                  {SUPPLIER_COUNTRIES.map((c) => <option key={c} value={c} title={c}>{selectOptionLabel(c, isPhone)}</option>)}
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
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Supply category *', 'فئة التوريد *', 'Categoría de suministro *')}</label>
                <select required name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">{t(lang, 'Select a category…', 'اختر فئة…', 'Selecciona una categoría…')}</option>
                  {PROCUREMENT.map((c) => <option key={c.key} value={c.key}>{(c[lang] || c.en).t}</option>)}
                  <option value="other">{t(lang, 'Other / multiple categories', 'أخرى / عدة فئات', 'Otra / varias categorías')}</option>
                </select>
              </div>
              <div className="field"><label>{t(lang, 'Website', 'الموقع الإلكتروني', 'Sitio web')}</label><input name="website" type="url" placeholder="https://" /></div>
            </div>
            <div style={{ borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 6 }}>
                  {t(lang, 'What you supply *', 'ما الذي توّرده *', 'Qué suministras *')}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--bci-steel)' }}>
                  {t(lang,
                    'List each product, material or service on its own line. Prices are optional — leave one empty to mark it as price on request.',
                    'أدرج كل منتج أو مادة أو خدمة في سطر منفصل. الأسعار اختيارية — اترك السعر فارغًا ليكون عند الطلب.',
                    'Enumera cada producto, material o servicio en su propia línea. Los precios son opcionales — déjalo vacío para indicar precio a consultar.')}
                </div>
              </div>

              {rows.map((row, index) => (
                <div key={index} style={{ border: '1px solid var(--bci-hairline-light)', background: 'var(--bci-paper)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <strong style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--bci-navy)' }}>
                      {t(lang, 'Item', 'البند', 'Artículo')} {index + 1}
                    </strong>
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(index)}
                        style={{ border: 0, background: 'transparent', color: '#b42318', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                        {t(lang, 'Remove', 'حذف', 'Eliminar')}
                      </button>
                    )}
                  </div>
                  <div className="field">
                    <label>{t(lang, 'Product / material / service *', 'المنتج / المادة / الخدمة *', 'Producto / material / servicio *')}</label>
                    <input type="text" value={row.name} ref={index === 0 ? firstItemRef : null}
                      onChange={(event) => changeRow(index, 'name', event.target.value)}
                      placeholder={t(lang, 'e.g. Titanium dioxide R-902', 'مثال: ثاني أكسيد التيتانيوم R-902', 'p. ej. Dióxido de titanio R-902')} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>{t(lang, 'Unit', 'الوحدة', 'Unidad')}</label>
                      <input type="text" value={row.unit}
                        onChange={(event) => changeRow(index, 'unit', event.target.value)}
                        placeholder={t(lang, 'kg, drum, ton…', 'كجم، برميل، طن…', 'kg, tambor, tonelada…')} />
                    </div>
                    <div className="field">
                      <label>{t(lang, 'Price (optional)', 'السعر (اختياري)', 'Precio (opcional)')}</label>
                      <input type="number" min="0" step="any" inputMode="decimal" value={row.price}
                        onChange={(event) => changeRow(index, 'price', event.target.value)} placeholder="0.00" />
                    </div>
                    <div className="field">
                      <label>{t(lang, 'Currency', 'العملة', 'Moneda')}</label>
                      <select value={row.currency} onChange={(event) => changeRow(index, 'currency', event.target.value)}>
                        {SUPPLIER_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-ghost-navy" disabled={rows.length >= MAX_SUPPLIER_ITEMS}
                onClick={() => setRows([...rows, emptySupplierItem()])}
                style={{ alignSelf: isAr ? 'flex-end' : 'flex-start', opacity: rows.length >= MAX_SUPPLIER_ITEMS ? 0.5 : 1 }}>
                {t(lang, 'Add another item', 'إضافة بند آخر', 'Añadir otro artículo')}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="eyebrow" style={{ color: 'var(--bci-green-700)' }}>
                {t(lang, 'Company documents', 'مستندات الشركة', 'Documentos de la empresa')}
              </div>
              <div style={twoCol}>
                <div className="field">
                  <label>{t(lang, 'Company profile (optional)', 'الملف التعريفي للشركة (اختياري)', 'Perfil de la empresa (opcional)')}</label>
                  <input name="company_profile" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" />
                </div>
                <div className="field">
                  <label>{t(lang, 'Catalog / price list (optional)', 'الكتالوج / قائمة الأسعار (اختياري)', 'Catálogo / lista de precios (opcional)')}</label>
                  <input name="company_catalog" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--bci-steel)' }}>
                {t(lang,
                  'Accepted files: PDF, JPG, PNG or WebP, up to 10 MB each. Export Word or Excel catalogs to PDF first.',
                  'الملفات المقبولة: PDF أو JPG أو PNG أو WebP بحد أقصى 10 ميجابايت لكل ملف. يرجى تحويل كتالوجات Word أو Excel إلى PDF أولًا.',
                  'Archivos aceptados: PDF, JPG, PNG o WebP, hasta 10 MB cada uno. Exporta los catálogos de Word o Excel a PDF primero.')}
              </div>
              <div className="field">
                <label>{t(lang, 'Company introduction / notes (optional)', 'نبذة عن الشركة / ملاحظات (اختياري)', 'Presentación de la empresa / notas (opcional)')}</label>
                <textarea name="notes" rows={4} placeholder={t(lang,
                  'Certifications, production capacity, lead times, existing clients…',
                  'الشهادات، الطاقة الإنتاجية، مدد التوريد، العملاء الحاليون…',
                  'Certificaciones, capacidad de producción, plazos de entrega, clientes actuales…')}></textarea>
              </div>
            </div>
            {/* Honeypot — hidden from real users, bots fill it and get silently dropped.
               Clip-hidden (no offscreen offset: negative `left` stretches RTL pages). */}
            <input name="company_fax" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', width: 1, height: 1, margin: -1, border: 0, padding: 0, opacity: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />
            <button type="submit" disabled={status === 'sending'} className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '16px', opacity: status === 'sending' ? 0.7 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}>
              {sent ? <><Icon name="check" size={14} stroke="#fff" /> {t(lang, 'Registration sent', 'تم إرسال التسجيل', 'Registro enviado')}</>
                : status === 'sending' ? <>{uploadProgress > 0 && uploadProgress < 100
                    ? `${t(lang, 'Uploading…', 'جارٍ الرفع…', 'Subiendo…')} ${uploadProgress}%`
                    : t(lang, 'Sending…', 'جارٍ الإرسال…', 'Enviando…')}</>
                : <>{t(lang, 'Submit registration', 'إرسال التسجيل', 'Enviar registro')} <Arrow size={14} /></>}
            </button>
            {sent &&
              <div role="status" style={{ fontSize: 13, color: 'var(--bci-green-700)', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', borderRadius: 2, padding: '12px 14px', textAlign: isAr ? 'right' : 'left' }}>
                {t(lang,
                  'Thank you — our procurement team will review your registration and contact you.',
                  'شكرًا لك — سيراجع فريق المشتريات تسجيلك ويتواصل معك.',
                  'Gracias — nuestro equipo de compras revisará tu registro y se pondrá en contacto contigo.')}
                {supplierId &&
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, marginTop: 8 }}>
                    {t(lang, 'Reference', 'الرقم المرجعي', 'Referencia')}: {supplierId}
                  </div>}
                {attachWarning &&
                  <div style={{ marginTop: 8, color: 'var(--bci-navy)' }}>
                    {t(lang,
                      'Your registration was saved, but an attachment did not reach us. Please email it to info@bcisaudi.com.',
                      'تم حفظ تسجيلك، لكن أحد المرفقات لم يصل إلينا. يرجى إرساله إلى info@bcisaudi.com.',
                      'Tu registro se guardó, pero un archivo adjunto no llegó. Envíalo a info@bcisaudi.com.')}
                  </div>}
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
