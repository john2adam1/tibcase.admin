# Backend o'zgarishlari (26 oktyabr 2026) — MVP: Pay-as-you-go, fleshkartalar, yo'l xaritasi, auth va xavfsizlik

Asos: `TZ_MVP.md` + `new-feature.md`. Migratsiyalar: `00024` … `00028`. Avvalgi qism (manbalar, AI case/test sessiyalari) —
[`CHANGES_FRONTEND_PRACTICE.md`](CHANGES_FRONTEND_PRACTICE.md); bu hujjat shundan **keyingi** o'zgarishlar.
Swagger (`/api/swagger/index.html`) yangilangan.

## 0. Tez ma'lumotnoma

| Modul | Endpointlar (mobile, Bearer) | Eslatma |
|---|---|---|
| Hamyon / limit | `GET /mobile/practice/wallet` | kunlik bepul tanga + balans |
| Practice (case/test) | `/mobile/practice/...` | endi **tanga yechadi**, erkin mavzu, AI tasvir |
| Fleshkartalar | `/mobile/flashcard/...` | kunlik takrorlash **bepul** |
| Yo'l xaritasi | `GET /mobile/roadmap`, `POST /mobile/roadmap/refresh` | xarita bepul, AI izohi tanga yechadi |
| Fikr | `POST /mobile/feedback` | |
| Auth | `POST /mobile/auth/telegram/start`, `/check` (public); `/mobile/user/phone/*`, `/mobile/user/email/*` | OTP'siz Telegram kirish, telefon/email ulash |

## 1. ⚠️ Buzuvchi o'zgarishlar (frontend ishiga ta'sir qiladi)

1. **`coins_used` buyurtmada olib tashlandi.** `POST` order'da `coins_used > 0` → `400 coin_payment_disabled`
   (`coin_to_uzs_rate` TZ bo'yicha o'chirildi). Tanga paketlari alohida tarif (`kind=coin_package`) sifatida sotib olinadi.
   `coins_used` yubormang (yoki 0).
2. **Ovozli funksiya o'chirildi:** `GET /mobile/setting/voice` endi default `enabled: false` (TZ: keyinga qoldirilgan).
   Ovoz tugmasi shu bayroqqa qarab yashirilishi kerak.
3. **Rate limiting (429).** Quyidagi §9. Frontend `429 too_many_requests` / `otp_locked` ni qayta urinish xabari bilan ko'rsatsin
   (`Retry-After` header — soniyalar).
