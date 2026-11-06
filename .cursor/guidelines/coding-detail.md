# Coding Detail — Деликат

Companion to `coding-rules.md`. Read before writing or refactoring backend layers.

## Domain

- Rich domain: business rules in domain OOP, not in adapters/controllers.
- Value objects validate in constructor; throw domain errors.
- Enums for fixed sets; serialize at adapter boundary.
- No nullable fields in domain entities when avoidable — optional types / empty collections / dedicated enum.
- Factory methods (`create` / `of` / `from`); mutate via methods, not public field writes.
- Aggregates: one root; external refs by id.

## Usecase

- Orchestrator only — no FastAPI/SQLAlchemy.
- Never inject another usecase; share via domain or a non-usecase helper.
- Prefer one storage port returning a rich aggregate over sequential multi-port fetch mid-flow.
- Separate pure computation from side effects when both exist.

## Adapters / HTTP

- Thin HTTP: parse → DTO → usecase → response factory.
- Persistence models ≠ domain; map `to_domain` / `from_domain` inside adapter.
- No business rules in routers.
- Session cookie helpers live in `adapters/http`, not `application` (sprint-check boundary).

## Style

- Names reveal intent; delete narrating comments; keep only rationale the code cannot express (≤2 lines).
- Prefer immutable data; defensive copies of collections leaving the aggregate.
- Move derived behavior onto the object that owns the fields.
- Avoid long accessor chains — add a method on the owner.
- Duplication of 3+ similar blocks → extract once after green (refactor commit).

## Smells to refuse in delivery

- Fat file (>200 lines) without split plan
- Fat function (>30 lines) of mixed concerns
- Domain/usecase importing framework types
- Endpoint path literals scattered outside paths registry / OpenAPI-aligned module
- Silent catch / bare `except` swallowing errors
- God module (`models.py` holding unrelated aggregates) — prefer one aggregate per module
