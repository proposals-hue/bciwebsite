/* global React, ReactDOM, LangProvider, useLang, useViewport, t, Icon, Arrow, selectOptionLabel,
   MegaHeader, PageHero, CtaBand, Footer, JOBS, BENEFITS, VALUES, loadErpJobs, loadErpDesignations */
const { useState: useState_cr, useEffect: useEffect_cr } = React;

const OTHER_POSITION_ROLE = 'other-position';

function normalizeCareerJob(job) {
  if (job.title && typeof job.title === 'object') return job;
  const title = job.title || '';
  const description = job.description || '';
  return {
    id: job.id,
    sourceDoctype: job.source_doctype,
    jobOpening: job.job_opening || '',
    title: { en: title, ar: title, es: title },
    dept: { en: job.department || 'BCI', ar: job.department || 'BCI', es: job.department || 'BCI' },
    loc: { en: job.location || 'Saudi Arabia', ar: job.location || 'Saudi Arabia', es: job.location || 'Saudi Arabia' },
    type: { en: job.employment_type || 'Full-time', ar: job.employment_type || 'Full-time', es: job.employment_type || 'Full-time' },
    blurb: { en: description, ar: description, es: description },
  };
}

const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_PHOTO_BYTES = 25 * 1024 * 1024;
const PHOTO_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_SOURCE_TYPES = [...PHOTO_UPLOAD_TYPES, 'image/heic', 'image/heif'];

function cvContentType(file) {
  if (file.type) return file.type;
  const name = String(file.name || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (name.endsWith('.doc')) return 'application/msword';
  return 'application/octet-stream';
}

function photoContentType(file) {
  const declaredType = String(file.type || '').toLowerCase();
  if (declaredType === 'image/jpg') return 'image/jpeg';
  if (declaredType) return declaredType;
  const name = String(file.name || '').toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.heic')) return 'image/heic';
  if (name.endsWith('.heif')) return 'image/heif';
  return '';
}

function replacePhotoExtension(filename) {
  const base = String(filename || 'applicant-photo').replace(/\.[^.]+$/, '') || 'applicant-photo';
  return `${base}.jpg`;
}

function imageToJpegBlob(image, maxDimension = 2048, quality = 0.86) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('PHOTO_CONVERSION_FAILED'));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('PHOTO_CONVERSION_FAILED')),
      'image/jpeg',
      quality,
    );
  });
}

async function prepareApplicantPhoto(file) {
  const sourceType = photoContentType(file);
  const needsConversion = ['image/heic', 'image/heif'].includes(sourceType) || file.size > MAX_PHOTO_BYTES;
  if (!needsConversion) return { file, type: sourceType };

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const candidate = new Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = () => reject(new Error('PHOTO_CONVERSION_FAILED'));
      candidate.src = objectUrl;
    });
    const blob = await imageToJpegBlob(image);
    if (blob.size > MAX_PHOTO_BYTES) throw new Error('PHOTO_CONVERSION_FAILED');
    return {
      file: new File([blob], replacePhotoExtension(file.name), {
        type: 'image/jpeg',
        lastModified: Date.now(),
      }),
      type: 'image/jpeg',
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/* striped image placeholder (user drops real photography later) */
function Placeholder({ label, ratio = '4 / 3', dark }) {
  return (
    <div style={{
      position: 'relative', aspectRatio: ratio, borderRadius: 2, overflow: 'hidden',
      background: dark ? 'var(--bci-navy)' : 'var(--bci-steel-100)',
      border: `1px solid ${dark ? 'var(--bci-navy-600)' : 'var(--bci-hairline-light)'}`,
    }}>
      <div className={dark ? 'hatch' : 'hatch-navy'} style={{ position: 'absolute', inset: 0, opacity: dark ? 0.6 : 1 }} />
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.5)' : 'var(--bci-steel)',
      }}>{label}</span>
    </div>
  );
}

