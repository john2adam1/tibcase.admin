# Backend o'zgarishlari (20 oktyabr 2026) — Case yaratish: qo'lda va AI bitta formada

Referens: [`admin-panel.html`](admin-panel.html) (Case moduli, `createFields` / `beforeCreate`).
Mobil/user-app frontendiga ta'sir yo'q.

## Qisqacha

Avval case'ni yaratishning ikkita alohida yo'li bor edi: "+ Yangi" (katta qo'lda forma: sarlavha,
vitals, JSON scenario...) va "🤖 AI bilan yaratish". Endi **bitta qisqa forma** bor:

| Maydon | Izoh |
|---|---|
| Mavzu | ro'yxatdan tanlash (`topic_id`) **yoki** matn yozish (`topic`) |
| Qiyinlik | `easy` / `medium` / `hard` (default `medium`) |
| Muqova rasm | `cover_image_url` |
| Bemor shikoyati | `chief_complaint` |
| To'g'ri javob | `expected_answer` |

AI qolgan maydonlarni (sarlavha, kichik sarlavha, bemor yoshi/jinsi, vitals, vizual holat, scenario,
davomiylik) o'zi to'ldiradi. **Admin kiritgan shikoyat, to'g'ri javob va rasm AI tomonidan
o'zgartirilmaydi** — aynan kiritilganicha saqlanadi. AI faqat bemor holatini baholab, UI'da
ko'rsatiladigan ma'lumotlarni tayyorlaydi.

## 1. `POST /web/case` — endi AI bilan to'ldiradi

Yangi maydon:
- `topic`: string — **ixtiyoriy.** Mavzu ro'yxatdan tanlanmagan bo'lsa, mavzu matni. Faqat AI uchun
  yo'l-yo'riq, bazaga saqlanmaydi (case `topic_id`siz, draft holatda yaratiladi).

Xatti-harakat:
- `title` yuborilmasa va shikoyat / javob / mavzudan kamida bittasi berilgan bo'lsa — backend AI'ni
  chaqirib, **faqat bo'sh qolgan** maydonlarni to'ldiradi (title, subtitle, patient_age,
  patient_gender, expected_duration_minutes, initial_vitals, visual_state, scenario, va
  `chief_complaint`ning yetishmayotgan tillari).
- Frontend to'liq body (title, vitals va h.k.) yuborsa — AI chaqirilmaydi, hammasi avvalgidek saqlanadi.
- **AI ishlamasa yoki sozlanmagan bo'lsa ham case saqlanadi**: sarlavha shikoyatning birinchi
  60 belgisidan olinadi (shikoyat ham bo'lmasa "Yangi case"), `difficulty` bo'sh bo'lsa `medium`.
  Admin keyin tahrirlashda to'ldiradi.
- Shikoyat va javob endi majburiy emas: bo'sh qoldirilsa AI o'zi o'ylab topadi.
- Case har doim `draft` holatda yaratiladi, `Publish` alohida qadam (avvalgidek).

Namuna:

```json
POST /web/case
{
  "topic_id": "…",            // yoki "topic": "O'tkir appenditsit"
  "difficulty": "medium",
  "cover_image_url": "https://…/img.png",
  "chief_complaint": { "uz": "Qorin o'ng pastki qismida og'riq, ko'ngil aynish" },
  "expected_answer": "O'tkir appenditsit"
}
```

> `chief_complaint` — `{uz: "..."}` ko'rinishida yuboriladi. Admin yozgan matn **`uz`** ostida
> aynan saqlanadi, `ru` va `en` tarjimalarini AI to'ldiradi.

## 2. `POST /web/case/ai-generate` — yangi maydon

- `cover_image_url`: string — **yangi, ixtiyoriy.** Berilsa AI natijasidagi rasm o'rniga aynan shu
  saqlanadi.
- `chief_complaint` (string) va `expected_answer` (string) endi AI tomonidan o'zgartirilmaydi:
  shikoyat `chief_complaint.uz` ga, javob `expected_answer` ga aynan yoziladi.

Qolgan maydonlar (`topic_id`, `topic`, `difficulty`, `source_ids`) avvalgidek.

Bu endpoint endi admin panelda alohida tugma sifatida ishlatilmaydi (yangi forma `POST /web/case`
ni chaqiradi), lekin boshqa mijozlar uchun saqlanib qoladi.

## 3. Admin panel (`admin-panel.html`) o'zgarishlari

- Toolbar: **"+ Yangi"** (yagona forma), **"🤖 Ommaviy AI generatsiya"** (bo'lim yoki mavzu
  bo'yicha, avvalgidek), **"📥 Excel/CSV yuklash"**.
- Alohida **"🤖 AI bilan yaratish"** tugmasi olib tashlandi.
- "+ Yangi" formasi yuqoridagi 5 ta maydondan iborat (+ mavzu matni). Mavzu select'i ham, mavzu matni
  ham bo'sh bo'lsa forma "Mavzuni tanlang yoki matn yozing" xatosini beradi.
- **Tahrirlash formasi o'zgarmadi**: to'liq maydonlar (vitals, scenario JSON, max_attempts va h.k.)
  faqat shu yerda.
- Frontend implementatsiyasi: case konfigida `createFields` (yaratish formasi) va `beforeCreate`
  (shikoyatni `{uz: ...}` ga o'rash + validatsiya) — `fields` esa tahrirlash uchun.

## 4. Test

- Backend: `go test ./service` — yangi testlar: AI to'ldirganda admin maydonlari saqlanishi va AI
  xato bersa fallback sarlavha bilan saqlanishi.
- Frontend: `admin-panel.html` ni brauzerda ochib (login ekranida backend manzili
  `https://dev-medic.axadjonovsardorbek.uz`) "+ Yangi" formasini tekshirish mumkin. Dev backend
  CORS'ga ruxsat beradi.
