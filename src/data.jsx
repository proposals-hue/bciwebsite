/* global window */
/* =============================================================
   BCI — Building Chemistry Industry
   DATA LAYER · single source of truth (bilingual EN/AR)
   --------------------------------------------------------------
   Edit product names, categories, documents, descriptions, jobs
   and projects HERE. The whole site is rendered from this file —
   no layout changes required to update content.
   ============================================================= */

/* ---------------------------------------------------------------
   1 · SOLUTIONS  (9 product categories → products)
   icon = name registered in ui.jsx <Icon>
   Each product: code, en/ar name, en/ar blurb, tags[]
   --------------------------------------------------------------- */
const SOLUTIONS = [
  {
    slug: 'waterproofing-roofing',
    num: '01',
    icon: 'droplets',
    en: { name: 'Waterproofing & Roofing',
          tagline: 'Liquid, sheet and bituminous systems that keep water out — from foundations to roofs.' },
    ar: { name: 'العزل المائي والأسطح',
          tagline: 'أنظمة سائلة ولفائف وبيتومينية تمنع تسرّب المياه — من الأساسات إلى الأسطح.' },
    es: { name: 'Impermeabilización y Cubiertas',
          tagline: 'Sistemas líquidos, laminares y bituminosos que evitan la entrada de agua — desde cimientos hasta cubiertas.' },
    products: [
      { code: 'BC PROOF', size: '20 kg pail', en: { name: 'BC Proof', desc: 'Acrylic elastomeric liquid waterproofing for roofs and decks.' }, ar: { name: 'بي سي بروف', desc: 'عزل سائل أكريليكي مرن للأسطح والبلاطات.' }, tags: ['Saudi-Made', 'UV-Stable'] },
      { code: 'WET PROOF', size: '25 kg + 5 L kit', en: { name: 'Wet Proof', desc: 'Cementitious flexible coating for wet areas and substructures.' }, ar: { name: 'ويت بروف', desc: 'طلاء أسمنتي مرن للمناطق الرطبة والأساسات.' }, tags: ['Saudi-Made'] },
      { code: 'BITU CLASSIC', size: '10 m × 1 m roll', en: { name: 'Bitu Classic', desc: 'SBS-modified bituminous membrane for built-up roofing.' }, ar: { name: 'بيتو كلاسيك', desc: 'لفائف بيتومينية معدّلة SBS للأسطح.' }, tags: ['Torch-Applied'] },
      { code: 'BITU PRIMER', size: '20 L drum', en: { name: 'Bitumen Primer', desc: 'Fast-drying primer that bonds membranes to concrete.' }, ar: { name: 'برايمر بيتوميني', desc: 'برايمر سريع الجفاف يربط اللفائف بالخرسانة.' }, tags: ['Low VOC'] },
      { code: 'PROTECT-P', size: '2 m² board', en: { name: 'Protect P Boards', desc: 'Protection & drainage boards for waterproofed surfaces.' }, ar: { name: 'ألواح بروتكت P', desc: 'ألواح حماية وتصريف للأسطح المعزولة.' }, tags: [] },
      { code: 'WATER PLUG', size: '5 kg pail', en: { name: 'Water Plug', desc: 'Rapid-set hydraulic mortar that stops active leaks in seconds.' }, ar: { name: 'ووتر بلَج', desc: 'مونة هيدروليكية سريعة توقف التسرّب في ثوانٍ.' }, tags: ['Rapid-Set'] },
      { code: 'BCI-FLASH', size: '10 m × 100 mm roll', en: { name: 'Flashing Tape', desc: 'Self-adhesive flashing for detailing penetrations and laps.' }, ar: { name: 'شريط فلاشينج', desc: 'شريط لاصق لمعالجة الاختراقات والتراكبات.' }, tags: [] },
      { code: 'GEOTEX', size: '50 m × 1 m roll', en: { name: 'Geotextile', desc: 'Non-woven reinforcing fleece for liquid membrane systems.' }, ar: { name: 'جيوتكستايل', desc: 'قماش تسليح غير منسوج لأنظمة الأغشية السائلة.' }, tags: [] },
    ],
  },
  {
    slug: 'polyurea-membranes',
    num: '02',
    icon: 'layers',
    en: { name: 'Polyurea & Elastomeric Membranes',
          tagline: 'Spray-applied polyurea and elastomeric linings that cure in seconds for the harshest service.' },
    ar: { name: 'البولي يوريا والأغشية المرنة',
          tagline: 'أنظمة بولي يوريا مرنة تُرشّ وتتصلّب في ثوانٍ لأقسى الظروف.' },
    es: { name: 'Poliurea y Membranas Elastoméricas',
          tagline: 'Revestimientos de poliurea pulverizados y elásticos que curan en segundos para los servicios más exigentes.' },
    products: [
      { code: 'BC 237', size: '440 kg set', en: { name: 'BC 237', desc: 'Pure polyurea spray lining for tanks, tunnels and decks.' }, ar: { name: 'بي سي 237', desc: 'تبطين بولي يوريا نقي للخزانات والأنفاق والبلاطات.' }, tags: ['Saudi-Made', 'Fast-Cure'] },
      { code: 'BC 238 AL', size: '20 kg kit', en: { name: 'BC 238 AL', desc: 'Aliphatic, UV-stable polyurea topcoat for exposed surfaces.' }, ar: { name: 'بي سي 238 AL', desc: 'طبقة بولي يوريا أليفاتية مقاومة للأشعة للأسطح المكشوفة.' }, tags: ['UV-Stable'] },
      { code: 'BC 690H', size: '20 kg kit', en: { name: 'BC 690H', desc: 'Hybrid polyurea for fast turnaround flooring and bunds.' }, ar: { name: 'بي سي 690H', desc: 'بولي يوريا هجين للأرضيات والحواجز سريعة التنفيذ.' }, tags: ['Hybrid'] },
      { code: 'BC X5', size: '25 kg pail', en: { name: 'BC X5', desc: 'High-build elastomeric membrane for movement-prone substrates.' }, ar: { name: 'بي سي X5', desc: 'غشاء مرن عالي السماكة للأسطح المعرّضة للحركة.' }, tags: ['High-Build'] },
      { code: 'WH COLD PU', size: '18 kg kit', en: { name: 'WH Cold Polyurea', desc: 'Cold-applied polyurea — no specialist spray rig required.' }, ar: { name: 'WH بولي يوريا بارد', desc: 'بولي يوريا يُطبّق بارداً دون معدات رشّ متخصصة.' }, tags: ['Cold-Applied'] },
    ],
  },
  {
    slug: 'pu-foam-insulation',
    num: '03',
    icon: 'package',
    en: { name: 'Polyurethane Foam & Insulation',
          tagline: 'Spray and pour PU foam systems plus board insulation for thermal performance in the Gulf.' },
    ar: { name: 'رغوة البولي يوريثان والعزل الحراري',
          tagline: 'أنظمة رغوة بولي يوريثان بالرش والصبّ وألواح عزل لأداء حراري يناسب الخليج.' },
    es: { name: 'Espuma de Poliuretano y Aislamiento',
          tagline: 'Sistemas de espuma PU por pulverización y vaciado, más aislamiento en planchas para el rendimiento térmico en el Golfo.' },
    products: [
      { code: 'BC 601', size: '440 kg set', en: { name: 'BC 601', desc: 'Closed-cell spray foam for roofs and thermal envelopes.' }, ar: { name: 'بي سي 601', desc: 'رغوة رش مغلقة الخلايا للأسطح والأغلفة الحرارية.' }, tags: ['Closed-Cell'] },
      { code: 'BC 700', size: '25 L kit', en: { name: 'BC 700', desc: 'General-purpose two-component PU foam system.' }, ar: { name: 'بي سي 700', desc: 'نظام رغوة بولي يوريثان ثنائي المكونات للأغراض العامة.' }, tags: [] },
      { code: 'BC 702', size: '20 L kit', en: { name: 'BC 702', desc: 'Medium-density pour foam for voids and cavities.' }, ar: { name: 'بي سي 702', desc: 'رغوة صبّ متوسطة الكثافة للفراغات والتجاويف.' }, tags: [] },
      { code: 'BC 706', size: '24 L kit', en: { name: 'BC 706', desc: 'High-density structural foam for load-bearing fill.' }, ar: { name: 'بي سي 706', desc: 'رغوة هيكلية عالية الكثافة للتعبئة الحاملة.' }, tags: ['Structural'] },
      { code: 'BC 710', size: '24 L kit', en: { name: 'BC 710', desc: 'Fire-retardant spray foam for compliant assemblies.' }, ar: { name: 'بي سي 710', desc: 'رغوة رش مثبّطة للهب للأنظمة المطابقة.' }, tags: ['Fire-Retardant'] },
      { code: 'BC 713', size: '20 L kit', en: { name: 'BC 713', desc: 'Low-density foam for lightweight insulation layers.' }, ar: { name: 'بي سي 713', desc: 'رغوة منخفضة الكثافة لطبقات عزل خفيفة.' }, tags: [] },
      { code: 'BC 715', size: '24 L kit', en: { name: 'BC 715', desc: 'Cold-store grade foam for sustained sub-zero service.' }, ar: { name: 'بي سي 715', desc: 'رغوة لغرف التبريد للخدمة تحت الصفر.' }, tags: ['Cold-Store'] },
      { code: 'XPS', size: '1250 × 600 mm board', en: { name: 'XPS Boards', desc: 'Extruded polystyrene insulation boards, high compressive strength.' }, ar: { name: 'ألواح XPS', desc: 'ألواح عزل بوليسترين مبثوق بمقاومة ضغط عالية.' }, tags: [] },
    ],
  },
  {
    slug: 'flooring-systems',
    num: '04',
    icon: 'grid',
    en: { name: 'Flooring Systems',
          tagline: 'Epoxy, PU and decorative floor systems engineered for industry, healthcare and retail.' },
    ar: { name: 'أنظمة الأرضيات',
          tagline: 'أرضيات إيبوكسي وبولي يوريثان وأرضيات تجميلية للصناعة والرعاية الصحية والتجزئة.' },
    es: { name: 'Sistemas de Pisos',
          tagline: 'Sistemas de pisos epoxi, PU y decorativos diseñados para industria, sanidad y comercio.' },
    products: [
      { code: 'BC FLOOR SL', size: '25 kg kit', en: { name: 'BC Floor SL', desc: 'Self-levelling epoxy topping, 2–4 mm, seamless and hardwearing.' }, ar: { name: 'بي سي فلور SL', desc: 'طبقة إيبوكسي ذاتية الاستواء 2–4 ملم متينة وبلا فواصل.' }, tags: ['Saudi-Made'] },
      { code: 'BC POXY FC', size: '20 kg kit', en: { name: 'BC Poxy FC', desc: 'Roller-applied epoxy floor coating for warehouses and plant.' }, ar: { name: 'بي سي بوكسي FC', desc: 'طلاء إيبوكسي للأرضيات يُطبّق بالرول للمستودعات والمصانع.' }, tags: [] },
      { code: 'PU MORTAR', size: '23 kg kit', en: { name: 'PU Mortar', desc: 'Polyurethane cement screed for food, beverage and wet plant.' }, ar: { name: 'مونة بولي يوريثان', desc: 'مونة بولي يوريثان أسمنتية للصناعات الغذائية والمناطق الرطبة.' }, tags: ['Thermal-Shock'] },
      { code: 'EP SCREED', size: '25 kg kit', en: { name: 'Epoxy Screed', desc: 'High-build trowel-applied screed for heavy traffic.' }, ar: { name: 'سكريد إيبوكسي', desc: 'سكريد إيبوكسي عالي السماكة للحركة الكثيفة.' }, tags: [] },
      { code: 'TERRAZZO', size: '25 kg kit', en: { name: 'Epoxy Terrazzo', desc: 'Decorative aggregate terrazzo for premium interiors.' }, ar: { name: 'تيرازو إيبوكسي', desc: 'تيرازو تجميلي بالحصى للديكورات الراقية.' }, tags: ['Decorative'] },
      { code: 'NON-SLIP', size: '25 kg bag', en: { name: 'Non-Slip Aggregate', desc: 'Broadcast aggregate for slip-resistant floor finishes.' }, ar: { name: 'حصى مانع للانزلاق', desc: 'حصى يُنثر لإنهاءات مقاومة للانزلاق.' }, tags: [] },
      { code: 'VINYL ADH', size: '15 kg pail', en: { name: 'Vinyl Flooring Adhesive', desc: 'Bond adhesive for vinyl, LVT and resilient flooring.' }, ar: { name: 'لاصق أرضيات فينيل', desc: 'لاصق لأرضيات الفينيل وLVT والأرضيات المرنة.' }, tags: [] },
    ],
  },
  {
    slug: 'protective-coatings',
    num: '05',
    icon: 'shield-check',
    en: { name: 'Protective & Industrial Coatings',
          tagline: 'Anti-corrosive, chemical and carbonation-resistant coatings for assets that must last.' },
    ar: { name: 'الطلاءات الواقية والصناعية',
          tagline: 'طلاءات مقاومة للتآكل والكيماويات والكربنة للأصول التي يجب أن تدوم.' },
    es: { name: 'Recubrimientos Protectores e Industriales',
          tagline: 'Recubrimientos anticorrosivos, resistentes a químicos y a la carbonatación para activos que deben durar.' },
    products: [
      { code: 'TAR COAT', size: '20 kg kit', en: { name: 'Tar Coat', desc: 'Coal-tar epoxy for buried steel and immersion service.' }, ar: { name: 'تار كوت', desc: 'إيبوكسي قاري للحديد المدفون والخدمة الغمرية.' }, tags: ['Immersion'] },
      { code: 'COAT EPU', size: '20 kg kit', en: { name: 'Coat EPU', desc: 'Epoxy-polyurethane topcoat, UV and abrasion resistant.' }, ar: { name: 'كوت EPU', desc: 'طبقة إيبوكسي-بولي يوريثان مقاومة للأشعة والاحتكاك.' }, tags: ['UV-Stable'] },
      { code: 'GUARD', size: '20 L pail', en: { name: 'Guard', desc: 'Multi-purpose protective coating for concrete and steel.' }, ar: { name: 'جارد', desc: 'طلاء واقٍ متعدد الأغراض للخرسانة والحديد.' }, tags: [] },
      { code: 'ANTI-CARBO', size: '20 L pail', en: { name: 'Anti-Carbo', desc: 'Anti-carbonation coating that protects reinforced concrete.' }, ar: { name: 'أنتي-كاربو', desc: 'طلاء مانع للكربنة يحمي الخرسانة المسلّحة.' }, tags: ['EN 1504-2'] },
      { code: 'ZINC RICH', size: '20 kg kit', en: { name: 'Zinc Rich', desc: 'Zinc-rich epoxy primer for galvanic corrosion protection.' }, ar: { name: 'زنك ريتش', desc: 'برايمر إيبوكسي غني بالزنك للحماية الجلفانية.' }, tags: ['Anti-Corrosive'] },
      { code: 'ROAD MARK', size: '25 kg pail', en: { name: 'Road Mark', desc: 'Hard-wearing line-marking paint for roads and car parks.' }, ar: { name: 'رود مارك', desc: 'دهان خطوط متين للطرق والمواقف.' }, tags: [] },
      { code: 'SHIELD', size: '20 L drum', en: { name: 'Shield', desc: 'Penetrating stone & concrete protection, water-repellent.' }, ar: { name: 'شيلد', desc: 'حماية متغلغلة للحجر والخرسانة طاردة للماء.' }, tags: [] },
    ],
  },
  {
    slug: 'concrete-repair',
    num: '06',
    icon: 'trowel',
    en: { name: 'Concrete Repair & Surface Preparation',
          tagline: 'EN 1504-compliant mortars and prep systems that restore and protect structural concrete.' },
    ar: { name: 'إصلاح الخرسانة وتحضير الأسطح',
          tagline: 'مونات وأنظمة تحضير مطابقة لـ EN 1504 تعيد وتحمي الخرسانة الإنشائية.' },
    es: { name: 'Reparación de Hormigón y Preparación de Superficies',
          tagline: 'Morteros y sistemas de preparación conformes a EN 1504 que restauran y protegen el hormigón estructural.' },
    products: [
      { code: 'BLOCK MORTAR', size: '25 kg bag', en: { name: 'Block Mortar', desc: 'Polymer-modified mortar for blockwork and masonry.' }, ar: { name: 'مونة بلوك', desc: 'مونة بوليمرية للبلوك والمباني الحجرية.' }, tags: [] },
      { code: 'REPAIR R4', size: '25 kg bag', en: { name: 'Repair Mortar R4', desc: 'Structural R4 mortar, up to 50 mm in a single pass.' }, ar: { name: 'مونة إصلاح R4', desc: 'مونة إنشائية R4 حتى 50 ملم في طبقة واحدة.' }, tags: ['EN 1504-3'] },
      { code: 'EP PUTTY', size: '5 kg kit', en: { name: 'Epoxy Putty', desc: 'Two-part epoxy filler for blowholes and fine repairs.' }, ar: { name: 'معجون إيبوكسي', desc: 'معجون إيبوكسي ثنائي لإصلاح الفقاعات والعيوب الدقيقة.' }, tags: [] },
      { code: 'RENDER', size: '25 kg bag', en: { name: 'Plaster / Render', desc: 'Pre-blended render for internal and external walls.' }, ar: { name: 'بياض / لياسة', desc: 'لياسة جاهزة للجدران الداخلية والخارجية.' }, tags: [] },
      { code: 'MICROCEMENT', size: '15 kg kit', en: { name: 'Micro Cement', desc: 'Thin decorative micro-topping for floors and walls.' }, ar: { name: 'مايكرو سمنت', desc: 'طبقة تجميلية رقيقة للأرضيات والجدران.' }, tags: ['Decorative'] },
      { code: 'LEVEL SCREED', size: '25 kg bag', en: { name: 'Level Screed', desc: 'Self-smoothing underlayment to level substrates.' }, ar: { name: 'سكريد تسوية', desc: 'طبقة تسوية ذاتية لتسطيح الأسطح.' }, tags: [] },
      { code: 'BONDING', size: '20 L drum', en: { name: 'Bonding Agent', desc: 'SBR/acrylic bonding bridge for new-to-old concrete.' }, ar: { name: 'مادة ربط', desc: 'جسر ربط SBR/أكريليك بين الخرسانة الجديدة والقديمة.' }, tags: [] },
    ],
  },
  {
    slug: 'tile-grouts-anchors',
    num: '07',
    icon: 'layout-grid',
    en: { name: 'Tile Adhesives, Grouts & Anchors',
          tagline: 'Tile fixing, joint grouts and high-strength anchoring grouts for fit-out and structures.' },
    ar: { name: 'لواصق البلاط والجراوت والتثبيت',
          tagline: 'لواصق بلاط وجراوت فواصل وجراوت تثبيت عالي المقاومة للتشطيب والمنشآت.' },
    es: { name: 'Adhesivos para Baldosas, Lechadas y Anclajes',
          tagline: 'Fijación de baldosas, lechadas de juntas y lechadas de anclaje de alta resistencia para acabados y estructuras.' },
    products: [
      { code: 'TILE FIX', size: '25 kg bag', en: { name: 'Tile Fix', desc: 'C1 cementitious adhesive for standard ceramic tiling.' }, ar: { name: 'تايل فيكس', desc: 'لاصق أسمنتي C1 للبلاط السيراميكي القياسي.' }, tags: [] },
      { code: 'TILE PRO', size: '25 kg bag', en: { name: 'Tile Adhesive Pro', desc: 'C2TE high-grip adhesive for porcelain and large format.' }, ar: { name: 'تايل أدهيسيف برو', desc: 'لاصق C2TE عالي التماسك للبورسلان والمقاسات الكبيرة.' }, tags: ['C2TE'] },
      { code: 'TILE GROUT', size: '5 kg bag', en: { name: 'Tile Grout', desc: 'Coloured cementitious joint grout, mould resistant.' }, ar: { name: 'تايل جراوت', desc: 'جراوت فواصل أسمنتي ملوّن مقاوم للعفن.' }, tags: [] },
      { code: 'TILE POXY', size: '5 kg kit', en: { name: 'Tile Poxy', desc: 'Epoxy tile adhesive for chemical and hygiene zones.' }, ar: { name: 'تايل بوكسي', desc: 'لاصق بلاط إيبوكسي للمناطق الكيميائية والصحية.' }, tags: [] },
      { code: 'POXY GROUT', size: '5 kg kit', en: { name: 'Poxy Grout', desc: 'Epoxy joint grout, stain-proof and acid resistant.' }, ar: { name: 'بوكسي جراوت', desc: 'جراوت إيبوكسي للفواصل مقاوم للبقع والأحماض.' }, tags: ['Chemical-Resistant'] },
      { code: 'CEM GROUT', size: '25 kg bag', en: { name: 'Cem Grout', desc: 'Non-shrink cementitious grout for base plates and anchors.' }, ar: { name: 'سيم جراوت', desc: 'جراوت أسمنتي غير منكمش للقواعد والتثبيتات.' }, tags: ['Non-Shrink'] },
      { code: 'INJ GROUT', size: '5 L kit', en: { name: 'Injection Grout', desc: 'Resin injection grout for crack sealing and stabilisation.' }, ar: { name: 'جراوت حقن', desc: 'جراوت حقن راتنجي لسدّ الشقوق وتثبيتها.' }, tags: [] },
    ],
  },
  {
    slug: 'sealants-joints',
    num: '08',
    icon: 'minus-square',
    en: { name: 'Sealants, Joints & Adhesives',
          tagline: 'Movement-joint sealants and structural adhesives that flex, bond and stay watertight.' },
    ar: { name: 'المواد المانعة والفواصل واللواصق',
          tagline: 'مواد مانعة لفواصل الحركة ولواصق إنشائية تتمدّد وتربط وتبقى مانعة للماء.' },
    es: { name: 'Selladores, Juntas y Adhesivos',
          tagline: 'Selladores para juntas de movimiento y adhesivos estructurales que flexionan, adhieren y permanecen estancos.' },
    products: [
      { code: 'S900', size: '600 ml sausage', en: { name: 'S900', desc: 'Hybrid MS-polymer sealant & adhesive, paintable.' }, ar: { name: 'S900', desc: 'مادة مانعة ولاصقة هجينة MS قابلة للدهان.' }, tags: ['Hybrid'] },
      { code: 'TEC SEAL', size: '600 ml sausage', en: { name: 'Tec Sealants', desc: 'Single-component PU sealant for general construction joints.' }, ar: { name: 'تك سيلانت', desc: 'مادة مانعة بولي يوريثان أحادية لفواصل البناء العامة.' }, tags: [] },
      { code: 'POLYSULFIDE', size: '4 L kit', en: { name: 'Polysulphide Sealant', desc: 'Two-part joint sealant for fuel and chemical exposure.' }, ar: { name: 'بولي سلفايد', desc: 'مادة مانعة ثنائية للفواصل المعرّضة للوقود والكيماويات.' }, tags: ['Fuel-Resistant'] },
      { code: 'SAND BOND', size: '20 kg bag', en: { name: 'Sand Bond', desc: 'Polymeric jointing sand for paving and hardscape.' }, ar: { name: 'ساند بوند', desc: 'رمل فواصل بوليمري للبلاط والأرصفة.' }, tags: [] },
      { code: 'MARBLE ADH', size: '5 kg pail', en: { name: 'Marble Adhesive', desc: 'High-bond adhesive for marble, granite and stone.' }, ar: { name: 'لاصق رخام', desc: 'لاصق عالي التماسك للرخام والجرانيت والحجر.' }, tags: [] },
      { code: 'HMP ADH', size: '290 ml cartridge', en: { name: 'HMP Adhesive', desc: 'High-modulus structural adhesive for heavy bonding.' }, ar: { name: 'لاصق HMP', desc: 'لاصق إنشائي عالي المعامل للربط الثقيل.' }, tags: ['Structural'] },
    ],
  },
  {
    slug: 'admixtures-aids',
    num: '09',
    icon: 'flask',
    en: { name: 'Admixtures, Curing & Construction Aids',
          tagline: 'Concrete admixtures, curing compounds and site chemicals that improve every pour.' },
    ar: { name: 'الإضافات والمعالجة ومواد المساندة',
          tagline: 'إضافات خرسانة ومركّبات معالجة وكيماويات موقع تحسّن كل صبّة.' },
    es: { name: 'Aditivos, Curado y Auxiliares de Construcción',
          tagline: 'Aditivos para hormigón, compuestos de curado y químicos de obra que mejoran cada vertido.' },
    products: [
      { code: 'ADMIX', size: '20 L can', en: { name: 'Admix', desc: 'Water-reducing admixture range for workable, durable concrete.' }, ar: { name: 'أدمكس', desc: 'تشكيلة إضافات تقليل الماء لخرسانة قابلة للتشغيل ومتينة.' }, tags: [] },
      { code: 'PLAST', size: '20 L can', en: { name: 'Plast', desc: 'Superplasticiser for high-flow and high-strength mixes.' }, ar: { name: 'بلاست', desc: 'ملدّن فائق للخلطات عالية السيولة والمقاومة.' }, tags: [] },
      { code: 'CURE', size: '200 L drum', en: { name: 'Cure', desc: 'Resin-based curing compound that retains mix water.' }, ar: { name: 'كيور', desc: 'مركّب معالجة راتنجي يحفظ ماء الخلطة.' }, tags: [] },
      { code: 'MAR RELEASE', size: '20 L can', en: { name: 'Mar Release', desc: 'Mould-release agent for clean concrete finishes.' }, ar: { name: 'مار ريليس', desc: 'عامل فكّ قوالب لإنهاءات خرسانية نظيفة.' }, tags: [] },
      { code: 'CORR INHIB', size: '20 L can', en: { name: 'Corrosion Inhibitor', desc: 'Migrating inhibitor that protects embedded steel.' }, ar: { name: 'مانع تآكل', desc: 'مانع تآكل متنقّل يحمي الحديد المدفون.' }, tags: ['Anti-Corrosive'] },
      { code: 'CLEANERS', size: '20 L can', en: { name: 'Cleaners & Thinners', desc: 'Solvents and cleaners for tools and surface preparation.' }, ar: { name: 'منظفات ومخفّفات', desc: 'مذيبات ومنظفات للأدوات وتحضير الأسطح.' }, tags: [] },
      { code: 'PRIMERS', size: '5 L can', en: { name: 'Primers', desc: 'Substrate primers that promote adhesion across systems.' }, ar: { name: 'برايمرات', desc: 'برايمرات أساس تعزّز الالتصاق عبر الأنظمة.' }, tags: [] },
      { code: 'AGGREGATES', size: '25 kg bag', en: { name: 'Aggregates', desc: 'Graded quartz and fillers for screeds and mortars.' }, ar: { name: 'ركام', desc: 'كوارتز مدرّج ومواد مالئة للسكريد والمونة.' }, tags: [] },
    ],
  },
];

