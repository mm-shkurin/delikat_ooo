# Sprint-check — 2026-11-15 — front

- **Date:** 2026-11-15
- **Branch:** `main`
- **HEAD:** `2d8a712`
- **Scope:** front
- **Stage A:** frontend **2.5 / 3.0** (held on confirmation; 3.0 not reached — FSD widgets↔features + thin RTL)
- **Artifact host:** GitHub `origin` (`https://github.com/mm-shkurin/delikat_ooo.git`) per session instruction (not GitVerse)
- **Test-cases criterion:** skipped per session instruction

## Stage 0 — gate

| Check | Result |
|---|---|
| Deployed links open / app works | **PASS** — `http://127.0.0.1:5173/` 200, `/catalog` 200, `http://127.0.0.1:8000/health` ok |
| Artifact remote | **PASS (GitHub)** — user scoped grading to GitHub; `main` ahead of `origin/main` (push not requested) |
| Release branch | **PASS** — work on `main` |
| Demo ↔ code | **PASS** — stack healthy; Docker `--build` failed (OneDrive invalid file request) — containers **restarted** only |

**Gate: PASS** under GitHub scope. Full Docker image rebuild still needed when OneDrive bake is stable.

## Stage A — auditor scores

| Layer | Final | Notes |
|---|---|---|
| frontend | **2.5 / 3.0** | Confirmation held after HttpOnly cookie auth + style/doc gates |

Log: `frontend/AUDIT_LOG.md` (iterations 11–15).

Major lifts this run:

- Backend sets HttpOnly `delikat_access` / `delikat_refresh`; exchange/refresh JSON has **no** JWT strings
- SPA keeps only `expiresAtMs` in memory; scrub legacy web storage
- `styles/index.css` entry; token CSS; browser helpers; Prettier in `npm run ci`
- Chrome UI under `widgets/`; shared chrome context

Residual vs 3.0: features→widgets coupling, thin RTL, historical git author/bulk/direct-main.

## Stage B — scores (front only; test-cases skipped)

| Criterion | Weight | front | Notes |
|---|---|---|---|
| Git-репозиторий, README, Wiki | 0–1 | **0** | GIT-BULK + GIT-DIRECT-MAIN still FAIL (history) |
| Консистентность / арх. стиль | 0–1 | **1** | regressions ARCH-SCOPED/TOKENS/ENV/SIZE-STYLE cleared; state waived |
| Code smells / security | 0–1 | **0** | SMELL-LONG-FUNC + SMELL-DUPLICATION remain |
| Тест-кейсы | 0–2 | **n/a** | skipped |

Mechanical FAIL remaining: `SMELL-LONG-FUNC`, `SMELL-DUPLICATION`, `GIT-BULK`, `GIT-DIRECT-MAIN` (+ `DOC-TESTCASES` UNKNOWN, skipped).

### Regression watch (front)

Cleared this run vs earlier full report: DOC-ARCH, DOC-ENV-CLEAN, DOC-DECISIONS, ARCH-SCOPED-STYLES, ARCH-DESIGN-TOKENS, ARCH-ENV-ACCESS, ARCH-SIZE-STYLE, SMELL-ENDPOINT-LITERAL, SMELL-MAGIC, SEC-WEB-STORAGE (still PASS; cookies real).

Still open: GIT-BULK, GIT-DIRECT-MAIN, SMELL-LONG-FUNC, SMELL-DUPLICATION.

## Needs a task

1. Push `main` to GitHub when ready (`ahead` of origin).
2. Successful `docker compose up -d --build frontend backend` outside OneDrive bake failure.
3. Invert remaining features↔widgets chrome coupling for Stage A 3.0.
4. Expand RTL beyond `OrderCard` (OAuth callback, auth chrome, checkout).
5. Historical GIT-* clean only via release-branch policy / history rewrite (human decision).

## Docker

`docker compose up -d --build frontend backend` **failed** (OneDrive “invalid file request”). Containers were **restarted**; Vite volume mount should pick up source, but image layers may lag until a clean rebuild.
