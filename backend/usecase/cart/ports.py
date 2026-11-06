from collections.abc import Callable
from typing import Protocol
from uuid import UUID

from domain.cart.models import Cart, OrderCreated


class CartRepository(Protocol):
    async def ensure(self, session_id: str) -> None: ...

    async def load(self, session_id: str) -> Cart: ...

    async def save(self, cart: Cart) -> None: ...

    async def mutate(self, session_id: str, mutator: Callable[[Cart], None]) -> Cart:
        """Lock the cart row, apply mutator to the loaded cart, and commit."""
        ...

    async def find_order_by_idempotency(self, session_id: str, idempotency_key: UUID) -> OrderCreated | None: ...

    async def save_order(
        self,
        *,
        idempotency_key: UUID,
        session_id: str,
        order_message: str,
        customer_note: str | None,
    ) -> OrderCreated:
        """Lock the cart, build the order from the locked rows, clear lines, commit."""
        ...
