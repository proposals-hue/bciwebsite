/* global React, ReactDOM, LangProvider, useLang, useViewport, t, Icon, Arrow, selectOptionLabel,
   MegaHeader, PageHero, Footer, submitCustomerRegistration, thankYouHref, ERP_COUNTRIES */
const { useState: useState_cr } = React;

const MAX_CUSTOMER_DOC_BYTES = 10 * 1024 * 1024;
/* Images only and smaller — matches the 'customer-logo' kind in api/_rfq-file.js. */
const MAX_CUSTOMER_LOGO_BYTES = 5 * 1024 * 1024;

/* Extensions accepted per attachment, mirroring FILE_KINDS in api/_rfq-file.js. */
const CUSTOMER_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const CUSTOMER_DOC_EXTENSIONS = ['.pdf'].concat(CUSTOMER_IMAGE_EXTENSIONS);

/* The product lines a customer can register an interest in. `key` is what the
   ERP record stores, so keep it in step with INTERESTS in
   api/_customer-registration.js — the route rejects any key it does not know.
   These mirror the nine SOLUTIONS categories. */
const CUSTOMER_INTERESTS = [
  { key: 'waterproofing', en: 'Waterproofing & Roofing', ar: 'العزل المائي والأسطح', es: 'Impermeabilización y Cubiertas' },
  { key: 'polyurea', en: 'Polyurea Membranes', ar: 'أغشية البولي يوريا', es: 'Membranas de Poliurea' },
  { key: 'pu-foam', en: 'PU Foam & Insulation', ar: 'رغوة PU والعزل', es: 'Espuma PU y Aislamiento' },
  { key: 'flooring', en: 'Flooring Systems', ar: 'أنظمة الأرضيات', es: 'Sistemas de Pavimentos' },
  { key: 'coatings', en: 'Protective Coatings', ar: 'الدهانات الواقية', es: 'Recubrimientos Protectores' },
  { key: 'concrete-repair', en: 'Concrete Repair', ar: 'إصلاح الخرسانة', es: 'Reparación de Concreto' },
  { key: 'grouts', en: 'Grouts & Adhesives', ar: 'الجراوت واللاصقات', es: 'Morteros y Adhesivos' },
  { key: 'sealants', en: 'Sealants & Joints', ar: 'المواد المانعة للتسرب', es: 'Sellantes y Juntas' },
  { key: 'admixtures', en: 'Admixtures', ar: 'الإضافات', es: 'Aditivos' },
];

function customerFileType(file) {
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

function customerFileExtension(file) {
  const name = String(file?.name || '');
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot).toLowerCase() : '';
}

function customerFileMb(bytes) {
  return (Math.round((bytes / (1024 * 1024)) * 10) / 10).toString();
}

/* The upload authorizer re-checks every one of these rules server-side, but
   @vercel/blob discards its reply and throws a bare "Failed to retrieve the
   client token" — so unless we check here first, a customer who picks a .docx
   CR or a 14 MB scan gets an error that names neither the file nor the reason.
   Returns '' when the file is fine. */
function customerFileProblem(entry, lang) {
  const { file, label, advice, extensions, max } = entry;
  const name = file.name;
  if (!file.size) {
    return t(lang,
      `“${name}” is empty (0 bytes). Please select the file again.`,
      `«${name}» فارغ (0 بايت). يرجى اختيار الملف مرة أخرى.`,
      `«${name}» está vacío (0 bytes). Vuelve a seleccionar el archivo.`);
  }
  if (!extensions.includes(customerFileExtension(file))) {
    return t(lang,
      `“${name}” cannot be used for ${label.en}. ${advice.en}`,
      `«${name}» غير مناسب لحقل${label.ar}. ${advice.ar}`,
      `«${name}» no sirve para ${label.es}. ${advice.es}`);
  }
  if (file.size > max) {
    const size = customerFileMb(file.size);
    const cap = customerFileMb(max);
    return t(lang,
      `“${name}” is ${size} MB. ${label.enCap} must be no larger than ${cap} MB.`,
      `«${name}» حجمه ${size} ميجابايت. يجب ألا يتجاوز${label.ar} ${cap} ميجابايت.`,
      `«${name}» pesa ${size} MB. ${label.esCap} no debe superar ${cap} MB.`);
  }
  return '';
}

