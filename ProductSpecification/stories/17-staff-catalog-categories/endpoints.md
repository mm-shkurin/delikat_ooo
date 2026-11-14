# 17 Staff catalog categories — API Endpoints

Запись: [`admin_api.yaml`](../../api-specs/admin_api.yaml).  
Публичный список и фильтр: [`store_api.yaml`](../../api-specs/store_api.yaml).  
Сокет не HTTP-path: блок `x-websocket` в `store_api.yaml`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/staff/catalog/categories` | owner, manager | Все категории + `product_count` |
| POST | `/api/v1/staff/catalog/categories` | owner, manager | Создать. Id только здесь |
| PATCH | `/api/v1/staff/catalog/categories/{category_id}` | owner, manager | Только `title` |
| DELETE | `/api/v1/staff/catalog/categories/{category_id}` | owner, manager | Стереть категорию и все её SKU |
| PUT | `/api/v1/staff/catalog/categories/order` | owner, manager | Полный порядок id |
| GET | `/api/v1/catalog/categories` | none | Как **09**: `id`, `title`, `sort_order`. Без счётчика |
| GET | `/api/v1/catalog/products` | none | `category_id` — любой существующий id или omit |
| WS | `/api/v1/catalog/live` | none | Кадр `catalog_changed` после записи категории |

Cashier, не-staff → **403**. Нет Bearer на staff-путях → **401**. Публичные GET и сокет без токена.

`PUT .../order` объявлять раньше `.../{category_id}`.

## Staff category

| Field | Rule |
|-------|------|
| id | create only; `^[a-z][a-z0-9-]{0,31}$`; не `all`; unique |
| title | trim; 1…120; длиннее не писать |
| sort_order | уникален; пустая таблица → 1; иначе max+1 в той же записи, дырку не заполнять |
| product_count | все SKU, скрытые входят |

Список: `sort_order`, затем `id` asc.

Create body: `{ "id", "title" }` → **201** категория.  
Patch body: `{ "title" }` → **200**.  
Delete → **204**. Товары категории исчезают. Заказы и корзина не меняются.  
Order body: `{ "ids": ["sauce", "beef"] }` — все текущие id ровно один раз. Успех переписывает `sort_order` с 1 по N и возвращает список.

## Errors

| Case | HTTP | code |
|------|------|------|
| кривой id, пустой или длинный title, дырявый порядок | 400 | `validation_error` |
| id занят | 400 | `category_id_taken` |
| id `all` | 400 | `category_id_reserved` |
| нет категории на patch/delete | 404 | `category_not_found` |
| cashier / не-staff | 403 | `forbidden` |
| нет токена | 401 | `unauthorized` |

Публичный список товаров: неизвестный или кривой `category_id` → **400** `validation_error`. Omit = все. `all` клиент не шлёт.

## WebSocket

`/api/v1/catalog/live`, без staff-токена.

Сервер шлёт кадр только после успешного create / rename / reorder / delete категории, когда запись уже видна следующему GET:

```json
{ "type": "catalog_changed" }
```

В кадре нет товаров, нет `hidden`, нет `product_count`. Hide и правка одного SKU кадр не шлют.

Клиент: отменяет незавершённые GET категорий, товаров и «Показать ещё»; ответ старого поколения не применяет. Сначала категории. Если выбранного id нет — фильтр «Все» без `category_id`. Затем товары `offset=0`, `limit` = max(16, уже показанные карточки), не больше 100. Цена, свойства, sort и `#sale` не сбрасываются. **400** по выбранной категории сбрасывает фильтр на «Все» и повторяет список; экран «Каталог сейчас недоступен.» из этого пути не ставится. Обрыв: подписаться снова и пройти тот же порядок.
