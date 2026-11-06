---
name: backend-delivery
description: >-
  Hexagonal backend Delikat — test-spec Tier1, usecase fakes, refactor commit.
  Use for /backend-delivery [story] [phase], e.g. /backend-delivery 07.2 or /backend-delivery 09.
disable-model-invocation: true
---

# /backend-delivery

```
application → adapters → usecase → domain
```

Полоса бэкенда. Парная: `/frontend-delivery`. Рамка: `/delivery-loop`.

## Usage

```
/backend-delivery              # первая незакрытая backend-единица из stories.md + progress.md
/backend-delivery 07           # текущий открытый этап story 07 (07.1 … 07.5)
/backend-delivery 07.2         # конкретный этап (если предыдущие зелёные)
/backend-delivery 09           # story 09 целиком (без подэтапов)
/backend-delivery 10           # story 10 cart + orders (hex)
```

**Один вызов = один этап** (07.N) или одна story без подэтапов. После — Verify → `/refactor` → коммиты, стоп.  
Между этапами: `/clear-session` → New Chat → `/backend-delivery 07.3`.

Альтернатива: `/continue 07` (те же чекбоксы в `progress.md`).

## Карта backend-историй

| Story | Папка спеки | Подэтапы | OpenAPI / endpoints |
|-------|-------------|----------|---------------------|
| **07** | `ProductSpecification/stories/07-store-backend-api/` | **07.1 → 07.5** | auth + guest cookie — [endpoints.md](../../../ProductSpecification/stories/07-store-backend-api/endpoints.md) (subset) |
| **09** | `ProductSpecification/stories/09-backend-catalog/` | нет (один delivery) | GET catalog/* |
| **10** | `ProductSpecification/stories/10-cart-orders-api/` | нет (один delivery) | cart/* + POST orders |

Wave 1: `ProductSpecification/PARALLEL-WAVE-1.md`.

Эталон кода: `../adaptive-tutor/backend/` (account, adapters, application).

## Общий режим (любая story)

```
interview → story-spec → [api-spec] → /spec-skeptic → /test-spec (01_API + tiers)
      → usecase (+ports) + fakes → adapters → application wiring → pytest
      → /refactor (отдельный коммит)
```

### Перед кодом (gate)

1. Прочитать `.cursor/guidelines/coding-rules.md` + `coding-detail.md`.
2. `stories/NN/tests/01_API_Tests.md` (и Security при auth) — Tier 1 разрешён; `Tier: ?` = стоп → `/test-spec`.
3. Кодить только Tier 1, затем Tier 2; Tier 3 не реализовывать.

### Правила слоя

- Тесты **сначала** usecase с fakes (`backend/usecase/tests/`) под сценарии Tier 1.
- FastAPI / SQLAlchemy **только** `backend/adapters/`.
- Контракт: `store_api.yaml`; drift = YAML + adapter в одном коммите.
- `python scripts/check_api_contract.py` при HTTP paths / paths registry.
- Файлы ≲ ~200 строк; не раздувать usecase «на всякий случай».

## Алгоритм сессии

1. **Resolve** — номер story и этап из аргумента или первый `[ ]` / `[~]` в `stories/NN-*/progress.md` (секция Back).
2. **Gate** — (a) для **07.N** (N>1): этап **07.(N−1)** `[x]`; (b) test-spec Tier 1 для полосы готов.
3. **Read** — guidelines, `NN_*.md`, `interview.md`, `tests/01_API_Tests.md`, `endpoints.md`, YAML.
4. **Implement** — только scope этапа; **не** монолитом всю story 07.
5. **Verify** — команды из runbook; sanity fail once где указано.
6. **Refactor** — `/refactor` на touched files; **отдельный** коммит.
7. **Docker** — `cd infra && docker compose up -d --build backend` при Docker-dev.
8. **Update** — `[x]` в progress; колонки Back в `stories.md`.
9. **Commit** feature: `git commit -m "feat(NN): ..." -- backend ProductSpecification`  
   затем refactor: `git commit -m "refactor(NN): ..." -- backend`.

## Запрещено

- Монолит `backend/app/routes+models+seed` одним PR.
- Import adapter / FastAPI / SQLAlchemy из `usecase/` или `domain/`.
- Implement без `/test-spec` (кроме чистого каркаса 07.1 — там test-spec минимальный smoke).
- Feature+refactor в одном коммите.
- JWT/HTTP в рамках этапа **07.2**; cart/catalog в **07**.
---

## Story 07 — runbooks по этапам

Спека: [07_BackendAuthSms.md](../../../ProductSpecification/stories/07-store-backend-api/07_BackendAuthSms.md#этапы).  
Трекинг: [progress.md](../../../ProductSpecification/stories/07-store-backend-api/progress.md).

### 07.1 — Каркас application

**DoD:** `uvicorn` поднимает app; Postgres доступен; Alembic **init** (без таблиц account — они в 07.3); CORS `5173` + `8767`, credentials; каталоги hex на месте.

**Создать (минимум):**

```
backend/
  domain/__init__.py
  usecase/__init__.py
  usecase/tests/
  adapters/http/
  adapters/db/
  adapters/sms/
  adapters/security/
  application/main.py    # FastAPI app, CORS, GET /health или /
  application/settings.py
  pyproject.toml или requirements + README команды
