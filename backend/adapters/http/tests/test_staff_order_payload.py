from datetime import UTC, datetime
from uuid import uuid4

from adapters.http.staff_order_payload import staff_order_payload
from domain.cart.models import DeliveryAddress, Fulfillment, OrderLineSnapshot
from domain.cart.staff_order import StaffOrder


def test_staff_order_payload_has_card_fields_and_no_phone():
    order = StaffOrder(
        order_id=uuid4(),
        status="accepted",
        total_rub=1000,
        created_at=datetime(2026, 11, 14, 10, 0, tzinfo=UTC),
        buyer_name="Гость",
        buyer_email=None,
        customer_note=None,
        fulfillment=Fulfillment(mode="pickup", address=DeliveryAddress(city="Омск", street_line=None)),
        lines=(
            OrderLineSnapshot(
                product_id="rib",
                product_name="Рибай",
                weight_label="~350 г",
                quantity=1,
                unit_price_rub=1000,
                line_total_rub=1000,
            ),
        ),
    )
    payload = staff_order_payload(order)
    assert set(payload) == {
        "order_id",
        "status",
        "allowed_next",
        "total_rub",
        "created_at",
        "buyer_name",
        "buyer_email",
        "customer_note",
        "fulfillment",
        "lines",
    }
    assert payload["allowed_next"] == ["packing", "cancelled"]
    assert payload["buyer_email"] is None
    assert "phone" not in payload
