from uuid import UUID, uuid4

from domain.cart.defaults import DEFAULT_CITY
from domain.cart.models import Cart, CartLine, DeliveryAddress, Fulfillment, OrderCreated
from domain.cart.rules import can_checkout, street_ok
from usecase.cart.errors import (
    AddressRequired,
    CannotCheckout,
    CartEmpty,
    InvalidFulfillment,
    InvalidQuantity,
    LineNotFound,
    MissingIdempotencyKey,
)
from usecase.cart.ports import CartRepository
from usecase.catalog.errors import ProductNotFound
from usecase.catalog.ports import CatalogRepository

_ORDER_MESSAGE = "Заказ принят. Мы свяжемся для подтверждения доставки."


class CartService:
    def __init__(self, carts: CartRepository, catalog: CatalogRepository) -> None:
        self._carts = carts
        self._catalog = catalog

    async def ensure_session(self, session_id: str) -> None:
        await self._carts.ensure(session_id)

    async def get_cart(self, session_id: str) -> Cart:
        await self._carts.ensure(session_id)
        return await self._carts.load(session_id)

    async def update_fulfillment(
        self,
        session_id: str,
        *,
        mode: str,
        city: str | None,
        street_line: str | None,
    ) -> Cart:
        if mode not in {"delivery", "pickup"}:
            raise InvalidFulfillment(mode)
        await self._carts.ensure(session_id)
        cart = await self._carts.load(session_id)
        address_city = (city or DEFAULT_CITY).strip() or DEFAULT_CITY
        street = street_line.strip() if street_line and street_line.strip() else None
        if mode == "pickup":
            street = None
        cart.fulfillment = Fulfillment(mode=mode, address=DeliveryAddress(city=address_city, street_line=street))
        await self._carts.save(cart)
        return cart

    async def add_item(
        self,
        session_id: str,
        *,
        product_id: str,
        quantity: int,
        weight_label: str | None,
    ) -> Cart:
        if quantity < 1 or quantity > 99:
            raise InvalidQuantity()
        product = await self._catalog.get_product(product_id)
        if product is None:
            raise ProductNotFound(product_id)
        await self._carts.ensure(session_id)
        cart = await self._carts.load(session_id)
        if cart.fulfillment.mode == "delivery" and not street_ok(cart.fulfillment):
            raise AddressRequired()
        weight = weight_label or product.default_weight_label
        unit_price = product.price_rub
        for line in cart.lines:
            if line.product_id == product_id and line.weight_label == weight:
                if line.quantity + quantity > 99:
                    raise InvalidQuantity()
                line.quantity += quantity
                await self._carts.save(cart)
                return cart
        cart.lines.append(
            CartLine(
                line_id=uuid4(),
                product_id=product.id,
                product_name=product.name,
                weight_label=weight,
                quantity=quantity,
                unit_price_rub=unit_price,
            )
        )
        await self._carts.save(cart)
        return cart

    async def patch_line(self, session_id: str, line_id: UUID, quantity: int) -> Cart:
        if quantity < 1 or quantity > 99:
            raise InvalidQuantity()
        cart = await self._carts.load(session_id)
        for line in cart.lines:
            if line.line_id == line_id:
                line.quantity = quantity
                await self._carts.save(cart)
                return cart
        raise LineNotFound(str(line_id))

    async def delete_line(self, session_id: str, line_id: UUID) -> Cart:
        cart = await self._carts.load(session_id)
        before = len(cart.lines)
        cart.lines = [line for line in cart.lines if line.line_id != line_id]
        if len(cart.lines) == before:
            raise LineNotFound(str(line_id))
        await self._carts.save(cart)
        return cart

    async def create_order(
        self,
        session_id: str,
        *,
        idempotency_key: UUID | None,
        customer_note: str | None,
    ) -> OrderCreated:
        if idempotency_key is None:
            raise MissingIdempotencyKey()
        existing = await self._carts.find_order_by_idempotency(session_id, idempotency_key)
        if existing is not None:
            return existing
        cart = await self._carts.load(session_id)
        if not cart.lines:
            raise CartEmpty()
        if not street_ok(cart.fulfillment):
            raise AddressRequired()
        if not can_checkout(cart):
            raise CannotCheckout()
        return await self._carts.save_order(
            idempotency_key=idempotency_key,
            session_id=session_id,
            order_message=_ORDER_MESSAGE,
            customer_note=customer_note,
        )


def serialize_cart(cart: Cart) -> dict:
    items_count = sum(line.quantity for line in cart.lines)
    total_rub = sum(line.line_total_rub for line in cart.lines)
    return {
        "fulfillment": {
            "mode": cart.fulfillment.mode,
            "address": {
                "city": cart.fulfillment.address.city,
                "street_line": cart.fulfillment.address.street_line,
            },
        },
        "items": [
            {
                "line_id": str(line.line_id),
                "product_id": line.product_id,
                "product_name": line.product_name,
                "weight_label": line.weight_label,
                "quantity": line.quantity,
                "unit_price_rub": line.unit_price_rub,
                "line_total_rub": line.line_total_rub,
            }
            for line in cart.lines
        ],
        "items_count": items_count,
        "total_rub": total_rub,
        "can_checkout": can_checkout(cart),
    }
