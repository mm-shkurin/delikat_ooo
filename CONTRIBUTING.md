# Как здесь работать

Правила ведения взяты с textery и подогнаны под монорепо Деликат. Подробности —
`.memory-bank/steerings/development-conventions.md`.

## Прежде чем коммитить

Локально прогоняй то, что реально есть в CI (`.github/workflows/rules.yml`):

```bash
# backend
cd backend && pytest usecase/tests -q

# frontend
cd frontend && npm run ci

# контракт API (корень)
python scripts/check_api_contract.py
```

Красный гейт чинится по причине. Пороги линта/тестов **не понижаются**, чтобы
сборка стала зелёной — понижение только отдельным коммитом с причиной.

После правок `frontend/` / `infra/` / образов — пересборка Docker из `infra/`:

```powershell
docker compose up -d --build
```

## Ветки и коммиты

Pull request'ов как поверхности ревью нет. Работа в ветке с обязательным префиксом
(`feat/…`, `fix/…`, `chore/…`, `task/…`, `features/story-NN-…`), в `main` — слиянием
ветки. **Сообщение коммита — единственная поверхность ревью**: в нём *почему*, не *что*.

- Conventional Commits: `feat(scope):`, `fix(scope):`, `refactor(scope):`,
  `test(scope):`, `docs(scope):`, `style(scope):`, `chore(scope):`, `build(scope):`.
- Один коммит — одно логическое изменение. Рефакторинг отдельно от поведения.
- Тема коммита — **по-английски**, тело — RU или EN.

## Границы

- **200 строк на файл** — жёсткий предел; делить по смыслу.
- Тесты не удаляются и не уходят в `skip`, чтобы что-то стало зелёным.
- Заглушки вместо реальной логики — не решение задачи.

## Параллель back / front

Две сессии на одной истории — через `git worktree`, не в одной рабочей папке.
См. development-conventions.

## /clear-session

Каждый `/clear-session`: handoff → commit (если есть изменения) → **`git push` в
`origin`**. Без пуша сессию не закрываем.
