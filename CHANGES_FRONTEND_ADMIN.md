# Backend o'zgarishlari (28 sentabr 2026) — admin panel frontend uchun

Bu hujjat oxirgi 3 kunda backendga kirgan commitlardan **admin panel**
(`/web/...` endpointlar) frontendiga tegishlisini o'z ichiga oladi. User-app
(mobil/user-web)ga tegishli o'zgarishlar uchun
[`CHANGES_FRONTEND_USER.md`](CHANGES_FRONTEND_USER.md) ga qarang.

Referens: [`admin-panel.html`](admin-panel.html). To'liq so'rov/javob shakli
allaqachon [`API_WEB.md`](API_WEB.md) ichida (Levellar, Sozlamalar bo'limlari).

## Commitlar

| Sana | Commit | Nima |
|---|---|---|
| 09-28 | `91e6451` | Case qiyinligiga (easy/medium/hard) qarab XP/coin koeffitsienti |
| 09-28 | `12314e7` | Mukofot bazasi global sozlamadan har-level'ga ko'chirildi |

## XP/Coin mukofoti — endi level + qiyinlik bo'yicha

Avval bazaviy XP/coin bitta global sozlama edi (`app_settings`). Endi har bir
**level**ning o'ziga xos bazaviy mukofoti bor, unga case **qiyinlik**
koeffitsienti qo'llanadi:

```
xp   = level.xp_reward   * qiyinlik_koeffitsienti * (final_score / 100)
coins = level.coin_reward * qiyinlik_koeffitsienti * (final_score / 100)
```

- `easy` = 1x (sozlanmaydi)
- `medium`/`hard` — admin panelda sozlanadigan koeffitsient (default 1.5 / 2)

### `GET/POST/PUT /web/level` — yangi maydonlar

`LevelCreateReq`/`LevelUpdateReq`/javob endi ikkita qo'shimcha maydon oladi:

- `xp_reward`: integer — shu level'dagi foydalanuvchi uchun bazaviy XP
- `coin_reward`: integer — shu level'dagi foydalanuvchi uchun bazaviy coin

Level yaratish/tahrirlash formasiga shu ikki maydonni qo'shish kerak (avval
umuman yo'q edi, faqat `required_xp`/`badge_image_url`/`slug`/`title`/
`level_number` bor edi).

### `GET/PUT /web/setting/difficulty-reward` — qiyinlik koeffitsienti

```json
{
  "medium_multiplier": 1.5,
  "hard_multiplier": 2
}
```

Sozlash sahifasi (masalan "Sozlamalar" bo'limi) uchun bitta forma: ikkita
son maydon, `PUT` bilan saqlanadi. Sozlanmagan bo'lsa default `1.5`/`2`
qaytadi.

**Eski `GET/PUT /web/setting` orqali global XP/coin bazaviy qiymati endi
ishlatilmaydi** — agar admin panelda shunday umumiy "bazaviy XP/coin" maydoni
bo'lgan bo'lsa, uni olib tashlab, o'rniga yuqoridagi ikkita joyga (har-level
forma + difficulty-reward forma) almashtiring.

## Tekshirish ro'yxati

- [x] Level yaratish/tahrirlash formasiga `xp_reward`/`coin_reward` qo'shish
- [x] Eski global "bazaviy XP/coin" sozlama maydoni bo'lsa — olib tashlash
- [x] `medium_multiplier`/`hard_multiplier` sozlash formasi (Sozlamalar bo'limi)
