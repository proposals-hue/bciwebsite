/* global React, useLang, t, Icon, Arrow, useInView, useViewport, revealStyle,
   submitErpWebForm, trackAdsLeadConversion */
const { useState: useState_c } = React;

// ---------- 05 · Contact ----------
function Contact() {
  const { lang } = useLang();
  const { isMobile } = useViewport();
  const [ref, inView] = useInView();
  const details = [
    {
      label: { en: 'Phone', ar: 'هاتف', es: 'Teléfono' },
      value: '+966 59 312 0221',
      icon: 'phone',
      href: 'tel:+966593120221',
    },
    {
      label: { en: 'Email', ar: 'البريد الإلكتروني', es: 'Correo' },
      value: 'info@bcisaudi.com',
      icon: 'mail',
      href: 'mailto:info@bcisaudi.com',
    },
    {
      label: { en: 'WhatsApp', ar: 'واتساب', es: 'WhatsApp' },
      value: { en: 'Click to chat', ar: 'اضغط للمحادثة', es: 'Haz clic para chatear' },
      icon: 'whatsapp',
      href: 'https://wa.me/966593120221',
    },
    {
      label: { en: 'Address', ar: 'العنوان', es: 'Dirección' },
      value: {
        en: '3rd Industrial City, Dammam 34223, KSA',
        ar: 'المدينة الصناعية الثالثة، الدمام 34223، المملكة العربية السعودية',
        es: '3.ª Ciudad Industrial, Dammam 34223, KSA',
      },
      icon: 'map-pin',
      href: '#map',
    },
  ];

  const socials = [
    { name: 'linkedin', href: 'https://www.linkedin.com/company/92827330' },
    { name: 'youtube', href: 'https://www.youtube.com/@bci_saudi' },
    { name: 'instagram', href: 'https://www.instagram.com/bci.saudi/' },
    { name: 'facebook', href: 'https://www.facebook.com/profile.php?id=61579288423656' },
  ];

  return (
    <section ref={ref} id="contact" style={{ background: 'var(--bci-concrete)', padding: 'clamp(72px, 10vw, 140px) 0' }}>
      <div className="container">
        <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 24, ...revealStyle(inView, 0) }}>
          {t(lang, 'Contact', 'تواصل', 'Contacto')}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.05fr', gap: isMobile ? 56 : 80,
          alignItems: 'start',
        }}>
          <div style={revealStyle(inView, 100)}>
            <h2 className="display" style={{
              fontFamily: lang === 'ar' ? 'var(--ff-arabic)' : 'var(--ff-display)',
              fontWeight: 700,
              fontSize: 'clamp(40px, 4.4vw, 64px)',
              lineHeight: lang === 'ar' ? 1.15 : 1.02,
              letterSpacing: lang === 'ar' ? 0 : '-0.018em',
              color: 'var(--bci-navy)', margin: '0 0 40px',
            }}>
              {t(lang, "Let's build", 'لنبنِ معاً', 'Construyamos juntos')}
            </h2>

            <div style={{
              display: 'flex', flexDirection: 'column',
              borderTop: '1px solid var(--bci-hairline-light)',
            }}>
              {details.map((detail) => <ContactRow key={detail.icon} detail={detail} />)}
            </div>

            <div style={{ marginTop: 40 }}>
              <div className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 16 }}>
                {t(lang, 'Follow', 'تابعنا', 'Síguenos')}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {socials.map((social) => <SocialBox key={social.name} {...social} />)}
              </div>
            </div>
          </div>

          <div style={revealStyle(inView, 200)}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const { lang } = useLang();
  const { isPhone } = useViewport();
  const emptyForm = { name: '', company: '', email: '', phone: '', message: '' };
  const [form, setForm] = useState_c(emptyForm);
  const [status, setStatus] = useState_c('idle');

  const onChange = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      await submitErpWebForm('contact-bci', {
        doctype: 'Lead',
        lead_name: form.name.trim(),
        company_name: form.company.trim(),
        email_id: form.email.trim(),
        mobile_no: form.phone.trim(),
        custom_message: form.message.trim(),
      });
      setStatus('sent');
      setForm(emptyForm);
      trackAdsLeadConversion();
      setTimeout(() => setStatus('idle'), 6000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form className="bci-form" onSubmit={onSubmit} style={{
      background: '#fff', border: '1px solid var(--bci-hairline-light)', borderRadius: 2,
      padding: isPhone ? 24 : 36, display: 'flex', flexDirection: 'column', gap: 18,
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
        <h3 style={{
          fontFamily: lang === 'ar' ? 'var(--ff-arabic)' : 'var(--ff-display)',
          fontWeight: 600, fontSize: 28, color: 'var(--bci-navy)', margin: 0,
          letterSpacing: lang === 'ar' ? 0 : '-0.01em',
        }}>
          {t(lang, 'Send an enquiry', 'أرسل استفساراً', 'Enviar una consulta')}
        </h3>
        <span className="eyebrow" style={{ color: 'var(--bci-steel)' }}>
          {t(lang, 'Reply within 24 h', 'رد خلال 24 ساعة', 'Respuesta en 24 h')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label>{t(lang, 'Name *', 'الاسم *', 'Nombre *')}</label>
          <input type="text" required value={form.name} onChange={onChange('name')} placeholder={t(lang, 'Full name', 'الاسم الكامل', 'Nombre completo')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Company', 'الشركة', 'Empresa')}</label>
          <input type="text" value={form.company} onChange={onChange('company')} placeholder={t(lang, 'Consultancy / Contractor', 'استشاري / مقاول', 'Consultoría / Contratista')} />
        </div>
        <div className="field">
          <label>{t(lang, 'Email *', 'البريد الإلكتروني *', 'Correo *')}</label>
          <input type="email" required value={form.email} onChange={onChange('email')} placeholder="name@firm.com" />
        </div>
        <div className="field">
          <label>{t(lang, 'Phone', 'الهاتف', 'Teléfono')}</label>
          <input type="tel" value={form.phone} onChange={onChange('phone')} placeholder="+966" />
        </div>
      </div>

      <div className="field">
        <label>{t(lang, 'Message *', 'الرسالة *', 'Mensaje *')}</label>
        <textarea required value={form.message} onChange={onChange('message')}
          placeholder={t(lang, 'How can our team help?', 'كيف يمكن لفريقنا مساعدتك؟', '¿Cómo puede ayudarte nuestro equipo?')} />
      </div>

      <button type="submit" disabled={status === 'sending'} className="btn btn-accent" style={{
        width: '100%', justifyContent: 'center', padding: '16px 22px', marginTop: 2,
        opacity: status === 'sending' ? 0.7 : 1, cursor: status === 'sending' ? 'wait' : 'pointer',
      }}>
        {status === 'sent' ? <><Icon name="check" size={14} stroke="#fff" />{t(lang, 'Sent', 'تم الإرسال', 'Enviado')}</>
          : status === 'sending' ? t(lang, 'Sending…', 'جارٍ الإرسال…', 'Enviando…')
          : <>{t(lang, 'Send message', 'إرسال الرسالة', 'Enviar mensaje')} <Arrow size={14} /></>}
      </button>

      {status === 'error' && (
        <div role="alert" style={{ fontSize: 13, color: '#b42318', background: '#fef3f2', border: '1px solid #fda29b', borderRadius: 2, padding: '12px 14px' }}>
          {t(lang,
            'Something went wrong. Please try again, or email info@bcisaudi.com.',
            'حدث خطأ. يرجى المحاولة مرة أخرى أو مراسلتنا على info@bcisaudi.com.',
            'Hubo un problema. Inténtalo de nuevo o escribe a info@bcisaudi.com.')}
        </div>
      )}
    </form>
  );
}

function ContactRow({ detail }) {
  const { lang } = useLang();
  const [hover, setHover] = useState_c(false);
  const label = detail.label[lang] || detail.label.en;
  const value = typeof detail.value === 'string' ? detail.value : (detail.value[lang] || detail.value.en);
  return (
    <a href={detail.href}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '20px 0',
        borderBottom: '1px solid var(--bci-hairline-light)', textDecoration: 'none',
        color: 'inherit', transition: 'background 100ms linear',
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 2,
        border: `1px solid ${hover ? 'var(--bci-navy)' : 'var(--bci-hairline-light)'}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: 'var(--bci-navy)', transition: 'border-color 120ms linear',
      }}>
        <Icon name={detail.icon} size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="eyebrow" style={{ color: 'var(--bci-steel)', marginBottom: 4 }}>{label}</div>
        <div style={{
          fontFamily: typeof detail.value === 'string' ? 'var(--ff-mono)' : lang === 'ar' ? 'var(--ff-arabic)' : 'var(--ff-sans)',
          fontSize: typeof detail.value === 'string' ? 17 : 16,
          fontWeight: 600, color: 'var(--bci-navy)',
          letterSpacing: typeof detail.value === 'string' ? '0.02em' : 0,
        }}>{value}</div>
      </div>
      <span style={{ color: hover ? 'var(--bci-green-500)' : 'var(--bci-steel)', transition: 'color 120ms linear' }}>
        <Arrow size={16} />
      </span>
    </a>
  );
}

function SocialBox({ name, href }) {
  const [hover, setHover] = useState_c(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      aria-label={name}
      style={{
        width: 40, height: 40, borderRadius: 2,
        border: `1px solid ${hover ? 'var(--bci-green-500)' : 'var(--bci-hairline-light)'}`,
        background: hover ? 'var(--bci-green-50)' : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: hover ? 'var(--bci-green-700)' : 'var(--bci-navy)',
        textDecoration: 'none', transition: 'all 120ms linear',
      }}>
      <Icon name={name} size={18} />
    </a>
  );
}

Object.assign(window, { Contact });
