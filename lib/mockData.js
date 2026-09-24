export const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: { uz: "Kardiologiya", ru: "Кардиология", en: "Cardiology" },
    icon_url: "heartPulse",
    audience: "all",
    order_num: 1,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-03-01T12:00:00Z"
  },
  {
    id: "cat-2",
    name: { uz: "Nevrologiya", ru: "Неврология", en: "Neurology" },
    icon_url: "brain",
    audience: "all",
    order_num: 2,
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-03-02T12:00:00Z"
  },
  {
    id: "cat-3",
    name: { uz: "Pulmonologiya va Terapiya", ru: "Пульмонология и Терапия", en: "Pulmonology & Therapy" },
    icon_url: "activity",
    audience: "all",
    order_num: 3,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-03-05T12:00:00Z"
  },
  {
    id: "cat-4",
    name: { uz: "Shoshilinch tibbiyot & Reanimatsiya", ru: "Неотложная помощь", en: "Emergency Medicine" },
    icon_url: "stethoscope",
    audience: "doctor",
    order_num: 4,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-03-10T12:00:00Z"
  },
  {
    id: "cat-5",
    name: { uz: "Umumiy Xirurgiya", ru: "Общая хирургия", en: "General Surgery" },
    icon_url: "shield",
    audience: "student",
    order_num: 5,
    created_at: "2026-01-22T10:00:00Z",
    updated_at: "2026-03-12T12:00:00Z"
  }
];

export const INITIAL_TOPICS = [
  {
    id: "top-1",
    category_id: "cat-1",
    name: { uz: "O'tkir koronar sindrom (OKS / Infarkt)", ru: "Острый коронарный синдром", en: "Acute Coronary Syndrome" },
    order_num: 1,
    created_at: "2026-01-10T10:00:00Z"
  },
  {
    id: "top-2",
    category_id: "cat-1",
    name: { uz: "Gipertonik kriz va arterial gipertenziya", ru: "Гипертонический криз", en: "Hypertensive Crisis" },
    order_num: 2,
    created_at: "2026-01-11T10:00:00Z"
  },
  {
    id: "top-3",
    category_id: "cat-2",
    name: { uz: "O'tkir bosh miya qon aylanishining buzilishi (Insult)", ru: "ОНМК / Инсульт", en: "Acute Stroke" },
    order_num: 1,
    created_at: "2026-01-12T10:00:00Z"
  },
  {
    id: "top-4",
    category_id: "cat-3",
    name: { uz: "Bronxial astma va respirator distress", ru: "Бронхиальная астма", en: "Bronchial Asthma Attack" },
    order_num: 1,
    created_at: "2026-01-15T10:00:00Z"
  },
  {
    id: "top-5",
    category_id: "cat-5",
    name: { uz: "O'tkir qorin sindromi (Appenditsit)", ru: "Острый живот (Аппендицит)", en: "Acute Abdomen" },
    order_num: 1,
    created_at: "2026-01-22T10:00:00Z"
  }
];

