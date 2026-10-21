# Backend o'zgarishlari (18 oktyabr 2026) — Token asosidagi to'lov va endless practice

Migratsiya: `migrations/00023_token_billing.sql`.

## 1. Token-to-coin tarifi (admin panel)

Qat'iy "1 case = X tanga" (`case_coin_cost`) modeli **bekor qilindi**.

| Metod | URL | Body / javob |
|---|---|---|
| GET | `/web/setting/coin-rate` | `{"coins_per_1k_tokens": 1}` |
| PUT | `/web/setting/coin-rate` | `{"coins_per_1k_tokens": 1.5}` (kasr mumkin, `>= 0`; `0` = tanga yechilmaydi) |

Qiymat = AI tannarxi + platforma xarajati + marja. O'zgartirilgach keyingi hisob-kitoblarda darhol kuchga kiradi.
Casbin: `admin` roliga `/web/setting/coin-rate` GET/PUT qo'shildi.

## 2. Mobil/user: sessiya to'lovi

- `GET` limit status javobida `case_coin_cost` o'rniga `coins_per_1k_tokens`.
- `POST` simulation start: kunlik limit tugagan va `use_coins: true` bo'lsa sessiya **tanga hisobidan** boshlanadi
  (oldindan narx yechilmaydi; balans `> 0` bo'lishi kerak, aks holda `insufficient_coins`).
  Premium va bepul urinishda tanga yechilmaydi.
- Har AI chaqiruvidan keyin sarflangan token (prompt + completion, ovoz va debrief ham) `ceil(tokens/1000 * tarif)`
  tangaga aylantirilib balansdan yechiladi (balansdan ortiq yechilmaydi). Balans 0 bo'lsa keyingi event
  `insufficient_coins` qaytaradi.
- Event va finish javoblariga qo'shildi: `tokens_used`, `coins_spent` (sessiya bo'yicha jami). Balans tarixida
  `reason = ai_usage`.

## 3. Endless practice

- `GET /mobile/case/random?topic_id=…&exclude_id=<joriy case id>` — mavzu bo'yicha tasodifiy case ("Keyingi" tugmasi).
  `topic_id` berilganda yechilmaganlari birinchi o'rinda, hammasi yechilgan bo'lsa ham qaytadi; `exclude_id` takrorlanmaydi.
- `max_attempts` default `1` (yangi case'lar; mavjudlari o'zgarmadi).
- Case yaratishda `title`/`subtitle` endi majburiy emas (frontend yuborishni to'xtatishi mumkin).
