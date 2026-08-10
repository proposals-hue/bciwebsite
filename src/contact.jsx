/* global React, useLang, t, Icon, Arrow, useInView, revealStyle, CustomerRfqForm */
const { useState: useState_c } = React;

// ---------- 05 · Contact ----------
function Contact() {
  const { lang } = useLang();
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
    <section ref={ref} id="contact" style={{ background: 'var(--bci-concrete)', padding: '140px 0' }}>
      <div className="container">
        <div className="sec-num" style={{ color: 'var(--bci-steel)', marginBottom: 24, ...revealStyle(inView, 0) }}>
          {t(lang, 'Contact', 'تواصل', 'Contacto')}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 80,
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
            <CustomerRfqForm source={typeof location !== 'undefined' && location.pathname === '/' ? 'homepage' : 'contact page'} />
          </div>
        </div>
      </div>
    </section>
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
