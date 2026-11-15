from datetime import UTC, datetime
from uuid import UUID

import pytest

from domain.cart.models import DeliveryAddress, Fulfillment, OrderLineSnapshot
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole
from usecase.staff_analytics.errors import StaffAnalyticsForbidden
from usecase.staff_analytics.service import StaffAnalyticsService
from usecase.tests.staff.fakes import FakeStaffStore
from usecase.tests.staff_orders.fakes import OrderBook
from usecase.tests.staff_orders.helpers import make_account

_T0 = datetime(2026, 11, 14, 4, 0, tzinfo=UTC)  # 10:00 Omsk
_T1 = datetime(2026, 11, 15, 5, 0, tzinfo=UTC)  # next Omsk day


def _line(name: str, total: int = 1000, qty: int = 1) -> OrderLineSnapshot:
    return OrderLineSnapshot(
        product_id=name,
        product_name=name,
        weight_label="~350 г",
        quantity=qty,
        unit_price_rub=total // qty,
        line_total_rub=total,
    )


def _service(role: StaffRole = StaffRole.OWNER):
    book = OrderBook()
    actor = make_account(f"{role.value}@shop.test")
    member = StaffMember.active_for(actor, role)
    analytics = StaffAnalyticsService(FakeStaffStore([member]), book)
    return analytics, book, actor


@pytest.mark.asyncio
async def test_owner_stats_count_only_non_cancelled():
    analytics, book, actor = _service()
    book.seed(created_at=_T0, status="accepted", buyer_name="Ада", lines=(_line("rib", 1000),))
    book.seed(created_at=_T0, status="packing", buyer_name="Ада", lines=(_line("fat", 500),))
    book.seed(created_at=_T0, status="ready", buyer_name="Боб", lines=(_line("rib", 1000),))
    book.seed(created_at=_T0, status="done", buyer_name="Боб", lines=(_line("rib", 200),))
    book.seed(created_at=_T0, status="cancelled", buyer_name="Кира", lines=(_line("rib", 9000),))
    stats = await analytics.stats(actor)
    assert stats.order_count == 4
    assert stats.buyer_count == 2
    assert all(row.label != "Кира" for row in stats.buyer_slices)
    assert sum(row.value_rub for row in stats.product_slices) == 2700


@pytest.mark.asyncio
async def test_owner_money_ignores_cancelled_and_matches_inflows():
    analytics, book, actor = _service()
    book.seed(created_at=_T0, status="accepted", buyer_name="Ада", lines=(_line("rib", 1000),))
    book.seed(created_at=_T0, status="cancelled", buyer_name="Кира", lines=(_line("rib", 9000),))
    money = await analytics.money(actor)
    assert money.revenue_rub == 1000
    assert money.avg_check_rub == 1000
    assert money.inflow_rub == 1000
    assert money.operation_count == 1
    assert len(money.inflows) == 1
    assert money.inflows[0].amount_rub == 1000


@pytest.mark.asyncio
async def test_buyer_and_product_slice_keys_and_sort():
    analytics, book, actor = _service()
    book.seed(created_at=_T0, buyer_name="  ", lines=(_line("rib", 300),))
    book.seed(created_at=_T0, buyer_name="Ада", lines=(_line("  ", 100), _line("rib", 200)))
    book.seed(created_at=_T0, buyer_name="Ада", lines=(_line("fat", 50),))
    stats = await analytics.stats(actor)
    assert {row.label for row in stats.buyer_slices} == {"Гость", "Ада"}
    guest = next(row for row in stats.buyer_slices if row.label == "Гость")
    ada = next(row for row in stats.buyer_slices if row.label == "Ада")
    assert guest.value_rub == 300
    assert ada.value_rub == 350
    assert [row.label for row in stats.buyer_slices] == ["Ада", "Гость"]
    assert [row.label for row in stats.product_slices] == ["rib", "Без названия", "fat"]
    assert [row.value_rub for row in stats.product_slices] == [500, 100, 50]


@pytest.mark.asyncio
async def test_money_days_omsk_sparse_and_pickup_channel():
    analytics, book, actor = _service()
    pickup = Fulfillment(mode="pickup", address=DeliveryAddress(city="Омск", street_line=None))
    delivery = Fulfillment(mode="delivery", address=DeliveryAddress(city="Омск", street_line="ул. 1"))
    first = book.seed(
        created_at=_T0,
        order_id=UUID("00000000-0000-4000-8000-00000000000a"),
        fulfillment=pickup,
        lines=(_line("rib", 1000),),
    )
    book.seed(
        created_at=_T1,
        order_id=UUID("00000000-0000-4000-8000-00000000000b"),
        fulfillment=delivery,
        lines=(_line("fat", 500),),
    )
    money = await analytics.money(actor)
    assert [row.day for row in money.revenue_by_day] == ["2026-11-14", "2026-11-15"]
    assert money.revenue_by_day[0].label.startswith("14 ")
    assert money.inflows[0].channel == "Онлайн-оплата"
    assert money.inflows[1].channel == "Наличные / карта в точке"
    assert money.inflows[1].id == f"pay-{str(first.order_id).lower()}"
    assert money.inflows[1].subtitle.endswith(str(first.order_id).lower()[:8])


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [StaffRole.MANAGER, StaffRole.CASHIER])
async def test_manager_and_cashier_forbidden(role: StaffRole):
    analytics, book, actor = _service(role)
    book.seed(created_at=_T0, lines=(_line("rib", 1000),))
    with pytest.raises(StaffAnalyticsForbidden):
        await analytics.stats(actor)
    with pytest.raises(StaffAnalyticsForbidden):
        await analytics.money(actor)


@pytest.mark.asyncio
async def test_non_staff_forbidden():
    book = OrderBook()
    actor = make_account("buyer@shop.test")
    analytics = StaffAnalyticsService(FakeStaffStore([]), book)
    with pytest.raises(StaffAnalyticsForbidden):
        await analytics.stats(actor)
