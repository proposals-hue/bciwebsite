/* global React, ReactDOM, LangProvider, useLang, t,
   MegaHeader, PageHero, Footer, CustomerRfqForm */

function RequestQuotePage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Request a quote', 'اطلب عرض سعر', 'Solicitar cotización')}
        crumb={t(lang, 'Request a quote', 'طلب عرض سعر', 'Solicitar cotización')}
        title="Tell us what your project needs."
        titleAr="أخبرنا بما يحتاجه مشروعك."
        titleEs="Cuéntanos qué necesita tu proyecto."
        subtitle={t(lang,
          'Choose BCI products, add quantities and project details, then send your request directly to our sales team.',
          'اختر منتجات BCI وأضف الكميات وتفاصيل المشروع، ثم أرسل طلبك مباشرة إلى فريق المبيعات.',
          'Elige productos BCI, añade cantidades y datos del proyecto, y envía tu solicitud directamente a nuestro equipo comercial.')}
      />

      <section style={{ background: 'var(--bci-concrete)', padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container">
          <div style={{ maxWidth: 960, marginInline: 'auto', textAlign: isAr ? 'right' : 'left' }}>
            <CustomerRfqForm source="request quote page" maxWidth={960} />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader />
    <RequestQuotePage />
    <Footer />
  </LangProvider>
);
