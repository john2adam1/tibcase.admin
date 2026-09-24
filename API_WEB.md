# 🖥️ Admin panel API — Frontend (web) uchun qo'llanma

> **Diqqat:** bu fayl `api/docs/swagger.json` asosida avtomatik generatsiya qilingan
> (`scripts/gen_api_doc.py` skripti orqali — qo'lda tahrirlamang, backend o'zgarsa qayta
> generatsiya qilinadi: `swag init -g api/api.go -o api/docs && python3 scripts/gen_api_doc.py`).
>
> - **Base URL:** deploy qilingan domen (masalan `https://api.tibsphereai.uz`), path'lar shu yerda ko'rsatilganidek qo'shiladi (masalan `/web/category`).
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
  - `icon_url`: string
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
  - `icon_url`: string
  - `id`: string
  - `name`: object (key->string)
  - `order_num`: integer
**Javob (200):**
`string`

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
  - `category_id`: string
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
  - `category_id`: string
  - `id`: string
  - `name`: object (key->string)
  - `order_num`: integer
**Javob (200):**
`string`

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
**Create clinical case**
- Auth: kerak (Bearer token)
**Body** (CaseCreateReq) (majburiy):
  - `chief_complaint`: object (key->string)
  - `cover_image_url`: string
  - `difficulty`: string
  - `expected_answer`: string
  - `expected_duration_minutes`: integer
  - `initial_vitals`: CaseVitals
  - `is_ai_generated`: boolean
  - `order_num`: integer
  - `patient_age`: integer
  - `patient_gender`: string
  - `scenario`: object (key->object)
  - `subtitle`: object (key->string)
  - `title`: object (key->string)
  - `topic_id`: string
  - `visual_state`: string
**Javob (200):**
`string`

### `POST /web/case/ai-generate`
**AI yordamida keys yaratish (BACKEND_STRUCTURE.md 7-bo'lim)**
- Auth: kerak (Bearer token)
**Body** (CaseGenReq) (majburiy):
  - `chief_complaint`: string
  - `difficulty`: string
  - `expected_answer`: string
  - `topic`: string
**Javob (200):**
`string`

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
  - `order_num`: integer
  - `patient_age`: integer
  - `patient_gender`: string
  - `scenario`: object (key->object)
  - `subtitle`: object (key->string)
  - `title`: object (key->string)
  - `topic_id`: string
  - `visual_state`: string
**Javob (200):**
`string`

## Levellar (XP)

### `GET /web/level`
- Auth: kerak (Bearer token)
**Javob (200):**
**[ ] massiv, har bir element:**
  - `badge_image_url`: string
  - `id`: string
  - `level_number`: integer
  - `required_xp`: integer
  - `slug`: string
  - `title`: string

### `POST /web/level`
**Level qo'shish (statik jadval)**
- Auth: kerak (Bearer token)
**Body** (LevelCreateReq) (majburiy):
  - `badge_image_url`: string
  - `level_number`: integer
  - `required_xp`: integer
  - `slug`: string
  - `title`: string
**Javob (200):**
`string`

### `DELETE /web/level/{id}/delete`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Id
**Javob (200):**
`string`

### `PUT /web/level/{id}/update`
- Auth: kerak (Bearer token)
**Parametrlar:**
- `id` (path, string) (majburiy): Level ID
**Body** (LevelUpdateReq) (majburiy):
  - `badge_image_url`: string
  - `id`: string
  - `level_number`: integer
  - `required_xp`: integer
  - `slug`: string
  - `title`: string
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
point_transactions (kind=coin): coin_purchase, category_unlock, referral_reward, promo_redeem, simulation_finish va h.k.
- Auth: kerak (Bearer token)
**Parametrlar:**
- `user_id` (query, string): User ID bo'yicha filter
- `reason` (query, string): Sabab bo'yicha filter (coin_purchase, referral_reward, ...)
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

### `PUT /web/setting`
- Auth: kerak (Bearer token)
**Body** (AppSettingSetReq) (majburiy):
  - `key`: string
  - `value`: string
**Javob (200):**
`string`

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

## Foydalanuvchi (qo'shimcha)

### `GET /web/user`
**Get all user**
Get all user with optional filtering
- Auth: kerak (Bearer token)
**Parametrlar:**
- `name` (query, string): Name
- `phone_number` (query, string): PhoneNumber
- `limit` (query, integer): Limit
- `page` (query, integer): Page
**Javob (200):**
- `count`: integer
- `users`: UserRes[]

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
- `level`: integer
- `name`: string
- `phone_number`: string
- `specialization`: string
- `streak_count`: integer
- `updated_at`: string
- `xp`: integer

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
