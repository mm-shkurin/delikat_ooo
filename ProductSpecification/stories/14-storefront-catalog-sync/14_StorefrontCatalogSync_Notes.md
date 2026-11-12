# Витрина = тот же каталог — Notes

## Warnings

### Functional
- Строки корзины, добавленные **до** hide, живут со снимком до ручного удаления — auto-purge OUT (**interview**).
- До зелёного 14 витрина могла показывать hidden — после 14 это баг.
- Staff-порядок SALE→NEW→TOP на витрине **не** переносим; buyer `sale_first` — отдельная семантика **09**.
- Уже открытая панель может кратко держать stale detail после hide — ожидаемо (clean: только новый GET).

### UI/UX
- Копирайт панели на hidden/missing при fetch → **«товар не найден»** (сейчас в ProductPanel другой failed-текст).
- Mobile/desktop вёрстка — отдельная история; в 14 только данные + panel copy.

### Technical
- Фильтр hide — в usecase/repo buyer path, не «надежда на фронт».
- Cart add должен резолвить product через тот же hide-aware get, иначе обход list.
- OpenAPI: обязательное описание GET (live only); не добавлять `hidden` в `ProductSummary`.
- Не добавлять poll/SSE «чтобы панель сама обновилась» — конфликт с clean code / OUT realtime.

## Suggestions & Future

### Functional
- Auto-remove / block checkout for cart lines чьего SKU стал hidden — отдельная история.
- Realtime invalidation — Tier 3 / later, отдельным решением.

### UI/UX
- Отдельная mobile layout story после sync.

### Technical
- ETag / `Cache-Control` на catalog GET — вне 14.

## Technical Notes

### Assets
- Front: `frontend/src/features/catalog/` (grid/panel уже badge + was).
- Back: `CatalogService` / store list+get; cart `get_product`.
- Contract: `store_api.yaml` semantics; admin write остаётся в `admin_api.yaml`.

### Responsive
- Без отдельной вёрстки в 14.

### Accessibility
- Сообщение панели **«товар не найден»** (404) доступно так же, как текущий error/empty панели.

### Brand constraints
- Не трогать hero/landing layout; витрина — существующий chrome **08**.
