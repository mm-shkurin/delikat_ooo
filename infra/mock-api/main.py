"""Dev mock Store API from OpenAPI examples (Docker :8000 default).

Hex backend (07/09) lives in `backend/` — run locally with uvicorn or swap compose service when ready.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Annotated

from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

SESSION_COOKIE = "delikat_session"
SESSION_MAX_AGE = 60 * 60 * 24 * 30

FIXTURES = Path(os.environ.get("FIXTURES_DIR", "/fixtures"))

app = FastAPI(title="Delikat mock Store API", version="0.1.0")

origins = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:8080,http://localhost:8080",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load(name: str) -> dict:
    path = FIXTURES / name
    if not path.is_file():
        raise RuntimeError(f"fixture missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _all_products() -> list[dict]:
    page = _load("catalog-products-page.json")
    return list(page.get("items", []))


def _filter_products(
    items: list[dict],
    *,
    category_id: str | None,
    max_price_rub: int | None,
    properties: list[str],
    sort: str,
) -> list[dict]:
    filtered = items
    if category_id:
        filtered = [p for p in filtered if p.get("category_id") == category_id]
    if max_price_rub is not None:
        filtered = [p for p in filtered if int(p.get("price_rub", 0)) <= max_price_rub]
    if properties:
        filtered = [
            p
            for p in filtered
            if any(prop in p.get("properties", []) for prop in properties)
        ]

    if sort == "price_asc":
        filtered = sorted(filtered, key=lambda p: int(p.get("price_rub", 0)))
    elif sort == "sale_first":
        filtered = sorted(
            filtered,
            key=lambda p: (
                0 if p.get("compare_at_price_rub") else 1,
                int(p.get("price_rub", 0)),
            ),
        )
    else:
        filtered = sorted(filtered, key=lambda p: int(p.get("popularity_score", 0)), reverse=True)
    return filtered


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/catalog/categories")
def list_categories() -> dict:
    return _load("catalog-categories.json")


@app.get("/api/v1/catalog/products")
def list_products(
    category_id: str | None = None,
    max_price_rub: int | None = None,
    property: Annotated[list[str] | None, Query()] = None,
    sort: str = "pop",
    limit: int = 16,
    offset: int = 0,
) -> dict:
    props = property or []
    filtered = _filter_products(
        _all_products(),
        category_id=category_id,
        max_price_rub=max_price_rub,
        properties=props,
        sort=sort if sort in {"pop", "price_asc", "sale_first"} else "pop",
    )
    sliced = filtered[offset : offset + limit] if limit > 0 else filtered[offset:]
    return {
        "items": sliced,
        "total_count": len(filtered),
        "limit": limit,
        "offset": offset,
    }


@app.get("/api/v1/catalog/products/{product_id}")
def get_product(product_id: str) -> dict:
    for item in _all_products():
        if item.get("id") == product_id:
            default = item.get("default_weight_label", "~350 г")
            options = list(dict.fromkeys([default, "~250 г", "~350 г", "~500 г", "1 кг"]))
            return {
                **item,
                "weight_options": options,
                "description": "Мраморная говядина. Режем под заказ.",
            }
    raise HTTPException(status_code=404, detail="product_not_found")


def _set_guest_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_id,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=SESSION_MAX_AGE,
    )


def _api_error(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": code, "message": message})


@app.post("/api/v1/sessions", status_code=201)
def create_session() -> Response:
    session_id = str(uuid4())
    _sessions[session_id] = _new_cart_state()
    response = Response(
        content=json.dumps({"session_id": session_id}),
        media_type="application/json",
        status_code=201,
    )
    _set_guest_cookie(response, session_id)
    return response


@app.post("/api/v1/sessions/reset", status_code=204)
def reset_guest_session(request: Request) -> Response:
    old = request.cookies.get(SESSION_COOKIE)
    if old:
        _sessions.pop(old, None)
    session_id = str(uuid4())
    _sessions[session_id] = _new_cart_state()
    response = Response(status_code=204)
    response.delete_cookie(key=SESSION_COOKIE, path="/")
    _set_guest_cookie(response, session_id)
    return response


# --- Cart & orders (Wave 2 dev mock) ---

_sessions: dict[str, dict] = {}


def _new_cart_state() -> dict:
    return {
        "fulfillment": {"mode": "delivery", "address": {"city": "Омск", "street_line": None}},
        "items": [],
        "orders_by_key": {},
    }


def _product(product_id: str) -> dict:
    for item in _all_products():
        if item.get("id") == product_id:
            return item
    raise HTTPException(status_code=404, detail="product_not_found")


def _street_ok(state: dict) -> bool:
    if state["fulfillment"]["mode"] == "pickup":
        return True
    street = state["fulfillment"]["address"].get("street_line")
    return bool(street and str(street).strip())


def _serialize_cart(state: dict) -> dict:
    items = state["items"]
    items_count = sum(int(line["quantity"]) for line in items)
    total_rub = sum(int(line["line_total_rub"]) for line in items)
    can_checkout = items_count > 0 and _street_ok(state)
    return {
        "fulfillment": state["fulfillment"],
        "items": items,
        "items_count": items_count,
        "total_rub": total_rub,
        "can_checkout": can_checkout,
    }


def _session_state(request: Request, response: Response) -> tuple[str, dict]:
    session_id = request.cookies.get(SESSION_COOKIE)
    if session_id and session_id in _sessions:
        return session_id, _sessions[session_id]
    session_id = str(uuid4())
    _sessions[session_id] = _new_cart_state()
    _set_guest_cookie(response, session_id)
    return session_id, _sessions[session_id]


class DeliveryAddressIn(BaseModel):
    city: str = "Омск"
    street_line: str | None = None


class CartFulfillmentUpdateIn(BaseModel):
    mode: str
    address: DeliveryAddressIn | None = None


class AddCartItemIn(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=99)
    weight_label: str | None = None


class PatchCartItemIn(BaseModel):
    quantity: int = Field(ge=1, le=99)


class OrderCreateIn(BaseModel):
    customer_note: str | None = Field(default=None, max_length=500)


@app.get("/api/v1/cart")
def get_cart(request: Request, response: Response) -> dict:
    _, state = _session_state(request, response)
    return _serialize_cart(state)


@app.put("/api/v1/cart/fulfillment")
def update_fulfillment(request: Request, response: Response, body: CartFulfillmentUpdateIn) -> dict:
    if body.mode not in {"delivery", "pickup"}:
        return _api_error(400, "validation_error", "Invalid mode")
    _, state = _session_state(request, response)
    address = body.address.model_dump() if body.address else {"city": "Омск", "street_line": None}
    if body.mode == "pickup":
        address = {"city": address.get("city") or "Омск", "street_line": None}
    state["fulfillment"] = {"mode": body.mode, "address": address}
    return _serialize_cart(state)


@app.post("/api/v1/cart/items")
def add_cart_item(request: Request, response: Response, body: AddCartItemIn):
    try:
        product = _product(body.product_id)
    except HTTPException:
        return _api_error(404, "product_not_found", "Товар не найден")
    weight = body.weight_label or product.get("default_weight_label") or "~350 г"
    _, state = _session_state(request, response)
    if state["fulfillment"]["mode"] == "delivery" and not _street_ok(state):
        return _api_error(
            409,
            "address_required",
            "Укажите адрес доставки перед добавлением в корзину",
        )
    unit_price = int(product.get("price_rub", 0))
    for line in state["items"]:
        if line["product_id"] == body.product_id and line["weight_label"] == weight:
            line["quantity"] = min(99, int(line["quantity"]) + body.quantity)
            line["line_total_rub"] = line["quantity"] * unit_price
            return _serialize_cart(state)
    state["items"].append(
        {
            "line_id": str(uuid4()),
            "product_id": body.product_id,
            "product_name": product.get("name", body.product_id),
            "weight_label": weight,
            "quantity": body.quantity,
            "unit_price_rub": unit_price,
            "line_total_rub": unit_price * body.quantity,
        }
    )
    return _serialize_cart(state)


@app.patch("/api/v1/cart/items/{line_id}")
def patch_cart_item(request: Request, response: Response, line_id: str, body: PatchCartItemIn):
    _, state = _session_state(request, response)
    for line in state["items"]:
        if line["line_id"] == line_id:
            line["quantity"] = body.quantity
            line["line_total_rub"] = body.quantity * int(line["unit_price_rub"])
            return _serialize_cart(state)
    return _api_error(404, "line_not_found", "Строка не найдена")


@app.delete("/api/v1/cart/items/{line_id}")
def delete_cart_item(request: Request, response: Response, line_id: str):
    _, state = _session_state(request, response)
    before = len(state["items"])
    state["items"] = [line for line in state["items"] if line["line_id"] != line_id]
    if len(state["items"]) == before:
        return _api_error(404, "line_not_found", "Строка не найдена")
    return _serialize_cart(state)


@app.post("/api/v1/orders", status_code=201)
def create_order(
    request: Request,
    response: Response,
    body: OrderCreateIn | None = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    if not idempotency_key:
        return _api_error(400, "invalid_request", "Idempotency-Key required")
    _, state = _session_state(request, response)
    if idempotency_key in state["orders_by_key"]:
        return JSONResponse(status_code=201, content=state["orders_by_key"][idempotency_key])
    cart = _serialize_cart(state)
    if cart["items_count"] == 0:
        return _api_error(409, "cart_empty", "Корзина пуста")
    if not _street_ok(state):
        return _api_error(409, "address_required", "Укажите адрес доставки")
    if not cart["can_checkout"]:
        return _api_error(409, "cannot_checkout", "Нельзя оформить заказ")
    order = {
        "order_id": str(uuid4()),
        "status": "accepted",
        "total_rub": cart["total_rub"],
        "message": "Заказ принят. Мы свяжемся для подтверждения доставки.",
        "fulfillment": cart["fulfillment"],
        "lines": [
            {
                "product_id": line["product_id"],
                "product_name": line["product_name"],
                "weight_label": line["weight_label"],
                "quantity": line["quantity"],
                "unit_price_rub": line["unit_price_rub"],
                "line_total_rub": line["line_total_rub"],
            }
            for line in cart["items"]
        ],
    }
    state["orders_by_key"][idempotency_key] = order
    state["items"] = []
    return order
