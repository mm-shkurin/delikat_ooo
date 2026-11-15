from datetime import UTC, datetime
from uuid import uuid4

import pytest

from domain.cart.models import DeliveryAddress, Fulfillment, OrderLineSnapshot
from usecase.account.errors import Unauthorized
from usecase.staff_orders.errors import InvalidOrderId, InvalidOrderStatus, OrderNotFound
from usecase.staff_orders.validation import parse_order_id, parse_status_body
from usecase.tests.staff_orders.test_tier1 import _T0, _fill, _line, _services
from usecase.tests.staff_orders.helpers import MapBuyers

_EARLIER = datetime(2026, 11, 1, tzinfo=UTC)


@pytest.mark.asyncio
async def test_setting_the_current_status_again_succeeds():
    _cart, staff, book, actor = _services()
    seeded = book.seed(created_at=_T0, status="packing")
    updated = await staff.set_status(actor, seeded.order_id, "packing")
    assert updated.status == "packing"
    assert book.status_writes == 0


@pytest.mark.asyncio
async def test_missing_or_unknown_status_is_rejected():
    _cart, staff, book, actor = _services()
    seeded = book.seed(created_at=_T0, status="accepted")
    for payload in ({}, [], "packing", {"note": "x"}, {"status": "shipped"}, {"status": None}):
        with pytest.raises(InvalidOrderStatus) as caught:
            parse_status_body(payload)
        assert caught.value.message == "Некорректный статус."
    assert parse_status_body({"status": "packing", "note": "лишнее"}) == "packing"
    updated = await staff.set_status(actor, seeded.order_id, "packing")
    assert updated.status == "packing"
    assert (await book.get(seeded.order_id)).buyer_name == seeded.buyer_name


@pytest.mark.asyncio
async def test_unknown_order_and_bad_id_are_refused():
    _cart, staff, _book, actor = _services()
    with pytest.raises(OrderNotFound) as missing:
        await staff.set_status(actor, uuid4(), "packing")
    assert missing.value.message == "Заказ не найден."
    with pytest.raises(InvalidOrderId) as bad:
        parse_order_id("not-a-uuid")
    assert bad.value.message == "Некорректный номер заказа."


@pytest.mark.asyncio
async def test_bad_token_does_not_create_or_rewrite_an_order():
    buyers = MapBuyers({"live": ("Ада", "ada@shop.test")})
    cart, staff, book, actor = _services(buyers=buyers)
    session = str(uuid4())
    await _fill(cart, session)
    with pytest.raises(Unauthorized):
        await cart.create_order(session, idempotency_key=uuid4(), customer_note=None, access_token="dead")
    assert await staff.list_orders(actor) == []
    key = uuid4()
    await cart.create_order(session, idempotency_key=key, customer_note=None, access_token="live")
    card = (await staff.list_orders(actor))[0]
    await staff.set_status(actor, card.order_id, "packing")
    with pytest.raises(Unauthorized):
        await cart.create_order(session, idempotency_key=key, customer_note=None, access_token="dead")
    stored = await book.get(card.order_id)
    assert stored.status == "packing"
    assert stored.buyer_name == "Ада"
    assert stored.buyer_email == "ada@shop.test"


@pytest.mark.asyncio
async def test_legacy_order_reads_as_guest_and_lines_keep_creation_order():
    _cart, staff, book, actor = _services()
    first = _line("rib")
    second = OrderLineSnapshot(
        product_id="fat",
        product_name="Фарш",
        weight_label="500 г",
        quantity=2,
        unit_price_rub=400,
        line_total_rub=800,
    )
    book.seed(created_at=_EARLIER, buyer_name=None, buyer_email=None)
    book.seed(
        created_at=_T0,
        buyer_name="Ада",
        buyer_email="ada@shop.test",
        lines=(first, second),
        fulfillment=Fulfillment(mode="delivery", address=DeliveryAddress(city="Омск", street_line="Ленина 10")),
    )
    rows = await staff.list_orders(actor)
    assert rows[1].buyer_name == "Гость"
    assert rows[1].buyer_email is None
    assert [line.product_id for line in rows[0].lines] == ["rib", "fat"]


def test_terminal_statuses_have_no_next_step():
    from domain.cart.order_status import next_statuses

    assert next_statuses("done") == ()
    assert next_statuses("cancelled") == ()
    assert next_statuses("ready") == ("done", "cancelled")
