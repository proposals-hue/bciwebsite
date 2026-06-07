/* global React, useLang, t */

// ---------- Trusted-by · client wordmark wall (marquee) ----------

// Landmark clients & partners — real client wordmarks on uniform chips.
// ROSHN ships on its native dark-green, so its chip carries that colour.
const CLIENTS = [
  { name: 'Riyadh Metro', src: 'assets/logos/riyadh-metro.png' },
  { name: 'ROSHN Group', src: 'assets/logos/roshn.png', bg: '#0E3A2F' },
  { name: 'SABIC', src: 'assets/logos/sabic.png' },
  { name: 'King Salman Park', src: 'assets/logos/king-salman-park.png' },
  { name: "Ma'aden", src: 'assets/logos/maaden.png' },
  { name: 'Diriyah Gate', src: 'assets/logos/diriyah-gate.png' },
  { name: 'National Water Co.', src: 'assets/logos/nwc.png' },
  { name: 'Red Sea Global', src: 'assets/logos/red-sea-global.png' },
];

function LogoUnit({ c }) {
  return (
    <span className={'logo-chip' + (c.bg ? ' logo-chip--dark' : '')} title={c.name} style={c.bg ? { background: c.bg } : null}>
      <img className="logo-img" src={c.src} alt={c.name} loading="lazy" draggable="false" />
    </span>
  );
}

function TrustedBy() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  // Render the set twice for a seamless -50% loop.
  const loop = [...CLIENTS, ...CLIENTS];
  return (
    <section
      id="trusted"
      style={{
        background: 'var(--bci-paper)',
        borderTop: '1px solid var(--bci-hairline-light)',
        borderBottom: '1px solid var(--bci-hairline-light)',
        padding: '52px 0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          marginBottom: 34,
          flexDirection: isAr ? 'row-reverse' : 'row',
          textAlign: isAr ? 'right' : 'left',
        }}
      >
        <span
          style={{
            fontFamily: isAr ? 'var(--ff-arabic)' : 'var(--ff-mono)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: isAr ? '0.06em' : '0.14em',
            textTransform: 'uppercase',
            color: 'var(--bci-steel)',
            whiteSpace: 'nowrap',
          }}
        >
          {t(lang, 'Specified & trusted on the Kingdom\u2019s landmark projects', 'موثوقون في أبرز مشاريع المملكة', 'Especificados y confiables en los proyectos emblemáticos del Reino')}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--bci-hairline-light)' }} />
      </div>

      <div className="marquee-wrap" aria-label={t(lang, 'Client and partner organizations', 'العملاء والشركاء', 'Clientes y socios')}>
        <div className="marquee-track" style={{ gap: 20 }}>
          {loop.map((c, i) => (
            <LogoUnit key={i} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { TrustedBy });
