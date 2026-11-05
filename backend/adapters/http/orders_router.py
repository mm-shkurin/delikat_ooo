from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Request
from pydantic import BaseModel, ConfigDict, Field

from adapters.http.shop_session import require_shop_session
from domain.cart.models import OrderCreated
from usecase.cart.errors import InvalidIdempotencyKey
from usecase.cart.service import CartService

router = APIRouter(tags=["orders"])


class OrderCreateBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_note: str | None = Field(default=None, max_length=500)


def _cart(request: Request) -> CartService:
    return request.app.state.ctx.cart


def _serialize_order(order: OrderCreated) -> dict:
    return {
        "order_id": str(order.order_id),
        "status": order.status,
        "total_rub": order.total_rub,
        "message": order.message,
        "fulfillment": {
            "mode": order.fulfillment.mode,
            "address": {
                "city": order.fulfillment.address.city,
                "street_line": order.fulfillment.address.street_line,
            },
        },
        "lines": [
            {
                "product_id": line.product_id,
                "product_name": line.product_name,
                "weight_label": line.weight_label,
                "quantity": line.quantity,
                "unit_price_rub": line.unit_price_rub,
                "line_total_rub": line.line_total_rub,
            }
            for line in order.lines
        ],
    }


@router.post("/orders", status_code=201)
async def create_order(
    request: Request,
    session_id: Annotated[str, Depends(require_shop_session)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    body: OrderCreateBody | None = None,
) -> dict:
    key = _parse_idempotency(idempotency_key)
    note = body.customer_note if body else None
    order = await _cart(request).create_order(session_id, idempotency_key=key, customer_note=note)
    return _serialize_order(order)


def _parse_idempotency(raw: str | None) -> UUID | None:
    if not raw:
        return None
    try:
        return UUID(raw)
    except ValueError:
        raise InvalidIdempotencyKey() from None
