/* global React, SOLUTIONS, useLang, useViewport, t, Icon, Arrow, loadErpRfqItems,
   submitSampleRequest, thankYouHref */
const {
  useEffect: useEffect_smp,
  useId: useId_smp,
  useMemo: useMemo_smp,
  useState: useState_smp,
} = React;

// Mirrors MAX_ROWS / MAX_SAMPLE_QTY in api/sample-request.js — the server
// enforces both again, this only keeps the visitor from filling in a form that
// is going to be rejected.
const MAX_SAMPLE_ROWS = 10;
const MAX_SAMPLE_QTY = 100;

function emptySampleRow() {
  return { item_code: '', qty: '1' };
}

function sampleRequestedProduct() {
  try { return new URLSearchParams(window.location.search).get('product') || ''; }
  catch (_) { return ''; }
}

function sampleCatalogFallback() {
  return SOLUTIONS.flatMap((solution) => solution.products.map((product) => ({
    code: product.code,
    name: product.en?.name || product.code,
    category: solution.en.name,
  })));
}

function sampleLocalPreview() {
  try { return ['127.0.0.1', 'localhost'].includes(window.location.hostname); }
  catch (_) { return false; }
}

// `min` on the date input, so the picker itself refuses a past date.
function sampleTodayValue() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  return parts;
}

