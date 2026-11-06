# 🖥️ Admin panel API — Frontend (web) uchun qo'llanma

> **Diqqat:** bu fayl dastlab `api/docs/swagger.json` asosida generatsiya qilingan, keyin
> barcha `CHANGES_FRONTEND_*` hujjatlari qo'lda shu faylga birlashtirilgan (alohida CHANGES fayllari o'chirilgan).
> Swagger (`/api/swagger/doc.json`) ba'zan eskirgan bo'lishi mumkin — arxivlangan endpointlar ro'yxati
> pastdagi **"Arxivlangan funksiyalar"** bo'limida.
>
> - **Base URL:** deploy qilingan domen (masalan `https://dev.tibstation.uz`), path'lar shu yerda ko'rsatilganidek qo'shiladi (masalan `/web/category`).
> - **Auth:** admin login orqali (`POST /web/auth/admin/login`, email+parol) olingan `access_token`ni `Authorization: Bearer <access_token>` header bilan yuboring. Token muddati tugasa (`401 "access token expired"`), `POST /auth/token/refresh` ga `{"refresh_token": "..."}` yuborib yangi juft token oling (bu endpoint `/web` ostida emas, root'da).
> - **Til:** ko'p javoblarda matnlar tilga bog'liq bo'lsa, `Accept-Language: uz|ru|en` header yuboriladi (default `uz`).
> - **Pagination:** ro'yxat endpointlari odatda `limit`, `page` query parametr oladi.
> - **Xatolik formati:** xatolik bo'lsa `4xx/5xx` status + `{"error": "..."}` shaklidagi JSON qaytadi.
> - Pastdagi "Auth" qatori shu endpoint uchun haqiqatda routerda auth middleware borligini bildiradi (`api/api.go`dagi guruhlashga qarab tekshirilgan, ba'zi joylarda swagger annotatsiyasidan ko'ra ishonchliroq).

---


## Autentifikatsiya (Login/Register/Token)

### `POST /web/auth/admin/login`
**Login admin**
Authenticate admin with login and password
- Auth: kerak emas
**Body** (LoginReq) (majburiy):
  - `login`: string
  - `password`: string
**Javob (200):**
- `access_token`: string
- `id`: string
- `refresh_token`: string
- `role`: string

### `PUT /web/auth/password/change`
**Change password**
Change password
- Auth: kerak (Bearer token)
**Body** (ChangePasswordBody) (majburiy):
  - `confirm_password`: string
  - `new_password`: string
  - `old_password`: string
**Javob (200):**
`string`

### `PUT /web/auth/password/refresh`
**Refresh password**
Refresh password
- Auth: kerak (Bearer token)
**Body** (RefreshPasswordReq) (majburiy):
  - `role`: string
  - `user_id`: string
**Javob (200):**
- `password`: string
- `user_id`: string

## Adminlar

### `GET /web/admin`
**Get all admins**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `login` (query, string): Login
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `admins`: AdminRes[]
- `count`: integer

### `POST /web/admin`
**Create admin/employee**
Yangi admin panel foydalanuvchisi (xodim) qo'shish, rol biriktirish
- Auth: kerak (Bearer token)
**Body** (AdminCreateReq) (majburiy):
  - `login`: string
  - `partner_id`: string
  - `password`: string
  - `role_id`: string
**Javob (200):**
`string`

### `GET /web/admin/profile`
**Get my admin profile**
Tokendagi id bo'yicha o'z profilini olish
- Auth: kerak (Bearer token)
**Javob (200):**
- `created_at`: string
- `id`: string
- `login`: string
- `partner_id`: string
- `partner_name`: string
- `role_id`: string
- `role_name`: string
- `updated_at`: string

### `GET /web/admin/{id}`
**Get admin by ID**
Get a admin by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Admin ID
**Javob (200):**
- `created_at`: string
- `id`: string
- `login`: string
- `partner_id`: string
- `partner_name`: string
- `role_id`: string
- `role_name`: string
- `updated_at`: string

### `DELETE /web/admin/{id}/delete`
**Delete admin**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Admin ID
**Javob (200):**
`string`

### `PUT /web/admin/{id}/update`
**Update admin**
login/rol va (ixtiyoriy) parolni yangilaydi
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Admin ID
**Body** (AdminUpdateReq) (majburiy):
  - `id`: string
  - `login`: string
  - `partner_id`: string
  - `password`: string
  - `role_id`: string
**Javob (200):**
`string`

## Rollar (RBAC)

### `GET /web/role`
**Get all roles**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `name` (query, string): Name
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `roles`: RoleRes[]

### `POST /web/role`
**Create a new role**
Admin panel roli (superadmin tizim roli, o'zgartirilmaydi/o'chirilmaydi)
- Auth: kerak (Bearer token)
**Body** (RoleCreateReq) (majburiy):
  - `name`: string
  - `slug`: string
**Javob (200):**
`string`

### `GET /web/role/{id}`
**Get role by ID**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Role ID
**Javob (200):**
- `created_at`: string
- `id`: string
- `is_system`: boolean
- `name`: string
- `slug`: string
- `updated_at`: string

### `DELETE /web/role/{id}/delete`
**Delete role**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/role/{id}/update`
**Update role**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Role ID
**Body** (RoleUpdateReq) (majburiy):
  - `id`: string
  - `name`: string
  - `slug`: string
**Javob (200):**
`string`

## Maxsus ruxsatlar

### `GET /web/custom-permission`
**Get root modules**
- Auth: kerak (Bearer token)
**Javob (200):**
- `count`: integer
- `modules`: CustomPermissionRes[]

### `POST /web/custom-permission`
**Add root or child module**
parent_id bo'sh bo'lsa root modul, berilsa shu modulning bo'lim-moduli (U-Code custom-permission patterni)
- Auth: kerak (Bearer token)
**Body** (CustomPermissionCreateReq) (majburiy):
  - `attributes`: object (key->object)
  - `order_num`: integer
  - `parent_id`: string
  - `title`: string
**Javob (200):**
`string`

### `GET /web/custom-permission/accesses`
**Get modules with a role's current permissions**
role_id majburiy; parent_id berilmasa root modullar, berilsa shu modulning bo'lim-modullari qaytadi
- Auth: kerak (Bearer token)
**Parametrlar:**
- `role_id` (query, string) (majburiy): Role ID
- `parent_id` (query, string): Parent module ID
**Javob (200):**
- `items`: RoleAccessItem[]

### `PUT /web/custom-permission/accesses`
**Grant/revoke a role's permissions for a module**
- Auth: kerak (Bearer token)
**Body** (RoleAccessUpsertReq) (majburiy):
  - `custom_permission_id`: string
  - `delete`: boolean
  - `read`: boolean
  - `role_id`: string
  - `update`: boolean
  - `write`: boolean
**Javob (200):**
`string`

### `GET /web/custom-permission/{id}/children`
**Get child modules of a parent module**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Parent module ID
**Javob (200):**
- `count`: integer
- `modules`: CustomPermissionRes[]

### `DELETE /web/custom-permission/{id}/delete`
**Delete module**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Module ID
**Javob (200):**
`string`

### `PUT /web/custom-permission/{id}/update`
**Update module**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Module ID
**Body** (CustomPermissionUpdateReq) (majburiy):
  - `attributes`: object (key->object)
  - `id`: string
  - `order_num`: integer
  - `title`: string
**Javob (200):**
`string`

## Dashboard/Analitika

### `GET /web/dashboard`
**Get dashboard**
Get dashboard
- Auth: kerak (Bearer token)
**Parametrlar:**
- `type` (query, string): Type (range, day, week, month, year)
- `day` (query, string): Day (YYYY-MM-DD)
- `from` (query, string): From Date (YYYY-MM-DD)
- `to` (query, string): To Date (YYYY-MM-DD)
**Javob (200):**
- `active_subscriptions`: integer
- `active_users`: integer
- `ai_total_cost_usd`: number
- `cases`: integer
- `categories`: integer
- `completed_sessions`: integer
- `users`: integer

## Bo'limlar (Category)

### `GET /web/category`
**Get all categories**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `name` (query, string): Name
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `categories`: CategoryRes[]
- `count`: integer

### `POST /web/category`
**Create a new category**
BACKEND_STRUCTURE.md 2-bo'lim: tibbiy yo'nalishlar (Kardiologiya, Terapiya va h.k.)
- Auth: kerak (Bearer token)
**Body** (CategoryCreateReq) (majburiy):
  - `audience`: string
  - `description`: object (key->string) — ixtiyoriy
  - `icon_url`: string
  - `is_active`: boolean — `false` bo'lsa bo'lim mobil ro'yxatlardan va AI mashqdan chiqib ketadi
  - `name`: object (key->string)
  - `order_num`: integer
**Javob (200):**
`string`

### `GET /web/category/{id}`
**Get category by ID**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Category ID
**Javob (200):**
- `audience`: string
- `created_at`: string
- `icon_url`: string
- `id`: string
- `name`: object (key->string)
- `order_num`: integer
- `updated_at`: string

### `DELETE /web/category/{id}/delete`
**Delete category**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/category/{id}/update`
**Update category**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Category ID
**Body** (CategoryUpdateReq) (majburiy):
  - `audience`: string
  - `description`: object (key->string)
  - `icon_url`: string
  - `id`: string
  - `is_active`: boolean
  - `name`: object (key->string)
  - `order_num`: integer
**Javob (200):**
`string`

> `GET /web/category*` javoblarida ham `description` va `is_active` keladi.

## Mavzular (Topic)

### `GET /web/topic`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `category_id` (query, string): Category ID
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `topics`: TopicRes[]

### `POST /web/topic`
**Bo'lim ichidagi mavzu yaratish (TZ 6-bo'lim: Bo'lim -> Mavzu -> Keys)**
- Auth: kerak (Bearer token)
**Body** (TopicCreateReq) (majburiy):
  - `ai_hint`: string — ixtiyoriy, AI uchun yo'nalish (masalan "faqat pediatrik holatlar")
  - `category_id`: string
  - `description`: object (key->string) — ixtiyoriy
  - `is_active`: boolean — `false` bo'lsa mavzu mobil ro'yxatlardan va AI mashqdan chiqib ketadi
  - `name`: object (key->string)
  - `order_num`: integer
**Javob (200):**
`string`

### `GET /web/topic/{id}`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Topic ID
**Javob (200):**
- `category_id`: string
- `created_at`: string
- `id`: string
- `name`: object (key->string)
- `order_num`: integer
- `updated_at`: string

### `DELETE /web/topic/{id}/delete`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/topic/{id}/update`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Topic ID
**Body** (TopicUpdateReq) (majburiy):
  - `ai_hint`: string — yuborilmasa (`null`) o'zgarmaydi
  - `category_id`: string
  - `description`: object (key->string)
  - `id`: string
  - `is_active`: boolean
  - `name`: object (key->string)
  - `order_num`: integer
**Javob (200):**
`string`

> `GET /web/topic*` javoblarida ham `ai_hint`, `description`, `is_active` keladi.

## Klinik Case'lar

### `GET /web/case`
**Get all cases (admin)**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `topic_id` (query, string): Topic ID
- `category_id` (query, string): Category ID
- `difficulty` (query, string): easy|medium|hard
- `status` (query, string): draft|published
- `patient_gender` (query, string): male|female
- `is_ai_generated` (query, string): true|false
- `search` (query, string): Search (title/subtitle/chief_complaint)
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `cases`: CaseRes[]
- `count`: integer

### `POST /web/case`
**Create clinical case** — endi bitta qisqa forma, AI qolgan maydonlarni to'ldiradi
- Auth: kerak (Bearer token)

**Admin panel formasi (yaratish):** mavzu (`topic_id` select **yoki** `topic` matn), `difficulty` (default `medium`),
`cover_image_url`, `chief_complaint`, `expected_answer`. Mavzu select'i ham, matni ham bo'sh bo'lsa frontend
"Mavzuni tanlang yoki matn yozing" xatosini ko'rsatadi. Tahrirlash formasi to'liq maydonlar bilan qoladi (vitals, scenario JSON, `max_attempts` va h.k.).

**Xatti-harakat:**
- `title` yuborilmasa va shikoyat / javob / mavzudan kamida bittasi berilgan bo'lsa, backend AI orqali **faqat bo'sh qolgan**
  maydonlarni to'ldiradi (title, subtitle, patient_age, patient_gender, expected_duration_minutes, initial_vitals,
  visual_state, scenario va `chief_complaint` ning yetishmayotgan tillari).
