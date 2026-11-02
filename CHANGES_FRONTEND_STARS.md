# Backend o'zgarishlari — XP o'rniga Stars (yulduzlar) va yulduzlar bo'yicha reyting

Mobil, web va admin frontendga ta'sir qiladi. **Breaking change:** `xp` nomi hamma joyda `stars` ga almashdi
(eski nom qoldirilmadi).

## 1. Nomlar o'zgardi

| Eski | Yangi | Qayerda |
|---|---|---|
| `xp` | `stars` | foydalanuvchi profili (`/mobile/user/get/profile`, `/web/user` ro'yxati va h.k.) |
| `xp_earned` | `stars_earned` | case/mashq sessiyasi natijasi, debrief, sessiya ro'yxati |
| `required_xp` | `required_stars` | level (`/mobile/level`, `/web/level`) |
| `xp_reward` | `stars_reward` | level (`/web/level` create/update) |
| `xp_delta` | `stars_delta` | ichki (AddPoints), frontendga ko'rinmaydi |

Qiymatlar o'zgarmadi, faqat nom. Hisoblash qoidalari ham avvalgidek (qiyinlik koeffitsienti, level mukofoti).
Ma'lumotlar bazasi migratsiyasi: `00029_xp_to_stars.sql` (ustunlar qayta nomlanadi, `point_transactions.kind`
`xp` → `stars`).

Frontend: UI'da "XP" yozuvlarini "Stars" / "Yulduz" ga, JSON maydonlarini yuqoridagi jadvalga ko'ra o'zgartiring.

## 2. Reyting: case soni yoki yulduzlar bo'yicha

`GET /mobile/user/rating?type=day|week|month|year|total&limit=10&sort=activity|stars`

- Yangi parametr `sort` (ixtiyoriy):
  - `activity` (default, avvalgi xatti-harakat) — davrdagi yakunlangan case soni bo'yicha;
  - `stars` — davrdagi yulduzlar bo'yicha.
- `sort` boshqa qiymat bo'lsa 400.
- Har bir element (`items[]` va `me`) endi ikkala qiymatni qaytaradi: `activity` (case soni) va `stars`.
  Javob ichida ham `sort` maydoni bor.
- Teng ball bo'lsa ikkinchi mezon, so'ng ism bo'yicha tartiblanadi (masalan `sort=stars` da teng
  yulduzda case soni ko'proq oldin turadi).
- `type=total` da `stars` — foydalanuvchining jami yulduzi (profildagi `stars` bilan bir xil). `day/week/month/year`
  da — shu davrda ishlab topilgan yulduzlar (Toshkent vaqti bo'yicha).

Namuna:

```json
GET /mobile/user/rating?type=week&sort=stars&limit=3
{
  "type": "week", "sort": "stars", "limit": 3,
  "items": [{"user_id": "…", "name": "Ali", "image_url": null, "activity": 4, "stars": 180, "rank": 1, "is_me": false}],
  "me": {"user_id": "…", "name": "Vali", "activity": 2, "stars": 40, "rank": 12, "is_me": true}
}
```

Frontend: reyting sahifasiga "Case soni" / "Yulduzlar" almashtirgich qo'shing va tanlanganini `sort` sifatida yuboring.
Top ro'yxati 30 soniya keshlanadi (har bir `type`+`sort`+`limit` uchun alohida).

## 3. Admin panel (`admin-panel.html`)

- Levellar: ustunlar `required_stars`, `stars_reward`; foydalanuvchilar jadvalida "Stars" ustuni.
- `admin-panel.html` ni nginx'ga qo'lda yuklash kerak.

## 4. Deploy

Backend deploy qilinsa migratsiya avtomatik ishlaydi. Frontend eski `xp` maydonlarini o'qisa `undefined`
bo'ladi, shuning uchun frontend va backendni bir vaqtda chiqaring.