/* ---------------------------------------------------------------
   2 · PROJECTS  (reference projects, data-driven)
   --------------------------------------------------------------- */
const PROJECTS = [
  { sector: { en: 'Infrastructure', ar: 'بنية تحتية', es: 'Infraestructura' },
    title: { en: 'Riyadh Metro · Yellow Line', ar: 'مترو الرياض · المسار الأصفر', es: 'Metro de Riad · Línea Amarilla' },
    loc: { en: 'Riyadh, KSA', ar: 'الرياض، السعودية', es: 'Riad, KSA' }, year: '2024',
    sys: { en: 'BC 237 polyurea tunnel lining · 42 km', ar: 'تبطين أنفاق بولي يوريا BC 237 · 42 كم', es: 'Revestimiento de túnel poliurea BC 237 · 42 km' },
    swatch: 'linear-gradient(160deg, #357293 0%, #0B3752 100%)', icon: 'layers',
    img: 'assets/projects/riyadh-metro.jpg', composed: true },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'Roshn Sedra · Phase 2', ar: 'روشن السدرة · المرحلة 2', es: 'Roshn Sedra · Fase 2' },
    loc: { en: 'North Riyadh, KSA', ar: 'شمال الرياض، السعودية', es: 'Norte de Riad, KSA' }, year: '2025',
    sys: { en: 'BC Proof liquid membrane · 12,800 villa roofs', ar: 'غشاء سائل BC Proof · 12,800 سقف فلل', es: 'Membrana líquida BC Proof · 12.800 techos de villas' },
    swatch: 'linear-gradient(160deg, #6895AE 0%, #0B3752 100%)', icon: 'droplets',
    img: 'assets/projects/roshn-sedra.jpg', composed: false },
  { sector: { en: 'Commercial', ar: 'تجاري', es: 'Comercial' },
    title: { en: 'King Salman Park · Visitor Pavilion', ar: 'حديقة الملك سلمان · جناح الزوار', es: 'Parque Rey Salman · Pabellón de Visitantes' },
    loc: { en: 'Riyadh, KSA', ar: 'الرياض، السعودية', es: 'Riad, KSA' }, year: '2025',
    sys: { en: 'BC Floor SL self-levelling topping · 6,400 m²', ar: 'طبقة BC Floor SL ذاتية الاستواء · 6,400 م²', es: 'Recubrimiento autonivelante BC Floor SL · 6.400 m²' },
    swatch: 'linear-gradient(160deg, #1E4D6E 0%, #0B3752 100%)', icon: 'grid',
    img: 'assets/projects/king-salman-park.jpg', composed: true },
  { sector: { en: 'Industrial', ar: 'صناعي', es: 'Industrial' },
    title: { en: 'SABIC Logistics Hub', ar: 'مركز سابك اللوجستي', es: 'Centro Logístico SABIC' },
    loc: { en: 'Jubail, KSA', ar: 'الجبيل، السعودية', es: 'Jubail, KSA' }, year: '2024',
    sys: { en: 'PU Mortar food-grade flooring · 18,000 m²', ar: 'أرضيات مونة بولي يوريثان · 18,000 م²', es: 'Piso grado alimentario PU Mortar · 18.000 m²' },
    swatch: 'linear-gradient(160deg, #4E5762 0%, #14181C 100%)', icon: 'package',
    img: 'assets/projects/sabic-logistics.jpg', composed: true },
  { sector: { en: 'Water', ar: 'مياه', es: 'Agua' },
    title: { en: 'NWC Reservoir Rehabilitation', ar: 'تأهيل خزان شركة المياه الوطنية', es: 'Rehabilitación de Embalse NWC' },
    loc: { en: 'Qassim, KSA', ar: 'القصيم، السعودية', es: 'Qassim, KSA' }, year: '2023',
    sys: { en: 'BC 690H potable-water lining · 9 tanks', ar: 'تبطين BC 690H لمياه الشرب · 9 خزانات', es: 'Revestimiento agua potable BC 690H · 9 tanques' },
    swatch: 'linear-gradient(160deg, #0E5E6F 0%, #07273A 100%)', icon: 'droplets',
    img: 'assets/projects/nwc-reservoir.jpg', composed: true },
  { sector: { en: 'Infrastructure', ar: 'بنية تحتية', es: 'Infraestructura' },
    title: { en: 'King Abdulaziz Road · Bridges', ar: 'طريق الملك عبدالعزيز · الجسور', es: 'Carretera Rey Abdulaziz · Puentes' },
    loc: { en: 'Riyadh, KSA', ar: 'الرياض، السعودية', es: 'Riad, KSA' }, year: '2024',
    sys: { en: 'Anti-Carbo protective coating · 22 bridge decks', ar: 'طلاء أنتي-كاربو الواقي · 22 سطح جسر', es: 'Recubrimiento protector Anti-Carbo · 22 tableros de puente' },
    swatch: 'linear-gradient(160deg, #357293 0%, #051D2C 100%)', icon: 'shield-check',
    img: 'assets/projects/king-abdulaziz-bridges.jpg', composed: true },
  { sector: { en: 'Commercial', ar: 'تجاري', es: 'Comercial' },
    title: { en: 'Diriyah Gate · Retail District', ar: 'بوابة الدرعية · الحي التجاري', es: 'Puerta de Diriyah · Distrito Comercial' },
    loc: { en: 'Diriyah, KSA', ar: 'الدرعية، السعودية', es: 'Diriyah, KSA' }, year: '2025',
    sys: { en: 'Epoxy Terrazzo decorative floors · 14,500 m²', ar: 'أرضيات تيرازو إيبوكسي · 14,500 م²', es: 'Pisos decorativos Terrazo Epoxi · 14.500 m²' },
    swatch: 'linear-gradient(160deg, #6895AE 0%, #093047 100%)', icon: 'grid',
    img: 'assets/projects/diriyah-gate.jpg', composed: true },
  { sector: { en: 'Industrial', ar: 'صناعي', es: 'Industrial' },
    title: { en: 'Ma\u2019aden Phosphate Plant', ar: 'مصنع معادن للفوسفات', es: 'Planta de Fosfato Ma\u2019aden' },
    loc: { en: 'Ras Al Khair, KSA', ar: 'رأس الخير، السعودية', es: 'Ras Al Khair, KSA' }, year: '2023',
    sys: { en: 'Tar Coat chemical bund lining · 26 bunds', ar: 'تبطين حواجز كيميائية تار كوت · 26 حاجز', es: 'Revestimiento de cubeto químico Tar Coat · 26 cubetos' },
    swatch: 'linear-gradient(160deg, #4E5762 0%, #14181C 100%)', icon: 'shield-check',
    img: 'assets/projects/maaden-phosphate.jpg', composed: false },
  { sector: { en: 'Water', ar: 'مياه', es: 'Agua' },
    title: { en: 'Sindalah Island · NEOM', ar: 'جزيرة سندالة · نيوم', es: 'Isla Sindalah · NEOM' },
    loc: { en: 'NEOM, KSA', ar: 'نيوم، السعودية', es: 'NEOM, KSA' }, year: '2024',
    sys: { en: 'GRP waterproofing system · BEC Contracting', ar: 'نظام عزل GRP · بي إي سي للمقاولات', es: 'Sistema de impermeabilización GRP · BEC Contracting' },
    swatch: 'linear-gradient(160deg, #0E5E6F 0%, #07273A 100%)', icon: 'droplets',
    img: 'assets/projects/sindalah-island.jpg', composed: false },
  { sector: { en: 'Commercial', ar: 'تجاري', es: 'Comercial' },
    title: { en: 'NEOM Hotel', ar: 'فندق نيوم', es: 'Hotel NEOM' },
    loc: { en: 'NEOM, KSA', ar: 'نيوم، السعودية', es: 'NEOM, KSA' }, year: '2024',
    sys: { en: 'Hospitality waterproofing & coatings · BEC Contracting', ar: 'عزل وطلاءات قطاع الضيافة · بي إي سي للمقاولات', es: 'Impermeabilización y recubrimientos hoteleros · BEC Contracting' },
    swatch: 'linear-gradient(160deg, #6895AE 0%, #093047 100%)', icon: 'grid',
    img: 'assets/projects/neom-hotel.jpg', composed: false },
  { sector: { en: 'Commercial', ar: 'تجاري', es: 'Comercial' },
    title: { en: 'AMAALA Giga-Project', ar: 'مشروع أمالا العملاق', es: 'Megaproyecto AMAALA' },
    loc: { en: 'Red Sea Coast, KSA', ar: 'ساحل البحر الأحمر، السعودية', es: 'Costa del Mar Rojo, KSA' }, year: '2024',
    sys: { en: 'Protective coating systems · Arabian Construction Co.', ar: 'أنظمة طلاء واقية · الشركة العربية للإنشاءات', es: 'Sistemas de recubrimiento protector · Arabian Construction Co.' },
    swatch: 'linear-gradient(160deg, #357293 0%, #051D2C 100%)', icon: 'shield-check',
    img: 'assets/projects/amaala-giga.jpg', composed: true },
  { sector: { en: 'Infrastructure', ar: 'بنية تحتية', es: 'Infraestructura' },
    title: { en: 'Royal Saudi Navy Force', ar: 'القوات البحرية الملكية السعودية', es: 'Real Fuerza Naval Saudí' },
    loc: { en: 'KSA — Naval Base', ar: 'السعودية — قاعدة بحرية', es: 'KSA — Base Naval' }, year: '2023',
    sys: { en: 'Roof waterproofing & rehabilitation', ar: 'عزل وتأهيل الأسطح', es: 'Impermeabilización y rehabilitación de cubiertas' },
    swatch: 'linear-gradient(160deg, #1E4D6E 0%, #0B3752 100%)', icon: 'shield-check',
    img: 'assets/projects/royal-saudi-navy.jpg', composed: true },
  { sector: { en: 'Industrial', ar: 'صناعي', es: 'Industrial' },
    title: { en: 'Smart Box Factory', ar: 'مصنع سمارت بوكس', es: 'Fábrica Smart Box' },
    loc: { en: 'KSA — Industrial', ar: 'السعودية — صناعي', es: 'KSA — Industrial' }, year: '2023',
    sys: { en: 'Industrial flooring & coating system', ar: 'نظام أرضيات وطلاءات صناعية', es: 'Sistema de pisos y recubrimientos industriales' },
    swatch: 'linear-gradient(160deg, #4E5762 0%, #14181C 100%)', icon: 'package',
    img: 'assets/projects/smart-box-factory.jpg', composed: false },
  { sector: { en: 'Water', ar: 'مياه', es: 'Agua' },
    title: { en: 'Salaba · Swimming Pool', ar: 'صلبة · مشروع المسبح', es: 'Salaba · Piscina' },
    loc: { en: 'KSA', ar: 'السعودية', es: 'KSA' }, year: '2023',
    sys: { en: 'Swimming-pool waterproofing application', ar: 'تطبيق عزل المسابح', es: 'Aplicación de impermeabilización de piscinas' },
    swatch: 'linear-gradient(160deg, #0E5E6F 0%, #07273A 100%)', icon: 'droplets',
    img: 'assets/projects/salaba-pool.jpg', composed: false },
  { sector: { en: 'Commercial', ar: 'تجاري', es: 'Comercial' },
    title: { en: 'Clock Tower Project', ar: 'مشروع برج الساعة', es: 'Proyecto Torre del Reloj' },
    loc: { en: 'KSA', ar: 'السعودية', es: 'KSA' }, year: '2024',
    sys: { en: 'Facade & deck waterproofing', ar: 'عزل الواجهات والأسطح', es: 'Impermeabilización de fachadas y cubiertas' },
    swatch: 'linear-gradient(160deg, #6895AE 0%, #0B3752 100%)', icon: 'grid',
    img: 'assets/projects/clock-tower.jpg', composed: false },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'High-End Villa Basements', ar: 'أقبية فلل راقية', es: 'Sótanos de Villas de Alta Gama' },
    loc: { en: 'Dammam, KSA', ar: 'الدمام، السعودية', es: 'Dammam, KSA' }, year: '2024',
    sys: { en: 'BC Seal 107 + BC Crysto Proof · Basement waterproofing', ar: 'BC Seal 107 + BC Crysto Proof · عزل الأقبية', es: 'BC Seal 107 + BC Crysto Proof · Impermeabilización de sótanos' },
    swatch: 'linear-gradient(160deg, #1E4D6E 0%, #0B3752 100%)', icon: 'droplets',
    img: 'assets/projects/villa-basements.jpg', composed: false },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'Gated Community Swimming Pools', ar: 'مسابح مجمعات سكنية مغلقة', es: 'Piscinas de Comunidad Cerrada' },
    loc: { en: 'Riyadh, KSA', ar: 'الرياض، السعودية', es: 'Riad, KSA' }, year: '2024',
    sys: { en: 'BC 690H hybrid polyurea · Pool waterproofing', ar: 'BC 690H بولي يوريا هجين · عزل المسابح', es: 'Poliurea híbrida BC 690H · Impermeabilización de piscinas' },
    swatch: 'linear-gradient(160deg, #0E5E6F 0%, #07273A 100%)', icon: 'droplets',
    img: 'assets/projects/gated-community.jpg', composed: false },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'Luxury Residential Facades', ar: 'واجهات سكنية فاخرة', es: 'Fachadas Residenciales de Lujo' },
    loc: { en: 'Al Khobar, KSA', ar: 'الخبر، السعودية', es: 'Al Khobar, KSA' }, year: '2024',
    sys: { en: 'BC Stone Protection · Stone & facade protection', ar: 'BC Stone Protection · حماية الحجر والواجهات', es: 'BC Stone Protection · Protección de piedra y fachadas' },
    swatch: 'linear-gradient(160deg, #357293 0%, #051D2C 100%)', icon: 'shield-check',
    img: 'assets/projects/luxury-facades.jpg', composed: false },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'Residential Parking Areas', ar: 'مواقف سيارات سكنية', es: 'Áreas de Estacionamiento Residencial' },
    loc: { en: 'Dammam, KSA', ar: 'الدمام، السعودية', es: 'Dammam, KSA' }, year: '2023',
    sys: { en: 'BC Poxy 140 Screed · Parking floor protection', ar: 'BC Poxy 140 Screed · حماية أرضيات المواقف', es: 'BC Poxy 140 Screed · Protección de pisos de estacionamiento' },
    swatch: 'linear-gradient(160deg, #4E5762 0%, #14181C 100%)', icon: 'grid',
    img: 'assets/projects/residential-parking.jpg', composed: false },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'Premium Villa Roofs', ar: 'أسطح فلل متميزة', es: 'Techos de Villas Premium' },
    loc: { en: 'Riyadh, KSA', ar: 'الرياض، السعودية', es: 'Riad, KSA' }, year: '2024',
    sys: { en: 'BC 237 pure polyurea · Long-term roof waterproofing', ar: 'BC 237 بولي يوريا نقي · عزل الأسطح طويل الأمد', es: 'Poliurea pura BC 237 · Impermeabilización de techos a largo plazo' },
    swatch: 'linear-gradient(160deg, #6895AE 0%, #093047 100%)', icon: 'droplets',
    img: 'assets/projects/premium-villa-roofs.jpg', composed: false },
  { sector: { en: 'Residential', ar: 'سكني', es: 'Residencial' },
    title: { en: 'Luxury Compound Expansion Joints', ar: 'فواصل تمدد مجمعات فاخرة', es: 'Juntas de Dilatación de Complejos de Lujo' },
    loc: { en: 'Jeddah, KSA', ar: 'جدة، السعودية', es: 'Yeda, KSA' }, year: '2023',
    sys: { en: 'BC TEC 30 · Joint sealing', ar: 'BC TEC 30 · إغلاق الفواصل', es: 'BC TEC 30 · Sellado de juntas' },
    swatch: 'linear-gradient(160deg, #357293 0%, #0B3752 100%)', icon: 'layers',
    img: 'assets/projects/luxury-compound-joints.jpg', composed: false },
];

