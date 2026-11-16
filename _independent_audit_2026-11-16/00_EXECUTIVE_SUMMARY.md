# Независимый аудит — Деликат+

**Дата:** 2026-11-16  
**Роль:** внешний эксперт (не участник delivery-loop)  
**HEAD на момент среза:** `8366793` (`main`, sync с `origin/main`)  
**Метод:** чтение ProductSpecification + код + infra + прошлые `_project_audit/*`; живой контракт-чекер; без правок prod-кода.

## Вердикт в одном абзаце

Продуктовая вертикаль **витрина + staff-кабинет (stories 07–17) закрыта и работает как система**. Главный риск сейчас не «недоделанные фичи 1–17», а **документационный дрейф** (Wave 1 / SMS / «до админки»), **дыры гейтов** (контракт WS, Docker+OneDrive, CSRF beyond SameSite), и **пустой backlog** при наличии явных product-gaps (оплата, история заказов, PDF, телефон).

## Оценка зрелости (экспертная, 1–5)

| Область | Балл | Комментарий |
|---------|------|-------------|
| Product delivery 07–17 | **4.5** | Vertical slices закрыты; acceptance тонкий |
| Документация как SoT | **2.5** | stories.md актуален; Brief / PARALLEL / quality-debt / часть carryover — устарели |
| API-контракт | **3.5** | `store_api` + `admin_api` покрывают HTTP; WS `/catalog/live` вне `paths` → CI fail |
| Backend hex | **4.0** | Слои держатся; cart/orders locking есть; alembic path-hack остаётся |
| Frontend | **3.5–4.0** | HttpOnly cookies done (2026-11-15); Stage A ~2.5; smells/long-func |
| Ops / Docker | **2.5** | Stack живой; `--build` с OneDrive ломается |
| Security posture | **3.5** | XSS-токены закрыты; CSRF = SameSite=Lax only |
| Test pyramid | **3.0** | usecase pytest + vitest ок; acceptance = 2 UI теста; staff UI RTL тонкий |

## Топ-5 действий

1. **Docs + OpenAPI truth (½–1 дня):** Brief/PARALLEL/quality-debt/carryover + вычистить SMS/`TokenPair` из `json-contracts.md`/`store_api.yaml` schemas; описать cookie auth в admin+store.
2. **Починить контракт-гейт:** `python scripts/check_api_contract.py` падает на `/api/v1/catalog/live` (`x-websocket` vs `paths.js`).
3. **Docker bake вне OneDrive** — иначе образы отстают от кода.
4. **Решить CSRF story** (D2) до эквайринга.
5. **`/story` на следующую волну** или freeze + `/sprint-check` — backlog пуст, gaps только в prose.

## Что это за папка

Независимый срез. Не заменяет `_project_audit/` (sprint-check) и не меняет `stories.md`.  
Читать дальше: `01_SCOPE_AND_METHOD.md` → findings → roadmap.
