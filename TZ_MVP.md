# TibSphereAI — Texnik Vazifa (MVP)

**Hujjat turi:** Mahsulot va texnik vazifa (investorlar uchun) · **Sana:** 2026-10-25 · **Holat:** Qoralama

> **Belgilar:**
> - `[Yangi]` — Platformaga noldan qo'shilayotgan yangi funksiya va imkoniyatlar.
> - `[O'zgaradi]` — Mavjud tizimda yangilanayotgan, tubdan takomillashtirilayotgan yoki yangi modelga o'tkazilayotgan funksiyalar.
> - `[O'zgarmaydi]` — Mavjud holatda to'g'ridan-to'g'ri saqlanib qoladigan parametrlar.
> - `[Keyinga qoldiriladi]` — Keyingi bosqichlarda qayta ko'rib chiqiladigan, hozircha nofaol turadigan funksiyalar.
> - `[Kerak emas]` — Yangi arxitektura sababli butunlay olib tashlanadigan elementlar.

### Foydalanuvchi funksiyalari

| Funksiya | Holat | Qisqacha tushuntirish |
|---|---|---|
| **Keys yechish** | `[O'zgaradi]` | AI bemor holatini yaratadi (shikoyat, anamnez, ko'rik, analizlar). Foydalanuvchi tashxis va davolash rejasini o'z so'zlari bilan yozadi. AI javobni baholaydi (0–100 ball), nima to'g'ri/noto'g'ri ekanini tushuntiradi va foydalangan manbalarni ko'rsatadi. *(Admin tomonidan qo'lda yaratilgan statik keyslar o'rniga real-time AI generatsiya va baholash)* |
| **Test yechish** | `[Yangi]` | AI tanlangan mavzu va qiyinlikda 4 variantli savollar beradi. Javobdan so'ng darhol to'g'ri javob, izoh va manbalar ko'rinadi. Savollar har safar yangi, takrorlanmaydi. |
| **AI tahlili asosida fleshkartalar** | `[Yangi]` | Har test va keysdan keyin AI foydalanuvchining xatolari va bilimidagi bo'shliqlarni tahlil qiladi va shu asosida **yangi fleshkartalarni doimiy yaratib boradi**. Sessiya yakunida (natijalar oynasida XP, sarflangan tanga/token bilan birga) **nechta yangi fleshkarta yaratilgani** ko'rsatiladi. Kartalar 2 tomonlama (savol/javob, flip mexanizmi) bo'lib, intervalli takrorlash (Spaced Repetition) algoritmi bilan ishlaydi; bugungi takrorlashlar asosiy sahifada turadi. |
| **AI yo'l xaritasi** | `[Yangi]` | AI foydalanuvchining barcha natijalaridan bilim xaritasini tuzadi (qaysi mavzu kuchli, qaysi zaif) va shaxsiy **o'qish yo'lini** taklif qiladi: nimani keyin o'rganish, qaysi mavzuda test/keys/fleshkarta qilish. |
| **Erkin mavzu** | `[Yangi]` | Tayyor bo'lim va mavzudan tashqari, foydalanuvchi istalgan tibbiy mavzuni yozib mashq boshlashi mumkin. |

#### Fleshkartalar qanday ishlaydi (Batafsil):

1. **Tuzilishi: 2 tomonlama (Oldi va Orqasi)**  
   Fleshkarta ikkita yuzadan iborat bo'ladi va **Flip (aylanish)** effekti bilan ishlaydi:
   - **Old tomoni (Savol / Holat / Belgilar):**  
     Foydalanuvchi birinchi bo'lib kartaning old tomonini ko'radi.  
     *Misol:*  
     *Savol:* «Appenditsit shubhasi bo'lganda Rovsing (Roysing) simptomi qanday tekshiriladi va nima bilan ifodalanadi?» *(yoki dori nomi, EKG belgisi, kasallik triadasi, laborator norma)*  
     Foydalanuvchi javobni eslashga harakat qiladi (*Active Recall*).
   - **Orqa tomoni (To'g'ri javob / Lo'nda tushuntirish):**  
     Foydalanuvchi kartani ustiga bosganida (*tap/click*), karta 3D animatsiya bilan orqa tarafiga aylanadi (*flip* bo'ladi).  
     *Misol:*  
     *Javob:* Chap yonbosh sohasiga bosim o'tkazilganda gazlar yo'g'on ichak bo'ylab siljib, o'ng yonbosh (ko'richak) sohasida og'riq paydo bo'lishi.  
     *Qo'shimcha:* Manba: Sh. Karimov «Xirurgik kasalliklar», 45-bet.

2. **Karta ochilgandan so'ng: O'z-o'zini baholash (Intervalli takrorlash — Spaced Repetition)**  
   Orqa tomoni ko'ringandan so'ng, kartaning pastida 3 yoki 4 ta baholash tugmasi chiqadi:
   - 🔴 **Qayta ko'rish (Eslay olmadim)** — AI bu kartani bugunoq (masalan, 10 daqiqadan so'ng) qayta ko'rsatadi.
   - 🟡 **Qiyin (Zo'rg'a esladim)** — 1 kundan keyin yana takrorlashga chiqaradi.
   - 🟢 **Yaxshi (Esladim)** — 3 kundan keyin chiqaradi.
   - 🔵 **Oson (Juda yaxshi bilaman)** — 7–14 kundan keyin chiqaradi.  
   Foydalanuvchi javob bergan sari intervallar oshib boradi (1 kun → 3 kun → 7 kun → 21 kun). Natijada miya ma'lumotni hech qachon unutmaydi.

3. **Monetizatsiya modeli:**
   - **AI generatsiyasi (xatolar asosida):** Keys yoki test sessiyasining umumiy narxiga (AI token sarfiga) qo'shiladi va sessiya hisobidan tanga yechiladi.
   - **Kunlik takrorlash (Review):** 100% BEPUL — foydalanuvchining kunlik odatini (retention / streak) shakllantirish va o'qishini to'xtatib qo'ymaslik uchun mavjud kartalarni ochish va takrorlashga tanga yechilmaydi.
   - **Mavzuli yangi to'plam (Deck) generatsiyasi:** Foydalanuvchi istalgan mavzu yoki darslik bo'yicha mustaqil fleshkarta to'plami buyurtma qilganda AI token sarfi hisobidan tanga yechiladi.

### Boshqaruv paneli (admin)

- **Manbalar yuklanadi** `[O'zgaradi]`: kitob, maqola (PDF, EPUB, DOCX, TXT), veb-sayt havolasi yoki matn; tizim ularni avtomatik qayta ishlaydi (RAG, embedding) va bo'lim/mavzularga bog'lanadi. AI faqat shu manbalarga tayanadi.
- **Bo'lim va mavzular** `[O'zgaradi]`: boshqariladi, mavzuga AI uchun yo'nalish (`ai_hint`) ko'rsatiladi.
- **Statistika va monitoring** `[O'zgaradi]`: foydalanuvchilar, sessiyalar, to'g'ri javoblar ulushi, real-time AI xarajati (tokenlar), foydalanuvchi shikoyatlari hamda **fleshkartalar monitoringi** (jami generatsiya qilingan kartalar soni, kunlik faol takrorlashlar, talabalar eng ko'p xato qilayotgan mavzular va bilimlarni o'zlashtirish/eslab qolish foizi).
- **Moliya** `[O'zgaradi]`: tariflar, buyurtmalar, promokodlar, hamkorlar, token asosidagi tanga monitoringi.
- **Tizim sozlamalari (Settings)** `[O'zgaradi]`:
  - **Faol sozlamalar:**
    - `coins_per_1k_tokens` `[O'zgarmaydi]`: AI Token-to-Coin tarifi — 1 000 token uchun sarflanadigan tanga miqdori (`/web/setting/coin-rate`).
    - `daily_free_limit` ➔ `daily_free_coins` `[O'zgaradi]`: Eski qat'iy sondagi bepul keys limiti o'rniga har 24 soatda har bir foydalanuvchi hisobiga beriladigan bepul tangalar miqdoriga aylanadi (masalan: 10 ta tanga).
    - `medium_reward_multiplier` & `hard_reward_multiplier` `[O'zgarmaydi]`: O'rta va Qiyin darajadagi keys/testlar uchun XP va rag'bat koeffitsientlari (1.5x va 2.0x; `/web/setting/difficulty-reward`).
    - `referral_reward_referrer_coins` & `referral_reward_referred_coins` `[O'zgarmaydi]`: Do'stlarni taklif qilish tizimida taklif qilgan (50) va taklif qilingan (20) foydalanuvchiga beriladigan rag'bat tangalari.
  - **Hozircha ishlatilmaydigan / Keyinga qoldiriladigan sozlamalar:**
    - `voice_enabled` `[Keyinga qoldiriladi]`: Shunchaki matnni o'qib berish (TTS) emas, to'liq ovozli interaktiv chat zarurligi sababli hozircha ishlatilmay turadi, keyingi bosqichlarda qayta ko'rib chiqiladi.
  - **Bekor qilinadigan / Kerak emas sozlamalar:**
    - `coin_to_uzs_rate` `[Kerak emas]`: 1 tanga = X so'm stavkasi — tanga xaridi uchun paketli tariflar va obuna tariflari mavjud bo'lgani sababli butunlay olib tashlanadi.
- **Kontent va xavfsizlik** `[O'zgaradi]`: bannerlar, bildirishnomalar, CMS, adminlar va ruxsatlar (Casbin RBAC), AI sozlamalari.

### Rag'bat va to'lov

| Funksiya | Holat | Qisqacha tushuntirish |
|---|---|---|
| **XP** | `[O'zgarmaydi]` | Mashq uchun beriladigan tajriba ballari. XP to'plangan sari foydalanuvchi **darajasi** o'sadi; qiyinroq va to'g'riroq javob ko'proq XP beradi. Kunlik faollik **streak** bilan rag'batlantiriladi. |
| **Tanga (coin)** | `[O'zgarmaydi]` | Platforma ichidagi valyuta. AI mashqlari uchun sarflanadi: AI qancha hisoblash resursi (token) ishlatsa, shuncha tanga yechiladi. Tanga mashqlar va daraja uchun mukofot sifatida ham beriladi. |
| **Kunlik bepul tangalar (Freemium)** | `[Yangi]` | Bepul foydalanish cheklovi qat'iy sonda (masalan, 3 ta keys/kun) emas, aynan **tangalarda** beriladi. Masalan, har 24 soatda har bir foydalanuvchiga 10 ta bepul tanga ajratiladi. Foydalanuvchi o'z tangalarini xohlagan mashg'ulotiga (keys, test yoki fleshkarta) o'zi taqsimlaydi. Kunlik bepul tangalar tugagach, foydalanuvchi qo'shimcha tanga sotib olishi mumkin. |
| **To'lov tizimi (Pay-as-you-go)** | `[Yangi]` | Asosiy model majburiy oylik obuna emas, aynan **Pay-as-you-go** (ishlatganiga qarab to'lash). Foydalanuvchi tangalar paketini sotib oladi, balansida aniq ko'rinadi va AI token sarfiga qarab tangalar hisobdan yechiladi (ishlatilmagan vaqtda mablag'i kuymaydi). Obuna esa cheksiz rejimni xohlovchilar uchun qo'shimcha qulaylik sifatida saqlangan. |

### Autentifikatsiya (Auth)

> *Eslatma: Autentifikatsiyaga oid quyidagi talablar backend ishlab chiquvchisi bilan qo'shimcha maslahatlashiladi.*

- **Asosiy vosita — Email** `[O'zgaradi]`: Birinchi o'rinda email turadi (xavfsizlik masalasi sababli, chunki telefon raqamlar tez-tez almashib turishi mumkin).
- **Telegram bot orqali kirish** `[Yangi]`: Bot orqali OTP kodsiz to'g'ridan-to'g'ri autentifikatsiya qilinadi.
- **Emailni ulash va kirish** `[Yangi]`: Profilga email ulab qo'yiladi va foydalanuvchi ikkalasidan ham (Telegram bot yoki Email orqali) tizimga kira oladi.
- **Telefon raqam** `[O'zgaradi]`: Foydalanuvchi raqamni uzib qo'yishi yoki almashtirishi mumkin. 

### Userlarning fikrini olish `[Yangi]`
### Marketing: telegram ads, instagram target, facebook target `[Yangi]`
### Partners: B2B university, training centers, and etc. `[Yangi]`

### Xavfsizlik: otp, captcha, rate limiting, prompt injection himoyasi `[O'zgaradi]`