const PROJECT_SECTORS = ['All', 'Infrastructure', 'Residential', 'Commercial', 'Industrial', 'Water'];

/* ---------------------------------------------------------------
   3 · RESOURCES  (document library, data-driven)
   type: tds | sds | catalog | spec | cert
   --------------------------------------------------------------- */
const RESOURCE_TYPES = [
  { id: 'tds', en: 'Technical Data Sheets', ar: 'النشرات الفنية', icon: 'file-text' },
  { id: 'sds', en: 'Safety Data Sheets', ar: 'نشرات السلامة', icon: 'shield-check' },
  { id: 'catalog', en: 'Catalogs & Brochures', ar: 'الكتالوجات والكتيبات', icon: 'book' },
  { id: 'spec', en: 'Specifications & Method Statements', ar: 'المواصفات وبيانات الطريقة', icon: 'clipboard' },
  { id: 'cert', en: 'Certifications & Approvals', ar: 'الشهادات والاعتمادات', icon: 'award' },
];

const RESOURCES = [
  { type: 'tds', code: 'BC 237', en: 'BC 237 Polyurea — Technical Data Sheet', ar: 'بي سي 237 بولي يوريا — نشرة فنية', size: '480 KB', fmt: 'PDF' },
  { type: 'tds', code: 'BC PROOF', en: 'BC Proof Liquid Membrane — Technical Data Sheet', ar: 'بي سي بروف — نشرة فنية', size: '512 KB', fmt: 'PDF' },
  { type: 'tds', code: 'BC FLOOR SL', en: 'BC Floor SL Epoxy — Technical Data Sheet', ar: 'بي سي فلور SL — نشرة فنية', size: '496 KB', fmt: 'PDF' },
  { type: 'tds', code: 'PU MORTAR', en: 'PU Mortar Flooring — Technical Data Sheet', ar: 'مونة بولي يوريثان — نشرة فنية', size: '470 KB', fmt: 'PDF' },
  { type: 'tds', code: 'ANTI-CARBO', en: 'Anti-Carbo Coating — Technical Data Sheet', ar: 'أنتي-كاربو — نشرة فنية', size: '455 KB', fmt: 'PDF' },
  { type: 'sds', code: 'BC 237', en: 'BC 237 Polyurea — Safety Data Sheet', ar: 'بي سي 237 — نشرة سلامة', size: '320 KB', fmt: 'PDF' },
  { type: 'sds', code: 'BC FLOOR SL', en: 'BC Floor SL — Safety Data Sheet', ar: 'بي سي فلور SL — نشرة سلامة', size: '305 KB', fmt: 'PDF' },
  { type: 'sds', code: 'TAR COAT', en: 'Tar Coat — Safety Data Sheet', ar: 'تار كوت — نشرة سلامة', size: '298 KB', fmt: 'PDF' },
  { type: 'catalog', code: 'BCI', en: 'BCI Master Product Catalog 2026', ar: 'كتالوج منتجات BCI 2026', size: '14.2 MB', fmt: 'PDF' },
  { type: 'catalog', code: 'WP', en: 'Waterproofing Systems Brochure', ar: 'كتيب أنظمة العزل المائي', size: '6.1 MB', fmt: 'PDF' },
  { type: 'catalog', code: 'FLOOR', en: 'Flooring Systems Brochure', ar: 'كتيب أنظمة الأرضيات', size: '5.4 MB', fmt: 'PDF' },
  { type: 'spec', code: 'WP-SPEC', en: 'Liquid Membrane — Method Statement', ar: 'الغشاء السائل — بيان طريقة', size: '380 KB', fmt: 'PDF' },
  { type: 'spec', code: 'FL-SPEC', en: 'Epoxy Flooring — Application Specification', ar: 'أرضيات الإيبوكسي — مواصفة تطبيق', size: '410 KB', fmt: 'PDF' },
  { type: 'cert', code: 'ISO9001', en: 'ISO 9001:2015 — Quality Management', ar: 'آيزو 9001:2015 — إدارة الجودة', size: '220 KB', fmt: 'PDF' },
  { type: 'cert', code: 'EN1504', en: 'EN 1504-2 — Conformity Certificate', ar: 'EN 1504-2 — شهادة مطابقة', size: '210 KB', fmt: 'PDF' },
  { type: 'cert', code: 'SASO', en: 'SASO / SABER Product Registration', ar: 'تسجيل ساسو / سابر للمنتجات', size: '240 KB', fmt: 'PDF' },
];

