from typing import Protocol
from uuid import UUID

from domain.cart.staff_order import StaffOrder


class StaffOrderStore(Protocol):
    async def list_all(self) -> tuple[list[StaffOrder], bool]:
        """Newest orders first; bool is True when older rows were truncated."""
        ...

    async def get(self, order_id: UUID) -> StaffOrder | None: ...

    async def save_status(self, order_id: UUID, status: str) -> StaffOrder: ...