export const INITIAL_CASES = [
  {
    id: "case-stemi-01",
    category_id: "cat-1",
    category_name: { uz: "Kardiologiya", ru: "Кардиология", en: "Cardiology" },
    topic_id: "top-1",
    topic_name: { uz: "O'tkir koronar sindrom (OKS / Infarkt)", ru: "Острый коронарный синдром", en: "Acute Coronary Syndrome" },
    title: {
      uz: "O'tkir ST-elevatsiyali Miokard Infarkti (STEMI)",
      ru: "Острый инфаркт миокарда с подъемом ST (STEMI)",
      en: "Acute ST-Elevation Myocardial Infarction (STEMI)"
    },
    subtitle: {
      uz: "58 yoshli erkakda to'sh ortidagi o'tkir bosuvchi og'riq va sovuq ter",
      ru: "Давящая боль за грудиной и холодный пот у мужчины 58 лет",
      en: "Crushing retrosternal chest pain and cold sweat in 58yo male"
    },
    chief_complaint: {
      uz: "To'sh suyagi orqasida chidab bo'lmas og'riq, chap yelkaga va jag'ga irradiatsiya, nafas qisishi va o'limdan qo'rquv hissi.",
      ru: "Невыносимая загрудинная боль с иррадиацией в левое плечо и челюсть, одышка, чувство страха смерти.",
      en: "Severe crushing retrosternal pain radiating to left arm and jaw, dyspnea and diaphoresis."
    },
    difficulty: "medium",
    status: "published",
    patient_age: 58,
    patient_gender: "male",
    visual_state: "sweating_pale",
    expected_duration_minutes: 15,
    order_num: 1,
    is_ai_generated: false,
    cover_image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    initial_vitals: {
      blood_pressure: "155/95 mmHg",
      heart_rate: 98,
      temperature: 36.8,
      spo2: 93,
      respiratory_rate: 22
    },
    scenario: {
      patient_history: "Bemor oxirgi 5 yildan beri arterial gipertenziya bilan og'riydi. 25 yil davomida kuniga 1 quti tamaki chekadi. Bugun ertalab jismoniy zo'riqishdan keyin to'satdan og'riq boshlangan, nitroglitserin qabul qilganda yengillashmagan.",
      physical_exam: "Holati og'ir. Teri qoplamlari oqargan, sovuq yopishqoq ter bilan qoplangan. O'pka ustida vezikulyar nafas, pastki bo'limlarda xirillashlar yo'q. Yurak tonlari bo'g'iq, ritmik.",
      lab_tests: {
        troponin_i: "4.8 ng/ml (Norma < 0.04)",
        ck_mb: "48 U/L (Norma < 24)",
        leukocytes: "11.2 x 10^9/l",
        glucose: "7.2 mmol/l"
      },
      ecg_findings: "II, III, aVF tarmoqlarda ST segmenti elevatsiyasi (3-4 mm), I va aVL da retsiprok depressiya. Q-to'lqin shakllanishi. Xulosa: Pastki devor o'tkir transmural miokard infarkti.",
      differential_diagnoses: [
        "Aorta qatlamlanishi (Aortic dissection)",
        "O'pka arteriyasi tromboemboliyasi (OATE)",
        "O'tkir perikardit",
        "Oshqozon yarasi perforatsiyasi"
      ],
      treatment_steps: [
        "Kislorodoterapiya (SpO2 < 94% bo'lsa)",
        "Aspirin 300 mg (chaynash uchun) + Klopidogrel 300-600 mg (yoki Tikagrelor 180 mg)",
        "Og'riqsizlantirish: Morfin 4-8 mg v/i sekin",
        "Geparin bolus 5000 XB v/i",
        "Shoshilinch Koronar Angiografiya va Perkutan Koronar Aralashuv (ChKB/Stentlash) 90 daqiqa ichida"
      ]
    },
    expected_answer: "Pastki devor ST-elevatsiyali miokard infarkti (STEMI). Shoshilinch ikki karra antitrombotsitar terapiya, antikoagulyatsiya va shoshilinch teri orqali koronar aralashuv (PKI/PCI) ko'rsatilgan.",
    created_at: "2026-02-01T10:30:00Z",
    updated_at: "2026-03-20T14:15:00Z"
  },
  {
    id: "case-stroke-02",
    category_id: "cat-2",
    category_name: { uz: "Nevrologiya", ru: "Неврология", en: "Neurology" },
    topic_id: "top-3",
    topic_name: { uz: "O'tkir bosh miya qon aylanishining buzilishi (Insult)", ru: "ОНМК / Инсульт", en: "Acute Stroke" },
    title: {
      uz: "O'tkir Ishemik Insult (FAST ijobiy)",
      ru: "Острый ишемический инсульт (терапевтическое окно)",
      en: "Acute Ischemic Stroke (Therapeutic Window)"
    },
    subtitle: {
      uz: "64 yoshli ayolda to'satdan yuz asimmetriyasi, o'ng qo'l va oyoqda holsizlik",
      ru: "Внезапная асимметрия лица и правосторонний гемипарез у женщины 64 лет",
      en: "Sudden facial droop and right-sided weakness in 64yo female"
    },
    chief_complaint: {
      uz: "Nutqning buzilishi (afaziya), o'ng qo'l va oyoqni qimirlata olmaslik, og'iz burchagining pastga osilib qolishi.",
      ru: "Нарушение речи, слабость в правых конечностях, асимметрия лица.",
      en: "Expressive aphasia, right-sided hemiparesis, right facial weakness."
    },
    difficulty: "hard",
    status: "published",
    patient_age: 64,
    patient_gender: "female",
    visual_state: "facial_droop",
    expected_duration_minutes: 12,
    order_num: 2,
    is_ai_generated: true,
    cover_image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=60",
    initial_vitals: {
      blood_pressure: "175/100 mmHg",
      heart_rate: 84,
      temperature: 36.6,
      spo2: 97,
      respiratory_rate: 16
    },
    scenario: {
      patient_history: "Kasallik 1.5 soat oldin to'satdan nonushta vaqtida boshlangan. Xilpirlovchi aritmiya (FA) va qandli diabet bilan hisobda turadi, antikoagulyantlarni tartibsiz qabul qilgan.",
      physical_exam: "FAST testi musbat. Motor afaziya, o'ng tomonlama markaziy yuz nervi parezi, o'ng qo'l kuchi 1/5 ball, oyoq kuchi 2/5 ball. Babinskiy refleksi o'ngda musbat.",
      lab_tests: {
        glucose: "6.8 mmol/l",
        inr: "1.1",
        platelets: "210 x 10^9/l"
      },
      ecg_findings: "Normosistolik shakldagi xilpirlovchi aritmiya.",
      ct_mri_findings: "Shoshilinch Bosh miya MSKTsi: Gemorragiya belgilari yo'q. Chap o'rta miya arteriyasi havzasida erta ishemiya belgilari (ASPECTS 9). Terapevtik oyna (4.5 soat) ichida!",
      treatment_steps: [
        "Vena ichiga tizimli trombolitik terapiya (Alteplaza / rt-PA 0.9 mg/kg) shoshilinch",
        "Qon bosimini nazorat qilish (185/110 mmHg dan oshmaslik)",
        "Glukozani korreksiya qilish",
        "Endovaskulyar trombektomiya imkoniyatini baholash"
      ]
    },
    expected_answer: "Chap o'rta miya arteriyasi havzasidagi o'tkir ishemik insult. Terapevtik darcha (4.5 soat) mavjudligi sababli zudlik bilan tizimli tromboliz (rt-PA) yoki mexanik trombektomiya ko'rsatilgan.",
    created_at: "2026-02-14T09:00:00Z",
    updated_at: "2026-03-22T11:00:00Z"
  },
  {
    id: "case-asthma-03",
    category_id: "cat-3",
    category_name: { uz: "Pulmonologiya va Terapiya", ru: "Пульмонология и Терапия", en: "Pulmonology & Therapy" },
    topic_id: "top-4",
    topic_name: { uz: "Bronxial astma va respirator distress", ru: "Бронхиальная астма", en: "Bronchial Asthma Attack" },
    title: {
      uz: "Og'ir darajadagi Bronxial Astma xuruji",
      ru: "Тяжелый приступ бронхиальной астмы",
      en: "Severe Acute Asthma Exacerbation"
    },
    subtitle: {
      uz: "24 yoshli talabada masofadan eshitiladigan hushtaksimon nafas va majburiy holat",
      ru: "Свистящее дыхание и вынужденное положение у девушки 24 лет",
      en: "Audible wheezing and orthopneic posture in 24yo student"
    },
    chief_complaint: {
      uz: "Havo yetishmasligi, ekspirator xarakterdagi kuchli hansirash, quruq yo'tal va ko'krak qafasida qisilish hissi.",
      ru: "Удушье, экспираторная одышка, сухой кашель, чувство заложенности в груди.",
      en: "Severe breathlessness, inability to complete sentences, tight chest."
    },
    difficulty: "easy",
    status: "published",
    patient_age: 24,
    patient_gender: "female",
    visual_state: "dyspnea_tripod",
    expected_duration_minutes: 10,
    order_num: 3,
    is_ai_generated: false,
    cover_image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60",
    initial_vitals: {
      blood_pressure: "130/85 mmHg",
      heart_rate: 118,
      temperature: 36.7,
      spo2: 89,
      respiratory_rate: 28
    },
    scenario: {
      patient_history: "Bolalikdan atopik bronxial astma bilan og'riydi. 2 kun oldin O'RVI o'tkazgan, bugun allergen (mushuk juni) bilan kontakt bo'lgan. Salbutamol ingalyatori samarasiz bo'lgan.",
      physical_exam: "Majburiy o'tirgan holatda (ortopnoe), qo'shimcha nafas mushaklari ishtirok etmoqda. Auskultatsiyada ikkala o'pka bo'ylab juda ko'p quruq hushtaksimon xirillashlar, ekspiratsiya keskin cho'zilgan.",
      peak_flow: "PEF 180 L/min (kutilganidan 40%)",
      treatment_steps: [
        "Yuqori oqimli namlangan kislorod (SpO2 93-95% maqsadida)",
        "Nebulayzer orqali Salbutamol (2.5-5 mg) + Ipratropiy bromid (0.5 mg)",
        "Tizimli kortikosteroid: Prednizolon 60-90 mg v/i yoki Deksametazon 8-12 mg",
        "Samarasiz bo'lsa Magniy sulfat 2.0 g v/i 20 daqiqa davomida infuziya"
      ]
    },
    expected_answer: "Bronxial astma og'ir darajadagi xuruji (Astmatik status 1-bosqich). Zudlik bilan SABA+SAMA nebulayzer ingalyatsiyasi va vena ichiga glyukokortikosteroidlar berish kerak.",
    created_at: "2026-02-20T11:00:00Z",
    updated_at: "2026-03-18T16:00:00Z"
  }
];

