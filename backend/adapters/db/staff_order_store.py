from contextlib import asynccontextmanager
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import selectinload

from adapters.db.models import OrderRow
from domain.cart.buyer import present_buyer_name
from domain.cart.models import DeliveryAddress, Fulfillment, OrderLineSnapshot
from domain.cart.staff_order import StaffOrder
from usecase.account.errors import StoreUnavailable
from usecase.staff_orders.errors import OrderNotFound


class PostgresStaffOrderStore:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    @asynccontextmanager
    async def _open(self):
        try:
            async with self._session_factory() as session:
                yield session
        except (OperationalError, InterfaceError, DBAPIError) as exc:
            raise StoreUnavailable() from exc

    async def list_all(self) -> list[StaffOrder]:
        async with self._open() as session:
            rows = await session.scalars(select(OrderRow).options(selectinload(OrderRow.lines)))
            return [_to_staff(row) for row in rows]

    async def get(self, order_id: UUID) -> StaffOrder | None:
        async with self._open() as session:
            row = await _load(session, order_id)
            return None if row is None else _to_staff(row)

    async def save_status(self, order_id: UUID, status: str) -> StaffOrder:
        async with self._open() as session:
            row = await _load(session, order_id)
            if row is None:
                raise OrderNotFound()
            row.status = status
            staff = _to_staff(row)
            await session.commit()
            return staff


async def _load(session: AsyncSession, order_id: UUID) -> OrderRow | None:
    stmt = select(OrderRow).where(OrderRow.order_id == order_id).options(selectinload(OrderRow.lines))
    return await session.scalar(stmt)


def _to_staff(row: OrderRow) -> StaffOrder:
    lines = tuple(
        OrderLineSnapshot(
            product_id=line.product_id,
            product_name=line.product_name,
            weight_label=line.weight_label,
            quantity=line.quantity,
            unit_price_rub=line.unit_price_rub,
            line_total_rub=line.line_total_rub,
        )
        for line in sorted(row.lines, key=lambda item: item.id or 0)
    )
    return StaffOrder(
        order_id=row.order_id,
        status=row.status,
        total_rub=row.total_rub,
        created_at=row.created_at,
        buyer_name=present_buyer_name(row.buyer_name),
        buyer_email=row.buyer_email,
        customer_note=row.customer_note,
        fulfillment=Fulfillment(
            mode=row.fulfillment_mode,
            address=DeliveryAddress(city=row.city, street_line=row.street_line),
        ),
        lines=lines,
    )
