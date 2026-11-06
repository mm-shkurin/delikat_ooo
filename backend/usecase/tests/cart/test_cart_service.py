from uuid import uuid4

import pytest

from domain.catalog.product import Product
from usecase.cart.errors import AddressRequired, CartEmpty, IdempotencyConflict, LineNotFound
from usecase.cart.service import CartService
from usecase.tests.cart.fakes import FakeCartRepository, FakeCatalogForCart

_PRODUCT = Product(
    id="rib",
    name="Стейк Рибай",
    category_id="marble",
    default_weight_label="~350 г",
    price_rub=1450,
    compare_at_price_rub=None,
    popularity_score=90,
    properties=("fresh",),
    badge=None,
    marble_grade_label=None,
    image_url="/assets/products/ribeye.jpg",
)


@pytest.fixture
def service() -> CartService:
    catalog = FakeCatalogForCart({"rib": _PRODUCT})
    return CartService(FakeCartRepository(), catalog)


@pytest.mark.asyncio
async def test_add_requires_address_for_delivery(service: CartService):
    session = str(uuid4())
    with pytest.raises(AddressRequired):
        await service.add_item(session, product_id="rib", quantity=1, weight_label=None)


@pytest.mark.asyncio
async def test_checkout_flow(service: CartService):
    session = str(uuid4())
    await service.update_fulfillment(session, mode="delivery", city="Омск", street_line="Ленина 10")
    await service.add_item(session, product_id="rib", quantity=2, weight_label=None)
    cart = await service.get_cart(session)
    assert sum(line.quantity for line in cart.lines) == 2
    key = uuid4()
    order = await service.create_order(session, idempotency_key=key, customer_note=None)
    assert order.total_rub == 2900
    assert len(order.lines) == 1
    empty = await service.get_cart(session)
    assert empty.lines == []
    again = await service.create_order(session, idempotency_key=key, customer_note=None)
    assert again.order_id == order.order_id


@pytest.mark.asyncio
async def test_idempotency_key_does_not_return_another_session(service: CartService):
    key = uuid4()
    first = str(uuid4())
    second = str(uuid4())
    await service.update_fulfillment(first, mode="pickup", city="Омск", street_line=None)
    await service.add_item(first, product_id="rib", quantity=1, weight_label=None)
    order = await service.create_order(first, idempotency_key=key, customer_note=None)
    await service.update_fulfillment(second, mode="pickup", city="Омск", street_line=None)
    await service.add_item(second, product_id="rib", quantity=1, weight_label=None)
    with pytest.raises(IdempotencyConflict):
        await service.create_order(second, idempotency_key=key, customer_note=None)
    assert order.total_rub == 1450


@pytest.mark.asyncio
async def test_checkout_empty(service: CartService):
    session = str(uuid4())
    await service.update_fulfillment(session, mode="pickup", city="Омск", street_line=None)
    with pytest.raises(CartEmpty):
        await service.create_order(session, idempotency_key=uuid4(), customer_note=None)


@pytest.mark.asyncio
async def test_second_add_merges_same_weight(service: CartService):
    session = str(uuid4())
    await service.update_fulfillment(session, mode="pickup", city="Омск", street_line=None)
    await service.add_item(session, product_id="rib", quantity=1, weight_label=None)
    cart = await service.add_item(session, product_id="rib", quantity=2, weight_label=None)
    assert len(cart.lines) == 1
    assert cart.lines[0].quantity == 3


@pytest.mark.asyncio
async def test_patch_unknown_line(service: CartService):
    session = str(uuid4())
    with pytest.raises(LineNotFound):
        await service.patch_line(session, uuid4(), 1)