export const INITIAL_AI_PROMPTS = [
  {
    id: "prompt-eval-01",
    name: "Klinik Fikrlash Baholovchi AI (Clinical Evaluator)",
    module: "simulation_evaluation",
    version: "2.4.0",
    model: "gemini-2.5-flash",
    description: "Foydalanuvchining (talaba/shifokor) klinik keysdagi qarorlarini, tashxisini va davolash rejasini tibbiy protokol bo'yicha baholaydi va XP beradi.",
    temperature: 0.2,
    prompt_text: `Siz TibSphere AI tibbiy ta'lim tizimining bosh ekspertisisiz. Sizning vazifangiz shifokor/talabaning klinik keys bo'yicha bergan javobini, tashxis to'g'riligini va davolash protokolini O'zbekiston SSV va xalqaro (AHA/ESC/WHO) standartlariga mosligini qat'iy baholashdir.
Javob quyidagi JSON formatda bo'lishi shart:
{
  "score": 0-100,
  "diagnosis_accuracy": "correct|partially_correct|incorrect",
  "treatment_safety": "safe|unsafe_contraindicated|optimal",
  "xp_earned": 50-250,
  "feedback_uz": "Klinik tahlil va xatolar izohi...",
  "key_learning_points": ["1-asosiy xulosa", "2-asosiy xulosa"]
}`
  },
  {
    id: "prompt-patient-02",
    name: "Bemor Personasi Simulyatori (Virtual Patient Dialogue)",
    module: "patient_dialogue",
    version: "1.8.0",
    model: "gemini-2.5-flash",
    description: "Klinik intervyu va anamnez yig'ish vaqtida bemor nomidan real vaqt rejimida shifokor bilan suhbatlashadi.",
    temperature: 0.7,
    prompt_text: `Siz klinik keysdagi bemor personajisiz. Shifokor savollariga o'zingizning yoshingiz, hissiy holatingiz va berilgan tibbiy stsenariydan chiqmagan holda oddiy xalq tilida javob bering. Tibbiy atamalarni qo'llamang. Og'riq va qo'rquvni his qilayotganingizni namoyon eting.`
  },
  {
    id: "prompt-gen-03",
    name: "AI Keys Generatori (Auto Case Generator)",
    module: "case_generator",
    version: "3.1.0",
    model: "gemini-2.5-pro",
    description: "Mavzu, qiyinlik darajasi va asosiy shikoyat kiritilganda to'liq klinik keys stsenariysi, EKG, laboratoriya va davo protokolini avtomatik yaratadi.",
    temperature: 0.4,
    prompt_text: `Berilgan mavzu va shikoyat bo'yicha xalqaro tibbiy amaliyotga mos to'liq klinik keys generatsiya qiling. Keysda bemor profili, hayotiy ko'rsatkichlar (vitals), laboratoriya va instrumental tahlillar, differentsial tashxis va standart davolash bosqichlari bo'lsin.`
  }
];

