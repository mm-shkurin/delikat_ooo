# Prompt — paste into a new Agent chat

```
Ты в репо Деликат (c:\Users\trape\OneDrive\Desktop\delikat_ooo).

Задача этой сессии: закрыть quality debt по плану
`.memory-bank/tasks/quality-debt-plan.md`.
Админ-панель НЕ начинать.

Контекст:
- Wave 1–2 (каталог, OAuth, cart/orders) уже done.
- Отчёт: `_project_audit/sprint-check-2026-11-06-full.md`
  (consistency/smells = 0 из‑за regression).
- Git/test-cases в грейдинге проекта не учитываем.
- Conventions: CONTRIBUTING.md + .memory-bank/steerings/development-conventions.md
- Remote: origin → github.com/mm-shkurin/delikat_ooo.git
- /clear-session всегда заканчивается commit (если есть) + git push.

Сделай Must-фазы из плана (порядок там же):
A1–A5, B1–B3, C3–C4, C5 по возможности, затем E (smoke + sprint-check stage b).
Nice (B4, C1/C2/C6, D httpOnly) — только если Must зелёный и осталось время;
иначе явно оставь в carryover / Needs a task.

Правила:
- Conventional Commits, английский subject; atomic commits.
- Параллель back/front — через git worktree, не в одной грязной папке.
- После правок frontend/infra/backend образов: docker compose up -d --build.
- Не ломай: guest delikat_session, locked checkout + Idempotency-Key,
  adapters не импортят application, OAUTH_PROVIDER=fake в .env.example.
- Не коммить .env / секреты.

Старт: прочитай план + sprint-check report + carryover 08/10,
затем backlog Must → правки → verify → /clear-session с push.
В конце одной строкой: что осталось до админки.
```
