/* global React, SOLUTIONS, useLang, useViewport, t, Icon, Arrow, loadErpRfqItems,
   submitSubmittalRequest, thankYouHref */
const {
  useEffect: useEffect_sub,
  useId: useId_sub,
  useMemo: useMemo_sub,
  useState: useState_sub,
} = React;

const MAX_SPEC_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function specFileContentType(file) {
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

function submittalRequestedProduct() {
  try { return new URLSearchParams(window.location.search).get('product') || ''; }
  catch (_) { return ''; }
}

function submittalCatalogFallback() {
  return SOLUTIONS.flatMap((solution) => solution.products.map((product) => ({
    code: product.code,
    name: product.en?.name || product.code,
    category: solution.en.name,
  })));
}

function submittalLocalPreview() {
  try { return ['127.0.0.1', 'localhost'].includes(window.location.hostname); }
  catch (_) { return false; }
}

function SubmittalRequestForm({ source = 'website', maxWidth }) {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const isAr = lang === 'ar';
  const listId = `submittal-products-${useId_sub().replace(/:/g, '')}`;
  const requestedProduct = useMemo_sub(submittalRequestedProduct, []);
  const [form, setForm] = useState_sub({
    contact_person: '',
    company_name: '',
    email: '',
    phone_no: '',
    item_code: '',
    project_name: '',
    project_location: '',
    project_area: '',
    alternative_material: '',
    other_details: '',
  });
  const [specName, setSpecName] = useState_sub('');
  const [catalog, setCatalog] = useState_sub([]);
  const [catalogStatus, setCatalogStatus] = useState_sub('loading');
  const [status, setStatus] = useState_sub('idle'); // idle | sending | sent | sent-warning | error
  const [errorMsg, setErrorMsg] = useState_sub('');
  const [requestId, setRequestId] = useState_sub('');
  const [uploadProgress, setUploadProgress] = useState_sub(0);

  const fetchCatalog = () => {
    setCatalogStatus('loading');
    return loadErpRfqItems()
      .then((items) => {
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => {
        if (submittalLocalPreview()) {
          setCatalog(submittalCatalogFallback());
          setCatalogStatus('preview');
        } else {
          setCatalogStatus('error');
        }
      });
  };

  useEffect_sub(() => {
    let active = true;
    loadErpRfqItems()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        setCatalogStatus('loaded');
      })
      .catch(() => {
        if (!active) return;
        if (submittalLocalPreview()) {
          setCatalog(submittalCatalogFallback());
          setCatalogStatus('preview');
        } else {
          setCatalogStatus('error');
        }
      });
    return () => { active = false; };
  }, []);

  const catalogByCode = useMemo_sub(
    () => new Map(catalog.map((item) => [item.code, item])),
    [catalog],
  );
  const catalogReady = catalogStatus === 'loaded' || catalogStatus === 'preview';

  // A product page links here with ?product=<code>; fill it in once the live
  // catalogue confirms the code still exists.
  useEffect_sub(() => {
    if (!requestedProduct || form.item_code || !catalogByCode.size) return;
    if (catalogByCode.has(requestedProduct)) setForm((f) => ({ ...f, item_code: requestedProduct }));
  }, [requestedProduct, catalogByCode]);

  const changeForm = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const showError = (message) => {
    setErrorMsg(message);
    setStatus('error');
  };

  const resetForm = (formElement) => {
    setForm({
      contact_person: '', company_name: '', email: '', phone_no: '', item_code: '',
      project_name: '', project_location: '', project_area: '',
      alternative_material: '', other_details: '',
    });
    setSpecName('');
    if (formElement) formElement.reset();
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const formElement = event.currentTarget;
    const specification = new FormData(formElement).get('project_specification');
    const hasSpecification = specification instanceof File && Boolean(specification.name);

    if (!form.contact_person.trim() || !form.company_name.trim()) {
      return showError(t(lang,
        'Please enter the contact person and company name.',
        'يرجى إدخال اسم مسؤول التواصل واسم الشركة.',
        'Indica la persona de contacto y el nombre de la empresa.'));
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return showError(t(lang,
        'Please enter a valid email address — the submittal is sent there.',
        'يرجى إدخال بريد إلكتروني صحيح — سيتم إرسال الوثائق إليه.',
        'Introduce un correo electrónico válido: allí se enviará la documentación.'));
    }
    if (!catalogReady || !catalogByCode.has(form.item_code)) {
      return showError(t(lang,
        'Please choose a BCI product from the list.',
        'يرجى اختيار منتج BCI من القائمة.',
        'Elige un producto BCI de la lista.'));
    }
    if (!form.project_name.trim() || !form.project_location.trim()) {
      return showError(t(lang,
        'Please enter the project name and location.',
        'يرجى إدخال اسم المشروع وموقعه.',
        'Indica el nombre y la ubicación del proyecto.'));
    }
    if (!hasSpecification) {
      return showError(t(lang,
        'Please attach the project specification.',
        'يرجى إرفاق مواصفات المشروع.',
        'Adjunta la especificación del proyecto.'));
    }
    if (specification.size > MAX_SPEC_ATTACHMENT_BYTES) {
      return showError(t(lang,
        'The specification must be no larger than 10 MB.',
        'يجب ألا يتجاوز حجم ملف المواصفات 10 ميجابايت.',
        'La especificación no debe superar los 10 MB.'));
    }

    setStatus('sending');
    setErrorMsg('');
    setRequestId('');
    setUploadProgress(0);
    try {
      if (typeof window.uploadPrivateRfqFile !== 'function') {
        throw new Error('File uploader unavailable');
      }
      const type = specFileContentType(specification);
      const specBlob = await window.uploadPrivateRfqFile(
        specification,
        'spec',
        { name: specification.name, type, size: specification.size },
        ({ percentage }) => setUploadProgress(Math.round(percentage || 0)),
      );

      const pageUrl = typeof window === 'undefined' ? '' : window.location.href;
      const payload = await submitSubmittalRequest({
        ...form,
        source: requestedProduct ? `${source}; requested product: ${requestedProduct}` : source,
        page_url: pageUrl,
        lang,
        spec_blob: {
          url: specBlob.url, name: specification.name, type, size: specification.size,
        },
      });
      if (!payload.request_id) throw new Error('ERP did not return a submittal request ID');
      setRequestId(payload.request_id);
      setStatus(payload.attachment_warning ? 'sent-warning' : 'sent');
      setUploadProgress(0);
      // The confirmation lives on its own page; the block below only shows if
      // the browser has not navigated yet.
      window.location.assign(thankYouHref({
        type: 'submittal', ref: payload.request_id, warn: payload.attachment_warning,
      }));
    } catch (error) {
      showError(t(lang,
        'We could not register the submittal request in ERP. Please review the fields and try again, or contact info@bcisaudi.com.',
        'تعذر تسجيل طلب الوثائق في النظام. يرجى مراجعة البيانات والمحاولة مرة أخرى أو التواصل عبر info@bcisaudi.com.',
        'No pudimos registrar la solicitud en el ERP. Revisa los datos e inténtalo de nuevo o escribe a info@bcisaudi.com.'));
      setUploadProgress(0);
    }
  };

  const sent = status === 'sent' || status === 'sent-warning';
  const sectionLabel = (text) => (
    <div className="eyebrow" style={{ color: 'var(--bci-green-700)', borderBottom: '1px solid var(--bci-hairline-light)', paddingBottom: 9 }}>
      {text}
    </div>
  );

  return (
    <form id="submittal-form" className="bci-form" onSubmit={submitRequest} style={{
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
            {t(lang, 'Request a submittal', 'اطلب وثائق الاعتماد', 'Solicitar documentación de aprobación')}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--bci-steel)', lineHeight: 1.5 }}>
            {t(lang,
              'Send us the project specification and we will prepare the submittal package for the specified product.',
              'أرسل لنا مواصفات المشروع وسنجهّز ملف الاعتماد للمنتج المطلوب.',
              'Envíanos la especificación del proyecto y prepararemos el paquete de aprobación del producto indicado.')}
          </div>
        </div>
        <span className="eyebrow" style={{ color: 'var(--bci-steel)', whiteSpace: 'nowrap', marginTop: 8 }}>
          {t(lang, 'Technical team', 'الفريق الفني', 'Equipo técnico')}
        </span>
      </div>

      {sectionLabel(t(lang, 'Who should we reply to?', 'مع من نتواصل؟', '¿A quién respondemos?'))}
      <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Contact person', 'اسم مسؤول التواصل', 'Persona de contacto')}</label>
          <input type="text" autoComplete="name" value={form.contact_person} onChange={changeForm('contact_person')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Company / consultant', 'الشركة / الاستشاري', 'Empresa / consultor')}</label>
          <input type="text" autoComplete="organization" value={form.company_name} onChange={changeForm('company_name')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Email', 'البريد الإلكتروني', 'Correo')}</label>
          <input type="email" autoComplete="email" value={form.email} onChange={changeForm('email')} placeholder="name@firm.com" />
        </div>
        <div className="field">
          <label>{t(lang, 'Phone (optional)', 'الهاتف (اختياري)', 'Teléfono (opcional)')}</label>
          <input type="tel" autoComplete="tel" value={form.phone_no} onChange={changeForm('phone_no')} placeholder="+966" />
        </div>
      </div>

      {sectionLabel(t(lang, 'Product', 'المنتج', 'Producto'))}
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
      <div className="field">
        <label>{t(lang, 'Product name / SKU', 'اسم المنتج / رمز الصنف', 'Producto / SKU')}</label>
        <input list={listId} value={form.item_code} disabled={!catalogReady}
          onChange={changeForm('item_code')}
          placeholder={catalogStatus === 'loading'
            ? t(lang, 'Loading products…', 'جارٍ تحميل المنتجات…', 'Cargando productos…')
            : t(lang, 'Search by product name or code…', 'ابحث باسم المنتج أو الرمز…', 'Busca por nombre o código…')} />
      </div>
      <datalist id={listId}>
        {catalog.map((item) => (
          <option key={item.code} value={item.code}>{item.name}</option>
        ))}
      </datalist>

      {sectionLabel(t(lang, 'Project', 'المشروع', 'Proyecto'))}
      <div className="form-grid-2">
        <div className="field">
          <label>{t(lang, 'Project name', 'اسم المشروع', 'Nombre del proyecto')}</label>
          <input type="text" value={form.project_name} onChange={changeForm('project_name')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Project location', 'موقع المشروع', 'Ubicación del proyecto')}</label>
          <input type="text" value={form.project_location} onChange={changeForm('project_location')}
            placeholder={t(lang, 'City / site', 'المدينة / الموقع', 'Ciudad / obra')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Project area (optional)', 'مساحة المشروع (اختياري)', 'Superficie (opcional)')}</label>
          <input type="text" value={form.project_area} onChange={changeForm('project_area')}
            placeholder={t(lang, 'e.g. 4,500 m²', 'مثال: 4,500 م²', 'p. ej. 4.500 m²')} />
        </div>
      </div>
      <div className="field">
        <label>{t(lang, 'Attached project specification', 'مواصفات المشروع المرفقة', 'Especificación del proyecto adjunta')}</label>
        <input name="project_specification" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => setSpecName(event.target.files?.[0]?.name || '')} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--bci-steel)', marginTop: -12 }}>
        {t(lang,
          'Accepted files: PDF, JPG, PNG or WebP, up to 10 MB. Attach the specification section that covers this product.',
          'الملفات المقبولة: PDF أو JPG أو PNG أو WebP بحد أقصى 10 ميجابايت. أرفق بند المواصفات الخاص بهذا المنتج.',
          'Archivos aceptados: PDF, JPG, PNG o WebP, hasta 10 MB. Adjunta el apartado de la especificación que cubre este producto.')}
        {specName && <> · <strong>{specName}</strong></>}
      </div>
      <div className="field">
        <label>{t(lang, 'Alternative material (optional)', 'المادة البديلة (اختياري)', 'Material alternativo (opcional)')}</label>
        <textarea value={form.alternative_material} onChange={changeForm('alternative_material')}
          placeholder={t(lang,
            'Specified brand or product you need BCI to match…',
            'العلامة التجارية أو المنتج المحدد الذي تريد مطابقته…',
            'Marca o producto especificado que BCI debe igualar…')} />
      </div>
      <div className="field">
        <label>{t(lang, 'Other details (optional)', 'تفاصيل أخرى (اختياري)', 'Otros datos (opcional)')}</label>
        <textarea value={form.other_details} onChange={changeForm('other_details')}
          placeholder={t(lang,
            'Consultant, main contractor, submittal deadline, required certificates…',
            'الاستشاري، المقاول الرئيسي، موعد التسليم، الشهادات المطلوبة…',
            'Consultor, contratista principal, fecha límite, certificados requeridos…')} />
      </div>

      {!sent && (
        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', paddingTop: 4 }}>
          <button type="submit" disabled={status === 'sending' || !catalogReady} className="btn btn-accent"
            style={{ minWidth: isPhone ? 0 : 240, justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}>
            {status === 'sending' ? (
              uploadProgress > 0 && uploadProgress < 100
                ? t(lang, `Uploading specification… ${uploadProgress}%`, `جارٍ رفع المواصفات… ${uploadProgress}%`, `Subiendo especificación… ${uploadProgress}%`)
                : t(lang, 'Registering request…', 'جارٍ تسجيل الطلب…', 'Registrando solicitud…')
            ) : <>{t(lang, 'Send submittal request', 'إرسال الطلب', 'Enviar solicitud')} <Arrow size={14} /></>}
          </button>
        </div>
      )}

      {sent && (
        <div role="status" style={{ fontSize: 13, color: 'var(--bci-green-800)', background: 'var(--bci-green-50)', border: '1px solid var(--bci-green-200)', padding: '12px 14px' }}>
          <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginInlineEnd: 8 }}>
            <Icon name="check" size={14} stroke="var(--bci-green-700)" />
          </span>
          {t(lang,
            `Thank you. Your submittal request${requestId ? ` ${requestId}` : ''} is registered with our technical team.`,
            `شكرًا لك. تم تسجيل طلبك${requestId ? ` ${requestId}` : ''} لدى الفريق الفني.`,
            `Gracias. Tu solicitud${requestId ? ` ${requestId}` : ''} está registrada con nuestro equipo técnico.`)}
          {status === 'sent-warning' && ` ${t(lang,
            'The specification could not be fully linked; the request itself was registered successfully.',
            'تعذر ربط ملف المواصفات بالكامل، ولكن تم تسجيل الطلب بنجاح.',
            'No se pudo vincular por completo la especificación, pero la solicitud se registró correctamente.')}`}
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => { resetForm(document.getElementById('submittal-form')); setRequestId(''); setStatus('idle'); }}
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
          'Submittal request · reviewed by BCI technical support',
          'طلب وثائق · يراجعه الدعم الفني في BCI',
          'Solicitud de documentación · revisada por soporte técnico de BCI')}
      </div>
    </form>
  );
}

if (typeof window !== 'undefined') window.SubmittalRequestForm = SubmittalRequestForm;
