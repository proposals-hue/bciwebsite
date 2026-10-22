/* global React, ReactDOM, LangProvider, useLang, useViewport, t, Icon, Arrow, siteHref,
   MegaHeader, PageHero, Footer, SOLUTIONS, CONTACT_DETAILS, submitSupportRequest */
const { useState: useState_sp, useRef: useRef_sp, useEffect: useEffect_sp } = React;

/* The four request types and their topics. A topic `key` is all the page
   sends: the ERP request type, feedback category (which decides the
   department) and priority live in TOPICS in api/_support-request.js, so keep
   the keys in step. `team` only drives what the confirmation tells the
   customer, and mirrors that routing. */
const SUPPORT_CATEGORIES = [
  {
    key: 'complaint', num: '01', icon: 'alert-triangle',
    en: { t: 'Submit a Complaint', d: 'For issues involving product quality, performance, packaging, incorrect materials, or other concerns.' },
    ar: { t: 'تقديم شكوى', d: 'للمشكلات المتعلقة بجودة المنتج أو أدائه، أو التعبئة والتغليف، أو توريد مواد غير صحيحة، أو أي ملاحظات أخرى.' },
    es: { t: 'Presentar una Queja', d: 'Para incidencias de calidad o desempeño del producto, envases, materiales incorrectos u otros problemas.' },
    topics: [
      { key: 'product-quality', team: 'quality', en: 'Product quality or performance', ar: 'جودة المنتج أو أداؤه', es: 'Calidad o desempeño del producto' },
      { key: 'packaging', team: 'quality', en: 'Packaging or labelling', ar: 'التعبئة أو الملصقات', es: 'Envase o etiquetado' },
      { key: 'wrong-material', team: 'logistics', en: 'Incorrect material supplied', ar: 'توريد مادة غير صحيحة', es: 'Material suministrado incorrecto' },
      { key: 'service', team: 'service', en: 'Service or staff', ar: 'الخدمة أو الموظفون', es: 'Servicio o personal' },
      { key: 'other', team: 'service', en: 'Other concern', ar: 'ملاحظة أخرى', es: 'Otra incidencia' },
    ],
  },
  {
    key: 'technical', num: '02', icon: 'flask',
    en: { t: 'Technical Support', d: 'For product application guidance, mixing ratios, technical documentation, compatibility questions, or on-site difficulties.' },
    ar: { t: 'الدعم الفني', d: 'لإرشادات تطبيق المنتجات، ونسب الخلط، والوثائق الفنية، وأسئلة التوافق، أو الصعوبات في موقع العمل.' },
    es: { t: 'Soporte Técnico', d: 'Para guía de aplicación, proporciones de mezcla, documentación técnica, compatibilidad o dificultades en obra.' },
    topics: [
      { key: 'application', team: 'technical', en: 'Application guidance', ar: 'إرشادات التطبيق', es: 'Guía de aplicación' },
      { key: 'mixing', team: 'technical', en: 'Mixing ratio, coverage or curing', ar: 'نسب الخلط أو معدل التغطية أو المعالجة', es: 'Mezcla, rendimiento o curado' },
      { key: 'documents', team: 'technical', en: 'Technical documents (TDS, SDS, method statement)', ar: 'الوثائق الفنية (النشرة الفنية، نشرة السلامة، طريقة التنفيذ)', es: 'Documentación técnica (ficha técnica, de seguridad, procedimiento)' },
      { key: 'compatibility', team: 'technical', en: 'Compatibility or system selection', ar: 'التوافق أو اختيار النظام', es: 'Compatibilidad o selección de sistema' },
      { key: 'site-problem', team: 'technical', en: 'Problem on site', ar: 'مشكلة في الموقع', es: 'Problema en obra' },
    ],
  },
  {
    key: 'order', num: '03', icon: 'truck',
    en: { t: 'Order & Delivery Support', d: 'For delivery delays, incorrect quantities, damaged packaging, missing items, or order discrepancies.' },
    ar: { t: 'دعم الطلبات والتوصيل', d: 'لتأخر التوصيل، أو الكميات غير الصحيحة، أو تلف التغليف، أو الأصناف الناقصة، أو الاختلافات في الطلب.' },
    es: { t: 'Pedidos y Entregas', d: 'Para retrasos de entrega, cantidades incorrectas, envases dañados, artículos faltantes o discrepancias en el pedido.' },
    topics: [
      { key: 'delay', team: 'logistics', en: 'Delivery delay', ar: 'تأخر التوصيل', es: 'Retraso en la entrega' },
      { key: 'quantity', team: 'logistics', en: 'Incorrect quantity', ar: 'كمية غير صحيحة', es: 'Cantidad incorrecta' },
      { key: 'damaged', team: 'logistics', en: 'Damaged packaging or goods', ar: 'تلف التغليف أو البضاعة', es: 'Envase o mercancía dañados' },
      { key: 'missing', team: 'logistics', en: 'Missing items', ar: 'أصناف ناقصة', es: 'Artículos faltantes' },
      { key: 'discrepancy', team: 'sales', en: 'Order discrepancy', ar: 'اختلاف في الطلب', es: 'Discrepancia en el pedido' },
      { key: 'billing', team: 'accounts', en: 'Invoice or billing issue', ar: 'مشكلة في الفاتورة أو المحاسبة', es: 'Factura o cobro' },
    ],
  },
  {
    key: 'feedback', num: '04', icon: 'message',
    en: { t: 'Feedback & Suggestions', d: 'For customer recommendations, service improvements, or general feedback.' },
    ar: { t: 'الملاحظات والاقتراحات', d: 'لتوصيات العملاء، أو مقترحات تحسين الخدمة، أو الملاحظات العامة.' },
    es: { t: 'Comentarios y Sugerencias', d: 'Para recomendaciones, mejoras del servicio o comentarios generales.' },
    topics: [
      { key: 'suggestion', team: 'service', en: 'Suggestion or improvement', ar: 'اقتراح أو تحسين', es: 'Sugerencia o mejora' },
      { key: 'product', team: 'service', en: 'Product feedback', ar: 'ملاحظات على منتج', es: 'Comentario sobre un producto' },
      { key: 'service', team: 'service', en: 'Service feedback', ar: 'ملاحظات على الخدمة', es: 'Comentario sobre el servicio' },
      { key: 'compliment', team: 'service', en: 'Compliment', ar: 'إشادة', es: 'Felicitación' },
    ],
  },
];

const SUPPORT_TEAMS = {
  quality: { en: 'Quality Control team', ar: 'فريق مراقبة الجودة', es: 'equipo de Control de Calidad' },
  technical: { en: 'Technical Department', ar: 'القسم الفني', es: 'Departamento Técnico' },
  logistics: { en: 'Logistics team', ar: 'فريق الخدمات اللوجستية', es: 'equipo de Logística' },
  sales: { en: 'Sales team', ar: 'فريق المبيعات', es: 'equipo Comercial' },
  accounts: { en: 'Accounts team', ar: 'فريق الحسابات', es: 'equipo de Contabilidad' },
  service: { en: 'Customer Service team', ar: 'فريق خدمة العملاء', es: 'equipo de Atención al Cliente' },
};

/* The optional details each request type asks for. 'required' is enforced
   again by api/_support-request.js; `evidence` turns the attachments block
   into "photo evidence". Everything not listed stays hidden. */
const SUPPORT_FIELDS = {
  complaint: { product: 'required', batch: true, invoice: true, project: true, location: true, date: true, evidence: true },
  technical: { product: true, project: true, location: true },
  order: { invoice: 'required', product: true, project: true, location: true, date: true, evidence: true },
  feedback: { product: true },
};

const SUPPORT_EMPTY = {
  category: '', topic: '', full_name: '', company_name: '', email: '', mobile: '', subject: '',
  description: '', product_code: '', product_other: '', batch_no: '', invoice_no: '',
  project_name: '', project_location: '', incident_date: '',
};

