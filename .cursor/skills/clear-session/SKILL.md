---
name: clear-session
description: >-
  Сохранить контекст через /handoff, закоммитить и запушить в origin, затем сказать
  пользователю очистить чат и продолжить /continue. Use on /clear-session, /clear
  after documenting progress.
disable-model-invocation: true
---

# /clear-session

Сначала записать, потом запушить, потом очистить. Агент чат сам не закрывает.

## Workflow

1. Выполнить `/handoff` целиком.
2. Snapshot progress (read-only): имя, last `[x]` / `[~]` / next `[ ]`.
3. **Commit + push (обязательно каждый раз):**
   - `git status` / `git diff` / recent log — как в правилах коммита.
   - Закоммитить осмысленные изменения сессии (без секретов: `.env`, credentials).
   - `git push -u origin HEAD` (или `git push` если upstream уже есть).
   - Если нечего коммитить — всё равно `git push`, чтобы remote догнал локальный `main`/ветку.
   - Remote по умолчанию: `origin` → GitHub `mm-shkurin/delikat_ooo` (см. CONTRIBUTING).
4. Закрывающий блок:

```
Saved. Safe to clear.

• Handoff: {files / "nothing to record"}
• Progress: {one-line or "no active progress.md"}
• Git: {commit sha pushed / "push only, working tree clean" / error}
• Clear chat: Agent UI → New Chat
• Resume: /continue
```

5. После блока — не продолжать реализацию.

## Constraints

- Не утверждать, что чат уже очищен
- Не пропускать handoff
- **Не пропускать push** — каждый `/clear-session` заканчивается пушем в `origin`
- Не вызывать `/continue` внутри этого скилла
