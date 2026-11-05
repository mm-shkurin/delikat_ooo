from dataclasses import dataclass, field
from uuid import UUID


@dataclass
class DeliveryAddress:
    city: str
    street_line: str | None


@dataclass
class Fulfillment:
    mode: str
    address: DeliveryAddress


@dataclass
class CartLine:
    line_id: UUID
    product_id: str
    product_name: str
    weight_label: str
    quantity: int
    unit_price_rub: int

    @property
    def line_total_rub(self) -> int:
        return self.quantity * self.unit_price_rub


@dataclass
class Cart:
    session_id: str
    fulfillment: Fulfillment
    lines: list[CartLine] = field(default_factory=list)


@dataclass(frozen=True, slots=True)
class OrderLineSnapshot:
    product_id: str
    product_name: str
    weight_label: str
    quantity: int
    unit_price_rub: int
    line_total_rub: int


@dataclass(frozen=True, slots=True)
class OrderCreated:
    order_id: UUID
    status: str
    total_rub: int
    message: str
    fulfillment: Fulfillment
    lines: tuple[OrderLineSnapshot, ...]
