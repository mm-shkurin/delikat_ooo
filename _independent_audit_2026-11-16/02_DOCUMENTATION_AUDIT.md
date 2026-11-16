# Documentation audit

## Карта статуса (факт)

| # | Interview | Formal story-spec | В `stories.md` |
|---|-----------|-------------------|----------------|
| 01–06 | да | нет (эталон `site/`; не блокер) | Backlog UI reference / closed via 08/10 |
| 07–09, 12–17 | да | да (`NN_*.md`) | **Done / closed** |
| 10 | да | `story-spec.md` (не PascalCase) | Done |
| 11 | да | нет (mock-only + `decisions.md`) | mock-done |

`INTERVIEWS.md` согласован со `stories.md`: **следующее = новая волна или стабилизация**.

## Устаревшие корневые доки (P1)

### `ProductSpecification/BriefProductDescription.md`

- Всё ещё «Wave 1» и **«Account SMS + JWT»** для story 07.
- Факт: OAuth pivot (см. `07` carryover / `technology.md`).
- Нет упоминания Wave 3–5 / staff / закрытия 12–17.

### `ProductSpecification/PARALLEL-WAVE-1.md`

- Описывает OTP/SMS фазы 07.2 — исторический артефакт, выглядит как актуальный план.

### `ProductSpecification/README.md`

- Таблица Wave 1: «бэк: каркас + **SMS**».
- Нет указателя, что Wave 3–5 закрыты.

### `.memory-bank/tasks/quality-debt-plan.md`

- Заголовок: **«before admin panel»**.
- Next: «admin catalog = story 11… next `/story-spec 11`».
- D1 HttpOnly помечен DONE 2026-11-15, но рамка документа всё ещё «до админки», хотя 12–17 уже в `main`.

### Carryover drift

| Файл | Устаревший тезис |
|------|------------------|
| `stories/10-…/carryover.md` | «Admin catalog… API/React **still open**» — false после 12–17 |
| `stories/08-…/carryover.md` | «Still open… **httpOnly JWT cookies**» — D1 done 2026-11-15 |
| `stories/11-…/carryover.md` | Nice D httpOnly — устарело |
| `stories/09-…/carryover.md` | «admin write вне OpenAPI» — сейчас в `admin_api.yaml` |

## Актуальные доки (держать как SoT)

- `stories.md` — лучшая карта закрытия
- `INTERVIEWS.md` — честный next step
- `WAVE-3-ADMIN.md` — хорошая историческая карта; статус 2026-11-15 верный
- `api-specs/README.md` — корректный dual-YAML (store + admin)
- `frontend/README.md` — HttpOnly cookies описаны правильно
- Per-story `NN_*.md` + `endpoints.md` для 12–17 — рабочие

## Naming / process smells

1. Story **10** спека = `story-spec.md`, не `10_CartOrdersApi.md` — ломает единообразие.
2. Story **11** без formal story-spec — ок для mock, но `WAVE-3` всё ещё учит «не писать один spec на весь кабинет» — выполнено.
3. `technology.md` «browser-testing: selenium-or-playwright-tbd» — acceptance уже на pytest+browser, статус TBD врёт.
4. Dual OpenAPI (`store_api` + `admin_api`) — осознанно (вариант B из WAVE-3); CLAUDE.md всё ещё говорит «контракт: store_api.yaml» в единственном числе.

## Вывод по докам

Документация **пережила продукт**. Delivery обогнал Brief/PARALLEL/quality-debt/часть carryover. Новый человек по Brief решит, что SMS и Wave 1 — текущая цель, а кабинет не начат.
