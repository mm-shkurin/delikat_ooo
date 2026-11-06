from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from adapters.db.models import OrderLineRow, OrderRow
from domain.cart.models import Cart, DeliveryAddress, Fulfillment, OrderCreated, OrderLineSnapshot
from usecase.cart.errors import CartEmpty, IdempotencyConflict


async def load_order_row(session: AsyncSession, idempotency_key: UUID) -> OrderRow | None:
    return await session.scalar(
        select(OrderRow).where(OrderRow.idempotency_key == idempotency_key).options(selectinload(OrderRow.lines))
    )


def order_to_domain(row: OrderRow) -> OrderCreated:
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


def accepted_order(cart: Cart, order_message: str) -> OrderCreated:
    return OrderCreated(
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


def order_row_for(
    order: OrderCreated,
    *,
    idempotency_key: UUID,
    session_id: str,
    customer_note: str | None,
) -> OrderRow:
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
    return row


async def replay_or_reject_empty(session: AsyncSession, session_id: str, idempotency_key: UUID) -> OrderCreated:
    existing = await load_order_row(session, idempotency_key)
    if existing is not None and existing.session_id == session_id:
        return order_to_domain(existing)
    if existing is not None:
        raise IdempotencyConflict()
    raise CartEmpty()
