# Backend uchun TZ: admin panelga statistikalar qo'shish

Hammasi admin uchun (`/web/*`). Har bir statistika uchun bitta GET endpoint kerak. Hammasida davr tanlash bor: `from` va `to` (`YYYY-MM-DD`). Kun chegarasi Toshkent vaqti bo'yicha. Javob swagger'da aniq tiplangan bo'lsin.

> ✅ belgisi: backend va admin panelda tayyor (1, 2, 3, 5, 9-bandlar). Qolganlari hali qilinmagan.

## 1. ✅ Moliya — `GET /web/stats/finance`

Qaytarsin:
- tushum (so'm) va to'langan buyurtmalar soni
- AI xarajati (USD va so'm)
- foyda (tushum − xarajat)
- bitta foydalanuvchiga o'rtacha tushum va to'lagan foydalanuvchiga o'rtacha tushum
- kunma-kun ro'yxat: sana, tushum, xarajat
- tarif bo'yicha: tarif nomi, nechta sotilgan, qancha tushum

USD → so'm kursi uchun sozlama kerak: `usd_to_uzs_rate`.

## 2. ✅ AI xarajati — `GET /web/stats/ai-cost`

Qaytarsin:
- jami xarajat, token, chaqiruvlar soni
- funksiya bo'yicha (keys, test, fleshkarta, yo'l xaritasi, rasm va h.k.): chaqiruv soni, token, xarajat
- bitta amalning o'rtacha narxi (USD) va unga foydalanuvchidan yechilgan o'rtacha tanga: keys sessiyasi, test sessiyasi, fleshkarta, yo'l xaritasi
- foydalanuvchi turi bo'yicha xarajat: bepul / tanga bilan / premium

Maqsad: 1 tanganing haqiqiy narxini va tanga paketi narxini to'g'ri belgilash.

## 3. ✅ Premium va eng ko'p sarflaganlar — `GET /web/stats/premium-cost`

Qaytarsin:
- premium foydalanuvchilar soni va ularning o'rtacha AI xarajati
- zarar keltirayotgan premium foydalanuvchilar soni (AI xarajati to'lagan pulidan ko'p)
- eng ko'p AI sarflagan 20 foydalanuvchi: ism, turi, xarajat, token, sessiyalar soni, to'lagan puli

## 4. Tanga — `GET /web/stats/coins`

Qaytarsin:
- berilgan tangalar: kunlik bepul, referal, promokod, sotib olingan
- sarflangan tangalar (bepul tangadan va sotib olingan tangadan alohida)
- muomaladagi tangalar
- bepul tangalar uchun ketgan AI xarajati (bepul tizim qancha turadi)

## 5. ✅ Faollik — `GET /web/stats/engagement`

Qaytarsin:
- bugungi DAU, oxirgi 7 kun WAU, oxirgi 30 kun MAU, DAU/MAU
- yangi foydalanuvchilar soni
- kunma-kun: DAU, yangi foydalanuvchilar, sessiyalar, fleshkarta takrorlashlari
- voronka (tanlangan davrda ro'yxatdan o'tganlar bo'yicha): ro'yxatdan o'tdi → birinchi sessiyani boshladi → tugatdi → ertasi kuni qaytdi → to'lov qildi

Faol foydalanuvchi = davrda kamida bitta sessiya/javob/fleshkarta takrorlash qilgan. Faqat login faollik emas.

## 6. Saqlab qolish — `GET /web/stats/retention`

Haftalik guruhlar (oxirgi 8 hafta): guruh nomi, hajmi, 1-kun, 7-kun, 30-kun qaytganlar ulushi.

## 7. Konversiya — `GET /web/stats/conversion`

Qaytarsin:
- "tanga yetmadi" oynasi nechta marta chiqdi, nechta foydalanuvchiga, shundan 24 soat ichida nechtasi to'lov qildi
- ro'yxatdan o'tganlardan to'lov qilganlar ulushi, birinchi to'lovgacha o'rtacha kunlar
- obuna va tanga paketi ulushi
- obunani yangilaganlar ulushi

## 8. Foydalanish — `GET /web/stats/usage`

Qaytarsin:
- sessiyalar: jami, keys, test, tugatilgan, tashlab ketilgan, o'rtacha savollar soni va davomiylik
- qiyinlik bo'yicha sessiyalar
- eng ko'p ishlatilgan bo'limlar va mavzular (sessiyalar soni, to'g'ri javob ulushi, tashlab ketish ulushi)
- erkin yozilgan mavzular reytingi (eng ko'p so'ralgan matnlar)
- "tibbiyotga aloqasiz" deb rad etilgan mavzular
- "Manba topilmadi" chiqqan javoblar ulushi
- fleshkarta: takrorlashlar, faol foydalanuvchilar, buyurtma qilingan to'plamlar
- yo'l xaritasi: ko'rishlar va yangilashlar

## 9. ✅ Foydalanuvchilar ro'yxatini boyitish — `GET /web/user`

Har foydalanuvchiga qo'shilsin:
- oxirgi faollik vaqti, sessiyalar soni
- AI xarajati (USD), jami token
- tanga balansi, jami sarflagan tanga
- jami to'lagan puli, buyurtmalar soni
- obuna bormi va qachongacha
- ro'yxatdan o'tgan usuli (telegram, telefon, email), platforma (ios/android/web), ilova versiyasi
- fikr va shikoyatlar soni

Yangi filtrlar: ro'yxatdan o'tgan sana oralig'i, `N` kundan beri faol emas, obunasi bor/yo'q, to'lagan/to'lamagan, `email`.
Yangi saralash: oxirgi faollik, AI xarajati, to'lagan puli, sessiyalar soni.

Alohida: `GET /web/user/{id}/stats` — bitta foydalanuvchi: oxirgi 30 kun grafigi (sessiyalar, token, tanga), eng ko'p ishlatgan bo'limlari, oxirgi tranzaksiya va buyurtmalari.

## 10. Segmentlar — `GET /web/stats/segments`

Sonlarni qaytarsin:
- yangi (7 kun)
- faol (7 kun)
- 7 kundan beri faol emas
- 30 kundan beri faol emas
- to'lovchilar
- bepul tangasi tugaganlar (7 kun)
- eng faol 5%
- ketish xavfi bor (to'lagan, lekin 14 kundan beri kirmagan)

Har segment `GET /web/user?segment=<nom>` bilan ro'yxat sifatida ham ochilsin.

## 11. Sifat — `GET /web/stats/quality`

- generatsiya so'rovlari soni, xatolar (`practice_generation_failed`) soni va ulushi
- generatsiya javob vaqti (o'rtacha va 95%)
- shikoyatlar: jami va har 100 ta savolga nechta
- 429 (limit) xatolari soni

## 12. Platforma — `GET /web/stats/platform`

Foydalanuvchilar soni va ulushi: platforma, ilova versiyasi, til, ro'yxatdan o'tish usuli bo'yicha.

## 13. Referal va promokod — `GET /web/stats/acquisition`

- referal: taklif qilingan, ro'yxatdan o'tgan, to'lov qilgan, berilgan tangalar
- eng ko'p odam olib kelgan 10 foydalanuvchi
- promokod: ishlatilgan soni, berilgan tangalar, hamkor bo'yicha (nechta ishlatilgan, keyin nechta to'lov qilgan)

## 14. Shubhali foydalanuvchilar — `GET /web/stats/anomalies`

Oxirgi 24 soat va 7 kunda: AI xarajati odatdagidan ko'p oshganlar, bir qurilma/IP'dan ko'p akkaunt ochganlar, 429 ko'p olganlar. Har biri: foydalanuvchi, sabab, qiymat.

---

## Hozirdan yozib borish kerak bo'lgan ma'lumotlar

Bular yozilmasa, keyin tiklab bo'lmaydi:

1. Foydalanuvchida: oxirgi faollik vaqti, ro'yxatdan o'tish usuli, platforma, ilova versiyasi.
2. Har AI chaqiruvida: foydalanuvchi, sessiya, funksiya nomi, model, tokenlar, xarajat (USD).
3. Har tanga yozuvida: manba (kunlik bepul / sotib olingan / referal / promokod / admin) va sarflanganda qaysi turdagi tangadan yechilgani.
4. Har sessiyada: boshlangan va tugagan vaqti, holati, sarflangan token, tanga, xarajat; erkin mavzu matni; rad etilgan mavzular.
5. Hodisalar jadvali (`user_events`): ro'yxatdan o'tdi, sessiya boshlandi/tugadi, "tanga yetmadi" oynasi chiqdi, to'lov boshlandi/tugadi, fleshkarta takrorlandi, yo'l xaritasi ko'rildi/yangilandi.
6. Sozlama: `usd_to_uzs_rate`.

## Qaysi tartibda qilish

1. **Birinchi:** 1, 2, 3, 5, 9 va yuqoridagi 1–4 ma'lumotlarni yozib borish. Shunda foyda va bitta amal narxi ko'rinadi.
2. **Ikkinchi:** 4, 6, 7, 8, 10 va hodisalar jadvali.
3. **Oxirida:** 11, 12, 13, 14.

Admin panelning statistika sahifalarini frontend endpointlar tayyor bo'lgach qo'shadi.
