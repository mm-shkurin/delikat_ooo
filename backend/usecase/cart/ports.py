from typing import Protocol
from uuid import UUID

from domain.cart.models import Cart, OrderCreated, OrderLineSnapshot


class CartRepository(Protocol):
    async def ensure(self, session_id: str) -> None:
        ...

    async def load(self, session_id: str) -> Cart:
        ...

    async def save(self, cart: Cart) -> None:
        ...

    async def find_order_by_idempotency(self, session_id: str, idempotency_key: UUID) -> OrderCreated | None:
        ...

    async def save_order(
        self,
        *,
        idempotency_key: UUID,
        session_id: str,
        order: OrderCreated,
        customer_note: str | None,
    ) -> None:
        ...
