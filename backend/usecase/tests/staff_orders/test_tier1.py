from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from domain.cart.models import OrderCreated, OrderLineSnapshot
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole
from usecase.account.errors import Unauthorized
from usecase.cart.errors import IdempotencyConflict
from usecase.cart.service import CartService
from usecase.staff_orders.errors import InvalidStatusTransition, StaffOrdersForbidden
from usecase.staff_orders.service import StaffOrdersService
from usecase.tests.cart.fakes import FakeCatalogForCart
from usecase.tests.staff.fakes import FakeStaffStore
from usecase.tests.staff_orders.fakes import OrderBook
from usecase.tests.staff_orders.helpers import MapBuyers, make_account, staff_field_names

_T0 = datetime(2026, 11, 14, 10, 0, tzinfo=UTC)
_LATER = datetime(2026, 11, 14, 12, 0, tzinfo=UTC)


def _line(name: str) -> OrderLineSnapshot:
    return OrderLineSnapshot(
        product_id=name,
        product_name=name,
        weight_label="~350 г",
        quantity=1,
        unit_price_rub=1000,
        line_total_rub=1000,
    )


def _catalog() -> FakeCatalogForCart:
    from datetime import datetime as dt

    from domain.catalog.product import Product

    def product(product_id: str) -> Product:
        return Product(
            id=product_id,
            name=product_id,
            category_id="beef",
            default_weight_label="~350 г",
            price_rub=1000,
            compare_at_price_rub=None,
            popularity_score=1,
            properties=(),
            badge=None,
            marble_grade_label=None,
            image_url="/x",
            created_at=dt(2026, 1, 1, tzinfo=UTC),
        )

    return FakeCatalogForCart({"rib": product("rib"), "fat": product("fat")})


def _services(role: StaffRole = StaffRole.OWNER, buyers: MapBuyers | None = None):
    book = OrderBook()
    actor = make_account(f"{role.value}@shop.test")
    member = StaffMember.active_for(actor, role)
    cart = CartService(book, _catalog(), buyers)
    staff = StaffOrdersService(FakeStaffStore([member]), book)
    return cart, staff, book, actor


async def _fill(cart: CartService, session: str, product_id: str = "rib") -> None:
    await cart.update_fulfillment(session, mode="pickup", city="Омск", street_line=None)
    await cart.add_item(session, product_id=product_id, quantity=1, weight_label=None)


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CASHIER])
async def test_staff_lists_every_order_newest_first_without_phone(role: StaffRole):
    _cart, staff, book, actor = _services(role)
    older_id = UUID("00000000-0000-4000-8000-000000000002")
    newer_tie = UUID("00000000-0000-4000-8000-00000000000b")
    newer_first = UUID("00000000-0000-4000-8000-00000000000a")
    book.seed(created_at=_T0, order_id=older_id, customer_note="позвонить", lines=(_line("rib"),))
    book.seed(created_at=_LATER, order_id=newer_tie, buyer_email=None, lines=(_line("fat"),))
    book.seed(created_at=_LATER, order_id=newer_first, buyer_name="Ада", buyer_email="ada@shop.test")
    rows = await staff.list_orders(actor)
    assert [row.order_id for row in rows] == [newer_first, newer_tie, older_id]
    assert rows[0].buyer_name == "Ада"
    assert rows[0].buyer_email == "ada@shop.test"
    assert rows[1].buyer_email is None
    assert rows[2].customer_note == "позвонить"
    assert rows[0].allowed_next == ("packing", "cancelled")
    assert "phone" not in staff_field_names()
    assert "buyer_name" not in OrderCreated.__dataclass_fields__


@pytest.mark.asyncio
async def test_cashier_advances_accepted_order_to_packing():
    _cart, staff, book, actor = _services(StaffRole.CASHIER)
    seeded = book.seed(created_at=_T0, lines=(_line("rib"),))
    updated = await staff.set_status(actor, seeded.order_id, "packing")
    assert updated.status == "packing"
    assert updated.order_id == seeded.order_id
    assert updated.allowed_next == ("ready", "cancelled")
    assert updated.lines == seeded.lines


@pytest.mark.asyncio
async def test_done_order_rejects_another_status():
    _cart, staff, book, actor = _services(StaffRole.MANAGER)
    seeded = book.seed(created_at=_T0, status="done")
    for target in ("cancelled", "ready"):
        with pytest.raises(InvalidStatusTransition) as caught:
            await staff.set_status(actor, seeded.order_id, target)
        assert caught.value.message == "Этот статус отсюда не поставить."
    assert (await book.get(seeded.order_id)).status == "done"


@pytest.mark.asyncio
async def test_checkout_stores_buyer_once_and_hides_it_from_receipt():
    buyers = MapBuyers({"live": ("  Ада  ", "ada@shop.test"), "blank": ("   ", "blank@shop.test")})
    cart, staff, _book, actor = _services(buyers=buyers)
    guest = str(uuid4())
    await _fill(cart, guest)
    receipt = await cart.create_order(guest, idempotency_key=uuid4(), customer_note=None)
    assert receipt.status == "accepted"
    assert "buyer_name" not in OrderCreated.__dataclass_fields__
    guest_card = (await staff.list_orders(actor))[0]
    assert guest_card.buyer_name == "Гость"
    assert guest_card.buyer_email is None

    named = str(uuid4())
    await _fill(cart, named, "fat")
    await cart.create_order(named, idempotency_key=uuid4(), customer_note=None, access_token="live")
    blank = str(uuid4())
    await _fill(cart, blank)
    await cart.create_order(blank, idempotency_key=uuid4(), customer_note=None, access_token="blank")
    cards = {row.buyer_email: row for row in await staff.list_orders(actor)}
    assert cards["ada@shop.test"].buyer_name == "Ада"
    assert cards["blank@shop.test"].buyer_name == "Гость"
    assert cards[None].buyer_name == "Гость"


@pytest.mark.asyncio
async def test_repeat_checkout_key_returns_staff_status_and_original_message():
    buyers = MapBuyers({"live": ("Ада", "ada@shop.test")})
    cart, staff, book, actor = _services(buyers=buyers)
    session = str(uuid4())
    await _fill(cart, session)
    key = uuid4()
    first = await cart.create_order(session, idempotency_key=key, customer_note="у двери")
    card = (await staff.list_orders(actor))[0]
    await staff.set_status(actor, card.order_id, "cancelled")
    again = await cart.create_order(session, idempotency_key=key, customer_note="другое", access_token="live")
    assert again.status == "cancelled"
    assert again.message == first.message
    assert again.order_id == first.order_id
    stored = await book.get(card.order_id)
    assert stored.buyer_name == "Гость"
    assert stored.buyer_email is None
    assert stored.customer_note == "у двери"
    other = str(uuid4())
    await _fill(cart, other, "fat")
    with pytest.raises(IdempotencyConflict):
        await cart.create_order(other, idempotency_key=key, customer_note=None)
    assert (await book.get(card.order_id)).status == "cancelled"


@pytest.mark.asyncio
async def test_buyer_cannot_change_staff_orders():
    _cart, staff, book, _actor = _services()
    seeded = book.seed(created_at=_T0, status="accepted")
    buyer = make_account("buyer@shop.test")
    with pytest.raises(StaffOrdersForbidden):
        await staff.list_orders(buyer)
    with pytest.raises(StaffOrdersForbidden):
        await staff.set_status(buyer, seeded.order_id, "packing")
    assert (await book.get(seeded.order_id)).status == "accepted"


def test_missing_bearer_is_unauthorized():
    from adapters.http.deps import bearer_token

    with pytest.raises(Unauthorized):
        bearer_token(None)