/* Never show the raw @vercel/blob failure: it leaks a vendor name and explains
   nothing. Anything it does not recognise is kept as a parenthetical. */
function customerUploadFailure(entry, error, lang) {
  const raw = String((error && error.message) || '');
  const detail = /client token|vercel blob/i.test(raw) ? '' : raw;
  const suffix = detail ? ` (${detail})` : '';
  return t(lang,
    `“${entry.file.name}” could not be uploaded as ${entry.label.en}. Please check the file opens on your device, then try again${suffix}.`,
    `تعذّر رفع «${entry.file.name}» في حقل${entry.label.ar}. يرجى التأكد من أن الملف يفتح على جهازك ثم المحاولة مرة أخرى${suffix}.`,
    `No se pudo subir «${entry.file.name}» como ${entry.label.es}. Comprueba que el archivo se abre en tu dispositivo e inténtalo de nuevo${suffix}.`);
}

/* The /api routes are Vercel functions — a plain static dev server has none,
   so say that rather than showing a bare fetch error. */
function isLocalCustomerPreviewHost() {
  try { return ['127.0.0.1', 'localhost'].includes(window.location.hostname); }
  catch (_) { return false; }
}

/* Why open an account rather than just asking for a quote each time. */
const CUSTOMER_BENEFITS = [
  { icon: 'file-text',
    en: { t: 'Quotes without the paperwork', d: 'Once your account is open, a quote needs your product and quantity — not your CR and VAT details every time.' },
    ar: { t: 'عروض أسعار بلا أوراق متكررة', d: 'بمجرد فتح حسابك، يحتاج عرض السعر إلى المنتج والكمية فقط — لا إلى سجلك التجاري ورقمك الضريبي في كل مرة.' },
    es: { t: 'Cotizaciones sin papeleo', d: 'Con tu cuenta abierta, una cotización solo necesita el producto y la cantidad — no tu CR y NIF cada vez.' } },
  { icon: 'users',
    en: { t: 'A named account manager', d: 'Your registration is reviewed by our sales team and assigned to a specific person who knows your projects.' },
    ar: { t: 'مسؤول حساب مخصص', d: 'يراجع فريق المبيعات تسجيلك ويسنده إلى شخص محدد يعرف مشاريعك.' },
    es: { t: 'Un gestor de cuenta asignado', d: 'Nuestro equipo comercial revisa tu registro y lo asigna a una persona concreta que conoce tus obras.' } },
  { icon: 'package',
    en: { t: 'Priced for your volume', d: 'Tell us what you buy and how much, and pricing is set against your actual consumption instead of a one-off list price.' },
    ar: { t: 'تسعير حسب حجم مشترياتك', d: 'أخبرنا بما تشتريه وبكمياته، ليُحدد السعر وفق استهلاكك الفعلي بدلًا من سعر قائمة لمرة واحدة.' },
    es: { t: 'Precios según tu volumen', d: 'Dinos qué compras y cuánto, y el precio se fija según tu consumo real en lugar de una tarifa puntual.' } },
  { icon: 'shield-check',
    en: { t: 'Credit terms, when you qualify', d: 'Accounts start on cash terms. Credit is a separate review your account manager starts once you are trading with us.' },
    ar: { t: 'تسهيلات ائتمانية عند الاستحقاق', d: 'تبدأ الحسابات نقدًا. الائتمان مراجعة منفصلة يبدؤها مسؤول حسابك بعد بدء التعامل معنا.' },
    es: { t: 'Crédito, cuando califiques', d: 'Las cuentas empiezan al contado. El crédito es una revisión aparte que inicia tu gestor cuando ya operas con nosotros.' } },
];