export const INITIAL_LEVELS = [
  { level: 1, name: "Tibbiyot Talabasi (1-kurs)", min_xp: 0, max_xp: 500, icon: "award", badge_color: "slate" },
  { level: 2, name: "Klinik Ordinator", min_xp: 501, max_xp: 1500, icon: "award", badge_color: "cyan" },
  { level: 3, name: "Kichik Shifokor", min_xp: 1501, max_xp: 3500, icon: "award", badge_color: "emerald" },
  { level: 4, name: "Katta Mutaxassis Shifokor", min_xp: 3501, max_xp: 7500, icon: "award", badge_color: "purple" },
  { level: 5, name: "Bosh Shifokor / Professor", min_xp: 7501, max_xp: 99999, icon: "award", badge_color: "amber" }
];

export const INITIAL_TARIFFS = [
  {
    id: "tar-1",
    type: "subscription",
    name: { uz: "Oylik Pro Obuna", ru: "Месячная Pro подписка", en: "Monthly Pro Access" },
    price_uzs: 79000,
    duration_days: 30,
    daily_ai_limit: 100,
    features: ["Barcha klinik keyslar ochiq", "Cheksiz AI baholash", "EKG va Rentgen simulyatori", "Sertifikat generatsiyasi"],
    is_active: true
  },
  {
    id: "tar-2",
    type: "subscription",
    name: { uz: "Yillik Premium Shifokor", ru: "Годовой Premium Доктор", en: "Annual Doctor Plan" },
    price_uzs: 690000,
    duration_days: 365,
    daily_ai_limit: 500,
    features: ["Barcha bo'limlar cheksiz", "VIP AI tezkor tahlil", "Barcha sertifikatlar", "Yopiq shifokorlar klubi"],
    is_active: true
  },
  {
    id: "tar-coin-1",
    type: "coin_package",
    name: { uz: "100 TibCoins to'plami", ru: "Пакет 100 TibCoins", en: "100 Coins Pack" },
    price_uzs: 25000,
    coins_amount: 100,
    bonus_coins: 10,
    is_active: true
  },
  {
    id: "tar-coin-2",
    type: "coin_package",
    name: { uz: "500 TibCoins Mega to'plami", ru: "Пакet 500 TibCoins Mega", en: "500 Coins Mega Pack" },
    price_uzs: 99000,
    coins_amount: 500,
    bonus_coins: 100,
    is_active: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-9482",
    user_name: "Dr. Jasur Alimov",
    user_phone: "+998 90 123 45 67",
    item_name: "Oylik Pro Obuna",
    amount_uzs: 79000,
    payment_method: "Payme",
    status: "paid",
    created_at: "2026-03-24T06:12:00Z"
  },
  {
    id: "ORD-9481",
    user_name: "Madina Karimova (TTA talabasi)",
    user_phone: "+998 93 456 78 90",
    item_name: "500 TibCoins Mega to'plami",
    amount_uzs: 99000,
    payment_method: "Click",
    status: "paid",
    created_at: "2026-03-24T04:45:00Z"
  },
  {
    id: "ORD-9480",
    user_name: "Bekzod Rahimov",
    user_phone: "+998 97 888 11 22",
    item_name: "Yillik Premium Shifokor",
    amount_uzs: 690000,
    payment_method: "Uzum Bank",
    status: "pending",
    created_at: "2026-03-23T21:30:00Z"
  }
];

