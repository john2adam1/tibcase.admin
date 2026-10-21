# Backend o'zgarishlari (17 oktyabr 2026) — AI case generatsiya, admin panel frontend uchun

Referens: [`admin-panel.html`](admin-panel.html) (Case moduli va "Ishonchli manbalar" moduli).
Batafsil so'rov/javob shakllari [`API_WEB.md`](API_WEB.md) ichida.

Mobil/user-app frontendiga ta'sir yo'q.

## 1. Yangi bo'lim: Ishonchli manbalar (`/web/case-source`)

AI case yaratishda tayanadigan manbalar bir marta kiritiladi va bazada saqlanadi.
Sidebar'ga "📚 Ishonchli manbalar" bo'limi qo'shiladi (oddiy CRUD jadval + forma).

| Metod | URL | Izoh |
|---|---|---|
| POST | `/web/case-source` | body: `name`, `content` (ikkalasi majburiy) |
| GET | `/web/case-source` | query: `name` (qidiruv), `limit`, `page`; javob: `sources[]`, `count` |
| GET | `/web/case-source/{id}` | bitta manba |
| PUT | `/web/case-source/{id}/update` | body: `name`, `content` |
| DELETE | `/web/case-source/{id}/delete` | |

Maydonlar:
- `name`: string — masalan "AHA 2020 yo'riqnomasi"
- `content`: string — **veb-havola (http/https) yoki matn parchasi**. Forma: katta textarea.
- javobda qo'shimcha: `id`, `created_at`, `updated_at`

## 2. `POST /web/case/ai-generate` — o'zgargan body

Yangi/o'zgargan maydonlar:

- `topic_id`: string — **yangi, ixtiyoriy.** Mavzuni ro'yxatdan tanlash. Berilsa case shu
  mavzuga biriktiriladi va `topic` bo'sh bo'lsa mavzu nomi avtomatik olinadi.
- `topic`: string — mavzuni matn bilan yozish (ro'yxatdan tanlanmagan bo'lsa).
  `topic_id` yoki `topic` dan kamida bittasi bo'lishi kerak.
- `source_ids`: string[] — **yangi, ixtiyoriy.** Tanlangan manbalar (`/web/case-source` id'lari).
  **Bo'sh yuborilsa bazadagi BARCHA manbalar ishlatiladi.**
- `difficulty`, `chief_complaint`, `expected_answer` — avvalgidek.

Forma: mavzu uchun select (`GET /web/topic`) + ostida "yoki matn yozing" input;
manbalar uchun checkbox ro'yxat (hech biri belgilanmasa — hammasi ishlatiladi, shuni
label'da yozib qo'ying).

## 3. Yangi endpoint: `POST /web/case/ai-generate-batch` — ommaviy generatsiya

Butun bo'lim (yoki bir nechta mavzu) bo'yicha bir martada ko'p case qoralamasi yaratadi.

Body:
- `category_id`: string — bo'lim; ichidagi barcha mavzular uchun yaratiladi
- `topic_ids`: string[] — aniq mavzular (berilsa `category_id` e'tiborga olinmaydi)
- `difficulty`: `easy|medium|hard`
- `count_per_topic`: integer — har bir mavzuga nechta (default 1)
- `source_ids`: string[] — bo'sh bo'lsa barcha manbalar

Javob (200):
```json
{
  "created": 3,
  "failed": 1,
  "items": [
    {"topic_id": "…", "case_id": "…"},
    {"topic_id": "…", "error": "gemini API error …"}
  ]
}
```

Eslatmalar:
- Jami so'raladigan case soni (`mavzular × count_per_topic`) **20 tadan oshmasligi kerak**,
  aks holda 400 xato qaytadi. Forma'da shu chegarani ko'rsating.
- Generatsiya sinxron va ketma-ket bajariladi, har case ~10-30 soniya olishi mumkin —
  tugma loading holatida bo'lsin, so'rov timeout'ini oshiring (masalan 5 daqiqa).
- Bitta mavzudagi xato qolganlarini to'xtatmaydi: `failed` va `items[].error` ni ko'rsating.
- Case'lar **draft** holatida yaratiladi, admin ko'rib chiqib Publish qiladi.

Admin panelda: Case ro'yxati toolbar'iga "🤖 Ommaviy AI generatsiya" tugmasi
(bo'lim select, qiyinlik, har mavzuga soni, manbalar checkbox'lari).

## 4. Boshqa (frontend ishi yo'q)

- Email va Telegram OTP xabarlari "MedicAI" o'rniga "TibStation" nomida ketadi (faqat backend).
- `GEMINI_API_KEY` yaroqsiz bo'lsa `/web/case/ai-generate*` 400 `validation_error`
  ("API key not valid") qaytaradi — bu kod xatosi emas, serverdagi env'ni yangilash kerak.

## Tekshirish ro'yxati

- [x] Sidebar + CRUD: Ishonchli manbalar (`/web/case-source`)
- [x] AI forma: `topic_id` select + matn, `source_ids` checkbox
- [x] Ommaviy AI: bo'lim/mavzu, 20 chegara, 5 daqiqa timeout, natija
