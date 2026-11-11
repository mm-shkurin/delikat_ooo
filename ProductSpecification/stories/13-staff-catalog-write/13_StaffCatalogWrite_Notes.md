# Staff: CRUD каталога — Notes

## Warnings

### Functional
- В 13 витрина может ещё показывать скрытый SKU — ожидаемо до **14**.
- Мок 11 знает NEW|SALE; prod шире (TOP) + порядок SALE→NEW→TOP→null.
- SALE без `compare_at` > price — валидация блокирует save.
- `created_at` в list DTO; immutability на edit — в AC (SKU не прыгает внутри группы).

### UI/UX
- Референс `site/admin/` без TOP и без % скидки в строке — React добавляет; мок не переводим на fetch.
- Toolbar «Категория» и «Сбросить к витрине» из мока — **OUT** в 13.

### Technical
- Лимит размера/MIME upload — в api-spec (без лимита риск раздувания Postgres).
- Anonymous image GET удобен для `<img>` и будущей витрины; не светить другие staff-поля на том же path.

## Suggestions & Future

### Functional
- Bulk hide / CSV import — не в 13.
- Витрина: тот же badge-sort и SALE % — **14** (если ещё нет на buyer GET).

### UI/UX
- Drag-sort SKU — не в 13.

### Technical
- Позже blobs → object storage без смены публичного `image_url`.

## Technical Notes

### Assets
- UI ref: `site/admin/`, `site/js/admin-catalog.js`, `site/css/admin.css`.
- React: `/admin/catalog` live panel.
- API: `admin_api.yaml`; schema fields align with store `ProductSummary` + staff `hidden`.

### Responsive
- ~390px: одна колонка; actions/badge/dialog не обрезаны.

### Accessibility
- Field-level validation; dialog focus как shell **12**.

### Brand constraints
- Manrope / Oswald + tokens кабинета **12**; без публичной ссылки «Админ».