const CUSTOMER_STEPS = [
  { num: '01',
    en: { t: 'Register', d: 'Complete the form below with your commercial details and the product lines you buy.' },
    ar: { t: 'سجّل', d: 'أكمل النموذج أدناه ببياناتك التجارية وخطوط المنتجات التي تشتريها.' },
    es: { t: 'Regístrate', d: 'Completa el formulario con tus datos comerciales y las líneas de producto que compras.' } },
  { num: '02',
    en: { t: 'Review', d: 'Our sales team verifies your commercial registration and VAT details — usually within two working days.' },
    ar: { t: 'المراجعة', d: 'يتحقق فريق المبيعات من سجلك التجاري وبياناتك الضريبية — عادةً خلال يومي عمل.' },
    es: { t: 'Revisión', d: 'Nuestro equipo comercial verifica tu registro comercial y tus datos fiscales — normalmente en dos días hábiles.' } },
  { num: '03',
    en: { t: 'Start buying', d: 'Your account is activated, an account manager is assigned, and you can order and request quotes directly.' },
    ar: { t: 'ابدأ الشراء', d: 'يُفعّل حسابك، ويُسند مسؤول حساب، ويمكنك الطلب وطلب عروض الأسعار مباشرة.' },
    es: { t: 'Empieza a comprar', d: 'Tu cuenta se activa, se asigna un gestor y puedes pedir y solicitar cotizaciones directamente.' } },
];

