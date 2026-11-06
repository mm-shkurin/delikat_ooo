from contextlib import asynccontextmanager
from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, IntegrityError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import selectinload

from adapters.db.models import CartLineRow, OrderLineRow, OrderRow, ShopCartRow
from domain.cart.defaults import DEFAULT_CITY
from domain.cart.models import Cart, DeliveryAddress, Fulfillment, OrderCreated, OrderLineSnapshot
from domain.cart.rules import can_checkout, street_ok
from usecase.account.errors import StoreUnavailable
from usecase.cart.errors import AddressRequired, CannotCheckout, CartEmpty, IdempotencyConflict


class PostgresCartStore:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    @asynccontextmanager
    async def _open(self):
        try:
            async with self._session_factory() as session:
                yield session
        except IntegrityError:
            raise
        except (OperationalError, InterfaceError, DBAPIError) as exc:
            raise StoreUnavailable() from exc

    async def ensure(self, session_id: str) -> None:
        async with self._open() as session:
            row = await session.get(ShopCartRow, session_id)
            if row is None:
                session.add(_default_cart_row(session_id))
                await session.commit()

    async def load(self, session_id: str) -> Cart:
        async with self._open() as session:
            row = await session.scalar(
                select(ShopCartRow).where(ShopCartRow.session_id == session_id).options(selectinload(ShopCartRow.lines))
            )
            if row is None:
                return _default_cart(session_id)
            return row.to_domain()

    async def save(self, cart: Cart) -> None:
        async with self._open() as session:
            row = await session.scalar(
                select(ShopCartRow)
                .where(ShopCartRow.session_id == cart.session_id)
                .options(selectinload(ShopCartRow.lines))
            )
            if row is None:
                row = _default_cart_row(cart.session_id)
                session.add(row)
            row.apply(cart)
            row.lines.clear()
            for line in cart.lines:
                row.lines.append(
                    CartLineRow(
                        line_id=line.line_id,
                        session_id=cart.session_id,
                        product_id=line.product_id,
                        product_name=line.product_name,
                        weight_label=line.weight_label,
                        quantity=line.quantity,
                        unit_price_rub=line.unit_price_rub,
                    )
                )
            await session.commit()

    async def find_order_by_idempotency(self, session_id: str, idempotency_key: UUID) -> OrderCreated | None:
        async with self._open() as session:
            row = await _order_row(session, idempotency_key)
            if row is None:
                return None
            if row.session_id != session_id:
                raise IdempotencyConflict()
            return _order_to_domain(row)

    async def save_order(
        self,
        *,
        idempotency_key: UUID,
        session_id: str,
        order_message: str,
        customer_note: str | None,
    ) -> OrderCreated:
        try:
            async with self._open() as session:
                cart_row = await session.scalar(
                    select(ShopCartRow)
                    .where(ShopCartRow.session_id == session_id)
                    .options(selectinload(ShopCartRow.lines))
                    .with_for_update()
                )
                if cart_row is None or not cart_row.lines:
                    existing = await _order_row(session, idempotency_key)
                    if existing is not None and existing.session_id == session_id:
                        return _order_to_domain(existing)
                    if existing is not None:
                        raise IdempotencyConflict()
                    raise CartEmpty()
                cart = cart_row.to_domain()
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
                row = OrderRow(
                    order_id=order.order_id,
                    idempotency_key=idempotency_key,
                    session_id=session_id,
                    status=order.status,
                    total_rub=order.total_rub,
                    message=order.message,
                    customer_note=customer_note,
                    fulfillment_mode=order.fulfillment.mode,
                    city=order.fulfillment.address.city,
                    street_line=order.fulfillment.address.street_line,
                    created_at=datetime.now(UTC),
                )
                for line in order.lines:
                    row.lines.append(
                        OrderLineRow(
                            order_id=order.order_id,
                            product_id=line.product_id,
                            product_name=line.product_name,
                            weight_label=line.weight_label,
                            quantity=line.quantity,
                            unit_price_rub=line.unit_price_rub,
                            line_total_rub=line.line_total_rub,
                        )
                    )
                session.add(row)
                cart_row.lines.clear()
                await session.commit()
                return order
        except IntegrityError:
            existing = await self.find_order_by_idempotency(session_id, idempotency_key)
            if existing is None:
                raise IdempotencyConflict() from None
            return existing


async def _order_row(session: AsyncSession, idempotency_key: UUID) -> OrderRow | None:
    return await session.scalar(
        select(OrderRow).where(OrderRow.idempotency_key == idempotency_key).options(selectinload(OrderRow.lines))
    )


def _default_cart_row(session_id: str) -> ShopCartRow:
    return ShopCartRow(
        session_id=session_id,
        fulfillment_mode="delivery",
        city=DEFAULT_CITY,
        street_line=None,
    )


def _default_cart(session_id: str) -> Cart:
    return Cart(
        session_id=session_id,
        fulfillment=Fulfillment(mode="delivery", address=DeliveryAddress(city=DEFAULT_CITY, street_line=None)),
        lines=[],
    )


def _order_to_domain(row: OrderRow) -> OrderCreated:
    fulfillment = Fulfillment(
        mode=row.fulfillment_mode,
        address=DeliveryAddress(city=row.city, street_line=row.street_line),
    )
    lines = tuple(
        OrderLineSnapshot(
            product_id=line.product_id,
            product_name=line.product_name,
            weight_label=line.weight_label,
            quantity=line.quantity,
            unit_price_rub=line.unit_price_rub,
            line_total_rub=line.line_total_rub,
        )
        for line in row.lines
    )
    return OrderCreated(
        order_id=row.order_id,
        status=row.status,
        total_rub=row.total_rub,
        message=row.message,
        fulfillment=fulfillment,
        lines=lines,
    )
