import json
from typing import Annotated

from fastapi import APIRouter, Depends, Request

from adapters.http.deps import bearer_token
from adapters.http.staff_order_payload import staff_order_payload
from usecase.staff_orders.errors import InvalidOrderStatus
from usecase.staff_orders.validation import parse_order_id, parse_status_body

router = APIRouter(tags=["staff-orders"])


def _orders(request: Request):
    return request.app.state.ctx.staff_orders


@router.get("/staff/orders")
async def list_staff_orders(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> dict:
    account = await request.app.state.ctx.session.caller(access_token)
    rows, truncated = await _orders(request).list_orders(account)
    return {
        "items": [staff_order_payload(row) for row in rows],
        "truncated": truncated,
    }


@router.patch("/staff/orders/{order_id}")
async def patch_staff_order_status(
    order_id: str,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> dict:
    parsed = parse_order_id(order_id)
    status = await _read_status(request)
    account = await request.app.state.ctx.session.caller(access_token)
    updated = await _orders(request).set_status(account, parsed, status)
    return staff_order_payload(updated)


async def _read_status(request: Request) -> str:
    raw = await request.body()
    if not raw or not raw.strip():
        raise InvalidOrderStatus()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        raise InvalidOrderStatus() from None
    return parse_status_body(payload)