function CustomerRegistrationPage() {
  const { lang } = useLang();
  const { isMobile, isPhone } = useViewport();
  const isAr = lang === 'ar';
  const [status, setStatus] = useState_cr('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState_cr('');
  const [interests, setInterests] = useState_cr([]);
  const [uploadProgress, setUploadProgress] = useState_cr(0);
  const [customerId, setCustomerId] = useState_cr('');
  const [attachWarning, setAttachWarning] = useState_cr(false);

  const sent = status === 'sent';
  const twoCol = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 };

  const toggleInterest = (key) => setInterests((current) => (
    current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
  ));

  const fail = (message) => { setErrorMsg(message); setStatus('error'); };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const formElement = e.target;
    const fd = new FormData(formElement);
    // Honeypot: real visitors never fill this hidden input — pretend success for bots.
    if (fd.get('company_fax')) { setStatus('sent'); return; }

    // The checkbox group cannot carry `required`, so this is the only guard on
    // the browser side. The route enforces it again.
    if (!interests.length) {
      return fail(t(lang,
        'Please select at least one product line you are interested in.',
        'يرجى اختيار خط منتجات واحد على الأقل تهتم به.',
        'Selecciona al menos una línea de producto que te interese.'));
    }

    const imagesOnly = {
      en: 'Please upload a JPG, PNG or WebP image.',
      ar: 'يرجى رفع صورة بصيغة JPG أو PNG أو WebP.',
      es: 'Sube una imagen JPG, PNG o WebP.',
    };
    const documents = {
      en: 'Please upload a PDF, JPG, PNG or WebP file — save Word, PowerPoint or Excel files as PDF first.',
      ar: 'يرجى رفع ملف بصيغة PDF أو JPG أو PNG أو WebP — احفظ ملفات Word أو PowerPoint أو Excel بصيغة PDF أولًا.',
      es: 'Sube un archivo PDF, JPG, PNG o WebP — guarda los archivos de Word, PowerPoint o Excel como PDF primero.',
    };
    const chosen = [
      {
        key: 'logo_blob', kind: 'customer-logo', max: MAX_CUSTOMER_LOGO_BYTES,
        extensions: CUSTOMER_IMAGE_EXTENSIONS, advice: imagesOnly, file: fd.get('company_logo'),
        label: {
          en: 'the company logo', enCap: 'The company logo',
          ar: ' شعار الشركة',
          es: 'el logotipo de la empresa', esCap: 'El logotipo de la empresa',
        },
      },
      {
        key: 'cr_blob', kind: 'customer-cr', max: MAX_CUSTOMER_DOC_BYTES,
        extensions: CUSTOMER_DOC_EXTENSIONS, advice: documents, file: fd.get('cr_document'),
        label: {
          en: 'the commercial registration', enCap: 'The commercial registration',
          ar: ' السجل التجاري',
          es: 'el registro comercial', esCap: 'El registro comercial',
        },
      },
      {
        key: 'vat_blob', kind: 'customer-vat', max: MAX_CUSTOMER_DOC_BYTES,
        extensions: CUSTOMER_DOC_EXTENSIONS, advice: documents, file: fd.get('vat_document'),
        label: {
          en: 'the VAT certificate', enCap: 'The VAT certificate',
          ar: ' الشهادة الضريبية',
          es: 'el certificado de IVA', esCap: 'El certificado de IVA',
        },
      },
    ].filter((entry) => entry.file instanceof File && Boolean(entry.file.name));

    for (let i = 0; i < chosen.length; i += 1) {
      const problem = customerFileProblem(chosen[i], lang);
      if (problem) return fail(problem);
    }

    setStatus('sending');
    setErrorMsg('');
    setCustomerId('');
    setAttachWarning(false);
    setUploadProgress(0);
    const blobs = { logo_blob: null, cr_blob: null, vat_blob: null };
    try {
      // Files are staged in private Vercel Blob first; the API route pulls them
      // into ERP and deletes the staged copy.
      if (chosen.length && typeof window.uploadPrivateRfqFile !== 'function') {
        throw new Error('Customer file uploader unavailable');
      }
      for (let i = 0; i < chosen.length; i += 1) {
        const entry = chosen[i];
        const { key, kind, file } = entry;
        const type = customerFileType(file);
        let staged;
        try {
          staged = await window.uploadPrivateRfqFile(
            file, kind, { name: file.name, type, size: file.size },
            ({ percentage }) => setUploadProgress(
              Math.round(((i + (percentage || 0) / 100) / chosen.length) * 100)),
          );
        } catch (uploadError) {
          // Keep the real cause in the console; the customer gets a usable one.
          console.error('Customer attachment upload failed:', kind, uploadError);
          throw new Error(customerUploadFailure(entry, uploadError, lang));
        }
        blobs[key] = { url: staged.url, name: file.name, type, size: file.size };
      }

      // → same-origin API → ERP Customer, created disabled for sales review.
      const payload = await submitCustomerRegistration({
        customer_name: fd.get('company_name') || '',
        customer_name_in_arabic: fd.get('company_name_ar') || '',
        customer_type: fd.get('customer_type') || 'Company',
        country: fd.get('country') || '',
        city: fd.get('city') || '',
        address_line: fd.get('address_line') || '',
        contact_person: fd.get('contact_person') || '',
        email_id: fd.get('email') || '',
        mobile_no: fd.get('mobile') || '',
        website: fd.get('website') || '',
        custom_cr_number: fd.get('cr_number') || '',
        custom_vat_registration_number: fd.get('vat_number') || '',
        interests,
        notes: fd.get('notes') || '',
        // The File itself never goes in the payload — only the staged blob
        // reference, which the route pulls into ERP and then deletes.
        logo_blob: blobs.logo_blob,
        cr_blob: blobs.cr_blob,
        vat_blob: blobs.vat_blob,
        page_url: typeof window === 'undefined' ? '' : window.location.href,
        lang,
      });
      setCustomerId(payload.customer_id || '');
      setAttachWarning(Boolean(payload.attachment_warning));
      setStatus('sent');
      formElement.reset();
      setInterests([]);
      setUploadProgress(0);
      // The confirmation lives on its own page; the inline block below only
      // shows if the browser has not navigated yet.
      window.location.assign(thankYouHref({
        type: 'customer', ref: payload.customer_id, warn: payload.attachment_warning,
      }));
    } catch (err) {
      if (isLocalCustomerPreviewHost()) {
        return fail(t(lang,
          'Local preview: the /api routes only run on Vercel, so nothing was sent. Everything else on this form works here.',
          'معاينة محلية: مسارات /api تعمل على Vercel فقط، لذلك لم يتم إرسال شيء. بقية النموذج تعمل هنا.',
          'Vista previa local: las rutas /api solo funcionan en Vercel, así que no se envió nada. El resto del formulario sí funciona aquí.'));
      }
      return fail(err?.message || t(lang,
        'Something went wrong sending your registration. Please try again, or email your details to info@bcisaudi.com.',
        'حدث خطأ أثناء إرسال تسجيلك. يرجى المحاولة مرة أخرى أو إرسال بياناتك إلى info@bcisaudi.com.',
        'Hubo un problema al enviar tu registro. Inténtalo de nuevo o envía tus datos a info@bcisaudi.com.'));
    }
  };

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Customers', 'العملاء', 'Clientes')}
        crumb={t(lang, 'Open an account', 'فتح حساب', 'Abrir una cuenta')}
        title="Open a trade account."
        titleAr="افتح حسابًا تجاريًا."
        titleEs="Abre una cuenta comercial."
        subtitle={t(lang,
          'Contractors, applicators, traders and developers buy from BCI on a registered trade account. Register once and your quotes, orders and technical documents run through a single account with a named contact.',
          'يشتري المقاولون والمنفذون والتجار والمطورون من BCI عبر حساب تجاري مسجّل. سجّل مرة واحدة لتمر عروض الأسعار والطلبات والوثائق الفنية عبر حساب واحد بجهة اتصال محددة.',
          'Contratistas, aplicadores, distribuidores y desarrolladores compran a BCI con una cuenta comercial registrada. Regístrate una vez y tus cotizaciones, pedidos y documentos técnicos pasan por una sola cuenta con un contacto asignado.')}
      />

      {/* Why register */}
      <section style={{ background: 'var(--bci-concrete)', padding: isMobile ? '72px 0' : '120px 0' }}>
        <div className="container">
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Why register', 'لماذا التسجيل', 'Por qué registrarse')}</div>
          <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 12px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang, 'What a trade account gets you', 'ما الذي يمنحك إياه الحساب التجاري', 'Qué te da una cuenta comercial')}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: '0 0 40px', maxWidth: 620, textAlign: isAr ? 'right' : 'left' }}>
            {t(lang,
              'You can buy from BCI without one — but everything below only works once your company is on our books.',
              'يمكنك الشراء من BCI بدونه — لكن كل ما يلي لا يعمل إلا بعد تسجيل شركتك لدينا.',
              'Puedes comprar a BCI sin ella — pero todo lo de abajo solo funciona cuando tu empresa está registrada.')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 0, borderTop: '1px solid var(--bci-hairline-light)' }}>
            {CUSTOMER_BENEFITS.map((b, i) => {
              const copy = b[lang] || b.en;
              return (
                <div key={b.icon} style={{
                  padding: '36px 28px',
                  paddingLeft: !isMobile && i % 2 === 0 ? 0 : 28,
                  borderRight: !isMobile && i % 2 === 0 ? '1px solid var(--bci-hairline-light)' : 'none',
                  borderBottom: i < CUSTOMER_BENEFITS.length - (isMobile ? 1 : 2) ? '1px solid var(--bci-hairline-light)' : 'none',
                  textAlign: isAr ? 'right' : 'left',
                }}>
                  <div style={{ width: 46, height: 46, border: '1px solid var(--bci-navy-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon name={b.icon} size={22} stroke="var(--bci-green-600)" />
                  </div>
                  <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 20, color: 'var(--bci-navy)', margin: '0 0 10px' }}>{copy.t}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-steel)', margin: 0 }}>{copy.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bci-navy)', color: '#fff', padding: isMobile ? '72px 0' : '110px 0', borderTop: '1px solid var(--bci-green-500)', borderBottom: '1px solid var(--bci-green-500)', position: 'relative', overflow: 'hidden' }}>
        <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="sec-num" style={{ color: 'var(--bci-green-400)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'How it works', 'كيف تعمل', 'Cómo funciona')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {CUSTOMER_STEPS.map((s, i) => (
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
            {t(lang, 'Customer registration', 'تسجيل عميل', 'Registro de cliente')}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: '0 0 32px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang,
              'Your details go directly to our sales system. Fields marked * are required — everything else you can leave blank.',
              'تصل بياناتك مباشرة إلى نظام المبيعات لدينا. الحقول المعلمة بـ * إلزامية — وما عداها يمكن تركه فارغًا.',
              'Tus datos van directamente a nuestro sistema comercial. Los campos marcados con * son obligatorios — el resto puedes dejarlo en blanco.')}
          </p>
          <form className="bci-form" onSubmit={submitRegistration}
            style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: isMobile ? 24 : 36, display: 'flex', flexDirection: 'column', gap: 20, direction: isAr ? 'rtl' : 'ltr' }}>

            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Company name *', 'اسم الشركة (بالإنجليزية) *', 'Nombre de la empresa *')}</label><input required name="company_name" type="text" /></div>
              <div className="field"><label>{t(lang, 'Company name (Arabic)', 'اسم الشركة (بالعربية)', 'Nombre de la empresa (árabe)')}</label><input name="company_name_ar" type="text" dir="rtl" /></div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Account type *', 'نوع الحساب *', 'Tipo de cuenta *')}</label>
                <select required name="customer_type" defaultValue="Company">
                  <option value="Company">{t(lang, 'Company', 'شركة', 'Empresa')}</option>
                  <option value="Individual">{t(lang, 'Individual', 'فرد / مؤسسة فردية', 'Individual')}</option>
                  <option value="Partnership">{t(lang, 'Partnership', 'شراكة', 'Sociedad')}</option>
                </select>
              </div>
              <div className="field"><label>{t(lang, 'Country *', 'الدولة *', 'País *')}</label>
                <select required name="country" defaultValue="Saudi Arabia">
                  {ERP_COUNTRIES.map((c) => <option key={c} value={c} title={c}>{selectOptionLabel(c, isPhone)}</option>)}
                </select>
              </div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'City *', 'المدينة *', 'Ciudad *')}</label><input required name="city" type="text" /></div>
              <div className="field"><label>{t(lang, 'Contact person *', 'الشخص المسؤول *', 'Persona de contacto *')}</label><input required name="contact_person" type="text" /></div>
            </div>
            <div className="field">
              <label>{t(lang, 'Address *', 'العنوان *', 'Dirección *')}</label>
              <input required name="address_line" type="text" placeholder={t(lang,
                'Street, district, building — where deliveries and invoices go',
                'الشارع، الحي، المبنى — حيث تُسلّم الطلبات والفواتير',
                'Calle, distrito, edificio — adonde llegan entregas y facturas')} />
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'Email *', 'البريد الإلكتروني *', 'Correo *')}</label><input required name="email" type="email" placeholder="name@company.com" /></div>
              <div className="field"><label>{t(lang, 'Mobile *', 'الجوال *', 'Móvil *')}</label><input required name="mobile" type="tel" placeholder="+966" /></div>
            </div>
            <div style={twoCol}>
              <div className="field"><label>{t(lang, 'CR number *', 'رقم السجل التجاري *', 'Registro comercial (CR) *')}</label><input required name="cr_number" type="text" /></div>
              <div className="field"><label>{t(lang, 'VAT number', 'الرقم الضريبي', 'Número de IVA')}</label><input name="vat_number" type="text" /></div>
            </div>
            <div className="field">
              <label>{t(lang, 'Website', 'الموقع الإلكتروني', 'Sitio web')}</label>
              <input name="website" type="url" placeholder="https://" />
            </div>

            {/* What they buy — drives how sales prices and routes the account. */}
            <div style={{ borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 6 }}>
                  {t(lang, 'What you buy *', 'ما الذي تشتريه *', 'Qué compras *')}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--bci-steel)' }}>
                  {t(lang,
                    'Select every product line you expect to order. It decides which technical sales engineer your account goes to.',
                    'اختر كل خط منتجات تتوقع طلبه. يحدد ذلك مهندس المبيعات الفني الذي يُسند إليه حسابك.',
                    'Selecciona cada línea de producto que esperas pedir. Determina a qué ingeniero comercial se asigna tu cuenta.')}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {CUSTOMER_INTERESTS.map((item) => {
                  const on = interests.includes(item.key);
                  return (
                    <label key={item.key} style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      border: `1px solid ${on ? 'var(--bci-green-500)' : 'var(--bci-hairline-light)'}`,
                      background: on ? 'var(--bci-green-50)' : 'var(--bci-paper)',
                      padding: '12px 14px', fontSize: 14, color: 'var(--bci-navy)',
                      transition: 'border-color 120ms linear, background-color 120ms linear',
                    }}>
                      <input type="checkbox" checked={on} onChange={() => toggleInterest(item.key)}
                        style={{ width: 16, height: 16, flexShrink: 0, margin: 0 }} />
                      {item[lang] || item.en}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="eyebrow" style={{ color: 'var(--bci-green-700)' }}>
                {t(lang, 'Company documents', 'مستندات الشركة', 'Documentos de la empresa')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                <div className="field">
                  <label>{t(lang, 'Company logo *', 'شعار الشركة *', 'Logotipo *')}</label>
                  <input required name="company_logo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" />
                </div>
                <div className="field">
                  <label>{t(lang, 'Commercial registration (CR) *', 'السجل التجاري *', 'Registro comercial (CR) *')}</label>
                  <input required name="cr_document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" />
                </div>
                <div className="field">
                  <label>{t(lang, 'VAT certificate', 'الشهادة الضريبية', 'Certificado de IVA')}</label>
                  <input name="vat_document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--bci-steel)' }}>
                {t(lang,
                  'Logo: JPG, PNG or WebP up to 5 MB. Documents: PDF, JPG, PNG or WebP up to 10 MB each — a clear phone photo of the certificate is fine.',
                  'الشعار: JPG أو PNG أو WebP بحد أقصى 5 ميجابايت. المستندات: PDF أو JPG أو PNG أو WebP بحد أقصى 10 ميجابايت — صورة واضحة بالجوال للشهادة تكفي.',
                  'Logotipo: JPG, PNG o WebP hasta 5 MB. Documentos: PDF, JPG, PNG o WebP hasta 10 MB cada uno — una foto nítida del certificado sirve.')}
              </div>
              <div className="field">
                <label>{t(lang, 'Anything else we should know (optional)', 'أي معلومات أخرى (اختياري)', 'Algo más que debamos saber (opcional)')}</label>
                <textarea name="notes" rows={4} placeholder={t(lang,
                  'Current projects, approximate monthly volumes, brands you use today…',
                  'المشاريع الحالية، الكميات الشهرية التقريبية، العلامات التجارية التي تستخدمها حاليًا…',
                  'Obras en curso, volúmenes mensuales aproximados, marcas que usas hoy…')}></textarea>
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
                : <>{t(lang, 'Open my account', 'افتح حسابي', 'Abrir mi cuenta')} <Arrow size={14} /></>}
            </button>

            {sent &&
              <div role="status" style={{ fontSize: 13, color: 'var(--bci-green-700)', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', borderRadius: 2, padding: '12px 14px', textAlign: isAr ? 'right' : 'left' }}>
                {t(lang,
                  'Thank you — our sales team will verify your details and activate your account, usually within two working days.',
                  'شكرًا لك — سيتحقق فريق المبيعات من بياناتك ويُفعّل حسابك، عادةً خلال يومي عمل.',
                  'Gracias — nuestro equipo comercial verificará tus datos y activará tu cuenta, normalmente en dos días hábiles.')}
                {customerId &&
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, marginTop: 8 }}>
                    {t(lang, 'Reference', 'الرقم المرجعي', 'Referencia')}: {customerId}
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
    <MegaHeader active="Open an Account" />
    <CustomerRegistrationPage />
    <Footer />
  </LangProvider>
);
