# 16 Owner stats / money — API Endpoints

Контракт кабинета: [`admin_api.yaml`](../../api-specs/admin_api.yaml).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/staff/stats` | owner | KPI + срезы «кто / что» |
| GET | `/api/v1/staff/money` | owner | Выручка, топы, лента приходов |

Нет Bearer → **401**. Не-staff Bearer и staff не-owner → **403** `forbidden`.

Оба GET без query и без страниц. Источник — заказы со статусом ≠ `cancelled`.

## Stats

Тело:

```json
{
  "order_count": 0,
  "buyer_count": 0,
  "buyer_slices": [{ "label": "Гость", "value_rub": 0 }],
  "product_slices": [{ "label": "…", "value_rub": 0 }]
}
```

Срезы: `value_rub` убыв., `label` возр. (`ru`). Сервер массив не обрезает до 8.

Ключ покупателя: trim `buyer_name`, пусто → «Гость».  
Ключ товара: trim `product_name`, пусто → «Без названия»; значение — сумма `line_total_rub`.

## Money

Тело:

```json
{
  "revenue_rub": 0,
  "avg_check_rub": 0,
  "inflow_rub": 0,
  "operation_count": 0,
  "revenue_by_day": [{ "day": "2026-11-15", "label": "15 нояб.", "value_rub": 0 }],
  "top_by_qty": [{ "label": "…", "quantity": 0 }],
  "inflows": [{
    "id": "pay-…",
    "at": "2026-11-15T12:00:00+06:00",
    "title": "Оплата заказа",
    "subtitle": "Гость · № 01234567",
    "amount_rub": 0,
    "channel": "Онлайн-оплата"
  }]
}
```

All-time, без фильтра дат.  
`day` — календарный день Asia/Omsk (`YYYY-MM-DD`), сортировка возр.  
Заголовки ленты «Сегодня»/«Вчера» тоже по Asia/Omsk.  
`top_by_qty`: `quantity` убыв., `label` возр.  
`inflows`: один на живой заказ; `at` убыв., `id` возр.  
`channel`: pickup → «Наличные / карта в точке», иначе «Онлайн-оплата».  
**S3 superseded:** демо-extras мокапа нет; без эквайринга `inflow_rub` = `revenue_rub`.