4. **Practice AI endpointlari tanga yechadi** (§2): `400 insufficient_coins` qayta ishlansin ("Tanga sotib oling" ekrani).
5. **Practice session javobida yangi maydonlar** (qo'shimcha, eskilarini buzmaydi).
6. **CORS:** `Accept-Language` va `X-Captcha-Token` headerlariga ruxsat berildi.
7. **Bo'lim/mavzu:** `is_active=false` bo'limlar/mavzular mobil ro'yxatlardan va AI mashqdan chiqib ketadi.
8. **Eski admin case moduli** admin panelda "(arxiv)" deb belgilandi — ishlashda davom etadi, lekin yangi model AI real-time.

## 2. Pay-as-you-go: tanga, kunlik bepul tangalar

**Qoida.** Practice (case/test), fleshkarta to'plami buyurtmasi va yo'l xaritasi AI izohi — **AI sarflagan tokenga qarab tanga yechadi**:
`tanga = ceil(token/1000 × coins_per_1k_tokens)` (admin tarifi). Tartib: avval **bugungi bepul tangalar** (har 24 soatda yangidan,
Toshkent vaqti bilan, **to'planmaydi**), keyin sotib olingan balans. **Premium obunachilardan yechilmaydi.**
**Bepul:** fleshkartalarni kunlik takrorlash (`due`/`review`), qo'lda karta qo'shish, test javobini belgilash (AI chaqirilmaydi).

### `GET /mobile/practice/wallet`
```json
{ "has_subscription": false, "daily_free_coins": 10, "free_coins_left": 7, "coins": 120, "coins_per_1k_tokens": 1 }
```
Home ekrandagi "Limit/Tanga" belgisi uchun. `free_coins_left + coins` = sarflash mumkin bo'lgan jami.

### Xatti-harakat
- Sessiya boshlash (`POST /mobile/practice/sessions`): hamyon bo'sh (va obuna yo'q) bo'lsa `400 insufficient_coins`.
- `next` va case'ni baholash (`answer`) oldidan ham tekshiriladi; sessiya davomida hamyon tugasa shu xato qaytadi
  (test javobi AI chaqirmagani uchun baribir qabul qilinadi). Foydalanuvchini tanga/obuna sotib olishga yo'naltiring.
- Sessiya javoblarida (`PracticeSessionRes`): `tokens_used`, `coins_spent` — natijalar oynasida
  "sarflangan token/tanga" uchun. Tanga **kumulyativ** hisoblanadi (har chaqiruvda yaxlitlanmaydi).
- `coins_per_1k_tokens = 0` bo'lsa hech narsa yechilmaydi.

## 3. Practice yangiliklari

### 3.1 Erkin mavzu
`POST /mobile/practice/sessions` da `category_id` o'rniga `topic_text` (3..200 belgi):
```json
{ "mode": "case", "topic_text": "Qandli diabet 2-tur asoratlari", "difficulty": "medium" }
```
`topic_text` bilan `category_id`/`topic_ids` aralashmaydi (400). Mavzu tibbiyotga aloqador bo'lmasa AI rad etadi:
`400 topic_not_medical` (sessiya yopiladi — frontend foydalanuvchiga "tibbiy mavzu yozing" desin).
Manbalar bazasidan eng mos chunklar mavzu matni bo'yicha qidiriladi; mos manba bo'lmasa javob ostida "Manba topilmadi…" yozuvi chiqadi.

### 3.2 AI tibbiy tasvir (EKG, rentgen, KT, MRT, UZI…)
Admin yoqsa (`GET/PUT /web/setting/practice-images`, default **o'chiq**), **case** rejimida AI klinik jihatdan muhim bo'lsa
tasvir yaratadi. `PracticeItemRes` da:
```json
{ "image_url": "https://minio.../practice/....jpg", "image_type": "ecg", "image_note": "AI yaratgan illyustrativ tasvir (ta'lim maqsadida), haqiqiy bemor tasviri emas." }
```
Tasvirni shikoyat matni ostida ko'rsating, `image_note` ni **doim** yozib qo'ying. Maydonlar yo'q bo'lsa — rasmsiz case.
Tasvir javob berishdan oldin ham ko'rinadi (u case'ning bir qismi; to'g'ri javob matnda emas, tasvirdan o'qiladi).
Tasvir generatsiyasi `next` vaqtini 10–30 s uzaytirishi mumkin.

### 3.3 Sessiya yakunida fleshkartalar
Sessiya yopilganda (`finish` yoki test oxirgi savoli) xato/qisman javoblar bo'lsa, fonda AI **yangi fleshkartalar** yaratadi:
`PracticeSessionRes.flashcards_status`: `none` (xato yo'q) → `pending` → `done` | `failed`; `flashcards_created`: yaratilgan soni.
Natijalar oynasida XP/tanga bilan birga "**N ta yangi fleshkarta yaratildi**" ko'rsating: `status=pending` bo'lsa
`GET /mobile/practice/sessions/{id}` ni 2–3 s da bir poll qiling (odatda 5–20 s). Narxi sessiya tokenlariga qo'shiladi
(`tokens_used`/`coins_spent` poll paytida yangilanadi). Kartalar "Xatolarim" to'plamiga tushadi; bir xil old tomonli kartalar qo'shilmaydi.

### 3.4 XP va streak
- XP endi qiyinlik koeffitsientini hisobga oladi: `xp = round(Σball/100 × 5 × koeffitsient)` (`medium`=1.5x, `hard`=2x — admin "Mukofot sozlamalari").
- **Streak** (`users.streak_count`, profildagi `streak_count`) endi yangilanadi: practice'da javob berish, fleshkarta takrorlash yoki
  simulyatsiyani yakunlash — kuniga bir marta (Toshkent kuni). Ketma-ket kunlar +1, tanaffusdan keyin 1 dan.

## 4. Fleshkartalar (`/mobile/flashcard`)

2 tomonlama karta: **old** (`front`: savol/holat) → bosilganda flip → **orqa** (`back`: javob + `sources`). Baholash tugmalari:

| `rating` | Tugma | Keyingi ko'rsatish |
|---|---|---|
| `again` | 🔴 Qayta ko'rish (eslay olmadim) | ~10 daqiqadan keyin (bugunoq) |
| `hard` | 🟡 Qiyin | ~1 kun |
| `good` | 🟢 Yaxshi | 3 → 7 → 21 kun, keyin ×ease |
| `easy` | 🔵 Oson | 7 → 14 kun, keyin o'sadi |

Tugma yorliqlari uchun har kartada `next_intervals` keladi: `{"again":0,"hard":1,"good":3,"easy":7}` (kun; `again=0` ≈ 10 daqiqa).

| Metod | URL | Izoh |
|---|---|---|
| GET | `/mobile/flashcard/due?limit=20&deck_id=` | bugungi takrorlash (avval muddati o'tganlar, keyin yangilar) — `{cards[], due_total}` |
| POST | `/mobile/flashcard/cards/{id}/review` | `{ "rating": "good" }` → `{card, next_interval_days, due_at, streak_count}` — **bepul** |
| GET | `/mobile/flashcard/stats` | `total, due_now, due_today, new, learned, reviews_today, retention_30d, decks, streak_count, longest_streak` — asosiy sahifadagi "bugungi takrorlash" uchun |
| GET | `/mobile/flashcard/decks` | to'plamlar: `kind` = `mistakes` ("Xatolarim") / `topic` / `manual`, `card_count`, `due_count` |
| POST | `/mobile/flashcard/decks` | mavzu bo'yicha AI to'plam buyurtmasi (**tanga yechadi**), 5..30 karta |
| DELETE | `/mobile/flashcard/decks/{id}` | to'plam va kartalari |
| GET/POST | `/mobile/flashcard/cards` | ro'yxat (`deck_id`, `limit`, `page`) / qo'lda qo'shish `{front, back, deck_id?}` |
| PUT/DELETE | `/mobile/flashcard/cards/{id}` | tahrir `{front?, back?, status?: active\|suspended}` / o'chirish |

**Deck buyurtmasi:** `{ "category_id": "…", "topic_id": "…"?, "count": 10 }` yoki erkin `{ "topic_text": "Anafilaktik shok", "count": 10 }`
(`Accept-Language` tilida). Javob: `{deck, created, tokens_used, coins_spent}`. Xatolar: `400 insufficient_coins`, `400 topic_not_medical`,
`502 practice_generation_failed` (qayta urinish), `429` (5 ta/10 daqiqa).
**Karta takrorlanmaydi:** old tomoni foydalanuvchida allaqachon bor karta qo'shilmaydi (`created` kamroq bo'lishi mumkin;
qo'lda qo'shishda `409 conflict`). To'xtatilgan (`suspended`) karta takrorlashga chiqmaydi.

## 5. AI yo'l xaritasi (`/mobile/roadmap`)

`GET /mobile/roadmap` (`Accept-Language`), **bepul**, har so'rovda hisoblanadi:
```jsonc
{
  "map": [ { "category_id": "…", "category_name": {"uz": "…"}, "topic_id": "…", "topic_name": {"uz": "OKS"},
            "answered": 12, "accuracy": 0.58, "mastery": 64,           // 0..100 (so'nggi natijalar vaznliroq)
            "level": "medium",                                         // unexplored | learning | weak | medium | strong
            "last_practiced": "2026-10-25T…", "cards": 9, "cards_due": 2 } ],
  "path": [ { "order": 1, "action": "flashcard_review", "count": 7, "reason": "…" },
            { "order": 2, "action": "test", "category_id": "…", "topic_id": "…", "topic_name": "OKS", "difficulty": "easy", "count": 10, "reason": "…" },
            { "order": 3, "action": "deck", "topic_id": "…", "count": 10, "reason": "…" },
            { "order": 4, "action": "case", "topic_id": "…", "difficulty": "medium", "reason": "…" } ],
  "summary": "", "is_ai": false, "generated_at": null, "strong_count": 3, "weak_count": 2, "unexplored_count": 5
}
```
- **Bilim xaritasi:** `level` bo'yicha ranglang (strong/medium/weak/unexplored). `learning` — ma'lumot kam (< 3 javob).
- **O'qish yo'li:** har qadamdan to'g'ridan-to'g'ri mashq boshlang: `test`/`case` → `POST /mobile/practice/sessions`
  (`mode`, `category_id`, `topic_ids:[topic_id]`, `difficulty`, `count`); `deck` → `POST /mobile/flashcard/decks`;
  `flashcard_review` → takrorlash ekrani.
- **AI izohlari:** `POST /mobile/roadmap/refresh` — AI har qadamga shaxsiy izoh va umumiy `summary` yozadi (**tanga yechadi**,
  natija 24 soat keshlanadi, shundan keyin `GET` ham `is_ai: true` va AI matnlarini qaytaradi). Hech qanday natija bo'lmasa `400`
  ("avval keys/test yeching"), hamyon bo'sh bo'lsa `400 insufficient_coins`. Limit: 3 ta / 10 daqiqa.

## 6. Foydalanuvchi fikri

`POST /mobile/feedback`: `{ "rating": 1..5 (ixtiyoriy), "kind": "general|bug|idea|content|nps", "message": "…", "context": "practice_session:<id>", "app_version": "1.4.0" }`
— baho yoki xabardan kamida biri kerak. Limit 10 ta/soat. (Admin: `GET /web/feedback`, `PUT /web/feedback/{id}/status`.)

## 7. Auth

### 7.1 Telegram bot orqali OTP'siz kirish
1. `POST /mobile/auth/telegram/start` (public; captcha yoqilgan bo'lsa `X-Captcha-Token`) →
   `{ "token": "…", "bot_url": "https://t.me/<bot>?start=login_<token>", "expires_in": 300 }`.
2. Ilova `bot_url` ni ochadi (Telegram). Bot foydalanuvchining **o'z kontaktini** (bir marta) so'raydi — keyingi kirishlarda
   Telegram ID eslab qolingani uchun so'ramaydi — va tasdiqlaydi ("Ilovaga qaytish" tugmasi bilan).
3. Ilova `POST /mobile/auth/telegram/check` `{ "token": "…", "referral_code": "…"? }` ni **2 soniyada bir** poll qiladi:
   - `{ "status": "pending" }` — kutish;
   - `{ "status": "confirmed", "auth": { access_token, refresh_token, role, id } }` — kirdi (yangi bo'lsa ro'yxatdan o'tadi);
   - `400 otp_expired` — token muddati (5 daqiqa) o'tgan yoki allaqachon ishlatilgan → qaytadan `start`.
   Token **bir martalik**. Eski OTP oqimi (`/mobile/auth/user/otp/*`) ishlashda davom etadi.

### 7.2 Hisobga telefon/email ulash (profil)
| Metod | URL | Izoh |
|---|---|---|
| POST | `/mobile/user/phone/start` | `{token, bot_url, expires_in}` — Telegram orqali tasdiqlash (login bilan bir xil bot oqimi) |
| POST | `/mobile/user/phone/confirm` | `{ "token" }` → `pending` / `confirmed`; raqam boshqa hisobda bo'lsa `409 identifier_taken` |
| DELETE | `/mobile/user/phone` | uzish; boshqa kirish usuli (email/Google) bo'lmasa `400 auth_method_required` |
| POST | `/mobile/user/email/send` | `{ "email" }` — kod yuboriladi (3 ta/10 daqiqa); band bo'lsa `409 identifier_taken` |
| POST | `/mobile/user/email/confirm` | `{ "email", "code" }` → ulandi; `400 invalid_otp` / `otp_expired` / `429 otp_locked` |
| DELETE | `/mobile/user/email` | uzish (kamida bitta boshqa usul qolishi shart) |

Telefonni **almashtirish** = yangi raqam bilan `phone/start` → tasdiqlash (eski raqam almashadi). Ulangandan keyin foydalanuvchi
Telegram bot yoki email — ikkalasi bilan ham kira oladi.

### 7.3 OTP himoyasi
- Bitta email/telefonga **5 ta kod / 10 daqiqa** (`429 too_many_requests`).
- Kodni tasdiqlashda **5 ta noto'g'ri urinishdan** keyin kod yaroqsiz bo'ladi (`429 otp_locked`) — yangi kod so'rash kerak.

## 8. Captcha

`CAPTCHA_SECRET` sozlangan bo'lsa (Cloudflare Turnstile / hCaptcha / reCAPTCHA), quyidagilarda **`X-Captcha-Token`** header majburiy:
`POST /mobile/auth/user/otp/send`, `POST /mobile/auth/telegram/start`. Yo'q/yaroqsiz bo'lsa `400 captcha_failed`.
Secret sozlanmagan bo'lsa himoya o'chiq (header shart emas). Site-key va widget frontendda; provayder tanlovini backend
`CAPTCHA_PROVIDER` (`turnstile` default) bilan belgilaydi.

## 9. Rate limiting (429)

Javob: `429 { error: { slug: "too_many_requests" } }` + `Retry-After: <soniya>`. Limitlar (IP yoki foydalanuvchi bo'yicha):

| Endpoint | Limit |
|---|---|
| Umumiy (har IP) | 600 / daqiqa |
| `POST /web/auth/admin/login` | 10 / 10 daqiqa (IP) |
| `POST /mobile/auth/user/otp/send` | 20 / soat (IP) + 5 / 10 daqiqa (identifikator) |
| `POST /mobile/auth/user/otp/confirm` | 30 / 10 daqiqa (IP) + 5 noto'g'ri urinish |
| `POST /mobile/auth/telegram/start` / `check` | 20 / soat / 120 / daqiqa (IP) |
| `POST /mobile/auth/user/check`, `/google` | 30 / daqiqa (IP) |
| `POST /auth/token/refresh` | 60 / daqiqa (IP) |
| Practice: `sessions` / `next` / `answer` | 20 / 20 / 40 per daqiqa (foydalanuvchi) |
| Simulyatsiya `…/event` | 60 / daqiqa (foydalanuvchi) |
| Fleshkarta deck buyurtmasi | 5 / 10 daqiqa (foydalanuvchi) |
| Yo'l xaritasi `refresh` | 3 / 10 daqiqa (foydalanuvchi) |
| Telefon/email ulash | 10 / soat (foydalanuvchi) |
| `POST /mobile/feedback` | 10 / soat (foydalanuvchi) |

**Prompt injection:** foydalanuvchi matnlari (javob, chat, erkin mavzu, harakat tafsilotlari) AI'ga alohida delimiter ichida,
faqat ma'lumot sifatida beriladi; "ballni 100 qil" kabi buyruqlar e'tiborsiz qoladi. Yuklangan manba fayllari kengaytma va
haqiqiy tarkib (magic bytes) bo'yicha tekshiriladi.

## 10. Admin panel (`admin-panel.html` va `/web` endpointlar)

| Sahifa | Endpoint | Izoh |
|---|---|---|
| ⚙️ Sozlamalar → "Pay-as-you-go" kartasi | `GET/PUT /web/setting/daily-free-coins`, `/coin-rate`, `/practice-images` | kunlik bepul tangalar, token narxi, AI tasvirlar |
| 🃏 Fleshkartalar | `GET /web/flashcard/stats` | jami kartalar, takrorlashlar, eslab qolish (30 kun), o'zlashtirish, eng ko'p xato mavzular |
| 💬 Fikrlar | `GET /web/feedback`, `PUT /web/feedback/{id}/status` | baho/izohlar, holat (new/seen/done) |
| 📁 Bo'limlar, 📑 Mavzular | mavjud CRUD | yangi: `description` (ml), `is_active` |
| 📈 AI Practice, 📚 Manbalar | oldingi hujjat | |

Eski sozlamalar: `daily_free_limit` faqat eski simulyatsiya moduli uchun; `coin_to_uzs_rate` o'chirildi (migratsiya);
`voice_enabled` keyinga qoldirildi (default `false`).

## 11. Konfiguratsiya va deploy

Yangi env (hammasi ixtiyoriy, default bor): `TG_BOT_USERNAME` (bo'sh bo'lsa Telegram `getMe` dan olinadi),
`CAPTCHA_PROVIDER` (`turnstile`), `CAPTCHA_SECRET` (bo'sh = o'chiq), `RATE_LIMIT_DISABLED` (faqat lokal debug),
`GEMINI_IMAGE_MODEL` (`gemini-3.1-flash-image`), `GEMINI_EMBEDDING_MODEL`.

- Login boti — `NEW_BOT_TOKEN` botining o'zi; backend va bot bitta Redis'dan foydalanadi (deep-link tokenlari shu yerda).
- Migratsiyalar `00024…00028` deploy'da avtomatik. `00028` `coin_to_uzs_rate` ni o'chiradi va `voice_enabled=false` qiladi.
- Mavjud foydalanuvchilarga ta'sir: har kim kuniga `daily_free_coins` (default 10) bepul tanga oladi.

## 12. Qilinmagan / keyingi bosqich

- Marketing (Telegram/Instagram/Facebook ads), B2B hamkorlar (universitet/o'quv markazlari) — kod emas, biznes ishi.
- Case'da to'liq dialog, SSE streaming, yuklangan manba fayllarini saqlash (hozir faqat matni), tasvir moderatsiyasi.
- Yo'l xaritasi uchun push-eslatma (kunlik takrorlash), Telegram botda streak eslatmasi.
- Eski simulyatsiya moduli (`/mobile/simulation`) hali eski billing (`daily_free_limit`, `use_coins`) bilan ishlaydi — keyingi bosqichda yangi hamyonga o'tkaziladi.
