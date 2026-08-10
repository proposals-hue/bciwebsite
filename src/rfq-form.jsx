/* global React, SOLUTIONS, useLang, t, Icon, Arrow, loadErpRfqItems,
   submitCustomerRfq */
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

function CustomerRfqForm({ source = 'website', maxWidth }) {
  const { lang } = useLang();
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
    remarks: '',
  });
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
      .catch(() => setCatalogStatus('error'));
  };

  useEffect_rfq(() => {
    let active = true;
    loadErpRfqItems()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => { if (active) setCatalogStatus('error'); });
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

  const resetForm = (formElement) => {
    setForm({
      contact_person: '', customer_name: '', cr_number: '', vat_number: '',
      transaction_date: riyadhDateInputValue(), email: '', phone_no: '', remarks: '',
    });
    setRows([emptyRfqItem()]);
    if (formElement) formElement.reset();
  };

  const submitRfq = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const logo = data.get('company_logo');
    const crAttachment = data.get('cr_attachment');
    const hasLogo = logo instanceof File && Boolean(logo.name);
    const hasCrAttachment = crAttachment instanceof File && Boolean(crAttachment.name);
    const invalidRow = rows.find((row) => !catalogByCode.has(row.item_code)
      || !Number.isFinite(Number(row.qty)) || Number(row.qty) <= 0);

    if (!form.email && !form.phone_no) {
      setErrorMsg(t(lang,
        'Please provide an email address or phone number.',
        'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.',
        'Indica un correo electrónico o número de teléfono.'));
      setStatus('error');
      return;
    }
    if (catalogStatus !== 'loaded' || invalidRow) {
      setErrorMsg(t(lang,
        'Please select a valid ERP product for every item and enter a quantity greater than zero.',
        'يرجى اختيار منتج صحيح من النظام لكل بند وإدخال كمية أكبر من صفر.',
        'Selecciona un producto válido del ERP para cada artículo e indica una cantidad mayor que cero.'));
      setStatus('error');
      return;
    }
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
        website: data.get('website') || '',
      });
      setRfqId(payload.rfq_id || '');
      setStatus(payload.attachment_warning ? 'sent-warning' : 'sent');
      setUploadProgress(0);
      resetForm(formElement);
      if (window.trackAdsLeadConversion) window.trackAdsLeadConversion();
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
  return (
    <form id="rfq-form" className="bci-form" onSubmit={submitRfq} style={{
      background: '#fff',
      border: '1px solid var(--bci-hairline-light)',
      borderRadius: 2,
      padding: 36,
      display: 'flex', flexDirection: 'column', gap: 22,
      direction: isAr ? 'rtl' : 'ltr',
      textAlign: isAr ? 'right' : 'left',
      maxWidth: maxWidth || 'none', margin: maxWidth ? '0 auto' : 0,
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

      <div className="eyebrow" style={{ color: 'var(--bci-green-700)', borderBottom: '1px solid var(--bci-hairline-light)', paddingBottom: 9 }}>
        {t(lang, 'Customer details', 'بيانات العميل', 'Datos del cliente')}
      </div>
      <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Contact person', 'اسم مسؤول التواصل', 'Persona de contacto')}</label>
          <input required type="text" autoComplete="name" value={form.contact_person} onChange={changeForm('contact_person')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Company / customer name', 'اسم الشركة / العميل', 'Empresa / cliente')}</label>
          <input required type="text" autoComplete="organization" value={form.customer_name} onChange={changeForm('customer_name')} />
        </div>
        <div className="field">
          <label>{t(lang, 'CR number (optional)', 'رقم السجل التجاري (اختياري)', 'N.º de registro mercantil (opcional)')}</label>
          <input type="text" inputMode="numeric" value={form.cr_number} onChange={changeForm('cr_number')} />
        </div>
        <div className="field">
          <label>{t(lang, 'VAT number (optional)', 'الرقم الضريبي (اختياري)', 'N.º de IVA (opcional)')}</label>
          <input type="text" inputMode="numeric" value={form.vat_number} onChange={changeForm('vat_number')} />
        </div>
        <div className="field">
          <label>{t(lang, 'RFQ date', 'تاريخ طلب عرض السعر', 'Fecha de la solicitud')}</label>
          <input required type="date" value={form.transaction_date} onChange={changeForm('transaction_date')} />
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
      <div style={{ fontSize: 12, color: 'var(--bci-steel)', marginTop: -12 }}>
        {t(lang,
          'Provide at least one contact method: email or phone.',
          'يرجى إدخال وسيلة تواصل واحدة على الأقل: البريد الإلكتروني أو الهاتف.',
          'Indica al menos un medio de contacto: correo o teléfono.')}
      </div>

      <div className="eyebrow" style={{ color: 'var(--bci-green-700)', borderBottom: '1px solid var(--bci-hairline-light)', paddingBottom: 9 }}>
        {t(lang, 'Requested products', 'المنتجات المطلوبة', 'Productos solicitados')}
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
      <datalist id={listId}>
        {groupedCatalog.flatMap(([category, items]) => items.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name} · {localizedCategory(category, lang)}
          </option>
        )))}
      </datalist>
      {rows.map((row, index) => (
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
            <label>{t(lang, 'ERP product / SKU', 'منتج / رمز الصنف في النظام', 'Producto / SKU del ERP')}</label>
            <input required list={listId} value={row.item_code} disabled={catalogStatus !== 'loaded'}
              onChange={(event) => changeRow(index, 'item_code', event.target.value)}
              placeholder={catalogStatus === 'loading'
                ? t(lang, 'Loading products…', 'جارٍ تحميل المنتجات…', 'Cargando productos…')
                : t(lang, 'Type to search the product list…', 'اكتب للبحث في قائمة المنتجات…', 'Escribe para buscar en la lista…')} />
          </div>
          <div className="form-grid-2">
            <div className="field">
              <label>{t(lang, 'Quantity', 'الكمية', 'Cantidad')}</label>
              <input required type="number" min="0.001" step="any" inputMode="decimal" value={row.qty}
                onChange={(event) => changeRow(index, 'qty', event.target.value)} />
            </div>
            <div className="field">
              <label>{t(lang, 'UOM', 'وحدة القياس', 'Unidad')}</label>
              <input readOnly value={row.uom} placeholder={t(lang, 'Filled from ERP', 'تُعبأ من النظام', 'Se completa desde ERP')} />
            </div>
          </div>
          <div className="field">
            <label>{t(lang, 'Item notes (optional)', 'ملاحظات البند (اختياري)', 'Notas del artículo (opcional)')}</label>
            <textarea value={row.description} onChange={(event) => changeRow(index, 'description', event.target.value)}
              placeholder={t(lang, 'Colour, packaging, application or specification…', 'اللون، العبوة، الاستخدام أو المواصفات…', 'Color, envase, aplicación o especificación…')}
              style={{ minHeight: 84 }} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-ghost-navy" disabled={rows.length >= 20}
        onClick={() => setRows([...rows, emptyRfqItem()])}
        style={{ alignSelf: isAr ? 'flex-end' : 'flex-start', opacity: rows.length >= 20 ? 0.5 : 1 }}>
        {t(lang, 'Add another item', 'إضافة بند آخر', 'Añadir otro artículo')}
      </button>

      <div className="eyebrow" style={{ color: 'var(--bci-green-700)', borderBottom: '1px solid var(--bci-hairline-light)', paddingBottom: 9 }}>
        {t(lang, 'Documents and notes', 'المستندات والملاحظات', 'Documentos y notas')}
      </div>
      <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Company logo (optional)', 'شعار الشركة (اختياري)', 'Logotipo (opcional)')}</label>
          <input name="company_logo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" />
        </div>
        <div className="field">
          <label>{t(lang, 'CR attachment (optional)', 'مرفق السجل التجاري (اختياري)', 'Registro mercantil adjunto (opcional)')}</label>
          <input name="cr_attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" />
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
          placeholder={t(lang, 'Project name, delivery location, required date, scope or other instructions…', 'اسم المشروع، موقع التسليم، التاريخ المطلوب، النطاق أو أي تعليمات أخرى…', 'Proyecto, lugar de entrega, fecha requerida, alcance u otras instrucciones…')} />
      </div>
      <input type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', width: 1, height: 1 }} />

      <button type="submit" disabled={status === 'sending' || catalogStatus !== 'loaded'} className="btn btn-accent" style={{
        width: '100%', justifyContent: 'center', padding: '16px 22px',
        opacity: status === 'sending' || catalogStatus !== 'loaded' ? 0.7 : 1,
        cursor: status === 'sending' ? 'wait' : 'pointer',
      }}>
        {sent ? (
          <><Icon name="check" size={14} stroke="#fff" /> {t(lang, 'RFQ registered', 'تم تسجيل طلب عرض السعر', 'Solicitud registrada')}</>
        ) : status === 'sending' ? (
          <>{uploadProgress > 0 && uploadProgress < 100
            ? t(lang, `Uploading files… ${uploadProgress}%`, `جارٍ رفع الملفات… ${uploadProgress}%`, `Subiendo archivos… ${uploadProgress}%`)
            : t(lang, 'Registering RFQ…', 'جارٍ تسجيل طلب عرض السعر…', 'Registrando solicitud…')}</>
        ) : (
          <>{t(lang, 'Submit RFQ', 'إرسال طلب عرض السعر', 'Enviar solicitud')} <Arrow size={14} /></>
        )}
      </button>

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
