from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from domain.cart.models import Fulfillment, OrderLineSnapshot
from domain.cart.order_status import next_statuses


@dataclass(frozen=True, slots=True)
class StaffOrder:
    order_id: UUID
    status: str
    total_rub: int
    created_at: datetime
    buyer_name: str
    buyer_email: str | None
    customer_note: str | None
    fulfillment: Fulfillment
    lines: tuple[OrderLineSnapshot, ...]

    @property
    def allowed_next(self) -> tuple[str, ...]:
        return next_statuses(self.status)
