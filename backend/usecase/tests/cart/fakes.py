from copy import deepcopy
from uuid import UUID

from domain.cart.models import Cart, Fulfillment, DeliveryAddress, OrderCreated
from domain.catalog.product import Product
from usecase.cart.errors import IdempotencyConflict


class FakeCartRepository:
    def __init__(self) -> None:
        self._carts: dict[str, Cart] = {}
        self._orders: dict[tuple[str, UUID], OrderCreated] = {}

    async def ensure(self, session_id: str) -> None:
        if session_id not in self._carts:
            self._carts[session_id] = Cart(
                session_id=session_id,
                fulfillment=Fulfillment(mode="delivery", address=DeliveryAddress(city="Омск", street_line=None)),
                lines=[],
            )

    async def load(self, session_id: str) -> Cart:
        await self.ensure(session_id)
        return deepcopy(self._carts[session_id])

    async def save(self, cart: Cart) -> None:
        self._carts[cart.session_id] = deepcopy(cart)

    async def find_order_by_idempotency(self, session_id: str, idempotency_key: UUID) -> OrderCreated | None:
        own = self._orders.get((session_id, idempotency_key))
        if own is not None:
            return own
        for owner, key in self._orders:
            if key == idempotency_key and owner != session_id:
                raise IdempotencyConflict()
        return None

    async def save_order(
        self,
        *,
        idempotency_key: UUID,
        session_id: str,
        order: OrderCreated,
        customer_note: str | None,
    ) -> OrderCreated:
        del customer_note
        self._orders[(session_id, idempotency_key)] = order
        cart = self._carts.get(session_id)
        if cart is not None:
            cart.lines = []
        return order


class FakeCatalogForCart:
    def __init__(self, products: dict[str, Product]) -> None:
        self._products = products

    async def list_categories(self):
        return []

    async def list_products(self):
        return list(self._products.values())

    async def get_product(self, product_id: str) -> Product | None:
        return self._products.get(product_id)