export const INITIAL_PROMOCODES = [
  {
    id: "pr-1",
    code: "TIB2026",
    discount_percent: 20,
    max_uses: 500,
    used_count: 142,
    valid_until: "2026-12-31",
    is_active: true
  },
  {
    id: "pr-2",
    code: "STUDENT50",
    discount_percent: 50,
    max_uses: 1000,
    used_count: 687,
    valid_until: "2026-06-30",
    is_active: true
  },
  {
    id: "pr-3",
    code: "MEDCAMPUS",
    discount_percent: 30,
    max_uses: 200,
    used_count: 89,
    valid_until: "2026-09-01",
    is_active: true
  }
];

export const INITIAL_PARTNERS = [
  {
    id: "part-1",
    name: "Toshkent Tibbiyot Akademiyasi (TTA)",
    contact_person: "Prof. Karimov O.",
    phone: "+998 71 214 55 00",
    revenue_share_percent: 15,
    referred_users: 1420,
    total_revenue_uzs: 48500000,
    status: "active"
  },
  {
    id: "part-2",
    name: "Samarqand Davlat Tibbiyot Universiteti (SamDTU)",
    contact_person: "Dotsent Vohidov A.",
    phone: "+998 66 233 11 22",
    revenue_share_percent: 15,
    referred_users: 980,
    total_revenue_uzs: 32100000,
    status: "active"
  }
];

