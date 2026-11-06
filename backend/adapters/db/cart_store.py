from contextlib import asynccontextmanager
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, IntegrityError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import selectinload

from adapters.db.models import CartLineRow, ShopCartRow
from adapters.db.order_persist import (
    accepted_order,
    load_order_row,
    order_row_for,
    order_to_domain,
    replay_or_reject_empty,
)
from domain.cart.defaults import DEFAULT_CITY
from domain.cart.models import Cart, DeliveryAddress, Fulfillment, OrderCreated
from domain.cart.rules import can_checkout, street_ok
from usecase.account.errors import StoreUnavailable
from usecase.cart.errors import AddressRequired, CannotCheckout, IdempotencyConflict


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
            row = await _load_cart_row(session, session_id)
            if row is None:
                return _default_cart(session_id)
            return row.to_domain()

    async def save(self, cart: Cart) -> None:
        async with self._open() as session:
            row = await _load_cart_row(session, cart.session_id)
            if row is None:
                row = _default_cart_row(cart.session_id)
                session.add(row)
            _write_cart(row, cart)
            await session.commit()

    async def find_order_by_idempotency(self, session_id: str, idempotency_key: UUID) -> OrderCreated | None:
        async with self._open() as session:
            row = await load_order_row(session, idempotency_key)
            if row is None:
                return None
            if row.session_id != session_id:
                raise IdempotencyConflict()
            return order_to_domain(row)

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
                cart_row = await _load_cart_row(session, session_id, lock=True)
                if cart_row is None or not cart_row.lines:
                    return await replay_or_reject_empty(session, session_id, idempotency_key)
                cart = cart_row.to_domain()
                if not street_ok(cart.fulfillment):
                    raise AddressRequired()
                if not can_checkout(cart):
                    raise CannotCheckout()
                order = accepted_order(cart, order_message)
                session.add(
                    order_row_for(
                        order,
                        idempotency_key=idempotency_key,
                        session_id=session_id,
                        customer_note=customer_note,
                    )
                )
                cart_row.lines.clear()
                await session.commit()
                return order
        except IntegrityError:
            existing = await self.find_order_by_idempotency(session_id, idempotency_key)
            if existing is None:
                raise IdempotencyConflict() from None
            return existing


async def _load_cart_row(session: AsyncSession, session_id: str, *, lock: bool = False) -> ShopCartRow | None:
    stmt = select(ShopCartRow).where(ShopCartRow.session_id == session_id).options(selectinload(ShopCartRow.lines))
    if lock:
        stmt = stmt.with_for_update()
    return await session.scalar(stmt)


def _write_cart(row: ShopCartRow, cart: Cart) -> None:
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
