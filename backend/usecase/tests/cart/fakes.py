from collections.abc import Callable
from copy import deepcopy
from uuid import UUID

from domain.cart.defaults import DEFAULT_CITY
from domain.cart.models import Cart, DeliveryAddress, Fulfillment, OrderCreated
from domain.catalog.product import Product
from usecase.cart.errors import IdempotencyConflict
from usecase.catalog.queries import ProductListQuery, ProductListResult
from usecase.tests.catalog.fakes import apply_product_list


class FakeCartRepository:
    def __init__(self) -> None:
        self._carts: dict[str, Cart] = {}
        self._orders: dict[tuple[str, UUID], OrderCreated] = {}

    async def ensure(self, session_id: str) -> None:
        if session_id not in self._carts:
            self._carts[session_id] = Cart(
                session_id=session_id,
                fulfillment=Fulfillment(mode="delivery", address=DeliveryAddress(city=DEFAULT_CITY, street_line=None)),
                lines=[],
            )

    async def load(self, session_id: str) -> Cart:
        await self.ensure(session_id)
        return deepcopy(self._carts[session_id])

    async def save(self, cart: Cart) -> None:
        self._carts[cart.session_id] = deepcopy(cart)

    async def mutate(self, session_id: str, mutator: Callable[[Cart], None]) -> Cart:
        if session_id in self._carts:
            cart = deepcopy(self._carts[session_id])
        else:
            cart = Cart(
                session_id=session_id,
                fulfillment=Fulfillment(mode="delivery", address=DeliveryAddress(city=DEFAULT_CITY, street_line=None)),
                lines=[],
            )
        mutator(cart)
        stored = deepcopy(cart)
        self._carts[session_id] = stored
        return deepcopy(stored)

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
        order_message: str,
        customer_note: str | None,
    ) -> OrderCreated:
        from uuid import uuid4

        from domain.cart.models import OrderCreated, OrderLineSnapshot
        from domain.cart.rules import can_checkout, street_ok
        from usecase.cart.errors import AddressRequired, CannotCheckout, CartEmpty

        del customer_note
        cart = self._carts.get(session_id)
        if cart is None or not cart.lines:
            raise CartEmpty()
        if not street_ok(cart.fulfillment):
            raise AddressRequired()
        if not can_checkout(cart):
            raise CannotCheckout()
        order = OrderCreated(
            order_id=uuid4(),
            status="accepted",
            total_rub=sum(line.line_total_rub for line in cart.lines),
            message=order_message,
            fulfillment=cart.fulfillment,
            lines=tuple(
                OrderLineSnapshot(
                    product_id=line.product_id,
                    product_name=line.product_name,
                    weight_label=line.weight_label,
                    quantity=line.quantity,
                    unit_price_rub=line.unit_price_rub,
                    line_total_rub=line.line_total_rub,
                )
                for line in cart.lines
            ),
        )
        self._orders[(session_id, idempotency_key)] = order
        cart.lines = []
        return order


class FakeCatalogForCart:
    def __init__(self, products: dict[str, Product]) -> None:
        self._products = products

    async def list_categories(self):
        return []

    async def list_products(self, query: ProductListQuery) -> ProductListResult:
        return apply_product_list(list(self._products.values()), query)

    async def get_product(self, product_id: str) -> Product | None:
        return self._products.get(product_id)