function CareerPage() {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const isAr = lang === 'ar';
  const requestedRole = typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('job') || '');
  const initialRole = requestedRole === 'open' ? OTHER_POSITION_ROLE : requestedRole;
  const [jobs, setJobs] = useState_cr(() => JOBS.map(normalizeCareerJob));
  const [designations, setDesignations] = useState_cr([]);
  const [designationsStatus, setDesignationsStatus] = useState_cr('idle'); // idle | loading | loaded | error
  const [role, setRole] = useState_cr(initialRole);
  const [status, setStatus] = useState_cr('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState_cr('');
  const [uploadProgress, setUploadProgress] = useState_cr(0);
  const sent = status === 'sent';

  useEffect_cr(() => {
    let active = true;
    loadErpJobs()
      .then((erpJobs) => { if (active) setJobs(erpJobs.map(normalizeCareerJob)); })
      .catch(() => { /* Keep the pre-rendered list when developing offline. */ });
    return () => { active = false; };
  }, []);

  useEffect_cr(() => {
    if (role !== OTHER_POSITION_ROLE || designationsStatus !== 'idle') return undefined;
    setDesignationsStatus('loading');
    loadErpDesignations()
      .then((items) => {
        setDesignations(items);
        setDesignationsStatus('loaded');
      })
      .catch(() => setDesignationsStatus('error'));
    return undefined;
  }, [role, designationsStatus]);

  const apply = (jobId) => {
    setRole(jobId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('job', jobId);
      url.hash = 'apply';
      window.history.replaceState({}, '', url);
    } catch (e) {}
    const el = document.getElementById('apply');
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const fd = new FormData(e.target);
    const selectedJob = jobs.find((job) => job.id === role);
    const selectedDesignation = role === OTHER_POSITION_ROLE ? String(fd.get('designation') || '').trim() : '';
    const cv = fd.get('resume_file');
    const photo = fd.get('applicant_photo');
    if (!(cv instanceof File) || !cv.name) {
      setErrorMsg(t(lang, 'Please attach your CV.', 'يرجى إرفاق سيرتك الذاتية.', 'Adjunta tu CV.'));
      setStatus('error');
      return;
    }
    if (cv.size > MAX_CV_BYTES) {
      setErrorMsg(t(lang, 'Your CV must be no larger than 5 MB.', 'يجب ألا يتجاوز حجم السيرة الذاتية 5 ميجابايت.', 'Tu CV no debe superar los 5 MB.'));
      setStatus('error');
      return;
    }
    if (!(photo instanceof File) || !photo.name) {
      setErrorMsg(t(lang, 'Please attach a recent photo of yourself.', 'يرجى إرفاق صورة شخصية حديثة.', 'Adjunta una foto reciente tuya.'));
      setStatus('error');
      return;
    }
    const sourcePhotoType = photoContentType(photo);
    if (!PHOTO_SOURCE_TYPES.includes(sourcePhotoType)) {
      setErrorMsg(t(lang, 'Your photo must be a JPG, PNG, WebP, HEIC, or HEIF image.', 'يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP أو HEIC أو HEIF.', 'La foto debe ser JPG, PNG, WebP, HEIC o HEIF.'));
      setStatus('error');
      return;
    }
    if (photo.size > MAX_SOURCE_PHOTO_BYTES) {
      setErrorMsg(t(lang, 'Your original photo must be no larger than 25 MB.', 'يجب ألا يتجاوز حجم الصورة الأصلية 25 ميجابايت.', 'La foto original no debe superar los 25 MB.'));
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    setUploadProgress(0);
    try {
      if (typeof window.uploadPrivateCv !== 'function' || typeof window.uploadPrivateApplicantPhoto !== 'function') {
        throw new Error('Application uploaders are unavailable');
      }
      const cvType = cvContentType(cv);
      let preparedPhoto;
      try {
        preparedPhoto = await prepareApplicantPhoto(photo);
      } catch (_) {
        setErrorMsg(t(lang,
          'Your iPhone photo could not be prepared. Please choose a JPG/PNG image or take a screenshot of the photo and upload that.',
          'تعذر تجهيز صورة الآيفون. يرجى اختيار صورة JPG أو PNG أو التقاط لقطة شاشة للصورة ورفعها.',
          'No se pudo preparar la foto del iPhone. Elige una imagen JPG/PNG o haz una captura de pantalla y súbela.'));
        setStatus('error');
        setUploadProgress(0);
        return;
      }
      const photoBlob = await window.uploadPrivateApplicantPhoto(
        preparedPhoto.file,
        { name: preparedPhoto.file.name, type: preparedPhoto.type, size: preparedPhoto.file.size },
        ({ percentage }) => setUploadProgress(Math.max(0, Math.min(40, Math.round((percentage || 0) * 0.4)))),
      );
      const blob = await window.uploadPrivateCv(
        cv,
        { name: cv.name, type: cvType, size: cv.size },
        ({ percentage }) => setUploadProgress(Math.max(40, Math.min(100, 40 + Math.round((percentage || 0) * 0.6)))),
      );
      const response = await fetch('/api/job-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: fd.get('name') || '',
          email: fd.get('email') || '',
          phone: fd.get('phone') || '',
          position: selectedJob ? selectedJob.title.en : selectedDesignation,
          designation: selectedJob ? selectedJob.title.en : selectedDesignation,
          job_opening: selectedJob ? selectedJob.jobOpening : '',
          request_reference: selectedJob && selectedJob.sourceDoctype !== 'Job Opening' ? selectedJob.id : '',
          cover_letter: fd.get('cover_letter') || '',
          resume_blob: {
            url: blob.url,
            name: cv.name,
            type: cvType,
            size: cv.size,
          },
          photo_blob: {
            url: photoBlob.url,
            name: preparedPhoto.file.name,
            type: preparedPhoto.type,
            size: preparedPhoto.file.size,
          },
          website: fd.get('website') || '',
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Application failed');
      setStatus('sent');
      setUploadProgress(0);
      e.target.reset();
      setRole('');
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err) {
      setErrorMsg(t(lang,
        'Something went wrong sending your application. Please try again, or email it to info@bcisaudi.com.',
        'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى أو إرساله إلى info@bcisaudi.com.',
        'Hubo un problema al enviar tu solicitud. Inténtalo de nuevo o envíala a info@bcisaudi.com.'));
      setStatus('error');
      setUploadProgress(0);
    }
  };

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Career', 'الوظائف', 'Empleo')}
        crumb={t(lang, 'Career', 'الوظائف', 'Empleo')}
        title="Build the Kingdom’s chemistry."
        titleAr="ابنِ كيمياء المملكة."
        titleEs="Construye la química del Reino."
        subtitle={t(lang,
          'Join a Saudi national manufacturer at the centre of Vision 2030 industrial growth. We hire engineers, chemists, and builders who care about getting it right.',
          'انضم إلى مصنع وطني سعودي في قلب النمو الصناعي لرؤية 2030. نوظّف مهندسين وكيميائيين وبنّائين يهتمون بإتقان العمل.',
          'Únete a un fabricante nacional saudí en el centro del crecimiento industrial de la Visión 2030. Contratamos a ingenieros, químicos y constructores que se preocupan por hacerlo bien.')}
      />

      {/* Values */}
      <section style={{ background: 'var(--bci-concrete)', padding: '120px 0' }}>
        <div className="container">
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Why BCI', 'لماذا BCI', 'Por qué BCI')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--bci-hairline-light)' }}>
            {VALUES.map((v, i) => (
              <div key={v.num} style={{ padding: '40px 28px', borderRight: i < 2 ? '1px solid var(--bci-hairline-light)' : 'none', paddingLeft: i === 0 ? 0 : 28, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 14, color: 'var(--bci-green-600)', marginBottom: 20 }}>{v.num}</div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 26, color: 'var(--bci-navy)', margin: '0 0 12px' }}>{v[lang].t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--bci-steel)', margin: 0 }}>{v[lang].d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: 'var(--bci-navy)', color: '#fff', padding: '120px 0', borderTop: '1px solid var(--bci-green-500)', borderBottom: '1px solid var(--bci-green-500)', position: 'relative', overflow: 'hidden' }}>
        <div className="hatch" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="sec-num" style={{ color: 'var(--bci-green-400)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Benefits', 'المزايا', 'Beneficios')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ padding: '36px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingLeft: i === 0 ? 0 : 24, textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ width: 46, height: 46, border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon name={b.icon} size={22} stroke="#fff" />
                </div>
                <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 0 10px' }}>{b[lang].t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{b[lang].d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section id="roles" style={{ background: 'var(--bci-concrete)', padding: '120px 0', scrollMarginTop: 72 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: 0 }}>
              {t(lang, 'Open positions', 'الوظائف الشاغرة', 'Vacantes')}
            </h2>
            <span className="sec-num" style={{ color: 'var(--bci-steel)' }}>{jobs.length} {t(lang, 'roles', 'وظيفة', 'vacantes')}</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2 }}>
            {jobs.length > 0
              ? jobs.map((j, i) => <JobRow key={j.id} j={j} last={i === jobs.length - 1} onApply={apply} />)
              : <div style={{ padding: 36, textAlign: 'center', color: 'var(--bci-steel)' }}>
                  {t(lang, 'There are no open positions right now. You can still apply for another position below.', 'لا توجد وظائف شاغرة حالياً. لا يزال بإمكانك التقدم لوظيفة أخرى أدناه.', 'No hay vacantes abiertas ahora. Aun así puedes postularte a otro puesto abajo.')}
                </div>}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" style={{ background: 'var(--bci-paper)', padding: '120px 0', scrollMarginTop: 72 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 22, textAlign: isAr ? 'right' : 'left' }}>{t(lang, 'Apply', 'تقديم طلب', 'Postular')}</div>
          <h2 className="display" style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(32px,3.4vw,48px)', color: 'var(--bci-navy)', margin: '0 0 32px', textAlign: isAr ? 'right' : 'left' }}>
            {t(lang, 'Send your application', 'أرسل طلبك', 'Envía tu solicitud')}
          </h2>
          <form className="bci-form" onSubmit={submitApplication}
            style={{ background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2, padding: 36, display: 'flex', flexDirection: 'column', gap: 20, direction: isAr ? 'rtl' : 'ltr' }}>
            <div className="form-grid-2">
              <div className="field"><label>{t(lang, 'Full name', 'الاسم الكامل', 'Nombre completo')}</label><input required name="name" type="text" /></div>
              <div className="field"><label>{t(lang, 'Email', 'البريد', 'Correo')}</label><input required name="email" type="email" placeholder="name@email.com" /></div>
              <div className="field"><label>{t(lang, 'Phone', 'الهاتف', 'Teléfono')}</label><input name="phone" type="tel" placeholder="+966" /></div>
              <div className="field"><label>{t(lang, 'Position', 'الوظيفة', 'Puesto')}</label>
                <select required value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">{t(lang, 'Select a role…', 'اختر وظيفة…', 'Selecciona un puesto…')}</option>
                  {jobs.map(j => {
                    const title = j.title[lang];
                    return <option key={j.id} value={j.id} title={title}>{selectOptionLabel(title, isPhone)}</option>;
                  })}
                  <option value={OTHER_POSITION_ROLE}>{t(lang, 'Other position', 'وظيفة أخرى', 'Otro puesto')}</option>
                </select>
              </div>
            </div>
            {role === OTHER_POSITION_ROLE &&
              <div className="field">
                <label>{t(lang, 'Desired position', 'الوظيفة المطلوبة', 'Puesto deseado')}</label>
                <select required name="designation" defaultValue="" disabled={designationsStatus === 'loading' || designationsStatus === 'error'}>
                  <option value="">{designationsStatus === 'loading'
                    ? t(lang, 'Loading positions…', 'جارٍ تحميل الوظائف…', 'Cargando puestos…')
                    : t(lang, 'Select a position…', 'اختر الوظيفة…', 'Selecciona un puesto…')}</option>
                  {designations.map((designation) => <option key={designation} value={designation}>{selectOptionLabel(designation, isPhone)}</option>)}
                </select>
                {designationsStatus === 'error' &&
                  <div role="alert" style={{ fontSize: 12, color: '#b42318', marginTop: 8 }}>
                    {t(lang,
                      'The ERP positions list could not be loaded. Please try again shortly.',
                      'تعذر تحميل قائمة الوظائف من نظام ERP. يرجى المحاولة مرة أخرى بعد قليل.',
                      'No se pudo cargar la lista de puestos del ERP. Inténtalo de nuevo en unos momentos.')}
                    {' '}
                    <button type="button" onClick={() => setDesignationsStatus('idle')} style={{ border: 0, padding: 0, background: 'transparent', color: 'inherit', font: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
                      {t(lang, 'Retry', 'إعادة المحاولة', 'Reintentar')}
                    </button>
                  </div>}
              </div>}
            <input type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1 }} />
            <div className="field"><label>{t(lang, 'Cover note', 'نبذة تعريفية', 'Carta de presentación')}</label><textarea name="cover_letter" placeholder={t(lang, 'Tell us about your experience…', 'حدثنا عن خبرتك…', 'Cuéntanos sobre tu experiencia…')}></textarea></div>
            <div className="field"><label>{t(lang, 'Upload your CV', 'إرفاق السيرة الذاتية', 'Sube tu CV')}</label><input required name="resume_file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--bci-steel)', marginTop: -8, textAlign: isAr ? 'right' : 'left' }}>
              {t(lang,
                'Accepted files: PDF, DOC, or DOCX. Maximum size: 5 MB.',
                'الملفات المقبولة: PDF أو DOC أو DOCX. الحد الأقصى للحجم: 5 ميجابايت.',
                'Archivos aceptados: PDF, DOC o DOCX. Tamaño máximo: 5 MB.')}
            </div>
            <div className="field"><label>{t(lang, 'Upload a recent photo', 'إرفاق صورة شخصية حديثة', 'Sube una foto reciente')}</label><input required name="applicant_photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif" /></div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--bci-steel)', marginTop: -8, textAlign: isAr ? 'right' : 'left' }}>
              {t(lang,
                'Accepted images: JPG, PNG, WebP, HEIC, or HEIF. iPhone photos are optimized automatically (maximum original size: 25 MB).',
                'الصور المقبولة: JPG أو PNG أو WebP أو HEIC أو HEIF. يتم تحسين صور الآيفون تلقائياً (الحد الأقصى للصورة الأصلية: 25 ميجابايت).',
                'Imágenes aceptadas: JPG, PNG, WebP, HEIC o HEIF. Las fotos del iPhone se optimizan automáticamente (máximo original: 25 MB).')}
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '16px', opacity: status === 'sending' ? 0.7 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}>
              {sent ? <><Icon name="check" size={14} stroke="#fff" /> {t(lang, 'Application sent', 'تم الإرسال', 'Solicitud enviada')}</>
                : status === 'sending' ? <>{uploadProgress > 0 && uploadProgress < 100
                    ? t(lang, `Uploading files… ${uploadProgress}%`, `جارٍ رفع الملفات… ${uploadProgress}%`, `Subiendo archivos… ${uploadProgress}%`)
                    : t(lang, 'Sending…', 'جارٍ الإرسال…', 'Enviando…')}</>
                : <>{t(lang, 'Submit application', 'إرسال الطلب', 'Enviar solicitud')} <Arrow size={14} /></>}
            </button>
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

