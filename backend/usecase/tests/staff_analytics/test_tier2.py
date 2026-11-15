from datetime import UTC, datetime

import pytest

from domain.cart.models import OrderLineSnapshot
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole
from usecase.staff_analytics.round_money import half_away_round
from usecase.staff_analytics.service import StaffAnalyticsService
from usecase.tests.staff.fakes import FakeStaffStore
from usecase.tests.staff_orders.fakes import OrderBook
from usecase.tests.staff_orders.helpers import make_account

_T0 = datetime(2026, 11, 14, 4, 0, tzinfo=UTC)


def _line(name: str, total: int, qty: int = 1) -> OrderLineSnapshot:
    return OrderLineSnapshot(
        product_id=name or "x",
        product_name=name,
        weight_label="~350 г",
        quantity=qty,
        unit_price_rub=total // qty if qty else 0,
        line_total_rub=total,
    )


def _owner():
    book = OrderBook()
    actor = make_account("owner@shop.test")
    member = StaffMember.active_for(actor, StaffRole.OWNER)
    return StaffAnalyticsService(FakeStaffStore([member]), book), book, actor


@pytest.mark.asyncio
async def test_empty_shop_returns_zeros():
    analytics, _book, actor = _owner()
    stats = await analytics.stats(actor)
    money = await analytics.money(actor)
    assert stats.order_count == 0
    assert stats.buyer_count == 0
    assert stats.buyer_slices == ()
    assert stats.product_slices == ()
    assert money.revenue_rub == 0
    assert money.avg_check_rub == 0
    assert money.inflow_rub == 0
    assert money.operation_count == 0
    assert money.revenue_by_day == ()
    assert money.top_by_qty == ()
    assert money.inflows == ()


@pytest.mark.asyncio
async def test_top_by_qty_same_product_key():
    analytics, book, actor = _owner()
    book.seed(created_at=_T0, lines=(_line("rib", 1000, qty=2), _line("  ", 100, qty=3)))
    book.seed(created_at=_T0, lines=(_line("rib", 500, qty=1),))
    money = await analytics.money(actor)
    assert [(row.label, row.quantity) for row in money.top_by_qty] == [
        ("rib", 3),
        ("Без названия", 3),
    ]


def test_half_away_from_zero():
    assert half_away_round(1.5) == 2
    assert half_away_round(2.5) == 3


@pytest.mark.asyncio
async def test_average_check_half_away():
    analytics, book, actor = _owner()
    book.seed(created_at=_T0, lines=(_line("rib", 1000),))
    book.seed(created_at=_T0, lines=(_line("rib", 1001),))
    money = await analytics.money(actor)
    assert money.revenue_rub == 2001
    assert money.avg_check_rub == 1001
