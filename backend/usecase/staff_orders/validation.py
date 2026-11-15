from uuid import UUID

from domain.cart.order_status import ORDER_STATUSES
from usecase.staff_orders.errors import InvalidOrderId, InvalidOrderStatus


def parse_order_id(raw: str) -> UUID:
    try:
        return UUID(raw)
    except ValueError:
        raise InvalidOrderId() from None


def parse_status_body(payload: object) -> str:
    if not isinstance(payload, dict) or "status" not in payload:
        raise InvalidOrderStatus()
    status = payload.get("status")
    if not isinstance(status, str) or status not in ORDER_STATUSES:
        raise InvalidOrderStatus()
    return status
