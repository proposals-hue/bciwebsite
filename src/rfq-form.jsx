/* global React, SOLUTIONS, useLang, useViewport, t, Icon, Arrow, loadErpRfqItems,
   submitCustomerRfq, thankYouHref */
const {
  useEffect: useEffect_rfq,
  useId: useId_rfq,
  useMemo: useMemo_rfq,
  useState: useState_rfq,
} = React;

const MAX_RFQ_ATTACHMENT_BYTES = 5 * 1024 * 1024;

function emptyRfqItem() {
  return { item_code: '', qty: '1', uom: '', description: '' };
}

function riyadhDateInputValue() {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  } catch (_) {
    return new Date().toISOString().slice(0, 10);
  }
}

function requestedProductName() {
  try { return new URLSearchParams(window.location.search).get('product') || ''; }
  catch (_) { return ''; }
}

function rfqFileContentType(file) {
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

function localizedCategory(category, lang) {
  const match = SOLUTIONS.find((solution) => solution.en && solution.en.name === category);
  return match ? (match[lang] || match.en).name : category;
}

function websiteCatalogItems() {
  return SOLUTIONS.flatMap((solution) => solution.products.map((product) => ({
    code: product.code,
    name: product.en?.name || product.code,
    uom: '',
    category: solution.en.name,
  })));
}

function websiteProductCopy(item, lang) {
  for (const solution of SOLUTIONS) {
    const product = solution.products.find((candidate) => candidate.code === item.code
      || candidate.en?.name === item.name);
    if (product) return product[lang] || product.en;
  }
  return null;
}

function isLocalPreview() {
  try { return ['127.0.0.1', 'localhost'].includes(window.location.hostname); }
  catch (_) { return false; }
}

function CustomerRfqForm({ source = 'website', maxWidth }) {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const isAr = lang === 'ar';
  const listId = `rfq-products-${useId_rfq().replace(/:/g, '')}`;
  const requestedProduct = useMemo_rfq(requestedProductName, []);
  const [form, setForm] = useState_rfq({
    contact_person: '',
    customer_name: '',
    cr_number: '',
    vat_number: '',
    transaction_date: riyadhDateInputValue(),
    email: '',
    phone_no: '',
    project_name: '',
    delivery_location: '',
    required_date: '',
    remarks: '',
  });
  const [step, setStep] = useState_rfq(1);
  const [files, setFiles] = useState_rfq({ logo: '', cr: '' });
  const [selectedCategory, setSelectedCategory] = useState_rfq('');
  const [browseQuery, setBrowseQuery] = useState_rfq('');
  const [showDirectSearch, setShowDirectSearch] = useState_rfq(Boolean(requestedProduct));
  const [rows, setRows] = useState_rfq([emptyRfqItem()]);
  const [catalog, setCatalog] = useState_rfq([]);
  const [catalogStatus, setCatalogStatus] = useState_rfq('loading');
  const [status, setStatus] = useState_rfq('idle'); // idle | sending | sent | sent-warning | error
  const [errorMsg, setErrorMsg] = useState_rfq('');
  const [rfqId, setRfqId] = useState_rfq('');
  const [uploadProgress, setUploadProgress] = useState_rfq(0);

  const fetchCatalog = () => {
    setCatalogStatus('loading');
    loadErpRfqItems()
      .then((items) => {
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => {
        if (isLocalPreview()) {
          setCatalog(websiteCatalogItems());
          setCatalogStatus('preview');
        } else {
          setCatalogStatus('error');
        }
      });
  };

  useEffect_rfq(() => {
    let active = true;
    loadErpRfqItems()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => {
        if (!active) return;
        if (isLocalPreview()) {
          setCatalog(websiteCatalogItems());
          setCatalogStatus('preview');
        } else {
          setCatalogStatus('error');
        }
      });
    return () => { active = false; };
  }, []);

  const catalogByCode = useMemo_rfq(
    () => new Map(catalog.map((item) => [item.code, item])),
    [catalog],
  );
  const groupedCatalog = useMemo_rfq(() => {
    const groups = new Map();
    catalog.forEach((item) => {
      const key = item.category || 'BCI Products';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()];
  }, [catalog]);
  const catalogReady = catalogStatus === 'loaded' || catalogStatus === 'preview';
  const browsedProducts = useMemo_rfq(() => {
    if (!selectedCategory) return [];
    const query = browseQuery.trim().toLowerCase();
    return catalog.filter((item) => item.category === selectedCategory).filter((item) => {
      if (!query) return true;
      const copy = websiteProductCopy(item, lang);
      return `${item.code} ${item.name} ${copy?.desc || ''}`.toLowerCase().includes(query);
    });
  }, [catalog, selectedCategory, browseQuery, lang]);

  const changeForm = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const changeRow = (index, key, value) => {
    setRows(rows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      if (key === 'item_code') {
        const selected = catalogByCode.get(value);
        return { ...row, item_code: value, uom: selected ? selected.uom : '' };
      }
      return { ...row, [key]: value };
    }));
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const selectProduct = (item) => {
    if (rows.some((row) => row.item_code === item.code)) return;
    const emptyIndex = rows.findIndex((row) => !row.item_code);
    if (emptyIndex >= 0) {
      setRows(rows.map((row, index) => index === emptyIndex
        ? { ...row, item_code: item.code, uom: item.uom || '' }
        : row));
    } else if (rows.length < 20) {
      setRows([...rows, { ...emptyRfqItem(), item_code: item.code, uom: item.uom || '' }]);
    }
  };

  const resetForm = (formElement) => {
    setForm({
      contact_person: '', customer_name: '', cr_number: '', vat_number: '',
      transaction_date: riyadhDateInputValue(), email: '', phone_no: '',
      project_name: '', delivery_location: '', required_date: '', remarks: '',
    });
    setRows([emptyRfqItem()]);
    setFiles({ logo: '', cr: '' });
    setSelectedCategory('');
    setBrowseQuery('');
    setShowDirectSearch(Boolean(requestedProduct));
    if (formElement) formElement.reset();
  };

  const showError = (message) => {
    setErrorMsg(message);
    setStatus('error');
  };

  const validateContact = () => {
    if (!form.contact_person.trim() || !form.customer_name.trim()) {
      showError(t(lang,
        'Please enter the contact person and company or customer name.',
        'يرجى إدخال اسم مسؤول التواصل واسم الشركة أو العميل.',
        'Indica la persona de contacto y el nombre de la empresa o cliente.'));
      return false;
    }
    if (!form.email.trim() && !form.phone_no.trim()) {
      showError(t(lang,
        'Please provide an email address or phone number.',
        'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.',
        'Indica un correo electrónico o número de teléfono.'));
      return false;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showError(t(lang,
        'Please enter a valid email address.',
        'يرجى إدخال بريد إلكتروني صحيح.',
        'Introduce un correo electrónico válido.'));
      return false;
    }
    return true;
  };

  const validateProducts = () => {
    const invalidRow = rows.find((row) => !catalogByCode.has(row.item_code)
      || !Number.isFinite(Number(row.qty)) || Number(row.qty) <= 0);
    if (!catalogReady || invalidRow) {
      showError(t(lang,
        'Please select a valid ERP product for every item and enter a quantity greater than zero.',
        'يرجى اختيار منتج صحيح من النظام لكل بند وإدخال كمية أكبر من صفر.',
        'Selecciona un producto válido del ERP para cada artículo e indica una cantidad mayor que cero.'));
      return false;
    }
    return true;
  };

  const validateProjectDetails = (formElement) => {
    const data = new FormData(formElement);
    const logo = data.get('company_logo');
    const crAttachment = data.get('cr_attachment');
    const hasCrAttachment = crAttachment instanceof File && Boolean(crAttachment.name);
    if (!form.delivery_location.trim() || !form.cr_number.trim()
        || !form.vat_number.trim() || !hasCrAttachment) {
      showError(t(lang,
        'Please enter the delivery location, CR number, VAT number, and attach the CR document.',
        'يرجى إدخال موقع التسليم ورقم السجل التجاري والرقم الضريبي وإرفاق مستند السجل التجاري.',
        'Indica el lugar de entrega, el número de registro mercantil, el número de IVA y adjunta el documento del registro mercantil.'));
      return false;
    }
    if ((logo instanceof File && logo.name && logo.size > MAX_RFQ_ATTACHMENT_BYTES)
        || crAttachment.size > MAX_RFQ_ATTACHMENT_BYTES) {
      showError(t(lang,
        'Each attachment must be no larger than 5 MB.',
        'يجب ألا يتجاوز حجم كل مرفق 5 ميجابايت.',
        'Cada archivo adjunto debe tener un tamaño máximo de 5 MB.'));
      return false;
    }
    return true;
  };

  const moveToStep = (nextStep) => {
    setStatus('idle');
    setErrorMsg('');
    setStep(nextStep);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => document.getElementById('rfq-form')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
    }
  };

  const continueForm = (event) => {
    const valid = step === 1 ? validateContact()
      : step === 2 ? validateProducts()
      : validateProjectDetails(event.currentTarget.form);
    if (valid) moveToStep(Math.min(4, step + 1));
  };

  const submitRfq = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const formElement = event.currentTarget;
    if (step < 4) {
      const valid = step === 1 ? validateContact()
        : step === 2 ? validateProducts()
        : validateProjectDetails(formElement);
      if (valid) moveToStep(step + 1);
      return;
    }
    const data = new FormData(formElement);
    const logo = data.get('company_logo');
    const crAttachment = data.get('cr_attachment');
    const hasLogo = logo instanceof File && Boolean(logo.name);
    const hasCrAttachment = crAttachment instanceof File && Boolean(crAttachment.name);
    if (!validateContact()) return;
    if (!validateProducts()) return;
    if (!validateProjectDetails(formElement)) return;
    if ((hasLogo && logo.size > MAX_RFQ_ATTACHMENT_BYTES)
        || (hasCrAttachment && crAttachment.size > MAX_RFQ_ATTACHMENT_BYTES)) {
      setErrorMsg(t(lang,
        'Each attachment must be no larger than 5 MB.',
        'يجب ألا يتجاوز حجم كل مرفق 5 ميجابايت.',
        'Cada archivo adjunto debe tener un tamaño máximo de 5 MB.'));
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMsg('');
    setRfqId('');
    setUploadProgress(0);
    let logoBlob = null;
    let crBlob = null;
    try {
      if ((hasLogo || hasCrAttachment) && typeof window.uploadPrivateRfqFile !== 'function') {
        throw new Error('RFQ file uploader unavailable');
      }
      if (hasLogo) {
        const type = rfqFileContentType(logo);
        logoBlob = await window.uploadPrivateRfqFile(
          logo,
          'logo',
          { name: logo.name, type, size: logo.size },
          ({ percentage }) => setUploadProgress(Math.round((percentage || 0) * (hasCrAttachment ? 0.5 : 1))),
        );
      }
      if (hasCrAttachment) {
        const type = rfqFileContentType(crAttachment);
        crBlob = await window.uploadPrivateRfqFile(
          crAttachment,
          'cr',
          { name: crAttachment.name, type, size: crAttachment.size },
          ({ percentage }) => setUploadProgress(Math.round((hasLogo ? 50 : 0) + (percentage || 0) * (hasLogo ? 0.5 : 1))),
        );
      }

      const pageUrl = typeof window === 'undefined' ? '' : window.location.href;
      const payload = await submitCustomerRfq({
        ...form,
        items: rows.map((row) => ({
          item_code: row.item_code,
          qty: Number(row.qty),
          description: row.description,
        })),
        source: requestedProduct ? `${source}; requested product: ${requestedProduct}` : source,
        page_url: pageUrl,
        lang,
        logo_blob: logoBlob ? {
          url: logoBlob.url, name: logo.name, type: rfqFileContentType(logo), size: logo.size,
        } : null,
        cr_blob: crBlob ? {
          url: crBlob.url, name: crAttachment.name, type: rfqFileContentType(crAttachment), size: crAttachment.size,
        } : null,
      });
      if (!payload.rfq_id) throw new Error('ERP did not return an RFQ ID');
      setRfqId(payload.rfq_id);
      setStatus(payload.attachment_warning ? 'sent-warning' : 'sent');
      setUploadProgress(0);
      // The confirmation lives on its own page; the block below only shows if
      // the browser has not navigated yet.
      window.location.assign(thankYouHref({
        type: 'rfq', ref: payload.rfq_id, warn: payload.attachment_warning,
      }));
    } catch (error) {
      setErrorMsg(t(lang,
        'We could not register the RFQ in ERP. Please review the fields and try again, or contact info@bcisaudi.com.',
        'تعذر تسجيل طلب عرض السعر في النظام. يرجى مراجعة البيانات والمحاولة مرة أخرى أو التواصل عبر info@bcisaudi.com.',
        'No pudimos registrar la solicitud en el ERP. Revisa los datos e inténtalo de nuevo o escribe a info@bcisaudi.com.'));
      setStatus('error');
      setUploadProgress(0);
    }
  };

  const sent = status === 'sent' || status === 'sent-warning';
  const stepLabels = [
    t(lang, 'Contact', 'التواصل', 'Contacto'),
    t(lang, 'Products', 'المنتجات', 'Productos'),
    t(lang, 'Project', 'المشروع', 'Proyecto'),
    t(lang, 'Review', 'المراجعة', 'Revisión'),
  ];
  const hasSelectedItems = rows.some((row) => Boolean(row.item_code));
  return (
    <form id="rfq-form" className="bci-form" onSubmit={submitRfq} style={{
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
            {t(lang, 'Request a quote', 'اطلب عرض سعر', 'Solicitar cotización')}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--bci-steel)', lineHeight: 1.5 }}>
            {t(lang,
              'Your request will be registered for the BCI sales team.',
              'سيتم تسجيل طلبك لدى فريق مبيعات BCI.',
              'Tu solicitud quedará registrada para el equipo comercial de BCI.')}
          </div>
        </div>
        <span className="eyebrow" style={{ color: 'var(--bci-steel)', whiteSpace: 'nowrap', marginTop: 8 }}>
          {t(lang, 'Reply within 24 h', 'رد خلال 24 ساعة', 'Respuesta en 24 h')}
        </span>
      </div>

      <ol aria-label={t(lang, 'Quote request progress', 'مراحل طلب عرض السعر', 'Progreso de la solicitud')} style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: isPhone ? 5 : 10,
        listStyle: 'none', padding: 0, margin: '4px 0 10px',
      }}>
        {stepLabels.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const complete = number < step;
          return (
            <li key={label} aria-current={active ? 'step' : undefined} style={{ minWidth: 0 }}>
              <div style={{ height: 3, background: active || complete ? 'var(--bci-green-500)' : 'var(--bci-hairline-light)', marginBottom: 10 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: isPhone ? 5 : 8, color: active ? 'var(--bci-navy)' : 'var(--bci-steel)' }}>
                <span style={{
                  width: isPhone ? 22 : 26, height: isPhone ? 22 : 26, borderRadius: '50%', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: complete ? 'var(--bci-green-500)' : active ? 'var(--bci-navy)' : 'var(--bci-concrete)',
                  color: complete || active ? '#fff' : 'var(--bci-steel)', fontFamily: 'var(--ff-mono)', fontSize: 10,
                }}>{complete ? <Icon name="check" size={12} stroke="#fff" /> : number}</span>
                <span style={{ fontSize: isPhone ? 10 : 12, fontWeight: active ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div data-rfq-step="1" style={{ display: step === 1 ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 8 }}>
            {t(lang, 'Step 1 of 4', 'الخطوة 1 من 4', 'Paso 1 de 4')}
          </div>
          <h4 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontSize: 24, color: 'var(--bci-navy)', margin: 0 }}>
            {t(lang, 'Who should we contact?', 'مع من نتواصل؟', '¿Con quién debemos contactar?')}
          </h4>
        </div>
        <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Contact person', 'اسم مسؤول التواصل', 'Persona de contacto')}</label>
          <input type="text" autoComplete="name" value={form.contact_person} onChange={changeForm('contact_person')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Company / customer name', 'اسم الشركة / العميل', 'Empresa / cliente')}</label>
          <input type="text" autoComplete="organization" value={form.customer_name} onChange={changeForm('customer_name')} />
        </div>
        <div className="field">
          <label>{t(lang, 'RFQ date', 'تاريخ طلب عرض السعر', 'Fecha de la solicitud')}</label>
          <input type="date" value={form.transaction_date} onChange={changeForm('transaction_date')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Phone', 'الهاتف', 'Teléfono')}</label>
          <input type="tel" autoComplete="tel" value={form.phone_no} onChange={changeForm('phone_no')} placeholder="+966" />
        </div>
        <div className="field">
          <label>{t(lang, 'Email', 'البريد الإلكتروني', 'Correo')}</label>
          <input type="email" autoComplete="email" value={form.email} onChange={changeForm('email')} placeholder="name@firm.com" />
        </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--bci-steel)' }}>
          {t(lang,
            'Contact person and company are required. Provide at least an email or phone number.',
            'اسم مسؤول التواصل والشركة مطلوبان. أدخل البريد الإلكتروني أو رقم الهاتف على الأقل.',
            'La persona de contacto y la empresa son obligatorias. Indica al menos un correo o teléfono.')}
        </div>
      </div>

      <div data-rfq-step="2" style={{ display: step === 2 ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 8 }}>
          {t(lang, 'Step 2 of 4', 'الخطوة 2 من 4', 'Paso 2 de 4')}
        </div>
        <h4 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontSize: 24, color: 'var(--bci-navy)', margin: 0 }}>
          {t(lang, 'What products do you need?', 'ما المنتجات التي تحتاجها؟', '¿Qué productos necesitas?')}
        </h4>
      </div>
      <div style={{ background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', padding: isPhone ? 14 : 18, color: 'var(--bci-navy)', fontSize: 13, lineHeight: 1.6 }}>
        <strong>{t(lang, 'Not sure which product?', 'لست متأكدًا من المنتج؟', '¿No sabes qué producto elegir?')}</strong>{' '}
        {t(lang,
          'Start with what you are trying to do. Choose an application below, review the matching products, and add notes about your site. BCI sales will confirm the correct system before quoting.',
          'ابدأ بما تريد تنفيذه. اختر الاستخدام أدناه وراجع المنتجات المناسبة وأضف ملاحظات عن الموقع. سيؤكد فريق مبيعات BCI النظام الصحيح قبل إصدار العرض.',
          'Empieza por la aplicación. Elige una categoría, revisa los productos relacionados y añade notas sobre la obra. Ventas de BCI confirmará el sistema correcto antes de cotizar.')}
      </div>
      {requestedProduct && (
        <div style={{ background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', padding: '10px 12px', fontSize: 13, color: 'var(--bci-navy)' }}>
          {t(lang, 'Product page selection', 'المنتج المختار من الصفحة', 'Producto seleccionado en la página')}: <strong>{requestedProduct}</strong>.{' '}
          {t(lang, 'Choose its pack or SKU below.', 'اختر العبوة أو رمز الصنف أدناه.', 'Elige su envase o SKU abajo.')}
        </div>
      )}
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
            'Local preview: showing the website catalogue. The deployed page loads live SKU and unit data from ERP.',
            'معاينة محلية: يتم عرض كتالوج الموقع. الصفحة المنشورة تحمّل رموز الأصناف والوحدات مباشرة من النظام.',
            'Vista local: se muestra el catálogo del sitio. La página publicada carga los SKU y unidades directamente del ERP.')}
        </div>
      )}

      {catalogReady && groupedCatalog.length > 0 && (
        <section aria-labelledby={`${listId}-application`} style={{ borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 18 }}>
          <div id={`${listId}-application`} className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 12 }}>
            {t(lang, '1 · Choose your application', '1 · اختر الاستخدام', '1 · Elige la aplicación')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isPhone ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {groupedCatalog.map(([category]) => {
              const active = selectedCategory === category;
              const solution = SOLUTIONS.find((item) => item.en?.name === category);
              return (
                <button key={category} type="button" aria-pressed={active} onClick={() => { setSelectedCategory(category); setBrowseQuery(''); }} style={{
                  minHeight: isPhone ? 72 : 82, padding: isPhone ? 10 : 14, textAlign: isAr ? 'right' : 'left', cursor: 'pointer',
                  background: active ? 'var(--bci-navy)' : 'var(--bci-paper)',
                  color: active ? '#fff' : 'var(--bci-navy)',
                  border: `1px solid ${active ? 'var(--bci-navy)' : 'var(--bci-hairline-light)'}`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8,
                }}>
                  {solution && <Icon name={solution.icon} size={18} stroke={active ? 'var(--bci-green-400)' : 'var(--bci-green-600)'} />}
                  <span style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-sans)', fontWeight: 600, fontSize: isPhone ? 11 : 13, lineHeight: 1.25 }}>
                    {localizedCategory(category, lang)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedCategory && (
        <section aria-labelledby={`${listId}-matches`} style={{ borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 18 }}>
          <div id={`${listId}-matches`} className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 12 }}>
            {t(lang, '2 · Choose a matching product', '2 · اختر منتجًا مناسبًا', '2 · Elige un producto relacionado')}
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t(lang, 'Filter this application', 'ابحث ضمن هذا الاستخدام', 'Filtrar esta aplicación')}</label>
            <input type="search" value={browseQuery} onChange={(event) => setBrowseQuery(event.target.value)}
              placeholder={t(lang, 'Describe the need or type a product name…', 'اكتب وصف الحاجة أو اسم المنتج…', 'Describe la necesidad o escribe un producto…')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {browsedProducts.slice(0, 8).map((item) => {
              const selected = rows.some((row) => row.item_code === item.code);
              const copy = websiteProductCopy(item, lang);
              return (
                <button key={item.code} type="button" onClick={() => selectProduct(item)} disabled={selected} style={{
                  padding: 14, textAlign: isAr ? 'right' : 'left', cursor: selected ? 'default' : 'pointer',
                  background: selected ? 'var(--bci-green-50)' : '#fff',
                  border: `1px solid ${selected ? 'var(--bci-green-500)' : 'var(--bci-hairline-light)'}`,
                  color: 'var(--bci-navy)', display: 'flex', flexDirection: 'column', gap: 7, opacity: 1,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%' }}>
                    <strong style={{ fontSize: 13 }}>{item.name}</strong>
                    {selected && <Icon name="check" size={15} stroke="var(--bci-green-700)" />}
                  </span>
                  {copy?.desc && <span style={{ color: 'var(--bci-steel)', fontSize: 11, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{copy.desc}</span>}
                  <span style={{ fontFamily: 'var(--ff-mono)', color: selected ? 'var(--bci-green-700)' : 'var(--bci-steel)', fontSize: 10 }}>
                    {selected ? t(lang, 'Added', 'تمت الإضافة', 'Añadido') : t(lang, 'Add to request', 'أضف إلى الطلب', 'Añadir a la solicitud')}
                  </span>
                </button>
              );
            })}
          </div>
          {browsedProducts.length === 0 && (
            <div style={{ color: 'var(--bci-steel)', fontSize: 13, padding: '12px 0' }}>
              {t(lang, 'No matching products. Try a broader description.', 'لا توجد منتجات مطابقة. جرّب وصفًا أوسع.', 'No hay productos coincidentes. Prueba una descripción más amplia.')}
            </div>
          )}
          {browsedProducts.length > 8 && (
            <div style={{ color: 'var(--bci-steel)', fontSize: 11, marginTop: 10 }}>
              {t(lang, 'Showing the first 8 matches. Use the filter to narrow the list.', 'يتم عرض أول 8 نتائج. استخدم البحث لتضييق القائمة.', 'Se muestran los primeros 8 resultados. Usa el filtro para reducir la lista.')}
            </div>
          )}
        </section>
      )}

      <datalist id={listId}>
        {groupedCatalog.flatMap(([category, items]) => items.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name} · {localizedCategory(category, lang)}
          </option>
        )))}
      </datalist>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', borderTop: '1px solid var(--bci-hairline-light)', paddingTop: 18 }}>
        <div className="eyebrow" style={{ color: 'var(--bci-steel)' }}>
          {hasSelectedItems
            ? t(lang, 'Your requested items', 'البنود المطلوبة', 'Artículos solicitados')
            : t(lang, 'Already know the product?', 'هل تعرف المنتج بالفعل؟', '¿Ya conoces el producto?')}
        </div>
        {!hasSelectedItems && (
          <button type="button" onClick={() => setShowDirectSearch(!showDirectSearch)} style={{ border: 0, background: 'transparent', color: 'var(--bci-green-700)', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>
            {showDirectSearch
              ? t(lang, 'Hide direct search', 'إخفاء البحث المباشر', 'Ocultar búsqueda directa')
              : t(lang, 'Search product name / SKU', 'البحث باسم المنتج / الرمز', 'Buscar producto / SKU')}
          </button>
        )}
      </div>
      {(showDirectSearch || hasSelectedItems) && rows.map((row, index) => (
        <div key={index} style={{ border: '1px solid var(--bci-hairline-light)', background: 'var(--bci-paper)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <strong style={{ color: 'var(--bci-navy)', fontSize: 14 }}>
              {t(lang, 'Item', 'البند', 'Artículo')} {index + 1}
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
            <label>{t(lang, 'Quantity', 'الكمية', 'Cantidad')}</label>
            <input type="number" min="0.001" step="any" inputMode="decimal" value={row.qty}
              onChange={(event) => changeRow(index, 'qty', event.target.value)} />
          </div>
        </div>
      ))}
      {(showDirectSearch || hasSelectedItems) && (
        <button type="button" className="btn btn-ghost-navy" disabled={rows.length >= 20}
          onClick={() => setRows([...rows, emptyRfqItem()])}
          style={{ alignSelf: isAr ? 'flex-end' : 'flex-start', opacity: rows.length >= 20 ? 0.5 : 1 }}>
          {t(lang, 'Add another item', 'إضافة بند آخر', 'Añadir otro artículo')}
        </button>
      )}
      </div>

      <div data-rfq-step="3" style={{ display: step === 3 ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 8 }}>
            {t(lang, 'Step 3 of 4', 'الخطوة 3 من 4', 'Paso 3 de 4')}
          </div>
          <h4 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontSize: 24, color: 'var(--bci-navy)', margin: 0 }}>
            {t(lang, 'Project details and documents', 'تفاصيل المشروع والمستندات', 'Datos del proyecto y documentos')}
          </h4>
        </div>
        <div className="form-grid-2">
          <div className="field">
            <label>{t(lang, 'Project name (optional)', 'اسم المشروع (اختياري)', 'Nombre del proyecto (opcional)')}</label>
            <input type="text" value={form.project_name} onChange={changeForm('project_name')} />
          </div>
          <div className="field">
            <label>{t(lang, 'Delivery location', 'موقع التسليم', 'Lugar de entrega')}</label>
            <input type="text" required value={form.delivery_location} onChange={changeForm('delivery_location')} placeholder={t(lang, 'City / site', 'المدينة / الموقع', 'Ciudad / obra')} />
          </div>
          <div className="field">
            <label>{t(lang, 'Required date (optional)', 'التاريخ المطلوب (اختياري)', 'Fecha requerida (opcional)')}</label>
            <input type="date" min={form.transaction_date} value={form.required_date} onChange={changeForm('required_date')} />
          </div>
          <div className="field">
            <label>{t(lang, 'CR number', 'رقم السجل التجاري', 'N.º de registro mercantil')}</label>
            <input type="text" inputMode="numeric" required value={form.cr_number} onChange={changeForm('cr_number')} />
          </div>
          <div className="field">
            <label>{t(lang, 'VAT number', 'الرقم الضريبي', 'N.º de IVA')}</label>
            <input type="text" inputMode="numeric" required value={form.vat_number} onChange={changeForm('vat_number')} />
          </div>
        </div>
        <div className="eyebrow" style={{ color: 'var(--bci-green-700)', borderBottom: '1px solid var(--bci-hairline-light)', paddingBottom: 9 }}>
          {t(lang, 'Company documents', 'مستندات الشركة', 'Documentos de la empresa')}
        </div>
        <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Company logo (optional)', 'شعار الشركة (اختياري)', 'Logotipo (opcional)')}</label>
          <input name="company_logo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(event) => setFiles({ ...files, logo: event.target.files?.[0]?.name || '' })} />
        </div>
        <div className="field">
          <label>{t(lang, 'CR attachment', 'مرفق السجل التجاري', 'Registro mercantil adjunto')}</label>
          <input name="cr_attachment" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={(event) => setFiles({ ...files, cr: event.target.files?.[0]?.name || '' })} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--bci-steel)', marginTop: -12 }}>
        {t(lang,
          'Accepted files: PDF, JPG, PNG or WebP, up to 5 MB each. The company logo must be an image.',
          'الملفات المقبولة: PDF أو JPG أو PNG أو WebP بحد أقصى 5 ميجابايت لكل ملف. يجب أن يكون شعار الشركة صورة.',
          'Archivos aceptados: PDF, JPG, PNG o WebP, hasta 5 MB cada uno. El logotipo debe ser una imagen.')}
      </div>
      <div className="field">
        <label>{t(lang, 'Remarks (optional)', 'ملاحظات (اختياري)', 'Observaciones (opcional)')}</label>
        <textarea value={form.remarks} onChange={changeForm('remarks')}
          placeholder={t(lang, 'Scope, application details or other instructions…', 'النطاق أو تفاصيل التطبيق أو أي تعليمات أخرى…', 'Alcance, detalles de aplicación u otras instrucciones…')} />
      </div>
      </div>

      <div data-rfq-step="4" style={{ display: step === 4 ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--bci-green-700)', marginBottom: 8 }}>
            {t(lang, 'Step 4 of 4', 'الخطوة 4 من 4', 'Paso 4 de 4')}
          </div>
          <h4 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontSize: 24, color: 'var(--bci-navy)', margin: '0 0 8px' }}>
            {t(lang, 'Review your request', 'راجع طلبك', 'Revisa tu solicitud')}
          </h4>
          <p style={{ color: 'var(--bci-steel)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {t(lang,
              'Check the details below before registering this RFQ with BCI sales.',
              'تحقق من البيانات أدناه قبل تسجيل طلب عرض السعر لدى مبيعات BCI.',
              'Comprueba los datos antes de registrar la solicitud con ventas de BCI.')}
          </p>
        </div>

        <section style={{ border: '1px solid var(--bci-hairline-light)', padding: isPhone ? 16 : 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
            <strong style={{ color: 'var(--bci-navy)', fontSize: 15 }}>{t(lang, 'Contact', 'التواصل', 'Contacto')}</strong>
            <button type="button" onClick={() => moveToStep(1)} style={{ border: 0, background: 'transparent', color: 'var(--bci-green-700)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              {t(lang, 'Edit', 'تعديل', 'Editar')}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr', gap: '10px 24px', fontSize: 13, lineHeight: 1.5 }}>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Contact person', 'مسؤول التواصل', 'Persona de contacto')}: </span><strong>{form.contact_person}</strong></div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Company', 'الشركة', 'Empresa')}: </span><strong>{form.customer_name}</strong></div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Email', 'البريد الإلكتروني', 'Correo')}: </span>{form.email || '—'}</div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Phone', 'الهاتف', 'Teléfono')}: </span>{form.phone_no || '—'}</div>
          </div>
        </section>

        <section style={{ border: '1px solid var(--bci-hairline-light)', padding: isPhone ? 16 : 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
            <strong style={{ color: 'var(--bci-navy)', fontSize: 15 }}>{t(lang, 'Products', 'المنتجات', 'Productos')}</strong>
            <button type="button" onClick={() => moveToStep(2)} style={{ border: 0, background: 'transparent', color: 'var(--bci-green-700)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              {t(lang, 'Edit', 'تعديل', 'Editar')}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row, index) => {
              const product = catalogByCode.get(row.item_code);
              return (
                <div key={`${row.item_code}-${index}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 18, borderTop: index ? '1px solid var(--bci-hairline-light)' : 0, paddingTop: index ? 10 : 0, fontSize: 13 }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', color: 'var(--bci-navy)' }}>{product?.name || row.item_code}</strong>
                    <span style={{ color: 'var(--bci-steel)', fontFamily: 'var(--ff-mono)', fontSize: 11 }}>{row.item_code}</span>
                  </div>
                  <strong style={{ color: 'var(--bci-navy)', whiteSpace: 'nowrap' }}>{t(lang, 'Qty', 'الكمية', 'Cant.')} {row.qty}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ border: '1px solid var(--bci-hairline-light)', padding: isPhone ? 16 : 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
            <strong style={{ color: 'var(--bci-navy)', fontSize: 15 }}>{t(lang, 'Project and documents', 'المشروع والمستندات', 'Proyecto y documentos')}</strong>
            <button type="button" onClick={() => moveToStep(3)} style={{ border: 0, background: 'transparent', color: 'var(--bci-green-700)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              {t(lang, 'Edit', 'تعديل', 'Editar')}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr', gap: '10px 24px', fontSize: 13, lineHeight: 1.5 }}>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Project', 'المشروع', 'Proyecto')}: </span>{form.project_name || '—'}</div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Delivery', 'التسليم', 'Entrega')}: </span>{form.delivery_location || '—'}</div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Required date', 'التاريخ المطلوب', 'Fecha requerida')}: </span>{form.required_date || '—'}</div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'CR / VAT', 'السجل / الضريبة', 'Registro / IVA')}: </span>{form.cr_number || form.vat_number ? `${form.cr_number || '—'} / ${form.vat_number || '—'}` : '—'}</div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'Logo', 'الشعار', 'Logotipo')}: </span>{files.logo || '—'}</div>
            <div><span style={{ color: 'var(--bci-steel)' }}>{t(lang, 'CR file', 'ملف السجل', 'Archivo de registro')}: </span>{files.cr || '—'}</div>
          </div>
          {form.remarks && <p style={{ margin: '14px 0 0', paddingTop: 12, borderTop: '1px solid var(--bci-hairline-light)', color: 'var(--bci-steel)', fontSize: 13, whiteSpace: 'pre-wrap' }}>{form.remarks}</p>}
        </section>
      </div>

      {!sent && (
        <div style={{ display: 'flex', justifyContent: step > 1 ? 'space-between' : 'flex-end', gap: 12, paddingTop: 4 }}>
          {step > 1 && (
            <button type="button" className="btn btn-ghost-navy" onClick={() => moveToStep(step - 1)} disabled={status === 'sending'}>
              {t(lang, 'Back', 'السابق', 'Atrás')}
            </button>
          )}
          {step < 4 ? (
            <button type="button" className="btn btn-accent" onClick={continueForm} disabled={status === 'sending' || (step === 2 && !catalogReady)}>
              {t(lang, 'Continue', 'متابعة', 'Continuar')} <Arrow size={14} />
            </button>
          ) : (
            <button type="submit" disabled={status === 'sending' || catalogStatus !== 'loaded'} className="btn btn-accent" style={{ minWidth: isPhone ? 0 : 220, justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}>
              {status === 'sending' ? (
                uploadProgress > 0 && uploadProgress < 100
                  ? t(lang, `Uploading files… ${uploadProgress}%`, `جارٍ رفع الملفات… ${uploadProgress}%`, `Subiendo archivos… ${uploadProgress}%`)
                  : t(lang, 'Registering RFQ…', 'جارٍ تسجيل طلب عرض السعر…', 'Registrando solicitud…')
              ) : <>{t(lang, 'Submit RFQ', 'إرسال طلب عرض السعر', 'Enviar solicitud')} <Arrow size={14} /></>}
            </button>
          )}
        </div>
      )}

      {sent && (
        <div role="status" style={{ fontSize: 13, color: 'var(--bci-green-800)', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', padding: '12px 14px' }}>
          {t(lang,
            `Thank you. Your RFQ${rfqId ? ` ${rfqId}` : ''} is registered and ready for sales review.`,
            `شكرًا لك. تم تسجيل طلب عرض السعر${rfqId ? ` ${rfqId}` : ''} وهو جاهز لمراجعة فريق المبيعات.`,
            `Gracias. Tu solicitud${rfqId ? ` ${rfqId}` : ''} está registrada y lista para revisión comercial.`)}
          {status === 'sent-warning' && ` ${t(lang,
            'One attachment could not be linked; the RFQ itself was registered successfully.',
            'تعذر ربط أحد المرفقات، ولكن تم تسجيل الطلب بنجاح.',
            'No se pudo vincular un archivo, pero la solicitud se registró correctamente.')}`}
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => { resetForm(document.getElementById('rfq-form')); setRfqId(''); moveToStep(1); }} style={{ border: 0, background: 'transparent', color: 'inherit', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>
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
          'Draft RFQ · reviewed by BCI sales before quotation',
          'طلب مبدئي · يراجعه فريق مبيعات BCI قبل إصدار عرض السعر',
          'Solicitud preliminar · revisión comercial antes de cotizar')}
      </div>
    </form>
  );
}

if (typeof window !== 'undefined') window.CustomerRfqForm = CustomerRfqForm;