function SampleRequestForm({ source = 'website', maxWidth }) {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const isAr = lang === 'ar';
  const listId = `sample-products-${useId_smp().replace(/:/g, '')}`;
  const requestedProduct = useMemo_smp(sampleRequestedProduct, []);
  const today = useMemo_smp(sampleTodayValue, []);
  const [form, setForm] = useState_smp({
    contact_person: '',
    company_name: '',
    email: '',
    phone_no: '',
    project_name: '',
    delivery_location: '',
    required_date: '',
    application: '',
    other_details: '',
  });
  const [rows, setRows] = useState_smp([emptySampleRow()]);
  const [catalog, setCatalog] = useState_smp([]);
  const [catalogStatus, setCatalogStatus] = useState_smp('loading');
  const [status, setStatus] = useState_smp('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState_smp('');
  const [requestId, setRequestId] = useState_smp('');

  const fetchCatalog = () => {
    setCatalogStatus('loading');
    return loadErpRfqItems()
      .then((items) => {
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => {
        if (sampleLocalPreview()) {
          setCatalog(sampleCatalogFallback());
          setCatalogStatus('preview');
        } else {
          setCatalogStatus('error');
        }
      });
  };

  useEffect_smp(() => {
    let active = true;
    loadErpRfqItems()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => {
        if (!active) return;
        if (sampleLocalPreview()) {
          setCatalog(sampleCatalogFallback());
          setCatalogStatus('preview');
        } else {
          setCatalogStatus('error');
        }
      });
    return () => { active = false; };
  }, []);

  const catalogByCode = useMemo_smp(
    () => new Map(catalog.map((item) => [item.code, item])),
    [catalog],
  );
  const catalogReady = catalogStatus === 'loaded' || catalogStatus === 'preview';

  // A product page links here with ?product=<code>; fill the first row in once
  // the live catalogue confirms the code still exists.
  useEffect_smp(() => {
    if (!requestedProduct || rows[0].item_code || !catalogByCode.size) return;
    if (catalogByCode.has(requestedProduct)) {
      setRows((current) => current.map((row, index) => (
        index === 0 ? { ...row, item_code: requestedProduct } : row
      )));
    }
  }, [requestedProduct, catalogByCode]);

  const changeForm = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const changeRow = (index, key, value) => {
    setRows(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };
  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const showError = (message) => {
    setErrorMsg(message);
    setStatus('error');
  };

  const resetForm = () => {
    setForm({
      contact_person: '', company_name: '', email: '', phone_no: '',
      project_name: '', delivery_location: '', required_date: '',
      application: '', other_details: '',
    });
    setRows([emptySampleRow()]);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    if (!form.contact_person.trim() || !form.company_name.trim()) {
      return showError(t(lang,
        'Please enter the contact person and company name.',
        'يرجى إدخال اسم مسؤول التواصل واسم الشركة.',
        'Indica la persona de contacto y el nombre de la empresa.'));
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return showError(t(lang,
        'Please enter a valid email address so we can confirm the sample.',
        'يرجى إدخال بريد إلكتروني صحيح لتأكيد طلب العينة.',
        'Introduce un correo electrónico válido para confirmar la muestra.'));
    }
    if (!form.phone_no.trim()) {
      return showError(t(lang,
        'Please enter a phone number — samples are delivered by hand.',
        'يرجى إدخال رقم هاتف — يتم تسليم العينات باليد.',
        'Indica un teléfono: las muestras se entregan en mano.'));
    }
    if (!form.delivery_location.trim()) {
      return showError(t(lang,
        'Please enter where the samples should be delivered.',
        'يرجى إدخال المكان الذي سيتم تسليم العينات إليه.',
        'Indica dónde deben entregarse las muestras.'));
    }
    if (!catalogReady) {
      return showError(t(lang,
        'The product list is still loading. Please try again in a moment.',
        'لا تزال قائمة المنتجات قيد التحميل. يرجى المحاولة بعد لحظات.',
        'La lista de productos aún se está cargando. Inténtalo en un momento.'));
    }
    if (rows.some((row) => !catalogByCode.has(row.item_code))) {
      return showError(t(lang,
        'Please choose every sample product from the list.',
        'يرجى اختيار كل منتج من قائمة المنتجات.',
        'Elige cada producto de muestra de la lista.'));
    }
    if (rows.some((row) => !(Number(row.qty) > 0) || Number(row.qty) > MAX_SAMPLE_QTY)) {
      return showError(t(lang,
        `Every sample needs a quantity between 1 and ${MAX_SAMPLE_QTY}.`,
        `يجب أن تكون كمية كل عينة بين 1 و ${MAX_SAMPLE_QTY}.`,
        `Cada muestra necesita una cantidad entre 1 y ${MAX_SAMPLE_QTY}.`));
    }
    const codes = rows.map((row) => row.item_code);
    if (new Set(codes).size !== codes.length) {
      return showError(t(lang,
        'Please combine duplicate products into one row.',
        'يرجى دمج المنتجات المكررة في صف واحد.',
        'Combina los productos duplicados en una sola fila.'));
    }

    setStatus('sending');
    setErrorMsg('');
    setRequestId('');
    try {
      const pageUrl = typeof window === 'undefined' ? '' : window.location.href;
      const payload = await submitSampleRequest({
        ...form,
        items: rows.map((row) => ({ item_code: row.item_code, qty: Number(row.qty) })),
        source: requestedProduct ? `${source}; requested product: ${requestedProduct}` : source,
        page_url: pageUrl,
        lang,
      });
      if (!payload.request_id) throw new Error('ERP did not return a sample request ID');
      setRequestId(payload.request_id);
      setStatus('sent');
      // The confirmation lives on its own page; the block below only shows if
      // the browser has not navigated yet.
      window.location.assign(thankYouHref({ type: 'sample', ref: payload.request_id }));
    } catch (error) {
      showError(t(lang,
        'We could not register the sample request in ERP. Please review the fields and try again, or contact info@bcisaudi.com.',
        'تعذر تسجيل طلب العينات في النظام. يرجى مراجعة البيانات والمحاولة مرة أخرى أو التواصل عبر info@bcisaudi.com.',
        'No pudimos registrar la solicitud de muestras en el ERP. Revisa los datos e inténtalo de nuevo o escribe a info@bcisaudi.com.'));
    }
  };

  const sent = status === 'sent';
  const sectionLabel = (text) => (
    <div className="eyebrow" style={{ color: 'var(--bci-green-700)', borderBottom: '1px solid var(--bci-hairline-light)', paddingBottom: 9 }}>
      {text}
    </div>
  );

  return (
    <form id="sample-form" className="bci-form" onSubmit={submitRequest} style={{
      background: '#fff',
      border: '1px solid var(--bci-hairline-light)',
      borderRadius: 2,
      padding: isPhone ? 22 : 36,
      display: 'flex', flexDirection: 'column', gap: 22,
      direction: isAr ? 'rtl' : 'ltr',
      textAlign: isAr ? 'right' : 'left',
      maxWidth: maxWidth || 'none', margin: maxWidth ? '0 auto' : 0, scrollMarginTop: 84,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
        <div>
          <h3 style={{
            fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)',
            fontWeight: 600, fontSize: 28, color: 'var(--bci-navy)', margin: '0 0 6px',
          }}>
            {t(lang, 'Request a sample', 'اطلب عينة', 'Solicitar una muestra')}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--bci-steel)', lineHeight: 1.5 }}>
            {t(lang,
              'Tell us which products you want to trial and where to deliver them. Samples ship with the matching technical data sheets.',
              'أخبرنا بالمنتجات التي ترغب في تجربتها ومكان تسليمها. تُرسل العينات مع النشرات الفنية الخاصة بها.',
              'Dinos qué productos quieres probar y dónde entregarlos. Las muestras se envían con sus fichas técnicas.')}
          </div>
        </div>
        <span className="eyebrow" style={{ color: 'var(--bci-steel)', whiteSpace: 'nowrap', marginTop: 8 }}>
          {t(lang, 'Sales team', 'فريق المبيعات', 'Equipo comercial')}
        </span>
      </div>

      {sectionLabel(t(lang, 'Who should we contact?', 'مع من نتواصل؟', '¿Con quién contactamos?'))}
      <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Contact person', 'اسم مسؤول التواصل', 'Persona de contacto')}</label>
          <input type="text" autoComplete="name" value={form.contact_person} onChange={changeForm('contact_person')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Company', 'الشركة', 'Empresa')}</label>
          <input type="text" autoComplete="organization" value={form.company_name} onChange={changeForm('company_name')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Email', 'البريد الإلكتروني', 'Correo')}</label>
          <input type="email" autoComplete="email" value={form.email} onChange={changeForm('email')} placeholder="name@company.com" />
        </div>
        <div className="field">
          <label>{t(lang, 'Phone', 'الهاتف', 'Teléfono')}</label>
          <input type="tel" autoComplete="tel" value={form.phone_no} onChange={changeForm('phone_no')} placeholder="+966" />
        </div>
      </div>

      {sectionLabel(t(lang, 'Which samples?', 'أي عينات؟', '¿Qué muestras?'))}
      {catalogStatus === 'error' && (
        <div role="alert" style={{ fontSize: 13, color: '#b42318', background: '#fef3f2', border: '1px solid #fda29b', padding: '12px 14px' }}>
          {t(lang,
            'The live ERP product list could not be loaded.',
            'تعذر تحميل قائمة المنتجات من النظام.',
            'No se pudo cargar la lista de productos del ERP.')}{' '}
          <button type="button" onClick={fetchCatalog} style={{ border: 0, padding: 0, background: 'transparent', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
            {t(lang, 'Retry', 'إعادة المحاولة', 'Reintentar')}
          </button>
        </div>
      )}
      {catalogStatus === 'preview' && (
        <div role="status" style={{ fontSize: 12, color: 'var(--bci-navy)', background: '#eef6fa', border: '1px solid var(--bci-navy-100)', padding: '10px 12px' }}>
          {t(lang,
            'Local preview: showing the website catalogue. The deployed page loads live product data from ERP.',
            'معاينة محلية: يتم عرض كتالوج الموقع. الصفحة المنشورة تحمّل بيانات المنتجات مباشرة من النظام.',
            'Vista local: se muestra el catálogo del sitio. La página publicada carga los productos directamente del ERP.')}
        </div>
      )}
      <datalist id={listId}>
        {catalog.map((item) => (
          <option key={item.code} value={item.code}>{item.name}</option>
        ))}
      </datalist>
      {rows.map((row, index) => (
        <div key={index} style={{ border: '1px solid var(--bci-hairline-light)', background: 'var(--bci-paper)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <strong style={{ color: 'var(--bci-navy)', fontSize: 14 }}>
              {t(lang, 'Sample', 'العينة', 'Muestra')} {index + 1}
            </strong>
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(index)} style={{ border: 0, background: 'transparent', color: '#b42318', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                {t(lang, 'Remove', 'حذف', 'Eliminar')}
              </button>
            )}
          </div>
          <div className="field">
            <label>{t(lang, 'Product name / SKU', 'اسم المنتج / رمز الصنف', 'Producto / SKU')}</label>
            <input list={listId} value={row.item_code} disabled={!catalogReady}
              onChange={(event) => changeRow(index, 'item_code', event.target.value)}
              placeholder={catalogStatus === 'loading'
                ? t(lang, 'Loading products…', 'جارٍ تحميل المنتجات…', 'Cargando productos…')
                : t(lang, 'Search by product name or code…', 'ابحث باسم المنتج أو الرمز…', 'Busca por nombre o código…')} />
          </div>
          <div className="field">
            <label>{t(lang, 'How many sample units?', 'كم عدد وحدات العينة؟', '¿Cuántas unidades de muestra?')}</label>
            <input type="number" min="1" max={MAX_SAMPLE_QTY} step="1" inputMode="numeric" value={row.qty}
              onChange={(event) => changeRow(index, 'qty', event.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-ghost-navy" disabled={rows.length >= MAX_SAMPLE_ROWS}
        onClick={() => setRows([...rows, emptySampleRow()])}
        style={{ alignSelf: isAr ? 'flex-end' : 'flex-start', opacity: rows.length >= MAX_SAMPLE_ROWS ? 0.5 : 1 }}>
        {t(lang, 'Add another sample', 'إضافة عينة أخرى', 'Añadir otra muestra')}
      </button>

      {sectionLabel(t(lang, 'Where and when', 'أين ومتى', 'Dónde y cuándo'))}
      <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Project name (optional)', 'اسم المشروع (اختياري)', 'Nombre del proyecto (opcional)')}</label>
          <input type="text" value={form.project_name} onChange={changeForm('project_name')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Delivery location', 'موقع التسليم', 'Lugar de entrega')}</label>
          <input type="text" value={form.delivery_location} onChange={changeForm('delivery_location')}
            placeholder={t(lang, 'City / site address', 'المدينة / عنوان الموقع', 'Ciudad / dirección de obra')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Needed by (optional)', 'مطلوبة بحلول (اختياري)', 'Necesarias para (opcional)')}</label>
          <input type="date" min={today} value={form.required_date} onChange={changeForm('required_date')} />
        </div>
      </div>
      <div className="field">
        <label>{t(lang, 'What will you use it for? (optional)', 'ما الغرض من الاستخدام؟ (اختياري)', '¿Para qué lo usarás? (opcional)')}</label>
        <textarea value={form.application} onChange={changeForm('application')}
          placeholder={t(lang,
            'Substrate, area, site conditions, the problem you are solving…',
            'نوع السطح، المساحة، ظروف الموقع، المشكلة المراد حلها…',
            'Soporte, superficie, condiciones de obra, el problema a resolver…')} />
      </div>
      <div className="field">
        <label>{t(lang, 'Other details (optional)', 'تفاصيل أخرى (اختياري)', 'Otros datos (opcional)')}</label>
        <textarea value={form.other_details} onChange={changeForm('other_details')}
          placeholder={t(lang,
            'Consultant, main contractor, preferred delivery time…',
            'الاستشاري، المقاول الرئيسي، وقت التسليم المفضل…',
            'Consultor, contratista principal, horario de entrega preferido…')} />
      </div>

      {!sent && (
        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', paddingTop: 4 }}>
          <button type="submit" disabled={status === 'sending' || !catalogReady} className="btn btn-accent"
            style={{ minWidth: isPhone ? 0 : 240, justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}>
            {status === 'sending'
              ? t(lang, 'Registering request…', 'جارٍ تسجيل الطلب…', 'Registrando solicitud…')
              : <>{t(lang, 'Send sample request', 'إرسال طلب العينات', 'Enviar solicitud')} <Arrow size={14} /></>}
          </button>
        </div>
      )}

      {sent && (
        <div role="status" style={{ fontSize: 13, color: 'var(--bci-green-800)', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', padding: '12px 14px' }}>
          <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginInlineEnd: 8 }}>
            <Icon name="check" size={14} stroke="var(--bci-green-700)" />
          </span>
          {t(lang,
            `Thank you. Your sample request${requestId ? ` ${requestId}` : ''} is registered with our sales team.`,
            `شكرًا لك. تم تسجيل طلب العينات${requestId ? ` ${requestId}` : ''} لدى فريق المبيعات.`,
            `Gracias. Tu solicitud de muestras${requestId ? ` ${requestId}` : ''} está registrada con nuestro equipo comercial.`)}
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => { resetForm(); setRequestId(''); setStatus('idle'); }}
              style={{ border: 0, background: 'transparent', color: 'inherit', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>
              {t(lang, 'Start another request', 'بدء طلب جديد', 'Iniciar otra solicitud')}
            </button>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" style={{ fontSize: 13, color: '#b42318', background: '#fef3f2', border: '1px solid #fda29b', padding: '12px 14px' }}>
          {errorMsg}
        </div>
      )}
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bci-steel)', textAlign: 'center' }}>
        {t(lang,
          'Sample request · handled by BCI sales',
          'طلب عينات · يتولاه فريق مبيعات BCI',
          'Solicitud de muestras · gestionada por ventas de BCI')}
      </div>
    </form>
  );
}

if (typeof window !== 'undefined') window.SampleRequestForm = SampleRequestForm;
