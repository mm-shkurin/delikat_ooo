from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID, uuid4

from domain.cart.buyer import present_buyer_name
from domain.cart.models import Fulfillment, OrderCreated, OrderLineSnapshot
from usecase.cart.errors import IdempotencyConflict
from usecase.tests.cart.fakes import FakeCartRepository


@dataclass
class _Record:
    order_id: UUID
    session_id: str
    idempotency_key: UUID
    message: str
    status: str
    total_rub: int
    created_at: datetime
    raw_buyer_name: str | None
    buyer_email: str | None
    customer_note: str | None
    fulfillment: Fulfillment
    lines: tuple[OrderLineSnapshot, ...]

    def to_staff(self):
        from domain.cart.staff_order import StaffOrder

        return StaffOrder(
            order_id=self.order_id,
            status=self.status,
            total_rub=self.total_rub,
            created_at=self.created_at,
            buyer_name=present_buyer_name(self.raw_buyer_name),
            buyer_email=self.buyer_email,
            customer_note=self.customer_note,
            fulfillment=self.fulfillment,
            lines=self.lines,
        )

    def receipt(self) -> OrderCreated:
        staff = self.to_staff()
        return OrderCreated(
            order_id=staff.order_id,
            status=staff.status,
            total_rub=staff.total_rub,
            message=self.message,
            fulfillment=staff.fulfillment,
            lines=staff.lines,
        )


class OrderBook:
    """Cart repository plus staff order store, sharing one order list."""

    def __init__(self) -> None:
        self._carts = FakeCartRepository()
        self._records: list[_Record] = []
        self.status_writes = 0
        self.now = lambda: datetime.now(UTC)

    async def ensure(self, session_id: str) -> None:
        await self._carts.ensure(session_id)

    async def load(self, session_id: str):
        return await self._carts.load(session_id)

    async def save(self, cart) -> None:
        await self._carts.save(cart)

    async def mutate(self, session_id: str, mutator):
        return await self._carts.mutate(session_id, mutator)

    async def find_order_by_idempotency(self, session_id: str, idempotency_key: UUID) -> OrderCreated | None:
        for record in self._records:
            if record.idempotency_key != idempotency_key:
                continue
            if record.session_id != session_id:
                raise IdempotencyConflict()
            return record.receipt()
        return None

    async def save_order(
        self,
        *,
        idempotency_key: UUID,
        session_id: str,
        order_message: str,
        customer_note: str | None,
        buyer_name: str,
        buyer_email: str | None,
    ) -> OrderCreated:
        order = await self._carts.save_order(
            idempotency_key=idempotency_key,
            session_id=session_id,
            order_message=order_message,
            customer_note=customer_note,
            buyer_name=buyer_name,
            buyer_email=buyer_email,
        )
        self._records.append(
            _Record(
                order_id=order.order_id,
                session_id=session_id,
                idempotency_key=idempotency_key,
                message=order.message,
                status=order.status,
                total_rub=order.total_rub,
                created_at=self.now(),
                raw_buyer_name=buyer_name,
                buyer_email=buyer_email,
                customer_note=customer_note,
                fulfillment=order.fulfillment,
                lines=order.lines,
            )
        )
        return order

    async def list_all(self):
        return [record.to_staff() for record in self._records]

    async def get(self, order_id: UUID):
        found = self._find(order_id)
        return None if found is None else found.to_staff()

    async def save_status(self, order_id: UUID, status: str):
        found = self._find(order_id)
        if found is None:
            from usecase.staff_orders.errors import OrderNotFound

            raise OrderNotFound()
        self.status_writes += 1
        found.status = status
        return found.to_staff()

    def seed(
        self,
        *,
        created_at: datetime,
        status: str = "accepted",
        buyer_name: str | None = "Гость",
        buyer_email: str | None = None,
        customer_note: str | None = None,
        lines: tuple[OrderLineSnapshot, ...] = (),
        order_id: UUID | None = None,
        fulfillment: Fulfillment | None = None,
    ):
        from domain.cart.models import DeliveryAddress, Fulfillment as FulfillmentModel

        chosen = fulfillment or FulfillmentModel(
            mode="pickup",
            address=DeliveryAddress(city="Омск", street_line=None),
        )
        record = _Record(
            order_id=order_id or uuid4(),
            session_id="seed",
            idempotency_key=uuid4(),
            message="Заказ принят. Мы свяжемся для подтверждения доставки.",
            status=status,
            total_rub=sum(line.line_total_rub for line in lines),
            created_at=created_at,
            raw_buyer_name=buyer_name,
            buyer_email=buyer_email,
            customer_note=customer_note,
            fulfillment=chosen,
            lines=lines,
        )
        self._records.append(record)
        return record.to_staff()

    def _find(self, order_id: UUID) -> _Record | None:
        for record in self._records:
            if record.order_id == order_id:
                return record
        return None