const SUPPORT_MIN_DESCRIPTION = 20;
const SUPPORT_MAX_DESCRIPTION = 5000;
const SUPPORT_OTHER_PRODUCT = '__other';

/* Attachments travel base64-encoded inside the request (the Vercel Blob store
   that stages the other forms' files is suspended). Vercel rejects a function
   body over 4.5 MB, so this is the base64 total all files may add — the
   server's MAX_ATTACHMENT_TOTAL allows the same ~3 MB of raw file. Photos are
   re-encoded to a 1600px JPEG first, which keeps most well under 1 MB. */
const SUPPORT_MAX_FILES = 5;
const SUPPORT_INLINE_BUDGET = 4 * 1024 * 1024;
const SUPPORT_MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const SUPPORT_PHOTO_MAX_DIMENSION = 1600;
const SUPPORT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SUPPORT_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf';

const supportBase64Size = (bytes) => Math.ceil(bytes / 3) * 4;
const supportMb = (bytes) => (Math.round((bytes / (1024 * 1024)) * 10) / 10).toString();

function supportToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function supportFileKind(file) {
  const type = String(file.type || '').toLowerCase();
  const name = String(file.name || '').toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (/^image\/(jpe?g|png|webp|heic|heif)$/.test(type) || /\.(jpe?g|png|webp|heic|heif)$/.test(name)) return 'image';
  return '';
}

/* Every photo is re-encoded to a JPEG no larger than 1600px — enough detail
   for quality control to read a label or see a crack, small enough to send
   inline. HEIC/HEIF (iPhone) must convert; the others keep their original
   when that is already smaller. */
function supportPrepareImage(file) {
  const objectUrl = URL.createObjectURL(file);
  const sourceType = String(file.type || '').toLowerCase().replace('image/jpg', 'image/jpeg');
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('IMAGE_UNREADABLE'));
    image.src = objectUrl;
  }).then((image) => {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const scale = Math.min(1, SUPPORT_PHOTO_MAX_DIMENSION / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('IMAGE_UNREADABLE');
    // JPEG has no transparency; without a fill a transparent PNG turns black.
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('IMAGE_UNREADABLE'))), 'image/jpeg', 0.82);
    });
  }).then((blob) => {
    if (SUPPORT_IMAGE_TYPES.includes(sourceType) && file.size <= blob.size) {
      return { blob: file, name: file.name, type: sourceType };
    }
    const base = String(file.name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
    return { blob, name: `${base}.jpg`, type: 'image/jpeg' };
  }).finally(() => URL.revokeObjectURL(objectUrl));
}

function supportBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(reader.error || new Error('FILE_READ_FAILED'));
    reader.readAsDataURL(blob);
  });
}

/* The /api routes are Vercel functions — a plain static dev server has none,
   so say that rather than showing a bare fetch error. */
function isLocalSupportPreviewHost() {
  try { return ['127.0.0.1', 'localhost'].includes(window.location.hostname); }
  catch (_) { return false; }
}

function supportReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (_) { return true; }
}

function supportValidate(values, lang) {
  const errors = {};
  const fields = SUPPORT_FIELDS[values.category] || {};
  const email = values.email.trim();
  const mobile = values.mobile.trim();
  const description = values.description.trim();

  if (!values.full_name.trim()) {
    errors.full_name = t(lang, 'Please enter your full name.', 'يرجى إدخال الاسم الكامل.', 'Introduce tu nombre completo.');
  }
  if (!email && !mobile) {
    errors.contact = t(lang,
      'Please give an email address or a mobile number so we can reach you.',
      'يرجى إدخال البريد الإلكتروني أو رقم الجوال لنتمكن من التواصل معك.',
      'Indica un correo o un móvil para que podamos contactarte.');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = t(lang,
      'Please enter a valid email address, e.g. name@company.com.',
      'يرجى إدخال بريد إلكتروني صحيح، مثل name@company.com.',
      'Introduce un correo válido, p. ej. nombre@empresa.com.');
  }
  if (mobile && (mobile.replace(/\D/g, '').length < 7 || !/^[+\d\s()\-.]+$/.test(mobile))) {
    errors.mobile = t(lang,
      'Please enter a valid mobile number, e.g. +966 5X XXX XXXX.',
      'يرجى إدخال رقم جوال صحيح، مثل ‎+966 5X XXX XXXX.',
      'Introduce un móvil válido, p. ej. +966 5X XXX XXXX.');
  }
  if (!values.category) {
    errors.category = t(lang, 'Please choose what your request is about.', 'يرجى اختيار نوع الطلب.', 'Elige el tipo de solicitud.');
  } else if (!values.topic) {
    errors.topic = t(lang, 'Please choose the type of issue.', 'يرجى اختيار موضوع الطلب.', 'Elige de qué se trata.');
  }
  if (fields.product === 'required' && !values.product_code) {
    errors.product_code = t(lang,
      'Please choose the product this complaint is about.',
      'يرجى اختيار المنتج موضوع الشكوى.',
      'Elige el producto al que se refiere la queja.');
  }
  if (fields.product && values.product_code === SUPPORT_OTHER_PRODUCT && !values.product_other.trim()) {
    errors.product_other = t(lang, 'Please type the product name.', 'يرجى كتابة اسم المنتج.', 'Escribe el nombre del producto.');
  }
  if (fields.invoice === 'required' && !values.invoice_no.trim()) {
    errors.invoice_no = t(lang,
      'Please enter your invoice, delivery note or purchase order number.',
      'يرجى إدخال رقم الفاتورة أو إشعار التسليم أو أمر الشراء.',
      'Indica el número de factura, albarán u orden de compra.');
  }
  if (fields.date && values.incident_date && values.incident_date > supportToday()) {
    errors.incident_date = t(lang, 'The date cannot be in the future.', 'لا يمكن أن يكون التاريخ في المستقبل.', 'La fecha no puede ser futura.');
  }
  if (!description) {
    errors.description = t(lang, 'Please describe your request.', 'يرجى وصف طلبك.', 'Describe tu solicitud.');
  } else if (description.length < SUPPORT_MIN_DESCRIPTION) {
    errors.description = t(lang,
      `Please add a little more detail — at least ${SUPPORT_MIN_DESCRIPTION} characters.`,
      `يرجى إضافة مزيد من التفاصيل — ${SUPPORT_MIN_DESCRIPTION} حرفًا على الأقل.`,
      `Añade algo más de detalle — al menos ${SUPPORT_MIN_DESCRIPTION} caracteres.`);
  }
  return errors;
}

/* Error keys in on-screen order; the first one present receives focus. */
const SUPPORT_ERROR_ORDER = [
  ['full_name', 'full_name'], ['contact', 'email'], ['email', 'email'], ['mobile', 'mobile'],
  ['category', 'category'], ['topic', 'topic'], ['product_code', 'product_code'],
  ['product_other', 'product_other'], ['invoice_no', 'invoice_no'],
  ['incident_date', 'incident_date'], ['description', 'description'],
];

