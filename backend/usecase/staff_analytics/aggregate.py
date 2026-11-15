from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from domain.cart.staff_order import StaffOrder
from usecase.staff_analytics.keys import buyer_key, product_key
from usecase.staff_analytics.omsk import day_key, day_label
from usecase.staff_analytics.round_money import half_away_round


@dataclass(frozen=True, slots=True)
class MoneySlice:
    label: str
    value_rub: int


@dataclass(frozen=True, slots=True)
class DaySlice:
    day: str
    label: str
    value_rub: int


@dataclass(frozen=True, slots=True)
class QtySlice:
    label: str
    quantity: int


@dataclass(frozen=True, slots=True)
class InflowRow:
    id: str
    at: datetime
    title: str
    subtitle: str
    amount_rub: int
    channel: str


@dataclass(frozen=True, slots=True)
class StatsResult:
    order_count: int
    buyer_count: int
    buyer_slices: tuple[MoneySlice, ...]
    product_slices: tuple[MoneySlice, ...]


@dataclass(frozen=True, slots=True)
class MoneyResult:
    revenue_rub: int
    avg_check_rub: int
    inflow_rub: int
    operation_count: int
    revenue_by_day: tuple[DaySlice, ...]
    top_by_qty: tuple[QtySlice, ...]
    inflows: tuple[InflowRow, ...]


def live_orders(orders: list[StaffOrder]) -> list[StaffOrder]:
    return [order for order in orders if order.status != "cancelled"]


def build_stats(orders: list[StaffOrder]) -> StatsResult:
    live = live_orders(orders)
    buyers: dict[str, int] = defaultdict(int)
    products: dict[str, int] = defaultdict(int)
    for order in live:
        key = buyer_key(order.buyer_name)
        buyers[key] += order.total_rub
        for line in order.lines:
            products[product_key(line.product_name)] += line.line_total_rub
    return StatsResult(
        order_count=len(live),
        buyer_count=len(buyers),
        buyer_slices=_money_slices(buyers),
        product_slices=_money_slices(products),
    )


def build_money(orders: list[StaffOrder]) -> MoneyResult:
    live = live_orders(orders)
    revenue = sum(order.total_rub for order in live)
    avg = 0 if not live else half_away_round(revenue / len(live))
    days: dict[str, int] = defaultdict(int)
    qty: dict[str, int] = defaultdict(int)
    for order in live:
        days[day_key(order.created_at)] += order.total_rub
        for line in order.lines:
            qty[product_key(line.product_name)] += line.quantity
    inflow_rows = [_inflow(order) for order in live]
    inflow_rows.sort(key=lambda row: row.id)
    inflow_rows.sort(key=lambda row: row.at, reverse=True)
    return MoneyResult(
        revenue_rub=revenue,
        avg_check_rub=avg,
        inflow_rub=revenue,
        operation_count=len(live),
        revenue_by_day=tuple(
            DaySlice(day=day, label=day_label(day), value_rub=value)
            for day, value in sorted(days.items())
            if value > 0
        ),
        top_by_qty=_qty_slices(qty),
        inflows=tuple(inflow_rows),
    )


def _money_slices(values: dict[str, int]) -> tuple[MoneySlice, ...]:
    rows = [MoneySlice(label=label, value_rub=value) for label, value in values.items()]
    rows.sort(key=lambda row: (-row.value_rub, row.label.casefold()))
    return tuple(rows)


def _qty_slices(values: dict[str, int]) -> tuple[QtySlice, ...]:
    rows = [QtySlice(label=label, quantity=value) for label, value in values.items()]
    rows.sort(key=lambda row: (-row.quantity, row.label.casefold()))
    return tuple(rows)


def _inflow(order: StaffOrder) -> InflowRow:
    order_id = _uuid_text(order.order_id)
    key = buyer_key(order.buyer_name)
    channel = (
        "Наличные / карта в точке"
        if order.fulfillment.mode == "pickup"
        else "Онлайн-оплата"
    )
    return InflowRow(
        id=f"pay-{order_id}",
        at=order.created_at,
        title="Оплата заказа",
        subtitle=f"{key} · № {order_id[:8]}",
        amount_rub=order.total_rub,
        channel=channel,
    )


def _uuid_text(order_id: UUID) -> str:
    return str(order_id).lower()
