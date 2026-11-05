---
name: clear-session
description: >-
  Сохранить контекст через /handoff, затем сказать пользователю очистить чат и
  продолжить /continue. Use on /clear-session, /clear after documenting progress.
disable-model-invocation: true
---

# /clear-session

Сначала записать, потом очистить. Агент чат сам не закрывает.

## Workflow

1. Выполнить `/handoff` целиком.
2. Snapshot progress (read-only): имя, last `[x]` / `[~]` / next `[ ]`.
3. Закрывающий блок:

```
Saved. Safe to clear.

• Handoff: {files / "nothing to record"}
• Progress: {one-line or "no active progress.md"}
• Clear chat: Agent UI → New Chat
• Resume: /continue
```

4. После блока — не продолжать реализацию.

## Constraints

- Не утверждать, что чат уже очищен
- Не пропускать handoff
- Не вызывать `/continue` внутри этого скилла