/* ---------------------------------------------------------------
   4 · CAREERS  (open positions + benefits + values)
   --------------------------------------------------------------- */
const JOBS = [
  { id: 'tech-sales-dammam', dept: { en: 'Sales', ar: 'المبيعات' }, type: { en: 'Full-time', ar: 'دوام كامل' },
    loc: { en: 'Dammam', ar: 'الدمام' },
    title: { en: 'Technical Sales Engineer', ar: 'مهندس مبيعات فني' },
    blurb: { en: 'Specify BCI systems with consultants and contractors across the Eastern Region.', ar: 'مواصفة أنظمة BCI مع الاستشاريين والمقاولين في المنطقة الشرقية.' } },
  { id: 'rd-chemist', dept: { en: 'R&D', ar: 'البحث والتطوير' }, type: { en: 'Full-time', ar: 'دوام كامل' },
    loc: { en: 'Dammam — Plant', ar: 'الدمام — المصنع' },
    title: { en: 'Formulation Chemist', ar: 'كيميائي تركيبات' },
    blurb: { en: 'Develop polyurethane and epoxy systems in our R&D laboratory.', ar: 'تطوير أنظمة البولي يوريثان والإيبوكسي في مختبر البحث والتطوير.' } },
  { id: 'site-applicator', dept: { en: 'Operations', ar: 'العمليات' }, type: { en: 'Full-time', ar: 'دوام كامل' },
    loc: { en: 'KSA — Site', ar: 'السعودية — موقع' },
    title: { en: 'Application Supervisor', ar: 'مشرف تطبيق' },
    blurb: { en: 'Supervise waterproofing and flooring application on national projects.', ar: 'الإشراف على تطبيق العزل والأرضيات في المشاريع الوطنية.' } },
  { id: 'qc-tech', dept: { en: 'Quality', ar: 'الجودة' }, type: { en: 'Full-time', ar: 'دوام كامل' },
    loc: { en: 'Dammam — Plant', ar: 'الدمام — المصنع' },
    title: { en: 'QA / QC Technician', ar: 'فني ضبط الجودة' },
    blurb: { en: 'Run batch testing and certify outgoing product against spec.', ar: 'إجراء اختبارات الدفعات واعتماد المنتجات وفق المواصفات.' } },
  { id: 'logistics', dept: { en: 'Supply Chain', ar: 'سلسلة الإمداد' }, type: { en: 'Full-time', ar: 'دوام كامل' },
    loc: { en: 'Dammam', ar: 'الدمام' },
    title: { en: 'Logistics Coordinator', ar: 'منسق لوجستيات' },
    blurb: { en: 'Plan dispatch and delivery of product to projects across the Kingdom.', ar: 'تخطيط شحن وتسليم المنتجات للمشاريع في أنحاء المملكة.' } },
  { id: 'marketing', dept: { en: 'Marketing', ar: 'التسويق' }, type: { en: 'Full-time', ar: 'دوام كامل' },
    loc: { en: 'Dammam', ar: 'الدمام' },
    title: { en: 'Marketing Specialist', ar: 'أخصائي تسويق' },
    blurb: { en: 'Own technical content, brand and digital channels — Arabic & English.', ar: 'إدارة المحتوى الفني والعلامة والقنوات الرقمية — عربي وإنجليزي.' } },
];