- Admin kiritgan shikoyat, to'g'ri javob va rasm AI tomonidan **o'zgartirilmaydi**. `chief_complaint` `{"uz": "..."}` ko'rinishida yuboriladi; `ru`/`en` ni AI to'ldiradi.
- Frontend to'liq body (title, vitals va h.k.) yuborsa AI chaqirilmaydi, hammasi avvalgidek saqlanadi.
- AI ishlamasa yoki sozlanmagan bo'lsa ham case saqlanadi: sarlavha shikoyatning birinchi 60 belgisidan (shikoyat ham bo'lmasa "Yangi case"), `difficulty` bo'sh bo'lsa `medium`.
- Shikoyat va javob majburiy emas: bo'sh bo'lsa AI o'zi o'ylab topadi. Case har doim `draft` holatda yaratiladi, `Publish` alohida qadam.
- Qo'shimcha maydon: `topic` (string, ixtiyoriy) — mavzu ro'yxatdan tanlanmagan bo'lsa mavzu matni; faqat AI uchun yo'l-yo'riq, bazaga saqlanmaydi (case `topic_id`siz yaratiladi).

```json
POST /web/case
{ "topic_id": "…", "difficulty": "medium", "cover_image_url": "https://…/img.png",
  "chief_complaint": { "uz": "Qorin o'ng pastki qismida og'riq, ko'ngil aynish" },
  "expected_answer": "O'tkir appenditsit" }
```

**Body** (CaseCreateReq) (majburiy):
  - `chief_complaint`: object (key->string)
  - `cover_image_url`: string
  - `difficulty`: string
  - `expected_answer`: string
  - `expected_duration_minutes`: integer
  - `initial_vitals`: CaseVitals
  - `is_ai_generated`: boolean
  - `max_attempts`: integer — bitta sessiyada `question` xabarlari limiti. Yangi case uchun default `1`. Bo'sh yoki `0` yuborilsa default qo'llanadi. `PUT` da `0` yuborilsa saqlangan qiymat o'zgarmaydi.
  - `order_num`: integer
  - `patient_age`: integer
  - `patient_gender`: string
  - `scenario`: object (key->object)
  - `subtitle`: object (key->string) — majburiy emas
  - `title`: object (key->string) — majburiy emas
  - `topic_id`: string
  - `visual_state`: string
**Javob (200):**
`string`