function JobRow({ j, last, onApply }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [hover, setHover] = useState_cr(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '26px 28px', borderBottom: last ? 'none' : '1px solid var(--bci-hairline-light)', background: hover ? 'var(--bci-steel-50)' : 'transparent', transition: 'background 100ms', flexDirection: isAr ? 'row-reverse' : 'row' }}>
      <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '4px 8px', borderRadius: 2, background: 'var(--bci-navy-50)', color: 'var(--bci-navy)', border: '1px solid var(--bci-navy-100)' }}>{j.dept[lang]}</span>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, padding: '4px 8px', borderRadius: 2, color: 'var(--bci-steel)', border: '1px solid var(--bci-hairline-light)' }}>{j.loc[lang]}</span>
        </div>
        <h3 style={{ fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-display)', fontWeight: 600, fontSize: 21, color: 'var(--bci-navy)', margin: '0 0 6px' }}>{j.title[lang]}</h3>
        <p style={{ fontSize: 14, color: 'var(--bci-steel)', margin: 0 }}>{j.blurb[lang]}</p>
      </div>
      <button onClick={() => onApply(j.id)} className="btn btn-ghost-navy" style={{ whiteSpace: 'nowrap' }}>{t(lang, 'Apply', 'تقديم', 'Postular')} <Arrow size={13} /></button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader active="Career" />
    <CareerPage />
    <Footer />
  </LangProvider>
);
