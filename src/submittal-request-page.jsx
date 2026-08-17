/* global React, ReactDOM, LangProvider, useLang, t,
   MegaHeader, PageHero, Footer, SubmittalRequestForm */

function SubmittalRequestPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <main>
      <PageHero
        eyebrow={t(lang, 'Submittal request', 'طلب وثائق الاعتماد', 'Solicitud de documentación')}
        crumb={t(lang, 'Submittal request', 'طلب وثائق الاعتماد', 'Solicitud de documentación')}
        title="Get your product approved on the project."
        titleAr="اعتمد منتجك في المشروع."
        titleEs="Consigue la aprobación del producto en la obra."
        subtitle={t(lang,
          'Send the project specification and the BCI product you need approved. Our technical team prepares the submittal package — data sheets, certificates and compliance statements.',
          'أرسل مواصفات المشروع ومنتج BCI المطلوب اعتماده. يقوم فريقنا الفني بتجهيز ملف الاعتماد — النشرات الفنية والشهادات وبيانات المطابقة.',
          'Envía la especificación del proyecto y el producto BCI que necesitas aprobar. Nuestro equipo técnico prepara el paquete de aprobación: fichas técnicas, certificados y declaraciones de conformidad.')}
      />

      <section style={{ background: 'var(--bci-concrete)', padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container">
          <div style={{ maxWidth: 960, marginInline: 'auto', textAlign: isAr ? 'right' : 'left' }}>
            <SubmittalRequestForm source="submittal request page" maxWidth={960} />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <MegaHeader />
    <SubmittalRequestPage />
    <Footer />
  </LangProvider>
);