/* ---------------- Category cards ---------------- */
function SupportCategoryCards({ selected, onSelect }) {
  const { lang } = useLang();
  const { isMobile, isPhone } = useViewport();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_sp('');
  return (
    <section style={{ background: 'var(--bci-concrete)', padding: isMobile ? '72px 0' : '120px 0' }}>
      <div className="container">
        <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'How can we help', 'كيف نساعدك', 'Cómo podemos ayudarte')}
        </div>
        <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 12px', textAlign: isAr ? 'right' : 'left' }}>
          {t(lang, 'Choose the type of request', 'اختر نوع الطلب', 'Elige el tipo de solicitud')}
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: '0 0 40px', maxWidth: 640, marginLeft: isAr ? 'auto' : 0, textAlign: isAr ? 'right' : 'left' }}>
          {t(lang,
            'Every request is logged with a ticket reference and goes straight to the team responsible for it — so the right specialist sees it first.',
            'يُسجَّل كل طلب برقم مرجعي ويُحال مباشرة إلى الفريق المسؤول عنه — ليصل أولًا إلى المختص المناسب.',
            'Cada solicitud se registra con una referencia y pasa directamente al equipo responsable, para que la vea primero el especialista adecuado.')}
        </p>
        <div role="group" aria-label={t(lang, 'Request type', 'نوع الطلب', 'Tipo de solicitud')}
          style={{ display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: 16, direction: isAr ? 'rtl' : 'ltr' }}>
          {SUPPORT_CATEGORIES.map((c) => {
            const on = selected === c.key;
            const lit = on || hover === c.key;
            const copy = c[lang] || c.en;
            return (
              <button key={c.key} type="button" aria-pressed={on} onClick={() => onSelect(c.key)}
                onMouseEnter={() => setHover(c.key)} onMouseLeave={() => setHover('')}
                onFocus={() => setHover(c.key)} onBlur={() => setHover('')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: isAr ? 'right' : 'left',
                  background: on ? 'var(--bci-navy)' : '#fff', color: on ? '#fff' : 'var(--bci-navy)',
                  border: `1px solid ${on ? 'var(--bci-navy)' : lit ? 'var(--bci-navy-200)' : 'var(--bci-hairline-light)'}`,
                  boxShadow: `inset 0 3px 0 ${lit ? 'var(--bci-green-500)' : 'transparent'}`,
                  borderRadius: 2, padding: isPhone ? 24 : 28, minHeight: isPhone ? 0 : 288, cursor: 'pointer',
                  fontFamily: 'inherit', outlineOffset: 3,
                  transform: lit && !on ? 'translateY(-2px)' : 'none',
                  transition: 'background-color 160ms linear, border-color 160ms linear, color 160ms linear, box-shadow 160ms linear, transform 160ms ease',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
                  <span style={{
                    width: 48, height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${on ? 'rgba(255,255,255,0.25)' : 'var(--bci-navy-100)'}`,
                  }}>
                    <Icon name={c.icon} size={22} stroke={on ? 'var(--bci-green-400)' : 'var(--bci-green-600)'} />
                  </span>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, letterSpacing: '0.12em', color: on ? 'rgba(255,255,255,0.55)' : 'var(--bci-steel)' }}>{c.num}</span>
                </span>
                <span style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 21, lineHeight: 1.25, marginBottom: 10 }}>{copy.t}</span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: on ? 'rgba(255,255,255,0.72)' : 'var(--bci-steel)', flex: 1 }}>{copy.d}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, paddingTop: 16,
                  borderTop: `1px solid ${on ? 'rgba(255,255,255,0.14)' : 'var(--bci-hairline-light)'}`,
                  fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: on ? 'var(--bci-green-400)' : 'var(--bci-green-700)',
                }}>
                  {on
                    ? <><Icon name="check" size={13} /> {t(lang, 'Selected', 'تم الاختيار', 'Seleccionado')}</>
                    : <>{t(lang, 'Start request', 'ابدأ الطلب', 'Iniciar solicitud')} <Arrow size={13} /></>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Process rail ---------------- */
const SUPPORT_STEPS = [
  { num: '01',
    en: { t: 'Logged', d: 'Your request is saved in our system and given a ticket reference straight away.' },
    ar: { t: 'التسجيل', d: 'يُحفظ طلبك في نظامنا ويحصل فورًا على رقم مرجعي.' },
    es: { t: 'Registro', d: 'Tu solicitud se guarda en nuestro sistema y recibe una referencia al instante.' } },
  { num: '02',
    en: { t: 'Routed', d: 'It goes directly to the responsible team — quality control, technical, logistics, accounts or customer service.' },
    ar: { t: 'التوجيه', d: 'يُحال مباشرة إلى الفريق المسؤول — مراقبة الجودة أو القسم الفني أو الخدمات اللوجستية أو الحسابات أو خدمة العملاء.' },
    es: { t: 'Asignación', d: 'Pasa directamente al equipo responsable — calidad, técnico, logística, contabilidad o atención al cliente.' } },
  { num: '03',
    en: { t: 'Investigated', d: 'The team reviews the details and evidence, and contacts you to agree the next steps.' },
    ar: { t: 'المتابعة', d: 'يراجع الفريق التفاصيل والأدلة، ويتواصل معك للاتفاق على الخطوات التالية.' },
    es: { t: 'Seguimiento', d: 'El equipo revisa los detalles y la evidencia, y te contacta para acordar los siguientes pasos.' } },
  { num: '04',
    en: { t: 'Resolved', d: 'Every action is recorded against your ticket, which is closed only once the issue is resolved.' },
    ar: { t: 'الإغلاق', d: 'يُسجَّل كل إجراء على طلبك، ولا يُغلق إلا بعد حل المشكلة.' },
    es: { t: 'Resolución', d: 'Cada acción queda registrada en tu ticket, que solo se cierra cuando el problema está resuelto.' } },
];

function SupportProcessRail() {
  const { lang } = useLang();
  const { isMobile } = useViewport();
  const isAr = lang === 'ar';
  const contacts = (CONTACT_DETAILS || []).filter((c) => ['phone', 'whatsapp', 'mail'].includes(c.icon));
  return (
    <aside style={{ position: isMobile ? 'static' : 'sticky', top: 112, textAlign: isAr ? 'right' : 'left' }}>
      <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 18 }}>{t(lang, 'How it works', 'كيف نتعامل مع طلبك', 'Cómo funciona')}</div>
      <h2 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 26, lineHeight: 1.2, color: 'var(--bci-navy)', margin: '0 0 28px' }}>
        {t(lang, 'What happens after you submit', 'ماذا يحدث بعد الإرسال', 'Qué pasa después de enviar')}
      </h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {SUPPORT_STEPS.map((s, i) => {
          const copy = s[lang] || s.en;
          const last = i === SUPPORT_STEPS.length - 1;
          return (
            <li key={s.num} style={{ display: 'grid', gridTemplateColumns: '40px minmax(0, 1fr)', gap: 14, direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 40, height: 40, border: '1px solid var(--bci-navy-100)', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--bci-green-700)' }}>{s.num}</span>
                {!last && <span aria-hidden="true" style={{ flex: 1, width: 1, background: 'var(--bci-navy-100)', minHeight: 20 }} />}
              </div>
              <div style={{ paddingBottom: last ? 0 : 24, paddingTop: 8 }}>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 17, color: 'var(--bci-navy)', margin: '0 0 6px' }}>{copy.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-steel)', margin: 0 }}>{copy.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--bci-hairline-light)' }}>
        <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 14 }}>
          {t(lang, 'Prefer to speak to someone?', 'تفضّل التحدث مع أحد؟', '¿Prefieres hablar con alguien?')}
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contacts.map((c) => {
            const value = typeof c.value === 'string' ? c.value : (c.value[lang] || c.value.en);
            const external = /^https?:/.test(c.href);
            return (
              <li key={c.icon}>
                <a href={c.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'var(--bci-navy)', textDecoration: 'none', fontSize: 14 }}>
                  <span style={{ width: 34, height: 34, border: '1px solid var(--bci-hairline-light)', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.icon} size={16} stroke="var(--bci-green-600)" />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--bci-steel)' }}>{c.label[lang] || c.label.en}</span>
                    <span dir={c.mono ? 'ltr' : undefined} style={{ fontFamily: c.mono ? 'var(--ff-mono)' : 'inherit', fontSize: c.mono ? 13 : 14 }}>{value}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

/* ---------------- Confirmation ---------------- */
function SupportConfirmation({ result, onReset }) {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const isAr = lang === 'ar';
  const headingRef = useRef_sp(null);
  const [copied, setCopied] = useState_sp(false);
  const team = SUPPORT_TEAMS[result.team] || SUPPORT_TEAMS.service;
  const teamName = team[lang] || team.en;
  const category = SUPPORT_CATEGORIES.find((c) => c.key === result.category);
  const topic = category && category.topics.find((tp) => tp.key === result.topic);

  useEffect_sp(() => { if (headingRef.current) headingRef.current.focus({ preventScroll: true }); }, []);

  const copyTicket = async () => {
    try {
      await navigator.clipboard.writeText(result.ticket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (_) { /* clipboard blocked — the reference stays selectable */ }
  };

  const name = result.firstName;
  const heading = name
    ? t(lang, `Thank you, ${name}. Your request is logged.`, `شكرًا ${name}، تم تسجيل طلبك.`, `Gracias, ${name}. Tu solicitud está registrada.`)
    : t(lang, 'Thank you. Your request is logged.', 'شكرًا لك، تم تسجيل طلبك.', 'Gracias. Tu solicitud está registrada.');

  const steps = [
    t(lang,
      `The ${teamName} reviews your request and anything you attached.`,
      `يراجع ${teamName} طلبك وأي مرفقات أرسلتها.`,
      `El ${teamName} revisa tu solicitud y lo que hayas adjuntado.`),
    t(lang,
      'We contact you by email or phone for any missing details and to agree the next steps.',
      'نتواصل معك عبر البريد الإلكتروني أو الهاتف لاستكمال أي تفاصيل والاتفاق على الخطوات التالية.',
      'Te contactamos por correo o teléfono para completar detalles y acordar los siguientes pasos.'),
    t(lang,
      'Your ticket stays open until the matter is resolved.',
      'يبقى طلبك مفتوحًا حتى تتم معالجة الموضوع بالكامل.',
      'Tu ticket permanece abierto hasta que el asunto quede resuelto.'),
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderTop: '3px solid var(--bci-green-500)', borderRadius: 2, padding: isPhone ? 24 : 40, textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ width: 52, height: 52, background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <Icon name="check" size={24} stroke="var(--bci-green-700)" strokeWidth={2} />
      </div>
      <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 10 }}>{t(lang, 'Request received', 'تم استلام طلبك', 'Solicitud recibida')}</div>
      <h2 ref={headingRef} tabIndex={-1} style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(26px,2.6vw,34px)', lineHeight: 1.2, color: 'var(--bci-navy)', margin: '0 0 24px', outline: 'none' }}>
        {heading}
      </h2>

      {result.ticket &&
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'var(--bci-navy)', color: '#fff', padding: isPhone ? '18px 20px' : '22px 26px', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--bci-green-400)', marginBottom: 6 }}>
              {t(lang, 'Ticket reference', 'الرقم المرجعي للطلب', 'Referencia del ticket')}
            </div>
            <div dir="ltr" style={{ fontFamily: 'var(--ff-mono)', fontSize: isPhone ? 24 : 30, fontWeight: 600, letterSpacing: '0.04em', userSelect: 'all' }}>{result.ticket}</div>
          </div>
          <button type="button" onClick={copyTicket} className="btn btn-ghost-light" style={{ padding: '10px 16px', fontSize: 12 }}>
            <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? t(lang, 'Copied', 'تم النسخ', 'Copiado') : t(lang, 'Copy', 'نسخ', 'Copiar')}
          </button>
        </div>}

      <div style={{ display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ border: '1px solid var(--bci-hairline-light)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--bci-steel)', marginBottom: 4 }}>{t(lang, 'Routed to', 'أُحيل إلى', 'Asignada a')}</div>
          <div style={{ fontSize: 15, color: 'var(--bci-navy)', fontWeight: 600 }}>{teamName.charAt(0).toUpperCase() + teamName.slice(1)}</div>
        </div>
        <div style={{ border: '1px solid var(--bci-hairline-light)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--bci-steel)', marginBottom: 4 }}>{t(lang, 'Request', 'الطلب', 'Solicitud')}</div>
          <div style={{ fontSize: 15, color: 'var(--bci-navy)', fontWeight: 600 }}>
            {category ? (category[lang] || category.en).t : ''}{topic ? ` · ${topic[lang] || topic.en}` : ''}
          </div>
        </div>
      </div>

      <p role="status" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-ink)', margin: '0 0 12px' }}>
        {result.acknowledgement
          ? t(lang,
            <>A confirmation has been emailed to <strong dir="ltr">{result.email}</strong>.</>,
            <>أرسلنا رسالة تأكيد إلى <strong dir="ltr">{result.email}</strong>.</>,
            <>Hemos enviado una confirmación a <strong dir="ltr">{result.email}</strong>.</>)
          : t(lang,
            'Please keep this reference and quote it whenever you contact us about this request.',
            'يرجى الاحتفاظ بهذا الرقم وذكره عند تواصلك معنا بخصوص هذا الطلب.',
            'Guarda esta referencia y menciónala cuando nos contactes sobre esta solicitud.')}
      </p>
      {result.attachmentWarning &&
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-navy)', background: 'var(--bci-hi-vis-50)', border: '1px solid var(--bci-hi-vis-600)', padding: '12px 14px', margin: '0 0 12px' }}>
          {t(lang,
            `Your request was saved, but an attachment did not reach us. Please email it to info@bcisaudi.com, quoting ${result.ticket || 'your name'}.`,
            `تم حفظ طلبك، لكن أحد المرفقات لم يصل إلينا. يرجى إرساله إلى info@bcisaudi.com مع ذكر ${result.ticket || 'اسمك'}.`,
            `Tu solicitud se guardó, pero un adjunto no llegó. Envíalo a info@bcisaudi.com indicando ${result.ticket || 'tu nombre'}.`)}
        </div>}

      <div style={{ borderTop: '1px solid var(--bci-hairline-light)', marginTop: 24, paddingTop: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 14 }}>{t(lang, 'What happens next', 'الخطوات التالية', 'Próximos pasos')}</div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontSize: 14, lineHeight: 1.6, color: 'var(--bci-steel)' }}>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--bci-green-700)', flexShrink: 0 }}>0{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
        <button type="button" onClick={onReset} className="btn btn-navy">{t(lang, 'Submit another request', 'إرسال طلب آخر', 'Enviar otra solicitud')}</button>
        <a href={siteHref('index.html', lang)} className="btn btn-ghost-navy">{t(lang, 'Back to home', 'العودة إلى الرئيسية', 'Volver al inicio')}</a>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
function SupportPage() {
  const { lang } = useLang();
  const { isMobile, isPhone } = useViewport();
  const isAr = lang === 'ar';
  const [values, setValues] = useState_sp(SUPPORT_EMPTY);
  const [errors, setErrors] = useState_sp({});
  const [files, setFiles] = useState_sp([]);
  const [fileError, setFileError] = useState_sp('');
  const [preparing, setPreparing] = useState_sp(false);
  const [dragging, setDragging] = useState_sp(false);
  const [dropFocus, setDropFocus] = useState_sp(false);
  const [status, setStatus] = useState_sp('idle'); // idle | sending | sent | error
  const [banner, setBanner] = useState_sp('');
  const [result, setResult] = useState_sp(null);
  const sectionRef = useRef_sp(null);
  const filesRef = useRef_sp(files);
  filesRef.current = files;

  const category = SUPPORT_CATEGORIES.find((c) => c.key === values.category);
  const fields = SUPPORT_FIELDS[values.category] || {};
  const sending = status === 'sending';

  // Object URLs for thumbnails are released when the page goes away.
  useEffect_sp(() => () => filesRef.current.forEach((f) => f.preview && URL.revokeObjectURL(f.preview)), []);

  const scrollToForm = (focusId) => {
    const reduced = supportReducedMotion();
    if (sectionRef.current) sectionRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (focusId) {
      setTimeout(() => {
        const target = document.getElementById(focusId);
        if (target) target.focus({ preventScroll: true });
      }, reduced ? 0 : 450);
    }
  };

  const update = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name] && !((name === 'email' || name === 'mobile') && current.contact)) return current;
      const next = { ...current };
      delete next[name];
      if (name === 'email' || name === 'mobile') delete next.contact;
      return next;
    });
  };

  const chooseCategory = (key) => {
    setValues((current) => (current.category === key ? current : { ...current, category: key, topic: '' }));
    setErrors((current) => {
      const next = { ...current };
      delete next.category;
      delete next.topic;
      return next;
    });
  };

  // A card click picks the category and carries the visitor to the form.
  const pickFromCard = (key) => {
    if (status === 'sent') { setStatus('idle'); setResult(null); }
    chooseCategory(key);
    scrollToForm('sp-topic');
  };

  // Deep links: /support?type=complaint (or #complaint) opens with that type.
  useEffect_sp(() => {
    try {
      const wanted = new URLSearchParams(window.location.search).get('type') || window.location.hash.slice(1);
      if (SUPPORT_CATEGORIES.some((c) => c.key === wanted)) {
        chooseCategory(wanted);
        setTimeout(() => scrollToForm(''), 60);
      }
    } catch (_) { /* no preselection */ }
  }, []);

  const removeFile = (id) => {
    setFiles((current) => {
      const gone = current.find((f) => f.id === id);
      if (gone && gone.preview) URL.revokeObjectURL(gone.preview);
      return current.filter((f) => f.id !== id);
    });
    setFileError('');
  };

  const addFiles = async (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length || preparing) return;
    setPreparing(true);
    setFileError('');
    const next = [...filesRef.current];
    const problems = [];
    for (const file of incoming) {
      const name = file.name || 'file';
      if (next.length >= SUPPORT_MAX_FILES) {
        problems.push(t(lang,
          `You can attach up to ${SUPPORT_MAX_FILES} files.`,
          `يمكنك إرفاق ${SUPPORT_MAX_FILES} ملفات كحد أقصى.`,
          `Puedes adjuntar hasta ${SUPPORT_MAX_FILES} archivos.`));
        break;
      }
      const kind = supportFileKind(file);
      if (!kind) {
        problems.push(t(lang,
          `“${name}” can’t be attached — please use photos (JPG, PNG, WebP) or PDF documents. Save Word or Excel files as PDF first.`,
          `لا يمكن إرفاق «${name}» — يرجى استخدام صور (JPG أو PNG أو WebP) أو مستندات PDF. احفظ ملفات Word أو Excel بصيغة PDF أولًا.`,
          `«${name}» no se puede adjuntar — usa fotos (JPG, PNG, WebP) o documentos PDF. Guarda los archivos de Word o Excel como PDF.`));
        continue;
      }
      if (!file.size) {
        problems.push(t(lang, `“${name}” is empty.`, `«${name}» ملف فارغ.`, `«${name}» está vacío.`));
        continue;
      }
      if (file.size > SUPPORT_MAX_SOURCE_BYTES) {
        problems.push(t(lang,
          `“${name}” is ${supportMb(file.size)} MB — too large to send.`,
          `حجم «${name}» ${supportMb(file.size)} ميجابايت — أكبر من المسموح.`,
          `«${name}» pesa ${supportMb(file.size)} MB — demasiado grande.`));
        continue;
      }
      let prepared;
      if (kind === 'image') {
        try { prepared = await supportPrepareImage(file); }
        catch (_) {
          problems.push(t(lang,
            `“${name}” couldn’t be read as a photo on this device. Please choose a JPG or PNG version.`,
            `تعذّرت قراءة «${name}» كصورة على هذا الجهاز. يرجى اختيار نسخة JPG أو PNG.`,
            `No se pudo leer «${name}» como foto en este dispositivo. Elige una versión JPG o PNG.`));
          continue;
        }
      } else {
        prepared = { blob: file, name, type: 'application/pdf' };
      }
      const used = next.reduce((sum, f) => sum + supportBase64Size(f.size), 0);
      if (used + supportBase64Size(prepared.blob.size) > SUPPORT_INLINE_BUDGET) {
        problems.push(t(lang,
          `“${name}” doesn’t fit — attachments can total about 3 MB. Remove a file, or email it to info@bcisaudi.com after you submit, quoting your ticket reference.`,
          `«${name}» لا يتسع — الحد الإجمالي للمرفقات نحو 3 ميجابايت. احذف ملفًا، أو أرسله إلى info@bcisaudi.com بعد الإرسال مع ذكر الرقم المرجعي.`,
          `«${name}» no cabe — los adjuntos pueden sumar unos 3 MB. Quita un archivo o envíalo a info@bcisaudi.com tras enviar, indicando tu referencia.`));
        continue;
      }
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: prepared.name, type: prepared.type, size: prepared.blob.size, blob: prepared.blob,
        preview: kind === 'image' ? URL.createObjectURL(prepared.blob) : '',
      });
    }
    setFiles(next);
    setFileError(problems.join(' '));
    setPreparing(false);
  };

  const resetAll = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
    setFileError('');
    setValues(SUPPORT_EMPTY);
    setErrors({});
    setBanner('');
    setResult(null);
    setStatus('idle');
    scrollToForm('sp-full_name');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending || preparing) return;
    const formElement = e.target;
    const found = supportValidate(values, lang);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus('error');
      setBanner(t(lang, 'Please check the highlighted fields.', 'يرجى مراجعة الحقول المحددة.', 'Revisa los campos marcados.'));
      const first = SUPPORT_ERROR_ORDER.find(([key]) => found[key]);
      if (first) {
        const target = document.getElementById(`sp-${first[1]}`);
        if (target) target.focus();
      }
      return;
    }

    setStatus('sending');
    setBanner('');
    try {
      const attachments = [];
      for (const f of files) attachments.push({ name: f.name, type: f.type, data: await supportBlobToBase64(f.blob) });
      const otherProduct = values.product_code === SUPPORT_OTHER_PRODUCT;
      // Only the fields this request type shows are sent — a value typed under
      // another type and then hidden must not ride along.
      const payload = await submitSupportRequest({
        category: values.category,
        topic: values.topic,
        full_name: values.full_name,
        company_name: values.company_name,
        email: values.email,
        mobile: values.mobile,
        subject: values.subject,
        description: values.description,
        product_code: fields.product && !otherProduct ? values.product_code : '',
        product_other: fields.product && otherProduct ? values.product_other : '',
        batch_no: fields.batch ? values.batch_no : '',
        invoice_no: fields.invoice ? values.invoice_no : '',
        project_name: fields.project ? values.project_name : '',
        project_location: fields.location ? values.project_location : '',
        incident_date: fields.date ? values.incident_date : '',
        attachments,
        // Honeypot: real visitors never fill it. The server drops the request.
        ...(new FormData(formElement).get('sp_hp_ref') ? { website_check: '1' } : {}),
        page_url: typeof window === 'undefined' ? '' : window.location.href,
        lang,
      });
      const topic = category && category.topics.find((tp) => tp.key === values.topic);
      setResult({
        ticket: payload.ticket || '',
        acknowledgement: Boolean(payload.acknowledgement),
        attachmentWarning: Boolean(payload.attachment_warning),
        email: values.email.trim(),
        firstName: values.full_name.trim().split(/\s+/)[0] || '',
        category: values.category,
        topic: values.topic,
        team: topic ? topic.team : 'service',
      });
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setFiles([]);
      setValues(SUPPORT_EMPTY);
      setStatus('sent');
      setTimeout(() => scrollToForm(''), 30);
    } catch (err) {
      setStatus('error');
      if (isLocalSupportPreviewHost()) {
        return setBanner(t(lang,
          'Local preview: the /api routes only run on Vercel, so nothing was sent. Everything else on this form works here.',
          'معاينة محلية: مسارات /api تعمل على Vercel فقط، لذلك لم يتم إرسال شيء. بقية النموذج تعمل هنا.',
          'Vista previa local: las rutas /api solo funcionan en Vercel, así que no se envió nada. El resto del formulario sí funciona aquí.'));
      }
      if (err && err.message === 'PAYLOAD_TOO_LARGE') {
        return setBanner(t(lang,
          'The attachments are too large to send together. Please remove one and try again — you can email it to info@bcisaudi.com afterwards.',
          'المرفقات كبيرة جدًا لإرسالها معًا. يرجى حذف أحدها والمحاولة مجددًا — يمكنك إرساله إلى info@bcisaudi.com لاحقًا.',
          'Los adjuntos son demasiado grandes para enviarlos juntos. Quita uno e inténtalo de nuevo; puedes enviarlo a info@bcisaudi.com después.'));
      }
      // A 400 carries the server's specific reason; anything else is generic.
      if (err && err.status === 400 && err.message) return setBanner(err.message);
      return setBanner(t(lang,
        'We couldn’t send your request just now. Nothing was saved — please try again in a moment, or call +966 59 312 0221 / email info@bcisaudi.com.',
        'تعذّر إرسال طلبك الآن ولم يُحفظ شيء — يرجى المحاولة بعد قليل، أو الاتصال على ‎+966 59 312 0221 أو مراسلة info@bcisaudi.com.',
        'No pudimos enviar tu solicitud ahora. No se guardó nada — inténtalo de nuevo en un momento, o llama al +966 59 312 0221 / escribe a info@bcisaudi.com.'));
    }
  };

  /* ---- field helpers ----
     `hint` names a rendered hint element (sp-<hint>-hint); `alsoError` ties a
     control to a shared error, e.g. "email or mobile" on both inputs. */
  const control = (name, { hint, alsoError, style } = {}) => {
    const invalid = Boolean(errors[name] || (alsoError && errors[alsoError]));
    const ids = [
      errors[name] ? `sp-${name}-error` : '',
      alsoError && errors[alsoError] ? `sp-${alsoError}-error` : '',
      hint ? `sp-${hint}-hint` : '',
    ].filter(Boolean).join(' ');
    return {
      id: `sp-${name}`,
      name,
      value: values[name],
      onChange: (e) => update(name, e.target.value),
      'aria-invalid': invalid ? 'true' : undefined,
      'aria-describedby': ids || undefined,
      style: { ...(style || {}), ...(invalid ? { borderColor: '#d92d20' } : {}) },
    };
  };
  const errorText = (name) => errors[name]
    ? <div id={`sp-${name}-error`} style={{ fontSize: 13, lineHeight: 1.5, color: '#b42318', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}><Icon name="alert-triangle" size={13} stroke="#b42318" /></span>{errors[name]}
      </div>
    : null;
  const hintText = (name, text) => <div id={`sp-${name}-hint`} style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--bci-steel)' }}>{text}</div>;
  const ltrInput = { direction: 'ltr', textAlign: isAr ? 'right' : 'left' };
  // The flex row sits inside the legend: Safari does not lay out a flex legend.
  const groupLabel = (num, text) => (
    <legend style={{ padding: 0, marginBottom: 18, width: '100%' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--bci-green-700)', letterSpacing: '0.12em' }}>{num}</span>
        <span className="eyebrow" style={{ color: 'var(--bci-navy)' }}>{text}</span>
        <span aria-hidden="true" style={{ flex: 1, height: 1, background: 'var(--bci-hairline-light)' }} />
      </span>
    </legend>
  );
  const fieldset = { border: 0, padding: 0, margin: 0, minWidth: 0 };
  const stack = { display: 'flex', flexDirection: 'column', gap: 18 };

  const descriptionPlaceholder = {
    complaint: t(lang,
      'What happened, where and when the product was applied, the site conditions, and what you have noticed.',
      'ماذا حدث، وأين ومتى طُبّق المنتج، وظروف الموقع، وما الذي لاحظته.',
      'Qué ocurrió, dónde y cuándo se aplicó el producto, las condiciones de obra y lo que has observado.'),
    technical: t(lang,
      'Describe the application, the substrate and site conditions, and what you need help with.',
      'صف التطبيق ونوع السطح وظروف الموقع، وما الذي تحتاج المساعدة فيه.',
      'Describe la aplicación, el soporte y las condiciones de obra, y en qué necesitas ayuda.'),
    order: t(lang,
      'What was ordered, what arrived (or did not), and when.',
      'ما الذي طُلب، وما الذي وصل (أو لم يصل)، ومتى.',
      'Qué se pidió, qué llegó (o no) y cuándo.'),
    feedback: t(lang,
      'Share your suggestion or feedback — what works well, and what we could do better.',
      'شاركنا اقتراحك أو ملاحظتك — ما الذي يعمل جيدًا، وما الذي يمكننا تحسينه.',
      'Comparte tu sugerencia o comentario — qué funciona bien y qué podríamos mejorar.'),
  }[values.category] || t(lang, 'Tell us how we can help.', 'أخبرنا كيف يمكننا مساعدتك.', 'Cuéntanos cómo podemos ayudarte.');

  const productField = fields.product && (
    <div className="field">
      <label htmlFor="sp-product_code">
        {fields.product === 'required' ? t(lang, 'BCI product *', 'منتج BCI *', 'Producto BCI *') : t(lang, 'BCI product', 'منتج BCI', 'Producto BCI')}
      </label>
      <select {...control('product_code')}>
        <option value="">{t(lang, 'Select a product', 'اختر منتجًا', 'Selecciona un producto')}</option>
        {SOLUTIONS.map((cat) => (
          <optgroup key={cat.slug} label={(cat[lang] || cat.en).name}>
            {(cat.products || []).map((p) => <option key={p.code} value={p.code}>{(p.en && p.en.name) || p.code}</option>)}
          </optgroup>
        ))}
        <option value={SUPPORT_OTHER_PRODUCT}>{t(lang, 'Other / not listed', 'أخرى / غير مدرج', 'Otro / no aparece')}</option>
      </select>
      {errorText('product_code')}
    </div>
  );

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Customer Care', 'خدمة العملاء', 'Atención al Cliente')}
        crumb={t(lang, 'Customer Care & Support', 'خدمة العملاء والدعم الفني', 'Atención al Cliente y Soporte')}
        title="We’re here to support you."
        titleAr="نحن هنا لدعمك."
        titleEs="Estamos aquí para apoyarte."
        subtitle={t(lang,
          'At BCI, your satisfaction and the performance of our solutions matter. Whether you need technical assistance, want to report a concern, or share feedback, our team is here to help.',
          'في BCI، يهمّنا رضاك وأداء حلولنا. سواء كنت بحاجة إلى مساعدة فنية، أو ترغب في الإبلاغ عن مشكلة، أو مشاركة ملاحظاتك، فريقنا هنا لمساعدتك.',
          'En BCI nos importan tu satisfacción y el desempeño de nuestras soluciones. Tanto si necesitas asistencia técnica como si quieres reportar una incidencia o compartir tu opinión, nuestro equipo está aquí para ayudarte.')}
      />

      <SupportCategoryCards selected={values.category || (result && result.category) || ''} onSelect={pickFromCard} />

      <section id="request" ref={sectionRef} style={{ background: 'var(--bci-paper)', padding: isMobile ? '72px 0' : '120px 0', scrollMarginTop: 72 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 340px) minmax(0, 1fr)', gap: isMobile ? 48 : 72, alignItems: 'start', direction: isAr ? 'rtl' : 'ltr' }}>
            {/* Stretched to the row's height so the rail inside has room to stick. */}
            <div style={{ order: isMobile ? 2 : 0, alignSelf: 'stretch' }}><SupportProcessRail /></div>

            <div style={{ minWidth: 0 }}>
              {status === 'sent' && result
                ? <SupportConfirmation result={result} onReset={resetAll} />
                : <form className="bci-form" noValidate onSubmit={submit}
                    style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: isPhone ? 22 : 40, display: 'flex', flexDirection: 'column', gap: 34, direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
                  <div>
                    <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 10 }}>{t(lang, 'Support request', 'طلب دعم', 'Solicitud de soporte')}</div>
                    <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(28px,2.8vw,38px)', lineHeight: 1.15, color: 'var(--bci-navy)', margin: '0 0 10px' }}>
                      {t(lang, 'Tell us how we can help', 'أخبرنا كيف يمكننا مساعدتك', 'Cuéntanos cómo podemos ayudarte')}
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-steel)', margin: 0 }}>
                      {t(lang,
                        'Your request goes straight into our support system. Fields marked * are required.',
                        'يصل طلبك مباشرة إلى نظام الدعم لدينا. الحقول المعلمة بـ * إلزامية.',
                        'Tu solicitud entra directamente en nuestro sistema de soporte. Los campos con * son obligatorios.')}
                    </p>
                  </div>

                  {/* 1 · Contact */}
                  <fieldset style={fieldset}>
                    {groupLabel('01', t(lang, 'Your details', 'بياناتك', 'Tus datos'))}
                    <div style={stack}>
                      <div className="form-grid-2">
                        <div className="field">
                          <label htmlFor="sp-full_name">{t(lang, 'Full name *', 'الاسم الكامل *', 'Nombre completo *')}</label>
                          <input {...control('full_name')} type="text" autoComplete="name" maxLength={140} />
                          {errorText('full_name')}
                        </div>
                        <div className="field">
                          <label htmlFor="sp-company_name">{t(lang, 'Company name', 'اسم الشركة', 'Empresa')}</label>
                          <input {...control('company_name')} type="text" autoComplete="organization" maxLength={140} />
                        </div>
                      </div>
                      <div className="form-grid-2">
                        <div className="field">
                          <label htmlFor="sp-email">{t(lang, 'Email address', 'البريد الإلكتروني', 'Correo electrónico')}</label>
                          <input {...control('email', { hint: errors.contact ? '' : 'contact', alsoError: 'contact', style: ltrInput })} type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" maxLength={180} />
                          {errorText('email')}
                        </div>
                        <div className="field">
                          <label htmlFor="sp-mobile">{t(lang, 'Mobile number', 'رقم الجوال', 'Móvil')}</label>
                          <input {...control('mobile', { hint: errors.contact ? '' : 'contact', alsoError: 'contact', style: ltrInput })} type="tel" inputMode="tel" autoComplete="tel" placeholder="+966 5X XXX XXXX" maxLength={40} />
                          {errorText('mobile')}
                        </div>
                      </div>
                      {errors.contact ? errorText('contact') : hintText('contact', t(lang,
                        'Email or mobile — at least one, so we can reach you.',
                        'البريد الإلكتروني أو الجوال — أحدهما على الأقل لنتمكن من التواصل معك.',
                        'Correo o móvil — al menos uno, para poder contactarte.'))}
                    </div>
                  </fieldset>

                  {/* 2 · Request */}
                  <fieldset style={fieldset}>
                    {groupLabel('02', t(lang, 'Your request', 'طلبك', 'Tu solicitud'))}
                    <div style={stack}>
                      <div className="form-grid-2">
                        <div className="field">
                          <label htmlFor="sp-category">{t(lang, 'Request category *', 'نوع الطلب *', 'Tipo de solicitud *')}</label>
                          <select {...control('category')} onChange={(e) => chooseCategory(e.target.value)}>
                            <option value="">{t(lang, 'Select a category', 'اختر نوع الطلب', 'Selecciona un tipo')}</option>
                            {SUPPORT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{(c[lang] || c.en).t}</option>)}
                          </select>
                          {errorText('category')}
                        </div>
                        <div className="field">
                          <label htmlFor="sp-topic">{t(lang, 'What is it about? *', 'ما موضوع الطلب؟ *', '¿De qué se trata? *')}</label>
                          <select {...control('topic')} disabled={!category}>
                            <option value="">{category ? t(lang, 'Select one', 'اختر', 'Selecciona') : t(lang, 'Choose a category first', 'اختر نوع الطلب أولًا', 'Elige primero el tipo')}</option>
                            {(category ? category.topics : []).map((tp) => <option key={tp.key} value={tp.key}>{tp[lang] || tp.en}</option>)}
                          </select>
                          {errorText('topic')}
                        </div>
                      </div>

                      {fields.evidence && values.category === 'complaint' &&
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', borderInlineStart: '3px solid var(--bci-green-500)', padding: '16px 18px' }}>
                          <span style={{ flexShrink: 0, marginTop: 2 }}><Icon name="shield-check" size={20} stroke="var(--bci-green-700)" /></span>
                          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--bci-navy)' }}>
                            <strong style={{ display: 'block', marginBottom: 4 }}>{t(lang, 'Help us investigate faster', 'ساعدنا على سرعة التحقق', 'Ayúdanos a investigar más rápido')}</strong>
                            {t(lang,
                              'Quality Control traces every complaint to its production batch. Please include the product, the batch / lot number from the label, and clear photos of the material and its packaging.',
                              'يتتبّع فريق مراقبة الجودة كل شكوى حتى تشغيلة الإنتاج. يرجى ذكر المنتج، ورقم التشغيلة / الدفعة من الملصق، وإرفاق صور واضحة للمادة وعبوتها.',
                              'Control de Calidad rastrea cada queja hasta su lote de producción. Indica el producto, el número de lote de la etiqueta y adjunta fotos claras del material y su envase.')}
                          </div>
                        </div>}

                      {(fields.product || fields.batch) &&
                        <div className="form-grid-2">
                          {productField}
                          {fields.batch &&
                            <div className="field">
                              <label htmlFor="sp-batch_no">{t(lang, 'Batch / lot number', 'رقم التشغيلة / الدفعة', 'Número de lote')}</label>
                              <input {...control('batch_no', { hint: 'batch_no', style: ltrInput })} type="text" maxLength={140} />
                              {hintText('batch_no', t(lang,
                                'Printed on the bag, pail or drum label, usually next to the production date.',
                                'مطبوع على ملصق الكيس أو الجالون أو البرميل، غالبًا بجانب تاريخ الإنتاج.',
                                'Impreso en la etiqueta del saco, cubo o bidón, junto a la fecha de fabricación.'))}
                            </div>}
                        </div>}
                      {fields.product && values.product_code === SUPPORT_OTHER_PRODUCT &&
                        <div className="field">
                          <label htmlFor="sp-product_other">{t(lang, 'Product name *', 'اسم المنتج *', 'Nombre del producto *')}</label>
                          <input {...control('product_other')} type="text" maxLength={140} />
                          {errorText('product_other')}
                        </div>}

                      {(fields.invoice || fields.date) &&
                        <div className="form-grid-2">
                          {fields.invoice &&
                            <div className="field">
                              <label htmlFor="sp-invoice_no">
                                {fields.invoice === 'required'
                                  ? t(lang, 'Invoice, delivery note or PO no. *', 'رقم الفاتورة أو إشعار التسليم أو أمر الشراء *', 'Nº de factura, albarán u orden de compra *')
                                  : t(lang, 'Invoice or PO number', 'رقم الفاتورة أو أمر الشراء', 'Nº de factura u orden de compra')}
                              </label>
                              <input {...control('invoice_no', { style: ltrInput })} type="text" maxLength={140} />
                              {errorText('invoice_no')}
                            </div>}
                          {fields.date &&
                            <div className="field">
                              <label htmlFor="sp-incident_date">
                                {values.category === 'order'
                                  ? t(lang, 'Delivery date', 'تاريخ التسليم', 'Fecha de entrega')
                                  : t(lang, 'Purchase or delivery date', 'تاريخ الشراء أو التسليم', 'Fecha de compra o entrega')}
                              </label>
                              <input {...control('incident_date')} type="date" max={supportToday()} />
                              {errorText('incident_date')}
                            </div>}
                        </div>}

                      {(fields.project || fields.location) &&
                        <div className="form-grid-2">
                          {fields.project &&
                            <div className="field">
                              <label htmlFor="sp-project_name">{t(lang, 'Project name', 'اسم المشروع', 'Nombre del proyecto')}</label>
                              <input {...control('project_name')} type="text" maxLength={140} />
                            </div>}
                          {fields.location &&
                            <div className="field">
                              <label htmlFor="sp-project_location">
                                {values.category === 'order'
                                  ? t(lang, 'Delivery location', 'موقع التسليم', 'Lugar de entrega')
                                  : t(lang, 'Project city / location', 'مدينة / موقع المشروع', 'Ciudad / ubicación del proyecto')}
                              </label>
                              <input {...control('project_location')} type="text" autoComplete="address-level2" maxLength={140} />
                            </div>}
                        </div>}

                      <div className="field">
                        <label htmlFor="sp-subject">{t(lang, 'Subject', 'العنوان', 'Asunto')}</label>
                        <input {...control('subject')} type="text" maxLength={140} placeholder={t(lang,
                          'A short summary, e.g. Surface cracking after 48 hours',
                          'ملخص قصير، مثل: تشققات سطحية بعد 48 ساعة',
                          'Un resumen breve, p. ej. Fisuras superficiales a las 48 horas')} />
                      </div>
                      <div className="field">
                        <label htmlFor="sp-description">{t(lang, 'Description *', 'الوصف *', 'Descripción *')}</label>
                        <textarea {...control('description', { hint: 'description' })} rows={6} maxLength={SUPPORT_MAX_DESCRIPTION} placeholder={descriptionPlaceholder} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ flex: 1 }}>{errorText('description')}</div>
                          <div id="sp-description-hint" dir="ltr" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--bci-steel)', flexShrink: 0 }}>
                            {values.description.length} / {SUPPORT_MAX_DESCRIPTION}
                          </div>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* 3 · Attachments */}
                  <fieldset style={fieldset}>
                    {groupLabel('03', fields.evidence
                      ? t(lang, 'Photo evidence & documents', 'الصور والمستندات', 'Fotos y documentos')
                      : t(lang, 'Attachments (optional)', 'المرفقات (اختياري)', 'Adjuntos (opcional)'))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <label htmlFor="sp-files"
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16, cursor: preparing ? 'wait' : 'pointer',
                          border: `1px dashed ${dragging || dropFocus ? 'var(--bci-green-500)' : 'var(--bci-navy-200)'}`,
                          background: dragging ? 'var(--bci-green-50)' : 'var(--bci-paper)',
                          outline: dropFocus ? '2px solid var(--bci-navy)' : 'none', outlineOffset: 2,
                          padding: isPhone ? '18px 16px' : '22px 24px', transition: 'background-color 120ms linear, border-color 120ms linear',
                        }}>
                        <span style={{ width: 44, height: 44, background: '#fff', border: '1px solid var(--bci-hairline-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={preparing ? 'clock' : 'upload'} size={20} stroke="var(--bci-green-600)" />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--bci-navy)', marginBottom: 2 }}>
                            {preparing
                              ? t(lang, 'Preparing files…', 'جارٍ تجهيز الملفات…', 'Preparando archivos…')
                              : files.length >= SUPPORT_MAX_FILES
                                ? t(lang, `${SUPPORT_MAX_FILES} files attached — remove one to add another`, `تم إرفاق ${SUPPORT_MAX_FILES} ملفات — احذف ملفًا لإضافة آخر`, `${SUPPORT_MAX_FILES} archivos adjuntos — quita uno para añadir otro`)
                              : isPhone
                                ? t(lang, 'Add photos or PDFs', 'أضف صورًا أو ملفات PDF', 'Añadir fotos o PDF')
                                : t(lang, 'Drag photos or PDFs here, or browse', 'اسحب الصور أو ملفات PDF هنا، أو اختر من جهازك', 'Arrastra fotos o PDF aquí, o explora')}
                          </span>
                          <span id="sp-files-hint" style={{ display: 'block', fontSize: 12, lineHeight: 1.5, color: 'var(--bci-steel)' }}>
                            {t(lang,
                              `Up to ${SUPPORT_MAX_FILES} files · JPG, PNG, WebP or PDF · about 3 MB in total. Photos are resized automatically.`,
                              `حتى ${SUPPORT_MAX_FILES} ملفات · JPG أو PNG أو WebP أو PDF · نحو 3 ميجابايت إجمالًا. يُعاد تحجيم الصور تلقائيًا.`,
                              `Hasta ${SUPPORT_MAX_FILES} archivos · JPG, PNG, WebP o PDF · unos 3 MB en total. Las fotos se redimensionan automáticamente.`)}
                          </span>
                        </span>
                        <input id="sp-files" type="file" multiple accept={SUPPORT_ACCEPT} disabled={preparing || files.length >= SUPPORT_MAX_FILES}
                          aria-describedby={['sp-files-hint', fileError ? 'sp-files-error' : ''].filter(Boolean).join(' ')}
                          onFocus={() => setDropFocus(true)} onBlur={() => setDropFocus(false)}
                          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                          style={{ position: 'absolute', width: 1, height: 1, margin: -1, border: 0, padding: 0, opacity: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />
                      </label>
                      {fileError &&
                        <div id="sp-files-error" role="alert" style={{ fontSize: 13, lineHeight: 1.5, color: '#b42318' }}>{fileError}</div>}
                      {files.length > 0 &&
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {files.map((f) => (
                            <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--bci-hairline-light)', background: '#fff', padding: '8px 10px' }}>
                              {f.preview
                                ? <img src={f.preview} alt="" width="44" height="44" style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0, background: 'var(--bci-concrete)' }} />
                                : <span style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bci-concrete)', flexShrink: 0 }}><Icon name="file-text" size={20} stroke="var(--bci-navy)" /></span>}
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <span dir="ltr" style={{ display: 'block', fontSize: 14, color: 'var(--bci-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: isAr ? 'right' : 'left' }}>{f.name}</span>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--bci-steel)' }}>{supportMb(f.size)} MB</span>
                              </span>
                              <button type="button" onClick={() => removeFile(f.id)} aria-label={t(lang, `Remove ${f.name}`, `إزالة ${f.name}`, `Quitar ${f.name}`)}
                                style={{ width: 36, height: 36, border: '1px solid var(--bci-hairline-light)', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <Icon name="x" size={16} stroke="var(--bci-steel)" />
                              </button>
                            </li>
                          ))}
                        </ul>}
                    </div>
                  </fieldset>

                  {/* Honeypot — hidden from real users, bots fill it and get silently dropped.
                     Clip-hidden (no offscreen offset: negative `left` stretches RTL pages). The
                     name is deliberately meaningless so browser autofill never matches it. */}
                  <input name="sp_hp_ref" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                    style={{ position: 'absolute', width: 1, height: 1, margin: -1, border: 0, padding: 0, opacity: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {status === 'error' && banner &&
                      <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55, color: '#b42318', background: '#fef3f2', border: '1px solid #fda29b', borderRadius: 2, padding: '12px 14px' }}>
                        <span style={{ flexShrink: 0, marginTop: 2 }}><Icon name="alert-triangle" size={16} stroke="#b42318" /></span>
                        <span>{banner}</span>
                      </div>}
                    <button type="submit" disabled={sending || preparing} className="btn btn-accent"
                      style={{ width: '100%', justifyContent: 'center', padding: '17px 16px', opacity: sending || preparing ? 0.7 : 1, cursor: sending ? 'wait' : 'pointer' }}>
                      {sending
                        ? t(lang, 'Sending your request…', 'جارٍ إرسال طلبك…', 'Enviando tu solicitud…')
                        : <>{t(lang, 'Submit request', 'إرسال الطلب', 'Enviar solicitud')} <Arrow size={14} /></>}
                    </button>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, lineHeight: 1.5, color: 'var(--bci-steel)' }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="shield-check" size={14} stroke="var(--bci-steel)" /></span>
                      {t(lang,
                        'Your details are used only to handle this request and are never shared outside BCI.',
                        'تُستخدم بياناتك فقط لمعالجة هذا الطلب ولا تُشارك خارج BCI.',
                        'Tus datos se usan solo para gestionar esta solicitud y nunca se comparten fuera de BCI.')}
                    </div>
                  </div>
                </form>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="" />
    <SupportPage />
    <Footer />
  </LangProvider>
);