const BENEFITS = [
  { icon: 'shield-check', en: { t: 'Medical Coverage', d: 'Comprehensive health insurance for you and your family.' }, ar: { t: 'تأمين طبي', d: 'تأمين صحي شامل لك ولعائلتك.' } },
  { icon: 'flask', en: { t: 'Learning & R&D', d: 'Hands-on development in a working chemistry laboratory.' }, ar: { t: 'تعلّم وبحث', d: 'تطوير عملي داخل مختبر كيمياء فعّال.' } },
  { icon: 'factory', en: { t: 'Made-in-KSA Mission', d: 'Build the Kingdom\u2019s industrial base under Vision 2030.' }, ar: { t: 'مهمة صناعة سعودية', d: 'ابنِ القاعدة الصناعية للمملكة ضمن رؤية 2030.' } },
  { icon: 'arrow-up-right', en: { t: 'Growth Path', d: 'Clear progression as we scale across the GCC.' }, ar: { t: 'مسار نموّ', d: 'تطور وظيفي واضح مع توسّعنا في الخليج.' } },
];

const VALUES = [
  { num: '01', en: { t: 'Engineering First', d: 'Every decision starts with the datasheet, not the brochure.' }, ar: { t: 'الهندسة أولاً', d: 'كل قرار يبدأ من النشرة الفنية لا من الكتيب.' } },
  { num: '02', en: { t: 'Built to Last', d: 'We measure success in decades of service, not delivery dates.' }, ar: { t: 'صُنع ليدوم', d: 'نقيس النجاح بعقود من الخدمة لا بتواريخ التسليم.' } },
  { num: '03', en: { t: 'Saudi & Proud', d: 'A national manufacturer investing in local talent and supply.' }, ar: { t: 'سعوديون وفخورون', d: 'مصنع وطني يستثمر في الكفاءات والإمداد المحلي.' } },
];

