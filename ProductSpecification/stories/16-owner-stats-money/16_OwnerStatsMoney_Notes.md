# Владелец: Статистика и Деньги — Notes

## Warnings

### Functional
- **S3 superseded:** demo-extras OUT; `inflow_rub` ≡ `revenue_rub`, `operation_count` ≡ число живых. KPI дубли оставляем под раскладку мокапа.
- Центр donut = сумма **показанных** (≤8) срезов, не обязательно вся выручка магазина.
- Дни и «Сегодня»/«Вчера» оба в Asia/Omsk — границы суток единые.

### UI/UX
- Мокапные SBP/касса/карта extras и `buyer_phone` не переносятся.
- Каркасы «Статистика — каркас…» / «Деньги — каркас…» уходят.

### Technical
- WAVE допускал один aggregate; норма этой истории — два GET под две вкладки.
- S3 из **11** («+ демо-строки приходов») для prod снят: без эквайринга extras = выдумка.

## Suggestions & Future

### Functional
- Эквайринг / Сбер / PDF / экспорт — Tier 3, отдельная история.
- Realtime обновление stats после PATCH заказа.

### UI/UX
- Срез «прочее» для хвоста после топ-8.

### Technical
- Материализованные агрегаты, если заказов станет много.

## Technical Notes

### Assets
- Референс: `site/admin` панели stats/money и `renderStats` / `renderMoney` в `admin-catalog.js`.
- React: заменить `StatsShell` / `MoneyShell`.

### Responsive
- 390px: как `admin.css` — KPI 2 колонки, stats-grid 1 колонка.

### Accessibility
- Bars: `role="img"` + aria-label как в мокапе.

### Brand constraints
- Палитра графиков из существующих hex мокапа / токенов; новых tokens.json ключей нет. Hero-блок на вкладке не ставим.
