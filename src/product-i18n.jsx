/* global window */
/* =============================================================
   BCI — Product description i18n overlay
   --------------------------------------------------------------
   Maps each product CODE → cleaned English + Arabic + Spanish
   description. Loaded right AFTER data.jsx; the IIFE at the foot
   merges these onto window.SOLUTIONS (by code), so the ERP sync
   — which overwrites English and duplicates it into ar/es — is
   re-localised on every page load. Missing codes fall back to the
   English already in data.jsx.

   Product NAMES are brand codes ("BC Proof 330") and are never
   translated. Re-run build/extract-products.mjs after the catalog
   grows to find untranslated products.
   ============================================================= */
const PRODUCT_I18N = {
  /* ===== 01 · Waterproofing & Roofing ===== */
  'BC 715 Injection Grout': {
    en: 'BC 715 Injection Grout is a two-component, low-viscosity polyurethane resin system for the elastic sealing of cracks and voids in concrete and masonry, in both wet and dry conditions.',
    ar: 'BC 715 Injection Grout هو نظام راتنج بولي يوريثان ثنائي المكوّن ومنخفض اللزوجة، مصمم للإغلاق المرن للشقوق والفراغات في الخرسانة والمباني، في الظروف الرطبة والجافة على حد سواء.',
    es: 'BC 715 Injection Grout es un sistema de resina de poliuretano bicomponente y de baja viscosidad para el sellado elástico de fisuras y huecos en hormigón y mampostería, tanto en condiciones húmedas como secas.',
  },
  'BC Aluminum-Faced Flexible Flashing': {
    en: 'BC Aluminum-Faced Flexible Flashing is a self-adhesive, multi-layer waterproofing tape reinforced with an aluminium surface for superior weather and UV resistance. It seals joints, roofs, ducts and penetrations durably while conforming easily to irregular surfaces.',
    ar: 'BC Aluminum-Faced Flexible Flashing هو شريط عزل مائي ذاتي اللصق متعدد الطبقات ومدعّم بسطح من الألمنيوم لمقاومة فائقة للعوامل الجوية والأشعة فوق البنفسجية. يوفّر إغلاقًا متينًا للوصلات والأسطح والقنوات والاختراقات مع تطويعه بسهولة للأسطح غير المنتظمة.',
    es: 'BC Aluminum-Faced Flexible Flashing es una cinta impermeabilizante autoadhesiva y multicapa, reforzada con una superficie de aluminio para una resistencia superior a la intemperie y los rayos UV. Sella juntas, cubiertas, conductos y penetraciones de forma duradera y se adapta fácilmente a superficies irregulares.',
  },
  'BC Bitu Classic 160': {
    en: 'BC Bitu Classic 160 is a torch-applied, APP (atactic polypropylene) modified, reinforced plastomeric bituminous waterproofing membrane offering excellent heat resistance, dimensional stability and long-term protection for roofs and foundations.',
    ar: 'BC Bitu Classic 160 هو غشاء عزل مائي بيتوميني بلاستومري مدعّم ومعدّل بمادة APP (البولي بروبيلين الأتكتيكي) يُطبّق باللهب، يوفّر مقاومة ممتازة للحرارة وثباتًا في الأبعاد وحمايةً طويلة الأمد للأسطح والأساسات.',
    es: 'BC Bitu Classic 160 es una membrana impermeabilizante bituminosa plastomérica reforzada, modificada con APP (polipropileno atáctico) y aplicada con soplete, que ofrece excelente resistencia al calor, estabilidad dimensional y protección duradera para cubiertas y cimentaciones.',
  },
  'BC Bitu Classic 180': {
    en: 'BC Bitu Classic 180 is a torch-applied, APP (atactic polypropylene) modified, reinforced plastomeric bituminous waterproofing membrane offering excellent heat resistance, dimensional stability and long-term protection for roofs and foundations.',
    ar: 'BC Bitu Classic 180 هو غشاء عزل مائي بيتوميني بلاستومري مدعّم ومعدّل بمادة APP (البولي بروبيلين الأتكتيكي) يُطبّق باللهب، يوفّر مقاومة ممتازة للحرارة وثباتًا في الأبعاد وحمايةً طويلة الأمد للأسطح والأساسات.',
    es: 'BC Bitu Classic 180 es una membrana impermeabilizante bituminosa plastomérica reforzada, modificada con APP (polipropileno atáctico) y aplicada con soplete, que ofrece excelente resistencia al calor, estabilidad dimensional y protección duradera para cubiertas y cimentaciones.',
  },
  'BC Bitu Classic 200': {
    en: 'BC Bitu Classic 200 (APP) is a torch-applied, atactic-polypropylene modified, reinforced plastomeric bituminous waterproofing membrane offering excellent heat resistance, dimensional stability and long-term protection for roofs and foundations.',
    ar: 'BC Bitu Classic 200 (APP) هو غشاء عزل مائي بيتوميني بلاستومري مدعّم ومعدّل بالبولي بروبيلين الأتكتيكي يُطبّق باللهب، يوفّر مقاومة ممتازة للحرارة وثباتًا في الأبعاد وحمايةً طويلة الأمد للأسطح والأساسات.',
    es: 'BC Bitu Classic 200 (APP) es una membrana impermeabilizante bituminosa plastomérica reforzada, modificada con polipropileno atáctico y aplicada con soplete, que ofrece excelente resistencia al calor, estabilidad dimensional y protección duradera para cubiertas y cimentaciones.',
  },
  'BC Bitu Classic 250': {
    en: 'BC Bitu Classic 250 (slated) is a high-performance, torch-applied APP-modified bituminous waterproofing membrane reinforced with a 250 gsm non-woven polyester mat.',
    ar: 'BC Bitu Classic 250 (مكسوّ بالحصى) هو غشاء عزل مائي بيتوميني عالي الأداء معدّل بمادة APP ويُطبّق باللهب، مدعّم بطبقة بوليستر غير منسوجة بوزن 250 جم/م².',
    es: 'BC Bitu Classic 250 (pizarrado) es una membrana impermeabilizante bituminosa de alto rendimiento, modificada con APP y aplicada con soplete, reforzada con un fieltro de poliéster no tejido de 250 g/m².',
  },
  'BC Bitu Classic Fiber': {
    en: 'BC Bitu Classic Fiber is a high-quality, torch-applied, APP-modified bituminous waterproofing membrane made from premium bitumen and atactic-polypropylene polymers, reinforced with a high-strength fibreglass mat for excellent dimensional stability and waterproofing performance.',
    ar: 'BC Bitu Classic Fiber هو غشاء عزل مائي بيتوميني عالي الجودة معدّل بمادة APP ويُطبّق باللهب، مصنوع من بيتومين فاخر وبوليمرات البولي بروبيلين الأتكتيكي ومدعّم بطبقة من الألياف الزجاجية عالية القوة لثبات أبعاد وأداء عزل ممتازين.',
    es: 'BC Bitu Classic Fiber es una membrana impermeabilizante bituminosa de alta calidad, modificada con APP y aplicada con soplete, fabricada con betún de primera y polímeros de polipropileno atáctico, reforzada con un fieltro de fibra de vidrio de alta resistencia para una excelente estabilidad dimensional e impermeabilización.',
  },
  'BC Bitu Gold 160': {
    en: 'BC Bitu Gold 160 (slated) is a high-performance, prefabricated, torch-applied waterproofing membrane made from premium bitumen modified with SBS (styrene-butadiene-styrene) polymers, providing exceptional elasticity, flexibility and resistance to ageing.',
    ar: 'BC Bitu Gold 160 (مكسوّ بالحصى) هو غشاء عزل مائي عالي الأداء سابق التصنيع يُطبّق باللهب، مصنوع من بيتومين فاخر معدّل ببوليمرات SBS (ستايرين-بوتادايين-ستايرين)، يوفّر مرونةً ولدونةً استثنائيتين ومقاومةً للتقادم.',
    es: 'BC Bitu Gold 160 (pizarrado) es una membrana impermeabilizante prefabricada de alto rendimiento, aplicada con soplete, fabricada con betún de primera calidad modificado con polímeros SBS (estireno-butadieno-estireno), que aporta una elasticidad y flexibilidad excepcionales y resistencia al envejecimiento.',
  },
  'BC Bitu Gold 180': {
    en: 'BC Bitu Gold 180 (slated) is a high-performance, prefabricated, torch-applied waterproofing membrane made from premium bitumen modified with SBS (styrene-butadiene-styrene) polymers, providing exceptional elasticity, flexibility and resistance to ageing.',
    ar: 'BC Bitu Gold 180 (مكسوّ بالحصى) هو غشاء عزل مائي عالي الأداء سابق التصنيع يُطبّق باللهب، مصنوع من بيتومين فاخر معدّل ببوليمرات SBS (ستايرين-بوتادايين-ستايرين)، يوفّر مرونةً ولدونةً استثنائيتين ومقاومةً للتقادم.',
    es: 'BC Bitu Gold 180 (pizarrado) es una membrana impermeabilizante prefabricada de alto rendimiento, aplicada con soplete, fabricada con betún de primera calidad modificado con polímeros SBS (estireno-butadieno-estireno), que aporta una elasticidad y flexibilidad excepcionales y resistencia al envejecimiento.',
  },
  'BC Bitu Gold 200': {
    en: 'BC Bitu Gold 200 (slated) is a high-performance, prefabricated, torch-applied waterproofing membrane made from premium bitumen modified with SBS (styrene-butadiene-styrene) polymers, providing exceptional elasticity, flexibility and resistance to ageing.',
    ar: 'BC Bitu Gold 200 (مكسوّ بالحصى) هو غشاء عزل مائي عالي الأداء سابق التصنيع يُطبّق باللهب، مصنوع من بيتومين فاخر معدّل ببوليمرات SBS (ستايرين-بوتادايين-ستايرين)، يوفّر مرونةً ولدونةً استثنائيتين ومقاومةً للتقادم.',
    es: 'BC Bitu Gold 200 (pizarrado) es una membrana impermeabilizante prefabricada de alto rendimiento, aplicada con soplete, fabricada con betún de primera calidad modificado con polímeros SBS (estireno-butadieno-estireno), que aporta una elasticidad y flexibilidad excepcionales y resistencia al envejecimiento.',
  },
  'BC Bitu Gold Fiber': {
    en: 'BC Bitu Gold Fiber (slated) is a high-performance, prefabricated, torch-applied waterproofing membrane made from high-grade bitumen modified with SBS (styrene-butadiene-styrene) polymers, offering exceptional elasticity and flexibility even at low temperatures.',
    ar: 'BC Bitu Gold Fiber (مكسوّ بالحصى) هو غشاء عزل مائي عالي الأداء سابق التصنيع يُطبّق باللهب، مصنوع من بيتومين عالي الجودة معدّل ببوليمرات SBS (ستايرين-بوتادايين-ستايرين)، يوفّر مرونةً ولدونةً استثنائيتين حتى في درجات الحرارة المنخفضة.',
    es: 'BC Bitu Gold Fiber (pizarrado) es una membrana impermeabilizante prefabricada de alto rendimiento, aplicada con soplete, fabricada con betún de alta calidad modificado con polímeros SBS (estireno-butadieno-estireno), que ofrece una elasticidad y flexibilidad excepcionales incluso a bajas temperaturas.',
  },
  'BC Bitumen Primer': {
    en: 'BC Bitumen Primer is a high-performance, cold-applied, fast-curing primer based on oxidised bitumen and fast-evaporating solvents, with wetting and adhesion-promoting additives that ensure excellent bonding of bituminous membranes and waterproofing systems to a variety of substrates.',
    ar: 'BC Bitumen Primer هو برايمر عالي الأداء سريع الجفاف يُطبّق على البارد، يعتمد على البيتومين المؤكسد والمذيبات سريعة التبخّر، ومعزّز بإضافات للترطيب وتحسين الالتصاق تضمن ربطًا ممتازًا للأغشية البيتومينية وأنظمة العزل المائي بمختلف الأسطح.',
    es: 'BC Bitumen Primer es una imprimación de alto rendimiento, de curado rápido y aplicación en frío, a base de betún oxidado y disolventes de evaporación rápida, con aditivos humectantes y promotores de adherencia que garantizan una excelente unión de las membranas bituminosas y los sistemas de impermeabilización a diversos sustratos.',
  },
  'BC Crysto Proof': {
    en: 'BC Crysto Proof is a high-performance powdered crystalline admixture for integral concrete waterproofing. It reacts with moisture to form needle-shaped crystals that seal pores, voids and microcracks for long-term durability. Supplied in 20 kg bags.',
    ar: 'BC Crysto Proof هو إضافة بلورية مسحوقة عالية الأداء للعزل المائي المتكامل للخرسانة. تتفاعل مع الرطوبة لتكوين بلورات إبرية الشكل تسدّ المسام والفراغات والشقوق الدقيقة لمتانة طويلة الأمد. يُورّد في أكياس 20 كجم.',
    es: 'BC Crysto Proof es un aditivo cristalino en polvo de alto rendimiento para la impermeabilización integral del hormigón. Reacciona con la humedad formando cristales en forma de aguja que sellan poros, huecos y microfisuras para una durabilidad prolongada. Se suministra en sacos de 20 kg.',
  },
  'BC Damp Proof': {
    en: 'BC Damp Proof is a low-viscosity, high-penetration, cold-applied bituminous primer (200 kg drum) with 3.5–12 m²/L coverage depending on substrate, used to seal porous surfaces and promote adhesion of bituminous waterproofing systems and sheet coverings.',
    ar: 'BC Damp Proof هو برايمر بيتوميني منخفض اللزوجة وعالي النفاذية يُطبّق على البارد (برميل 200 كجم)، بتغطية 3.5–12 م²/لتر حسب السطح، يُستخدم لإحكام الأسطح المسامية وتعزيز التصاق أنظمة العزل المائي البيتومينية والأغطية اللفائفية.',
    es: 'BC Damp Proof es una imprimación bituminosa de baja viscosidad, alta penetración y aplicación en frío (bidón de 200 kg), con un rendimiento de 3,5–12 m²/L según el sustrato, utilizada para sellar superficies porosas y favorecer la adherencia de sistemas de impermeabilización bituminosos y láminas.',
  },
  'BC Geotextile': {
    en: 'BC Geotextile (100 g/m²) is a non-woven polyester/polypropylene fabric for filtration, separation and soil stabilisation in civil-engineering works. It offers excellent permeability, durability and puncture resistance — ideal for roads, drainage systems and landscaping.',
    ar: 'BC Geotextile (100 جم/م²) هو نسيج غير منسوج من البوليستر/البولي بروبيلين للترشيح والفصل وتثبيت التربة في الأعمال المدنية. يوفّر نفاذيةً ومتانةً ومقاومةً للثقب ممتازة — مثالي للطرق وأنظمة الصرف وتنسيق المواقع.',
    es: 'BC Geotextile (100 g/m²) es un tejido no tejido de poliéster/polipropileno para filtración, separación y estabilización de suelos en obras de ingeniería civil. Ofrece excelente permeabilidad, durabilidad y resistencia al punzonamiento, ideal para carreteras, sistemas de drenaje y paisajismo.',
  },
  'BC Guard': {
    en: 'BC Guard (black) is a single-component, heavy-duty, water-based acrylic waterproofing coating (20 kg pail, 0.55 m²/L at 1 mm) that delivers flexible, long-lasting protection against water and moisture with excellent crack-bridging and puncture resistance.',
    ar: 'BC Guard (أسود) هو طلاء عزل مائي أكريليكي أحادي المكوّن وثقيل الخدمة يعتمد على الماء (عبوة 20 كجم، 0.55 م²/لتر عند 1 مم)، يمنح حمايةً مرنةً وطويلة الأمد ضد الماء والرطوبة مع قدرة ممتازة على ردم الشقوق ومقاومة الثقب.',
    es: 'BC Guard (negro) es un recubrimiento impermeabilizante acrílico monocomponente de servicio pesado y base acuosa (cubeta de 20 kg, 0,55 m²/L a 1 mm) que ofrece protección flexible y duradera contra el agua y la humedad, con excelente puenteo de fisuras y resistencia al punzonamiento.',
  },
  'BC Guard Fl 100': {
    en: 'BC Guard Fl 100 is a high-performance, cold-applied, water-based acrylic elastomeric waterproofing coating. It cures to a seamless, flexible, UV-resistant membrane that gives long-term protection against water ingress, weathering and temperature fluctuations.',
    ar: 'BC Guard Fl 100 هو طلاء عزل مائي أكريليكي مطاطي عالي الأداء يعتمد على الماء ويُطبّق على البارد. يتصلّب مكوّنًا غشاءً متجانسًا ومرنًا ومقاومًا للأشعة فوق البنفسجية يوفّر حمايةً طويلة الأمد ضد تسرّب الماء وعوامل الطقس وتقلّبات الحرارة.',
    es: 'BC Guard Fl 100 es un recubrimiento impermeabilizante acrílico elastomérico de alto rendimiento, de base acuosa y aplicación en frío. Cura formando una membrana continua, flexible y resistente a los rayos UV que protege a largo plazo frente a la entrada de agua, la intemperie y las variaciones de temperatura.',
  },
  'BC Guard LC 500': {
    en: 'BC Guard LC 500 is a water-based acrylic waterproofing coating from BCI’s waterproofing & roofing range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Guard LC 500 هو طلاء عزل مائي أكريليكي يعتمد على الماء ضمن مجموعة العزل المائي والأسطح من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Guard LC 500 es un recubrimiento impermeabilizante acrílico de base acuosa de la gama de impermeabilización y cubiertas de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Lastic 1K': {
    en: 'BC Lastic 1K is a one-component, crack-bridging, fibre-reinforced cementitious mortar modified with alkali-resistant polymers. It provides flexible waterproofing and concrete protection and can be applied by brush, roller, trowel or mechanical spray — only water is needed for mixing.',
    ar: 'BC Lastic 1K هو مونة إسمنتية أحادية المكوّن رادمة للشقوق ومدعّمة بالألياف ومعدّلة ببوليمرات مقاومة للقلويات. توفّر عزلًا مائيًا مرنًا وحمايةً للخرسانة، ويمكن تطبيقها بالفرشاة أو الرول أو المالج أو الرش الآلي — ولا تتطلّب سوى الماء للخلط.',
    es: 'BC Lastic 1K es un mortero cementoso monocomponente, puenteador de fisuras y reforzado con fibras, modificado con polímeros resistentes a los álcalis. Proporciona impermeabilización flexible y protección del hormigón y puede aplicarse con brocha, rodillo, llana o proyección mecánica; solo requiere agua para su mezcla.',
  },
  'BC Polythelene Sheet': {
    en: 'BC Polyethylene Sheet is a durable, flexible plastic sheet used as a moisture barrier, protection layer and vapour retarder in construction applications.',
    ar: 'BC Polythelene Sheet هو لوح بلاستيكي متين ومرن من البولي إيثيلين يُستخدم كحاجز للرطوبة وطبقة حماية ومانع لبخار الماء في تطبيقات البناء.',
    es: 'BC Polythelene Sheet es una lámina plástica de polietileno duradera y flexible que se utiliza como barrera de humedad, capa de protección y retardador de vapor en aplicaciones de construcción.',
  },
  'BC Proof 100': {
    en: 'BC Proof 100 is a two-component, acrylic-modified cementitious waterproof coating made up of a polymeric liquid (Part B) and a specially formulated cementitious powder (Part A).',
    ar: 'BC Proof 100 هو طلاء عزل مائي إسمنتي ثنائي المكوّن معدّل بالأكريليك، يتكوّن من سائل بوليمري (الجزء B) ومسحوق إسمنتي مُركّب خصيصًا (الجزء A).',
    es: 'BC Proof 100 es un recubrimiento impermeabilizante cementoso bicomponente, modificado con acrílico, compuesto por un líquido polimérico (parte B) y un polvo cementoso especialmente formulado (parte A).',
  },
  'BC Proof 330': {
    en: 'BC Proof 330 is a high-performance, two-component, 100%-solids, fast-curing aliphatic pure-polyurea waterproofing membrane for exposed roofing, terraces, balconies and any area needing excellent UV stability, durability and long-term protection.',
    ar: 'BC Proof 330 هو غشاء عزل مائي من البولي يوريا النقي الأليفاتي عالي الأداء، ثنائي المكوّن، صلب بنسبة 100% وسريع التصلّب، مخصّص للأسطح المكشوفة والتراسات والشرفات وكل منطقة تتطلّب ثباتًا ممتازًا تجاه الأشعة فوق البنفسجية ومتانةً وحمايةً طويلة الأمد.',
    es: 'BC Proof 330 es una membrana impermeabilizante de poliurea pura alifática de alto rendimiento, bicomponente, 100% sólidos y de curado rápido, para cubiertas expuestas, terrazas, balcones y cualquier zona que requiera excelente estabilidad UV, durabilidad y protección a largo plazo.',
  },
  'BC Proof PU': {
    en: 'BC Proof PU is a single-component, moisture-curing, tar-extended polyurethane liquid-applied elastomeric membrane for the waterproofing and protection of a wide range of surfaces.',
    ar: 'BC Proof PU هو غشاء مطاطي بولي يوريثاني سائل التطبيق، أحادي المكوّن ويتصلّب بالرطوبة ومدعّم بالقطران، للعزل المائي وحماية مجموعة واسعة من الأسطح.',
    es: 'BC Proof PU es una membrana elastomérica de poliuretano de aplicación líquida, monocomponente, de curado por humedad y modificada con alquitrán, para la impermeabilización y protección de una amplia variedad de superficies.',
  },
  'BC Proof PU WB': {
    en: 'BC Proof PU WB is a one-component, cold-applied, water-based polyurethane waterproofing membrane that forms a seamless, flexible and durable protective coating for roofs, balconies, terraces, wet areas and concrete structures.',
    ar: 'BC Proof PU WB هو غشاء عزل مائي بولي يوريثاني أحادي المكوّن يعتمد على الماء ويُطبّق على البارد، يكوّن طلاءً واقيًا متجانسًا ومرنًا ومتينًا للأسطح والشرفات والتراسات والمناطق الرطبة والمنشآت الخرسانية.',
    es: 'BC Proof PU WB es una membrana impermeabilizante de poliuretano monocomponente, de base acuosa y aplicación en frío, que forma un recubrimiento protector continuo, flexible y duradero para cubiertas, balcones, terrazas, zonas húmedas y estructuras de hormigón.',
  },
  'BC Proof RBC 100': {
    en: 'BC Proof RBC 100 is a high-performance, water-based, cold-applied rubber-reinforced bituminous compound. Formulated with hard bitumen, mineral stabilisers, synthetic resins and polymers, it cures to a tough, elastic, weather-resistant waterproof film.',
    ar: 'BC Proof RBC 100 هو مركّب بيتوميني مدعّم بالمطاط عالي الأداء يعتمد على الماء ويُطبّق على البارد. مُركّب من بيتومين صلب ومثبّتات معدنية وراتنجات صناعية وبوليمرات، يتصلّب مكوّنًا غشاءً عازلًا متينًا ومرنًا ومقاومًا للعوامل الجوية.',
    es: 'BC Proof RBC 100 es un compuesto bituminoso reforzado con caucho de alto rendimiento, de base acuosa y aplicación en frío. Formulado con betún duro, estabilizadores minerales, resinas sintéticas y polímeros, cura formando una película impermeable tenaz, elástica y resistente a la intemperie.',
  },
  'BC Protect': {
    en: 'BC Protect is a torch-applied, semi-rigid bituminous protection board reinforced with double layers of non-woven polyester. It protects waterproofing membranes and coatings from mechanical damage, sharp aggregates and backfilling stress during construction.',
    ar: 'BC Protect هو لوح حماية بيتوميني شبه صلب يُطبّق باللهب ومدعّم بطبقتين من البوليستر غير المنسوج. يحمي أغشية وطلاءات العزل المائي من التلف الميكانيكي والركام الحاد وإجهاد الردم أثناء الإنشاء.',
    es: 'BC Protect es una placa de protección bituminosa semirrígida, aplicada con soplete y reforzada con dobles capas de poliéster no tejido. Protege las membranas y recubrimientos de impermeabilización frente a daños mecánicos, áridos cortantes y los esfuerzos del relleno durante la construcción.',
  },
  'BC PUR Injection': {
    en: 'BC PUR Injection is a two-component, very-low-viscosity, solvent-free polyurethane injection resin. On contact with water it reacts to form a uniform, closed, watertight and elastic pore structure that ensures long-term sealing performance.',
    ar: 'BC PUR Injection هو راتنج حقن بولي يوريثاني ثنائي المكوّن منخفض اللزوجة جدًا وخالٍ من المذيبات. عند ملامسته للماء يتفاعل مكوّنًا بنيةً مساميةً منتظمةً ومغلقةً ومانعةً للماء ومرنة تضمن أداء إغلاق طويل الأمد.',
    es: 'BC PUR Injection es una resina de inyección de poliuretano bicomponente, de muy baja viscosidad y sin disolventes. Al contacto con el agua reacciona formando una estructura de poros uniforme, cerrada, estanca y elástica que garantiza un sellado duradero.',
  },
  'BC PVC Mambran': {
    en: 'BC PVC 1500-UV is a high-performance, calendered and extruded single-ply PVC waterproofing membrane, 1.5 mm thick, internally reinforced with a high-tenacity polyester mesh and formulated to resist UV radiation and harsh weathering for long-term durability and dimensional stability.',
    ar: 'BC PVC 1500-UV هو غشاء عزل مائي من PVC أحادي الطبقة عالي الأداء، مُكلندَر ومبثوق بسماكة 1.5 مم، مدعّم داخليًا بشبكة بوليستر عالية المتانة ومُركّب لمقاومة الأشعة فوق البنفسجية والعوامل الجوية القاسية لمتانة وثبات أبعاد طويلي الأمد.',
    es: 'BC PVC 1500-UV es una membrana impermeabilizante de PVC monocapa de alto rendimiento, calandrada y extruida, de 1,5 mm de espesor, reforzada interiormente con una malla de poliéster de alta tenacidad y formulada para resistir la radiación UV y la intemperie severa, con durabilidad y estabilidad dimensional a largo plazo.',
  },
  'BC PVC Membrane': {
    en: 'BC PVC 1200 is a high-performance, calendered and extruded PVC waterproofing membrane with a nominal thickness of 1.20 mm, engineered for long-term watertight integrity, excellent mechanical strength and superior dimensional stability.',
    ar: 'BC PVC 1200 هو غشاء عزل مائي من PVC عالي الأداء، مُكلندَر ومبثوق بسماكة اسمية 1.20 مم، مصمَّم لتحقيق إحكام مائي طويل الأمد وقوة ميكانيكية ممتازة وثبات أبعاد فائق.',
    es: 'BC PVC 1200 es una membrana impermeabilizante de PVC de alto rendimiento, calandrada y extruida, con un espesor nominal de 1,20 mm, diseñada para una estanqueidad duradera, excelente resistencia mecánica y una estabilidad dimensional superior.',
  },
  'BC Roof 420': {
    en: 'BC Roof 420 is a high-performance, single-component elastomeric waterproofing coating based on advanced polymeric compounds. It cures to a flexible, seamless, UV-resistant protective membrane suitable for both interior and exterior applications.',
    ar: 'BC Roof 420 هو طلاء عزل مائي مطاطي أحادي المكوّن عالي الأداء يعتمد على مركّبات بوليمرية متقدّمة. يتصلّب مكوّنًا غشاءً واقيًا مرنًا ومتجانسًا ومقاومًا للأشعة فوق البنفسجية، مناسبًا للتطبيقات الداخلية والخارجية.',
    es: 'BC Roof 420 es un recubrimiento impermeabilizante elastomérico monocomponente de alto rendimiento basado en compuestos poliméricos avanzados. Cura formando una membrana protectora flexible, continua y resistente a los rayos UV, apta para aplicaciones interiores y exteriores.',
  },
  'BC Roof Coat': {
    en: 'BC Roof Coat is a single-component, heavy-duty, water-based acrylic waterproofing system that forms a flexible, UV-resistant barrier with excellent puncture resistance and long-lasting protection. Supplied in 20 kg pails.',
    ar: 'BC Roof Coat هو نظام عزل مائي أكريليكي أحادي المكوّن وثقيل الخدمة يعتمد على الماء، يكوّن حاجزًا مرنًا مقاومًا للأشعة فوق البنفسجية بمقاومة ممتازة للثقب وحماية طويلة الأمد. يُورّد في عبوات 20 كجم.',
    es: 'BC Roof Coat es un sistema impermeabilizante acrílico monocomponente de servicio pesado y base acuosa que forma una barrera flexible y resistente a los rayos UV, con excelente resistencia al punzonamiento y protección duradera. Se suministra en cubetas de 20 kg.',
  },
  'BC Roof Coat LC': {
    en: 'BC Roof Coat LC is a single-component, heavy-duty, water-based acrylic waterproofing system that forms a flexible, UV-resistant barrier with excellent puncture resistance and long-lasting protection. Supplied in 20 kg pails.',
    ar: 'BC Roof Coat LC هو نظام عزل مائي أكريليكي أحادي المكوّن وثقيل الخدمة يعتمد على الماء، يكوّن حاجزًا مرنًا مقاومًا للأشعة فوق البنفسجية بمقاومة ممتازة للثقب وحماية طويلة الأمد. يُورّد في عبوات 20 كجم.',
    es: 'BC Roof Coat LC es un sistema impermeabilizante acrílico monocomponente de servicio pesado y base acuosa que forma una barrera flexible y resistente a los rayos UV, con excelente resistencia al punzonamiento y protección duradera. Se suministra en cubetas de 20 kg.',
  },
  'BC Roof Guard': {
    en: 'BC Roof Guard is a single-component, heavy-duty, water-based acrylic waterproofing coating (20 kg pail, 0.55 m²/L at 1 mm) for flexible, long-lasting protection against water and moisture, with excellent crack-bridging and puncture resistance.',
    ar: 'BC Roof Guard هو طلاء عزل مائي أكريليكي أحادي المكوّن وثقيل الخدمة يعتمد على الماء (عبوة 20 كجم، 0.55 م²/لتر عند 1 مم)، لحماية مرنة وطويلة الأمد ضد الماء والرطوبة مع قدرة ممتازة على ردم الشقوق ومقاومة الثقب.',
    es: 'BC Roof Guard es un recubrimiento impermeabilizante acrílico monocomponente de servicio pesado y base acuosa (cubeta de 20 kg, 0,55 m²/L a 1 mm) para una protección flexible y duradera contra el agua y la humedad, con excelente puenteo de fisuras y resistencia al punzonamiento.',
  },
  'BC Seal': {
    en: 'BC Seal is a two-component, acrylic-modified cementitious waterproofing coating (30 kg set, 2 kg/m² at 1 mm) for flexible, durable protection against water and chemical ingress on concrete and masonry surfaces.',
    ar: 'BC Seal هو طلاء عزل مائي إسمنتي ثنائي المكوّن معدّل بالأكريليك (طقم 30 كجم، 2 كجم/م² عند 1 مم) لحماية مرنة ومتينة ضد تسرّب الماء والمواد الكيميائية على أسطح الخرسانة والمباني.',
    es: 'BC Seal es un recubrimiento impermeabilizante cementoso bicomponente, modificado con acrílico (juego de 30 kg, 2 kg/m² a 1 mm), para una protección flexible y duradera frente a la entrada de agua y agentes químicos en superficies de hormigón y mampostería.',
  },
  'BC Seal 105': {
    en: 'BC Seal 105 is a two-component, acrylic-modified cementitious waterproofing coating (20 kg set, 2 kg/m² at 1 mm) for flexible, durable protection against water and chemical ingress on concrete and masonry surfaces.',
    ar: 'BC Seal 105 هو طلاء عزل مائي إسمنتي ثنائي المكوّن معدّل بالأكريليك (طقم 20 كجم، 2 كجم/م² عند 1 مم) لحماية مرنة ومتينة ضد تسرّب الماء والمواد الكيميائية على أسطح الخرسانة والمباني.',
    es: 'BC Seal 105 es un recubrimiento impermeabilizante cementoso bicomponente, modificado con acrílico (juego de 20 kg, 2 kg/m² a 1 mm), para una protección flexible y duradera frente a la entrada de agua y agentes químicos en superficies de hormigón y mampostería.',
  },
  'BC Seal 107': {
    en: 'BC Seal 107 is a two-component, acrylic-modified cementitious waterproofing coating (30 kg set, 2 kg/m² at 1 mm) for flexible, durable protection against water and chemical ingress on concrete and masonry surfaces.',
    ar: 'BC Seal 107 هو طلاء عزل مائي إسمنتي ثنائي المكوّن معدّل بالأكريليك (طقم 30 كجم، 2 كجم/م² عند 1 مم) لحماية مرنة ومتينة ضد تسرّب الماء والمواد الكيميائية على أسطح الخرسانة والمباني.',
    es: 'BC Seal 107 es un recubrimiento impermeabilizante cementoso bicomponente, modificado con acrílico (juego de 30 kg, 2 kg/m² a 1 mm), para una protección flexible y duradera frente a la entrada de agua y agentes químicos en superficies de hormigón y mampostería.',
  },
  'BC Seal 109': {
    en: 'BC Seal 109 is a two-component, acrylic-modified cementitious waterproofing coating (25 kg set, 2 kg/m² at 1 mm) for flexible, durable protection against water and chemical ingress on concrete and masonry surfaces.',
    ar: 'BC Seal 109 هو طلاء عزل مائي إسمنتي ثنائي المكوّن معدّل بالأكريليك (طقم 25 كجم، 2 كجم/م² عند 1 مم) لحماية مرنة ومتينة ضد تسرّب الماء والمواد الكيميائية على أسطح الخرسانة والمباني.',
    es: 'BC Seal 109 es un recubrimiento impermeabilizante cementoso bicomponente, modificado con acrílico (juego de 25 kg, 2 kg/m² a 1 mm), para una protección flexible y duradera frente a la entrada de agua y agentes químicos en superficies de hormigón y mampostería.',
  },
  'BC Shield': {
    en: 'BC Shield is a one-component, cold-applied, moisture-triggered modified-polyurethane waterproofing membrane (20 kg pail, 19.0 m² at 500 µm) for seamless, elastic and durable protection on roofs, decks, terraces and below-ground structures.',
    ar: 'BC Shield هو غشاء عزل مائي من البولي يوريثان المعدّل، أحادي المكوّن ويُطبّق على البارد ويتنشّط بالرطوبة (عبوة 20 كجم، 19.0 م² عند 500 ميكرون)، لحماية متجانسة ومرنة ومتينة على الأسطح والبلاطات والتراسات والمنشآت تحت الأرض.',
    es: 'BC Shield es una membrana impermeabilizante de poliuretano modificado, monocomponente, de aplicación en frío y activada por humedad (cubeta de 20 kg, 19,0 m² a 500 µm), para una protección continua, elástica y duradera en cubiertas, losas, terrazas y estructuras enterradas.',
  },
  'BC Tar Coat': {
    en: 'BC Tar Coat is a two-component, solvent-free, high-build coal-tar epoxy coating with excellent adhesion to concrete and steel, providing durable protection against moisture and corrosion.',
    ar: 'BC Tar Coat هو طلاء إيبوكسي قطراني فحمي ثنائي المكوّن وخالٍ من المذيبات وعالي السماكة، يتميّز بالتصاق ممتاز بالخرسانة والفولاذ ويوفّر حمايةً متينةً ضد الرطوبة والتآكل.',
    es: 'BC Tar Coat es un recubrimiento epoxi de alquitrán de hulla bicomponente, sin disolventes y de alto espesor, con excelente adherencia al hormigón y al acero, que proporciona una protección duradera frente a la humedad y la corrosión.',
  },
  'BC Tar Coat LC': {
    en: 'BC Tar Coat LC is a two-component, high-build, coal-tar-modified epoxy coating formulated to give long-term protection to concrete and steel surfaces exposed to aggressive environments.',
    ar: 'BC Tar Coat LC هو طلاء إيبوكسي ثنائي المكوّن عالي السماكة معدّل بالقطران الفحمي، مُركّب لتوفير حماية طويلة الأمد لأسطح الخرسانة والفولاذ المعرّضة للبيئات القاسية.',
    es: 'BC Tar Coat LC es un recubrimiento epoxi bicomponente de alto espesor, modificado con alquitrán de hulla, formulado para dar protección duradera a superficies de hormigón y acero expuestas a ambientes agresivos.',
  },
  'BC Water Plug': {
    en: 'BC Water Plug is a fast-setting hydraulic cement for stopping active leaks in concrete and masonry. Ready to use, it requires only water for application. Supplied in 20 kg bags.',
    ar: 'BC Water Plug هو إسمنت هيدروليكي سريع الشكّ لإيقاف التسربات النشطة في الخرسانة والمباني. جاهز للاستخدام ولا يتطلّب سوى الماء للتطبيق. يُورّد في أكياس 20 كجم.',
    es: 'BC Water Plug es un cemento hidráulico de fraguado rápido para detener fugas activas en hormigón y mampostería. Listo para usar, solo requiere agua para su aplicación. Se suministra en sacos de 20 kg.',
  },
  'BC Wet Proof': {
    en: 'BC Wet Proof FD is a fast-drying, latex-polymer-based waterproofing and crack-isolation membrane (20 kg and 25 kg packing) for use as an underlayment or crack-isolation system.',
    ar: 'BC Wet Proof FD هو غشاء عزل مائي وعزل للشقوق سريع الجفاف يعتمد على بوليمر اللاتكس (عبوات 20 و25 كجم)، يُستخدم كطبقة تحتية أو نظام لعزل الشقوق.',
    es: 'BC Wet Proof FD es una membrana impermeabilizante y de aislamiento de fisuras de secado rápido a base de polímero de látex (envases de 20 y 25 kg), para usar como capa de nivelación inferior o sistema de aislamiento de fisuras.',
  },
  'BC Wet Proof FD': {
    en: 'BC Wet Proof FD is a fast-drying, latex-polymer-based waterproofing and crack-isolation membrane (20 kg and 25 kg packing) for use as an underlayment or crack-isolation system.',
    ar: 'BC Wet Proof FD هو غشاء عزل مائي وعزل للشقوق سريع الجفاف يعتمد على بوليمر اللاتكس (عبوات 20 و25 كجم)، يُستخدم كطبقة تحتية أو نظام لعزل الشقوق.',
    es: 'BC Wet Proof FD es una membrana impermeabilizante y de aislamiento de fisuras de secado rápido a base de polímero de látex (envases de 20 y 25 kg), para usar como capa de nivelación inferior o sistema de aislamiento de fisuras.',
  },
  /* ===== 02 · Polyurea Membranes ===== */
  'BC 237': {
    en: 'BC 237 is a two-component, solvent-free, 100%-solids, spray-applied pure-polyurea waterproofing coating (1 kg/m² at 1 mm; 420 kg kit) for seamless, permanently elastic, crack-bridging protection on concrete and metal substrates, with excellent chemical and abrasion resistance.',
    ar: 'BC 237 هو طلاء عزل مائي من البولي يوريا النقي يُطبّق بالرش، ثنائي المكوّن وخالٍ من المذيبات وصلب بنسبة 100% (1 كجم/م² عند 1 مم؛ طقم 420 كجم)، لحماية متجانسة ومرنة دائمًا ورادمة للشقوق على أسطح الخرسانة والمعادن، بمقاومة ممتازة للمواد الكيميائية والتآكل.',
    es: 'BC 237 es un recubrimiento impermeabilizante de poliurea pura aplicado por proyección, bicomponente, sin disolventes y 100% sólidos (1 kg/m² a 1 mm; kit de 420 kg), para una protección continua, permanentemente elástica y puenteadora de fisuras sobre hormigón y metal, con excelente resistencia química y a la abrasión.',
  },
  'BC 238 AL': {
    en: 'BC 238 AL is a 100%-solids, fast-curing, two-component, UV-stable aliphatic pure-polyurea system, specially formulated for excellent colour stability and resistance to discolouration under continuous UV exposure.',
    ar: 'BC 238 AL هو نظام بولي يوريا نقي أليفاتي صلب بنسبة 100% وسريع التصلّب وثنائي المكوّن وثابت تجاه الأشعة فوق البنفسجية، مُركّب خصيصًا لثبات لوني ممتاز ومقاومة للاصفرار تحت التعرّض المستمر للأشعة فوق البنفسجية.',
    es: 'BC 238 AL es un sistema de poliurea pura alifática 100% sólidos, de curado rápido, bicomponente y estable a los UV, formulado especialmente para una excelente estabilidad del color y resistencia a la decoloración bajo exposición UV continua.',
  },
  'BC 690 H': {
    en: 'BC 690 H is a two-component, solvent-free, high-build elastomeric hybrid-polyurea membrane (1 kg/m² at 1 mm; 420 kg kit) for seamless, flexible and durable waterproofing, with excellent tensile strength, elongation, tear resistance and adhesion on commercial and industrial substrates.',
    ar: 'BC 690 H هو غشاء هجين من البولي يوريا، ثنائي المكوّن وخالٍ من المذيبات وعالي السماكة ومطاطي (1 كجم/م² عند 1 مم؛ طقم 420 كجم)، لعزل مائي متجانس ومرن ومتين، بقوة شدّ واستطالة ومقاومة تمزّق والتصاق ممتازة على الأسطح التجارية والصناعية.',
    es: 'BC 690 H es una membrana híbrida de poliurea, bicomponente, sin disolventes, de alto espesor y elastomérica (1 kg/m² a 1 mm; kit de 420 kg), para una impermeabilización continua, flexible y duradera, con excelente resistencia a la tracción, elongación, resistencia al desgarro y adherencia sobre sustratos comerciales e industriales.',
  },
  'BC 914 CA': {
    en: 'BC 914 CA is a two-component, pure aliphatic, brush-applied polyurea waterproofing coating (20 kg set, 0.79 m²/kg at 1 mm) offering exceptional UV stability, mechanical durability and zero water absorption.',
    ar: 'BC 914 CA هو طلاء عزل مائي من البولي يوريا الأليفاتي النقي يُطبّق بالفرشاة، ثنائي المكوّن (طقم 20 كجم، 0.79 م²/كجم عند 1 مم)، يوفّر ثباتًا استثنائيًا تجاه الأشعة فوق البنفسجية ومتانةً ميكانيكيةً وامتصاصًا صفريًا للماء.',
    es: 'BC 914 CA es un recubrimiento impermeabilizante de poliurea pura alifática aplicado con brocha, bicomponente (juego de 20 kg, 0,79 m²/kg a 1 mm), que ofrece una estabilidad UV excepcional, durabilidad mecánica y absorción de agua nula.',
  },
  'BC AR': {
    en: 'BC AR is a fast-curing, 100%-solids, two-component spray-applied polyurea coating engineered for advanced abrasion and impact resistance. It forms a seamless, highly elastic, crack-bridging membrane with excellent adhesion to concrete, steel and other substrates.',
    ar: 'BC AR هو طلاء بولي يوريا يُطبّق بالرش، سريع التصلّب وصلب بنسبة 100% وثنائي المكوّن، مصمّم لمقاومة متقدّمة للتآكل والصدم. يكوّن غشاءً متجانسًا وعالي المرونة ورادمًا للشقوق بالتصاق ممتاز بالخرسانة والفولاذ وغيرهما من الأسطح.',
    es: 'BC AR es un recubrimiento de poliurea aplicado por proyección, de curado rápido, 100% sólidos y bicomponente, diseñado para una resistencia avanzada a la abrasión y al impacto. Forma una membrana continua, muy elástica y puenteadora de fisuras, con excelente adherencia al hormigón, el acero y otros sustratos.',
  },
  'BC WH Cold': {
    en: 'BC WH Cold is a two-component, pure-grade, brush-applied polyurea waterproofing coating developed for concrete and metallic substrates that require mechanical durability and superior waterproofing performance.',
    ar: 'BC WH Cold هو طلاء عزل مائي من البولي يوريا النقي يُطبّق بالفرشاة، ثنائي المكوّن، طُوّر للأسطح الخرسانية والمعدنية التي تتطلّب متانةً ميكانيكيةً وأداء عزل مائي فائقًا.',
    es: 'BC WH Cold es un recubrimiento impermeabilizante de poliurea de grado puro aplicado con brocha, bicomponente, desarrollado para sustratos de hormigón y metálicos que requieren durabilidad mecánica y un rendimiento de impermeabilización superior.',
  },
  'BC X5': {
    en: 'BC X5 is a hot-applied polyurea system that expands 4–5× after spraying, providing simultaneous surface preparation and waterproofing. It is applied with high-pressure heated spray equipment and is CFC/HCFC-free and environmentally friendly.',
    ar: 'BC X5 هو نظام بولي يوريا يُطبّق على الساخن ويتمدّد 4–5 أضعاف بعد الرش، موفّرًا تحضيرًا للسطح وعزلًا مائيًا في آنٍ واحد. يُطبّق بمعدات رش ساخنة عالية الضغط، وهو خالٍ من مركّبات CFC/HCFC وصديق للبيئة.',
    es: 'BC X5 es un sistema de poliurea de aplicación en caliente que se expande 4–5 veces tras la proyección, proporcionando preparación de superficie e impermeabilización de forma simultánea. Se aplica con equipo de proyección caliente de alta presión, está libre de CFC/HCFC y es respetuoso con el medioambiente.',
  },
  /* ===== 03 · PU Foam & Insulation ===== */
  'BC 601': {
    en: 'BC 601 Foam System is a two-component flexible polyurethane foam system composed of BC 601 Polyol and BC 768 Isocyanate.',
    ar: 'BC 601 Foam System هو نظام رغوة بولي يوريثان مرن ثنائي المكوّن يتألّف من BC 601 Polyol وBC 768 Isocyanate.',
    es: 'BC 601 Foam System es un sistema de espuma de poliuretano flexible bicomponente compuesto por BC 601 Polyol y BC 768 Isocyanate.',
  },
  'BC 6534': {
    en: 'BC 6534 Isocyanate is a high-reactivity component formulated for hybrid-polyurea systems, ensuring rapid curing and strong film build with excellent adhesion, durability and chemical resistance for demanding waterproofing and protective-coating applications.',
    ar: 'BC 6534 Isocyanate هو مكوّن عالي التفاعلية مُركّب لأنظمة البولي يوريا الهجينة، يضمن تصلّبًا سريعًا وبناء غشاء قويًا بالتصاق ومتانة ومقاومة كيميائية ممتازة لتطبيقات العزل المائي والطلاءات الواقية الصعبة.',
    es: 'BC 6534 Isocyanate es un componente de alta reactividad formulado para sistemas de poliurea híbrida, que asegura un curado rápido y una fuerte formación de película con excelente adherencia, durabilidad y resistencia química para aplicaciones exigentes de impermeabilización y recubrimientos protectores.',
  },
  'BC 700': {
    en: 'BC 700 Polyol, together with BC 768 Isocyanate, forms a two-component polyurethane spray-foam system producing rigid foam with a density of 42–45 kg/m³ and excellent adhesion to most conventional substrates.',
    ar: 'BC 700 Polyol مع BC 768 Isocyanate يكوّنان نظام رغوة بولي يوريثان يُطبّق بالرش وثنائي المكوّن، ينتج رغوةً صلبةً بكثافة 42–45 كجم/م³ والتصاقًا ممتازًا بمعظم الأسطح التقليدية.',
    es: 'BC 700 Polyol, junto con BC 768 Isocyanate, forma un sistema de espuma de poliuretano proyectada bicomponente que produce espuma rígida con una densidad de 42–45 kg/m³ y excelente adherencia a la mayoría de los sustratos convencionales.',
  },
  'BC 702 Spray 40 FR': {
    en: 'BC 702 Spray 40 FR Polyol is a two-component spray-foam system (40 kg/m³ density) for cavity filling. Reacting with BC 768 Isocyanate, it produces rigid foam with good mechanical strength, dimensional stability and substrate adhesion; compatible with high- and low-pressure machines and containing 141B blowing agent.',
    ar: 'BC 702 Spray 40 FR Polyol هو نظام رغوة رش ثنائي المكوّن (كثافة 40 كجم/م³) لتعبئة الفراغات. بتفاعله مع BC 768 Isocyanate ينتج رغوةً صلبةً بقوة ميكانيكية وثبات أبعاد والتصاق جيدة، متوافق مع آلات الضغط العالي والمنخفض ويحتوي على عامل النفخ 141B.',
    es: 'BC 702 Spray 40 FR Polyol es un sistema de espuma proyectada bicomponente (densidad de 40 kg/m³) para el relleno de cavidades. Al reaccionar con BC 768 Isocyanate produce espuma rígida con buena resistencia mecánica, estabilidad dimensional y adherencia al sustrato; compatible con máquinas de alta y baja presión y con agente espumante 141B.',
  },
  'BC 702 Spray 45': {
    en: 'BC 702 Spray 45 Polyol is a two-component spray-foam system (45 kg/m³ density) for cavity filling. Reacting with BC 768 Isocyanate, it produces rigid foam with good mechanical strength, dimensional stability and substrate adhesion; compatible with high- and low-pressure machines and containing 141B blowing agent.',
    ar: 'BC 702 Spray 45 Polyol هو نظام رغوة رش ثنائي المكوّن (كثافة 45 كجم/م³) لتعبئة الفراغات. بتفاعله مع BC 768 Isocyanate ينتج رغوةً صلبةً بقوة ميكانيكية وثبات أبعاد والتصاق جيدة، متوافق مع آلات الضغط العالي والمنخفض ويحتوي على عامل النفخ 141B.',
    es: 'BC 702 Spray 45 Polyol es un sistema de espuma proyectada bicomponente (densidad de 45 kg/m³) para el relleno de cavidades. Al reaccionar con BC 768 Isocyanate produce espuma rígida con buena resistencia mecánica, estabilidad dimensional y adherencia al sustrato; compatible con máquinas de alta y baja presión y con agente espumante 141B.',
  },
  'BC 703 SWP': {
    en: 'BC 703 SWP Polyol is a two-component, 141B-based sandwich-panel system (42–45 kg/m³ density). Reacting with BC 768 Isocyanate (470 kg kit: 220 kg polyol + 250 kg isocyanate), it forms a highly cross-linked, rigid, dimensionally stable foam with good metal adhesion, classified B2 per DIN 4102.',
    ar: 'BC 703 SWP Polyol هو نظام ألواح ساندويتش ثنائي المكوّن يعتمد على 141B (كثافة 42–45 كجم/م³). بتفاعله مع BC 768 Isocyanate (طقم 470 كجم: 220 كجم بوليول + 250 كجم أيزوسيانات) يكوّن رغوةً صلبةً عالية التشابك وثابتة الأبعاد بالتصاق جيد بالمعدن، مصنّفة B2 وفق DIN 4102.',
    es: 'BC 703 SWP Polyol es un sistema para paneles sándwich bicomponente a base de 141B (densidad de 42–45 kg/m³). Al reaccionar con BC 768 Isocyanate (kit de 470 kg: 220 kg de poliol + 250 kg de isocianato) forma una espuma rígida, muy reticulada y dimensionalmente estable, con buena adherencia al metal, clasificada B2 según DIN 4102.',
  },
  'BC 706 Continuous Line': {
    en: 'BC 706 Continuous Line Polyol is a three-component, cyclopentane-based continuous-line sandwich-panel system (42–46 kg/m³ density). Reacting with BC 768 Isocyanate (100+10/160 ratio; 470 kg kit), it forms a highly cross-linked, rigid, dimensionally stable foam with excellent adhesion, classified B2 per DIN 4102.',
    ar: 'BC 706 Continuous Line Polyol هو نظام ألواح ساندويتش بخط إنتاج مستمر، ثلاثي المكوّن ويعتمد على السايكلوبنتان (كثافة 42–46 كجم/م³). بتفاعله مع BC 768 Isocyanate (نسبة 100+10/160؛ طقم 470 كجم) يكوّن رغوةً صلبةً عالية التشابك وثابتة الأبعاد بالتصاق ممتاز، مصنّفة B2 وفق DIN 4102.',
    es: 'BC 706 Continuous Line Polyol es un sistema para paneles sándwich de línea continua, tricomponente y a base de ciclopentano (densidad de 42–46 kg/m³). Al reaccionar con BC 768 Isocyanate (relación 100+10/160; kit de 470 kg) forma una espuma rígida, muy reticulada y dimensionalmente estable, con excelente adherencia, clasificada B2 según DIN 4102.',
  },
  'BC 708': {
    en: 'BC 708 Polyol and BC 768 Isocyanate form a two-component, 141B-blown polyurethane foam system for insulated water heaters and ice boxes, producing foam with excellent adhesion and superior thermal insulation.',
    ar: 'BC 708 Polyol وBC 768 Isocyanate يكوّنان نظام رغوة بولي يوريثان ثنائي المكوّن منفوخ بـ141B لسخّانات المياه المعزولة وصناديق الثلج، ينتج رغوةً بالتصاق ممتاز وعزل حراري فائق.',
    es: 'BC 708 Polyol y BC 768 Isocyanate forman un sistema de espuma de poliuretano bicomponente expandido con 141B para calentadores de agua aislados y neveras, que produce una espuma con excelente adherencia y un aislamiento térmico superior.',
  },
  'BC 709': {
    en: 'BC 709 is a two-component, high-density polyurethane system designed for the production of wood-like parts and other rigid components. The resulting foam adheres well to the substrate and offers higher strength than conventional systems.',
    ar: 'BC 709 هو نظام بولي يوريثان ثنائي المكوّن عالي الكثافة مصمّم لإنتاج القطع الشبيهة بالخشب والمكوّنات الصلبة الأخرى. تتميّز الرغوة الناتجة بالتصاق جيد بالسطح وقوة أعلى مقارنةً بالأنظمة التقليدية.',
    es: 'BC 709 es un sistema de poliuretano bicomponente de alta densidad diseñado para fabricar piezas de aspecto de madera y otros componentes rígidos. La espuma resultante se adhiere bien al sustrato y ofrece mayor resistencia que los sistemas convencionales.',
  },
  'BC 710': {
    en: 'BC 710 is a two-component, 141B-based polyisocyanurate (PIR) system designed to produce sandwich panels by the discontinuous method. The resulting foam adheres well to the substrate and offers higher strength than conventional systems.',
    ar: 'BC 710 هو نظام بولي أيزوسيانورات (PIR) ثنائي المكوّن يعتمد على 141B، مصمّم لإنتاج ألواح الساندويتش بالطريقة غير المستمرة. تتميّز الرغوة الناتجة بالتصاق جيد بالسطح وقوة أعلى مقارنةً بالأنظمة التقليدية.',
    es: 'BC 710 es un sistema de poliisocianurato (PIR) bicomponente a base de 141B, diseñado para producir paneles sándwich por el método discontinuo. La espuma resultante se adhiere bien al sustrato y ofrece mayor resistencia que los sistemas convencionales.',
  },
  'BC 711': {
    en: 'BC 711 Polyol and BC 768 Isocyanate make a two-component, 141B-based polyurethane system for the discontinuous production of rigid PU foam, delivering strong, rigid foam suitable for refrigerators, cavity filling and wood-replacement applications.',
    ar: 'BC 711 Polyol وBC 768 Isocyanate يكوّنان نظام بولي يوريثان ثنائي المكوّن يعتمد على 141B للإنتاج غير المستمر للرغوة الصلبة، يقدّم رغوةً صلبةً قويةً مناسبةً للثلاجات وتعبئة الفراغات وتطبيقات بدائل الخشب.',
    es: 'BC 711 Polyol y BC 768 Isocyanate componen un sistema de poliuretano bicomponente a base de 141B para la producción discontinua de espuma rígida de PU, que ofrece una espuma rígida y resistente apta para refrigeradores, relleno de cavidades y aplicaciones de sustitución de madera.',
  },
  'BC 713': {
    en: 'BC 713 Foam System is a two-component flexible polyurethane foam system composed of BC 713 Polyol and BC 768 Isocyanate.',
    ar: 'BC 713 Foam System هو نظام رغوة بولي يوريثان مرن ثنائي المكوّن يتألّف من BC 713 Polyol وBC 768 Isocyanate.',
    es: 'BC 713 Foam System es un sistema de espuma de poliuretano flexible bicomponente compuesto por BC 713 Polyol y BC 768 Isocyanate.',
  },
  'BC 714': {
    en: 'BC 714 is a two-component, 141B-based polyurethane system developed to produce rigid polyurethane foam, by the discontinuous method, when reacted with BC 768. The foam is suitable for making sandwich panels and water heaters.',
    ar: 'BC 714 هو نظام بولي يوريثان ثنائي المكوّن يعتمد على 141B، طُوّر لإنتاج رغوة بولي يوريثان صلبة بالطريقة غير المستمرة عند تفاعله مع BC 768. تصلح هذه الرغوة لصناعة ألواح الساندويتش والسخّانات.',
    es: 'BC 714 es un sistema de poliuretano bicomponente a base de 141B, desarrollado para producir espuma rígida de poliuretano por el método discontinuo al reaccionar con BC 768. La espuma es apta para fabricar paneles sándwich y calentadores de agua.',
  },
  'BC 715': {
    en: 'BC 715 Spray Polyol and BC 768 Isocyanate form a two-component, 141B-based spray polyurethane foam system reaching a density of 48–50 kg/m³, producing foam with excellent adhesion and reliable dimensional stability for insulation and protective applications.',
    ar: 'BC 715 Spray Polyol وBC 768 Isocyanate يكوّنان نظام رغوة بولي يوريثان يُطبّق بالرش، ثنائي المكوّن ويعتمد على 141B، يصل إلى كثافة 48–50 كجم/م³، وينتج رغوةً بالتصاق ممتاز وثبات أبعاد موثوق لتطبيقات العزل والحماية.',
    es: 'BC 715 Spray Polyol y BC 768 Isocyanate forman un sistema de espuma de poliuretano proyectada bicomponente a base de 141B que alcanza una densidad de 48–50 kg/m³, produciendo una espuma con excelente adherencia y una estabilidad dimensional fiable para aplicaciones de aislamiento y protección.',
  },
  'BC 717 SWP': {
    en: 'BC 717 SWP Polyol is a two-component, 141B-based polyurethane system for sandwich panels (42–46 kg/m³ density). Reacting with BC 768 Isocyanate (100/120 ratio), it forms a highly cross-linked, rigid, dimensionally stable foam with good metal adhesion, classified B2 per DIN 4102.',
    ar: 'BC 717 SWP Polyol هو نظام بولي يوريثان ثنائي المكوّن يعتمد على 141B لألواح الساندويتش (كثافة 42–46 كجم/م³). بتفاعله مع BC 768 Isocyanate (نسبة 100/120) يكوّن رغوةً صلبةً عالية التشابك وثابتة الأبعاد بالتصاق جيد بالمعدن، مصنّفة B2 وفق DIN 4102.',
    es: 'BC 717 SWP Polyol es un sistema de poliuretano bicomponente a base de 141B para paneles sándwich (densidad de 42–46 kg/m³). Al reaccionar con BC 768 Isocyanate (relación 100/120) forma una espuma rígida, muy reticulada y dimensionalmente estable, con buena adherencia al metal, clasificada B2 según DIN 4102.',
  },
  'BC 718': {
    en: 'BC 718 Spray Polyol is designed for sprayed foams for cavity filling at an applied density of 45 kg/m³. The reaction of BC 718 Polyol with BC 768 Isocyanate gives foam with good mechanical properties, dimensional stability and adhesion to common substrates.',
    ar: 'BC 718 Spray Polyol مصمّم لرغوات الرش لتعبئة الفراغات بكثافة تطبيق 45 كجم/م³. يمنح تفاعل BC 718 Polyol مع BC 768 Isocyanate رغوةً بخصائص ميكانيكية وثبات أبعاد والتصاق جيدة بالأسطح الشائعة.',
    es: 'BC 718 Spray Polyol está diseñado para espumas proyectadas de relleno de cavidades con una densidad aplicada de 45 kg/m³. La reacción de BC 718 Polyol con BC 768 Isocyanate produce una espuma con buenas propiedades mecánicas, estabilidad dimensional y adherencia a los sustratos habituales.',
  },
  'BC 721 Continuous Line': {
    en: 'BC 721 Continuous Line Polyol is a two-component, HCFC-141B-based continuous-line sandwich-panel system (42–46 kg/m³ density). Reacting with BC 768 Isocyanate (100/130 ratio; 470 kg kit), it forms a highly cross-linked, rigid, dimensionally stable foam with excellent adhesion, classified B2 per DIN 4102.',
    ar: 'BC 721 Continuous Line Polyol هو نظام ألواح ساندويتش بخط إنتاج مستمر، ثنائي المكوّن ويعتمد على HCFC-141B (كثافة 42–46 كجم/م³). بتفاعله مع BC 768 Isocyanate (نسبة 100/130؛ طقم 470 كجم) يكوّن رغوةً صلبةً عالية التشابك وثابتة الأبعاد بالتصاق ممتاز، مصنّفة B2 وفق DIN 4102.',
    es: 'BC 721 Continuous Line Polyol es un sistema para paneles sándwich de línea continua, bicomponente y a base de HCFC-141B (densidad de 42–46 kg/m³). Al reaccionar con BC 768 Isocyanate (relación 100/130; kit de 470 kg) forma una espuma rígida, muy reticulada y dimensionalmente estable, con excelente adherencia, clasificada B2 según DIN 4102.',
  },
  'BC 801': {
    en: 'BC 801P is a single-component, moisture-curing polyurethane foam for thermal insulation, soundproofing and gap filling. Supplied in a 500 ml cartridge, it is ready to use, self-expanding and cures to a semi-rigid, closed-cell foam.',
    ar: 'BC 801P هو رغوة بولي يوريثان أحادية المكوّن تتصلّب بالرطوبة، للعزل الحراري وعزل الصوت وملء الفجوات. تُورّد في خرطوشة 500 مل، جاهزة للاستخدام وذاتية التمدّد وتتصلّب مكوّنةً رغوةً شبه صلبة مغلقة الخلايا.',
    es: 'BC 801P es una espuma de poliuretano monocomponente de curado por humedad para aislamiento térmico, insonorización y relleno de huecos. Suministrada en cartucho de 500 ml, está lista para usar, es autoexpandible y cura formando una espuma semirrígida de celda cerrada.',
  },
  'BC 805': {
    en: 'BC 805P is a single-component, moisture-curing polyurethane foam supplied in pre-pressurised aerosol cans. On dispensing, it reacts with atmospheric moisture to expand and cure into a semi-rigid, closed-cell structure.',
    ar: 'BC 805P هو رغوة بولي يوريثان أحادية المكوّن تتصلّب بالرطوبة، تُورّد في عبوات أيروسول مضغوطة مسبقًا. عند صرفها تتفاعل مع رطوبة الجو لتتمدّد وتتصلّب مكوّنةً بنيةً شبه صلبة مغلقة الخلايا.',
    es: 'BC 805P es una espuma de poliuretano monocomponente de curado por humedad suministrada en aerosoles prepresurizados. Al dispensarse, reacciona con la humedad del aire para expandirse y curar formando una estructura semirrígida de celda cerrada.',
  },
  'BC 808': {
    en: 'BC 808P is a single-component, B2 fire-rated, moisture-curing polyurethane foam supplied in pre-pressurised aerosol cans. On dispensing, it reacts with atmospheric moisture to expand and cure into a semi-rigid, closed-cell structure.',
    ar: 'BC 808P هو رغوة بولي يوريثان أحادية المكوّن تتصلّب بالرطوبة ومصنّفة B2 لمقاومة الحريق، تُورّد في عبوات أيروسول مضغوطة مسبقًا. عند صرفها تتفاعل مع رطوبة الجو لتتمدّد وتتصلّب مكوّنةً بنيةً شبه صلبة مغلقة الخلايا.',
    es: 'BC 808P es una espuma de poliuretano monocomponente, con clasificación al fuego B2 y curado por humedad, suministrada en aerosoles prepresurizados. Al dispensarse, reacciona con la humedad del aire para expandirse y curar formando una estructura semirrígida de celda cerrada.',
  },
  'BC Foam Concrete': {
    en: 'BC Foam Concrete is an engineered fill material with uniformly distributed air voids for geotechnical construction and mining, combining cement slurry with stable foam to create a lightweight, rigid concrete. Supplied in 200 kg drums.',
    ar: 'BC Foam Concrete هو مادة ردم هندسية بفراغات هوائية موزّعة بانتظام للإنشاءات الجيوتقنية والتعدين، تجمع بين ملاط الإسمنت والرغوة المستقرة لتكوين خرسانة خفيفة الوزن وصلبة. تُورّد في براميل 200 كجم.',
    es: 'BC Foam Concrete es un material de relleno técnico con vacíos de aire distribuidos uniformemente para construcción geotécnica y minería, que combina lechada de cemento con espuma estable para crear un hormigón ligero y rígido. Se suministra en bidones de 200 kg.',
  },
  'BC PIR Board': {
    en: 'BC PIR Board (yellow, 2400×1200×20 mm) is a rigid, high-performance polyisocyanurate (PIR) insulation board with excellent thermal resistance, suitable for walls, roofs and floors to deliver energy-efficient insulation.',
    ar: 'BC PIR Board (أصفر، 2400×1200×20 مم) هو لوح عزل من البولي أيزوسيانورات (PIR) صلب وعالي الأداء بمقاومة حرارية ممتازة، مناسب للجدران والأسطح والأرضيات لتوفير عزل موفّر للطاقة.',
    es: 'BC PIR Board (amarillo, 2400×1200×20 mm) es una placa de aislamiento de poliisocianurato (PIR) rígida y de alto rendimiento con excelente resistencia térmica, apta para muros, cubiertas y suelos, que aporta un aislamiento de alta eficiencia energética.',
  },
  'BC XPS Board 100 mm': {
    en: 'BC XPS Board (32–35 kg/m³, 10 cm × 60 cm × 125 cm) is an extruded polystyrene insulation board with high compressive strength and low water absorption, providing durable, long-lasting thermal insulation for foundations, roofs, walls and below-grade applications.',
    ar: 'BC XPS Board (32–35 كجم/م³، 10 سم × 60 سم × 125 سم) هو لوح عزل من البوليسترين المبثوق بقوة انضغاط عالية وامتصاص ماء منخفض، يوفّر عزلًا حراريًا متينًا وطويل الأمد للأساسات والأسطح والجدران والتطبيقات تحت الأرض.',
    es: 'BC XPS Board (32–35 kg/m³, 10 cm × 60 cm × 125 cm) es una placa de aislamiento de poliestireno extruido con alta resistencia a la compresión y baja absorción de agua, que proporciona un aislamiento térmico duradero para cimentaciones, cubiertas, muros y aplicaciones bajo rasante.',
  },
  'BC XPS Board 50 mm': {
    en: 'BC XPS Board (32–35 kg/m³, 5 cm × 60 cm × 125 cm) is an extruded polystyrene insulation board with high compressive strength and low water absorption, providing durable, long-lasting thermal insulation for foundations, roofs, walls and below-grade applications.',
    ar: 'BC XPS Board (32–35 كجم/م³، 5 سم × 60 سم × 125 سم) هو لوح عزل من البوليسترين المبثوق بقوة انضغاط عالية وامتصاص ماء منخفض، يوفّر عزلًا حراريًا متينًا وطويل الأمد للأساسات والأسطح والجدران والتطبيقات تحت الأرض.',
    es: 'BC XPS Board (32–35 kg/m³, 5 cm × 60 cm × 125 cm) es una placa de aislamiento de poliestireno extruido con alta resistencia a la compresión y baja absorción de agua, que proporciona un aislamiento térmico duradero para cimentaciones, cubiertas, muros y aplicaciones bajo rasante.',
  },
  'BC XPS Board 70 mm': {
    en: 'BC XPS Board (32–35 kg/m³, 7 cm × 60 cm × 125 cm) is an extruded polystyrene insulation board with high compressive strength and low water absorption, providing durable, long-lasting thermal insulation for foundations, roofs, walls and below-grade applications.',
    ar: 'BC XPS Board (32–35 كجم/م³، 7 سم × 60 سم × 125 سم) هو لوح عزل من البوليسترين المبثوق بقوة انضغاط عالية وامتصاص ماء منخفض، يوفّر عزلًا حراريًا متينًا وطويل الأمد للأساسات والأسطح والجدران والتطبيقات تحت الأرض.',
    es: 'BC XPS Board (32–35 kg/m³, 7 cm × 60 cm × 125 cm) es una placa de aislamiento de poliestireno extruido con alta resistencia a la compresión y baja absorción de agua, que proporciona un aislamiento térmico duradero para cimentaciones, cubiertas, muros y aplicaciones bajo rasante.',
  },
  /* ===== 04 · Flooring Systems ===== */
  'BC Epoxy SL 140': {
    en: 'BC Epoxy SL 140 (dark grey) is a 100%-solids, high-performance self-levelling coating for concrete. It can be applied as a neat or aggregate-filled system, or over reinforced systems.',
    ar: 'BC Epoxy SL 140 (رمادي غامق) هو طلاء ذاتي التسوية عالي الأداء صلب بنسبة 100% للخرسانة. يمكن تطبيقه كنظام صافٍ أو ممتلئ بالركام، أو فوق الأنظمة المسلّحة.',
    es: 'BC Epoxy SL 140 (gris oscuro) es un recubrimiento autonivelante de alto rendimiento, 100% sólidos, para hormigón. Puede aplicarse como sistema puro o cargado con áridos, o sobre sistemas reforzados.',
  },
  'BC Floor 1000 SL': {
    en: 'BC Floor 1000 SL is a two-component, solvent-free, pigmented epoxy self-smoothing floor system (15 kg set, 0.8 kg/m² at 500 µm, one coat) for seamless, durable and easy-to-clean flooring.',
    ar: 'BC Floor 1000 SL هو نظام أرضيات إيبوكسي ذاتي التنعيم ثنائي المكوّن وخالٍ من المذيبات وملوّن (طقم 15 كجم، 0.8 كجم/م² عند 500 ميكرون، طبقة واحدة) لأرضية متجانسة ومتينة وسهلة التنظيف.',
    es: 'BC Floor 1000 SL es un sistema de pavimento epoxi autoalisante, bicomponente, sin disolventes y pigmentado (juego de 15 kg, 0,8 kg/m² a 500 µm, una capa), para un suelo continuo, duradero y fácil de limpiar.',
  },
  'BC Floor 2000 SL': {
    en: 'BC Floor 2000 SL is a two-component, solvent-free, pigmented epoxy self-smoothing floor topping (16 kg set, 3.2 kg/m² at 2 mm, one coat) for seamless, hygienic and durable flooring.',
    ar: 'BC Floor 2000 SL هو طبقة أرضيات إيبوكسي ذاتية التنعيم ثنائية المكوّن وخالية من المذيبات وملوّنة (طقم 16 كجم، 3.2 كجم/م² عند 2 مم، طبقة واحدة) لأرضية متجانسة وصحية ومتينة.',
    es: 'BC Floor 2000 SL es un revestimiento de pavimento epoxi autoalisante, bicomponente, sin disolventes y pigmentado (juego de 16 kg, 3,2 kg/m² a 2 mm, una capa), para un suelo continuo, higiénico y duradero.',
  },
  'BC Floor 3000 SL': {
    en: 'BC Floor 3000 SL is a self-levelling epoxy floor system from BCI’s flooring range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Floor 3000 SL هو نظام أرضيات إيبوكسي ذاتي التسوية ضمن مجموعة الأرضيات من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Floor 3000 SL es un sistema de pavimento epoxi autonivelante de la gama de pavimentos de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Floor 4000 SL': {
    en: 'BC Floor 4000 SL is a two-component, solvent-free, high-build, self-smoothing epoxy floor system (27 kg set, 7.2 kg/m² at 4 mm, one coat) for seamless, chemical- and abrasion-resistant heavy-duty flooring.',
    ar: 'BC Floor 4000 SL هو نظام أرضيات إيبوكسي ذاتي التنعيم ثنائي المكوّن وخالٍ من المذيبات وعالي السماكة (طقم 27 كجم، 7.2 كجم/م² عند 4 مم، طبقة واحدة) لأرضية ثقيلة الخدمة متجانسة ومقاومة للمواد الكيميائية والتآكل.',
    es: 'BC Floor 4000 SL es un sistema de pavimento epoxi autoalisante, bicomponente, sin disolventes y de alto espesor (juego de 27 kg, 7,2 kg/m² a 4 mm, una capa), para un suelo de servicio pesado, continuo y resistente a productos químicos y a la abrasión.',
  },
  'BC Floor EPU 100': {
    en: 'BC Floor EPU 100 is a two-component hybrid epoxy–polyurethane coating (20 kg kit) with excellent chemical, abrasion and UV resistance for durable protection of concrete and industrial surfaces.',
    ar: 'BC Floor EPU 100 هو طلاء هجين من الإيبوكسي والبولي يوريثان ثنائي المكوّن (طقم 20 كجم) بمقاومة ممتازة للمواد الكيميائية والتآكل والأشعة فوق البنفسجية لحماية متينة للأسطح الخرسانية والصناعية.',
    es: 'BC Floor EPU 100 es un recubrimiento híbrido epoxi-poliuretano bicomponente (kit de 20 kg) con excelente resistencia química, a la abrasión y a los UV, para una protección duradera de superficies de hormigón e industriales.',
  },
  'BC Floor Premix': {
    en: 'BC Floor Premix is an abrasion- and impact-resistant floor premix for heavy-duty surfaces such as warehouses, car parks, loading areas and machine shops, providing extremely hard-wearing protection.',
    ar: 'BC Floor Premix هو خلطة أرضيات جاهزة مقاومة للتآكل والصدم للأسطح ثقيلة الخدمة مثل المستودعات والمواقف ومناطق التحميل وورش الآلات، توفّر حمايةً فائقة التحمّل.',
    es: 'BC Floor Premix es una premezcla para pavimentos resistente a la abrasión y al impacto, para superficies de servicio pesado como almacenes, aparcamientos, zonas de carga y talleres, que ofrece una protección extremadamente resistente al desgaste.',
  },
  'BC Floor Traffic 520': {
    en: 'BC Floor Traffic 520 is a two-component, high-build, solvent-free epoxy coating for heavy-duty traffic areas, providing excellent abrasion, impact and chemical resistance for long-lasting floor protection.',
    ar: 'BC Floor Traffic 520 هو طلاء إيبوكسي ثنائي المكوّن عالي السماكة وخالٍ من المذيبات لمناطق الحركة الكثيفة، يوفّر مقاومةً ممتازةً للتآكل والصدم والمواد الكيميائية لحماية أرضية طويلة الأمد.',
    es: 'BC Floor Traffic 520 es un recubrimiento epoxi bicomponente, de alto espesor y sin disolventes, para zonas de tráfico intenso, que ofrece excelente resistencia a la abrasión, al impacto y a los productos químicos para una protección duradera del pavimento.',
  },
  'BC Floor Traffic Matt': {
    en: 'BC Floor Traffic Matt is a two-component, high-build, solvent-free epoxy coating for heavy-duty traffic areas, providing excellent abrasion, impact and chemical resistance for long-lasting floor protection.',
    ar: 'BC Floor Traffic Matt هو طلاء إيبوكسي ثنائي المكوّن عالي السماكة وخالٍ من المذيبات لمناطق الحركة الكثيفة، يوفّر مقاومةً ممتازةً للتآكل والصدم والمواد الكيميائية لحماية أرضية طويلة الأمد.',
    es: 'BC Floor Traffic Matt es un recubrimiento epoxi bicomponente, de alto espesor y sin disolventes, para zonas de tráfico intenso, que ofrece excelente resistencia a la abrasión, al impacto y a los productos químicos para una protección duradera del pavimento.',
  },
  'BC Novolac Mortar': {
    en: 'BC Novolac Mortar is a three-component, 100%-solids, trowel-applied epoxy-novolac system offering exceptional chemical and thermal resistance for protecting concrete and masonry in aggressive environments. Supplied as a 14.25 kg set.',
    ar: 'BC Novolac Mortar هو نظام إيبوكسي نوفولاك ثلاثي المكوّن صلب بنسبة 100% يُطبّق بالمالج، يوفّر مقاومةً كيميائيةً وحراريةً استثنائيةً لحماية الخرسانة والمباني في البيئات القاسية. يُورّد كطقم 14.25 كجم.',
    es: 'BC Novolac Mortar es un sistema epoxi-novolaca tricomponente, 100% sólidos y aplicado con llana, que ofrece una resistencia química y térmica excepcional para proteger hormigón y mampostería en ambientes agresivos. Se suministra en juego de 14,25 kg.',
  },
  'BC Novoline 321': {
    en: 'BC Novoline 321 is a two-component, solvent-free, high-build epoxy-novolac lining coat designed for superior chemical resistance in aggressive environments. Supplied as a 20 kg set.',
    ar: 'BC Novoline 321 هو طلاء تبطين إيبوكسي نوفولاك ثنائي المكوّن وخالٍ من المذيبات وعالي السماكة، مصمّم لمقاومة كيميائية فائقة في البيئات القاسية. يُورّد كطقم 20 كجم.',
    es: 'BC Novoline 321 es un revestimiento epoxi-novolaca bicomponente, sin disolventes y de alto espesor, diseñado para una resistencia química superior en ambientes agresivos. Se suministra en juego de 20 kg.',
  },
  'BC Poly SL': {
    en: 'BC Poly SL is a polyurethane-based flooring system with high tensile strength and an excellent balance of elongation, abrasion resistance, hardness and sound-deadening properties.',
    ar: 'BC Poly SL هو نظام أرضيات يعتمد على البولي يوريثان بقوة شدّ عالية وتوازن ممتاز بين الاستطالة ومقاومة التآكل والصلابة وخصائص تخميد الصوت.',
    es: 'BC Poly SL es un sistema de pavimento a base de poliuretano con alta resistencia a la tracción y un excelente equilibrio entre elongación, resistencia a la abrasión, dureza y propiedades de amortiguación acústica.',
  },
  'BC Polyaspartic': {
    en: 'BC Polyaspartic is a two-component, 100%-solids polyaspartic polyurea coating for high-performance concrete surfaces. It offers excellent gloss, superior abrasion and impact resistance, chemical splash and spill resistance and fast curing for reduced downtime — ideal for industrial and decorative floors.',
    ar: 'BC Polyaspartic هو طلاء بولي يوريا بولي أسبارتيك ثنائي المكوّن صلب بنسبة 100% للأسطح الخرسانية عالية الأداء. يوفّر لمعانًا ممتازًا ومقاومةً فائقةً للتآكل والصدم ومقاومةً لرذاذ وانسكاب المواد الكيميائية وتصلّبًا سريعًا لتقليل التوقّف — مثالي للأرضيات الصناعية والتزيينية.',
    es: 'BC Polyaspartic es un recubrimiento de poliurea poliaspártica bicomponente y 100% sólidos para superficies de hormigón de alto rendimiento. Ofrece excelente brillo, resistencia superior a la abrasión y al impacto, resistencia a salpicaduras y derrames químicos y curado rápido para reducir el tiempo de inactividad; ideal para suelos industriales y decorativos.',
  },
  'BC Poxy 250': {
    en: 'BC Epoxy 250 is a two-component, solvent-free, high-build epoxy protective coating (13.25 kg set, 0.27 kg/m² at 200 µm, one coat) for durable, chemical-resistant protection of concrete and steel.',
    ar: 'BC Epoxy 250 هو طلاء حماية إيبوكسي ثنائي المكوّن وخالٍ من المذيبات وعالي السماكة (طقم 13.25 كجم، 0.27 كجم/م² عند 200 ميكرون، طبقة واحدة) لحماية متينة ومقاومة للمواد الكيميائية للخرسانة والفولاذ.',
    es: 'BC Epoxy 250 es un recubrimiento protector epoxi bicomponente, sin disolventes y de alto espesor (juego de 13,25 kg, 0,27 kg/m² a 200 µm, una capa), para una protección duradera y resistente a productos químicos del hormigón y el acero.',
  },
  'BC Poxy 254': {
    en: 'BC Poxy Clear 254 is a two-component, transparent, UV-resistant epoxy resin seal coat for smooth or broadcast finishes, suitable for hot and tropical climates. Supplied as a 20 kg set.',
    ar: 'BC Poxy Clear 254 هو طلاء إغلاق من راتنج الإيبوكسي ثنائي المكوّن شفّاف ومقاوم للأشعة فوق البنفسجية لإنهاءات ناعمة أو منثورة، مناسب للمناخات الحارة والاستوائية. يُورّد كطقم 20 كجم.',
    es: 'BC Poxy Clear 254 es un sellador de resina epoxi bicomponente, transparente y resistente a los UV, para acabados lisos o con áridos esparcidos, apto para climas cálidos y tropicales. Se suministra en juego de 20 kg.',
  },
  'BC Poxy 300 AS': {
    en: 'BC Poxy 300 AS is a two-component, self-smoothing, electrostatically conductive epoxy flooring system with excellent chemical and mechanical resistance; a 20 kg set covers approximately 33 m² at 0.75 kg/m².',
    ar: 'BC Poxy 300 AS هو نظام أرضيات إيبوكسي ثنائي المكوّن ذاتي التنعيم وموصِّل للكهرباء الساكنة بمقاومة كيميائية وميكانيكية ممتازة؛ يغطّي الطقم 20 كجم نحو 33 م² عند 0.75 كجم/م².',
    es: 'BC Poxy 300 AS es un sistema de pavimento epoxi bicomponente, autoalisante y electrostáticamente conductor, con excelente resistencia química y mecánica; un juego de 20 kg cubre aproximadamente 33 m² a 0,75 kg/m².',
  },
  'BC Poxy 4500 S': {
    en: 'BC Epoxy 4500 S is a 100%-solids, flake-filled premium epoxy coating for internal steel and concrete tanks, pipe linings and marine structures in immersion and splash zones. Supplied as a 20 kg set.',
    ar: 'BC Epoxy 4500 S هو طلاء إيبوكسي فاخر صلب بنسبة 100% وممتلئ برقائق، للخزانات الفولاذية والخرسانية الداخلية وتبطين الأنابيب والمنشآت البحرية في مناطق الغمر والرذاذ. يُورّد كطقم 20 كجم.',
    es: 'BC Epoxy 4500 S es un recubrimiento epoxi premium 100% sólidos, cargado con escamas, para tanques internos de acero y hormigón, revestimientos de tuberías y estructuras marinas en zonas de inmersión y salpicadura. Se suministra en juego de 20 kg.',
  },
  'BC Poxy FC 140': {
    en: 'BC Epoxy FC 140 is a two-component, solvent-free, pigmented epoxy floor coating for durable, chemical-resistant surfaces. Coverage 0.50–0.80 kg/m²; supplied as a 20 kg set.',
    ar: 'BC Epoxy FC 140 هو طلاء أرضيات إيبوكسي ثنائي المكوّن وخالٍ من المذيبات وملوّن لأسطح متينة ومقاومة للمواد الكيميائية. التغطية 0.50–0.80 كجم/م²؛ يُورّد كطقم 20 كجم.',
    es: 'BC Epoxy FC 140 es un recubrimiento epoxi para suelos, bicomponente, sin disolventes y pigmentado, para superficies duraderas y resistentes a productos químicos. Rendimiento de 0,50–0,80 kg/m²; se suministra en juego de 20 kg.',
  },
  'BC Poxy FC 140 Screed': {
    en: 'BC Poxy FC 140 Screed is a high-performance, three-component system consisting of epoxy resin (Part A), hardener (Part B) and quartz filler (Part C).',
    ar: 'BC Poxy FC 140 Screed هو نظام عالي الأداء ثلاثي المكوّن يتكوّن من راتنج إيبوكسي (الجزء A) ومصلّب (الجزء B) ومالئ من الكوارتز (الجزء C).',
    es: 'BC Poxy FC 140 Screed es un sistema de alto rendimiento de tres componentes formado por resina epoxi (parte A), endurecedor (parte B) y carga de cuarzo (parte C).',
  },
  'BC Poxy FC 140 SF': {
    en: 'BC Epoxy FC 140 SF is a two-component, solvent-free, pigmented epoxy floor coating for durable, chemical-resistant surfaces. Coverage 0.50–0.80 kg/m²; supplied as a 20 kg set.',
    ar: 'BC Epoxy FC 140 SF هو طلاء أرضيات إيبوكسي ثنائي المكوّن وخالٍ من المذيبات وملوّن لأسطح متينة ومقاومة للمواد الكيميائية. التغطية 0.50–0.80 كجم/م²؛ يُورّد كطقم 20 كجم.',
    es: 'BC Epoxy FC 140 SF es un recubrimiento epoxi para suelos, bicomponente, sin disolventes y pigmentado, para superficies duraderas y resistentes a productos químicos. Rendimiento de 0,50–0,80 kg/m²; se suministra en juego de 20 kg.',
  },
  'BC Poxy FC 145': {
    en: 'BC Epoxy FC 145 is a two-component, solvent-free epoxy floor coating (20 kg set, 0.28 kg/m² at 200 µm, one coat) for durable, chemical-resistant, high-gloss flooring.',
    ar: 'BC Epoxy FC 145 هو طلاء أرضيات إيبوكسي ثنائي المكوّن وخالٍ من المذيبات (طقم 20 كجم، 0.28 كجم/م² عند 200 ميكرون، طبقة واحدة) لأرضية متينة ومقاومة للمواد الكيميائية وعالية اللمعان.',
    es: 'BC Epoxy FC 145 es un recubrimiento epoxi para suelos, bicomponente y sin disolventes (juego de 20 kg, 0,28 kg/m² a 200 µm, una capa), para un suelo duradero, resistente a productos químicos y de alto brillo.',
  },
  'BC Poxy FC 145 Matt': {
    en: 'BC Epoxy FC 145 Matt is a two-component, solvent-free epoxy floor coating (20 kg set, 0.28 kg/m² at 200 µm, one coat) for durable, chemical-resistant flooring with a matt finish.',
    ar: 'BC Epoxy FC 145 Matt هو طلاء أرضيات إيبوكسي ثنائي المكوّن وخالٍ من المذيبات (طقم 20 كجم، 0.28 كجم/م² عند 200 ميكرون، طبقة واحدة) لأرضية متينة ومقاومة للمواد الكيميائية بإنهاء مطفأ.',
    es: 'BC Epoxy FC 145 Matt es un recubrimiento epoxi para suelos, bicomponente y sin disolventes (juego de 20 kg, 0,28 kg/m² a 200 µm, una capa), para un suelo duradero y resistente a productos químicos con acabado mate.',
  },
  'BC Poxy FC 145 Screed': {
    en: 'BC Poxy FC 145 Screed is a three-component, solvent-free epoxy resin floor screed formulated with high-performance epoxy resins and specially graded aggregates.',
    ar: 'BC Poxy FC 145 Screed هو طبقة أرضية من راتنج الإيبوكسي ثلاثية المكوّن وخالية من المذيبات، مُركّبة براتنجات إيبوكسي عالية الأداء وركام متدرّج خصيصًا.',
    es: 'BC Poxy FC 145 Screed es un mortero de pavimento de resina epoxi, tricomponente y sin disolventes, formulado con resinas epoxi de alto rendimiento y áridos de granulometría especial.',
  },
  'BC Poxy FC WB': {
    en: 'BC Poxy FC WB is a high-performance, two-component, water-based epoxy floor coating that provides a smooth, durable and chemically resistant finish, with excellent adhesion to cementitious substrates, low VOC emissions and easy application for industrial flooring.',
    ar: 'BC Poxy FC WB هو طلاء أرضيات إيبوكسي عالي الأداء ثنائي المكوّن يعتمد على الماء، يمنح إنهاءً ناعمًا ومتينًا ومقاومًا للمواد الكيميائية، بالتصاق ممتاز بالأسطح الإسمنتية وانبعاثات VOC منخفضة وسهولة تطبيق لأنظمة الأرضيات الصناعية.',
    es: 'BC Poxy FC WB es un recubrimiento epoxi para suelos de alto rendimiento, bicomponente y de base acuosa, que proporciona un acabado liso, duradero y resistente a productos químicos, con excelente adherencia a sustratos cementosos, bajas emisiones de COV y fácil aplicación en pavimentos industriales.',
  },
  'BC Poxy Terrazo 253': {
    en: 'BC Poxy Terrazo 253 is a two-component, pigmented, solvent-free epoxy resin system (aggregates not included) designed to be combined with selected mineral or decorative aggregates to produce durable, customisable terrazzo screeds with superior aesthetics and mechanical properties.',
    ar: 'BC Poxy Terrazo 253 هو نظام راتنج إيبوكسي ثنائي المكوّن وملوّن وخالٍ من المذيبات (الركام غير مُضمَّن)، مصمّم للدمج مع ركام معدني أو تزييني مختار لإنتاج طبقات تيرازو متينة وقابلة للتخصيص بمظهر وخصائص ميكانيكية فائقة.',
    es: 'BC Poxy Terrazo 253 es un sistema de resina epoxi bicomponente, pigmentado y sin disolventes (áridos no incluidos), diseñado para combinarse con áridos minerales o decorativos seleccionados y producir pavimentos de terrazo duraderos y personalizables, con estética y propiedades mecánicas superiores.',
  },
  'BC Poxy Terrazo Topcoat': {
    en: 'BC Poxy Terrazzo Topcoat is a two-component, solvent-free, high-build epoxy finishing coat for terrazzo flooring systems. It provides a durable, chemical-resistant, semi-gloss surface that enhances appearance, protects the terrazzo body coat and improves cleanability.',
    ar: 'BC Poxy Terrazzo Topcoat هو طلاء إنهاء إيبوكسي ثنائي المكوّن وخالٍ من المذيبات وعالي السماكة لأنظمة أرضيات التيرازو. يوفّر سطحًا متينًا ومقاومًا للمواد الكيميائية ونصف لامع يعزّز المظهر ويحمي طبقة جسم التيرازو ويحسّن سهولة التنظيف.',
    es: 'BC Poxy Terrazzo Topcoat es una capa de acabado epoxi bicomponente, sin disolventes y de alto espesor, para sistemas de pavimento de terrazo. Proporciona una superficie duradera, resistente a productos químicos y semibrillante que realza la estética, protege la capa base del terrazo y mejora la limpiabilidad.',
  },
  'BC Poxy Terrazzo 1000 LV': {
    en: 'BC Poxy Mortar 1000 is a three-component, solvent-free epoxy system (resin, hardener and quartz silica) for tough, resilient floor repairs and resurfacing. It is 100% solids and applied at 5 mm or greater. Supplied as a 13.45 kg set.',
    ar: 'BC Poxy Mortar 1000 هو نظام إيبوكسي ثلاثي المكوّن وخالٍ من المذيبات (راتنج ومصلّب وسيليكا الكوارتز) لإصلاحات وإعادة تأهيل الأرضيات بصلابة ومرونة. صلب بنسبة 100% ويُطبّق بسماكة 5 مم أو أكثر. يُورّد كطقم 13.45 كجم.',
    es: 'BC Poxy Mortar 1000 es un sistema epoxi tricomponente y sin disolventes (resina, endurecedor y sílice de cuarzo) para reparaciones y rehabilitación de pavimentos resistentes y tenaces. Es 100% sólidos y se aplica a 5 mm o más. Se suministra en juego de 13,45 kg.',
  },
  'BC PU Mortar': {
    en: 'BC PU Mortar is a three-component, heavy-duty polyurethane mortar flooring system for industrial environments that demand excellent chemical resistance, mechanical durability and thermal-shock stability.',
    ar: 'BC PU Mortar هو نظام أرضيات من مونة البولي يوريثان ثلاثي المكوّن وثقيل الخدمة للبيئات الصناعية التي تتطلّب مقاومةً كيميائيةً ممتازةً ومتانةً ميكانيكيةً وثباتًا تجاه الصدمة الحرارية.',
    es: 'BC PU Mortar es un sistema de pavimento de mortero de poliuretano tricomponente y de servicio pesado para entornos industriales que exigen excelente resistencia química, durabilidad mecánica y estabilidad frente al choque térmico.',
  },
  'BC Pucrete SF': {
    en: 'BC Pucrete SF is a smooth, heavy-duty polyurethane-cement floor screed offering excellent resistance to aggressive chemicals, heavy mechanical abrasion and thermal shock. It gives a durable, seamless, non-tainting and impermeable surface for demanding industrial environments. Coverage 6–8 kg/m² at 3 mm.',
    ar: 'BC Pucrete SF هو طبقة أرضية ناعمة من إسمنت البولي يوريثان ثقيلة الخدمة، توفّر مقاومةً ممتازةً للمواد الكيميائية القاسية والتآكل الميكانيكي الشديد والصدمة الحرارية. تمنح سطحًا متينًا ومتجانسًا وغير ملوِّث للأطعمة وغير منفِذ للبيئات الصناعية الصعبة. التغطية 6–8 كجم/م² عند 3 مم.',
    es: 'BC Pucrete SF es un mortero de pavimento liso de poliuretano-cemento, de servicio pesado, que ofrece excelente resistencia a productos químicos agresivos, a la abrasión mecánica intensa y al choque térmico. Aporta una superficie duradera, continua, no contaminante e impermeable para entornos industriales exigentes. Rendimiento de 6–8 kg/m² a 3 mm.',
  },
  'BC Pucrete TF': {
    en: 'BC Pucrete TF is a 6 mm flow-applied, lightly textured, heavy-duty polyurethane-resin floor screed for rapid installation in fast-track construction and refurbishment. It is a water-based polyurethane-cement hybrid with coverage of 10–11 kg/m² at 5 mm.',
    ar: 'BC Pucrete TF هو طبقة أرضية من راتنج البولي يوريثان ثقيلة الخدمة وخفيفة الملمس تُطبّق بالصبّ بسماكة 6 مم، للتركيب السريع في مشاريع البناء والتجديد السريعة. وهو هجين بولي يوريثان-إسمنت يعتمد على الماء بتغطية 10–11 كجم/م² عند 5 مم.',
    es: 'BC Pucrete TF es un mortero de pavimento de resina de poliuretano de servicio pesado, ligeramente texturado y de 6 mm aplicado por colada, para una instalación rápida en construcción y rehabilitación de plazos cortos. Es un híbrido de poliuretano-cemento de base acuosa con un rendimiento de 10–11 kg/m² a 5 mm.',
  },
  'BC Terrazo Aggregates Colored': {
    en: 'BC Terrazo Aggregates (coloured) are crushed and graded igneous aggregates recommended wherever a hard, long-wearing, heavy-duty decorative floor is required.',
    ar: 'BC Terrazo Aggregates (ملوّنة) هي ركام ناري مكسّر ومتدرّج يُوصى به أينما يتطلّب الأمر أرضيةً تزيينيةً صلبةً وطويلة التحمّل وثقيلة الخدمة.',
    es: 'BC Terrazo Aggregates (de colores) son áridos ígneos triturados y clasificados, recomendados allí donde se requiere un suelo decorativo duro, resistente al desgaste y de servicio pesado.',
  },
  'BC Tramark 350': {
    en: 'BC Tramark 350 is a two-component, 100%-solids, low-viscosity epoxy resin system — moisture-insensitive and multipurpose — that can be applied neat or filled for strong adhesion to concrete, steel, wood and other substrates without fillers or non-reactive diluents.',
    ar: 'BC Tramark 350 هو نظام راتنج إيبوكسي ثنائي المكوّن صلب بنسبة 100% ومنخفض اللزوجة — غير حسّاس للرطوبة ومتعدّد الأغراض — يمكن تطبيقه صافيًا أو ممتلئًا لالتصاق قوي بالخرسانة والفولاذ والخشب وغيرها دون مالئات أو مخفّفات غير تفاعلية.',
    es: 'BC Tramark 350 es un sistema de resina epoxi bicomponente, 100% sólidos y de baja viscosidad —insensible a la humedad y multiusos— que puede aplicarse puro o cargado para una fuerte adherencia al hormigón, acero, madera y otros sustratos, sin cargas ni diluyentes no reactivos.',
  },
  'BCI Non Slip Aggregate': {
    en: 'BCI Non-Slip Aggregate is a crushed and graded igneous aggregate (25 kg bag, #30–#8 size range) providing a hard, long-wearing, acid-resistant, non-slip surface for heavy-duty flooring.',
    ar: 'BCI Non Slip Aggregate هو ركام ناري مكسّر ومتدرّج (كيس 25 كجم، مقاس #30–#8) يوفّر سطحًا صلبًا وطويل التحمّل ومقاومًا للأحماض ومانعًا للانزلاق للأرضيات ثقيلة الخدمة.',
    es: 'BCI Non Slip Aggregate es un árido ígneo triturado y clasificado (saco de 25 kg, granulometría #30–#8) que proporciona una superficie dura, resistente al desgaste y a los ácidos y antideslizante para pavimentos de servicio pesado.',
  },
  /* ===== 05 · Protective Coatings ===== */
  'BC Anti Carbo Finish': {
    en: 'BC Anti Carbo Finish is a single-component, acrylic elastomeric anti-carbonation coating used with BC Anti Carbo Primer. It provides deep concrete penetration, water repellency and long-term protection against carbonation and weathering. Supplied in 20 kg.',
    ar: 'BC Anti Carbo Finish هو طلاء مطاطي أكريليكي أحادي المكوّن مضاد للكربنة يُستخدم مع BC Anti Carbo Primer. يوفّر نفاذًا عميقًا في الخرسانة وطردًا للماء وحمايةً طويلة الأمد ضد الكربنة والعوامل الجوية. يُورّد بعبوة 20 كجم.',
    es: 'BC Anti Carbo Finish es un recubrimiento anticarbonatación acrílico elastomérico monocomponente que se usa con BC Anti Carbo Primer. Proporciona penetración profunda en el hormigón, hidrofugación y protección duradera frente a la carbonatación y la intemperie. Se suministra en 20 kg.',
  },
  'BC Anti Carbo Primer': {
    en: 'BC Anti-Carbo Primer is a single-component, ready-to-use silane–siloxane penetrating primer that protects reinforced concrete, bridge decks, pavements, parking structures and exposed surfaces against chloride intrusion, carbonation, moisture ingress, atmospheric contaminants, oils and fuel spills.',
    ar: 'BC Anti Carbo Primer هو برايمر نافذ أحادي المكوّن جاهز للاستخدام من السيلان–سيلوكسان، يحمي الخرسانة المسلّحة وأسطح الجسور والأرصفة ومنشآت المواقف والأسطح المكشوفة من اختراق الكلوريدات والكربنة وتسرّب الرطوبة والملوّثات الجوية والزيوت وانسكاب الوقود.',
    es: 'BC Anti Carbo Primer es una imprimación penetrante de silano–siloxano, monocomponente y lista para usar, que protege el hormigón armado, tableros de puentes, pavimentos, estructuras de aparcamiento y superficies expuestas frente a la entrada de cloruros, la carbonatación, la humedad, los contaminantes atmosféricos, los aceites y los derrames de combustible.',
  },
  'BC Coat EPU': {
    en: 'BC Coat EPU is a two-component, flexible protective coating based on hybrid epoxy–polyurethane resins for the long-term protection of concrete and masonry, combining the adhesion and hardness of epoxy with the flexibility and UV resistance of polyurethane.',
    ar: 'BC Coat EPU هو طلاء حماية مرن ثنائي المكوّن يعتمد على راتنجات هجينة من الإيبوكسي والبولي يوريثان لحماية الخرسانة والمباني طويلة الأمد، يجمع بين التصاق وصلابة الإيبوكسي ومرونة ومقاومة البولي يوريثان للأشعة فوق البنفسجية.',
    es: 'BC Coat EPU es un recubrimiento protector flexible bicomponente basado en resinas híbridas epoxi-poliuretano para la protección duradera de hormigón y mampostería, que combina la adherencia y dureza del epoxi con la flexibilidad y resistencia UV del poliuretano.',
  },
  'BC Coat EPU 400': {
    en: 'BC Coat EPU 400 is a two-component, solvent-free epoxy coating system for lining and waterproofing potable-water-retaining structures, consisting of Part A (epoxy resin) and Part B (hardener) supplied in pre-measured quantities.',
    ar: 'BC Coat EPU 400 هو نظام طلاء إيبوكسي ثنائي المكوّن وخالٍ من المذيبات لتبطين وعزل منشآت احتجاز مياه الشرب، يتكوّن من الجزء A (راتنج إيبوكسي) والجزء B (مصلّب) يُورَّدان بكميات معايَرة مسبقًا.',
    es: 'BC Coat EPU 400 es un sistema de recubrimiento epoxi bicomponente y sin disolventes para el revestimiento e impermeabilización de estructuras de agua potable, formado por la parte A (resina epoxi) y la parte B (endurecedor) suministradas en cantidades predosificadas.',
  },
  'BC Coat Protect': {
    en: 'BC Coat Protect is part of BCI’s protective and industrial coating range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Coat Protect هو جزء من مجموعة الطلاءات الواقية والصناعية من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Coat Protect forma parte de la gama de recubrimientos protectores e industriales de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Coat SHF': {
    en: 'BC Coat SHF is a water-based, sodium-silicate concrete surface hardener, dust-proofer and curing aid that penetrates deeply into cementitious substrates.',
    ar: 'BC Coat SHF هو مصلّب لسطح الخرسانة يعتمد على الماء من سيليكات الصوديوم، يعمل كمانع للغبار ومساعد للمعالجة وينفذ بعمق في الأسطح الإسمنتية.',
    es: 'BC Coat SHF es un endurecedor de superficie para hormigón a base de silicato de sodio y agua, antipolvo y auxiliar de curado, que penetra profundamente en los sustratos cementosos.',
  },
  'BC ECR Eps': {
    en: 'BC ECR Eps is part of BCI’s protective and industrial coating range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC ECR Eps هو جزء من مجموعة الطلاءات الواقية والصناعية من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC ECR Eps forma parte de la gama de recubrimientos protectores e industriales de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Epoxy Primer 349': {
    en: 'BC Epoxy Primer 349 is a two-component, medium-viscosity, high-performance epoxy primer that seals substrate porosity and enhances adhesion for epoxy and polyurethane coatings; it can also be used as a scratch coat with graded quartz sand.',
    ar: 'BC Epoxy Primer 349 هو برايمر إيبوكسي ثنائي المكوّن متوسط اللزوجة وعالي الأداء، يسدّ مسامية السطح ويعزّز التصاق طلاءات الإيبوكسي والبولي يوريثان؛ ويمكن استخدامه أيضًا كطبقة خدش مع رمل الكوارتز المتدرّج.',
    es: 'BC Epoxy Primer 349 es una imprimación epoxi bicomponente, de viscosidad media y alto rendimiento, que sella la porosidad del sustrato y mejora la adherencia de recubrimientos epoxi y de poliuretano; también puede usarse como capa de rascado con arena de cuarzo graduada.',
  },
  'BC Epoxy Primer 349 30': {
    en: 'BC Epoxy Primer 349 30 is a two-component, medium-viscosity, high-performance epoxy primer that seals substrate porosity and enhances adhesion for epoxy and polyurethane coatings; it can also be used as a scratch coat with graded quartz sand.',
    ar: 'BC Epoxy Primer 349 30 هو برايمر إيبوكسي ثنائي المكوّن متوسط اللزوجة وعالي الأداء، يسدّ مسامية السطح ويعزّز التصاق طلاءات الإيبوكسي والبولي يوريثان؛ ويمكن استخدامه أيضًا كطبقة خدش مع رمل الكوارتز المتدرّج.',
    es: 'BC Epoxy Primer 349 30 es una imprimación epoxi bicomponente, de viscosidad media y alto rendimiento, que sella la porosidad del sustrato y mejora la adherencia de recubrimientos epoxi y de poliuretano; también puede usarse como capa de rascado con arena de cuarzo graduada.',
  },
  'BC Finish Glossy': {
    en: 'BC Finish Glossy is a two-component, high-gloss aliphatic polyurethane coating that combines acrylic and aliphatic polyurethane properties, providing durable chemical and weather resistance that outlasts conventional acrylic, alkyd, epoxy, polyester and urethane finishes.',
    ar: 'BC Finish Glossy هو طلاء بولي يوريثان أليفاتي ثنائي المكوّن عالي اللمعان يجمع بين خصائص الأكريليك والبولي يوريثان الأليفاتي، يوفّر مقاومةً متينةً للمواد الكيميائية والعوامل الجوية تفوق الإنهاءات التقليدية من الأكريليك والألكيد والإيبوكسي والبوليستر واليوريثان.',
    es: 'BC Finish Glossy es un recubrimiento de poliuretano alifático bicomponente de alto brillo que combina las propiedades del acrílico y del poliuretano alifático, aportando una resistencia química y a la intemperie duradera que supera a los acabados convencionales de acrílico, alquídico, epoxi, poliéster y uretano.',
  },
  'BC Finish Matt': {
    en: 'BC Finish Matt is a two-component aliphatic polyurethane coating with a durable matt finish, combining acrylic and aliphatic polyurethane properties for excellent chemical and weather resistance.',
    ar: 'BC Finish Matt هو طلاء بولي يوريثان أليفاتي ثنائي المكوّن بإنهاء مطفأ متين، يجمع بين خصائص الأكريليك والبولي يوريثان الأليفاتي لمقاومة ممتازة للمواد الكيميائية والعوامل الجوية.',
    es: 'BC Finish Matt es un recubrimiento de poliuretano alifático bicomponente con un acabado mate duradero, que combina las propiedades del acrílico y del poliuretano alifático para una excelente resistencia química y a la intemperie.',
  },
  'BC Fire Proof 5 GP': {
    en: 'BC Fire Proof 5 GP is a gypsum-based, spray-applied fire-resistive material for the interior protection of structural steel, compliant with IBC requirements for buildings up to 22.9 m in height. Supplied in 20 kg bags.',
    ar: 'BC Fire Proof 5 GP هو مادة مقاومة للحريق تعتمد على الجبس وتُطبّق بالرش للحماية الداخلية للفولاذ الإنشائي، متوافقة مع متطلبات IBC للمباني حتى ارتفاع 22.9 م. تُورّد في أكياس 20 كجم.',
    es: 'BC Fire Proof 5 GP es un material ignífugo a base de yeso, aplicado por proyección, para la protección interior del acero estructural, conforme a los requisitos del IBC para edificios de hasta 22,9 m de altura. Se suministra en sacos de 20 kg.',
  },
  'BC Fix Primer': {
    en: 'BC Fix Primer is a high-performance, film-forming and penetrating silane–siloxane primer that stabilises porous concrete and masonry surfaces prior to the application of water-based protective coatings.',
    ar: 'BC Fix Primer هو برايمر سيلان–سيلوكسان عالي الأداء مكوّن للغشاء ونافذ، يثبّت أسطح الخرسانة والمباني المسامية قبل تطبيق الطلاءات الواقية التي تعتمد على الماء.',
    es: 'BC Fix Primer es una imprimación de silano–siloxano de alto rendimiento, formadora de película y penetrante, que estabiliza superficies porosas de hormigón y mampostería antes de aplicar recubrimientos protectores de base acuosa.',
  },
  'BC GRP Line': {
    en: 'BC GRP Line (white) is a three-pack, high-chemical-resistance vinyl-ester lining with fibreglass reinforcement, ideal for tank and pipe interiors that require superior resistance to acids and solvents. Supplied as a 20 kg set.',
    ar: 'BC GRP Line (أبيض) هو تبطين من فينيل إستر ثلاثي العبوات عالي المقاومة الكيميائية مع تدعيم بالألياف الزجاجية، مثالي لأسطح الخزانات والأنابيب الداخلية التي تتطلّب مقاومةً فائقةً للأحماض والمذيبات. يُورّد كطقم 20 كجم.',
    es: 'BC GRP Line (blanco) es un revestimiento de viniléster de tres componentes con alta resistencia química y refuerzo de fibra de vidrio, ideal para interiores de tanques y tuberías que requieren una resistencia superior a ácidos y disolventes. Se suministra en juego de 20 kg.',
  },
  'BC GRP Line Primer': {
    en: 'BC GRP Line Primer is a three-pack, vinyl-ester-based primer with inert fillers and fibreglass reinforcement, offering excellent chemical resistance for steel and concrete surfaces in tank linings and harsh environments. Supplied as a 20 kg set.',
    ar: 'BC GRP Line Primer هو برايمر يعتمد على فينيل إستر ثلاثي العبوات مع مالئات خاملة وتدعيم بالألياف الزجاجية، يوفّر مقاومةً كيميائيةً ممتازةً لأسطح الفولاذ والخرسانة في تبطين الخزانات والبيئات القاسية. يُورّد كطقم 20 كجم.',
    es: 'BC GRP Line Primer es una imprimación a base de viniléster de tres componentes con cargas inertes y refuerzo de fibra de vidrio, que ofrece excelente resistencia química para superficies de acero y hormigón en revestimientos de tanques y entornos agresivos. Se suministra en juego de 20 kg.',
  },
  'BC GRP Matt': {
    en: 'BC GRP Matt is a high-quality, non-woven glass-fibre reinforcement mat made from randomly oriented chopped glass filaments (approx. 50 mm) bonded with either a powder or an emulsion binder.',
    ar: 'BC GRP Matt هو حصيرة تدعيم من الألياف الزجاجية غير المنسوجة عالية الجودة، مصنوعة من خيوط زجاجية مقطّعة وموجّهة عشوائيًا (نحو 50 مم) مرتبطة برابط مسحوقي أو مستحلب.',
    es: 'BC GRP Matt es un fieltro de refuerzo de fibra de vidrio no tejido de alta calidad, fabricado con filamentos de vidrio cortados orientados aleatoriamente (aprox. 50 mm) unidos con un ligante en polvo o en emulsión.',
  },
  'BC GRP Resin': {
    en: 'BC GRP Resin is a three-pack, high-chemical-resistance vinyl-ester lining with inert fillers and fibreglass reinforcement for steel and concrete surfaces, ideal for tank and pipe linings that require superior chemical resistance. Supplied as a 20 kg set.',
    ar: 'BC GRP Resin هو تبطين من فينيل إستر ثلاثي العبوات عالي المقاومة الكيميائية مع مالئات خاملة وتدعيم بالألياف الزجاجية لأسطح الفولاذ والخرسانة، مثالي لتبطين الخزانات والأنابيب التي تتطلّب مقاومةً كيميائيةً فائقة. يُورّد كطقم 20 كجم.',
    es: 'BC GRP Resin es un revestimiento de viniléster de tres componentes con alta resistencia química, cargas inertes y refuerzo de fibra de vidrio para superficies de acero y hormigón, ideal para revestimientos de tanques y tuberías que requieren una resistencia química superior. Se suministra en juego de 20 kg.',
  },
  'BC MC Urethane': {
    en: 'BC MC Urethane is a single-component, moisture-curing polyurethane coating that forms a seamless, elastic and durable membrane — ideal as a topcoat over BCI polyurea systems and as a bonding layer for BCI HMP in bridge-deck waterproofing.',
    ar: 'BC MC Urethane هو طلاء بولي يوريثان أحادي المكوّن يتصلّب بالرطوبة ويكوّن غشاءً متجانسًا ومرنًا ومتينًا — مثالي كطبقة علوية فوق أنظمة البولي يوريا من BCI وكطبقة ربط لمنتج BCI HMP في عزل أسطح الجسور.',
    es: 'BC MC Urethane es un recubrimiento de poliuretano monocomponente de curado por humedad que forma una membrana continua, elástica y duradera; ideal como capa de acabado sobre los sistemas de poliurea de BCI y como capa de unión para BCI HMP en la impermeabilización de tableros de puentes.',
  },
  'BC Poxy Primer 1000 LV': {
    en: 'BC Poxy Clear Resin 1000 LV is a modified, ultra-clear, low-viscosity epoxy resin for high-clarity applications including castings, coatings, laminates, adhesives and decorative encapsulations.',
    ar: 'BC Poxy Clear Resin 1000 LV هو راتنج إيبوكسي معدّل فائق الشفافية ومنخفض اللزوجة لتطبيقات عالية الوضوح تشمل الصبّ والطلاء والصفائح والمواد اللاصقة والتغليف التزييني.',
    es: 'BC Poxy Clear Resin 1000 LV es una resina epoxi modificada, ultratransparente y de baja viscosidad para aplicaciones de alta claridad como colados, recubrimientos, laminados, adhesivos y encapsulados decorativos.',
  },
  'BC Poxy Primer 349': {
    en: 'BC Poxy Primer 349 is a two-component, medium-viscosity, high-performance epoxy primer that seals substrate porosity and enhances adhesion for epoxy and polyurethane coatings; it can also be used as a scratch coat with graded quartz sand.',
    ar: 'BC Poxy Primer 349 هو برايمر إيبوكسي ثنائي المكوّن متوسط اللزوجة وعالي الأداء، يسدّ مسامية السطح ويعزّز التصاق طلاءات الإيبوكسي والبولي يوريثان؛ ويمكن استخدامه أيضًا كطبقة خدش مع رمل الكوارتز المتدرّج.',
    es: 'BC Poxy Primer 349 es una imprimación epoxi bicomponente, de viscosidad media y alto rendimiento, que sella la porosidad del sustrato y mejora la adherencia de recubrimientos epoxi y de poliuretano; también puede usarse como capa de rascado con arena de cuarzo graduada.',
  },
  'BC Poxy Primer 350': {
    en: 'BC Epoxy Primer 350 is a two-component, solvent-free, low-viscosity epoxy primer that penetrates deeply into concrete substrates, improving adhesion and surface integrity.',
    ar: 'BC Epoxy Primer 350 هو برايمر إيبوكسي ثنائي المكوّن وخالٍ من المذيبات ومنخفض اللزوجة، ينفذ بعمق في الأسطح الخرسانية محسّنًا الالتصاق وسلامة السطح.',
    es: 'BC Epoxy Primer 350 es una imprimación epoxi bicomponente, sin disolventes y de baja viscosidad, que penetra profundamente en los sustratos de hormigón, mejorando la adherencia y la integridad de la superficie.',
  },
  'BC Poxy Zinc Rich 859': {
    en: 'BC Poxy Zinc Rich 859 is a two-component, metallic zinc-rich epoxy primer (2 kg set, 8 m²/L at 50 µm, one coat) for durable corrosion protection of steel substrates.',
    ar: 'BC Poxy Zinc Rich 859 هو برايمر إيبوكسي ثنائي المكوّن غني بالزنك المعدني (طقم 2 كجم، 8 م²/لتر عند 50 ميكرون، طبقة واحدة) لحماية متينة من التآكل للأسطح الفولاذية.',
    es: 'BC Poxy Zinc Rich 859 es una imprimación epoxi bicomponente rica en zinc metálico (juego de 2 kg, 8 m²/L a 50 µm, una capa) para una protección duradera contra la corrosión de sustratos de acero.',
  },
  'BC Prime CB 100': {
    en: 'BC Prime CB 100 is a cement-based primer concentrate that regulates substrate absorption and enhances bonding for thin-coat finishing renders and decorative coatings. It equalises surface porosity, improves adhesion and extends the open time of finishing products.',
    ar: 'BC Prime CB 100 هو مركّز برايمر يعتمد على الإسمنت ينظّم امتصاص السطح ويعزّز الالتصاق لللياسات النهائية الرقيقة والطلاءات التزيينية. يوازن مسامية السطح ويحسّن الالتصاق ويطيل زمن العمل لمنتجات الإنهاء.',
    es: 'BC Prime CB 100 es un concentrado de imprimación de base cementosa que regula la absorción del sustrato y mejora la adherencia de revoques de acabado de capa fina y recubrimientos decorativos. Iguala la porosidad de la superficie, mejora la adherencia y prolonga el tiempo abierto de los productos de acabado.',
  },
  'BC Primer 349': {
    en: 'BC Primer 349 is a two-component, medium-viscosity, high-performance epoxy primer that seals substrate porosity and enhances adhesion for epoxy and polyurethane coatings; it can also be used as a scratch coat with graded quartz sand.',
    ar: 'BC Primer 349 هو برايمر إيبوكسي ثنائي المكوّن متوسط اللزوجة وعالي الأداء، يسدّ مسامية السطح ويعزّز التصاق طلاءات الإيبوكسي والبولي يوريثان؛ ويمكن استخدامه أيضًا كطبقة خدش مع رمل الكوارتز المتدرّج.',
    es: 'BC Primer 349 es una imprimación epoxi bicomponente, de viscosidad media y alto rendimiento, que sella la porosidad del sustrato y mejora la adherencia de recubrimientos epoxi y de poliuretano; también puede usarse como capa de rascado con arena de cuarzo graduada.',
  },
  'BC PU Clear': {
    en: 'BC PU Clear is part of BCI’s protective and industrial coating range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC PU Clear هو جزء من مجموعة الطلاءات الواقية والصناعية من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC PU Clear forma parte de la gama de recubrimientos protectores e industriales de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC PU Primer 810': {
    en: 'BC PU Primer 810 is a two-component, polyurethane-based adhesion-promoting primer for use with BC liquid-applied membrane systems — applied when the maximum overcoating interval has been exceeded or when strong bonding between existing substrates and new polyurethane coatings is required.',
    ar: 'BC PU Primer 810 هو برايmer معزّز للالتصاق ثنائي المكوّن يعتمد على البولي يوريثان للاستخدام مع أنظمة الأغشية سائلة التطبيق من BC — يُطبّق عند تجاوز الحد الأقصى لفترة إعادة الطلاء أو عند الحاجة إلى ربط قوي بين الأسطح القائمة والطلاءات البولي يوريثانية الجديدة.',
    es: 'BC PU Primer 810 es una imprimación promotora de adherencia bicomponente a base de poliuretano para usar con los sistemas de membrana líquida de BC; se aplica cuando se ha superado el intervalo máximo de repintado o cuando se requiere una fuerte unión entre los sustratos existentes y los nuevos recubrimientos de poliuretano.',
  },
  'BC PU TC': {
    en: 'BC PU TC is a high-performance, single-component liquid polyurethane tack coat that provides excellent adhesion, flexibility and waterproofing support for polyurethane, polyurea and protective-coating systems.',
    ar: 'BC PU TC هو طبقة ربط بولي يوريثانية سائلة أحادية المكوّن عالية الأداء، توفّر التصاقًا ومرونةً ودعمًا للعزل المائي ممتازًا لأنظمة البولي يوريثان والبولي يوريا والطلاءات الواقية.',
    es: 'BC PU TC es una capa de adherencia (tack coat) de poliuretano líquido monocomponente de alto rendimiento, que ofrece excelente adherencia, flexibilidad y soporte de impermeabilización para sistemas de poliuretano, poliurea y recubrimientos protectores.',
  },
  'BC PU Topcoat': {
    en: 'BC PU Topcoat is part of BCI’s protective and industrial coating range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC PU Topcoat هو جزء من مجموعة الطلاءات الواقية والصناعية من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC PU Topcoat forma parte de la gama de recubrimientos protectores e industriales de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Road Mark': {
    en: 'BC Road Mark is a high-performance, hot-applied road-marking compound for durable, skid-resistant, retro-reflective markings on asphalt and primed concrete, providing long-term visibility under heavy traffic.',
    ar: 'BC Road Mark هو مركّب دهان طرق عالي الأداء يُطبّق على الساخن لعلامات متينة ومقاومة للانزلاق وعاكسة على الأسفلت والخرسانة المُجهّزة بالبرايمر، يوفّر وضوحًا طويل الأمد تحت الحركة الكثيفة.',
    es: 'BC Road Mark es un compuesto de señalización vial de alto rendimiento, de aplicación en caliente, para marcas duraderas, antideslizantes y retrorreflectantes sobre asfalto y hormigón imprimado, que proporciona visibilidad duradera bajo tráfico intenso.',
  },
  'BC Seal Primer 175': {
    en: 'BC Seal Primer 175 is a two-part epoxy primer/sealer with excellent adhesion to concrete and steel, providing a durable base for chemically resistant coatings and toppings. Supplied in 30 kg.',
    ar: 'BC Seal Primer 175 هو برايمر/مانع تسرّب إيبوكسي ثنائي الأجزاء بالتصاق ممتاز بالخرسانة والفولاذ، يوفّر قاعدةً متينةً للطلاءات والطبقات المقاومة للمواد الكيميائية. يُورّد بعبوة 30 كجم.',
    es: 'BC Seal Primer 175 es una imprimación/sellador epoxi de dos componentes con excelente adherencia al hormigón y al acero, que proporciona una base duradera para recubrimientos y capas resistentes a productos químicos. Se suministra en 30 kg.',
  },
  'BC Sealer Matt': {
    en: 'BC Sealer Matt is a one-component, water-based acrylic sealer (20 kg) offering fast-drying, stain-resistant and water-blush-resistant protection without solvent odours.',
    ar: 'BC Sealer Matt هو مانع تسرّب أكريليكي أحادي المكوّن يعتمد على الماء (20 كجم) يوفّر حمايةً سريعة الجفاف ومقاومة للبقع وللابيضاض المائي دون روائح المذيبات.',
    es: 'BC Sealer Matt es un sellador acrílico monocomponente de base acuosa (20 kg) que ofrece protección de secado rápido, resistente a las manchas y al blanqueo por agua, sin olores a disolvente.',
  },
  'BC Stone Protection': {
    en: 'BC Stone Protection is a high-performance, solvent-based acrylic polymer sealer (6–10 m²/L per coat) for exterior architectural concrete, exposed aggregate and decorative cementitious surfaces, providing clear, UV-resistant, non-yellowing protection and enhanced natural lustre.',
    ar: 'BC Stone Protection هو مانع تسرّب من بوليمر أكريليكي عالي الأداء يعتمد على المذيبات (6–10 م²/لتر للطبقة) للخرسانة المعمارية الخارجية والركام المكشوف والأسطح الإسمنتية التزيينية، يوفّر حمايةً شفافةً مقاومةً للأشعة فوق البنفسجية وغير مصفرّة ولمعانًا طبيعيًا معزّزًا.',
    es: 'BC Stone Protection es un sellador de polímero acrílico de alto rendimiento a base de disolvente (6–10 m²/L por capa) para hormigón arquitectónico exterior, áridos vistos y superficies cementosas decorativas, que aporta una protección transparente, resistente a los UV y no amarilleante, realzando el lustre natural.',
  },
  'BC Stone Protection WB': {
    en: 'BC Stone Protection WB is a high-performance, water-based acrylic polymer sealer (6–10 m²/L per coat) for exterior architectural concrete, exposed aggregate and decorative cementitious surfaces, providing clear, UV-resistant, non-yellowing protection and enhanced natural lustre.',
    ar: 'BC Stone Protection WB هو مانع تسرّب من بوليمر أكريليكي عالي الأداء يعتمد على الماء (6–10 م²/لتر للطبقة) للخرسانة المعمارية الخارجية والركام المكشوف والأسطح الإسمنتية التزيينية، يوفّر حمايةً شفافةً مقاومةً للأشعة فوق البنفسجية وغير مصفرّة ولمعانًا طبيعيًا معزّزًا.',
    es: 'BC Stone Protection WB es un sellador de polímero acrílico de alto rendimiento de base acuosa (6–10 m²/L por capa) para hormigón arquitectónico exterior, áridos vistos y superficies cementosas decorativas, que aporta una protección transparente, resistente a los UV y no amarilleante, realzando el lustre natural.',
  },
  'BC Tec Acrylic': {
    en: 'BC Tec Acrylic is a one-component, water-based acrylic sealer for fast-setting, stain-resistant and water-blush-resistant protection of concrete and masonry surfaces, without objectionable solvent odours.',
    ar: 'BC Tec Acrylic هو مانع تسرّب أكريليكي أحادي المكوّن يعتمد على الماء، لحماية سريعة الشكّ ومقاومة للبقع وللابيضاض المائي لأسطح الخرسانة والمباني، دون روائح مذيبات مزعجة.',
    es: 'BC Tec Acrylic es un sellador acrílico monocomponente de base acuosa para una protección de fraguado rápido, resistente a las manchas y al blanqueo por agua de superficies de hormigón y mampostería, sin olores a disolvente molestos.',
  },
  'BC Tec Sealer 201': {
    en: 'BC Tec Sealer 201 is a one-component, non-yellowing acrylic copolymer sealer (20 L pack, approx. 2.8 m²/L at 100 µm over two coats) for clear, fast-drying protection and colour enhancement of BC Micro Cement.',
    ar: 'BC Tec Sealer 201 هو مانع تسرّب من كوبوليمر أكريليكي أحادي المكوّن وغير مصفرّ (عبوة 20 لتر، نحو 2.8 م²/لتر عند 100 ميكرون على طبقتين) لحماية شفافة وسريعة الجفاف وتعزيز لون BC Micro Cement.',
    es: 'BC Tec Sealer 201 es un sellador de copolímero acrílico monocomponente y no amarilleante (envase de 20 L, aprox. 2,8 m²/L a 100 µm en dos capas) para una protección transparente y de secado rápido que realza el color de BC Micro Cement.',
  },
  /* ===== 06 · Concrete Repair ===== */
  'BC Acry Profile': {
    en: 'BC Acry Profile is a premium decorative acrylic interior wall coating that creates an elegant textured finish with subtle reflective effects, producing a luxurious silk-like appearance with soft irregular patterns and gentle metallic reflections.',
    ar: 'BC Acry Profile هو طلاء جدران داخلي أكريليكي تزييني فاخر يخلق إنهاءً أنيقًا مزخرفًا بتأثيرات عاكسة خفيفة، منتجًا مظهرًا فاخرًا شبيهًا بالحرير بأنماط ناعمة غير منتظمة وانعكاسات معدنية لطيفة.',
    es: 'BC Acry Profile es un revestimiento acrílico decorativo prémium para paredes interiores que crea un elegante acabado texturado con sutiles efectos reflectantes, produciendo un aspecto lujoso similar a la seda con patrones suaves irregulares y delicados reflejos metálicos.',
  },
  'BC Block Mortar': {
    en: 'BC Block Mortar is a high-performance, pre-blended hydraulic adhesive for AAC blocks, panels and other lightweight masonry units. Made from cement, graded aggregates, bonding agents and special polymers, it produces a thixotropic, water-resistant mortar with excellent open time, workability and mechanical strength.',
    ar: 'BC Block Mortar هو لاصق هيدروليكي عالي الأداء مخلوط مسبقًا لكتل الخرسانة الخلوية (AAC) والألواح ووحدات البناء الخفيفة الأخرى. مصنوع من الإسمنت والركام المتدرّج وعوامل الربط وبوليمرات خاصة، ينتج مونةً ثيكسوتروبية مقاومةً للماء بزمن عمل وقابلية تشغيل وقوة ميكانيكية ممتازة.',
    es: 'BC Block Mortar es un adhesivo hidráulico de alto rendimiento premezclado para bloques de hormigón celular (AAC), paneles y otras unidades de mampostería ligera. Elaborado con cemento, áridos graduados, agentes de unión y polímeros especiales, produce un mortero tixotrópico y resistente al agua con excelente tiempo abierto, trabajabilidad y resistencia mecánica.',
  },
  'BC EPR Injection': {
    en: 'BC EPR Injection is a 100%-reactive, two-component epoxy resin system for the pressure injection and sealing of fine cracks in concrete. A high-modulus, moisture-insensitive adhesive with very low viscosity, it penetrates deeply into microcracks and voids for permanent structural restoration and bonding.',
    ar: 'BC EPR Injection هو نظام راتنج إيبوكسي ثنائي المكوّن تفاعلي بنسبة 100% لحقن وإغلاق الشقوق الدقيقة في الخرسانة بالضغط. وهو لاصق عالي المعامل وغير حسّاس للرطوبة ومنخفض اللزوجة جدًا، ينفذ بعمق في الشقوق الدقيقة والفراغات لاستعادة هيكلية وربط دائمين.',
    es: 'BC EPR Injection es un sistema de resina epoxi bicomponente 100% reactivo para la inyección a presión y el sellado de fisuras finas en hormigón. Adhesivo de alto módulo, insensible a la humedad y de muy baja viscosidad, penetra profundamente en microfisuras y huecos para una restauración estructural y una unión permanentes.',
  },
  'BC Finish 20 Plus': {
    en: 'BC Finish 20 Plus is a high-quality, premixed, sprayable finishing render for achieving smooth, even, decorative or creatively textured finishes.',
    ar: 'BC Finish 20 Plus هو لياسة إنهاء عالية الجودة مخلوطة مسبقًا وقابلة للرش، لتحقيق إنهاءات ناعمة ومتجانسة أو تزيينية أو ذات ملمس إبداعي.',
    es: 'BC Finish 20 Plus es un revoque de acabado premezclado y proyectable de alta calidad, para lograr acabados lisos, uniformes, decorativos o con texturas creativas.',
  },
  'BC Level Screed': {
    en: 'BC Level Screed is a one-component, cementitious self-levelling underlayment (20 kg bag, 1.84 m² at 6 mm) for rapid-setting, smooth and durable substrates under final floor finishes.',
    ar: 'BC Level Screed هو طبقة تسوية تحتية إسمنتية أحادية المكوّن وذاتية التسوية (كيس 20 كجم، 1.84 م² عند 6 مم) لأسطح سريعة الشكّ وناعمة ومتينة تحت الإنهاءات النهائية للأرضيات.',
    es: 'BC Level Screed es una capa de nivelación cementosa monocomponente y autonivelante (saco de 20 kg, 1,84 m² a 6 mm) para sustratos de fraguado rápido, lisos y duraderos bajo los acabados finales del suelo.',
  },
  'BC Micro Base': {
    en: 'BC Micro Cement Base is a mineral micro-mortar with polymers, aggregates and waterproof additives for preparing substrates and covering tile joints before applying BC Tec Micro Cement, suitable for indoor and outdoor use. 20 kg covers approx. 5.7 m² at 2 mm.',
    ar: 'BC Micro Cement Base هو مونة دقيقة معدنية ببوليمرات وركام وإضافات مقاومة للماء لتحضير الأسطح وتغطية فواصل البلاط قبل تطبيق BC Tec Micro Cement، مناسبة للاستخدام الداخلي والخارجي. يغطّي 20 كجم نحو 5.7 م² عند 2 مم.',
    es: 'BC Micro Cement Base es un micromortero mineral con polímeros, áridos y aditivos impermeabilizantes para preparar sustratos y cubrir juntas de baldosas antes de aplicar BC Tec Micro Cement, apto para interior y exterior. 20 kg cubren aprox. 5,7 m² a 2 mm.',
  },
  'BC Micro Cement': {
    en: 'BC Micro Cement is a one-component, ready-to-use polymer-cement system for jointless finishing on floors, walls, ceilings, countertops, showers and swimming pools, covering joints and fissures with an ultra-thin micro-topping. 20 kg covers approx. 5.7 m² at 2 mm.',
    ar: 'BC Micro Cement هو نظام بوليمري إسمنتي أحادي المكوّن جاهز للاستخدام للإنهاء بلا فواصل على الأرضيات والجدران والأسقف وأسطح العمل والدشّات والمسابح، يغطّي الفواصل والشقوق بطبقة دقيقة فائقة الرقّة. يغطّي 20 كجم نحو 5.7 م² عند 2 مم.',
    es: 'BC Micro Cement es un sistema polímero-cemento monocomponente y listo para usar, para acabados sin juntas en suelos, paredes, techos, encimeras, duchas y piscinas, cubriendo juntas y fisuras con un microrevestimiento ultrafino. 20 kg cubren aprox. 5,7 m² a 2 mm.',
  },
  'BC Plaster HT 150': {
    en: 'BC Plaster HT 150 is part of BCI’s concrete repair and surface-preparation range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Plaster HT 150 هو جزء من مجموعة إصلاح الخرسانة وتحضير الأسطح من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Plaster HT 150 forma parte de la gama de reparación de hormigón y preparación de superficies de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Plaster M': {
    en: 'BC Plaster M is a factory-blended, cement-based plaster of hydraulic binders, graded aggregates and performance additives, supplied as a ready-to-use dry powder. It needs only the addition of clean water on site to produce a smooth, workable plaster.',
    ar: 'BC Plaster M هو لياسة تعتمد على الإسمنت مخلوطة في المصنع من روابط هيدروليكية وركام متدرّج وإضافات أداء، تُورّد كمسحوق جاف جاهز للاستخدام. لا تتطلّب سوى إضافة الماء النظيف في الموقع لإنتاج لياسة ناعمة وقابلة للتشغيل.',
    es: 'BC Plaster M es un revoque de base cementosa mezclado en fábrica, con ligantes hidráulicos, áridos graduados y aditivos de rendimiento, suministrado como polvo seco listo para usar. Solo requiere añadir agua limpia en obra para producir un revoque liso y trabajable.',
  },
  'BC Plaster M LC': {
    en: 'BC Plaster M LC is a high-quality, factory-blended, cement-based plastering material made of hydraulic binders, well-graded aggregates and performance-enhancing additives.',
    ar: 'BC Plaster M LC هو مادة لياسة عالية الجودة تعتمد على الإسمنت ومخلوطة في المصنع من روابط هيدروليكية وركام جيد التدرّج وإضافات معزّزة للأداء.',
    es: 'BC Plaster M LC es un material de revoque de base cementosa de alta calidad, mezclado en fábrica, compuesto por ligantes hidráulicos, áridos bien graduados y aditivos que mejoran el rendimiento.',
  },
  'BC Plaster SM': {
    en: 'BC Plaster SM is part of BCI’s concrete repair and surface-preparation range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Plaster SM هو جزء من مجموعة إصلاح الخرسانة وتحضير الأسطح من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Plaster SM forma parte de la gama de reparación de hormigón y preparación de superficies de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Poxy Mort 1000': {
    en: 'BC Poxy Mort 1000 is a three-component, 100%-solids, high-modulus epoxy resin system formulated as a structural adhesive, patching and repair mortar for concrete. It bonds to both dry and damp surfaces and offers exceptional mechanical strength, chemical resistance and adhesion.',
    ar: 'BC Poxy Mort 1000 هو نظام راتنج إيبوكسي ثلاثي المكوّن صلب بنسبة 100% وعالي المعامل، مُركّب كلاصق إنشائي ومونة ترقيع وإصلاح للخرسانة. يلتصق بالأسطح الجافة والرطبة ويوفّر قوةً ميكانيكيةً ومقاومةً كيميائيةً والتصاقًا استثنائيًا.',
    es: 'BC Poxy Mort 1000 es un sistema de resina epoxi tricomponente, 100% sólidos y de alto módulo, formulado como adhesivo estructural y mortero de parcheo y reparación para hormigón. Se adhiere a superficies secas y húmedas y ofrece una resistencia mecánica, resistencia química y adherencia excepcionales.',
  },
  'BC Poxy Mort 1000 LV': {
    en: 'BC Poxy Mortar 1000 LV is a 100%-reactive, low-viscosity, two-component, moisture-insensitive epoxy adhesive and binder for structural bonding, priming, sealing and mortar-repair applications.',
    ar: 'BC Poxy Mortar 1000 LV هو لاصق ورابط إيبوكسي ثنائي المكوّن تفاعلي بنسبة 100% ومنخفض اللزوجة وغير حسّاس للرطوبة، لتطبيقات الربط الإنشائي والتأسيس والإغلاق وإصلاح المونة.',
    es: 'BC Poxy Mortar 1000 LV es un adhesivo y ligante epoxi 100% reactivo, de baja viscosidad, bicomponente e insensible a la humedad, para aplicaciones de unión estructural, imprimación, sellado y reparación con mortero.',
  },
  'BC Poxy Mortar 5000': {
    en: 'BC Poxy Mortar 5000 is part of BCI’s concrete repair and surface-preparation range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Poxy Mortar 5000 هو جزء من مجموعة إصلاح الخرسانة وتحضير الأسطح من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Poxy Mortar 5000 forma parte de la gama de reparación de hormigón y preparación de superficies de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Poxy Putty 2000': {
    en: 'BC Poxy Putty 2000 is a two-component, high-strength epoxy putty (3 kg set yielding 1.75 L) for durable bonding, bedding and concrete-repair applications.',
    ar: 'BC Poxy Putty 2000 هو معجون إيبوكسي ثنائي المكوّن عالي القوة (طقم 3 كجم ينتج 1.75 لتر) لتطبيقات الربط والتثبيت وإصلاح الخرسانة المتينة.',
    es: 'BC Poxy Putty 2000 es una masilla epoxi bicomponente de alta resistencia (juego de 3 kg que rinde 1,75 L) para aplicaciones duraderas de unión, asiento y reparación de hormigón.',
  },
  'BC Poxy Putty 3000': {
    en: 'BC Poxy Putty 3000 is a two-component, high-strength, non-slumping epoxy putty for use as a bedding, adhesive or repair material. A 10 kg kit provides a tough, resilient finish suitable for concrete and structural repairs.',
    ar: 'BC Poxy Putty 3000 هو معجون إيبوكسي ثنائي المكوّن عالي القوة وغير متهدّل للاستخدام كمادة تثبيت أو لاصق أو إصلاح. يوفّر طقم 10 كجم إنهاءً متينًا ومرنًا مناسبًا للخرسانة والإصلاحات الإنشائية.',
    es: 'BC Poxy Putty 3000 es una masilla epoxi bicomponente, de alta resistencia y sin descuelgue, para usar como material de asiento, adhesivo o reparación. Un kit de 10 kg proporciona un acabado tenaz y resistente, apto para hormigón y reparaciones estructurales.',
  },
  'BC Poxy Putty 4000': {
    en: 'BC Poxy Putty 4000 is a two-component, high-strength epoxy putty (3 kg set yielding 1.75 L) for durable bonding, bedding and concrete-repair applications.',
    ar: 'BC Poxy Putty 4000 هو معجون إيبوكسي ثنائي المكوّن عالي القوة (طقم 3 كجم ينتج 1.75 لتر) لتطبيقات الربط والتثبيت وإصلاح الخرسانة المتينة.',
    es: 'BC Poxy Putty 4000 es una masilla epoxi bicomponente de alta resistencia (juego de 3 kg que rinde 1,75 L) para aplicaciones duraderas de unión, asiento y reparación de hormigón.',
  },
  'BC Profile Lora': {
    en: 'BC Profile Lora is a premium-grade, ready-to-use decorative wall finish formulated with multiple homogeneous fillers that create a unique textured spectrum effect when sprayed onto interior or exterior surfaces.',
    ar: 'BC Profile Lora هو إنهاء جدران تزييني فاخر جاهز للاستخدام، مُركّب بمالئات متجانسة متعددة تخلق تأثيرًا طيفيًا مزخرفًا فريدًا عند رشّه على الأسطح الداخلية أو الخارجية.',
    es: 'BC Profile Lora es un acabado decorativo prémium para paredes, listo para usar, formulado con múltiples cargas homogéneas que crean un efecto de espectro texturado único al proyectarse sobre superficies interiores o exteriores.',
  },
  'BC Repair 100': {
    en: 'BC Repair 100 is a high-quality, water-resistant cementitious repair mortar (20 kg bag, 1.10 m² at 10 mm, one coat) for durable crack and surface repair up to 4 mm wide on concrete.',
    ar: 'BC Repair 100 هو مونة إصلاح إسمنتية عالية الجودة ومقاومة للماء (كيس 20 كجم، 1.10 م² عند 10 مم، طبقة واحدة) لإصلاح الشقوق والأسطح المتينة حتى عرض 4 مم على الخرسانة.',
    es: 'BC Repair 100 es un mortero de reparación cementoso de alta calidad y resistente al agua (saco de 20 kg, 1,10 m² a 10 mm, una capa) para la reparación duradera de fisuras y superficies de hasta 4 mm de ancho en hormigón.',
  },
  'BC Repair 101': {
    en: 'BC Repair 101 is a one-component, cement-based, micro-silica- and latex-modified, non-sag repair mortar specially designed for trowel-applied vertical and overhead structural repairs requiring high performance, superior adhesion and long-term durability.',
    ar: 'BC Repair 101 هو مونة إصلاح أحادية المكوّن تعتمد على الإسمنت ومعدّلة بالميكروسيليكا واللاتكس وغير متهدّلة، مصمّمة خصيصًا للإصلاحات الإنشائية الرأسية والعلوية المطبّقة بالمالج التي تتطلّب أداءً عاليًا والتصاقًا فائقًا ومتانةً طويلة الأمد.',
    es: 'BC Repair 101 es un mortero de reparación monocomponente de base cementosa, modificado con microsílice y látex y sin descuelgue, diseñado especialmente para reparaciones estructurales verticales y en techo aplicadas con llana que requieren alto rendimiento, adherencia superior y durabilidad a largo plazo.',
  },
  'BC Repair 200': {
    en: 'BC Repair 200 is a high-quality, water-resistant cementitious repair mortar (20 kg bag) for durable patching and crack filling up to 4 mm wide on concrete surfaces, providing strong adhesion and long-term protection.',
    ar: 'BC Repair 200 هو مونة إصلاح إسمنتية عالية الجودة ومقاومة للماء (كيس 20 كجم) للترقيع وملء الشقوق المتين حتى عرض 4 مم على أسطح الخرسانة، يوفّر التصاقًا قويًا وحمايةً طويلة الأمد.',
    es: 'BC Repair 200 es un mortero de reparación cementoso de alta calidad y resistente al agua (saco de 20 kg) para el parcheo duradero y el relleno de fisuras de hasta 4 mm de ancho en superficies de hormigón, con fuerte adherencia y protección a largo plazo.',
  },
  'BC Repair FC': {
    en: 'BC Repair FC is a single-component, polymer-modified, water-resistant fine repair mortar made from high-quality Portland cement, precisely graded limestone fillers and special performance additives. It gives a smooth, durable finish for concrete surfaces and is ideal for fine crack filling.',
    ar: 'BC Repair FC هو مونة إصلاح دقيقة أحادية المكوّن معدّلة بالبوليمر ومقاومة للماء، مصنوعة من إسمنت بورتلاندي عالي الجودة ومالئات حجر جيري متدرّجة بدقة وإضافات أداء خاصة. تمنح إنهاءً ناعمًا ومتينًا لأسطح الخرسانة وهي مثالية لملء الشقوق الدقيقة.',
    es: 'BC Repair FC es un mortero de reparación fino monocomponente, modificado con polímeros y resistente al agua, elaborado con cemento Portland de alta calidad, cargas de caliza de granulometría precisa y aditivos especiales de rendimiento. Aporta un acabado liso y duradero a las superficies de hormigón y es ideal para el relleno de fisuras finas.',
  },
  'BC Rock Plus Ultra': {
    en: 'BC Rock Plus Ultra is an ultra-high-performance crystallising waterproof coating with osmotic properties and zero water permeability; an enhanced pozzolanic reaction ensures superior durability and long service life. Supplied in 20 kg bags.',
    ar: 'BC Rock Plus Ultra هو طلاء عزل مائي متبلور فائق الأداء بخصائص تناضحية ونفاذية مائية صفرية؛ يضمن تفاعل بوزولاني معزّز متانةً فائقةً وعمرًا خدميًا طويلًا. يُورّد في أكياس 20 كجم.',
    es: 'BC Rock Plus Ultra es un recubrimiento impermeabilizante cristalizante de altísimo rendimiento con propiedades osmóticas y permeabilidad al agua nula; una reacción puzolánica mejorada garantiza una durabilidad superior y una larga vida útil. Se suministra en sacos de 20 kg.',
  },
  'BC Spatter Dash RF': {
    en: 'BC Spatter Dash RF is a cementitious scratch coat that provides a strong bonding key for plaster on smooth or dense substrates. Containing hydraulic binders, graded aggregates and performance additives, it covers 1.3–1.6 kg/m² per mm — a 50 kg bag covers approx. 7.8–9.6 m² at 4 mm.',
    ar: 'BC Spatter Dash RF هو طبقة خدش إسمنتية توفّر مفتاح ربط قويًا للياسة على الأسطح الناعمة أو الكثيفة. يحتوي على روابط هيدروليكية وركام متدرّج وإضافات أداء، ويغطّي 1.3–1.6 كجم/م² لكل مم — يغطّي كيس 50 كجم نحو 7.8–9.6 م² عند 4 مم.',
    es: 'BC Spatter Dash RF es una capa de rascado cementosa que proporciona un buen puente de adherencia para el revoque sobre sustratos lisos o densos. Con ligantes hidráulicos, áridos graduados y aditivos de rendimiento, rinde 1,3–1,6 kg/m² por mm; un saco de 50 kg cubre aprox. 7,8–9,6 m² a 4 mm.',
  },
  'BC Spatter Dash ZM': {
    en: 'BC Spatter Dash ZM is part of BCI’s concrete repair and surface-preparation range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Spatter Dash ZM هو جزء من مجموعة إصلاح الخرسانة وتحضير الأسطح من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Spatter Dash ZM forma parte de la gama de reparación de hormigón y preparación de superficies de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Straw Finish': {
    en: 'BC Straw Finish is a two-component traditional decorative coating based on high-quality acrylic emulsion. It provides a natural clay-style appearance reminiscent of old traditional houses, enhanced with treated straw fibres for a distinctive, authentic texture.',
    ar: 'BC Straw Finish هو طلاء تزييني تقليدي ثنائي المكوّن يعتمد على مستحلب أكريليكي عالي الجودة. يوفّر مظهرًا طبيعيًا بأسلوب الطين يذكّر بالبيوت التقليدية القديمة، معزّزًا بألياف قش معالَجة لملمس مميّز وأصيل.',
    es: 'BC Straw Finish es un revestimiento decorativo tradicional bicomponente a base de una emulsión acrílica de alta calidad. Aporta un aspecto natural tipo arcilla que evoca las casas tradicionales antiguas, realzado con fibras de paja tratadas para una textura distintiva y auténtica.',
  },
  'BC Surfa Plast': {
    en: 'BC Surfa Plast 100 is a fibre-reinforced, heavy-duty plaster for durable, crack-free surfaces, ideal for façades and high-strength, long-lasting plastering. Supplied in 20 kg.',
    ar: 'BC Surfa Plast 100 هو لياسة ثقيلة الخدمة مدعّمة بالألياف لأسطح متينة وخالية من الشقوق، مثالية للواجهات واللياسة عالية القوة وطويلة الأمد. يُورّد بعبوة 20 كجم.',
    es: 'BC Surfa Plast 100 es un revoque de servicio pesado reforzado con fibras para superficies duraderas y sin fisuras, ideal para fachadas y revoques de alta resistencia y larga duración. Se suministra en 20 kg.',
  },
  'BCI HMP': {
    en: 'BCI HMP is a high-performance, modified ethyl-vinyl-acetate (EVA) copolymer hot-melt adhesive supplied in pellet form, designed to create a strong bond between spray-applied waterproofing membranes and asphalt overlays.',
    ar: 'BCI HMP هو لاصق منصهر ساخن عالي الأداء من كوبوليمر إيثيل-فينيل-أسيتات (EVA) المعدّل، يُورّد على شكل حبيبات، مصمّم لخلق رابطة قوية بين أغشية العزل المائي المطبّقة بالرش وطبقات الأسفلت.',
    es: 'BCI HMP es un adhesivo termofusible de alto rendimiento a base de copolímero modificado de etileno-vinil-acetato (EVA), suministrado en forma de gránulos, diseñado para crear una unión fuerte entre las membranas impermeabilizantes proyectadas y las capas de asfalto.',
  },
  /* ===== 07 · Tile Adhesives, Grouts & Anchors ===== */
  'BC Fix HF 60': {
    en: 'BC Fix HF 60 is a high-performance mortar for embedding reinforcement mesh and fixing insulation boards onto EPS, XPS, mineral wool and smooth, low-absorbency surfaces in EIFS/ETICS systems.',
    ar: 'BC Fix HF 60 هو مونة عالية الأداء لتثبيت شبكة التسليح ولصق ألواح العزل على أسطح EPS وXPS والصوف المعدني والأسطح الناعمة قليلة الامتصاص في أنظمة EIFS/ETICS.',
    es: 'BC Fix HF 60 es un mortero de alto rendimiento para embeber la malla de refuerzo y fijar placas de aislamiento sobre EPS, XPS, lana mineral y superficies lisas de baja absorción en sistemas EIFS/ETICS.',
  },
  'BC Fix TH 100': {
    en: 'BC Fix TH 100 is a high-performance, cement-based bonding mortar for fixing thermal-insulation boards to walls, offering excellent adhesion and long open time for exterior and interior insulation systems. Supplied in 25 kg bags.',
    ar: 'BC Fix TH 100 هو مونة ربط عالية الأداء تعتمد على الإسمنت لتثبيت ألواح العزل الحراري على الجدران، توفّر التصاقًا ممتازًا وزمن عمل طويلًا لأنظمة العزل الخارجية والداخلية. تُورّد في أكياس 25 كجم.',
    es: 'BC Fix TH 100 es un mortero de unión de base cementosa y alto rendimiento para fijar placas de aislamiento térmico a las paredes, que ofrece excelente adherencia y un tiempo abierto prolongado para sistemas de aislamiento exterior e interior. Se suministra en sacos de 25 kg.',
  },
  'BC Marbel Adhesive': {
    en: 'BC Marble Adhesive is a high-strength, cement-based adhesive for bonding marble, granite and natural stone, providing excellent adhesion, durability and resistance to moisture and temperature variations.',
    ar: 'BC Marble Adhesive هو لاصق عالي القوة يعتمد على الإسمنت للصق الرخام والجرانيت والأحجار الطبيعية، يوفّر التصاقًا ومتانةً ومقاومةً ممتازةً للرطوبة وتقلّبات الحرارة.',
    es: 'BC Marble Adhesive es un adhesivo de base cementosa y alta resistencia para la colocación de mármol, granito y piedra natural, que ofrece excelente adherencia, durabilidad y resistencia a la humedad y a las variaciones de temperatura.',
  },
  'BC PE Grout': {
    en: 'BC PE Grout is a two-component, polyester-resin-based anchoring grout, supplied as resin and catalysed filler, mixed to a pourable or pumpable dark-grey grout for anchoring bolts and bars in holes up to 25 mm oversize, with high bond strength and rapid setting.',
    ar: 'BC PE Grout هو جراوت تثبيت ثنائي المكوّن يعتمد على راتنج البوليستر، يُورّد كراتنج ومالئ محفّز، ويُخلط لينتج جراوت رماديًا غامقًا قابلًا للصبّ أو الضخّ لتثبيت المسامير والقضبان في فتحات تزيد عن المقاس حتى 25 مم، بقوة ربط عالية وشكّ سريع.',
    es: 'BC PE Grout es un mortero de anclaje bicomponente a base de resina de poliéster, suministrado como resina y carga catalizada, que se mezcla hasta obtener un mortero gris oscuro vertible o bombeable para anclar pernos y barras en perforaciones de hasta 25 mm de sobremedida, con alta resistencia de unión y fraguado rápido.',
  },
  'BC Pool Fix': {
    en: 'BC Pool Fix is a high-performance, polymer-modified, cementitious tile adhesive for the permanent installation of ceramic, porcelain, mosaic, quarry, artificial-granite, terrazzo and cement tiles.',
    ar: 'BC Pool Fix هو لاصق بلاط إسمنتي عالي الأداء معدّل بالبوليمر للتركيب الدائم لبلاط السيراميك والبورسلان والفسيفساء والكوارّي والجرانيت الصناعي والتيرازو وبلاط الإسمنت.',
    es: 'BC Pool Fix es un adhesivo cerámico de base cementosa, de alto rendimiento y modificado con polímeros, para la instalación permanente de baldosas de cerámica, porcelana, mosaico, gres, granito artificial, terrazo y cemento.',
  },
  'BC Poxy Grout 252': {
    en: 'BC Poxy Grout 252 is a high-strength, three-component, solvent-free epoxy grouting system (0.56 m² at 25 mm per 27 kg kit) for precision grouting and heavy-duty structural support.',
    ar: 'BC Poxy Grout 252 هو نظام جراوت إيبوكسي عالي القوة ثلاثي المكوّن وخالٍ من المذيبات (0.56 م² عند 25 مم لكل طقم 27 كجم) للجراوت الدقيق والدعم الإنشائي ثقيل الخدمة.',
    es: 'BC Poxy Grout 252 es un sistema de mortero de inyección epoxi de alta resistencia, tricomponente y sin disolventes (0,56 m² a 25 mm por kit de 27 kg), para inyecciones de precisión y soporte estructural de servicio pesado.',
  },
  'BC Tec Cem Grout': {
    en: 'BC Tec Cem Grout is a high-strength, non-shrink, cementitious grout with natural aggregates and controlled expansion for durable, non-staining applications. Supplied in 20 kg bags.',
    ar: 'BC Tec Cem Grout هو جراوت إسمنتي عالي القوة وغير منكمش بركام طبيعي وتمدّد محكوم لتطبيقات متينة وغير مبقّعة. يُورّد في أكياس 20 كجم.',
    es: 'BC Tec Cem Grout es un mortero de inyección cementoso de alta resistencia, sin retracción, con áridos naturales y expansión controlada, para aplicaciones duraderas y que no manchan. Se suministra en sacos de 20 kg.',
  },
  'BC Tile Adhesive Pro': {
    en: 'BC Tile Adhesive Pro is a high-performance, polymer-modified cementitious dry-set mortar for fixing ceramic, porcelain, mosaic, quarry, terrazzo and artificial-granite tiles, with excellent adhesion, flexibility and water resistance for interior and exterior use. Available in grey and white, 20 kg bag.',
    ar: 'BC Tile Adhesive Pro هو مونة لصق جافة إسمنتية عالية الأداء معدّلة بالبوليمر لتثبيت بلاط السيراميك والبورسلان والفسيفساء والكوارّي والتيرازو والجرانيت الصناعي، بالتصاق ومرونة ومقاومة للماء ممتازة للاستخدام الداخلي والخارجي. متوفّر بالرمادي والأبيض، كيس 20 كجم.',
    es: 'BC Tile Adhesive Pro es un mortero cola cementoso de alto rendimiento, modificado con polímeros, para fijar baldosas de cerámica, porcelana, mosaico, gres, terrazo y granito artificial, con excelente adherencia, flexibilidad y resistencia al agua para uso interior y exterior. Disponible en gris y blanco, saco de 20 kg.',
  },
  'BC Tile Adhesive Pro L': {
    en: 'BC Tile Adhesive Pro L is a high-performance, polymer-modified cementitious dry-set mortar for fixing ceramic, porcelain, mosaic, quarry, terrazzo and artificial-granite tiles, with excellent adhesion, flexibility and water resistance for interior and exterior use. Available in white, 50 kg bag.',
    ar: 'BC Tile Adhesive Pro L هو مونة لصق جافة إسمنتية عالية الأداء معدّلة بالبوليمر لتثبيت بلاط السيراميك والبورسلان والفسيفساء والكوارّي والتيرازو والجرانيت الصناعي، بالتصاق ومرونة ومقاومة للماء ممتازة للاستخدام الداخلي والخارجي. متوفّر بالأبيض، كيس 50 كجم.',
    es: 'BC Tile Adhesive Pro L es un mortero cola cementoso de alto rendimiento, modificado con polímeros, para fijar baldosas de cerámica, porcelana, mosaico, gres, terrazo y granito artificial, con excelente adherencia, flexibilidad y resistencia al agua para uso interior y exterior. Disponible en blanco, saco de 50 kg.',
  },
  'BC Tile Adhesive Pro Y': {
    en: 'BC Tile Adhesive Pro Y is part of BCI’s tile, grout and anchoring range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Tile Adhesive Pro Y هو جزء من مجموعة البلاط والجراوت والتثبيت من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Tile Adhesive Pro Y forma parte de la gama de adhesivos cerámicos, morteros y anclajes de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Tile Fix Plus': {
    en: 'BC Tile Fix Plus is an ultra-high-performance, rapid-curing, one-component, polymer-modified cementitious tile adhesive formulated with premium cement, selected silica sands and advanced polymeric additives that enhance bonding strength, curing speed and overall durability.',
    ar: 'BC Tile Fix Plus هو لاصق بلاط إسمنتي أحادي المكوّن فائق الأداء وسريع التصلّب ومعدّل بالبوليمر، مُركّب بإسمنت فاخر ورمال سيليكا مختارة وإضافات بوليمرية متقدّمة تعزّز قوة الالتصاق وسرعة التصلّب والمتانة الإجمالية.',
    es: 'BC Tile Fix Plus es un adhesivo cerámico cementoso monocomponente de altísimo rendimiento, de curado rápido y modificado con polímeros, formulado con cemento prémium, arenas de sílice seleccionadas y aditivos poliméricos avanzados que mejoran la fuerza de unión, la velocidad de curado y la durabilidad general.',
  },
  'BC Tile Fix Prime': {
    en: 'BC Tile Fix Prime is a single-component, pre-packed, polymer-modified cementitious tile adhesive formulated with graded silica sand and special additives for superior bonding strength and workability under various climatic conditions.',
    ar: 'BC Tile Fix Prime هو لاصق بلاط إسمنتي أحادي المكوّن معبّأ مسبقًا ومعدّل بالبوليمر، مُركّب برمل سيليكا متدرّج وإضافات خاصة لقوة التصاق وقابلية تشغيل فائقتين في مختلف الظروف المناخية.',
    es: 'BC Tile Fix Prime es un adhesivo cerámico cementoso monocomponente, preenvasado y modificado con polímeros, formulado con arena de sílice graduada y aditivos especiales para una fuerza de unión y trabajabilidad superiores en diversas condiciones climáticas.',
  },
  'BC Tile Grout': {
    en: 'BC Tile Grout is a one-component, cementitious, pre-packed grout with pigments and admixtures for filling tile joints and providing durable, stable and attractive finishes.',
    ar: 'BC Tile Grout هو جراوت إسمنتي أحادي المكوّن معبّأ مسبقًا بأصباغ وإضافات لملء فواصل البلاط وتوفير إنهاءات متينة ومستقرة وجذّابة.',
    es: 'BC Tile Grout es una lechada cementosa monocomponente, preenvasada, con pigmentos y aditivos, para rellenar las juntas de las baldosas y proporcionar acabados duraderos, estables y atractivos.',
  },
  'BC Tile Poxy 252': {
    en: 'BC Tile Poxy 252 is a three-component, solvent-free, high-strength epoxy adhesive and grouting system (20 kg set, 3.3 m² at 3 mm, one coat) for ceramic-tile fixing and heavy-duty structural bonding.',
    ar: 'BC Tile Poxy 252 هو نظام لاصق وجراوت إيبوكسي ثلاثي المكوّن وخالٍ من المذيبات وعالي القوة (طقم 20 كجم، 3.3 م² عند 3 مم، طبقة واحدة) لتثبيت بلاط السيراميك والربط الإنشائي ثقيل الخدمة.',
    es: 'BC Tile Poxy 252 es un sistema de adhesivo y mortero epoxi tricomponente, sin disolventes y de alta resistencia (juego de 20 kg, 3,3 m² a 3 mm, una capa), para la colocación de baldosas cerámicas y la unión estructural de servicio pesado.',
  },
  /* ===== 08 · Sealants & Joints ===== */
  'BC Backing Rods': {
    en: 'BC Backing Rods are flexible, closed-cell polyethylene foam rods used as a backing material to control sealant depth in joints. They provide uniform joint geometry, improve sealant performance and prevent three-sided adhesion.',
    ar: 'BC Backing Rods هي حبال إسناد مرنة من رغوة البولي إيثيلين مغلقة الخلايا تُستخدم كمادة إسناد للتحكّم في عمق المادة المانعة للتسرّب في الفواصل. توفّر هندسة فاصل منتظمة وتحسّن أداء المادة المانعة وتمنع الالتصاق الثلاثي الجوانب.',
    es: 'BC Backing Rods son cordones de respaldo flexibles de espuma de polietileno de celda cerrada que se usan como material de respaldo para controlar la profundidad del sellador en las juntas. Proporcionan una geometría uniforme de la junta, mejoran el rendimiento del sellador y evitan la adherencia en tres caras.',
  },
  'BC Bond Liquid': {
    en: 'BC Bond Liquid is an admixture and bonding agent for cementitious materials.',
    ar: 'BC Bond Liquid هو إضافة وعامل ربط للمواد الإسمنتية.',
    es: 'BC Bond Liquid es un aditivo y agente de unión para materiales cementosos.',
  },
  'BC Bond Super': {
    en: 'BC Bond Super is a high-quality polyvinyl-acetate (PVA) emulsion adhesive for use as a bonding agent, surface sealer, primer and admixture for cement screeds, renders, plasters, mortars and concrete.',
    ar: 'BC Bond Super هو لاصق مستحلب من أسيتات البولي فينيل (PVA) عالي الجودة للاستخدام كعامل ربط ومانع تسرّب سطحي وبرايمر وإضافة لطبقات الإسمنت واللياسات والمونة والخرسانة.',
    es: 'BC Bond Super es un adhesivo de emulsión de acetato de polivinilo (PVA) de alta calidad para usar como agente de unión, sellador de superficies, imprimación y aditivo para morteros de nivelación, revoques, enlucidos, morteros y hormigón.',
  },
  'BC Bond XP': {
    en: 'BC Bond XP is a high-performance acrylic-polymer emulsion for use as an adhesive and admixture in cementitious systems, enhancing concrete and mortar by improving bond strength, flexibility, water resistance and durability.',
    ar: 'BC Bond XP هو مستحلب بوليمري أكريليكي عالي الأداء للاستخدام كلاصق وإضافة في الأنظمة الإسمنتية، يعزّز الخرسانة والمونة بتحسين قوة الربط والمرونة ومقاومة الماء والمتانة.',
    es: 'BC Bond XP es una emulsión de polímero acrílico de alto rendimiento para usar como adhesivo y aditivo en sistemas cementosos, que mejora el hormigón y el mortero aumentando la fuerza de unión, la flexibilidad, la resistencia al agua y la durabilidad.',
  },
  'BC Mix SBR': {
    en: 'BC Mix SBR is a carboxylated styrene–butadiene copolymer latex admixture formulated to enhance the properties of cementitious mixes such as mortars, screeds, renders and toppings.',
    ar: 'BC Mix SBR هو إضافة لاتكس من كوبوليمر الستايرين–بوتادايين المكربكس، مُركّبة لتعزيز خصائص الخلطات الإسمنتية مثل المونة وطبقات التسوية واللياسات والطبقات العلوية.',
    es: 'BC Mix SBR es un aditivo de látex de copolímero de estireno-butadieno carboxilado, formulado para mejorar las propiedades de las mezclas cementosas como morteros, soleras, revoques y capas de acabado.',
  },
  'BC PVA Bond': {
    en: 'BC PVA Bond is a polyvinyl-acetate-based polyvinyl-alcohol suspension for surface sealing, bonding and use as a cement/mortar admixture. Supplied in 20 kg pails.',
    ar: 'BC PVA Bond هو معلّق من كحول البولي فينيل يعتمد على أسيتات البولي فينيل لإغلاق الأسطح والربط والاستخدام كإضافة للإسمنت/المونة. يُورّد في عبوات 20 كجم.',
    es: 'BC PVA Bond es una suspensión de alcohol polivinílico a base de acetato de polivinilo para el sellado de superficies, la unión y el uso como aditivo de cemento/mortero. Se suministra en cubetas de 20 kg.',
  },
  'BC S900': {
    en: 'BC Sili-900 is a one-part, chemical-resistant silicone sealant for movement joints in aggressive chemical environments, providing excellent adhesion and long-term flexible protection against acids, alkalis and chemical solutions.',
    ar: 'BC Sili-900 هو مادة سيليكون مانعة للتسرّب أحادية المكوّن ومقاومة للمواد الكيميائية لفواصل الحركة في البيئات الكيميائية القاسية، توفّر التصاقًا ممتازًا وحمايةً مرنةً طويلة الأمد ضد الأحماض والقلويات والمحاليل الكيميائية.',
    es: 'BC Sili-900 es un sellador de silicona monocomponente y resistente a productos químicos para juntas de movimiento en entornos químicos agresivos, que ofrece excelente adherencia y protección flexible duradera frente a ácidos, álcalis y soluciones químicas.',
  },
  'BC Tec 30S': {
    en: 'BC Tec 30S is a one-component, moisture-curing, non-sag polyurethane joint sealant for elastic, tough and resilient sealing with excellent recovery, suitable for a wide range of temperatures and joint applications.',
    ar: 'BC Tec 30S هو مادة بولي يوريثانية مانعة للتسرّب أحادية المكوّن تتصلّب بالرطوبة وغير متهدّلة، لإغلاق مرن ومتين ومطّاط بقدرة استرجاع ممتازة، مناسبة لمدى واسع من درجات الحرارة وتطبيقات الفواصل.',
    es: 'BC Tec 30S es un sellador de juntas de poliuretano monocomponente, de curado por humedad y sin descuelgue, para un sellado elástico, tenaz y resiliente con excelente recuperación, apto para un amplio rango de temperaturas y aplicaciones de juntas.',
  },
  'BC Tec 80A': {
    en: 'BC Tec 80A is a one-part, water-based acrylic sealant designed to seal internal, low-movement joints, with good adhesion to a wide variety of common construction substrates without the need for a primer.',
    ar: 'BC Tec 80A هو مادة أكريليكية مانعة للتسرّب أحادية المكوّن تعتمد على الماء، مصمّمة لإغلاق الفواصل الداخلية قليلة الحركة، بالتصاق جيد بمجموعة واسعة من أسطح البناء الشائعة دون الحاجة إلى برايمر.',
    es: 'BC Tec 80A es un sellador acrílico monocomponente de base acuosa diseñado para sellar juntas internas de poco movimiento, con buena adherencia a una amplia variedad de sustratos de construcción habituales sin necesidad de imprimación.',
  },
  'BC Tec 90': {
    en: 'BC Tec 90 is part of BCI’s sealant, joint and adhesive range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Tec 90 هو جزء من مجموعة المواد المانعة للتسرّب والفواصل واللواصق من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Tec 90 forma parte de la gama de selladores, juntas y adhesivos de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Tec PS PG': {
    en: 'BC Tec PSG is a cross-linking, polysulphide-based elastic sealant for horizontal expansion joints, providing excellent flexibility, weather resistance and durability under hot and tropical climatic conditions.',
    ar: 'BC Tec PSG هو مادة مانعة للتسرّب مرنة متشابكة تعتمد على البولي سلفايد لفواصل التمدّد الأفقية، توفّر مرونةً ومقاومةً للعوامل الجوية ومتانةً ممتازة في الظروف المناخية الحارة والاستوائية.',
    es: 'BC Tec PSG es un sellador elástico reticulante a base de polisulfuro para juntas de dilatación horizontales, que ofrece excelente flexibilidad, resistencia a la intemperie y durabilidad en condiciones climáticas cálidas y tropicales.',
  },
  'BC Vinyl Adhesive': {
    en: 'BC Vinyl Adhesive is a high-tack, very-low-VOC acrylic adhesive for vinyl-flooring installation (20 kg set, 5 m²/kg coverage) for strong, water-resistant bonding to concrete, timber and composite-board surfaces.',
    ar: 'BC Vinyl Adhesive هو لاصق أكريليكي عالي اللزوجة ومنخفض المركّبات العضوية المتطايرة جدًا لتركيب أرضيات الفينيل (طقم 20 كجم، تغطية 5 م²/كجم) لربط قوي ومقاوم للماء بأسطح الخرسانة والخشب وألواح المركّبات.',
    es: 'BC Vinyl Adhesive es un adhesivo acrílico de alta pegajosidad y muy bajo contenido de COV para la instalación de suelos de vinilo (juego de 20 kg, rendimiento de 5 m²/kg), para una unión fuerte y resistente al agua sobre superficies de hormigón, madera y tableros compuestos.',
  },
  /* ===== 09 · Admixtures & Construction Aids ===== */
  'BC Admix 31': {
    en: 'BC Admix 31 is a high-performance, ready-to-use liquid admixture made from modified lignosulfonate compounds and organic salts. It acts as both a water-reducing and set-retarding agent, conforming to ASTM C494 Types B and D.',
    ar: 'BC Admix 31 هو إضافة سائلة عالية الأداء جاهزة للاستخدام مصنوعة من مركّبات لجنوسلفونات معدّلة وأملاح عضوية. تعمل كعامل لتقليل الماء وتأخير الشكّ معًا، متوافقة مع ASTM C494 النوعين B وD.',
    es: 'BC Admix 31 es un aditivo líquido de alto rendimiento, listo para usar, elaborado con compuestos de lignosulfonato modificados y sales orgánicas. Actúa como reductor de agua y retardante de fraguado, conforme a ASTM C494 tipos B y D.',
  },
  'BC Chem Sol 101': {
    en: 'BC Chemsol 101 Thinner is a proprietary solvent blend formulated to optimise flow and viscosity in BCI waterproofing and coating systems. It also serves as an effective cleaner for tools and spray equipment before and after application.',
    ar: 'BC Chemsol 101 Thinner هو مزيج مذيبات خاص مُركّب لتحسين السيولة واللزوجة في أنظمة العزل المائي والطلاء من BCI. كما يعمل كمنظّف فعّال للأدوات ومعدات الرش قبل التطبيق وبعده.',
    es: 'BC Chemsol 101 Thinner es una mezcla de disolventes patentada, formulada para optimizar la fluidez y la viscosidad en los sistemas de impermeabilización y recubrimiento de BCI. También sirve como limpiador eficaz para herramientas y equipos de proyección antes y después de la aplicación.',
  },
  'BC Cure 311': {
    en: 'BC Cure 311 is a white, low-viscosity curing compound with an alkali-reactive emulsion-breaking system that forms a continuous film on cement surfaces to prevent water loss, reduce shrinkage and enhance durability. Supplied in 20 kg.',
    ar: 'BC Cure 311 هو مركّب معالجة أبيض منخفض اللزوجة بنظام كسر مستحلب متفاعل مع القلويات، يكوّن غشاءً متصلًا على أسطح الإسمنت لمنع فقدان الماء وتقليل الانكماش وتعزيز المتانة. يُورّد بعبوة 20 كجم.',
    es: 'BC Cure 311 es un compuesto de curado blanco y de baja viscosidad con un sistema de ruptura de emulsión reactivo a los álcalis, que forma una película continua sobre las superficies de cemento para evitar la pérdida de agua, reducir la retracción y mejorar la durabilidad. Se suministra en 20 kg.',
  },
  'BC Elastivator': {
    en: 'BC Elastivator is a highly reactive, fast-evaporating solvent with exceptional solvency for softening synthetic elastomers and coatings, supplied as a pure liquid without added fillers or solids.',
    ar: 'BC Elastivator هو مذيب عالي التفاعلية وسريع التبخّر بقدرة إذابة استثنائية لتليين الإيلاستومرات والطلاءات الصناعية، يُورّد كسائل نقي دون مالئات أو مواد صلبة مضافة.',
    es: 'BC Elastivator es un disolvente muy reactivo y de evaporación rápida con una capacidad de disolución excepcional para ablandar elastómeros y recubrimientos sintéticos, suministrado como líquido puro sin cargas ni sólidos añadidos.',
  },
  'BC Elasto Plus': {
    en: 'BC Elasto Plus is a premixed cementitious blend for geothermal-well filling (25 kg), composed of blast-furnace cement, bentonite, high-plasticity additives and selected sands.',
    ar: 'BC Elasto Plus هو خليط إسمنتي مخلوط مسبقًا لتعبئة الآبار الجيوحرارية (25 كجم)، يتكوّن من إسمنت أفران الصهر والبنتونيت وإضافات عالية اللدونة ورمال مختارة.',
    es: 'BC Elasto Plus es una mezcla cementosa premezclada para el relleno de pozos geotérmicos (25 kg), compuesta por cemento de alto horno, bentonita, aditivos de alta plasticidad y arenas seleccionadas.',
  },
  'BC Gun': {
    en: 'BC Gun is part of BCI’s admixture and construction-aid range, manufactured in Saudi Arabia. Download the technical data sheet for full specifications.',
    ar: 'BC Gun هو جزء من مجموعة الإضافات ومساعدات البناء من BCI، مصنوع في المملكة العربية السعودية. حمّل النشرة الفنية للاطلاع على المواصفات الكاملة.',
    es: 'BC Gun forma parte de la gama de aditivos y auxiliares de construcción de BCI, fabricado en Arabia Saudita. Descargue la ficha técnica para conocer las especificaciones completas.',
  },
  'BC Methylene Chloride': {
    en: 'BC Methylene Chloride is a colourless, volatile liquid with a moderately sweet aroma, widely used as a solvent in industrial and laboratory settings — especially for paint stripping, adhesives and chemical processing.',
    ar: 'BC Methylene Chloride هو سائل متطاير عديم اللون برائحة حلوة معتدلة، يُستخدم على نطاق واسع كمذيب في البيئات الصناعية والمخبرية — خاصةً في إزالة الدهانات والمواد اللاصقة والمعالجة الكيميائية.',
    es: 'BC Methylene Chloride es un líquido volátil incoloro con un aroma moderadamente dulce, ampliamente utilizado como disolvente en entornos industriales y de laboratorio, especialmente para el decapado de pinturas, adhesivos y procesos químicos.',
  },
  'BC Pigment Paste': {
    en: 'BC Pigment Paste is a concentrated pigment paste based on high-quality resin and selected colour pigments, formulated for tinting polyurea, polyurethane (PU) and nitrocellulose (NC) coatings in both matt and gloss finishes.',
    ar: 'BC Pigment Paste هو معجون صبغة مركّز يعتمد على راتنج عالي الجودة وأصباغ لونية مختارة، مُركّب لتلوين طلاءات البولي يوريا والبولي يوريثان (PU) والنيتروسليلوز (NC) بإنهاءات مطفأة ولامعة.',
    es: 'BC Pigment Paste es una pasta de pigmento concentrada a base de resina de alta calidad y pigmentos de color seleccionados, formulada para tintar recubrimientos de poliurea, poliuretano (PU) y nitrocelulosa (NC) en acabados mate y brillante.',
  },
  'BC Pipe Kleen': {
    en: 'BC Pipe Kleen is a coloured, inhibited liquid acid cleaner with a pleasant odour, formulated as a safe replacement for conventional muriatic acid, offering excellent cleaning efficiency with virtually no harmful fumes.',
    ar: 'BC Pipe Kleen هو منظّف حمضي سائل ملوّن ومثبّط برائحة لطيفة، مُركّب كبديل آمن لحمض المورياتيك التقليدي، يوفّر كفاءة تنظيف ممتازة دون أبخرة ضارة تقريبًا.',
    es: 'BC Pipe Kleen es un limpiador ácido líquido coloreado e inhibido con un olor agradable, formulado como un sustituto seguro del ácido muriático convencional, que ofrece una excelente eficacia de limpieza prácticamente sin vapores nocivos.',
  },
  'BC Plast 505': {
    en: 'BC Plast 505 is a high-range water-reducing concrete admixture, added at 0.6–1.5 L per 100 kg of cement, for high water reduction, improved strength and extended slump retention in concrete mixes.',
    ar: 'BC Plast 505 هو إضافة خرسانة عالية المدى لتقليل الماء، تُضاف بمعدّل 0.6–1.5 لتر لكل 100 كجم إسمنت، لتقليل عالٍ للماء وتحسين القوة وإطالة احتفاظ الهبوط في خلطات الخرسانة.',
    es: 'BC Plast 505 es un aditivo reductor de agua de alto rango para hormigón, dosificado a 0,6–1,5 L por cada 100 kg de cemento, para una elevada reducción de agua, mayor resistencia y mayor retención de la consistencia en las mezclas de hormigón.',
  },
  'BC Sand Bond 2': {
    en: 'BC Sand Bond 2 (white, 1000 kg) is a high-strength, polymer-modified sand stabiliser that binds and hardens loose sand surfaces, providing long-lasting erosion control and dust suppression for landscaping, construction sites and outdoor areas.',
    ar: 'BC Sand Bond 2 (أبيض، 1000 كجم) هو مثبّت رمل عالي القوة معدّل بالبوليمر يربط ويصلّب أسطح الرمل السائبة، موفّرًا تحكّمًا طويل الأمد في التعرية وكبتًا للغبار لتنسيق المواقع ومواقع البناء والمناطق الخارجية.',
    es: 'BC Sand Bond 2 (blanco, 1000 kg) es un estabilizador de arena de alta resistencia, modificado con polímeros, que liga y endurece las superficies de arena suelta, proporcionando control de la erosión y supresión del polvo duraderos para paisajismo, obras y zonas exteriores.',
  },
  'BC Sand Bond EG': {
    en: 'BC Sand Bond EG (white, 1000 kg) is an environmentally friendly, polymer-based sand binder that stabilises loose sand and controls dust, forming a flexible, durable surface ideal for landscaping, pathways and erosion control outdoors.',
    ar: 'BC Sand Bond EG (أبيض، 1000 كجم) هو رابط رمل صديق للبيئة يعتمد على البوليمر، يثبّت الرمل السائب ويتحكّم في الغبار، مكوّنًا سطحًا مرنًا ومتينًا مثاليًا لتنسيق المواقع والممرات والتحكّم في التعرية في الهواء الطلق.',
    es: 'BC Sand Bond EG (blanco, 1000 kg) es un ligante de arena de base polimérica y respetuoso con el medioambiente que estabiliza la arena suelta y controla el polvo, formando una superficie flexible y duradera ideal para paisajismo, senderos y control de la erosión en exteriores.',
  },
  'BC Sand Stabilizer SG': {
    en: 'BC Sand Stabilizer SG (white, 1000 kg) is a high-performance, polymer-based binder that stabilises loose sand, reduces erosion and controls dust, creating a durable, cohesive surface for landscaping, construction and desert environments.',
    ar: 'BC Sand Stabilizer SG (أبيض، 1000 كجم) هو رابط عالي الأداء يعتمد على البوليمر يثبّت الرمل السائب ويقلّل التعرية ويتحكّم في الغبار، مكوّنًا سطحًا متينًا ومتماسكًا لتنسيق المواقع والبناء والبيئات الصحراوية.',
    es: 'BC Sand Stabilizer SG (blanco, 1000 kg) es un ligante de alto rendimiento a base de polímeros que estabiliza la arena suelta, reduce la erosión y controla el polvo, creando una superficie duradera y cohesiva para paisajismo, construcción y entornos desérticos.',
  },
  'BC Straw Fiber': {
    en: 'BC Straw Fiber is a specially processed natural-fibre additive used to create textured, rustic and decorative finishes in acrylic coating systems.',
    ar: 'BC Straw Fiber هو إضافة من الألياف الطبيعية المعالَجة خصيصًا تُستخدم لخلق إنهاءات مزخرفة وريفية وتزيينية في أنظمة الطلاء الأكريليكي.',
    es: 'BC Straw Fiber es un aditivo de fibra natural especialmente procesado que se usa para crear acabados texturados, rústicos y decorativos en sistemas de recubrimiento acrílico.',
  },
  'BC Tec 505 TP': {
    en: 'BC Tec 505 TP is a high-performance, high-range water-reducing, slump-retaining and retarding superplasticising admixture designed for long-distance concrete transport and self-levelling ready-mix concrete applications.',
    ar: 'BC Tec 505 TP هو إضافة ملدِّنة فائقة عالية الأداء وعالية المدى لتقليل الماء واحتفاظ الهبوط والتأخير، مصمّمة لنقل الخرسانة لمسافات طويلة وتطبيقات الخرسانة الجاهزة ذاتية التسوية.',
    es: 'BC Tec 505 TP es un aditivo superplastificante de alto rendimiento, reductor de agua de alto rango, con retención de la consistencia y efecto retardante, diseñado para el transporte de hormigón a larga distancia y aplicaciones de hormigón premezclado autonivelante.',
  },
  'BC Tec Cleaner': {
    en: 'BC Tec Cleaner-1 is a specially inhibited, coloured liquid acid cleaner with a pleasant odour — a safer replacement for traditional muriatic acid that produces virtually no fumes and is non-aggressive to most paints, coatings and finishes.',
    ar: 'BC Tec Cleaner-1 هو منظّف حمضي سائل ملوّن ومثبّط خصيصًا برائحة لطيفة — بديل أكثر أمانًا لحمض المورياتيك التقليدي لا ينتج عنه أبخرة تقريبًا وغير ضار بمعظم الدهانات والطلاءات والإنهاءات.',
    es: 'BC Tec Cleaner-1 es un limpiador ácido líquido coloreado y especialmente inhibido, con un olor agradable; un sustituto más seguro del ácido muriático tradicional que prácticamente no produce vapores y no es agresivo con la mayoría de pinturas, recubrimientos y acabados.',
  },
  'BC Tec Corrosion Inhibitor': {
    en: 'BC Tec Corrosion Inhibitor is a chloride-free, ready-to-use aqueous solution of calcium nitrite formulated to protect reinforcing steel in concrete against corrosion without accelerating setting time.',
    ar: 'BC Tec Corrosion Inhibitor هو محلول مائي جاهز للاستخدام من نيتريت الكالسيوم وخالٍ من الكلوريد، مُركّب لحماية حديد التسليح في الخرسانة من التآكل دون تسريع زمن الشكّ.',
    es: 'BC Tec Corrosion Inhibitor es una solución acuosa de nitrito de calcio, lista para usar y sin cloruros, formulada para proteger el acero de refuerzo del hormigón contra la corrosión sin acelerar el tiempo de fraguado.',
  },
  'BC Tec Mar Release': {
    en: 'BC Tec Marlease is a specially formulated blend of volatile hydrocarbons and fatty acids that provides superior mould-release performance (60 m²/L on steel, 10 m²/L on absorbent wood) for easy, clean formwork removal and smooth concrete surfaces.',
    ar: 'BC Tec Marlease هو مزيج مُركّب خصيصًا من الهيدروكربونات المتطايرة والأحماض الدهنية يوفّر أداءً فائقًا لفصل القوالب (60 م²/لتر على الفولاذ، 10 م²/لتر على الخشب الماصّ) لإزالة سهلة ونظيفة للقوالب وأسطح خرسانية ناعمة.',
    es: 'BC Tec Marlease es una mezcla especialmente formulada de hidrocarburos volátiles y ácidos grasos que ofrece un rendimiento superior como desencofrante (60 m²/L sobre acero, 10 m²/L sobre madera absorbente) para un desencofrado fácil y limpio y superficies de hormigón lisas.',
  },
  'BC Thinner 101': {
    en: 'BC Thinner 101 is a highly reactive, low-boiling, fast-evaporating solvent with exceptional solvency power. It softens many synthetic elastomers, coatings and sealants, making it ideal for surface activation, recoating and equipment cleaning before hardening. It is a pure liquid with no added fillers or solids.',
    ar: 'BC Thinner 101 هو مذيب عالي التفاعلية ومنخفض الغليان وسريع التبخّر بقدرة إذابة استثنائية. يليّن العديد من الإيلاستومرات والطلاءات والمواد المانعة للتسرّب الصناعية، ما يجعله مثاليًا لتنشيط السطح وإعادة الطلاء وتنظيف المعدات قبل التصلّب. وهو سائل نقي دون مالئات أو مواد صلبة مضافة.',
    es: 'BC Thinner 101 es un disolvente muy reactivo, de bajo punto de ebullición y evaporación rápida, con una capacidad de disolución excepcional. Ablanda muchos elastómeros, recubrimientos y selladores sintéticos, lo que lo hace ideal para la activación de superficies, el repintado y la limpieza de equipos antes del endurecimiento. Es un líquido puro sin cargas ni sólidos añadidos.',
  },
  'BC Tool Cleaner': {
    en: 'BC Tool Cleaner is a highly reactive, low-boiling, fast-evaporating solvent with excellent solvency power, designed for the effective cleaning of tools, equipment and surfaces prior to coating or elastomer application.',
    ar: 'BC Tool Cleaner هو مذيب عالي التفاعلية ومنخفض الغليان وسريع التبخّر بقدرة إذابة ممتازة، مصمّم للتنظيف الفعّال للأدوات والمعدات والأسطح قبل تطبيق الطلاء أو الإيلاستومر.',
    es: 'BC Tool Cleaner es un disolvente muy reactivo, de bajo punto de ebullición y evaporación rápida, con una excelente capacidad de disolución, diseñado para la limpieza eficaz de herramientas, equipos y superficies antes de aplicar recubrimientos o elastómeros.',
  },
};

(function applyProductI18n() {
  var W = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  if (!W) return;
  W.PRODUCT_I18N = PRODUCT_I18N;
  if (!W.SOLUTIONS) return;
  for (var ci = 0; ci < W.SOLUTIONS.length; ci++) {
    var prods = W.SOLUTIONS[ci].products || [];
    for (var pi = 0; pi < prods.length; pi++) {
      var p = prods[pi];
      var tr = PRODUCT_I18N[p.code];
      if (!tr) continue;
      if (tr.en && p.en) p.en.desc = tr.en;
      if (tr.ar && p.ar) p.ar.desc = tr.ar;
      if (tr.es && p.es) p.es.desc = tr.es;
    }
  }
})();