/* ---------------------------------------------------------------
   5 · COMPANY  (stats, timeline, contact details, locations)
   --------------------------------------------------------------- */
const STATS = [
  { v: '120+', en: 'Products', ar: 'منتج', es: 'Productos' },
  { v: '9', en: 'Solution Lines', ar: 'خطوط حلول', es: 'Líneas de soluciones' },
  { v: '2021', en: 'Founded', ar: 'سنة التأسيس', es: 'Fundado' },
  { v: '500+', en: 'Projects Delivered', ar: 'مشروع منجز', es: 'Proyectos entregados' },
];

const TIMELINE = [
  { year: '2021', en: { t: 'Founded in Dammam', d: 'BCI established as a Saudi construction-chemicals manufacturer.' }, ar: { t: 'التأسيس في الدمام', d: 'تأسيس BCI كمصنع سعودي للكيماويات الإنشائية.' }, es: { t: 'Fundada en Dammam', d: 'BCI se establece como fabricante saudí de químicos para construcción.' } },
  { year: '2022', en: { t: 'Plant Commissioned', d: '3rd Industrial City facility begins polyurethane & epoxy production.' }, ar: { t: 'تشغيل المصنع', d: 'بدء الإنتاج في المدينة الصناعية الثالثة.' }, es: { t: 'Planta en operación', d: 'Las instalaciones de la 3.ª Ciudad Industrial inician producción de poliuretano y epoxi.' } },
  { year: '2023', en: { t: 'ISO 9001 & EN 1504', d: 'Quality system certified; systems aligned to European standards.' }, ar: { t: 'آيزو 9001 وEN 1504', d: 'اعتماد نظام الجودة ومواءمة الأنظمة مع المعايير الأوروبية.' }, es: { t: 'ISO 9001 y EN 1504', d: 'Sistema de calidad certificado; sistemas alineados con normas europeas.' } },
  { year: '2024', en: { t: 'National Infrastructure', d: 'Systems specified on metro, water and bridge programmes.' }, ar: { t: 'بنية تحتية وطنية', d: 'اعتماد الأنظمة في مشاريع المترو والمياه والجسور.' }, es: { t: 'Infraestructura nacional', d: 'Sistemas especificados en programas de metro, agua y puentes.' } },
  { year: '2026', en: { t: 'GCC Expansion', d: 'Scaling distribution and technical support across the Gulf.' }, ar: { t: 'التوسّع الخليجي', d: 'توسيع التوزيع والدعم الفني في الخليج.' }, es: { t: 'Expansión en el Golfo', d: 'Ampliando distribución y soporte técnico en todo el Golfo.' } },
];

