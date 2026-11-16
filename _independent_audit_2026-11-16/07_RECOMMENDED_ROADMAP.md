# Recommended roadmap (independent)

Не commitment команды — приоритеты внешнего среза.

## Track A — Docs truth (½–1 день)

Сделать так, чтобы новый агент/человек не начинал Wave 1 SMS:

1. Переписать `BriefProductDescription.md` под «closed through 17 + next wave TBD».
2. Пометить `PARALLEL-WAVE-1.md` как archive / historical.
3. Обновить `ProductSpecification/README.md` (убрать SMS; добавить Wave 3–5 closed).
4. Закрыть/переписать `quality-debt-plan.md`: admin delivered; остаток = Nice (B4, D2, smells).
5. Почистить carryover 08/09/10/11 (httpOnly done, admin open → false).
6. `backend/README.md`: cookie+Bearer dual auth.
7. `CLAUDE.md` / technology: dual OpenAPI + browser tests exist.

## Track B — Gate hygiene (½ дня)

1. Починить F01 contract (`/catalog/live`).
2. Зелёный `python scripts/check_api_contract.py` в CI narrative.
3. Решение по Docker: работать из non-OneDrive clone **или** documented bake script; не полагаться на restart-only.

## Track C — Security before payments (1–2 дня)

1. D2 CSRF story (double-submit или documented accept + threat model).
2. Не стартовать эквайринг, пока cookie write API без явной CSRF политики.

## Track D — Product next wave (через `/story`)

Выбрать и завести backlog (один исход = одна строка):

| Кандидат | Почему из аудита |
|----------|------------------|
| Оплата / эквайринг | OUT везде; блокер «магазин зарабатывает» |
| Телефон в заказе | Убран в 15; ops боль |
| История заказов покупателя | carryover 10 |
| PDF / экспорт owner | Tier 3 WAVE-5 |
| Realtime hide/SKU | 14 OUT; 17 только categories |

Сначала `/story` → `/interview` → spec. **Не** писать спеку «на всё сразу».

## Track E — Quality polish (параллельно)

1. Staff acceptance smoke (`/admin` gate + catalog + orders).
2. RTL на OAuth callback / auth chrome / checkout.
3. B4 alembic packaging.
4. LONG-FUNC / duplication только если мешает следующей фиче.

## Suggested sequence

```
A (docs) → B (contract+docker) → decide: freeze+/sprint-check  OR  D (/story next)
         ↘ C before any payment story
```

## Explicit non-goals сейчас

- Переписывать 01–06 formal specs
- History rewrite ради GIT-BULK
- Pixel parity всего `site/admin` ради галочки
