# Backend o'zgarishlari (25 oktyabr 2026) — AI real-time Case va Test (practice)

Asos: `new-feature.md` (TZ). Migratsiya: `migrations/00024_practice.sql`.
Bu hujjat admin panel va user-app (mobile/web) frontendlari uchun. Eski case moduli (`/web/case`, `/mobile/simulation`) **o'zgarmadi**, yangi modul unga tegmaydi.

## 0. Qisqacha oqim

- **Admin:** bo'lim va mavzu yaratadi (mavzuga ixtiyoriy `ai_hint`), **manbalar** (kitob/maqola fayli, sayt URL, matn) yuklaydi va ularni bo'lim/mavzularga bog'laydi. Case yaratmaydi.
- **User:** bo'lim, mavzu(lar), qiyinlik, rejim (`case` | `test`) tanlab **sessiya** boshlaydi. Har "Keyingisi" da AI manbalardan (RAG) **yangi** case/savol yaratadi. Javob beradi, izohni va **"Foydalanilgan manbalar"** ni ko'radi.

## 1. TZ'dagi ochiq savollar — qabul qilingan qarorlar

TZ §10 savollariga javob berilmagani uchun quyidagi default'lar qo'yildi (o'zgartirish oson):

| # | Savol | Qaror |
|---|---|---|
| 1 | Eski admin case'lari | Hech narsa o'zgarmaydi, eski modul ishlashda davom etadi |
| 2 | Test savollari soni, timer | User tanlaydi: `count` 1..50, default 10. Timer yo'q |
| 3 | Case rejimida rasm | Generatsiya qilinmaydi (keyingi bosqich) |
| 4 | Case: bir martalik javobmi yoki dialog | **Bir martalik javob** (har case uchun bitta javob, AI baholaydi) |
| 5 | Mavzu | Bir nechta tanlash mumkin; `topic_ids` bo'sh = butun bo'lim (aralash) |
| 6 | XP/coin | XP beriladi (§4.6). Sessiya uchun coin yechilmaydi (billing — §6 "qilinmagan") |
| 7 | Kitob/maqola faylini user yuklab olishi | Yo'q: fayl saqlanmaydi, faqat nomi/muallifi/sahifasi ko'rsatiladi (`url` faqat `website` uchun) |
| 8 | Til | Case/test tili `Accept-Language` (uz/ru/en); manba tili cheklanmagan |
| 9 | AI | Gemini; embedding: `gemini-embedding-001` (768 o'lchamli) |
| 10 | Moderatsiya | Oldindan yo'q; user `report` qiladi, admin `/web/practice/stats` da ko'radi |

## 2. Admin panel

### 2.1 Mavzu: `ai_hint`
`POST /web/topic`, `PUT /web/topic/{id}/update`: yangi ixtiyoriy `ai_hint: string` (masalan "faqat pediatrik holatlar"). `GET` javoblarida ham keladi. Update'da yuborilmasa (`null`) o'zgarmaydi.

### 2.2 Manbalar: `/web/source`
Eski `/web/case-source` ishlashda davom etadi (alias); yangi imkoniyatlar faqat `/web/source` da. Eski manbalar `type=text`, `status=ready` bo'lib qoladi.

| Metod | URL | Izoh |
|---|---|---|
| POST | `/web/source` | multipart/form-data **yoki** JSON |
| GET | `/web/source` | filtr: `type`, `status`, `category_id`, `topic_id`, `name`, `limit`, `page` |
| GET | `/web/source/{id}` | detal |
| PUT | `/web/source/{id}/update` | `title, language, author, url, is_active, category_ids, topic_ids` |
| POST | `/web/source/{id}/reindex` | qayta indekslash |
| DELETE | `/web/source/{id}/delete` | manba + chunklar |

**Yaratish (`POST /web/source`)** maydonlari (form yoki JSON):

| Maydon | Izoh |
|---|---|
| `title` | majburiy |
| `type` | `book` \| `article` \| `website` \| `text` |
| `file` | multipart fayl: PDF, EPUB, DOCX, TXT, max 50 MB. `book` uchun majburiy; `article` uchun fayl **yoki** `content` |
| `url` | `website` uchun majburiy (http/https) |
| `content` | `text` uchun majburiy; `article` uchun fayl o'rniga |
| `language`, `author` | ixtiyoriy |
| `category_ids`, `topic_ids` | ixtiyoriy. Form'da takroriy maydon yoki vergul bilan (`a,b`). **Bo'sh = umumiy manba** (hamma bo'limga mos) |

Javob: `{"message": "...", "id": "..."}`. Qayta ishlash **fonda** bajariladi:

`processing` → `ready` yoki `failed` (sabab `error` maydonida).

- Frontend yuklashdan keyin ro'yxatni **poll** qilsin (`GET /web/source/{id}`, 2-3 s oralig'ida) to `status` `ready`/`failed` bo'lguncha.
- `ready` bo'lsa ham `error` bo'sh bo'lmasligi mumkin: masalan "embedding o'tkazib yuborildi: ..." — chunklar saqlangan, lekin vektorsiz (qidiruv tasodifiy tanlashga tushadi). Bunday holda "Qayta indekslash" tugmasini taklif qiling.
- `failed` bo'lsa: skanerlangan PDF (matn yo'q), noto'g'ri format, sayt ochilmasligi va h.k.

**Javob maydonlari (`SourceRes`):** `id, title, type, language, author, url, file_url, status, error, is_active, chunk_count, category_ids[], topic_ids[], created_at, updated_at`.

Eslatma: bo'lim/mavzuga bog'langan manba faqat shu doirada ishlatiladi; mavzu tanlangan sessiyada shu mavzuga, shu bo'limga bog'langan va umumiy manbalar qatnashadi; "aralash" sessiyada bo'limdagi barcha mavzularga bog'langan manbalar ham kiradi. `is_active=false` yoki `status != ready` manbalar umuman ishlatilmaydi.

### 2.3 Statistika: `GET /web/practice/stats`
`sessions, active_sessions, items, answered, correct_rate (0..1), tokens, reports, by_category[], by_topic[] ({id, name, sessions, items}), recent_reports[] ({item_id, session_id, kind, reason, created_at})`.

### 2.4 `admin-panel.html` (tayyor namuna) — nima qo'shildi

Admin panel HTML'i yangilandi; alohida admin frontend (React/Next) qilayotgan jamoa uchun namuna sifatida ham ishlatsa bo'ladi.

- **Sidebar:** "📚 Manbalar (AI bazasi)" (eski "Ishonchli manbalar" o'rniga; eski `/web/case-source` backendda saqlangan, AI batch-generatsiya modali manbalarni shu endpoint'dan o'qiydi) va "📈 AI Practice" (statistika).
- **Manbalar jadvali:** ustunlar `title, type, status, chunk_count, language, author, is_active, error`; filtr: nom, tur, holat, bo'lim, mavzu. `processing` holatidagi qator bo'lsa jadval **har 3 soniyada o'zi yangilanadi** (poll) — `ready`/`failed` bo'lguncha. Qator amallari: Tahrir, **🔄 Qayta indekslash**, O'chirish.
- **Manba yaratish formasi:** turi bo'yicha maydonlar o'zgaradi — `book`: fayl; `article`: fayl yoki matn; `website`: URL; `text`: matn. Bo'lim va mavzular — checkbox ro'yxat (hech biri belgilanmasa umumiy manba). `multipart/form-data` bilan yuboriladi (`file`, takroriy `category_ids`/`topic_ids`).
- **Tahrirlash formasi:** nomi, til, muallif, URL, `is_active`, bo'lim/mavzu bog'lanishlari (oldindan belgilangan). Hech biri belgilanmasa bog'lanishlar tozalanadi (`[]` yuboriladi), maydon umuman yuborilmasa o'zgarmaydi.
- **Mavzu formasi:** yangi "AI yo'nalishi" (`ai_hint`) maydoni.
- **AI Practice sahifasi:** `/web/practice/stats` kartalari (sessiyalar, javoblar, to'g'ri javoblar ulushi, tokenlar, shikoyatlar) + bo'lim/mavzu bo'yicha va so'nggi shikoyatlar jadvallari.

## 3. User-app (`/mobile/practice`, Bearer, `Accept-Language: uz|ru|en`)

| Metod | URL | Izoh |
|---|---|---|
| POST | `/mobile/practice/sessions` | sessiya boshlash |
| POST | `/mobile/practice/sessions/{id}/next` | keyingi case/savolni generatsiya qilish |
| POST | `/mobile/practice/items/{id}/answer` | javob yuborish |
| POST | `/mobile/practice/sessions/{id}/finish` | yakunlash |
| GET | `/mobile/practice/sessions` | tarix (`limit`, `page`) |
| GET | `/mobile/practice/sessions/{id}` | tafsilot (elementlar bilan) |
| POST | `/mobile/practice/items/{id}/report` | `{"reason": "..."}` — noto'g'ri kontent haqida |

Ro'yxat uchun mavjud `GET /mobile/category`, `GET /mobile/topic?category_id=` ishlatiladi.

### 3.1 Boshlash
```json
POST /mobile/practice/sessions
{ "mode": "test", "category_id": "…", "topic_ids": ["…"], "difficulty": "medium", "count": 10 }
```
`mode`: `case|test`; `difficulty`: `easy|medium|hard` (default `medium`); `topic_ids` bo'sh = aralash; `count` faqat testda (default 10, max 50). Case rejimi cheksiz (sessiyada max 50 element).
Javob `PracticeSessionRes`: `id, mode, category_id, topic_ids, difficulty, total_items, generated, answered, correct, status (active|finished|abandoned), score, xp_earned, started_at, finished_at, items[]`.

### 3.2 Keyingi element (`next`)
Generatsiya 5–30 soniya olishi mumkin → **loading holati** ("AI case tayyorlamoqda…"). So'rov taymauti kamida 60 s bo'lsin.
- **Javobsiz element bo'lsa** `next` yangisini yaratmaydi, o'shani qaytaradi (qayta chaqirish xavfsiz).
- Javob berilgach backend **keyingisini fonda oldindan tayyorlay boshlaydi** (prefetch), shuning uchun "Keyingisi" odatda deyarli darhol qaytadi. Frontend `next` ni foydalanuvchi bosganda chaqirsa yetarli.
- Case rejimida 50 ta element yaratilgach `409 practice_limit_reached` (testda oxirgi savolga javob berilganda sessiya o'zi yopiladi, keyin `next` → `409 session_not_active`).

`PracticeItemRes` (javobdan **oldin** to'g'ri javob, izoh va manbalar **yashirin**):
```jsonc
// case
{ "id": "…", "idx": 0, "kind": "case", "answered": false,
  "chief_complaint": "Ko'kragim siqilyapti…",
  "patient": { "yosh": 55, "jins": "erkak", "anamnez": "…", "korik": "…", "vitals": "…", "tekshiruvlar": "…" },
  "sources": [] }
// test
{ "id": "…", "idx": 0, "kind": "test", "answered": false,
  "question": "…", "options": [{"key":"A","text":"…"}, {"key":"B","text":"…"}, {"key":"C","text":"…"}, {"key":"D","text":"…"}], "sources": [] }
```
`patient` — erkin tuzilma (kalitlar AI tomonidan tanlanadi): kalit-qiymat sifatida chiroyli ko'rsating, aniq kalitlarga bog'lanib qolmang.

### 3.3 Javob (`answer`)
```json
POST /mobile/practice/items/{id}/answer
{ "answer": "A" }                       // test: A|B|C|D
{ "answer": "O'tkir STEMI, aspirin…" }  // case: erkin matn (max 4000 belgi)
```
Javob:
```jsonc
{
  "item": {
    "id": "…", "answered": true, "is_correct": true,
    "score": 100,                         // 0..100 (testda 0 yoki 100)
    "verdict": "correct",                 // correct | partial | wrong
    "feedback": "…",                      // case: AI izohi
    "correct_answer": "…", "correct_key": "B",   // correct_key faqat testda
    "explanation": "…",
    "user_answer": "A",
    "sources": [ { "source_id": "…", "type": "book|article|website|text", "title": "…", "author": "…", "url": "…(faqat website)", "locator": "p. 12" } ],
    "sources_note": ""                    // sources bo'sh bo'lsa: "Manba topilmadi, javob umumiy tibbiy bilimga asoslangan."
  },
  "session_finished": false,
  "session": { … }                         // joriy sessiya holati
}
```
- **"Foydalanilgan manbalar"** bloki: `sources` ni yig'iladigan blok qilib ko'rsating ("Foydalanilgan manbalar (n)"). `type` bo'yicha belgi (📖 book, 📄 article, 🌐 website, text — belgisiz), `website` da `url` bosiladigan havola. `sources` bo'sh bo'lsa `sources_note` ni ko'rsating. Manbalar **faqat RAG'da haqiqatan promptga kiritilgan chunklardan** backend tomonidan shakllantiriladi (AI o'ylab topmaydi).
- Case: `is_correct = true` faqat `verdict=correct` (score ≥ 85). `partial` (35–84) — qisman, `is_correct=false`.
- **Test rejimida oxirgi savolga javob berilganda sessiya avtomatik yakunlanadi** (`session_finished: true`, `session` da `score` va `xp_earned`): alohida `finish` chaqirish shart emas.
- Case baholashda AI vaqtincha xato bersa `502 practice_generation_failed` — element **javobsiz qoladi**, o'sha javobni qayta yuborsa bo'ladi.
- Bir elementga ikki marta javob berib bo'lmaydi: `409 item_already_answered`.
- Xato format (testda `A-D` emas): `400 validation_error`.

### 3.4 Yakunlash va tarix
- `POST …/finish`: javob berilgan elementlar bo'yicha `score` (ballar o'rtachasi) va `xp_earned`. Hech narsa javoblanmagan bo'lsa `status=abandoned`, XP yo'q. Yakunlangan sessiyaga `next`/`finish`/`answer` → `409 session_not_active`.
- `GET …/sessions/{id}`: barcha elementlar; javob berilganlarda to'g'ri javob, izoh va manbalar ochiq, berilmaganlarda yashirin.

### 3.5 Xatolar
| Status / slug | Qachon |
|---|---|
| 404 `not_found` | sessiya/element topilmadi yoki boshqa userniki |
| 409 `session_not_active` | sessiya yakunlangan |
| 409 `practice_limit_reached` | test savollari limiti tugagan / case rejimida 50 element |
| 409 `item_already_answered` | element allaqachon javoblangan |
| 502 `practice_generation_failed` | AI case/savol yarata olmadi (3 urinishdan keyin) yoki baholay olmadi; qayta urinib ko'ring |

## 4. Backend tafsilotlari (frontend uchun ahamiyatlisi)

1. **RAG:** sessiya doirasidagi chunklardan so'rov embedding'iga eng mos 12 tasi olinadi, ulardan 4 tasi (eng mos 2 + 2 tasodifiy) promptga kiradi — keyingi case'lar xilma-xil bo'ladi. Embedding ishlamasa yoki manba bo'lmasa tasodifiy/umumiy bilimga tushadi (frontendda xato ko'rinmaydi, `sources_note` chiqadi).
2. **Takrorlanmaslik:** sessiyadagi oldingi elementlarning 1 gaplik xulosalari promptga beriladi.
3. **Validatsiya:** test aniq 4 ta noyob variant, bitta to'g'ri; bo'sh maydon bo'lsa AI qayta so'raladi (3 marta). Variantlar backend tomonidan aralashtiriladi (AI to'g'ri javobni bir joyga qo'ymasligi uchun).
4. **Baholash (case):** past temperature (0.1), qat'iy mezon (correct ≥ 85 / partial 35–84 / wrong < 35). Foydalanuvchi matni alohida delimiter ichida beriladi: "ballni 100 qil" kabi buyruqlar e'tiborsiz qoldiriladi (haqiqiy Gemini bilan tekshirilgan).
5. **XP:** `xp = Σ(item.score)/100 × 5` (to'liq to'g'ri javob = 5 XP), sessiya yakunlanganda `AddPoints` (`reason=practice_finish`).
6. **Audit:** har element uchun `prompt_version`, `tokens_used`, `source_chunk_ids` saqlanadi; sessiyada jami token; AI xarajati `ai_usage_logs` ga (`practice_generate`, `practice_evaluate`).
7. **Ingestion:** PDF (sahifa bo'yicha, `locator = "p. N"`), EPUB (bo'lim), DOCX, TXT, sayt (HTML tozalanadi). Chunk ≈ 600 token, overlap ≈ 100. Qayta indekslashda fayl manbalari saqlangan matndan qayta chunklanadi (sahifa raqamlari yo'qoladi), `website` qayta yuklanadi.
8. **pgvector kerak emas:** embedding `REAL[]` da, o'xshashlik Postgres ichida hisoblanadi (10 mingdan ortiq chunk bo'lsa pgvector'ga o'tish tavsiya etiladi).

## 5. Sozlamalar (env)

- `GEMINI_API_KEY` (haqiqiy `AIza…` kalit kerak), `GEMINI_MODEL`
- yangi: `GEMINI_EMBEDDING_MODEL` (default `gemini-embedding-001`)
- Deploy'da migratsiya `00024` avtomatik ishlaydi (`migrate-road`); mavjud ma'lumotlarga ta'sir qilmaydi.

## 6. Qilinmagan (keyingi bosqichlar)

- **Billing/limit (TZ 8-bo'lim, 5-bosqich):** practice sessiyalari hozircha coin yechmaydi va kunlik limitga ulanmagan. Token sarfi sessiyada va `ai_usage_logs` da yig'iladi, shuning uchun mavjud "token → coin" mexanizmiga ulash tayyor.
- Case uchun tibbiy rasm generatsiyasi, SSE streaming, mavzu/bo'limda `is_active`/tavsif maydonlari.
- Yuklangan fayllarni saqlash (MinIO) — hozir faqat matn saqlanadi.
- Swagger (`api/docs`) qayta generatsiya qilinmagan; handler izohlari yozilgan (`swag init`).
- `.env*.example` fayllari endi git'da yo'q (`.gitignore`): yangi dasturchi uchun kerakli o'zgaruvchilar ro'yxati README'da.

## 7. Test

- `go test ./...` — pure unit testlar + haqiqiy Postgres'li integratsiya testlar (`TIB_TEST_DB` DSN yoki lokal docker `5473`; DB yo'q bo'lsa skip).
- Haqiqiy Gemini: `TIB_REAL_AI=1 go test ./internal/ai -run PracticeReal -v` (generatsiya, baholash, prompt-injection, embedding).