const CONTACT_DETAILS = [
  { icon: 'phone', label: { en: 'Phone', ar: 'هاتف' }, value: '+966 59 312 0221', href: 'tel:+966593120221', mono: true },
  { icon: 'mail', label: { en: 'Email', ar: 'البريد' }, value: 'info@bcisaudi.com', href: 'mailto:info@bcisaudi.com', mono: true },
  { icon: 'whatsapp', label: { en: 'WhatsApp', ar: 'واتساب' }, value: { en: 'Click to chat', ar: 'اضغط للمحادثة' }, href: 'https://wa.me/966593120221' },
  { icon: 'map-pin', label: { en: 'Address', ar: 'العنوان' }, value: { en: '3rd Industrial City, Dammam 34223, KSA', ar: 'المدينة الصناعية الثالثة، الدمام 34223' }, href: '#map' },
];

/* BCI store / branch network — coordinates are real (lon, lat).
   side = which way the map label points so leaders don't collide. */
const STORES = [
  { key: 'dammam', lon: 50.10, lat: 26.43, hq: true, side: 'right',
    en: { city: 'Dammam', region: 'Eastern Province', role: 'Head Office · Plant · Store' },
    ar: { city: 'الدمام', region: 'المنطقة الشرقية', role: 'المقر · المصنع · المعرض' },
    map: 'https://maps.app.goo.gl/8bW3DdJSLY2A4PKFA' },
  { key: 'riyadh', lon: 46.68, lat: 24.71, side: 'right',
    en: { city: 'Riyadh', region: 'Riyadh Province', role: 'Sales Office · Store' },
    ar: { city: 'الرياض', region: 'منطقة الرياض', role: 'مكتب مبيعات · معرض' } },
  { key: 'jeddah', lon: 39.19, lat: 21.49, side: 'left',
    en: { city: 'Jeddah', region: 'Makkah Province', role: 'Sales Office · Store' },
    ar: { city: 'جدة', region: 'منطقة مكة', role: 'مكتب مبيعات · معرض' } },
  { key: 'jizan', lon: 42.55, lat: 16.89, side: 'left',
    en: { city: 'Jizan', region: 'Jazan Province', role: 'Branch Store' },
    ar: { city: 'جازان', region: 'منطقة جازان', role: 'فرع · معرض' } },
  { key: 'tabuk', lon: 36.57, lat: 28.38, side: 'left',
    en: { city: 'Tabuk', region: 'Tabuk Province', role: 'Branch Store' },
    ar: { city: 'تبوك', region: 'منطقة تبوك', role: 'فرع · معرض' } },
];