export const INITIAL_ADMINS = [
  {
    id: "adm-1",
    login: "superadmin@tibsphere.uz",
    role: "Super Admin",
    partner_name: "TibSphere Markaziy",
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "adm-2",
    login: "editor.cardio@tibsphere.uz",
    role: "Klinik Muharrir (Doctor Lead)",
    partner_name: "Toshkent Kardiologiya Markazi",
    created_at: "2026-02-10T10:00:00Z"
  }
];

export const INITIAL_BANNERS = [
  {
    id: "ban-1",
    title: { uz: "Yangi EKG va STEMI keyslari chiqdi!", ru: "Новые кейсы по ЭКГ и инфаркту!", en: "New ECG & STEMI Cases Live!" },
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80",
    action_route: "app://case/case-stemi-01",
    is_active: true,
    order_num: 1
  },
  {
    id: "ban-2",
    title: { uz: "Talabalar uchun 50% chegirma promokodi: STUDENT50", ru: "Скидка 50% для студентов по коду STUDENT50", en: "50% Student Discount with code STUDENT50" },
    image_url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1000&auto=format&fit=crop&q=80",
    action_route: "app://tariffs",
    is_active: true,
    order_num: 2
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Klinik simulyatsiya musobaqasi boshlandi!",
    body: "Eng yuqori XP to'plagan 10 nafar talabaga bepul 1 yillik Pro obuna taqdim etiladi.",
    audience: "all",
    sent_at: "2026-03-23T10:00:00Z",
    sent_count: 4850
  }
];