```

**Wiring:** Docker Postgres (`infra/`), строка подключения в settings; Alembic env указывает на `adapters/db`.

**Verify:**

```bash
cd infra && docker compose up -d postgres
cd backend && uvicorn application.main:app --reload --port 8000
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health   # 200
```

**Не делать:** auth routes, usecase account, миграции users/otp.

---

### 07.2 — Domain + ports + OTP usecase (без JWT, без HTTP)

**DoD:** `request_phone_code` + `verify_phone_code` (verify **без** token pair); dev SMS; pytest + fakes.

**Создать:**

```
backend/domain/account/          # User, PhoneE164 value object, errors
backend/usecase/account/
  ports.py                       # SmsSender, OtpRepository, UserRepository (минимум)
  errors.py
  request_phone_code.py
  verify_phone_code.py           # успех → user/account DTO, не JWT
backend/adapters/sms/dev.py
backend/usecase/tests/account/
  fakes.py
  test_request_phone_code.py
  test_verify_phone_code.py      # happy + wrong/expired OTP
```

**Правила:** validation +7 E.164, sms 4–6 digits; dev `0000` в config SMS adapter.

**Verify:**

```bash
cd backend && pytest usecase/tests/account -q
```

**Не делать:** `TokenIssuer`, `RefreshTokenStore`, FastAPI routes, Alembic account tables.

---

### 07.3 — JWT + refresh + DB repos

**DoD:** verify дополнен → token pair; logout отзывает refresh; repos + миграции.

**Создать / дополнить:**

```
backend/usecase/account/ports.py     # + TokenIssuer, RefreshTokenStore
backend/usecase/account/verify_phone_code.py  # или session.py — issue tokens
backend/usecase/account/logout.py
backend/adapters/security/jwt.py     # TTL в config
backend/adapters/db/
  models.py, repos (user, otp, refresh)
  alembic/versions/...               # baseline account schema
backend/usecase/tests/account/       # tokens + logout
```

**Verify:**

```bash
cd backend && pytest usecase/tests/account -q
# опционально: alembic upgrade head против dev Postgres
```

**Не делать:** HTTP routes (07.4).

---

### 07.4 — HTTP adapter auth

**DoD:** OpenAPI auth subset; `{ "code", "message" }`; Bearer на `/me` и logout.

**Routes (thin → usecase):**

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/phone/request` |
| POST | `/api/v1/auth/phone/verify` |
| GET | `/api/v1/me` |
| POST | `/api/v1/auth/logout` |

**Создать:** `adapters/http/auth_router.py`, error mapper, dependency Bearer; регистрация в `application/main.py`.

**Verify:**

```bash
cd backend && pytest usecase/tests/account -q
# ручной или скрипт:
# request → verify (dev code) → GET /me Authorization Bearer → logout
python ../scripts/check_api_contract.py   # когда paths зарегистрированы в CI registry
```

**Не делать:** guest cookie (07.5), catalog.

---

### 07.5 — Guest cookie middleware

**DoD:** `delikat_session` HttpOnly, SameSite=Lax; Set-Cookie на анонимном запросе; **без** merge cart (story 10).

**Создать:** middleware в `application/`; при необходимости port SessionStore stub.

**Verify:**

```bash
curl -i http://127.0.0.1:8000/api/v1/catalog/categories   # или любой публичный GET после 09
# ожидание Set-Cookie: delikat_session=... на первом визите (если route уже есть — иначе временный GET на app)
```

После **07.5** — закрыть story 07 в `stories.md` (Back = done), если spec-skeptic пройден.

---

## Story 09 — один delivery

Спека: [09_BackendCatalog.md](../../../ProductSpecification/stories/09-backend-catalog/09_BackendCatalog.md).

**Зависит от:** **07.1** (application/DI); HTTP catalog можно после **07.4**.

**Режим:** domain catalog → usecase → db repos + seed → http GET catalog/* → usecase pytest.

**Verify:** `pytest usecase/tests/catalog` (или аналог); GET categories/products против seed.

**Не делать:** cart, auth business logic.

---

## Story 10 — один delivery

Спека: [story-spec.md](../../../ProductSpecification/stories/10-cart-orders-api/story-spec.md).

**Зависит от:** **07.5** (guest cookie), **09** (product lookup).

**Режим:** domain cart → usecase `CartService` → Postgres repos → HTTP cart/* + orders → pytest fakes.

**Verify:** `pytest usecase/tests/cart -q`; curl checkout с cookie + Idempotency-Key.

---

## Коммиты

```
backend ProductSpecification
```

С acceptance, когда есть `acceptance/` для auth.

## Ссылки

- `CLAUDE.md`, `backend/README.md`
- `ProductSpecification/api-specs/store_api.yaml`, `json-contracts.md`
