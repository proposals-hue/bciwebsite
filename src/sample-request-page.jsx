/* global React, ReactDOM, LangProvider, useLang, t,
   MegaHeader, PageHero, Footer, SampleRequestForm */

function SampleRequestPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Sample request', 'طلب عينات', 'Solicitud de muestras')}
        crumb={t(lang, 'Sample request', 'طلب عينات', 'Solicitud de muestras')}
        title="Try it on your own site first."
        titleAr="جرّبه في موقعك أولًا."
        titleEs="Pruébalo primero en tu obra."
        subtitle={t(lang,
          'Order free samples of any BCI product for a site trial. Tell us what you are applying it to and our sales team arranges the samples with their technical data sheets.',
          'اطلب عينات مجانية من أي منتج BCI لتجربتها في موقعك. أخبرنا بما ستطبقه عليه ويقوم فريق المبيعات بترتيب العينات مع نشراتها الفنية.',
          'Pide muestras gratuitas de cualquier producto BCI para una prueba en obra. Dinos dónde lo vas a aplicar y nuestro equipo comercial prepara las muestras con sus fichas técnicas.')}
      />

      <section style={{ background: 'var(--bci-concrete)', padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container">
          <div style={{ maxWidth: 960, marginInline: 'auto', textAlign: isAr ? 'right' : 'left' }}>
            <SampleRequestForm source="sample request page" maxWidth={960} />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader />
    <SampleRequestPage />
    <Footer />
  </LangProvider>
);