### `POST /web/case/import`
**Excel/CSV dan case yuklash**
- Auth: kerak (Bearer token)
**Body:** `multipart/form-data`, maydon `file` (`.xlsx` yoki `.csv`)
**Ustunlar:** `topic`, `title_uz`, `title_ru`, `title_en`, `difficulty`, `max_attempts` (`max_attempts` ixtiyoriy)
**Javob (200):**
  - `created`: integer
  - `failed`: integer
  - qator xatolari (bo'lsa)

### `POST /web/case/ai-generate`
**AI yordamida keys yaratish (BACKEND_STRUCTURE.md 7-bo'lim)**
- Auth: kerak (Bearer token)
- Admin panelda alohida tugma sifatida ishlatilmaydi (yangi forma `POST /web/case` ni chaqiradi), boshqa mijozlar uchun saqlangan.
- `chief_complaint` (→ `chief_complaint.uz`) va `expected_answer` AI tomonidan o'zgartirilmaydi, aynan yoziladi.
- `GEMINI_API_KEY` yaroqsiz bo'lsa `400 validation_error` ("API key not valid") — kod xatosi emas, serverdagi env'ni yangilash kerak.
**Body** (CaseGenReq):
  - `cover_image_url`: string (ixtiyoriy) — berilsa AI rasmi o'rniga aynan shu saqlanadi
  - `topic_id`: string (ixtiyoriy) — mavzuni ro'yxatdan tanlash
  - `topic`: string (ixtiyoriy) — `topic_id` yoki `topic` dan kamida bittasi
  - `difficulty`: string
  - `chief_complaint`: string (ixtiyoriy)
  - `expected_answer`: string (ixtiyoriy)
  - `source_ids`: string[] (ixtiyoriy; bo'sh — bazadagi barcha manbalar)
**Javob (200):**
`string`

### `POST /web/case/ai-generate-batch`
**Ommaviy AI case generatsiyasi**
- Auth: kerak (Bearer token)
**Body:**
  - `category_id`: string — bo'lim (ichidagi barcha mavzular)
  - `topic_ids`: string[] — aniq mavzular (berilsa `category_id` e'tiborga olinmaydi)
  - `difficulty`: easy|medium|hard
  - `count_per_topic`: integer (default 1)
  - `source_ids`: string[] (ixtiyoriy; bo'sh — barcha manbalar)
**Chegara:** mavzular × count_per_topic ≤ 20, aks holda 400 (formada shu chegarani ko'rsating).
**Javob (200):**
  - `created`: integer
  - `failed`: integer
  - `items`: massiv — `topic_id`, `case_id` yoki `error`

*Izoh: generatsiya sinxron va ketma-ket, har case ~10–30 s. Tugma loading holatida bo'lsin, so'rov timeout'i ~5 daqiqa. Bitta mavzudagi xato qolganlarini to'xtatmaydi (`failed` va `items[].error` ko'rsating). Case'lar `draft` holatida yaratiladi, admin ko'rib chiqib Publish qiladi. Admin panelda: Case ro'yxati toolbar'ida "🤖 Ommaviy AI generatsiya" tugmasi.*

### `GET /web/case-source`
**Ishonchli manbalar (AI case uchun)** — eski modul, alias sifatida ishlashda davom etadi; yangi imkoniyatlar faqat [`/web/source`](#manbalar-websource-ai-bazasi) da. Eski manbalar `type=text`, `status=ready`.
- Auth: kerak (Bearer token)
**Query:** `name`, `limit`, `page`
**Javob (200):** `sources[]` (`id`, `name`, `content`, `created_at`, `updated_at`), `count`

### `POST /web/case-source`
- Auth: kerak (Bearer token)
**Body:** `name` (majburiy), `content` (majburiy — havola yoki matn)

### `GET /web/case-source/{id}`
- Auth: kerak (Bearer token)

### `PUT /web/case-source/{id}/update`
- Auth: kerak (Bearer token)
**Body:** `name`, `content`

### `DELETE /web/case-source/{id}/delete`
- Auth: kerak (Bearer token)

### `GET /web/case/{id}`
**Get case by ID (admin)**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Case ID
**Javob (200):**
- `category_id`: string
- `category_name`: object (key->string)
- `chief_complaint`: object (key->string)
- `cover_image_url`: string
- `created_at`: string
- `difficulty`: string
- `expected_answer`: string
- `expected_duration_minutes`: integer
- `id`: string
- `initial_vitals`: CaseVitals
- `is_ai_generated`: boolean
- `max_attempts`: integer
- `order_num`: integer
- `patient_age`: integer
- `patient_gender`: string
- `scenario`: object (key->object)
- `status`: string
- `subtitle`: object (key->string)
- `title`: object (key->string)
- `topic_id`: string
- `topic_name`: object (key->string)
- `updated_at`: string
- `visual_state`: string

### `DELETE /web/case/{id}/delete`
**Delete case**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/case/{id}/publish`
**Publish case (admin ko'rib chiqib tasdiqlaydi)**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Case ID
**Javob (200):**
`string`

### `PUT /web/case/{id}/update`
**Update case**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Case ID
**Body** (CaseUpdateReq) (majburiy):
  - `chief_complaint`: object (key->string)
  - `cover_image_url`: string
  - `difficulty`: string
  - `expected_answer`: string
  - `expected_duration_minutes`: integer
  - `id`: string
  - `initial_vitals`: CaseVitals
  - `max_attempts`: integer — `0` yuborilsa o'zgarmaydi
  - `order_num`: integer
  - `patient_age`: integer
  - `patient_gender`: string
  - `scenario`: object (key->object)
  - `subtitle`: object (key->string) — majburiy emas
  - `title`: object (key->string) — majburiy emas
  - `topic_id`: string
  - `visual_state`: string
**Javob (200):**
`string`

## AI Promptlari va sinov

### `GET /web/ai-prompt`
**AI promptlarini ko'rish (BACKEND_STRUCTURE.md 7-bo'lim)**
- Auth: kerak (Bearer token)
**Javob (200):**
**[ ] massiv, har bir element:**
  - `key`: string
  - `model_params`: object (key->object)
  - `template`: string
  - `updated_at`: string

### `PUT /web/ai-prompt`
**AI promptni kodni o'zgartirmasdan sozlash**
- Auth: kerak (Bearer token)
**Body** (AIPromptUpsertReq) (majburiy):
  - `key`: string
  - `model_params`: object (key->object)
  - `template`: string
**Javob (200):**
`string`

### `POST /web/ai-prompt/test-debrief`
**Debrief AI'sini bir martalik so'rov bilan sinash (qadamlar logi -> hisobot)**
- Auth: kerak (Bearer token)
**Body** (AITestDebriefReq) (majburiy):
  - `case_id`: string
  - `events`: SimulationEventReq[]
**Javob (200):**
- `cost_usd`: number
- `report`: DebriefReportCreateReq
- `tokens`: integer

### `POST /web/ai-prompt/test-patient`
**Bemor AI'sini bir martalik so'rov bilan sinash ("case yechish"ni tekshirish)**
- Auth: kerak (Bearer token)
**Body** (AITestPatientReq) (majburiy):
  - `case_id`: string
  - `question`: string
**Javob (200):**
- `cost_usd`: number
- `feedback`: string
- `health_delta`: integer
- `is_action`: boolean
- `is_correct`: boolean
- `reply`: string
- `tokens`: integer

### `GET /web/ai-prompt/usage`
**Gemini AI xarajatlari va sarflangan tokenlar (BACKEND_STRUCTURE.md 7-bo'lim)**
- Auth: kerak (Bearer token)
**Javob (200):**
- `total_cost_usd`: number
- `total_tokens`: integer

## Tariflar (Obuna/Coin paket)

### `GET /web/tariff`
**Get all tariff**
Get all tariff with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `duration` (query, integer): Duration
**Javob (200):**
- `count`: integer
- `tariffs`: TariffRes[]

### `POST /web/tariff`
**Create a new tariff**
Create a new tariff with the provided details
- Auth: kerak (Bearer token)
**Body** (TariffCreateReq) (majburiy):
  - `coins`: integer
  - `description`: string
  - `duration`: integer
  - `kind`: string
  - `name`: string
  - `price`: number
**Javob (200):**
`string`

### `GET /web/tariff/{id}`
**Get tariff by ID**
Get a tariff by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Tariff ID
**Javob (200):**
- `coins`: integer
- `created_at`: string
- `description`: string
- `duration`: integer
- `id`: string
- `kind`: string
- `name`: string
- `price`: number
- `updated_at`: string

### `DELETE /web/tariff/{id}/delete`
**Delete tariff**
Delete tariff
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/tariff/{id}/update`
**Update tariff**
Update tariff
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Tariff ID
**Body** (TariffUpdateBody) (majburiy):
  - `coins`: integer
  - `description`: string
  - `duration`: integer
  - `kind`: string
  - `name`: string
  - `price`: number
**Javob (200):**
`string`

## Buyurtmalar/To'lovlar

### `GET /web/order`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `user_id` (query, string): User ID
- `tariff_id` (query, string): Tariff ID
- `status` (query, string): Order Status
- `payment_type` (query, string): Payment Type
- `type` (query, string): range, day, week, month, year
- `day` (query, string): YYYY-MM-DD
- `from` (query, string): YYYY-MM-DD
- `to` (query, string): YYYY-MM-DD
- `page` (query, integer): Page
- `limit` (query, integer): Limit
**Javob (200):**
- `count`: integer
- `orders`: OrderStatisticRes[]

### `GET /web/order/{id}`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Order ID
**Javob (200):**
- `amount`: number
- `coins_used`: integer
- `created_at`: string
- `duration`: integer
- `id`: string
- `paid_at`: string
- `payment_type`: string
- `status`: string
- `tariff_amount`: number
- `tariff_id`: string
- `tariff_name`: string
- `user_id`: string
- `user_name`: string
- `user_phone`: string

## Promokodlar

### `GET /web/promocode`
**Generatsiya qilingan promokodlar ro'yxati (BACKEND_STRUCTURE.md 7-bo'lim)**
- Auth: kerak (Bearer token)
**Parametrlar:**
- `partner_id` (query, string): Partner ID
- `status` (query, string): active|used|expired
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `promocodes`: PromoCodeRes[]

### `POST /web/promocode`
**Hamkor/admin tanga qiymatli promokod yaratadi (TZ 5-6-bo'lim)**
- Auth: kerak (Bearer token)
**Body** (PromoCodeCreateReq) (majburiy):
  - `created_by`: string
  - `expires_at`: string
  - `partner_id`: string
  - `value`: integer
**Javob (200):**
`string`

### `GET /web/promocode/{id}`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): PromoCode ID
**Javob (200):**
- `code`: string
- `created_by`: string
- `expires_at`: string
- `id`: string
- `issued_at`: string
- `partner_id`: string
- `partner_name`: string
- `status`: string
- `used_at`: string
- `used_by`: string
- `value`: integer

### `DELETE /web/promocode/{id}/delete`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

## Hamkorlar

### `GET /web/partner`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `name` (query, string): Name
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `partners`: PartnerRes[]

### `POST /web/partner`
**Hamkor o'quv markazi qo'shish (BACKEND_STRUCTURE.md 7-bo'lim)**
- Auth: kerak (Bearer token)
**Body** (PartnerCreateReq) (majburiy):
  - `description`: object (key->string)
  - `image_url`: string
  - `link_url`: string
  - `name`: string
**Javob (200):**
`string`

### `GET /web/partner/{id}`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Partner ID
**Javob (200):**
- `created_at`: string
- `description`: object (key->string)
- `id`: string
- `image_url`: string
- `link_url`: string
- `name`: string
- `updated_at`: string

### `DELETE /web/partner/{id}/delete`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/partner/{id}/update`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Partner ID
**Body** (PartnerUpdateReq) (majburiy):
  - `description`: object (key->string)
  - `id`: string
  - `image_url`: string
  - `link_url`: string
  - `name`: string
**Javob (200):**
`string`

## Tangalar monitoringi

### `GET /web/coin-transaction`
**Tangalar savdosi monitoringi - tranzaksiyalar ro'yxati**
point_transactions (kind=coin): coin_purchase, category_unlock, referral_reward, promo_redeem, simulation_finish, ai_usage va h.k.
- Auth: kerak (Bearer token)
**Parametrlar:**
- `user_id` (query, string): User ID bo'yicha filter
- `reason` (query, string): Sabab bo'yicha filter (coin_purchase, referral_reward, ai_usage, ...)
- `from` (query, string): 2024-06-01
- `to` (query, string): 2024-06-30
- `page` (query, integer): Page
- `limit` (query, integer): Limit
**Javob (200):**
- `count`: integer
- `transactions`: CoinTransactionRes[]

### `GET /web/coin-transaction/summary`
**Tangalar savdosi monitoringi - umumiy ko'rinish**
Sotib olingan, ishlab topilgan, sarflangan va aylanmadagi jami tanga
- Auth: kerak (Bearer token)
**Javob (200):**
- `coins_in_circulation`: integer
- `total_earned`: integer
- `total_purchased`: integer
- `total_spent`: integer

## Sozlamalar (limit, ovoz)

### `GET /web/setting`
**Tizim sozlamalari (BACKEND_STRUCTURE.md 7-bo'lim: masalan kunlik bepul limit)**
- Auth: kerak (Bearer token)
**Javob (200):**
**[ ] massiv, har bir element:**
  - `key`: string
  - `updated_at`: string
  - `value`: string

### `GET /web/setting/difficulty-reward`
**Qiyinlik koeffitsienti (yulduz/coin)**
- Auth: kerak (Bearer token)
**Javob (200):**
  - `medium_multiplier`: number (default 1.5)
  - `hard_multiplier`: number (default 2)

Yakuniy yulduz/coin = bazaviy mukofot × shu koeffitsient × (final_score / 100). Easy har doim 1x (sozlanmaydi). Sozlanmagan bo'lsa default `1.5` / `2` qaytadi. Sozlamalar sahifasida bitta forma: ikkita son maydon, `PUT` bilan saqlanadi.
Eski global "bazaviy XP/coin" (`GET/PUT /web/setting`) ishlatilmaydi — admin panelda shunday maydon bo'lsa olib tashlang.

### `PUT /web/setting/difficulty-reward`
- Auth: kerak (Bearer token)
**Body:**
  - `medium_multiplier`: number
  - `hard_multiplier`: number

### `PUT /web/setting`
- Auth: kerak (Bearer token)
**Body** (AppSettingSetReq) (majburiy):
  - `key`: string
  - `value`: string
**Javob (200):**
`string`

### `GET /web/setting/coin-rate`
**AI Token-to-Coin tarifi (1000 token uchun tanga miqdori)**
- Auth: kerak (Bearer token)
**Javob (200):**
```json
{
  "coins_per_1k_tokens": 1
}
```

### `PUT /web/setting/coin-rate`
- Auth: kerak (Bearer token)
**Body:**
```json
{
  "coins_per_1k_tokens": 1.5
}
```
*Izoh: `coins_per_1k_tokens` >= 0 bo'lgan kasr yoki butun son. 0 bo'lsa tanga yechilmaydi. Eski qat'iy `case_coin_cost` ("1 case = X tanga") bekor qilingan — o'rniga shu tarif.*
**Javob (200):**
`string` (yoki muvaffaqiyatli saqlangan tarif)

## Qo'shimcha sozlamalar (Pay-as-you-go)

Admin panelda ⚙️ Sozlamalar → "Pay-as-you-go" kartasi. Hammasi `Auth: kerak (Bearer token)`.

| Metod | URL | Izoh |
|---|---|---|
| GET/PUT | `/web/setting/daily-free-coins` | kunlik bepul tangalar (default 10). Har 24 soatda yangilanadi (Toshkent vaqti), to'planmaydi |
| GET/PUT | `/web/setting/coin-rate` | token narxi (yuqorida) |
| GET/PUT | `/web/setting/practice-images` | AI tibbiy tasvir (EKG, rentgen, KT…) yoqish/o'chirish, default **o'chiq**. Yoqilganda case rejimida generatsiya `next` vaqtini 10–30 s uzaytirishi mumkin |

Eski sozlamalar: `daily_free_limit` faqat eski simulyatsiya moduli uchun; `coin_to_uzs_rate` o'chirilgan; `voice_enabled` keyinga qoldirilgan (default `false`).

## Manbalar (`/web/source`, AI bazasi)

AI real-time case/test yaratishda RAG orqali tayanadigan manbalar. Sidebar: "📚 Manbalar (AI bazasi)". Mavzuga ixtiyoriy `ai_hint` beriladi (Topic bo'limiga qarang).

| Metod | URL | Izoh |
|---|---|---|
| POST | `/web/source` | multipart/form-data **yoki** JSON |
| GET | `/web/source` | filtr: `type`, `status`, `category_id`, `topic_id`, `name`, `limit`, `page` |
| GET | `/web/source/{id}` | detal |
| PUT | `/web/source/{id}/update` | `title, language, author, url, is_active, category_ids, topic_ids` |
| POST | `/web/source/{id}/reindex` | qayta indekslash |
| DELETE | `/web/source/{id}/delete` | manba + chunklar |

**Yaratish maydonlari:**

| Maydon | Izoh |
|---|---|
| `title` | majburiy |
| `type` | `book` \| `article` \| `website` \| `text` |
| `file` | multipart: PDF, EPUB, DOCX, TXT, max 50 MB. `book` uchun majburiy; `article` uchun fayl **yoki** `content` |
| `url` | `website` uchun majburiy (http/https) |
| `content` | `text` uchun majburiy; `article` uchun fayl o'rniga |
| `language`, `author` | ixtiyoriy |
| `category_ids`, `topic_ids` | ixtiyoriy. Form'da takroriy maydon yoki vergul bilan (`a,b`). **Bo'sh = umumiy manba** |

Javob: `{"message": "...", "id": "..."}`. Qayta ishlash fonda: `processing` → `ready` | `failed` (sabab `error` maydonida).

- Yuklagandan keyin `GET /web/source/{id}` ni 2–3 s oralig'ida **poll** qiling (`ready`/`failed` bo'lguncha). Admin panelda `processing` qator bo'lsa jadval har 3 s yangilanadi.
- `ready` bo'lsa ham `error` bo'sh bo'lmasligi mumkin ("embedding o'tkazib yuborildi…"): chunklar saqlangan, lekin vektorsiz. "🔄 Qayta indekslash" taklif qiling.
- `failed`: skanerlangan PDF (matn yo'q), noto'g'ri format, sayt ochilmasligi va h.k.
- **`SourceRes`:** `id, title, type, language, author, url, file_url, status, error, is_active, chunk_count, category_ids[], topic_ids[], created_at, updated_at`.
- Bo'lim/mavzuga bog'langan manba faqat shu doirada ishlatiladi (mavzu tanlangan sessiyada: shu mavzu + shu bo'lim + umumiy manbalar; aralash sessiyada bo'limdagi barcha mavzular). `is_active=false` yoki `status != ready` manbalar ishlatilmaydi.
- Tahrirlashda bo'lim/mavzu maydoni umuman yuborilmasa bog'lanish o'zgarmaydi, `[]` yuborilsa tozalanadi.
- Ingestion: PDF (sahifa bo'yicha, `locator = "p. N"`), EPUB (bo'lim), DOCX, TXT, sayt (HTML tozalanadi). Chunk ≈ 600 token, overlap ≈ 100. Fayl o'zi saqlanmaydi, faqat matni.

Admin panel: manba formasi turiga qarab maydonlar o'zgaradi (`book`: fayl; `article`: fayl yoki matn; `website`: URL; `text`: matn), bo'lim/mavzular checkbox ro'yxat.

## AI Practice statistikasi

### `GET /web/practice/stats`
- Auth: kerak (Bearer token)
**Javob (200):** `sessions, active_sessions, items, answered, correct_rate (0..1), tokens, reports, by_category[], by_topic[] ({id, name, sessions, items}), recent_reports[] ({item_id, session_id, kind, reason, created_at})`

Sidebar: "📈 AI Practice" — sessiyalar, javoblar, to'g'ri javoblar ulushi, tokenlar, shikoyatlar kartalari + bo'lim/mavzu bo'yicha va so'nggi shikoyatlar jadvallari. Moderatsiya oldindan yo'q: user `report` qiladi, admin shu yerda ko'radi.

## Fleshkarta statistikasi

### `GET /web/flashcard/stats`
- Auth: kerak (Bearer token)
**Javob (200):** `total_cards`, `total_decks`, `users_with_cards`, `reviews_today`, `generated_today`, `active_reviewers_today`, `mastery_rate` (interval ≥ 21 kun bo'lgan kartalar ulushi), `retention_30d`, `weak_topics[]` (`topic_id`, `name` (ml), `answered`, `wrong_rate` (0..1), `card_count` — xatolardan yaratilgan kartalar). Sidebar: "🃏 Fleshkartalar".

## Fikrlar (Feedback)

Foydalanuvchi `POST /mobile/feedback` orqali yuboradi (ruxsat `user` roliga, limit 10 ta/soat). Sidebar: "💬 Fikrlar".

### `GET /web/feedback`
- Auth: kerak (Bearer token)
**Parametrlar:** `kind` (`general|bug|idea|content|nps`), `status` (`new|seen|done`), `limit`, `page`
**Javob (200)** (jonli serverdan tekshirilgan):
```json
{
  "list": { "total": 2, "page": 1, "limit": 20, "total_pages": 1, "has_previous": false, "has_next": false,
    "data": [ { "id": "…", "user_id": "…", "user_name": "John Adam", "rating": null, "kind": "general",
                "message": "…", "context": "cases", "app_version": "web-1.0.0", "status": "new",
                "created_at": "2026-11-06 14:51:33.157504+00" } ] },
  "summary": { "total": 2, "avg_rating": 0, "new": 2 }
}
```
Ro'yxat `list.data` ichida (yuqori darajada emas), statistika `summary` da. `rating` — `null` bo'lishi mumkin.

### `PUT /web/feedback/{id}/status`
- Auth: kerak (Bearer token)
**Body:** `{ "status": "new" | "seen" | "done" }`

**Mobil yuborish (`POST /mobile/feedback`):** `{ "rating": 1..5 (ixtiyoriy), "kind": "general|bug|idea|content|nps", "message": "…", "context": "practice_session:<id>", "app_version": "1.4.0" }` — baho yoki xabardan kamida biri kerak.

## Bildirishnomalar

### `GET /web/notification`
**Get all notification**
Get all notification with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `title` (query, string): Title
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `notifications`: MasterNotificationRes[]

### `POST /web/notification`
**Create a new notification**
Create a new notification with the provided details
- Auth: kerak (Bearer token)
**Body** (NotificationCreateBody) (majburiy):
  - `message`: object (key->string)
  - `title`: object (key->string)
  - `type`: string
  - `user_id`: string
**Javob (200):**
`string`

### `GET /web/notification/{id}`
**Get notification by ID**
Get a notification by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Notification ID
**Javob (200):**
- `created_at`: string
- `id`: string
- `message`: object (key->string)
- `title`: object (key->string)
- `type`: string
- `updated_at`: string

### `DELETE /web/notification/{id}/delete`
**Delete notification**
Delete notification
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/notification/{id}/update`
**Update notification**
Update notification
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Notification ID
**Body** (MasterNotificationUpdateBody) (majburiy):
  - `message`: object (key->string)
  - `title`: object (key->string)
**Javob (200):**
`string`

## Bannerlar

### `GET /web/banner`
**Get all banner**
Get all banner with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `title` (query, string): Title
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `banners`: BannerRes[]
- `count`: integer

### `POST /web/banner`
**Create a new banner**
Create a new banner with the provided details
- Auth: kerak (Bearer token)
**Body** (BannerCreateBody) (majburiy):
  - `description`: object (key->string)
  - `image_url`: object (key->string)
  - `link_url`: string
  - `order_num`: integer
  - `title`: object (key->string)
**Javob (200):**
`string`

### `GET /web/banner/{id}`
**Get banner by ID**
Get a banner by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Banner ID
**Javob (200):**
- `created_at`: string
- `description`: object (key->string)
- `id`: string
- `image_url`: object (key->string)
- `link_url`: string
- `order_num`: integer
- `title`: object (key->string)
- `updated_at`: string

### `DELETE /web/banner/{id}/delete`
**Delete banner**
Delete banner
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/banner/{id}/update`
**Update banner**
Update banner
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Banner ID
**Body** (BannerUpdateBody) (majburiy):
  - `description`: object (key->string)
  - `image_url`: object (key->string)
  - `link_url`: string
  - `order_num`: integer
  - `title`: object (key->string)
**Javob (200):**
`string`

## Biz haqimizda

### `GET /web/about`
**Get all about**
Get all about with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `title` (query, string): Title
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `abouts`: AboutRes[]
- `count`: integer

### `POST /web/about`
**Create a new about**
Create a new about with the provided details
- Auth: kerak (Bearer token)
**Body** (AboutCreateBody) (majburiy):
  - `description`: object (key->string)
  - `link_url`: string
  - `order_num`: integer
  - `title`: object (key->string)
**Javob (200):**
`string`

### `GET /web/about/{id}`
**Get about by ID**
Get a about by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): About ID
**Javob (200):**
- `created_at`: string
- `description`: object (key->string)
- `id`: string
- `link_url`: string
- `order_num`: integer
- `title`: object (key->string)
- `updated_at`: string

### `DELETE /web/about/{id}/delete`
**Delete about**
Delete about
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/about/{id}/update`
**Update about**
Update about
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): About ID
**Body** (AboutUpdateBody) (majburiy):
  - `description`: object (key->string)
  - `link_url`: string
  - `order_num`: integer
  - `title`: object (key->string)
**Javob (200):**
`string`

## FAQ

### `GET /web/faq`
**Get all faq**
Get all faq with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `question` (query, string): Question
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `faqs`: FaqRes[]

### `POST /web/faq`
**Create a new faq**
Create a new faq with the provided details
- Auth: kerak (Bearer token)
**Body** (FaqCreateBody) (majburiy):
  - `answer`: object (key->string)
  - `order_num`: integer
  - `question`: object (key->string)
**Javob (200):**
`string`

### `GET /web/faq/{id}`
**Get faq by ID**
Get a faq by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Faq ID
**Javob (200):**
- `answer`: object (key->string)
- `created_at`: string
- `id`: string
- `order_num`: integer
- `question`: object (key->string)
- `updated_at`: string

### `DELETE /web/faq/{id}/delete`
**Delete faq**
Delete faq
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/faq/{id}/update`
**Update faq**
Update faq
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Faq ID
**Body** (FaqUpdateBody) (majburiy):
  - `answer`: object (key->string)
  - `order_num`: integer
  - `question`: object (key->string)
**Javob (200):**
`string`

## Kontaktlar

### `GET /web/contact`
**Get all contact**
Get all contact with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `name` (query, string): Name
- `phone_number` (query, string): PhoneNumber
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `contacts`: ContactRes[]
- `count`: integer

### `POST /web/contact`
**Create a new contact**
Create a new contact with the provided details
- Auth: kerak (Bearer token)
**Body** (ContactCreateReq) (majburiy):
  - `link_url`: string
  - `name`: string
  - `phone_number`: string
**Javob (200):**
`string`

### `GET /web/contact/{id}`
**Get contact by ID**
Get a contact by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Contact ID
**Javob (200):**
- `created_at`: string
- `id`: string
- `link_url`: string
- `name`: string
- `phone_number`: string
- `updated_at`: string

### `DELETE /web/contact/{id}/delete`
**Delete contact**
Delete contact
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/contact/{id}/update`
**Update contact**
Update contact
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): Contact ID
**Body** (ContactUpdateBody) (majburiy):
  - `link_url`: string
  - `name`: string
  - `phone_number`: string
**Javob (200):**
`string`

## App Route (ilova ichki linklar)

### `GET /web/app-route`
**Get all appRoute**
Get all appRoute with optional filtering
- Auth: kerak (Bearer token)
**Javob (200):**
- `app_routes`: AppRouteRes[]
- `count`: integer

### `POST /web/app-route`
**Create a new appRoute**
Create a new appRoute with the provided details
- Auth: kerak (Bearer token)
**Body** (AppRouteCreateReq) (majburiy):
  - `app_links`: object
  - `app_version`: object
  - `call_center`: string
  - `payment_min_version`: string
  - `support_url`: string
**Javob (200):**
`string`

### `GET /web/app-route/{id}`
**Get appRoute by ID**
Get a appRoute by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): AppRoute ID
**Javob (200):**
- `app_links`: object
- `app_version`: object
- `buy_course`: boolean
- `call_center`: string
- `created_at`: string
- `id`: string
- `payment_min_version`: string
- `support_url`: string
- `updated_at`: string

### `DELETE /web/app-route/{id}/delete`
**Delete appRoute**
Delete appRoute
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/app-route/{id}/update`
**Update appRoute**
Update appRoute
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): AppRoute ID
**Body** (AppRouteUpdateBody) (majburiy):
  - `app_links`: object
  - `app_version`: object
  - `buy_course`: boolean
  - `call_center`: string
  - `payment_min_version`: string
  - `support_url`: string
**Javob (200):**
`string`

## Statistika (`/web/stats/*`)

Aniq javob tiplari swagger'da (`stats` tegi). Reja va ta'riflar: `TZ_STATISTICS.md` (1-bosqich bajarilgan: moliya, AI xarajati, premium, faollik, foydalanuvchilar).

**Umumiy:**
- Hammasi admin uchun, `Authorization: Bearer <admin token>`.
- Davr: `?from=YYYY-MM-DD&to=YYYY-MM-DD`. Ikkala sana ham kiradi, kun chegarasi Toshkent vaqti bo'yicha.
- Davr berilmasa oxirgi 30 kun olinadi. Eng ko'pi 366 kun. Sana noto'g'ri bo'lsa 400.
- Natija 60 soniya keshlanadi.

| Endpoint | Nima qaytaradi |
|---|---|
| `GET /web/stats/finance` | `FinanceStatsRes`: `revenue_uzs`, `paid_orders`, `ai_cost_usd`, `ai_cost_uzs`, `profit_uzs`, `arpu_uzs`, `arppu_uzs`, `active_users`, `paying_users`, `usd_to_uzs_rate`, `daily[]` (`date`, `revenue_uzs`, `ai_cost_usd`, `ai_cost_uzs`), `by_tariff[]` (`tariff_id`, `name`, `kind`, `sold`, `revenue_uzs`) |
| `GET /web/stats/ai-cost` | `AICostStatsRes`: `total_cost_usd`, `total_tokens`, `calls`, `coins_spent`, `cost_per_coin_usd`, `by_feature[]` (`feature`, `calls`, `tokens`, `cost_usd`), `per_action[]` (`action`: case_session, test_session, simulation, flashcard_deck, roadmap; `count`, `avg_cost_usd`, `avg_coins`), `by_tier[]` (`tier`: free, coin, premium, system; `users`, `calls`, `cost_usd`) |
| `GET /web/stats/premium-cost` | `PremiumCostStatsRes`: `premium_users`, `avg_ai_cost_usd`, `loss_making_users`, `top_spenders[20]` (`user_id`, `name`, `type`, `cost_usd`, `tokens`, `sessions`, `paid_uzs`) |
| `GET /web/stats/engagement` | `EngagementStatsRes`: `dau`, `wau`, `mau`, `dau_mau`, `new_users`, `daily[]` (`date`, `dau`, `new_users`, `sessions`, `flashcard_reviews`), `funnel` (`registered`, `started_session`, `finished_session`, `returned_next_day`, `paid`) |
| `GET /web/user/{id}/stats` | `UserStatsRes`: `daily[]` (oxirgi 30 kun: `date`, `sessions`, `tokens`, `coins_spent`), `top_categories[5]`, `transactions[10]` (`created_at`, `delta`, `reason`, `source`), `orders[10]` |

Atamalar:
- **Tushum**: pul bilan to'langan (`PAID`, `amount > 0`) buyurtmalar. Butunlay tanga bilan yopilgan buyurtma tushumga kirmaydi.
- **Faol foydalanuvchi**: davrda sessiya boshlagan, practice savoliga javob bergan yoki fleshkarta takrorlagan. Faqat login qilish faollik emas.
- **ARPU**: tushum ÷ davrdagi faol foydalanuvchilar. **ARPPU**: tushum ÷ davrda to'lov qilganlar.
- **DAU/WAU/MAU** bugungi kunga nisbatan hisoblanadi, tanlangan davrga bog'liq emas. `dau_mau` 0..1 oralig'ida.
- **Zarar keltirayotgan premium**: umr bo'yi AI xarajati (so'mda) umr bo'yi to'lagan pulidan ko'p bo'lgan premium foydalanuvchi.
- **Voronka**: davrda ro'yxatdan o'tganlar bo'yicha. "Ertasi kuni qaytdi" — ro'yxatdan o'tgan kunining ertasiga faol bo'lgan.
- **`cost_per_coin_usd`**: bepul va tanga bilan ishlaydigan foydalanuvchilar AI xarajati ÷ davrda yechilgan tangalar soni (1 tanganing haqiqiy tannarxi).
- `usd_to_uzs_rate` (default 12800) mavjud `app-setting` orqali o'zgartiriladi.

**Mobil ilova va mini app:** har bir so'rovga `X-Platform: ios | android | web` va `X-App-Version: 1.4.0` headerlari qo'shiladi. Ular foydalanuvchining `platform` va `app_version` maydonlarini to'ldiradi. Yuborilmasa bo'sh qoladi. Admin panel bu headerlarni yubormaydi.

## Foydalanuvchi (qo'shimcha)

### `GET /web/user`
**Get all user**
Get all user with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `name` (query, string): Name
- `phone_number` (query, string): PhoneNumber
- `email` (query, string)
- `created_from`, `created_to` (query, `YYYY-MM-DD`): ro'yxatdan o'tgan sana oralig'i
- `inactive_days` (query, integer): N kundan beri faol emas (hech qachon faol bo'lmaganlar ham kiradi)
- `has_subscription` (query, `true|false`)
- `paid` (query, `true|false`)
- `sort_by` (query): `created_at|last_active|ai_cost|paid|sessions`
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `users`: UserRes[]. Har birida `stats` obyekti:
```json
"stats": {
  "last_active_at": "2026-11-05 14:02:11+05", "sessions_count": 12,
  "ai_cost_usd": 0.42, "ai_tokens": 120000, "coins_spent": 35,
  "paid_uzs": 50000, "orders_count": 1,
  "has_subscription": true, "subscription_until": "2026-12-04 21:16:43+05",
  "signup_method": "telegram", "platform": "android", "app_version": "1.4.0",
  "feedback_count": 2
}
```

### `GET /web/user/{id}`
**Get user by ID**
Get an user by their ID
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string): User ID
**Javob (200):**
- `coins`: integer
- `created_at`: string
- `email`: string
- `id`: string
- `image_url`: string
- `language`: string
- `name`: string
- `phone_number`: string
- `specialization`: string
- `stars`: integer (avval `xp`)
- `updated_at`: string

### `DELETE /web/user/{id}/delete`
**Delete user**
Delete user
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

## Fayl yuklash

### `POST /web/file-upload`
**File upload**
File upload
- Auth: kerak (Bearer token)
**Parametrlar:**
- `file` (formData, file) (majburiy): File
**Javob (200):**
`string`

## Mobil / user-app (ma'lumot uchun)

Admin paneli bu endpointlarni chaqirmaydi (faqat `/web/*`). Kontrakt user-app jamoasi uchun shu yerda. Hammasi `Authorization: Bearer`, `Accept-Language: uz|ru|en`, aks holda aytilmasa.

### ⚠️ Buzuvchi o'zgarishlar

1. **`xp` → `stars`** hamma joyda (eski nom qoldirilmagan): profil `stars`, sessiya `stars_earned`, `point_transactions.kind` `xp` → `stars`. Frontend UI'da "XP" o'rniga "Yulduz". Frontend va backendni bir vaqtda chiqaring (migratsiya `00029_xp_to_stars.sql`).
2. **`coins_used` buyurtmada olib tashlandi:** `POST` order'da `coins_used > 0` → `400 coin_payment_disabled`. Tanga paketlari alohida tarif (`kind=coin_package`).
3. **Ovoz o'chirilgan:** `GET /mobile/setting/voice` default `enabled: false`.
4. **Rate limiting (429)** — pastdagi jadval. `429 too_many_requests` / `otp_locked` ni qayta urinish xabari bilan ko'rsating (`Retry-After` — soniya).
5. **Practice AI tanga yechadi:** `400 insufficient_coins` qayta ishlansin ("Tanga sotib oling" ekrani).
6. **Bo'lim/mavzu:** `is_active=false` mobil ro'yxatlardan va AI mashqdan chiqib ketadi.
7. **CORS:** `Accept-Language` va `X-Captcha-Token` headerlariga ruxsat berilgan.
8. Eski admin case moduli (`/web/case`, `/mobile/simulation`) ishlashda davom etadi, lekin yangi model — AI real-time (practice). Eski simulyatsiya hali eski billing (`daily_free_limit`, `use_coins`) bilan ishlaydi.

### Pay-as-you-go: tanga va kunlik bepul tangalar

Practice (case/test), fleshkarta to'plami buyurtmasi va yo'l xaritasi AI izohi **AI sarflagan tokenga qarab tanga yechadi**: `tanga = ceil(token/1000 × coins_per_1k_tokens)` (admin tarifi, `GET /web/setting/coin-rate`). Tartib: avval **bugungi bepul tangalar** (har 24 soatda yangi, Toshkent vaqti, to'planmaydi), keyin sotib olingan balans. **Premium obunachilardan yechilmaydi.** `coins_per_1k_tokens = 0` bo'lsa hech narsa yechilmaydi.
**Bepul:** fleshkartalarni kunlik takrorlash, qo'lda karta qo'shish, test javobini belgilash (AI chaqirilmaydi).

`GET /mobile/practice/wallet`:
```json
{ "has_subscription": false, "daily_free_coins": 10, "free_coins_left": 7, "coins": 120, "coins_per_1k_tokens": 1 }
```
`free_coins_left + coins` = sarflash mumkin bo'lgan jami.

Eski simulyatsiya (`/mobile/simulation`): limit status javobida `case_coin_cost` o'rniga `coins_per_1k_tokens`; kunlik limit tugagan va `use_coins: true` bo'lsa sessiya tanga hisobidan boshlanadi (balans `> 0` kerak, aks holda `insufficient_coins`); har AI chaqiruvidan keyin sarflangan token (ovoz va debrief ham) tangaga aylantirib yechiladi; event/finish javoblarida `tokens_used`, `coins_spent`; balans tarixida `reason = ai_usage`.

### Practice (`/mobile/practice`)

User bo'lim, mavzu(lar), qiyinlik, rejim (`case` | `test`) tanlab **sessiya** boshlaydi. Har "Keyingisi" da AI manbalardan (RAG) **yangi** case/savol yaratadi. Case — bir martalik javob (AI baholaydi), test — A–D. Ro'yxat uchun `GET /mobile/category`, `GET /mobile/topic?category_id=`.

| Metod | URL | Izoh |
|---|---|---|
| POST | `/mobile/practice/sessions` | sessiya boshlash |
| POST | `/mobile/practice/sessions/{id}/next` | keyingi case/savolni generatsiya qilish |
| POST | `/mobile/practice/items/{id}/answer` | javob yuborish |
| POST | `/mobile/practice/sessions/{id}/finish` | yakunlash |
| GET | `/mobile/practice/sessions` | tarix (`limit`, `page`) |
| GET | `/mobile/practice/sessions/{id}` | tafsilot (javob berilganlarda to'g'ri javob/izoh/manbalar ochiq) |
| POST | `/mobile/practice/items/{id}/report` | `{"reason": "..."}` — noto'g'ri kontent haqida |
| GET | `/mobile/practice/wallet` | hamyon (yuqorida) |

**Boshlash:**
```json
POST /mobile/practice/sessions
{ "mode": "test", "category_id": "…", "topic_ids": ["…"], "difficulty": "medium", "count": 10 }
```
`mode`: `case|test`; `difficulty`: `easy|medium|hard` (default `medium`); `topic_ids` bo'sh = aralash; `count` faqat testda (default 10, 1..50). Case rejimi cheksiz (sessiyada max 50 element). Hamyon bo'sh (va obuna yo'q) bo'lsa `400 insufficient_coins` (`next` va baholash oldidan ham tekshiriladi; test javobi AI chaqirmagani uchun baribir qabul qilinadi).
`PracticeSessionRes`: `id, mode, category_id, topic_ids, difficulty, total_items, generated, answered, correct, status (active|finished|abandoned), score, stars_earned, started_at, finished_at, items[], tokens_used, coins_spent, flashcards_status, flashcards_created`.

**Erkin mavzu:** `category_id` o'rniga `topic_text` (3..200 belgi); `category_id`/`topic_ids` bilan aralashmaydi (400). Mavzu tibbiyotga aloqador bo'lmasa `400 topic_not_medical` (sessiya yopiladi).

**`next`:** generatsiya 5–30 s (loading holati, taymaut ≥ 60 s). Javobsiz element bo'lsa `next` yangisini yaratmaydi, o'shani qaytaradi (qayta chaqirish xavfsiz). Javob berilgach backend keyingisini fonda oldindan tayyorlaydi (prefetch). Case rejimida 50 element yaratilgach `409 practice_limit_reached`. Javobdan oldin to'g'ri javob, izoh va manbalar yashirin.
```jsonc
// case
{ "id": "…", "idx": 0, "kind": "case", "answered": false, "chief_complaint": "Ko'kragim siqilyapti…",
  "patient": { "yosh": 55, "jins": "erkak", "anamnez": "…", "korik": "…", "vitals": "…", "tekshiruvlar": "…" }, "sources": [] }
// test
{ "id": "…", "idx": 0, "kind": "test", "answered": false, "question": "…",
  "options": [{"key":"A","text":"…"}, {"key":"B","text":"…"}, {"key":"C","text":"…"}, {"key":"D","text":"…"}], "sources": [] }
```
`patient` — erkin tuzilma (kalitlar AI tanlaydi): kalit-qiymat sifatida ko'rsating.

**AI tibbiy tasvir** (admin yoqsa, case rejimi): `PracticeItemRes` da `image_url`, `image_type` (`ecg|…`), `image_note` ("AI yaratgan illyustrativ tasvir…"). Tasvirni shikoyat ostida ko'rsating, `image_note` ni **doim** yozing. Maydonlar yo'q bo'lsa — rasmsiz case.

**Javob (`answer`):** `{ "answer": "A" }` (test) yoki `{ "answer": "…matn…" }` (case, max 4000 belgi).
```jsonc
{ "item": { "id": "…", "answered": true, "is_correct": true, "score": 100,   // 0..100 (testda 0 yoki 100)
    "verdict": "correct",              // correct | partial | wrong
    "feedback": "…", "correct_answer": "…", "correct_key": "B", "explanation": "…", "user_answer": "A",
    "sources": [ { "source_id": "…", "type": "book|article|website|text", "title": "…", "author": "…", "url": "…(faqat website)", "locator": "p. 12" } ],
    "sources_note": "" },              // sources bo'sh bo'lsa: "Manba topilmadi, javob umumiy tibbiy bilimga asoslangan."
  "session_finished": false, "session": { … } }
```
- "Foydalanilgan manbalar (n)" yig'iladigan blok: `type` bo'yicha belgi (📖 book, 📄 article, 🌐 website), `website` da `url` havola. Manbalar faqat RAG'da haqiqatan promptga kirgan chunklardan shakllanadi (AI o'ylab topmaydi).
- Case: `is_correct = true` faqat `verdict=correct` (score ≥ 85); `partial` (35–84) — qisman, `is_correct=false`; `wrong` < 35.
- Testda oxirgi savolga javob berilganda sessiya avtomatik yakunlanadi (`session_finished: true`).
- `finish`: `score` (ballar o'rtachasi) va `stars_earned`; hech narsa javoblanmasa `status=abandoned`, yulduz yo'q. Yulduz: `Σ(score)/100 × 5 × qiyinlik koeffitsienti` (`medium` 1.5x, `hard` 2x).

**Sessiya yakunida fleshkartalar:** xato/qisman javoblar bo'lsa fonda yangi fleshkartalar yaratiladi: `flashcards_status`: `none` → `pending` → `done` | `failed`; `flashcards_created`. `pending` bo'lsa `GET /mobile/practice/sessions/{id}` ni 2–3 s da poll qiling (odatda 5–20 s). Kartalar "Xatolarim" to'plamiga tushadi.

**Xatolar:**

| Status / slug | Qachon |
|---|---|
| 404 `not_found` | sessiya/element topilmadi yoki boshqa userniki |
| 409 `session_not_active` | sessiya yakunlangan |
| 409 `practice_limit_reached` | test savollari limiti / case rejimida 50 element |
| 409 `item_already_answered` | element allaqachon javoblangan |
| 400 `validation_error` | noto'g'ri format (testda A–D emas) |
| 400 `insufficient_coins` | hamyon bo'sh |
| 400 `topic_not_medical` | erkin mavzu tibbiy emas |
| 502 `practice_generation_failed` | AI case/savol yarata olmadi yoki baholay olmadi (element javobsiz qoladi, qayta yuborsa bo'ladi) |

**Backend tafsilotlari:** RAG — sessiya doirasidagi chunklardan eng mos 12 tasi olinadi, 4 tasi (eng mos 2 + 2 tasodifiy) promptga kiradi; takrorlanmaslik uchun oldingi elementlarning xulosalari beriladi; test aniq 4 ta noyob variant (backend aralashtiradi); case baholash past temperature (0.1), qat'iy mezon; foydalanuvchi matni delimiter ichida beriladi (prompt injection himoyasi); audit: `prompt_version`, `tokens_used`, `source_chunk_ids`, `ai_usage_logs`. Embedding: `gemini-embedding-001` (768), `REAL[]` da (10 mingdan ortiq chunk bo'lsa pgvector tavsiya).

### `GET /mobile/case/random`

Mavzu bo'yicha tasodifiy case ("Keyingi"). **Query:** `topic_id`, `exclude_id` (joriy case, takrorlanmaydi). `topic_id` berilsa yechilmaganlari birinchi; hammasi yechilgan bo'lsa ham case qaytadi. `max_attempts` default `1` (yangi case'lar). Case yaratishda `title`/`subtitle` majburiy emas.

### Reyting

`GET /mobile/user/rating?type=day|week|month|year|total&limit=10&sort=activity|stars`
- `sort`: `activity` (default, davrdagi yakunlangan case soni) | `stars` (davrdagi yulduzlar); boshqa qiymat — 400.
- Har element (`items[]` va `me`): `activity` va `stars`; javobda `sort` ham bor. Teng ball bo'lsa ikkinchi mezon, so'ng ism.
- `type=total` da `stars` = profildagi jami yulduz; `day/week/month/year` da shu davrda ishlab topilgan (Toshkent vaqti).
- Top ro'yxat 30 s keshlanadi (`type`+`sort`+`limit` bo'yicha).
```json
GET /mobile/user/rating?type=week&sort=stars&limit=3
{ "type": "week", "sort": "stars", "limit": 3,
  "items": [{"user_id": "…", "name": "Ali", "image_url": null, "activity": 4, "stars": 180, "rank": 1, "is_me": false}],
  "me": {"user_id": "…", "name": "Vali", "activity": 2, "stars": 40, "rank": 12, "is_me": true} }
```

### Fleshkartalar (`/mobile/flashcard`)

2 tomonlama karta: old (`front`) → flip → orqa (`back` + `sources`). Baholash: `again` (~10 daqiqa), `hard` (~1 kun), `good` (3 → 7 → 21 kun, keyin ×ease), `easy` (7 → 14 kun, keyin o'sadi). Har kartada `next_intervals`: `{"again":0,"hard":1,"good":3,"easy":7}` (kun; `again=0` ≈ 10 daqiqa).

| Metod | URL | Izoh |
|---|---|---|
| GET | `/mobile/flashcard/due?limit=20&deck_id=` | bugungi takrorlash — `{cards[], due_total}` |
| POST | `/mobile/flashcard/cards/{id}/review` | `{ "rating": "good" }` → `{card, next_interval_days, due_at}` — **bepul** |
| GET | `/mobile/flashcard/stats` | `total, due_now, due_today, new, learned, reviews_today, retention_30d, decks` |
| GET | `/mobile/flashcard/decks` | `kind` = `mistakes` / `topic` / `manual`, `card_count`, `due_count` |
| POST | `/mobile/flashcard/decks` | mavzu bo'yicha AI to'plam (**tanga yechadi**), 5..30 karta |
| DELETE | `/mobile/flashcard/decks/{id}` | to'plam va kartalari |
| GET/POST | `/mobile/flashcard/cards` | ro'yxat (`deck_id`, `limit`, `page`) / qo'lda qo'shish `{front, back, deck_id?}` |
| PUT/DELETE | `/mobile/flashcard/cards/{id}` | tahrir `{front?, back?, status?: active\|suspended}` / o'chirish |

Deck buyurtmasi: `{ "category_id": "…", "topic_id": "…"?, "count": 10 }` yoki `{ "topic_text": "Anafilaktik shok", "count": 10 }`. Javob: `{deck, created, tokens_used, coins_spent}`. Xatolar: `400 insufficient_coins`, `400 topic_not_medical`, `502 practice_generation_failed`, `429` (5 ta/10 daqiqa). Old tomoni allaqachon bor karta qo'shilmaydi (`created` kamroq bo'lishi mumkin; qo'lda qo'shishda `409 conflict`). `suspended` karta takrorlashga chiqmaydi.

### AI yo'l xaritasi (`/mobile/roadmap`)

`GET /mobile/roadmap` — **bepul**, har so'rovda hisoblanadi:
```jsonc
{ "map": [ { "category_id": "…", "category_name": {"uz": "…"}, "topic_id": "…", "topic_name": {"uz": "OKS"},
            "answered": 12, "accuracy": 0.58, "mastery": 64,     // 0..100
            "level": "medium",                                   // unexplored | learning | weak | medium | strong
            "last_practiced": "2026-10-25T…", "cards": 9, "cards_due": 2 } ],
  "path": [ { "order": 1, "action": "flashcard_review", "count": 7, "reason": "…" },
            { "order": 2, "action": "test", "category_id": "…", "topic_id": "…", "difficulty": "easy", "count": 10, "reason": "…" },
            { "order": 3, "action": "deck", "topic_id": "…", "count": 10, "reason": "…" },
            { "order": 4, "action": "case", "topic_id": "…", "difficulty": "medium", "reason": "…" } ],
  "summary": "", "is_ai": false, "generated_at": null, "strong_count": 3, "weak_count": 2, "unexplored_count": 5 }
```
- Bilim xaritasi: `level` bo'yicha ranglang; `learning` — ma'lumot kam (< 3 javob).
- O'qish yo'li: `test`/`case` → `POST /mobile/practice/sessions`; `deck` → `POST /mobile/flashcard/decks`; `flashcard_review` → takrorlash ekrani.
- `POST /mobile/roadmap/refresh` — AI har qadamga izoh va `summary` yozadi (**tanga yechadi**, 24 soat keshlanadi, keyin `GET` ham `is_ai: true`). Natija yo'q bo'lsa `400`, hamyon bo'sh bo'lsa `400 insufficient_coins`. Limit 3 ta / 10 daqiqa.

### Auth

**Telegram bot orqali OTP'siz kirish:**
1. `POST /mobile/auth/telegram/start` (public; captcha yoqilgan bo'lsa `X-Captcha-Token`) → `{ "token": "…", "bot_url": "https://t.me/<bot>?start=login_<token>", "expires_in": 300 }`.
2. Ilova `bot_url` ni ochadi. Bot foydalanuvchi kontaktini (bir marta) so'raydi va tasdiqlaydi.
3. Ilova `POST /mobile/auth/telegram/check` `{ "token": "…", "referral_code": "…"? }` ni **2 s da bir** poll qiladi: `{ "status": "pending" }` | `{ "status": "confirmed", "auth": { access_token, refresh_token, role, id } }` | `400 otp_expired` (5 daqiqa o'tgan yoki ishlatilgan → qaytadan `start`). Token bir martalik. Eski OTP oqimi (`/mobile/auth/user/otp/*`) ishlashda davom etadi.

**Hisobga telefon/email ulash (profil):**

| Metod | URL | Izoh |
|---|---|---|
| POST | `/mobile/user/phone/start` | `{token, bot_url, expires_in}` — Telegram orqali tasdiqlash |
| POST | `/mobile/user/phone/confirm` | `{ "token" }` → `pending` / `confirmed`; raqam boshqa hisobda bo'lsa `409 identifier_taken` |
| DELETE | `/mobile/user/phone` | uzish; boshqa kirish usuli bo'lmasa `400 auth_method_required` |
| POST | `/mobile/user/email/send` | `{ "email" }` — kod yuboriladi (3 ta/10 daqiqa); band bo'lsa `409 identifier_taken` |
| POST | `/mobile/user/email/confirm` | `{ "email", "code" }`; `400 invalid_otp` / `otp_expired` / `429 otp_locked` |
| DELETE | `/mobile/user/email` | uzish (kamida bitta boshqa usul qolishi shart) |

Telefonni almashtirish = yangi raqam bilan `phone/start` → tasdiqlash.

**OTP himoyasi:** bitta email/telefonga 5 ta kod / 10 daqiqa (`429 too_many_requests`); 5 ta noto'g'ri urinishdan keyin kod yaroqsiz (`429 otp_locked`).

**Captcha:** `CAPTCHA_SECRET` sozlangan bo'lsa (Turnstile / hCaptcha / reCAPTCHA) `POST /mobile/auth/user/otp/send` va `POST /mobile/auth/telegram/start` da **`X-Captcha-Token`** majburiy; yo'q/yaroqsiz bo'lsa `400 captcha_failed`. Secret sozlanmagan bo'lsa himoya o'chiq. Provayder `CAPTCHA_PROVIDER` (default `turnstile`).

### Rate limiting (429)

Javob: `429 { error: { slug: "too_many_requests" } }` + `Retry-After: <soniya>`.

| Endpoint | Limit |
|---|---|
| Umumiy (har IP) | 600 / daqiqa |
| `POST /web/auth/admin/login` | 10 / 10 daqiqa (IP) |
| `POST /mobile/auth/user/otp/send` | 20 / soat (IP) + 5 / 10 daqiqa (identifikator) |
| `POST /mobile/auth/user/otp/confirm` | 30 / 10 daqiqa (IP) + 5 noto'g'ri urinish |
| `POST /mobile/auth/telegram/start` / `check` | 20 / soat / 120 / daqiqa (IP) |
| `POST /auth/token/refresh` | 60 / daqiqa (IP) |
| Practice: `sessions` / `next` / `answer` | 20 / 20 / 40 per daqiqa (foydalanuvchi) |
| Simulyatsiya `…/event` | 60 / daqiqa (foydalanuvchi) |
| Fleshkarta deck buyurtmasi | 5 / 10 daqiqa (foydalanuvchi) |
| Yo'l xaritasi `refresh` | 3 / 10 daqiqa (foydalanuvchi) |
| Telefon/email ulash | 10 / soat (foydalanuvchi) |
| `POST /mobile/feedback` | 10 / soat (foydalanuvchi) |

### Konfiguratsiya va deploy

Env (hammasi ixtiyoriy, default bor): `TG_BOT_USERNAME` (bo'sh bo'lsa `getMe` dan), `CAPTCHA_PROVIDER`, `CAPTCHA_SECRET` (bo'sh = o'chiq), `RATE_LIMIT_DISABLED` (faqat lokal debug), `GEMINI_API_KEY` (haqiqiy `AIza…`), `GEMINI_MODEL`, `GEMINI_IMAGE_MODEL` (`gemini-3.1-flash-image`), `GEMINI_EMBEDDING_MODEL` (`gemini-embedding-001`).
- Login boti — `NEW_BOT_TOKEN` botining o'zi; backend va bot bitta Redis'dan foydalanadi.
- Migratsiyalar deploy'da avtomatik (`00023` token billing, `00024` practice, `00024…00028` MVP, `00029` xp → stars). `00028` `coin_to_uzs_rate` ni o'chiradi va `voice_enabled=false` qiladi.
- Mavjud foydalanuvchilarga ta'sir: har kim kuniga `daily_free_coins` (default 10) bepul tanga oladi.
- Email va Telegram OTP xabarlari "TibStation" nomida ketadi.

### Qilinmagan / keyingi bosqich

Case'da to'liq dialog, SSE streaming, yuklangan manba fayllarini saqlash (hozir faqat matni, MinIO), tasvir moderatsiyasi, yo'l xaritasi uchun push-eslatma, eski simulyatsiyani yangi hamyonga o'tkazish. Marketing va B2B hamkorlar — kod emas, biznes ishi.

## Arxivlangan funksiyalar

Quyidagilar backendda arxivlangan (dev serverda **404**, 2026-11-05 da tekshirilgan). Swagger'da hali ko'rinishi mumkin, lekin ishlatmang. Admin paneldan ham olib tashlangan.

- O'quv reja: `GET/PUT /mobile/study-plan`
- Promokod (mobil): `GET /mobile/promocode`, `POST /mobile/promocode/redeem` (admin `/web/promocode` ishlashda davom etadi)
- Hamkor (mobil): `GET /mobile/partner` (admin `/web/partner` ishlashda davom etadi)
- Auth tekshiruv: `POST /mobile/auth/user/check`
- Daraja: `GET /mobile/level`, `GET/POST/PUT/DELETE /web/level*`
- Faollik grafigi: `GET /mobile/user/activity`
- Qurilmadan chiqish: `DELETE /mobile/user/device`
- Ketma-ketlik (streak): profildagi `streak_count`, fleshkarta `streak_count` / `longest_streak`