/* Saudi Arabia border ring — (lon, lat), clockwise from the NW (Gulf of Aqaba). */
const KSA_BORDER = [
  [34.95,29.35],[36.00,29.20],[36.70,29.80],[37.50,30.80],[38.00,31.40],[38.80,32.10],
  [39.15,32.10],[40.40,31.90],[42.00,31.10],[43.50,30.20],[44.70,29.30],
  [46.30,29.10],[47.10,28.99],[47.70,29.30],[48.10,29.30],[48.40,28.55],
  [48.80,28.00],[49.30,27.50],[49.60,27.00],[50.00,26.65],[50.20,26.30],
  [50.60,25.70],[50.80,25.00],[51.05,24.60],[51.35,24.30],[51.60,24.10],
  [52.50,23.50],[54.50,22.65],[55.20,22.70],[55.65,22.00],[55.20,20.00],
  [52.00,18.80],[49.00,18.60],[47.00,17.20],[46.00,17.30],[45.00,17.40],
  [43.20,17.40],[42.90,16.90],[42.55,16.80],[42.20,17.50],[41.20,18.60],
  [40.50,19.80],[39.80,20.80],[39.15,21.50],[38.50,22.50],[37.80,24.00],
  [37.20,25.40],[36.50,26.50],[35.80,27.50],[35.20,28.30],[34.95,29.20],
];

const DEPARTMENTS = [
  { en: { t: 'Sales & Specification', d: 'sales@bcisaudi.com' }, ar: { t: 'المبيعات والمواصفات', d: 'sales@bcisaudi.com' }, icon: 'briefcase' },
  { en: { t: 'Technical Support', d: 'technical@bcisaudi.com' }, ar: { t: 'الدعم الفني', d: 'technical@bcisaudi.com' }, icon: 'flask' },
  { en: { t: 'Careers / HR', d: 'careers@bcisaudi.com' }, ar: { t: 'التوظيف', d: 'careers@bcisaudi.com' }, icon: 'users' },
  { en: { t: 'Procurement', d: 'procurement@bcisaudi.com' }, ar: { t: 'المشتريات', d: 'procurement@bcisaudi.com' }, icon: 'package' },
];

const SOCIALS = [
  { name: 'linkedin', href: 'https://www.linkedin.com/company/92827330' },
  { name: 'youtube', href: 'https://www.youtube.com/@bci_saudi' },
  { name: 'instagram', href: 'https://www.instagram.com/bci.saudi/' },
  { name: 'facebook', href: 'https://www.facebook.com/profile.php?id=61579288423656' },
];

/* Top navigation (multi-page) */
const NAV = [
  { en: 'Home', ar: 'الرئيسية', es: 'Inicio', href: 'index.html' },
  { en: 'About', ar: 'عن BCI', es: 'Nosotros', href: 'About.html' },
  { en: 'Solutions', ar: 'الحلول', es: 'Soluciones', href: 'Solutions.html', mega: true },
  { en: 'Projects', ar: 'المشاريع', es: 'Proyectos', href: 'Projects.html' },
  { en: 'Resources', ar: 'الموارد', es: 'Recursos', href: 'Resources.html' },
  { en: 'Career', ar: 'الوظائف', es: 'Empleo', href: 'Career.html' },
  { en: 'Contact', ar: 'تواصل', es: 'Contacto', href: 'Contact.html' },
];

Object.assign(window, {
  SOLUTIONS, PROJECTS, PROJECT_SECTORS, RESOURCE_TYPES, RESOURCES,
  JOBS, BENEFITS, VALUES, STATS, TIMELINE, CONTACT_DETAILS, DEPARTMENTS, SOCIALS, NAV,
  STORES, KSA_BORDER,
});
