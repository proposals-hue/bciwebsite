/* global React, ReactDOM, LangProvider, useLang, MegaHeader, Hero, About, WhyBCI,
   SolutionsOverview, Projects, CtaBand, Contact, Footer,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSlider, TweakColor */

const { useEffect: useEffect_app } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroBg": "video",
  "heroOverlay": 0.55,
  "heroVideoSpeed": 0.55,
  "accent": "#31B469"
}/*EDITMODE-END*/;

function HomeInner({ tweaks, setTweak }) {
  const { lang, setLang } = useLang();

  useEffect_app(() => {
    document.documentElement.style.setProperty('--bci-green-500', tweaks.accent);
  }, [tweaks.accent]);

  return (
    <>
      <MegaHeader active="Home" />
      <Hero overlayOpacity={tweaks.heroOverlay} bgStyle={tweaks.heroBg} videoSpeed={tweaks.heroVideoSpeed} />
      <About />
      <WhyBCI />
      <TrustedBy />
      <SolutionsOverview />
      <Projects limit={3} />
      <CtaBand />
      <Contact />
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Language">
          <TweakRadio label="Language" value={lang}
            options={[{ value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }, { value: 'ar', label: 'ع' }]}
            onChange={(v) => setLang(v)} />
        </TweakSection>
        <TweakSection label="Hero">
          <TweakRadio label="Background" value={tweaks.heroBg}
            options={[{ value: 'video', label: 'Video' }, { value: 'skyline', label: 'Skyline' }, { value: 'pattern', label: 'Pattern' }, { value: 'solid', label: 'Solid' }]}
            onChange={(v) => setTweak('heroBg', v)} />
          <TweakSlider label="Overlay opacity" value={tweaks.heroOverlay} min={0.2} max={0.9} step={0.05}
            onChange={(v) => setTweak('heroOverlay', v)} />
          <TweakSlider label="Video speed" value={tweaks.heroVideoSpeed} min={0.35} max={1} step={0.05}
            onChange={(v) => setTweak('heroVideoSpeed', v)} />
        </TweakSection>
        <TweakSection label="Color">
          <TweakColor label="Accent" value={tweaks.accent}
            options={['#31B469', '#0E5E6F', '#F0B62B', '#0B3752', '#1E7C47']}
            onChange={(v) => setTweak('accent', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <LangProvider>
      <HomeInner tweaks={tweaks} setTweak={setTweak} />
    </LangProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
